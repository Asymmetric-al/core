export type {
  SupportBusinessHours,
  SupportSlaPolicy,
} from "@asym/database/hooks";

/**
 * Automation rule types moved to `./automation.ts` in Phase 6 and live on the
 * database collections (`supportAutomationRulesCollection`). The canonical
 * exports are re-surfaced here so legacy imports that still read the rule
 * shape via `types/policy` keep compiling.
 */
export type {
  SupportAutomationAction,
  SupportAutomationCondition,
  SupportAutomationRule,
  SupportAutomationTrigger,
} from "./automation";

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
