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
  role: "super_admin",
  profileRole: "super_admin",
  memberships: [],
  isAuthenticated: true,
} as AuthenticatedContext;

const barePiiCandidates = [
  ["SSN", "123-45-6789"],
  ["phone number", "(415) 555-2671"],
  ["street address", "742 Evergreen Terrace"],
] as const;

function expectValueFreePiiAudit(candidate: string) {
  expect(JSON.stringify(appendMock.mock.calls)).not.toContain(candidate);
  expect(appendMock).toHaveBeenCalledWith(
    expect.objectContaining({
      tenantId: auth.tenantId,
      action: "memory.excluded",
      result: "blocked",
      evidenceSummary:
        '{"exclusionCategories":["customer_or_donor_pii"],"candidateIncluded":false}',
      debugMetadata: {
        source: "eve_admin_memory_control",
        exclusionCategories: ["customer_or_donor_pii"],
      },
    }),
  );
}

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
      expect.objectContaining({
        tenantId: auth.tenantId,
        action: "memory.excluded",
        result: "blocked",
      }),
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

  it.each(barePiiCandidates)(
    "rejects a bare %s before calling the create RPC and keeps it out of audit evidence",
    async (_label, candidate) => {
      const rpc = vi.fn();
      const { createEveAdminMemory } =
        await import("../../../../packages/api/src/eve/admin-memory/control");

      await expect(
        createEveAdminMemory({
          auth,
          category: "preference",
          title: "Contact detail",
          content: candidate,
          source: "manual",
          supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
        }),
      ).resolves.toEqual({
        stored: false,
        exclusions: ["customer_or_donor_pii"],
      });
      expect(rpc).not.toHaveBeenCalled();
      expectValueFreePiiAudit(candidate);
    },
  );

  it("updates allowed memory through the tenant-bound RPC", async () => {
    const entryId = "00000000-0000-4000-8000-000000000003";
    const entry = { id: entryId, title: "Choice" };
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    loadEntryMock.mockResolvedValue(entry);
    const { updateEveAdminMemory } =
      await import("../../../../packages/api/src/eve/admin-memory/control");

    await expect(
      updateEveAdminMemory({
        auth,
        entryId,
        expectedVersion: 1,
        category: "decision",
        title: "Choice",
        content: "Use the shared boundary.",
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      }),
    ).resolves.toEqual({ stored: true, entry });
    expect(rpc).toHaveBeenCalledWith(
      "update_eve_admin_memory",
      expect.objectContaining({
        p_actor_profile_id: auth.profileId,
        p_tenant_id: auth.tenantId,
      }),
    );
  });

  it("deletes memory through the tenant-bound RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    const { deleteEveAdminMemory } =
      await import("../../../../packages/api/src/eve/admin-memory/control");

    await expect(
      deleteEveAdminMemory({
        auth,
        entryId: "00000000-0000-4000-8000-000000000003",
        expectedVersion: 1,
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      }),
    ).resolves.toBeUndefined();
    expect(rpc).toHaveBeenCalledWith(
      "delete_eve_admin_memory",
      expect.objectContaining({
        p_actor_profile_id: auth.profileId,
        p_tenant_id: auth.tenantId,
      }),
    );
  });

  it("sets auto-save through the tenant-bound RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    const { setEveAdminMemoryAutoSave } =
      await import("../../../../packages/api/src/eve/admin-memory/control");

    await expect(
      setEveAdminMemoryAutoSave({
        auth,
        category: "preference",
        enabled: false,
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      }),
    ).resolves.toBeUndefined();
    expect(rpc).toHaveBeenCalledWith(
      "set_eve_admin_memory_auto_save",
      expect.objectContaining({
        p_actor_profile_id: auth.profileId,
        p_tenant_id: auth.tenantId,
      }),
    );
  });

  it.each(barePiiCandidates)(
    "rejects a bare %s before calling the update RPC and keeps it out of audit evidence",
    async (_label, candidate) => {
      const rpc = vi.fn();
      const { updateEveAdminMemory } =
        await import("../../../../packages/api/src/eve/admin-memory/control");

      await expect(
        updateEveAdminMemory({
          auth,
          entryId: crypto.randomUUID(),
          expectedVersion: 1,
          category: "decision",
          title: "Contact detail",
          content: candidate,
          supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
        }),
      ).resolves.toEqual({
        stored: false,
        exclusions: ["customer_or_donor_pii"],
      });
      expect(rpc).not.toHaveBeenCalled();
      expectValueFreePiiAudit(candidate);
    },
  );

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
