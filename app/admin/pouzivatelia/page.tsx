import Link from "next/link";
import { PageHeading } from "@/components/ui/page-heading";
import { AdminSearchForm, formatDateTime } from "@/components/admin/admin-ui";
import { GrantPlanDialog } from "@/components/admin/grant-plan-dialog";
import { searchAdminUsers } from "@/lib/data/admin";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const users = await searchAdminUsers(query);

  return (
    <>
      <PageHeading
        eyebrow="Používatelia"
        title="Účty kandidátov"
        description="Vyhľadávanie podľa e-mailu, mena alebo ID. Balík Basic alebo Plus udelíte priamo ikonkou pri účte."
      />

      <AdminSearchForm
        action="/admin/pouzivatelia"
        defaultValue={query}
        label="Hľadať používateľa"
        placeholder="e-mail, meno alebo UUID"
      />

      <div className="admin-table-wrap panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Meno</th>
              <th scope="col">E-mail</th>
              <th scope="col">Rola</th>
              <th scope="col">Overenie</th>
              <th scope="col">Weby</th>
              <th scope="col">Registrácia</th>
              <th scope="col">Akcie</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={7}>Nenašli sa žiadni používatelia.</td></tr>
            ) : users.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName || "—"}</td>
                <td>{user.email}</td>
                <td>{user.role === "admin" ? "admin" : "kandidát"}</td>
                <td>{user.emailVerifiedAt ? "Overený" : "Neoverený"}</td>
                <td>
                  {user.siteCount > 0 ? (
                    <Link className="admin-inline-link" href={`/admin/weby?owner=${user.id}`}>
                      {user.siteCount}
                    </Link>
                  ) : "0"}
                </td>
                <td>{formatDateTime(user.createdAt)}</td>
                <td>
                  <div className="admin-row-actions">
                    <GrantPlanDialog
                      trigger="icon"
                      accountLabel={user.fullName || user.email}
                      sites={user.sites}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
