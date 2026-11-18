"use client";

import { useIsDesktop } from "@asym/lib/hooks/use-mobile";
import { DATA_GRID_ROW_PRIMARY_ATTRIBUTE } from "@asym/ui/components/data-grid-panel";
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
 * `useSupportInboxState` and feeds the same filtered conversations to the
 * board and the table.
 *
 * Below lg the open conversation is a `Sheet` from the right. From lg, with
 * a conversation open, the grid splits 7/5 between the inbox and the detail
 * pane.
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
  // From lg the conversation opens in the side pane, below lg in the phone
  // sheet; each renders only at its size. The sheet portals out of its
  // wrapper, so CSS cannot hide it, and a CSS-hidden pane would still open
  // its own snooze menu on s, a second one over the sheet.
  const isDesktop = useIsDesktop();
  const currentAgentId = useCurrentSupportAgentId();
  const conversations = useSupportConversations();
  const nowIso = useSupportNow();
  const palette = useSupportCommandPalette();
  const resolveConversation = useResolveSupportConversation();
  const snoozeMenu = useSupportSnoozeMenuRequest();
  const inboxRef = React.useRef<HTMLDivElement | null>(null);
  const paneRef = React.useRef<HTMLDivElement | null>(null);
  const sheetRef = React.useRef<HTMLElement | null>(null);
  const filtersRef = React.useRef<HTMLDivElement | null>(null);
  const viewSwitcherRef = React.useRef<HTMLDivElement | null>(null);
  const searchRef = React.useRef<HTMLInputElement | null>(null);
  const paletteSearchRef = React.useRef<HTMLInputElement | null>(null);
  // Focus that waits for the update a control's click starts: the stepped
  // conversation, the view Show mine opens, the list a retry reloads.
  const stepFocusRef = React.useRef<string | null>(null);
  const stepFromRef = React.useRef<HTMLElement | null>(null);
  const viewFocusRef = React.useRef(false);
  const retryFocusRef = React.useRef(false);
  // Where the open conversation sat when e or s moved it.
  const leavingRef = React.useRef<ListPlace | null>(null);
  // Where the phone sheet's conversation sits in the list, as last found.
  const sheetPlaceRef = React.useRef<SheetPlace | null>(null);
  // An e or s move made in the phone sheet, which may close before it lands.
  const sheetMoveRef = React.useRef<Move | null>(null);

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

  // The sheet returns focus to the card of the conversation it showed, else
  // to the view switcher (Base UI focuses its first visible control). Base UI
  // focuses without scrolling, so a card e or s moved down the board is
  // brought on screen here, once the closed sheet has unmounted.
  const sheetFinalFocus = () => {
    const target = sheetReturnTarget(inboxRef.current, sheetPlaceRef.current);
    if (!target) return viewSwitcherRef.current;
    focusInList(target, laneScrollOffset());
    return target;
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
    retryFocusRef.current = true;
    void Promise.allSettled([
      conversations.refetch(),
      filteredConversations.refetch(),
    ]).then((results) => {
      // Still failing: Try again stays, so a later recovery must not move focus.
      if (results.some(refetchFailed)) retryFocusRef.current = false;
    });
  };

  // The open conversation's side pane, or its phone sheet, holding focus.
  const conversationWithFocus = () => {
    const active = document.activeElement;
    return (
      [paneRef.current, sheetRef.current].find((region) =>
        region?.contains(active),
      ) ?? null
    );
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
    const nextId = list[nextIndex]?.id;
    if (!nextId) return;
    // Focus follows the selection from the board or table, so Tab, Enter and
    // a screen reader start from the conversation now open. In the open
    // conversation's pane or sheet it stays put while that keeps the control.
    const from = conversationWithFocus();
    if (nextId === state.selectedConversationId) {
      if (!from)
        focusConversation(inboxRef.current, nextId, laneScrollOffset());
      return;
    }
    stepFocusRef.current = nextId;
    stepFromRef.current = from;
    setState({ selectedConversationId: nextId });
  };

  const handleResetFilters = () => {
    searchRef.current?.focus();
    resetState();
  };
  const handleShowMine = () => {
    viewFocusRef.current = true;
    setState({ view: "mine" });
  };
  const focusViewSwitcher = () => focusViewControl(viewSwitcherRef.current);

  const selectedConversation = () =>
    conversations.data.find(
      (conversation) => conversation.id === state.selectedConversationId,
    );
  const noteMove = (
    conversation: SupportConversation | undefined,
    to: SupportConversation["status"],
  ) => {
    leavingRef.current = listPlace(inboxRef.current, conversation, to);
    sheetMoveRef.current =
      conversation && sheetRef.current?.contains(document.activeElement)
        ? { id: conversation.id, status: conversation.status, to }
        : null;
  };
  const handleResolveSelected = () => {
    const conversation = selectedConversation();
    // e on a resolved conversation saves nothing, so nothing leaves.
    if (conversation?.status !== "resolved") noteMove(conversation, "resolved");
    void resolveConversation(conversation);
  };
  const handleOpenSnoozeMenu = () => {
    if (!state.selectedConversationId) return;
    const conversation = selectedConversation();
    // A snoozed conversation's menu wakes it up, back to Open.
    noteMove(
      conversation,
      conversation?.status === "snoozed" ? "open" : "snoozed",
    );
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

  // Runs before the pane's focus-return effect, so each j/k step from the
  // board or table records the stepped card as the place to return focus.
  React.useLayoutEffect(() => {
    if (!selectedId || stepFocusRef.current !== selectedId) return;
    stepFocusRef.current = null;
    // From the pane, focus stays there unless the pane dropped the focused
    // control (it shows a skeleton until the next conversation loads).
    const from = stepFromRef.current;
    if (from?.contains(document.activeElement)) return;
    // The phone sheet is modal: focus it dropped goes back to the sheet.
    if (from && from === sheetRef.current) {
      from.focus();
      return;
    }
    focusConversation(inboxRef.current, selectedId, laneScrollOffset());
  }, [selectedId, laneScrollOffset]);

  // e and s move the open conversation out of its lane, or out of the list,
  // which unmounts its focused card or row. Once the move lands, focus and
  // the selection go to the one now in its place, else the one before it,
  // else the lane.
  React.useLayoutEffect(() => {
    const leaving = leavingRef.current;
    if (!leaving) return;
    if (leaving.id !== selectedId) {
      leavingRef.current = null;
      return;
    }
    const moved = conversations.data.find((row) => row.id === leaving.id);
    if (moved?.status === leaving.status) return;
    leavingRef.current = null;
    // Another status means the e or s move was dropped and another one won.
    if (moved && moved.status !== leaving.to) return;
    // Recover only the focus the move dropped, not focus the agent moved.
    const active = document.activeElement;
    if (active && active !== document.body && active.isConnected) return;
    const targetId = idInPlace(leaving.list, leaving.id, leaving.index);
    if (targetId) {
      focusConversation(inboxRef.current, targetId, laneScrollOffset());
      if (targetId === leaving.id) return;
      // As after j: focus follows again once the new selection renders.
      stepFocusRef.current = targetId;
      stepFromRef.current = null;
      setState({ selectedConversationId: targetId });
      return;
    }
    const lane = laneOf(leaving.list);
    if (lane) lane.focus();
    else focusViewControl(viewSwitcherRef.current);
  }, [conversations.data, selectedId, setState, laneScrollOffset]);

  // Runs again when the list changes, so the place follows the card into
  // another lane and stays where it was once the card leaves the list.
  React.useLayoutEffect(() => {
    if (isDesktop || !selectedId) return;
    const place = itemPlace(inboxRef.current, selectedId);
    if (place)
      sheetPlaceRef.current = {
        id: selectedId,
        list: place.list,
        index: place.index,
      };
    else if (sheetPlaceRef.current?.id !== selectedId)
      sheetPlaceRef.current = { id: selectedId, list: null, index: -1 };
  }, [isDesktop, selectedId, filteredConversations.data, state.layout]);

  // The saves are not optimistic, so Escape can close the sheet onto the
  // card before the move lands and remounts it: focus then follows it again.
  React.useLayoutEffect(() => {
    const move = sheetMoveRef.current;
    if (!move) return;
    const moved = conversations.data.find((row) => row.id === move.id);
    if (moved?.status === move.status) return;
    sheetMoveRef.current = null;
    if (moved && moved.status !== move.to) return;
    // While the sheet is open or closing, its finalFocus finds the card.
    if (selectedId || sheetPlaceRef.current?.id !== move.id) return;
    const active = document.activeElement;
    if (active && active !== document.body && active.isConnected) return;
    const target = sheetReturnTarget(inboxRef.current, sheetPlaceRef.current);
    if (target) focusInList(target, laneScrollOffset());
    else focusViewControl(viewSwitcherRef.current);
  }, [conversations.data, selectedId, laneScrollOffset]);

  React.useLayoutEffect(() => {
    if (!viewFocusRef.current) return;
    viewFocusRef.current = false;
    focusViewControl(viewSwitcherRef.current);
  }, [state.view]);

  React.useLayoutEffect(() => {
    if (isError || !retryFocusRef.current) return;
    retryFocusRef.current = false;
    // Try again went with the alert; focus the agent moved stays where it is.
    if (document.activeElement === document.body) {
      focusViewControl(viewSwitcherRef.current);
    }
  }, [isError]);

  useInboxShortcuts({
    containerRef: inboxRef,
    paletteRef: paletteSearchRef,
    sheetRef,
    handlers: {
      openCommandPalette: () => palette.toggle(),
      nextConversation: () => stepConversation(1),
      previousConversation: () => stepConversation(-1),
      resolveConversation: () => handleResolveSelected(),
      openSnoozeMenu: () => handleOpenSnoozeMenu(),
    },
  });

  return (
    <div
      ref={inboxRef}
      className="space-y-3 sm:space-y-4"
      // The phone sheet portals out of this element, but its focus still
      // reaches here through React: that marks it as the inbox's sheet.
      onFocus={(event) => {
        const sheet = event.target.closest<HTMLElement>(CONVERSATION_SHEET);
        if (sheet) sheetRef.current = sheet;
      }}
    >
      <SupportCommandPalette searchRef={paletteSearchRef} />
      <SupportFailureBanner returnFocus={focusViewSwitcher} />
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
              <div ref={viewSwitcherRef} className="contents">
                <ViewTabs
                  value={state.view}
                  onValueChange={(next) => setState({ view: next })}
                  baseFilter={baseFilter}
                />
              </div>
              <SavedViewsBar />
            </div>

            <InboxToolbar searchRef={searchRef} />
          </div>

          {/* The in-app channel of Notification preferences. It sits under
              the filters, not above them: the sticky board filters overlap
              what is above them at rest. */}
          <ForYouNotice
            showMineAction={state.view !== "mine"}
            onShowMine={handleShowMine}
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
            <SupportInboxEmptyState onResetFilters={handleResetFilters} />
          ) : state.layout === "board" ? (
            <SupportBoardView
              conversations={filteredConversations.data}
              selectedConversationId={state.selectedConversationId}
              onSelectConversation={handleSelectConversation}
              // The board's own move takes over from an earlier e or s, and
              // focus follows the card it moves.
              onMoveStart={() => {
                leavingRef.current = null;
              }}
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

        {isDesktop && state.selectedConversationId ? (
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
          finalFocus={sheetFinalFocus}
        />
      )}
    </div>
  );
}

