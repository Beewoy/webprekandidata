import { describe, expect, it } from "vitest";
import { sanitizeInternalPath } from "../lib/auth/safe-redirect";

describe("sanitizeInternalPath", () => {
  it("povolí relatívne cesty v rámci aplikácie", () => {
    expect(sanitizeInternalPath("/app/web/site-id")).toBe("/app/web/site-id");
    expect(sanitizeInternalPath("/admin")).toBe("/admin");
  });

  it("odmietne externé alebo neplatné cesty", () => {
    expect(sanitizeInternalPath("//evil.test")).toBe("/app");
    expect(sanitizeInternalPath("https://evil.test")).toBe("/app");
    expect(sanitizeInternalPath(undefined)).toBe("/app");
  });
});
