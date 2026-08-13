"use server";

import { redirect } from "next/navigation";
import { getEmailVerificationStatus } from "@/lib/data/account";
import { issueAndSendVerificationEmail, VerificationDeliveryError } from "@/lib/email/verification";
import { getAppUrl, isSupabaseConfigured } from "@/lib/env";
import {
  authRateLimitMessage,
  consumeAuthEmailRateLimit,
} from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  type AuthActionState,
  type ResendVerificationState,
} from "@/lib/validation/auth";

function unavailableState(): AuthActionState {
  return {
    status: "error",
    message: "Prihlasovanie sprístupníme po pripojení Supabase. Zatiaľ môžete použiť ukážkový projekt.",
  };
}

export async function loginAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", errors: parsed.error.flatten().fieldErrors };
  if (!isSupabaseConfigured()) return unavailableState();

  const allowed = await consumeAuthEmailRateLimit("auth.login", parsed.data.email);
  if (!allowed) return { status: "error", message: authRateLimitMessage };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { status: "error", message: "E-mail alebo heslo nie je správne. Skontrolujte údaje a skúste to znova." };
  }

  redirect("/app");
}

export async function registerAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", errors: parsed.error.flatten().fieldErrors };
  if (!isSupabaseConfigured()) return unavailableState();

  const allowed = await consumeAuthEmailRateLimit("auth.register", parsed.data.email);
  if (!allowed) return { status: "error", message: authRateLimitMessage };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) {
    return { status: "error", message: "Účet sa nepodarilo vytvoriť. E-mail už môže byť zaregistrovaný." };
  }

  if (!data.session || !data.user) {
    return {
      status: "error",
      message: "Účet bol vytvorený, ale okamžité prihlásenie ešte nie je aktívne. Skúste sa prihlásiť neskôr.",
    };
  }

  let emailNotice = "odoslany";
  try {
    await issueAndSendVerificationEmail({
      userId: data.user.id,
      email: parsed.data.email,
      fullName: parsed.data.fullName,
    });
  } catch {
    emailNotice = "neodoslany";
  }

  redirect(`/app?email=${emailNotice}&welcome=1`);
}

export async function resendVerificationEmailAction(
  previousState: ResendVerificationState,
  formData: FormData,
): Promise<ResendVerificationState> {
  void previousState;
  void formData;

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "Overovací e-mail sa teraz nepodarilo odoslať. Skúste to znova o chvíľu.",
    };
  }

  const status = await getEmailVerificationStatus();
  if (status.verified) {
    return {
      status: "already_verified",
      message: "E-mail je už overený. Ďalší odkaz nie je potrebný.",
    };
  }

  try {
    await issueAndSendVerificationEmail({
      userId: status.userId,
      email: status.email,
      fullName: status.fullName,
    });
    return {
      status: "success",
      message: `Overovací odkaz sme odoslali na ${status.email}.`,
    };
  } catch (error) {
    if (error instanceof VerificationDeliveryError && error.reason === "rate_limit") {
      return {
        status: "rate_limit",
        message: "Ďalší overovací odkaz môžete poslať po jednej minúte.",
      };
    }
    return {
      status: "error",
      message: "Overovací e-mail sa nepodarilo odoslať. Skúste to znova.",
    };
  }
}

export async function resetPasswordAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", errors: parsed.error.flatten().fieldErrors };
  if (!isSupabaseConfigured()) return unavailableState();

  const allowed = await consumeAuthEmailRateLimit("auth.reset", parsed.data.email);
  if (!allowed) return { status: "error", message: authRateLimitMessage };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getAppUrl()}/auth/callback?next=/obnova-hesla`,
  });

  return {
    status: "success",
    message: "Ak účet s týmto e-mailom existuje, poslali sme vám odkaz na obnovu hesla.",
  };
}

export async function updatePasswordAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", errors: parsed.error.flatten().fieldErrors };
  if (!isSupabaseConfigured()) return unavailableState();

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: "Heslo sa nepodarilo zmeniť. Odkaz mohol vypršať; požiadajte o nový." };

  await supabase.auth.signOut();
  redirect("/prihlasenie?heslo=zmenene");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
