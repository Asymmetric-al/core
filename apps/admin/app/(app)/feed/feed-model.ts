export type PostStatus = "published" | "flagged" | "hidden" | "pending_review";
export type Visibility = "public" | "partners" | "private";
export type ModerationAction = "approve" | "hide" | "flag" | "delete" | "edit";
export type ModerationTab = "moderation" | "all";
export type VisibilityFilter = "all" | Visibility;
export type PostTypeFilter =
  | "all"
  | "update"
  | "prayer request"
  | "story"
  | "announcement";
export type SortOption = "newest" | "oldest" | "engagement";

export interface ContentModerationUiState {
  activeTab: ModerationTab;
  searchQuery: string;
  filterVisibility: VisibilityFilter;
  filterType: PostTypeFilter;
  sortBy: SortOption;
  isRefreshing: boolean;
}

export type ContentModerationUiAction =
  | { type: "set_active_tab"; value: ModerationTab }
  | { type: "set_search_query"; value: string }
  | { type: "set_filter_visibility"; value: VisibilityFilter }
  | { type: "set_filter_type"; value: PostTypeFilter }
  | { type: "set_sort_by"; value: SortOption }
  | { type: "set_is_refreshing"; value: boolean };

export const INITIAL_CONTENT_MODERATION_UI_STATE: ContentModerationUiState = {
  activeTab: "moderation",
  searchQuery: "",
  filterVisibility: "all",
  filterType: "all",
  sortBy: "newest",
  isRefreshing: false,
};

export function contentModerationUiReducer(
  state: ContentModerationUiState,
  action: ContentModerationUiAction,
): ContentModerationUiState {
  switch (action.type) {
    case "set_active_tab":
      return { ...state, activeTab: action.value };
    case "set_search_query":
      return { ...state, searchQuery: action.value };
    case "set_filter_visibility":
      return { ...state, filterVisibility: action.value };
    case "set_filter_type":
      return { ...state, filterType: action.value };
    case "set_sort_by":
      return { ...state, sortBy: action.value };
    case "set_is_refreshing":
      return { ...state, isRefreshing: action.value };
    default:
      return state;
  }
}

export interface Post {
  id: string;
  post_type: string;
  content: string;
  created_at: string;
  updated_at?: string;
  likes_count: number;
  prayers_count: number;
  fires_count: number;
  comments_count: number;
  visibility: Visibility;
  status: PostStatus;
  isPinned?: boolean;
  isFlagged?: boolean;
  flagReason?: string;
  media?: { url: string; type: string }[];
  author: {
    id: string;
    name: string;
    avatar_url: string;
    role: "missionary" | "organization";
    location?: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar_url: string;
  };
  post_id: string;
  is_flagged?: boolean;
}

export interface ModerationStats {
  totalPosts: number;
  flaggedPosts: number;
  hiddenPosts: number;
  pendingReview: number;
  totalComments: number;
  flaggedComments: number;
  actionsToday: number;
}