/** The app header is 3rem (`top-12`) tall. */
const APP_HEADER_HEIGHT = 48;

const ROW_PRIMARY = `[${DATA_GRID_ROW_PRIMARY_ATTRIBUTE}]`;
const GRID_ROW = 'tr[data-row-id], [data-slot="data-grid-panel-row"]';
const CONVERSATION_SHEET = '[data-slot="sheet-content"]';
const BOARD_LANE = 'section[tabindex="-1"]';

function conversationControl(
  root: HTMLElement,
  id: string,
): HTMLElement | null {
  // Board cards, and the table's cards on narrow screens.
  for (const card of root.querySelectorAll<HTMLElement>(
    "[data-conversation-id]",
  )) {
    if (card.dataset.conversationId === id)
      return (
        card.querySelector<HTMLElement>(ROW_PRIMARY) ??
        card.querySelector("button")
      );
  }
  for (const row of root.querySelectorAll<HTMLElement>("tr[data-row-id]")) {
    if (row.dataset.rowId === id)
      return row.querySelector<HTMLElement>(ROW_PRIMARY);
  }
  return null;
}

// A conversation's card or row, the list it sits in, its place there, and
// the status e or s moves it to.
interface ListPlace {
  id: string;
  status: SupportConversation["status"];
  to: SupportConversation["status"];
  list: HTMLElement;
  index: number;
}

