import { expect, test } from "@playwright/test";

// Nothing links to a redirect, so the build's link validator cannot catch a broken one.
const redirects = [
  {
    from: "docs/advanced_documentation",
    to: "/frontend/docs/customization/common-options/",
    heading: "Common Options",
  },
  {
    from: "docs/cards",
    to: "/frontend/docs/cards/stats/",
    heading: "Stats Card",
  },
  {
    from: "docs/customization",
    to: "/frontend/docs/customization/common-options/",
    heading: "Common Options",
  },
];

for (const { from, to, heading } of redirects) {
  test(`/${from} redirects to ${to}`, async ({ page }) => {
    for (const url of [from, `${from}/`]) {
      await page.goto(url);

      await expect(page).toHaveURL(to);
      // Scoped to the page content: Astro's dev toolbar has headings of its own.
      await expect(
        page.locator("main").getByRole("heading", { level: 1 }),
      ).toHaveText(heading);
    }
  });
}
