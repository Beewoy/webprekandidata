const HOSTNAME_RE = /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function normalizeHostname(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");
}

export function isValidHostname(hostname: string) {
  if (!hostname || hostname.length > 253) return false;
  if (hostname.includes(":") || hostname.includes("/") || hostname.includes(" ")) return false;
  if (hostname === "localhost" || hostname.endsWith(".localhost")) return false;
  return HOSTNAME_RE.test(hostname);
}

export function isApexHostname(hostname: string) {
  const parts = hostname.split(".").filter(Boolean);
  return parts.length === 2;
}

/** Strip port from Host header for comparisons. */
export function hostWithoutPort(host: string) {
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    return end >= 0 ? host.slice(0, end + 1) : host;
  }
  const colon = host.lastIndexOf(":");
  if (colon > -1 && /^\d+$/.test(host.slice(colon + 1))) {
    return host.slice(0, colon);
  }
  return host;
}
