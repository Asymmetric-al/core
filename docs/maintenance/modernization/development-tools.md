# Development tools checkpoint

Tracking: [AL-1965](https://github.com/Asymmetric-al/core/issues/1965).
This checkpoint is qualified and [merged in PR #2176](https://github.com/Asymmetric-al/core/pull/2176)
at `8906631256bc1dd95d4d7ba8c11a7409d3763161`. Infrastructure, provider, data and
final advisory work remain open.
[Exact versions and qualification state](development-tools-qualification.json)
are the machine-readable record.

## Changes and compatibility

The installed cohort moves ESLint to supported v10, updates its compatible
plugins and rebases the owned Shadcn lint patch against published 0.2.3.
The [patch review and removal criteria](../../ai/skills/moai-library-shadcn/references/design-system-lint.md)
record current upstream provenance, all five repairs and conservative ownership
regressions. Real new analyzer findings use shared presentation APIs rather
than wider exceptions. Native and router links keep their link semantics.

Prettier, Turbo, Vite, Vitest, jsdom, Playwright, axe, Shadcn, agent-browser,
React Doctor, Canvas and PostCSS use exact reviewed pins. Browser downloads
match Playwright 1.64.1; Chromium, Firefox and WebKit each launched and executed
a named-control smoke test. Native Canvas drawing, pixel readback and PNG
encoding pass on Node 24.22.1. Three application builds and browser behavior
remain qualification requirements; browser-engine smoke alone does not prove
the applications work.

Vitest 5 uses native ESM configuration and explicit `.mts` implementation
imports. Two old `.ts` helper paths remain thin re-exports because frozen
historical source probes consume them. Historical evidence bundles are not
rewritten. The supported, exact-version Vitest V8 provider replaces the legacy
raw collector that manufactured unmeasured percentages. Isolated-suite merging,
TypeScript locations, deliberately uncovered branches/source and actual
threshold failure now pass regression checks. Reports describe imported-source
coverage; historical reports are unchanged. Test scope, mock isolation and
importer-aware aliases remain in force.

Product workspaces continue compiling with current TypeScript 7.0.2. The
maintained TypeScript 6.0.3 JavaScript API remains solely for AST/parser tools
and the editor SDK. `verify:workspace-contract` enforces physical parser/API
identity, the actual native `tsc` executable, and all 15 product workspaces.
A valid compilation and a deliberately invalid assignment prove execution.
Node types stay on the maintained Node 24 line, matching the approved runtime.

Explicit `ASYM_USE_CI_ENV_DEFAULTS=1` makes the Node environment loader skip
local files. Synthetic fixtures prove that loader boundary; normal reuse and
explicit `0` preserve existing precedence. Bun can load environment files before
the loader runs, so the flag alone does not clear previously inherited inputs.
Full qualification used a clean CI fixture environment by temporarily detaching
and restoring this owned checkout's environment symlink. Its opaque target was
never read or copied, and the primary checkout was untouched.

## Evidence and remaining work

Focused regressions cover analyzer provenance, owned control variants,
keyboard/focus, real editor JSON, FAQ panel behavior, CMS link navigation,
calendar selection, hermetic fixtures, compiler boundaries and measured coverage.
A raw scan of 1,246 UI files found no suppression increases or other errors;
pruning reduced the legacy count from 4,865 to 4,825. Existing debt remains
explicitly tracked. The six-rule policy and quality floors are unchanged.

[React Doctor requalification](react-doctor-requalification.md) records all
old/new findings, implemented corrections and exact exception evidence. Native
Rules of Hooks cover plain TypeScript in all eight targets, and Next app-root
discovery works from either cwd. The new PDF/task browser contracts pass all
eight cases with script-disabled preview frames and strict runtime-error guards.

The full preflight passed all repository gates, all three app builds and 893
unit files (7,258 tests passed, one expected failure, four tests and two files
intentionally skipped). The combined browser matrix passed 223 tests with five
existing intentional skips. Strict React Doctor scanning completed all eight
targets with zero actionable findings and 294 exact reviewed exceptions.
The agent-browser CLI also passed navigation, snapshot, form interaction and
output checks against an isolated local fixture, then closed its own session.

Independent review identified a newly owned ESLint brace-expansion advisory.
A selective Bun refresh moves minimatch to 10.2.6 and brace-expansion to the
patched 1.1.21, 2.1.7 and 5.0.12 lines within existing parent ranges, without
manifest changes or overrides. The subsequent audit no longer reports
brace-expansion. Remaining affected families are tracked for their migrations
and final advisory reconciliation; current pins alone do not prove safety.
The final lock refresh passed the normal push gate and current-head CI.

A fresh frozen installation and workspace/imported-package identity checks passed
without lock drift. Exact-head CI, full E2E, all three READY deployed previews,
authenticated preview smoke and independent public/guard/login checks passed.
The complete REST changed-file set equals all 280 local paths. No unresolved
GraphQL review threads or REST review comments remained. CodeRabbit skipped the
large diff because of its file limit; complete independent reviews and immutable
source-tree/delta reconciliation supply the actual review coverage. Documentation formatting is committed separately
from substantive policy edits; canonical skill changes are followed by generated
mirror synchronization.

CLI/MCP/protocol, Actions, integration/restore PostgreSQL and Supabase parsing
work follow in their own infrastructure checkpoint. This tooling update does
not claim those items or final dependency security closure.
