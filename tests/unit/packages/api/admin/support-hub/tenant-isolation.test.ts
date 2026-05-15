import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { SUPPORT_HUB_DEMO_TENANT_ID } from "../../../../../../packages/api/src/admin/support-hub/adapter/fixtures";
import {
  __resetInMemorySupportHubStore,
  inMemorySupportHubAdapter,
} from "../../../../../../packages/api/src/admin/support-hub/adapter";
import { runWithSupportHubTenant } from "../../../../../../packages/api/src/admin/support-hub/request-context";

beforeEach(() => {
  __resetInMemorySupportHubStore();
});

afterEach(() => {
  __resetInMemorySupportHubStore();
});

describe("support-hub in-memory tenant isolation", () => {
  it("returns seeded data only for the demo tenant scope", async () => {
    const seeded = await inMemorySupportHubAdapter.conversations.list({});
    expect(seeded.length).toBeGreaterThan(0);

    await runWithSupportHubTenant("other-tenant", async () => {
      const empty = await inMemorySupportHubAdapter.conversations.list({});
      expect(empty).toEqual([]);
    });

    const again = await inMemorySupportHubAdapter.conversations.list({});
    expect(again.length).toBe(seeded.length);
  });

  it("rejects mutations when the request tenant is not the demo seed tenant", async () => {
    await expect(
      runWithSupportHubTenant("other-tenant", () =>
        inMemorySupportHubAdapter.labels.save({
          name: "X",
          slug: "x",
          tone: "blue",
          description: null,
        }),
      ),
    ).rejects.toThrow("SUPPORT_HUB_TENANT_MISMATCH");
  });

  it("allows mutations under the demo tenant scope", async () => {
    await runWithSupportHubTenant(SUPPORT_HUB_DEMO_TENANT_ID, async () => {
      const [c] = await inMemorySupportHubAdapter.conversations.list({});
      expect(c).toBeDefined();
      const updated = await inMemorySupportHubAdapter.conversations.assign({
        conversationId: c!.id,
        assigneeAgentId: "agent-emily-thompson",
      });
      expect(updated.assignee?.id).toBe("agent-emily-thompson");
    });
  });
});
