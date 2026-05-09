import { logSupportActivity, type SupportActivityVerb } from "./activity-log";
import {
  applyMergeVariables,
  buildMergeVariableContext,
} from "./merge-variables";
import {
  SUPPORT_SYSTEM_PARTICIPANT,
  toSupportParticipant,
} from "./participants";

import type {
  SupportAssignee,
  SupportCannedResponse,
  SupportConversation,
  SupportConversationStatus,
  SupportLabel,
  SupportMacro,
  SupportMacroAction,
  SupportPriority,
} from "../types";

/**
 * Strongly-typed bag of mutation entry points the runner uses. Each entry
 * matches the `mutateAsync` shape of the corresponding Phase 2 hook so the
 * runner stays decoupled from React Query.
 */
export interface MacroMutationBag {
  setStatus: (input: {
    conversationId: string;
    status: SupportConversationStatus;
  }) => Promise<unknown>;
  setPriority: (input: {
    conversationId: string;
    priority: SupportPriority;
  }) => Promise<unknown>;
  assign: (input: {
    conversationId: string;
    assigneeAgentId: string | null;
  }) => Promise<unknown>;
  toggleLabel: (input: {
    conversationId: string;
    labelId: string;
    mode: "add" | "remove" | "toggle";
  }) => Promise<unknown>;
  snooze: (input: {
    conversationId: string;
    snoozedUntil: string;
  }) => Promise<unknown>;
  addPrivateNote: (input: {
    conversationId: string;
    authorAgentId: string;
    bodyText: string;
    bodyHtml?: string;
  }) => Promise<unknown>;
}

export interface MacroLookup {
  /** Resolves a label id to its row so the activity log can name it. */
  findLabel: (id: string) => SupportLabel | null;
  /** Resolves a canned response id; the runner inserts the body via the caller. */
  findCannedResponse: (id: string) => SupportCannedResponse | null;
  /** Resolves an agent id (for assignment + activity attribution). */
  findAgent: (id: string) => SupportAssignee | null;
}

export interface RunMacroOptions {
  macro: SupportMacro;
  conversation: SupportConversation;
  /** Agent triggering the macro (used for activity attribution). */
  actorAgent: SupportAssignee | null;
  /** Whether the runner stops on the first failed action. Defaults to false. */
  stopOnError?: boolean;
  /**
   * Receives a rendered canned response body (plain text + html) when a
   * `send_canned_response` action runs. Wired by the composer so the agent
   * can review before the donor receives the reply. The runner does NOT send
   * the donor reply itself.
   */
  onCannedResponseInsert?: (input: {
    cannedResponse: SupportCannedResponse;
    text: string;
    html: string;
  }) => void;
  mutations: MacroMutationBag;
  lookup: MacroLookup;
}

export interface MacroActionOutcome {
  index: number;
  action: SupportMacroAction;
  status: "ok" | "skipped" | "failed";
  message: string;
}

export interface MacroRunResult {
  macroId: string;
  conversationId: string;
  outcomes: MacroActionOutcome[];
  ok: boolean;
}

const HOUR_MS = 60 * 60 * 1000;

export function macroNeedsComposerInsert(macro: SupportMacro): boolean {
  return macro.actions.some((action) => action.kind === "send_canned_response");
}

/**
 * Sequentially executes a `SupportMacro` against a single conversation.
 *
 * - Each action awaits its mutation; ordering is preserved.
 * - `send_canned_response` is special: the runner renders the canned body
 *   with merge variables and hands it to `onCannedResponseInsert`. It does
 *   NOT call `useSendSupportReply` on its own. Composer-driven send keeps
 *   donor communication agent-controlled.
 * - Every action writes a `type: "system"` activity row through
 *   `logSupportActivity` (success or failure) so the timeline is complete.
 * - `stopOnError` lets the caller decide whether to bail or keep running
 *   subsequent actions when a step throws.
 */
