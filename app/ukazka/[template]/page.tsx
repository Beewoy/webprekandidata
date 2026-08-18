import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoCandidatePreview } from "@/components/marketing/demo-candidate-preview";
import {
  demoTemplateCatalog,
  getDemoPageMetadata,
  getDemoTemplateBySlug,
} from "@/lib/demo/sample-site";

export const dynamic = "force-static";
export const dynamicParams = false;

type DemoTemplatePageProps = {
  params: Promise<{ template: string }>;
};

export function generateStaticParams() {
  return demoTemplateCatalog.map((item) => ({ template: item.slug }));
}

export async function generateMetadata({ params }: DemoTemplatePageProps): Promise<Metadata> {
  const { template } = await params;
  const item = getDemoTemplateBySlug(template);

  if (!item) {
    return { robots: { index: false, follow: false } };
  }

  return getDemoPageMetadata(item.id);
}

export default async function DemoTemplatePage({ params }: DemoTemplatePageProps) {
  const { template } = await params;
  const item = getDemoTemplateBySlug(template);

  if (!item) {
    notFound();
  }

  return <DemoCandidatePreview template={item.id} />;
}
