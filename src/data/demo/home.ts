import type { Campaign, Customer, MembershipState } from "@/types/demo";
export const campaign: Campaign = {
  id: "demo-latte",
  name: "Pumpkin Latte",
  price: "€3.90",
  stamps: 2,
  image: "/images/latte.jpg",
  business: "Your Coffee",
  city: "Riga",
};
export const customers: Customer[] = [
  {
    id: "demo-anna",
    name: "Anna Ozola",
    initials: "AO",
    visits: 8,
    daysSinceVisit: 2,
    loyalty: { stamps: 5, target: 6 },
  },
  {
    id: "demo-robert",
    name: "Robert Kalniņš",
    initials: "RK",
    visits: 3,
    daysSinceVisit: 35,
    loyalty: { stamps: 2, target: 6 },
  },
];
export const membership: MembershipState = {
  name: "Coffee Club",
  active: true,
  remainingVisits: 4,
};

/** Marketing illustration, never a production customer response. */
export const marketingLoyalty = {
  stamps: 4,
  target: 6,
  nextReward: "coffee",
} satisfies import("@/features/customer-page/types").CustomerLoyaltyState;
export const returnCustomer = { name: "Anna", daysSinceVisit: 30 };
