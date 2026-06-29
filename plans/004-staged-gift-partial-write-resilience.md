# Plan 004: Make staged-gift creation self-healing across webhook retries

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a661bfb9..HEAD -- packages/api/src/giving/staged-gifts.ts packages/api/src/stripe/webhooks.ts tests/unit/packages/api/giving-staged-gifts.test.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `a661bfb9`, 2026-06-11

## Why this matters

When a Stripe payment succeeds, `stageGiftFromStripeDonation` performs three
sequential Supabase writes with no transaction: insert `staged_gifts`, insert
`staged_gift_allocations`, insert `staged_gift_audit_events`. Supabase
PostgREST offers no client-side transactions, so a transient failure between
writes (network blip, brief DB unavailability) leaves a staged gift without
its allocation row. Stripe retries the webhook — but the function's
idempotency check returns the existing staged gift **without checking whether
the later writes ever happened**. The partial state is then permanent: a real
donation whose gift shows `allocation_status: "single_allocation"` but has
zero allocation rows, silently skewing fund/missionary totals and CRM
posting. The fix makes the retry path repair missing allocations and stops a
failed audit insert from failing the webhook (audit is observability, not
state).

## Current state

All excerpts from `packages/api/src/giving/staged-gifts.ts` at commit
`a661bfb9`.

- The idempotent early-return (lines 260–269) — returns without verifying
  downstream writes:

```ts
const existing = await input.supabaseAdmin
  .from("staged_gifts")
  .select("*")
  .eq("donation_id", input.donation.id)
  .maybeSingle();

requireNoError(existing.error, "Failed to read staged gift.");
if (isJsonRecord(existing.data)) {
  return toStagedGiftRow(existing.data);
}
```

- The insert + duplicate fallback (lines 277–316). Note the `?? {}` fallback
  at lines 312 and 316: if PostgREST ever returned success with no row, the
  function would proceed with `id: ""` (then fail later with an opaque uuid
  error at the allocation FK — `staged_gift_id UUID NOT NULL` per
  `supabase/migrations/20260512190000_phase_03_giving_pipeline.sql:156`):

```ts
if (inserted.error?.code === "23505") {
  const duplicate = await input.supabaseAdmin
    .from("staged_gifts")
    .select("*")
    .eq("donation_id", input.donation.id)
    .single();
  requireNoError(duplicate.error, "Failed to read duplicate staged gift.");
  return toStagedGiftRow((duplicate.data ?? {}) as JsonRecord);
}

requireNoError(inserted.error, "Failed to stage gift.");
const stagedGift = toStagedGiftRow((inserted.data ?? {}) as JsonRecord);
```

- The two follow-up writes (lines 318–342):

```ts
  if (input.donation.amount > 0) {
    const { error: allocationError } = await input.supabaseAdmin
      .from("staged_gift_allocations")
      .insert({
        tenant_id: tenantId,
        staged_gift_id: stagedGift.id,
        fund_id: input.donation.fund_id,
        missionary_id: input.donation.missionary_id,
        amount: input.donation.amount,
        memo: "Initial allocation from Stripe payment intent.",
      });
    requireNoError(allocationError, "Failed to stage gift allocation.");
  }

  await appendGiftAuditEvent({
    supabaseAdmin: input.supabaseAdmin,
    tenantId,
    stagedGiftId: stagedGift.id,
    action: "staged_gift_created",
    ...
  });
```

- `appendGiftAuditEvent` (lines 215–236) throws on any insert error via
  `requireNoError` (lines 143–147).

- Caller: `packages/api/src/stripe/webhooks.ts` lines 173–188 — invoked when
  a payment intent completes; an exception here fails the webhook delivery
  and Stripe retries (re-entering this function, hitting the early return).

