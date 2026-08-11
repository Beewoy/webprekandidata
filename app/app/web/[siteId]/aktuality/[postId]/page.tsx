import { notFound } from "next/navigation";
import { PostEditor } from "@/components/editor/post-editor";
import { getSitePost } from "@/lib/data/posts";

export default async function PostEditorPage({ params }: { params: Promise<{ siteId: string; postId: string }> }) {
  const { postId, siteId } = await params;
  const data = await getSitePost(siteId, postId);
  if (!data) notFound();
  return <PostEditor ai={data.ai} initialPost={data.post} siteId={siteId} />;
}
