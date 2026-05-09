export type {
  SupportCannedResponse,
  SupportMacro,
  SupportMacroAction,
} from "@asym/database/hooks";

import type { SupportMacroAction } from "@asym/database/hooks";

/** Action kinds enumerated as a const array for places that need a runtime list. */
export const SUPPORT_MACRO_ACTION_KINDS: SupportMacroAction["kind"][] = [
  "set_status",
  "set_priority",
  "assign_agent",
  "assign_team",
  "add_label",
  "remove_label",
  "send_canned_response",
  "snooze",
  "add_private_note",
];
