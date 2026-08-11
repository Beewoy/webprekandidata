export type PostStatus = "draft" | "published" | "archived";

export type PostSummary = {
  excerpt: string;
  id: string;
  publishedAt: string | null;
  slug: string;
  status: PostStatus;
  title: string;
  updatedAt: string;
};

export type PostDetail = PostSummary & {
  bodyHtml: string;
  cover: { altText: string; height: number; id: string; previewUrl: string; width: number } | null;
  revision: number;
  seoDescription: string;
  seoTitle: string;
};

export type PostAiEntitlement = {
  canUseAi: boolean;
  limit: number;
  used: number;
};

export type ArticleSuggestion = {
  bodyHtml: string;
  excerpt: string;
  title: string;
};

export function slugifyPostTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90) || "clanok";
}

export function readPostBodyHtml(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const html = (value as Record<string, unknown>).html;
  return typeof html === "string" ? html : "";
}
