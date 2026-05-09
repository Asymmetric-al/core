"use client";

import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";
import * as React from "react";

import {
  SUPPORT_CONVERSATION_STATUSES,
  SUPPORT_INBOX_LAYOUTS,
  SUPPORT_INBOX_SECTIONS,
  SUPPORT_INBOX_VIEWS,
} from "../types/conversation";
import {
  DEFAULT_SUPPORT_INBOX_ROUTE_STATE,
  type SupportInboxRouteState,
} from "../types/route-state";

import type {
  SupportConversationStatus,
  SupportInboxLayout,
  SupportInboxSection,
  SupportInboxView,
} from "../types/conversation";

/** Search-param keys exposed in the URL. Stable on purpose for deep links. */
export const SUPPORT_INBOX_SEARCH_PARAM_KEYS = {
  view: "view",
  layout: "layout",
  status: "status",
  q: "q",
  label: "label",
  assignee: "assignee",
  selectedConversationId: "id",
  section: "section",
} as const;

const STATUS_PARSER_VALUES = [...SUPPORT_CONVERSATION_STATUSES, "all"] as const;

type StatusParserValue = (typeof STATUS_PARSER_VALUES)[number];

const supportInboxParsers = {
  [SUPPORT_INBOX_SEARCH_PARAM_KEYS.view]: parseAsStringEnum<SupportInboxView>([
    ...SUPPORT_INBOX_VIEWS,
  ]).withDefault(DEFAULT_SUPPORT_INBOX_ROUTE_STATE.view),
  [SUPPORT_INBOX_SEARCH_PARAM_KEYS.layout]:
    parseAsStringEnum<SupportInboxLayout>([
      ...SUPPORT_INBOX_LAYOUTS,
    ]).withDefault(DEFAULT_SUPPORT_INBOX_ROUTE_STATE.layout),
  [SUPPORT_INBOX_SEARCH_PARAM_KEYS.status]:
    parseAsStringEnum<StatusParserValue>([...STATUS_PARSER_VALUES]).withDefault(
      DEFAULT_SUPPORT_INBOX_ROUTE_STATE.status,
    ),
  [SUPPORT_INBOX_SEARCH_PARAM_KEYS.q]: parseAsString.withDefault(
    DEFAULT_SUPPORT_INBOX_ROUTE_STATE.q,
  ),
  [SUPPORT_INBOX_SEARCH_PARAM_KEYS.label]: parseAsArrayOf(
    parseAsString,
    ",",
  ).withDefault(DEFAULT_SUPPORT_INBOX_ROUTE_STATE.labelSlugs),
  [SUPPORT_INBOX_SEARCH_PARAM_KEYS.assignee]: parseAsString.withDefault(
    DEFAULT_SUPPORT_INBOX_ROUTE_STATE.assignee,
  ),
  [SUPPORT_INBOX_SEARCH_PARAM_KEYS.selectedConversationId]:
    parseAsString.withDefault(""),
  [SUPPORT_INBOX_SEARCH_PARAM_KEYS.section]:
    parseAsStringEnum<SupportInboxSection>([
      ...SUPPORT_INBOX_SECTIONS,
    ]).withDefault(DEFAULT_SUPPORT_INBOX_ROUTE_STATE.section),
};

export interface SupportInboxRouteStateApi {
  state: SupportInboxRouteState;
  setState: (next: Partial<SupportInboxRouteState>) => void;
  resetState: () => void;
}

/**
 * Hook that backs every URL-driven choice in the inbox: which view tab is
 * active, which layout is showing, which status the toolbar dropdown is
 * filtering by, the search string, label filter, assignee filter, the focused
 * conversation, and the top-level section.
 *
 * Returns reference-stable `setState` and `resetState` so consumers can put
 * them into effects without retrigger loops.
 */
