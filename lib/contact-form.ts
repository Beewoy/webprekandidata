export const contactRateLimit = {
  maximumSubmissions: 3,
  windowMinutes: 15,
} as const;

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function getPublicationContactSettings(content: unknown) {
  const contact = objectValue(objectValue(content).kontakt);
  const enabledValue = contact.contactFormEnabled;
  return {
    email: typeof contact.email === "string" ? contact.email.trim() : "",
    enabled: enabledValue !== false && enabledValue !== "false",
  };
}
