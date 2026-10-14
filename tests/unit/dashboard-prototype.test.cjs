/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS bootstrap for isolated TypeScript repository tests. */
/* Repository-level checks; no server or browser is started. */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "../..");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  return resolve.call(
    this,
    request.startsWith("@/")
      ? path.join(root, "src", request.slice(2))
      : request,
    parent,
    ...rest,
  );
};
require.extensions[".ts"] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    filename,
  );
process.env.NODE_ENV = "development";
delete process.env.NEXT_PUBLIC_DASHBOARD_MODE;
class Storage {
  values = new Map();
  getItem(key) {
    return this.values.get(key) ?? null;
  }
  setItem(key, value) {
    this.values.set(key, String(value));
  }
  removeItem(key) {
    this.values.delete(key);
  }
  clear() {
    this.values.clear();
  }
}
global.sessionStorage = new Storage();
global.localStorage = new Storage();
global.window = new EventTarget();
window.location = { search: "", origin: "http://localhost:3000" };
global.crypto ??= require("node:crypto").webcrypto;
const {
  emptyLedger,
  applyPrototypeCommand,
} = require("../../src/features/prototype/ledger.ts");
const {
  executePrototype,
  readPrototypeLedger,
} = require("../../src/features/prototype/repository.ts");
const {
  moduleRepository,
  saveLocalSettings,
} = require("../../src/features/workspace/repository.ts");
const {
  customerPageService,
  readPageDraft,
} = require("../../src/features/customer-page/service.ts");
const {
  prototypeDirectory,
  prototypeDetail,
  prototypeCode,
} = require("../../src/features/prototype/customer-model.ts");
const {
  getCampaignService,
  archiveDemoCampaign,
} = require("../../src/features/campaigns/service.ts");
const {
  getDashboardService,
} = require("../../src/features/dashboard/service.ts");
const { getStaffService } = require("../../src/features/staff/service.ts");
const {
  saveOnboardingPreview,
} = require("../../src/features/dashboard/onboarding-preview.ts");
const { accessFor } = require("../../src/features/access/permissions.ts");
const business = (id) => ({
  id,
  name: id,
  category: "cafe",
  city: "Riga",
  logoUrl: null,
  accent: "#c84720",
  planName: null,
  goals: ["loyalty"],
});
const loyalty = {
  name: "Coffee",
  kind: "stamps",
  target: "2",
  reward: "Coffee reward",
  description: "Local fixture",
};
const customer = {
  name: "Fictional customer",
  email: "",
  phone: "",
  notes: "",
};
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  window.location.search = "";
  delete process.env.NEXT_PUBLIC_DASHBOARD_MODE;
});

test("pure ledger: replay, reward threshold, redemption and wrong-business protection", () => {
  const command = {
    key: "join",
    businessId: "a",
    customerId: "c",
    programmeId: "p",
    target: 2,
    reward: "Coffee",
    kind: "points",
    type: "join",
    now: "2026-10-13T12:00:00Z",
    actorName: null,
    memberId: "m",
  };
  let state = applyPrototypeCommand(emptyLedger("a"), command);
  state = applyPrototypeCommand(state, {
    ...command,
    type: "award",
    key: "award",
  });
  const replay = applyPrototypeCommand(state, {
    ...command,
    type: "award",
    key: "award",
  });
  assert.strictEqual(replay, state);
  assert.equal(state.progress[0].current, 1);
  assert.throws(
    () =>
      applyPrototypeCommand(state, { ...command, type: "visit", key: "award" }),
    /idempotency-conflict/,
  );
  state = applyPrototypeCommand(state, {
    ...command,
    type: "award",
    key: "second",
  });
  assert.equal(state.rewards.length, 1);
  assert.equal(state.progress[0].current, 0);
  const redeem = {
    ...command,
    type: "redeem",
    key: "redeem",
    rewardId: state.rewards[0].id,
  };
  state = applyPrototypeCommand(state, redeem);
  assert.equal(state.rewards[0].status, "REDEEMED");
  assert.strictEqual(applyPrototypeCommand(state, redeem), state);
  assert.throws(
    () => applyPrototypeCommand(state, { ...redeem, key: "other" }),
    /reward/,
  );
  assert.throws(
    () => applyPrototypeCommand(state, { ...command, businessId: "b" }),
    /invalid/,
  );
});

