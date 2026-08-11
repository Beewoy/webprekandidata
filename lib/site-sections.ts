import type { LucideIcon } from "lucide-react";
import {
  BadgeInfo,
  BookOpenText,
  Contact,
  Eye,
  FileImage,
  Flag,
  Globe2,
  HeartHandshake,
  House,
  ImagePlay,
  Images,
  LayoutDashboard,
  ListChecks,
  Newspaper,
  Palette,
  Rocket,
  Search,
} from "lucide-react";

export type SectionStatus = "complete" | "started" | "empty";

export type SiteSection = {
  slug: string;
  label: string;
  shortLabel?: string;
  description: string;
  icon: LucideIcon;
  status: SectionStatus;
  group: "content" | "publish";
};

export const contentSections: SiteSection[] = [
  { slug: "zakladne-udaje", label: "Základné údaje", description: "Meno, kandidatúra a mesto", icon: BadgeInfo, status: "complete", group: "content" },
  { slug: "kontakt", label: "Kontakt", description: "E-mail, telefón a sociálne siete", icon: Contact, status: "started", group: "content" },
  { slug: "uvod", label: "Úvodný banner", shortLabel: "Úvod", description: "Prvá správa pre návštevníkov", icon: Flag, status: "complete", group: "content" },
  { slug: "o-mne", label: "O mne", description: "Predstavenie kandidáta", icon: HeartHandshake, status: "started", group: "content" },
  { slug: "preco-kandidujem", label: "Prečo kandidujem", description: "Motivácia a hlavné dôvody", icon: House, status: "empty", group: "content" },
  { slug: "program", label: "Program", description: "Priority a konkrétne kroky", icon: ListChecks, status: "empty", group: "content" },
  { slug: "aktuality", label: "Aktuality", description: "Články a oznamy", icon: Newspaper, status: "empty", group: "content" },
  { slug: "vzhlad", label: "Vzhľad", description: "Farby a štýl webu", icon: Palette, status: "complete", group: "content" },
  { slug: "obrazky", label: "Obrázky", description: "Logo a fotografie", icon: Images, status: "started", group: "content" },
  { slug: "galeria", label: "Galéria", description: "Fotografie z kampane", icon: ImagePlay, status: "empty", group: "content" },
  { slug: "seo", label: "SEO", description: "Ako sa web zobrazí vo vyhľadávači", icon: Search, status: "empty", group: "content" },
];

export const publishSections: SiteSection[] = [
  { slug: "domena", label: "Doména", description: "Adresa vášho webu", icon: Globe2, status: "started", group: "publish" },
  { slug: "nahlad", label: "Náhľad webu", description: "Kontrola pred zverejnením", icon: Eye, status: "empty", group: "publish" },
  { slug: "publikovanie", label: "Publikovanie", description: "Balík a zverejnenie webu", icon: Rocket, status: "empty", group: "publish" },
];

export const allSections = [...contentSections, ...publishSections];

export const overviewItem = {
  slug: "",
  label: "Prehľad",
  icon: LayoutDashboard,
};

export function getSection(slug: string) {
  return allSections.find((section) => section.slug === slug);
}

export const editorFields: Record<string, Array<{ label: string; name: string; type?: "checkbox" | "text" | "textarea" | "richtext" | "url"; value?: string; hint?: string }>> = {
  "zakladne-udaje": [
    { label: "Meno a priezvisko", name: "name", value: "Martin Novák" },
    { label: "Na akú funkciu kandidujete", name: "position", value: "Kandidát na primátora mesta" },
    { label: "Obec / mesto", name: "city", value: "Trnava" },
  ],
  kontakt: [
    { label: "E-mail", name: "email", value: "martin@novak.sk" },
    { label: "Telefón", name: "phone", value: "+421 900 123 456" },
    { label: "Facebook", name: "facebook", type: "url", hint: "Odkaz na verejný profil alebo stránku" },
    { label: "Instagram", name: "instagram", type: "url", hint: "Odkaz na verejný profil" },
    { label: "Zobrazovať kontaktný formulár", name: "contactFormEnabled", type: "checkbox", value: "true", hint: "Správy sa po zverejnení webu doručia na e-mail uvedený vyššie." },
  ],
  uvod: [
    { label: "Hlavný nadpis", name: "headline", value: "Spoločne pre lepšiu Trnavu", hint: "Krátka a zapamätateľná hlavná myšlienka" },
    { label: "Zvýraznená časť", name: "highlight", value: "lepšiu Trnavu", hint: "Táto časť nadpisu sa zobrazí hlavnou farbou" },
    { label: "Podnadpis", name: "subheadline", type: "textarea", value: "Pracujme spolu na meste, v ktorom sa dobre žije všetkým generáciám." },
  ],
  "o-mne": [
    { label: "Malý nadpis", name: "eyebrow", value: "O mne" },
    { label: "Nadpis", name: "headline", value: "Spoznajte ma a moje skúsenosti" },
    { label: "Text o vás", name: "body", type: "richtext", value: "V našom meste žijem viac ako dvadsať rokov. Poznám jeho silné stránky aj problémy, ktoré potrebujeme riešiť otvorene a spolu.", hint: "Môžete použiť medzinadpisy, tučné písmo a zoznamy." },
    { label: "Podpis", name: "signature", value: "— Martin" },
  ],
  "preco-kandidujem": [
    { label: "Malý nadpis", name: "eyebrow", value: "Prečo kandidujem" },
    { label: "Nadpis", name: "headline", value: "Mesto, ktoré počúva svojich ľudí" },
    { label: "Úvodný text", name: "intro", type: "textarea", value: "Kandidujem, pretože verím, že samospráva môže byť otvorená, praktická a bližšie k obyvateľom." },
  ],
  program: [
    { label: "Malý nadpis", name: "eyebrow", value: "Môj program" },
    { label: "Nadpis", name: "headline", value: "Konkrétne kroky pre lepšie mesto" },
    { label: "Úvodný text", name: "intro", type: "textarea", value: "Toto sú hlavné oblasti, na ktoré sa chcem zamerať spolu s odborníkmi a obyvateľmi." },
  ],
  seo: [
    { label: "SEO titulok", name: "seoTitle", value: "Martin Novák – kandidát na primátora Trnavy", hint: "Odporúčaná dĺžka je približne 50 až 60 znakov" },
    { label: "Popis stránky", name: "seoDescription", type: "textarea", value: "Martin Novák kandiduje na primátora Trnavy s programom pre bezpečné, otvorené a fungujúce mesto." },
    { label: "Kľúčové slová", name: "keywords", value: "Trnava, primátor, komunálne voľby, Martin Novák", hint: "Oddeľte čiarkou" },
  ],
};

export const auxiliaryIcons = { BookOpenText, FileImage };
