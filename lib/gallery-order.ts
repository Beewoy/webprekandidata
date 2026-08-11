import type { GalleryMediaAsset } from "./site-media";

/**
 * Creates a new, continuously numbered gallery order. The editor uses the same
 * helper for pointer and keyboard movement so both interaction modes persist an
 * identical payload to the database.
 */
export function moveGalleryAsset(items: GalleryMediaAsset[], assetId: string, targetIndex: number) {
  const currentIndex = items.findIndex((item) => item.id === assetId);
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= items.length || currentIndex === targetIndex) return items;
  const next = [...items];
  const [asset] = next.splice(currentIndex, 1);
  next.splice(targetIndex, 0, asset);
  return next.map((item, index) => ({ ...item, sortOrder: index }));
}
