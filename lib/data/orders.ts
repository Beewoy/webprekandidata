import "server-only";

import { isDemoMode } from "@/lib/env";
import { PLAN_LABELS, PLAN_PRICE_LABELS, type PaidPlanCode } from "@/lib/payments/plans";
import { createClient } from "@/lib/supabase/server";

export type SiteOrderRow = {
  createdAt: string;
  fulfilledAt: string | null;
  id: string;
  paidAt: string | null;
  planCode: PaidPlanCode;
  planLabel: string;
  priceLabel: string;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  totalCents: number;
};

export async function listSiteOrders(siteId: string): Promise<SiteOrderRow[]> {
  if (isDemoMode() || siteId === "demo") return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, plan_code, total_cents, paid_at, fulfilled_at, created_at")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Objednávky sa nepodarilo načítať.");

  return (data ?? []).map((row) => ({
    createdAt: row.created_at,
    fulfilledAt: row.fulfilled_at,
    id: row.id,
    paidAt: row.paid_at,
    planCode: row.plan_code,
    planLabel: PLAN_LABELS[row.plan_code],
    priceLabel: PLAN_PRICE_LABELS[row.plan_code],
    status: row.status,
    totalCents: row.total_cents,
  }));
}
