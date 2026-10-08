import { apiRequest } from "@/lib/api/client";
import type { Locale } from "@/content";
import type { Plan } from "@/features/onboarding/types";
/** Read-only public Symfony catalog. Never substitutes development prices or entitlements. */
export async function getPublicPlans(locale: Locale): Promise<Plan[]> {
  if (!process.env.NEXT_PUBLIC_API_URL) return [];
  try {
    const response = await apiRequest<unknown>("/api/v1/plans", {
      cache: "no-store",
      credentials: "omit",
      headers: { "Accept-Language": locale },
    });
    if (!Array.isArray(response)) return [];
    return response.filter((value): value is Plan => {
      if (!value || typeof value !== "object") return false;
      const plan = value as Partial<Plan>;
      return (
        typeof plan.id === "string" &&
        typeof plan.name === "string" &&
        typeof plan.description === "string" &&
        plan.available === true &&
        plan.developmentPlaceholder === false &&
        (plan.currency === null ||
          (typeof plan.currency === "string" &&
            /^[A-Z]{3}$/.test(plan.currency))) &&
        [plan.monthlyPrice, plan.yearlyPrice].every(
          (price) =>
            price === null ||
            (typeof price === "number" && Number.isFinite(price) && price >= 0),
        ) &&
        Array.isArray(plan.features) &&
        plan.features.every((feature) => typeof feature === "string") &&
        (plan.limits === null ||
          (typeof plan.limits === "object" &&
            Object.values(plan.limits).every(
              (limit) =>
                typeof limit === "number" &&
                Number.isFinite(limit) &&
                limit >= 0,
            )))
      );
    });
  } catch {
    return [];
  }
}
