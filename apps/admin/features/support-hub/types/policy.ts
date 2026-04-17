export type {
  SupportBusinessHours,
  SupportSlaPolicy,
} from "@asym/database/hooks";

/* App-only — the automation rule shape is reserved for a later phase but the
 * contract is documented here so callers can plan field naming. */
export type SupportAutomationTrigger =
  | "conversation_created"
  | "message_received"
  | "conversation_updated";

export type SupportAutomationCondition =
  | { kind: "subject_contains"; value: string }
  | { kind: "from_domain_equals"; value: string }
  | { kind: "label_includes"; labelId: string }
  | { kind: "priority_is"; value: "urgent" | "high" | "normal" | "low" };

export type SupportAutomationAction =
  | { kind: "assign_team"; teamId: string }
  | { kind: "assign_agent"; agentId: string }
  | { kind: "add_label"; labelId: string }
  | { kind: "set_priority"; priority: "urgent" | "high" | "normal" | "low" };

export interface SupportAutomationRule {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  enabled: boolean;
  trigger: SupportAutomationTrigger;
  conditions: SupportAutomationCondition[];
  actions: SupportAutomationAction[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportBusinessHoursDay {
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  enabled: boolean;
  openTime: string;
  closeTime: string;
}

export interface SupportBusinessHoursHoliday {
  id: string;
  date: string;
  label: string;
}
