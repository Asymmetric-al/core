import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

/**
 * Instant Navigation guards (Next.js 16.3 Cache Components + Partial
 * Prefetching) for the donor public site, per `instant-nav.rig.md`.
 *
 * An `instant()` verdict is only trustworthy against a production build with
 * the testing API exposed (`EXPOSE_TESTING_API=1`); `next dev` neither
 * prefetches nor locks reliably. The suite therefore self-skips unless the
 * rig is running (`INSTANT_NAV_RIG=1`) so dev-server CI jobs never record a
 * vacuous pass.
 */
const rigActive = process.env.INSTANT_NAV_RIG === "1";

const NAV_TARGETS = [
  {
    link: "Deployments",
    path: "/workers",
    shellTestId: "workers-route-shell",
  },
  { link: "Mission", path: "/about", shellTestId: "about-route-shell" },
  {
    link: "Transparency",
    path: "/financials",
    shellTestId: "financials-route-shell",
  },
  {
    link: "Ways to Give",
    path: "/ways-to-give",
    shellTestId: "ways-to-give-route-shell",
  },
] as const;

test.describe("Instant navigation (donor public site)", () => {
  test.skip(
    !rigActive,
    "Requires the production instant-nav rig (see instant-nav.rig.md)",
  );

  for (const target of NAV_TARGETS) {
    test(`navbar navigation to ${target.path} commits the route shell under instant()`, async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("#__next_error__")).toHaveCount(0);

      const mobileMenuTrigger = page.getByRole("button", { name: "Open menu" });
      const trigger = page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: target.link })
        .filter({ visible: true })
        .first();

      await Promise.race([
        trigger.waitFor({ state: "visible" }),
        mobileMenuTrigger.waitFor({ state: "visible" }),
      ]);

      if (await mobileMenuTrigger.isVisible()) {
        await mobileMenuTrigger.click();
      }
      await expect(trigger).toBeVisible();

      await instant(page, async () => {
        await trigger.click();
        await expect(page.getByTestId(target.shellTestId)).toBeVisible();
      });
    });
  }

  /**
   * The home page's CMS updates read resolves the tenant from `headers()`, so
   * it can never join the static shell. Guards that the hero (the LCP) is not
   * dragged out of the shell with it — the regression this covers is a
   * top-level `await` creeping back into `(public)/page.tsx`.
   */
  test("navbar logo navigation commits the home hero under instant()", async ({
    page,
  }) => {
    await page.goto("/about");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#__next_error__")).toHaveCount(0);

    const logo = page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link")
      .filter({ visible: true })
      .first();
    await expect(logo).toBeVisible();

    await instant(page, async () => {
      await logo.click();
      await expect(page.locator("#hero-heading")).toBeVisible();
    });
  });

  /**
   * Self-validating guard (worker profile has genuinely deferred content):
   * under the lock the profile shell must commit while the request-time
   * giving widget stays gated, then stream in after release. This also proves
   * the instant() lock engages on this rig — if the testing API were missing,
   * the "Give $" button would already be present under the lock.
   */
  test("worker card navigation commits the profile shell and defers giving data under instant()", async ({
    page,
  }) => {
    await page.goto("/workers");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#__next_error__")).toHaveCount(0);

    const card = page
      .locator('a[aria-label="View The Miller Family\'s profile"]')
      .first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();

    await instant(page, async () => {
      await card.click();
      await expect(
        page.getByTestId("worker-profile-route-shell"),
      ).toBeVisible();
      // Params-dependent: the shared App Shell cannot carry this. It commits
      // under the lock because the card link is `prefetch={true}`
      // (workers-client.tsx) — a full prefetch, which makes the testing lock
      // skip its shell-only restriction — and `generateStaticParams` in the
      // route prerenders each worker page for that prefetch to pull.
      // Regresses if the `prefetch` prop is dropped, NOT if
      // `prefetch = 'allow-runtime'` is added or removed; the route
      // deliberately omits it (see the note above WorkerProfilePage).
      await expect(
        page.getByRole("heading", { level: 1, name: /miller/i }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: /^give \$/i })).toHaveCount(
        0,
      );
    });

    await expect(page.getByRole("link", { name: /^give \$/i })).toBeVisible();
  });

  test("initial load of /workers serves the route shell under instant()", async ({
    baseURL,
    page,
  }) => {
    const url = new URL("/workers", baseURL).toString();

    await instant(
      page,
      async () => {
        await page.goto(url);
        await expect(page.getByTestId("workers-route-shell")).toBeVisible();
      },
      { baseURL: new URL(url).origin },
    );
  });
});
