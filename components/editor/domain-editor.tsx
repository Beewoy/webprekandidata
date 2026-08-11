"use client";

import { Check, Copy, Globe2, Info, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PageHeading } from "@/components/ui/page-heading";

export function DomainEditor() {
  const [mode, setMode] = useState<"subdomain" | "custom">("subdomain");

  return (
    <div className="page-container">
      <PageHeading eyebrow="Adresa webu" title="Doména" description="Vyberte, na akej adrese návštevníci váš web nájdu." />
      <section className="editor-card">
        <div className="domain-options">
          <button type="button" className={mode === "subdomain" ? "domain-option domain-option--active" : "domain-option"} onClick={() => setMode("subdomain")}>
            <span className="domain-radio">{mode === "subdomain" && <Check size={14} />}</span><span><strong>Adresa na WebPreKandidata.sk</strong><small>Súčasť balíka Basic aj Plus</small></span><em>49,99 €</em>
          </button>
          <button type="button" className={mode === "custom" ? "domain-option domain-option--active" : "domain-option"} onClick={() => setMode("custom")}>
            <span className="domain-radio">{mode === "custom" && <Check size={14} />}</span><span><strong>Vlastná doména</strong><small>Napríklad martin-novak.sk · balík Plus</small></span><em>89,99 €</em>
          </button>
        </div>

        {mode === "subdomain" ? (
          <div className="domain-form">
            <label className="field"><span>Adresa vášho webu</span><div className="slug-input"><span>webprekandidata.sk/</span><input defaultValue="martin-novak" /></div><small>Bez medzier, diakritiky a špeciálnych znakov.</small></label>
            <div className="domain-result"><Globe2 size={20} /><span><small>Vaša budúca adresa</small><strong>webprekandidata.sk/martin-novak</strong></span><button className="icon-button" type="button" aria-label="Kopírovať adresu"><Copy size={17} /></button></div>
          </div>
        ) : (
          <div className="domain-form">
            <label className="field"><span>Vaša doména</span><input defaultValue="martin-novak.sk" /><small>Doménu môžete vlastniť už teraz alebo vám pomôžeme s registráciou.</small></label>
            <div className="info-box"><Info size={18} /><span><strong>Po zverejnení vás prevedieme nastavením</strong><small>Pripravíme presné DNS údaje. Bežné sprevádzkovanie trvá od niekoľkých minút do 24 hodín.</small></span></div>
          </div>
        )}
        <div className="editor-card__footer"><span><ShieldCheck size={16} /> HTTPS certifikát a bezpečné pripojenie zabezpečíme automaticky.</span><button className="button button--primary" type="button">Uložiť adresu</button></div>
      </section>
    </div>
  );
}
