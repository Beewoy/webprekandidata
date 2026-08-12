import "server-only";

import { createHash } from "node:crypto";
import { createAdminClient } from "./supabase/admin";
import { supportRateLimit } from "./support";

const WINDOW_SECONDS_15M = 15 * 60;

export const authRateLimits = {
  loginRegister: { maximum: 10, windowSeconds: WINDOW_SECONDS_15M },
  passwordReset: { maximum: 5, windowSeconds: WINDOW_SECONDS_15M },
} as const;

export function emailRateLimitBucket(scope: string, email: string) {
  const normalized = email.trim().toLocaleLowerCase("sk");
  const digest = createHash("sha256").update(normalized).digest("hex");
  return `${scope}:${digest}`;
}

export async function consumeRateLimit(bucketKey: string, limit: number, windowSeconds: number) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("consume_rate_limit", {
      p_bucket_key: bucketKey,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      // Availability over lockout: if the limiter is undeployed/misconfigured, do not block auth/support.
      return true;
    }
    return data === true;
  } catch {
    return true;
  }
}

export async function consumeSupportRateLimit(userId: string) {
  return consumeRateLimit(
    `support:${userId}`,
    supportRateLimit.maximumSubmissions,
    supportRateLimit.windowMinutes * 60,
  );
}

export async function consumeAuthEmailRateLimit(
  scope: "auth.login" | "auth.register" | "auth.reset",
  email: string,
) {
  const limits = scope === "auth.reset" ? authRateLimits.passwordReset : authRateLimits.loginRegister;
  return consumeRateLimit(emailRateLimitBucket(scope, email), limits.maximum, limits.windowSeconds);
}

export const authRateLimitMessage =
  "Príliš veľa pokusov v krátkom čase. Skúste to znova o niekoľko minút.";
