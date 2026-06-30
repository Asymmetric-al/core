import { sendEmail } from "@asym/email";
import {
  renderMergeTags,
  renderTemplateForRecipient,
} from "@asym/email/merge-tag-render";

import {
  getContributionNotificationPolicy,
  type ContributionNotificationDecision,
  type ContributionNotificationMode,
} from "./policy";
import { validateContributionCorrectionTemplate } from "./templates";

import type { ContributionActionType } from "../types";
import type { SendEmailOptions } from "@asym/email";
import type {
  ContributionCorrectionTemplateFamily,
  ContributionCorrectionTemplateVariant,
} from "@asym/email/contribution-correction-tags";

export interface ContributionCorrectionNotificationTemplate {
  id: string;
  versionId: string;
  version: number;
  family: ContributionCorrectionTemplateFamily;
  variant: ContributionCorrectionTemplateVariant;
  active: boolean;
  subject: string;
  html: string;
  text: string;
}

export interface ContributionCorrectionNotificationSettings {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string | null;
  taskAssignmentMode?: "actor_only" | "queue_only" | "actor_and_queue";
}

export interface ContributionCorrectionNotificationInput {
  tenantId: string;
  actionType: ContributionActionType;
  tenantModeOverride?: ContributionNotificationMode | null;
  suppressionReasonRequiredOverride?: boolean | null;
  taskAssignmentMode?: "actor_only" | "queue_only" | "actor_and_queue";
  contributionId?: string | null;
  correctionId: string | null;
  operationAuditEventId: string;
  actorProfileId: string | null;
  recipient: {
    donorId: string | null;
    email: string;
    name: string;
  };
  mergeValues: Record<string, unknown>;
  personalNote?: string | null;
  suppressionReason?: string | null;
  decisionOverride?: ContributionNotificationDecision | null;
  template: ContributionCorrectionNotificationTemplate | null;
  settings: ContributionCorrectionNotificationSettings | null;
  dependencies?: {
    sendEmail?: typeof sendEmail;
    logNotificationEvent?: (
      event: ContributionCorrectionNotificationEvent,
    ) => Promise<ContributionCorrectionNotificationLogResult>;
    recordNotificationTaskIds?: (
      input: ContributionCorrectionNotificationTaskLinkInput,
    ) => Promise<void>;
    createFollowUpTask?: (
      input: ContributionCorrectionNotificationTaskInput,
    ) => Promise<string[]>;
  };
}

export interface ContributionCorrectionNotificationEvent {
  tenantId: string;
  idempotencyKey: string;
  operationAuditEventId: string;
  correctionId: string | null;
  actionType: ContributionActionType;
  decision: ContributionNotificationDecision;
  templateId?: string | null;
  templateVersionId?: string | null;
  templateFamily?: string | null;
  templateVariant?: string | null;
  templateVersion?: number | null;
  recipientDonorId: string | null;
  recipientEmail: string;
  policySnapshot?: Record<string, unknown>;
  suppressionReason?: string | null;
  personalNotePresent: boolean;
  providerStatus?: string | null;
  providerMessageId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  taskIds?: string[];
}

export interface ContributionCorrectionNotificationLogResult {
  eventId: string;
  taskIds?: string[];
}

export interface ContributionCorrectionNotificationTaskInput {
  tenantId: string;
  actorProfileId: string | null;
  notificationEventId: string | null;
  operationAuditEventId: string;
  correctionId: string | null;
  contributionId?: string | null;
  actionType: ContributionActionType;
  recipientDonorId: string | null;
  assignmentMode: "actor_only" | "queue_only" | "actor_and_queue";
  reason: string;
}

export interface ContributionCorrectionNotificationTaskLinkInput {
  notificationEventId: string;
  taskIds: string[];
}

function buildProviderIdempotencyKey(input: {
  tenantId: string;
  operationAuditEventId: string;
  donorId: string;
  family: string;
  variant: string;
}) {
  return [
    "correction-notification",
    input.tenantId,
    input.operationAuditEventId,
    input.donorId,
    input.family,
    input.variant,
  ].join("/");
}

