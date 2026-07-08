import { describe, expect, it, vi } from "vitest";

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

import { applyContributionCorrection } from "../../../../../packages/api/src/admin/contribution-operations/operations";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const TENANT_ID = "tenant-1";
const DONATION_ID = "donation-1";
const FUND_VALID = "11111111-1111-4111-8111-111111111111";
const FUND_OTHER = "22222222-2222-4222-8222-222222222222";

const donationRow = {
  id: DONATION_ID,
  tenant_id: TENANT_ID,
  donor_id: "donor-1",
  missionary_id: null,
  fund_id: null,
  amount: 25_000,
  currency: "usd",
  status: "completed",
  gift_date: "2026-05-01",
  refund_amount: 0,
  refunded_at: null,
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-01T00:00:00.000Z",
};

interface StubState {
  adjustments: Array<Record<string, unknown>>;
  insertCount: number;
  stagedGift?: Record<string, unknown> | null;
  donor?: Record<string, unknown> | null;
  policy?: Record<string, unknown> | null;
  snapshots?: Array<Record<string, unknown>>;
  emailSendLogs?: Array<Record<string, unknown>>;
  stagedGiftUpdates?: Array<Record<string, unknown>>;
  suppressions?: Array<Record<string, unknown>>;
  funds?: Array<string | { id: string; name?: string | null }>;
  missionaries?: string[];
}

class QueryBuilder {
  private operation: "select" | "insert" = "select";
  private insertPayload: Record<string, unknown> | null = null;
  private updatePayload: Record<string, unknown> | null = null;
  private wantsSingle = false;
  private inValues: unknown[] = [];

  constructor(
    private readonly table: string,
    private readonly state: StubState,
  ) {}

  select() {
    return this;
  }

  insert(payload: Record<string, unknown>) {
    this.operation = "insert";
    this.insertPayload = payload;
    return this;
  }

  update(payload: Record<string, unknown>) {
    this.operation = "update";
    this.updatePayload = payload;
    return this;
  }

  eq() {
    return this;
  }

  ilike() {
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
    if (this.table === "donations") {
      return { data: donationRow, error: null };
    }
    if (this.table === "staged_gifts") {
      if (this.operation === "update") {
        const updates = (this.state.stagedGiftUpdates ??= []);
        updates.push(this.updatePayload ?? {});
        return { data: null, error: null };
      }
      return { data: this.state.stagedGift ?? null, error: null };
    }
    if (this.table === "donors") {
      return { data: this.state.donor ?? null, error: null };
    }
    if (this.table === "funds") {
      const valid = this.state.funds ?? [];
      const rows = this.inValues
        .map((id) => {
          const fund = valid.find((item) =>
            typeof item === "string" ? item === id : item.id === id,
          );

          if (!fund) {
            return null;
          }

          return typeof fund === "string"
            ? { id: fund, name: null }
            : { id: fund.id, name: fund.name ?? null };
        })
        .filter((row): row is { id: string; name: string | null } =>
          Boolean(row),
        );
      return { data: rows, error: null };
    }
    if (this.table === "missionaries") {
      const valid = this.state.missionaries ?? [];
      const rows = this.inValues
        .filter((id) => valid.includes(id as string))
        .map((id) => ({ id }));
      return { data: rows, error: null };
    }
    if (this.table === "contribution_operation_audit_events") {
      return { data: [], error: null };
    }
    if (this.table === "contribution_corrections") {
      return { data: [], error: null };
    }
    if (this.table === "contribution_receipt_delivery_policies") {
      return { data: this.state.policy ?? null, error: null };
    }
    if (this.table === "contribution_receipt_snapshots") {
      if (this.operation === "insert" && this.insertPayload) {
        const snapshots = (this.state.snapshots ??= []);
        const row = {
          id: `snap-${snapshots.length + 1}`,
          ...this.insertPayload,
        };
        snapshots.push(row);
        return { data: { id: row.id }, error: null };
      }
      return { data: null, error: null };
    }
    if (this.table === "email_suppressions") {
      return { data: this.state.suppressions ?? [], error: null };
    }
    if (this.table === "email_send_logs") {
      if (this.operation === "insert" && this.insertPayload) {
        const logs = (this.state.emailSendLogs ??= []);
        const key = this.insertPayload.idempotency_key;
        const duplicate =
          typeof key === "string" &&
          logs.some((row) => row.idempotency_key === key);
        if (duplicate) {
          return {
            data: null,
            error: { code: "23505", message: "duplicate idempotency key" },
          };
        }
        const row = {
          id: `send-log-${logs.length + 1}`,
          ...this.insertPayload,
        };
        logs.push(row);
        return { data: { id: row.id }, error: null };
      }
      return { data: [], error: null };
    }
    if (this.table === "contribution_adjustments") {
      if (this.operation === "insert") {
        const key = this.insertPayload?.idempotency_key;
        const duplicate =
          typeof key === "string" &&
          this.state.adjustments.some((row) => row.idempotency_key === key);
        if (duplicate) {
          return {
            data: null,
            error: { code: "23505", message: "duplicate idempotency key" },
          };
        }

        this.state.insertCount += 1;
        const row = {
          id: `adj-${this.state.insertCount}`,
          created_at: `2026-06-0${this.state.insertCount}T00:00:00.000Z`,
          ...this.insertPayload,
        };
        this.state.adjustments.push(row);
        return { data: { id: row.id }, error: null };
      }

      if (this.wantsSingle) {
        return { data: this.state.adjustments[0] ?? null, error: null };
      }
      return { data: this.state.adjustments, error: null };
    }
    return { data: null, error: null };
  }

