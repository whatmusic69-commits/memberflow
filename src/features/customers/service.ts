import { apiRequest } from "@/lib/api/client";
import type { CustomerDirectory, CustomerDetail, CustomerQuery } from "./types";
export function customerService(demo: boolean) {
  const development =
    demo &&
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DASHBOARD_MODE !== "api";
  return {
    async directory(
      businessId: string,
      query: CustomerQuery,
      signal?: AbortSignal,
    ): Promise<CustomerDirectory> {
      if (development) {
        const { seedWorkspaceFixture } =
          await import("@/mocks/dashboard/seed-workspace");
        seedWorkspaceFixture(
          businessId,
          new URLSearchParams(window.location.search).get("demo") ?? "new",
        );
        const { prototypeDirectory } =
          await import("@/features/prototype/customer-model");
        return prototypeDirectory(businessId, query);
      }
      const params = new URLSearchParams({
        period: String(query.period),
        segment: query.segment,
        search: query.search,
        page: String(query.page),
        archived: String(query.archived ?? false),
      });
      return apiRequest<CustomerDirectory>(
        `/api/v1/businesses/${encodeURIComponent(businessId)}/customers/overview?${params}`,
        { credentials: "include", cache: "no-store", signal },
      );
    },
    async detail(
      businessId: string,
      id: string,
      signal?: AbortSignal,
    ): Promise<CustomerDetail> {
      if (development) {
        const { seedWorkspaceFixture } =
          await import("@/mocks/dashboard/seed-workspace");
        seedWorkspaceFixture(
          businessId,
          new URLSearchParams(window.location.search).get("demo") ?? "new",
        );
        const { prototypeDetail } =
          await import("@/features/prototype/customer-model");
        return prototypeDetail(businessId, id);
      }
      return apiRequest<CustomerDetail>(
        `/api/v1/businesses/${encodeURIComponent(businessId)}/customers/${encodeURIComponent(id)}/activity`,
        { credentials: "include", cache: "no-store", signal },
      );
    },
  };
}
