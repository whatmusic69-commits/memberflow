export type CustomerPageStatus = "DRAFT" | "ACTIVE" | "DISABLED";
export interface CustomerPageBranding {
  logoUrl: string | null;
  coverUrl: string | null;
  accent: string;
}
export interface CustomerPageBusinessInfo {
  name: string;
  category: string;
  description: string;
  city: string;
  address: string;
  openingHours: string;
  phone: string;
  email: string;
}
export interface CustomerPageModules {
  offers: boolean;
  loyalty: boolean;
  memberships: boolean;
  social: boolean;
}
export interface CustomerPageSocial {
  instagram: string;
  tiktok: string;
  facebook: string;
  website: string;
}
export interface CustomerPageOffer {
  id: string;
  title: string;
  description: string;
  priceLabel: string | null;
  bonusLabel: string | null;
  validUntil: string | null;
  imageUrl: string | null;
}
export interface CustomerLoyaltyState {
  stamps: number;
  target: number;
  nextReward: string;
}
export interface CustomerMembershipState {
  id: string;
  name: string;
  remainingVisits: number | null;
  validUntil: string | null;
  statusLabel: string | null;
}
export interface CustomerWalletState {
  apple: {
    status: "AVAILABLE" | "ADDED" | "UNAVAILABLE";
    actionUrl: string | null;
  };
  google: {
    status: "AVAILABLE" | "ADDED" | "UNAVAILABLE";
    actionUrl: string | null;
  };
}
/** Public DTO contains no personal customer identifiers or balances. */
export interface CustomerPagePublic {
  slug: string;
  status: CustomerPageStatus;
  branding: CustomerPageBranding;
  business: CustomerPageBusinessInfo;
  modules: CustomerPageModules;
  social: CustomerPageSocial;
  offers: CustomerPageOffer[];
  loyalty: { reward: string } | null;
  availableMemberships: { id: string; name: string; description: string }[];
  connection: { joinEnabled: boolean };
}
/** Never merged into a shared/cacheable public response or metadata. */
export interface CustomerPagePersonal {
  customer: { id: string; firstName: string };
  loyalty: CustomerLoyaltyState | null;
  memberships: CustomerMembershipState[];
  offers: CustomerPageOffer[];
  wallet: CustomerWalletState;
}
export interface CustomerPageConfig {
  businessId: string;
  slug: string;
  publicUrl: string | null;
  status: CustomerPageStatus;
  branding: CustomerPageBranding;
  business: CustomerPageBusinessInfo;
  modules: CustomerPageModules;
  social: CustomerPageSocial;
  invitation: { headline: string; message: string };
  wallet: {
    apple: "READY" | "NOT_CONFIGURED";
    google: "READY" | "NOT_CONFIGURED";
  };
  content: {
    offers: CustomerPageOffer[];
    loyalty: { reward: string } | null;
    memberships: { id: string; name: string; description: string }[];
  };
}
export type CustomerPageDraft = Pick<
  CustomerPageConfig,
  "branding" | "business" | "modules" | "social" | "invitation"
>;
