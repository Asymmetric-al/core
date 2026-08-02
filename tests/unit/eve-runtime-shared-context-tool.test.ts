import { describe, expect, it } from "vitest";

import { createEveSharedContextTool } from "../../packages/eve-runtime/src/specialists/shared-context-tool";

describe("Eve specialist shared-context tool", () => {
  it("exposes the governed conflict-resolution operation", () => {
    const tool = createEveSharedContextTool("code-review");
    const schema = tool.inputSchema as {
      safeParse(input: unknown): { success: boolean };
    };

    expect(
      schema.safeParse({
        operation: "resolve",
        resolution: {
          conflictId: "63dd3b1c-3e52-4efc-8cf0-3808cd60f825",
          evidence: [
            {
              kind: "repository",
              reference: "packages/api/src/eve/shared-context/control.ts:133",
            },
          ],
          outcome: "The first claim is supported by the repository evidence.",
          policyId: "eve-shared-context-v1",
          selectedClaimIds: ["2f1ef77e-842e-4820-ae2d-36be8d85db84"],
        },
      }).success,
    ).toBe(true);
  });
});
