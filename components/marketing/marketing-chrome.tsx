import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, Menu, X } from "lucide-react";
import logoImage from "@/landing-page/assets/favicon.svg";
import { CAMPAIGN_PAGES } from "@/lib/marketing/campaign-pages";
import styles from "./campaign-page.module.css";

function platformHref(path: string, origin?: string) {
  if (!origin) return path;
  return `${origin.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

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

export function MarketingHeader({ nav, origin }: { nav: ReactNode; origin?: string }) {
  const homeHref = platformHref("/", origin);
  const loginHref = platformHref("/prihlasenie", origin);
  const registerHref = platformHref("/registracia", origin);

  return (
    <header className={styles.header}>
      <Link className={styles.brandLink} href={homeHref} aria-label="WebPreKandidata.sk – domov">
        <MarketingBrand />
      </Link>
      <nav className={styles.desktopNav} aria-label="Hlavná navigácia">
        {nav}
        <Link href={loginHref}>Prihlásiť sa</Link>
      </nav>
      <Link className={styles.headerCta} href={registerHref}>
        Vytvoriť web zdarma
        <ArrowRight size={17} aria-hidden="true" />
      </Link>
      <details className={styles.mobileNavigation}>
        <summary aria-label="Otvoriť navigáciu">
          <Menu className={styles.menuIcon} aria-hidden="true" />
          <X className={styles.closeIcon} aria-hidden="true" />
        </summary>
        <nav aria-label="Mobilná navigácia">
          {nav}
          <Link href={loginHref}>Prihlásiť sa</Link>
          <Link className={styles.mobileCta} href={registerHref}>
            Vytvoriť web zdarma
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </nav>
      </details>
    </header>
  );
}

export function MarketingFooter({ origin }: { origin?: string } = {}) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div>
          <Link href={platformHref("/", origin)} aria-label="WebPreKandidata.sk – domov">
            <MarketingBrand inverse />
          </Link>
          <p>Profesionálne volebné weby pre komunálne a krajské voľby 2026.</p>
        </div>
        <div className={styles.footerLinks}>
          <h2>Pre koho</h2>
          {Object.values(CAMPAIGN_PAGES).map((item) => (
            <Link href={platformHref(item.route, origin)} key={item.route}>
              {item.eyebrow.split(" · ")[0]}
            </Link>
          ))}
        </div>
        <div className={styles.footerLinks}>
          <h2>Kontakt</h2>
          <a href="mailto:ahoj@beewoy.sk">
            <Mail size={17} aria-hidden="true" />
            ahoj@beewoy.sk
          </a>
          <Link href={platformHref("/sablony", origin)}>Šablóny</Link>
          <Link href={platformHref("/prihlasenie", origin)}>Prihlásiť sa</Link>
          <Link href={platformHref("/registracia", origin)}>Vytvoriť web zdarma</Link>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p className={styles.footerCredit}>
          <span>© 2026 WebPreKandidata.sk</span>
          <span aria-hidden="true">·</span>
          <a
            className={styles.footerAttribution}
            href="https://beewoy.sk/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Vytvorené v Beewoy <span aria-hidden="true">↗</span>
          </a>
        </p>
        <nav aria-label="Právne dokumenty">
          <Link href={platformHref("/ochrana-sukromia", origin)}>Ochrana súkromia</Link>
          <Link href={platformHref("/obchodne-podmienky", origin)}>Obchodné podmienky</Link>
          <Link href={platformHref("/reklamacny-poriadok", origin)}>Reklamačný poriadok</Link>
          <button data-cookie-settings type="button">
            Nastavenia cookies
          </button>
        </nav>
      </div>
    </footer>
  );
}
