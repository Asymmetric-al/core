# Shadscan 100/100 Implementation Plan

> **For implementation:** Use Core's canonical TDD, accessibility-review, Vitest,
> and shadcn skills. Continue the authorized repairs in small slices. The future
> product decisions below require an explicit owner decision before changing
> accepted publication, theme, or authenticated-preview behavior.

**Goal:** Reach a genuine 100/100 in every applicable category of every deployed
application, while preserving Base UI, exact `base-maia`, tenant boundaries, and
usable product behavior.

**Architecture:** Keep the unmodified scanner report, independently checked app
floors, and evidence ledger. Repair product defects at their owning component;
correct scanner limitations through tested upstream detection rather than
duplicating shared UI or rewriting scores.

**Tech Stack:** Bun, Next.js App Router, React, Base UI 1.8, shadcn CLI 4.21.1,
Shadscan 0.17.0/ruleset 2026.08.46/schema 9, Vitest, Playwright, axe.

## Verified baseline, 4 October 2026

The original full scan at `efa808a27bf81034dae171ea1552fbda45a70867` and the
post-repair working-tree rescan assess 528 rules
across three applications and six libraries. Discovery is complete, with no
truncation. The nine skipped non-React packages are listed in the raw report.
The pooled application score is **48/100**. Library scores remain separate.

| Area              | Pooled | Admin | Donor | Missionary | Target per app |
| ----------------- | -----: | ----: | ----: | ---------: | -------------: |
| Foundation        |     64 |    72 |    60 |         60 |            100 |
| Interaction       |     22 |    26 |    13 |         26 |            100 |
| States            |     39 |    25 |    57 |         38 |            100 |
| Accessibility     |     48 |    40 |    64 |         43 |            100 |
| Forms             |     50 |    33 |   100 |         63 |            100 |
| Production polish |     81 |    71 |   100 |         71 |            100 |
| Overall           |     48 |    43 |    59 |         47 |            100 |

There are 51 remaining scored application failures: 39 scanner limitations and
12 accepted product choices. All 119 scored failures including libraries have
exact entries in `tooling/shadscan/findings.json`: 56 scanner limitations,
12 product decisions, and 51 findings about application features in libraries.
The classification is an evidence claim to keep testing; it does not turn a
failing raw rule into a pass or prove all routes are defect-free.

The raw catalog cannot currently produce 100 while preserving all current
contracts. Even if all 39 application scanner limitations were corrected, a
planning calculation leaves admin at about 90, donor 85, and missionary 82
because the 12 product choices still fail. These are **projections**, not scan
results. A plan that promises 100 from only component updates is inaccurate.

## Task 1: Finish the concrete audit repairs

**Files:** `packages/ui/components.json`,
`tests/unit/scripts/shadcn-registry-smoke.test.ts`,
`apps/admin/src/cms-ui/web-studio/shell/studio-nav-rail.tsx`,
`tests/unit/cms/web-studio-nav-rail-semantics.test.tsx`, root/admin manifests and
`bun.lock`, `apps/donor/app/(public)/(hero)/about/page.tsx`,
`tests/e2e/public-about-layout.spec.ts`, and the affected production browser tests.

1. Repair registry authentication at the existing shared configuration. Keep
   `{style}` in Studio and Blocks endpoints, forward the actual private
   launcher's variable names, and preserve every existing registry and alias.
2. Test a missing credential and an available credential through the existing
   smoke planner, then perform real read-only CLI/MCP calls. Never put keys or
   resolved signed URLs in source or evidence.
3. Keep RecentDocs navigation as a native named link. First reproduce the
   incorrect button role; then prove the same href and Payload router behavior.
4. Upgrade the two direct vulnerable Sharp resolutions to the smallest currently
   patched release, 0.35.5. Prove the installed native decoder floor and current
   Payload resize/metadata behavior with harmless image fixtures. Preserve
   unrelated lock entries. Default-branch Dependabot closure requires merging.
