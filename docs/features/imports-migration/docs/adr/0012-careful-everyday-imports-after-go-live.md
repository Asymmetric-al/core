# ADR-IM-012: Careful everyday imports after go-live

**Status:** Accepted 2026-11-03. Ratified by the founder in the Phase 30 grill (Q12). Amended by ADR-IM-015 (2026-11-03, 30-day reversal window and file retention). Amended by ADR-IM-018 (2026-11-03, import reversal checks: "not written since", tags as one field, entered-in-error removal, defined Untouched, Gift files handed to Phase 15 batch by batch). Amended by ADR-IM-020 (2026-11-04, Held for review replaces "always go to review"; capabilities are Data Tools levels).

- **Record:** `docs/features/imports-migration/grill/decision-log.md` §1 Q12.
- **Evidence:** `grill/q12-everyday-imports/` (research r1–r2, `q12-adversarial-review.md`).
- **Amends:** ADR-IM-004 (Recorded outside Asym is narrowed to a Switch's history import and Legacy Tail Backfills).

## Context

After go-live, ministries still receive spreadsheets: event sign-ups, volunteer lists, DAF and workplace-giving payouts, check deposits. The Switch (ADR-IM-001) is one planned transfer and does not serve these.

**What the repo already says:**

- A changed target is a conflict (roadmap).
- Phase 15 is the sole writer of offline money (`phase-15:836`). It holds thank-yous for import-origin rows permanently (`:1884`).
- Phase 14 decides the legal donor. The DAF sponsor, workplace-giving platform or employer is the payer of record, and the person is recognised (`phase-14:403`, `:918`). Phase 14 already has a remittance screen with CSV paste (`:1882`).
- C15: an absent key means unchanged, defaults apply at create only, and unknown options are rejected.
- The only donor-edit code today treats a blank as "clear".

**What research shows:** HubSpot, Salesforce, Little Green Light and DonorPerfect agree that:

- a blank leaves data alone;
- updates fill empty fields by default, with overwrite opt-in per column;
- contact details are added, never replaced;
- current gifts enter through batches with control totals.

Whole-import "blank means delete" switches and automatic change-of-address updates are the common ways these imports damage data.

## Decision

1. **Two Everyday import types, each chosen up front with its own template.**
   - **People import:** adds and updates people. It carries names, contact details, tags and lists, existing custom fields only, household columns (ADR-IM-010) and restriction columns (restrict-only, ADR-IM-009).
   - **Gift file:** becomes a draft Phase 15 batch.
   - **Unchanged:** church remittances stay on Phase 14's screen. The Switch and the missionary self-import are unchanged.
   - **Switch pause:** Everyday imports pause while a Switch is between its Switch Boundary and go-live.
2. **Write modes.** Each column is Fill empty only (the default), Replace (opt-in, counted) or Ignore. A blank never changes anything, and Clear is a separate, confirmed, counted action.
3. **Contact details are added, never replaced.**
   - A new detail becomes primary only on instruction, and the old address is end-dated.
   - Tags and lists are only added.
   - A change never spreads to other household members.
   - Change-of-address (NCOA) addresses and a new email held by another person go to review.
4. **Newer work wins.**
   - A field changed after the plan is a conflict.
   - Staff, deceased and restricted-tier people go to review.
   - Do-not-contact people are updated and flagged.
   - The preview shows counts and current → new values.
5. **Matching follows ADR-IM-010.** O47 must be live first.
6. **Imports grant nothing and send nothing.** A dated opt-in is kept as evidence only.
7. **Gift files go to Phase 15 as ordinary current gifts** under the batch's own review gate.
   - The batch needs an expected count and total.
   - Payout and row keys refuse a repeat.
   - Each row names the payer of record and the person recognised. Receipts follow Phase 7/14 rules.
   - Employer matches stay separate gifts.
   - During a Legacy Recurring Tail, rows that belong to a legacy executor are refused.
   - Recorded outside Asym never applies to Gift files.
8. **Permissions and reversal.**
   - Running an import, choosing Replace, clearing and reversing are capabilities the ministry grants (ADR-IM-005). Gift files use Phase 15's batch permission.
   - Reversal restores only fields still holding the imported value, reports later edits, and archives only untouched created people.
   - Posted money is corrected in Phase 15, never by reversal.
9. **Not in v1:** bulk deletes, changing gifts by import, pledge uploads, merges, consent from imports, and automatic change-of-address service connections.

## Considered options

- **Switch only (A).** Rejected. It leaves routine needs such as event lists and payouts unserved.
- **Full bulk update with blank = clear (C).** Rejected. It is the classic way imports destroy good data or update the wrong person.
- **Gift files committing money directly from Phase 30.** Rejected. It breaks Phase 15's sole-writer guard.
- **Gift-file rows as import-origin.** Rejected. Their thank-yous would be held forever.
- **A whole-import "empty fields delete data" switch.** Rejected. Clearing must be per column and counted.
- **Automatic change-of-address updates.** Rejected. Phase 19 forbids provider address overwrites (`:640`), and family matches move the wrong people.

## Consequences

- **Owner requirements:**
  - O50 (Phase 15): a file-origin batch of current gifts with controls, keys, payer of record and the legacy-tail refusal.
  - O51 (Phase 9 with Phases 4 and 11): per-field write modes, contact points, tags and reversal.
  - O52 (Phase 12 with O27): import capabilities.
- **Prerequisites:** O47 (the Phase 4 matching fix) gates People imports as it gates Switches. Creating new custom fields stays with F10.
- **Monitors:**
  - Zero tolerance: messages or permissions caused by an import; a payout accepted twice; legacy-executor rows accepted.
  - Learning signals: the share of People imports reversed; the size of Replace operations, to decide whether large Replaces need a second-person check.
