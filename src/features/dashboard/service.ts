import { readLocalUserName } from "@/features/workspace/user-profile";
import { apiRequest } from "@/lib/api/client";
import { readLocalRecords } from "@/features/workspace/repository";
import { applyBusinessProfile } from "@/features/workspace/business-profile";
import {
  readSelectedBusiness,
  readBusinessCatalog,
  rememberBusiness,
} from "@/features/workspace/business-catalog";
import { readPrototypeLedger } from "@/features/prototype/repository";
import {
  prototypeDirectory,
  prototypeReturnTrend,
} from "@/features/prototype/customer-model";
import { readPageDraft } from "@/features/customer-page/service";
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
    async getOverview(businessId, signal) {
      const { fixtureMembership } =
        await import("@/mocks/dashboard/permissions");
      const { seedWorkspaceFixture } =
        await import("@/mocks/dashboard/seed-workspace");
      const present = (input: DashboardOverview) => {
        seedWorkspaceFixture(input.business.id, fixture);
        rememberBusiness(input.business);
        const catalog = readBusinessCatalog().map(applyBusinessProfile);
        const requestedBusiness =
          businessId ??
          (fixture === "new" ? readSelectedBusiness() : undefined);
        const selected = requestedBusiness
          ? catalog.find((b) => b.id === requestedBusiness)
          : input.business;
        if (!selected) throw new Error("business not found");
        const overview =
          selected.id === input.business.id
            ? input
            : applyBusinessSettings({
                ...newBusiness,
                business: selected,
                membership: fixtureMembership(selected.id),
                user: input.user,
              });
        overview.businesses = catalog;
        overview.user = {
          ...overview.user,
          firstName:
            readLocalUserName(overview.user.id) ?? overview.user.firstName,
        };
        return prepareOverview(
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
      };
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
      const drafts = readDemoDrafts(overview.business.id).filter(
        (d) => !d.archived,
      );
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
  const summary = applyBusinessProfile(
    settings
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
      : base.business,
  );
  return {
    ...base,
    business: summary,
    businesses: base.businesses.map((b) =>
      b.id === summary.id ? summary : applyBusinessProfile(b),
    ),
    user: {
      ...base.user,
      firstName: settings?.firstName || base.user.firstName,
    },
  };
}

function prepareOverview(data: DashboardOverview): DashboardOverview {
  if (data.source === "demo") {
    const id = data.business.id;
    const ledger = readPrototypeLedger(id);
    const records = {
      loyalty: readLocalRecords(id, "loyalty").filter((r) => !r.archived),
      memberships: readLocalRecords(id, "memberships").filter(
        (r) => !r.archived,
      ),
      offers: readLocalRecords(id, "offers").filter((r) => !r.archived),
    };
    const localCustomers = prototypeDirectory(id, {
      period: 30,
      segment: "all",
      search: "",
      page: 1,
    });
    const drafts = readDemoDrafts(id).filter((d) => !d.archived);
    const returnTrend = prototypeReturnTrend(
      id,
      localCustomers.statistics.trend.map((t) => t.date),
    );
    const localActivity = ledger.events
      .slice(-20)
      .reverse()
      .map((e) => ({
        id: e.id,
        name:
          readLocalRecords(id, "customers").find((c) => c.id === e.customerId)
            ?.name ?? "",
        kind: e.type,
        occurredAt: e.occurredAt,
        detail: e.detail,
      }));
    data = {
      ...data,
      lifecycle: undefined,
      nextAction: undefined,
      setupSummary: undefined,
      setup: {
        ...data.setup,
        customers: ledger.progress.length > 0 || data.setup.customers,
        retention:
          records.loyalty.length > 0 ||
          records.memberships.length > 0 ||
          data.setup.retention,
        campaign: drafts.length > 0 || data.setup.campaign,
      },
      campaigns: [
        ...drafts.map((d) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          startedAt: null,
          channels: d.channels.map((name) => ({
            name,
            status: "notConfigured" as const,
          })),
        })),
        ...data.campaigns.filter((c) => !drafts.some((d) => d.id === c.id)),
      ],
      customerActivity: localActivity,
      attention: localCustomers.customers
        .filter((c) => c.state === "INACTIVE")
        .map((c) => ({
          id: c.id,
          name: c.name,
          reason: "inactive" as const,
          value: Math.floor(
            (Date.now() - Date.parse(c.lastVisitAt!)) / 86400000,
          ),
        })),
      retention: {
        loyalty: records.loyalty.length,
        memberships: records.memberships.length,
        offers: records.offers.length,
      },

      results: {
        period: {
          from: new Date(Date.now() - 30 * 86400000).toISOString(),
          to: new Date().toISOString(),
        },
        newCustomers: localCustomers.statistics.newCustomers,
        returnedCustomers: localCustomers.statistics.returningCustomers,
        offersRedeemed: 0,
        offerRevenue: null,
        returnRevenue: null,
        trend: localCustomers.statistics.trend.map((t) => ({
          date: t.date,
          visits: t.visits,
          returnedCustomers: returnTrend.get(t.date) ?? 0,
        })),
      },
      flow: {
        ...data.flow,
        reach: null,
        connect: localCustomers.statistics.totalCustomers,
        retain: ledger.progress.length,
        return: localCustomers.statistics.returningCustomers,
      },
    };
    if (
      data.state === "new" &&
      (drafts.length ||
        records.loyalty.length ||
        localCustomers.statistics.totalCustomers ||
        readPageDraft(id))
    )
      data.state = "partial";
  }
  return {
    ...data,
    lifecycle: getLifecycle(data),
    nextAction: getNextAction(data),
    setupSummary: getSetupSummary(data),
  };
}
