export function mergeStoredDraftValues(
  defaults: Record<string, string>,
  storedValues: Record<string, unknown>,
): Record<string, string> {
  const values = { ...defaults };

  for (const [key, value] of Object.entries(storedValues)) {
    if (typeof value === "string") values[key] = value;
  }

  return values;
}
