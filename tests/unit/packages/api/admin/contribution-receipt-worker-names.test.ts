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

import {
  correct,
  DONATION_ID,
  FORBIDDEN,
  freshState,
  FUND_OTHER,
  FUND_W,
  fundRow,
  GONE,
  namesOf,
  OTHER_WORKER,
  stub,
  TENANT_ID,
  V,
  W,
  WORKER_ROWS,
  workerNameLookups,
  X,
} from "./contribution-receipt-stub";
import {
  applyContributionCorrection,
  loadContributionDetailFromSupabase,
} from "../../../../../packages/api/src/admin/contribution-operations/operations";
import { buildUpdatedReceiptHtml } from "../../../../../packages/api/src/admin/contribution-operations/receipt-pdf";

import type { State } from "./contribution-receipt-stub";
import type { ReceiptSnapshotContentV1 } from "../../../../../packages/api/src/admin/contribution-operations/receipt-delivery";

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

describe("AL-2678 r2a test 4: an updated receipt names each line's worker by worker_public_name, never by the staff label (gate a)", () => {
  it("a PDF snapshot stores W as Cedar, V as Party Vale, and X (restricted, no alias) and a worker the projection does not find as null; its HTML shows those names and —; no output holds a forbidden name", async () => {
    const state = freshState(true);
    const result = await correct(state, "pdf");
    expect(result.receiptOutcome).toMatchObject({ status: "pdf_generated" });
    expect(state.snapshots).toHaveLength(1);
    const content = state.snapshots[0]!.content;
    expect(namesOf(content)).toEqual([
      [W, "Cedar"],
      [V, "Party Vale"],
      [X, null],
      [GONE, null],
    ]);
    const { html } = buildUpdatedReceiptHtml(
      content as ReceiptSnapshotContentV1,
    );
    expect(
      [...html.matchAll(/<tr><td>[^<]*<\/td><td>([^<]*)<\/td>/g)].map(
        (m) => m[1],
      ),
    ).toEqual(["Cedar", "Party Vale", "—", "—"]);
    expect(
      state.selects.filter(([table]) => table === "missionaries"),
    ).toContainEqual(["missionaries", "id, worker_public_name"]);
    expect(JSON.stringify([content, html])).not.toMatch(FORBIDDEN);
  });

  it("an emailed snapshot says Missionary: Cedar and Missionary: Party Vale, and no Missionary: part for X or the worker the projection does not find; no output holds a forbidden name", async () => {
    const state = freshState(true);
    const result = await correct(state, "email");
    expect(result.receiptOutcome).toMatchObject({ status: "emailed" });
    expect(namesOf(state.snapshots[0]!.content)).toEqual([
      [W, "Cedar"],
      [V, "Party Vale"],
      [X, null],
      [GONE, null],
    ]);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const sent = sendEmailMock.mock.calls[0]![1] as {
      html: string;
      text: string;
    };
    for (const body of [sent.html, sent.text]) {
      expect(body.match(/Missionary: [^|<:\n]*/g)).toEqual([
        "Missionary: Cedar ",
        "Missionary: Party Vale ",
      ]);
      expect(body).toContain("Memo x");
      expect(body).toContain("Memo gone");
    }
    expect(JSON.stringify([state.snapshots, sent.html, sent.text])).not.toMatch(
      FORBIDDEN,
    );
  });

  it("a gift to X with no staged allocations stores its one donation line with no name, not X's staff label", async () => {
    const state = freshState(false);
    await correct(state, "pdf");
    expect(namesOf(state.snapshots[0]!.content)).toEqual([[X, null]]);
    expect(JSON.stringify(state.snapshots)).not.toMatch(FORBIDDEN);
  });

  it("guard (passes on the base): Mission Control's staff detail still labels each line by the worker's profile", async () => {
    const detail = await loadContributionDetailFromSupabase({
      supabaseAdmin: stub(freshState(true)),
      tenantId: TENANT_ID,
      contributionId: DONATION_ID,
    });
    expect(
      detail.designations.lines.map((line) => line.missionaryName),
    ).toEqual(["Profile Rowan", "Profile Vale", "Profile Xu", "Profile Gone"]);
  });
});

