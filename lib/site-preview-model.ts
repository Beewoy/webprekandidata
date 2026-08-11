import type { CivicIconName } from "./civic-icons";
import { buildRepeatableItems } from "./repeatable-items";
import { repeatableContent } from "./repeatable-content";
import { sanitizeRichText } from "./rich-text";
import { mergeStoredDraftValues } from "./site-draft-values";
import { editorFields } from "./site-sections";
import { defaultCampaignTheme, isCampaignTemplateId, normalizeCampaignColor, type CampaignTemplateId } from "./site-theme";
import type { GalleryMediaAsset, MediaKind, SiteMediaAsset } from "./site-media";

export type SitePreviewListItem = {
  detailHtml?: string;
  icon: CivicIconName;
  text: string;
  title: string;
};

export type SitePreviewGalleryItem = Pick<GalleryMediaAsset, "altText" | "caption" | "height" | "id" | "previewUrl" | "width">;

export type SitePreviewPost = {
  bodyHtml: string;
  cover: { altText: string; height: number; previewUrl: string; width: number } | null;
  excerpt: string;
  id: string;
  publishedAt: string;
  title: string;
};

export type SitePreviewData = {
  about: {
    bodyHtml: string;
    eyebrow: string;
    headline: string;
    signature: string;
    values: SitePreviewListItem[];
  };
  address: string;
  candidate: {
    city: string;
    initials: string;
    name: string;
    position: string;
  };
  contact: {
    email: string;
    facebook?: string;
    formEnabled: boolean;
    instagram?: string;
    phone: string;
  };
  gallery: {
    items: SitePreviewGalleryItem[];
  };
  hero: {
    headlineAfter: string;
    headlineBefore: string;
    highlight: string;
    subheadline: string;
  };
  media: Partial<Record<MediaKind, { altText: string; url: string }>>;
  news: {
    items: SitePreviewPost[];
  };
  program: {
    eyebrow: string;
    headline: string;
    intro: string;
    items: SitePreviewListItem[];
  };
  reasons: {
    eyebrow: string;
    headline: string;
    intro: string;
    items: SitePreviewListItem[];
  };
  revision: number;
  theme: {
    color: string;
    template: CampaignTemplateId;
  };
};

type SitePreviewSource = {
  candidateName: string;
  locality: string;
  slug: string;
};

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function sectionValues(content: Record<string, unknown>, slug: string) {
  const defaults = Object.fromEntries((editorFields[slug] ?? []).map((field) => [field.name, field.value ?? ""]));
  return mergeStoredDraftValues(defaults, objectValue(content[slug]));
}

function richTextForPreview(value: string) {
  const sanitized = sanitizeRichText(value).trim();
  if (!sanitized) return "";
  return /<(?:p|h3|ul|ol)\b/i.test(sanitized) ? sanitized : `<p>${sanitized}</p>`;
}

function safeSocialUrl(value: string) {
  if (!value.trim()) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words.at(-1)?.[0] ?? ""}` : words[0]?.slice(0, 2) ?? "WK").toLocaleUpperCase("sk");
}

export function splitHighlightedHeadline(headline: string, highlight: string) {
  const normalizedHighlight = highlight.trim();
  if (!normalizedHighlight) return { before: headline, highlight: "", after: "" };
  const index = headline.toLocaleLowerCase("sk").indexOf(normalizedHighlight.toLocaleLowerCase("sk"));
  if (index < 0) return { before: headline, highlight: normalizedHighlight, after: "" };
  return {
    before: headline.slice(0, index),
    highlight: headline.slice(index, index + normalizedHighlight.length),
    after: headline.slice(index + normalizedHighlight.length),
  };
}

function previewItems(slug: string, values: Record<string, string>) {
  const config = repeatableContent[slug];
  if (!config) return [];
  return buildRepeatableItems(config.items, values)
    .map((item) => ({
      ...(item.detail?.trim() ? { detailHtml: richTextForPreview(item.detail) } : {}),
      icon: item.icon,
      text: item.text.trim(),
      title: item.title.trim(),
    }))
    .filter((item) => item.title || item.text || item.detailHtml);
}

export function buildSitePreviewData(
  site: SitePreviewSource,
  draft: { content: unknown; gallery?: SitePreviewGalleryItem[]; media?: SiteMediaAsset[]; posts?: SitePreviewPost[]; revision: number; theme: unknown },
): SitePreviewData {
  const content = objectValue(draft.content);
  const basics = sectionValues(content, "zakladne-udaje");
  const contact = sectionValues(content, "kontakt");
  const hero = sectionValues(content, "uvod");
  const about = sectionValues(content, "o-mne");
  const storedAbout = objectValue(content["o-mne"]);
  const reasons = sectionValues(content, "preco-kandidujem");
  const program = sectionValues(content, "program");
  const theme = objectValue(draft.theme);
  const headline = splitHighlightedHeadline(hero.headline, hero.highlight);
  const candidateName = basics.name.trim() || site.candidateName;
  const city = basics.city.trim() || site.locality;
  const media = Object.fromEntries((draft.media ?? []).map((asset) => [asset.kind, { altText: asset.altText, url: asset.previewUrl }])) as SitePreviewData["media"];

  return {
    about: {
      bodyHtml: richTextForPreview(about.body),
      eyebrow: about.eyebrow,
      headline: about.headline,
      signature: typeof storedAbout.signature === "string" ? storedAbout.signature : `— ${candidateName.split(/\s+/)[0]}`,
      values: previewItems("o-mne", about),
    },
    address: `webprekandidata.sk/${site.slug}`,
    candidate: {
      city,
      initials: initials(candidateName),
      name: candidateName,
      position: basics.position,
    },
    contact: {
      email: contact.email.trim(),
      facebook: safeSocialUrl(contact.facebook),
      formEnabled: contact.contactFormEnabled !== "false",
      instagram: safeSocialUrl(contact.instagram),
      phone: contact.phone.trim(),
    },
    gallery: { items: draft.gallery ?? [] },
    hero: {
      headlineAfter: headline.after,
      headlineBefore: headline.before,
      highlight: headline.highlight,
      subheadline: hero.subheadline,
    },
    media,
    news: {
      items: (draft.posts ?? []).map((post) => ({
        ...post,
        bodyHtml: richTextForPreview(post.bodyHtml),
        excerpt: post.excerpt.trim(),
        title: post.title.trim(),
      })),
    },
    program: {
      eyebrow: program.eyebrow,
      headline: program.headline,
      intro: program.intro,
      items: previewItems("program", program),
    },
    reasons: {
      eyebrow: reasons.eyebrow,
      headline: reasons.headline,
      intro: reasons.intro,
      items: previewItems("preco-kandidujem", reasons),
    },
    revision: draft.revision,
    theme: {
      color: normalizeCampaignColor(typeof theme.primaryColor === "string" ? theme.primaryColor : defaultCampaignTheme.color),
      template: isCampaignTemplateId(theme.layout) ? theme.layout : defaultCampaignTheme.template,
    },
  };
}
