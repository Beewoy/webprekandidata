import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/ochrana-sukromia", "/obchodne-podmienky"],
        disallow: ["/app/", "/admin/", "/auth/", "/api/"],
      },
    ],
    sitemap: "https://webprekandidata.sk/sitemap.xml",
    host: "https://webprekandidata.sk",
  };
}
