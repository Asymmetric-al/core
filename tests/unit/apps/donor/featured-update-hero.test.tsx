/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: Verify the donor dashboard's featured story at its app boundary.
import { FeaturedUpdateHero } from "../../../../apps/donor/features/donor/components/featured-update-hero";

import type { DonorFeedPost } from "../../../../packages/database/hooks/donor-feed-posts";

afterEach(cleanup);

const post: DonorFeedPost = {
  id: "post-1",
  tenant_id: "tenant-1",
  missionary_id: "missionary-1",
  title: "Wells completed in Kajiado",
  post_type: "Milestone",
  content: "<p>Three new boreholes now serve 2,400 neighbours.</p>",
  media: [],
  like_count: 0,
  prayer_count: 0,
  fires_count: 0,
  comment_count: 0,
  created_at: "2026-01-29T09:00:00.000Z",
  updated_at: "2026-01-29T09:00:00.000Z",
  author: {
    id: "profile-1",
    first_name: "Jordan",
    last_name: "Hale",
    avatar_url: null,
  },
};

it("features the newest real update instead of fixed field-report copy", () => {
  render(<FeaturedUpdateHero post={post} isLoading={false} />);

  expect(
    screen.getByRole("heading", { name: "Wells completed in Kajiado" }),
  ).toBeTruthy();
  expect(screen.getByText("Milestone")).toBeTruthy();
  expect(screen.getByText(/Jordan Hale/)).toBeTruthy();
  expect(
    screen.getByText("Three new boreholes now serve 2,400 neighbours."),
  ).toBeTruthy();
  expect(screen.queryByText(/Chiang Mai/)).toBeNull();
  expect(
    screen
      .getByRole("link", { name: "Read the full update" })
      .getAttribute("href"),
  ).toBe("/donor-dashboard/feed#update-post-1");
});

it("says plainly when there is no update to feature", () => {
  render(<FeaturedUpdateHero post={null} isLoading={false} />);

  expect(screen.getByText("No ministry updates yet")).toBeTruthy();
  expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
});

it("shows a loading placeholder while the feed loads", () => {
  render(<FeaturedUpdateHero post={null} isLoading />);

  expect(
    screen.getByLabelText("Loading the latest ministry update"),
  ).toBeTruthy();
  expect(screen.queryByText("No ministry updates yet")).toBeNull();
});

it("reports a failed feed load instead of claiming there are no updates", () => {
  render(
    <FeaturedUpdateHero
      post={null}
      isLoading={false}
      error={new Error("network")}
    />,
  );

  expect(screen.getByText("Updates couldn't load right now")).toBeTruthy();
  expect(screen.queryByText("No ministry updates yet")).toBeNull();
});

it("sizes an image-less story to its content instead of a dark media frame", () => {
  const view = render(<FeaturedUpdateHero post={post} isLoading={false} />);

  expect(view.container.querySelector("article")).toBeNull();
  expect(
    screen.getByRole("heading", { name: "Wells completed in Kajiado" }),
  ).toBeTruthy();
});

it("previews an update written in the composer as words, not JSON", () => {
  const content = JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Term two begins." }],
      },
    ],
  });
  render(<FeaturedUpdateHero post={{ ...post, content }} isLoading={false} />);
  expect(screen.getByText("Term two begins.")).toBeTruthy();
  expect(screen.queryByText(/"type":"doc"/)).toBeNull();
});
