import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Check,
  Clock3,
  Headphones,
  LayoutTemplate,
  LockKeyhole,
  Mail,
  Map,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import logoImage from "@/landing-page/assets/favicon.svg";
import dashboardImage from "@/landing-page/assets/martin-kandidat.png";
import mobilePreviewImage from "@/landing-page/assets/martin-kandidat-mobil.png";
import {
  CAMPAIGN_PAGES,
  MARKETING_PLAN_PRICES,
  buildCampaignStructuredData,
  serializeStructuredData,
  type BenefitIcon,
  type CampaignPageData,
} from "@/lib/marketing/campaign-pages";
import { PLAN_DESCRIPTIONS, PLAN_FEATURES } from "@/lib/payments/plans";
import { ElectionCountdown } from "./election-countdown";
import styles from "./campaign-page.module.css";

const benefitIcons = {
  search: Search,
  award: Award,
  layout: LayoutTemplate,
  clock: Clock3,
  map: Map,
  users: Users,
} satisfies Record<BenefitIcon, typeof Search>;

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={inverse ? styles.brandInverse : styles.brand}>
      <Image className={styles.brandMark} src={logoImage} alt="" aria-hidden="true" />
      <span>
        WebPreKandidata<span className={styles.brandDomain}>.sk</span>
      </span>
    </span>
  );
}

