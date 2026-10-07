import { apiRequest } from "@/lib/api/client";
import type {
  BusinessMember,
  InviteRole,
  MemberChange,
  TeamOverview,
} from "./types";
export interface TeamService {
  list(signal?: AbortSignal): Promise<TeamOverview>;
  invite(email: string, role: InviteRole): Promise<TeamOverview>;
  updateMember(id: string, change: MemberChange): Promise<TeamOverview>;
  removeMember(id: string): Promise<TeamOverview>;
  invitation(id: string, action: "resend" | "revoke"): Promise<TeamOverview>;
}
const key = (businessId: string) => `memberflow:team-preview:v1:${businessId}`;
/** REST contract proposal. All security, invitation email and ownership rules are Symfony responsibilities. */
export function getTeamService(
  businessId: string,
  demo: boolean,
  owner: BusinessMember,
  populated = false,
): TeamService {
  const path = `/api/v1/businesses/${encodeURIComponent(businessId)}` as const;
  if (!demo || process.env.NODE_ENV !== "development") {
    const list = (signal?: AbortSignal) =>
      apiRequest<TeamOverview>(`${path}/team`, {
        credentials: "include",
        cache: "no-store",
        signal,
      });
    const mutation = async (
      url: `/api/${string}`,
      method: string,
      body?: unknown,
    ) => {
      await apiRequest(url, {
        method,
        credentials: "include",
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return list();
    };
    return {
      list,
      invite: (email, role) =>
        mutation(`${path}/invitations`, "POST", { email, role }),
      updateMember: (id, change) =>
        mutation(`${path}/members/${encodeURIComponent(id)}`, "PATCH", change),
      removeMember: (id) =>
        mutation(`${path}/members/${encodeURIComponent(id)}`, "DELETE"),
      invitation: (id, action) =>
        mutation(
          `${path}/invitations/${encodeURIComponent(id)}/${action}`,
          "POST",
        ),
    };
  }
  const load = async (): Promise<TeamOverview> => {
    const { teamFixture } = await import("@/mocks/team/fixtures");
    const base = teamFixture(owner, populated);
    try {
      const saved = JSON.parse(
        sessionStorage.getItem(key(businessId)) || "null",
      ) as TeamOverview | null;
      if (
        saved &&
        Array.isArray(saved.members) &&
        Array.isArray(saved.invitations) &&
        saved.members.every((item) => item.businessId === businessId)
      )
        return {
          members: [
            owner,
            ...saved.members.filter((item) => item.id !== owner.id),
          ],
          invitations: saved.invitations.filter(
            (item) => item.businessId === businessId,
          ),
        };
    } catch {
      /* Use the isolated fixture if tab storage is unavailable or invalid. */
    }
    return base;
  };
  const save = (value: TeamOverview) => {
    sessionStorage.setItem(key(businessId), JSON.stringify(value));
    return value;
  };
  return {
    list: load,
    async invite(email, role) {
      const state = await load();
      return save({
        ...state,
        invitations: [
          ...state.invitations,
          {
            id: crypto.randomUUID(),
            businessId,
            email,
            role,
            status: "PENDING",
            expiresAt: null,
          },
        ],
      });
    },
    async updateMember(id, change) {
      const state = await load();
      return save({
        ...state,
        members: state.members.map((item) =>
          item.id === id ? { ...item, ...change } : item,
        ),
      });
    },
    async removeMember(id) {
      const state = await load();
      return save({
        ...state,
        members: state.members.filter((item) => item.id !== id),
      });
    },
    async invitation(id, action) {
      const state = await load();
      return save({
        ...state,
        invitations: state.invitations.map((item) =>
          item.id === id
            ? { ...item, status: action === "revoke" ? "REVOKED" : "PENDING" }
            : item,
        ),
      });
    },
  };
}
