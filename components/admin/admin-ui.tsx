import Link from "next/link";
import type { ReactNode } from "react";

export function AdminSearchForm({
  action,
  defaultValue,
  label,
  placeholder,
  hiddenFields,
}: {
  action: string;
  defaultValue?: string;
  label: string;
  placeholder: string;
  hiddenFields?: Record<string, string>;
}) {
  return (
    <form className="admin-search" action={action} method="get" role="search">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))
        : null}
      <label className="field">
        <span>{label}</span>
        <input type="search" name="q" defaultValue={defaultValue} placeholder={placeholder} autoComplete="off" />
      </label>
      <button className="button button--secondary" type="submit">Hľadať</button>
    </form>
  );
}

export function AdminTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: string;
}) {
  return (
    <div className="admin-table-wrap panel">
      <table className="admin-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {!children && empty ? <p className="admin-empty">{empty}</p> : null}
    </div>
  );
}

export function AdminMetricCards({
  items,
}: {
  items: { label: string; value: string | number; hint?: string }[];
}) {
  return (
    <div className="admin-metrics">
      {items.map((item) => (
        <article className="admin-metric panel" key={item.label}>
          <p className="eyebrow">{item.label}</p>
          <strong>{item.value}</strong>
          {item.hint ? <small>{item.hint}</small> : null}
        </article>
      ))}
    </div>
  );
}

export function formatCents(cents: number) {
  return new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("sk-SK", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SiteLink({ siteId, children }: { siteId: string; children: ReactNode }) {
  return <Link className="text-link admin-inline-link" href={`/admin/weby/${siteId}`}>{children}</Link>;
}
