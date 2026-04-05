import { expect, test } from "@playwright/test";

type BoneyardRouteExpectation = {
  heading: string;
  path: string;
  skeletonName: string;
};

/**
 * Resolve which capture surface we are testing. Prefer `project.name` from
 * `playwright.admin.config.ts` / `playwright.missionary.config.ts`, then
 * `PLAYWRIGHT_BONEYARD_TARGET=admin|missionary`, then baseURL port as a last resort.
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

  test.skip(
    !expectation,
    "Run with playwright.admin.config.ts or playwright.missionary.config.ts, set PLAYWRIGHT_BONEYARD_TARGET, or use baseURL port 3030/4000.",
  );

  await page.goto(expectation.path);
  await page.waitForLoadState("domcontentloaded");

  await expect(
    page.getByRole("heading", { name: expectation.heading }),
  ).toBeVisible();
  await expect(page.getByText("This page could not be found.")).toHaveCount(0);
  await expect(
    page.locator(`[data-boneyard="${expectation.skeletonName}"]`),
  ).toBeVisible();

  // Boneyard paints overlay layers with inline `position` styles; avoid coupling
  // to a specific tag or `absolute` substring—any positioned child under the
  // root indicates the runtime registered bones and drew an overlay.
  await page.waitForFunction(
    ({ skeletonName }) => {
      const root = document.querySelector(`[data-boneyard="${skeletonName}"]`);
      if (!root) return false;

      return root.querySelector("[style*='position']") != null;
    },
    { skeletonName: expectation.skeletonName },
  );
});
