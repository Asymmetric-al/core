# Q19 adversarial review: Data Tools as the home, with Import shortcuts

**Decision under review:** Option B as asked (`q19-decision-as-asked.md`). Data Tools is the home for the Switch, People imports and Gift files, with "Import people" and "Upload a Gift file" shortcuts where staff already work.

**Evidence:**

- `research/q19-r1-repo-data-tools.md` (repo, first pass)
- `q19-r2-external-data-tools.md` (placement across 20 products)
- `q19-r3-repo-verification.md` (verification, UI-system feasibility, binding UX rules, 18 new discrepancies)
- `q19-r4-external-import-journey.md` (screen-by-screen journeys, the 2026 importer bar, failure modes)
- `q19-r5-external-ia-jobs-a11y.md` (IA, permission-aware UI, long jobs, WCAG 2.2, mobile, time, notifications)

**Labels:**

| Label   | Meaning                                      |
| ------- | -------------------------------------------- |
| **[R]** | Repository fact, with citation               |
| **[E]** | External fact, with citation in r2, r4 or r5 |
| **[I]** | Inference                                    |
| **[J]** | Product judgment                             |
| **[A]** | Assumption, with what would verify it        |

**Scope boundary:** permissions are Q20. That covers who sees the entry, source values, downloads, others' drafts and restricted match candidates, and who may start a Switch. This review fixes only that the area must be permission-aware, and how a person who cannot act is shown it.

## 0. Summary

**B is right** [J].

- **The market agrees.** Products start an import from the record list and keep one central history (HubSpot, Intercom, Attio, Givebutter) [E r2]. Bloomerang's hub is literally "Data Tools" [E r5].
- **The roadmap and Q5 already name the area** (RM:4335; DL:205) [R].
- **The reversal deadlines and the multi-week Switch need one findable home** (Q18) [R].

**But B as worded was a sketch, with 14 gaps that would ship a confusing or broken journey.**

- **It depended on things that don't exist** [R r3]:
  - **Notifications:** there is no in-app notification channel. The header bell is a hard-coded demo.
  - **Tasks Hub:** the projection machinery is unbuilt.
  - **Uploads:** the upload path caps at 5 MB and accepts only images, against a 2 GB profile.
  - **Spreadsheets:** there is no XLSX reader or writer.
  - **Grid:** there is no editable grid with validation.
  - **Testing:** there is no authenticated accessibility harness for admin.
