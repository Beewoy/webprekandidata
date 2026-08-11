import { describe, expect, it } from "vitest";

import { campaignTemplates, defaultCampaignTheme, isCampaignTemplateId } from "../lib/site-theme";

describe("campaign template identifiers", () => {
  it("keeps the persisted template IDs mapped to their public names", () => {
    expect(campaignTemplates.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: "modern", name: "Horizont" },
      { id: "bold", name: "Impulz" },
      { id: "classic", name: "Dôvera" },
    ]);
  });

  it("uses a supported stable ID as the default", () => {
    expect(defaultCampaignTheme.template).toBe("modern");
    expect(campaignTemplates.map((template) => template.id)).toContain(defaultCampaignTheme.template);
  });

  it("rejects presentation labels and unknown snapshot values", () => {
    expect(isCampaignTemplateId("modern")).toBe(true);
    expect(isCampaignTemplateId("Horizont")).toBe(false);
    expect(isCampaignTemplateId("editorial")).toBe(false);
  });
});
