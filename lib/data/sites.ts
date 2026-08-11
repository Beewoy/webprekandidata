import { cache } from "react";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { contentSections, editorFields, publishSections } from "@/lib/site-sections";
import { mergeStoredDraftValues } from "@/lib/site-draft-values";
import { buildSitePreviewData } from "@/lib/site-preview-model";
import { buildSiteSectionStatuses, type SiteSectionStatusMap } from "@/lib/site-section-status";
import { isMediaKind, type GalleryMediaAsset, type SiteMediaAsset } from "@/lib/site-media";
import { defaultCampaignTheme, isCampaignTemplateId, normalizeCampaignColor, type CampaignTemplateId } from "@/lib/site-theme";
import { readPostBodyHtml } from "@/lib/posts";
import { sanitizeRichText } from "@/lib/rich-text";

export type SiteSummary = {
  id: string;
  internalName: string;
  candidateName: string;
  locality: string;
  slug: string;
  status: "draft" | "ready" | "payment_pending" | "published" | "suspended" | "archived";
  planCode: "basic" | "plus" | null;
  adminHold: boolean;
  currentPublicationId: string | null;
  updatedAt: string;
};

const demoSite: SiteSummary = {
  id: "demo",
  internalName: "Komunálne voľby 2026",
  candidateName: "Martin Novák",
  locality: "Trnava",
  slug: "martin-novak",
  status: "draft",
  planCode: null,
  adminHold: false,
  currentPublicationId: null,
  updatedAt: new Date().toISOString(),
};

