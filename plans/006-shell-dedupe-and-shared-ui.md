# Plan 006: Delete dead admin shell copies; share theme-provider and page-header via @asym/ui; purge phantom exports

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Reviewer maintains `plans/README.md`.
>
> **Drift check (run after setup)**: `git diff --stat a661bfb9..HEAD -- apps/admin/components apps/missionary/components/page-header.tsx packages/ui/package.json apps/admin/lib/theme-provider.tsx "apps/donor/components/providers" apps/missionary/lib/theme-provider.tsx`
> Expected: empty. On any mismatch with the excerpts below, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (live import swaps across three apps; deletions)
- **Depends on**: none (merge-order note: plan 005 also edits
  `apps/missionary/app/feed/worker-feed-page-client.tsx` — different lines;
  git merges cleanly)
- **Category**: tech-debt
- **Planned at**: commit `a661bfb9`, 2026-06-11

## Why this matters

An earlier shell consolidation was started and abandoned halfway: the
`@asym/ui` package.json declares exports for shell components that were never
moved into it (the target files do not exist), while `apps/admin/components/`
still carries five shell components that nothing imports anymore — admin's
real shell is the separate mission-control system in
`apps/admin/app/mc-shell.tsx`, which already includes the view-transition
boundary. Meanwhile the 11-line `ThemeProvider` wrapper is byte-identical in
all three apps, and missionary's `PageHeader` (the live, view-transition-aware
variant) is app-local even though `@asym/ui` already reserves an export slot
for it. This plan finishes the abandoned consolidation in the cheapest correct
direction: delete the dead copies, fill the two export slots that have real
consumers, and remove the phantom export entries so the package manifest stops
lying.

## Current state

All verified at commit `a661bfb9`.

### Dead admin shell components (zero importers)

- `apps/admin/components/app-shell.tsx` (44 lines)
- `apps/admin/components/app-header.tsx` (67 lines)
- `apps/admin/components/app-sidebar.tsx`
- `apps/admin/components/page-header.tsx` (39 lines)
- `apps/admin/components/dashboard-footer.tsx`

The only reference to any of them in the entire repo is one **commented-out**
import: `apps/admin/features/mission-control/components/app-shell/index.tsx:47`:

```ts
// import { DashboardFooter } from "@/components/dashboard-footer";
```

Admin's real shell is `apps/admin/app/mc-shell.tsx` (mission-control), which
already wraps its content region in the view-transition boundary
(mc-shell.tsx:42 imports `RouteMainViewTransitionBoundary` from
`@asym/ui/components/view-transitions`; used at line 466). Do not modify the
shell structure of mc-shell.tsx — only its theme-provider import (Step 3).

### Triplicated ThemeProvider (byte-identical, verified by diff)

- `apps/admin/lib/theme-provider.tsx`
- `apps/donor/components/providers/theme-provider.tsx`
- `apps/missionary/lib/theme-provider.tsx`

Content (all three identical):

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

Exactly four import sites exist:

- `apps/admin/app/layout.tsx:26` — `import { ThemeProvider } from "@/lib/theme-provider";`
- `apps/admin/app/mc-shell.tsx:74` — same path
- `apps/donor/app/layout.tsx:16` — `import { ThemeProvider } from "@/components/providers/theme-provider";`
- `apps/missionary/app/layout.tsx:21` — `import { ThemeProvider } from "@/lib/theme-provider";`

`packages/ui/package.json` already declares (line 49)
`"./lib/theme-provider": "./lib/theme-provider.tsx"` — **the file does not
exist yet**. `next-themes` is already a dependency of `@asym/ui`
(package.json line 94: `"next-themes": "^0.4.6"`).

### Missionary PageHeader — the live, canonical variant

`apps/missionary/components/page-header.tsx` (53 lines):

