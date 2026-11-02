import { expect, test } from "@playwright/test";

test("selecting 'None' progress style hides the rank circle", async ({
  page,
}) => {
  await page.goto("");

  // Stage 0 -> 2: go to customization
  await page.getByRole("button", { name: "Modify Parameters" }).click();
  // Scoped to the page content: Astro's dev toolbar has headings of its own.
  await expect(
    page.locator("main").getByRole("heading", { level: 1 }),
  ).toContainText("Modify Card Parameters");

  const preview = page.locator("#svg-wrapper");
  const rankCircle = preview.locator('[data-testid="rank-circle"]');

  // Default "Rank" progress style renders the rank circle.
  await expect(preview).toBeAttached();
  await expect(rankCircle).toHaveCount(1);

  // Scoped: the site header has a theme combobox of its own.
  await page
    .locator("main")
    .getByRole("combobox")
    .selectOption({ label: "None" });

  await expect(rankCircle).toHaveCount(0);
});
