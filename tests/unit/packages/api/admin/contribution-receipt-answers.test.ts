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
const { auditMock } = vi.hoisted(() => ({
  auditMock: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@asym/lib/audit/logger", () => ({
  logSystemAuditEvent: auditMock,
}));

import { executeContributionActionFromBag as executeContributionAction } from "./contribution-operations-test-helpers";
import {
  DONATION_ID,
  freshState,
  stub,
  TABLE_RULES,
  TENANT_ID,
} from "./contribution-receipt-stub";
import { applyContributionCorrection } from "../../../../../packages/api/src/admin/contribution-operations/operations";
import { sendStagedGiftReceipt } from "../../../../../packages/api/src/giving/receipts";

import type { Row, State } from "./contribution-receipt-stub";
import type { ContributionActionType } from "../../../../../packages/api/src/admin/contribution-operations/types";

const RECEIPT_KEY = `donation-receipt/${TENANT_ID}/${DONATION_ID}/staged-1`;

const providerDown = {
  success: false,
  messageId: null,
  correlationId: "corr-failed",
  recipientCount: 0,
  retryCount: 0,
  errors: [{ code: "provider_down", message: "The provider is down." }],
};

const delivered = {
  success: true,
  messageId: "msg-updated",
  correlationId: "corr-updated",
  recipientCount: 1,
  retryCount: 0,
};

const sentRow = (key: string, metadata: Row = {}): Row => ({
  id: "send-log-1",
  tenant_id: TENANT_ID,
  idempotency_key: key,
  correlation_id: "corr-first",
  status: "sent",
  resend_message_id: "msg-first",
  recipient_count: 1,
  message_type: "transactional",
  requested_at: "2026-05-01T00:00:00.000Z",
  sent_at: "2026-05-01T00:00:01.000Z",
  error_code: null,
  error_message: null,
  retry_count: 0,
  metadata,
});

async function correctWith(
  state: State,
  options: {
    key: string;
    choice?: "email" | "pdf" | "none";
    actionType?: ContributionActionType;
    amount?: number;
    expectedRevision?: string;
  },
) {
  const choice = options.choice ?? "email";
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
      ...(choice === "none" ? {} : { receiptDelivery: { choice } }),
    },
    reason: "data entry error",
    actorProfileId: "profile-1",
    sourceSurface: "contribution_hub",
    actorCapabilities: ["contributions.manage_receipts"],
    idempotencyKey: options.key,
    expectedRevision: options.expectedRevision,
  });
}

async function failedFirstSend(state: State, key: string) {
  sendEmailMock.mockResolvedValueOnce(providerDown);
  const first = await correctWith(state, { key });
  expect(first.receiptOutcome).toMatchObject({ status: "failed" });
}

function gateOnce(state: State, table: string, status: string) {
  let release!: () => void;
  let reached!: () => void;
  const atGate = new Promise<void>((resolve) => {
    reached = resolve;
  });
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let used = false;
  state.writeGate = async (written, _operation, payload) => {
    const value =
      table === "staged_gifts" ? payload.receipt_status : payload.status;
    if (used || written !== table || value !== status) return;
    used = true;
    reached();
    await held;
  };
  return { atGate, release };
}

beforeEach(() => {
  sendEmailMock.mockReset();
  sendEmailMock.mockResolvedValue(delivered);
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
  auditMock.mockClear();
});