test("Settings and Customer Page share public fields in both directions, without user identity or images in localStorage", async () => {
  const page = customerPageService(business("a"), true);
  await page.get();
  await saveLocalSettings(
    "a",
    {
      ...business("a"),
      country: "LV",
      description: "New description",
      website: "https://example.com",
      instagram: "",
      logoUrl: "data:image/png;base64,fake",
      firstName: "Private owner",
    },
    true,
  );
  assert.equal((await page.get()).business.description, "New description");
  assert.equal(
    (await page.get()).branding.logoUrl,
    "data:image/png;base64,fake",
  );
  const config = await page.get();
  await page.save({
    branding: { ...config.branding, accent: "#123456" },
    business: {
      ...config.business,
      name: "Updated page",
      address: "Public address",
    },
    modules: config.modules,
    social: config.social,
    invitation: config.invitation,
  });
  assert.equal(
    (
      await getDashboardService("new")
        .getOverview("a")
        .catch(() => ({ business: { name: "not registered" } }))
    ).business.name,
    "not registered",
  );
  const {
    applyBusinessProfile,
  } = require("../../src/features/workspace/business-profile.ts");
  assert.equal(applyBusinessProfile(business("a")).name, "Updated page");
  assert.equal(applyBusinessProfile(business("a")).accent, "#123456");
  assert.ok(
    [...localStorage.values.values()].every(
      (value) =>
        !value.includes("Private owner") &&
        !value.includes("base64") &&
        !value.includes("blob:"),
    ),
  );
});

test("Loyalty → Customer Page → CRM → visits/rewards share stable IDs and isolated records", async () => {
  const p = await moduleRepository("loyalty", true).save("a", loyalty);
  const c = await moduleRepository("customers", true).save("a", customer);
  const page = customerPageService(business("a"), true);
  await page.get();
  assert.equal(readPageDraft("a").content.loyalty.reward, p.reward);
  await page.setStatus("ACTIVE");
  assert.equal(readPageDraft("a").publicUrl, null);
  const cmd = {
    businessId: "a",
    customerId: c.id,
    programmeId: p.id,
    actorName: null,
    memberId: "preview",
  };
  executePrototype({ ...cmd, key: "j", type: "join" });
  executePrototype({ ...cmd, key: "v", type: "visit" });
  executePrototype({ ...cmd, key: "x", type: "award" });
  executePrototype({ ...cmd, key: "x", type: "award" });
  assert.equal(prototypeDetail("a", c.id).customer.loyalty.current, 1);
  executePrototype({ ...cmd, key: "y", type: "award" });
  const reward = readPrototypeLedger("a").rewards[0];
  executePrototype({ ...cmd, key: "r", type: "redeem", rewardId: reward.id });
  assert.ok(
    prototypeDetail("a", c.id).events.some((e) => e.type === "REWARD_REDEEMED"),
  );
  assert.equal(
    prototypeDirectory("b", { period: 30, segment: "all", search: "", page: 1 })
      .totalResults,
    0,
  );
  assert.equal(prototypeDetail("a", c.id).customer.spending, null);
});

test("Offer references stay current, archive blocks active dependants, and validations reject dangling references", async () => {
  const offer = await moduleRepository("offers", true).save("a", {
    name: "Double stamps",
    description: "First description",
    audience: "all",
    expiresAt: "",
  });
  const campaign = await getCampaignService(true).save("a", {
    name: "Campaign",
    kind: "offer",
    description: "Independent copy",
    price: "",
    currency: "EUR",
    channels: [],
    image: null,
    source: { kind: "offer", id: offer.id },
  });
  await moduleRepository("automations", true).save("a", {
    name: "Return",
    inactivityDays: "30",
    offerId: offer.id,
    channel: "memberflow",
  });
  await moduleRepository("offers", true).save(
    "a",
    { ...offer, description: "New description" },
    offer.id,
  );
  assert.equal(
    (await getCampaignService(true).list("a"))[0].description,
    "New description",
  );
  assert.ok(
    !sessionStorage
      .getItem("memberflow:campaign-drafts:v1:a")
      .includes("Independent copy"),
  );
  await assert.rejects(
    moduleRepository("offers", true).archive("a", offer.id, true),
    /referenced/,
  );
  const automation = (await moduleRepository("automations", true).list("a"))[0];
  await moduleRepository("automations", true).archive("a", automation.id, true);
  archiveDemoCampaign("a", campaign.id, true);
  await moduleRepository("offers", true).archive("a", offer.id, true);
  await assert.rejects(
    moduleRepository("automations", true).save("a", {
      name: "Broken",
      inactivityDays: "30",
      offerId: offer.id,
      channel: "memberflow",
    }),
    /reference/,
  );
});

