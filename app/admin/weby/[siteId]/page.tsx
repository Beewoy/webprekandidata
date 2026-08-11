import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/ui/page-heading";
import { PlanBadge } from "@/components/ui/plan-badge";
import { GrantPlanDialog } from "@/components/admin/grant-plan-dialog";
import { SiteHoldDialog } from "@/components/admin/site-hold-dialog";
import { formatDateTime } from "@/components/admin/admin-ui";
import { getAdminSiteDetail } from "@/lib/data/admin";
import {
  adminHoldCategoryLabels,
  adminHoldScopeLabels,
} from "@/lib/validation/admin";

const statusLabels: Record<string, string> = {
  draft: "Koncept",
  ready: "Pripravený",
  payment_pending: "Čaká na platbu",
  published: "Zverejnený",
  suspended: "Pozastavený",
  archived: "Archivovaný",
};

function metadataString(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

export default async function AdminSiteDetailPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const site = await getAdminSiteDetail(siteId);
  if (!site) notFound();

  return (
    <>
      <PageHeading
        eyebrow="Detail webu"
        title={site.candidateName || site.internalName}
        description={`${site.locality || "Bez lokality"} · ${site.slug}.webprekandidata.sk`}
        action={(
          <div className="admin-heading-actions">
            <GrantPlanDialog
              accountLabel={site.ownerFullName || site.candidateName || site.internalName}
              sites={[{
                id: site.id,
                name: site.candidateName || site.internalName,
                planCode: site.planCode,
              }]}
            />
            <SiteHoldDialog siteId={site.id} siteName={site.candidateName || site.internalName} hold={site.adminHold} />
          </div>
        )}
      />

      <div className="admin-detail-grid">
        <section className="panel admin-section" aria-labelledby="site-state-heading">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Stav</p>
              <h2 id="site-state-heading">Technický prehľad</h2>
            </div>
            <PlanBadge plan={site.planCode} />
          </div>
          <dl className="admin-dl">
            <div><dt>Stav</dt><dd>{statusLabels[site.status] ?? site.status}</dd></div>
            <div><dt>Admin hold</dt><dd>{site.adminHold ? `Áno · ${formatDateTime(site.adminHoldAt)}` : "Nie"}</dd></div>
            <div><dt>Vlastník</dt><dd>{site.ownerFullName || site.ownerUserId}</dd></div>
            <div><dt>Publikácia</dt><dd>{site.currentPublicationId ? site.currentPublicationId.slice(0, 8) : "Žiadna"}</dd></div>
            <div>
              <dt>Verejná cesta</dt>
              <dd>
                {site.status === "published" && !site.adminHold ? (
                  <Link className="admin-inline-link" href={`/${site.slug}`} target="_blank" rel="noreferrer">/{site.slug}</Link>
                ) : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="panel admin-section" aria-labelledby="site-preview-heading">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Read-only</p>
              <h2 id="site-preview-heading">Náhľad obsahu konceptu</h2>
            </div>
          </div>
          <dl className="admin-dl">
            <div><dt>Meno v koncepte</dt><dd>{site.draftSummary.candidateName || "—"}</dd></div>
            <div><dt>Lokalita</dt><dd>{site.draftSummary.locality || "—"}</dd></div>
            <div><dt>Pozícia</dt><dd>{site.draftSummary.position || "—"}</dd></div>
            <div><dt>O mne</dt><dd>{site.draftSummary.aboutPreview || "Bez textu"}</dd></div>
          </dl>
        </section>
      </div>

      <section className="panel admin-section" aria-labelledby="site-audit-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">História</p>
            <h2 id="site-audit-heading">Audit tohto webu</h2>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Čas</th>
                <th scope="col">Akcia</th>
                <th scope="col">Detail</th>
              </tr>
            </thead>
            <tbody>
              {site.recentAudit.length === 0 ? (
                <tr><td colSpan={3}>Zatiaľ bez auditovaných udalostí.</td></tr>
              ) : site.recentAudit.map((row) => {
                const category = metadataString(row.metadata, "category");
                const scope = metadataString(row.metadata, "scope");
                const reason = metadataString(row.metadata, "reason");
                return (
                  <tr key={row.id}>
                    <td>{formatDateTime(row.createdAt)}</td>
                    <td><code>{row.action}</code></td>
                    <td>
                      {reason ? <div>{reason}</div> : null}
                      {category ? (
                        <div className="admin-muted">
                          {adminHoldCategoryLabels[category as keyof typeof adminHoldCategoryLabels] ?? category}
                        </div>
                      ) : null}
                      {scope ? (
                        <div className="admin-muted">
                          {adminHoldScopeLabels[scope as keyof typeof adminHoldScopeLabels] ?? scope}
                        </div>
                      ) : null}
                      {!reason && !category ? "—" : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
