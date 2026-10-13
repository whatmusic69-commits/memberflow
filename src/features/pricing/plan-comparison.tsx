import { Fragment } from "react";
import {
  Check,
  Users,
  Heart,
  Sparkles,
  Settings2,
  ArrowLeftRight,
} from "lucide-react";
import type { Locale } from "@/content";
import type { Plan } from "@/features/onboarding/types";
import { developmentComparisonFeatures } from "@/config/plans";
import { publicSiteContent } from "@/content/public-site";
import "@/features/public-site/public-site.css";
export function PlanComparison({
  plans,
  locale,
  localCatalog,
}: {
  plans: Plan[];
  locale: Locale;
  localCatalog: boolean;
}) {
  const c = publicSiteContent[locale];
  function value(plan: Plan, row: number) {
    if (row < 2) {
      const limit = plan.limits?.[row === 0 ? "activeCustomers" : "locations"];
      return limit === undefined
        ? c.unknown
        : new Intl.NumberFormat(locale).format(limit);
    }
    const index = localCatalog
      ? developmentComparisonFeatures[plan.id]?.[row]
      : undefined;
    return index === undefined
      ? c.unknown
      : (plan.features[index] ?? c.unknown);
  }
  const groups = [
    { label: c.comparisonLabels[2], Icon: Users, rows: [0, 1] },
    { label: c.comparisonLabels[3], Icon: Heart, rows: [2, 3, 4, 6, 7] },
    { label: c.comparisonLabels[4], Icon: Sparkles, rows: [5, 9, 14] },
    {
      label: c.comparisonLabels[5],
      Icon: Settings2,
      rows: [8, 10, 11, 12, 13],
    },
  ];
  return (
    <>
      <section className="plan-comparison">
        <header className="comparison-heading">
          <div>
            <p className="eyebrow">
              <span className="status-dot" />
              {c.comparisonLabels[0]}
            </p>
            <h2>{c.comparisonTitle}</h2>
          </div>
          <p className="public-note" id="comparison-note">
            {c.comparisonNote}
          </p>
        </header>
        <p className="comparison-scroll-hint">
          <ArrowLeftRight size={14} aria-hidden="true" />
          {c.comparisonScrollHint}
        </p>
        <div
          className="comparison-scroll"
          tabIndex={0}
          role="region"
          aria-label={c.comparisonTitle}
        >
          <table aria-describedby="comparison-note">
            <caption className="sr-only">{c.comparisonLabels[0]}</caption>
            <colgroup>
              <col className="comparison-label-column" />
              {plans.map((p) => (
                <col
                  key={p.id}
                  className={`comparison-plan-column comparison-plan-${p.id}`}
                />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="comparison-corner">
                  {c.comparisonLabels[1]}
                </th>
                {plans.map((p) => (
                  <th
                    scope="col"
                    key={p.id}
                    className={`comparison-plan-header comparison-plan-${p.id}`}
                  >
                    <strong>{p.name}</strong>
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map(({ label, Icon, rows }) => (
              <tbody key={label}>
                <tr className="comparison-group">
                  <th scope="rowgroup">
                    <Icon size={16} aria-hidden="true" />
                    {label}
                  </th>
                  {plans.map((plan) => (
                    <td
                      key={plan.id}
                      className={`comparison-plan-${plan.id}`}
                      aria-hidden="true"
                    />
                  ))}
                </tr>
                {rows.map((row) => (
                  <tr key={row}>
                    <th scope="row">{c.comparisonRows[row]}</th>
                    {plans.map((plan) => {
                      const display = value(plan, row),
                        unknown = display === c.unknown;
                      return (
                        <td
                          key={plan.id}
                          className={`comparison-plan-${plan.id}`}
                          data-state={
                            unknown ? "unknown" : row < 2 ? "limit" : "included"
                          }
                        >
                          {unknown ? (
                            <span
                              className="comparison-unknown"
                              title={display}
                            >
                              <span aria-hidden="true">—</span>
                              <span className="sr-only">{display}</span>
                            </span>
                          ) : row < 2 ? (
                            <strong className="comparison-limit">
                              {display}
                            </strong>
                          ) : (
                            <span
                              className="comparison-included"
                              title={display}
                            >
                              <span className="comparison-check">
                                <Check size={13} aria-hidden="true" />
                              </span>
                              <span
                                className={
                                  row === 7
                                    ? "comparison-feature-detail"
                                    : "sr-only"
                                }
                              >
                                {display}
                              </span>
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            ))}
            <tbody>
              <tr className="comparison-catalog">
                <th scope="row">{c.planFeatures}</th>
                {plans.map((plan) => (
                  <td key={plan.id} className={`comparison-plan-${plan.id}`}>
                    <details>
                      <summary>{c.planFeatures}</summary>
                      <ul>
                        {plan.features.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </details>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="public-faq">
        <h2>{c.pricingFaqTitle}</h2>
        {c.pricingFaq.map(([q, a]) => (
          <Fragment key={q}>
            <details>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          </Fragment>
        ))}
      </section>
    </>
  );
}
