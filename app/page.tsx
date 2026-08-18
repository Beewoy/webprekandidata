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
import "../landing-page/assets/template-showcase.css";
import { LandingVideoDialog } from "../components/marketing/landing-video-dialog";
import { LandingTemplateShowcase } from "../components/marketing/template-showcase-cards";
import { getDaysUntilElection } from "../lib/marketing/election-countdown";
import { PLATFORM_OPEN_GRAPH_IMAGE } from "../lib/marketing/metadata";
import {
  BASIC_UNAVAILABLE_FEATURES,
  PLAN_DESCRIPTIONS,
  PLAN_FEATURES,
  PLAN_PRICE_LABELS,
} from "../lib/payments/plans";

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
    images: [PLATFORM_OPEN_GRAPH_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web pre kandidáta na voľby 2026",
    description: "Profesionálny volebný web bez programátora. Náhľad zdarma, platba až pri zverejnení.",
    images: [PLATFORM_OPEN_GRAPH_IMAGE],
  },
};

const electionCountdownPlaceholder = "<!-- ELECTION_COUNTDOWN -->";
const templateShowcasePlaceholder = "<!-- TEMPLATE_SHOWCASE_SECTION -->";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderPlanFeatures(features: readonly string[], included = true) {
  const className = included ? "" : ' class="not-included"';
  const symbol = included ? "✓" : "×";

  return features
    .map(
      (feature) =>
        `<li${className}><span aria-hidden="true">${symbol}</span>${escapeHtml(feature)}</li>`,
    )
    .join("\n");
}

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
    .replace(
      "<!-- BASIC_PLAN_DESCRIPTION -->",
      escapeHtml(PLAN_DESCRIPTIONS.basic),
    )
    .replace(
      "<!-- PLUS_PLAN_DESCRIPTION -->",
      escapeHtml(PLAN_DESCRIPTIONS.plus),
    )
    .replace(
      "<!-- BASIC_PLAN_PRICE -->",
      escapeHtml(PLAN_PRICE_LABELS.basic),
    )
    .replace(
      "<!-- PLUS_PLAN_PRICE -->",
      escapeHtml(PLAN_PRICE_LABELS.plus),
    )
    .replace(
      "<!-- BASIC_PLAN_FEATURES -->",
      renderPlanFeatures(PLAN_FEATURES.basic),
    )
    .replace(
      "<!-- BASIC_UNAVAILABLE_FEATURES -->",
      renderPlanFeatures(BASIC_UNAVAILABLE_FEATURES, false),
    )
    .replace(
      "<!-- PLUS_PLAN_FEATURES -->",
      renderPlanFeatures(PLAN_FEATURES.plus),
    )
    .replace(electionCountdownPlaceholder, buildElectionCountdown());

  return { body: bodyWithBundledImages, structuredData };
}

export default function Home() {
  const { body, structuredData } = readLandingDocument();
  const showcaseIndex = body.indexOf(templateShowcasePlaceholder);

  if (showcaseIndex === -1) {
    throw new Error("Landing page source is missing the template showcase placeholder.");
  }

  const bodyBeforeShowcase = body.slice(0, showcaseIndex);
  const bodyAfterShowcase = body.slice(showcaseIndex + templateShowcasePlaceholder.length);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <div dangerouslySetInnerHTML={{ __html: bodyBeforeShowcase }} />
      <LandingTemplateShowcase />
      <div dangerouslySetInnerHTML={{ __html: bodyAfterShowcase }} />
      <LandingVideoDialog />
    </>
  );
}
