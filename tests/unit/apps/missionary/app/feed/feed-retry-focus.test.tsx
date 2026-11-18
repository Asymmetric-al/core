/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FollowerRequestsCard } from "../../../../../../apps/missionary/app/feed/feed-follow-requests";
import { PublishedFeedPane } from "../../../../../../apps/missionary/app/feed/feed-support-ui";

import type { FollowerRequest } from "../../../../../../apps/missionary/app/feed/feed-model";

afterEach(cleanup);

/** Focuses Try again and presses it, as a keyboard user would. */
function pressTryAgain() {
  const button = screen.getByRole("button", { name: "Try again" });
  button.focus();
  fireEvent.click(button);
  return button;
}

describe("follow requests Try again", () => {
  const request: FollowerRequest = {
    id: "r1",
    donor_id: "donor-r1",
    name: "Logan Rivera",
    avatar_url: null,
    is_donor: true,
    access_level: "public",
    status: "pending",
    created_at: "2026-11-02T12:00:00.000Z",
    initials: "LR",
  };
  const onRetry = vi.fn();
  // Like the page: a reload keeps the old failure flag until it answers.
  function card(props: {
    loading: boolean;
    failed: boolean;
    requests?: FollowerRequest[];
  }) {
    return (
      <FollowerRequestsCard
        pendingRequests={props.requests ?? []}
        isLoadingRequests={props.loading}
        loadFailed={props.failed}
        onRetry={onRetry}
        onResolveRequest={async () => {}}
      />
    );
  }

  it("keeps focus on the button while retrying, then lands on the card heading", () => {
    const view = render(card({ loading: false, failed: true }));
    const button = pressTryAgain();
    expect(onRetry).toHaveBeenCalledOnce();
    view.rerender(card({ loading: true, failed: true }));
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    // Phones hide the loading list; the retry's own view must stay visible.
    expect(button.closest(".hidden")).toBeNull();

    view.rerender(card({ loading: false, failed: false, requests: [request] }));
    expect(button.isConnected).toBe(false);
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "Follow requests" }),
    );
  });

  it("leaves focus on the button and announces again when the requests still can't load", () => {
    const view = render(card({ loading: false, failed: true }));
    const firstAlert = screen.getByRole("alert");
    const button = pressTryAgain();
    view.rerender(card({ loading: true, failed: true }));
    view.rerender(card({ loading: false, failed: true }));
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    // A new alert node, so the unchanged message is read out again.
    expect(screen.getByRole("alert")).not.toBe(firstAlert);
  });
});

describe("published feed Try again", () => {
  const onRetry = vi.fn();
  function pane(props: {
    loading: boolean;
    error: string | null;
    posts?: boolean;
  }) {
    return (
      <div role="tabpanel" aria-label="Published" tabIndex={0}>
        <PublishedFeedPane
          feedError={props.error}
          hasPosts={props.posts ?? false}
          isLoading={props.loading}
          onRetry={onRetry}
        >
          <p>A published update</p>
        </PublishedFeedPane>
      </div>
    );
  }

  it("keeps focus on the button while retrying, then lands on the tab panel", () => {
    const view = render(pane({ loading: false, error: "Fixture failure" }));
    const button = pressTryAgain();
    expect(onRetry).toHaveBeenCalledOnce();
    view.rerender(pane({ loading: true, error: null }));
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(
      screen.queryByRole("status", { name: "Loading updates" }),
    ).toBeNull();

    view.rerender(pane({ loading: false, error: null, posts: true }));
    expect(button.isConnected).toBe(false);
    const panel = screen.getByRole("tabpanel", { name: "Published" });
    expect(within(panel).getByText("A published update")).toBeTruthy();
    expect(document.activeElement).toBe(panel);
  });

  it("leaves focus on the button when the feed still can't load", () => {
    const view = render(pane({ loading: false, error: "Fixture failure" }));
    const button = pressTryAgain();
    view.rerender(pane({ loading: true, error: null }));
    view.rerender(pane({ loading: false, error: "Still failing" }));
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    expect(screen.getByRole("alert").textContent).toContain("Still failing");
  });
});
