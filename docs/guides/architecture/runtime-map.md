# API Runtime Map

## Purpose

This project runs API routes with a Node.js runtime policy, and Next.js 16 Cache Components enabled (`cacheComponents: true`). In this mode, route segment config exports are disabled across App Router segment files, and route-level runtime exports can trigger build failures. Several handlers and shared implementations depend on Node-only behavior, including admin access paths that rely on `SUPABASE_SERVICE_ROLE_KEY`, request/session flows that use `next/headers` `cookies()`, payment flows that use the Stripe SDK, and GraphQL endpoints that use `graphql-yoga`.

## Triggers

Use this map before adding or changing an App Router segment or any Phase 22
D10-D18 preview, public-read, cache, metadata, media, measurement, authoring,
subject-composition, or containment path.

## Workflow

1. Identify the exact Tenant, Legal Entity, environment, Site, Page Family, Page,
   locale, and applicable D10-D18 owner contract; for public serving identify the
   exact release generation, and for preview identify the exact saved revision or
   immutable candidate.
2. For preview, re-prove D10 exact-target authorization before private no-store
   output. For public serving, re-prove D2 release, Phase 10 safety, D8 route, and
   current-serving admission before cache access or public output.
3. Invoke the owner boundary. Public positive output may use only the admitted
   release; preview may use only its selected authorized target and never the
   published cache. Adverse or unknown facts deny the affected output before
   broader rebuild.
4. Run the applicable structural and runtime checks, then record exact changed
   paths and blast radius.

## Checklist

- [ ] No forbidden route-segment export was added.
- [ ] Preview authorization occurs before private output, and public
      current-serving admission occurs before public cache access or output.
- [ ] Adverse or unknown changes contain positive output first, with no stale
      fallback restoring it.
- [ ] Exact changed paths, blast radius, and verification results are recorded.

## Rule

For every `apps/*/app/**/{route,layout,page}.{ts,tsx,js,jsx,mts,mjs}` file while `cacheComponents` is enabled:

- Do **not** add route segment exports for `runtime`, `dynamic`, `dynamicParams`, `revalidate`, `fetchCache`, `preferredRegion`, or `maxDuration`.
- For API route handlers specifically, treat `export const runtime = ...` as build-breaking in this repo.
- Rely on framework defaults and handler-level implementation constraints instead of segment config exports.

## Public Runtime Contract (Phase 5)

Phase 5 (Public Website Runtime Contract) governs how the public tenant
website reads, caches, and previews content
(`docs/prds/sitestacker-parity/phase-05-public-website-runtime-contract.md`;
ADRs 0026–0030):

- **One reader choke-point.** All public content reads go through the
  published-content reader (server-only, under `packages/api`), which takes
  the resolved tenant (and reserved site) as a required argument, always
  applies tenant-and-published, runs Payload with `overrideAccess: false`
  under the public-read policy, and returns empty on an unresolved tenant.
  Raw Payload reads (`payload.find`/`findByID`) in public code paths are
  forbidden by a hard-blocking lint; the `/api/cms/public/*` routes above are
  transport behind the reader, never a second rule set.
- **Function-level caching only.** Published reads cache with `use cache` +
  `cacheTag` + a bounded `cacheLife`; **cache-key isolation comes from
  passing the tenant as a function argument** (tags are invalidation-only).
  Publishing emits an HMAC-signed, constant-time-verified admin→public
  signal that calls `revalidateTag(..., "max")` in the public app's route
  handler. Request-specific values (host, headers, draft state) are read
  outside `use cache` and passed as arguments.
- **No route-segment cache config.** The segment-config rule above is a hard
  contract for the public app: no `revalidate`/`dynamic`/etc. anywhere in
  public routes — a structural CI assertion enforces it. Draft Mode is a
  dynamic-rendering switch only. Phase 22 D10 independently requires current
  exact Phase 12 authorization for one saved revision or immutable candidate,
  re-proved on every HTML/data/media/refresh request, plus private/no-store and
  non-indexable response handling. A Draft Mode cookie grants no authority and
  preview never populates the published cache.
- **Phase 22 D14 presentation split.** The Phase 22 compiler owns the immutable
  release-bound Public Search & Sharing Presentation Manifest and its distinct
  Search/Share semantics; the Phase 5 runtime owns exact verified-host/Site/
  locale HTTP, complete initial HTML/head, `GET`/`HEAD`, canonical/alternate,
  robots and sharded-sitemap, certified-card/asset, and cache transport. Every
  output resolves one current manifest coverage digest. There is no client-only
  or bot-only metadata authority, root/cross-Site/unsafe-locale fallback, raw
  CMS/CRM/Storage read, or provider-index state as truth. Current global SEO
  helpers, raw/name-derived worker URLs, generic JSON-LD, fictional Update share
  URLs, and inert Share controls are migration evidence, not D14 compliance.
