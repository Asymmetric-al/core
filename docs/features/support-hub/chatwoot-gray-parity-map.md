# Support Hub — Feature Parity Map

> Companion to [`phase-01-discovery.md`](./phase-01-discovery.md) and
> [`file-map.md`](./file-map.md). This document maps every feature surface
> from our two donor systems to the surface we will build inside Mission
> Control. We never paste donor source code; we recreate behavior using our
> own stack.
>
> **Donors:**
>
> - **Structure donor:** [`Jason-uxui/gray-ui-csm`](https://github.com/Jason-uxui/gray-ui-csm)
>   — Next.js + shadcn/ui inbox with board / table layout, sidebar filter
>   rail, search toolbar, view slices.
> - **Behavior donor:** [`chatwoot/chatwoot`](https://github.com/chatwoot/chatwoot)
>   CE — Rails + Vue customer-support platform; we mirror the email
>   conversation lifecycle, reply / note / assignment / label / macro /
>   signature semantics, and the seven-report shape.
>
> **Stack we use to recreate them:** Next.js 16 App Router (`apps/admin`),
> React 19, TypeScript, Tailwind v4 (Maia / Zinc tokens), shadcn/ui via
> `@asym/ui`, TanStack Query 5 + Table 8 + Virtual 3, `nuqs` 2,
> Tiptap 3 via `@asym/ui/components/shadcn/rich-text-editor`, Supabase
> (RLS + realtime), Resend through `@asym/email`.

## Legend

- **MVP** — ships in the first inbox build (Phase 2 of the roadmap).
- **Phase 3** — built after MVP lands.
- **Phase 4** — reports / settings UI / CRM linkage.
- **Out** — explicitly out of scope for this build.
- "Repo target" cells point to the file or symbol the feature will live
  in. Paths come from [`file-map.md`](./file-map.md).

## 1. Inbox shell and navigation (structure: gray-ui-csm)

| Donor surface (gray-ui-csm)                                                                                       | Donor cue / file                                            | Repo target                                                                                       | Phase | Notes                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top-level nav with Inbox / Tickets / Customers / Internal Notes / Knowledge Base / Macros / Automation / Settings | `components/app-sidebar.tsx`                                | Existing `MCShell` `toolNav` already lists Support Hub under Tools. We do not add a parallel nav. | MVP   | Settings / Reports remain nested routes (`/support/settings`, `/support/reports`).                                                                                                      |
| Tickets page composed of stat cards + toolbar + board / table                                                     | `components/tickets/tickets-page.tsx`                       | `apps/admin/features/support-hub/components/SupportInbox.tsx`                                     | MVP   | Wrapped by `<PageShell title="Support Hub">`.                                                                                                                                           |
| Sidebar filter rail (Views, Categories, Priority) with badge counts                                               | `components/tickets/ticket-sidebar-filters.tsx`             | `apps/admin/features/support-hub/components/sidebar/SupportSidebarFilters.tsx`                    | MVP   | Built on `@asym/ui/components/shadcn/sidebar` primitives without a nested `<SidebarProvider>`. We rename "Categories" to "Labels" to align with Chatwoot vocabulary and our data model. |
| Stat cards above the inbox (Total / Open / Pending / Resolved with WoW deltas)                                    | `components/tickets/ticket-stats.tsx`                       | `apps/admin/features/support-hub/components/SupportInbox.tsx` (top section)                       | MVP   | Reuses the Maia/Zinc stat-card pattern from `apps/admin/app/contributions/main-body.tsx`.                                                                                               |
| Search toolbar with status dropdown + board/table toggle                                                          | `components/tickets/ticket-search-toolbar.tsx`              | `apps/admin/features/support-hub/components/toolbar/SupportSearchToolbar.tsx`                     | MVP   | Status dropdown wires to `?status=` search param; layout toggle wires to `?layout=`.                                                                                                    |
| View slices (`all`, `mine`, `unassigned`, `past-due`, `escalated`)                                                | `lib/tickets/types.ts` (`TicketViewKey`)                    | `apps/admin/features/support-hub/types.ts` (`SupportViewKey`) and `?view=` param                  | MVP   | Computed in the API read layer, not stored.                                                                                                                                             |
| Board ↔ table layout toggle                                                                                      | `lib/tickets/types.ts` (`TicketLayoutMode`)                 | `?layout=` param + `SupportInbox` switching between `SupportBoardView` and `SupportTableView`     | MVP   | Default `board` (matches donor).                                                                                                                                                        |
| Drag-and-drop kanban with HTML5 native DnD                                                                        | `components/tickets/ticket-board.tsx`                       | `apps/admin/features/support-hub/components/board/SupportBoardView.tsx`                           | MVP   | Persisted via `useSetSupportConversationStatus` mutation; `board_order` updates batched.                                                                                                |
| Bulk action bar above the table (status / priority / assignee)                                                    | `components/tickets/tickets-page.tsx` (`tableToolbarProps`) | `apps/admin/features/support-hub/components/toolbar/SupportBulkActions.tsx`                       | MVP   | Hooks into `DataTableResponsive` selection state.                                                                                                                                       |

## 2. Inbox list, board, table (structure + behavior overlap)

| Capability                                                                                | gray-ui-csm cue                       | Chatwoot cue                                    | Repo target                                                                                                   | Phase |
| ----------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----- |
| Conversation row with subject, status badge, priority indicator, assignee, channel, label | `components/tickets/ticket-table.tsx` | `Conversation` model + `ConversationCard` (Vue) | `apps/admin/features/support-hub/components/list/ConversationListItem.tsx` and `components/table/columns.tsx` | MVP   |
| Mobile card view of the same row                                                          | gray-ui-csm responsive table          | Chatwoot mobile dashboard                       | `mobileCardConfig` on `<DataTableResponsive />`                                                               | MVP   |
| Server-side sort / paginate / filter / search                                             | gray-ui-csm sort presets              | Chatwoot conversation filters                   | `useSupportConversations` + `urlState` on `DataTableResponsive` (manual modes)                                | MVP   |
| Saved views per agent / workspace                                                         | (not in donor)                        | Chatwoot custom folders                         | `support_saved_views` table + `useSupportSavedViews` + `SupportSavedViews.tsx`                                | MVP   |
| Faceted filters (status, label, assignee, channel)                                        | gray-ui-csm sidebar facets            | Chatwoot inbox filters                          | `DataTableFacetedFilter` + `?status=` / `?label=` / `?assignee=` URL state                                    | MVP   |
| Realtime new-message badge                                                                | (not in donor)                        | Chatwoot ActionCable                            | `useSupabaseRealtime({ tableName: 'support_messages' })` invalidating `supportHubQueryKeys.conversations`     | MVP   |
| Virtualized table for large tenants                                                       | gray-ui-csm large list                | Chatwoot infinite scroll                        | `useDataTableVirtualization` baked into `DataTableResponsive`                                                 | MVP   |
| Bulk reassign / status change / label                                                     | gray-ui-csm bulk action bar           | Chatwoot bulk actions                           | `SupportBulkActions` calling mutation hooks                                                                   | MVP   |

## 3. Conversation detail (behavior: Chatwoot)

| Chatwoot surface                                                                 | Chatwoot cue                                | Repo target                                                                                                                      | Phase   | Notes                                                                                                    |
| -------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| Three-pane dashboard with conversation list, conversation panel, contact sidecar | `chatwoot-101 → Lesson 2: Dashboard Basics` | `SupportInbox.tsx` (3-pane) + `ConversationDetail.tsx` + `ContactSidecar.tsx`                                                    | MVP     | On mobile the detail opens as full-screen `Sheet`.                                                       |
| Email thread rendering with sender, recipients, date, body, attachments          | Chatwoot email channel                      | `EmailThread.tsx` + `EmailMessageBubble.tsx` reading from `support_messages` joined with `support_message_attachments`           | MVP     | HTML rendered through a sanitizer; falls back to `parsed_text`.                                          |
| Reply composer with rich text, attachments, signature                            | Chatwoot reply box                          | `ReplyComposer.tsx` wrapping `EditorRoot` + `EditorContent` + `EditorToolbar` from `@asym/ui/components/shadcn/rich-text-editor` | MVP     | Send via `useSendSupportReply` → `sendEmail()` → writes back to `support_messages.outbound_send_log_id`. |
| Private notes with `@mention`                                                    | Chatwoot private note tab                   | `NoteComposer.tsx` (same Tiptap stack) writing rows with `is_private = true`                                                     | MVP     | `@` mention surface deferred to Phase 3 (uses Tiptap mention extension).                                 |
| Status menu: open / pending / snoozed / resolved                                 | Chatwoot conversation actions               | `StatusMenu.tsx` → `useSetSupportConversationStatus`                                                                             | MVP     | `closed` is intentionally absent; resolved + 30 days can archive later.                                  |
| Snooze until time                                                                | Chatwoot snooze                             | `SnoozeMenu.tsx` writing `snoozed_until`                                                                                         | MVP     | Re-open on inbound reply (logic in `inbound-router.ts`).                                                 |
| Assign agent / team                                                              | Chatwoot assignment dropdowns               | `AssignMenu.tsx` → `useAssignSupportConversation`                                                                                | MVP     | Team assignment column ships in MVP; team management UI ships in Phase 3.                                |
| Add / remove labels                                                              | Chatwoot labels                             | `LabelMenu.tsx` → `useAddSupportLabel` / `useRemoveSupportLabel`                                                                 | MVP     | Color comes from `support_labels.color`; no hex hardcoding in components.                                |
| Activity log of state changes                                                    | Chatwoot activity log                       | `ActivityLog.tsx` reading `support_audit_log`                                                                                    | MVP     | Audit rows written by every mutation in `packages/api/src/admin/support-hub/audit.ts`.                   |
| Send transcript to email                                                         | Chatwoot send transcript                    | (deferred)                                                                                                                       | Phase 3 | Reuses `sendEmail()`.                                                                                    |
| Mute conversation                                                                | Chatwoot mute                               | (deferred)                                                                                                                       | Phase 3 | Stored as `support_conversation_mutes(user_id, conversation_id)`.                                        |
| Macros (sequence of actions)                                                     | Chatwoot macros                             | `useSupportMacros` + macros menu in `ConversationActions.tsx`                                                                    | Phase 3 | Tables shipped in MVP migration; runner shipped in Phase 3.                                              |
| Canned responses with shortcodes                                                 | Chatwoot canned responses                   | `CannedResponseMenu` slash command in `ReplyComposer`                                                                            | Phase 3 | Tables shipped in MVP migration.                                                                         |
| Personal signature appended to outbound replies                                  | Chatwoot signatures                         | `support_signatures` table + composer toggle                                                                                     | Phase 3 | Default loaded for the current user.                                                                     |
| Mentions notify teammate                                                         | Chatwoot mentions view                      | (deferred)                                                                                                                       | Phase 4 | Notifications surface lives outside Support Hub.                                                         |
| Attachments preview / download                                                   | Chatwoot attachments                        | `EmailMessageBubble` lists `support_message_attachments` with download button via `getReceivedEmail()` URLs                      | MVP     | Attachment retrieval happens server-side and is short-lived signed URL.                                  |

## 4. Filters, folders, saved views

| Capability                                           | Chatwoot equivalent                | gray-ui-csm equivalent     | Repo target                                                                                  | Phase |
| ---------------------------------------------------- | ---------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------- | ----- |
| Conversation filters with operators                  | Chatwoot filter builder            | gray-ui-csm sidebar facets | Reuse `@asym/ui/components/shadcn/data-table/filters` (`FilterBuilder`, `useAdvancedFilter`) | MVP   |
| Save filter as folder / segment                      | Chatwoot folders, contact segments | gray-ui-csm view tabs      | `support_saved_views` + `SavedFilters` UI from existing data-table package                   | MVP   |
| Workspace-wide vs personal saved views               | Chatwoot folder scopes             | (not in donor)             | `support_saved_views.scope` (`workspace` / `personal`)                                       | MVP   |
| Quick view tabs in toolbar (Mine / Unassigned / All) | Chatwoot tabs                      | gray-ui-csm view tabs      | `?view=` param + sidebar items in `SupportSidebarFilters`                                    | MVP   |

## 5. Settings (Phase 3 / 4)

| Setting                                              | Chatwoot location            | Repo target                                                                                                 | Phase   |
| ---------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------- | ------- |
| Inbox connection (sender, signature, business hours) | Settings → Inboxes           | Reuses existing `apps/admin/app/settings/integrations/resend/page.tsx` + new `/support/settings/inbox/[id]` | Phase 3 |
| Agents and roles                                     | Settings → Agents            | Existing tenant member management; Support Hub reads agent list from `profiles` filtered by membership      | Phase 3 |
| Teams                                                | Settings → Teams             | New `support_teams` table + UI under `/support/settings/teams`                                              | Phase 3 |
| Labels                                               | Settings → Labels            | `/support/settings/labels` CRUD over `support_labels`                                                       | Phase 3 |
| Macros                                               | Settings → Macros            | `/support/settings/macros` CRUD over `support_macros`                                                       | Phase 3 |
| Canned responses                                     | Settings → Canned responses  | `/support/settings/canned-responses`                                                                        | Phase 3 |
| Custom attributes                                    | Settings → Custom attributes | (deferred)                                                                                                  | Phase 4 |
| Automation rules                                     | Settings → Automation        | (deferred — out of scope for this build)                                                                    | Out     |
| Business hours                                       | Settings → Business hours    | `/support/settings/business-hours`                                                                          | Phase 3 |
| SLA policies                                         | Settings → SLAs              | `/support/settings/sla`                                                                                     | Phase 3 |
| Round-robin assignment                               | Inbox setting                | Toggle on inbox; logic in `assign.ts`                                                                       | Phase 3 |

## 6. Reports (Phase 4)

| Chatwoot report | Repo target                      | Phase   | Notes                                                           |
| --------------- | -------------------------------- | ------- | --------------------------------------------------------------- |
| Overview        | `/support/reports/overview`      | Phase 4 | Reads from `support_audit_log` + `support_messages` aggregates. |
| Conversations   | `/support/reports/conversations` | Phase 4 | Includes first response time / resolution time.                 |
| Agents          | `/support/reports/agents`        | Phase 4 | Reuses Maia stat cards + `Recharts` (already a repo skill).     |
| Teams           | `/support/reports/teams`         | Phase 4 | Same chart kit.                                                 |
| Labels          | `/support/reports/labels`        | Phase 4 | Volume per label.                                               |
| CSAT            | `/support/reports/csat`          | Phase 4 | Backed by new `support_csat_responses` table.                   |
| Inbox           | `/support/reports/inbox`         | Phase 4 | Per-inbox volume, channel mix.                                  |

All seven shapes are supported by the MVP data model; the UI ships in
Phase 4.

## 7. Channels and integrations

| Channel                                         | Chatwoot support   | Repo decision                                                                                                  | Phase   |
| ----------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------- | ------- |
| Email (IMAP / SMTP)                             | Native             | Resend inbound + outbound (already wired). `support_conversations.channel = 'email'` is the only value in MVP. | MVP     |
| Web live chat                                   | Native             | (out)                                                                                                          | Out     |
| WhatsApp / Facebook / Instagram / Twitter / SMS | Native             | (out)                                                                                                          | Out     |
| API-only inbox                                  | Native             | (deferred — Resend covers our case)                                                                            | Out     |
| Chatwoot mobile SDK                             | Native             | (out)                                                                                                          | Out     |
| Slack notify on new conversation                | Native integration | (deferred)                                                                                                     | Phase 4 |

## 8. CRM-ready hooks

We do not build CRM linkage in MVP, but the schema is ready for it:

- `support_conversations.contact_id` is a nullable FK to the existing
  CRM contacts surface (`apps/admin/app/crm`).
- `support_conversations.external_contact_email` is always populated and
  is the join key Phase 4 uses to backfill `contact_id` once the CRM
  matcher exists.
- `ContactSidecar.tsx` reads from `support_conversations.contact_id` when
  present; otherwise it shows the raw `from` address with a "Link to CRM"
  affordance that is wired in Phase 4.

## 9. What we deliberately leave on the floor

- No vendored Chatwoot Rails or Vue source.
- No new design system. Maia / Zinc tokens via `packages/ui/styles/globals.css`.
- No replacement for the existing Resend integration.
- No additional global state library (no Zustand, per
  `docs/ai/rules/frontend.md`).
- No new editor — Tiptap via `@asym/ui/components/shadcn/rich-text-editor`
  is the only rich text surface.
- No fork of the donor's `data-grid/` (it is a spreadsheet primitive).
- No mobile-app surface, no chat widget surface, no public help-center
  surface (existing CMS owns the public help docs).
