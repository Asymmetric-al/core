import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const workflowPaths = [
  ".github/workflows/ci.yml",
  ".github/workflows/ci-integration.yml",
];

describe("CI workflow Bun install backend", () => {
  it("uses the portable copyfile backend for GitHub Actions Bun installs", () => {
    for (const workflowPath of workflowPaths) {
      const workflow = readFileSync(workflowPath, "utf8");
      const bunCiCommands = workflow.match(/run: bun ci[^\n]*/g) ?? [];

      expect(bunCiCommands, workflowPath).not.toEqual([]);
      expect(bunCiCommands, workflowPath).toEqual(
        bunCiCommands.map(() => "run: bun ci --no-cache --backend=copyfile"),
      );
    }
  });
});
