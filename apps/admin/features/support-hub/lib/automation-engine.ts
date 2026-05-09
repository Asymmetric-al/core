import type {
  SupportAutomationAction,
  SupportAutomationCondition,
  SupportAutomationRule,
  SupportConversation,
  SupportMacroAction,
  SupportMessage,
} from "../types";

export interface AutomationEvaluationContext {
  conversation: SupportConversation;
  /**
   * Message that triggered the rule when applicable — required for
   * `body_contains` / `subject_contains` matching against incoming content,
   * optional for rules keyed off conversation-level state (`past_due_reached`,
   * `label_added`, etc.).
   */
  message?: SupportMessage | null;
  now?: Date | string;
}

export interface AutomationEvaluationResult {
  ruleId: string;
  matches: boolean;
  reasons: string[];
  /**
   * Actions translated into the existing `SupportMacroAction` shape so a
   * Phase 7 server-side router can pipe hits through `runSupportMacro`
   * without a parallel dispatcher. Returns `[]` when `matches` is `false`
   * or when every action is unsupported in the current action surface.
   */
  plannedActions: SupportMacroAction[];
  /**
   * Actions that could not be mapped onto `SupportMacroAction` (currently
   * `mark_escalated`). Surfaced separately so the dry-run preview can still
   * render the intent, and so Phase 7 can implement them independently.
   */
  unsupportedActions: SupportAutomationAction[];
}

/**
 * Pure automation rule evaluator. Given a rule + conversation (+ optional
 * message), returns whether the rule matches, a set of human-readable reasons
 * for each condition, and the planned macro-runner actions.
 *
 * No side effects. The dry-run preview and (eventually) the Phase 7 inbound
 * webhook router both reuse this function.
 */
export function evaluateSupportAutomationRule(
  rule: SupportAutomationRule,
  context: AutomationEvaluationContext,
): AutomationEvaluationResult {
  if (!rule.enabled) {
    return {
      ruleId: rule.id,
      matches: false,
      reasons: ["Rule is disabled."],
      plannedActions: [],
      unsupportedActions: [],
    };
  }

  const reasons: string[] = [];
  let matches = true;
  for (const condition of rule.conditions) {
    const result = evaluateCondition(condition, context);
    reasons.push(result.reason);
    if (!result.passed) matches = false;
  }

  if (!matches) {
    return {
      ruleId: rule.id,
      matches: false,
      reasons,
      plannedActions: [],
      unsupportedActions: [],
    };
  }

  const plannedActions: SupportMacroAction[] = [];
  const unsupportedActions: SupportAutomationAction[] = [];
  for (const action of rule.actions) {
    const mapped = mapActionToMacroAction(action);
    if (mapped) {
      plannedActions.push(mapped);
    } else {
      unsupportedActions.push(action);
    }
  }

  return {
    ruleId: rule.id,
    matches: true,
    reasons,
    plannedActions,
    unsupportedActions,
  };
}

interface ConditionEvaluation {
  passed: boolean;
  reason: string;
}

function evaluateCondition(
  condition: SupportAutomationCondition,
  { conversation, message }: AutomationEvaluationContext,
): ConditionEvaluation {
  switch (condition.kind) {
    case "inbox_is": {
      const passed = conversation.inboxId === condition.inboxId;
      return {
        passed,
        reason: `Inbox ${passed ? "matches" : "does not match"} ${condition.inboxId}.`,
      };
    }
    case "label_includes": {
      const passed = conversation.labels.some(
        (label) => label.id === condition.labelId,
      );
      return {
        passed,
        reason: passed
          ? `Conversation carries label ${condition.labelId}.`
          : `Conversation is missing label ${condition.labelId}.`,
      };
    }
    case "from_domain_equals": {
      const expected = condition.domain.toLowerCase();
      const email = conversation.externalContactEmail?.toLowerCase() ?? "";
      const domain = email.split("@")[1] ?? "";
      const passed = domain === expected;
      return {
        passed,
        reason: passed
          ? `Donor email domain matches ${expected}.`
          : `Donor email domain is ${domain || "<unknown>"}, not ${expected}.`,
      };
    }
    case "assignee_is_present": {
      const isPresent = conversation.assignee !== null;
      const passed = isPresent === condition.value;
      return {
        passed,
        reason: isPresent
          ? "Conversation has an assignee."
          : "Conversation is unassigned.",
      };
    }
    case "is_overdue": {
      const overdue = conversation.firstResponseDueAt
        ? new Date(conversation.firstResponseDueAt).getTime() < Date.now() &&
          conversation.firstRespondedAt === null
        : false;
      const passed = overdue === condition.value;
      return {
        passed,
        reason: overdue
          ? "Conversation is past first-response due date."
          : "Conversation is inside the first-response window.",
      };
    }
    case "is_escalated": {
      const escalated = conversation.escalatedAt !== null;
      const passed = escalated === condition.value;
      return {
        passed,
        reason: escalated
          ? "Conversation is escalated."
          : "Conversation is not escalated.",
      };
    }
    case "subject_contains": {
      const haystack = conversation.subject?.toLowerCase() ?? "";
      const needle = condition.value.toLowerCase();
      const passed = haystack.includes(needle);
      return {
        passed,
        reason: passed
          ? `Subject contains "${condition.value}".`
          : `Subject does not contain "${condition.value}".`,
      };
    }
    case "body_contains": {
      const haystack = message?.body?.text?.toLowerCase() ?? "";
      const needle = condition.value.toLowerCase();
      const passed = haystack.includes(needle);
      return {
        passed,
        reason: passed
          ? `Message body contains "${condition.value}".`
          : `Message body does not contain "${condition.value}".`,
      };
    }
    default: {
      const _exhaustive: never = condition;
      void _exhaustive;
      return { passed: false, reason: "Unknown condition." };
    }
  }
}

function mapActionToMacroAction(
  action: SupportAutomationAction,
): SupportMacroAction | null {
  switch (action.kind) {
    case "assign_agent":
      return { kind: "assign_agent", agentId: action.agentId };
    case "assign_team":
      return { kind: "assign_team", teamId: action.teamId };
    case "add_label":
      return { kind: "add_label", labelId: action.labelId };
    case "set_priority":
      return { kind: "set_priority", priority: action.priority };
    case "set_status":
      return { kind: "set_status", status: action.status };
    case "snooze":
      return { kind: "snooze", hours: action.hours };
    case "run_macro":
      // Macro chaining is deferred — Phase 7's runner will resolve the
      // referenced macro and flatten its actions. For now we surface the
      // intent as "unsupported" so the dry-run preview shows it explicitly.
      return null;
    case "mark_escalated":
      return null;
    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return null;
    }
  }
}
