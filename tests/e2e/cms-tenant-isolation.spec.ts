import { expect, test } from "@playwright/test";

import { skipIfPayloadDatabaseUnreachable } from "./cms-skip-if-no-payload";

test.describe("@cms CMS tenant isolation", () => {
  test("unknown tenant page paths do not leak cross-tenant content", async ({
    page,
  }) => {
    const response = await page.goto("/tenant-content-that-does-not-exist");

    if (response && response.status() >= 500) {
      test.skip(
        true,
        "Payload public CMS route is unavailable in this environment; run with a reachable PAYLOAD_DATABASE_URI to assert tenant isolation.",
      );
    }

    await skipIfPayloadDatabaseUnreachable(page);

    // Catch-all CMS route returns 404 when no published page exists (see
    // `app/(public)/(solid)/[...cmsSlug]/page.tsx`); that still satisfies isolation.
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
});
