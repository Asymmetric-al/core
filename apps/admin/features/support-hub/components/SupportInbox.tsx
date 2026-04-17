"use client";

import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

import { useSupportConversations } from "../hooks/use-support-conversations";
import {
  useSetSupportConversationStatus,
  useSnoozeSupportConversation,
} from "../hooks/use-support-mutations";
import { useCurrentSupportAgentId } from "../lib/current-agent";
import { SupportNowProvider, useSupportNow } from "../lib/now";
import { useSupportInboxState } from "../lib/route-state";
import { type SupportConversationFilter } from "../lib/selectors";
import { SupportBoardView } from "./board/SupportBoardView";
import { SupportCommandPalette } from "./command/SupportCommandPalette";
import { useInboxShortcuts } from "./command/use-inbox-shortcuts";
import {
  SupportCommandPaletteProvider,
  useSupportCommandPalette,
} from "./command/use-support-command-palette";
import { ConversationDetail } from "./detail/ConversationDetail";
import { StatsStrip } from "./stats/StatsStrip";
import { SupportInboxEmptyState } from "./SupportInboxEmptyState";
import { SupportTableView } from "./table/SupportTableView";
import { ViewTabs } from "./tabs/ViewTabs";
import { InboxToolbar } from "./toolbar/InboxToolbar";
import { SavedViewsBar } from "./views/SavedViewsBar";

import type { SupportConversation } from "../types";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Top-level workspace for the donor-care inbox. Reads URL state via
 * `useSupportInboxState`, feeds the same filtered conversation source into
 * board and table, and reserves a right pane for the Phase 4 detail view.
 *
 * Mobile: detail opens as a `Sheet` from the right; the right rail is hidden.
 * Desktop (>= lg): the inbox grid splits 8/4 between body and detail rail.
 *
 * `SupportNowProvider` keeps every relative-time render pure under the React
 * Compiler purity rule (no `Date.now()` or `new Date()` in render bodies).
 */
export function SupportInbox() {
  return (
    <SupportNowProvider>
      <SupportCommandPaletteProvider>
        <SupportInboxBody />
      </SupportCommandPaletteProvider>
    </SupportNowProvider>
  );
}

function SupportInboxBody() {
  const { state, setState, resetState } = useSupportInboxState();
  const currentAgentId = useCurrentSupportAgentId();
  const conversations = useSupportConversations();
  const nowIso = useSupportNow();
  const palette = useSupportCommandPalette();
  const setStatus = useSetSupportConversationStatus();
  const snooze = useSnoozeSupportConversation();
  const inboxRef = React.useRef<HTMLDivElement | null>(null);

  const baseFilter: Omit<SupportConversationFilter, "view"> = {
    status: state.status,
    q: state.q,
    labelSlugs: state.labelSlugs,
    assignee: state.assignee,
    agentId: currentAgentId,
    now: nowIso,
  };

  const filteredConversations = useSupportConversations({
    filter: { ...baseFilter, view: state.view },
  });

  const handleSelectConversation = (id: string) => {
    setState({ selectedConversationId: id });
  };

  const handleCloseDetail = () => {
    setState({ selectedConversationId: null });
  };

  const isLoading = conversations.isLoading || filteredConversations.isLoading;
  const isEmpty = !isLoading && filteredConversations.data.length === 0;

  const stepConversation = (direction: 1 | -1) => {
    const list = filteredConversations.data;
    if (list.length === 0) return;
    const currentIndex = list.findIndex(
      (row: SupportConversation) => row.id === state.selectedConversationId,
    );
    const nextIndex = clampIndex(
      currentIndex === -1
        ? direction > 0
          ? 0
          : list.length - 1
        : currentIndex + direction,
      list.length,
    );
    setState({ selectedConversationId: list[nextIndex]?.id ?? null });
  };

  const handleResolveSelected = () => {
    if (!state.selectedConversationId) return;
    void setStatus.mutateAsync({
      conversationId: state.selectedConversationId,
      status: "resolved",
    });
  };

  const handleSnoozeSelected = () => {
    if (!state.selectedConversationId) return;
    void snooze.mutateAsync({
      conversationId: state.selectedConversationId,
      snoozedUntil: new Date(Date.now() + 24 * HOUR_MS).toISOString(),
    });
  };

  useInboxShortcuts({
    containerRef: inboxRef,
    enabled: !palette.isOpen,
    handlers: {
      openCommandPalette: () => palette.open(),
      nextConversation: () => stepConversation(1),
      previousConversation: () => stepConversation(-1),
      resolveConversation: () => handleResolveSelected(),
      openSnoozeMenu: () => handleSnoozeSelected(),
      closeOverlay: () => palette.close(),
    },
  });

  return (
    <div ref={inboxRef} className="space-y-4">
      <SupportCommandPalette />
      <StatsStrip />

      <SavedViewsBar />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ViewTabs
          value={state.view}
          onValueChange={(next) => setState({ view: next })}
          baseFilter={baseFilter}
        />
      </div>

      <InboxToolbar />

      <div className="flex min-h-0 flex-col gap-4 lg:grid lg:grid-cols-12">
        <div
          className={cn(
            "min-h-0",
            state.selectedConversationId ? "lg:col-span-8" : "lg:col-span-12",
          )}
        >
          {isEmpty ? (
            <SupportInboxEmptyState onResetFilters={resetState} />
          ) : state.layout === "board" ? (
            <SupportBoardView
              conversations={filteredConversations.data}
              selectedConversationId={state.selectedConversationId}
              onSelectConversation={handleSelectConversation}
              nowIso={nowIso}
            />
          ) : (
            <SupportTableView
              conversations={filteredConversations.data}
              isLoading={isLoading}
              selectedConversationId={state.selectedConversationId}
              onSelectConversation={handleSelectConversation}
            />
          )}
        </div>

        {state.selectedConversationId ? (
          <div className="hidden min-h-0 lg:col-span-4 lg:block">
            <ConversationDetail
              conversationId={state.selectedConversationId}
              onClose={handleCloseDetail}
              layout="inline"
            />
          </div>
        ) : null}
      </div>

      <div className="lg:hidden">
        <ConversationDetail
          conversationId={state.selectedConversationId}
          onClose={handleCloseDetail}
          layout="sheet"
        />
      </div>
    </div>
  );
}

function clampIndex(value: number, length: number): number {
  if (length === 0) return 0;
  if (value < 0) return length - 1;
  if (value >= length) return 0;
  return value;
}
