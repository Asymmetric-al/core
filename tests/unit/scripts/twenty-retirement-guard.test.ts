import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  collectTypeScriptFiles,
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

  it("passes a clean current runtime tree", () => {
    expect(collectRetiredTwentyRuntimeViolations()).toEqual([]);
  });

  it("skips generated Eve and Nitro output directories while walking runtime trees", () => {
    const scanner = readFileSync(
      new URL(
        "../../../scripts/verify/data-boundary-check.mjs",
        import.meta.url,
      ),
      "utf8",
    );

    expect(scanner).toMatch(
      /SKIP_DIRECTORY_NAMES = new Set\(\[[\s\S]*"\.output"[\s\S]*"\.nitro"/u,
    );
    expect(
      collectRetiredTwentyRuntimeViolations().some((violation) =>
        violation.includes(".output/"),
      ),
    ).toBe(false);
  });

  it("does not walk generated .output or .nitro trees when collecting files", () => {
    const root = mkdtempSync(path.join(tmpdir(), "twenty-skip-dirs-"));

    try {
      mkdirSync(path.join(root, "src"));
      mkdirSync(path.join(root, ".output"));
      mkdirSync(path.join(root, ".nitro"));
      writeFileSync(
        path.join(root, "src", "runtime.ts"),
        "const marker = 'visible';\n",
      );
      writeFileSync(path.join(root, ".output", "chunk.ts"), "TWENTY_API_KEY\n");
      writeFileSync(path.join(root, ".nitro", "chunk.ts"), "TWENTY_API_KEY\n");

      const files = collectTypeScriptFiles(root).map((filePath) =>
        path.relative(root, filePath).split(path.sep).join("/"),
      );

      expect(files).toEqual(["src/runtime.ts"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
