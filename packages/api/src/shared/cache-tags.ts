export const CACHE_TAGS = {
  // Legacy broad tag retained for compatibility with older paths.
  posts: "posts",
  tenantPosts: (tenantId: string) => `posts:tenant:${tenantId}`,
  post: (postId: string) => `post:${postId}`,
} as const;
