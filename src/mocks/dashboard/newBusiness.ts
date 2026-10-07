import type { DashboardOverview } from "@/features/dashboard/types";
import { fixtureMembership } from "./permissions";
const business: DashboardOverview["business"] = {
  id: "demo-business",
  name: "Your Coffee",
  category: "cafe",
  city: "Riga",
  logoUrl: null,
  accent: "#c84720",
  planName: null,
  goals: ["reach", "relationships", "loyalty"],
};
/** Isolated UI fixture. Does not represent a registered account or activated subscription. */
export const newBusiness: DashboardOverview = {
  source: "demo",
  business,
  businesses: [business],
  user: { id: "demo-user", firstName: "Anna" },
  membership: fixtureMembership(business.id),
  permissions: { canCreate: true, canManageBusiness: true },
  state: "new",
  setup: {
    business: true,
    campaign: false,
    customers: false,
    retention: false,
  },
  flow: {
    period: "2026-10",
    reach: null,
    connect: null,
    retain: null,
    return: null,
  },
  campaigns: [],
  customerActivity: [],
  attention: [],
  retention: { loyalty: 0, memberships: 0, offers: 0 },
  connection: ["qr", "profile", "apple", "google"].map((name) => ({
    name: name as "qr" | "profile" | "apple" | "google",
    status: "notConfigured",
  })),
  integrations: ["Instagram", "TikTok", "Pinterest", "Google Business"].map(
    (name) => ({ name, status: "notConfigured" }),
  ),
};
