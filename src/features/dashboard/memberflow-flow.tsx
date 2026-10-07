import { Check, Circle, LockKeyhole, ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { Locale } from "@/content";
import type { DashboardContent } from "@/content/dashboard";
import type { LifecycleSummary } from "./types";
import { lifecycleStages } from "./overview-model";
export function MemberFlowFlow({
  lifecycle,
  c,
  locale,
  periodLabel,
}: {
  lifecycle: LifecycleSummary;
  c: DashboardContent;
  locale: Locale;
  periodLabel?: string;
}) {
  const current = lifecycleStages.findIndex(
    (stage) => lifecycle.stages[stage].state === "current",
  );
  const lastCompleted = lifecycleStages.reduce(
    (last, key, i) => (lifecycle.stages[key].state === "completed" ? i : last),
    0,
  );
  const destination =
    lifecycle.mode === "active" ? 3 : current >= 0 ? current : lastCompleted;
  return (
    <section
      className="mf-lifecycle"
      data-mode={lifecycle.mode}
      aria-label={c.flow}
      style={{ "--flow-destination": destination } as CSSProperties}
    >
      <div className="mf-panel-heading">
        <h2>{c.flow}</h2>
        {lifecycle.mode === "active" && (
          <span>
            {periodLabel ??
              c.periodDays.replace("{n}", String(lifecycle.period))}
          </span>
        )}
      </div>
      <ol>
        {lifecycleStages.map((key, i) => {
          const stage = lifecycle.stages[key];
          const status =
            stage.state === "completed"
              ? c.complete
              : stage.state === "current"
                ? c.next
                : stage.state === "waiting"
                  ? c.waiting
                  : c.pending;
          return (
            <li
              key={key}
              className={`mf-lifecycle-${stage.state}`}
              aria-current={stage.state === "current" ? "step" : undefined}
            >
              {i === 0 && (
                <span className="mf-lifecycle-signal" aria-hidden="true" />
              )}
              <span className="mf-lifecycle-point" aria-hidden="true">
                {stage.state === "completed" ? (
                  <Check size={12} />
                ) : stage.state === "waiting" ? (
                  <LockKeyhole size={10} />
                ) : (
                  <Circle size={7} />
                )}
              </span>
              <span className="mf-kicker">{c.flowStages[i]}</span>
              {lifecycle.mode === "active" ? (
                <>
                  <strong>
                    {stage.value === null
                      ? "—"
                      : new Intl.NumberFormat(locale).format(stage.value)}
                  </strong>
                  <small>
                    {stage.value === null ? c.noMetric : c.metrics[i]}
                  </small>
                </>
              ) : (
                <>
                  <strong>{c.setupFlowCopy[i]}</strong>
                  <small>{status}</small>
                </>
              )}
              {i < 3 && (
                <ArrowRight
                  className="mf-lifecycle-arrow"
                  size={14}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
