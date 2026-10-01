import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { summarizeDeploymentImpact } from "../../../scripts/release/production.mjs";

describe("production release summary", () => {
  it("requests full preflight when releasing from develop", () => {
    expect(readFileSync("scripts/release/production.mjs", "utf8")).toContain(
      '"ci:preflight",\n    "--",\n    "--full"',
    );
  });
  it("summarizes app-only and shared deployment impact", () => {
    expect(
      summarizeDeploymentImpact(["apps/admin/app/(app)/page.tsx"]),
    ).toEqual([
      expect.objectContaining({ app: "admin", build: true }),
      expect.objectContaining({ app: "donor", build: false }),
      expect.objectContaining({ app: "missionary", build: false }),
    ]);

    expect(summarizeDeploymentImpact(["packages/env/src/schema.ts"])).toEqual([
      expect.objectContaining({ app: "admin", build: true }),
      expect.objectContaining({ app: "donor", build: true }),
      expect.objectContaining({ app: "missionary", build: true }),
    ]);
  });
});