describe("AL-2678 r2a B1: a failed worker-name lookup cannot lose the updated receipt staff selected", () => {
  it("the lookup fails once with a PDF selected: the command fails before any write, so no adjustment and no snapshot exist", async () => {
    const state = { ...freshState(true), failWorkerNames: 1 };
    await expect(correct(state, "pdf", "key-b1")).rejects.toThrow(
      "worker public names are unavailable",
    );
    expect(state.adjustments).toEqual([]);
    expect(state.snapshots).toEqual([]);
  });

  it("the retry with the same idempotency key then applies the adjustment and makes the receipt, with the projected names", async () => {
    const state = { ...freshState(true), failWorkerNames: 1 };
    await correct(state, "pdf", "key-b1").catch(() => undefined);
    const retried = await correct(state, "pdf", "key-b1");
    expect(retried.idempotentReplay).toBe(false);
    expect(retried.receiptOutcome).toMatchObject({ status: "pdf_generated" });
    expect(state.adjustments).toHaveLength(1);
    expect(state.snapshots).toHaveLength(1);
    expect(namesOf(state.snapshots[0]!.content)).toEqual([
      [W, "Cedar"],
      [V, "Party Vale"],
      [X, null],
      [GONE, null],
    ]);
  });

  it("no worker-name lookup is made when staff defer the updated receipt", async () => {
    const state = freshState(true);
    const result = await correct(state, "defer");
    expect(result.receiptOutcome).toMatchObject({ status: "deferred" });
    expect(state.snapshots).toEqual([]);
    expect(workerNameLookups(state)).toBe(0);
  });
});

describe("AL-2681 fix round F11: a correction that has committed always reaches its receipt delivery", () => {
  it("the gift's holds cannot be read once the adjustment is written: the updated receipt is still made, because the correction does not read holds", async () => {
    const state = { ...freshState(true), failHoldsOnceCorrected: true };
    const result = await correct(state, "pdf", "key-f11-holds");
    expect(result.receiptOutcome).toMatchObject({ status: "pdf_generated" });
    expect(state.adjustments).toHaveLength(1);
    expect(state.snapshots).toEqual([
      expect.objectContaining({ adjustment_id: "adj-1", kind: "pdf" }),
    ]);
  });

  it("the delivery fails after the adjustment commits: the retry with the same key resumes it, once, and a later retry reports the receipt (D-18, AL-2681 issue 2857 item 7: the replay reports the receipt's state, not null)", async () => {
    const state = { ...freshState(true), failSnapshotInserts: 1 };
    await expect(correct(state, "pdf", "key-f11-resume")).rejects.toThrow(
      "snapshots are unavailable",
    );
    expect(state.adjustments).toHaveLength(1);
    expect(state.snapshots).toEqual([]);
    const retried = await correct(state, "pdf", "key-f11-resume");
    expect(retried.idempotentReplay).toBe(true);
    expect(retried.receiptOutcome).toMatchObject({ status: "pdf_generated" });
    expect(state.snapshots).toEqual([
      expect.objectContaining({ adjustment_id: "adj-1", kind: "pdf" }),
    ]);
    const again = await correct(state, "pdf", "key-f11-resume");
    expect(again.idempotentReplay).toBe(true);
    expect(again.receiptOutcome).toMatchObject({
      status: "pdf_generated",
      snapshotId: state.snapshots[0]!.id,
    });
    expect(state.snapshots).toHaveLength(1);
  });
});

async function correctFund(
  state: State,
  fundId: string,
  idempotencyKey?: string,
) {
  return applyContributionCorrection({
    supabaseAdmin: stub(state),
    tenantId: TENANT_ID,
    contributionId: DONATION_ID,
    actionType: "fund_correction",
    payload: { fundId, receiptDelivery: { choice: "pdf" } },
    reason: "the gift went to the wrong fund",
    actorProfileId: "profile-1",
    sourceSurface: "contribution_hub",
    actorCapabilities: ["contributions.manage_receipts"],
    idempotencyKey,
  });
}

function fundState(extra: Partial<State> = {}): State {
  return {
    ...freshState(false),
    donationMissionaryId: null,
    funds: [
      fundRow(FUND_W, TENANT_ID, W),
      fundRow(FUND_OTHER, "tenant-2", OTHER_WORKER),
    ],
    ops: [],
    ...extra,
  };
}

