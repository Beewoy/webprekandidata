import { afterEach, describe, expect, it } from "vitest";
import {
  clearDraftSaveCooldown,
  draftConflictKey,
  DRAFT_CONFLICT_COOLDOWN_MS,
  isDraftSaveCoolingDown,
  markDraftRevisionConflict,
  parseRevisionConflictDetail,
  resetDraftSaveCooldowns,
} from "../lib/draft-save-guard";

describe("draft-save-guard", () => {
  afterEach(() => {
    resetDraftSaveCooldowns();
  });

  it("označí cooldown po revision_conflict pre site+user", () => {
    const key = draftConflictKey("site-1", "user-1");
    const now = 1_000_000;
    expect(isDraftSaveCoolingDown(key, now)).toBe(false);

    markDraftRevisionConflict(key, now, 5_000);
    expect(isDraftSaveCoolingDown(key, now + 1)).toBe(true);
    expect(isDraftSaveCoolingDown(key, now + DRAFT_CONFLICT_COOLDOWN_MS)).toBe(false);
  });

  it("izoluje cooldown podľa používateľa a projektu", () => {
    markDraftRevisionConflict(draftConflictKey("site-1", "user-a"), 1000, 5000);
    expect(isDraftSaveCoolingDown(draftConflictKey("site-1", "user-b"), 1001)).toBe(false);
    expect(isDraftSaveCoolingDown(draftConflictKey("site-2", "user-a"), 1001)).toBe(false);
  });

  it("umožní manuálne zrušiť cooldown", () => {
    const key = draftConflictKey("site-1", "user-1");
    markDraftRevisionConflict(key, 1000, 5000);
    clearDraftSaveCooldown(key);
    expect(isDraftSaveCoolingDown(key, 1001)).toBe(false);
  });

  it("parsuje DETAIL s aktuálnou revíziou", () => {
    expect(parseRevisionConflictDetail("12")).toBe(12);
    expect(parseRevisionConflictDetail(" 7 ")).toBe(7);
    expect(parseRevisionConflictDetail("0")).toBeUndefined();
    expect(parseRevisionConflictDetail("abc")).toBeUndefined();
    expect(parseRevisionConflictDetail(null)).toBeUndefined();
  });
});
