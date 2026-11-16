"use client";

import { useIsDesktop } from "@asym/lib/hooks/use-mobile";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { AlertCircle } from "lucide-react";
import * as React from "react";

import { ForYouNotice } from "./alerts/ForYouNotice";
import { SupportAgentSetupNotice } from "./alerts/SupportAgentSetupNotice";
import { SupportFailureBanner } from "./SupportFailureBanner";
import { SupportInboxEmptyState } from "./SupportInboxEmptyState";
import { useResolveSupportConversation } from "../hooks/use-resolve-support-conversation";
import { useSupportConversations } from "../hooks/use-support-conversations";
import { SupportFailureRecoveryProvider } from "../hooks/use-support-failure-recovery";
import { useCurrentSupportAgentId } from "../lib/current-agent";
import { inboxContentState } from "../lib/inbox-content-state";
import { SupportNowProvider, useSupportNow } from "../lib/now";
import { useSupportInboxState } from "../lib/route-state";
import { type SupportConversationFilter } from "../lib/selectors";
import {
  SupportSnoozeMenuRequestProvider,
  useSupportSnoozeMenuRequest,
} from "../lib/snooze-menu-request";
import { SupportBoardView } from "./board/SupportBoardView";
import { SupportCommandPalette } from "./command/SupportCommandPalette";
import { useInboxShortcuts } from "./command/use-inbox-shortcuts";
import {
  SupportCommandPaletteProvider,
  useSupportCommandPalette,
} from "./command/use-support-command-palette";
import { ConversationDetail } from "./detail/ConversationDetail";
import { StatsStrip } from "./stats/StatsStrip";
import { SupportTableView } from "./table/SupportTableView";
import { ViewTabs } from "./tabs/ViewTabs";
import { InboxToolbar } from "./toolbar/InboxToolbar";
import { SavedViewsBar } from "./views/SavedViewsBar";

import type { SupportConversation } from "../types";

/**
 * Top-level workspace for the donor-care inbox. Reads URL state via
 * `useSupportInboxState`, feeds the same filtered conversation source into
 * board and table, and reserves a right pane for the Phase 4 detail view.
 *
 * Mobile: detail opens as a `Sheet` from the right; the right rail is hidden.
 * Desktop (>= lg): the inbox grid splits 7/5 between body and detail rail.
 *
 * `SupportNowProvider` keeps every relative-time render pure under the React
 * Compiler purity rule (no `Date.now()` or `new Date()` in render bodies).
 */
export function SupportInbox() {
  return (
    <SupportNowProvider>
      <SupportCommandPaletteProvider>
        <SupportFailureRecoveryProvider>
          <SupportInboxSelection />
        </SupportFailureRecoveryProvider>
      </SupportCommandPaletteProvider>
    </SupportNowProvider>
  );
}

function SupportInboxSelection() {
  const { state } = useSupportInboxState();
  return (
    <SupportSnoozeMenuRequestProvider
      selectedConversationId={state.selectedConversationId}
    >
      <SupportInboxBody />
    </SupportSnoozeMenuRequestProvider>
  );
}

