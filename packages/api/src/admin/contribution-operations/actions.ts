import { createHash } from "node:crypto";

import {
  correctionRequiresApproval,
  resolveCorrectionApprovalPolicy,
} from "./approval-policy";
import {
  CRM_POSTING_UNAVAILABLE_NEXT_STEP,
  CRM_POSTING_UNAVAILABLE_REASON,
} from "./crm-retry-support";
import {
  APPROVE_CORRECTION_CAPABILITY,
  REQUEST_CORRECTION_CAPABILITY,
  directContributionCapabilityForAction,
  isProviderGranularContributionAction,
} from "./permissions";
import { getContributionActionPolicy } from "./policy";
import {
  correctionStatusForProviderOutcome,
  isFailedProviderOutcomeStatus,
} from "./types";
import { ApiHttpError } from "../../shared/http-errors";

import type {
  ContributionActionDependencies,
  ContributionActionResult,
  ContributionActionType,
  ContributionCorrectionRecordInput,
  ContributionOperationAuditEventInput,
  ContributionProviderOutcome,
  ExecuteContributionActionInput,
} from "./types";

function requireDependency<TKey extends keyof ContributionActionDependencies>(
  dependencies: ContributionActionDependencies | undefined,
  key: TKey,
): NonNullable<ContributionActionDependencies[TKey]> {
  const dependency = dependencies?.[key];
  if (!dependency) {
    throw new ApiHttpError(
      501,
      `Contribution operation dependency missing: ${key}`,
    );
  }
  return dependency as NonNullable<ContributionActionDependencies[TKey]>;
}

function requireStringPayload(
  payload: Record<string, unknown> | undefined,
  key: string,
): string {
  const value = payload?.[key];
  if (typeof value !== "string") {
    throw new ApiHttpError(400, `${key} is required.`);
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    throw new ApiHttpError(400, `${key} is required.`);
  }

  return trimmedValue;
}

function normalizeOptionalStringValue(
  value: string | null | undefined,
  key: string,
): string | null | undefined {
  if (value == null) {
    return value;
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    throw new ApiHttpError(400, `${key} is required.`);
  }

  return trimmedValue;
}

function normalizeStringPayloadField(
  payload: Record<string, unknown> | undefined,
  key: string,
): Record<string, unknown> | undefined {
  if (!payload || !(key in payload)) {
    return payload;
  }

  const normalizedValue = requireStringPayload(payload, key);
  if (payload[key] === normalizedValue) {
    return payload;
  }

  return {
    ...payload,
    [key]: normalizedValue,
  };
}

function normalizeActionPayload(
  input: ExecuteContributionActionInput,
): Record<string, unknown> | undefined {
  let normalizedPayload = input.payload;

  if (
    input.actionType === "resend_receipt" ||
    input.actionType === "approve_staged_gift" ||
    input.actionType === "retry_staged_gift" ||
    input.actionType === "crm_repost"
  ) {
    normalizedPayload = normalizeStringPayloadField(
      normalizedPayload,
      "stagedGiftId",
    );
  }

  if (
    input.actionType === "retry_staged_gift" ||
    input.actionType === "crm_repost"
  ) {
    normalizedPayload = normalizeStringPayloadField(
      normalizedPayload,
      "allocationId",
    );
  }

  if (input.actionType === "donor_relink") {
    normalizedPayload = normalizeStringPayloadField(
      normalizedPayload,
      "donorId",
    );
  }

  if (input.actionType === "stripe_replay") {
    normalizedPayload = normalizeStringPayloadField(
      normalizedPayload,
      "stripeEventId",
    );
  }

  return normalizedPayload;
}

function normalizeActionInput<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): ExecuteContributionActionInput<TContribution> {
  return {
    ...input,
    stagedGiftId: normalizeOptionalStringValue(
      input.stagedGiftId,
      "stagedGiftId",
    ),
    payload: normalizeActionPayload(input),
  };
}

function requirePositiveSafeIntegerPayload(
  payload: Record<string, unknown> | undefined,
  key: string,
): number {
  const value = payload?.[key];
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
    throw new ApiHttpError(400, `${key} must be a positive safe integer.`);
  }
  return value;
}

function assertReasonAndConfirmation(
  input: Pick<
    ExecuteContributionActionInput,
    "reason" | "confirmationToken" | "approvedRequestId" | "actionType"
  >,
  policy: ReturnType<typeof getContributionActionPolicy>,
) {
  if (policy.requiresReason && !input.reason?.trim()) {
    throw new ApiHttpError(
      400,
      `A reason is required for ${input.actionType}.`,
    );
  }

  if (policy.requiresConfirmation && !input.confirmationToken?.trim()) {
    if (input.approvedRequestId?.trim()) {
      return;
    }

    throw new ApiHttpError(
      400,
      `A confirmation token is required for ${input.actionType}.`,
    );
  }
}