5. Repair stale production-test accessible names through actual rendered
   controls, preserving every width/theme case and restoring-focus assertions.
   Preserve the 95-test release inventory. Diagnose remaining failures before
   changing job scheduling or timeouts.
6. Separate preflight and production report paths and expose incremental
   progress, so a killed production run cannot leave a misleading preflight
   report as its apparent result.
7. Review only the affected ledger proofs after these changes; stale proof must
   keep failing until reviewed. Run focused tests, the real full scan, relevant
   native/browser checks, and `bun run ci:preflight -- --full`.

The donor About follow-up preserves its page content and layout-owned main/skip
target. All six existing browser cases passed after removing the nested main.
The old `verify:shadcn-diff` command is repaired: CLI 4.21.1's deprecated
`diff button` reported no updates while supported `add button --diff button.tsx`
returned concrete changes. Preserve the CI command, but replace that false parity
claim with complete modern previews and explicitly reviewed customizations. The
review baseline must account for all 53 installed shared components and every
affected file, fail on changed/missing evidence, and preserve Core's native-submit,
label, focus, portal and theme contracts. The modern production entry point
passed all 53/54 previews; independent replay and 26 focused tests also reject
omitted supporting-source coverage. This baseline preserves reviewed differences,
rather than asserting stock byte parity. A final independent negative probe
caught proof-file content changing without rejection. The repaired schema-2
baseline now hashes all 118 cited proof files as a complete sorted inventory;
changed, missing, substituted, duplicate or incomplete proof fails validation.
Thirty-seven focused tests cover this contract, including baseline self-reference
rejection. Existing CLI preview data and local customizations are preserved.

The deeper manual pass also repairs defects outside scored failures:

- Missionary donor task deletion uses a named Base UI confirmation with initial Cancel
  focus, cancellation/return focus, a pending guard, and recoverable failure.
  The same actual DOM tests prove no DELETE on Cancel/Escape and one DELETE
  during deferred repeated activation. The task hook/API/tenant checks stay owned.
- Donor Feed error/empty states are h2 below the page h1; worker identity is
  metadata rather than a heading preceding the optional post h2.
- Inert Feed Follow/menu/sharing controls are hidden, including their mock share
  URL. Only All/Update/Saved are exposed because the server post DTO has no
  content-category discriminator; each active filter exposes `aria-pressed`.
  Real ReactionBar content/relationships and the donor-local bookmark/Saved
  behavior remain. Reintroducing sharing requires a real permitted destination;
  new categories require an owned type mapping.
- Public footer sections are h2. Unconfigured social links are hidden, and the
  social row wraps for future valid profiles. The real composed About page
  reproduces the former 34-pixel desktop footer overflow; six retained
  viewport/motion cases now require no whole-document overflow, no placeholder
  social destinations, one main landmark and a working skip link. The two
  cross-app platform links that incorrectly returned to the donor homepage are
  hidden until real app origins are configured; donor-portal destinations remain.

- Support suggestions use the actual named multiline editor as their focus owner.
  Its active-descendant/autocomplete/controls relationships are restored on
  cleanup without removing attributes another feature now owns. Keyboard
  navigation keeps the active option visible without moving document or editor
  focus. Suggestions use semantic Maia tokens; their former heading/description
  contrast failures are repaired. Fourteen focused units and twelve browser
  cases cover actual controlled-editor updates in all four viewport/theme states.
  The adjacent input fixture retains all of its original interaction assertions.
- The contribution detail sheet, mobile cards and desktop date column preserve
  SQL calendar gift dates through the existing locale formatter. A date such as
  `2026-10-03` remains October 3 in Los Angeles. The API's absent-gift-date
  timestamp fallback still projects into the visitor's timezone. Eight tests in
  each of UTC, Los Angeles, Bangkok and New York prove the three display paths
  and actual mobile/desktop hydration, alongside 115 adjacent regression tests.
  No financial source facts, API shapes or authorization logic change.

