import { apiRequest } from "@/lib/api/client";
import { readLocalSettings } from "@/features/workspace/repository";
import { readDemoDrafts } from "@/features/campaigns/service";
import { applyOnboardingPreview } from "./onboarding-preview";
import { getLifecycle, getNextAction, getSetupSummary } from "./overview-model";
import type { DashboardOverview } from "./types";
import type { BusinessRole } from "@/features/access/types";
export type DashboardFixture =
  "new" | "partial" | "active" | "manager" | "staff" | "error" | "loading";
export interface DashboardService {
  getOverview(
    businessId?: string,
    signal?: AbortSignal,
  ): Promise<DashboardOverview>;
}
/** Browser transport uses the agreed secure cookie session; no local token storage. */
export const dashboardService: DashboardService = {
  async getOverview(businessId, signal) {
    if (!process.env.NEXT_PUBLIC_API_URL) throw new Error("unavailable");
    return apiRequest<DashboardOverview>(
      businessId
        ? `/api/v1/businesses/${encodeURIComponent(businessId)}/dashboard`
        : "/api/v1/dashboard",
      { credentials: "include", cache: "no-store", signal },
    );
  },
};
export function getDashboardService(
  fixture: DashboardFixture,
  previewRole?: BusinessRole,
): DashboardService {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_DASHBOARD_MODE === "api"
  )
    return dashboardService;
  return {
    async getOverview(_businessId, signal) {
      const { fixtureMembership } =
        await import("@/mocks/dashboard/permissions");
      const present = (overview: DashboardOverview) =>
        prepareOverview(
          previewRole
            ? {
                ...overview,
                membership: fixtureMembership(
                  overview.business.id,
                  previewRole,
                ),
              }
            : overview,
        );
      if (fixture === "loading")
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, 8000);
          signal?.addEventListener(
            "abort",
            () => {
              clearTimeout(timer);
              reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true },
          );
        });
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      if (fixture === "error") throw new Error("fixture error");
      const { newBusiness } = await import("@/mocks/dashboard/newBusiness");
      if (
        fixture === "active" ||
        fixture === "manager" ||
        fixture === "staff"
      ) {
        const { activeBusiness } =
          await import("@/mocks/dashboard/activeBusiness");
        return present(
          applyBusinessSettings({
            ...activeBusiness,
            membership: fixtureMembership(
              activeBusiness.business.id,
              fixture === "manager"
                ? "MANAGER"
                : fixture === "staff"
                  ? "STAFF"
                  : "OWNER",
            ),
          }),
        );
      }
      if (fixture === "partial") {
        const { partialBusiness } =
          await import("@/mocks/dashboard/partialBusiness");
        return present(applyBusinessSettings(partialBusiness));
      }
      const base = applyOnboardingPreview(newBusiness);
      const overview = applyBusinessSettings(base);
      const drafts = readDemoDrafts(overview.business.id);
      return present({
        ...overview,
        state: drafts.length > 0 ? "partial" : "new",
        setup: { ...overview.setup, campaign: drafts.length > 0 },
        campaigns: drafts.map((draft) => ({
          id: draft.id,
          name: draft.name,
          status: draft.status,
          startedAt: null,
          channels: draft.channels.map((name) => ({
            name,
            status: "notConfigured" as const,
          })),
        })),
      });
    },
  };
}

function applyBusinessSettings(base: DashboardOverview): DashboardOverview {
  const settings = readLocalSettings(base.business.id);
  const summary = settings
    ? {
        ...base.business,
        name: settings.name,
        category: settings.category,
        city: settings.city,
        country: settings.country,
        description: settings.description,
        website: settings.website,
        instagram: settings.instagram,
        accent: settings.accent,
        logoUrl: settings.logoUrl,
      }
    : base.business;
  return {
    ...base,
    business: summary,
    businesses: [summary],
    user: {
      ...base.user,
      firstName: settings?.firstName || base.user.firstName,
    },
  };
}

function prepareOverview(data: DashboardOverview): DashboardOverview {
  return {
    ...data,
    lifecycle: getLifecycle(data),
    nextAction: getNextAction(data),
    setupSummary: getSetupSummary(data),
  };
}
