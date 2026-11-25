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
  applyContributionCorrection,
  loadContributionDetailFromSupabase,
} from "../../../../../packages/api/src/admin/contribution-operations/operations";
import { buildUpdatedReceiptHtml } from "../../../../../packages/api/src/admin/contribution-operations/receipt-pdf";

import type { ReceiptSnapshotContentV1 } from "../../../../../packages/api/src/admin/contribution-operations/receipt-delivery";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type Row = Record<string, unknown>;

const TENANT_ID = "tenant-1";
const DONATION_ID = "donation-1";
const W = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0a01";
const V = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0a02";
const X = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0a03";
const GONE = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0a04";
const OTHER_WORKER = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0a05";
const FUND_W = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0f01";
const FUND_OTHER = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0f02";
const FORBIDDEN =
  /Profile Rowan|Profile Vale|Profile Xu|Profile Gone|Party Xu|Legal Rowan/;

const profile = (first: string, last: string) => ({
  display_name: `${first} ${last}`,
  full_name: `${first} ${last}`,
  first_name: first,
  last_name: last,
  email: `${last.toLowerCase()}@example.test`,
});

const WORKER_ROWS: Record<string, Row> = {
  [W]: {
    id: W,
    worker_public_name: "Cedar",
    profile: profile("Profile", "Rowan"),
  },
  [V]: {
    id: V,
    worker_public_name: "Party Vale",
    profile: profile("Profile", "Vale"),
  },
  [X]: { id: X, worker_public_name: null, profile: profile("Profile", "Xu") },
  [GONE]: { id: GONE, profile: profile("Profile", "Gone") },
  [OTHER_WORKER]: {
    id: OTHER_WORKER,
    tenant_id: "tenant-2",
    worker_public_name: "Other Worker",
    profile: profile("Other", "Worker"),
  },
};

const fundRow = (id: string, tenantId: string, missionaryId: string) => ({
  id,
  tenant_id: tenantId,
  name: `Fund of ${missionaryId.slice(-4)}`,
  missionary_id: missionaryId,
  goal_amount: null,
  start_date: null,
  end_date: null,
});

const EMBEDDED = new Set(["profile"]);

