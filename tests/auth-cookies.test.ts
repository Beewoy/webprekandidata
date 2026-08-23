import { describe, expect, it } from "vitest";
import { isSupabaseAuthCookie } from "../lib/supabase/auth-cookies";

describe("isSupabaseAuthCookie", () => {
  it("rozpozná hlavný aj chunked auth cookie", () => {
    expect(isSupabaseAuthCookie("sb-localhost-auth-token")).toBe(true);
    expect(isSupabaseAuthCookie("sb-localhost-auth-token.0")).toBe(true);
    expect(isSupabaseAuthCookie("sb-localhost-auth-token.1")).toBe(true);
  });

  it("ignoruje iné cookies", () => {
    expect(isSupabaseAuthCookie("_ga")).toBe(false);
    expect(isSupabaseAuthCookie("sb-localhost-auth-code-verifier")).toBe(false);
  });
});
