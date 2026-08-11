import { describe, expect, it } from "vitest";
import { galleryCaptionFromFilename } from "../lib/gallery-image";
import { moveGalleryAsset } from "../lib/gallery-order";
import type { GalleryMediaAsset } from "../lib/site-media";

function asset(id: string, sortOrder: number): GalleryMediaAsset {
  return {
    altText: id,
    byteSize: 100,
    caption: id,
    createdAt: "2026-08-11T00:00:00.000Z",
    height: 600,
    id,
    previewUrl: `/gallery/${id}.webp`,
    sortOrder,
    width: 800,
  };
}

describe("candidate gallery", () => {
  it("vytvorí čitateľný titulok z názvu súboru", () => {
    expect(galleryCaptionFromFilename("stretnutie_s-obcanmi.webp")).toBe("stretnutie s obcanmi");
  });

  it("presunie fotografiu a prečísluje celé poradie", () => {
    const moved = moveGalleryAsset([asset("a", 0), asset("b", 1), asset("c", 2)], "c", 0);
    expect(moved.map(({ id, sortOrder }) => ({ id, sortOrder }))).toEqual([
      { id: "c", sortOrder: 0 },
      { id: "a", sortOrder: 1 },
      { id: "b", sortOrder: 2 },
    ]);
  });

  it("pri neplatnom cieli zachová pôvodný zoznam", () => {
    const items = [asset("a", 0), asset("b", 1)];
    expect(moveGalleryAsset(items, "a", 3)).toBe(items);
  });
});
