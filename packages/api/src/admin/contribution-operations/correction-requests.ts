import { executeContributionAction } from "./actions";
import {
  assertCanDecideCorrectionRequest,
  resolveCorrectionApprovalPolicy,
  type CorrectionApprovalPolicy,
  type CorrectionApprovalPolicyRow,
} from "./approval-policy";
import {
  parseReceiptDeliverySelection,
  resolveConfirmedReceiptDelivery,
  type ReceiptDeliverySelection,
} from "./receipt-delivery";
import { ApiHttpError } from "../../shared/http-errors";
import { asString, isRecord } from "../../shared/json-coerce";

import type {
  ContributionActionDependencies,
  ContributionActionResult,
  ContributionOperationAuditEventInput,
  ContributionActionType,
  ContributionSourceSurface,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseAdmin = AdminSupabaseClient;

type JsonRecord = Record<string, unknown>;

export type CorrectionRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "superseded";

export interface ContributionCorrectionRequest {
  id: string;
  tenantId: string;
  donationId: string;
  actionType: ContributionActionType;
  payload: Record<string, unknown>;
  reason: string;
  requestedByProfileId: string | null;
  sourceSurface: ContributionSourceSurface;
  status: CorrectionRequestStatus;
  expectedRevision: string | null;
  receiptDeliveryProposal: Record<string, unknown>;
  decidedByProfileId: string | null;
  decidedAt: string | null;
  decisionReason: string | null;
  appliedAdjustmentId: string | null;
  approvalTaskId: string | null;
  followUpTaskId: string | null;
  lastReminderAt: string | null;
  escalatedAt: string | null;
  createdAt: string;
}

function mapCorrectionRequestRow(
  row: JsonRecord,
): ContributionCorrectionRequest {
  return {
    id: asString(row.id) ?? "",
    tenantId: asString(row.tenant_id) ?? "",
    donationId: asString(row.donation_id) ?? "",
    actionType: (asString(row.action_type) ??
      "amount_correction") as ContributionActionType,
    payload: isRecord(row.payload) ? row.payload : {},
    reason: asString(row.reason) ?? "",
    requestedByProfileId: asString(row.requested_by_profile_id),
    sourceSurface: (asString(row.source_surface) ??
      "api") as ContributionSourceSurface,
    status: (asString(row.status) ?? "pending") as CorrectionRequestStatus,
    expectedRevision: asString(row.expected_revision),
    receiptDeliveryProposal: isRecord(row.receipt_delivery_proposal)
      ? row.receipt_delivery_proposal
      : {},
    decidedByProfileId: asString(row.decided_by_profile_id),
    decidedAt: asString(row.decided_at),
    decisionReason: asString(row.decision_reason),
    appliedAdjustmentId: asString(row.applied_adjustment_id),
    approvalTaskId: asString(row.approval_task_id),
    followUpTaskId: asString(row.follow_up_task_id),
    lastReminderAt: asString(row.last_reminder_at),
    escalatedAt: asString(row.escalated_at),
    createdAt: asString(row.created_at) ?? new Date(0).toISOString(),
  };
}

export async function createContributionCorrectionRequestInSupabase(input: {
  supabaseAdmin: SupabaseAdmin;
  request: {
    tenantId: string;
    contributionId: string;
    actionType: ContributionActionType;
    payload: Record<string, unknown>;
    reason: string;
    requestedByProfileId: string | null;
    sourceSurface: ContributionSourceSurface;
    expectedRevision?: string | null;
    idempotencyKey?: string | null;
    receiptDeliveryProposal?: Record<string, unknown> | null;
  };
}): Promise<string> {
  const insertResult = await input.supabaseAdmin
    .from("contribution_correction_requests")
    .insert({
      tenant_id: input.request.tenantId,
      donation_id: input.request.contributionId,
      action_type: input.request.actionType,
      payload: input.request.payload,
      reason: input.request.reason,
      requested_by_profile_id: input.request.requestedByProfileId,
      source_surface: input.request.sourceSurface,
      status: "pending",
      expected_revision: input.request.expectedRevision ?? null,
      idempotency_key: input.request.idempotencyKey ?? null,
      receipt_delivery_proposal: input.request.receiptDeliveryProposal ?? {},
    })
    .select("id")
    .single();

  if (insertResult.error) {
    const isDuplicateKey =
      insertResult.error.code === "23505" &&
      Boolean(input.request.idempotencyKey);
    if (!isDuplicateKey) {
      throw new Error(insertResult.error.message);
    }

    const existing = await input.supabaseAdmin
      .from("contribution_correction_requests")
      .select("id")
      .eq("tenant_id", input.request.tenantId)
      .eq("idempotency_key", input.request.idempotencyKey!)
      .maybeSingle();

    if (existing.error || !isRecord(existing.data)) {
      throw new Error(
        existing.error?.message ??
          "Correction request already exists but could not be loaded.",
      );
    }
    return asString(existing.data.id) ?? "";
  }

  return asString((insertResult.data as JsonRecord | null)?.id) ?? "";
}

export async function loadContributionCorrectionRequest(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  requestId: string;
}): Promise<ContributionCorrectionRequest> {
  const { data, error } = await input.supabaseAdmin
    .from("contribution_correction_requests")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("id", input.requestId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!isRecord(data)) {
    throw new ApiHttpError(404, "Correction request not found.");
  }

  return mapCorrectionRequestRow(data);
}

