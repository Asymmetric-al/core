import { describe, expect, it, vi } from "vitest";

import { runBulkMutations } from "../../../../../../apps/admin/features/support-hub/lib/bulk-mutations";

describe("runBulkMutations", () => {
  it("reports partial failures without dropping successful rows", async () => {
    const mutate = vi.fn(async (id: string) => {
      if (id === "row-2") throw new Error("row failed");
      return id;
    });

    const report = await runBulkMutations(["row-1", "row-2", "row-3"], mutate);

    expect(mutate).toHaveBeenCalledTimes(3);
    expect(report).toMatchObject({
      total: 3,
      succeeded: 2,
      failed: 1,
    });
    expect(report.firstError?.message).toBe("row failed");
  });
});