- Intentional behavior to preserve (do NOT "fix"):
  - The 23505 fallback (concurrent webhook deliveries) is correct
    idempotency.
  - An allocation row with both `fund_id` and `missionary_id` null is valid:
    `determineInitialReview` (lines 179–202) routes undesignated gifts into
    the `needs_review` flow.
  - `amount === 0` gifts get no allocation row by design (line 318).

- Test exemplars:
  - `tests/unit/packages/api/giving-staged-gifts.test.ts` — existing tests
    for this module (currently pure-function coverage of
    `canTransitionStagedGift` / `buildTwentyGiftSummaryPayload`; extend this
    file).
  - `tests/unit/donation-saga.test.ts` — exemplar for mocking a Supabase
    admin client with chainable `from().select().eq()...` calls.

## Commands you will need

| Purpose   | Command                                                               | Expected on success |
| --------- | --------------------------------------------------------------------- | ------------------- |
| Install   | `bun install`                                                         | exit 0              |
| Typecheck | `bunx turbo run typecheck --filter=@asym/api`                         | exit 0              |
| Lint      | `bunx turbo run lint --filter=@asym/api`                              | exit 0              |
| Tests     | `bunx vitest run tests/unit/packages/api/giving-staged-gifts.test.ts` | all pass            |
| Format    | `bun run format:check`                                                | exit 0              |

## Scope

**In scope** (the only files you should modify):

- `packages/api/src/giving/staged-gifts.ts` (only
  `stageGiftFromStripeDonation` and a new private helper; do not touch the
  refund/transition functions)
- `tests/unit/packages/api/giving-staged-gifts.test.ts`
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):

- `packages/api/src/stripe/webhooks.ts` — caller semantics stay identical.
- `supabase/migrations/**` — a transactional Postgres RPC (like the saga's
  `complete_donation_saga_event` used in `packages/api/src/donate/saga.ts:232-241`)
  is the heavier alternative design; it needs a migration + deploy
  coordination and is deliberately not this plan. Note it in your report if
  you believe repair-on-retry is insufficient.
- `markStagedGiftRefunded` and everything below line 347 in
  `staged-gifts.ts`.
- The donation saga (`packages/api/src/donate/saga.ts`).

## Git workflow

- Branch: `advisor/004-staged-gift-resilience`
- Commit style: conventional commits, e.g.
  `fix(api): repair missing staged-gift allocations on webhook retry`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extract the allocation insert into an idempotent helper

In `staged-gifts.ts`, add a private helper above
`stageGiftFromStripeDonation`:

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

Use the file's actual type names — check the signature of
`stageGiftFromStripeDonation`'s `input` (a `StageGiftInput`) at the top of
the file for the exact `SupabaseAdminClient` / `DonationForStaging` imports;
reuse them.

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0.

### Step 2: Repair on the two idempotent return paths

1. Replace the early return (lines 267–269) with:

```ts
if (isJsonRecord(existing.data)) {
  const existingGift = toStagedGiftRow(existing.data);
  await ensureInitialAllocation({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: existingGift.tenantId,
    stagedGiftId: existingGift.id,
    donation: input.donation,
  });
  return existingGift;
}
```

- Apply the same repair in the 23505 duplicate branch (lines 305–313)
  before returning the duplicate row.

- Replace the fresh-insert allocation block (lines 318–330) with a call to
  `ensureInitialAllocation(...)` so there is exactly one code path that
  writes allocations. (On the fresh path the existence check is one extra
  cheap indexed read per new gift; correctness uniformity is worth it.)

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0.

### Step 3: Fail loudly on missing insert data; fail softly on audit

1. Replace line 316's masking fallback:

```ts
requireNoError(inserted.error, "Failed to stage gift.");
if (!isJsonRecord(inserted.data)) {
  throw new Error("Staged gift insert returned no row.");
}
const stagedGift = toStagedGiftRow(inserted.data);
```

Apply the same explicit check in the 23505 branch instead of
`(duplicate.data ?? {})`.

