export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

/**
 * Demo mode is allowed only outside production.
 * In production this always returns false; missing Supabase must not fall back to demo.
 * Call assertProductionConfig() on /app and /admin to fail-closed on bad production env.
 */
export function isDemoMode() {
  if (isProductionRuntime()) {
    return false;
  }
  return process.env.DEMO_MODE !== "false" || !isSupabaseConfigured();
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/** Public platform host used in candidate URLs, without protocol (e.g. webprekandidata.sk or localhost:3000). */
export function getRootDomain() {
  const configured = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim();
  if (configured) return configured.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  try {
    return new URL(getAppUrl()).host;
  } catch {
    return "localhost:3000";
  }
}

export function isVercelDomainsConfigured() {
  return Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID);
}
