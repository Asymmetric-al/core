import { supportHubAdapter } from "../adapter";

import type {
  SupportAssignee,
  SupportLabel,
  SupportMacro,
  SupportMacroAction,
} from "@asym/database/collections/support-hub.schema";

export interface RunMacroInput {
  conversationId: string;
  macroId: string;
  authorAgentId: string;
}

export interface RunMacroOutcome {
  index: number;
  action: SupportMacroAction;
  status: "ok" | "skipped" | "failed";
  message: string;
}

export interface RunMacroResult {
  macroId: string;
  conversationId: string;
  outcomes: RunMacroOutcome[];
  ok: boolean;
}

const HOUR_MS = 60 * 60 * 1000;

/**
 * Server-side macro runner. Mirrors the Phase 5 client-side runner
 * (`apps/admin/features/support-hub/lib/macro-runner.ts`) but talks to the
 * adapter directly instead of taking a React-side mutation bag. This is the
 * shape Phase 8 will reuse from the inbound webhook + automation runtime.
 */
export async function runSupportMacroOnServer(
  input: RunMacroInput,
): Promise<RunMacroResult> {
  const conversation = await supportHubAdapter.conversations.get(
    input.conversationId,
  );
  if (!conversation) {
    throw new Error("This conversation is no longer available.");
  }
  const macros = await supportHubAdapter.macros.list();
  const macro: SupportMacro | undefined = macros.find(
    (entry) => entry.id === input.macroId,
  );
  if (!macro) throw new Error("This macro is no longer available.");
  let agents: SupportAssignee[] | undefined;
  let labels: SupportLabel[] | undefined;

  const outcomes: RunMacroOutcome[] = [];
  for (const [index, action] of macro.actions.entries()) {
    let status: RunMacroOutcome["status"] = "ok";
    let message = "";
    try {
      switch (action.kind) {
        case "set_status":
          await supportHubAdapter.conversations.setStatus({
            conversationId: input.conversationId,
            status: action.status,
          });
          message = `Status set to ${action.status}.`;
          break;
        case "set_priority":
          await supportHubAdapter.conversations.setPriority({
            conversationId: input.conversationId,
            priority: action.priority,
          });
          message = `Priority set to ${action.priority}.`;
          break;
        case "assign_agent": {
          agents ??= await supportHubAdapter.agents.list();
          const agentName =
            agents.find((agent) => agent.id === action.agentId)?.name ??
            "the selected agent";
          await supportHubAdapter.conversations.assign({
            conversationId: input.conversationId,
            assigneeAgentId: action.agentId,
          });
          message = `Assigned to ${agentName}.`;
          break;
        }
        case "assign_team":
          status = "skipped";
          message = "Skipped: conversations can't be assigned to a team yet.";
          break;
        case "add_label":
        case "remove_label": {
          labels ??= await supportHubAdapter.labels.list();
          const labelName =
            labels.find((label) => label.id === action.labelId)?.name ??
            "the selected label";
          await supportHubAdapter.conversations.toggleLabel({
            conversationId: input.conversationId,
            labelId: action.labelId,
            mode: action.kind === "add_label" ? "add" : "remove",
          });
          message =
            action.kind === "add_label"
              ? `Added label ${labelName}.`
              : `Removed label ${labelName}.`;
          break;
        }
        case "snooze": {
          const snoozedUntil = new Date(
            Date.now() + action.hours * HOUR_MS,
          ).toISOString();
          await supportHubAdapter.conversations.snooze({
            conversationId: input.conversationId,
            snoozedUntil,
          });
          message = `Snoozed for ${action.hours}h.`;
          break;
        }
        case "send_canned_response":
          status = "skipped";
          message =
            "Skipped: insert the canned response in the reply composer.";
          break;
        case "add_private_note":
          await supportHubAdapter.messages.addPrivateNote({
            conversationId: input.conversationId,
            authorAgentId: input.authorAgentId,
            bodyText: action.bodyText,
          });
          message = "Internal note added.";
          break;
        default: {
          const _exhaustive: never = action;
          void _exhaustive;
          status = "skipped";
          message = "Unknown macro action.";
        }
      }
    } catch {
      status = "failed";
      message = "Could not complete this action. Try again.";
    }
    outcomes.push({ index, action, status, message });
  }

  return {
    macroId: macro.id,
    conversationId: input.conversationId,
    outcomes,
    ok: outcomes.every((outcome) => outcome.status !== "failed"),
  };
}
