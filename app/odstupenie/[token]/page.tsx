import type { Metadata } from "next";
import { WithdrawalConfirmForm } from "@/components/legal/withdrawal-forms";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Potvrdiť odstúpenie od zmluvy",
  robots: { index: false, follow: false },
};

export default async function WithdrawalTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <LegalPage
      title="Potvrdiť odstúpenie od zmluvy"
      intro="Skontrolujte údaje a potvrďte odstúpenie. Po potvrdení okamžite dostanete potvrdenie s dátumom a časom."
    >
      <WithdrawalConfirmForm token={token} />
    </LegalPage>
  );
}
