import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isDemoMode } from "@/lib/env";
import { getCurrentUser } from "@/lib/data/sites";
import { isAdminGrantedOrder } from "@/lib/payments/admin-grant";
import { resolveOrderInvoiceUrl } from "@/lib/payments/order-invoice";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export type AdminProfile = {
  id: string;
  fullName: string;
  role: "admin";
};

export type AdminDashboardMetrics = {
  registrations: number;
  sitesByStatus: Record<string, number>;
  adminHolds: number;
  ordersByStatus: Record<string, number>;
  aiFailed: number;
  aiCompleted: number;
  recentAudit: AdminAuditRow[];
};

export type AdminUserSiteSummary = {
  id: string;
  name: string;
  planCode: "basic" | "plus" | null;
};

export type AdminUserRow = {
  id: string;
  fullName: string;
  email: string;
  role: "candidate" | "admin";
  emailVerifiedAt: string | null;
  createdAt: string;
  siteCount: number;
  sites: AdminUserSiteSummary[];
};

export type AdminSiteRow = {
  id: string;
  internalName: string;
  candidateName: string;
  locality: string;
  slug: string;
  status: string;
  planCode: "basic" | "plus" | null;
  adminHold: boolean;
  adminHoldAt: string | null;
  ownerUserId: string;
  currentPublicationId: string | null;
  updatedAt: string;
  createdAt: string;
};

export type AdminOrderRow = {
  id: string;
  siteId: string;
  userId: string;
  status: string;
  planCode: "basic" | "plus";
  totalCents: number;
  orderNumber: string;
  invoiceUrl: string | null;
  isAdminGrant: boolean;
  stripeCheckoutSessionId: string | null;
  stripeCustomerId: string | null;
  paidAt: string | null;
  fulfilledAt: string | null;
  createdAt: string;
  siteSlug: string | null;
  siteName: string | null;
};

export type AdminDomainRow = {
  id: string;
  siteId: string;
  hostname: string;
  domainType: string;
  status: string;
  isPrimary: boolean;
  createdAt: string;
  verifiedAt: string | null;
  siteSlug: string | null;
  siteName: string | null;
};

export type AdminAiRow = {
  id: string;
  siteId: string;
  userId: string;
  taskType: string;
  provider: string;
  model: string;
  status: string;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCostCents: number | null;
  safetyCategory: string | null;
  createdAt: string;
};

export type AdminAuditRow = {
  id: number;
  actorUserId: string | null;
  siteId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Json;
  createdAt: string;
};

export type AdminSiteDetail = AdminSiteRow & {
  ownerFullName: string;
  draftSummary: {
    candidateName: string;
    locality: string;
    position: string;
    aboutPreview: string;
  };
  recentAudit: AdminAuditRow[];
};

const metricsSchema = z.object({
  registrations: z.number().int().nonnegative(),
  sites_by_status: z.record(z.string(), z.number().int().nonnegative()).default({}),
  admin_holds: z.number().int().nonnegative(),
  orders_by_status: z.record(z.string(), z.number().int().nonnegative()).default({}),
  ai_failed: z.number().int().nonnegative(),
  ai_completed: z.number().int().nonnegative(),
  recent_audit: z.array(z.object({
    id: z.number(),
    actor_user_id: z.string().uuid().nullable(),
    site_id: z.string().uuid().nullable(),
    action: z.string(),
    target_type: z.string(),
    target_id: z.string().nullable(),
    metadata: z.unknown(),
    created_at: z.string(),
  })).default([]),
});

