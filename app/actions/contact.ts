"use server";

import { z } from "zod";
import { contactRateLimit, getPublicationContactSettings } from "@/lib/contact-form";
import { sendCandidateContactEmail } from "@/lib/email/brevo";
import { createAdminClient } from "@/lib/supabase/admin";
import { contactSubmissionSchema } from "@/lib/validation/site";

export type ContactFormState = {
  errors?: Partial<Record<"email" | "message" | "name" | "phone", string[]>>;
  message: string;
  status: "idle" | "error" | "success";
};

export async function submitContactForm(
  siteId: string,
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  if (formData.get("website")) {
    return { status: "success", message: "Správa bola odoslaná. Ďakujeme." };
  }

  const parsed = contactSubmissionSchema.safeParse({
    email: formData.get("email"),
    message: formData.get("message"),
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    website: "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Skontrolujte označené polia.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const siteIdResult = z.string().uuid().safeParse(siteId);
  if (!siteIdResult.success) return { status: "error", message: "Formulár momentálne nie je dostupný." };

  try {
    const admin = createAdminClient();
    const { data: site } = await admin
      .from("sites")
      .select("id, candidate_name, status, current_publication_id")
      .eq("id", siteIdResult.data)
      .is("deleted_at", null)
      .maybeSingle();

    if (!site || site.status !== "published" || !site.current_publication_id) {
      return { status: "error", message: "Formulár je dostupný až na zverejnenom webe." };
    }

    const { data: publication } = await admin
      .from("site_publications")
      .select("content")
      .eq("id", site.current_publication_id)
      .eq("site_id", site.id)
      .is("unpublished_at", null)
      .maybeSingle();
    if (!publication) return { status: "error", message: "Formulár momentálne nie je dostupný." };

    const contact = getPublicationContactSettings(publication.content);
    const recipient = z.string().email().safeParse(contact.email);
    if (!contact.enabled || !recipient.success) {
      return { status: "error", message: "Kandidát momentálne neprijíma správy cez formulár." };
    }

    const normalizedEmail = parsed.data.email.toLocaleLowerCase("sk");
    const since = new Date(Date.now() - contactRateLimit.windowMinutes * 60 * 1000).toISOString();
    const emailLimit = await admin
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("site_id", site.id)
      .eq("sender_email", normalizedEmail)
      .gte("created_at", since);

    if (emailLimit.error) throw new Error("contact_rate_limit_failed");
    if ((emailLimit.count ?? 0) >= contactRateLimit.maximumSubmissions) {
      return { status: "error", message: "Odoslali ste viac správ v krátkom čase. Skúste to znova o 15 minút." };
    }

    const { data: submission, error: insertError } = await admin
      .from("contact_submissions")
      .insert({
        consent_recorded_at: new Date().toISOString(),
        message: parsed.data.message,
        sender_email: normalizedEmail,
        sender_name: parsed.data.name,
        site_id: site.id,
      })
      .select("id")
      .single();
    if (insertError || !submission) throw new Error("contact_submission_insert_failed");

    try {
      await sendCandidateContactEmail({
        candidateName: site.candidate_name,
        message: parsed.data.message,
        recipientEmail: recipient.data,
        senderEmail: normalizedEmail,
        senderName: parsed.data.name,
        senderPhone: parsed.data.phone || undefined,
      });
      await admin.from("contact_submissions").update({ delivery_status: "sent" }).eq("id", submission.id);
    } catch {
      await admin.from("contact_submissions").update({ delivery_status: "failed" }).eq("id", submission.id);
      return { status: "error", message: "Správu sa nepodarilo odoslať. Skúste to znova neskôr." };
    }

    return { status: "success", message: "Správa bola odoslaná. Ďakujeme." };
  } catch {
    return { status: "error", message: "Formulár je dočasne nedostupný. Skúste to znova neskôr." };
  }
}
