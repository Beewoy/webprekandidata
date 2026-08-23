import "server-only";

import { formatFeedbackChipLabels } from "@/lib/feedback/options";
import { requirePlatformAdmin } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminFeedbackRow = {
  id: string;
  createdAt: string;
  overallRating: number;
  editorRating: number;
  highlights: string[];
  improvements: string[];
  comment: string | null;
  email: string | null;
  consentPublic: boolean;
  userId: string | null;
  siteId: string | null;
  siteSlug: string | null;
  siteName: string | null;
};

function truncateComment(value: string | null, max = 120) {
  if (!value) return "—";
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

export async function getAdminFeedbackSubmissions(limit = 100): Promise<AdminFeedbackRow[]> {
  await requirePlatformAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback_submissions")
    .select(`
      id,
      created_at,
      overall_rating,
      editor_rating,
      highlights,
      improvements,
      comment,
      email,
      consent_public,
      user_id,
      site_id,
      sites ( slug, candidate_name )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error("Spätnú väzbu sa nepodarilo načítať.");

  return (data ?? []).map((row) => {
    const site = Array.isArray(row.sites) ? row.sites[0] : row.sites;
    return {
      id: row.id,
      createdAt: row.created_at,
      overallRating: row.overall_rating,
      editorRating: row.editor_rating,
      highlights: row.highlights ?? [],
      improvements: row.improvements ?? [],
      comment: row.comment,
      email: row.email,
      consentPublic: row.consent_public,
      userId: row.user_id,
      siteId: row.site_id,
      siteSlug: site && typeof site === "object" && "slug" in site ? String(site.slug) : null,
      siteName:
        site && typeof site === "object" && "candidate_name" in site
          ? String(site.candidate_name)
          : null,
    };
  });
}

export function formatAdminFeedbackSummary(row: AdminFeedbackRow) {
  const highlights = formatFeedbackChipLabels(row.highlights).join(", ") || "—";
  const improvements = formatFeedbackChipLabels(row.improvements).join(", ") || "—";
  return { highlights, improvements, commentPreview: truncateComment(row.comment) };
}
