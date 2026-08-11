import Link from "next/link";
import { PageHeading } from "@/components/ui/page-heading";
import { AdminSearchForm, formatDateTime } from "@/components/admin/admin-ui";
import { PlanBadge } from "@/components/ui/plan-badge";
import { listAdminSites } from "@/lib/data/admin";

const statusLabels: Record<string, string> = {
  draft: "Koncept",
  ready: "Pripravený",
  payment_pending: "Čaká na platbu",
  published: "Zverejnený",
  suspended: "Pozastavený",
  archived: "Archivovaný",
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AdminSitesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; owner?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const owner = params.owner && uuidPattern.test(params.owner) ? params.owner : undefined;
  const sites = await listAdminSites(query, owner);

  return (
    <>
      <PageHeading
        eyebrow="Weby"
        title="Projekty kandidátov"
        description="Vyhľadávanie podľa slug, mena alebo lokality. V detaile môžete udeliť Basic/Plus a pozastaviť web."
      />

      {owner ? (
        <p className="admin-filter-note" role="status">
          Filtrované podľa vlastníka <code>{owner}</code>.{" "}
          <Link className="admin-inline-link" href="/admin/weby">Zrušiť filter</Link>
        </p>
      ) : null}

      <AdminSearchForm
        action="/admin/weby"
        defaultValue={query}
        label="Hľadať web"
        placeholder="slug, meno kandidáta, lokalita"
        hiddenFields={owner ? { owner } : undefined}
      />

      <div className="admin-table-wrap panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Kandidát</th>
              <th scope="col">Slug</th>
              <th scope="col">Stav</th>
              <th scope="col">Balík</th>
              <th scope="col">Admin hold</th>
              <th scope="col">Upravené</th>
            </tr>
          </thead>
          <tbody>
            {sites.length === 0 ? (
              <tr><td colSpan={6}>Nenašli sa žiadne weby.</td></tr>
            ) : sites.map((site) => (
              <tr key={site.id}>
                <td>
                  <Link className="admin-inline-link" href={`/admin/weby/${site.id}`}>
                    <strong>{site.candidateName || site.internalName}</strong>
                  </Link>
                  <div className="admin-muted">{site.locality}</div>
                </td>
                <td><code>{site.slug}</code></td>
                <td>{statusLabels[site.status] ?? site.status}</td>
                <td><PlanBadge plan={site.planCode} /></td>
                <td>{site.adminHold ? "Áno" : "Nie"}</td>
                <td>{formatDateTime(site.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
