function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function plainText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maximum) : "";
}

export function resolvePublicationSeo(seoValue: unknown, candidateName: string) {
  const seo = objectValue(seoValue);
  const title = plainText(seo.seoTitle, 70) || plainText(seo.title, 70) || `${candidateName} – kandidát`;
  const description = plainText(seo.seoDescription, 180)
    || plainText(seo.description, 180)
    || `Oficiálna stránka kandidáta ${candidateName}.`;

  return { description, title };
}
