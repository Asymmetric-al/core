import type { MediaItem } from "@asym/database/types";

export type AccessLevel = "view" | "comment";
export type PostStatus = "published" | "draft";

/** The kinds of update a missionary can share (stored values). */
export const POST_TYPES = [
  "Update",
  "Story",
  "Prayer Request",
  "Milestone",
] as const;
export type PostType = (typeof POST_TYPES)[number];

/** Post types read in sentence case ("Prayer request"). */
export function postTypeLabel(postType: string) {
  return postType === "Prayer Request" ? "Prayer request" : postType;
}

/** Who can see an update. Stored rows say "partners_only". */
export type Visibility = "public" | "partners";

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: "Public",
  partners: "Partners only",
};

export function normalizeVisibility(value: string): Visibility {
  return value === "partners_only" || value === "partners"
    ? "partners"
    : "public";
}

export type WorkerFeedUiState = {
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

export interface Post {
  id: string;
  post_type: string;
  /** Author-supplied headline (what donors see first); older rows may lack one. */
  title?: string | null;
  content: string;
  created_at: string;
  likes_count?: number;
  updated_at?: string | null;
  prayers_count?: number;
  comments?: FeedComment[];
  media?: MediaItem[];
  isPinned?: boolean;
  /** "public" or "partners_only" as stored. */
  visibility: string;
  status: PostStatus;
  user_liked?: boolean;
  user_prayed?: boolean;
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

/**
 * One list after a save: the saved post stays in place (or joins at the top)
 * when it belongs to the list, and leaves it otherwise.
 */
export function placeSavedPost(list: Post[], saved: Post, belongs: boolean) {
  if (!belongs) return list.filter((post) => post.id !== saved.id);
  return list.some((post) => post.id === saved.id)
    ? list.map((post) => (post.id === saved.id ? saved : post))
    : [saved, ...list];
}
