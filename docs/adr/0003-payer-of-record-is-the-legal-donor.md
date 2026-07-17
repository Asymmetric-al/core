# ADR-0003: The payer-of-record is the legal donor of a matching/workplace check

**Status:** Accepted (founder ruling, Phase 14 grill session 2026-07-10 — D4.4)

> Full record: `docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`,
> Section G (ratified decision D4.4; lands in Phase 7 as the dated A11
> amendment via the D1.14 cross-PRD amendment package).

## Context

The earlier absolutism — "the employer is the legal donor of a matching
gift" — is falsified by how genuine match checks actually arrive: from
intermediaries such as GE Foundation or Benevity administering employers'
programs, and Benevity disbursements mix payroll-gift lines and match lines
in one check. Receipts and hard credit must follow real money custody, not
program attribution.

## Decision

The spawned/linked contribution's **legal donor = the payer-of-record: whoever
actually wrote the check** (defaults to the employer; intermediaries are real
payers). Receipts follow the check-writer. The expectancy keeps
`employer_party_id` as **program attribution** — who promised the match — which
is a different fact from who paid. An intermediary-paid line CAN settle an
expectancy. The role distinction (`matched_employee` vs
`workplace_giving_donor`) is a per-LINE nature, not per-check.

## Consequences

- Hard credit and receipting stay legally correct when Benevity, GE
  Foundation, or another intermediary pays; the employer still appears in
  program reporting through the expectancy's attribution.
- Mixed intermediary checks work: each line carries its own nature, so one
  Benevity disbursement can settle match expectancies and record workplace
  giving in the same header.
- Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit
  Model) is amended (dated, append-only — A11) rather than rewritten; the
  ledger's single-legal-donor rule per header is unchanged.
- The payer intelligence registry (`party_payer_aliases`, `payer_kind`)
  is what recognizes intermediaries at entry; unmatched payer strings fail
  closed to triage instead of silently misfiling the legal donor.
