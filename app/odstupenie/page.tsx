import type { Metadata } from "next";
import Link from "next/link";
import { WithdrawalRequestForm } from "@/components/legal/withdrawal-forms";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Odstúpiť od zmluvy",
  robots: { index: false, follow: false },
};

export default function WithdrawalPage() {
  return (
    <LegalPage
      title="Odstúpiť od zmluvy tu"
      intro="Spotrebiteľ môže počas zákonnej lehoty odstúpiť od zmluvy aj bez prihlásenia. Zadajte číslo objednávky a e-mail z potvrdenia — pošleme vám bezpečný odkaz na dokončenie."
    >
      <WithdrawalRequestForm />
      <p>
        Odstúpenie môžete uplatniť aj e-mailom na{" "}
        <a href="mailto:ahoj@beewoy.sk">ahoj@beewoy.sk</a>. Po prihlásení nájdete odkaz aj pri
        objednávke v sekcii Publikovanie.
      </p>
      <p>
        <Link href="/obchodne-podmienky">Späť na obchodné podmienky</Link>
      </p>
    </LegalPage>
  );
}
