import sanitizeHtml from "sanitize-html";

function isRichTextField(sectionSlug: string, fieldName: string) {
  return (sectionSlug === "o-mne" && fieldName === "body")
    || (sectionSlug === "program" && /^item_\d+_detail$/.test(fieldName));
}

function safeAnchorAttributes(attribs: sanitizeHtml.Attributes): sanitizeHtml.Attributes | null {
  const href = attribs.href?.trim() ?? "";
  if (!href) return null;

  const isWebLink = /^https?:\/\//i.test(href);
  const isMailto = /^mailto:/i.test(href);
  if (!isWebLink && !isMailto) return null;

  return {
    href,
    ...(isWebLink ? { rel: "noopener noreferrer", target: "_blank" } : {}),
  };
}

export function sanitizeRichText(value: string) {
  return sanitizeHtml(value, {
    allowedAttributes: {
      a: ["href", "rel", "target"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
    },
    allowedTags: ["p", "br", "strong", "em", "h3", "ul", "ol", "li", "a"],
    disallowedTagsMode: "discard",
    transformTags: {
      // Invalid schemes unwrap to plain text via a discarded placeholder tag.
      a: (_tagName, attribs) => {
        const safe = safeAnchorAttributes(attribs);
        if (!safe) return { tagName: "span", attribs: {} };
        return { tagName: "a", attribs: safe };
      },
    },
  });
}

export function sanitizeSectionRichText(sectionSlug: string, values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, isRichTextField(sectionSlug, key) ? sanitizeRichText(value) : value]),
  );
}
