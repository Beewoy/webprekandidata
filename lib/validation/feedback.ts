import { z } from "zod";
import {
  FEEDBACK_HIGHLIGHT_IDS,
  FEEDBACK_IMPROVEMENT_IDS,
} from "../feedback/options";

const ratingSchema = z.coerce
  .number()
  .int("Vyberte hodnotenie hviezdičkami.")
  .min(1, "Vyberte aspoň 1 hviezdičku.")
  .max(5, "Maximum je 5 hviezd.");

export const feedbackSubmissionSchema = z.object({
  overallRating: ratingSchema,
  editorRating: ratingSchema,
  highlights: z
    .array(z.enum(FEEDBACK_HIGHLIGHT_IDS))
    .max(4, "Vyberte najviac 4 možnosti.")
    .default([]),
  improvements: z
    .array(z.enum(FEEDBACK_IMPROVEMENT_IDS))
    .max(4, "Vyberte najviac 4 možnosti.")
    .default([]),
  comment: z
    .string()
    .trim()
    .max(1500, "Komentár môže mať najviac 1 500 znakov.")
    .optional()
    .transform((value) => value || undefined),
  email: z
    .string()
    .trim()
    .max(254, "E-mailová adresa je príliš dlhá.")
    .email("Zadajte platnú e-mailovú adresu.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value.toLocaleLowerCase("sk") : undefined)),
  consentPublic: z.boolean().default(false),
  website: z.string().max(200).default(""),
});

export type FeedbackFormState = {
  errors?: Partial<
    Record<
      "comment" | "editorRating" | "email" | "highlights" | "improvements" | "overallRating",
      string[]
    >
  >;
  message: string;
  status: "idle" | "error" | "success";
};

export const initialFeedbackFormState: FeedbackFormState = {
  message: "",
  status: "idle",
};
