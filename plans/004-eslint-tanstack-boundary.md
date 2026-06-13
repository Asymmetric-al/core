# Plan 004: Enforce the TanStack Table boundary with no-restricted-imports

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report — do not improvise. When done, update
> the status row in `plans/README.md` — unless a reviewer dispatched you and
> said they maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat a68fe060..HEAD -- eslint.config.mjs packages/ui/components/shadcn/data-table/tanstack.ts`
> On a mismatch with the excerpts below, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `a68fe060`, 2026-06-13

## Why this matters

ADR-3 (`docs/guides/architecture/tanstack-table-v9-decisions.md`) establishes
that `packages/ui/components/shadcn/data-table/tanstack.ts` is the **only** file
allowed to import `@tanstack/react-table`; everything else imports table
values/types from that boundary module. The v8→v9 audit found 53 files
importing the engine directly and routed them through the boundary so future
engine churn stays in one file. But this rule is enforced only by code review —
there is no lint rule, so the next contributor who writes `import { useReactTable
} from "@tanstack/react-table"` in an app or shared-UI file passes CI and
silently re-opens the hole. The repo already uses `no-restricted-imports` to
enforce the Supabase boundary; this plan adds the analogous guard for the table
engine.

## Current state

File: `eslint.config.mjs` (root, flat config). It already restricts `@supabase/*`
for shared-UI/app surfaces. The relevant block, `eslint.config.mjs:72-106`:

```js
  {
    files: [
      "apps/*/components/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}",
      "apps/*/features/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}",
      "packages/ui/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...crossAppImportRestrictions,
            ...rawTwentyClientImportRestrictions,
            {
              group: ["@supabase/*"],
              message:
                "Client-side surfaces must consume Supabase via @asym/database wrappers, not @supabase/* directly.",
            },
          ],
          paths: [
            {
              name: "@asym/database/supabase/admin",
              message:
                "UI layers must not import the admin database client directly.",
            },
            {
              name: "@asym/database/supabase/server",
              message:
                "UI layers must not import the server database client directly.",
            },
          ],
        },
      ],
    },
  },
