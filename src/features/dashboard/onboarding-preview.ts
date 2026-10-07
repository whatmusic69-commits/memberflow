import type {
  BusinessDraft,
  GoalId,
  PlanSelection,
} from "@/features/onboarding/types";
import type { DashboardOverview } from "./types";
const key = "memberflow:onboarding-workspace-preview:v1";
interface Preview {
  businessId?: string;
  firstName: string;
  business: Pick<
    BusinessDraft,
    "name" | "type" | "otherType" | "city" | "country"
  >;
  profile?: {
    logoBorder?: boolean;
    accent: string;
    description: string;
    website: string;
    instagram: string;
  };
  goals: GoalId[];
  planName: string | null;
  selection: PlanSelection;
}
/** Non-sensitive, tab-scoped UI draft only. Never authentication or subscription state. */
export function saveOnboardingPreview(value: Preview) {
  if (process.env.NODE_ENV !== "development") return;
  try {
    const previous = JSON.parse(
      sessionStorage.getItem(key) || "null",
    ) as Partial<Preview> | null;
    const businessId =
      previous?.business?.name === value.business.name &&
      previous?.business?.city === value.business.city &&
      previous?.firstName === value.firstName &&
      typeof previous?.businessId === "string"
        ? previous.businessId
        : `preview-${crypto.randomUUID()}`;
    sessionStorage.setItem(key, JSON.stringify({ ...value, businessId }));
  } catch {
    /* Preview navigation still works when storage is blocked. */
  }
}
export function applyOnboardingPreview(
  fixture: DashboardOverview,
): DashboardOverview {
  if (process.env.NODE_ENV !== "development") return fixture;
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(key) || "null");
    if (!value || typeof value !== "object") return fixture;
    const draft = value as Partial<Preview>;
    const business = draft.business;
    if (
      !business ||
      typeof business.name !== "string" ||
      typeof business.type !== "string" ||
      typeof business.city !== "string" ||
      typeof draft.firstName !== "string" ||
      !Array.isArray(draft.goals)
    )
      return fixture;
    const allowed: GoalId[] = [
      "reach",
      "campaigns",
      "relationships",
      "loyalty",
      "memberships",
      "insights",
      "return",
    ];
    const summary = {
      ...fixture.business,
      id:
        typeof draft.businessId === "string"
          ? draft.businessId
          : fixture.business.id,
      name: business.name,
      country: typeof business.country === "string" ? business.country : "",
      ...(draft.profile
        ? {
            accent: draft.profile.accent,
            description: draft.profile.description,
            website: draft.profile.website,
            instagram: draft.profile.instagram,
          }
        : {}),
      category:
        business.type === "other" && typeof business.otherType === "string"
          ? business.otherType
          : business.type,
      city: business.city,
      goals: draft.goals.filter((g) => allowed.includes(g)),
      planName: typeof draft.planName === "string" ? draft.planName : null,
    };
    return {
      ...fixture,
      business: summary,
      membership: { ...fixture.membership, businessId: summary.id },
      businesses: [summary],
      user: { ...fixture.user, firstName: draft.firstName },
    };
  } catch {
    return fixture;
  }
}
