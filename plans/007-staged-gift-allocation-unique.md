# Plan 007: Backstop the concurrent-webhook allocation race with a partial unique index

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Reviewer maintains `plans/README.md`.
>
> **Drift check (run after setup)**: `git diff --stat a661bfb9..HEAD -- packages/api/src/giving/staged-gifts.ts packages/api/src/admin/contributions/staged-gifts.ts supabase/migrations`
> The staged-gifts file WAS changed on this branch (the retry-repair landed in
> commit `69d31894`); your base already includes it. Compare the "Current
> state" excerpt below against the live file before editing; on a mismatch,
> STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (schema migration on a money table)
- **Depends on**: plan 004 (already merged into this branch — the
  `ensureInitialAllocation` helper this plan hardens was introduced there)
- **Category**: bug
- **Planned at**: commit `4126f0a4`, 2026-06-11

## Why this matters

Plan 004 made staged-gift creation self-healing by adding
`ensureInitialAllocation`, a read-then-insert that now runs on **every**
webhook path including the 23505 duplicate path. Stripe delivers webhooks
at-least-once and can deliver the same `payment_intent.succeeded` to two
workers concurrently. The `staged_gifts.donation_id` unique constraint
serializes the gift insert (one winner, one 23505 loser), but **both** then
call `ensureInitialAllocation`; if neither's allocation read sees the other's
not-yet-committed insert, both insert — producing a duplicate initial
allocation that double-counts in fund/missionary totals. There is no unique
constraint on `staged_gift_allocations` today (only a non-unique index). This
plan adds a partial unique index that permits at most one _initial_ allocation
per gift, and makes the insert treat the resulting 23505 as success. The
admin split flow (which creates many allocations per gift) is unaffected
because its rows are not marked initial.

## Current state

### Schema (`supabase/migrations/20260512190000_phase_03_giving_pipeline.sql:153-166`)

```sql
CREATE TABLE IF NOT EXISTS public.staged_gift_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staged_gift_id UUID NOT NULL REFERENCES public.staged_gifts(id) ON DELETE CASCADE,
  fund_id UUID REFERENCES public.funds(id) ON DELETE SET NULL,
  missionary_id UUID REFERENCES public.missionaries(id) ON DELETE SET NULL,
  amount BIGINT NOT NULL CHECK (amount >= 0),
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staged_gift_allocations_gift
  ON public.staged_gift_allocations (staged_gift_id);
```

The table is service-role-only (RLS enabled; grants to `service_role` in the
same migration). Adding a column inherits those grants; no new REST-exposure
migration is needed.

### The helper to harden (`packages/api/src/giving/staged-gifts.ts`, ~lines 257-289)

```ts
async function ensureInitialAllocation(input: {
  supabaseAdmin: SupabaseAdminClient;
  tenantId: string;
  stagedGiftId: string;
  donation: DonationForStaging;
}) {
  if (!(input.donation.amount > 0)) {
    return;
  }

  const existing = await input.supabaseAdmin
    .from("staged_gift_allocations")
    .select("id")
    .eq("staged_gift_id", input.stagedGiftId)
    .limit(1)
    .maybeSingle();
  requireNoError(existing.error, "Failed to read staged gift allocations.");
  if (isJsonRecord(existing.data)) {
    return;
  }

  const { error } = await input.supabaseAdmin
    .from("staged_gift_allocations")
    .insert({
      tenant_id: input.tenantId,
      staged_gift_id: input.stagedGiftId,
      fund_id: input.donation.fund_id,
      missionary_id: input.donation.missionary_id,
      amount: input.donation.amount,
      memo: "Initial allocation from Stripe payment intent.",
    });
  requireNoError(error, "Failed to stage gift allocation.");
}
```

This helper is called on three paths (early-return, 23505 duplicate, fresh
insert) — all in `stageGiftFromStripeDonation`. Leave those call sites
unchanged; only the helper body changes.

### Admin split flow — confirms why a plain UNIQUE(staged_gift_id) is wrong

`packages/api/src/admin/contributions/staged-gifts.ts:154-173` deletes all
allocations for a gift then inserts the new split set (N rows per gift), with
no kind marker. A unique constraint on `staged_gift_id` alone would break
this. The partial index in this plan keys on a new `is_initial` flag that
those split inserts leave at its default (`false`), so they never collide.

## Commands you will need

