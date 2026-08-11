import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import "../landing-page/assets/styles.css";
import "../landing-page/assets/refined.css";
import "../landing-page/assets/pricing.css";

const canonicalUrl = "https://webprekandidata.sk/";
const title = "Web pre kandidáta na voľby 2026 | WebPreKandidata.sk";
const description =
  "Vytvorte si profesionálny volebný web pre komunálne a župné voľby 2026. Bez programátora, s náhľadom zdarma a platbou až pri zverejnení.";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: canonicalUrl },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Web pre kandidáta na komunálne a župné voľby 2026",
    description:
      "Pripravte si profesionálnu webstránku pre svoju kandidatúru. Náhľad vytvoríte zdarma, platíte až pri zverejnení.",
    url: canonicalUrl,
    siteName: "WebPreKandidata.sk",
    locale: "sk_SK",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "WebPreKandidata.sk – profesionálny volebný web bez programátora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web pre kandidáta na voľby 2026",
    description: "Profesionálny volebný web bez programátora. Náhľad zdarma, platba až pri zverejnení.",
    images: ["/opengraph-image"],
  },
};

function readLandingDocument() {
  const html = readFileSync(join(process.cwd(), "landing-page", "index.html"), "utf8");
  const body = html.match(/<body>([\s\S]*?)<\/body>/i)?.[1];
  const structuredData = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i,
  )?.[1];

  if (!body || !structuredData) {
    throw new Error("Landing page source is missing its body or structured data.");
  }

  return { body, structuredData };
}

export default function Home() {
  const { body, structuredData } = readLandingDocument();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
