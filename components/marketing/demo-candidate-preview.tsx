import { SitePreview } from "@/components/editor/site-preview";
import { DemoTemplateBar } from "@/components/marketing/demo-template-bar";
import { getDemoSitePreview } from "@/lib/demo/sample-site";
import type { CampaignTemplateId } from "@/lib/site-theme";
import styles from "./demo-candidate-preview.module.css";

export function DemoCandidatePreview({ template }: { template: CampaignTemplateId }) {
  return (
    <div className={styles.shell}>
      <DemoTemplateBar template={template} />
      <SitePreview data={getDemoSitePreview(template)} publicMode siteId="demo" />
    </div>
  );
}
