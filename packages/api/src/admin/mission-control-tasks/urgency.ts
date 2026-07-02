import type {
  MissionControlIssueType,
  MissionControlUrgency,
  MissionControlUrgencyThresholds,
} from "./types";

const CRITICAL_ISSUES = new Set<MissionControlIssueType>([
  "failed_refund",
  "provider_failed",
  "receipt_failed",
  "statement_failed",
  "donor_notification_failed",
]);

const HIGH_ISSUES = new Set<MissionControlIssueType>([
  "crm_post_failed",
  "batch_completed_with_issues",
  "correction_review",
  "recurring_gift_issue",
  "missing_designation",
]);

function hoursBetween(start: string, end: Date): number {
  const startMs = new Date(start).getTime();
  if (!Number.isFinite(startMs)) {
    return 0;
  }

  return Math.max(0, (end.getTime() - startMs) / (1000 * 60 * 60));
}

export function getSuggestedAttentionUrgency(input: {
  issueType: MissionControlIssueType;
  firstSeenAt: string;
  now?: Date;
  thresholds?: MissionControlUrgencyThresholds;
}): MissionControlUrgency {
  const now = input.now ?? new Date();
  const ageHours = hoursBetween(input.firstSeenAt, now);
  const normalToHigh = input.thresholds?.normalToHighHours ?? 24;
  const highToCritical = input.thresholds?.highToCriticalHours ?? 48;

  if (CRITICAL_ISSUES.has(input.issueType)) {
    return "critical";
  }

  if (HIGH_ISSUES.has(input.issueType) || ageHours >= normalToHigh) {
    if (ageHours >= highToCritical) {
      return "critical";
    }
    return "high";
  }

  return "normal";
}

export function recordUrgencyOverride(input: {
  actorProfileId: string;
  previousUrgency: MissionControlUrgency;
  newUrgency: MissionControlUrgency;
  reason?: string | null;
  now?: Date;
}) {
  return {
    actorProfileId: input.actorProfileId,
    previousUrgency: input.previousUrgency,
    newUrgency: input.newUrgency,
    reason: input.reason ?? null,
    changedAt: (input.now ?? new Date()).toISOString(),
  };
}
