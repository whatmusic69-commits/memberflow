import { test, expect, type Page } from "@playwright/test";
import { onboard, section, configurePage } from "./helpers/workspace";
import { membershipContent } from "../src/content/memberships";

async function createMembership(
  page: Page,
  name = "Yoga — 5 Sessions",
  kind = "package",
) {
  await section(page, "Memberships");
  await page
    .getByRole("button", { name: "Create membership", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "Name", exact: true }).fill(name);
  await dialog
    .getByRole("combobox", { name: "Type", exact: true })
    .selectOption(kind);
  await dialog.getByLabel("Price", { exact: true }).fill("45");
  if (kind === "package")
    await dialog.getByLabel("Included visits", { exact: true }).fill("5");
  else
    await expect(
      dialog.getByLabel("Included visits", { exact: true }),
    ).toHaveCount(0);
  await dialog
    .getByLabel("Description", { exact: true })
    .fill("Fictional studio preview; no payment.");
  await dialog.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
}
async function addCustomer(page: Page) {
  await section(page, "Customers");
  await page
    .getByRole("button", { name: "Add customer", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Fictional Yoga Guest");
  await dialog
    .getByRole("button", { name: "Save customer", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await page
    .locator(".mf-client-row")
    .filter({ hasText: "Fictional Yoga Guest" })
    .click();
  await expect(page.locator(".mf-content h1")).toHaveText(
    "Fictional Yoga Guest",
  );
}
async function assign(page: Page, name: string) {
  await page
    .getByRole("button", { name: "Assign membership", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Choose a membership", exact: true })
    .selectOption({ label: name });
  await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.locator(".mf-membership-card").filter({ hasText: name }),
  ).toBeVisible();
}
async function resolve(page: Page, scannerUrl: string, code: string) {
  await page.goto(scannerUrl);
  await page.getByText("Enter code manually", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Customer code", exact: true })
    .fill(code);
  await page
    .getByRole("button", { name: "Find customer", exact: true })
    .click();
  await expect(page.locator(".mf-staff-customer h1")).toHaveText(
    "Fictional Yoga Guest",
  );
}
async function consumeVisit(page: Page, double = false) {
  await page
    .locator(".mf-staff-actions")
    .getByRole("button", { name: /Use 1 visit/ })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Before");
  if (double)
    await dialog
      .getByRole("button", { name: "Confirm", exact: true })
      .dblclick();
  else
    await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(dialog).toHaveCount(0);
}
async function overflow(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual((page.viewportSize()?.width ?? 1440) + 1);
}
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("membership lifecycle connects CRM, Customer Page, existing Scanner, journal and scoped Overview", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await onboard(page);
  await configurePage(page);
  await createMembership(page);
  await addCustomer(page);
  const profileUrl = page.url();
  const code = await page
    .getByRole("textbox", { name: "Preview customer code", exact: true })
    .inputValue();
  const publicUrl = await page
    .getByRole("link", { name: "Customer Page →", exact: true })
    .getAttribute("href");
  const scannerUrl = await page
    .getByRole("link", { name: /Open existing staff scanner/ })
    .getAttribute("href");
  expect(publicUrl).toBeTruthy();
  expect(scannerUrl).toBeTruthy();
  await assign(page, "Yoga — 5 Sessions");
  await page.reload();
  await expect(page.locator(".mf-membership-card")).toContainText("5 of 5");
  const firstBusiness = new URL(
    publicUrl!,
    "http://localhost:3000",
  ).searchParams.get("preview")!;
  for (const width of [390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await overflow(page);
    await page
      .getByRole("button", { name: "Assign membership", exact: true })
      .click();
    await overflow(page);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Cancel", exact: true })
      .last()
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await resolve(page, scannerUrl!, code);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await consumeVisit(page, true);
  await expect(page.locator(".mf-membership-card")).toContainText("4 of 5");
  await page.goto(profileUrl);
  await expect(page.locator(".mf-membership-card")).toContainText("4 of 5");
  await page.goto(publicUrl!);
  await expect(page.locator(".mf-membership-card")).toContainText("4 of 5");
  for (const width of [390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await overflow(page);
  }
  const guest = new URL(publicUrl!, "http://localhost:3000");
  guest.searchParams.delete("prototypeCustomer");
  guest.searchParams.set("guest", "1");
  await page.goto(guest.pathname + guest.search);
  await expect(page.locator(".mf-membership-card")).toHaveCount(0);
  await page.goto(profileUrl);
  await page
    .getByRole("button", { name: "Freeze membership", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Reason for freezing", { exact: true })
    .fill("Holiday");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirm", exact: true })
    .click();
  await expect(page.locator(".mf-membership-card")).toContainText("Frozen");
  await resolve(page, scannerUrl!, code);
  await expect(page.getByRole("button", { name: /Use 1 visit/ })).toHaveCount(
    0,
  );
  await page.goto(profileUrl);
  await page
    .getByRole("button", { name: "Resume membership", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "end date stays unchanged",
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirm", exact: true })
    .click();
  await resolve(page, scannerUrl!, code);
  for (const remaining of [3, 2, 1, 0]) {
    await consumeVisit(page);
    await expect(page.locator(".mf-membership-card")).toContainText(
      `${remaining} of 5`,
    );
  }
  await expect(page.getByRole("button", { name: /Use 1 visit/ })).toHaveCount(
    0,
  );
  await expect(page.locator(".mf-membership-card")).toContainText("Exhausted");
  for (const width of [390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await overflow(page);
  }
  await page.goto(profileUrl);
  await page
    .getByRole("button", { name: "Cancel membership", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirm", exact: true })
    .click();
  await expect(page.locator(".mf-membership-card")).toContainText("Cancelled");
  await expect(page.locator(".mf-client-history")).toContainText(
    "cancelled a membership",
  );
  await page.goto(publicUrl!);
  await expect(page.locator(".mf-membership-card")).toContainText("0 of 5");
  await expect(page.locator(".mf-membership-card")).toContainText("Cancelled");
  await page.goto(profileUrl);
  await section(page, "Overview");
  await expect(page.locator(".mf-membership-statistics")).toContainText(
    "Visits used",
  );
  await expect(
    page.locator(".mf-membership-statistics div").nth(1).locator("strong"),
  ).toHaveText("5");
  await onboard(page, "Second Fictional Studio");
  await section(page, "Memberships");
  await expect(
    page.getByRole("heading", { name: "Yoga — 5 Sessions", exact: true }),
  ).toHaveCount(0);
  await section(page, "Customers");
  await expect(page.locator(".mf-client-row")).toHaveCount(0);
  await page.locator(".mf-business:visible summary").click();
  await page
    .locator(".mf-business:visible")
    .getByRole("button")
    .filter({ hasText: "Your Coffee" })
    .click();
  await expect(page.locator(".mf-business summary strong:visible")).toHaveText(
    "Your Coffee",
  );
  await page.reload();
  await expect(page.locator(".mf-business summary strong:visible")).toHaveText(
    "Your Coffee",
  );
  await expect(page).toHaveURL(new RegExp(firstBusiness));
  await page.goto(profileUrl);
  await expect(page.locator(".mf-membership-card")).toContainText("Cancelled");
  expect(errors).toEqual([]);
});

test("time-based membership checks access without visits and EN/LV/RU retain the same assignment", async ({
  page,
}) => {
  await onboard(page);
  await configurePage(page);
  await createMembership(page, "Monthly Unlimited", "membership");
  await addCustomer(page);
  await assign(page, "Monthly Unlimited");
  const profileUrl = page.url();
  const code = await page
    .getByRole("textbox", { name: "Preview customer code", exact: true })
    .inputValue();
  const publicUrl = (await page
    .getByRole("link", { name: "Customer Page →", exact: true })
    .getAttribute("href"))!;
  const scannerUrl = (await page
    .getByRole("link", { name: /Open existing staff scanner/ })
    .getAttribute("href"))!;
  await expect(page.locator(".mf-membership-card")).toContainText(
    "Unlimited visits",
  );
  await resolve(page, scannerUrl, code);
  await page.getByRole("button", { name: /Verify access/ }).click();
  await expect(page.getByRole("dialog")).not.toContainText("Remaining after");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirm", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".mf-membership-card")).toContainText(
    "Unlimited visits",
  );
  await page.goto(profileUrl);
  await expect(page.locator(".mf-client-history")).toContainText(
    "verified membership access",
  );
  for (const locale of ["en", "lv", "ru"] as const) {
    const url = new URL(publicUrl, "http://localhost:3000");
    url.searchParams.set("lang", locale);
    await page.goto(url.pathname + url.search);
    await expect(page.locator(".mf-membership-card")).toContainText(
      membershipContent[locale].unlimited,
    );
    await page.reload();
    await expect(page.locator(".mf-membership-card")).toContainText(
      membershipContent[locale].states.ACTIVE,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await overflow(page);
  }
});
