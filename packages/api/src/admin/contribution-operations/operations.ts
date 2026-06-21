import { buildContributionDetail } from "./detail-read-model";
import { assertAllowedPaymentStateCorrectionStatus } from "./payment-status-allowlist";
import {
  computeReceiptAffectedFields,
  parseReceiptDeliverySelection,
  resolveTenantReceiptDeliveryPolicy,
  validateReceiptDeliverySelection,
} from "./receipt-delivery";
import { sendStagedGiftReceipt } from "../../giving/receipts";
import { ApiHttpError } from "../../shared/http-errors";
import { mapContributionAdjustmentRow } from "../contribution-shared/effective-values";

import type { ContributionDetail } from "./detail-read-model";
import type {
  ReceiptDeliveryOutcome,
  ReceiptDeliverySelection,
  TenantReceiptDeliveryPolicyRow,
} from "./receipt-delivery";
import type {
  ContributionActionType,
  ContributionSourceSurface,
} from "./types";
import type {
  ContributionAdjustmentEffectiveValues,
  ContributionAdjustmentRecord,
} from "../contribution-shared/effective-values";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseAdmin = AdminSupabaseClient;
type JsonRecord = Record<string, unknown>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function assertNoError(
  error: { message?: string } | null,
  fallback: string,
): void {
  if (error) {
    throw new Error(error.message ?? fallback);
  }
}

function normalizeDonation(row: JsonRecord) {
  return {
    id: asString(row.id) ?? "",
    tenantId: asString(row.tenant_id) ?? "",
    donorId: asString(row.donor_id),
    missionaryId: asString(row.missionary_id),
    fundId: asString(row.fund_id),
    amount: asNumber(row.amount),
    currency: asString(row.currency) ?? "usd",
    status: asString(row.status),
    donationType: asString(row.donation_type),
    paymentMethod: asString(row.payment_method),
    isRecurring: row.is_recurring === true,
    recurringInterval: asString(row.recurring_interval),
    notes: asString(row.notes),
    stripePaymentIntentId: asString(row.stripe_payment_intent_id),
    stripeChargeId: asString(row.stripe_charge_id),
    giftDate:
      asString(row.gift_date) ??
      asString(row.created_at) ??
      new Date(0).toISOString(),
    campaignId: asString(row.campaign_id),
    pledgeId: asString(row.pledge_id),
    processedAt: asString(row.processed_at),
    completedAt: asString(row.completed_at),
    failedAt: asString(row.failed_at),
    errorCode: asString(row.error_code),
    errorMessage: asString(row.error_message),
    refundedAt: asString(row.refunded_at),
    refundAmount: asNumber(row.refund_amount),
    source: asString(row.source),
    createdAt: asString(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: asString(row.updated_at) ?? new Date(0).toISOString(),
  };
}

async function loadContributionAdjustments(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  contributionId: string;
}): Promise<ContributionAdjustmentRecord[]> {
  const { data, error } = await input.supabaseAdmin
    .from("contribution_adjustments")
    .select(
      "id, adjustment_type, status, effective_values, reason, actor_profile_id, source_surface, created_at",
    )
    .eq("tenant_id", input.tenantId)
    .eq("donation_id", input.contributionId)
    .order("created_at", { ascending: true });

  assertNoError(error, "Failed to load contribution adjustments.");

  return ((data ?? []) as JsonRecord[]).map(mapContributionAdjustmentRow);
}

