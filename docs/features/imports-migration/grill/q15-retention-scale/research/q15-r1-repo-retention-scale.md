# Q15 R1: Repository evidence on retention and scale for Switch files and working data (F11)

Read-only research, 2026-11-03, on develop `629cb71dc`. Phase 29 citations come from unmerged PR #2430 head `1483a349` (`PR2430:`). `DL` = `grill/decision-log.md`. This file extends `r04` §1.3, §6 and §8. **Unverified** means not confirmed at a primary source in this pass.

## 1. Ratified Phase 30 clauses that depend on retention

| Clause                          | Quote                                                                                                                                                                                                | Implies                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Q1 1(b) `DL:41`; Q13 7 `DL:662` | "importable later only from the retained final manifest"; recognition records "can also be added later from the retained final manifest"                                                             | Final-manifest bytes outlive go-live. **No end date.**      |
| Q14 9 `DL:766-767`              | files "wait in the retained final manifest in Phase 29 custody"; care/personnel: "The ministry keeps them, and Asym records their digest"                                                            | Kept until undated owner homes exist                        |
| Q1 5, 9 `DL:45`, `DL:49`        | replay "recognizes prior work"; "identity never rests on a file digest"; "sign-off binds to a report version"                                                                                        | Durable digests and report versions, not bytes              |
| Q1 12 `DL:52`                   | the decommission checklist covers "the SiteStacker data deletion or retention decision"                                                                                                              | SiteStacker readability is the ministry's call              |
| Q8 `DL:27`, `DL:354-356`        | "SiteStacker may be switched off only after its last charge, its final export in custody and its Q4 tax documents"; reversal windows of 120/180/60/90 days                                           | A second export goes into custody; its lifetime is unstated |
| Q2 4, 5 `DL:76-77`              | NOW material "disposed when superseded by real-run evidence or when the engagement ends"; agreement covers "retention including backups, deletion"                                                   | F11 supplies the numbers                                    |
| Q4 4 `DL:150`, `DL:152`         | "Canada: receipt copies 2 years … books and source records 6 years"; "Asym takes no custody of previous-system tax documents in v1"                                                                  | The ministry keeps the records                              |
| Q6 `DL:241`, `DL:269-272`       | "A new practice run replaces the previous one"; "14 days" plus one extension; destroyed "within 24 hours of any erasure, new restriction or source-file disposal"; receipt states "backup expiry"    | Copy lifetime is tied to source disposal                    |
| Q9 `DL:411`                     | "Each permission keeps its evidence"                                                                                                                                                                 | Consent evidence lasts as long as the permission            |
| Q12 8 `DL:604`                  | "A field is restored only if it still holds the imported value"                                                                                                                                      | Before-images, kept for an unstated period                  |
| Q13 12–13 `DL:705`, `DL:708`    | "re-adopted from the corrected source"; "Same rules as Asym gifts … keeps the money facts"; "No per-country retention engine"                                                                        | The corrected source may be a new export                    |
| Q14 11 `DL:774-776`             | "except under a recorded legal hold"; "Review dates are set per family by the ministry (F11). Safeguarding records are never deleted automatically"; "Retained manifests support per-person erasure" | F11 owes review-date defaults and an erasure mechanism      |

**Verdict.** No ratified clause sets a duration for any Switch artifact. Three clauses keep the final manifest open-ended after go-live: Q1 1(b), Q13 7 and Q14 9.

## 2. Phase 29 custody (ratified, published, unmerged)

- **No default period:** "No universal number of years, read-reset clock, global hold boolean or unconditional retain-forever fallback" (`PR2430:custody-and-integration.md:176`). Founder brief: "Do not invent a universal seven-year policy … or treat indefinite retention as automatically safest" (`founder-brief.txt:289`).
- **Derivatives have their own class:** "Derived previews … temporary candidates, originals … audit/control evidence and backup copies follow their actual class rules" (AC29-D12-05, `:182`). "Staging, candidates, orphans and held copies count against capacity" (`:153`).
- **F30 row:** "Qualify target command, allowed mapping/classification/retention, private input/derivative custody" (`:368`). Develop owner constraints add: "No second file store or invented retention period" (`owner-constraints.md:170`).
- **Limits:** "Unknown limits block that profile; vendor or avatar limits are not ordinary defaults" (`:400`).
- **Disposal and backups:** "No blanket age-based purge" (`records-policies.md:111`). "A database backup excludes any object bytes it does not actually contain" (`:220`).

**Verdict.** Phase 29 executes retention but does not choose it. Phase 30 must declare classes for originals, parsed derivatives, error artifacts and evidence.

## 3. Phase 28 D17 self-import profile (develop, ratified)

- **Limits:** "≤10 MiB … rows ≤10,000 … parsed slots ≤500,000 … XLSX package ≤128 MiB" (`relationships.md:473`). These are "admitted qualification limits, not demonstrated capacity" (`:481`).
- **Custody and clocks:**
  - "staging, previews, error files and recovery material use private P29 purpose-bound custody" (`:495`);
  - access "ends seven days after server-recorded finalized upload … Unfinished uploads … within 24 hours" (`:497`);
  - purge "within 24 hours after expiry … backups have their separate bounded schedule" (`:499`);
  - recovery "uses minimized accepted-effect receipts, not expired raw rows" (`:501`).
