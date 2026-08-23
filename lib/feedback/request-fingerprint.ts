import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

export async function getRequestFingerprint() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
  return createHash("sha256").update(ip).digest("hex");
}
