/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";

// The reaction bar talks to the engagement service; the order of the
// update's own content is what this test is about.
vi.mock("@asym/ui/components/ministry-update", () => ({
  MinistryUpdateMediaUnavailable: () => <div>Photo unavailable</div>,
  ReactionBar: () => <div data-testid="reactions" />,
}));
// Use the real read-only renderer without loading the unrelated editor barrel.
vi.mock("@asym/ui/components/shadcn/rich-text-editor", async () => ({
  PostContent: (
    await import("../../../../../../packages/ui/components/shadcn/rich-text-editor/post-content")
  ).PostContent,
}));

const { PublishedPostCard } =
  await import("../../../../../../apps/missionary/app/feed/feed-post-card");

import type { Post } from "../../../../../../apps/missionary/app/feed/feed-model";

afterEach(cleanup);

const post = {
  id: "post-1",
  post_type: "Story",
  title: "New classroom",
  content: "<p>We opened it this week.</p>",
  created_at: "2026-11-01T10:00:00.000Z",
  visibility: "public",
  status: "published",
  author: { first_name: "Anna", last_name: "Lee", avatar_url: null },
  media: [{ url: "https://images.unsplash.com/photo-1", type: "image" }],
} as unknown as Post;

function follows(earlier: Node, later: Node) {
  return Boolean(
    earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
}

it("shows the author the same order supporters see: title, photo, then text", () => {
  render(<PublishedPostCard post={post} onEdit={vi.fn()} onDelete={vi.fn()} />);

  const title = screen.getByRole("heading", { name: "New classroom" });
  const photo = screen.getByAltText("New classroom");
  const text = screen.getByText("We opened it this week.");

  expect(follows(title, photo)).toBe(true);
  expect(follows(photo, text)).toBe(true);
  expect(follows(text, screen.getByTestId("reactions"))).toBe(true);
});
