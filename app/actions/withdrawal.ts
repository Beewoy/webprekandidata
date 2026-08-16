"use server";

import { z } from "zod";
import { isBrevoSmtpConfigured, sendWithdrawalConfirmationEmail } from "@/lib/email/brevo";
import { getAppUrl, isDemoMode } from "@/lib/env";
import {
  createWithdrawalTokenValue,
  getRefundDeadlineAt,
  hashWithdrawalToken,
  isWithinWithdrawalWindow,
  WITHDRAWAL_STATEMENT,
  WITHDRAWAL_STATEMENT_VERSION,
} from "@/lib/legal/withdrawal";
import { isAdminGrantedOrder } from "@/lib/payments/admin-grant";
import { getStripeClient, isStripeConfigured } from "@/lib/payments/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type WithdrawalActionResult =
  | { ok: true; message: string; withdrawalId?: string }
  | { ok: false; message: string };

const ADMIN_GRANT_WITHDRAWAL_MESSAGE =
  "Táto objednávka bola priradená administrátorom, odstúpenie nie je možné.";

const requestLinkSchema = z.object({
  orderNumber: z.string().trim().min(3).max(40),
  email: z.string().trim().email().max(254),
});

const confirmSchema = z.object({
  token: z.string().trim().min(20).max(200),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  confirm: z.literal(true),
});

async function loadEligibleOrder(orderNumber: string, email: string) {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(
      "id, order_number, site_id, user_id, status, plan_code, total_cents, paid_at, customer_type, buyer_snapshot, stripe_checkout_session_id, stripe_customer_id",
    )
    .eq("order_number", orderNumber)
    .eq("status", "paid")
    .maybeSingle();

  if (!order?.paid_at) return { error: "Objednávku sa nepodarilo nájsť." as const };

  if (isAdminGrantedOrder(order.buyer_snapshot)) {
    return { error: ADMIN_GRANT_WITHDRAWAL_MESSAGE };
  }

  const buyerEmail =
    order.buyer_snapshot && typeof order.buyer_snapshot === "object"
      && "email" in order.buyer_snapshot
      && typeof (order.buyer_snapshot as { email?: unknown }).email === "string"
      ? (order.buyer_snapshot as { email: string }).email.trim().toLowerCase()
      : null;

  if (!buyerEmail || buyerEmail !== email.trim().toLowerCase()) {
    return { error: "Objednávku sa nepodarilo overiť podľa e-mailu." as const };
  }

  if (order.customer_type === "b2b") {
    return { error: "Online odstúpenie je dostupné pre spotrebiteľské objednávky." as const };
  }

  if (!isWithinWithdrawalWindow(order.paid_at)) {
    return { error: "Lehota na odstúpenie už uplynula." as const };
  }

  const { data: existing } = await admin
    .from("withdrawal_requests" as never)
    .select("id, status")
    .eq("order_id", order.id)
    .in("status", ["submitted", "confirmed", "refund_pending", "refunded"])
    .maybeSingle();

  if (existing) {
    return { error: "Pre túto objednávku už existuje žiadosť o odstúpenie." as const };
  }

  return { order };
}

