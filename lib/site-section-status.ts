import type { SectionStatus } from "./site-sections";

type StoredValues = Record<string, unknown>;

export type SiteSectionStatusMap = Record<string, SectionStatus>;

export type SiteSectionStatusSource = {
  content: unknown;
  domainStatuses?: string[];
  mediaKinds?: string[];
  planCode?: "basic" | "plus" | null;
  postStatuses?: string[];
  seo: unknown;
  siteStatus: "draft" | "ready" | "payment_pending" | "published" | "suspended" | "archived";
  theme: unknown;
};

function objectValue(value: unknown): StoredValues {
  return value && typeof value === "object" && !Array.isArray(value) ? value as StoredValues : {};
}

function hasText(value: unknown) {
  if (typeof value !== "string") return false;
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").trim().length > 0;
}

function hasAnyValue(values: StoredValues) {
  return Object.values(values).some(hasText);
}

function hasFields(values: StoredValues, fields: string[]) {
  return fields.every((field) => hasText(values[field]));
}

function hasCompleteRepeatableItem(values: StoredValues) {
  const indexes = new Set(
    Object.keys(values)
      .map((key) => key.match(/^item_(\d+)_title$/)?.[1])
      .filter((index): index is string => Boolean(index)),
  );

  return [...indexes].some((index) => hasText(values[`item_${index}_title`]) && hasText(values[`item_${index}_text`]));
}

function statusFor(values: StoredValues, complete: boolean): SectionStatus {
  if (complete) return "complete";
  return hasAnyValue(values) ? "started" : "empty";
}

export function deriveContentSectionStatuses(contentValue: unknown, seoValue: unknown): SiteSectionStatusMap {
  const content = objectValue(contentValue);
  const basics = objectValue(content["zakladne-udaje"]);
  const contact = objectValue(content.kontakt);
  const hero = objectValue(content.uvod);
  const about = objectValue(content["o-mne"]);
  const reasons = objectValue(content["preco-kandidujem"]);
  const program = objectValue(content.program);
  const seo = objectValue(seoValue);

  return {
    "zakladne-udaje": statusFor(basics, hasFields(basics, ["name", "position", "city"])),
    kontakt: statusFor(contact, hasText(contact.email) || hasText(contact.phone)),
    uvod: statusFor(hero, hasFields(hero, ["headline", "subheadline"])),
    "o-mne": statusFor(about, hasFields(about, ["headline", "body"])),
    "preco-kandidujem": statusFor(reasons, hasFields(reasons, ["headline", "intro"]) && hasCompleteRepeatableItem(reasons)),
    program: statusFor(program, hasFields(program, ["headline", "intro"]) && hasCompleteRepeatableItem(program)),
    seo: statusFor(seo, hasFields(seo, ["seoTitle", "seoDescription"])),
  };
}

export function buildSiteSectionStatuses(source: SiteSectionStatusSource): SiteSectionStatusMap {
  const statuses = deriveContentSectionStatuses(source.content, source.seo);
  const theme = objectValue(source.theme);
  const themeHasColor = hasText(theme.primaryColor);
  const themeHasLayout = hasText(theme.layout);
  const mediaKinds = new Set(source.mediaKinds ?? []);
  const postStatuses = source.postStatuses ?? [];
  const domainStatuses = source.domainStatuses ?? [];

  statuses.vzhlad = themeHasColor && themeHasLayout ? "complete" : themeHasColor || themeHasLayout ? "started" : "empty";
  statuses.obrazky = mediaKinds.has("hero") ? "complete" : mediaKinds.size > 0 ? "started" : "empty";
  statuses.galeria = mediaKinds.has("gallery") ? "complete" : "empty";
  statuses.aktuality = postStatuses.includes("published") ? "complete" : postStatuses.length > 0 ? "started" : "empty";
  statuses.domena = domainStatuses.includes("active") ? "complete" : domainStatuses.length > 0 ? "started" : "empty";
  statuses.nahlad = "empty";
  statuses.publikovanie = source.siteStatus === "published"
    ? "complete"
    : source.siteStatus === "ready" || source.siteStatus === "payment_pending" || Boolean(source.planCode)
      ? "started"
      : "empty";

  return statuses;
}
