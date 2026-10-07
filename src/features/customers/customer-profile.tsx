"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, Gift } from "lucide-react";
import { useWorkspace } from "@/features/dashboard/workspace";
import { OverviewSkeleton } from "@/features/dashboard/overview";
import { customersContent } from "@/content/customers";
import { moduleContent } from "@/content/modules";
import {
  moduleRepository,
  isDemoAdapter,
} from "@/features/workspace/repository";
import { dashboardContent } from "@/content/dashboard";
import { customerEventPresentation } from "@/features/dashboard/customer-events";
import { ModuleEditor } from "@/features/workspace/module-editor";
import { useCustomers } from "./use-customers";
import { date, money } from "./format";
export function CustomerProfile({ customerId }: { customerId: string }) {
  const { data, locale, can, href, loading } = useWorkspace();
  const c = customersContent[locale];
  const d = dashboardContent[locale];
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [mutationError, setMutationError] = useState(false);
  const { detail, pending, error, reload } = useCustomers(
    { period: 30, search: "", segment: "all", page: 1 },
    customerId,
  );
  if (loading) return <OverviewSkeleton />;
  if (!can("customer.read")) return <h1>{d.accessDenied}</h1>;
  if (error)
    return (
      <section className="mf-panel" role="alert">
        <p>{c.error}</p>
        <Link className="mf-text-link" href={href("customers")}>
          {c.back}
        </Link>
        <button className="button" onClick={reload}>
          {c.retry}
        </button>
      </section>
    );
  if (pending || !detail || !data) return <OverviewSkeleton />;
  const customer = detail.customer;
  async function toggleArchive() {
    if (
      !data ||
      archiving ||
      !isDemoAdapter(data.source === "demo") ||
      !can("customer.create")
    )
      return;
    setArchiving(true);
    setMutationError(false);
    try {
      const repository = moduleRepository("customers", true);
      // Persist only contact fields to the draft adapter, never analytics state.
      await repository.save(
        data.business.id,
        {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          notes: customer.notes,
        },
        customer.id,
      );
      await repository.archive(
        data.business.id,
        customer.id,
        !customer.archived,
      );
      reload();
    } catch {
      setMutationError(true);
    } finally {
      setArchiving(false);
    }
  }
  return (
    <div className="mf-customers-page">
      <Link className="mf-text-link" href={href("customers")}>
        <ArrowLeft size={15} />
        {c.back}
      </Link>
      <header className="mf-feature-heading">
        <div>
          <p className="mf-kicker">
            {data.business.name} / {c.title}
          </p>
          <h1>{customer.name}</h1>
          <p>
            {c.joined}: {date(customer.joinedAt, locale, c.unknown)}
          </p>
          <span className="mf-status">{c.states[customer.state]}</span>
        </div>
        {can("customer.create") && (
          <div className="mf-client-profile-actions">
            <button className="button" onClick={() => setEditing(true)}>
              {c.edit}
            </button>
            {isDemoAdapter(data.source === "demo") && (
              <button
                className="button"
                disabled={archiving}
                onClick={toggleArchive}
              >
                {customer.archived
                  ? moduleContent[locale].restore
                  : moduleContent[locale].archive}
              </button>
            )}
          </div>
        )}
      </header>
      {mutationError && <p role="alert">{moduleContent[locale].saveError}</p>}
      <section className="mf-customer-stats mf-profile-stats">
        {[
          [c.lastVisit, date(customer.lastVisitAt, locale, c.never)],
          [c.visitCount, customer.visitCount ?? "—"],
          [c.spending, money(customer.spending, locale)],
          [c.rewards, detail.rewardsEarned ?? "—"],
          [c.offers, detail.offersRedeemed ?? "—"],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>
      <div className="mf-customer-detail-grid">
        <section className="mf-panel">
          <h2>{c.loyalty}</h2>
          {customer.loyalty ? (
            <>
              <div className="mf-profile-stamps" aria-hidden="true">
                {Array.from(
                  { length: Math.min(12, customer.loyalty.target) },
                  (_, i) => (
                    <span
                      key={i}
                      className={i < customer.loyalty!.current ? "filled" : ""}
                    >
                      {i < customer.loyalty!.current ? (
                        <BadgeCheck size={25} />
                      ) : i === customer.loyalty!.target - 1 ? (
                        <Gift size={22} />
                      ) : (
                        i + 1
                      )}
                    </span>
                  ),
                )}
              </div>
              <p>
                {customer.loyalty.current} / {customer.loyalty.target}
              </p>
              <small>{c.nextReward}</small>
              <p>{customer.loyalty.reward}</p>
            </>
          ) : (
            <p>{c.noLoyalty}</p>
          )}
        </section>
        <section className="mf-panel">
          <h2>{c.membership}</h2>
          {detail.memberships.length ? (
            detail.memberships.map((m) => (
              <div className="mf-customer-membership" key={m.id}>
                <strong>{m.name}</strong>
                <span className="mf-status">
                  {c.membershipStates[m.status]}
                </span>
                <dl>
                  <dt>{c.remainingVisits}</dt>
                  <dd>{m.remainingVisits ?? "—"}</dd>
                  <dt>{c.validUntil}</dt>
                  <dd>{date(m.validUntil, locale, c.unknown)}</dd>
                </dl>
              </div>
            ))
          ) : (
            <p>{c.noMembership}</p>
          )}
        </section>
      </div>
      <div className="mf-customer-detail-grid">
        <section className="mf-panel">
          <h2>{c.history}</h2>
          {detail.events.length ? (
            <ol className="mf-client-history">
              {detail.events.map((event) => {
                const presentation = customerEventPresentation(
                  {
                    id: event.id,
                    name: customer.name,
                    kind: event.type,
                    detail: event.detail,
                    occurredAt: event.occurredAt,
                  },
                  d,
                );
                const Icon = presentation.Icon;
                return (
                  <li key={event.id}>
                    <Icon size={19} />
                    <div>
                      <strong>{presentation.copy}</strong>
                      {event.detail && <p>{event.detail}</p>}
                      <time dateTime={event.occurredAt}>
                        {date(event.occurredAt, locale, c.unknown, true)}
                      </time>
                      {event.actorName && (
                        <small>
                          {c.actor.replace("{name}", event.actorName)}
                        </small>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p>{c.noHistory}</p>
          )}
        </section>
        <section className="mf-panel">
          <h2>{c.purchases}</h2>
          {detail.salesSource === "NOT_CONNECTED" ? (
            <p>{c.salesMissing}</p>
          ) : !detail.purchases.length ? (
            <p>{c.noPurchases}</p>
          ) : (
            <ol className="mf-client-purchases">
              {detail.purchases.map((p) => (
                <li key={p.id}>
                  <div>
                    <strong>{p.description}</strong>
                    <time dateTime={p.occurredAt}>
                      {date(p.occurredAt, locale, c.unknown, true)}
                    </time>
                    <small>{c.purchaseStates[p.status]}</small>
                  </div>
                  <strong>{money(p.netAmount, locale)}</strong>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
      <section className="mf-panel mf-client-contact">
        <h2>{c.contact}</h2>
        <dl>
          {customer.email && (
            <>
              <dt>{c.email}</dt>
              <dd>{customer.email}</dd>
            </>
          )}
          {customer.phone && (
            <>
              <dt>{c.phone}</dt>
              <dd>{customer.phone}</dd>
            </>
          )}
        </dl>
        {customer.notes && (
          <>
            <h3>{c.notes}</h3>
            <p>{customer.notes}</p>
          </>
        )}
      </section>
      {editing && (
        <ModuleEditor
          feature="customers"
          offers={[]}
          record={customer}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
