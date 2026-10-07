# Core UI verification — AL-1967

This record distinguishes source coverage, component contracts, observed app
states, and productive backend workflows. The preserved baseline is
`f49fc2e03bce9246f5d3dc22c16d0a6c794a8304`; the implementation uses a separate
worktree and does not discard the original checkout's uncommitted work.
The final source stack integrates approved upstream `develop` commit
`180dde9e41b849e0c3a649aeef8989f3974bf4cd` and its Next.js 16.4/admin refresh
changes. Those are inherited upstream changes, not a framework migration in
this UI task. The independent [integration review](./sources/upstream-integration-review.md)
records all seven overlapping source files and preserved regression tests.

## Coverage and implementation

The [coverage index](./coverage-index.json) contains 165 explicit source-disposition
joins for routes, layouts, state files and documented shared/global families.
It includes 60 admin pages, 26 donor pages, and 15 missionary pages, plus overlapping
specialized renderers. Families overlap concrete files; 165 is not a count of
unique screens. The shared inventory contains 279 source entries:
275 baseline entries and four reusable licensed settings modules. Counts
overlap; barrel reachability and source inspection do not prove every export
or runtime state was mounted.

Shared foundations improve readable page headers, responsive actions,
dialog/sheet dismissal controls, filter popups, field/control naming, table
semantics, upload pending behavior, sidebar shortcuts, stable motion hydration,
and async clipboard feedback. Existing generic Maia controls remain shared.
Purpose-based status, inverse, and media tokens have light/dark values and
contrast evidence; existing global palette, typography, radius, chart, sidebar,
and motion values are preserved.

Actual ReUI Pro settings-7 and settings-11 source supplies a reusable settings
rail, card anatomy, and notification matrix. Donor and missionary retain their
own fields, values, validation, payloads, callbacks, dirty/save behavior, and
panel lifetimes. [Commercial provenance](./sources/ReUI-PRO-PROVENANCE.md)
records exact source/derivative hashes and the owner's explicit confirmation
that a covering agreement permits this public repository's distribution and
contributor access. The agreement itself was not independently reviewed; Pro
source is separate from MIT examples and their notices.

Application changes cover shells, dashboards, public pages, settings, tables,
forms, fallbacks, CMS/Support/studio/Eve chrome, and specialized supported
extension points. The [complete mobile caller review](./sources/mobile-table-consumer-review.md)
found and closed four source defects among all 14 responsive-table consumers:
blank History and Giving cards, and missing Contributions/Support bulk
selection. Existing formatters, actions, actual row state, stable IDs and bulk
payloads remain behind Core's table boundary. Checkout preset controls fill
their grid cells; three public pages provide contrast beneath their existing
transparent navigation; the missionary board stays inside its own scrollbar.

## Deliberate retention

Strong shared Button/Dialog/Select owners are retained. Core's
DataTableResponsive, pinned TanStack beta9 boundary, serialized filters,
manual/server operations, chart abstractions, form stack, editors, routers and
provider boundaries remain. Current ReUI Filters/Data Grid output would entail
state/API changes or a parallel engine; the existing abstractions were improved
selectively. Paid app-shell-18 was inspected and retained as a research
candidate because its composition did not fit Core's forced-light, permission,
tenant, Eve/Web Studio and routing boundaries. Unfinished product scaffolds
remain explicit rather than being activated or filled with invented metrics.

## Checks

Completed local preflight covers the exact integrated source above. The
[preflight record](./checks/preflight.json) and [bounded summary](./checks/preflight-summary.txt)
contain actual results; hosted PR CI is a separate qualification.

