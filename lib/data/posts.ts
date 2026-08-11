import { isDemoMode } from "@/lib/env";
import { getSite } from "@/lib/data/sites";
import { readPostBodyHtml, type PostAiEntitlement, type PostDetail, type PostSummary } from "@/lib/posts";
import { createClient } from "@/lib/supabase/server";

const demoPost: PostDetail = {
  bodyHtml: "<p>Vitajte pri príprave vašej prvej aktuality. Text môžete upraviť a uložiť ako koncept.</p>",
  cover: null,
  excerpt: "Pracovná ukážka článku v editore.",
  id: "demo-post",
  publishedAt: null,
  revision: 1,
  seoDescription: "Pracovná ukážka článku v editore.",
  seoTitle: "Prvá aktualita",
  slug: "prva-aktualita",
  status: "draft",
  title: "Prvá aktualita",
  updatedAt: new Date().toISOString(),
};

export type SitePostsData = {
  ai: PostAiEntitlement;
  posts: PostSummary[];
};

export async function getSitePosts(siteId: string): Promise<SitePostsData | null> {
  if (siteId === "demo" && isDemoMode()) return { ai: { canUseAi: false, limit: 20, used: 0 }, posts: [] };
  if (isDemoMode()) return null;
  const site = await getSite(siteId);
  if (!site) return null;
  const supabase = await createClient();
  const [postsResult, entitlementResult, usageResult] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, slug, excerpt, status, published_at, updated_at")
      .eq("site_id", siteId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
    supabase.rpc("has_plus_entitlement", { p_site_id: siteId }),
    supabase
      .from("ai_generations")
      .select("id", { count: "exact", head: true })
      .eq("site_id", siteId)
      .eq("task_type", "article_draft")
      .in("status", ["requested", "completed"]),
  ]);
  if (postsResult.error) throw new Error("Aktuality sa nepodarilo načítať.");
  return {
    ai: { canUseAi: entitlementResult.data === true, limit: 20, used: usageResult.count ?? 0 },
    posts: (postsResult.data ?? []).map((post) => ({
      excerpt: post.excerpt,
      id: post.id,
      publishedAt: post.published_at,
      slug: post.slug,
      status: post.status,
      title: post.title,
      updatedAt: post.updated_at,
    })),
  };
}

export async function getSitePost(siteId: string, postId: string): Promise<{ ai: PostAiEntitlement; post: PostDetail } | null> {
  if (siteId === "demo" && postId === "demo-post" && isDemoMode()) return { ai: { canUseAi: false, limit: 20, used: 0 }, post: demoPost };
  if (isDemoMode()) return null;
  const siteData = await getSitePosts(siteId);
  if (!siteData) return null;
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, body, cover_asset_id, status, published_at, created_at, updated_at, revision, seo_title, seo_description")
    .eq("id", postId)
    .eq("site_id", siteId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !post) return null;

  let cover: PostDetail["cover"] = null;
  if (post.cover_asset_id) {
    const { data: asset } = await supabase
      .from("media_assets")
      .select("id, storage_path, alt_text, width, height")
      .eq("id", post.cover_asset_id)
      .is("deleted_at", null)
      .maybeSingle();
    if (asset) {
      const { data: signed } = await supabase.storage.from("candidate-media").createSignedUrl(asset.storage_path, 3600);
      if (signed?.signedUrl) cover = {
        altText: asset.alt_text,
        height: asset.height ?? 1,
        id: asset.id,
        previewUrl: signed.signedUrl,
        width: asset.width ?? 1,
      };
    }
  }

  return {
    ai: siteData.ai,
    post: {
      bodyHtml: readPostBodyHtml(post.body),
      cover,
      excerpt: post.excerpt,
      id: post.id,
      publishedAt: post.published_at,
      revision: Number(post.revision),
      seoDescription: post.seo_description,
      seoTitle: post.seo_title,
      slug: post.slug,
      status: post.status,
      title: post.title,
      updatedAt: post.updated_at,
    },
  };
}
