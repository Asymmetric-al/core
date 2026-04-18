# Support Hub — Final audit and wrap-up

This is the canonical "what actually shipped" record for the Donor Care
Support Hub stack. It supersedes the optimistic claims in some of the earlier
phase docs. Read this first when you pick the work back up.

## PRs reviewed

| PR                                                     | Phase   | Title                                                                                          | Status                                                                                                                                                                                                             |
| ------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [#185](https://github.com/Asymmetric-al/core/pull/185) | Phase 1 | docs(support-hub): phase 1 discovery, file map, and parity map                                 | Draft, on the stack                                                                                                                                                                                                |
| [#186](https://github.com/Asymmetric-al/core/pull/186) | Phase 2 | feat(support-hub): phase 2 — typed data foundation, collections, hooks, route state            | Draft, on the stack                                                                                                                                                                                                |
| [#187](https://github.com/Asymmetric-al/core/pull/187) | Phase 3 | feat(support-hub): phase 3 — donor-care inbox page (board, table, stats, view tabs)            | Draft, on the stack                                                                                                                                                                                                |
| [#188](https://github.com/Asymmetric-al/core/pull/188) | Phase 4 | feat(support-hub): phase 4 — conversation detail, timeline, and TipTap composer                | Draft, on the stack                                                                                                                                                                                                |
| #189                                                   | —       | **Does not exist.**                                                                            | Verified via `https://github.com/Asymmetric-al/core/pull/189` returning HTTP 404 and the workspace PR listing skipping straight from #188 to #190. The original numbering omitted #189 (PR numbers are repo-wide). |
| [#190](https://github.com/Asymmetric-al/core/pull/190) | Phase 5 | Support Hub Phase 5 — Productivity, internal collaboration, and fast actions                   | Draft, on the stack                                                                                                                                                                                                |
| [#191](https://github.com/Asymmetric-al/core/pull/191) | Phase 6 | Support Hub Phase 6 — Reports, Inbox Settings, SLA Rules, and Automation                       | Draft, on the stack                                                                                                                                                                                                |
| [#192](https://github.com/Asymmetric-al/core/pull/192) | Phase 7 | Support Hub Phase 7 — Adapter boundary, CRM hooks, a11y / perf / failure-recovery, tests, docs | Draft, on the stack — final wrap-up commits land here                                                                                                                                                              |

So the Support Hub stack is **seven PRs across seven phases**, even though
the last PR number is #192. Nothing was lost.

## Completed scope by phase

Each entry was verified against the repo on the Phase 7 branch
(`cursor/support-hub-phase-7-hardening-1899`).

### Phase 1 — discovery

- `docs/features/support-hub/phase-01-discovery.md` (full spec).
- `docs/features/support-hub/file-map.md` (concrete file map).
- `docs/features/support-hub/chatwoot-gray-parity-map.md` (parity matrix).
- No production code.

### Phase 2 — data foundation

- Typed domain in `apps/admin/features/support-hub/types/*` and the
  collection schemas in `packages/database/collections/support-hub.ts`.
- Mock data inside the collection module + `useSupportXLive` hooks in
  `packages/database/hooks/support-hub.ts`.
- TanStack Query keys + the `supportStore` adapter in
  `apps/admin/features/support-hub/stores/support-store.ts`.
- Route-state helpers (`apps/admin/features/support-hub/lib/route-state.ts`).
- `apps/admin/features/support-hub/hooks/use-support-mutations.ts` writes
  via the TanStack DB collection writers; no API round-trip.

### Phase 3 — inbox page

- Replaced the static `/support` page with the live workspace.
- Stats strip, view tabs, status / label / assignee filters, board view
  (HTML5 DnD), table view (`DataTableResponsive`), URL state via `nuqs`.
- Detail pane was a placeholder.

### Phase 4 — conversation detail + composer

- Real `ConversationDetail`, header, timeline, composer based on the
  shared TipTap `EditorRoot`.
- Reply / private-note modes, drafts, attachments stub, signature toggle.
- Mutations write through `useSendSupportReply` and
  `useAddSupportPrivateNote` — both still talking to the in-memory
  collection.

### Phase 5 — productivity

- Saved views CRUD, label management, macros (with action runner),
  canned responses (with slash insertion), `@`-mentions in private
  notes via Tiptap suggestion / mention extensions, round-robin
  assignment helper, support-local command palette + keyboard shortcuts.
- Activity log writes a `type: "system"` row through the collection.

### Phase 6 — settings + reports + automation

- Nested routes under `/support/reports/*` and `/support/settings/*`.
- 12 settings panels, 5 report surfaces, typed automation rule builder
  with dry-run preview.
- Three new collections (automation rules, signatures, notification
  preferences). Six new report slices.
- Server-side report aggregator (`lib/report-aggregations.ts`) runs in
  the browser today.

### Phase 7 — hardening + adapter boundary

- New `packages/api/src/admin/support-hub/*` adapter layer (types,
  in-memory implementation, single swap point in `adapter/index.ts`,
  Zod schemas, route helpers, reads / mutations / inbound-router stub /
  server-side macro runner).
- 30 thin route handlers under `apps/admin/app/api/admin/support/**`.
- Adapter fixtures live inside the api package
  (`packages/api/src/admin/support-hub/adapter/fixtures.ts`) so the
  server-side code never crosses the `"use client"` boundary into the
  TanStack DB collections module.
- CRM cross-link chips (`ConversationCrmLinks`).
- A11y audit (board + composer + focus-return), perf audit (board column
  pagination, table virtualization, memoized report request shape),
  inline failure-recovery banner.
- 47 new unit / component tests + 1 e2e smoke spec. Workspace total:
  528 / 121.
- Operator + admin + release docs under `docs/features/support-hub/`.

## Missing scope by phase

Each entry is documented on the responsible phase but never landed.

- **Phase 1 spec called for** a `supabase/migrations/<ts>_support_hub_foundation.sql`
  file inside the "MVP (Phase 2 build)" row of `§ 3.6`. **Not shipped in
  any phase.** No `support_*` tables exist.
- **Phase 1 spec called for** the inbound webhook router to be wired into
  `packages/api/src/email/webhooks/resend.ts` `email.received` branch as
  part of MVP. **Not shipped in any phase.** Phase 7 added a typed stub
  in `packages/api/src/admin/support-hub/inbound-router.ts` but did not
  wire it; `routeInboundToSupportHub()` is unreferenced outside its own
  unit test.
- **Phase 1 spec said** the API layer would be wired through 30 thin
  route handlers and the UI would consume them. Phase 7 built the
  handlers and the adapter, but the UI continues to read + write through
  the TanStack DB collections directly. The API layer is dead code from
  the UI's perspective today.
- **Outbound `sendEmail()`** is never called. The Phase 4 composer flips
  the message `deliveryState` to `"queued"` and writes the row, but no
  Resend send is dispatched. There is no `email_send_logs` insert.
- **CSAT collection + report.** Phase 1 reserved `support_csat_responses`
  and a CSAT report slice; the table was never created and the report
  surface was never built.
- **Knowledge-base article insertion** in the composer. Listed in the
  Phase 6 prompt + Phase 7 follow-up; no implementation.
- **Live CRM hydration** in the contact sidecar. Phase 7 ships safe
  deep-link chips (`ConversationCrmLinks`); no live donor profile / gift
  history / missionary lookup.
- **Mention notifications** (Resend digest emails + Mission Control
  bell). Phase 5 writes a `type: "system"` activity row when a mention
  is inserted; no email or in-app delivery.
- **Live business-hours-aware SLA timers.** Phase 6 reports apply the
  business-hours filter post-hoc; there is no live timer that pauses
  outside of business hours.

## Source-of-truth analysis

For every Support Hub data flow, here is the runtime path that actually
runs today vs. the path that the Phase 7 adapter layer was built to
support.

| Flow                                                                                                                                   | UI path today                                                                                              | Phase 7 surface (built, unwired)                                                                                            | Phase 8 path                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Conversation list read                                                                                                                 | `useSupportConversations` → `useSupportConversationsLive` → TanStack DB collection                         | `GET /api/admin/support/conversations` → `listSupportConversations` → adapter                                               | UI swaps to `useQuery` against the route + cache invalidation tags                      |
| Conversation detail read                                                                                                               | `useSupportConversation` → live query                                                                      | `GET /api/admin/support/conversations/[id]`                                                                                 | Same swap                                                                               |
| Send reply / save draft                                                                                                                | `useSendSupportReply` → `supportStore.collections.messages.insert(...)` (no Resend send)                   | `POST /api/admin/support/conversations/[id]/replies` → adapter writes the message row + (today) does not call `sendEmail()` | Adapter calls `sendEmail()` from `@asym/email` and writes back the `outboundSendLogId`  |
| Private note                                                                                                                           | `useAddSupportPrivateNote` → collection insert                                                             | `POST /api/admin/support/conversations/[id]/notes`                                                                          | UI swap                                                                                 |
| Assignment / status / label / snooze                                                                                                   | mutation hook → collection update                                                                          | `PATCH /api/admin/support/conversations/[id]/{assign,status,labels,snooze}`                                                 | UI swap                                                                                 |
| Macro run                                                                                                                              | `useRunSupportMacro` → client-side macro runner walks the action sequence through the local mutation hooks | `POST /api/admin/support/conversations/[id]/run-macro` → `runSupportMacroOnServer`                                          | UI swap or server runtime call                                                          |
| Settings save (inbox / SLA / business hours / signature / automation / notifications / labels / macros / canned / saved views / teams) | `useSaveSupportXxx` → collection update                                                                    | `POST` / `PATCH` / `DELETE /api/admin/support/{...}`                                                                        | UI swap                                                                                 |
| Reports                                                                                                                                | `useSupportReport(request)` → in-browser `buildReportSeries` over live TanStack DB collections             | `GET /api/admin/support/reports` returns raw rows; the in-browser aggregator stays the source of truth for now              | Server-side aggregation (still TBD)                                                     |
| Automation rules                                                                                                                       | dry-run uses `evaluateSupportAutomationRule` against the live collection; no live runtime evaluator        | `POST` / `PATCH` / `DELETE /api/admin/support/automation-rules[/:id]`                                                       | Phase 8 inbound webhook + scheduler runs the same pure evaluator                        |
| Inbound email                                                                                                                          | None                                                                                                       | `routeInboundToSupportHub()` stub returns `{ status: "deferred" }`                                                          | Wire into `packages/api/src/email/webhooks/resend.ts` `email.received` branch           |
| Outbound email                                                                                                                         | None                                                                                                       | Adapter sets `deliveryState: "queued"` but never calls `sendEmail()`                                                        | Adapter calls `sendEmail()` and writes back `outboundSendLogId` + `email_send_logs` row |

`Grep` evidence:

- `apps/admin/features/support-hub/**` contains zero matches for
  `@asym/api/admin/support-hub` or `/api/admin/support/`. The UI does
  not import the adapter and does not fetch the route handlers.
- `packages/api/src/email/webhooks/resend.ts` contains zero references to
  `routeInboundToSupportHub`, `support_messages`, or `support_conversations`.
- `supabase/migrations/*` contains zero files matching `*support_*`.

## Production readiness analysis

| Surface                                                                                                           | Wired today        | Notes                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/support` inbox + board + table + view tabs + filters + saved views                                              | Yes (in-memory)    | Reads + writes the in-memory TanStack DB collection. State survives within a process; resets on restart.                                                                                                          |
| Conversation detail (header, timeline, composer, signature, drafts, attachments)                                  | Yes (in-memory)    | TipTap composer is real; send and draft flows write to the in-memory collection. No Resend send.                                                                                                                  |
| Private notes, labels, macros (incl. dry-run), canned responses, saved views, command palette, keyboard shortcuts | Yes (in-memory)    | Phase 5 work landed end-to-end against the live collection.                                                                                                                                                       |
| Reports (overview / agents / teams / labels / inbox) + filters + CSV / JSON export                                | Yes (in-memory)    | The in-browser aggregator runs against the live collection. CSV / JSON export is browser-only via Blob.                                                                                                           |
| Settings (12 panels)                                                                                              | Yes (in-memory)    | Each settings form writes through the matching `useSupportSaveXxx` mutation, which hits the TanStack DB collection. **Does not** fetch or post to the new route handlers.                                         |
| Automation rule builder (dry-run + CRUD)                                                                          | Yes (in-memory)    | The pure evaluator runs against the live collection during dry-run; no live event source today.                                                                                                                   |
| `packages/api/src/admin/support-hub/*` adapter                                                                    | **Built, unwired** | Reachable only via tests + the route handlers below. Provides the swap surface for Phase 8.                                                                                                                       |
| `apps/admin/app/api/admin/support/**` route handlers                                                              | **Built, unwired** | Role-gated via `requireSupportHubAccess()`. **Do not expose to a multi-tenant deployment without first landing the tenant-isolation fix on `cursor/critical-correctness-issues-b783@4357b908` (see Open risks).** |
| Supabase persistence                                                                                              | **None**           | No `supabase/migrations/*` for `support_*` tables.                                                                                                                                                                |
| RLS for support tables                                                                                            | **None**           | Tables do not exist.                                                                                                                                                                                              |
| Inbound email pipeline                                                                                            | **None**           | Stub only. The Resend `email.received` branch in `packages/api/src/email/webhooks/resend.ts` does not call `routeInboundToSupportHub()`.                                                                          |
| Outbound email pipeline                                                                                           | **Mock**           | Adapter writes a message row with `deliveryState: "queued"`; no `sendEmail()` call to Resend.                                                                                                                     |
| CSAT collection + reports                                                                                         | **None**           | Reserved in Phase 1 spec; never built.                                                                                                                                                                            |
| Knowledge-base article insertion                                                                                  | **None**           | Listed in follow-ups; never built.                                                                                                                                                                                |
| Live CRM hydration                                                                                                | **None**           | Phase 7 ships safe deep-link chips only.                                                                                                                                                                          |
| Mention notifications (email + bell)                                                                              | **None**           | Mention writes a `type: "system"` activity row; no delivery.                                                                                                                                                      |

**Summary:** the Support Hub is **demo-ready** as a self-contained
in-memory donor-care workspace. It is **not production-ready for live
donor email support** because real persistence, real inbound email, and
real outbound email are all still open work.

## Open risks

- **Cross-tenant data exposure in the Phase 7 in-memory adapter (high
  severity, flagged by the automated review on PR #192 on 2026-04-18).**
  The 30 new route handlers correctly call
  `requireSupportHubAccess()`, which derives `tenantId` from the
  authenticated session — but the adapter call sites then never pass
  that `tenantId` into `listSupportConversations`, `getSupportConversation`,
  or any of the registry / mutation reads. The in-memory adapter
  responds to every authenticated staff caller with the same
  module-scoped store. **A staff/admin user from `tenant-a` can read
  and mutate fixture rows that belong to `tenant-b`** (or to the demo
  tenant) once the route handlers are exposed beyond a single-tenant
  deployment. Not exploitable today (no UI client calls the routes
  - the in-memory store seeds a single demo tenant), but it must be
    fixed before Phase 8 swaps the adapter to Supabase. A proposed fix
    using `AsyncLocalStorage` to thread the request `tenantId` through
    the adapter exists on `cursor/critical-correctness-issues-b783`
    commit `4357b908`; cherry-pick or fold into Phase 8.
- **Spec drift in Phase 1 discovery.** The Phase 1 doc still says
  migration + RLS + inbound router were Phase 2 work and that
  TanStack DB collections were not in MVP. Both are inverted in the
  shipped reality. The Phase 7 callout in `phase-01-discovery.md` (added
  in this wrap-up) flags it; future readers should consult this audit
  document for the truth.
- **Dead-code maintenance burden.** The adapter + route handlers exist
  but are not exercised by any UI surface in this repo. They will rot
  unless Phase 8 swaps them in or they pick up an external consumer
  soon. A periodic typecheck + the existing
  `tests/unit/packages/api/admin/support-hub/*` suites are the only
  thing keeping them honest.
- **E2E smoke spec depends on demo session install.** The new
  `tests/e2e/support-hub.smoke.spec.ts` will skip itself when the demo
  account install fails. It has not been run end-to-end against a live
  admin app inside this PR.
- **Two seed surfaces.** The TanStack DB collections in
  `packages/database/collections/support-hub.ts` and the api adapter
  fixtures in `packages/api/src/admin/support-hub/adapter/fixtures.ts`
  define overlapping but not identical donor-care data. The api fixtures
  are a deliberate compact subset (3 agents / 2 teams / 3 labels / 1
  macro / etc). Drift between the two is fine while the API surface is
  unwired; Phase 8 will collapse them.
- **Two macro runners.** The client-side runner in
  `apps/admin/features/support-hub/lib/macro-runner.ts` (uses the
  TanStack Query mutation bag) and the server-side runner in
  `packages/api/src/admin/support-hub/mutations/run-macro.ts` (talks to
  the adapter directly). Phase 8 should keep both — they share the same
  `SupportMacroAction` shape — but one of them should be removed if the
  UI swaps fully to API-routed mutations.

## Phase 8 follow-up checklist

The exact files Phase 8 needs to change. Most of these are already
documented in `release-notes.md`; this list consolidates them and adds
the file-level references.

0. **Tenant isolation (must land before any Supabase swap or any
   multi-tenant deployment of the Phase 7 routes).** Cherry-pick or
   re-implement the fix on `cursor/critical-correctness-issues-b783`
   commit `4357b908`: a `request-context.ts` `AsyncLocalStorage` wrapper
   that threads the authenticated `tenantId` through
   `withSupportHubAccess()` into every adapter call, plus filter
   enforcement on `matchesConversationFilter`, `get`, `listMessages`,
   the registry `list()` methods, and a `SUPPORT_HUB_TENANT_MISMATCH`
   write guard mapped to a 403. Then port `tenant-isolation.test.ts`
   alongside the existing reads-mutations suite.
1. `supabase/migrations/<ts>_support_hub_foundation.sql` — Phase 1 §3.4
   schema + Phase 6 additions (automation, signature, notification
   tables) + RLS + indexes. Add the rollback migration alongside.
2. `packages/api/src/admin/support-hub/adapter/supabase.ts` — implement
   the `SupportHubAdapter` interface against the new tables using
   `getAdminClient` from `@asym/database/supabase/admin`.
3. `packages/api/src/admin/support-hub/adapter/index.ts` — flip the
   single re-export from `inMemorySupportHubAdapter` to
   `supabaseSupportHubAdapter`.
4. `packages/api/src/admin/support-hub/mutations/conversations.ts`
   `sendSupportReply` — call `sendEmail()` from `@asym/email` and persist
   the `outboundSendLogId` on the message row.
5. `packages/api/src/email/webhooks/resend.ts` — inside the existing
   `email.received` branch, look up the inbox via the recipient address,
   thread the message, and call `routeInboundToSupportHub()`. The
   inbound router itself needs its body filled in (today it returns
   `{ status: "deferred" }`).
6. `packages/database/collections/support-hub.ts` — gate the in-memory
   seed behind `NODE_ENV !== "production"` so production tenants start
   clean, and consider replacing the live-collection hooks with TanStack
   Query hooks that call the route handlers.
7. `apps/admin/features/support-hub/hooks/use-support-*.ts` — replace
   `useSupportXxxLive` with `useQuery` against the matching route
   handler if Phase 8 chooses the client-side swap. (The alternative is
   to keep the collections as a client cache and have a sync mechanism
   that hydrates them from the API.)
8. `tests/unit/packages/api/admin/support-hub/reads-mutations.test.ts`
   — re-target this suite at the Supabase implementation (or keep the
   in-memory variant for CI speed and add a parallel Supabase suite).
9. `tests/e2e/support-hub.smoke.spec.ts` — promote from "skip when demo
   account is unavailable" to a hard requirement once the migration
   ships, and add assertions for inbound + outbound email round-trip.

## Where to look for the sources of drift

For future reference: each phase doc is the historical statement of
intent for that phase, but they sometimes promise work for "future
phases" that never materialized in those numbers. **This audit document
is the authoritative source for what is actually shipped.** When a phase
doc disagrees with this audit, the audit is right.

- `phase-01-discovery.md` — drift in `§ 2.7` (TanStack DB) and `§ 3.6`
  (phase numbering).
- `chatwoot-gray-parity-map.md` — drift in the "Phase 3 / Phase 4"
  columns; the actual shipping phases are 5, 6, and 7.
- `admin-guide.md` — drift in the "Posts to" column; corrected in this
  wrap-up to "Phase 8 target endpoint".
- `release-notes.md` — already mostly accurate; the e2e smoke claim is
  softened in this wrap-up.

## Summary

The Donor Care Support Hub is a coherent, demo-ready, accessible donor
care workspace inside Mission Control. The runtime data path is the
Phase 2 in-memory TanStack DB collection. The Phase 7 server-side
adapter + 30 route handlers + inbound stub are intentionally unwired
from the UI today and exist as the documented swap point for Phase 8.

Until Phase 8 lands the Supabase migration, swaps the adapter export,
and wires the Resend `email.received` branch, the Support Hub is **not**
production-ready for live donor email support — but every UX surface,
keyboard interaction, automation rule, report, and settings panel is
ready to go the moment that swap happens.
