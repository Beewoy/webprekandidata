import { describe, expect, it } from "vitest";
import { mediaSlots } from "../lib/site-media";

describe("site media slots", () => {
  it("exports the hero portrait as a square for the circular template frame", () => {
    const heroSlot = mediaSlots.find((slot) => slot.kind === "hero");

    expect(heroSlot).toMatchObject({ aspect: 1, height: 1200, width: 1200 });
  });

  it("does not offer a party logo media slot", () => {
    expect(mediaSlots.some((slot) => (slot.kind as string) === "party_logo")).toBe(false);
  });
});
