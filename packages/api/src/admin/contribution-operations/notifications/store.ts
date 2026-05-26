import { sendContributionCorrectionNotification } from "./send";
import { resolveContributionCorrectionTemplateVariant } from "./templates";
import { decryptResendApiKey } from "../../../email/crypto";
import { readTenantEmailSettings } from "../../../email/settings-store";
import {
  listEmailTemplateVersions,
  readEmailTemplate,
} from "../../../email/template-store";

import type { ContributionDetail } from "../detail-read-model";
import type {
  ContributionActionType,
  ContributionProviderOutcome,
} from "../types";
import type { ContributionCorrectionNotificationEvent } from "./send";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseAdmin = AdminSupabaseClient;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
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

function buildMergeValues(detail: ContributionDetail) {
  const currency = detail.amount.currency;
  return {
    full_name: detail.donor?.name ?? "Donor",
    email: detail.donor?.email ?? "",
    org_name: "Your ministry",
    gift_date: new Date(detail.gift.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    donation_amount: formatMoney(detail.amount.value, currency),
    original_amount: formatMoney(detail.amount.value, currency),
    corrected_amount: formatMoney(detail.amount.value, currency),
    refund_amount: formatMoney(detail.refund.amount, currency),
    previous_designation_name: detail.designation.fundName,
    corrected_designation_name: detail.designation.fundName,
    receipt_link: "/donor-dashboard/history",
    statement_link: "/donor-dashboard/history",
    payment_state: detail.donorVisible.status,
    donor_portal_link: "/donor-dashboard/history",
    support_contact_link: "mailto:finance@example.com",
    operation_reference: detail.id,
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

export async function logContributionNotificationEvent(input: {
  supabaseAdmin: SupabaseAdmin;
  event: ContributionCorrectionNotificationEvent;
}) {
  const { data, error } = await input.supabaseAdmin
    .from("contribution_notification_events")
    .insert({
      tenant_id: input.event.tenantId,
      operation_audit_event_id: input.event.operationAuditEventId,
      correction_id: input.event.correctionId,
      action_type: input.event.actionType,
      template_id: input.event.templateId ?? null,
      template_version_id: input.event.templateVersionId ?? null,
      template_family: input.event.templateFamily ?? null,
      template_variant: input.event.templateVariant ?? null,
      template_version: input.event.templateVersion ?? null,
      decision: input.event.decision,
      suppression_reason: input.event.suppressionReason ?? null,
      personal_note_present: input.event.personalNotePresent,
      recipient_donor_id: input.event.recipientDonorId,
      recipient_email: input.event.recipientEmail,
      provider_status: input.event.providerStatus ?? null,
      provider_message_id: input.event.providerMessageId ?? null,
      error_code: input.event.errorCode ?? null,
      error_message: input.event.errorMessage ?? null,
      task_ids: input.event.taskIds ?? [],
      sent_at:
        input.event.decision === "sent" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return asString((data as JsonRecord | null)?.id) ?? "";
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
}) {
  const variant = resolveContributionCorrectionTemplateVariant({
    actionType: input.actionType,
    outcome: {
      status: input.providerOutcome?.status,
      refundKind: getRefundKind(input.detail),
    },
  });
  const binding = await readActiveTemplateBinding({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    family: variant.family,
    variant: variant.variant,
  });
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
        }
      : null;
  const donor = input.detail.donor;

  return sendContributionCorrectionNotification({
    tenantId: input.tenantId,
    actionType: input.actionType,
    correctionId: input.correctionId,
    operationAuditEventId: input.auditEventId,
    actorProfileId: input.actorProfileId,
    recipient: {
      donorId: donor?.id ?? "unknown",
      email: donor?.email ?? "",
      name: donor?.name ?? "Donor",
    },
    mergeValues: buildMergeValues(input.detail),
    template:
      template && version
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
    },
  });
}
