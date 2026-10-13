"use client";
import { useEffect, useState } from "react";
import type { Locale } from "@/content";
import { dashboardContent } from "@/content/dashboard";
import { membershipContent } from "@/content/memberships";
import { workspaceDraftEvent } from "@/features/workspace/repository";
import { readPrototypeLedger } from "./repository";
import { membershipStatus, membershipStatistics } from "./memberships";
import type { PrototypeMembership } from "./ledger";
export function useMembershipJournal(businessId: string) {
  const [, refresh] = useState(0);
  useEffect(() => {
    const update = () => refresh((n) => n + 1);
    window.addEventListener(workspaceDraftEvent, update);
    const timer = window.setInterval(update, 60000);
    return () => {
      window.removeEventListener(workspaceDraftEvent, update);
      window.clearInterval(timer);
    };
  }, [businessId]);
  return readPrototypeLedger(businessId);
}
export function MembershipCard({
  membership: m,
  locale,
  children,
}: {
  membership: PrototypeMembership;
  locale: Locale;
  children?: React.ReactNode;
}) {
  const c = membershipContent[locale];
  const format = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(value));
  return (
    <article className="mf-membership-card" data-assignment={m.id}>
      <div className="mf-panel-heading">
        <strong>{m.name ?? m.membershipId}</strong>
        <span className="mf-status">{c.states[membershipStatus(m)]}</span>
      </div>
      <small>{m.remainingVisits === null ? c.membership : c.package}</small>
      <p>
        {m.remainingVisits === null
          ? c.unlimited
          : c.remaining
              .replace("{remaining}", String(m.remainingVisits))
              .replace("{total}", String(m.totalVisits ?? m.remainingVisits))}
      </p>
      {m.totalVisits != null && (
        <progress
          aria-label={c.visits}
          value={m.remainingVisits ?? 0}
          max={m.totalVisits}
        />
      )}
      <dl>
        {m.startsOn && (
          <>
            <dt>{c.start}</dt>
            <dd>
              <time dateTime={m.startsOn}>{format(m.startsOn)}</time>
            </dd>
          </>
        )}
        {m.validUntil && (
          <>
            <dt>{c.end}</dt>
            <dd>
              <time dateTime={m.validUntil}>{format(m.validUntil)}</time>
            </dd>
          </>
        )}
        {m.frozenAt && (
          <>
            <dt>{c.reason}</dt>
            <dd>
              {m.freezeReason} · {format(m.frozenAt)}
            </dd>
          </>
        )}
      </dl>
      {children}
    </article>
  );
}
export function LocalMembershipCards({
  businessId,
  customerId,
  locale,
  history = false,
}: {
  businessId: string;
  customerId: string;
  locale: Locale;
  history?: boolean;
}) {
  const ledger = useMembershipJournal(businessId),
    c = membershipContent[locale];
  const assignments = (ledger.memberships ?? []).filter(
    (m) => m.customerId === customerId,
  );
  return (
    <div className="mf-membership-list">
      {assignments.length ? (
        assignments.map((m) => (
          <MembershipCard key={m.id} membership={m} locale={locale}>
            {history && (
              <details>
                <summary>{c.history}</summary>
                <ol>
                  {ledger.events
                    .filter(
                      (e) =>
                        e.membershipId === m.id ||
                        (e.membershipId === m.membershipId &&
                          e.customerId === customerId),
                    )
                    .map((e) => (
                      <li key={e.id}>
                        <time>
                          {new Intl.DateTimeFormat(locale, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(e.occurredAt))}
                        </time>{" "}
                        · {dashboardContent[locale].eventCopy[e.type]} ·{" "}
                        {e.detail}
                      </li>
                    ))}
                </ol>
              </details>
            )}
          </MembershipCard>
        ))
      ) : (
        <p>{c.empty}</p>
      )}
    </div>
  );
}
export function MembershipStatistics({
  businessId,
  locale,
}: {
  businessId: string;
  locale: Locale;
}) {
  const journal = useMembershipJournal(businessId),
    stats = membershipStatistics(journal),
    c = membershipContent[locale];
  if (!journal.memberships?.length) return null;
  return (
    <section className="mf-membership-statistics" aria-label={c.title}>
      {[
        [c.active, stats.active],
        [c.used, stats.used],
        [c.expiring, stats.expiring],
      ].map(([label, value]) => (
        <div key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}
