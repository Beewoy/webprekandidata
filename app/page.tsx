import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CirclePlay,
  FileText,
  Globe2,
  Menu,
  MonitorSmartphone,
  PencilLine,
  Quote,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import brandMarkImage from "@/landing-page/assets/favicon.svg";
import dashboardImage from "@/landing-page/assets/martin-kandidat.png";
import { LandingMotion } from "@/components/marketing/landing-motion";
import { LandingVideoDialog } from "@/components/marketing/landing-video-dialog";
import { TemplateShowcaseCards } from "@/components/marketing/template-showcase-cards";
import { getDaysUntilElection } from "@/lib/marketing/election-countdown";
import { PLATFORM_OPEN_GRAPH_IMAGE } from "@/lib/marketing/metadata";
import { TESTIMONIALS, type Testimonial } from "@/lib/marketing/testimonials";
import {
  BASIC_UNAVAILABLE_FEATURES,
  PLAN_DESCRIPTIONS,
  PLAN_FEATURES,
  PLAN_PRICE_LABELS,
} from "@/lib/payments/plans";
import "../landing-page/assets/template-showcase.css";
import "../landing-page/assets/video-demo.css";
import styles from "./landing-redesign.module.css";

const canonicalUrl = "https://webprekandidata.sk/";
const title = "Web pre kandidáta na voľby 2026 | WebPreKandidata.sk";
const description =
  "Vytvorte si profesionálny volebný web pre komunálne a župné voľby 2026. Bez programátora, s náhľadom zdarma a platbou až pri zverejnení.";

const FAQ_ITEMS = [
  {
    question: "Musím vedieť programovať alebo robiť weby?",
    answer:
      "Nie. Platforma vás prevedie obsahom krok za krokom a vzhľad webu zostane profesionálny automaticky. Nemusíte riešiť kód, hosting ani technické nastavenia.",
  },
  {
    question: "Môžem si web pozrieť ešte pred zaplatením?",
    answer:
      "Áno. Účet, príprava obsahu aj súkromný náhľad sú zdarma. Balík si vyberiete a zaplatíte až vtedy, keď chcete web verejne zverejniť.",
  },
  {
    question: "Môžem obsah meniť aj po zverejnení?",
    answer:
      "Áno. Program, predstavenie, kontakty aj aktuality môžete upravovať v editore. Zmeny sa na verejnom webe zobrazia až po vašom opätovnom publikovaní.",
  },
  {
    question: "Čo je zahrnuté v jednorazovej cene?",
    answer:
      "Cena zahŕňa zverejnenie webu, editor, responzívny dizajn, hosting, základné SEO a zdieľanie, aktuality, galériu a verejný e-mailový kontakt. Presný rozsah sa líši podľa balíka Basic a Plus.",
  },
  {
    question: "Môžem použiť vlastnú doménu?",
    answer:
      "Každý publikovaný web dostane adresu na WebPreKandidata.sk. Balík Plus umožňuje pripojiť jednu existujúcu vlastnú doménu; registrácia novej domény nie je zahrnutá v cene.",
  },
  {
    question: "Píše AI politický program za kandidáta?",
    answer:
      "Nie. AI pomáha iba s formuláciou informácií, ktoré zadáte. Nevymýšľa postoje, sľuby ani fakty a každý návrh pred uložením a zverejnením kontrolujete vy.",
  },
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://webprekandidata.sk/#organization",
      name: "WebPreKandidata.sk",
      url: canonicalUrl,
      email: "ahoj@beewoy.sk",
    },
    {
      "@type": "WebSite",
      "@id": "https://webprekandidata.sk/#website",
      url: canonicalUrl,
      name: "WebPreKandidata.sk",
      inLanguage: "sk-SK",
      publisher: { "@id": "https://webprekandidata.sk/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://webprekandidata.sk/#application",
      name: "WebPreKandidata.sk",
      url: canonicalUrl,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Tvorba volebných webstránok",
      operatingSystem: "Webový prehliadač",
      inLanguage: "sk-SK",
      description:
        "Online nástroj na vytvorenie profesionálneho webu pre kandidátov v komunálnych a župných voľbách.",
      offers: [
        {
          "@type": "Offer",
          name: "Basic",
          price: "49.99",
          priceCurrency: "EUR",
          url: "https://webprekandidata.sk/#cennik",
        },
        {
          "@type": "Offer",
          name: "Plus",
          price: "89.99",
          priceCurrency: "EUR",
          url: "https://webprekandidata.sk/#cennik",
        },
      ],
      provider: { "@id": "https://webprekandidata.sk/#organization" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://webprekandidata.sk/#faq",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

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
    description:
      "Profesionálny volebný web bez programátora. Náhľad zdarma, platba až pri zverejnení.",
    images: [PLATFORM_OPEN_GRAPH_IMAGE],
  },
};

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={inverse ? styles.brandInverse : styles.brand}>
      <Image alt="" aria-hidden="true" className={styles.brandMark} src={brandMarkImage} />
      <span>
        WebPreKandidata<span>.sk</span>
      </span>
    </span>
  );
}

