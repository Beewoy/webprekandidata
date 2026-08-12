"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/env";
import { requireCurrentUser } from "@/lib/data/sites";
import { createClient } from "@/lib/supabase/server";
import { sanitizeSectionRichText } from "@/lib/rich-text";
import {
  createSiteSchema,
  deleteGalleryAssetSchema,
  registerGalleryAssetSchema,
  registerMediaAssetSchema,
  reorderGalleryAssetsSchema,
  saveSectionSchema,
  saveThemeSchema,
  updateGalleryAssetSchema,
  type SiteActionState,
} from "@/lib/validation/site";
import { normalizeCampaignColor } from "@/lib/site-theme";
import { galleryLimits, type GalleryMediaAsset } from "@/lib/site-media";
import {
  draftConflictKey,
  isDraftSaveCoolingDown,
  markDraftRevisionConflict,
} from "@/lib/draft-save-guard";
import { z } from "zod";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function createSiteAction(_previousState: SiteActionState, formData: FormData): Promise<SiteActionState> {
  const parsed = createSiteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", errors: parsed.error.flatten().fieldErrors };
  if (isDemoMode()) redirect("/app/web/demo");

  await requireCurrentUser();
  const supabase = await createClient();
  const baseSlug = slugify(parsed.data.candidateName) || `kandidat-${Date.now()}`;
  const { data, error } = await supabase.rpc("create_candidate_site", {
    p_internal_name: parsed.data.internalName,
    p_candidate_name: parsed.data.candidateName,
    p_locality: parsed.data.locality,
    p_position: parsed.data.position,
    p_slug: baseSlug,
  });

  if (error || typeof data !== "string") {
    return { status: "error", message: "Projekt sa nepodarilo vytvoriť. Skúste použiť iné meno alebo to zopakujte neskôr." };
  }

  redirect(`/app/web/${data}`);
}

export type SaveSectionResult =
  | { ok: true; revision: number }
  | { ok: false; message: string; conflict?: boolean; currentRevision?: number };
export type SaveThemeResult = SaveSectionResult;

const CONFLICT_MESSAGE = "Obsah bol medzičasom upravený v inom okne. Obnovte stránku.";
const THEME_CONFLICT_MESSAGE = "Vzhľad bol medzičasom upravený v inom okne. Obnovte stránku.";
const COOLDOWN_MESSAGE = "Ukladanie je dočasne pozastavené po konflikte revízie. Obnovte stránku.";

const updateSiteSectionResultSchema = z.object({
  ok: z.boolean(),
  conflict: z.boolean().optional(),
  cooldown: z.boolean().optional(),
  revision: z.coerce.number().int().nonnegative(),
});

async function readCurrentDraftRevision(
  supabase: Awaited<ReturnType<typeof createClient>>,
  siteId: string,
): Promise<number | undefined> {
  const { data } = await supabase.from("site_drafts").select("revision").eq("site_id", siteId).maybeSingle();
  const revision = data ? Number(data.revision) : NaN;
  return Number.isSafeInteger(revision) && revision > 0 ? revision : undefined;
}
export type RegisterMediaAssetResult = { ok: true; asset: { altText: string; createdAt: string; height: number; id: string; kind: "logo" | "hero" | "about" | "social"; previewUrl: string; width: number } } | { ok: false; message: string };
export type RegisterGalleryAssetResult = { ok: true; asset: GalleryMediaAsset } | { ok: false; message: string };
export type GalleryMutationResult = { ok: true } | { ok: false; message: string };
export type DeleteGalleryAssetResult = { ok: true; reclaimedBytes: number } | { ok: false; message: string };

