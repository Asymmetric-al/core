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

## Outstanding qualification

- Frozen clean installation and installed identities/lock drift.
- Full preflight, all three real builds and full unit suite.
- Production instant-navigation rig (ordinary develop PR CI skips this job).
- Browser auth/session, Server Action, CMS mount and image optimization smoke.
- Independent review, exact-head required CI, review reconciliation, deployed
  previews, merge and develop readback.

## Rollback

No schema or provider serialization changes occur in this checkpoint. Do not
roll back to the vulnerable Next 16.4.0 / React 19.3.0 release. A functional
regression requires a forward fix or a separately qualified supported patched
release. Production execution is outside this checkpoint.
