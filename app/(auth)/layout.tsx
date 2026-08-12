import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { AuthElectionBadge } from "@/components/auth/auth-election-badge";
import { getDaysUntilElection } from "@/lib/marketing/election-countdown";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const showElectionBadge = getDaysUntilElection() !== null;

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-panel__inner">
          <Image src="/brand/logo-horizontal.svg" alt="WebPreKandidata.sk" width={210} height={42} priority />
          {showElectionBadge ? <AuthElectionBadge placement="panel" /> : null}
          {children}
          <p className="auth-legal">
            Pokračovaním súhlasíte s <Link href="/obchodne-podmienky">obchodnými podmienkami</Link> a{" "}
            <Link href="/ochrana-sukromia">zásadami ochrany osobných údajov</Link>.
          </p>
        </div>
      </section>
      <aside className="auth-benefits" aria-label="Výhody služby">
        <div className="auth-benefits__content">
          <p className="eyebrow">Váš volebný web bez technických starostí</p>
          <h2>Od prvého textu až po zverejnenie na jednom mieste.</h2>
          {showElectionBadge ? <AuthElectionBadge placement="benefits" /> : null}
          <div className="benefit-list">
            <span><i><FileText size={20} /></i><span><strong>Vedený editor</strong><small>Vždy presne viete, čo ešte treba doplniť.</small></span></span>
            <span><i><Sparkles size={20} /></i><span><strong>AI pomoc s obsahom</strong><small>Návrhy textov zostávajú pod vašou kontrolou.</small></span></span>
            <span><i><ShieldCheck size={20} /></i><span><strong>Bezpečná prevádzka</strong><small>Hosting, certifikát a technické aktualizácie riešime za vás.</small></span></span>
          </div>
          <div className="auth-quote"><CheckCircle2 size={19} /><p>Profesionálny výsledok bez potreby programátora alebo agentúry.</p></div>
        </div>
      </aside>
    </main>
  );
}
