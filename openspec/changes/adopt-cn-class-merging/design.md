## Context

See [proposal.md](proposal.md) for intent and scope; tracked by AL-1893.
`packages/ui/lib/utils.ts` currently re-exports `cn` and `ClassValue` from
`cnfast@0.0.8`. Apps already consume the shared helper, including through
compatibility barrels. The admin manifest also declares `clsx` and
`tailwind-merge` directly; source imports must be checked before their removal.

The shared Tailwind v4 stylesheet includes semantic theme tokens, custom
utilities, `@tailwindcss/typography`, and shared/app source globs. The three
apps consume that stylesheet. This is a presentation dependency change; APIs,
jobs, stores, providers, data ownership, authorization, and money boundaries do
not change.

## Goals / Non-Goals

**Goals:** preserve the existing variadic `cn` and `ClassValue` API and Core's tested class semantics while
adopting a reproducible upstream package and recording the limits of the
verification.

**Non-goals:** project-generated conflict tables, framework wrappers, global
dependency aliases, component redesigns, unrelated tool upgrades, or inferred
application performance gains.

## Decisions

### Keep the shared seam and pin the package

Use the named exports from the root entry of exact `cn@0.3.2` in
`packages/ui/lib/utils.ts`,
including a direct `ClassValue` type re-export. Preserve all existing consumer
paths. The upstream [manual migration](https://github.com/shadcn-ui/cn#manually)
uses a direct re-export; a wrapper is unnecessary for Core's existing helper.
Changing hundreds of call sites would enlarge the migration and rollback scope
without changing the shared contract.

`cnfast` also exposed tagged-template syntax that `cn` does not support. The
migration's source audit found no tagged-template consumers; compatibility
claims apply to Core's existing variadic calls and `ClassValue` inputs.

Remove `cnfast` from the shared UI package and remove only unused direct
`clsx`/`tailwind-merge` admin dependencies. Keep real transitive dependencies
required by packages such as component tooling and variant composition. Do not
alias another package's imports globally: its chosen version and usage are
outside this helper's migration boundary.

### Use the default full conflict tables

The default engine avoids introducing a source-scanning or generated-file
dependency into three apps' builds. A generated subset would require proving
coverage for shared source globs, conditional and dynamic inputs, custom CSS,
and plugin utilities. Upstream's pinned
[build guidance](https://github.com/shadcn-ui/cn/blob/210353b13437e832a95d51f9540288d91c3b2e14/docs/build-setup.md)
recommends the default import for most projects and warns that unknown consumer
classes in a subset pass through unmerged. Upstream also reports generated TypeScript problems with
`noUncheckedIndexedAccess` in [issue #146](https://github.com/shadcn-ui/cn/issues/146).
That report concerns generated output rather than the default runtime import;
verify the actual default import under Core's typecheck.

No `cn/next` wrapper, alias, generated source, build hook, or new merge config is
needed. Future subsetting must be a separately measured change with its own
source-discovery and fallback evidence.

### Verify Core behavior rather than relying on the headline

The [engine design](https://github.com/shadcn-ui/cn/blob/main/docs/how-it-works.md)
describes compiled tables and caches. Its 30x figure describes a specific
upstream workload, not a measured improvement over Core's existing `cnfast`.
Acceptance is based on Core's regression cases, representative source corpus,
consumer typechecks/builds, and browser verification where available.

Use red-green-refactor at the shared seam: establish dependency/export
expectations and behavioral regression cases before the implementation change,
then rerun them after the migration. Include nested conditional inputs,
spacing asymmetry, semantic colors versus text size, arbitrary values,
important modifiers, Base UI state variants, custom classes, repeated calls,
and shared component overrides. Inspect any differential result rather than
assuming either old or new engine is necessarily correct.

### Preserve transparent legacy-gradient surfaces explicitly

The migration audit found that `cnfast` drops a component's `bg-card` or
`bg-muted` when a later `bg-gradient-to-*` is present, while `cn` retains the
background color alongside the gradient image. At confirmed affected Card or
AvatarFallback consumers, add `bg-transparent` to express the previous
appearance explicitly. Cover these combinations with regression tests and
rendered evidence. Do not alter global conflict rules or bulk-rewrite unrelated
gradients. Rollback includes these narrow consumer edits.

This legacy-gradient difference is also reported in upstream
[issue #142](https://github.com/shadcn-ui/cn/issues/142). The older arbitrary-font
report in [issue #23](https://github.com/shadcn-ui/cn/issues/23) does not by itself
establish a regression in the selected release: the research audit found its
listed cases match current `tailwind-merge@3.7.0`. Core's previous `cnfast`
implementation and actual call-site corpus remain the migration baseline.

## Risks / Trade-offs

- **New upstream edge cases:** exact pinning and Core-specific regressions
  bound the release under test. Known upstream reports must be assessed against
  actual Core input; full tables are not a promise of universal compatibility.
- **Unknown/plugin classes:** default tables do not infer custom CSS conflict
  semantics. Preserve custom classes and test Core's combinations; add explicit
  configuration only if a demonstrated conflict requires it.
- **Package/bundle cost:** default tables deliberately retain broad coverage.
  Do not claim bundle savings or runtime acceleration without Core measurements.
- **Evidence limits:** passing unit tests does not prove every dynamic runtime
  input or deployed page. Record build/browser prerequisites and failures
  separately; do not weaken existing checks to report success.

## Migration Plan

1. Record upstream release/API evidence and audit existing imports and lockfile
   ownership. Reproduce relevant upstream reports against the selected package.
2. Establish shared helper regression coverage and compare representative Core
   class combinations with the existing engine.
3. Replace the shared dependency/re-exports, remove unused direct dependencies,
   and regenerate the Bun lockfile using the repository's package workflow.
4. Run focused tests, dependency/import checks, consumer typechecks and builds,
   UI invariant checks, OpenSpec validation, and the standard preflight gate.
   Verify representative rendered components and report any external blocker.
5. Document evidence and remaining limitations; publish the scoped PR without
   archiving this active change before merge.

Rollback restores the previous `cnfast@0.0.8` helper, manifests, and Bun lockfile
together, then reruns focused tests and consumer checks. Shared consumer import
paths and the unchanged CSS/component system keep rollback localized. No data
migration or provider operation is required.
