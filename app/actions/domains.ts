"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/env";
import {
  addVercelProjectDomain,
  removeVercelProjectDomain,
  snapshotToMetadata,
  snapshotToSslMetadata,
  verifyVercelProjectDomain,
  type VercelDomainSnapshot,
} from "@/lib/domains/vercel";
import { normalizeHostname } from "@/lib/domains/hostname";
import { attachCustomDomainSchema, domainIdActionSchema } from "@/lib/validation/domains";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export type DomainActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

function mapRpcError(error: { code?: string; message?: string } | null, fallback: string) {
  const message = error?.message ?? "";
  if (message.includes("plus_entitlement_required")) return "Vlastná doména je dostupná iba v balíku Plus.";
  if (message.includes("custom_domain_exists")) return "K tomuto webu už máte pripojenú vlastnú doménu.";
  if (message.includes("hostname_taken")) return "Táto doména je už použitá iným webom.";
  if (message.includes("invalid_hostname")) return "Zadajte platnú doménu.";
  if (message.includes("site_access_denied")) return "K tomuto projektu nemáte prístup.";
  if (message.includes("domain_not_found")) return "Doména sa nenašla.";
  if (message.includes("domain_not_active")) return "Za hlavnú možno nastaviť iba aktívnu doménu.";
  return fallback;
}

function statusFromSnapshot(snapshot: VercelDomainSnapshot): "pending" | "verifying" | "active" | "failed" {
  if (snapshot.verified && snapshot.sslReady && !snapshot.misconfigured) return "active";
  if (snapshot.misconfigured && snapshot.verified) return "failed";
  if (snapshot.verified || snapshot.dns.length > 0) return "verifying";
  return "pending";
}

async function syncSnapshot(domainId: string, snapshot: VercelDomainSnapshot, makePrimaryWhenActive = true) {
  const supabase = await createClient();
  const status = statusFromSnapshot(snapshot);
  const { error } = await supabase.rpc("sync_domain_provider_state", {
    p_domain_id: domainId,
    p_status: status,
    p_verification_metadata: snapshotToMetadata(snapshot) as Json,
    p_ssl_metadata: snapshotToSslMetadata(snapshot) as Json,
    p_make_primary: makePrimaryWhenActive && status === "active",
    ...(status === "active" ? { p_verified_at: new Date().toISOString() } : {}),
  });
  if (error) throw new Error(mapRpcError(error, "Stav domény sa nepodarilo uložiť."));
  return status;
}

async function revalidateDomainPaths(siteId: string, slug?: string | null, hostname?: string | null) {
  revalidatePath(`/app/web/${siteId}`, "layout");
  revalidatePath(`/app/web/${siteId}/domena`);
  if (slug) revalidatePath(`/${slug}`);
  if (hostname) revalidatePath("/", "layout");
}

export async function attachCustomDomainAction(input: unknown): Promise<DomainActionResult> {
  if (isDemoMode()) {
    return { ok: false, message: "Pripojenie vlastnej domény nie je v demo režime dostupné." };
  }

  const parsed = attachCustomDomainSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return { ok: false, message: "Skontrolujte zadanú doménu.", fieldErrors };
  }

  const hostname = normalizeHostname(parsed.data.hostname);
  const siteId = parsed.data.siteId;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Pred úpravou domény sa musíte prihlásiť." };

  const { data: site } = await supabase
    .from("sites")
    .select("id, slug")
    .eq("id", siteId)
    .maybeSingle();
  if (!site) return { ok: false, message: "Projekt sa nenašiel." };

  const { data: attached, error: attachError } = await supabase.rpc("attach_custom_domain", {
    p_site_id: siteId,
    p_hostname: hostname,
  });
  if (attachError || !attached || typeof attached !== "object" || Array.isArray(attached)) {
    return { ok: false, message: mapRpcError(attachError, "Doménu sa nepodarilo pripojiť.") };
  }

  const domainId = String((attached as Record<string, unknown>).id ?? "");
  if (!domainId) return { ok: false, message: "Doménu sa nepodarilo pripojiť." };

  try {
    const snapshot = await addVercelProjectDomain(hostname);
    const status = await syncSnapshot(domainId, snapshot);
    await revalidateDomainPaths(siteId, site.slug, hostname);
    return {
      ok: true,
      message: status === "active"
        ? "Doména je aktívna a HTTPS je pripravené."
        : "Doména je pripojená. Dokončite DNS záznamy a potom spustite kontrolu.",
    };
  } catch (error) {
    try {
      await supabase.rpc("remove_custom_domain", { p_domain_id: domainId });
    } catch {
      // Best-effort rollback of the pending domain row.
    }
    await removeVercelProjectDomain(hostname).catch(() => undefined);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Doménu sa nepodarilo pripojiť u poskytovateľa hostingu.",
    };
  }
}

