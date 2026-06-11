import { loadContributionCorrectionRequest } from "./correction-requests";
import { appendContributionOperationAuditEvent } from "./store";
import { createMissionControlTaskInSupabase } from "../mission-control-tasks";

import type { ContributionCorrectionRequest } from "./correction-requests";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseAdmin = AdminSupabaseClient;

type JsonRecord = Record<string, unknown>;

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

/**
 * Approval workflow notifications (ADR-CD-026 / ADR-CD-027 / ADR-CD-028).
 *
 * One correction request creates at most one durable approval task. In-app
 * notification is on by default; email is off unless both the tenant enables
 * it and the approver opted in. Preferences only affect delivery channels —
 * they can never grant approval capability or bypass ownership policy.
 * Time-based rules remind and optionally escalate; they never auto-approve.
 */

export interface ApprovalNotificationSettings {
  createApprovalTask: boolean;
  inAppEnabled: boolean;
  emailEnabled: boolean;
}

export interface ApprovalNotificationSettingsRow {
  create_approval_task?: boolean | null;
  in_app_enabled?: boolean | null;
  email_enabled?: boolean | null;
}

export function resolveApprovalNotificationSettings(
  row: ApprovalNotificationSettingsRow | null | undefined,
): ApprovalNotificationSettings {
  return {
    createApprovalTask: row?.create_approval_task ?? true,
    inAppEnabled: row?.in_app_enabled ?? true,
    emailEnabled: row?.email_enabled ?? false,
  };
}

export interface ApproverNotificationPreference {
  inAppEnabled: boolean;
  emailEnabled: boolean;
}

export function resolveApproverNotificationPreference(
  row:
    | { in_app_enabled?: boolean | null; email_enabled?: boolean | null }
    | null
    | undefined,
): ApproverNotificationPreference {
  return {
    inAppEnabled: row?.in_app_enabled ?? true,
    emailEnabled: row?.email_enabled ?? false,
  };
}

export interface PlannedApprovalNotification {
  recipientProfileId: string;
  channel: "in_app" | "email";
  kind: "approval_requested" | "reminder" | "escalation" | "outcome";
  dedupeKey: string;
}

/**
 * Plans approval-request delivery for eligible approvers only. Preference
 * rows for anyone outside `eligibleApprovers` are ignored by construction,
 * so notification preferences cannot widen who may approve.
 */
export function planApprovalNotifications(input: {
  requestId: string;
  settings: ApprovalNotificationSettings;
  eligibleApprovers: Array<{
    profileId: string;
    preference: ApproverNotificationPreference;
  }>;
  existingTaskId: string | null;
  kind?: "approval_requested" | "reminder" | "escalation";
  dedupeSuffix?: string;
}): {
  createTask: boolean;
  notifications: PlannedApprovalNotification[];
} {
  const kind = input.kind ?? "approval_requested";
  const suffix = input.dedupeSuffix ? `/${input.dedupeSuffix}` : "";
  const notifications: PlannedApprovalNotification[] = [];

  for (const approver of input.eligibleApprovers) {
    if (input.settings.inAppEnabled && approver.preference.inAppEnabled) {
      notifications.push({
        recipientProfileId: approver.profileId,
        channel: "in_app",
        kind,
        dedupeKey: `correction-request/${input.requestId}/${kind}/in_app/${approver.profileId}${suffix}`,
      });
    }
    if (input.settings.emailEnabled && approver.preference.emailEnabled) {
      notifications.push({
        recipientProfileId: approver.profileId,
        channel: "email",
        kind,
        dedupeKey: `correction-request/${input.requestId}/${kind}/email/${approver.profileId}${suffix}`,
      });
    }
  }

  return {
    createTask:
      kind === "approval_requested" &&
      input.settings.createApprovalTask &&
      !input.existingTaskId,
    notifications,
  };
}

export interface PendingApprovalSlaState {
  reminderDue: boolean;
  escalationDue: boolean;
  pendingTooLong: boolean;
}

/**
 * Derives reminder/escalation/pending-too-long state from timestamps and
 * tenant policy (ADR-CD-028). Pure derivation — never auto-approves and
 * stays quiet between intervals so repeated runs cannot spam approvers.
 */
export function evaluatePendingApprovalSla(input: {
  status: string;
  createdAt: string;
  lastReminderAt: string | null;
  escalatedAt: string | null;
  reminderHours: number;
  escalationHours: number | null;
  now: string;
}): PendingApprovalSlaState {
  if (input.status !== "pending") {
    return { reminderDue: false, escalationDue: false, pendingTooLong: false };
  }

  const hourMs = 60 * 60 * 1000;
  const now = new Date(input.now).getTime();
  const createdAt = new Date(input.createdAt).getTime();
  const ageHours = (now - createdAt) / hourMs;

  const pendingTooLong = ageHours >= input.reminderHours;

  const lastReminderAt = input.lastReminderAt
    ? new Date(input.lastReminderAt).getTime()
    : null;
  const hoursSinceReminder =
    lastReminderAt === null ? null : (now - lastReminderAt) / hourMs;
  const reminderDue =
    pendingTooLong &&
    (hoursSinceReminder === null || hoursSinceReminder >= input.reminderHours);

  const escalationDue =
    input.escalationHours !== null &&
    ageHours >= input.escalationHours &&
    input.escalatedAt === null;

  return { reminderDue, escalationDue, pendingTooLong };
}

