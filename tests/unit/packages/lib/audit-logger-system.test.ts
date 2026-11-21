import { describe, expect, it, vi } from "vitest";

const { insertMock, fromMock, createAdminClientMock } = vi.hoisted(() => {
  const insert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn(() => ({ insert }));
  return {
    insertMock: insert,
    fromMock: from,
    createAdminClientMock: vi.fn(() => ({ from })),
  };
});

vi.mock("@asym/database/supabase/admin", () => ({
  createAdminClient: createAdminClientMock,
}));

import {
  createAuditLogger,
  logSystemAuditEvent,
} from "../../../../packages/lib/audit/logger";

describe("logSystemAuditEvent", () => {
  it("records a system audit event with a null actor", async () => {
    await logSystemAuditEvent({
      tenantId: "tenant-1",
      action: "email_send_suppressed",
      resourceType: "email_send",
      resourceId: "donation-1",
      details: { reason: "do_not_email", channel: "email" },
    });

    expect(fromMock).toHaveBeenCalledWith("audit_logs");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: "tenant-1",
        user_id: null,
        action: "email_send_suppressed",
        resource_type: "email_send",
        resource_id: "donation-1",
        details: { reason: "do_not_email", channel: "email" },
        ip_address: null,
        user_agent: null,
      }),
    );
  });

  const logger = createAuditLogger(
    {
      tenantId: "tenant-1",
      userId: "user-1",
      email: null,
      profileId: "profile-1",
      memberships: [],
      role: "admin",
      isAuthenticated: true,
    },
    new Request("https://example.test", {
      method: "POST",
      body: JSON.stringify({ userId: "other" }),
    }),
  );

  it("writes required events with the session actor, not a body identity", async () => {
    await logger.logRequired("create", "donation", "donation-1");

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user-1", action: "create" }),
    );
  });
  it("refuses a required event if storage fails without disclosing the database message", async () => {
    insertMock.mockResolvedValueOnce({ error: { message: "private note" } });
    await expect(
      logger.logRequired("crm_export_created", "crm_report"),
    ).rejects.toThrow(/^Audit write failed$/);
  });
});
