import { describe, expect, it } from "vitest";
import { buildSiteSectionStatuses, deriveContentSectionStatuses } from "../lib/site-section-status";

describe("site section status", () => {
  it("rozlišuje nezačatú, rozpracovanú a dokončenú obsahovú sekciu", () => {
    const statuses = deriveContentSectionStatuses({
      "zakladne-udaje": { name: "Jana Nováková", position: "Kandidátka na starostku", city: "Pezinok" },
      kontakt: { facebook: "https://facebook.com/jana" },
      uvod: { headline: "Spolu pre Pezinok" },
    }, {});

    expect(statuses["zakladne-udaje"]).toBe("complete");
    expect(statuses.kontakt).toBe("started");
    expect(statuses.uvod).toBe("started");
    expect(statuses["o-mne"]).toBe("empty");
  });

  it("vyžaduje pri zoznamovej sekcii aspoň jednu úplnú položku", () => {
    const statuses = deriveContentSectionStatuses({
      program: {
        headline: "Môj program",
        intro: "Konkrétne kroky pre naše mesto.",
        item_0_title: "Doprava",
        item_0_text: "Bezpečnejšie ulice",
      },
    }, {});

    expect(statuses.program).toBe("complete");
    expect(statuses["preco-kandidujem"]).toBe("empty");
  });

  it("odvodí stavy špeciálnych sekcií z uložených dát projektu", () => {
    const statuses = buildSiteSectionStatuses({
      content: {},
      domainStatuses: ["active"],
      mediaKinds: ["about", "gallery"],
      planCode: "basic",
      postStatuses: ["draft"],
      seo: {},
      siteStatus: "payment_pending",
      theme: { primaryColor: "#163B65", layout: "modern" },
    });

    expect(statuses.vzhlad).toBe("complete");
    expect(statuses.obrazky).toBe("started");
    expect(statuses.galeria).toBe("complete");
    expect(statuses.aktuality).toBe("started");
    expect(statuses.domena).toBe("complete");
    expect(statuses.objednavky).toBe("complete");
    expect(statuses.publikovanie).toBe("started");
    expect(statuses).not.toHaveProperty("udaje-zverejnenia");
  });

  it("oddelí stav objednávky od publikovania", () => {
    const statuses = buildSiteSectionStatuses({
      content: {},
      orderStatuses: ["pending"],
      planCode: null,
      seo: {},
      siteStatus: "draft",
      theme: {},
    });

    expect(statuses.objednavky).toBe("started");
    expect(statuses.publikovanie).toBe("empty");
  });
});
