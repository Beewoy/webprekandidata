"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import {
  adminGrantPlanSchema,
  adminSiteHoldSchema,
  initialAdminActionState,
  type AdminActionState,
} from "@/lib/validation/admin";

export async function setAdminSiteHoldAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePlatformAdmin();

  const parsed = adminSiteHoldSchema.safeParse({
    siteId: formData.get("siteId"),
    hold: formData.get("hold") === "true",
    reason: formData.get("reason"),
    category: formData.get("category"),
    scope: formData.get("scope"),
    durationDays: formData.get("durationDays") === "" || formData.get("durationDays") == null
      ? null
      : formData.get("durationDays"),
    candidateMessage: formData.get("candidateMessage"),
  });

  if (!parsed.success) {
    const fieldErrors: AdminActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (
        key === "reason" ||
        key === "category" ||
        key === "scope" ||
        key === "durationDays" ||
        key === "candidateMessage"
      ) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Skontrolujte povinné polia formulára.",
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data: site } = await supabase
    .from("sites")
    .select("slug")
    .eq("id", parsed.data.siteId)
    .maybeSingle();

  const { error } = await supabase.rpc("admin_set_site_hold", {
    p_site_id: parsed.data.siteId,
    p_hold: parsed.data.hold,
    p_reason: parsed.data.reason,
    p_category: parsed.data.category,
    p_scope: parsed.data.scope,
    // Supabase's generated RPC type omits SQL argument nullability.
    p_duration_days: parsed.data.durationDays as number,
    p_candidate_message: parsed.data.candidateMessage,
  });

  if (error) {
    return {
      ...initialAdminActionState,
      status: "error",
      message: parsed.data.hold
        ? "Web sa nepodarilo pozastaviť."
        : "Administrátorské pozastavenie sa nepodarilo uvoľniť.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/weby");
  revalidatePath(`/admin/weby/${parsed.data.siteId}`);
  revalidatePath("/admin/audit");
  if (site?.slug) revalidatePath(`/${site.slug}`);

  return {
    status: "success",
    message: parsed.data.hold
      ? "Web bol administrátorsky pozastavený. Správa pre kandidáta je uložená v audite."
      : "Administrátorské pozastavenie bolo uvoľnené.",
  };
}

export async function grantAdminSitePlanAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePlatformAdmin();

  const parsed = adminGrantPlanSchema.safeParse({
    siteId: formData.get("siteId"),
    planCode: formData.get("planCode"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    const fieldErrors: AdminActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "reason" || key === "planCode") {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Skontrolujte balík a dôvod udelenia.",
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data: site } = await supabase
    .from("sites")
    .select("slug, owner_user_id")
    .eq("id", parsed.data.siteId)
    .maybeSingle();

  const { error } = await supabase.rpc("admin_grant_site_plan", {
    p_site_id: parsed.data.siteId,
    p_plan_code: parsed.data.planCode,
    p_reason: parsed.data.reason,
  });

  if (error) {
    return {
      ...initialAdminActionState,
      status: "error",
      message: "Balík sa nepodarilo udeliť.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/weby");
  revalidatePath(`/admin/weby/${parsed.data.siteId}`);
  revalidatePath("/admin/objednavky");
  revalidatePath("/admin/audit");
  if (site?.owner_user_id) revalidatePath("/app");
  if (site?.slug) {
    revalidatePath(`/${site.slug}`);
    revalidatePath(`/app/web/${parsed.data.siteId}`, "layout");
  }

  const label = parsed.data.planCode === "plus" ? "Plus" : "Basic";
  return {
    status: "success",
    message: `Balík ${label} bol udelený. Vytvorila sa zaplatená objednávka bez expirácie.`,
  };
}
