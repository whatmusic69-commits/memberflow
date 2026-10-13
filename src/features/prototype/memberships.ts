/** Development-only assignment model. Does not define or replace a Symfony contract. */
import type { Permission } from "@/features/access/types";
import type {
  PrototypeCommand,
  PrototypeLedger,
  PrototypeMembership,
} from "./ledger";
export type MembershipState =
  "ACTIVE" | "SCHEDULED" | "EXPIRED" | "EXHAUSTED" | "FROZEN" | "CANCELLED";
export interface MembershipOperation {
  action: "assign" | "use" | "verify" | "freeze" | "resume" | "cancel";
  assignmentId: string;
  permissions: Permission[];
  name?: string;
  kind?: "package" | "membership";
  startsOn?: string;
  endsOn?: string | null;
  visits?: number | null;
  reason?: string;
}
export function calendarDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function membershipStatus(
  m: PrototypeMembership,
  now = new Date().toISOString(),
): MembershipState {
  const today = now.slice(0, 10);
  if (m.cancelledAt) return "CANCELLED";
  if ((m.validUntil && m.validUntil < today) || m.status === "EXPIRED")
    return "EXPIRED";
  if (m.frozenAt || m.status === "PAUSED") return "FROZEN";
  if (m.startsOn && m.startsOn > today) return "SCHEDULED";
  if (m.remainingVisits === 0) return "EXHAUSTED";
  return "ACTIVE";
}
export function membershipPermission(
  action: MembershipOperation["action"],
): Permission {
  return action === "use" || action === "verify"
    ? "membership.redeem"
    : "membership.create";
}
export function applyMembershipOperation(
  next: PrototypeLedger,
  c: PrototypeCommand,
  signature: string,
) {
  const o = c.membershipOperation;
  if (
    !o ||
    !["assign", "use", "verify", "freeze", "resume", "cancel"].includes(
      o.action,
    )
  )
    throw new Error("invalid");
  if (!o.permissions.includes(membershipPermission(o.action)))
    throw new Error("denied");
  next.memberships ??= [];
  let m = next.memberships.find(
    (m) =>
      m.id === o.assignmentId &&
      m.customerId === c.customerId &&
      m.businessId === c.businessId,
  );
  let type:
    | "MEMBERSHIP_ASSIGNED"
    | "SUBSCRIPTION_USED"
    | "MEMBERSHIP_ACCESS_VERIFIED"
    | "MEMBERSHIP_FROZEN"
    | "MEMBERSHIP_RESUMED"
    | "MEMBERSHIP_CANCELLED";
  if (o.action === "assign") {
    if (
      next.memberships.some((m) => m.id === o.assignmentId) ||
      !o.assignmentId ||
      !c.membershipId ||
      !o.name ||
      !calendarDate(o.startsOn ?? "") ||
      (o.endsOn && (!calendarDate(o.endsOn) || o.endsOn < o.startsOn!)) ||
      !["package", "membership"].includes(o.kind ?? "") ||
      (o.kind === "membership" && !o.endsOn) ||
      (o.kind === "package" &&
        (!Number.isSafeInteger(o.visits) ||
          o.visits! < 1 ||
          o.visits! > 1000000))
    )
      throw new Error("invalid");
    m = {
      id: o.assignmentId,
      businessId: c.businessId,
      customerId: c.customerId,
      membershipId: c.membershipId,
      name: o.name,
      kind: o.kind,
      startsOn: o.startsOn,
      validUntil: o.endsOn ?? null,
      assignedAt: c.now,
      totalVisits: o.kind === "package" ? o.visits! : null,
      remainingVisits: o.kind === "package" ? o.visits! : null,
      status: "ACTIVE",
    };
    next.memberships.push(m);
    type = "MEMBERSHIP_ASSIGNED";
  } else {
    if (!m) throw new Error("membership");
    const status = membershipStatus(m, c.now);
    if (o.action === "use" || o.action === "verify") {
      if (
        status !== "ACTIVE" ||
        (o.action === "use") !== (m.remainingVisits !== null)
      )
        throw new Error("membership");
      if (o.action === "use") m.remainingVisits!--;
      type =
        o.action === "use" ? "SUBSCRIPTION_USED" : "MEMBERSHIP_ACCESS_VERIFIED";
    } else if (o.action === "freeze") {
      if (!["ACTIVE", "SCHEDULED"].includes(status) || !o.reason?.trim())
        throw new Error("membership");
      m.frozenAt = c.now;
      m.freezeReason = o.reason.trim().slice(0, 240);
      m.status = "PAUSED";
      type = "MEMBERSHIP_FROZEN";
    } else if (o.action === "resume") {
      if ((!m.frozenAt && m.status !== "PAUSED") || m.cancelledAt)
        throw new Error("membership");
      m.frozenAt = null;
      m.status = "ACTIVE";
      type = "MEMBERSHIP_RESUMED";
    } else {
      if (m.cancelledAt) throw new Error("membership");
      m.cancelledAt = c.now;
      type = "MEMBERSHIP_CANCELLED";
    }
  }
  const eventId = crypto.randomUUID();
  next.events.push({
    id: eventId,
    businessId: c.businessId,
    customerId: c.customerId,
    membershipId: m.id,
    locationId: `${c.businessId}:main`,
    type,
    occurredAt: c.now,
    detail: `${m.name ?? m.membershipId}${o.action === "freeze" ? ` · ${m.freezeReason}` : ""}`,
    actorName: c.actorName,
    performedByMemberId: c.memberId,
  });
  next.operations[c.key] = { signature, eventId };
}
export function membershipStatistics(
  ledger: PrototypeLedger,
  now = new Date().toISOString(),
) {
  const today = now.slice(0, 10),
    soon = new Date(Date.parse(today) + 7 * 86400000)
      .toISOString()
      .slice(0, 10);
  const active = (ledger.memberships ?? []).filter(
    (m) => membershipStatus(m, now) === "ACTIVE",
  );
  return {
    active: active.length,
    used: ledger.events.filter((e) => e.type === "SUBSCRIPTION_USED").length,
    expiring: active.filter(
      (m) => m.validUntil && m.validUntil >= today && m.validUntil <= soon,
    ).length,
  };
}
