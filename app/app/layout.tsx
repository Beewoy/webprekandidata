import type { ReactNode } from "react";
import { requireCurrentUser } from "@/lib/data/sites";
import { isDemoMode } from "@/lib/env";
import { assertProductionConfig } from "@/lib/production-config";

export default async function ProtectedAppLayout({ children }: { children: ReactNode }) {
  assertProductionConfig();
  if (!isDemoMode()) await requireCurrentUser();
  return children;
}