const LEGACY_MANAGE_PERMISSION = "finance:manage_contributions" as const;

function hasLegacyManagePermission(
  input: Pick<ExecuteContributionActionInput, "actorPermissions">,
): boolean {
  return input.actorPermissions.includes(LEGACY_MANAGE_PERMISSION);
}

function hasActorCapability(
  input: Pick<ExecuteContributionActionInput, "actorCapabilities">,
  capability: string,
): boolean {
  return (input.actorCapabilities ?? []).includes(capability);
}

function legacyManageCoversDirectAction(
  actionType: ContributionActionType,
): boolean {
  return !isProviderGranularContributionAction(actionType);
}

function hasLegacyDirectActionPermission(
  input: Pick<
    ExecuteContributionActionInput,
    "actorPermissions" | "actionType" | "approvedRequestId"
  >,
): boolean {
  return (
    !input.approvedRequestId &&
    legacyManageCoversDirectAction(input.actionType) &&
    hasLegacyManagePermission(input)
  );
}

function assertApprovedRequestCapabilities(
  input: Pick<
    ExecuteContributionActionInput,
    "actorCapabilities" | "actionType"
  >,
) {
  if (!hasActorCapability(input, APPROVE_CORRECTION_CAPABILITY)) {
    throw new ApiHttpError(
      403,
      `Forbidden: requires ${APPROVE_CORRECTION_CAPABILITY}`,
    );
  }

  const directCapability = directContributionCapabilityForAction(
    input.actionType,
  );
  if (!hasActorCapability(input, directCapability)) {
    throw new ApiHttpError(403, `Forbidden: requires ${directCapability}`);
  }
}

// Narrower than the permissions policy's approvalRequestable on purpose:
// stripe_replay is absent here, but provider-granular actions throw in
// assertActorPermissions before this branch is ever consulted for them.
function isApprovalRequestAction(actionType: ContributionActionType): boolean {
  return (
    actionType === "refund" ||
    actionType === "donor_relink" ||
    isCorrectionAction(actionType)
  );
}

function assertActorPermissions(
  input: Pick<
    ExecuteContributionActionInput,
    | "actorPermissions"
    | "actorCapabilities"
    | "actionType"
    | "approvedRequestId"
  >,
  policy: ReturnType<typeof getContributionActionPolicy>,
  options: { requiresApproval: boolean },
) {
  if (input.approvedRequestId) {
    assertApprovedRequestCapabilities(input);
    return;
  }

  if (hasLegacyDirectActionPermission(input)) {
    return;
  }

  const directCapability = directContributionCapabilityForAction(
    input.actionType,
  );
  if (hasActorCapability(input, directCapability)) {
    const granularProviderAction = isProviderGranularContributionAction(
      input.actionType,
    );
    if (
      granularProviderAction &&
      options.requiresApproval &&
      !hasActorCapability(input, REQUEST_CORRECTION_CAPABILITY)
    ) {
      throw new ApiHttpError(
        403,
        `Forbidden: requires ${REQUEST_CORRECTION_CAPABILITY}`,
      );
    }
    return;
  }

  if (isProviderGranularContributionAction(input.actionType)) {
    throw new ApiHttpError(403, `Forbidden: requires ${directCapability}`);
  }

  if (isApprovalRequestAction(input.actionType)) {
    if (
      options.requiresApproval &&
      hasActorCapability(input, REQUEST_CORRECTION_CAPABILITY)
    ) {
      return;
    }

    throw new ApiHttpError(
      403,
      `Forbidden: requires ${
        options.requiresApproval
          ? REQUEST_CORRECTION_CAPABILITY
          : directCapability
      }`,
    );
  }

  throw new ApiHttpError(
    403,
    `Forbidden: requires ${policy.requiredPermission ?? directCapability}`,
  );
}

function assertCanRequestCorrection(input: ExecuteContributionActionInput) {
  if (
    hasLegacyManagePermission(input) ||
    hasActorCapability(input, REQUEST_CORRECTION_CAPABILITY)
  ) {
    return;
  }

  throw new ApiHttpError(
    403,
    `Forbidden: requires ${REQUEST_CORRECTION_CAPABILITY}`,
  );
}

function assertCanExecuteDirectly(
  input: ExecuteContributionActionInput,
  capability: string,
) {
  if (input.approvedRequestId) {
    assertApprovedRequestCapabilities(input);
    return;
  }

  if (hasLegacyDirectActionPermission(input)) {
    return;
  }

  if (hasActorCapability(input, capability)) {
    return;
  }

  throw new ApiHttpError(403, `Forbidden: requires ${capability}`);
}

async function loadCanonicalContribution<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): Promise<TContribution> {
  const loadContributionDetail = requireDependency(
    input.dependencies,
    "loadContributionDetail",
  );

  return loadContributionDetail({
    tenantId: input.tenantId,
    contributionId: input.contributionId,
  }) as Promise<TContribution>;
}

