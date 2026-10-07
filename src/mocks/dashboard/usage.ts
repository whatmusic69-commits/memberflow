import { developmentPlanCatalog } from "@/config/plans";
import type { BusinessSummary } from "@/features/dashboard/types";
import type { BusinessUsage, UsagePlan } from "@/features/usage/types";
// Owner-provided catalog only; undefined quotas never mean unlimited.
export function developmentUsage(business: BusinessSummary): BusinessUsage {
  const query = new URLSearchParams(window.location.search);
  const fixture = query.get("demo");
  const usageFixture = query.get("usage");
  const plans: UsagePlan[] = developmentPlanCatalog.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.monthlyPrice,
    currency: "EUR",
    interval: "month",
    limits: p.limits ?? {},
  }));
  const plan =
    plans.find((p) => p.id === business.planName?.toLowerCase()) ??
    (fixture === "active" ? plans[1] : fixture === "partial" ? plans[0] : null);
  const customers =
    fixture === "active" || fixture === "partial"
      ? usageFixture === "reached"
        ? 300
        : usageFixture === "near"
          ? 284
          : fixture === "active"
            ? 184
            : 24
      : 0;
  return {
    businessId: business.id,
    plan,
    subscriptionStatus: null,
    canChangePlan: true,
    availablePlans: plans,
    metrics: [
      {
        key: "activeCustomers",
        used: customers,
        limit: plan?.limits.activeCustomers,
      },
      { key: "locations", used: 1, limit: plan?.limits.locations },
    ],
  };
}
