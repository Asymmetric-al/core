# Shared UI and utility upgrades

This checkpoint upgraded six libraries across 20 declarations in seven workspaces.
[Core PR #2190](https://github.com/Asymmetric-al/core/pull/2190) merged as
`e29b7c4f4f2e30cab456f7a047944c2998477dca` from qualified head
`3e33a371356bea237d16eaa52209ed57f6a8d23f` after required CI/review reconciliation
and all three exact-head hosted smoke projects passed. The
[release readback](ui-utilities-release-readback.json) records Main post-merge CI
success and CI Integration success at the exact merge commit. The wider UI and
modernization scope remains in progress; later Dnd or combined-lock gates are
separate.

| Library                | Previous | Merged UI version |
| ---------------------- | -------- | ----------------- |
| cn                     | 0.4.0    | 0.5.0             |
| lucide-react           | 1.52.0   | 1.61.0            |
| MapLibre GL JS         | 6.13.0   | 6.15.0            |
| Motion                 | 14.0.0   | 14.6.0            |
| nuqs                   | 2.10.1   | 2.10.2            |
| react-resizable-panels | 4.14.2   | 4.14.8            |

[Release metadata](ui-utilities-releases.json) binds official registry responses,
upstream owners and exact pins. The unchanged
[prepublication qualification](ui-utilities-qualification.json) retains its dated
lock, checks, reviews and then-open work. The later
[release receipt](ui-utilities-release-readback.json) records completed PR/preview
qualification, merge identity and both successful post-merge workflows.

## Behavior and design system

Product component implementations, shared ownership, exact `base-maia`/Base UI,
Zinc semantic CSS-variable tokens and motion policies are preserved. The current
Node 24 runtime satisfies cn's newer Node 22 minimum. Shared cn keeps its complete
runtime tables; transparent backgrounds and gradients coexist in the actual
rendered regression. Existing `@shadcn/lint` still requires cn 0.4.0 exactly for
its separate tooling runtime. Core UI uses 0.5.0; no override forces the linter
onto a different API. Core tooling maintainers own that supported upstream pin,
and every owning-parent or class-merging usage change triggers requalification.

The offline browser fixture imports the actual shared map, panels, URL-state
hook, theme provider, Motion preset and controls. It uses real MapLibre WebGL2,
its same-origin worker/shared modules and worker-parsed local GeoJSON; no map
stub is used in this checkpoint. The existing map's unrelated older fixture
stub retains its narrower original role. Keyboard zoom, marker rendering and
light/dark style and explicit paint changes pass without external requests.
The fixtures use distinct background/circle palettes; the test observes actual
MapLibre paint values and independently checks both sides of the theme toggle. Headless Chromium uses
explicit SwiftShader for this trusted offline fixture; device-GPU performance
is a separate measurement.

Panel checks require keyboard movement, focus preservation and both sides of
the 20%/80% Home/End boundaries. URL checks exercise rapid search updates,
pagination, sorting, visibility, history and reset while preserving unrelated
parameters. Motion and class-merging checks run across desktop/mobile,
light/dark and reduced-motion projects. Axe checks cover the real controls.
The outside-workspace fixture resolves the public nuqs adapter from the owning
UI workspace without adding unused root dependencies; CSS declarations stay
precise to the imported stylesheet.

## Dated local qualification

The merged UI checkpoint's baseline checks passed 37 cases across eight unit files and 20 browser cases.
The final frozen cold install passes the same 37 unit checks and fixture typecheck.
Full preflight passes all 15 typechecks, all three app builds, 912 unit files and
7,583 tests, with one expected failure, four skipped tests and two skipped files.
The complete browser matrix passes 259 cases with five existing skips.
React Doctor passes all eight targets with zero actionable findings and the
same 294 exact exceptions. The independently reviewed refresh changes 109
support hashes in 96 existing records and two manifest source/context hashes;
identities, reasons and reconsideration conditions are preserved. Shadscan keeps
118 finding records, its 48 pooled score and all application floors; only 32
reviewed supporting hashes changed. No exception or score floor was added.

## Nested graph and security

Normal Bun resolution refreshes four inherited compatible leaves:
baseline-browser-mapping 2.11.30, Immutable 4.3.9, caniuse-lite 1.0.30001819 and
Next/PostCSS's Nano ID 3.3.20. No manifest, override or patch was added for them.
All selected children are current within the actual owning-parent constraints.
The six libraries' dependencies-only closure has 35 entries; including peers
expands it to 118 and reaches the inherited Next/Sass chain. Three inherited
advisory pairs were removed, with zero introduced or worsened pairs.

Braces 3.0.3 remains an open advisory through inherited glob and watch parents.
Static triage confirms the affected AST walkers and caller edges; repository
input control and complete deployment boundaries still need qualification.
Sass disables watch globbing, and the inspected Next file traces do not include
the affected package, but these facts do not close the other build/tool paths.
No unreachability exception is granted. At the UI qualification lock, the
whole-Core audit recorded 81 range records across 33 names and 70 unique
advisories; exact lock filtering found 56 affected entries. These are dated
counts, not qualification of later lock changes. Braces reachability, whole-Core
security/SBOM and combined release qualification remain open.

## Remaining UI work

Official [dnd-kit legacy installation guidance](https://dndkit.com/legacy/introduction/installation/)
classifies the six-library checkpoint's baseline Dnd API as legacy and
recommends the new API. Current first-party replacement and the retained
upstream CMS internals are tracked separately. The [official migration guide](https://dndkit.com/react/guides/migration/)
requires a coordinated provider, sensor, sortable and event migration.
The [Dnd API migration](dnd-kit.md) tracks the installed coordinated 0.5.1
first-party replacement. Its recorded strict/full gates and behavior evidence
are dated prior-base results; full browser requalification after merging this UI
checkpoint passed 299 cases with 5 existing skips. Owner compatibility, prepush,
PR/current-head CI/review,
hosted previews and merge qualification remain required;
the old package's latest dist-tag does not close this finding.

Current Lighthouse CI 0.15.1 still selects Lighthouse 12.6.1 and affected nested
software. Its owning chain requires replacement or removal of obsolete tooling
while preserving performance budgets. Existing current-version UI families also
retain their final ownership/behavior qualification obligations. Telemetry,
sanitization, email, browser payments and AI remain separate checkpoints.

## Preview qualification history

The map-paint review fix at `61b709ac` passed CI, but its fresh hosted admin
build was canceled by the normal ignored-build comparison with the preceding
product build. Older successful previews therefore do not qualify that head.
A dashboard retry with the ignored step disabled reached compilation and
confirmed an 8 GiB memory failure; hosted admin QA must retain Turbo.

The follow-up adds a SHA-bound, nonsecret build marker for explicit QA
Previews. The ignored-build helper requires the known app, Preview target,
matching provider commit and actual Git HEAD. Normal automatic build decisions
are preserved. At `cd445c9f`, all three hosted ignored-build logs confirm the
marker matched, all three exact-head deployments reached READY, and all three
QA projects passed in run 39821034649.

Review then identified a retry case: allowing deployment deduplication could
reuse an earlier canceled same-SHA build before the marker executes. Explicit
QA requests therefore retain `forceNew=1`, plus mandatory identity readback and
bounded owned cleanup. The strengthened request assertion failed before this
fix; all 132 related cases pass afterward, including production/mismatch denial,
immediate READY identity checks and CANCELED rejection. The earlier successful
head remains dated evidence. The corrected head `3e33a371` subsequently passed
all four required checks and three exact-head READY Preview deployments, each
with the fixed marker log; all three smoke projects passed in run 39830825499.
The [release receipt](ui-utilities-release-readback.json) binds those results,
all 31 changed-path remote/review identities and the identical develop merge
tree. Both post-merge CI workflows passed; the release receipt binds the
independent live provider readback. See the corrected [Preview QA runbook](../../qa/pr-preview-smoke.md).
