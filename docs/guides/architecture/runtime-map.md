# API Runtime Map

## Purpose

This project runs API routes with a Node.js runtime policy, and Next.js 16 Cache Components enabled (`cacheComponents: true`). In this mode, route segment config exports are disabled across App Router segment files, and route-level runtime exports can trigger build failures. Several handlers and shared implementations depend on Node-only behavior, including admin access paths that rely on `SUPABASE_SERVICE_ROLE_KEY`, request/session flows that use `next/headers` `cookies()`, payment flows that use the Stripe SDK, and GraphQL endpoints that use `graphql-yoga`.

## Rule

For every `apps/*/app/**/{route,layout,page}.{ts,tsx,js,jsx,mts,mjs}` file while `cacheComponents` is enabled:

- Do **not** add route segment exports for `runtime`, `dynamic`, `dynamicParams`, `revalidate`, `fetchCache`, `preferredRegion`, or `maxDuration`.
- For API route handlers specifically, treat `export const runtime = ...` as build-breaking in this repo.
- Rely on framework defaults and handler-level implementation constraints instead of segment config exports.

## Shared Health Contract

`admin`, `donor`, and `missionary` expose `/api/health` through
`@asym/api/health/app`. The route stays thin in each app and returns both the
legacy `status` / `checks.supabase` fields and Phase 11 release-health metadata
under `observability`, including surface, checked time, release commit/ref,
environment, runtime, and Supabase probe latency. The production readiness
verifier reads that metadata to confirm the live release matches the target
commit when the deployment exposes a non-`unknown` commit.

## Route Inventory

