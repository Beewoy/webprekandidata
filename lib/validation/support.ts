import { z } from "zod";

export const supportSubmissionSchema = z.object({
  email: z.string().trim().max(254, "E-mailová adresa je príliš dlhá.").email("Zadajte platnú e-mailovú adresu."),
  message: z
    .string()
    .trim()
    .min(10, "Popíšte svoju otázku alebo podnet aspoň 10 znakmi.")
    .max(5000, "Správa môže mať najviac 5 000 znakov."),
  website: z.string().max(200).default(""),
});

export type SupportFormState = {
  errors?: Partial<Record<"email" | "message", string[]>>;
  message: string;
  status: "idle" | "error" | "success";
};

export const initialSupportFormState: SupportFormState = {
  message: "",
  status: "idle",
};
