import Link from "next/link";
import type { ReactNode } from "react";
import {
  formatVatStatusLabel,
  getSellerIdentity,
} from "@/lib/legal/seller";

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
          <Link href="/odstupenie">Odstúpenie</Link>
        </div>
      </nav>
      <article className="legal-document">
        {!approved && (
          <p className="legal-draft" role="status">
            Pracovné znenie. Pred spustením platených služieb musí prevádzkovateľ skontrolovať
            dokumenty a nastaviť <code>LEGAL_DOCUMENTS_APPROVED=true</code>.
          </p>
        )}
        <p className="eyebrow">Platné znenie od 13. augusta 2026 · verzia 2026.1</p>
        <h1>{title}</h1>
        <p className="legal-intro">{intro}</p>
        {children}
      </article>
    </main>
  );
}

export function SellerIdentity() {
  const seller = getSellerIdentity();

  return (
    <address>
      <strong>{seller.name}</strong>
      <span>{seller.address}</span>
      <span>IČO: {seller.ico}</span>
      <span>DIČ: {seller.dic}</span>
      <span>{formatVatStatusLabel(seller)}</span>
      <span>
        {seller.registerName}, {seller.registrationAuthority}, č. zápisu{" "}
        {seller.registrationNumber}
      </span>
      <a href={`tel:${seller.phone.replace(/\s+/g, "")}`}>{seller.phone}</a>
      <a href={`mailto:${seller.email}`}>{seller.email}</a>
      <span>
        Orgán dohľadu: {seller.supervisoryAuthorityName},{" "}
        {seller.supervisoryAuthorityAddress},{" "}
        <a href={`mailto:${seller.supervisoryAuthorityEmail}`}>
          {seller.supervisoryAuthorityEmail}
        </a>
      </span>
    </address>
  );
}
