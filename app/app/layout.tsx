import type { ReactNode } from "react";
import { isDemoMode } from "@/lib/env";
import { requireCurrentUser } from "@/lib/data/sites";

export default async function ProtectedAppLayout({ children }: { children: ReactNode }) {
  if (!isDemoMode()) await requireCurrentUser();
  return children;
}
