import { describe, expect, it } from "vitest";
import { isValidHostname, normalizeHostname } from "../lib/domains/hostname";
import {
  getCanonicalPlatformHostname,
  getCanonicalPublicUrl,
  isPlatformHostname,
  isPlatformWwwHostname,
} from "../lib/domains/platform";

describe("domain hostname helpers", () => {
  it("normalizuje protokol a cestu", () => {
    expect(normalizeHostname("https://Martin-Novak.sk/path")).toBe("martin-novak.sk");
  });

  it("odmietne neplatné hostnamy", () => {
    expect(isValidHostname("martin-novak.sk")).toBe(true);
    expect(isValidHostname("www.martin-novak.sk")).toBe(true);
    expect(isValidHostname("localhost")).toBe(false);
    expect(isValidHostname("bad_domain.sk")).toBe(false);
  });

  it("rozpozná platformové hostnamy", () => {
    expect(isPlatformHostname("webprekandidata.sk")).toBe(true);
    expect(isPlatformHostname("martin-novak.webprekandidata.sk")).toBe(true);
    expect(isPlatformHostname("martin-novak.sk")).toBe(false);
  });

  it("rozpozná www alias kanonického platformového hosta", () => {
    expect(getCanonicalPlatformHostname("www.webprekandidata.sk")).toBe("webprekandidata.sk");
    expect(isPlatformWwwHostname("www.webprekandidata.sk", "webprekandidata.sk")).toBe(true);
    expect(isPlatformWwwHostname("webprekandidata.sk", "webprekandidata.sk")).toBe(false);
  });

  it("preferuje aktívnu custom doménu pre canonical", () => {
    expect(getCanonicalPublicUrl({
      platformSlug: "martin-novak",
      primaryHostname: "martin-novak.sk",
      primaryIsCustom: true,
      primaryStatus: "active",
    })).toBe("https://martin-novak.sk");

    expect(getCanonicalPublicUrl({
      platformSlug: "martin-novak",
      primaryHostname: "martin-novak.sk",
      primaryIsCustom: true,
      primaryStatus: "verifying",
    })).toMatch(/\/martin-novak$/);
  });
});
