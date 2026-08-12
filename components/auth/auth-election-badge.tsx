import { CalendarDays } from "lucide-react";
import { ElectionCountdown } from "@/components/marketing/election-countdown";
import { ELECTION_DATE_ISO } from "@/lib/marketing/election-countdown";

type AuthElectionBadgeProps = {
  placement: "benefits" | "panel";
};

export function AuthElectionBadge({ placement }: AuthElectionBadgeProps) {
  const isBenefits = placement === "benefits";

  return (
    <div
      className={isBenefits ? "auth-election-badge auth-election-badge--benefits" : "auth-election-badge auth-election-badge--panel"}
      aria-label="Odpočítavanie do komunálnych volieb a volieb do VÚC 2026"
    >
      <p className="auth-election-badge__label">
        <CalendarDays size={16} aria-hidden="true" />
        <span>Komunálne voľby a voľby do VÚC 2026</span>
      </p>
      <ElectionCountdown targetDate={ELECTION_DATE_ISO} variant={isBenefits ? "benefits" : "auth"} />
    </div>
  );
}
