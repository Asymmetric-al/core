import { serverEnv } from "@asym/env";
import Stripe from "stripe";

import { assertAllowedPaymentStateCorrectionStatus } from "./payment-status-allowlist";
import {
  computeReceiptAffectedFields,
  parseReceiptDeliverySelection,
  resolveTenantReceiptDeliveryPolicy,
  validateReceiptDeliverySelection,
  type ReceiptDeliveryOutcome,
  type ReceiptDeliverySelection,
  type TenantReceiptDeliveryPolicyRow,
} from "./receipt-delivery";
import { loadContributionDetailFromSupabase } from "./store";
import { sendStagedGiftReceipt } from "../../giving/receipts";
import { ApiHttpError } from "../../shared/http-errors";
import {
  loadStripeRawEventForReplay,
  markStripeRawEventForReplay,
} from "../../stripe/replay";

import type { ContributionActionType } from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const STRIPE_API_VERSION = "2025-02-24.acacia";

type SupabaseAdmin = AdminSupabaseClient;

function requireStripeSecretKey(): string {
  const key = serverEnv.STRIPE_SECRET_KEY;
  if (!key) {
    throw new ApiHttpError(503, "Stripe is not configured for refunds.");
  }
  return key;
}

export async function refundContribution(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  contributionId: string;
  amount: number;
  reason: string;
  confirmationToken: string;
}) {
  const { data, error } = await input.supabaseAdmin
    .from("donations")
    .select("id, tenant_id, amount, refund_amount, status, stripe_charge_id")
    .eq("tenant_id", input.tenantId)
    .eq("id", input.contributionId)
    .single();

  if (error || !data) {
    throw new ApiHttpError(404, "Contribution not found for refund.");
  }

  const amount = typeof data.amount === "number" ? data.amount : 0;
  const refunded =
    typeof data.refund_amount === "number" ? data.refund_amount : 0;
  const remaining = Math.max(0, amount - refunded);
  if (input.amount > remaining) {
    throw new ApiHttpError(
      400,
      "Refund amount exceeds remaining refundable amount.",
    );
  }
  if (!data.stripe_charge_id) {
    throw new ApiHttpError(
      409,
      "Contribution does not have a Stripe charge id.",
    );
  }

  try {
    const stripe = new Stripe(requireStripeSecretKey(), {
      apiVersion: STRIPE_API_VERSION,
    });
    const refund = await stripe.refunds.create(
      {
        charge: data.stripe_charge_id,
        amount: input.amount,
        metadata: {
          donation_id: input.contributionId,
          tenant_id: input.tenantId,
          reason: input.reason,
        },
      },
      {
        idempotencyKey: `contribution-refund/${input.tenantId}/${input.contributionId}/${input.amount}/${input.confirmationToken}`,
      },
    );

    const providerStatus = refund.status ?? "pending";
    const nextRefundAmount = refunded + input.amount;
    const updateResult = await input.supabaseAdmin
      .from("donations")
      .update({
        refund_amount: nextRefundAmount,
        refunded_at: new Date().toISOString(),
        status:
          providerStatus === "succeeded" && nextRefundAmount >= amount
            ? "refunded"
            : data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_id", input.tenantId)
      .eq("id", input.contributionId)
      .eq("refund_amount", refunded);

    if (updateResult.error) {
      return {
        provider: "stripe" as const,
        status: "local_update_failed",
        referenceId: refund.id,
        errorCode: "local_contribution_update_failed",
        errorMessage: `Stripe refund ${refund.id} was created, but the local contribution state could not be updated: ${updateResult.error.message}`,
        raw: {
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status,
        },
      };
    }

    if ((updateResult.count ?? 0) === 0) {
      throw new ApiHttpError(
        409,
        "Contribution refund state changed concurrently. Retry the refund.",
      );
    }

    return {
      provider: "stripe" as const,
      status: providerStatus,
      referenceId: refund.id,
      raw: {
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
      },
    };
  } catch (error) {
    if (error instanceof ApiHttpError) {
      throw error;
    }

    return {
      provider: "stripe" as const,
      status: "failed",
      errorCode:
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code)
          : "stripe_refund_failed",
      errorMessage:
        error instanceof Error ? error.message : "Stripe refund failed.",
    };
  }
}

/**
 * Collect every fund/missionary id a correction's effective values reference,
 * across the top-level fields and each designation line. `null` (clearing a
 * designation) is intentionally not collected.
 */
function collectCorrectionReferenceIds(
  effectiveValues: Record<string, unknown>,
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
      if (line && typeof line === "object") {
        const record = line as Record<string, unknown>;
        addFund(record.fundId);
        addMissionary(record.missionaryId);
      }
    }
  }

  return { fundIds: [...fundIds], missionaryIds: [...missionaryIds] };
}

/**
 * Reject corrections that reference a fund or missionary that does not exist
 * for the tenant before the adjustment is written. Without this guard a
 * free-text / bogus / cross-tenant id would be baked into the gift's effective
 * financial truth (designations, receipts, reconciliation, CRM posting) with no
 * later validation. Mirrors the tenant-scoped donor guard in
 * `relinkContributionDonor`.
 */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/**
 * Resolve which of `ids` exist in a tenant-scoped UUID-keyed reference table,
 * returning the ids that do NOT. Only UUID-shaped ids are sent to the query:
 * `funds.id` / `missionaries.id` are Postgres `UUID` columns, so a non-UUID id
 * (a typo or free-text value) would raise a 22P02 cast error and surface as a
 * 500 leaking the raw value — instead, a malformed id is definitionally unknown
 * and is reported as missing without touching the database.
 */
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
  effectiveValues: Record<string, unknown>;
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

