/** In-process cooldown after draft revision conflicts to blunt retry storms. */

export const DRAFT_CONFLICT_COOLDOWN_MS = 5_000;

const conflictUntilByKey = new Map<string, number>();

export function draftConflictKey(siteId: string, userId: string) {
  return `${userId}:${siteId}`;
}

export function isDraftSaveCoolingDown(key: string, now = Date.now()) {
  const until = conflictUntilByKey.get(key);
  if (until == null) return false;
  if (until <= now) {
    conflictUntilByKey.delete(key);
    return false;
  }
  return true;
}

export function markDraftRevisionConflict(key: string, now = Date.now(), cooldownMs = DRAFT_CONFLICT_COOLDOWN_MS) {
  conflictUntilByKey.set(key, now + cooldownMs);
}

export function clearDraftSaveCooldown(key: string) {
  conflictUntilByKey.delete(key);
}

/** Test helper — clears all cooldown entries. */
export function resetDraftSaveCooldowns() {
  conflictUntilByKey.clear();
}

export function parseRevisionConflictDetail(details: string | null | undefined): number | undefined {
  if (!details) return undefined;
  const match = details.trim().match(/^\d+$/);
  if (!match) return undefined;
  const revision = Number(match[0]);
  return Number.isSafeInteger(revision) && revision > 0 ? revision : undefined;
}
