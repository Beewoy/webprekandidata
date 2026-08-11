import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/payments/stripe", () => ({
  getStripeClient: vi.fn(),
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ rpc }),
}));

import { processStripeEvent } from "../app/api/webhooks/stripe/route";

function stripeEvent(
  id: string,
  type: Stripe.Event.Type,
  object: Record<string, unknown>,
): Stripe.Event {
  return {
    id,
    object: "event",
    api_version: "2026-07-29.dahlia",
    created: 0,
    data: { object },
    livemode: false,
    pending_webhooks: 1,
    request: null,
    type,
  } as unknown as Stripe.Event;
}

describe("Stripe webhook routing", () => {
  beforeEach(() => {
    rpc.mockReset();
    rpc.mockResolvedValue({ data: { ok: true, idempotent: false }, error: null });
  });

  it("naďalej posiela paid Checkout do fulfillment RPC, ktorá aktivuje plán", async () => {
    await processStripeEvent(stripeEvent("evt_checkout", "checkout.session.completed", {
      id: "cs_test",
      object: "checkout.session",
      payment_status: "paid",
      amount_total: 4999,
      currency: "eur",
      customer: "cus_test",
    }));

    expect(rpc).toHaveBeenCalledWith("fulfill_stripe_checkout", {
      p_provider_event_id: "evt_checkout",
      p_event_type: "checkout.session.completed",
      p_session_id: "cs_test",
      p_customer_id: "cus_test",
      p_amount_total: 4999,
      p_currency: "eur",
    });
  });

  it("uloží paid Invoice podľa order_id metadata", async () => {
    const orderId = "11111111-1111-4111-8111-111111111111";
    await processStripeEvent(stripeEvent("evt_invoice", "invoice.paid", {
      id: "in_test",
      object: "invoice",
      customer: "cus_test",
      metadata: { order_id: orderId },
      invoice_pdf: "https://pay.stripe.com/invoice/in_test/pdf",
      hosted_invoice_url: "https://invoice.stripe.com/i/in_test",
    }));

    expect(rpc).toHaveBeenCalledWith("record_stripe_invoice", {
      p_provider_event_id: "evt_invoice",
      p_event_type: "invoice.paid",
      p_order_id: orderId,
      p_customer_id: "cus_test",
      p_invoice_id: "in_test",
      p_invoice_pdf_url: "https://pay.stripe.com/invoice/in_test/pdf",
      p_hosted_invoice_url: "https://invoice.stripe.com/i/in_test",
    });
  });

  it("bez chyby prijme idempotentný replay invoice webhooku", async () => {
    const event = stripeEvent("evt_invoice_replay", "invoice.paid", {
      id: "in_test",
      object: "invoice",
      customer: "cus_test",
      metadata: { order_id: "11111111-1111-4111-8111-111111111111" },
      invoice_pdf: "https://pay.stripe.com/invoice/in_test/pdf",
      hosted_invoice_url: "https://invoice.stripe.com/i/in_test",
    });
    rpc
      .mockResolvedValueOnce({ data: { ok: true, idempotent: false }, error: null })
      .mockResolvedValueOnce({ data: { ok: true, idempotent: true }, error: null });

    await processStripeEvent(event);
    await expect(processStripeEvent(event)).resolves.toBeUndefined();
    expect(rpc).toHaveBeenCalledTimes(2);
  });
});
