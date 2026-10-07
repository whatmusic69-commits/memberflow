import type { BusinessMember, TeamOverview } from "@/features/team/types";
/** Extra people exist only in explicitly selected populated development fixtures. */
export function teamFixture(
  owner: BusinessMember,
  populated: boolean,
): TeamOverview {
  return {
    members: populated
      ? [
          owner,
          {
            id: "demo-manager",
            businessId: owner.businessId,
            userId: "demo-anna",
            user: {
              id: "demo-anna",
              firstName: "Anna",
              email: "anna@example.com",
            },
            role: "MANAGER",
            status: "ACTIVE",
            permissions: [],
            joinedAt: "2026-09-12T12:00:00Z",
            lastActiveAt: "2026-10-03T11:18:00Z",
          },
        ]
      : [owner],
    invitations: populated
      ? [
          {
            id: "demo-invitation",
            businessId: owner.businessId,
            email: "robert@example.com",
            role: "STAFF",
            status: "PENDING",
            expiresAt: null,
          },
        ]
      : [],
  };
}
