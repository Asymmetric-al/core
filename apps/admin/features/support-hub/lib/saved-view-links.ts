import { SUPPORT_INBOX_SEARCH_PARAM_KEYS } from "./route-state";
import { CONVERSATION_STATUS_LABELS } from "./status-labels";
import { DEFAULT_SUPPORT_INBOX_ROUTE_STATE } from "../types/route-state";

import type {
  SupportInboxLayout,
  SupportInboxView,
  SupportSavedViewFilter,
} from "../types";

const INBOX_PATH = "/support";

const VIEW_LABELS: Record<SupportInboxView, string> = {
  all: "All conversations",
  mine: "My conversations",
  unassigned: "Unassigned",
  "past-due": "Past due",
  escalated: "Escalated",
};

const LAYOUT_LABELS: Record<SupportInboxLayout, string> = {
  board: "Board layout",
  table: "Table layout",
};

/**
 * Inbox link that opens a saved view's filters. Uses the inbox's own search
 * param keys and leaves defaults out, as the inbox does when it writes its URL.
 */
export function savedViewHref(filter: SupportSavedViewFilter): string {
  const keys = SUPPORT_INBOX_SEARCH_PARAM_KEYS;
  const defaults = DEFAULT_SUPPORT_INBOX_ROUTE_STATE;
  const params = new URLSearchParams();
  if (filter.view !== defaults.view) params.set(keys.view, filter.view);
  if (filter.layout !== defaults.layout) params.set(keys.layout, filter.layout);
  if (filter.status !== defaults.status) params.set(keys.status, filter.status);
  if (filter.q) params.set(keys.q, filter.q);
  if (filter.labelSlugs.length > 0) {
    params.set(keys.label, filter.labelSlugs.join(","));
  }
  if (filter.assignee) params.set(keys.assignee, filter.assignee);
  const query = params.toString();
  return query ? `${INBOX_PATH}?${query}` : INBOX_PATH;
}

/**
 * Plain-language summary of a saved view's filters, such as
 * "My conversations · Open · 2 labels · Board layout".
 */
export function describeSavedViewFilter(
  filter: SupportSavedViewFilter,
  options: { agentName?: (agentId: string) => string | undefined } = {},
): string {
  const parts = [
    VIEW_LABELS[filter.view],
    filter.status === "all"
      ? "Any status"
      : CONVERSATION_STATUS_LABELS[filter.status],
  ];
  if (filter.assignee === "me") {
    parts.push("Assigned to me");
  } else if (filter.assignee === "unassigned") {
    parts.push("No assignee");
  } else if (filter.assignee) {
    const name = options.agentName?.(filter.assignee);
    parts.push(name ? `Assigned to ${name}` : "Assigned to an agent");
  }
  const labelCount = filter.labelSlugs.length;
  if (labelCount > 0) {
    parts.push(`${labelCount} ${labelCount === 1 ? "label" : "labels"}`);
  }
  const search = filter.q.trim();
  if (search) parts.push(`“${search}”`);
  parts.push(LAYOUT_LABELS[filter.layout]);
  return parts.join(" · ");
}