- **Phase 22 D15 transport split.** Phase 5 may serve only one same-origin,
  fixed-schema, best-effort post-render or explicit-action `POST` seam; D15
  owns the four metric meanings, exact release re-resolution, admission,
  idempotency, aggregation, correction, retention, and report coverage. `GET`,
  `HEAD`, render, RSC/prefetch, preview, sitemap, crawler, social-card, scanner,
  monitor, and provider requests never emit a Measurement Occurrence. Share and
  Give behavior runs first and never awaits measurement, so D15 failure cannot
  change the response, cache, public action, cart, or checkout. Current public-
  route Session Replay is an activation blocker and independent telemetry, not
  D15 history or transport.
- **Phase 22 D16 authoring/API split.** Missionary and staff editors are thin
  clients for one server-owned semantic authoring boundary in `packages/api`.
  They send opaque target/action identities; the server derives Tenant and actor
  scope, reauthorizes the exact D1 working revision and D3 field/block, resolves
  Phase 10 and the exact Phase 21 D10 binding, reloads the minimum source, and
  invokes a certified provider adapter. Provider credentials, raw hidden
  context, source prose in job payloads, and acceptance logic never live in
  client code or generic Tiptap/Lexical toolbars. Apply independently re-proves
  the target digest and CAS-creates one ordinary working revision. Translate to
  English additionally pins one certified source-language → existing exact
  Phase 24 English-locale pair; it creates no locale or release state.
- **Phase 22 D18 runtime-composition split.** Phase 5 executes the public
  runtime and cache mechanics; Phase 22 owns Public Ministry semantics,
  current-serving admission, and adverse-first convergence across controlled
  surfaces. No Asym-controlled HTML, RSC/data, metadata, sitemap, search,
  media, redirect, or CDN response may bypass the current-serving evaluation,
  and no Payload state, cache, deployment, provider result, or worker becomes a
  second public authority. See
  [ADR-0135](../../adr/0135-release-bound-public-ministry-runtime-composition.md).

## Shared Health Contract

`admin`, `donor`, and `missionary` expose `/api/health` through
`@asym/api/health/app`. The route stays thin in each app and returns both the
legacy `status` / `checks.supabase` fields and Phase 11 release-health metadata
under `observability`, including surface, checked time, release commit/ref,
environment, runtime, and Supabase probe latency. The production readiness
verifier reads that metadata to confirm the live release matches the target
commit when the deployment exposes a non-`unknown` commit.

## Route Inventory

> **Note (2026-07-06):** the Twenty CRM integration is retired
> ([ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md));
> the Twenty gateway and webhook routes below exist as dormant code and stay
> listed until the scheduled cleanup ticket removes them.

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
| admin      | `/api/admin/eve/admin-memory`                                  | Node.js (no `runtime` segment export) | Owner-bound private Eve memory and history    |
| admin      | `/api/admin/eve/approval-budget`                               | Node.js (no `runtime` segment export) | Audited trust-zone and hard-budget tracer     |
| admin      | `/api/admin/eve/engineering-monitors`                          | Node.js (no `runtime` segment export) | Safe engineering monitor status and findings  |
| admin      | `/api/admin/eve/retention`                                     | Node.js (no `runtime` segment export) | Private replay artifacts, holds, and expiry   |
| admin      | `/api/admin/eve/governance`                                    | Node.js (no `runtime` segment export) | Eve governance, kill switches, and audit      |
| admin      | `/api/admin/eve/launch-readiness`                              | Node.js (no `runtime` segment export) | Target-bound launch review and control        |
| admin      | `/api/admin/eve/model-policy`                                  | Node.js (no `runtime` segment export) | Permissioned Eve model-policy control plane   |
| admin      | `/api/admin/eve/notifications`                                 | Node.js (no `runtime` segment export) | Safe operator notification status and control |
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
| admin      | `/api/playwright-ready`                                        | Node.js (no `runtime` segment export) | DB-independent Playwright readiness probe     |
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
| donor      | `/api/playwright-ready`                                        | Node.js (no `runtime` segment export) | DB-independent Playwright readiness probe     |
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
| admin | `/api/admin/contribution-operations/receipt-snapshots/[snapshotId]/pdf`       | Node.js (no `runtime` segment export) | Updated receipt snapshot PDF download     |

## Phase 22 D17 public-subject runtime split

The CRM operational layer owns Ministry Project identity/lifecycle; Phase 13
owns Giving Campaign and Designation sources; Phase 22 owns the exact typed Page
Subject Binding; Payload owns authored presentation; and Phase 5 serves only the
current release-pinned Phase-10-safe subject snapshot. The current public CMS
Project Page route and `fundId` serializer are migration evidence, not this
contract. No anonymous route may query raw source or binding tables, and D7
remains the independent CTA/Giving authority even when the same Designation is
also the Page subject.

## Phase 22 D19 Missionary subject and support-access split

