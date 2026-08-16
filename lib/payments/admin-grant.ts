/** Detects orders created by RPC admin_grant_site_plan (buyer_snapshot.source). */

export const ADMIN_GRANT_STATUS_LABEL = "Pridelené administrátorom";
export const ADMIN_GRANT_STATUS_LABEL_SHORT = "Pridelené adminom";
export const ADMIN_GRANT_PRICE_LABEL = "0 €";
export const ADMIN_GRANT_NOTE =
  "Balík bol priradený administrátorom. Platba neprebehla.";

export function isAdminGrantedOrder(buyerSnapshot: unknown): boolean {
  if (!buyerSnapshot || typeof buyerSnapshot !== "object" || Array.isArray(buyerSnapshot)) {
    return false;
  }
  return (buyerSnapshot as { source?: unknown }).source === "admin_grant";
}
