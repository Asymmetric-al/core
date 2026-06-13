# Plan 005: Dynamically import TanStack devtools so they leave the production bundle

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report — do not improvise. When done, update
> the status row in `plans/README.md` — unless a reviewer dispatched you and
> said they maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat a68fe060..HEAD -- apps/admin/app/_providers/tanstack-devtools.tsx apps/admin/app/layout.tsx`
> On a mismatch with the excerpt below, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `a68fe060`, 2026-06-13

## Why this matters

`AdminTanStackDevtools` returns `null` in production, so the devtools never
_mount_ in prod — good. But it imports `@tanstack/react-devtools` and
`@tanstack/react-table-devtools` with **static top-level imports**. Devtools
packages are not reliably side-effect-free, so Webpack/Turbopack may keep them
in the main client bundle even though the only code path using them is
dead-eliminated in production. Converting to a dynamic import whose callback is
only reached in development moves that code into a separate async chunk that
production never loads, trimming the admin app's main bundle. This is a
bundle-size hygiene fix, not a correctness fix (the early return already
prevents mounting).

## Current state

File: `apps/admin/app/_providers/tanstack-devtools.tsx` (full contents):

```tsx
"use client";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { tableDevtoolsPlugin } from "@tanstack/react-table-devtools";

/**
 * Dev-only TanStack Devtools shell with the Table plugin.
 *
 * Tables opt in by passing a `devtoolsKey` to the shared data-table
 * components. Mirrors the `ReactQueryDevtools` gating in
 * `packages/database/providers/query-provider.tsx`.
 *
 * The `NODE_ENV` early return below is what keeps the shell out of
 * production: `TanStackDevtools` from `@tanstack/react-devtools` has no
 * environment gating of its own. The Table plugin's default entry does
 * additionally export no-ops whenever `NODE_ENV !== "development"`.
 */
export function AdminTanStackDevtools() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return <TanStackDevtools plugins={[tableDevtoolsPlugin()]} />;
}
```

> NOTE: confirm the file begins with `"use client";`. If it does NOT, add it —
> `next/dynamic` with `{ ssr: false }` requires a Client Component. (If the
> live file differs materially from this excerpt, STOP — drift.)

It is rendered in `apps/admin/app/layout.tsx:264` as `<AdminTanStackDevtools />`,
imported at `layout.tsx:22`. Do not change `layout.tsx`.

Repo conventions: Next.js 16 App Router. **Before editing, read the bundled doc
`apps/admin/node_modules/next/dist/docs/01-app/02-guides/lazy-loading.mdx`** (or
the repo-root `node_modules/next/dist/docs/...` equivalent) for the current
`next/dynamic` API — training data is stale per repo policy (AGENTS.md). Mirror
the existing dev-only gating intent.

## Commands you will need

| Purpose                 | Command                                         | Expected on success |
| ----------------------- | ----------------------------------------------- | ------------------- |
| Install (worktree only) | `bun install --force`                           | exit 0              |
| Typecheck               | `bunx turbo run typecheck --filter=@asym/admin` | exit 0              |
| Lint                    | `bunx turbo run lint --filter=@asym/admin`      | exit 0              |

A full production build to _prove_ the bundle shrank is out of scope here (heavy,
may need env) — see Maintenance notes.

## Scope

**In scope**:

- `apps/admin/app/_providers/tanstack-devtools.tsx`

**Out of scope**:

- `apps/admin/app/layout.tsx` — the `<AdminTanStackDevtools />` usage and import
  stay exactly as they are; the component's public name/signature must not change.
- Any other devtools wiring or the `devtoolsKey` prop plumbing.

## Git workflow

- Shared worktree, branch `advisor/v9-followups`. One commit.
- Suggested message: `perf(admin): lazy-load TanStack devtools out of the prod bundle`
- Do NOT push or open a PR.

## Steps

### Step 1: Convert static imports to a dev-gated dynamic import

Rewrite the file so the devtools packages are imported only inside a
`next/dynamic` callback, and that dynamic component is only rendered in
development. Target shape:

```tsx
"use client";

