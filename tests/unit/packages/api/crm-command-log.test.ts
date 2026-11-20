import { describe, expect, it, vi } from "vitest";

import { logCrmCommand } from "../../../../packages/api/src/crm/commands/log";

const actor = {
  action: "crm.person.create",
  authTenantId: "tenant-1",
  isSuperAdmin: false,
  isTenantAdministrator: false,
  profileId: "profile-1",
  role: "staff",
  tenantId: "tenant-1",
  userId: "user-1",
} as const;

function createSupabaseRecorder() {
  const insertMock = vi.fn((payload: unknown) => ({
    select: vi.fn(() => ({
      single: vi.fn(async () => ({
        data: { id: "command-log-1", ...payload },
        error: null,
      })),
    })),
  }));

  return {
    insertMock,
    client: {
      from: vi.fn((table: string) => {
        expect(table).toBe("crm_command_logs");
        return {
          insert: insertMock,
        };
      }),
    },
  };
}

describe("CRM command log boundary", () => {
  it("logs audited commands with the Supabase actor and tenant", async () => {
    const { client, insertMock } = createSupabaseRecorder();

    const untrusted = {
      commandPayload: {
        title: "private note",
        content: { text: "restricted" },
        actor_user_id: "body actor",
      },
      resultSummary: { displayName: "restricted" },
      errorMessage: "private database detail",
    };
    await expect(
      logCrmCommand(client, {
        ...untrusted,
        actor,
        action: "crm.person.create",
        resourceType: "person",
        resourceId: "person-1",
        idempotencyKey: "cmd-1",
        status: "succeeded",
        requestId: "request-1",
      }),
    ).resolves.toMatchObject({
      ok: true,
      id: "command-log-1",
    });

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "crm.person.create",
        actor_profile_id: "profile-1",
        actor_user_id: "user-1",
        idempotency_key: "cmd-1",
        request_id: "request-1",
        resource_id: "person-1",
        resource_type: "person",
        status: "succeeded",
        tenant_id: "tenant-1",
      }),
    );
    expect(JSON.stringify(insertMock.mock.calls)).not.toMatch(
      /private|restricted|body actor/,
    );
  });
});
