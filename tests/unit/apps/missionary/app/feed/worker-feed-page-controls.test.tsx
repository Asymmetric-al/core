// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { checkPattern } from "@ui-sdk/core/testing";
import { afterEach, expect, it, vi } from "vitest";

const composer = vi.hoisted(() => ({ setPostType: vi.fn() }));

// The editor loads lazily and is not what these tests are about.
vi.mock("next/dynamic", () => ({
  default: () =>
    function DynamicPlaceholder() {
      return null;
    },
}));
vi.mock(
  "../../../../../../apps/missionary/app/feed/feed-follow-requests",
  () => ({ FollowerRequestsCard: () => null }),
);
// The page's state lives in this hook; a small stateful stand-in keeps the
// real controls wired to state without loading the feed's data layer.
vi.mock(
  "../../../../../../apps/missionary/app/feed/use-worker-feed-page-view",
  async () => {
    const { useState } = await import("react");
    return {
      useWorkerFeedPageView: () => {
        const [postType, setPostType] = useState("Update");
        const [activeTab, setActiveTab] = useState("published");
        return {
          canRead: true,
          canWrite: true,
          hasUnsavedWriting: false,
          postType,
          setPostType: (next: string) => {
            composer.setPostType(next);
            setPostType(next);
          },
          postTitle: "",
          setPostTitle: vi.fn(),
          postContent: "",
          setPostContent: vi.fn(),
          activeTab,
          setActiveTab,
          editingPostId: null,
          postPrivacy: "public",
          setPostPrivacy: vi.fn(),
          selectedMedia: [],
          setSelectedMedia: vi.fn(),
          lastSaved: null,
          isLoading: false,
          isSaving: false,
          isUploading: false,
          isLoadingRequests: false,
          isLoadingDrafts: false,
          posts: [],
          drafts: [],
          pendingRequests: [],
          feedError: null,
          draftsError: false,
          requestsError: false,
          pendingEdit: null,
          pendingDelete: null,
          reloadPosts: vi.fn(),
          reloadDrafts: vi.fn(),
          reloadRequests: vi.fn(),
          requestEditPost: vi.fn(),
          requestDeletePost: vi.fn(),
          cancelEditPost: vi.fn(),
          confirmEditPost: vi.fn(),
          cancelDeletePost: vi.fn(),
          confirmDeletePost: vi.fn(),
          cancelEditing: vi.fn(),
          handlePost: vi.fn(),
          handleResolveRequest: vi.fn(),
        };
      },
    };
  },
);

const { default: WorkerFeed } =
  await import("../../../../../../apps/missionary/app/feed/worker-feed-page-client");

afterEach(() => {
  cleanup();
  composer.setPostType.mockClear();
});

function typeChips() {
  const group = screen.getByRole("group", { name: "Type of update" });
  return { group, chips: within(group).getAllByRole("button") };
}

it("names the Published and Drafts tabs and follows the tabs pattern", async () => {
  render(<WorkerFeed />);
  const list = screen.getByRole("tablist", { name: "Updates" });
  expect(
    within(list)
      .getAllByRole("tab")
      .map((tab) => tab.textContent),
  ).toEqual(["Published", "Drafts"]);
  await act(async () => {
    await checkPattern(list.closest('[data-slot="tabs"]')!, "tabs");
  });
});

it("offers the type of update as one group with a single tab stop", () => {
  render(<WorkerFeed />);
  const { group, chips } = typeChips();
  expect(chips.map((chip) => chip.textContent)).toEqual([
    "Update",
    "Story",
    "Prayer request",
    "Milestone",
  ]);
  expect(chips.map((chip) => chip.getAttribute("aria-pressed"))).toEqual([
    "true",
    "false",
    "false",
    "false",
  ]);
  expect(group.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  expect(chips[0]!.tabIndex).toBe(0);
});

it("moves between the types with the arrow keys", async () => {
  render(<WorkerFeed />);
  const { chips } = typeChips();
  chips[0]!.focus();
  fireEvent.keyDown(chips[0]!, { key: "ArrowRight" });
  await waitFor(() => expect(document.activeElement).toBe(chips[1]));
  // Moving focus does not choose; the type changes when a chip is pressed.
  expect(composer.setPostType).not.toHaveBeenCalled();
});

it("chooses another type and never leaves the choice empty", () => {
  render(<WorkerFeed />);
  const { chips } = typeChips();
  fireEvent.click(chips[2]!);
  expect(composer.setPostType).toHaveBeenLastCalledWith("Prayer Request");
  expect(chips.map((chip) => chip.getAttribute("aria-pressed"))).toEqual([
    "false",
    "false",
    "true",
    "false",
  ]);

  fireEvent.click(chips[2]!);
  expect(composer.setPostType).toHaveBeenCalledTimes(1);
  expect(chips[2]!.getAttribute("aria-pressed")).toBe("true");
});

it("keeps the filled and outline button look on the type chips", () => {
  render(<WorkerFeed />);
  const { chips } = typeChips();
  // The chosen chip is the filled Button, the rest the outline Button.
  expect(chips[0]!.className).toMatch(/\bbg-primary\b/);
  expect(chips[1]!.className).toMatch(/\bbg-background\b/);
  expect(chips[1]!.className).not.toMatch(/\bbg-primary\b/);
  for (const chip of chips) {
    // None of the shared toggle's own colors leak onto the Button.
    expect(chip.className).not.toMatch(/data-pressed:|hover:bg-muted/);
    expect(chip.className).toMatch(/\bh-8\b/);
  }
});