import dynamic from "next/dynamic";

// Devtools packages are loaded only via this dynamic import, so they land in a
// separate async chunk instead of the admin app's main client bundle. The
// chunk is fetched only when <DevtoolsShell /> actually renders, which the
// production early-return below prevents. (`ssr: false` because the devtools
// are client-only.)
const DevtoolsShell = dynamic(
  () =>
    Promise.all([
      import("@tanstack/react-devtools"),
      import("@tanstack/react-table-devtools"),
    ]).then(([{ TanStackDevtools }, { tableDevtoolsPlugin }]) => ({
      default: function DevtoolsShellInner() {
        return <TanStackDevtools plugins={[tableDevtoolsPlugin()]} />;
      },
    })),
  { ssr: false },
);

/**
 * Dev-only TanStack Devtools shell with the Table plugin.
 *
 * Tables opt in by passing a `devtoolsKey` to the shared data-table
 * components. Mirrors the `ReactQueryDevtools` gating in
 * `packages/database/providers/query-provider.tsx`.
 *
 * The devtools packages are imported lazily (see DevtoolsShell) so they stay
 * out of the production main bundle; the `NODE_ENV` early return additionally
 * guarantees they never mount in production.
 */
export function AdminTanStackDevtools() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return <DevtoolsShell />;
}
```

Keep the exported function name `AdminTanStackDevtools` and its zero-arg
signature unchanged (layout.tsx depends on it).

**Verify**: `bunx turbo run typecheck --filter=@asym/admin` → exit 0.

### Step 2: Lint and confirm no static devtools import remains

**Verify**:

- `bunx turbo run lint --filter=@asym/admin` → exit 0.
- `grep -nE "^import .*@tanstack/react-(devtools|table-devtools)" apps/admin/app/_providers/tanstack-devtools.tsx` → **no matches** (the only references are now inside the dynamic `import(...)` callback).
- `grep -n "process.env.NODE_ENV" apps/admin/app/_providers/tanstack-devtools.tsx` → the production early-return is still present.

Then commit.

## Test plan

- No unit test (this is a bundling/lazy-load refactor with no behavior change in
  dev and a `return null` in prod). Verification is typecheck + lint + the grep
  checks above. Bundle-size confirmation is a manual follow-up (Maintenance).

## Done criteria

ALL must hold:

- [ ] `bunx turbo run typecheck --filter=@asym/admin` exits 0
- [ ] `bunx turbo run lint --filter=@asym/admin` exits 0
- [ ] No top-level static import of `@tanstack/react-devtools` or
      `@tanstack/react-table-devtools` remains in the file (grep clean)
- [ ] The file still uses `next/dynamic` with `{ ssr: false }` and preserves the
      `process.env.NODE_ENV === "production"` early return
- [ ] The exported `AdminTanStackDevtools` name and zero-arg signature are
      unchanged
- [ ] `git status` shows ONLY `tanstack-devtools.tsx` modified

## STOP conditions

Stop and report if:

- The live file differs materially from the "Current state" excerpt (drift).
- `next/dynamic` cannot be used here for a reason the docs reveal (e.g. the file
  must stay a Server Component for an import constraint you discover) — report
  it rather than forcing the pattern.
- Typecheck fails on the dynamic-import return shape and you cannot resolve it by
  matching the `{ default: Component }` contract from the Next.js lazy-loading
  doc.

## Maintenance notes

- To _verify the bundle actually shrank_, a maintainer can run
  `bunx turbo run build --filter=@asym/admin` and inspect that
  `@tanstack/react-devtools` / `@tanstack/react-table-devtools` appear only in a
  separate async chunk, not the main/shared client bundle. This is deferred out
  of this plan because a full admin build needs env and is heavy in a worktree.
- If devtools are later wanted in a non-admin app, replicate this lazy pattern;
  do not revert to static imports.
- Reviewer should confirm dev devtools still function by running the admin dev
  server locally (the dynamic import must resolve and the panel must appear).
