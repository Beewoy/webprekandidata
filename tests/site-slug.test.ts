import { describe, expect, it } from "vitest";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import {
  RESERVED_PLATFORM_SLUGS,
  sanitizeSlugDraftInput,
  siteSlugSchema,
  slugifyCandidate,
  updateSiteSlugSchema,
  validateSiteSlug,
} from "../lib/validation/slug";

describe("site slug validation", () => {
  it("slugifyCandidate odstráni diakritiku a medzery", () => {
    expect(slugifyCandidate("Martin Novák")).toBe("martin-novak");
    expect(slugifyCandidate("Žilina – poslanec")).toBe("zilina-poslanec");
  });

  it("sanitizeSlugDraftInput ponechá koncovú pomlčku pri písaní", () => {
    expect(sanitizeSlugDraftInput("tibor-")).toBe("tibor-");
    expect(sanitizeSlugDraftInput("tibor-antal")).toBe("tibor-antal");
    expect(sanitizeSlugDraftInput("Tibor Antal")).toBe("tibor-antal");
  });

  it("prijme platný slug a odmietne rezervovaný", () => {
    expect(siteSlugSchema.safeParse("martin-novak").success).toBe(true);
    expect(siteSlugSchema.safeParse("ukazka").success).toBe(false);
    expect(validateSiteSlug("sablony")).toBe("Táto adresa je rezervovaná pre platformu.");
  });

  it("odmietne neplatný formát", () => {
    expect(siteSlugSchema.safeParse("A").success).toBe(false);
    expect(siteSlugSchema.safeParse("martin_novak").success).toBe(false);
    expect(validateSiteSlug("-martin")).toBe("Adresa môže obsahovať iba malé písmená, číslice a pomlčky.");
  });

  it("prijme updateSiteSlugSchema s UUID projektom", () => {
    expect(updateSiteSlugSchema.safeParse({
      siteId: "11111111-1111-4111-8111-111111111111",
      slug: "tibor-antal",
    }).success).toBe(true);
  });

  it("rezervuje kľúčové platformové slugy v jednom zdroji pravdy", () => {
    expect(RESERVED_PLATFORM_SLUGS).toContain("ukazka");
    expect(RESERVED_PLATFORM_SLUGS).toContain("sablony");
    expect(RESERVED_PLATFORM_SLUGS).toContain("prihlasenie");
  });
});

describe("update_site_slug migration", () => {
  it("definuje RPC update_site_slug s audit logom a rezervovanými slugmi", () => {
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/0032_update_site_slug.sql"),
      "utf8",
    );
    expect(migration).toContain("create or replace function public.update_site_slug");
    expect(migration).toContain("'site_slug_updated'");
    expect(migration).toContain("'ukazka'");
    expect(migration).toContain("'sablony'");
    expect(migration).toContain("grant execute on function public.update_site_slug");
  });
});
