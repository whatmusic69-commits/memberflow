import type {
  BusinessMembership,
  BusinessRole,
  UserSummary,
} from "@/features/access/types";
export interface BusinessMember extends BusinessMembership {
  user: UserSummary;
}
export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
export type InviteRole = Exclude<BusinessRole, "OWNER">;
export interface Invitation {
  id: string;
  businessId: string;
  email: string;
  role: InviteRole;
  status: InvitationStatus;
  expiresAt: string | null;
}
export interface TeamOverview {
  members: BusinessMember[];
  invitations: Invitation[];
}
export type MemberChange = {
  role?: InviteRole;
  status?: "ACTIVE" | "INACTIVE";
};