async function loadContributionOperationDetail(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  contributionId: string;
}): Promise<ContributionDetail> {
  const donationResult = await input.supabaseAdmin
    .from("donations")
    .select(
      "id, tenant_id, donor_id, missionary_id, fund_id, amount, currency, status, donation_type, payment_method, is_recurring, recurring_interval, notes, stripe_payment_intent_id, gift_date, campaign_id, pledge_id, processed_at, completed_at, failed_at, error_code, error_message, stripe_charge_id, refunded_at, refund_amount, source, created_at, updated_at",
    )
    .eq("tenant_id", input.tenantId)
    .eq("id", input.contributionId)
    .single();

  if (donationResult.error || !isRecord(donationResult.data)) {
    throw new ApiHttpError(404, "Contribution not found.");
  }

  const donation = normalizeDonation(donationResult.data);
  const [adjustments, stagedGiftResult, auditResult, correctionResult] =
    await Promise.all([
      loadContributionAdjustments(input),
      input.supabaseAdmin
        .from("staged_gifts")
        .select(
          "id, donation_id, status, review_reason, receipt_status, crm_post_status, twenty_record_id",
        )
        .eq("tenant_id", input.tenantId)
        .eq("donation_id", input.contributionId)
        .maybeSingle(),
      input.supabaseAdmin
        .from("contribution_operation_audit_events")
        .select("id, operation, source_surface, reason, created_at")
        .eq("tenant_id", input.tenantId)
        .eq("donation_id", input.contributionId)
        .order("created_at", { ascending: false })
        .limit(50),
      input.supabaseAdmin
        .from("contribution_corrections")
        .select("id, correction_type, status")
        .eq("tenant_id", input.tenantId)
        .eq("donation_id", input.contributionId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  assertNoError(stagedGiftResult.error, "Failed to load staged gift.");
  assertNoError(auditResult.error, "Failed to load contribution audit.");
  assertNoError(
    correctionResult.error,
    "Failed to load contribution corrections.",
  );

  const stagedGift = isRecord(stagedGiftResult.data)
    ? {
        id: asString(stagedGiftResult.data.id) ?? "",
        status: asString(stagedGiftResult.data.status),
        receiptStatus: asString(stagedGiftResult.data.receipt_status),
        crmPostStatus: asString(stagedGiftResult.data.crm_post_status),
        reviewReason: asString(stagedGiftResult.data.review_reason),
        twentyRecordId: asString(stagedGiftResult.data.twenty_record_id),
      }
    : null;

  return buildContributionDetail({
    donation,
    donor: donation.donorId
      ? {
          id: donation.donorId,
          profileId: null,
          name: null,
          email: null,
          phone: null,
          location: null,
          organization: null,
        }
      : null,
    fund: donation.fundId ? { id: donation.fundId, name: null } : null,
    missionary: donation.missionaryId
      ? { id: donation.missionaryId, name: null }
      : null,
    stagedGift,
    auditEvents: ((auditResult.data ?? []) as JsonRecord[]).map((event) => ({
      id: asString(event.id) ?? "",
      actionType: asString(event.operation) ?? "unknown",
      sourceSurface: asString(event.source_surface) ?? "api",
      reason: asString(event.reason),
      createdAt: asString(event.created_at) ?? new Date(0).toISOString(),
    })),
    corrections: ((correctionResult.data ?? []) as JsonRecord[]).map(
      (correction) => ({
        id: asString(correction.id) ?? "",
        correctionType: asString(correction.correction_type) ?? "unknown",
        status: asString(correction.status) ?? "pending",
      }),
    ),
    correctionRequests: [],
    adjustments,
    allocations: [],
    allocationFunds: [],
    allocationMissionaries: [],
    crmLinks: [],
  });
}

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function collectCorrectionReferenceIds(
  effectiveValues: ContributionAdjustmentEffectiveValues,
): {
  fundIds: string[];
  missionaryIds: string[];
} {
  const fundIds = new Set<string>();
  const missionaryIds = new Set<string>();
  const addFund = (value: unknown) => {
    if (typeof value === "string" && value.length > 0) {
      fundIds.add(value);
    }
  };
  const addMissionary = (value: unknown) => {
    if (typeof value === "string" && value.length > 0) {
      missionaryIds.add(value);
    }
  };

  addFund(effectiveValues.fundId);
  addMissionary(effectiveValues.missionaryId);

  const lines = effectiveValues.designationLines;
  if (Array.isArray(lines)) {
    for (const line of lines) {
      addFund(line.fundId);
      addMissionary(line.missionaryId);
    }
  }

  return { fundIds: [...fundIds], missionaryIds: [...missionaryIds] };
}

async function findMissingReferenceIds(input: {
  supabaseAdmin: SupabaseAdmin;
  table: "funds" | "missionaries";
  tenantId: string;
  ids: string[];
}): Promise<string[]> {
  const queryableIds = input.ids.filter(isUuid);
  const { data, error } =
    queryableIds.length > 0
      ? await input.supabaseAdmin
          .from(input.table)
          .select("id")
          .eq("tenant_id", input.tenantId)
          .in("id", queryableIds)
      : { data: [], error: null };
  if (error) {
    throw new Error(error.message);
  }

  const found = new Set(
    ((data ?? []) as Array<{ id: string }>).map((row) => row.id),
  );
  return input.ids.filter((id) => !found.has(id));
}

async function assertCorrectionReferencesExist(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  effectiveValues: ContributionAdjustmentEffectiveValues;
}): Promise<void> {
  const { fundIds, missionaryIds } = collectCorrectionReferenceIds(
    input.effectiveValues,
  );

  if (fundIds.length > 0) {
    const missing = await findMissingReferenceIds({
      supabaseAdmin: input.supabaseAdmin,
      table: "funds",
      tenantId: input.tenantId,
      ids: fundIds,
    });
    if (missing.length > 0) {
      throw new ApiHttpError(
        400,
        `Unknown fund for this organization: ${missing.join(", ")}.`,
      );
    }
  }

  if (missionaryIds.length > 0) {
    const missing = await findMissingReferenceIds({
      supabaseAdmin: input.supabaseAdmin,
      table: "missionaries",
      tenantId: input.tenantId,
      ids: missionaryIds,
    });
    if (missing.length > 0) {
      throw new ApiHttpError(
        400,
        `Unknown missionary for this organization: ${missing.join(", ")}.`,
      );
    }
  }
}

function requireReferenceIdOrNull(
  value: unknown,
  field: string,
): string | null {
  if (value === null) {
    return null;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  throw new ApiHttpError(
    400,
    `${field} must be a non-empty id string or null.`,
  );
}

function optionalReferenceIdOrNull(
  value: unknown,
  field: string,
): string | null {
  if (value === undefined) {
    return null;
  }
  return requireReferenceIdOrNull(value, field);
}

function correctionEffectiveValues(
  actionType: ContributionActionType,
  payload: Record<string, unknown>,
): ContributionAdjustmentEffectiveValues {
  if (actionType === "amount_correction") {
    const amount = payload.amount;
    if (
      typeof amount !== "number" ||
      !Number.isSafeInteger(amount) ||
      amount < 0
    ) {
      throw new ApiHttpError(
        400,
        "amount must be a non-negative safe integer.",
      );
    }
    return { amountCents: amount };
  }

  if (
    actionType === "designation_correction" ||
    actionType === "fund_correction"
  ) {
    return { fundId: requireReferenceIdOrNull(payload.fundId, "fundId") };
  }

  if (actionType === "allocation_correction") {
    const designationLines = payload.designationLines;
    if (Array.isArray(designationLines)) {
      const lines = designationLines.map((line, index) => {
        if (!isRecord(line)) {
          throw new ApiHttpError(400, "designationLines must be objects.");
        }
        const amountCents = line.amountCents;
        if (
          typeof amountCents !== "number" ||
          !Number.isSafeInteger(amountCents) ||
          amountCents < 0
        ) {
          throw new ApiHttpError(
            400,
            "Each designation line needs a non-negative amountCents safe integer.",
          );
        }
        return {
          id:
            typeof line.id === "string" && line.id.trim()
              ? line.id.trim()
              : `line-${index + 1}`,
          amountCents,
          fundId: optionalReferenceIdOrNull(line.fundId, "fundId"),
          missionaryId: optionalReferenceIdOrNull(
            line.missionaryId,
            "missionaryId",
          ),
          memo: typeof line.memo === "string" ? line.memo : null,
        };
      });
      return { designationLines: lines };
    }

    return {
      fundId: optionalReferenceIdOrNull(payload.fundId, "fundId"),
      missionaryId: optionalReferenceIdOrNull(
        payload.missionaryId,
        "missionaryId",
      ),
    };
  }

  if (actionType === "payment_state_correction") {
    const status = payload.status;
    if (typeof status !== "string" || status.trim().length === 0) {
      throw new ApiHttpError(400, "status is required.");
    }
    const normalizedStatus = status.trim();
    assertAllowedPaymentStateCorrectionStatus(normalizedStatus);
    return { paymentStatus: normalizedStatus };
  }

  throw new ApiHttpError(
    501,
    `${actionType} requires a dedicated operation adapter before it can be applied.`,
  );
}

function summarizeEffectiveDetail(detail: ContributionDetail) {
  return {
    amount: detail.effective.amountCents,
    donorId: detail.donor?.id ?? null,
    fundId: detail.effective.fundId,
    missionaryId: detail.effective.missionaryId,
    status: detail.effective.paymentStatus,
  };
}

async function loadReceiptDeliveryContext(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  donorId: string | null;
}) {
  const [policyResult, donorResult] = await Promise.all([
    input.supabaseAdmin
      .from("contribution_receipt_delivery_policies")
      .select(
        "default_choice, allow_defer, defer_reason_required, require_delivery_action, email_capability, pdf_capability",
      )
      .eq("tenant_id", input.tenantId)
      .maybeSingle(),
    input.donorId
      ? input.supabaseAdmin
          .from("donors")
          .select("email, do_not_email")
          .eq("tenant_id", input.tenantId)
          .eq("id", input.donorId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  assertNoError(policyResult.error, "Failed to load receipt delivery policy.");
  assertNoError(donorResult.error, "Failed to load donor receipt context.");

  const donorRow = donorResult.data as {
    email?: string | null;
    do_not_email?: boolean | null;
  } | null;

  return {
    policy: resolveTenantReceiptDeliveryPolicy(
      (policyResult.data as TenantReceiptDeliveryPolicyRow | null) ?? null,
    ),
    donor: {
      email: donorRow?.email ?? null,
      doNotEmail: donorRow?.do_not_email === true,
    },
  };
}

async function insertReceiptSnapshot(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  contributionId: string;
  adjustmentId: string | null;
  kind: "email" | "pdf";
  content: Record<string, unknown>;
}): Promise<string | null> {
  const { data, error } = await input.supabaseAdmin
    .from("contribution_receipt_snapshots")
    .insert({
      tenant_id: input.tenantId,
      donation_id: input.contributionId,
      adjustment_id: input.adjustmentId,
      kind: input.kind,
      content: input.content,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const id = (data as Record<string, unknown> | null)?.id;
  return typeof id === "string" ? id : null;
}

async function runReceiptDelivery(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  contributionId: string;
  adjustmentId: string | null;
  stagedGiftId: string | null;
  selection: ReceiptDeliverySelection;
  affectedFields: string[];
  requested: ReceiptDeliverySelection | null;
  snapshotContent: Record<string, unknown>;
}): Promise<ReceiptDeliveryOutcome> {
  const base = {
    affectedFields: input.affectedFields,
    requested: input.requested,
    confirmed: input.selection,
  };

  if (input.selection.choice === "defer") {
    return {
      ...base,
      status: "deferred",
      reason: input.selection.deferReason ?? null,
      snapshotId: null,
    };
  }

  if (input.selection.choice === "pdf") {
    const snapshotId = await insertReceiptSnapshot({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      contributionId: input.contributionId,
      adjustmentId: input.adjustmentId,
      kind: "pdf",
      content: input.snapshotContent,
    });
    return { ...base, status: "pdf_generated", reason: null, snapshotId };
  }

  if (!input.stagedGiftId) {
    return {
      ...base,
      status: "blocked",
      reason:
        "This gift has no staged gift workflow record, so an updated receipt email cannot be sent.",
      snapshotId: null,
    };
  }

  await sendStagedGiftReceipt({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    stagedGiftId: input.stagedGiftId,
  });
  const snapshotId = await insertReceiptSnapshot({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    contributionId: input.contributionId,
    adjustmentId: input.adjustmentId,
    kind: "email",
    content: input.snapshotContent,
  });
  return { ...base, status: "emailed", reason: null, snapshotId };
}

export async function applyContributionCorrection(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  contributionId: string;
  actionType: ContributionActionType;
  payload: Record<string, unknown>;
  reason: string;
  actorProfileId: string | null;
  sourceSurface: ContributionSourceSurface;
  actorCapabilities?: string[];
  expectedRevision?: string | null;
  idempotencyKey?: string | null;
}) {
  const before = await loadContributionOperationDetail(input);

  if (input.expectedRevision && input.expectedRevision !== before.revision) {
    throw new ApiHttpError(
      409,
      "This gift changed since you loaded it. Reload the latest detail, review the changes, and submit the correction again.",
    );
  }

  const effectiveValues = correctionEffectiveValues(
    input.actionType,
    input.payload,
  );

  await assertCorrectionReferencesExist({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    effectiveValues,
  });

  const affectedFields = computeReceiptAffectedFields(effectiveValues);
  const receiptAffected =
    before.shared.receiptStatus === "sent" && affectedFields.length > 0;
  const deliverySelection = parseReceiptDeliverySelection(
    input.payload.receiptDelivery,
  );
  const requestedDelivery = parseReceiptDeliverySelection(
    input.payload.requestedReceiptDelivery,
  );

  let receiptContext: Awaited<
    ReturnType<typeof loadReceiptDeliveryContext>
  > | null = null;
  if (receiptAffected) {
    receiptContext = await loadReceiptDeliveryContext({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      donorId: before.donor?.id ?? null,
    });

    if (!deliverySelection && receiptContext.policy.requireDeliveryAction) {
      throw new ApiHttpError(
        400,
        `This correction changes receipt fields (${affectedFields.join(", ")}) and your organization requires choosing an updated receipt action (email or PDF) before completing it.`,
      );
    }

    if (deliverySelection) {
      validateReceiptDeliverySelection({
        policy: receiptContext.policy,
        donor: receiptContext.donor,
        actorCapabilities: input.actorCapabilities ?? [],
        selection: deliverySelection,
      });
    }
  }

  const insertResult = await input.supabaseAdmin
    .from("contribution_adjustments")
    .insert({
      tenant_id: input.tenantId,
      donation_id: input.contributionId,
      adjustment_type: input.actionType,
      status: "applied",
      effective_values: effectiveValues,
      reason: input.reason,
      actor_profile_id: input.actorProfileId,
      source_surface: input.sourceSurface,
      base_revision: before.revision,
      idempotency_key: input.idempotencyKey ?? null,
    })
    .select("id")
    .single();

  if (insertResult.error) {
    const isDuplicateKey =
      insertResult.error.code === "23505" && Boolean(input.idempotencyKey);
    if (!isDuplicateKey) {
      throw new Error(insertResult.error.message);
    }

    const existingResult = await input.supabaseAdmin
      .from("contribution_adjustments")
      .select("id")
      .eq("tenant_id", input.tenantId)
      .eq("idempotency_key", input.idempotencyKey!)
      .maybeSingle();

    if (existingResult.error || !existingResult.data) {
      throw new Error(
        existingResult.error?.message ??
          "Adjustment already exists but could not be loaded for replay.",
      );
    }

    return {
      before: summarizeEffectiveDetail(before),
      after: summarizeEffectiveDetail(before),
      status: "applied" as const,
      adjustmentId: String(
        (existingResult.data as Record<string, unknown>).id ?? "",
      ),
      idempotentReplay: true,
      receiptOutcome: null,
    };
  }

  const adjustmentId = String(
    ((insertResult.data ?? {}) as Record<string, unknown>).id ?? "",
  );
  const after = await loadContributionOperationDetail(input);

  let receiptOutcome: ReceiptDeliveryOutcome | null = null;
  if (receiptAffected) {
    if (deliverySelection) {
      receiptOutcome = await runReceiptDelivery({
        supabaseAdmin: input.supabaseAdmin,
        tenantId: input.tenantId,
        contributionId: input.contributionId,
        adjustmentId,
        stagedGiftId: before.stagedGift?.id ?? null,
        selection: deliverySelection,
        affectedFields,
        requested: requestedDelivery ?? deliverySelection,
        snapshotContent: {
          effective: after.effective,
          designationLines: after.designations.lines,
        },
      });
    } else {
      receiptOutcome = {
        status: "deferred",
        reason:
          "No updated receipt action was selected; the receipt remains as originally sent.",
        snapshotId: null,
        affectedFields,
        requested: requestedDelivery,
        confirmed: null,
      };
    }
  }

  return {
    before: summarizeEffectiveDetail(before),
    after: summarizeEffectiveDetail(after),
    status: "applied" as const,
    adjustmentId,
    idempotentReplay: false,
    receiptOutcome,
  };
}