function mapAudit(row: {
  id: number;
  actor_user_id: string | null;
  site_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Json;
  created_at: string;
}): AdminAuditRow {
  return {
    id: row.id,
    actorUserId: row.actor_user_id,
    siteId: row.site_id,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

export const getPlatformAdminProfile = cache(async (): Promise<AdminProfile | null> => {
  if (isDemoMode()) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data || data.role !== "admin") return null;
  return { id: data.id, fullName: data.full_name, role: "admin" };
});

export async function requirePlatformAdmin(): Promise<AdminProfile> {
  if (isDemoMode()) redirect("/app");
  const user = await getCurrentUser();
  if (!user) redirect("/prihlasenie?next=/admin");
  const profile = await getPlatformAdminProfile();
  if (!profile) redirect("/app");
  return profile;
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  await requirePlatformAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_dashboard_metrics");
  if (error) throw new Error("Metriky sa nepodarilo načítať.");
  const parsed = metricsSchema.safeParse(data);
  if (!parsed.success) throw new Error("Metriky majú neočakávaný formát.");
  return {
    registrations: parsed.data.registrations,
    sitesByStatus: parsed.data.sites_by_status,
    adminHolds: parsed.data.admin_holds,
    ordersByStatus: parsed.data.orders_by_status,
    aiFailed: parsed.data.ai_failed,
    aiCompleted: parsed.data.ai_completed,
    recentAudit: parsed.data.recent_audit.map((row) => mapAudit({
      ...row,
      metadata: (row.metadata ?? {}) as Json,
    })),
  };
}

export async function searchAdminUsers(query: string): Promise<AdminUserRow[]> {
  await requirePlatformAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_search_users", {
    p_query: query.trim(),
    p_limit: 50,
  });
  if (error) throw new Error("Používateľov sa nepodarilo vyhľadať.");

  const users = (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role as "candidate" | "admin",
    emailVerifiedAt: row.email_verified_at,
    createdAt: row.created_at,
    siteCount: Number(row.site_count),
    sites: [] as AdminUserSiteSummary[],
  }));

  if (!users.length) return users;

  const { data: sites, error: sitesError } = await supabase
    .from("sites")
    .select("id, internal_name, candidate_name, plan_code, owner_user_id, updated_at")
    .in("owner_user_id", users.map((user) => user.id))
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (sitesError) throw new Error("Weby používateľov sa nepodarilo načítať.");

  const sitesByOwner = new Map<string, AdminUserSiteSummary[]>();
  for (const site of sites ?? []) {
    const list = sitesByOwner.get(site.owner_user_id) ?? [];
    list.push({
      id: site.id,
      name: site.candidate_name || site.internal_name || site.id.slice(0, 8),
      planCode: site.plan_code,
    });
    sitesByOwner.set(site.owner_user_id, list);
  }

  return users.map((user) => ({
    ...user,
    sites: sitesByOwner.get(user.id) ?? [],
  }));
}

export async function listAdminSites(query: string, ownerUserId?: string): Promise<AdminSiteRow[]> {
  await requirePlatformAdmin();
  const supabase = await createClient();
  let request = supabase
    .from("sites")
    .select("id, internal_name, candidate_name, locality, slug, status, plan_code, admin_hold, admin_hold_at, owner_user_id, current_publication_id, updated_at, created_at")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(80);

  if (ownerUserId) {
    request = request.eq("owner_user_id", ownerUserId);
  }

  const q = query.trim();
  if (q) {
    request = request.or(`slug.ilike.%${q}%,candidate_name.ilike.%${q}%,locality.ilike.%${q}%,internal_name.ilike.%${q}%`);
  }

  const { data, error } = await request;
  if (error) throw new Error("Weby sa nepodarilo načítať.");
  return (data ?? []).map((row) => ({
    id: row.id,
    internalName: row.internal_name,
    candidateName: row.candidate_name,
    locality: row.locality,
    slug: row.slug,
    status: row.status,
    planCode: row.plan_code,
    adminHold: row.admin_hold,
    adminHoldAt: row.admin_hold_at,
    ownerUserId: row.owner_user_id,
    currentPublicationId: row.current_publication_id,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  }));
}

export async function getAdminSiteDetail(siteId: string): Promise<AdminSiteDetail | null> {
  await requirePlatformAdmin();
  const supabase = await createClient();
  const { data: site, error } = await supabase
    .from("sites")
    .select("id, internal_name, candidate_name, locality, slug, status, plan_code, admin_hold, admin_hold_at, owner_user_id, current_publication_id, updated_at, created_at")
    .eq("id", siteId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !site) return null;

  const [profileResult, draftResult, auditResult] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", site.owner_user_id).maybeSingle(),
    supabase.from("site_drafts").select("content").eq("site_id", siteId).maybeSingle(),
    supabase
      .from("audit_logs")
      .select("id, actor_user_id, site_id, action, target_type, target_id, metadata, created_at")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const content = draftResult.data?.content && typeof draftResult.data.content === "object" && !Array.isArray(draftResult.data.content)
    ? draftResult.data.content as Record<string, unknown>
    : {};
  const basics = content["zakladne-udaje"] && typeof content["zakladne-udaje"] === "object" && !Array.isArray(content["zakladne-udaje"])
    ? content["zakladne-udaje"] as Record<string, unknown>
    : {};
  const about = content["o-mne"] && typeof content["o-mne"] === "object" && !Array.isArray(content["o-mne"])
    ? content["o-mne"] as Record<string, unknown>
    : {};
  const aboutHtml = typeof about.body === "string" ? about.body : "";
  const aboutPreview = aboutHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 280);

  return {
    id: site.id,
    internalName: site.internal_name,
    candidateName: site.candidate_name,
    locality: site.locality,
    slug: site.slug,
    status: site.status,
    planCode: site.plan_code,
    adminHold: site.admin_hold,
    adminHoldAt: site.admin_hold_at,
    ownerUserId: site.owner_user_id,
    currentPublicationId: site.current_publication_id,
    updatedAt: site.updated_at,
    createdAt: site.created_at,
    ownerFullName: profileResult.data?.full_name ?? "",
    draftSummary: {
      candidateName: typeof basics.name === "string" ? basics.name : site.candidate_name,
      locality: typeof basics.city === "string" ? basics.city : site.locality,
      position: typeof basics.position === "string" ? basics.position : "",
      aboutPreview,
    },
    recentAudit: (auditResult.data ?? []).map(mapAudit),
  };
}