test("Overview, business switching and role navigation retain business isolation", async () => {
  const register = (name) =>
    saveOnboardingPreview({
      firstName: "Owner",
      business: { name, type: "cafe", country: "LV", city: "Riga" },
      goals: ["loyalty"],
      planName: null,
      selection: { planId: "starter", interval: "monthly" },
    });
  register("First");
  const first = await getDashboardService("new").getOverview();
  const p = await moduleRepository("loyalty", true).save(
    first.business.id,
    loyalty,
  );
  const c = await moduleRepository("customers", true).save(
    first.business.id,
    customer,
  );
  executePrototype({
    businessId: first.business.id,
    customerId: c.id,
    programmeId: p.id,
    key: "joined",
    type: "join",
    memberId: "preview",
    actorName: null,
  });
  register("Second");
  const second = await getDashboardService("new").getOverview();
  assert.notEqual(first.business.id, second.business.id);
  assert.equal(second.retention.loyalty, 0);
  assert.equal(second.results.offerRevenue, null);
  assert.ok(second.businesses.some((b) => b.id === first.business.id));
  const restored = await getDashboardService("new", "MANAGER").getOverview(
    first.business.id,
  );
  assert.equal(restored.retention.loyalty, 1);
  assert.equal(restored.results.newCustomers, 1);
  assert.equal(restored.membership.businessId, first.business.id);
  assert.equal(
    accessFor(restored.membership.permissions).can("team.manage"),
    false,
  );
});

test("Existing staff service resolves only a scoped preview code and applies retries once", async () => {
  await getDashboardService("new").getOverview();
  const p = await moduleRepository("loyalty", true).save(
    "demo-business",
    loyalty,
  );
  const c = await moduleRepository("customers", true).save(
    "demo-business",
    customer,
  );
  executePrototype({
    businessId: "demo-business",
    customerId: c.id,
    programmeId: p.id,
    type: "join",
    key: "join",
    actorName: null,
    memberId: "preview",
  });
  window.location.search =
    "?business=demo-business&previewRole=STAFF&workspaceDemo=new";
  const service = getStaffService(true);
  const view = await service.resolveCustomer(
    "demo-business",
    prototypeCode("demo-business", c.id),
  );
  assert.equal(view.id, c.id);
  await assert.rejects(
    service.resolveCustomer("demo-business", prototypeCode("other", c.id)),
    /code/,
  );
  const action = view.availableActions.find((a) => a.type === "STAMP_ADDED");
  const result = await service.execute(
    "demo-business",
    c.id,
    action.id,
    "same",
  );
  const retry = await service.execute("demo-business", c.id, action.id, "same");
  assert.equal(result.event.id, retry.event.id);
  assert.equal(retry.customer.loyalty.stamps, 1);
});

test("Search, archive, inactivity and period statistics follow recorded facts", async () => {
  const c = await moduleRepository("customers", true).save("a", customer);
  let ledger = emptyLedger("a");
  for (const [key, now] of [
    ["v1", "2026-08-01T12:00:00Z"],
    ["v2", "2026-08-02T12:00:00Z"],
  ])
    ledger = applyPrototypeCommand(ledger, {
      key,
      businessId: "a",
      customerId: c.id,
      type: "visit",
      now,
      actorName: null,
      memberId: "preview",
    });
  sessionStorage.setItem(
    "memberflow:prototype-journal:v1:a",
    JSON.stringify(ledger),
  );
  const query = {
    period: 30,
    segment: "inactive",
    search: "FICTIONAL",
    page: 1,
  };
  const directory = prototypeDirectory(
    "a",
    query,
    new Date("2026-10-13T12:00:00Z"),
  );
  assert.equal(directory.customers.length, 1);
  assert.equal(directory.statistics.visits, 0);
  assert.equal(directory.statistics.netSales, null);
  await moduleRepository("customers", true).archive("a", c.id, true);
  assert.equal(
    prototypeDirectory("a", { ...query, segment: "all", archived: false })
      .totalResults,
    0,
  );
});

