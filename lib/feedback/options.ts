export const FEEDBACK_HIGHLIGHT_IDS = [
  "quick_start",
  "templates",
  "editor",
  "support",
  "pricing",
] as const;

export const FEEDBACK_IMPROVEMENT_IDS = [
  "more_templates",
  "mobile_editor",
  "ai_help",
  "publishing_domain",
  "support_speed",
] as const;

export type FeedbackHighlightId = (typeof FEEDBACK_HIGHLIGHT_IDS)[number];
export type FeedbackImprovementId = (typeof FEEDBACK_IMPROVEMENT_IDS)[number];

export const FEEDBACK_HIGHLIGHT_OPTIONS: ReadonlyArray<{ id: FeedbackHighlightId; label: string }> = [
  { id: "quick_start", label: "Rýchle spustenie" },
  { id: "templates", label: "Šablóny a vzhľad" },
  { id: "editor", label: "Jednoduchý editor" },
  { id: "support", label: "Podpora tímu" },
  { id: "pricing", label: "Cena balíka" },
];

export const FEEDBACK_IMPROVEMENT_OPTIONS: ReadonlyArray<{ id: FeedbackImprovementId; label: string }> = [
  { id: "more_templates", label: "Viac šablón" },
  { id: "mobile_editor", label: "Mobilný editor" },
  { id: "ai_help", label: "AI nápoveda" },
  { id: "publishing_domain", label: "Publikovanie / doména" },
  { id: "support_speed", label: "Rýchlosť podpory" },
];

export const FEEDBACK_CHIP_LABELS: Record<FeedbackHighlightId | FeedbackImprovementId, string> = {
  quick_start: "Rýchle spustenie",
  templates: "Šablóny a vzhľad",
  editor: "Jednoduchý editor",
  support: "Podpora tímu",
  pricing: "Cena balíka",
  more_templates: "Viac šablón",
  mobile_editor: "Mobilný editor",
  ai_help: "AI nápoveda",
  publishing_domain: "Publikovanie / doména",
  support_speed: "Rýchlosť podpory",
};

export function formatFeedbackChipLabels(ids: string[]) {
  return ids.map((id) => FEEDBACK_CHIP_LABELS[id as FeedbackHighlightId | FeedbackImprovementId] ?? id);
}
