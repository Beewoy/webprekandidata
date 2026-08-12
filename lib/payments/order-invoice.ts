export function resolveOrderInvoiceUrl(
  hostedUrl: string | null | undefined,
  pdfUrl: string | null | undefined,
): string | null {
  const hosted = hostedUrl?.trim();
  if (hosted) return hosted;
  const pdf = pdfUrl?.trim();
  return pdf || null;
}