test("Corrupt journal safely resets, and production/API modes cannot execute the prototype", async () => {
  sessionStorage.setItem("memberflow:prototype-journal:v1:a", "{bad");
  assert.equal(readPrototypeLedger("a").events.length, 0);
  process.env.NEXT_PUBLIC_DASHBOARD_MODE = "api";
  assert.throws(
    () =>
      executePrototype({
        businessId: "a",
        customerId: "c",
        key: "x",
        type: "visit",
        memberId: "preview",
        actorName: null,
      }),
    /unavailable/,
  );
  await assert.rejects(
    moduleRepository("loyalty", true).save("a", loyalty),
    /unavailable/,
  );
});

test("Existing populated fixture is seeded once into the same CRM/journal; no aggregate revenue is invented", async () => {
  window.location.search = "?demo=active";
  const overview = await getDashboardService("active").getOverview();
  const {
    customerService,
  } = require("../../src/features/customers/service.ts");
  const service = customerService(true);
  const directory = await service.directory("demo-business", {
    period: 90,
    segment: "all",
    search: "",
    page: 1,
  });
  assert.equal(directory.statistics.totalCustomers, 3);
  assert.equal(directory.statistics.visits, 3); // Only the three explicitly recorded last visits, not invented visits from aggregate counts.
  assert.equal(overview.results.offerRevenue, null);
  assert.equal(directory.statistics.netSales, null);
  const detail = await service.detail("demo-business", "anna");
  assert.equal(detail.memberships[0].id, "coffee-club");
  assert.equal(detail.customer.loyalty.current, 4);
  let ledger = readPrototypeLedger("demo-business");
  const command = {
    businessId: "demo-business",
    customerId: "anna",
    membershipId: "coffee-club",
    type: "membership",
    key: "package-use",
    now: "2026-10-13T12:00:00Z",
    memberId: "fixture",
    actorName: null,
  };
  ledger = applyPrototypeCommand(ledger, command);
  assert.equal(
    ledger.memberships.find((m) => m.customerId === "anna").remainingVisits,
    7,
  );
  assert.strictEqual(applyPrototypeCommand(ledger, command), ledger);
  assert.equal(
    prototypeDirectory("another", {
      period: 90,
      segment: "all",
      search: "",
      page: 1,
    }).totalResults,
    0,
  );
});

test("User profile is separate from public presentation, and schema v1 public drafts migrate safely", async () => {
  const {
    saveLocalUserName,
    readLocalUserName,
  } = require("../../src/features/workspace/user-profile.ts");
  await customerPageService(business("a"), true).get();
  saveLocalUserName("user", "Private first name");
  assert.equal(readLocalUserName("user"), "Private first name");
  assert.equal(readPageDraft("a").business.name, "a");
  const {
    readBusinessProfile,
  } = require("../../src/features/workspace/business-profile.ts");
  assert.equal(readBusinessProfile("a").business.name, "a");
  assert.ok(
    [...localStorage.values.values()].every(
      (s) => !s.includes("Private first name"),
    ),
  );
  localStorage.setItem(
    "memberflow:business-profile:v2:broken",
    JSON.stringify({ businessId: "wrong" }),
  );
  assert.equal(readBusinessProfile("broken"), null);
});

test("Staff and Team permissions remain explicit and archived references cannot be restored", async () => {
  const {
    fixtureMembership,
  } = require("../../src/mocks/dashboard/permissions.ts");
  const { getTeamService } = require("../../src/features/team/service.ts");
  const owner = {
    ...fixtureMembership("demo-business"),
    user: { id: "demo-user", firstName: "Owner" },
  };
  const service = getTeamService("demo-business", true, owner, true);
  const changed = await service.updateMember("demo-manager", { role: "STAFF" });
  const staff = changed.members.find((m) => m.id === "demo-manager");
  assert.equal(accessFor(staff.permissions).can("customer.scan"), true);
  assert.equal(accessFor(staff.permissions).can("overview.read"), false);
  await assert.rejects(service.removeMember(owner.id), /member/);
  await assert.rejects(
    getTeamService("demo-business", true, { ...owner, permissions: [] }).invite(
      "fake@example.com",
      "STAFF",
    ),
    /denied/,
  );
  const offer = await moduleRepository("offers", true).save("a", {
    name: "Offer",
    description: "Draft",
    audience: "all",
    expiresAt: "",
  });
  const automation = await moduleRepository("automations", true).save("a", {
    name: "Automation",
    inactivityDays: "30",
    offerId: offer.id,
    channel: "memberflow",
  });
  await moduleRepository("automations", true).archive("a", automation.id, true);
  await moduleRepository("offers", true).archive("a", offer.id, true);
  await assert.rejects(
    moduleRepository("automations", true).archive("a", automation.id, false),
    /referenced/,
  );
});

