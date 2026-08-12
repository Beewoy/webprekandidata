import "server-only";

import { createAdminClient } from "../supabase/admin";
import type { Json } from "../supabase/database.types";
import {
  snapshotToMetadata,
  snapshotToSslMetadata,
  type VercelDomainSnapshot,
} from "./vercel";

export type DomainProviderStatus = "pending" | "verifying" | "active" | "failed";

/** Derive DB status from a trusted Vercel Domains API snapshot only. */
export function statusFromVercelSnapshot(snapshot: VercelDomainSnapshot): DomainProviderStatus {
  if (snapshot.verified && snapshot.sslReady && !snapshot.misconfigured) return "active";
  if (snapshot.verified || snapshot.dns.length > 0 || snapshot.misconfigured) return "verifying";
  return "pending";
}

/**
 * Persists provider state via service_role RPC only.
 * Authenticated PostgREST callers cannot invoke sync_domain_provider_state after migration 0023.
 */
export async function syncDomainProviderStateWithAdmin(params: {
  domainId: string;
  status: DomainProviderStatus;
  snapshot: VercelDomainSnapshot;
  makePrimaryWhenActive?: boolean;
  verifiedAt?: string | null;
}) {
  const admin = createAdminClient();
  const makePrimary = Boolean(params.makePrimaryWhenActive && params.status === "active");
  const { error } = await admin.rpc("sync_domain_provider_state", {
    p_domain_id: params.domainId,
    p_status: params.status,
    p_verification_metadata: snapshotToMetadata(params.snapshot) as Json,
    p_ssl_metadata: snapshotToSslMetadata(params.snapshot) as Json,
    p_make_primary: makePrimary,
    ...(params.status === "active"
      ? { p_verified_at: params.verifiedAt ?? new Date().toISOString() }
      : {}),
  });
  return { error };
}
