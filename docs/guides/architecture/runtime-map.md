# API Runtime Map

## Purpose

This project runs API routes with a Node.js runtime policy, and Next.js 16 Cache Components enabled (`cacheComponents: true`). In this mode, route segment config exports are disabled across App Router segment files, and route-level runtime exports can trigger build failures. Several handlers and shared implementations depend on Node-only behavior, including admin access paths that rely on `SUPABASE_SERVICE_ROLE_KEY`, request/session flows that use `next/headers` `cookies()`, payment flows that use the Stripe SDK, and GraphQL endpoints that use `graphql-yoga`.

## Rule

For every `apps/*/app/**/{route,layout,page}.{ts,tsx,js,jsx,mts,mjs}` file while `cacheComponents` is enabled:

- Do **not** add route segment exports for `runtime`, `dynamic`, `dynamicParams`, `revalidate`, `fetchCache`, `preferredRegion`, or `maxDuration`.
- For API route handlers specifically, treat `export const runtime = ...` as build-breaking in this repo.
- Rely on framework defaults and handler-level implementation constraints instead of segment config exports.

## Route Inventory

| App        | Route family                                                | Runtime policy                        | Reason                                     |
| ---------- | ----------------------------------------------------------- | ------------------------------------- | ------------------------------------------ |
| admin      | `/api/admin/users`                                          | Node.js (no `runtime` segment export) | Admin client (`SUPABASE_SERVICE_ROLE_KEY`) |
| admin      | `/api/admin/posts`, `/api/admin/posts/[postId]`             | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/comments`, `/api/admin/comments/[commentId]`    | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/org-settings`                                   | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/missionaries/[id]/metrics`                            | Node.js (no `runtime` segment export) | Admin client                               |
| donor      | `/api/posts`, `/api/posts/[postId]`                         | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/posts/[postId]/like`, `/fire`, `/prayer`, `/comments` | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/donate`                                               | Node.js (no `runtime` segment export) | Stripe SDK, admin client                   |
| donor      | `/api/donations`                                            | Node.js (no `runtime` segment export) | Admin client                               |
| donor      | `/api/profile`                                              | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/graphql`                                              | Node.js (no `runtime` segment export) | graphql-yoga, `next/headers` cookies()     |
| donor      | `/api/upload/image`                                         | Node.js (no `runtime` segment export) | Node.js `Buffer`, server client            |
| donor      | `/api/follower-requests`, `/[requestId]`                    | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/donor/feed-preferences`                               | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/auth/cleanup-demo-users`                              | Node.js (no `runtime` segment export) | Admin client                               |
| missionary | `/api/posts`, `/api/posts/[postId]`                         | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| missionary | `/api/posts/[postId]/like`, `/fire`, `/prayer`, `/comments` | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| missionary | `/api/profile`                                              | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| missionary | `/api/missionaries`, `/[id]/metrics`                        | Node.js (no `runtime` segment export) | Admin client                               |
| missionary | `/api/follower-requests`, `/[requestId]`                    | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