```tsx
"use client";

import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import { cn } from "@asym/ui/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** When set, wraps the title in a named shared View Transition (list ↔ detail continuity). */
  titleViewTransitionName?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  titleViewTransitionName,
}: PageHeaderProps) {
  const titleNode = titleViewTransitionName ? (
    <SharedNamedViewTransition name={titleViewTransitionName}>
      <span className="inline-block">{title}</span>
    </SharedNamedViewTransition>
  ) : (
    title
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end sm:justify-between pb-4 sm:pb-6",
        className,
      )}
    >
      <div className="space-y-0.5 sm:space-y-1 min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-900 truncate">
          {titleNode}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-zinc-500 truncate-2 sm:truncate-none">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">{children}</div>
      )}
    </div>
  );
}
```

Exactly six importers, all in missionary, all via
`import { PageHeader } from "@/components/page-header";`:

- `apps/missionary/app/analytics/page-client.tsx`
- `apps/missionary/app/donors/use-donors-page-view.tsx`
- `apps/missionary/app/email-studio/page-client.tsx`
- `apps/missionary/app/feed/worker-feed-page-client.tsx`
- `apps/missionary/app/profile/profile-page-client.tsx`
- `apps/missionary/app/settings/page-client.tsx`

`packages/ui/package.json` already declares (line 35)
`"./components/page-header": "./components/page-header.tsx"` — file missing.
Self-referencing imports like `@asym/ui/lib/utils` work inside `packages/ui`
(exemplar: `packages/ui/components/brand-logo.tsx:6`), so the component's body
needs **no import changes** when moved.

No unit test references any of these paths (verified:
`grep -rln "page-header\|theme-provider\|components/app-shell" tests/unit`
returns nothing).

### Phantom export entries in `packages/ui/package.json`

These entries point at files that do not exist; the first two get **filled**
by this plan, the rest get **removed**:

| Entry                                       | Action        |
| ------------------------------------------- | ------------- |
| `"./components/page-header"` (line 35)      | fill (Step 4) |
| `"./lib/theme-provider"` (line 49)          | fill (Step 2) |
| `"./components/dashboard-footer"` (line 36) | remove        |
| `"./components/app-shell"` (line 37)        | remove        |
| `"./components/app-sidebar"` (line 38)      | remove        |
| `"./components/app-header"` (line 39)       | remove        |
| `"./components/donor/DonorSubNav"`          | remove        |
| `"./components/mission-control/icons"`      | remove        |

Entries under `"./components/public/*"` have real files
(`packages/ui/components/public/navbar.tsx` etc.) — do NOT touch them.

### View-transition context (for the reviewer; no VT code is authored here)

`RouteMainViewTransitionBoundary` and `SharedNamedViewTransition`
(`packages/ui/components/view-transitions/`) are the repo's canonical
React ViewTransition layer: flag-gated by
`NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED` (`packages/lib/view-transitions/flags.ts`),
browser-support- and reduced-motion-guarded, `default="none"`. All three apps
already set `experimental.viewTransition: true` in next.config.ts. Promoting
missionary's PageHeader keeps the shared-element wiring
(`titleViewTransitionName`) in the shared layer where the other apps can adopt
it. Donor has no app shell; adding view transitions there is new feature work,
deliberately out of scope.

## Commands you will need

| Purpose   | Command                                                                                                              | Expected on success |
| --------- | -------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Install   | `bun install`                                                                                                        | exit 0              |
| Typecheck | `bunx turbo run typecheck --filter=@asym/ui --filter=@asym/admin --filter=@asym/donor --filter=@asym/missionary-app` | exit 0              |
| Lint      | `bunx turbo run lint --filter=@asym/ui --filter=@asym/admin --filter=@asym/donor --filter=@asym/missionary-app`      | exit 0              |
| Tests     | `bunx vitest run tests/unit/apps`                                                                                    | all pass            |
| Format    | `bun run format:check`                                                                                               | exit 0              |

## Scope

**In scope** (the only files you should create/modify/delete):

Create:

- `packages/ui/lib/theme-provider.tsx`
- `packages/ui/components/page-header.tsx`

