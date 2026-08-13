"use server";

import { createHash, randomBytes } from "node:crypto";
import { requireVerifiedUser } from "@/lib/data/email-verification-gate";
import { getAppUrl, isDemoMode } from "@/lib/env";
import {
  buildTermsAckStatement,
  CUSTOMER_TYPE_STATEMENT_VERSION,
  CUSTOMER_TYPE_STATEMENTS,
  EARLY_PERFORMANCE_STATEMENT,
  EARLY_PERFORMANCE_STATEMENT_VERSION,
  TERMS_ACK_STATEMENT_VERSION,
  WORKING_TERMS_VERSION_LABEL,
} from "@/lib/legal/checkout-statements";
import { evaluateLegalLaunchGate } from "@/lib/legal/launch-gate";
import {
  computePublicActivationAt,
  getServiceEndsAtIso,
} from "@/lib/legal/service-duration";
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

function hashIp(value: string | null) {
  if (!value) return null;
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export async function createCheckoutSessionAction(input: unknown): Promise<CreateCheckoutResult> {
  if (isDemoMode()) {
    return { ok: false, message: "Platba nie je dostupná v demo režime." };
  }
  const legalGate = evaluateLegalLaunchGate({ requireDocumentsApproved: true });
  if (!legalGate.ok || !isStripeConfigured()) {
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

  const {
    siteId,
    planCode,
    customerType,
    earlyPerformanceRequested: earlyRaw,
    billing,
  } = parsed.data;
  const earlyPerformanceRequested = customerType === "b2c" && earlyRaw === true;
  const activationDeferred = customerType === "b2c" && !earlyPerformanceRequested;

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

  const buyerSnapshot = toBuyerSnapshot(billing, customerType);
  const sellerSnapshot = getSellerSnapshot();
  const totalCents = getPlanTotalCents(planCode);
  const admin = createAdminClient();
  const serviceEndsAt = getServiceEndsAtIso();
  const publicActivationAt = activationDeferred
    ? computePublicActivationAt({
      paidAt: new Date(),
      customerType,
      earlyPerformanceRequested,
    }).toISOString()
    : null;

  const { data: planVersion } = await admin
    .from("plan_versions" as never)
    .select("id")
    .eq("plan_code", planCode)
    .is("effective_to", null)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();

  const planVersionId =
    planVersion && typeof planVersion === "object" && "id" in planVersion
      ? String((planVersion as { id: string }).id)
      : null;

  const customerTypeStatement = CUSTOMER_TYPE_STATEMENTS[customerType];
  const termsStatement = buildTermsAckStatement(WORKING_TERMS_VERSION_LABEL);

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      site_id: siteId,
      user_id: authData.user.id,
      status: "pending",
      currency: "EUR",
      total_cents: totalCents,
      plan_code: planCode,
      valid_until: serviceEndsAt,
      buyer_snapshot: buyerSnapshot,
      seller_snapshot: sellerSnapshot,
      plan_version_id: planVersionId,
      customer_type: customerType,
      customer_type_statement: customerTypeStatement,
      customer_type_statement_version: CUSTOMER_TYPE_STATEMENT_VERSION,
      early_performance_requested: earlyPerformanceRequested,
      early_performance_statement_version: earlyPerformanceRequested
        ? EARLY_PERFORMANCE_STATEMENT_VERSION
        : null,
      early_performance_statement_text: earlyPerformanceRequested
        ? EARLY_PERFORMANCE_STATEMENT
        : null,
      service_ends_at: serviceEndsAt,
      public_activation_at: publicActivationAt,
      activation_deferred: activationDeferred,
    } as never)
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[checkout] order insert failed", orderError);
    }
    return { ok: false, message: "Objednávku sa nepodarilo vytvoriť." };
  }

  const acceptances = [
    {
      order_id: order.id,
      acceptance_kind: "customer_type_declaration",
      statement_text: customerTypeStatement,
      statement_version: CUSTOMER_TYPE_STATEMENT_VERSION,
      accepted: true,
      actor_user_id: authData.user.id,
      ip_hash: hashIp(null),
      user_agent: null,
    },
    {
      order_id: order.id,
      acceptance_kind: "terms_ack",
      statement_text: termsStatement,
      statement_version: TERMS_ACK_STATEMENT_VERSION,
      accepted: true,
      actor_user_id: authData.user.id,
      ip_hash: hashIp(null),
      user_agent: null,
    },
  ];

  if (earlyPerformanceRequested) {
    acceptances.push({
      order_id: order.id,
      acceptance_kind: "early_performance",
      statement_text: EARLY_PERFORMANCE_STATEMENT,
      statement_version: EARLY_PERFORMANCE_STATEMENT_VERSION,
      accepted: true,
      actor_user_id: authData.user.id,
      ip_hash: hashIp(null),
      user_agent: null,
    });
  }

  await admin.from("order_legal_acceptances" as never).insert(acceptances as never);

  await admin.from("legal_audit_events" as never).insert({
    actor_user_id: authData.user.id,
    actor_service: "checkout",
    action: "order.created",
    entity_type: "order",
    entity_id: order.id,
    result: "ok",
    metadata: {
      plan_code: planCode,
      customer_type: customerType,
      early_performance_requested: earlyPerformanceRequested,
      activation_deferred: activationDeferred,
    },
  } as never);

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