export async function loadCorrectionApprovalPolicy(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
}): Promise<CorrectionApprovalPolicy> {
  const { data, error } = await input.supabaseAdmin
    .from("contribution_approval_policies")
    .select(
      "ownership_mode, suppressed_gates, stronger_approval_categories, reminder_hours, escalation_hours",
    )
    .eq("tenant_id", input.tenantId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return resolveCorrectionApprovalPolicy(
    (data as CorrectionApprovalPolicyRow | null) ?? null,
  );
}

async function recordDecision(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  requestId: string;
  status: "approved" | "rejected";
  deciderProfileId: string | null;
  decisionReason: string | null;
  appliedAdjustmentId?: string | null;
  followUpTaskId?: string | null;
}): Promise<boolean> {
  const { data, error } = await input.supabaseAdmin
    .from("contribution_correction_requests")
    .update({
      status: input.status,
      decided_by_profile_id: input.deciderProfileId,
      decided_at: new Date().toISOString(),
      decision_reason: input.decisionReason,
      applied_adjustment_id: input.appliedAdjustmentId ?? null,
      follow_up_task_id: input.followUpTaskId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", input.tenantId)
    .eq("id", input.requestId)
    .eq("status", "pending")
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  return Array.isArray(data) && data.length > 0;
}

async function appendDecisionAuditEvent(input: {
  dependencies: ContributionActionDependencies;
  event: ContributionOperationAuditEventInput;
}): Promise<string> {
  const appendAuditEvent = input.dependencies.appendAuditEvent;
  if (!appendAuditEvent) {
    throw new ApiHttpError(
      501,
      "Contribution operation dependency missing: appendAuditEvent",
    );
  }

  return appendAuditEvent(input.event);
}

export interface DecideCorrectionRequestInput {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  requestId: string;
  decision: "approve" | "reject";
  reason?: string | null;
  deciderProfileId: string | null;
  deciderCapabilities: string[];
  dependencies: ContributionActionDependencies;
  policy?: CorrectionApprovalPolicy;
  /**
   * Approver's updated receipt delivery choice (ADR-CD-030). When omitted,
   * the requester's proposal stands; when provided, it overrides and the
   * change is audited.
   */
  receiptDelivery?: ReceiptDeliverySelection | null;
  /** Optional hook creating requester follow-up work on rejection (#262). */
  createFollowUpTask?: (input: {
    tenantId: string;
    request: ContributionCorrectionRequest;
    decisionReason: string;
  }) => Promise<string | null>;
  /** Optional outcome follow-through for future task closure/notifications. */
  recordOutcome?: (input: {
    supabaseAdmin: SupabaseAdmin;
    tenantId: string;
    request: ContributionCorrectionRequest;
    decision: "approved" | "rejected";
    decisionReason: string | null;
  }) => Promise<void>;
}

export interface DecideCorrectionRequestOutcome {
  request: ContributionCorrectionRequest;
  result?: ContributionActionResult;
  /** Policy actually used to authorize/project a newly applied result. */
  approvalPolicy?: CorrectionApprovalPolicy;
  idempotentReplay?: boolean;
}

async function recordCorrectionDecisionOutcome(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  request: ContributionCorrectionRequest;
  decision: "approved" | "rejected";
  decisionReason: string | null;
  recordOutcome?: DecideCorrectionRequestInput["recordOutcome"];
}): Promise<void> {
  if (!input.recordOutcome) {
    return;
  }

  await input.recordOutcome({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    request: input.request,
    decision: input.decision,
    decisionReason: input.decisionReason,
  });
}

/**
 * Approves or rejects a pending correction request (ADR-CD-027).
 *
 * Approval applies the correction through the shared contribution operation
 * contract; rejection requires a reason and may create requester follow-up
 * work. Outcomes are audited with actor, timestamp, decision, and reason,
 * and repeated decisions never duplicate adjustments.
 */
export async function decideContributionCorrectionRequest(
  input: DecideCorrectionRequestInput,
): Promise<DecideCorrectionRequestOutcome> {
  const request = await loadContributionCorrectionRequest(input);

  if (request.status !== "pending") {
    const sameOutcome =
      (request.status === "approved" && input.decision === "approve") ||
      (request.status === "rejected" && input.decision === "reject");
    if (sameOutcome) {
      const replayDecision =
        request.status === "approved" ? "approved" : "rejected";
      await recordCorrectionDecisionOutcome({
        supabaseAdmin: input.supabaseAdmin,
        tenantId: input.tenantId,
        request,
        decision: replayDecision,
        decisionReason: request.decisionReason,
        recordOutcome: input.recordOutcome,
      });
      return { request, idempotentReplay: true };
    }
    throw new ApiHttpError(
      409,
      `This correction request was already ${request.status}.`,
    );
  }

  const policy =
    input.policy ??
    (await loadCorrectionApprovalPolicy({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
    }));

  assertCanDecideCorrectionRequest({
    policy,
    request: { requestedByProfileId: request.requestedByProfileId },
    deciderProfileId: input.deciderProfileId,
    deciderCapabilities: input.deciderCapabilities,
  });

  if (input.decision === "reject") {
    const decisionReason = input.reason?.trim();
    if (!decisionReason) {
      throw new ApiHttpError(
        400,
        "A rejection reason is required so the requester knows what to fix.",
      );
    }

    const followUpTaskId = input.createFollowUpTask
      ? await input.createFollowUpTask({
          tenantId: input.tenantId,
          request,
          decisionReason,
        })
      : null;

    const updated = await recordDecision({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      requestId: input.requestId,
      status: "rejected",
      deciderProfileId: input.deciderProfileId,
      decisionReason,
      followUpTaskId,
    });
    if (!updated) {
      throw new ApiHttpError(
        409,
        "This correction request was decided concurrently. Reload to see the outcome.",
      );
    }

    await appendDecisionAuditEvent({
      dependencies: input.dependencies,
      event: {
        tenantId: input.tenantId,
        actorProfileId: input.deciderProfileId,
        contributionId: request.donationId,
        actionType: request.actionType,
        sourceSurface: request.sourceSurface,
        reason: decisionReason,
        downstreamEffects: {
          correctionRequestId: request.id,
          decision: "rejected",
          followUpTaskId,
        },
      },
    });

    const decidedRequest = await loadContributionCorrectionRequest(input);

    await recordCorrectionDecisionOutcome({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      request: decidedRequest,
      decision: "rejected",
      decisionReason,
      recordOutcome: input.recordOutcome,
    });

    return {
      request: decidedRequest,
    };
  }

  const receiptDelivery = resolveConfirmedReceiptDelivery({
    proposal: parseReceiptDeliverySelection(request.receiptDeliveryProposal),
    approverSelection: input.receiptDelivery ?? null,
  });
  const applicationPayload = {
    ...request.payload,
    ...(receiptDelivery.confirmed
      ? {
          receiptDelivery: receiptDelivery.confirmed,
          requestedReceiptDelivery: receiptDelivery.requested,
        }
      : {}),
  };

  const result = await executeContributionAction({
    tenantId: input.tenantId,
    actorProfileId: input.deciderProfileId,
    actorPermissions: [],
    actorCapabilities: input.deciderCapabilities,
    approvalPolicy: policy,
    approvedRequestId: request.id,
    sourceSurface: request.sourceSurface,
    contributionId: request.donationId,
    actionType: request.actionType,
    reason: request.reason,
    confirmationToken: `correction-request/${request.id}`,
    // The stored pre-request expectedRevision is stale by construction:
    // creating the request inserts a request row and an audit event, both of
    // which change the detail revision fingerprint, so replaying it at apply
    // time would 409 every approval. Concurrency protection here is the
    // pending-status compare-and-set in recordDecision plus the approver's
    // review of current state (#265).
    expectedRevision: null,
    idempotencyKey: `correction-request-apply/${input.tenantId}/${request.id}`,
    payload: applicationPayload,
    dependencies: {
      ...input.dependencies,
      validateApprovedCorrectionRequest: async (approvedRequest) => {
        const matchesRequest =
          approvedRequest.tenantId === input.tenantId &&
          approvedRequest.contributionId === request.donationId &&
          approvedRequest.actionType === request.actionType &&
          approvedRequest.approvedRequestId === request.id;

        if (!matchesRequest) {
          throw new ApiHttpError(
            409,
            "Approved correction request does not match this contribution action.",
          );
        }

        return {
          payload: applicationPayload,
          reason: request.reason,
        };
      },
    },
  });

  const updated = await recordDecision({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    requestId: input.requestId,
    status: "approved",
    deciderProfileId: input.deciderProfileId,
    decisionReason: input.reason?.trim() || null,
    appliedAdjustmentId: result.adjustmentId ?? null,
  });
  if (!updated) {
    throw new ApiHttpError(
      409,
      "This correction request was decided concurrently. Reload to see the outcome.",
    );
  }

  await appendDecisionAuditEvent({
    dependencies: input.dependencies,
    event: {
      tenantId: input.tenantId,
      actorProfileId: input.deciderProfileId,
      contributionId: request.donationId,
      actionType: request.actionType,
      sourceSurface: request.sourceSurface,
      reason: input.reason?.trim() || request.reason,
      downstreamEffects: {
        correctionRequestId: request.id,
        decision: "approved",
        adjustmentId: result.adjustmentId ?? null,
        receiptSnapshotId: result.receiptOutcome?.snapshotId ?? null,
        receiptDeliveryRequested: receiptDelivery.requested,
        receiptDeliveryConfirmed: receiptDelivery.confirmed,
        receiptDeliveryChangedByApprover: receiptDelivery.changedByApprover,
      },
    },
  });

  const decidedRequest = await loadContributionCorrectionRequest(input);

  await recordCorrectionDecisionOutcome({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    request: decidedRequest,
    decision: "approved",
    decisionReason: input.reason?.trim() || null,
    recordOutcome: input.recordOutcome,
  });

  return {
    request: decidedRequest,
    result,
    approvalPolicy: policy,
  };
}
