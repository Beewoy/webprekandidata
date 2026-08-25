import { describe, expect, it } from "vitest";
import { sanitizeRichText, sanitizeSectionRichText } from "../lib/rich-text";

describe("rich text", () => {
  it("zachová povolené formátovanie a odstráni nebezpečný obsah", () => {
    expect(sanitizeRichText('<h3 onclick="alert(1)">Nadpis</h3><p><strong>Text</strong><script>alert(1)</script></p>'))
      .toBe("<h3>Nadpis</h3><p><strong>Text</strong></p>");
  });

  it("zachová bezpečné odkazy a odstráni nebezpečné schémy", () => {
    expect(
      sanitizeRichText(
        '<p><a href="https://www.facebook.com/events/1" onclick="alert(1)">Event</a><a href="javascript:alert(1)">X</a></p>',
      ),
    ).toBe('<p><a href="https://www.facebook.com/events/1" rel="noopener noreferrer" target="_blank">Event</a>X</p>');
  });

  it("sanitizuje iba polia označené ako formátovaný text", () => {
    expect(sanitizeSectionRichText("o-mne", {
      body: '<p onmouseover="alert(1)">Bezpečný text</p>',
      headline: "Nadpis <ostáva ako obyčajný text>",
    })).toEqual({
      body: "<p>Bezpečný text</p>",
      headline: "Nadpis <ostáva ako obyčajný text>",
    });
  });

  it("sanitizuje dlhé popisy bodov programu", () => {
    expect(sanitizeSectionRichText("program", {
      item_0_title: "Doprava",
      item_0_detail: '<p><em>Bezpečný text</em><img src="x" onerror="alert(1)"></p>',
    })).toEqual({
      item_0_title: "Doprava",
      item_0_detail: "<p><em>Bezpečný text</em></p>",
    });
  });
});
