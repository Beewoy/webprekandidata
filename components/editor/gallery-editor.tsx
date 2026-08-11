"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent, type KeyboardEvent, type PointerEvent } from "react";
import { AlertCircle, Check, GripVertical, ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import {
  deleteGalleryAssetAction,
  registerGalleryAssetAction,
  reorderGalleryAssetsAction,
  updateGalleryAssetAction,
} from "@/app/actions/sites";
import { PageHeading } from "@/components/ui/page-heading";
import { createClient } from "@/lib/supabase/client";
import { galleryCaptionFromFilename, prepareGalleryImage } from "@/lib/gallery-image";
import { moveGalleryAsset } from "@/lib/gallery-order";
import { galleryLimits, type GalleryMediaAsset } from "@/lib/site-media";

type GalleryEditorProps = {
  initialAssets: GalleryMediaAsset[];
  initialStorageUsedBytes: number;
  siteId: string;
};

function formatMegabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toLocaleString("sk-SK", { maximumFractionDigits: 1 })} MB`;
}

export function GalleryEditor({ initialAssets, initialStorageUsedBytes, siteId }: GalleryEditorProps) {
  const [assets, setAssets] = useState(initialAssets);
  const assetsRef = useRef(assets);
  const [storageUsedBytes, setStorageUsedBytes] = useState(initialStorageUsedBytes);
  const [status, setStatus] = useState<"saved" | "saving" | "error">("saved");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const activeDragIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const storagePercent = Math.min(100, storageUsedBytes / galleryLimits.maxProjectBytes * 100);
  const canUpload = assets.length < galleryLimits.maxAssets && storageUsedBytes < galleryLimits.maxProjectBytes && siteId !== "demo";

  function replaceAssets(next: GalleryMediaAsset[]) {
    assetsRef.current = next;
    setAssets(next);
  }

  function showError(errorMessage: string) {
    setMessage(errorMessage);
    setStatus("error");
  }

  async function saveOrder(next: GalleryMediaAsset[]) {
    setStatus("saving");
    const result = await reorderGalleryAssetsAction({ assetIds: next.map((asset) => asset.id), siteId });
    if (!result.ok) return showError(result.message);
    setMessage("");
    setStatus("saved");
  }

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selectedFiles.length || uploading) return;
    const availableSlots = galleryLimits.maxAssets - assetsRef.current.length;
    if (selectedFiles.length > availableSlots) return showError(`Môžete pridať ešte najviac ${availableSlots} fotografií.`);

    setUploading(true);
    setStatus("saving");
    const supabase = createClient();
    let projectedStorageBytes = storageUsedBytes;
    try {
      for (const file of selectedFiles) {
        const prepared = await prepareGalleryImage(file);
        if (projectedStorageBytes + prepared.blob.size > galleryLimits.maxProjectBytes) throw new Error("Vybrané fotografie sa nezmestia do 15 MB úložiska projektu.");
        const assetId = crypto.randomUUID();
        const storagePath = `${siteId}/${assetId}/gallery.webp`;
        const { error: uploadError } = await supabase.storage.from("candidate-media").upload(storagePath, prepared.blob, { cacheControl: "31536000", contentType: "image/webp", upsert: false });
        if (uploadError) throw new Error("Fotografiu sa nepodarilo nahrať. Skúste to znova.");

        const result = await registerGalleryAssetAction({
          assetId,
          caption: galleryCaptionFromFilename(file.name),
          height: prepared.height,
          siteId,
          storagePath,
          width: prepared.width,
        });
        if (!result.ok) {
          await supabase.storage.from("candidate-media").remove([storagePath]);
          throw new Error(result.message);
        }
        replaceAssets([...assetsRef.current, result.asset]);
        projectedStorageBytes += result.asset.byteSize;
        setStorageUsedBytes((current) => current + result.asset.byteSize);
      }
      setMessage("");
      setStatus("saved");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Fotografie sa nepodarilo nahrať.");
    } finally {
      setUploading(false);
    }
  }

  function updateCaption(assetId: string, caption: string) {
    replaceAssets(assetsRef.current.map((asset) => asset.id === assetId ? { ...asset, altText: caption || "Fotografia z kampane", caption } : asset));
  }

  async function saveCaption(asset: GalleryMediaAsset) {
    setBusyId(asset.id);
    setStatus("saving");
    const result = await updateGalleryAssetAction({ assetId: asset.id, caption: asset.caption, siteId });
    setBusyId(null);
    if (!result.ok) return showError(result.message);
    setMessage("");
    setStatus("saved");
  }

  async function removeAsset(asset: GalleryMediaAsset) {
    if (!window.confirm(`Odstrániť fotografiu${asset.caption ? ` „${asset.caption}“` : ""}? Táto akcia sa nedá vrátiť.`)) return;
    setBusyId(asset.id);
    setStatus("saving");
    const result = await deleteGalleryAssetAction({ assetId: asset.id, siteId });
    setBusyId(null);
    if (!result.ok) return showError(result.message);
    const next = assetsRef.current.filter((item) => item.id !== asset.id).map((item, index) => ({ ...item, sortOrder: index }));
    replaceAssets(next);
    setStorageUsedBytes((current) => Math.max(0, current - result.reclaimedBytes));
    if (next.length) await saveOrder(next);
    else setStatus("saved");
  }

  function moveWithKeyboard(event: KeyboardEvent<HTMLButtonElement>, assetId: string) {
    const currentIndex = assetsRef.current.findIndex((asset) => asset.id === assetId);
    const targetIndex = event.key === "ArrowUp" || event.key === "ArrowLeft"
      ? currentIndex - 1
      : event.key === "ArrowDown" || event.key === "ArrowRight"
        ? currentIndex + 1
        : currentIndex;
    if (targetIndex === currentIndex || targetIndex < 0 || targetIndex >= assetsRef.current.length) return;
    event.preventDefault();
    const next = moveGalleryAsset(assetsRef.current, assetId, targetIndex);
    replaceAssets(next);
    void saveOrder(next);
  }

  function beginDrag(event: PointerEvent<HTMLButtonElement>, assetId: string) {
    activeDragIdRef.current = assetId;
    setDraggedId(assetId);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function continueDrag(event: PointerEvent<HTMLButtonElement>) {
    const assetId = activeDragIdRef.current;
    if (!assetId) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-gallery-id]");
    const targetId = target?.dataset.galleryId;
    if (!targetId || targetId === assetId) return;
    const targetIndex = assetsRef.current.findIndex((asset) => asset.id === targetId);
    if (targetIndex >= 0) replaceAssets(moveGalleryAsset(assetsRef.current, assetId, targetIndex));
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    activeDragIdRef.current = null;
    setDraggedId(null);
    void saveOrder(assetsRef.current);
  }

  return (
    <div className="page-container">
      <PageHeading eyebrow="Médiá" title="Galéria" description="Ukážte ľuďom stretnutia, podujatia a život vašej kampane." action={(
        <span className="save-state" aria-live="polite">
          {status === "saved" && <><Check size={15} /> Všetky zmeny uložené</>}
          {status === "saving" && <><LoaderCircle className="spin" size={15} /> Ukladám…</>}
          {status === "error" && <><AlertCircle size={15} /> Uloženie zlyhalo</>}
        </span>
      )} />

      {status === "error" && <div className="autosave-error" role="alert"><AlertCircle size={18} /><span>{message}</span></div>}
      <section className="editor-card gallery-editor">
        <div className="editor-card__intro">
          <span className="section-symbol"><ImagePlus size={21} /></span>
          <div><h2>Fotografie v galérii</h2><p>Najviac {galleryLimits.maxAssets} fotografií. Obrázky automaticky zmenšíme a uložíme vo formáte WebP.</p></div>
          <button className="button button--primary button--small" disabled={!canUpload || uploading} onClick={() => inputRef.current?.click()} type="button"><Upload size={16} /> {uploading ? "Nahrávam…" : "Pridať fotografie"}</button>
          <input accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={!canUpload || uploading} multiple onChange={uploadFiles} ref={inputRef} type="file" />
        </div>

        <div className="gallery-storage" aria-label={`Použité úložisko ${formatMegabytes(storageUsedBytes)} z 15 MB`}>
          <div><span>Použité úložisko</span><strong>{formatMegabytes(storageUsedBytes)} / 15 MB</strong></div>
          <i><span style={{ width: `${storagePercent}%` }} /></i>
        </div>

        {assets.length ? (
          <div className="gallery-editor__grid">
            {assets.map((asset, index) => (
              <article className={`gallery-editor__item${draggedId === asset.id ? " gallery-editor__item--dragging" : ""}`} data-gallery-id={asset.id} key={asset.id}>
                <div className="gallery-editor__image">
                  <Image alt={asset.altText} height={asset.height} src={asset.previewUrl} unoptimized width={asset.width} />
                  <span>{index + 1}</span>
                  <button aria-label={`Presunúť fotografiu ${index + 1}. Použite potiahnutie alebo šípky.`} className="gallery-drag-handle" onKeyDown={(event) => moveWithKeyboard(event, asset.id)} onPointerCancel={endDrag} onPointerDown={(event) => beginDrag(event, asset.id)} onPointerMove={continueDrag} onPointerUp={endDrag} title="Presunúť fotografiu" type="button"><GripVertical size={17} /></button>
                  <button aria-label={`Odstrániť fotografiu ${index + 1}`} className="gallery-delete" disabled={busyId === asset.id} onClick={() => void removeAsset(asset)} type="button"><Trash2 size={16} /></button>
                </div>
                <label><span>Titulok fotografie</span><input maxLength={160} onBlur={() => void saveCaption(asset)} onChange={(event) => updateCaption(asset.id, event.target.value)} placeholder="Napr. Stretnutie s obyvateľmi" value={asset.caption} /></label>
              </article>
            ))}
          </div>
        ) : (
          <div className="gallery-empty"><ImagePlus size={30} /><h3>Galéria je zatiaľ prázdna</h3><p>Pridajte fotografie zo stretnutí, podujatí alebo verejného života kampane.</p><button className="button button--secondary" disabled={!canUpload} onClick={() => inputRef.current?.click()} type="button"><Upload size={16} /> Vybrať fotografie</button></div>
        )}
      </section>
    </div>
  );
}
