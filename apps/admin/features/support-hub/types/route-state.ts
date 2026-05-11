import type {
  SupportConversationStatus,
  SupportInboxLayout,
  SupportInboxSection,
  SupportInboxView,
} from "./conversation";

/**
 * URL-backed state for the Support Hub. Each property maps 1:1 to a search
 * param parsed by `lib/route-state.ts`. Saved views serialize into this exact
 * shape so a saved view can hydrate the URL without translation.
 */
export interface SupportInboxRouteState {
  view: SupportInboxView;
  layout: SupportInboxLayout;
  status: SupportConversationStatus | "all";
  q: string;
  /** Comma-separated label slugs in the URL; array in memory. */
  labelSlugs: string[];
  /** Agent id, "me", or "unassigned". */
  assignee: string;
  /** Currently focused conversation id (third pane / sheet). */
  selectedConversationId: string | null;
  /** Top-level section. Today only "inbox" renders; reserved for later. */
  section: SupportInboxSection;
}

export const DEFAULT_SUPPORT_INBOX_ROUTE_STATE: SupportInboxRouteState = {
  view: "all",
  layout: "board",
  status: "all",
  q: "",
  labelSlugs: [],
  assignee: "",
  selectedConversationId: null,
  section: "inbox",
};
