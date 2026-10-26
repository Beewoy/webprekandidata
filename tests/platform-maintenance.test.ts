import { afterEach, describe, expect, it } from "vitest";
import {
  isPlatformMaintenance,
  isPlatformMaintenanceExemptPath,
  PLATFORM_MAINTENANCE_PATH,
} from "../lib/platform-maintenance";

describe("platform maintenance", () => {
  const previous = process.env.PLATFORM_MAINTENANCE;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.PLATFORM_MAINTENANCE;
    } else {
      process.env.PLATFORM_MAINTENANCE = previous;
    }
  });

  it("is off by default and only on for exact true", () => {
    delete process.env.PLATFORM_MAINTENANCE;
    expect(isPlatformMaintenance()).toBe(false);

    process.env.PLATFORM_MAINTENANCE = "false";
    expect(isPlatformMaintenance()).toBe(false);

    process.env.PLATFORM_MAINTENANCE = "true";
    expect(isPlatformMaintenance()).toBe(true);
  });

  it("exempts health and Stripe webhook only", () => {
    expect(isPlatformMaintenanceExemptPath("/api/health")).toBe(true);
    expect(isPlatformMaintenanceExemptPath("/api/webhooks/stripe")).toBe(true);
    expect(isPlatformMaintenanceExemptPath("/api/cron/retention")).toBe(false);
    expect(isPlatformMaintenanceExemptPath("/")).toBe(false);
    expect(isPlatformMaintenanceExemptPath(PLATFORM_MAINTENANCE_PATH)).toBe(false);
  });
});
