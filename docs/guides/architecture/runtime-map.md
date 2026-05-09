# API Runtime Map

## Purpose

This project runs API routes with a Node.js runtime policy, and Next.js 16 Cache Components enabled (`cacheComponents: true`). In this mode, route segment config exports are disabled across App Router segment files, and route-level runtime exports can trigger build failures. Several handlers and shared implementations depend on Node-only behavior, including admin access paths that rely on `SUPABASE_SERVICE_ROLE_KEY`, request/session flows that use `next/headers` `cookies()`, payment flows that use the Stripe SDK, and GraphQL endpoints that use `graphql-yoga`.

## Rule

For every `apps/*/app/**/{route,layout,page}.{ts,tsx,js,jsx,mts,mjs}` file while `cacheComponents` is enabled:

- Do **not** add route segment exports for `runtime`, `dynamic`, `dynamicParams`, `revalidate`, `fetchCache`, `preferredRegion`, or `maxDuration`.
- For API route handlers specifically, treat `export const runtime = ...` as build-breaking in this repo.
- Rely on framework defaults and handler-level implementation constraints instead of segment config exports.

## Route Inventory

| App        | Route family                                      | Runtime policy                        | Reason                                     |
| ---------- | ------------------------------------------------- | ------------------------------------- | ------------------------------------------ |
| admin      | `/api/admin/comments`                             | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/comments/[commentId]`                 | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/contributions`                        | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/contributions/summary`                | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/crm/records`                          | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/funds`                                | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/locations`                            | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/member-care/activity`                 | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/member-care/attention`                | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/member-care/dashboard`                | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/member-care/directory`                | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/member-care/directory/[id]`           | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/member-care/goals`                    | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/member-care/private-notes`            | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/member-care/requirements`             | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/member-care/thread`                   | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/missionaries`                         | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/org-settings`                         | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/posts`                                | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/posts/[postId]`                       | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/support`                              | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/support/agents`                       | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/automation-rules`             | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/automation-rules/[id]`        | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/business-hours`               | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/business-hours/[id]`          | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/canned-responses`             | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/canned-responses/[id]`        | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/conversations`                | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/conversations/[id]`           | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/conversations/[id]/assign`    | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/conversations/[id]/labels`    | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/conversations/[id]/messages`  | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/conversations/[id]/notes`     | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/conversations/[id]/replies`   | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/conversations/[id]/run-macro` | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/conversations/[id]/snooze`    | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/conversations/[id]/status`    | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/counts`                       | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/inbox-settings`               | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/labels`                       | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/labels/[id]`                  | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/macros`                       | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/macros/[id]`                  | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/notification-preferences`     | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/reports`                      | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/saved-views`                  | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/saved-views/[id]`             | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/signatures`                   | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/signatures/[id]`              | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/sla-policies`                 | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/sla-policies/[id]`            | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/teams`                        | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/teams/[id]`                   | Node.js (no `runtime` segment export) | Support hub adapter                        |
| admin      | `/api/admin/support/tickets`                      | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/support/tickets/[id]`                 | Node.js (no `runtime` segment export) | Admin client                               |
| admin      | `/api/admin/users`                                | Node.js (no `runtime` segment export) | Admin client (`SUPABASE_SERVICE_ROLE_KEY`) |
| admin      | `/api/auth/demo-account`                          | Node.js (no `runtime` segment export) | Demo auth server action                    |
| admin      | `/api/auth/signout`                               | Node.js (no `runtime` segment export) | Auth/session cleanup                       |
| admin      | `/api/cms/public/missionary-pages/[id]`           | Node.js (no `runtime` segment export) | CMS public missionary pages                |
| admin      | `/api/cms/public/navigation`                      | Node.js (no `runtime` segment export) | CMS public navigation                      |
| admin      | `/api/cms/public/pages/[...slug]`                 | Node.js (no `runtime` segment export) | CMS public pages                           |
| admin      | `/api/cms/public/project-pages/[slug]`            | Node.js (no `runtime` segment export) | CMS public project pages                   |
| admin      | `/api/cms/public/updates`                         | Node.js (no `runtime` segment export) | CMS public updates                         |
| admin      | `/api/email/connect`                              | Node.js (no `runtime` segment export) | Resend admin integration                   |
| admin      | `/api/email/test-send`                            | Node.js (no `runtime` segment export) | Resend admin integration                   |
| admin      | `/api/email/webhooks/resend`                      | Node.js (no `runtime` segment export) | Resend webhook handling                    |
| admin      | `/api/health`                                     | Node.js (no `runtime` segment export) | Health probe                               |
| admin      | `/api/health/db`                                  | Node.js (no `runtime` segment export) | Database health probe                      |
| admin      | `/api/missionaries/[id]/metrics`                  | Node.js (no `runtime` segment export) | Admin client                               |
| donor      | `/api/auth/cleanup-demo-users`                    | Node.js (no `runtime` segment export) | Admin client                               |
| donor      | `/api/auth/demo-account`                          | Node.js (no `runtime` segment export) | Demo auth server action                    |
| donor      | `/api/auth/signout`                               | Node.js (no `runtime` segment export) | Auth/session cleanup                       |
| donor      | `/api/donate`                                     | Node.js (no `runtime` segment export) | Stripe SDK, admin client                   |
| donor      | `/api/donate/outbox`                              | Node.js (no `runtime` segment export) | Donation outbox processing                 |
| donor      | `/api/donations`                                  | Node.js (no `runtime` segment export) | Admin client                               |
| donor      | `/api/donor/feed-preferences`                     | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/follower-requests`                          | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/follower-requests/[requestId]`              | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/graphql`                                    | Node.js (no `runtime` segment export) | graphql-yoga, `next/headers` cookies()     |
| donor      | `/api/health`                                     | Node.js (no `runtime` segment export) | Health probe                               |
| donor      | `/api/posts`                                      | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/posts/[postId]`                             | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/posts/[postId]/comments`                    | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/posts/[postId]/fire`                        | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/posts/[postId]/like`                        | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/posts/[postId]/prayer`                      | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/profile`                                    | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| donor      | `/api/upload/image`                               | Node.js (no `runtime` segment export) | Node.js `Buffer`, server client            |
| missionary | `/api/auth/demo-account`                          | Node.js (no `runtime` segment export) | Demo auth server action                    |
| missionary | `/api/auth/signout`                               | Node.js (no `runtime` segment export) | Auth/session cleanup                       |
| missionary | `/api/follower-requests`                          | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| missionary | `/api/follower-requests/[requestId]`              | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| missionary | `/api/health`                                     | Node.js (no `runtime` segment export) | Health probe                               |
| missionary | `/api/missionaries`                               | Node.js (no `runtime` segment export) | Admin client                               |
| missionary | `/api/missionaries/[id]/metrics`                  | Node.js (no `runtime` segment export) | Admin client                               |
| missionary | `/api/posts`                                      | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| missionary | `/api/posts/[postId]`                             | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| missionary | `/api/posts/[postId]/comments`                    | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| missionary | `/api/posts/[postId]/fire`                        | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| missionary | `/api/posts/[postId]/like`                        | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| missionary | `/api/posts/[postId]/prayer`                      | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
| missionary | `/api/profile`                                    | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client    |
