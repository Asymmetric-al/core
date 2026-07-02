import { sendEmail } from "@asym/email";

import { decryptResendApiKey } from "../../email/crypto";
import { readTenantEmailSettings } from "../../email/settings-store";

import type { PlannedApprovalNotification } from "./approval-notifications";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseAdmin = AdminSupabaseClient;

/**
 * Email delivery for approval workflow notifications (issue #262).
 *
 * The approval workflow records notification intent rows (deduped by key) and
 * this module delivers the email-channel rows synchronously through the same
 * tenant Resend settings correction notifications use. Delivery is
 * best-effort: a provider failure never fails the durable workflow (the
 * notification row, approval task, and in-app feed remain the record), and
 * the provider idempotency key reuses the row dedupe key so retried workflow
 * calls cannot double-send.
 */

export interface ApprovalEmailSendingSettings {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyToEmail: string | null;
}

export interface ApprovalEmailContext {
  requestId: string;
  donationId: string;
  actionType: string;
  decision?: "approved" | "rejected";
  decisionReason?: string | null;
}

export interface ApprovalEmailDeliveryResult {
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
}

export type ApprovalEmailSender = typeof sendEmail;

export interface ApprovalEmailDependencies {
  sendEmail?: ApprovalEmailSender;
  resolveSendingSettings?: (
    tenantId: string,
  ) => Promise<ApprovalEmailSendingSettings | null>;
}

/**
 * Tenant Resend settings gate email delivery: when the tenant email
 * integration is not connected, email-channel notifications stay recorded
 * in-app-side only and delivery is skipped, never failed.
 */
export async function resolveApprovalEmailSendingSettings(
  tenantId: string,
): Promise<ApprovalEmailSendingSettings | null> {
  const settings = await readTenantEmailSettings(tenantId);
  const encryptedApiKey = settings?.resend_api_key_encrypted ?? null;
  const fromEmail = settings?.default_from_email ?? null;
  const fromName = settings?.default_from_name ?? null;

  if (!settings?.is_connected || !encryptedApiKey || !fromEmail || !fromName) {
    return null;
  }

  return {
    apiKey: decryptResendApiKey(encryptedApiKey),
    fromEmail,
    fromName,
    replyToEmail: settings.reply_to_email ?? null,
  };
}

function humanizeActionType(actionType: string): string {
  return actionType.replace(/_/g, " ");
}

/**
 * Decision reasons are staff-authored free text; escape them (and everything
 * else) before HTML interpolation, matching the merge-tag renderer and
 * receipt HTML conventions.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Deliberately minimal product copy: enough for an approver or requester to
 * act from their inbox without leaking donor financial detail into email.
 */
export function buildApprovalEmailContent(
  kind: PlannedApprovalNotification["kind"],
  context: ApprovalEmailContext,
): { subject: string; text: string } {
  const action = humanizeActionType(context.actionType);

  if (kind === "outcome") {
    const decision = context.decision ?? "decided";
    const reasonLine = context.decisionReason?.trim()
      ? `\nDecision note: ${context.decisionReason.trim()}`
      : "";
    return {
      subject: `Your ${action} correction request was ${decision}`,
      text:
        `Your ${action} correction request for gift ${context.donationId} was ${decision}.${reasonLine}\n\n` +
        `Open Mission Control > Contributions and select the gift to review the outcome.`,
    };
  }

  const subjectByKind = {
    approval_requested: `Correction approval needed: ${action}`,
    reminder: `Reminder: ${action} correction approval pending`,
    escalation: `Escalation: ${action} correction approval overdue`,
  } as const;

  return {
    subject: subjectByKind[kind],
    text:
      `A ${action} correction request for gift ${context.donationId} is waiting for approval.\n\n` +
      `Open Mission Control > Contributions and select the gift to review and decide.`,
  };
}

type ProfileEmailRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
};

function profileDisplayName(row: ProfileEmailRow): string | undefined {
  const fullName = [row.first_name, row.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return row.display_name?.trim() || fullName || undefined;
}

/**
 * Sends the email-channel subset of planned approval notifications. Rows are
 * already deduped by the workflow, and the provider idempotency key reuses
 * the dedupe key, so calling this again for the same plan cannot double-send.
 */
export async function deliverApprovalEmailNotifications(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  notifications: PlannedApprovalNotification[];
  context: ApprovalEmailContext;
  dependencies?: ApprovalEmailDependencies;
}): Promise<ApprovalEmailDeliveryResult> {
  const emailNotifications = input.notifications.filter(
    (notification) => notification.channel === "email",
  );
  if (emailNotifications.length === 0) {
    return { attempted: 0, sent: 0, failed: 0, skipped: 0 };
  }

  // Everything below is best-effort: a missing tenant email integration or a
  // lookup failure skips email delivery without failing the durable approval
  // workflow — the notification rows, task, and in-app feed stay the record.
  let settings: ApprovalEmailSendingSettings | null = null;
  try {
    const resolveSettings =
      input.dependencies?.resolveSendingSettings ??
      resolveApprovalEmailSendingSettings;
    settings = await resolveSettings(input.tenantId);
  } catch {
    settings = null;
  }
  if (!settings) {
    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped: emailNotifications.length,
    };
  }

  const recipientIds = Array.from(
    new Set(
      emailNotifications.map((notification) => notification.recipientProfileId),
    ),
  );
  let profilesById: Map<string, ProfileEmailRow>;
  try {
    const { data, error } = await input.supabaseAdmin
      .from("profiles")
      .select("id, email, display_name, first_name, last_name")
      .eq("tenant_id", input.tenantId)
      .in("id", recipientIds);
    if (error) {
      throw new Error(error.message);
    }
    profilesById = new Map(
      ((data ?? []) as ProfileEmailRow[]).map((row) => [row.id, row]),
    );
  } catch {
    return {
      attempted: 0,
      sent: 0,
      failed: emailNotifications.length,
      skipped: 0,
    };
  }

  const sender = input.dependencies?.sendEmail ?? sendEmail;
  const result: ApprovalEmailDeliveryResult = {
    attempted: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  for (const notification of emailNotifications) {
    const profile = profilesById.get(notification.recipientProfileId);
    const recipientEmail = profile?.email?.trim();
    if (!profile || !recipientEmail) {
      result.skipped += 1;
      continue;
    }

    const content = buildApprovalEmailContent(notification.kind, input.context);
    result.attempted += 1;
    try {
      await sender(settings.apiKey, {
        to: { email: recipientEmail, name: profileDisplayName(profile) },
        from: { email: settings.fromEmail, name: settings.fromName },
        replyTo: settings.replyToEmail
          ? { email: settings.replyToEmail }
          : undefined,
        subject: content.subject,
        text: content.text,
        html: `<p>${escapeHtml(content.text).replace(/\n/g, "<br />")}</p>`,
        idempotencyKey: `approval-notification/${input.tenantId}/${notification.dedupeKey}`,
        customArgs: {
          source: "contribution_approval_notification",
          correctionRequestId: input.context.requestId,
          kind: notification.kind,
        },
      });
      result.sent += 1;
    } catch {
      // Best-effort channel: the durable notification row, approval task,
      // and in-app feed remain the record when the provider send fails.
      result.failed += 1;
    }
  }

  return result;
}
