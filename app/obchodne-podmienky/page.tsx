import type { Metadata } from "next";
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
      intro="Tieto podmienky upravujú používanie editora a objednanie publikovania kandidátskeho webu prostredníctvom služby WebPreKandidata.sk."
    >
      <section>
        <h2>1. Poskytovateľ služby</h2>
        <SellerIdentity />
      </section>
      <section>
        <h2>2. Rozsah služby</h2>
        <p>
          Bezplatná časť zahŕňa účet, editor a súkromný náhľad. Verejné publikovanie sa aktivuje až po
          úspešnej platbe. Používateľ zodpovedá za správnosť, zákonnosť a práva k textom, fotografiám,
          označeniam a ďalšiemu obsahu, ktorý do služby vloží.
        </p>
      </section>
      <section>
        <h2>3. Balíky a ceny</h2>
        <ul>
          <li>Basic: 49,99 € s DPH, jednorazová platba,</li>
          <li>Plus: 89,99 € s DPH, jednorazová platba vrátane jednej existujúcej vlastnej domény.</li>
        </ul>
        <p>
          Registrácia novej domény nie je súčasťou ceny. Doba poskytovania hostingu a pravidlá
          predĺženia budú uvedené v objednávke pred jej potvrdením; systém ich nesmie dopĺňať spätne.
        </p>
      </section>
      <section>
        <h2>4. Objednávka a platba</h2>
        <p>
          Zmluva vzniká potvrdením objednávky a úspešnou úhradou cez Stripe. Balík sa aktivuje až po
          overení platby podpísaným oznámením platobnej brány. Návrat z platobnej stránky sám osebe
          neznamená potvrdenie úhrady.
        </p>
      </section>
      <section>
        <h2>5. Publikovanie a vlastná doména</h2>
        <p>
          Verejný web zobrazuje poslednú verziu, ktorú používateľ výslovne publikoval. Rozpracované
          zmeny zostávajú súkromné. Pri balíku Plus poskytne používateľ súčinnosť pri nastavení DNS
          vlastnej domény. Dostupnosť domény a služby môže ovplyvniť externý registrátor alebo
          poskytovateľ infraštruktúry.
        </p>
      </section>
      <section>
        <h2>6. Povolený obsah</h2>
        <p>
          Službu nemožno používať na nezákonný obsah, vydávanie sa za inú osobu, porušovanie práv
          tretích strán, škodlivý kód alebo obchádzanie bezpečnostných limitov. Poskytovateľ môže
          verejný web primerane pozastaviť pri právnom alebo bezpečnostnom incidente; dôvod zásahu sa
          eviduje.
        </p>
      </section>
      <section>
        <h2>7. AI funkcie</h2>
        <p>
          AI vytvára iba návrhy z podkladov používateľa. Používateľ musí každý návrh skontrolovať a
          nesie zodpovednosť za obsah, ktorý uloží a publikuje. AI funkcie nikdy automaticky
          nepublikujú politické tvrdenia.
        </p>
      </section>
      <section>
        <h2>8. Reklamácie a odstúpenie</h2>
        <p>
          Problém oznámte bezodkladne e-mailom s identifikáciou účtu a projektu. Zákonné práva
          spotrebiteľa zostávajú zachované. Ak používateľ požiada o okamžité začatie poskytovania
          digitálnej služby pred uplynutím lehoty na odstúpenie, príslušné poučenie a výslovný súhlas
          musia byť súčasťou objednávky.
        </p>
      </section>
      <section>
        <h2>9. Zodpovednosť a dostupnosť</h2>
        <p>
          Poskytovateľ udržiava primerané technické a bezpečnostné opatrenia, negarantuje však
          nepretržitú dostupnosť externých služieb. Obmedzenie zodpovednosti sa neuplatní tam, kde ho
          kogentné právne predpisy nepripúšťajú.
        </p>
      </section>
      <section>
        <h2>10. Záverečné ustanovenia</h2>
        <p>
          Zmeny podmienok sa zverejnia s dátumom účinnosti. Na vzťah sa uplatňuje právo Slovenskej
          republiky; právomoc orgánov a spotrebiteľské práva podľa záväzných predpisov tým nie sú
          dotknuté.
        </p>
      </section>
    </LegalPage>
  );
}
