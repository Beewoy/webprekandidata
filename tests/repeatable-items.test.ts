import { describe, expect, it } from "vitest";
import { buildRepeatableItems, moveRepeatableItem, serializeRepeatableItems } from "../lib/repeatable-items";

const defaults = [
  { icon: "safety" as const, title: "Prvá", text: "A" },
  { icon: "families" as const, title: "Druhá", text: "B" },
  { icon: "trees" as const, title: "Tretia", text: "C" },
];

describe("repeatable items", () => {
  it("načíta uložený počet a hodnoty", () => {
    const items = buildRepeatableItems(defaults, {
      items_count: "2",
      item_0_title: "Vlastná prvá",
      item_0_text: "Text",
      item_0_icon: "transport",
      item_1_title: "Vlastná druhá",
      item_1_text: "Text 2",
    });

    expect(items).toHaveLength(2);
    expect(items.map((item) => item.title)).toEqual(["Vlastná prvá", "Vlastná druhá"]);
    expect(items.map((item) => item.icon)).toEqual(["transport", "families"]);
  });

  it("zachová staršie dáta bez items_count", () => {
    const items = buildRepeatableItems(defaults, { item_3_title: "Štvrtá", item_3_text: "D" });
    expect(items).toHaveLength(4);
    expect(items[3].title).toBe("Štvrtá");
  });

  it("presunie položku bez zmeny jej identity", () => {
    const items = buildRepeatableItems(defaults, {});
    const moved = moveRepeatableItem(items, "initial-2", 0);
    expect(moved.map((item) => item.id)).toEqual(["initial-2", "initial-0", "initial-1"]);
  });

  it("uloží aktuálny počet, poradie a texty položiek", () => {
    const items = moveRepeatableItem(buildRepeatableItems(defaults, {}), "initial-2", 0).slice(0, 2);

    expect(serializeRepeatableItems(items)).toEqual({
      items_count: "2",
      item_0_icon: "trees",
      item_0_title: "Tretia",
      item_0_text: "C",
      item_1_icon: "safety",
      item_1_title: "Prvá",
      item_1_text: "A",
    });
  });

  it("nahradí neznámu ikonku bezpečnou predvolenou hodnotou", () => {
    const items = buildRepeatableItems(defaults, { items_count: "1", item_0_icon: "political-party-logo" });
    expect(items[0].icon).toBe("safety");
  });

  it("zachová dlhý popis pri presunutí bodu programu", () => {
    const items = buildRepeatableItems(
      [{ ...defaults[0], detail: "" }, { ...defaults[1], detail: "" }],
      { items_count: "2", item_0_detail: "<p>Prvý detail</p>", item_1_detail: "<p>Druhý detail</p>" },
    );
    const moved = moveRepeatableItem(items, "initial-1", 0);

    expect(serializeRepeatableItems(moved)).toMatchObject({
      item_0_title: "Druhá",
      item_0_detail: "<p>Druhý detail</p>",
      item_1_title: "Prvá",
      item_1_detail: "<p>Prvý detail</p>",
    });
  });
});
