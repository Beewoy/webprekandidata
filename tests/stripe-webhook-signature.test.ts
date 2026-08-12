import { beforeEach, describe, expect, it, vi } from "vitest";

const constructEvent = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/payments/stripe", () => ({
  getStripeClient: () => ({
    webhooks: { constructEvent },
  }),
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ rpc: vi.fn() }),
}));
vi.mock("@/lib/payments/order-confirmation", () => ({
  maybeSendOrderConfirmation: vi.fn(),
}));

describe("Stripe webhook signature gate", () => {
  beforeEach(() => {
    constructEvent.mockReset();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  });

  it("invalid signature → rejected 400", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("bad sig");
    });
    const { POST } = await import("../app/api/webhooks/stripe/route");
    const response = await POST(new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=bad" },
      body: "{}",
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Neplatný podpis webhooku." });
  });

  it("missing signature → rejected 400", async () => {
    const { POST } = await import("../app/api/webhooks/stripe/route");
    const response = await POST(new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
    }));
    expect(response.status).toBe(400);
  });
});
