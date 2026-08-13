import type { PaidPlanCode } from "../payments/plans";

/** Owner-locked: Basic/Plus service ends 31 Dec 2026 Europe/Bratislava. */
export const SERVICE_END_ISO_DATE = "2026-12-31";
export const SERVICE_END_TIME_ZONE = "Europe/Bratislava";

/**
 * End of calendar day 2026-12-31 in Europe/Bratislava as UTC instant.
 * Bratislava is UTC+1 in winter → 2026-12-31 23:59:59.999 +01:00.
 */
export function getServiceEndsAt(): Date {
  return new Date("2026-12-31T22:59:59.999Z");
}

export function getServiceEndsAtIso(): string {
  return getServiceEndsAt().toISOString();
}

export function formatServiceDurationLabel(locale = "sk-SK") {
  const formatted = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: SERVICE_END_TIME_ZONE,
  }).format(getServiceEndsAt());
  return `do ${formatted}`;
}

export function describePlanDuration(planCode: PaidPlanCode) {
  return {
    planCode,
    endsAt: getServiceEndsAtIso(),
    label: formatServiceDurationLabel(),
    rule: "fixed_end_date" as const,
    endDate: SERVICE_END_ISO_DATE,
  };
}

export const WITHDRAWAL_WINDOW_DAYS = 14;

export function computePublicActivationAt(input: {
  paidAt: Date;
  customerType: "b2c" | "b2b";
  earlyPerformanceRequested: boolean;
}): Date {
  if (input.customerType === "b2b" || input.earlyPerformanceRequested) {
    return input.paidAt;
  }
  const activation = new Date(input.paidAt);
  activation.setUTCDate(activation.getUTCDate() + WITHDRAWAL_WINDOW_DAYS);
  return activation;
}