const {
  membershipStatus,
  membershipStatistics,
} = require("../../src/features/prototype/memberships.ts");
const membershipAssignment = (overrides = {}) => ({
  key: "assign-a",
  businessId: "a",
  customerId: "customer-a",
  membershipId: "definition-a",
  type: "membership-manage",
  now: "2026-10-13T12:00:00Z",
  actorName: "Preview",
  memberId: "owner",
  membershipOperation: {
    action: "assign",
    assignmentId: "assignment-a",
    permissions: ["membership.create"],
    name: "Five sessions",
    kind: "package",
    startsOn: "2026-10-13",
    endsOn: "2026-11-13",
    visits: 5,
    ...overrides,
  },
});
const membershipOperation = (action, overrides = {}) => ({
  ...membershipAssignment(),
  key: action,
  membershipOperation: {
    action,
    assignmentId: "assignment-a",
    permissions: ["membership.create", "membership.redeem"],
    ...overrides,
  },
});
test("Membership assignment snapshots conditions, rejects invalid dates and never creates a sale", () => {
  const ledger = applyPrototypeCommand(
    emptyLedger("a"),
    membershipAssignment(),
  );
  assert.equal(ledger.memberships[0].remainingVisits, 5);
  assert.equal(ledger.memberships[0].totalVisits, 5);
  assert.equal(ledger.events[0].type, "MEMBERSHIP_ASSIGNED");
  assert.strictEqual(
    applyPrototypeCommand(ledger, membershipAssignment()),
    ledger,
  );
  for (const values of [
    { visits: 0 },
    { visits: 1.5 },
    { startsOn: "2026-02-30" },
    { endsOn: "2026-10-12" },
    { kind: "membership", endsOn: null },
  ])
    assert.throws(() =>
      applyPrototypeCommand(emptyLedger("a"), membershipAssignment(values)),
    );
});
test("Membership usage is idempotent per assignment, exhausts at zero, and protects request keys", () => {
  let ledger = applyPrototypeCommand(emptyLedger("a"), membershipAssignment());
  for (let n = 0; n < 5; n++) {
    const command = { ...membershipOperation("use"), key: `use-${n}` };
    ledger = applyPrototypeCommand(ledger, command);
    assert.strictEqual(applyPrototypeCommand(ledger, command), ledger);
    assert.equal(ledger.memberships[0].remainingVisits, 4 - n);
  }
  assert.equal(
    membershipStatus(ledger.memberships[0], "2026-10-13"),
    "EXHAUSTED",
  );
  assert.throws(
    () => applyPrototypeCommand(ledger, membershipOperation("use")),
    /membership/,
  );
  assert.throws(
    () =>
      applyPrototypeCommand(ledger, {
        ...membershipOperation("use"),
        key: "use-0",
        customerId: "another",
      }),
    /idempotency/,
  );
  assert.equal(membershipStatistics(ledger, "2026-10-13").used, 5);
});
test("Membership schedule and inclusive expiry boundaries block early or expired usage", () => {
  const ledger = applyPrototypeCommand(
    emptyLedger("a"),
    membershipAssignment({ startsOn: "2026-10-14" }),
  );
  assert.equal(
    membershipStatus(ledger.memberships[0], "2026-10-13"),
    "SCHEDULED",
  );
  assert.throws(() =>
    applyPrototypeCommand(ledger, membershipOperation("use")),
  );
  assert.equal(
    membershipStatus(ledger.memberships[0], "2026-11-13T23:59:59Z"),
    "ACTIVE",
  );
  assert.equal(
    membershipStatus(ledger.memberships[0], "2026-11-14T00:00:00Z"),
    "EXPIRED",
  );
  assert.throws(() =>
    applyPrototypeCommand(ledger, {
      ...membershipOperation("use"),
      now: "2026-11-14T00:00:00Z",
    }),
  );
});
test("Membership freeze/resume preserve dates and cancellation is final", () => {
  let ledger = applyPrototypeCommand(emptyLedger("a"), membershipAssignment());
  assert.throws(() =>
    applyPrototypeCommand(
      ledger,
      membershipOperation("freeze", { reason: " " }),
    ),
  );
  ledger = applyPrototypeCommand(
    ledger,
    membershipOperation("freeze", { reason: "Holiday" }),
  );
  assert.equal(membershipStatus(ledger.memberships[0], "2026-10-13"), "FROZEN");
  assert.throws(() =>
    applyPrototypeCommand(ledger, membershipOperation("use")),
  );
  ledger = applyPrototypeCommand(ledger, membershipOperation("resume"));
  assert.equal(ledger.memberships[0].validUntil, "2026-11-13");
  assert.equal(membershipStatus(ledger.memberships[0], "2026-10-13"), "ACTIVE");
  ledger = applyPrototypeCommand(ledger, membershipOperation("cancel"));
  assert.equal(
    membershipStatus(ledger.memberships[0], "2026-10-13"),
    "CANCELLED",
  );
  assert.throws(() =>
    applyPrototypeCommand(ledger, {
      ...membershipOperation("resume"),
      key: "second-resume",
    }),
  );
  assert.throws(() =>
    applyPrototypeCommand(ledger, membershipOperation("use")),
  );
});
test("Time-based access checks do not consume visits or inflate usage statistics", () => {
  let ledger = applyPrototypeCommand(
    emptyLedger("a"),
    membershipAssignment({ kind: "membership", visits: null }),
  );
  ledger = applyPrototypeCommand(ledger, membershipOperation("verify"));
  assert.equal(ledger.memberships[0].remainingVisits, null);
  assert.equal(ledger.events.at(-1).type, "MEMBERSHIP_ACCESS_VERIFIED");
  assert.equal(membershipStatistics(ledger, "2026-10-13").used, 0);
  assert.throws(() =>
    applyPrototypeCommand(ledger, membershipOperation("use")),
  );
});
test("Membership operations require explicit frontend permissions and strict business/customer scope", () => {
  const ledger = applyPrototypeCommand(
    emptyLedger("a"),
    membershipAssignment(),
  );
  for (const action of [
    "assign",
    "use",
    "verify",
    "freeze",
    "resume",
    "cancel",
  ])
    assert.throws(
      () =>
        applyPrototypeCommand(
          ledger,
          membershipOperation(action, { permissions: [] }),
        ),
      /denied/,
    );
  assert.throws(
    () =>
      applyPrototypeCommand(ledger, {
        ...membershipOperation("use"),
        businessId: "b",
      }),
    /invalid/,
  );
  assert.throws(
    () =>
      applyPrototypeCommand(ledger, {
        ...membershipOperation("use"),
        customerId: "customer-b",
      }),
    /membership/,
  );
  const manager = membershipOperation("freeze", {
    permissions: ["membership.create"],
    reason: "Pause",
  });
  assert.equal(
    applyPrototypeCommand(ledger, manager).memberships[0].status,
    "PAUSED",
  );
  assert.throws(
    () =>
      applyPrototypeCommand(
        ledger,
        membershipOperation("use", { permissions: ["membership.create"] }),
      ),
    /denied/,
  );
});
test("Repository assignments reload in the same session and expiry is recorded exactly once", async () => {
  const contact = await moduleRepository("customers", true).save("a", {
    name: "Fictional Member",
    email: "",
    phone: "",
    notes: "",
  });
  const definition = await moduleRepository("memberships", true).save("a", {
    name: "Five visits",
    kind: "package",
    price: "20",
    currency: "EUR",
    visits: "5",
    interval: "monthly",
    description: "Preview",
  });
  const command = {
    ...membershipAssignment(),
    customerId: contact.id,
    membershipId: definition.id,
  };
  delete command.now;
  executePrototype(command);
  assert.equal(readPrototypeLedger("a").memberships[0].remainingVisits, 5);
  assert.equal(readPrototypeLedger("b").memberships.length, 0);
  const serialized = readPrototypeLedger("a");
  serialized.memberships[0].startsOn = "2020-01-01";
  serialized.memberships[0].validUntil = "2020-01-02";
  sessionStorage.setItem(
    "memberflow:prototype-journal:v1:a",
    JSON.stringify(serialized),
  );
  assert.equal(
    readPrototypeLedger("a").events.filter(
      (e) => e.type === "MEMBERSHIP_EXPIRED",
    ).length,
    1,
  );
  assert.equal(
    readPrototypeLedger("a").events.filter(
      (e) => e.type === "MEMBERSHIP_EXPIRED",
    ).length,
    1,
  );
});

