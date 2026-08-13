import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  evaluateLegalLaunchGate,
} from "../lib/legal/launch-gate";
import {
  formatVatStatusLabel,
  getSellerIdentity,
  isSellerIdentityComplete,
} from "../lib/legal/seller";
import {
  computePublicActivationAt,
  formatServiceDurationLabel,
  getServiceEndsAt,
  SERVICE_END_ISO_DATE,
} from "../lib/legal/service-duration";
import { isWithinWithdrawalWindow } from "../lib/legal/withdrawal";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("withdrawal window", () => {
  it("povoľuje odstúpenie do 14 dní", () => {
    const paidAt = new Date("2026-08-01T10:00:00.000Z");
    expect(isWithinWithdrawalWindow(paidAt, new Date("2026-08-14T10:00:00.000Z"))).toBe(true);
    expect(isWithinWithdrawalWindow(paidAt, new Date("2026-08-16T10:00:00.000Z"))).toBe(false);
  });
});

describe("seller identity LB-01", () => {
  it("má kompletné predvolené údaje prevádzkovateľa", () => {
    delete process.env.SELLER_NAME;
    delete process.env.SELLER_PHONE;
    const identity = getSellerIdentity();
    expect(identity.phone).toBe("+421 948 473 255");
    expect(identity.registrationNumber).toBe("110-253321");
    expect(identity.vatPayer).toBe(false);
    expect(isSellerIdentityComplete(identity)).toBe(true);
    expect(formatVatStatusLabel(identity)).toMatch(/Nie je platiteľ DPH/i);
  });
});

describe("service duration", () => {
  it("končí 31. 12. 2026", () => {
    expect(SERVICE_END_ISO_DATE).toBe("2026-12-31");
    expect(getServiceEndsAt().toISOString()).toBe("2026-12-31T22:59:59.999Z");
    expect(formatServiceDurationLabel()).toContain("2026");
  });

  it("odloží aktiváciu pre B2C bez skorého plnenia", () => {
    const paidAt = new Date("2026-08-13T10:00:00.000Z");
    const deferred = computePublicActivationAt({
      paidAt,
      customerType: "b2c",
      earlyPerformanceRequested: false,
    });
    expect(deferred.toISOString()).toBe("2026-08-27T10:00:00.000Z");

    const immediate = computePublicActivationAt({
      paidAt,
      customerType: "b2c",
      earlyPerformanceRequested: true,
    });
    expect(immediate.toISOString()).toBe(paidAt.toISOString());
  });
});

describe("legal launch gate", () => {
  it("blokuje bez LEGAL_DOCUMENTS_APPROVED", () => {
    process.env.LEGAL_DOCUMENTS_APPROVED = "false";
    const result = evaluateLegalLaunchGate();
    expect(result.ok).toBe(false);
    expect(result.blockers.some((b) => b.code === "legal_documents_not_approved")).toBe(true);
  });

  it("prejde pri schválených dokumentoch a kompletnej identite", () => {
    process.env.LEGAL_DOCUMENTS_APPROVED = "true";
    const result = evaluateLegalLaunchGate();
    expect(result.ok).toBe(true);
  });
});
