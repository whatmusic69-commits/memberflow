"use client";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { Plus, ArrowRight, QrCode, Search } from "lucide-react";
import { useWorkspace } from "@/features/dashboard/workspace";
import { OverviewSkeleton } from "@/features/dashboard/overview";
import { dashboardContent } from "@/content/dashboard";
import { customersContent } from "@/content/customers";
import { moduleContent } from "@/content/modules";
import { ModuleEditor } from "@/features/workspace/module-editor";
import { useCustomers } from "./use-customers";
import { ActivityChart } from "./activity-chart";
import { date, money } from "./format";
import type { CustomerPeriod, CustomerSegment } from "./types";
export function CustomersPage() {
  const {
    data,
    locale,
    can,
    href,
    loading,
    error,
    reload: reloadWorkspace,
  } = useWorkspace();
  const c = customersContent[locale];
  const [period, setPeriod] = useState<CustomerPeriod>(30);
  const [segment, setSegment] = useState<CustomerSegment>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [archived, setArchived] = useState(false);
  const [editor, setEditor] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const {
    directory,
    pending,
    error: failed,
    reload,
  } = useCustomers({ period, segment, search: deferredSearch, page, archived });
  if (loading) return <OverviewSkeleton />;
  if (!can("customer.read"))
    return <h1>{dashboardContent[locale].accessDenied}</h1>;
  if (error || !data)
    return (
      <section role="alert">
        <p>{c.error}</p>
        <button className="button" onClick={reloadWorkspace}>
          {c.retry}
        </button>
      </section>
    );
  const profileHref = (id: string) =>
    href("customers").replace("?", `/${encodeURIComponent(id)}?`);
  return (
    <div className="mf-customers-page">
      <header className="mf-feature-heading">
        <div>
          <p className="mf-kicker">{data.business.name}</p>
          <h1>{c.title}</h1>
          <p>{c.intro}</p>
        </div>
        {can("customer.create") && (
          <button
            className="button button-primary"
            onClick={() => setEditor(true)}
          >
            <Plus size={16} />
            {c.add}
          </button>
        )}
      </header>
      <div className="mf-customers-controls">
        <label>
          {c.period}
          <select
            value={period}
            onChange={(e) =>
              setPeriod(Number(e.target.value) as CustomerPeriod)
            }
          >
            {([7, 30, 90] as const).map((n) => (
              <option key={n} value={n}>
                {c.days.replace("{n}", String(n))}
              </option>
            ))}
          </select>
        </label>
        <Link
          className="mf-text-link"
          href={href("customers").replace("?", "/connection?")}
        >
          <QrCode size={16} />
          {c.connect}
          <ArrowRight size={14} />
        </Link>
      </div>
      {failed ? (
        <section className="mf-panel" role="alert">
          <p>{c.error}</p>
          <button className="button" onClick={reload}>
            {c.retry}
          </button>
        </section>
      ) : !directory ? (
        <>
          <span role="status" className="sr-only">
            {c.load}
          </span>
          <OverviewSkeleton />
        </>
      ) : (
        <>
          <section className="mf-customer-stats" aria-label={c.activity}>
            {(
              [
                [c.total, directory.statistics.totalCustomers],
                [c.newCustomers, directory.statistics.newCustomers],
                [c.visits, directory.statistics.visits],
                [c.returningCustomers, directory.statistics.returningCustomers],
                [c.inactiveCustomers, directory.statistics.inactiveCustomers],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{new Intl.NumberFormat(locale).format(value)}</strong>
              </div>
            ))}
          </section>
          <div className="mf-customer-insights">
            <ActivityChart statistics={directory.statistics} locale={locale} />
            <section className="mf-panel mf-customer-sales">
              <p className="mf-kicker">{c.sales}</p>
              <strong>{money(directory.statistics.netSales, locale)}</strong>
              <small>{c.days.replace("{n}", String(period))}</small>
              {directory.statistics.salesSource === "NOT_CONNECTED" && (
                <p>{c.salesMissing}</p>
              )}
            </section>
          </div>
          <section className="mf-panel mf-customers-list" aria-busy={pending}>
            <div className="mf-panel-heading">
              <h2>{c.directory}</h2>
              <span>
                {c.results.replace("{n}", String(directory.totalResults))}
              </span>
            </div>
            <div className="mf-campaign-toolbar">
              <div className="mf-filter-tabs">
                {(["all", "returning", "inactive"] as const).map((s) => (
                  <button
                    key={s}
                    aria-pressed={!archived && segment === s}
                    onClick={() => {
                      setSegment(s);
                      setArchived(false);
                      setPage(1);
                    }}
                  >
                    {c[s]}
                  </button>
                ))}
                <button
                  aria-pressed={archived}
                  onClick={() => {
                    setArchived(true);
                    setSegment("all");
                    setPage(1);
                  }}
                >
                  {moduleContent[locale].archived}
                </button>
              </div>
              <label className="mf-search-field">
                <Search size={16} />
                <input
                  type="search"
                  aria-label={c.search}
                  placeholder={c.search}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
            </div>
            {!directory.customers.length ? (
              <div className="mf-customers-empty">
                <h3>
                  {search || segment !== "all" || archived
                    ? c.noResults
                    : c.noCustomers}
                </h3>
                {!search && segment === "all" && !archived && <p>{c.empty}</p>}
              </div>
            ) : (
              <div className="mf-client-rows">
                {directory.customers.map((customer) => (
                  <Link
                    className="mf-client-row"
                    key={customer.id}
                    href={profileHref(customer.id)}
                  >
                    <span className="mf-user-avatar">
                      {customer.name.slice(0, 1)}
                    </span>
                    <div className="mf-client-identity">
                      <strong>{customer.name}</strong>
                      <small>
                        {customer.email || customer.phone || c.unknown}
                      </small>
                      <span className="mf-status">
                        {c.states[customer.state]}
                      </span>
                    </div>
                    <div>
                      <small>{c.lastVisit}</small>
                      <span>{date(customer.lastVisitAt, locale, c.never)}</span>
                    </div>
                    <div>
                      <small>{c.visitCount}</small>
                      <span>{customer.visitCount ?? "—"}</span>
                    </div>
                    <div>
                      <small>{c.spending}</small>
                      <span>{money(customer.spending, locale)}</span>
                    </div>
                    <ArrowRight size={16} aria-label={c.profile} />
                  </Link>
                ))}
              </div>
            )}
            {directory.totalResults > directory.pageSize && (
              <nav className="mf-customer-pagination" aria-label={c.directory}>
                <button
                  className="button"
                  disabled={page === 1}
                  onClick={() => setPage((n) => n - 1)}
                >
                  {c.previous}
                </button>
                <span>{c.page.replace("{page}", String(page))}</span>
                <button
                  className="button"
                  disabled={page * directory.pageSize >= directory.totalResults}
                  onClick={() => setPage((n) => n + 1)}
                >
                  {c.next}
                </button>
              </nav>
            )}
          </section>
        </>
      )}
      {editor && (
        <ModuleEditor
          feature="customers"
          offers={[]}
          onClose={() => setEditor(false)}
          onSaved={() => {
            setEditor(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
