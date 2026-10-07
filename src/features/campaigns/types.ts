import type { CampaignStatus } from "@/features/dashboard/types";
export const campaignKinds = [
  "offer",
  "product",
  "service",
  "event",
  "announcement",
] as const;
export const campaignChannels = [
  "Instagram",
  "TikTok",
  "Pinterest",
  "Google Business",
  "Apple Wallet",
  "Google Wallet",
] as const;
export interface CampaignDraft {
  id: string;
  businessId: string;
  name: string;
  kind: (typeof campaignKinds)[number];
  description: string;
  price: string;
  currency: string;
  channels: string[];
  image: string | null;
  updatedAt: string;
  createdAt?: string | null;
  status: CampaignStatus;
  /** Distribution content references an optional source; an Offer remains its own entity. */
  source?: { kind: "offer" | "product" | "service" | "event"; id: string };
  channelStatuses?: {
    name: string;
    status: "DRAFT" | "PROCESSING" | "PUBLISHED" | "FAILED" | "PAUSED";
  }[];
}
export type CampaignInput = Omit<
  CampaignDraft,
  "id" | "businessId" | "updatedAt" | "createdAt" | "status" | "channelStatuses"
>;