- **Scoped to this profile:** "do not reuse those numbers for preparation or referral content" (`:842`).
- **Origin:** "an explicit, unmeasured D17 product judgment, not an inherited owner requirement" (`missionary-workspace-depth/grill/d17-evidence/owner-boundaries.md:300-303`).
- **Not owner text:** `IMPORT_HOLD_REVIEW_DAYS = 90` is a ticket pin (`r10-gap-g1.md:226`). The #2347 and #2368 bodies are quoted only through `r04` §1.5 (unverified here).

**Verdict.** These numbers bind the missionary profile only. A seven-day raw window contradicts Q1 1(b).

## 4. Owner retention for imported facts

- **Phase 6 A14:** "official … ≥7 years, prefer permanent as the Phase 6 product baseline, not a universal legal obligation" (`phase-06-shared-communication-event-model.md:175`).
- **Phase 16 S.6:**
  - command/audit and consent/stop evidence: "seven years after the later of arrangement end or last related financial activity" (`:2548`);
  - "normalized money/receipt facts: Phase 7/13 statutory retention" (`:2549`);
  - raw provider material: "90 days" (`:2550`).
- **Phases 7 and 13:** no numeric period was found. Phase 7 defers pruning to "the retention phase" (`:392`). Phase 13: "GDPR-erased donors remain pseudonymized and must not be re-identified" (`:746-747`).
- **Phase 3:** DSAR is a "seam reserved, not built" (`:321`).
- **Phase 20:** "minimal release manifest, digests … remain durable … sensitive bytes follow purpose-owned retention" (`:767-771`).
- **ADR-0038:**
  - an artifact "is never redacted and represented as the same artifact" (`:50`);
  - Canadian custody must be "located in Canada rather than merely reachable from Canada" (`:93-94`).
- **Statutory (research only):**
  - IRS generally 3 years, Schedule A 5, UK Gift Aid 6; CRA records abroad "do not meet the requirement" (`q13-r5:90-96`);
  - safeguarding 70–75 years (`q14-r4:63`).

## 5. Run and audit evidence

- **Roadmap:**
  - "Phase 30 owns … import-run evidence" (`roadmap.md:4377`);
  - "reconciliation against the source export" (`:4363`);
  - "Retain permitted before-images and batch provenance where required" (`:4371`).
- **Owner constraints:** "time-boxed batch undo with before-image capture" (`owner-constraints.md:378-380`).
- **ADR-0173 clause 26:** "Product rows retain only bounded identifiers, dispositions, digests, counts … staged content bodies and verbose issue/result artifacts stay in Phase 30 private staging/custody" (`:259-263`).
- **Precedents:**
  - "Retain the PII-minimized Run Evidence Record" (`phase-19-…md:573`);
  - Phase 15 drafts are purged after "~90 days … PII pruned, lifecycle facts kept" (`:772`).

**Verdict.** No duration is set. Every precedent keeps a durable, minimized core (counts, totals, digests, IDs) and gives personal content a shorter custody life.

## 6. Scale

| Fact             | Value                                                                                           | Source                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Local Storage    | `file_size_limit = "50MiB"`; `max_rows = 1000`                                                  | `supabase/config.toml:106`, `:18` (hosted unverified)                                                              |
| Upload caps      | 10 MB general; 5 MB profile images                                                              | `packages/config/constants.ts:57`; `packages/api/src/upload/image.ts:26`                                           |
| Buckets          | `profiles` and `document-uploads` are public; only the Eve replay bucket is private             | `20250101000000_init_schema.sql:461-464`                                                                           |
| Vercel           | no `maxDuration` or `bodySizeLimit`; "import, reconciliation … use the owning durable workflow" | `apps/*/vercel.json`; `docs/adr/0177-…md:176-178`                                                                  |
| Inngest 4.25.0   | 1,000 steps; 4MB per step; 32MB run state; batch send "up to 512kb"                             | `packages/api/package.json:204`; `docs/ai/skills/inngest-durable-functions/SKILL.md:46-48` (installed docs absent) |
| Q14 files        | "25 MB per file by default; Phase 29 sets the profile"                                          | `DL:750`                                                                                                           |
| Volume           | about 200k, 0.9M and 5M+ gift rows                                                              | `q13-r5:10-12` (derived)                                                                                           |
| SiteStacker      | long exports error out, so manifests are partitioned into several files                         | `q02-r1:171`; `q01-r5:147` (snippet-only)                                                                          |
| Supabase backups | daily 7/14/30 days; PITR 7/14/28; Storage objects are not in DB backups                         | `q06-r4:36-39`                                                                                                     |

**Verdict.**

