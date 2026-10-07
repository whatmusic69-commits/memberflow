import { apiRequest } from "@/lib/api/client";
import type {
  Activation,
  BusinessDraft,
  BusinessRecord,
  GoalId,
  OwnerAccount,
  OwnerDraft,
  Plan,
  PlanSelection,
  ProfileDraft,
} from "./types";
export interface OnboardingService {
  register(
    data: OwnerDraft & {
      password: string;
      termsAccepted: boolean;
      privacyAccepted: boolean;
    },
  ): Promise<OwnerAccount>;
  createBusiness(data: BusinessDraft): Promise<BusinessRecord>;
  saveGoals(businessId: string, goals: GoalId[]): Promise<void>;
  updateProfile(businessId: string, profile: ProfileDraft): Promise<void>;
  getPlans(): Promise<Plan[]>;
  beginActivation(
    businessId: string,
    selection: PlanSelection,
  ): Promise<{ checkoutUrl: string | null; activation: Activation }>;
  getActivation(businessId: string): Promise<Activation>;
}
/** Proposed Symfony contracts; not enabled by the preview UI. Confirm auth/CORS and DTOs before integration. */
export const symfonyOnboardingService: OnboardingService = {
  register: (data) =>
    apiRequest("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include",
    }),
  createBusiness: (data) =>
    apiRequest("/api/v1/businesses", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        otherType: data.type === "other" ? data.otherType?.trim() : undefined,
      }),
      credentials: "include",
    }),
  saveGoals: (id, goals) =>
    apiRequest(`/api/v1/businesses/${encodeURIComponent(id)}/goals`, {
      method: "PUT",
      body: JSON.stringify({ goals }),
      credentials: "include",
    }),
  updateProfile: (id, profile) => {
    const body = new FormData();
    for (const key of [
      "accent",
      "description",
      "website",
      "instagram",
    ] as const)
      body.append(key, profile[key]);
    body.append("logoBorder", String(profile.logoBorder));
    if (profile.logo) body.append("logo", profile.logo);
    return apiRequest(`/api/v1/businesses/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
      credentials: "include",
    });
  },
  getPlans: () => apiRequest("/api/v1/plans", { credentials: "include" }),
  beginActivation: (id, selection) =>
    apiRequest(`/api/v1/businesses/${encodeURIComponent(id)}/subscription`, {
      method: "POST",
      body: JSON.stringify(selection),
      credentials: "include",
    }),
  getActivation: (id) =>
    apiRequest(
      `/api/v1/billing/subscription?businessId=${encodeURIComponent(id)}`,
      { credentials: "include" },
    ),
};
