import { describe, expect, it } from "vitest";
import {
  FEEDBACK_CHIP_LABELS,
  formatFeedbackChipLabels,
} from "../lib/feedback/options";
import { feedbackSubmissionSchema } from "../lib/validation/feedback";

describe("feedbackSubmissionSchema", () => {
  it("accepts a minimal valid submission", () => {
    const parsed = feedbackSubmissionSchema.safeParse({
      overallRating: "5",
      editorRating: "4",
      highlights: ["editor", "templates"],
      improvements: [],
      comment: "",
      email: "",
      consentPublic: false,
      website: "",
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.overallRating).toBe(5);
    expect(parsed.data.editorRating).toBe(4);
    expect(parsed.data.highlights).toEqual(["editor", "templates"]);
    expect(parsed.data.email).toBeUndefined();
    expect(parsed.data.comment).toBeUndefined();
  });

  it("rejects missing star ratings", () => {
    const parsed = feedbackSubmissionSchema.safeParse({
      overallRating: "",
      editorRating: "3",
      highlights: [],
      improvements: [],
      comment: "",
      email: "",
      consentPublic: false,
      website: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects more than four chip selections", () => {
    const parsed = feedbackSubmissionSchema.safeParse({
      overallRating: "5",
      editorRating: "5",
      highlights: ["quick_start", "templates", "editor", "support", "pricing"],
      improvements: [],
      comment: "",
      email: "",
      consentPublic: false,
      website: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("normalizes optional email and comment", () => {
    const parsed = feedbackSubmissionSchema.safeParse({
      overallRating: 3,
      editorRating: 3,
      highlights: [],
      improvements: ["ai_help"],
      comment: "  Super produkt  ",
      email: "Kandidat@Example.COM",
      consentPublic: true,
      website: "",
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.comment).toBe("Super produkt");
    expect(parsed.data.email).toBe("kandidat@example.com");
    expect(parsed.data.improvements).toEqual(["ai_help"]);
  });
});

describe("formatFeedbackChipLabels", () => {
  it("maps known chip ids to Slovak labels", () => {
    expect(formatFeedbackChipLabels(["editor", "ai_help"])).toEqual([
      FEEDBACK_CHIP_LABELS.editor,
      FEEDBACK_CHIP_LABELS.ai_help,
    ]);
  });
});
