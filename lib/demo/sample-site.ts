import type { Metadata } from "next";
import type { SitePreviewData } from "@/lib/site-preview-model";
import type { CampaignTemplateId } from "@/lib/site-theme";

export const demoTemplateCatalog = [
  {
    id: "modern",
    name: "Horizont",
    slug: "horizont",
    shortDescription: "Vzdušná občianska šablóna s čistou hierarchiou.",
    badge: null,
  },
  {
    id: "bold",
    name: "Impulz",
    slug: "impulz",
    shortDescription: "Výrazná typografia a energické kontrastné bloky.",
    badge: null,
  },
  {
    id: "classic",
    name: "Dôvera",
    slug: "dovera",
    shortDescription: "Pokojná reprezentatívna šablóna so serifovým tónom.",
    badge: null,
  },
  {
    id: "vision",
    name: "Vízia",
    slug: "vizia",
    shortDescription: "Dominantný portrét a svieži optimistický vizuál.",
    badge: null,
  },
  {
    id: "courage",
    name: "Odvaha",
    slug: "odvaha",
    shortDescription: "Monumentálna typografia, ostrý kontrast a rozhodný vizuál.",
    badge: "Nová",
  },
  {
    id: "closeness",
    name: "Blízkosť",
    slug: "blizkost",
    shortDescription: "Mäkký komunitný charakter a osobný kontakt s ľuďmi.",
    badge: "Nová",
  },
] as const;

export type DemoTemplateSlug = (typeof demoTemplateCatalog)[number]["slug"];
export type DemoTemplateCatalogItem = (typeof demoTemplateCatalog)[number];

