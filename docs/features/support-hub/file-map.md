# Support Hub — File Map

> Companion to [`phase-01-discovery.md`](./phase-01-discovery.md). This doc
> lists every file the Support Hub will create or touch, with one-sentence
> intent for each. No paths are speculative — each placement is grounded in
> a precedent that already exists in the repo
> (Care Hub, Contributions, Resend integration).

## 0. Conventions used here

- New file → `+`
- Modified existing file → `~`
- Path uses repo-relative form.

## 1. App layer (`apps/admin`)

### 1.1 Pages and route handlers

```
~ apps/admin/app/support/page.tsx
+ apps/admin/app/support/loading.tsx
+ apps/admin/app/api/admin/support/conversations/route.ts
+ apps/admin/app/api/admin/support/conversations/[id]/route.ts
+ apps/admin/app/api/admin/support/conversations/[id]/messages/route.ts
+ apps/admin/app/api/admin/support/conversations/[id]/replies/route.ts
+ apps/admin/app/api/admin/support/conversations/[id]/notes/route.ts
+ apps/admin/app/api/admin/support/conversations/[id]/assign/route.ts
+ apps/admin/app/api/admin/support/conversations/[id]/status/route.ts
+ apps/admin/app/api/admin/support/conversations/[id]/snooze/route.ts
+ apps/admin/app/api/admin/support/conversations/[id]/labels/route.ts
+ apps/admin/app/api/admin/support/labels/route.ts
+ apps/admin/app/api/admin/support/saved-views/route.ts
+ apps/admin/app/api/admin/support/counts/route.ts
```

Each handler is a thin re-export per
`docs/guides/architecture/data-access-boundary.md`. Pattern source:
`apps/admin/app/api/admin/member-care/dashboard/route.ts`.

### 1.2 Feature module (`apps/admin/features/support-hub/`)

Mirrors `apps/admin/features/mission-control/care/` structure.

```
+ apps/admin/features/support-hub/index.ts
+ apps/admin/features/support-hub/types.ts
+ apps/admin/features/support-hub/constants.ts
+ apps/admin/features/support-hub/utils.ts

+ apps/admin/features/support-hub/hooks/use-support-inbox-state.ts
+ apps/admin/features/support-hub/hooks/use-support-conversation.ts
+ apps/admin/features/support-hub/hooks/use-support-mutations.ts

+ apps/admin/features/support-hub/components/SupportInbox.tsx
+ apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx
+ apps/admin/features/support-hub/components/SupportEmptyState.tsx

+ apps/admin/features/support-hub/components/sidebar/SupportSidebarFilters.tsx
+ apps/admin/features/support-hub/components/sidebar/SupportSavedViews.tsx
+ apps/admin/features/support-hub/components/sidebar/SupportLabelList.tsx

+ apps/admin/features/support-hub/components/toolbar/SupportSearchToolbar.tsx
+ apps/admin/features/support-hub/components/toolbar/SupportLayoutToggle.tsx
+ apps/admin/features/support-hub/components/toolbar/SupportBulkActions.tsx

+ apps/admin/features/support-hub/components/list/SupportListView.tsx
+ apps/admin/features/support-hub/components/list/ConversationListItem.tsx

+ apps/admin/features/support-hub/components/board/SupportBoardView.tsx
+ apps/admin/features/support-hub/components/board/BoardColumn.tsx
+ apps/admin/features/support-hub/components/board/BoardCard.tsx

+ apps/admin/features/support-hub/components/table/SupportTableView.tsx
+ apps/admin/features/support-hub/components/table/columns.tsx
+ apps/admin/features/support-hub/components/table/cells.tsx

+ apps/admin/features/support-hub/components/detail/ConversationDetail.tsx
+ apps/admin/features/support-hub/components/detail/ConversationHeader.tsx
+ apps/admin/features/support-hub/components/detail/EmailThread.tsx
+ apps/admin/features/support-hub/components/detail/EmailMessageBubble.tsx
+ apps/admin/features/support-hub/components/detail/PrivateNoteBubble.tsx
+ apps/admin/features/support-hub/components/detail/ReplyComposer.tsx
+ apps/admin/features/support-hub/components/detail/NoteComposer.tsx
+ apps/admin/features/support-hub/components/detail/ConversationActions.tsx
+ apps/admin/features/support-hub/components/detail/AssignMenu.tsx
+ apps/admin/features/support-hub/components/detail/LabelMenu.tsx
+ apps/admin/features/support-hub/components/detail/StatusMenu.tsx
+ apps/admin/features/support-hub/components/detail/SnoozeMenu.tsx
+ apps/admin/features/support-hub/components/detail/ContactSidecar.tsx
+ apps/admin/features/support-hub/components/detail/ActivityLog.tsx
```

