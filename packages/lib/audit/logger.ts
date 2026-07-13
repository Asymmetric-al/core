import { createAdminClient } from "@asym/database/supabase/admin";

import type { AuthenticatedContext } from "@asym/auth/context";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "role_change"
  | "donation_created"
  | "donation_completed"
  | "donation_failed"
  | "donation_refunded"
  | "donation_initiated"
  | "crm_export_created"
  | "post_created"
  | "post_updated"
  | "post_deleted"
  | "post_draft_created"
  | "post_approved"
  | "post_hidden"
  | "post_flagged"
  | "post_restored"
  | "post_pinned"
  | "post_unpinned"
  | "post_deleted_by_admin"
  | "org_post_created"
  | "comment_moderated"
  | "comment_deleted_by_admin"
  | "profile_updated"
  | "email_send_suppressed";

export interface AuditLogEntry {
  tenantId: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * System/service audit event with no human actor. `audit_logs.user_id` is
 * nullable, so transactional and system-triggered actions (e.g. an outbound
 * email suppressed by the consent gate) can be recorded without an
 * AuthenticatedContext.
 */
export interface SystemAuditLogEntry {
  tenantId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditLogRow {
  tenant_id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
}

async function writeAuditLog(row: AuditLogRow): Promise<void> {
  const supabaseAdmin = createAdminClient();
  if (!supabaseAdmin) {
    console.warn("[audit] Skipping audit log: Admin client unavailable");
    return;
  }

  try {
    await supabaseAdmin.from("audit_logs").insert(row);
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  await writeAuditLog({
    tenant_id: entry.tenantId,
    user_id: entry.userId,
    action: entry.action,
    resource_type: entry.resourceType,
    resource_id: entry.resourceId || null,
    details: entry.details || {},
    ip_address: entry.ipAddress || null,
    user_agent: entry.userAgent || null,
  });
}

/** Record an audit event for a system/service action (no human actor). */
export async function logSystemAuditEvent(
  entry: SystemAuditLogEntry,
): Promise<void> {
  await writeAuditLog({
    tenant_id: entry.tenantId,
    user_id: null,
    action: entry.action,
    resource_type: entry.resourceType,
    resource_id: entry.resourceId || null,
    details: entry.details || {},
    ip_address: entry.ipAddress || null,
    user_agent: entry.userAgent || null,
  });
}

export function createAuditLogger(
  context: AuthenticatedContext,
  request?: Request,
) {
  const ipAddress =
    request?.headers.get("x-forwarded-for") ||
    request?.headers.get("x-real-ip") ||
    undefined;
  const userAgent = request?.headers.get("user-agent") || undefined;

  return {
    log: (
      action: AuditAction,
      resourceType: string,
      resourceId?: string,
      details?: Record<string, unknown>,
    ) =>
      logAuditEvent({
        tenantId: context.tenantId,
        userId: context.userId,
        action,
        resourceType,
        resourceId,
        details,
        ipAddress,
        userAgent,
      }),

    logDonation: (
      donationId: string,
      action:
        | "donation_created"
        | "donation_completed"
        | "donation_failed"
        | "donation_refunded"
        | "donation_initiated",
      details?: Record<string, unknown>,
    ) =>
      logAuditEvent({
        tenantId: context.tenantId,
        userId: context.userId,
        action,
        resourceType: "donation",
        resourceId: donationId,
        details,
        ipAddress,
        userAgent,
      }),

    logPost: (
      postId: string,
      action:
        | "post_created"
        | "post_updated"
        | "post_deleted"
        | "post_draft_created"
        | "post_approved"
        | "post_hidden"
        | "post_flagged"
        | "post_restored"
        | "post_pinned"
        | "post_unpinned"
        | "post_deleted_by_admin"
        | "org_post_created",
      details?: Record<string, unknown>,
    ) =>
      logAuditEvent({
        tenantId: context.tenantId,
        userId: context.userId,
        action,
        resourceType: "post",
        resourceId: postId,
        details,
        ipAddress,
        userAgent,
      }),

    logRoleChange: (targetUserId: string, oldRole: string, newRole: string) =>
      logAuditEvent({
        tenantId: context.tenantId,
        userId: context.userId,
        action: "role_change",
        resourceType: "profile",
        resourceId: targetUserId,
        details: { oldRole, newRole },
        ipAddress,
        userAgent,
      }),
  };
}
