import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { content } from "../src/content";

const widths = [1920, 1440, 1280, 1024, 768, 430, 390];
for (const locale of ["en", "lv", "ru"] as const) {
  test(`${locale}: four product stories, responsive layout and accessible content`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/${locale}`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toContainText(content[locale].hero[0]);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator(".story-chapter")).toHaveCount(4);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect(
        await page.evaluate(() => {
          const hero = document.querySelector(".hero")!;
          const why = document.querySelector("#why")!;
          const product = document.querySelector("#product")!;
          return (
            Boolean(
              hero.compareDocumentPosition(why) &
              Node.DOCUMENT_POSITION_FOLLOWING,
            ) &&
            Boolean(
              why.compareDocumentPosition(product) &
              Node.DOCUMENT_POSITION_FOLLOWING,
            )
          );
        }),
      ).toBe(true);
      await expect(page.locator(".return-wallet-mini")).toBeVisible();
      await expect(page.locator(".product-phone").first()).toBeVisible();
      await expect(page.locator(".staff-device")).toBeVisible();
      const missingAnchors = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll<HTMLAnchorElement>("a[href]"),
        ).flatMap((link) => {
          const url = new URL(link.href);
          return url.pathname === location.pathname &&
            url.hash &&
            !document.getElementById(decodeURIComponent(url.hash.slice(1)))
            ? [link.getAttribute("href")]
            : [];
        }),
      );
      expect(missingAnchors).toEqual([]);
      const text = await page.locator("body").innerText();
      expect(text).not.toMatch(
        /coming soon|under development|demo only|preview version|planned automation|integrations are not live|в разработке|ещё не работают|изстр|izstrādes stadijā|plānota automatizācija/i,
      );
      await page.screenshot({
        path: `test-results/home-${locale}-${width}.png`,
        fullPage: true,
      });
    }
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test(`${locale}: Customer Page states, FAQ and Pricing navigation`, async ({
    page,
  }) => {
    const c = content[locale];
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/${locale}`);
    await page
      .getByRole("tab", {
        name: c.experience.customerPage.personal,
        exact: true,
      })
      .click();
    await expect(page.getByRole("tabpanel")).toContainText(
      c.experience.customerPage.noApp,
    );
    await expect(
      page.getByRole("tabpanel").locator(".cp-stamps"),
    ).toBeVisible();
    await page
      .getByRole("tab", {
        name: c.experience.customerPage.personal,
        exact: true,
      })
      .press("ArrowLeft");
    await expect(page.getByRole("tabpanel")).toContainText(
      c.experience.customerPage.connect,
    );
    await page.locator("#faq summary").first().click();
    await expect(page.locator("#faq details").first()).toHaveAttribute(
      "open",
      "",
    );
    await page.locator(".hero-ctas .button").click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/onboarding$`));
    await page.goto(`/${locale}`);
    await page
      .locator(".desktop-nav")
      .getByRole("link", { name: c.nav[2], exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/pricing$`));
    await expect(page.locator("h1")).toContainText(c.experience.pricing.title);
    await expect(page.locator(".public-plan")).toHaveCount(3);
    for (const width of [1440, 1024, 768, 430, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `test-results/pricing-${locale}-${width}.png`,
        fullPage: true,
      });
    }
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
}

test("mobile navigation and language preserve useful destinations", async ({
  page,
}) => {
  await page.goto("/en");
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: content.en.menu, exact: true })
    .click();
  await expect(page.locator("#mobile-navigation")).toBeVisible();
  await page
    .locator("#mobile-navigation")
    .getByRole("link", { name: content.en.nav[0], exact: true })
    .click();
  await expect(page.locator("#mobile-navigation")).toHaveCount(0);
  await expect(page).toHaveURL(/#product$/);
  await page.locator(".language-switcher summary").click();
  await page.locator('.language-options a[lang="lv"]').click();
  await expect(page).toHaveURL(/\/lv$/);
  await expect(page.locator("h1")).toContainText(content.lv.hero[0]);
  await page.locator(".language-switcher summary").click();
  await page.locator('.language-options a[lang="ru"]').click();
  await expect(page).toHaveURL(/\/ru$/);
  await expect(page.locator("h1")).toContainText(content.ru.hero[0]);
});
