# Q2 v1 adversarial review: staged SiteStacker evidence sourcing

Phase 30 Imports & Migration grill, Q2 (F2). Reviewer: independent adversarial pass, 2026-11-01. Read-only; this file is the only write.

- Baseline: `develop` `629cb71dc`; Phase 29 spec at PR #2430 head `1483a349514c66b458da38e0ba0992efdc2e1f31` (open, unmerged; ratified and published as #2429).
- Inputs read: `grill/decision-log.md` (§1 Q1, C1-C23, D1-D23, O1-O18, F1-F19); `CONTEXT.md`; `docs/adr/0001-*.md`; `q02-r1-expected-sitestacker-artifacts.md` (r1); `q02-r2-custody-fixtures-policy.md` (r2); `q01-r1-sitestacker-inventory.md` §5-§6; `q01-adversarial-review.md` A14/A15 and `:2122`; `roadmap.md:4360-4415`; P29 `source-inventory.md:165`, `founder-brief.txt:85,283,313`, `custody-and-integration.md:368` at the PR head; `docs/security/tenant-read-floor.md:1-26`.
- Spot-verified in this review: grill folders for other features are tracked in the public repo (`git ls-files docs/features | grep grill` → `donor-development/grill`, `missionary-workspace-depth/grill`, `support-hub/grill`); `.gitignore` has no evidence/fixture/CSV exclusion; no CSV/TSV/XLSX tracked; `tenant-read-floor.md:23` says hosted projects carry `public read` today; P29 F30 row says "Exact new P30 implementation ticket not established here".
- Labels: repo-ratified · repo-published · repo-integrated · verified-vendor-doc · inferred · assumption.

## Decision under review (paraphrased)

NOW (willing SiteStacker ministry, no donor data): (1) no-personal-data census questionnaire; (2) exports of a few clearly fake people/households/relationships/custom fields the ministry creates in its SiteStacker; (3) header line of each giving export copied from a text editor. LATER: real full exports only after a signed agreement with data-processing terms AND Phase 29 private storage built in an approved environment; the release gate (`roadmap.md:4403`, `:4395`) is met only by that real run. Fixtures not drawn from a real export are labelled synthetic and never mark a SiteStacker profile supported. WMTEK asked in parallel, never relied on. Existence of a willing ministry: unknown.

## Overall verdict

**Accept the direction; record only with amendments.** The staged shape is the right level, matches market practice (scoping before contract, real copy after contract; r1 §6 lessons a-b) and is stricter than repo text on synthetic evidence (r2 §3.2). It fails as worded in four places that must be resolved before recording: (a) "approved environment" and "built" are undefined while the obvious candidate (production) is demonstrably unsafe; (b) the label rule misclassifies real-exporter/fake-content files and leaves "fixtures drawn from a real export" open as a path to the public repo; (c) which run qualifies a profile is unstated, so Q1 scheduling and Q2 support can deadlock; (d) NOW artifacts have no custody rule while the grill folder they would naturally land in is published.

Bucket counts: 4 resolve_before_recording (q2a-01 to q2a-04); 10 spec_requirement (q2a-05 to q2a-14); 2 monitor (q2a-15, q2a-16); 1 implementation_safeguard (q2a-17, plus the guard in q2a-04).

## Category verdicts

| #   | Category                                  | Material concern? | Verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Concerns                               |
| --- | ----------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 1   | Problem validity, necessity, alternatives | Yes (medium)      | Right problem at the right level: Phase 30 can't qualify a kit without evidence of what SiteStacker emits, and the release gate needs a real run. Requirements are too vague in the LATER gate. The giving-file gap is the weakest part. The strongest alternative (a ministry-run local structural profile) is worth holding in reserve, not adopting now. The founder's "what will come out" question is answered by r1 §0-§2 and should be linked from the record | q2a-01, q2a-13, q2a-15, q2a-16         |
| 2   | Brittleness                               | Yes (medium)      | It assumes a willing ministry, a full-access exporter, a correct self-attested Spark census, and a version that doesn't change between NOW and LATER. None of these is guaranteed                                                                                                                                                                                                                                                                                    | q2a-06, q2a-08, q2a-16                 |
| 3   | Technical debt                            | Yes (low)         | The decision adds no debt itself. The risk is that NOW files turn into permanent single-installation fixtures and that two label vocabularies grow side by side                                                                                                                                                                                                                                                                                                      | q2a-17                                 |
| 4   | Edge cases                                | Yes (high)        | Fake records firing Spark, including the **Report Export** folder during header capture. A filter export leaking real rows. Fake rows surviving into the real export. Headers that name workers or countries. A restricted exporter. Unsolicited real data from the ministry or WMTEK                                                                                                                                                                                | q2a-04, q2a-06, q2a-07, q2a-09         |
| 5   | Footguns                                  | Yes (high)        | Grill folders are published to the public repo. Nothing says where NOW files live, whether AI tools may read them, or what happens when real data arrives anyway. "Fixtures drawn from a real export" reads as permitted                                                                                                                                                                                                                                             | q2a-02, q2a-04                         |
| 6   | Tenant safety                             | Yes (medium)      | NOW has no tenant concern. LATER does: receipt before the ministry is a Tenant, the eligibility check skipped for kit-development receipt, and ministry-specific labels leaking into shared presets                                                                                                                                                                                                                                                                  | q2a-11                                 |
| 7   | Database, RLS, authorization              | Yes (critical)    | "Approved environment" is undefined, and the obvious candidate (production) carries anon `USING (true)` reads, lags about 58 migrations and is a destructive seed default. Custody grants and actor attribution are unstated                                                                                                                                                                                                                                         | q2a-01, q2a-05, q2a-12                 |
| 8   | Overengineering                           | Minor (low)       | The decision itself is lean and builds nothing NOW, which is correct. The research's proposed NOW pack (37 questions, screenshots, double exports, merges, timestamp probes) is too heavy to put in front of a volunteer administrator as a single step                                                                                                                                                                                                              | q2a-10, q2a-14                         |
| 9   | UX and user friction                      | Yes (medium)      | The steps make sense, but as a written form they are fiddly. Comparable vendors run a worksheet plus a guided consultant session. The decision doesn't state the effort, the risk to the ministry's live system, or an "I don't know" path                                                                                                                                                                                                                           | q2a-14, q2a-07                         |
| 10  | Source of truth, ownership, invariants    | Yes (high)        | The label rule misclassifies real-exporter/fake-content files. "Supported" has no owner, record or scope. Questionnaire answers could be mistaken for the readiness census. The agreement terms are unnamed                                                                                                                                                                                                                                                          | q2a-02, q2a-03, q2a-10, q2a-13         |
| 11  | Hidden coupling                           | Yes (high)        | The circular gate (Q1 scheduling vs Q2 support). The release gate is tied to one installation and version. The A15 census is duplicated. The staff-migration custody profile is unticketed. The Phase 10/12 gates are missing. "Never relied on" WMTEK sits against WMTEK-only surfaces                                                                                                                                                                              | q2a-03, q2a-05, q2a-08, q2a-09, q2a-10 |

