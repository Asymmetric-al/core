# Q2 adversarial review v2: failure modes, lifecycle, integrity, security and privacy, scale, operations, auditability, dependencies, rollout, proof and development hazards

Phase 30 Imports & Migration Tools (`imports-migration`). Discovery-only review of the founder's answer to Q2 (evidence sourcing; option A, "staged evidence"). This review (v2) covers **categories 12-22 only**. Date: 2026-11-01.

**Status:** COMPLETE (2026-11-01). Contents: §0 scope and baseline · §1-§11 one section per category (12-22) · §12 consolidated decision language · §13 corrections and notes on the research · §14 unverified · §15 verdict table.

**Baseline.** develop `629cb71dc`. Phase 29 spec: PR #2430 head `1483a349514c66b458da38e0ba0992efdc2e1f31` (open, unmerged; ratified and published as #2429). Read-only review; this file is the only thing it writes.

**Evidence labels.** repo-ratified · repo-published · repo-integrated · verified-vendor-doc (carried from q02-r1 with its URL and 2026-11-01 access date unless re-fetched here) · snippet-only · lead-verified (facts the lead verified and passed to this review) · inferred · assumption · unverified. Legal conclusions are out of scope; where a point is legal, it is routed to a named legal owner and not decided.

---

## 0. What was reviewed, and the three states

### 0.1 Decision under review (founder, 2026-11-01)

NOW, with a willing SiteStacker ministry and no donor data: (1) a no-personal-data census questionnaire; (2) exports of a few clearly fake test people, households, relationships and custom fields the ministry creates in its own SiteStacker; (3) the header line of each giving export copied from a text editor, not Excel. LATER: real full donor exports only after a signed agreement with data-processing terms AND Phase 29 private storage built in an approved environment; the release gate (`roadmap.md:4403` representative SiteStacker migration; `roadmap.md:4395` no synthetic source success) is met only by that later real run. Fixtures not drawn from a real export are labelled synthetic and can never mark a SiteStacker profile supported. WMTEK asked in parallel, never relied on. Whether a willing ministry exists is unknown.

### 0.2 Sources read

- `grill/decision-log.md` (all; Q1 ratified text §1; C1-C23; D1-D23; O1-O18; F1-F19), `CONTEXT.md`, ADR-IM-001.
- `q02-r1-expected-sitestacker-artifacts.md` (all), `q02-r2-custody-fixtures-policy.md` (all).
- `q01-r1-sitestacker-inventory.md` §5-§6; `r10-gap-g3.md` §2, §6-§7.
- Re-checked here: `roadmap.md:418-434`, `:4326`, `:4361-4416`; `delivery-contract.md:39-47`; `document-authority.md:40-58`; `docs/security/tenant-read-floor.md:1-40`; `docs/ops/environments.md:570-585`; `phase-10-sensitive-data-safety.md:30-32`; `owner-constraints.md:171-175`; `scripts/seed-demo.sh:1-8`; Phase 29 at `1483a349`: `proof.md:186-190`, `:213-218`, `:227-236`, `:248-251`, `source-inventory.md:165`.
- Web, fetched 2026-11-01: GDPR Art. 9 text (gdpr-info.eu/art-9-gdpr) for exact wording only.

### 0.3 Current behaviour, intended behaviour, best permanent path

| Aspect                   | Current (repo-integrated / recorded)                                                                                                                    | Intended (decision as worded)                                 | Best permanent path (this review)                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Evidence source          | None. No SiteStacker artifact, supplier, tenant, sandbox or WMTEK answer (g3 §2, verified absence)                                                      | Willing ministry supplies three NOW stages; real export LATER | Same staging, plus an explicit no-ministry branch, a provenance register and an in-custody volume probe           |
| Where NOW artifacts live | Only repo-native store is the **public** AGPL repo and issues (q02-r2 §3.1, §5.2)                                                                       | Unstated                                                      | Private, access-listed store outside the repo; repo carries a pseudonymised index and Asym-authored fixtures only |
| Custody for real files   | Phase 29 unbuilt; #2368 is D17-only; no staff-migration custody ticket (q02-r2 §1.2)                                                                    | "Phase 29 private storage built in an approved environment"   | "Qualified" (not "built") staff-migration source-file profile in a named environment meeting written criteria     |
| Environment              | Hosted projects recorded as carrying anon `USING (true)` "public read" on donor tables; production ~58 migrations behind (unverified); D13 unreconciled | "Approved environment", undefined                             | Minimum criteria list with runtime readback and a named approver role                                             |
| Labels                   | P21 D27 "synthetic, sandbox, production-shadow stay distinct"; ADR-0179 fixture/derived/retained/unresolved                                             | Synthetic vs real export (two classes)                        | Three classes with stated proof power                                                                             |
| Release gate             | `roadmap.md:4403`; `delivery-contract.md:45` "representative user pilot"                                                                                | Met only by "the later real run"                              | A named pilot switch with an explicit "pilot" profile status, after real practice runs in custody                 |

---

## 1. Category 12 — Failure modes

**Material concern: yes.** The decision defines the happy path (a willing ministry completes three stages, then an agreement and custody arrive) but states no behaviour when a precondition fails, and no detection or recovery for the failure most likely to cause harm: real data arriving during a "no donor data" stage.

Checked: no ministry; ministry stops responding; agreement never signed; Phase 29 slips; WMTEK refuses or over-supplies; NOW evidence wrong at the real run; real data by mistake; fake-record side effects. "Agreement never signed" and "WMTEK refuses" fail closed under the decision as worded (no real run, no supported profile; WMTEK never relied on) and need only the monitors in q2b-01 and q2b-22.

### q2b-01 — No branch for "no willing ministry" or "ministry drops out"

- **What could go wrong.** No ministry is found, or one stops after stage 1. With no stated fallback, work drifts: presets get built from vendor screenshots and import templates, and schedule pressure re-labels them "beta" or "preview", which is the synthetic source success `roadmap.md:4395` forbids. Or Phase 30 stalls entirely, although most of its engine does not depend on SiteStacker evidence.
- **Why it matters.** The SiteStacker kit is "a named delivery requirement" (`roadmap.md:4326`, repo-published). The gate has no supplier today (g3 §2.1-2.2, verified absence). Whether a willing ministry exists is unknown (lead).
- **Severity / likelihood.** High / medium (base rate unknown; inferred).
- **Effect.** changes (adds a fallback clause; does not weaken the gate).
- **Best permanent fix.** State the fail-closed branch. Without real evidence the SiteStacker profile is _unavailable_, following the Phase 29 pattern that undefined bounds make a profile unavailable (`P29/proof.md:189`, AC29-P13-01; repo-published, unmerged). The source-agnostic engine, header-driven mapping and the generic field-catalog CSV proceed on fixtures labelled synthetic. Partial stage evidence keeps its own class. The founder re-decides the source at a dated checkpoint.
- **Language to add.** "If no willing SiteStacker ministry has completed NOW stage 1 by the review date recorded with this decision, or a participating ministry withdraws, the SiteStacker profile stays _unavailable_ (never 'beta' or 'preview'). Source-agnostic Phase 30 work continues on synthetic fixtures. Evidence already received keeps its class and is never promoted. The founder re-decides the evidence source."
- **Bucket.** resolve_before_recording; plus **monitor**. Signal: date of the last completed stage and the last ministry response. Threshold: no willing ministry by the recorded review date, or 30 days without a response mid-stage. Owner: relationship owner (q2b-28). Response: escalate to the founder for the fallback decision above.

### q2b-02 — Real personal data arrives during NOW, with no receipt check and no incident procedure

- **What could go wrong.** Every NOW file is produced by a ministry admin working inside a live installation that holds real donors. Concrete paths:
  - the fake-record CRM export uses a filter that also matches real people;
  - the admin attaches the whole giving export instead of copying line 1, or copies line 2 (a real donor row) with the header;
  - pre-existing "Is Testing" transactions, which can carry staff names and card last four (q02-r1 §3a), are sent;
  - the admin "helpfully" adds a full export;
  - WMTEK sends a sandbox that is a copy of production (q02-r1 §3a item 2, inferred).

  On the Asym side, the file is then opened in Excel (formula execution, byte loss), forwarded, committed, or handed to an AI agent before anyone checks it.

