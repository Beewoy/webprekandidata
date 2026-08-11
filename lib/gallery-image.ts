"use client";

import { fitOutputSize } from "./image-crop";
import { galleryLimits } from "./site-media";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export type PreparedGalleryImage = {
  blob: Blob;
  height: number;
  width: number;
};

export function galleryCaptionFromFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
}

export async function prepareGalleryImage(file: File): Promise<PreparedGalleryImage> {
  if (!allowedTypes.has(file.type)) throw new Error("Použite JPG, PNG alebo WebP fotografiu.");
  if (file.size <= 0 || file.size > galleryLimits.maxSourceBytes) throw new Error("Zdrojová fotografia môže mať najviac 15 MB.");

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const output = fitOutputSize(bitmap.width, bitmap.height, 1920, 1440);
    const canvas = document.createElement("canvas");
    canvas.width = output.width;
    canvas.height = output.height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Fotografiu sa nepodarilo spracovať.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, output.width, output.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.84));
    if (!blob) throw new Error("Fotografiu sa nepodarilo skonvertovať.");
    return { blob, height: output.height, width: output.width };
  } finally {
    bitmap.close();
  }
}