function getCanonicalStagedGiftId(contribution: unknown): string | null {
  if (!contribution || typeof contribution !== "object") {
    return null;
  }

  const stagedGift = (contribution as { stagedGift?: unknown }).stagedGift;
  if (!stagedGift || typeof stagedGift !== "object") {
    return null;
  }

  const stagedGiftId = (stagedGift as { id?: unknown }).id;
  return typeof stagedGiftId === "string" && stagedGiftId.trim()
    ? stagedGiftId.trim()
    : null;
}

async function assertStagedGiftBelongsToContribution<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
  stagedGiftId: string,
): Promise<TContribution> {
  const canonicalContribution = await loadCanonicalContribution(input);
  const canonicalStagedGiftId = getCanonicalStagedGiftId(canonicalContribution);

  if (canonicalStagedGiftId !== stagedGiftId) {
    throw new ApiHttpError(404, "Staged gift not found for contribution.");
  }

  return canonicalContribution;
}

const STALE_REVISION_MESSAGE =
  "This gift changed since you loaded it. Reload the latest detail, review the changes, and submit the action again.";

function getCanonicalRevision(contribution: unknown): string | null {
  if (!contribution || typeof contribution !== "object") {
    return null;
  }

  const revision = (contribution as { revision?: unknown }).revision;
  return typeof revision === "string" && revision.trim() ? revision : null;
}

/**
 * Stale-save protection (ADR-CD-022) for actions without their own revision
 * gate. Correction, refund, and provider paths compare revisions in their
 * dedicated flows; the staged-gift actions (resend receipt, approve, retry)
 * enforce the same contract here so a client that pinned a revision gets the
 * 409 recovery instead of acting on detail it never reviewed. The check is
 * skipped when the canonical loader does not expose a revision — the
 * production Supabase read model always does.
 */
function assertExpectedRevisionMatches(
  input: Pick<ExecuteContributionActionInput, "expectedRevision">,
  contribution: unknown,
) {
  if (!input.expectedRevision) {
    return;
  }

  const currentRevision = getCanonicalRevision(contribution);
  if (currentRevision !== null && input.expectedRevision !== currentRevision) {
    throw new ApiHttpError(409, STALE_REVISION_MESSAGE);
  }
}

function auditInput(
  input: ExecuteContributionActionInput,
  extra: Partial<ContributionOperationAuditEventInput> = {},
): ContributionOperationAuditEventInput {
  return {
    tenantId: input.tenantId,
    actorProfileId: input.actorProfileId,
    contributionId: input.contributionId,
    stagedGiftId: input.stagedGiftId ?? null,
    actionType: input.actionType,
    sourceSurface: input.sourceSurface,
    reason: input.reason ?? null,
    downstreamEffects: {},
    ...extra,
  };
}

async function appendAuditEvent(
  input: ExecuteContributionActionInput,
  event: ContributionOperationAuditEventInput,
): Promise<string> {
  const append = requireDependency(input.dependencies, "appendAuditEvent");
  return append(event);
}

async function createCorrectionRecord(
  input: ExecuteContributionActionInput,
  correction: ContributionCorrectionRecordInput,
): Promise<string> {
  const create = requireDependency(
    input.dependencies,
    "createCorrectionRecord",
  );
  return create(correction);
}

function correctionInput(
  input: ExecuteContributionActionInput,
  extra: Partial<ContributionCorrectionRecordInput> = {},
): ContributionCorrectionRecordInput {
  if (!input.reason?.trim()) {
    throw new ApiHttpError(
      400,
      `A reason is required for ${input.actionType}.`,
    );
  }

  return {
    tenantId: input.tenantId,
    contributionId: input.contributionId,
    stagedGiftId: input.stagedGiftId ?? null,
    actorProfileId: input.actorProfileId,
    sourceSurface: input.sourceSurface,
    correctionType: input.actionType,
    status: "applied",
    reason: input.reason,
    ...extra,
  };
}

function isFailedProviderOutcome(
  outcome: { status?: string | null } | null | undefined,
): boolean {
  return isFailedProviderOutcomeStatus(outcome?.status ?? null);
}

/**
 * Error codes whose messages are generated by the platform (never raw
 * provider text), so redacting them would hide reconciliation guidance staff
 * need — e.g. "the Stripe refund succeeded but the gift record was not
 * updated" or the provider-verified remaining refundable amount.
 */
const PLATFORM_GENERATED_ERROR_CODES: ReadonlySet<string> = new Set([
  "local_update_failed",
  "refund_exceeds_provider_remaining",
]);

function hasPlatformGeneratedErrorMessage(
  outcome: ContributionProviderOutcome,
): boolean {
  if (outcome.status === "local_update_failed") {
    return true;
  }
  return (
    outcome.errorCode != null &&
    PLATFORM_GENERATED_ERROR_CODES.has(outcome.errorCode)
  );
}

