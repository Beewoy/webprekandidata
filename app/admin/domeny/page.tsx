import { PageHeading } from "@/components/ui/page-heading";
import { formatDateTime, SiteLink } from "@/components/admin/admin-ui";
import { listAdminDomains } from "@/lib/data/admin";

export default async function AdminDomainsPage() {
  const domains = await listAdminDomains();

  return (
    <>
      <PageHeading
        eyebrow="Domény"
        title="Hostname a DNS stav"
        description="Hostname, typ a stav overenia. Custom domény spravuje kandidát v editore; platformové subdomény sú rezervácie pre budúci wildcard."
      />

      <div className="admin-table-wrap panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Hostname</th>
              <th scope="col">Web</th>
              <th scope="col">Typ</th>
              <th scope="col">Stav</th>
              <th scope="col">Primárna</th>
              <th scope="col">Overené</th>
            </tr>
          </thead>
          <tbody>
            {domains.length === 0 ? (
              <tr><td colSpan={6}>Zatiaľ nie sú evidované žiadne domény.</td></tr>
            ) : domains.map((domain) => (
              <tr key={domain.id}>
                <td><code>{domain.hostname}</code></td>
                <td>
                  <SiteLink siteId={domain.siteId}>{domain.siteName || domain.siteSlug || domain.siteId.slice(0, 8)}</SiteLink>
                </td>
                <td>{domain.domainType === "custom" ? "Vlastná" : "Subdoména"}</td>
                <td>{domain.status}</td>
                <td>{domain.isPrimary ? "Áno" : "Nie"}</td>
                <td>{formatDateTime(domain.verifiedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
