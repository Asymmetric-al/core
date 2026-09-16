# Core design-system lint workflow

Use this reference for UI implementation, registry adoption, lint failures,
and changes to shared components, tokens, contracts, or lint policy. It is
subordinate to `packages/ui/AGENTS.md` and the frontend rulebook. Unrelated
backend work and prose-only edits do not require this workflow.

## Vetted version and compatibility

`@asym/eslint-config` pins `@shadcn/lint@0.1.0` with a Core-maintained
Bun compatibility patch. The
[published tarball](https://registry.npmjs.org/@shadcn/lint/-/lint-0.1.0.tgz)
was released on 2026-09-14; Bun's lockfile records its integrity. Official
documentation and relevant source/tests were reviewed at
[`53de86f`](https://github.com/shadcn-ui/lint/tree/53de86f0e7dcc341a9cb45c383a9f2c454d1e958),
and the installed package was checked separately. npm supplies no `gitHead`;
do not claim a proven source-to-build identity. Upstream has no GitHub release
entry; its changelog records the initial release.

The root `patchedDependencies` entry applies
`tooling/eslint-config/patches/@shadcn%2Flint@0.1.0.patch` reproducibly during frozen installation.
The patch lives under the tooling owner so a patch-only change selects its
consumer workspaces through the dependency graph. Its only behavioral change
is component-owner lookup inside
`componentFromImport` in the published `dist/index.js`; Core configuration
still calls the public ESLint plugin and no private API. This is a local
upstream-defect repair, not an official fixed release. The resolution suite
covers canonical and local/mixed barrels, aliases, wrappers, and unrelated
same-name components. Review the patch alongside every package upgrade.

The release supports Node >=20.19, ESLint >=9.30, and Tailwind 4. Core's
verified toolchain is Node 24.15.0, ESLint 9.39.4, Tailwind 4.2.2,
Bun 1.3.14, and Turbo 2.10.0. Core's tooling peer requires ESLint
`^9.39.2` for the flat-config `basePath` API; the installed 9.39.4 is unchanged.
ESLint 9 is API-compatible but reached
[EOL on 2026-08-06](https://eslint.org/version-support/); migrating the
existing Next.js/shared lint stack to ESLint 10 is separate work.

Use the published ESLint plugin export and supported options. This release
does not supply a CLI, recommended preset, or theme-path setting. Core runtime integration does
not import private APIs or use the experimental project API; the narrowly
maintained package repair above is the explicit source modification. Relevant
upstream references are the pinned
[rules](https://github.com/shadcn-ui/lint/blob/53de86f0e7dcc341a9cb45c383a9f2c454d1e958/docs/rules.md),
[analysis model](https://github.com/shadcn-ui/lint/blob/53de86f0e7dcc341a9cb45c383a9f2c454d1e958/docs/how-it-works.md),
and [troubleshooting](https://github.com/shadcn-ui/lint/blob/53de86f0e7dcc341a9cb45c383a9f2c454d1e958/docs/troubleshooting.md).

## Ownership and boundaries

The executable policy lives in `tooling/eslint-config/design-system.mjs`.
The tooling package owns `@shadcn/lint`; it is not a product dependency.
Root and workspace configurations compose the same policy in `apps/admin`,
`apps/donor`, `apps/missionary`, `packages/ui`, and
`packages/missionary`. Backend packages, email/document renderers, generated
and vendor output retain their existing lint coverage outside this web policy.
`packages/lib` currently contains unstyled providers and authored-HTML helpers,
not first-party styled editor chrome; reevaluate scope if that changes.

Preserve exact `base-maia`, Base UI behavior, semantic CSS variables,
`@asym/ui` ownership, existing variants/sizes, and the current `cnfast`/CVA
implementation. The shared `packages/ui/components.json` and CSS stay shared;
do not add app-level component configuration or duplicate theme declarations.

The effective profiles are defined in the shared configuration:

| Rule                            | Consumers, compositions and editor chrome              | Explicit primitive-authoring files                                              |
| ------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `shadcn/no-restyle`             | Error; precise placement and named component contracts | Off: author owns appearance                                                     |
| `shadcn/no-raw-colors`          | Error                                                  | Error                                                                           |
| `shadcn/no-arbitrary-values`    | Error                                                  | Error; exact existing focus, motion, and per-file structural values are allowed |
| `shadcn/no-inline-styles`       | Error                                                  | Error, except individually documented runtime implementations                   |
| `shadcn/no-unknown-classes`     | Error                                                  | Error                                                                           |
| `shadcn/require-static-classes` | Error                                                  | Off: author owns CVA and forwarding APIs                                        |

`primitiveFiles` in the policy is an explicit module list, not a directory
exemption. New files remain consumers until their API and exception fixtures
are reviewed. The default control contract permits placement without broadly
allowing dimensions, transforms, focus, hover, or press overrides. Named
structural slots permit content arrangement; title/description slots permit
typography; Skeleton delegates silhouette and Avatar delegates size.
The exact executable patterns are the authority, not a duplicated list here.

Recognition starts with `@asym/ui/components/shadcn` and follows resolved
binding provenance to the canonical shadcn component index, including imports
through package/local barrels. There is no blanket `@asym/ui` or
`@asym/ui/*` appearance lock. Unrelated root exports such as auth components
retain applicable token, inline-style, and class checks without becoming
appearance-locked primitives by name. Preserve real deep imports, aliases,
barrels, and forwarding wrappers; do not register a CVA-produced variant
function as a class-merging helper.

Do not exempt all of `packages/ui`: dashboards, feature compositions, public
sections, wrappers, and first-party editor chrome still consume the system.
User-authored content and non-web email/document output are different
rendering domains; retain their unrelated lint coverage.

## Permanent implementation exceptions

`tooling/eslint-config/design-system-exceptions.mjs` owns the finite runtime
and external-class tables. These are design/API boundaries, not legacy debt.
Property allowances match a property anywhere in the named file, not its
runtime value; reviewers must check new uses even when lint passes.

- Table/grid bodies allow measured width/height constraints and virtual-row
  transforms only in their named implementations. The image node view permits
  resized width; the ripple primitive permits pointer-relative top/left.
- The missionary kanban permits dnd-kit transforms/transitions. Profile preview
  files permit their measured viewport dimensions/scaling. Three named admin
  chart files permit their existing height APIs. No global width/height/
  transform allowance exists.
- Three donor OpenPolicy adapters use component-specific display, direction,
  gap, and max-width contracts because the installed library exposes `style`
  without `className`. Ordinary DOM in those files remains checked.
- `not-prose` is the typography plugin's exclusion marker from the loaded
  shared stylesheet. Named Payload wrappers use selectors loaded by
  `payloadStyles.css`; the image node view uses selectors from the editor's
  imported `tiptap.css`. Misspelled or unsourced classes remain errors. External/marker allowances
  reject variant-prefixed spellings too, so `hovr:not-prose` cannot bypass
  Tailwind validation.
- Only `apps/missionary/app/apple-icon.tsx` opts out of the six web rules as
  an ImageResponse/Satori renderer. Existing TypeScript, import, React, and
  Next checks remain in force; adjacent web files receive all six rules.
- Generated style elements remain checked. Two expression-scoped, tracked
  disables cover runtime chart theme variables and Payload CSS layer ordering.
  Additional style elements in those files still fail.
- Three chart color markers forward their existing runtime color through
  `--legend-color` and the real `bg-(--legend-color)` Tailwind utility.
  This preserves dynamic color without a global inline-color allowance.

The main policy's `structuralValues` table preserves exact existing Maia
geometry, Base UI positioning, focus rings, and transition-property lists in
named primitive files. Shared motion allowances name existing CSS variables,
including `ease-[var(--ease-out-soft)]`. The pinned-table composition permits
only its two existing one-pixel `--color-border` seam shadows; its other
appearance remains consumer-owned. These allowances do not grant an arbitrary layout category, create new tokens, or change
runtime motion. Additions require design justification and compatibility
fixtures, not broad wildcard widening.

## Iteration and completion

1. Inspect the existing shared component, variants, sizes, tokens, and relevant
   contracts. Do not recreate a primitive or mint a token to silence lint.
2. For substantive UI work, inspect raw existing findings in affected files
   before attributing all failures to the new edit.
3. Implement or adapt registry output to Core's APIs and visual language.
4. Run the smallest relevant workspace-aware lint check. Fix consumer usage;
   investigate discovery and analyzer failures as tooling problems.
5. After a shared component, variant, token, export, resolution, or policy
   change, expand checking to affected consumers and verify analysis health.
6. Review policy, token, contract, exception, and debt changes separately from
   ordinary usage fixes. Never relax the policy merely to obtain a green check.
7. Run required broader gates, including `bun run ci:preflight` for PR-ready
   work, and proportionate browser/a11y checks for rendered changes. Check
   keyboard/focus, responsive overflow, light/dark states, touch targets, and
   reduced motion when relevant.

Use scoped checks during iteration. Do not run a full UI suite after every
edit, lint prose-only typos, or repeat successful expensive checks without new
edits, unresolved risk, or a required workflow gate.

## Commands

Use the wrapper-backed commands for both enforcement and finding review:

```bash
# Smallest iteration: repository-relative file or directory.
bun run lint:ui apps/donor/app/layout.tsx
bun run lint:ui packages/ui/components/public

# Equivalent workspace-local entry: paths are relative to apps/donor.
bun run --cwd apps/donor lint app/layout.tsx

# Full applicable UI or one workspace.
bun run lint:ui
bun run lint:donor
bunx --no-install turbo run lint --filter=@asym/ui

# Raw, machine-readable findings including accepted legacy debt.
bun run lint:ui apps/donor --raw --format json --output-file .tmp-ui-lint.json

# Deliberate full-run cleanup after fixing accepted findings.
bun run lint:ui --prune-suppressions

# Discovery/configuration check and required broader entry points.
bun run verify:eslint
bunx --no-install vitest run tests/unit/scripts/design-system --maxWorkers=2
bun run lint
bun run check
bun run ci:preflight
```

Workspace `lint` without paths checks its full workspace. Root `lint:ui`
without paths checks all five UI workspaces. Root `lint` still uses Turbo
across the repository; `check`, preflight, and existing CI reach normal lint.
For shared component/token/export/policy changes, check all relevant consumers;
scoping to the changed package alone is insufficient.

The wrapper resolves the requested paths from the caller's working directory,
selects that root/workspace config, then invokes native ESLint with repository
cwd so the suppression file always uses repository-relative keys. Its supported
flags preserve ESLint JSON diagnostics, locations, rule IDs, suggestions when
available, and exit status: `1` for lint failure and `2` for setup/analysis
failure. `--raw` uses an empty temporary suppression file without changing
accepted debt. It rejects unsupported flags such as cache, configuration
replacement, or baseline expansion.

`.tmp-ui-lint.json` is ignored scratch evidence, not a committed artifact.
Reports belong to the invocation that produced them; Turbo does not promise
to restore these ad hoc files from cache. Health probes run through actual
configs in a separate short-lived process before full ESLint, releasing
analysis caches between phases; `verify:eslint` also includes discovery health.

## Findings, exceptions, and legacy debt

Classify findings before adopting or fixing them: genuine violation,
legitimate primitive authoring, runtime/specialized renderer requirement,
discovery/configuration failure, analyzer limitation, or pre-existing debt.

Permanent authoring boundaries require a component/API reason and positive,
negative, and exception fixtures. Temporary debt must be explicitly scoped
to existing files and the new rule IDs, with reviewed counts and the existing
repository tracking convention. Do not invent tracking IDs. Do not suppress
new findings introduced by the integration or unrelated existing rules.

Reviewed legacy counts live in
`tooling/eslint-config/suppressions.json`, keyed by repository-relative file
and new rule ID. Native ESLint owns suppression application. The wrapper and
`verify:eslint` reject unrelated rule IDs, paths outside the five UI scopes,
and counts that are not positive safe integers. The initial
adoption inventory and actual remaining counts must be reviewed with the
local diff; the presence of this file is not completion evidence.

Adoption snapshot on 2026-09-16: **16,205 accepted findings in 391 files**.

| Rule                            | Accepted count |
| ------------------------------- | -------------: |
| `shadcn/no-restyle`             |          9,919 |
| `shadcn/no-raw-colors`          |          4,062 |
| `shadcn/no-arbitrary-values`    |          2,005 |
| `shadcn/require-static-classes` |            107 |
| `shadcn/no-unknown-classes`     |             87 |
| `shadcn/no-inline-styles`       |             25 |

The initial unprofiled inventory contained 18,793 findings. The final adoption
separates permanent authoring/runtime/discovery boundaries from remaining
legacy consumer appearance, color, scale, and analyzer debt. This integration
does not claim that existing UI styling has been fully cleaned up. The native
file is authoritative after deliberate pruning; this table records adoption.
The final prune removed 33 findings for the sanctioned easing variable and
pinned-table border seam, after adding narrow allowances and regression tests.

Normal lint and CI must never enlarge accepted debt. Pruning is deliberate
after a complete run covering the recorded scope; a scoped clean run does not
prove unvisited entries obsolete. Review raw findings in changed code.
Per-file/per-rule counts are not identity-level guarantees: replacing an old
violation with a new one can retain the same count.

Do not hide findings by moving styling to uninspected CSS, adding opaque class
construction, broadening layout contracts, or disabling a product surface.
An owned control's dimensions, focus, hover, and press behavior are not ordinary
placement just because an analyzer categorizes them as layout.

## Existing role responsibilities

- **Implementer/builder or repair worker:** inspect the shared API, run scoped
  lint, preserve intended behavior, and expand to consumers after shared changes.
- **Test author:** use exported Core configs; cover positive, negative, and
  exception cases for all six rules, discovery, aliases/wrappers, and debt.
- **QA Foreman/reviewer:** inspect lint evidence, discovery health, scope,
  visual behavior, and changes to tokens, contracts, exceptions, and debt.
- **CI watcher:** surface the existing lint/verification failure with rule IDs,
  file locations, and setup diagnostics. Do not change design policy.
- **OpenSpec guardian:** compare durable intent, this workflow, executable
  policy, and actual acceptance evidence; active changes are not shipped proof.
- **Orchestrating agent, when present:** use these deterministic commands and
  pass the relevant evidence to the existing reviewer. Do not introduce an
  agent, MCP service, or second policy merely to run lint.

The checkout has `qa-foreman`, `ci-watcher`, `openspec-guardian`, and
`thermo-nuclear-code-quality-review` definitions. Builder, test author, repair,
and orchestration describe responsibilities; they do not imply additional
implemented agents or permission to auto-invoke explicit-only skills.

## Discovery compatibility decisions

Upstream [issue #6](https://github.com/shadcn-ui/lint/issues/6) affects 0.1.0:
its CSS comment stripper treats `/*` inside quoted `@source` globs as a
comment delimiter. Core's original ordering hid theme tokens from analysis.
The same shared source directives now sit at the end of
`packages/ui/styles/globals.css`, after declarations. No source pattern,
token, or style declaration changed; source directives do not affect cascade
order. The focused regression test compiles the actual PostCSS/Tailwind graph
and verifies identical output before and after the move.

`packages/missionary/styles.css` is a real shared-theme re-export consumed by
the missionary app, and is exported by the missionary package. It gives that
web-UI workspace a genuine CSS entry point without an app `components.json`
or duplicate theme. Compilation parity covers this import path too. The
five workspace themes discover the shared semantic tokens.

Known 0.1.0 analysis boundaries require explicit review:

- Canonical package imports, renamed exports, physical forwarding wrappers,
  and same-app relative/mixed barrels are covered by the resolution suite.
  Stock 0.1.0 loses shared ownership through a local barrel when the app has
  no `components.json`. Core's pinned Bun compatibility patch fixes that
  resolution gap by consulting the resolved definition's owning component
  index. An unrelated same-name export remains unrecognized.
- [Base UI render composition (#20)](https://github.com/shadcn-ui/lint/issues/20)
  can attribute caller styling to the trigger instead of its rendered Button.
  Prefer the rendered element's actual variant/API; do not broadly unlock
  triggers merely to silence a diagnostic.
- Tailwind-valid custom utilities may lack an appearance category
  ([#4](https://github.com/shadcn-ui/lint/issues/4)); contracts need exact
  semantics. General CSS wildcard-export and symlink-resolution reports
  ([#9](https://github.com/shadcn-ui/lint/issues/9),
  [#15](https://github.com/shadcn-ui/lint/issues/15)) motivate testing the real
  Core graph on upgrade rather than assuming every package layout is supported.

## Discovery, limits, and upgrades

A clean exit alone is insufficient. Acceptance must prove shared component
imports resolve, actual theme tokens load, and Tailwind-backed checking rejects
an invalid variant such as `hovr:flex` on plain HTML.
`tooling/eslint-config/health.mjs` checks all six effective rule severities,
a `Button` padding violation whose message includes the real `icon-xs` size,
semantic tokens, `press-feedback`, typography `prose`, `animate-in`, and
loaded editor classes `tiptap`/`node-columns`. Missing definitions or theme
imports and grammar fallback cannot satisfy these probes. The synthetic
`lintText` inputs alone disable parser project lookup; normal source keeps
its type-aware parser configuration.

The lint subprocess preserves stderr and treats the exact upstream
`[@shadcn/lint]` operational-warning prefix as setup failure. Health errors
identify the workspace and failed capability. Do not equate `--max-warnings`
with operational-warning handling or globally patch logging.

After changing exports, theme/imports, aliases, component configuration, or
the package version, restart long-lived editor ESLint processes and perform
an uncached health/compatibility check. The wrapper rejects ESLint file
caching; selecting a workspace does not prove
an unchanged consumer was reanalyzed.

Analysis does not replace review of ordinary CSS, descendant-selector effects,
opaque spreads, imported class expressions, locally recreated components, or
accessibility. Retain token-drift's CSS coverage, shadcn configuration/registry/
diff checks, Shadscan, motion checks, and browser/a11y verification.

For a dependency upgrade, inspect the published release/exports and official
docs, compare rule categories, contract inheritance, discovery and supported
toolchain, then rerun the compatibility/cache suite and review raw findings.
Pin the vetted release and review minimal lockfile changes. Reassess the Bun
compatibility patch: remove its `patchedDependencies` entry and patch file
only when the upstream release passes the same relative/mixed-barrel and
unrelated-component regressions unpatched. Otherwise rebase the narrow fix,
review its source diff, and repeat a frozen install plus the full suite.

Rollback removes the integration's dependency, its `patchedDependencies`
entry/patch, exported policy, lint/task wiring, debt acceptance, and matching
instruction changes together. Preserve
existing complementary guardrails. No production secrets, app startup,
registry fetch, or paid external service is required for installed linting.
