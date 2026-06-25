import type { MissionControlIssueType, MissionControlUrgency } from "./types";

type JsonRecord = Record<string, unknown>;

export interface NeedsAttentionRow {
  id: string;
  task_id: string | null;
  issue_type: string;
  urgency: string;
  status: string;
  summary: string;
  dedupe_key: string;
  first_seen_at: string;
  last_seen_at: string;
  details: JsonRecord | null;
}

export interface NeedsAttentionItem {
  id: string;
  taskId: string | null;
  issueType: string;
  issueLabel: string;
  urgency: MissionControlUrgency;
  status: string;
  summary: string;
  contributionId: string | null;
  donorId: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface NeedsAttentionGroup {
  key: string;
  title: string;
  urgency: MissionControlUrgency;
  count: number;
  items: NeedsAttentionItem[];
}

const URGENCY_ORDER: Record<MissionControlUrgency, number> = {
  critical: 0,
  high: 1,
  normal: 2,
};

const ISSUE_LABELS: Partial<Record<MissionControlIssueType, string>> = {
  receipt_failed: "Receipt",
  statement_failed: "Statement",
  donor_notification_failed: "Donor notification",
  crm_post_failed: "CRM post",
  provider_failed: "Provider",
  failed_refund: "Refund",
  pending_refund: "Pending refund",
  correction_review: "Correction review",
  batch_completed_with_issues: "Batch issue",
  missing_donor: "Missing donor",
  missing_designation: "Missing designation",
  staged_gift_review: "Staged gift review",
  recurring_gift_issue: "Recurring gift",
};

function normalizeUrgency(value: string): MissionControlUrgency {
  if (value === "critical" || value === "high" || value === "normal") {
    return value;
  }

  return "normal";
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function mapNeedsAttentionRow(
  row: NeedsAttentionRow,
): NeedsAttentionItem {
  const issueType = row.issue_type;
  const details = row.details ?? {};

  return {
    id: row.id,
    taskId: row.task_id,
    issueType,
    issueLabel: ISSUE_LABELS[issueType as MissionControlIssueType] ?? issueType,
    urgency: normalizeUrgency(row.urgency),
    status: row.status,
    summary: row.summary,
    contributionId: getString(details.contributionId),
    donorId: getString(details.donorId),
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
  };
}

export function buildNeedsAttentionGroups(
  items: NeedsAttentionItem[],
): NeedsAttentionGroup[] {
  const groupByKey = new Map<string, NeedsAttentionGroup>();

  for (const item of items) {
    const key = `${item.urgency}:${item.issueType}`;
    const existing = groupByKey.get(key);
    if (existing) {
      existing.items.push(item);
      existing.count += 1;
      continue;
    }

    groupByKey.set(key, {
      key,
      title: item.issueLabel,
      urgency: item.urgency,
      count: 1,
      items: [item],
    });
  }

  return [...groupByKey.values()].sort((left, right) => {
    const urgencyDelta =
      URGENCY_ORDER[left.urgency] - URGENCY_ORDER[right.urgency];
    if (urgencyDelta !== 0) {
      return urgencyDelta;
    }

    return left.title.localeCompare(right.title);
  });
}
