# Plan 001: Cache the member-care dashboard snapshot and bound its unbounded queries

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a661bfb9..HEAD -- packages/api/src/reads/member-care.ts packages/api/src/admin/member-care/mutations.ts apps/admin/app/api/admin/member-care`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `a661bfb9`, 2026-06-11

## Why this matters

The admin app's member-care dashboard endpoint re-runs four tenant-wide
Supabase queries on every page load, while its sibling function in the same
file (`readMemberCareDirectory`) is cached with Next.js `"use cache"` and
invalidated correctly by existing mutations. The uncached function is the
_heavier_ of the two. Additionally, the goals, requirements, and private-notes
queries in this file have no `.limit()`, so cost grows with all-time tenant
data even though the directory itself is capped at 250 rows. Fixing both makes
the member-care dashboard load from cache between writes and puts a ceiling on
query cost.

## Current state

All code is in `packages/api/src/reads/member-care.ts` unless noted.

- `applyCache` helper (lines 170–179) — the file's existing caching pattern:

```ts
function applyCache(tags: string[]): void {
  try {
    cacheLife("minutes");
    for (const tag of tags) {
      cacheTag(tag);
    }
  } catch {
    // noop outside Next cache runtime
  }
}
```

`cacheLife` and `cacheTag` are imported at the top of the file from
`"next/cache"`. `cacheLife("minutes")` is a built-in Next.js named profile —
do not change it.

- `readMemberCareDirectory` (lines 535–557) — the **exemplar to copy**. It is
  cached and tagged:

```ts
export async function readMemberCareDirectory(
  tenantId: string,
): Promise<MemberCarePersonnel[]> {
  "use cache";

  applyCache([
    "member-care",
    `member-care:${tenantId}`,
    "member-care:directory",
  ]);

  const [directoryRows, goalRows, requirementRows] = await Promise.all([
    readDirectoryRows(tenantId),
    readGoalRows(tenantId),
    readRequirementRows(tenantId),
  ]);
  ...
```

- `readMemberCareDashboardSnapshot` (lines 576–600) — same signature shape
  (only `tenantId: string`), **not cached**:

```ts
export async function readMemberCareDashboardSnapshot(
  tenantId: string,
): Promise<MemberCareDashboardSnapshot> {
  const [directoryRows, activityRows, goalRows, requirementRows] =
    await Promise.all([
      readDirectoryRows(tenantId),
      readActivityRows(tenantId),
      readGoalRows(tenantId),
      readRequirementRows(tenantId),
    ]);
  ...
```

- Query helpers and their bounds:
  - `readDirectoryRows` (lines 347–365): has `.limit(250)`.
  - `readActivityRows` (lines 390–414): has `.limit(500)`.
  - `readGoalRows` (lines 416–435): **no limit** — ordered by `updated_at`
    descending.
  - `readRequirementRows` (lines 437–458): **no limit** — ordered by
    `updated_at` descending.
  - `readPrivateNoteRows` (lines 460–489): **no limit** — ordered by
    `created_at` descending. Only used by `readMemberCarePersonDetail`.
  - All use `getMemberCareClient()` (lines 339–345) which wraps
    `getAdminClient()` from `@asym/database/supabase/admin` — a service-role
    client with no request-bound state (no `cookies()`/`headers()` anywhere in
    this file), so adding `"use cache"` is safe.

- Invalidation already exists: `packages/api/src/admin/member-care/mutations.ts`
  lines 183–187 call:

```ts
revalidateTag("member-care", "max");
...
revalidateTag("member-care:directory", "max");
revalidateTag("member-care:activity", "max");
revalidateTag("member-care:private-notes", "max");
```

Every cached entry tagged `"member-care"` is therefore already invalidated on
every member-care mutation. No mutation changes are needed.

- Callers (route handlers in the admin app — do not modify):
  - `apps/admin/app/api/admin/member-care/dashboard/route.ts` (line 14) calls
    `readMemberCareDashboardSnapshot`.
  - `apps/admin/app/api/admin/member-care/directory/route.ts` (line 14) calls
    the already-cached `readMemberCareDirectory` — proof that `"use cache"`
    functions are already used from route handlers in this repo.
  - `apps/admin/app/api/admin/member-care/directory/[id]/route.ts` calls
    `readMemberCarePersonDetail`.

## Commands you will need

| Purpose   | Command                                       | Expected on success |
| --------- | --------------------------------------------- | ------------------- |
| Install   | `bun install`                                 | exit 0              |
| Typecheck | `bunx turbo run typecheck --filter=@asym/api` | exit 0              |
| Lint      | `bunx turbo run lint --filter=@asym/api`      | exit 0              |
| Format    | `bun run format:check`                        | exit 0              |
| Tests     | `bunx vitest run tests/unit/packages/api`     | all pass            |

Note: the repo-wide unit suite has a historically flaky area in
`tests/unit/cms/` (documented in `CODE_QUALITY_AUDIT.md`). Scope your test runs
as above; if an unrelated CMS test fails, report it as pre-existing — do not
try to fix it.

## Scope

**In scope** (the only files you should modify):

- `packages/api/src/reads/member-care.ts`
- `tests/unit/packages/api/member-care-reads.test.ts` (create if a suitable
  test can be written; see Test plan)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):

- `readMemberCarePersonDetail` (lines 602–639) — it takes `actorUserId` and
  reads actor-scoped private notes; caching it changes privacy/freshness
  semantics and is deliberately deferred.
- `packages/api/src/admin/member-care/mutations.ts` — invalidation already
  covers the new tags via `"member-care"`; do not add tags there.
- The admin route handlers listed above — no changes needed.
- `cacheLife("minutes")` — do not replace the named profile with a custom
  object.

## Git workflow

- Branch: `advisor/001-member-care-cache` (branched from the repo's default
  branch unless the operator says otherwise).
- Commit style: conventional commits, e.g.
  `perf(api): cache member-care dashboard snapshot and bound queries`
  (matches repo history such as `fix(api): type admin PostgREST query builders`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Cache the dashboard snapshot

In `packages/api/src/reads/member-care.ts`, add the directive and tags to
`readMemberCareDashboardSnapshot`, mirroring `readMemberCareDirectory`
exactly:

```ts
export async function readMemberCareDashboardSnapshot(
  tenantId: string,
): Promise<MemberCareDashboardSnapshot> {
  "use cache";

  applyCache([
    "member-care",
    `member-care:${tenantId}`,
    "member-care:dashboard",
  ]);

  const [directoryRows, activityRows, goalRows, requirementRows] = ...
```

The new `"member-care:dashboard"` tag is optional granularity; the
load-bearing tag is `"member-care"`, which mutations already revalidate.

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0.

### Step 2: Bound the goal and requirement queries

In `readGoalRows` (lines 416–435) and `readRequirementRows` (lines 437–458),
append `.limit(1000)` to the query chain, in the same position as the
`.limit(500)` in `readActivityRows` (i.e. after `.order(...)`, before the
optional `missionaryId` filter is applied — match `readActivityRows`'s
structure, where `.limit` is part of the initial chain). 1000 comfortably
exceeds the 250-personnel directory cap times typical goals/requirements per
person, while capping pathological growth.

In `readPrivateNoteRows` (lines 460–489), append `.limit(500)` the same way.

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0, and
`bunx turbo run lint --filter=@asym/api` → exit 0.

### Step 3: Run the package test suite

**Verify**: `bunx vitest run tests/unit/packages/api` → all pass.

## Test plan

- Look for existing member-care read tests first:
  `rg -l "member-care" tests/unit` — if a test file covers these reads, extend
  it; otherwise create `tests/unit/packages/api/member-care-reads.test.ts`.
- The reads require a Supabase client, so test the pure parts: this file's
  exported pure helpers are minimal, and the caching directive cannot be unit
  tested meaningfully. An acceptable minimal test asserts that the module
  imports cleanly and that mock-driven calls to `readGoalRows`-backed exports
  apply a limit — model client mocking after
  `tests/unit/donation-saga.test.ts` (it mocks a Supabase admin client). If
  mocking the PostgREST chain (`from().select().eq().order().limit()`) turns
  into more than ~80 lines of scaffolding, skip the new test file and note
  that in your report; the limit change is low-risk and covered by typecheck.
- Verification: `bunx vitest run tests/unit/packages/api` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n '"use cache"' packages/api/src/reads/member-care.ts` shows it
      inside `readMemberCareDashboardSnapshot` (3 total occurrences in the
      file: directory, activities, dashboard snapshot)
- [ ] `grep -c "limit(" packages/api/src/reads/member-care.ts` returns at
      least 5 (directory 250, activities 500, goals, requirements, private
      notes)
- [ ] `bunx turbo run typecheck --filter=@asym/api` exits 0
- [ ] `bunx turbo run lint --filter=@asym/api` exits 0
- [ ] `bunx vitest run tests/unit/packages/api` exits 0
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `readMemberCareDashboardSnapshot` no longer matches the excerpt above (the
  file drifted).
- Adding `"use cache"` produces a build/typecheck error mentioning dynamic
  APIs (`cookies`, `headers`, `searchParams`) — that means someone added
  request-bound code to this path since planning; caching it would be wrong.
- You find an existing test asserting that goals/requirements return the full
  unbounded set (a contract this plan would break).

## Maintenance notes

- If a "show all goals" admin view is ever added, the new `.limit(1000)` must
  be revisited or replaced with pagination.
- Reviewer should scrutinize: that no `cookies()`/`headers()` call is
  reachable from `readMemberCareDashboardSnapshot`, and that staleness up to
  the `"minutes"` cacheLife profile is acceptable for the dashboard (it
  already is for the directory, which shares the data).
- Deferred follow-up: caching `readMemberCarePersonDetail` (needs a decision
  about actor-scoped private-note freshness).
