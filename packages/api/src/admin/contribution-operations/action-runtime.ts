/**
 * Shared runtime for the Contribution command executor.
 *
 * HTTP and stored correction requests still carry `actionType` plus a JSON
 * payload bag. Adapters parse that bag into `ContributionCommand` at the Core
 * seam; these helpers keep permission, normalize, approval, and audit
 * locality in one module so action handlers do not re-learn it.
 */

import { createHash } from "node:crypto";

import {
  correctionRequiresApproval,
  resolveCorrectionApprovalPolicy,
} from "./approval-policy";
import {
  parseContributionCommand,
  serializeContributionCommand,
} from "./command";
import {
  APPROVE_CORRECTION_CAPABILITY,
  REQUEST_CORRECTION_CAPABILITY,
  directContributionCapabilityForAction,
  isProviderGranularContributionAction,
} from "./permissions";
import { getContributionActionPolicy } from "./policy";
import { isFailedProviderOutcomeStatus } from "./types";
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

export function commandActionType(
  input: Pick<ExecuteContributionActionInput, "command">,
): ContributionActionType {
  return input.command.type;
}

export function commandPayload(
  input: Pick<ExecuteContributionActionInput, "command">,
): Record<string, unknown> {
  return serializeContributionCommand(input.command);
}

export function requireDependency<TKey extends keyof ContributionActionDependencies>(
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

export function requireStringPayload(
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
  let normalizedPayload = commandPayload(input);

  if (
    commandActionType(input) === "resend_receipt" ||
    commandActionType(input) === "approve_staged_gift" ||
    commandActionType(input) === "retry_staged_gift" ||
    commandActionType(input) === "crm_repost"
  ) {
    normalizedPayload = normalizeStringPayloadField(
      normalizedPayload,
      "stagedGiftId",
    );
  }

  if (
    commandActionType(input) === "retry_staged_gift" ||
    commandActionType(input) === "crm_repost"
  ) {
    normalizedPayload = normalizeStringPayloadField(
      normalizedPayload,
      "allocationId",
    );
  }

  if (commandActionType(input) === "donor_relink") {
    normalizedPayload = normalizeStringPayloadField(
      normalizedPayload,
      "donorId",
    );
  }

  if (commandActionType(input) === "stripe_replay") {
    normalizedPayload = normalizeStringPayloadField(
      normalizedPayload,
      "stripeEventId",
    );
  }

  return normalizedPayload;
}

export function normalizeActionInput<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): ExecuteContributionActionInput<TContribution> {
  const payload = normalizeActionPayload(input);
  return {
    ...input,
    stagedGiftId: normalizeOptionalStringValue(
      input.stagedGiftId,
      "stagedGiftId",
    ),
    command: parseContributionCommand(commandActionType(input), payload),
  };
}

export function requirePositiveSafeIntegerPayload(
  payload: Record<string, unknown> | undefined,
  key: string,
): number {
  const value = payload?.[key];
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
    throw new ApiHttpError(400, `${key} must be a positive safe integer.`);
  }
  return value;
}

