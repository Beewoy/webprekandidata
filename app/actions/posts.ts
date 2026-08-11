"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { generateArticleSuggestion } from "@/lib/ai/article";
import { fingerprintAiPrompt } from "@/lib/ai/receipt";
import { requireCurrentUser } from "@/lib/data/sites";
import { isDemoMode } from "@/lib/env";
import type { ArticleSuggestion } from "@/lib/posts";
import { sanitizeRichText } from "@/lib/rich-text";
import { galleryLimits } from "@/lib/site-media";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createPostSchema, deletePostCoverSchema, deletePostSchema, generateArticleSchema, registerPostCoverSchema, savePostSchema } from "@/lib/validation/posts";

export type CreatePostResult = { ok: true; postId: string } | { ok: false; message: string };
export type SavePostResult = { ok: true; revision: number; publishedAt: string | null } | { ok: false; message: string; conflict?: boolean };
export type DeletePostResult = { ok: true } | { ok: false; message: string };
export type GenerateArticleResult = { ok: true; suggestion: ArticleSuggestion } | { ok: false; message: string; code?: "plus_required" | "quota_exceeded" };
export type PostCoverResult = { ok: true; cover: { altText: string; height: number; id: string; previewUrl: string; width: number } | null } | { ok: false; message: string };

function revalidatePostPaths(siteId: string, postId?: string) {
  revalidatePath(`/app/web/${siteId}`, "layout");
  revalidatePath(`/app/web/${siteId}/aktuality`);
  revalidatePath(`/app/web/${siteId}/nahlad`);
  if (postId) revalidatePath(`/app/web/${siteId}/aktuality/${postId}`);
}

export async function createPostAction(input: unknown): Promise<CreatePostResult> {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Projekt sa nepodarilo identifikovať." };
  if (parsed.data.siteId === "demo" && isDemoMode()) return { ok: true, postId: "demo-post" };
  if (isDemoMode()) return { ok: false, message: "Tento projekt nie je v ukážkovom režime dostupný." };
  await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_candidate_post", { p_site_id: parsed.data.siteId });
  if (error || typeof data !== "string") return { ok: false, message: error?.message.includes("post_limit_exceeded") ? "Projekt môže obsahovať najviac 100 článkov." : "Článok sa nepodarilo vytvoriť." };
  revalidatePostPaths(parsed.data.siteId, data);
  return { ok: true, postId: data };
}

