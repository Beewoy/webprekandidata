import type { Metadata } from "next";
import { LegalPage, SellerIdentity } from "@/components/legal/legal-page";

const approved = process.env.LEGAL_DOCUMENTS_APPROVED === "true";

export const metadata: Metadata = {
  title: "Reklamačný poriadok",
  description: "Pravidlá uplatnenia a vybavenia reklamácií služby WebPreKandidata.sk.",
  alternates: { canonical: "https://webprekandidata.sk/reklamacny-poriadok" },
  robots: { index: approved, follow: approved },
};

export default function ComplaintsPolicyPage() {
  return (
    <LegalPage
      title="Reklamačný poriadok"
      intro="Tento reklamačný poriadok vysvetľuje, ako oznámiť vadu služby WebPreKandidata.sk, aké údaje je potrebné uviesť a akým spôsobom bude reklamácia vybavená."
    >
      <section>
        <h2>1. Prevádzkovateľ a pôsobnosť</h2>
        <SellerIdentity />
        <p>
          Reklamačný poriadok sa vzťahuje na platené služby poskytované prostredníctvom platformy
          WebPreKandidata.sk a tvorí súčasť obchodných podmienok. Zákonné práva zákazníka, najmä práva
          spotrebiteľa, zostávajú v plnom rozsahu zachované.
        </p>
      </section>
      <section>
        <h2>2. Zodpovednosť za vady</h2>
        <p>
          Prevádzkovateľ zodpovedá za to, že objednaná služba bude poskytovaná v dohodnutom rozsahu.
          Vadou môže byť najmä nefunkčnosť plateného publikovania, editora, hostingu, HTTPS alebo inej
          funkcie, ktorá patrí do objednaného balíka Basic alebo Plus.
        </p>
        <p>
          Za vadu služby sa nepovažuje problém spôsobený výlučne nesprávnym zásahom zákazníka,
          nepodporovaným zariadením alebo softvérom, expiráciou či chybným nastavením vlastnej domény,
          poruchou internetového pripojenia alebo udalosťou mimo primeranej kontroly prevádzkovateľa.
          Tým nie je dotknutá zodpovednosť prevádzkovateľa za správny výber a riadenie jeho dodávateľov
          podľa platných predpisov.
        </p>
      </section>
      <section>
        <h2>3. Ako reklamáciu uplatniť</h2>
        <p>
          Reklamáciu pošlite na e-mail prevádzkovateľa uvedený v článku 1. Aby bolo možné problém
          rýchlo preveriť, uveďte najmä:
        </p>
        <ul>
          <li>meno a e-mail použitý pri objednávke,</li>
          <li>číslo objednávky, ak ho máte k dispozícii,</li>
          <li>adresu alebo názov dotknutého kandidátskeho webu,</li>
          <li>zrozumiteľný opis vady a čas, keď sa prejavila,</li>
          <li>požadovaný spôsob vybavenia reklamácie.</li>
        </ul>
        <p>
          Ak je to potrebné na posúdenie vady, prevádzkovateľ môže požiadať o primerané doplnenie
          informácií alebo snímku obrazovky. Nikdy neposielajte heslo, celé údaje platobnej karty ani
          iné prihlasovacie tajomstvá.
        </p>
      </section>
      <section>
        <h2>4. Potvrdenie a posúdenie reklamácie</h2>
        <p>
          Prijatie reklamácie prevádzkovateľ potvrdí bez zbytočného odkladu. V potvrdení uvedie dátum
          prijatia a podľa povahy vady aj predpokladanú lehotu vybavenia. Reklamáciu preverí podľa
          údajov objednávky, technických záznamov a skutočného rozsahu služby.
        </p>
        <p>
          Reklamácia bude vybavená bez zbytočného odkladu. Lehota oznámená spotrebiteľovi spravidla
          nepresiahne 30 dní od uplatnenia reklamácie, ibaže dlhšiu lehotu odôvodňuje objektívna
          okolnosť, ktorú prevádzkovateľ nemôže ovplyvniť.
        </p>
      </section>
      <section>
        <h2>5. Spôsoby vybavenia</h2>
        <p>Podľa charakteru vady a zákonných práv zákazníka môže byť reklamácia vybavená najmä:</p>
        <ul>
          <li>odstránením technickej vady alebo obnovením dohodnutej funkcie,</li>
          <li>poskytnutím primeranej zľavy z ceny,</li>
          <li>vrátením primeranej časti ceny,</li>
          <li>odstúpením od zmluvy a vrátením ceny, ak sú splnené zákonné podmienky,</li>
          <li>odôvodneným zamietnutím, ak služba nemá reklamovanú vadu.</li>
        </ul>
        <p>
          Peňažné plnenie sa vráti rovnakým spôsobom, akým bola platba prijatá, pokiaľ sa so zákazníkom
          nedohodne inak a nevzniknú mu tým ďalšie náklady. O výsledku vybavenia dostane zákazník
          písomné potvrdenie elektronicky.
        </p>
      </section>
      <section>
        <h2>6. Súčinnosť zákazníka</h2>
        <p>
          Zákazník je povinný poskytnúť primeranú súčinnosť potrebnú na zistenie a odstránenie vady.
          Prevádzkovateľ nebude požadovať prístupové heslo. Ak sa problém týka vlastnej domény,
          zákazník môže byť požiadaný o kontrolu alebo úpravu DNS záznamov u svojho registrátora.
        </p>
      </section>
      <section>
        <h2>7. Alternatívne riešenie spotrebiteľského sporu</h2>
        <p>
          Spotrebiteľ môže najprv požiadať prevádzkovateľa o nápravu. Ak s vybavením nie je spokojný
          alebo prevádzkovateľ na žiadosť neodpovie v zákonnej lehote, môže sa za splnenia zákonných
          podmienok obrátiť na príslušný subjekt alternatívneho riešenia sporov, najmä Slovenskú
          obchodnú inšpekciu.
        </p>
      </section>
      <section>
        <h2>8. Záverečné ustanovenia</h2>
        <p>
          Otázky neupravené týmto reklamačným poriadkom sa riadia obchodnými podmienkami a právnym
          poriadkom Slovenskej republiky. Aktuálne znenie je zverejnené na tejto stránke s dátumom
          účinnosti.
        </p>
      </section>
    </LegalPage>
  );
}
