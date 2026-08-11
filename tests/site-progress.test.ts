import { describe, expect, it } from "vitest";
import { calculateProgress, getProgressLabel } from "../lib/site-progress";

describe("site progress", () => {
  it("počíta dokončené a rozpracované sekcie", () => {
    expect(calculateProgress(["complete", "started", "empty", "complete"])).toBe(63);
  });

  it("vráti nulu pre prázdny zoznam", () => {
    expect(calculateProgress([])).toBe(0);
  });

  it("pomenuje hotový web", () => {
    expect(getProgressLabel(100)).toBe("Pripravené na publikovanie");
  });
});
