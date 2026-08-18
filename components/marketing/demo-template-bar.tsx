import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { demoTemplateCatalog, getDemoTemplateById } from "@/lib/demo/sample-site";
import type { CampaignTemplateId } from "@/lib/site-theme";
import styles from "./demo-template-bar.module.css";

export function DemoTemplateBar({ template }: { template: CampaignTemplateId }) {
  const current = getDemoTemplateById(template);

  return (
    <div className={styles.bar}>
      <p className={styles.label}>
        Ukážka šablóny <strong>{current?.name ?? "Horizont"}</strong>
      </p>
      <nav aria-label="Ďalšie šablóny" className={styles.nav}>
        {demoTemplateCatalog.map((item) => {
          const isCurrent = item.id === template;

          return (
            <Link
              aria-current={isCurrent ? "page" : undefined}
              className={isCurrent ? styles.templateCurrent : styles.template}
              href={`/ukazka/${item.slug}`}
              key={item.slug}
            >
              {item.name}
            </Link>
          );
        })}
        <Link className={styles.all} href="/sablony">
          Všetky šablóny
        </Link>
      </nav>
      <Link className={styles.cta} href="/registracia">
        Vytvoriť web
        <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </div>
  );
}
