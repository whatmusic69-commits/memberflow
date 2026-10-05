"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Circle,
  Gift,
  Megaphone,
  QrCode,
  RefreshCw,
  Ticket,
  Users,
  Waypoints,
  X,
} from "lucide-react";
import { dashboardContent, type DashboardContent } from "@/content/dashboard";
import { useWorkspace } from "./workspace";
import type { ConnectionStatus, DashboardOverview } from "./types";
type Action = keyof DashboardContent["actions"];
function setupActions(data: DashboardOverview): Action[] {
  const goals = data.business.goals;
  const first: Action =
    goals.includes("reach") || goals.includes("campaigns")
      ? "campaigns"
      : goals.includes("loyalty")
        ? "loyalty"
        : goals.includes("memberships")
          ? "memberships"
          : "customers";
  return [
    ...new Set<Action>([
      first,
      "customers",
      goals.includes("memberships") ? "memberships" : "loyalty",
      "integrations",
    ]),
  ].slice(0, 4);
}
function nextAction(data: DashboardOverview): Action {
  if (
    !data.campaigns.length &&
    data.business.goals.some((g) => g === "reach" || g === "campaigns")
  )
    return "campaigns";
  if (
    data.campaigns.length &&
    !data.integrations.some((i) => i.status === "connected")
  )
    return "integrations";
  if (!data.setup.customers) return "customers";
  if (!data.setup.retention)
    return data.business.goals.includes("memberships")
      ? "memberships"
      : "loyalty";
  if (data.attention.some((a) => a.reason === "inactive")) return "offers";
  return "campaigns";
}
const actionIcons = {
  campaigns: Megaphone,
  customers: QrCode,
  loyalty: Gift,
  memberships: Ticket,
  integrations: Waypoints,
  offers: Gift,
};
function Status({
  status,
  c,
}: {
  status: ConnectionStatus;
  c: DashboardContent;
}) {
  return (
    <span className={`mf-status mf-status-${status}`}>
      {status === "connected" || status === "ready" ? (
        <Check size={12} />
      ) : (
        <Circle size={8} />
      )}{" "}
      {c.connectionStatuses[status]}
    </span>
  );
}
export function OverviewSkeleton() {
  return (
    <div className="mf-skeleton" aria-busy="true">
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
    </div>
  );
}
export function Overview() {
  const { data, locale, loading, error, reload, href } = useWorkspace();
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
  const actions = setupActions(data);
  const primary = nextAction(data);
  const ActionIcon = actionIcons[primary];
  const category =
    c.category[data.business.category as keyof typeof c.category] ||
    data.business.category;
  const date = (value: string, time = false) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      ...(time
        ? { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }
        : { timeZone: "UTC" }),
    }).format(new Date(value));
  const period = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(data.flow.period + "-01T00:00:00Z"));
  return (
    <div className="mf-overview">
      {data.source === "demo" && <p className="mf-demo-note">{c.demo}</p>}
      {welcome && (
        <section className="mf-welcome">
          <span>
            <strong>{c.welcome.replace("{name}", data.user.firstName)}</strong>
            <small>{c.ready}</small>
          </span>
          <button
            className="mf-icon-button"
            aria-label={c.dismiss}
            onClick={() => setWelcome(false)}
          >
            <X size={18} />
          </button>
        </section>
      )}
      <div className="mf-overview-heading">
        <div>
          <p className="mf-kicker">
            {category} · {data.business.city}
          </p>
          <h1>{data.business.name}</h1>
          <p>{c.heading}</p>
        </div>
        <span className="mf-heading-mark">
          <Waypoints size={35} strokeWidth={1.2} />
        </span>
      </div>
      {data.state === "new" ? (
        <>
          <section className="mf-setup-flow">
            <div className="mf-panel-heading">
              <h2>{c.setup}</h2>
              <span>MemberFlow</span>
            </div>
            <ol>
              {(
                ["business", "campaign", "customers", "retention"] as const
              ).map((key, i) => {
                const done = data.setup[key];
                const current =
                  !done &&
                  (i === 0 ||
                    data.setup[
                      (
                        [
                          "business",
                          "campaign",
                          "customers",
                          "retention",
                        ] as const
                      )[i - 1]
                    ]);
                return (
                  <li
                    className={
                      done ? "is-complete" : current ? "is-current" : ""
                    }
                    key={key}
                  >
                    <span className="mf-flow-point">
                      {done ? <Check size={13} /> : <Circle size={8} />}
                    </span>
                    <strong>{c.stages[i]}</strong>
                    <small>
                      {done ? c.complete : current ? c.next : c.pending}
                    </small>
                  </li>
                );
              })}
            </ol>
          </section>
          <section className="mf-first-steps">
            <div className="mf-first-heading">
              <p className="mf-kicker">MemberFlow / 01</p>
              <h2>{c.stepsHeading}</h2>
              <p>{c.stepsText}</p>
            </div>
            <ol>
              {actions.map((action, i) => {
                const Icon = actionIcons[action];
                return (
                  <li key={action}>
                    <span className="mf-step-number">0{i + 1}</span>
                    <Icon size={22} strokeWidth={1.5} />
                    <div>
                      <h3>{c.actions[action][0]}</h3>
                      <p>{c.actions[action][1]}</p>
                    </div>
                    <Link className="mf-text-link" href={href(action)}>
                      {c.actions[action][2]}
                      <ArrowRight size={16} />
                    </Link>
                  </li>
                );
              })}
            </ol>
            {data.business.goals.includes("return") && (
              <p className="mf-dependency-note">{c.later}</p>
            )}
          </section>
        </>
      ) : (
        <>
          <section className="mf-flow-summary">
            <div className="mf-panel-heading">
              <h2>{c.flow}</h2>
              <span>{period}</span>
            </div>
            <ol>
              {(["reach", "connect", "retain", "return"] as const).map(
                (key, i) => (
                  <li key={key}>
                    <span className="mf-flow-point">
                      <Circle size={7} />
                    </span>
                    <span className="mf-kicker">{c.flowStages[i]}</span>
                    <strong>
                      {data.flow[key] === null
                        ? "—"
                        : new Intl.NumberFormat(locale).format(data.flow[key])}
                    </strong>
                    <small>
                      {data.flow[key] === null ? c.noMetric : c.metrics[i]}
                    </small>
                  </li>
                ),
              )}
            </ol>
          </section>
          <section className="mf-next-action">
            <ActionIcon size={23} />
            <div>
              <p className="mf-kicker">{c.nextAction}</p>
              <h2>{c.actions[primary][0]}</h2>
              <p>{c.actions[primary][1]}</p>
            </div>
            <Link className="mf-text-link" href={href(primary)}>
              {c.actions[primary][2]}
              <ArrowRight size={16} />
            </Link>
          </section>
        </>
      )}
      <div className="mf-overview-columns">
        <div className="mf-primary-column">
          <section className="mf-panel">
            <div className="mf-panel-heading">
              <h2>{c.campaigns}</h2>
              <Link href={href("campaigns")} className="mf-text-link">
                {c.nav.campaigns}
                <ArrowRight size={15} />
              </Link>
            </div>
            {data.campaigns.length ? (
              data.campaigns.map((campaign) => (
                <article className="mf-campaign-row" key={campaign.id}>
                  <span className="mf-campaign-icon">
                    <Megaphone size={24} />
                  </span>
                  <div>
                    <div className="mf-campaign-title">
                      <h3>{campaign.name}</h3>
                      <span
                        className={`mf-status mf-campaign-${campaign.status}`}
                      >
                        {c.statuses[campaign.status]}
                      </span>
                    </div>
                    {campaign.startedAt && (
                      <small>
                        {c.started} {date(campaign.startedAt)}
                      </small>
                    )}
                    <div className="mf-channel-chips">
                      {campaign.channels.map((channel) => (
                        <span key={channel.name}>
                          {channel.name}
                          <Status status={channel.status} c={c} />
                        </span>
                      ))}
                    </div>
                    <Link
                      className="mf-text-link"
                      href={
                        href("campaigns") +
                        "&campaign=" +
                        encodeURIComponent(campaign.id)
                      }
                    >
                      {c.viewCampaign}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="mf-empty">
                <Megaphone size={25} />
                <h3>{c.noCampaigns}</h3>
                <p>{c.campaignEmpty}</p>
                <Link href={href("campaigns")} className="mf-text-link">
                  {c.actions.campaigns[2]}
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </section>
          <section className="mf-panel">
            <div className="mf-panel-heading">
              <h2>{c.activity}</h2>
              <Link href={href("customers")} className="mf-text-link">
                {c.viewCustomers}
                <ArrowRight size={15} />
              </Link>
            </div>
            {data.customerActivity.length ? (
              <ol className="mf-activity-feed">
                {data.customerActivity.map((item) => (
                  <li key={item.id}>
                    <span className={`mf-event-icon mf-event-${item.kind}`}>
                      {item.kind === "reward" ? (
                        <Gift size={17} />
                      ) : item.kind === "membership" ? (
                        <Ticket size={17} />
                      ) : (
                        <Users size={17} />
                      )}
                    </span>
                    <div>
                      <p>
                        <strong>{item.name}</strong> {c.events[item.kind]}
                      </p>
                      {item.detail && <small>{item.detail}</small>}
                      <time dateTime={item.occurredAt}>
                        {date(item.occurredAt, true)} UTC
                      </time>
                    </div>
                    <ChevronRight size={14} aria-hidden="true" />
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mf-empty">
                <Users size={25} />
                <h3>{c.noActivity}</h3>
                <p>{c.activityEmpty}</p>
                <Link className="mf-text-link" href={href("customers")}>
                  {c.actions.customers[2]}
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </section>
        </div>
        <div className="mf-secondary-column">
          {data.state === "active" && (
            <section className="mf-panel mf-attention">
              <div className="mf-panel-heading">
                <h2>{c.attention}</h2>
                <span className="mf-attention-dot" />
              </div>
              {data.attention.length ? (
                data.attention.map((item) => (
                  <Link
                    className="mf-attention-row"
                    href={
                      href("customers") +
                      "&customer=" +
                      encodeURIComponent(item.id)
                    }
                    key={item.id}
                  >
                    <span className="mf-user-avatar">
                      {item.name.slice(0, 1)}
                    </span>
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
                ))
              ) : (
                <p className="mf-muted">{c.noAttention}</p>
              )}
            </section>
          )}
          <section className="mf-panel">
            <div className="mf-panel-heading">
              <h2>{c.retention}</h2>
            </div>
            <div className="mf-retention-list">
              {(["loyalty", "memberships", "offers"] as const).map((key) => (
                <Link key={key} href={href(key)}>
                  <span>{c.nav[key]}</span>
                  <strong>
                    {data.retention[key] === null ? "—" : data.retention[key]}
                  </strong>
                  <small>{c.active}</small>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
            {!data.setup.retention && (
              <p className="mf-panel-footnote">{c.noRetention}</p>
            )}
          </section>
          <section className="mf-panel">
            <div className="mf-panel-heading">
              <h2>{c.connection}</h2>
              <QrCode size={17} />
            </div>
            <ul className="mf-status-list">
              {data.connection.map((item) => (
                <li key={item.name}>
                  <span>{c.connections[item.name]}</span>
                  <Status status={item.status} c={c} />
                </li>
              ))}
            </ul>
            <Link className="mf-text-link" href={href("customers")}>
              {c.configure}
              <ArrowRight size={15} />
            </Link>
          </section>
          <section className="mf-panel">
            <div className="mf-panel-heading">
              <h2>{c.integrationHeading}</h2>
              <Waypoints size={17} />
            </div>
            <ul className="mf-status-list">
              {data.integrations.map((item) => (
                <li key={item.name}>
                  <span>{item.name}</span>
                  <Status status={item.status} c={c} />
                </li>
              ))}
            </ul>
            <Link className="mf-text-link" href={href("integrations")}>
              {c.manage}
              <ArrowRight size={15} />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
