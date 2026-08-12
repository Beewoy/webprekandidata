import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import dashboardImage from "../landing-page/assets/martin-kandidat.png";
import mobilePreviewImage from "../landing-page/assets/martin-kandidat-mobil.png";
import "../landing-page/assets/styles.css";
import "../landing-page/assets/refined.css";
import "../landing-page/assets/pricing.css";
import "../landing-page/assets/mobile-navigation.css";
import "../landing-page/assets/video-demo.css";
import { LandingVideoDialog } from "../components/marketing/landing-video-dialog";
import { getDaysUntilElection } from "../lib/marketing/election-countdown";

const canonicalUrl = "https://webprekandidata.sk/";
const title = "Web pre kandidáta na voľby 2026 | WebPreKandidata.sk";
const description =
  "Vytvorte si profesionálny volebný web pre komunálne a župné voľby 2026. Bez programátora, s náhľadom zdarma a platbou až pri zverejnení.";

export const dynamic = "force-static";
export const revalidate = 3600;

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

const electionCountdownPlaceholder = "<!-- ELECTION_COUNTDOWN -->";

function buildElectionCountdown(now = new Date()) {
  const daysRemaining = getDaysUntilElection(now);

  if (daysRemaining === null) {
    return "";
  }

  const remainingText =
    daysRemaining === 0
      ? "Voľby sa konajú dnes"
      : `Zostáva <strong>${daysRemaining} dní</strong>`;
  const accessibleRemainingText =
    daysRemaining === 0
      ? "Voľby sa konajú dnes."
      : `Zostáva ${daysRemaining} dní.`;

  return `<div class="election-countdown" aria-label="Voľby 24. októbra 2026. ${accessibleRemainingText}">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
<path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path>
</svg>
<span>Voľby 24. októbra 2026</span>
<span class="election-countdown-separator" aria-hidden="true">•</span>
<span>${remainingText}</span>
</div>`;
}

function readLandingDocument() {
  const html = readFileSync(join(process.cwd(), "landing-page", "index.html"), "utf8");
  const body = html.match(/<body>([\s\S]*?)<\/body>/i)?.[1];
  const structuredData = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i,
  )?.[1];

  if (!body || !structuredData) {
    throw new Error("Landing page source is missing its body or structured data.");
  }

  const bodyWithBundledImages = body
    .replaceAll(
      'src="assets/martin-kandidat.png"',
      `src="${dashboardImage.src}"`,
    )
    .replaceAll(
      'src="assets/martin-kandidat-mobil.png"',
      `src="${mobilePreviewImage.src}"`,
    )
    .replace(electionCountdownPlaceholder, buildElectionCountdown());

  return { body: bodyWithBundledImages, structuredData };
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
      <LandingVideoDialog />
    </>
  );
}
