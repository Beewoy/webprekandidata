import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import logoImage from "@/landing-page/assets/favicon.svg";
import { CAMPAIGN_PAGES } from "@/lib/marketing/campaign-pages";
import styles from "./campaign-page.module.css";

export function MarketingBrand({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={inverse ? styles.brandInverse : styles.brand}>
      <Image className={styles.brandMark} src={logoImage} alt="" aria-hidden="true" />
      <span>
        WebPreKandidata<span className={styles.brandDomain}>.sk</span>
      </span>
    </span>
  );
}

export function MarketingHeader({ nav }: { nav: ReactNode }) {
  return (
    <header className={styles.header}>
      <Link href="/" aria-label="WebPreKandidata.sk – domov">
        <MarketingBrand />
      </Link>
      <nav className={styles.desktopNav} aria-label="Hlavná navigácia">
        {nav}
        <Link href="/prihlasenie">Prihlásiť sa</Link>
      </nav>
      <Link className={styles.headerCta} href="/registracia">
        Vytvoriť web zdarma
        <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div>
          <Link href="/" aria-label="WebPreKandidata.sk – domov"><MarketingBrand inverse /></Link>
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
          <Link href="/sablony">Šablóny</Link>
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
  );
}
