import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { notFound } from "next/navigation";
import { getSite, getSitePreviewData, getSiteSectionStatuses } from "@/lib/data/sites";

export default async function SiteOverviewPage({ params, searchParams }: { params: Promise<{ siteId: string }>; searchParams: Promise<{ onboarding?: string }> }) {
  const [{ siteId }, query] = await Promise.all([params, searchParams]);
  const [site, preview, sectionStatuses] = await Promise.all([getSite(siteId), getSitePreviewData(siteId), getSiteSectionStatuses(siteId)]);
  if (!site || !preview || !sectionStatuses) notFound();
  return <DashboardOverview site={site} preview={preview} sectionStatuses={sectionStatuses} onboardingPartial={query.onboarding === "ciastocny"} />;
}