function HeroTrustLine() {
  const daysRemaining = getDaysUntilElection(new Date());
  const countdownText =
    daysRemaining === null
      ? null
      : daysRemaining === 0
        ? "Voľby sa konajú dnes"
        : `Do volieb zostáva ${daysRemaining} dní`;

  return (
    <p className={styles.heroTrust}>
      Súkromný náhľad zdarma
      <span aria-hidden="true" />
      Bez platobnej karty
      {countdownText ? (
        <>
          <span aria-hidden="true" />
          {countdownText}
        </>
      ) : null}
    </p>
  );
}

function AudienceRail() {
  return (
    <div className={styles.audienceRail} aria-label="Pre koho je platforma určená">
      <span>Kandidáti na starostu</span>
      <span aria-hidden="true" />
      <span>Kandidáti na primátora</span>
      <span aria-hidden="true" />
      <span>Kandidáti do zastupiteľstva</span>
      <span aria-hidden="true" />
      <span>Kandidáti do VÚC</span>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.brandLink} href="#top" aria-label="WebPreKandidata.sk – domov">
        <Brand />
      </Link>
      <nav className={styles.desktopNav} aria-label="Hlavná navigácia">
        <a href="#ako-to-funguje">Ako to funguje</a>
        <a href="#sablony">Šablóny</a>
        <a href="#cennik">Cenník</a>
        <Link href="/prihlasenie">Prihlásiť sa</Link>
      </nav>
      <Link className={styles.headerCta} href="/registracia">
        Vytvoriť web zdarma
        <ArrowRight aria-hidden="true" size={17} />
      </Link>
      <details className={styles.mobileNavigation}>
        <summary aria-label="Otvoriť navigáciu">
          <Menu className={styles.menuIcon} aria-hidden="true" />
          <X className={styles.closeIcon} aria-hidden="true" />
        </summary>
        <nav aria-label="Mobilná navigácia">
          <a href="#ako-to-funguje">Ako to funguje</a>
          <a href="#sablony">Šablóny</a>
          <a href="#cennik">Cenník</a>
          <Link href="/prihlasenie">Prihlásiť sa</Link>
          <Link className={styles.mobileCta} href="/registracia">
            Vytvoriť web zdarma
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </nav>
      </details>
    </header>
  );
}

function Hero() {
  return (
    <section className={styles.hero} id="hlavny-obsah">
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroCopy}>
        <p className={styles.kicker}>Web pre komunálne a župné voľby 2026</p>
        <h1>
          Profesionálny web pre vašu <em>kandidatúru.</em>
        </h1>
      </div>
      <div className={styles.heroLower}>
        <div className={styles.heroPitch}>
          <p>
            Pripravíte si obsah, vyberiete vzhľad a uvidíte reálny náhľad. Bez programátora a
            bez platby vopred. Web zverejníte až keď budete spokojní.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/registracia">
              Vytvoriť web zdarma
              <ArrowRight aria-hidden="true" size={19} />
            </Link>
            <a className={styles.secondaryButton} href="#ukazka-administracie">
              <CirclePlay aria-hidden="true" size={19} />
              Pozrieť ukážku
            </a>
          </div>
          <HeroTrustLine />
        </div>
        <figure className={styles.heroProduct} data-hero-product>
          <div className={styles.browserBar} aria-hidden="true">
            <span />
            <span />
            <span />
            <p>webprekandidata.sk/app</p>
          </div>
          <div className={styles.heroDashboardCrop}>
            <Image
              alt="Dashboard WebPreKandidata.sk s prehľadom rozpracovaného volebného webu kandidáta Martina Nováka"
              className={styles.heroDashboardImage}
              placeholder="blur"
              priority
              src={dashboardImage}
            />
          </div>
          <div className={styles.heroMobilePreview} aria-hidden="true">
            <Image
              alt=""
              height={816}
              loading="eager"
              sizes="(max-width: 720px) 104px, 168px"
              src="/images/landing-mobile-preview.png"
              width={406}
            />
          </div>
        </figure>
      </div>
    </section>
  );
}