Modify:

- `packages/ui/package.json` (remove the six phantom export entries only)
- `apps/admin/app/layout.tsx`, `apps/admin/app/mc-shell.tsx`,
  `apps/donor/app/layout.tsx`, `apps/missionary/app/layout.tsx`
  (theme-provider import swap only)
- The six missionary page-client files listed above (page-header import swap
  only)
- `apps/admin/features/mission-control/components/app-shell/index.tsx`
  (delete the stale commented import at line 47 only)

Delete:

- `apps/admin/components/app-shell.tsx`, `app-header.tsx`, `app-sidebar.tsx`,
  `page-header.tsx`, `dashboard-footer.tsx`
- `apps/admin/lib/theme-provider.tsx`
- `apps/donor/components/providers/theme-provider.tsx` (and the `providers/`
  directory if it is then empty AND has no index barrel — check first)
- `apps/missionary/lib/theme-provider.tsx`
- `apps/missionary/components/page-header.tsx`

**Out of scope** (do NOT touch):

- `apps/admin/app/mc-shell.tsx` beyond the one import line — its shell
  structure and existing view-transition boundary are correct.
- Missionary's live shell files (`apps/missionary/components/app-shell.tsx`,
  `app-header.tsx`, `app-sidebar.tsx`, `dashboard-footer.tsx`) — they are the
  single live implementation now; extracting them with slots is deliberately
  deferred (single consumer = premature abstraction).
- `packages/ui/components/view-transitions/**` and
  `packages/lib/view-transitions/**`.
- The `"./components/public/*"` export entries and files.
- Any `makeDisplayDate` copies (plan 003's follow-up).

## Git workflow

- Branch: `advisor/006-shell-dedupe` created from commit `a661bfb9`.
- Commit style: conventional commits, e.g.
  `refactor(ui): share theme-provider and page-header; drop dead admin shell`
- Do NOT push or open a PR.

## Steps

### Step 0: Re-verify dead-ness before deleting

For each of the five admin components, confirm zero importers (grep both the
alias path and bare-name forms):

```
grep -rn "components/app-shell\"\|components/app-header\"\|components/app-sidebar\"\|components/page-header\"\|components/dashboard-footer\"" apps/admin tests packages --include="*.ts" --include="*.tsx"
```

Expected: only the commented line at
`apps/admin/features/mission-control/components/app-shell/index.tsx:47`.
Any other hit in `apps/admin` → STOP.

### Step 1: Delete the five dead admin components + stale comment

Delete the five files listed in Scope. Remove line 47 (the commented
DashboardFooter import) from
`apps/admin/features/mission-control/components/app-shell/index.tsx`.

**Verify**: `bunx turbo run typecheck --filter=@asym/admin` → exit 0.

### Step 2: Create the shared ThemeProvider

Create `packages/ui/lib/theme-provider.tsx` with exactly the 11-line content
shown in Current state. The export entry already exists in
`packages/ui/package.json` line 49 — do not add another.

**Verify**: `bunx turbo run typecheck --filter=@asym/ui` → exit 0 (if
`@asym/ui` defines no typecheck task, turbo reporting "no tasks" with exit 0
also passes).

### Step 3: Swap the four theme-provider import sites; delete local copies

In the four files listed in Current state, change the import to:

```ts
import { ThemeProvider } from "@asym/ui/lib/theme-provider";
```

Then delete `apps/admin/lib/theme-provider.tsx`,
`apps/donor/components/providers/theme-provider.tsx`,
`apps/missionary/lib/theme-provider.tsx`. If
`apps/donor/components/providers/` is now empty and has no `index.ts` barrel,
remove the directory; if a barrel exists, STOP and report.

**Verify**:
`grep -rn 'from "@/lib/theme-provider"\|from "@/components/providers/theme-provider"' apps`
→ no matches; typecheck for the three apps → exit 0.

### Step 4: Promote PageHeader to @asym/ui

Create `packages/ui/components/page-header.tsx` with exactly the 53-line
missionary content shown in Current state (no import changes needed). Update
the six missionary importers to:

```ts
import { PageHeader } from "@asym/ui/components/page-header";
```

Delete `apps/missionary/components/page-header.tsx`.

**Verify**: `grep -rn 'from "@/components/page-header"' apps` → no matches;
`bunx turbo run typecheck --filter=@asym/missionary-app` → exit 0.

### Step 5: Purge phantom export entries

In `packages/ui/package.json`, delete the six entries marked "remove" in the
table above. Before deleting each, confirm: the target file does not exist
AND `grep -rn "<export specifier>" apps packages tests --include="*.ts*"`
returns no importers. Any importer found → STOP for that entry and report.

**Verify**: `bun install` (refresh workspace links) → exit 0;
`grep -n '"./components/app-shell"\|"./components/app-sidebar"\|"./components/app-header"\|"./components/dashboard-footer"\|"./components/donor/DonorSubNav"\|"./components/mission-control/icons"' packages/ui/package.json`
→ no matches.

### Step 6: Full verification

**Verify**: all commands in "Commands you will need" succeed.

## Test plan

No new tests: the change is import-path moves, file deletions, and manifest
cleanup — behavior is unchanged and no test currently references these paths
(verified at planning). The gate is the full typecheck/lint matrix across the
three apps + `@asym/ui`, plus `bunx vitest run tests/unit/apps` staying green.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] The five `apps/admin/components/*.tsx` shell files no longer exist
- [ ] `packages/ui/lib/theme-provider.tsx` and
      `packages/ui/components/page-header.tsx` exist
