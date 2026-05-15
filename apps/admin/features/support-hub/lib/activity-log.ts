import { supportApiJson } from "./api-client";

import type { SupportConversation, SupportParticipant } from "../types";

export type SupportActivityVerb =
  | "assigned"
  | "unassigned"
  | "set_status"
  | "set_priority"
  | "snoozed"
  | "unsnoozed"
  | "label_added"
  | "label_removed"
  | "macro_run"
  | "mention"
  | "note_added"
  | "round_robin";

export interface SupportActivityInput {
  conversation: SupportConversation;
  /** When omitted, the activity row is attributed to "Mission Control". */
  actor?: SupportParticipant | null;
  verb: SupportActivityVerb;
  /** Single-line, human-readable summary rendered by `<ActivityEntry />`. */
  body: string;
  /** When set, the row is marked as a failure (e.g. macro action could not run). */
  failed?: boolean;
}

interface SupportActivityResult {
  messageId: string;
}

/**
 * Persists an internal activity note through the Support Hub route layer.
 * Phase 8 routes all client writes through `/api/admin/support/*`; callers
 * that do not have an agent actor skip logging instead of writing local state.
 */
export async function logSupportActivity({
  conversation,
  actor,
  verb,
  body,
  failed = false,
}: SupportActivityInput): Promise<SupportActivityResult> {
  if (!actor || actor.role !== "agent") {
    return { messageId: "" };
  }
  const text = failed ? `failed: ${body}` : body;
  const response = await supportApiJson<{
    message: { id: string };
  }>(`/api/admin/support/conversations/${conversation.id}/notes`, "POST", {
    conversationId: conversation.id,
    authorAgentId: actor.id,
    bodyText: text,
    bodyHtml: `<p>${escapeHtml(text)}</p>`,
  });
  void verb;
  return { messageId: response.message.id };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
