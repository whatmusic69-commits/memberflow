import { apiRequest } from "@/lib/api/client";
import type { CustomerDirectory, CustomerDetail, CustomerQuery } from "./types";
export function customerService(demo: boolean) {
  const development = demo && process.env.NODE_ENV === "development";
  return {
    async directory(
      businessId: string,
      query: CustomerQuery,
      signal?: AbortSignal,
    ): Promise<CustomerDirectory> {
      if (development) {
        const { directoryFixture } = await import("@/mocks/customers/fixtures");
        return directoryFixture(businessId, query);
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
        const { detailFixture } = await import("@/mocks/customers/fixtures");
        return detailFixture(businessId, id);
      }
      return apiRequest<CustomerDetail>(
        `/api/v1/businesses/${encodeURIComponent(businessId)}/customers/${encodeURIComponent(id)}/activity`,
        { credentials: "include", cache: "no-store", signal },
      );
    },
  };
}