type Move = Pick<ListPlace, "id" | "status" | "to">;

interface SheetPlace {
  id: string;
  list: HTMLElement | null;
  index: number;
}

// The card of the conversation the sheet showed, which e or s may have moved
// to another lane. If that one left the list: the one now in its place, else
// the one before it, else the lane.
function sheetReturnTarget(
  root: HTMLElement | null,
  place: SheetPlace | null,
): HTMLElement | null {
  if (!root || !place) return null;
  const card = conversationControl(root, place.id);
  if (card || !place.list) return card;
  const targetId = idInPlace(place.list, place.id, place.index);
  return (
    (targetId ? conversationControl(root, targetId) : null) ??
    laneOf(place.list)
  );
}

function listItems(list: HTMLElement): HTMLElement[] {
  return Array.from(list.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement &&
      child.matches(`${GRID_ROW}, [data-conversation-id]`),
  );
}

function itemConversationId(item: HTMLElement): string | undefined {
  return (
    item.dataset.rowId ??
    item.dataset.conversationId ??
    item.querySelector<HTMLElement>("[data-conversation-id]")?.dataset
      .conversationId
  );
}

// A conversation's card or row, the list it sits in, and its place there.
function itemPlace(root: HTMLElement | null, id: string) {
  const control = root ? conversationControl(root, id) : null;
  const item =
    control?.closest<HTMLElement>(GRID_ROW) ??
    control?.closest<HTMLElement>("[data-conversation-id]");
  const list = item?.parentElement;
  if (!item || !list) return null;
  return { item, list, index: listItems(list).indexOf(item) };
}

