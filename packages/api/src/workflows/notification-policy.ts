import type { WorkflowSummaryState } from "./summaries";

export type WorkflowNotificationLevel = "urgent" | "visible";

export interface WorkflowNotificationDecision {
  level: WorkflowNotificationLevel;
  reason: string;
}

/**
 * Tenant/admin adjustable knobs. The default stays quiet: routine retryable
 * failures remain visible status, never urgent alerts.
 */
export interface WorkflowNotificationOverrides {
  /** Escalate retrying states for these product areas (default none). */
  urgentOnRetry?: string[];
  /** Demote failed states for these product areas to visible (default none). */
  muteFailed?: string[];
}

const MONEY_AREAS = new Set(["donations", "giving"]);

/**
 * Workflow Notification Policy Evaluator. Defaults prioritize donor trust,
 * money integrity, tenant-wide sync health, and stuck infrastructure:
 *
 * - dead-letter anywhere is urgent (stuck infrastructure / exhausted work)
 * - failed money workflows (donations, giving) are urgent (donor trust)
 * - everything else, including routine retryable failures, stays visible
 */
export function evaluateWorkflowNotification(
  input: {
    productArea: string;
    state: WorkflowSummaryState;
  },
  overrides: WorkflowNotificationOverrides = {},
): WorkflowNotificationDecision {
  if (input.state === "dead_letter") {
    return {
      level: "urgent",
      reason: "Automatic recovery is exhausted; staff review is required.",
    };
  }

  if (input.state === "action_required") {
    return {
      level: "urgent",
      reason: "Staff action is required (inbound routing review).",
    };
  }

  if (input.state === "failed") {
    if (overrides.muteFailed?.includes(input.productArea)) {
      return {
        level: "visible",
        reason:
          "Failure notifications are muted for this area by tenant policy.",
      };
    }
    if (MONEY_AREAS.has(input.productArea)) {
      return {
        level: "urgent",
        reason: "A payment-related workflow failed; donor trust is affected.",
      };
    }
    return {
      level: "visible",
      reason: "The workflow failed and is visible for staff follow-up.",
    };
  }

  if (input.state === "retrying") {
    if (overrides.urgentOnRetry?.includes(input.productArea)) {
      return {
        level: "urgent",
        reason: "Tenant policy escalates retries for this area.",
      };
    }
    return {
      level: "visible",
      reason: "Routine retryable failure; automatic recovery continues.",
    };
  }

  return { level: "visible", reason: "Normal workflow progress." };
}

export interface WorkflowNotificationCounts {
  urgent: number;
  visible: number;
}

/**
 * Counts already-evaluated decisions so callers evaluate the policy exactly
 * once per row and reuse the same decisions for both display and counting.
 */
export function countWorkflowNotifications(
  decisions: Array<Pick<WorkflowNotificationDecision, "level">>,
): WorkflowNotificationCounts {
  const counts: WorkflowNotificationCounts = { urgent: 0, visible: 0 };

  for (const decision of decisions) {
    if (decision.level === "urgent") counts.urgent += 1;
    else counts.visible += 1;
  }

  return counts;
}
