export type DemoRole = "owner" | "staff" | "customer" | "admin";
export type ProgramType = "subscription" | "loyalty";
export type ProgramStatus = "active" | "paused" | "archived" | "cancelled";
export type SaaSPlan = "Loyalty" | "Membership" | "Complete";
export type OperationType =
  | "subscription_usage"
  | "subscription_renewal"
  | "stamp_added"
  | "reward_redeemed"
  | "manual_adjustment"
  | "payment_failed"
  | "program_created";

export interface Business {
  id: string;
  name: string;
  category: string;
  owner: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  logoDataUrl?: string;
  brandColor: string;
  plan: SaaSPlan;
  status: "active" | "trial" | "disabled";
  stripeStatus: "connected" | "pending" | "failed";
  joinedAt: string;
  turnoverCents: number;
  platformFeeCents: number;
  branches: string[];
}

export interface Program {
  id: string;
  businessId: string;
  type: ProgramType;
  name: string;
  description: string;
  status: ProgramStatus;
  priceCents?: number;
  billingPeriod?: "month" | "year";
  includedService?: string;
  includedUses?: number;
  rollover?: boolean;
  maxRollover?: number;
  extraDiscountPercent?: number;
  allBranches?: boolean;
  cancellationRules?: string;
  loyaltyMechanic?: "visits" | "purchases";
  targetCount?: number;
  rewardName?: string;
  stampExpiryDays?: number;
  repeatable?: boolean;
  customers: number;
  mrrCents: number;
  stampsIssued?: number;
  rewardsAvailable?: number;
  rewardsRedeemed?: number;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  customerNumber?: string;
  email: string;
  phone: string;
  status: "active" | "paused" | "failed_payment";
  subscriptionProgramId?: string;
  loyaltyProgramId?: string;
  remainingUses: number;
  includedUses: number;
  nextRenewal: string;
  stamps: number;
  rewards: number;
  lastVisit: string;
  token: string;
}

export interface Worker {
  id: string;
  businessId: string;
  name: string;
  email: string;
  role: "Manager" | "Staff";
  branch: string;
  status: "active" | "invited" | "disabled";
  lastAction: string;
}

export interface Operation {
  id: string;
  businessId: string;
  customerId: string;
  programId: string;
  date: string;
  type: OperationType;
  worker: string;
  branch: string;
  change: string;
  status: "success" | "pending" | "failed";
}

export interface Payment {
  id: string;
  businessId: string;
  customerId: string;
  date: string;
  amountCents: number;
  feeCents: number;
  status: "paid" | "failed" | "refunded";
}

export interface ChartPoint {
  month: string;
  revenueCents: number;
  subscribers: number;
  loyalty: number;
  platformMrrCents: number;
  newBusinesses: number;
}

export interface ServiceItem {
  id: string;
  businessId: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  pricePrefix?: "fixed" | "from";
  durationMinutes: number;
  visible: boolean;
  popular?: boolean;
  order: number;
  imageDataUrl?: string;
}

export interface Offer {
  id: string;
  businessId: string;
  title: string;
  description: string;
  discountLabel: string;
  status: "draft" | "scheduled" | "active" | "ended" | "expired";
  publicVisible: boolean;
  validUntil?: string;
  promoCode?: string;
}

export interface BusinessPageSettings {
  businessId: string;
  slug: string;
  status: "draft" | "published" | "unpublished";
  lastPublishedAt?: string;
  draft: BusinessPageContent;
  published?: BusinessPageContent;
}

export interface BusinessPageContent {
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    theme: "light" | "dark";
    buttonShape: "soft" | "round" | "sharp";
    cardStyle: "soft" | "outline" | "solid";
  };
  seo: {
    title: string;
    description: string;
  };
  blocks: BusinessPageBlock[];
}

export interface BusinessPageBlock {
  id: string;
  type: "hero" | "about" | "services" | "offers" | "gallery" | "team" | "contacts" | "loyalty" | "packages" | "faq" | "cta";
  enabled: boolean;
  order: number;
  title: string;
  text: string;
  ctaLabel?: string;
  secondaryCtaLabel?: string;
}
