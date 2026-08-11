export const PAID_PLAN_CODES = ["basic", "plus"] as const;

export type PaidPlanCode = (typeof PAID_PLAN_CODES)[number];

export const PLAN_PRICES_CENTS = {
  basic: 4999,
  plus: 8999,
} as const satisfies Record<PaidPlanCode, number>;

export const PLAN_LABELS = {
  basic: "Basic",
  plus: "Plus",
} as const satisfies Record<PaidPlanCode, string>;

export const PLAN_PRICE_LABELS = {
  basic: "49,99 €",
  plus: "89,99 €",
} as const satisfies Record<PaidPlanCode, string>;

export function isPaidPlanCode(value: string): value is PaidPlanCode {
  return PAID_PLAN_CODES.includes(value as PaidPlanCode);
}

export function getPlanTotalCents(planCode: PaidPlanCode): number {
  return PLAN_PRICES_CENTS[planCode];
}
