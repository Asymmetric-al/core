# Core UI improvement evidence — AL-1967

This audit implements the existing Base UI + exact base-maia contract across
admin, donor, missionary and first-party shared/specialized surfaces. The source
baseline is develop at `f49fc2e03bce9246f5d3dc22c16d0a6c794a8304`.
Implementation lives in an isolated worktree; original uncommitted ReUI setup
work and the original checkout were preserved. The final source stack is rebased
on upstream `develop` at `180dde9e41b849e0c3a649aeef8989f3974bf4cd`, which
separately introduced Next.js 16.4 and admin refresh fixes. Browser captures
retain their actual pre-integration Next.js 16.3.8 epoch.

## Coverage and limits

The [coverage join](./coverage.md) and [structured index](./coverage-index.json)
connect all 160 discovered app route/layout/state files to their owner disposition
through 165 overlapping source-disposition joins,
including exact joins from admin to the specialized ledger. The
[inventory](./inventory/) connects app routes, loading/error
surfaces, shared consumers and specialized renderers to their source, behavior
boundaries, opportunities, retained compositions and acceptance checks. It
records source inspection separately from browser evidence. Structured import,
renderer and control scans are source coverage, not proof that each possible
runtime state was exercised. Module-level barrel reachability is not a claim
that every exported symbol renders on every route.

Baseline inventories include 60 admin page routes plus global/layout/state
entries, 26 donor pages, 15 missionary pages, 275 baseline shared source entries
plus four licensed settings modules, and
specialized Support/CMS/studio/Eve/PDF renderers. Specialized entries overlap
admin; these counts must not be added as unique routes.

The [runtime baseline](./runtime-baseline.md) and [before index](./before-index.json) and [after index](./after-index.json)
identify actual viewports, themes, states and blocked runtime data. Authorized
existing CI/demo fixtures were used with placeholder database endpoints; no
production mutations or fabricated product metrics were used. Missing service
credentials and Payload database access remain explicit verification limits.
Fresh matching map mounts render actual geography and the controls pass keyboard
and touch checks; productive location records are unavailable. Earlier blank map
and cold-route memory-limit diagnostics remain qualified rather than being
reported as current regressions or passes. There are 297 before images and 341
after images, including 295 matching filename pairs; these counts include state
and component-fixture captures rather than unique successful product workflows.

## Design and source decisions

- Preserve `packages/ui/components.json`, Base UI 1.8.0, exact base-maia,
  semantic tokens, typography, Lucide, shared ownership and stable imports.
- Keep DataTableResponsive and TanStack beta9 adapters, server-side operations,
  persisted state and specialized chart/board/editor engines.
- Keep real data, role and tenant context, form payloads, router/provider/Next
  boundaries, forced-light surfaces and intentional unfinished capabilities.
- Reuse compatible public MIT ReUI examples and official shadcn compositions;
  keep existing strong generic controls instead of installing duplicates.
- Current ReUI Filters is a query-tree migration; preserve Core's existing
  serialized-state contract. Current Data Grid creates a parallel source tree
  and exposes newer v9 APIs; improve Core's existing owner selectively.
- Actual commercial Pro settings-7/settings-11 source is integrated under the
  [owner-confirmed covering agreement](../../guides/development/reui-source-license.md)
  for public AGPL distribution and contributors. This is the owner’s attestation;
  the agreement document was not supplied or independently reviewed. Account
  authentication and distribution permission are separate evidence.

[Source research](./sources/reui-research.json) records exact items, dependency
and source hashes, previews, documentation, compatibility decisions and license
boundaries. [ReUI’s MIT notice](./sources/LICENSE-ReUI-MIT.md) applies to adapted
public MIT examples. [Commercial Pro provenance](./sources/reui-pro-research.json)
and [exact derivative mappings](./sources/reui-pro-settings.json) separately record
the paid settings rail/card/matrix source, hashes, rights and consumers. Pro source
is not MIT. Existing shadcn notices remain intact; unused vendor demo data,
providers, form stacks and engines were omitted.

## Verification status

Accepted source improvements are implemented; final integrated-state
verification passed all 17 preflight stages. [The verification record](./verification.md)
owns final command results and productive-workflow limits.
Completed source inventory does not prove every productive runtime state.
The original repository check stopped at design-system
component discovery; discovery passed in the fresh frozen-install worktree.
Subsequent checks exposed stale accepted-debt entries after safe corrections;
native prune removed only proved resolved counts: 10,611 to 4,867 across 376
reduced entries, with no increases or rule/exception changes. Full workspace
lint and typecheck passed 15/15 tasks. The later aggregate check passed 846
unit files / 6,705 tests, with two files and four tests skipped; that run preceded
the final Giving rail/map spacing fixes and the upstream integration. It does
not substitute for the final Next.js 16.4 preflight/build results.

[Suppression review](./sources/suppression-prune-review.json),
[shadscan proof review](./sources/shadscan-proof-review.md) and
[upstream source review](./sources/shadcn-upstream-review.md) preserve the explicit
source/contract decisions behind the refreshed hashes. They distinguish review
collection from final enforcement results.

The same eight existing component browser suites passed 62 checks before and
62 after across table/accessibility, dialog, wallet, chart/layout, popover and
primitive contrast fixtures. Owner-focused results and red/green evidence are
recorded in each ledger, including the final missionary 47-file/250-test scope
and late mobile selection, History, checkout and map checks. They overlap and
are not summed into a repository-wide total. Final Next.js 16.4 preflight passed
all 17 stages, including all three builds, 15/15 lint and typecheck tasks, and
851 unit files / 6,752 tests; two files / four tests skipped. See the exact
[preflight results](./checks/preflight.json).

[Status-token contrast](./token-contrast.json) and the
[camera-chip estimate](./missionary-camera-contrast.json) record mathematical
calculations and compositing assumptions. They complement actual browser
measurements; they do not establish productive runtime or screenshot coverage.
Actual shared fixture [seam checks](./after-seam-checks.json) include filtered
table results, narrow CMS keyboard dismissal/focus, PDF clipboard feedback and
resolved Mobilize status contrast in both themes. The
[reproduction note](./runtime-reproduction.md) states exact fixture boundaries;
these checks do not qualify blocked productive providers or every app route.

## Rollback

Revert dependent app presentation commits before shared foundations. ReUI skill
and authentication readiness is an independent prerequisite. No database,
auth/payment behavior, production operations or deployment changes are included.
Leave the OpenSpec change active until merged; do not auto-merge or deploy.
