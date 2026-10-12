import { Gift, RotateCcw, Users, Wallet } from "lucide-react";
import type { Locale } from "@/content";
import { businessResultsContent } from "@/content/business-results";
import type { DashboardOverview } from "./types";
import type { Money } from "@/features/customers/types";
import { money } from "@/features/customers/format";
export function BusinessResultsPanel({
  data,
  locale,
}: {
  data: DashboardOverview;
  locale: Locale;
}) {
  const c = businessResultsContent[locale];
  const results = data.results;
  const number = (value: number | null | undefined) =>
    value == null ? "—" : new Intl.NumberFormat(locale).format(value);
  const amount = (value: Money | null | undefined) =>
    value ? money(value, locale) : "—";
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(value));
  const rows = results?.trend ?? [];
  const max = Math.max(
    1,
    ...rows.flatMap((row) => [row.visits, row.returnedCustomers]),
  );
  const metrics = [
    {
      label: c.revenue,
      value: amount(results?.offerRevenue),
      hint: c.revenueHint,
      Icon: Wallet,
    },
    {
      label: c.returned,
      value: number(results?.returnedCustomers),
      hint: c.returnedHint,
      Icon: RotateCcw,
    },
    {
      label: c.newCustomers,
      value: number(results?.newCustomers),
      hint: c.newHint,
      Icon: Users,
    },
    {
      label: c.redeemed,
      value: number(results?.offersRedeemed),
      hint: c.redeemedHint,
      Icon: Gift,
    },
  ];
  return (
    <section
      className="mf-business-results"
      aria-labelledby="business-results-heading"
    >
      <header className="mf-results-heading">
        <div>
          <h2 id="business-results-heading">{c.title}</h2>
          <p>{c.subtitle}</p>
        </div>
        {results && (
          <span>
            {c.period}: {date(results.period.from)} – {date(results.period.to)}
          </span>
        )}
      </header>
      {data.source === "demo" && results && (
        <p className="mf-results-demo">{c.demo}</p>
      )}
      <div className="mf-results-metrics">
        {metrics.map(({ label, value, hint, Icon }) => (
          <article key={label}>
            <div>
              <span>{label}</span>
              <Icon size={18} aria-hidden="true" />
            </div>
            <strong>{value}</strong>
            <small>{value === "—" ? c.unavailable : hint}</small>
          </article>
        ))}
      </div>
      <div className="mf-results-charts">
        <section className="mf-panel mf-results-trend">
          <div className="mf-panel-heading">
            <h2>{c.trend}</h2>
          </div>
          <div className="mf-results-legend">
            <span>
              <i />
              {c.visits}
            </span>
            <span>
              <i />
              {c.returned}
            </span>
          </div>
          {rows.length ? (
            <>
              <div
                className="mf-results-chart-scroll"
                tabIndex={0}
                role="region"
                aria-label={c.trend}
              >
                <svg viewBox="0 0 680 210" role="img" aria-label={c.trend}>
                  <title>{c.trend}</title>
                  {[0, 1, 2, 3].map((i) => (
                    <g key={i}>
                      <line
                        x1="38"
                        x2="670"
                        y1={20 + i * 50}
                        y2={20 + i * 50}
                        stroke="var(--line)"
                      />
                      <text
                        x="0"
                        y={24 + i * 50}
                        fontSize="10"
                        fill="var(--muted)"
                      >
                        {Math.round(max * (1 - i / 3))}
                      </text>
                    </g>
                  ))}
                  {rows.map((row, i) => {
                    const step = 620 / rows.length;
                    const x = 44 + i * step;
                    return (
                      <g key={row.date}>
                        <title>
                          {date(row.date)}: {c.visits} {row.visits};{" "}
                          {c.returned} {row.returnedCustomers}
                        </title>
                        <rect
                          x={x}
                          y={170 - (row.visits / max) * 150}
                          width={step * 0.32}
                          height={(row.visits / max) * 150}
                          rx="3"
                          fill="#718268"
                        />
                        <rect
                          x={x + step * 0.36}
                          y={170 - (row.returnedCustomers / max) * 150}
                          width={step * 0.32}
                          height={(row.returnedCustomers / max) * 150}
                          rx="3"
                          fill="#cb7849"
                        />
                        {(rows.length <= 8 ||
                          i % Math.ceil(rows.length / 8) === 0) && (
                          <text
                            x={x + step * 0.34}
                            y="195"
                            fontSize="10"
                            textAnchor="middle"
                            fill="var(--muted)"
                          >
                            {date(row.date)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
              <details className="mf-results-table">
                <summary>{c.table}</summary>
                <div>
                  <table>
                    <thead>
                      <tr>
                        <th>{c.date}</th>
                        <th>{c.visits}</th>
                        <th>{c.returned}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.date}>
                          <td>{date(row.date)}</td>
                          <td>{number(row.visits)}</td>
                          <td>{number(row.returnedCustomers)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          ) : (
            <div className="mf-results-chart-empty">
              <div aria-hidden="true" />
              <p>{c.emptyChart}</p>
            </div>
          )}
        </section>
        <section className="mf-panel mf-results-impact">
          <div className="mf-panel-heading">
            <h2>{c.performance}</h2>
          </div>
          <dl>
            <div>
              <dt>{c.offerRevenue}</dt>
              <dd>{amount(results?.offerRevenue)}</dd>
            </div>
            <div>
              <dt>{c.returnRevenue}</dt>
              <dd>{amount(results?.returnRevenue)}</dd>
            </div>
            <div>
              <dt>{c.redeemed}</dt>
              <dd>{number(results?.offersRedeemed)}</dd>
            </div>
          </dl>
          <p>
            {results?.offerRevenue || results?.returnRevenue
              ? c.attribution
              : c.salesMissing}
          </p>
          {results?.offersRedeemed == null && (
            <small>{c.emptyPerformance}</small>
          )}
        </section>
      </div>
    </section>
  );
}
