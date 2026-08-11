"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, CalendarDays, FilePenLine, LoaderCircle, LockKeyhole, Newspaper, Plus, Sparkles, Trash2 } from "lucide-react";
import { createPostAction, deletePostAction } from "@/app/actions/posts";
import { PageHeading } from "@/components/ui/page-heading";
import type { PostAiEntitlement, PostSummary, PostStatus } from "@/lib/posts";

const statusLabels: Record<PostStatus, string> = { archived: "Skrytý", draft: "Koncept", published: "Zverejnený" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "short", timeZone: "Europe/Bratislava", year: "numeric" }).format(new Date(value));
}

export function NewsEditor({ ai, initialPosts, siteId }: { ai: PostAiEntitlement; initialPosts: PostSummary[]; siteId: string }) {
  const [posts, setPosts] = useState(initialPosts);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function createPost() {
    setMessage("");
    startTransition(async () => {
      const result = await createPostAction({ siteId });
      if (!result.ok) return setMessage(result.message);
      router.push(`/app/web/${siteId}/aktuality/${result.postId}`);
    });
  }

  function removePost(post: PostSummary) {
    if (!window.confirm(`Odstrániť článok „${post.title}“? Táto akcia sa nedá vrátiť.`)) return;
    setMessage("");
    startTransition(async () => {
      const result = await deletePostAction({ postId: post.id, siteId });
      if (!result.ok) return setMessage(result.message);
      setPosts((current) => current.filter((item) => item.id !== post.id));
      router.refresh();
    });
  }

  return (
    <div className="page-container">
      <PageHeading eyebrow="Komunikácia" title="Aktuality" description="Zverejňujte novinky z kampane, podujatia a stanoviská." action={<button className="button button--primary" disabled={isPending} onClick={createPost} type="button">{isPending ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />} Nový článok</button>} />
      {message && <div className="autosave-error" role="alert">{message}</div>}

      {posts.length === 0 ? (
        <section className="panel empty-state">
          <span className="empty-state__icon"><Newspaper size={29} /></span>
          <h2>Zatiaľ tu nemáte žiadne aktuality</h2>
          <p>Prvý článok môže predstaviť vašu kandidatúru, pozvať ľudí na stretnutie alebo vysvetliť jednu programovú prioritu.</p>
          <button className="button button--primary" disabled={isPending} onClick={createPost} type="button"><Plus size={17} /> Vytvoriť prvý článok</button>
          <div className="empty-tips">
            <span><CalendarDays size={17} /><strong>Pravidelnosť pomáha</strong><small>Stačí jedna zmysluplná aktualita týždenne.</small></span>
            <span>{ai.canUseAi ? <Sparkles size={17} /> : <LockKeyhole size={17} />}<strong>AI návrh textu</strong><small>{ai.canUseAi ? `V balíku Plus máte ešte ${Math.max(0, ai.limit - ai.used)} návrhov.` : "AI tvorba článkov je dostupná v balíku Plus."}</small></span>
          </div>
        </section>
      ) : (
        <section className="news-list" aria-label="Zoznam aktualít">
          <div className="news-list__summary"><div><strong>{posts.length}</strong><span>{posts.length === 1 ? "článok" : posts.length < 5 ? "články" : "článkov"}</span></div><p>Koncepty môžete upravovať bez toho, aby ich návštevníci videli.</p></div>
          <div className="news-list__items">
            {posts.map((post) => (
              <article className="news-card" key={post.id}>
                <span className="news-card__icon"><FilePenLine size={20} /></span>
                <div className="news-card__content">
                  <div><span className={`post-status post-status--${post.status}`}>{statusLabels[post.status]}</span><small>Upravené {formatDate(post.updatedAt)}</small></div>
                  <h2><Link href={`/app/web/${siteId}/aktuality/${post.id}`}>{post.title}</Link></h2>
                  <p>{post.excerpt || "Krátky popis zatiaľ nie je doplnený."}</p>
                </div>
                <div className="news-card__actions"><Link aria-label={`Upraviť článok ${post.title}`} className="button button--secondary button--small" href={`/app/web/${siteId}/aktuality/${post.id}`}>Upraviť <ArrowRight size={15} /></Link><button aria-label={`Odstrániť článok ${post.title}`} className="icon-button icon-button--danger" disabled={isPending} onClick={() => removePost(post)} type="button"><Trash2 size={16} /></button></div>
              </article>
            ))}
          </div>
        </section>
      )}

      {!ai.canUseAi && <Link className="text-link" href={`/app/web/${siteId}/publikovanie`}>Pozrieť možnosti balíka Plus <ArrowRight size={15} /></Link>}
    </div>
  );
}