export async function saveSectionAction(input: unknown): Promise<SaveSectionResult> {
  const parsed = saveSectionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Niektoré údaje nemajú správny formát." };
  if (parsed.data.siteId === "demo" && isDemoMode()) return { ok: true, revision: parsed.data.revision + 1 };
  if (isDemoMode()) return { ok: false, message: "Tento projekt nie je v demo režime dostupný." };

  const user = await requireCurrentUser();
  const guardKey = draftConflictKey(parsed.data.siteId, user.id);
  if (isDraftSaveCoolingDown(guardKey)) {
    console.warn("update_site_section blocked by conflict cooldown", {
      siteId: parsed.data.siteId,
      sectionSlug: parsed.data.sectionSlug,
      revision: parsed.data.revision,
      userId: user.id,
    });
    return { ok: false, conflict: true, message: COOLDOWN_MESSAGE };
  }

  const supabase = await createClient();
  const values = sanitizeSectionRichText(parsed.data.sectionSlug, parsed.data.values);
  const { data, error } = await supabase.rpc("update_site_section", {
    p_site_id: parsed.data.siteId,
    p_section_key: parsed.data.sectionSlug,
    p_payload: values,
    p_expected_revision: parsed.data.revision,
  });

  if (error) {
    // Legacy path while older function builds still raise 40001.
    const conflict = error.code === "40001" || error.message.includes("revision_conflict");
    let currentRevision: number | undefined;
    if (conflict) {
      currentRevision = await readCurrentDraftRevision(supabase, parsed.data.siteId);
      markDraftRevisionConflict(guardKey);
    }

    console.error("update_site_section failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      siteId: parsed.data.siteId,
      sectionSlug: parsed.data.sectionSlug,
      revision: parsed.data.revision,
      currentRevision,
      conflict,
      userId: user.id,
    });

    return {
      ok: false,
      conflict,
      currentRevision,
      message: conflict ? CONFLICT_MESSAGE : "Zmeny sa nepodarilo uložiť. Skúste to znova.",
    };
  }

  // Legacy bigint return from pre-0022 function builds.
  if (typeof data === "number" && Number.isSafeInteger(data) && data >= 1) {
    revalidatePath(`/app/web/${parsed.data.siteId}`, "layout");
    return { ok: true, revision: data };
  }

  const result = updateSiteSectionResultSchema.safeParse(data);
  if (!result.success) {
    console.error("update_site_section returned unexpected payload", {
      data,
      siteId: parsed.data.siteId,
      sectionSlug: parsed.data.sectionSlug,
      revision: parsed.data.revision,
      userId: user.id,
    });
    return { ok: false, message: "Zmeny sa nepodarilo uložiť. Skúste to znova." };
  }

  if (!result.data.ok || result.data.conflict) {
    const currentRevision = result.data.revision > 0 ? result.data.revision : undefined;
    markDraftRevisionConflict(guardKey);
    console.warn("update_site_section revision_conflict", {
      siteId: parsed.data.siteId,
      sectionSlug: parsed.data.sectionSlug,
      revision: parsed.data.revision,
      currentRevision,
      cooldown: result.data.cooldown === true,
      userId: user.id,
    });
    return {
      ok: false,
      conflict: true,
      currentRevision,
      message: result.data.cooldown ? COOLDOWN_MESSAGE : CONFLICT_MESSAGE,
    };
  }

  if (result.data.revision < 1) {
    return { ok: false, message: "Zmeny sa nepodarilo uložiť. Skúste to znova." };
  }

  revalidatePath(`/app/web/${parsed.data.siteId}`, "layout");

  return { ok: true, revision: result.data.revision };
}