describe("AL-2681 issue 2857 item 41: the re-send action answers this attempt's own result", () => {
  it("a re-send the provider refuses, on a gift whose row reads sent: the answer and the audit say failed; the row and the gift still read sent", async () => {
    const state = freshState(false);
    state.emailSendLogs = [sentRow(RECEIPT_KEY)];
    state.stagedGift.receipt_send_log_id = "send-log-1";
    sendEmailMock.mockResolvedValueOnce(providerDown);
    const appendAuditEvent = vi.fn().mockResolvedValue("audit-1");
    const result = await executeContributionAction({
      tenantId: TENANT_ID,
      actorProfileId: "profile-1",
      actorPermissions: ["finance:manage_contributions"],
      sourceSurface: "contribution_hub",
      contributionId: DONATION_ID,
      actionType: "resend_receipt",
      reason: "The donor asked for the receipt again",
      confirmationToken: "confirm",
      payload: { stagedGiftId: "staged-1" },
      dependencies: {
        sendReceipt: ({ tenantId, stagedGiftId }) =>
          sendStagedGiftReceipt({
            supabaseAdmin: stub(state),
            tenantId,
            stagedGiftId,
          }),
        appendAuditEvent,
        loadContributionDetail: vi.fn().mockResolvedValue({
          id: DONATION_ID,
          stagedGift: { id: "staged-1" },
        }),
      },
    });
    expect(result.providerOutcome).toMatchObject({ status: "failed" });
    expect(appendAuditEvent).toHaveBeenCalledTimes(1);
    expect(appendAuditEvent.mock.calls[0]![0]).toMatchObject({
      providerOutcome: { status: "failed" },
      downstreamEffects: { receiptStatus: "failed" },
    });
    expect(state.emailSendLogs).toEqual([sentRow(RECEIPT_KEY)]);
    expect(state.stagedGift).toMatchObject({
      receipt_status: "sent",
      receipt_send_log_id: "send-log-1",
    });
  });

  it("a re-send that goes through on a gift whose earlier attempt failed answers sent and moves the row and the gift to sent (guard)", async () => {
    const state = freshState(false);
    state.emailSendLogs = [
      { ...sentRow(RECEIPT_KEY), status: "failed", sent_at: null },
    ];
    state.stagedGift.receipt_status = "failed";
    const answer = await sendStagedGiftReceipt({
      supabaseAdmin: stub(state),
      tenantId: TENANT_ID,
      stagedGiftId: "staged-1",
    });
    expect(answer).toEqual({ sendLogId: "send-log-1", status: "sent" });
    expect(state.emailSendLogs[0]).toMatchObject({ status: "sent" });
    expect(state.stagedGift.receipt_status).toBe("sent");
  });
});

