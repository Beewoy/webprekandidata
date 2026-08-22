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
import { PLATFORM_OPEN_GRAPH_IMAGE } from "../lib/marketing/metadata";
import {
  PLAN_DESCRIPTIONS,
  PLAN_FEATURES,
  PLAN_PRICE_LABELS,
} from "../lib/payments/plans";

describe("campaign marketing routes", () => {
  it("používa existujúci spoločný OG obrázok s deklarovanými rozmermi", () => {
    const image = readFileSync(
      join(process.cwd(), "public/images/webprekandidata-og.png"),
    );

    expect(image.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(image.readUInt32BE(16)).toBe(PLATFORM_OPEN_GRAPH_IMAGE.width);
    expect(image.readUInt32BE(20)).toBe(PLATFORM_OPEN_GRAPH_IMAGE.height);
    expect(PLATFORM_OPEN_GRAPH_IMAGE.url).toBe("/images/webprekandidata-og.png");
  });

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
      expect(metadata.openGraph?.images).toEqual([PLATFORM_OPEN_GRAPH_IMAGE]);
      expect(metadata.robots).toEqual({ index: true, follow: true });
      expect(metadata.twitter?.images).toEqual([PLATFORM_OPEN_GRAPH_IMAGE]);
    }
  });

  it("používa produktové ceny Basic a Plus", () => {
    expect(MARKETING_PLAN_PRICES).toEqual(PLAN_PRICE_LABELS);
  });

  it("má jeden produktový obsah pre landing aj objednávky", () => {
    expect(PLAN_DESCRIPTIONS).toEqual({
      basic: "Profesionálny základ pre vašu kandidatúru.",
      plus: "Viac podpory pre pravidelnú komunikáciu.",
    });
    expect(PLAN_FEATURES.basic).toContain("AI návrh prvotného obsahu");
    expect(PLAN_FEATURES.basic).toContain("Aktuality, galéria a e-mailový kontakt");
    expect(PLAN_FEATURES.plus).toContain("Pripojenie jednej existujúcej vlastnej domény");
    expect(PLAN_FEATURES.plus).toContain("Najviac 20 AI návrhov článkov");

    const landing = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");
    expect(landing).toContain("PLAN_FEATURES.basic.map");
    expect(landing).toContain("PLAN_FEATURES.plus.map");
    expect(landing).toContain("PLAN_PRICE_LABELS.basic");
    expect(landing).toContain("PLAN_PRICE_LABELS.plus");
    expect(landing).not.toContain("Aktuality, galéria a kontaktný formulár");
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
    expect(urls).toContain("https://webprekandidata.sk/sablony");
  });

  it("povoľuje všetky marketingové stránky v robots", () => {
    const rules = robots().rules;
    const firstRule = Array.isArray(rules) ? rules[0] : rules;
    const allowed = Array.isArray(firstRule.allow) ? firstRule.allow : [firstRule.allow];

    for (const route of MARKETING_ROUTES) {
      expect(allowed).toContain(route);
    }
    expect(allowed).toContain("/sablony");
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