| Purpose          | Command                                                                                                                            | Expected on success  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Install          | `bun install`                                                                                                                      | exit 0               |
| Typecheck        | `bunx turbo run typecheck --filter=@asym/api`                                                                                      | exit 0               |
| Lint             | `bunx turbo run lint --filter=@asym/api`                                                                                           | exit 0               |
| Tests            | `bunx vitest run tests/unit/packages/api/giving-staged-gifts.test.ts tests/unit/packages/api/stripe-webhooks.test.ts`              | all pass             |
| Migration syntax | `node scripts/verify/supabase-migrations.mjs` (if it runs without a live DB; otherwise note that CI's `migrate` gate validates it) | exit 0 or documented |
| Format           | `bunx prettier --check <changed files>`                                                                                            | exit 0               |

Known repo conditions (pre-existing, not yours): `.husky/pre-commit` may fail
with "exec format error" on Windows — if so, run `bunx lint-staged
--concurrent false --no-stash`, confirm it passes, commit with `HUSKY=0`, and
note it. `bun run format:check` fails on the base commit
(`docs/ai/skills/idempotency-handling/SKILL.md`) — use `bunx prettier --check`
on your changed files instead.

## Scope

**In scope** (the only files you create/modify):

- `supabase/migrations/20260611120000_staged_gift_allocation_initial_unique.sql` (create)
- `supabase/migrations/rollback_20260611120000_staged_gift_allocation_initial_unique.sql` (create — matches the repo's `rollback_*.sql` convention)
- `packages/api/src/giving/staged-gifts.ts` (only the `ensureInitialAllocation` body)
- `tests/unit/packages/api/giving-staged-gifts.test.ts` (add concurrency case)

**Out of scope** (do NOT touch):

- `packages/api/src/admin/contributions/staged-gifts.ts` — the split-insert
  path. Its rows default `is_initial = false`; verified this is correct and
  needs no change.
- The three call sites of `ensureInitialAllocation` in
  `stageGiftFromStripeDonation` — unchanged.
- Any other migration file; `supabase/seed.sql`.
- The donation saga, refund path, anything below the helper.

## Git workflow

- Branch: `advisor/007-staged-gift-allocation-unique` created from `4126f0a4`
  (this branch's current HEAD — NOT a661bfb9, because this plan builds on the
  plan-004 change already in history). In SETUP: `git checkout -b
advisor/007-staged-gift-allocation-unique 4126f0a4`.
- Commit style: conventional commits, e.g.
  `fix(api): enforce one initial staged-gift allocation per gift`
- Do NOT push or open a PR.

## Steps

### Step 1: Create the migration (exact SQL — do not improvise)

Create `supabase/migrations/20260611130000_staged_gift_allocation_initial_unique.sql`:

```sql
BEGIN;

-- Mark the single allocation auto-created at Stripe-webhook staging time.
-- Admin split allocations (apps admin contributions PATCH) leave this false,
-- so they are never constrained by the partial unique index below.
ALTER TABLE public.staged_gift_allocations
  ADD COLUMN IF NOT EXISTS is_initial BOOLEAN NOT NULL DEFAULT false;

-- Pre-migration webhook rows were the sole allocation per gift; mark the earliest
-- row per gift as initial when none are flagged yet (admin splits stay false).
UPDATE public.staged_gift_allocations sga
SET is_initial = true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.staged_gift_allocations existing
  WHERE existing.staged_gift_id = sga.staged_gift_id
    AND existing.is_initial = true
)
AND sga.id = (
  SELECT candidate.id
  FROM public.staged_gift_allocations candidate
  WHERE candidate.staged_gift_id = sga.staged_gift_id
  ORDER BY candidate.created_at ASC NULLS LAST, candidate.id ASC
  LIMIT 1
);

-- At most one initial allocation per staged gift. Backstops the
-- concurrent-webhook double-insert race in ensureInitialAllocation
-- (the existence check covers sequential retries; this covers true
-- concurrency where neither delivery sees the other's uncommitted row).
CREATE UNIQUE INDEX IF NOT EXISTS staged_gift_allocations_initial_unique
  ON public.staged_gift_allocations (staged_gift_id)
  WHERE is_initial;

COMMIT;
```

Create the rollback `supabase/migrations/rollback_20260611130000_staged_gift_allocation_initial_unique.sql`:

```sql
BEGIN;

DROP INDEX IF EXISTS public.staged_gift_allocations_initial_unique;

ALTER TABLE public.staged_gift_allocations
  DROP COLUMN IF EXISTS is_initial;

COMMIT;
```

Backfill note: the `UPDATE` marks the earliest allocation per
`staged_gift_id` as `is_initial = true` when none are flagged. Admin split
rows stay `false`. Operators should size the migration window for a full-table
write and transient row locks on `staged_gift_allocations` during apply.

**Verify**: the SQL is syntactically valid (review it against the table
definition above — column name `staged_gift_id` exists, type matches). If
`node scripts/verify/supabase-migrations.mjs` runs without a live DB, run it;
otherwise note in your report that CI's `migrate` gate validates application.

### Step 2: Harden `ensureInitialAllocation`

In `packages/api/src/giving/staged-gifts.ts`, change ONLY the helper's insert:

1. Add `is_initial: true` to the insert payload.
2. Treat a unique-violation (`23505`) as success — a concurrent peer already
   created the initial allocation. Replace the final `requireNoError(...)`
   with:

```ts
const { error } = await input.supabaseAdmin
  .from("staged_gift_allocations")
  .insert({
    tenant_id: input.tenantId,
    staged_gift_id: input.stagedGiftId,
    fund_id: input.donation.fund_id,
    missionary_id: input.donation.missionary_id,
    amount: input.donation.amount,
    memo: "Initial allocation from Stripe payment intent.",
    is_initial: true,
  });
if (error?.code === "23505") {
  // A concurrent webhook delivery already inserted the initial allocation.
  return;
}
requireNoError(error, "Failed to stage gift allocation.");
```

Leave the existence-check fast path (the `.select("id")...maybeSingle()` block
above it) exactly as-is — it still short-circuits the common sequential-retry
and post-admin-edit cases without hitting the index.

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0;
`bunx turbo run lint --filter=@asym/api` → exit 0.

### Step 3: Add the concurrency test

In `tests/unit/packages/api/giving-staged-gifts.test.ts`, add a case modeled
on the existing resilience tests (same mock style): the
`staged_gift_allocations` insert returns `{ error: { code: "23505" } }` →
`stageGiftFromStripeDonation` resolves successfully (does not throw) and
returns the staged gift. This proves the concurrent-loser path is graceful.

Confirm the existing tests still pass — adding `is_initial: true` to the
insert payload must not break any assertion. If a test asserts the exact
insert object (not just call count), update it to include `is_initial: true`
and say so in your report.

**Verify**: `bunx vitest run tests/unit/packages/api/giving-staged-gifts.test.ts tests/unit/packages/api/stripe-webhooks.test.ts` → all pass.

### Step 4: Full verification

**Verify**: typecheck, lint, the two test files, and `bunx prettier --check`
on all changed files all pass.

## Test plan

- Add the 23505-on-allocation case described in Step 3 to
  `giving-staged-gifts.test.ts`.
- The migration itself is validated by CI's `migrate` gate on push (it applies
  all `supabase/migrations/*.sql` against a real Postgres). Do not attempt to
  stand up local Supabase/Docker in the worktree — that is out of proportion
  for this change; the SQL is small and reviewed inline.
- Verification: `bunx vitest run tests/unit/packages/api/giving-staged-gifts.test.ts tests/unit/packages/api/stripe-webhooks.test.ts` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `supabase/migrations/20260611130000_staged_gift_allocation_initial_unique.sql` and its `rollback_` counterpart exist and contain the exact SQL above
- [ ] `grep -n "is_initial: true" packages/api/src/giving/staged-gifts.ts` returns one match (in `ensureInitialAllocation`)
- [ ] `grep -n '"23505"' packages/api/src/giving/staged-gifts.ts` shows the new concurrent-loser guard in `ensureInitialAllocation` (in addition to the existing one in `stageGiftFromStripeDonation`)
- [ ] `bunx turbo run typecheck --filter=@asym/api` exits 0
- [ ] `bunx turbo run lint --filter=@asym/api` exits 0
- [ ] `bunx vitest run tests/unit/packages/api/giving-staged-gifts.test.ts tests/unit/packages/api/stripe-webhooks.test.ts` exits 0
- [ ] `git status` shows no changes outside the in-scope list

## STOP conditions

Stop and report back (do not improvise) if:

- The `ensureInitialAllocation` excerpt doesn't match the live code (drift).
- The `staged_gift_allocations` table already has an `is_initial` column or a
  unique index on `staged_gift_id` (someone got here first).
- You discover the admin split path (`admin/contributions/staged-gifts.ts`)
  sets a value that would make its rows `is_initial = true` (it should not —
  if it does, the partial index would wrongly reject splits; report it).
- A migration-lint/verify script rejects the SQL for a reason you can't
  resolve by matching the repo's existing migration style.

## Maintenance notes

- The partial unique index is the durable backstop that plan 004's
  maintenance note anticipated ("if partial writes are observed in
  production… a transactional RPC / constraint"). The existence check + this
  index together cover sequential retries, post-admin-edit late retries, and
  true concurrency.
- If a future change lets a gift have **no** initial allocation legitimately
  (e.g. zero-amount gifts already skip — that path returns early), the index
  is unaffected (it constrains only rows where `is_initial`).
- Reviewer should scrutinize: the migration backfill semantics (earliest row per
  gift only; admin splits stay `false`), the admin split path is genuinely
  untouched, and `is_initial: true` appears only in `ensureInitialAllocation`.
