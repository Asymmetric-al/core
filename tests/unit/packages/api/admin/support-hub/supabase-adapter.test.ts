import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminClientMock, fromMock, eqMock, upsertMock } = vi.hoisted(() => {
  const eq = vi.fn();
  const order = vi.fn();
  const selectAfterUpsert = vi.fn();
  const single = vi.fn();
  const query = {
    eq,
    order,
    then(resolve: (value: { data: unknown[]; error: null }) => void) {
      resolve({ data: [], error: null });
    },
  };
  eq.mockReturnValue(query);
  order.mockReturnValue(query);
  single.mockImplementation(() => {
    const payload = upsert.mock.calls.at(-1)?.[0] ?? {};
    return Promise.resolve({
      data: {
        created_at: "2026-05-15T00:00:00.000Z",
        updated_at: "2026-05-15T00:00:00.000Z",
        ...payload,
      },
      error: null,
    });
  });
  selectAfterUpsert.mockReturnValue({ single });
  const upsert = vi.fn(() => ({ select: selectAfterUpsert }));
  const from = vi.fn(() => ({
    select: vi.fn(() => query),
    upsert,
  }));

  return {
    getAdminClientMock: vi.fn(),
    fromMock: from,
    eqMock: eq,
    upsertMock: upsert,
  };
});

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

import { supabaseSupportHubAdapter } from "../../../../../../packages/api/src/admin/support-hub/adapter/supabase";
import { runWithSupportHubTenant } from "../../../../../../packages/api/src/admin/support-hub/request-context";

describe("supabaseSupportHubAdapter tenant isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminClientMock.mockReturnValue({
      client: { from: fromMock },
      error: null,
    });
  });

  it("requires a server-bound tenant scope", async () => {
    await expect(supabaseSupportHubAdapter.labels.list()).rejects.toThrow(
      "SUPPORT_HUB_TENANT_REQUIRED",
    );
  });

  it("adds tenant_id filters to Supabase reads", async () => {
    await runWithSupportHubTenant("tenant-a", () =>
      supabaseSupportHubAdapter.labels.list(),
    );

    expect(fromMock).toHaveBeenCalledWith("support_labels");
    expect(eqMock).toHaveBeenCalledWith("tenant_id", "tenant-a");
  });

  it("stamps saved rows with the server-bound tenant id", async () => {
    const label = await runWithSupportHubTenant("tenant-b", () =>
      supabaseSupportHubAdapter.labels.save({
        name: "Escalated finance",
        slug: "escalated-finance",
        tone: "blue",
        description: null,
      }),
    );

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: "tenant-b",
        name: "Escalated finance",
      }),
      { onConflict: "tenant_id,id" },
    );
    expect(label.tenantId).toBe("tenant-b");
  });
});
