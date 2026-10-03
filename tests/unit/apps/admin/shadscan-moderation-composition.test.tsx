/** @vitest-environment jsdom */

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: Test the actual app-owned moderation composition at its exported UI boundary.
import { ContentModerationTabsSection } from "../../../../apps/admin/app/(app)/feed/content-moderation-sections";

// eslint-disable-next-line no-restricted-imports -- AL-1931: Use the production post contract for this app-boundary fixture.
import type { Post } from "../../../../apps/admin/app/(app)/feed/feed-model";

afterEach(cleanup);

const post: Post = {
  id: "post-1",
  post_type: "update",
  content: "A ministry update",
  created_at: "2026-10-03T00:00:00.000Z",
  likes_count: 0,
  prayers_count: 0,
  fires_count: 0,
  comments_count: 0,
  visibility: "public",
  status: "published",
  author: {
    id: "missionary-1",
    name: "Example Missionary",
    avatar_url: "",
    role: "missionary",
  },
};

function renderModeration(searchQuery = "") {
  const dispatchUi = vi.fn();
  const onPostAction = vi.fn();
  const view = render(
    <ContentModerationTabsSection
      activeTab="all"
      searchQuery={searchQuery}
      filterVisibility="all"
      filterType="all"
      sortBy="newest"
      flaggedPosts={[]}
      posts={[post]}
      isLoading={false}
      dispatchUi={dispatchUi}
      onPostAction={onPostAction}
    />,
  );
  return { ...view, dispatchUi, onPostAction };
}

describe("Shadscan moderation composition evidence", () => {
  it("names the exact post action Button through the real Base UI render trigger", async () => {
    const view = renderModeration();
    const actions = view.getByRole("button", { name: "Open actions" });
    expect(actions.tagName).toBe("BUTTON");
    expect(actions.textContent?.trim()).toBe("");
    expect(actions.querySelector("svg")).not.toBeNull();
    fireEvent.click(actions);
    expect(await view.findByRole("menu")).toBeTruthy();
  });

  it("names and activates the icon-only clear search control", () => {
    const view = renderModeration("missions");
    fireEvent.click(view.getByRole("button", { name: "Clear search" }));
    expect(view.dispatchUi).toHaveBeenCalledExactlyOnceWith({
      type: "set_search_query",
      value: "",
    });
  });

  it("keeps the filter trigger named when its visible text is hidden on mobile", async () => {
    const view = renderModeration();
    const filter = view.getByRole("button", { name: "Filter posts" });
    expect(filter.getAttribute("aria-label")).toBe("Filter posts");
    fireEvent.click(filter);
    expect(await view.findByRole("menu")).toBeTruthy();
  });
});
