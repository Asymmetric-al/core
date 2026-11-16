import { describe, expect, it, vi } from "vitest";

const { summarizeMock } = vi.hoisted(() => ({ summarizeMock: vi.fn() }));
vi.mock("../../../../../packages/api/src/shared/with-operation", () => ({
  withOperation: (handler: unknown) => handler,
}));
vi.mock("../../../../../packages/api/src/workflows/summaries", () => ({
  summarizeWorkflowRuns: summarizeMock,
}));

import { GET } from "../../../../../packages/api/src/admin/workflows/summaries";

describe("workflow summary notification overrides", () => {
  it("rejects failed policy reads without disclosing database details", async () => {
    const query = {
      select: () => query,
      eq: () => query,
      maybeSingle: async () => ({
        data: null,
        error: { message: "private database details" },
      }),
    };
    const handler = GET as unknown as (context: unknown) => Promise<unknown>;
    await expect(
      handler({
        supabaseAdmin: { from: () => query },
        auth: { tenantId: "tenant-1" },
      }),
    ).rejects.toThrow(
      "workflow_summaries_failed: workflow_notification_policies",
    );
    expect(summarizeMock).not.toHaveBeenCalled();
  });
});
