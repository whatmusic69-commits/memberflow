import { test, expect, type Page } from "@playwright/test";
import { dashboardContent } from "../src/content/dashboard";
import { moduleContent } from "../src/content/modules";
import { customerPageContent } from "../src/content/customer-page";
import { authContent } from "../src/content/auth";

const browserErrors = new WeakMap<Page, string[]>();

// Each test receives a fresh browser context; every business/contact is created through UI.
const programme = "Каждый восьмой кофе бесплатно";
const reward = "Free preview coffee";
const customer = "Preview Guest";

async function onboard(page: Page, business = "Your Coffee") {
  await page.goto("/en/onboarding");
  await page.getByLabel("First name", { exact: true }).fill("Preview Owner");
  await page.getByLabel("Email", { exact: true }).fill("owner@example.test");
  await page.getByLabel("Password", { exact: true }).fill("SampleOnly123!");
  await page.locator('.consent input[type="checkbox"]').first().check();
  await page.locator('.consent input[type="checkbox"]').last().check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Business name", { exact: true }).fill(business);
  await page.locator('select[name="country"]').selectOption("LV");
  await page.getByLabel("City", { exact: true }).fill("Riga");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByText("Loyalty & rewards", { exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Skip for now", exact: true }).click();
  await page.locator(".onboarding-plan").first().click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("link", { name: "Open MemberFlow", exact: true })
    .click();
  await expect(page.locator(".mf-business summary strong:visible")).toHaveText(
    business,
  );
  // Welcome is a dismissible UI overlay, not a bypass of the onboarding journey.
  const welcome = page.getByRole("dialog");
  if (await welcome.count()) {
    await welcome.getByRole("button").last().click();
    await expect(welcome).toHaveCount(0);
  }
  return new URL(page.url()).searchParams.get("business");
}

async function section(page: Page, name: string) {
  await expect(page.locator(".mf-top-actions")).toBeVisible();
  if (
    (page.viewportSize()?.width ?? 1440) <= 800 &&
    !(await page.locator(".mf-nav:visible").count())
  ) {
    await page.locator(".mf-mobile-menu").click();
  }
  await page
    .locator(".mf-nav:visible")
    .getByRole("link", { name, exact: true })
    .click();
  const key = Object.values(dashboardContent)
    .flatMap((c) => Object.entries(c.nav))
    .find(([, label]) => label === name)?.[0];
  if (!key) throw new Error(`Unknown navigation label: ${name}`);
  await expect(page).toHaveURL(
    new RegExp(`/dashboard${key === "overview" ? "\\?" : "/" + key + "\\?"}`),
  );
  await expect(page.locator(".mf-content h1").first()).toBeVisible();
}

async function createProgramme(page: Page) {
  await section(page, "Loyalty");
  await page
    .getByRole("button", { name: "Create loyalty program", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "Name", exact: true })
    .fill(programme);
  await dialog.getByLabel("Reward threshold").fill("8");
  await dialog
    .getByRole("textbox", { name: "Reward", exact: true })
    .fill(reward);
  await dialog.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("heading", { name: programme })).toBeVisible();
}

async function configurePage(page: Page) {
  await section(page, "Settings");
  await page
    .getByRole("textbox", { name: "Short description", exact: true })
    .fill("A fictional neighbourhood coffee shop.");
  await page
    .getByRole("textbox", { name: "Address", exact: true })
    .fill("12 Example Street");
  await page
    .getByRole("textbox", { name: "Opening hours", exact: true })
    .fill("Mon–Fri 08:00–18:00");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Saved in this browser tab.",
  );
  await section(page, "Customer Page");
  await expect(
    page.getByRole("textbox", { name: "Short description", exact: true }),
  ).toHaveValue("A fictional neighbourhood coffee shop.");
  await expect(
    page.getByRole("textbox", { name: "Address", exact: true }),
  ).toHaveValue("12 Example Street");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page
    .getByRole("button", { name: "Enable local preview", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Disable local preview" }),
  ).toBeVisible();
}

async function connectCustomer(page: Page) {
  await section(page, "Customer Page");
  await page.getByRole("link", { name: "Open page", exact: true }).click();
  await page
    .getByRole("button", { name: "Join / Continue", exact: true })
    .click();
  await expect(page).toHaveURL(/\/join\?/);
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("guest@example.test");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Continue with a fictional preview identity",
      exact: true,
    })
    .click();
  await page.getByRole("textbox", { name: "Name", exact: true }).fill(customer);
  await page
    .getByRole("checkbox", { name: /Share the requested details/ })
    .check();
  await page
    .getByRole("combobox", { name: "Loyalty programme", exact: true })
    .selectOption({ label: programme });
  await page
    .getByRole("button", { name: "Join in local preview", exact: true })
    .click();
  await expect(
    page.getByText(`Hello, ${customer}.`, { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Return to CRM (local prototype)" })
    .click();
  await page.locator(".mf-client-row").filter({ hasText: customer }).click();
  await expect(page.locator(".mf-prototype")).toBeVisible();
  return page
    .getByRole("textbox", { name: "Preview customer code", exact: true })
    .inputValue();
}

async function scannerAction(page: Page, name: RegExp, double = false) {
  await page.locator(".mf-staff-actions").getByRole("button", { name }).click();
  const dialog = page.getByRole("dialog");
  const confirm = dialog.getByRole("button", { name: "Confirm", exact: true });
  if (double) await confirm.dblclick();
  else await confirm.click();
  await expect(dialog).toHaveCount(0);
}

async function noOverflow(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => ({
    width: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.documentWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(
    overflow.width + 1,
  );
}

async function publicPageReady(page: Page) {
  await expect(page).toHaveURL(/\/b\//);
  await expect(page.locator(".cp-public-shell .cp-business h1")).toHaveText(
    "Your Coffee",
  );
  await expect(page.locator(".cp-public-shell .cp-loading")).toHaveCount(0);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (
      response.status() >= 500 &&
      response.url().startsWith("http://localhost:")
    )
      errors.push(`${response.status()} ${response.url()}`);
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test.afterEach(async ({ page }) => {
  expect(
    browserErrors.get(page) ?? [],
    "Uncaught browser errors / local HTTP 5xx",
  ).toEqual([]);
});

test("new business → Customer Page → CRM → existing Scanner → reward/history/Overview", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await onboard(page);
  await configurePage(page);
  await createProgramme(page);
  await section(page, "Customer Page");
  await page
    .getByRole("link", { name: "Business QR & A4 sign", exact: true })
    .click();
  await expect(page.locator(".mf-poster-qr img")).toBeVisible();
  await section(page, "Customer Page");
  const code = await connectCustomer(page);
  const profileUrl = page.url();
  await page.reload();
  await expect(page.locator(".mf-prototype-programme").first()).toContainText(
    "0 / 8",
  );
  await page.getByRole("link", { name: /Open existing staff scanner/ }).click();
  await page.getByText("Enter code manually", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Customer code", exact: true })
    .fill("invalid-preview-code");
  await page
    .getByRole("button", { name: "Find customer", exact: true })
    .click();
  await expect(page.locator(".mf-form-error[role=alert]")).toContainText(
    "Check the code",
  );
  await page
    .getByRole("textbox", { name: "Customer code", exact: true })
    .fill(code);
  await page
    .getByRole("button", { name: "Find customer", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: customer, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Redeem reward/ }),
  ).toHaveCount(0);
  await scannerAction(page, /^Add visit$/, true);
  await scannerAction(page, /^Add visit$/);
  await scannerAction(page, /^Add stamp/, true);
  await expect(page.locator(".mf-staff-tool").first()).toContainText("1 / 8");
  for (let i = 1; i < 8; i++) await scannerAction(page, /^Add stamp/);
  await expect(
    page.getByRole("button", { name: /^Redeem reward/ }),
  ).toBeVisible();
  await scannerAction(page, /^Redeem reward/, true);
  await expect(
    page.getByRole("button", { name: /^Redeem reward/ }),
  ).toHaveCount(0);
  await page.goto(profileUrl);
  await expect(page.locator(".mf-prototype-programme").first()).toContainText(
    "0 / 8",
  );
  await expect(page.locator(".mf-client-history")).toContainText(
    "redeemed a reward",
  );
  await expect(page.locator(".mf-client-history")).toContainText(
    "earned a reward",
  );
  await expect(
    page
      .locator(".mf-client-history")
      .getByText("received a loyalty stamp", { exact: true }),
  ).toHaveCount(8);
  await expect(
    page
      .locator(".mf-client-history")
      .getByText("completed a visit", { exact: true }),
  ).toHaveCount(2);
  await expect(
    page
      .locator(".mf-client-history")
      .getByText("redeemed a reward", { exact: true }),
  ).toHaveCount(1);
  await page
    .locator(".mf-prototype")
    .getByRole("link", { name: /^Customer Page/ })
    .click();
  await expect(
    page.getByText(`Hello, ${customer}.`, { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText(`Hello, ${customer}.`, { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Return to CRM (local prototype)" })
    .click();
  await section(page, "Overview");
  await expect(page.locator(".mf-setup-checklist")).toHaveCount(0);
  await expect(page.locator(".mf-content")).toContainText(customer);
  await section(page, "Customers");
  await expect(
    page
      .locator(".mf-customer-stats > div")
      .filter({ hasText: /^Visits/ })
      .locator("strong"),
  ).toHaveText("2");
  await expect(
    page
      .locator(".mf-customer-stats > div")
      .filter({ hasText: /^Returning customers/ })
      .locator("strong"),
  ).toHaveText("1");
  await expect(page.locator(".mf-customers-list")).toContainText(customer);
  await page.screenshot({
    path: "test-results/dashboard-connected-customers.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("Offer references update Campaign and Automation; dependencies prevent archival", async ({
  page,
}) => {
  await onboard(page);
  await section(page, "Offers");
  await page
    .getByRole("button", { name: "Create offer", exact: true })
    .first()
    .click();
  let dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Double stamps");
  await dialog
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("Two stamps on your next preview visit.");
  await dialog.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await section(page, "Campaigns");
  await page
    .getByRole("button", { name: "Create campaign", exact: true })
    .first()
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .locator('input[name="campaignName"]')
    .fill("Preview coffee campaign");
  await dialog
    .getByRole("combobox", { name: /^Linked offer/ })
    .selectOption({ label: "Double stamps" });
  await dialog.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await section(page, "Automations");
  await page
    .getByRole("button", { name: "Prepare return journey", exact: true })
    .first()
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Coffee return preview");
  await dialog
    .getByRole("combobox", { name: "Return offer", exact: true })
    .selectOption({ label: "Double stamps" });
  await dialog.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await section(page, "Offers");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Updated double stamps");
  await dialog
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("Updated linked preview offer.");
  await dialog.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", {
      name: "Archive: Updated double stamps",
      exact: true,
    })
    .click();
  await expect(page.locator(".mf-content")).toContainText(
    "Archive those drafts first",
  );
  await section(page, "Automations");
  await expect(page.locator(".mf-content")).toContainText(
    "Updated double stamps",
  );
  await section(page, "Campaigns");
  await page.getByRole("button", { name: "Edit draft", exact: true }).click();
  dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("textbox", { name: "Details", exact: true }),
  ).toHaveValue("Updated linked preview offer.");
  await dialog
    .getByRole("button", { name: "Cancel", exact: true })
    .last()
    .click();
  await expect(dialog).toHaveCount(0);
  const id = await selectBusiness(page, "Your Coffee");
  // Simulate a missing related record after UI-created drafts, not during setup.
  await page.evaluate(
    (businessId) =>
      sessionStorage.setItem(
        `memberflow:workspace:v1:${businessId}:offers`,
        "[]",
      ),
    id,
  );
  await page.reload();
  await page.getByRole("button", { name: "Edit draft", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(dialog.locator(".mf-form-error")).toContainText(
    "Choose an existing offer or remove the link",
  );
  await dialog
    .getByRole("button", { name: "Cancel", exact: true })
    .last()
    .click();
  await section(page, "Automations");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: "Save draft", exact: true }),
  ).toBeDisabled();
  await expect(dialog).toContainText("Create a return offer first");
  await dialog
    .getByRole("button", { name: "Cancel", exact: true })
    .last()
    .click();
});

async function selectBusiness(page: Page, name: string) {
  if (
    (page.viewportSize()?.width ?? 1440) <= 800 &&
    !(await page.locator(".mf-nav:visible").count())
  )
    await page.locator(".mf-mobile-menu").click();
  const menu = page.locator(".mf-business:visible");
  await menu.locator("summary").click();
  await menu.getByRole("button").filter({ hasText: name }).click();
  await expect(page.locator(".mf-business summary strong:visible")).toHaveText(
    name,
  );
  return new URL(page.url()).searchParams.get("business")!;
}

test("two UI-created businesses stay isolated across reload and EN/LV/RU", async ({
  page,
}) => {
  await onboard(page);
  await configurePage(page);
  await createProgramme(page);
  await connectCustomer(page);
  await section(page, "Campaigns");
  await page
    .getByRole("button", { name: "Create campaign", exact: true })
    .first()
    .click();
  const campaignDialog = page.getByRole("dialog");
  await campaignDialog
    .getByRole("textbox", { name: "Campaign name", exact: true })
    .fill("First business campaign");
  await campaignDialog
    .getByRole("button", { name: "Save draft", exact: true })
    .click();
  await expect(campaignDialog).toHaveCount(0);
  await onboard(page, "Second Preview Studio");
  await section(page, "Customers");
  await expect(page.locator(".mf-client-row")).toHaveCount(0);
  await section(page, "Loyalty");
  await expect(page.getByRole("heading", { name: programme })).toHaveCount(0);
  await section(page, "Campaigns");
  await expect(page.locator(".mf-content")).not.toContainText(
    "First business campaign",
  );
  await section(page, "Settings");
  await expect(
    page.getByRole("textbox", { name: "Business name", exact: true }),
  ).toHaveValue("Second Preview Studio");
  await expect(
    page.getByRole("textbox", { name: "Short description", exact: true }),
  ).toHaveValue("");
  const firstId = await selectBusiness(page, "Your Coffee");
  await expect(
    page.getByRole("textbox", { name: "Business name", exact: true }),
  ).toHaveValue("Your Coffee");
  await expect(
    page.getByRole("textbox", { name: "Short description", exact: true }),
  ).toHaveValue("A fictional neighbourhood coffee shop.");
  await page.reload();
  await expect(page.locator(".mf-business summary strong:visible")).toHaveText(
    "Your Coffee",
  );
  expect(new URL(page.url()).searchParams.get("business")).toBe(firstId);
  for (const locale of ["lv", "ru", "en"]) {
    await page.locator(".mf-top-actions .language-switcher summary").click();
    await page
      .locator(`.mf-top-actions .language-options button[lang="${locale}"]`)
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    expect(new URL(page.url()).searchParams.get("business")).toBe(firstId);
    await expect(
      page.locator(".mf-business summary strong:visible"),
    ).toHaveText("Your Coffee");
  }
  await section(page, "Customers");
  await expect(page.locator(".mf-client-row")).toHaveCount(1);
  await expect(page.locator(".mf-client-row")).toContainText(customer);
  await section(page, "Loyalty");
  await expect(page.getByRole("heading", { name: programme })).toBeVisible();
  await section(page, "Campaigns");
  await expect(
    page.getByRole("heading", { name: "First business campaign", exact: true }),
  ).toBeVisible();
});

test("Owner/Manager/Staff UI permissions and direct navigation guards", async ({
  page,
}) => {
  await onboard(page);
  await configurePage(page);
  await createProgramme(page);
  const code = await connectCustomer(page);
  const id = await selectBusiness(page, "Your Coffee");
  await page
    .getByRole("combobox", { name: "Preview role", exact: true })
    .selectOption("MANAGER");
  await expect(
    page
      .locator(".mf-nav:visible")
      .getByRole("link", { name: "Team", exact: true }),
  ).toHaveCount(0);
  await expect(
    page
      .locator(".mf-nav:visible")
      .getByRole("link", { name: "Settings", exact: true }),
  ).toHaveCount(0);
  await page.goto(`/dashboard/team?lang=en&business=${id}&previewRole=MANAGER`);
  await expect(
    page.getByRole("heading", {
      name: dashboardContent.en.accessDenied,
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Invite/ })).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Preview role", exact: true })
    .selectOption("STAFF");
  await expect(page).toHaveURL(/\/staff\?/);
  await expect(page.locator(".mf-staff-identity")).toContainText("Your Coffee");
  await page.getByText("Enter code manually", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Customer code", exact: true })
    .fill(code);
  await page
    .getByRole("button", { name: "Find customer", exact: true })
    .click();
  await scannerAction(page, /^Add stamp/);
  await expect(page.locator(".mf-staff-tool").first()).toContainText("1 / 8");
  await page.goto(
    `/dashboard/settings?lang=en&business=${id}&previewRole=STAFF`,
  );
  await expect(page).toHaveURL(/\/staff\?/);
  await expect(
    page.getByRole("button", { name: "Save changes", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Preview role", exact: true })
    .selectOption("OWNER");
  await expect(
    page
      .locator(".mf-nav:visible")
      .getByRole("link", { name: "Team", exact: true }),
  ).toBeVisible();
});

test("validation, cancellation, refresh and corrupted local records recover without a crash", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/en/onboarding");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Create your account.", exact: true }),
  ).toBeVisible();
  await page.getByLabel("First name", { exact: true }).fill("Preview Owner");
  await page.getByLabel("Email", { exact: true }).fill("invalid-email");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  expect(
    await page
      .getByLabel("Email", { exact: true })
      .evaluate((el: HTMLInputElement) => el.validity.typeMismatch),
  ).toBe(true);
  await page.reload();
  await expect(page.getByLabel("First name", { exact: true })).toHaveValue("");
  await onboard(page);
  const id = await selectBusiness(page, "Your Coffee");
  await section(page, "Loyalty");
  await page
    .getByRole("button", { name: "Create loyalty program", exact: true })
    .first()
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(dialog).toBeVisible();
  expect(
    await dialog
      .getByRole("textbox", { name: "Name", exact: true })
      .evaluate((el: HTMLInputElement) => el.validity.valueMissing),
  ).toBe(true);
  await dialog
    .getByRole("button", { name: "Cancel", exact: true })
    .last()
    .click();
  await expect(dialog).toHaveCount(0);
  await section(page, "Customers");
  await page
    .getByRole("button", { name: "Add customer", exact: true })
    .first()
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Invalid contact preview");
  await dialog
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("invalid-email");
  await dialog
    .getByRole("button", { name: "Save customer", exact: true })
    .click();
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("guest@example.test");
  await dialog
    .getByRole("button", { name: "Save customer", exact: true })
    .dblclick();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".mf-client-row")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".mf-client-row")).toHaveCount(1);
  // Only the failure injection touches storage; no test setup skips user-facing UI.
  await page.evaluate((businessId) => {
    sessionStorage.setItem(
      `memberflow:prototype-journal:v1:${businessId}`,
      "{broken",
    );
    localStorage.setItem(
      `memberflow:customer-page-preview:v1:${businessId}`,
      "{broken",
    );
    localStorage.setItem(
      `memberflow:business-profile:v2:${businessId}`,
      "{broken",
    );
  }, id);
  await section(page, "Customer Page");
  await expect(
    page.getByRole("textbox", { name: "Business name", exact: true }),
  ).toHaveValue("Your Coffee");
  await section(page, "Customers");
  await expect(page.locator(".mf-client-row")).toHaveCount(1);
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    ),
  ).not.toContain("SampleOnly123!");
  expect(errors).toEqual([]);
});

test("dashboard, builder, client page, scanner and dialogs fit 390/430/768/1024/1440", async ({
  page,
}) => {
  test.setTimeout(150_000);
  await onboard(page);
  await configurePage(page);
  await createProgramme(page);
  const code = await connectCustomer(page);
  const profileUrl = page.url();
  await section(page, "Customer Page");
  const publicUrl = await page
    .getByRole("link", { name: "Open page", exact: true })
    .getAttribute("href");
  const dashboardUrl = page.url();
  for (const width of [390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(dashboardUrl);
    await expect(
      page.getByRole("textbox", { name: "Business name", exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    await page.screenshot({
      path: `test-results/customer-builder-${width}.png`,
      fullPage: true,
    });
    await section(page, "Loyalty");
    await page
      .getByRole("button", { name: "Create loyalty program", exact: true })
      .first()
      .click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("textbox", { name: "Name", exact: true }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Save draft", exact: true }),
    ).toBeInViewport();
    const rect = await dialog.boundingBox();
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(width + 1);
    await dialog
      .getByRole("button", { name: "Cancel", exact: true })
      .last()
      .click();
    await expect(dialog).toHaveCount(0);
    await section(page, "Customers");
    await expect(page.locator(".mf-client-row")).toHaveCount(1);
    await noOverflow(page);
    await page.screenshot({
      path: `test-results/customers-${width}.png`,
      fullPage: true,
    });
    await section(page, "Overview");
    await noOverflow(page);
    await section(page, "Settings");
    await expect(
      page.getByRole("button", { name: "Save changes", exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    await page.goto(publicUrl! + "&guest=1");
    await publicPageReady(page);
    await expect(
      page.getByRole("button", { name: "Join / Continue", exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    await page.screenshot({
      path: `test-results/customer-page-${width}.png`,
      fullPage: true,
    });
    await page.goto(profileUrl);
    await page
      .getByRole("link", { name: /Open existing staff scanner/ })
      .click();
    await page.getByText("Enter code manually", { exact: true }).click();
    await page
      .getByRole("textbox", { name: "Customer code", exact: true })
      .fill(code);
    await page
      .getByRole("button", { name: "Find customer", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: customer, exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    await page.screenshot({
      path: `test-results/staff-${width}.png`,
      fullPage: true,
    });
  }
});

for (const locale of ["lv", "ru"] as const) {
  test(`${locale}: translated dashboard navigation, forms and customer preview at every target width`, async ({
    page,
  }) => {
    test.setTimeout(150_000);
    await onboard(page);
    await configurePage(page);
    await createProgramme(page);
    const id = await selectBusiness(page, "Your Coffee");
    const c = moduleContent[locale];
    const cp = customerPageContent[locale];
    for (const width of [390, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/dashboard/customers?lang=${locale}&business=${id}`);
      await expect(
        page.getByRole("heading", {
          name: dashboardContent[locale].nav.customers,
          exact: true,
        }),
      ).toBeVisible();
      await noOverflow(page);
      await section(page, dashboardContent[locale].nav.loyalty);
      await page
        .getByRole("button", { name: c.create.loyalty, exact: true })
        .first()
        .click();
      const dialog = page.getByRole("dialog");
      await expect(
        dialog.getByRole("textbox", { name: c.fields.name, exact: true }),
      ).toBeVisible();
      await dialog
        .getByRole("button", { name: c.save, exact: true })
        .scrollIntoViewIfNeeded();
      await expect(
        dialog.getByRole("button", { name: c.save, exact: true }),
      ).toBeInViewport();
      await dialog
        .getByRole("button", { name: c.cancel, exact: true })
        .last()
        .click();
      await expect(dialog).toHaveCount(0);
      await section(page, dashboardContent[locale].nav["customer-page"]);
      await expect(
        page.getByRole("textbox", { name: cp.name, exact: true }),
      ).toHaveValue("Your Coffee");
      await noOverflow(page);
      await page.getByRole("link", { name: cp.open, exact: true }).click();
      await publicPageReady(page);
      if (width === 390) {
        await page.reload();
        await publicPageReady(page);
      }
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(
        page.getByRole("button", { name: cp.join, exact: true }),
      ).toBeVisible();
      await noOverflow(page);
      await page.screenshot({
        path: `test-results/customer-page-${locale}-${width}.png`,
        fullPage: true,
      });
    }
  });
}

test("archived programmes stop accrual in the existing Scanner without losing recorded history", async ({
  page,
}) => {
  await onboard(page);
  await configurePage(page);
  await createProgramme(page);
  const code = await connectCustomer(page);
  const profileUrl = page.url();
  await section(page, "Loyalty");
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: `Archive: ${programme}`, exact: true })
    .click();
  await page.goto(profileUrl);
  await expect(page.locator(".mf-prototype-programme")).toHaveCount(0);
  await page.getByRole("link", { name: /Open existing staff scanner/ }).click();
  await page.getByRole("button", { name: "Open camera", exact: true }).click();
  await expect(page.locator(".mf-scanner [role=status]")).toContainText(
    /Enter the customer code manually|No camera|Camera access was denied/,
  );
  await page.getByText("Enter code manually", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Customer code", exact: true })
    .fill(code);
  await page
    .getByRole("button", { name: "Find customer", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: customer, exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /^Add stamp/ })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /^Redeem reward/ }),
  ).toHaveCount(0);
  await scannerAction(page, /^Add visit$/);
  await page.goto(profileUrl);
  await expect(page.locator(".mf-client-history")).toContainText(
    "completed a visit",
  );
});

test("login and recovery validate input and report the unavailable backend honestly", async ({
  page,
}) => {
  const authRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/v1/auth/"))
      authRequests.push(request.url());
  });
  await page.goto("/login?lang=en");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByLabel("Email", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByLabel("Email", { exact: true }).fill("invalid-email");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(
    page.getByText("Enter a valid email address.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill("owner@example.test");
  await page.getByLabel("Password", { exact: true }).fill("SampleOnly123!");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page
    .getByRole("button", { name: "Hide password", exact: true })
    .click();
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.locator(".auth-error")).toHaveText(
    authContent.en.unavailable,
  );
  await page
    .getByRole("link", { name: "Forgot password?", exact: true })
    .click();
  await expect(page).toHaveURL(/\/forgot-password\?lang=en/);
  await expect(
    page.getByRole("heading", { name: "Forgot your password?", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill("owner@example.test");
  await page
    .getByRole("button", { name: "Send reset link", exact: true })
    .click();
  await expect(page.locator(".auth-error")).toHaveText(
    authContent.en.unavailable,
  );
  await expect(page.locator(".auth-reset-sent")).toHaveCount(0);
  expect(authRequests).toEqual([]);
});

test("Owner can open every existing Dashboard section without runtime errors", async ({
  page,
}) => {
  await onboard(page);
  for (const name of [
    "Campaigns",
    "Offers",
    "Customers",
    "Customer Page",
    "Loyalty",
    "Memberships",
    "Automations",
    "Team",
    "Integrations",
    "Settings",
    "Overview",
  ]) {
    await section(page, name);
    await expect(page.locator(".mf-content h1").first()).toBeVisible();
    await noOverflow(page);
  }
});
