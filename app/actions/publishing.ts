"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireVerifiedUser } from "@/lib/data/email-verification-gate";
import { loadPublicationSource } from "@/lib/data/publishing";
import { getCurrentUser } from "@/lib/data/sites";
import { isDemoMode } from "@/lib/env";
import { evaluateLegalLaunchGate, formatLegalLaunchGateMessage } from "@/lib/legal/launch-gate";
import { getPublishReadiness, type PublicationMediaItem } from "@/lib/publishing";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { callPublishingRpc } from "@/lib/supabase/publishing-rpc";

const siteIdSchema = z.string().uuid();

export type PublishSiteResult = {
  message: string;
  ok: boolean;
  publicPath?: string;
  versionNumber?: number;
};

function publicationResult(value: unknown) {
  const parsed = z.object({
    publication_id: z.string().uuid(),
    published_at: z.string(),
    version_number: z.number().int().positive(),
  }).safeParse(value);
  return parsed.success ? parsed.data : null;
}

export async function publishSiteAction(input: unknown): Promise<PublishSiteResult> {
  const parsed = z.object({ siteId: siteIdSchema }).safeParse(input);
  if (!parsed.success) return { ok: false, message: "Projekt nemá platný identifikátor." };
  if (isDemoMode()) return { ok: false, message: "Publikovanie je dostupné po pripojení projektu k databáze." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Pred publikovaním sa musíte prihlásiť." };
  const verification = await requireVerifiedUser(user.id);
  if (!verification.ok) return { ok: false, message: verification.message };

  const source = await loadPublicationSource(parsed.data.siteId);
  if (!source) return { ok: false, message: "Projekt sa nepodarilo overiť." };
  const readiness = getPublishReadiness({ content: source.content, mediaKinds: source.assets.map((asset) => asset.kind), seo: source.seo });
  if (!readiness.ready) return { ok: false, message: `Pred zverejnením dokončite: ${readiness.blockers.map((issue) => issue.label).join(", ")}.` };
  if (!source.entitled) return { ok: false, message: "Publikovanie vyžaduje platný balík Basic alebo Plus." };

  const legalGate = evaluateLegalLaunchGate({ requireDocumentsApproved: true });
  if (!legalGate.ok) {
    return {
      ok: false,
      message: formatLegalLaunchGateMessage(legalGate)
        ?? "Publikovanie je dočasne zablokované právnou konfiguráciou.",
    };
  }

  if (source.currentPublication?.sourceFingerprint === source.fingerprint && source.site.status === "published") {
    return {
      ok: true,
      message: "Verejný web už používa najnovšiu verziu.",
      publicPath: `/${source.site.slug}`,
      versionNumber: source.currentPublication.versionNumber,
    };
  }

  const publicationId = randomUUID();
  const admin = createAdminClient();
  const copiedPaths: string[] = [];
  const mediaManifest: PublicationMediaItem[] = [];
  let publicationSucceeded = false;

  try {
    for (const asset of source.assets) {
      const destinationPath = `${source.site.id}/${publicationId}/${asset.id}.webp`;
      const { error } = await admin.storage
        .from("candidate-media")
        .copy(asset.storagePath, destinationPath, { destinationBucket: "published-media" });
      if (error) throw new Error(`media_copy_failed:${asset.id}`);
      copiedPaths.push(destinationPath);
      mediaManifest.push({
        altText: asset.altText,
        assetId: asset.id,
        caption: asset.caption,
        height: asset.height,
        kind: asset.kind === "post" ? "post" : asset.kind as PublicationMediaItem["kind"],
        sortOrder: asset.sortOrder,
        storagePath: destinationPath,
        width: asset.width,
      });
    }

    const supabase = await createClient();
    const { data, error } = await callPublishingRpc(supabase, "publish_candidate_site", {
      p_content: source.content,
      p_media_manifest: mediaManifest,
      p_posts: source.posts,
      p_publication_id: publicationId,
      p_schema_version: source.schemaVersion,
      p_seo: source.seo,
      p_site_id: source.site.id,
      p_source_fingerprint: source.fingerprint,
      p_source_revision: source.revision,
      p_theme: source.theme,
    });
    const publication = publicationResult(data);
    if (error || !publication) throw new Error(error?.message ?? "publication_transaction_failed");

    publicationSucceeded = true;
    revalidatePath(`/app/web/${source.site.id}`, "layout");
    revalidatePath(`/${source.site.slug}`);
    return {
      ok: true,
      message: publication.version_number === 1 ? "Web bol úspešne zverejnený." : "Zmeny boli úspešne zverejnené.",
      publicPath: `/${source.site.slug}`,
      versionNumber: publication.version_number,
    };
  } catch {
    // Cleanup je potrebný len pri zlyhaní pred úspešným zápisom pointera na nové publikum v DB.
    // Ak by zlyhalo iba cache invalidovanie po úspešnom RPC, nechceme odstrániť médiá, na ktoré snapshot už ukazuje.
    if (!publicationSucceeded && copiedPaths.length) await admin.storage.from("published-media").remove(copiedPaths);
    return { ok: false, message: "Web sa nepodarilo zverejniť. Verejná verzia zostala bez zmeny." };
  }
}

export async function setSiteVisibilityAction(input: unknown): Promise<PublishSiteResult> {
  const parsed = z.object({ siteId: siteIdSchema, visible: z.boolean() }).safeParse(input);
  if (!parsed.success) return { ok: false, message: "Požiadavka nemá platné údaje." };
  if (isDemoMode()) return { ok: false, message: "Táto akcia nie je dostupná v ukážkovom režime." };

  if (parsed.data.visible) {
    const user = await getCurrentUser();
    if (!user) return { ok: false, message: "Pred obnovením webu sa musíte prihlásiť." };
    const verification = await requireVerifiedUser(user.id);
    if (!verification.ok) return { ok: false, message: verification.message };
  }

  const source = await loadPublicationSource(parsed.data.siteId);
  if (!source?.currentPublication) return { ok: false, message: "Projekt ešte nemá zverejnenú verziu." };
  if (parsed.data.visible && !source.entitled) return { ok: false, message: "Obnovenie webu vyžaduje platný balík." };

  const supabase = await createClient();
  const { error } = await callPublishingRpc(supabase, "set_candidate_site_visibility", {
    p_site_id: parsed.data.siteId,
    p_visible: parsed.data.visible,
  });
  if (error) {
    if (error.message.includes("admin_hold_active")) {
      return { ok: false, message: "Web je pozastavený prevádzkovateľom platformy. Obnovenie nie je možné." };
    }
    return { ok: false, message: parsed.data.visible ? "Web sa nepodarilo obnoviť." : "Web sa nepodarilo pozastaviť." };
  }

  revalidatePath(`/app/web/${source.site.id}`, "layout");
  revalidatePath(`/${source.site.slug}`);
  return {
    ok: true,
    message: parsed.data.visible ? "Web je opäť verejne dostupný." : "Web bol dočasne skrytý.",
    publicPath: `/${source.site.slug}`,
    versionNumber: source.currentPublication.versionNumber,
  };
}
