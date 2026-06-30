import { DEFAULT_SITE_URL } from "@asym/config/site-shared";
import { serverEnv } from "@asym/env";

import { sendContributionCorrectionNotification } from "./send";
import { resolveContributionCorrectionTemplateVariant } from "./templates";
import { decryptResendApiKey } from "../../../email/crypto";
import { readTenantEmailSettings } from "../../../email/settings-store";
import {
  listEmailTemplateVersions,
  readEmailTemplate,
} from "../../../email/template-store";
import { createMissionControlTaskInSupabase } from "../../mission-control-tasks/store";

import type { MissionControlLinkedRecord } from "../../mission-control-tasks/types";
import type { ContributionDetail } from "../detail-read-model";
import type {
  ContributionActionType,
  ContributionProviderOutcome,
} from "../types";
import type { ContributionNotificationMode } from "./policy";
import type {
  ContributionCorrectionNotificationEvent,
  ContributionCorrectionNotificationLogResult,
  ContributionCorrectionNotificationTaskInput,
} from "./send";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseAdmin = AdminSupabaseClient;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isContributionNotificationMode(
  value: unknown,
): value is ContributionNotificationMode {
  return (
    value === "auto_notify" ||
    value === "always_ask" ||
    value === "staff_chooses"
  );
}

function isTaskAssignmentMode(
  value: unknown,
): value is "actor_only" | "queue_only" | "actor_and_queue" {
  return (
    value === "actor_only" ||
    value === "queue_only" ||
    value === "actor_and_queue"
  );
}

function isUniqueViolation(error: { code?: string } | null | undefined) {
  return error?.code === "23505";
}

function getRefundKind(detail: ContributionDetail) {
  if (detail.refund.status === "partial_refund") {
    return "partial" as const;
  }
  if (detail.refund.status === "refunded") {
    return "full" as const;
  }
  return null;
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    currency,
    style: "currency",
  }).format(cents / 100);
}

function summaryAmountCents(
  summary: Record<string, unknown> | null | undefined,
  key: string,
  fallback: number,
) {
  const value = summary?.[key];
  return typeof value === "number" ? value : fallback;
}

function summaryString(
  summary: Record<string, unknown> | null | undefined,
  key: string,
  fallback: string | null | undefined,
) {
  const value = summary?.[key];
  return typeof value === "string" && value.trim().length > 0
    ? value
    : (fallback ?? "");
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function resolveDonorOrigin() {
  return stripTrailingSlash(
    serverEnv.NEXT_PUBLIC_DONOR_URL ||
      serverEnv.DONOR_APP_URL ||
      serverEnv.NEXT_PUBLIC_SITE_URL ||
      serverEnv.NEXT_PUBLIC_APP_URL ||
      DEFAULT_SITE_URL,
  );
}

function buildDonorUrl(path: string) {
  return new URL(path, `${resolveDonorOrigin()}/`).toString();
}

export function buildContributionCorrectionNotificationMergeValues(input: {
  detail: ContributionDetail;
  beforeSummary?: Record<string, unknown> | null;
  afterSummary?: Record<string, unknown> | null;
  orgName?: string | null;
  supportContactEmail?: string | null;
}) {
  const currency = input.detail.amount.currency;
  const currentAmount = input.detail.amount.value;
  const originalCents = summaryAmountCents(
    input.beforeSummary,
    "amount",
    currentAmount,
  );
  const correctedCents = summaryAmountCents(
    input.afterSummary,
    "amount",
    currentAmount,
  );
  const refundCents =
    typeof input.afterSummary?.refundAmount === "number"
      ? input.afterSummary.refundAmount
      : input.detail.refund.amount;
  const orgName = input.orgName?.trim() || "Your ministry";
  const supportEmail = input.supportContactEmail?.trim();
  const supportContactLink = supportEmail ? `mailto:${supportEmail}` : null;
  const fallbackDesignationName =
    input.detail.shared.designationSummary.fundName;
  const donorHistoryUrl = buildDonorUrl("/donor-dashboard/history");

  return {
    full_name: input.detail.donor?.name ?? "Donor",
    email: input.detail.donor?.email ?? "",
    org_name: orgName,
    gift_date: new Date(input.detail.gift.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    donation_amount: formatMoney(correctedCents, currency),
    original_amount: formatMoney(originalCents, currency),
    corrected_amount: formatMoney(correctedCents, currency),
    refund_amount: formatMoney(refundCents, currency),
    previous_designation_name: summaryString(
      input.beforeSummary,
      "designationName",
      fallbackDesignationName,
    ),
    corrected_designation_name: summaryString(
      input.afterSummary,
      "designationName",
      fallbackDesignationName,
    ),
    receipt_link: donorHistoryUrl,
    statement_link: donorHistoryUrl,
    payment_state: input.detail.donorVisible.status,
    donor_portal_link: donorHistoryUrl,
    support_contact_link: supportContactLink,
    operation_reference: input.detail.id,
  };
}

async function readActiveTemplateBinding(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  family: string;
  variant: string;
}) {
  const { data, error } = await input.supabaseAdmin
    .from("email_template_system_bindings")
    .select("template_id, family_key, variant_key, is_active")
    .eq("tenant_id", input.tenantId)
    .eq("family_key", input.family)
    .eq("variant_key", input.variant)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return isRecord(data) ? data : null;
}

export async function readContributionNotificationSettings(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  actionType: ContributionActionType;
}): Promise<{
  mode: ContributionNotificationMode | null;
  suppressionReasonRequired: boolean | null;
  taskAssignmentMode: "actor_only" | "queue_only" | "actor_and_queue" | null;
}> {
  const { data, error } = await input.supabaseAdmin
    .from("contribution_notification_settings")
    .select("mode, suppression_reason_required, task_assignment_mode")
    .eq("tenant_id", input.tenantId)
    .eq("action_type", input.actionType)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!isRecord(data)) {
    return {
      mode: null,
      suppressionReasonRequired: null,
      taskAssignmentMode: null,
    };
  }

  return {
    mode: isContributionNotificationMode(data.mode) ? data.mode : null,
    suppressionReasonRequired:
      typeof data.suppression_reason_required === "boolean"
        ? data.suppression_reason_required
        : null,
    taskAssignmentMode: isTaskAssignmentMode(data.task_assignment_mode)
      ? data.task_assignment_mode
      : null,
  };
}

