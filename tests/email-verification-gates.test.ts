import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();

vi.mock("../lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle,
        }),
      }),
    }),
  }),
}));

import { requireVerifiedUser } from "../lib/data/email-verification-gate";

describe("email verification gates", () => {
  beforeEach(() => {
    maybeSingle.mockReset();
  });

  it("unverified user → rejected", async () => {
    maybeSingle.mockResolvedValue({ data: { email_verified_at: null }, error: null });
    const result = await requireVerifiedUser("11111111-1111-4111-8111-111111111111");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/overte e-mail/i);
    }
  });

  it("verified user → allowed", async () => {
    maybeSingle.mockResolvedValue({
      data: { email_verified_at: "2026-08-12T10:00:00.000Z" },
      error: null,
    });
    const result = await requireVerifiedUser("11111111-1111-4111-8111-111111111111");
    expect(result).toEqual({ ok: true });
  });
});
