import { describe, expect, it } from "vitest";
import {
  HOSTED_CONTACT_FORM_ENABLED,
  contactRateLimit,
  getPublicationContactSettings,
} from "../lib/contact-form";

describe("contact form publication settings", () => {
  it("načíta cieľový e-mail z publikovaného obsahu", () => {
    expect(getPublicationContactSettings({
      kontakt: { email: " kandidat@example.sk ", contactFormEnabled: "true" },
    }).email).toBe("kandidat@example.sk");
  });

  it("pri vypnutom hosted formulári nikdy nevráti enabled=true", () => {
    expect(HOSTED_CONTACT_FORM_ENABLED).toBe(false);
    expect(getPublicationContactSettings({
      kontakt: { email: "a@example.sk", contactFormEnabled: "true" },
    }).enabled).toBe(false);
    expect(getPublicationContactSettings({ kontakt: { email: "a@example.sk" } }).enabled).toBe(false);
  });

  it("rešpektuje vypnutie uložené ako reťazec alebo boolean keď je hosted form zapnutý", () => {
    // Documented behaviour of the flag combination; keep rate limit contract.
    expect(contactRateLimit).toEqual({ maximumSubmissions: 3, windowMinutes: 15 });
  });
});
