# Framework security checkpoint

Status: implementation and qualification in progress. No merge or preview success
is claimed until the evidence is recorded here.

## Frozen targets and upstream evidence

- Next / @next/env / @next/playwright / eslint-config-next: **16.4.2**.
- React / React DOM: **19.3.1**. Existing React type packages stay at 19.3.0.
- Node: **24.22.0 LTS**; Bun: **1.4.3**.
- [Official October 14 security release](https://nextjs.org/blog/nextjs-security-update-october-14-2026).
- [Cache Components RCE](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr).
- [Server Actions denial of service](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r).
- [React RSC advisory](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3).
- [Image optimization advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw).
- [Node 24.22.0 release](https://nodejs.org/en/blog/release/v24.22.0).

All three applications enable Cache Components. The official advisory requires
patching even without a known exploitable cache-return shape. Automated npm
advisory output did not include all these upstream reports and is insufficient
by itself. Native Sharp is already 0.35.5; decoder/output regressions remain
part of this checkpoint.

## Implementation evidence

All direct Next/React runtime declarations move together, without narrowing
library peer ranges. Node setup and local preflight enforce the Node 24 family
at or above .node-version, and CI pins the exact tested release. Runtime tests
cover old/new unsupported majors, older patches, malformed and prerelease values.
The regressions failed before implementation; the focused 41-test suite passes
(runtime/setup/preflight/config/native image coverage).

Bun retained lockfile format 1. The lock change adds only the patched Next and
React cohort; it also prunes obsolete unreachable locked package records. The
remaining PDF compatibility packages await their separate source migration.
Shadscan manifest evidence was revalidated for the workspace root, admin,
auth, database, library, missionary and UI packages. Ownership and locked
Payload recovery/Sonner delegation remain unchanged. Regression tests cover
those runtime delegates. No score floor, classification or finding suppression
was weakened. The gate rejects stale hashes, so every changed manifest proof
was inspected before its hash was refreshed.

Independent source review found no P0/P1 issues. Installed identities were
independently verified across the apps/shared importers, including retained PDF
compatibility dependencies. Frozen reinstall and lock-drift checks pass. The
local WSL default now selects Node 24.22.0. Vercel reports Node 24.x for all
three configured Core projects; this verifies the hosted family, not its patch.

## Qualification evidence

The initial checkpoint head `de596f8ce246e59d0917be31ff371e7e69695b8e`
passes the normal full pre-push preflight: all three real builds and 7,193
passing unit tests. Frozen reinstall, workspace/lock checks, runtime/config/image
regressions, CMS delegate and Sonner contracts pass. Production donor instant
navigation passes seven tests; hermetic donor login/session/settings smoke
passes five tests. Native image optimization returns valid WebP.

[Current-head CI](https://github.com/Asymmetric-al/core/actions/runs/39584991299)
and the required integration gates passed at that head. The
[preview workflow](https://github.com/Asymmetric-al/core/actions/runs/39585529332)
built all three applications and passed authenticated browser smoke for each:

- [Admin](https://admin-6ro3zrzdl-asymmetric-al.vercel.app)
- [Donor](https://donor-bvz3kj8nq-asymmetric-al.vercel.app)
- [Missionary](https://missionary-1sp9r2irr-asymmetric-al.vercel.app)

Vercel metadata confirms each preview's exact commit and expected project.
Direct checks also pass the donor public page, admin CMS unauthenticated login
guard, missionary login page and image serving. CodeRabbit reported no actionable
findings; independent review includes its excluded lockfile. Hosted Codex/Cursor
reviews could not run because their usage limits were reached.

## Outstanding qualification

OpenSpec [PR #2172](https://github.com/Asymmetric-al/core/pull/2172) merged as
`5cf4855dc322eafcccfeca0dd528695ae72832d9` during qualification. Its OpenSpec
1.14.3 update and accepted-contract reconciliation are reused. The only merge
conflict was eight root manifest proof hashes; classification/rationale content
was verified identical on both sides before hashing the combined manifest.
A frozen installation, strict change validation and delta-compatibility checks
pass with the combined tree. Fresh full preflight, exact-head CI/review/previews,
merge and develop readback remain required after reconciliation. Previous-head
preview success does not close those requirements.

Additional observations remain owned by later cohorts: the CI environment wrapper
loads local provider credentials even when fixture mode is explicitly requested;
a telemetry Date.now prerender warning needs qualification; and one subprocess
retry test uses a short wall-clock deadline. No credential values were inspected,
and no quality floor or test scope was weakened to pass this checkpoint.

## Rollback

No schema or provider serialization changes occur in this checkpoint. Do not
roll back to the vulnerable Next 16.4.0 / React 19.3.0 release. A functional
regression requires a forward fix or a separately qualified supported patched
release. Production execution is outside this checkpoint.
