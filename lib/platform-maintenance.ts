/** Path shown for every blocked request while platform maintenance is on. */
export const PLATFORM_MAINTENANCE_PATH = "/prevadzka-pozastavena";

/**
 * When true, proxy rewrites all non-exempt traffic to the maintenance page with 503.
 * Set PLATFORM_MAINTENANCE=true in Vercel Production and redeploy to pause the site.
 */
export function isPlatformMaintenance() {
  return process.env.PLATFORM_MAINTENANCE === "true";
}

/** Health checks and Stripe webhooks stay reachable during maintenance. */
export function isPlatformMaintenanceExemptPath(pathname: string) {
  return pathname === "/api/health" || pathname === "/api/webhooks/stripe";
}