async function loadApprovalNotificationSettings(
  supabaseAdmin: SupabaseAdmin,
  tenantId: string,
): Promise<ApprovalNotificationSettings> {
  const { data, error } = await supabaseAdmin
    .from("contribution_approval_notification_settings")
    .select("create_approval_task, in_app_enabled, email_enabled")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return resolveApprovalNotificationSettings(
    (data as ApprovalNotificationSettingsRow | null) ?? null,
  );
}

async function listEligibleApprovers(
  supabaseAdmin: SupabaseAdmin,
  tenantId: string,
): Promise<
  Array<{ profileId: string; preference: ApproverNotificationPreference }>
> {
  const [approversResult, preferencesResult] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("tenant_id", tenantId)
      .in("role", ["admin", "super_admin"]),
    supabaseAdmin
      .from("contribution_approval_notification_preferences")
      .select("profile_id, in_app_enabled, email_enabled")
      .eq("tenant_id", tenantId),
  ]);

  if (approversResult.error) {
    throw new Error(approversResult.error.message);
  }
  if (preferencesResult.error) {
    throw new Error(preferencesResult.error.message);
  }

  const preferencesByProfile = new Map<string, ApproverNotificationPreference>(
    ((preferencesResult.data ?? []) as JsonRecord[]).map((row) => [
      asString(row.profile_id) ?? "",
      resolveApproverNotificationPreference(
        row as { in_app_enabled?: boolean; email_enabled?: boolean },
      ),
    ]),
  );

  return ((approversResult.data ?? []) as JsonRecord[])
    .map((row) => asString(row.id))
    .filter((id): id is string => Boolean(id))
    .map((profileId) => ({
      profileId,
      preference:
        preferencesByProfile.get(profileId) ??
        resolveApproverNotificationPreference(null),
    }));
}

async function insertApprovalNotifications(
  supabaseAdmin: SupabaseAdmin,
  tenantId: string,
  requestId: string,
  notifications: PlannedApprovalNotification[],
  payload: Record<string, unknown>,
): Promise<number> {
  if (notifications.length === 0) {
    return 0;
  }

  const { data, error } = await supabaseAdmin
    .from("contribution_approval_notifications")
    .upsert(
      notifications.map((notification) => ({
        tenant_id: tenantId,
        correction_request_id: requestId,
        recipient_profile_id: notification.recipientProfileId,
        channel: notification.channel,
        kind: notification.kind,
        dedupe_key: notification.dedupeKey,
        payload,
      })),
      { onConflict: "tenant_id,dedupe_key", ignoreDuplicates: true },
    )
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  return Array.isArray(data) ? data.length : 0;
}

/**
 * Ensures the durable approval task and approver notifications exist for a
 * pending correction request. Safe to call repeatedly: the task is keyed by
 * `approval_task_id` on the request and notifications dedupe by key.
 */
