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

export const PLAN_DESCRIPTIONS = {
  basic: "Profesionálny základ pre vašu kandidatúru.",
  plus: "Viac podpory pre pravidelnú komunikáciu.",
} as const satisfies Record<PaidPlanCode, string>;

const SHARED_PLAN_FEATURES = [
  "Web na subdoméne WebPreKandidata.sk",
  "Všetky základné sekcie a editor",
  "AI návrh prvotného obsahu",
  "Aktuality, galéria a e-mailový kontakt",
  "Základné SEO, zdieľanie a hosting",
] as const;

export const PLAN_FEATURES = {
  basic: [
    ...SHARED_PLAN_FEATURES,
    "Štandardná e-mailová podpora",
  ],
  plus: [
    ...SHARED_PLAN_FEATURES,
    "Pripojenie jednej existujúcej vlastnej domény",
    "Najviac 20 AI návrhov článkov",
    "Prioritná e-mailová podpora",
  ],
} as const satisfies Record<PaidPlanCode, readonly string[]>;

export const BASIC_UNAVAILABLE_FEATURES = [
  "Pripojenie vlastnej domény",
  "AI pomoc s tvorbou článkov",
] as const;

export function isPaidPlanCode(value: string): value is PaidPlanCode {
  return PAID_PLAN_CODES.includes(value as PaidPlanCode);
}

export function getPlanTotalCents(planCode: PaidPlanCode): number {
  return PLAN_PRICES_CENTS[planCode];
}

export function assertCheckoutAmountMatchesPlan(
  planCode: PaidPlanCode,
  amountTotal: number | null,
  currency: string | null,
) {
  if (currency?.toLowerCase() !== "eur") {
    throw new Error("order_currency_mismatch");
  }
  if (amountTotal !== getPlanTotalCents(planCode)) {
    throw new Error("order_amount_mismatch");
  }
}
