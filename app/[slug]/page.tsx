import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SitePreview } from "@/components/editor/site-preview";
import { getPublicCandidateSite } from "@/lib/data/public-site";

type PublicSitePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PublicSitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPublicCandidateSite(slug);
  if (!site) return { title: "Stránka nie je dostupná", robots: { index: false, follow: false } };

  return {
    alternates: { canonical: site.canonicalUrl },
    description: site.description,
    openGraph: {
      description: site.description,
      images: site.socialImageUrl ? [{ url: site.socialImageUrl }] : undefined,
      title: site.title,
      type: "website",
      url: site.canonicalUrl,
    },
    robots: { index: true, follow: true },
    title: { absolute: site.title },
  };
}

export default async function PublicSitePage({ params }: PublicSitePageProps) {
  const { slug } = await params;
  const site = await getPublicCandidateSite(slug);
  if (!site) notFound();

  return (
    <main className="public-candidate-page">
      <SitePreview data={site.data} publicMode siteId={site.siteId} />
    </main>
  );
}
