# Verification

Evidence for the migration from cnfast@0.0.8 to cn@0.3.2, based on
develop commit c23645572. This change remains active until merged.

## Release and scope

- Exact release cn@0.3.2, published September 21, 2026; upstream source
  210353b13437e832a95d51f9540288d91c3b2e14. Registry signatures and published
  provenance verified in an isolated package installation.
- Existing Core usage: 258 shared-helper imports and 913 calls, with no tagged
  templates or aliased imports in the audited application/package sources.
  The existing variadic API and ClassValue export are preserved.
- Full default tables; no generated subsets, Next.js wrapper, global aliases,
  custom merge configuration, token changes, or primitive changes.
- Lockfile changes only the intended workspace dependencies and resolved
  packages. clsx remains where third-party packages require it.

## Compatibility and rendering

- Before migration, 22 new characterization tests passed on cnfast.
- After migration, 27 new helper/rendered-component regression tests pass,
  covering conditionals, nested inputs, mutable cached inputs, utility conflicts,
  semantic tokens, Base UI variants, arbitrary values, and caller overrides.
- A TypeScript AST audit extracted 11,479 static class combinations from 1,919
  source files. Outputs matched across cnfast, cn, and
  clsx@2.1.1 plus tailwind-merge@3.6.0 before the compatibility edits.
- Tracing 2,176 shared-primitive/caller compositions identified three legacy
  gradient overrides that previously removed a default background color.
  Their explicit bg-transparent overrides preserve the previous appearance.
  Committed tests read the real callers and render the shared components.
- An isolated Chromium harness compiled Core's actual global Tailwind stylesheet
  and compared old/new computed background color/image, text color, font size,
  and radius for those three compositions in light and dark themes. All six
  comparisons matched; removing the fixes reproduced all six background
  regressions. This is focused browser evidence, not authenticated-page E2E.
- Separate published-package cache checks passed 30,000 seeded differential
  calls each under Node 24.15.0 and Bun 1.3.14.

Static extraction does not exhaust every dynamic application input. Upstream
legacy-gradient, containment, and numeric auto-grid behavior differs from some
tailwind-merge versions. No universal parity or measured application speedup
is claimed.

## Bounded performance check

A Node 24.15.0 microbenchmark ran each engine/workload in a separate process
with identical warmup, five timed blocks, and matching checksums. Compared
with cnfast, median repeated-string calls were essentially tied (21.86 vs
21.19 ms per million); repeated variadic calls improved from 54.90 to 22.89 ms
per million. A warmed 11,476-input parity-matching corpus improved from 77.26
to 8.35 ms per 137,712 calls. The three documented gradient differences were
excluded from that checksum comparison. These rough measurements include
cache effects and concurrent machine activity; they establish no whole-app
or Web Vitals claim and do not validate the upstream 30x headline.

## Repository checks

- Full unit gate: 4,330 passed, four skipped; 583 passing files, two skipped.
- Lint and typecheck: all 15 workspace tasks passed. Existing lint warnings
  remain outside the changed lines.
- React Doctor 0.9.14, changed scope against origin/develop: zero diagnostics.
  A scan of the complete touched files also showed existing diagnostics outside
  the changed lines; this migration does not claim to resolve those.
- Skills synchronization, all 53 strict OpenSpec validations, data boundary,
  public CMS entry, workspace contract, ESLint configuration, shadcn
  configuration/drift, and Bun lockfile-drift checks passed.
- Shadscan baseline, required floor, and pre-commit score: 29/29/29.
- All three application builds and full formatting passed.
- OpenSpec implementation verification traced all three requirements and six
  scenarios to source/tests with no correctness or coherence findings.
- Full frozen installation and the normal pre-push ci:preflight passed without
  bypasses. The implementation commit is 01c42339573cb5c9a4c2324cf63cc836fbafdbad.
- Published [PR #1895](https://github.com/Asymmetric-al/core/pull/1895) targets
  develop. Initial inspection found no review threads; live CI was running.
  The PR records final checks/review state for its current head.

The initial preflight on the unchanged base commit stopped at the repository's
attribution rule because that existing merge was authored by cursor[bot] and
committed by GitHub. The new implementation commit passed that same rule through the normal push
hook. No attribution rule or check was weakened.

## Review and rollback

Independent source review found no actionable migration defects. Restore the
previous helper, dependency manifests/lockfile, and the three transparency
edits together to roll back. No data or environment migration is needed.
