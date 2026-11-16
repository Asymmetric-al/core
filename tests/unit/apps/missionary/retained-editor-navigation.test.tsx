/** @vitest-environment jsdom */

import { QueryProvider, getQueryClient } from "@asym/database/providers";
import { RetainedDraftProvider } from "@asym/ui/hooks";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { useWorkerFeedPageView } from "../../../../apps/missionary/app/feed/use-worker-feed-page-view";
import { useProfilePageView } from "../../../../apps/missionary/app/profile/use-profile-page-view";
import {
  draftTestOwner,
  renderWithDrafts,
} from "../../fixtures/retained-drafts";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));
const fetchMock = vi.fn<typeof fetch>();
let profile: ReturnType<typeof useProfilePageView>;
let feed: ReturnType<typeof useWorkerFeedPageView>;

function ProfileEditor() {
  profile = useProfilePageView();
  return (
    <input
      aria-label="Profile location"
      value={profile.profile.location}
      onChange={(event) =>
        profile.updateProfile("location", event.target.value)
      }
    />
  );
}
function Composer() {
  feed = useWorkerFeedPageView();
  return (
    <input
      aria-label="Post content"
      value={feed.postContent}
      onChange={(event) => feed.setPostContent(event.target.value)}
    />
  );
}
function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  getQueryClient().clear();
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockImplementation(async (input) =>
    String(input) === "/api/profile"
      ? response({
          profile: { first_name: "Ada", missionary: { location: "London" } },
        })
      : response({ posts: [], requests: [] }),
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  getQueryClient().clear();
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

it("clears a saved composer revision even if its route remounts before completion", async () => {
  const view = renderWithDrafts(<Composer />);
  await waitFor(() => expect(feed.isLoading).toBe(false));
  fireEvent.change(screen.getByLabelText("Post content"), {
    target: { value: "Saved revision" },
  });
  let resolveSave!: (value: Response) => void;
  fetchMock.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveSave = resolve;
      }),
  );
  let pending!: Promise<void>;
  act(() => {
    pending = feed.handlePost("draft");
  });
  view.rerender(<p>Away</p>);
  view.rerender(<Composer />);
  await act(async () => {
    resolveSave(
      response({
        post: {
          id: "saved-post",
          content: "Saved revision",
          status: "draft",
          updated_at: "saved-version",
        },
      }),
    );
    await pending;
  });
  expect(screen.getByLabelText("Post content")).toHaveProperty("value", "");
  expect(feed.hasUnsavedWriting).toBe(false);
});

it("does not retain whitespace-only new composer content as dirty", async () => {
  renderWithDrafts(<Composer />);
  await waitFor(() => expect(feed.isLoading).toBe(false));
  fireEvent.change(screen.getByLabelText("Post content"), {
    target: { value: "<p> </p>" },
  });
  expect(feed.hasUnsavedWriting).toBe(false);
  const unload = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(unload);
  expect(unload.defaultPrevented).toBe(false);
});

it("clears retained profile content after authoritative read-access loss", async () => {
  renderWithDrafts(
    <QueryProvider>
      <ProfileEditor />
    </QueryProvider>,
  );
  await waitFor(() => expect(profile.isLoading).toBe(false));
  fireEvent.change(screen.getByLabelText("Profile location"), {
    target: { value: "Private location" },
  });
  fetchMock.mockResolvedValueOnce(response({ error: "Access removed" }, 403));
  await act(async () => {
    await getQueryClient().invalidateQueries({ queryKey: ["profile"] });
  });
  expect(screen.getByLabelText("Profile location")).toHaveProperty("value", "");
  expect(profile.canWrite).toBe(false);
  expect(profile.canRead).toBe(false);
  const unload = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(unload);
  expect(unload.defaultPrevented).toBe(false);
});

