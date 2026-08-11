"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ChangeEvent } from "react";
import { AlertCircle, ArrowLeft, Check, ChevronDown, ExternalLink, ImagePlus, LoaderCircle, LockKeyhole, Save, Sparkles, Trash2, Upload, WandSparkles, X } from "lucide-react";
import { deletePostAction, deletePostCoverAction, generateArticleAction, registerPostCoverAction, savePostAction } from "@/app/actions/posts";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { prepareGalleryImage } from "@/lib/gallery-image";
import type { PostAiEntitlement, PostDetail, PostStatus } from "@/lib/posts";
import { slugifyPostTitle } from "@/lib/posts";
import { createClient } from "@/lib/supabase/client";

type Tone = "informative" | "personal" | "firm";

function internalPostSlug(title: string, postId: string) {
  return `${slugifyPostTitle(title).slice(0, 81)}-${postId.slice(0, 8)}`;
}

export function PostEditor({ ai, initialPost, siteId }: { ai: PostAiEntitlement; initialPost: PostDetail; siteId: string }) {
  const [post, setPost] = useState(initialPost);
  const [editorVersion, setEditorVersion] = useState(0);
  const [state, setState] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [aiUsed, setAiUsed] = useState(ai.used);
  const [aiOpen, setAiOpen] = useState(false);
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState<Tone>("informative");
  const [isPending, startTransition] = useTransition();
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function warnBeforeLeave(event: BeforeUnloadEvent) {
      if (state !== "dirty") return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [state]);

  function update<K extends keyof PostDetail>(key: K, value: PostDetail[K]) {
    setPost((current) => ({ ...current, [key]: value }));
    setState("dirty");
    setMessage("");
    setMessageIsError(false);
  }

  function updateTitle(title: string) {
    setPost((current) => ({ ...current, title, slug: internalPostSlug(title, current.id) }));
    setState("dirty");
    setMessage("");
    setMessageIsError(false);
  }

  function save() {
    setState("saving");
    setMessage("");
    setMessageIsError(false);
    startTransition(async () => {
      const result = await savePostAction({
        bodyHtml: post.bodyHtml,
        excerpt: post.excerpt,
        postId: post.id,
        revision: post.revision,
        seoDescription: post.seoDescription,
        seoTitle: post.seoTitle,
        siteId,
        slug: post.slug,
        status: post.status,
        title: post.title,
      });
      if (!result.ok) {
        setMessage(result.message);
        setMessageIsError(true);
        setState("error");
        return;
      }
      setPost((current) => ({ ...current, publishedAt: result.publishedAt, revision: result.revision }));
      setState("saved");
      router.refresh();
    });
  }

  function generate() {
    setMessage("");
    setMessageIsError(false);
    startTransition(async () => {
      const result = await generateArticleAction({ brief, postId: post.id, siteId, tone });
      if (!result.ok) {
        setMessage(result.message);
        setMessageIsError(true);
        return;
      }
      const suggestion = result.suggestion;
      setPost((current) => ({
        ...current,
        bodyHtml: suggestion.bodyHtml,
        excerpt: suggestion.excerpt,
        slug: internalPostSlug(suggestion.title, current.id),
        title: suggestion.title,
      }));
      setAiUsed((current) => current + 1);
      setEditorVersion((current) => current + 1);
      setState("dirty");
      setAiOpen(false);
      setMessage("AI návrh je vložený v editore. Pred uložením ho skontrolujte a upravte.");
      setMessageIsError(false);
    });
  }

  function remove() {
    if (!window.confirm(`Odstrániť článok „${post.title}“? Táto akcia sa nedá vrátiť.`)) return;
    startTransition(async () => {
      const result = await deletePostAction({ postId: post.id, siteId });
      if (!result.ok) {
        setMessageIsError(true);
        return setMessage(result.message);
      }
      router.push(`/app/web/${siteId}/aktuality`);
      router.refresh();
    });
  }

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploadingCover || siteId === "demo") return;
    setUploadingCover(true);
    setMessage("");
    setMessageIsError(false);
    try {
      const prepared = await prepareGalleryImage(file);
      const assetId = crypto.randomUUID();
      const storagePath = `${siteId}/${assetId}/post.webp`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("candidate-media").upload(storagePath, prepared.blob, { cacheControl: "31536000", contentType: "image/webp", upsert: false });
      if (error) throw new Error("Obrázok sa nepodarilo nahrať.");
      const result = await registerPostCoverAction({
        altText: post.title ? `Titulný obrázok článku ${post.title}` : "Titulný obrázok článku",
        assetId,
        height: prepared.height,
        postId: post.id,
        siteId,
        storagePath,
        width: prepared.width,
      });
      if (!result.ok) {
        await supabase.storage.from("candidate-media").remove([storagePath]);
        throw new Error(result.message);
      }
      setPost((current) => ({ ...current, cover: result.cover }));
      setMessage("Titulný obrázok bol uložený.");
      setMessageIsError(false);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Obrázok sa nepodarilo nahrať.");
      setMessageIsError(true);
    } finally {
      setUploadingCover(false);
    }
  }

  function deleteCover() {
    if (!post.cover || !window.confirm("Odstrániť titulný obrázok článku?")) return;
    startTransition(async () => {
      const result = await deletePostCoverAction({ postId: post.id, siteId });
      if (!result.ok) {
        setMessageIsError(true);
        return setMessage(result.message);
      }
      setPost((current) => ({ ...current, cover: null }));
      setMessage("Titulný obrázok bol odstránený.");
      setMessageIsError(false);
      router.refresh();
    });
  }

  const remainingAi = Math.max(0, ai.limit - aiUsed);
  return (
    <div className="page-container page-container--wide post-editor-page">
      <div className="post-editor-topbar">
        <Link className="back-link" href={`/app/web/${siteId}/aktuality`}><ArrowLeft size={16} /> Späť na aktuality</Link>
        <div className="post-editor-topbar__actions">
          <span className={`save-state${state === "error" ? " save-state--error" : ""}`} aria-live="polite">
            {state === "saved" && <><Check size={15} /> Uložené</>}
            {state === "dirty" && <>Máte neuložené zmeny</>}
            {state === "saving" && <><LoaderCircle className="spin" size={15} /> Ukladám…</>}
            {state === "error" && <><AlertCircle size={15} /> Uloženie zlyhalo</>}
          </span>
          <button className="button button--primary" disabled={isPending || state === "saving"} onClick={save} type="button"><Save size={16} /> Uložiť článok</button>
        </div>
      </div>

      {message && <div className={messageIsError ? "autosave-error" : "post-editor-notice"} role={messageIsError ? "alert" : "status"}>{message}</div>}

      <div className="post-editor-layout">
        <main className="post-editor-main">
          <section className="editor-card post-editor-card">
            <div className="post-editor-card__heading"><div><p className="eyebrow">Obsah článku</p><h1>{post.title || "Nový článok"}</h1></div><label className="post-status-select"><span>Stav</span><select onChange={(event) => update("status", event.target.value as PostStatus)} value={post.status}><option value="draft">Koncept</option><option value="published">Zverejnený</option><option value="archived">Skrytý</option></select><ChevronDown size={15} /></label></div>
            <div className="post-editor-fields">
              <label className="field"><span>Nadpis *</span><input maxLength={140} onChange={(event) => updateTitle(event.target.value)} value={post.title} /></label>
              <label className="field"><span>Krátky popis</span><textarea maxLength={320} onChange={(event) => update("excerpt", event.target.value)} rows={3} value={post.excerpt} /><small>{post.excerpt.length} / 320 · zobrazí sa v zozname aktualít</small></label>
              <div className="field"><span id="post-body-label">Text článku</span><RichTextEditor initialValue={post.bodyHtml} key={editorVersion} labelledBy="post-body-label" name="body" onChange={(value) => update("bodyHtml", value)} /></div>
            </div>
          </section>

          <section className="editor-card post-editor-card">
            <div className="post-editor-section-title"><h2>Titulný obrázok</h2><p>Zobrazí sa na karte aktuality aj v otvorenom detaile.</p></div>
            <div className="post-cover-editor">
              {post.cover ? <div className="post-cover-preview"><Image alt={post.cover.altText} height={post.cover.height} src={post.cover.previewUrl} unoptimized width={post.cover.width} /><button aria-label="Odstrániť titulný obrázok" className="post-cover-remove" disabled={isPending} onClick={deleteCover} type="button"><X size={17} /></button></div> : <button className="post-cover-empty" disabled={siteId === "demo" || uploadingCover} onClick={() => coverInputRef.current?.click()} type="button"><ImagePlus size={27} /><strong>Pridať titulný obrázok</strong><span>JPG, PNG alebo WebP · automaticky optimalizujeme</span></button>}
              <div className="post-cover-actions"><button className="button button--secondary button--small" disabled={siteId === "demo" || uploadingCover} onClick={() => coverInputRef.current?.click()} type="button">{uploadingCover ? <LoaderCircle className="spin" size={16} /> : <Upload size={16} />} {post.cover ? "Zmeniť obrázok" : "Vybrať obrázok"}</button><small>Odporúčaný široký záber. Súbor sa započítava do 15 MB úložiska projektu.</small></div>
              <input accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={siteId === "demo" || uploadingCover} onChange={uploadCover} ref={coverInputRef} type="file" />
            </div>
          </section>

          <section className="post-danger-zone"><div><strong>Odstrániť článok</strong><p>Článok zmizne z editora aj náhľadu.</p></div><button className="button button--danger-outline" disabled={isPending} onClick={remove} type="button"><Trash2 size={16} /> Odstrániť</button></section>
        </main>

        <aside className="post-ai-panel">
          <div className="post-ai-panel__heading"><span><WandSparkles size={21} /></span><div><p className="eyebrow">AI asistent</p><h2>Návrh článku</h2></div></div>
          {ai.canUseAi ? (
            <>
              <p>Popíšte fakty, udalosť alebo stanovisko. AI pripraví návrh, ktorý pred uložením skontrolujete.</p>
              <div className="post-ai-quota"><Sparkles size={15} /><span>Zostáva <strong>{remainingAi} z {ai.limit}</strong> návrhov</span></div>
              <button aria-expanded={aiOpen} className="button button--secondary post-ai-toggle" disabled={remainingAi === 0} onClick={() => setAiOpen((current) => !current)} type="button"><Sparkles size={16} /> {aiOpen ? "Zavrieť podklady" : "Pripraviť AI návrh"}</button>
              {aiOpen && <div className="post-ai-form"><label><span>Podklady *</span><textarea maxLength={5000} onChange={(event) => setBrief(event.target.value)} placeholder="Čo sa stalo, kde, kedy a čo chcete ľuďom odkázať? Uveďte iba overené fakty." rows={8} value={brief} /><small>{brief.length} / 5 000</small></label><label><span>Tón článku</span><select onChange={(event) => setTone(event.target.value as Tone)} value={tone}><option value="informative">Vecný a informačný</option><option value="personal">Osobný a ľudský</option><option value="firm">Rozhodný a stručný</option></select></label><button className="button button--primary" disabled={isPending || brief.trim().length < 30} onClick={generate} type="button">{isPending ? <LoaderCircle className="spin" size={16} /> : <WandSparkles size={16} />} Vytvoriť návrh</button><small className="post-ai-disclaimer">AI môže urobiť chybu. Skontrolujte fakty, mená a dátumy. Návrh sa nikdy nezverejní automaticky.</small></div>}
            </>
          ) : (
            <div className="post-ai-locked"><span><LockKeyhole size={21} /></span><h3>Dostupné v balíku Plus</h3><p>Basic obsahuje plnohodnotný manuálny editor. AI návrhy článkov sa odomknú po zaplatení Plus.</p><Link className="button button--secondary" href={`/app/web/${siteId}/publikovanie`}>Pozrieť balík Plus <ExternalLink size={15} /></Link></div>
          )}
        </aside>
      </div>
    </div>
  );
}
