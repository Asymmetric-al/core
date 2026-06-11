# Plan 003: Harden the inbound-email pipeline — header preservation, routing dedupe, review visibility, move-retry tolerance

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 1b2afd5a..HEAD -- packages/api/src/email/webhooks/resend.ts packages/api/src/workflows/adapters/inbound-email.ts packages/api/src/workflows/summaries.ts packages/api/src/admin/support-hub/move-service.ts packages/api/src/admin/support-hub/adapter/supabase.ts apps/admin/app/contributions/data.ts tests/unit`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1 (items A–C), P2 (items D–G)
- **Effort**: M
- **Risk**: MED (touches routing/move flows; every change narrow + tested)
- **Depends on**: plans/001-fix-partial-index-upserts.md (review-hold writes must work before review visibility matters)
- **Category**: bug
- **Planned at**: commit `1b2afd5a`, 2026-06-12

## Why this matters

Seven verified defects across the inbound email → Support Hub pipeline and
adjacent staff surfaces, all introduced on this branch:

- **A. Header clobber**: a Resend webhook redelivery overwrites the
  provider-enriched `message_id_header`/`in_reply_to_header`/`references_headers`
  with (often-null) event-data values, permanently breaking future thread-reply
  routing for that email.
- **B. Duplicate Support Hub messages**: the bridge update after routing never
  checks its error; a failed write leaves `support_message_id` null while the
  run reports "routed", and any re-dispatch creates a second support message.
- **C. Review-held mail is invisible**: emails in routing review show as routine
  "Processing" in Mission Control (`loadInboundEmailOutcomes` never consults
  `support_inbound_routing_reviews`), and no surface lists pending reviews.
- **D. Move audit failure poisons retries**: a conversation that moved but
  failed its audit insert is recorded "failed"; Retry failed then errors
  forever with `same_inbox`.
- **E. Staff retry can strand a stuck "retrying" badge**: the status flip
  happens before the ledger write; if that throws, no run is coming and the UI
  retry button (shown only for `failed`) disappears.
- **F. Tenant-scoping convention break**: the new attachment-status lookup in
  the Support Hub adapter queries `email_inbound_messages` by ids only, on the
  service-role client, without the adapter's standard tenant filter.
- **G. Processing filter gap**: `contributionStatusOptions` lacks the new
  `processing` status, so in-flight ACH gifts can't be selected by any filter
  chip.

## Current state

- `packages/api/src/email/webhooks/resend.ts` (~lines 835–856): the inbound
  placeholder upsert (`onConflict: "resend_email_id"`) includes
  `message_id_header`, `in_reply_to_header`, `references_headers` computed from
  webhook event data only.
- `packages/api/src/workflows/adapters/inbound-email.ts`:
  - `retrieveInboundBody` enriches the same three header columns from provider
    headers and early-returns `already_available` when
    `body_retrieval_status === "available"` (~lines 122–132) — so a clobber is
    never re-fixed.
  - `routeReadyInboundEmail` (~lines 353–364): after `routing.status === "routed"`,
    the bridge update result is not error-checked:

    ```ts
    await client.from(INBOUND_TABLE).update({
      conversation_id: routing.conversationId,
      support_message_id: routing.messageId,
    }).eq("id", row.id);
    ```

  - `requestInboundEmailRetryDispatch` (~lines 459–491): writes `statusPatch`
    (body→`pending` / attachments→`retrying`) BEFORE `requestDispatch`, no
    rollback on throw.
  - `support_messages` rows carry `inbound_email_id` (FK to
    `email_inbound_messages.id`) — usable for dedupe.
- `packages/api/src/workflows/summaries.ts` `loadInboundEmailOutcomes`
  (~lines 105–130): maps body-available + `support_message_id`-null rows to
  `"processing"`; never queries `support_inbound_routing_reviews`.
  `WorkflowSummaryState` union lives at the top of the same file;
  `evaluateWorkflowNotification` in
  `packages/api/src/workflows/notification-policy.ts` switches on that state;
  the staff table tones live in
  `apps/admin/features/mission-control/components/WorkflowSummariesTable.tsx`
  (`STATE_TONES` record — adding a union member is compile-enforced there).
- `packages/api/src/admin/support-hub/move-service.ts`:
  - `moveSupportConversation` returns `failure(..., "move_failed")` when an
    audit insert errors AFTER the conversation row was already updated
    (~lines 199–225); `same_inbox` check at ~line 136.
  - `retryFailedBulkMove` re-runs failed items through
    `bulkMoveSupportConversations` with `isRetry: true`.
- `packages/api/src/admin/support-hub/adapter/supabase.ts` (~lines 757–761):

  ```ts
  const { data: inboundRows, error: inboundError } = await client()
    .from("email_inbound_messages")
    .select("id, attachment_retrieval_status")
    .in("id", inboundEmailIds);
  ```

  Every other query in this adapter scopes `.eq("tenant_id", tenantId())` —
  see `allRows` (~line 143).
- `apps/admin/app/contributions/data.ts` (~lines 134–139):
  `contributionStatusOptions` lists Completed/Pending/Failed/Refunded only.
  The badge/label records in `columns.tsx`, `main-body.tsx`,
  `contribution-detail-sheet.tsx` already include `processing`.

## Commands you will need

| Purpose       | Command                                                                                                                                                                | Expected on success |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| Install       | `bun install`                                                                                                                                                              | exit 0              |
| Focused tests | `bunx vitest run tests/unit/packages/api/workflows tests/unit/packages/api/email tests/unit/packages/api/support-hub-move-service.test.ts`                                  | all pass            |
| UI test       | `bunx vitest run tests/unit/apps/admin/features/mission-control/workflow-summaries-table.test.tsx`                                                                          | all pass            |
| Typecheck     | `bunx turbo run typecheck --filter=@asym/api --filter=@asym/admin`                                                                                                          | exit 0              |
| Full gates    | `bun run format:check && bun run verify:data-boundary && bun run verify:workspace-contract`                                                                                 | all exit 0          |

## Scope

**In scope** (the only files you should modify):

- `packages/api/src/email/webhooks/resend.ts`
- `packages/api/src/workflows/adapters/inbound-email.ts`
- `packages/api/src/workflows/summaries.ts`
- `packages/api/src/workflows/notification-policy.ts`
- `apps/admin/features/mission-control/components/WorkflowSummariesTable.tsx`
- `packages/api/src/admin/support-hub/move-service.ts`
- `packages/api/src/admin/support-hub/adapter/supabase.ts`
- `apps/admin/app/contributions/data.ts`
- Corresponding test files under `tests/unit/`

**Out of scope** (do NOT touch):

- `packages/api/src/admin/support-hub/inbound-router.ts` and
  `adapter/supabase.ts` routing insert path (`routeInboundEmailToSupabaseSupportHub`)
  beyond what Step B specifies — no threading-logic changes.
- `supabase/migrations/*` — all fixes are application-level.
- The webhook's tenant-resolution and `email_events` logic in resend.ts.

## Git workflow

- Current branch `claude/inngest-durable-workflow-executor`; conventional
  commits per logical item (A–G can be one commit each or grouped A–C / D–G).
- Do NOT push unless the operator instructed it.

## Steps

### Step A: Stop the webhook from overwriting enriched headers

In `packages/api/src/email/webhooks/resend.ts`, remove `message_id_header`,
`in_reply_to_header`, and `references_headers` (and their local computation if
then unused) from the placeholder upsert payload. The inbound workflow's
`retrieveInboundBody` is now the single writer of those columns (it already
falls back to event-data-derived values via `?? row.message_id_header`
— since the placeholder no longer sets them, ALSO change those fallbacks in
`packages/api/src/workflows/adapters/inbound-email.ts` to fall back to the
event payload stored on the row when provider headers lack a value:
`getHeaderValue(...) ?? row.message_id_header` stays correct because the row
value will simply be null on first run; no further change needed).

Update the placeholder-shape test in
`tests/unit/packages/api/email/webhooks-resend.test.ts`
("stores a metadata-only placeholder...") to assert the upsert payload does
NOT have `message_id_header` / `in_reply_to_header` / `references_headers`
properties, and add one test: a second webhook delivery (replay) never includes
header columns in its upsert payload.

**Verify**: `bunx vitest run tests/unit/packages/api/email/webhooks-resend.test.ts` → all pass.

### Step B: Make routing idempotent against a lost bridge write

In `packages/api/src/workflows/adapters/inbound-email.ts`
`routeReadyInboundEmail`:

1. Before calling `route(...)`, add a recovery lookup: query `support_messages`
   for an existing message already linked to this inbound email —
   `.from("support_messages").select("id, conversation_id").eq("tenant_id", row.tenant_id).eq("inbound_email_id", row.id).maybeSingle()`.
   If found, write the bridge columns (same update as below, error-checked) and
   return `{ status: "already_routed", conversationId, messageId, reason: "recovered existing Support Hub message link." }`.
2. After routing succeeds, capture the bridge update result and throw on error
   (mirror the `inbound_body_persist_failed` pattern at ~line 188):

   ```ts
   const bridge = await client.from(INBOUND_TABLE).update({...}).eq("id", row.id);
   if (bridge.error) throw new Error(`inbound_bridge_persist_failed: ${bridge.error.message}`);
   ```

   A thrown step retries; on retry, the new recovery lookup in (1) finds the
   inserted message and backfills the bridge instead of re-routing — no
   duplicates.

Add two tests in `tests/unit/packages/api/workflows/inbound-email-workflow.test.ts`:
- "recovers the bridge link instead of routing twice": mock the
  `support_messages` lookup returning `{ id: "msg-1", conversation_id: "conv-1" }`
  → `route` not called, status `already_routed`, bridge update written.
- "throws when the bridge write fails so the step retries": routing mock
  returns routed, bridge update mock resolves `{ error: { message: "boom" } }`
  → the call rejects with `/inbound_bridge_persist_failed/`.
(The existing client mock's `from` only handles one table — extend it with a
table-routing map like the one in `inbound-routing.test.ts`.)

**Verify**: `bunx vitest run tests/unit/packages/api/workflows/inbound-email-workflow.test.ts` → all pass with 2 new tests.

### Step C: Surface review-held email as action-required

1. In `packages/api/src/workflows/summaries.ts`: add `"action_required"` to
   `WorkflowSummaryState`. In `loadInboundEmailOutcomes`, accept the client and
   tenant as today, and additionally query
   `support_inbound_routing_reviews` for `status = 'pending'` rows whose
   `inbound_email_id` is in the subject-id set; any email with a pending review
   maps to `"action_required"` (this takes precedence over the
   `support_message_id`-null → `processing` fallback).
2. In `packages/api/src/workflows/notification-policy.ts`: handle
   `"action_required"` → `{ level: "urgent", reason: "Staff action is required (inbound routing review)." }`.
3. In `apps/admin/features/mission-control/components/WorkflowSummariesTable.tsx`:
   add the `action_required` entry to `STATE_TONES`
   (`label: "Needs routing review"`, amber tone — copy the `retrying` tone
   classes but with `border-amber-300 bg-amber-100 text-amber-800`). TypeScript
   will refuse to compile until the record is complete — that is the guard.

Add tests: in `tests/unit/packages/api/workflows/summaries-policy.test.ts`, a
ledger row of subject_type `email_inbound_message` + a mocked pending-review
lookup → state `"action_required"`; and
`evaluateWorkflowNotification({ state: "action_required", ... })` → urgent.
In the UI table test, one row with state `action_required` renders
"Needs routing review".

**Verify**: `bunx vitest run tests/unit/packages/api/workflows/summaries-policy.test.ts tests/unit/apps/admin/features/mission-control/workflow-summaries-table.test.tsx` → all pass; `bunx turbo run typecheck --filter=@asym/admin --filter=@asym/api` → exit 0.

### Step D: Tolerate already-moved conversations in bulk retry

In `packages/api/src/admin/support-hub/move-service.ts`:

1. In `bulkMoveSupportConversations`, when `moveSupportConversation` returns
   `code: "same_inbox"` AND `options.isRetry` is true, record the item as
   `{ conversationId, status: "moved" }` (the conversation is at the
   destination — the original attempt succeeded but its audit/bookkeeping
   failed). Leave non-retry `same_inbox` as a failure (staff picked a no-op
   destination).
2. Combine the two audit-marker inserts into ONE `.insert([movedIn, movedOut])`
   call so they succeed or fail together (build both row objects, single
   insert, one error check).

Add tests in `tests/unit/packages/api/support-hub-move-service.test.ts`:
- "retry treats an already-moved conversation as success": batch with one item
  whose conversation row already has `inbox_id === destination` → retry result
  has that item `moved`, batch `completed`.
- Adjust the marker test to expect a single insert call carrying both rows
  (assert the insert payload is an array of length 2 with the two verbs).

**Verify**: `bunx vitest run tests/unit/packages/api/support-hub-move-service.test.ts` → all pass.

### Step E: Flip retry status only after the dispatch is recorded

In `packages/api/src/workflows/adapters/inbound-email.ts`
`requestInboundEmailRetryDispatch`: move the `statusPatch` update to AFTER the
`requestDispatch` call succeeds (between dispatch and `return`), so a ledger
failure leaves the row in its previous (`failed`) state and the UI retry button
stays available. Update the test "dispatches a retry through claims and the
workflow ledger" only if it asserts ordering; add one test: when
`requestDispatch` rejects, the function rethrows AND no status update was
written (assert `mock.updates` does not contain a `body_retrieval_status` /
`attachment_retrieval_status` patch).

**Verify**: `bunx vitest run tests/unit/packages/api/workflows/inbound-email-workflow.test.ts` → all pass.

### Step F: Tenant-scope the attachment-status lookup

In `packages/api/src/admin/support-hub/adapter/supabase.ts`, add
`.eq("tenant_id", tenantId())` to the `email_inbound_messages` status query in
`listMessages` (match the scoping in `allRows` at ~line 143).

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0; `bunx vitest run tests/unit/apps/admin/features/support-hub` → all pass.

### Step G: Add the Processing filter chip

In `apps/admin/app/contributions/data.ts`, add
`{ label: "Processing", value: "processing" }` to `contributionStatusOptions`
(match the exact object shape of the existing entries — read the array first).

**Verify**: `bunx turbo run typecheck --filter=@asym/admin` → exit 0.

## Test plan

Each step above names its tests. Net-new tests: ≥7. Structural patterns:
`inbound-routing.test.ts` (table-routed client mock), `summaries-policy.test.ts`,
`workflow-summaries-table.test.tsx` (jsdom + testing-library),
`support-hub-move-service.test.ts`.

## Done criteria

- [ ] `bunx vitest run tests/unit/packages/api tests/unit/apps/admin` exits 0 with the new tests present
- [ ] `grep -n "message_id_header" packages/api/src/email/webhooks/resend.ts` returns no matches inside the upsert payload (header columns no longer written by the webhook)
- [ ] `grep -n "inbound_bridge_persist_failed" packages/api/src/workflows/adapters/inbound-email.ts` returns 1 match
- [ ] `grep -n "action_required" packages/api/src/workflows/summaries.ts packages/api/src/workflows/notification-policy.ts apps/admin/features/mission-control/components/WorkflowSummariesTable.tsx` → ≥3 matches
- [ ] `grep -n "tenant_id" packages/api/src/admin/support-hub/adapter/supabase.ts | grep -n "attachment_retrieval_status" -A2 -B2` — the status query carries the tenant filter (manual read acceptable)
- [ ] `bunx turbo run typecheck --filter=@asym/api --filter=@asym/admin` exits 0
- [ ] `bun run format:check && bun run verify:data-boundary && bun run verify:workspace-contract` all exit 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `support_messages` has no `inbound_email_id` column (Step B's dedupe lookup
  is impossible as specified) — check migration
  `supabase/migrations/20260515025814_support_hub_core_modules.sql` first.
- Adding `action_required` to `WorkflowSummaryState` breaks more than the three
  named consumers (search `WorkflowSummaryState` repo-wide; if a fourth consumer
  exists, list it and stop).
- The move-service single-insert change conflicts with how the test mock
  records writes in a way that requires redesigning the mock factory (more than
  ~20 lines of test-harness change).

## Maintenance notes

- Step B's recovery lookup makes routing safe to re-run; if the routing adapter
  later gains its own `resend_email_id` dedupe, the lookup becomes redundant
  but harmless.
- Step C's pending-review query adds one round trip per summaries call; if a
  review-queue UI lands later, consider a shared read.
- Step D treats retry-time `same_inbox` as success — if a legitimate "staff
  retried into a different destination" flow is ever added, revisit (currently
  the retry always reuses the original destination, so same_inbox can only mean
  already-moved).
