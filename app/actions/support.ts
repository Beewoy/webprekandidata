"use server";

import { getCurrentUser } from "@/lib/data/sites";
import { isBrevoSmtpConfigured, sendSupportEmail } from "@/lib/email/brevo";
import { isDemoMode } from "@/lib/env";
import { supportRateLimit, supportRecipientEmails } from "@/lib/support";
import {
  supportSubmissionSchema,
  type SupportFormState,
} from "@/lib/validation/support";

const submissionTimestamps = new Map<string, number[]>();

function acceptRateLimit(userKey: string) {
  const now = Date.now();
  const windowMs = supportRateLimit.windowMinutes * 60 * 1000;
  const recent = (submissionTimestamps.get(userKey) ?? []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= supportRateLimit.maximumSubmissions) {
    submissionTimestamps.set(userKey, recent);
    return false;
  }
  recent.push(now);
  submissionTimestamps.set(userKey, recent);
  return true;
}

export async function submitSupportForm(
  _previousState: SupportFormState,
  formData: FormData,
): Promise<SupportFormState> {
  if (formData.get("website")) {
    return { status: "success", message: "Správa bola odoslaná. Ďakujeme." };
  }

  const parsed = supportSubmissionSchema.safeParse({
    email: formData.get("email"),
    message: formData.get("message"),
    website: "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Skontrolujte označené polia.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const demo = isDemoMode();
  const user = demo ? null : await getCurrentUser();
  if (!demo && !user) {
    return { status: "error", message: "Pre odoslanie správy sa musíte prihlásiť." };
  }

  const userKey = user?.id ?? "demo";
  if (!acceptRateLimit(userKey)) {
    return {
      status: "error",
      message: `Odoslali ste viac správ v krátkom čase. Skúste to znova o ${supportRateLimit.windowMinutes} minút.`,
    };
  }

  const replyEmail = parsed.data.email.toLocaleLowerCase("sk");

  if (demo || !isBrevoSmtpConfigured()) {
    return { status: "success", message: "Správa bola odoslaná. Ďakujeme." };
  }

  if (!user) {
    return { status: "error", message: "Pre odoslanie správy sa musíte prihlásiť." };
  }

  try {
    await sendSupportEmail({
      accountEmail: user.email ?? null,
      message: parsed.data.message,
      recipientEmails: supportRecipientEmails,
      replyEmail,
      userId: user.id,
    });
    return { status: "success", message: "Správa bola odoslaná. Ďakujeme." };
  } catch {
    return { status: "error", message: "Správu sa nepodarilo odoslať. Skúste to znova neskôr." };
  }
}
