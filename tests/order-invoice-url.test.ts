import { describe, expect, it } from "vitest";
import { resolveOrderInvoiceUrl } from "../lib/payments/order-invoice";

describe("resolveOrderInvoiceUrl", () => {
  it("preferuje hosted Invoice URL pred PDF", () => {
    expect(
      resolveOrderInvoiceUrl(
        "https://invoice.stripe.com/i/test",
        "https://pay.stripe.com/invoice/test/pdf",
      ),
    ).toBe("https://invoice.stripe.com/i/test");
  });

  it("použije PDF, keď hosted URL chýba", () => {
    expect(resolveOrderInvoiceUrl(null, "https://pay.stripe.com/invoice/test/pdf")).toBe(
      "https://pay.stripe.com/invoice/test/pdf",
    );
  });

  it("vráti null bez dokladu", () => {
    expect(resolveOrderInvoiceUrl(null, "  ")).toBeNull();
  });
});
