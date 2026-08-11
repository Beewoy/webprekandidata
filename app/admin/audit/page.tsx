import { PageHeading } from "@/components/ui/page-heading";
import { formatDateTime, SiteLink } from "@/components/admin/admin-ui";
import { listAdminAuditLogs } from "@/lib/data/admin";

export default async function AdminAuditPage() {
  const rows = await listAdminAuditLogs();

  return (
    <>
      <PageHeading
        eyebrow="Audit"
        title="Chronologický log"
        description="Administrátorské zásahy, publikovanie, overenia a ďalšie citlivé operácie."
      />

      <div className="admin-table-wrap panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Čas</th>
              <th scope="col">Akcia</th>
              <th scope="col">Actor</th>
              <th scope="col">Web</th>
              <th scope="col">Cieľ</th>
              <th scope="col">Metadata</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6}>Audit je prázdny.</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id}>
                <td>{formatDateTime(row.createdAt)}</td>
                <td><code>{row.action}</code></td>
                <td>{row.actorUserId ? row.actorUserId.slice(0, 8) : "—"}</td>
                <td>
                  {row.siteId ? <SiteLink siteId={row.siteId}>{row.siteId.slice(0, 8)}</SiteLink> : "—"}
                </td>
                <td>{row.targetType}{row.targetId ? ` · ${row.targetId.slice(0, 8)}` : ""}</td>
                <td>
                  <pre className="admin-json">{JSON.stringify(row.metadata ?? {}, null, 0)}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
