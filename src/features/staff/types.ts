import type { BusinessMembership, UserSummary } from "@/features/access/types";
import type { CustomerEventType } from "@/features/dashboard/types";
export type StaffActionType =
  | "VISIT_CREATED"
  | "STAMP_ADDED"
  | "SUBSCRIPTION_USED"
  | "REWARD_REDEEMED"
  | "OFFER_REDEEMED";
export interface StaffAction {
  id: string;
  type: StaffActionType;
  resourceId?: string;
  remainingAfter?: number;
}
export interface StaffCustomerView {
  id: string;
  businessId: string;
  name: string;
  customerSince: string | null;
  loyalty: {
    stamps: number;
    target: number;
    nextReward: string;
    rewardAvailable: boolean;
  } | null;
  membership: {
    id: string;
    name: string;
    visitsRemaining: number | null;
  } | null;
  offers: { id: string; name: string }[];
  /** Eligibility and configured tools are decided by Symfony; never calculated here. */
  availableActions: StaffAction[];
}
export interface StaffRecentAction {
  id: string;
  customerName: string;
  type: CustomerEventType;
  occurredAt: string;
  performedByMemberId: string;
}
export interface StaffContext {
  business: { id: string; name: string; logoUrl: string | null };
  user: UserSummary;
  membership: BusinessMembership;
  recentActions: StaffRecentAction[];
}
export interface StaffActionResult {
  customer: StaffCustomerView;
  event: StaffRecentAction;
}
