import { createHash, randomBytes } from "node:crypto";
import { WITHDRAWAL_WINDOW_DAYS } from "./service-duration";

export const WITHDRAWAL_STATEMENT_VERSION = "2026.1";

export const WITHDRAWAL_STATEMENT =
  "Týmto odstupujem od zmluvy uzavretej na diaľku o digitálnej službe WebPreKandidata.sk.";

export function hashWithdrawalToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createWithdrawalTokenValue() {
  return randomBytes(32).toString("base64url");
}

export function isWithinWithdrawalWindow(paidAt: string | Date, now = new Date()) {
  const start = typeof paidAt === "string" ? new Date(paidAt) : paidAt;
  if (Number.isNaN(start.getTime())) return false;
  const deadline = new Date(start);
  deadline.setUTCDate(deadline.getUTCDate() + WITHDRAWAL_WINDOW_DAYS);
  return now.getTime() <= deadline.getTime();
}

export function getRefundDeadlineAt(confirmedAt = new Date()) {
  const deadline = new Date(confirmedAt);
  deadline.setUTCDate(deadline.getUTCDate() + WITHDRAWAL_WINDOW_DAYS);
  return deadline;
}
