# Q15 adversarial review: retention of Switch files and working data; size profile

Founder answer (2026-11-03): **"b. think though edge cases and also research modern best pratices."** The founder also asked for a full ruthless review. Decision as asked: `q15-decision-as-asked.md`.

## Evidence

- `research/q15-r1-repo-retention-scale.md`: ratified dependencies, Phase 29 rules, Phase 28 limits, owner retention numbers and platform limits.
- `research/q15-r2-external-retention-scale.md`: vendor retention, law, the FTC Blackbaud order, backups and scale.
- `research/q15-r3-repo-verification.md`: ADR-0038, ratified clauses, Phase 29, erasure, downloads and residency.
- `research/q15-r4-external-edge-cases-and-practice.md`: disposal practice, Supabase and Inngest facts, digests, downloads, edge cases and undo windows.

**Re-verified directly on 2026-11-03.**

- **ADR-0038 sets the house rules for purpose-owned records:**
  - independent access, retention, hold and disposal axes;
  - holds with review dates that "never auto-release";
  - shortening "never immediately mass-deletes";
  - disposal proof keeps no "raw identities, content, locations, and hashes";
  - an exact artifact "is never redacted and represented as the same artifact";
  - Canadian issuer records are "located in Canada rather than merely reachable".

  Scope: ADR-0038 is a Phase 18 document ADR. It binds Phase 30 by analogy, and its Canada rule covers Canadian receipt issuers.

