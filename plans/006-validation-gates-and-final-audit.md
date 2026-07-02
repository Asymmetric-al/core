# Plan 006: Run all validation gates, behavior QA, and the final zero-Radix audit

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: confirm plans 001–005 are marked DONE in
> `plans/README.md`. If any is not, stop — this plan is the final gate and
> assumes a fully migrated tree.

## Status

- **Priority**: P1 (the migration is not "done" until this passes)
- **Effort**: M (mostly machine time + focused QA)
- **Risk**: LOW for the gates themselves; they may _reveal_ MED-risk behavior
  regressions from the migration — that is their purpose
- **Depends on**: plans/001, 002, 003, 004, 005
- **Category**: tests / migration
- **Planned at**: commit `a661bfb9`, 2026-06-12

## Why this matters

The Radix→Base UI migration touched composition, data attributes, and value
models across every interactive component. Typecheck alone cannot catch
focus-trap, keyboard, styling-selector, or reduced-motion regressions. This
plan runs the repo's full gate set, performs targeted behavior QA, and writes
the final inventory into `docs/ai/audits/base-ui-only-migration.md` so the
branch can credibly claim "Base UI only, behavior unchanged".

## Current state

- `docs/ai/audits/base-ui-only-migration.md` exists with sections
  "Validation commands run" (empty: "(to be filled as gates run)") and
  "Exceptions" (candidates listed). It must be completed here.
- Gate scripts (root `package.json`, all run with Bun):
  `format:check`, `lint`, `typecheck`, `test:unit`, `build`,
  `verify:shadcn-diff`, `verify:shadcn-config`, `verify:shadcn-token-drift`,
  `check:motion`, `test:e2e:smoke`, `test:a11y`, `boneyard:admin|missionary|donor`.
- E2E/boneyard need env: smoke tests run through
  `scripts/run-with-ci-env.mjs`; boneyard needs dev servers on ports 3030
  (admin), 4000 (missionary), 3000 (donor).

## Commands you will need

| Purpose                    | Command                                             | Expected on success          |
| -------------------------- | --------------------------------------------------- | ---------------------------- |
| Format                     | `bun run format:check`                              | exit 0                       |
| Lint                       | `bun run lint`                                      | exit 0                       |
| Typecheck                  | `bun run typecheck`                                 | exit 0                       |
| Unit                       | `bun run test:unit`                                 | exit 0                       |
| Build                      | `bun run build`                                     | exit 0                       |
| shadcn drift               | `bun run verify:shadcn-diff`                        | exit 0                       |
| shadcn config              | `bun run verify:shadcn-config`                      | exit 0                       |
| Token drift                | `bun run verify:shadcn-token-drift`                 | exit 0                       |
| Motion rules               | `bun run check:motion`                              | exit 0                       |
| E2E smoke                  | `bun run test:e2e:smoke`                            | all pass                     |
| A11y                       | `bun run test:a11y`                                 | all pass                     |
| Visual (needs dev servers) | `bun run boneyard:admin` / `:missionary` / `:donor` | builds without diff failures |

## Scope

**In scope**:

- `docs/ai/audits/base-ui-only-migration.md` (complete it)
- `plans/README.md` (status)
- Small, surgical fixes for gate failures **only when** the failure is
  unambiguously caused by the migration (e.g. a missed `asChild`, a missed
  selector) — each fix must be listed in the completion report

**Out of scope**:

- Any refactor beyond fixing migration-caused failures
- Pre-existing failures unrelated to the migration: record them with evidence
  and move on; do not fix here

## Git workflow

- Branch `claude/naughty-knuth-09f32b`; no commits/pushes unless instructed.

## Steps

### Step 1: Static gates

Run, in order: `format:check` (run `bun run format` first if it fails on
files this branch touched), `lint`, `typecheck`, `test:unit`,
`verify:shadcn-config`, `verify:shadcn-token-drift`, `check:motion`.

**Verify**: each exits 0; record each command + result in the audit doc's
"Validation commands run" section.

### Step 2: Build + shadcn diff

`bun run build`, then `bun run verify:shadcn-diff`.

**Verify**: exit 0 each. If `verify:shadcn-diff` reports drift on canonical
components, the diff must consist only of the documented repo-specific
customizations (Maia variants, `showCloseButton`, motion tokens, data-slot) —
anything else is a STOP condition.

