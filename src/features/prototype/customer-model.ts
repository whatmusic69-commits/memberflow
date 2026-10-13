import { membershipStatus } from "./memberships";
import { readLocalRecords } from "@/features/workspace/repository";
import { readPrototypeLedger } from "./repository";
import type {
  CustomerDetail,
  CustomerSummary,
  CustomerQuery,
  CustomerDirectory,
} from "@/features/customers/types";
import type { StaffCustomerView } from "@/features/staff/types";
import type { CustomerPagePersonal } from "@/features/customer-page/types";
export function prototypeCustomers(
  businessId: string,
  now = new Date(),
): CustomerSummary[] {
  const journal = readPrototypeLedger(businessId);
  return readLocalRecords(businessId, "customers").map((c) => {
    const events = journal.events.filter((e) => e.customerId === c.id);
    const visits = events.filter((e) => e.type === "VISIT_CREATED");
    const last =
      visits
        .map((e) => e.occurredAt)
        .sort()
        .at(-1) ?? null;
    const p = journal.progress.find((p) => p.customerId === c.id);
    const joined =
      events
        .filter((e) => e.type === "CUSTOMER_JOINED")
        .map((e) => e.occurredAt)
        .sort()[0] ?? null;
    return {
      ...c,
      joinedAt: joined,
      lastVisitAt: last,
      visitCount: visits.length,
      state:
        last && now.getTime() - Date.parse(last) > 30 * 86400000
          ? "INACTIVE"
          : visits.length >= 2
            ? "RETURNING"
            : visits.length === 1
              ? "NEW"
              : "UNKNOWN",
      spending: null,
      loyalty: p
        ? { current: p.current, target: p.target, reward: p.reward }
        : null,
    };
  });
}
export function prototypeDirectory(
  businessId: string,
  q: CustomerQuery,
  now = new Date(),
): CustomerDirectory {
  const records = prototypeCustomers(businessId, now);
  const all = records.filter((c) => !c.archived);
  const cutoff = now.getTime() - q.period * 86400000;
  const ledger = readPrototypeLedger(businessId);
  const relevant = ledger.events.filter(
    (e) =>
      all.some((c) => c.id === e.customerId) &&
      Date.parse(e.occurredAt) >= cutoff &&
      Date.parse(e.occurredAt) <= now.getTime(),
  );
  const filtered = records.filter(
    (c) =>
      c.archived === (q.archived ?? false) &&
      (q.segment === "all" ||
        c.state === (q.segment === "returning" ? "RETURNING" : "INACTIVE")) &&
      `${c.name} ${c.email} ${c.phone}`
        .toLocaleLowerCase()
        .includes(q.search.trim().toLocaleLowerCase()),
  );
  const trend = Array.from({ length: q.period }, (_, i) => {
    const date = new Date(now.getTime() - (q.period - 1 - i) * 86400000)
      .toISOString()
      .slice(0, 10);
    return {
      date,
      visits: relevant.filter(
        (e) => e.type === "VISIT_CREATED" && e.occurredAt.startsWith(date),
      ).length,
      newCustomers: all.filter((c) => c.joinedAt?.startsWith(date)).length,
    };
  });
  return {
    businessId,
    period: q.period,
    page: q.page,
    pageSize: 20,
    totalResults: filtered.length,
    customers: filtered.slice((q.page - 1) * 20, q.page * 20),
    statistics: {
      totalCustomers: all.length,
      newCustomers: all.filter(
        (c) => c.joinedAt && Date.parse(c.joinedAt) >= cutoff,
      ).length,
      visits: relevant.filter((e) => e.type === "VISIT_CREATED").length,
      returningCustomers: all.filter(
        (c) =>
          (c.visitCount ?? 0) >= 2 &&
          !!c.lastVisitAt &&
          Date.parse(c.lastVisitAt) >= cutoff,
      ).length,
      inactiveCustomers: all.filter((c) => c.state === "INACTIVE").length,
      netSales: null,
      salesSource: "NOT_CONNECTED",
      trend,
    },
  };
}
export function prototypeDetail(
  businessId: string,
  id: string,
): CustomerDetail {
  const customer = prototypeCustomers(businessId).find((c) => c.id === id);
  if (!customer) throw new Error("not found");
  const ledger = readPrototypeLedger(businessId);
  return {
    businessId,
    customer,
    memberships: (ledger.memberships ?? [])
      .filter((m) => m.customerId === id)
      .map((m) => ({
        id: m.membershipId,
        name:
          m.name ??
          readLocalRecords(businessId, "memberships").find(
            (p) => p.id === m.membershipId,
          )?.name ??
          m.name ??
          m.membershipId,
        remainingVisits: m.remainingVisits,
        validUntil: m.validUntil,
        status:
          m.validUntil && Date.parse(m.validUntil + "T23:59:59Z") < Date.now()
            ? ("EXPIRED" as const)
            : m.status,
      })),
    rewardsEarned: ledger.rewards.filter((r) => r.customerId === id).length,
    offersRedeemed: 0,
    events: ledger.events
      .filter((e) => e.customerId === id)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    purchases: [],
    salesSource: "NOT_CONNECTED",
  };
}
export function prototypeStaffCustomer(
  businessId: string,
  id: string,
): StaffCustomerView {
  const c = prototypeCustomers(businessId).find(
    (c) => c.id === id && !c.archived,
  );
  if (!c) throw new Error("customer");
  const ledger = readPrototypeLedger(businessId);
  const progress = ledger.progress.filter((p) => p.customerId === id);
  const available = ledger.rewards.filter(
    (r) => r.customerId === id && r.status === "AVAILABLE",
  );
  const programmes = readLocalRecords(businessId, "loyalty");
  const membership = (ledger.memberships ?? []).find(
    (m) =>
      m.customerId === id &&
      membershipStatus(m) === "ACTIVE" &&
      (!m.validUntil ||
        Date.parse(m.validUntil + "T23:59:59Z") >= Date.now()) &&
      readLocalRecords(businessId, "memberships").some(
        (p) => p.id === m.membershipId && !p.archived,
      ),
  );
  const membershipName = membership
    ? (readLocalRecords(businessId, "memberships").find(
        (m) => m.id === membership.membershipId,
      )?.name ?? membership.membershipId)
    : "";
  return {
    id,
    businessId,
    name: c.name,
    customerSince: c.joinedAt,
    loyalty: c.loyalty
      ? {
          kind: progress[0]?.kind,
          stamps: c.loyalty.current,
          target: c.loyalty.target,
          nextReward: c.loyalty.reward,
          rewardAvailable: available.length > 0,
        }
      : null,
    membership: membership
      ? {
          id: membership.membershipId,
          name: membershipName,
          visitsRemaining: membership.remainingVisits,
        }
      : null,
    offers: [],
    availableActions: [
      { id: "visit", type: "VISIT_CREATED" },
      ...(ledger.memberships ?? [])
        .filter(
          (m) =>
            m.customerId === id &&
            membershipStatus(m) === "ACTIVE" &&
            readLocalRecords(businessId, "memberships").some(
              (p) => p.id === m.membershipId && !p.archived,
            ),
        )
        .map((m) => ({
          id: `membership:${m.id}`,
          type: "SUBSCRIPTION_USED" as const,
          resourceId: m.id,
          label:
            m.name ??
            readLocalRecords(businessId, "memberships").find(
              (p) => p.id === m.membershipId,
            )?.name,
          ...(m.remainingVisits !== null
            ? { remainingAfter: m.remainingVisits - 1 }
            : {}),
        })),
      ...progress
        .filter((p) =>
          programmes.some((l) => l.id === p.programmeId && !l.archived),
        )
        .map((p) => ({
          id: `award:${p.programmeId}`,
          label: programmes.find((l) => l.id === p.programmeId)?.name,
          type:
            p.kind === "points"
              ? ("POINTS_ADDED" as const)
              : ("STAMP_ADDED" as const),
          resourceId: p.programmeId,
        })),
      ...available.map((r) => ({
        id: `redeem:${r.id}`,
        label: r.name,
        type: "REWARD_REDEEMED" as const,
        resourceId: r.id,
      })),
    ],
  };
}
export function prototypePersonal(
  businessId: string,
  id: string,
): CustomerPagePersonal {
  const c = prototypeStaffCustomer(businessId, id);
  return {
    customer: { id, firstName: c.name },
    loyalty: c.loyalty
      ? {
          stamps: c.loyalty.stamps,
          target: c.loyalty.target,
          nextReward: c.loyalty.nextReward,
        }
      : null,
    memberships: prototypeDetail(businessId, id).memberships.map((m) => ({
      id: m.id,
      name: m.name,
      remainingVisits: m.remainingVisits,
      validUntil: m.validUntil,
      statusLabel: m.status,
    })),
    offers: [],
    wallet: {
      apple: { status: "UNAVAILABLE", actionUrl: null },
      google: { status: "UNAVAILABLE", actionUrl: null },
    },
  };
}
export const prototypeCode = (businessId: string, customerId: string) =>
  `memberflow-preview:${encodeURIComponent(businessId)}:${encodeURIComponent(customerId)}`;
export function parsePrototypeCode(code: string, businessId: string) {
  const parts = code.split(":");
  if (
    parts.length !== 3 ||
    parts[0] !== "memberflow-preview" ||
    decodeURIComponent(parts[1]) !== businessId
  )
    throw new Error("code");
  return decodeURIComponent(parts[2]);
}

export function prototypeReturnTrend(
  businessId: string,
  dates: string[],
): Map<string, number> {
  const visits = readPrototypeLedger(businessId)
    .events.filter((e) => e.type === "VISIT_CREATED")
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const active = new Set(
    readLocalRecords(businessId, "customers")
      .filter((c) => !c.archived)
      .map((c) => c.id),
  );
  const seen = new Map<string, number>();
  const returned = new Map<string, Set<string>>();
  for (const event of visits) {
    if (!active.has(event.customerId)) continue;
    const count = (seen.get(event.customerId) ?? 0) + 1;
    seen.set(event.customerId, count);
    const date = event.occurredAt.slice(0, 10);
    if (count >= 2 && dates.includes(date)) {
      const customers = returned.get(date) ?? new Set<string>();
      customers.add(event.customerId);
      returned.set(date, customers);
    }
  }
  return new Map(dates.map((date) => [date, returned.get(date)?.size ?? 0]));
}
