import { test, expect, type Page } from "@playwright/test";
import { onboard, section, configurePage } from "./helpers/workspace";
import { registrationContent } from "../src/content/customer-registration";
async function setup(
  page: Page,
  business: string,
  programme: string,
  phone = false,
) {
  await onboard(page, business);
  await configurePage(page);
  const settings = page.locator(".cr-settings");
  await settings.getByRole("checkbox", { name: "Name", exact: true }).check();
  await settings.getByRole("checkbox", { name: "Email", exact: true }).check();
  if (phone)
    await settings
      .getByRole("checkbox", { name: "Phone number", exact: true })
      .check();
  await settings
    .getByRole("checkbox", {
      name: "Offer optional email marketing consent",
      exact: true,
    })
    .check();
  await settings
    .getByRole("button", { name: "Save registration settings", exact: true })
    .click();
  await expect(settings.locator(".cr-registration-preview label")).toHaveCount(
    phone ? 3 : 2,
  );
  await section(page, "Loyalty");
  await page
    .getByRole("button", { name: "Create loyalty program", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "Name", exact: true })
    .fill(programme);
  await dialog.getByLabel("Reward threshold").fill("5");
  await dialog
    .getByRole("textbox", { name: "Reward", exact: true })
    .fill(`${programme} reward`);
  await dialog.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await section(page, "Customer Page");
  return (await page
    .getByRole("link", { name: "Open page", exact: true })
    .getAttribute("href"))!;
}
async function noOverflow(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
}
async function enter(page: Page, url: string) {
  await page.goto(url);
  await page
    .getByRole("button", { name: "Join / Continue", exact: true })
    .click();
  await expect(page).toHaveURL(/\/join\?/);
}
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});
test("one fictional customer joins A and B with only missing phone, separate CRM/QR and reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const a = await setup(page, "Your Coffee", "Coffee stamps");
  await enter(page, a);
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("alex@example.test");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "No code has been sent or verified",
  );
  await page
    .getByRole("textbox", { name: "Confirmation code", exact: true })
    .fill("111111");
  await page.getByRole("button", { name: "Verify code", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("not connected");
  await page.getByRole("button", { name: "Resend code", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("not connected");
  await page
    .getByRole("button", {
      name: "Continue with a fictional preview identity",
      exact: true,
    })
    .click();
  await page
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Alex Preview");
  await expect(
    page.getByRole("textbox", { name: "Email", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("checkbox", { name: /I would like email offers/ }),
  ).not.toBeChecked();
  await page
    .getByRole("checkbox", { name: /Share the requested details/ })
    .check();
  await page
    .getByRole("combobox", { name: "Loyalty programme", exact: true })
    .selectOption({ label: "Coffee stamps" });
  for (const width of [390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
    await page.screenshot({
      path: `test-results/customer-registration-${width}.png`,
      fullPage: true,
    });
  }
  await page
    .getByRole("button", { name: "Join in local preview", exact: true })
    .click();
  await expect(page.locator(".cp-greeting")).toContainText("Alex Preview");
  await expect(page.locator(".cr-personal-card img")).toBeVisible();
  await expect(page.locator(".cp-wallet-unavailable")).toHaveCount(2);
  const codeA = await page
    .getByRole("textbox", { name: "Your personal QR", exact: true })
    .inputValue();
  const bidA = new URL(a, "http://localhost:3000").searchParams.get("preview")!;
  const accountA = await page.evaluate(
    () =>
      JSON.parse(
        sessionStorage.getItem("memberflow:customer-account-preview:v1")!,
      ).account.id,
  );
  await page.goto(a);
  await expect(page.locator(".cp-greeting")).toContainText("Alex Preview");
  await expect(
    page.getByRole("button", { name: "Join / Continue", exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Your personal QR", exact: true }),
  ).toHaveValue(codeA);
  const b = await setup(page, "Your Studio", "Yoga stamps", true);
  await enter(page, b);
  await expect(
    page.getByRole("textbox", { name: "Name", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("textbox", { name: "Email", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Phone number", exact: true })
    .fill("+00000000000");
  await page
    .getByRole("checkbox", { name: /Share the requested details/ })
    .check();
  await page
    .getByRole("combobox", { name: "Loyalty programme", exact: true })
    .selectOption({ label: "Yoga stamps" });
  await page
    .getByRole("button", { name: "Join in local preview", exact: true })
    .click();
  const codeB = await page
    .getByRole("textbox", { name: "Your personal QR", exact: true })
    .inputValue();
  expect(codeB).not.toBe(codeA);
  const summary = await page.evaluate(() =>
    JSON.parse(
      sessionStorage.getItem("memberflow:customer-account-preview:v1")!,
    ),
  );
  expect(summary.account.id).toBe(accountA);
  expect(summary.participations).toHaveLength(2);
  expect(
    summary.participations.map(
      (p: { marketing: { email: boolean } }) => p.marketing.email,
    ),
  ).toEqual([false, false]);
  expect(
    await page.evaluate(() =>
      Object.values(localStorage).some((v) =>
        String(v).includes("alex@example.test"),
      ),
    ),
  ).toBe(false);
  await page.goto(`/dashboard/customers?lang=en&business=${bidA}`);
  await expect(page.locator(".mf-client-row")).toHaveCount(1);
  await expect(page.locator(".mf-client-row")).toContainText("Alex Preview");
  await page.goto(a);
  await expect(
    page.getByRole("textbox", { name: "Your personal QR", exact: true }),
  ).toHaveValue(codeA);
  await expect(page.locator(".cp-loyalty")).toContainText(
    "Coffee stamps reward",
  );
  for (const locale of ["en", "lv", "ru"] as const) {
    const url = new URL(a, "http://localhost:3000");
    url.searchParams.set("lang", locale);
    await page.goto(url.pathname + url.search);
    await expect(
      page.getByRole("textbox", {
        name: registrationContent[locale].qr,
        exact: true,
      }),
    ).toHaveValue(codeA);
  }
  expect(errors).toEqual([]);
});
test("registration cancellation, validation, corrupted session, duplicate join and returning card", async ({
  page,
}) => {
  const a = await setup(page, "Your Coffee", "Coffee stamps");
  await enter(page, a);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".cr-step h2")).toHaveText(
    "New or returning customer",
  );
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("alex@example.test");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("link", { name: "Return to the business", exact: true })
    .click();
  await expect(page).not.toHaveURL(/\/join/);
  await enter(page, a);
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("alex@example.test");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Continue with a fictional preview identity",
      exact: true,
    })
    .click();
  await page.reload();
  await expect(page.locator(".cr-step h2")).toHaveText("Complete your details");
  await page
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Alex Preview");
  await page
    .getByRole("combobox", { name: "Loyalty programme", exact: true })
    .selectOption({ label: "Coffee stamps" });
  await page
    .getByRole("button", { name: "Join in local preview", exact: true })
    .click();
  await expect(page).toHaveURL(/\/join/);
  await page
    .getByRole("checkbox", { name: /Share the requested details/ })
    .check();
  await page
    .getByRole("button", { name: "Join in local preview", exact: true })
    .dblclick();
  await expect(page.locator(".cr-personal-card")).toBeVisible();
  const register = new URL(a, "http://localhost:3000");
  register.pathname += "/join";
  await page.goto(register.pathname + register.search);
  await expect(
    page.getByRole("button", { name: "Open my card", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open my card", exact: true }).click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Join / Continue", exact: true }),
  ).toBeVisible();
  await page.evaluate(() =>
    sessionStorage.setItem("memberflow:customer-account-preview:v1", "{broken"),
  );
  await page.goto(register.pathname + register.search);
  await expect(page.locator(".cr-step h2")).toHaveText(
    "New or returning customer",
  );
});