describe("AL-2678 r2a last round L2: the worker a receipt names through a fund is resolved before the adjustment", () => {
  it("a fund correction naming a fund of the organization whose worker has a public name: the receipt line names that worker, and the fund and the name were read before the adjustment was inserted", async () => {
    const state = fundState();
    const result = await correctFund(state, FUND_W);
    expect(result.receiptOutcome).toMatchObject({ status: "pdf_generated" });
    expect(namesOf(state.snapshots[0]!.content)).toEqual([[W, "Cedar"]]);
    const ops = state.ops!;
    const insertAt = ops.indexOf("insert contribution_adjustments");
    const fundsAt = ops.indexOf("select funds id, missionary_id");
    const namesAt = ops.indexOf("select missionaries id, worker_public_name");
    expect([insertAt > -1, fundsAt > -1, namesAt > -1]).toEqual([
      true,
      true,
      true,
    ]);
    expect(fundsAt).toBeLessThan(insertAt);
    expect(namesAt).toBeLessThan(insertAt);
    expect(
      ops.slice(insertAt).filter((op) => op.includes("worker_public_name")),
    ).toEqual([]);
  });

  it("the funds read fails once: the command fails before any write; the retry with the same key applies the adjustment and names the worker through the fund", async () => {
    const state = fundState({ failFundWorkers: 1 });
    await expect(correctFund(state, FUND_W, "key-l2")).rejects.toThrow(
      "funds are unavailable",
    );
    expect(state.adjustments).toEqual([]);
    expect(state.snapshots).toEqual([]);
    const retried = await correctFund(state, FUND_W, "key-l2");
    expect(retried.idempotentReplay).toBe(false);
    expect(retried.receiptOutcome).toMatchObject({ status: "pdf_generated" });
    expect(state.adjustments).toHaveLength(1);
    expect(namesOf(state.snapshots[0]!.content)).toEqual([[W, "Cedar"]]);
  });

  it("a correction naming another organization's fund, or a fund id that is not a UUID, is refused with 400 before any write and makes no worker-name lookup", async () => {
    for (const fundId of [FUND_OTHER, "fund-not-a-uuid"]) {
      const state = fundState();
      await expect(correctFund(state, fundId)).rejects.toMatchObject({
        status: 400,
        message: `Unknown fund for this organization: ${fundId}.`,
      });
      expect(state.adjustments).toEqual([]);
      expect(workerNameLookups(state)).toBe(0);
    }
  });

  it("a gift whose stored fund is another organization's, or not a UUID, is corrected and its receipt names no worker: the fund read is tenant-scoped and skips a non-UUID id, and no other organization's worker is looked up", async () => {
    for (const donationFundId of [FUND_OTHER, "legacy-fund"]) {
      const state = fundState({ donationFundId });
      const result = await correct(state, "pdf");
      expect(result.receiptOutcome).toMatchObject({ status: "pdf_generated" });
      expect(namesOf(state.snapshots[0]!.content)).toEqual([[null, null]]);
      expect(workerNameLookups(state)).toBe(0);
      expect(JSON.stringify(state.snapshots)).not.toContain("Other Worker");
    }
  });
});

