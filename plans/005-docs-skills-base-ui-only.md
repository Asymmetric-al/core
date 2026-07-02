# Plan 005: Make all active docs and skills Base-UI-only

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `rg -ci "radix" packages/ui/README.md docs/ai/rules/frontend.md docs/ai/stack-registry.md`
> Expected: 3 / 5 / 2 matches respectively. If all are 0, verify Done
> criteria and update the index.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW — documentation only; the main hazard is breaking the skills
  sync/verify pipeline or rewriting vendored upstream content that a lockfile pins
- **Depends on**: plans/001–004 (docs must describe the final state, not aspiration)
- **Category**: docs
- **Planned at**: commit `a661bfb9`, 2026-06-12

## Why this matters

This repo is agent-operated: rulebooks under `docs/ai/` and skills under
`docs/ai/skills/` (mirrored to `.agents/skills/` and `.cursor/skills/` by
`bun run skills:sync`) are loaded by future agents as instructions. Any doc
that still says "Radix" as active guidance will cause future agents to
reintroduce Radix imports or `--radix-*` CSS variables. After plans 001–004
the code is Base UI only; this plan makes the instruction layer agree.

## Current state

Radix-mentioning files (verified by `rg -ci "radix"`):

**Repo-authored, active guidance (rewrite):**

- `packages/ui/README.md` (3) — describes the primitive stack
- `docs/ai/rules/frontend.md` (5) — includes `--radix-*` transform-origin guidance
- `docs/ai/stack-registry.md` (2) — stack tag list used for Nia queries
- `docs/guides/development/site-studio-payload.md` (1),
  `docs/guides/development/tanstack-virtual-foundation.md` (1),
  `docs/features/support-hub/phase-04-detail-and-composer.md` (1)
- Canonical skills with Radix-era examples: `docs/ai/skills/anim/SKILL.md` (3),
  `docs/ai/skills/emil-design-eng/SKILL.md` (4),
  `docs/ai/skills/emil-design-engineering/component-design.md` (3),
  `docs/ai/skills/moai-library-shadcn/SKILL.md` (1),
  `docs/ai/skills/components-build/SKILL.md` (2),
  `docs/ai/skills/vercel-react-best-practices/{AGENTS.md,rules/bundle-barrel-imports.md}` (1+1)
- `tests/unit/scripts/shadcn-config-guardrails.test.ts` (1 mention — read it;
  if it asserts Radix-related config, update the assertion to the Base-only
  expectation, otherwise leave)

