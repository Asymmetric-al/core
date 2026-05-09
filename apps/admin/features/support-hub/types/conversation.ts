/**
 * Re-export the wire-format conversation types and enums from
 * `@asym/database` so the feature folder has one canonical type source.
 * App-only enrichments live in this file; new server-shape additions go in
 * `packages/database/collections/support-hub.ts`.
 */
export {
  SUPPORT_CHANNELS,
  SUPPORT_CONVERSATION_STATUSES,
  SUPPORT_INBOX_LAYOUTS,
  SUPPORT_INBOX_SECTIONS,
  SUPPORT_INBOX_VIEWS,
  SUPPORT_LAST_MESSAGE_DIRECTIONS,
  SUPPORT_PRIORITIES,
} from "@asym/database/hooks";

export type {
  SupportChannel,
  SupportConversation,
  SupportConversationStatus,
  SupportInboxLayout,
  SupportInboxSection,
  SupportInboxView,
  SupportLastMessageDirection,
  SupportPriority,
} from "@asym/database/hooks";
