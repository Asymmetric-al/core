import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const require = createRequire(path.join(root, "package.json"));
const mergerPath = path.join(
  path.dirname(require.resolve("@fission-ai/openspec")),
  "core/specs-apply.js",
);

describe("source-owned OpenSpec projection merging", () => {
  it.each([
    ["add-donor-dashboard-depth", "donor-dashboard-depth", "traceability.json"],
    [
      "add-donor-development",
      "donor-development",
      "operating controls remain binding",
    ],
    [
      "add-missionary-workspace-depth",
      "missionary-workspace-depth",
      "canonical Phase 28 domain/proof volumes",
    ],
    [
      "add-web-studio-hybrid-contracts",
      "web-studio-hybrid-authoring",
      "requirements.json",
    ],
  ])(
    "preserves %s source ownership in its durable Purpose",
    async (change, capability, owner) => {
      const { findSpecUpdates, buildUpdatedSpec } = await import(
        pathToFileURL(mergerPath).href
      );
      const updates = await findSpecUpdates(
        path.join(root, "openspec/changes", change),
        path.join(root, "openspec/specs"),
      );
      const update = updates.find(
        (item: { id: string }) => item.id === capability,
      );
      expect(update).toBeDefined();
      const result = await buildUpdatedSpec(update, change, { silent: true });
      expect(result.warnings).toEqual([]);
      expect(/## Purpose\s+TBD/.test(result.rebuilt)).toBe(false);
      const purpose = result.rebuilt.split("## Purpose")[1]?.split("\n## ")[0];
      expect(purpose).toContain(owner);
      expect(purpose).toMatch(/do not (?:hand-edit|edit independently)/i);
    },
  );
});
