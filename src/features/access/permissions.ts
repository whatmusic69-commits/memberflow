import type { DashboardOverview, Section } from "@/features/dashboard/types";
import type { Permission, SessionContext } from "./types";
/** UX checks only. Missing backend permissions deny access; never infer grants from a role. */
export function accessFor(permissions: readonly Permission[] = []) {
  const grants = new Set(permissions);
  return { can: (permission: Permission) => grants.has(permission) };
}
export function workspaceAccess(data: DashboardOverview | null) {
  return accessFor(
    data?.membership?.status === "ACTIVE" ? data.membership.permissions : [],
  );
}
const sectionPermissions: Record<Section, Permission> = {
  billing: "billing.read",
  overview: "overview.read",
  campaigns: "campaign.read",
  offers: "offer.read",
  customers: "customer.read",
  "customer-page": "customer-page.read",
  loyalty: "loyalty.read",
  memberships: "membership.read",
  automations: "automation.read",
  team: "team.read",
  integrations: "integration.read",
  settings: "business.settings.read",
};
export function canVisitSection(
  data: DashboardOverview | null,
  section: Section,
) {
  return workspaceAccess(data).can(sectionPermissions[section]);
}
export const createPermissions = {
  campaigns: "campaign.create",
  offers: "offer.create",
  customers: "customer.create",
  loyalty: "loyalty.create",
  memberships: "membership.create",
  automations: "automation.create",
} as const satisfies Record<string, Permission>;
/** Select an experience from backend-provided access, not from a global role. */
export function sessionDestination(
  session: SessionContext,
): "/dashboard" | "/staff" | null {
  const membership =
    session.businesses.find(
      (item) => item.business.id === session.currentBusinessId,
    )?.membership ??
    session.businesses.find((item) => item.membership.status === "ACTIVE")
      ?.membership;
  const access = accessFor(
    membership?.status === "ACTIVE" ? membership.permissions : [],
  );
  if (access.can("overview.read")) return "/dashboard";
  if (access.can("customer.scan")) return "/staff";
  return null;
}

export function canVisitWorkspace(
  data: DashboardOverview | null,
  section: Section,
  tab?: string | null,
) {
  const access = workspaceAccess(data);
  if (section === "settings" && tab === "profile")
    return access.can("profile.read");
  if (section === "settings" && tab === "billing")
    return access.can("billing.read");
  return canVisitSection(data, section);
}
