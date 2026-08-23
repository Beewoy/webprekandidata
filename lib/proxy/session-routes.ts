/** Platform-only routes redirected from custom candidate domains. */
export const PLATFORM_ONLY_PATH_PREFIXES = [
  "/app",
  "/admin",
  "/api",
  "/prihlasenie",
  "/registracia",
  "/obnova-hesla",
  "/zabudnute-heslo",
  "/auth",
] as const;

/** Protected areas where the session must be refreshed before rendering. */
export const SESSION_REFRESH_PREFIXES = ["/app", "/admin", "/api"] as const;

export function matchesPathPrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isPlatformOnlyPath(pathname: string) {
  return matchesPathPrefix(pathname, PLATFORM_ONLY_PATH_PREFIXES);
}

export function shouldRefreshAuthSession(pathname: string) {
  return matchesPathPrefix(pathname, SESSION_REFRESH_PREFIXES);
}