```

Key facts that make this safe and precise:

- The **only** files under `packages/ui/**` that import `@tanstack/react-table`
  are `packages/ui/components/shadcn/data-table/tanstack.ts` (the boundary) and
  the `declare module "@tanstack/react-table"` augmentation in
  `packages/ui/components/shadcn/data-table/types.ts` (line 158 — a module
  augmentation, **not** an import; `no-restricted-imports` does not flag it, but
  we exempt it defensively). Verified via
  `grep -rn 'from "@tanstack/react-table"' packages/ui apps` → matches only
  `tanstack.ts`.
- **No file under `apps/**` imports `@tanstack/react-table` directly** — they
  all go through the boundary. So the restriction adds zero violations in app
  code today.
- Table-creating files import `@tanstack/react-table-devtools` (a **different**
  module specifier). Restricting the exact path `@tanstack/react-table` does
  **not** catch `@tanstack/react-table-devtools`. Use an exact `paths` entry,
  not a `patterns` glob, to keep devtools allowed.
- `packages/database/hooks/*` import `SortingState` etc. from
  `@tanstack/react-table` directly (ADR-3 sanctioned exception), but those files
  are under `packages/database`, which this eslint block does **not** target. No
  change needed there.
- `scripts/verify-eslint-config.mjs` and `tests/unit/script-verifiers.test.ts`
  check markers in `tooling/eslint-config/base.mjs`, **not** the root
  `eslint.config.mjs`. Adding a path to the root config does not affect them
  (confirm by reading `verifyArchitectureRules` in the script).

## Commands you will need

| Purpose | Command | Expected on success |
| ------- | ------- | ------------------- |
| Install (worktree only) | `bun install --force` | exit 0 |
| Lint the whole repo | `bun run lint` | exit 0 — **no new violations** |
| Lint shared UI | `bunx turbo run lint --filter=@asym/ui` | exit 0 |
| ESLint config verifier | `node scripts/verify-eslint-config.mjs` | exit 0 |
| Script-verifier tests | `bunx vitest run tests/unit/script-verifiers.test.ts` | all pass |
| Negative check (see Step 3) | temporary file lint | error reported |

## Scope

**In scope**:

- `eslint.config.mjs`

**Out of scope**:

- `tooling/eslint-config/base.mjs` and `tooling/eslint-config/base.js` — do not
  touch; the architecture-marker verifier reads these and they are unrelated.
- The boundary module, types.ts, database hooks — no code changes; they are
  only referenced by the new exemption.
- The existing `@supabase/*` / cross-app / Twenty restrictions — leave intact.

## Git workflow

- Shared worktree, branch `advisor/v9-followups`. One commit.
- Suggested message: `chore(eslint): forbid direct @tanstack/react-table imports outside the boundary`
- Do NOT push or open a PR.

## Steps

### Step 1: Add the engine-import restriction

In the `eslint.config.mjs:72-106` block, add a `paths` entry for
`@tanstack/react-table` alongside the existing Supabase path entries:

```js
          paths: [
            {
              name: "@tanstack/react-table",
              message:
                "Import table values/types from the boundary module @asym/ui/components/shadcn/data-table/tanstack (relative ./tanstack within shared UI), not @tanstack/react-table directly (ADR-3). @tanstack/react-table-devtools is allowed.",
            },
            {
              name: "@asym/database/supabase/admin",
              message:
                "UI layers must not import the admin database client directly.",
            },
            {
              name: "@asym/database/supabase/server",
              message:
                "UI layers must not import the server database client directly.",
            },
          ],
```

Use `name` (exact match), NOT a `patterns` glob — this is what keeps
`@tanstack/react-table-devtools`, `@tanstack/react-table-virtual`, etc. allowed.

### Step 2: Add the boundary-file exemption override

Immediately AFTER that block (later flat-config entries win), add an override
that turns the rule off for the two sanctioned boundary files:

```js
  {
    // ADR-3 sanctioned exceptions: the boundary module is the ONE place allowed
    // to import the engine, and types.ts augments the engine's module.
    files: [
      "packages/ui/components/shadcn/data-table/tanstack.ts",
      "packages/ui/components/shadcn/data-table/types.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
```

(Setting it `"off"` for these two files also disables the Supabase restriction
there, which is fine — neither imports Supabase. If you prefer to preserve the
other restrictions, you may instead re-declare `no-restricted-imports` for these
two files with the Supabase entries but without the `@tanstack/react-table`
path; the simpler `"off"` is acceptable and is what this plan expects.)

**Verify**: `bunx turbo run lint --filter=@asym/ui` → exit 0 (the boundary file
must NOT report a violation; if it does, the exemption glob is wrong).

### Step 3: Prove the rule actually fires (negative test), then remove it

Create a throwaway file to confirm the rule triggers, lint just it, then delete
it (it must NOT be committed):

1. Write `apps/admin/app/__lint_probe__.ts` containing:
   `import { useReactTable } from "@tanstack/react-table";`
   `void useReactTable;`
2. Run `bunx eslint apps/admin/app/__lint_probe__.ts` → it MUST report a
   `no-restricted-imports` error mentioning ADR-3.
3. Delete `apps/admin/app/__lint_probe__.ts`.

This step has no committed artifact; it only proves the guard works.

### Step 4: Full-repo lint and config verifier

**Verify**:
- `bun run lint` → exit 0 (no new violations anywhere — confirms no real file
  was relying on a direct engine import).
- `node scripts/verify-eslint-config.mjs` → exit 0.
- `bunx vitest run tests/unit/script-verifiers.test.ts` → all pass.

Then commit (ensure `git status` shows ONLY `eslint.config.mjs` changed — the
probe file must be gone).

## Test plan

- No new unit test file (this is lint configuration). The verification is:
  (a) `bun run lint` stays green across the repo, proving no legitimate file
  needed a direct import; (b) the Step 3 negative probe proves the rule fires;
  (c) the existing config-verifier script and its test still pass.

## Done criteria

ALL must hold:

- [ ] `bun run lint` exits 0 (no new violations)
- [ ] `node scripts/verify-eslint-config.mjs` exits 0
- [ ] `bunx vitest run tests/unit/script-verifiers.test.ts` exits 0
- [ ] `eslint.config.mjs` restricts `@tanstack/react-table` (exact path) for the
      `packages/ui/**` + apps glob, and exempts `tanstack.ts` + `types.ts`
- [ ] The Step 3 probe confirmed the rule fires, and the probe file is deleted
- [ ] `git status` shows ONLY `eslint.config.mjs` modified

## STOP conditions

Stop and report if:

- `bun run lint` reports a violation in any real (non-probe) file — that means a
  legitimate consumer imports the engine directly and the boundary has a hole
  this plan didn't account for. Report the file; do NOT add ad-hoc exemptions.
- The `eslint.config.mjs:72-106` block doesn't match the excerpt (drift).
- The Step 3 probe does NOT produce an error — the restriction isn't wired
  correctly (likely a `patterns` vs `paths` mix-up).

## Maintenance notes

- If a new sanctioned exception is ever added (per a future ADR), extend the
  Step 2 override's `files` list, not the rule.
- If `@tanstack/react-table` is ever wrapped behind a different module path,
  update the `name` and the message.
- Reviewer should verify devtools imports (`@tanstack/react-table-devtools`)
  still lint clean — they must, because the restriction is an exact-path match.
