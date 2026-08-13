import { isSellerIdentityComplete } from "./legal/seller";
import { isProductionRuntime, isSupabaseConfigured } from "./env";

function isSellerConfigured() {
  return isSellerIdentityComplete();
}

/**
 * Returns human-readable configuration issues. Never includes secret values.
 * Hard-fail issues block /app and /admin in production.
 * Soft issues are reported for ops (Stripe/CRON) without crashing marketing pages.
 */
export function getProductionConfigIssues(options?: { includeSoft?: boolean }) {
  if (!isProductionRuntime()) return [] as string[];

  const issues: string[] = [];
  const includeSoft = options?.includeSoft !== false;

  if (process.env.DEMO_MODE === "true") {
    issues.push("DEMO_MODE cannot be enabled in production");
  } else if (process.env.DEMO_MODE !== "false") {
    issues.push("DEMO_MODE must be explicitly set to false in production");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    issues.push("missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()) {
    issues.push("missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    issues.push("missing SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!includeSoft) return issues;

  if (!process.env.STRIPE_SECRET_KEY?.trim()) issues.push("missing STRIPE_SECRET_KEY");
  if (!process.env.STRIPE_WEBHOOK_SECRET?.trim()) issues.push("missing STRIPE_WEBHOOK_SECRET");
  if (!process.env.STRIPE_PRICE_BASIC?.trim()) issues.push("missing STRIPE_PRICE_BASIC");
  if (!process.env.STRIPE_PRICE_PLUS?.trim()) issues.push("missing STRIPE_PRICE_PLUS");
  if (!isSellerConfigured()) issues.push("incomplete SELLER_* billing identity");
  if (!process.env.CRON_SECRET?.trim()) issues.push("missing CRON_SECRET");

  return issues;
}

export function getHardProductionConfigIssues() {
  return getProductionConfigIssues({ includeSoft: false });
}

export function formatProductionConfigError(issues: string[]) {
  return ["Production configuration invalid:", ...issues.map((issue) => `- ${issue}`)].join("\n");
}

/** Fail-closed gate for authenticated app trees. Throws without leaking secret values. */
export function assertProductionConfig() {
  if (!isProductionRuntime()) return;
  const issues = getHardProductionConfigIssues();
  if (issues.length > 0) {
    throw new Error(formatProductionConfigError(issues));
  }
  if (!isSupabaseConfigured()) {
    throw new Error(formatProductionConfigError(["incomplete Supabase client configuration"]));
  }
}
