"use client";

import { useCallback, useMemo, useReducer, useState } from "react";
import { toast } from "sonner";

import {
  MOCK_FLAGGED_COMMENTS,
  MOCK_POSTS,
  MOCK_STATS,
} from "./feed-mock-data";
import {
  contentModerationUiReducer,
  INITIAL_CONTENT_MODERATION_UI_STATE,
  type Comment,
  type ModerationAction,
  type ModerationStats,
  type Post,
  type PostStatus,
} from "./feed-model";

export function useContentModerationPage() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [flaggedComments, setFlaggedComments] = useState<Comment[]>(
    MOCK_FLAGGED_COMMENTS,
  );
  const [ui, dispatchUi] = useReducer(
    contentModerationUiReducer,
    INITIAL_CONTENT_MODERATION_UI_STATE,
  );

  const {
    activeTab,
    searchQuery,
    filterVisibility,
    filterType,
    sortBy,
    isRefreshing,
  } = ui;

  const stats: ModerationStats = MOCK_STATS;
  const isLoading = false;

  const flaggedPosts = useMemo(
    () =>
      posts.filter(
        (post) => post.isFlagged || post.status === "pending_review",
      ),
    [posts],
  );

  const handleRefresh = useCallback(async () => {
    dispatchUi({ type: "set_is_refreshing", value: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatchUi({ type: "set_is_refreshing", value: false });
    toast.success("Feed refreshed");
  }, []);

  const handlePostAction = useCallback(
    (postId: string, action: ModerationAction, reason?: string) => {
      setPosts((previousPosts) =>
        previousPosts.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          switch (action) {
            case "approve":
              toast.success("Post approved");
              return {
                ...post,
                status: "published" as PostStatus,
                isFlagged: false,
                flagReason: undefined,
              };
            case "hide":
              toast.success("Post hidden");
              return { ...post, status: "hidden" as PostStatus };
            case "flag":
              toast.success("Post flagged for review");
              return { ...post, isFlagged: true, flagReason: reason };
            case "delete":
              toast.success("Post deleted");
              return post;
            default:
              return post;
          }
        }),
      );

      if (action === "delete") {
        setPosts((previousPosts) =>
          previousPosts.filter((post) => post.id !== postId),
        );
      }
    },
    [],
  );

  const handleCommentAction = useCallback(
    (commentId: string, action: "approve" | "delete") => {
      if (action === "delete") {
        setFlaggedComments((previousComments) =>
          previousComments.filter((comment) => comment.id !== commentId),
        );
        toast.success("Comment deleted");
      } else {
        setFlaggedComments((previousComments) =>
          previousComments.filter((comment) => comment.id !== commentId),
        );
        toast.success("Comment approved");
      }
    },
    [],
  );

  return {
    activeTab,
    dispatchUi,
    filterType,
    filterVisibility,
    flaggedComments,
    flaggedPosts,
    handleCommentAction,
    handlePostAction,
    handleRefresh,
    isLoading,
    isRefreshing,
    posts,
    searchQuery,
    sortBy,
    stats,
  };
}