const demoSitePreview: SitePreviewData = {
  about: {
    bodyHtml: [
      "<p>Som Trnavčan, otec dvoch detí a človek, ktorý verí, že dobré mesto vzniká každodennou spoluprácou. Posledných pätnásť rokov sa venujem rozvoju komunít a verejných priestorov.</p>",
      "<p>Do volieb vstupujem s rešpektom k ľuďom, ktorí tu žijú, pracujú a vychovávajú svoje rodiny. Chcem priniesť pokojné vedenie, otvorené rozhodovanie a riešenia, ktorých výsledok je vidieť.</p>",
    ].join(""),
    eyebrow: "O mne",
    headline: "Skúsenosti, ktoré patria mestu",
    signature: "— Martin",
    values: [
      { icon: "fairness", title: "Zodpovednosť", text: "Sľubujem iba to, čo vieme reálne pripraviť a splniť." },
      { icon: "governance", title: "Otvorenosť", text: "Rozhodnutia mesta majú byť zrozumiteľné, dohľadateľné a verejné." },
      { icon: "together", title: "Spolupráca", text: "Najlepšie riešenia vznikajú v rozhovore s obyvateľmi a odborníkmi." },
    ],
  },
  address: "webprekandidata.sk/martin-novak",
  candidate: {
    city: "Trnava",
    initials: "MN",
    name: "Martin Novák",
    politicalAffiliation: "",
    position: "Kandidát na primátora",
  },
  contact: {
    email: "martin@novak.sk",
    facebook: "https://www.facebook.com/",
    formEnabled: false,
    instagram: "https://www.instagram.com/",
    phone: "+421 900 123 456",
  },
  gallery: {
    items: [
      {
        altText: "Martin Novák diskutuje s obyvateľmi na námestí",
        caption: "Rozhovory s obyvateľmi v centre Trnavy",
        height: 800,
        id: "demo-gallery-1",
        previewUrl: "/images/demo-gallery-stretnutie.webp",
        width: 1200,
      },
      {
        altText: "Rodiny a cyklisti v zelenom mestskom parku",
        caption: "Zelené a bezpečné verejné priestory pre všetky generácie",
        height: 800,
        id: "demo-gallery-2",
        previewUrl: "/images/demo-gallery-park.webp",
        width: 1200,
      },
      {
        altText: "Komunitná diskusia obyvateľov nad plánom mestskej štvrte",
        caption: "Spoločné plánovanie konkrétnych riešení pre mestské časti",
        height: 800,
        id: "demo-gallery-3",
        previewUrl: "/images/demo-gallery-diskusia.webp",
        width: 1200,
      },
    ],
  },
  hero: {
    headlineAfter: "",
    headlineBefore: "Spoločne pre ",
    highlight: "lepšiu Trnavu",
    subheadline: "Mesto, ktoré počúva ľudí, hospodári zodpovedne a premieňa dobré nápady na konkrétne výsledky.",
  },
  media: {
    about: {
      altText: "Martin Novák pri príprave návrhov pre rozvoj Trnavy",
      url: "/images/demo-candidate-about.webp",
    },
    hero: {
      altText: "Martin Novák, kandidát na primátora Trnavy",
      url: "/images/demo-candidate-portrait.webp",
    },
    logo: {
      altText: "Znak kampane Martina Nováka",
      url: "/images/demo-candidate-logo.webp",
    },
  },
  news: {
    items: [
      {
        bodyHtml: "<p>Príďte sa porozprávať o doprave, zeleni a službách vo vašej štvrti. Vaše podnety zapracujeme do podrobného plánu prvých sto dní.</p>",
        cover: null,
        excerpt: "Otvorené stretnutie s obyvateľmi už túto sobotu na Trojičnom námestí.",
        id: "demo-news-1",
        publishedAt: "2026-08-08T09:00:00.000Z",
        title: "Stretnime sa v centre Trnavy",
      },
      {
        bodyHtml: "<p>Zverejňujeme prvú časť programu venovanú bezpečnej doprave. Obsahuje konkrétne križovatky, harmonogram aj spôsob, ako budeme o postupe pravidelne informovať.</p>",
        cover: null,
        excerpt: "Predstavujeme konkrétne kroky pre bezpečnejší pohyb peších, cyklistov aj vodičov.",
        id: "demo-news-2",
        publishedAt: "2026-08-03T07:30:00.000Z",
        title: "Bezpečná doprava bez prázdnych sľubov",
      },
    ],
  },
  program: {
    eyebrow: "Môj program",
    headline: "Konkrétne kroky pre lepšie mesto",
    intro: "Program stojí na uskutočniteľných opatreniach, jasných termínoch a pravidelnej kontrole výsledkov.",
    items: [
      {
        detailHtml: "<p>Začneme auditom nebezpečných priechodov a križovatiek. Výsledky aj harmonogram opráv zverejníme v prehľadnej online mape.</p>",
        icon: "transport",
        title: "Bezpečná a plynulá doprava",
        text: "Lepšie priechody, opravené cesty a spoľahlivejšia mestská doprava.",
      },
      {
        detailHtml: "<p>Každá mestská časť dostane plán obnovy zelene pripravený spolu s obyvateľmi. Uprednostníme prirodzený tieň, dostupnú vodu a odolné domáce druhy.</p>",
        icon: "trees",
        title: "Zelené a príjemné štvrte",
        text: "Viac stromov, čisté parky a kvalitné miesta na oddych vo všetkých častiach mesta.",
      },
      {
        detailHtml: "<p>Zavedieme zrozumiteľné elektronické formuláre, sledovanie vybavenia podnetov a jasné lehoty pre odpoveď mesta.</p>",
        icon: "innovation",
        title: "Mestské služby bez čakania",
        text: "Viac vybavovania online a menej zbytočných návštev úradu.",
      },
    ],
  },
  reasons: {
    eyebrow: "Prečo kandidujem",
    headline: "Mesto, ktoré počúva svojich ľudí",
    intro: "Trnava má silné komunity a množstvo dobrých nápadov. Samospráva im má pomáhať rásť, nie stáť v ceste.",
    items: [
      { icon: "safety", title: "Bezpečné ulice", text: "Dobre osvetlené priechody, pokojné verejné priestory a rýchle riešenie podnetov." },
      { icon: "families", title: "Mesto pre rodiny", text: "Dostupné školy, športoviská a služby v každej mestskej časti." },
      { icon: "finance", title: "Férové hospodárenie", text: "Zrozumiteľný rozpočet, otvorené zmluvy a kontrola výsledkov investícií." },
    ],
  },
  revision: 1,
  theme: {
    color: "#163B65",
    template: "modern",
  },
};

export function isDemoTemplateSlug(value: unknown): value is DemoTemplateSlug {
  return demoTemplateCatalog.some((item) => item.slug === value);
}

export function getDemoTemplateBySlug(slug: string) {
  return demoTemplateCatalog.find((item) => item.slug === slug);
}

export function getDemoTemplateById(template: CampaignTemplateId) {
  return demoTemplateCatalog.find((item) => item.id === template);
}

export function getDemoSitePreview(template: CampaignTemplateId): SitePreviewData {
  return {
    ...demoSitePreview,
    theme: {
      color: demoSitePreview.theme.color,
      template,
    },
  };
}

export function getDemoPageMetadata(template: CampaignTemplateId): Metadata {
  const item = getDemoTemplateById(template);

  if (!item) {
    return { robots: { index: false, follow: false } };
  }

  return {
    title: { absolute: `Ukážka šablóny ${item.name} | WebPreKandidata.sk` },
    description: `Ukážkový volebný web vytvorený v šablóne ${item.name}.`,
    robots: { index: false, follow: false },
  };
}