export async function requestWithdrawalLinkAction(input: unknown): Promise<WithdrawalActionResult> {
  if (isDemoMode()) return { ok: false, message: "V demo režime odstúpenie nie je dostupné." };

  const parsed = requestLinkSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Skontrolujte číslo objednávky a e-mail." };

  const loaded = await loadEligibleOrder(parsed.data.orderNumber, parsed.data.email);
  if ("error" in loaded) {
    // Generic message avoids order enumeration.
    return {
      ok: true,
      message: "Ak objednávka existuje a je v lehote, poslali sme odkaz na e-mail z objednávky.",
    };
  }

  if (!isBrevoSmtpConfigured()) {
    return { ok: false, message: "E-mailová služba nie je dostupná. Napíšte na podporu." };
  }

  const admin = createAdminClient();
  const token = createWithdrawalTokenValue();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await admin.from("withdrawal_tokens" as never).insert({
    order_id: loaded.order.id,
    token_hash: hashWithdrawalToken(token),
    email: parsed.data.email.trim().toLowerCase(),
    expires_at: expiresAt,
  } as never);

  const appUrl = getAppUrl().replace(/\/$/, "");
  const link = `${appUrl}/odstupenie/${token}`;

  const { sendWithdrawalMagicLinkEmail } = await import("@/lib/email/brevo");
  await sendWithdrawalMagicLinkEmail({
    recipientEmail: parsed.data.email,
    orderNumber: loaded.order.order_number,
    link,
  });

  await admin.from("legal_audit_events" as never).insert({
    actor_service: "withdrawal",
    action: "withdrawal.link_sent",
    entity_type: "order",
    entity_id: loaded.order.id,
    result: "ok",
    metadata: { channel: "email_link" },
  } as never);

  return {
    ok: true,
    message: "Ak objednávka existuje a je v lehote, poslali sme odkaz na e-mail z objednávky.",
  };
}

