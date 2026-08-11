import { z } from "zod";

const email = z.string().trim().email("Zadajte platnú e-mailovú adresu.");
const password = z.string().min(8, "Heslo musí mať aspoň 8 znakov.").max(128, "Heslo je príliš dlhé.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Zadajte heslo."),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Zadajte celé meno.").max(120, "Meno je príliš dlhé."),
  email,
  password,
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Heslá sa nezhodujú.",
  path: ["passwordConfirmation"],
});

export const resetPasswordSchema = z.object({ email });

export const updatePasswordSchema = z.object({
  password,
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Heslá sa nezhodujú.",
  path: ["passwordConfirmation"],
});

export type AuthFieldErrors = Partial<Record<"fullName" | "email" | "password" | "passwordConfirmation", string[]>>;

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: AuthFieldErrors;
};

export const initialAuthState: AuthActionState = { status: "idle" };
