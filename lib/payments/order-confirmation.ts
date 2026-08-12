import "server-only";

import * as Sentry from "@sentry/nextjs";
import { isBrevoSmtpConfigured, sendOrderConfirmationEmail } from "@/lib/email/brevo";
import { getAppUrl } from "@/lib/env";
import { resolveOrderInvoiceUrl } from "@/lib/payments/order-invoice";
import { PLAN_LABELS, PLAN_PRICE_LABELS, type PaidPlanCode } from "@/lib/payments/plans";
import { createAdminClient } from "@/lib/supabase/admin";

function readBuyerEmail(snapshot: unknown): string | null {
  if (!snapshot || typeof snapshot !== "object") return null;
  const email = (snapshot as { email?: unknown }).email;
  return typeof email === "string" && email.includes("@") ? email.trim() : null;
}

function readBuyerName(snapshot: unknown): string | null {
  if (!snapshot || typeof snapshot !== "object") return null;
  const fullName = (snapshot as { fullName?: unknown }).fullName;
  const companyName = (snapshot as { companyName?: unknown }).companyName;
  if (typeof fullName === "string" && fullName.trim()) return fullName.trim();
  if (typeof companyName === "string" && companyName.trim()) return companyName.trim();
  return null;
}

/**
 * Sends a one-shot order confirmation. Failures are logged and never thrown —
 * callers (Stripe webhook / admin grant) must not roll back fulfillment.
 */
export async function maybeSendOrderConfirmation(orderId: string): Promise<void> {
  if (!isBrevoSmtpConfigured()) return;

  try {
    const admin = createAdminClient();
    const { data: order, error } = await admin
      .from("orders")
      .select(
        "id, order_number, plan_code, total_cents, status, confirmation_email_sent_at, buyer_snapshot, stripe_hosted_invoice_url, stripe_invoice_pdf_url, site_id, user_id, sites(slug, candidate_name)",
      )
      .eq("id", orderId)
      .maybeSingle();

    if (error || !order) return;
    if (order.status !== "paid") return;
    if (order.confirmation_email_sent_at) return;

    const site = Array.isArray(order.sites) ? order.sites[0] : order.sites;
    const siteSlug = site && typeof site === "object" && "slug" in site ? String(site.slug) : null;
    const siteName =
      site && typeof site === "object" && "candidate_name" in site
        ? String(site.candidate_name)
        : null;

    let recipientEmail = readBuyerEmail(order.buyer_snapshot);
    if (!recipientEmail) {
      const { data: userData } = await admin.auth.admin.getUserById(order.user_id);
      recipientEmail = userData.user?.email ?? null;
    }
    if (!recipientEmail) return;

    const planCode = order.plan_code as PaidPlanCode;
    const invoiceUrl = resolveOrderInvoiceUrl(
      order.stripe_hosted_invoice_url,
      order.stripe_invoice_pdf_url,
    );
    const appUrl = getAppUrl().replace(/\/$/, "");
    const publishingUrl = `${appUrl}/app/web/${order.site_id}/publikovanie`;
    const siteLabel = siteName || siteSlug || "Váš volebný web";

    await sendOrderConfirmationEmail({
      recipientEmail,
      recipientName: readBuyerName(order.buyer_snapshot),
      orderNumber: order.order_number,
      planLabel: PLAN_LABELS[planCode],
      priceLabel: PLAN_PRICE_LABELS[planCode],
      siteLabel,
      publishingUrl,
      invoiceUrl,
    });

    await admin
      .from("orders")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", orderId)
      .is("confirmation_email_sent_at", null);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { scope: "order_confirmation_email" },
      extra: { orderId },
    });
  }
}
