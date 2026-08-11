import { describe, expect, it } from "vitest";
import { createWelcomeSiteSchema, welcomeSuggestionSchema, welcomeSummarySchema } from "../lib/validation/onboarding";

const completeSuggestion = {
  internalName: "Komunálne voľby 2026",
  candidateName: "Jana Nováková",
  locality: "Trnava",
  position: "Kandidátka na primátorku",
  heroHeadline: "Spoločne pre lepšie mesto",
  heroSubheadline: "Otvorene a s konkrétnym plánom.",
  aboutBody: "V Trnave žijem a pracujem viac ako desať rokov.",
  motivation: "Chcem zlepšiť komunikáciu mesta s obyvateľmi.",
  priorities: [{ title: "Doprava", text: "Bezpečnejšie ulice a lepšie spojenia." }],
};

describe("welcome onboarding validation", () => {
  it("vyžaduje dostatočne informatívne predstavenie", () => {
    expect(welcomeSummarySchema.safeParse({ summary: "Som kandidát." }).success).toBe(false);
    expect(welcomeSummarySchema.safeParse({ summary: "Kandidujem v Trnave a venujem sa verejnému priestoru a bezpečnej doprave." }).success).toBe(true);
  });

  it("dovolí AI nechať neznáme základné údaje prázdne", () => {
    expect(welcomeSuggestionSchema.safeParse({
      ...completeSuggestion,
      locality: "",
      position: "",
    }).success).toBe(true);
  });

  it("pred vytvorením webu vyžaduje doplnené základné údaje", () => {
    const input = {
      summary: "Kandidujem v Trnave a venujem sa verejnému priestoru a bezpečnej doprave.",
      suggestion: { ...completeSuggestion, locality: "" },
    };
    expect(createWelcomeSiteSchema.safeParse(input).success).toBe(false);
    expect(createWelcomeSiteSchema.safeParse({ ...input, suggestion: completeSuggestion }).success).toBe(true);
  });
});

