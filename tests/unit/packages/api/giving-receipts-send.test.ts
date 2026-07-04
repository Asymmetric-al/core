import { describe, expect, it, vi } from "vitest";

const {
  sendEmailMock,
  logSystemAuditEventMock,
  loadStagedGiftByIdMock,
  evaluateEmailConsentMock,
  readTenantEmailSettingsMock,
  decryptResendApiKeyMock,
} = vi.hoisted(() => ({
  sendEmailMock: vi.fn(),
  logSystemAuditEventMock: vi.fn().mockResolvedValue(undefined),
  loadStagedGiftByIdMock: vi.fn(),
  evaluateEmailConsentMock: vi.fn(),
  readTenantEmailSettingsMock: vi.fn(),
  decryptResendApiKeyMock: vi.fn(() => "re_decrypted"),
}));

vi.mock("@asym/email", () => ({ sendEmail: sendEmailMock }));
vi.mock("@asym/lib/audit/logger", () => ({
  logSystemAuditEvent: logSystemAuditEventMock,
}));
vi.mock("../../../../packages/api/src/giving/staged-gifts", () => ({
  loadStagedGiftById: loadStagedGiftByIdMock,
}));
vi.mock("../../../../packages/api/src/email/consent", () => ({
  evaluateEmailConsent: evaluateEmailConsentMock,
}));
vi.mock("../../../../packages/api/src/email/settings-store", () => ({
  readTenantEmailSettings: readTenantEmailSettingsMock,
}));
vi.mock("../../../../packages/api/src/email/crypto", () => ({
  decryptResendApiKey: decryptResendApiKeyMock,
}));

import { sendStagedGiftReceipt } from "../../../../packages/api/src/giving/receipts";

const gift = {
  id: "staged-gift-1",
  tenantId: "tenant-1",
  donationId: "donation-1",
  donorId: "donor-1",
  amount: 2500,
  currency: "usd",
};

const connectedSettings = {
  is_connected: true,
  resend_api_key_encrypted: "enc",
  default_from_email: "receipts@org.example",
  default_from_name: "Org",
  reply_to_email: null,
};

function buildAdmin() {
  const stagedGiftsUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const stagedGiftsUpdate = vi.fn(() => ({ eq: stagedGiftsUpdateEq }));

  const donorSingle = vi.fn().mockResolvedValue({
    data: {
      id: "donor-1",
      profile_id: null,
      name: "Ada Lovelace",
      email: "ada@example.com",
    },
    error: null,
  });
  const donorEq = vi.fn(() => ({ single: donorSingle }));
  const donorSelect = vi.fn(() => ({ eq: donorEq }));

  const sendLogSingle = vi
    .fn()
    .mockResolvedValue({ data: { id: "log-1" }, error: null });
  const sendLogSelect = vi.fn(() => ({ single: sendLogSingle }));
  const sendLogInsert = vi.fn(() => ({ select: sendLogSelect }));

  const from = vi.fn((table: string) => {
    if (table === "donors") return { select: donorSelect };
    if (table === "staged_gifts") return { update: stagedGiftsUpdate };
    if (table === "email_send_logs") return { insert: sendLogInsert };
    throw new Error(`Unexpected table: ${table}`);
  });

  return {
    client: { from } as never,
    stagedGiftsUpdate,
    sendLogInsert,
  };
}

describe("sendStagedGiftReceipt consent gate", () => {
  it("evaluates consent as a transactional message and skips a do_not_contact donor", async () => {
    loadStagedGiftByIdMock.mockResolvedValue(gift);
    readTenantEmailSettingsMock.mockResolvedValue(connectedSettings);
    evaluateEmailConsentMock.mockResolvedValue({
      allowed: false,
      reason: "do_not_contact",
    });
    const admin = buildAdmin();

    const result = await sendStagedGiftReceipt({
      supabaseAdmin: admin.client,
      tenantId: "tenant-1",
      stagedGiftId: "staged-gift-1",
    });

    expect(evaluateEmailConsentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        supabaseAdmin: admin.client,
        tenantId: "tenant-1",
        email: "ada@example.com",
        donorId: "donor-1",
        messageType: "transactional",
      }),
    );
    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(admin.sendLogInsert).not.toHaveBeenCalled();
    expect(logSystemAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "email_send_suppressed",
        resourceType: "email_send",
        resourceId: "donation-1",
        details: expect.objectContaining({
          source: "donation_receipt",
          channel: "email",
          reason: "do_not_contact",
          donorId: "donor-1",
          stagedGiftId: "staged-gift-1",
          recipientEmail: "ada@example.com",
        }),
      }),
    );
    expect(admin.stagedGiftsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        receipt_status: "suppressed",
        receipt_send_log_id: null,
        last_error_code: "do_not_contact",
      }),
    );
    expect(result).toEqual({ sendLogId: null, status: "suppressed" });
  });

  it("skips the send for a suppressed address and records the suppression type", async () => {
    loadStagedGiftByIdMock.mockResolvedValue(gift);
    readTenantEmailSettingsMock.mockResolvedValue(connectedSettings);
    evaluateEmailConsentMock.mockResolvedValue({
      allowed: false,
      reason: "suppressed",
      suppressionType: "bounce",
    });
    const admin = buildAdmin();

    const result = await sendStagedGiftReceipt({
      supabaseAdmin: admin.client,
      tenantId: "tenant-1",
      stagedGiftId: "staged-gift-1",
    });

    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(logSystemAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "email_send_suppressed",
        details: expect.objectContaining({
          reason: "suppressed",
          suppressionType: "bounce",
        }),
      }),
    );
    expect(result).toEqual({ sendLogId: null, status: "suppressed" });
  });

  it("proceeds with a normal send when consent allows it", async () => {
    loadStagedGiftByIdMock.mockResolvedValue(gift);
    readTenantEmailSettingsMock.mockResolvedValue(connectedSettings);
    evaluateEmailConsentMock.mockResolvedValue({ allowed: true });
    sendEmailMock.mockResolvedValue({
      success: true,
      messageId: "msg-1",
      correlationId: "corr-1",
      recipientCount: 1,
      retryCount: 0,
    });
    const admin = buildAdmin();

    const result = await sendStagedGiftReceipt({
      supabaseAdmin: admin.client,
      tenantId: "tenant-1",
      stagedGiftId: "staged-gift-1",
    });

    expect(sendEmailMock).toHaveBeenCalledWith(
      "re_decrypted",
      expect.objectContaining({
        to: { email: "ada@example.com", name: "Ada Lovelace" },
        idempotencyKey: "donation-receipt/tenant-1/donation-1/staged-gift-1",
      }),
    );
    expect(logSystemAuditEventMock).not.toHaveBeenCalled();
    expect(admin.sendLogInsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "sent", tenant_id: "tenant-1" }),
    );
    expect(admin.stagedGiftsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ receipt_status: "sent" }),
    );
    expect(result).toEqual({ sendLogId: "log-1", status: "sent" });
  });
});
