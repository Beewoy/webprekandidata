import type { Metadata } from "next";
import { TemplatesCatalog } from "@/components/marketing/templates-catalog";
import { PLATFORM_OPEN_GRAPH_IMAGE } from "@/lib/marketing/metadata";

const canonicalUrl = "https://webprekandidata.sk/sablony";
const title = "Šablóny volebného webu | WebPreKandidata.sk";
const description =
  "Vyberte si zo šiestich profesionálnych šablón pre volebný web: Horizont, Impulz, Dôvera, Vízia, Odvaha a Blízkosť. Rovnaké sekcie, mobil aj počítač, náhľad zdarma.";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: canonicalUrl },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: canonicalUrl,
    siteName: "WebPreKandidata.sk",
    locale: "sk_SK",
    type: "website",
    images: [PLATFORM_OPEN_GRAPH_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [PLATFORM_OPEN_GRAPH_IMAGE],
  },
};

export default function TemplatesPage() {
  return <TemplatesCatalog />;
}