export async function runSupportMacro({
  macro,
  conversation,
  actorAgent,
  mutations,
  lookup,
  onCannedResponseInsert,
  stopOnError = false,
}: RunMacroOptions): Promise<MacroRunResult> {
  const outcomes: MacroActionOutcome[] = [];
  const actor = actorAgent
    ? toSupportParticipant(actorAgent)
    : SUPPORT_SYSTEM_PARTICIPANT;
  const conversationId = conversation.id;

  for (const [index, action] of macro.actions.entries()) {
    let status: MacroActionOutcome["status"] = "ok";
    let message = "";
    let verb: SupportActivityVerb = "macro_run";

    try {
      switch (action.kind) {
        case "set_status": {
          await mutations.setStatus({
            conversationId,
            status: action.status,
          });
          message = `${actor.name} ran "${macro.name}": status set to ${action.status}.`;
          verb = "set_status";
          break;
        }
        case "set_priority": {
          await mutations.setPriority({
            conversationId,
            priority: action.priority,
          });
          message = `${actor.name} ran "${macro.name}": priority set to ${action.priority}.`;
          verb = "set_priority";
          break;
        }
        case "assign_agent": {
          const assignee = lookup.findAgent(action.agentId);
          if (!assignee) {
            status = "skipped";
            message = `${actor.name} ran "${macro.name}": skipped assignment — unknown agent.`;
            break;
          }
          await mutations.assign({
            conversationId,
            assigneeAgentId: assignee.id,
          });
          message = `${actor.name} ran "${macro.name}": assigned to ${assignee.name}.`;
          verb = "assigned";
          break;
        }
        case "assign_team": {
          // Team assignment lands with the inbox-settings phase; today we
          // record the intent so agents can audit attempted runs.
          status = "skipped";
          message = `${actor.name} ran "${macro.name}": skipped team assignment — team routing lands in a later phase.`;
          break;
        }
        case "add_label":
        case "remove_label": {
          const label = lookup.findLabel(action.labelId);
          if (!label) {
            status = "skipped";
            message = `${actor.name} ran "${macro.name}": skipped label change — unknown label.`;
            break;
          }
          await mutations.toggleLabel({
            conversationId,
            labelId: label.id,
            mode: action.kind === "add_label" ? "add" : "remove",
          });
          verb = action.kind === "add_label" ? "label_added" : "label_removed";
          message = `${actor.name} ran "${macro.name}": ${
            action.kind === "add_label" ? "added" : "removed"
          } label ${label.name}.`;
          break;
        }
        case "snooze": {
          const snoozedUntil = new Date(
            Date.now() + action.hours * HOUR_MS,
          ).toISOString();
          await mutations.snooze({
            conversationId,
            snoozedUntil,
          });
          verb = "snoozed";
          message = `${actor.name} ran "${macro.name}": snoozed for ${action.hours}h.`;
          break;
        }
        case "send_canned_response": {
          const canned = lookup.findCannedResponse(action.cannedResponseId);
          if (!canned) {
            status = "skipped";
            message = `${actor.name} ran "${macro.name}": skipped canned response — unknown id.`;
            break;
          }
          const ctx = buildMergeVariableContext(conversation, actorAgent);
          const text = applyMergeVariables(canned.bodyText, ctx);
          const html = applyMergeVariables(
            canned.bodyHtml ?? canned.bodyText,
            ctx,
          );
          if (!onCannedResponseInsert) {
            status = "failed";
            message = `${actor.name} ran "${macro.name}": canned response requires an open composer.`;
            break;
          }
          onCannedResponseInsert({
            cannedResponse: canned,
            text,
            html,
          });
          message = `${actor.name} ran "${macro.name}": inserted canned response "${canned.title}".`;
          break;
        }
        case "add_private_note": {
          if (!actorAgent) {
            status = "skipped";
            message = `${actor.name} ran "${macro.name}": skipped private note — no agent attribution.`;
            break;
          }
          await mutations.addPrivateNote({
            conversationId,
            authorAgentId: actorAgent.id,
            bodyText: action.bodyText,
          });
          verb = "note_added";
          message = `${actor.name} ran "${macro.name}": added an internal note.`;
          break;
        }
        default: {
          const _exhaustive: never = action;
          void _exhaustive;
          status = "skipped";
          message = `${actor.name} ran "${macro.name}": unknown action kind, skipped.`;
        }
      }
    } catch (error) {
      status = "failed";
      message = `${actor.name} ran "${macro.name}": ${
        error instanceof Error ? error.message : "action failed."
      }`;
    }

    outcomes.push({ index, action, status, message });

    await logSupportActivity({
      conversation,
      actor,
      verb,
      body: message,
      failed: status === "failed",
    });

    if (status === "failed" && stopOnError) break;
  }

  return {
    macroId: macro.id,
    conversationId,
    outcomes,
    ok: outcomes.every((outcome) => outcome.status !== "failed"),
  };
}
