import { notFound } from "next/navigation";
import { AppearanceEditor } from "@/components/editor/appearance-editor";
import { DomainEditor } from "@/components/editor/domain-editor";
import { GalleryEditor } from "@/components/editor/gallery-editor";
import { ImageEditor } from "@/components/editor/image-editor";
import { NewsEditor } from "@/components/editor/news-editor";
import { PublishingEditor } from "@/components/editor/publishing-editor";
import { SectionForm } from "@/components/editor/section-form";
import { SitePreview } from "@/components/editor/site-preview";
import { getEmailVerificationStatus } from "@/lib/data/account";
import { getSiteDomainState } from "@/lib/data/domains";
import { listSiteOrders } from "@/lib/data/orders";
import { getSitePosts } from "@/lib/data/posts";
import { getPublishingState } from "@/lib/data/publishing";
import { getSectionDraft, getSiteGallery, getSiteMedia, getSitePreviewData, getSiteThemeDraft } from "@/lib/data/sites";
import { isDemoMode } from "@/lib/env";
import { parseCheckoutReturnState } from "@/lib/payments/checkout-return";
import { isStripeConfigured } from "@/lib/payments/stripe";
import { editorFields, getSection } from "@/lib/site-sections";

export default async function EditorSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string; section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { siteId, section: slug } = await params;
  const section = getSection(slug);
  if (!section) notFound();

  if (slug === "vzhlad") {
    const draft = await getSiteThemeDraft(siteId);
    if (!draft) notFound();
    return <AppearanceEditor initialRevision={draft.revision} initialTheme={{ color: draft.color, template: draft.template }} siteId={siteId} />;
  }
  if (slug === "obrazky") {
    const assets = await getSiteMedia(siteId);
    if (!assets) notFound();
    return <ImageEditor initialAssets={assets} siteId={siteId} />;
  }
  if (slug === "galeria") {
    const gallery = await getSiteGallery(siteId);
    if (!gallery) notFound();
    return <GalleryEditor initialAssets={gallery.assets} initialStorageUsedBytes={gallery.storageUsedBytes} siteId={siteId} />;
  }
  if (slug === "aktuality") {
    const news = await getSitePosts(siteId);
    if (!news) notFound();
    return <NewsEditor ai={news.ai} initialPosts={news.posts} siteId={siteId} />;
  }
  if (slug === "domena") {
    const domainState = await getSiteDomainState(siteId);
    if (!domainState) notFound();
    return <DomainEditor siteId={siteId} state={domainState} />;
  }
  if (slug === "nahlad") {
    const preview = await getSitePreviewData(siteId);
    if (!preview) notFound();
    return <SitePreview data={preview} siteId={siteId} />;
  }
  if (slug === "publikovanie") {
    const [publishingState, orders, account, query] = await Promise.all([
      getPublishingState(siteId),
      listSiteOrders(siteId),
      getEmailVerificationStatus(),
      searchParams,
    ]);
    if (!publishingState) notFound();
    return (
      <PublishingEditor
        checkoutEnabled={isStripeConfigured()}
        checkoutNotice={parseCheckoutReturnState({ checkout: query.checkout, entitled: publishingState.entitled })}
        defaultEmail={account.email}
        defaultFullName={account.fullName}
        isDemo={isDemoMode() || siteId === "demo"}
        orders={orders}
        publishingState={publishingState}
        siteId={siteId}
      />
    );
  }
  if (editorFields[slug]) {
    const draft = await getSectionDraft(siteId, slug);
    if (!draft) notFound();
    return <SectionForm siteId={siteId} sectionSlug={slug} initialValues={draft.values} initialRevision={draft.revision} />;
  }

  notFound();
}
