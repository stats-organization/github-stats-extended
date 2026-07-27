import { expect, test } from "@playwright/test";

test("selecting 'None' progress style hides the rank circle", async ({
  page,
}) => {
  await page.goto("");

  // Stage 0 -> 2: go to customization
  await page.getByRole("button", { name: "Modify Parameters" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Modify Card Parameters",
  );

  const preview = page.locator("#svgWrapper");
  const rankCircle = preview.locator('[data-testid="rank-circle"]');

  // Default "Rank" progress style renders the rank circle.
  await expect(preview).toBeAttached();
  await expect(rankCircle).toHaveCount(1);

  await page.getByRole("combobox").selectOption({ label: "None" });

  await expect(rankCircle).toHaveCount(0);
});
