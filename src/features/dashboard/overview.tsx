"use client";
import Link from "next/link";
import { BusinessResultsPanel } from "./business-results";
import { setupNoticeContent } from "@/content/business-results/setup-notice";
import { businessResultsContent } from "@/content/business-results";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CircleAlert,
  ChevronRight,
  RefreshCw,
  Waypoints,
  X,
} from "lucide-react";
import { dashboardContent } from "@/content/dashboard";
import { useWorkspace } from "./workspace";
import { getLifecycle, getNextAction, getSetupSummary } from "./overview-model";
import { CampaignsPanel, ActivityPanel } from "./overview-panels";
export function OverviewSkeleton() {
  return (
    <div className="mf-skeleton mf-overview-skeleton" aria-busy="true">
      <div className="mf-skeleton-title" />
      <div className="mf-skeleton-copy" />
      <div className="mf-skeleton-flow">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} />
        ))}
      </div>
      <div className="mf-skeleton-grid">
        <div />
        <div />
      </div>
      <div className="mf-skeleton-panel" />
      <div className="mf-skeleton-panel" />
    </div>
  );
}
export function Overview() {
  const { data, locale, loading, error, reload, href, can } = useWorkspace();
  const c = dashboardContent[locale];
  const setupNotice = setupNoticeContent[locale];
  const query = useSearchParams();
  const [welcome, setWelcome] = useState(() => query.get("welcome") === "1");
  useEffect(() => {
    if (query.get("welcome") === "1") {
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      window.history.replaceState(window.history.state, "", url);
    }
  }, [query]);
  if (loading)
    return (
      <>
        <span className="sr-only" role="status">
          {c.loading}
        </span>
        <OverviewSkeleton />
      </>
    );
  if (error || !data)
    return (
      <section className="mf-load-error" role="alert">
        <Waypoints size={42} />
        <h1>{c.error}</h1>
        <p>{c.errorText}</p>
        <button className="button button-primary" onClick={reload}>
          <RefreshCw size={16} />
          {c.retry}
        </button>
      </section>
    );
  const primary = getNextAction(data);
  const lifecycle = getLifecycle(data);
  const setup = getSetupSummary(data);
  const category =
    c.category[data.business.category as keyof typeof c.category] ||
    data.business.category;
  const primaryCopy = !primary
    ? [c.allQuiet, c.allQuietText, c.viewCustomers]
    : primary.kind === "setup"
      ? c.actions[primary.target]
      : primary.kind === "returnOffer"
        ? [c.actions.offers[0], c.returnOfferText, c.actions.offers[2]]
        : primary.kind === "reviewCampaign"
          ? [c.reviewCampaignTitle, c.reviewCampaignText, c.viewCampaign]
          : [
              c.operationalCampaignTitle,
              c.operationalCampaignText,
              c.actions.campaigns[2],
            ];
  const primaryHref =
    (primary?.kind === "setup" && primary.target === "customers"
      ? href("customers").replace("?", "/connection?")
      : href(primary?.target ?? "customers")) +
    (primary?.campaignId
      ? `&campaign=${encodeURIComponent(primary.campaignId)}`
      : "");
  return (
    <div className="mf-overview mf-overview-refined">
      <div className="mf-overview-identity">
        <p>{c.greeting.replace("{name}", data.user.firstName)}</p>
        <h1>{data.business.name}</h1>
        <small>
          {category}
          {data.business.city ? ` · ${data.business.city}` : ""}
        </small>
        {welcome && (
          <div className="mf-welcome-inline">
            <span>{c.ready}</span>
            <button
              className="mf-icon-button"
              aria-label={c.dismiss}
              onClick={() => setWelcome(false)}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      {!data.setup.business && (
        <section
          className="mf-business-setup-notice"
          aria-labelledby="business-setup-notice-title"
        >
          <span className="mf-business-setup-notice-icon">
            <CircleAlert size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 id="business-setup-notice-title">{setupNotice.title}</h2>
            <p>
              {can("business.settings.read")
                ? setupNotice.text
                : setupNotice.restricted}
            </p>
          </div>
          {can("business.settings.read") && (
            <Link
              className="mf-business-setup-notice-action"
              href={href("settings")}
            >
              {setupNotice.action}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </section>
      )}
      <BusinessResultsPanel data={data} locale={locale} />
      <details className="mf-results-setup">
        <summary>{businessResultsContent[locale].setup}</summary>
        <div className="mf-overview-action-row">
          <section className="mf-panel mf-next-action-refined">
            <p className="mf-kicker">{c.nextAction}</p>
            <h2>{primary?.title || primaryCopy[0]}</h2>
            <p>{primary?.description || primaryCopy[1]}</p>
            <Link className="mf-text-link" href={primaryHref}>
              {primaryCopy[2]}
              <ArrowRight size={15} />
            </Link>
            {lifecycle.mode === "setup" && (
              <div className="mf-setup-caption">
                <span>
                  {c.setupCount
                    .replace("{done}", String(setup.completed))
                    .replace("{total}", String(setup.total))}
                </span>
                {can("business.settings.read") && (
                  <Link href={href("settings")} className="mf-text-link">
                    {c.viewSetup}
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </details>
      <div
        className={`mf-overview-business-row ${!data.attention.length ? "mf-no-attention" : ""}`}
      >
        <CampaignsPanel data={data} c={c} locale={locale} href={href} />
        {data.attention.length > 0 && (
          <section className="mf-panel mf-attention">
            <div className="mf-panel-heading">
              <h2>{c.attention}</h2>
              <span className="mf-attention-dot" />
            </div>
            {data.attention.map((item) => (
              <Link
                className="mf-attention-row"
                href={`${href("customers")}&customer=${encodeURIComponent(item.id)}`}
                key={item.id}
              >
                <span className="mf-user-avatar">{item.name.slice(0, 1)}</span>
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {c.attentionReasons[item.reason].replace(
                      "{n}",
                      String(item.value),
                    )}
                  </small>
                </span>
                <ChevronRight size={14} />
              </Link>
            ))}
          </section>
        )}
      </div>
      <ActivityPanel data={data} c={c} locale={locale} href={href} />
    </div>
  );
}
