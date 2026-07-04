import { expect, test } from "@playwright/test";

test("load initial page correctly", async ({ page }) => {
  await page.goto("");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/GitHub Stats Extended/);

  // Page title / header branding
  await expect(page.getByText("GitHub Stats Extended")).toBeVisible();

  // Logo exists
  await expect(page.locator('img[alt="logo"]')).toBeVisible();

  // Star on GitHub link
  const starButton = page.getByRole("link", { name: /star on/i });
  await expect(starButton).toBeVisible();

  const githubLink = page.locator(
    'a[href*="github.com/stats-organization/github-stats-extended"]',
  );
  await expect(githubLink).toHaveAttribute("target", "_blank");

  // Login buttons
  const publicAccessBtn = page.getByRole("button", {
    name: /github public access/i,
  });
  await expect(publicAccessBtn).toBeVisible();
  await expect(publicAccessBtn).toBeEnabled();

  const privateAccessBtn = page.getByRole("button", {
    name: /github private access/i,
  });
  await expect(privateAccessBtn).toBeVisible();
  await expect(privateAccessBtn).toBeEnabled();

  const guestBtn = page.getByRole("button", { name: /continue as guest/i });
  await expect(guestBtn).toBeVisible();
  await expect(guestBtn).toBeEnabled();
});

test("theme picker switches and persists the theme", async ({ page }) => {
  await page.goto("");

  const html = page.locator("html");
  const trigger = page.getByRole("button", { name: /choose theme/i });
  const options = page.getByRole("menuitemradio");

  // The menu is closed initially.
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(options).toHaveCount(0);

  // Opening it reveals the options (portaled to body, above the stepper).
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  // Read the themes off the options instead of hardcoding their names.
  const firstTheme = await options.first().getAttribute("data-theme-value");
  const lastTheme = await options.last().getAttribute("data-theme-value");

  // Selecting an option applies the theme, persists it, and closes the menu.
  await options.last().click();
  await expect(html).toHaveAttribute("data-theme", lastTheme ?? "");
  await expect(options).toHaveCount(0);
  await expect(
    page.evaluate(() => localStorage.getItem("theme")),
  ).resolves.toBe(lastTheme);

  // The choice survives a reload and is marked as selected on reopen.
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", lastTheme ?? "");
  await trigger.click();
  await expect(options.last()).toHaveAttribute("aria-checked", "true");

  // Switching to another option works too.
  await options.first().click();
  await expect(html).toHaveAttribute("data-theme", firstTheme ?? "");
});

test("navigates between steps", async ({ page }) => {
  await page.goto("");

  // We are at stage 1
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Login");

  // Go to stage 2
  await page.getByRole("button", { name: "Select card" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Select a Card",
  );

  // Go to stage 3
  await page.getByRole("button", { name: "Modify parameters" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Modify Card Parameters",
  );

  // Go to stage 4
  await page.getByRole("button", { name: "Select theme" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Choose a Theme",
  );

  // Go to stage 5
  await page.getByRole("button", { name: "Display card" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Display your Card",
  );
});
