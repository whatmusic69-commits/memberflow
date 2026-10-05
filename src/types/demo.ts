/** Presentation fixtures only. Symfony contracts will be defined with the backend team. */
export type Channel = "instagram" | "tiktok" | "pinterest" | "wallet";
export interface Campaign {
  id: string;
  name: string;
  price: string;
  stamps: number;
  image: string;
  business: string;
  city: string;
}
export interface LoyaltyState {
  stamps: number;
  target: number;
}
export interface MembershipState {
  name: string;
  active: boolean;
  remainingVisits: number;
}
export interface Customer {
  id: string;
  name: string;
  initials: string;
  visits: number;
  daysSinceVisit: number;
  loyalty: LoyaltyState;
}