describe("AL-2681 issue 2857 items 3 to 7: a correction's retry belongs to its gift, delivers once, carries its own values and reports its receipt", () => {
  it("item 3: a key already used on another gift is a conflict: 409, and nothing is written or sent", async () => {
    const state = freshState(true);
    state.adjustments.push({
      id: "adj-other",
      tenant_id: TENANT_ID,
      donation_id: "other-gift",
      idempotency_key: "key-3",
      status: "applied",
      adjustment_type: "amount_correction",
      effective_values: { amountCents: 1_000 },
      created_at: "2026-05-30T00:00:00.000Z",
    });
    await expect(correct(state, "pdf", "key-3")).rejects.toMatchObject({
      status: 409,
    });
    expect(state.adjustments).toHaveLength(1);
    expect(state.snapshots).toEqual([]);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("item 6: a retry with the same key and the revision its first attempt was given reaches the replay, not a 409", async () => {
    const state = { ...freshState(true), failSnapshotInserts: 1 };
    const { revision } = await loadContributionDetailFromSupabase({
      supabaseAdmin: stub(state),
      tenantId: TENANT_ID,
      contributionId: DONATION_ID,
    });
    await expect(correct(state, "pdf", "key-6", revision)).rejects.toThrow(
      "snapshots are unavailable",
    );
    const retried = await correct(state, "pdf", "key-6", revision);
    expect(retried).toMatchObject({
      idempotentReplay: true,
      receiptOutcome: { status: "pdf_generated" },
    });
    expect(state.snapshots).toHaveLength(1);
  });

  it("item 5: the replay of a correction a later one superseded sends nothing and says superseded", async () => {
    const state = { ...freshState(true), failSnapshotInserts: 1 };
    await correct(state, "pdf", "key-5a").catch(() => undefined);
    await correct(state, "pdf", "key-5b");
    expect(state.snapshots).toHaveLength(1);
    const replay = await correct(state, "pdf", "key-5a");
    expect(replay).toMatchObject({
      idempotentReplay: true,
      receiptOutcome: { status: "superseded", snapshotId: null },
    });
    expect(state.snapshots).toHaveLength(1);
  });

  it("item 4: when the database refuses a second snapshot of one correction and kind, the replay reports the receipt being sent and sends nothing", async () => {
    const state = { ...freshState(true), failSnapshotInserts: 1 };
    await correct(state, "email", "key-4").catch(() => undefined);
    state.snapshotConflictOnce = true;
    sendEmailMock.mockClear();
    const replay = await correct(state, "email", "key-4");
    expect(state.snapshots).toHaveLength(1);
    expect(replay.receiptOutcome).toMatchObject({
      status: "pending",
      snapshotId: state.snapshots[0]!.id,
    });
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("item 7: a receipt whose send failed is not delivered: the replay sends it again and reports what happened (D-18, AL-2681 PR 2b A fix round F2: one send-log row for the snapshot, which the re-send writes onto)", async () => {
    sendEmailMock.mockResolvedValueOnce({
      success: false,
      messageId: null,
      correlationId: "corr-failed",
      recipientCount: 0,
      retryCount: 0,
      errors: [{ code: "provider_down", message: "The provider is down." }],
    });
    const state = freshState(true);
    const first = await correct(state, "email", "key-7");
    expect(first.receiptOutcome).toMatchObject({ status: "failed" });
    const replay = await correct(state, "email", "key-7");
    expect(replay.receiptOutcome).toMatchObject({
      status: "emailed",
      snapshotId: state.snapshots[0]!.id,
    });
    expect(state.snapshots).toHaveLength(1);
    expect(state.emailSendLogs.map((log) => log.status)).toEqual(["sent"]);
  });
});

describe("AL-2681 part 2a fix round F1: the receipt a correction's retry seals and mails carries the correction", () => {
  it("two requests with one key race and the loser seals the receipt first: the snapshot, the mail and the loser's answer carry the corrected amount", async () => {
    const winner = freshState(true);
    await correct(winner, "defer", "key-race");
    const loser = { ...freshState(true), winnerRow: winner.adjustments[0] };
    sendEmailMock.mockClear();
    const answer = await correct(loser, "email", "key-race");
    expect(answer.idempotentReplay).toBe(true);
    expect(loser.adjustments).toHaveLength(1);
    expect(loser.snapshots).toHaveLength(1);
    const sealed = loser.snapshots[0]!.content as ReceiptSnapshotContentV1;
    expect(sealed.effective.amountCents).toBe(20_000);
    expect(JSON.stringify(answer.after)).toContain("20000");
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const mailed = JSON.stringify(sendEmailMock.mock.calls[0]);
    expect(mailed).toContain("200.00");
    expect(mailed).not.toContain("250.00");
  });

  it("a retry after a failed send mails the snapshot it stored, though a worker's public name changed in between", async () => {
    sendEmailMock.mockResolvedValueOnce({
      success: false,
      messageId: null,
      correlationId: "corr-failed",
      recipientCount: 0,
      retryCount: 0,
      errors: [{ code: "provider_down", message: "The provider is down." }],
    });
    const state = freshState(true);
    await correct(state, "email", "key-stored");
    expect(state.snapshots).toHaveLength(1);
    expect(JSON.stringify(state.snapshots[0]!.content)).toContain("Cedar");
    const original = WORKER_ROWS[W]!.worker_public_name;
    WORKER_ROWS[W]!.worker_public_name = "Cedar Renamed";
    try {
      sendEmailMock.mockClear();
      const replay = await correct(state, "email", "key-stored");
      expect(replay.receiptOutcome).toMatchObject({
        status: "emailed",
        snapshotId: state.snapshots[0]!.id,
      });
      expect(sendEmailMock).toHaveBeenCalledTimes(1);
      const mailed = JSON.stringify(sendEmailMock.mock.calls[0]);
      expect(mailed).toContain("Cedar");
      expect(mailed).not.toContain("Cedar Renamed");
    } finally {
      WORKER_ROWS[W]!.worker_public_name = original;
    }
  });
});
