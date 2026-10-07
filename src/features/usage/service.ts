import { apiRequest } from "@/lib/api/client";
import type { BusinessSummary } from "@/features/dashboard/types";
import type { BusinessUsage, UsagePlan } from "./types";
const options = { credentials: "include", cache: "no-store" } as const;
export function usageService() {
  return {
    get: (businessId: string, signal?: AbortSignal) =>
      apiRequest<BusinessUsage>(
        `/api/v1/businesses/${encodeURIComponent(businessId)}/usage`,
        { ...options, signal },
      ),
    change: (
      businessId: string,
      planId: string,
      interval: UsagePlan["interval"],
    ) =>
      apiRequest<{ checkoutUrl: string }>(
        `/api/v1/businesses/${encodeURIComponent(businessId)}/billing/plan-change`,
        {
          ...options,
          method: "POST",
          body: JSON.stringify({ planId, interval }),
        },
      ),
  };
}
export async function getUsage(
  business: BusinessSummary,
  demo: boolean,
  signal?: AbortSignal,
): Promise<BusinessUsage> {
  if (!demo) return usageService().get(business.id, signal);
  const { developmentUsage } = await import("@/mocks/dashboard/usage");
  return developmentUsage(business);
}
