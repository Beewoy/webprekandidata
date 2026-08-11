import { Check, Clock3, Circle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SectionStatus } from "@/lib/site-sections";

const labels = { complete: "Dokončené", started: "Rozpracované", empty: "Nezačaté" };

export function StatusPill({ status }: { status: SectionStatus }) {
  const Icon = status === "complete" ? Check : status === "started" ? Clock3 : Circle;
  return <span className={cn("status-pill", `status-pill--${status}`)}><Icon size={13} />{labels[status]}</span>;
}
