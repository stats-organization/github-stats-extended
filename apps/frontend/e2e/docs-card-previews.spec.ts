import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

/*
 * `rehypeCardImages` assembles the previews at build time,
 * so the markdown names neither the themes nor the classes asserted on here.
 */
const cardImage = (page: Page, alt: string, variant: "light" | "dark") =>
  page.locator(`main img[alt="${alt}"].card-preview-${variant}`);

test("a preview that names no theme renders one image per site theme", async ({
  page,
}) => {
  await page.goto("docs/");

  await expect(cardImage(page, "Top Langs", "light")).toHaveAttribute(
    "src",
    "/api/top-langs?username=anuraghazra&langs_count=4&theme=light_github",
  );
  await expect(cardImage(page, "Top Langs", "dark")).toHaveAttribute(
    "src",
    "/api/top-langs?username=anuraghazra&langs_count=4&theme=dark_github",
  );
});

test("the pin and gist previews use the repocard themes", async ({ page }) => {
  await page.goto("docs/");

  for (const alt of ["Readme Card", "Gist Card"]) {
    await expect(cardImage(page, alt, "light")).toHaveAttribute(
      "src",
      /theme=light_github_repocard$/,
    );
    await expect(cardImage(page, alt, "dark")).toHaveAttribute(
      "src",
      /theme=dark_github_repocard$/,
    );
  }
});

test("a preview links to itself, unless the markdown links it elsewhere", async ({
  page,
}) => {
  await page.goto("docs/");

  // Opening a preview shows its query string, so each copy links to its own theme.
  await expect(
    page.locator('main a.card-preview-light:has(img[alt="Top Langs"])'),
  ).toHaveAttribute(
    "href",
    "/api/top-langs?username=anuraghazra&langs_count=4&theme=light_github",
  );

  // The repo card already points at the repo it describes, which is more useful.
  await expect(
    page.locator('main a:has(img[alt="Readme Card"])'),
  ).toHaveAttribute(
    "href",
    "https://github.com/anuraghazra/github-readme-stats",
  );
});

test("a preview that names a theme stays a single image", async ({ page }) => {
  await page.goto("docs/customization/theming/");

  await expect(page.locator('main img[src*="theme=transparent"]')).toHaveCount(
    1,
  );
});

test("every sample on the themes page is deferred and links to itself", async ({
  page,
}) => {
  await page.goto("docs/customization/themes/");

  const samples = page.locator('main img[src^="/api"]');
  await expect(samples).not.toHaveCount(0);
  await expect(
    page.locator('main a[href^="/api"] > img[src^="/api"]'),
  ).toHaveCount(await samples.count());
  await expect(
    page.locator('main img[src^="/api"]:not([loading="lazy"])'),
  ).toHaveCount(0);
});

test("cards laid out as HTML are deferred, not split", async ({ page }) => {
  await page.goto("docs/customization/aligning-cards/");

  // The rows are hand-written HTML, so only the plugin's raw branch reaches them.
  await expect(
    page.locator('main .card-row img:not([loading="lazy"])'),
  ).toHaveCount(0);

  // Each already names a theme, so the pairs stay as the markdown wrote them.
  await expect(page.locator('main .card-row img[src^="/api"]')).toHaveCount(8);
  await expect(
    page.locator("main .card-row img.card-preview-light"),
  ).toHaveCount(4);
  await expect(
    page.locator("main .card-row img.card-preview-dark"),
  ).toHaveCount(4);
});

// Starlight server-renders its theme onto `<html>`, which `prefers-color-scheme` cannot see.
test.describe("in a browser set to dark", () => {
  test.use({ colorScheme: "dark" });

  test("the visible preview follows the site theme, not the browser", async ({
    page,
  }) => {
    const requested: Array<string> = [];
    page.on("request", (request) => requested.push(request.url()));

    await page.goto("docs/");
    await expect(cardImage(page, "Top Langs", "dark")).toBeVisible();
    await expect(cardImage(page, "Top Langs", "light")).toBeHidden();

    /*
     * A hidden copy has no layout box, so lazy loading never requests it.
     * The pin and gist pair is the fair comparison:
     * both sit below the fold, where the dev server's late CSS cannot briefly reveal one.
     */
    await expect
      .poll(() => requested.some((url) => url.includes("dark_github_repocard")))
      .toBe(true);
    expect(
      requested.filter((url) => url.includes("light_github_repocard")),
    ).toEqual([]);

    const themeSelect = page.locator("header").getByRole("combobox");
    await themeSelect.selectOption({ label: "Light" });

    await expect(cardImage(page, "Top Langs", "light")).toBeVisible();
    await expect(cardImage(page, "Top Langs", "dark")).toBeHidden();
  });
});
