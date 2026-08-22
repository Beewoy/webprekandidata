import { describe, expect, it } from "vitest";
import { resolvePublicationSeo } from "../lib/public-site-seo";

describe("resolvePublicationSeo", () => {
  it("reads editor field names from published snapshots", () => {
    const result = resolvePublicationSeo({
      seoDescription: "Som verný Skaličan a kandidát na primátora mesta Skalica.",
      seoTitle: "Ivan Tychler – kandidát na primátora Skalice",
    }, "Ing. Tibor Antal");

    expect(result.title).toBe("Ivan Tychler – kandidát na primátora Skalice");
    expect(result.description).toBe("Som verný Skaličan a kandidát na primátora mesta Skalica.");
  });

  it("falls back to legacy title and description keys", () => {
    const result = resolvePublicationSeo({
      description: "Legacy popis",
      title: "Legacy titulok",
    }, "Ján Kandidát");

    expect(result.title).toBe("Legacy titulok");
    expect(result.description).toBe("Legacy popis");
  });

  it("uses candidate name when SEO fields are missing", () => {
    const result = resolvePublicationSeo({}, "Ján Kandidát");

    expect(result.title).toBe("Ján Kandidát – kandidát");
    expect(result.description).toBe("Oficiálna stránka kandidáta Ján Kandidát.");
  });
});
