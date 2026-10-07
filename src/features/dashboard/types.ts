import type { GoalId } from "@/features/onboarding/types";
import type {
  BusinessMembership,
  BusinessRole,
  UserSummary,
} from "@/features/access/types";
export type WorkspaceRole = BusinessRole;
export type Section =
  | "billing"
  | "overview"
  | "campaigns"
  | "offers"
  | "customer-page"
  | "customers"
  | "loyalty"
  | "memberships"
  | "automations"
  | "integrations"
  | "settings"
  | "team";
export type ConnectionStatus =
  "ready" | "connected" | "notConfigured" | "processing" | "failed";
export type CampaignStatus =
  | "DRAFT"
  | "PROCESSING"
  | "PUBLISHED"
  | "PARTIALLY_PUBLISHED"
  | "FAILED"
  | "PAUSED"
  | "COMPLETED";
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
export type CustomerEventType =
  | "CUSTOMER_JOINED"
  | "QR_SCANNED"
  | "VISIT_CREATED"
  | "STAMP_ADDED"
  | "REWARD_EARNED"
  | "REWARD_REDEEMED"
  | "SUBSCRIPTION_USED"
  | "OFFER_REDEEMED"
  | "CUSTOMER_RETURNED";
export type LifecycleStage = "reach" | "connect" | "retain" | "return";
export type LifecyclePeriod = 7 | 30 | 90;
export type LifecycleStageState =
  "completed" | "current" | "notConfigured" | "waiting";
export interface LifecycleSummary {
  mode: "setup" | "active";
  period: LifecyclePeriod;
  stages: Record<
    LifecycleStage,
    { state: LifecycleStageState; value: number | null }
  >;
}
export type OverviewAction =
  | "campaigns"
  | "customers"
  | "loyalty"
  | "memberships"
  | "integrations"
  | "offers";
export interface NextAction {
  kind: "setup" | "createCampaign" | "returnOffer" | "reviewCampaign";
  target: OverviewAction;
  campaignId?: string;
  /** Optional operational copy returned by Symfony in the requested locale. */
  title?: string;
  description?: string;
}
export interface CustomerActivityItem {
  id: string;
  name: string;
  kind:
    | CustomerEventType
    | "joined"
    | "visit"
    | "reward"
    | "membership"
    | "redemption";
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
  user: UserSummary;
  membership: BusinessMembership;
  permissions: { canCreate: boolean; canManageBusiness: boolean };
  state: "new" | "partial" | "active";
  lifecycle?: LifecycleSummary;
  nextAction?: NextAction | null;
  setupSummary?: { completed: number; total: number };
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
