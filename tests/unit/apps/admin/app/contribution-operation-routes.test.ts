import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function routeSource(...segments: string[]): string {
  return readFileSync(path.resolve(__dirname, ...segments), "utf8").trim();
}

describe("admin app contribution operation route exports", () => {
  it("exposes contribution detail GET through the API package route", () => {
    expect(
      routeSource(
        "../../../../../apps/admin/app/api/admin/contribution-operations/[contributionId]/route.ts",
      ),
    ).toBe(
      'export { GET } from "@asym/api/admin/contribution-operations/route";',
    );
  });

  it("exposes contribution action POST through the API package route", () => {
    expect(
      routeSource(
        "../../../../../apps/admin/app/api/admin/contribution-operations/actions/route.ts",
      ),
    ).toBe(
      'export { POST } from "@asym/api/admin/contribution-operations/route";',
    );
  });

  it("exposes correction-request decisions as POST through the API package route", () => {
    expect(
      routeSource(
        "../../../../../apps/admin/app/api/admin/contribution-operations/correction-requests/[requestId]/decision/route.ts",
      ),
    ).toBe(
      'export { POST_CORRECTION_REQUEST_DECISION as POST } from "@asym/api/admin/contribution-operations/route";',
    );
  });
});