## Concerns

Format per concern: what could go wrong · why it matters · severity / likelihood · evidence (labelled) · effect on the answer · best permanent fix · exact language · bucket. Current behaviour, intended behaviour and best permanent path are separated where they differ.

### A. Resolve before recording

#### q2a-01 — "Approved environment" and "built" are undefined while the obvious candidate is unsafe (Cat. 7, 1, 11)

- **What could go wrong.** After an agreement is signed, someone treats "production" as the approved environment because it is the "real-data" project (`docs/ops/environments.md:9-17`, `:203-206`). The first real ministry export then sits in a project that, as recorded, still carries the demo anon `public read` policy (`FOR SELECT TO anon USING (true)`) on `donors`, `donations`, `profiles`, `donor_pledges` and others. Anyone holding the public anon key, which ships in every browser bundle, can read it. Separately, a developer running `scripts/seed-demo.sh` hosted mode, whose `EXPECTED_PROJECT_REF` defaults to the production ref, deletes and reseeds 24 tables.
- **Why it matters.** Tenant and donor PII exposure is the top product-safety invariant (AGENTS.md "Product safety"). The data is Art. 9-adjacent: religious affiliation by presence (`roadmap.md:422-424`). "Built" is also ambiguous. Under the repo's ladder, integrated, merged and implemented are not "qualified" (`docs/ai/document-authority.md:44-54`), and P29's own gate for P30 is "qualified P29 custody" (P29 `source-inventory.md:165`, verified at PR head).
- **Severity / likelihood.** Critical / medium. The LATER gate is the only barrier, and its key term is free text.
- **Evidence.**
  - `supabase/migrations/20260216153000_demo_readonly_rls.sql` creates anon `USING (true)` reads; develop drops them in `20260625002117` (lead-verified).
  - `docs/security/tenant-read-floor.md:23`: "`public read` … is what hosted projects carry today" (repo-integrated; verified in this review).
  - Production lags about 58 migrations (#2083 spec comment; repo-published, unverified at runtime).
  - `scripts/seed-demo.sh:6` (repo-integrated).
  - D13 is unreconciled: production holds real donors (`environments.md:5`) vs. the "no users" ruling and ADR-0179 (repo-ratified).
  - P29 never defines "approved environment" (r2 §2.2, verified by search).
  - Public buckets `profiles` and `document-uploads` (`init_schema.sql:461-464`).
- **Effect.** Changes the answer: it must define the term by criteria, not by naming a project.
- **Current behaviour:** no environment qualifies. **Intended:** a qualified, census-proven environment. **Best permanent path:** a criteria list that the founder and security owner approve per environment, re-proved before each receipt. The census mechanics already specified in r10-gap-g3 §5 (C1-C7) are the evidence form.
- **Exact language (add to Q2 decision):**
  > "**Approved environment** (for any byte of a real export): a named hosted environment for which, immediately before first receipt and again before each later receipt, a recorded census shows (1) applied migrations equal the qualified `develop` revision, with no backlog; (2) no policy grants `anon`, `authenticated` or `PUBLIC` an unscoped read (`USING (true)` or equivalent) on any table, and no `anon`/`PUBLIC` grant exists on custody or import tables, proved by a recorded catalog query; (3) the qualified Phase 29 staff-migration custody profile is active there (private storage only; access audit; hygiene; disposal lanes); (4) no repository script or CI job defaults to that environment's project reference and deletes or reseeds data; (5) its real-data status (D13) is recorded; (6) the founder and the security owner approved it on a recorded date. Local machines, preview, development, CI, self-hosted runners, background-job dev servers, error trackers and AI tools are never approved environments. As of 2026-11-01 no environment qualifies. '**Built**' means **qualified** in the sense of `docs/ai/document-authority.md`."
- **Bucket.** resolve_before_recording.

#### q2a-02 — Evidence-class rule misclassifies fake-record exports and implicitly allows fixtures drawn from real exports (Cat. 10, 5)

- **What could go wrong.**
  - "Fixtures not drawn from a real export are labelled synthetic" puts real-exporter/fake-content files (step 2) in the same class as Asym-authored synthetic files. Their evidential value differs: real headers, encodings, ID columns and quoting from SiteStacker's own exporter, for one installation and version.
  - Read in reverse, the sentence implies that fixtures _drawn from_ a real export exist and are not synthetic. That is a path for "sanitized" real rows (amounts, dates, ZIPs, fund names) to reach the public AGPL repo or CI, with re-identification risk.
  - It also leaves vendor samples (WMTEK) unclassified.
- **Why it matters.** The label decides what evidence may drive the kit and what may be published. `delivery-contract.md:41` and `roadmap.md:4395` forbid synthetic success; `roadmap.md:2546` (P21 D27) keeps synthetic, sandbox and production-shadow evidence distinct. No repo rule forbids donor rows in Git outside Web Studio (`web-studio-hybrid/security.md:77`).
- **Severity / likelihood.** High / likely. The ambiguity will be hit the first time a parser test needs a fixture.
- **Evidence.**
  - r2 §3.2 and U12 (inferred).
  - r10-gap-g3 §2 defines "synthetic" as built from import templates (research).
  - The D17 research is more permissive ("sanitized authorized export fixtures", `d17-evidence/source-products.md:199-201`; research only, not ratified).
  - The repo is public, AGPL-3.0 (repo-integrated).
- **Effect.** Changes the answer (wording and an added invariant).
- **Best permanent fix.** A closed evidence-class vocabulary defined once in `CONTEXT.md`, with what each class may prove and where it may live.
- **Exact language:**
  > "Evidence classes: **S** synthetic (authored by Asym from documentation or templates); **F** real-exporter fake content (produced by a ministry's own SiteStacker exporter over records it created as clearly fake, verified per q2a-06 to contain only marked rows); **H** header-only capture; **V** vendor-supplied sample (scope as stated in writing by the supplier); **R** real export (any file containing a real person's or gift's data). S, F, H and V never mark any SiteStacker export surface or version supported. F and H may establish format facts only for the recorded installation and version, labelled provisional. Only R, held in an approved environment under a signed agreement, can qualify a surface. R bytes, and any value derived from R rows, never become repository fixtures, CI data, or input outside the ministry's Tenant. Raw F, H and V files are not committed either. Repository fixtures are S only, re-created by Asym to reproduce recorded F/H format facts, with the installation aliased."
- **Bucket.** resolve_before_recording.

#### q2a-03 — Which run qualifies a profile is unstated, so Q1 scheduling and Q2 support can deadlock (Cat. 11, 10)

- **What could go wrong.** Q1 §1.1 lets a switch be scheduled only when every Minimum Switch Kit family "is committable through its owner's typed import command". Q2 says a profile becomes supported only through "that later real run", and the release gate (`roadmap.md:4403`: "representative SiteStacker migration with reviewed exceptions and recovery") is met only by it. If the real run must be a committed migration, the first ministry's switch can't be scheduled until a switch has happened. Someone then loosens one rule ad hoc, for example by treating a practice run as "the migration" or by scheduling on an unsupported profile.
- **Why it matters.** C3 forbids acquiring authority by shorthand. An ad hoc loosening at the first switch is precisely when money and identity risk peak.
- **Severity / likelihood.** High / certain (structural).
- **Evidence.**
  - decision-log `:25` (Q1 §1.1; repo-ratified).
  - `roadmap.md:4401-4403` (repo-published).
  - `delivery-contract.md:45` "representative user pilot" (repo-published).
  - r2 U15/U16 (inferred).
  - Q1 §3: practice runs write only P29 custody and P30 records (repo-ratified).
- **Effect.** Narrows and changes the answer. It must name the qualifying run and split "first switch allowed" from "generally released".
- **Best permanent fix.** A two-stage qualification that reuses Q1's own machinery:
  - (1) A **qualification run** of the real export set: Q1 practice runs, no target-owner writes, every row dispositioned, level-1 reconciliation and as much of level 2 as controls allow, exceptions reviewed. This marks the exercised surfaces "pilot-qualified" and permits scheduling that ministry's switch only.
  - (2) The **release gate** is met when that switch reaches Switch live with reconciliation sign-off and at least one exercised recovery path (abort-before-go-live and a batch reversal). Only then may other ministries be offered the profile.
- **Exact language:**
  > "A SiteStacker export surface is **pilot-qualified** for a recorded version range when a qualification run of class-R exports in an approved environment produces a complete plan with every row dispositioned, Q1 §9 level-1 reconciliation tied and level-2 tied or declared unavailable, and reviewed exceptions. Pilot qualification permits scheduling that ministry's Switch and no other. The `roadmap.md:4403` gate is met, and the surface becomes **supported** for other ministries, only when that Switch reaches Switch live with signed-off reconciliation and a recorded exercise of abort-before-go-live and batch reversal. The Phase 30 owner records both states; nothing else sets them."
- **Bucket.** resolve_before_recording.

#### q2a-04 — NOW artifacts have no custody, publication, AI or incident rule; the grill folder is published (Cat. 5, 4)

- **What could go wrong.**
  - An agent or human writes the questionnaire answers (ministry name, processors, merchant/connected-account references, module mix, counts) or pastes header lines into `docs/features/imports-migration/grill/q02-…/`. That folder is untracked today, but sibling features' grill folders are committed to the public repo. Fake-record CSVs land in a test-fixtures folder.
  - Subagents (external AI processors) read the files.
  - The ministry, or WMTEK, emails a full real export or its "Is Testing" transactions (staff names, card last-four) "to save time". It then sits in personal email, a laptop and an AI transcript with no deletion path.
  - For a restricted-access ministry, its name joined to a country, module and processor profile is targeting information.
- **Why it matters.** Publication is irreversible (public repo, GitHub notifications, forks and caches). D17 C12 bars even headers to external AI for D17 (r10-gap-g7 `:101`), while F6 is open for staff profiles. Phase 10 names labels such as fund names and campaign slugs as secondary leak vectors (`phase-10:30`, `:64`).
- **Severity / likelihood.** High / likely.
- **Evidence.**
  - Verified in this review: `git ls-files docs/features | grep grill` shows tracked grill folders; `.gitignore` has no evidence/CSV rule.
  - r2 §5.2, U7-U11, U19, U22 (repo-integrated / inferred).
  - `roadmap.md:418-424` "the database itself is a targeting list" (repo-published).
  - Field policy treats processor identifiers as financial (`field-policies/README.md:66-67`; repo-integrated).
- **Effect.** Changes the answer: it adds a NOW custody rule.
- **Current:** the only repo-native stores are public. **Intended:** ministry-confidential handling. **Best permanent path:** a named private store with an access list; committed text uses an alias and records only Asym-derived format facts; a mechanical guard; an incident rule.
- **Exact language:**
  > "NOW artifacts (questionnaire answers, header captures, fake-record files, screenshots, WMTEK replies) are **ministry-confidential**. They are kept only in [named private store] with a recorded access list. They are never placed in the Git repository, GitHub issues, PRs or comments, or tracker text. Committed discovery text names the ministry only by alias and records only Asym-derived format facts. [Founder: AI tools may / may not process class F and H files after q2a-06 verification; questionnaire answers that identify the ministry are not given to AI tools.] They are deleted, with a recorded deletion, [N] days after the ministry withdraws or once superseded by pilot-qualified evidence. Any file containing a real person's data that reaches Asym outside an approved environment and signed agreement (from the ministry, WMTEK or anyone else) is not used, is deleted from every place it reached, the sender is told, and the event is recorded. The questionnaire never asks for, and Asym refuses, credentials, API keys, full card or bank numbers, or merchant secrets."
- **Implementation safeguard (with it).** A `.gitignore` entry plus a pre-commit or CI check that rejects `*.csv`, `*.tsv`, `*.xlsx` and a `private/` evidence path under `docs/features/**`. Today `git ls-files` shows no tracked CSV/TSV/XLSX, so the check is cheap.
- **Bucket.** resolve_before_recording (the rule), plus an implementation_safeguard (the guard).

### B. Spec requirements

#### q2a-05 — The LATER gate names two conditions; the repo requires more, and the custody profile is unticketed (Cat. 11, 7)

- **What could go wrong.** The agreement is signed and "Phase 29 storage" lands, but via #2368, which is D17 self-import only. Its amendment says "Remaining F30 profiles require their actual P30/target-owned components". A real export is then admitted under a custody profile never qualified for staff-migration files. Other problems follow:
  - The file has no Phase 10 classification, which P29's object model requires (`owner-constraints.md:171-175`).
  - Restricted-worker rows (missionary names, countries in fund names) are held with no restricted tier.
  - No owner-supplied retention or disposal rule exists (F11; P29 won't invent one, `founder-brief.txt:289`), so the file is kept indefinitely by default.
- **Why it matters.** The LATER gate is the whole protection, and two items don't cover what the repo itself requires. The unticketed profile also means "LATER" has no path to arrive.
- **Severity / likelihood.** High / likely.
- **Evidence.**
  - #2368 / P29-058 amendment (repo-published).
  - P29 F30 row "Exact new P30 implementation ticket not established here" (verified at PR head).
  - D11 (decision-log `:87`).
  - Phase 10 #628 and children open; no `security_level` on develop (repo-integrated absence).
  - `phase-10:174` alias-on-import is fail-closed (repo-ratified).
  - P29 hygiene `proof.md:173-176`, disposal `:229-235` (repo-published).
  - r2 §1.3 and U3-U6 (inferred).
- **Effect.** Changes the answer (completes the gate list).
- **Exact language:**
  > "Before Asym receives any class-R byte, all of these hold: (a) a signed agreement meeting q2a-13; (b) an approved environment per q2a-01; (c) a qualified Phase 29 custody profile for staff-migration source files (distinct from the D17 profile in #2368), with an owner-supplied retention, hold and disposal rule and the bounded hygiene profile; (d) a Phase 10 classification for the stored object, or, until Phase 10/12 land, the whole file held at the restricted tier and readable only by named roles; (e) the ministry exists as a Tenant in that environment; (f) the retained-state census (D13) for that environment is recorded."
- **Bucket.** spec_requirement. Filing the custody-profile ticket waits for founder `/to-ticket` authorization; record it as a dependency now.

#### q2a-06 — Fake-record step needs explicit safety controls in a live installation (Cat. 4, 2)

- **What could go wrong.**
  - Creating or editing a fake person fires an active Spark event in Person Update, CRM Entity Create/Update, Person Type Assignment or Person Relation Assignment. Possible outcomes are Send Message, Create User, Add Record Type and Construct Entity Field.
  - Header capture (step 3) fires a **Report Export** Spark event.
  - A filter mistake on the export puts real people in the "fake" file.
  - The ministry forgets to delete the fake records. They then appear in the Mailing List report and get posted to, and later turn up in the real export and are imported as Parties.
  - Self-attested Spark screenshots are cut off or miss conditions.
- **Why it matters.** Step 2 writes into the ministry's production system, which Asym can't observe or undo ("gone forever"). A leaked real row turns step 2 into an unconsented real-data transfer.
- **Severity / likelihood.** High / medium.
- **Evidence.**
  - r1 §3a: Spark folder list from vendor screenshot 151000121951, outcomes 151000121954, deletion permanence 151000122181 (verified-vendor-doc).
  - r1 §7 C9: "Report Export" folder (verified-vendor-doc).
  - r1 §3a pollution list (inferred).
  - The decision already rules out gifts implicitly ("people, households, relationships and custom fields"). r1 confirms fake gifts are unacceptable (campaign-goal triggers can cancel real recurring gifts, 151000119746).
- **Effect.** Narrows the answer (preconditions and a marker scheme).
- **Exact language:**
  > "Step 2 runs only after the ministry's written consent naming the administrator who will act, and a census of Spark events in the Person Update, CRM Entity Create/Update, Person Type Assignment, Person Relation Assignment and Report Export folders showing none can fire (or each is disabled for a recorded window and re-enabled after). The Report Export check also precedes step 3. Every fake record carries the marker prefix `ZZ-ASYM-TEST` in its name and a unique reserved-domain email (`example.org` / `.test`). No fake record gets a record type in real use, a newsletter or Mailchimp action, a user login, a workflow, a gift, batch or recurring schedule. Before sending, the administrator confirms the exported row count equals the number of fake records created. Asym rejects any file in which a row lacks the marker (incident rule, q2a-04). The ministry deletes every fake record by a recorded date and attests it. A marked record found in any later export receives a visible excluded disposition and is never imported."
- **Bucket.** spec_requirement.

#### q2a-07 — Header capture: scope too narrow, mechanics risk copying real rows, and headers aren't guaranteed non-personal (Cat. 4, 9)

- **What could go wrong.**
  - "The header line of each giving export" omits surfaces the Minimum Switch Kit needs and step 2 can't exercise: newsletter-list CSVs and the Mailchimp audience export (consent and suppression), Statements and report CSVs (the reconciliation controls in Q1 §9), and the entity "Export For Import" definition files (the best field catalogue, shareable whole).
  - Mechanics: the administrator downloads a full donor export, opens it in Notepad, and copies two lines instead of one. One real donor is now in an email.
  - Copy-paste loses the encoding and BOM, which are the very facts R17 needs.
  - Report and dashboard labels and entity names are installation-defined, so a label can name a worker, country or program. That is a Phase 10 secondary vector.
- **Severity / likelihood.** Medium / likely.
- **Evidence.**
  - r1 §3b feasibility table and "what a header line cannot show" (verified-vendor-doc and inferred).
  - r1 §2.1 E8, E9, E11, E12, E15.
  - r10-gap-g7 `:106` (research).
  - `phase-10:30`, `:64` (repo-ratified).
  - r1 §7 C8: the 2.21 "Visible Columns" setting means the header depends on a setting (snippet-only).
- **Effect.** Narrows and changes the answer (scope and mechanics).
- **Exact language:**
  > "Step 3 covers each export surface step 2 cannot exercise: Contributions Transaction, Campaign, Recurring, Recurring Campaign and Batches views; newsletter lists; Statements and other report CSVs; the Mailchimp audience export; and each entity group's 'Export For Import' file (sent whole). The administrator first applies a filter that matches no rows. Only if that yields no file does the administrator open the export in a plain text editor, copy line 1 only, and delete the file. Each capture records SiteStacker version, the exporter's User Group, the filter, a column-chooser screenshot with every column ticked, the CRM 'Visible Columns' setting, and the editor's encoding and line-ending readout. Header captures are ministry-confidential and may carry restricted labels; they are not treated as non-personal data."
- **Bucket.** spec_requirement.

#### q2a-08 — Release gate and "supported" are coupled to one installation and version (Cat. 11, 2)

- **What could go wrong.** One ministry's run is treated as qualifying "the SiteStacker profile". Reports and dashboard columns are defined per installation, and columns are user-chosen per export. Installations update monthly; releases reach at least 2.56; 2.47 changed CSV encoding for Excel. The second ministry's files differ, and the kit fails, or silently mis-maps, on a "supported" profile.
- **Why it matters.** It creates false confidence exactly where money mapping happens (giving files).
- **Severity / likelihood.** Medium / likely.
- **Evidence.**
  - r1 §0.7(b), §2.2 "Column selection" and "Release level" (verified-vendor-doc and snippet-only).
  - q01-r1 §6 R19 (proposed).
  - r1 §4: "Proves … for this installation and version only".
- **Effect.** Narrows the answer.
- **Best permanent fix.** Scope support to what was exercised, and make the NOW steps the permanent per-ministry pre-flight rather than a one-off.
- **Exact language:**
  > "'Pilot-qualified' and 'supported' are scoped to (export surface, SiteStacker version range, exporter permission class) actually exercised. Every ministry repeats the questionnaire and header capture as a per-installation pre-flight. A header set, version or exporter class outside the supported scope makes that surface provisional for that ministry until reviewed mapping and practice-run evidence close the gap. Mapping presets are suggestions keyed to observed header sets, never fixed column positions."
- **Bucket.** spec_requirement.

#### q2a-09 — "WMTEK asked in parallel, never relied on": disclosure risk, unsolicited data, and WMTEK-only surfaces (Cat. 11, 4)

- **What could go wrong.**
  - Asym asks WMTEK about "Ministry X's" installation. WMTEK, the ministry's current vendor, learns the ministry is leaving before the ministry has decided or given notice. r1 Q-F2 asks about the renewal date and notice period for exactly this reason.
  - WMTEK replies with a sample built from another customer's data, or a database dump.
  - Some Minimum Switch Kit evidence may be reachable only through WMTEK: Historic Giving has no documented export (E18); BI datasets need WMTEK configuration (E10); Statements are installed on request. Pre-SiteStacker giving loaded into Historic Giving (r1 B7) then has no self-serve path. "Never relied on" and Q1's "no exception lets a switch proceed with a kit family missing" collide.
- **Severity / likelihood.** Medium / medium.
- **Evidence.**
  - r1 §2.1 E9, E10, E18, E20 (verified-vendor-doc and inferred).
  - q01-r1 §6 R5/R6 "Entirely Real (needs BI or WMTEK extract)".
  - decision-log `:25` (repo-ratified).
  - r2 U22.
- **Effect.** Narrows the answer.
- **Exact language:**
  > "Questions to WMTEK do not identify the ministry unless the ministry authorizes it in writing. 'Never relied on' means no Minimum Switch Kit family may depend on a WMTEK deliverable. A family reachable only through WMTEK is either a ministry-procured extract qualified as its own source profile under the same LATER gate, or, where Q1 §1(b) allows, a ministry-accepted visible exclusion. [Founder: rule whether pre-SiteStacker history held only in Historic Giving belongs to the 'one-time giving history' kit family.] Any WMTEK-supplied sample is class V; one containing real data falls under the incident rule (q2a-04)."
- **Bucket.** spec_requirement, with one founder ruling.

#### q2a-10 — The NOW questionnaire duplicates the Q1 A15 census with a different status and no content boundary (Cat. 11, 10, 8)

- **What could go wrong.**
  - Two overlapping artifacts drift apart: the NOW questionnaire and the A15 processor-and-automation census, which is a gate before the first practice run and re-taken at final export.
  - Months-old NOW answers are later read as the readiness census.
  - "No personal data" doesn't exclude credentials, merchant secrets or account numbers.
  - The 37-question draft in r1 §3c, sent as one form, is abandoned or half-answered.
- **Severity / likelihood.** Medium / likely.
- **Evidence.**
  - `q01-adversarial-review.md:45` (A15), `:2122` (readiness census composition).
  - decision-log `:25`(d), `:27` (repo-ratified).
  - r2 U18 (inferred).
  - r1 §3c (proposed).
- **Effect.** Changes the answer (status and tiering).
- **Exact language:**
  > "The NOW questionnaire is a **discovery declaration**, not the Q1 readiness census. Its items reuse the census item identifiers so answers can pre-fill, but the census is re-taken and attested before the first practice run. It asks for counts as ranges and never asks for credentials, keys, full account or card numbers, or any person's name. Tier 1 (whether to proceed: version and hosting, Sites and currencies, processors per Site, recurring engines including PayPal, modules in use, rough counts, who can export and sign) comes before Tier 2 (inputs for steps 2-3: Spark census, entity definitions, column choosers)."
- **Bucket.** spec_requirement.

#### q2a-11 — Tenant safety of LATER receipt and of derived presets (Cat. 6)

- **What could go wrong.**
  - A real export is received for "kit development" before the ministry is a Tenant, into an Asym-internal scope. P29 requires a non-null tenant, environment and source on custody records (`P29/proof.md:42`).
  - A shared installation or fiscal-sponsor merchant account brings another organization's supporters, because the Q1 §1.1 eligibility checks run only for a switch.
  - Mapping presets built from this ministry's files carry its custom-field, fund and report labels into a catalog other tenants see.
- **Severity / likelihood.** Medium / medium.
- **Evidence.**
  - Q1 §1.1 eligibility (repo-ratified).
  - q01 A11 (shared installation risk).
  - r2 §1.1 (P29 scope fields).
  - C17: imported PII never leaves its boundary to improve mapping (repo-ratified).
- **Exact language:**
  > "Class-R bytes and every row derived from them stay inside the ministry's own Tenant in the approved environment. The Q1 §1.1 eligibility checks (one organization per installation and per merchant account) apply before any class-R receipt, including receipt outside a scheduled Switch. Shared presets contain only vendor-generic SiteStacker labels; ministry-specific labels live only in that Tenant's mapping."
- **Bucket.** spec_requirement.

#### q2a-12 — Custody authorization and actor attribution for intake are unstated (Cat. 7)

- **What could go wrong.**
  - Asym staff read the raw export through service-role or storage-console access "to help with mapping", with no grant and no audit.
  - Uploads by Asym staff "on behalf of" the ministry carry no ministry actor.
  - Background parse jobs run with service-role identity because jobs can't yet carry a staff actor's authority (decision-log §8).
  - The exporter's SiteStacker User Group is not recorded, so restricted-exporter truncation (R3) is undetectable.
- **Severity / likelihood.** Medium / medium.
- **Evidence.**
  - decision-log §8 (repo-integrated: frozen service-role allowlist; jobs can't carry staff actor).
  - C16 (repo-ratified).
  - F18 open (Operator Tenant Grant).
  - P29 access audit `proof.md:199-209` (repo-published).
  - `CONTEXT.md` Source Snapshot Manifest records exporter role.
- **Exact language:**
  > "A class-R file is readable only by named roles in the ministry's Tenant and by Asym staff holding a time-bounded, reason-recorded Operator Tenant Grant (F18); never through service-role, storage-console or direct database access. Each receipt records uploader, the ministry user on whose behalf it was uploaded, the agreement reference, the SiteStacker exporter's User Group and version. Every read appears in the Phase 29 access audit. Deferred jobs re-prove the initiating actor's current authority (C16)."
- **Bucket.** spec_requirement.

#### q2a-13 — "Signed agreement with data-processing terms" names no minimum terms, signer or template (Cat. 10, 1)

- **What could go wrong.** A generic NDA or e-signed pilot letter is treated as satisfying the gate. In that case:
  - The subprocessor list omits services that actually touch the data (GitHub, AI tools, Inngest, Sentry), none of which are on the public list (`openpolicy.ts:36-61`).
  - Retention ignores backups (35 days in the draft schedule).
  - Non-US donors (Canadian) or a residency requirement are missed.
  - No one owns breach notice.
- **Severity / likelihood.** Medium / likely. The repo has no MSA/DPA, customer agreement or named legal owner.
- **Evidence.**
  - r2 §4 (repo absence).
  - ADR-0115 `:151-152` (MSA/DPA as future dependency).
  - `roadmap.md:422-424` Art. 9 framing.
  - Legal sufficiency is out of scope for this review.
- **Effect.** Changes the answer (names the minimum content; counsel decides the form).
- **Exact language:**
  > "The agreement is reviewed by counsel and signed by a named ministry signatory and a named Asym signatory. It records at least: roles (ministry controller, Asym processor); purpose limited to kit qualification and the ministry's own Switch; every subprocessor that will touch the data, including any AI or code-hosting service; data location; retention, return and deletion, including backups; breach notice; and the ministry's special-category and non-US-donor posture."
- **Bucket.** spec_requirement (legal owner to supply the template).

#### q2a-14 — Ministry administrator friction: a written form plus fiddly steps, with no guided path (Cat. 9, 8)

- **What could go wrong.** A part-time or volunteer administrator is asked to work through Spark screenshots, column choosers, encoding readouts, zero-match filters and dated deletions, alone, from written instructions. They stall, make mistakes (which feeds q2a-06 and q2a-07 leaks), or the ministry withdraws. Non-technical staff may not know what a "plain text editor" or "line endings" are.
- **Comparable practice.** Neon One's onboarding uses a planning worksheet reviewed with a consultant, a "data analysis meeting" where mapping is decided ("the most consequential meeting of your onboarding"), and an export chosen "the day you sign" (neonone.com/?p=66888, fetched 2026-11-01; vendor marketing). DonorSnap's conversion expert explains the export (search snippet). Bloomerang uses an onboarding specialist and a data conversion team (get.bloomerang.co, snippet). Mission CRM produces a data dictionary with counts and sample values (AppSource snippet). No vendor-published questionnaire was found (r1 §6 item 5). So the pattern is a worksheet plus a guided session, with the real copy after contract. Q2's staging matches it; its delivery mode should too.
- **Severity / likelihood.** Medium / likely.
- **Exact language:**
  > "NOW steps are delivered as a short worksheet with an 'I don't know' answer on every item, plus one guided session (an Asym specialist with the ministry's administrator, about 60-90 minutes, not recorded, using zero-match or fake-record filters so no real rows appear on screen). Before consenting, the ministry is told the expected effort, what step 2 can trigger in its live system, and the deletion steps. Materials use plain language and work with a screen reader."
- **Bucket.** spec_requirement.

### C. Monitor

#### q2a-15 — Giving-file formats stay dark until LATER; strongest alternative held in reserve (Cat. 1)

- **What could go wrong.** The header lines leave R17 (encoding, number format: "$400" / "($8,000)" display risk), R9 (status vocabulary as written), R4 (whether join columns hold values) and R7 (actual currencies and Sites) unproven for giving files. Those files are the riskiest part of the Minimum Switch Kit. The kit is designed blind, and the first real export forces rework.
- **Alternatives compared.**
  - (a) **Ministry-run local structural profile.** A browser-only page or script, run by the ministry on its own machine with no upload. It outputs encoding, delimiter, row count, per-column fill rate and value _shape_ (for example `9999.99`, `($9,999)`, `YYYY-MM-DD HH:MM:SS`), and distinct values only for allowlisted low-cardinality columns (Status, Type, Payment, Currency, Recurrence). The ministry reviews the output before sending. Client-side parsing is an established pattern (third-party vendor pages: CSVBox Private Mode, Dromo, Papa Parse; marketing claims, unverified). It would close most of R17/R9/R7 now. Costs: a small build, the ministry trusting Asym software, and an allowlist so fund or campaign names (Phase 10 secondary vectors) never leave.
  - (b) **An empty WMTEK sandbox installation** (not a copy of production) where fake _gifts_ are safe. Its existence and cost are unknown (r1 §3a; Q-A4).
  - (c) **Header-only capture of the ministry's pre-existing "Is Testing" transactions.** This adds nothing beyond (a).
  - Neon recommends the organization "pull a real test export … and see what comes out", which is self-inspection by the owner. That is the same principle as (a).
- **Why not adopt now.** It is proportionate to wait for the first NOW pack. If CRM-side F evidence plus giving headers already settle the format questions, (a) is unnecessary.
- **Monitor.**
  - Signal: after the first ministry's NOW pack is analysed, any of R4-existence, R7, R9 or R17 for a Minimum Switch Kit giving surface remains unproven.
  - Threshold: one or more such surfaces.
  - Owner: Phase 30 spec owner.
  - Response: offer option (a) as an optional NOW step 4, with an allowlist reviewed by the Phase 10 owner. If the questionnaire shows a data-empty sandbox installation exists, consider (b).
- **Severity / likelihood.** Medium / likely. **Effect:** no change now.

#### q2a-16 — No willing ministry is confirmed (Cat. 1, 2)

- **What could go wrong.** The whole NOW sequence and the release gate wait on a partner who may not exist. Kit work then either stalls or quietly proceeds on synthetic evidence that drifts toward "supported".
- **Evidence.** Q1 A15 "No real export, supplier or consenting ministry exists". The decision-log F2 note asks "does a willing SiteStacker ministry exist". r2 §8: no design-partner program, prospect record or onboarding procedure exists (repo absence).
- **Monitor.**
  - Signal: no ministry has given written consent to NOW steps by [founder date].
  - Owner: founder.
  - Response: kit and parser work continue against S/F-class evidence labelled provisional. The release gate stays closed. Revisit WMTEK sandbox or paid-extract options under q2a-09 without relying on them.
- **Severity / likelihood.** Medium / unknown. **Effect:** no change (the decision already keeps the gate closed). Record the contingency explicitly.

### D. Implementation safeguards

#### q2a-17 — NOW evidence ossifying into single-installation fixtures and parallel vocabularies (Cat. 3)

- **What could go wrong.** Parser tests hard-code one installation's column order, date format or encoding as "the SiteStacker format". A third label vocabulary grows beside P21 D27 (synthetic/sandbox/production-shadow) and ADR-0179 (fixture/derived/retained/unresolved).
- **Fix.**
  - Every fixture carries a provenance manifest: evidence class (q2a-02), installation alias, SiteStacker version, capture date and the format facts it reproduces.
  - Parsing is header-driven per installation.
  - The evidence-class vocabulary is defined once in `CONTEXT.md`, with a mapping to the P21 D27 and ADR-0179 terms.
  - A test asserts that no profile reaches pilot-qualified or supported without a qualification-run reference.
- **Severity / likelihood.** Low / medium. **Bucket.** implementation_safeguard.

## What I checked and found no further material concern

- **Synthetic-evidence rule vs repo text.** The founder rule is consistent with, and stricter than, `roadmap.md:4395`, `delivery-contract.md:41` and P29 `founder-brief.txt:313`. There is no conflict to resolve beyond the labelling in q2a-02.
- **No fake gifts.** The decision's NOW set (people, households, relationships, custom fields) already excludes gifts, which r1 §3a shows is necessary. No change beyond stating it explicitly (q2a-06).
- **Q1 consistency.** Q2 answers the open point in Q1 A14 ("whether real exports may be held before a customer agreement and Phase 29 custody exist") with "no". That is consistent.
- **External-practice conflicts.** No imported practice conflicts with a governing repo rule. The vendor "send us a sample file" norm is post-contract, which matches LATER. Vendor-side processing of uploads (for example Flatfile-style hosted importers) would conflict with C17 and F6, so q2a-15(a) is deliberately local-only.
- **Founder's understanding request.** r1 §0-§2 (what arrives: user-shaped grid and report CSVs, not tables; per-installation columns; no Historic Giving, payment-method or user export) and §6 (comparables) answer it. The recorded decision should link r1 §0 as the plain-language summary.

## Sources (web, accessed 2026-11-01)

- [Neon One onboarding guide](https://neonone.com/?p=66888): fetched; vendor marketing.
- [Bloomerang getting started](https://get.bloomerang.co/experience/getting-started/), [DonorSnap onboarding](https://donorsnap.com/onboarding/), [Mission CRM data diagnostic](https://appsource.microsoft.com/lv-lv/marketplace/consulting-services/missioncrmltd.mcrm_data?page=12), [Virtuous CRM Conversion Playbook](https://virtuous.org/resource/crm-conversion-playbook/): search snippets only.
- [CSVBox private mode](https://blog.csvbox.io/private-mode-secure-spreadsheet-uploads/), [Dromo alternatives post](https://dromo.io/blog/best-flatfile-alternatives-competitors-2026): search snippets; vendor marketing, unverified.