export function assertReasonAndConfirmation(
  input: Pick<
    ExecuteContributionActionInput,
    "reason" | "confirmationToken" | "approvedRequestId" | "command"
  >,
  policy: ReturnType<typeof getContributionActionPolicy>,
) {
  if (policy.requiresReason && !input.reason?.trim()) {
    throw new ApiHttpError(
      400,
      `A reason is required for ${commandActionType(input)}.`,
    );
  }

  if (policy.requiresConfirmation && !input.confirmationToken?.trim()) {
    if (input.approvedRequestId?.trim()) {
      return;
    }

    throw new ApiHttpError(
      400,
      `A confirmation token is required for ${commandActionType(input)}.`,
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
    "actorPermissions" | "command" | "approvedRequestId"
  >,
): boolean {
  return (
    !input.approvedRequestId &&
    legacyManageCoversDirectAction(commandActionType(input)) &&
    hasLegacyManagePermission(input)
  );
}

function assertApprovedRequestCapabilities(
  input: Pick<
    ExecuteContributionActionInput,
    "actorCapabilities" | "command"
  >,
) {
  if (!hasActorCapability(input, APPROVE_CORRECTION_CAPABILITY)) {
    throw new ApiHttpError(
      403,
      `Forbidden: requires ${APPROVE_CORRECTION_CAPABILITY}`,
    );
  }

  const directCapability = directContributionCapabilityForAction(
    commandActionType(input),
  );
  if (!hasActorCapability(input, directCapability)) {
    throw new ApiHttpError(403, `Forbidden: requires ${directCapability}`);
  }
}

// Approval-requestable at this seam: refund, donor_relink, and correction
// actions (including stripe_replay via isCorrectionAction). Other
// provider-granular actions throw in assertActorPermissions before this
// branch is consulted.
export function isApprovalRequestAction(actionType: ContributionActionType): boolean {
  return (
    actionType === "refund" ||
    actionType === "donor_relink" ||
    isCorrectionAction(actionType)
  );
}

export function assertActorPermissions(
  input: Pick<
    ExecuteContributionActionInput,
    | "actorPermissions"
    | "actorCapabilities"
    | "command"
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
    commandActionType(input),
  );
  if (hasActorCapability(input, directCapability)) {
    const granularProviderAction = isProviderGranularContributionAction(
      commandActionType(input),
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

  if (isProviderGranularContributionAction(commandActionType(input))) {
    throw new ApiHttpError(403, `Forbidden: requires ${directCapability}`);
  }

  if (isApprovalRequestAction(commandActionType(input))) {
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

export function assertCanExecuteDirectly(
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

export async function loadCanonicalContribution<TContribution>(
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

export async function assertStagedGiftBelongsToContribution<TContribution>(
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
export function assertExpectedRevisionMatches(
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

export function auditInput(
  input: ExecuteContributionActionInput,
  extra: Partial<ContributionOperationAuditEventInput> = {},
): ContributionOperationAuditEventInput {
  return {
    tenantId: input.tenantId,
    actorProfileId: input.actorProfileId,
    contributionId: input.contributionId,
    stagedGiftId: input.stagedGiftId ?? null,
    actionType: commandActionType(input),
    sourceSurface: input.sourceSurface,
    reason: input.reason ?? null,
    downstreamEffects: {},
    ...extra,
  };
}

export async function appendAuditEvent(
  input: ExecuteContributionActionInput,
  event: ContributionOperationAuditEventInput,
): Promise<string> {
  const append = requireDependency(input.dependencies, "appendAuditEvent");
  return append(event);
}

export async function createCorrectionRecord(
  input: ExecuteContributionActionInput,
  correction: ContributionCorrectionRecordInput,
): Promise<string> {
  const create = requireDependency(
    input.dependencies,
    "createCorrectionRecord",
  );
  return create(correction);
}

export function correctionInput(
  input: ExecuteContributionActionInput,
  extra: Partial<ContributionCorrectionRecordInput> = {},
): ContributionCorrectionRecordInput {
  if (!input.reason?.trim()) {
    throw new ApiHttpError(
      400,
      `A reason is required for ${commandActionType(input)}.`,
    );
  }

  return {
    tenantId: input.tenantId,
    contributionId: input.contributionId,
    stagedGiftId: input.stagedGiftId ?? null,
    actorProfileId: input.actorProfileId,
    sourceSurface: input.sourceSurface,
    correctionType: commandActionType(input),
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

export function sanitizeProviderOutcome(
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

export function isCorrectionAction(actionType: ContributionActionType): boolean {
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

export function requiresCorrectionApproval(input: ExecuteContributionActionInput) {
  const approvalPolicy =
    input.approvalPolicy ?? resolveCorrectionApprovalPolicy(null);

  return (
    !input.approvedRequestId &&
    correctionRequiresApproval({
      actionType: commandActionType(input),
      policy: approvalPolicy,
    })
  );
}

export async function applyApprovedCorrectionRequest<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): Promise<ExecuteContributionActionInput<TContribution>> {
  if (!input.approvedRequestId) {
    return input;
  }

  if (!isApprovalRequestAction(commandActionType(input))) {
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
    actionType: commandActionType(input),
    approvedRequestId: input.approvedRequestId,
    actorProfileId: input.actorProfileId,
    actorCapabilities: input.actorCapabilities,
    expectedRevision: input.expectedRevision ?? null,
    requestedPayload: commandPayload(input),
  });

  return {
    ...input,
    command: parseContributionCommand(
      commandActionType(input),
      approvedRequest.payload,
    ),
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

export function normalizedToken(value: string | null | undefined): string | null {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

function directMutationIdempotencyContext(
  input: ExecuteContributionActionInput,
) {
  return {
    confirmationToken: normalizedToken(input.confirmationToken),
    payload: commandPayload(input),
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
    payload: commandPayload(input),
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
      commandActionType(input),
      `confirmation-${stableFingerprint(requestContext)}`,
    ].join("/");
  }

  return [
    "correction-request",
    input.tenantId,
    input.contributionId,
    commandActionType(input),
    `context-${stableFingerprint(requestContext)}`,
  ].join("/");
}

export async function createPendingCorrectionRequest<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
  extra: { receiptDeliveryProposal?: Record<string, unknown> | null } = {},
): Promise<ContributionActionResult<TContribution>> {
  assertCanRequestCorrection(input);

  const payload = await resolvePendingCorrectionPayload(input);
  const requestInput: ExecuteContributionActionInput<TContribution> = {
    ...input,
    command: parseContributionCommand(commandActionType(input), payload),
  };
  const createCorrectionRequest = requireDependency(
    input.dependencies,
    "createCorrectionRequest",
  );
  const correctionRequestId = await createCorrectionRequest({
    tenantId: input.tenantId,
    contributionId: input.contributionId,
    actionType: commandActionType(input),
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
  const payload = commandPayload(input);
  if (commandActionType(input) !== "stripe_replay") {
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

export function providerIdempotencyKey(input: ExecuteContributionActionInput): string {
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
      commandActionType(input),
      approvedRequestId,
    ].join("/");
  }

  if (normalizedToken(input.confirmationToken)) {
    return [
      "contribution-action",
      input.tenantId,
      input.contributionId,
      commandActionType(input),
      `confirmation-${stableFingerprint(directMutationIdempotencyContext(input))}`,
    ].join("/");
  }

  throw new ApiHttpError(
    400,
    `An idempotency key is required for ${commandActionType(input)}.`,
  );
}

export function correctionIdempotencyKey(
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
      commandActionType(input),
      approvedRequestId,
    ].join("/");
  }

  if (normalizedToken(input.confirmationToken)) {
    return [
      "correction",
      input.tenantId,
      input.contributionId,
      commandActionType(input),
      `confirmation-${stableFingerprint(directMutationIdempotencyContext(input))}`,
    ].join("/");
  }

  throw new ApiHttpError(
    400,
    `An idempotency key is required for ${commandActionType(input)}.`,
  );
}

export async function sendCorrectionNotification(
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
    actionType: commandActionType(input),
    contributionId: input.contributionId,
    correctionId: result.correctionId,
    auditEventId: result.auditEventId,
    actorProfileId: input.actorProfileId,
    providerOutcome: result.providerOutcome ?? null,
    beforeSummary: result.beforeSummary ?? null,
    afterSummary: result.afterSummary ?? null,
  });
}
