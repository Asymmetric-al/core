# ADR-IM-015: Time-boxed Switch retention; the ministry's copy is its record

**Status:** Accepted 2026-11-03. Ratified by the founder in the Phase 30 grill (Q15), after a full ruthless review. Amended by ADR-IM-016 (2026-11-03, refused identifier columns stripped from the held copy). Amended by ADR-IM-018 (2026-11-03, "Everyday-import undo" renamed the import reversal window and "undo values" reversal prior values; Switch window from go-live; hold and erasure rules). Amended by ADR-IM-019 (2026-11-04, import drafts discarded 14 days after their last change). Amended by ADR-IM-020 (2026-11-04, downloads streamed and capped at 1,000,000 rows; Asym-data downloads need export permission).

- **Record:** `docs/features/imports-migration/grill/decision-log.md` §1 Q15.
- **Evidence:** `grill/q15-retention-scale/`, research r1–r4 and `q15-adversarial-review.md` (edge cases K1–K25, invariants R1–R8, AC1–AC16, counsel questions).
- **Amends:**
  - ADR-IM-001: Q1 clauses 1(b) and 10.
  - ADR-IM-012: everyday-import undo window.
  - ADR-IM-013: post-go-live corrections.
  - ADR-IM-014: retained manifest, erasure, download grants.

## Context

A Switch puts a ministry's whole donor database into Asym as raw exports. Q1, Q13 and Q14 needed the final export after go-live but set no end date.

- **Phase 29 rules:**
  - it forbids a universal retention period and any keep-forever fallback;
  - unknown limits block a profile;
  - a browser download never proves custody.
- **Phase 12** blocks bulk export of restricted-worker records.
- **ADR-0038** sets the house rules:
  - independent access, retention, hold and disposal axes;
  - holds that never auto-release;
  - grace before shortening takes effect;
  - disposal proof without names or hashes.
- **The FTC's 2024 Blackbaud order** treats over-retention as a violation and requires a published schedule.
- **Supabase:**
  - Storage has no lifecycle rules for current objects;
  - deleting `storage.objects` rows with SQL leaves the bytes behind;
  - database backups exclude Storage.
- **Inngest:** run limits rule out long timers, and its concurrency limit counts steps.
- **Phase 28's** 7-day / 24-hour purge is scoped to the self-import and is unimplemented.

## Decision

1. **Final export.** Deleted at the earlier of 90 days after Switch closed or 24 months after go-live. Only a Legal hold delays it, and there are no extensions.
2. **Other retention classes:**
   - **30 days after being superseded or signed off:** superseded and practice exports, backfill inputs, the switch-off export, and kept-list returns.
   - **24 hours:** unfinished uploads.
   - **30 days after commit:** everyday import files and undo values.
   - **When that import's reversal window ends:** plan-edit cell values. Row, column, who and when remain.
3. **Verify your copy.** The ministry keeps the files it exported. Its browser verifies them against the recorded digests at sign-off and before deletion, uploading nothing.
   - **No raw export back:** Asym never sends the raw export back.
   - **Later imports:** they need an exact digest match per file, including each file inside a ZIP.
4. **Staging and waiting rows.**
   - **Staging:** deleted 30 days after each run (the final run's 30 days after go-live).
   - **Corrections:** they re-read the held export, or use a reviewed correction file.
   - **Waiting rows:** downloaded on demand as text-typed spreadsheets.
5. **Abandoned Switches.** Purged after 180 days without owner activity, with warnings first; viewing doesn't count as activity. Never-visible committed rows of an abandoned aborted Switch are disposed.
6. **Practice copies.** Q6 unchanged.
7. **Run evidence.** Kept for the life of the account, with no donor or supporter row content.
8. **Erasure.**
   - **Immediately:** suppressed through Source Record Binding tombstones.
   - **Within 14 days:** held files are rewritten (money amounts and source IDs kept), with the original digest kept on record.
   - **No separate list:** there is no separate erasure list.
9. **Legal hold.** Typed, scoped and reviewed. It never auto-releases.
10. **Account closure.** Switch files are deleted within 30 days of closure, unless held.
11. **Everyday-import undo.** Available for 30 days.
12. **The retention sweep.**
    - **How it deletes:** daily, through the storage service; each deletion is verified and logged with no personal data. It runs report-only first.
    - **What Asym publishes:** the retention schedule, and the backup windows (stated, then rolled off).
    - **Where data lives:** files stay in the tenant's region, and job payloads carry IDs only.
13. **Size profile.**
    - **Files:**
      - CSV up to 2 GB.
      - XLSX up to 50 MB, or 1 GB uncompressed at no more than 100:1.
      - ZIP allowed, with per-entry limits.
    - **Per Switch:** up to 10 GB and 20 million rows.
    - **Uploads:** resumable, directly to storage.
    - **Concurrency:** one heavy job per ministry, enforced by a lock.
    - **Proof:** confirmed in the full-size practice run.
14. **The old system.** The ministry keeps read-only access or its own export for its legal duties. Asym is never the old system's archive.

## Considered options

- **A (delete 30 days after sign-off).** Rejected: corrections during the tail would depend on re-uploads.
- **C (keep 7 years).** Rejected: over-retention, and Asym becoming the archive.
- **Downloading the raw export.** Rejected: a bulk export of restricted records, and no proof of custody.
- **Keyed-hash erasure list.** Rejected: redundant with tombstones.
- **Extensions.** Rejected: they drift towards keep-forever.
- **Per-tenant settings or per-jurisdiction engines.** Rejected: complexity without need.
- **CSV error files with formula escaping.** Rejected: they corrupt values.
- **Queue timers.** Rejected: queue runs can't last that long.

## Consequences

- **Owner requirements:** O70 (Phase 29 classes, holds, sweep and size profile), O71 (region, backups, published schedule, IDs-only payloads), O72 (Phase 3 erasure in held files), O73 (Phase 9 undo window) and O74 (Phase 12 hold capabilities; no raw-export capability).
- **O64:** signed URLs become actor-bound download grants (D53).
- **Discrepancies:** D52–D56.
- **Monitors M-Q15-1 to M-Q15-7:**
  - nothing past its date;
  - deletion failures;
  - rewrite latency;
  - unverified copies;
  - profile headroom;
  - heavy-job wait;
  - overdue holds.