- **It would inherit today's navigation debt:**
  - four menu lists, two of them dead;
  - an ungated sidebar;
  - a role-name-filtered Cmd-K list;
  - a collapsed-group bug (#1979) if Data Tools has sidebar children.
- **The shortcut screens already carry dead buttons** (CRM "New Record", Contributions "Add Contribution" under copy that mentions importing).
- **It used an unratified word.** "Saved mappings" should be the glossary's Remembered mapping.
- **It left the journey undefined:**
  - the steps;
  - the status vocabulary;
  - block-or-skip for problem rows;
  - fix-in-Asym or fix-in-file;
  - progress honesty;
  - draft lifetime;
  - concurrency;
  - phones and reflow;
  - time zones;
  - the Eve assistant panel.

**Disposition: accept with required amendments** (§2). The corrected decision is in §3.

## 1. Category review

Each concern uses this table layout: what could go wrong and why it matters; severity and likelihood; evidence; effect on the answer; fix and spec language.

### 1.1 Problem validity, necessity and alternatives: material concern, yes (narrows)

**The need is real** [R]:

- Q12 created two everyday import kinds.
- Q18 put a 30-day deadline on every import.
- Q1 to Q17 define a Switch with dozens of ratified steps.
- Nothing in Mission Control holds them (r1 §3).

**Strongest alternative:** C, owner screens only. It loses one history, one place for reversal deadlines and one home for the Switch. A, hub only, makes staff leave the screen they're in. NN/g permits a repeated entry point when different user groups start in different places [E r5 §1.5]. **B holds.**

| Concern                                                                                                                                                                                   | Severity · likelihood | Evidence                                           | Effect  | Fix / spec language                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Imports already placed elsewhere could be pulled in or duplicated.** CMS content, the missionary self-import, Field Account opening and church remittances already have ratified homes. | High · medium         | P23 D29; P28 D17; P21 D27; P14 (r1 §2.3)           | Narrows | "Data Tools holds the Switch, People imports and Gift files. Imports placed by their owners stay there and are not listed in Data Tools in v1." |
| **The Imports list could be mistaken for record history.** Q13 cl.10 says there is no separate Phase 30 history screen.                                                                   | Medium · medium       | DL:710-713; r3 §6                                  | Narrows | "The Imports list lists imports. What happened to a record is shown on that record."                                                            |
| **Implementation detail frozen too early.** Route paths, polling intervals and component choices don't belong in the decision.                                                            | Low · high            | [J]                                                | Narrows | Decide behaviour and words. Route paths and intervals go in the spec.                                                                           |
| **"Who's doing what" invents a per-task assignment feature** that no owner defines.                                                                                                       | Medium · medium       | r4 §5: no product shows per-task owners in-app [E] | Changes | "Each Switch task shows who last updated it and when. There is no assignment feature."                                                          |

### 1.2 Brittleness: material concern, yes

| Concern                                                                                                                                                          | Severity · likelihood | Evidence                                                                 | Effect  | Fix / spec language                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Return path depends on notifications that don't exist.** "You can leave" is hollow if nothing brings the person back. The bell is a demo; Phase 17 is unbuilt. | High · high           | `dropdown-notification.tsx:55-100`; ADR-0183:609-613; ADR-0027 (r3 §3.2) | Changes | "The Imports list, with a Needs attention filter, is the guaranteed way back. Notices and Tasks Hub items come through their owners (O96, O97), never ad hoc." |
| **Sidebar children inherit #1979** (collapsed group hides children; mobile close bug).                                                                           | Medium · high         | #1979; `mc-shell.tsx:153-205`                                            | Changes | "One sidebar entry with URL tabs inside; no sidebar children."                                                                                                 |
| **A new entry is added to four lists with different gating**, so it drifts and becomes visible to the wrong people.                                              | High · high           | r1 §3.2; r3 Q19-D15                                                      | Changes | O98: one visibility decision for the sidebar and Cmd-K; dead lists removed.                                                                                    |
| **Uploads break above 5 MB.** The only path is image-only and capped.                                                                                            | Blocker · certain     | `upload/image.ts:12-23` (r3 Q19-D18)                                     | Changes | O99: resumable upload to the Size profile through the File safety check.                                                                                       |
| **Spreadsheets can't be read or written.** XLSX is the preferred template, and Waiting-row downloads are spreadsheets.                                           | Blocker · certain     | r3 Q19-D17                                                               | Changes | "An XLSX reader and writer running inside Asym (Q11 cl.5) before XLSX templates or downloads ship."                                                            |
| **A plan built yesterday is confirmed today**, so the counts mislead.                                                                                            | Medium · medium       | Q12 cl.4 re-checks at write; Terraform staleness [E r4]                  | Changes | "A plan older than 24 hours, or whose file changed, is rebuilt before Confirm, and the page says what changed."                                                |
| **Excel round-trips** strip leading zeros, cut long numbers to 15 digits and reformat dates, creating new problems.                                              | Medium · high         | r4 §8 [E]; Q3 cl.4 [R]                                                   | Changes | Fix problem cells inside Asym for everyday imports (§3 cl.4). Downloads are text-typed (Q15).                                                                  |

### 1.3 Technical debt: material concern, yes

| Concern                                                                                                            | Severity · likelihood | Evidence                                                              | Effect  | Fix / spec language                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------ | --------------------- | --------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A second editable grid could be built** for import fixes beside Phase 15's planned grid.                         | High · medium         | `DataGrid` validate/required declared but unused; P15 D3 (r3 Q19-D21) | Changes | "Data Tools uses Phase 15's accessible editable grid for fixing cells, and `DataTableResponsive` for every list. It never adds a third grid."                                    |
| **App-local stepper, drop zone or announcer** would fork `packages/ui`.                                            | Medium · high         | `packages/ui/AGENTS.md:29-41`; r3 §2.2                                | Changes | "Stepper, file input with drop zone, live-region announcer and task-list composition are added to `packages/ui` (adapted from ReUI where it fits), never app-local."             |
| **Copying the contribution bulk batch pattern**, where the browser drives continuation and results are toast-only. | High · medium         | `batch-continuation.ts:121-184`; ADR-0183:597-606                     | Changes | "Imports run server-side. Reuse the run model of `/workflows` (ledger, durable function, safe error codes) and the server chunk and claim infrastructure, not the browser loop." |
| **Rows inserted into today's `mission_control_tasks`** as a shortcut for the Tasks Hub.                            | Medium · medium       | ADR-0183 calls it a migration input                                   | Changes | "No import rows in the legacy task table. Tasks Hub items come only through a registered Source work projection."                                                                |
| **Status words invented per screen.**                                                                              | Medium · high         | r3 §6; P23 D29 cl.28                                                  | Changes | One status vocabulary (§3 cl.7), mapped to the D29 terminal model.                                                                                                               |

### 1.4 Edge cases: material concern, yes

The 36 cases are in §5 (E1–E36). The ones that changed the answer:

| Concern                                                                                               | Severity · likelihood | Effect  | Fix                                                                                                                           |
| ----------------------------------------------------------------------------------------------------- | --------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Two staff edit the same draft                                                                         | High · medium         | Changes | Plan revision check: "Maria changed this at 10:42. Reload to see her changes." No presence system.                            |
| A second heavy job is started while one runs (Q15 profile)                                            | Medium · high         | Changes | "Waiting to start, after {name}'s {import} (started {time})". It starts automatically and re-checks at start.                 |
| Everyday imports are started during the Switch pause (Q12)                                            | Medium · high         | Changes | Start actions say "Paused during the Switch, from {Boundary} until go-live".                                                  |
| Abandoned drafts hold personal data with no Retention class (Q15 says nothing unclassified is stored) | High · high           | Changes | "A draft unchanged for 14 days is discarded with its file. The date shows 7 days ahead." This amends the Q15 Retention class. |
| Very large reviews (20 M rows in a Switch)                                                            | High · medium         | Changes | Review shows group counts first. Groups page on the server. "Checking file" is a background state.                            |
| Multi-sheet files, a header not on row 1, totals rows                                                 | Medium · high         | Changes | Sheet picker, header-row confirmation (Q11), and a "Looks like a totals row" problem.                                         |

### 1.5 Footguns: material concern, yes

| Concern                                                                                         | Severity · likelihood | Evidence                                                                  | Effect  | Fix / spec language                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **"Accept all matches"** merges the wrong people's data.                                        | High · medium         | No vendor documents a global accept [E r4 §3.3]                           | Changes | "Bulk decisions only within one reason group (for example 'Add all 7 as new people'). No global accept."                                                               |
| **Replace switched on in the mapping step** goes unnoticed.                                     | High · medium         | Mailchimp and Shopify blank-overwrite [E r4 §8]                           | Changes | "Write mode is chosen on the Review step, per column, with 'N existing values will change'. With Replace on, the final button is warning-styled and states the count." |
| **Double-submit** makes two imports.                                                            | High · low            | GOV.UK [E]                                                                | Changes | "Confirm is idempotent per plan revision; a second press shows the running import."                                                                                    |
| **Dead or disabled buttons with no reason** on the People and Contributions screens.            | Medium · high         | `crm/page-client.tsx:450-452`; `main-body.tsx:705-722`; Phase 12 story 19 | Changes | "A shortcut appears only where the flow works for that person. The existing dead buttons on those screens are removed or wired first."                                 |
| **The Gift file confirm sounds like money is posted.**                                          | High · medium         | Q12 cl.7; Q18 cl.11                                                       | Changes | "Create 3 draft gift batches: 214 gifts, $18,440.00. Nothing is posted and no receipts are sent until someone posts these batches in Contributions."                   |
| **Pasting source values into the Eve panel** on mapping pages contradicts Q11's no-AI importer. | Medium · medium       | `mc-shell.tsx:463`; DL:550-553 (r3 Q19-D16)                               | Changes | "The Eve panel is not shown on Data Tools pages in v1." Revisit with Q11's trigger.                                                                                    |

### 1.6 Tenant safety: material concern, yes

| Concern                                                                | Severity · likelihood | Evidence                             | Effect    | Fix / spec language                                                                                  |
| ---------------------------------------------------------------------- | --------------------- | ------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------- |
| **Guessable import URLs across ministries.**                           | High · low            | GitHub returns not found [E r5 §2.2] | Changes   | "An import from another ministry, or an unknown ID, returns not found and never confirms it exists." |
| **Remembered mappings or the header list leaking** between ministries. | High · low            | Q11 cl.2 [R]                         | No change | Remembered mappings tab lists only this tenant's mappings.                                           |
| **The heavy-job lock across tenants.**                                 | Medium · low          | Q15 [R]                              | No change | Lock key = tenant. Another ministry's job is never named or counted.                                 |
| **Polling, caching or streaming leaking state.**                       | High · low            | `frontend.md:117-122` [R]            | Changes   | "Per-tenant status is streamed, never cached; every read is scoped by the server-derived tenant."    |

### 1.7 Database, RLS and authorization safety: material concern, yes

| Concern                                                                             | Severity · likelihood | Evidence                                                     | Effect  | Fix / spec language                                                                                                                                        |
| ----------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status set from the client**, so a run is marked Done or a stopped run restarted. | High · medium         | [I]                                                          | Changes | "Import status changes only through server commands, forward-only, with terminal states immutable; tenant, actor and timestamps come from server context." |
| **Lost updates on a shared draft.**                                                 | Medium · medium       | [I]                                                          | Changes | "Every plan change carries the plan revision; a stale revision is refused."                                                                                |
| **Client grants on staging tables.** Staging holds raw values.                      | High · medium         | Phase 3: separate projections (`phase-03:614-616`); ADR-0212 | Changes | "No client grants on import, staging or plan tables. Pages read through `packages/api` projections." Who sees values is Q20.                               |
| **Cell fixes overwrite the held file or lose provenance.**                          | High · medium         | Q15 digests [R]                                              | Changes | "A fixed cell is stored as a plan edit (row, column, old value, new value, who, when). The held file never changes."                                       |
| **The duplicate table can't link back to its import, and staff can write to it.**   | Medium · high         | `crm_merge_candidates` (r3 Q19-D20); O6/O7                   | Changes | O95 (Phase 4): import-filed candidates carry their import's ID, through Phase 4's command only.                                                            |

### 1.8 Overengineering: material concern, yes (resolved)

| Refused                                                    | Why                                                                                     |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Card hub home page                                         | Fewer than five destinations; URL tabs suffice [E r5 §1.3]                              |
| Per-task assignment, due dates and reminders on the Switch | No owner defines them; "last updated by" is enough; the Tasks Hub is the work queue     |
| Realtime push or presence                                  | Realtime is disabled pending RLS proof; polling is precedent; Phase 15 cut presence [R] |
| Time estimates (ETA)                                       | Phase 23 D29 forbids fabricated time promises [R]; counts are truthful                  |
| A Data Tools notification sender or task table             | Phase 17 and ADR-0183 own them                                                          |
| A generic "data operations" framework for future kinds     | Two kinds in v1; a third earns its own decision                                         |
| A dashboard of import analytics                            | The monitors (§4) cover it                                                              |
| Global "accept all", a confidence score, or AI suggestions | Footgun; false precision (Phase 4 G1); Q11                                              |
| A list of owner-placed imports inside Data Tools           | Duplicates owners' screens; revisit only if staff can't find them                       |

### 1.9 UX/UI and user friction: material concern, yes

| Concern                                                                                                               | Severity · likelihood | Evidence                                                           | Effect  | Fix                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------- |
| **Too many steps.** Embedded importers use 4–6 [E r4]. A separate "fix problems" step adds a screen.                  | Medium · high         | r4 §10.11                                                          | Changes | People: File → Columns → Values (only if needed) → Review and import. Problems and decisions live on Review.         |
| **The confirm doesn't say what will happen.**                                                                         | High · medium         | Planning Center "Import [n] donations" [E]; Q18                    | Changes | The button names the result with counts.                                                                             |
| **Counts that don't add up** destroy trust.                                                                           | High · medium         | D29 cl.18 "every source item receives an explicit disposition" [R] | Changes | The Review header is a row equation that sums to the file's rows.                                                    |
| **"Completed" shown green while rows were left out.**                                                                 | High · high           | D29 cl.18 forbids it [R]                                           | Changes | "Needs attention" whenever anything is left out, waiting or needs review.                                            |
| **Toast-only completion.**                                                                                            | Medium · high         | Primer; WCAG 2.2.1 and 4.1.3 [E r5]                                | Changes | A lasting banner on the import page; toasts only for low-priority confirmations.                                     |
| **Jargon.** "Map", "dedupe", "upsert", "batch", "run".                                                                | Medium · high         | r4 §6; r3 §6                                                       | Changes | Plain labels (§3 cl.11).                                                                                             |
| **Mobile.** r5 suggests desktop-only, but WCAG 1.4.10 requires reflow to 320 CSS px (400% zoom), and D29 requires it. | Medium · medium       | [E][R]                                                             | Changes | Every step works at 320 CSS px; review tables may scroll sideways. Phones get a hint, not a block.                   |
| **Times.** Relative-only or the viewer's zone confuses audits and deadlines.                                          | Medium · medium       | GitLab absolute for audit [E]; Q18 ministry zone [R]               | Changes | Absolute date and time in the ministry's time zone, named, with relative wording beside it as visible text.          |
| **Small-ministry capacity.** 40% of charities cite staff skills as a barrier (UK 2025) [E r4 §7.6].                   | —                     | [E]; [A]: US ministries similar; verify in design-partner sessions | Changes | Plain promises on the first screen. Every problem shows one next action (the repo's `{ reason, nextStep }` pattern). |

**Conflicts resolved explicitly:**

1. **Progress estimate (NN/g) vs Phase 23 D29 "no fabricated time promises".** Repo wins. Show exact counts and phase names; no ETA.
2. **Hide vs disable vs explain (Carbon, Cloudscape, Atlassian, Primer).** Q20 decides who. The pattern is fixed now: an entry is absent for people with no Data Tools capability. Where someone can see but not act, the reason is written in text, never in a tooltip (Phase 12 story 19).
3. **Clickable step indicator (Atlassian) vs non-interactive (USWDS, Carbon).** Visited steps are links. Staff revisit mapping often; changing a step rebuilds Review with a notice.
4. **In-grid fixes (embedded importers, OC:356-363) vs fix in the source (Q10 cl.9, Switch reconciliation).**
   - Everyday imports: fix in Asym, recorded.
   - Switch: fix at the source, because the source export is the reconciliation record.
5. **Block vs skip problem rows.**
   - Everyday imports: rows may be left out deliberately, counted and downloadable.
   - Switch: sign-off needs zero Waiting rows (Q15, ratified).
6. **Gift file control totals: optional (r4) vs required (Q12 cl.7).** Required; Q12 is ratified.
7. **Creating fields from mapping (HubSpot) vs Q16 cl.11.** Switch only. Everyday imports use existing fields.
8. **"Desktop-only heavy work" (r5) vs WCAG reflow.** Reflow wins (above).

### 1.10 Source of truth, ownership and domain invariants: material concern, yes

**Owners:**

| Fact                                                      | Owner    |
| --------------------------------------------------------- | -------- |
| Import record, plan, staging, status, Remembered mappings | Phase 30 |
| People records and their history                          | Phase 9  |
| Gift batches and their posting                            | Phase 15 |
| Duplicate pairs after commit                              | Phase 4  |
| Notices                                                   | Phase 17 |
| Tasks Hub items (projections only)                        | ADR-0183 |
| Who may do what                                           | Phase 12 |
| Upload bytes and their custody                            | Phase 29 |
| Data quality later, as a tab                              | Phase 40 |

The Imports list and the Switch task list are **read models**. The Switch task statuses are derived from the Switch's recorded state, never stored separately.

**Invariants:**

| #   | Invariant                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------- |
| I1  | Every row in the file has exactly one outcome; outcome counts sum to the row count.                                       |
| I2  | Status changes only forward through server commands; terminal states never change (a reversal is a separate record, Q18). |
| I3  | At most one heavy job per ministry runs at a time.                                                                        |
| I4  | A plan edit never changes the held file.                                                                                  |
| I5  | No import writes anything until Confirm, and Cancel before writes leaves nothing.                                         |
| I6  | The Switch task list shows only what the Switch's recorded state supports.                                                |
| I7  | A Gift file never posts money.                                                                                            |

| Concern                                                  | Severity · likelihood | Effect  | Fix                                                                                                 |
| -------------------------------------------------------- | --------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| A stored Switch "task status" table becomes shadow state | Medium · medium       | Changes | "Derived, never stored" (I6).                                                                       |
| Gift batch and import disagree on counts                 | Medium · medium       | Changes | The Gift file page shows what it handed over; the batch is the authority after handover (Q12 cl.7). |

### 1.11 Hidden coupling: material concern, yes

| Dependency                                                          | Effect if missing                                           | Requirement                  |
| ------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------- |
| Phase 9 list action slot and an "added or changed by import" filter | No shortcut; no "View these people"                         | O93                          |
| Phase 15 new-batch entry, links back, shared editable grid          | No Gift file shortcut; second grid                          | O94                          |
| Phase 4 import-filed candidate with origin                          | Duplicates can't link back                                  | O95                          |
| Phase 17 staff notices                                              | No push return path; Switch-lead notices (Q5) undeliverable | O96, before the first Switch |
| ADR-0183 projection                                                 | No Tasks Hub item                                           | O97                          |
| Phase 12 and the shell: one visibility decision                     | Wrong people see the entry                                  | O98                          |
| Phase 29 resumable upload                                           | Uploads over 5 MB impossible                                | O99                          |
| Phase 40 joins as a tab                                             | Renaming or splitting later                                 | O100                         |
| Test infrastructure: authenticated admin accessibility checks       | No proof                                                    | O101                         |

### 1.12 Failure modes: material concern, yes

| Failure                                              | Safe?                            | Visible to                    | Recovery                                                                                                       |
| ---------------------------------------------------- | -------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Network drops during upload                          | Yes: it pauses                   | The uploader                  | Resumes; unfinished uploads are deleted after 24 h (Q15)                                                       |
| Browser closed during import                         | Yes: server-side                 | Imports list                  | None needed                                                                                                    |
| Worker crash mid-import                              | Yes: claims and idempotency keys | Import page shows "Importing" | Resumes automatically; repeated failure → Needs attention with a safe code, Asym alerted (Phase 8 signal, O11) |
| Outcome unknown after a write (lost acknowledgement) | Yes: verifier                    | "Checking results"            | D29 verifying state, then Needs attention                                                                      |
| Plan build fails (malformed file)                    | Yes: no writes                   | File step                     | Plain reason and next step                                                                                     |
| Page render error                                    | Yes                              | Segment error boundary        | "This page couldn't load. Your import is safe." Link to the list                                               |
| Kill switch during import                            | Stops after the current batch    | Needs attention               | Resume when re-enabled, or Prepare reversal                                                                    |
| Notice channel down                                  | Yes                              | Imports list remains          | —                                                                                                              |

### 1.13 Lifecycle, temporal correctness, concurrency and idempotency: material concern, yes

**States:** Draft → Checking file → Ready to review → (Waiting to start) → Importing → {Done | Needs attention | Stopped | Failed}; Draft → Discarded.

**Stopping:** "Stopping" is transient.

**Forbidden transitions:**

- any terminal state → Importing;
- Done → Needs attention, except through a reversal record;
- Discarded → anything.

**Retry and resume:** retry reuses the same plan and idempotency records and never starts a competing import (D29 cl.28).

**Idempotency:**

- Confirm per plan revision.
- Row writes per source ID and plan (Q12; Exact repeat import).
- Gift rows per payout key (Q12).

**Races:**

- Two editors on one draft: revision check.
- Two Confirms: the heavy-job lock plus the Waiting to start state.
- A plan rebuilt during Confirm: Confirm carries the revision.
- A Switch Boundary set while an everyday import waits: the waiting import is held, with a reason.

**Time:**

- All times are stored in UTC and shown in the ministry's named zone; daylight-saving changes are handled by the zone ("Eastern Time").
- The draft clock runs from the last change.

### 1.14 Data integrity risks: material concern, yes

| Risk                                                  | Fix                                                                                          |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Duplicates from repeat files                          | Source IDs and payout keys; Review shows "No change: 2,412" or "Already imported: 214 gifts" |
| Wrong column overwrite                                | Fill empty only by default; Replace on Review with a count; conflicts kept (Q12)             |
| Cell fixes without provenance                         | Recorded plan edits (§1.7)                                                                   |
| Counts drift between the list, the page and the batch | One count source, the import record; batches own theirs after handover                       |
| Partial writes                                        | Needs attention, with exact counts and Prepare reversal                                      |

### 1.15 Security and privacy risks: material concern, yes

| Concern                                                   | Severity · likelihood | Fix                                                                                                                                        |
| --------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| File names and import names carry personal data into logs | Medium · high         | "Logs, traces and error reports carry import IDs only, never file names, import names or values" (Q15 IDs-only).                           |
| Downloads                                                 | High · medium         | Generated on demand, never stored (Q15); who may download is Q20.                                                                          |
| Values shown to people without clearance                  | High · medium         | Every screen has a values-hidden state ("Values are hidden until a cleared member narrows this file") rather than a broken page (Q5 cl.4). |
| Eve                                                       | Medium · medium       | Not shown on Data Tools (§1.5).                                                                                                            |
| Abandoned drafts                                          | Medium · high         | 14-day discard (§1.4).                                                                                                                     |

### 1.16 Scalability and performance: material concern, yes (requirement)

**Volumes** [R]:

- Imports list: tens to hundreds per ministry per year, server-paged.
- Review: up to 20 M rows per Switch (Size profile), so group counts come first and every group pages, filters and searches on the server (ADMIN-UX: never filter only the loaded page).

**Polling:** about one status read every few seconds per open page, paused when the tab is hidden. That is negligible load [I].

**Upload:** resumable, so a 2 GB file survives a dropped connection.

**Targets:**

| Case                                                          | Target                    |
| ------------------------------------------------------------- | ------------------------- |
| A 10,000-row People import (Checking file to Ready to review) | Under 60 s                |
| Each Review group page                                        | Loads in under 1 s at p95 |

These are spec targets [J]. Verify them in a production-shaped test.

### 1.17 Operational burden: material concern, yes (contained)

- Self-resuming jobs.
- Drafts discarded automatically.
- Failures carry safe codes and a Phase 8 signal.

There is no database repair path and no manual cleanup. Engineering is involved only on repeated failure (M-Q19-3).

### 1.18 Observability and auditability gaps: material concern, yes

| Need             | Requirement                                                                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business history | The import record keeps who did each step and when (upload, mapping confirmed, decisions, cell fixes, Confirm, Stop, Cancel), with counts and outcome codes but no row content in logs |
| Ops              | A run ledger with safe error codes (the `/workflows` model) and a Phase 8 catalog signal for stuck or failed imports (O11)                                                             |
| UX               | Funnel events per step, IDs only (M-Q19-1, M-Q19-2)                                                                                                                                    |
| Security         | Access and downloads audited per Phase 12 (Q20)                                                                                                                                        |

### 1.19 Dependency and integration risks: material concern, yes (contained)

- **External:** none (Q11). Open-source parsing libraries run inside Asym.
- **ReUI stepper:** adopt through the `reui.md` review into `packages/ui`.
- **Internal owners:** O93 to O101, ordered in §4.

### 1.20 Migration, rollout and upgrade risks: material concern, yes

- **No dead entry.** The Data Tools entry appears for a ministry only when at least one import kind is switched on for it.
- **Kill switch per kind:** it stops new starts; running imports stop after the current batch.
- **People import prerequisites** [R]:
  - O47 matching;
  - O87/O88 reversal;
  - O99 upload;
  - O93 shortcut and filter;
  - authenticated accessibility checks.
- **Gift file prerequisites:** Phase 15 batches and O94.
- **Navigation:** the O98 change ships before the entry.
- **Roll forward only.** Turning the area off hides entry points but keeps every import record readable.

### 1.21 Testability, traceability and proof: material concern, yes

- AC1–AC28 are in §6.
- Traceability:
  - **Glossary:** Data Tools, Imports list, Import page, Needs attention, import draft.
  - **ADR:** ADR-IM-019.
  - **Amendments:** Q15 Retention class, Q11 (Eve), and Q5's notice delivery depending on O96.
  - **Contradictions fixed:** "Saved mappings" → Remembered mappings; "batch" and "run" wording.

### 1.22 Other development hazards: material concern, yes

| Hazard                                                         | Fix                                                                                      |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| No owner for Mission Control navigation as a whole (r1 Q19-D3) | O98 names Phase 12 with the shell; the founder or governance assigns a shell owner (D75) |
| Admin accessibility spec runs on the donor URL                 | O101                                                                                     |
| No segment error boundaries                                    | Required for Data Tools (§3 cl.12)                                                       |
| Phase 15 PRD anchors TanStack v8; the repo is on v9            | Recorded (D80)                                                                           |

## 2. Disposition

**Accept with required amendments.**

B stands: one Data Tools entry, shortcuts where staff work, one list, one page per import, and the Switch as a task list. The amendments make it buildable, honest and accessible:

- one sidebar entry with tabs inside;
- a defined three- or four-step journey with a row equation;
- one status vocabulary with no green-with-problems;
- truthful progress;
- a guaranteed return path without pretending notifications exist;
- fix-in-Asym for everyday imports only;
- a draft lifetime;
- concurrency rules;
- reflow to 320 px;
- named-zone times;
- Eve off;
- navigation and shortcut cleanup first;
- nine owner requirements.

## 3. Corrected decision (to record)

**Q19: Data Tools as the home, with Import shortcuts. Option B, amended.** (★ = changed or added.)

1. **One area, one entry.**
   - "Data Tools" is one sidebar entry in the System group, next to Admin.
   - ★ It has no sidebar children. Inside are tabs, each with its own address: **Imports**, **Switch** and **Remembered mappings**.
   - ★ Later owners add tabs without renaming (Phase 40's data quality).
   - ★ **Not listed here:** imports owners have placed elsewhere (Web Studio content, the missionary self-import, Field Account opening, church remittances).
2. **Shortcuts open the same flow.**
   - **Where:** "Import people" on the People list and "Upload a Gift file" in Contributions.
   - **What they open:** the new import in Data Tools with the kind already chosen, Data Tools breadcrumbs and a link back.
   - **When done:** the page offers "View these people" (the People list filtered to this import) or the draft gift batches it created, each linking back.
   - ★ **No dead buttons:** a shortcut appears only where the flow works for that person (Q20 decides who). There is never a dead button, or a disabled one without a written reason. The dead buttons on those screens today are removed or wired first.
3. ★ **The Imports list.**
   - **What it lists:** every People import, Gift file and Switch run, newest first. Practice runs stay on the Switch tab.
   - **Columns:**
     - name (defaults to the file name; can be renamed);
     - kind;
     - status;
     - started by;
     - when (absolute date and time in the ministry's time zone, named);
     - rows;
     - outcome counts;
     - reversal deadline.
   - **Filters:** Needs attention, kind, status, person and date.
   - **Behaviour:** paged on the server. It is the guaranteed way back to any import.
   - **Not record history:** what happened to a record shows on that record (Q13).
4. ★ **One page per import, in three or four steps,** saved after every change. It survives a closed browser, an expired session or another device.
   - **Steps:**
     - **People import:** File → Columns → Values (only when a code column exists) → Review and import.
     - **Gift file:** File and totals (expected count and total required, Q12) → Columns → Funds and values → Review and import.
     - **Navigation:** visited steps can be reopened. Changing one rebuilds Review and says so.
   - **File step:**
     - "Choose file" plus a drop zone, with accepted types and limits stated first.
     - After upload, it shows what was found: rows, columns, sheet and encoding.
     - A sheet picker, and confirmation of the header row (Q11).
     - Only the upload needs the page open; it resumes after a dropped connection.
   - **Columns step:**
     - For each column: the column, three examples, the Asym field, and how it was matched ("Remembered", "Same name", "Suggested — review required", "Chosen by you"). No scores.
     - Unmatched columns can be left out in bulk.
     - Required fields gate Continue.
     - Dates get a format with a live example; phones get a default country.
     - Everyday imports use existing fields only. A Switch can create Field drafts (Q16).
   - **Values step:** the Value-mapping table (Q11).
   - **Review and import:**
     - **Counts that add up to the file's rows:**
       - Needs fixing;
       - Needs your decision;
       - New;
       - Will be filled in;
       - No change;
       - Changed in Asym since: kept;
       - Left out.
     - **Write mode** is chosen here, per column: Fill empty only by default, or Replace with "N existing values will change".
     - **Differences** read "Now / In your file / Result" in words.
     - **Decisions** show both sides with the reason. Bulk actions apply only within one reason group, and there is no "accept all".
     - **Fixing problems:**
       - Everyday imports: problem cells can be fixed in Asym, one cell or find-and-replace in a column, each recorded with who and the old value. Alternatively, the rows can be downloaded, fixed and uploaded again with decisions kept.
       - Switch: problems are fixed at the source (Q10 cl.9).
     - **Leaving rows out:**
       - Everyday imports may leave problem rows out deliberately; they are counted and downloadable.
       - A Switch signs off with zero Waiting rows (Q15).
   - **Confirm:**
     - The button names the result. For a People import: "Add 1,980 people and fill in 310 values". For a Gift file: "Create 3 draft gift batches: 214 gifts, $18,440.00", followed by "Nothing is posted and no receipts are sent until someone posts these batches in Contributions."
     - With Replace on, the button is warning-styled and states the count.
     - A second press shows the running import.
     - A plan older than 24 hours, or whose file changed, is rebuilt first, showing what changed.
5. ★ **Importing.**
   - **Leaving:** it runs in the background, and the page says "You can leave this page."
   - **Progress:** from real counts and named phases ("Saving 3,000 of 12,000 rows"), with no time estimates (Phase 23 D29).
   - **One heavy job per ministry:**
     - A later Confirm shows "Waiting to start, after {name}'s {import} (started {time})".
     - It starts on its own and re-checks at start.
   - **Stopping:**
     - Before writes: "Cancel import" changes nothing.
     - After writes: "Stop after this batch" explains that saved rows stay, and that Prepare reversal is the way back.
   - **Announcements:** milestones are announced politely to screen readers.
   - **Banner:** finishing or failing shows a lasting banner on the page, never only a pop-up.
6. ★ **Results** on the same page.
   - **Status and counts:** every row has one outcome (I1).
   - **Downloads:** rows left out or waiting, generated on demand as text-typed spreadsheets (Q15).
   - **Links:**
     - the people or gift batches;
     - possible duplicates sent to Phase 4;
     - "You can reverse this import until {date, time, zone}" with Prepare reversal (Q18).
7. ★ **One status vocabulary.**
   - **Display:** colour plus an icon plus words.
   - **States:** Draft · Checking file · Ready to review · Waiting to start · Importing · Stopping · Done · Needs attention · Stopped · Failed · Discarded.
   - **Rules:**
     - "Done" only when nothing is left out, waiting or needing review; otherwise "Needs attention".
     - "Stopped" and "Failed" mean nothing changed; anything partly written is "Needs attention".
   - **Reversal** shows as a second label: Reversal prepared · Reversing · Reversed · Partly reversed.
   - **Mapping:** these map onto Phase 23 D29's terminal model.
8. ★ **The Switch tab is a task list,** generated from the Switch's recorded state (Q1–Q18), never stored separately.
   - **Groups:** Get ready · Prepare and practise · Decide · Switch day · After go-live · Close.
   - **Each task shows:**
     - status: Not started · In progress · Needs attention · Done · Cannot start yet (with its reason);
     - one line saying what it is;
     - its link;
     - "Last updated by {name}, {date}".
   - **No assignments.**
   - **Practice runs** are listed here.
   - **Landing:** Data Tools opens on the Switch until go-live. After that it opens on Imports, with a Switch banner while Switch tasks need attention.
   - **After Switch closed:** the tab is a read-only record.
   - **Switch pause:** between the Switch Boundary and go-live, everyday import start actions say "Paused during the Switch, from {Boundary} until go-live."
9. **The Remembered mappings tab** lists each source's remembered mappings, with when and by whom each was last used. They can be renamed or deleted (Q11).
10. ★ **Getting people back.**
    - **Guaranteed:** the Imports list.
    - **Tasks Hub:** imports needing a person appear there through a registered Source work projection (ADR-0183).
    - **Notices:** "Finished" and "Needs attention" notices come through Phase 17's staff notifications. There is one actionable copy and no duplicate alerts.
    - **Never ad hoc:** no rows in today's task table and no separate email sender.
    - **Before the first Switch:** Phase 17 notices must exist, so the Switch lead's notices (Q5) can be delivered.
11. ★ **Words.**
    - **Area and tabs:** Data Tools, Imports, Switch, Remembered mappings.
    - **Import terms:** People import, Gift file, Practice run, Waiting row, Prepare reversal.
    - **"Gift batch"** is used only for Phase 15's batches.
    - **Never:** a bare "run" or "batch", "error" as a status, "map", "dedupe" or "upsert" in the interface.
    - **Copy:** plain, in GOV.UK style. Every problem says what happened and one next step.
12. ★ **Built to the repo's standards.**
    - **Design system:** exact `base-maia`.
    - **Shared components:** a stepper, a file input with drop zone and resumable transfer, a live-region announcer and a task-list composition, all added to `packages/ui`.
    - **Grids:** Phase 15's accessible editable grid for fixes; `DataTableResponsive` for lists. No other grid.
    - **Pages:**
      - `PageShell`;
      - a segment error boundary that keeps the import's identity;
      - per-tenant status streamed, never cached;
      - polling while active, paused when the tab is hidden.
    - **Accessibility:** WCAG 2.2 AA, including:
      - reflow to 320 CSS px (review tables may scroll sideways);
      - 24 px targets;
      - no time limit that loses work;
      - authenticated accessibility checks and a keyboard-only end-to-end test.
    - **Logs:** import IDs only, never file names or values.
    - **Eve:** the Eve panel is not shown on Data Tools in v1 (Q11).
13. ★ **Navigation fixed once.**
    - **One decision:** the entry's visibility comes from one server-side capability decision, shared by the sidebar and Cmd-K, never role names.
    - **Cleanup:** the two dead menu lists are removed, and the tile catalog and Eve list are updated.
    - **No early entry:** the entry appears only when at least one import kind is switched on for that ministry.
    - **Per-kind switch:** each kind has its own kill switch.
14. ★ **Import drafts don't linger** (amends Q15's Retention class). A draft unchanged for 14 days is discarded with its file. The date shows on the draft and in the list 7 days ahead. No email is sent.

**Left for Q20:**

- who sees the entry, source values and downloads;
- who sees other people's drafts;
- how restricted match candidates appear;
- who may start a Switch.

## 4. Ruthless synthesis

### Before recording

- **Amendments:**
  - Q15 Retention class gains import drafts.
  - Q11 records that Eve is off on Data Tools.
  - Q5's notice delivery depends on O96.
- **Glossary:** Data Tools, Imports list, Import page, Import draft, Needs attention (as a Data Tools status).
- **Vocabulary:** "Saved mappings" → Remembered mappings.

### Spec and design

- The journey screens and copy (§3 cl.4–6).
- The status vocabulary and its mapping to D29 (cl.7).
- The Switch task catalogue, derived from Q1–Q18 state.
- Row-equation categories mapped to Q12's preview categories.
- AC1–AC28.

### Owner requirements, in order of work

| Order | Requirement | What                                        |
| ----- | ----------- | ------------------------------------------- |
| 1     | O98         | One visibility decision; dead lists removed |
| 2     | O99         | Resumable upload                            |
| 3     | O93         | People list action and filter               |
| 4     | O101        | Authenticated accessibility checks          |
| 5     | O94         | Gift file entry and shared grid             |
| 6     | O95         | Import-filed candidates                     |
| 7     | O97         | Tasks Hub projection                        |
| 8     | O96         | Phase 17 notices, before the first Switch   |
| 9     | O100        | Phase 40 tab                                |

O98, O99 and O101 gate any Data Tools release. O93 gates the People import. O94 gates the Gift file.

### Implementation safeguards

- Server-only status commands, forward-only.
- Plan revision on every change.
- Idempotent Confirm.
- Heavy-job lock by tenant.
- No client grants on import tables.
- IDs-only logs.
- Error boundary.
- Kill switch per kind.

### Monitors

| ID      | Signal                                                                   | Threshold                        | Owner                               | Response                                            |
| ------- | ------------------------------------------------------------------------ | -------------------------------- | ----------------------------------- | --------------------------------------------------- |
| M-Q19-1 | Share of started import drafts that reach Confirm, per kind, per quarter | < 60%                            | Phase 30 product owner              | Find the step with most drop-off; usability test it |
| M-Q19-2 | Median time from upload to Confirm for People imports under 5,000 rows   | > 15 min                         | Phase 30 product owner              | Review the Columns and Review steps                 |
| M-Q19-3 | Imports in Importing with no progress for 15 min                         | > 0                              | Engineering on-call                 | Resume; incident if repeated                        |
| M-Q19-4 | Data Tools route error-boundary hits                                     | > 0.5% of page views in a week   | Engineering                         | Fix the failing read                                |
| M-Q19-5 | Drafts discarded automatically                                           | > 30% of drafts in a quarter     | Phase 30 product owner              | Check where people abandon; check the 14-day window |
| M-Q19-6 | Support contacts about imports                                           | > 5 per 100 imports in a quarter | Phase 30 product owner with support | Fix the copy or step named most                     |
| M-Q19-7 | Imports that finish "Needs attention"                                    | Median share > 25%               | Phase 30 product owner              | Improve templates, matching or file checks          |

## 5. Edge cases

| #   | Case                                              | Outcome                                                                   |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------- |
| E1  | Same People file twice                            | Review shows "No change" for matched source IDs; nothing duplicates       |
| E2  | Same Gift file twice                              | "Already imported: 214 gifts"; payout keys refuse it (Q12)                |
| E3  | Two people start imports                          | The second shows Waiting to start, naming the first                       |
| E4  | Import started during the Switch pause            | Start actions say why and until when                                      |
| E5  | Workbook with several sheets                      | The sheet picker asks                                                     |
| E6  | Header on row 3; a totals row at the bottom       | Header confirmed; "Looks like a totals row" problem                       |
| E7  | IDs in scientific notation or lost zeros          | Refused with the fix (Q3)                                                 |
| E8  | Non-UTF-8 file with accented names                | Encoding detected and shown; confirm if uncertain                         |
| E9  | Two columns matched to one field                  | Blocked with a plain message                                              |
| E10 | Corrected file with renamed headers               | No remembered mapping applies; differences shown                          |
| E11 | Two editors on one draft                          | Revision check; reload notice                                             |
| E12 | Same person, two tabs                             | Same revision check                                                       |
| E13 | Session expires during review                     | Nothing lost; resumes after sign-in                                       |
| E14 | Browser closed during upload                      | Paused; resumes within 24 h, otherwise deleted (Q15)                      |
| E15 | Draft abandoned                                   | Discarded at 14 days; date shown at 7                                     |
| E16 | 500,000-row People import                         | Checking file runs in the background; groups paged on the server          |
| E17 | Worker crash mid-import                           | Resumes; repeated → Needs attention                                       |
| E18 | Kill switch during import                         | Stops after the current batch → Needs attention                           |
| E19 | Gift file total doesn't match expected            | Difference shown in words and amount; Phase 15 balancing decides          |
| E20 | Legacy-executor gift rows during the tail         | Refused with the reason (Q12)                                             |
| E21 | Gift file becomes several batches                 | All listed and linked                                                     |
| E22 | Replace on for one column                         | Count shown; warning button                                               |
| E23 | Field changed in Asym after the plan              | "Changed in Asym since: kept"                                             |
| E24 | Restricted match candidate                        | Q20                                                                       |
| E25 | Another ministry's import ID                      | Not found                                                                 |
| E26 | Person without the capability opens a link        | Permission page naming who can help (Q20 wording)                         |
| E27 | Phone or 400% zoom                                | Every step works at 320 CSS px; tables scroll sideways                    |
| E28 | Viewer in another time zone                       | Ministry zone named; daylight saving correct                              |
| E29 | Long or non-Latin file names                      | Truncated with the full name available; never logged                      |
| E30 | No imports yet                                    | Empty state explains what imports do and offers the start actions allowed |
| E31 | Unsupported type (.numbers, .xls)                 | Refused, listing accepted types                                           |
| E32 | Formulas in cells                                 | Read as text; downloads text-typed (Q15)                                  |
| E33 | Helper without clearance opens Review             | Values-hidden state, counts only (Q5)                                     |
| E34 | Switch closed                                     | Read-only tab; everyday imports continue                                  |
| E35 | Import needs attention inside its reversal window | The deadline is still shown                                               |
| E36 | Plan built yesterday                              | Rebuilt before Confirm, showing what changed                              |

## 6. Acceptance criteria

**Navigation and entry points**

- **AC1:** One Data Tools sidebar entry, with no children. Its visibility and Cmd-K's come from the same server decision. A person the decision excludes sees neither.
- **AC2:** Data Tools opens on Switch while a Switch is before go-live, otherwise on Imports. Each tab has its own address.
- **AC3:** "Import people" opens a People import with the kind chosen and Data Tools breadcrumbs. The back link restores the People list as it was.
- **AC4:** No shortcut renders where the flow is unavailable to that person. During the Switch pause, start actions state the reason and the dates.

**Drafts and files**

- **AC5:** A draft reopened on another device after closing the browser returns to the same step with every decision.
- **AC6:** A save against an old plan revision is refused with the other editor's name and time. No update is lost.
- **AC7:** Upload works keyboard-only through Choose file. Types and limits are shown before upload. A 1.5 GB CSV interrupted by network loss resumes without restarting.
- **AC8:** Header-row confirmation is required. A multi-sheet file asks which sheet.

**Mapping and review**

- **AC9:** Every column shows how it was matched, with no numeric score. An unmatched non-empty column blocks Continue until it is matched or left out.
- **AC10:** An everyday People import offers only existing fields. A Switch offers Field drafts.
- **AC11:** Review counts sum exactly to the file's data rows, tested with a file containing every category.
- **AC12:** Bulk match decisions exist only within one reason group. No global accept control exists.
- **AC13:** A fixed cell in an everyday import records the old value, new value, who and when, and the held file's digest is unchanged. Switch review has no cell editing.

**Confirm and importing**

- **AC14:** The Confirm button's counts equal what is committed. With Replace on, it is warning-styled and states the number of values that will change. A second press creates nothing.
- **AC15:** A plan older than 24 hours is rebuilt before Confirm and shows what changed.
- **AC16:** With another heavy job running, Confirm shows Waiting to start, naming it, and starts afterwards. Two never run at once.
- **AC17:** Progress shows processed and total from real counts, with no time estimate. A polite live region announces each phase change and the finish, at most once per phase.
- **AC18:** Closing the browser during Importing doesn't stop or slow the import.
- **AC19:** Cancel before writes leaves zero changes. Stop after writes keeps saved rows and offers Prepare reversal.

**Outcomes and Gift files**

- **AC20:** No completion or failure is shown only in a toast. A lasting banner stays on the page.
- **AC21:** No "Done" when any row is left out, waiting or needs review; those show "Needs attention".
- **AC22:** A Gift file requires an expected count and total before Review. Confirm creates draft batches only. Each batch and the Gift file link to each other.

**Time, accessibility and safety**

- **AC23:** Every time shows date, time and the named ministry zone.
- **AC24:** All Data Tools routes pass authenticated accessibility scans at 1280, 768 and 320 CSS px. The whole People import completes keyboard-only.
- **AC25:** Another ministry's import ID returns not found. A route error shows the import is safe, with a link back.
- **AC26:** A draft untouched for 14 days is discarded with its file, and the date shows 7 days ahead.
- **AC27:** The Eve panel is absent on Data Tools routes.
- **AC28:** Logs and traces for imports contain IDs only. A test file name containing a person's name never appears in them.

## 7. Owner requirements and discrepancies

**Owner requirements (proposed O93–O101):**

| #    | Requirement                                                                                                                                                                                                              | Owner                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| O93  | A People list page action for "Import people" (shown only where it works), and a People list filter "Added or changed by import {n}" from import provenance (`crm_record_links`)                                         | Phase 9                                                     |
| O94  | "Upload a Gift file" beside New batch in Contributions. Batches created from a Gift file link back to it. Phase 15's accessible editable grid (D3) is shared with Phase 30 for fixing cells                              | Phase 15                                                    |
| O95  | A Phase 4 command for import-filed duplicate candidates that carries the import's ID (sharpens O6 and O7), with one confidence vocabulary (High / Possible / Low) and reason chips                                       | Phase 4                                                     |
| O96  | Staff notices for Data Tools ("Finished", "Needs attention", Switch-lead notices) as Phase 17 producer bindings: in-app, with email only if unread, and no duplicate of a Tasks Hub item. Needed before the first Switch | Phase 17                                                    |
| O97  | A registered Source work projection for imports that need a person (decisions waiting, Needs attention)                                                                                                                  | Tasks Hub owner (ADR-0183)                                  |
| O98  | One server-side visibility decision for Mission Control entries, shared by the sidebar and Cmd-K, never role names; the two dead menu lists removed; tile catalog and Eve list updated                                   | Phase 12 with the Mission Control shell owner (to be named) |
| O99  | Resumable upload to the Size profile through the File safety check, with determinate progress and resume                                                                                                                 | Phase 29                                                    |
| O100 | Data quality joins Data Tools as a tab, without renaming the area or its tabs                                                                                                                                            | Phase 40                                                    |
| O101 | Authenticated accessibility checks for admin routes (axe at 1280, 768 and 320 CSS px), plus keyboard-only end-to-end tests                                                                                               | Test infrastructure owner                                   |

**Discrepancies (proposed D74–D82):**

| #   | Discrepancy                                                                                                                                                                                    | Resolution                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| D74 | Data Tools is claimed by Phases 30 and 40, and no one owns Mission Control navigation. The phase table says "Existing source-owned surfaces" (RM:91 vs :4335, :5260).                          | Phase 30 creates the area; Phase 40 adds a tab (O100); a shell owner is named (O98) |
| D75 | Four menu lists, two dead. The sidebar is ungated and Cmd-K is gated by role names, contrary to Phase 12. ADMIN-UX-STANDARDS:148 claims "permission-aware navigation".                         | O98                                                                                 |
| D76 | Dead actions on the shortcut screens: CRM "New Record"; Contributions "Add Contribution" under copy about importing; Contributions "Export"; events "Export CSV".                              | Removed or wired before shortcuts ship (Q19 cl.2)                                   |
| D77 | The notification bell and Activity panel are demos. No Tasks Hub projection code exists.                                                                                                       | O96, O97                                                                            |
| D78 | The upload path is 5 MB and images only, against a 2 GB Size profile. There is no XLSX reader or writer.                                                                                       | O99; XLSX library (Q19 cl.12)                                                       |
| D79 | Two duplicate tables with different confidence words. `crm_merge_candidates` has no origin column, keeps `twenty_*` columns and is staff-writable.                                             | O95 (with O6, O7)                                                                   |
| D80 | `DataGrid` validate/required are unimplemented. Phase 15 anchors TanStack v8; the repo is on v9.                                                                                               | O94; Phase 15 updates its anchor                                                    |
| D81 | There are no authenticated admin accessibility checks: the accessibility spec runs on the donor URL. There are no segment error boundaries.                                                    | O101; Q19 cl.12                                                                     |
| D82 | Owner texts assume Finance and top-level Settings menu groups that don't exist (P21 D27, P10, P11). "Saved mappings" was used instead of Remembered mapping. "Run" and "batch" are overloaded. | Shell owner (O98); Q19 cl.11                                                        |

## 8. Rejected alternatives

| Alternative                                          | Why rejected                                                            |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| A. Data Tools as the only way in                     | Makes staff leave the screen they're in                                 |
| C. Owner screens only                                | No single history; reversal deadlines scattered; no home for the Switch |
| Sidebar children for each tab                        | Inherit #1979; URL tabs are enough                                      |
| A card hub home page                                 | Fewer than five destinations; no design-system backing                  |
| Listing owner-placed imports in Data Tools           | Duplicates their owners' screens                                        |
| A separate "Fix problems" step                       | Extra screen; problems belong on Review                                 |
| A global "Accept all matches"                        | Merges the wrong people; no vendor documents it                         |
| Match confidence scores                              | False precision (Phase 4 G1); rules can't honestly score                |
| Creating fields in everyday imports                  | Q16 cl.11                                                               |
| Cell edits in a Switch                               | The source export is the reconciliation record (Q10 cl.9)               |
| Optional Gift file totals                            | Q12 cl.7 requires them                                                  |
| Time estimates                                       | Phase 23 D29 forbids fabricated time promises                           |
| Toast-only completion                                | WCAG 2.2.1 and 4.1.3; Primer                                            |
| Desktop-only screens                                 | WCAG reflow and the D29 precedent                                       |
| Per-task assignments and due dates on the Switch     | No owner; the Tasks Hub owns work                                       |
| Realtime push and presence                           | Realtime is disabled pending RLS proof; polling is enough               |
| An ad hoc email sender or rows in today's task table | Phase 17 and ADR-0183 own those                                         |
| Keeping drafts indefinitely                          | No Retention class; personal data in abandoned files                    |
| Showing the Eve panel on Data Tools                  | Q11's no-AI importer; source values could be pasted                     |
