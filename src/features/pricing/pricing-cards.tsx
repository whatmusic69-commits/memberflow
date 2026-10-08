"use client";

import { useState } from "react";
import { Check, MapPin, Users } from "lucide-react";
import type { Locale } from "@/content";
import type { HomeRefinement } from "@/content/home/types";
import type { Plan, BillingInterval } from "@/features/onboarding/types";

export function PricingCards({ plans, locale, copy, monthlyLabel, yearlyLabel, annualSaving }: {
  plans: Plan[];
  locale: Locale;
  copy: HomeRefinement['pricing'];
  monthlyLabel: string;
  yearlyLabel: string;
  annualSaving: string | null;
}) {
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const money = (amount: number, currency: string) => new Intl.NumberFormat(locale, {
    style: 'currency', currency, minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2,
  }).format(amount);
  return <>
    <div className="pricing-billing-row">
      <fieldset className="pricing-billing-toggle">
        <legend className="sr-only">{copy.billing}</legend>
        {(['monthly', 'yearly'] as const).map(value => <label key={value}>
          <input type="radio" name="public-billing-interval" value={value} checked={interval === value} onChange={() => setInterval(value)} />
          <span>
            {value === 'monthly' ? monthlyLabel : yearlyLabel}
            {value === 'yearly' && annualSaving && <small className="pricing-toggle-saving">{annualSaving}</small>}
          </span>
        </label>)}
      </fieldset>
    </div>
    <div className="public-plans">
      {plans.map((plan, i) => {
        const price = interval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
        const limits = (['activeCustomers', 'locations'] as const).filter(key => plan.limits?.[key] !== undefined);
        return <article className={`public-plan ${plan.id === 'growth' ? 'public-plan-growth' : ''}`} key={plan.id}>
          <div className="public-plan-topline"><span>0{i + 1}</span><span className="public-plan-mark" aria-hidden="true" /></div>
          <header className="public-plan-heading"><h2>{plan.name}</h2><p>{plan.description}</p></header>
          <div className="public-plan-price-block" aria-live="polite" aria-atomic="true">
            {plan.pricingModel === 'custom' ? <p className="public-plan-price public-plan-custom">{copy.custom}</p> : <>
              {interval === 'yearly' && plan.monthlyPrice !== null && plan.yearlyPrice !== null && plan.currency && plan.yearlyPrice < plan.monthlyPrice * 12 && (
                <div className="public-plan-annual-saving">
                  <s>{money(plan.monthlyPrice * 12, plan.currency)} {copy.yearly}</s>
                  {annualSaving && <span>{annualSaving}</span>}
                </div>
              )}
              <span className="public-plan-from">{plan.pricingModel === 'from' ? copy.from : '\u00a0'}</span>
              <p className="public-plan-price">{price !== null && plan.currency ? money(price, plan.currency) : '—'}</p>
              <span className="public-plan-period">{interval === 'monthly' ? copy.monthly : copy.yearly}</span>
            </>}
          </div>
          <div className="public-plan-capacity">
            {limits.length ? <dl>{limits.map(key => {
              const Icon = key === 'activeCustomers' ? Users : MapPin;
              return <div key={key}><dt><Icon size={15} aria-hidden="true" />{key === 'activeCustomers' ? copy.customers : copy.locations}</dt><dd>{new Intl.NumberFormat(locale).format(plan.limits![key])}</dd></div>;
            })}</dl> : <p className="public-plan-custom-scope"><Users size={17} aria-hidden="true" />{copy.customScope}</p>}
          </div>
          {!!plan.features.length && <div className="public-plan-features"><h3>{copy.features}</h3><ul>{plan.features.map(feature => <li key={feature}><Check size={15} aria-hidden="true" /><span>{feature}</span></li>)}</ul></div>}
        </article>;
      })}
    </div>
  </>;
}
