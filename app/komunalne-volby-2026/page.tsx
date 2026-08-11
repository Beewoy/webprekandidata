import { CampaignPage } from "@/components/marketing/campaign-page";
import { getCampaignMetadata, getCampaignPage } from "@/lib/marketing/campaign-pages";

const route = "/komunalne-volby-2026" as const;

export const dynamic = "force-static";
export const metadata = getCampaignMetadata(route);

export default function MunicipalElectionCampaignPage() {
  return <CampaignPage page={getCampaignPage(route)} />;
}