| Check                                                                        | Result and scope                                                                                                                                                                   |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITEST_MAX_WORKERS=1 bun run ci:preflight -- --full`                        | Passed all 17 stages on Next.js 16.4: 15/15 lint and typecheck tasks, all three app builds, 851 unit files / 6,752 tests; two files / four tests skipped. Unit duration 637.55s.   |
| Earlier `VITEST_MAX_WORKERS=1 bun run check`                                 | Passed 846 files / 6,705 tests with 15/15 lint/type tasks, preceding the final Giving/map fixes and upstream integration. The later full preflight covers those final changes.     |
| Existing focused Playwright component suites                                 | Baseline 62 passed; after 62 passed across eight existing suites. Captured before upstream integration on Next.js 16.3.8; component fixtures do not qualify productive backends.   |
| ReUI live verifier                                                           | Passed all six checks again after integration: mirrors, registry, client auth/style, MCP/Pro entitlement, discovery/API and paid source retrieval.                                 |
| `verify:shadcn-diff`                                                         | Passed in complete preflight: 53 installed components, 54 explicit diffs, 34 reviewed local adapters and four owned toolkits. Earlier HTTP503 attempts are historical diagnostics. |
| `verify:shadscan`                                                            | Passed: admin43/floor43, donor61/floor59, missionary47/floor47. Existing floors/classifications preserved; one proved resolved entry removed.                                      |
| `check:motion`                                                               | Passed after integration: 2,063 files scanned.                                                                                                                                     |
| `verify:shadcn-token-drift`                                                  | Report-only exit0. All 275 reportable hits across 15 files are evidenced dormant exports; no token-free claim or allowlist expansion.                                              |
| Format, OpenSpec, skills, workspace/data boundary, lock and ESLint contracts | Passed through the complete preflight. Initial nine QA-document formatting findings were corrected before the successful retry.                                                    |

Owner-focused tests, TDD failures and exact later checks are recorded in the
inventories; they overlap and must not be added into a repository total.
The final mobile selection slice passed five suites / 21 tests, donor's late
History slice four suites / eight tests, and missionary's complete owned scope
47 files / 250 tests. Broader verification uses the repository scripts rather
than a different TypeScript invocation or suppressed assertions.

Native ESLint pruning removed only proved resolved debt: 10,611 to 4,867
suppression counts, 376 reduced entries, no increases/additions or policy
changes. Every reduced entry's source changed. Exact proof hashes reflect
reviewed source changes; existing guard coverage, mappings, thresholds and
rationales remain intact. See the [suppression review](./sources/suppression-prune-review.json),
[upstream review](./sources/shadcn-upstream-review.md), and
[scanner review](./sources/shadscan-proof-review.md).

## Browser evidence and limits

[Before](./before-index.json), [after](./after-index.json),
[interaction checks](./after-seam-checks.json), and
[reproduction instructions](./runtime-reproduction.md) identify actual source,
fixtures, dimensions, theme, state and capture hashes. Matching screenshot
review is separate from API/MCP validation and unit tests. Supplemental
fixtures mount actual product components with documented inert runtime
boundaries; they do not replace productive route verification. Captures with
missing motion providers or unsettled chart animation are excluded or replaced
by corrected captures; differing chart capture heights are disclosed. The
638 indexed images comprise 297 before and 341 after captures, including 295
matching filename pairs, rather than unique product workflows. Every image
path, size and SHA matches the recorded file bytes. These captures and the
selected browser suites used Next.js 16.3.8 before upstream integration;
no Next.js 16.4 application browser recapture is claimed.

Placeholder datasource/service credentials prevent productive CRM,
Contributions, Care, Support and missionary-profile qualification, and Payload
database-backed gallery/publication/editor flows. Existing live-query SSR
fallbacks and some route-specific hydration diagnostics remain baseline
limitations. Missionary task-pending browser state and provider-backed profile
photo behavior are unverified. Fresh matching map mounts render actual geography
at both widths, with reachable Back/Search controls and verified keyboard/touch
search, clearing and focus restoration. Earlier blank captures are retained as
inconclusive diagnostics. Productive location-selection workflows remain
unverified because local records are unavailable.
No production records, payments, auth redesign, schema changes, hosted mutations
or deployment operations were used to close these gaps.

The current chat does not expose native ReUI/shadcn MCP tool handles. The
configured clients are ready for reconnect/reload; authenticated headless
Streamable HTTP and paid registry retrieval were actually verified. A config
entry alone is not reported as a successful live connection.

## Delivery and rollback

Four ordered local branches separate ReUI readiness, shared foundations,
dependent application implementation and companion QA artifacts. Local checks
are complete; PR publication is the remaining delivery operation.
The intended integration base is `develop`. Revert dependent app changes
before shared foundations; readiness is independent. No automatic merge or
deployment is authorized. Keep the OpenSpec changes active until accepted and
merged.