describe("AL-2681 issue 2857 item 42: the gift's receipt status never moves back from a row that reads sent", () => {
  it("two same-key retries after a failed send, the failing one writing the gift last: the gift reads sent and that requester is told emailed", async () => {
    const state = freshState(true);
    await failedFirstSend(state, "key-42-fail-last");
    const gate = gateOnce(state, "staged_gifts", "failed");
    sendEmailMock.mockResolvedValueOnce(providerDown);
    const losing = correctWith(state, { key: "key-42-fail-last" });
    await gate.atGate;
    const winning = await correctWith(state, { key: "key-42-fail-last" });
    gate.release();
    const lost = await losing;
    expect(winning.receiptOutcome).toMatchObject({ status: "emailed" });
    expect(lost.receiptOutcome).toMatchObject({ status: "emailed" });
    expect(state.emailSendLogs.map((row) => row.status)).toEqual(["sent"]);
    expect(state.stagedGift).toMatchObject({
      receipt_status: "sent",
      receipt_send_log_id: state.emailSendLogs[0]!.id,
    });
  });

  it("two same-key retries, the failing one writing its row after the other's mail went: the row and the gift read sent and that requester is told emailed (guard)", async () => {
    const state = freshState(true);
    await failedFirstSend(state, "key-42-fail-row-after");
    const gate = gateOnce(state, "email_send_logs", "failed");
    sendEmailMock.mockResolvedValueOnce(providerDown);
    const losing = correctWith(state, { key: "key-42-fail-row-after" });
    await gate.atGate;
    const winning = await correctWith(state, { key: "key-42-fail-row-after" });
    gate.release();
    const lost = await losing;
    expect(winning.receiptOutcome).toMatchObject({ status: "emailed" });
    expect(lost.receiptOutcome).toMatchObject({ status: "emailed" });
    expect(state.emailSendLogs.map((row) => row.status)).toEqual(["sent"]);
    expect(state.stagedGift.receipt_status).toBe("sent");
  });

  it("two same-key retries, the one the consent gate refuses writing the gift last: the gift reads sent and that requester is told emailed", async () => {
    const state = freshState(true);
    await failedFirstSend(state, "key-42-refuse-last");
    let releaseSend!: () => void;
    let sendReached!: () => void;
    const atSend = new Promise<void>((resolve) => {
      sendReached = resolve;
    });
    const sendHeld = new Promise<void>((resolve) => {
      releaseSend = resolve;
    });
    sendEmailMock.mockImplementationOnce(async () => {
      sendReached();
      await sendHeld;
      return delivered;
    });
    const winningRun = correctWith(state, { key: "key-42-refuse-last" });
    await atSend;
    const gate = gateOnce(state, "staged_gifts", "suppressed");
    state.suppressionTypes = ["bounce"];
    const losing = correctWith(state, { key: "key-42-refuse-last" });
    await gate.atGate;
    releaseSend();
    const winning = await winningRun;
    gate.release();
    const lost = await losing;
    expect(winning.receiptOutcome).toMatchObject({ status: "emailed" });
    expect(lost.receiptOutcome).toMatchObject({ status: "emailed" });
    expect(state.emailSendLogs.map((row) => row.status)).toEqual(["sent"]);
    expect(state.stagedGift).toMatchObject({
      receipt_status: "sent",
      receipt_send_log_id: state.emailSendLogs[0]!.id,
    });
  });

  it("two same-key retries, the refused one writing its row after the other's mail went: the gift keeps sent and its send-log link, and that requester is told emailed", async () => {
    const state = freshState(true);
    await failedFirstSend(state, "key-42-refuse-row-after");
    const gate = gateOnce(state, "email_send_logs", "suppressed");
    state.suppressionTypes = ["bounce"];
    const losing = correctWith(state, { key: "key-42-refuse-row-after" });
    await gate.atGate;
    state.suppressionTypes = [];
    const winning = await correctWith(state, {
      key: "key-42-refuse-row-after",
    });
    gate.release();
    const lost = await losing;
    expect(winning.receiptOutcome).toMatchObject({ status: "emailed" });
    expect(lost.receiptOutcome).toMatchObject({ status: "emailed" });
    expect(state.emailSendLogs.map((row) => row.status)).toEqual(["sent"]);
    expect(state.stagedGift).toMatchObject({
      receipt_status: "sent",
      receipt_send_log_id: state.emailSendLogs[0]!.id,
    });
  });
});

const BOUNCED =
  "The updated receipt email was not delivered: it bounced, was reported as spam, or the mail provider is blocking this address. Check the donor's email address.";

async function mailedThenMarked(state: State, key: string, status: string) {
  await correctWith(state, { key });
  const row = state.emailSendLogs[0]!;
  row.status = status;
  row.error_code = status === "bounced" ? "email.bounced" : null;
  const before = structuredClone(state.emailSendLogs);
  const gift = structuredClone(state.stagedGift);
  sendEmailMock.mockClear();
  return { before, gift };
}

