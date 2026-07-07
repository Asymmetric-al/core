import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DONOR_FEED_POSTS_QUERY_KEY,
  fetchDonorFeedPosts,
  formatPostRelativeTime,
  mapToRecentUpdate,
  postAuthorName,
  postImages,
  postInitials,
  postTitle,
} from "../../../../packages/database/hooks/donor-feed-posts";

import type { PostWithAuthor } from "../../../../packages/database/types/database";

function makePost(overrides: Partial<PostWithAuthor> = {}): PostWithAuthor {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    tenant_id: "tenant-1",
    missionary_id: "missionary-1",
    content: "<p>Clean water is flowing in the northern village.</p>",
    media: [{ url: "https://cdn.example/a.jpg", type: "image" }],
    like_count: 12,
    prayer_count: 4,
    fires_count: 2,
    comment_count: 3,
    created_at: "2026-07-03T09:00:00.000Z",
    updated_at: "2026-07-03T09:00:00.000Z",
    author: {
      id: "profile-1",
      first_name: "Grace",
      last_name: "Miller",
      avatar_url: "https://cdn.example/grace.jpg",
    },
    user_liked: true,
    user_prayed: false,
    ...overrides,
  };
}

describe("formatPostRelativeTime", () => {
  const now = new Date("2026-07-03T12:00:00.000Z");

  it("returns 'Just now' under an hour", () => {
    expect(formatPostRelativeTime("2026-07-03T11:30:00.000Z", now)).toBe(
      "Just now",
    );
  });

  it("returns hours for same-day posts", () => {
    expect(formatPostRelativeTime("2026-07-03T09:00:00.000Z", now)).toBe(
      "3h ago",
    );
  });

  it("returns 'Yesterday' one day back", () => {
    expect(formatPostRelativeTime("2026-07-02T10:00:00.000Z", now)).toBe(
      "Yesterday",
    );
  });

  it("returns days within a week", () => {
    expect(formatPostRelativeTime("2026-06-30T12:00:00.000Z", now)).toBe(
      "3d ago",
    );
  });

  it("falls back to a short date beyond a week", () => {
    expect(formatPostRelativeTime("2026-06-01T12:00:00.000Z", now)).toBe(
      "Jun 1",
    );
  });
});

describe("postAuthorName", () => {
  it("joins first and last name", () => {
    expect(postAuthorName(makePost())).toBe("Grace Miller");
  });

  it("falls back when the name is blank", () => {
    const post = makePost({
      author: {
        id: "p",
        first_name: "",
        last_name: "",
        avatar_url: null,
      },
    });
    expect(postAuthorName(post)).toBe("Ministry Partner");
  });
});

describe("postInitials", () => {
  it("uppercases the first letter of each name", () => {
    expect(postInitials(makePost())).toBe("GM");
  });

  it("returns an empty string when no name is present", () => {
    const post = makePost({
      author: { id: "p", first_name: "", last_name: "", avatar_url: null },
    });
    expect(postInitials(post)).toBe("");
  });
});

describe("postTitle", () => {
  it("strips HTML and collapses whitespace", () => {
    const post = makePost({
      content: "<p>Clean water   is\nflowing.</p>",
    });
    expect(postTitle(post)).toBe("Clean water is flowing.");
  });

  it("truncates long content with an ellipsis", () => {
    const post = makePost({ content: "a".repeat(120) });
    const title = postTitle(post, 80);
    expect(title.length).toBeLessThanOrEqual(81);
    expect(title.endsWith("…")).toBe(true);
  });

  it("falls back for empty content", () => {
    expect(postTitle(makePost({ content: "   " }))).toBe("Ministry Update");
  });
});

describe("postImages", () => {
  it("returns only image media URLs", () => {
    const post = makePost({
      media: [
        { url: "https://cdn.example/a.jpg", type: "image" },
        { url: "https://cdn.example/b.mp4", type: "video" },
        { url: "https://cdn.example/c.png", type: "image" },
      ],
    });
    expect(postImages(post)).toEqual([
      "https://cdn.example/a.jpg",
      "https://cdn.example/c.png",
    ]);
  });

  it("returns an empty array when there is no media", () => {
    expect(postImages(makePost({ media: [] }))).toEqual([]);
  });
});

describe("mapToRecentUpdate", () => {
  it("maps a post to the RecentUpdate widget shape", () => {
    const now = new Date("2026-07-03T12:00:00.000Z");
    expect(mapToRecentUpdate(makePost(), now)).toEqual({
      id: "11111111-1111-1111-1111-111111111111",
      author: "Grace Miller",
      title: "Clean water is flowing in the northern village.",
      time: "3h ago",
      image: "https://cdn.example/a.jpg",
      avatar: "GM",
    });
  });

  it("omits the image when the post has none", () => {
    const now = new Date("2026-07-03T12:00:00.000Z");
    const update = mapToRecentUpdate(makePost({ media: [] }), now);
    expect(update.image).toBeUndefined();
  });
});

describe("fetchDonorFeedPosts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests /api/posts with the given params and returns the posts array", async () => {
    const posts = [makePost()];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ posts }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchDonorFeedPosts({
      limit: 5,
      missionaryId: "missionary-9",
    });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/api/posts?");
    expect(url).toContain("limit=5");
    expect(url).toContain("status=published");
    expect(url).toContain("missionaryId=missionary-9");
    expect(result).toEqual(posts);
  });

  it("defaults to an empty array when the payload omits posts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      }),
    );
    await expect(fetchDonorFeedPosts()).resolves.toEqual([]);
  });

  it("throws the server error message on a non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: "Admin client unavailable" }),
      }),
    );
    await expect(fetchDonorFeedPosts()).rejects.toThrow(
      "Admin client unavailable",
    );
  });

  it("throws a status-based message when the body has no error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => {
          throw new Error("no body");
        },
      }),
    );
    await expect(fetchDonorFeedPosts()).rejects.toThrow("401");
  });
});

describe("DONOR_FEED_POSTS_QUERY_KEY", () => {
  it("is a stable base key", () => {
    expect(DONOR_FEED_POSTS_QUERY_KEY).toBe("donor-feed-posts");
  });
});