// Only a card or row that holds focus has a place to hand focus on from.
function listPlace(
  root: HTMLElement | null,
  conversation: SupportConversation | undefined,
  to: SupportConversation["status"],
): ListPlace | null {
  if (!conversation) return null;
  const place = itemPlace(root, conversation.id);
  if (!place?.item.contains(document.activeElement)) return null;
  return {
    id: conversation.id,
    status: conversation.status,
    to,
    list: place.list,
    index: place.index,
  };
}

// The conversation still in the list, else the one now at its index, else
// the one before it.
function idInPlace(
  list: HTMLElement,
  id: string,
  index: number,
): string | undefined {
  const items = list.isConnected ? listItems(list) : [];
  const item =
    items.find((entry) => itemConversationId(entry) === id) ??
    items[index] ??
    items[index - 1];
  return item ? itemConversationId(item) : undefined;
}

function laneOf(list: HTMLElement): HTMLElement | null {
  return list.isConnected ? list.closest<HTMLElement>(BOARD_LANE) : null;
}

function focusConversation(
  root: HTMLElement | null,
  id: string,
  topOffset: number,
) {
  const control = root ? conversationControl(root, id) : null;
  if (control) focusInList(control, topOffset);
}

// A card, row or lane, brought on screen below what covers the top.
function focusInList(element: HTMLElement, topOffset: number) {
  element.focus({ preventScroll: true });
  const item =
    element.closest(
      '[data-conversation-id], tr, [data-slot="data-grid-panel-row"]',
    ) ?? element;
  item.scrollIntoView?.({ block: "nearest" });
  // The app header, and on the board the sticky filters, cover the top.
  const top = item.getBoundingClientRect().top;
  if (top < topOffset) window.scrollBy({ top: top - topOffset });
}

function focusFirst(candidates: Iterable<HTMLElement>): boolean {
  for (const candidate of candidates) {
    candidate.focus();
    if (document.activeElement === candidate) return true;
  }
  return false;
}

// The view toggles show from sm up, the view select on phones.
function focusViewControl(root: HTMLElement | null) {
  if (!root) return;
  if (
    focusFirst(
      root.querySelectorAll<HTMLElement>(
        '[aria-selected="true"], [aria-pressed="true"]',
      ),
    )
  )
    return;
  focusFirst(
    Array.from(
      root.querySelectorAll<HTMLElement>("button, input, select, [tabindex]"),
    ).filter((element) => element.tabIndex >= 0),
  );
}

function refetchFailed(result: PromiseSettledResult<unknown>): boolean {
  if (result.status === "rejected") return true;
  const value = result.value;
  return (
    typeof value === "object" &&
    value !== null &&
    "isError" in value &&
    value.isError === true
  );
}

function clampIndex(value: number, length: number): number {
  if (length === 0) return 0;
  if (value < 0) return length - 1;
  if (value >= length) return 0;
  return value;
}
