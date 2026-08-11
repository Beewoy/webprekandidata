import type { MetadataRoute } from "next";
import { MARKETING_ROUTES } from "../lib/marketing/campaign-pages";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          ...MARKETING_ROUTES,
          "/ochrana-sukromia",
          "/obchodne-podmienky",
          "/reklamacny-poriadok",
        ],
        disallow: ["/app/", "/admin/", "/auth/", "/api/"],
      },
    ],
    sitemap: "https://webprekandidata.sk/sitemap.xml",
    host: "https://webprekandidata.sk",
  };
}