- Make the audit write non-fatal — it is observability, and failing the
  webhook here causes a retry that (because of the early return) will never
  re-attempt the audit row anyway. Wrap the `appendGiftAuditEvent` call:

```ts
try {
  await appendGiftAuditEvent({ ... });
} catch (error) {
  console.error("staged_gift_created audit event failed:", error);
}
```

Match the file's existing logging style if it has one (search the file
for `console.` first; if the module has a logger convention, use it).

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0 and
`bunx turbo run lint --filter=@asym/api` → exit 0.

### Step 4: Extend the unit tests

See Test plan.

**Verify**: `bunx vitest run tests/unit/packages/api/giving-staged-gifts.test.ts` → all pass.

## Test plan

Extend `tests/unit/packages/api/giving-staged-gifts.test.ts`. Build a mock
`supabaseAdmin` per `tests/unit/donation-saga.test.ts`'s pattern (chainable
mock that records calls per table). Cases:

1. **Retry repairs missing allocation**: first call to
   `stageGiftFromStripeDonation` where the `staged_gift_allocations` insert
   rejects → function throws; second call (existing gift found, zero
   allocation rows) → inserts the allocation and returns the gift.

- **Retry does not duplicate allocation**: existing gift found AND an
  allocation row exists → no `staged_gift_allocations` insert issued.
- **Zero-amount gift**: `donation.amount === 0` → no allocation read or
  insert on any path.

4. **Audit failure does not throw**: `staged_gift_audit_events` insert
   rejects → function still returns the staged gift.
5. **Insert returns no row** → function throws
   `"Staged gift insert returned no row."` instead of proceeding with an
   empty id.

Verification: `bunx vitest run tests/unit/packages/api/giving-staged-gifts.test.ts`
→ all pass, including the 5 new tests.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "ensureInitialAllocation" packages/api/src/giving/staged-gifts.ts`
      shows the helper plus calls on all three paths (early return, 23505
      branch, fresh insert)
- [ ] `grep -n "?? {}" packages/api/src/giving/staged-gifts.ts` returns no
      matches inside `stageGiftFromStripeDonation` (lines ~257–345)
- [ ] `bunx vitest run tests/unit/packages/api/giving-staged-gifts.test.ts`
      exits 0 with the new cases passing
- [ ] `bunx turbo run typecheck --filter=@asym/api` exits 0
- [ ] `bunx turbo run lint --filter=@asym/api` exits 0
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The excerpts above don't match the live code (drift).
- You find a consumer that legitimately creates staged gifts with
  `amount > 0` and intentionally zero allocations (search
  `staged_gift_allocations` usages across `packages/api` first) — the repair
  would then wrongly add rows.
- You find that allocations are mutated by admin review flows in a way where
  "zero rows" is a reachable _post-review_ state for an `amount > 0` gift
  (e.g. an admin can delete the last allocation) — the existence check would
  then re-add a deleted allocation on a late webhook retry. Check
  `packages/api/src/admin` for staged-gift-allocation mutations before
  Step 2; if deletion to zero is possible, restrict the repair to gifts whose
  `status` is still `received`/`needs_review` and report the nuance.
- The existing tests in `giving-staged-gifts.test.ts` assert behavior this
  plan changes (other than the `?? {}` masking).

## Maintenance notes

- The durable fix, if partial writes are ever observed in production despite
  this, is a transactional Postgres function (`stage_gift_from_stripe_donation`)
  mirroring the saga's `complete_donation_saga_event` RPC pattern — requires
  a migration; deliberately deferred.
- Reviewer should scrutinize: the repair runs on _every_ webhook retry path,
  so its read must stay cheap (single indexed `select id ... limit 1`), and
  the audit-event catch must not swallow non-audit errors.
- If multi-allocation splitting ever happens at staging time (not just
  review time), `ensureInitialAllocation`'s "any row exists" check remains
  correct, but revisit the memo text.
