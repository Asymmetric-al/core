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
  /** Only an agent actor is logged; without one nothing is written. */
  actor?: SupportParticipant | null;
  /** Accepted but not sent: the note carries only the text. */
  verb: SupportActivityVerb;
  /** Single-line, human-readable summary; becomes the private note's text. */
  body: string;
  /** Prefixes the note with "failed: " (e.g. a macro action could not run). */
  failed?: boolean;
}

interface SupportActivityResult {
  messageId: string;
}

/**
 * Posts an activity line as a private note through
 * `/api/admin/support/conversations/{id}/notes`. Without an agent actor it
 * writes nothing and returns an empty `messageId`.
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
