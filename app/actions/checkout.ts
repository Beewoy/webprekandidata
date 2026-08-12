"use server";

import { randomBytes } from "node:crypto";
import { requireVerifiedUser } from "@/lib/data/email-verification-gate";
import { getAppUrl, isDemoMode } from "@/lib/env";
import { getPlanTotalCents } from "@/lib/payments/plans";
import {
  getSellerSnapshot,
  getStripeClient,
  getStripePriceId,
  isStripeConfigured,
} from "@/lib/payments/stripe";
import {
  buildCheckoutSessionParams,
  buildStripeCustomerParams,
} from "@/lib/payments/stripe-invoice";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSchema, toBuyerSnapshot } from "@/lib/validation/checkout";

export type CreateCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

function createIntegrationIdentifier() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const suffix = Array.from(randomBytes(8), (byte) => alphabet[byte % alphabet.length]).join("");
  return `webprekandidata_${suffix}`;
}

export async function createCheckoutSessionAction(input: unknown): Promise<CreateCheckoutResult> {
  if (isDemoMode()) {
    return { ok: false, message: "Platba nie je dostupná v demo režime." };
  }
  if (!isStripeConfigured()) {
    return { ok: false, message: "Platobná brána ešte nie je nakonfigurovaná." };
  }

  const parsed = createCheckoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return { ok: false, message: "Skontrolujte fakturačné údaje.", fieldErrors };
  }

  const { siteId, planCode, billing } = parsed.data;
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { ok: false, message: "Pred platbou sa musíte prihlásiť." };
  }

  const verification = await requireVerifiedUser(authData.user.id);
  if (!verification.ok) {
    return { ok: false, message: verification.message };
  }

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("id, owner_user_id, plan_code, deleted_at")
    .eq("id", siteId)
    .maybeSingle();

  if (siteError || !site || site.deleted_at || site.owner_user_id !== authData.user.id) {
    return { ok: false, message: "Projekt sa nepodarilo overiť." };
  }
  if (site.plan_code) {
    return { ok: false, message: "Tento web už má aktívny balík." };
  }

  const buyerSnapshot = toBuyerSnapshot(billing);
  const sellerSnapshot = getSellerSnapshot();
  const totalCents = getPlanTotalCents(planCode);
  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      site_id: siteId,
      user_id: authData.user.id,
      status: "pending",
      currency: "EUR",
      total_cents: totalCents,
      plan_code: planCode,
      valid_until: null,
      buyer_snapshot: buyerSnapshot,
      seller_snapshot: sellerSnapshot,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { ok: false, message: "Objednávku sa nepodarilo vytvoriť." };
  }

  const appUrl = getAppUrl().replace(/\/$/, "");
  const successUrl = `${appUrl}/app/web/${siteId}/publikovanie?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${appUrl}/app/web/${siteId}/publikovanie?checkout=cancelled`;

  try {
    const stripe = getStripeClient();
    const customer = await stripe.customers.create(
      buildStripeCustomerParams(buyerSnapshot, order.id),
    );
    const metadata = {
      order_id: order.id,
      order_number: order.order_number,
      site_id: siteId,
      plan_code: planCode,
      user_id: authData.user.id,
    };
    const session = await stripe.checkout.sessions.create(buildCheckoutSessionParams({
      buyer: buyerSnapshot,
      cancelUrl,
      customerId: customer.id,
      integrationIdentifier: createIntegrationIdentifier(),
      metadata,
      priceId: getStripePriceId(planCode),
      seller: sellerSnapshot,
      successUrl,
    }));

    if (!session.url) {
      await admin.from("orders").update({ status: "failed" }).eq("id", order.id);
      return { ok: false, message: "Stripe nevrátil odkaz na platbu." };
    }

    const { error: attachError } = await admin
      .from("orders")
      .update({
        stripe_checkout_session_id: session.id,
        stripe_customer_id: customer.id,
      })
      .eq("id", order.id)
      .eq("status", "pending");

    if (attachError) {
      return { ok: false, message: "Platobnú reláciu sa nepodarilo uložiť. Skúste to znova." };
    }

    return { ok: true, url: session.url };
  } catch {
    await admin.from("orders").update({ status: "failed" }).eq("id", order.id);
    return { ok: false, message: "Platobnú reláciu sa nepodarilo vytvoriť. Skúste to znova." };
  }
}
