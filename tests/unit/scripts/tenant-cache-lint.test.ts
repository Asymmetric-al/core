import path from "node:path";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

/**
 * Council round 1, A21: the tenant reaches a cached read only as an
 * argument. Under the rewrite a page's params hold the route's parameters and
 * no tenant, so a cache in page code would be shared by every tenant. Page
 * code in both apps and the shared UI caches nothing itself; a cached read in
 * packages/api takes the tenant, which then keys its cache. The rule replaces
 * the regular-expression check of tests/unit/apps/tenant-navigation-boundary.test.ts,
 * and runs through each workspace's real ESLint configuration.
 */

const root = process.cwd();
const RULE = "tenant-navigation/no-tenantless-cache";

async function cacheMessages(workspace: string, file: string, code: string) {
  const eslint = new ESLint({
    cwd: path.join(root, workspace),
    overrideConfigFile: path.join(root, workspace, "eslint.config.mjs"),
    overrideConfig: {
      languageOptions: { parserOptions: { projectService: false } },
    },
  });
  const [result] = await eslint.lintText(code, {
    filePath: path.join(root, workspace, file),
  });
  return result!.messages.filter((message) => message.ruleId === RULE);
}

const NO_TENANT = [
  "export async function read(id: string) {",
  '  "use cache";',
  "  return id;",
  "}",
].join("\n");
const FILE_LEVEL = [
  '"use cache";',
  "export async function read(tenantId: string) {",
  "  return tenantId;",
  "}",
].join("\n");
const TENANT_ARGUMENT = [
  "export async function read(tenantId: string) {",
  '  "use cache";',
  "  return tenantId;",
  "}",
].join("\n");

describe("the tenant cache rule", () => {
  it.each([
    ["apps/admin", "app/(app)/probe/page.tsx"],
    ["apps/admin", "features/probe/read.ts"],
    ["apps/missionary", "app/probe/page.tsx"],
    ["packages/missionary", "components/probe.tsx"],
    ["packages/ui", "components/probe.tsx"],
    ["packages/lib", "probe.ts"],
  ])("refuses any cache in page code: %s/%s", async (workspace, file) => {
    for (const code of [NO_TENANT, FILE_LEVEL, TENANT_ARGUMENT]) {
      expect(await cacheMessages(workspace, file, code), code).toHaveLength(1);
    }
  });

  it("lets a read in packages/api cache only when it takes the tenant", async () => {
    const file = "src/reads/probe.ts";
    for (const allowed of [
      TENANT_ARGUMENT,
      [
        "export async function read(id: string, tenantId: string) {",
        '  "use cache";',
        "  return id + tenantId;",
        "}",
      ].join("\n"),
      [
        "async function read({ tenantId, limit }: { tenantId: string; limit: number }) {",
        '  "use cache";',
        "  return tenantId + limit;",
        "}",
        "export { read };",
      ].join("\n"),
      [
        "export const read = async (tenantId: string) => {",
        '  "use cache";',
        "  return tenantId;",
        "};",
      ].join("\n"),
    ]) {
      expect(
        await cacheMessages("packages/api", file, allowed),
        allowed,
      ).toEqual([]);
    }
    for (const refused of [
      NO_TENANT,
      FILE_LEVEL,
      [
        "export async function read({ limit }: { limit: number }) {",
        '  "use cache: remote";',
        "  return limit;",
        "}",
      ].join("\n"),
    ]) {
      expect(
        await cacheMessages("packages/api", file, refused),
        refused,
      ).toHaveLength(1);
    }
  });

  it("leaves packages/auth and packages/database, which hold no reads, alone", async () => {
    expect(await cacheMessages("packages/auth", "probe.ts", NO_TENANT)).toEqual(
      [],
    );
  });
});
