import { describe, expect, it } from "vitest";

import {
  collectRetiredTwentyRuntimeViolations,
  collectRetiredTwentyRuntimeViolationsFromSource,
} from "../../../scripts/verify/data-boundary-check.mjs";

describe("Twenty CRM retirement guard", () => {
  it("fails a prohibited runtime reference", () => {
    const violations = collectRetiredTwentyRuntimeViolationsFromSource(
      "packages/env/src/schema.ts",
      "TWENTY_API_KEY: z.string().min(1).optional(),\n",
    );

    expect(violations).toEqual([
      "packages/env/src/schema.ts: retired Twenty runtime reference (TWENTY_API_KEY)",
    ]);
  });

  it("does not fail a historical archive path", () => {
    const violations = collectRetiredTwentyRuntimeViolationsFromSource(
      "openspec/changes/archive/2026-07-02-integrate-twenty-crm-core/proposal.md",
      "TWENTY_API_KEY and CRM_SYNC_OUTBOUND_ENABLED were part of the retired integration.",
    );

    expect(violations).toEqual([]);
  });

  it("does not fail the scanner's own marker list", () => {
    const violations = collectRetiredTwentyRuntimeViolationsFromSource(
      "scripts/verify/data-boundary-check.mjs",
      'const markers = ["TWENTY_API_KEY", "CRM_SYNC_INBOUND_ENABLED"];',
    );

    expect(violations).toEqual([]);
  });

  it.each([
    "packages/eve-runtime/.eve/dev-runtime/snapshots/run/source/packages/env/src/schema.ts",
    "packages/eve-runtime/.nitro/server/chunks/runtime.mjs",
    "packages/eve-runtime/.output/server/_chunks/admin.mjs",
  ])(
    "does not treat ignored generated runtime output as live source: %s",
    (relativePath) => {
      const violations = collectRetiredTwentyRuntimeViolationsFromSource(
        relativePath,
        "TWENTY_API_KEY and CRM_SYNC_OUTBOUND_ENABLED are archived output only.",
      );

      expect(violations).toEqual([]);
    },
  );

  it("still scans same-named directories outside ignored Eve output", () => {
    const violations = collectRetiredTwentyRuntimeViolationsFromSource(
      "packages/example/.output/runtime.ts",
      "TWENTY_API_KEY is a prohibited live runtime marker.",
    );

    expect(violations).toEqual([
      "packages/example/.output/runtime.ts: retired Twenty runtime reference (TWENTY_API_KEY)",
    ]);
  });

  it("passes a clean current runtime tree", () => {
    expect(collectRetiredTwentyRuntimeViolations()).toEqual([]);
  });
});
