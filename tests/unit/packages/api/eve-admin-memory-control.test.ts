import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const appendMock = vi.fn();
const loadEntryMock = vi.fn();
vi.mock("../../../../packages/api/src/eve/audit/store", () => ({
  createEveAuditStore: () => ({ append: appendMock }),
}));
vi.mock("../../../../packages/api/src/eve/admin-memory/store", () => ({
  loadEveAdminMemoryEntryById: loadEntryMock,
}));

const auth = {
  userId: "user_1",
  email: "admin@example.com",
  tenantId: "00000000-0000-4000-8000-000000000001",
  profileId: "00000000-0000-4000-8000-000000000002",
  role: "admin",
  profileRole: "admin",
  memberships: [],
  isAuthenticated: true,
} as AuthenticatedContext;

describe("Eve admin-memory control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appendMock.mockResolvedValue(undefined);
  });

  it("audits an exclusion category without calling the persistence RPC or copying the value", async () => {
    const rpc = vi.fn();
    const { createEveAdminMemory } =
      await import("../../../../packages/api/src/eve/admin-memory/control");
    const secret = "password: do-not-copy-me";
    const result = await createEveAdminMemory({
      auth,
      category: "preference",
      title: "Credential",
      content: secret,
      source: "manual",
      supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
    });
    expect(result).toEqual({ stored: false, exclusions: ["credential"] });
    expect(rpc).not.toHaveBeenCalled();
    expect(JSON.stringify(appendMock.mock.calls)).not.toContain(secret);
    expect(appendMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "memory.excluded", result: "blocked" }),
    );
  });

  it("creates allowed memory through the atomic owner-bound RPC", async () => {
    const entryId = "00000000-0000-4000-8000-000000000003";
    const entry = { id: entryId, title: "Updates" };
    const rpc = vi.fn().mockResolvedValue({ data: entryId, error: null });
    loadEntryMock.mockResolvedValue(entry);
    const { createEveAdminMemory } =
      await import("../../../../packages/api/src/eve/admin-memory/control");
    await expect(
      createEveAdminMemory({
        auth,
        category: "preference",
        title: "Updates",
        content: "Prefer concise summaries.",
        source: "manual",
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      }),
    ).resolves.toEqual({ stored: true, entry });
    expect(rpc).toHaveBeenCalledWith(
      "create_eve_admin_memory",
      expect.objectContaining({
        p_scope_type: "admin_private",
        p_actor_profile_id: auth.profileId,
        p_tenant_id: auth.tenantId,
      }),
    );
  });

  it("maps optimistic concurrency failures to a deliberate refresh response", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "stale_eve_admin_memory" },
    });
    const { updateEveAdminMemory } =
      await import("../../../../packages/api/src/eve/admin-memory/control");
    await expect(
      updateEveAdminMemory({
        auth,
        entryId: crypto.randomUUID(),
        expectedVersion: 1,
        category: "decision",
        title: "Choice",
        content: "Use the shared boundary.",
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