- [ ] `grep -rn 'from "@/lib/theme-provider"\|from "@/components/providers/theme-provider"\|from "@/components/page-header"' apps` → no matches
- [ ] `grep -c "theme-provider" packages/ui/package.json` returns 1 (the one
      real export entry)
- [ ] The six phantom export entries are gone from `packages/ui/package.json`
- [ ] `bunx turbo run typecheck --filter=@asym/ui --filter=@asym/admin --filter=@asym/donor --filter=@asym/missionary-app` exits 0
- [ ] `bunx turbo run lint --filter=@asym/ui --filter=@asym/admin --filter=@asym/donor --filter=@asym/missionary-app` exits 0
- [ ] `bunx vitest run tests/unit/apps` exits 0
- [ ] `bun run format:check` exits 0
- [ ] `git status` shows no changes outside the in-scope list

## STOP conditions

Stop and report back (do not improvise) if:

- Step 0 finds any live importer of the "dead" admin components.
- The `@asym/ui` self-referencing import (`@asym/ui/lib/utils` inside
  `packages/ui/components/page-header.tsx`) fails typecheck — would indicate
  an exports-resolution problem this plan must not work around.
- `apps/donor/components/providers/` contains an index barrel or any file
  other than `theme-provider.tsx`.
- Any phantom export entry turns out to have an importer.
- Typecheck failures appear in files OUTSIDE the in-scope list after the
  swaps (would indicate a hidden consumer; report, don't chase).

## Maintenance notes

- Missionary's `app-shell.tsx` is now the single live shell of its kind. If a
  fourth app ever needs it, extract to `@asym/ui` with header/sidebar/footer
  slots — do not copy-paste again.
- The promoted `PageHeader` keeps `titleViewTransitionName`; admin's
  mission-control `patterns/page-header` is a separate, intentionally
  different component — do not merge them without a design pass.
- Reviewer should scrutinize: theme rendering on all three apps' layouts
  (the ThemeProvider swap is the only runtime-visible risk), and that
  `bun.lock` did not change unexpectedly from Step 5's `bun install`
  (manifest-only edits should produce at most a lockfile workspace-graph
  touch; a large lockfile diff → report).
- Deferred follow-ups recorded in plans/README.md: donor view-transition
  adoption; consolidating the remaining `makeDisplayDate` copies.
