import { describe, expect, it, vi } from "vitest";

import {
  createContributionCorrectionRequestInSupabase,
  decideContributionCorrectionRequest,
} from "../../../../../packages/api/src/admin/contribution-operations/correction-requests";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const TENANT_ID = "tenant-1";
const REQUEST_ID = "request-1";

interface RequestRow extends Record<string, unknown> {
  id: string;
  tenant_id: string;
  donation_id: string;
  action_type: string;
  payload: Record<string, unknown>;
  reason: string;
  requested_by_profile_id: string | null;
  source_surface: string;
  status: string;
}

interface StubState {
  request: RequestRow;
  auditInserts: Array<Record<string, unknown>>;
  insertedRequests?: Array<Record<string, unknown>>;
}

function pendingRequest(): RequestRow {
  return {
    id: REQUEST_ID,
    tenant_id: TENANT_ID,
    donation_id: "donation-1",
    action_type: "amount_correction",
    payload: { amount: 20_000 },
    reason: "Donor reported the wrong amount",
    requested_by_profile_id: "requester-1",
    source_surface: "donor_crm_record",
    status: "pending",
    expected_revision: null,
    receipt_delivery_proposal: {},
    decided_by_profile_id: null,
    decided_at: null,
    decision_reason: null,
    applied_adjustment_id: null,
    approval_task_id: null,
    follow_up_task_id: null,
    created_at: "2026-06-01T00:00:00.000Z",
  };
}

