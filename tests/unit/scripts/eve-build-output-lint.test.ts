import path from "node:path";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const eslint = new ESLint({ cwd: root });
const adminEslint = new ESLint({ cwd: path.join(root, "apps/admin") });
const eveEslint = new ESLint({ cwd: path.join(root, "packages/eve-runtime") });

describe("Eve generated build output", () => {
  it.each([
    "apps/admin/.eve/vercel-services/eve/.vercel/output/functions/__server.func/index.mjs",
    "apps/admin/.vercel/output/functions/generated.func/index.mjs",
  ])("does not lint generated deployment code at %s", async (file) => {
    expect(await eslint.isPathIgnored(path.resolve(file))).toBe(true);
    expect(await adminEslint.isPathIgnored(path.resolve(file))).toBe(true);
  });

  it.each([
    "apps/admin/next.config.ts",
    "apps/admin/app/layout.tsx",
    "packages/eve-runtime/agent/sandbox.ts",
    "packages/eve-runtime/src/governance-boundary.ts",
    "packages/eve-runtime/scripts/build.mjs",
  ])("continues to lint authored source at %s", async (file) => {
    expect(await eslint.isPathIgnored(path.resolve(file))).toBe(false);
    const workspaceEslint = file.startsWith("apps/admin/")
      ? adminEslint
      : eveEslint;
    expect(await workspaceEslint.isPathIgnored(path.resolve(file))).toBe(false);
  });
});
