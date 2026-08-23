import Link from "next/link";
import { PageHeading } from "@/components/ui/page-heading";
import { formatDateTime } from "@/components/admin/admin-ui";
import { formatAdminFeedbackSummary, getAdminFeedbackSubmissions } from "@/lib/data/admin-feedback";

function formatStars(rating: number) {
  return `${rating}/5`;
}

export default async function AdminFeedbackPage() {
  const submissions = await getAdminFeedbackSubmissions();

  return (
    <>
      <PageHeading
        eyebrow="Interný admin"
        title="Spätná väzba"
        description="Odpovede z verejného formulára /spatna-vazba. Stránka nie je indexovaná vo vyhľadávačoch."
      />

      <section className="panel admin-section" aria-labelledby="feedback-list-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Pilot</p>
            <h2 id="feedback-list-heading">Posledné odoslania</h2>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Dátum</th>
                <th scope="col">Hodnotenie</th>
                <th scope="col">Páčilo sa</th>
                <th scope="col">Zlepšiť</th>
                <th scope="col">Komentár</th>
                <th scope="col">Kontakt</th>
                <th scope="col">Web</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr><td colSpan={7}>Zatiaľ nie sú žiadne odoslania.</td></tr>
              ) : submissions.map((row) => {
                const summary = formatAdminFeedbackSummary(row);
                return (
                  <tr key={row.id}>
                    <td>{formatDateTime(row.createdAt)}</td>
                    <td>
                      Celkom {formatStars(row.overallRating)}
                      <br />
                      Editor {formatStars(row.editorRating)}
                      {row.consentPublic ? <><br /><small>Súhlas s referenciou</small></> : null}
                    </td>
                    <td>{summary.highlights}</td>
                    <td>{summary.improvements}</td>
                    <td>{summary.commentPreview}</td>
                    <td>
                      {row.email ?? "—"}
                      {row.userId ? <><br /><small>{row.userId.slice(0, 8)}</small></> : null}
                    </td>
                    <td>
                      {row.siteId ? (
                        <>
                          <Link className="admin-inline-link" href={`/admin/weby/${row.siteId}`}>
                            {row.siteName || row.siteSlug || row.siteId.slice(0, 8)}
                          </Link>
                          {row.siteSlug ? <><br /><small>/{row.siteSlug}</small></> : null}
                        </>
                      ) : "—"}
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
