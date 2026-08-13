import { describe, expect, it } from "vitest";
import { buildSitePreviewData, splitHighlightedHeadline } from "../lib/site-preview-model";

describe("site preview model", () => {
  it("rozdelí zvýraznenú časť nadpisu bez duplikovania textu", () => {
    expect(splitHighlightedHeadline("Spoločne pre lepšiu Trnavu", "lepšiu Trnavu")).toEqual({
      before: "Spoločne pre ",
      highlight: "lepšiu Trnavu",
      after: "",
    });
  });

  it("vytvorí náhľad z uloženého konceptu a sanitizuje dlhé texty", () => {
    const preview = buildSitePreviewData(
      { candidateName: "Pôvodné meno", locality: "Pôvodné mesto", slug: "jana-novakova" },
      {
        content: {
          "zakladne-udaje": { name: "Jana Nováková", position: "Kandidátka na primátorku", city: "Žilina", politicalAffiliation: "SaS · KDH · Demokrati" },
          kontakt: { email: "jana@example.sk", phone: "+421 900 111 222", facebook: "javascript:alert(1)", instagram: "https://instagram.com/jana", contactFormEnabled: "false" },
          uvod: { headline: "Spoločne pre lepšiu Žilinu", highlight: "lepšiu Žilinu", subheadline: "Mesto pre všetkých." },
          "o-mne": { body: '<p onclick="alert(1)"><strong>Môj príbeh</strong><script>alert(1)</script></p>', items_count: "1", item_0_icon: "services", item_0_title: "Otvorenosť", item_0_text: "Rozhodnutia vysvetlíme." },
          program: { items_count: "1", item_0_icon: "transport", item_0_title: "Doprava", item_0_text: "Bezpečné cesty", item_0_detail: '<p><em>Konkrétny plán</em><img src="x"></p>' },
        },
        gallery: [{ altText: "Diskusia na námestí", caption: "Stretnutie s obyvateľmi", height: 900, id: "gallery-1", previewUrl: "/gallery.webp", width: 1200 }],
        media: [
          { altText: "Logo kampane", createdAt: "2026-08-11T08:00:00.000Z", height: 800, id: "logo-1", kind: "logo", previewUrl: "/logo.webp", width: 800 },
          { altText: "Portrét Jany Novákovej", createdAt: "2026-08-11T08:01:00.000Z", height: 1200, id: "hero-1", kind: "hero", previewUrl: "/hero.webp", width: 1200 },
        ],
        posts: [{
          bodyHtml: '<p onclick="alert(1)"><strong>Novinka</strong><script>alert(1)</script></p>',
          cover: null,
          excerpt: " Stretnutie s obyvateľmi. ",
          id: "post-1",
          publishedAt: "2026-08-11T10:00:00.000Z",
          title: " Nová aktualita ",
        }],
        revision: 12,
        theme: { layout: "bold", primaryColor: "#A51C48" },
      },
    );

    expect(preview.candidate).toMatchObject({ name: "Jana Nováková", city: "Žilina", initials: "JN", politicalAffiliation: "SaS · KDH · Demokrati" });
    expect(preview.hero).toMatchObject({ headlineBefore: "Spoločne pre ", highlight: "lepšiu Žilinu" });
    expect(preview.about.bodyHtml).toBe("<p><strong>Môj príbeh</strong></p>");
    expect(preview.about.signature).toBe("— Jana");
    expect(preview.about.values[0].icon).toBe("services");
    expect(preview.program.items[0].icon).toBe("transport");
    expect(preview.program.items[0].detailHtml).toBe("<p><em>Konkrétny plán</em></p>");
    expect(preview.contact.facebook).toBeUndefined();
    expect(preview.contact.instagram).toBe("https://instagram.com/jana");
    expect(preview.contact.formEnabled).toBe(false);
    expect(preview.gallery.items).toEqual([{ altText: "Diskusia na námestí", caption: "Stretnutie s obyvateľmi", height: 900, id: "gallery-1", previewUrl: "/gallery.webp", width: 1200 }]);
    expect(preview.media).toEqual({
      hero: { altText: "Portrét Jany Novákovej", url: "/hero.webp" },
      logo: { altText: "Logo kampane", url: "/logo.webp" },
    });
    expect(preview.news.items[0]).toMatchObject({
      bodyHtml: "<p><strong>Novinka</strong></p>",
      excerpt: "Stretnutie s obyvateľmi.",
      title: "Nová aktualita",
    });
    expect(preview.theme).toEqual({ color: "#A51C48", template: "bold" });
    expect(preview.revision).toBe(12);
  });

  it("pri dočasne vypnutom formulári nezobrazí hosted form ani pri starších konceptoch", () => {
    const preview = buildSitePreviewData(
      { candidateName: "Martin Novák", locality: "Trnava", slug: "martin-novak" },
      { content: { kontakt: { email: "martin@example.sk" } }, revision: 1, theme: {} },
    );

    expect(preview.contact.formEnabled).toBe(false);
    expect(preview.candidate.politicalAffiliation).toBe("");
  });
});