The CRM operational layer owns Ministry Assignment identity and effective-dated
Party memberships; Phase 22 owns the Missionary Page Subject Binding plus
separate display/contributor facts; Phase 21 owns any finance-authorized
Ministry-Assignment-to-Support-Assignment binding; and Phase 12 is the sole
server-side policy decision point for each person's exact Support Workspace
projection. The public runtime consumes only the release-pinned Phase-10-safe
Missionary subject snapshot. Authenticated support reads use coarse Tenant RLS
as defense in depth and then re-prove current purpose, target, module, field,
currency, history floor, and authorization epoch server-side. Raw financial
tables and Realtime payloads are never browser authorities, and a page,
membership, marriage, team relationship, Designation, notification preference,
or Support Binding grants no financial access.

## Phase 22 D20-D21 Public Ministry catalog and reader transition

The current generic Payload blocks, mock `/workers` data, published-only public
handlers, duplicated serializers, and donor fetch caches are prototype and
migration seams. D20 requires one immutable family-qualified semantic catalog
generation for each Page family and an exact-generation-pinned D2 release; D21
then adopts the smallest complete Site/verified-host/locale dependency closure
through private, non-authoritative preparation and one CAS-guarded reader-
generation transition. The final transaction compares precomputed immutable
digests and owner epochs, appends its receipt, and emits a D18 cause; it does not
rescan the cohort or lock Payload, Vercel, crawlers, or social providers.

After that transition, the Phase 5/D18 gateway is the only public reader. Old
deployments and cache namespaces must honor the current cohort head or fail
closed; runtime rollback, collection flags, provider status, or cache purge
cannot restore the pre-Phase-22 reader. A frozen compatible-legacy renderer may
serve only an immutable D2 release normalized into the current gateway and may
never perform request-time raw legacy reads or accept later legacy edits.

## Phase 22 D22 Public Page operations projection split

Current Payload collection lists and `_status`, the public directory, and the
generic Mission Control `/api/admin/mission-control/needs-attention` and task
surfaces are migration or UI evidence only; D22 is not implemented by them.
D22 privately derives permission-filtered source causes and Page impacts into
exactly three stable views: **To review**, **Needs attention**, and **All
pages**. It creates no Page health or resolution state. Its actions route to the
applicable current source-owner command boundary, and an optional same-scope
shared task may coordinate follow-up only. Task completion, dismissal, or
deletion closes no source cause or Page impact.

## Phase 22 D23 Public Page setup/settings projection split

The current mutable `org-settings` JSON, Payload preferences and collection
defaults, tenant-only pickers, and browser settings forms are not D23 authority.
D23 privately composes exact source-owned profile versions and capability facts
for one complete authorized scope. One literal Change action re-proves current
owner truth and invokes only that owner's typed immutable-successor command.
The projection stores no setting, public-serving state, readiness, activation,
operations resolution, AI credential, or per-Page choice. Missing or unavailable
owner truth fails honestly without changing the public runtime.

## Phase 22 D24 staff-revision command split

The browser and Web Studio editor remain thin. Payload may prepare one private,
structurally inert content version under the authenticated actor with
`overrideAccess: false` and `overrideLock: false`; its roles, locks, autosaves,
status, restore, and native publish controls are not authority. One Phase 22
server command re-proves the exact Phase 12 staff edit capability and D3/D20
allowlist, records actor/predecessor/content-source provenance, and idempotently
CAS-advances the D1 working head. Ambiguous outcomes use authoritative readback
and inspect-before-retry; abandoned prepares use orphan reconciliation. D4/D5
and D2 remain the only review and release lane.

## Phase 22 D25 derived-action and recovery split

The browser receives only a permission-filtered, disposable Editorial
Actionability Evaluation; it never decides whether stored work is actionable.
The Phase 22 server resolver reads current D1-D24 owner heads, and the selected
owner command repeats its exact proof at commit. Operational Postgres receives
no D25 status, queue, recovery body, per-autosave event, expiry scan, or
materialized projection.

Payload may store one private mutable recovery buffer for the exact Page and
locale beneath the expected coherent working head and editor lease. Only an
immutable sealed semantic version and digest may enter a D1 revision or D4/D5
candidate reference. D24's reference-safe reconciler owns scratch and inert-
prepare cleanup; ambiguity preserves the item. Review or reuse routes back
through one newly attributed, same-scope D1 successor and never restores,
merges, submits, publishes, or creates a second head.

## Phase 22 D26 candidate-attestation split

Current browser copy, upload completion, Payload roles, terms, `_status`, and
native publish create no D26 evidence. The Phase 22 server's existing final
submit/publish command alone re-proves the actual actor and exact scope, then
atomically records the immutable candidate and constant-size Public Content
Sharing Attestation. D2 or D11 references it at release; the public runtime
performs no attestation lookup. There is no new table, checkbox, mutable Page
flag, inherited evidence, or provider bypass.