function sanitizeProviderOutcome(
  outcome: ContributionProviderOutcome,
): ContributionProviderOutcome {
  const redactedErrorMessage =
    "Provider action failed. Check provider logs for details.";
  const sanitized: ContributionProviderOutcome = {
    provider: outcome.provider,
    status: outcome.status,
  };

  if ("referenceId" in outcome) {
    sanitized.referenceId = outcome.referenceId ?? null;
  }

  if ("errorCode" in outcome) {
    sanitized.errorCode = outcome.errorCode ?? null;
  }

  if ("errorMessage" in outcome) {
    if (outcome.errorMessage && isFailedProviderOutcome(outcome)) {
      sanitized.errorMessage = hasPlatformGeneratedErrorMessage(outcome)
        ? outcome.errorMessage
        : redactedErrorMessage;
    } else {
      sanitized.errorMessage = null;
    }
  }

  return sanitized;
}

function isCorrectionAction(actionType: ContributionActionType): boolean {
  return (
    actionType === "amount_correction" ||
    actionType === "designation_correction" ||
    actionType === "fund_correction" ||
    actionType === "allocation_correction" ||
    actionType === "receipt_correction" ||
    actionType === "statement_correction" ||
    actionType === "payment_state_correction" ||
    actionType === "stripe_replay"
  );
}

function requiresCorrectionApproval(input: ExecuteContributionActionInput) {
  const approvalPolicy =
    input.approvalPolicy ?? resolveCorrectionApprovalPolicy(null);

  return (
    !input.approvedRequestId &&
    correctionRequiresApproval({
      actionType: input.actionType,
      policy: approvalPolicy,
    })
  );
}

async function applyApprovedCorrectionRequest<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): Promise<ExecuteContributionActionInput<TContribution>> {
  if (!input.approvedRequestId) {
    return input;
  }

  if (!isApprovalRequestAction(input.actionType)) {
    throw new ApiHttpError(
      400,
      "approvedRequestId is only valid for approval-gated contribution actions.",
    );
  }

  const validateApprovedCorrectionRequest = requireDependency(
    input.dependencies,
    "validateApprovedCorrectionRequest",
  );
  const approvedRequest = await validateApprovedCorrectionRequest({
    tenantId: input.tenantId,
    contributionId: input.contributionId,
    actionType: input.actionType,
    approvedRequestId: input.approvedRequestId,
    actorProfileId: input.actorProfileId,
    actorCapabilities: input.actorCapabilities,
    expectedRevision: input.expectedRevision ?? null,
    requestedPayload: input.payload ?? {},
  });

  return {
    ...input,
    payload: approvedRequest.payload,
    reason: approvedRequest.reason ?? null,
  };
}

function stableSerialize(value: unknown): string {
  if (value === undefined) {
    return '"__undefined__"';
  }

  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== undefined)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
  const serializedEntries = entries.map(
    ([key, entryValue]) =>
      `${JSON.stringify(key)}:${stableSerialize(entryValue)}`,
  );

  return `{${serializedEntries.join(",")}}`;
}

function stableFingerprint(value: unknown): string {
  return createHash("sha256")
    .update(stableSerialize(value))
    .digest("hex")
    .slice(0, 32);
}

function normalizedToken(value: string | null | undefined): string | null {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

function directMutationIdempotencyContext(
  input: ExecuteContributionActionInput,
) {
  return {
    confirmationToken: normalizedToken(input.confirmationToken),
    payload: input.payload ?? {},
  };
}

function correctionRequestContext(
  input: ExecuteContributionActionInput,
  extra: { receiptDeliveryProposal?: Record<string, unknown> | null },
) {
  return {
    actorProfileId: input.actorProfileId,
    confirmationToken: normalizedToken(input.confirmationToken),
    expectedRevision: input.expectedRevision ?? null,
    payload: input.payload ?? {},
    reason: input.reason ?? "",
    sourceSurface: input.sourceSurface,
    stagedGiftId: input.stagedGiftId ?? null,
    receiptDeliveryProposal: extra.receiptDeliveryProposal ?? null,
  };
}

function correctionRequestIdempotencyKey(
  input: ExecuteContributionActionInput,
  extra: { receiptDeliveryProposal?: Record<string, unknown> | null },
): string {
  const explicitIdempotencyKey = normalizedToken(input.idempotencyKey);
  if (explicitIdempotencyKey) {
    return explicitIdempotencyKey;
  }

  const requestContext = correctionRequestContext(input, extra);

  if (normalizedToken(input.confirmationToken)) {
    return [
      "correction-request",
      input.tenantId,
      input.contributionId,
      input.actionType,
      `confirmation-${stableFingerprint(requestContext)}`,
    ].join("/");
  }

  return [
    "correction-request",
    input.tenantId,
    input.contributionId,
    input.actionType,
    `context-${stableFingerprint(requestContext)}`,
  ].join("/");
}

async function createPendingCorrectionRequest<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
  extra: { receiptDeliveryProposal?: Record<string, unknown> | null } = {},
): Promise<ContributionActionResult<TContribution>> {
  assertCanRequestCorrection(input);

  const payload = await resolvePendingCorrectionPayload(input);
  const requestInput = { ...input, payload };
  const createCorrectionRequest = requireDependency(
    input.dependencies,
    "createCorrectionRequest",
  );
  const correctionRequestId = await createCorrectionRequest({
    tenantId: input.tenantId,
    contributionId: input.contributionId,
    actionType: input.actionType,
    payload,
    reason: input.reason ?? "",
    requestedByProfileId: input.actorProfileId,
    sourceSurface: input.sourceSurface,
    expectedRevision: input.expectedRevision ?? null,
    idempotencyKey: correctionRequestIdempotencyKey(requestInput, extra),
    ...extra,
  });
  const auditEventId = await appendAuditEvent(
    input,
    auditInput(input, {
      downstreamEffects: {
        correctionRequestId,
        approvalStatus: "pending_approval",
      },
    }),
  );

  return {
    canonicalContribution: await loadCanonicalContribution(input),
    auditEventId,
    correctionRequestId,
    approvalStatus: "pending_approval",
    taskIds: [],
  };
}