The eight-item Support suggestion popup exposes a specific axe 4.11.2 heuristic
limitation: its scrollable listbox matcher exempts combobox ownership, but does
not recognize a multiline textbox with `aria-controls`/`aria-activedescendant`.
The actual textbox owns focus and keyboard scrolling. Raw reports are retained;
the test asserts exactly one known rule/node at this state and rejects additional
findings. The ordinary resting editor and filtered two-item popup have no axe
findings. No global axe exclusions, role substitutions or extra tab stops were
added, and this bounded limitation is not a general accessibility clearance.

The source audit also emits 27 application advisories beyond scored failures.
Review them individually: dynamic alternative text/labels/groups/dialog titles,
opaque projected navigation, actual confirmation/undo, heading hierarchy,
computed contrast, target size and rendered overflow. Target-size source counts
are inventories rather than proof. Completing the route/state matrix below is
required before claiming all of these advisory families are clear.

## Task 2: Correct scanner detection, one rule family at a time

**Files:** exact finding evidence and `verificationTests` in
`tooling/shadscan/findings.json`; existing regressions under
`tests/unit/apps/shadscan-framework-contracts.test.tsx`,
`tests/unit/scripts/shadcn-config-guardrails.test.ts`, and
`tests/fixtures/base-ui-compliance/specs/`. Prepare secret-free minimal upstream
fixtures separately; do not patch scores in Core's report processor.

For each family: extract one small positive fixture from the real component,
add a negative fixture with the behavior removed, reproduce the current engine
error, correct upstream detection, and prove both fixtures plus the full rule
suite. Pin a released tested scanner and review its schema/catalog before
updating Core. An upstream proposal without a published compatible engine does
not clear the raw failure.

| Area and app failures | Detection work                                                                                                                                                  | Required acceptance                                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation: 8         | Resolve the shared `packages/ui/components.json` through workspace ownership; recognize supported `global-error.tsx` and `global-not-found.tsx` boundaries.     | All three apps pass config/recovery rules; an app without a reachable config or usable boundary still fails.                                                    |
| Interaction: 6        | Trace imported Mission Control command/search, guarded shortcuts and mobile navigation; distinguish substituted focus treatment from a removed focus indicator. | The actual shared components pass; unnamed triggers, unguarded shortcuts, absent navigation and invisible keyboard focus still fail.                            |
| States: 10            | Follow mounted shared Sonner/providers, typed pending state, reusable Empty, and framework recovery links.                                                      | Deferred mutations, empty results and recovery remain usable; removing the mounted provider, pending feedback or recovery makes the corresponding fixture fail. |
| Accessibility: 11     | Resolve Base UI `render`, context labels/titles, forwarded props, and named shared wrappers.                                                                    | Rendered names, descriptions, announcements and keyboard operation agree with detection; removing a label/title/live region is caught.                          |
| Forms: 4              | Follow TanStack Form/Zod wiring, `LabeledField`, shared error association, and forwarded autocomplete.                                                          | Invalid submissions are blocked, errors identify their controls, personal-data autocomplete reaches the input, and broken relationships still fail.             |

The 39 application cases are enumerated by project/rule in the existing ledger.
The same correction must also repair the 17 corresponding library scanner
limitations where applicable. Library application-shell findings remain visibly
out of scope for pooled application scoring; adding theme providers and social
cards to a type or data library is not a remediation.

## Task 3: Resolve the 12 product decisions explicitly

**Files:** app theme providers/layouts, shared command/navigation composition,
admin CMS preview/loading boundaries, redirect pages, metadata, and the owning
OpenSpec requirements. Inspect exact source paths in each ledger proof before
choosing a change.

