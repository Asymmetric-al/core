export type MissionControlTaskStatus =
  | "open"
  | "in_progress"
  | "completed"
  | "dismissed"
  | "suppressed";

export type MissionControlUrgency = "normal" | "high" | "critical";

export type MissionControlIssueType =
  | "receipt_failed"
  | "statement_failed"
  | "donor_notification_failed"
  | "crm_post_failed"
  | "provider_failed"
  | "failed_refund"
  | "pending_refund"
  | "correction_review"
  | "batch_completed_with_issues"
  | "missing_donor"
  | "missing_designation"
  | "staged_gift_review"
  | "recurring_gift_issue";

export type MissionControlTaskAssignmentMode =
  | "actor_only"
  | "queue_only"
  | "actor_and_queue";

export type MissionControlLinkedRecordType =
  | "donor"
  | "contribution"
  | "staged_gift"
  | "audit_event"
  | "notification_event"
  | "batch"
  | "provider_action";

export interface MissionControlLinkedRecord {
  type: MissionControlLinkedRecordType;
  id: string;
  relationship?: string;
  metadata?: Record<string, unknown>;
}

export interface MissionControlTaskAssignment {
  assigneeProfileId: string | null;
  queueId: string | null;
}

export interface MissionControlUrgencyThresholds {
  normalToHighHours?: number;
  highToCriticalHours?: number;
}
