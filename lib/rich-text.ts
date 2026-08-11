import sanitizeHtml from "sanitize-html";

function isRichTextField(sectionSlug: string, fieldName: string) {
  return (sectionSlug === "o-mne" && fieldName === "body")
    || (sectionSlug === "program" && /^item_\d+_detail$/.test(fieldName));
}

export function sanitizeRichText(value: string) {
  return sanitizeHtml(value, {
    allowedAttributes: {},
    allowedTags: ["p", "br", "strong", "em", "h3", "ul", "ol", "li"],
    disallowedTagsMode: "discard",
  });
}

export function sanitizeSectionRichText(sectionSlug: string, values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, isRichTextField(sectionSlug, key) ? sanitizeRichText(value) : value]),
  );
}
