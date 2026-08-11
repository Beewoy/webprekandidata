import { z } from "zod";

const uuidOrDemo = z.union([z.literal("demo"), z.string().uuid()]);

export const createPostSchema = z.object({ siteId: uuidOrDemo });

export const savePostSchema = z.object({
  bodyHtml: z.string().max(20000, "Text článku je príliš dlhý."),
  excerpt: z.string().trim().max(320, "Krátky popis môže mať najviac 320 znakov."),
  postId: z.union([z.literal("demo-post"), z.string().uuid()]),
  revision: z.number().int().positive(),
  seoDescription: z.string().trim().max(170, "SEO popis môže mať najviac 170 znakov."),
  seoTitle: z.string().trim().max(70, "SEO titulok môže mať najviac 70 znakov."),
  siteId: uuidOrDemo,
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Adresa môže obsahovať iba malé písmená, čísla a pomlčky."),
  status: z.enum(["draft", "published", "archived"]),
  title: z.string().trim().min(1, "Zadajte nadpis článku.").max(140, "Nadpis môže mať najviac 140 znakov."),
});

export const deletePostSchema = z.object({
  postId: z.union([z.literal("demo-post"), z.string().uuid()]),
  siteId: uuidOrDemo,
});

export const generateArticleSchema = z.object({
  brief: z.string().trim().min(30, "Napíšte aspoň 30 znakov podkladov.").max(5000, "Podklady môžu mať najviac 5 000 znakov."),
  postId: z.string().uuid(),
  siteId: z.string().uuid(),
  tone: z.enum(["informative", "personal", "firm"]),
});

export const registerPostCoverSchema = z.object({
  altText: z.string().trim().max(300),
  assetId: z.string().uuid(),
  height: z.number().int().positive().max(5000),
  postId: z.string().uuid(),
  siteId: z.string().uuid(),
  storagePath: z.string().min(1).max(500),
  width: z.number().int().positive().max(5000),
});

export const deletePostCoverSchema = z.object({
  postId: z.string().uuid(),
  siteId: z.string().uuid(),
});
