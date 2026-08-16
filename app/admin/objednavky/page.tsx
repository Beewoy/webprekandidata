import { PageHeading } from "@/components/ui/page-heading";
import { formatCents, formatDateTime, SiteLink } from "@/components/admin/admin-ui";
import { listAdminOrders } from "@/lib/data/admin";
import {
  ADMIN_GRANT_STATUS_LABEL_SHORT,
} from "@/lib/payments/admin-grant";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  paid: "Zaplatená",
  failed: "Zlyhaná",
  refunded: "Refundovaná",
  cancelled: "Zrušená",
};

export default async function AdminOrdersPage() {
  const orders = await listAdminOrders();

  return (
    <>
      <PageHeading
        eyebrow="Objednávky"
        title="Platby a fulfillment"
        description="Read-only prehľad objednávok. Manuálne prepísanie zaplateného stavu ani reprocess webhooku tu nie sú dostupné."
      />

      <div className="admin-table-wrap panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Číslo</th>
              <th scope="col">Vytvorené</th>
              <th scope="col">Web</th>
              <th scope="col">Stav</th>
              <th scope="col">Balík</th>
              <th scope="col">Suma</th>
              <th scope="col">Stripe / Doklad</th>
              <th scope="col">Paid / Fulfilled</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={8}>Zatiaľ nie sú žiadne objednávky.</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id}>
                <td><code>{order.orderNumber}</code></td>
                <td>{formatDateTime(order.createdAt)}</td>
                <td>
                  <SiteLink siteId={order.siteId}>{order.siteName || order.siteSlug || order.siteId.slice(0, 8)}</SiteLink>
                </td>
                <td>
                  {order.isAdminGrant && order.status === "paid"
                    ? ADMIN_GRANT_STATUS_LABEL_SHORT
                    : (statusLabels[order.status] ?? order.status)}
                </td>
                <td>{order.planCode === "plus" ? "Plus" : "Basic"}</td>
                <td>{formatCents(order.totalCents)}</td>
                <td>
                  {order.isAdminGrant ? (
                    <div className="admin-muted">— / admin grant</div>
                  ) : (
                    <>
                      <div className="admin-muted">{order.stripeCheckoutSessionId ?? "—"}</div>
                      <div className="admin-muted">{order.stripeCustomerId ?? ""}</div>
                      {order.invoiceUrl ? (
                        <div>
                          <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">Doklad</a>
                        </div>
                      ) : null}
                    </>
                  )}
                </td>
                <td>
                  <div>{formatDateTime(order.paidAt)}</div>
                  <div className="admin-muted">{formatDateTime(order.fulfilledAt)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