it("clears composer content and exposes unavailable read access after a feed denial", async () => {
  renderWithDrafts(<Composer />);
  await waitFor(() => expect(feed.isLoading).toBe(false));
  fireEvent.change(screen.getByLabelText("Post content"), {
    target: { value: "Private writing" },
  });
  fetchMock.mockResolvedValueOnce(response({ error: "Access removed" }, 403));
  await act(async () => feed.reloadPosts());
  expect(feed.canRead).toBe(false);
  expect(feed.postContent).toBe("");
  expect(feed.hasUnsavedWriting).toBe(false);
});

it("does not autosave on rights regain after eviction, but rearms after an explicit edit", async () => {
  const savedDraft = {
    id: "existing",
    title: "",
    content: "Saved writing",
    post_type: "Update",
    visibility: "public",
    status: "draft",
    media: [],
    updated_at: "one",
  };
  fetchMock.mockImplementation(async (input, init) =>
    init?.method === "PATCH"
      ? response({
          post: { ...savedDraft, content: "Explicit edit", updated_at: "two" },
        })
      : response({
          posts: String(input).includes("status=draft") ? [savedDraft] : [],
          requests: [],
        }),
  );
  function AccessView({
    writable = true,
    away = false,
  }: {
    writable?: boolean;
    away?: boolean;
  }) {
    return (
      <RetainedDraftProvider owner={draftTestOwner} writable={writable}>
        {away ? <p>Away</p> : <Composer />}
      </RetainedDraftProvider>
    );
  }
  const view = render(<AccessView />);
  await waitFor(() => expect(feed.isLoadingDrafts).toBe(false));
  act(() => feed.handleEditDraft(feed.drafts[0]!));
  expect(feed.hasUnsavedWriting).toBe(false);
  const cleanUnload = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(cleanUnload);
  expect(cleanUnload.defaultPrevented).toBe(false);
  fireEvent.change(screen.getByLabelText("Post content"), {
    target: { value: "Retained edit" },
  });
  vi.useFakeTimers();
  view.rerender(<AccessView writable={false} />);
  view.rerender(<AccessView away />);
  view.rerender(<AccessView />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(31000);
  });
  expect(feed.postContent).toBe("Retained edit");
  expect(
    fetchMock.mock.calls.some(([, init]) => init?.method === "PATCH"),
  ).toBe(false);
  fireEvent.change(screen.getByLabelText("Post content"), {
    target: { value: "Explicit edit" },
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(31000);
  });
  expect(
    fetchMock.mock.calls.filter(([, init]) => init?.method === "PATCH"),
  ).toHaveLength(1);
  expect(feed.hasUnsavedWriting).toBe(false);
});

it("restores missionary profile edits after five routes and a failed save", async () => {
  const view = renderWithDrafts(
    <QueryProvider>
      <ProfileEditor />
    </QueryProvider>,
  );
  await waitFor(() => expect(profile.isLoading).toBe(false));
  fireEvent.change(screen.getByLabelText("Profile location"), {
    target: { value: "Paris" },
  });
  fetchMock.mockResolvedValueOnce(response({ error: "Conflict" }, 409));
  await act(async () => profile.handleSave());
  for (let route = 1; route <= 5; route += 1)
    view.rerender(<p>Route {route}</p>);
  view.rerender(
    <QueryProvider>
      <ProfileEditor />
    </QueryProvider>,
  );
  expect(screen.getByLabelText("Profile location")).toHaveProperty(
    "value",
    "Paris",
  );
  act(() => profile.handleDiscard());
  view.rerender(<p>Away</p>);
  view.rerender(
    <QueryProvider>
      <ProfileEditor />
    </QueryProvider>,
  );
  expect(screen.getByLabelText("Profile location")).toHaveProperty(
    "value",
    "London",
  );
});

