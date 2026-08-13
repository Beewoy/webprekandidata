"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { createAiReceipt, fingerprintAiPrompt, verifyAiReceipt } from "@/lib/ai/receipt";
import { createManualWelcomeSuggestion, generateWelcomeSuggestion } from "@/lib/ai/welcome";
import { getEmailVerificationStatus } from "@/lib/data/account";
import { requireCurrentUser } from "@/lib/data/sites";
import { isDemoMode } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createWelcomeSiteSchema, welcomeSummarySchema, type WelcomeSuggestion } from "@/lib/validation/onboarding";

type GenerateWelcomeResult =
  | { ok: true; suggestion: WelcomeSuggestion; aiGenerated: boolean; aiReceipt?: string; notice?: string }
  | { ok: false; message: string };

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

async function recordAiRequest(userId: string, model: string) {
  const admin = createAdminClient();
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count, error } = await admin
    .from("audit_logs")
    .select("id", { count: "exact", head: true })
    .eq("actor_user_id", userId)
    .eq("action", "ai.onboarding_requested")
    .gte("created_at", since);

  if (error) throw new Error("rate_limit_unavailable");
  if ((count ?? 0) >= 3) return false;

  const { error: insertError } = await admin.from("audit_logs").insert({
    actor_user_id: userId,
    action: "ai.onboarding_requested",
    target_type: "profile",
    target_id: userId,
    metadata: { provider: "openai", model },
  });
  if (insertError) throw new Error("audit_unavailable");
  return true;
}

export async function generateWelcomeDraftAction(input: unknown): Promise<GenerateWelcomeResult> {
  const parsed = welcomeSummarySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Text nemá správny formát." };

  if (isDemoMode()) {
    return {
      ok: true,
      suggestion: createManualWelcomeSuggestion("Martin Novák", parsed.data.summary),
      aiGenerated: false,
      notice: "V ukážkovom režime sme váš text iba preniesli do návrhu. Po pripojení AI sa doplnia aj ďalšie polia.",
    };
  }

  const user = await requireCurrentUser();
  const profile = await getEmailVerificationStatus();
  if (!process.env.OPENAI_API_KEY) {
    return {
      ok: true,
      suggestion: createManualWelcomeSuggestion(profile.fullName, parsed.data.summary),
      aiGenerated: false,
      notice: "AI zatiaľ nie je pripojená. Váš text sme bezpečne preniesli do editovateľného návrhu bez dopĺňania nových údajov.",
    };
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna";
  try {
    const allowed = await recordAiRequest(user.id, model);
    if (!allowed) return { ok: false, message: "Skúšate to príliš často. Počkajte minútu a potom vytvorte nový návrh." };

    const generated = await generateWelcomeSuggestion({
      fullName: profile.fullName,
      summary: parsed.data.summary,
      safetyIdentifier: createHash("sha256").update(`webprekandidata:${user.id}`).digest("hex"),
    });
    const promptFingerprint = fingerprintAiPrompt(parsed.data.summary);
    const aiReceipt = promptFingerprint ? createAiReceipt({
      userId: user.id,
      promptFingerprint,
      model: generated.model,
      inputTokens: generated.inputTokens,
      outputTokens: generated.outputTokens,
    }) : undefined;

    return { ok: true, suggestion: generated.suggestion, aiGenerated: true, aiReceipt };
  } catch {
    return { ok: false, message: "AI návrh sa teraz nepodarilo pripraviť. Skontrolujte text a skúste to znova; web môžete vytvoriť aj bez AI." };
  }
}

export async function createWelcomeSiteAction(input: unknown): Promise<{ ok: false; message: string } | never> {
  const parsed = createWelcomeSiteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Skontrolujte navrhnuté údaje." };
  if (isDemoMode()) redirect("/app/web/demo");

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const suggestion = parsed.data.suggestion;
  const baseSlug = slugify(suggestion.candidateName) || `kandidat-${Date.now()}`;
  const { data: siteId, error: createError } = await supabase.rpc("create_candidate_site", {
    p_internal_name: suggestion.internalName,
    p_candidate_name: suggestion.candidateName,
    p_locality: suggestion.locality,
    p_position: suggestion.position,
    p_slug: baseSlug,
  });

  if (createError || typeof siteId !== "string") {
    return { ok: false, message: "Web sa nepodarilo vytvoriť. Skúste to znova o chvíľu." };
  }

  const firstName = suggestion.candidateName.split(/\s+/)[0] || suggestion.candidateName;
  const priorities = suggestion.priorities.filter((item) => item.title || item.text);
  const programValues: Record<string, string> = {
    eyebrow: "Môj program",
    headline: priorities.length ? `Priority pre ${suggestion.locality}` : "",
    intro: "",
    items_count: String(priorities.length),
  };
  priorities.forEach((item, index) => {
    programValues[`item_${index}_title`] = item.title;
    programValues[`item_${index}_text`] = item.text;
    programValues[`item_${index}_icon`] = "ideas";
  });

  const content = {
    "zakladne-udaje": {
      name: suggestion.candidateName,
      position: suggestion.position,
      city: suggestion.locality,
    },
    uvod: {
      headline: suggestion.heroHeadline,
      highlight: "",
      subheadline: suggestion.heroSubheadline,
    },
    "o-mne": {
      eyebrow: "O mne",
      headline: "Spoznajte ma a moje skúsenosti",
      body: suggestion.aboutBody,
      signature: `— ${firstName}`,
    },
    "preco-kandidujem": {
      eyebrow: "Prečo kandidujem",
      headline: "Moja motivácia",
      intro: suggestion.motivation,
    },
    program: programValues,
    ...(user.email?.trim()
      ? { kontakt: { email: user.email.trim() } }
      : {}),
  };

  const { error: draftError } = await supabase
    .from("site_drafts")
    .update({ content, revision: 2, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq("site_id", siteId)
    .eq("revision", 1);

  const receipt = verifyAiReceipt(parsed.data.aiReceipt, user.id, parsed.data.summary);
  if (receipt) {
    const admin = createAdminClient();
    await admin.from("ai_generations").insert({
      site_id: siteId,
      user_id: user.id,
      task_type: "onboarding",
      provider: "openai",
      model: receipt.model,
      status: "completed",
      input_tokens: receipt.inputTokens,
      output_tokens: receipt.outputTokens,
      prompt_fingerprint: receipt.promptFingerprint,
      accepted_at: new Date().toISOString(),
    });
  }

  redirect(draftError ? `/app/web/${siteId}?onboarding=ciastocny` : `/app/web/${siteId}`);
}