export async function ensureCorrectionApprovalWorkflow(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  requestId: string;
}): Promise<{ approvalTaskId: string | null; notificationsCreated: number }> {
  const request = await loadContributionCorrectionRequest(input);
  if (request.status !== "pending") {
    return {
      approvalTaskId: request.approvalTaskId,
      notificationsCreated: 0,
    };
  }

  const settings = await loadApprovalNotificationSettings(
    input.supabaseAdmin,
    input.tenantId,
  );
  const eligibleApprovers = await listEligibleApprovers(
    input.supabaseAdmin,
    input.tenantId,
  );

  const plan = planApprovalNotifications({
    requestId: request.id,
    settings,
    eligibleApprovers,
    existingTaskId: request.approvalTaskId,
  });

  let approvalTaskId = request.approvalTaskId;
  if (plan.createTask) {
    const createdTask = await createMissionControlTaskInSupabase({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      title: `Approve correction: ${request.actionType.replace(/_/g, " ")}`,
      description: request.reason,
      issueType: "correction_review",
      actorProfileId: null,
      assignmentMode: "queue_only",
      linkedRecords: [{ type: "contribution", id: request.donationId }],
    });
    approvalTaskId = createdTask.taskId;

    const { error } = await input.supabaseAdmin
      .from("contribution_correction_requests")
      .update({
        approval_task_id: approvalTaskId,
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_id", input.tenantId)
      .eq("id", request.id)
      .is("approval_task_id", null);
    if (error) {
      throw new Error(error.message);
    }
  }

  const notificationsCreated = await insertApprovalNotifications(
    input.supabaseAdmin,
    input.tenantId,
    request.id,
    plan.notifications,
    {
      donationId: request.donationId,
      actionType: request.actionType,
    },
  );

  await appendContributionOperationAuditEvent({
    supabaseAdmin: input.supabaseAdmin,
    event: {
      tenantId: input.tenantId,
      actorProfileId: null,
      contributionId: request.donationId,
      actionType: request.actionType,
      sourceSurface: request.sourceSurface,
      reason: null,
      downstreamEffects: {
        correctionRequestId: request.id,
        approvalTaskId,
        approverNotifications: notificationsCreated,
      },
    },
  });

  return { approvalTaskId, notificationsCreated };
}

/**
 * Closes the approval task and notifies the requester after a decision
 * (ADR-CD-027). Idempotent: outcome notifications dedupe by request and the
 * task completion update is a no-op when already completed.
 */
export async function recordCorrectionApprovalOutcome(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  request: ContributionCorrectionRequest;
  decision: "approved" | "rejected";
  decisionReason: string | null;
}): Promise<void> {
  if (input.request.approvalTaskId) {
    const { error } = await input.supabaseAdmin
      .from("mission_control_tasks")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_id", input.tenantId)
      .eq("id", input.request.approvalTaskId);
    if (error) {
      throw new Error(error.message);
    }
  }

  if (input.request.requestedByProfileId) {
    await insertApprovalNotifications(
      input.supabaseAdmin,
      input.tenantId,
      input.request.id,
      [
        {
          recipientProfileId: input.request.requestedByProfileId,
          channel: "in_app",
          kind: "outcome",
          dedupeKey: `correction-request/${input.request.id}/outcome/${input.decision}/requester`,
        },
      ],
      {
        decision: input.decision,
        decisionReason: input.decisionReason,
        donationId: input.request.donationId,
      },
    );
  }
}

/**
 * Scans pending correction requests and applies tenant SLA timing: reminder
 * notifications to eligible approvers, then optional one-time escalation.
 * Never approves or applies anything (ADR-CD-028).
 */
export async function processCorrectionApprovalSla(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  policy: { reminderHours: number; escalationHours: number | null };
  now?: string;
}): Promise<{ remindersSent: number; escalationsSent: number }> {
  const now = input.now ?? new Date().toISOString();
  const { data, error } = await input.supabaseAdmin
    .from("contribution_correction_requests")
    .select(
      "id, donation_id, action_type, source_surface, status, created_at, last_reminder_at, escalated_at",
    )
    .eq("tenant_id", input.tenantId)
    .eq("status", "pending");

  if (error) {
    throw new Error(error.message);
  }

  const settings = await loadApprovalNotificationSettings(
    input.supabaseAdmin,
    input.tenantId,
  );
  const eligibleApprovers = await listEligibleApprovers(
    input.supabaseAdmin,
    input.tenantId,
  );

  let remindersSent = 0;
  let escalationsSent = 0;

  for (const row of (data ?? []) as JsonRecord[]) {
    const requestId = asString(row.id) ?? "";
    const createdAt = asString(row.created_at) ?? now;
    const sla = evaluatePendingApprovalSla({
      status: asString(row.status) ?? "pending",
      createdAt,
      lastReminderAt: asString(row.last_reminder_at),
      escalatedAt: asString(row.escalated_at),
      reminderHours: input.policy.reminderHours,
      escalationHours: input.policy.escalationHours,
      now,
    });

    if (sla.reminderDue) {
      const reminderRound = Math.floor(
        (new Date(now).getTime() - new Date(createdAt).getTime()) /
          (input.policy.reminderHours * 60 * 60 * 1000),
      );
      const plan = planApprovalNotifications({
        requestId,
        settings,
        eligibleApprovers,
        existingTaskId: "task-exists",
        kind: "reminder",
        dedupeSuffix: `round-${reminderRound}`,
      });
      remindersSent += await insertApprovalNotifications(
        input.supabaseAdmin,
        input.tenantId,
        requestId,
        plan.notifications,
        { reminderRound },
      );

      const { error: reminderError } = await input.supabaseAdmin
        .from("contribution_correction_requests")
        .update({ last_reminder_at: now, updated_at: now })
        .eq("tenant_id", input.tenantId)
        .eq("id", requestId);
      if (reminderError) {
        throw new Error(reminderError.message);
      }
    }

    if (sla.escalationDue) {
      const plan = planApprovalNotifications({
        requestId,
        settings,
        eligibleApprovers,
        existingTaskId: "task-exists",
        kind: "escalation",
      });
      escalationsSent += await insertApprovalNotifications(
        input.supabaseAdmin,
        input.tenantId,
        requestId,
        plan.notifications,
        { escalatedAt: now },
      );

      const { error: escalationError } = await input.supabaseAdmin
        .from("contribution_correction_requests")
        .update({ escalated_at: now, updated_at: now })
        .eq("tenant_id", input.tenantId)
        .eq("id", requestId);
      if (escalationError) {
        throw new Error(escalationError.message);
      }
    }
  }

  return { remindersSent, escalationsSent };
}
