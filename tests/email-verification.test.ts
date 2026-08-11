import { describe, expect, it } from "vitest";
import {
  createVerificationToken,
  hashVerificationToken,
  isVerificationToken,
} from "../lib/email/verification-token";

describe("email verification token", () => {
  it("vytvorí kryptografický token vhodný do URL", () => {
    const token = createVerificationToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(isVerificationToken(token)).toBe(true);
  });

  it("ukladá iba deterministický SHA-256 odtlačok", () => {
    expect(hashVerificationToken("test-token")).toBe(
      "4c5dc9b7708905f77f5e5d16316b5dfb425e68cb326dcd55a860e90a7707031e",
    );
  });

  it("odmietne neplatný token pred databázovým volaním", () => {
    expect(isVerificationToken("kratky-token")).toBe(false);
    expect(isVerificationToken("x".repeat(42) + "+")).toBe(false);
  });
});
