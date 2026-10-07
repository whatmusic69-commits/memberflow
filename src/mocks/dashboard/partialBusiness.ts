import type { DashboardOverview } from "@/features/dashboard/types";
import { newBusiness } from "./newBusiness";
/** Explicit development fixture only; never merged into a newly registered business. */
export const partialBusiness: DashboardOverview = {
  ...newBusiness,
  state: "partial",
  setup: { business: true, campaign: true, customers: true, retention: false },
  campaigns: [
    {
      id: "partial-campaign",
      name: "Pumpkin Latte",
      status: "DRAFT",
      startedAt: null,
      channels: [{ name: "Instagram", status: "notConfigured" }],
    },
  ],
  customerActivity: [
    {
      id: "partial-event-1",
      name: "Anna Ozola",
      kind: "CUSTOMER_JOINED",
      occurredAt: "2026-10-03T10:15:00Z",
      detail: null,
    },
    {
      id: "partial-event-2",
      name: "Robert Kalniņš",
      kind: "VISIT_CREATED",
      occurredAt: "2026-10-03T09:45:00Z",
      detail: null,
    },
  ],
  connection: [
    { name: "qr", status: "ready" },
    { name: "profile", status: "ready" },
    { name: "apple", status: "notConfigured" },
    { name: "google", status: "notConfigured" },
  ],
  integrations: [
    { name: "Instagram", status: "connected" },
    { name: "TikTok", status: "notConfigured" },
    { name: "Pinterest", status: "notConfigured" },
    { name: "Google Business", status: "notConfigured" },
  ],
};
