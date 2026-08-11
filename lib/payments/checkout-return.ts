export type CheckoutReturnNotice = {
  kind: "success_pending" | "cancelled";
  message: string;
};

export function parseCheckoutReturnState(input: {
  checkout?: string | string[] | undefined;
  entitled: boolean;
}): CheckoutReturnNotice | null {
  const checkout = Array.isArray(input.checkout) ? input.checkout[0] : input.checkout;
  if (checkout === "success") {
    if (input.entitled) {
      return {
        kind: "success_pending",
        message: "Platba prebehla. Balík je aktívny — môžete pokračovať k zverejneniu.",
      };
    }
    return {
      kind: "success_pending",
      message: "Platba prebehla. Aktivácia balíka môže trvať niekoľko sekúnd — obnovte stránku.",
    };
  }
  if (checkout === "cancelled") {
    return {
      kind: "cancelled",
      message: "Platba bola zrušená. Objednávku môžete spustiť znova.",
    };
  }
  return null;
}
