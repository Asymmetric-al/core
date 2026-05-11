import { describe, expect, it, vi } from "vitest";

import { logCrmCommand } from "../../../../packages/api/src/crm/commands/log";

const actor = {
  action: "crm.person.create",
  authTenantId: "tenant-1",
  isSuperAdmin: false,
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

    await expect(
      logCrmCommand(client, {
        actor,
        action: "crm.person.create",
        resourceType: "person",
        resourceId: "person-1",
        idempotencyKey: "cmd-1",
        status: "succeeded",
        requestId: "request-1",
        commandPayload: {
          email: "ada@example.test",
          apiKey: "secret-api-key",
          nested: {
            webhookSecret: "secret-webhook",
          },
        },
        resultSummary: {
          twentyId: "twenty-person-1",
        },
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
    expect(insertMock.mock.calls[0]?.[0]).toMatchObject({
      command_payload: {
        email: "ada@example.test",
        apiKey: "[redacted]",
        nested: {
          webhookSecret: "[redacted]",
        },
      },
      result_summary: {
        twentyId: "twenty-person-1",
      },
    });
  });
});
