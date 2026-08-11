import { describe, expect, it } from "vitest";
import { readPostBodyHtml, slugifyPostTitle } from "../lib/posts";
import { generateArticleSchema, savePostSchema } from "../lib/validation/posts";

const siteId = "11111111-1111-4111-8111-111111111111";
const postId = "22222222-2222-4222-8222-222222222222";

describe("articles", () => {
  it("vytvorí stabilný interný identifikátor aj zo slovenského nadpisu", () => {
    expect(slugifyPostTitle("Stretnutie s občanmi v Žiline")).toBe("stretnutie-s-obcanmi-v-ziline");
  });

  it("číta HTML iba z očakávaného objektu tela", () => {
    expect(readPostBodyHtml({ html: "<p>Aktualita</p>" })).toBe("<p>Aktualita</p>");
    expect(readPostBodyHtml("<p>Neplatné</p>")).toBe("");
  });

  it("prijme manuálne vytvorený koncept bez verejnej URL článku", () => {
    expect(savePostSchema.safeParse({
      bodyHtml: "<p>Obsah článku</p>",
      excerpt: "Krátke zhrnutie",
      postId,
      revision: 1,
      seoDescription: "",
      seoTitle: "",
      siteId,
      slug: "interny-identifikator",
      status: "draft",
      title: "Nová aktualita",
    }).success).toBe(true);
  });

  it("odmietne príliš krátke AI podklady a príliš dlhý obsah", () => {
    expect(generateArticleSchema.safeParse({ brief: "Málo", postId, siteId, tone: "informative" }).success).toBe(false);
    expect(savePostSchema.safeParse({
      bodyHtml: "x".repeat(20_001),
      excerpt: "",
      postId,
      revision: 1,
      seoDescription: "",
      seoTitle: "",
      siteId,
      slug: "dlhy-clanok",
      status: "draft",
      title: "Dlhý článok",
    }).success).toBe(false);
  });
});
