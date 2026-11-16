"use client";

import { refreshPendingFollowRequestCount } from "@asym/database/hooks";
import { fetchJsonResult, fetchResult } from "@asym/lib/http/fetch-result";
import { isPostContentEmpty } from "@asym/ui/components/shadcn/rich-text-editor";
import { useRetainedDraft } from "@asym/ui/hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { normalizeVisibility, placeSavedPost } from "./feed-model";
import { writeExistingPost } from "./post-write-queue";

import type {
  FollowerRequest,
  Post,
  PostStatus,
  Visibility,
  WorkerFeedUiState,
} from "./feed-model";
import type { MediaItem } from "@asym/database/types";
import type { FetchFailure } from "@asym/lib/http/fetch-result";
import type { SetStateAction } from "react";

/** Keep console output an Error instance regardless of the failure kind. */
function toError(failure: FetchFailure): Error {
  if (failure.kind !== "http" && failure.cause instanceof Error) {
    return failure.cause;
  }
  return new Error(failure.message);
}

function publishedFeedErrorMessage(failure: FetchFailure): string {
  if (failure.kind === "http") {
    return `Failed to load published posts (${failure.status})`;
  }
  return failure.message;
}

type WorkerFeedPageViewModel = {
  canRead: boolean;
  canWrite: boolean;
  postType: string;
  postTitle: string;
  postContent: string;
  activeTab: PostStatus;
  isLoading: boolean;
  isSaving: boolean;
  editingPostId: string | null;
  lastSaved: Date | null;
  postPrivacy: Visibility;
  selectedMedia: MediaItem[];
  isUploading: boolean;
  isLoadingRequests: boolean;
  setPostType: (value: SetStateAction<string>) => void;
  setPostTitle: (value: SetStateAction<string>) => void;
  setPostContent: (value: SetStateAction<string>) => void;
  setActiveTab: (value: SetStateAction<PostStatus>) => void;
  setEditingPostId: (value: SetStateAction<string | null>) => void;
  setPostPrivacy: (value: SetStateAction<Visibility>) => void;
  setSelectedMedia: (value: SetStateAction<MediaItem[]>) => void;
  posts: Post[];
  drafts: Post[];
  pendingRequests: FollowerRequest[];
  feedError: string | null;
  /** True when drafts couldn't be loaded (not the same as having none). */
  draftsError: boolean;
  /** True until drafts have loaded, so the tab never claims there are none. */
  isLoadingDrafts: boolean;
  /** Writing in the composer that leaving the page would lose. */
  hasUnsavedWriting: boolean;
  /** True when follow requests couldn't be loaded. */
  requestsError: boolean;
  reloadPosts: () => Promise<void>;
  reloadDrafts: () => Promise<void>;
  reloadRequests: () => Promise<void>;
  /** Another post the missionary asked to edit while writing unsaved work. */
  pendingEdit: Post | null;
  requestEditPost: (post: Post) => void;
  confirmEditPost: () => void;
  cancelEditPost: () => void;
  handlePost: (status?: PostStatus) => Promise<void>;
  handleEditDraft: (draft: Post) => void;
  cancelEditing: () => void;
  /** The update waiting for delete confirmation, if any. */
  pendingDelete: Post | null;
  isDeleting: boolean;
  requestDeletePost: (postId: string) => void;
  cancelDeletePost: () => void;
  confirmDeletePost: () => Promise<void>;
  handleResolveRequest: (id: string, approved: boolean) => Promise<void>;
};

type ComposerDraft = Pick<
  WorkerFeedUiState,
  | "postType"
  | "postTitle"
  | "postContent"
  | "editingPostId"
  | "postPrivacy"
  | "selectedMedia"
> & { expectedUpdatedAt: string | null };

const emptyComposer: ComposerDraft = {
  postType: "Update",
  postTitle: "",
  postContent: "",
  editingPostId: null,
  postPrivacy: "public",
  selectedMedia: [],
  expectedUpdatedAt: null,
};

function composerSnapshot(
  state: WorkerFeedUiState,
  expectedUpdatedAt: string | null,
): ComposerDraft {
  return {
    postType: state.postType,
    postTitle: state.postTitle,
    postContent: state.postContent,
    editingPostId: state.editingPostId,
    postPrivacy: state.postPrivacy,
    selectedMedia: state.selectedMedia,
    expectedUpdatedAt,
  };
}

const composerFields = new Set<keyof WorkerFeedUiState>([
  "postType",
  "postTitle",
  "postContent",
  "editingPostId",
  "postPrivacy",
  "selectedMedia",
]);

