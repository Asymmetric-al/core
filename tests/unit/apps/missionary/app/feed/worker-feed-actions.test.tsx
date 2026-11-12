/** @vitest-environment jsdom */

import { act, cleanup, waitFor } from "@testing-library/react";
import { renderDraftHook as renderHook } from "../../../../fixtures/retained-drafts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("@asym/database/hooks", () => ({
  refreshPendingFollowRequestCount: mocks.refresh,
}));
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

import { useWorkerFeedPageView } from "../../../../../../apps/missionary/app/feed/use-worker-feed-page-view";

const published = {
  id: "post-1",
  post_type: "Story",
  title: "New classroom",
  content: "<p>We opened it.</p>",
  created_at: "2026-11-01T10:00:00.000Z",
  visibility: "partners_only",
  status: "published",
  media: [{ url: "https://images.unsplash.com/photo-1", type: "image" }],
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("scrollTo", vi.fn());
  fetchMock.mockImplementation(async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    if (url.startsWith("/api/posts?status=published"))
      return json(200, { posts: [published] });
    if (url.startsWith("/api/posts?status=draft"))
      return json(200, { posts: [] });
    if (url.startsWith("/api/follower-requests?"))
      return json(200, {
        requests: [
          {
            id: "req-1",
            name: "Logan Rivera",
            status: "pending",
            initials: "LR",
          },
        ],
      });
    if (url === "/api/posts" && method === "POST")
      return json(201, { post: { ...published, id: "post-2" } });
    if (url === "/api/posts/post-1" && method === "DELETE")
      return json(200, {});
    if (url === "/api/follower-requests/req-1") return json(200, {});
    throw new Error(`unexpected ${method} ${url}`);
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function ready() {
  const view = renderHook(() => useWorkerFeedPageView());
  await waitFor(() => expect(view.result.current.isLoading).toBe(false));
  await waitFor(() =>
    expect(view.result.current.isLoadingRequests).toBe(false),
  );
  return view;
}

describe("worker feed actions", () => {
  it("publishes a new update with its title, type and audience", async () => {
    const { result } = await ready();
    act(() => {
      result.current.setPostTitle("Water for every school");
      result.current.setPostType("Milestone");
      result.current.setPostPrivacy("partners");
      result.current.setPostContent("<p>All five schools have filters.</p>");
    });
    await act(async () => {
      await result.current.handlePost("published");
    });
    const call = fetchMock.mock.calls.find(
      ([url, init]) => url === "/api/posts" && init?.method === "POST",
    );
    expect(JSON.parse(String(call![1]!.body))).toMatchObject({
      title: "Water for every school",
      post_type: "Milestone",
      visibility: "partners",
      status: "published",
    });
    expect(result.current.postTitle).toBe("");
  });

  it("loads a post’s title, audience and photos when editing it, so saving keeps them", async () => {
    const { result } = await ready();
    act(() => result.current.handleEditDraft(result.current.posts[0]!));
    expect(result.current.postTitle).toBe("New classroom");
    expect(result.current.postPrivacy).toBe("partners");
    expect(result.current.selectedMedia).toEqual(published.media);
    act(() => result.current.cancelEditing());
    expect(result.current.editingPostId).toBeNull();
    expect(result.current.postTitle).toBe("");
  });

  it("asks before deleting, and deletes only once confirmed", async () => {
    const { result } = await ready();
    act(() => result.current.requestDeletePost("post-1"));
    expect(result.current.pendingDelete?.title).toBe("New classroom");
    act(() => result.current.cancelDeletePost());
    expect(result.current.pendingDelete).toBeNull();
    expect(
      fetchMock.mock.calls.some(([, init]) => init?.method === "DELETE"),
    ).toBe(false);

    act(() => result.current.requestDeletePost("post-1"));
    await act(async () => {
      await result.current.confirmDeletePost();
    });
    expect(result.current.posts).toEqual([]);
    expect(result.current.pendingDelete).toBeNull();
  });

  it("refreshes the follow-request count after accepting someone", async () => {
    const { result } = await ready();
    await act(async () => {
      await result.current.handleResolveRequest("req-1", true);
    });
    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(
      fetchMock.mock.calls.filter(
        ([url]) => url === "/api/follower-requests/req-1",
      ),
    ).toHaveLength(1);
  });

  it("asks before replacing unsaved writing with another post", async () => {
    const { result } = await ready();
    act(() => result.current.setPostContent("<p>Half-written thoughts</p>"));
    act(() => result.current.requestEditPost(result.current.posts[0]!));
    expect(result.current.pendingEdit?.id).toBe("post-1");
    expect(result.current.editingPostId).toBeNull();
    act(() => result.current.confirmEditPost());
    expect(result.current.editingPostId).toBe("post-1");
    expect(result.current.pendingEdit).toBeNull();
  });

  it("edits straight away when nothing is unsaved", async () => {
    const { result } = await ready();
    act(() => result.current.requestEditPost(result.current.posts[0]!));
    expect(result.current.editingPostId).toBe("post-1");
    expect(result.current.pendingEdit).toBeNull();
  });

  it("keeps failed draft and request loads distinct from empty lists", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("/api/posts?status=published"))
        return json(200, { posts: [] });
      if (url.startsWith("/api/posts?status=draft"))
        return json(500, { error: "down" });
      if (url.startsWith("/api/follower-requests?"))
        return json(500, { error: "down" });
      throw new Error(`unexpected ${url}`);
    });
    const { result } = await ready();
    await waitFor(() => expect(result.current.draftsError).toBe(true));
    expect(result.current.requestsError).toBe(true);
  });
});