class QueryBuilder {
  private operation: "select" | "insert" | "update" = "select";
  private insertPayload: Record<string, unknown> | null = null;
  private updatePayload: Record<string, unknown> | null = null;
  private idempotencyKeyFilter: string | null = null;
  private statusFilter: string | null = null;

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
    if (this.table === "contribution_operation_audit_events") {
      this.state.auditInserts.push(payload);
    }
    return this;
  }

  update(payload: Record<string, unknown>) {
    this.operation = "update";
    this.updatePayload = payload;
    return this;
  }

  eq(column: string, value: unknown) {
    if (column === "status" && typeof value === "string") {
      this.statusFilter = value;
    }
    if (column === "idempotency_key" && typeof value === "string") {
      this.idempotencyKeyFilter = value;
    }
    return this;
  }

  order() {
    return this;
  }

  limit() {
    return this;
  }

  single() {
    return this;
  }

  maybeSingle() {
    return this;
  }

  private resolve(): {
    data: unknown;
    error: { code?: string; message: string } | null;
  } {
    if (this.table === "contribution_correction_requests") {
      if (this.operation === "insert" && this.insertPayload) {
        const insertedRequests = (this.state.insertedRequests ??= []);
        const idempotencyKey = this.insertPayload.idempotency_key;
        const duplicate =
          typeof idempotencyKey === "string" &&
          insertedRequests.some(
            (request) => request.idempotency_key === idempotencyKey,
          );

        if (duplicate) {
          return {
            data: null,
            error: {
              code: "23505",
              message: "duplicate correction request idempotency key",
            },
          };
        }

        const row = {
          id: `request-${insertedRequests.length + 1}`,
          created_at: "2026-06-01T00:00:00.000Z",
          updated_at: "2026-06-01T00:00:00.000Z",
          ...this.insertPayload,
        };
        insertedRequests.push(row);
        return { data: { id: row.id }, error: null };
      }

      if (this.operation === "update") {
        if (
          this.statusFilter &&
          this.state.request.status !== this.statusFilter
        ) {
          return { data: [], error: null };
        }
        Object.assign(this.state.request, this.updatePayload);
        return { data: [{ id: this.state.request.id }], error: null };
      }
      if (this.idempotencyKeyFilter) {
        const existing = (this.state.insertedRequests ?? []).find(
          (request) => request.idempotency_key === this.idempotencyKeyFilter,
        );
        return { data: existing ?? null, error: null };
      }
      return { data: { ...this.state.request }, error: null };
    }
    if (this.table === "contribution_approval_policies") {
      return { data: null, error: null };
    }
    if (this.table === "contribution_operation_audit_events") {
      return {
        data: { id: `audit-${this.state.auditInserts.length}` },
        error: null,
      };
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

function approverDependencies(state?: StubState) {
  return {
    applyCorrection: vi.fn().mockResolvedValue({
      before: { amount: 25_000 },
      after: { amount: 20_000 },
      status: "applied" as const,
      adjustmentId: "adj-1",
      idempotentReplay: false,
    }),
    createCorrectionRecord: vi.fn().mockResolvedValue("correction-1"),
    appendAuditEvent: vi.fn().mockImplementation(async (event) => {
      state?.auditInserts.push(event);
      return `audit-${state?.auditInserts.length ?? 1}`;
    }),
    loadContributionDetail: vi.fn().mockResolvedValue({ id: "donation-1" }),
  };
}

describe("createContributionCorrectionRequestInSupabase", () => {
  it("persists a pending request and returns the existing request on idempotent retry", async () => {
    const state: StubState = {
      request: pendingRequest(),
      auditInserts: [],
      insertedRequests: [],
    };
    const supabaseAdmin = createStub(state);
    const request = {
      tenantId: TENANT_ID,
      contributionId: "donation-1",
      actionType: "amount_correction" as const,
      payload: { amount: 20_000 },
      reason: "Donor reported the wrong amount",
      requestedByProfileId: "requester-1",
      sourceSurface: "donor_crm_record" as const,
      expectedRevision: "rev-1",
      idempotencyKey: "request-key-1",
      receiptDeliveryProposal: { choice: "defer" },
    };

    const firstId = await createContributionCorrectionRequestInSupabase({
      supabaseAdmin,
      request,
    });
    const secondId = await createContributionCorrectionRequestInSupabase({
      supabaseAdmin,
      request,
    });

    expect(firstId).toBe("request-1");
    expect(secondId).toBe(firstId);
    expect(state.insertedRequests).toHaveLength(1);
    expect(state.insertedRequests![0]).toMatchObject({
      tenant_id: TENANT_ID,
      donation_id: "donation-1",
      status: "pending",
      expected_revision: "rev-1",
      receipt_delivery_proposal: { choice: "defer" },
    });
  });
});

describe("decideContributionCorrectionRequest", () => {
  it("blocks the requester from approving their own request under separation of duties", async () => {
    const state: StubState = { request: pendingRequest(), auditInserts: [] };

    await expect(
      decideContributionCorrectionRequest({
        supabaseAdmin: createStub(state),
        tenantId: TENANT_ID,
        requestId: REQUEST_ID,
        decision: "approve",
        deciderProfileId: "requester-1",
        deciderCapabilities: ["contributions.approve_corrections"],
        dependencies: approverDependencies(state),
      }),
    ).rejects.toMatchObject({ status: 403 });

    expect(state.request.status).toBe("pending");
  });

  it("applies approved corrections through the shared contract and records the outcome", async () => {
    const state: StubState = { request: pendingRequest(), auditInserts: [] };
    const dependencies = approverDependencies(state);
    const recordOutcome = vi.fn().mockResolvedValue(undefined);

    const outcome = await decideContributionCorrectionRequest({
      supabaseAdmin: createStub(state),
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      decision: "approve",
      deciderProfileId: "approver-1",
      deciderCapabilities: [
        "contributions.approve_corrections",
        "contributions.apply_corrections",
      ],
      dependencies,
      recordOutcome,
    });

    // The approval task closes and the requester is notified (ADR-CD-027).
    expect(recordOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: "approved",
        request: expect.objectContaining({
          id: REQUEST_ID,
          status: "approved",
        }),
      }),
    );

    expect(dependencies.applyCorrection).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        contributionId: "donation-1",
        actionType: "amount_correction",
        payload: { amount: 20_000 },
        reason: "Donor reported the wrong amount",
        idempotencyKey: `correction-request-apply/${TENANT_ID}/${REQUEST_ID}`,
      }),
    );

    expect(state.request.status).toBe("approved");
    expect(state.request.decided_by_profile_id).toBe("approver-1");
    expect(state.request.applied_adjustment_id).toBe("adj-1");
    expect(outcome.result?.adjustmentId).toBe("adj-1");
    expect(
      state.auditInserts.some(
        (event) =>
          (event.downstreamEffects as Record<string, unknown> | undefined)
            ?.decision === "approved",
      ),
    ).toBe(true);
  });

  it("passes requester and approver receipt delivery choices into the approved correction payload", async () => {
    const state: StubState = { request: pendingRequest(), auditInserts: [] };
    state.request.receipt_delivery_proposal = {
      choice: "defer",
      deferReason: "Requester asked finance to wait",
    };
    const dependencies = approverDependencies(state);

    await decideContributionCorrectionRequest({
      supabaseAdmin: createStub(state),
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      decision: "approve",
      reason: "Finance reviewed the receipt plan",
      receiptDelivery: { choice: "pdf" },
      deciderProfileId: "approver-1",
      deciderCapabilities: [
        "contributions.approve_corrections",
        "contributions.apply_corrections",
      ],
      dependencies,
    });

    expect(dependencies.applyCorrection).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedRevision: null,
        payload: {
          amount: 20_000,
          receiptDelivery: { choice: "pdf" },
          requestedReceiptDelivery: {
            choice: "defer",
            deferReason: "Requester asked finance to wait",
          },
        },
      }),
    );
    expect(
      state.auditInserts.some(
        (event) =>
          (event.downstreamEffects as Record<string, unknown> | undefined)
            ?.receiptDeliveryChangedByApprover === true,
      ),
    ).toBe(true);
  });

  it("requires a rejection reason and records requester follow-up work", async () => {
    const state: StubState = { request: pendingRequest(), auditInserts: [] };

    await expect(
      decideContributionCorrectionRequest({
        supabaseAdmin: createStub(state),
        tenantId: TENANT_ID,
        requestId: REQUEST_ID,
        decision: "reject",
        reason: "  ",
        deciderProfileId: "approver-1",
        deciderCapabilities: ["contributions.approve_corrections"],
        dependencies: approverDependencies(state),
      }),
    ).rejects.toMatchObject({ status: 400 });

    const createFollowUpTask = vi.fn().mockResolvedValue("task-1");
    const recordOutcome = vi.fn().mockResolvedValue(undefined);
    const outcome = await decideContributionCorrectionRequest({
      supabaseAdmin: createStub(state),
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      decision: "reject",
      reason: "Amount does not match the bank deposit",
      deciderProfileId: "approver-1",
      deciderCapabilities: ["contributions.approve_corrections"],
      dependencies: approverDependencies(state),
      createFollowUpTask,
      recordOutcome,
    });

    expect(createFollowUpTask).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        decisionReason: "Amount does not match the bank deposit",
      }),
    );
    expect(state.request.status).toBe("rejected");
    expect(state.request.decision_reason).toBe(
      "Amount does not match the bank deposit",
    );
    expect(state.request.follow_up_task_id).toBe("task-1");
    expect(outcome.request.status).toBe("rejected");
    expect(recordOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: "rejected",
        request: expect.objectContaining({
          id: REQUEST_ID,
          status: "rejected",
        }),
      }),
    );
  });

  it("returns the recorded outcome for repeated decisions instead of duplicating work", async () => {
    const state: StubState = { request: pendingRequest(), auditInserts: [] };
    state.request.status = "approved";
    const dependencies = approverDependencies(state);

    const outcome = await decideContributionCorrectionRequest({
      supabaseAdmin: createStub(state),
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      decision: "approve",
      deciderProfileId: "approver-1",
      deciderCapabilities: ["contributions.approve_corrections"],
      dependencies,
    });

    expect(outcome.idempotentReplay).toBe(true);
    expect(dependencies.applyCorrection).not.toHaveBeenCalled();
    expect(state.auditInserts).toHaveLength(0);

    await expect(
      decideContributionCorrectionRequest({
        supabaseAdmin: createStub(state),
        tenantId: TENANT_ID,
        requestId: REQUEST_ID,
        decision: "reject",
        reason: "changed my mind",
        deciderProfileId: "approver-1",
        deciderCapabilities: ["contributions.approve_corrections"],
        dependencies,
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