export async function saveThemeAction(input: unknown): Promise<SaveThemeResult> {
  const parsed = saveThemeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Vyberte platnú šablónu a šesťmiestnu HEX farbu." };
  if (parsed.data.siteId === "demo" && isDemoMode()) return { ok: true, revision: parsed.data.revision + 1 };
  if (isDemoMode()) return { ok: false, message: "Tento projekt nie je v demo režime dostupný." };

  const user = await requireCurrentUser();
  const guardKey = draftConflictKey(parsed.data.siteId, user.id);
  if (isDraftSaveCoolingDown(guardKey)) {
    console.warn("saveThemeAction blocked by conflict cooldown", {
      siteId: parsed.data.siteId,
      revision: parsed.data.revision,
      userId: user.id,
    });
    return { ok: false, conflict: true, message: COOLDOWN_MESSAGE };
  }

  const supabase = await createClient();
  const nextRevision = parsed.data.revision + 1;
  const { data, error } = await supabase
    .from("site_drafts")
    .update({
      revision: nextRevision,
      theme: {
        layout: parsed.data.theme.template,
        primaryColor: normalizeCampaignColor(parsed.data.theme.color),
      },
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("site_id", parsed.data.siteId)
    .eq("revision", parsed.data.revision)
    .select("revision")
    .maybeSingle();

  if (error) {
    console.error("saveThemeAction failed", {
      code: error.code,
      message: error.message,
      siteId: parsed.data.siteId,
      revision: parsed.data.revision,
      userId: user.id,
    });
    return { ok: false, message: "Vzhľad sa nepodarilo uložiť. Skúste to znova." };
  }

  if (!data) {
    const currentRevision = await readCurrentDraftRevision(supabase, parsed.data.siteId);
    markDraftRevisionConflict(guardKey);
    console.warn("saveThemeAction revision_conflict", {
      siteId: parsed.data.siteId,
      revision: parsed.data.revision,
      currentRevision,
      userId: user.id,
    });
    return { ok: false, conflict: true, currentRevision, message: THEME_CONFLICT_MESSAGE };
  }

  revalidatePath(`/app/web/${parsed.data.siteId}`, "layout");
  revalidatePath(`/app/web/${parsed.data.siteId}/nahlad`);
  return { ok: true, revision: Number(data.revision) };
}

export async function registerMediaAssetAction(input: unknown): Promise<RegisterMediaAssetResult> {
  const parsed = registerMediaAssetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Obrázok nemá platné údaje. Vyberte ho znova." };
  if (parsed.data.siteId === "demo" && isDemoMode()) return { ok: false, message: "V ukážkovom režime sa obrázky neukladajú do cloudu." };
  if (isDemoMode()) return { ok: false, message: "Tento projekt nie je v demo režime dostupný." };

  const expectedPath = `${parsed.data.siteId}/${parsed.data.assetId}/${parsed.data.kind}.webp`;
  if (parsed.data.storagePath !== expectedPath) return { ok: false, message: "Cesta obrázka nie je platná." };

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data: site } = await supabase.from("sites").select("id").eq("id", parsed.data.siteId).is("deleted_at", null).maybeSingle();
  if (!site) return { ok: false, message: "Projekt sa nepodarilo overiť." };

  const { data: storedFile, error: storageError } = await supabase.storage.from("candidate-media").download(expectedPath);
  let hasWebpSignature = false;
  if (storedFile) {
    try {
      const bytes = new Uint8Array(await storedFile.slice(0, 12).arrayBuffer());
      hasWebpSignature = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
        && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
    } catch {
      hasWebpSignature = false;
    }
  }
  const storedSize = storedFile?.size ?? 0;
  if (storageError || !storedFile || storedSize <= 0 || storedSize > 15 * 1024 * 1024 || !hasWebpSignature) {
    await supabase.storage.from("candidate-media").remove([expectedPath]);
    return { ok: false, message: "Nahraný súbor sa nepodarilo bezpečne overiť." };
  }

  const { data: activeAssets, error: assetsError } = await supabase
    .from("media_assets")
    .select("byte_size, kind")
    .eq("site_id", parsed.data.siteId)
    .is("deleted_at", null);
  const retainedStorage = (activeAssets ?? [])
    .filter((asset) => asset.kind !== parsed.data.kind)
    .reduce((total, asset) => total + Number(asset.byte_size), 0);
  if (assetsError || retainedStorage + storedSize > galleryLimits.maxProjectBytes) {
    await supabase.storage.from("candidate-media").remove([expectedPath]);
    return { ok: false, message: assetsError ? "Úložisko projektu sa nepodarilo skontrolovať." : "Obrázok sa nezmestí do 15 MB úložiska projektu." };
  }

  const createdAt = new Date().toISOString();
  const { error: insertError } = await supabase.from("media_assets").insert({
    alt_text: parsed.data.altText,
    byte_size: storedSize,
    crop_metadata: parsed.data.crop,
    height: parsed.data.height,
    id: parsed.data.assetId,
    kind: parsed.data.kind,
    mime_type: "image/webp",
    owner_user_id: user.id,
    site_id: parsed.data.siteId,
    storage_path: expectedPath,
    variants: { web: expectedPath },
    width: parsed.data.width,
  });

  if (insertError) {
    await supabase.storage.from("candidate-media").remove([expectedPath]);
    return { ok: false, message: "Obrázok sa nepodarilo priradiť k projektu." };
  }

  await supabase
    .from("media_assets")
    .update({ deleted_at: createdAt })
    .eq("site_id", parsed.data.siteId)
    .eq("kind", parsed.data.kind)
    .is("deleted_at", null)
    .neq("id", parsed.data.assetId);

  const { data: signed } = await supabase.storage.from("candidate-media").createSignedUrl(expectedPath, 3600);

  revalidatePath(`/app/web/${parsed.data.siteId}`, "layout");
  revalidatePath(`/app/web/${parsed.data.siteId}/nahlad`);

  return {
    ok: true,
    asset: {
      altText: parsed.data.altText,
      createdAt,
      height: parsed.data.height,
      id: parsed.data.assetId,
      kind: parsed.data.kind,
      previewUrl: signed?.signedUrl ?? "",
      width: parsed.data.width,
    },
  };
}

export async function registerGalleryAssetAction(input: unknown): Promise<RegisterGalleryAssetResult> {
  const parsed = registerGalleryAssetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Fotografia nemá platné údaje. Vyberte ju znova." };
  if (isDemoMode()) return { ok: false, message: "V ukážkovom režime sa galéria neukladá do cloudu." };

  const expectedPath = `${parsed.data.siteId}/${parsed.data.assetId}/gallery.webp`;
  if (parsed.data.storagePath !== expectedPath) return { ok: false, message: "Cesta fotografie nie je platná." };

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data: storedFile, error: storageError } = await supabase.storage.from("candidate-media").download(expectedPath);
  let hasWebpSignature = false;
  if (storedFile) {
    try {
      const bytes = new Uint8Array(await storedFile.slice(0, 12).arrayBuffer());
      hasWebpSignature = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
        && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
    } catch {
      hasWebpSignature = false;
    }
  }
  const storedSize = storedFile?.size ?? 0;
  if (storageError || !storedFile || storedSize <= 0 || storedSize > galleryLimits.maxSourceBytes || !hasWebpSignature) {
    await supabase.storage.from("candidate-media").remove([expectedPath]);
    return { ok: false, message: "Nahranú fotografiu sa nepodarilo bezpečne overiť." };
  }

  const { data: activeAssets, error: assetsError } = await supabase
    .from("media_assets")
    .select("byte_size, kind, sort_order")
    .eq("site_id", parsed.data.siteId)
    .is("deleted_at", null);
  if (assetsError) {
    await supabase.storage.from("candidate-media").remove([expectedPath]);
    return { ok: false, message: "Úložisko projektu sa nepodarilo skontrolovať." };
  }

  const galleryAssets = (activeAssets ?? []).filter((asset) => asset.kind === "gallery");
  const storageUsed = (activeAssets ?? []).reduce((total, asset) => total + Number(asset.byte_size), 0);
  if (galleryAssets.length >= galleryLimits.maxAssets) {
    await supabase.storage.from("candidate-media").remove([expectedPath]);
    return { ok: false, message: `Galéria môže obsahovať najviac ${galleryLimits.maxAssets} fotografií.` };
  }
  if (storageUsed + storedSize > galleryLimits.maxProjectBytes) {
    await supabase.storage.from("candidate-media").remove([expectedPath]);
    return { ok: false, message: "Fotografia sa nezmestí do 15 MB úložiska projektu. Odstráňte niektorý starší obrázok." };
  }

  const sortOrder = galleryAssets.reduce((maximum, asset) => Math.max(maximum, asset.sort_order ?? -1), -1) + 1;
  const createdAt = new Date().toISOString();
  const altText = parsed.data.caption || "Fotografia z kampane";
  const { error: insertError } = await supabase.from("media_assets").insert({
    alt_text: altText,
    byte_size: storedSize,
    caption: parsed.data.caption,
    crop_metadata: {},
    height: parsed.data.height,
    id: parsed.data.assetId,
    kind: "gallery",
    mime_type: "image/webp",
    owner_user_id: user.id,
    site_id: parsed.data.siteId,
    sort_order: sortOrder,
    storage_path: expectedPath,
    variants: { web: expectedPath },
    width: parsed.data.width,
  });
  if (insertError) {
    await supabase.storage.from("candidate-media").remove([expectedPath]);
    return { ok: false, message: "Fotografiu sa nepodarilo pridať do galérie." };
  }

  const { data: signed } = await supabase.storage.from("candidate-media").createSignedUrl(expectedPath, 3600);
  if (!signed?.signedUrl) return { ok: false, message: "Fotografia je uložená, ale jej náhľad sa nepodarilo načítať." };

  revalidatePath(`/app/web/${parsed.data.siteId}`, "layout");
  revalidatePath(`/app/web/${parsed.data.siteId}/nahlad`);
  return {
    ok: true,
    asset: {
      altText,
      byteSize: storedSize,
      caption: parsed.data.caption,
      createdAt,
      height: parsed.data.height,
      id: parsed.data.assetId,
      previewUrl: signed.signedUrl,
      sortOrder,
      width: parsed.data.width,
    },
  };
}