export function useSupportInboxState(): SupportInboxRouteStateApi {
  const [params, setParams] = useQueryStates(supportInboxParsers, {
    history: "replace",
    shallow: true,
    scroll: false,
    clearOnDefault: true,
  });

  const state = React.useMemo<SupportInboxRouteState>(
    () => ({
      view: params[SUPPORT_INBOX_SEARCH_PARAM_KEYS.view],
      layout: params[SUPPORT_INBOX_SEARCH_PARAM_KEYS.layout],
      status: params[SUPPORT_INBOX_SEARCH_PARAM_KEYS.status] as
        | SupportConversationStatus
        | "all",
      q: params[SUPPORT_INBOX_SEARCH_PARAM_KEYS.q],
      labelSlugs: params[SUPPORT_INBOX_SEARCH_PARAM_KEYS.label],
      assignee: params[SUPPORT_INBOX_SEARCH_PARAM_KEYS.assignee],
      selectedConversationId:
        params[SUPPORT_INBOX_SEARCH_PARAM_KEYS.selectedConversationId] || null,
      section: params[SUPPORT_INBOX_SEARCH_PARAM_KEYS.section],
    }),
    [params],
  );

  const setState = React.useCallback(
    (next: Partial<SupportInboxRouteState>) => {
      const update: Partial<typeof params> = {};
      if (next.view !== undefined) {
        update[SUPPORT_INBOX_SEARCH_PARAM_KEYS.view] = next.view;
      }
      if (next.layout !== undefined) {
        update[SUPPORT_INBOX_SEARCH_PARAM_KEYS.layout] = next.layout;
      }
      if (next.status !== undefined) {
        update[SUPPORT_INBOX_SEARCH_PARAM_KEYS.status] = next.status;
      }
      if (next.q !== undefined) {
        update[SUPPORT_INBOX_SEARCH_PARAM_KEYS.q] = next.q;
      }
      if (next.labelSlugs !== undefined) {
        update[SUPPORT_INBOX_SEARCH_PARAM_KEYS.label] = next.labelSlugs;
      }
      if (next.assignee !== undefined) {
        update[SUPPORT_INBOX_SEARCH_PARAM_KEYS.assignee] = next.assignee;
      }
      if (next.selectedConversationId !== undefined) {
        update[SUPPORT_INBOX_SEARCH_PARAM_KEYS.selectedConversationId] =
          next.selectedConversationId ?? "";
      }
      if (next.section !== undefined) {
        update[SUPPORT_INBOX_SEARCH_PARAM_KEYS.section] = next.section;
      }
      void setParams(update);
    },
    [setParams],
  );

  const resetState = React.useCallback(() => {
    void setParams({
      [SUPPORT_INBOX_SEARCH_PARAM_KEYS.view]:
        DEFAULT_SUPPORT_INBOX_ROUTE_STATE.view,
      [SUPPORT_INBOX_SEARCH_PARAM_KEYS.layout]:
        DEFAULT_SUPPORT_INBOX_ROUTE_STATE.layout,
      [SUPPORT_INBOX_SEARCH_PARAM_KEYS.status]:
        DEFAULT_SUPPORT_INBOX_ROUTE_STATE.status,
      [SUPPORT_INBOX_SEARCH_PARAM_KEYS.q]: DEFAULT_SUPPORT_INBOX_ROUTE_STATE.q,
      [SUPPORT_INBOX_SEARCH_PARAM_KEYS.label]:
        DEFAULT_SUPPORT_INBOX_ROUTE_STATE.labelSlugs,
      [SUPPORT_INBOX_SEARCH_PARAM_KEYS.assignee]:
        DEFAULT_SUPPORT_INBOX_ROUTE_STATE.assignee,
      [SUPPORT_INBOX_SEARCH_PARAM_KEYS.selectedConversationId]: "",
      [SUPPORT_INBOX_SEARCH_PARAM_KEYS.section]:
        DEFAULT_SUPPORT_INBOX_ROUTE_STATE.section,
    });
  }, [setParams]);

  return { state, setState, resetState };
}

/**
 * Pure parser for the request-side. Server components that want to derive
 * filters before rendering can call this with their search-params object
 * without depending on the client-side hook.
 */
export function parseSupportInboxRouteState(
  searchParams: Record<string, string | string[] | undefined>,
): SupportInboxRouteState {
  const single = (key: string): string | null => {
    const raw = searchParams[key];
    if (Array.isArray(raw)) return raw[0] ?? null;
    return typeof raw === "string" ? raw : null;
  };

  function pickEnum<TValue extends string>(
    key: string,
    values: readonly TValue[],
    fallback: TValue,
  ): TValue {
    const value = single(key);
    return values.includes(value as TValue) ? (value as TValue) : fallback;
  }

  const view = pickEnum<SupportInboxView>(
    SUPPORT_INBOX_SEARCH_PARAM_KEYS.view,
    SUPPORT_INBOX_VIEWS,
    DEFAULT_SUPPORT_INBOX_ROUTE_STATE.view,
  );
  const layout = pickEnum<SupportInboxLayout>(
    SUPPORT_INBOX_SEARCH_PARAM_KEYS.layout,
    SUPPORT_INBOX_LAYOUTS,
    DEFAULT_SUPPORT_INBOX_ROUTE_STATE.layout,
  );
  const status = pickEnum<StatusParserValue>(
    SUPPORT_INBOX_SEARCH_PARAM_KEYS.status,
    STATUS_PARSER_VALUES,
    DEFAULT_SUPPORT_INBOX_ROUTE_STATE.status as StatusParserValue,
  );
  const section = pickEnum<SupportInboxSection>(
    SUPPORT_INBOX_SEARCH_PARAM_KEYS.section,
    SUPPORT_INBOX_SECTIONS,
    DEFAULT_SUPPORT_INBOX_ROUTE_STATE.section,
  );

  const q = single(SUPPORT_INBOX_SEARCH_PARAM_KEYS.q) ?? "";
  const labelRaw = single(SUPPORT_INBOX_SEARCH_PARAM_KEYS.label) ?? "";
  const labelSlugs = labelRaw
    .split(",")
    .map((slug) => slug.trim())
    .filter((slug) => slug.length > 0);
  const assignee = single(SUPPORT_INBOX_SEARCH_PARAM_KEYS.assignee) ?? "";
  const selectedConversationIdRaw =
    single(SUPPORT_INBOX_SEARCH_PARAM_KEYS.selectedConversationId) ?? "";
  const selectedConversationId =
    selectedConversationIdRaw.length > 0 ? selectedConversationIdRaw : null;

  return {
    view,
    layout,
    status: status as SupportConversationStatus | "all",
    q,
    labelSlugs,
    assignee,
    selectedConversationId,
    section,
  };
}
