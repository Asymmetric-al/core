export type {
  SupportBusinessHours,
  SupportSlaPolicy,
} from "@asym/database/hooks";

/**
 * The automation rule types live in `./automation.ts`; this re-export keeps
 * them reachable through `types/policy`. Nothing imports that path directly
 * today (`types/index.ts` re-exports both files).
 */
export type {
  SupportAutomationAction,
  SupportAutomationCondition,
  SupportAutomationRule,
  SupportAutomationTrigger,
} from "./automation";
