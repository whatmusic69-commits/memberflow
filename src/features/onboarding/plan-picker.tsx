import { annualDiscountPercent } from "@/config/plans";
import type { OnboardingContent } from "@/content/onboarding/types";
import type { Plan, BillingInterval, PlanSelection } from "./types";
export function PlanPicker({
  c,
  plans,
  selection,
  onChange,
}: {
  c: OnboardingContent;
  plans: Plan[];
  selection: PlanSelection | null;
  onChange: (value: PlanSelection) => void;
}) {
  const interval: BillingInterval = selection?.interval ?? "monthly";
  return (
    <>
      <fieldset className="billing-toggle">
        <legend className="sr-only">{c.steps[4]}</legend>
        {(["monthly", "yearly"] as const).map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="interval"
              value={value}
              checked={interval === value}
              onChange={() =>
                onChange({ planId: selection?.planId ?? "", interval: value })
              }
            />
            <span>
              {c[value]}
              {value === "yearly" && <small className="billing-discount">{c.yearlyDiscount.replace("{percent}", String(annualDiscountPercent))}</small>}
            </span>
          </label>
        ))}
      </fieldset>
      <p className="onboarding-note">{c.catalogNotice}</p>
      <div className="onboarding-plans">
        {plans.map((plan) => {
          const selected = selection?.planId === plan.id;
          const price =
            interval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          return (
            <label
              className={`onboarding-plan ${selected ? "selected" : ""}`}
              key={plan.id}
            >
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={selected}
                disabled={!plan.available}
                required
                onChange={() => onChange({ planId: plan.id, interval })}
              />
              <span className="plan-heading">
                <strong>
                  {plan.developmentPlaceholder
                    ? `${c.steps[4]} ${plan.name.replace(/^PLAN /, "")}`
                    : plan.name}
                </strong>
                <span className="plan-selection-dot" />
              </span>
              {plan.recommended && (
                <span className="success-badge">{c.recommended}</span>
              )}
              {interval === "yearly" && plan.pricingModel !== "custom" &&
                plan.monthlyPrice !== null && plan.yearlyPrice !== null && plan.currency && (
                  <span className="plan-original-price">
                    <s>
                      {new Intl.NumberFormat("en", {
                        style: "currency",
                        currency: plan.currency,
                        maximumFractionDigits: 2,
                      }).format(plan.monthlyPrice * 12)} {c.perYear}
                    </s>
                    <span className="billing-discount">
                      {c.yearlyDiscount.replace("{percent}", String(annualDiscountPercent))}
                    </span>
                  </span>
                )}
              <span className="plan-price">
                {plan.pricingModel === "custom"
                  ? c.customPrice
                  : price === null || !plan.currency
                    ? c.pricePending
                    : `${plan.pricingModel === "from" ? `${c.priceFrom} ` : ""}${new Intl.NumberFormat("en", {
                        style: "currency",
                        currency: plan.currency,
                        minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
                        maximumFractionDigits: 2,
                      }).format(price)} ${interval === "monthly" ? c.perMonth : c.perYear}` }
              </span>
              <span className="plan-description">
                {plan.developmentPlaceholder
                  ? c.planDescription
                  : plan.description}
              </span>
              {plan.features.length > 0 && (
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              )}
              <span className="plan-select-label">
                {selected ? c.selected : c.select}
              </span>
            </label>
          );
        })}
      </div>
    </>
  );
}
