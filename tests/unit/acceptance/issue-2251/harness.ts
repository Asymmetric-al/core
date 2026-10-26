/**
 * #2251 shared fixtures (spec r2 = issue comment 6392690952, approved by Samson
 * in 6392694469). Owned by Acceptance.
 */
import { existsSync, readFileSync } from "node:fs";

/**
 * Spec §5 In 1: the one migration this issue adds, by exact name. The version
 * is a reservation (§10); if Samson renumbers it, change only this line.
 */
export const MIGRATION =
  "supabase/migrations/20261025070000_force_rls_tenant_tables.sql";
/** #2250's migration; this slice must sort after it (§5 In 1, §12). */
export const TENANT_GUARD_MIGRATION =
  "supabase/migrations/20261024150000_tenant_guard.sql";
export const EXCEPTIONS = "docs/security/rls-deny-by-default-exceptions.json";
export const DOC = "docs/security/tenant-guard.md";
export const RULING = "Samson Q5 + clash 2, Oct 24, 2026";
/**
 * reviewed_by format (Samson, repin): a non-empty reviewer name, then ", " and
 * a real ISO date YYYY-MM-DD, e.g. "Samson (factory lead), 2026-10-24". Not
 * pinned to one reviewer or day, so later reviewed entries comply.
 */
