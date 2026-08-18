import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/marketing-chrome";
import { TemplateShowcaseCards } from "@/components/marketing/template-showcase-cards";
import campaign from "./campaign-page.module.css";
import styles from "./templates-catalog.module.css";
import "../../landing-page/assets/template-showcase.css";

export function TemplatesCatalog() {
  return (
    <div className={campaign.page}>
      <a className={campaign.skipLink} href="#hlavny-obsah">
        Preskočiť na hlavný obsah
      </a>
      <MarketingHeader
        nav={
          <>
            <Link href="/sablony" aria-current="page">Šablóny</Link>
            <Link href="/#cennik">Cenník</Link>
          </>
        }
      />
      <main id="hlavny-obsah">
        <section className={styles.intro} aria-labelledby="sablony-title">
          <p className={campaign.eyebrow}>Vzhľad vašej kampane</p>
          <h1 id="sablony-title">Štyri profesionálne šablóny pre volebný web.</h1>
          <p>
            Každá má vlastný charakter, no všetky obsahujú rovnaké sekcie, fungujú na mobile
            aj počítači a sú dostupné v balíkoch Basic aj Plus.
          </p>
        </section>
        <section className={`template-showcase ${styles.showcase}`} aria-label="Zoznam šablón">
          <TemplateShowcaseCards />
        </section>
        <section className={campaign.finalCta}>
          <p className={campaign.eyebrowLight}>Začnite bez platobnej karty</p>
          <h2>Vyskúšajte šablónu vo vlastnom editore.</h2>
          <p>Náhľad aj výber vzhľadu sú zdarma. Platíte až pri zverejnení.</p>
          <Link className={campaign.buttonWhite} href="/registracia">
            Vytvoriť web zdarma
            <ArrowRight size={19} aria-hidden="true" />
          </Link>
          <small>Bez platobnej karty · Náhľad pred zaplatením</small>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