export async function confirmWithdrawalAction(input: unknown): Promise<WithdrawalActionResult> {
  if (isDemoMode()) return { ok: false, message: "V demo režime odstúpenie nie je dostupné." };

  const parsed = confirmSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Skontrolujte údaje a potvrďte odstúpenie." };
  }

  const admin = createAdminClient();
  const tokenHash = hashWithdrawalToken(parsed.data.token);
  const { data: tokenRow } = await admin
    .from("withdrawal_tokens" as never)
    .select("id, order_id, email, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (
    !tokenRow
    || typeof tokenRow !== "object"
    || !("order_id" in tokenRow)
    || (tokenRow as { used_at?: string | null }).used_at
    || new Date(String((tokenRow as { expires_at: string }).expires_at)).getTime() < Date.now()
  ) {
    return { ok: false, message: "Odkaz na odstúpenie je neplatný alebo expirovaný." };
  }

  const orderId = String((tokenRow as { order_id: string }).order_id);
  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, site_id, user_id, status, plan_code, total_cents, paid_at, customer_type, buyer_snapshot, stripe_checkout_session_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order?.paid_at || order.status !== "paid") {
    return { ok: false, message: "Objednávka nie je vhodná na odstúpenie." };
  }
  if (isAdminGrantedOrder(order.buyer_snapshot)) {
    return { ok: false, message: ADMIN_GRANT_WITHDRAWAL_MESSAGE };
  }
  if (!isWithinWithdrawalWindow(order.paid_at)) {
    return { ok: false, message: "Lehota na odstúpenie už uplynula." };
  }

  const now = new Date();
  const refundDeadline = getRefundDeadlineAt(now);

  const { data: withdrawal, error: insertError } = await admin
    .from("withdrawal_requests" as never)
    .insert({
      order_id: order.id,
      site_id: order.site_id,
      user_id: order.user_id,
      full_name: parsed.data.fullName,
      email: parsed.data.email.trim().toLowerCase(),
      channel: "online",
      status: "confirmed",
      statement_text: `${WITHDRAWAL_STATEMENT} (verzia ${WITHDRAWAL_STATEMENT_VERSION})`,
      submitted_at: now.toISOString(),
      confirmed_at: now.toISOString(),
      refund_deadline_at: refundDeadline.toISOString(),
      refund_amount_cents: order.total_cents,
      refund_currency: "EUR",
    } as never)
    .select("id")
    .single();

  if (insertError || !withdrawal) {
    return { ok: false, message: "Žiadosť sa nepodarilo uložiť. Skúste to znova alebo napíšte e-mailom." };
  }

  const withdrawalId = String((withdrawal as { id: string }).id);

  await admin
    .from("withdrawal_tokens" as never)
    .update({ used_at: now.toISOString() } as never)
    .eq("id", (tokenRow as { id: string }).id);

  // Stop future fulfillment: remove plan entitlement, keep content for export window.
  await admin
    .from("sites")
    .update({ plan_code: null, status: "suspended", updated_at: now.toISOString() })
    .eq("id", order.site_id);

  let refundId: string | null = null;
  if (isStripeConfigured() && order.stripe_checkout_session_id) {
    try {
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id);
      const paymentIntentId = typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
      if (paymentIntentId) {
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: order.total_cents,
          reason: "requested_by_customer",
          metadata: {
            order_id: order.id,
            withdrawal_id: withdrawalId,
          },
        });
        refundId = refund.id;
      }
    } catch {
      // Keep withdrawal confirmed; ops can complete refund manually before deadline.
    }
  }

  await admin
    .from("withdrawal_requests" as never)
    .update({
      status: refundId ? "refunded" : "refund_pending",
      stripe_refund_id: refundId,
      refunded_at: refundId ? now.toISOString() : null,
      updated_at: now.toISOString(),
    } as never)
    .eq("id", withdrawalId);

  if (refundId) {
    await admin
      .from("orders")
      .update({ status: "refunded" })
      .eq("id", order.id);
  }

  if (isBrevoSmtpConfigured()) {
    try {
      await sendWithdrawalConfirmationEmail({
        recipientEmail: parsed.data.email,
        recipientName: parsed.data.fullName,
        orderNumber: order.order_number,
        confirmedAtIso: now.toISOString(),
        withdrawalId,
        refundAmountLabel: `${(order.total_cents / 100).toFixed(2).replace(".", ",")} €`,
      });
      await admin
        .from("withdrawal_requests" as never)
        .update({ confirmation_email_sent_at: now.toISOString() } as never)
        .eq("id", withdrawalId);
    } catch {
      // Non-fatal for confirmation persistence.
    }
  }

  await admin.from("legal_audit_events" as never).insert({
    actor_user_id: order.user_id,
    actor_service: "withdrawal",
    action: "withdrawal.confirmed",
    entity_type: "withdrawal_request",
    entity_id: withdrawalId,
    result: "ok",
    metadata: {
      order_id: order.id,
      refund_id: refundId,
      refund_deadline_at: refundDeadline.toISOString(),
    },
  } as never);

  return {
    ok: true,
    withdrawalId,
    message: refundId
      ? "Odstúpenie je potvrdené a vrátenie platby bolo spustené."
      : "Odstúpenie je potvrdené. Vrátenie platby dokončíme do 14 dní.",
  };
}

export async function startAuthenticatedWithdrawalAction(
  input: unknown,
): Promise<WithdrawalActionResult> {
  if (isDemoMode()) return { ok: false, message: "V demo režime odstúpenie nie je dostupné." };

  const parsed = z.object({ orderId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, message: "Neplatná objednávka." };

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { ok: false, message: "Pred odstúpením sa prihláste." };

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, buyer_snapshot, user_id, status, paid_at, customer_type")
    .eq("id", parsed.data.orderId)
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (!order?.paid_at || order.status !== "paid") {
    return { ok: false, message: "Objednávka nie je vhodná na odstúpenie." };
  }

  if (isAdminGrantedOrder(order.buyer_snapshot)) {
    return { ok: false, message: ADMIN_GRANT_WITHDRAWAL_MESSAGE };
  }

  const email =
    order.buyer_snapshot && typeof order.buyer_snapshot === "object"
      && "email" in order.buyer_snapshot
      && typeof (order.buyer_snapshot as { email?: unknown }).email === "string"
      ? (order.buyer_snapshot as { email: string }).email
      : authData.user.email;

  if (!email) return { ok: false, message: "Chýba e-mail objednávky." };

  return requestWithdrawalLinkAction({
    orderNumber: order.order_number,
    email,
  });
}
