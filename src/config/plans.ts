import type { Plan } from "@/features/onboarding/types";
import type { OnboardingContent } from "@/content/onboarding/types";
/** Owner-provided provisional catalog. Production pricing and entitlement come from Symfony. */
export const annualDiscountPercent = 30;
export const developmentPlanCatalog = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 25,
    yearlyPrice: 210,
    pricingModel: "from",
    limits: { activeCustomers: 300, locations: 1 },
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 79,
    yearlyPrice: 663.6,
    pricingModel: "from",
    limits: { activeCustomers: 1500, locations: 2 },
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: null,
    yearlyPrice: null,
    pricingModel: "custom",
    limits: null,
  },
] as const;
export function getDevelopmentPlans(c: OnboardingContent): Plan[] {
  return developmentPlanCatalog.map((plan) => ({
    ...plan,
    ...c.planCopy[plan.id],
    currency: "EUR",
    recommended: false,
    trialDays: null,
    available: true,
    developmentPlaceholder: false,
  }));
}
export const onboardingMode = "preview" as const;

/** Exact positions in the owner-approved translated feature lists; no inherited entitlements. */
export const developmentComparisonFeatures: Record<
  string,
  Partial<Record<number, number>>
> = {
  starter: { 2: 1, 3: 0, 7: 4 },
  growth: { 14: 0, 9: 1, 10: 2, 11: 3 },
  business: { 7: 1, 8: 2, 12: 3, 13: 4 },
};
