export type BusinessRole = "OWNER" | "ADMIN" | "MANAGER" | "STAFF";
export type Permission =
  | "overview.read"
  | "campaign.read"
  | "campaign.create"
  | "offer.read"
  | "offer.create"
  | "customer-page.read"
  | "customer-page.manage"
  | "customer.read"
  | "customer.create"
  | "loyalty.read"
  | "loyalty.create"
  | "membership.read"
  | "membership.create"
  | "automation.read"
  | "automation.create"
  | "integration.read"
  | "integration.manage"
  | "business.settings.read"
  | "business.settings.manage"
  | "billing.read"
  | "profile.read"
  | "team.read"
  | "team.manage"
  | "customer.scan"
  | "visit.record"
  | "loyalty.award"
  | "membership.redeem"
  | "reward.redeem"
  | "offer.redeem";
export interface UserSummary {
  id: string;
  firstName: string;
  email?: string | null;
}
/** Access belongs to a User's membership of one business, never to the global User. */
export interface BusinessMembership {
  id: string;
  businessId: string;
  userId: string;
  role: BusinessRole;
  status: "ACTIVE" | "INACTIVE";
  permissions: Permission[];
  joinedAt: string | null;
  lastActiveAt: string | null;
}
export interface SessionContext {
  user: UserSummary;
  currentBusinessId?: string;
  businesses: {
    business: { id: string; name: string };
    membership: BusinessMembership;
  }[];
}
