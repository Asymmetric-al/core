# SiteStacker Parity — Phase 0 Baseline Evidence (0A)

- Date: 2026-07-03
- Repo: `Asymmetric-al/core`
- Evidence status: **partial — Lane 1 (repo-provable) recorded; Lane 2 (live
  confirmation) pending a human with hosting access**
- Author: baseline audit (agent-assisted)

## What this file is

This is the **truth-finding (0A)** output for Phase 0 of the SiteStacker parity
effort. It records the real starting line before any parity planning is written.
It is deliberately split into two lanes:

- **Lane 1 — repo-provable:** facts an agent can prove by reading the
  repository (commit history, gates, code boundaries). Recorded below as
  confirmed.
- **Lane 2 — live confirmation:** facts that require logging into the hosting
  dashboard / live sites (what commit is actually serving users right now, and
  whether live behavior matches). **An in-repo agent cannot see these.** They
  are marked **UNCONFIRMED** and assigned to a human below.

Rule for this baseline (agreed in the Phase 0 grill): the live state is never
assumed. It is either human-confirmed with a commit, or marked "not yet
confirmed."

## Baseline anchor (Lane 1: confirmed)

| Branch                  | HEAD commit | Date (commit) | Subject                                                                                    |
| ----------------------- | ----------- | ------------- | ------------------------------------------------------------------------------------------ |
| `production` (release)  | `fb168d89`  | 2026-06-20    | `release: develop -> production (coordinator hardening + core-development env fix) (#384)` |
| `develop` (integration) | `44c2637e`  | 2026-07-02    | `Merge pull request #382 ... consolidate-protected-env-gates`                              |

- **`develop` is 374 commits ahead of `production`** (production is fully
  contained in develop). The 374 not-yet-released commits span **2026-05-27 →
  2026-07-02**.
- `production` is a curated release branch, last refreshed by an explicit
  `release: develop -> production` merge on **2026-06-20** (~2 weeks before this
  baseline).
- **Baseline of record:** the commit actually deployed to production. The
  strongest in-repo candidate is `production` HEAD `fb168d89`, but confirming
  that this is what real users hit today is a Lane-2 item (below).

> Correction captured during 0A: an earlier assumption treated the live line as
> ~7 weeks old (anchored to the 2026-05-15 Phase 09 evidence). The real last
> release is 2026-06-20. Reality-first checking caught the wrong assumption —
> which is the point of this phase.

## Phase 09 / 10 / 11 status (Lane 1: confirmed committed)

The donor + missionary portal move to server-owned package APIs (Phase 09) and
the later Phase 10 (PDF Studio persistence) and Phase 11 (scale/observability)
work are **committed and present in both `develop` and `production` history**:

- Phase 09 portals: commit `df9c3032` (`feat(portals): harden donor and
missionary self-service`).
- Phase 10: commit `7ba815f7`; Phase 11: commit `ad8c79b6`.

These are real implementations, not stubs (see boundary check below). Prior
phase-evidence recorded a successful production deploy with green health checks
on 2026-05-15; whether the **current** live deploy still matches is Lane 2.

## Repo gates (Lane 1: green on the develop frontier)

- The repository enforces a full gate suite: `format`, `lint`, `typecheck`,
  `build`, `test:unit`, `verify:data-boundary`, `verify:workspace-contract`,
  `verify:eslint`, `verify:shadcn-diff`.
- These gates are **green on the current develop frontier** (evidence: the
  in-flight OpenSpec PR #462, branched from develop, passed the full required
  CI suite on 2026-07-03).