export const getCurrentUser = cache(async () => {
  if (isDemoMode()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/prihlasenie");
  return user;
}

export async function getSites(): Promise<SiteSummary[]> {
  if (isDemoMode()) return [demoSite];
  await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("id, internal_name, candidate_name, locality, slug, status, plan_code, admin_hold, current_publication_id, updated_at")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw new Error("Projekty sa nepodarilo načítať.");
  return (data ?? []).map((site) => ({
    id: site.id,
    internalName: site.internal_name,
    candidateName: site.candidate_name,
    locality: site.locality,
    slug: site.slug,
    status: site.status,
    planCode: site.plan_code,
    adminHold: site.admin_hold,
    currentPublicationId: site.current_publication_id,
    updatedAt: site.updated_at,
  }));
}

export const getSite = cache(async (siteId: string): Promise<SiteSummary | null> => {
  if (siteId === "demo" && isDemoMode()) return demoSite;
  if (isDemoMode()) return null;
  await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("id, internal_name, candidate_name, locality, slug, status, plan_code, admin_hold, current_publication_id, updated_at")
    .eq("id", siteId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    internalName: data.internal_name,
    candidateName: data.candidate_name,
    locality: data.locality,
    slug: data.slug,
    status: data.status,
    planCode: data.plan_code,
    adminHold: data.admin_hold,
    currentPublicationId: data.current_publication_id,
    updatedAt: data.updated_at,
  };
});

export async function getSectionDraft(siteId: string, sectionSlug: string) {
  const defaults = Object.fromEntries((editorFields[sectionSlug] ?? []).map((field) => [field.name, field.value ?? ""]));
  if (siteId === "demo" && isDemoMode()) return { values: defaults, revision: 1 };
  if (isDemoMode()) return { values: defaults, revision: 1 };

  const site = await getSite(siteId);
  if (!site) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_drafts").select("content, seo, revision").eq("site_id", siteId).single();
  if (error || !data) return { values: defaults, revision: 1 };

  const source = sectionSlug === "seo" ? data.seo : (data.content as Record<string, unknown>)[sectionSlug];
  const storedValues = source && typeof source === "object" && !Array.isArray(source) ? source as Record<string, unknown> : {};
  const values = mergeStoredDraftValues(defaults, storedValues);
  return { values, revision: Number(data.revision) };
}

export type SiteThemeDraft = {
  color: string;
  revision: number;
  template: CampaignTemplateId;
};

export async function getSiteThemeDraft(siteId: string): Promise<SiteThemeDraft | null> {
  if (siteId === "demo" && isDemoMode()) return { ...defaultCampaignTheme, revision: 1 };
  if (isDemoMode()) return { ...defaultCampaignTheme, revision: 1 };

  const site = await getSite(siteId);
  if (!site) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_drafts").select("theme, revision").eq("site_id", siteId).single();
  if (error || !data) return null;

  const theme = data.theme && typeof data.theme === "object" && !Array.isArray(data.theme)
    ? data.theme as Record<string, unknown>
    : {};

  return {
    color: normalizeCampaignColor(typeof theme.primaryColor === "string" ? theme.primaryColor : defaultCampaignTheme.color),
    revision: Number(data.revision),
    template: isCampaignTemplateId(theme.layout) ? theme.layout : defaultCampaignTheme.template,
  };
}

export async function getSiteMedia(siteId: string): Promise<SiteMediaAsset[] | null> {
  if (siteId === "demo" && isDemoMode()) return [];
  if (isDemoMode()) return [];

  const site = await getSite(siteId);
  if (!site) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, kind, storage_path, alt_text, width, height, created_at")
    .eq("site_id", siteId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Obrázky sa nepodarilo načítať.");

  const latestByKind = (data ?? []).filter((asset) => isMediaKind(asset.kind)).filter((asset, index, assets) => (
    assets.findIndex((candidate) => candidate.kind === asset.kind) === index
  ));
  const signedAssets = await Promise.all(latestByKind.map(async (asset) => {
    const { data: signed } = await supabase.storage.from("candidate-media").createSignedUrl(asset.storage_path, 3600);
    if (!signed?.signedUrl || !isMediaKind(asset.kind)) return null;
    return {
      altText: asset.alt_text,
      createdAt: asset.created_at,
      height: asset.height ?? 1,
      id: asset.id,
      kind: asset.kind,
      previewUrl: signed.signedUrl,
      width: asset.width ?? 1,
    } satisfies SiteMediaAsset;
  }));

  return signedAssets.filter((asset): asset is SiteMediaAsset => asset !== null);
}

export type SiteGalleryData = {
  assets: GalleryMediaAsset[];
  storageUsedBytes: number;
};

export async function getSiteGallery(siteId: string): Promise<SiteGalleryData | null> {
  if (siteId === "demo" && isDemoMode()) return { assets: [], storageUsedBytes: 0 };
  if (isDemoMode()) return { assets: [], storageUsedBytes: 0 };

  const site = await getSite(siteId);
  if (!site) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, kind, storage_path, alt_text, caption, byte_size, width, height, sort_order, created_at")
    .eq("site_id", siteId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error("Galériu sa nepodarilo načítať.");
  const activeAssets = data ?? [];
  const galleryRows = activeAssets.filter((asset) => asset.kind === "gallery");
  const assets = await Promise.all(galleryRows.map(async (asset, index) => {
    const { data: signed } = await supabase.storage.from("candidate-media").createSignedUrl(asset.storage_path, 3600);
    if (!signed?.signedUrl) return null;
    return {
      altText: asset.alt_text,
      byteSize: Number(asset.byte_size),
      caption: asset.caption,
      createdAt: asset.created_at,
      height: asset.height ?? 1,
      id: asset.id,
      previewUrl: signed.signedUrl,
      sortOrder: asset.sort_order ?? index,
      width: asset.width ?? 1,
    } satisfies GalleryMediaAsset;
  }));

  return {
    assets: assets.filter((asset): asset is GalleryMediaAsset => asset !== null),
    storageUsedBytes: activeAssets.reduce((total, asset) => total + Number(asset.byte_size), 0),
  };
}

export const getSiteSectionStatuses = cache(async (siteId: string): Promise<SiteSectionStatusMap | null> => {
  const site = siteId === "demo" && isDemoMode() ? demoSite : await getSite(siteId);
  if (!site) return null;

  if (siteId === "demo" && isDemoMode()) {
    return Object.fromEntries([...contentSections, ...publishSections].map((section) => [section.slug, section.status]));
  }

  const supabase = await createClient();
  const [draftResult, mediaResult, postsResult, domainsResult] = await Promise.all([
    supabase.from("site_drafts").select("content, seo, theme").eq("site_id", siteId).single(),
    supabase.from("media_assets").select("kind").eq("site_id", siteId).is("deleted_at", null),
    supabase.from("posts").select("status").eq("site_id", siteId),
    supabase.from("domains").select("status").eq("site_id", siteId),
  ]);

  return buildSiteSectionStatuses({
    content: draftResult.data?.content ?? {},
    domainStatuses: (domainsResult.data ?? []).map((domain) => domain.status),
    mediaKinds: (mediaResult.data ?? []).map((asset) => asset.kind),
    planCode: site.planCode,
    postStatuses: (postsResult.data ?? []).map((post) => post.status),
    seo: draftResult.data?.seo ?? {},
    siteStatus: site.status,
    theme: draftResult.data?.theme ?? {},
  });
});

export async function getSitePreviewData(siteId: string) {
  const site = siteId === "demo" && isDemoMode() ? demoSite : await getSite(siteId);
  if (!site) return null;

  if (siteId === "demo" && isDemoMode()) {
    return buildSitePreviewData(site, {
      content: {},
      gallery: [],
      media: [],
      posts: [],
      revision: 1,
      theme: { layout: defaultCampaignTheme.template, primaryColor: defaultCampaignTheme.color },
    });
  }

  const supabase = await createClient();
  const [{ data, error }, media, gallery, postsResult] = await Promise.all([
    supabase.from("site_drafts").select("content, theme, revision").eq("site_id", siteId).single(),
    getSiteMedia(siteId),
    getSiteGallery(siteId),
    supabase
      .from("posts")
      .select("id, title, excerpt, body, published_at, cover_asset_id")
      .eq("site_id", siteId)
      .eq("status", "published")
      .is("deleted_at", null)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(6),
  ]);

  const coverIds = (postsResult.data ?? []).flatMap((post) => post.cover_asset_id ? [post.cover_asset_id] : []);
  const { data: coverAssets } = coverIds.length
    ? await supabase.from("media_assets").select("id, storage_path, alt_text, width, height").in("id", coverIds).is("deleted_at", null)
    : { data: [] };
  const covers = new Map((await Promise.all((coverAssets ?? []).map(async (asset) => {
    const { data: signed } = await supabase.storage.from("candidate-media").createSignedUrl(asset.storage_path, 3600);
    return signed?.signedUrl ? [asset.id, { altText: asset.alt_text, height: asset.height ?? 1, previewUrl: signed.signedUrl, width: asset.width ?? 1 }] as const : null;
  }))).filter((entry): entry is NonNullable<typeof entry> => entry !== null));
  const posts = (postsResult.data ?? []).flatMap((post) => post.published_at ? [{
    bodyHtml: sanitizeRichText(readPostBodyHtml(post.body)),
    cover: post.cover_asset_id ? covers.get(post.cover_asset_id) ?? null : null,
    excerpt: post.excerpt,
    id: post.id,
    publishedAt: post.published_at,
    title: post.title,
  }] : []);

  return buildSitePreviewData(site, {
    content: error || !data ? {} : data.content,
    gallery: gallery?.assets.map(({ altText, caption, height, id, previewUrl, width }) => ({ altText, caption, height, id, previewUrl, width })) ?? [],
    media: media ?? [],
    posts,
    revision: error || !data ? 1 : Number(data.revision),
    theme: error || !data ? {} : data.theme,
  });
}
