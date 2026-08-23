/** Accept only same-origin relative paths for post-login redirects. */
export function sanitizeInternalPath(value: unknown, fallback = "/app"): string {
  if (typeof value !== "string") return fallback;
  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}
