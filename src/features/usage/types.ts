export interface UsageMetric {
  key: string;
  used: number;
  /** null = unlimited; undefined = not yet defined by the catalog. */
  limit?: number | null;
}
export interface UsagePlan {
  description?: string;
  features?: string[];
  id: string;
  name: string;
  price: number | null;
  currency: string;
  interval: "month" | "year";
  limits: Record<string, number | null | undefined>;
}
export interface BusinessUsage {
  businessId: string;
  plan: UsagePlan | null;
  subscriptionStatus: string | null;
  metrics: UsageMetric[];
  availablePlans: UsagePlan[];
  canChangePlan: boolean;
}
export function usageState(metric: UsageMetric) {
  const used = Math.max(0, metric.used);
  const limited = typeof metric.limit === "number";
  const limit = limited ? Math.max(0, metric.limit!) : null;
  const percentage =
    limit === null
      ? null
      : limit === 0
        ? used > 0
          ? 100
          : 0
        : (used / limit) * 100;
  const limitReached = limit !== null && used >= limit;
  const state = limitReached
    ? "reached"
    : percentage !== null && percentage >= 90
      ? "critical"
      : percentage !== null && percentage >= 70
        ? "warning"
        : "normal";
  return {
    used,
    limit,
    percentage,
    remaining: limit === null ? null : Math.max(0, limit - used),
    limitReached,
    state,
  };
}
