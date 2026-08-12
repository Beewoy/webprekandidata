import "server-only";

import { isDemoMode, isVercelDomainsConfigured } from "../env";
import {
  defaultDnsInstructions,
  ensureDnsInstructions,
  relativeDnsName,
  type DnsRecordInstruction,
} from "./dns-instructions";
import { isApexHostname } from "./hostname";

export type { DnsRecordInstruction } from "./dns-instructions";

export type VercelDomainSnapshot = {
  configured: boolean;
  dns: DnsRecordInstruction[];
  misconfigured: boolean;
  name: string;
  sslReady: boolean;
  verified: boolean;
  verification: Array<{ domain: string; reason: string; type: string; value: string }>;
};

type VercelProjectDomainResponse = {
  name: string;
  verified: boolean;
  verification?: Array<{ domain: string; reason: string; type: string; value: string }>;
};

type VercelDomainConfigResponse = {
  misconfigured?: boolean;
  recommendedCNAME?: Array<{ rank: number; value: string }>;
  recommendedIPv4?: Array<{ rank: number; value: string }>;
  recommendedIPv6?: Array<{ rank: number; value: string }>;
};

function teamQuery() {
  const teamId = process.env.VERCEL_TEAM_ID?.trim();
  return teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
}

function projectId() {
  const id = process.env.VERCEL_PROJECT_ID?.trim();
  if (!id) throw new Error("Chýba VERCEL_PROJECT_ID.");
  return id;
}

function token() {
  const value = process.env.VERCEL_TOKEN?.trim();
  if (!value) throw new Error("Chýba VERCEL_TOKEN.");
  return value;
}

async function vercelFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.vercel.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.error?.message === "string"
      ? body.error.message
      : `Vercel API chyba (${response.status}).`;
    throw new Error(message);
  }
  return body as T;
}

function demoSnapshot(hostname: string): VercelDomainSnapshot {
  const routing = defaultDnsInstructions(hostname);
  const txtName = isApexHostname(hostname) ? "_vercel" : `_vercel.${hostname.split(".")[0] ?? ""}`;
  return {
    configured: true,
    dns: [
      ...routing,
      { name: txtName, type: "TXT", value: "vc-domain-verify=demo,demo", purpose: "verification" },
    ],
    misconfigured: false,
    name: hostname,
    sslReady: true,
    verified: true,
    verification: [{ domain: `_vercel.${hostname}`, reason: "demo", type: "TXT", value: "vc-domain-verify=demo,demo" }],
  };
}

function buildDnsInstructions(hostname: string, domain: VercelProjectDomainResponse, config: VercelDomainConfigResponse | null): DnsRecordInstruction[] {
  const apex = isApexHostname(hostname);
  const cname = config?.recommendedCNAME?.sort((a, b) => a.rank - b.rank)[0]?.value ?? "cname.vercel-dns.com";
  const ipv4 = config?.recommendedIPv4?.sort((a, b) => a.rank - b.rank)[0]?.value ?? "76.76.21.21";

  const records: DnsRecordInstruction[] = apex
    ? [{ name: "@", type: "A", value: ipv4, purpose: "routing" }]
    : [{ name: hostname.split(".")[0] ?? hostname, type: "CNAME", value: cname, purpose: "routing" }];

  for (const challenge of domain.verification ?? []) {
    if (challenge.type.toUpperCase() !== "TXT") continue;
    if (typeof challenge.domain !== "string" || typeof challenge.value !== "string") continue;
    records.push({
      name: relativeDnsName(challenge.domain, hostname),
      type: "TXT",
      value: challenge.value,
      purpose: "verification",
    });
  }

  return ensureDnsInstructions(hostname, records);
}

export function canUseVercelDomains() {
  return isVercelDomainsConfigured();
}

function requireVercelOrDemo(hostname: string): VercelDomainSnapshot | null {
  if (isDemoMode()) return demoSnapshot(hostname);
  if (!isVercelDomainsConfigured()) {
    throw new Error("Pripojenie vlastnej domény ešte nie je nakonfigurované (VERCEL_TOKEN / VERCEL_PROJECT_ID).");
  }
  return null;
}

export async function addVercelProjectDomain(hostname: string): Promise<VercelDomainSnapshot> {
  const demo = requireVercelOrDemo(hostname);
  if (demo) return demo;

  let domain: VercelProjectDomainResponse;
  try {
    domain = await vercelFetch<VercelProjectDomainResponse>(
      `/v10/projects/${encodeURIComponent(projectId())}/domains${teamQuery()}`,
      { method: "POST", body: JSON.stringify({ name: hostname }) },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/already|exist|conflict/i.test(message)) {
      return getVercelProjectDomain(hostname);
    }
    throw error;
  }

  let config: VercelDomainConfigResponse | null = null;
  try {
    config = await vercelFetch<VercelDomainConfigResponse>(`/v6/domains/${encodeURIComponent(hostname)}/config${teamQuery()}`);
  } catch {
    config = null;
  }

  return {
    configured: true,
    dns: buildDnsInstructions(hostname, domain, config),
    misconfigured: Boolean(config?.misconfigured),
    name: domain.name,
    sslReady: domain.verified && !config?.misconfigured,
    verified: domain.verified,
    verification: domain.verification ?? [],
  };
}

export async function getVercelProjectDomain(hostname: string): Promise<VercelDomainSnapshot> {
  const demo = requireVercelOrDemo(hostname);
  if (demo) return demo;

  const domain = await vercelFetch<VercelProjectDomainResponse>(
    `/v9/projects/${encodeURIComponent(projectId())}/domains/${encodeURIComponent(hostname)}${teamQuery()}`,
  );
  let config: VercelDomainConfigResponse | null = null;
  try {
    config = await vercelFetch<VercelDomainConfigResponse>(`/v6/domains/${encodeURIComponent(hostname)}/config${teamQuery()}`);
  } catch {
    config = null;
  }

  return {
    configured: true,
    dns: buildDnsInstructions(hostname, domain, config),
    misconfigured: Boolean(config?.misconfigured),
    name: domain.name,
    sslReady: domain.verified && !config?.misconfigured,
    verified: domain.verified,
    verification: domain.verification ?? [],
  };
}

export async function verifyVercelProjectDomain(hostname: string): Promise<VercelDomainSnapshot> {
  const demo = requireVercelOrDemo(hostname);
  if (demo) return demo;

  try {
    await vercelFetch(
      `/v9/projects/${encodeURIComponent(projectId())}/domains/${encodeURIComponent(hostname)}/verify${teamQuery()}`,
      { method: "POST" },
    );
  } catch {
    // Verification may fail until DNS propagates; still return current snapshot.
  }
  return getVercelProjectDomain(hostname);
}

export async function removeVercelProjectDomain(hostname: string): Promise<void> {
  if (isDemoMode()) return;
  if (!isVercelDomainsConfigured()) return;
  await vercelFetch(
    `/v9/projects/${encodeURIComponent(projectId())}/domains/${encodeURIComponent(hostname)}${teamQuery()}`,
    { method: "DELETE" },
  );
}

export function snapshotToMetadata(snapshot: VercelDomainSnapshot) {
  return {
    dns: snapshot.dns,
    misconfigured: snapshot.misconfigured,
    provider: isDemoMode() || !isVercelDomainsConfigured() ? "demo" : "vercel",
    verification: snapshot.verification,
  };
}

export function snapshotToSslMetadata(snapshot: VercelDomainSnapshot) {
  return {
    provider: isDemoMode() || !isVercelDomainsConfigured() ? "demo" : "vercel",
    ready: snapshot.sslReady,
    verified: snapshot.verified,
  };
}