export async function logContributionNotificationEvent(input: {
  supabaseAdmin: SupabaseAdmin;
  event: ContributionCorrectionNotificationEvent;
}): Promise<ContributionCorrectionNotificationLogResult> {
  const payload = {
    tenant_id: input.event.tenantId,
    idempotency_key: input.event.idempotencyKey,
    operation_audit_event_id: input.event.operationAuditEventId,
    correction_id: input.event.correctionId,
    action_type: input.event.actionType,
    template_id: input.event.templateId ?? null,
    template_version_id: input.event.templateVersionId ?? null,
    template_family: input.event.templateFamily ?? null,
    template_variant: input.event.templateVariant ?? null,
    template_version: input.event.templateVersion ?? null,
    decision: input.event.decision,
    policy_snapshot: input.event.policySnapshot ?? {},
    suppression_reason: input.event.suppressionReason ?? null,
    personal_note_present: input.event.personalNotePresent,
    recipient_donor_id: input.event.recipientDonorId,
    recipient_email: input.event.recipientEmail,
    provider_status: input.event.providerStatus ?? null,
    provider_message_id: input.event.providerMessageId ?? null,
    error_code: input.event.errorCode ?? null,
    error_message: input.event.errorMessage ?? null,
    task_ids: input.event.taskIds ?? [],
    sent_at: input.event.decision === "sent" ? new Date().toISOString() : null,
  };
  const { data, error } = await input.supabaseAdmin
    .from("contribution_notification_events")
    .insert(payload)
    .select("id, task_ids")
    .single();

  if (error) {
    if (isUniqueViolation(error)) {
      const existing = await input.supabaseAdmin
        .from("contribution_notification_events")
        .select("id, task_ids")
        .eq("tenant_id", input.event.tenantId)
        .eq("idempotency_key", input.event.idempotencyKey)
        .maybeSingle();

      if (existing.error || !isRecord(existing.data)) {
        throw new Error(
          existing.error?.message ??
            "Failed to load existing contribution notification event.",
        );
      }

      return {
        eventId: asString(existing.data.id) ?? "",
        taskIds: asStringArray(existing.data.task_ids),
      };
    }

    throw new Error(error.message);
  }

  return {
    eventId: asString((data as JsonRecord | null)?.id) ?? "",
    taskIds: asStringArray((data as JsonRecord | null)?.task_ids),
  };
}

async function findExistingNotificationTaskIds(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  notificationEventId: string | null;
}): Promise<string[]> {
  if (!input.notificationEventId) {
    return [];
  }

  const { data, error } = await input.supabaseAdmin
    .from("mission_control_task_links")
    .select("task_id")
    .eq("tenant_id", input.tenantId)
    .eq("record_type", "notification_event")
    .eq("record_id", input.notificationEventId)
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as JsonRecord[])
    .map((row) => asString(row.task_id))
    .filter((taskId): taskId is string => Boolean(taskId));
}

function buildNotificationTaskLinks(
  taskInput: ContributionCorrectionNotificationTaskInput,
): MissionControlLinkedRecord[] {
  const records: MissionControlLinkedRecord[] = [];

  if (taskInput.contributionId) {
    records.push({
      type: "contribution",
      id: taskInput.contributionId,
    });
  }

  if (taskInput.recipientDonorId) {
    records.push({
      type: "donor",
      id: taskInput.recipientDonorId,
    });
  }

  records.push({
    type: "audit_event",
    id: taskInput.operationAuditEventId,
  });

  if (taskInput.notificationEventId) {
    records.push({
      type: "notification_event",
      id: taskInput.notificationEventId,
    });
  }

  return records;
}

