import type Stripe from "stripe";
import { z } from "zod";
import { maybeSendOrderConfirmation } from "@/lib/payments/order-confirmation";
import { createAdminClient } from "@/lib/supabase/admin";

const fulfillResultSchema = z.object({
  ok: z.boolean(),
  error: z.string().optional(),
  retryable: z.boolean().optional(),
  idempotent: z.boolean().optional(),
  order_id: z.string().uuid().nullish(),
});

function stripeObjectId(value: string | { id: string } | null) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) return value.id;
  return "";
}

function throwRpcFailure(data: unknown) {
  const parsed = fulfillResultSchema.safeParse(data);
  if (!parsed.success || !parsed.data.ok) {
    const retryable = parsed.success ? parsed.data.retryable === true : true;
    const reason = parsed.success ? parsed.data.error ?? "stripe_webhook_failed" : "stripe_webhook_parse_failed";
    const error = new Error(reason) as Error & { retryable?: boolean };
    error.retryable = retryable;
    throw error;
  }
  return parsed.data;
}

async function fulfillCheckoutSession(event: Stripe.Event, session: Stripe.Checkout.Session) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("fulfill_stripe_checkout", {
    p_provider_event_id: event.id,
    p_event_type: event.type,
    p_session_id: session.id,
    p_customer_id: stripeObjectId(session.customer),
    p_amount_total: session.amount_total ?? 0,
    p_currency: session.currency ?? "",
  });
  if (error) throw new Error(error.message);
  const result = throwRpcFailure(data);
  if (result.idempotent !== true && result.order_id) await maybeSendOrderConfirmation(result.order_id);
}

async function markSessionStatus(event: Stripe.Event, session: Stripe.Checkout.Session, status: "failed" | "cancelled") {
  const admin = createAdminClient();
  const { error } = await admin.rpc("mark_checkout_session_status", {
    p_provider_event_id: event.id,
    p_event_type: event.type,
    p_session_id: session.id,
    p_status: status,
  });
  if (error) throw new Error(error.message);
}

async function recordPaidInvoice(event: Stripe.Event, invoice: Stripe.Invoice) {
  const orderId = z.string().uuid().safeParse(invoice.metadata?.order_id);
  if (!orderId.success) {
    const error = new Error("missing_invoice_order_id") as Error & { retryable?: boolean };
    error.retryable = false;
    throw error;
  }
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("record_stripe_invoice", {
    p_provider_event_id: event.id,
    p_event_type: event.type,
    p_order_id: orderId.data,
    p_customer_id: stripeObjectId(invoice.customer),
    p_invoice_id: invoice.id,
    p_invoice_pdf_url: invoice.invoice_pdf ?? "",
    p_hosted_invoice_url: invoice.hosted_invoice_url ?? "",
  });
  if (error) throw new Error(error.message);
  throwRpcFailure(data);
}

export async function processStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (event.type !== "checkout.session.completed" || session.payment_status === "paid") {
        await fulfillCheckoutSession(event, session);
      }
      break;
    }
    case "checkout.session.async_payment_failed":
      await markSessionStatus(event, event.data.object as Stripe.Checkout.Session, "failed");
      break;
    case "checkout.session.expired":
      await markSessionStatus(event, event.data.object as Stripe.Checkout.Session, "cancelled");
      break;
    case "invoice.paid":
      await recordPaidInvoice(event, event.data.object as Stripe.Invoice);
      break;
    default:
      break;
  }
}