function topLevel(text: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    if (text[i] === ")") depth--;
    if (text[i] === "," && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

function project(row: Row, select: string): Row {
  const out: Row = {};
  for (const part of topLevel(select)) {
    const embed = /^(?:(\w+):)?(\w+)(?:![\w!]+)?\((.+)\)$/s.exec(part);
    const key = embed ? (embed[1] ?? embed[2]!) : null;
    if (embed && key && EMBEDDED.has(key)) {
      const value = row[key] as Row | null | undefined;
      out[key] = value ? project(value, embed[3]!) : (value ?? null);
    } else if (part === "*") {
      for (const [k, v] of Object.entries(row))
        if (!EMBEDDED.has(k)) out[k] = v;
    } else if (/^\w+$/.test(part)) {
      if (!Object.hasOwn(row, part))
        throw new Error(`the stub's row has no column "${part}"`);
      out[part] = row[part];
    } else throw new Error(`the stub cannot project "${part}"`);
  }
  return out;
}

const STAGED_GIFT = {
  id: "staged-1",
  tenant_id: TENANT_ID,
  donation_id: DONATION_ID,
  donor_id: "donor-1",
  missionary_id: null,
  fund_id: null,
  stripe_raw_event_id: null,
  stripe_event_id: null,
  stripe_payment_intent_id: null,
  stripe_charge_id: null,
  amount: 25_000,
  currency: "usd",
  status: "posted",
  donor_match_status: "matched",
  allocation_status: "allocated",
  review_reason: null,
  receipt_status: "sent",
  crm_post_status: "posted",
  crm_outbound_job_id: null,
  twenty_record_id: null,
  metadata: {},
};

interface State {
  donationMissionaryId: string | null;
  allocations: Row[];
  adjustments: Row[];
  snapshots: Row[];
  emailSendLogs: Row[];
  selects: Array<[string, string]>;
  failWorkerNames?: number;
  donationFundId?: string | null;
  funds?: Row[];
  failFundWorkers?: number;
  ops?: string[];
}

class QueryBuilder {
  private operation: "select" | "insert" | "update" = "select";
  private payload: Row | null = null;
  private columns = "*";
  private wantsSingle = false;
  private inValues: unknown[] = [];
  private eqs: Array<[string, unknown]> = [];

  constructor(
    private readonly table: string,
    private readonly state: State,
  ) {}

  select(columns = "*") {
    if (this.operation === "select") {
      this.columns = columns;
      this.state.selects.push([this.table, columns]);
    }
    return this;
  }
  insert(payload: Row) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }
  update(payload: Row) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }
  eq(column: string, value: unknown) {
    this.eqs.push([column, value]);
    return this;
  }
  ilike() {
    return this;
  }
  is() {
    return this;
  }
  in(_column: string, values: unknown[]) {
    this.inValues = values;
    return this;
  }
  order() {
    return this;
  }
  limit() {
    return this;
  }
  single() {
    this.wantsSingle = true;
    return this;
  }
  maybeSingle() {
    this.wantsSingle = true;
    return this;
  }

  private resolve(): {
    data: unknown;
    error: { code?: string; message: string } | null;
  } {
    const { state } = this;
    state.ops?.push(
      this.operation === "select"
        ? `select ${this.table} ${this.columns}`
        : `${this.operation} ${this.table}`,
    );
    switch (this.table) {
      case "donations":
        return {
          data: {
            id: DONATION_ID,
            tenant_id: TENANT_ID,
            donor_id: "donor-1",
            missionary_id: state.donationMissionaryId,
            fund_id: state.donationFundId ?? null,
            amount: 25_000,
            currency: "usd",
            status: "completed",
            gift_date: "2026-05-01",
            refund_amount: 0,
            refunded_at: null,
            created_at: "2026-05-01T00:00:00.000Z",
            updated_at: "2026-05-01T00:00:00.000Z",
          },
          error: null,
        };
      case "staged_gifts":
        return {
          data: this.operation === "update" ? null : STAGED_GIFT,
          error: null,
        };
      case "staged_gift_allocations":
        return { data: state.allocations, error: null };
      case "donors":
        return {
          data: {
            id: "donor-1",
            profile_id: null,
            name: "Ada Lovelace",
            email: "donor@example.com",
            do_not_email: false,
            do_not_contact: false,
          },
          error: null,
        };
      case "missionaries": {
        const wantsPublicName = /\bworker_public_name\b/.test(this.columns);
        if (wantsPublicName && (state.failWorkerNames ?? 0) > 0) {
          state.failWorkerNames! -= 1;
          return {
            data: null,
            error: { message: "worker public names are unavailable" },
          };
        }
        return {
          data: this.inValues.flatMap((id) => {
            const row = WORKER_ROWS[id as string];
            if (
              !row ||
              (wantsPublicName && !("worker_public_name" in row)) ||
              !this.eqs.every(([column, value]) =>
                column in row ? row[column] === value : true,
              )
            )
              return [];
            return [project(row, this.columns)];
          }),
          error: null,
        };
      }
      case "funds": {
        if (
          this.columns === "id, missionary_id" &&
          (state.failFundWorkers ?? 0) > 0
        ) {
          state.failFundWorkers! -= 1;
          return { data: null, error: { message: "funds are unavailable" } };
        }
        return {
          data: (state.funds ?? []).filter(
            (row) =>
              this.inValues.includes(row.id) &&
              this.eqs.every(([column, value]) => row[column] === value),
          ),
          error: null,
        };
      }
      case "contribution_receipt_snapshots": {
        if (this.operation !== "insert") return { data: null, error: null };
        const row = {
          id: `snap-${state.snapshots.length + 1}`,
          ...this.payload,
        };
        state.snapshots.push(row);
        return { data: { id: row.id }, error: null };
      }
      case "email_send_logs": {
        if (this.operation !== "insert") return { data: [], error: null };
        const row = {
          id: `send-log-${state.emailSendLogs.length + 1}`,
          ...this.payload,
        };
        state.emailSendLogs.push(row);
        return { data: { id: row.id }, error: null };
      }
      case "email_suppressions":
      case "contribution_operation_audit_events":
      case "contribution_corrections":
        return { data: [], error: null };
      case "contribution_adjustments": {
        if (this.operation === "insert") {
          const key = this.payload?.idempotency_key;
          if (
            typeof key === "string" &&
            state.adjustments.some((row) => row.idempotency_key === key)
          )
            return {
              data: null,
              error: { code: "23505", message: "duplicate idempotency key" },
            };
          const row = {
            id: `adj-${state.adjustments.length + 1}`,
            created_at: "2026-06-01T00:00:00.000Z",
            ...this.payload,
          };
          state.adjustments.push(row);
          return { data: { id: row.id }, error: null };
        }
        return {
          data: this.wantsSingle
            ? (state.adjustments[0] ?? null)
            : state.adjustments,
          error: null,
        };
      }
      default:
        return { data: null, error: null };
    }
  }

  then<T>(
    onfulfilled: (value: {
      data: unknown;
      error: { code?: string; message: string } | null;
    }) => T,
  ): Promise<T> {
    return Promise.resolve(this.resolve()).then(onfulfilled);
  }
}

function stub(state: State): AdminSupabaseClient {
  return {
    from: (table: string) => new QueryBuilder(table, state),
  } as unknown as AdminSupabaseClient;
}

const allocation = (id: string, cents: number, missionaryId: string) => ({
  id,
  amount: cents,
  fund_id: null,
  missionary_id: missionaryId,
  memo: `Memo ${id}`,
});

function freshState(split: boolean): State {
  return {
    donationMissionaryId: split ? null : X,
    allocations: split
      ? [
          allocation("w", 10_000, W),
          allocation("v", 8_000, V),
          allocation("x", 4_000, X),
          allocation("gone", 3_000, GONE),
        ]
      : [],
    adjustments: [],
    snapshots: [],
    emailSendLogs: [],
    selects: [],
  };
}

async function correct(
  state: State,
  choice: "pdf" | "email" | "defer",
  idempotencyKey?: string,
) {
  return applyContributionCorrection({
    supabaseAdmin: stub(state),
    tenantId: TENANT_ID,
    contributionId: DONATION_ID,
    actionType: "amount_correction",
    payload: {
      amount: 20_000,
      receiptDelivery:
        choice === "defer"
          ? { choice, deferReason: "The donor asked to wait" }
          : { choice },
    },
    reason: "data entry error",
    actorProfileId: "profile-1",
    sourceSurface: "contribution_hub",
    actorCapabilities: ["contributions.manage_receipts"],
    idempotencyKey,
  });
}

const workerNameLookups = (state: State) =>
  state.selects.filter(
    ([table, columns]) =>
      table === "missionaries" && /\bworker_public_name\b/.test(columns),
  ).length;

const namesOf = (content: unknown) =>
  (content as ReceiptSnapshotContentV1).designationLines.map((line) => [
    line.missionaryId,
    line.missionaryName,
  ]);

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
