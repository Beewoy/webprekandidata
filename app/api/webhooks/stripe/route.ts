import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/payments/stripe";
import { processStripeEvent } from "../../../../lib/payments/stripe-webhook";

export const runtime = "nodejs";

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
    await processStripeEvent(event);
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
