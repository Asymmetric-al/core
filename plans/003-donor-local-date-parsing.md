# Plan 003: Fix UTC date-only parsing in donor money UI (off-by-one day west of UTC)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a661bfb9..HEAD -- "apps/donor/app/(public)/checkout/checkout-client.tsx" "apps/donor/app/(public)/page.tsx" "apps/donor/app/(dashboard)/donor-dashboard/history/columns.tsx" "apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client.tsx" apps/donor/lib`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `a661bfb9`, 2026-06-11

## Why this matters

JavaScript parses date-only strings (`"2026-06-11"`) as **UTC midnight**, but
`new Date()` and `setHours()` operate in the user's local timezone. The donor
app's date helper does exactly this, so for every user in a timezone west of
UTC (all of the Americas — the primary donor base), date-only values shift
back one calendar day:

- On the **checkout page**, choosing tomorrow as a recurring gift's start date
  makes `isFutureStart` false, so the summary card shows the full amount as
  **"Due today"** when nothing is due today — on the money confirmation UI of
  the donation flow.
- The date picker's `min` is computed with `toISOString()` (UTC), so during
  evening hours (US timezones) donors **cannot select today** as a start date.
- `formatDatePretty` labels tomorrow's date "Today" under the same conditions.

The same 4-line helper is copy-pasted 23 times across the repo (one copy has
already drifted in signature). This plan fixes the donor app's user-facing
money UI and creates the shared, date-only-safe helper; migrating the other
apps' copies is an explicitly deferred follow-up.

## Current state

- The buggy helper, defined identically in the four donor files in scope —
  e.g. `apps/donor/app/(public)/checkout/checkout-client.tsx:36-40`:

```ts
function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}
```

Other in-scope definitions: `apps/donor/app/(public)/page.tsx:15`,
`apps/donor/app/(dashboard)/donor-dashboard/history/columns.tsx:36`,
`apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client.tsx:66`.

- Bug site 1 — `checkout-client.tsx:154-157` (inside `SummaryCard`):

```ts
const isFutureStart =
  makeDisplayDate(startDate).setHours(0, 0, 0, 0) >
  makeDisplayDate().setHours(0, 0, 0, 0);
const dueToday = isFutureStart ? 0 : total;
```

`startDate` is a date-only string: it is initialized at line 1120 as
`makeDisplayDate().toISOString().split("T")[0] ?? ""` and edited via an
`<input type="date">`. Parsed as UTC midnight, then normalized with local
`setHours`, the comparison is off by one day for UTC-negative timezones.

- Bug site 2 — `checkout-client.tsx:481`: the date input's minimum:

```tsx
min={makeDisplayDate().toISOString().split("T")[0]}
```

`toISOString()` is UTC: at 20:00 New York time this yields tomorrow's date,
blocking "today".

- Bug site 3 — `checkout-client.tsx:116-131` (`formatDatePretty`): parses
  `dateStr` (date-only) with `makeDisplayDate`, then compares against today
  with local `setHours(0,0,0,0)` — same off-by-one, prints "Today" for the
  wrong day.

- Bug site 4 — `checkout-client.tsx:1120` (initial `startDate`): UTC
  `toISOString()` yields tomorrow's date during evening hours, so the form
  starts with the wrong default day.

- `history/columns.tsx:63` and `pledges/page-client.tsx:388,397,490` format
  values via `makeDisplayDate(...)` — whether each value is a date-only string
  or a full ISO timestamp must be checked per call site (Step 4).

- There is no shared date util in the donor app today: `apps/donor/lib/`
  contains hooks and helpers (e.g. `apps/donor/lib/hooks/use-locations.ts`),
  so a new `apps/donor/lib/dates.ts` follows the existing layout.

- Test exemplar for plain unit tests: `tests/unit/utils.test.ts` (vitest,
  plain `describe`/`it`/`expect` imports from `"vitest"`).

## Commands you will need

