# Plan 002: Push Support Hub conversation/message/threading filters into SQL

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a661bfb9..HEAD -- packages/api/src/admin/support-hub`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `a661bfb9`, 2026-06-11

## Why this matters

The Support Hub's live Supabase adapter was ported from an in-memory demo
adapter and kept "load the whole tenant table, then filter in JavaScript"
semantics. Three hot paths pay for this on every request:

1. **Inbox list** (`conversations.list`) — fetches every conversation, every
   label, and every conversation-label join in the tenant, then filters by
   inbox/status/assignee/search in JS.
2. **Conversation view** (`listMessages`) — fetches **every support message in
   the tenant** and filters by conversation in JS, then fetches **every
   attachment row in the tenant** with no filter at all.
3. **Inbound email threading** (`findThreadedConversation`) — runs on every
   inbound support email; fetches every message in the tenant and scans JSON
   headers in JS.

The database schema already has the exact indexes these queries need
(including an expression index on `email_headers->>'messageId'` created
specifically for threading). The fix is adapter-internal: same interface, same
return shapes, filters moved into PostgREST queries.

## Current state

Adapter: `packages/api/src/admin/support-hub/adapter/supabase.ts`.

- The shared fetch helper (lines 143–156) — tenant filter only, no other
  filters, no limit:

```ts
async function allRows(
  table: string,
  columns = "*",
  order?: { column: string; ascending?: boolean },
): Promise<SupabaseRow[]> {
  const scope = tenantId();
  let query = client().from(table).select(columns).eq("tenant_id", scope);
  if (order) {
    query = query.order(order.column, { ascending: order.ascending ?? true });
  }
  const { data, error } = await query;
  assertDb(error, `${table}.select`);
  return (data ?? []) as unknown as SupabaseRow[];
}
```

- `conversations.list` (lines 669–717): `allRows("support_conversations")`
  ordered by `updated_at` desc, plus `tenantSnapshot()` (labels/agents/teams —
  small tables, fine) and `conversationLabelsById()` (lines 415–431 — fetches
  ALL of `support_conversation_labels` + ALL of `support_labels`), then
  JS-filters the mapped conversations by `filter.inboxId`, `filter.status`,
  `filter.assigneeAgentId`, `filter.q`, `filter.labelSlugs`.

- `listMessages` (lines 721–745):

```ts
async listMessages(conversationId) {
  const rows = await allRows("support_messages", "*", {
    column: "posted_at",
  });
  const messages = rows.filter(
    (row) => String(row.conversation_id) === conversationId,
  );
  if (messages.length === 0) return [];

  const attachmentRows = await allRows("support_message_attachments");
  ...
```

- `findThreadedConversation` (lines 1302–1339):

```ts
if (headerCandidates.length > 0) {
  const messages = await allRows("support_messages");
  const matchedMessage = messages.find((message) => {
    const headers = asJsonRecord(message.email_headers);
    const messageId = asString(headers.messageId);
    return messageId ? headerCandidates.includes(messageId) : false;
  });
  ...
```

- Indexes that already exist
  (`supabase/migrations/20260515025814_support_hub_core_modules.sql`,
  lines 314–343):

```sql
CREATE INDEX IF NOT EXISTS support_messages_tenant_conversation_posted_idx
  ON public.support_messages (tenant_id, conversation_id, posted_at);

CREATE INDEX IF NOT EXISTS support_messages_message_id_header_idx
  ON public.support_messages (tenant_id, ((email_headers ->> 'messageId')))
  WHERE email_headers ? 'messageId';

CREATE INDEX IF NOT EXISTS support_message_attachments_tenant_message_idx
  ON public.support_message_attachments (tenant_id, message_id);
```

- The adapter interface must NOT change
  (`packages/api/src/admin/support-hub/adapter/types.ts` lines 215–220):

```ts
export interface SupportHubAdapter {
  conversations: {
    list(filter: SupportConversationFilter): Promise<SupportConversation[]>;
    get(id: string): Promise<SupportConversation | null>;
    listMessages(conversationId: string): Promise<SupportMessage[]>;
    ...
```

`SupportConversationFilter` (types.ts lines 40–49) has `inboxId`, `status`
(`SupportConversationStatus | "all"`), `assigneeAgentId` (`string | null` —
null means "unassigned"), `q` (free text), `labelSlugs` (must ALL match).

- `packages/api/src/admin/support-hub/adapter/index.ts` exports
  `supportHubAdapter = supabaseSupportHubAdapter`; the in-memory adapter is a
  test fixture for parity tests. Keep both adapters' observable behavior
  identical.

- Consumers (do not modify): `packages/api/src/admin/support-hub/reads/conversations.ts`
  thin pass-throughs; route handlers under
  `apps/admin/app/api/admin/support/**` (e.g.
  `conversations/route.ts`, `conversations/[id]/messages/route.ts`).

- Column names to filter on: the adapter's own mutations already use
  `status`, `snoozed_until` (lines ~650–664) and `assignee_agent_id`
  (line ~748) on `support_conversations`. Before writing filters, confirm the
  exact column names for inbox (`inbox_id`) and status in the
  `CREATE TABLE public.support_conversations` block of
  `supabase/migrations/20260515025814_support_hub_core_modules.sql`.

## Commands you will need

| Purpose   | Command                                                                                        | Expected on success |
| --------- | ---------------------------------------------------------------------------------------------- | ------------------- |
| Install   | `bun install`                                                                                  | exit 0              |
| Typecheck | `bunx turbo run typecheck --filter=@asym/api --filter=@asym/admin`                             | exit 0              |
| Lint      | `bunx turbo run lint --filter=@asym/api --filter=@asym/admin`                                  | exit 0              |
| Tests     | `bunx vitest run tests/unit/apps/admin/app/support tests/unit/apps/admin/features/support-hub` | all pass            |
| Format    | `bun run format:check`                                                                         | exit 0              |

The repo-wide unit suite has a historically flaky area in `tests/unit/cms/`
(documented in `CODE_QUALITY_AUDIT.md`); scope test runs as above and report
unrelated CMS failures as pre-existing.

## Scope

**In scope** (the only files you should modify):

- `packages/api/src/admin/support-hub/adapter/supabase.ts`
- `tests/unit/packages/api/support-hub-supabase-adapter.test.ts` (create)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):

- `packages/api/src/admin/support-hub/adapter/types.ts` — the interface and
  filter type stay exactly as they are. No pagination params in this plan
  (that requires UI changes; deferred follow-up).
- `packages/api/src/admin/support-hub/adapter/in-memory.ts` — the fixture's
  behavior is the parity contract; do not edit it.
- All route handlers under `apps/admin/app/api/admin/support/**`.
- `supabase/migrations/**` — the needed indexes already exist; no schema
  change.
- The other `allRows` call sites for small settings tables (labels, agents,
  teams, macros, canned responses, saved views, inboxes, signatures, SLA
  policies, business hours, automation rules, notification preferences) —
  these tables are small and bounded by admin configuration; leave them.

## Steps

### Step 0: Confirm column names

Open `supabase/migrations/20260515025814_support_hub_core_modules.sql` and
find `CREATE TABLE IF NOT EXISTS public.support_conversations`. Record the
column names for: inbox reference, status, assignee agent. Expected:
`inbox_id`, `status`, `assignee_agent_id`. If they differ, use the real names
in the steps below.

**Verify**: you can quote the three column names from the migration.

### Step 1: Filter messages by conversation in SQL

In `listMessages` (supabase.ts lines 721–745):

1. Replace the messages fetch + JS filter with a direct query:

```ts
const { data, error } = await client()
  .from("support_messages")
  .select("*")
  .eq("tenant_id", tenantId())
  .eq("conversation_id", conversationId)
  .order("posted_at", { ascending: true });
assertDb(error, "support_messages.select");
const messages = (data ?? []) as unknown as SupabaseRow[];
```

(Keep using the file's existing `client()`, `tenantId()`, `assertDb`
helpers — match the style of `oneRow` at lines 158–171.)

2. Replace `allRows("support_message_attachments")` with a query filtered to
   these messages' ids, chunked to keep the PostgREST URL short:

```ts
const messageIds = messages.map((row) => String(row.id));
const attachmentRows: SupabaseRow[] = [];
for (let i = 0; i < messageIds.length; i += 100) {
  const chunk = messageIds.slice(i, i + 100);
  const { data: chunkData, error: chunkError } = await client()
    .from("support_message_attachments")
    .select("*")
    .eq("tenant_id", tenantId())
    .in("message_id", chunk);
  assertDb(chunkError, "support_message_attachments.select");
  attachmentRows.push(...((chunkData ?? []) as unknown as SupabaseRow[]));
}
```

3. Keep the existing grouping (`attachmentsByMessage`) and return mapping
   unchanged, including the `if (messages.length === 0) return [];` early
   return (place it after the messages query).

Behavior note: the current code orders by `posted_at` ascending (the
`allRows` default). Preserve ascending order.

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0.

### Step 2: Filter conversations by inbox/status/assignee in SQL

In `conversations.list` (lines 669–717), build the conversations query with
the indexed/equality filters applied server-side, keeping `q` and
`labelSlugs` filtering in JS (they need joined/derived data):

```ts
let query = client()
  .from("support_conversations")
  .select("*")
  .eq("tenant_id", tenantId())
  .order("updated_at", { ascending: false });
if (filter.inboxId) {
  query = query.eq("inbox_id", filter.inboxId);
}
if (filter.status && filter.status !== "all") {
  query = query.eq("status", filter.status);
}
if (filter.assigneeAgentId !== undefined) {
  query =
    filter.assigneeAgentId === null
      ? query.is("assignee_agent_id", null)
      : query.eq("assignee_agent_id", filter.assigneeAgentId);
}
const { data, error } = await query;
assertDb(error, "support_conversations.select");
```

Then remove the now-redundant inbox/status/assignee branches from the JS
filter block (lines 682–699) but KEEP the `q` (lines 700–710) and
`labelSlugs` (lines 711–714) JS filters operating on the mapped
conversations.

**Status semantics check**: the current JS filter compares
`conversation.status` (the _mapped_ value from `toConversation`). Read
`toConversation` (around line 433) before writing this step. If the mapping
derives status (e.g. computes `snoozed` from `snoozed_until` rather than
reading `row.status` verbatim), the SQL `eq("status", ...)` is NOT equivalent
— in that case keep the status filter in JS, apply only inbox/assignee in
SQL, and say so in your report.

`conversationLabelsById()` (lines 415–431) may remain as-is in this step:
after SQL filtering it is the remaining full-table read, but it feeds the
label data for `labelSlugs` and the conversation mapping. Optional
improvement if straightforward: scope the
`support_conversation_labels` query with `.in("conversation_id", ids)`
(chunked by 100, same pattern as Step 1) using the ids of the rows returned
by the conversations query, and keep `support_labels` unscoped (small table).

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0;
`bunx vitest run tests/unit/apps/admin/app/support tests/unit/apps/admin/features/support-hub` → all pass.

### Step 3: Use the messageId expression index for threading

In `findThreadedConversation` (lines 1302–1324), replace the full fetch +
JS `.find` with a filtered query against the JSON expression the index
covers:

```ts
if (headerCandidates.length > 0) {
  const { data, error } = await client()
    .from("support_messages")
    .select("conversation_id, email_headers")
    .eq("tenant_id", tenantId())
    .in("email_headers->>messageId", headerCandidates)
    .limit(1);
  assertDb(error, "support_messages.thread_lookup");
  const conversationId = asString(
    (data?.[0] as SupabaseRow | undefined)?.conversation_id,
  );
  if (conversationId) {
    return supabaseSupportHubAdapter.conversations.get(conversationId);
  }
}
```

supabase-js supports JSON-path columns in filter positions as plain strings
(`"email_headers->>messageId"`). If the generated TypeScript types reject the
string, use the untyped escape hatch with identical semantics:
`.filter("email_headers->>messageId", "in", `(${headerCandidates.map((v) => `"${v}"`).join(",")})`)`— prefer`.in()` if it compiles.

Semantics note: the current code takes the first match in `posted_at`-ascending
order; matches beyond one are not expected (messageId headers are unique), so
`.limit(1)` is acceptable. Leave the subject/from fallback path
(lines 1326–1338) unchanged — it reuses `conversations.list`, which Step 2
made cheaper.

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0.

### Step 4: Add adapter unit tests

Create `tests/unit/packages/api/support-hub-supabase-adapter.test.ts`. See
Test plan below.

**Verify**: `bunx vitest run tests/unit/packages/api/support-hub-supabase-adapter.test.ts` → all pass.

### Step 5: Full verification pass

**Verify**: all commands in "Commands you will need" succeed.

## Test plan

- New file: `tests/unit/packages/api/support-hub-supabase-adapter.test.ts`.
- Model the Supabase client mock after `tests/unit/donation-saga.test.ts`
  (it builds a mock admin client with chainable query methods). The adapter
  obtains its client via module-level helpers — read the top of
  `supabase.ts` (`client()` / `tenantId()` / `runWithSupportHubTenant`) to
  see how tenant context is established, and mock at that boundary
  (`vi.mock`) rather than over HTTP.
- Cases to cover:
  1. `listMessages("conv-1")` issues a query containing
     `.eq("conversation_id", "conv-1")` and does NOT fetch attachments when
     there are zero messages.
  2. `listMessages` requests attachments via `.in("message_id", [...])` with
     only the returned messages' ids.
  3. `conversations.list({ status: "open", inboxId: "inbox-1" })` applies
     `.eq` filters (or, if Step 2's status check forced JS status filtering,
     assert inbox/assignee only).
  4. `findThreadedConversation` (exported? if not, test through the exported
     surface that calls it, or export it for testing only if the file already
     has a test-only export pattern — if neither is possible cleanly, drop
     this case and note it).
- Existing tests that must keep passing:
  `bunx vitest run tests/unit/apps/admin/app/support tests/unit/apps/admin/features/support-hub`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n 'allRows("support_messages"' packages/api/src/admin/support-hub/adapter/supabase.ts` returns no matches
- [ ] `grep -n 'allRows("support_message_attachments")' packages/api/src/admin/support-hub/adapter/supabase.ts` returns no matches
- [ ] `bunx turbo run typecheck --filter=@asym/api --filter=@asym/admin` exits 0
- [ ] `bunx turbo run lint --filter=@asym/api --filter=@asym/admin` exits 0
- [ ] `bunx vitest run tests/unit/apps/admin/app/support tests/unit/apps/admin/features/support-hub tests/unit/packages/api` exits 0
- [ ] New adapter test file exists and passes
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The excerpts above don't match the live code (drift).
- `toConversation` derives `status`/`inboxId` in a way that makes SQL-side
  equality filtering non-equivalent AND you cannot cleanly keep that one
  filter in JS (report what the mapping does instead).
- The supabase-js version in `node_modules` rejects both
  `.in("email_headers->>messageId", ...)` and the `.filter(...)` fallback at
  runtime or compile time.
- Any existing support-hub test fails in a way that suggests the in-memory
  parity contract differs from your SQL behavior (e.g. ordering or
  unassigned-filter semantics).
- The fix appears to require changing `types.ts` or the in-memory adapter.

## Maintenance notes

- This plan deliberately does NOT add pagination — `list` and `listMessages`
  still return full (filtered) sets because the interface and the inbox UI
  expect that. If tenants grow past a few thousand conversations, the
  follow-up is cursor pagination through `SupportConversationFilter` plus UI
  changes.
- Reviewer should scrutinize: `assigneeAgentId === null` → `.is(...)` (SQL
  `IS NULL`) vs `undefined` → no filter; and that `q`/`labelSlugs` results are
  unchanged (they still run in JS on mapped rows).
- The `support_messages_message_id_header_idx` expression index only matches
  queries that filter on exactly `email_headers ->> 'messageId'` — if anyone
  renames that JSON key, both the index and Step 3's filter must change
  together.
