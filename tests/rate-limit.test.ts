import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("../lib/supabase/admin", () => ({
  createAdminClient: () => ({ rpc }),
}));

import {
  authRateLimits,
  consumeAuthEmailRateLimit,
  consumeSupportRateLimit,
  emailRateLimitBucket,
} from "../lib/rate-limit";
import { supportRateLimit } from "../lib/support";

describe("DB-backed rate limiting", () => {
  beforeEach(() => {
    rpc.mockReset();
  });

  it("migrácia 0023 definuje consume_rate_limit pre service_role", () => {
    const sql = readFileSync(
      join(process.cwd(), "supabase/migrations/0023_domain_sync_service_role_and_rate_limits.sql"),
      "utf8",
    );
    expect(sql).toContain("create table if not exists public.rate_limit_buckets");
    expect(sql).toContain("consume_rate_limit");
    expect(sql).toMatch(/grant execute on function public\.consume_rate_limit[\s\S]*to service_role/i);
    expect(sql).toContain("revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated");
  });

  it("support limit používa 3 / 15 min a DB RPC", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    const allowed = await consumeSupportRateLimit("user-1");
    expect(allowed).toBe(true);
    expect(rpc).toHaveBeenCalledWith("consume_rate_limit", {
      p_bucket_key: "support:user-1",
      p_limit: supportRateLimit.maximumSubmissions,
      p_window_seconds: supportRateLimit.windowMinutes * 60,
    });
  });

  it("pri chybe RPC limitu neodmietne požiadavku (fail-open)", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "function does not exist" } });
    expect(await consumeSupportRateLimit("user-1")).toBe(true);
  });

  it("support limit odmietne po prekročení", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await consumeSupportRateLimit("user-1")).toBe(false);
  });

  it("auth rate limit hashuje e-mail a používa limity", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    await consumeAuthEmailRateLimit("auth.login", "Martin@Example.SK");
    expect(rpc).toHaveBeenCalledWith("consume_rate_limit", {
      p_bucket_key: emailRateLimitBucket("auth.login", "Martin@Example.SK"),
      p_limit: authRateLimits.loginRegister.maximum,
      p_window_seconds: authRateLimits.loginRegister.windowSeconds,
    });
    expect(emailRateLimitBucket("auth.login", "martin@example.sk")).toBe(
      emailRateLimitBucket("auth.login", "Martin@Example.SK"),
    );
  });
});