function correctionEffectiveValues(
  actionType: ContributionActionType,
  payload: Record<string, unknown>,
): Record<string, unknown> {
  if (actionType === "amount_correction") {
    const amount = payload.amount;
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
      throw new ApiHttpError(400, "amount must be a non-negative number.");
    }
    return { amountCents: amount };
  }

  if (
    actionType === "designation_correction" ||
    actionType === "fund_correction"
  ) {
    const fundId = payload.fundId;
    return { fundId: typeof fundId === "string" ? fundId : null };
  }

  if (actionType === "allocation_correction") {
    const designationLines = payload.designationLines;
    if (Array.isArray(designationLines)) {
      const lines = designationLines.map((line, index) => {
        if (typeof line !== "object" || line === null) {
          throw new ApiHttpError(400, "designationLines must be objects.");
        }
        const record = line as Record<string, unknown>;
        const amountCents = record.amountCents;
        if (
          typeof amountCents !== "number" ||
          !Number.isFinite(amountCents) ||
          amountCents < 0
        ) {
          throw new ApiHttpError(
            400,
            "Each designation line needs a non-negative amountCents.",
          );
        }
        return {
          id:
            typeof record.id === "string" && record.id
              ? record.id
              : `line-${index + 1}`,
          amountCents,
          fundId: typeof record.fundId === "string" ? record.fundId : null,
          missionaryId:
            typeof record.missionaryId === "string"
              ? record.missionaryId
              : null,
          memo: typeof record.memo === "string" ? record.memo : null,
        };
      });
      return { designationLines: lines };
    }

    const fundId = payload.fundId;
    const missionaryId = payload.missionaryId;
    return {
      fundId: typeof fundId === "string" ? fundId : null,
      missionaryId: typeof missionaryId === "string" ? missionaryId : null,
    };
  }

  if (actionType === "payment_state_correction") {
    const status = payload.status;
    if (typeof status !== "string" || status.trim().length === 0) {
      throw new ApiHttpError(400, "status is required.");
    }
    assertAllowedPaymentStateCorrectionStatus(status);
    return { paymentStatus: status };
  }

  throw new ApiHttpError(
    501,
    `${actionType} requires a dedicated operation adapter before it can be applied.`,
  );
}

function summarizeEffectiveDetail(detail: {
  effective: {
    amountCents: number;
    fundId: string | null;
    missionaryId: string | null;
    paymentStatus: string;
  };
  donor: { id: string } | null;
}) {
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
          .eq("id", input.donorId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (policyResult.error) {
    throw new Error(policyResult.error.message);
  }
  if (donorResult.error) {
    throw new Error(donorResult.error.message);
  }

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

/**
 * Applies a correction as an immutable adjustment record (ADR-CD-004).
 *
 * The original donation row is never rewritten; effective values derive from
 * the original plus applied adjustments. Saves are concurrency-checked
 * against the detail revision and idempotent on retry. Receipt-affecting
 * corrections run the staff-selected updated receipt delivery action
 * (ADR-CD-029) and report the outcome.
 */
export async function applyContributionCorrection(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  contributionId: string;
  actionType: ContributionActionType;
  payload: Record<string, unknown>;
  reason: string;
  actorProfileId: string | null;
  sourceSurface: string;
  actorCapabilities?: string[];
  expectedRevision?: string | null;
  idempotencyKey?: string | null;
}) {
  const before = await loadContributionDetailFromSupabase(input);

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

  // Validate fund/missionary references against the tenant before writing the
  // adjustment — a bogus or cross-tenant id must never enter financial truth.
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
  const after = await loadContributionDetailFromSupabase(input);

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

export async function relinkContributionDonor(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  contributionId: string;
  donorId: string;
}) {
  const { data: donor, error: donorError } = await input.supabaseAdmin
    .from("donors")
    .select("id, tenant_id")
    .eq("tenant_id", input.tenantId)
    .eq("id", input.donorId)
    .maybeSingle();

  if (donorError) {
    throw new Error(donorError.message);
  }
  if (!donor) {
    throw new ApiHttpError(404, "Donor not found in this organization.");
  }

  const before = await loadContributionDetailFromSupabase(input);
  const { error } = await input.supabaseAdmin
    .from("donations")
    .update({
      donor_id: input.donorId,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", input.tenantId)
    .eq("id", input.contributionId);
  if (error) throw new Error(error.message);

  return {
    before: { donorId: before.donor?.id ?? null },
    after: { donorId: input.donorId },
  };
}

export async function replayStripeEventThroughContributionOperations(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  stripeEventId: string;
}) {
  const rawEvent = await loadStripeRawEventForReplay(input);
  await markStripeRawEventForReplay({
    supabaseAdmin: input.supabaseAdmin,
    rawEventId: rawEvent.id,
  });
  return rawEvent;
}
