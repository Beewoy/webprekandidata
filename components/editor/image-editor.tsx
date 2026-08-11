"use client";

/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AlertCircle, Check, ImagePlus, Images, LoaderCircle, Move, Upload, X, ZoomIn } from "lucide-react";
import { registerMediaAssetAction } from "@/app/actions/sites";
import { PageHeading } from "@/components/ui/page-heading";
import { calculateCropGeometry, fitOutputSize } from "@/lib/image-crop";
import { createClient } from "@/lib/supabase/client";
import { mediaSlots, type MediaSlot, type SiteMediaAsset } from "@/lib/site-media";

const MAX_SOURCE_SIZE = 15 * 1024 * 1024;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type CropDraft = {
  altText: string;
  fileName: string;
  imageHeight: number;
  imageWidth: number;
  slot: MediaSlot;
  sourceUrl: string;
};

type UploadState = "idle" | "preparing" | "uploading" | "saving";

function fileMatchesMimeType(file: File, bytes: Uint8Array) {
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  if (file.type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

function loadImageDimensions(sourceUrl: string) {
  return new Promise<{ height: number; width: number }>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve({ height: image.naturalHeight, width: image.naturalWidth });
    image.onerror = () => reject(new Error("invalid_image"));
    image.src = sourceUrl;
  });
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("canvas_export_failed")), "image/webp", 0.88);
  });
}

