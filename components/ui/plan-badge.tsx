import type { SiteSummary } from "@/lib/data/sites";

const planLabels = { basic: "Basic", plus: "Plus" } as const;

export function getPlanLabel(plan: SiteSummary["planCode"]) {
  return plan ? planLabels[plan] : "Free";
}

export function PlanBadge({ plan }: { plan: SiteSummary["planCode"] }) {
  const variant = plan ?? "free";
  const label = getPlanLabel(plan);
  return <span aria-label={`Aktívny balík ${label}`} className={`plan-badge plan-badge--${variant}`}>{label}</span>;
}
