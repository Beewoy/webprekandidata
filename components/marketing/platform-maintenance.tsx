import { MarketingBrand } from "@/components/marketing/marketing-chrome";
import campaign from "./campaign-page.module.css";
import styles from "./platform-not-found.module.css";

export function PlatformMaintenance() {
  return (
    <div className={campaign.page}>
      <a className={campaign.skipLink} href="#hlavny-obsah">
        Preskočiť na hlavný obsah
      </a>
      <header className={campaign.header}>
        <span className={campaign.brandLink} aria-label="WebPreKandidata.sk">
          <MarketingBrand />
        </span>
      </header>
      <main className={styles.main} id="hlavny-obsah">
        <section className={styles.panel} aria-labelledby="maintenance-title">
          <p className={styles.code} aria-hidden="true">
            —
          </p>
          <div className={styles.copy}>
            <p className={campaign.eyebrow}>Dočasne nedostupné</p>
            <h1 id="maintenance-title">Prevádzka je pozastavená.</h1>
            <p>
              WebPreKandidata.sk je momentálne mimo prevádzky. Ďakujeme za pochopenie.
            </p>
          </div>
        </section>
      </main>
      <footer className={campaign.footer}>
        <div className={campaign.footerTop}>
          <div>
            <MarketingBrand inverse />
            <p>WebPreKandidata.sk</p>
          </div>
          <div className={campaign.footerLinks}>
            <h2>Kontakt</h2>
            <a href="mailto:ahoj@beewoy.sk">ahoj@beewoy.sk</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
