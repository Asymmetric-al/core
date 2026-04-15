import { Shield, ShieldAlert, ShieldHalf } from "lucide-react";

import type { MediaItem } from "@asym/database/types";
import type { ElementType } from "react";

export type SecurityLevel = "high" | "medium" | "low";
export type AccessLevel = "view" | "comment";
export type PostStatus = "published" | "draft";

export type SecurityDialogState = {
  level: SecurityLevel;
  publicMirror: boolean;
  autoApproval: boolean;
};

export type SecurityOption = {
  level: SecurityLevel;
  icon: ElementType;
  title: string;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  ringColor: string;
};

export type WorkerFeedUiState = {
  postType: string;
  postContent: string;
  activeTab: PostStatus;
  isLoading: boolean;
  isSaving: boolean;
  editingPostId: string | null;
  lastSaved: Date | null;
  expandedComments: string | null;
  postPrivacy: Visibility;
  selectedMedia: MediaItem[];
  isUploading: boolean;
  securityLevel: SecurityLevel;
  isLoadingRequests: boolean;
};

export interface FollowerRequest {
  id: string;
  donor_id: string;
  name: string;
  avatar_url: string | null;
  is_donor: boolean;
  access_level: AccessLevel;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  initials: string;
}

export type Visibility = "public" | "partners" | "private";

export interface Post {
  id: string;
  post_type: string;
  content: string;
  created_at: string;
  likes_count?: number;
  prayers_count?: number;
  fires_count?: number;
  comments?: FeedComment[];
  media?: MediaItem[];
  isPinned?: boolean;
  visibility: Visibility;
  status: PostStatus;
  user_liked?: boolean;
  user_prayed?: boolean;
  user_fired?: boolean;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

export interface FeedCommentAuthor {
  full_name?: string;
  avatar_url?: string | null;
}

export interface FeedComment {
  id: string;
  content: string;
  created_at: string;
  avatar?: string | null;
  author?: FeedCommentAuthor;
  isWorker?: boolean;
  replies?: FeedComment[];
}

export function buildSecurityDialogState(
  level: SecurityLevel,
): SecurityDialogState {
  return {
    level,
    publicMirror: level === "low",
    autoApproval: level !== "high",
  };
}

export const SECURITY_OPTIONS: SecurityOption[] = [
  {
    level: "high",
    icon: ShieldAlert,
    title: "High Security",
    description:
      "Manual approval required for all followers. Full control over who sees your updates.",
    features: [
      "Manual follower approval",
      "Granular permissions",
      "Activity logging",
    ],
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    ringColor: "ring-rose-500/20",
  },
  {
    level: "medium",
    icon: ShieldHalf,
    title: "Balanced",
    description:
      "Auto-approve donors while maintaining control over non-donor followers.",
    features: [
      "Auto-approve donors",
      "Review non-donors",
      "Partner visibility",
    ],
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    ringColor: "ring-amber-500/20",
  },
  {
    level: "low",
    icon: Shield,
    title: "Open Access",
    description:
      "Public feed visible on your giving page. Maximum reach for your updates.",
    features: ["Public visibility", "Auto-sync to page", "Maximum engagement"],
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    ringColor: "ring-emerald-500/20",
  },
];

export function createLocalCommentId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function appendCommentToThread(
  comments: FeedComment[],
  nextComment: FeedComment,
  parentId?: string,
): FeedComment[] {
  if (!parentId) {
    return [...comments, nextComment];
  }

  return comments.map((comment) =>
    comment.id === parentId
      ? { ...comment, replies: [...(comment.replies || []), nextComment] }
      : comment,
  );
}

export function removeCommentFromThread(
  comments: FeedComment[],
  commentId: string,
  parentId?: string,
): FeedComment[] {
  if (parentId) {
    return comments.map((comment) =>
      comment.id === parentId
        ? {
            ...comment,
            replies: (comment.replies || []).filter(
              (reply) => reply.id !== commentId,
            ),
          }
        : comment,
    );
  }

  return comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: (comment.replies || []).filter(
        (reply) => reply.id !== commentId,
      ),
    }));
}
