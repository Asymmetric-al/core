# Plan 002: Neutralize CSV formula injection in table export

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat a68fe060..HEAD -- packages/ui/components/shadcn/data-table/utils/export.ts`
> If the file changed since this plan was written, compare the "Current state"
> excerpt against the live code before proceeding; on a mismatch, treat it as a
> STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `a68fe060`, 2026-06-13

## Why this matters

`exportToCSV` builds CSV from arbitrary table data — in this app that includes
user-supplied CRM fields (names, notes, org fields). `escapeCSVValue` correctly
quotes values containing the delimiter, quotes, or newlines, but it does
**not** neutralize CSV/spreadsheet **formula injection**: a cell whose value
starts with `=`, `+`, `-`, `@`, or a leading tab/carriage-return is interpreted
as a formula when the exported file is opened in Excel / Google Sheets / LibreOffice.
An attacker who can write a CRM field (e.g. a contact name of
`=HYPERLINK("http://evil","click")` or `=cmd|'/c calc'!A1`) gets that formula
executed in the spreadsheet of whatever admin exports and opens the CSV. This
is OWASP "CSV Injection" / "Formula Injection." The fix is a well-known one-line
mitigation: prefix at-risk cells with a single quote (`'`) so the spreadsheet
treats them as text.

## Current state

File: `packages/ui/components/shadcn/data-table/utils/export.ts` — the only CSV
export implementation; exported from `utils/index.ts` and the data-table
`index.ts` as `exportToCSV`, `exportTableToCSV`, `downloadCSV`. **No test file
exists for it today.**

Current `escapeCSVValue`, `export.ts:21-33`:

```ts
function escapeCSVValue(value: string, delimiter: string): string {
  const stringValue = String(value ?? "");
  const needsQuotes =
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r");

  if (needsQuotes) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}
```

Every header and cell flows through this function (`export.ts:106`, `117`, `120`).

Repo conventions: pure utility module, no React. Plain functions with clear
names (see the rest of `export.ts`). Comments explain non-obvious intent.

## Commands you will need

| Purpose                 | Command                                      | Expected on success          |
| ----------------------- | -------------------------------------------- | ---------------------------- |
| Install (worktree only) | `bun install --force`                        | exit 0                       |
| Typecheck               | `bunx turbo run typecheck --filter=@asym/ui` | exit 0                       |
| Lint                    | `bunx turbo run lint --filter=@asym/ui`      | exit 0                       |
| Unit tests (scoped)     | `bunx vitest run tests/unit/packages/ui`     | all pass, including new test |

## Scope

**In scope**:

- `packages/ui/components/shadcn/data-table/utils/export.ts`
- `tests/unit/packages/ui/data-table-csv-export.test.ts` (create)

**Out of scope**:

- The `downloadCSV` browser-blob logic and `exportTableToCSV` filename handling
  — unchanged.
- The set of columns/rows selected for export — unchanged.

## Git workflow

- Shared worktree, branch `advisor/v9-followups`. One commit.
- Suggested message: `fix(data-table): neutralize CSV formula injection on export`
- Do NOT push or open a PR.

## Steps

### Step 1: Add a formula-injection guard

Introduce a helper that prefixes a leading dangerous character with a single
quote, and call it from `escapeCSVValue` **before** the existing quoting logic
so the result is still correctly quoted afterward. The dangerous leading
characters are `=`, `+`, `-`, `@`, tab (`\t`), and carriage return (`\r`).

Target shape (place the helper above `escapeCSVValue`):

```ts
// CSV formula injection (OWASP): a cell starting with one of these is run as a
// formula by Excel/Sheets/LibreOffice. Prefix with a single quote so the value
// is treated as text. Applied to every header and cell before delimiter/quote
// escaping.
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

function neutralizeFormula(value: string): string {
  return FORMULA_TRIGGER.test(value) ? `'${value}` : value;
}
```

Then in `escapeCSVValue`, apply it right after coercion:

```ts
function escapeCSVValue(value: string, delimiter: string): string {
  const stringValue = neutralizeFormula(String(value ?? ""));
  const needsQuotes =
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r");

  if (needsQuotes) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}
```

(Applying neutralization first means a value like `=1+1` becomes `'=1+1`, which
has no delimiter/quote/newline and is emitted as-is — correct. A value like
`=a,b` becomes `'=a,b`, which contains the delimiter and gets quoted to
`"'=a,b"` — also correct.)

**Verify**: `bunx turbo run typecheck --filter=@asym/ui` → exit 0.

### Step 2: Create the test

Create `tests/unit/packages/ui/data-table-csv-export.test.ts`. Model it
structurally on an existing pure-function unit test in that directory, e.g.
`tests/unit/packages/ui/components/shadcn/data-table-url-filter-parse.test.ts`
(plain `describe`/`it`/`expect`, no jsdom needed). Import `exportToCSV` from
`../../../packages/ui/components/shadcn/data-table/utils/export` (adjust the
relative depth to match the file's location under `tests/unit/packages/ui/`).

Build a minimal `Table`-shaped double sufficient for `exportToCSV` — it calls
`table.getAllLeafColumns()`, and `table.getFilteredRowModel().rows` /
`getSelectedRowModel` / `getCoreRowModel`. Keep the double tiny; the existing
`data-table-action-bars.test.tsx` shows the "cast a partial object as the table
type" approach. Cover these cases:

- A cell value `=1+1` exports as `'=1+1` (formula neutralized).
- A cell value `+1`, `-1`, `@x`, and one starting with a tab each get the `'`
  prefix.
- A cell value `=a,b` (formula + delimiter) exports quoted as `"'=a,b"`.
- A benign value `Acme Inc` is unchanged (no `'` prefix, no quotes).
- A header that starts with `=` is also neutralized.

**Verify**: `bunx vitest run tests/unit/packages/ui` → all pass; the new file's
cases appear. Confirm the test FAILS if you temporarily revert Step 1, then
restore it.

### Step 3: Lint and commit

**Verify**: `bunx turbo run lint --filter=@asym/ui` → exit 0. Commit.

## Test plan

- New file `data-table-csv-export.test.ts` covering: each dangerous leading
  char neutralized; formula+delimiter quoted correctly; benign values untouched;
  header neutralization.
- Structural pattern: `data-table-url-filter-parse.test.ts` (pure-function test).
- Verification: `bunx vitest run tests/unit/packages/ui` → all pass.

## Done criteria

ALL must hold:

- [ ] `bunx turbo run typecheck --filter=@asym/ui` exits 0
- [ ] `bunx turbo run lint --filter=@asym/ui` exits 0
- [ ] `bunx vitest run tests/unit/packages/ui` exits 0; new CSV-export test
      exists and passes
- [ ] `export.ts` contains a formula-neutralization step applied to every cell
      and header (grep for the `'` prefix logic / `neutralizeFormula`)
- [ ] No files outside the in-scope list are modified (`git status`)

## STOP conditions

Stop and report if:

- `escapeCSVValue` no longer exists or has a different shape than the excerpt
  (drift).
- A `Table` double minimal enough to call `exportToCSV` cannot be constructed
  without pulling in heavy fixtures — report and ask, rather than building a
  full real table.
- A verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If a non-CSV export format is added (XLSX, TSV), it needs its own
  neutralization — the guard here only covers the CSV path.
- The single-quote prefix is the standard mitigation but is mildly lossy
  (consumers parsing the CSV programmatically see a leading `'` on those cells).
  That is the accepted trade-off for spreadsheet safety; note it if a
  machine-to-machine export consumer is ever added.
- Reviewer should confirm neutralization happens **before** quote-escaping, and
  that benign values are not altered.