function buildDecisionIdempotencyKey(input: {
  tenantId: string;
  operationAuditEventId: string;
  donorId: string;
  actionType: ContributionActionType;
  decision: ContributionNotificationDecision;
  reason?: string;
}) {
  return [
    "correction-notification",
    input.tenantId,
    input.operationAuditEventId,
    input.donorId,
    input.actionType,
    input.decision,
    input.reason ?? "default",
  ].join("/");
}

function normalizeTaskIds(taskIds: string[] | null | undefined): string[] {
  return Array.isArray(taskIds)
    ? taskIds.filter((taskId) => taskId.trim().length > 0)
    : [];
}

function errorMessageFromUnknown(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim().length > 0
    ? error.message
    : fallback;
}

async function logEvent(
  input: ContributionCorrectionNotificationInput,
  event: Omit<ContributionCorrectionNotificationEvent, "tenantId">,
): Promise<ContributionCorrectionNotificationLogResult | null> {
  const result = await input.dependencies?.logNotificationEvent?.({
    tenantId: input.tenantId,
    ...event,
  });

  return result
    ? {
        eventId: result.eventId,
        taskIds: normalizeTaskIds(result.taskIds),
      }
    : null;
}

async function createTaskIntent(
  input: ContributionCorrectionNotificationInput,
  reason: string,
  notificationEventId: string | null,
): Promise<string[]> {
  const assignmentMode =
    input.taskAssignmentMode ??
    input.settings?.taskAssignmentMode ??
    "actor_and_queue";

  return (
    (await input.dependencies?.createFollowUpTask?.({
      tenantId: input.tenantId,
      actorProfileId: input.actorProfileId,
      notificationEventId,
      operationAuditEventId: input.operationAuditEventId,
      correctionId: input.correctionId,
      contributionId: input.contributionId,
      actionType: input.actionType,
      recipientDonorId: input.recipient.donorId,
      assignmentMode,
      reason,
    })) ?? []
  );
}

async function createOrReuseTaskIntent(input: {
  notificationInput: ContributionCorrectionNotificationInput;
  logResult: ContributionCorrectionNotificationLogResult | null;
  reason: string;
}) {
  const existingTaskIds = normalizeTaskIds(input.logResult?.taskIds);
  if (existingTaskIds.length > 0) {
    return existingTaskIds;
  }

  const taskIds = await createTaskIntent(
    input.notificationInput,
    input.reason,
    input.logResult?.eventId ?? null,
  );

  if (input.logResult?.eventId && taskIds.length > 0) {
    await input.notificationInput.dependencies?.recordNotificationTaskIds?.({
      notificationEventId: input.logResult.eventId,
      taskIds,
    });
  }

  return taskIds;
}

async function blockNotification(
  input: ContributionCorrectionNotificationInput,
  message: string,
  errorCode: string,
) {
  const policy = getContributionNotificationPolicy({
    actionType: input.actionType,
    tenantModeOverride: input.tenantModeOverride,
    suppressionReasonRequiredOverride: input.suppressionReasonRequiredOverride,
  });
  const policySnapshot = {
    mode: policy.mode,
    suppressionReasonRequired: policy.suppressionReasonRequired,
  };
  const logResult = await logEvent(input, {
    idempotencyKey: buildDecisionIdempotencyKey({
      tenantId: input.tenantId,
      operationAuditEventId: input.operationAuditEventId,
      donorId: input.recipient.donorId ?? "unknown-donor",
      actionType: input.actionType,
      decision: "blocked",
      reason: errorCode,
    }),
    operationAuditEventId: input.operationAuditEventId,
    correctionId: input.correctionId,
    actionType: input.actionType,
    decision: "blocked",
    policySnapshot,
    recipientDonorId: input.recipient.donorId,
    recipientEmail: input.recipient.email,
    personalNotePresent: Boolean(input.personalNote?.trim()),
    errorCode,
    errorMessage: message,
    taskIds: [],
  });
  const taskIds = await createOrReuseTaskIntent({
    notificationInput: input,
    logResult,
    reason: message,
  });

  return {
    decision: "blocked" as const,
    taskIds,
    error: {
      code: errorCode,
      message,
    },
  };
}

