import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendEmailMock, readTenantEmailSettingsMock, decryptResendApiKeyMock } =
  vi.hoisted(() => ({
    sendEmailMock: vi.fn(),
    readTenantEmailSettingsMock: vi.fn(),
    decryptResendApiKeyMock: vi.fn(() => "re_decrypted"),
  }));

vi.mock("@asym/email", () => ({ sendEmail: sendEmailMock }));
vi.mock("../../../../../packages/api/src/email/settings-store", () => ({
  readTenantEmailSettings: readTenantEmailSettingsMock,
}));
vi.mock("../../../../../packages/api/src/email/crypto", () => ({
  decryptResendApiKey: decryptResendApiKeyMock,
}));
vi.mock("@asym/lib/audit/logger", () => ({
  logSystemAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

import { executeContributionActionFromBag as executeContributionAction } from "./contribution-operations-test-helpers";
import {
  DONATION_ID,
  freshState,
  stub,
  TENANT_ID,
} from "./contribution-receipt-stub";
import { resolveCorrectionApprovalPolicy } from "../../../../../packages/api/src/admin/contribution-operations/approval-policy";
import {
  applyContributionCorrection,
  loadContributionDetailFromSupabase,
} from "../../../../../packages/api/src/admin/contribution-operations/operations";

import type { State } from "./contribution-receipt-stub";
import type { ContributionActionType } from "../../../../../packages/api/src/admin/contribution-operations/types";

const DIFFERENT = /already used for a different correction/;

async function correctWith(
  state: State,
  options: {
    key: string;
    amount?: number;
    actionType?: ContributionActionType;
    choice?: "email" | "pdf";
    expectedRevision?: string;
  },
) {
  const actionType = options.actionType ?? "amount_correction";
  return applyContributionCorrection({
    supabaseAdmin: stub(state),
    tenantId: TENANT_ID,
    contributionId: DONATION_ID,
    actionType,
    payload: {
      ...(actionType === "amount_correction"
        ? { amount: options.amount ?? 20_000 }
        : { fundId: null }),
      receiptDelivery: { choice: options.choice ?? "email" },
    },
    reason: "data entry error",
    actorProfileId: "profile-1",
    sourceSurface: "contribution_hub",
    actorCapabilities: ["contributions.manage_receipts"],
    idempotencyKey: options.key,
    expectedRevision: options.expectedRevision,
  });
}

const committed = (
  key: string,
  values: Record<string, unknown>,
  type = "amount_correction",
) => ({
  id: "adj-1",
  tenant_id: TENANT_ID,
  donation_id: DONATION_ID,
  idempotency_key: key,
  status: "applied",
  adjustment_type: type,
  effective_values: values,
  created_at: "2026-06-01T00:00:00.000Z",
});

beforeEach(() => {
  sendEmailMock.mockReset();
  sendEmailMock.mockResolvedValue({
    success: true,
    messageId: "msg-updated",
    correlationId: "corr-updated",
    recipientCount: 1,
    retryCount: 0,
  });
  readTenantEmailSettingsMock.mockReset();
  readTenantEmailSettingsMock.mockResolvedValue({
    is_connected: true,
    resend_api_key_encrypted: "enc",
    default_from_email: "receipts@org.example",
    default_from_name: "Org",
    reply_to_email: null,
  });
  decryptResendApiKeyMock.mockReset();
  decryptResendApiKeyMock.mockReturnValue("re_decrypted");
});

describe("AL-2681 issue 2857 item 30: a key already used for a different correction is refused", () => {
  it("the same key with another amount, after the first committed and mailed: 409, and nothing is written or sent", async () => {
    const state = freshState(true);
    const first = await correctWith(state, { key: "key-30" });
    expect(first).toMatchObject({
      idempotentReplay: false,
      receiptOutcome: { status: "emailed" },
    });
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    await expect(
      correctWith(state, { key: "key-30", amount: 21_000 }),
    ).rejects.toMatchObject({
      status: 409,
      message: expect.stringMatching(DIFFERENT),
    });
    expect(state.adjustments).toHaveLength(1);
    expect(state.snapshots).toHaveLength(1);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });

  it("the same key with the same values replays the first correction and sends nothing more", async () => {
    const state = freshState(true);
    await correctWith(state, { key: "key-30-same" });
    const replay = await correctWith(state, { key: "key-30-same" });
    expect(replay).toMatchObject({
      idempotentReplay: true,
      adjustmentId: "adj-1",
      receiptOutcome: { status: "emailed", snapshotId: state.snapshots[0]!.id },
    });
    expect(state.adjustments).toHaveLength(1);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });

  it("the same key as a stored correction of another action type of this gift: 409, and nothing is written or sent", async () => {
    const state = freshState(true);
    state.adjustments.push(
      committed("key-30-type", { fundId: null }, "fund_correction"),
    );
    await expect(
      correctWith(state, { key: "key-30-type" }),
    ).rejects.toMatchObject({
      status: 409,
      message: expect.stringMatching(DIFFERENT),
    });
    expect(state.adjustments).toHaveLength(1);
    expect(state.snapshots).toEqual([]);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("on the raced path, a winner that committed another amount under the key: 409, and nothing is written or sent", async () => {
    const state: State = {
      ...freshState(true),
      winnerRow: committed("key-30-race", { amountCents: 21_000 }),
    };
    await expect(
      correctWith(state, { key: "key-30-race" }),
    ).rejects.toMatchObject({
      status: 409,
      message: expect.stringMatching(DIFFERENT),
    });
    expect(state.adjustments).toHaveLength(1);
    expect(state.snapshots).toEqual([]);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});

describe("AL-2681 issue 2857 item 32: a retry whose key commits between the key lookup and the revision check is replayed, not refused", () => {
  it("the key's first attempt commits after the lookup missed it: the retry, with the revision its first attempt was given, replays that correction", async () => {
    const state = freshState(true);
    const { revision } = await loadContributionDetailFromSupabase({
      supabaseAdmin: stub(state),
      tenantId: TENANT_ID,
      contributionId: DONATION_ID,
    });
    state.commitOnFirstKeyLookup = committed("key-32", { amountCents: 20_000 });
    const replay = await correctWith(state, {
      key: "key-32",
      choice: "pdf",
      expectedRevision: revision,
    });
    expect(replay).toMatchObject({
      idempotentReplay: true,
      adjustmentId: "adj-1",
    });
    expect(state.adjustments).toHaveLength(1);
  });

  it("the same race with other values under the key: 409 for a different correction, and nothing is written or sent", async () => {
    const state = freshState(true);
    const { revision } = await loadContributionDetailFromSupabase({
      supabaseAdmin: stub(state),
      tenantId: TENANT_ID,
      contributionId: DONATION_ID,
    });
    state.commitOnFirstKeyLookup = committed("key-32-other", {
      amountCents: 21_000,
    });
    await expect(
      correctWith(state, { key: "key-32-other", expectedRevision: revision }),
    ).rejects.toMatchObject({
      status: 409,
      message: expect.stringMatching(DIFFERENT),
    });
    expect(state.adjustments).toHaveLength(1);
    expect(state.snapshots).toEqual([]);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("guard: with no key, a moved revision is still 409 for a changed gift", async () => {
    const state = freshState(true);
    await expect(
      applyContributionCorrection({
        supabaseAdmin: stub(state),
        tenantId: TENANT_ID,
        contributionId: DONATION_ID,
        actionType: "amount_correction",
        payload: { amount: 20_000, receiptDelivery: { choice: "pdf" } },
        reason: "data entry error",
        actorProfileId: "profile-1",
        sourceSurface: "contribution_hub",
        actorCapabilities: ["contributions.manage_receipts"],
        expectedRevision: "a-revision-that-moved",
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: expect.stringMatching(/changed since you loaded it/),
    });
    expect(state.adjustments).toEqual([]);
  });
});

describe("AL-2681 issue 2857 item 33: on a replay, a receipt the consent gate suppressed reads blocked, not pending", () => {
  it("the donor's address is on the suppression list: the first answer is blocked, and the same-key replay is blocked too and sends nothing", async () => {
    const state: State = { ...freshState(true), suppressionTypes: ["bounce"] };
    const first = await correctWith(state, { key: "key-33" });
    expect(first.receiptOutcome).toMatchObject({ status: "blocked" });
    expect(state.stagedGift.receipt_status).toBe("suppressed");
    const replay = await correctWith(state, { key: "key-33" });
    expect(replay).toMatchObject({
      idempotentReplay: true,
      receiptOutcome: { status: "blocked", snapshotId: state.snapshots[0]!.id },
    });
    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(state.emailSendLogs).toEqual([]);
  });
});

describe("AL-2681 issue 2857 item 31: the direct correction's replay answer carries the receipt's state", () => {
  it("a replayed correction answers the receipt outcome its replay reported", async () => {
    const receiptOutcome = {
      status: "emailed" as const,
      reason: null,
      snapshotId: "snap-1",
      affectedFields: ["amount"],
      requested: { choice: "email" as const },
      confirmed: { choice: "email" as const },
    };
    const applyCorrection = vi.fn().mockResolvedValue({
      before: { amount: 1000 },
      after: { amount: 1200 },
      status: "applied",
      adjustmentId: "adj-1",
      idempotentReplay: true,
      receiptOutcome,
    });
    const result = await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: ["finance:manage_contributions"],
      sourceSurface: "contribution_hub",
      contributionId: "donation_1",
      actionType: "amount_correction",
      reason: "Corrected imported check amount",
      confirmationToken: "confirm",
      payload: { amount: 1200 },
      approvalPolicy: resolveCorrectionApprovalPolicy({
        ownership_mode: "no_approval_required",
        suppressed_gates: [],
        stronger_approval_categories: [],
      }),
      dependencies: {
        applyCorrection,
        createCorrectionRecord: vi.fn().mockResolvedValue("correction_1"),
        appendAuditEvent: vi.fn().mockResolvedValue("audit_1"),
        loadContributionDetail: vi.fn().mockResolvedValue({ id: "donation_1" }),
      },
    });
    expect(result).toMatchObject({
      idempotentReplay: true,
      adjustmentId: "adj-1",
      receiptOutcome,
    });
  });
});
