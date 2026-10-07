"use client";
import Link from "next/link";
import { UsageSummary } from "@/features/usage/usage-page";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Waypoints,
  X,
} from "lucide-react";
import { dashboardContent } from "@/content/dashboard";
import { useWorkspace } from "./workspace";
import { MemberFlowFlow } from "./memberflow-flow";
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
  const legacyPeriodLabel =
    !data.lifecycle && /^\d{4}-(0[1-9]|1[0-2])$/.test(data.flow.period)
      ? new Intl.DateTimeFormat(locale, {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(`${data.flow.period}-01T00:00:00Z`))
      : undefined;
  const category =
    c.category[data.business.category as keyof typeof c.category] ||
    data.business.category;
  const readyConnections = data.connection.filter(
    (item) => item.status === "ready" || item.status === "connected",
  ).length;
  const connectedChannels = data.integrations.filter(
    (item) => item.status === "connected",
  ).length;
  const retention = (["loyalty", "memberships", "offers"] as const).filter(
    (key) => (data.retention[key] ?? 0) > 0,
  );
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
  const statusTarget = !data.setup.customers
    ? "customers"
    : !data.setup.retention
      ? "loyalty"
      : "integrations";
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
      <MemberFlowFlow
        lifecycle={lifecycle}
        c={c}
        locale={locale}
        periodLabel={legacyPeriodLabel}
      />
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
        <section className="mf-panel mf-overview-status">
          <div className="mf-panel-heading">
            <h2>{c.statusHeading}</h2>
          </div>
          <dl>
            <div>
              <dt>{c.connection}</dt>
              <dd>
                {readyConnections > 0
                  ? c.connectionReady
                      .replace("{ready}", String(readyConnections))
                      .replace("{total}", String(data.connection.length))
                  : c.needsSetup}
              </dd>
            </div>
            <div>
              <dt>{c.retentionLabel}</dt>
              <dd>
                {retention.length
                  ? retention
                      .map((key) => `${c.nav[key]}: ${data.retention[key]}`)
                      .join(" · ")
                  : data.setup.retention
                    ? c.complete
                    : c.pending}
              </dd>
            </div>
            <div>
              <dt>{c.channelsLabel}</dt>
              <dd>
                {connectedChannels
                  ? c.channelsConnected.replace(
                      "{n}",
                      String(connectedChannels),
                    )
                  : c.noChannels}
              </dd>
            </div>
          </dl>
          <Link
            className="mf-text-link"
            href={
              statusTarget === "customers"
                ? href("customers").replace("?", "/connection?")
                : href(statusTarget)
            }
          >
            {lifecycle.mode === "setup" ? c.continueSetup : c.configure}
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>
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
      <UsageSummary />
    </div>
  );
}