function ReviewRating({ score }: { score: number }) {
  return (
    <p className={styles.reviewRating} aria-label={`Hodnotenie ${score} z 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          aria-hidden="true"
          fill={index < score ? "currentColor" : "none"}
          key={index}
          size={15}
          strokeWidth={index < score ? 0 : 1.6}
        />
      ))}
      <span>{score}/5</span>
    </p>
  );
}

function TestimonialAuthor({ testimonial }: { testimonial: Testimonial }) {
  const roleLine = [testimonial.role, testimonial.municipality].filter(Boolean).join(" · ");

  return (
    <footer className={styles.testimonialAuthor}>
      {testimonial.image ? (
        <Image
          alt=""
          className={styles.testimonialAvatar}
          height={56}
          src={testimonial.image}
          width={56}
        />
      ) : null}
      <div>
        <strong>{testimonial.author}</strong>
        {roleLine ? <span>{roleLine}</span> : null}
      </div>
    </footer>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className={testimonial.featured ? styles.testimonialPrimary : styles.testimonialSecondary}>
      <Quote aria-hidden="true" className={styles.quoteMark} strokeWidth={1.5} />
      <ReviewRating score={testimonial.rating} />
      <blockquote>{testimonial.text}</blockquote>
      <TestimonialAuthor testimonial={testimonial} />
    </article>
  );
}

function Testimonials() {
  const featured = TESTIMONIALS.filter((item) => item.featured);
  const supporting = TESTIMONIALS.filter((item) => !item.featured);

  return (
    <section className={`${styles.section} ${styles.testimonials}`} id="referencie">
      <div className={styles.testimonialsHeading}>
        <p className={styles.kicker}>Recenzie kandidátov</p>
        <h2>Čo hovoria kandidáti, ktorí už svoj web vytvorili.</h2>
      </div>
      <div className={styles.testimonialsGrid}>
        {featured.map((testimonial) => (
          <TestimonialCard key={`${testimonial.author}-${testimonial.role}`} testimonial={testimonial} />
        ))}
        {supporting.map((testimonial) => (
          <TestimonialCard key={`${testimonial.author}-${testimonial.role}`} testimonial={testimonial} />
        ))}
      </div>
    </section>
  );
}

function ProcessAccordion() {
  return (
    <section className={`${styles.section} ${styles.process}`} id="ako-to-funguje">
      <div className={styles.processIntro}>
        <p className={styles.kicker}>Od podkladov k webu pre voličov</p>
        <h2>Tri sústredené kroky. Žiadne technické odbočky.</h2>
      </div>
      <div className={styles.processGrid}>
        <article className={styles.processStep}>
          <div className={styles.processStepHeading}>
            <PencilLine aria-hidden="true" />
            <span>01</span>
          </div>
          <h3>Pripravíte podklady</h3>
          <p>
            Doplníte meno, typ kandidatúry, mesto, kontakty, predstavenie a hlavné priority.
            Jasný checklist vám priebežne ukáže, čo už máte hotové a čo ešte chýba.
          </p>
          <strong>Výsledok: kompletný obsahový základ</strong>
        </article>
        <article className={styles.processStep}>
          <div className={styles.processStepHeading}>
            <FileText aria-hidden="true" />
            <span>02</span>
          </div>
          <h3>Doladíte obsah a vzhľad</h3>
          <p>
            Texty upravíte sami alebo si necháte pripraviť AI návrh z vašich faktov. Vyberiete
            šablónu, farbu, portrét a fotografie bez zásahu do kódu.
          </p>
          <strong>Výsledok: dizajn pripravený na kontrolu</strong>
        </article>
        <article className={styles.processStep}>
          <div className={styles.processStepHeading}>
            <SearchCheck aria-hidden="true" />
            <span>03</span>
          </div>
          <h3>Skontrolujete a zverejníte</h3>
          <p>
            Súkromný náhľad si otvoríte zdarma na mobile aj počítači. Balík si vyberiete až po
            kontrole a verejný web vznikne iba po vašom potvrdení.
          </p>
          <strong>Výsledok: publikovanie máte pod kontrolou</strong>
        </article>
      </div>
    </section>
  );
}

function ProductStory() {
  return (
    <section
      className={`${styles.section} ${styles.story}`}
      data-proof-story
      id="ukazka-administracie"
    >
      <div className={styles.storyCopy} data-proof-copy>
        <p className={styles.kicker}>Editor a náhľad v jednom</p>
        <h2>Každá zmena má svoje miesto.</h2>
        <p>
          Obsah upravujete v prehľadných sekciách. Náhľad používa rovnaké komponenty ako verejný
          web, takže vždy viete, čo voliči uvidia.
        </p>
        <Link className={styles.textLink} href="/ukazka">
          Pozrieť hotový ukážkový web
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </div>
      <div className={styles.storyCards}>
        <article className={styles.storyCard} data-proof-card>
          <div className={styles.storyMedia} data-proof-media>
            <video
              aria-label="Ukážka jednoduchej administrácie WebPreKandidata.sk"
              controls
              playsInline
              poster="/images/cms-demo-poster.webp"
              preload="metadata"
            >
              <source src="/videos/cms-demo.mp4" type="video/mp4" />
              Váš prehliadač nepodporuje prehrávanie videa.
            </video>
          </div>
          <div className={styles.storyCardCopy}>
            <span><Sparkles aria-hidden="true" size={18} /> Začiatok</span>
            <h3>Z pár viet vznikne prvý upraviteľný návrh.</h3>
            <p>AI šetrí čas, no nepreberá kontrolu nad faktami ani publikovaním.</p>
            <button className={styles.videoExpand} data-video-expand type="button">
              <MonitorSmartphone aria-hidden="true" size={18} />
              Zväčšiť video
            </button>
          </div>
        </article>
        <article className={styles.storyCard} data-proof-card>
          <div className={styles.storyMedia} data-proof-media>
            <Image
              alt="Prehľad rozpracovaného volebného webu v administrácii WebPreKandidata.sk"
              placeholder="blur"
              src={dashboardImage}
            />
          </div>
          <div className={styles.storyCardCopy}>
            <span><ShieldCheck aria-hidden="true" size={18} /> Priebeh</span>
            <h3>Checklist drží obsah pohromade.</h3>
            <p>Vidíte dokončené sekcie, odporúčaný ďalší krok aj stav uloženia.</p>
          </div>
        </article>
        <article className={styles.storyCard} data-proof-card>
          <div className={`${styles.storyMedia} ${styles.storyMediaMobile}`} data-proof-media>
            <Image
              alt="Desktopová verzia volebného webu kandidáta Martina Nováka"
              className={styles.desktopSitePreview}
              height={1219}
              src="/images/landing-desktop-preview.png"
              width={1755}
            />
            <Image
              alt="Mobilná verzia toho istého volebného webu kandidáta Martina Nováka"
              className={styles.mobileSitePreview}
              height={816}
              src="/images/landing-mobile-preview.png"
              width={406}
            />
          </div>
          <div className={styles.storyCardCopy}>
            <span><Globe2 aria-hidden="true" size={18} /> Výsledok</span>
            <h3>Volebný web pripravený pre každý displej.</h3>
            <p>Responzívny dizajn, základné SEO, zdieľanie a hosting sú súčasťou riešenia.</p>
          </div>
        </article>
      </div>
    </section>
  );
}

function Templates() {
  return (
    <section className={`${styles.section} ${styles.templates}`} id="sablony">
      <div className={styles.templatesHeading}>
        <div>
          <p className={styles.kicker}>Charakter kampane bez rizika zlého dizajnu</p>
          <h2>Šesť šablón. Jeden profesionálny štandard.</h2>
        </div>
        <p>
          Každá má vlastný charakter, no všetky obsahujú rovnaké sekcie a automaticky sa
          prispôsobia mobilu aj počítaču.
        </p>
      </div>
      <TemplateShowcaseCards titleTag="h3" />
      <Link className={styles.sectionLink} href="/sablony">
        Porovnať všetky šablóny
        <ArrowRight aria-hidden="true" size={18} />
      </Link>
    </section>
  );
}

function Pricing() {
  return (
    <section className={`${styles.section} ${styles.pricing}`} id="cennik">
      <div className={styles.pricingHeading}>
        <p className={styles.kicker}>Férová jednorazová cena</p>
        <h2>Najskôr si web pozriete. Až potom sa rozhodnete.</h2>
        <p>
          Účet, editor aj súkromný náhľad sú zdarma. Platíte až vtedy, keď chcete web verejne
          zverejniť.
        </p>
      </div>
      <div className={styles.pricingGrid}>
        <article className={styles.priceCard}>
          <div className={styles.planHeading}>
            <p>Basic</p>
            <h3>{PLAN_DESCRIPTIONS.basic}</h3>
          </div>
          <div className={styles.price}>
            <strong>{PLAN_PRICE_LABELS.basic}</strong>
            <span>konečná cena<br />jednorazovo</span>
          </div>
          <ul>
            {PLAN_FEATURES.basic.map((feature) => (
              <li key={feature}><Check aria-hidden="true" size={18} />{feature}</li>
            ))}
            {BASIC_UNAVAILABLE_FEATURES.map((feature) => (
              <li className={styles.unavailable} key={feature}><X aria-hidden="true" size={18} />{feature}</li>
            ))}
          </ul>
          <Link className={styles.priceButtonLight} href="/registracia">
            Začať zdarma
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <small>
            Web sa zverejní na vašej adrese v rámci WebPreKandidata.sk.
          </small>
        </article>
        <article className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
          <div className={styles.planHeading}>
            <p>Plus · odporúčame</p>
            <h3>{PLAN_DESCRIPTIONS.plus}</h3>
          </div>
          <div className={styles.price}>
            <strong>{PLAN_PRICE_LABELS.plus}</strong>
            <span>konečná cena<br />jednorazovo</span>
          </div>
          <ul>
            {PLAN_FEATURES.plus.map((feature) => (
              <li key={feature}><Check aria-hidden="true" size={18} />{feature}</li>
            ))}
          </ul>
          <Link className={styles.priceButtonDark} href="/registracia">
            Začať zdarma
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <small>
            Pripojenie jednej existujúcej vlastnej domény je v cene. Registrácia novej domény
            nie je zahrnutá.
          </small>
        </article>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className={`${styles.section} ${styles.faq}`}>
      <div className={styles.faqIntro}>
        <p className={styles.kicker}>Dobré vedieť pred začiatkom</p>
        <h2>Jasné odpovede bez drobného písma.</h2>
        <p>
          Nenašli ste odpoveď? Napíšte nám na{" "}
          <a href="mailto:ahoj@beewoy.sk">ahoj@beewoy.sk</a>.
        </p>
      </div>
      <div className={styles.faqList}>
        {FAQ_ITEMS.map((item) => (
          <details key={item.question}>
            <summary>
              {item.question}
              <span aria-hidden="true"><ChevronRight /></span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className={styles.finalCta}>
      <div className={styles.finalCtaGlow} aria-hidden="true" />
      <p className={styles.kicker}>Začnite bez platobnej karty</p>
      <h2>Váš volebný web môže mať jasnú podobu ešte dnes.</h2>
      <p>
        Zaregistrujte sa, doplňte svoje podklady a pozrite si reálny náhľad pred tým, než sa
        rozhodnete publikovať.
      </p>
      <Link className={styles.finalButton} href="/registracia">
        Vytvoriť web zdarma
        <ArrowRight aria-hidden="true" size={20} />
      </Link>
      <small>Súkromný náhľad zdarma · Platba až pri zverejnení</small>
    </section>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div>
          <Link href="#top" aria-label="WebPreKandidata.sk – domov"><Brand inverse /></Link>
          <p>Profesionálne volebné weby pre komunálne a župné voľby 2026.</p>
        </div>
        <nav aria-label="Kampaňové weby podľa typu kandidatúry">
          <strong>Pre koho</strong>
          <Link href="/kampanovy-web-pre-starostu">Kandidát na starostu</Link>
          <Link href="/kampanovy-web-pre-primatora">Kandidát na primátora</Link>
          <Link href="/kampanovy-web-pre-poslanca">Kandidát na poslanca</Link>
          <Link href="/komunalne-volby-2026">Komunálne voľby 2026</Link>
          <Link href="/volby-do-vuc-2026">Voľby do VÚC 2026</Link>
        </nav>
        <div className={styles.footerContact}>
          <strong>Kontakt</strong>
          <a href="mailto:ahoj@beewoy.sk">ahoj@beewoy.sk</a>
          <Link href="/sablony">Šablóny</Link>
          <Link href="/prihlasenie">Prihlásiť sa</Link>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© 2026 WebPreKandidata.sk · Politicky neutrálna technologická platforma.</p>
        <nav aria-label="Právne dokumenty">
          <Link href="/ochrana-sukromia">Ochrana súkromia</Link>
          <Link href="/obchodne-podmienky">Obchodné podmienky</Link>
          <Link href="/reklamacny-poriadok">Reklamačný poriadok</Link>
          <button data-cookie-settings type="button">Nastavenia cookies</button>
        </nav>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c"),
        }}
      />
      <LandingMotion>
        <a className={styles.skipLink} href="#hlavny-obsah">Preskočiť na hlavný obsah</a>
        <main className={styles.page} id="top">
          <SiteHeader />
          <Hero />
          <AudienceRail />
          <Testimonials />
          <ProcessAccordion />
          <ProductStory />
          <Templates />
          <Pricing />
          <Faq />
          <FinalCta />
          <Footer />
        </main>
      </LandingMotion>
      <LandingVideoDialog />
    </>
  );
}
