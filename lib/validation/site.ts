import { z } from "zod";

export const createSiteSchema = z.object({
  internalName: z.string().trim().min(3, "Pomenujte svoj projekt.").max(100, "Názov projektu je príliš dlhý."),
  candidateName: z.string().trim().min(2, "Zadajte meno kandidáta.").max(120, "Meno je príliš dlhé."),
  locality: z.string().trim().min(2, "Zadajte obec alebo mesto.").max(120, "Názov lokality je príliš dlhý."),
  position: z.string().trim().min(3, "Zadajte funkciu, na ktorú kandidujete.").max(160, "Názov funkcie je príliš dlhý."),
});

export const saveSectionSchema = z.object({
  siteId: z.union([z.literal("demo"), z.string().uuid()]),
  sectionSlug: z.enum(["zakladne-udaje", "kontakt", "uvod", "o-mne", "preco-kandidujem", "program", "seo"]),
  revision: z.number().int().positive(),
  values: z.record(z.string(), z.string().max(12000)),
});

export const saveThemeSchema = z.object({
  siteId: z.union([z.literal("demo"), z.string().uuid()]),
  revision: z.number().int().positive(),
  theme: z.object({
    color: z.string().regex(/^#[0-9a-f]{6}$/i),
    template: z.enum(["modern", "bold", "classic", "vision"]),
  }),
});

export const contactSubmissionSchema = z.object({
  email: z.string().trim().max(254, "E-mailová adresa je príliš dlhá.").email("Zadajte platnú e-mailovú adresu."),
  message: z.string().trim().min(10, "Popíšte svoju otázku alebo podnet aspoň 10 znakmi.").max(5000, "Správa môže mať najviac 5 000 znakov."),
  name: z.string().trim().min(2, "Zadajte svoje meno.").max(120, "Meno môže mať najviac 120 znakov."),
  phone: z.string().trim().max(40, "Telefónne číslo je príliš dlhé.").refine(
    (value) => !value || /^[+\d][\d\s()./-]*$/.test(value),
    "Zadajte platné telefónne číslo.",
  ),
  website: z.string().max(200).default(""),
});

export const registerMediaAssetSchema = z.object({
  altText: z.string().trim().max(300),
  assetId: z.string().uuid(),
  crop: z.object({
    sourceHeight: z.number().positive().max(30000),
    sourceWidth: z.number().positive().max(30000),
    sourceX: z.number().nonnegative().max(30000),
    sourceY: z.number().nonnegative().max(30000),
    zoom: z.number().min(1).max(3),
  }),
  height: z.number().int().positive().max(5000),
  kind: z.enum(["logo", "hero", "about", "social"]),
  siteId: z.union([z.literal("demo"), z.string().uuid()]),
  storagePath: z.string().min(1).max(500),
  width: z.number().int().positive().max(5000),
});

export const registerGalleryAssetSchema = z.object({
  assetId: z.string().uuid(),
  caption: z.string().trim().max(160),
  height: z.number().int().positive().max(5000),
  siteId: z.string().uuid(),
  storagePath: z.string().min(1).max(500),
  width: z.number().int().positive().max(5000),
});

export const updateGalleryAssetSchema = z.object({
  assetId: z.string().uuid(),
  caption: z.string().trim().max(160),
  siteId: z.string().uuid(),
});

export const reorderGalleryAssetsSchema = z.object({
  assetIds: z.array(z.string().uuid()).max(12).refine((ids) => new Set(ids).size === ids.length),
  siteId: z.string().uuid(),
});

export const deleteGalleryAssetSchema = z.object({
  assetId: z.string().uuid(),
  siteId: z.string().uuid(),
});

export type SiteActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Partial<Record<"internalName" | "candidateName" | "locality" | "position", string[]>>;
};

export const initialSiteState: SiteActionState = { status: "idle" };