**Repo-authored, historical audits (archive, don't silently rewrite):**

- `docs/ai/audits/shadcn-ui-audit-2026-04-16.md` (27),
  `shadcn-ui-audit-2026-04-21.md` (5), `shadcn-ui-quick-fix-checklist.md` (3)

**Vendored / mirror-managed (do NOT hand-rewrite wholesale):**

- `.agents/skills/**` and `.cursor/skills/**` copies — regenerated from
  `docs/ai/skills/` by `bun run skills:sync` for canonical skills; other
  entries are Skills-CLI installs pinned in `skills-lock.json` (check before
  editing)
- `.agents/skills/shadcn/rules/base-vs-radix.md` (+ `.cursor` copy) — the
  Radix→Base API mapping reference. **Keep** (documented exception): it is
  what tells agents how to use the Base APIs and how upstream shadcn's two
  bases differ; it is not pro-Radix guidance.
- `vendor/payload-upstream/**`, `.next-docs/**` — vendored/generated
  third-party content. Out of scope (documented exception).

## Commands you will need

| Purpose            | Command                                             | Expected on success  |
| ------------------ | --------------------------------------------------- | -------------------- |
| Sync skill mirrors | `bun run skills:sync`                               | exit 0               |
| Verify mirrors     | `bun run skills:verify`                             | exit 0               |
| Format             | `bun run format:check` (or `bun run format` to fix) | exit 0               |
| Mention scan       | see Done criteria grep                              | only allowed matches |

**Windows caveat** (this repo is developed on Windows): the skills sync can
drop executable bits and the Skills CLI writes CRLF — if `skills:verify`
fails only in CI on mode bits, note it in the PR rather than chasing it
locally.

## Scope

**In scope**:

- The repo-authored files listed above
- `docs/ai/audits/` reorganization (archive subfolder or banner notices)
- `docs/ai/audits/base-ui-only-migration.md` (append doc-layer results)
- Mirror updates ONLY via `bun run skills:sync`

**Out of scope** (do NOT touch):

- `vendor/**`, `.next-docs/**`, `node_modules/**`
- `.agents/skills/**` / `.cursor/skills/**` direct edits (sync-managed or
  lockfile-pinned), except where `skills-lock.json` proves a file is NOT
  pinned and no canonical copy exists — in that case report it instead
- Source code (`packages/**`, `apps/**`)

## Git workflow

- Branch `claude/naughty-knuth-09f32b`; no commits/pushes unless instructed.

## Steps

### Step 1: Rewrite active rulebooks and README

For each file in the first list: replace Radix references with the Base UI
equivalent statement. Specifically:

- `docs/ai/rules/frontend.md`: state that the primitive system is Base UI
  (`@base-ui/react`) via shadcn `base-maia`; replace `--radix-*`
  transform-origin guidance with Base UI popup variables
  (`--transform-origin`, `--anchor-width`, `--available-height`); state that
  composition uses `render`, never `asChild`.
- `docs/ai/stack-registry.md`: swap Radix entries for `@base-ui/react` /
  "Base UI" tags.
- `packages/ui/README.md`: describe components as Base UI primitives wrapped
  in shadcn Maia styling; remove Radix install/usage notes.
- Guides/feature docs: update the single mentions in place (they reference
  Radix components or packages — point them at the Base equivalents).

**Verify**: `rg -ci "radix" <each file>` → 0

### Step 2: Update canonical skills, then sync mirrors

Edit the `docs/ai/skills/*` files listed (replace `--radix-*` variable
examples and "Radix" prose with Base UI equivalents; keep each skill's
structure: triggers / workflow / checklist). Then:

`bun run skills:sync && bun run skills:verify`

**Verify**: both commands exit 0; `rg -il "radix" docs/ai/skills` → only files
whose remaining mentions are the explicit Radix→Base mapping context (target: none)

### Step 3: Archive historical audits

Create `docs/ai/audits/archive/`, move the three 2026-04 shadcn-ui audit files
there, and prepend to each:

```md
> **ARCHIVED (2026-06):** Historical audit from the Radix era. The UI layer
> is now Base UI only — see docs/ai/audits/base-ui-only-migration.md.
```

Fix any inbound links (`rg -l "shadcn-ui-audit-2026" docs`).

**Verify**: `ls docs/ai/audits/archive` shows the three files; `rg -L "shadcn-ui-audit" docs --glob '!docs/ai/audits/archive/**'` → no dangling references

### Step 4: Record exceptions in the migration audit

Append to `docs/ai/audits/base-ui-only-migration.md`: the kept
`base-vs-radix.md` mapping doc, `vendor/payload-upstream/**`, `.next-docs/**`,
archived audits, and generated `.eslint-*.json` snapshots — each with a
one-line justification.

**Verify**: section exists; `bun run format:check` → exit 0

## Test plan

`bun run test:unit` once (covers `tests/unit/scripts/shadcn-config-guardrails.test.ts`
if its assertion changed). No other tests.

## Done criteria

- [ ] `rg -il "radix" docs packages/ui/README.md --glob '!docs/ai/audits/archive/**' --glob '!docs/ai/audits/base-ui-only-migration.md'`
      returns nothing except (possibly) skill files whose only mentions are
      explicit Radix→Base mapping context — target zero; every remaining file
      is listed in the audit-doc exceptions section
- [ ] `bun run skills:sync` and `bun run skills:verify` exit 0
- [ ] Archived audits carry the banner; no dangling links
- [ ] `bun run format:check` exits 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- `skills:verify` fails for a skill you did not edit — the sync pipeline has
  pre-existing drift; report instead of force-syncing.
- A radix mention sits in a Skills-CLI vendored skill pinned by
  `skills-lock.json` with no canonical `docs/ai/skills/` copy — record it as a
  proposed exception and report; do not hand-edit the vendored tree.
- Rewriting a doc would change non-Radix guidance meaning (e.g. motion rules
  in `anim`) — make the minimal Radix-specific edit only.

## Maintenance notes

- Future upstream skill refreshes (`npx skills add …`,
  `bun run skills:refresh-upstream`) can reintroduce Radix-era text; the
  zero-radix grep in plan 006 should be added to reviewers' checklists for
  skill-refresh PRs.
- The kept `base-vs-radix.md` mapping is upstream-maintained; revisit if
  upstream shadcn ever drops the radix base entirely.
