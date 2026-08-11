import { notFound } from "next/navigation";
import { AppearanceEditor } from "@/components/editor/appearance-editor";
import { DomainEditor } from "@/components/editor/domain-editor";
import { GalleryEditor } from "@/components/editor/gallery-editor";
import { ImageEditor } from "@/components/editor/image-editor";
import { NewsEditor } from "@/components/editor/news-editor";
import { PublishingEditor } from "@/components/editor/publishing-editor";
import { SectionForm } from "@/components/editor/section-form";
import { SitePreview } from "@/components/editor/site-preview";
import { editorFields, getSection } from "@/lib/site-sections";
import { getSectionDraft, getSiteGallery, getSiteMedia, getSitePreviewData, getSiteThemeDraft } from "@/lib/data/sites";
import { getSitePosts } from "@/lib/data/posts";
import { getPublishingState } from "@/lib/data/publishing";

export default async function EditorSectionPage({ params }: { params: Promise<{ siteId: string; section: string }> }) {
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
  if (slug === "domena") return <DomainEditor />;
  if (slug === "nahlad") {
    const preview = await getSitePreviewData(siteId);
    if (!preview) notFound();
    return <SitePreview data={preview} siteId={siteId} />;
  }
  if (slug === "publikovanie") {
    const publishingState = await getPublishingState(siteId);
    if (!publishingState) notFound();
    return <PublishingEditor publishingState={publishingState} siteId={siteId} />;
  }
  if (editorFields[slug]) {
    const draft = await getSectionDraft(siteId, slug);
    if (!draft) notFound();
    return <SectionForm siteId={siteId} sectionSlug={slug} initialValues={draft.values} initialRevision={draft.revision} />;
  }

  notFound();
}
