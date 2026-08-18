import type { Metadata } from "next";
import { DemoCandidatePreview } from "@/components/marketing/demo-candidate-preview";
import { getDemoPageMetadata } from "@/lib/demo/sample-site";

export const dynamic = "force-static";
export const metadata: Metadata = getDemoPageMetadata("modern");

export default function HorizontDemoPage() {
  return <DemoCandidatePreview template="modern" />;
}
