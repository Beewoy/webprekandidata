import { normalizeCivicIcon, type CivicIconName } from "./civic-icons";

export type RepeatableItem = {
  detail?: string;
  id: string;
  icon: CivicIconName;
  title: string;
  text: string;
};

type RepeatableDefaults = Array<{ detail?: string; icon?: CivicIconName; title: string; text: string }>;

export function buildRepeatableItems(
  defaults: RepeatableDefaults,
  initialValues: Record<string, string>,
): RepeatableItem[] {
  const storedCount = Number(initialValues.items_count);
  const hasStoredCount = Number.isInteger(storedCount) && storedCount >= 0;
  const storedIndexes = Object.keys(initialValues)
    .map((key) => /^item_(\d+)_(?:title|text|detail|icon)$/.exec(key)?.[1])
    .filter((index): index is string => index !== undefined)
    .map(Number);
  const inferredCount = storedIndexes.length ? Math.max(...storedIndexes) + 1 : 0;
  const count = hasStoredCount ? storedCount : Math.max(defaults.length, inferredCount);

  return Array.from({ length: count }, (_, index) => ({
    detail: initialValues[`item_${index}_detail`] ?? defaults[index]?.detail,
    id: `initial-${index}`,
    icon: normalizeCivicIcon(initialValues[`item_${index}_icon`], defaults[index]?.icon),
    title: initialValues[`item_${index}_title`] ?? defaults[index]?.title ?? "",
    text: initialValues[`item_${index}_text`] ?? defaults[index]?.text ?? "",
  }));
}

export function moveRepeatableItem(items: RepeatableItem[], itemId: string, targetIndex: number) {
  const currentIndex = items.findIndex((item) => item.id === itemId);
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= items.length || currentIndex === targetIndex) return items;

  const next = [...items];
  const [item] = next.splice(currentIndex, 1);
  next.splice(targetIndex, 0, item);
  return next;
}

export function serializeRepeatableItems(items: RepeatableItem[]): Record<string, string> {
  const values: Record<string, string> = { items_count: String(items.length) };

  items.forEach((item, index) => {
    values[`item_${index}_title`] = item.title;
    values[`item_${index}_text`] = item.text;
    values[`item_${index}_icon`] = item.icon;
    if (typeof item.detail === "string") values[`item_${index}_detail`] = item.detail;
  });

  return values;
}
