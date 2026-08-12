import { isDemoMode, isVercelDomainsConfigured } from "@/lib/env";
import { getSite } from "@/lib/data/sites";
import {
  DOMAIN_STATUS_LABELS,
  getPlatformSiteUrl,
  isDomainStatus,
  type DomainStatus,
} from "@/lib/domains/platform";
import { ensureDnsInstructions, type DnsRecordInstruction } from "@/lib/domains/dns-instructions";
import { syncDomainProviderStateWithAdmin } from "@/lib/domains/provider-sync";
import { getVercelProjectDomain } from "@/lib/domains/vercel";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export type SiteDomainRecord = {
  dns: DnsRecordInstruction[];
  domainType: "subdomain" | "custom";
  hostname: string;
  id: string;
  isPrimary: boolean;
  sslReady: boolean;
  status: DomainStatus;
  statusLabel: string;
  verifiedAt: string | null;
};

export type SiteDomainState = {
  canUseCustomDomain: boolean;
  customDomain: SiteDomainRecord | null;
  platformUrl: string;
  planCode: "basic" | "plus" | null;
  records: SiteDomainRecord[];
  slug: string;
};

function asObject(value: Json | null | undefined): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function readDns(metadata: Json): DnsRecordInstruction[] {
  const dns = asObject(metadata).dns;
  if (!Array.isArray(dns)) return [];
  return dns.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const row = item as Record<string, unknown>;
    const rawType = typeof row.type === "string" ? row.type.toUpperCase() : "";
    const type = rawType === "A" || rawType === "AAAA" || rawType === "CNAME" || rawType === "TXT"
      ? rawType
      : null;
    const purpose = row.purpose === "verification" ? "verification" : "routing";
    if (typeof row.name !== "string" || typeof row.value !== "string" || !type) {
      return [];
    }
    return [{ name: row.name, type, value: row.value, purpose }];
  });
}

function mapDomain(row: {
  id: string;
  hostname: string;
  domain_type: string;
  status: string;
  is_primary: boolean;
  verified_at: string | null;
  verification_metadata: Json;
  ssl_metadata: Json;
}): SiteDomainRecord | null {
  if (row.domain_type !== "subdomain" && row.domain_type !== "custom") return null;
  if (!isDomainStatus(row.status) || row.status === "removed") return null;
  const ssl = asObject(row.ssl_metadata);
  const dns = row.domain_type === "custom"
    ? ensureDnsInstructions(row.hostname, readDns(row.verification_metadata))
    : readDns(row.verification_metadata);
  return {
    dns,
    domainType: row.domain_type,
    hostname: row.hostname,
    id: row.id,
    isPrimary: row.is_primary,
    sslReady: ssl.ready === true,
    status: row.status,
    statusLabel: DOMAIN_STATUS_LABELS[row.status],
    verifiedAt: row.verified_at,
  };
}

async function healCustomDomainDns(record: SiteDomainRecord): Promise<SiteDomainRecord> {
  if (record.domainType !== "custom") return record;
  if (!isVercelDomainsConfigured()) {
    return { ...record, dns: ensureDnsInstructions(record.hostname, record.dns) };
  }

  try {
    const snapshot = await getVercelProjectDomain(record.hostname);
    const dns = ensureDnsInstructions(record.hostname, snapshot.dns);
    // Heal only refreshes DNS metadata; never promote to active without verify flow.
    const nextStatus: DomainStatus = record.status === "active" ? "active" : "verifying";
    await syncDomainProviderStateWithAdmin({
      domainId: record.id,
      status: nextStatus,
      snapshot: { ...snapshot, dns },
      makePrimaryWhenActive: false,
    });
    return {
      ...record,
      dns,
      sslReady: snapshot.sslReady,
      status: nextStatus,
      statusLabel: DOMAIN_STATUS_LABELS[nextStatus],
    };
  } catch {
    return { ...record, dns: ensureDnsInstructions(record.hostname, record.dns) };
  }
}

export async function getSiteDomainState(siteId: string): Promise<SiteDomainState | null> {
  if (siteId === "demo" && isDemoMode()) {
    return {
      canUseCustomDomain: false,
      customDomain: null,
      platformUrl: getPlatformSiteUrl("martin-novak"),
      planCode: null,
      records: [{
        dns: [],
        domainType: "subdomain",
        hostname: "martin-novak.webprekandidata.sk",
        id: "demo-domain",
        isPrimary: true,
        sslReady: true,
        status: "active",
        statusLabel: DOMAIN_STATUS_LABELS.active,
        verifiedAt: new Date().toISOString(),
      }],
      slug: "martin-novak",
    };
  }
  if (isDemoMode()) return null;

  const site = await getSite(siteId);
  if (!site) return null;

  const supabase = await createClient();
  const [domainsResult, entitlementResult] = await Promise.all([
    supabase
      .from("domains")
      .select("id, hostname, domain_type, status, is_primary, verified_at, verification_metadata, ssl_metadata")
      .eq("site_id", siteId)
      .neq("status", "removed")
      .order("created_at", { ascending: true }),
    supabase.rpc("has_plus_entitlement", { p_site_id: siteId }),
  ]);

  if (domainsResult.error) throw new Error("Domény sa nepodarilo načítať.");

  const records = await Promise.all((domainsResult.data ?? []).map(async (row) => {
    const mapped = mapDomain(row);
    if (!mapped) return null;
    if (mapped.domainType === "custom" && readDns(row.verification_metadata).length === 0) {
      return healCustomDomainDns(mapped);
    }
    return mapped;
  }));

  const present = records.filter((row): row is SiteDomainRecord => row !== null);
  const customDomain = present.find((row) => row.domainType === "custom") ?? null;

  return {
    canUseCustomDomain: entitlementResult.data === true,
    customDomain,
    platformUrl: getPlatformSiteUrl(site.slug),
    planCode: site.planCode,
    records: present,
    slug: site.slug,
  };
}
