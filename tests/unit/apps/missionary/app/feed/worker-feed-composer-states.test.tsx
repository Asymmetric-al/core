// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";

const view = vi.hoisted(() => ({
  canWrite: true,
  editingPostId: null as string | null,
  selectedMedia: [] as { url: string; type: "image" }[],
  postContent: "",
  editorProps: {} as { disabled?: boolean; readOnly?: boolean },
  handlePost: vi.fn(),
  setPostType: vi.fn(),
  setPostTitle: vi.fn(),
  setPostPrivacy: vi.fn(),
  setSelectedMedia: vi.fn(),
  cancelEditing: vi.fn(),
}));

// The editor loads lazily; the stand-in records its props and renders the
// shared editor the dynamic import would load.
vi.mock("next/dynamic", async () => {
  const { LegacyRichTextEditor } =
    await import("../../../../../../packages/ui/components/shadcn/rich-text-editor/legacy-rich-text-editor");
  return {
    default: () =>
      function EditorStandIn(
        props: React.ComponentProps<typeof LegacyRichTextEditor>,
      ) {
        view.editorProps = props;
        return <LegacyRichTextEditor {...props} />;
      },
  };
});
vi.mock(
  "../../../../../../apps/missionary/app/feed/feed-follow-requests",
  () => ({ FollowerRequestsCard: () => null }),
);
vi.mock(
  "../../../../../../apps/missionary/app/feed/use-worker-feed-page-view",
  async () => {
    const { useState } = await import("react");
    return {
      useWorkerFeedPageView: () => {
        const [editingPostId, setEditingPostId] = useState(view.editingPostId);
        return {
          canRead: true,
          canWrite: view.canWrite,
          hasUnsavedWriting: true,
          postType: "Update",
          setPostType: view.setPostType,
          postTitle: "Clinic opening",
          setPostTitle: view.setPostTitle,
          postContent: view.postContent,
          setPostContent: vi.fn(),
          activeTab: "published",
          setActiveTab: vi.fn(),
          editingPostId,
          postPrivacy: "public",
          setPostPrivacy: view.setPostPrivacy,
          selectedMedia: view.selectedMedia,
          setSelectedMedia: view.setSelectedMedia,
          lastSaved: null,
          isLoading: false,
          isSaving: false,
          isUploading: false,
          isLoadingRequests: false,
          isLoadingDrafts: false,
          isDeleting: false,
          deleteError: null,
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
          cancelEditing: () => {
            view.cancelEditing();
            setEditingPostId(null);
          },
          handlePost: view.handlePost,
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
  vi.clearAllMocks();
  view.canWrite = true;
  view.editingPostId = null;
  view.selectedMedia = [];
  view.postContent = "";
  view.editorProps = {};
});

function describedBy(element: HTMLElement) {
  return (element.getAttribute("aria-describedby") ?? "").split(/\s+/);
}

function renderReadOnly() {
  view.canWrite = false;
  view.selectedMedia = [{ url: "/test-photo.png", type: "image" }];
  view.postContent = "<p>The clinic opens on Monday.</p>";
  render(<WorkerFeed />);
  const notice = screen.getByText(/Your updates are read-only/);
  expect(notice.id).not.toBe("");
  return notice;
}

it("sets the read-only notice in the composer's content, in the card's muted small text", () => {
  const notice = renderReadOnly();
  expect(notice.getAttribute("role")).toBe("status");
  // Inside the content spacing, ahead of the controls it describes.
  const content = notice.closest('[data-slot="card-content"]');
  expect(content).not.toBeNull();
  expect(content!.firstElementChild).toBe(notice);
  expect(notice.className.split(" ")).toEqual(
    expect.arrayContaining(["text-sm", "text-muted-foreground"]),
  );
});

it("makes the title read-only and says why when write access is revoked", () => {
  const notice = renderReadOnly();
  const title = screen.getByRole<HTMLInputElement>("textbox", {
    name: "Title",
  });
  expect(title.readOnly).toBe(true);
  expect(title.value).toBe("Clinic opening");
  expect(describedBy(title)).toContain(notice.id);
});

it("disables the type of update when write access is revoked", () => {
  renderReadOnly();
  const group = screen.getByRole("group", { name: "Type of update" });
  const chips = within(group).getAllByRole<HTMLButtonElement>("button");
  for (const chip of chips) expect(chip.disabled).toBe(true);
  fireEvent.click(chips[1]!);
  expect(view.setPostType).not.toHaveBeenCalled();
});

it("shows the kept draft read-only at full strength, described by the notice", async () => {
  const notice = renderReadOnly();
  const editor = await screen.findByRole("textbox", {
    name: "Ministry post content",
  });
  expect(editor.textContent).toBe("The clinic opens on Monday.");
  expect(editor.getAttribute("aria-readonly")).toBe("true");
  expect(editor.getAttribute("contenteditable")).toBe("false");
  expect(describedBy(editor)).toContain(notice.id);
  // Disabled would dim the whole editor, draft included, below readable contrast.
  expect(view.editorProps.disabled).toBeFalsy();
  expect(editor.closest(".opacity-50")).toBeNull();
  expect(document.querySelector(".opacity-50")).toBeNull();
});

it("keeps Save draft and Publish in the read-only editor, reachable but unusable, and says why", async () => {
  const notice = renderReadOnly();
  await screen.findByRole("textbox", { name: "Ministry post content" });
  // A read-only editor drops its formatting controls; its actions row stays.
  expect(screen.queryByRole("toolbar", { name: "Text formatting" })).toBeNull();
  for (const name of ["Save draft", "Publish"]) {
    const [action, ...extra] = screen.getAllByRole<HTMLButtonElement>(
      "button",
      { name, exact: true },
    );
    expect(extra).toHaveLength(0);
    expect(action!.closest('[data-slot="editor-toolbar"]')).not.toBeNull();
    expect(action!.getAttribute("aria-disabled")).toBe("true");
    expect(action!.disabled).toBe(false);
    expect(describedBy(action!)).toContain(notice.id);
    act(() => action!.focus());
    expect(document.activeElement).toBe(action);
    fireEvent.click(action!);
  }
  expect(view.handlePost).not.toHaveBeenCalled();
});

it("keeps the kept draft's word count readable while read-only", async () => {
  renderReadOnly();
  await screen.findByRole("textbox", { name: "Ministry post content" });
  const count = screen.getByText("5 words");
  expect(count.closest(".opacity-50")).toBeNull();
  // The editor counts its own words, as it does while writable.
  expect(count.closest('[data-slot="editor-toolbar"]')).not.toBeNull();
});

it("counts the read-only draft's words as the editor does", async () => {
  // Paragraphs part words; a mark inside a word does not.
  view.postContent = JSON.stringify({
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "The clinic" }] },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "opens on Mon" },
          { type: "text", text: "day", marks: [{ type: "bold" }] },
          { type: "hardBreak" },
          { type: "text", text: "at nine." },
        ],
      },
    ],
  });
  const { unmount } = render(<WorkerFeed />);
  expect(await screen.findByText("7 words")).toBeTruthy();
  unmount();

  view.canWrite = false;
  render(<WorkerFeed />);
  await screen.findByRole("textbox", { name: "Ministry post content" });
  expect(screen.getByText("7 words")).toBeTruthy();
});

