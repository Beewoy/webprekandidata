import { z } from "zod";
import { PAID_PLAN_CODES } from "../payments/plans";

const nonEmpty = (max: number) => z.string().trim().min(1).max(max);

export const checkoutBillingSchema = z.object({
  fullName: nonEmpty(120),
  email: z.string().trim().email().max(254),
  street: nonEmpty(160),
  city: nonEmpty(80),
  postalCode: z.string().trim().regex(/^\d{3}\s?\d{2}$/, "PSČ musí mať formát 123 45."),
  country: z.literal("SK"),
  companyName: z.string().trim().max(160).optional().or(z.literal("")),
  ico: z.string().trim().regex(/^(|\d{8})$/, "IČO musí mať 8 číslic.").optional().or(z.literal("")),
  acceptTerms: z.boolean().refine((value) => value === true, {
    message: "Pred platbou musíte súhlasiť s podmienkami.",
  }),
});

export const createCheckoutSchema = z.object({
  siteId: z.string().uuid(),
  planCode: z.enum(PAID_PLAN_CODES),
  billing: checkoutBillingSchema,
});

export type CheckoutBillingInput = z.infer<typeof checkoutBillingSchema>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

export function toBuyerSnapshot(billing: CheckoutBillingInput) {
  return {
    fullName: billing.fullName,
    email: billing.email,
    street: billing.street,
    city: billing.city,
    postalCode: billing.postalCode.replace(/\s+/g, " ").trim(),
    country: billing.country,
    companyName: billing.companyName?.trim() || "",
    ico: billing.ico?.trim() || "",
  };
}
