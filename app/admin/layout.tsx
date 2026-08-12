import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { requirePlatformAdmin } from "@/lib/data/admin";
import { isDemoMode } from "@/lib/env";
import { assertProductionConfig } from "@/lib/production-config";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  assertProductionConfig();
  if (isDemoMode()) {
    return (
      <main className="projects-shell">
        <div className="projects-container">
          <PageHeading
            eyebrow="Admin"
            title="Administrácia nie je dostupná"
            description="Interný admin vyžaduje produkčné pripojenie k Supabase. V ukážkovom (demo) režime nie je táto časť zapnutá."
          />
        </div>
      </main>
    );
  }

  const profile = await requirePlatformAdmin();
  return <AdminShell fullName={profile.fullName}>{children}</AdminShell>;
}
