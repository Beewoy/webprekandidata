import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  demoTemplateCatalog,
  getDemoPageMetadata,
  getDemoSitePreview,
  getDemoTemplateBySlug,
  isDemoTemplateSlug,
} from "../lib/demo/sample-site";

describe("public campaign template demos", () => {
  it("maps Slovak preview slugs to stable template IDs", () => {
    expect(demoTemplateCatalog.map(({ id, slug }) => ({ id, slug }))).toEqual([
      { id: "modern", slug: "horizont" },
      { id: "bold", slug: "impulz" },
      { id: "classic", slug: "dovera" },
      { id: "vision", slug: "vizia" },
      { id: "courage", slug: "odvaha" },
      { id: "closeness", slug: "blizkost" },
    ]);
    expect(isDemoTemplateSlug("horizont")).toBe(true);
    expect(isDemoTemplateSlug("modern")).toBe(false);
    expect(getDemoTemplateBySlug("impulz")?.id).toBe("bold");
    expect(getDemoTemplateBySlug("odvaha")?.id).toBe("courage");
    expect(getDemoTemplateBySlug("blizkost")?.id).toBe("closeness");
    expect(getDemoTemplateBySlug("neznama")).toBeUndefined();
  });

  it("reuses the same filled demo site and only swaps the template", () => {
    const horizont = getDemoSitePreview("modern");
    const vizia = getDemoSitePreview("vision");

    expect(horizont.candidate.name).toBe("Martin Novák");
    expect(horizont.theme).toEqual({ color: "#163B65", template: "modern" });
    expect(vizia.theme).toEqual({ color: "#163B65", template: "vision" });
    expect(vizia.hero).toEqual(horizont.hero);
    expect(vizia.gallery.items).toHaveLength(3);
  });

  it("keeps demo pages noindex with the public template name", () => {
    expect(getDemoPageMetadata("classic")).toMatchObject({
      title: { absolute: "Ukážka šablóny Dôvera | WebPreKandidata.sk" },
      robots: { index: false, follow: false },
    });
  });

  it("links homepage and catalog cards to each public demo", () => {
    const landing = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");
    const cards = readFileSync(
      join(process.cwd(), "components/marketing/template-showcase-cards.tsx"),
      "utf8",
    );

    expect(landing).toContain('<TemplateShowcaseCards titleTag="h3" />');
    expect(cards).toContain('href={`/ukazka/${item.slug}`}');
    expect(cards).toContain('href="/sablony"');
    expect(cards).toContain("CampaignTemplatePreview");
    expect(getDemoSitePreview("modern").media.hero?.url).toBe("/images/demo-candidate-portrait.webp");
  });

  it("reserves ukazka and sablony in the append-only slug migration", () => {
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/0030_reserve_template_preview_slugs.sql"),
      "utf8",
    );

    expect(migration).toContain("'ukazka'");
    expect(migration).toContain("'sablony'");
  });
});
