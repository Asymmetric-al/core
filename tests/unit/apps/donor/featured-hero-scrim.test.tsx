/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    ...props
  }: {
    src: string;
    alt: string;
    fill?: boolean;
  }) => <img src={src} alt={alt} {...props} />,
}));

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
  media: [{ type: "image", url: "/images/wells.jpg" }],
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
} as DonorFeedPost;

function classes(element: Element | null) {
  return element ? [...element.classList] : [];
}

it("lays every line of overlaid text on its own scrim, whatever the photo", () => {
  const view = render(<FeaturedUpdateHero post={post} isLoading={false} />);
  const article = view.container.querySelector("article")!;
  expect(article).not.toBeNull();

  const heading = screen.getByRole("heading", {
    name: "Wells completed in Kajiado",
  });
  const meta = screen.getByText(/Jordan Hale/);
  const textBlock = heading.parentElement!;
  // The meta line, title, excerpt and button share one block...
  expect(textBlock.contains(meta)).toBe(true);
  expect(
    textBlock.contains(screen.getByRole("link", { name: /Read the full/ })),
  ).toBe(true);
  // ...whose own background is a theme scrim that never fades below 75%
  // behind the text, so light photos can't wash it out.
  expect(classes(textBlock)).toEqual(
    expect.arrayContaining([
      "bg-linear-to-t",
      "from-media-scrim/95",
      "to-media-scrim/75",
    ]),
  );
  // A soft fade above the block blends the scrim into the photo.
  const fade = textBlock.querySelector('[data-slot="hero-scrim-fade"]');
  expect(fade?.getAttribute("aria-hidden")).toBe("true");
  expect(classes(fade)).toEqual(
    expect.arrayContaining(["bottom-full", "from-media-scrim/75"]),
  );
});

it("grows with a long story instead of clipping the metadata off the top", () => {
  const view = render(<FeaturedUpdateHero post={post} isLoading={false} />);
  const article = classes(view.container.querySelector("article"));

  // A fixed height with overflow hidden would cut off the badge and byline
  // when a title wraps to several lines on a phone.
  expect(article).toEqual(expect.arrayContaining(["min-h-80"]));
  expect(article.some((name) => /^(\w+:)?h-\d/.test(name))).toBe(false);
});