| Purpose   | Command                                         | Expected on success |
| --------- | ----------------------------------------------- | ------------------- |
| Install   | `bun install`                                   | exit 0              |
| Typecheck | `bunx turbo run typecheck --filter=@asym/donor` | exit 0              |
| Lint      | `bunx turbo run lint --filter=@asym/donor`      | exit 0              |
| Tests     | `bunx vitest run tests/unit/apps/donor`         | all pass            |
| Format    | `bun run format:check`                          | exit 0              |

## Scope

**In scope** (the only files you should modify/create):

- `apps/donor/lib/dates.ts` (create)
- `apps/donor/app/(public)/checkout/checkout-client.tsx`
- `apps/donor/app/(public)/page.tsx`
- `apps/donor/app/(dashboard)/donor-dashboard/history/columns.tsx`
- `apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client.tsx`
- `tests/unit/apps/donor/dates.test.ts` (create; create the directory if it
  does not exist — `tests/unit/apps/admin/...` shows the layout convention)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):

- The other 19 `makeDisplayDate` copies in `apps/admin/**`,
  `apps/missionary/**`, `packages/missionary/**`, and
  `packages/ui/components/shadcn/data-grid/data-grid-cell.tsx` — deferred
  follow-up; consolidating them needs per-site data-shape checks in apps this
  plan doesn't test.
- Server-side date handling in `packages/api` (recurring-charge scheduling is
  server-owned; this plan is display/UI only).
- Promoting the helper to `packages/lib` — do it in the follow-up that
  migrates the other apps.

## Git workflow

- Branch: `advisor/003-donor-local-dates`
- Commit style: conventional commits, e.g.
  `fix(donor): parse date-only strings in local time on checkout`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create the shared helper

Create `apps/donor/lib/dates.ts`:

```ts
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse a value for display in the user's local timezone.
 *
 * `new Date("2026-06-11")` is parsed as UTC midnight, which renders as the
 * previous day in timezones west of UTC. Date-only strings are therefore
 * parsed into local-time components; everything else defers to `new Date`.
 */
export function makeDisplayDate(value?: string | number | Date): Date {
  if (value === undefined) {
    return new globalThis.Date();
  }
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
}

/** Today's date as a YYYY-MM-DD string in the user's local timezone. */
export function todayDateInputValue(): string {
  const now = new globalThis.Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
```

Keep the exported name `makeDisplayDate` so call sites only swap a local
function for an import.

**Verify**: `bunx turbo run typecheck --filter=@asym/donor` → exit 0.

### Step 2: Write the unit tests (before changing call sites)

Create `tests/unit/apps/donor/dates.test.ts` (plain vitest, model after
`tests/unit/utils.test.ts`). Cases:

1. `makeDisplayDate("2026-06-11")` → `getFullYear() === 2026`,
   `getMonth() === 5`, `getDate() === 11`, and
   `getHours() === 0` — true in **every** timezone (this is the regression
   the old implementation fails west of UTC).
2. `makeDisplayDate("2026-06-11T14:30:00.000Z")` →
   `getTime() === Date.parse("2026-06-11T14:30:00.000Z")` (ISO timestamps
   unchanged).
3. `makeDisplayDate(undefined)` returns a Date within 5s of now.
4. `makeDisplayDate(1760000000000)` → `getTime() === 1760000000000`.
5. `todayDateInputValue()` matches `/^\d{4}-\d{2}-\d{2}$/` and equals the
   local components of `new Date()`.

**Verify**: `bunx vitest run tests/unit/apps/donor/dates.test.ts` → all pass.

### Step 3: Fix the checkout page

In `apps/donor/app/(public)/checkout/checkout-client.tsx`:

1. Delete the local `makeDisplayDate` (lines 36–40) and import instead:
   `import { makeDisplayDate, todayDateInputValue } from "@/lib/dates";`
   (Confirm the donor app's alias for `lib/` by looking at an existing import
   in the file or `apps/donor/tsconfig.json`; if the app uses relative
   imports for `lib`, match that convention.)
2. Line 481: replace `min={makeDisplayDate().toISOString().split("T")[0]}`
   with `min={todayDateInputValue()}`.
