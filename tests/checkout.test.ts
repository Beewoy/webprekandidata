import { describe, expect, it } from "vitest";
import { getPlanTotalCents, isPaidPlanCode, PLAN_PRICES_CENTS } from "../lib/payments/plans";
import { parseCheckoutReturnState } from "../lib/payments/checkout-return";
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

  it("vytvorí buyer snapshot bez prázdnych voliteľných polí ako undefined", () => {
    const snapshot = toBuyerSnapshot(validBilling);
    expect(snapshot.country).toBe("SK");
    expect(snapshot.postalCode).toBe("917 01");
    expect(snapshot.ico).toBe("");
  });

  it("validuje celý checkout payload", () => {
    expect(createCheckoutSchema.safeParse({
      siteId: "11111111-1111-4111-8111-111111111111",
      planCode: "plus",
      billing: validBilling,
    }).success).toBe(true);
  });
});

describe("checkout return state", () => {
  it("ukáže čakanie na aktiváciu po success bez entitlement", () => {
    const notice = parseCheckoutReturnState({ checkout: "success", entitled: false });
    expect(notice?.kind).toBe("success_pending");
    expect(notice?.message).toContain("Aktivácia");
  });

  it("ukáže aktívny balík po success s entitlement", () => {
    const notice = parseCheckoutReturnState({ checkout: "success", entitled: true });
    expect(notice?.message).toContain("aktívny");
  });

  it("rozpozná zrušenú platbu", () => {
    expect(parseCheckoutReturnState({ checkout: "cancelled", entitled: false })?.kind).toBe("cancelled");
  });
});
