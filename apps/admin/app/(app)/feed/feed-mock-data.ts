import { brandConfig } from "@asym/ui/components/brand-logo";

import type { Comment, ModerationStats, Post } from "./feed-model";

export const MOCK_STATS: ModerationStats = {
  totalPosts: 1247,
  flaggedPosts: 12,
  hiddenPosts: 3,
  pendingReview: 8,
  totalComments: 4892,
  flaggedComments: 5,
  actionsToday: 23,
};

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    post_type: "Update",
    content:
      "<p>The well project in Chiang Mai is 75% complete. We hit bedrock but the team persevered. Looking forward to the dedication ceremony next week!</p><p>Thank you to all our partners for making this possible.</p>",
    created_at: "2025-12-30T08:00:00Z",
    likes_count: 45,
    prayers_count: 12,
    fires_count: 8,
    comments_count: 7,
    visibility: "public",
    status: "published",
    isPinned: true,
    author: {
      id: "w1",
      name: "The Miller Family",
      avatar_url:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
      role: "missionary",
      location: "Thailand",
    },
    media: [
      {
        url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=800",
        type: "image",
      },
    ],
  },
  {
    id: "2",
    post_type: "Prayer Request",
    content:
      "<p>Please pray for our medical supply shipment. It has been held up at customs for 3 days now.</p><p>We are running low on essential antibiotics and insulin.</p>",
    created_at: "2025-12-29T10:00:00Z",
    likes_count: 15,
    prayers_count: 89,
    fires_count: 2,
    comments_count: 3,
    visibility: "partners",
    status: "flagged",
    isFlagged: true,
    flagReason: "Potentially sensitive medical content",
    author: {
      id: "w2",
      name: "Dr. Sarah Smith",
      avatar_url:
        "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?fit=facearea&facepad=2&w=256&h=256&q=80",
      role: "missionary",
      location: "Kenya",
    },
  },
  {
    id: "3",
    post_type: "Story",
    content:
      "<p>Meet Aroon. He's 8 years old and just attended his first English class today. Before our center opened, he spent his days collecting recyclables to help his family.</p><p>His dream is to become a pilot so he can see the world.</p>",
    created_at: "2025-12-27T14:30:00Z",
    likes_count: 124,
    prayers_count: 5,
    fires_count: 31,
    comments_count: 12,
    visibility: "public",
    status: "published",
    author: {
      id: "w1",
      name: "The Miller Family",
      avatar_url:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
      role: "missionary",
      location: "Thailand",
    },
    media: [
      {
        url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
        type: "image",
      },
    ],
  },
  {
    id: "4",
    post_type: "Announcement",
    content:
      "<p><strong>Year-End Giving Reminder</strong></p><p>All donations made before December 31st will be included in your 2024 tax-deductible statement. Thank you for your continued support!</p>",
    created_at: "2025-12-25T09:00:00Z",
    likes_count: 67,
    prayers_count: 0,
    fires_count: 12,
    comments_count: 4,
    visibility: "public",
    status: "published",
    isPinned: true,
    author: {
      id: "org1",
      name: brandConfig.name,
      avatar_url: "",
      role: "organization",
    },
  },
];

export const MOCK_FLAGGED_COMMENTS: Comment[] = [
  {
    id: "c1",
    content: "This seems suspicious, how do we know this is legitimate?",
    created_at: "2025-12-30T09:00:00Z",
    author: { id: "u1", name: "John Doe", avatar_url: "" },
    post_id: "1",
    is_flagged: true,
  },
  {
    id: "c2",
    content: "I have concerns about how funds are being used here.",
    created_at: "2025-12-30T06:00:00Z",
    author: { id: "u2", name: "Jane Smith", avatar_url: "" },
    post_id: "3",
    is_flagged: true,
  },
];
