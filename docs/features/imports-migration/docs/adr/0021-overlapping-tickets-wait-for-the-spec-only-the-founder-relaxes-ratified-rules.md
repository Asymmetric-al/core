# ADR-IM-021: Overlapping tickets wait for the Phase 30 spec; only the founder relaxes a founder-ratified rule

**Status:** Accepted 2026-11-04. Ratified by the founder in the Phase 30 grill (Q21).

- **Record:** `docs/features/imports-migration/grill/decision-log.md` §1 Q21.
- **Evidence:** `grill/q21-governance/` (`research/q21-r1-tracker-state.md`, `q21-decision-as-asked.md`).
- **Preserves:**
  - Phase 28 D17, the missionary self-import, including D17 C13 (scan and quarantine) and C22 (qualified per-profile numbers);
  - Phase 29 REQ29-D05;
  - Phase 30 Q11, Q14, Q15, Q18, Q19 and Q20;
  - the discovery gates: no tracker writes, no placeholder issues, and ticket changes only at `/to-ticket`.

## Context

A read-only check on 2026-11-04 found nothing changed since `develop` `629cb71dc`.

- **#2347 is the hazard.** The Phase 28 text-file reader is `Ready` and unblocked. It hard-codes the self-import's limits as shared constants. #2087, the XLSX reader, follows as soon as it closes.
- **The storage tickets duplicate work.** #2083–#2085 are blocked, but as written they create Phase 28-named custody, plan, run and source tables that duplicate Phase 29 and 30 work.
- **#2369 is the gate** that would release them.
- **Engineering defaults** (batch size, lease, concurrency, hold review, clean-up cadence) were set in ticket comments.
- **A delegated security grant was used to relax a founder-ratified rule.** A factory lead accepted "structural validation only" (no malware scan) for self-import text files under that grant, against founder-ratified clauses that require Asym's own scan.

## Decision

1. **Hold the readers.**
   - **What:** #2347 and #2087 lose `Ready`. They regain it only after the Phase 30 spec is approved and their amendments are made at `/to-ticket`.
   - **Who acts:** the label change is the founder's own action, or needs the founder's explicit instruction naming both issues.
   - **Amendments set at `/to-ticket`:**
     - **Readers:** limits per qualified profile behind one shared reader seam.
     - **Plans and runs:** owned by Phase 30.
     - **Parser:** chosen under Q11 and Phase 29.
     - **Refusing a second import:** a self-import-only rule.
     - **Storage tickets:** re-scoped onto Phase 29 and 30 objects.
     - **"No batch undo" test:** scoped to self-import routes.
     - **#2369:** `Ready` only after that re-scope.
     - **#2281:** amended, not held.
     - **#2117:** gains Q9's adoption hold.
2. **D17 engineering defaults** are confirmed as the self-import profile's own defaults:
   - 50 rows per step;
   - a 60-second lease;
   - one self-import per ministry, with a second refused;
   - the performance envelope measured before activation;
   - a 90-day hold review;
   - an hourly clean-up on Q15's single sweep;
   - the backup window read from production;
   - the operator as a configurable role.

   They are never engine-wide, and they are qualified against measured load before activation. Staff imports queue a second import.

3. **The structural-only scanning departure is rejected.**
   - **Scanning:** every imported file, including self-import text, XLSX and ZIP, gets a malware scan Asym runs itself. Self-import activation waits for Phase 29's scanner.
   - **Standing rule:** only the founder can relax a founder-ratified clause, by re-ratifying it. A delegated grant may tighten a ratified rule, never loosen it.

## Considered options

| Option                                     | Why rejected                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| Amend every ticket now                     | Edits twice; final names come from the spec.                                      |
| Let tickets proceed unchanged              | Shared hard-coded limits and Phase 28-named tables Phase 30 must unwind.          |
| A placeholder blocker issue                | Forbidden during discovery.                                                       |
| Deferring or generalising the D17 defaults | Low stakes and already bounded; staff profiles queue and are far larger.          |
| A time-boxed scanning exception            | Ratified clauses require Asym's own scan, and the chain waits on Phase 29 anyway. |
| Delegating relaxation of ratified clauses  | Widens delegated authority beyond what the repository records.                    |

## Consequences

**Monitor M-Q21-1:**

- **Signal:** #2347 or #2087 is assigned, gets a pull request, or gets an in-flight label while still `Ready`.
- **Response:** stop before merge and amend.

**Present-code exposures** stay with their own owners: D38, D40, D41, D43, D44, D65/D66 and D24.
