export const CACHE_TAGS = {
  posts: "posts",
  post: (postId: string) => `post:${postId}`,
  tenantPosts: (tenantId: string) => `posts:tenant:${tenantId}`,
} as const;
