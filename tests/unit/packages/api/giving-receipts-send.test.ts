import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  sendEmailMock,
  logSystemAuditEventMock,
  loadStagedGiftByIdMock,
  readTenantEmailSettingsMock,
  decryptResendApiKeyMock,
} = vi.hoisted(() => ({
  sendEmailMock: vi.fn(),
  logSystemAuditEventMock: vi.fn().mockResolvedValue(undefined),
  loadStagedGiftByIdMock: vi.fn(),
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
vi.mock("../../../../packages/api/src/email/settings-store", () => ({
  readTenantEmailSettings: readTenantEmailSettingsMock,
}));
vi.mock("../../../../packages/api/src/email/crypto", () => ({
  decryptResendApiKey: decryptResendApiKeyMock,
}));

import {
  sendStagedGiftReceipt,
  sendUpdatedReceiptSnapshotEmail,
} from "../../../../packages/api/src/giving/receipts";

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

const cleanDonor = {
  id: "donor-1",
  profile_id: null,
  name: "Ada Lovelace",
  email: "ada@example.com",
  do_not_email: false,
  do_not_contact: false,
};

/**
 * Chainable Supabase admin mock. The real consent gate runs against it (we do
 * not mock the consent module — path-based module mocks are unreliable in the
 * full suite). `donors` serves both the receipt identity lookup (`.single()`)
 * and the gate's consent lookup (`.limit().maybeSingle()`) from one row.
 */
function buildAdmin(options?: {
  donor?: Record<string, unknown> | null;
  suppressions?: Array<{ suppression_type: string }>;
}) {
  const donor = options?.donor === undefined ? cleanDonor : options.donor;
  const suppressions = options?.suppressions ?? [];

  const settle = (result: unknown) => {
    const settled = Promise.resolve(result);
    return {
      maybeSingle: vi.fn(() => settled),
      then: settled.then.bind(settled),
      catch: settled.catch.bind(settled),
      finally: settled.finally.bind(settled),
    };
  };

  const stagedGiftsUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const stagedGiftsUpdate = vi.fn(() => ({ eq: stagedGiftsUpdateEq }));

  const sendLogSingle = vi
    .fn()
    .mockResolvedValue({ data: { id: "log-1" }, error: null });
  const sendLogSelect = vi.fn(() => ({ single: sendLogSingle }));
  const sendLogInsert = vi.fn(() => ({ select: sendLogSelect }));

  const from = vi.fn((table: string) => {
    if (table === "donors") {
      const chain: Record<string, unknown> = {};
      chain.select = vi.fn(() => chain);
      chain.eq = vi.fn(() => chain);
      chain.single = vi.fn(() => Promise.resolve({ data: donor, error: null }));
      chain.limit = vi.fn(() => settle({ data: donor, error: null }));
      return chain;
    }
    if (table === "email_suppressions") {
      const chain: Record<string, unknown> = {};
      chain.select = vi.fn(() => chain);
      chain.eq = vi.fn(() => chain);
      chain.ilike = vi.fn(() => chain);
      chain.limit = vi.fn(() => settle({ data: suppressions, error: null }));
      return chain;
    }
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
  beforeEach(() => {
    sendEmailMock.mockReset();
    logSystemAuditEventMock.mockReset();
    logSystemAuditEventMock.mockResolvedValue(undefined);
    loadStagedGiftByIdMock.mockReset();
    readTenantEmailSettingsMock.mockReset();
    decryptResendApiKeyMock.mockReset();
    decryptResendApiKeyMock.mockReturnValue("re_decrypted");
  });

  it("skips a do_not_contact donor as a transactional message and records an audit event", async () => {
    loadStagedGiftByIdMock.mockResolvedValue(gift);
    readTenantEmailSettingsMock.mockResolvedValue(connectedSettings);
    const admin = buildAdmin({
      donor: { ...cleanDonor, do_not_contact: true },
    });

    const result = await sendStagedGiftReceipt({
      supabaseAdmin: admin.client,
      tenantId: "tenant-1",
      stagedGiftId: "staged-gift-1",
    });

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
    const admin = buildAdmin({
      suppressions: [{ suppression_type: "bounce" }],
    });

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

  it("sends updated receipt snapshots with corrected content and a snapshot idempotency key", async () => {
    loadStagedGiftByIdMock.mockResolvedValue({
      ...gift,
      amount: 2500,
    });
    readTenantEmailSettingsMock.mockResolvedValue(connectedSettings);
    sendEmailMock.mockResolvedValue({
      success: true,
      messageId: "msg-updated",
      correlationId: "corr-updated",
      recipientCount: 1,
      retryCount: 0,
    });
    const admin = buildAdmin();

    const result = await sendUpdatedReceiptSnapshotEmail({
      supabaseAdmin: admin.client,
      tenantId: "tenant-1",
      stagedGiftId: "staged-gift-1",
      snapshotId: "snapshot-1",
      content: {
        version: 1,
        donationId: "donation-1",
        donorName: "Ada Lovelace",
        giftDate: "2026-05-12",
        currencyCode: "USD",
        effective: {
          amountCents: 2000,
          fundId: null,
          missionaryId: null,
          paymentStatus: "completed",
        },
        designationLines: [
          {
            id: "line-1",
            amountCents: 2000,
            fundId: null,
            fundName: "General Fund",
            missionaryId: null,
            missionaryName: null,
            memo: null,
          },
        ],
        affectedFields: ["amount"],
        adjustmentId: "adjustment-1",
        generatedAt: "2026-05-13T00:00:00.000Z",
      },
    });

    expect(sendEmailMock).toHaveBeenCalledWith(
      "re_decrypted",
      expect.objectContaining({
        subject: "Updated donation receipt for $20.00",
        html: expect.stringContaining("updated receipt amount"),
        text: expect.stringContaining("updated receipt amount is $20.00"),
        idempotencyKey:
          "contribution-receipt-snapshot/tenant-1/snapshot-1/email",
        customArgs: expect.objectContaining({
          source: "updated_donation_receipt",
          receiptSnapshotId: "snapshot-1",
          adjustmentId: "adjustment-1",
        }),
      }),
    );
    expect(sendEmailMock.mock.calls[0]?.[1].idempotencyKey).not.toBe(
      "donation-receipt/tenant-1/donation-1/staged-gift-1",
    );
    expect(admin.sendLogInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotency_key:
          "contribution-receipt-snapshot/tenant-1/snapshot-1/email",
        metadata: expect.objectContaining({
          source: "updated_donation_receipt",
          receiptSnapshotId: "snapshot-1",
        }),
        status: "sent",
        tenant_id: "tenant-1",
      }),
    );
    expect(result).toEqual({ sendLogId: "log-1", status: "sent" });
  });
});
