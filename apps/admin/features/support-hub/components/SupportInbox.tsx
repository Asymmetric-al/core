"use client";

import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

import { SupportInboxEmptyState } from "./SupportInboxEmptyState";
import { useSupportConversations } from "../hooks/use-support-conversations";
import { useCurrentSupportAgentId } from "../lib/current-agent";
import { SupportNowProvider, useSupportNow } from "../lib/now";
import { useSupportInboxState } from "../lib/route-state";
import { type SupportConversationFilter } from "../lib/selectors";
import { useLgUp } from "../lib/use-lg-up";
import { SupportBoardView } from "./board/SupportBoardView";
import { ConversationDetail } from "./detail/ConversationDetail";
import { StatsStrip } from "./stats/StatsStrip";
import { SupportTableView } from "./table/SupportTableView";
import { ViewTabs } from "./tabs/ViewTabs";
import { InboxToolbar } from "./toolbar/InboxToolbar";

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
      <SupportInboxBody />
    </SupportNowProvider>
  );
}

function SupportInboxBody() {
  const { state, setState, resetState } = useSupportInboxState();
  const currentAgentId = useCurrentSupportAgentId();
  const conversations = useSupportConversations();
  const nowIso = useSupportNow();
  const isLgUp = useLgUp();

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

  return (
    <div className="space-y-4">
      <StatsStrip />

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

        {isLgUp && state.selectedConversationId ? (
          <div className="min-h-0 lg:col-span-4">
            <ConversationDetail
              conversationId={state.selectedConversationId}
              onClose={handleCloseDetail}
              layout="inline"
            />
          </div>
        ) : null}
      </div>

      {!isLgUp ? (
        <ConversationDetail
          conversationId={state.selectedConversationId}
          onClose={handleCloseDetail}
          layout="sheet"
        />
      ) : null}
    </div>
  );
}
