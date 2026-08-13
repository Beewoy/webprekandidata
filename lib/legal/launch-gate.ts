import { isSellerIdentityComplete, getSellerIdentityIssues } from "./seller";

export type LegalLaunchBlocker = {
  code: string;
  message: string;
  requirementId?: string;
};

export type LegalLaunchGateResult = {
  ok: boolean;
  blockers: LegalLaunchBlocker[];
};

function envFlag(name: string) {
  return process.env[name] === "true";
}

/**
 * Central production publish / paid-checkout readiness check.
 * No admin bypass.
 */
export function evaluateLegalLaunchGate(options?: {
  /** When true, require LEGAL_DOCUMENTS_APPROVED (checkout / public publish). */
  requireDocumentsApproved?: boolean;
}): LegalLaunchGateResult {
  const blockers: LegalLaunchBlocker[] = [];
  const requireDocumentsApproved = options?.requireDocumentsApproved !== false;

  if (!isSellerIdentityComplete()) {
    for (const issue of getSellerIdentityIssues()) {
      blockers.push({
        code: "seller_identity_incomplete",
        message: issue,
        requirementId: "LB-01",
      });
    }
  }

  if (requireDocumentsApproved && !envFlag("LEGAL_DOCUMENTS_APPROVED")) {
    blockers.push({
      code: "legal_documents_not_approved",
      message: "LEGAL_DOCUMENTS_APPROVED must be true before paid checkout and public publish",
      requirementId: "LB-09",
    });
  }

  return { ok: blockers.length === 0, blockers };
}

export function formatLegalLaunchGateMessage(result: LegalLaunchGateResult) {
  if (result.ok) return null;
  return [
    "Publikovanie alebo checkout je zablokované:",
    ...result.blockers.map((blocker) => `- ${blocker.message}`),
  ].join("\n");
}
