import { readFileSync } from "node:fs";
import path from "node:path";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const RULE = "tenant-navigation/no-prefixless-navigation";

function eslintFor(workspace: string) {
  return new ESLint({
    cwd: path.join(root, workspace),
    overrideConfigFile: path.join(root, workspace, "eslint.config.mjs"),
    overrideConfig: {
      languageOptions: { parserOptions: { projectService: false } },
    },
  });
}

async function ruleMessages(workspace: string, file: string, code: string) {
  const [result] = await eslintFor(workspace).lintText(code, {
    filePath: path.join(root, workspace, file),
  });
  return result!.messages.filter((message) => message.ruleId === RULE);
}

const BUILT_WITH_AN_ID: ReadonlyArray<[string, string]> = [
  [
    "a template starting with the tenant",
    "export const a = (tenantId: string) => `/${tenantId}/donors`;",
  ],
  [
    "a template that is the tenant alone",
    "export const a = (payload: { tenant_id: string }) => `/${payload.tenant_id}`;",
  ],
  [
    "a template starting with the organization",
    "export const a = (organizationId: string) => `/${organizationId}~finance`;",
  ],
  [
    "a concatenation",
    'export const a = (tenantId: string) => "/" + tenantId + "/donors";',
  ],
];

const NOT_AN_ID_PATH: ReadonlyArray<[string, string]> = [
  [
    "an API path naming the tenant later",
    "export const a = (tenantId: string) => `/api/tenants/${tenantId}`;",
  ],
  [
    "a page path naming the tenant later",
    "export const a = (tenantId: string) => `/donors/${tenantId}`;",
  ],
  ["a slug", "export const a = (slug: string) => `/${slug}`;"],
  ["a storage key", "export const a = (tenantId: string) => `${tenantId}/x`;"],
];

describe("an organization ID built into a path", () => {
  it.each(BUILT_WITH_AN_ID)(
    "is reported under the existing rule: %s (base: allowed)",
    async (_label, code) => {
      for (const [workspace, file] of [
        ["apps/admin", "features/probe/probe.ts"],
        ["apps/missionary", "components/probe.ts"],
        ["packages/api", "src/probe.ts"],
        ["packages/ui", "components/probe.ts"],
      ] as const) {
        const messages = await ruleMessages(workspace, file, code);
        expect(messages.length, `${workspace}/${file}`).toBe(1);
        expect(messages[0]!.severity).toBe(2);
        expect(messages[0]!.message).not.toMatch(/<tenant>|<org/);
      }
    },
  );

  it.each(NOT_AN_ID_PATH)("is not reported: %s", async (_label, code) => {
    expect(
      await ruleMessages("apps/admin", "features/probe/probe.ts", code),
    ).toEqual([]);
  });

  it.each([
    ["packages/auth", "tenant-address.ts"],
    ["packages/api", "src/invitations/accept.ts"],
    ["packages/ui", "components/auth/InvitationDoorway.tsx"],
  ])(
    "allows the off-mode site %s/%s, as it stands (guard)",
    async (workspace, file) => {
      const code = readFileSync(path.join(root, workspace, file), "utf8");
      expect(await ruleMessages(workspace, file, code)).toEqual([]);
    },
  );

  it("reports the same template in another file of the same workspace, or in another function of an allowed file", async () => {
    expect(
      await ruleMessages(
        "packages/auth",
        "tenant-probe.ts",
        "export const a = (tenantId: string) => `/${tenantId}`;",
      ),
    ).toHaveLength(1);
    expect(
      await ruleMessages(
        "packages/auth",
        "tenant-address.ts",
        "export function other(tenantId: string) { return `/${tenantId}`; }",
      ),
    ).toHaveLength(1);
  });

  it("does not lint the donor app (guard)", async () => {
    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: path.join(root, "eslint.config.mjs"),
      overrideConfig: {
        languageOptions: { parserOptions: { projectService: false } },
      },
    });
    const [donor] = await eslint.lintText(BUILT_WITH_AN_ID[0]![1], {
      filePath: path.join(root, "apps/donor/components/probe.ts"),
    });
    expect(donor!.messages.some((message) => message.ruleId === RULE)).toBe(
      false,
    );
  });
});
