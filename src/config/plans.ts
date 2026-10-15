import type { Plan } from "@/features/onboarding/types";
import type { OnboardingContent } from "@/content/onboarding/types";
import type { Locale } from "@/content";
import { planFeatureContent } from "@/content/plan-features";
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
type CatalogPlanId = (typeof developmentPlanCatalog)[number]["id"];
type FeatureDefinition = { row: number; source: CatalogPlanId; index: number } | { row: number; extra: "wallet" | "campaigns" | "crm" };
const starterFeatures: FeatureDefinition[] = [
  { row: 3, source: "starter", index: 0 },
  { row: 2, source: "starter", index: 1 },
  { row: -1, source: "starter", index: 2 },
  { row: 7, source: "starter", index: 4 },
];
/** Owner confirmed: Growth inherits Starter; Business has Growth's tools with larger custom capacity. */
const growthFeatures: FeatureDefinition[] = [
  ...starterFeatures.filter(feature => feature.row !== 7),
  { row: 7, source: "business", index: 1 },
  { row: 4, extra: "wallet" },
  { row: 5, extra: "campaigns" },
  { row: 6, extra: "crm" },
  { row: 14, source: "growth", index: 0 },
  { row: 9, source: "growth", index: 1 },
  { row: 10, source: "growth", index: 2 },
  { row: 11, source: "growth", index: 3 },
  { row: 8, source: "business", index: 2 },
  { row: 12, source: "business", index: 3 },
  { row: 13, source: "business", index: 4 },
];
const featuresByPlan: Record<CatalogPlanId, FeatureDefinition[]> = {
  starter: starterFeatures,
  growth: growthFeatures,
  business: growthFeatures,
};
export function getDevelopmentPlans(c: OnboardingContent, locale: Locale): Plan[] {
  return developmentPlanCatalog.map((plan) => ({
    ...plan,
    ...c.planCopy[plan.id],
    features: featuresByPlan[plan.id].map(feature => "extra" in feature
      ? planFeatureContent[locale][feature.extra]
      : c.planCopy[feature.source].features[feature.index]),
    currency: "EUR",
    recommended: false,
    trialDays: null,
    available: true,
    developmentPlaceholder: false,
  }));
}
export const onboardingMode = "preview" as const;

/** Comparison indices are derived from the same feature definitions as plan cards. */
export const developmentComparisonFeatures: Record<string, Partial<Record<number, number>>> =
  Object.fromEntries(Object.entries(featuresByPlan).map(([id, features]) => [id,
    Object.fromEntries(features.flatMap((feature, index) => feature.row < 0 ? [] : [[feature.row, index]])),
  ]));
