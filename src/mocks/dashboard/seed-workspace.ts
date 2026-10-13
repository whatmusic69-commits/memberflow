import {
  customerMembershipFixture,
  customers as customerFixtures,
} from "@/mocks/customers/fixtures";
import { guestBusinessPage } from "@/mocks/customer-page/fixtures";
import { emptyLedger } from "@/features/prototype/ledger";
/** Seed existing examples once, only for an explicitly requested populated fixture.
 * No aggregate sales/visit numbers are expanded into invented transaction history. */
export function seedWorkspaceFixture(businessId: string, fixture: string) {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_DASHBOARD_MODE === "api" ||
    businessId !== "demo-business" ||
    !["active", "partial", "manager", "staff"].includes(fixture)
  )
    return;
  const marker = `memberflow:fixture-seed:v1:${businessId}`;
  if (sessionStorage.getItem(marker)) return;
  const moduleKey = (section: string) =>
    `memberflow:workspace:v1:${businessId}:${section}`;
  // Never overwrite an owner's existing local workspace with example data.
  if (
    ["customers", "loyalty", "offers", "memberships", "automations"].some(
      (s) => {
        try {
          return (
            JSON.parse(sessionStorage.getItem(moduleKey(s)) || "[]").length > 0
          );
        } catch {
          return false;
        }
      },
    )
  ) {
    sessionStorage.setItem(marker, "skipped");
    return;
  }
  const customers =
    fixture === "partial" ? customerFixtures.slice(0, 1) : customerFixtures;
  const rows = customers.map((c) => ({
    id: c.id,
    businessId,
    name: c.name,
    email: c.email,
    phone: c.phone,
    notes: c.notes,
    archived: c.archived,
    updatedAt: c.updatedAt,
  }));
  const programmeId = "fixture-coffee-programme";
  const source = customers.find((c) => c.loyalty)?.loyalty;
  const programmes = source
    ? [
        {
          id: programmeId,
          businessId,
          name: "Coffee card",
          kind: "stamps",
          target: String(source.target),
          reward: source.reward,
          description: "",
          archived: false,
          updatedAt: customers[0].updatedAt,
        },
      ]
    : [];
  const membership = customerMembershipFixture;
  const membershipCustomers = customers.filter((c) => c.id !== "robert");
  const memberships = membershipCustomers.length
    ? [
        {
          id: membership.id,
          businessId,
          name: membership.name,
          kind: "package",
          price: "",
          currency: "EUR",
          visits: String(membership.remainingVisits),
          interval: "monthly",
          description: "",
          archived: false,
          updatedAt: customers[0].updatedAt,
        },
      ]
    : [];
  const ledger = emptyLedger(businessId);
  ledger.memberships = membershipCustomers.map((c) => ({
    id: `fixture-membership-${c.id}`,
    businessId,
    customerId: c.id,
    membershipId: membership.id,
    remainingVisits: membership.remainingVisits,
    validUntil: membership.validUntil,
    status: membership.status,
  }));
  for (const customer of customers) {
    if (customer.loyalty)
      ledger.progress.push({
        id: `fixture-progress-${customer.id}`,
        businessId,
        customerId: customer.id,
        programmeId,
        current: customer.loyalty.current,
        target: customer.loyalty.target,
        reward: customer.loyalty.reward,
        kind: "stamps",
        joinedAt: customer.joinedAt!,
      });
    if (customer.joinedAt)
      ledger.events.push({
        id: `fixture-join-${customer.id}`,
        businessId,
        customerId: customer.id,
        programmeId: customer.loyalty ? programmeId : undefined,
        locationId: `${businessId}:main`,
        type: "CUSTOMER_JOINED",
        occurredAt: customer.joinedAt,
        detail: null,
        actorName: null,
        performedByMemberId: "fixture",
      });
    if (customer.lastVisitAt)
      ledger.events.push({
        id: `fixture-visit-${customer.id}`,
        businessId,
        customerId: customer.id,
        locationId: `${businessId}:main`,
        type: "VISIT_CREATED",
        occurredAt: customer.lastVisitAt,
        detail: null,
        actorName: "Anna",
        performedByMemberId: "fixture",
      });
  }
  const offers = guestBusinessPage.offers.map((o) => ({
    id: o.id,
    businessId,
    name: o.title,
    description: o.description,
    audience: "all",
    expiresAt: o.validUntil ?? "",
    archived: false,
    updatedAt: customers[0].updatedAt,
  }));
  sessionStorage.setItem(moduleKey("customers"), JSON.stringify(rows));
  sessionStorage.setItem(moduleKey("loyalty"), JSON.stringify(programmes));
  sessionStorage.setItem(moduleKey("offers"), JSON.stringify(offers));
  sessionStorage.setItem(moduleKey("memberships"), JSON.stringify(memberships));
  sessionStorage.setItem(
    `memberflow:prototype-journal:v1:${businessId}`,
    JSON.stringify(ledger),
  );
  sessionStorage.setItem(marker, "seeded");
}