| Rule                                                     | Apps              | Decision needed to reach raw 100                                                                                                                                                                                             |
| -------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme-hotkey-present`                                   | All three         | Keep forced light and obtain upstream applicability support, or approve a usable theme switch and guarded shortcut. Maia remains the visual style in either theme. A shortcut that does nothing is not acceptable.           |
| `command-menu-present` and `command-menu-hotkey-present` | Donor, missionary | Approve a useful permitted-navigation command menu, or obtain upstream applicability for products that deliberately omit it. Do not add demo commands, privileged results, or shortcuts that intercept editing.              |
| `route-loading-boundary-present`                         | Admin             | Recognize the deliberate authenticated preview Block boundary alongside existing create/gallery loading, or approve a separately reviewed streaming change. Preserve draft/access checks and request-time ownership.         |
| `suspense-fallback-useful`                               | Donor, missionary | Recognize invisible redirect-only siblings as intentional, or approve a user-visible redirect/loading redesign with instant-navigation proof. Do not expose an unnecessary flashing loading screen solely for the heuristic. |
| `social-preview-present`                                 | Admin, missionary | Recognize private/noindex publication policy, or approve generic non-sensitive social metadata. Never expose tenant data, CMS drafts or private content in generated cards.                                                  |

Recommended default: preserve the existing owner contracts and improve justified
upstream applicability. Any future applicability adjustment must be a tested,
auditable engine behavior. Locally exempting rules or inventing adjusted scores
does not satisfy the raw 100 target.

## Task 4: Complete rendered and manual coverage

**Files:** actual app router pages, owning layout/component tests,
`tests/e2e/accessibility.spec.ts`, and the existing browser fixture specs.

The initial router inventory contains **101 page sources**: admin 60, donor 26,
missionary 15. This counts source route shapes, not 101 verified screens. Record
parallel/intercepted routes, auth/role states, redirects, and dynamic examples
separately. Resolve each dynamic value from existing fixtures or navigation;
never guess tenant IDs or slugs.

1. Maintain a route matrix with source revision, origin, actual page identity,
   final path, HTTP status, viewport, auth/role state, and the exact check run.
2. Run Shadscan rendered checks in batches of at most ten concrete pages at
   320x820 and 1440x1000. The overflow result has no score and cannot raise the
   source score. A timeout/redirect/login fallback is not a verified intended
   page. Resolve fake-environment dependencies before declaring a product bug.
3. Add real keyboard/focus, contrast, reduced-motion, long-content, validation,
   and modal tests at the owning flows; axe complements manual verification.
4. Use read-only deployment metadata to establish each production origin and
   revision. Test previews and production as separate environments. Existing
   exact-head preview smoke is valuable but does not verify every route.
5. Never seed, publish, reset, or mutate hosted data for an audit. Stop only
   servers started by this audit.

The initial isolated login overflow checks pass for all three apps at both
viewports. The donor root batch timed out under placeholder services and remains
an operational coverage gap. Authenticated routes and production overflow remain
unverified in this initial rendered pass.

## Task 5: Audit the broader design debt without bulk restyling

**Files:** the source files identified by the token-drift report and existing
design-system lint suppression/cleanup ledger; shared semantic tokens remain
owned by `packages/ui/styles/globals.css`.

The current report-only token audit is not clean. Review each hit against Core's
central brand/status/chart exceptions and authoring boundaries before calling it
a defect. Repair confirmed palette violations in small component batches with
before/after contrast and visual evidence. Preserve financial status meaning,
brands, maps, chart series and protected vendor sources. Do not turn report-only
exit 0 into a claim of zero findings, and do not add suppressions to reach 100.

The initial report scanned 716 files and found 2,305 raw palette hits, of which
1,973 are reportable: admin 1,185; donor 387; missionary app 253; missionary package
146; shared UI 2. The remaining 332 match existing allowances, including 269
path-based brand allowances that also deserve manual review. These are audit hits,
not 1,973 independently verified defects. The two reportable shared hits were
`text-zinc-900` and `text-zinc-500` in `packages/ui/components/page-header.tsx`.
They are repaired with semantic foreground/muted tokens. Actual computed CSS
reproduced 1.118:1 dark heading contrast before the change and passes afterward.
Eight viewport/theme/description cases also prove the existing mobile two-line
preview and full desktop text. The invalid `sm:truncate-none` is replaced with
`sm:line-clamp-none`; only its three resolved lint suppressions were removed.
The final source refresh scans 725 files and finds 2,282 raw palette hits:
1,950 reportable and the same 332 heuristic allowances. The reportable review
queue is admin 1,172; donor 379; missionary app 253; missionary package 146;
shared UI zero under this particular regex. Shared UI zero does not prove all
classes or rendered states are correct. Across the completed Header, Feed and
Support changes, only 61 resolved legacy lint counts were removed; no new
suppressions were introduced.

The fresh configured React Doctor audit examines 1,349 files across eight
first-party targets. It reports **40 findings: 4 errors and 36 warnings**. The
prior full audit had 41 findings. Confirmed task compiler, gift calendar-date,
and Support focus-owner diagnostics are resolved; two new Support callback
warnings describe external ARIA DOM synchronization and were source-reviewed.
Scoring and supply-chain upload are disabled; no score is claimed. Remaining
findings include maintainability work, compiler readiness warnings under the
scanner's inference mode, a separate publication timestamp review, and reviewed
scanner/generated-source false positives. Keep these distinct from confirmed
runtime failures; do not globally ignore them to present a clean audit.

After each behavior or visual slice, run scoped lint/typechecking and appropriate
browser evidence; run changed-source React Doctor. A full-source diagnostic audit
and changed-source audit are distinct coverage claims.

## Task 6: Ratchet genuine 100 and verify delivery

**Files:** `tooling/shadscan/policy.json`, `tooling/shadscan/findings.json`,
`scripts/verify/shadscan*.mjs`, their existing unit tests, and
`.github/workflows/shadscan.yml`/the main CI integrity gate.

1. Upgrade only to an installable, tested published scanner. Capture its exact
   engine/ruleset/schema and a complete report; inspect every changed finding.
2. Verify each app independently has 100 overall **and** 100 in all six
   applicable categories. A rounded pooled 100 is insufficient if an app or
   category still has a scored failure.
3. Set all three protected app floors to 100 only after the real full scan
   reaches them. Extend the existing policy tests first to reject any category
   below 100 when the final target is activated. Do not lower existing floors.
4. Require no unresolved confirmed defects, complete route/role/environment
   coverage or explicit unresolved gaps, passing relevant native/UI tests, full
   preflight, exact-head required CI, and exact-head preview smoke.
5. Reconcile review threads, current PR head/base and provider limitations before
   claiming delivery. Do not label skipped bot reviews as successful reviews or
   local fixes as deployed production behavior.

Current commands:

```sh
bun run verify:shadscan
bunx vitest run tests/unit/scripts/shadcn-registry-smoke.test.ts --maxWorkers=2
bunx vitest run tests/unit/cms/web-studio-nav-rail-semantics.test.tsx --maxWorkers=2
bun run test:e2e:base-ui
bun run test:e2e:production-gate
bun run verify:openspec-deltas
bun run ci:preflight -- --full
```

Current primary references:
[Shadscan source audit and rendered checks](https://www.shadscan.com/docs),
[shadcn CLI](https://ui.shadcn.com/docs/cli),
[shadcn MCP](https://ui.shadcn.com/docs/mcp),
[Base UI composition](https://base-ui.com/react/handbook/composition),
[Blocks style-aware registry](https://www.shadcnblocks.com/docs/shadcn-cli/overview),
[Studio registry configuration](https://shadcnstudio.com/docs/getting-started/how-to-use-shadcn-cli).

The website currently advertises Shadscan 0.17.1; the npm registry still resolves
latest to 0.17.0. Its published code/report is authoritative for this audit.
Provider authentication does not prove every paid item is entitled or compatible.
UI Kit's returned dashboard/reference styles include Radix Nova/Luma; preserve
Core wrappers and review any selected adaptation before installation. No vendor
components were installed by this inspection.