function BenefitCard({ icon, title, text }: CampaignPageData["benefits"][number]) {
  const Icon = benefitIcons[icon];

  return (
    <article className={styles.benefitCard}>
      <span className={styles.benefitIcon} aria-hidden="true">
        <Icon size={24} strokeWidth={1.8} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function PriceCard({
  featured = false,
  name,
  price,
  description,
  features,
}: {
  featured?: boolean;
  name: string;
  price: string;
  description: string;
  features: readonly string[];
}) {
  return (
    <article className={`${styles.priceCard} ${featured ? styles.priceCardFeatured : ""}`}>
      {featured ? <span className={styles.popular}>Najobľúbenejšie</span> : null}
      <p className={styles.planName}>{name}</p>
      <h3>{description}</h3>
      <div className={styles.price}>
        <strong>{price}</strong>
        <span>konečná cena<br />jednorazovo</span>
      </div>
      <ul>
        {features.map((feature) => (
          <li key={feature}>
            <Check size={18} aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        className={featured ? styles.buttonAccent : styles.buttonOutline}
        href="/registracia"
      >
        Začať zdarma
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
      <small>
        {featured
          ? "Registrácia novej domény nie je zahrnutá."
          : "Publikujete až po vlastnej kontrole náhľadu."}
      </small>
    </article>
  );
}

export function CampaignPage({ page }: { page: CampaignPageData }) {
  const structuredData = buildCampaignStructuredData(page.route);

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }}
      />
      <a className={styles.skipLink} href="#hlavny-obsah">
        Preskočiť na hlavný obsah
      </a>

      <header className={styles.header}>
        <Link href="/" aria-label="WebPreKandidata.sk – domov">
          <Brand />
        </Link>
        <nav className={styles.desktopNav} aria-label="Hlavná navigácia">
          <a href="#preco-web">Prečo web</a>
          <a href="#cennik">Cenník</a>
          <a href="#otazky">Otázky</a>
          <Link href="/prihlasenie">Prihlásiť sa</Link>
        </nav>
        <Link className={styles.headerCta} href="/registracia">
          Vytvoriť web zdarma
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </header>

      <main id="hlavny-obsah">
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>{page.eyebrow}</p>
              <h1>{page.title}</h1>
              <p className={styles.heroLead}>{page.lead}</p>
              {page.electionDate ? <ElectionCountdown targetDate={page.electionDate} /> : null}
              <div className={styles.heroActions}>
                <Link className={styles.buttonPrimary} href="/registracia">
                  Vytvoriť web zdarma
                  <ArrowRight size={19} aria-hidden="true" />
                </Link>
                <a className={styles.buttonText} href="#ukazka">
                  Pozrieť ukážku
                </a>
              </div>
              <div className={styles.microTrust} aria-label="Výhody bezplatného náhľadu">
                <span><Check size={16} aria-hidden="true" /> Náhľad pred platbou</span>
                <span><Check size={16} aria-hidden="true" /> Bez platobnej karty</span>
                <span><Check size={16} aria-hidden="true" /> Jednorazová cena</span>
              </div>
            </div>

            <figure className={styles.heroVisual} id="ukazka">
              <div className={styles.browserBar} aria-hidden="true">
                <span />
                <span />
                <span />
                <small>webprekandidata.sk</small>
              </div>
              <Image
                src={dashboardImage}
                alt={page.previewAlt}
                priority
                sizes="(max-width: 900px) 94vw, 52vw"
              />
              <figcaption>{page.heroNote}</figcaption>
            </figure>
          </div>
        </section>

        <section className={styles.reasonSection} id="preco-web">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{page.sectionEyebrow}</p>
            <h2>{page.sectionTitle}</h2>
            <p>{page.sectionLead}</p>
          </div>
          <div className={styles.benefitGrid}>
            {page.benefits.map((benefit) => (
              <BenefitCard key={benefit.title} {...benefit} />
            ))}
          </div>
        </section>

        <section className={styles.productSection}>
          <div className={styles.productCopy}>
            <p className={styles.eyebrowLight}>Všetko potrebné na jednom mieste</p>
            <h2>Vy komunikujete s voličmi. Platforma sa postará o web.</h2>
            <p>
              Editor vás prevedie predstavením, programom, fotografiami, aktualitami aj
              kontaktom. Každý text zostáva pod vašou kontrolou.
            </p>
            <ul>
              {[
                "Tri profesionálne šablóny pre mobil aj počítač",
                "Automatické ukladanie a súkromný náhľad",
                "AI pomáha formulovať iba vaše vlastné podklady",
                "Zmeny sa zverejnia až po vašom potvrdení",
              ].map((item) => (
                <li key={item}><Check size={19} aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>
          <div className={styles.phoneScene}>
            <div className={styles.phone}>
              <Image
                src={mobilePreviewImage}
                alt="Mobilný náhľad profesionálneho webu kandidáta"
                sizes="320px"
              />
            </div>
            <span className={styles.phoneBadgeTop}>Responzívny dizajn</span>
            <span className={styles.phoneBadgeBottom}><ShieldCheck size={18} /> SEO základ v cene</span>
          </div>
        </section>

        <section className={styles.pricingSection} id="cennik">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Férová jednorazová cena</p>
            <h2>Najskôr náhľad. Potom rozhodnutie.</h2>
            <p>
              Účet, editor a súkromný náhľad sú zdarma. Platíte až vtedy, keď chcete
              volebný web verejne zverejniť.
            </p>
          </div>
          <div className={styles.pricingGrid}>
            <PriceCard
              name="Basic"
              price={MARKETING_PLAN_PRICES.basic}
              description={PLAN_DESCRIPTIONS.basic}
              features={PLAN_FEATURES.basic}
            />
            <PriceCard
              featured
              name="Plus"
              price={MARKETING_PLAN_PRICES.plus}
              description={PLAN_DESCRIPTIONS.plus}
              features={PLAN_FEATURES.plus}
            />
          </div>
          <div className={styles.trustGrid}>
            <article>
              <LockKeyhole aria-hidden="true" />
              <div><h3>Bezpečná platba</h3><p>Platbu spracúva Stripe. Údaje platobnej karty neukladáme.</p></div>
            </article>
            <article>
              <Headphones aria-hidden="true" />
              <div><h3>Slovenská podpora</h3><p>Ak sa zaseknete, pomôžeme vám e-mailom v slovenčine.</p></div>
            </article>
            <article>
              <ShieldCheck aria-hidden="true" />
              <div><h3>Obsah máte pod kontrolou</h3><p>AI návrh sa nikdy automaticky neuloží ani nezverejní.</p></div>
            </article>
          </div>
        </section>

        <section className={styles.faqSection} id="otazky">
          <div className={styles.faqIntro}>
            <p className={styles.eyebrow}>Dobré vedieť</p>
            <h2>{page.faqTitle}</h2>
            <p>
              Nenašli ste odpoveď?{" "}
              <a href="mailto:ahoj@beewoy.sk">Napíšte nám na ahoj@beewoy.sk.</a>
            </p>
          </div>
          <div className={styles.faqList}>
            {page.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.relatedSection} aria-labelledby="related-title">
          <p className={styles.eyebrow}>Ďalšie možnosti</p>
          <h2 id="related-title">Web pre vašu kandidatúru</h2>
          <div className={styles.relatedLinks}>
            {page.relatedRoutes.map((route) => (
              <Link href={route} key={route}>
                {CAMPAIGN_PAGES[route].eyebrow.split(" · ")[0]}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.finalCta}>
          <p className={styles.eyebrowLight}>Začnite bez platobnej karty</p>
          <h2>{page.finalTitle}</h2>
          <p>{page.finalText}</p>
          <Link className={styles.buttonWhite} href="/registracia">
            Vytvoriť web zdarma
            <ArrowRight size={19} aria-hidden="true" />
          </Link>
          <small>Bez platobnej karty · Náhľad pred zaplatením</small>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div>
            <Link href="/" aria-label="WebPreKandidata.sk – domov"><Brand inverse /></Link>
            <p>Profesionálne volebné weby pre komunálne a krajské voľby 2026.</p>
          </div>
          <div className={styles.footerLinks}>
            <h2>Pre koho</h2>
            {Object.values(CAMPAIGN_PAGES).map((item) => (
              <Link href={item.route} key={item.route}>{item.eyebrow.split(" · ")[0]}</Link>
            ))}
          </div>
          <div className={styles.footerLinks}>
            <h2>Kontakt</h2>
            <a href="mailto:ahoj@beewoy.sk"><Mail size={17} aria-hidden="true" />ahoj@beewoy.sk</a>
            <Link href="/prihlasenie">Prihlásiť sa</Link>
            <Link href="/registracia">Vytvoriť web zdarma</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 WebPreKandidata.sk</span>
          <nav aria-label="Právne dokumenty">
            <Link href="/ochrana-sukromia">Ochrana súkromia</Link>
            <Link href="/obchodne-podmienky">Obchodné podmienky</Link>
            <Link href="/reklamacny-poriadok">Reklamačný poriadok</Link>
            <button data-cookie-settings type="button">Nastavenia cookies</button>
          </nav>
        </div>
      </footer>
    </div>
  );
}
