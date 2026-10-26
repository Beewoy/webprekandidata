import type { Metadata } from "next";
import { PlatformMaintenance } from "@/components/marketing/platform-maintenance";

export const metadata: Metadata = {
  title: "Prevádzka je pozastavená",
  description: "WebPreKandidata.sk je momentálne mimo prevádzky.",
  robots: { index: false, follow: false },
};

export default function PlatformMaintenancePage() {
  return <PlatformMaintenance />;
}
