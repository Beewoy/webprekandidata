import { describe, expect, it } from "vitest";
import { isValidHostname, normalizeHostname } from "../lib/domains/hostname";
import {
  defaultDnsInstructions,
  ensureDnsInstructions,
  relativeDnsName,
} from "../lib/domains/dns-instructions";
import {
  getCanonicalPlatformHostname,
  getCanonicalPublicUrl,
  getPlatformSiteLabel,
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

  it("zobrazí verejnú adresu ako platformovú cestu, nie subdoménu", () => {
    expect(getPlatformSiteLabel("tibor-antal")).toMatch(/\/tibor-antal$/);
    expect(getPlatformSiteLabel("tibor-antal")).not.toMatch(/tibor-antal\./);
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

describe("dns instructions", () => {
  it("pre apex vráti A záznam na Vercel", () => {
    expect(defaultDnsInstructions("volby27.sk")).toEqual([
      { name: "@", type: "A", value: "76.76.21.21", purpose: "routing" },
    ]);
  });

  it("doplní fallback keď provider nevráti záznamy", () => {
    expect(ensureDnsInstructions("volby27.sk", [])).toHaveLength(1);
  });

  it("skráti FQDN overovacieho TXT na relatívny názov", () => {
    expect(relativeDnsName("_vercel.volby27.sk", "volby27.sk")).toBe("_vercel");
    expect(relativeDnsName("volby27.sk", "volby27.sk")).toBe("@");
  });
});

describe("registrar guide", () => {
  it("pre apex obsahuje varovanie o AAAA zázname", async () => {
    const { getDomainRegistrarGuide } = await import("../lib/domains/registrar-guide");
    const guide = getDomainRegistrarGuide("volby27.sk");
    expect(guide.apexAaaaWarning).toMatch(/AAAA/);
    expect(guide.steps.length).toBeGreaterThan(3);
  });

  it("pre subdoménu neobsahuje AAAA varovanie", async () => {
    const { getDomainRegistrarGuide } = await import("../lib/domains/registrar-guide");
    const guide = getDomainRegistrarGuide("volby.martin-novak.sk");
    expect(guide.apexAaaaWarning).toBeNull();
  });
});
