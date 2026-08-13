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
 * No admin bypass. Later phases append blockers for DPA, political ads, repository.
 */
export function evaluateLegalLaunchGate(options?: {
  /** When true, require LEGAL_DOCUMENTS_APPROVED (checkout / public publish). */
  requireDocumentsApproved?: boolean;
  /** Phase 5: require political-ad repository adapter. Default false until wired. */
  requirePoliticalRepository?: boolean;
}): LegalLaunchGateResult {
  const blockers: LegalLaunchBlocker[] = [];
  const requireDocumentsApproved = options?.requireDocumentsApproved !== false;
  const requirePoliticalRepository =
    options?.requirePoliticalRepository
    ?? envFlag("POLITICAL_REPOSITORY_ENFORCEMENT");

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

  if (requirePoliticalRepository && !envFlag("EU_POLITICAL_AD_REPOSITORY_READY")) {
    blockers.push({
      code: "political_repository_unavailable",
      message: "EU political advertising repository production adapter is not ready",
      requirementId: "LB-06",
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
