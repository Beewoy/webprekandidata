import { isApexHostname } from "./hostname";

export type DomainRegistrarGuide = {
  apexAaaaWarning: string | null;
  emailRecordsNote: string;
  steps: string[];
};

/** Slovak copy for DNS setup at common registrators (Websupport, …). */
export function getDomainRegistrarGuide(hostname: string): DomainRegistrarGuide {
  const apex = isApexHostname(hostname);
  const steps = [
    "Prihláste sa u registrátora domény (napr. Websupport) a otvorte DNS záznamy pre vašu doménu.",
    apex
      ? "Pridajte alebo upravte A záznam pre root (@): hodnotu skopírujte z tabuľky nižšie (typicky 76.76.21.21)."
      : "Pridajte CNAME záznam podľa tabuľky nižšie (smeruje na hosting webu).",
    "Ak tabuľka obsahuje TXT záznam _vercel, pridajte ho tiež — hodnotu skopírujte presne z tabuľky.",
    "Po uložení zmien sa vráťte sem a kliknite na Skontrolovať DNS. HTTPS certifikát vystavíme automaticky.",
    "Zmeny DNS sa môžu šíriť od niekoľkých minút do 24 hodín.",
  ];

  return {
    apexAaaaWarning: apex
      ? "U Websupportu a ďalších registrátorov býva na root (@) predvolený AAAA záznam (IPv6). Ak overenie zlyhá, tento AAAA záznam odstráňte — ponechajte A záznam z tabuľky. E-mailové záznamy (SPF, DMARC, MX) nemažte."
      : null,
    emailRecordsNote: "Záznamy pre e-mail (SPF, DMARC, MX) neupravujte ani nemažte, ak doménu používate na poštu.",
    steps,
  };

}