- **Phase 12 export block.** "Restricted-worker records are non-exportable by default … bulk contact/export across a restricted set is blocked outright with justification + audit" (`phase-12:1641`).
- **Tenant External Copy Assertion** (root `CONTEXT.md:5691-5696`). It is "useful custody evidence but does not prove security, recoverability, legal sufficiency, verified transfer, or permission to dispose of an Asym-held copy."
- **Phase 29 (PR #2430 head `1483a349`).**
  - A browser download "never proves destination custody" (`custody-and-integration.md:154`).
  - Phase 29 forbids a "universal number of years … retain-forever fallback" (`:176`), and unknown limits block a profile (`:400`), both per r1/r3.
- **Source Record Binding** (Phase 30 glossary `CONTEXT.md:95-97`). It "blocks re-creation after erasure."
- **Q6:** a Practice copy lives 14 days with one 14-day extension.
- **Q8:** the SiteStacker licence ends once "its final export is in custody".

Research, not legal advice. Counsel items are in §6.

**Disposition: accept with required amendments.** The durations in B match practice and the platform. Eight parts of B as worded were wrong or missing:

1. **"Download your own copy" collides with Phase 12 and Phase 29.** The ministry already holds the files it exported. It verifies them locally instead, and Asym never sends the raw export back.
2. **There is no hard upper bound.** The tail can be extended (disputes, Canadian PAD), so "Switch closed + 90 days" is open-ended. Add a 24-month cap.
3. **"No personal data" in run evidence is false.** Actors are staff, mapping headers can name workers, and per-designation totals can name restricted workers.
4. **The separate erasure list is redundant.** Bindings already block re-creation. A permanent hash store also runs against Phase 12's no-blind-index rule.
5. **30-day erasure is too slow.** Suppress immediately and rewrite within 14 days.
6. **Legal holds, backfill inputs, everyday-import files and undo windows, unfinished uploads, tenant closure, abandoned aborted Switches and backups are all missing.**
7. **Three ratified clauses promise an open-ended "retained final manifest".** Those are Q1 1(b), Q13 and Q14 clause 9.
8. **One heavy job per ministry** needs a database lock, not just a queue setting.

The corrected decision text is in §3.

---

## 1. Category review

### 1.1 Problem validity, necessity and alternatives: material concern, yes (narrows the answer)

**The problem is real.**

- Phase 29 forbids keep-forever and needs finite, measured profiles.
- The FTC Blackbaud order requires a published schedule with purpose and timeframe. It counts keeping former customers' data "for years longer than necessary" as a violation in its own right (r4 §1).
- Q1, Q13 and Q14 each need the final export after go-live.

**Strongest alternative: A** (delete raw files 30 days after sign-off).

- A is safer for data minimisation.
- But during the tail, Q13 corrections and newly arriving owner homes (Q14) would depend on the ministry re-uploading multi-gigabyte files.
- B holds the file only while it is most likely needed, then falls back to A's model.
- B stays, with a hard cap.

**No-build alternative:** let the ministry keep everything and Asym keep nothing. That is A, rejected above.

**Too vague in B:**

- "Download its own copy" has no capability, channel or verification. It is replaced by Verify your copy (§3 clause 3).
- "Normally ≤ ~15 months" has no bound. It is replaced by the earlier of Switch closed + 90 days, or 24 months after go-live.
- "No personal data" is inaccurate. It is replaced by "no supporter or donor row content".

**Nothing unnecessary is frozen.** The numbers are requirements. Mechanisms such as the sweep, hashing library and lock type stay design choices.

### 1.2 Brittleness: material concern, yes

| Fragile assumption                                | What breaks                                                                                             | Fix                                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| The ministry still has an unmodified copy         | Re-saving in Excel, re-zipping, or line-ending or byte-order-mark conversion changes the digest (r4 §3) | Verify your copy at sign-off and at the 30-day and 7-day notices. Plain guidance: "keep the files exactly as exported; don't open and save". |
| ZIP digests stay stable                           | Re-zipping changes the ZIP's bytes                                                                      | Digests are recorded per file inside a ZIP (name, size, SHA-256), never for the ZIP container                                                |
| The tail ends on time                             | Disputes and the PAD extension push Switch closed out indefinitely                                      | Hard cap of 24 months after go-live, unless a legal hold applies                                                                             |
| Inngest can hold a 15-month timer                 | Runs last at most 90 days on Pro (r4 §2)                                                                | A daily database-driven retention sweep                                                                                                      |
| A queue setting stops two heavy jobs per ministry | Inngest concurrency counts steps, not runs (r4 §2)                                                      | A lock on the Switch row (lease), checked by every heavy job                                                                                 |
| Deleting `storage.objects` rows deletes the file  | SQL deletes leave the bytes behind (r4 §2)                                                              | Delete through the Storage API, then verify by listing                                                                                       |

### 1.3 Technical debt: material concern, yes

- **A permanent keyed-hash erasure list** would be a second identity store beside Source Record Bindings, and it conflicts with Phase 12's no-blind-index rule and Phase 26's warning (r3 §4). _Removed:_ binding tombstones do the job.
- **Ad-hoc deletion code per artifact.** _Instead:_ one retention class table (artifact class → trigger → period → hold check), one sweep and one deletion log (O70). Each new artifact must declare a class or it can't be stored, which follows Phase 29's "unknown limits block".
- **Queue payloads carrying rows** would put personal data outside the schedule and possibly outside the region. Inngest's data region is unpublished (r4 §2). _Rule:_ job payloads carry IDs only.
- **CSV error lists with formula escaping** corrupt values such as "+1 555…" phone numbers on re-upload (r4 §5). _Instead:_ waiting-row downloads are XLSX with every cell typed as text. That is safe to open and round-trips exactly.

### 1.4 Edge cases: material concern, yes

| #   | Case                                                                             | Handling                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K1  | A person asks for erasure while Asym holds the export                            | Suppressed immediately: their binding becomes an erased tombstone, and every parse skips them. Within 14 days each affected file is rewritten in the same format without the person's own rows, with identity fields blanked in rows that reference them. Money amounts and source IDs stay (Q13). The rewrite is a successor artifact; the original digest stays on record for matching. |
| K2  | An erased person appears in free text (another person's note)                    | Not row-erasable. Handled by owner erasure on committed records (Q14 clause 11). The held raw file follows its deletion date.                                                                                                                                                                                                                                                             |
| K3  | Erasure after Asym has deleted the export                                        | Nothing held. The binding tombstone makes any later re-upload skip the person.                                                                                                                                                                                                                                                                                                            |
| K4  | The ministry re-uploads its copy for a later import, but the copy was edited     | Digest mismatch: the plan blocks with "This file doesn't match the one recorded at the Switch". A deliberate correction goes through Q13's correction run, which is a separate reviewed file with its own digest.                                                                                                                                                                         |
| K5  | The ministry lost its copy and the old system is decommissioned                  | Families not yet imported can't be imported under the Switch. They become permanent "not imported" exclusions. Prevention: Verify your copy at sign-off and before deletion.                                                                                                                                                                                                              |
| K6  | The ministry asks Asym for its raw files back                                    | Not offered. Asym never returns the raw export, because of Phase 12's restricted-record export block and minimisation. The ministry holds what it exported. Committed data stays exportable through the owners' normal exports.                                                                                                                                                           |
| K7  | Litigation, a regulator or an auditor request arrives while files are held       | A legal hold (typed reason, scope, owner, review date) stops every deletion path. It never auto-releases; a named person releases it with a reason.                                                                                                                                                                                                                                       |
| K8  | The same request arrives after deletion                                          | Run evidence (counts, totals, digests, mapping versions, sign-offs, actors) and the committed records answer it. The deletion log shows when and under which rule.                                                                                                                                                                                                                        |
| K9  | The tenant closes its account while files are held                               | All Switch files and staging are deleted within 30 days of closure, unless a legal hold applies. Run evidence follows the tenant-closure rules for its other records.                                                                                                                                                                                                                     |
| K10 | A Switch is aborted before go-live and never resumed                             | After 180 days without owner activity (warnings at 150 and 173 days), files and staging are purged. Committed-but-never-visible rows are disposed through the owners' verified disposal path. This amends Q1 clause 10's "never deleted" for abandoned Switches only.                                                                                                                     |
| K11 | Reads or downloads keep an abandoned Switch "active"                             | Only owner actions reset the idle clock: uploading, mapping, planning, committing, signing off or extending.                                                                                                                                                                                                                                                                              |
| K12 | The tail is extended past 24 months                                              | The final export is deleted at 24 months anyway (hold excepted). Backfills use processor reports, not the export (Q1 clause 6).                                                                                                                                                                                                                                                           |
| K13 | Legacy Tail Backfill input files, Q8's switch-off export, Q9's kept-list returns | Same class as superseded exports: deleted 30 days after the backfill or return is signed off                                                                                                                                                                                                                                                                                              |
| K14 | Unfinished uploads (an abandoned resumable upload)                               | Deleted after 24 hours                                                                                                                                                                                                                                                                                                                                                                    |
| K15 | Several runs before go-live                                                      | Each run's staging is deleted 30 days after that run is committed or discarded. The final run's staging is deleted 30 days after go-live.                                                                                                                                                                                                                                                 |
| K16 | A correction is needed after the staging deletion                                | The correction run re-parses the final export while held, or a ministry-supplied correction file (Q13)                                                                                                                                                                                                                                                                                    |
| K17 | Database backups still contain deleted staging                                   | They roll off within the backup window (7–30 days; PITR up to 28, per plan). The published schedule states the window. Storage files aren't in database backups, so file deletion is final.                                                                                                                                                                                               |
| K18 | A Canadian ministry                                                              | Raw files and staging stay in the tenant's hosting region. No copies go to queues, logs or other regions. Whether CRA books-and-records location rules reach Asym's working copy is a counsel question. The ministry's own copy is its record.                                                                                                                                            |
| K19 | An XLSX "bomb" (huge decompressed size)                                          | Refused before parsing: over 1 GB uncompressed, or a ratio above 100:1                                                                                                                                                                                                                                                                                                                    |
| K20 | A CSV over 2 GB, or a Switch over 10 GB or 20M rows                              | Refused, with "split by family or year" guidance. Asym help access (Q5) can advise. Raising the profile is a recorded Phase 29 profile change.                                                                                                                                                                                                                                            |
| K21 | Two staff start heavy jobs at once                                               | The second waits ("Another import is running for your ministry"). Never in parallel.                                                                                                                                                                                                                                                                                                      |
| K22 | An everyday import reversal after the window                                     | Not offered. The window is 30 days, after which the prior values are deleted (★, answers Q12's open window and D3).                                                                                                                                                                                                                                                                       |
| K23 | Everyday import source files                                                     | Deleted 30 days after commit; error lists on demand                                                                                                                                                                                                                                                                                                                                       |
| K24 | Practice copies                                                                  | Q6 unchanged (14 days plus one 14-day extension)                                                                                                                                                                                                                                                                                                                                          |
| K25 | A staff member named in run evidence is later erased                             | Actor shown as "former staff member". Counts and digests stay.                                                                                                                                                                                                                                                                                                                            |

### 1.5 Footguns: material concern, yes

| Footgun                                   | Harm                                              | Prevention                                                                             |
| ----------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Opening the export in Excel and saving it | The copy no longer matches; later imports blocked | Plain guidance at sign-off; Verify your copy catches it early                          |
| Releasing a legal hold by mistake         | Premature deletion                                | Release needs a named person and a reason, is audited, and never happens automatically |
| An engineer deleting files with SQL       | Bytes remain while records say deleted            | Storage API only, with verification and a deletion log (O70)                           |
| Extending retention "just in case"        | Keep-forever by drift                             | No extensions on the final export. Only a legal hold stops deletion.                   |
| Downloading raw files                     | Bulk exfiltration including restricted workers    | No raw download path                                                                   |
| Error lists opened in a spreadsheet       | Formula injection                                 | Text-typed XLSX                                                                        |

### 1.6 Tenant safety: material concern, yes (requirement)

- Every artifact is stored under a tenant-prefixed path with storage RLS keyed to tenant membership and capability.
- Retention classes, holds, the sweep and the deletion log are tenant-scoped. The sweep processes one tenant's artifacts at a time, and its log rows carry the tenant.
- The heavy-job lock is per tenant. Fair scheduling means one large Switch can't starve others (M-Q15-6).
- Digests are compared only within a tenant. No cross-tenant digest index (Q14 J7 pattern).

### 1.7 Database, RLS and authorization safety: material concern, yes

| Concern         | Requirement                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Retention class | Every stored artifact row has a NOT NULL `retention_class` and `delete_after` computed from the class and its trigger. No default class. An unknown class blocks the write.                                  |
| Holds           | A hold table is append-only (placed and released events). The sweep's delete joins it in the same transaction as the tombstone write (the ADR-0038 serialize rule).                                          |
| Deletion        | Storage API delete, then a verification listing. The deletion log (artifact ID, class, size, rule version, deleted_at, actor = system) is PII-light, with no names, content or per-person hashes (ADR-0038). |
| Who acts        | Placing a hold needs a tenant Switch decision holder, or Asym's named legal role, which never reads content (Q5). Verify your copy is recorded against the actor from server context.                        |
| Updates         | No role can shorten `delete_after` below the class rule or lengthen it except through a hold. WITH CHECK forbids changing tenant or class.                                                                   |
| Bindings        | Erased tombstones are immutable and survive erasure (glossary). Unique source identity as in Q13/Q14.                                                                                                        |
| Service role    | Only the sweep, scanner and owner import commands use it, server-side.                                                                                                                                       |

### 1.8 Overengineering: material concern, yes (resolved by removals)

**Removed from B:**

- the keyed-hash erasure list;
- the raw-file download;
- per-tenant retention settings;
- retention extensions.

**Refused:**

- a per-jurisdiction engine;
- cold storage tiers;
- per-person encryption;
- stored error files;
- a 7-year archive.

**Kept:**

- one class table;
- one daily sweep;
- one hold table;
- one deletion log;
- one local verify step.

### 1.9 UX/UI and user friction: material concern, yes

**Sign-off step "Keep your copy" (one screen):**

- It lists each file with its name, size and digest.
- **Verify your copy** hashes the ministry's local files in the browser. Nothing is uploaded. It shows "Matches" or "Doesn't match: this file was changed after export".
- The result is recorded as an attributable copy confirmation (Tenant External Copy Assertion).
- The verify step works file by file, with progress, in about tens of seconds per 2 GB (r4 §3), so it suits slow connections. Hashing is local; nothing large goes over the network.

**Retention timeline.** The Switch summary shows each artifact class with "deleted on {date}" in plain words. Notices go to the Switch lead and Switch decision holders 30 and 7 days before the final export is deleted (in-app plus email; no personal data in email). Each notice includes "Verify your copy".

**Waiting rows.** Download as text-typed XLSX, fix, re-upload.

**Size refusal.** "This file is 2.4 GB. The limit is 2 GB. Export by year or split the file."

**Concurrency.** "Another import is running for your ministry. Yours will start when it finishes."

**Published schedule.** A plain-language retention page for ministries: each artifact, why it's kept, how long, and what starts the clock.

**Accessibility.** Progress uses text and percentages. Match results are text, not colour.

### 1.10 Source of truth, ownership and domain invariants: material concern, yes

| Artifact                                                            | Owner                                 | Kept until                                                                     |
| ------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| Final Source Snapshot Manifest (raw files)                          | Phase 29 custody, as a Phase 30 class | Earlier of Switch closed + 90 days or go-live + 24 months; hold excepted       |
| Practice and superseded exports, backfill inputs, kept-list returns | Phase 29 / Phase 30                   | 30 days after superseded, or after that backfill or return is signed off       |
| Staging rows (per run)                                              | Phase 30                              | 30 days after that run is committed or discarded (final run: go-live + 30)     |
| Unfinished uploads                                                  | Phase 29                              | 24 hours                                                                       |
| Everyday import files                                               | Phase 29 / Phase 30                   | 30 days after commit                                                           |
| Everyday import prior values (reversal)                             | Phase 9 (O51)                         | 30 days after commit                                                           |
| Practice copies                                                     | Phase 30 (Q6)                         | 14 days plus one 14-day extension                                              |
| Run evidence                                                        | Phase 30                              | Life of the tenant, then tenant-closure rules                                  |
| Committed records                                                   | Each owner                            | The owner's retention (outside Q15)                                            |
| The ministry's own copy                                             | The ministry                          | The ministry's legal duties (CRA 6 years and so on); Asym is never its archive |

**Invariants:**

- **R1:** Every stored artifact has exactly one retention class and a computed deletion date.
- **R2:** Nothing past its deletion date exists unless an active hold covers it.
- **R3:** Holds never auto-release.
- **R4:** Deletion is verified and logged without personal data.
- **R5:** A digest matches only exact original bytes.
- **R6:** An erased person is never re-created from any source file.
- **R7:** No raw-file download path exists.
- **R8:** At most one heavy job runs per tenant.

R1 and R7 are enforced in the database. The others are enforced by the sweep, tests and monitors.

### 1.11 Hidden coupling: material concern, yes

**Ratified clauses this decision amends:**

- **Q1 1(b):** "retained final manifest".
- **Q1 clause 10:** "never deleted" for abandoned Switches.
- **Q13 clause 12:** corrections use a corrected source.
- **Q14 clauses 9 and 11.**
- **Q12:** the undo window.

**Owner requirement amendments:**

- O64's "signed URLs" contradict D5's bearer-link ban. It is amended to Phase 29's actor-bound download grants for committed files.
- Phase 28 D17's own 7-day/24-hour purge is untouched. It is ratified but unimplemented (D54).

### 1.12 Failure modes: material concern, yes

| Failure                         | Required behaviour                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| The sweep fails                 | Retried. M-Q15-1 alerts on anything past its date. Nothing is silently kept.                                        |
| A Storage delete errors         | Retried. If still failing after 72 hours, an incident is raised. The log shows "pending deletion", never "deleted". |
| A hold is placed during a sweep | The hold and delete serialise on the tenant guard (ADR-0038). The hold wins if it commits first.                    |
| Verify your copy is interrupted | Resumable per file; nothing stored                                                                                  |
| An erasure rewrite fails        | Suppression already works through the tombstone. The rewrite retries, and M-Q15-3 catches anything past 14 days.    |

### 1.13 Lifecycle, temporal correctness, concurrency and idempotency: material concern, yes

**Artifact lifecycle.** An artifact moves stored → (held) → due → deleting → deleted (logged).

**Forbidden transitions:**

- deleted → restored;
- a hold auto-releasing;
- shortening a class without the ADR-0038 grace.

**Clocks:**

- Retention clocks start from recorded events: sign-off, go-live, Switch closed, superseded, committed, discarded, last owner activity, tenant closure.
- Dates use UTC instants and are shown in the tenant's time zone.
- If Switch closed is re-opened by a Phase 16 extension before deletion, the date moves out, but never past the 24-month cap.

**Idempotency:**

- Deletion keys on the artifact ID.
- Rewrites key on (artifact, erasure event).
- Verify records are per (file digest, actor, time).

**Races:**

- Hold versus delete: serialised.
- Two heavy jobs: lease.
- Erasure during a commit: the tombstone is checked per chunk.

### 1.14 Data integrity risks: material concern, yes

| Risk                                        | Prevention                                   |
| ------------------------------------------- | -------------------------------------------- |
| A later import from an altered copy         | R5 digest match                              |
| Re-creating erased people                   | R6 binding tombstones                        |
| Records saying "deleted" while bytes remain | Storage API plus verification listing        |
| Lost evidence after deletion                | Run evidence kept; the deletion log explains |
| Staging lingering in backups                | Window published; rolls off                  |

### 1.15 Security and privacy risks: material concern, yes

- **Minimisation.** Held for at most 24 months; the FTC-style schedule is published.
- **Exfiltration.** No raw-file download. Verify your copy uploads nothing.
- **Erasure.** Immediate suppression and a 14-day rewrite, inside GDPR's one-month window.
- **Region.** Raw files and staging stay in the tenant's region. Job payloads carry IDs only. Logs carry no content.
- **Evidence.** Run evidence has no donor or supporter row content. Staff actor IDs and designation references follow normal tenant rules and Phase 10 aliasing.
- **Holds.** Placing one never grants Asym content access (Q5).
- **Encryption.** Storage at rest uses AES-256 (Supabase). Crypto-shredding isn't needed, because deletion of whole files is final (r4 §2).

### 1.16 Scalability and performance: material concern, yes (requirement)

**Starting profile** (must be confirmed by the production-shaped practice run, Q13):

- CSV or TSV: ≤ 2 GB per file.
- XLSX: ≤ 50 MB compressed, ≤ 1 GB uncompressed, ratio ≤ 100:1; Excel's sheet cap is 1,048,576 rows.
- ZIP: allowed, with the same per-entry limits.
- Per Switch: ≤ 10 GB and ≤ 20M rows.

**Platform facts:**

- Uploads go directly to storage with resumable uploads, never through Vercel functions (4.5 MB body limit).
- Parsing streams. Supabase allows per-bucket size limits and large resumable files on paid plans (r4 §2).
- Inngest caps a function at 1,000 steps. 20M rows therefore needs ≥ 20,000 rows per step, or fan-out per file and family. Payloads carry IDs only (4 MB step-output cap).

**Unverified:** commit throughput through typed owner commands, and whether signed downloads support resuming partway (HTTP Range) for committed files. The practice run measures the first, and the second is tested before it is promised.

### 1.17 Operational burden: material concern, yes (contained)

- **Asym runs one daily sweep and one monitor set.**
- **Holds are rare and named.**
- **No per-Switch manual deletion.** Nobody repairs storage by hand.
- **The ministry's burden is keeping its export unmodified**, prompted three times.

### 1.18 Observability and auditability gaps: material concern, yes

**Business evidence:**

- the deletion log;
- hold placed and released events;
- Verify your copy records;
- per-artifact retention dates on the Switch summary.

**Security audit:** hold actions and any access to held raw files under Q5.

**Monitoring:** sweep lag, deletion failures, rewrite latency and heavy-job queue time (§4).

### 1.19 Dependency and integration risks: material concern, yes

- **Supabase:** no lifecycle rules for current objects, deletes must go through the Storage API, and backups don't include Storage. Each is handled above.
- **Inngest:** limits on run length, steps and concurrency semantics, and an unpublished region. Handled by IDs-only payloads, a database sweep and a database lease.
- **Production region and backup policy are not recorded in the repo (D55).** That is an owner requirement before the first real Switch (O71).

### 1.20 Migration, rollout and upgrade risks: material concern, yes

- **Schedule changes.** Classes are versioned. A shortened class enters ADR-0038's grace-and-reproof lane and never mass-deletes immediately. A lengthened class needs a recorded reason and never exceeds 24 months for the final export.
- **The sweep runs in report-only mode first.** It runs before deletion is enabled and is proven against storage, search, cache, backup, restore and tenant closure, following ADR-0038's "proven on the actual architecture before irreversible disposal".
- **Kill switch.** Pausing deletion platform-wide is allowed and audited. It never deletes, only delays.

### 1.21 Testability, traceability and proof: material concern, yes

**Tests:**

- **Boundaries:** each class deletes at its date, not a day before. A hold stops it, and release resumes it. Deletion also falls at 24 months even if the Switch is still open.
- **Verification:** a Storage API delete is confirmed by listing.
- **Erasure:** suppression is immediate, the rewrite lands within 14 days, the original digest still matches the ministry copy, and the erased person is skipped on re-upload.
- **Bombs and limits:** refused.
- **Verify your copy:** a modified file is detected.
- **Concurrency:** a second heavy job waits.
- **Authorization:** no raw-download route exists, and only holders can place or release holds.
- **Payload hygiene:** job payloads contain no row content.
- **Production-shaped:** a 10 GB / 20M-row practice run within the step limits.

**Traceability.** New terms: Retention class, Legal hold, Verify your copy, Retention sweep, Size profile. These replace "retained final manifest" wording in Q1, Q13 and Q14.

### 1.22 Other development hazards: material concern, yes

**Counsel questions:**

- Do CRA books-and-records location rules reach Asym's working copy?
- Is GDPR erasure satisfied by suppression plus a 14-day rewrite?
- Is a 24-month cap acceptable for audit and regulator expectations?

**Expectation risk.** Ministries may assume Asym is their archive. Sign-off says plainly: "Asym deletes these files on {date}. Your exported files are your record; keep them."

---

## 2. Disposition

**Accept with required amendments.** B's durations stand. The amendments:

1. replace the download with Verify your copy;
2. add a 24-month cap;
3. correct the run-evidence claim;
4. remove the erasure list;
5. speed up erasure;
6. add holds and the missing artifact classes;
7. amend Q1, Q13 and Q14's open-ended wording;
8. require a database lease.

## 3. Corrected decision (to record)

**Q15 — Retention of Switch files and working data; size profile. Option B, amended.** (★ = changed from what was asked.)

1. **Final export.** Asym keeps the final Source Snapshot Manifest until ★ the earlier of 90 days after the Switch is closed, or 24 months after go-live. Then it is deleted.
   - **Exception:** only a legal hold keeps it longer.
   - **No extensions.**
2. **Shorter-lived files.**
   - **Practice and superseded exports**, ★ Legacy Tail Backfill inputs, Q8's switch-off export and Q9's kept-list returns: deleted 30 days after being superseded, or after that backfill or return is signed off.
   - ★ **Unfinished uploads:** deleted after 24 hours.
   - ★ **Everyday import files:** deleted 30 days after commit.
3. ★ **Your copy is your record.**
   - **The ministry keeps the files it exported.** Asym never sends the raw export back: a full raw export includes restricted workers, and Phase 12 blocks that.
   - **Verify your copy:** at sign-off, the ministry checks its local files against the recorded digests in the browser. Nothing is uploaded. The result is recorded as a copy confirmation.
   - **Reminders:** 30 and 7 days before deletion, with Verify your copy.
   - **What matching means:** a later import (Q1 clause 1(b), Q14 clause 9) uses the ministry's copy, which must match the recorded digest exactly. Digests are recorded per file, including each file inside a ZIP.
   - **Guidance:** "Keep the files exactly as exported; don't open and save them."
4. **Working rows.**
   - ★ **Each run's staging:** deleted 30 days after that run is committed or discarded. The final run's staging is deleted 30 days after go-live.
   - **Corrections:** a correction re-reads the final export while held, or uses a ministry-supplied correction file under Q13's correction run (its own digest and review).
   - **Waiting rows:** downloaded on demand as ★ text-typed spreadsheets (safe to open, values exact) and never stored.
5. **Abandoned Switch.**
   - **Purge:** after 180 days without owner activity, with warnings at 150 and 173 days, files and staging are purged.
   - ★ **What counts as activity:** uploading, mapping, planning, committing, signing off. Viewing does not.
   - ★ **Committed rows:** a Switch aborted before go-live and then purged has its never-visible committed rows disposed by the owners. This amends Q1 clause 10 for abandoned Switches only.
6. **Practice copies.** Q6 unchanged (14 days plus one 14-day extension).
7. **Run evidence.** Counts, totals, digests, mapping versions, sign-offs and actors are kept for the life of the account. ★ It holds no donor or supporter row content. Staff actors and designation labels follow normal tenant rules and Phase 10 aliasing, and an erased staff member shows as "former staff member".
8. ★ **Erasure.**
   - **Immediate:** an erasure suppresses the person in every held file at once, through their Source Record Binding tombstone.
   - **Within 14 days:** each affected held file is rewritten in the same format without the person's own rows, and with their identity blanked where other rows reference them. Money amounts and source IDs are kept (Q13). The rewrite is a successor file, and the original digest stays on record.
   - **Later re-uploads:** tombstones skip erased people. No separate erasure list.
9. ★ **Legal hold.**
   - **Who places it:** a Switch decision holder, or Asym's named legal role, which never reads content (Q5).
   - **What it records:** a typed reason, scope and review date.
   - **Effect:** it stops every deletion path. It never auto-releases; a named person releases it with a reason.
10. ★ **Account closure.** Switch files and staging are deleted within 30 days of tenant closure, unless held.
11. ★ **Everyday import undo** (Q12) is available for 30 days after commit. The stored prior values are then deleted. This answers D3.
12. **How deletion works.**
    - **The sweep:** a daily database-driven sweep deletes through the storage service, verifies the deletion, and logs it with no personal data (ADR-0038).
    - **Rollout:** it runs in report-only mode first, and pausing it is audited.
    - ★ **Published schedule:** Asym publishes the schedule, with each artifact, why it's kept, for how long and what starts the clock.
    - **Backups:** database backups roll off within their stated window. Stored files are not in backups.
    - ★ **Region:** raw files and staging stay in the tenant's hosting region. Job payloads carry IDs only, and logs carry no content.
13. **Size profile** (starting values, confirmed by the production-shaped practice run).

    | Item                    | Limit                                                                |
    | ----------------------- | -------------------------------------------------------------------- |
    | CSV/TSV                 | ≤ 2 GB per file                                                      |
    | XLSX                    | ≤ 50 MB, and ≤ 1 GB uncompressed at ≤ 100:1                          |
    | ZIP                     | Allowed, with per-entry limits                                       |
    | Per Switch              | ≤ 10 GB and ≤ 20 million rows                                        |
    | Uploads                 | Resumable and direct to storage                                      |
    | Heavy jobs per ministry | ★ One at a time, by a lock on the Switch; others wait with a message |

    Raising a limit is a recorded profile change.

14. **The old system.** The ministry keeps read-only access or its own complete export for its legal retention. Asym is never the old system's archive, and committed data remains exportable through the owners' normal exports.

**Acceptance criteria**

- **AC1:** Every stored Switch, backfill and everyday-import artifact has one retention class and a computed deletion date. Writing an artifact without a class fails.
- **AC2:** The final export is deleted at the earlier of Switch closed + 90 days or go-live + 24 months, and not before.
- **AC3:** An active hold prevents deletion on every path. Holds never auto-release. Release needs a named actor and a reason. Placing and releasing are audited.
- **AC4:** Deletion goes through the storage service, is verified by listing, and is logged with artifact ID, class, size, rule version and time. The log holds no names, content or per-person hashes.
- **AC5:** No route returns a raw Switch export file to any role.
- **AC6:** Verify your copy reports a match only for byte-identical files and uploads nothing. A modified file reports a mismatch.
- **AC7:** A later import from a ministry copy is accepted only on an exact digest match per file.
- **AC8:** After an erasure, the person is skipped in every held file and every re-upload immediately. Held files are rewritten within 14 days, and the original digest still matches the ministry's copy.
- **AC9:** Staging for each run is gone 30 days after that run is committed or discarded. Unfinished uploads are gone after 24 hours.
- **AC10:** An abandoned Switch purges after 180 days without owner activity, with warnings at 150 and 173 days. Viewing does not reset the clock.
- **AC11:** Account closure deletes all Switch files and staging within 30 days, unless a hold applies.
- **AC12:** Everyday-import undo is refused after 30 days, and the prior values are gone.
- **AC13:** Files over the profile are refused before parsing with a plain message, including XLSX bombs.
- **AC14:** A second heavy job for the same tenant waits until the first finishes.
- **AC15:** Job payloads and logs contain no row content. Raw files and staging are stored only in the tenant's region.
- **AC16:** The published retention schedule matches the class table exactly (a generated check).

## 4. Ruthless synthesis

### Before recording

- **Amend B as §3.**
- **Record amendments to earlier decisions:**
  - Q1 clause 1(b): "retained final manifest" now means Asym's copy until deletion, then the ministry's digest-matched copy.
  - Q1 clause 10: abandoned Switches.
  - Q13 clause 12: corrections.
  - Q14 clauses 9 and 11.
  - Q12: the 30-day undo.
- **Amend O64:** "short-lived signed URLs" become Phase 29 actor-bound download grants for committed files.
- **Record D52–D56.**

### Must be captured in the spec

- the retention class table;
- the hold model;
- the sweep and deletion log;
- the Verify your copy step;
- the erasure rewrite;
- the size profile;
- the lease;
- invariants R1–R8;
- AC1–AC16;
- edge cases K1–K25;
- the published schedule.

### Owner requirements (in order)

1. **O71:** record production region and backup policy. This needs to come first because region and backups shape everything else.
2. **O70 (Phase 29):** retention classes, holds, the sweep, verified deletion, successor rewrites and tenant closure for Phase 30 artifacts; the staff-migration size profile (extends O19 and O64).
3. **O72 (Phase 3):** erasure suppresses held files through binding tombstones, then rewrites within 14 days.
4. **O73 (Phase 9 with O51):** the 30-day everyday-import undo window.
5. **O74 (Phase 12):** legal-hold capabilities for the tenant and Asym's legal role, which never grant content access.

### Implementation safeguards

- Storage API deletion only;
- report-only mode first;
- IDs-only payloads;
- a database lease;
- per-file digests;
- text-typed spreadsheet downloads;
- no raw-download route;
- a generated schedule check.

### Monitors

| ID      | Signal                                                    | Threshold         | Owner                         | Response                                           |
| ------- | --------------------------------------------------------- | ----------------- | ----------------------------- | -------------------------------------------------- |
| M-Q15-1 | Artifacts past their deletion date and not held           | 0 (daily)         | Phase 29 with Asym operations | Incident; fix the sweep                            |
| M-Q15-2 | Storage deletion failures still failing after 72 hours    | 0                 | Asym operations               | Incident; manual verified deletion through the API |
| M-Q15-3 | Erasure rewrites older than 14 days                       | 0                 | Phase 30 with Phase 3         | Incident; complete the rewrite                     |
| M-Q15-4 | Final exports deleted with no successful Verify your copy | > 20% of Switches | Phase 30                      | Improve sign-off UX and reminders                  |
| M-Q15-5 | Any Switch above 80% of a profile limit                   | Any               | Phase 30                      | Review the profile with measured evidence          |
| M-Q15-6 | Heavy-job wait time per ministry                          | p95 > 1 hour      | Asym operations               | Add capacity; review fairness                      |
| M-Q15-7 | Legal holds past their review date                        | Any               | Hold owner                    | Escalate; never auto-release                       |

## 5. Owner requirements and discrepancies

**Owner requirements (proposed O70–O74):**

- **O70 (Phase 29):** retention classes for Phase 30 artifacts (§3 clauses 1–5, 10–13), with:
  - holds that are monotonic and never auto-release;
  - a daily sweep that deletes through the storage service with verification;
  - a PII-light deletion log;
  - successor rewrites that keep the original digest;
  - tenant-closure deletion;
  - the staff-migration size profile (extends O19 and O64);
  - O64's "signed URLs" changed to actor-bound download grants under D5.
- **O71 (platform and operations):** record the production hosting region and backup and PITR windows. Raw files and staging stay in the tenant's region. Job payloads carry IDs only. Publish the retention schedule.
- **O72 (Phase 3):**
  - erasure suppresses held Switch files immediately through Source Record Binding tombstones;
  - held files are rewritten within 14 days, keeping money amounts and source IDs;
  - tombstones are honoured on any re-upload.
- **O73 (Phase 9 with O51):** everyday-import reversal lasts 30 days after commit, after which prior values are deleted. This resolves D3 for everyday imports.
- **O74 (Phase 12):**
  - legal-hold placing and releasing capabilities for the tenant's Switch decision holder, and for Asym's named legal role without content access;
  - no capability returns a raw Switch export.

**Discrepancies (proposed D52–D56):**

- **D52.** Q1 1(b), Q13 clause 12 and Q14 clauses 9 and 11 assume an open-ended retained final manifest. Phase 29 forbids keep-forever (`custody-and-integration.md:176`). Resolved by Q15.
- **D53.** O64's "short-lived signed URLs" contradict D5 (Phase 29 bans bearer links; strict-private files need actor-bound grants). Resolved by amending O64.
- **D54.** Phase 28 D17's 7-day working window and 24-hour purge are ratified but no purge job exists in code (r3 §9).
- **D55.** The production hosting region and backup or PITR policy are not recorded in `docs/ops`. That bears on Canadian custody (ADR-0038) and Q15's region rule.
- **D56.** Q1 clause 10's "committed rows stay invisible and are never deleted" conflicts with storage limitation for permanently abandoned Switches. Resolved by Q15 clause 5.

## 6. Counsel questions

1. Do CRA books-and-records location rules reach Asym's temporary working copy of a Canadian ministry's export, given the ministry keeps its own copy?
2. Does immediate suppression plus a 14-day rewrite satisfy GDPR and UK GDPR erasure for held raw files?
3. Is a 24-month maximum on held raw exports consistent with US state privacy laws covering nonprofits, and with the FTC's retention-schedule expectations?
4. Is retaining run evidence with staff actor identities for the life of the account acceptable, and how should erased staff be shown?

## 7. Rejected alternatives

| Alternative                                                                                   | Why rejected                                                                                                  |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| A. Delete raw files 30 days after sign-off                                                    | Corrections and late owner homes during the tail would depend on large re-uploads                             |
| C. Keep everything for 7 years                                                                | Blackbaud-style retention risk; Asym becomes the old system's archive; Phase 29 forbids keep-forever defaults |
| Downloading the raw export from Asym                                                          | Phase 12 blocks bulk export of restricted records; a download proves nothing about custody (Phase 29)         |
| A keyed-hash erasure list                                                                     | Redundant with binding tombstones; a permanent hash store against Phase 12/26                                 |
| Extensions of the final export                                                                | Drift towards keep-forever; legal holds cover genuine needs                                                   |
| Per-tenant retention settings, a per-jurisdiction engine, cold storage, per-person encryption | Complexity without need                                                                                       |
| CSV error files with formula escaping                                                         | Corrupts values on re-upload; text-typed spreadsheets are safe and exact                                      |
| Timers in the job queue                                                                       | Run limits; a database sweep is reliable                                                                      |
