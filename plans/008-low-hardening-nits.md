# Plan 008: Three low-risk hardening nits (date range guard, message cap, truncation log)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report. Reviewer maintains `plans/README.md`.
>
> **Drift check (run after setup)**: `git diff --stat a661bfb9..HEAD -- apps/donor/lib/dates.ts packages/api/src/admin/support-hub/adapter/supabase.ts packages/api/src/reads/member-care.ts`
> These files were all changed on this branch already; your base includes
> those changes. Compare the excerpts below against the live files; on a
> mismatch, STOP.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (disjoint files from plan 007)
- **Category**: bug / tech-debt
- **Planned at**: commit `4126f0a4`, 2026-06-11

## Why this matters

Three low-impact residuals surfaced by the branch self-audit. None is urgent;
bundled because each is a few lines in a file the branch already touched.

1. **BR-05** — `makeDisplayDate`'s date-only regex matches out-of-range values
   like `"2026-13-01"`, and `new Date(2026, 12, 1)` silently rolls over to
   2027-01-01 (a wrong date shown with no error).
2. **BR-06** — `listMessages` fetches a conversation's messages with no
   `.limit()`; a pathologically large conversation is unbounded.
3. **BR-07** — the member-care `.limit()` reads truncate silently with no
   operator-visible signal.

## Current state

### BR-05 — `apps/donor/lib/dates.ts:1,14-23`

```ts
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
...
  if (typeof value === "string") {
    const match = DATE_ONLY_PATTERN.exec(value);
    if (match) {
      return new globalThis.Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
      );
    }
  }
  return new globalThis.Date(value);
```

`"2026-13-01"` matches the regex (`\d{2}` matches `13`), then
`new Date(2026, 12, 1)` rolls the month over to January 2027 — silently wrong.

### BR-06 — `packages/api/src/admin/support-hub/adapter/supabase.ts:721-728`

```ts
async listMessages(conversationId) {
  const { data, error } = await client()
    .from("support_messages")
    .select("*")
    .eq("tenant_id", tenantId())
    .eq("conversation_id", conversationId)
    .order("posted_at", { ascending: true });
  assertDb(error, "support_messages.select");
  const messages = (data ?? []) as unknown as SupabaseRow[];
```

No `.limit()` — bounded only by how many messages a conversation has.

### BR-07 — `packages/api/src/reads/member-care.ts`

`readGoalRows` (`.limit(1000)`, ~line 423), `readRequirementRows`
(`.limit(1000)`, ~line 445), `readPrivateNoteRows` (`.limit(500)`, ~line 476).
Each returns up to its limit with no indication the cap was hit. Find the
exact lines with `grep -n "limit(" packages/api/src/reads/member-care.ts`.

There is no logger abstraction in this file; `console.warn` is acceptable
server-side observability (the file already has no logging, and `console` is
used elsewhere in `packages/api`).

## Commands you will need

| Purpose   | Command                                                            | Expected on success |
| --------- | ------------------------------------------------------------------ | ------------------- |
| Install   | `bun install`                                                      | exit 0              |
| Typecheck | `bunx turbo run typecheck --filter=@asym/api --filter=@asym/donor` | exit 0              |
| Lint      | `bunx turbo run lint --filter=@asym/api --filter=@asym/donor`      | exit 0              |
| Tests     | `bunx vitest run tests/unit/apps/donor tests/unit/packages/api`    | all pass            |
| Format    | `bunx prettier --check <changed files>`                            | exit 0              |

