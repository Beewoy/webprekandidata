import { getAppUrl, getRootDomain } from "../env";
import { hostWithoutPort } from "./hostname";

const PLATFORM_APEX = "webprekandidata.sk";

export function getCanonicalPlatformHostname(rootDomain = getRootDomain()) {
  return hostWithoutPort(rootDomain).toLowerCase().replace(/^www\./, "");
}

export function isPlatformWwwHostname(hostname: string, rootDomain = getRootDomain()) {
  const canonical = getCanonicalPlatformHostname(rootDomain);
  return !canonical.startsWith("localhost") && hostname === `www.${canonical}`;
}

export function getPlatformPublicOrigin() {
  const root = getRootDomain();
  if (root.startsWith("localhost") || root.startsWith("127.0.0.1")) {
    return `http://${root}`;
  }
  try {
    const app = new URL(getAppUrl());
    if (app.host === root || app.hostname === hostWithoutPort(root)) {
      return app.origin;
    }
  } catch {
    // fall through
  }
  return `https://${root}`;
}

export function getPlatformSiteUrl(slug: string) {
  return `${getPlatformPublicOrigin().replace(/\/$/, "")}/${slug}`;
}

export function getPlatformHostnames() {
  const root = getRootDomain();
  const host = hostWithoutPort(root).toLowerCase();
  const hosts = new Set<string>([host, `www.${host}`, PLATFORM_APEX, `www.${PLATFORM_APEX}`]);
  try {
    const appHost = hostWithoutPort(new URL(getAppUrl()).host).toLowerCase();
    hosts.add(appHost);
    hosts.add(`www.${appHost}`);
  } catch {
    // ignore
  }
  hosts.add("localhost");
  hosts.add("127.0.0.1");
  return hosts;
}

export function isPlatformHostname(hostname: string) {
  const host = hostWithoutPort(hostname).toLowerCase();
  if (getPlatformHostnames().has(host)) return true;
  if (host.endsWith(".vercel.app") || host.endsWith(".localhost")) return true;
  if (host === PLATFORM_APEX || host.endsWith(`.${PLATFORM_APEX}`)) return true;
  const root = hostWithoutPort(getRootDomain()).toLowerCase();
  if (root && !root.startsWith("localhost") && host !== root && host.endsWith(`.${root}`)) return true;
  return false;
}

export type DomainStatus = "pending" | "verifying" | "active" | "failed" | "removed";

export const DOMAIN_STATUS_LABELS: Record<DomainStatus, string> = {
  pending: "Čaká",
  verifying: "Overuje sa",
  active: "Aktívna",
  failed: "Zlyhalo",
  removed: "Odstránená",
};

export function isDomainStatus(value: string): value is DomainStatus {
  return value in DOMAIN_STATUS_LABELS;
}

export function getCanonicalPublicUrl(options: {
  platformSlug: string;
  primaryHostname?: string | null;
  primaryIsCustom?: boolean;
  primaryStatus?: string | null;
}) {
  if (
    options.primaryIsCustom
    && options.primaryHostname
    && options.primaryStatus === "active"
    && !isPlatformHostname(options.primaryHostname)
  ) {
    return `https://${options.primaryHostname}`;
  }
  return getPlatformSiteUrl(options.platformSlug);
}