export async function listAdminOrders(): Promise<AdminOrderRow[]> {
  await requirePlatformAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, site_id, user_id, status, plan_code, total_cents, buyer_snapshot, stripe_checkout_session_id, stripe_customer_id, stripe_hosted_invoice_url, stripe_invoice_pdf_url, paid_at, fulfilled_at, created_at, sites(slug, candidate_name)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Objednávky sa nepodarilo načítať.");

  return (data ?? []).map((row) => {
    const site = Array.isArray(row.sites) ? row.sites[0] : row.sites;
    const adminGrant = isAdminGrantedOrder(row.buyer_snapshot);
    return {
      id: row.id,
      siteId: row.site_id,
      userId: row.user_id,
      status: row.status,
      planCode: row.plan_code,
      totalCents: adminGrant ? 0 : row.total_cents,
      orderNumber: row.order_number,
      invoiceUrl: resolveOrderInvoiceUrl(row.stripe_hosted_invoice_url, row.stripe_invoice_pdf_url),
      isAdminGrant: adminGrant,
      stripeCheckoutSessionId: row.stripe_checkout_session_id,
      stripeCustomerId: row.stripe_customer_id,
      paidAt: row.paid_at,
      fulfilledAt: row.fulfilled_at,
      createdAt: row.created_at,
      siteSlug: site && typeof site === "object" && "slug" in site ? String(site.slug) : null,
      siteName: site && typeof site === "object" && "candidate_name" in site ? String(site.candidate_name) : null,
    };
  });
}

export async function listAdminDomains(): Promise<AdminDomainRow[]> {
  await requirePlatformAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("domains")
    .select("id, site_id, hostname, domain_type, status, is_primary, created_at, verified_at, sites(slug, candidate_name)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Domény sa nepodarilo načítať.");

  return (data ?? []).map((row) => {
    const site = Array.isArray(row.sites) ? row.sites[0] : row.sites;
    return {
      id: row.id,
      siteId: row.site_id,
      hostname: row.hostname,
      domainType: row.domain_type,
      status: row.status,
      isPrimary: row.is_primary,
      createdAt: row.created_at,
      verifiedAt: row.verified_at,
      siteSlug: site && typeof site === "object" && "slug" in site ? String(site.slug) : null,
      siteName: site && typeof site === "object" && "candidate_name" in site ? String(site.candidate_name) : null,
    };
  });
}

export async function listAdminAiUsage(): Promise<AdminAiRow[]> {
  await requirePlatformAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_generations")
    .select("id, site_id, user_id, task_type, provider, model, status, input_tokens, output_tokens, estimated_cost_cents, safety_category, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("AI použitie sa nepodarilo načítať.");
  return (data ?? []).map((row) => ({
    id: row.id,
    siteId: row.site_id,
    userId: row.user_id,
    taskType: row.task_type,
    provider: row.provider,
    model: row.model,
    status: row.status,
    inputTokens: row.input_tokens,
    outputTokens: row.output_tokens,
    estimatedCostCents: row.estimated_cost_cents,
    safetyCategory: row.safety_category,
    createdAt: row.created_at,
  }));
}

export async function listAdminAuditLogs(): Promise<AdminAuditRow[]> {
  await requirePlatformAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, actor_user_id, site_id, action, target_type, target_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(150);
  if (error) throw new Error("Audit sa nepodarilo načítať.");
  return (data ?? []).map(mapAudit);
}