- **Why it matters.** Under `roadmap.md:422-424` essentially every record reveals religious belief (GDPR Art. 9 framing, repo-published), and for restricted workers a leaked name or location is "a physical-safety event" (`roadmap.md:418-422`). The only incident runbook covers environment compromise (`docs/ops/environments.md:575-582`, repo-published); nothing covers mis-sent discovery data (q02-r2 U11). Real data would arrive **before** any agreement, custody or approved environment, which is the exact state the LATER gate exists to prevent.
- **Severity / likelihood.** High / medium (human error over a live database is the only barrier; inferred).
- **Effect.** changes (adds a pre-send check, a receipt check and a stop rule).
- **Best permanent fix.**
  - Ministry side: fake records carry a unique marker (External ID prefix plus unique reserved-domain emails); the export filter selects only that marker; the on-screen count must equal the planted count before export; only line 1 of a giving export ever leaves the ministry.
  - Asym side: one named receiver opens each file in a plain text editor (never Excel), in the private store, before any other person, repository or AI tool sees it, and checks the row count and the marker on every row. Phase 29's hygiene rule applies by analogy: never submit received files to public malware-analysis services (`P29/founder-brief.txt:187-189`, per q02-r2 §1.1).
  - Stop rule: any unmarked row, or any data row in a header capture, halts processing. The file is not opened further, forwarded or analysed; the ministry is told; every copy (mail, downloads, sync folders) is deleted and the deletion recorded; the founder decides any further notification with the legal owner.
- **Language to add.** "NOW evidence must contain no real person. The named evidence custodian checks every received file first, in the private store and in a plain text editor, before any other person, repository or AI tool receives it. A file with any unmarked row, or any data row in a header capture, is quarantined and not analysed; the ministry is told; every copy is deleted and the deletion recorded."
- **Bucket.** resolve_before_recording (the stop rule) + implementation_safeguard (the checklists).

### q2b-03 — Fake-record creation can fire the ministry's live automations; the decision omits the safety gate and the prohibitions