async function resolvePendingCorrectionPayload(
  input: ExecuteContributionActionInput,
): Promise<Record<string, unknown>> {
  const payload = input.payload ?? {};
  if (input.actionType !== "stripe_replay") {
    return payload;
  }

  const payloadEventId =
    typeof payload.stripeEventId === "string" &&
    payload.stripeEventId.trim().length > 0
      ? payload.stripeEventId.trim()
      : null;
  if (payloadEventId) {
    return { ...payload, stripeEventId: payloadEventId };
  }

  const resolveReplayStripeEventId = requireDependency(
    input.dependencies,
    "resolveReplayStripeEventId",
  );
  const stripeEventId = await resolveReplayStripeEventId({
    tenantId: input.tenantId,
    contributionId: input.contributionId,
    payload,
  });

  if (!stripeEventId) {
    throw new ApiHttpError(
      404,
      "No stored provider event to replay for this gift.",
    );
  }

  return { ...payload, stripeEventId };
}

function providerIdempotencyKey(input: ExecuteContributionActionInput): string {
  const explicitIdempotencyKey = normalizedToken(input.idempotencyKey);
  if (explicitIdempotencyKey) {
    return explicitIdempotencyKey;
  }

  const approvedRequestId = normalizedToken(input.approvedRequestId);
  if (approvedRequestId) {
    return [
      "approved-contribution-action",
      input.tenantId,
      input.contributionId,
      input.actionType,
      approvedRequestId,
    ].join("/");
  }

  if (normalizedToken(input.confirmationToken)) {
    return [
      "contribution-action",
      input.tenantId,
      input.contributionId,
      input.actionType,
      `confirmation-${stableFingerprint(directMutationIdempotencyContext(input))}`,
    ].join("/");
  }

  throw new ApiHttpError(
    400,
    `An idempotency key is required for ${input.actionType}.`,
  );
}

function correctionIdempotencyKey(
  input: ExecuteContributionActionInput,
): string {
  const explicitIdempotencyKey = normalizedToken(input.idempotencyKey);
  if (explicitIdempotencyKey) {
    return explicitIdempotencyKey;
  }

  const approvedRequestId = normalizedToken(input.approvedRequestId);
  if (approvedRequestId) {
    return [
      "approved-correction",
      input.tenantId,
      input.contributionId,
      input.actionType,
      approvedRequestId,
    ].join("/");
  }

  if (normalizedToken(input.confirmationToken)) {
    return [
      "correction",
      input.tenantId,
      input.contributionId,
      input.actionType,
      `confirmation-${stableFingerprint(directMutationIdempotencyContext(input))}`,
    ].join("/");
  }

  throw new ApiHttpError(
    400,
    `An idempotency key is required for ${input.actionType}.`,
  );
}

async function sendCorrectionNotification(
  input: ExecuteContributionActionInput,
  result: {
    auditEventId: string;
    correctionId: string | null;
    providerOutcome?: ContributionProviderOutcome | null;
    beforeSummary?: Record<string, unknown> | null;
    afterSummary?: Record<string, unknown> | null;
  },
) {
  const sendNotification = input.dependencies?.sendCorrectionNotification;
  if (!sendNotification) {
    return { decision: "not_required" as const, taskIds: [] };
  }

  return sendNotification({
    tenantId: input.tenantId,
    actionType: input.actionType,
    contributionId: input.contributionId,
    correctionId: result.correctionId,
    auditEventId: result.auditEventId,
    actorProfileId: input.actorProfileId,
    providerOutcome: result.providerOutcome ?? null,
    beforeSummary: result.beforeSummary ?? null,
    afterSummary: result.afterSummary ?? null,
  });
}