it("retains composer context and newer writing across eviction during a save", async () => {
  const view = renderWithDrafts(<Composer />);
  await waitFor(() => expect(feed.isLoading).toBe(false));
  fireEvent.change(screen.getByLabelText("Post content"), {
    target: { value: "First revision" },
  });
  let resolveSave!: (value: Response) => void;
  fetchMock.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveSave = resolve;
      }),
  );
  let pending!: Promise<void>;
  act(() => {
    pending = feed.handlePost("draft");
  });
  for (let route = 1; route <= 5; route += 1)
    view.rerender(<p>Route {route}</p>);
  view.rerender(<Composer />);
  expect(screen.getByLabelText("Post content")).toHaveProperty(
    "value",
    "First revision",
  );
  fireEvent.change(screen.getByLabelText("Post content"), {
    target: { value: "New revision" },
  });
  await act(async () => {
    resolveSave(
      response({
        post: {
          id: "saved-draft",
          title: "",
          content: "First revision",
          post_type: "Update",
          visibility: "public",
          status: "draft",
          updated_at: "revision-one",
        },
      }),
    );
    await pending;
  });
  view.rerender(<p>Away</p>);
  view.rerender(<Composer />);
  expect(screen.getByLabelText("Post content")).toHaveProperty(
    "value",
    "New revision",
  );
  act(() => feed.cancelEditing());
  view.rerender(<p>Away</p>);
  view.rerender(<Composer />);
  expect(screen.getByLabelText("Post content")).toHaveProperty("value", "");
});

it("saves the retained revision when an old profile drain continues after remount", async () => {
  const editor = (
    <QueryProvider>
      <ProfileEditor />
    </QueryProvider>
  );
  const view = renderWithDrafts(editor);
  await waitFor(() => expect(profile.isLoading).toBe(false));
  let resolveFirst!: (value: Response) => void;
  const patches: Record<string, unknown>[] = [];
  fetchMock.mockImplementation(async (_input, init) => {
    if (init?.method === "PATCH") {
      patches.push(JSON.parse(String(init.body)));
      if (patches.length === 1)
        return new Promise<Response>((resolve) => {
          resolveFirst = resolve;
        });
    }
    return response({
      profile: { first_name: "Ada", missionary: { location: "London" } },
    });
  });
  act(() => profile.updateProfile("location", "A"));
  let pending!: Promise<void>;
  act(() => {
    pending = profile.handleSave();
  });
  act(() => profile.updateProfile("location", "B"));
  act(() => {
    void profile.handleSave();
  });
  view.rerender(<p>Away</p>);
  view.rerender(editor);
  act(() => profile.updateProfile("location", "C"));
  await act(async () => {
    resolveFirst(response({}));
    await pending;
  });
  expect(patches.map((patch) => patch.location)).toEqual(["A", "C"]);
  expect(profile.profile.location).toBe("C");
});

it("does not dispatch a queued publish after the composer is discarded", async () => {
  const draft = {
    id: "cancel-queued-publish",
    title: "",
    content: "Original",
    post_type: "Update",
    visibility: "public",
    status: "draft",
    updated_at: "v1",
  };
  let resolveAutosave!: (value: Response) => void;
  const patches: Record<string, unknown>[] = [];
  fetchMock.mockImplementation(async (input, init) => {
    if (init?.method === "PATCH") {
      patches.push(JSON.parse(String(init.body)));
      return new Promise<Response>((resolve) => {
        resolveAutosave = resolve;
      });
    }
    return response({
      posts: String(input).includes("status=draft") ? [draft] : [],
      requests: [],
    });
  });
  renderWithDrafts(<Composer />);
  await waitFor(() => expect(feed.isLoadingDrafts).toBe(false));
  act(() => feed.handleEditDraft(feed.drafts[0]!));
  vi.useFakeTimers();
  act(() => feed.setPostContent("Ready to publish"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(31000);
  });
  expect(patches).toHaveLength(1);
  let publishing!: Promise<void>;
  act(() => {
    publishing = feed.handlePost("published");
  });
  act(() => feed.cancelEditing());
  await act(async () => {
    resolveAutosave(
      response({
        post: { ...draft, content: "Ready to publish", updated_at: "v2" },
      }),
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(patches.some((patch) => patch.status === "published")).toBe(false);
  await act(async () => {
    await publishing;
  });
  expect(feed.postContent).toBe("");
});
