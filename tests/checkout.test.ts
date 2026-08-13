import { describe, expect, it } from "vitest";
import { assertCheckoutAmountMatchesPlan, getPlanTotalCents, isPaidPlanCode, PLAN_PRICES_CENTS } from "../lib/payments/plans";
import { parseCheckoutReturnState } from "../lib/payments/checkout-return";
import {
  buildCheckoutSessionParams,
  buildStripeCustomerParams,
} from "../lib/payments/stripe-invoice";
import { checkoutBillingSchema, createCheckoutSchema, toBuyerSnapshot } from "../lib/validation/checkout";

describe("payment plans", () => {
  it("má pevné ceny Basic a Plus v centoch", () => {
    expect(PLAN_PRICES_CENTS.basic).toBe(4999);
    expect(PLAN_PRICES_CENTS.plus).toBe(8999);
    expect(getPlanTotalCents("basic")).toBe(4999);
    expect(isPaidPlanCode("basic")).toBe(true);
    expect(isPaidPlanCode("free")).toBe(false);
  });
});

describe("checkout billing validation", () => {
  const validBilling = {
    fullName: "Martin Novák",
    email: "martin@example.sk",
    street: "Hlavná 1",
    city: "Trnava",
    postalCode: "917 01",
    country: "SK" as const,
    companyName: "",
    ico: "",
    icDph: "",
    acceptTerms: true,
  };

  it("prijme platné fakturačné údaje", () => {
    expect(checkoutBillingSchema.safeParse(validBilling).success).toBe(true);
  });

  it("odmietne chýbajúci súhlas", () => {
    expect(checkoutBillingSchema.safeParse({ ...validBilling, acceptTerms: false }).success).toBe(false);
  });

  it("odmietne neplatné PSČ", () => {
    expect(checkoutBillingSchema.safeParse({ ...validBilling, postalCode: "1234" }).success).toBe(false);
  });

  it("vytvorí buyer snapshot s customerType", () => {
    const snapshot = toBuyerSnapshot(validBilling, "b2c");
    expect(snapshot.country).toBe("SK");
    expect(snapshot.postalCode).toBe("917 01");
    expect(snapshot.ico).toBe("");
    expect(snapshot.customerType).toBe("b2c");
  });

  it("validuje celý checkout payload pre B2C", () => {
    expect(createCheckoutSchema.safeParse({
      siteId: "11111111-1111-4111-8111-111111111111",
      planCode: "plus",
      customerType: "b2c",
      earlyPerformanceRequested: false,
      billing: validBilling,
    }).success).toBe(true);
  });

  it("vyžaduje IČO a obchodné meno pre B2B", () => {
    expect(createCheckoutSchema.safeParse({
      siteId: "11111111-1111-4111-8111-111111111111",
      planCode: "basic",
      customerType: "b2b",
      earlyPerformanceRequested: false,
      billing: validBilling,
    }).success).toBe(false);

    expect(createCheckoutSchema.safeParse({
      siteId: "11111111-1111-4111-8111-111111111111",
      planCode: "basic",
      customerType: "b2b",
      earlyPerformanceRequested: false,
      billing: { ...validBilling, companyName: "Firma s.r.o.", ico: "12345678" },
    }).success).toBe(true);
  });

  it("odmietne skoré plnenie pri B2B", () => {
    expect(createCheckoutSchema.safeParse({
      siteId: "11111111-1111-4111-8111-111111111111",
      planCode: "basic",
      customerType: "b2b",
      earlyPerformanceRequested: true,
      billing: { ...validBilling, companyName: "Firma s.r.o.", ico: "12345678" },
    }).success).toBe(false);
  });
});

describe("checkout return state", () => {
  it("ukáže čakanie na aktiváciu po success bez entitlement", () => {
    const notice = parseCheckoutReturnState({ checkout: "success", entitled: false });
    expect(notice?.kind).toBe("success_pending");
    expect(notice?.message).toContain("Aktivácia");
  });

  it("return URL success bez entitled ≠ aktivácia balíka (iba UI notice)", () => {
    const notice = parseCheckoutReturnState({ checkout: "success", entitled: false });
    expect(notice?.message).not.toMatch(/je aktívny/i);
    expect(notice?.message).toMatch(/Aktivácia/);
  });

  it("ukáže aktívny balík po success s entitlement", () => {
    const notice = parseCheckoutReturnState({ checkout: "success", entitled: true });
    expect(notice?.message).toContain("aktívny");
  });

  it("rozpozná zrušenú platbu", () => {
    expect(parseCheckoutReturnState({ checkout: "cancelled", entitled: false })?.kind).toBe("cancelled");
  });
});

