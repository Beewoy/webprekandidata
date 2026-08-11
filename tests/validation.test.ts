import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, updatePasswordSchema } from "../lib/validation/auth";
import {
  contactSubmissionSchema,
  createSiteSchema,
  registerGalleryAssetSchema,
  reorderGalleryAssetsSchema,
  saveSectionSchema,
  saveThemeSchema,
  updateGalleryAssetSchema,
} from "../lib/validation/site";

describe("auth validation", () => {
  it("odmietne neplatný e-mail", () => {
    expect(loginSchema.safeParse({ email: "zly-email", password: "heslo" }).success).toBe(false);
  });

  it("vyžaduje zhodné heslá", () => {
    const result = registerSchema.safeParse({
      fullName: "Martin Novák",
      email: "martin@example.sk",
      password: "bezpecne-heslo",
      passwordConfirmation: "ine-heslo",
    });
    expect(result.success).toBe(false);
  });

  it("prijme bezpečné nové heslo", () => {
    expect(updatePasswordSchema.safeParse({ password: "nove-bezpecne-heslo", passwordConfirmation: "nove-bezpecne-heslo" }).success).toBe(true);
  });
});

describe("site validation", () => {
  it("prijme kompletné údaje nového projektu", () => {
    expect(createSiteSchema.safeParse({
      internalName: "Komunálne voľby 2026",
      candidateName: "Martin Novák",
      locality: "Trnava",
      position: "Kandidát na primátora",
    }).success).toBe(true);
  });

  it("nepovolí neznámu sekciu autosave", () => {
    expect(saveSectionSchema.safeParse({
      siteId: "demo",
      sectionSlug: "tajna-sekcia",
      revision: 1,
      values: {},
    }).success).toBe(false);
  });

  it("prijme platnú tému webu", () => {
    expect(saveThemeSchema.safeParse({
      siteId: "demo",
      revision: 3,
      theme: { color: "#A51C48", template: "classic" },
    }).success).toBe(true);
  });

  it("odmietne neznámu šablónu alebo neplatnú farbu", () => {
    expect(saveThemeSchema.safeParse({
      siteId: "demo",
      revision: 3,
      theme: { color: "red", template: "stranicka" },
    }).success).toBe(false);
  });

  it("prijme kontaktnú správu bez telefónu", () => {
    expect(contactSubmissionSchema.safeParse({
      email: "obyvatel@example.sk",
      message: "Chcel by som sa opýtať na váš program.",
      name: "Ján Volič",
      phone: "",
      website: "",
    }).success).toBe(true);
  });

  it("odmietne neplatný e-mail, telefón a príliš krátky popis", () => {
    expect(contactSubmissionSchema.safeParse({
      email: "zly-email",
      message: "Krátke",
      name: "Ján Volič",
      phone: "telefon?",
      website: "",
    }).success).toBe(false);
  });

  it("prijme metadata fotografie galérie a obmedzí titulok", () => {
    const siteId = "11111111-1111-4111-8111-111111111111";
    const assetId = "22222222-2222-4222-8222-222222222222";
    expect(registerGalleryAssetSchema.safeParse({
      assetId,
      caption: "Stretnutie s obyvateľmi",
      height: 1080,
      siteId,
      storagePath: `${siteId}/${assetId}/gallery.webp`,
      width: 1440,
    }).success).toBe(true);
    expect(updateGalleryAssetSchema.safeParse({ assetId, caption: "x".repeat(161), siteId }).success).toBe(false);
  });

  it("nepovolí duplicitné alebo príliš dlhé poradie galérie", () => {
    const siteId = "11111111-1111-4111-8111-111111111111";
    const assetId = "22222222-2222-4222-8222-222222222222";
    expect(reorderGalleryAssetsSchema.safeParse({ assetIds: [assetId, assetId], siteId }).success).toBe(false);
    expect(reorderGalleryAssetsSchema.safeParse({
      assetIds: Array.from({ length: 13 }, (_, index) => `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`),
      siteId,
    }).success).toBe(false);
  });
});

describe("admin validation", () => {
  it("vyžaduje dôvod a správu pri pozastavení", async () => {
    const { adminSiteHoldSchema } = await import("../lib/validation/admin");
    expect(adminSiteHoldSchema.safeParse({
      siteId: "00000000-0000-4000-8000-000000000001",
      hold: true,
      reason: "krátky",
      category: "terms_violation",
      scope: "whole_site",
      durationDays: 14,
      candidateMessage: "Správa pre kandidáta o pozastavení webu.",
    }).success).toBe(false);

    expect(adminSiteHoldSchema.safeParse({
      siteId: "00000000-0000-4000-8000-000000000001",
      hold: true,
      reason: "Opakované porušenie podmienok používania.",
      category: "terms_violation",
      scope: "whole_site",
      durationDays: 14,
      candidateMessage: "Správa pre kandidáta o pozastavení webu.",
    }).success).toBe(true);
  });

  it("pri uvoľnení nevyžaduje trvanie", async () => {
    const { adminSiteHoldSchema } = await import("../lib/validation/admin");
    expect(adminSiteHoldSchema.safeParse({
      siteId: "00000000-0000-4000-8000-000000000001",
      hold: false,
      reason: "Náprava bola overená a hold sa uvoľňuje.",
      category: "other",
      scope: "whole_site",
      durationDays: null,
      candidateMessage: "Administrátorské pozastavenie bolo uvoľnené.",
    }).success).toBe(true);
  });

  it("prijme udelenie Basic alebo Plus s dôvodom", async () => {
    const { adminGrantPlanSchema } = await import("../lib/validation/admin");
    expect(adminGrantPlanSchema.safeParse({
      siteId: "00000000-0000-4000-8000-000000000001",
      planCode: "plus",
      reason: "Pilotný účet pre interný test.",
    }).success).toBe(true);
    expect(adminGrantPlanSchema.safeParse({
      siteId: "00000000-0000-4000-8000-000000000001",
      planCode: "free",
      reason: "Pilotný účet pre interný test.",
    }).success).toBe(false);
  });
});
