# Framework security checkpoint

Status: **merged and qualified**. Production execution remains outside delivery.

## Frozen targets and upstream evidence

- Next / @next/env / @next/playwright / eslint-config-next: **16.4.2**.
- React / React DOM: **19.3.1**. Existing React type packages stay at 19.3.0.
- Node: **24.22.1 LTS**; Bun: **1.4.3**.
- [Official October 14 security release](https://nextjs.org/blog/nextjs-security-update-october-14-2026).
- [Cache Components RCE](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr).
- [Server Actions denial of service](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r).
- [React RSC advisory](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3).
- [Image optimization advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw).
- [Node 24.22.1 official release archive](https://nodejs.org/en/download/archive/v24.22.1).

All three applications enable Cache Components. The official advisory requires
patching even without a known exploitable cache-return shape. Automated npm
advisory output did not include all these upstream reports and is insufficient
by itself. Native Sharp is already 0.35.5; decoder/output regressions remain
part of this checkpoint.

## Delivered behavior

All direct Next/React runtime declarations and the lock move together without
narrowing library peer ranges. Node setup/preflight enforce the approved Node
24 patch floor; CI freezes the tested patch. No app rendering configuration,
schema, tenant boundary or payment serialization changed. Shadscan manifest
proof hashes were reviewed and refreshed with identical classifications and
floors. PDF compatibility dependencies remain owned by their later cohort.

## Final qualification and merge

[PR #2175](https://github.com/Asymmetric-al/core/pull/2175) merged into develop on
October 21 as `dfaa201242c6ad468bf2d343aa18e8f223f67c5c`, from qualified head
`32d3ab6dbb6e41de37c57d6a2db3c456ab82ffaa`. Both commits were verified as develop
ancestors; the merge tree equals the qualified tree. The
[immutable checkpoint record](framework-security-qualification.json) retains
exact versions, run IDs, deployment IDs, review coverage and readback.

Normal full pre-push preflight passed on Node 24.22.1: 890 passing test files,
7,216 passing tests, four skipped tests, one expected failure and two skipped
files. All three real builds, frozen installation, workspace/lock, OpenSpec,
skill parity, lint, typecheck and existing quality floors passed. The production
donor instant-navigation rig passed seven tests and native image optimization
returned valid WebP. Its last source delta was documentation wording only.

[Exact-head CI](https://github.com/Asymmetric-al/core/actions/runs/39596748587),
[integration](https://github.com/Asymmetric-al/core/actions/runs/39596748543) and
[three-app authenticated preview smoke](https://github.com/Asymmetric-al/core/actions/runs/39596959418)
passed. Each READY preview's project and commit were verified independently,
with direct public/login/CMS-guard checks:

- [Admin](https://admin-3s39q67le-asymmetric-al.vercel.app)
- [Donor](https://donor-nme3bnh9w-asymmetric-al.vercel.app)
- [Missionary](https://missionary-c7uazvb3o-asymmetric-al.vercel.app)

[Post-merge CI](https://github.com/Asymmetric-al/core/actions/runs/39599217628) and
[post-merge integration](https://github.com/Asymmetric-al/core/actions/runs/39599217716)
also passed. Policy-skipped instant-navigation workflow jobs are not counted
as executed browser tests; the local production rig supplies that evidence.
Vercel exposes Node 24.x for all three projects, without a verifiable patch.

Paginated GraphQL/REST review reconciliation covered all 40 changed files,
including the lockfile. CodeRabbit's documentation finding was corrected and
its thread resolved; no unresolved threads remained. Independent reviewers
covered source/runtime/lock behavior. Hosted Codex/Cursor reviews were usage
limited and are not claimed as completed.

## Reconciliation and owned follow-ups

OpenSpec [PR #2172](https://github.com/Asymmetric-al/core/pull/2172), merged as
`5cf4855dc322eafcccfeca0dd528695ae72832d9`, is incorporated. Its accepted-contract
reconciliation and OpenSpec 1.14.3 are reused. CI [PR #2160](https://github.com/Asymmetric-al/core/pull/2160)
remains owned by its draft branch; this checkpoint does not duplicate it.

The combined gate exposed a pre-existing flaky subprocess deadline test.
Controlled process events and time now prove expiry during backoff and a
second attempt. All 136 tests in that file pass, retaining real subprocess
integration cases. A deliberate deadline-reset mutant fails; production retry
code is unchanged. Upstream UI proof hashes were refreshed without weakening
scope or floors.

The home-page Date.now warning reproduces at the untouched baseline; telemetry
owns it. Explicit fixture-mode local credential loading is owned by the tooling
cohort. Neither finding is closed by this security checkpoint. No credential
values were inspected.

## Rollback

No schema or provider serialization changes occur in this checkpoint. Do not
roll back to the vulnerable Next 16.4.0 / React 19.3.0 release. A functional
regression requires a forward fix or a separately qualified supported patched
release. Production execution is outside this checkpoint.
