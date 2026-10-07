"use client";
import { useEffect, useRef } from "react";
import { Gift, Plus, Ticket, ArrowRight, Check } from "lucide-react";
import type { Locale } from "@/content";
import type { StaffContent } from "@/content/staff";
import type { Permission } from "@/features/access/types";
import type { StaffAction, StaffCustomerView } from "./types";
import { visibleStaffActions } from "./actions";
export function StaffCustomer({
  customer,
  locale,
  c,
  can,
  busy,
  message,
  onAction,
  onBack,
}: {
  customer: StaffCustomerView;
  locale: Locale;
  c: StaffContent;
  can: (permission: Permission) => boolean;
  busy: boolean;
  message: string;
  onAction: (action: StaffAction) => void;
  onBack: () => void;
}) {
  const actions = visibleStaffActions(customer, can);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [customer.id]);
  return (
    <section className="mf-staff-customer">
      <header>
        <p className="mf-kicker">{c.access}</p>
        <h1 ref={heading} tabIndex={-1}>
          {customer.name}
        </h1>
        {customer.customerSince && (
          <small>
            {c.customerSince}{" "}
            {new Intl.DateTimeFormat(locale, {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            }).format(new Date(customer.customerSince))}
          </small>
        )}
      </header>
      {message && (
        <p className="mf-staff-success" role="status">
          <Check size={17} />
          {message}
        </p>
      )}
      {customer.loyalty && (
        <section className="mf-staff-tool">
          <div className="mf-panel-heading">
            <h2>{c.loyalty}</h2>
            <Gift size={19} />
          </div>
          <strong>
            {customer.loyalty.stamps} / {customer.loyalty.target}{" "}
            <small>{c.stamps}</small>
          </strong>
          <div className="mf-staff-stamps" aria-hidden="true">
            {Array.from(
              { length: Math.min(12, customer.loyalty.target) },
              (_, i) => (
                <span
                  className={i < customer.loyalty!.stamps ? "filled" : ""}
                  key={i}
                />
              ),
            )}
          </div>
          <p>
            {c.nextReward}
            <strong>{customer.loyalty.nextReward}</strong>
          </p>
        </section>
      )}
      {customer.membership && (
        <section className="mf-staff-tool">
          <div className="mf-panel-heading">
            <h2>{c.membership}</h2>
            <Ticket size={19} />
          </div>
          <strong>{customer.membership.name}</strong>
          {customer.membership.visitsRemaining !== null && (
            <p>
              {c.remaining.replace(
                "{n}",
                String(customer.membership.visitsRemaining),
              )}
            </p>
          )}
        </section>
      )}
      <section className="mf-staff-actions">
        <h2>{c.available}</h2>
        {actions.length ? (
          actions.map((action) => (
            <button
              className="button"
              key={action.id}
              disabled={busy}
              onClick={() => onAction(action)}
            >
              <Plus size={18} />
              {c.actions[action.type]}
              <ArrowRight size={17} />
            </button>
          ))
        ) : (
          <p>{c.noActions}</p>
        )}
      </section>
      <button className="mf-text-link" disabled={busy} onClick={onBack}>
        {c.back}
        <ArrowRight size={16} />
      </button>
    </section>
  );
}
