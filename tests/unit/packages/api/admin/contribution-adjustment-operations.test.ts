import { describe, expect, it } from "vitest";

import { applyContributionCorrection } from "../../../../../packages/api/src/admin/contribution-operations/operations";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const TENANT_ID = "tenant-1";
const DONATION_ID = "donation-1";

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
  donationUpdates: Array<Record<string, unknown>>;
  insertCount: number;
  /** When set, the gift has a staged gift with a sent receipt. */
  stagedGift?: Record<string, unknown> | null;
  donor?: Record<string, unknown> | null;
  snapshots?: Array<Record<string, unknown>>;
  /** Fund ids that exist for this tenant (for correction reference checks). */
  funds?: string[];
  /** Missionary ids that exist for this tenant. */
  missionaries?: string[];
}

class QueryBuilder {
  private operation: "select" | "insert" | "update" = "select";
  private insertPayload: Record<string, unknown> | null = null;
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
    if (this.table === "donations") {
      this.state.donationUpdates.push(payload);
    }
    return this;
  }

  eq() {
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
    if (this.table === "donations" && this.operation === "select") {
      return { data: donationRow, error: null };
    }
    if (this.table === "donations" && this.operation === "update") {
      return { data: null, error: null };
    }
    if (this.table === "staged_gifts") {
      return { data: this.state.stagedGift ?? null, error: null };
    }
    if (this.table === "donors") {
      return { data: this.state.donor ?? null, error: null };
    }
    if (this.table === "staged_gift_allocations") {
      return { data: [], error: null };
    }
    if (this.table === "funds") {
      const valid = this.state.funds ?? [];
      const rows = this.inValues
        .filter((id) => valid.includes(id as string))
        .map((id) => ({ id }));
      return { data: rows, error: null };
    }
    if (this.table === "missionaries") {
      const valid = this.state.missionaries ?? [];
      const rows = this.inValues
        .filter((id) => valid.includes(id as string))
        .map((id) => ({ id }));
      return { data: rows, error: null };
    }
    if (this.table === "contribution_receipt_delivery_policies") {
      return { data: null, error: null };
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
    if (
      this.table === "contribution_operation_audit_events" ||
      this.table === "contribution_corrections"
    ) {
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
    sourceSurface: "contribution_hub",
  };
}

describe("applyContributionCorrection (adjustment records)", () => {
  it("writes an adjustment record and never rewrites the original donation", async () => {
    const state: StubState = {
      adjustments: [],
      donationUpdates: [],
      insertCount: 0,
    };

    const result = await applyContributionCorrection({
      ...baseInput(state),
      expectedRevision: "2026-05-01T00:00:00.000Z#0",
      idempotencyKey: "key-1",
    });

    expect(state.donationUpdates).toHaveLength(0);
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
      donationUpdates: [],
      insertCount: 0,
    };

    await expect(
      applyContributionCorrection({
        ...baseInput(state),
        expectedRevision: "2026-04-01T00:00:00.000Z#0",
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: expect.stringMatching(/reload the latest detail/i),
    });

    expect(state.adjustments).toHaveLength(0);
    expect(state.donationUpdates).toHaveLength(0);
  });

  it("records a deferred receipt outcome with the changed fields for receipt-affecting corrections", async () => {
    const state: StubState = {
      adjustments: [],
      donationUpdates: [],
      insertCount: 0,
      stagedGift: {
        id: "staged-1",
        donation_id: DONATION_ID,
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
      donationUpdates: [],
      insertCount: 0,
      stagedGift: {
        id: "staged-1",
        donation_id: DONATION_ID,
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

  it("generates a durable PDF snapshot when staff choose PDF delivery", async () => {
    const state: StubState = {
      adjustments: [],
      donationUpdates: [],
      insertCount: 0,
      stagedGift: {
        id: "staged-1",
        donation_id: DONATION_ID,
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
  });

  it("applies a fund correction when the fund exists for the tenant", async () => {
    const state: StubState = {
      adjustments: [],
      donationUpdates: [],
      insertCount: 0,
      funds: ["fund-valid"],
    };

    const result = await applyContributionCorrection({
      ...baseInput(state),
      actionType: "fund_correction",
      payload: { fundId: "fund-valid" },
      reason: "Donor redirected the gift",
    });

    expect(state.adjustments).toHaveLength(1);
    expect(state.adjustments[0]).toMatchObject({
      adjustment_type: "fund_correction",
      effective_values: { fundId: "fund-valid" },
    });
    expect(result.status).toBe("applied");
  });

  it("rejects a fund correction with an unknown/cross-tenant fund and writes nothing", async () => {
    const state: StubState = {
      adjustments: [],
      donationUpdates: [],
      insertCount: 0,
      funds: ["fund-valid"],
    };

    await expect(
      applyContributionCorrection({
        ...baseInput(state),
        actionType: "fund_correction",
        payload: { fundId: "fund-from-another-tenant" },
        reason: "Typo'd fund id",
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/unknown fund/i),
    });

    expect(state.adjustments).toHaveLength(0);
  });

  it("rejects an allocation correction when any line references an unknown fund", async () => {
    const state: StubState = {
      adjustments: [],
      donationUpdates: [],
      insertCount: 0,
      funds: ["fund-valid"],
    };

    await expect(
      applyContributionCorrection({
        ...baseInput(state),
        actionType: "allocation_correction",
        payload: {
          designationLines: [
            { amountCents: 10_000, fundId: "fund-valid" },
            { amountCents: 15_000, fundId: "fund-bogus" },
          ],
        },
        reason: "Split the gift",
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/unknown fund/i),
    });

    expect(state.adjustments).toHaveLength(0);
  });

  it("allows a fund correction that clears the designation (null fund)", async () => {
    const state: StubState = {
      adjustments: [],
      donationUpdates: [],
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

  it("returns the existing adjustment on idempotent retry instead of double-applying", async () => {
    const state: StubState = {
      adjustments: [],
      donationUpdates: [],
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
});
