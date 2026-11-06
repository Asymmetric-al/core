# Q15 — Retention of Switch files and working data; size profile: decision as asked and chosen

Founder answer (2026-11-03): **"b. think though edge cases and also research modern best pratices."** The founder also required a full, ruthless adversarial review across all 22 categories.

## Options as asked

- **A. Asym keeps fingerprints, not files.** Raw files are deleted 30 days after sign-off and only their digests are kept. Later imports and corrections use the ministry's own copy, matched by digest.
- **B. Asym keeps the final export through the tail, then fingerprints only (chosen).**
- **C. Asym keeps everything for 7 years.**

## Option B as proposed

1. **Final export.** Asym keeps it until 90 days after the Switch is closed (normally no more than about 15 months after go-live), then deletes it.
   - The ministry must download its own copy at sign-off and is reminded before deletion.
   - Later imports use the ministry's copy, matched by digest.
2. **Practice and superseded exports.** Deleted 30 days after they are replaced.
3. **Working rows.** Staged rows are deleted 30 days after go-live. Corrections re-read the final export.
4. **Error lists.** Made on demand and never stored.
5. **Abandoned Switch.** Purged after 180 days without activity, with a warning first.
6. **Practice copies.** Q6's 14 days plus one extension, unchanged.
7. **Run evidence.** Counts, totals, digests, mappings, sign-offs and who did what are kept for the life of the account, with no personal data.
8. **Erasure.**
   - While Asym holds the export, it is rewritten without the erased person within 30 days.
   - After that, a minimal erasure list is applied whenever a ministry copy is re-uploaded.
9. **Size profile.** These are starting values, confirmed by a full-size practice run.

   | Limit           | Value                                     |
   | --------------- | ----------------------------------------- |
   | CSV, per file   | Up to 2 GB                                |
   | Excel, per file | Up to 50 MB, with a compressed-bomb check |
   | Per Switch      | Up to 10 GB and 20 million rows           |
   | Per ministry    | One heavy job at a time                   |

10. **The old system.** The ministry keeps read-only access or its own complete export to meet its legal retention duties. Asym is never the old system's archive.

## Ratified context

- **Q1:**
  - clause 1(b): later imports from the retained final manifest;
  - clause 5: Exact repeat import;
  - clause 10: abort;
  - clause 12: decommission.
- **Q2:** custody and approved environments.
- **Q4:** no Asym custody of old tax documents.
- **Q5:** capabilities and Asym help access.
- **Q6:** practice copies last 14 days plus one extension.
- **Q8:** the licence ends once the final export is in custody.
- **Q9:** consent evidence.
- **Q12:** reversal of everyday imports.
- **Q13:** correction runs re-adopt from the corrected source.
- **Q14:**
  - clause 9: ministry-held sealed exports with digests;
  - clause 11: per-person erasure inside retained manifests.

## Governing ADR

ADR-0038 (purpose-owned records schedules and verified disposal) covers:

- independent access, retention, hold and disposal axes;
- monotonic holds that never auto-release;
- grace before disposal;
- PII-light disposal proof without hashes;
- Canadian custody located in Canada for issuer records.

## Research

- `research/q15-r1-repo-retention-scale.md`
- `research/q15-r2-external-retention-scale.md`
- `research/q15-r3-repo-verification.md`
- `research/q15-r4-external-edge-cases-and-practice.md`

Research files r3 and r4 were added for the full review.
