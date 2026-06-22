import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const routeSource = readFileSync(
  path.resolve(
    __dirname,
    "../../../../../packages/api/src/admin/contribution-operations/route.ts",
  ),
  "utf8",
);

describe("admin/contribution-operations route contract", () => {
  it("redacts action results before returning POST action responses", () => {
    expect(routeSource).toContain(
      "const projectedResult = projectContributionActionResultForViewer(",
    );
    expect(routeSource).toContain(
      "return NextResponse.json({ result: projectedResult, requestId });",
    );
  });

  it("projects correction decision outcomes before returning them", () => {
    expect(routeSource).toContain(
      "export const POST_CORRECTION_REQUEST_DECISION",
    );
    expect(routeSource).toContain("result: projectedResult,");
  });

  it("accepts the routed action source surfaces used by UI and jobs", () => {
    expect(routeSource).toContain('"contribution_hub"');
    expect(routeSource).toContain('"donor_crm_record"');
    expect(routeSource).toContain('"automation"');
    expect(routeSource).toContain('"bulk_action"');
    expect(routeSource).toContain('"api"');
  });
});
