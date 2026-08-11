import "server-only";

import { cache } from "react";
import { z } from "zod";
import { parsePublicationMedia, parsePublicationPosts } from "@/lib/publishing";
import { buildSitePreviewData, type SitePreviewData, type SitePreviewPost } from "@/lib/site-preview-model";
import type { GalleryMediaAsset, SiteMediaAsset } from "@/lib/site-media";
import { isMediaKind } from "@/lib/site-media";
import { createAdminClient } from "@/lib/supabase/admin";

const slugSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const publicationSchema = z.object({
  content: z.record(z.string(), z.unknown()),
  media_manifest: z.unknown(),
  posts: z.unknown(),
  published_at: z.string(),
  seo: z.record(z.string(), z.unknown()),
  source_revision: z.coerce.number().int().positive(),
  theme: z.record(z.string(), z.unknown()),
  version_number: z.number().int().positive(),
});

export type PublicCandidateSite = {
  data: SitePreviewData;
  description: string;
  publishedAt: string;
  siteId: string;
  socialImageUrl: string | null;
  title: string;
  versionNumber: number;
};

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function plainText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maximum) : "";
}

export const getPublicCandidateSite = cache(async (rawSlug: string): Promise<PublicCandidateSite | null> => {
  const parsedSlug = slugSchema.safeParse(rawSlug);
  if (!parsedSlug.success) return null;

  const admin = createAdminClient();
  const { data: site, error: siteError } = await admin
    .from("sites")
    .select("id, candidate_name, locality, slug, status, current_publication_id")
    .eq("slug", parsedSlug.data)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();

  if (siteError || !site?.current_publication_id) return null;

  const { data: publicationRow, error: publicationError } = await admin
    .from("site_publications")
    .select("*")
    .eq("id", site.current_publication_id)
    .eq("site_id", site.id)
    .is("unpublished_at", null)
    .maybeSingle();

  const parsedPublication = publicationSchema.safeParse(publicationRow);
  if (publicationError || !parsedPublication.success) return null;
  const publication = parsedPublication.data;

  const manifest = parsePublicationMedia(publication.media_manifest);
  const publicUrl = (storagePath: string) => admin.storage.from("published-media").getPublicUrl(storagePath).data.publicUrl;
  const media: SiteMediaAsset[] = manifest.flatMap((asset) => isMediaKind(asset.kind) ? [{
    altText: asset.altText,
    createdAt: publication.published_at,
    height: asset.height,
    id: asset.assetId,
    kind: asset.kind,
    previewUrl: publicUrl(asset.storagePath),
    width: asset.width,
  }] : []);
  const gallery: GalleryMediaAsset[] = manifest
    .filter((asset) => asset.kind === "gallery")
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((asset) => ({
      altText: asset.altText,
      byteSize: 0,
      caption: asset.caption,
      createdAt: publication.published_at,
      height: asset.height,
      id: asset.assetId,
      previewUrl: publicUrl(asset.storagePath),
      sortOrder: asset.sortOrder,
      width: asset.width,
    }));
  const postCovers = new Map(manifest
    .filter((asset) => asset.kind === "post")
    .map((asset) => [asset.assetId, asset]));
  const posts: SitePreviewPost[] = parsePublicationPosts(publication.posts).map((post) => {
    const cover = post.coverAssetId ? postCovers.get(post.coverAssetId) : null;
    return {
      bodyHtml: post.bodyHtml,
      cover: cover ? {
        altText: cover.altText,
        height: cover.height,
        previewUrl: publicUrl(cover.storagePath),
        width: cover.width,
      } : null,
      excerpt: post.excerpt,
      id: post.id,
      publishedAt: post.publishedAt,
      title: post.title,
    };
  });
  const seo = objectValue(publication.seo);
  const title = plainText(seo.title, 70) || `${site.candidate_name} – kandidát`;
  const description = plainText(seo.description, 180) || `Oficiálna stránka kandidáta ${site.candidate_name}.`;
  const socialAsset = manifest.findLast((asset) => asset.kind === "social");

  return {
    data: buildSitePreviewData(
      { candidateName: site.candidate_name, locality: site.locality, slug: site.slug },
      {
        content: publication.content,
        gallery,
        media,
        posts,
        revision: Number(publication.source_revision),
        theme: publication.theme,
      },
    ),
    description,
    publishedAt: publication.published_at,
    siteId: site.id,
    socialImageUrl: socialAsset ? publicUrl(socialAsset.storagePath) : null,
    title,
    versionNumber: publication.version_number,
  };
});
