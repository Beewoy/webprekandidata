import "server-only";

import { cache } from "react";
import { z } from "zod";
import { isDemoMode } from "@/lib/env";
import { getSite } from "@/lib/data/sites";
import { readPostBodyHtml } from "@/lib/posts";
import { buildPublicationFingerprint, getPublishReadiness, type PublicationPost, type PublishingState } from "@/lib/publishing";
import { sanitizeRichText } from "@/lib/rich-text";
import { createClient } from "@/lib/supabase/server";
import { callPublishingRpc } from "@/lib/supabase/publishing-rpc";

export type PublicationSourceAsset = {
  altText: string;
  caption: string;
  height: number;
  id: string;
  kind: string;
  sortOrder: number;
  storagePath: string;
  width: number;
};

export type PublicationSource = {
  assets: PublicationSourceAsset[];
  content: Record<string, unknown>;
  currentPublication: { publishedAt: string; sourceFingerprint: string; sourceRevision: number; versionNumber: number } | null;
  entitled: boolean;
  fingerprint: string;
  posts: PublicationPost[];
  revision: number;
  schemaVersion: number;
  seo: Record<string, unknown>;
  site: NonNullable<Awaited<ReturnType<typeof getSite>>>;
  theme: Record<string, unknown>;
};

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

const currentPublicationSchema = z.object({
  published_at: z.string(),
  source_fingerprint: z.string(),
  source_revision: z.coerce.number().int().positive(),
  version_number: z.number().int().positive(),
});

export async function loadPublicationSource(siteId: string): Promise<PublicationSource | null> {
  if (isDemoMode()) return null;
  const site = await getSite(siteId);
  if (!site) return null;
  const supabase = await createClient();

  const [draftResult, postsResult, assetsResult, entitlementResult, publicationResult] = await Promise.all([
    supabase.from("site_drafts").select("content, theme, seo, revision, schema_version").eq("site_id", siteId).single(),
    supabase
      .from("posts")
      .select("id, title, excerpt, body, published_at, cover_asset_id")
      .eq("site_id", siteId)
      .eq("status", "published")
      .is("deleted_at", null)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false }),
    supabase
      .from("media_assets")
      .select("id, kind, storage_path, alt_text, caption, width, height, sort_order")
      .eq("site_id", siteId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    callPublishingRpc(supabase, "has_publish_entitlement", { p_site_id: siteId }),
    site.currentPublicationId
      ? supabase
        .from("site_publications")
        .select("*")
        .eq("id", site.currentPublicationId)
        .eq("site_id", siteId)
        .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (draftResult.error || !draftResult.data || postsResult.error || assetsResult.error || entitlementResult.error || publicationResult.error) {
    throw new Error("Podklady na publikovanie sa nepodarilo načítať.");
  }

  const posts: PublicationPost[] = (postsResult.data ?? []).flatMap((post) => post.published_at ? [{
    bodyHtml: sanitizeRichText(readPostBodyHtml(post.body)),
    coverAssetId: post.cover_asset_id,
    excerpt: post.excerpt.trim(),
    id: post.id,
    publishedAt: post.published_at,
    title: post.title.trim(),
  }] : []);
  const coverIds = new Set(posts.flatMap((post) => post.coverAssetId ? [post.coverAssetId] : []));
  const assets: PublicationSourceAsset[] = (assetsResult.data ?? [])
    .filter((asset) => ["logo", "hero", "about", "social", "gallery"].includes(asset.kind) || coverIds.has(asset.id))
    .map((asset, index) => ({
      altText: asset.alt_text,
      caption: asset.caption ?? "",
      height: asset.height ?? 1,
      id: asset.id,
      kind: asset.kind,
      sortOrder: asset.sort_order ?? index,
      storagePath: asset.storage_path,
      width: asset.width ?? 1,
    }));
  const content = objectValue(draftResult.data.content);
  const theme = objectValue(draftResult.data.theme);
  const seo = objectValue(draftResult.data.seo);
  const revision = Number(draftResult.data.revision);
  const fingerprint = buildPublicationFingerprint({
    assets,
    content,
    posts,
    seo,
    site: { candidateName: site.candidateName, locality: site.locality, slug: site.slug },
    theme,
  });

  const currentPublication = currentPublicationSchema.safeParse(publicationResult.data);

  return {
    assets,
    content,
    currentPublication: currentPublication.success ? {
      publishedAt: currentPublication.data.published_at,
      sourceFingerprint: currentPublication.data.source_fingerprint,
      sourceRevision: currentPublication.data.source_revision,
      versionNumber: currentPublication.data.version_number,
    } : null,
    entitled: z.boolean().safeParse(entitlementResult.data).data === true,
    fingerprint,
    posts,
    revision,
    schemaVersion: draftResult.data.schema_version,
    seo,
    site,
    theme,
  };
}

export const getPublishingState = cache(async (siteId: string): Promise<PublishingState | null> => {
  if (siteId === "demo" && isDemoMode()) {
    return {
      currentPublication: null,
      entitled: false,
      hasUnpublishedChanges: false,
      planCode: null,
      publicPath: "/demo",
      readiness: { blockers: [], ready: true, warnings: [] },
      siteStatus: "draft",
    };
  }
  const source = await loadPublicationSource(siteId);
  if (!source) return null;
  const readiness = getPublishReadiness({ content: source.content, mediaKinds: source.assets.map((asset) => asset.kind), seo: source.seo });

  return {
    currentPublication: source.currentPublication ? {
      publishedAt: source.currentPublication.publishedAt,
      sourceRevision: source.currentPublication.sourceRevision,
      versionNumber: source.currentPublication.versionNumber,
    } : null,
    entitled: source.entitled,
    hasUnpublishedChanges: Boolean(source.currentPublication && source.currentPublication.sourceFingerprint !== source.fingerprint),
    planCode: source.site.planCode,
    publicPath: `/${source.site.slug}`,
    readiness,
    siteStatus: source.site.status,
  };
});