it("keeps Save draft in place, and focused, when write access is revoked under it", async () => {
  view.postContent = "<p>The clinic opens on Monday.</p>";
  const { rerender } = render(<WorkerFeed />);
  const save = await screen.findByRole("button", { name: "Save draft" });
  expect(save.closest('[data-slot="editor-toolbar"]')).not.toBeNull();
  act(() => save.focus());

  view.canWrite = false;
  rerender(<WorkerFeed />);
  expect(screen.getByRole("button", { name: "Save draft" })).toBe(save);
  expect(save.closest('[data-slot="editor-toolbar"]')).not.toBeNull();
  expect(save.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(save);
});

it("keeps the audience and photo controls focusable but unusable, and says why", () => {
  const notice = renderReadOnly();

  const audience = screen.getByRole<HTMLButtonElement>("button", {
    name: /Who can see this/,
  });
  expect(audience.getAttribute("aria-disabled")).toBe("true");
  expect(audience.disabled).toBe(false);
  expect(describedBy(audience)).toContain(notice.id);
  act(() => audience.focus());
  expect(document.activeElement).toBe(audience);
  fireEvent.click(audience);
  fireEvent.keyDown(audience, { key: "ArrowDown" });
  expect(screen.queryByRole("menu")).toBeNull();

  const remove = screen.getByRole<HTMLButtonElement>("button", {
    name: "Remove attached photo 1",
  });
  expect(remove.getAttribute("aria-disabled")).toBe("true");
  expect(remove.disabled).toBe(false);
  expect(describedBy(remove)).toContain(notice.id);
  fireEvent.click(remove);
  expect(view.setSelectedMedia).not.toHaveBeenCalled();
  expect(screen.getByAltText("Attached photo 1")).toBeTruthy();
});

it("leaves the composer usable and undescribed while write access holds", async () => {
  view.selectedMedia = [{ url: "/test-photo.png", type: "image" }];
  render(<WorkerFeed />);
  expect(screen.queryByText(/read-only/)).toBeNull();
  const title = screen.getByRole<HTMLInputElement>("textbox", {
    name: "Title",
  });
  expect(title.readOnly).toBe(false);
  expect(title.hasAttribute("aria-describedby")).toBe(false);
  expect(view.editorProps.disabled).toBeFalsy();
  expect(view.editorProps.readOnly).toBeFalsy();
  const editor = await screen.findByRole("textbox", {
    name: "Ministry post content",
  });
  expect(editor.hasAttribute("aria-describedby")).toBe(false);
  const audience = screen.getByRole("button", { name: /Who can see this/ });
  expect(audience.hasAttribute("aria-disabled")).toBe(false);
  expect(audience.hasAttribute("aria-describedby")).toBe(false);
  fireEvent.click(audience);
  expect(await screen.findByRole("menu")).toBeTruthy();
  fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
  fireEvent.click(
    screen.getByRole("button", { name: "Remove attached photo 1" }),
  );
  expect(view.setSelectedMedia).toHaveBeenCalledOnce();
});

it("moves focus to the composer heading when editing is cancelled", () => {
  view.editingPostId = "post-1";
  render(<WorkerFeed />);
  const cancel = screen.getByRole("button", { name: "Cancel editing" });
  act(() => cancel.focus());
  fireEvent.click(cancel);
  expect(view.cancelEditing).toHaveBeenCalledOnce();
  expect(screen.queryByRole("button", { name: "Cancel editing" })).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { name: "Share an update" }),
  );
});
