import { expect, type Page } from "@playwright/test";
import { dashboardContent } from "../../src/content/dashboard";

export async function onboard(page: Page, business = "Your Coffee") {
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

export async function section(page: Page, name: string) {
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

export async function configurePage(page: Page) {
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
