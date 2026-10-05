import { Circle, Gift, Ticket, Users, Waypoints } from "lucide-react";
import type { ModuleContent } from "@/content/modules";
import type { ModuleId } from "./types";
export function RecordPreview({
  feature,
  values,
  c,
  businessName,
  offerName,
}: {
  feature: ModuleId;
  values: Record<string, string>;
  c: ModuleContent;
  businessName: string;
  offerName?: string;
}) {
  const option = (value: string) =>
    c.options[value as keyof typeof c.options] || value;
  return (
    <div className={`mf-record-preview mf-record-${feature}`}>
      <span className="mf-kicker">{businessName}</span>
      {feature === "customers" ? (
        <>
          <span className="mf-profile-avatar">
            <Users size={28} />
          </span>
          <h3>{values.name || c.profile}</h3>
          <p>{values.email || values.phone || c.noContact}</p>
          <div className="mf-customer-stats">
            {c.stats.map((label) => (
              <div key={label}>
                <strong>—</strong>
                <small>{label}</small>
              </div>
            ))}
          </div>
          <small>{c.noHistory}</small>
        </>
      ) : feature === "loyalty" ? (
        <>
          <Gift size={27} />
          <h3>{values.name || c.create.loyalty}</h3>
          <div className="mf-stamp-preview">
            {Array.from(
              {
                length:
                  values.kind === "stamps"
                    ? Math.min(Number(values.target) || 6, 8)
                    : 1,
              },
              (_, i) => (
                <Circle key={i} size={22} strokeWidth={1} />
              ),
            )}
          </div>
          <dl>
            <dt>{c.thresholdLabel}</dt>
            <dd>
              {values.target} {option(values.kind)}
            </dd>
            <dt>{c.rewardLabel}</dt>
            <dd>{values.reward || "—"}</dd>
          </dl>
          <small>{c.activationNote}</small>
        </>
      ) : feature === "memberships" ? (
        <>
          <Ticket size={27} />
          <h3>{values.name || c.create.memberships}</h3>
          <strong className="mf-record-price">
            {values.price || "—"} {values.currency}
          </strong>
          <p>
            {option(values.kind)}
            {values.kind === "membership"
              ? " · " + option(values.interval)
              : ""}
          </p>
          {values.visits && (
            <p>
              {c.usage}: {values.visits}
            </p>
          )}
          <small>{c.activationNote}</small>
        </>
      ) : feature === "offers" ? (
        <>
          <Gift size={27} />
          <h3>{values.name || c.create.offers}</h3>
          <p>{values.description}</p>
          <span className="mf-record-audience">{option(values.audience)}</span>
          <small>{values.expiresAt || c.noExpiry}</small>
        </>
      ) : (
        <>
          <Waypoints size={27} />
          <h3>{values.name || c.create.automations}</h3>
          <ol className="mf-automation-path">
            <li>
              <small>{c.flow[0]}</small>
              <strong>
                {values.inactivityDays} · {c.inactivity}
              </strong>
            </li>
            <li>
              <small>{c.flow[1]}</small>
              <strong>{offerName || c.noOffers}</strong>
            </li>
            <li>
              <small>{c.flow[2]}</small>
              <strong>{option(values.channel)}</strong>
            </li>
          </ol>
          <span className="mf-status">{c.notRunning}</span>
        </>
      )}
    </div>
  );
}
