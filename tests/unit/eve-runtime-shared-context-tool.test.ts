import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  adminClient: { from: vi.fn() },
  claimSession: vi.fn(async () => undefined),
  consultPolicy: vi.fn(async () => ({ decision: "allow" })),
  resolveConflict: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: mocks.adminClient }),
}));

vi.mock("@asym/api/eve/approval-budget", () => ({
  executeEveRuntimePolicyConsult: mocks.consultPolicy,
}));

vi.mock("@asym/api/eve/audit", () => ({
  createEveAuditStore: () => ({ kind: "audit-store" }),
}));

vi.mock("@asym/api/eve/shared-context", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/api/eve/shared-context")>()),
  createEveSharedContextStore: () => ({ kind: "context-store" }),
  resolveEveSharedContextConflict: mocks.resolveConflict,
}));

vi.mock("../../packages/eve-runtime/src/specialists/identity", () => ({
  claimEveSpecialistSession: mocks.claimSession,
  resolveEveSpecialistIdentity: () => ({
    actorId: "eve-specialist:code-review",
    actorRole: "specialist",
    identityMode: "service",
    initiatorId: "profile-1",
    initiatorType: "profile",
    tenantId: "tenant-1",
  }),
}));

import { createEveSharedContextTool } from "../../packages/eve-runtime/src/specialists/shared-context-tool";

describe("Eve specialist shared-context tool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveConflict.mockImplementation(async (input) => {
      await input.authorize({
        targetKey: "shared-context:conflict:conflict-1",
      });
      return { resolved: true };
    });
  });

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

  it("executes conflict resolution through the governed root-run path", async () => {
    const tool = createEveSharedContextTool("code-review");
    const resolution = {
      conflictId: "63dd3b1c-3e52-4efc-8cf0-3808cd60f825",
      evidence: [
        {
          kind: "repository" as const,
          reference: "packages/api/src/eve/shared-context/control.ts:133",
        },
      ],
      outcome: "The first claim is supported by the repository evidence.",
      policyId: "eve-shared-context-v1",
      selectedClaimIds: ["2f1ef77e-842e-4820-ae2d-36be8d85db84"],
    };

    await tool.execute({ operation: "resolve", resolution }, {
      session: {
        auth: { current: { actorId: "verified" } },
        id: "session-child",
        parent: { rootSessionId: "session-root" },
      },
    } as never);

    expect(mocks.resolveConflict).toHaveBeenCalledWith(
      expect.objectContaining({
        accountableRunId: "session-root",
        resolution,
      }),
    );
    expect(mocks.consultPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        actionId: "engineering.shared_context.resolve",
        sessionId: "session-child",
        targetKey: "shared-context:conflict:conflict-1",
      }),
    );
  });
});