function SupportInboxBody() {
  const { state, setState, resetState } = useSupportInboxState();
  // From lg the conversation opens in the side pane. The phone sheet portals
  // out of its wrapper, so CSS cannot hide it: render it only below lg, or
  // it opens over the side pane on desktop.
  const isDesktop = useIsDesktop();
  const currentAgentId = useCurrentSupportAgentId();
  const conversations = useSupportConversations();
  const nowIso = useSupportNow();
  const palette = useSupportCommandPalette();
  const resolveConversation = useResolveSupportConversation();
  const snoozeMenu = useSupportSnoozeMenuRequest();
  const inboxRef = React.useRef<HTMLDivElement | null>(null);
  const paneRef = React.useRef<HTMLDivElement | null>(null);
  const filtersRef = React.useRef<HTMLDivElement | null>(null);

  // A lane jump lands below the 3rem app header and, on wide screens where
  // they stick, below the inbox filters too.
  const laneScrollOffset = React.useCallback(() => {
    const filters = filtersRef.current;
    if (filters && getComputedStyle(filters).position === "sticky") {
      return APP_HEADER_HEIGHT + filters.getBoundingClientRect().height;
    }
    return APP_HEADER_HEIGHT + 8;
  }, []);

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
  const isError = conversations.isError || filteredConversations.isError;
  const contentState = inboxContentState({
    isError,
    isLoading,
    total: conversations.data.length,
    matching: filteredConversations.data.length,
  });
  const retry = () => {
    void conversations.refetch();
    void filteredConversations.refetch();
  };

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
    void resolveConversation(
      conversations.data.find(
        (conversation) => conversation.id === state.selectedConversationId,
      ),
    );
  };
  const handleOpenSnoozeMenu = () => {
    if (state.selectedConversationId)
      snoozeMenu?.request(state.selectedConversationId);
  };

  // Opening a conversation on desktop brings the whole pane on screen,
  // scrolling only as far as needed (nothing moves once it is in view), so
  // the reply box is visible without hunting for it below the board.
  const selectedId = state.selectedConversationId;
  React.useEffect(() => {
    if (!isDesktop || !selectedId) return;
    paneRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [isDesktop, selectedId]);

  useInboxShortcuts({
    containerRef: inboxRef,
    enabled: !palette.isOpen,
    handlers: {
      openCommandPalette: () => palette.open(),
      nextConversation: () => stepConversation(1),
      previousConversation: () => stepConversation(-1),
      resolveConversation: () => handleResolveSelected(),
      openSnoozeMenu: () => handleOpenSnoozeMenu(),
      closeOverlay: () => palette.close(),
    },
  });

  return (
    <div ref={inboxRef} className="space-y-3 sm:space-y-4">
      <SupportCommandPalette />
      <SupportFailureBanner />
      <SupportAgentSetupNotice />
      <StatsStrip />

      <div className="flex min-h-0 flex-col gap-4 lg:grid lg:grid-cols-12">
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-col gap-3 sm:gap-4",
            state.selectedConversationId ? "lg:col-span-7" : "lg:col-span-12",
          )}
        >
          {/* Tabs, saved views and filters head the inbox column, so with a
              conversation open they sit over the board, not across the pane.
              On the board they stick under the 3rem app header so filters
              stay at hand down a long lane; the padding keeps a gap above
              and below once stuck, and the negative margins cancel it at
              rest. Not in the table, where the grid's selection bar sticks
              in the same place. */}
          <div
            aria-label="Inbox filters"
            role="group"
            ref={filtersRef}
            className={cn(
              "flex flex-col gap-2 sm:gap-3",
              state.layout === "board" &&
                "lg:sticky lg:top-12 lg:z-20 lg:-mt-4 lg:-mb-3 lg:bg-background lg:pt-4 lg:pb-3",
            )}
          >
            {/* Saved views share the tabs' row to keep the first
                conversation high on the page; on phones they share the
                view select's row, which never wraps (the saved view chips
                scroll sideways inside it). */}
            <div className="flex items-center gap-2 sm:flex-col sm:items-stretch sm:gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
              <ViewTabs
                value={state.view}
                onValueChange={(next) => setState({ view: next })}
                baseFilter={baseFilter}
              />
              <SavedViewsBar />
            </div>

            <InboxToolbar />
          </div>

          {/* The in-app channel of Notification preferences. It sits under
              the filters, not above them: the sticky board filters overlap
              what is above them at rest. */}
          <ForYouNotice
            showMineAction={state.view !== "mine"}
            onShowMine={() => setState({ view: "mine" })}
          />

          {isError ? (
            <Alert
              variant={contentState === "error" ? "destructive" : "warning"}
            >
              <AlertCircle aria-hidden="true" />
              <AlertTitle>
                {contentState === "error"
                  ? "The inbox could not load"
                  : "The inbox could not refresh"}
              </AlertTitle>
              <AlertDescription>
                {contentState === "error"
                  ? "Try again to load conversations. No conversations were changed."
                  : "Showing the last loaded list. Try again to load the latest conversations. No conversations were changed."}
                <Button type="button" variant="outline" onClick={retry}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
          {contentState === "error" ? null : contentState ===
            "no-conversations" ? (
            <SupportInboxEmptyState
              title="No conversations yet"
              description="Conversations will appear here when someone contacts a support inbox."
              settingsHref="/support/settings/inbox"
            />
          ) : contentState === "no-matches" ? (
            <SupportInboxEmptyState onResetFilters={resetState} />
          ) : state.layout === "board" ? (
            <SupportBoardView
              conversations={filteredConversations.data}
              selectedConversationId={state.selectedConversationId}
              onSelectConversation={handleSelectConversation}
              nowIso={nowIso}
              laneScrollOffset={laneScrollOffset}
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
          // Sticks under the 3rem app header and is one screen tall: the
          // card starts 1rem below the header, ends 1rem above the screen's
          // foot, and scrolls its thread inside, so the reply box stays in
          // view however long the board. -mt-4 lines it up with the inbox
          // tabs at rest (the overlap covers only the gap above).
          <div
            ref={paneRef}
            className="hidden min-h-0 lg:sticky lg:top-12 lg:col-span-5 lg:-mt-4 lg:block lg:h-svh lg:scroll-mt-12 lg:self-start lg:pt-4 lg:pb-16"
          >
            <ConversationDetail
              conversationId={state.selectedConversationId}
              onClose={handleCloseDetail}
              layout="inline"
            />
          </div>
        ) : null}
      </div>

      {isDesktop ? null : (
        <ConversationDetail
          conversationId={state.selectedConversationId}
          onClose={handleCloseDetail}
          layout="sheet"
        />
      )}
    </div>
  );
}

/** The app header is 3rem (`top-12`) tall. */
const APP_HEADER_HEIGHT = 48;

function clampIndex(value: number, length: number): number {
  if (length === 0) return 0;
  if (value < 0) return length - 1;
  if (value >= length) return 0;
  return value;
}
