export type GoalId =
  | "reach"
  | "campaigns"
  | "relationships"
  | "loyalty"
  | "memberships"
  | "insights"
  | "return";
export type BusinessType =
  "cafe" | "beauty" | "fitness" | "retail" | "services" | "other";
export type BillingInterval = "monthly" | "yearly";
export interface OwnerDraft {
  firstName: string;
  email: string;
}
export interface BusinessDraft {
  name: string;
  type: BusinessType;
  otherType?: string;
  country: string;
  city: string;
}
export interface ProfileDraft {
  logoBorder: boolean;
  accent: string;
  description: string;
  website: string;
  instagram: string;
  logo: File | null;
}
export interface Plan {
  id: string;
  name: string;
  description: string;
  pricingModel?: "from" | "custom";
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  currency: string | null;
  features: string[];
  limits: Record<string, number> | null;
  recommended: boolean;
  trialDays: number | null;
  available: boolean;
  developmentPlaceholder: boolean;
}
export interface PlanSelection {
  planId: string;
  interval: BillingInterval;
}
export type Activation =
  | { status: "pending" | "inactive"; businessId: string }
  | {
      status: "active" | "trialing";
      businessId: string;
      planId: string;
      verified: true;
    };
/** IDs and access are issued by Symfony. Drafts are never proof of identity or entitlement. */
export interface OwnerAccount {
  id: string;
  firstName: string;
  email: string;
}
export interface BusinessRecord {
  id: string;
  name: string;
}