test("Multiple assignments of one definition have independent balances and unique IDs", () => {
  let ledger = applyPrototypeCommand(emptyLedger("a"), membershipAssignment());
  ledger = applyPrototypeCommand(ledger, {
    ...membershipAssignment(),
    key: "assign-second",
    membershipOperation: {
      ...membershipAssignment().membershipOperation,
      assignmentId: "assignment-second",
      visits: 10,
    },
  });
  ledger = applyPrototypeCommand(ledger, membershipOperation("use"));
  assert.equal(ledger.memberships[0].remainingVisits, 4);
  assert.equal(ledger.memberships[1].remainingVisits, 10);
  assert.throws(
    () =>
      applyPrototypeCommand(ledger, {
        ...membershipAssignment(),
        key: "collision",
        customerId: "another",
      }),
    /invalid/,
  );
  assert.throws(
    () => applyPrototypeCommand(ledger, membershipOperation("unknown")),
    /invalid/,
  );
});
test("Selected local business remains current on routes without a business query", async () => {
  const {
    selectLocalBusiness,
    readSelectedBusiness,
  } = require("../../src/features/workspace/business-catalog.ts");
  const draft = (name) => ({
    firstName: "Preview",
    business: { name, type: "cafe", country: "LV", city: "Riga" },
    goals: ["memberships"],
    planName: null,
    selection: { planId: "starter", interval: "monthly" },
  });
  saveOnboardingPreview(draft("Coffee A"));
  const first = await getDashboardService("new").getOverview();
  saveOnboardingPreview(draft("Coffee B"));
  const second = await getDashboardService("new").getOverview();
  assert.notEqual(first.business.id, second.business.id);
  selectLocalBusiness(first.business.id);
  assert.equal(readSelectedBusiness(), first.business.id);
  assert.equal(
    (await getDashboardService("new").getOverview()).business.id,
    first.business.id,
  );
  selectLocalBusiness("missing");
  assert.equal(readSelectedBusiness(), first.business.id);
});

