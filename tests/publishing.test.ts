import { describe, expect, it } from "vitest";
import { buildPublicationFingerprint, getPublishReadiness, parsePublicationMedia, parsePublicationPosts } from "../lib/publishing";

const completeContent = {
  "zakladne-udaje": { name: "Ján Kandidát", position: "Kandidát na primátora", city: "Trnava" },
  kontakt: { email: "jan@example.sk", contactFormEnabled: "true" },
  uvod: { headline: "Spoločne pre mesto", subheadline: "Konkrétne riešenia pre všetkých." },
  "o-mne": { headline: "O mne", body: "Dlhší text o kandidátovi." },
  "preco-kandidujem": { headline: "Prečo", intro: "Moja motivácia", item_0_title: "Otvorenosť", item_0_text: "Rozhodnutia budú zrozumiteľné." },
  program: { headline: "Program", intro: "Naše priority", item_0_title: "Doprava", item_0_text: "Bezpečnejšie ulice." },
};

describe("publish readiness", () => {
  it("allows complete content and keeps optional recommendations separate", () => {
    const result = getPublishReadiness({ content: completeContent, mediaKinds: [], seo: {} });
    expect(result.ready).toBe(true);
    expect(result.blockers).toHaveLength(0);
    expect(result.warnings.map((warning) => warning.section)).toEqual(["seo", "obrazky"]);
  });

  it("blocks incomplete program and an invalid contact email", () => {
    const result = getPublishReadiness({
      content: { ...completeContent, kontakt: { email: "zly-email", contactFormEnabled: "true" }, program: { headline: "Program" } },
      seo: {},
    });
    expect(result.ready).toBe(false);
    expect(result.blockers.map((issue) => issue.section)).toEqual(["program", "kontakt"]);
  });

  it("requires a valid email for mailto contact even when the form toggle is off", () => {
    const result = getPublishReadiness({ content: { ...completeContent, kontakt: { contactFormEnabled: "false" } }, seo: {} });
    expect(result.ready).toBe(false);
    expect(result.blockers.map((issue) => issue.section)).toEqual(["kontakt"]);
  });
});

describe("publication snapshots", () => {
  it("creates the same fingerprint regardless of object key order", () => {
    expect(buildPublicationFingerprint({ a: 1, nested: { b: 2, c: 3 } }))
      .toBe(buildPublicationFingerprint({ nested: { c: 3, b: 2 }, a: 1 }));
  });

  it("rejects malformed media and posts", () => {
    expect(parsePublicationMedia([{ kind: "script", storagePath: "x" }])).toEqual([]);
    expect(parsePublicationPosts([{ title: "Bez zvyšku dát" }])).toEqual([]);
  });

  it("accepts PostgreSQL timestamps with a UTC offset in published posts", () => {
    const post = {
      bodyHtml: "<p>Obsah článku</p>",
      coverAssetId: null,
      excerpt: "Krátky popis",
      id: "d1579332-16cb-4ad7-9844-29648ad40035",
      publishedAt: "2026-08-11T10:16:39.427+00:00",
      title: "Novinka z kampane",
    };

    expect(parsePublicationPosts([post])).toEqual([post]);
  });
});
