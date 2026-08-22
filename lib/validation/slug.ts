import { z } from "zod";

export const RESERVED_PLATFORM_SLUGS = [
  "admin",
  "api",
  "app",
  "auth",
  "kampanovy-web-pre-poslanca",
  "kampanovy-web-pre-primatora",
  "kampanovy-web-pre-starostu",
  "komunalne-volby-2026",
  "not-found-domain",
  "obchodne-podmienky",
  "ochrana-sukromia",
  "prihlasenie",
  "registracia",
  "reklamacny-poriadok",
  "robots.txt",
  "sablony",
  "sitemap.xml",
  "ukazka",
  "volby-do-vuc-2026",
  "zabudnute-heslo",
  "obnova-hesla",
] as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyCandidate(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/** Keeps trailing hyphens while the user is typing in the slug field. */
export function sanitizeSlugDraftInput(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/g, "")
    .slice(0, 80);
}

export function normalizeSiteSlug(value: string) {
  return value.trim().toLowerCase().replace(/^-+|-+$/g, "");
}

export function validateSiteSlug(slug: string): string | null {
  const trimmed = slug.trim().toLowerCase();
  if (trimmed.length < 2) return "Adresa musí mať aspoň 2 znaky.";
  if (trimmed.length > 80) return "Adresa môže mať najviac 80 znakov.";
  if (!SLUG_PATTERN.test(trimmed)) {
    return "Adresa môže obsahovať iba malé písmená, číslice a pomlčky.";
  }
  if ((RESERVED_PLATFORM_SLUGS as readonly string[]).includes(trimmed)) {
    return "Táto adresa je rezervovaná pre platformu.";
  }
  return null;
}

export const siteSlugSchema = z.string().trim().transform(normalizeSiteSlug).pipe(
  z.string().min(2, "Adresa musí mať aspoň 2 znaky.").max(80, "Adresa môže mať najviac 80 znakov.").regex(
    SLUG_PATTERN,
    "Adresa môže obsahovať iba malé písmená, číslice a pomlčky.",
  ).superRefine((value, ctx) => {
    if ((RESERVED_PLATFORM_SLUGS as readonly string[]).includes(value)) {
      ctx.addIssue({ code: "custom", message: "Táto adresa je rezervovaná pre platformu." });
    }
  }),
);

export const updateSiteSlugSchema = z.object({
  siteId: z.string().uuid("Neplatný projekt."),
  slug: siteSlugSchema,
});
