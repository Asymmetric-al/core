import {
  correctionRequiresApproval,
  resolveCorrectionApprovalPolicy,
} from "./approval-policy";
import { getContributionActionPolicy } from "./policy";
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
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiHttpError(400, `${key} is required.`);
  }
  return value;
}

function requireNumberPayload(
  payload: Record<string, unknown> | undefined,
  key: string,
): number {
  const value = payload?.[key];
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new ApiHttpError(400, `${key} must be a positive number.`);
  }
  return value;
}

function assertReasonAndConfirmation(
  input: Pick<
    ExecuteContributionActionInput,
    "reason" | "confirmationToken" | "actionType"
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
    throw new ApiHttpError(
      400,
      `A confirmation token is required for ${input.actionType}.`,
    );
  }
}

const LEGACY_MANAGE_PERMISSION = "finance:manage_contributions" as const;
const REQUEST_CORRECTION_CAPABILITY = "contributions.request_corrections";

/**
 * Granular capability required to execute an action immediately. Approval
 * request creation is handled separately for approval-gated corrections.
 */
const DIRECT_ACTION_CAPABILITY: Record<ContributionActionType, string> = {
  resend_receipt: "contributions.manage_receipts",
  approve_staged_gift: "contributions.apply_corrections",
  retry_staged_gift: "contributions.retry_crm_post",
  crm_repost: "contributions.retry_crm_post",
  metadata_update: "contributions.apply_corrections",
  refund: "contributions.run_refunds",
  stripe_replay: "contributions.use_provider_actions",
  donor_relink: "contributions.apply_corrections",
  amount_correction: "contributions.apply_corrections",
  designation_correction: "contributions.apply_corrections",
  fund_correction: "contributions.apply_corrections",
  allocation_correction: "contributions.apply_corrections",
  receipt_correction: "contributions.apply_corrections",
  statement_correction: "contributions.apply_corrections",
  payment_state_correction: "contributions.apply_corrections",
};

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
    "actorPermissions" | "actorCapabilities" | "actionType"
  >,
  policy: ReturnType<typeof getContributionActionPolicy>,
  options: { requiresApproval: boolean },
) {
  if (hasLegacyManagePermission(input)) {
    return;
  }

  const directCapability = DIRECT_ACTION_CAPABILITY[input.actionType];
  if (hasActorCapability(input, directCapability)) {
    return;
  }

  if (isApprovalRequestAction(input.actionType)) {
    if (hasActorCapability(input, REQUEST_CORRECTION_CAPABILITY)) {
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
  if (
    hasLegacyManagePermission(input) ||
    hasActorCapability(input, capability)
  ) {
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
  return (
    outcome?.status === "failed" ||
    outcome?.status === "local_update_failed" ||
    outcome?.status === "canceled" ||
    outcome?.status === "requires_action"
  );
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

async function createPendingCorrectionRequest<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
  extra: { receiptDeliveryProposal?: Record<string, unknown> | null } = {},
): Promise<ContributionActionResult<TContribution>> {
  assertCanRequestCorrection(input);

  const createCorrectionRequest = requireDependency(
    input.dependencies,
    "createCorrectionRequest",
  );
  const correctionRequestId = await createCorrectionRequest({
    tenantId: input.tenantId,
    contributionId: input.contributionId,
    actionType: input.actionType,
    payload: input.payload ?? {},
    reason: input.reason ?? "",
    requestedByProfileId: input.actorProfileId,
    sourceSurface: input.sourceSurface,
    expectedRevision: input.expectedRevision ?? null,
    idempotencyKey: input.idempotencyKey ?? null,
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

function providerIdempotencyKey(input: ExecuteContributionActionInput): string {
  if (input.idempotencyKey?.trim()) {
    return input.idempotencyKey;
  }

  if (input.confirmationToken?.trim()) {
    return [
      "contribution-action",
      input.tenantId,
      input.contributionId,
      input.actionType,
      input.confirmationToken,
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
  input: ExecuteContributionActionInput<TContribution>,
): Promise<ContributionActionResult<TContribution>> {
  const policy = getContributionActionPolicy({
    actionType: input.actionType,
    organizationSettings: input.organizationSettings,
    userPreferences: input.userPreferences,
  });
  const actionRequiresApproval =
    isApprovalRequestAction(input.actionType) &&
    requiresCorrectionApproval(input);

  assertActorPermissions(input, policy, {
    requiresApproval: actionRequiresApproval,
  });
  assertReasonAndConfirmation(input, policy);

  switch (input.actionType) {
    case "resend_receipt": {
      const stagedGiftId =
        input.stagedGiftId ??
        requireStringPayload(input.payload, "stagedGiftId");
      const sendReceipt = requireDependency(input.dependencies, "sendReceipt");
      const receipt = await sendReceipt({
        tenantId: input.tenantId,
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
      const approve = requireDependency(
        input.dependencies,
        "approveStagedGift",
      );
      await approve({
        tenantId: input.tenantId,
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
            "The connected CRM adapter does not support posting designation child records yet. Retry the parent gift record instead, or resolve the line in the CRM directly.",
          );
        }
        await retryDesignation({
          tenantId: input.tenantId,
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

    case "donor_relink": {
      const donorId = requireStringPayload(input.payload, "donorId");

      if (requiresCorrectionApproval(input)) {
        return createPendingCorrectionRequest(input);
      }

      assertCanExecuteDirectly(input, DIRECT_ACTION_CAPABILITY.donor_relink);

      const relinkDonor = requireDependency(input.dependencies, "relinkDonor");
      const relink = await relinkDonor({
        tenantId: input.tenantId,
        contributionId: input.contributionId,
        donorId,
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
      const amount = requireNumberPayload(input.payload, "amount");

      // Refunds follow the same tenant approval policy as other high-risk
      // corrections (ADR-CD-005 / ADR-CD-025): create a request unless the
      // gate is suppressed or this apply comes from an approved request.
      if (requiresCorrectionApproval(input)) {
        return createPendingCorrectionRequest(input);
      }

      assertCanExecuteDirectly(input, DIRECT_ACTION_CAPABILITY.refund);

      const refund = requireDependency(
        input.dependencies,
        "refundContribution",
      );
      const providerOutcome = await refund({
        tenantId: input.tenantId,
        contributionId: input.contributionId,
        amount,
        reason: input.reason ?? "",
        confirmationToken: input.confirmationToken ?? "",
        expectedRevision: input.expectedRevision ?? null,
        idempotencyKey: providerIdempotencyKey(input),
      });
      const correctionId = await createCorrectionRecord(
        input,
        correctionInput(input, {
          correctionType: "refund",
          status: isFailedProviderOutcome(providerOutcome)
            ? "failed"
            : "applied",
          providerOutcome,
          afterSummary: { refundAmount: amount },
        }),
      );
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

      assertCanExecuteDirectly(input, DIRECT_ACTION_CAPABILITY.stripe_replay);

      const replayStripeEvent = requireDependency(
        input.dependencies,
        "replayStripeEvent",
      );
      const providerOutcome = await replayStripeEvent({
        tenantId: input.tenantId,
        contributionId: input.contributionId,
        payload: input.payload ?? {},
      });
      const correctionId = await createCorrectionRecord(
        input,
        correctionInput(input, {
          correctionType: "stripe_replay",
          status: isFailedProviderOutcome(providerOutcome)
            ? "failed"
            : "applied",
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
          DIRECT_ACTION_CAPABILITY[input.actionType],
        );

        const applyCorrection = requireDependency(
          input.dependencies,
          "applyCorrection",
        );
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
          idempotencyKey:
            input.idempotencyKey ??
            (input.confirmationToken
              ? `correction/${input.tenantId}/${input.contributionId}/${input.actionType}/${input.confirmationToken}`
              : null),
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
