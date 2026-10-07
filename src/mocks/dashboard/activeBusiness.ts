import type { DashboardOverview } from "@/features/dashboard/types";
import { newBusiness } from "./newBusiness";
/** Demonstration only. Never selected automatically for a new business. */
export const activeBusiness: DashboardOverview = {
  ...newBusiness,
  state: "active",
  business: { ...newBusiness.business, planName: "Demo plan" },
  setup: { business: true, campaign: true, customers: true, retention: true },
  flow: { period: "2026-10", reach: 1284, connect: 48, retain: 31, return: 7 },
  campaigns: [
    {
      id: "demo-campaign",
      name: "Pumpkin Latte",
      status: "PARTIALLY_PUBLISHED",
      startedAt: "2026-10-02",
      channels: [
        { name: "Instagram", status: "ready" },
        { name: "TikTok", status: "ready" },
        { name: "Pinterest", status: "processing" },
        { name: "Wallet", status: "ready" },
      ],
    },
  ],
  customerActivity: [
    {
      id: "event-1",
      name: "Anna Ozola",
      kind: "CUSTOMER_JOINED",
      occurredAt: "2026-10-03T10:15:00Z",
      detail: null,
    },
    {
      id: "event-2",
      name: "Robert Kalniņš",
      kind: "VISIT_CREATED",
      occurredAt: "2026-10-03T09:45:00Z",
      detail: null,
    },
    {
      id: "event-3",
      name: "Elīna",
      kind: "REWARD_EARNED",
      occurredAt: "2026-10-03T09:10:00Z",
      detail: null,
    },
    {
      id: "event-4",
      name: "Mark",
      kind: "SUBSCRIPTION_USED",
      occurredAt: "2026-10-02T14:00:00Z",
      detail: null,
    },
    {
      id: "event-5",
      name: "Anna Ozola",
      kind: "OFFER_REDEEMED",
      occurredAt: "2026-10-02T12:30:00Z",
      detail: "Pumpkin Latte",
    },
  ],
  attention: [
    { id: "customer-1", name: "Robert Kalniņš", reason: "inactive", value: 35 },
    { id: "customer-2", name: "Līga Ozola", reason: "expiring", value: 5 },
    { id: "customer-3", name: "Anna Ozola", reason: "rewardNear", value: 1 },
  ],
  retention: { loyalty: 24, memberships: 8, offers: 3 },
  connection: [
    { name: "qr", status: "ready" },
    { name: "profile", status: "ready" },
    { name: "apple", status: "ready" },
    { name: "google", status: "notConfigured" },
  ],
  integrations: [
    { name: "Instagram", status: "connected" },
    { name: "TikTok", status: "notConfigured" },
    { name: "Pinterest", status: "connected" },
    { name: "Google Business", status: "notConfigured" },
  ],
};
