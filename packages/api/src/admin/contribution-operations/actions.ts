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

function assertActorPermissions(
  input: Pick<ExecuteContributionActionInput, "actorPermissions">,
  policy: ReturnType<typeof getContributionActionPolicy>,
) {
  if (!policy.requiredPermission) {
    return;
  }

  if (!input.actorPermissions.includes(policy.requiredPermission)) {
    throw new ApiHttpError(
      403,
      `Forbidden: requires ${policy.requiredPermission}`,
    );
  }
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

  assertActorPermissions(input, policy);
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
        const applyCorrection = requireDependency(
          input.dependencies,
          "applyCorrection",
        );
        const correction = await applyCorrection({
          tenantId: input.tenantId,
          contributionId: input.contributionId,
          actionType: input.actionType,
          payload: input.payload ?? {},
        });
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
