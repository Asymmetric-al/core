import { describe, expect, it, vi } from "vitest";

import { loadEveAdminMemoryEntryById } from "../../../../packages/api/src/eve/admin-memory/store";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

describe("Eve admin-memory store", () => {
  it("loads an entry only through the verified tenant, owner, and private scope", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    const client = {
      from: vi.fn().mockReturnValue(query),
    } as unknown as AdminSupabaseClient;

    await expect(
      loadEveAdminMemoryEntryById({
        entryId: "00000000-0000-4000-8000-000000000001",
        tenantId: "00000000-0000-4000-8000-000000000002",
        ownerProfileId: "00000000-0000-4000-8000-000000000003",
        supabaseAdmin: client,
      }),
    ).resolves.toBeNull();

    expect(query.eq.mock.calls).toEqual([
      ["id", "00000000-0000-4000-8000-000000000001"],
      ["tenant_id", "00000000-0000-4000-8000-000000000002"],
      ["owner_profile_id", "00000000-0000-4000-8000-000000000003"],
      ["scope_type", "admin_private"],
    ]);
  });
});
