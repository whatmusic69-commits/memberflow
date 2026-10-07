"use client";
import { customerEventPresentation } from "./customer-events";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  Circle,
  Gift,
  QrCode,
  Ticket,
  Users,
  Waypoints,
} from "lucide-react";
import { dashboardContent } from "@/content/dashboard";
import { workspaceContent } from "@/content/workspace";
import { onboardingContent } from "@/content/onboarding";
import { OverviewSkeleton } from "./overview";
import { localizedPlan } from "./plan-label";
import { useWorkspace } from "./workspace";
import type { Section } from "./types";
type Module =
  | "customers"
  | "loyalty"
  | "memberships"
  | "offers"
  | "automations"
  | "integrations"
  | "settings";
const icons = {
  customers: Users,
  loyalty: Gift,
  memberships: Ticket,
  offers: Gift,
  automations: Waypoints,
  integrations: Waypoints,
  settings: Waypoints,
};
export function FeatureShell({ section }: { section: Section }) {
  const { locale, href, data, loading, error, reload } = useWorkspace();
  const c = workspaceContent[locale];
  const d = dashboardContent[locale];
  const tab = useSearchParams().get("tab");
  const feature = section as Module;
  const Icon = icons[feature] || Waypoints;
  if (loading) return <OverviewSkeleton />;
  if (error || !data)
    return (
      <section className="mf-load-error">
        <h1>{d.error}</h1>
        <button className="button" onClick={reload}>
          {d.retry}
        </button>
      </section>
    );
  const stages =
    feature === "loyalty"
      ? c.loyaltyParts
      : feature === "memberships"
        ? c.membershipParts
        : feature === "offers"
          ? c.offerParts
          : feature === "automations"
            ? c.automationParts
            : [];
  const category =
    d.category[data.business.category as keyof typeof d.category] ||
    data.business.category;
  return (
    <section className="mf-feature-page">
      <header className="mf-feature-heading">
        <div>
          <p className="mf-kicker">
            {data.business.name} / {d.nav[section]}
          </p>
          <h1>
            {section === "settings" && tab === "billing"
              ? c.billing
              : section === "settings" && tab === "profile"
                ? d.profile
                : d.nav[section]}
          </h1>
          <p>{c.descriptions[feature]}</p>
        </div>
        <Icon size={30} strokeWidth={1.3} />
      </header>
      {feature === "settings" ? (
        <div className="mf-settings-grid">
          <section className="mf-panel">
            <h2>{tab === "profile" ? c.owner : c.titles.settings}</h2>
            <dl className="mf-details-list">
              {tab === "profile" ? (
                <>
                  <dt>{c.owner}</dt>
                  <dd>{data.user.firstName}</dd>
                  <dt>{c.role}</dt>
                  <dd>{d.roles[data.membership.role]}</dd>
                </>
              ) : (
                <>
                  <dt>{c.businessName}</dt>
                  <dd>{data.business.name}</dd>
                  <dt>{c.businessType}</dt>
                  <dd>{category}</dd>
                  <dt>{c.city}</dt>
                  <dd>{data.business.city || c.unknown}</dd>
                </>
              )}
            </dl>
            <p className="mf-panel-footnote">{c.readOnly}</p>
          </section>
          <section className="mf-panel">
            <h2>{c.billing}</h2>
            <p>{localizedPlan(data.business.planName, c)}</p>
            <p className="mf-panel-footnote">
              {data.source === "demo" ? c.billingText : d.billingShell}
            </p>
            <h3 className="mf-settings-goals-heading">{c.goals}</h3>
            <ul className="mf-goal-list">
              {data.business.goals.map((goal) => (
                <li key={goal}>
                  <Check size={13} />
                  {
                    onboardingContent[locale].goals[
                      (
                        [
                          "reach",
                          "campaigns",
                          "relationships",
                          "loyalty",
                          "memberships",
                          "insights",
                          "return",
                        ] as const
                      ).indexOf(goal)
                    ]
                  }
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : feature === "integrations" ? (
        <div className="mf-settings-grid">
          <section className="mf-panel">
            <h2>{c.channelsTitle}</h2>
            <ul className="mf-integration-directory">
              {data.integrations.map((channel) => (
                <li key={channel.name}>
                  <span className="mf-integration-monogram">
                    <Waypoints size={17} />
                  </span>
                  <div>
                    <strong>{channel.name}</strong>
                    <small>{d.connectionStatuses[channel.status]}</small>
                  </div>
                  <span className="mf-status">
                    {channel.status === "connected" ? (
                      <Check size={16} />
                    ) : (
                      <Circle size={9} />
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mf-panel-footnote">{c.plannedConnection}</p>
          </section>
          <section className="mf-panel">
            <h2>{c.walletTitle}</h2>
            <ul className="mf-integration-directory">
              {data.connection.map((item) => (
                <li key={item.name}>
                  <QrCode size={20} />
                  <div>
                    <strong>{d.connections[item.name]}</strong>
                    <small>{d.connectionStatuses[item.status]}</small>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mf-panel-footnote">{c.connectionText}</p>
          </section>
        </div>
      ) : (
        <>
          <section className="mf-feature-empty">
            <Icon size={35} strokeWidth={1.2} />
            <h2>
              {feature === "customers" && data.customerActivity.length
                ? c.activity
                : (feature === "loyalty" ||
                      feature === "memberships" ||
                      feature === "offers") &&
                    data.retention[feature]
                  ? `${d.nav[feature]} · ${data.retention[feature]} ${d.active}`
                  : c.empty[feature as keyof typeof c.empty]}
            </h2>
            <p>{c.titles[feature]}</p>
            {stages.length > 0 && (
              <ol className="mf-mini-journey">
                {stages.map((stage, i) => (
                  <li key={stage}>
                    <span>0{i + 1}</span>
                    <strong>{stage}</strong>
                  </li>
                ))}
              </ol>
            )}
            <p className="mf-panel-footnote">
              {feature === "customers"
                ? c.connectionText
                : feature === "automations"
                  ? d.later
                  : c.noPrograms}
            </p>
          </section>
          {feature === "customers" && data.customerActivity.length > 0 && (
            <section className="mf-panel mf-feature-activity">
              <h2>{c.activity}</h2>
              <ol className="mf-activity-feed">
                {data.customerActivity.map((item) => (
                  <li key={item.id}>
                    <Users size={17} />
                    <div>
                      <p>
                        <strong>{item.name}</strong>{" "}
                        {customerEventPresentation(item, d).copy}
                      </p>
                      {item.detail && <small>{item.detail}</small>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <section className="mf-feature-next">
            <Waypoints size={23} />
            <div>
              <span className="mf-kicker">{c.next}</span>
              <p>
                {feature === "customers"
                  ? c.connectionTitle
                  : feature === "automations"
                    ? d.actions.customers[0]
                    : d.actions.campaigns[0]}
              </p>
            </div>
            <Link
              className="mf-text-link"
              href={href(
                feature === "customers"
                  ? "integrations"
                  : feature === "automations"
                    ? "customers"
                    : "campaigns",
              )}
            >
              {feature === "customers"
                ? c.manageChannels
                : feature === "automations"
                  ? d.viewCustomers
                  : c.newCampaign}
              <ArrowRight size={15} />
            </Link>
          </section>
        </>
      )}
    </section>
  );
}
