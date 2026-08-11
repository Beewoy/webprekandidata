import { CampaignPage } from "@/components/marketing/campaign-page";
import { getCampaignMetadata, getCampaignPage } from "@/lib/marketing/campaign-pages";

const route = "/kampanovy-web-pre-starostu" as const;

export const dynamic = "force-static";
export const metadata = getCampaignMetadata(route);

export default function MayorCampaignPage() {
  return <CampaignPage page={getCampaignPage(route)} />;
}
