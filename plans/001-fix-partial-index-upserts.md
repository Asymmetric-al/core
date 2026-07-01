# Plan 001: Make routing-review and saved-route writes work against the partial unique indexes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 1b2afd5a..HEAD -- packages/api/src/workflows/adapters/inbound-routing.ts supabase/migrations/20260611160000_support_inbound_routes.sql tests/unit/packages/api/workflows/inbound-routing.test.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `1b2afd5a`, 2026-06-12

## Why this matters

Two `upsert()` calls in `packages/api/src/workflows/adapters/inbound-routing.ts`
pass `onConflict` column lists whose only matching unique indexes are **partial**
(`WHERE status = 'pending'` / `WHERE is_active`). PostgREST emits
`ON CONFLICT (cols)` without the index predicate, and Postgres cannot infer a
partial unique index as an arbiter without it, so **both statements fail at
runtime with error 42P10** ("there is no unique or exclusion constraint matching
the ON CONFLICT specification"). Consequences: every inbound email held for
routing review throws (the email is neither routed nor held — it becomes
invisible to staff), and every staff "save route and continue" request returns 500. CI passes because unit tests mock the Supabase client.

## Current state

- `supabase/migrations/20260611160000_support_inbound_routes.sql` — defines both
  tables. The only unique indexes are partial:

  ```sql
  CREATE UNIQUE INDEX IF NOT EXISTS idx_support_inbound_routes_active_match
    ON public.support_inbound_routes (tenant_id, scope, match_value)
    WHERE is_active;
  -- ...
  CREATE UNIQUE INDEX IF NOT EXISTS idx_support_inbound_routing_reviews_pending
    ON public.support_inbound_routing_reviews (tenant_id, inbound_email_id)
    WHERE status = 'pending';
  ```

- `packages/api/src/workflows/adapters/inbound-routing.ts`:
  - `ensureRoutingReview` (~line 219): `.upsert({...}, { onConflict: "tenant_id,inbound_email_id", ignoreDuplicates: true })`
  - `saveInboundRouteAndResume` (~line 322–334): `.upsert({...}, { onConflict: "tenant_id,scope,match_value", ignoreDuplicates: false }).select("id").single()`
- Repo precedent for handling unique-violation races client-side:
  `packages/api/src/email/webhooks/resend.ts` has `isDuplicateEmailEvent`, which
  checks PostgreSQL error code `23505` after a plain `.insert()` and treats it
  as an idempotent replay. **Match this pattern.**
- The partial indexes themselves are CORRECT and must stay: they enforce "one
  _pending_ review per email" and "one _active_ route per (scope, value)" while
  allowing resolved reviews / disabled routes to accumulate. Do **not** convert
  them to full unique constraints — that would block legitimate re-reviews and
  route re-creation after delete.

## Commands you will need

| Purpose         | Command                                                                     | Expected on success |
| --------------- | --------------------------------------------------------------------------- | ------------------- |
| Install         | `bun install`                                                               | exit 0              |
| Focused tests   | `bunx vitest run tests/unit/packages/api/workflows/inbound-routing.test.ts` | all pass            |
| Typecheck (api) | `bunx turbo run typecheck --filter=@asym/api`                               | exit 0              |
| Lint (api)      | `bunx turbo run lint --filter=@asym/api`                                    | exit 0              |
| Format check    | `bun run format:check`                                                      | exit 0              |

## Scope

**In scope** (the only files you should modify):

- `packages/api/src/workflows/adapters/inbound-routing.ts`
- `tests/unit/packages/api/workflows/inbound-routing.test.ts`

**Out of scope** (do NOT touch, even though they look related):

- `supabase/migrations/20260611160000_support_inbound_routes.sql` — already
  applied in some environments; the indexes are semantically right. Fix the
  client code, not the schema.
- `packages/api/src/workflows/ledger.ts` — its upsert targets a FULL unique
  constraint (`workflow_dispatch_requests_tenant_idempotency_unique`) and works
  correctly; do not "fix" it the same way.
- `packages/api/src/admin/support-hub/inbound-routes.ts` (route handler) — no
  behavior change needed there.

## Git workflow

- Work on the current branch `claude/inngest-durable-workflow-executor` (this
  is a fix-up of unmerged work on that branch).
- Conventional commit, e.g. `fix(workflows): replace partial-index upserts with insert-or-detect-conflict`.
- Do NOT push unless the operator instructed it.

## Steps

### Step 1: Rewrite `ensureRoutingReview` as insert + 23505 tolerance

Replace the `.upsert(...)` call with a plain `.insert(...)` of the same row.
After the call, treat success OR a unique-violation as OK:

```ts
const { error } = await client.from("support_inbound_routing_reviews").insert({
  tenant_id: row.tenant_id,
  inbound_email_id: row.id,
  status: "pending",
  reason: decision.reason,
  candidate_inbox_ids: decision.candidateInboxIds,
});

if (error && error.code !== "23505") {
  throw new Error(`inbound_routing_review_failed: ${error.message}`);
}
```

(`23505` = an open pending review already exists for this email — the partial
unique index did its job; that is the idempotent-replay case the old
`ignoreDuplicates: true` intended.)

**Verify**: `bunx vitest run tests/unit/packages/api/workflows/inbound-routing.test.ts` → the existing "holds unknown routes for tenant review" test fails until the test's mock is updated in Step 3 (expected at this point) OR passes if the mock already routes `.insert`. Note the failure shape; continue.

### Step 2: Rewrite the route save in `saveInboundRouteAndResume` as insert, then update-on-conflict

Replace the `.upsert(...).select("id").single()` with:

1. Try `.insert({ tenant_id, scope, match_value, inbox_id, is_active: true, created_by_profile_id }).select("id").single()`.
2. If the insert failed with `error.code === "23505"` (an active route already
   exists for this tenant+scope+match_value), perform an update of the existing
   active row and fetch its id:

```ts
const updated = await deps.client
  .from("support_inbound_routes")
  .update({
    inbox_id: input.inboxId,
    created_by_profile_id: input.actorProfileId,
  })
  .eq("tenant_id", input.tenantId)
  .eq("scope", input.scope)
  .eq("match_value", matchValue)
  .eq("is_active", true)
  .select("id")
  .single();
```

3. Any other error (or missing row after both attempts) → keep throwing
   `inbound_route_save_failed: ...` as today.

Preserve everything downstream (audit entry, review resolution, dispatch,
`resumeMatchingPendingReviews`) unchanged — only the row-write strategy changes.

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0.

### Step 3: Update the unit tests' client mock and add 23505 coverage

In `tests/unit/packages/api/workflows/inbound-routing.test.ts`, the
`createRoutingClientMock` factory currently exposes `upsert` for both tables.
Update it so:

- `support_inbound_routing_reviews` exposes `insert` (record the write, return
  `{ data: null, error: null }`), and the existing review test asserts the
  `insert` write instead of `upsert`.
- `support_inbound_routes` exposes `insert` returning a chain whose
  `.select().single()` resolves `{ data: { id: ROUTE_ID }, error: null }`, and
  `update` returning a chain resolving the same.

Add two new tests:

1. "treats an existing pending review as an idempotent replay": the
   `insert` mock resolves `{ data: null, error: { code: "23505", message: "duplicate" } }`
   → `ensureRoutingReview` resolves without throwing.
2. "redirects an existing active route instead of failing": the routes `insert`
   mock resolves with `error: { code: "23505" }`, the `update` chain resolves
   `{ data: { id: ROUTE_ID } }` → `saveInboundRouteAndResume` returns
   `status: "saved"` with `routeId: ROUTE_ID`, and the `update` was called with
   `inbox_id` set to the requested inbox.

Model the mocks on the existing `chain()` helper already in this test file.

**Verify**: `bunx vitest run tests/unit/packages/api/workflows/inbound-routing.test.ts` → all pass, including 2 new tests.

## Test plan

Covered in Step 3 (two new behavior tests: pending-review replay tolerance,
active-route redirect-on-conflict). Existing tests in the same file must keep
passing unmodified in intent (assertions may change from `upsert` to `insert`).

## Done criteria

- [ ] `grep -n "upsert" packages/api/src/workflows/adapters/inbound-routing.ts` returns no matches
- [ ] `bunx vitest run tests/unit/packages/api/workflows/inbound-routing.test.ts` exits 0 with 2 new tests
- [ ] `bunx turbo run typecheck --filter=@asym/api` exits 0
- [ ] `bunx turbo run lint --filter=@asym/api` exits 0
- [ ] `bun run format:check` exits 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The migration file no longer matches the excerpts (someone already converted
  the indexes to full constraints — then the original upserts may be correct
  and this plan is moot).
- A second unique index/constraint on either column set exists anywhere in
  `supabase/migrations/` (grep `support_inbound_routes` and
  `support_inbound_routing_reviews` across all migrations first).
- supabase-js error objects in this repo do not expose `.code` (check
  `isDuplicateEmailEvent` in `packages/api/src/email/webhooks/resend.ts` for
  the established access pattern and reuse it).

## Maintenance notes

- If a future migration adds full unique constraints, the insert+23505 dance
  can be simplified back to a single upsert — leave a comment pointing here.
- The 23505-tolerance pattern now exists in two files (resend webhook, this
  adapter); Plan 004 proposes extracting a shared helper.
- Reviewer should scrutinize: the update-on-conflict path must filter on
  `is_active = true` (only one such row can exist) — without that filter it
  would update disabled historical rows.
