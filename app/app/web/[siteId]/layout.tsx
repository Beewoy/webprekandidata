import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { getSite, getSiteSectionStatuses } from "@/lib/data/sites";

export default async function SiteLayout({ children, params }: { children: ReactNode; params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const [site, sectionStatuses] = await Promise.all([getSite(siteId), getSiteSectionStatuses(siteId)]);
  if (!site || !sectionStatuses) notFound();
  return <AppShell site={site} sectionStatuses={sectionStatuses}>{children}</AppShell>;
}
