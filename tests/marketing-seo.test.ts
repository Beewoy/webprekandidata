import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import {
  CAMPAIGN_PAGES,
  MARKETING_PLAN_PRICES,
  MARKETING_ROUTES,
  buildCampaignStructuredData,
  getCampaignMetadata,
  serializeStructuredData,
} from "../lib/marketing/campaign-pages";

describe("campaign marketing routes", () => {
  it("obsahuje päť unikátnych indexovateľných stránok", () => {
    expect(MARKETING_ROUTES).toHaveLength(5);
    expect(new Set(MARKETING_ROUTES).size).toBe(MARKETING_ROUTES.length);

    for (const route of MARKETING_ROUTES) {
      const page = CAMPAIGN_PAGES[route];
      const metadata = getCampaignMetadata(route);

      expect(page.route).toBe(route);
      expect(page.title.length).toBeGreaterThan(20);
      expect(page.faqs.length).toBeGreaterThanOrEqual(5);
      expect(metadata.alternates?.canonical).toBe(`https://webprekandidata.sk${route}`);
      expect(metadata.robots).toEqual({ index: true, follow: true });
    }
  });

  it("používa produktové ceny Basic a Plus", () => {
    expect(MARKETING_PLAN_PRICES).toEqual({ basic: "49,99 €", plus: "89,99 €" });
  });

  it("generuje viditeľnému FAQ zodpovedajúce a bezpečne serializované JSON-LD", () => {
    const route = "/kampanovy-web-pre-starostu";
    const data = buildCampaignStructuredData(route);
    const graph = data["@graph"];
    const faq = graph.find((item) => item["@type"] === "FAQPage");
    const service = graph.find((item) => item["@type"] === "Service");

    expect(faq && "mainEntity" in faq ? faq.mainEntity : []).toHaveLength(
      CAMPAIGN_PAGES[route].faqs.length,
    );
    expect(service && "offers" in service ? service.offers : []).toHaveLength(2);
    expect(serializeStructuredData({ text: "</script>" })).not.toContain("</script>");
    expect(serializeStructuredData({ text: "</script>" })).toContain("\\u003c/script>");
  });
});

describe("marketing route discovery", () => {
  it("uvádza všetky marketingové stránky v sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const route of MARKETING_ROUTES) {
      expect(urls).toContain(`https://webprekandidata.sk${route}`);
    }
  });

  it("povoľuje všetky marketingové stránky v robots", () => {
    const rules = robots().rules;
    const firstRule = Array.isArray(rules) ? rules[0] : rules;
    const allowed = Array.isArray(firstRule.allow) ? firstRule.allow : [firstRule.allow];

    for (const route of MARKETING_ROUTES) {
      expect(allowed).toContain(route);
    }
  });

  it("rezervuje marketingové aj ostatné statické slugs v append-only migrácii", () => {
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/0016_reserve_marketing_slugs.sql"),
      "utf8",
    );

    for (const route of MARKETING_ROUTES) {
      expect(migration).toContain(`'${route.slice(1)}'`);
    }
    expect(migration).toContain("'reklamacny-poriadok'");
    expect(migration).toContain("'not-found-domain'");
  });
});
