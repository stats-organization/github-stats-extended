import { expect, test } from "@playwright/test";

test("load initial page correctly", async ({ page }) => {
  await page.goto("");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/GitHub Stats Extended/);

  // Page title / header branding
  await expect(page.getByText("GitHub Stats Extended")).toBeVisible();

  // Logo exists
  await expect(page.locator('img[alt="logo"]')).toBeVisible();

  // Star on GitHub button
  const starButton = page.getByRole("button", { name: /star on/i });
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