export async function checkCustomDomainAction(input: unknown): Promise<DomainActionResult> {
  if (isDemoMode()) {
    return { ok: false, message: "Kontrola DNS nie je v demo režime dostupná." };
  }

  const parsed = domainIdActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Neplatná požiadavka." };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Pred kontrolou domény sa musíte prihlásiť." };

  const { data: domain, error } = await supabase
    .from("domains")
    .select("id, hostname, domain_type, status, site_id")
    .eq("id", parsed.data.domainId)
    .eq("site_id", parsed.data.siteId)
    .maybeSingle();

  if (error || !domain || domain.domain_type !== "custom" || domain.status === "removed") {
    return { ok: false, message: "Doména sa nenašla." };
  }

  const { data: site } = await supabase.from("sites").select("slug").eq("id", parsed.data.siteId).maybeSingle();

  try {
    const snapshot = await verifyVercelProjectDomain(domain.hostname);
    const status = await syncSnapshot(domain.id, snapshot);
    await revalidateDomainPaths(parsed.data.siteId, site?.slug, domain.hostname);
    if (status === "active") {
      return { ok: true, message: "Doména je overená a HTTPS certifikát je pripravený." };
    }
    if (status === "failed") {
      return { ok: false, message: "DNS záznamy ešte nie sú správne nastavené. Skontrolujte inštrukcie a skúste znova." };
    }
    return { ok: true, message: "Overenie ešte nie je hotové. DNS zmeny môžu trvať niekoľko minút až 24 hodín." };
  } catch (checkError) {
    return {
      ok: false,
      message: checkError instanceof Error ? checkError.message : "Kontrola DNS zlyhala.",
    };
  }
}

export async function removeCustomDomainAction(input: unknown): Promise<DomainActionResult> {
  if (isDemoMode()) {
    return { ok: false, message: "Odstránenie domény nie je v demo režime dostupné." };
  }

  const parsed = domainIdActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Neplatná požiadavka." };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Pred odstránením domény sa musíte prihlásiť." };

  const { data: domain } = await supabase
    .from("domains")
    .select("id, hostname, domain_type, status")
    .eq("id", parsed.data.domainId)
    .eq("site_id", parsed.data.siteId)
    .maybeSingle();

  if (!domain || domain.domain_type !== "custom" || domain.status === "removed") {
    return { ok: false, message: "Doména sa nenašla." };
  }

  const { data: site } = await supabase.from("sites").select("slug").eq("id", parsed.data.siteId).maybeSingle();

  try {
    await removeVercelProjectDomain(domain.hostname);
  } catch {
    // Continue local removal even if provider cleanup fails; admin can reconcile.
  }

  const { error } = await supabase.rpc("remove_custom_domain", { p_domain_id: domain.id });
  if (error) return { ok: false, message: mapRpcError(error, "Doménu sa nepodarilo odstrániť.") };

  await revalidateDomainPaths(parsed.data.siteId, site?.slug, domain.hostname);
  return { ok: true, message: "Vlastná doména bola odstránená." };
}

export async function setPrimaryDomainAction(input: unknown): Promise<DomainActionResult> {
  if (isDemoMode()) {
    return { ok: false, message: "Nastavenie hlavnej domény nie je v demo režime dostupné." };
  }

  const parsed = domainIdActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Neplatná požiadavka." };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Pred úpravou domény sa musíte prihlásiť." };

  const { data: domain } = await supabase
    .from("domains")
    .select("id, hostname")
    .eq("id", parsed.data.domainId)
    .eq("site_id", parsed.data.siteId)
    .maybeSingle();
  if (!domain) return { ok: false, message: "Doména sa nenašla." };

  const { data: site } = await supabase.from("sites").select("slug").eq("id", parsed.data.siteId).maybeSingle();

  const { error } = await supabase.rpc("set_primary_domain", { p_domain_id: domain.id });
  if (error) return { ok: false, message: mapRpcError(error, "Hlavnú doménu sa nepodarilo nastaviť.") };

  await revalidateDomainPaths(parsed.data.siteId, site?.slug, domain.hostname);
  return { ok: true, message: "Hlavná adresa webu bola aktualizovaná." };
}
