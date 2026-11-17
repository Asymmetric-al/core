"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

import type { useDonorFeedPostPages } from "@asym/database/hooks";

import {
  focusHeadingIfLost,
  focusIsLost,
  useFocusHandoff,
} from "@/features/donor/focus-recovery";

type FeedPages = ReturnType<typeof useDonorFeedPostPages>;

/** The anchor a link uses to open the feed on one update. */
export function updateAnchor(id: string | number) {
  return `update-${id}`;
}

/**
 * Where focus can land once a press is answered. The page attaches these, so
 * the hook's result holds only render values and handlers.
 */
interface FeedFocusTargets {
  /** The page, whose heading takes focus when nothing better is left. */
  page: RefObject<HTMLElement | null>;
  /** Load more, or whichever Try again is showing. */
  loadButton: RefObject<HTMLButtonElement | null>;
  /** Show all updates, under filters that match nothing. */
  showAll: RefObject<HTMLButtonElement | null>;
}

/**
 * Loading, failure and recovery for the donor Updates feed: which state the
 * feed is in, how its alerts are re-announced, what its buttons say while
 * they wait, and where focus goes once a press is answered.
 */
export function useFeedRecovery(
  {
    feedQuery,
    posts,
    filteredPosts,
  }: {
    feedQuery: FeedPages;
    /** Every loaded update. */
    posts: readonly unknown[];
    /** The loaded updates the filters show, in order. */
    filteredPosts: readonly { id: string | number }[];
  },
  focusTargets: FeedFocusTargets,
) {
  const { page, loadButton, showAll: showAllButton } = focusTargets;
  // A first load, or one that waits offline for the connection: nothing has
  // loaded or failed, so the feed shows it loading rather than empty. It runs
  // once the connection returns.
  const loading =
    feedQuery.isLoading || (feedQuery.isPending && feedQuery.isPaused);
  const loadFailed =
    Boolean(feedQuery.error) && (feedQuery.accessDenied || posts.length === 0);
  // Each new failure keys a new alert, so a retry that fails again is
  // announced again. A failed fetch always brings a new error. A retry over
  // loaded pages keeps the old one until it answers, and one with nothing
  // loaded clears it while it runs, so neither counts until it fails.
  const [failure, setFailure] = useState({ error: feedQuery.error, count: 0 });
  if (feedQuery.error !== failure.error) {
    setFailure({
      error: feedQuery.error,
      count: feedQuery.error ? failure.count + 1 : failure.count,
    });
  }
  // Try again for a feed that failed to load. The feed's retry reports
  // nothing back, so a reload is answered once the error it was pressed on
  // changes: cleared by a reload that worked, or replaced by one that failed
  // again. Offline, the reload waits for the connection with the error
  // cleared and nothing loading, so a paused feed has not answered yet. The
  // error view stays while it runs, so Try again keeps focus. The focus
  // effect below still decides where focus lands.
  const [reload, setReload] = useState<{
    from: unknown;
    accessDenied: boolean;
  } | null>(null);
  if (
    reload &&
    !feedQuery.isLoading &&
    !feedQuery.isPaused &&
    feedQuery.error !== reload.from
  ) {
    setReload(null);
  }
  const reloading = reload !== null;
  // With nothing cached, the error clears while the reload runs; the view
  // keeps saying why until the reload answers.
  const accessDenied = reload ? reload.accessDenied : feedQuery.accessDenied;
  // Try again under loaded updates is busy until its fetch answers: a page
  // load, or a refresh, which is neither a first load nor a page load.
  const retryBusy = feedQuery.isFetching || feedQuery.isPaused;
  const loadMoreBusy = feedQuery.isLoadingMore || feedQuery.isPaused;
  // A busy button says what it waits for. Offline, a press waits for the
  // connection with nothing fetching.
  const pressLabel = (busy: boolean, idle: string, running: string) =>
    !busy ? idle : feedQuery.isPaused ? "Waiting for connection…" : running;

  // Load more, Try again and Show all updates each remove themselves once
  // they work, so focus moves on to the updates they brought back.
  const pendingFocus = useRef<
    { kind: "reset" | "reload" } | { kind: "page"; from: number } | null
  >(null);
  useEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    const waiting = pending.kind !== "reset";
    // Wait until the press is answered. Its fetch may still be running (a
    // refresh over cached pages is neither a first load nor a page load), or
    // offline it may wait paused for the connection with nothing fetching.
    // Try again on a feed that failed to load also re-renders the page
    // before its reload answers, so wait on that reload too.
    if (waiting && (feedQuery.isFetching || feedQuery.isPaused || reloading))
      return;
    pendingFocus.current = null;
    const lost = focusIsLost();
    if (waiting && feedQuery.error) {
      if (lost) loadButton.current?.focus();
      return;
    }
    if (!lost && document.activeElement !== loadButton.current) return;
    const post =
      filteredPosts[pending.kind === "page" ? pending.from : 0] ??
      (lost ? filteredPosts.at(-1) : undefined);
    if (post) {
      document.getElementById(updateAnchor(post.id))?.focus();
    } else if (lost && showAllButton.current) {
      showAllButton.current.focus();
    } else {
      focusHeadingIfLost(page.current);
    }
  }, [
    filteredPosts,
    feedQuery.isFetching,
    feedQuery.isPaused,
    feedQuery.error,
    reloading,
    loadButton,
    showAllButton,
    page,
  ]);

  // However a failed load or refresh recovers, focus on its error view moves
  // on as after Try again. A press still waiting keeps its own landing.
  const errorView = useFocusHandoff(() => {
    pendingFocus.current ??= { kind: "reload" };
    return true;
  });

  /** Try again on a feed that failed to load. */
  const reloadFeed = () => {
    if (reloading) return;
    pendingFocus.current = { kind: "reload" };
    setReload({
      from: feedQuery.error,
      accessDenied: feedQuery.accessDenied,
    });
    feedQuery.retry();
  };
  /** Try again under loaded updates, for a page load or a refresh. */
  const retry = () => {
    pendingFocus.current = feedQuery.isNextPageError
      ? { kind: "page", from: filteredPosts.length }
      : { kind: "reload" };
    feedQuery.retry();
  };
  const loadMore = () => {
    pendingFocus.current = { kind: "page", from: filteredPosts.length };
    feedQuery.loadMore();
  };
  /** Show all updates: `clearFilters` resets them, then focus follows. */
  const showAll = (clearFilters: () => void) => {
    pendingFocus.current = { kind: "reset" };
    clearFilters();
  };

  return {
    loading,
    loadFailed,
    reloading,
    accessDenied,
    /** Keys the failure alerts, so each new failure is announced. */
    failureCount: failure.count,
    retryBusy,
    loadMoreBusy,
    pressLabel,
    reload: reloadFeed,
    /** For the error view of a failed load, and the one under loaded updates. */
    errorView,
    retry,
    loadMore,
    showAll,
  };
}
