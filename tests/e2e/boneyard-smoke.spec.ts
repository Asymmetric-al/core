import { expect, test } from "@playwright/test";

type BoneyardRouteExpectation = {
  path: string;
  skeletonName: string;
  /** Prefer role=heading when the page has a stable title */
  heading?: string;
  /** Fallback visible copy when the hero title is dynamic (e.g. time-based greeting) */
  visibleText?: string;
};

/**
 * Resolve which capture surface we are testing. Prefer `project.name` from
 * `playwright.admin.config.ts` / `playwright.missionary.config.ts`, then
 * `PLAYWRIGHT_BONEYARD_TARGET=admin|missionary|donor`, then baseURL port as a last resort.
 */
function getExpectation(
  projectName: string | undefined,
  baseURL: string | undefined,
): BoneyardRouteExpectation | null {
  const envTarget = process.env.PLAYWRIGHT_BONEYARD_TARGET;

  const target =
    projectName === "admin-boneyard" || envTarget === "admin"
      ? "admin"
      : projectName === "missionary-boneyard" || envTarget === "missionary"
        ? "missionary"
        : projectName === "donor-boneyard" || envTarget === "donor"
          ? "donor"
          : null;

  if (target === "admin") {
    return {
      heading: "Contributions",
      path: "/boneyard/contributions",
      skeletonName: "admin-contributions-content",
    };
  }

  if (target === "missionary") {
    return {
      heading: "Mission Tasks",
      path: "/boneyard/tasks",
      skeletonName: "missionary-tasks-list",
    };
  }

  if (target === "donor") {
    return {
      heading: "Donor dashboard",
      path: "/boneyard/donor-dashboard",
      skeletonName: "donor-dashboard-main",
    };
  }

  // Fallback when running with a generic project name (e.g. donor config on :3030).
  try {
    const url = new URL(baseURL ?? "");
    const port = url.port ? Number(url.port) : NaN;
    if (port === 3030) {
      return {
        heading: "Contributions",
        path: "/boneyard/contributions",
        skeletonName: "admin-contributions-content",
      };
    }
    if (port === 4000) {
      return {
        heading: "Mission Tasks",
        path: "/boneyard/tasks",
        skeletonName: "missionary-tasks-list",
      };
    }
    if (port === 3000) {
      return {
        heading: "Donor dashboard",
        path: "/boneyard/donor-dashboard",
        skeletonName: "donor-dashboard-main",
      };
    }
  } catch {
    /* ignore */
  }

  return null;
}

test("boneyard capture routes render generated bone overlays", async ({
  page,
}, testInfo) => {
  const expectation = getExpectation(
    testInfo.project.name,
    testInfo.project.use.baseURL,
  );

  if (!expectation) {
    test.skip(
      true,
      "Run with playwright.admin/missionary/donor.config.ts, set PLAYWRIGHT_BONEYARD_TARGET, or use baseURL port 3030/4000/3000.",
    );
    return;
  }

  await page.goto(expectation.path);
  await page.waitForLoadState("domcontentloaded");

  if (expectation.heading) {
    await expect(
      page.getByRole("heading", { name: expectation.heading }),
    ).toBeVisible();
  } else if (expectation.visibleText) {
    await expect(page.getByText(expectation.visibleText)).toBeVisible();
  }
  await expect(page.getByText("This page could not be found.")).toHaveCount(0);
  // Wrapper may be `visibility:hidden` while the overlay measures (boneyard-js 1.7+);
  // assert DOM presence, then wait for painted bone layers below.
  await expect(
    page.locator(`[data-boneyard="${expectation.skeletonName}"]`),
  ).toBeAttached();

  // boneyard-js 1.7+ puts `position: relative` on the `[data-boneyard]` root;
  // `querySelector` does not match the element itself, so also check the root
  // `style` and stable overlay markers (`data-boneyard-overlay` / bone nodes).
  await page.waitForFunction(
    ({ skeletonName }) => {
      const root = document.querySelector(`[data-boneyard="${skeletonName}"]`);
      if (!root) return false;

      const rootStyle = root.getAttribute("style") ?? "";
      if (rootStyle.includes("position")) return true;
      if (root.querySelector("[data-boneyard-overlay]")) return true;
      if (root.querySelector("[data-boneyard-bone]")) return true;

      return root.querySelector("[style*='position']") != null;
    },
    { skeletonName: expectation.skeletonName },
  );
});
