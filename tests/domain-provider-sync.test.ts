import { beforeEach, describe, expect, it, vi } from "vitest";

const adminRpc = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("../lib/supabase/admin", () => ({
  createAdminClient: () => ({ rpc: adminRpc }),
}));

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  statusFromVercelSnapshot,
  syncDomainProviderStateWithAdmin,
} from "../lib/domains/provider-sync";
import type { VercelDomainSnapshot } from "../lib/domains/vercel";

function snapshot(partial: Partial<VercelDomainSnapshot>): VercelDomainSnapshot {
  return {
    configured: true,
    dns: [],
    misconfigured: false,
    name: "example.sk",
    sslReady: false,
    verified: false,
    verification: [],
    ...partial,
  };
}

describe("domain provider sync security", () => {
  beforeEach(() => {
    adminRpc.mockReset();
    adminRpc.mockResolvedValue({ data: { ok: true }, error: null });
  });

  it("migrácia 0023 odoberie sync_domain_provider_state authenticated role", () => {
    const sql = readFileSync(
      join(process.cwd(), "supabase/migrations/0023_domain_sync_service_role_and_rate_limits.sql"),
      "utf8",
    );
    expect(sql).toMatch(/revoke all on function public\.sync_domain_provider_state[\s\S]*from authenticated/i);
    expect(sql).toMatch(/grant execute on function public\.sync_domain_provider_state[\s\S]*to service_role/i);
  });

  it("active status vznikne iba zo trusted Vercel snapshotu", () => {
    expect(statusFromVercelSnapshot(snapshot({
      verified: true,
      sslReady: true,
      misconfigured: false,
    }))).toBe("active");

    expect(statusFromVercelSnapshot(snapshot({
      verified: false,
      sslReady: false,
      misconfigured: true,
      dns: [{ name: "@", type: "A", value: "76.76.21.21", purpose: "routing" }],
    }))).toBe("verifying");
  });

  it("syncDomainProviderStateWithAdmin volá iba service_role klienta", async () => {
    await syncDomainProviderStateWithAdmin({
      domainId: "11111111-1111-4111-8111-111111111111",
      status: "active",
      snapshot: snapshot({ verified: true, sslReady: true }),
      makePrimaryWhenActive: true,
    });

    expect(adminRpc).toHaveBeenCalledWith(
      "sync_domain_provider_state",
      expect.objectContaining({
        p_domain_id: "11111111-1111-4111-8111-111111111111",
        p_status: "active",
        p_make_primary: true,
      }),
    );
  });

  it("authenticated user client nesmie byť použitý na nastavenie active (kontrakt)", () => {
    expect(adminRpc).not.toHaveBeenCalled();
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/0023_domain_sync_service_role_and_rate_limits.sql"),
      "utf8",
    );
    expect(migration).not.toMatch(/grant execute on function public\.sync_domain_provider_state[\s\S]*to authenticated/i);
  });
});
