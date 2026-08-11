import { ProjectsOverview } from "@/components/projects/projects-overview";
import { getEmailVerificationStatus } from "@/lib/data/account";
import { getSites } from "@/lib/data/sites";

export default async function AppIndex({ searchParams }: { searchParams: Promise<{ email?: string; welcome?: string }> }) {
  const [sites, verification, query] = await Promise.all([
    getSites(),
    getEmailVerificationStatus(),
    searchParams,
  ]);

  return <ProjectsOverview sites={sites} verification={verification} emailNotice={query.email} showWelcome={query.welcome === "1"} />;
}
