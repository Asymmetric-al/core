# ADR-IM-013: Giving history comes across gift by gift; complete or wait

**Status:** Accepted 2026-11-03. Ratified by the founder in the Phase 30 grill (Q13), after a full ruthless review. Amended by ADR-IM-015 (2026-11-03, post-go-live corrections use the held export or a reviewed correction file).

- **Record:** `docs/features/imports-migration/grill/decision-log.md` §1 Q13.
- **Evidence:** `grill/q13-historical-giving/` (research r1–r5, `q13-adversarial-review.md` with edge cases E1–E28, invariants I1–I9 and AC1–AC16).
- **Amends:**
  - ADR-IM-001: the kit's giving history; per-year reconciliation and the History spot check.
  - ADR-IM-011: designation creation from mapping.

## Context

Missionary support work runs on supporter history: recency, first gift, lapsed and faithful supporters. Missionary tools already show it. C22 forbids guessing from missing history, and Q7 promised that Recorded-outside-Asym gifts count in every total.

**Owner text:**

- **Frozen facts.** Phase 13 freezes the legal donor, tender and target at acceptance (`phase-13:225`, `:1738`, `:1814`).
- **General Fund fallback.** Phase 13 resolves an unspecified target to the General Fund (`:1745`).
- **Refunds.** Phase 13 clamps them to the unrefunded amount (`:1936`).
- **Dating.** Phase 7 dates mailed checks by postmark or a per-gift attestation (`phase-07:246-248`).
- **Missionary balances.** Phase 21 admits every Phase 13 posting as provisional Missionary Support Activity and never suppresses refunds (`phase-21:73-76`; FAO `:206-208`).
- **Missionary view.** It is the Phase 14 roster: the trailing 365 days plus a 365–730-day band (`phase-14:1093-1105`).
- **Anonymity.** It must be "established positively" (`phase-28/proof.md:167-168`).

**Current code** (develop `629cb71dc`; it is a prototype, not intent):

- Readers key on `created_at`.
- Stored totals are never updated.
- Amounts are divided by 100 regardless of currency.
- Readers cap at the API's 1,000-row default.
- Receipts are offered for any owned gift.
- The prototype `donations` table has no provenance, and its defaults invent facts.

**Vendor practice:**

- Every year is imported at gift level, with no summaries.
- Unmapped funds block; they never fall back to a default.
- Refunds are linked entries.
- History stays out of accounting.
- Totals tie out, plus a spot sample.

## Decision

1. **Scope.** All history comes across gift by gift, for every payment type, Recorded outside Asym.
   - A ministry may set a later Coverage start.
   - History is written only through Phase 13's adoption command, never to the prototype `donations` table.
2. **Complete or wait.** A gift commits only when all its Fixed gift facts are known. Otherwise it is a Waiting row with a plain reason.
   - Nothing comes from a default.
   - General Fund mapping is only an explicit, counted choice.
3. **Facts are kept as recorded.**
   - **Currency:** the native currency, exponent-checked, never converted. Any valid currency is accepted.
   - **Date:** the source's calendar date, under a "source-recorded" dating basis, with no per-gift attestation.
   - **Boundary:** dates after the Switch Boundary are refused.
   - **Split gifts** must add up exactly.
4. **Reversals** are linked by exact source reference and never netted. Orphan, early or oversized reversals wait.
5. **Designations.** Departed missionaries and closed funds become Retired designations, created by a person from mapping.
   - Labels and memos pass Phase 10's firewall.
   - Memos are staff-only.
6. **Gift shapes and recognition.**
   - DAF, match and workplace-giving shapes are applied at commit where the source records them. Otherwise the gift stays as recorded and is never re-attributed.
   - Recognition records may also come later.
   - Noncash gifts are a Visible exclusion until D36 is settled.
   - Anonymity fails closed.
7. **Legal Entity and Site** resolve from the ministry's signed Source mapping statement.
8. **History never moves money.** It creates no balances, Support Activity, assessments, payouts, fees, accounting entries, settlement links, receipts, statement lines, thank-yous or tasks.
9. **Reader readiness check.** It must pass before the first real history commit.
10. **Visibility.**
    - **Staff:** full history, labelled.
    - **Donors:** their own history, with no receipt action.
    - **Missionaries:** the existing Phase 14/28 views with the Q7 label. There is no Phase 30 history screen.
11. **Sign-off.**
    - Q1's two levels, plus a per-year breakdown and the History spot check (20 random gifts and the 5 largest).
    - Zero Waiting rows.
12. **Corrections after go-live** are append-only: void and re-adopt, with counts and a reason, under a separate capability. Nothing is deleted or edited in place.
13. **Retention.** History follows the same retention, export and erasure rules as Asym gifts. The Coverage start handles very old history.

## Considered options

- **Older years as yearly totals (B).** Rejected. It fabricates rows with no source identity and loses refunds and first-gift truth.
- **Card gifts only (C).** Rejected. Supporter histories are visibly incomplete, and it contradicts the Q1 kit.
- **Commit now, fix shapes later.** Rejected. The legal donor and tender freeze at commit.
- **General Fund fallback.** Rejected, for the same reason as the default currency, default date and automatic fund creation: silent wrong facts at scale.
- **Writing history to the prototype `donations` table.** Rejected. It has no provenance or uniqueness, and current RLS exposes notes to missionaries.
- **A Phase 30 missionary history screen.** Rejected. It bypasses the owner privacy floor.
- **A per-country retention engine; a 60+ gift sample.** Rejected as speculative or disproportionate.

## Consequences

- **Owner requirements:**
  - O53: the Phase 13 adoption command, with Phase 15 scoping its sole-writer guard.
  - O54: the Phase 7 source-recorded date.
  - O55: Phases 21 and 20 treat history as predecessor facts.
  - O56: Retired designations.
  - O57: the Phase 10 firewall.
  - O58: anonymity fails closed, plus import shapes.
  - O59: Site and entity from the statement.
  - O60: reader readiness.
- **Discrepancies:** D33–D39. D38, a live `mySupporters` privacy exposure, is flagged with no tracker action.
- **Sequence:**
  1. O20 and D38.
  2. O53–O55.
  3. O56–O59 and D36.
  4. O60.
  5. Production-shaped practice runs.
  6. The first real Switch.
- **Monitors:** M-Q13-1 to M-Q13-7, covering:
  - zero effects from history;
  - zero unexplained variance;
  - zero spot-check mismatches;
  - Waiting rows above 2%;
  - commit time above half the pause;
  - corrections above 0.5% in the first 90 days;
  - missionary requests for older history.