### Step 3: E2E smoke + a11y

`bun run test:e2e:smoke` then `bun run test:a11y`.

**Verify**: all pass. Record results.

### Step 4: Behavior QA checklist

With dev servers running (`bun run dev:admin`, `dev:donor`,
`dev:missionary`), verify by hand or Playwright UI on routes
`/admin`, `/admin/contributions`, `/admin/mobilize`, `/admin/care`,
`/donor-dashboard`, `/donor-dashboard/wallet`, `/missionary/feed`,
`/missionary/tasks`, `/missionary/donors`:

- Dialog/Sheet/Drawer: open/close, Esc, outside-click, focus trap, close
  button, visible or `sr-only` title.
- Menus (dropdown/context/menubar): submenus, checkbox/radio items, keyboard
  nav, Esc.
- Select: open, typeahead, keyboard nav, placeholder, disabled items, width.
- Tabs: **active-tab styling** (the migration's highest visual-regression
  risk — `data-active` selectors), keyboard arrows.
- Checkbox/Switch/RadioGroup: checked styling (`data-checked`), forms.
- Data tables: header tri-state select-all checkbox, row-action menus,
  filters, bulk bar.
- ToggleGroup single-select pages: `apps/admin/app/email/page-client.tsx`,
  `apps/admin/app/pdf/page-client.tsx` — selection works, deselect doesn't
  crash, pressed styling (`data-pressed`).
- Command palette opens **without** animation (command.tsx fix).
- Dark mode, one mobile breakpoint, reduced-motion (OS setting) spot-check.

**Verify**: write a pass/fail line per item in the audit doc.

### Step 5: Boneyard visual review (environment permitting)

Start the three dev servers, run `bun run boneyard:admin`,
`bun run boneyard:missionary`, `bun run boneyard:donor`. If the environment
cannot run them, record the reason and rely on Step 4.

### Step 6: Final zero-Radix audit

```bash
rg -n --hidden --glob '!node_modules/**' --glob '!vendor/**' --glob '!.next/**' \
  --glob '!coverage/**' --glob '!.next-docs/**' --glob '!plans/**' \
  --glob '!docs/ai/audits/**' --glob '!.claude-scratch/**' \
  -i 'radix' .
bun pm ls | rg -i 'radix' || echo CLEAN
```

Expected: the `rg` returns only the allowed exceptions recorded in the audit
doc (kept `base-vs-radix.md` mapping skill + mirror copies, generated
`.eslint-*.json` snapshots if not regenerated) — ideally nothing; `bun pm ls`
returns CLEAN. Copy the exact output into the audit doc's final section and
flip the doc's status line to **complete**.

**Verify**: audit doc contains the final inventory, every remaining match has
a justification, and the Exceptions section matches reality.

## Test plan

This plan IS the test plan. No new test files unless a gate reveals a
migration bug, in which case add a regression test next to the existing suite
for that area (`tests/unit/**` patterns).

## Done criteria

- [ ] All Step 1–3 commands exit 0 (or each failure is recorded as
      pre-existing with evidence)
- [ ] Step 4 checklist fully recorded in the audit doc, no unexplained FAILs
- [ ] Final greps return only documented exceptions; `bun pm ls` clean
- [ ] `docs/ai/audits/base-ui-only-migration.md` status flipped to complete,
      with validation results and exceptions filled in
- [ ] `plans/README.md` updated (this plan DONE)

## STOP conditions

- `verify:shadcn-diff` shows non-customization drift on a canonical component
  (possible porting error) — report the component and diff.
- Any focus-trap/Esc/outside-click behavior fails in Step 4 — that's a
  porting bug in a shared component; report it (fix belongs with the
  component owner, possibly a new plan).
- E2E smoke fails on donate/checkout flows — revenue path; report immediately.
- A gate failure cannot be attributed to either the migration or a documented
  pre-existing issue.

## Maintenance notes

- Add the Step 6 grep to PR review habits for skill-refresh and registry-sync
  PRs; vendored upstream refreshes are the most likely Radix re-entry vector.
- The behavior QA list doubles as the regression checklist for future Base UI
  version bumps (`@base-ui/react` is pinned at 1.5.0 in three apps + ui).
