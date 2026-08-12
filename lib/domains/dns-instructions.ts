import { isApexHostname } from "./hostname";

export type DnsRecordInstruction = {
  name: string;
  type: "A" | "AAAA" | "CNAME" | "TXT";
  value: string;
  purpose: "routing" | "verification";
};

const VERCEL_A = "76.76.21.21";
const VERCEL_CNAME = "cname.vercel-dns.com";

/** Relative DNS name for registrar UI (Websupport atď.). */
export function relativeDnsName(recordHost: string, hostname: string) {
  const host = recordHost.trim().toLowerCase().replace(/\.$/, "");
  const apex = hostname.trim().toLowerCase().replace(/\.$/, "");
  if (!host || host === apex || host === "@") return "@";
  if (host.endsWith(`.${apex}`)) return host.slice(0, -(apex.length + 1)) || "@";
  return host;
}

/** Always-visible routing records when provider metadata is empty. */
export function defaultDnsInstructions(hostname: string): DnsRecordInstruction[] {
  if (isApexHostname(hostname)) {
    return [{ name: "@", type: "A", value: VERCEL_A, purpose: "routing" }];
  }
  const label = hostname.split(".")[0] ?? hostname;
  return [{ name: label, type: "CNAME", value: VERCEL_CNAME, purpose: "routing" }];
}

export function ensureDnsInstructions(
  hostname: string,
  records: DnsRecordInstruction[],
): DnsRecordInstruction[] {
  if (records.length > 0) return records;
  return defaultDnsInstructions(hostname);
}