export function useWorkerFeedPageView(): WorkerFeedPageViewModel {
  const {
    value: retained,
    dirty: hasUnsavedWriting,
    read: readDraft,
    update: retainDraft,
    discard: discardDraft,
    beginSave,
    finishSave,
    canRead,
    canWrite,
    canAutosave,
    isCurrent,
    isSaving: retainedSaving,
    revokeRead,
    revokeWrite,
  } = useRetainedDraft<ComposerDraft>("missionary-feed-composer");
  const [uiState, setUiState] = useState<WorkerFeedUiState>({
    postType: "Update",
    postTitle: "",
    postContent: "",
    activeTab: "published",
    isLoading: true,
    isSaving: false,
    editingPostId: null,
    lastSaved: null,
    postPrivacy: "public",
    selectedMedia: [],
    isUploading: false,
    isLoadingRequests: true,
    ...retained,
  });
  const uiStateRef = useRef(uiState);
  const revisions = useRef(new Map<string, string | null>());
  const manualSaving = useRef(false);
  const {
    postType,
    postTitle,
    postContent,
    activeTab,
    isLoading,
    isSaving,
    editingPostId,
    lastSaved,
    postPrivacy,
    selectedMedia,
    isUploading,
    isLoadingRequests,
  } = { ...uiState, ...emptyComposer, ...retained };

  const setUiField = useCallback(
    <K extends keyof WorkerFeedUiState>(
      key: K,
      value: React.SetStateAction<WorkerFeedUiState[K]>,
    ) => {
      if (composerFields.has(key) && !canWrite) return;
      const previous = {
        ...uiStateRef.current,
        ...emptyComposer,
        ...readDraft(),
      };
      const next = {
        ...previous,
        [key]:
          typeof value === "function"
            ? (
                value as (
                  prevValue: WorkerFeedUiState[K],
                ) => WorkerFeedUiState[K]
              )(previous[key])
            : value,
      };
      uiStateRef.current = next;
      if (composerFields.has(key)) {
        const previousDraft = readDraft();
        const snapshot = composerSnapshot(
          next,
          next.editingPostId
            ? previousDraft?.editingPostId === next.editingPostId
              ? previousDraft.expectedUpdatedAt
              : (revisions.current.get(next.editingPostId) ?? null)
            : null,
        );
        const dirty =
          manualSaving.current ||
          snapshot.editingPostId !== null ||
          snapshot.postTitle.trim().length > 0 ||
          !isPostContentEmpty(snapshot.postContent) ||
          snapshot.postType !== emptyComposer.postType ||
          snapshot.postPrivacy !== emptyComposer.postPrivacy ||
          snapshot.selectedMedia.length > 0;
        retainDraft(snapshot, { dirty });
      }
      setUiState(next);
    },
    [canWrite, readDraft, retainDraft],
  );

  const setPostType = useCallback(
    (value: React.SetStateAction<string>) => setUiField("postType", value),
    [setUiField],
  );
  const setPostTitle = useCallback(
    (value: React.SetStateAction<string>) => setUiField("postTitle", value),
    [setUiField],
  );
  const setPostContent = useCallback(
    (value: React.SetStateAction<string>) => setUiField("postContent", value),
    [setUiField],
  );
  const setActiveTab = useCallback(
    (value: React.SetStateAction<PostStatus>) => setUiField("activeTab", value),
    [setUiField],
  );
  const setIsLoading = useCallback(
    (value: React.SetStateAction<boolean>) => setUiField("isLoading", value),
    [setUiField],
  );
  const setIsSaving = useCallback(
    (value: React.SetStateAction<boolean>) => setUiField("isSaving", value),
    [setUiField],
  );
  const setEditingPostId = useCallback(
    (value: React.SetStateAction<string | null>) =>
      setUiField("editingPostId", value),
    [setUiField],
  );
  const setLastSaved = useCallback(
    (value: React.SetStateAction<Date | null>) =>
      setUiField("lastSaved", value),
    [setUiField],
  );
  const setPostPrivacy = useCallback(
    (value: React.SetStateAction<Visibility>) =>
      setUiField("postPrivacy", value),
    [setUiField],
  );
  const setSelectedMedia = useCallback(
    (value: React.SetStateAction<MediaItem[]>) =>
      setUiField("selectedMedia", value),
    [setUiField],
  );
  const setIsLoadingRequests = useCallback(
    (value: React.SetStateAction<boolean>) =>
      setUiField("isLoadingRequests", value),
    [setUiField],
  );

  const publishedRequestSequenceRef = useRef(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [draftsError, setDraftsError] = useState(false);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [requestsError, setRequestsError] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<Post | null>(null);
  const [followerRequests, setFollowerRequests] = useState<FollowerRequest[]>(
    [],
  );

  const pendingRequests = useMemo(
    () => followerRequests.filter((f) => f.status === "pending"),
    [followerRequests],
  );

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Requests go through the never-throwing fetch helpers, so no try/finally
  // is needed (the React Compiler cannot lower those yet). Every state
  // update happens after an await. `isLoading` and `isLoadingRequests`
  // start as true for the initial effect, so nothing is set synchronously
  // there. `reloadPosts` may flip `isLoading` before the published refetch.
  // Initial loads stay declared inside the effect so react-hooks/set-state-in-effect
  // does not treat hook-level callbacks as synchronous setState.
  const loadPosts = useCallback(
    async (status: PostStatus) => {
      const requestSequence =
        status === "published" ? ++publishedRequestSequenceRef.current : null;
      if (status === "published") setFeedError(null);
      const result = await fetchJsonResult<{ posts?: Post[] }>(
        `/api/posts?status=${status}`,
      );
      if (!isCurrent()) return;
      if (
        requestSequence !== null &&
        requestSequence !== publishedRequestSequenceRef.current
      )
        return;
      if (result.ok) {
        if (status === "published") {
          setPosts(result.data.posts || []);
          setFeedError(null);
        } else {
          setDrafts(result.data.posts || []);
          setDraftsError(false);
        }
      } else {
        if (
          result.error.kind === "http" &&
          (result.error.status === 401 || result.error.status === 403)
        )
          revokeRead();
        console.error("Failed to fetch posts:", toError(result.error));
        if (status === "published") {
          setFeedError(publishedFeedErrorMessage(result.error));
        } else {
          setDraftsError(true);
        }
        toast.error("Could not load feed", { id: "worker-feed-load-error" });
      }
      if (status === "published") {
        setIsLoading(false);
      } else {
        setIsLoadingDrafts(false);
      }
    },
    [isCurrent, revokeRead, setIsLoading],
  );

  const reloadPosts = useCallback(async () => {
    setIsLoading(true);
    await loadPosts("published");
  }, [loadPosts, setIsLoading]);

  const reloadDrafts = useCallback(async () => {
    setIsLoadingDrafts(true);
    await loadPosts("draft");
  }, [loadPosts]);

  const loadFollowerRequests = useCallback(async () => {
    const result = await fetchJsonResult<{ requests?: FollowerRequest[] }>(
      "/api/follower-requests?status=pending",
    );
    if (result.ok) {
      setFollowerRequests(result.data.requests || []);
      setRequestsError(false);
    } else {
      console.error(
        "Failed to fetch follower requests:",
        toError(result.error),
      );
      setRequestsError(true);
    }
  }, []);

  const reloadRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    await loadFollowerRequests();
    setIsLoadingRequests(false);
  }, [loadFollowerRequests, setIsLoadingRequests]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialPosts = async (status: PostStatus) => {
      const requestSequence =
        status === "published" ? ++publishedRequestSequenceRef.current : null;
      const result = await fetchJsonResult<{ posts?: Post[] }>(
        `/api/posts?status=${status}`,
      );
      if (
        cancelled ||
        !isCurrent() ||
        (requestSequence !== null &&
          requestSequence !== publishedRequestSequenceRef.current)
      )
        return;
      if (result.ok) {
        if (status === "published") {
          setPosts(result.data.posts || []);
          setFeedError(null);
        } else {
          setDrafts(result.data.posts || []);
          setDraftsError(false);
        }
      } else {
        if (
          result.error.kind === "http" &&
          (result.error.status === 401 || result.error.status === 403)
        )
          revokeRead();
        console.error("Failed to fetch posts:", toError(result.error));
        if (status === "published") {
          setFeedError(publishedFeedErrorMessage(result.error));
        } else {
          setDraftsError(true);
        }
        toast.error("Could not load feed", { id: "worker-feed-load-error" });
      }
      if (status === "published") {
        setIsLoading(false);
      } else {
        setIsLoadingDrafts(false);
      }
    };

    const loadInitialFollowerRequests = async () => {
      const result = await fetchJsonResult<{ requests?: FollowerRequest[] }>(
        "/api/follower-requests?status=pending",
      );
      if (cancelled) return;
      if (result.ok) {
        setFollowerRequests(result.data.requests || []);
      } else {
        console.error(
          "Failed to fetch follower requests:",
          toError(result.error),
        );
        setRequestsError(true);
        toast.error("Could not load follower requests", {
          id: "worker-feed-follower-requests-load-error",
        });
      }
      setIsLoadingRequests(false);
    };

    void loadInitialPosts("published");
    void loadInitialPosts("draft");
    void loadInitialFollowerRequests();

    return () => {
      cancelled = true;
      publishedRequestSequenceRef.current += 1;
    };
  }, [isCurrent, revokeRead, setIsLoading, setIsLoadingRequests]);

  const resetComposer = useCallback(() => {
    discardDraft();
    const next = { ...uiStateRef.current, ...emptyComposer };
    uiStateRef.current = next;
    setUiState(next);
  }, [discardDraft]);

  const prepareSave = useCallback(
    (automatic = false) => {
      if (!canWrite || !isCurrent()) return null;
      const current = readDraft();
      if (!current)
        retainDraft(
          composerSnapshot(
            uiStateRef.current,
            editingPostId
              ? (revisions.current.get(editingPostId) ?? null)
              : null,
          ),
        );
      return beginSave({ automatic });
    },
    [beginSave, canWrite, editingPostId, isCurrent, readDraft, retainDraft],
  );

  const handlePost = useCallback(
    async (status: PostStatus = "published") => {
      if (manualSaving.current || !canWrite || isPostContentEmpty(postContent))
        return;
      const save = prepareSave();
      if (!save) return;
      const snapshot = save.value;

      manualSaving.current = true;
      setIsSaving(true);
      const updates = {
        title: snapshot.postTitle,
        content: snapshot.postContent,
        post_type: snapshot.postType,
        visibility: snapshot.postPrivacy,
        status,
        media: snapshot.selectedMedia,
      };
      const result = snapshot.editingPostId
        ? await writeExistingPost(
            snapshot.editingPostId,
            updates,
            snapshot.expectedUpdatedAt,
            save.canDispatch,
          )
        : await fetchJsonResult<{ post: Post }>("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

      if (!save.isCurrent()) {
        finishSave(save, false);
        manualSaving.current = false;
        setIsSaving(false);
        return;
      }
      if (result.ok) {
        const { post } = result.data;
        const matched = finishSave(save, true, (current) => ({
          ...current,
          editingPostId: post.id,
          expectedUpdatedAt: post.updated_at ?? null,
        }));
        revisions.current.set(post.id, post.updated_at ?? null);
        const wasPublished = posts.some((item) => item.id === post.id);
        const published = (post.status ?? status) === "published";
        // The post joins the list for its saved status, whichever tab is open.
        setPosts((prev) => placeSavedPost(prev, post, published));
        setDrafts((prev) => placeSavedPost(prev, post, !published));

        if (published) {
          toast.success(wasPublished ? "Changes saved" : "Update published");
        } else {
          setLastSaved(new Date());
          toast.success("Draft saved");
        }

        if (matched) resetComposer();
      } else {
        finishSave(save, false);
        if (result.error.kind === "http" && result.error.status === 401)
          revokeRead();
        if (result.error.kind === "http" && result.error.status === 403)
          revokeWrite();
        toast.error("Couldn’t save your update. Try again.");
      }
      manualSaving.current = false;
      setIsSaving(false);
    },
    [
      canWrite,
      finishSave,
      prepareSave,
      resetComposer,
      revokeRead,
      revokeWrite,
      postContent,
      posts,
      setIsSaving,
      setLastSaved,
    ],
  );

  // Autosave writes status "draft", so it only runs while editing an existing
  // draft; otherwise it would create drafts unasked or unpublish a post.
  const isEditingDraft =
    editingPostId !== null &&
    drafts.some((draft) => draft.id === editingPostId);

  // Unlike handlePost, autosave leaves the composer as it is.
  const autosaveDraft = useCallback(async () => {
    if (!editingPostId || manualSaving.current || !canAutosave) return;
    const save = prepareSave(true);
    if (!save) return;
    const snapshot = save.value;
    const result = await writeExistingPost(
      editingPostId,
      {
        title: snapshot.postTitle,
        content: snapshot.postContent,
        post_type: snapshot.postType,
        visibility: snapshot.postPrivacy,
        status: "draft",
        autosave: true,
        media: snapshot.selectedMedia,
      },
      snapshot.expectedUpdatedAt,
      save.canDispatch,
    );
    if (!save.isCurrent() || !result.ok) {
      finishSave(save, false);
      if (!result.ok && save.isCurrent() && result.error.kind === "http") {
        if (result.error.status === 401) revokeRead();
        if (result.error.status === 403) revokeWrite();
      }
      return;
    }
    const { post } = result.data;
    finishSave(
      save,
      true,
      (current) => ({ ...current, expectedUpdatedAt: post.updated_at ?? null }),
      { retain: true },
    );
    revisions.current.set(post.id, post.updated_at ?? null);
    setDrafts((prev) => placeSavedPost(prev, post, true));
    setLastSaved(new Date());
  }, [
    canAutosave,
    finishSave,
    prepareSave,
    revokeRead,
    revokeWrite,
    editingPostId,
    setLastSaved,
  ]);

  useEffect(() => {
    if (
      isPostContentEmpty(postContent) ||
      isSaving ||
      !isEditingDraft ||
      !canAutosave
    )
      return;

    const timer = setTimeout(() => {
      void autosaveDraft();
    }, 30000);

    return () => clearTimeout(timer);
  }, [
    autosaveDraft,
    canAutosave,
    isEditingDraft,
    isSaving,
    postContent,
    postTitle,
    postType,
    postPrivacy,
    selectedMedia,
  ]);

  const handleEditDraft = (draft: Post) => {
    if (!canWrite || !isCurrent()) return;
    discardDraft();
    revisions.current.set(draft.id, draft.updated_at ?? null);
    const composer = {
      postTitle: draft.title ?? "",
      postContent: draft.content,
      postType: draft.post_type,
      postPrivacy: normalizeVisibility(draft.visibility),
      selectedMedia: draft.media ?? [],
      editingPostId: draft.id,
      expectedUpdatedAt: draft.updated_at ?? null,
    };
    const next = { ...uiStateRef.current, ...composer };
    uiStateRef.current = next;
    setUiState(next);
    retainDraft(composer, { dirty: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Opening another post replaces the composer, so unsaved writing is
  // confirmed first.
  const requestEditPost = (post: Post) => {
    if (hasUnsavedWriting && post.id !== editingPostId) {
      setPendingEdit(post);
      return;
    }
    handleEditDraft(post);
  };
  const confirmEditPost = () => {
    if (pendingEdit) handleEditDraft(pendingEdit);
    setPendingEdit(null);
  };
  const cancelEditPost = () => setPendingEdit(null);

  const cancelEditing = resetComposer;

  const pendingDelete =
    [...posts, ...drafts].find((post) => post.id === pendingDeleteId) ?? null;
  const requestDeletePost = (postId: string) => setPendingDeleteId(postId);
  const cancelDeletePost = () => setPendingDeleteId(null);
  const confirmDeletePost = async () => {
    const postId = pendingDeleteId;
    if (!postId) return;
    setIsDeleting(true);
    const result = await fetchResult(`/api/posts/${postId}`, {
      method: "DELETE",
    });
    setIsDeleting(false);
    if (!result.ok) {
      toast.error("Couldn’t delete that update. Try again.");
      return;
    }
    setPendingDeleteId(null);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setDrafts((prev) => prev.filter((p) => p.id !== postId));
    if (editingPostId === postId) cancelEditing();
    toast.success("Update deleted");
  };

  // Optimistic: the request leaves the list and returns if the server refuses.
  const handleResolveRequest = async (id: string, approved: boolean) => {
    const request = followerRequests.find((f) => f.id === id);
    setFollowerRequests((prev) => prev.filter((f) => f.id !== id));
    const result = await fetchResult(`/api/follower-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: approved ? "approved" : "rejected" }),
    });
    if (!result.ok) {
      if (request) setFollowerRequests((prev) => [request, ...prev]);
      toast.error("Couldn’t update that request. Try again.");
      return;
    }
    void refreshPendingFollowRequestCount();
    const name = request?.name ?? "They";
    toast.success(
      approved ? `${name} can now follow your updates` : "Request declined",
    );
  };

  return {
    canRead,
    canWrite,
    postType,
    postTitle,
    postContent,
    activeTab,
    isLoading,
    isSaving: isSaving || retainedSaving,
    editingPostId,
    lastSaved,
    postPrivacy,
    selectedMedia,
    isUploading,
    isLoadingRequests,
    setPostType,
    setPostTitle,
    setPostContent,
    setActiveTab,
    setEditingPostId,
    setPostPrivacy,
    setSelectedMedia,
    posts: canRead ? posts : [],
    drafts: canRead ? drafts : [],
    pendingRequests,
    feedError,
    draftsError,
    isLoadingDrafts,
    hasUnsavedWriting,
    requestsError,
    reloadPosts,
    reloadDrafts,
    reloadRequests,
    pendingEdit,
    requestEditPost,
    confirmEditPost,
    cancelEditPost,
    handlePost,
    handleEditDraft,
    cancelEditing,
    pendingDelete,
    isDeleting,
    requestDeletePost,
    cancelDeletePost,
    confirmDeletePost,
    handleResolveRequest,
  };
}