export function reviewedByProblem(value: unknown): string | null {
  if (typeof value !== "string") return "not a string";
  const m = /^(\S(?:.*\S)?), (\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return `"${value}" is not "<reviewer>, YYYY-MM-DD"`;
  if (!/\p{L}/u.test(m[1]!)) return `"${value}" has no reviewer name`;
  const [y, mo, d] = [Number(m[2]), Number(m[3]), Number(m[4])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  if (
    t.getUTCFullYear() !== y ||
    t.getUTCMonth() !== mo - 1 ||
    t.getUTCDate() !== d
  )
    return `"${value}" has no real date`;
  return null;
}
/** §3: tables with RLS off before this slice (Down DISABLEs exactly these). */
export const RLS_OFF = [
  "donation_saga_outbox",
  "email_template_versions",
  "email_templates",
];
/** App DEFINER schemas checked by the precondition and criterion 4 (§2). */
export const DEFINER_SCHEMAS = [
  "public",
  "authz",
  "document_cutover",
  "private",
];

export const read = (f: string) =>
  existsSync(f) ? readFileSync(f, "utf8") : "";

/** SQL with comments removed (executable text only). */
export const code = (sql: string) =>
  sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");

/**
 * The migration as a statement batch that can run inside a caller's
 * transaction: top-level BEGIN;/COMMIT; lines (if any) are dropped.
 */
export function migrationBatch() {
  return read(MIGRATION).replace(/^\s*(BEGIN|COMMIT)\s*;\s*$/gim, "");
}

export type Entry = {
  table: string;
  outcome: string;
  reason: string;
  code_paths: string[];
  reviewed_by: string;
};
export function exceptions(): Entry[] {
  const raw = read(EXCEPTIONS);
  return raw ? (JSON.parse(raw) as { entries: Entry[] }).entries : [];
}

/** A code_paths item to a repo file: strips ":line" and " (+...)" notes, maps `api/`. */
export function codePathFile(p: string) {
  const f = p.split(/[\s:(]/)[0]!;
  return f.startsWith("api/") ? `packages/api/src/${f.slice(4)}` : f;
}

const words = (s: string) => s.split(/\s+/).filter(Boolean);

/**
 * §3, all 143 tables. S = service_role_needed with its §3 code-path files
 * (relative to packages/api/src/); D = deny_by_default; F = FORCE only
 * (56 + workflow_work_claims, F† after #2250, + donor_feed_preferences after
 * #2260, which gives it own-row policies: S 68 -> 67, F 57 -> 58).
 */
const S_PATHS: Record<string, string> = {
  contribution_adjustments:
    "admin/contribution-operations/operations.ts admin/contribution-shared/row-inputs.ts",
  contribution_approval_notification_preferences:
    "admin/contribution-operations/approval-notifications.ts",
  contribution_approval_notification_settings:
    "admin/contribution-operations/approval-notifications.ts",
  contribution_approval_notifications:
    "admin/contribution-operations/approval-notifications.ts",
  contribution_approval_policies:
    "admin/contribution-operations/correction-requests.ts",
  contribution_correction_requests:
    "admin/contribution-operations/correction-requests.ts admin/contribution-shared/row-inputs.ts",
  contribution_corrections:
    "admin/contribution-operations/operations.ts admin/contribution-shared/row-inputs.ts",
  contribution_notification_events:
    "admin/contribution-operations/notifications/store.ts",
  contribution_notification_settings:
    "admin/contribution-operations/notifications/store.ts",
  contribution_operation_audit_events:
    "admin/contribution-operations/operations.ts admin/contribution-operations/store.ts",
  contribution_operation_batch_items:
    "admin/contribution-batches/process-batch.ts admin/contribution-batches/route.ts",
  contribution_operation_batches:
    "admin/contribution-batches/process-batch.ts admin/contribution-batches/route.ts",
  contribution_receipt_delivery_policies:
    "admin/contribution-operations/operations.ts",
  contribution_receipt_snapshots:
    "admin/contribution-operations/operations.ts admin/contribution-operations/receipt-pdf.ts",
  contribution_refund_attempts: "admin/contribution-operations/store.ts",
  crm_table_named_views: "admin/crm/table-preferences/named-views.ts",
  crm_table_tenant_defaults: "admin/crm/table-preferences/service.ts",
  crm_table_user_preferences: "admin/crm/table-preferences/service.ts",
  donation_saga_outbox:
    "workflows/adapters/donations.ts workflows/summaries.ts",
  email_events: "email/webhooks/resend.ts",
  email_inbound_messages:
    "workflows/adapters/inbound-routing.ts workflows/summaries.ts",
  email_send_logs: "email/webhooks/resend.ts giving/receipts.ts",
  email_suppressions: "email/consent.ts email/webhooks/resend.ts",
  email_template_system_bindings:
    "admin/contribution-operations/notifications/store.ts",
  email_template_versions: "email/template-store.ts",
  email_templates: "email/template-store.ts",
  eve_action_approvals:
    "eve/approval-budget/control.ts eve/approval-budget/store.ts",
  eve_admin_memory_entries: "eve/admin-memory/store.ts",
  eve_admin_memory_history: "eve/admin-memory/store.ts",
  eve_admin_memory_settings: "eve/admin-memory/store.ts",
  eve_ai_settings_grants: "eve/model-policy/store.ts",
  eve_audit_events: "eve/audit/store.ts",
  eve_budget_emergency_overrides: "eve/approval-budget/store.ts",
  eve_budget_usage_windows: "eve/approval-budget/store.ts",
  eve_engineering_findings: "eve/engineering-monitors/store.ts",
  eve_engineering_monitor_configs: "eve/engineering-monitors/store.ts",
  eve_engineering_monitor_runs: "eve/engineering-monitors/store.ts",
  eve_launch_manifests: "eve/launch-readiness/store.ts",
  eve_launch_permission_grants: "eve/launch-readiness/store.ts",
  eve_launch_records: "eve/launch-readiness/store.ts",
  eve_launch_reviews: "eve/launch-readiness/store.ts",
  eve_model_policies: "eve/launch-readiness/store.ts eve/model-policy/store.ts",
  eve_notification_channel_configs: "eve/notifications/store.ts",
  eve_notification_recipient_configs: "eve/notifications/store.ts",
  eve_notification_records: "eve/notifications/store.ts",
  eve_policy_decisions: "eve/approval-budget/store.ts",
  eve_replay_artifacts: "eve/retention/control.ts eve/retention/store.ts",
  eve_retention_holds: "eve/retention/store.ts",
  eve_retention_lifecycle_events: "eve/retention/store.ts",
  eve_session_ownership: "eve/session-ownership/store.ts",
  eve_shared_context_claims: "eve/shared-context/store.ts",
  eve_shared_context_conflicts: "eve/shared-context/store.ts",
  eve_shared_context_resolutions: "eve/shared-context/store.ts",
  gift_receipt_records: "giving/receipt-record.ts",
  mission_control_attention_items: "admin/mission-control-tasks/store.ts",
  mission_control_automation_activity_logs:
    "admin/mission-control-automations/store.ts",
  mission_control_automation_rules:
    "admin/mission-control-automations/store.ts",
  mission_control_queues: "admin/mission-control-tasks/store.ts",
  mission_control_task_events: "admin/mission-control-tasks/store.ts",
  mission_control_task_links:
    "admin/contribution-operations/notifications/store.ts admin/mission-control-tasks/store.ts",
  mission_control_tasks:
    "admin/contribution-operations/approval-notifications.ts admin/mission-control-tasks/store.ts",
  support_bulk_move_operations: "admin/support-hub/move-service.ts",
  support_inbound_routes: "workflows/adapters/inbound-routing.ts",
  support_inbound_routing_reviews:
    "workflows/adapters/inbound-routing.ts workflows/summaries.ts",
  tenant_email_settings:
    "email/webhooks/resend.ts eve/notifications/delivery.ts",
  workflow_dispatch_requests: "workflows/summaries.ts",
  workflow_notification_policies:
    "admin/workflows/notification-policy.ts admin/workflows/summaries.ts",
};
export const S = Object.fromEntries(
  Object.entries(S_PATHS).map(([t, f]) => [t, words(f)]),
);
export const D = words(`
  backup_notification_queue_orphans_20260214
  contribution_operation_prompt_settings
  contribution_operation_user_preferences crm_table_preference_audit_events
  currency_rate_snapshots donor_merge_audit donor_merge_candidates
  donor_merge_redirects email_suppression_groups eve_notification_attempts
  eve_policy_permission_grants eve_policy_tracer_artifacts
  mission_control_automation_previews mission_control_automation_rule_versions
  mission_control_automation_test_runs mission_control_task_comments
  mission_control_task_reminders pledge_charge_attempts
`);
export const F = words(`
  assets audit_logs campaigns crm_command_logs crm_merge_candidates crm_notes
  crm_record_links donation_crm_links donations donor_feed_preferences
  donor_pledges donors
  field_policies follows funds giving_reconciliation_runs locations
  member_care_activities member_care_goals member_care_private_notes
  member_care_requirements missionaries notification_queue
  pdf_template_artifacts pdf_template_audit_events pdf_template_batch_jobs
  pdf_template_batches pdf_template_renders pdf_template_versions
  pdf_templates posts profiles staged_gift_allocations
  staged_gift_audit_events staged_gifts stripe_raw_events support_agents
  support_assignments support_audit_log support_automation_rules
  support_business_hours support_canned_responses support_contacts
  support_conversation_labels support_conversations support_inbox_settings
  support_inboxes support_labels support_macros support_message_attachments
  support_messages support_notification_preferences support_saved_views
  support_signatures support_sla_policies support_teams support_tickets
  workflow_work_claims
`);
