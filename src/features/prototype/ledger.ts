import { applyMembershipOperation, membershipStatus } from "./memberships";
import type { MembershipOperation } from "./memberships";
import type { CustomerEventType } from "@/features/dashboard/types";
/** Explicit local prototype journal, never a production loyalty calculation. */
export interface PrototypeEvent {
  id: string;
  businessId: string;
  customerId: string;
  programmeId?: string;
  rewardId?: string;
  membershipId?: string;
  locationId: string;
  type: CustomerEventType;
  occurredAt: string;
  detail: string | null;
  actorName: string | null;
  performedByMemberId: string;
}
export interface LoyaltyProgress {
  id: string;
  businessId: string;
  customerId: string;
  programmeId: string;
  current: number;
  target: number;
  reward: string;
  kind: "stamps" | "points";
  joinedAt: string;
}
export interface PrototypeReward {
  id: string;
  businessId: string;
  customerId: string;
  programmeId: string;
  name: string;
  status: "AVAILABLE" | "REDEEMED";
  earnedAt: string;
  redeemedAt: string | null;
}
export interface PrototypeMembership {
  id: string;
  businessId: string;
  customerId: string;
  membershipId: string;
  name?: string;
  kind?: "package" | "membership";
  startsOn?: string;
  totalVisits?: number | null;
  assignedAt?: string;
  frozenAt?: string | null;
  freezeReason?: string | null;
  cancelledAt?: string | null;
  remainingVisits: number | null;
  validUntil: string | null;
  status: "ACTIVE" | "EXPIRED" | "PAUSED";
}
export interface PrototypeLedger {
  version: 1;
  businessId: string;
  progress: LoyaltyProgress[];
  memberships?: PrototypeMembership[];
  rewards: PrototypeReward[];
  events: PrototypeEvent[];
  operations: Record<string, { signature: string; eventId: string }>;
}
export interface PrototypeCommand {
  key: string;
  businessId: string;
  customerId: string;
  programmeId?: string;
  membershipId?: string;
  type:
    "join" | "visit" | "award" | "redeem" | "membership" | "membership-manage";
  membershipOperation?: MembershipOperation;
  target?: number;
  reward?: string;
  kind?: "stamps" | "points";
  rewardId?: string;
  amount?: number;
  now: string;
  actorName: string | null;
  memberId: string;
}
export function emptyLedger(businessId: string): PrototypeLedger {
  return {
    version: 1,
    businessId,
    progress: [],
    memberships: [],
    rewards: [],
    events: [],
    operations: {},
  };
}
export function commandSignature(c: PrototypeCommand) {
  return JSON.stringify([
    c.businessId,
    c.customerId,
    c.programmeId ?? null,
    c.type,
    c.rewardId ?? null,
    c.membershipId ?? null,
    c.amount ?? 1,
    ...(c.membershipOperation ? [c.membershipOperation] : []),
  ]);
}
export function applyPrototypeCommand(
  state: PrototypeLedger,
  c: PrototypeCommand,
): PrototypeLedger {
  if (
    state.businessId !== c.businessId ||
    !c.key ||
    !c.customerId ||
    Number.isNaN(Date.parse(c.now))
  )
    throw new Error("invalid");
  const signature = commandSignature(c);
  const prior = Object.hasOwn(state.operations, c.key)
    ? state.operations[c.key]
    : undefined;
  if (prior) {
    if (prior.signature !== signature) throw new Error("idempotency-conflict");
    return state;
  }
  const next: PrototypeLedger = structuredClone(state);
  const id = () => crypto.randomUUID();
  const events: PrototypeEvent[] = [];
  const event = (
    type: CustomerEventType,
    detail: string | null = null,
    rewardId?: string,
  ) => {
    const row: PrototypeEvent = {
      id: id(),
      businessId: c.businessId,
      customerId: c.customerId,
      programmeId: c.programmeId,
      rewardId,
      membershipId: c.membershipId,
      locationId: `${c.businessId}:main`,
      type,
      occurredAt: c.now,
      detail,
      actorName: c.actorName,
      performedByMemberId: c.memberId,
    };
    events.push(row);
    return row;
  };
  const progress = next.progress.find(
    (p) => p.customerId === c.customerId && p.programmeId === c.programmeId,
  );
  if (c.type === "membership-manage") {
    applyMembershipOperation(next, c, signature);
    return next;
  }
  if (c.type === "join") {
    if (
      !c.programmeId ||
      !Number.isSafeInteger(c.target) ||
      c.target! < 1 ||
      !c.reward ||
      !c.kind
    )
      throw new Error("programme");
    if (progress) return state;
    next.progress.push({
      id: id(),
      businessId: c.businessId,
      customerId: c.customerId,
      programmeId: c.programmeId,
      current: 0,
      target: c.target!,
      reward: c.reward,
      kind: c.kind,
      joinedAt: c.now,
    });
    event("CUSTOMER_JOINED", c.reward);
  } else if (c.type === "visit") event("VISIT_CREATED");
  else if (c.type === "award") {
    const amount = c.amount ?? 1;
    if (
      !progress ||
      !Number.isSafeInteger(amount) ||
      amount < 1 ||
      amount > 1000
    )
      throw new Error("progress");
    progress.current += amount;
    event(
      progress.kind === "points" ? "POINTS_ADDED" : "STAMP_ADDED",
      `+${amount}`,
    );
    while (progress.current >= progress.target) {
      progress.current -= progress.target;
      const reward: PrototypeReward = {
        id: id(),
        businessId: c.businessId,
        customerId: c.customerId,
        programmeId: progress.programmeId,
        name: progress.reward,
        status: "AVAILABLE",
        earnedAt: c.now,
        redeemedAt: null,
      };
      next.rewards.push(reward);
      event("REWARD_EARNED", reward.name, reward.id);
    }
  } else if (c.type === "membership") {
    const membership = next.memberships?.find(
      (m) =>
        m.customerId === c.customerId &&
        m.membershipId === c.membershipId &&
        membershipStatus(m, c.now) === "ACTIVE" &&
        (!m.validUntil ||
          Date.parse(m.validUntil + "T23:59:59Z") >= Date.parse(c.now)),
    );
    if (!membership || membership.remainingVisits === 0)
      throw new Error("membership");
    if (membership.remainingVisits !== null) membership.remainingVisits--;
    event("SUBSCRIPTION_USED", c.membershipId ?? null);
  } else {
    const reward = next.rewards.find(
      (r) =>
        r.id === c.rewardId &&
        r.customerId === c.customerId &&
        r.status === "AVAILABLE",
    );
    if (!reward) throw new Error("reward");
    reward.status = "REDEEMED";
    reward.redeemedAt = c.now;
    event("REWARD_REDEEMED", reward.name, reward.id).programmeId =
      reward.programmeId;
  }
  next.events.push(...events);
  next.operations[c.key] = { signature, eventId: events[0].id };
  return next;
}
