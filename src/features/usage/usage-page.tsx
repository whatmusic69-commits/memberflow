"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useWorkspace } from "@/features/dashboard/workspace";
import { usageContent } from "@/content/usage";
import { onboardingContent } from "@/content/onboarding";
import { dashboardContent } from "@/content/dashboard";
import { useUsage } from "./use-usage";
import { usageService } from "./service";
import { usageState, type UsageMetric, type UsagePlan } from "./types";
import type { Locale } from "@/content";
function resource(key: string, locale: Locale) {
  const names: Record<string, string> = usageContent[locale].resources;
  return names[key] ?? key;
}
function price(plan: UsagePlan, locale: Locale) {
  const c = usageContent[locale];
  return plan.price === null
    ? c.custom
    : `${new Intl.NumberFormat(locale, { style: "currency", currency: plan.currency, maximumFractionDigits: 2 }).format(plan.price)} / ${c[plan.interval]}`;
}
export function UsageMeter({
  metric,
  locale,
  planName,
  upgradeHref,
  showNotice = true,
}: {
  metric: UsageMetric;
  locale: Locale;
  planName: string;
  upgradeHref?: string;
  showNotice?: boolean;
}) {
  const c = usageContent[locale];
  const s = usageState(metric);
  const label = resource(metric.key, locale);
  return (
    <div className={`mf-usage-metric mf-usage-${s.state}`}>
      <div className="mf-usage-metric-heading">
        <strong>{label}</strong>
        <span>
          {new Intl.NumberFormat(locale).format(s.used)} /{" "}
          {metric.limit === null
            ? c.unlimited
            : metric.limit === undefined
              ? c.unknown
              : new Intl.NumberFormat(locale).format(metric.limit)}
        </span>
      </div>
      {s.limit !== null && (
        <progress
          max={s.limit || 1}
          value={s.limit === 0 ? 1 : Math.min(s.used, s.limit)}
          aria-label={label}
        />
      )}
      {s.remaining !== null && (
        <small>
          {c.remaining.replace(
            "{n}",
            new Intl.NumberFormat(locale).format(s.remaining),
          )}
        </small>
      )}
      {showNotice && s.state !== "normal" && (
        <div className="mf-usage-notice">
          <p>
            {s.limitReached
              ? c.reached.replace("{resource}", label)
              : c.warning.replace("{plan}", planName)}
          </p>
          {upgradeHref && (
            <Link className="mf-text-link" href={upgradeHref}>
              {c.upgrade}
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
export function UsageSummary() {
  const { locale, href, can } = useWorkspace();
  const { usage } = useUsage();
  const c = usageContent[locale];
  if (!can("billing.read") || !usage) return null;
  return (
    <section className="mf-panel mf-usage-summary">
      <div>
        <small>{c.current}</small>
        <strong>{usage.plan?.name ?? c.noPlan}</strong>
      </div>
      <dl>
        {usage.metrics.map((m) => (
          <div key={m.key}>
            <dt>
              {resource(m.key, locale)}
              {usageState(m).state !== "normal" && (
                <span className="mf-usage-dot" />
              )}
            </dt>
            <dd>
              {m.used} / {m.limit === null ? c.unlimited : (m.limit ?? "—")}
            </dd>
          </div>
        ))}
      </dl>
      <Link className="mf-text-link" href={href("billing")}>
        {c.title}
        <ArrowRight size={14} />
      </Link>
    </section>
  );
}
export function UsagePage({ plans = false }: { plans?: boolean }) {
  const { locale, can, href } = useWorkspace();
  const { usage, error, loading, demo, reload } = useUsage();
  const c = usageContent[locale];
  if (!can("billing.read"))
    return (
      <section className="mf-load-error">
        <h1>{dashboardContent[locale].accessDenied}</h1>
      </section>
    );
  if (loading) return <p role="status">{c.loading}</p>;
  if (error || !usage)
    return (
      <section className="mf-panel" role="alert">
        <p>{c.loadError}</p>
        <button className="button" onClick={reload}>
          {c.retry}
        </button>
      </section>
    );
  if (plans)
    return (
      <PlanChooser
        key={usage.businessId}
        usage={usage}
        locale={locale}
        demo={demo}
        backHref={href("billing")}
      />
    );
  const shown = usage;
  const plansHref = href("billing").replace("?", "/plans?");
  return (
    <div className="mf-usage-page">
      <header className="mf-feature-heading">
        <h1>{c.title}</h1>
      </header>
      <section className="mf-panel mf-usage-plan">
        <div>
          <p className="mf-kicker">{c.current}</p>
          <h2>{shown.plan?.name ?? c.noPlan}</h2>
          {shown.plan && <p>{price(shown.plan, locale)}</p>}
        </div>
        {shown.canChangePlan && (
          <Link className="button" href={plansHref}>
            {c.change}
            <ArrowRight size={15} />
          </Link>
        )}
      </section>
      <section className="mf-panel">
        <h2 className="mf-kicker">{c.usage}</h2>
        {shown.metrics.map((m) => (
          <UsageMeter
            key={m.key}
            metric={m}
            locale={locale}
            planName={shown.plan?.name ?? ""}
            upgradeHref={shown.canChangePlan ? plansHref : undefined}
          />
        ))}
      </section>
    </div>
  );
}
function PlanChooser({
  usage,
  locale,
  demo,
  backHref,
}: {
  usage: import("./types").BusinessUsage;
  locale: Locale;
  demo: boolean;
  backHref: string;
}) {
  const c = usageContent[locale];
  const [preview, setPreview] = useState<UsagePlan | null>(null);
  const [selected, setSelected] = useState<UsagePlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function continuePlan() {
    if (!selected || busy || !usage.canChangePlan) return;
    if (demo) {
      setPreview(selected);
      return;
    }
    setBusy(true);
    setError(false);
    try {
      const result = await usageService().change(
        usage.businessId,
        selected.id,
        selected.interval,
      );
      const url = new URL(result.checkoutUrl, window.location.origin);
      if (
        url.username ||
        url.password ||
        (url.protocol !== "https:" && url.protocol !== "http:")
      )
        throw new Error("Invalid checkout URL");
      if (url.protocol !== "https:" && url.origin !== window.location.origin)
        throw new Error("Invalid checkout URL");
      window.location.assign(url.href);
    } catch {
      setError(true);
      setBusy(false);
    }
  }
  return (
    <div className="mf-plans-page">
      <Link className="mf-text-link" href={backHref}>
        ← {c.title}
      </Link>
      <header className="mf-feature-heading">
        <h1>{c.change}</h1>
      </header>
      <div className="mf-usage-plans">
        {usage.availablePlans.map((p) => (
          <article
            data-selected={selected?.id === p.id}
            className="mf-usage-option"
            key={p.id}
          >
            <strong>{p.name}</strong>
            <span className="mf-plan-price">{price(p, locale)}</span>
            {usage.metrics.find(
              (metric) => metric.key === "activeCustomers",
            ) && (
              <div className="mf-plan-customer-usage">
                <UsageMeter
                  metric={{
                    key: "activeCustomers",
                    used: usage.metrics.find(
                      (metric) => metric.key === "activeCustomers",
                    )!.used,
                    limit: p.limits.activeCustomers,
                  }}
                  locale={locale}
                  planName={p.name}
                  showNotice={false}
                />
              </div>
            )}
            {!demo && p.description && <p>{p.description}</p>}
            {!demo && !!p.features?.length && (
              <ul>
                {p.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            )}
            {demo && p.id in onboardingContent[locale].planCopy && (
              <>
                <p>
                  {
                    onboardingContent[locale].planCopy[
                      p.id as "starter" | "growth" | "business"
                    ].description
                  }
                </p>
                <ul>
                  {onboardingContent[locale].planCopy[
                    p.id as "starter" | "growth" | "business"
                  ].features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </>
            )}
            {Object.entries(p.limits)
              .filter(
                ([key, limit]) =>
                  key !== "activeCustomers" && limit !== undefined,
              )
              .map(([key, limit]) => (
                <small key={key}>
                  {resource(key, locale)}:{" "}
                  {limit === null ? c.unlimited : limit}
                </small>
              ))}
            <button
              className="button"
              disabled={busy || !usage.canChangePlan || p.id === usage.plan?.id}
              aria-pressed={selected?.id === p.id}
              onClick={() => setSelected(p)}
            >
              {p.id === usage.plan?.id
                ? c.selected
                : c.choose.replace("{plan}", p.name)}
            </button>
          </article>
        ))}
      </div>
      {preview && (
        <section className="mf-panel" aria-live="polite">
          <h2>{preview.name}</h2>
          <p className="mf-usage-preview">{c.preview}</p>
          {usage.metrics.map((metric) => (
            <UsageMeter
              key={metric.key}
              metric={{ ...metric, limit: preview.limits[metric.key] }}
              locale={locale}
              planName={preview.name}
            />
          ))}
        </section>
      )}
      {error && <p role="alert">{c.unavailable}</p>}
      <button
        className="button button-primary"
        disabled={!selected || busy || !usage.canChangePlan}
        onClick={continuePlan}
      >
        {busy ? c.loading : demo ? c.change : c.checkout}
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
