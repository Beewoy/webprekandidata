export const mediaKinds = ["logo", "hero", "about", "social"] as const;

export type MediaKind = typeof mediaKinds[number];

export type SiteMediaAsset = {
  altText: string;
  createdAt: string;
  height: number;
  id: string;
  kind: MediaKind;
  previewUrl: string;
  width: number;
};

export type GalleryMediaAsset = {
  altText: string;
  byteSize: number;
  caption: string;
  createdAt: string;
  height: number;
  id: string;
  previewUrl: string;
  sortOrder: number;
  width: number;
};

export const galleryLimits = {
  maxAssets: 12,
  maxProjectBytes: 15 * 1024 * 1024,
  maxSourceBytes: 15 * 1024 * 1024,
} as const;

export type MediaSlot = {
  aspect: number;
  defaultAlt: string;
  height: number;
  kind: MediaKind;
  note: string;
  ratio: string;
  title: string;
  width: number;
};

export const mediaSlots: MediaSlot[] = [
  {
    aspect: 1,
    defaultAlt: "Logo kampane",
    height: 800,
    kind: "logo",
    note: "Najlepšie funguje štvorcové PNG s priehľadným pozadím.",
    ratio: "Odporúčanie 1 : 1",
    title: "Logo alebo znak kampane",
    width: 800,
  },
  {
    aspect: 1,
    defaultAlt: "Portrét kandidáta",
    height: 1200,
    kind: "hero",
    note: "Štvorcový portrét s tvárou v strede, ktorý sa v šablóne zobrazí v kruhu.",
    ratio: "Odporúčanie 1 : 1",
    title: "Hlavná fotografia kandidáta",
    width: 1200,
  },
  {
    aspect: 4 / 3,
    defaultAlt: "Fotografia kandidáta v prostredí kampane",
    height: 900,
    kind: "about",
    note: "Prirodzená fotografia z prostredia mesta alebo kampane.",
    ratio: "Odporúčanie 4 : 3",
    title: "Fotografia do sekcie O mne",
    width: 1200,
  },
  {
    aspect: 1200 / 630,
    defaultAlt: "Obrázok kampane pri zdieľaní",
    height: 630,
    kind: "social",
    note: "Zobrazí sa pri zdieľaní na Facebooku a ďalších sieťach.",
    ratio: "1200 × 630 px",
    title: "Obrázok pri zdieľaní",
    width: 1200,
  },
];

export function isMediaKind(value: string): value is MediaKind {
  return mediaKinds.includes(value as MediaKind);
}
