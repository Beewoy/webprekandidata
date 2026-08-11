import { isDemoMode } from "@/lib/env";
import { getSite } from "@/lib/data/sites";
import {
  DOMAIN_STATUS_LABELS,
  getPlatformSiteUrl,
  isDomainStatus,
  type DomainStatus,
} from "@/lib/domains/platform";
import type { DnsRecordInstruction } from "@/lib/domains/vercel";
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
    const type = row.type;
    const purpose = row.purpose;
    if (
      typeof row.name !== "string"
      || typeof row.value !== "string"
      || (type !== "A" && type !== "AAAA" && type !== "CNAME" && type !== "TXT")
      || (purpose !== "routing" && purpose !== "verification")
    ) {
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
  return {
    dns: readDns(row.verification_metadata),
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

  const records = (domainsResult.data ?? []).flatMap((row) => {
    const mapped = mapDomain(row);
    return mapped ? [mapped] : [];
  });
  const customDomain = records.find((row) => row.domainType === "custom") ?? null;

  return {
    canUseCustomDomain: entitlementResult.data === true,
    customDomain,
    platformUrl: getPlatformSiteUrl(site.slug),
    planCode: site.planCode,
    records,
    slug: site.slug,
  };
}
