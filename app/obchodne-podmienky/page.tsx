import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, SellerIdentity } from "@/components/legal/legal-page";

const approved = process.env.LEGAL_DOCUMENTS_APPROVED === "true";

export const metadata: Metadata = {
  title: "Obchodné podmienky",
  description: "Obchodné podmienky služby WebPreKandidata.sk.",
  alternates: { canonical: "https://webprekandidata.sk/obchodne-podmienky" },
  robots: { index: approved, follow: approved },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Obchodné podmienky"
      intro="Tieto všeobecné obchodné podmienky upravujú vytvorenie, objednanie, publikovanie a prevádzku kandidátskeho webu prostredníctvom platformy WebPreKandidata.sk."
    >
      <section>
        <h2>1. Prevádzkovateľ a základné pojmy</h2>
        <SellerIdentity />
        <p>
          Prevádzkovateľ je zároveň predávajúcim služby. Platformou sa rozumie webová aplikácia
          WebPreKandidata.sk. Zákazníkom je fyzická alebo právnická osoba, ktorá si vytvorí účet alebo
          objedná platený balík. Projektom sa rozumie jeden kandidátsky web vytvorený v platforme.
          Zákazník, ktorý nekoná v rámci podnikania alebo povolania, je spotrebiteľom.
        </p>
      </section>
      <section>
        <h2>2. Účet, bezplatný editor a uzavretie zmluvy</h2>
        <p>
          Po registrácii môže zákazník bezplatne používať editor a súkromný náhľad. Účet je chránený
          e-mailom a heslom; zákazník zodpovedá za ochranu prihlasovacích údajov a za pravdivosť údajov,
          ktoré zadá. Bezplatný náhľad nie je verejne publikovanou službou.
        </p>
        <p>
          Odoslanie objednávky je návrhom zákazníka na uzavretie zmluvy. Zmluva o platenom balíku
          vznikne úspešnou úhradou a potvrdením objednávky prevádzkovateľom. Zmluva sa uzatvára v
          slovenskom jazyku a jej údaje sa uchovávajú v elektronickej podobe.
        </p>
      </section>
      <section>
        <h2>3. Balíky, cena a platba</h2>
        <ul>
          <li>
            <strong>Basic za 49,99 €</strong> zahŕňa verejný kandidátsky web na adrese platformy,
            obsahový editor, aktuality, kontaktný formulár, základné SEO a štandardnú podporu.
          </li>
          <li>
            <strong>Plus za 89,99 €</strong> zahŕňa funkcie balíka Basic, pripojenie jednej
            existujúcej vlastnej domény, AI návrhy aktualít v stanovenom limite a prioritnú podporu.
          </li>
        </ul>
        <p>
          Ide o jednorazovú platbu bez automatického obnovenia. Presná doba poskytovania služby a
          prípadné podmienky predĺženia sa zákazníkovi zobrazia pred záväzným odoslaním objednávky a
          budú súčasťou jej potvrdenia. Cena Plus nezahŕňa registráciu, obnovu ani poplatky registrátora
          vlastnej domény.
        </p>
        <p>
          Platba sa uskutočňuje kartou cez platobnú bránu Stripe. Balík sa aktivuje až po bezpečnom
          potvrdení úhrady platobnou bránou; samotný návrat zákazníka z platobnej stránky úhradu
          nepotvrdzuje. Doklad o kúpe sa poskytne elektronicky na e-mail uvedený v objednávke.
        </p>
      </section>
      <section>
        <h2>4. Aktivácia, publikovanie a prevádzka webu</h2>
        <p>
          Po potvrdení platby zákazník dokončí obsah a web sám zverejní. Verejná verzia zobrazuje iba
          posledný obsah, ktorý zákazník výslovne publikoval; neskoršie rozpracované zmeny zostávajú
          súkromné až do ďalšieho publikovania.
        </p>
        <p>
          Prevádzkovateľ zabezpečuje hosting, HTTPS a technickú prevádzku v rozsahu objednaného balíka.
          Môže vykonať primeranú údržbu alebo nevyhnutnú odstávku a pri plánovanom zásahu zákazníka
          podľa možností vopred informuje. Nepretržitá dostupnosť bez akéhokoľvek výpadku sa
          negarantuje, najmä pri udalostiach mimo primeranej kontroly prevádzkovateľa.
        </p>
      </section>
      <section>
        <h2>5. Vlastná doména v balíku Plus</h2>
        <p>
          Zákazník musí mať právo používať pripájanú doménu a poskytnúť súčinnosť pri nastavení DNS.
          Za registráciu, obnovu a správnosť nastavení u registrátora zodpovedá zákazník. Prevádzkovateľ
          nezodpovedá za nedostupnosť spôsobenú expiráciou domény, nesprávnym DNS nastavením alebo
          poruchou na strane registrátora, certifikačnej autority či iného externého dodávateľa.
        </p>
      </section>
      <section>
        <h2>6. Obsah zákazníka a volebná kampaň</h2>
        <p>
          Zákazník zodpovedá za pravdivosť a zákonnosť textov, fotografií, log, kontaktných údajov a
          ostatného obsahu, ktorý vloží alebo publikuje. Zároveň vyhlasuje, že má všetky potrebné
          súhlasy a práva na jeho použitie. Zákazník je povinný doplniť zákonné označenia a údaje
          vyžadované pravidlami volebnej kampane a politickej reklamy.
        </p>
        <p>
          Zakázaný je najmä nezákonný, klamlivý, hanlivý alebo nenávistný obsah, porušovanie práv
          tretích osôb, vydávanie sa za inú osobu bez oprávnenia, šírenie škodlivého kódu, automatizované
          zneužívanie služby a obchádzanie jej zabezpečenia. Platforma nie je nástrojom na prijímanie
          politických darov ani na automatické rozosielanie kampaní.
        </p>
      </section>
      <section>
        <h2>7. AI návrhy</h2>
        <p>
          Funkcie umelej inteligencie sú voliteľnou pomôckou na vytvorenie návrhov z podkladov
          zákazníka. Výsledok môže obsahovať nepresnosť alebo nevhodnú formuláciu. Zákazník musí návrh
          pred uložením a publikovaním skontrolovať a zodpovedá za jeho finálne znenie. Platforma AI
          návrh automaticky nepublikuje a negarantuje jeho vecnú ani právnu správnosť.
        </p>
      </section>
      <section>
        <h2>8. Práva k platforme a zákazníckemu obsahu</h2>
        <p>
          Zdrojový kód, rozhranie, šablóny, značka a ostatné súčasti platformy patria prevádzkovateľovi
          alebo jeho dodávateľom. Zákazník získava počas trvania služby nevýhradné a neprenosné právo
          používať ich na správu svojho projektu.
        </p>
        <p>
          Práva k zákazníckemu obsahu zostávajú zákazníkovi. Zákazník udeľuje prevádzkovateľovi
          nevýhradné oprávnenie obsah uložiť, technicky upraviť, zálohovať a zobraziť iba v rozsahu
          potrebnom na poskytnutie služby.
        </p>
      </section>
      <section>
        <h2>9. Pozastavenie a ukončenie služby</h2>
        <p>
          Zákazník môže verejný web dočasne pozastaviť. Prevádzkovateľ môže primerane obmedziť alebo
          pozastaviť projekt pri závažnom či opakovanom porušení týchto podmienok, bezpečnostnom
          incidente, dôvodnom podozrení na nezákonný obsah alebo na základe záväzného rozhodnutia
          oprávneného orgánu. Ak to okolnosti dovoľujú, oznámi zákazníkovi dôvod a možnosť nápravy.
        </p>
        <p>
          Po skončení objednaného obdobia môže byť verejný web deaktivovaný. Zánikom služby nie je
          dotknuté uchovanie účtovných dokladov, bezpečnostných záznamov alebo iných údajov, ktoré musí
          prevádzkovateľ uchovať podľa zákona.
        </p>
      </section>
      <section>
        <h2>10. Odstúpenie spotrebiteľa od zmluvy</h2>
        <p>
          Spotrebiteľ môže od zmluvy uzavretej na diaľku odstúpiť bez uvedenia dôvodu v zákonnej
          14-dňovej lehote. Oznámenie môže poslať na e-mail prevádzkovateľa uvedený v článku 1; musí z
          neho byť zrejmé, kto odstupuje a ktorej objednávky sa odstúpenie týka.
        </p>
        <p>
          Ak spotrebiteľ výslovne požiadal o začatie poskytovania služby pred uplynutím lehoty na
          odstúpenie a následne odstúpi, môže byť povinný uhradiť cenu za plnenie skutočne poskytnuté
          do doručenia odstúpenia. Ak sú splnené zákonné podmienky zániku práva na odstúpenie pri plne
          dodanom digitálnom plnení, bude spotrebiteľ pred objednávkou osobitne poučený a vyžiada sa
          jeho výslovný súhlas.
        </p>
      </section>
      <section>
        <h2>11. Vady a reklamácie</h2>
        <p>
          Prevádzkovateľ zodpovedá za poskytnutie služby v dohodnutom rozsahu. Vadu je možné oznámiť
          e-mailom s číslom objednávky, identifikáciou projektu a opisom problému. Reklamácia bude
          potvrdená a vybavená v zákonnej lehote. Tým nie sú obmedzené žiadne práva spotrebiteľa, ktoré
          nemožno zmluvne vylúčiť.
        </p>
        <p>
          Podrobný postup upravuje <Link href="/reklamacny-poriadok">reklamačný poriadok</Link>.
        </p>
      </section>
      <section>
        <h2>12. Zodpovednosť</h2>
        <p>
          Prevádzkovateľ zodpovedá za porušenie svojich povinností podľa platných právnych predpisov.
          Nezodpovedá však za obsah zákazníka, rozhodnutia návštevníkov webu ani za výpadky a škody
          spôsobené výlučne zákazníkom, vyššou mocou alebo externou službou mimo jeho primeranej
          kontroly. Toto ustanovenie neobmedzuje zodpovednosť, ktorú zákon obmedziť nepripúšťa.
        </p>
      </section>
      <section>
        <h2>13. Podnety a alternatívne riešenie sporov</h2>
        <p>
          Zákazník môže poslať žiadosť o nápravu na kontaktný e-mail prevádzkovateľa. Spotrebiteľ,
          ktorý nie je spokojný so spôsobom vybavenia alebo nedostane odpoveď v zákonnej lehote, sa
          môže obrátiť na príslušný subjekt alternatívneho riešenia sporov, najmä Slovenskú obchodnú
          inšpekciu, ak sú splnené zákonné podmienky.
        </p>
      </section>
      <section>
        <h2>14. Záverečné ustanovenia</h2>
        <p>
          Právne vzťahy sa riadia právnym poriadkom Slovenskej republiky. Zákonné pravidlá o právomoci,
          rozhodnom práve a ochrane spotrebiteľa zostávajú zachované. Neplatnosť jednej časti podmienok
          nemá vplyv na ostatné ustanovenia.
        </p>
        <p>
          Prevádzkovateľ môže podmienky meniť najmä pri zmene služby alebo právnych predpisov. Na už
          uzavretú objednávku sa použije znenie účinné v čase jej uzavretia, ak záväzný predpis
          nevyžaduje inak. Aktuálne znenie je vždy zverejnené na tejto stránke s dátumom účinnosti.
        </p>
      </section>
    </LegalPage>
  );
}
