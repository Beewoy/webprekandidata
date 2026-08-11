import { z } from "zod";

const prioritySchema = z.object({
  title: z.string().trim().max(90, "Názov priority je príliš dlhý."),
  text: z.string().trim().max(400, "Popis priority je príliš dlhý."),
});

export const welcomeSummarySchema = z.object({
  summary: z.string().trim().min(40, "Napíšte aspoň 40 znakov, aby sme vedeli pripraviť užitočný návrh.").max(2000, "Text môže mať najviac 2 000 znakov."),
});

export const welcomeSuggestionSchema = z.object({
  internalName: z.string().trim().max(100, "Názov projektu je príliš dlhý."),
  candidateName: z.string().trim().max(120, "Meno je príliš dlhé."),
  locality: z.string().trim().max(120, "Názov lokality je príliš dlhý."),
  position: z.string().trim().max(160, "Názov funkcie je príliš dlhý."),
  heroHeadline: z.string().trim().max(100, "Hlavný nadpis je príliš dlhý."),
  heroSubheadline: z.string().trim().max(260, "Podnadpis je príliš dlhý."),
  aboutBody: z.string().trim().max(1800, "Text o vás je príliš dlhý."),
  motivation: z.string().trim().max(900, "Text motivácie je príliš dlhý."),
  priorities: z.array(prioritySchema).max(3, "Môžete použiť najviac tri priority."),
});

export const createWelcomeSiteSchema = z.object({
  summary: welcomeSummarySchema.shape.summary,
  suggestion: welcomeSuggestionSchema.extend({
    internalName: welcomeSuggestionSchema.shape.internalName.min(3, "Pomenujte svoj projekt."),
    candidateName: welcomeSuggestionSchema.shape.candidateName.min(2, "Doplňte meno kandidáta."),
    locality: welcomeSuggestionSchema.shape.locality.min(2, "Doplňte obec alebo mesto."),
    position: welcomeSuggestionSchema.shape.position.min(3, "Doplňte funkciu, na ktorú kandidujete."),
  }),
  aiReceipt: z.string().max(4000).optional(),
});

export type WelcomeSuggestion = z.infer<typeof welcomeSuggestionSchema>;
