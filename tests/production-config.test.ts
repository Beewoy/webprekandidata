import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { isDemoMode } from "../lib/env";
import {
  assertProductionConfig,
  formatProductionConfigError,
  getHardProductionConfigIssues,
  getProductionConfigIssues,
} from "../lib/production-config";

const ORIGINAL_ENV = { ...process.env };

function setEnv(overrides: Record<string, string | undefined>) {
  process.env = { ...ORIGINAL_ENV, ...overrides } as NodeJS.ProcessEnv;
}

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("production demo fail-closed", () => {
  it("v development povolí demo režim", () => {
    setEnv({
      NODE_ENV: "development",
      DEMO_MODE: "true",
    });
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(isDemoMode()).toBe(true);
  });

  it("v production nikdy neprepne do demo ani pri chýbajúcom Supabase", () => {
    setEnv({
      NODE_ENV: "production",
      DEMO_MODE: "true",
    });
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(isDemoMode()).toBe(false);
  });

  it("v production s DEMO_MODE=true zlyhá assertProductionConfig", () => {
    setEnv({
      NODE_ENV: "production",
      DEMO_MODE: "true",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
    });

    const issues = getHardProductionConfigIssues();
    expect(issues).toContain("DEMO_MODE cannot be enabled in production");
    expect(() => assertProductionConfig()).toThrow(formatProductionConfigError(issues));
  });

  it("v production s chýbajúcim Supabase zlyhá assert a nie je demo", () => {
    setEnv({
      NODE_ENV: "production",
      DEMO_MODE: "false",
    });
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(isDemoMode()).toBe(false);
    const issues = getHardProductionConfigIssues();
    expect(issues.some((issue) => issue.includes("NEXT_PUBLIC_SUPABASE_URL"))).toBe(true);
    expect(issues.some((issue) => issue.includes("SUPABASE_SERVICE_ROLE_KEY"))).toBe(true);
    expect(() => assertProductionConfig()).toThrow(/Production configuration invalid/);
  });

  it("v production s platnou hard konfiguráciou assert prejde", () => {
    setEnv({
      NODE_ENV: "production",
      DEMO_MODE: "false",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
    });

    expect(getHardProductionConfigIssues()).toEqual([]);
    expect(() => assertProductionConfig()).not.toThrow();
  });

  it("reportuje soft chýbajúce Stripe/CRON bez ich hodnôt", () => {
    setEnv({
      NODE_ENV: "production",
      DEMO_MODE: "false",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
      SELLER_NAME: "Seller",
      SELLER_ADDRESS: "Addr",
      SELLER_ICO: "123",
      SELLER_DIC: "456",
      SELLER_EMAIL: "a@b.sk",
    });
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.CRON_SECRET;

    const issues = getProductionConfigIssues({ includeSoft: true });
    expect(issues).toContain("missing STRIPE_WEBHOOK_SECRET");
    expect(issues).toContain("missing CRON_SECRET");
    expect(issues.join("\n")).not.toContain("service-role");
  });
});
