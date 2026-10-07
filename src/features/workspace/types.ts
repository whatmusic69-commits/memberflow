export type ModuleId =
  "customers" | "loyalty" | "memberships" | "offers" | "automations";
interface Base {
  id: string;
  name: string;
  archived: boolean;
  updatedAt: string;
}
export interface CustomerView extends Base {
  email: string;
  phone: string;
  notes: string;
}
export interface LoyaltyDraft extends Base {
  kind: "stamps" | "points";
  target: string;
  reward: string;
  description: string;
}
export interface MembershipDraft extends Base {
  kind: "membership" | "package";
  price: string;
  currency: string;
  visits: string;
  interval: "monthly" | "yearly";
  description: string;
}
export interface OfferDraft extends Base {
  description: string;
  audience: "all" | "returning" | "inactive";
  expiresAt: string;
}
export interface AutomationDraft extends Base {
  inactivityDays: string;
  offerId: string;
  channel: "memberflow" | "wallet";
}
export interface ModuleRecords {
  customers: CustomerView;
  loyalty: LoyaltyDraft;
  memberships: MembershipDraft;
  offers: OfferDraft;
  automations: AutomationDraft;
}
export interface BusinessSettingsDraft {
  name: string;
  category: string;
  city: string;
  country: string;
  description: string;
  website: string;
  instagram: string;
  accent: string;
  logoUrl: string | null;
  firstName: string;
}
export type RecordInput<K extends ModuleId> = Omit<
  ModuleRecords[K],
  "id" | "archived" | "updatedAt"
>;
