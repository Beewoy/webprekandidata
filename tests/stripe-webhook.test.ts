import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
const maybeSendOrderConfirmation = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/payments/stripe", () => ({
  getStripeClient: vi.fn(),
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ rpc }),
}));
vi.mock("@/lib/payments/order-confirmation", () => ({
  maybeSendOrderConfirmation: (...args: unknown[]) => maybeSendOrderConfirmation(...args),
}));

import { processStripeEvent } from "../lib/payments/stripe-webhook";

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
    maybeSendOrderConfirmation.mockReset();
    rpc.mockResolvedValue({
      data: {
        ok: true,
        idempotent: false,
        order_id: "11111111-1111-4111-8111-111111111111",
      },
      error: null,
    });
    maybeSendOrderConfirmation.mockResolvedValue(undefined);
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
    expect(maybeSendOrderConfirmation).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
    );
  });

  it("pri idempotentnom fulfill neposiela potvrdzovací e-mail", async () => {
    rpc.mockResolvedValue({
      data: {
        ok: true,
        idempotent: true,
        order_id: "11111111-1111-4111-8111-111111111111",
      },
      error: null,
    });

    await processStripeEvent(stripeEvent("evt_idem", "checkout.session.completed", {
      id: "cs_idem",
      object: "checkout.session",
      payment_status: "paid",
      amount_total: 4999,
      currency: "eur",
      customer: "cus_test",
    }));

    expect(maybeSendOrderConfirmation).not.toHaveBeenCalled();
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
    expect(maybeSendOrderConfirmation).not.toHaveBeenCalled();
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

  it("duplicate checkout webhook pošle rovnaké event id (idempotencia na RPC)", async () => {
    const event = stripeEvent("evt_dup", "checkout.session.completed", {
      id: "cs_dup",
      object: "checkout.session",
      payment_status: "paid",
      amount_total: 4999,
      currency: "eur",
      customer: "cus_test",
    });
    rpc
      .mockResolvedValueOnce({
        data: {
          ok: true,
          idempotent: false,
          order_id: "11111111-1111-4111-8111-111111111111",
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          ok: true,
          idempotent: true,
          order_id: "11111111-1111-4111-8111-111111111111",
        },
        error: null,
      });

    await processStripeEvent(event);
    await processStripeEvent(event);
    expect(rpc).toHaveBeenNthCalledWith(1, "fulfill_stripe_checkout", expect.objectContaining({
      p_provider_event_id: "evt_dup",
      p_amount_total: 4999,
      p_currency: "eur",
    }));
    expect(rpc).toHaveBeenNthCalledWith(2, "fulfill_stripe_checkout", expect.objectContaining({
      p_provider_event_id: "evt_dup",
    }));
    expect(maybeSendOrderConfirmation).toHaveBeenCalledTimes(1);
  });

  it("invoice.paid nevolá fulfill_stripe_checkout (doklad ≠ entitlement)", async () => {
    rpc.mockResolvedValue({ data: { ok: true }, error: null });
    await processStripeEvent(stripeEvent("evt_inv_only", "invoice.paid", {
      id: "in_only",
      object: "invoice",
      customer: "cus_test",
      metadata: { order_id: "11111111-1111-4111-8111-111111111111" },
      invoice_pdf: "https://pay.stripe.com/invoice/in_only/pdf",
      hosted_invoice_url: "https://invoice.stripe.com/i/in_only",
    }));
    expect(rpc).toHaveBeenCalledWith("record_stripe_invoice", expect.any(Object));
    expect(rpc).not.toHaveBeenCalledWith("fulfill_stripe_checkout", expect.anything());
  });
});