export function ImageEditor({ initialAssets, siteId }: { initialAssets: SiteMediaAsset[]; siteId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startClientX: number; startClientY: number; startOffsetX: number; startOffsetY: number } | null>(null);
  const demoObjectUrlsRef = useRef<string[]>([]);
  const busyRef = useRef(false);
  const [assets, setAssets] = useState(initialAssets);
  const [selectedSlot, setSelectedSlot] = useState<MediaSlot>(mediaSlots[0]);
  const [draft, setDraft] = useState<CropDraft | null>(null);
  const [frameSize, setFrameSize] = useState({ height: 400, width: 400 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const isBusy = uploadState !== "idle";

  const assetByKind = useMemo(() => new Map(assets.map((asset) => [asset.kind, asset])), [assets]);
  const geometry = useMemo(() => draft ? calculateCropGeometry({
    frameHeight: frameSize.height,
    frameWidth: frameSize.width,
    imageHeight: draft.imageHeight,
    imageWidth: draft.imageWidth,
    offsetX: offset.x,
    offsetY: offset.y,
    zoom,
  }) : null, [draft, frameSize, offset, zoom]);

  useEffect(() => {
    busyRef.current = isBusy;
  }, [isBusy]);

  const closeCropper = useCallback(() => {
    if (busyRef.current) return;
    if (draft) URL.revokeObjectURL(draft.sourceUrl);
    setDraft(null);
    setError("");
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  }, [draft]);

  function finishCropper() {
    if (draft) URL.revokeObjectURL(draft.sourceUrl);
    setDraft(null);
    setError("");
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  }

  useEffect(() => {
    const objectUrls = demoObjectUrlsRef.current;
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (!draft || !frameRef.current) return;
    const frame = frameRef.current;
    const updateSize = () => {
      const rect = frame.getBoundingClientRect();
      setFrameSize({ height: rect.height, width: rect.width });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [draft]);

  useEffect(() => {
    if (!draft) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalRef.current?.querySelector<HTMLElement>("button")?.focus();

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCropper();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [tabindex="0"]');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeCropper, draft]);

  function chooseFile(slot: MediaSlot) {
    setSelectedSlot(slot);
    setError("");
    setNotice("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }

  async function prepareFile(file: File | undefined) {
    if (!file) return;
    setUploadState("preparing");
    setError("");
    if (!acceptedTypes.has(file.type)) {
      setError("Vyberte obrázok vo formáte JPEG, PNG alebo WebP.");
      setUploadState("idle");
      return;
    }
    if (file.size <= 0 || file.size > MAX_SOURCE_SIZE) {
      setError("Obrázok môže mať najviac 15 MB.");
      setUploadState("idle");
      return;
    }

    let signature: Uint8Array;
    try {
      signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    } catch {
      setError("Súbor sa nepodarilo načítať. Skúste ho vybrať znova.");
      setUploadState("idle");
      return;
    }
    if (!fileMatchesMimeType(file, signature)) {
      setError("Obsah súboru nezodpovedá jeho obrázkovému formátu.");
      setUploadState("idle");
      return;
    }

    const sourceUrl = URL.createObjectURL(file);
    try {
      const dimensions = await loadImageDimensions(sourceUrl);
      if (dimensions.width < 320 || dimensions.height < 320) {
        URL.revokeObjectURL(sourceUrl);
        setError("Obrázok je príliš malý. Použite fotografiu s rozmermi aspoň 320 × 320 px.");
        setUploadState("idle");
        return;
      }
      if (dimensions.width > 12000 || dimensions.height > 12000 || dimensions.width * dimensions.height > 50_000_000) {
        URL.revokeObjectURL(sourceUrl);
        setError("Obrázok má príliš veľké rozmery. Použite fotografiu najviac 12 000 px na stranu.");
        setUploadState("idle");
        return;
      }
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setDraft({
        altText: assetByKind.get(selectedSlot.kind)?.altText || selectedSlot.defaultAlt,
        fileName: file.name,
        imageHeight: dimensions.height,
        imageWidth: dimensions.width,
        slot: selectedSlot,
        sourceUrl,
      });
    } catch {
      URL.revokeObjectURL(sourceUrl);
      setError("Obrázok sa nepodarilo otvoriť. Skúste iný súbor.");
    } finally {
      setUploadState("idle");
    }
  }

  function moveCrop(deltaX: number, deltaY: number) {
    setOffset((current) => ({ x: current.x + deltaX, y: current.y + deltaY }));
  }

  function handleCropKeys(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 25 : 8;
    if (event.key === "ArrowLeft") moveCrop(-step, 0);
    else if (event.key === "ArrowRight") moveCrop(step, 0);
    else if (event.key === "ArrowUp") moveCrop(0, -step);
    else if (event.key === "ArrowDown") moveCrop(0, step);
    else return;
    event.preventDefault();
  }

  function beginDrag(event: PointerEvent<HTMLDivElement>) {
    if (!geometry) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startOffsetX: geometry.offsetX,
      startOffsetY: geometry.offsetY,
    };
  }

  function continueDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    setOffset({
      x: dragRef.current.startOffsetX + event.clientX - dragRef.current.startClientX,
      y: dragRef.current.startOffsetY + event.clientY - dragRef.current.startClientY,
    });
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (geometry) setOffset({ x: geometry.offsetX, y: geometry.offsetY });
    dragRef.current = null;
  }

  async function saveCrop() {
    if (!draft || !geometry) return;
    setUploadState("preparing");
    setError("");

    try {
      const image = new window.Image();
      image.src = draft.sourceUrl;
      await image.decode();
      const output = fitOutputSize(geometry.sourceWidth, geometry.sourceHeight, draft.slot.width, draft.slot.height);
      const canvas = document.createElement("canvas");
      canvas.width = output.width;
      canvas.height = output.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas_unavailable");
      context.drawImage(
        image,
        geometry.sourceX,
        geometry.sourceY,
        geometry.sourceWidth,
        geometry.sourceHeight,
        0,
        0,
        output.width,
        output.height,
      );
      const blob = await canvasBlob(canvas);

      if (siteId === "demo") {
        const previewUrl = URL.createObjectURL(blob);
        demoObjectUrlsRef.current.push(previewUrl);
        setAssets((current) => [
          ...current.filter((asset) => asset.kind !== draft.slot.kind),
          {
            altText: draft.altText.trim(),
            createdAt: new Date().toISOString(),
            height: output.height,
            id: crypto.randomUUID(),
            kind: draft.slot.kind,
            previewUrl,
            width: output.width,
          },
        ]);
        setNotice("Obrázok je pripravený v ukážke. V demo režime sa do cloudu neukladá.");
        setUploadState("idle");
        finishCropper();
        return;
      }

      const assetId = crypto.randomUUID();
      const storagePath = `${siteId}/${assetId}/${draft.slot.kind}.webp`;
      setUploadState("uploading");
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from("candidate-media").upload(storagePath, blob, {
        cacheControl: "3600",
        contentType: "image/webp",
        upsert: false,
      });
      if (uploadError) throw new Error("upload_failed");

      setUploadState("saving");
      const result = await registerMediaAssetAction({
        altText: draft.altText,
        assetId,
        crop: {
          sourceHeight: geometry.sourceHeight,
          sourceWidth: geometry.sourceWidth,
          sourceX: geometry.sourceX,
          sourceY: geometry.sourceY,
          zoom,
        },
        height: output.height,
        kind: draft.slot.kind,
        siteId,
        storagePath,
        width: output.width,
      });

      if (!result.ok) {
        await supabase.storage.from("candidate-media").remove([storagePath]);
        setError(result.message);
        setUploadState("idle");
        return;
      }

      const previewUrl = result.asset.previewUrl || URL.createObjectURL(blob);
      if (!result.asset.previewUrl) demoObjectUrlsRef.current.push(previewUrl);
      setAssets((current) => [...current.filter((asset) => asset.kind !== result.asset.kind), { ...result.asset, previewUrl }]);
      setNotice("Obrázok bol orezaný a bezpečne uložený.");
      setUploadState("idle");
      finishCropper();
      router.refresh();
    } catch (caught) {
      setUploadState("idle");
      setError(caught instanceof Error && caught.message === "upload_failed"
        ? "Obrázok sa nepodarilo nahrať. Skontrolujte pripojenie a skúste to znova."
        : "Obrázok sa nepodarilo spracovať. Skúste iný súbor.");
    }
  }

  const saveLabel = uploadState === "preparing"
    ? "Pripravujem obrázok…"
    : uploadState === "uploading"
      ? "Nahrávam obrázok…"
      : uploadState === "saving"
        ? "Synchronizujem…"
        : "Všetky zmeny uložené";

  return (
    <div className="page-container">
      <PageHeading
        eyebrow="Médiá"
        title="Obrázky"
        description="Nahrajte fotografie, ktoré budú reprezentovať vás a vašu kampaň."
        action={<span className="save-state" aria-live="polite">{isBusy ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />}{saveLabel}</span>}
      />

      {error && !draft && <div className="form-message form-message--error media-message" role="alert"><AlertCircle size={18} />{error}</div>}
      {notice && <div className="form-message form-message--success media-message" role="status"><Check size={18} />{notice}</div>}

      <section className="editor-card">
        <div className="editor-card__intro"><span className="section-symbol"><Images size={21} /></span><div><h2>Obrázky webu</h2><p>Obrázky orežeme na správny pomer, zmenšíme a uložíme ako optimalizovaný WebP.</p></div></div>
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => void prepareFile(event.target.files?.[0])}
        />
        <div className="upload-list">
          {mediaSlots.map((slot) => {
            const asset = assetByKind.get(slot.kind);
            const descriptionId = `media-${slot.kind}-description`;
            return (
              <div className="upload-row" key={slot.kind}>
                <div
                  aria-label={asset?.altText || slot.title}
                  className={asset ? `upload-preview upload-preview--image upload-preview--${slot.kind}` : "upload-preview"}
                  role={asset ? "img" : undefined}
                  style={asset ? { backgroundImage: `url("${asset.previewUrl}")` } : undefined}
                >
                  {!asset && <ImagePlus size={25} aria-hidden="true" />}
                </div>
                <div className="upload-copy" id={descriptionId}><h3>{slot.title}</h3><p>{slot.note}</p><small>{slot.ratio}</small></div>
                <button aria-describedby={descriptionId} className="button button--secondary button--small" disabled={isBusy} onClick={() => chooseFile(slot)} type="button">
                  <Upload size={16} /> {asset ? "Zmeniť" : "Nahrať"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {draft && geometry && (
        <div className="crop-overlay">
          <div ref={modalRef} aria-describedby="crop-description" aria-labelledby="crop-title" aria-modal="true" className="crop-dialog" role="dialog">
            <div className="crop-header">
              <div><p className="eyebrow">Orez obrázka</p><h2 id="crop-title">{draft.slot.title}</h2><p id="crop-description">Potiahnite obrázok do správnej polohy a nastavte priblíženie.</p></div>
              <button aria-label="Zavrieť orez obrázka" className="icon-button" disabled={isBusy} onClick={closeCropper} type="button"><X size={20} /></button>
            </div>

            <div className="crop-content">
              <div
                ref={frameRef}
                aria-label="Oblasť orezania. Obrázok môžete posúvať potiahnutím alebo šípkami na klávesnici."
                className="crop-frame"
                onKeyDown={handleCropKeys}
                onPointerCancel={endDrag}
                onPointerDown={beginDrag}
                onPointerMove={continueDrag}
                onPointerUp={endDrag}
                style={{ aspectRatio: String(draft.slot.aspect) }}
                tabIndex={0}
              >
                <img
                  alt=""
                  draggable={false}
                  src={draft.sourceUrl}
                  style={{
                    height: geometry.displayHeight,
                    transform: `translate(-50%, -50%) translate(${geometry.offsetX}px, ${geometry.offsetY}px)`,
                    width: geometry.displayWidth,
                  }}
                />
                <span className="crop-grid" aria-hidden="true" />
                <span className="crop-move-hint" aria-hidden="true"><Move size={16} /> Potiahnite obrázok</span>
              </div>

              <div className="crop-controls">
                <label className="crop-zoom" htmlFor="crop-zoom"><span><ZoomIn size={17} /> Priblíženie</span><input id="crop-zoom" max="3" min="1" onChange={(event) => setZoom(Number(event.target.value))} step="0.01" type="range" value={zoom} /></label>
                <label className="field" htmlFor="media-alt-text"><span>Alternatívny text</span><input id="media-alt-text" maxLength={300} onChange={(event) => setDraft({ ...draft, altText: event.target.value })} value={draft.altText} /><small>Stručne opíšte obsah obrázka pre ľudí používajúcich čítačku obrazovky.</small></label>
                <div className="crop-file-info"><span>{draft.fileName}</span><small>{draft.imageWidth} × {draft.imageHeight} px · výsledok {draft.slot.width} × {draft.slot.height} px alebo menší</small></div>
              </div>
            </div>

            {error && <div className="form-message form-message--error crop-error" role="alert"><AlertCircle size={18} />{error}</div>}

            <div className="crop-actions">
              <button className="button button--ghost" disabled={isBusy} onClick={closeCropper} type="button">Zrušiť</button>
              <button className="button button--primary" disabled={isBusy} onClick={() => void saveCrop()} type="button">
                {isBusy ? <><LoaderCircle className="spin" size={17} />{saveLabel}</> : <><Check size={17} /> Orezať a uložiť</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