export async function sendContributionCorrectionNotification(
  input: ContributionCorrectionNotificationInput,
) {
  const policy = getContributionNotificationPolicy({
    actionType: input.actionType,
    tenantModeOverride: input.tenantModeOverride,
    suppressionReasonRequiredOverride: input.suppressionReasonRequiredOverride,
  });
  const policySnapshot = {
    mode: policy.mode,
    suppressionReasonRequired: policy.suppressionReasonRequired,
  };

  if (input.decisionOverride === "suppressed") {
    if (policy.suppressionReasonRequired && !input.suppressionReason?.trim()) {
      throw new Error("A suppression reason is required.");
    }

    await logEvent(input, {
      idempotencyKey: buildDecisionIdempotencyKey({
        tenantId: input.tenantId,
        operationAuditEventId: input.operationAuditEventId,
        donorId: input.recipient.donorId ?? "unknown-donor",
        actionType: input.actionType,
        decision: "suppressed",
      }),
      operationAuditEventId: input.operationAuditEventId,
      correctionId: input.correctionId,
      actionType: input.actionType,
      decision: "suppressed",
      policySnapshot,
      recipientDonorId: input.recipient.donorId,
      recipientEmail: input.recipient.email,
      suppressionReason: input.suppressionReason ?? null,
      personalNotePresent: Boolean(input.personalNote?.trim()),
    });

    return { decision: "suppressed" as const, taskIds: [] };
  }

  if (
    (policy.mode === "staff_chooses" || policy.mode === "always_ask") &&
    !input.decisionOverride
  ) {
    await logEvent(input, {
      idempotencyKey: buildDecisionIdempotencyKey({
        tenantId: input.tenantId,
        operationAuditEventId: input.operationAuditEventId,
        donorId: input.recipient.donorId ?? "unknown-donor",
        actionType: input.actionType,
        decision: "not_required",
      }),
      operationAuditEventId: input.operationAuditEventId,
      correctionId: input.correctionId,
      actionType: input.actionType,
      decision: "not_required",
      policySnapshot,
      recipientDonorId: input.recipient.donorId,
      recipientEmail: input.recipient.email,
      personalNotePresent: Boolean(input.personalNote?.trim()),
    });

    return { decision: "not_required" as const, taskIds: [] };
  }

  if (!input.recipient.email.trim()) {
    return blockNotification(
      input,
      "Missing donor email address for contribution correction notification.",
      "missing_recipient_email",
    );
  }

  if (!input.template) {
    return blockNotification(
      input,
      "Missing active contribution correction template.",
      "missing_template",
    );
  }

  if (!input.settings) {
    return blockNotification(
      input,
      "Tenant email sending is not connected for contribution correction notifications.",
      "missing_email_settings",
    );
  }

  if (!input.template.active) {
    return blockNotification(
      input,
      "Contribution correction template is inactive.",
      "inactive_template",
    );
  }

  const validation = validateContributionCorrectionTemplate({
    family: input.template.family,
    variant: input.template.variant,
    html: input.template.html,
    text: input.template.text,
    active: true,
  });

  if (!validation.valid) {
    return blockNotification(
      input,
      validation.errors.join("; "),
      "invalid_template",
    );
  }

  const mergeValues = {
    ...input.mergeValues,
    personal_note: input.personalNote?.trim() ?? "",
  };
  const rendered = (() => {
    try {
      return renderTemplateForRecipient(
        {
          html: input.template.html,
          text: input.template.text,
        },
        mergeValues,
        {},
        {
          messageType: "transactional",
        },
      );
    } catch (error) {
      return new Error(
        errorMessageFromUnknown(
          error,
          "Failed to render contribution correction notification.",
        ),
      );
    }
  })();

  if (rendered instanceof Error) {
    return blockNotification(
      input,
      errorMessageFromUnknown(
        rendered,
        "Failed to render contribution correction notification.",
      ),
      "render_failed",
    );
  }

  const renderedSubject = (() => {
    try {
      return renderMergeTags(input.template.subject, mergeValues, {
        messageType: "transactional",
        escapeHtml: false,
      });
    } catch (error) {
      return new Error(
        errorMessageFromUnknown(
          error,
          "Failed to render contribution correction notification subject.",
        ),
      );
    }
  })();

  if (renderedSubject instanceof Error) {
    return blockNotification(
      input,
      errorMessageFromUnknown(
        renderedSubject,
        "Failed to render contribution correction notification subject.",
      ),
      "render_failed",
    );
  }

  const settings = input.settings;
  const sender = input.dependencies?.sendEmail ?? sendEmail;
  const idempotencyKey = buildProviderIdempotencyKey({
    tenantId: input.tenantId,
    operationAuditEventId: input.operationAuditEventId,
    donorId: input.recipient.donorId ?? "unknown-donor",
    family: input.template.family,
    variant: input.template.variant,
  });
  const sendOptions = {
    to: {
      email: input.recipient.email,
      name: input.recipient.name,
    },
    from: {
      email: settings.fromEmail,
      name: settings.fromName,
    },
    replyTo: settings.replyToEmail
      ? { email: settings.replyToEmail }
      : undefined,
    subject: renderedSubject,
    html: rendered.html,
    text: rendered.text,
    idempotencyKey,
    customArgs: {
      source: "contribution_correction_notification",
      correctionId: input.correctionId ?? "none",
      operationAuditEventId: input.operationAuditEventId,
      templateId: input.template.id,
      templateVersionId: input.template.versionId,
    },
  } satisfies SendEmailOptions;

  const providerResult = await (async () => {
    try {
      return {
        kind: "provider_result" as const,
        result: await sender(settings.apiKey, sendOptions),
      };
    } catch (error) {
      const errorMessage = errorMessageFromUnknown(
        error,
        "Contribution correction email failed.",
      );
      const logResult = await logEvent(input, {
        idempotencyKey,
        operationAuditEventId: input.operationAuditEventId,
        correctionId: input.correctionId,
        actionType: input.actionType,
        decision: "failed",
        templateId: input.template?.id ?? null,
        templateVersionId: input.template?.versionId ?? null,
        templateFamily: input.template?.family ?? null,
        templateVariant: input.template?.variant ?? null,
        templateVersion: input.template?.version ?? null,
        recipientDonorId: input.recipient.donorId,
        recipientEmail: input.recipient.email,
        policySnapshot,
        personalNotePresent: Boolean(input.personalNote?.trim()),
        providerStatus: "failed",
        providerMessageId: null,
        errorCode: "provider_exception",
        errorMessage,
        taskIds: [],
      });
      const taskIds = await createOrReuseTaskIntent({
        notificationInput: input,
        logResult,
        reason: errorMessage,
      });

      return {
        kind: "provider_exception" as const,
        messageId: undefined as string | undefined,
        taskIds,
      };
    }
  })();

  if (providerResult.kind === "provider_exception") {
    return {
      decision: "failed" as const,
      taskIds: providerResult.taskIds,
      messageId: providerResult.messageId,
      templateVersionId: input.template.versionId,
    };
  }

  const sendResult = providerResult.result;
  const decision: ContributionNotificationDecision = sendResult.success
    ? "sent"
    : "failed";
  const error = sendResult.errors?.[0] ?? null;
  const logResult = await logEvent(input, {
    idempotencyKey,
    operationAuditEventId: input.operationAuditEventId,
    correctionId: input.correctionId,
    actionType: input.actionType,
    decision,
    templateId: input.template.id,
    templateVersionId: input.template.versionId,
    templateFamily: input.template.family,
    templateVariant: input.template.variant,
    templateVersion: input.template.version,
    recipientDonorId: input.recipient.donorId,
    recipientEmail: input.recipient.email,
    policySnapshot,
    personalNotePresent: Boolean(input.personalNote?.trim()),
    providerStatus: decision,
    providerMessageId: sendResult.messageId ?? null,
    errorCode: error?.code ?? null,
    errorMessage: error?.message ?? null,
    taskIds: [],
  });
  const taskIds =
    decision === "failed"
      ? await createOrReuseTaskIntent({
          notificationInput: input,
          logResult,
          reason: error?.message ?? "Contribution correction email failed.",
        })
      : [];

  return {
    decision,
    taskIds,
    messageId: sendResult.messageId,
    templateVersionId: input.template.versionId,
  };
}