describe("AL-2681 issue 2857 item 43: a receipt that went out and bounced is answered truthfully and is not sent again from a replay", () => {
  it.each([
    ["no e-mail choice", "none"],
    ["e-mail", "email"],
  ] as const)(
    "a replay with %s of a snapshot whose row reads bounced: answers bounced in the ruled words (not delivered), sends nothing and writes nothing",
    async (_label, choice) => {
      const state = freshState(true);
      const { before, gift } = await mailedThenMarked(
        state,
        `key-43-${choice}`,
        "bounced",
      );
      const replay = await correctWith(state, {
        key: `key-43-${choice}`,
        choice,
      });
      expect(replay.receiptOutcome).toMatchObject({
        status: "bounced",
        reason: BOUNCED,
        snapshotId: state.snapshots[0]!.id,
      });
      expect(replay.receiptOutcome?.reason).not.toMatch(/not sent/i);
      expect(sendEmailMock).not.toHaveBeenCalled();
      expect(state.emailSendLogs).toEqual(before);
      expect(state.stagedGift).toEqual(gift);
    },
  );

  it.each([
    ["sent", "none", "emailed", 0],
    ["sent", "email", "emailed", 0],
    ["suppressed", "none", "blocked", 0],
    ["suppressed", "email", "blocked", 0],
    ["failed", "none", "failed", 0],
    ["failed", "email", "emailed", 1],
    ["bounced", "none", "bounced", 0],
    ["bounced", "email", "bounced", 0],
  ] as const)(
    "every status the send log holds has its answer: %s, replay with %s, answers %s and mails %i",
    async (status, choice, answer, mails) => {
      const state = freshState(true);
      await mailedThenMarked(state, `key-43-${status}-${choice}`, status);
      const replay = await correctWith(state, {
        key: `key-43-${status}-${choice}`,
        choice,
      });
      expect(replay.receiptOutcome).toMatchObject({ status: answer });
      expect(sendEmailMock).toHaveBeenCalledTimes(mails);
    },
  );

  it.each([
    ["none", "failed", 0],
    ["email", "emailed", 1],
  ] as const)(
    "pending past the in-flight window: a replay with %s answers %s and mails %i, as a send with no row does",
    async (choice, answer, mails) => {
      const state = freshState(true);
      await mailedThenMarked(state, `key-43-stale-${choice}`, "pending");
      state.snapshots[0]!.created_at = "2026-01-01T00:00:00.000Z";
      const replay = await correctWith(state, {
        key: `key-43-stale-${choice}`,
        choice,
      });
      expect(replay.receiptOutcome).toMatchObject({ status: answer });
      expect(sendEmailMock).toHaveBeenCalledTimes(mails);
    },
  );

  it.each([
    ["none", "pending"],
    ["email", "pending"],
  ] as const)(
    "pending, the column's default, is a send whose outcome is not recorded: a replay with %s inside the in-flight window answers %s and mails nothing",
    async (choice, answer) => {
      const state = freshState(true);
      await mailedThenMarked(state, `key-43-pending-${choice}`, "pending");
      state.snapshots[0]!.created_at = new Date().toISOString();
      const replay = await correctWith(state, {
        key: `key-43-pending-${choice}`,
        choice,
      });
      expect(replay.receiptOutcome).toMatchObject({ status: answer });
      expect(sendEmailMock).not.toHaveBeenCalled();
    },
  );
});

