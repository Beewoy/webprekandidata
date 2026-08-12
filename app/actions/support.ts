"use server";

import { getCurrentUser } from "@/lib/data/sites";
import { isBrevoSmtpConfigured, sendSupportEmail } from "@/lib/email/brevo";
import { isDemoMode } from "@/lib/env";
import { consumeSupportRateLimit } from "@/lib/rate-limit";
import { supportRateLimit, supportRecipientEmails } from "@/lib/support";
import {
  supportSubmissionSchema,
  type SupportFormState,
} from "@/lib/validation/support";

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

  if (!demo && user) {
    const allowed = await consumeSupportRateLimit(user.id);
    if (!allowed) {
      return {
        status: "error",
        message: `Odoslali ste viac správ v krátkom čase. Skúste to znova o ${supportRateLimit.windowMinutes} minút.`,
      };
    }
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
