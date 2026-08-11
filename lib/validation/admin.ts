import { z } from "zod";

export const adminHoldCategories = [
  "illegal_content",
  "terms_violation",
  "safety",
  "impersonation",
  "other",
] as const;

export const adminHoldScopes = ["whole_site", "specific_content"] as const;

export const adminHoldCategoryLabels: Record<(typeof adminHoldCategories)[number], string> = {
  illegal_content: "Nezákonný obsah",
  terms_violation: "Porušenie podmienok",
  safety: "Bezpečnosť",
  impersonation: "Vydávanie sa za inú osobu",
  other: "Iné",
};

export const adminHoldScopeLabels: Record<(typeof adminHoldScopes)[number], string> = {
  whole_site: "Celý web",
  specific_content: "Konkrétny obsah",
};

export const adminSiteHoldSchema = z.object({
  siteId: z.string().uuid(),
  hold: z.boolean(),
  reason: z.string().trim().min(8, "Dôvod musí mať aspoň 8 znakov.").max(2000),
  category: z.enum(adminHoldCategories),
  scope: z.enum(adminHoldScopes),
  durationDays: z.coerce.number().int().min(1).max(3650).nullable(),
  candidateMessage: z.string().trim().min(8, "Správa musí mať aspoň 8 znakov.").max(4000),
}).superRefine((value, ctx) => {
  if (value.hold && value.durationDays == null) {
    ctx.addIssue({ code: "custom", message: "Pri pozastavení uveďte trvanie v dňoch.", path: ["durationDays"] });
  }
});

export const adminGrantPlanSchema = z.object({
  siteId: z.string().uuid(),
  planCode: z.enum(["basic", "plus"]),
  reason: z.string().trim().min(8, "Dôvod musí mať aspoň 8 znakov.").max(2000),
});

export type AdminActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<"reason" | "category" | "scope" | "durationDays" | "candidateMessage" | "planCode", string>>;
};

export const initialAdminActionState: AdminActionState = { status: "idle" };