import type {
  DashboardOverview,
  LifecycleSummary,
  NextAction,
  OverviewAction,
} from "./types";
export const lifecycleStages = [
  "reach",
  "connect",
  "retain",
  "return",
] as const;
/** Presentation priorities only. Permissions, customer history and metrics are supplied by Symfony. */
export function getNextAction(data: DashboardOverview): NextAction | null {
  if (data.nextAction !== undefined) return data.nextAction;
  const hasHistory =
    data.state === "active" || data.customerActivity.length > 0;
  if (data.state !== "active") {
    const retentionGoal = data.business.goals.some(
      (g) => g === "loyalty" || g === "memberships",
    );
    const acquisitionGoal = data.business.goals.some(
      (g) => g === "reach" || g === "campaigns",
    );
    let target: OverviewAction;
    if (retentionGoal && !acquisitionGoal && !data.setup.customers)
      target = "customers";
    else if (!data.setup.campaign && acquisitionGoal) target = "campaigns";
    else if (!data.setup.customers) target = "customers";
    else if (!data.setup.retention)
      target = data.business.goals.includes("memberships")
        ? "memberships"
        : "loyalty";
    else if (!data.setup.campaign) target = "campaigns";
    else if (!data.integrations.some((i) => i.status === "connected"))
      target = "integrations";
    else return null;
    return { kind: "setup", target };
  }
  if (hasHistory && data.attention.some((item) => item.reason === "inactive"))
    return { kind: "returnOffer", target: "offers" };
  const publishing = data.campaigns.find((campaign) =>
    ["PROCESSING", "PARTIALLY_PUBLISHED", "FAILED"].includes(campaign.status),
  );
  if (publishing)
    return {
      kind: "reviewCampaign",
      target: "campaigns",
      campaignId: publishing.id,
    };
  return { kind: "createCampaign", target: "campaigns" };
}
export function getLifecycle(data: DashboardOverview): LifecycleSummary {
  if (data.lifecycle) return data.lifecycle;
  const next = getNextAction(data);
  const current =
    next?.target === "customers"
      ? "connect"
      : next?.target === "loyalty" || next?.target === "memberships"
        ? "retain"
        : next?.target === "offers"
          ? "return"
          : "reach";
  const completed = {
    reach: data.setup.campaign,
    connect: data.setup.customers,
    retain: data.setup.retention,
    return: data.state === "active",
  };
  return {
    mode: data.state === "active" ? "active" : "setup",
    period: 30,
    stages: Object.fromEntries(
      lifecycleStages.map((stage) => [
        stage,
        {
          state: completed[stage]
            ? "completed"
            : stage === "return" && !data.customerActivity.length
              ? "waiting"
              : stage === current
                ? "current"
                : "notConfigured",
          value: data.flow[stage],
        },
      ]),
    ) as LifecycleSummary["stages"],
  };
}
export function getSetupSummary(data: DashboardOverview) {
  return (
    data.setupSummary ?? {
      completed: Object.values(data.setup).filter(Boolean).length,
      total: 4,
    }
  );
}
