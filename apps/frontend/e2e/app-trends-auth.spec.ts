import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Puts the SPA into an authenticated state without contacting GitHub by
 * stubbing the OAuth code exchange and the follow-up user-access lookup:
 * `authenticate` returns a userId (which flips `isAuthenticated` to true), and
 * `user-access` returns metadata so AppTrends does not immediately log back out.
 * @param page - The Playwright page to install the route handlers on.
 */
async function mockAuthEndpoints(page: Page): Promise<void> {
  await page.route("**/api/authenticate**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: "octocat", needDowngrade: false }),
    }),
  );
  await page.route("**/api/user-access**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "test-token", privateAccess: "false" }),
    }),
  );
}

test.describe("AppTrends auth-driven stage transition", () => {
  test("auto-advances from Login to Select a Card once authenticated", async ({
    page,
  }) => {
    await mockAuthEndpoints(page);

    // Land on the app as GitHub does after the OAuth redirect (URL carries `code`).
    await page.goto("?code=test-oauth-code");

    // AppTrends starts unauthenticated on stage 0 ("Login"). When the code
    // exchange flips `isAuthenticated` false -> true, the render-phase
    // transition must advance the stepper to stage 1 ("Select a Card").
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Select a Card",
    );
  });

  test("keeps a manually selected earlier step instead of re-forcing it", async ({
    page,
  }) => {
    await mockAuthEndpoints(page);
    await page.goto("?code=test-oauth-code");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toContainText("Select a Card");

    // Going back to "Login" while still authenticated must stick: the transition
    // fires only on an auth *change*, so a later render must not snap the user
    // forward again. A bug that dropped the previous-value guard would bounce
    // the heading straight back to "Select a Card" here.
    await page.getByRole("button", { name: "Login" }).click();
    await expect(heading).toContainText("Login");
  });
});