export async function savePostAction(input: unknown): Promise<SavePostResult> {
  const parsed = savePostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Skontrolujte údaje článku." };
  if (parsed.data.siteId === "demo" && parsed.data.postId === "demo-post" && isDemoMode()) {
    return { ok: true, revision: parsed.data.revision + 1, publishedAt: parsed.data.status === "published" ? new Date().toISOString() : null };
  }
  if (isDemoMode()) return { ok: false, message: "Tento projekt nie je dostupný." };

  await requireCurrentUser();
  const supabase = await createClient();
  const { data: current, error: readError } = await supabase
    .from("posts")
    .select("published_at")
    .eq("id", parsed.data.postId)
    .eq("site_id", parsed.data.siteId)
    .is("deleted_at", null)
    .maybeSingle();
  if (readError || !current) return { ok: false, message: "Článok už neexistuje alebo k nemu nemáte prístup." };

  const nextRevision = parsed.data.revision + 1;
  const publishedAt = parsed.data.status === "published" ? current.published_at ?? new Date().toISOString() : current.published_at;
  const { data, error } = await supabase
    .from("posts")
    .update({
      body: { html: sanitizeRichText(parsed.data.bodyHtml) },
      excerpt: parsed.data.excerpt,
      published_at: publishedAt,
      revision: nextRevision,
      seo_description: parsed.data.seoDescription,
      seo_title: parsed.data.seoTitle,
      slug: parsed.data.slug,
      status: parsed.data.status,
      title: parsed.data.title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.postId)
    .eq("site_id", parsed.data.siteId)
    .eq("revision", parsed.data.revision)
    .is("deleted_at", null)
    .select("revision, published_at")
    .maybeSingle();

  if (error?.code === "23505") return { ok: false, message: "Túto adresu už používa iný článok." };
  if (error) return { ok: false, message: "Článok sa nepodarilo uložiť." };
  if (!data) return { ok: false, conflict: true, message: "Článok bol medzičasom upravený v inom okne. Obnovte stránku." };
  revalidatePostPaths(parsed.data.siteId, parsed.data.postId);
  return { ok: true, revision: Number(data.revision), publishedAt: data.published_at };
}

export async function deletePostAction(input: unknown): Promise<DeletePostResult> {
  const parsed = deletePostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Článok sa nepodarilo identifikovať." };
  if (parsed.data.siteId === "demo" && isDemoMode()) return { ok: true };
  if (isDemoMode()) return { ok: false, message: "Tento projekt nie je dostupný." };
  await requireCurrentUser();
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("cover_asset_id")
    .eq("id", parsed.data.postId)
    .eq("site_id", parsed.data.siteId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!post) return { ok: false, message: "Článok už neexistuje." };
  const { error } = await supabase.from("posts").update({ deleted_at: new Date().toISOString(), status: "archived" }).eq("id", parsed.data.postId).eq("site_id", parsed.data.siteId);
  if (error) return { ok: false, message: "Článok sa nepodarilo odstrániť." };
  if (post.cover_asset_id) {
    const { data: cover } = await supabase.from("media_assets").select("storage_path").eq("id", post.cover_asset_id).maybeSingle();
    await supabase.from("media_assets").update({ deleted_at: new Date().toISOString() }).eq("id", post.cover_asset_id);
    if (cover) await supabase.storage.from("candidate-media").remove([cover.storage_path]);
  }
  revalidatePostPaths(parsed.data.siteId);
  return { ok: true };
}

export async function generateArticleAction(input: unknown): Promise<GenerateArticleResult> {
  const parsed = generateArticleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Skontrolujte podklady." };
  if (isDemoMode()) return { ok: false, code: "plus_required", message: "AI tvorba článkov je dostupná po aktivácii balíka Plus." };
  const user = await requireCurrentUser();
  if (!process.env.OPENAI_API_KEY) return { ok: false, message: "AI služba zatiaľ nie je pripojená." };

  const supabase = await createClient();
  const { data: site } = await supabase.from("sites").select("candidate_name, locality").eq("id", parsed.data.siteId).is("deleted_at", null).maybeSingle();
  if (!site) return { ok: false, message: "Projekt sa nepodarilo overiť." };
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna";
  const fingerprint = fingerprintAiPrompt(JSON.stringify({ brief: parsed.data.brief, postId: parsed.data.postId, tone: parsed.data.tone }));
  if (!fingerprint) return { ok: false, message: "AI audit nie je nakonfigurovaný." };
  const { data: generationId, error: reserveError } = await supabase.rpc("reserve_post_ai_generation", {
    p_model: model,
    p_post_id: parsed.data.postId,
    p_prompt_fingerprint: fingerprint,
    p_site_id: parsed.data.siteId,
  });
  if (reserveError || typeof generationId !== "string") {
    if (reserveError?.message.includes("plus_required")) return { ok: false, code: "plus_required", message: "AI tvorba článkov je dostupná iba v zaplatenom balíku Plus." };
    if (reserveError?.message.includes("ai_quota_exceeded")) return { ok: false, code: "quota_exceeded", message: "Využili ste všetkých 20 AI návrhov pre tento projekt." };
    return { ok: false, message: "AI návrh sa teraz nedá spustiť. Skúste to znova." };
  }

  const admin = createAdminClient();
  try {
    const generated = await generateArticleSuggestion({
      brief: parsed.data.brief,
      candidateName: site.candidate_name,
      locality: site.locality,
      model,
      safetyIdentifier: createHash("sha256").update(`webprekandidata:${user.id}`).digest("hex"),
      tone: parsed.data.tone,
    });
    await admin.from("ai_generations").update({
      input_tokens: generated.inputTokens,
      output_tokens: generated.outputTokens,
      status: "completed",
    }).eq("id", generationId);
    return { ok: true, suggestion: generated.suggestion };
  } catch {
    await admin.from("ai_generations").update({ status: "failed" }).eq("id", generationId);
    return { ok: false, message: "AI návrh sa nepodarilo pripraviť. Podklady zostali v editore; skúste to znova neskôr." };
  }
}

export async function registerPostCoverAction(input: unknown): Promise<PostCoverResult> {
  const parsed = registerPostCoverSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Titulný obrázok nemá platné údaje." };
  if (isDemoMode()) return { ok: false, message: "V ukážkovom režime sa obrázky neukladajú." };
  const expectedPath = `${parsed.data.siteId}/${parsed.data.assetId}/post.webp`;
  if (parsed.data.storagePath !== expectedPath) return { ok: false, message: "Cesta obrázka nie je platná." };
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data: post } = await supabase.from("posts").select("cover_asset_id").eq("id", parsed.data.postId).eq("site_id", parsed.data.siteId).is("deleted_at", null).maybeSingle();
  if (!post) return { ok: false, message: "Článok sa nepodarilo overiť." };
  const { data: storedFile, error: storageError } = await supabase.storage.from("candidate-media").download(expectedPath);
  let validSignature = false;
  if (storedFile) {
    const bytes = new Uint8Array(await storedFile.slice(0, 12).arrayBuffer());
    validSignature = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  const storedSize = storedFile?.size ?? 0;
  if (storageError || !storedFile || !validSignature || storedSize <= 0 || storedSize > galleryLimits.maxSourceBytes) {
    await supabase.storage.from("candidate-media").remove([expectedPath]);
    return { ok: false, message: "Nahraný obrázok sa nepodarilo bezpečne overiť." };
  }

  const { data: activeAssets, error: assetsError } = await supabase.from("media_assets").select("id, byte_size").eq("site_id", parsed.data.siteId).is("deleted_at", null);
  const retainedStorage = (activeAssets ?? []).filter((asset) => asset.id !== post.cover_asset_id).reduce((total, asset) => total + Number(asset.byte_size), 0);
  if (assetsError || retainedStorage + storedSize > galleryLimits.maxProjectBytes) {
    await supabase.storage.from("candidate-media").remove([expectedPath]);
    return { ok: false, message: assetsError ? "Úložisko projektu sa nepodarilo skontrolovať." : "Obrázok sa nezmestí do 15 MB úložiska projektu." };
  }

  const { error: insertError } = await supabase.from("media_assets").insert({
    alt_text: parsed.data.altText,
    byte_size: storedSize,
    crop_metadata: {},
    height: parsed.data.height,
    id: parsed.data.assetId,
    kind: "post",
    mime_type: "image/webp",
    owner_user_id: user.id,
    site_id: parsed.data.siteId,
    storage_path: expectedPath,
    variants: { web: expectedPath },
    width: parsed.data.width,
  });
  if (insertError) {
    await supabase.storage.from("candidate-media").remove([expectedPath]);
    return { ok: false, message: "Obrázok sa nepodarilo priradiť k článku." };
  }
  const { error: postError } = await supabase.from("posts").update({ cover_asset_id: parsed.data.assetId, updated_at: new Date().toISOString() }).eq("id", parsed.data.postId).eq("site_id", parsed.data.siteId);
  if (postError) {
    await supabase.from("media_assets").update({ deleted_at: new Date().toISOString() }).eq("id", parsed.data.assetId);
    await supabase.storage.from("candidate-media").remove([expectedPath]);
    return { ok: false, message: "Článok sa nepodarilo aktualizovať." };
  }
  if (post.cover_asset_id) {
    const { data: previous } = await supabase.from("media_assets").select("storage_path").eq("id", post.cover_asset_id).maybeSingle();
    await supabase.from("media_assets").update({ deleted_at: new Date().toISOString() }).eq("id", post.cover_asset_id);
    if (previous) await supabase.storage.from("candidate-media").remove([previous.storage_path]);
  }
  const { data: signed } = await supabase.storage.from("candidate-media").createSignedUrl(expectedPath, 3600);
  if (!signed?.signedUrl) return { ok: false, message: "Obrázok je uložený, ale náhľad sa nepodarilo načítať." };
  revalidatePostPaths(parsed.data.siteId, parsed.data.postId);
  return { ok: true, cover: { altText: parsed.data.altText, height: parsed.data.height, id: parsed.data.assetId, previewUrl: signed.signedUrl, width: parsed.data.width } };
}

export async function deletePostCoverAction(input: unknown): Promise<PostCoverResult> {
  const parsed = deletePostCoverSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Článok sa nepodarilo identifikovať." };
  if (isDemoMode()) return { ok: false, message: "V ukážkovom režime sa obrázky neukladajú." };
  await requireCurrentUser();
  const supabase = await createClient();
  const { data: post } = await supabase.from("posts").select("cover_asset_id").eq("id", parsed.data.postId).eq("site_id", parsed.data.siteId).is("deleted_at", null).maybeSingle();
  if (!post?.cover_asset_id) return { ok: true, cover: null };
  const { data: asset } = await supabase.from("media_assets").select("storage_path").eq("id", post.cover_asset_id).maybeSingle();
  const { error } = await supabase.from("posts").update({ cover_asset_id: null, updated_at: new Date().toISOString() }).eq("id", parsed.data.postId).eq("site_id", parsed.data.siteId);
  if (error) return { ok: false, message: "Titulný obrázok sa nepodarilo odstrániť." };
  await supabase.from("media_assets").update({ deleted_at: new Date().toISOString() }).eq("id", post.cover_asset_id);
  if (asset) await supabase.storage.from("candidate-media").remove([asset.storage_path]);
  revalidatePostPaths(parsed.data.siteId, parsed.data.postId);
  return { ok: true, cover: null };
}