export async function updateGalleryAssetAction(input: unknown): Promise<GalleryMutationResult> {
  const parsed = updateGalleryAssetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Titulok môže mať najviac 160 znakov." };
  if (isDemoMode()) return { ok: false, message: "V ukážkovom režime sa galéria neukladá." };
  await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .update({ alt_text: parsed.data.caption || "Fotografia z kampane", caption: parsed.data.caption })
    .eq("id", parsed.data.assetId)
    .eq("site_id", parsed.data.siteId)
    .eq("kind", "gallery")
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();
  if (error || !data) return { ok: false, message: "Titulok sa nepodarilo uložiť." };
  revalidatePath(`/app/web/${parsed.data.siteId}/nahlad`);
  return { ok: true };
}

export async function reorderGalleryAssetsAction(input: unknown): Promise<GalleryMutationResult> {
  const parsed = reorderGalleryAssetsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Poradie galérie nie je platné." };
  if (isDemoMode()) return { ok: false, message: "V ukážkovom režime sa galéria neukladá." };
  await requireCurrentUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_gallery_assets", { p_asset_ids: parsed.data.assetIds, p_site_id: parsed.data.siteId });
  if (error) return { ok: false, message: "Poradie fotografií sa nepodarilo uložiť." };
  revalidatePath(`/app/web/${parsed.data.siteId}/nahlad`);
  return { ok: true };
}