- No staff-migration profile exists, and `q01-r5:303` already recommended "not D17 bounds".
- The 10,000-row D17 cap is about 1–5% of a mid-size giving history.
- Inngest caps mean rows must be referenced from custody, not passed through steps.
- Vercel's request-body cap of about 4.5 MB (external, unverified) forces uploads to go directly to storage.

## 7. Current code

- **No import purge job:** Inngest crons cover only dispatch recovery, sagas and Stripe events (`packages/api/src/workflows/functions/`). There is no `pg_cron`.
- **Only retention engine:** Eve, with categories of 180 or 30 days (`20260718022535_eve_retention_replay_tracer.sql:17-22`) and `incident`/`legal` holds (`:80-84`).
- **No storage lifecycle policies and no import tables.**
- **Backups:** the only proof is a local `pg_dump` (`docs/ops/scale-observability-reliability.md:78-93`). No hosted backup plan, PITR setting or region is documented.

## 8. Erasing one person inside a retained file

- **Requirement:** only Q14 11 and O64 (`DL:776`, `:942`).
- **No mechanism:** "No rule covers … erasing one person inside an immutable manifest" (`q14-r3:115-121`).
- **Conflicts:** Phase 29 byte immutability and ADR-0038:50.
- **Overengineering warning:** Phase 26 calls a "crypto-shredding framework" overengineering (`support-hub/grill/phase26-d16-data-review.md:147`).
- **Existing support:** bindings "block re-creation after erasure" (`CONTEXT.md:96`).
- **Options (unverified):**
  - a redacted successor version that keeps the original digest as evidence;
  - disposing of the whole manifest;
  - per-person keys (crypto-shredding).
- **Knock-on effect of a successor version:** exact-repeat recognition and the Q14 digest match must use the _recorded_ original digest.

## Retention dependencies map

| Artifact                               | Depends on it          | Minimum life implied                                          |
| -------------------------------------- | ---------------------- | ------------------------------------------------------------- |
| Practice-run exports and staging       | Q1 3, Q6 1–2           | Until superseded                                              |
| Final manifest bytes                   | Q1 1(b), Q13 7, Q14 9  | Until exclusions are imported or abandoned (**open-ended**)   |
| Manifest digests and control counts    | Q1 5, Q1 9, Q14 9      | Life of the Switch record                                     |
| Staged rows, Waiting rows, error files | Q13 11, Q1 10          | Until go-live, then minimized receipts                        |
| Backfill files                         | Q1 6, Q8 6             | Through tail closure (≤12 months plus 180 days plus disputes) |
| Decommission final export              | Q8 6                   | Undecided; may become the only legacy copy                    |
| Reconciliation sign-offs               | Q1 9, Q13 11, C23      | Life of the money facts (figure undefined)                    |
| Before-images                          | Q12 8                  | The undo window (unstated)                                    |
| Source Record Bindings                 | Q1 5, erasure blocking | Indefinite, without identifying data                          |
| Practice copies                        | Q6 6–7                 | ≤28 days, plus backup expiry of 7–30 days                     |
| Sealed-export digests                  | Q14 9                  | Until the sealed import completes                             |

## Discrepancies

1. **Book of record.** Q4 (`DL:152`) and `q13-r5` say Asym is not the book of record. But Q8's switch-off condition and Q1 1(b)'s open-ended manifest can make Asym custody the only legacy copy, and ADR-0038's in-Canada rule may then apply.
2. **D17 clocks.** They are unmeasured and scoped to that profile (`relationships.md:842`), so they cannot serve Q1 1(b).
3. **Erasure versus immutability.** Q14 11 per-person erasure conflicts with byte immutability and with Q1 5 exact repeat.
4. **Undo window.** Owner constraints say "time-boxed" undo; Q12 8 sets no window.
5. **Money-fact retention.** "Phase 7/13 statutory retention" has no number in owner text, and Q13 13 inherits it.
6. **Public buckets.** Only public buckets exist, yet Q14 6 forbids them for imported files.
7. **Practice-run inputs.** Q6 1 "replaces" the previous run but does not say whether the earlier source bytes are disposed.

## Founder-decision candidates

1. **Final manifest lifetime:**
   - (a) until exclusions are resolved, capped at a fixed period after Switch closed;
   - (b) a ministry review date with a default;
   - (c) a statutory-length archive, which makes Asym a record keeper and brings in Canada residency.
2. **Working data.** Should staging, Waiting rows, error files and practice inputs be disposed at sign-off or Switch closed plus N days, keeping only minimized receipts?
3. **Run evidence.** Should it be durable but content-free (counts, totals, digests, sign-offs)?
4. **Ministry copy.** Must the ministry keep its own copy of the final export?
5. **Erasure mechanism.** Choose between a successor version, whole-manifest disposal and crypto-shredding.
6. **Size profile.** Set staff-migration numbers measured from the Q2 declaration's volume figures (`DL:72`), plus a multi-file rule.
7. **Review dates.** Set defaults for Q14 families (safeguarding never auto-deleted).
8. **Before-image window** for everyday-import reversal.
9. **SiteStacker readability.** Is the minimum the Q8 switch-off conditions, with any longer period left to the ministry's decommission decision?