describe("Stripe Customer and post-purchase invoice", () => {
  const buyer = {
    fullName: "Martin Novák",
    email: "martin@example.sk",
    street: "Hlavná 1",
    city: "Trnava",
    postalCode: "917 01",
    country: "SK",
    companyName: "",
    ico: "",
  };
  const metadata = {
    order_id: "11111111-1111-4111-8111-111111111111",
    order_number: "WPK-2026-00001",
    site_id: "22222222-2222-4222-8222-222222222222",
    plan_code: "basic" as const,
    user_id: "33333333-3333-4333-8333-333333333333",
  };
  const seller = {
    ico: "50640259",
    dic: "1075966881",
  };

  it("vytvorí Customer s e-mailom, menom, adresou a objednávkou", () => {
    expect(buildStripeCustomerParams(buyer, metadata.order_id)).toEqual({
      email: buyer.email,
      name: buyer.fullName,
      address: {
        line1: buyer.street,
        postal_code: buyer.postalCode,
        city: buyer.city,
        country: buyer.country,
      },
      metadata: {
        order_id: metadata.order_id,
      },
    });
  });

  it("uprednostní názov firmy a uloží IČO do Customer metadata", () => {
    const params = buildStripeCustomerParams(
      { ...buyer, companyName: "Novák Consulting", ico: "12345678" },
      metadata.order_id,
    );
    expect(params.name).toBe("Novák Consulting");
    expect(params.metadata).toEqual({
      order_id: metadata.order_id,
      ico: "12345678",
    });
  });

  it("vytvorí payment Checkout s Customerom a zapnutou Invoice", () => {
    const params = buildCheckoutSessionParams({
      buyer,
      customerId: "cus_test",
      integrationIdentifier: "webprekandidata_abcdefgh",
      metadata,
      priceId: "price_basic",
      seller,
      successUrl: "https://example.sk/success",
      cancelUrl: "https://example.sk/cancel",
    });

    expect(params.mode).toBe("payment");
    expect(params.customer).toBe("cus_test");
    expect(params.invoice_creation?.enabled).toBe(true);
    expect(params.metadata).toEqual(metadata);
    expect(params.payment_intent_data?.metadata).toEqual(metadata);
    expect(params.invoice_creation?.invoice_data?.metadata).toEqual(metadata);
    expect(params.invoice_creation?.invoice_data?.custom_fields).toEqual([
      { name: "Číslo objednávky", value: "WPK-2026-00001" },
    ]);
    expect(params.invoice_creation?.invoice_data?.footer).toContain("Nie sme platiteľom DPH");
  });

  it("pridá zákaznícke IČO ako Invoice custom field iba pri zadanej hodnote", () => {
    const params = buildCheckoutSessionParams({
      buyer: { ...buyer, ico: "12345678" },
      customerId: "cus_test",
      integrationIdentifier: "webprekandidata_abcdefgh",
      metadata,
      priceId: "price_basic",
      seller,
      successUrl: "https://example.sk/success",
      cancelUrl: "https://example.sk/cancel",
    });

    expect(params.invoice_creation?.invoice_data?.custom_fields).toEqual([
      { name: "Číslo objednávky", value: "WPK-2026-00001" },
      { name: "IČO", value: "12345678" },
    ]);
  });
});

describe("checkout amount/currency guards", () => {
  it("odmietne zlú menu alebo sumu (žiadny entitlement z nesúladu)", () => {
    expect(() => assertCheckoutAmountMatchesPlan("basic", 4999, "usd")).toThrow("order_currency_mismatch");
    expect(() => assertCheckoutAmountMatchesPlan("basic", 1, "eur")).toThrow("order_amount_mismatch");
    expect(() => assertCheckoutAmountMatchesPlan("plus", 8999, "eur")).not.toThrow();
  });
});