  then<TResult>(
    onfulfilled: (value: {
      data: unknown;
      error: { code?: string; message: string } | null;
    }) => TResult,
  ): Promise<TResult> {
    return Promise.resolve(this.resolve()).then(onfulfilled);
  }
}

function createStub(state: StubState): AdminSupabaseClient {
  return {
    from(table: string) {
      return new QueryBuilder(table, state);
    },
  } as unknown as AdminSupabaseClient;
}

function baseInput(state: StubState) {
  return {
    supabaseAdmin: createStub(state),
    tenantId: TENANT_ID,
    contributionId: DONATION_ID,
    actionType: "amount_correction" as const,
    payload: { amount: 20_000 },
    reason: "data entry error",
    actorProfileId: "profile-1",
    sourceSurface: "contribution_hub" as const,
  };
}

describe("applyContributionCorrection", () => {
  it("writes an adjustment record and never rewrites original donation truth", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
    };

    const result = await applyContributionCorrection({
      ...baseInput(state),
      idempotencyKey: "key-1",
    });

    expect(state.adjustments).toHaveLength(1);
    expect(state.adjustments[0]).toMatchObject({
      adjustment_type: "amount_correction",
      status: "applied",
      effective_values: { amountCents: 20_000 },
      reason: "data entry error",
      actor_profile_id: "profile-1",
      source_surface: "contribution_hub",
      idempotency_key: "key-1",
    });
    expect(result.before.amount).toBe(25_000);
    expect(result.after.amount).toBe(20_000);
    expect(result.status).toBe("applied");
    expect(result.adjustmentId).toBe("adj-1");
    expect(result.idempotentReplay).toBe(false);
  });

  it("rejects stale saves with a clear recovery path and writes nothing", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
    };

    await expect(
      applyContributionCorrection({
        ...baseInput(state),
        expectedRevision: "stale-revision",
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: expect.stringMatching(/reload the latest detail/i),
    });

    expect(state.adjustments).toHaveLength(0);
  });

  it("returns the existing adjustment on idempotent retry", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
    };

    const first = await applyContributionCorrection({
      ...baseInput(state),
      idempotencyKey: "key-retry",
    });
    const second = await applyContributionCorrection({
      ...baseInput(state),
      idempotencyKey: "key-retry",
    });

    expect(state.adjustments).toHaveLength(1);
    expect(first.idempotentReplay).toBe(false);
    expect(second.idempotentReplay).toBe(true);
    expect(second.adjustmentId).toBe(first.adjustmentId);
  });

  it("replays idempotently with stable effective summaries and no new writes (#260)", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
    };

    const first = await applyContributionCorrection({
      ...baseInput(state),
      idempotencyKey: "key-replay",
    });
    expect(first.before.amount).toBe(25_000);
    expect(first.after.amount).toBe(20_000);

    const replay = await applyContributionCorrection({
      ...baseInput(state),
      idempotencyKey: "key-replay",
    });

    // The replay reports the already-applied effective truth on both sides:
    // nothing is recomputed against the original, nothing new is written,
    // and no receipt delivery re-runs.
    expect(replay.idempotentReplay).toBe(true);
    expect(replay.before.amount).toBe(20_000);
    expect(replay.after.amount).toBe(20_000);
    expect(replay.receiptOutcome).toBeNull();
    expect(state.adjustments).toHaveLength(1);
    expect(state.insertCount).toBe(1);
  });

  it("rejects a stale retry before consulting the idempotency key (#260)", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
    };

    await applyContributionCorrection({
      ...baseInput(state),
      idempotencyKey: "key-stale-retry",
    });

    // A retry carrying a revision that no longer matches is a stale save
    // first: optimistic concurrency wins over idempotent replay so the
    // caller reloads and re-reviews instead of silently replaying.
    await expect(
      applyContributionCorrection({
        ...baseInput(state),
        idempotencyKey: "key-stale-retry",
        expectedRevision: "stale-revision-from-before-first-save",
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: expect.stringMatching(/reload the latest detail/i),
    });

    expect(state.adjustments).toHaveLength(1);
  });

  it("derives later corrections from the accumulated effective values, not the original (#260)", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
    };

    const first = await applyContributionCorrection({
      ...baseInput(state),
      idempotencyKey: "key-first",
    });
    expect(first.before.amount).toBe(25_000);
    expect(first.after.amount).toBe(20_000);

    const second = await applyContributionCorrection({
      ...baseInput(state),
      payload: { amount: 18_000 },
      idempotencyKey: "key-second",
    });

    // A genuinely new correction after an intervening change starts from the
    // effective value the first adjustment produced — original donation truth
    // stays 25_000 in the database and is never rewritten.
    expect(second.idempotentReplay).toBe(false);
    expect(second.before.amount).toBe(20_000);
    expect(second.after.amount).toBe(18_000);
    expect(state.adjustments).toHaveLength(2);
    expect(state.adjustments.map((row) => row.idempotency_key)).toEqual([
      "key-first",
      "key-second",
    ]);
  });

  it("records a deferred receipt outcome for receipt-affecting corrections", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
      stagedGift: {
        id: "staged-1",
        status: "posted",
        review_reason: null,
        receipt_status: "sent",
        crm_post_status: "posted",
        twenty_record_id: null,
      },
      donor: { id: "donor-1", email: "donor@example.com", do_not_email: false },
    };

    const result = await applyContributionCorrection({
      ...baseInput(state),
      payload: {
        amount: 20_000,
        receiptDelivery: {
          choice: "defer",
          deferReason: "Donor asked us to wait",
        },
      },
      actorCapabilities: ["contributions.manage_receipts"],
    });

    expect(result.receiptOutcome).toMatchObject({
      status: "deferred",
      affectedFields: ["amount"],
      confirmed: { choice: "defer" },
    });
  });

  it("blocks updated receipt emails when the donor opted out", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
      stagedGift: {
        id: "staged-1",
        status: "posted",
        review_reason: null,
        receipt_status: "sent",
        crm_post_status: "posted",
        twenty_record_id: null,
      },
      donor: { id: "donor-1", email: "donor@example.com", do_not_email: true },
    };

    await expect(
      applyContributionCorrection({
        ...baseInput(state),
        payload: {
          amount: 20_000,
          receiptDelivery: { choice: "email" },
        },
        actorCapabilities: ["contributions.manage_receipts"],
      }),
    ).rejects.toMatchObject({
      message: expect.stringMatching(/opted out/i),
    });

    expect(state.adjustments).toHaveLength(0);
  });

  it("requires a receipt delivery choice when tenant policy demands it", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
      stagedGift: {
        id: "staged-1",
        status: "posted",
        review_reason: null,
        receipt_status: "sent",
        crm_post_status: "posted",
        twenty_record_id: null,
      },
      donor: { id: "donor-1", email: "donor@example.com", do_not_email: false },
      policy: {
        default_choice: "email",
        allow_defer: true,
        defer_reason_required: true,
        require_delivery_action: true,
        email_capability: "contributions.manage_receipts",
        pdf_capability: "contributions.manage_receipts",
      },
    };

    await expect(
      applyContributionCorrection({
        ...baseInput(state),
        payload: { amount: 20_000 },
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/requires choosing an updated receipt/i),
    });

    expect(state.adjustments).toHaveLength(0);
  });

  it("generates a durable PDF snapshot when staff choose PDF delivery", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
      stagedGift: {
        id: "staged-1",
        status: "posted",
        review_reason: null,
        receipt_status: "sent",
        crm_post_status: "posted",
        twenty_record_id: null,
      },
      donor: { id: "donor-1", email: null, do_not_email: false },
    };

    const result = await applyContributionCorrection({
      ...baseInput(state),
      payload: {
        amount: 20_000,
        receiptDelivery: { choice: "pdf" },
      },
      actorCapabilities: ["contributions.manage_receipts"],
    });

    expect(result.receiptOutcome).toMatchObject({
      status: "pdf_generated",
      snapshotId: "snap-1",
    });
    expect(state.snapshots).toHaveLength(1);
    expect(state.snapshots![0]).toMatchObject({ kind: "pdf" });
    // Versioned, self-contained render input (#263): the PDF renders from the
    // snapshot alone, so donor/gift identity is captured at correction time.
    expect(state.snapshots![0].content).toMatchObject({
      version: 1,
      donationId: DONATION_ID,
      donorName: "Anonymous",
      giftDate: "2026-05-01",
      currencyCode: "USD",
      effective: {
        amountCents: 20_000,
        fundId: null,
        missionaryId: null,
        paymentStatus: "completed",
      },
      designationLines: [
        expect.objectContaining({
          amountCents: 20_000,
          fundName: "General Fund",
        }),
      ],
      affectedFields: ["amount"],
      adjustmentId: "adj-1",
      generatedAt: expect.any(String),
    });
  });

  it("emails updated receipt snapshots without colliding with the original receipt send log", async () => {
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

    const originalReceiptKey =
      "donation-receipt/tenant-1/donation-1/staged-1";
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
      stagedGift: {
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
      },
      donor: {
        id: "donor-1",
        profile_id: null,
        name: "Ada Lovelace",
        email: "donor@example.com",
        do_not_email: false,
        do_not_contact: false,
      },
      emailSendLogs: [
        {
          id: "send-log-original",
          tenant_id: TENANT_ID,
          idempotency_key: originalReceiptKey,
        },
      ],
    };

    const result = await applyContributionCorrection({
      ...baseInput(state),
      payload: {
        amount: 20_000,
        receiptDelivery: { choice: "email" },
      },
      actorCapabilities: ["contributions.manage_receipts"],
    });

    const updatedReceiptKey =
      "contribution-receipt-snapshot/tenant-1/snap-1/email";
    expect(result.receiptOutcome).toMatchObject({
      status: "emailed",
      snapshotId: "snap-1",
      affectedFields: ["amount"],
    });
    expect(state.snapshots).toHaveLength(1);
    expect(state.snapshots![0]).toMatchObject({
      kind: "email",
      content: expect.objectContaining({
        effective: expect.objectContaining({ amountCents: 20_000 }),
        adjustmentId: "adj-1",
      }),
    });
    expect(sendEmailMock).toHaveBeenCalledWith(
      "re_decrypted",
      expect.objectContaining({
        subject: "Updated donation receipt for $200.00",
        html: expect.stringContaining("updated receipt amount"),
        text: expect.stringContaining("updated receipt amount is $200.00"),
        idempotencyKey: updatedReceiptKey,
      }),
    );
    expect(sendEmailMock.mock.calls[0]?.[1].idempotencyKey).not.toBe(
      originalReceiptKey,
    );
    expect(state.emailSendLogs).toHaveLength(2);
    expect(state.emailSendLogs!.map((row) => row.idempotency_key)).toEqual([
      originalReceiptKey,
      updatedReceiptKey,
    ]);
    expect(state.stagedGiftUpdates).toEqual([
      expect.objectContaining({
        receipt_status: "sent",
        receipt_send_log_id: "send-log-2",
      }),
    ]);
  });

  it("applies a fund correction when the fund exists for the tenant", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
      funds: [{ id: FUND_VALID, name: "Clean Water Initiative" }],
    };

    const result = await applyContributionCorrection({
      ...baseInput(state),
      actionType: "fund_correction",
      payload: { fundId: FUND_VALID },
      reason: "Donor redirected the gift",
    });

    expect(state.adjustments).toHaveLength(1);
    expect(state.adjustments[0]).toMatchObject({
      adjustment_type: "fund_correction",
      effective_values: { fundId: FUND_VALID },
    });
    expect(result.before).toEqual(
      expect.objectContaining({
        fundId: null,
        designationName: "General Fund",
      }),
    );
    expect(result.after).toEqual(
      expect.objectContaining({
        fundId: FUND_VALID,
        designationName: "Clean Water Initiative",
      }),
    );
    expect(result.status).toBe("applied");
  });

  it("rejects unknown, cross-tenant, or malformed fund IDs before writing", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
      funds: [FUND_VALID],
    };

    await expect(
      applyContributionCorrection({
        ...baseInput(state),
        actionType: "fund_correction",
        payload: { fundId: FUND_OTHER },
        reason: "Typo'd fund id",
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/unknown fund/i),
    });

    await expect(
      applyContributionCorrection({
        ...baseInput(state),
        actionType: "fund_correction",
        payload: { fundId: "not-a-real-uuid" },
        reason: "Pasted the wrong thing",
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/unknown fund/i),
    });

    expect(state.adjustments).toHaveLength(0);
  });

  it("rejects malformed reference payloads instead of clearing financial truth", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
      funds: [FUND_VALID],
    };

    await expect(
      applyContributionCorrection({
        ...baseInput(state),
        actionType: "fund_correction",
        payload: {},
        reason: "Malformed client payload",
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/fundId/),
    });

    await expect(
      applyContributionCorrection({
        ...baseInput(state),
        actionType: "allocation_correction",
        payload: {
          designationLines: [{ amountCents: 10_000, fundId: 42 }],
        },
        reason: "Malformed client payload",
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/fundId/),
    });

    expect(state.adjustments).toHaveLength(0);
  });

  it("allows allocation corrections to omit optional missionary IDs", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
      funds: [FUND_VALID],
    };

    const result = await applyContributionCorrection({
      ...baseInput(state),
      actionType: "allocation_correction",
      payload: { fundId: FUND_VALID },
      reason: "Reassign the fund only",
    });

    expect(state.adjustments).toHaveLength(1);
    expect(state.adjustments[0]).toMatchObject({
      effective_values: { fundId: FUND_VALID, missionaryId: null },
    });
    expect(result.status).toBe("applied");
  });

  it("allows a fund correction that explicitly clears the designation", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
    };

    const result = await applyContributionCorrection({
      ...baseInput(state),
      actionType: "fund_correction",
      payload: { fundId: null },
      reason: "Move to General Fund",
    });

    expect(state.adjustments).toHaveLength(1);
    expect(state.adjustments[0]).toMatchObject({
      effective_values: { fundId: null },
    });
    expect(result.status).toBe("applied");
  });

  it("validates payment-state corrections against the allowed status set", async () => {
    const state: StubState = {
      adjustments: [],
      insertCount: 0,
    };

    await applyContributionCorrection({
      ...baseInput(state),
      actionType: "payment_state_correction",
      payload: { status: " refunded " },
      reason: "Stripe state reconciled",
    });

    expect(state.adjustments[0]).toMatchObject({
      effective_values: { paymentStatus: "refunded" },
    });

    await expect(
      applyContributionCorrection({
        ...baseInput(state),
        actionType: "payment_state_correction",
        payload: { status: "not-a-status" },
        reason: "Bad status",
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/status must be one of/i),
    });
    expect(state.adjustments).toHaveLength(1);
  });
});
