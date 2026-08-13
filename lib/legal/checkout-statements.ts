/** Fixed statement texts versioned with checkout acceptances (LB-02). */

export const CUSTOMER_TYPE_STATEMENT_VERSION = "2026.1";

export const CUSTOMER_TYPE_STATEMENTS = {
  b2c: "Nakupujem ako spotrebiteľ (nie v súvislosti s podnikaním, povolaním ani za právnickú osobu).",
  b2b: "Nakupujem v súvislosti s podnikaním, povolaním alebo za právnickú osobu. Beriem na vedomie, že týmto vyhlásením uplatňujem B2B režim; samotné IČO automaticky neodoberá spotrebiteľské práva, ak skutočný účel nákupu nie je podnikateľský.",
} as const;

export const TERMS_ACK_STATEMENT_VERSION = "2026.1";

export function buildTermsAckStatement(termsVersionLabel: string) {
  return `Oboznámil(a) som sa s VOP vo verzii ${termsVersionLabel} a beriem na vedomie informácie o ochrane súkromia.`;
}

export const EARLY_PERFORMANCE_STATEMENT_VERSION = "2026.1";

export const EARLY_PERFORMANCE_STATEMENT =
  "Žiadam, aby sa platená služba začala poskytovať pred uplynutím 14-dňovej lehoty na odstúpenie. Bol(a) som poučený(á), že po úplnom poskytnutí služby strácam právo na odstúpenie; ak odstúpim pred úplným poskytnutím, uhradím pomernú cenu za skutočne poskytnuté plnenie.";

export const WORKING_TERMS_VERSION_LABEL = "2026.1-pracovne";
