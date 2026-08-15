import type { Metadata } from "next";
import {
  PLAN_LABELS,
  PLAN_PRICE_LABELS,
  PLAN_PRICES_CENTS,
} from "../payments/plans";
import { PLATFORM_OPEN_GRAPH_IMAGE } from "./metadata";

const SITE_ORIGIN = "https://webprekandidata.sk";
export const ELECTION_DATE_ISO = "2026-10-24T07:00:00+02:00";

export const MARKETING_ROUTES = [
  "/kampanovy-web-pre-starostu",
  "/kampanovy-web-pre-primatora",
  "/kampanovy-web-pre-poslanca",
  "/komunalne-volby-2026",
  "/volby-do-vuc-2026",
] as const;

export type MarketingRoute = (typeof MARKETING_ROUTES)[number];
export type BenefitIcon = "search" | "award" | "layout" | "clock" | "map" | "users";

export type CampaignPageData = {
  route: MarketingRoute;
  eyebrow: string;
  title: string;
  lead: string;
  heroNote: string;
  previewAlt: string;
  sectionEyebrow: string;
  sectionTitle: string;
  sectionLead: string;
  benefits: Array<{ icon: BenefitIcon; title: string; text: string }>;
  faqTitle: string;
  faqs: Array<{ question: string; answer: string }>;
  finalTitle: string;
  finalText: string;
  electionDate?: string;
  relatedRoutes: MarketingRoute[];
  seoTitle: string;
  seoDescription: string;
};

const commonFaqs = [
  {
    question: "Potrebujem na vytvorenie volebného webu technické znalosti?",
    answer:
      "Nie. Obsah dopĺňate v prehľadnom editore a systém sa postará o responzívny vzhľad, hosting aj technické nastavenia. Pred zverejnením si celý web skontrolujete v súkromnom náhľade.",
  },
  {
    question: "Môžem si web pozrieť pred zaplatením?",
    answer:
      "Áno. Registrácia, príprava obsahu aj súkromný náhľad sú zdarma. Balík si vyberiete až vtedy, keď chcete web verejne zverejniť.",
  },
  {
    question: "Môžem obsah meniť aj po zverejnení?",
    answer:
      "Áno. Predstavenie, program, kontakty aj aktuality môžete ďalej upravovať. Verejná stránka sa zmení až po vašom opätovnom publikovaní.",
  },
  {
    question: "Môžem použiť vlastnú doménu?",
    answer:
      "Každý publikovaný web dostane adresu na WebPreKandidata.sk. Balík Plus umožňuje pripojiť jednu existujúcu vlastnú doménu; registrácia novej domény nie je zahrnutá.",
  },
];