export async function deleteGalleryAssetAction(input: unknown): Promise<DeleteGalleryAssetResult> {
  const parsed = deleteGalleryAssetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Fotografiu sa nepodarilo identifikovať." };
  if (isDemoMode()) return { ok: false, message: "V ukážkovom režime sa galéria neukladá." };
  await requireCurrentUser();
  const supabase = await createClient();
  const { data: asset, error: readError } = await supabase
    .from("media_assets")
    .select("storage_path, byte_size")
    .eq("id", parsed.data.assetId)
    .eq("site_id", parsed.data.siteId)
    .eq("kind", "gallery")
    .is("deleted_at", null)
    .maybeSingle();
  if (readError || !asset) return { ok: false, message: "Fotografia už neexistuje alebo k nej nemáte prístup." };

  const { error: updateError } = await supabase.from("media_assets").update({ deleted_at: new Date().toISOString() }).eq("id", parsed.data.assetId);
  if (updateError) return { ok: false, message: "Fotografiu sa nepodarilo odstrániť." };
  await supabase.storage.from("candidate-media").remove([asset.storage_path]);

  revalidatePath(`/app/web/${parsed.data.siteId}`, "layout");
  revalidatePath(`/app/web/${parsed.data.siteId}/nahlad`);
  return { ok: true, reclaimedBytes: Number(asset.byte_size) };
}
