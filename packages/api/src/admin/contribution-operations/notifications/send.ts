import { sendEmail } from "@asym/email";
import { renderTemplateForRecipient } from "@asym/email/merge-tag-render";

import {
  getContributionNotificationPolicy,
  isContributionNotificationSuppressionReasonRequired,
  type ContributionNotificationDecision,
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
  correctionId: string | null;
  operationAuditEventId: string;
  actorProfileId: string | null;
  recipient: {
    donorId: string;
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
    ) => Promise<string>;
    createFollowUpTask?: (
      input: ContributionCorrectionNotificationTaskInput,
    ) => Promise<string[]>;
  };
}

export interface ContributionCorrectionNotificationEvent {
  tenantId: string;
  operationAuditEventId: string;
  correctionId: string | null;
  actionType: ContributionActionType;
  decision: ContributionNotificationDecision;
  templateId?: string | null;
  templateVersionId?: string | null;
  templateFamily?: string | null;
  templateVariant?: string | null;
  templateVersion?: number | null;
  recipientDonorId: string;
  recipientEmail: string;
  suppressionReason?: string | null;
  personalNotePresent: boolean;
  providerStatus?: string | null;
  providerMessageId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  taskIds?: string[];
}

export interface ContributionCorrectionNotificationTaskInput {
  tenantId: string;
  actorProfileId: string | null;
  operationAuditEventId: string;
  correctionId: string | null;
  actionType: ContributionActionType;
  recipientDonorId: string;
  assignmentMode: "actor_only" | "queue_only" | "actor_and_queue";
  reason: string;
}

function buildIdempotencyKey(input: {
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

async function logEvent(
  input: ContributionCorrectionNotificationInput,
  event: Omit<ContributionCorrectionNotificationEvent, "tenantId">,
): Promise<string | null> {
  return (
    (await input.dependencies?.logNotificationEvent?.({
      tenantId: input.tenantId,
      ...event,
    })) ?? null
  );
}

async function createTaskIntent(
  input: ContributionCorrectionNotificationInput,
  reason: string,
): Promise<string[]> {
  const assignmentMode =
    input.settings?.taskAssignmentMode ?? "actor_and_queue";

  return (
    (await input.dependencies?.createFollowUpTask?.({
      tenantId: input.tenantId,
      actorProfileId: input.actorProfileId,
      operationAuditEventId: input.operationAuditEventId,
      correctionId: input.correctionId,
      actionType: input.actionType,
      recipientDonorId: input.recipient.donorId,
      assignmentMode,
      reason,
    })) ?? []
  );
}

async function blockNotification(
  input: ContributionCorrectionNotificationInput,
  message: string,
) {
  const taskIds = await createTaskIntent(input, message);
  await logEvent(input, {
    operationAuditEventId: input.operationAuditEventId,
    correctionId: input.correctionId,
    actionType: input.actionType,
    decision: "blocked",
    recipientDonorId: input.recipient.donorId,
    recipientEmail: input.recipient.email,
    personalNotePresent: Boolean(input.personalNote?.trim()),
    errorCode: "invalid_template",
    errorMessage: message,
    taskIds,
  });

  return {
    decision: "blocked" as const,
    taskIds,
    error: {
      code: "invalid_template",
      message,
    },
  };
}

export async function sendContributionCorrectionNotification(
  input: ContributionCorrectionNotificationInput,
) {
  const policy = getContributionNotificationPolicy({
    actionType: input.actionType,
  });

  if (input.decisionOverride === "suppressed") {
    if (
      isContributionNotificationSuppressionReasonRequired({
        actionType: input.actionType,
        decision: "suppressed",
      }) &&
      !input.suppressionReason?.trim()
    ) {
      throw new Error("A suppression reason is required.");
    }

    await logEvent(input, {
      operationAuditEventId: input.operationAuditEventId,
      correctionId: input.correctionId,
      actionType: input.actionType,
      decision: "suppressed",
      recipientDonorId: input.recipient.donorId,
      recipientEmail: input.recipient.email,
      suppressionReason: input.suppressionReason ?? null,
      personalNotePresent: Boolean(input.personalNote?.trim()),
    });

    return { decision: "suppressed" as const, taskIds: [] };
  }

  if (policy.mode === "staff_chooses" && !input.decisionOverride) {
    await logEvent(input, {
      operationAuditEventId: input.operationAuditEventId,
      correctionId: input.correctionId,
      actionType: input.actionType,
      decision: "not_required",
      recipientDonorId: input.recipient.donorId,
      recipientEmail: input.recipient.email,
      personalNotePresent: Boolean(input.personalNote?.trim()),
    });

    return { decision: "not_required" as const, taskIds: [] };
  }

  if (!input.template || !input.settings) {
    return blockNotification(
      input,
      "Missing active contribution correction template.",
    );
  }

  if (!input.template.active) {
    return blockNotification(
      input,
      "Contribution correction template is inactive.",
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
    return blockNotification(input, validation.errors.join("; "));
  }

  const mergeValues = {
    ...input.mergeValues,
    personal_note: input.personalNote?.trim() ?? "",
  };
  const rendered = renderTemplateForRecipient(
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

  const sender = input.dependencies?.sendEmail ?? sendEmail;
  const sendResult = await sender(input.settings.apiKey, {
    to: {
      email: input.recipient.email,
      name: input.recipient.name,
    },
    from: {
      email: input.settings.fromEmail,
      name: input.settings.fromName,
    },
    replyTo: input.settings.replyToEmail
      ? { email: input.settings.replyToEmail }
      : undefined,
    subject: input.template.subject,
    html: rendered.html,
    text: rendered.text,
    idempotencyKey: buildIdempotencyKey({
      tenantId: input.tenantId,
      operationAuditEventId: input.operationAuditEventId,
      donorId: input.recipient.donorId,
      family: input.template.family,
      variant: input.template.variant,
    }),
    customArgs: {
      source: "contribution_correction_notification",
      correctionId: input.correctionId ?? "none",
      operationAuditEventId: input.operationAuditEventId,
      templateId: input.template.id,
      templateVersionId: input.template.versionId,
    },
  } satisfies SendEmailOptions);

  const decision: ContributionNotificationDecision = sendResult.success
    ? "sent"
    : "failed";
  const error = sendResult.errors?.[0] ?? null;
  const taskIds =
    decision === "failed"
      ? await createTaskIntent(
          input,
          error?.message ?? "Contribution correction email failed.",
        )
      : [];

  await logEvent(input, {
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
    personalNotePresent: Boolean(input.personalNote?.trim()),
    providerStatus: decision,
    providerMessageId: sendResult.messageId ?? null,
    errorCode: error?.code ?? null,
    errorMessage: error?.message ?? null,
    taskIds,
  });

  return {
    decision,
    taskIds,
    messageId: sendResult.messageId,
    templateVersionId: input.template.versionId,
  };
}
