import { describe, expect, it } from "vitest";
import { contactRateLimit, getPublicationContactSettings } from "../lib/contact-form";

describe("contact form publication settings", () => {
  it("načíta cieľový e-mail a zapnutý formulár z publikovaného obsahu", () => {
    expect(getPublicationContactSettings({
      kontakt: { email: " kandidat@example.sk ", contactFormEnabled: "true" },
    })).toEqual({ email: "kandidat@example.sk", enabled: true });
  });

  it("rešpektuje vypnutie uložené ako reťazec alebo boolean", () => {
    expect(getPublicationContactSettings({ kontakt: { email: "a@example.sk", contactFormEnabled: "false" } }).enabled).toBe(false);
    expect(getPublicationContactSettings({ kontakt: { email: "a@example.sk", contactFormEnabled: false } }).enabled).toBe(false);
  });

  it("zachová formulár zapnutý pre staršie snapshoty bez prepínača", () => {
    expect(getPublicationContactSettings({ kontakt: { email: "a@example.sk" } }).enabled).toBe(true);
    expect(contactRateLimit).toEqual({ maximumSubmissions: 3, windowMinutes: 15 });
  });
});
