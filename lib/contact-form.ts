/**
 * Temporary launch choice: hosted contact form is off until DPA/privacy config ships.
 * Flip to true to restore the in-app form + Brevo delivery pipeline.
 */
export const HOSTED_CONTACT_FORM_ENABLED = false;

export const contactRateLimit = {
  maximumSubmissions: 3,
  windowMinutes: 15,
} as const;

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function getPublicationContactSettings(content: unknown) {
  const contact = objectValue(objectValue(content).kontakt);
  const enabledValue = contact.contactFormEnabled;
  const requested = enabledValue !== false && enabledValue !== "false";
  return {
    email: typeof contact.email === "string" ? contact.email.trim() : "",
    enabled: HOSTED_CONTACT_FORM_ENABLED && requested,
  };
}
