"use client";

import { refreshPendingFollowRequestCount } from "@asym/database/hooks";
import { fetchJsonResult, fetchResult } from "@asym/lib/http/fetch-result";
import { isPostContentEmpty } from "@asym/ui/components/shadcn/rich-text-editor";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { normalizeVisibility, placeSavedPost } from "./feed-model";

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

export function useWorkerFeedPageView(): WorkerFeedPageViewModel {
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
  });
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
  } = uiState;

  const setUiField = useCallback(
    <K extends keyof WorkerFeedUiState>(
      key: K,
      value: React.SetStateAction<WorkerFeedUiState[K]>,
    ) => {
      setUiState((prev) => ({
        ...prev,
        [key]:
          typeof value === "function"
            ? (
                value as (
                  prevValue: WorkerFeedUiState[K],
                ) => WorkerFeedUiState[K]
              )(prev[key])
            : value,
      }));
    },
    [],
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
    [setIsLoading],
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
  }, [setIsLoading, setIsLoadingRequests]);

  const handlePost = useCallback(
    async (status: PostStatus = "published") => {
      if (isPostContentEmpty(postContent)) return;

      setIsSaving(true);
      const method = editingPostId ? "PATCH" : "POST";
      const url = editingPostId ? `/api/posts/${editingPostId}` : "/api/posts";

      const result = await fetchJsonResult<{ post: Post }>(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          post_type: postType,
          visibility: postPrivacy,
          status,
          media: selectedMedia,
        }),
      });

      if (result.ok) {
        const { post } = result.data;
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

        setPostTitle("");
        setPostContent("");
        setEditingPostId(null);
        setPostType("Update");
        setSelectedMedia([]);
      } else {
        toast.error("Couldn’t save your update. Try again.");
      }
      setIsSaving(false);
    },
    [
      editingPostId,
      postContent,
      postPrivacy,
      postTitle,
      postType,
      posts,
      selectedMedia,
      setEditingPostId,
      setIsSaving,
      setLastSaved,
      setPostContent,
      setPostTitle,
      setPostType,
      setSelectedMedia,
    ],
  );

  // Autosave writes status "draft", so it only runs while editing an existing
  // draft; otherwise it would create drafts unasked or unpublish a post.
  const isEditingDraft =
    editingPostId !== null &&
    drafts.some((draft) => draft.id === editingPostId);

  // Unlike handlePost, autosave leaves the composer as it is.
  const autosaveDraft = useCallback(async () => {
    if (!editingPostId) return;
    const result = await fetchJsonResult<{ post: Post }>(
      `/api/posts/${editingPostId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          post_type: postType,
          visibility: postPrivacy,
          status: "draft",
          media: selectedMedia,
        }),
      },
    );
    if (!result.ok) return;
    const { post } = result.data;
    setDrafts((prev) => placeSavedPost(prev, post, true));
    setLastSaved(new Date());
  }, [
    editingPostId,
    postContent,
    postPrivacy,
    postTitle,
    postType,
    selectedMedia,
    setLastSaved,
  ]);

  useEffect(() => {
    if (isPostContentEmpty(postContent) || isSaving || !isEditingDraft) return;

    const timer = setTimeout(() => {
      void autosaveDraft();
    }, 30000);

    return () => clearTimeout(timer);
  }, [autosaveDraft, isEditingDraft, isSaving, postContent]);

  const handleEditDraft = (draft: Post) => {
    setPostTitle(draft.title ?? "");
    setPostContent(draft.content);
    setPostType(draft.post_type);
    setPostPrivacy(normalizeVisibility(draft.visibility));
    // Saving sends media, so load what the post already has.
    setSelectedMedia(draft.media ?? []);
    setEditingPostId(draft.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Opening another post replaces the composer, so unsaved writing is
  // confirmed first.
  const hasUnsavedWriting =
    !isPostContentEmpty(postContent) ||
    postTitle.trim() !== "" ||
    selectedMedia.length > 0;
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

  // Leaving the page with unsaved writing asks the browser to confirm.
  useEffect(() => {
    if (!hasUnsavedWriting || isSaving) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedWriting, isSaving]);

  const cancelEditing = () => {
    setEditingPostId(null);
    setPostTitle("");
    setPostContent("");
    setPostType("Update");
    setSelectedMedia([]);
  };

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
    setPostType,
    setPostTitle,
    setPostContent,
    setActiveTab,
    setEditingPostId,
    setPostPrivacy,
    setSelectedMedia,
    posts,
    drafts,
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
