/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("@asym/ui/components/ministry-update", () => ({
  MinistryUpdateMediaUnavailable: () => <div>Photo unavailable</div>,
  // Stands in for the real bar's buttons, which carry `describedBy`.
  ReactionBar: ({ describedBy }: { describedBy?: string }) => (
    <button type="button" aria-describedby={describedBy}>
      Love 0
    </button>
  ),
}));
vi.mock("@asym/ui/components/shadcn/rich-text-editor", async () => ({
  PostContent: (
    await import("../../../../../../packages/ui/components/shadcn/rich-text-editor/post-content")
  ).PostContent,
}));

const { DraftPostCard, PublishedPostCard } =
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
    author: { first_name: "Anna", last_name: "Lee", avatar_url: null },
    media: [],
    ...overrides,
  } as unknown as Post;
}

function renderCards(Card: typeof PublishedPostCard, posts: Post[]) {
  render(
    <>
      {posts.map((entry) => (
        <Card key={entry.id} post={entry} onEdit={vi.fn()} onDelete={vi.fn()} />
      ))}
    </>,
  );
}

it("names each published update's menu for that update", () => {
  renderCards(PublishedPostCard, [
    post({ id: "a", title: "New classroom" }),
    post({ id: "b", title: "Clinic opening" }),
  ]);
  const names = screen
    .getAllByRole("button", { name: /^Update actions/ })
    .map((button) => button.getAttribute("aria-label"));
  expect(names).toEqual([
    "Update actions for New classroom",
    "Update actions for Clinic opening",
  ]);
});

it("names an untitled update by its type and date", () => {
  renderCards(PublishedPostCard, [
    post({ id: "a", title: "", post_type: "Prayer Request" }),
  ]);
  expect(
    screen.getByRole("button", {
      name: "Update actions for Prayer request from Nov 1, 2026",
    }),
  ).toBeTruthy();
});

it("ties each published update's reactions to its title", () => {
  renderCards(PublishedPostCard, [
    post({ id: "a", title: "New classroom" }),
    post({ id: "b", title: "Clinic opening" }),
  ]);
  expect(
    screen
      .getAllByRole("button", { name: "Love 0" })
      .map((button) => button.getAttribute("aria-describedby"))
      .map((ids) => document.getElementById(ids ?? "")?.textContent),
  ).toEqual(["New classroom", "Clinic opening"]);
  expect(
    screen.getByRole("button", {
      name: "Love 0",
      description: "Clinic opening",
    }),
  ).toBeTruthy();
});

it("ties an untitled update's reactions to its type and date", () => {
  renderCards(PublishedPostCard, [
    post({ id: "a", title: " ", post_type: "Prayer Request" }),
  ]);
  expect(
    screen.getByRole("button", {
      name: "Love 0",
      description: "Prayer request Nov 1, 2026",
    }),
  ).toBeTruthy();
});

it("names the photo carousel for its update", () => {
  renderCards(PublishedPostCard, [
    post({
      media: [
        { url: "https://images.unsplash.com/photo-1", type: "image" },
        { url: "https://images.unsplash.com/photo-2", type: "image" },
      ],
    } as Partial<Post>),
  ]);
  const carousel = screen.getByRole("region", {
    name: "Photos from New classroom",
  });
  expect(carousel.getAttribute("aria-roledescription")).toBe("carousel");
});

it("names each draft's Keep writing action for that draft", () => {
  renderCards(DraftPostCard, [
    post({ id: "a", title: "New classroom", status: "draft" }),
    post({ id: "b", title: "", status: "draft" }),
  ]);
  const keepWriting = screen.getAllByRole("button", { name: /^Keep writing/ });
  expect(keepWriting.map((button) => button.textContent)).toEqual([
    "Keep writing",
    "Keep writing",
  ]);
  expect(
    keepWriting.map((button) => button.getAttribute("aria-label")),
  ).toEqual([
    "Keep writing New classroom",
    "Keep writing Story from Nov 1, 2026",
  ]);
  expect(
    screen
      .getAllByRole("button", { name: /^Update actions/ })
      .map((button) => button.getAttribute("aria-label")),
  ).toEqual([
    "Update actions for New classroom",
    "Update actions for Story from Nov 1, 2026",
  ]);
});
