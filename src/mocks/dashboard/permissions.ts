import type { BusinessMembership, Permission } from "@/features/access/types";
/** Explicit fixture grants only. These are not production role policies. */
export const ownerPermissions: Permission[] = [
  "overview.read",
  "campaign.read",
  "campaign.create",
  "offer.read",
  "offer.create",
  "customer-page.read",
  "customer-page.manage",
  "customer.read",
  "customer.create",
  "loyalty.read",
  "loyalty.create",
  "membership.read",
  "membership.create",
  "automation.read",
  "automation.create",
  "integration.read",
  "integration.manage",
  "business.settings.read",
  "business.settings.manage",
  "billing.read",
  "profile.read",
  "team.read",
  "team.manage",
  "customer.scan",
  "visit.record",
  "loyalty.award",
  "membership.redeem",
  "reward.redeem",
  "offer.redeem",
];
export const managerPermissions: Permission[] = [
  "overview.read",
  "campaign.read",
  "campaign.create",
  "offer.read",
  "offer.create",
  "customer-page.read",
  "customer-page.manage",
  "customer.read",
  "customer.create",
  "loyalty.read",
  "loyalty.create",
  "membership.read",
  "membership.create",
  "profile.read",
];
export const adminPermissions: Permission[] = ownerPermissions.filter(
  (permission) => permission !== "billing.read",
);
export const staffPermissions: Permission[] = [
  "customer.scan",
  "visit.record",
  "loyalty.award",
  "membership.redeem",
  "reward.redeem",
  "offer.redeem",
  "profile.read",
];
export function fixtureMembership(
  businessId: string,
  role: BusinessMembership["role"] = "OWNER",
): BusinessMembership {
  return {
    id: `demo-membership-${role.toLowerCase()}`,
    businessId,
    userId: "demo-user",
    role,
    status: "ACTIVE",
    permissions:
      role === "STAFF"
        ? staffPermissions
        : role === "MANAGER"
          ? managerPermissions
          : role === "ADMIN"
            ? adminPermissions
            : ownerPermissions,
    joinedAt: null,
    lastActiveAt: null,
  };
}