3. Line 1120: replace
   `startDate: makeDisplayDate().toISOString().split("T")[0] ?? ""` with
   `startDate: todayDateInputValue()`.
4. Leave `isFutureStart` (lines 154–157) and `formatDatePretty`
   (lines 116–131) textually as-is — they become correct once
   `makeDisplayDate` parses date-only strings locally.

**Verify**: `bunx turbo run typecheck --filter=@asym/donor` → exit 0, and
`grep -n "function makeDisplayDate" "apps/donor/app/(public)/checkout/checkout-client.tsx"` → no matches.

### Step 4: Fix the remaining donor copies

For each of `apps/donor/app/(public)/page.tsx`,
`apps/donor/app/(dashboard)/donor-dashboard/history/columns.tsx`,
`apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client.tsx`:

1. Delete the local `makeDisplayDate` definition and import from
   `@/lib/dates` (same alias decision as Step 3).
2. Read each call site and note in your report whether the value parsed is a
   date-only string or an ISO timestamp (e.g. `update.publishedAt` in
   `page.tsx:52`, `row.getValue("date")` in `columns.tsx:63`,
   `pledge.pausedUntil` / `pledge.nextChargeDate` in
   `page-client.tsx:388,397`). No behavior change for ISO timestamps; the
   date-only ones are the fixes.

**Verify**: `grep -rn "function makeDisplayDate" apps/donor` → no matches;
`bunx turbo run typecheck --filter=@asym/donor` → exit 0.

### Step 5: Full verification

**Verify**: `bunx turbo run lint --filter=@asym/donor` → exit 0;
`bunx vitest run tests/unit/apps/donor` → all pass;
`bun run format:check` → exit 0 (run `bun run format` first if it flags the
new files).

## Test plan

Covered in Step 2 (helper unit tests — happy path, the UTC regression case,
ISO-timestamp passthrough, numeric input, `todayDateInputValue` shape).
Component-level tests for `SummaryCard` are not required: its date logic
reduces entirely to the helper under test. Existing donor unit tests must
keep passing: `bunx vitest run tests/unit/apps/donor`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `apps/donor/lib/dates.ts` exists and exports `makeDisplayDate` and
      `todayDateInputValue`
- [ ] `grep -rn "function makeDisplayDate" apps/donor` returns no matches
- [ ] `grep -rn "toISOString().split" apps/donor` returns no matches in the
      four in-scope page files
- [ ] `bunx vitest run tests/unit/apps/donor` exits 0 with the 5 new tests
      passing
- [ ] `bunx turbo run typecheck --filter=@asym/donor` exits 0
- [ ] `bunx turbo run lint --filter=@asym/donor` exits 0
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The excerpts above don't match the live code (drift).
- You find evidence that the server interprets the submitted `startDate`
  as UTC (e.g. the checkout submit handler converts it with `toISOString`
  before sending) — then display and submission semantics must change
  together, which exceeds this plan; report what you found.
- The donor app has no `@/` import alias for `lib/` AND relative imports from
  the four files would be inconsistent with the codebase (report the
  convention you found instead of inventing one).
- Any pledge/history call site turns out to feed `Date` objects from a
  library (e.g. a date-picker) where the string-pattern branch can never hit
  AND removing the local helper changes behavior in a way you can't explain.

## Maintenance notes

- Follow-up (deferred): migrate the remaining 19 `makeDisplayDate` copies in
  `apps/admin`, `apps/missionary`, `packages/missionary`, and `packages/ui`
  to a shared package (e.g. `packages/lib`) — using this donor helper as the
  canonical implementation. One copy
  (`apps/missionary/app/donors/donors-list-model.ts:14`) has already drifted
  to a narrower signature.
- Reviewer should scrutinize: the regex branch only matching strict
  `YYYY-MM-DD` (datetime strings must fall through to `new Date`), and that
  checkout submission payloads are unchanged.
- If a future change introduces a date library (date-fns is already used in
  pledges via `format`/`addMonths`), prefer its date-only parsing over this
  helper and delete `dates.ts`.