- The `production` release commit `fb168d89` passed required checks at release
  time (it was promoted via the release PR #384).
- **Not yet done in 0A:** a fresh local gate run pinned to the exact baseline
  commit. Recorded as a known gap (below), not a blocker.

## Boundary compliance — donor/missionary portals (Lane 1: confirmed)

The parity effort depends on the "business logic in shared packages, thin app
routes, no browser-side sensitive writes" boundary. For the portals it is
actually followed:

- Donor portal logic lives in `packages/api/src/donor-portal/**` (portal
  snapshot, Stripe billing-portal handoff, receipts, statements). Missionary
  portal logic lives in `packages/api/src/missionary-portal/**` (snapshot, task
  CRUD, support gifts, donor-relationship projection, updates).
- The donor and missionary apps consume these via **thin route handlers**
  (`apps/<app>/app/api/**/route.ts` re-export the package API), and client
  hooks fetch `/api/*` rather than importing a browser Supabase client
  (e.g. `packages/database/hooks/donor-portal.ts`,
  `packages/lib/hooks/use-tasks.ts`).
- Focused ownership/boundary tests exist under `tests/unit/packages/api/
donor-portal/**` and `.../missionary-portal/**`.

## SiteStacker benchmark source (Lane 1: located)

Parity is measured against **official SiteStacker/WMTek public documentation**
(the agreed benchmark source; no live SiteStacker instance is in use):

- Training/help documentation: `https://sitestacker.training` and
  `https://forms.sitestacker.training/full-training-documentation` — covers
  CRM/entity permissions, giving, contributions, campaigns, batches, exports,
  managing/adding gifts, advocacy, historic giving, payment processors,
  automation, dashboards, missionary dashboard, mobilization, reporting.
- Product/marketing framing: `https://sitestacker.com` (e.g.
  `https://sitestacker.com/ministry-crm`).
- **Known limitation (recorded):** public docs describe _features_, not always
  _operational depth_ (real-world behavior under failure/edge cases). The
  inventory's benchmark column cites a specific doc page per area, or is marked
  "not yet sourced." Deep behavioral documentation of any single area happens
  when that area is actually built, not in Phase 0.

## Known gaps

- **G1 — Live deploy state not confirmed from repo.** Which commit is actually
  serving `admin/donor/missionary.asymmetric.al` today is not visible in-repo.
  (Lane 2, below.)
- **G2 — No baseline-pinned gate run.** Gates are green on the develop frontier
  and passed at release time, but not freshly re-run against the exact baseline
  commit in this phase.
- **G3 — Benchmark depth.** Doc-based benchmark is strong on "what features
  exist," weaker on operational behavior (see limitation above).
- **G4 — 374 unreleased commits.** A large batch of finished work sits on
  `develop` but is not on the `production` release line. Recorded as a plain
  fact; Phase 0 does not ship it and does not force a ship-or-not decision.

## Stop conditions (must be resolved before the named later work is safe)

- **SC1 (blocks any parity phase that assumes current live behavior):** Lane-2
  live confirmation (below) must be completed before a parity phase relies on
  "what donors/missionaries see in production today." Until then, parity phases
  plan against the confirmed _committed_ baseline, not an assumed live one.

## Lane 2 — human confirmation required (UNCONFIRMED)

**Accountable owner: the platform owner (founder)** — performs this check
directly or delegates it to an ops lead with Vercel / hosting-dashboard +
live-site access. Assigning and running Lane 2 is the immediate open Phase 0
action; it may be reassigned, but it is never left ownerless. Until the owner
records the results below, these items stay UNCONFIRMED and stop condition SC1
holds.

- **L2-1 (UNCONFIRMED):** Confirm the exact commit currently deployed to each
  live app (`admin`, `donor`, `missionary`) and whether it matches the
  `production` baseline `fb168d89` or a different commit. Record the SHA + who
  confirmed + date.
- **L2-2 (UNCONFIRMED):** Confirm the three live apps are healthy today
  (`https://<app>.asymmetric.al/api/health` → 200) and that the donor +
  missionary portals behave per the Phase 09 evidence.
- **L2-3 (UNCONFIRMED):** Confirm whether production is auto-deployed from the
  `production` branch (implied by the branch model, not proven in-repo).

## Related in-flight work (coordination note)

- OpenSpec PR #462 (`docs/openspec-refine-structure-and-intent`, branched from
  develop) refines the platform intent/boundary specs and adds capability specs
  (donation-lifecycle, crm-core, contribution-operations, identity-and-access,
  workflow-orchestration) plus active donor-money-path changes (guest giving,
  donor self-service, recurring giving, staff refunds). These overlap several
  parity areas and are **not yet merged to develop**. The parity program (0B)
  should reconcile with #462 rather than duplicate it.