const customerRegistration = require("../../src/features/customer-registration/repository.ts");
const {
  defaultPolicy,
  missingFields,
} = require("../../src/features/customer-registration/model.ts");
async function registrationBusiness(
  id,
  fields = { name: true, email: true, phone: false },
) {
  const page = customerPageService(business(id), true);
  await page.get();
  await page.setStatus("ACTIVE");
  customerRegistration.saveRegistrationPolicy(id, { ...defaultPolicy, fields });
  return moduleRepository("loyalty", true).save(id, loyalty);
}
test("Customer registration uses one fictional identity and scoped participations/QR/progress", async () => {
  const a = await registrationBusiness("a"),
    b = await registrationBusiness("b", {
      name: true,
      email: true,
      phone: true,
    });
  const session =
    customerRegistration.beginCustomerPreview("alex@example.test");
  const first = await customerRegistration.joinCustomerPreview(
    "a",
    { name: "Alex Preview", email: "alex@example.test", phone: "" },
    a.id,
    true,
    { email: false, sms: false },
  );
  assert.deepEqual(
    missingFields(
      customerRegistration.readCustomerPreview().account,
      customerRegistration.readRegistrationPolicy("b"),
    ),
    ["phone"],
  );
  const second = await customerRegistration.joinCustomerPreview(
    "b",
    { name: "Alex Preview", email: "alex@example.test", phone: "+00000000000" },
    b.id,
    true,
    { email: false, sms: false },
  );
  assert.equal(
    customerRegistration.readCustomerPreview().account.id,
    session.account.id,
  );
  assert.equal(
    customerRegistration.readCustomerPreview().participations.length,
    2,
  );
  assert.notEqual(first.customerId, second.customerId);
  assert.notEqual(
    prototypeCode("a", first.customerId),
    prototypeCode("b", second.customerId),
  );
  assert.equal(readPrototypeLedger("a").progress[0].programmeId, a.id);
  assert.equal(readPrototypeLedger("b").progress[0].programmeId, b.id);
  assert.equal(
    customerRegistration.currentParticipation("a").customerId,
    first.customerId,
  );
  assert.equal(
    (
      await customerRegistration.joinCustomerPreview(
        "a",
        { name: "Alex Preview", email: "alex@example.test", phone: "" },
        a.id,
        true,
        { email: false, sms: false },
      )
    ).customerId,
    first.customerId,
  );
  assert.equal(
    readPrototypeLedger("a").events.filter((e) => e.type === "CUSTOMER_JOINED")
      .length,
    1,
  );
});
test("Registration does not transfer unrequested contacts or preselect marketing consent", async () => {
  const p = await registrationBusiness("a", {
    name: true,
    email: false,
    phone: false,
  });
  customerRegistration.beginCustomerPreview("alex@example.test");
  await assert.rejects(
    customerRegistration.joinCustomerPreview(
      "a",
      { name: "Alex", email: "alex@example.test", phone: "+00000000000" },
      p.id,
      false,
      { email: true, sms: true },
    ),
    /invalid/,
  );
  const link = await customerRegistration.joinCustomerPreview(
    "a",
    { name: "Alex", email: "alex@example.test", phone: "+00000000000" },
    p.id,
    true,
    { email: true, sms: true },
  );
  const detail = prototypeDetail("a", link.customerId);
  assert.equal(detail.customer.email, "");
  assert.equal(detail.customer.phone, "");
  assert.deepEqual(link.marketing, { email: false, sms: false });
  assert.equal(
    JSON.stringify([...localStorage.values.values()]).includes(
      "alex@example.test",
    ),
    false,
  );
});
test("Registration validates requested fields, archived programmes and inactive businesses", async () => {
  const p = await registrationBusiness("a", {
    name: true,
    email: true,
    phone: true,
  });
  customerRegistration.beginCustomerPreview("alex@example.test");
  for (const values of [
    { name: "", email: "alex@example.test", phone: "+00000000000" },
    { name: "Alex", email: "invalid", phone: "+00000000000" },
    { name: "Alex", email: "alex@example.test", phone: "bad" },
  ])
    await assert.rejects(
      customerRegistration.joinCustomerPreview("a", values, p.id, true, {
        email: false,
        sms: false,
      }),
    );
  await moduleRepository("loyalty", true).archive("a", p.id, true);
  await assert.rejects(
    customerRegistration.joinCustomerPreview(
      "a",
      { name: "Alex", email: "alex@example.test", phone: "+00000000000" },
      p.id,
      true,
      { email: false, sms: false },
    ),
    /programme/,
  );
  assert.equal(
    customerRegistration.readCustomerPreview().participations.length,
    0,
  );
  await customerPageService(business("a"), true).setStatus("DISABLED");
  await assert.rejects(
    customerRegistration.joinCustomerPreview(
      "a",
      { name: "Alex", email: "alex@example.test", phone: "+00000000000" },
      null,
      true,
      { email: false, sms: false },
    ),
    /invalid/,
  );
});
test("Customer session/policy safely reject corrupt data and API mode cannot use local identity", () => {
  sessionStorage.setItem("memberflow:customer-account-preview:v1", "{bad");
  assert.equal(customerRegistration.readCustomerPreview(), null);
  localStorage.setItem(
    "memberflow:customer-registration:v1:a",
    JSON.stringify({ version: 1, fields: { name: "yes" } }),
  );
  assert.deepEqual(
    customerRegistration.readRegistrationPolicy("a"),
    defaultPolicy,
  );
  assert.throws(
    () => customerRegistration.beginCustomerPreview("real@example.com"),
    /fictional/,
  );
  customerRegistration.beginCustomerPreview("alex@example.test");
  customerRegistration.endCustomerPreview();
  assert.equal(customerRegistration.readCustomerPreview(), null);
  process.env.NEXT_PUBLIC_DASHBOARD_MODE = "api";
  assert.throws(
    () => customerRegistration.beginCustomerPreview("alex@example.test"),
    /fictional/,
  );
  assert.equal(customerRegistration.readCustomerPreview(), null);
});
