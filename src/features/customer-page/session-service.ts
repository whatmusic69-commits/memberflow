import { apiRequest, ApiError } from "@/lib/api/client";
import type { CustomerPagePersonal } from "./types";
/** Separate from business User authentication. No tokens/OTP are stored in the browser. */
export function customerSessionService(slug: string, demo = false) {
  const path =
    `/api/v1/customer/businesses/${encodeURIComponent(slug)}` as const;
  const configured = !demo && Boolean(process.env.NEXT_PUBLIC_API_URL);
  const requireService = () => {
    if (!configured) throw new Error("unavailable");
  };
  return {
    async getSession(
      signal?: AbortSignal,
    ): Promise<CustomerPagePersonal | null> {
      if (!configured) return null;
      try {
        return await apiRequest<CustomerPagePersonal>(`${path}/session`, {
          credentials: "include",
          cache: "no-store",
          signal,
        });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    async startJoin(phone: string): Promise<{ challengeId: string }> {
      requireService();
      return apiRequest(`${path}/join`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ phone }),
      });
    },
    async verifyOtp(
      challengeId: string,
      code: string,
    ): Promise<CustomerPagePersonal> {
      requireService();
      return apiRequest(`${path}/verify`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ challengeId, code }),
      });
    },
    async logout() {
      requireService();
      await apiRequest(`${path}/logout`, {
        method: "POST",
        credentials: "include",
      });
    },
  };
}
