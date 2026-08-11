import { describe, expect, it } from "vitest";
import { getDaysUntilElection } from "../lib/marketing/election-countdown";

describe("homepage election countdown", () => {
  it("počíta celé kalendárne dni v slovenskom časovom pásme", () => {
    expect(getDaysUntilElection(new Date("2026-08-11T14:00:00.000Z"))).toBe(74);
    expect(getDaysUntilElection(new Date("2026-10-23T12:00:00.000Z"))).toBe(1);
  });

  it("v deň volieb vráti nulu", () => {
    expect(getDaysUntilElection(new Date("2026-10-24T10:00:00.000Z"))).toBe(0);
  });

  it("po voľbách countdown skryje", () => {
    expect(getDaysUntilElection(new Date("2026-10-25T10:00:00.000Z"))).toBeNull();
  });

  it("rešpektuje polnoc v časovom pásme Europe/Bratislava", () => {
    expect(getDaysUntilElection(new Date("2026-10-23T22:30:00.000Z"))).toBe(0);
  });
});
