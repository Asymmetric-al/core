import { expect, test } from "@playwright/test";

type BoneyardRouteExpectation = {
  heading: string;
  path: string;
  skeletonName: string;
  minAbsoluteBones: number;
};

function getExpectation(baseURL?: string): BoneyardRouteExpectation | null {
  if (baseURL?.includes(":3030")) {
    return {
      heading: "Contributions",
      path: "/boneyard/contributions",
      skeletonName: "admin-contributions-content",
      minAbsoluteBones: 8,
    };
  }

  if (baseURL?.includes(":4000")) {
    return {
      heading: "Mission Tasks",
      path: "/boneyard/tasks",
      skeletonName: "missionary-tasks-list",
      minAbsoluteBones: 8,
    };
  }

  return null;
}

test("boneyard capture routes render generated bone overlays", async ({
  page,
}, testInfo) => {
  const expectation = getExpectation(testInfo.project.use.baseURL);

  test.skip(
    !expectation,
    "Run this spec with the admin or missionary Playwright config.",
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

  await page.waitForFunction(
    ({ skeletonName, minAbsoluteBones }) => {
      const root = document.querySelector(`[data-boneyard="${skeletonName}"]`);
      if (!root) return false;

      return (
        root.querySelectorAll('div[style*="position: absolute"]').length >=
        minAbsoluteBones
      );
    },
    {
      skeletonName: expectation.skeletonName,
      minAbsoluteBones: expectation.minAbsoluteBones,
    },
  );
});
