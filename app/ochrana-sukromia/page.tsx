import type { Metadata } from "next";
import { LegalPage, SellerIdentity } from "@/components/legal/legal-page";

const approved = process.env.LEGAL_DOCUMENTS_APPROVED === "true";

export const metadata: Metadata = {
  title: "Ochrana súkromia",
  description: "Informácie o spracúvaní osobných údajov v službe WebPreKandidata.sk.",
  alternates: { canonical: "https://webprekandidata.sk/ochrana-sukromia" },
  robots: { index: approved, follow: approved },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Ochrana súkromia"
      intro="Tieto zásady vysvetľujú, aké osobné údaje spracúvame pri prevádzke platformy WebPreKandidata.sk, na aký účel a ako dlho."
    >
      <section>
        <h2>1. Prevádzkovateľ</h2>
        <SellerIdentity />
      </section>
      <section>
        <h2>2. Aké údaje spracúvame</h2>
        <ul>
          <li>údaje účtu, najmä meno, e-mail, prihlasovacie a bezpečnostné záznamy,</li>
          <li>obsah kandidátskeho webu, fotografie, kontakty a údaje o projekte,</li>
          <li>fakturačné a platobné údaje potrebné na objednávku a evidenciu platby,</li>
          <li>správy odoslané cez kontaktné a podporné formuláre,</li>
          <li>minimalizované technické, auditné a AI prevádzkové záznamy bez uloženia plných promptov.</li>
        </ul>
      </section>
      <section>
        <h2>3. Účely a právne základy</h2>
        <p>
          Údaje používame na vytvorenie a plnenie zmluvy, zabezpečenie účtu, prevádzku editora,
          publikovanie webu, spracovanie platieb, doručovanie správ, plnenie zákonných povinností a
          ochranu služby pred zneužitím. Ak je spracúvanie založené na súhlase, súhlas môžete odvolať.
        </p>
      </section>
      <section>
        <h2>4. Dodávatelia</h2>
        <p>
          Pri prevádzke používame najmä Vercel na hosting, Supabase na databázu, autentifikáciu a
          úložisko, Stripe na platby, Brevo na doručovanie e-mailov a OpenAI na voliteľné AI návrhy.
          Dodávatelia dostávajú iba údaje potrebné na konkrétnu službu a spracúvajú ich podľa svojich
          zmluvných a bezpečnostných podmienok.
        </p>
      </section>
      <section>
        <h2>5. AI návrhy</h2>
        <p>
          AI je voliteľná pomôcka. Vstup sa odosiela iba po akcii používateľa, požiadavky používajú
          režim bez ukladania poskytovateľom a výsledok sa uloží do projektu až po výslovnom prijatí.
          Platforma trvalo neukladá celý prompt ani odmietnutý návrh.
        </p>
      </section>
      <section>
        <h2>6. Uchovávanie</h2>
        <p>
          Kontaktné správy a minimalizované AI záznamy sa automaticky odstránia najneskôr po 90 dňoch.
          Účtovné údaje uchovávame počas zákonnej lehoty. Údaje účtu a projektu uchovávame počas
          trvania služby a následne iba po dobu potrebnú na vysporiadanie povinností a nárokov.
        </p>
      </section>
      <section>
        <h2>7. Vaše práva</h2>
        <p>
          Môžete požiadať o prístup, opravu, vymazanie, obmedzenie spracúvania, prenos údajov alebo
          namietať proti spracúvaniu. Žiadosť pošlite na kontaktný e-mail prevádzkovateľa. Máte tiež
          právo obrátiť sa na Úrad na ochranu osobných údajov Slovenskej republiky.
        </p>
      </section>
      <section>
        <h2>8. Cookies a bezpečnosť</h2>
        <p>
          Používame nevyhnutné cookies pre prihlásenie a bezpečnú reláciu. Reklamné cookies v MVP
          nepoužívame. Prenos je šifrovaný a prístup k údajom obmedzujú serverové kontroly a databázové
          pravidlá podľa vlastníctva projektu.
        </p>
      </section>
    </LegalPage>
  );
}