Notes:

- `ReplyComposer.tsx` and `NoteComposer.tsx` both wrap
  `EditorRoot` / `EditorContent` / `EditorToolbar` from
  `@asym/ui/components/shadcn/rich-text-editor`. No alternative editor.
- `SupportTableView.tsx` is `<DataTableResponsive />` with
  `urlState`, mobile card config, virtualization, and realtime — same
  pattern as `apps/admin/app/contributions/main-body.tsx`.
- `SupportInbox.tsx` wraps the three panes inside a single
  `SidebarProvider`-aware container so the donor's left sub-rail does not
  fight `MCShell`'s outer sidebar (we use it as a plain panel rather than
  a nested `<Sidebar>` to avoid double providers).

## 2. Shared API package (`packages/api`)

```
+ packages/api/src/admin/support-hub/index.ts
+ packages/api/src/admin/support-hub/route-helpers.ts
+ packages/api/src/admin/support-hub/schemas.ts
+ packages/api/src/admin/support-hub/types.ts

+ packages/api/src/admin/support-hub/reads/conversations.ts
+ packages/api/src/admin/support-hub/reads/messages.ts
+ packages/api/src/admin/support-hub/reads/labels.ts
+ packages/api/src/admin/support-hub/reads/saved-views.ts
+ packages/api/src/admin/support-hub/reads/counts.ts

+ packages/api/src/admin/support-hub/mutations/assign.ts
+ packages/api/src/admin/support-hub/mutations/status.ts
+ packages/api/src/admin/support-hub/mutations/snooze.ts
+ packages/api/src/admin/support-hub/mutations/labels.ts
+ packages/api/src/admin/support-hub/mutations/reply.ts
+ packages/api/src/admin/support-hub/mutations/note.ts
+ packages/api/src/admin/support-hub/mutations/saved-views.ts

+ packages/api/src/admin/support-hub/inbound-router.ts
+ packages/api/src/admin/support-hub/audit.ts
~ packages/api/src/email/webhooks/resend.ts
```

Patterns:

- `route-helpers.ts` mirrors
  `packages/api/src/admin/member-care/route-helpers.ts`
  (`requireSupportHubAccess()`, `parseJson()`, `toApiErrorResponse()`).
- `mutations/reply.ts` calls `sendEmail()` from `@asym/email` with a
  deterministic `idempotency_key = support_message:{id}` and writes the
  resulting `email_send_logs` id back to `support_messages.outbound_send_log_id`.
- `inbound-router.ts` is invoked from the Resend webhook route inside the
  `email.received` branch (`packages/api/src/email/webhooks/resend.ts`
  around line 572).

## 3. Database hooks and types (`packages/database`)

```
+ packages/database/hooks/support-hub.ts
~ packages/database/hooks/index.ts
~ packages/database/query-keys.ts
~ packages/database/types/database.ts
```

- New TanStack Query hooks: `useSupportConversations`,
  `useSupportConversation`, `useSupportMessages`, `useSupportLabels`,
  `useSupportSavedViews`, `useSupportConversationCounts`, plus mutation
  hooks: `useAssignSupportConversation`, `useSetSupportConversationStatus`,
  `useSnoozeSupportConversation`, `useAddSupportLabel`,
  `useRemoveSupportLabel`, `useSendSupportReply`, `useAddSupportNote`,
  `useSaveSupportView`.
