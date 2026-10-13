import { apiRequest } from "@/lib/api/client";
import type {
  StaffActionResult,
  StaffContext,
  StaffCustomerView,
} from "./types";
export interface StaffService {
  context(signal?: AbortSignal): Promise<StaffContext>;
  resolveCustomer(
    businessId: string,
    code: string,
    signal?: AbortSignal,
  ): Promise<StaffCustomerView>;
  execute(
    businessId: string,
    customerId: string,
    actionId: string,
    idempotencyKey: string,
    signal?: AbortSignal,
  ): Promise<StaffActionResult>;
}
export const staffService: StaffService = {
  context: (signal) =>
    apiRequest("/api/v1/staff/context", {
      credentials: "include",
      cache: "no-store",
      signal,
    }),
  resolveCustomer: (id, code, signal) =>
    apiRequest(
      `/api/v1/businesses/${encodeURIComponent(id)}/staff/resolve-customer`,
      {
        method: "POST",
        body: JSON.stringify({ code }),
        credentials: "include",
        signal,
      },
    ),
  execute: (id, customerId, actionId, idempotencyKey, signal) =>
    apiRequest(
      `/api/v1/businesses/${encodeURIComponent(id)}/staff/customers/${encodeURIComponent(customerId)}/actions`,
      {
        method: "POST",
        body: JSON.stringify({ actionId, idempotencyKey }),
        signal,
        credentials: "include",
      },
    ),
};
export function getStaffService(demo: boolean): StaffService {
  if (!demo || process.env.NODE_ENV !== "development") return staffService;
  const context = async (): Promise<StaffContext> => {
    const query = new URLSearchParams(window.location.search);
    const value = query.get("workspaceDemo") ?? query.get("demo");
    const fixture =
      value === "active" || value === "partial" || value === "manager"
        ? value
        : "new";
    const { getDashboardService } =
      await import("@/features/dashboard/service");
    const overview = await getDashboardService(fixture, "STAFF").getOverview(
      query.get("business") ?? undefined,
    );
    const { readPrototypeLedger } =
      await import("@/features/prototype/repository");
    const { readLocalRecords } =
      await import("@/features/workspace/repository");
    return {
      business: {
        id: overview.business.id,
        name: overview.business.name,
        logoUrl: overview.business.logoUrl,
      },
      user: overview.user,
      membership: overview.membership,
      recentActions: readPrototypeLedger(overview.business.id)
        .events.filter((e) => e.performedByMemberId === overview.membership.id)
        .slice(-8)
        .reverse()
        .map((e) => ({
          id: e.id,
          customerName:
            readLocalRecords(overview.business.id, "customers").find(
              (c) => c.id === e.customerId,
            )?.name ?? "",
          type: e.type,
          occurredAt: e.occurredAt,
          performedByMemberId: e.performedByMemberId,
        })),
    };
  };
  return {
    context,
    async resolveCustomer(businessId, code) {
      const current = await context();
      if (
        current.business.id !== businessId ||
        !current.membership.permissions.includes("customer.scan")
      )
        throw new Error("denied");
      const { parsePrototypeCode, prototypeStaffCustomer } =
        await import("@/features/prototype/customer-model");
      return prototypeStaffCustomer(
        businessId,
        parsePrototypeCode(code, businessId),
      );
    },
    async execute(businessId, customerId, actionId, idempotencyKey) {
      const current = await context();
      if (current.business.id !== businessId) throw new Error("denied");
      const { prototypeStaffCustomer } =
        await import("@/features/prototype/customer-model");
      const { readPrototypeLedger, executePrototype } =
        await import("@/features/prototype/repository");
      const { staffActionPermissions } = await import("./actions");
      const type =
        actionId === "visit"
          ? "VISIT_CREATED"
          : actionId.startsWith("award:")
            ? (prototypeStaffCustomer(
                businessId,
                customerId,
              ).availableActions.find((a) => a.id === actionId)?.type ??
              "STAMP_ADDED")
            : actionId.startsWith("membership:")
              ? "SUBSCRIPTION_USED"
              : actionId.startsWith("redeem:")
                ? "REWARD_REDEEMED"
                : null;
      if (
        !type ||
        !current.membership.permissions.includes(staffActionPermissions[type])
      )
        throw new Error("denied");
      const before = readPrototypeLedger(businessId);
      if (
        !before.operations[idempotencyKey] &&
        !prototypeStaffCustomer(businessId, customerId).availableActions.some(
          (a) => a.id === actionId,
        )
      )
        throw new Error("action");
      const resourceId = actionId.slice(actionId.indexOf(":") + 1);
      const assignment =
        type === "SUBSCRIPTION_USED"
          ? before.memberships?.find(
              (m) => m.id === resourceId && m.customerId === customerId,
            )
          : undefined;
      const journal = executePrototype({
        businessId,
        customerId,
        key: idempotencyKey,
        type:
          type === "VISIT_CREATED"
            ? "visit"
            : type === "STAMP_ADDED" || type === "POINTS_ADDED"
              ? "award"
              : type === "SUBSCRIPTION_USED"
                ? "membership-manage"
                : "redeem",
        ...(type === "STAMP_ADDED" || type === "POINTS_ADDED"
          ? { programmeId: resourceId }
          : type === "SUBSCRIPTION_USED"
            ? {
                membershipId: assignment?.membershipId,
                membershipOperation: {
                  action:
                    assignment?.remainingVisits === null
                      ? ("verify" as const)
                      : ("use" as const),
                  assignmentId: resourceId,
                  permissions: current.membership.permissions,
                },
              }
            : type === "REWARD_REDEEMED"
              ? { rewardId: resourceId }
              : {}),
        memberId: current.membership.id,
        actorName: current.user.firstName,
      });
      const e = journal.events.find(
        (e) => e.id === journal.operations[idempotencyKey].eventId,
      )!;
      const customer = prototypeStaffCustomer(businessId, customerId);
      return {
        customer,
        event: {
          id: e.id,
          customerName: customer.name,
          type: e.type,
          occurredAt: e.occurredAt,
          performedByMemberId: e.performedByMemberId,
        },
      };
    },
  };
}
