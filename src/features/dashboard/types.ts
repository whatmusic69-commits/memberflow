import type { GoalId } from "@/features/onboarding/types";
export type WorkspaceRole = "OWNER" | "ADMIN" | "MANAGER" | "STAFF";
export type Section =
  | "overview"
  | "campaigns"
  | "offers"
  | "customers"
  | "loyalty"
  | "memberships"
  | "automations"
  | "integrations"
  | "settings";
export type ConnectionStatus =
  "ready" | "connected" | "notConfigured" | "processing" | "failed";
export type CampaignStatus =
  | "DRAFT"
  | "PROCESSING"
  | "PUBLISHED"
  | "PARTIALLY_PUBLISHED"
  | "FAILED"
  | "PAUSED";
export interface BusinessSummary {
  country?: string;
  description?: string;
  website?: string;
  instagram?: string;
  id: string;
  name: string;
  category: string;
  city: string;
  logoUrl: string | null;
  accent: string;
  planName: string | null;
  goals: GoalId[];
}
export interface CampaignSummary {
  id: string;
  name: string;
  status: CampaignStatus;
  startedAt: string | null;
  channels: { name: string; status: ConnectionStatus }[];
}
export interface CustomerActivityItem {
  id: string;
  name: string;
  kind: "joined" | "visit" | "reward" | "membership" | "redemption";
  occurredAt: string;
  detail: string | null;
}
export interface AttentionItem {
  id: string;
  name: string;
  reason: "inactive" | "expiring" | "rewardNear";
  value: number;
}
/** Screen DTO, not a mirror of backend entities. Null metrics mean unavailable, never zero. */
export interface DashboardOverview {
  source: "api" | "demo";
  business: BusinessSummary;
  businesses: BusinessSummary[];
  user: { id: string; firstName: string; role: WorkspaceRole };
  permissions: { canCreate: boolean; canManageBusiness: boolean };
  state: "new" | "active";
  setup: {
    business: boolean;
    campaign: boolean;
    customers: boolean;
    retention: boolean;
  };
  flow: {
    period: string;
    reach: number | null;
    connect: number | null;
    retain: number | null;
    return: number | null;
  };
  campaigns: CampaignSummary[];
  customerActivity: CustomerActivityItem[];
  attention: AttentionItem[];
  retention: {
    loyalty: number | null;
    memberships: number | null;
    offers: number | null;
  };
  connection: {
    name: "qr" | "profile" | "apple" | "google";
    status: ConnectionStatus;
  }[];
  integrations: { name: string; status: ConnectionStatus }[];
}
