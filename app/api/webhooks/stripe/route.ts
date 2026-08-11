import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import { getStripeClient } from "@/lib/payments/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const fulfillResultSchema = z.object({
  ok: z.boolean(),
  error: z.string().optional(),
  retryable: z.boolean().optional(),
});

function customerId(session: Stripe.Checkout.Session) {
  if (typeof session.customer === "string") return session.customer;
  if (session.customer && typeof session.customer === "object" && "id" in session.customer) {
    return session.customer.id;
  }
  return "";
}

async function fulfillCheckoutSession(event: Stripe.Event, session: Stripe.Checkout.Session) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("fulfill_stripe_checkout", {
    p_provider_event_id: event.id,
    p_event_type: event.type,
    p_session_id: session.id,
    p_customer_id: customerId(session),
    p_amount_total: session.amount_total ?? 0,
    p_currency: session.currency ?? "",
  });

  if (error) {
    throw new Error(error.message);
  }

  const parsed = fulfillResultSchema.safeParse(data);
  if (!parsed.success || !parsed.data.ok) {
    const retryable = parsed.success ? parsed.data.retryable === true : true;
    const reason = parsed.success ? parsed.data.error ?? "fulfill_failed" : "fulfill_parse_failed";
    const err = new Error(reason) as Error & { retryable?: boolean };
    err.retryable = retryable;
    throw err;
  }
}

async function markSessionStatus(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
  status: "failed" | "cancelled",
) {
  const admin = createAdminClient();
  const { error } = await admin.rpc("mark_checkout_session_status", {
    p_provider_event_id: event.id,
    p_event_type: event.type,
    p_session_id: session.id,
    p_status: status,
  });
  if (error) throw new Error(error.message);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Chýba podpis webhooku." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripeClient().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Neplatný podpis webhooku." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (event.type === "checkout.session.completed" && session.payment_status !== "paid") {
          break;
        }
        await fulfillCheckoutSession(event, session);
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markSessionStatus(event, session, "failed");
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markSessionStatus(event, session, "cancelled");
        break;
      }
      default:
        break;
    }
  } catch (error) {
    const retryable = error instanceof Error && "retryable" in error
      ? (error as Error & { retryable?: boolean }).retryable !== false
      : true;
    if (retryable) {
      return NextResponse.json({ error: "Dočasné zlyhanie spracovania." }, { status: 500 });
    }
    return NextResponse.json({ received: true, ignored: true });
  }

  return NextResponse.json({ received: true });
}
