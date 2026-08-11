import { describe, expect, it } from "vitest";
import { mergeStoredDraftValues } from "../lib/site-draft-values";

describe("site draft values", () => {
  it("načíta pevné aj dynamické polia opakovateľných položiek", () => {
    const values = mergeStoredDraftValues(
      { heading: "Predvolený nadpis" },
      {
        heading: "Uložený nadpis",
        items_count: "4",
        item_3_title: "Nová hodnota",
        item_3_text: "Text novej hodnoty",
        ignored_object: { unsafe: true },
      },
    );

    expect(values).toEqual({
      heading: "Uložený nadpis",
      items_count: "4",
      item_3_title: "Nová hodnota",
      item_3_text: "Text novej hodnoty",
    });
  });
});
