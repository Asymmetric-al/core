import type { SupportMacroAction } from "../types";
// Keep this in sync with saveMacroSchema in packages/api/src/admin/support-hub/schemas.ts.
export function macroActionIssue(action: SupportMacroAction): string | null {
  switch (action.kind) {
    case "assign_agent":
      return action.agentId.trim() ? null : "Choose an agent.";
    case "assign_team":
      return action.teamId.trim() ? null : "Choose a team.";
    case "add_label":
    case "remove_label":
      return action.labelId.trim() ? null : "Choose a label.";
    case "send_canned_response":
      return action.cannedResponseId.trim()
        ? null
        : "Choose a canned response.";
    case "snooze":
      return Number.isInteger(action.hours) && action.hours > 0
        ? null
        : "Enter a whole number of hours greater than zero.";
    case "add_private_note":
      return action.bodyText.trim() ? null : "Enter a note.";
    default:
      return null;
  }
}