- `query-keys.ts` gets a `supportHubQueryKeys` entry with sub-keys:
  `conversations`, `conversation(id)`, `messages(id)`, `labels`,
  `savedViews`, `counts`.
- `types/database.ts` gets typed shapes for the new `support_*` tables
  (mirrors how member-care types were added).

## 4. Email package (`packages/email`)

No source-of-truth changes in MVP. We re-export typed helpers:

```
~ packages/email/types.ts            # (only if a new outbound option is needed; otherwise untouched)
```

The Support Hub talks to Resend exclusively through existing exports:
`sendEmail`, `getReceivedEmail`, `listReceivedEmailAttachments`,
`verifyResendWebhookSignature`.

## 5. Database migrations (`supabase`)

```
+ supabase/migrations/<ts>_support_hub_foundation.sql
+ supabase/migrations/rollback_<ts>_support_hub_foundation.sql
~ supabase/seed.sql                  # optional: seed default labels per demo tenant
~ supabase/schema.sql                # regenerated after migration
```

Migration scope:

- All `support_*` tables defined in `phase-01-discovery.md` §3.4.
- Indexes on `(tenant_id, status, last_message_at desc)`,
  `(tenant_id, assignee_user_id, status)`,
  `(tenant_id, lower(external_contact_email))`,
  `(tenant_id, resend_thread_key)` and a GIN index on
  `support_messages.references_headers`.
- RLS policies that gate by
  `tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid`,
  with insert/update/delete restricted to the tenant's authenticated
  users. Pattern source:
  `supabase/migrations/20260414180338_member_care_foundation.sql`.
- Bridging columns on `email_inbound_messages`
  (`conversation_id`, `message_id_header`, `in_reply_to_header`,
  `references_headers`).
- Helper SQL functions:
  `fn_support_normalize_subject(text) returns text` and
  `fn_support_thread_key(text) returns text` for stable threading.

## 6. Tests

```
+ tests/unit/packages/api/admin/support-hub/inbound-router.test.ts
+ tests/unit/packages/api/admin/support-hub/reads.test.ts
+ tests/unit/packages/api/admin/support-hub/mutations.test.ts
~ tests/unit/packages/api/email/webhooks-resend.test.ts
+ tests/playwright/admin/support-hub.smoke.spec.ts
```

Smoke spec covers: inbox loads, switch view (`mine` ↔ `all`), switch
layout (`board` ↔ `table`), select conversation, send reply, add note,
assign, label, change status, snooze, resolve.

## 7. Docs and config

```
+ docs/guides/features/support-hub.md
~ packages/lib/mission-control/tiles.ts          # if tile copy/quick-actions change
~ packages/lib/mission-control/nav.ts            # if nav copy changes
~ packages/config/tiles.ts                       # mirror of above
~ packages/config/navigation.ts                  # mirror of above
~ docs/ai/working-set.md                         # add a Support Hub entry per implementation pass
```

## 8. Files we explicitly do NOT touch in this build

- `apps/admin/app/mc-shell.tsx` (shell stays put).
- `apps/admin/app/layout.tsx` (provider order stays put).
- `packages/ui/components/shadcn/page-shell.tsx` (no chrome changes).
- `packages/ui/components/shadcn/data-table/*` (we consume it; we do not
  modify it).
- `packages/ui/components/shadcn/rich-text-editor/*` (we consume it; we
  do not modify it).
- `packages/ui/components/shadcn/data-grid/*` (not used by Support Hub).
- `packages/email/resend.ts` (extension happens in the API layer, not in
  the client SDK).
- Any file under `apps/donor` or `apps/missionary`.

## 9. Naming and location rules locked in

- Feature folder: **`apps/admin/features/support-hub/`** (kebab-case to
  match `mission-control/care`).
- Symbol prefix: **`Support*`** for components, **`useSupport*`** for
  hooks, **`support_*`** for tables, **`supportHubQueryKeys`** for the
  query-key registry.
- Search-param keys: `view`, `layout`, `status`, `q`, `label`, `assignee`,
  `id`. Do not invent more without updating
  `phase-01-discovery.md` §3.1.
