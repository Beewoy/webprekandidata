import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { getEmailVerificationStatus } from "@/lib/data/account";
import { getSite, getSiteSectionStatuses } from "@/lib/data/sites";

export default async function SiteLayout({ children, params }: { children: ReactNode; params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const [site, sectionStatuses, verification] = await Promise.all([
    getSite(siteId),
    getSiteSectionStatuses(siteId),
    getEmailVerificationStatus(),
  ]);
  if (!site || !sectionStatuses) notFound();
  return (
    <AppShell
      accountEmail={verification.email}
      emailVerified={verification.verified}
      sectionStatuses={sectionStatuses}
      site={site}
    >
      {children}
    </AppShell>
  );
}
