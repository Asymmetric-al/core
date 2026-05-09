import { SUPPORT_SYSTEM_PARTICIPANT } from "./participants";
import { supportStore } from "../stores/support-store";

import type {
  SupportConversation,
  SupportMessage,
  SupportParticipant,
} from "../types";

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

const ID_RANDOM_BYTES = 16;

/**
 * Writes a `type: "system"` row into the support_messages collection so the
 * Phase 4 timeline (`<ActivityEntry />`) can render it. Used by every
 * Phase 5 mutation hook + the macro runner so the timeline is the single
 * source of truth for "who did what when".
 *
 * Optimistic by design: the underlying collection writer settles in-memory
 * synchronously, so the activity row is immediately visible in the timeline
 * the next time `useSupportMessages` re-evaluates.
 */
export async function logSupportActivity({
  conversation,
  actor,
  verb,
  body,
  failed = false,
}: SupportActivityInput): Promise<SupportActivityResult> {
  const stamp = new Date().toISOString();
  const messageId = generateId("msg-system");
  const author: SupportParticipant = actor ?? SUPPORT_SYSTEM_PARTICIPANT;

  const message: SupportMessage = {
    id: messageId,
    tenantId: conversation.tenantId,
    conversationId: conversation.id,
    type: "system",
    direction: "outbound",
    isPrivate: false,
    deliveryState: "delivered",
    author,
    body: {
      json: null,
      html: `<p>${escapeHtml(body)}</p>`,
      text: failed ? `failed: ${body}` : body,
    },
    attachments: [],
    emailHeaders: null,
    outboundSendLogId: null,
    inboundEmailId: null,
    postedAt: stamp,
    createdAt: stamp,
    updatedAt: stamp,
  };
  void verb;

  const tx = supportStore.collections.messages.insert(message);
  await tx.isPersisted.promise;

  return { messageId };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  const random = Math.random()
    .toString(36)
    .slice(2, 2 + ID_RANDOM_BYTES);
  return `${prefix}-${random}-${Date.now().toString(36)}`;
}
