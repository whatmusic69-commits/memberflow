import type {
  CustomerSummary,
  CustomerDetail,
  CustomerDirectory,
  CustomerQuery,
} from "@/features/customers/types";
import { readLocalRecords } from "@/features/workspace/repository";
const customers: CustomerSummary[] = [
  {
    id: "anna",
    name: "Anna Ozola",
    email: "anna@example.com",
    phone: "",
    notes: "",
    archived: false,
    updatedAt: "2026-10-06T10:42:00Z",
    joinedAt: "2026-09-12T12:00:00Z",
    lastVisitAt: "2026-10-06T10:42:00Z",
    visitCount: 8,
    state: "RETURNING",
    spending: { minor: 4280, currency: "EUR" },
    loyalty: { current: 4, target: 6, reward: "Free coffee" },
  },
  {
    id: "robert",
    name: "Robert Kalniņš",
    email: "robert@example.com",
    phone: "",
    notes: "",
    archived: false,
    updatedAt: "2026-09-01T09:00:00Z",
    joinedAt: "2026-08-10T12:00:00Z",
    lastVisitAt: "2026-09-01T09:00:00Z",
    visitCount: 3,
    state: "INACTIVE",
    spending: { minor: 1570, currency: "EUR" },
    loyalty: { current: 3, target: 6, reward: "Free coffee" },
  },
  {
    id: "elina",
    name: "Elīna Bērziņa",
    email: "elina@example.com",
    phone: "",
    notes: "",
    archived: false,
    updatedAt: "2026-10-05T12:00:00Z",
    joinedAt: "2026-09-16T12:00:00Z",
    lastVisitAt: "2026-10-05T12:00:00Z",
    visitCount: 6,
    state: "RETURNING",
    spending: { minor: 3200, currency: "EUR" },
    loyalty: null,
  },
];
const emptyStats = {
  totalCustomers: 0,
  newCustomers: 0,
  visits: 0,
  returningCustomers: 0,
  inactiveCustomers: 0,
  netSales: null,
  salesSource: "NOT_CONNECTED" as const,
  trend: [],
};
function records(businessId: string) {
  const active = ["active", "partial", "manager"].includes(
    new URLSearchParams(window.location.search).get("demo") ?? "",
  );
  const drafts = readLocalRecords(businessId, "customers");
  const base = active ? customers : [];
  return [
    ...drafts.map((d) => ({
      ...base.find((c) => c.id === d.id),
      ...d,
      joinedAt: base.find((c) => c.id === d.id)?.joinedAt ?? null,
      lastVisitAt: base.find((c) => c.id === d.id)?.lastVisitAt ?? null,
      visitCount: base.find((c) => c.id === d.id)?.visitCount ?? null,
      state: base.find((c) => c.id === d.id)?.state ?? ("UNKNOWN" as const),
      spending: base.find((c) => c.id === d.id)?.spending ?? null,
      loyalty: base.find((c) => c.id === d.id)?.loyalty ?? null,
    })),
    ...base.filter((c) => !drafts.some((d) => d.id === c.id)),
  ];
}
export function directoryFixture(
  businessId: string,
  q: CustomerQuery,
): CustomerDirectory {
  const recordsForBusiness = records(businessId);
  const all = recordsForBusiness.filter((c) => !c.archived);
  const active = ["active", "partial", "manager"].includes(
    new URLSearchParams(window.location.search).get("demo") ?? "",
  );
  const needle = q.search.toLocaleLowerCase();
  const filtered = recordsForBusiness.filter(
    (c) =>
      c.archived === (q.archived ?? false) &&
      (q.segment === "all" ||
        c.state === (q.segment === "returning" ? "RETURNING" : "INACTIVE")) &&
      `${c.name} ${c.email} ${c.phone}`.toLocaleLowerCase().includes(needle),
  );
  const trend = Array.from(
    { length: q.period === 7 ? 7 : q.period === 30 ? 6 : 9 },
    (_, i) => ({
      date: new Date(
        Date.UTC(
          2026,
          9,
          6 -
            (q.period === 7
              ? 6 - i
              : q.period === 30
                ? (5 - i) * 5
                : (8 - i) * 10),
        ),
      ).toISOString(),
      visits: (q.period === 7
        ? [2, 3, 1, 2, 1, 2, 1]
        : q.period === 30
          ? [2, 3, 2, 3, 2, 2]
          : [2, 2, 1, 2, 2, 3, 1, 2, 2])[i],
      newCustomers: (q.period === 7
        ? [0, 0, 0, 0, 0, 0, 0]
        : q.period === 30
          ? [1, 0, 0, 1, 0, 0]
          : [1, 0, 0, 0, 1, 0, 0, 0, 1])[i],
    }),
  );
  return {
    businessId,
    period: q.period,
    statistics: active
      ? {
          totalCustomers: all.length,
          newCustomers: q.period === 7 ? 0 : q.period === 30 ? 2 : 3,
          visits: q.period === 7 ? 12 : q.period === 30 ? 14 : 17,
          returningCustomers: 2,
          inactiveCustomers: 1,
          netSales: {
            minor: q.period === 7 ? 1260 : q.period === 30 ? 4520 : 9050,
            currency: "EUR",
          },
          salesSource: "AVAILABLE",
          trend,
        }
      : { ...emptyStats, totalCustomers: all.length },
    customers: filtered.slice((q.page - 1) * 20, q.page * 20),
    page: q.page,
    pageSize: 20,
    totalResults: filtered.length,
  };
}
export function detailFixture(businessId: string, id: string): CustomerDetail {
  const customer = records(businessId).find((c) => c.id === id);
  if (!customer) throw new Error("not found");
  const known =
    customers.some((c) => c.id === id) && customer.visitCount !== null;
  return {
    businessId,
    customer,
    rewardsEarned: known ? 1 : null,
    offersRedeemed: known ? 1 : null,
    memberships:
      known && id !== "robert"
        ? [
            {
              id: "coffee-club",
              name: "Coffee Club",
              remainingVisits: 8,
              validUntil: "2026-11-01",
              status: "ACTIVE",
            },
          ]
        : [],
    events: known
      ? [
          {
            id: "visit",
            type: "VISIT_CREATED",
            occurredAt: customer.lastVisitAt!,
            detail: null,
            actorName: "Anna",
          },
          {
            id: "stamp",
            type: "STAMP_ADDED",
            occurredAt: customer.lastVisitAt!,
            detail: null,
            actorName: "Anna",
          },
          {
            id: "joined",
            type: "CUSTOMER_JOINED",
            occurredAt: customer.joinedAt!,
            detail: null,
            actorName: null,
          },
        ]
      : [],
    purchases: known
      ? [
          {
            id: "purchase",
            occurredAt: customer.lastVisitAt!,
            description: "Pumpkin Latte",
            netAmount: { minor: 390, currency: "EUR" },
            status: "PAID",
          },
        ]
      : [],
    salesSource: known ? "AVAILABLE" : "NOT_CONNECTED",
  };
}
