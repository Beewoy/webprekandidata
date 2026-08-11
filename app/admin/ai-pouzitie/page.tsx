import { PageHeading } from "@/components/ui/page-heading";
import { formatCents, formatDateTime, SiteLink } from "@/components/admin/admin-ui";
import { listAdminAiUsage } from "@/lib/data/admin";

export default async function AdminAiUsagePage() {
  const rows = await listAdminAiUsage();

  return (
    <>
      <PageHeading
        eyebrow="AI použitie"
        title="Generovania a kvóty"
        description="Agregované metadata bez promptov a výstupov. Fingerprint ani obsah sa tu nezobrazujú."
      />

      <div className="admin-table-wrap panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Čas</th>
              <th scope="col">Web</th>
              <th scope="col">Úloha</th>
              <th scope="col">Model</th>
              <th scope="col">Stav</th>
              <th scope="col">Tokeny</th>
              <th scope="col">Odhad</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7}>Zatiaľ nie sú žiadne AI záznamy.</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id}>
                <td>{formatDateTime(row.createdAt)}</td>
                <td><SiteLink siteId={row.siteId}>{row.siteId.slice(0, 8)}</SiteLink></td>
                <td>{row.taskType}</td>
                <td>
                  <div>{row.model}</div>
                  <div className="admin-muted">{row.provider}</div>
                </td>
                <td>
                  {row.status}
                  {row.safetyCategory ? <div className="admin-muted">{row.safetyCategory}</div> : null}
                </td>
                <td>
                  {row.inputTokens ?? "—"} / {row.outputTokens ?? "—"}
                </td>
                <td>{row.estimatedCostCents != null ? formatCents(row.estimatedCostCents) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
