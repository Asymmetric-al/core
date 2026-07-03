# Phase 0 — Stabilize the Baseline (PRD)

**Phase 0 is a baseline, governance, and evidence phase. It implements no
feature parity.** Its job: establish an honest starting line and set the rules
for the 25-area effort.

## Goals

1. Produce one trustworthy baseline: what is committed, what is live, and how
   far the "written" work has run ahead of the "live" work.
2. Stand up the parity program's governing records (charter, matrix, this plan,
   one durable OpenSpec entry) from that verified truth.

## Non-goals

- No SiteStacker feature is built or shipped in Phase 0.
- The 374 built-but-unreleased commits are **recorded, not shipped**. Phase 0
  does not force a ship-or-not decision (kept visible for a later human call).
- The 25 features are **not** specified in detail here; each is detailed when it
  is actually built.

## Baseline decisions (from the Phase 0 grill)

- **Baseline of record = the commit actually live**, with the develop→production
  gap recorded as first-class truth. "Baseline" never silently means develop.
- **Reality first, then plan.** Truth-finding splits into **Lane 1**
  (repo/agent-provable) and **Lane 2** (human-only live confirmation). The live
  state is never assumed; unconfirmed is marked "not yet confirmed."
- **Parity = outcome parity** (match what SiteStacker lets an org accomplish,
  built our way). Benchmark = official SiteStacker docs, cited or marked "not
  yet sourced."
- **Matrix tracks Built / Live / Confirmed separately.**
- **Guardrails are inherited by reference**, not restated (see charter).
- **Child sponsorship out of scope**; other exclusions recorded as they surface.

## Definition of done

Phase 0 is done when the picture is **complete and honest**, not when
everything is green:

- Every baseline fact is either confirmed, or labeled **"not yet confirmed"**
  with a named owner.
- Failures are recorded as **known problems**; the dangerous ones are tagged as
  **stop conditions** pinned to the specific later phase they endanger.
- The charter, matrix, this plan, the evidence file, and the OpenSpec entry all
  exist and agree.
- Only a **hidden or unexamined** status blocks "done." Labeled unknowns and
  labeled problems do not.

## Provisional build order (not locked)

Recorded as **best current thinking**, changeable once the matrix is verified.
Only genuine dependencies are firm.

1. CRM truth → 2. money truth → 3. document truth → 4. finance truth →
2. public truth → 6. donor & missionary workspaces → 7. communications & files →
3. fundraising extensions → 9. operations tools → 10. automation & triggers.

**Reality check (from the matrix):** several of these are already built/live —
the CRM foundation (area 1), the portals (areas 15–16), receipts/PDF (area 9),
CMS foundation (area 13). So the _real_ first work is likely **verifying and
closing depth gaps** on already-built areas, not starting CRM from zero. The
order is finalized only after the matrix is verified per area.

**Firm dependencies (locked):** CRM foundation (1) precedes CRM depth (2),
custom fields (3), and anything reading CRM relationships; giving pipeline (5)
precedes offline batch (6), pledges (8), receipts (9), statements (10), exports
(11); automation engine (24) precedes contribution triggers (25).

## Work breakdown

### Phase 0A — find the truth

- **0A-1** Record the baseline: live-candidate commit (`production` HEAD),
  develop HEAD, and the measured gap. _(Done — evidence file. Live-branch
  confirmation is 0A-4.)_
- **0A-2** Record repo-gate status for the baseline. _(Done — green on develop
  frontier; baseline-pinned re-run listed as known gap G2.)_
- **0A-3** Confirm the portal code follows the boundary rules (shared package
  APIs, thin routes, no browser-side sensitive writes). _(Done.)_
- **0A-4 (human-only)** Confirm the exact live commit per app and that the live
  sites are healthy and behave per evidence. Accountable owner: the platform
  owner (founder), to perform or delegate. _(UNCONFIRMED — needs hosting
  access; see evidence file Lane 2.)_
- **0A-5** Write the evidence file with known gaps + stop conditions. _(Done —
  `docs/ops/phase-evidence/2026-07-03_sitestacker-parity-phase-00-baseline.md`.)_

### Phase 0B — write the records

- **0B-1** Program charter (`README.md`). _(Done.)_
- **0B-2** 25-area parity matrix (`parity-matrix.md`), initial pass with
  per-area `Built?/Live?/Confirmed?` and honest "needs verification" flags.
  _(Done — first pass; per-area `Built?`/current-state cells still need code
  verification.)_
- **0B-3** This Phase 0 plan. _(Done.)_
- **0B-4** OpenSpec entry governing the program (`openspec/changes/
sitestacker-parity/`). _(Done.)_
- **0B-5** Add `SiteStacker parity` to the root `CONTEXT.md` glossary. _(Done.)_

## GitHub issue breakdown (for when issues are created)

- **Issue: [Phase 0A] Baseline truth — repo-provable (Lane 1).** Record baseline
  commit/gap, gate status, boundary compliance. _(Mostly complete; attach
  evidence file.)_
- **Issue: [Phase 0A] Baseline truth — live confirmation (Lane 2, human).**
  Confirm live commit per app + health + behavior. Accountable owner: the
  platform owner (founder), performing or delegating to an ops lead with hosting
  access. Blocks stop condition SC1.
- **Issue: [Phase 0B] Parity program records.** Charter, matrix, plan, OpenSpec
  entry, glossary. _(Complete; open for review.)_
- **Issue: [Phase 0B] Verify matrix `Built?`/current-state per area.** Replace
  every `(v)` flag with a code-verified assessment; source every benchmark cite
  `(s)` to a specific SiteStacker doc page.
- **Issue: [Phase 0] Reconcile with OpenSpec PR #462.** Ensure parity areas
  already governed by #462 (donations, CRM, portals, contributions, identity)
  point to it rather than duplicating.
