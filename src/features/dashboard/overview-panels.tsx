import Link from "next/link";
import { ArrowRight, Check, Circle, Megaphone, Users } from "lucide-react";
import type { Locale } from "@/content";
import type { DashboardContent } from "@/content/dashboard";
import type { ConnectionStatus, DashboardOverview, Section } from "./types";
import { customerEventPresentation } from "./customer-events";
type PanelProps = {
  data: DashboardOverview;
  c: DashboardContent;
  locale: Locale;
  href: (section?: Section) => string;
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
      )}
      {c.connectionStatuses[status]}
    </span>
  );
}
function formatDate(value: string, locale: Locale, time = false) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}
export function CampaignsPanel({ data, c, locale, href }: PanelProps) {
  const date = (value: string) => formatDate(value, locale);
  return (
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
                <span className={`mf-status mf-campaign-${campaign.status}`}>
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
  );
}
export function ActivityPanel({ data, c, locale, href }: PanelProps) {
  const date = (value: string, time = false) => formatDate(value, locale, time);
  return (
    <section className="mf-panel">
      <div className="mf-panel-heading">
        <h2>{c.activityHeading}</h2>
        <Link href={href("customers")} className="mf-text-link">
          {c.viewCustomers}
          <ArrowRight size={15} />
        </Link>
      </div>
      {data.customerActivity.length ? (
        <ol className="mf-activity-feed">
          {data.customerActivity.map((item) => {
            const { Icon, copy } = customerEventPresentation(item, c);
            return (
              <li key={item.id}>
                <span className="mf-event-icon">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <div>
                  <p>
                    <strong>{item.name}</strong> {copy}
                  </p>
                  {item.detail && <small>{item.detail}</small>}
                </div>
                <time dateTime={item.occurredAt}>
                  {date(item.occurredAt, true)}
                </time>
              </li>
            );
          })}
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
  );
}