export async function sendContributionCorrectionNotificationFromSupabase(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  actionType: ContributionActionType;
  contributionId: string;
  correctionId: string | null;
  auditEventId: string;
  actorProfileId: string | null;
  providerOutcome?: ContributionProviderOutcome | null;
  detail: ContributionDetail;
  beforeSummary?: Record<string, unknown> | null;
  afterSummary?: Record<string, unknown> | null;
}) {
  const notificationSettings = await readContributionNotificationSettings({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    actionType: input.actionType,
  });
  const variant = resolveContributionCorrectionTemplateVariant({
    actionType: input.actionType,
    outcome: {
      status: input.providerOutcome?.status,
      refundKind: getRefundKind(input.detail),
    },
  });
  const binding = variant
    ? await readActiveTemplateBinding({
        supabaseAdmin: input.supabaseAdmin,
        tenantId: input.tenantId,
        family: variant.family,
        variant: variant.variant,
      })
    : null;
  const templateId = asString(binding?.template_id);
  const template = templateId
    ? await readEmailTemplate(input.tenantId, templateId)
    : null;
  const versions = templateId
    ? await listEmailTemplateVersions(input.tenantId, templateId)
    : [];
  const version = versions.find((row) => row.version === template?.version);
  const settings = await readTenantEmailSettings(input.tenantId);
  const encryptedApiKey = settings?.resend_api_key_encrypted ?? null;
  const defaultFromEmail = settings?.default_from_email ?? null;
  const defaultFromName = settings?.default_from_name ?? null;
  const sendingSettings =
    settings?.is_connected &&
    encryptedApiKey &&
    defaultFromEmail &&
    defaultFromName
      ? {
          apiKey: decryptResendApiKey(encryptedApiKey),
          fromEmail: defaultFromEmail,
          fromName: defaultFromName,
          replyToEmail: settings.reply_to_email,
          taskAssignmentMode:
            notificationSettings.taskAssignmentMode ?? undefined,
        }
      : null;
  const donor = input.detail.donor;

  return sendContributionCorrectionNotification({
    tenantId: input.tenantId,
    actionType: input.actionType,
    tenantModeOverride: notificationSettings.mode,
    suppressionReasonRequiredOverride:
      notificationSettings.suppressionReasonRequired,
    taskAssignmentMode: notificationSettings.taskAssignmentMode ?? undefined,
    contributionId: input.contributionId,
    correctionId: input.correctionId,
    operationAuditEventId: input.auditEventId,
    actorProfileId: input.actorProfileId,
    recipient: {
      donorId: donor?.id ?? null,
      email: donor?.email ?? "",
      name: donor?.name ?? "Donor",
    },
    mergeValues: buildContributionCorrectionNotificationMergeValues({
      detail: input.detail,
      beforeSummary: input.beforeSummary,
      afterSummary: input.afterSummary,
      orgName: defaultFromName,
      supportContactEmail: settings?.reply_to_email?.trim() || defaultFromEmail,
    }),
    template:
      template && version && variant
        ? {
            id: template.id,
            versionId: version.id,
            version: version.version,
            family: variant.family,
            variant: variant.variant,
            active: template.is_active,
            subject: template.default_subject ?? "Contribution update",
            html: template.html_content ?? "",
            text: template.text_content ?? "",
          }
        : null,
    settings: sendingSettings,
    dependencies: {
      logNotificationEvent: (event) =>
        logContributionNotificationEvent({
          supabaseAdmin: input.supabaseAdmin,
          event,
        }),
      recordNotificationTaskIds: async ({ notificationEventId, taskIds }) => {
        const { error } = await input.supabaseAdmin
          .from("contribution_notification_events")
          .update({ task_ids: taskIds })
          .eq("tenant_id", input.tenantId)
          .eq("id", notificationEventId);

        if (error) {
          throw new Error(error.message);
        }
      },
      createFollowUpTask: async (taskInput) => {
        const existingTaskIds = await findExistingNotificationTaskIds({
          supabaseAdmin: input.supabaseAdmin,
          tenantId: input.tenantId,
          notificationEventId: taskInput.notificationEventId,
        });

        if (existingTaskIds.length > 0) {
          return existingTaskIds;
        }

        const result = await createMissionControlTaskInSupabase({
          supabaseAdmin: input.supabaseAdmin,
          tenantId: input.tenantId,
          title: "Resolve blocked donor correction notification",
          description: taskInput.reason,
          issueType: "donor_notification_failed",
          actorProfileId: taskInput.actorProfileId,
          assignmentMode: taskInput.assignmentMode,
          linkedRecords: buildNotificationTaskLinks(taskInput),
        });

        return [result.taskId];
      },
    },
  });
}
