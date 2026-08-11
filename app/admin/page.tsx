import { PageHeading } from "@/components/ui/page-heading";
import { AdminMetricCards, formatDateTime } from "@/components/admin/admin-ui";
import { getAdminDashboardMetrics } from "@/lib/data/admin";

export default async function AdminHomePage() {
  const metrics = await getAdminDashboardMetrics();
  const published = metrics.sitesByStatus.published ?? 0;
  const draft = metrics.sitesByStatus.draft ?? 0;
  const suspended = metrics.sitesByStatus.suspended ?? 0;
  const paid = metrics.ordersByStatus.paid ?? 0;
  const pending = metrics.ordersByStatus.pending ?? 0;
  const failed = metrics.ordersByStatus.failed ?? 0;

  return (
    <>
      <PageHeading
        eyebrow="Interný admin"
        title="Prehľad prevádzky"
        description="Základné metriky registrácií, webov, objednávok a posledných auditovaných udalostí."
      />

      <AdminMetricCards
        items={[
          { label: "Registrácie", value: metrics.registrations },
          { label: "Zverejnené weby", value: published, hint: `${draft} konceptov · ${suspended} pozastavených` },
          { label: "Admin hold", value: metrics.adminHolds },
          { label: "Zaplatené objednávky", value: paid, hint: `${pending} pending · ${failed} failed` },
          { label: "AI completed", value: metrics.aiCompleted },
          { label: "AI failed", value: metrics.aiFailed },
        ]}
      />

      <section className="panel admin-section" aria-labelledby="recent-audit-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Incidenty a zásahy</p>
            <h2 id="recent-audit-heading">Posledný audit</h2>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Čas</th>
                <th scope="col">Akcia</th>
                <th scope="col">Cieľ</th>
                <th scope="col">Web</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentAudit.length === 0 ? (
                <tr><td colSpan={4}>Zatiaľ nie sú žiadne auditované udalosti.</td></tr>
              ) : metrics.recentAudit.map((row) => (
                <tr key={row.id}>
                  <td>{formatDateTime(row.createdAt)}</td>
                  <td><code>{row.action}</code></td>
                  <td>{row.targetType}{row.targetId ? ` · ${row.targetId.slice(0, 8)}` : ""}</td>
                  <td>{row.siteId ? row.siteId.slice(0, 8) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
