import Link from "next/link";
import { ArrowRight, LayoutTemplate, LogIn, MonitorSmartphone } from "lucide-react";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/marketing-chrome";
import { getAppUrl } from "@/lib/env";
import campaign from "./campaign-page.module.css";
import styles from "./platform-not-found.module.css";

const COPY = {
  missing: {
    eyebrow: "Chyba 404",
    title: "Túto stránku sme nenašli.",
    body:
      "Adresa môže obsahovať preklep, odkaz už nemusí platiť, alebo kandidátsky web ešte nie je verejne zverejnený.",
    primaryLabel: "Späť na úvod",
  },
  domain: {
    eyebrow: "Doména nie je pripojená",
    title: "Na tejto adrese nie je publikovaný web.",
    body:
      "Vlastná doména nie je aktívne prepojená s kandidátskym webom na WebPreKandidata.sk. Ak ide o váš projekt, prihláste sa a skontrolujte nastavenie v sekcii Doména.",
    primaryLabel: "Prejsť na WebPreKandidata.sk",
  },
} as const;

function href(path: string, origin: string) {
  return `${origin.replace(/\/$/, "")}${path}`;
}

export function PlatformNotFound({ variant }: { variant: keyof typeof COPY }) {
  const origin = getAppUrl();
  const copy = COPY[variant];

  return (
    <div className={campaign.page}>
      <a className={campaign.skipLink} href="#hlavny-obsah">
        Preskočiť na hlavný obsah
      </a>
      <MarketingHeader
        origin={origin}
        nav={
          <>
            <Link href={href("/sablony", origin)}>Šablóny</Link>
            <Link href={href("/#cennik", origin)}>Cenník</Link>
          </>
        }
      />
      <main className={styles.main} id="hlavny-obsah">
        <section className={styles.panel} aria-labelledby="not-found-title">
          <p className={styles.code} aria-hidden="true">
            404
          </p>
          <div className={styles.copy}>
            <p className={campaign.eyebrow}>{copy.eyebrow}</p>
            <h1 id="not-found-title">{copy.title}</h1>
            <p>{copy.body}</p>
            <div className={styles.actions}>
              <Link className={campaign.buttonPrimary} href={href("/", origin)}>
                {copy.primaryLabel}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className={campaign.buttonOutline} href={href("/registracia", origin)}>
                Vytvoriť web zdarma
              </Link>
            </div>
            <ul className={styles.shortcuts}>
              <li>
                <Link href={href("/sablony", origin)}>
                  <LayoutTemplate size={18} aria-hidden="true" />
                  Šablóny volebného webu
                </Link>
              </li>
              <li>
                <Link href={href("/ukazka", origin)}>
                  <MonitorSmartphone size={18} aria-hidden="true" />
                  Pozrieť ukážku
                </Link>
              </li>
              <li>
                <Link href={href("/prihlasenie", origin)}>
                  <LogIn size={18} aria-hidden="true" />
                  Prihlásiť sa do editora
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <MarketingFooter origin={origin} />
    </div>
  );
}