- **What could go wrong.** Spark has Person Update, CRM Entity Create/Update, Person Type Assignment and Person Relation Assignment folders, and a **Report Export** folder, so even an export (including the header-line step) can fire events (q02-r1 §1 and correction C9; verified-vendor-doc screenshots). Assigning a record type in real use, adding a newsletter membership while Mailchimp is connected, or creating a user can message real staff, missionaries or audiences. A test gift is far worse: thank-you messages, "Missionary Given To" relationships, campaign-goal triggers that "cancel recurring gifts and notify donors", Historic Giving and year-end statements (q02-r1 §3a). The decision lists people, households, relationships and custom fields. It does not forbid gifts, users, real record types or Mailchimp, and does not include the Spark check q02-r1 makes a gate (Q-D1).
- **Why it matters.** The side effect lands on real people of Asym's first external partner, inside that partner's production system, on Asym's instruction.
- **Severity / likelihood.** High / low-medium (depends on each installation's Spark configuration; inferred).
- **Effect.** narrows (constrains stage 2; keeps it).
- **Best permanent fix.** Make stage 2 conditional on Asym reviewing the Spark-tree screenshot (folder names, conditions, outcome types; no personal data), including Report Export. Enumerate the prohibitions. Require the ministry's written go-ahead naming the admin who creates the records and the deletion date.
- **Language to add.** "Stage 2 starts only after Asym has reviewed the ministry's Spark tree (including Report Export) and the ministry has confirmed in writing who creates the records and when they are deleted. Fake records never include gifts, batches, recurring schedules, user logins, newsletter or Mailchimp membership, or any record type or relationship type referenced by an active Spark event or workflow. If a Report Export event is active, exports wait until it is disabled or confirmed inert."
- **Bucket.** resolve_before_recording.

### q2b-04 — NOW evidence proves wrong at the real run; no detection or response is defined

- **What could go wrong.** Encoding, header names, ID columns or date formats seen NOW differ at the real run: a newer version, a different exporter group, the "Visible Columns" setting (q02-r1 C8, snippet-only), a report rebuilt by WMTEK. If kit mappings or parser defaults were fixed from NOW evidence, the real run fails late or, worse, parses wrongly but plausibly: a cp1252 file read as UTF-8, or "$400" read as 400 with cents and parenthesised negatives mishandled (q02-r1 §2.2, inferred risk).
- **Why it matters.** The riskiest Minimum Switch Kit family (giving) stays dark until LATER (q02-r1 §0.7(a)).
- **Severity / likelihood.** Medium / medium-high (monthly releases; 2.47 changed CSV output for Excel, snippet-only).
- **Effect.** changes (adds a re-verification rule).
- **Best permanent fix.** Every NOW finding is a dated hypothesis bound to (installation, version, surface, exporter group). At real-file intake the header, encoding readout and version are compared with the register (q2b-21). Any difference re-opens the affected findings and blocks reliance on them until re-checked. No parser default is fixed from NOW evidence alone.
- **Language to add.** "NOW findings are provisional hypotheses for the recorded installation and version. At each real export, header, encoding and version are compared with the evidence register; any difference re-opens the affected findings before mapping relies on them."
- **Bucket.** spec_requirement.

---

## 2. Category 13 — Lifecycle, temporal correctness, concurrency and idempotency

**Material concern: yes.** NOW evidence has no lifecycle, no binding to a version, and no relationship to the Q1 readiness census or the D13 hosted census. The months between NOW and LATER (Phase 29 must first be built and qualified) make drift near-certain.

Checked: evidence states (collected, reviewed, superseded, disposed); version drift between fake-record exports and the real run; re-collection; staleness of questionnaire answers; census timing relative to the first real export; concurrency between fake records and live staff work; idempotency of repeated collection.

### q2b-05 — No evidence lifecycle; version drift turns stale NOW evidence into a de facto spec

- **What could go wrong.** Fake-record exports and header lines are taken at version N. The real run happens many months later, at N+k, after customer-controlled monthly updates or a rollback in System Manager (q02-r1 §1, verified-vendor-doc). With no state model, the NOW artifacts stay "current" by default, and fixtures and presets derived from them are treated as true for the later version.
- **Why it matters.** Releases are monthly and reach at least 2.56 (snippet-only); 2.47 changed how CSVs display in Excel, which implies an encoding or BOM change (snippet-only; effect inferred); newer release notes are customer-login-only (g3 §3.2, verified).
- **Severity / likelihood.** Medium / high.
- **Effect.** changes (adds a lifecycle).
- **Best permanent fix.** Each artifact moves through `received → checked (q2b-02) → reviewed → in use as hypothesis → superseded (by a later version, a later capture, or the real run) → disposed`. Each carries its SiteStacker version and capture date. A version change at the same installation marks every format finding for the affected surfaces "re-check required". Re-collection creates a new entry; it never overwrites an old one. This is an idempotent register keyed by (installation pseudonym, version, surface, exporter group, capture date).
- **Language to add.** "Every evidence artifact records its installation, SiteStacker version and capture date, and has one state: received, checked, reviewed, in use, superseded or disposed. A new SiteStacker version at that installation marks its format findings 're-check required'. Re-collection adds an entry and never overwrites one."
- **Bucket.** spec_requirement; plus **monitor**. Signal: the version the ministry reports at each contact (questionnaire A1). Threshold: any version change since the last capture. Owner: evidence custodian. Response: re-capture the affected headers and encoding readouts before any mapping relies on them.

### q2b-06 — The NOW questionnaire can be mistaken for the Q1 readiness census, and census timing for the first real export is unsettled

- **What could go wrong.** Q1 places a readiness census "before the first practice run and again at final export" (decision-log §1 Q1 clause 3, repo-ratified). The NOW questionnaire overlaps it heavily (processors, recurring engines, counts; q02-r2 U18). Three risks:
  - the NOW answers, months old, are reused as the readiness census;
  - the D13 **hosted** census of Asym's own retained state (`roadmap.md:4403`) is assumed to be covered by a questionnaire about the ministry's installation, which it is not;
  - whether either census must precede _receipt_ of a real export (for kit development outside a switch) is unaddressed (q02-r2 U13).
- **Why it matters.** C23 requires a census of actual retained state; D13 is unreconciled; processor and recurring counts change.
- **Severity / likelihood.** Medium / medium.
- **Effect.** narrows.
- **Best permanent fix.** Label the NOW questionnaire "discovery draft of the readiness census". Its answers never satisfy Q1 clause 1(d). Treat receipt of the first real export as the first Q1 practice run (see q2b-25), so the Q1 ordering applies unchanged: readiness census, plus the D13 hosted census of the target environment, before the real export is accepted.
- **Language to add.** "The NOW questionnaire is a discovery draft and never satisfies the Q1 readiness census. The first real export is accepted only as a Q1 practice run, after a fresh readiness census and the D13 hosted census of the receiving environment."
- **Bucket.** spec_requirement.

### q2b-07 — Undeleted fake records contaminate the later real export

- **What could go wrong.** The fake records are not deleted, or are deleted late. They then appear in the LATER real export and, under Q1, are imported into the pilot tenant as real Parties with households and relationships. Separately, live staff may merge a real person into a fake one after "Scan Duplicates" (q02-r1 §5 Q3), or print a mailing to a fake address from the Mailing List report (q02-r1 §3a).
- **Why it matters.** It corrupts the representative run, the one artifact that may mark the profile supported, and creates Source Record Bindings for people who never existed (C14; ADR-IM-001).
- **Severity / likelihood.** Medium / medium.
- **Effect.** changes (adds a marker and a disposition rule).
- **Best permanent fix.** Use one marker convention for all fake records (External ID prefix such as `ASYMTEST-`, unique `@example.org` emails reserved by RFC 2606, and plainly fake postal addresses). Keep them for days, not weeks, with a dated deletion confirmed by the ministry. The real-run intake treats any row carrying the marker as a visible "test record" exclusion, never an import.
- **Language to add.** "Fake records carry the agreed marker and are deleted by a recorded date. Any marked row in a later real export receives a visible test-record exclusion and is never imported."
- **Bucket.** implementation_safeguard.

---

## 3. Category 14 — Data integrity risks

**Material concern: yes.** Each NOW stage can produce confident but wrong conclusions: pasted headers lose the bytes that matter; tiny, clean, mostly Latin samples hide encoding and serialization failures; and on-screen labels, import-template names, header lines and evidence from different installations or versions can merge into one invented "profile".

Checked: small-sample inference; header copy fidelity; on-screen labels vs CSV headers; mixing installations and versions; exporter column choice; fake data cleanliness vs real data history.

### q2b-08 — Pasted header lines lose encoding, BOM, delimiter and whitespace, and can be altered in transit

- **What could go wrong.** Copy-paste drops the BOM and the encoding. A tab-delimited line can display like spaces. Trailing whitespace and the line ending vanish. Email and chat clients can turn straight quotes into curly ones or wrap long lines. A fixture built from the pasted text then (a) fails to match a real file that starts with U+FEFF, or (b) passes tests that the real bytes would fail. q02-r1 §3b already notes copy-paste "loses the bytes" and asks for the editor's encoding readout. The decision, as worded, does not limit what a header capture may prove.
- **Why it matters.** Encoding and number format are among the propositions only the real run can settle for giving files (R17; q02-r1 §4).
- **Severity / likelihood.** Medium / high.
- **Effect.** narrows (header captures prove labels, not bytes).
- **Best permanent fix.** Classify a pasted header as _label evidence only_. Require with it the editor's encoding and line-ending readout and the column-chooser screenshot (q02-r1 §3b). Where the admin is comfortable doing so, add a byte-faithful variant: in the text editor, delete every line after line 1 and use Save As to a new file without changing encoding; the receiver checks it has exactly one line (q2b-02). Parsers and header matching must tolerate a BOM, CRLF or LF, and surrounding whitespace regardless of NOW evidence.
- **Language to add.** "A pasted header line is evidence of column labels and order for the recorded version and column choice only. It is never evidence of encoding, BOM, delimiter, quoting or value formats."
- **Bucket.** spec_requirement.

### q2b-09 — Tiny, clean fake samples are over-generalised

- **What could go wrong.** The proposed probe characters (é, ñ, ü) all exist in Windows-1252. A cp1252 file and a UTF-8 file may both render them correctly, so the probe can look "fine" while names in Cyrillic, Arabic, Korean or other non-Latin scripts, which missions supporter bases plausibly contain (assumption), would be lost. SiteStacker is a MySQL-family application (snippet-only); legacy MySQL `utf8` (3-byte) columns cannot store 4-byte characters such as emoji (general MySQL behaviour; inferred for SiteStacker). Six records also cannot show embedded newlines or quotes in notes or custom fields, very long cells, many-entry multi-value fields, or the mixed date and number formats left by earlier imports (q02-r1 §5 Q17).
- **Why it matters.** "Proved for CRM files" (R12, R17) could be claimed from a probe that never touched the failure classes.
- **Severity / likelihood.** Medium / high.
- **Effect.** narrows.
- **Best permanent fix.** Extend the fake set (still fake, still no gifts): one name in a non-Latin script; one 4-byte character; a custom text value with an embedded comma, double quote and line break; one long text value (several thousand characters); one multi-entry field with five or more entries; a leading-zero ZIP and External ID (already proposed). Record what NOW can and cannot prove per proposition, using q02-r1 §4 as the template.
- **Language to add.** "Fake-record exports prove only the format behaviour they actually exercise, for the recorded version. They never prove parse coverage, data quality or volume behaviour."
- **Bucket.** implementation_safeguard (probe set) + spec_requirement (proof limit).

### q2b-10 — On-screen labels, import-template names, header lines and different installations get merged into one "profile"

- **What could go wrong.** Four evidence kinds already exist: vendor screenshot labels, import-template field names, BI dataset field names and (soon) header lines. q02-r1 §2 keeps them apart, but a fixture author may not. A header line records the exporter's ticked columns, not a schema (q02-r1 §2.2, verified-vendor-doc). The 2.21 "Visible Columns" setting means the CSV may hold more columns than the screen (snippet-only). Evidence from a second ministry, or WMTEK's demo, can blend into a chimera that matches no real installation.
- **Why it matters.** Mappings keyed to a fixed column order, or to template names, break on the first real file.
- **Severity / likelihood.** Medium / medium.
- **Effect.** narrows.
- **Best permanent fix.** Every finding cites its evidence kind and its (installation, version, surface, exporter group, column set). Mapping is keyed by header name, order-insensitive, with unknown columns shown, never dropped. A profile claim cites evidence from one installation and version set; generalising to another installation needs that installation's own evidence.
- **Language to add.** "Every format claim names its evidence kind (screenshot label, import template, dataset field, header capture, fake-row export or real export) and its installation and version. Evidence kinds and installations are never pooled into one claim."
- **Bucket.** spec_requirement.

---

## 4. Category 15 — Security and privacy risks

**Material concern: yes — the largest category.** The LATER gate rests on an undefined "approved environment" while hosted projects are recorded as carrying anonymous read on donor tables. NOW artifacts have no home except a public repository. "No personal data" is assumed rather than checked for labels. AI processing, minimisation of the "full" export, Phase 10 restricted identities, retention and the agreement's content are all unstated.

Checked: real data in fake-record exports (q2b-02); labels naming workers or places; the public repo; AI tools; the public-read finding and what "approved environment" must require; data residency; retention and disposal of discovery material; incident handling (q2b-02); the Art. 9 framing at `roadmap.md:422-424`; screen sharing.

### q2b-11 — "Approved environment" is undefined while hosted projects are recorded as allowing anonymous reads of donor tables

- **What could go wrong.** Phase 29 storage is "built" in an environment someone calls approved, and the real export (or, at the pilot, imported rows) lands in a project that still has the demo policy `FOR SELECT TO anon USING (true)` on `donors`, `donations`, `profiles`, `donor_pledges` and others. The anon key is a client-side key, so anyone could read those rows (inferred). Other paths: production is the default target of a destructive demo seed; "built" is read as "merged code" rather than "qualified in this environment".
- **Why it matters.** Facts:
  - migration `20260216153000_demo_readonly_rls.sql` created the anon "public read" policies; develop dropped them for these tables in `20260625002117` (lead-verified);
  - `docs/security/tenant-read-floor.md:23` says `public read` "is what hosted projects carry today" (repo-integrated doc);
  - production reportedly lags about 58 migrations, so the drop may not have reached it (unverified spec comment on #2083, via g3 H5);
  - `docs/ops/environments.md:5`, `:206` say production holds real donors, while the 2026-07-06 founder ruling and ADR-0179 say there are no users (D13, unreconciled);
  - `scripts/seed-demo.sh:6` defaults `EXPECTED_PROJECT_REF` to the production ref (repo-integrated);
  - the state ladder separates _implemented_ from _qualified_ ("the exact provider/environment/cohort passed its required gates", `document-authority.md:44-54`), and Phase 29's own P30 gate is "qualified P29 custody" (`P29/source-inventory.md:165`);
  - AC29-P16-06: "No prototype, sandbox adapter or vendor documentation alone counts as qualified hosted/copy behavior" (repo-published, unmerged).

  The repo defines no "approved environment" (q02-r2 §2.2, verified by search). Product safety: "tenant and permission correctness outrank convenience" (AGENTS.md, repo-ratified).

- **Severity / likelihood.** Critical / low-medium. The outcome would be public exposure of Art. 9-framed data and restricted-worker records. Likelihood falls if production catches up with develop before LATER, but nobody has verified hosted state.
- **Effect.** changes (gives the gate content).
- **Best permanent fix.** Write the minimum criteria into the decision and require written approval by a named role, with evidence attached:
  1. the environment is named by project ref, and its production/non-production status is reconciled in writing (closes D13 for that project);
  2. a runtime readback (not migration files) shows zero migration drift against the commit being qualified;
  3. a runtime readback of policies and grants shows no `anon` or `PUBLIC` privilege and no `USING (true)` read policy on any table that will hold custody metadata, staging or imported rows;
  4. the Phase 29 staff-migration source-file profile is **qualified** in that environment (access and revocation, residency and egress, backups, copy inventory, verified disposal; `P29/proof.md:227-236`);
  5. Phase 10 classification and restricted handling are available (q2b-16);
  6. no destructive script or seed defaults to that environment;
  7. the region is recorded and acceptable under the agreement (q2b-15);
  8. the D13 hosted census has been run (q2b-06).
- **Language to add.** "'Approved environment' means one named project that a named approver has signed off, with attached evidence, as meeting all of: status reconciled (D13); zero migration drift by runtime readback; no anon or PUBLIC access and no `USING (true)` read on any table holding custody, staging or imported data, by runtime readback; the Phase 29 staff-migration source-file custody profile _qualified_ there (not merely built); Phase 10 classification available; no destructive script defaulting to it; region accepted under the agreement; D13 hosted census complete."
- **Bucket.** resolve_before_recording.

### q2b-12 — NOW artifacts and derived content can be published through the public AGPL repository

- **What could go wrong.** The grill writes everything into `docs/features/imports-migration/**` in a **public** AGPL-3.0 repository (q02-r2 §3.1, repo-integrated; lead). Questionnaire answers quoted in research, header lines pasted into a review, a fake-row CSV committed as a fixture, or an issue naming the ministry would publish the ministry's identity, processors, merchant or connected-account IDs ("financial"-class identifiers in field policy, q02-r2 §5.1), module mix, counts and custom labels. Public git history is effectively unrecallable once mirrored or forked (inferred).
- **Why it matters.** "The database itself is a targeting list" (`roadmap.md:418-420`). A restricted-access ministry is a named design-partner class (q02-r2 §5.1). Knowing that ministry X runs SiteStacker with N workers' funds is organisation-sensitive even without a person row (inferred).
- **Severity / likelihood.** High / medium. The workflow writes to the repo by default, and agents quote sources.
- **Effect.** changes (adds a storage and publication rule).
- **Best permanent fix.** NOW artifacts live only in a private, access-listed store outside the repository and the tracker. The repo refers to the ministry by pseudonym and carries only Asym-authored, label-screened fixtures (q2b-13, q2b-27). Anything identifying the ministry needs the ministry's written consent before publication.
- **Language to add.** "No NOW or LATER artifact, and no text that identifies the participating ministry or quotes its answers, labels or identifiers, is committed to the repository or posted to the tracker. The repository uses a pseudonym and Asym-authored fixtures only."
- **Bucket.** resolve_before_recording.

### q2b-13 — "No personal data" is assumed for headers, entity definitions and fake-record files, but labels can name workers, places and sensitive programmes

- **What could go wrong.** Report columns, dashboard labels and custom fields are defined per installation (q02-r1 §2.1 E9, E12, verified-vendor-doc). Fund, campaign and designation names can name workers or countries. Entity group names can reveal programmes; the vendor demo itself has "CRM Entity - Child Enrollment - Health Info" (q02-r1 §1, verified-vendor-doc screenshot). q02-r1 §3b says the entity "Export For Import" file "can be shared: it holds definitions, not personal data". That is true for person rows but not for worker-identifying or programme-revealing labels.
- **Why it matters.** Phase 10 names fund names, campaign slugs and CSV exports as secondary leak vectors (`phase-10-sensitive-data-safety.md:30`, repo-ratified). A header "containing a name, a data row mistaken for a header, or ministry-sensitive labels" is a recognised classification question (`r10-gap-g7.md:106`, research).
- **Severity / likelihood.** High / medium.
- **Effect.** narrows (artifacts stay usable, under a default classification).
- **Best permanent fix.** Classify every NOW artifact by default as _confidential ministry discovery material_. The custodian screens labels for person names, places and programme sensitivity before any wider use. Fixtures replace installation-specific labels with neutral ones (q2b-27).
- **Language to add.** "All NOW artifacts, including header lines and entity definition files, are confidential ministry discovery material by default. Labels are screened for names, places and sensitive programmes before any use beyond the custodian."
- **Bucket.** implementation_safeguard (+ one sentence in the decision).

### q2b-14 — AI processing of discovery and real artifacts is unaddressed

- **What could go wrong.** This grill runs AI agents over repository files. Any NOW artifact placed where agents read it is processed by an external AI provider. LATER, the temptation to "let the model map the columns" over a real export is strong.
- **Why it matters.** D17 C12 bars any source content, headers included, from external AI for the D17 profile (`r10-gap-g7.md:101`, citing ratified text). F6 is open for staff profiles. Phase 10 says "the platform's own pipes leak", undermining "the Art. 9(2)(d) 'no disclosure outside the body' posture the whole legal footing rests on" (`phase-10-sensitive-data-safety.md:32`, repo-ratified). The public subprocessor list names no AI provider (q02-r2 §4).
- **Severity / likelihood.** Medium for NOW (fake content), high for LATER / medium.
- **Effect.** narrows.
- **Best permanent fix.** NOW: AI tools may process only artifacts that have passed the custodian check (q2b-02) and label screen (q2b-13), and never content identifying the ministry. LATER: no AI processing of real exports or their derivatives until F6 is decided, the D10 foundation exists, and the agreement lists the provider.
- **Language to add.** "AI tools may process NOW artifacts only after the custodian check and label screen. No real export, or content derived from one, is processed by any AI tool until F6 is decided and the agreement names that processor."
- **Bucket.** resolve_before_recording (one line) + spec_requirement.

### q2b-15 — "A signed agreement with data-processing terms" has no checklist, no signatory and no legal owner

- **What could go wrong.** A generic DPA is signed that does not cover purpose (kit development and a pilot switch), scope (q2b-16), special-category data, non-US donors, region, subprocessors actually used, Asym staff access, retention, return and verified deletion, and breach notice. Or nobody is authorised to sign.
- **Why it matters.**
  - The repo holds no MSA, DPA or customer agreement and names no legal owner, only role classes (q02-r2 §4, repo absence).
  - Art. 9(2)(d) conditions processing by religious not-for-profit bodies on the data "not [being] disclosed outside that body without the consent of the data subjects" (GDPR text, fetched 2026-11-01). Phase 10 rests the platform's legal footing on that posture (`phase-10:32`). Whether a pre-customer export to Asym fits the ministry's basis is a **legal question for named counsel**; this review does not decide it.
  - Hosted regions are `us-east-1` (development) and `us-west-2` (production) (q02-r2 §2.1, repo-integrated record). Ministries may have Canadian or other non-US donors (questionnaire F1). The repo has no residency policy (q02-r2 U23).
  - Phase 29 will not invent retention periods (`P29/founder-brief.txt:289`, repo-ratified) and requires verified disposal (`P29/proof.md:235`, AC29-P16-03).
- **Severity / likelihood.** High / medium.
- **Effect.** narrows (keeps the gate; gives it content).
- **Best permanent fix.** Attach a minimum agreement checklist to the decision. A named legal owner confirms sufficiency; the founder names the signatory role.
- **Language to add.** "The agreement must at least state: purpose (kit development and the named pilot switch only); the surfaces and record families in scope and those excluded; the special-category basis, confirmed by the legal owner; donor jurisdictions and the storage region; every processor and subprocessor that will touch the data; who at Asym may access it; retention, return and verified deletion; and breach notification. A named legal owner confirms it before signature."
- **Bucket.** spec_requirement (checklist) + resolve_before_recording (who owns legal sign-off; see q2b-28).

### q2b-16 — "Real full donor exports" collide with minimisation, and the LATER gate omits Phase 10 restricted handling

- **What could go wrong.** "Full" plus the rule "tick every column" (q01-r1 §5 rule 1) pulls in child-sponsorship health entities, member-care fields and restricted workers' real names, countries and fund names. Phase 10's restricted tier is unbuilt (#628 open, q02-r2 §6, repo-integrated absence). The LATER gate names only the agreement and Phase 29 storage.
- **Why it matters.**
  - Phase 29's storage-object model requires a "Phase 10 classification" on every stored object (`owner-constraints.md:171-175`, repo-published), so "Phase 29 built" without Phase 10 is internally incomplete.
  - Restricted identities imported without an alias are rejected, fail-closed (`phase-10:174`, repo-ratified), but nothing governs _holding_ such a file.
  - The fresh-build window "closes at first tenant onboarding" and retrofit "is effectively impossible" (`roadmap.md:432-434`, repo-published).
  - Child sponsorship is out of program scope but needs a visible exclusion (C13). A visible exclusion can be recorded from counts without receiving the content (inferred).
- **Severity / likelihood.** High / medium.
- **Effect.** changes (adds a gate and a scope rule).
- **Best permanent fix.** Add Phase 10 classification and restricted-tier handling in the approved environment to the LATER gate. Agree the export scope per surface and record family. Families outside the kit's scope (for example child-sponsorship health entities) are excluded from the files and dispositioned from counts.
- **Language to add.** "Real exports are additionally gated on Phase 10 classification and restricted-identity handling being available in the approved environment. The agreement lists the surfaces and record families exported. Families outside Phase 30 scope are not exported; they are dispositioned as visible exclusions from on-screen counts."
- **Bucket.** resolve_before_recording.

### q2b-17 — Guided sessions over a live installation expose real records during the "no donor data" stage

- **What could go wrong.** To help a stretched admin, Asym runs a screen share. The CRM grid, the Contributions views or the Spark outcomes on screen show real donors, and a meeting recorder or AI note-taker captures them.
- **Why it matters.** It defeats NOW's premise without any file moving, and it creates recordings outside any custody (inferred).
- **Severity / likelihood.** Medium / medium.
- **Effect.** narrows.
- **Best permanent fix.** Guided sessions show only screens without person data: System Manager, the Spark tree, entity definitions, and column choosers over an empty filter. No recording or AI note-taker runs while a live installation is shared. If real records appear, the session pauses and nothing is captured.
- **Language to add.** "Asym does not view real records during NOW. Any guided session shows only screens without person data, and no recording or AI note-taker runs while a live installation is shared."
- **Bucket.** implementation_safeguard.

### q2b-18 — No retention or disposal rule for discovery material

- **What could go wrong.** Questionnaire answers, header files and fake-row exports sit indefinitely in mailboxes, downloads, chat threads and personal drives, and several copies outlive the relationship.
- **Why it matters.** No product retention rule reaches pre-customer material (q02-r2 §5.1, repo absence). Phase 29 refuses invented universal periods (`P29/founder-brief.txt:289`, repo-ratified), so the founder must choose.
- **Severity / likelihood.** Medium / high.
- **Effect.** changes.
- **Best permanent fix.** Keep NOW material only in the private store. Record a disposal trigger per artifact class: raw fake-row exports and header files at supersession by the real run or at a founder-chosen maximum age; questionnaire answers when discovery ends without a pilot. A register entry (metadata only) proves disposal.
- **Language to add.** "NOW artifacts are kept only in the private store and disposed of at the founder-recorded trigger for their class. The register keeps a content-free record of each disposal."
- **Bucket.** spec_requirement.

---

## 5. Category 16 — Scalability and performance risks

**Material concern: yes, but narrow and cheaply fixable.** Staged evidence says nothing about volume. Volume is exactly what Phase 29 needs before a profile can exist, and the header-line step already puts real exports on the admin's own machine, so volume facts can be measured NOW without any data leaving the ministry.

Checked: row counts; export time limits and 2.48 long-export errors; background exports with emailed failure; paging versus whole-query export; partitioning; Phase 29 bounded-workload rules; questionnaire sizing items B4, B9, C1, E2.

### q2b-19 — Volume stays dark until LATER, although an in-custody probe could measure it NOW

- **What could go wrong.** Asym first learns at the real run that a full-history Contributions export errors out (2.48: "Exports that take a very long time will result in an error"; 2.49 raised the limit; failures may arrive by email; snippet-only), needs date partitions, or yields files too large for the planned parser and upload profile. Rough questionnaire counts (B9, C1) are not the same as export behaviour.
- **Why it matters.** "Published capability profiles have measured finite values and supported workload/environment evidence; undefined bounds make the affected profile unavailable" (`P29/proof.md:189`, AC29-P13-01; repo-published, unmerged). Bounds need "representative skew" (`P29/proof.md:186`). Q1 rules already expect date partitioning if a grid caps or times out (q01-r1 §5 rule 4).
- **Severity / likelihood.** Medium / high.
- **Effect.** changes (adds a probe to stage 3; no data leaves the ministry).
- **Best permanent fix.** For each giving and CRM surface, the admin runs the full, unfiltered real export **inside the ministry**. For each run they record the on-screen count, the row count reported by the editor, file size, duration, success or error text, and any emailed failure, then copy line 1 and delete the file. Add to the questionnaire: years of history; transactions per year; maximum designations per transaction; number of custom entity fields; longest free-text fields (approximate); attachment counts. The real run later confirms skew.
- **Language to add.** "For each surface whose header is captured, the ministry also records, without sending any rows: the on-screen count, the file's line count and size, the export duration, and any error or failure email. These are sizing evidence only and never prove completeness."
- **Bucket.** spec_requirement.

---

## 6. Category 17 — Operational burden

**Material concern: yes.** The researched procedure is heavy for a pre-customer ministry admin and has no Asym owner. Heavy burden is the likeliest cause of the q2b-01 drop-out, and unowned triage produces tribal knowledge.

Checked: ministry admin effort; Asym staff effort; repeated collection; triage ownership; knowledge capture.

### q2b-20 — Admin burden invites drop-out and low-quality answers; Asym triage is unowned and knowledge stays tribal

- **What could go wrong.** The proposed questionnaire has 37 questions, most answerable only by a SiteStacker administrator (q02-r1 §3c). Stage 2 adds a Spark-tree review, six people and a group covering every field type, double exports, a merge test and a dated deletion. Stage 3 adds per-surface headers with encoding readouts and column-chooser screenshots, and q2b-19 adds a volume probe. The admin abandons the work midway or rushes it. On the Asym side, nobody owns triage, follow-up or write-up, so findings live in grill files and one person's memory.
- **Why it matters.** The work repeats per version change (q2b-05) and per future installation. Vendors that do this well publish an omissions-and-sentinels sheet (Bloomerang; q02-r1 §6, verified-vendor-doc).
- **Severity / likelihood.** Medium / high.
- **Effect.** narrows (same stages, tiered).
- **Best permanent fix.** Tier the questionnaire. A go/no-go core of about a dozen questions comes first (version and hosting; Sites, currencies, processors; recurring engines and PayPal; modules; rough counts; Spark tree; who exports). The rest is deferred to the Q1 readiness census. Give the admin one Asym-written capture sheet per surface. Name an Asym evidence custodian who triages within a stated time. Maintain the "SiteStacker known omissions and sentinels" sheet (q02-r1 §6(c)) as the durable, pseudonymised knowledge artifact.
- **Language to add.** "NOW asks only the go/no-go core questions first; the rest wait for the Q1 readiness census. A named Asym evidence custodian triages every submission and maintains the SiteStacker omissions-and-sentinels sheet."
- **Bucket.** implementation_safeguard.

---

## 7. Category 18 — Observability and auditability gaps

**Material concern: yes.** Q1 defines rich provenance for the switch (Source Snapshot Manifest: byte identity, filter, exporter role, version, export times, on-screen counts; `CONTEXT.md`, repo-ratified). The decision defines none for NOW evidence. Without it, q2b-04, q2b-05 and q2b-10 cannot be detected, and no "supported" claim can be traced.

Checked: per-artifact provenance; an evidence register; decision traceability; disposal proof.

### q2b-21 — No evidence register; artifacts, findings and decisions are not traceable

- **What could go wrong.** Months later nobody can say which version a header came from, which User Group exported it, what filter was used, whether a file was ever checked for real rows, or which kit mapping rule rests on which artifact. Drift and mixing go unnoticed, and a later "supported" claim cannot be audited.
- **Why it matters.** The program contract requires recording "exact commands, versions, fixtures, results" and to "never label skipped required evidence as passing" (`delivery-contract.md:43`, repo-published). Phase 29 requires separate evidence classes "with exact scope/version/environment" (`P29/proof.md:251`, AC29-P17-06).
- **Severity / likelihood.** Medium / high.
- **Effect.** changes.
- **Best permanent fix.** A private evidence register. Each entry holds: id; installation pseudonym; evidence class (q2b-26); surface; SiteStacker version; exporter role or User Group; filter; columns chosen; on-screen count; line count; capture time and zone; SHA-256 for byte files; encoding and line-ending readout; transmission channel; receiver; custodian check result (q2b-02); state (q2b-05); disposal date. Findings and kit mapping rules cite register ids. The repository carries only a pseudonymised index of ids and classes. Ids prefigure the Phase 30 Source Snapshot Manifest so LATER entries can migrate into product records.
- **Language to add.** "Every artifact gets an evidence-register entry with its class, installation pseudonym, surface, version, exporter role, filter, on-screen and file counts, capture time, byte digest where applicable, custodian check result, state and disposal date. Every format finding, fixture and 'supported' claim cites register ids."
- **Bucket.** spec_requirement.

---

## 8. Category 19 — Dependency and integration risks

**Material concern: yes.** The LATER gate depends on Phase 29 work that has no ticket, and the "supported" claim depends on one ministry. Contacting WMTEK carries a disclosure risk to the ministry.

Checked: one ministry; WMTEK; monthly releases and login-gated docs; Phase 29 (#2368 D17-only; no staff-migration custody ticket); Phase 10/12; D13 census; O12.

### q2b-22 — The Phase 29 profile the LATER gate needs is unticketed, so the gate can slip silently

- **What could go wrong.** Everyone waits for "Phase 29 private storage" and assumes #2368 delivers it. #2368 is scoped to "the P28 self-import private input/parser-derivative custody profile", and its amendment says "Remaining F30 profiles require their actual P30/target-owned components" (q02-r2 §1.2, repo-published issue body). The Phase 29 spec says "No exact new P30 implementation ticket verified; do not manufacture one" (`P29/source-inventory.md:165`, re-checked here). The foundation chain #2434 → #2437 → #2444 and the disposal lanes #2457/#2497 must also land (q02-r2 §1.2).
- **Why it matters.** The LATER stage, and therefore the release gate, has no tracked path. D11 (who holds staged content for non-D17 profiles) is still open.
- **Severity / likelihood.** High / high.
- **Effect.** no_change to the decision's logic; it needs a tracked prerequisite.
- **Best permanent fix.** The Phase 30 spec names the required "staff-migration source-file custody profile" and its acceptance (by analogy to #2368: upload completeness, immutable input, bounded hygiene, temporary-copy handling, current access, verified disposal), and settles D11 with the Phase 29 owner. Ticket creation needs separate founder authorization.
- **Language to add.** "The LATER gate requires the Phase 29 staff-migration source-file custody profile, which #2368 does not provide. The Phase 30 spec defines it with the Phase 29 owner."
- **Bucket.** spec_requirement + **monitor**. Signal: existence and state of a Phase 29/30 work item for the staff-migration custody profile. Threshold: none filed when Phase 30 spec drafting starts, or the #2434 → #2444 chain not merged when a ministry signs. Owner: Phase 30 spec owner with the Phase 29 owner. Response: raise to the founder; the real-export date moves and the profile stays unavailable.

### q2b-23 — One ministry's installation becomes "the SiteStacker profile"

- **What could go wrong.** Reports, dashboard modules, entity fields and installed components differ per installation (q02-r1 §2.2, verified-vendor-doc). The kit gets tuned to the pilot's custom reports and fields, and "supported" is then advertised for every SiteStacker ministry.
- **Why it matters.** q02-r1 §0.7(b): "One ministry's real run proves the method, not a fixed profile."
- **Severity / likelihood.** Medium / high.
- **Effect.** narrows (defines what "supported" covers).
- **Best permanent fix.** "Supported" covers the method, the standard surfaces evidenced, and a recorded version range. Every installation still goes through header-driven mapping review and Q1 practice runs. Installation-specific reports are never presets.
- **Language to add.** "A supported SiteStacker profile covers the evidenced standard surfaces and version range and the review method. Each installation still receives header-driven mapping review and practice runs; no installation-specific report or field set becomes a preset."
- **Bucket.** spec_requirement.

### q2b-24 — Asking WMTEK can disclose the ministry's plan to leave, and WMTEK material can arrive with real data or restrictive terms

- **What could go wrong.** Asym asks WMTEK about exports or exit packages and names, or makes identifiable, the ministry. The incumbent learns of the planned exit before the ministry chooses to say so, which matters near a renewal (questionnaire F2 asks for renewal date and notice period). Separately, WMTEK supplies a sandbox copied from production (real data), or material under terms that bar the intended use.
- **Why it matters.** It harms the first partner's vendor relationship, and it is a q2b-02 data path. Vendor terms are a legal question (out of scope; q02-r2 U22).
- **Severity / likelihood.** Medium / medium.
- **Effect.** narrows.
- **Best permanent fix.** Asym's WMTEK questions are generic and do not identify any ministry unless the ministry consents in writing. Any WMTEK material goes through the custodian check and is classed separately ("vendor-supplied"). It is never used as evidence of a customer's export until its content and terms are known.
- **Language to add.** "Asym contacts WMTEK without identifying any ministry unless that ministry consents in writing. WMTEK material is classed 'vendor-supplied', passes the custodian check, and is never treated as a representative export."
- **Bucket.** implementation_safeguard.

Other dependencies checked, no separate finding: monthly releases and login-gated notes are covered by q2b-05. The ministry admin can read release notes under their own login and report export-related changes; Asym must never use the ministry's credentials (Q1 clause 8 excludes credentials, repo-ratified). D13 is covered by q2b-06 and q2b-11. Phase 10/12 is covered by q2b-16. O12 is covered by q2b-25.

---

## 9. Category 20 — Migration, rollout and upgrade risks

**Material concern: yes.** "The later real run" is undefined, and read literally the decision builds a deadlock with Q1: a switch needs a supported profile, and a profile is supported only by a real run. Pressure to break that deadlock is how C23 gets weakened. The first ministry's status, and the moment it becomes a Tenant, are also undefined.

Checked: sequencing of NOW stages against Phase 29, Phase 10 and the census; practice run versus committed switch; the circular gate; design-partner status; SiteStacker upgrades between runs (covered by q2b-05 and Q1 rule 5).

### q2b-25 — "The later real run" is undefined; the gate is circular; the pilot ministry's status is unstated

- **What could go wrong.** Two readings, both bad:
  1. "Real run" = a Q1 practice run (custody plus staging, no target write). That cannot exercise "reviewed exceptions and recovery", commit-level reconciliation, or "zero unintended send, enrollment, payment or public effect" (`roadmap.md:4401-4403`). So the gate is claimed without being met.
  2. "Real run" = a committed switch. Q1 lets a switch be scheduled only when every Minimum Switch Kit family is committable (decision-log §1 Q1 clause 1, repo-ratified). If Asym offers switches only for supported profiles, the first switch can never happen. Someone eventually "temporarily" accepts synthetic or practice evidence.

  Also unstated: Phase 29 custody records require a non-null Tenant and environment (`P29/proof.md:42`, re-checked; repo-published, unmerged). So the pilot ministry must be onboarded as a Tenant in the approved environment **before** its first real export can be held. That is the first tenant onboarding, which closes the fresh-build window (`roadmap.md:432-434`). Q1 also makes named O12 owners a precondition for any ministry with recurring giving, which the pilot very likely has (inferred). F4 (rehearsal mode) decides where recovery can be exercised safely.

- **Why it matters.** C23 is the release gate. `delivery-contract.md:45` already expects "a representative user pilot" (repo-published). Leaving the mechanism undefined invites either a hollow gate or a weakened one.
- **Severity / likelihood.** High / high.
- **Effect.** changes (defines the run and a pilot status; C23 is unchanged).
- **Best permanent fix.** Three profile statuses:
  - **Unavailable** (default);
  - **Pilot**: real practice runs in custody for the named design-partner installation have passed format, coverage and level-1/level-2 reconciliation (Q1 clause 9). Target-specific reversal and reconciliation procedures are published (`roadmap.md:4403`). The profile is offered only to that partner, under its agreement, with O12 owners named if it has recurring giving;
  - **Supported**: the pilot switch has gone live with reviewed exceptions, recovery exercised (abort-and-converge in rehearsal per F4, and at least one target batch reversal), reconciliation signed off, and zero unintended outward effects verified.

  Only the third meets `roadmap.md:4403`. Sequence: NOW stages → agreement → Tenant onboarding in the approved environment (Phase 10 present, q2b-16) → readiness and D13 census → real practice runs → Pilot → pilot switch → Supported.

- **Language to add.** "'The real run' is the first participating ministry's SiteStacker Switch, run as a named pilot. Before it, real practice runs in Phase 29 custody may move the profile from _unavailable_ to _pilot_ for that ministry only. The profile becomes _supported_ only after the pilot switch goes live with reviewed exceptions, exercised recovery, signed reconciliation and verified zero unintended effects. The pilot ministry is onboarded as a Tenant in the approved environment before its first real export is held."
- **Bucket.** resolve_before_recording.

---

## 10. Category 21 — Testability, traceability and proof

**Material concern: yes.** The decision's two-way label (synthetic vs real export) leaves fake-row exports ambiguous in a way that cuts both ways. "Supported" has no falsifiable criteria, and nothing says how evidence becomes fixtures or where the rule is recorded.

Checked: evidence classes and labels; falsifiable criteria for "supported"; turning evidence into fixtures; mandatory-fixture behaviour; traceability into glossary, ADR, OpenSpec, tickets and tests.

### q2b-26 — Fake-row exports are "drawn from a real export(er)": the label is ambiguous in both directions

- **What could go wrong.** "Fixtures not drawn from a real export are labelled synthetic." A fake-row file _is_ output of the real SiteStacker exporter (q02-r2 §3.2 and U12). Read one way, it is "drawn from a real export" and someone argues it may mark the profile supported. Read the other way, it is "synthetic" and its genuine format evidence (real headers, real encoding, real ID columns) is discounted alongside Asym-invented files.
- **Why it matters.** `roadmap.md:4395` forbids synthetic source success. P21 D27 already keeps "synthetic, sandbox, and production-shadow evidence ... distinct" (`roadmap.md:2546`, repo-published), so class separation has precedent.
- **Severity / likelihood.** High / high (the ambiguity is in the text as worded).
- **Effect.** changes (three classes replace two).
- **Best permanent fix.** Define three classes and what each may prove:
  - **synthetic**: authored by Asym, from documentation, templates or derived observations. Proves Asym's own logic only;
  - **vendor-format sample**: real SiteStacker exporter output over fake rows, or a header capture (sub-classes _fake-row export_ and _header capture_), plus _vendor-supplied_ material (q2b-24). Proves the format facts it exercises, for its version (q2b-08, q2b-09);
  - **representative real export**: a full real export under the agreement, held in qualified custody. The only class that can move a profile to pilot or supported (q2b-25).
- **Language to add.** "Evidence has three classes: _synthetic_ (Asym-authored), _vendor-format sample_ (real SiteStacker output over fake rows, header captures, and vendor-supplied material) and _representative real export_. Only a representative real export, through the pilot run, can make a SiteStacker profile pilot or supported. Vendor-format samples prove only the format facts they exercise, for their recorded version."
- **Bucket.** resolve_before_recording.

### q2b-27 — No falsifiable "supported" criteria, no fixture-derivation rule, and no traceability home

- **What could go wrong.** "Supported" is declared on judgement. Raw fake-row CSVs get committed as fixtures, carrying installation labels (q2b-13) and ministry identity (q2b-12). A missing giving fixture quietly lets a suite pass. The rule lives only in a grill log.
- **Why it matters.** "A mock, structural fixture, schema check or passing documentation test cannot substitute for required source behavior" (`delivery-contract.md:41`, repo-published). "Missing mandatory fixture ... never silently turns the release suite green" (`P29/proof.md:250`, AC29-P17-05; repo-published, unmerged).
- **Severity / likelihood.** Medium / high.
- **Effect.** changes (adds criteria and a derivation rule).
- **Best permanent fix.**
  - Falsifiable criteria per surface, reusing Q1:
    - header recognised under header-driven mapping;
    - every row has exactly one disposition;
    - file row count equals the on-screen count;
    - native-currency totals by Legal Entity × currency × source basis tie to export totals and to independent controls (Q1 clause 9);
    - no unexplained value loss in encoding, date, number or multi-value parsing;
    - an exact repeat import writes nothing (Q1 clause 5);
    - the version range is recorded;
    - zero unintended outward effects.
  - Fixtures: raw vendor-format samples stay private. The repository receives Asym-authored _synthetic_ fixtures that reproduce the observed format properties with neutral labels. Each carries its class and the register id it derives from (q2b-21). A required fixture class that is missing reports "unqualified", never "pass".
  - Traceability: CONTEXT.md terms for the three evidence classes, _Evidence Register_ and the _pilot/supported_ statuses; an ADR-IM-002 for this durable evidence policy; Phase 30 OpenSpec requirements carrying the criteria above; tests that read the fixture class metadata.
- **Language to add.** "A SiteStacker surface is supported only when, on the pilot switch, it meets: header recognised; one disposition per row; file count equals on-screen count; totals tie by Legal Entity × currency × source basis to export totals and independent controls; no unexplained value loss; exact repeat import writes nothing; version range recorded; zero unintended effects. Repository fixtures are Asym-authored synthetic files carrying their class and source register id; a missing required fixture class reports unqualified."
- **Bucket.** spec_requirement.

---

## 11. Category 22 — Other development hazards

**Material concern: yes.** Every human role in the decision is unassigned. The repo names no legal owner, and the decision's own steps (sign, check files, ask WMTEK, approve the environment, own the partner relationship) have no owners. Unsafe defaults found elsewhere are folded into q2b-02 (opening files in Excel), q2b-03 (fake-record defaults) and q2b-11 (`seed-demo.sh` targeting production).

Checked: ownership; unsafe defaults; maintainability traps (fixed presets, covered by q2b-10 and q2b-23; raw fixtures, covered by q2b-27).

### q2b-28 — No owner for the relationship, the evidence, the environment approval, the agreement or WMTEK contact

- **What could go wrong.** Each step waits for someone else. Or the wrong person does it: an engineer signs off an environment, a researcher receives and forwards a file, a contributor emails WMTEK naming the ministry.
- **Why it matters.** The repo names only role classes for legal, privacy and security approval (q02-r2 §4, repo absence). D13 leaves "who runs it" open. F18 (who operates a switch) is open.
- **Severity / likelihood.** Medium / high.
- **Effect.** changes (names roles, not people).
- **Best permanent fix.** Name the roles in the decision; the founder assigns people later:
  - **relationship owner**: the ministry contact, consent, the written go-ahead for stage 2, pilot status;
  - **evidence custodian**: receipt check, register, label screen, disposal;
  - **environment approver**: q2b-11 sign-off;
  - **legal owner**: agreement sufficiency and the Art. 9 question;
  - **signatory**;
  - **WMTEK contact**: generic questions only.

  One person may hold several roles, but the environment approver should not be the person who builds the environment (inferred good practice; no conflicting repo rule found).

- **Language to add.** "Roles: relationship owner, evidence custodian, environment approver, legal owner, signatory and WMTEK contact. Each is named before the stage that needs it starts. The environment approver is not the builder of that environment."
- **Bucket.** resolve_before_recording.

---

## 12. Consolidated decision language (for the founder; proposed, not ratified)

The amendments below keep the founder's structure and every one of its restrictions. None weakens C23 or `roadmap.md:4395`. Each item marked ★ contains at least one resolve_before_recording finding. Related safeguards and spec items are listed with it so the clause reads as a whole; their own buckets are in §1-§11.

1. ★ **Evidence classes (q2b-26).** Three classes: _synthetic_ (Asym-authored); _vendor-format sample_ (real SiteStacker output over fake rows; header captures; vendor-supplied material); _representative real export_ (full real export under the agreement, in qualified custody). Only a representative real export, through the pilot run, can make a profile _pilot_ or _supported_.
2. ★ **Fail-closed branch (q2b-01).** Without a willing ministry by the recorded review date, or after withdrawal, the profile stays _unavailable_; source-agnostic work continues on synthetic fixtures; the founder re-decides the source.
3. ★ **No real person in NOW (q2b-02, q2b-17).** The custodian checks every file first, privately, in a text editor, before any person, repository or AI tool. Any unmarked row or data row means quarantine, no analysis, the ministry told, and every copy deleted with the deletion recorded. Asym views no real records in guided sessions, and nothing is recorded while a live installation is shared.
4. ★ **Stage 2 safety (q2b-03, q2b-07).** Spark-tree review (including Report Export) and the ministry's written go-ahead first. No gifts, batches, recurring schedules, users, newsletter or Mailchimp membership, or automation-referenced record or relationship types. Agreed marker; dated deletion; marked rows in later exports become visible test-record exclusions.
5. ★ **Where artifacts live (q2b-12, q2b-13, q2b-14).** A private, access-listed store; nothing identifying the ministry in the repository or tracker; all NOW artifacts confidential by default, with labels screened; AI only after the check and screen; no AI over real exports until F6 is decided and the agreement names the processor.
6. ★ **LATER gate (q2b-11, q2b-16, q2b-06).** Agreement (checklist, q2b-15) AND the Phase 29 staff-migration source-file custody profile _qualified_ in an approved environment (criteria list in q2b-11) AND Phase 10 classification and restricted handling there AND fresh readiness and D13 hosted censuses AND an agreed export scope that excludes out-of-scope families, which are dispositioned from counts.
7. ★ **The real run (q2b-25).** The first ministry's switch, run as a named pilot. Statuses: unavailable → pilot (real practice runs pass; procedures published; offered to that partner only; O12 owners named if it has recurring giving) → supported (pilot switch live with reviewed exceptions, exercised recovery, signed reconciliation, zero unintended effects). The pilot is onboarded as a Tenant before its first real export is held.
8. ★ **Roles (q2b-28).** Relationship owner, evidence custodian, environment approver, legal owner, signatory, WMTEK contact; WMTEK contacted without identifying a ministry unless it consents (q2b-24).
9. **Spec requirements.** Evidence register and lifecycle (q2b-05, q2b-21); version-drift re-check (q2b-04); header captures prove labels only (q2b-08); probe limits (q2b-09); no pooling of evidence kinds or installations (q2b-10); disposal triggers (q2b-18); in-custody volume probe (q2b-19); "supported" scope (q2b-23); falsifiable criteria, fixture derivation and traceability (q2b-27); staff-migration custody profile defined with the Phase 29 owner (q2b-22).

---

## 13. Corrections and notes on the research

| #   | Research statement                                                                                                | Note                                                                                                                                                                                                                             | Evidence                                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| N1  | q02-r1 §3b E11: the entity "Export For Import" file "can be shared: it holds definitions, not personal data".     | True for person rows only. Entity group, entity and field names can reveal programmes (the vendor demo has "Child Enrollment - Health Info") and worker or country labels. Treat it as confidential discovery material (q2b-13). | `phase-10-sensitive-data-safety.md:30` (repo-ratified); q02-r1 §1 (verified-vendor-doc screenshot) |
| N2  | q02-r1 §3a fake-record set: hard characters "é, ñ, ü".                                                            | These are all in Windows-1252, so they cannot tell a cp1252 file from UTF-8 for non-Latin scripts. Add a non-Latin script and a 4-byte character (q2b-09).                                                                       | inferred (encoding fact)                                                                           |
| N3  | q02-r2 §7 / U13: whether the census must precede receipt of a real export is open.                                | Resolved by construction if the first real export is accepted only as a Q1 practice run (q2b-06, q2b-25). Phase 29 custody also needs a non-null Tenant, so onboarding precedes receipt.                                         | `P29/proof.md:42` (repo-published, unmerged, re-checked)                                           |
| N4  | q02-r2 §6: "the Q2 decision gates the real export on agreement + Phase 29 ... but not on Phase 10/12".            | Agreed, and stronger: Phase 29's own storage-object model requires a Phase 10 classification on every object, so "Phase 29 qualified" without Phase 10 is internally incomplete.                                                 | `owner-constraints.md:171-175` (repo-published, re-checked)                                        |
| N5  | q02-r1 §3b: to capture a giving header, "open the real export in a text editor, copy line 1 and delete the file". | The same step can measure volume at no extra privacy cost (q2b-19). It also fires any Spark "Report Export" event, so the q2b-03 gate applies to stage 3 as well as stage 2.                                                     | q02-r1 C9 (verified-vendor-doc screenshot)                                                         |

---

## 14. Unverified and limits

- Hosted runtime state (policies present, migration drift, whether production holds real rows) was not inspected; no database access. The production `public read` exposure rests on `tenant-read-floor.md:23` plus the unverified #2083 drift comment.
- Whether any agreement, NDA, privacy assessment or design-partner arrangement exists outside the repo is unknown.
- The Art. 9(2)(d) compatibility question is legal and is routed, not answered.
- The MySQL 3-byte `utf8` limitation is general MySQL behaviour. Whether a given SiteStacker installation uses it is unknown.
- Phase 29 citations are to the unmerged PR #2430 head and may change before merge.
- Ministry workflows are not asserted as facts. Burden estimates (q2b-20) are inferred from the researched procedure's size.

---

## 15. Verdicts

| Cat                 | Material concern | Verdict                                                                                                                                                     | Concerns              |
| ------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 12 Failure modes    | Yes              | Happy path only; needs a fail-closed branch, a no-real-data stop rule and a Spark gate                                                                      | q2b-01, -02, -03, -04 |
| 13 Lifecycle        | Yes              | No evidence lifecycle, version binding or census ordering; fake records can leak into the real run                                                          | q2b-05, -06, -07      |
| 14 Integrity        | Yes              | Pasted headers and tiny clean samples over-prove; evidence kinds and installations can pool                                                                 | q2b-08, -09, -10      |
| 15 Security/privacy | Yes              | "Approved environment" empty while anon reads are recorded; public repo; labels; AI; agreement content; minimisation and Phase 10; screen shares; retention | q2b-11 to q2b-18      |
| 16 Scale            | Yes (narrow)     | Volume dark until LATER; a free in-custody probe fixes most of it                                                                                           | q2b-19                |
| 17 Operations       | Yes              | Heavy admin burden, unowned triage                                                                                                                          | q2b-20                |
| 18 Auditability     | Yes              | No evidence register or traceability                                                                                                                        | q2b-21                |
| 19 Dependencies     | Yes              | Unticketed Phase 29 profile; one-ministry overfitting; WMTEK disclosure                                                                                     | q2b-22, -23, -24      |
| 20 Rollout          | Yes              | "Real run" undefined; gate circular; Tenant onboarding precedes LATER                                                                                       | q2b-25                |
| 21 Proof            | Yes              | Two-class label ambiguous; no falsifiable "supported"                                                                                                       | q2b-26, -27           |
| 22 Other hazards    | Yes              | Every role unassigned                                                                                                                                       | q2b-28                |

**Overall disposition: accept with required amendments.** The staged approach is sound and stricter than the repo's own text, and nothing found invalidates it. Before recording, nine items need founder language (★ in §12): q2b-01, -02, -03, -11, -12, -16, -25, -26 and -28, with -14 as a one-line addition. The remaining findings are spec requirements, implementation safeguards or monitors.
