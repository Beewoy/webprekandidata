import type { MetadataRoute } from "next";
import { MARKETING_ROUTES } from "../lib/marketing/campaign-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-11T00:00:00.000Z");
  const legalPages =
    process.env.LEGAL_DOCUMENTS_APPROVED === "true"
      ? ["/ochrana-sukromia", "/obchodne-podmienky", "/reklamacny-poriadok"]
      : [];
  const pages = ["", ...MARKETING_ROUTES, ...legalPages];

  return pages.map((path, index) => ({
    url: `https://webprekandidata.sk${path}`,
    lastModified,
    changeFrequency: index <= MARKETING_ROUTES.length ? "weekly" : "monthly",
    priority: index === 0 ? 1 : index <= MARKETING_ROUTES.length ? 0.8 : 0.4,
  }));
}
