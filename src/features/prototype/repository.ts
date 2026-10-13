import {
  readLocalRecords,
  workspaceDraftEvent,
} from "@/features/workspace/repository";
import {
  emptyLedger,
  applyPrototypeCommand,
  type PrototypeCommand,
  type PrototypeLedger,
} from "./ledger";
import { calendarDate, membershipStatus } from "./memberships";
export const prototypeEnabled = () =>
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DASHBOARD_MODE !== "api";
const key = (id: string) => `memberflow:prototype-journal:v1:${id}`;
export function readPrototypeLedger(id: string): PrototypeLedger {
  if (!prototypeEnabled()) return emptyLedger(id);
  try {
    const s = JSON.parse(sessionStorage.getItem(key(id)) || "null");
    if (
      s?.version !== 1 ||
      s.businessId !== id ||
      !Array.isArray(s.events) ||
      !Array.isArray(s.progress) ||
      !Array.isArray(s.rewards) ||
      !s.operations ||
      typeof s.operations !== "object" ||
      Array.isArray(s.operations)
    )
      return emptyLedger(id);
    const valid = (rows: Record<string, unknown>[]) =>
      rows.every(
        (r) =>
          r &&
          r.businessId === id &&
          typeof r.id === "string" &&
          typeof r.customerId === "string",
      );
    if (
      !valid(s.events) ||
      !valid(s.progress) ||
      !valid(s.rewards) ||
      s.progress.some(
        (p: { current: number; target: number }) =>
          !Number.isSafeInteger(p.current) ||
          p.current < 0 ||
          !Number.isSafeInteger(p.target) ||
          p.target < 1,
      )
    )
      return emptyLedger(id);
    const types = [
      "CUSTOMER_JOINED",
      "VISIT_CREATED",
      "STAMP_ADDED",
      "POINTS_ADDED",
      "REWARD_EARNED",
      "REWARD_REDEEMED",
      "SUBSCRIPTION_USED",
      "MEMBERSHIP_ASSIGNED",
      "MEMBERSHIP_FROZEN",
      "MEMBERSHIP_RESUMED",
      "MEMBERSHIP_CANCELLED",
      "MEMBERSHIP_ACCESS_VERIFIED",
      "MEMBERSHIP_EXPIRED",
    ];
    if (
      s.events.some(
        (e: Record<string, unknown>) =>
          !types.includes(String(e.type)) ||
          typeof e.occurredAt !== "string" ||
          Number.isNaN(Date.parse(e.occurredAt)) ||
          typeof e.locationId !== "string" ||
          typeof e.performedByMemberId !== "string",
      ) ||
      s.progress.some(
        (p: Record<string, unknown>) =>
          typeof p.programmeId !== "string" ||
          !["stamps", "points"].includes(String(p.kind)) ||
          typeof p.reward !== "string" ||
          typeof p.joinedAt !== "string" ||
          Number.isNaN(Date.parse(p.joinedAt)),
      ) ||
      s.rewards.some(
        (r: Record<string, unknown>) =>
          typeof r.programmeId !== "string" ||
          typeof r.name !== "string" ||
          !["AVAILABLE", "REDEEMED"].includes(String(r.status)) ||
          typeof r.earnedAt !== "string" ||
          Number.isNaN(Date.parse(r.earnedAt)),
      ) ||
      Object.values(s.operations).some(
        (value) =>
          !value ||
          typeof value !== "object" ||
          typeof (value as { signature: unknown }).signature !== "string" ||
          typeof (value as { eventId: unknown }).eventId !== "string",
      )
    )
      return emptyLedger(id);
    if (
      s.memberships !== undefined &&
      (!Array.isArray(s.memberships) ||
        !valid(s.memberships) ||
        s.memberships.some(
          (m: Record<string, unknown>) =>
            typeof m.membershipId !== "string" ||
            (m.validUntil !== null &&
              (typeof m.validUntil !== "string" ||
                !calendarDate(m.validUntil))) ||
            (m.startsOn !== undefined &&
              (typeof m.startsOn !== "string" || !calendarDate(m.startsOn))) ||
            (m.name !== undefined && typeof m.name !== "string") ||
            (m.kind !== undefined &&
              !["package", "membership"].includes(String(m.kind))) ||
            (m.totalVisits !== undefined &&
              m.totalVisits !== null &&
              (!Number.isSafeInteger(m.totalVisits) ||
                Number(m.totalVisits) < Number(m.remainingVisits))) ||
            ["assignedAt", "frozenAt", "cancelledAt"].some(
              (field) =>
                m[field] != null &&
                (typeof m[field] !== "string" ||
                  Number.isNaN(Date.parse(String(m[field])))),
            ) ||
            !["ACTIVE", "EXPIRED", "PAUSED"].includes(String(m.status)) ||
            (m.remainingVisits !== null &&
              (!Number.isSafeInteger(m.remainingVisits) ||
                Number(m.remainingVisits) < 0)),
        ))
    )
      return emptyLedger(id);
    // Materialise expiry once in the same tab-local journal; never a server operation.
    for (const m of s.memberships ?? []) {
      if (!m.name)
        m.name =
          readLocalRecords(id, "memberships").find(
            (d) => d.id === m.membershipId,
          )?.name ?? m.membershipId;
    }
    let expired = false;
    for (const m of s.memberships ?? []) {
      if (
        membershipStatus(m) === "EXPIRED" &&
        m.validUntil &&
        !s.events.some(
          (e: { type: string; membershipId?: string }) =>
            e.type === "MEMBERSHIP_EXPIRED" && e.membershipId === m.id,
        )
      ) {
        s.events.push({
          id: crypto.randomUUID(),
          businessId: id,
          customerId: m.customerId,
          membershipId: m.id,
          locationId: `${id}:main`,
          type: "MEMBERSHIP_EXPIRED",
          occurredAt: new Date(
            Date.parse(m.validUntil) + 86400000,
          ).toISOString(),
          detail: m.name ?? m.membershipId,
          actorName: null,
          performedByMemberId: "local-clock",
        });
        expired = true;
      }
    }
    if (expired) sessionStorage.setItem(key(id), JSON.stringify(s));
    return s;
  } catch {
    return emptyLedger(id);
  }
}
export function executePrototype(command: Omit<PrototypeCommand, "now">) {
  if (!prototypeEnabled()) throw new Error("unavailable");
  const id = command.businessId;
  if (
    !readLocalRecords(id, "customers").some(
      (c) => c.id === command.customerId && !c.archived,
    )
  )
    throw new Error("customer");
  if (command.type === "join" || command.type === "award") {
    const programme = readLocalRecords(id, "loyalty").find(
      (p) => p.id === command.programmeId && !p.archived,
    );
    if (!programme) throw new Error("programme");
    command = {
      ...command,
      target: Number(programme.target),
      reward: programme.reward,
      kind: programme.kind,
    };
  }
  if (
    command.type === "membership" &&
    !readLocalRecords(id, "memberships").some(
      (m) => m.id === command.membershipId && !m.archived,
    )
  )
    throw new Error("membership");
  if (command.type === "membership-manage") {
    const operation = command.membershipOperation;
    if (!operation) throw new Error("invalid");
    if (operation.action === "assign") {
      const definition = readLocalRecords(id, "memberships").find(
        (m) => m.id === command.membershipId && !m.archived,
      );
      if (!definition) throw new Error("membership");
      command = {
        ...command,
        membershipOperation: {
          ...operation,
          name: definition.name,
          kind: definition.kind,
        },
      };
    } else if (["use", "verify"].includes(operation.action)) {
      const assignment = readPrototypeLedger(id).memberships?.find(
        (m) =>
          m.id === operation.assignmentId &&
          m.customerId === command.customerId,
      );
      if (
        !assignment ||
        !readLocalRecords(id, "memberships").some(
          (m) => m.id === assignment.membershipId && !m.archived,
        )
      )
        throw new Error("membership");
    }
  }
  const next = applyPrototypeCommand(readPrototypeLedger(id), {
    ...command,
    now: new Date().toISOString(),
  });
  sessionStorage.setItem(key(id), JSON.stringify(next));
  window.dispatchEvent(new Event(workspaceDraftEvent));
  return next;
}
