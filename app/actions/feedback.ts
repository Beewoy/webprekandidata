"use server";

import { isBrevoSmtpConfigured, sendFeedbackNotificationEmail } from "@/lib/email/brevo";
import { getCurrentUser } from "@/lib/data/sites";
import { feedbackRateLimit } from "@/lib/feedback/rate-limit";
import { getRequestFingerprint } from "@/lib/feedback/request-fingerprint";
import { isDemoMode } from "@/lib/env";
import { consumeRateLimit } from "@/lib/rate-limit";
import { supportRecipientEmails } from "@/lib/support";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  feedbackSubmissionSchema,
  type FeedbackFormState,
} from "@/lib/validation/feedback";

async function resolveSubmissionContext() {
  const user = await getCurrentUser();
  if (!user) {
    return { userId: null as string | null, siteId: null as string | null };
  }

  const admin = createAdminClient();
  const { data: sites } = await admin
    .from("sites")
    .select("id")
    .eq("owner_user_id", user.id)
    .is("deleted_at", null);

  return {
    userId: user.id,
    siteId: sites?.length === 1 ? sites[0].id : null,
  };
}

export async function submitFeedbackForm(
  _previousState: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  if (formData.get("website")) {
    return { status: "success", message: "Ďakujeme, vaša spätná väzba nám pomôže." };
  }

  const parsed = feedbackSubmissionSchema.safeParse({
    overallRating: formData.get("overallRating"),
    editorRating: formData.get("editorRating"),
    highlights: formData.getAll("highlights"),
    improvements: formData.getAll("improvements"),
    comment: formData.get("comment") ?? "",
    email: formData.get("email") ?? "",
    consentPublic: formData.get("consentPublic") === "on",
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
  const requestFingerprint = await getRequestFingerprint();

  if (!demo) {
    const allowed = await consumeRateLimit(
      `feedback:${requestFingerprint}`,
      feedbackRateLimit.maximumSubmissions,
      feedbackRateLimit.windowHours * 60 * 60,
    );
    if (!allowed) {
      return {
        status: "error",
        message: "Z tohto zariadenia ste už nedávno odoslali spätnú väzbu. Skúste to znova zajtra.",
      };
    }
  }

  if (demo || !isBrevoSmtpConfigured()) {
    return { status: "success", message: "Ďakujeme, vaša spätná väzba nám pomôže." };
  }

  try {
    const { userId, siteId } = await resolveSubmissionContext();
    const admin = createAdminClient();
    const { data: submission, error: insertError } = await admin
      .from("feedback_submissions")
      .insert({
        comment: parsed.data.comment ?? null,
        consent_public: parsed.data.consentPublic,
        editor_rating: parsed.data.editorRating,
        email: parsed.data.email ?? null,
        highlights: parsed.data.highlights,
        improvements: parsed.data.improvements,
        overall_rating: parsed.data.overallRating,
        request_fingerprint: requestFingerprint,
        site_id: siteId,
        user_id: userId,
      })
      .select("id, created_at")
      .single();

    if (insertError || !submission) {
      throw new Error("feedback_submission_insert_failed");
    }

    let siteLabel: string | null = null;
    if (siteId) {
      const { data: site } = await admin
        .from("sites")
        .select("candidate_name, slug")
        .eq("id", siteId)
        .maybeSingle();
      if (site) {
        siteLabel = site.candidate_name || site.slug;
      }
    }

    await sendFeedbackNotificationEmail({
      comment: parsed.data.comment,
      consentPublic: parsed.data.consentPublic,
      createdAtIso: submission.created_at,
      editorRating: parsed.data.editorRating,
      email: parsed.data.email,
      highlights: parsed.data.highlights,
      improvements: parsed.data.improvements,
      overallRating: parsed.data.overallRating,
      recipientEmails: [...supportRecipientEmails],
      siteId,
      siteLabel,
      submissionId: submission.id,
      userId,
    });

    return { status: "success", message: "Ďakujeme, vaša spätná väzba nám pomôže." };
  } catch {
    return {
      status: "error",
      message: "Spätnú väzbu sa nepodarilo odoslať. Skúste to znova neskôr.",
    };
  }
}
