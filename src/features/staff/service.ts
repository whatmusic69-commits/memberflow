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
  return {
    async context() {
      return (await import("@/mocks/staff/fixtures")).staffContext;
    },
    async resolveCustomer() {
      throw new Error("unavailable");
    },
    async execute() {
      throw new Error("unavailable");
    },
  };
}
