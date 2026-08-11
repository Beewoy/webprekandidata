import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  const approved = process.env.LEGAL_DOCUMENTS_APPROVED === "true";

  return (
    <main className="legal-shell">
      <nav className="legal-nav" aria-label="Právne dokumenty">
        <Link href="/">WebPreKandidata.sk</Link>
        <div>
          <Link href="/ochrana-sukromia">Ochrana súkromia</Link>
          <Link href="/obchodne-podmienky">Obchodné podmienky</Link>
          <Link href="/reklamacny-poriadok">Reklamačný poriadok</Link>
        </div>
      </nav>
      <article className="legal-document">
        {!approved && (
          <p className="legal-draft" role="status">
            Pracovné znenie. Pred spustením platených služieb musí dokument skontrolovať právny odborník
            a prevádzkovateľ musí nastaviť <code>LEGAL_DOCUMENTS_APPROVED=true</code>.
          </p>
        )}
        <p className="eyebrow">Platné znenie od 11. augusta 2026</p>
        <h1>{title}</h1>
        <p className="legal-intro">{intro}</p>
        {children}
      </article>
    </main>
  );
}

export function SellerIdentity() {
  return (
    <address>
      <strong>{process.env.SELLER_NAME || "Ing. Tibor Antal"}</strong>
      <span>
        {process.env.SELLER_ADDRESS ||
          "Jána Stanislava 3085/37, 841 05 Bratislava – Karlova Ves, Slovensko"}
      </span>
      <span>IČO: {process.env.SELLER_ICO || "50640259"}</span>
      <span>DIČ: {process.env.SELLER_DIC || "1075966881"}</span>
      <a href={`mailto:${process.env.SELLER_EMAIL || "tibor.antal2@gmail.com"}`}>
        {process.env.SELLER_EMAIL || "tibor.antal2@gmail.com"}
      </a>
    </address>
  );
}
