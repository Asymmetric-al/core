import { describe, expect, it, vi } from "vitest";

import { closePagesAfterFailure } from "../../e2e/helpers/secret-pages";

import type { BrowserContext, TestInfo } from "@playwright/test";

function contextWith(count: number, refuse: number[] = []) {
  const pages = Array.from({ length: count }, (_page, index) => ({
    close: vi.fn(async () => {
      if (refuse.includes(index)) throw new Error(`page ${index} refused`);
    }),
  }));
  return {
    context: { pages: () => pages } as unknown as BrowserContext,
    pages,
  };
}

function outcome(status: TestInfo["status"]): TestInfo {
  return { status, expectedStatus: "passed" } as TestInfo;
}

describe("AL-2675 WP2c part 2a, F6: no page snapshot of the operator journey after a failure", () => {
  it.each(["failed", "timedOut", "interrupted"] as const)(
    "closes every page when the test %s, so Playwright's error context has no page to snapshot",
    async (status) => {
      const { context, pages } = contextWith(2);
      await closePagesAfterFailure(outcome(status), context);
      for (const page of pages) {
        expect(page.close).toHaveBeenCalledWith({ runBeforeUnload: false });
      }
    },
  );

  it("leaves a passing test's pages open", async () => {
    const { context, pages } = contextWith(2);
    await closePagesAfterFailure(outcome("passed"), context);
    for (const page of pages) expect(page.close).not.toHaveBeenCalled();
  });

  it("still closes the others when one page refuses, then reports it", async () => {
    const { context, pages } = contextWith(3, [0]);
    await expect(
      closePagesAfterFailure(outcome("failed"), context),
    ).rejects.toThrow("page 0 refused");
    for (const page of pages) expect(page.close).toHaveBeenCalled();
  });
});
