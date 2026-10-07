import type { Locale } from "@/content";
import { customersContent } from "@/content/customers";
import type { CustomerStatistics } from "./types";
import { date } from "./format";
export function ActivityChart({
  statistics,
  locale,
}: {
  statistics: CustomerStatistics;
  locale: Locale;
}) {
  const c = customersContent[locale];
  const rows = statistics.trend;
  const max = Math.max(1, ...rows.flatMap((r) => [r.visits, r.newCustomers]));
  return (
    <section className="mf-panel mf-customers-chart">
      <div className="mf-panel-heading">
        <h2>{c.trend}</h2>
      </div>
      {!rows.length ? (
        <p>{c.chartEmpty}</p>
      ) : (
        <>
          <div className="mf-chart-legend">
            <span>
              <i />
              {c.visits}
            </span>
            <span>
              <i />
              {c.newCustomers}
            </span>
          </div>
          <div
            className="mf-customer-chart-viewport"
            tabIndex={0}
            role="region"
            aria-label={c.trend}
          >
            <svg viewBox="0 0 700 175" role="img" aria-label={c.trend}>
              <title>{c.trend}</title>
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  <line
                    x1="30"
                    y1={20 + i * 60}
                    x2="690"
                    y2={20 + i * 60}
                    stroke="var(--line)"
                  />
                  <text x="0" y={24 + i * 60} fontSize="10" fill="var(--muted)">
                    {Math.round(max * (1 - i / 2))}
                  </text>
                </g>
              ))}
              {rows.map((r, i) => {
                const step = 650 / rows.length;
                const x = 35 + i * step;
                return (
                  <g key={r.date}>
                    <rect
                      x={x}
                      y={140 - (r.visits / max) * 120}
                      width={step * 0.3}
                      height={(r.visits / max) * 120}
                      rx="2"
                      fill="#718268"
                    />
                    <rect
                      x={x + step * 0.34}
                      y={140 - (r.newCustomers / max) * 120}
                      width={step * 0.3}
                      height={(r.newCustomers / max) * 120}
                      rx="2"
                      fill="var(--accent)"
                    />
                    <text
                      x={x + step * 0.3}
                      y="162"
                      textAnchor="middle"
                      fontSize="10"
                      fill="var(--muted)"
                    >
                      {new Intl.DateTimeFormat(locale, {
                        day: "numeric",
                        month: "short",
                      }).format(new Date(r.date))}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <details>
            <summary>{c.activity}</summary>
            <div className="mf-customers-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{c.period}</th>
                    <th>{c.visits}</th>
                    <th>{c.newCustomers}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.date}>
                      <td>{date(r.date, locale, c.unknown)}</td>
                      <td>{r.visits}</td>
                      <td>{r.newCustomers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
