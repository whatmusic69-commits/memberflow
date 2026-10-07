import type { Permission } from "@/features/access/types";
import type { StaffAction, StaffCustomerView, StaffActionType } from "./types";
export const staffActionPermissions: Record<StaffActionType, Permission> = {
  VISIT_CREATED: "visit.record",
  STAMP_ADDED: "loyalty.award",
  SUBSCRIPTION_USED: "membership.redeem",
  REWARD_REDEEMED: "reward.redeem",
  OFFER_REDEEMED: "offer.redeem",
};
/** Display gates only; availableActions and reward availability are server-supplied. */
export function visibleStaffActions(
  customer: StaffCustomerView,
  can: (permission: Permission) => boolean,
): StaffAction[] {
  return customer.availableActions.filter((action) => {
    if (!can(staffActionPermissions[action.type])) return false;
    if (action.type === "STAMP_ADDED") return customer.loyalty !== null;
    if (action.type === "SUBSCRIPTION_USED")
      return customer.membership !== null;
    if (action.type === "REWARD_REDEEMED")
      return customer.loyalty?.rewardAvailable === true;
    if (action.type === "OFFER_REDEEMED")
      return customer.offers.some((offer) => offer.id === action.resourceId);
    return true;
  });
}