export async function executeContributionAction<TContribution = unknown>(
  rawInput: ExecuteContributionActionInput<TContribution>,
): Promise<ContributionActionResult<TContribution>> {
  const policy = getContributionActionPolicy({
    actionType: rawInput.actionType,
    organizationSettings: rawInput.organizationSettings,
    userPreferences: rawInput.userPreferences,
  });
  const actionRequiresApproval =
    isApprovalRequestAction(rawInput.actionType) &&
    requiresCorrectionApproval(rawInput);

  assertActorPermissions(rawInput, policy, {
    requiresApproval: actionRequiresApproval,
  });
  const input = normalizeActionInput(
    await applyApprovedCorrectionRequest(rawInput),
  );
  assertReasonAndConfirmation(input, policy);

  switch (input.actionType) {
    case "resend_receipt": {
      const stagedGiftId =
        input.stagedGiftId ??
        requireStringPayload(input.payload, "stagedGiftId");
      const canonicalBefore = await assertStagedGiftBelongsToContribution(
        input,
        stagedGiftId,
      );
      assertExpectedRevisionMatches(input, canonicalBefore);
      const sendReceipt = requireDependency(input.dependencies, "sendReceipt");
      const receipt = await sendReceipt({
        tenantId: input.tenantId,
        contributionId: input.contributionId,
        stagedGiftId,
      });
      const providerOutcome = {
        provider: "resend" as const,
        status: receipt.status,
        referenceId: receipt.sendLogId ?? null,
      };
      const auditEventId = await appendAuditEvent(
        input,
        auditInput(input, {
          stagedGiftId,
          providerOutcome,
          downstreamEffects: {
            receiptStatus: receipt.status,
          },
        }),
      );

      return {
        canonicalContribution: await loadCanonicalContribution(input),
        auditEventId,
        taskIds: [],
        providerOutcome,
      };
    }

    case "approve_staged_gift": {
      const stagedGiftId =
        input.stagedGiftId ??
        requireStringPayload(input.payload, "stagedGiftId");
      const canonicalBefore = await assertStagedGiftBelongsToContribution(
        input,
        stagedGiftId,
      );
      assertExpectedRevisionMatches(input, canonicalBefore);
      const approve = requireDependency(
        input.dependencies,
        "approveStagedGift",
      );
      await approve({
        tenantId: input.tenantId,
        contributionId: input.contributionId,
        stagedGiftId,
        actorProfileId: input.actorProfileId,
        note: input.reason ?? null,
      });
      const auditEventId = await appendAuditEvent(
        input,
        auditInput(input, {
          stagedGiftId,
          downstreamEffects: {
            stagedGiftStatus: "queued_for_posting",
          },
        }),
      );

      return {
        canonicalContribution: await loadCanonicalContribution(input),
        auditEventId,
        taskIds: [],
      };
    }

    case "retry_staged_gift":
    case "crm_repost": {
      const stagedGiftId =
        input.stagedGiftId ??
        requireStringPayload(input.payload, "stagedGiftId");
      const canonicalBefore = await assertStagedGiftBelongsToContribution(
        input,
        stagedGiftId,
      );
      assertExpectedRevisionMatches(input, canonicalBefore);
      const retryScope =
        input.payload?.scope === "designation" ? "designation" : "parent";

      if (retryScope === "designation") {
        // Targeted child-record retry (ADR-CD-012): only the failed line is
        // reposted. When the adapter cannot post child records, surface the
        // limitation rather than silently reposting the whole gift.
        const allocationId = requireStringPayload(
          input.payload,
          "allocationId",
        );
        const retryDesignation = input.dependencies?.retryDesignationPost;
        if (!retryDesignation) {
          throw new ApiHttpError(
            501,
            `${CRM_POSTING_UNAVAILABLE_REASON} ${CRM_POSTING_UNAVAILABLE_NEXT_STEP}`,
          );
        }
        await retryDesignation({
          tenantId: input.tenantId,
          contributionId: input.contributionId,
          stagedGiftId,
          allocationId,
          actorProfileId: input.actorProfileId,
          note: input.reason ?? null,
        });
        const auditEventId = await appendAuditEvent(
          input,
          auditInput(input, {
            stagedGiftId,
            downstreamEffects: {
              crmPostStatus: "queued",
              retryScope: "designation",
              allocationId,
            },
          }),
        );

        return {
          canonicalContribution: await loadCanonicalContribution(input),
          auditEventId,
          taskIds: [],
        };
      }

      const retry = requireDependency(input.dependencies, "retryStagedGift");
      await retry({
        tenantId: input.tenantId,
        contributionId: input.contributionId,
        stagedGiftId,
        actorProfileId: input.actorProfileId,
        note: input.reason ?? null,
      });
      const auditEventId = await appendAuditEvent(
        input,
        auditInput(input, {
          stagedGiftId,
          downstreamEffects: {
            crmPostStatus: "queued",
            retryScope: "parent",
          },
        }),
      );

      return {
        canonicalContribution: await loadCanonicalContribution(input),
        auditEventId,
        taskIds: [],
      };
    }

    case "metadata_update": {
      throw new ApiHttpError(
        501,
        "metadata_update is not implemented by the contribution action executor yet.",
      );
    }

    case "donor_relink": {
      const donorId = requireStringPayload(input.payload, "donorId");

      if (requiresCorrectionApproval(input)) {
        return createPendingCorrectionRequest(input);
      }

      assertCanExecuteDirectly(
        input,
        directContributionCapabilityForAction("donor_relink"),
      );

      const relinkDonor = requireDependency(input.dependencies, "relinkDonor");
      const relink = await relinkDonor({
        tenantId: input.tenantId,
        contributionId: input.contributionId,
        donorId,
        expectedRevision: input.expectedRevision ?? null,
        idempotencyKey: providerIdempotencyKey(input),
      });
      const correctionId = await createCorrectionRecord(
        input,
        correctionInput(input, {
          correctionType: "donor_relink",
          beforeSummary: relink.before ?? null,
          afterSummary: relink.after ?? { donorId },
        }),
      );
      const auditEventId = await appendAuditEvent(
        input,
        auditInput(input, {
          correctionId,
          beforeSummary: relink.before ?? null,
          afterSummary: relink.after ?? { donorId },
        }),
      );
      const notification = await sendCorrectionNotification(input, {
        auditEventId,
        correctionId,
        beforeSummary: relink.before ?? null,
        afterSummary: relink.after ?? { donorId },
      });

      return {
        canonicalContribution: await loadCanonicalContribution(input),
        auditEventId,
        correctionId,
        notification,
        taskIds: notification.taskIds ?? [],
      };
    }

    case "refund": {
      const amount = requirePositiveSafeIntegerPayload(input.payload, "amount");

      // Refunds follow the same tenant approval policy as other high-risk
      // corrections (ADR-CD-005 / ADR-CD-025): create a request unless the
      // gate is suppressed or this apply comes from an approved request.
      if (requiresCorrectionApproval(input)) {
        return createPendingCorrectionRequest(input);
      }

      assertCanExecuteDirectly(
        input,
        directContributionCapabilityForAction("refund"),
      );

      const refund = requireDependency(
        input.dependencies,
        "refundContribution",
      );
      const providerOutcome = sanitizeProviderOutcome(
        await refund({
          tenantId: input.tenantId,
          contributionId: input.contributionId,
          amount,
          reason: input.reason ?? "",
          confirmationToken:
            normalizedToken(input.confirmationToken) ??
            normalizedToken(input.approvedRequestId) ??
            "",
          expectedRevision: input.expectedRevision ?? null,
          idempotencyKey: providerIdempotencyKey(input),
        }),
      );
      const correctionId = await createCorrectionRecord(
        input,
        correctionInput(input, {
          correctionType: "refund",
          // Three-way status: a pending provider outcome records a "pending"
          // correction so the trail never asserts finality Stripe has not
          // granted; the webhook path converges it later (#265).
          status: correctionStatusForProviderOutcome(providerOutcome.status),
          providerOutcome,
          afterSummary: { refundAmount: amount },
        }),
      );
      if (providerOutcome.status === "pending") {
        const providerReferenceId = normalizedToken(
          providerOutcome.referenceId,
        );
        if (!providerReferenceId) {
          throw new Error(
            "Pending refund outcome is missing its provider reference.",
          );
        }

        const linkAndReconcilePendingRefundAttempt = requireDependency(
          input.dependencies,
          "linkAndReconcilePendingRefundAttempt",
        );
        await linkAndReconcilePendingRefundAttempt({
          tenantId: input.tenantId,
          providerReferenceId,
          correctionId,
        });
      }
      const auditEventId = await appendAuditEvent(
        input,
        auditInput(input, {
          correctionId,
          providerOutcome,
          afterSummary: { refundAmount: amount },
        }),
      );
      const notification = await sendCorrectionNotification(input, {
        auditEventId,
        correctionId,
        providerOutcome,
        afterSummary: { refundAmount: amount },
      });

      return {
        canonicalContribution: await loadCanonicalContribution(input),
        auditEventId,
        correctionId,
        notification,
        taskIds: notification.taskIds ?? [],
        providerOutcome,
      };
    }

    case "stripe_replay": {
      if (requiresCorrectionApproval(input)) {
        return createPendingCorrectionRequest(input);
      }

      assertCanExecuteDirectly(
        input,
        directContributionCapabilityForAction("stripe_replay"),
      );

      const replayStripeEvent = requireDependency(
        input.dependencies,
        "replayStripeEvent",
      );
      const providerOutcome = sanitizeProviderOutcome(
        await replayStripeEvent({
          tenantId: input.tenantId,
          contributionId: input.contributionId,
          payload: input.payload ?? {},
          expectedRevision: input.expectedRevision ?? null,
          idempotencyKey: providerIdempotencyKey(input),
        }),
      );
      const correctionId = await createCorrectionRecord(
        input,
        correctionInput(input, {
          correctionType: "stripe_replay",
          // Same three-way classification as refunds: a pending provider
          // outcome must never be recorded as an applied correction (#265).
          status: correctionStatusForProviderOutcome(providerOutcome.status),
          providerOutcome,
        }),
      );
      const auditEventId = await appendAuditEvent(
        input,
        auditInput(input, {
          correctionId,
          providerOutcome,
        }),
      );
      const notification = await sendCorrectionNotification(input, {
        auditEventId,
        correctionId,
        providerOutcome,
      });

      return {
        canonicalContribution: await loadCanonicalContribution(input),
        auditEventId,
        correctionId,
        notification,
        taskIds: notification.taskIds ?? [],
        providerOutcome,
      };
    }

    default: {
      if (isCorrectionAction(input.actionType)) {
        if (!input.reason?.trim()) {
          throw new ApiHttpError(
            400,
            `A reason is required for ${input.actionType}.`,
          );
        }

        if (requiresCorrectionApproval(input)) {
          return createPendingCorrectionRequest(input, {
            receiptDeliveryProposal:
              input.payload &&
              typeof input.payload.receiptDelivery === "object" &&
              input.payload.receiptDelivery !== null
                ? (input.payload.receiptDelivery as Record<string, unknown>)
                : null,
          });
        }

        assertCanExecuteDirectly(
          input,
          directContributionCapabilityForAction(input.actionType),
        );

        const applyCorrection = requireDependency(
          input.dependencies,
          "applyCorrection",
        );
        const idempotencyKey = correctionIdempotencyKey(input);
        const correction = await applyCorrection({
          tenantId: input.tenantId,
          contributionId: input.contributionId,
          actionType: input.actionType,
          payload: input.payload ?? {},
          reason: input.reason,
          actorProfileId: input.actorProfileId,
          sourceSurface: input.sourceSurface,
          actorCapabilities: input.actorCapabilities,
          expectedRevision: input.expectedRevision ?? null,
          idempotencyKey,
        });

        if (correction.idempotentReplay) {
          const auditEventId = await appendAuditEvent(
            input,
            auditInput(input, {
              beforeSummary: correction.before ?? null,
              afterSummary: correction.after ?? null,
              downstreamEffects: { idempotentReplay: true },
            }),
          );

          return {
            canonicalContribution: await loadCanonicalContribution(input),
            auditEventId,
            correctionId: null,
            adjustmentId: correction.adjustmentId ?? null,
            idempotentReplay: true,
            taskIds: [],
          };
        }

        const correctionId = await createCorrectionRecord(
          input,
          correctionInput(input, {
            beforeSummary: correction.before ?? null,
            afterSummary: correction.after ?? null,
            status: correction.status ?? "applied",
          }),
        );
        const auditEventId = await appendAuditEvent(
          input,
          auditInput(input, {
            beforeSummary: correction.before ?? null,
            afterSummary: correction.after ?? null,
            correctionId,
            downstreamEffects: {
              receiptOutcome:
                correction.receiptOutcome?.status ?? "not_required",
              receiptAffectedFields:
                correction.receiptOutcome?.affectedFields ?? [],
              receiptSnapshotId: correction.receiptOutcome?.snapshotId ?? null,
              receiptDeliveryRequested:
                correction.receiptOutcome?.requested ?? null,
              receiptDeliveryConfirmed:
                correction.receiptOutcome?.confirmed ?? null,
            },
          }),
        );
        const notification = await sendCorrectionNotification(input, {
          auditEventId,
          correctionId,
          beforeSummary: correction.before ?? null,
          afterSummary: correction.after ?? null,
        });

        return {
          canonicalContribution: await loadCanonicalContribution(input),
          auditEventId,
          correctionId,
          adjustmentId: correction.adjustmentId ?? null,
          receiptOutcome: correction.receiptOutcome ?? null,
          approvalStatus: "applied",
          notification,
          taskIds: notification.taskIds ?? [],
        };
      }

      if (policy.riskLevel === "low") {
        const auditEventId = await appendAuditEvent(input, auditInput(input));
        return {
          canonicalContribution: await loadCanonicalContribution(input),
          auditEventId,
          taskIds: [],
        };
      }

      const correctionId = await createCorrectionRecord(
        input,
        correctionInput(input),
      );
      const auditEventId = await appendAuditEvent(
        input,
        auditInput(input, { correctionId }),
      );

      return {
        canonicalContribution: await loadCanonicalContribution(input),
        auditEventId,
        correctionId,
        taskIds: [],
      };
    }
  }
}