| App        | Route family                                                   | Runtime policy                        | Reason                                        |
| ---------- | -------------------------------------------------------------- | ------------------------------------- | --------------------------------------------- |
| admin      | `/api/admin/comments`                                          | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/comments/[commentId]`                              | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/contribution-batches`                              | Node.js (no `runtime` segment export) | Bulk contribution operations, admin client    |
| admin      | `/api/admin/contribution-batches/[batchId]/process`            | Node.js (no `runtime` segment export) | Bulk contribution background processing       |
| admin      | `/api/admin/contributions`                                     | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/contributions/offline`                             | Node.js (no `runtime` segment export) | Offline gift entry, admin client              |
| admin      | `/api/admin/contributions/reconcile`                           | Node.js (no `runtime` segment export) | Giving reconciliation, admin client           |
| admin      | `/api/admin/contributions/replay`                              | Node.js (no `runtime` segment export) | Giving replay tooling, Stripe SDK             |
| admin      | `/api/admin/contributions/staged-gifts`                        | Node.js (no `runtime` segment export) | Finance review queue, admin client            |
| admin      | `/api/admin/contributions/staged-gifts/[stagedGiftId]`         | Node.js (no `runtime` segment export) | Finance review queue, admin client            |
| admin      | `/api/admin/contributions/staged-gifts/[stagedGiftId]/approve` | Node.js (no `runtime` segment export) | Finance approval, CRM outbound queue          |
| admin      | `/api/admin/contributions/staged-gifts/[stagedGiftId]/receipt` | Node.js (no `runtime` segment export) | Resend receipt sending, admin client          |
| admin      | `/api/admin/contributions/staged-gifts/[stagedGiftId]/retry`   | Node.js (no `runtime` segment export) | Giving replay/CRM retry, admin client         |
| admin      | `/api/admin/contributions/summary`                             | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/crm/gateway/development-health`                    | Node.js (no `runtime` segment export) | Development-only Twenty metadata health proof |
| admin      | `/api/admin/crm/gateway/status`                                | Node.js (no `runtime` segment export) | Staff-only CRM gateway smoke route            |
| admin      | `/api/admin/crm/notes`                                         | Node.js (no `runtime` segment export) | Staff-only native CRM notes                   |
| admin      | `/api/admin/crm/projections`                                   | Node.js (no `runtime` segment export) | Staff-only CRM projection shadow mode         |
| admin      | `/api/admin/crm/records`                                       | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/crm/records/[recordId]`                            | Node.js (no `runtime` segment export) | Staff-only donor CRM detail                   |
| admin      | `/api/admin/crm/relationships`                                 | Node.js (no `runtime` segment export) | Staff-only native CRM relationships           |
| admin      | `/api/admin/crm/reports`                                       | Node.js (no `runtime` segment export) | Staff-only CRM reporting                      |
| admin      | `/api/admin/crm/reports/export`                                | Node.js (no `runtime` segment export) | Audited CRM CSV export                        |
| admin      | `/api/admin/crm/sync/reconcile`                                | Node.js (no `runtime` segment export) | Staff-only CRM reconciliation                 |
| admin      | `/api/admin/crm/sync/replay`                                   | Node.js (no `runtime` segment export) | Staff-only CRM replay                         |
| admin      | `/api/admin/crm/table-preferences`                             | Node.js (no `runtime` segment export) | Staff-only CRM view preferences               |
| admin      | `/api/admin/crm/table-preferences/tenant-default`              | Node.js (no `runtime` segment export) | Audited CRM tenant default preferences        |
| admin      | `/api/admin/crm/table-preferences/views`                       | Node.js (no `runtime` segment export) | Personal CRM named views                      |
| admin      | `/api/admin/crm/table-preferences/views/[viewId]`              | Node.js (no `runtime` segment export) | Personal CRM named view mutation              |
| admin      | `/api/admin/crm/webhooks/twenty`                               | Node.js (no `runtime` segment export) | Twenty HMAC webhook, admin client             |
| admin      | `/api/admin/funds`                                             | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/locations`                                         | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/member-care/activity`                              | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/member-care/attention`                             | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/member-care/dashboard`                             | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/member-care/directory`                             | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/member-care/directory/[id]`                        | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/member-care/goals`                                 | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/member-care/private-notes`                         | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/member-care/requirements`                          | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/member-care/thread`                                | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/mission-control/automations`                       | Node.js (no `runtime` segment export) | Mission Control automations, admin client     |
| admin      | `/api/admin/mission-control/needs-attention`                   | Node.js (no `runtime` segment export) | Mission Control task attention dashboard      |
| admin      | `/api/admin/missionaries`                                      | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/org-settings`                                      | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/posts`                                             | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/posts/[postId]`                                    | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/support`                                           | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/support/agents`                                    | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/automation-rules`                          | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/automation-rules/[id]`                     | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/business-hours`                            | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/business-hours/[id]`                       | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/canned-responses`                          | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/canned-responses/[id]`                     | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/conversations`                             | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/conversations/[id]`                        | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/conversations/[id]/assign`                 | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/conversations/[id]/labels`                 | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/conversations/[id]/messages`               | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/conversations/[id]/notes`                  | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/conversations/[id]/priority`               | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/conversations/[id]/replies`                | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/conversations/[id]/run-macro`              | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/conversations/[id]/snooze`                 | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/conversations/[id]/status`                 | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/counts`                                    | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/inbox-settings`                            | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/inboxes`                                   | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/labels`                                    | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/labels/[id]`                               | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/macros`                                    | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/macros/[id]`                               | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/notification-preferences`                  | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/reports`                                   | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/saved-views`                               | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/saved-views/[id]`                          | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/signatures`                                | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/signatures/[id]`                           | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/sla-policies`                              | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/sla-policies/[id]`                         | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/teams`                                     | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/teams/[id]`                                | Node.js (no `runtime` segment export) | Support hub adapter                           |
| admin      | `/api/admin/support/tickets`                                   | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/support/tickets/[id]`                              | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/admin/support-hub/conversations/bulk-move`               | Node.js (no `runtime` segment export) | Bulk move, work claims, item audit            |
| admin      | `/api/admin/support-hub/conversations/bulk-move/retry`         | Node.js (no `runtime` segment export) | Retry failed bulk-move items                  |
| admin      | `/api/admin/support-hub/conversations/move`                    | Node.js (no `runtime` segment export) | Audited conversation move                     |
| admin      | `/api/admin/support-hub/inbound/retry`                         | Node.js (no `runtime` segment export) | Inbound email retry, work claims, ledger      |
| admin      | `/api/admin/support-hub/inbound/routes`                        | Node.js (no `runtime` segment export) | Saved inbound routes, save-and-continue       |
| admin      | `/api/admin/support-hub/inbound/routes/[routeId]`              | Node.js (no `runtime` segment export) | Tenant route management, audit                |
| admin      | `/api/admin/workflows/notification-policy`                     | Node.js (no `runtime` segment export) | Tenant notification overrides                 |
| admin      | `/api/admin/workflows/summaries`                               | Node.js (no `runtime` segment export) | Workflow run summaries, notification policy   |
| admin      | `/api/admin/users`                                             | Node.js (no `runtime` segment export) | Admin client (`SUPABASE_SERVICE_ROLE_KEY`)    |
| admin      | `/api/auth/demo-account`                                       | Node.js (no `runtime` segment export) | Demo auth server action                       |
| admin      | `/api/auth/signout`                                            | Node.js (no `runtime` segment export) | Auth/session cleanup                          |
| admin      | `/api/cms/public/missionary-pages/[id]`                        | Node.js (no `runtime` segment export) | CMS public missionary pages                   |
| admin      | `/api/cms/public/navigation`                                   | Node.js (no `runtime` segment export) | CMS public navigation                         |
| admin      | `/api/cms/public/pages/[...slug]`                              | Node.js (no `runtime` segment export) | CMS public pages                              |
| admin      | `/api/cms/public/project-pages/[slug]`                         | Node.js (no `runtime` segment export) | CMS public project pages                      |
| admin      | `/api/cms/public/updates`                                      | Node.js (no `runtime` segment export) | CMS public updates                            |
| admin      | `/api/email/connect`                                           | Node.js (no `runtime` segment export) | Resend admin integration                      |
| admin      | `/api/email/assets/upload`                                     | Node.js (no `runtime` segment export) | Email Studio asset upload                     |
| admin      | `/api/email/test-send`                                         | Node.js (no `runtime` segment export) | Resend admin integration                      |
| admin      | `/api/email/templates`                                         | Node.js (no `runtime` segment export) | Email Studio template store                   |
| admin      | `/api/email/templates/[templateId]`                            | Node.js (no `runtime` segment export) | Email Studio template store                   |
| admin      | `/api/email/templates/[templateId]/duplicate`                  | Node.js (no `runtime` segment export) | Email Studio template store                   |
| admin      | `/api/email/templates/[templateId]/export`                     | Node.js (no `runtime` segment export) | Email Studio template export                  |
| admin      | `/api/email/templates/[templateId]/test-send`                  | Node.js (no `runtime` segment export) | Email Studio template test-send               |
| admin      | `/api/email/templates/[templateId]/versions`                   | Node.js (no `runtime` segment export) | Email Studio template versions                |
| admin      | `/api/email/templates/[templateId]/versions/[version]/restore` | Node.js (no `runtime` segment export) | Email Studio version restore                  |
| admin      | `/api/email/templates/test-send`                               | Node.js (no `runtime` segment export) | Email Studio draft test-send                  |
| admin      | `/api/email/webhooks/resend`                                   | Node.js (no `runtime` segment export) | Resend webhook handling                       |
| admin      | `/api/health`                                                  | Node.js (no `runtime` segment export) | Shared release-health probe                   |
| admin      | `/api/health/crm`                                              | Node.js (no `runtime` segment export) | Twenty CRM provider health reachability       |
| admin      | `/api/health/db`                                               | Node.js (no `runtime` segment export) | Database health probe                         |
| admin      | `/api/inngest`                                                 | Node.js (no `runtime` segment export) | Inngest workflow function serving             |
| admin      | `/api/missionaries/[id]/metrics`                               | Node.js (no `runtime` segment export) | Admin client                                  |
| admin      | `/api/pdf-templates`                                           | Node.js (no `runtime` segment export) | PDF Studio template store                     |
| admin      | `/api/pdf-templates/[templateId]`                              | Node.js (no `runtime` segment export) | PDF Studio template store                     |
| admin      | `/api/pdf-templates/native/migration-report`                   | Node.js (no `runtime` segment export) | Native PDF Studio migration report            |
| admin      | `/api/pdf-templates/native/preview`                            | Node.js (no `runtime` segment export) | Native PDF Studio browser preview             |
| admin      | `/api/pdf-templates/native/render`                             | Node.js (no `runtime` segment export) | Native PDF Studio server render adapter       |
| admin      | `/api/webhooks/stripe`                                         | Node.js (no `runtime` segment export) | Stripe SDK, admin client                      |
| donor      | `/api/auth/cleanup-demo-users`                                 | Node.js (no `runtime` segment export) | Admin client                                  |
| donor      | `/api/auth/demo-account`                                       | Node.js (no `runtime` segment export) | Demo auth server action                       |
| donor      | `/api/auth/signout`                                            | Node.js (no `runtime` segment export) | Auth/session cleanup                          |
| donor      | `/api/donate`                                                  | Node.js (no `runtime` segment export) | Stripe SDK, admin client                      |
| donor      | `/api/donate/outbox`                                           | Node.js (no `runtime` segment export) | Donation outbox processing                    |
| donor      | `/api/donations`                                               | Node.js (no `runtime` segment export) | Admin client                                  |
| donor      | `/api/donor/billing-portal`                                    | Node.js (no `runtime` segment export) | Stripe Billing Portal, admin client           |
| donor      | `/api/donor/feed-preferences`                                  | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| donor      | `/api/donor/portal`                                            | Node.js (no `runtime` segment export) | Donor self-service BFF, admin client          |
| donor      | `/api/donor/receipts/[donationId]`                             | Node.js (no `runtime` segment export) | Owned donor receipt download, admin client    |
| donor      | `/api/donor/statements/[year]`                                 | Node.js (no `runtime` segment export) | Owned donor statement download                |
| donor      | `/api/follower-requests`                                       | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| donor      | `/api/follower-requests/[requestId]`                           | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| donor      | `/api/graphql`                                                 | Node.js (no `runtime` segment export) | graphql-yoga, `next/headers` cookies()        |
| donor      | `/api/health`                                                  | Node.js (no `runtime` segment export) | Shared release-health probe                   |
| donor      | `/api/posts`                                                   | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| donor      | `/api/posts/[postId]`                                          | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| donor      | `/api/posts/[postId]/comments`                                 | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| donor      | `/api/posts/[postId]/fire`                                     | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| donor      | `/api/posts/[postId]/like`                                     | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| donor      | `/api/posts/[postId]/prayer`                                   | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| donor      | `/api/profile`                                                 | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| donor      | `/api/upload/image`                                            | Node.js (no `runtime` segment export) | Node.js `Buffer`, server client               |
| donor      | `/api/webhooks/stripe`                                         | Node.js (no `runtime` segment export) | Stripe SDK, admin client                      |
| missionary | `/api/auth/demo-account`                                       | Node.js (no `runtime` segment export) | Demo auth server action                       |
| missionary | `/api/auth/signout`                                            | Node.js (no `runtime` segment export) | Auth/session cleanup                          |
| missionary | `/api/follower-requests`                                       | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| missionary | `/api/follower-requests/[requestId]`                           | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| missionary | `/api/health`                                                  | Node.js (no `runtime` segment export) | Shared release-health probe                   |
| missionary | `/api/missionary/portal`                                       | Node.js (no `runtime` segment export) | Missionary workspace BFF, admin client        |
| missionary | `/api/missionary/tasks`                                        | Node.js (no `runtime` segment export) | Missionary task CRUD, admin client            |
| missionary | `/api/missionary/tasks/[taskId]`                               | Node.js (no `runtime` segment export) | Missionary-owned task mutation                |
| missionary | `/api/missionary/donors`                                       | Node.js (no `runtime` segment export) | Missionary donor list, redacted, `@asym/api`  |
| missionary | `/api/missionary/donors/[donorId]`                             | Node.js (no `runtime` segment export) | Missionary donor PATCH/tags, `@asym/api`      |
| missionary | `/api/missionary/donors/[donorId]/activities`                  | Node.js (no `runtime` segment export) | Missionary donor activity log, `@asym/api`    |
| missionary | `/api/missionaries`                                            | Node.js (no `runtime` segment export) | Admin client                                  |
| missionary | `/api/missionaries/[id]/metrics`                               | Node.js (no `runtime` segment export) | Admin client                                  |
| missionary | `/api/posts`                                                   | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| missionary | `/api/posts/[postId]`                                          | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| missionary | `/api/posts/[postId]/comments`                                 | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| missionary | `/api/posts/[postId]/fire`                                     | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| missionary | `/api/posts/[postId]/like`                                     | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| missionary | `/api/posts/[postId]/prayer`                                   | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| missionary | `/api/profile`                                                 | Node.js (no `runtime` segment export) | `next/headers` cookies(), server client       |
| missionary | `/api/webhooks/stripe`                                         | Node.js (no `runtime` segment export) | Stripe SDK, admin client                      |

Contribution operation routes added after the main table to avoid reflowing the
full inventory around long dynamic path names.

| App   | Route family                                                                  | Runtime policy                        | Reason                                    |
| ----- | ----------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------- |
| admin | `/api/admin/contribution-operations/[contributionId]`                         | Node.js (no `runtime` segment export) | Contribution operation detail             |
| admin | `/api/admin/contribution-operations/actions`                                  | Node.js (no `runtime` segment export) | Contribution operation action executor    |
| admin | `/api/admin/contribution-operations/correction-requests/[requestId]/decision` | Node.js (no `runtime` segment export) | Contribution correction approval decision |