describe("AL-2681 issue 2857 item 44: four guards", () => {
  it("a PDF first, then the key with e-mail: the PDF is answered, nothing is mailed and no second snapshot is sealed", async () => {
    const state = freshState(true);
    const first = await correctWith(state, {
      key: "key-44-pdf",
      choice: "pdf",
    });
    expect(first.receiptOutcome).toMatchObject({ status: "pdf_generated" });
    const again = await correctWith(state, {
      key: "key-44-pdf",
      choice: "email",
    });
    expect(again.receiptOutcome).toMatchObject({
      status: "pdf_generated",
      snapshotId: state.snapshots[0]!.id,
    });
    expect(state.snapshots).toHaveLength(1);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("a receipt mailed, then a later correction of the gift, then the first key again: emailed with its own snapshot, not superseded", async () => {
    const state = freshState(true);
    await correctWith(state, { key: "key-44-first" });
    const own = state.snapshots[0]!.id;
    await correctWith(state, { key: "key-44-later", amount: 18_000 });
    const again = await correctWith(state, { key: "key-44-first" });
    expect(again.receiptOutcome).toMatchObject({
      status: "emailed",
      snapshotId: own,
    });
    expect(sendEmailMock).toHaveBeenCalledTimes(2);
  });

  it("a fund correction's key used for a designation correction with the same fund: refused 409 on the action type alone", async () => {
    const state = freshState(true);
    await correctWith(state, {
      key: "key-44-type",
      actionType: "fund_correction",
      choice: "pdf",
    });
    await expect(
      correctWith(state, {
        key: "key-44-type",
        actionType: "designation_correction",
        choice: "pdf",
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: expect.stringMatching(/already used for a different correction/),
    });
  });

  it("the send log's update after a failed attempt does not touch a row that reads sent", async () => {
    const state = freshState(false);
    state.emailSendLogs = [sentRow(RECEIPT_KEY)];
    sendEmailMock.mockResolvedValueOnce(providerDown);
    await sendStagedGiftReceipt({
      supabaseAdmin: stub(state),
      tenantId: TENANT_ID,
      stagedGiftId: "staged-1",
    });
    expect(state.emailSendLogs).toEqual([sentRow(RECEIPT_KEY)]);
  });
});

describe("AL-2681 issue 2857 item 45: the replay's delivery check and the stub's rules", () => {
  it("the replay checks the donor of the detail it acts on: the key's correction commits on the second lookup and the gift's donor then opts out of email: blocked, nothing mailed", async () => {
    const state = freshState(true);
    const { loadContributionDetailFromSupabase } =
      await import("../../../../../packages/api/src/admin/contribution-operations/operations");
    const { revision } = await loadContributionDetailFromSupabase({
      supabaseAdmin: stub(state),
      tenantId: TENANT_ID,
      contributionId: DONATION_ID,
    });
    state.stagedGift.review_reason = "an unrelated change";
    state.commitOnSecondKeyLookup = {
      id: "adj-1",
      tenant_id: TENANT_ID,
      donation_id: DONATION_ID,
      idempotency_key: "key-45-donor",
      status: "applied",
      adjustment_type: "amount_correction",
      effective_values: { amountCents: 20_000 },
      created_at: "2026-06-01T00:00:00.000Z",
    };
    state.donorRows = {
      "donor-2": {
        id: "donor-2",
        profile_id: null,
        name: "Grace Hopper",
        email: "grace@example.com",
        do_not_email: true,
        do_not_contact: false,
      },
    };
    state.onSecondKeyLookup = () => {
      state.currentDonorId = "donor-2";
    };
    const replay = await correctWith(state, {
      key: "key-45-donor",
      expectedRevision: revision,
    });
    expect(replay).toMatchObject({
      idempotentReplay: true,
      receiptOutcome: { status: "blocked" },
    });
    expect(replay.receiptOutcome?.reason).toMatch(/opted out of email/i);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("the stub refuses a NULL in a NOT NULL column and a second row of a unique key, as the tables do", async () => {
    const client = stub(freshState(false)) as unknown as {
      from: (table: string) => {
        insert: (row: Row) => PromiseLike<{ error: { code?: string } | null }>;
        update: (row: Row) => {
          eq: (
            c: string,
            v: unknown,
          ) => PromiseLike<{
            error: { code?: string } | null;
          }>;
        };
      };
    };
    const row = { ...sentRow("key-45-stub"), id: undefined };
    expect((await client.from("email_send_logs").insert(row)).error).toBeNull();
    expect(
      (await client.from("email_send_logs").insert(row)).error,
    ).toMatchObject({ code: "23505" });
    for (const column of TABLE_RULES.email_send_logs!.required)
      expect(
        (
          await client
            .from("email_send_logs")
            .insert({ ...row, idempotency_key: `k-${column}`, [column]: null })
        ).error,
        column,
      ).toMatchObject({ code: "23502" });
    expect(
      (
        await client
          .from("staged_gifts")
          .update({ receipt_status: null })
          .eq("id", "staged-1")
      ).error,
    ).toMatchObject({ code: "23502" });
  });
});

const STORED: Record<string, (state: State) => Row[]> = {
  email_send_logs: (state) => state.emailSendLogs,
  contribution_receipt_snapshots: (state) => state.snapshots,
  contribution_adjustments: (state) => state.adjustments,
};

function filled(table: string, key: string[], value: string): Row {
  const rules = TABLE_RULES[table]!;
  const row: Row = {};
  for (const column of new Set([...rules.required, ...rules.notNull])) {
    if (column === "id" || column === "created_at") continue;
    row[column] = ["metadata", "content", "effective_values"].includes(column)
      ? {}
      : ["recipient_count", "retry_count"].includes(column)
        ? 0
        : `${column}-x`;
  }
  for (const column of key) row[column] = `${column}-${value}`;
  return row;
}

describe("AL-2681 A2 fix round Z6: the stub refuses what the tables refuse, from TABLE_RULES", () => {
  const cases = Object.entries(TABLE_RULES)
    .filter(([table]) => table in STORED)
    .flatMap(([table, rules]) =>
      rules.unique.map((key) => [table, key] as [string, string[]]),
    );

  it.each(cases)(
    "%s: a second row of the unique key %j is refused 23505, by insert and by update",
    async (table, key) => {
      const state = freshState(false);
      const db = stub(state);
      const first = await db
        .from(table)
        .insert(filled(table, key, "a"))
        .select("id")
        .single();
      expect(first.error).toBeNull();
      const twin = await db
        .from(table)
        .insert(filled(table, key, "a"))
        .select("id")
        .single();
      expect(twin.error?.code).toBe("23505");
      const other = await db
        .from(table)
        .insert(filled(table, key, "b"))
        .select("id")
        .single();
      expect(other.error).toBeNull();
      const moved = await db
        .from(table)
        .update(
          Object.fromEntries(key.map((column) => [column, `${column}-a`])),
        )
        .eq(key[0]!, `${key[0]}-b`);
      expect(moved.error?.code).toBe("23505");
      expect(STORED[table]!(state)).toHaveLength(2);
    },
  );

  it("a send-log row inserted without a status takes the column's default, pending", async () => {
    const state = freshState(false);
    const row = filled(
      "email_send_logs",
      ["tenant_id", "idempotency_key"],
      "a",
    );
    delete row.status;
    const inserted = await stub(state)
      .from("email_send_logs")
      .insert(row)
      .select("id, status")
      .single();
    expect(inserted.error).toBeNull();
    expect(inserted.data).toMatchObject({ status: "pending" });
    expect(state.emailSendLogs[0]).toMatchObject({ status: "pending" });
  });

  it("a staged-gift update whose filters match no row changes nothing", async () => {
    const state = freshState(false);
    const result = await stub(state)
      .from("staged_gifts")
      .update({ receipt_status: "failed" })
      .eq("id", "staged-1")
      .neq("receipt_status", "sent");
    expect(result.error).toBeNull();
    expect(state.stagedGift.receipt_status).toBe("sent");
  });
});

const UNRECOGNIZED =
  "This receipt's delivery is recorded in a state this screen does not know, so this action sent nothing. Check the email send log for this correction before you try again.";

function giftReceiptHistory(state: State) {
  const history: unknown[] = [];
  let value = state.stagedGift.receipt_status;
  Object.defineProperty(state.stagedGift, "receipt_status", {
    get: () => value,
    set: (next) => {
      history.push(next);
      value = next;
    },
    enumerable: true,
    configurable: true,
  });
  return history;
}

describe("AL-2681 A2 fix round Z1: a row that reads bounced or complained is as final as one that reads sent", () => {
  it("a retry that read failed fails while the webhook writes bounced: the row keeps the bounce, the gift follows the row, the replay answers bounced, and a later replay sends nothing", async () => {
    const state = freshState(true);
    await failedFirstSend(state, "key-z1-fail");
    sendEmailMock.mockImplementationOnce(async () => {
      Object.assign(state.emailSendLogs[0]!, {
        status: "bounced",
        resend_message_id: "msg-bounced",
        error_code: "email.bounced",
      });
      return providerDown;
    });
    const replay = await correctWith(state, { key: "key-z1-fail" });
    expect(replay.receiptOutcome).toMatchObject({
      status: "bounced",
      reason: BOUNCED,
    });
    expect(state.emailSendLogs).toHaveLength(1);
    expect(state.emailSendLogs[0]).toMatchObject({
      status: "bounced",
      resend_message_id: "msg-bounced",
      error_code: "email.bounced",
    });
    expect(state.stagedGift).toMatchObject({
      receipt_status: "sent",
      receipt_send_log_id: state.emailSendLogs[0]!.id,
    });
    sendEmailMock.mockClear();
    const again = await correctWith(state, { key: "key-z1-fail" });
    expect(again.receiptOutcome).toMatchObject({ status: "bounced" });
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("a retry that read failed is refused while the webhook writes complained: the row keeps it, the gift follows the row, the answer is bounced, and the refusal is audited", async () => {
    const state = freshState(true);
    await failedFirstSend(state, "key-z1-refuse");
    state.suppressionTypes = ["bounce"];
    state.writeGate = (table, _operation, payload) => {
      if (table === "email_send_logs" && payload.status === "suppressed")
        Object.assign(state.emailSendLogs[0]!, {
          status: "complained",
          error_code: "email.complained",
        });
    };
    const replay = await correctWith(state, { key: "key-z1-refuse" });
    expect(replay.receiptOutcome).toMatchObject({
      status: "bounced",
      reason: BOUNCED,
    });
    expect(state.emailSendLogs[0]).toMatchObject({
      status: "complained",
      error_code: "email.complained",
    });
    expect(state.stagedGift).toMatchObject({
      receipt_status: "sent",
      receipt_send_log_id: state.emailSendLogs[0]!.id,
    });
    expect(auditMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "email_send_suppressed" }),
    );
  });

  it("a failed re-send of the original receipt on a row that reads bounced: the row keeps the bounce and the provider's id, the gift follows the row, the answer is failed and names no row", async () => {
    const state = freshState(false);
    state.emailSendLogs = [
      {
        ...sentRow(RECEIPT_KEY),
        status: "bounced",
        error_code: "email.bounced",
      },
    ];
    state.stagedGift.receipt_status = "failed";
    sendEmailMock.mockResolvedValueOnce(providerDown);
    const answer = await sendStagedGiftReceipt({
      supabaseAdmin: stub(state),
      tenantId: TENANT_ID,
      stagedGiftId: "staged-1",
    });
    expect(answer).toEqual({ sendLogId: null, status: "failed" });
    expect(state.emailSendLogs).toEqual([
      {
        ...sentRow(RECEIPT_KEY),
        status: "bounced",
        error_code: "email.bounced",
      },
    ]);
    expect(state.stagedGift).toMatchObject({
      receipt_status: "sent",
      receipt_send_log_id: "send-log-1",
    });
  });
});

describe("AL-2681 A2 fix round Z2: a status the code does not know sends nothing", () => {
  it.each([["none"], ["email"]] as const)(
    "a row that reads queued, replay with %s: nothing is sent or written, and the answer says only that the delivery state is not one this screen knows",
    async (choice) => {
      const state = freshState(true);
      const { before, gift } = await mailedThenMarked(
        state,
        `key-z2-${choice}`,
        "queued",
      );
      state.snapshots[0]!.created_at = "2026-01-01T00:00:00.000Z";
      const replay = await correctWith(state, {
        key: `key-z2-${choice}`,
        choice,
      });
      expect(replay.receiptOutcome).toMatchObject({
        status: "unrecognized",
        reason: UNRECOGNIZED,
        snapshotId: state.snapshots[0]!.id,
      });
      expect(replay.receiptOutcome?.reason).not.toMatch(
        /was (not )?sent|went out|not delivered|was delivered/i,
      );
      expect(sendEmailMock).not.toHaveBeenCalled();
      expect(state.emailSendLogs).toEqual(before);
      expect(state.stagedGift).toEqual(gift);
    },
  );
});

describe("AL-2681 A2 fix round Z3: the delivery check looks at the donor the mailer addresses", () => {
  const grace = {
    id: "donor-2",
    profile_id: null,
    name: "Grace Hopper",
    email: "grace@example.com",
    do_not_email: true,
    do_not_contact: false,
  };

  it("the staged gift re-linked in review to a donor who asked for no e-mail, the donation's donor unchanged: the correction's e-mail choice is refused and nothing is mailed", async () => {
    const state = freshState(true);
    state.stagedGift.donor_id = "donor-2";
    state.donorRows = { "donor-2": grace };
    await expect(correctWith(state, { key: "key-z3" })).rejects.toThrow(
      /opted out of email/i,
    );
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("the same on a replay after a failed send: blocked, nothing mailed", async () => {
    const state = freshState(true);
    await failedFirstSend(state, "key-z3-replay");
    state.stagedGift.donor_id = "donor-2";
    state.donorRows = { "donor-2": grace };
    sendEmailMock.mockClear();
    const replay = await correctWith(state, { key: "key-z3-replay" });
    expect(replay.receiptOutcome).toMatchObject({ status: "blocked" });
    expect(replay.receiptOutcome?.reason).toMatch(/opted out of email/i);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});

describe("AL-2681 A2 fix round Z4: a failed attempt's answer names no other attempt's log row", () => {
  it("a re-send the provider refuses on a gift whose row reads sent: the action's reference is no row", async () => {
    const state = freshState(false);
    state.emailSendLogs = [sentRow(RECEIPT_KEY)];
    state.stagedGift.receipt_send_log_id = "send-log-1";
    sendEmailMock.mockResolvedValueOnce(providerDown);
    const appendAuditEvent = vi.fn().mockResolvedValue("audit-1");
    const result = await executeContributionAction({
      tenantId: TENANT_ID,
      actorProfileId: "profile-1",
      actorPermissions: ["finance:manage_contributions"],
      sourceSurface: "contribution_hub",
      contributionId: DONATION_ID,
      actionType: "resend_receipt",
      reason: "The donor asked for the receipt again",
      confirmationToken: "confirm",
      payload: { stagedGiftId: "staged-1" },
      dependencies: {
        sendReceipt: ({ tenantId, stagedGiftId }) =>
          sendStagedGiftReceipt({
            supabaseAdmin: stub(state),
            tenantId,
            stagedGiftId,
          }),
        appendAuditEvent,
        loadContributionDetail: vi.fn().mockResolvedValue({
          id: DONATION_ID,
          stagedGift: { id: "staged-1" },
        }),
      },
    });
    expect(result.providerOutcome).toMatchObject({
      status: "failed",
      referenceId: null,
    });
    expect(appendAuditEvent.mock.calls[0]![0]).toMatchObject({
      providerOutcome: { status: "failed", referenceId: null },
    });
  });
});

describe("AL-2681 A2 fix round Z5: where the row reads sent, the gift reads sent before anything is returned", () => {
  it("a refused original receipt whose row already reads sent, on a gift a half-finished write left failed: the gift reads sent with the row, the answer names no row, and the refusal is audited", async () => {
    const state = freshState(false);
    state.emailSendLogs = [sentRow(RECEIPT_KEY)];
    state.stagedGift.receipt_status = "failed";
    state.stagedGift.receipt_send_log_id = null;
    state.suppressionTypes = ["bounce"];
    const answer = await sendStagedGiftReceipt({
      supabaseAdmin: stub(state),
      tenantId: TENANT_ID,
      stagedGiftId: "staged-1",
    });
    expect(answer).toEqual({ sendLogId: null, status: "suppressed" });
    expect(state.stagedGift).toMatchObject({
      receipt_status: "sent",
      receipt_send_log_id: "send-log-1",
    });
    expect(auditMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "email_send_suppressed" }),
    );
  });

  it("the losing retry does not write failed over a gift that already reads sent with this row: the gift never reads failed", async () => {
    const state = freshState(true);
    await failedFirstSend(state, "key-z5-fail-last");
    const history = giftReceiptHistory(state);
    const gate = gateOnce(state, "staged_gifts", "failed");
    sendEmailMock.mockResolvedValueOnce(providerDown);
    const losing = correctWith(state, { key: "key-z5-fail-last" });
    await gate.atGate;
    const winning = await correctWith(state, { key: "key-z5-fail-last" });
    gate.release();
    const lost = await losing;
    expect(winning.receiptOutcome).toMatchObject({ status: "emailed" });
    expect(lost.receiptOutcome).toMatchObject({ status: "emailed" });
    expect(history).toEqual(["sent"]);
    expect(state.stagedGift.receipt_send_log_id).toBe(
      state.emailSendLogs[0]!.id,
    );
  });
});
