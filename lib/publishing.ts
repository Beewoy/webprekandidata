import { createHash } from "node:crypto";
import { z } from "zod";
import { deriveContentSectionStatuses } from "./site-section-status";

const objectSchema = z.record(z.string(), z.unknown());

export const publicationMediaItemSchema = z.object({
  altText: z.string().max(300),
  assetId: z.string().uuid(),
  caption: z.string().max(160).default(""),
  height: z.number().int().positive(),
  kind: z.enum(["logo", "hero", "about", "social", "gallery", "post"]),
  sortOrder: z.number().int().nonnegative().default(0),
  storagePath: z.string().min(1).max(700),
  width: z.number().int().positive(),
});

export const publicationPostSchema = z.object({
  bodyHtml: z.string().max(20000),
  coverAssetId: z.string().uuid().nullable(),
  excerpt: z.string().max(320),
  id: z.string().uuid(),
  publishedAt: z.string().datetime(),
  title: z.string().min(1).max(140),
});

export type PublicationMediaItem = z.infer<typeof publicationMediaItemSchema>;
export type PublicationPost = z.infer<typeof publicationPostSchema>;

export type PublishIssue = {
  label: string;
  message: string;
  section: string;
};

export type PublishReadiness = {
  blockers: PublishIssue[];
  ready: boolean;
  warnings: PublishIssue[];
};

export type PublishingState = {
  currentPublication: {
    publishedAt: string;
    sourceRevision: number;
    versionNumber: number;
  } | null;
  entitled: boolean;
  hasUnpublishedChanges: boolean;
  planCode: "basic" | "plus" | null;
  publicPath: string;
  readiness: PublishReadiness;
  siteStatus: "draft" | "ready" | "payment_pending" | "published" | "suspended" | "archived";
};

function asObject(value: unknown) {
  const parsed = objectSchema.safeParse(value);
  return parsed.success ? parsed.data : {};
}

function hasValidEmail(value: unknown) {
  return typeof value === "string" && z.string().trim().email().safeParse(value).success;
}

export function getPublishReadiness(input: { content: unknown; mediaKinds?: string[]; seo: unknown }): PublishReadiness {
  const statuses = deriveContentSectionStatuses(input.content, input.seo);
  const requiredSections = [
    ["zakladne-udaje", "Základné údaje", "Doplňte meno, kandidatúru a obec alebo mesto."],
    ["uvod", "Úvodný banner", "Doplňte hlavný nadpis a podnadpis."],
    ["o-mne", "O mne", "Doplňte nadpis a text predstavenia."],
    ["preco-kandidujem", "Prečo kandidujem", "Doplňte úvod a aspoň jeden úplný dôvod."],
    ["program", "Program", "Doplňte úvod a aspoň jeden úplný bod programu."],
  ] as const;
  const blockers: PublishIssue[] = requiredSections.flatMap(([section, label, message]) => (
    statuses[section] === "complete" ? [] : [{ label, message, section }]
  ));
  const content = asObject(input.content);
  const contact = asObject(content.kontakt);
  if (contact.contactFormEnabled !== "false" && !hasValidEmail(contact.email)) {
    blockers.push({ label: "Kontaktný formulár", message: "Doplňte platný e-mail alebo kontaktný formulár vypnite.", section: "kontakt" });
  }

  const warnings: PublishIssue[] = [];
  if (statuses.seo !== "complete") warnings.push({ label: "SEO", message: "Doplňte titulok a popis pre vyhľadávače.", section: "seo" });
  if (!(input.mediaKinds ?? []).includes("hero")) warnings.push({ label: "Hlavná fotografia", message: "Web môžete zverejniť aj bez fotografie, ale portrét pôsobí dôveryhodnejšie.", section: "obrazky" });

  return { blockers, ready: blockers.length === 0, warnings };
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, stableValue(entry)]));
  }
  return value;
}

export function buildPublicationFingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(stableValue(value))).digest("hex");
}

export function parsePublicationMedia(value: unknown): PublicationMediaItem[] {
  const parsed = z.array(publicationMediaItemSchema).max(128).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function parsePublicationPosts(value: unknown): PublicationPost[] {
  const parsed = z.array(publicationPostSchema).max(100).safeParse(value);
  return parsed.success ? parsed.data : [];
}
