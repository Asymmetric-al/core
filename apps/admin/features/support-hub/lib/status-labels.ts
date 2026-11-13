import type {
  SupportAutomationActionKind,
  SupportAutomationConditionKind,
  SupportAutomationTrigger,
} from "../types/automation";
import type {
  SupportConversationStatus,
  SupportPriority,
  SupportInboxView,
  SupportInboxLayout,
} from "../types/conversation";
import type { SupportMacroAction } from "../types/macro";
import type { SupportSavedView } from "../types/saved-view";

/** A conversation's status as staff read it, in sentence case. */
export const CONVERSATION_STATUS_LABELS: Record<
  SupportConversationStatus,
  string
> = {
  open: "Open",
  pending: "Pending",
  snoozed: "Snoozed",
  resolved: "Resolved",
};

export const CONVERSATION_PRIORITY_LABELS = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
} satisfies Record<SupportPriority, string>;

export const AUTOMATION_TRIGGER_LABELS = {
  conversation_created: "Conversation created",
  message_received: "Message received",
  status_changed: "Status changed",
  label_added: "Label added",
  past_due_reached: "Past-due reached",
} satisfies Record<SupportAutomationTrigger, string>;
export const AUTOMATION_CONDITION_LABELS = {
  inbox_is: "Inbox is",
  label_includes: "Label includes",
  from_domain_equals: "From domain equals",
  assignee_is_present: "Assignee is present",
  is_overdue: "Is overdue",
  is_escalated: "Is escalated",
  subject_contains: "Subject contains",
  body_contains: "Body contains",
} satisfies Record<SupportAutomationConditionKind, string>;
export const AUTOMATION_ACTION_LABELS = {
  assign_agent: "Assign agent",
  assign_team: "Assign team",
  add_label: "Add label",
  set_priority: "Set priority",
  set_status: "Set status",
  snooze: "Snooze",
  mark_escalated: "Mark escalated",
  run_macro: "Run macro",
} satisfies Record<SupportAutomationActionKind, string>;
export const MACRO_ACTION_LABELS = {
  set_status: "Set status",
  set_priority: "Set priority",
  assign_agent: "Assign agent",
  assign_team: "Assign team",
  add_label: "Add label",
  remove_label: "Remove label",
  snooze: "Snooze",
  send_canned_response: "Insert canned response",
  add_private_note: "Add private note",
} satisfies Record<SupportMacroAction["kind"], string>;
export const INBOX_VIEW_LABELS = {
  all: "All",
  mine: "Mine",
  unassigned: "Unassigned",
  "past-due": "Past due",
  escalated: "Escalated",
} satisfies Record<SupportInboxView, string>;
export const INBOX_LAYOUT_LABELS = {
  board: "Board",
  table: "Table",
} satisfies Record<SupportInboxLayout, string>;
export const SAVED_VIEW_SCOPE_LABELS = {
  workspace: "Workspace",
  personal: "Personal",
} satisfies Record<SupportSavedView["scope"], string>;