Known repo conditions (pre-existing): `.husky/pre-commit` may fail with "exec
format error" on Windows — run `bunx lint-staged --concurrent false
--no-stash`, then commit with `HUSKY=0`, and note it. `bun run format:check`
fails on the base commit (`idempotency-handling/SKILL.md`) — use
`bunx prettier --check` on your changed files.

## Scope

**In scope**:

- `apps/donor/lib/dates.ts`
- `tests/unit/apps/donor/dates.test.ts`
- `packages/api/src/admin/support-hub/adapter/supabase.ts` (only `listMessages`)
- `packages/api/src/reads/member-care.ts` (only the three read helpers' limit handling)

**Out of scope**:

- Anything in `staged-gifts.ts` or migrations (that is plan 007).
- The `support-hub` conversations.list / threading queries — only
  `listMessages` here.
- Changing any return _type_ (no UI-facing truncation flags — the BR-07 signal
  is server-log only; widening the API surface is a separate, larger change).
- The admin `makeDisplayDate` copies in other apps (deferred follow-up).

## Git workflow

- Branch: `advisor/008-low-hardening-nits` from `4126f0a4`
  (`git checkout -b advisor/008-low-hardening-nits 4126f0a4`).
- Commit style: conventional commits, e.g.
  `fix(api,donor): guard out-of-range dates, cap message reads, log truncation`
- Do NOT push or open a PR.

## Steps

### Step 1: BR-05 — range-guard the date parse

In `apps/donor/lib/dates.ts`, after the regex match, validate month (1-12)
and day (1-31) before constructing the local date; if out of range, fall
through to `new globalThis.Date(value)` (native parsing, same as a non-match).
Keep the existing structure; the change is a guard inside the `if (match)`
block:

```ts
if (match) {
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
    return new globalThis.Date(year, month - 1, day);
  }
}
```

**Verify**: `bunx turbo run typecheck --filter=@asym/donor` → exit 0.

### Step 2: BR-05 tests

In `tests/unit/apps/donor/dates.test.ts`, add cases:

- `makeDisplayDate("2026-13-01")` does NOT silently become 2027 — assert it
  does not equal a local `new Date(2027, 0, 1)` (it falls through to native
  `new Date("2026-13-01")`, which is `Invalid Date`; assert
  `Number.isNaN(result.getTime())`).
- `makeDisplayDate("2026-06-31")` (day 31 in a 30-day month) — document the
  chosen behavior with an assertion (day 31 passes the guard and JS rolls it;
  that is acceptable — the guard's job is to reject clearly-out-of-range month
  values, not to do full calendar validation). Keep this test aligned with
  what the code actually does.

**Verify**: `bunx vitest run tests/unit/apps/donor/dates.test.ts` → all pass.

### Step 3: BR-06 — cap the message read

In `listMessages` (supabase.ts), add `.limit(2000)` to the messages query
(after `.order(...)`). 2000 is a generous ceiling for a single support
conversation; this is a safety cap, not pagination.

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0;
`grep -n "limit(2000)" packages/api/src/admin/support-hub/adapter/supabase.ts` → one match.

### Step 4: BR-07 — log truncation in member-care reads

In each of `readGoalRows`, `readRequirementRows`, `readPrivateNoteRows`
(`packages/api/src/reads/member-care.ts`), after the rows are fetched, emit a
`console.warn` when the returned count equals the limit (probable truncation),
including the table/limit for operator triage. Keep it minimal, e.g.:

```ts
  if (rows.length === <LIMIT>) {
    console.warn(
      "member-care: <table> query hit its row limit; results may be truncated.",
    );
  }
```

Use each helper's actual limit value and table name. Do not change the return
value or shape.

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0;
`bunx turbo run lint --filter=@asym/api` → exit 0.

### Step 5: Full verification

**Verify**: typecheck + lint (api, donor), `bunx vitest run
tests/unit/apps/donor tests/unit/packages/api` all pass, `bunx prettier
--check` on changed files passes.

## Test plan

- BR-05: the two cases in Step 2 (out-of-range month falls through; document
  day behavior). The existing 5 date tests must still pass.
- BR-06 / BR-07: covered by typecheck + lint; the `listMessages` cap and the
  member-care warnings are behaviorally trivial and exercised by the existing
  support-hub adapter and member-care suites staying green. Do not add brittle
  console-spy tests for the warnings unless trivial.

## Done criteria

- [ ] `grep -n "month >= 1 && month <= 12" apps/donor/lib/dates.ts` → one match
- [ ] `grep -n "limit(2000)" packages/api/src/admin/support-hub/adapter/supabase.ts` → one match
- [ ] `grep -c "results may be truncated" packages/api/src/reads/member-care.ts` → 3
- [ ] `bunx turbo run typecheck --filter=@asym/api --filter=@asym/donor` exits 0
- [ ] `bunx turbo run lint --filter=@asym/api --filter=@asym/donor` exits 0
- [ ] `bunx vitest run tests/unit/apps/donor tests/unit/packages/api` exits 0
- [ ] `git status` shows no changes outside the in-scope list

## STOP conditions

- Any excerpt above doesn't match live code (drift).
- Adding `console.warn` trips a lint rule (`no-console`) in `packages/api` —
  if so, STOP and report (the repo may require a logger; do not disable the
  rule inline).
- The member-care helpers already log or signal truncation.

## Maintenance notes

- BR-07's `console.warn` is a stopgap signal; the real fix (return a
  `truncated`/`totalCount` and surface it in the dashboard UI) is a larger,
  return-shape change deliberately deferred.
- If pagination is added to `listMessages` later, the `.limit(2000)` cap
  becomes the page size or is removed.
- Reviewer should confirm `no-console` is not enforced in `packages/api`
  before approving Step 4 (if it is, the executor should have STOPPED).
