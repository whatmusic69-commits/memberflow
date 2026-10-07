import type { StaffContext, StaffCustomerView } from "@/features/staff/types";
import { fixtureMembership } from "@/mocks/dashboard/permissions";
export const staffContext: StaffContext = {
  business: { id: "demo-business", name: "Your Coffee", logoUrl: null },
  user: { id: "demo-user", firstName: "Anna" },
  membership: fixtureMembership("demo-business", "STAFF"),
  recentActions: [],
};
/** Explicit customer fixture: no scan or transaction event is generated from this view. */
export const staffCustomer: StaffCustomerView = {
  id: "demo-customer",
  businessId: "demo-business",
  name: "Anna Ozola",
  customerSince: "2026-09-12",
  loyalty: {
    stamps: 4,
    target: 6,
    nextReward: "Free coffee",
    rewardAvailable: false,
  },
  membership: {
    id: "demo-membership",
    name: "Coffee Club",
    visitsRemaining: 8,
  },
  offers: [],
  availableActions: [
    { id: "demo-visit", type: "VISIT_CREATED" },
    { id: "demo-stamp", type: "STAMP_ADDED" },
    {
      id: "demo-use",
      type: "SUBSCRIPTION_USED",
      resourceId: "demo-membership",
      remainingAfter: 7,
    },
  ],
};
