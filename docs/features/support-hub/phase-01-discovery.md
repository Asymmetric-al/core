# Support Hub — Phase 1 Discovery & Build Spec

> Status: spec only. No feature code is shipped in this phase. Later phases
> consume this document as the source of truth for the architecture.
>
> Sister documents:
>
> - [`file-map.md`](./file-map.md) — concrete file/folder layout
> - [`chatwoot-gray-parity-map.md`](./chatwoot-gray-parity-map.md) — feature
>   parity matrix for the two donor systems

## 1. Goal

Build a donor-care **Support Hub** inside the Mission Control admin app to
manage every donor question that arrives by email. The result must feel
fully native to Mission Control:

- **Structure donor:** [`Jason-uxui/gray-ui-csm`](https://github.com/Jason-uxui/gray-ui-csm)
  — drives the inbox layout, board ↔ table layout switch, sidebar filter rail
  (Views / Categories / Priority), search toolbar, view slices
  (`all | mine | unassigned | past-due | escalated`).
- **Behavior donor:** [`chatwoot/chatwoot`](https://github.com/chatwoot/chatwoot)
  CE — drives the conversation lifecycle (open / pending / snoozed /
  resolved), email thread rendering, reply composer, private notes,
  assignment to agent and team, labels, macros, canned responses,
  signatures, mute, send-transcript, business hours, SLA.
- **Visual finish:** the existing repo Maia / Zinc theme via
  `MCShell` + `PageShell` + `@asym/ui`.

Neither donor's source code ships in our repo. We study them, then we
implement the same surfaces using our own stack.

## 2. Repo realities discovered

These are the load-bearing facts that the rest of this spec assumes are
true. Each is grounded in a current file in the repo.

### 2.1 Mission Control shell

- Root layout: `apps/admin/app/layout.tsx` mounts
  `ThemeProvider (forcedTheme="light") → BoneyardRegistry → QueryProvider →
MotionProvider → Suspense → NuqsAdapter → MCShell`.
- Shell: `apps/admin/app/mc-shell.tsx` (`MCShell`,
  `ApplicationShell`, `AppSidebar`, `AppHeader`,
  `RouteMainViewTransitionBoundary`).
- Page chrome: `packages/ui/components/shadcn/page-shell.tsx` (`PageShell`).
- Nav already lists Support Hub: `mc-shell.tsx` (`toolNav`),
  `packages/lib/mission-control/nav.ts`, `packages/config/tiles.ts`,
  `packages/config/navigation.ts`. Roles for `/support` =
  `member_care | admin` (matches our `requireSupportHubAccess()` decision
  below).
- Forced light theme is intentional and must be preserved.

### 2.2 Existing `/support` page

- `apps/admin/app/support/page.tsx` is a static placeholder built from
  `PageShell`, `Card`, and motion tiles. It will be **replaced** in a later
  phase with the real inbox; this phase only documents the replacement.

### 2.3 Shared UI primitives we will reuse

- `@asym/ui/components/shadcn/data-table` exposes
  `DataTableResponsive`, URL state hooks (`useDataTableUrlState`,
  `useDataTableStateWithUrl`), virtualization
  (`useDataTableVirtualization`), faceted filters, advanced filter builder,
  saved filters, mobile card view, mutation
  (`useDataTableMutation`, `useDataTableBulkMutation`,
  `useCollectionMutation`), realtime (`useSupabaseRealtime`,
  `useDataTableWithRealtime`), CSV export, and cell variants
  (`BadgeCell`, `AvatarCell`, etc.). This is the canonical table system in
  the repo and is the right tool for the Support Hub list and table views.
- `@asym/ui/components/shadcn/data-grid` exists too, but it is a spreadsheet
  primitive (`DataGridCell`, copy/paste/undo) and not a fit for the inbox.
- `@asym/ui/components/shadcn/sidebar` (`Sidebar`, `SidebarMenu`,
  `SidebarMenuBadge`, `SidebarGroup`, etc.) is what the donor's
  ticket sidebar filters were built on; we reuse it for the inbox sub-rail.
- `@asym/ui/components/shadcn/rich-text-editor` exposes
  `EditorRoot` / `EditorContent` / `EditorToolbar` / `RichTextViewer` /
  `LegacyRichTextEditor`, all backed by Tiptap with
  `immediatelyRender: false`. This is the **only** rich-text editor we use,
  for both the reply composer and private notes.
- Stat cards, badges, sheets, dropdowns, command, kbd, separator, tooltip,
  empty, sonner toasts, motion, view-transitions are all available under
  `@asym/ui/components/shadcn/*`. No new primitives are required for MVP.

### 2.4 Email plumbing already in place

The Resend integration is fully wired and the Support Hub will plug into it
rather than reinvent it. Source of truth lives in:

- Migration: `supabase/migrations/20260223120000_resend_email_foundation.sql`
- Schema snapshot: `supabase/migrations/20260402100000_resend_validation_snapshot.sql`
- API: `packages/api/src/email/{connect,test-send,settings-store,crypto}.ts`
- Webhook router: `packages/api/src/email/webhooks/resend.ts`
- Client surface: `packages/email/{resend,types,constants,deliverability-warnings}.ts`
- Routes: `apps/admin/app/api/email/{connect,test-send,webhooks/resend}/*`

Tables we depend on:

- `tenant_email_settings` — connection state, default sender, encrypted
  API key, webhook URL.
- `email_send_logs` — outbound sends with idempotency_key, correlation_id,
  status, `resend_message_id`, error fields.
- `email_events` — outbound delivery/open/click/bounce/complaint events.
- `email_suppressions` + `email_suppression_groups`.
- `email_inbound_messages` — every `email.received` webhook lands here with
  `from`, `to/cc/bcc`, `subject`, `payload jsonb`, `parsed_text`,
  `parsed_html`, `attachment_count`, `received_at`, deterministic
  `resend_email_id`.

Inbound retrieval helpers exist:
`getReceivedEmail()` and `listReceivedEmailAttachments()` in
`packages/email/resend.ts`.

### 2.5 Data-access boundary

- `docs/guides/architecture/data-access-boundary.md`: route handlers in
  `apps/*/app/api/**` are thin re-exports; business logic lives in
  `packages/api/src/*`. We follow this exactly.
- `docs/ai/rules/backend.md`: server uses `@asym/database/supabase/server`
  (or admin); client uses the singleton browser client. RLS assumed active.
  Mutations validated with Zod.
- Auth helpers: `getAuthContext()` and `hasAnyContextRole()` from
  `@asym/auth/context`. The pattern we mirror is
  `packages/api/src/admin/member-care/route-helpers.ts`
  (`requireMemberCareAccess()` returning a discriminated union).

### 2.6 Frontend rules

- `docs/ai/rules/frontend.md`: Maia/Zinc tokens only, `cn()` for class
  merging, no arbitrary Tailwind values, shadcn additions go through
  `--cwd packages/ui`, complex client forms use TanStack Form + Zod, simple
  filter/search forms can be native or `next/form`, no Zustand.
- `apps/admin/next.config.ts` enables `cacheComponents: true` and
  `reactCompiler.compilationMode = "annotation"`. The inbox page is a
  client component (it owns interactive state) and is therefore unaffected
  by Cache Components, but server reads in `packages/api` must remain
  request-scoped.

### 2.7 TanStack stack already in repo

- `@tanstack/react-table` 8.21+, `@tanstack/react-query` 5.96+,
  `@tanstack/react-virtual` 3.13+. `nuqs` 2.8+ is mounted at the root via
  `NuqsAdapter`. No TanStack DB collections in MVP — the
  `useDataTableMutation` + `useSupabaseRealtime` combo already covers our
  needs and is what the Contributions surface uses.

## 3. Locked decisions

### 3.1 Route shape

- **Default route stays `/support`.**
- Inbox state lives in URL search params via `nuqs` so deep links and
  saved views work out of the box:
  - `view` — one of `all | mine | unassigned | past-due | escalated`
    (gray-ui-csm structural slice). Default `all`.
  - `layout` — one of `board | table` (gray-ui-csm layout toggle).
    Default `board`.
  - `status` — one of `open | pending | snoozed | resolved | all`
    (Chatwoot behavior status filter). Default `all`.
  - `q` — free-text search (subject, sender, message body).
  - `label` — comma-separated label slugs.
  - `assignee` — agent id, `me`, or `unassigned`.
  - `id` — selected conversation id; opens the right detail pane (or full
    `Sheet` on mobile).
- **Settings and reports** are deferred to nested routes that do not exist
  yet:
  - `/support/settings/{labels,macros,canned-responses,signatures,business-hours,sla,assignment}`
  - `/support/reports/{overview,agents,teams,labels,csat}`
- Justification: MVP is a single-screen email inbox. Putting settings or
  reports under tabs inside `/support` would force a bigger shell and
  collide with the donor's full-bleed inbox layout. Putting them in
  `/admin/*` would leak Support concerns into the wrong surface. Nested
  routes match how Care, CRM and Contributions already organize sub-pages.

### 3.2 Status model

Two orthogonal axes, exactly as Chatwoot and gray-ui-csm split them:

| Axis                   | Values                                               | Source                | Stored as                                  |
| ---------------------- | ---------------------------------------------------- | --------------------- | ------------------------------------------ |
| **Status** (lifecycle) | `open`, `pending`, `snoozed`, `resolved`             | Chatwoot behavior     | column `status` on `support_conversations` |
| **View** (slice)       | `all`, `mine`, `unassigned`, `past-due`, `escalated` | gray-ui-csm structure | derived in the query layer; not stored     |

Notes:

- We drop Chatwoot's separate `closed` because it adds no donor-care value
  past `resolved`; resolved + 30 days can be archived later without a new
  state.
- `snoozed` carries `snoozed_until timestamptz`; an Inngest-style cron is
  out of scope for MVP — we just compute "ready" by clock and re-open on
  inbound reply.
- `escalated` and `past_due` are computed from
  `escalated_at is not null` and SLA timestamps; no separate table.

### 3.3 Final file map

See [`file-map.md`](./file-map.md). Summary:

- `apps/admin/features/support-hub/*` for client feature code (mirrors
  `apps/admin/features/mission-control/care/*`).
- `apps/admin/app/support/page.tsx` becomes the inbox shell wrapper.
- `apps/admin/app/api/admin/support/**` for thin route handlers.
- `packages/api/src/admin/support-hub/*` for all business logic.
- `packages/database/hooks/support-hub.ts` for typed query/mutation hooks.
- `supabase/migrations/<timestamp>_support_hub_foundation.sql` for the
  schema bring-up.

### 3.4 Final data model (MVP)

Tenant-scoped, RLS-on, `gen_random_uuid()` PKs, `tenant_id` FK to
`public.tenants(id) on delete cascade`. Audit columns
(`created_at`, `updated_at`, `created_by`, `updated_by`) on every table.

```sql
-- High-level shape; full migration ships in Phase 2 build.
support_conversations (
  id, tenant_id, subject, status, priority,
  channel,                            -- 'email' for MVP, enum for future
  view_flags,                         -- generated columns: is_unassigned, is_past_due, is_escalated
  assignee_user_id  null,             -- FK profiles
  team_id           null,             -- FK support_teams (deferred to Phase 2)
  contact_id        null,             -- FK crm contact (CRM-ready hook)
  external_contact_email,             -- always populated; dedup key
  inbox_id,                           -- FK tenant_email_settings or future support_inboxes
  first_message_at, last_message_at, last_customer_message_at,
  first_response_at, resolved_at, snoozed_until,
  escalated_at, past_due_at, sla_policy_id null,
  message_count int default 0,
  unread_count  int default 0,
  resend_thread_key text,             -- normalized Message-Id family
  metadata jsonb default '{}'::jsonb
)
support_messages (
  id, tenant_id, conversation_id,
  direction,                          -- 'inbound' | 'outbound'
  message_type,                       -- 'email' | 'note'
  author_user_id null,                -- null for inbound emails
  author_email, author_name,
  to_recipients text[], cc_recipients text[], bcc_recipients text[],
  subject,
  body_html, body_text,
  message_id_header, in_reply_to_header, references_headers text[],
  inbound_email_id null,              -- FK email_inbound_messages.id
  outbound_send_log_id null,          -- FK email_send_logs.id
  resend_message_id null,
  attachment_count int default 0,
  is_private boolean default false,   -- true for notes
  posted_at timestamptz not null
)
support_message_attachments (
  id, tenant_id, message_id,
  filename, content_type, size_bytes,
  storage_url null,                   -- if mirrored to Supabase storage
  resend_attachment_id null
)
support_labels (
  id, tenant_id, name, slug, color, description
)
support_conversation_labels (
  conversation_id, label_id, created_by, primary key (conversation_id, label_id)
)
support_assignments (
  id, tenant_id, conversation_id, assignee_user_id null, team_id null,
  assigned_by, assigned_at, unassigned_at null,
  reason text                         -- 'manual', 'round_robin', 'macro', 'inbound'
)
support_saved_views (
  id, tenant_id, owner_user_id null,  -- null = workspace-wide
  name, slug, scope,                  -- 'personal' | 'workspace'
  filter jsonb                        -- view+status+label+assignee+q
)
support_macros (
  id, tenant_id, owner_user_id null,
  name, description,
  actions jsonb                       -- ordered list: assign, label, status, send-canned, snooze
)
support_canned_responses (
  id, tenant_id, owner_user_id null,
  short_code, title, body_html, body_text
)
support_signatures (
  id, tenant_id, owner_user_id, name, body_html, is_default
)
support_business_hours (              -- Phase 2 (table created in MVP, UI later)
  id, tenant_id, name, timezone, weekly_schedule jsonb, holidays jsonb
)
support_sla_policies (                -- Phase 2 (table created in MVP, UI later)
  id, tenant_id, name,
  first_response_minutes int, next_response_minutes int, resolution_minutes int,
  business_hours_id null
)
support_audit_log (
  id, tenant_id, conversation_id, actor_user_id null,
  action, payload jsonb, created_at
)
```

Bridge to existing email tables:

- New columns on `email_inbound_messages`:
  `conversation_id uuid null` (FK `support_conversations`),
  `message_id_header text null`, `in_reply_to_header text null`,
  `references_headers text[] null`. The existing `payload jsonb` already
  carries the raw headers; we lift them into typed columns for indexable
  threading.
- The inbound webhook router (`packages/api/src/email/webhooks/resend.ts`)
  is extended to call a new `routeInboundToSupportHub()` step that
  upserts a `support_messages` row and resolves or creates a
  `support_conversations` row by:
  1. `In-Reply-To` → existing `support_messages.message_id_header`
  2. any `References` → existing `support_messages.message_id_header`
  3. `(tenant_id, external_contact_email, normalized_subject_hash)` open
     conversation within 14 days
  4. otherwise create a new conversation.
- Outbound replies call `@asym/email` `sendEmail()` with deterministic
  `idempotency_key = support_message:{id}` and a `correlation_id` of
  `support_conversation:{id}`. The resulting `email_send_logs` row id is
  written back to `support_messages.outbound_send_log_id` so analytics work
  end to end.

### 3.5 Reports (Phase 3 surface, data ready in MVP)

The data model already supports the seven Chatwoot-style reports. We will
expose them in Phase 3 via materialized aggregates:

- Overview (volume, status mix, channel mix)
- Conversations (CSAT, first response, resolution time)
- Agents
- Teams
- Labels
- CSAT (table reserved: `support_csat_responses`)
- Inbox

### 3.6 Final phase split

| Phase                         | In                                                                                                                                                                                                                                                                        | Out                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MVP (Phase 2 build)**       | Migration, RLS, inbound router, list/board/table views, conversation detail, reply composer (Tiptap), private notes (Tiptap), assignment, labels, status (open/pending/snoozed/resolved), snooze, resolve, saved views, basic search, mobile card view, audit log writes. | Macros, canned responses, signatures, round-robin, SLA timers UI, escalation UI, reports, settings UI, social channels, automations builder, CSAT collection, knowledge base. |
| **Phase 3**                   | Macros, canned responses, signatures, round-robin assignment, business hours, SLA timer surfacing, escalation actions, mute, send-transcript.                                                                                                                             | Reports UI.                                                                                                                                                                   |
| **Phase 4**                   | Reports (overview/agents/teams/labels/CSAT/inbox), CSAT collection, inbox settings UI, CRM linkage (auto-link `support_conversations.contact_id` from `crm.contacts`), knowledge-base deflection.                                                                         | Multi-channel chat surfaces.                                                                                                                                                  |
| **Out of scope (this build)** | Multi-channel chat (web widget, WhatsApp, FB), heavy automations builder, global shell rewrite.                                                                                                                                                                           |

### 3.7 Final grid plan

- Reuse `@asym/ui/components/shadcn/data-table` → `DataTableResponsive`
  for the **table view** with:
  - URL state via `urlState` prop (already wired through `nuqs`)
  - `manualPagination`/`manualSorting`/`manualFiltering` for server reads
  - `useSupabaseRealtime` to invalidate `["admin","support","conversations"]`
    on inserts/updates/deletes
  - `useDataTableVirtualization` for >200 rows
  - `mobileCardConfig` to render a Chatwoot-style stacked card per row on
    mobile
- Build the **board view** as a local component inside
  `apps/admin/features/support-hub/components/board/` using simple
  HTML5 drag-and-drop (matches the donor) and TanStack Query mutations to
  persist `(status, board_order)` updates. We do not pull a kanban library.
- The `data-grid/` package is **not** used by Support Hub — it is a
  spreadsheet primitive.
- ReUI's data-grid is referenced by the prompt only as a Maia/Zinc visual
  reference. Our `DataTableResponsive` already follows the Maia visual
  language; no third-party grid is added.

## 4. Conflict list (resolved)

| Conflict           | Resolution                                                                                                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------- |
| Shell ownership    | Keep `MCShell`. Inbox renders inside `<PageShell>`. No alternative shell.                                                                                                                                         |
| Shared tokens      | No new tokens. Map donor's sky/amber/emerald/rose status colors to our existing dot-and-badge pattern (see `apps/admin/app/contributions/main-body.tsx` for the precedent).                                       |
| Forced light theme | `MCShell` forces light. Drop all `dark:*` classes from any code we adapt from the donor.                                                                                                                          |
| TipTap reuse       | Use `@asym/ui/components/shadcn/rich-text-editor` for replies and notes. Do **not** repeat the legacy `Textarea` placeholder pattern in `apps/admin/features/mission-control/care/components/RichTextEditor.tsx`. |
| TanStack stack     | TanStack Query 5 + Table 8 + Virtual 3 + `nuqs` 2 + the repo's mutation/realtime hooks. No TanStack DB collections in MVP.                                                                                        |
| Data grid fit      | `DataTableResponsive` for the table view; bespoke board for the kanban view; no fork of the donor's `data-grid/`.                                                                                                 |
| Route shape        | `/support` plus search params; nested `/support/settings`, `/support/reports` deferred.                                                                                                                           |
| Mobile behavior    | List uses `DataTableResponsive` mobile card mode. Conversation detail opens in a full-screen `Sheet` on mobile and as a third pane on desktop.                                                                    |
| Auth               | `requireSupportHubAccess()` mirrors `requireMemberCareAccess()`; gate on `staff                                                                                                                                   | admin | super_admin`roles, matching the existing`/support` nav role config. |
| Cache Components   | Inbox page is a client component (interactive state) — `cacheComponents: true` is irrelevant to it. Server reads in `packages/api/src/admin/support-hub` stay request-scoped.                                     |
| Email backbone     | Use the existing `tenant_email_settings`, `email_send_logs`, `email_events`, `email_inbound_messages`. Add bridging columns; do not duplicate tables.                                                             |
| RLS                | All `support_*` tables RLS-on with `tenant_id = auth.jwt()->'app_metadata'->>'tenant_id'`. Match the pattern in member-care foundation.                                                                           |

## 5. Implementation order (later phases follow this exactly)

1. **Migration**
   - `supabase/migrations/<ts>_support_hub_foundation.sql` creates all
     `support_*` tables, indexes, RLS, helper functions
     (`fn_support_normalize_subject`, `fn_support_thread_key`).
   - Adds bridging columns to `email_inbound_messages`.
   - Down/rollback file mirrored under
     `supabase/migrations/rollback_<ts>_support_hub_foundation.sql`.
2. **Inbound router**
   - Extend `packages/api/src/email/webhooks/resend.ts` to call
     `routeInboundToSupportHub()` from
     `packages/api/src/admin/support-hub/inbound-router.ts`.
   - Update `tests/unit/packages/api/email/webhooks-resend.test.ts` and add
     `tests/unit/packages/api/admin/support-hub/inbound-router.test.ts`.
3. **API layer (`packages/api/src/admin/support-hub/`)**
   - `route-helpers.ts` — `requireSupportHubAccess()`,
     `parseJson()`, `toApiErrorResponse()`.
   - `reads.ts` — `listConversations()`, `getConversation()`,
     `listMessages()`, `listLabels()`, `listSavedViews()`, view counts.
   - `mutations.ts` — `assignConversation()`, `setStatus()`,
     `snoozeConversation()`, `addLabel()`, `removeLabel()`, `sendReply()`,
     `addPrivateNote()`.
   - `inbound-router.ts` — message threading + conversation upsert.
   - `schemas.ts` — Zod schemas for every mutation payload.
   - `types.ts` — derived TS types.
4. **Route handlers (`apps/admin/app/api/admin/support/**`)\*\*
   - One folder per resource, each `route.ts` calls `requireSupportHubAccess()`
     then delegates to `@asym/api/admin/support-hub/*`. Thin re-exports only
     (Data Access Boundary rule).
5. **Hooks (`packages/database/hooks/support-hub.ts`)**
   - `useSupportConversations()`, `useSupportConversation()`,
     `useSupportMessages()`, `useSupportLabels()`, `useSupportSavedViews()`,
     plus mutation hooks. Re-export from `packages/database/hooks/index.ts`.
   - Add `supportHubQueryKeys` to `packages/database/query-keys.ts`.
6. **Feature module (`apps/admin/features/support-hub/`)**
   - `index.ts`, `types.ts`, `constants.ts`, `utils.ts`.
   - `components/SupportInbox.tsx` (3-pane shell using `Sidebar` + main +
     detail).
   - `components/sidebar/SupportSidebarFilters.tsx` (Views / Status /
     Labels / Saved views — donor-style sub-rail using `SidebarMenu`).
   - `components/toolbar/SupportSearchToolbar.tsx` (search + status
     dropdown + board/table toggle).
   - `components/list/SupportListView.tsx`,
     `components/board/SupportBoardView.tsx`,
     `components/table/SupportTableView.tsx`.
   - `components/detail/ConversationDetail.tsx` with subcomponents
     `EmailThread.tsx`, `ReplyComposer.tsx` (Tiptap),
     `NoteComposer.tsx` (Tiptap), `ConversationActions.tsx`,
     `AssignMenu.tsx`, `LabelMenu.tsx`, `StatusMenu.tsx`,
     `SnoozeMenu.tsx`, `ContactSidecar.tsx`.
   - `hooks/use-support-inbox-state.ts` (nuqs-backed search-param state).
7. **Page wiring**
   - `apps/admin/app/support/page.tsx` becomes a thin shell:
     `<PageShell><SupportInbox /></PageShell>`.
   - `apps/admin/app/support/loading.tsx` shows the inbox skeleton.
8. **Tests**
   - Vitest: inbound router (threading), reads/mutations (auth gates,
     happy path, RLS smoke).
   - Playwright admin smoke: inbox loads, view switch, layout switch
     (`board`↔`table`), select conversation, send reply, add note, change
     status, snooze, resolve, label add/remove.
9. **Docs**
   - `docs/guides/features/support-hub.md` (operational guide, mirrors
     `care-hub.md` structure).
   - Update `packages/lib/mission-control/tiles.ts`,
     `packages/config/tiles.ts`,
     `packages/config/navigation.ts` if labels/quick actions change.

## 6. Out of scope for this build (explicit)

- Multi-channel chat surfaces beyond email (web widget, WhatsApp, FB).
- Heavy automations builder if it would block inbox MVP.
- Settings overhauls outside `/support`.
- Global shell rewrites (`MCShell`, `PageShell`, `ThemeProvider` order).
- Replacing the Resend integration. We extend it; we do not rebuild it.

## 7. Definition of done for Phase 1

- This file exists.
- `file-map.md` exists with concrete paths.
- `chatwoot-gray-parity-map.md` exists with the parity matrix.
- No production code is changed in this phase.
- Future phases can be implemented straight from these three documents
  without rethinking architecture.