export const CAMPAIGN_PAGES: Record<MarketingRoute, CampaignPageData> = {
  "/kampanovy-web-pre-starostu": {
    route: "/kampanovy-web-pre-starostu",
    eyebrow: "Kampaňový web pre kandidáta na starostu",
    title: "Predstavte svoju víziu obce na vlastnom webe.",
    lead:
      "Voliči na jednom mieste nájdu, kto ste, prečo kandidujete a aké konkrétne zmeny chcete v obci presadiť. Bez programátora a s náhľadom zdarma.",
    heroNote: "Pre starostov obcí a mestských častí",
    previewAlt: "Ukážka volebného webu kandidáta na starostu v editore WebPreKandidata.sk",
    sectionEyebrow: "Prečo vlastný web",
    sectionTitle: "Dôveryhodný priestor pre vašu kandidatúru.",
    sectionLead:
      "Sociálne siete sú rýchle, ale dôležité informácie sa na nich strácajú. Vlastný web dá vášmu programu jasnú štruktúru a stabilnú adresu.",
    benefits: [
      {
        icon: "search",
        title: "Rozhodujete, čo voliči nájdu",
        text: "Predstavíte skúsenosti, motiváciu a program vlastnými slovami namiesto spoliehania sa na cudzie články.",
      },
      {
        icon: "award",
        title: "Pôsobíte pripraveno",
        text: "Profesionálna stránka pomáha vysvetliť, že máte premyslené priority aj spôsob komunikácie s obyvateľmi.",
      },
      {
        icon: "layout",
        title: "Program zostane prehľadný",
        text: "Témy pre obec, aktuality, galéria a kontakt sú usporiadané tak, aby sa dobre čítali aj na mobile.",
      },
    ],
    faqTitle: "Otázky kandidátov na starostu",
    faqs: [
      {
        question: "Čo má obsahovať web kandidáta na starostu?",
        answer:
          "Najmä stručné predstavenie, dôvod kandidatúry, konkrétne priority pre obec, skúsenosti, kontakty a pravidelné aktuality z kampane.",
      },
      ...commonFaqs,
    ],
    finalTitle: "Ukážte obyvateľom, za čím si stojíte.",
    finalText:
      "Vytvorte si súkromný náhľad webu pre kandidatúru na starostu a zaplaťte až pri zverejnení.",
    relatedRoutes: [
      "/kampanovy-web-pre-primatora",
      "/kampanovy-web-pre-poslanca",
      "/komunalne-volby-2026",
    ],
    seoTitle: "Kampaňový web pre kandidáta na starostu | WebPreKandidata.sk",
    seoDescription:
      "Vytvorte si profesionálny web pre kandidatúru na starostu. Program, predstavenie, aktuality a kontakt bez programátora. Náhľad zdarma.",
  },
  "/kampanovy-web-pre-primatora": {
    route: "/kampanovy-web-pre-primatora",
    eyebrow: "Kampaňový web pre kandidáta na primátora",
    title: "Vysvetlite svoju víziu mesta zrozumiteľne.",
    lead:
      "Spojte predstavenie, programové priority, aktuality a kontakt do profesionálneho webu pre voličov vo vašom meste.",
    heroNote: "Pre kandidátov na primátora",
    previewAlt: "Ukážka volebného webu kandidáta na primátora v editore WebPreKandidata.sk",
    sectionEyebrow: "Mestská kampaň online",
    sectionTitle: "Priestor pre témy, ktoré sa nezmestia do príspevku.",
    sectionLead:
      "Mestské problémy potrebujú kontext. Na vlastnom webe viete prepojiť svoju skúsenosť, riešenia pre jednotlivé oblasti aj aktuálne dianie.",
    benefits: [
      {
        icon: "users",
        title: "Oslovíte rôzne časti mesta",
        text: "Program usporiadate podľa tém a voličom uľahčíte nájsť priority, ktoré sa týkajú ich každodenného života.",
      },
      {
        icon: "search",
        title: "Budujete dohľadateľnú prezentáciu",
        text: "Jedna stabilná adresa spája vaše postoje a informácie, ktoré môžu voliči nájsť cez vyhľadávač.",
      },
      {
        icon: "layout",
        title: "Komunikujete aj počas kampane",
        text: "Aktuality a galéria vám umožnia dopĺňať stretnutia, stanoviská a postup kampane bez zásahu programátora.",
      },
    ],
    faqTitle: "Otázky kandidátov na primátora",
    faqs: [
      {
        question: "Je web vhodný aj pre rozsiahlejší mestský program?",
        answer:
          "Áno. Program môžete rozdeliť na samostatné priority s krátkym zhrnutím a voliteľným podrobným vysvetlením, aby zostal prehľadný.",
      },
      ...commonFaqs,
    ],
    finalTitle: "Dajte svojej vízii mesta jasnú podobu.",
    finalText:
      "Pripravte si web kandidáta na primátora, skontrolujte ho na mobile aj počítači a zverejnite ho, keď budete pripravení.",
    relatedRoutes: [
      "/kampanovy-web-pre-starostu",
      "/kampanovy-web-pre-poslanca",
      "/komunalne-volby-2026",
    ],
    seoTitle: "Kampaňový web pre kandidáta na primátora | WebPreKandidata.sk",
    seoDescription:
      "Profesionálny web pre kandidáta na primátora: vízia mesta, program, aktuality a kontakt. Bez programátora, so súkromným náhľadom zdarma.",
  },
  "/kampanovy-web-pre-poslanca": {
    route: "/kampanovy-web-pre-poslanca",
    eyebrow: "Kampaňový web pre kandidáta na poslanca",
    title: "Ukážte, ktoré témy budete v zastupiteľstve presadzovať.",
    lead:
      "Predstavte svoje skúsenosti, hodnoty a konkrétne priority pre obec, mesto alebo mestskú časť na prehľadnom vlastnom webe.",
    heroNote: "Pre kandidátov do miestnych zastupiteľstiev",
    previewAlt: "Ukážka volebného webu kandidáta na poslanca v editore WebPreKandidata.sk",
    sectionEyebrow: "Váš hlas v zastupiteľstve",
    sectionTitle: "Aj poslanecká kandidatúra potrebuje jasný príbeh.",
    sectionLead:
      "Voliči často poznajú kandidátske meno, ale nie jeho skúsenosti a priority. Vlastný web im dá dôvod rozhodovať sa informovane.",
    benefits: [
      {
        icon: "award",
        title: "Predstavíte svoju odbornosť",
        text: "Ukážete skúsenosti z komunity, profesie alebo verejného života, ktoré chcete priniesť do zastupiteľstva.",
      },
      {
        icon: "layout",
        title: "Pomenujete konkrétne priority",
        text: "Namiesto všeobecných sloganov vysvetlíte témy, ktorým sa chcete ako poslanec dlhodobo venovať.",
      },
      {
        icon: "users",
        title: "Zostanete dostupní voličom",
        text: "E-mailový kontakt a sociálne siete dávajú obyvateľom jednoduchú cestu, ako sa vám ozvať.",
      },
    ],
    faqTitle: "Otázky kandidátov na poslanca",
    faqs: [
      {
        question: "Je samostatný web užitočný aj pre kandidáta na poslanca?",
        answer:
          "Áno. Pomôže vám odlíšiť sa v širšej kandidátnej listine a na jednej adrese vysvetliť skúsenosti, hodnoty a témy, ktoré chcete zastupovať.",
      },
      ...commonFaqs,
    ],
    finalTitle: "Dajte voličom dôvod zapamätať si vás.",
    finalText:
      "Začnite bez platobnej karty a vytvorte si profesionálny náhľad webu pre svoju poslaneckú kandidatúru.",
    relatedRoutes: [
      "/kampanovy-web-pre-starostu",
      "/kampanovy-web-pre-primatora",
      "/komunalne-volby-2026",
    ],
    seoTitle: "Kampaňový web pre kandidáta na poslanca | WebPreKandidata.sk",
    seoDescription:
      "Vytvorte si web pre kandidatúru na poslanca obecného alebo mestského zastupiteľstva. Predstavenie, priority a kontakt na jednom mieste.",
  },
  "/komunalne-volby-2026": {
    route: "/komunalne-volby-2026",
    eyebrow: "Komunálne voľby 2026 · 24. októbra 2026",
    title: "Kampaňový web pre komunálne voľby 2026.",
    lead:
      "Kandidujete na starostu, primátora alebo poslanca? Začnite budovať dôveryhodnú online prezentáciu ešte dnes a dajte voličom čas spoznať váš program.",
    heroNote: "Pre obce, mestá a mestské časti",
    previewAlt: "Kampaňový web pre komunálne voľby 2026 zobrazený v editore WebPreKandidata.sk",
    sectionEyebrow: "Voľby sa blížia",
    sectionTitle: "Každý deň kampane môže pracovať pre vás.",
    sectionLead:
      "Komunálne voľby sa uskutočnia 24. októbra 2026. Čím skôr zverejníte kvalitné informácie, tým viac času majú voliči porozumieť vašej kandidatúre.",
    benefits: [
      {
        icon: "clock",
        title: "Začnete bez čakania na agentúru",
        text: "Obsah si pripravíte vlastným tempom a reálny náhľad vidíte ešte pred výberom plateného balíka.",
      },
      {
        icon: "search",
        title: "Dáte vyhľadávačom čas",
        text: "Stabilná verejná stránka pomáha voličom nájsť vaše predstavenie a program aj mimo sociálnych sietí.",
      },
      {
        icon: "map",
        title: "Komunikujete lokálne témy",
        text: "Web usporiada priority pre konkrétnu obec, mesto alebo mestskú časť a zostane čitateľný na mobile.",
      },
    ],
    faqTitle: "Otázky ku komunálnym voľbám 2026",
    faqs: [
      {
        question: "Kedy sa konajú komunálne voľby 2026?",
        answer:
          "Voľby do orgánov samosprávy obcí sa konajú v sobotu 24. októbra 2026 od 7:00 do 20:00.",
      },
      {
        question: "Pre ktoré komunálne kandidatúry je platforma určená?",
        answer:
          "Pre kandidátov na starostu, primátora, starostu mestskej časti aj poslanca obecného, mestského alebo miestneho zastupiteľstva.",
      },
      ...commonFaqs,
    ],
    finalTitle: "Nenechávajte svoju online prezentáciu na poslednú chvíľu.",
    finalText:
      "Vytvorte si web pre komunálne voľby 2026 teraz. Náhľad je zdarma a publikovanie zostáva vo vašich rukách.",
    electionDate: ELECTION_DATE_ISO,
    relatedRoutes: [
      "/kampanovy-web-pre-starostu",
      "/kampanovy-web-pre-primatora",
      "/kampanovy-web-pre-poslanca",
    ],
    seoTitle: "Kampaňový web pre komunálne voľby 2026 | WebPreKandidata.sk",
    seoDescription:
      "Profesionálny web pre kandidáta v komunálnych voľbách 2026. Pre starostov, primátorov a poslancov. Náhľad zdarma, bez programátora.",
  },
  "/volby-do-vuc-2026": {
    route: "/volby-do-vuc-2026",
    eyebrow: "Voľby do VÚC 2026 · 24. októbra 2026",
    title: "Kampaňový web pre voľby do samosprávnych krajov.",
    lead:
      "Kandidujete na predsedu kraja alebo poslanca zastupiteľstva VÚC? Predstavte regiónu svoje skúsenosti, priority a spôsob, ako vás môže kontaktovať.",
    heroNote: "Pre kandidátov na predsedu kraja aj poslancov VÚC",
    previewAlt: "Kampaňový web pre kandidáta vo voľbách do VÚC 2026 v editore WebPreKandidata.sk",
    sectionEyebrow: "Krajská kampaň online",
    sectionTitle: "Spojte témy celého regiónu na jednom mieste.",
    sectionLead:
      "Krajská kandidatúra oslovuje viac miest a obcí. Vlastný web pomáha vysvetliť spoločnú víziu aj konkrétne priority pre dopravu, školy, zdravotníctvo či rozvoj regiónu.",
    benefits: [
      {
        icon: "map",
        title: "Komunikujete naprieč regiónom",
        text: "Jedna stabilná adresa je dostupná voličom v celom kraji a dáva regionálnym témam spoločný rámec.",
      },
      {
        icon: "users",
        title: "Predstavíte skúsenosti aj tím",
        text: "Vysvetlíte svoju väzbu k regiónu, doterajšiu prácu a dôvody kandidatúry bez limitu krátkeho príspevku.",
      },
      {
        icon: "layout",
        title: "Rozdelíte program podľa oblastí",
        text: "Priority zostanú zrozumiteľné pre voličov z rôznych okresov a dobre čitateľné na mobile.",
      },
    ],
    faqTitle: "Otázky ku krajským voľbám 2026",
    faqs: [
      {
        question: "Kedy sa konajú voľby do VÚC 2026?",
        answer:
          "Voľby do orgánov samosprávnych krajov sa konajú v sobotu 24. októbra 2026 od 7:00 do 20:00, v rovnaký deň ako komunálne voľby.",
      },
      {
        question: "Je stránka určená pre župana aj poslanca VÚC?",
        answer:
          "Áno. Obsah si prispôsobíte kandidatúre na predsedu samosprávneho kraja aj kandidatúre na poslanca krajského zastupiteľstva.",
      },
      ...commonFaqs,
    ],
    finalTitle: "Predstavte svoj program voličom v celom kraji.",
    finalText:
      "Začnite so súkromným náhľadom webu pre voľby do VÚC 2026 a zverejnite ho až po vlastnej kontrole.",
    electionDate: ELECTION_DATE_ISO,
    relatedRoutes: ["/komunalne-volby-2026", "/kampanovy-web-pre-poslanca"],
    seoTitle: "Kampaňový web pre voľby do VÚC 2026 | WebPreKandidata.sk",
    seoDescription:
      "Web pre kandidáta na predsedu kraja alebo poslanca VÚC vo voľbách 2026. Regionálny program, aktuality a kontakt bez programátora.",
  },
};

