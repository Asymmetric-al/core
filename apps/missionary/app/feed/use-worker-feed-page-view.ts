"use client";

import { isPostContentEmpty } from "@asym/ui/components/shadcn/rich-text-editor";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  FollowerRequest,
  Post,
  PostStatus,
  SecurityLevel,
  Visibility,
  WorkerFeedUiState,
} from "./feed-model";
import type { MediaItem } from "@asym/database/types";
import type { SetStateAction } from "react";

export type WorkerFeedPageViewModel = {
  postType: string;
  postContent: string;
  activeTab: PostStatus;
  isLoading: boolean;
  isSaving: boolean;
  editingPostId: string | null;
  lastSaved: Date | null;
  postPrivacy: Visibility;
  selectedMedia: MediaItem[];
  isUploading: boolean;
  securityLevel: SecurityLevel;
  isLoadingRequests: boolean;
  setPostType: (value: SetStateAction<string>) => void;
  setPostContent: (value: SetStateAction<string>) => void;
  setActiveTab: (value: SetStateAction<PostStatus>) => void;
  setEditingPostId: (value: SetStateAction<string | null>) => void;
  setPostPrivacy: (value: SetStateAction<Visibility>) => void;
  setSelectedMedia: (value: SetStateAction<MediaItem[]>) => void;
  setSecurityLevel: (value: SetStateAction<SecurityLevel>) => void;
  posts: Post[];
  drafts: Post[];
  pendingRequests: FollowerRequest[];
  simulateUpload: () => Promise<void>;
  handlePost: (status?: PostStatus) => Promise<void>;
  handleEditDraft: (draft: Post) => void;
  handleDeletePost: (postId: string) => Promise<void>;
  handleResolveRequest: (id: string, approved: boolean) => void;
};

export function useWorkerFeedPageView(): WorkerFeedPageViewModel {
  const [uiState, setUiState] = useState<WorkerFeedUiState>({
    postType: "Update",
    postContent: "",
    activeTab: "published",
    isLoading: true,
    isSaving: false,
    editingPostId: null,
    lastSaved: null,
    postPrivacy: "public",
    selectedMedia: [],
    isUploading: false,
    securityLevel: "medium",
    isLoadingRequests: true,
  });
  const {
    postType,
    postContent,
    activeTab,
    isLoading,
    isSaving,
    editingPostId,
    lastSaved,
    postPrivacy,
    selectedMedia,
    isUploading,
    securityLevel,
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
  const setIsUploading = useCallback(
    (value: React.SetStateAction<boolean>) => setUiField("isUploading", value),
    [setUiField],
  );
  const setSecurityLevel = useCallback(
    (value: React.SetStateAction<SecurityLevel>) =>
      setUiField("securityLevel", value),
    [setUiField],
  );
  const setIsLoadingRequests = useCallback(
    (value: React.SetStateAction<boolean>) =>
      setUiField("isLoadingRequests", value),
    [setUiField],
  );

  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [followerRequests, setFollowerRequests] = useState<FollowerRequest[]>(
    [],
  );

  const pendingRequests = useMemo(
    () => followerRequests.filter((f) => f.status === "pending"),
    [followerRequests],
  );

  const simulateUpload = async () => {
    setIsUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const demoImages = [
      "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=1200",
    ];
    const randomImage =
      demoImages[Math.floor(Math.random() * demoImages.length)];
    if (!randomImage) {
      setIsUploading(false);
      toast.error("Failed to upload image");
      return;
    }
    setSelectedMedia((prev) => [...prev, { url: randomImage, type: "image" }]);
    setIsUploading(false);
    toast.success("Image uploaded successfully!");
  };

  const fetchPosts = useCallback(
    async (status: PostStatus = "published") => {
      try {
        const res = await fetch(`/api/posts?status=${status}`);
        const data = await res.json();
        if (status === "published") setPosts(data.posts || []);
        else setDrafts(data.posts || []);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        toast.error("Could not load feed");
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading],
  );

  const fetchFollowerRequests = useCallback(async () => {
    try {
      setIsLoadingRequests(true);
      const res = await fetch("/api/follower-requests?status=pending");
      const data = await res.json();
      setFollowerRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to fetch follower requests:", err);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [setIsLoadingRequests]);

  useEffect(() => {
    fetchPosts("published");
    fetchPosts("draft");
    fetchFollowerRequests();
  }, [fetchPosts, fetchFollowerRequests]);

  const handlePost = useCallback(
    async (status: PostStatus = "published") => {
      if (isPostContentEmpty(postContent)) return;

      setIsSaving(true);
      try {
        const method = editingPostId ? "PATCH" : "POST";
        const url = editingPostId
          ? `/api/posts/${editingPostId}`
          : "/api/posts";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: postContent,
            post_type: postType,
            visibility: postPrivacy,
            status,
            media: selectedMedia,
          }),
        });

        if (!res.ok) throw new Error("Failed to save post");

        const { post } = await res.json();

        if (status === "published") {
          if (editingPostId && activeTab === "draft") {
            setDrafts((prev) => prev.filter((d) => d.id !== editingPostId));
            setPosts((prev) => [post, ...prev]);
          } else {
            setPosts((prev) =>
              editingPostId
                ? prev.map((p) => (p.id === editingPostId ? post : p))
                : [post, ...prev],
            );
          }
          toast.success(
            editingPostId ? "Update updated!" : "Update published!",
          );
        } else {
          setDrafts((prev) =>
            editingPostId
              ? prev.map((p) => (p.id === editingPostId ? post : p))
              : [post, ...prev],
          );
          setLastSaved(new Date());
          toast.success("Draft saved!");
        }

        setPostContent("");
        setEditingPostId(null);
        setPostType("Update");
        setSelectedMedia([]);
      } catch (_err) {
        toast.error("Failed to save");
      } finally {
        setIsSaving(false);
      }
    },
    [
      activeTab,
      editingPostId,
      postContent,
      postPrivacy,
      postType,
      selectedMedia,
      setEditingPostId,
      setIsSaving,
      setLastSaved,
      setPostContent,
      setPostType,
      setSelectedMedia,
    ],
  );

  useEffect(() => {
    if (
      isPostContentEmpty(postContent) ||
      isSaving ||
      (activeTab === "published" && !editingPostId)
    )
      return;

    const timer = setTimeout(() => {
      handlePost("draft");
    }, 30000);

    return () => clearTimeout(timer);
  }, [activeTab, editingPostId, handlePost, isSaving, postContent]);

  const handleEditDraft = (draft: Post) => {
    setPostContent(draft.content);
    setPostType(draft.post_type);
    setPostPrivacy(draft.visibility);
    setEditingPostId(draft.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("Editing draft...");
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setDrafts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted");
    } catch (_err) {
      toast.error("Failed to delete");
    }
  };

  const handleResolveRequest = (id: string, approved: boolean) => {
    setFollowerRequests((prev) => prev.filter((f) => f.id !== id));
    toast.success(approved ? "Follower accepted" : "Request removed");
  };

  return {
    postType,
    postContent,
    activeTab,
    isLoading,
    isSaving,
    editingPostId,
    lastSaved,
    postPrivacy,
    selectedMedia,
    isUploading,
    securityLevel,
    isLoadingRequests,
    setPostType,
    setPostContent,
    setActiveTab,
    setEditingPostId,
    setPostPrivacy,
    setSelectedMedia,
    setSecurityLevel,
    posts,
    drafts,
    pendingRequests,
    simulateUpload,
    handlePost,
    handleEditDraft,
    handleDeletePost,
    handleResolveRequest,
  };
}
