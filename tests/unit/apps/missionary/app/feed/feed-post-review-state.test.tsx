/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@asym/ui/components/ministry-update", () => ({
  MinistryUpdateMediaUnavailable: () => <div>Photo unavailable</div>,
  ReactionBar: () => (
    <button type="button" aria-label="Love">
      Love 0
    </button>
  ),
}));
vi.mock("@asym/ui/components/shadcn/rich-text-editor", async () => ({
  PostContent: (
    await import("../../../../../../packages/ui/components/shadcn/rich-text-editor/post-content")
  ).PostContent,
}));

const { PublishedPostCard } =
  await import("../../../../../../apps/missionary/app/feed/feed-post-card");

type Post = Parameters<typeof PublishedPostCard>[0]["post"];

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: () => false,
  }));
  for (const name of ["ResizeObserver", "IntersectionObserver"]) {
    vi.stubGlobal(
      name,
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      },
    );
  }
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function post(overrides: Partial<Post>): Post {
  return {
    id: "post-1",
    post_type: "Story",
    title: "New classroom",
    content: "<p>We opened it this week.</p>",
    created_at: "2026-11-01T10:00:00.000Z",
    visibility: "public",
    status: "published",
    author: { id: "profile-1", avatar_url: null },
    post_author_public_name: "Anna Lee",
    media: [],
    review_state: "approved",
    review_reason: null,
    ...overrides,
  } as unknown as Post;
}

function renderCard(entry: Post, onWithdraw = vi.fn()) {
  render(
    <PublishedPostCard
      post={entry}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onWithdraw={onWithdraw}
    />,
  );
  return onWithdraw;
}

async function menuItems() {
  fireEvent.click(screen.getByRole("button", { name: /Update actions for/ }));
  return (await screen.findAllByRole("menuitem")).map(
    (item) => item.textContent,
  );
}

describe("the author sees where each update stands in review (AL-2680, WP7 pull request 1)", () => {
  it("marks an update waiting for review, one not approved with the reviewer's reason, and one withdrawn; an approved one carries no mark", () => {
    renderCard(post({ id: "a", review_state: "submitted" }));
    expect(screen.getByText("Waiting for review")).toBeTruthy();
    cleanup();

    renderCard(
      post({
        id: "b",
        review_state: "rejected",
        review_reason: "Names a partner church",
      }),
    );
    expect(screen.getByText("Not approved")).toBeTruthy();
    expect(
      screen.getByText("Reviewer’s note: Names a partner church"),
    ).toBeTruthy();
    cleanup();

    renderCard(post({ id: "c", review_state: "withdrawn" }));
    expect(screen.getByText("Withdrawn")).toBeTruthy();
    cleanup();

    renderCard(post({ id: "d", review_state: "approved" }));
    expect(screen.queryByText("Waiting for review")).toBeNull();
    expect(screen.queryByText("Not approved")).toBeNull();
    expect(screen.queryByText("Withdrawn")).toBeNull();
  });

  it("offers Withdraw on an update waiting for review or approved, and not on one already withdrawn or not approved", async () => {
    const onWithdraw = renderCard(post({ review_state: "submitted" }));
    expect(await menuItems()).toContain("Withdraw");
    fireEvent.click(screen.getByRole("menuitem", { name: "Withdraw" }));
    expect(onWithdraw).toHaveBeenCalledTimes(1);
    cleanup();

    renderCard(post({ review_state: "approved" }));
    expect(await menuItems()).toContain("Withdraw");
    cleanup();

    for (const state of ["withdrawn", "rejected"]) {
      renderCard(post({ review_state: state as never }));
      expect(await menuItems(), state).not.toContain("Withdraw");
      cleanup();
    }
  });
});