export function getCampaignPage(route: MarketingRoute): CampaignPageData {
  return CAMPAIGN_PAGES[route];
}

export function getCampaignMetadata(route: MarketingRoute): Metadata {
  const page = getCampaignPage(route);
  const canonicalUrl = `${SITE_ORIGIN}${route}`;

  return {
    title: { absolute: page.seoTitle },
    description: page.seoDescription,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title: page.seoTitle,
      description: page.seoDescription,
      url: canonicalUrl,
      siteName: "WebPreKandidata.sk",
      locale: "sk_SK",
      type: "website",
      images: [PLATFORM_OPEN_GRAPH_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: page.seoTitle,
      description: page.seoDescription,
      images: [PLATFORM_OPEN_GRAPH_IMAGE],
    },
  };
}

export function buildCampaignStructuredData(route: MarketingRoute) {
  const page = getCampaignPage(route);
  const canonicalUrl = `${SITE_ORIGIN}${route}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: page.seoTitle,
        description: page.seoDescription,
        inLanguage: "sk-SK",
        isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
      },
      {
        "@type": "Service",
        "@id": `${canonicalUrl}#service`,
        name: page.eyebrow,
        description: page.lead,
        provider: { "@id": `${SITE_ORIGIN}/#organization` },
        areaServed: { "@type": "Country", name: "Slovensko" },
        offers: [
          {
            "@type": "Offer",
            name: PLAN_LABELS.basic,
            price: (PLAN_PRICES_CENTS.basic / 100).toFixed(2),
            priceCurrency: "EUR",
            url: `${canonicalUrl}#cennik`,
          },
          {
            "@type": "Offer",
            name: PLAN_LABELS.plus,
            price: (PLAN_PRICES_CENTS.plus / 100).toFixed(2),
            priceCurrency: "EUR",
            url: `${canonicalUrl}#cennik`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };
}

export function serializeStructuredData(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const MARKETING_PLAN_PRICES = {
  basic: PLAN_PRICE_LABELS.basic,
  plus: PLAN_PRICE_LABELS.plus,
} as const;
