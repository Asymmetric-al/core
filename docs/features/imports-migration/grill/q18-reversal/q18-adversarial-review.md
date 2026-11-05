# Q18 adversarial review: reversing an import

Founder answer (2026-11-03): **"B. Think of edge cases and way to handle it without creating needless complexity or over-engineering. Also research modern best pratices and apply how necessary."** The founder also asked for a full ruthless review. Decision as asked: `q18-decision-as-asked.md`.

**Evidence.**

- `research/q18-r1-repo-reversal.md`: owner reversal rules by family, downstream blockers, current code, issues, wording in use, retention.
- `research/q18-r2-external-reversal.md`: 23 vendors' import undo, UX wording and confirmation, ledger practice, migration practice, privacy.
- `research/q18-r3-repo-verification.md`: verified Q12 kinds, Phase 15 batch reverse, archive and merge, contact points, tags and lists, Phase 11 values, effect suppression, ADR-0173 clause 29, D17, retention, existing patterns, the word "reversal", OpenSpec. Corrects seven points in r1.
- `research/q18-r4-external-edge-cases.md`: stale plans, long-running jobs, concurrency, what "touched" means, list removal and opt-outs, archive versus delete, wrong-file imports, approval, deadlines, naming.

**Re-verified directly on 2026-11-03:**

- **ADR-0173 clause 29.** "**Prepare reversal** computes which still-private, unedited, unreleased, unreferenced results can move through D21's governed Trash or receive a private successor restoring a before-image … Reversal has separate capability, immutable plan, idempotency, receipts, audit, and truthful partial handling." There is no "needless two-person approval ritual" (`docs/adr/0173-…:282-290`, `:52-54`). The Phase 23 UX benchmark has "The action is **Prepare reversal**, never **Undo import**" and seven groups (`phase-23-d29-content-portability-ux-benchmark.md:759-776`).
- **Owner constraint.** "time-boxed batch undo with before-image capture only while no immutable downstream coverage exists … The undo-after-merge hazard … is explicitly blocked" (`owner-constraints.md:378-385`). The roadmap adds: "Show what can be safely undone, what needs a compensating source operation and what is irreversible … must not delete a real Party after merge, erase later staff edits or rewind financial history" (`roadmap.md:4371`).
- **Ratified Phase 30 text.**
  - **Q12 clause 8:** "a people import is reversible one import at a time … restored only if it still holds the imported value … archived only if nothing has touched them since … Posted money is never undone" (DL:611-617).
  - **Q15 clause 11:** "Everyday import undo … 30 days" (DL:840).
  - **Q5:** "No forced second person" and "Never Asym" (DL:195-196).
  - **Q12:** exactly two everyday kinds, People import and Gift file (DL:571-577).
- **Phase 28 D17.** "No batch undo … No run-undo route exists (static)" (#2084 approved spec, AC28-R24-03).

Research, not legal advice.

**Disposition: accept with required amendments.** B's shape stands: one honest page per import, three groups, a final button that names the result, and Asym itself reversing only People results and (through Phase 23) website drafts. As worded, B has nine defects:

1. **It reaches imports it must not touch.** "Every committed import" includes the missionary self-import, whose approved spec forbids batch undo. It also includes Practice copies and Switch runs before go-live.
2. **"Untouched" is undefined, and "still holds the imported value" fails a known case.** If someone sets a field to the same value the import wrote, a value comparison mistakes their edit for the import's.
3. **Tags, lists and contact details can't be checked as B says.** Tags are flat strings with no record of who added them. Lists carry consent weight, and no list entity exists yet. There is no "entered in error" way to end a contact detail or household link.
4. **A reversal's own writes can set off automations and messages.** Today's suppression rules cover import writes only.
5. **Gift files are not "a batch reversal" in one step.** One file can become several Phase 15 batches. Reversing a posted batch sends corrected or void receipts to donors, and it may wait for a second approver.
6. **The page can go stale, and nothing defines running, stopping, retrying, the window edges, legal hold or erasure.**
7. **A wrong file is a privacy incident.** Archiving doesn't erase anyone, so reversal alone doesn't fix it.
8. **"Reversal" already means a payment reversal** across our own text and the owners' glossaries. "Receipt issued" is also ambiguous next to ADR-0173's operation receipts.
9. **"Asym does it" contradicts Q5.** Asym never decides; a ministry member confirms.

The corrected text is in §3.

---

## 1. Category review

### 1.1 Problem validity, necessity and alternatives: material concern, yes (narrows the answer)

**The problem is real.** A wrong mapping or the wrong file is the most common data-quality incident in CRM imports. That's why vendors from Planning Center to HubSpot ship some form of undo (r2 §1). Q12 already ratified People reversal, and C23 requires "target-specific reversal and reconciliation procedures published before tenant use" (DL:1000). The open questions were the word and the scope (D3).

**Correct level.** Phase 30 owns the "reversal-workbench mechanics" (C5, DL:982): one page, one job, one record. Owners own eligibility and the change itself. Phase 30 never writes a target's tables or posts money (`owner-constraints.md:389-392`).

**Strongest alternative: C**, the owners' tools plus a filter for "everything import X did". For every family except People, B is exactly that filter, laid out in three groups. B adds one real action, for People, which Q12 already requires. So B costs little beyond C, and staff get one place to see everything an import did.

**Too vague or wrong in B:**

| Text in B                                 | Problem                                                                                                                               | Effect                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| "Every committed import and Switch run"   | Includes the D17 self-import (forbidden), Practice copies (discarded, Q6) and pre-go-live Switch runs (abort or re-run, Q1 clause 10) | Narrowed in clause 1                |
| "untouched since"                         | Never defined anywhere (r3 §1)                                                                                                        | Defined in clause 4                 |
| "still holds the imported value"          | Misses an edit that sets the same value (ABA)                                                                                         | Replaced by "not written since"     |
| "tags … come off only if untouched"       | Tags carry no per-tag author (r3 §4)                                                                                                  | Tags count as one field             |
| "Gift files … handed to … batch reversal" | A file can become several batches, a draft batch needs discarding not reversing, and the reverse can wait for approval (r3 §2)        | Clause 3 table                      |
| "receipt issued" as a reason              | Collides with ADR-0173's operation receipts, and People results never involve tax receipts                                            | Removed from People reasons         |
| "Asym does it"                            | Q5: Asym never decides (DL:196)                                                                                                       | "When the ministry member confirms" |
| "within 30 days" for Switch people        | No start event stated, and no Switch window ratified (r3 §10)                                                                         | From go-live                        |

**Not frozen:** table names, job framework and page layout. The spec states outcomes; design picks the means.

### 1.2 Brittleness: material concern, yes

| Fragile assumption                                    | What breaks                                                                                                                               | Severity / likelihood              | Fix (clause)                                                                                                                                                                             |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A value equal to the imported value means "unchanged" | A staff member re-types the same value, or a later import writes the same value, and the reversal overwrites their deliberate write (ABA) | Medium / likely in busy ministries | Check "not written since the import", not equality. Putting a value back also restores which write it came from, so reversing a newer import and then an older one still works (4; O87). |
| The review page stays true until confirm              | Staff keep working, and counts drift between prepare and confirm (r4 §1)                                                                  | Medium / certain                   | Every item is re-checked as it is changed. Drift is skipped and listed "Changed after you prepared this". The prepared page expires after 24 hours (5).                                  |
| Whole-plan staleness, Terraform-style                 | In a live CRM any write makes the plan stale, so it could never be confirmed                                                              | High / certain if adopted          | Rejected. Staleness is checked per item, not tenant-wide.                                                                                                                                |
| Tags can be removed one by one when untouched         | No per-tag author exists (`parties.tags` flat; `donors.tags TEXT[]`)                                                                      | Medium / certain                   | Tags count as one field (4)                                                                                                                                                              |
| Removing a list membership is harmless                | Q9 gives list membership consent weight. Removal through the unsubscribe path would record a person-only block (DL:388, :393).            | High / likely if built naively     | A record correction, never an unsubscribe. It never records or lifts a block (4; O87).                                                                                                   |
| An import has one Phase 15 batch                      | Phase 15's escape valve creates follow-on batches (P15:80)                                                                                | Medium / likely                    | List every resulting batch (3; O90)                                                                                                                                                      |
| The reversal runs while nothing else does             | Another import or a reversal touches the same people                                                                                      | Medium / occasional                | One People import or reversal per ministry at a time (6)                                                                                                                                 |
| Prior values exist for every import                   | If capture ships after imports, early imports can't be reversed                                                                           | High / likely in rollout           | Capture ships with People imports (synthesis)                                                                                                                                            |

### 1.3 Technical debt: material concern, yes

- **A generic undo engine** spanning every family would duplicate owner correction paths and contradict six owners (r1 §5). _Refused:_ the page routes; only Phase 9 and Phase 23 act.
- **Per-family copies of the page** (one for people, one for website content, one for gifts) would drift. _Refused:_ one page pattern. Owners supply the grouping and reasons (C5; O91).
- **Wording drift already exists.** "Import reversal" (IMCTX:228) sits beside "Everyday import undo" and "undo values" (DL:840; IMCTX:283; ADR-IM-015:9, :41, :58). _Fixed_ at ratification (D68).
- **Current code holds placeholders that must not be mistaken for the owner model.** `donors.status` is free text with no check constraint (`init_schema.sql:76`). The CRM "Archive" button is a stub (`crm/page-client.tsx:69`). Tags are a flat `TEXT[]` (`init_schema.sql:83`). None of this is an archive or provenance model (D73; O87, O88).
- **Phase 15's own inconsistency** ("mark the gift `reversed`", P15:1099, versus "derived, never stored", P13:2028) belongs to the owners (D71). Phase 30 never stores a money state.

### 1.4 Edge cases: material concern, yes

| #   | Case                                                                     | Handling                                                                                                                                                               |
| --- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | An update import swapped two columns (first and last name)               | Values not written since go back. Values someone edited stay.                                                                                                          |
| E2  | A "Fill empty only" import (the Q12 default)                             | Every reversed value goes back to empty. The page counts these ("980 become empty again").                                                                             |
| E3  | A "Replace" import                                                       | Prior values go back where not written since                                                                                                                           |
| E4  | A newer import B changed the same field after import A                   | Reversing A leaves it ("Changed by a later import"). Reversing B first puts back A's value and A's write, so A can then be reversed.                                   |
| E5  | The same file imported twice                                             | The second import changed nothing (unchanged values aren't written), so its reversal has nothing to do                                                                 |
| E6  | A created person got a note, task or file                                | Stays: "Has activity since the import"                                                                                                                                 |
| E7  | A created person was merged, on either side, even if later unmerged      | Stays: "Merged since"                                                                                                                                                  |
| E8  | A created person has a gift, including a draft gift in a Gift file batch | Stays                                                                                                                                                                  |
| E9  | A created person was sent anything (receipt, email, letter)              | Stays                                                                                                                                                                  |
| E10 | A created person carries a restriction the import recorded               | Archived if otherwise untouched. The restriction stays with the archived record and follows them if re-created.                                                        |
| E11 | A person was erased since                                                | Skipped: "Erased since". Nothing is written to them.                                                                                                                   |
| E12 | The import added an email that is now primary, and receipts went to it   | Stays (something was sent to it)                                                                                                                                       |
| E13 | The import ended an old address, and staff edited the new one since      | The new address stays. The old one stays ended.                                                                                                                        |
| E14 | The import added a list membership, then the person opted in themselves  | Stays: the membership changed since (a consent event)                                                                                                                  |
| E15 | The import added a list membership, and nothing has happened since       | Removed as a record correction. No unsubscribe is recorded. No send ever relied on it, because imports grant nothing (Q12 clause 6).                                   |
| E16 | The import created a household of two, and both are archived             | The empty household is archived too (O88)                                                                                                                              |
| E17 | A custom field was archived or changed type since                        | The value stays: "Field changed since"                                                                                                                                 |
| E18 | The prior value is an option archived since                              | Put back as is if Phase 11 allows history-only options (Q16). Otherwise stays, with Phase 11's reason.                                                                 |
| E19 | Someone edits a field while the reversal runs                            | That item is re-checked at its turn and skipped                                                                                                                        |
| E20 | The person presses Stop halfway                                          | It stops after the current batch, and items already done stay done. "Resume" covers the rest.                                                                          |
| E21 | The job crashes mid-batch                                                | Changes are idempotent per item, and it resumes without applying anything twice                                                                                        |
| E22 | The window closes while a reversal runs                                  | It finishes. Deleting prior values waits.                                                                                                                              |
| E23 | Prepared on day 29, confirmed on day 31                                  | Refused: the window closed                                                                                                                                             |
| E24 | The window crosses a daylight-saving change                              | The deadline is stored in UTC and shown in the ministry's time zone and named zone                                                                                     |
| E25 | The confirmer loses the capability, or an Asym operator tries to confirm | Confirm is refused. A running job re-proves the capability per batch and stops (C16; Q5).                                                                              |
| E26 | Two staff press Prepare at once                                          | One prepared page per import. The second person sees it.                                                                                                               |
| E27 | The wrong organisation's file, or a file of the wrong people             | Clause 10: reverse at once, then erase through the privacy path                                                                                                        |
| E28 | A Gift file already posted, with receipts sent                           | Phase 15's batch reverse, from its own page, which states the corrected or void receipts. Phase 30 posts nothing.                                                      |
| E29 | A Gift file not yet posted                                               | Phase 15 discards the draft batch (its "archive-to-audit", P15:389)                                                                                                    |
| E30 | A Gift file split into a posted batch and a follow-on draft              | Both are listed, each with its own action                                                                                                                              |
| E31 | A Switch run after go-live                                               | People with adopted gifts stay. Giving history goes through Q13's void and re-adopt. Fields go through the Created-by-Switch list.                                     |
| E32 | A Switch run before go-live                                              | No reversal. Stop the Switch, or fix and re-run the family.                                                                                                            |
| E33 | Re-importing a corrected file after reversal                             | Archived people matched by source ID appear as one grouped decision ("37 people archived by your reversal of import 12 will be restored and updated"). Never silently. |
| E34 | Values on people the import created are wrong                            | Not blanked one by one. Import a corrected file, which matches the same people by source ID.                                                                           |
| E35 | A missionary self-import                                                 | Excluded. D17's "change entries one at a time" stays.                                                                                                                  |
| E36 | A very large import (hundreds of thousands of people)                    | Prepare and run are background jobs with progress. The page shows counts and paged lists. Downloads are streamed.                                                      |
| E37 | Restricted-tier people in the import                                     | The page and results list show them only to viewers allowed to see them, and count them otherwise                                                                      |
| E38 | An import that changed nothing                                           | "Nothing to reverse"                                                                                                                                                   |

### 1.5 Footguns: material concern, yes

| Footgun                                                           | Harm                                                  | Prevention                                                                     |
| ----------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Reversing overwrites a colleague's later edit                     | Lost work                                             | "Not written since" check at the moment of change (V4)                         |
| Reversing removes an opt-out or restriction                       | Mail to someone who said stop; a CAN-SPAM/PECR breach | Never removed, including ones the import recorded (V3)                         |
| Removing a list membership records an unsubscribe                 | A person-only block nobody can lift                   | A record correction only (V3)                                                  |
| Reversal fires "field changed" or "removed from list" automations | Mass emails                                           | Reversal writes stay dark (V6; O89)                                            |
| Archiving a merged person                                         | The undo-after-merge hazard (Planning Center)         | Merged people stay (V1)                                                        |
| "Reverse" on a people page read as moving money                   | Panic or wrong action                                 | People buttons name the result; money verbs stay with money owners (clause 11) |
| A stale page confirmed days later                                 | Wrong counts                                          | 24-hour expiry and per-item re-check                                           |
| Thinking archive fixes a wrong-file import                        | Personal data stays held                              | Clause 10 erasure path                                                         |

### 1.6 Tenant safety: material concern, yes

- **What could go wrong.** The reversal job runs with privileged server access. If it trusted IDs from the request, it could read or write another ministry's records. A results download could also expose restricted people.
- **Severity:** critical. **Likelihood:** low with the controls below.
- **Requirements:**
  - Tenant, import and actor come from server context and the stored import record, never from the request.
  - Every read and write is scoped to the import's tenant.
  - The capability is re-proved at confirm and at each batch (C16).
  - Asym operator identities can't prepare or confirm (Q5, DL:196).
  - The results list renders under the viewer's own permissions.
- **Wrong-tenant files** (another ministry's data uploaded here) follow clause 10, and Asym tells the ministry if Asym staff caused it.

### 1.7 Database, RLS and authorization safety: material concern, yes

This is design guidance; the spec states outcomes.

- **Prior values.**
  - Each holds tenant, import, record, field, prior value and prior write.
  - Server-only, with no client grants and RLS denying `authenticated` and `anon`.
  - Deleted at the window end through the retention sweep (Q15), and erased with the person.
  - Never readable through views or RPCs exposed to clients.
- **Reversal record.**
  - Keyed to the import with a tenant-aware composite foreign key.
  - One per import, enforced by a unique constraint.
  - States are limited by a check constraint, and transitions happen only through one server command, so a finished reversal can't be set back to running.
  - Prepared-by and confirmed-by come from the authenticated session.
  - Outcome rows are append-only, with no update or delete grants.
- **Each change is one owner mutation** whose condition is "the latest write to this field is still the import's write" (a single conditional statement, the compare-and-set pattern already used in `correction-requests.ts:445` and ADR-0147). There is no read-then-write race.
- **Archive** is the owner's lifecycle transition. It is not a free-text status, so today's unconstrained `donors.status` is not the model (D73).
- **Can an allowed update produce a forbidden state?** No:
  - Clients can't update prior values or outcomes.
  - Status moves only forward through the server command.
  - The owner refuses to archive a merged, erased or touched person in the same statement that archives.

### 1.8 Overengineering: material concern, yes (resolved)

**Refused:**

- a generic undo engine across families;
- typed confirmation (NN/g reserves it for "the most dangerous and rare actions"; the reversal is itself recoverable through unarchive and re-import);
- a second approver (Q5; ADR-0173:52-54);
- per-tag provenance;
- redo;
- reminder emails before the window closes;
- a separate incident system;
- forced reverse order (LGL, DonorSnap);
- whole-tenant snapshot restore (DonorPerfect);
- Phase 30 posting money;
- tenant-wide staleness fingerprints;
- a reversal action for every family in v1.

**Kept:**

- one page pattern and one job;
- one owner command for People;
- three groups;
- per-item checks;
- a 24-hour expiry and a 30-day window;
- on-demand results.

### 1.9 UX/UI and user friction: material concern, yes

**Resolving the wording conflict with outside practice.** r2 and r4 note that "Undo import" is the most common label (Planning Center, Little Green Light, Zoho, Mailchimp). That conflicts with ratified owner wording: ADR-0173 says "never **Undo import**", and Phase 20 D16 says "no generic Undo import". "Undo" also promises a full inverse, which this isn't, since later edits, activity and money stay. _Resolution:_ the entry button is "Prepare reversal". It tells people nothing happens yet; HubSpot's "Prepare preview" is the closest precedent. The plain language goes in the final button, which names the result, as NN/g, GOV.UK and Atlassian advise.

**Import page.** "You can reverse this import until 3 December 2026, 5:00 PM Eastern Time (in 30 days)." Next to it is **Prepare reversal**, visible to people with the capability. Others see the deadline and who can act.

**Prepared page: "Reversal plan for Spring donors.csv".**

- "Nothing changes until you confirm. This plan is valid until 4 November, 3:12 PM."
- **Can be reversed now:** restore 1,204 values (980 become empty again); remove 52 tags and 12 email addresses added in error; archive 37 people.
- **Needs its owner's correction:** each item has a direct link (for a Gift file, each batch with "Discard draft" or "Reverse batch in Gift entry").
- **Stays as it is:** 36 values changed after the import; 3 people with activity since; 1 merged since; 14 restrictions and opt-outs kept.
- Each line expands to a paged, filterable table, with **Download list**.
- Buttons: **Restore 1,204 values and archive 37 people** and **Close without changes**.

**While running.** A status line reads "Reversing: 4,000 of 6,120 items", announced politely (WCAG 4.1.3). People can leave the page and get a notification when it finishes. **Stop after this batch** says "Items already reversed stay reversed."

**Finished.** A persistent banner, never a toast (WCAG 2.2.1): "Reversal finished. 1,198 values restored and 37 people archived. 6 items changed after you prepared this and were left as they are. **View list**". Focus moves to the banner.

**Words.**

- "Changed after the import", "Has activity since the import", "Merged since", "Erased since", "Restrictions and opt-outs are never removed", "Kept for history".
- Never "Asym will": the person confirms.
- Dates are absolute, with the zone named (Microsoft: "Eastern Time", not "EST"), and times avoid midnight.

**Mobile and access.** Mission Control is desktop-first, but the page works narrow: counts come first and tables collapse to stacked rows. Tables are keyboard-operable, results are text not colour, and counts are pluralised in the ministry's locale.

### 1.10 Source of truth, ownership and domain invariants: material concern, yes

| Fact                                                                             | Owner                                                   |
| -------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Person values, tags, contact details, list memberships, household links, archive | Phase 9 (with Phase 4 merge and Phase 11 custom values) |
| Prior values                                                                     | Phase 9 (O73), stored for the window only               |
| Website drafts and their reversal plan                                           | Phase 23 (ADR-0173 clause 29)                           |
| Gift batches and their reverse                                                   | Phase 15 on Phase 13's ledger                           |
| Giving history correction                                                        | Phase 13 (Q13 clause 12)                                |
| Notes, files, care                                                               | Phases 9, 29, 38, 41 (Q14 clause 12)                    |
| Field definitions                                                                | Phase 11 (Q16)                                          |
| Reversal page, job, record, outcomes                                             | Phase 30 (C5): evidence only, never a target authority  |

The reversal record is evidence; it is never read as the current state of a person. Restrictions and suppression stay owned by Phases 9 and 10, and a reversal never writes them.

**Invariants:**

- **V1.** A reversal never deletes a person, gift, note, file or history entry. It archives, ends a link as entered in error, or writes an attributed restoring change.
- **V2.** A reversal never changes money. Money corrections belong only to the money owners.
- **V3.** A reversal never removes or lifts a restriction, opt-out or suppression, and never records an unsubscribe.
- **V4.** A reversal never overwrites a write made after the import.
- **V5.** Each item changes at most once per import reversal.
- **V6.** A reversal's writes have no outward effects.
- **V7.** Only a ministry member holding the capability confirms. Tenant and actor come from server context.
- **V8.** There is one reversal per import, and one heavy People job per ministry at a time.
- **V9.** Nothing is reversed after the window.

V4, V5, V7 and V8 are enforced in the database (conditional writes, unique keys, server-derived actors). V1, V3 and V6 are enforced by the single owner command.

### 1.11 Hidden coupling: material concern, yes

- **Q12 clause 8.** Refined by clause 4. Re-imports gain the grouped restore decision (E33).
- **Q15 clause 11 and its Retention class.** Renamed. The window starts at go-live for Switch runs, and hold and erasure rules are added.
- **Q1 clause 10.** Batch reversal after go-live is now this decision.
- **Q9.** Lists carry consent weight, which is why removal is a correction.
- **Q10.** Households.
- **Q13, Q14 and Q16.** These families route to their owners' correction paths.
- **Phase 28 D17.** Excluded.
- **Phase 15 tenant approval policy.** May queue a gift reverse.
- **Phase 34 automation suppression.** Extended (O89).
- **The Phase 23 seven groups.** Mapped (O91).
- **C23.** No family is importable without its correction path (clause 12).

### 1.12 Failure modes: material concern, yes

| Failure                                                 | Safe outcome                                                       | Visible to                                       | Recovery                                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Crash mid-batch                                         | Items already changed stay changed; the rest are untouched         | Status shows "Paused, resuming"                  | Automatic resume from per-item outcomes (stale-running recovery, as in `process-batch.ts`) |
| Repeated failure                                        | Stops after the batch, with the state "Failed, resumable"          | Confirmer, admins, engineering monitor (M-Q18-3) | Resume; engineering only if it repeats                                                     |
| An owner refuses an item (rule changed, field archived) | The item stays, with the owner's reason                            | Results list                                     | None needed                                                                                |
| A lost response after confirm                           | A retry finds the existing reversal (one per import)               | —                                                | Idempotent                                                                                 |
| Gift reverse awaiting approval                          | The page shows "Waiting for approval in Gift entry"                | Confirmer                                        | Phase 15's approver                                                                        |
| Prior-value deletion racing a running reversal          | Deletion waits                                                     | —                                                | Sweep skips running reversals                                                              |
| Partial success                                         | Truthful counts and reasons (ADR-0173 "truthful partial handling") | Banner and list                                  | Owner tools for the rest                                                                   |

### 1.13 Lifecycle, temporal correctness, concurrency and idempotency: material concern, yes

**States:**

- Preparing → Prepared;
- Prepared → Expired (after 24 hours or at window end);
- Prepared → Running (on confirm);
- Running → Stopping → Stopped (resumable) | Finished | Finished with items left as they are | Failed (resumable).

**Forbidden transitions:** back to Prepared from any later state; a second reversal for the same import; any confirm after the window.

**Time:**

- The window is 30 days from commit (everyday) or from go-live (Switch run), stored in UTC and shown in the ministry's zone.
- A confirm before the deadline is honoured to completion.
- A legal hold keeps prior values but doesn't reopen or extend the window.

**Atomicity:** each item is one conditional owner write together with its outcome row.

**Idempotency:** keyed by reversal and item. Retries and resumes skip items that already have an outcome, and a double-click on confirm finds the same reversal.

**Races:**

- Staff edits during the run are caught by the per-item check.
- Imports and reversals are serialized per ministry.
- A merge during the run is caught because the owner checks merges in the same statement.
- An erasure during the run is caught because erased people are refused by the owner.

### 1.14 Data integrity risks: material concern, yes

- **Lost later edits:** prevented by V4.
- **False relationship history:** a household link ended as a real-world end would say the people once lived together. Prevented by "entered in error" (O87).
- **Duplicates after a corrected re-import:** prevented by the grouped restore decision. Source IDs still match the archived people (E33).
- **Wrong counts:** counts come from actual outcomes, not the prepared plan.
- **An orphaned household:** archived with its last member (O88).
- **Money:** untouched (V2).
- **Consent:** untouched (V3).

### 1.15 Security and privacy risks: material concern, yes

- **Prior values are personal data** (r2 §5).
  - They are server-only, kept 30 days, and erased with the person.
  - A legal hold keeps them, as evidence only.
- **Results lists** are generated on demand under the viewer's permissions. No file is stored (Q15: an artifact without a class cannot be stored).
- **Run evidence** keeps counts and outcome codes, never row content (DL:830).
- **A wrong file is a probable personal data breach** (GDPR Art. 4(12), Art. 33).
  - Archiving is "not a legal substitute for deletion" (Mailchimp, r4 §6).
  - Clause 10 erases through the privacy path, and the records give the ministry its breach-log facts.
- **Audit:** the attributed history on each record, plus the reversal record, covers both who acted and what changed.
- **Restricted-tier people** stay hidden from viewers without access (E37).

### 1.16 Scalability and performance: material concern, no (requirement)

**Checked:**

- **Import sizes** are up to the Q15 size profile (a 2 GB CSV; 20 million rows per Switch).
- **Prepare** is a set-based pass over the import's own write records, indexed by tenant and import, plus batched activity checks per person. It runs as a background job, so large imports don't time out.
- **The run** uses chunked batches with per-item outcomes (the existing `contribution_operation_batches` and work-claim patterns).
- **Prior values** are bounded by the import's size and deleted at 30 days.
- **Downloads** are streamed.

**Requirement:** a production-shaped test reverses a 250,000-person import in under one hour on the reference environment. The threshold is confirmed by the Q15 practice run.

### 1.17 Operational burden: material concern, yes (contained)

- **Ministry staff:** one page and one decision. Owner corrections are one link away.
- **Asym staff:** none. The job resumes itself.
- **Engineering:** only for repeated failures (M-Q18-3).
- **Database repair:** never. All fixes go through owner commands.

### 1.18 Observability and auditability gaps: material concern, yes

**Business history:**

- each change carries "Restored by reversal of import 12, confirmed by J. Smith";
- the reversal record holds who prepared it, who confirmed it, when, counts, and each item's outcome code and reason.

**Security audit:** prepare, confirm, stop and resume are audited events.

**Technical traces:** these carry import and reversal IDs, with no row content in logs.

**Monitors:** M-Q18-1 to M-Q18-7.

### 1.19 Dependency and integration risks: material concern, yes (contained)

- **No third parties.** The internal dependencies are:
  - Phase 9 commands (O87, O88);
  - Phase 34 suppression (O89);
  - Phase 15 batch pages (O90);
  - Phase 23 groups (O91);
  - the privacy owner (O92).
- **Phase 15's batch reverse depends on the unbuilt Phase 13 ledger** (r3 §2). Until it exists, Gift files can't be posted either, so nothing is lost.
- **The background-job runner** (Inngest or the existing chunked-claim pattern) must resume after deploys. That's a design choice, not a spec freeze.

### 1.20 Migration, rollout and upgrade risks: material concern, yes

**Order:**

1. Phase 9's archive meaning and reversal command (O87, O88).
2. Reversal suppression (O89).
3. Prior-value capture, shipping in the same release as the People import (otherwise the first imports can't be reversed).
4. The Phase 30 page and job.
5. The Gift file handoff (O90).
6. The Phase 23 groups (O91).

**Gate:** People imports don't launch without reversal (Q12 clause 8; C23).

**Kill switch:** new prepares and confirms can be turned off per ministry or globally. A running reversal then stops after its batch and stays resumable.

**Upgrades:** outcome codes are versioned text. Old reversal records stay readable.

### 1.21 Testability, traceability and proof: material concern, yes

The acceptance criteria are in §3. **Terms to add:** Import reversal (redefined), Prepare reversal, Untouched, Entered in error. **Renamed:** "undo values" becomes "reversal prior values". **Tests:**

- **Positive:** AC2, AC4.
- **Negative:** AC3, AC5–AC7.
- **Boundary:** AC10, AC11.
- **Authorization:** AC13, AC14.
- **Concurrency:** AC9, AC15, AC16.
- **Accessibility:** AC20.
- **Production-shaped:** AC8 with a live automation, plus §1.16.
- **Static:** AC17, AC22.

### 1.22 Other development hazards: material concern, yes

- **Unclear ownership of "untouched".** Many owners hold activity, so Phase 9 must answer it through one published check fed by owners (O87). Phase 30 must not assemble it itself.
- **Owner requirements without PRDs** (Phases 38 and 41). Their families stay non-importable until their correction paths exist (clause 12).
- **D17 static test.** #2084's A9 must stay green, so the self-import route never gets the button (AC17).

---

## 2. Disposition

**Accept with required amendments.** B's shape stands. The amendments:

- narrow where the button appears;
- define "untouched" and "not written since";
- treat tags as one field;
- handle list memberships, contact details and household links as entered in error;
- keep reversal effects dark;
- give the Gift file its batch-by-batch handoff;
- add stale-page, running, window, hold and erasure rules;
- handle a wrong file through the privacy path;
- fix the wording;
- require no family to be importable without its correction path.

## 3. Corrected decision (to record)

**Q18 — Reversing an import. Option B, amended.** (★ = changed from what was asked.)

1. **Where "Prepare reversal" appears.**
   - **On:** each committed People import, each Gift file, each website content import (Phase 23's plan, ADR-0173 clause 29) and, after go-live, each Switch run.
   - ★ **Not on:**
     - the missionary self-import (Phase 28 D17 keeps "change entries one at a time", #2084);
     - Practice copies (discarded, Q6);
     - Switch runs before go-live (stop the Switch, or fix and re-run the family: Q1 clause 10, Q13 clause 12).
   - **Pressing it changes nothing.** It prepares a page that only a ministry member holding the reversal capability can confirm (Q5, O52).
2. **One page, three groups.** Everything the import created or changed appears once, in one group:
   - **Can be reversed now:** done when the ministry member confirms, through the owner's own command.
   - **Needs its owner's correction:** each item links straight to the owner's tool (clause 3).
   - **Stays as it is:** each item gives its reason in plain words.

   ★ Owners' finer groupings, such as Phase 23's seven, appear as reasons within these three.

3. ★ **Who does what in v1.**

   | What the import did                                                                                                                                       | Group                                                                                                                                                                                                                                                                           | Owner                         |
   | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
   | People results: values, tags, contact details, list memberships, household links, people it created (People imports, and a Switch's people after go-live) | Can be reversed now if clause 4's checks pass; otherwise Stays as it is                                                                                                                                                                                                         | Phase 9, with Phases 4 and 11 |
   | Website content import                                                                                                                                    | Phase 23's plan: Trash or a private restoring revision; edited, referenced, scheduled or published items stay                                                                                                                                                                   | Phase 23                      |
   | Gift file                                                                                                                                                 | Needs its owner's correction. Every resulting batch, including follow-on batches, links to Phase 15: discard a draft batch, or reverse a posted batch. Phase 15's page states donor-visible effects (corrected or void receipts) and any approval step before anything happens. | Phase 15                      |
   | Switch giving history                                                                                                                                     | Needs its owner's correction: void and re-adopt (Q13 clause 12)                                                                                                                                                                                                                 | Phase 13                      |
   | Recurring gifts and tail evidence                                                                                                                         | Needs its owner's correction                                                                                                                                                                                                                                                    | Phase 16                      |
   | Notes, interactions, files, applications and care                                                                                                         | Needs its owner's correction: owner correction run (Q14 clause 12)                                                                                                                                                                                                              | Phases 9, 29, 38, 41          |
   | Custom fields and options a Switch created                                                                                                                | Needs its owner's correction: Created-by-Switch list (Q16 clause 12)                                                                                                                                                                                                            | Phase 11                      |
   | Retired designations created from mapping                                                                                                                 | Stays as it is: kept for history                                                                                                                                                                                                                                                | Phase 13                      |
   | Restrictions, opt-outs and suppression evidence                                                                                                           | Stays as it is: never removed                                                                                                                                                                                                                                                   | Phases 9 and 10               |

4. ★ **The checks for People results**, applied again at the moment each item is changed:
   - **Values.** A value, including a custom field value, goes back to what it was only if nobody and nothing has written that field since the import, including a later import. If it was empty before, it becomes empty again, and the page counts these. Putting a value back also puts back which write it came from, so reversing a newer import and then an older one works.
   - **Tags** count as one field. They go back only if the person's tags haven't changed since.
   - **Contact details, list memberships and household links the import added** are removed as "entered in error" only if they are unchanged since and nothing was sent to that contact detail or household. An address the import ended is reopened. Removing a list membership corrects the record. It is never an unsubscribe and never records or lifts a block.
   - **People the import created** are archived only if untouched since the import. Untouched means none of these has happened:
     - nobody edited them;
     - no gift (including a draft), pledge, recurring gift, note, task, file, relationship, consent or restriction event was added;
     - they weren't merged on either side;
     - nothing was sent to them;
     - they got no portal account;
     - they weren't assigned to a missionary or staff member;
     - no other import updated them.

     Viewing, searching and exporting don't count.

   - **Values on people the import created** are never blanked one by one. To correct them, import a corrected file, which matches the same people by source ID.
   - **Anything that fails a check** stays as it is, with its reason.
5. ★ **Confirming.**
   - **No extra ritual:** the page is the confirmation, with no typed phrase and no second person (Q5; ADR-0173).
   - **The final button names the result** in plain, non-money words, for example "Restore 1,204 values and archive 37 people".
   - **Validity:** a prepared page lasts 24 hours or until the window closes, whichever is first.
6. ★ **Running.**
   - **In the background.** It runs in the background, and the person can leave the page. Progress is announced, and they are notified when it finishes.
   - **Stop.** "Stop" stops after the current batch and says that items already reversed stay reversed.
   - **One at a time.** One People import or reversal runs per ministry at a time.
   - **Once per import.** Each import is reversed once. A stopped or failed reversal resumes for its remaining items.
   - **No redo.** Importing the file again re-applies it. People the reversal archived are restored only through one explicit grouped decision in that import's plan.
   - **Results.** Counts are shown on the page. A results list (each item, what happened and why) is generated on demand under the viewer's permissions and never stored as a file.
7. ★ **The window.** 30 days: from commit for everyday imports, and from go-live for a Switch run.
   - **Display:** an absolute date and time in the ministry's time zone, for example "You can reverse this import until 3 December 2026, 5:00 PM Eastern Time", with "in 30 days" as a hint.
   - **Deadline:** a reversal confirmed before the deadline finishes. Deleting prior values waits for it.
   - **Legal hold:** a hold keeps prior values but doesn't extend the window.
   - **Erasure:** erasing a person removes their prior values. The reversal skips them ("Erased since") and never writes to an erased person.
8. ★ **Effects stay dark.** A reversal's own changes fire no automations, field-change triggers, sends, welcomes or goodbyes, the same as an import's. Only Phase 15's reversal of a posted gift batch has donor-visible effects, under Phase 15's rules.
9. ★ **History and evidence.**
   - **Attributed changes:** each change is a new attributed change, for example "Restored by reversal of import 12, confirmed by J. Smith". The import's own history is never erased.
   - **Reversal record:** it keeps who prepared and who confirmed, when, counts and each item's outcome code, with no row content.
10. ★ **A wrong file is a privacy matter, not only a reversal.** This covers a file that should never have been in Asym: another organisation's data, the wrong people, or sensitive columns.
    - **Reverse it** to take it out of use at once.
    - **Erase:** the ministry's privacy role then erases those people through the erasure path, which also reaches the held file and the prior values.
    - **Breach log:** the import and reversal records give the ministry the counts, times and actors its breach log needs. Asym builds no separate incident system.
    - **Asym-caused:** if Asym staff caused it under an operator grant, Asym tells the ministry without undue delay.
11. ★ **Words.**
    - **The action** is "Prepare reversal".
    - **The term** is always "import reversal", never a bare "reversal", which means a payment reversal elsewhere.
    - **Buttons for people results** name the result ("Restore … values", "archive … people"), never "reverse" or "undo".
    - **Money verbs** (reverse, void, refund) stay with the money owners.
    - **Renamed:** Q15's "Everyday import undo" and "undo values" become "import reversal window" and "reversal prior values".
    - **Not used:** "Undo import", "rollback", "revert" and "restore snapshot".
12. ★ **No family without its correction path (C23).** A record family becomes importable, by everyday import or Switch, only when its row in clause 3 is published and its link or command works.

**Acceptance criteria**

- **Preparing and grouping**
  - **AC1.** Preparing writes nothing to any person, gift, note, file or field.
  - **AC2.** Every item the import created or changed appears exactly once across the three groups, and the group counts add up to the import's totals.
- **People checks**
  - **AC3.** A field written after the import, by staff or a later import, is left alone and listed. This includes a write of the same value.
  - **AC4.** A created person with any clause 4 activity is not archived. One with only views, searches or exports is archived.
  - **AC5.** People merged since, on either side, are left alone and listed.
  - **AC6.** Restrictions, opt-outs and suppression evidence, including any the import recorded, remain after reversal.
  - **AC7.** Removing an import-added list membership records no unsubscribe or block and sends nothing.
  - **AC8.** With a live automation on the field, list and tag, a reversal fires zero automations, sends or triggers.
- **Confirming, timing and access**
  - **AC9.** An item changed between preparing and confirming is skipped and listed "Changed after you prepared this". The finished counts match the actual outcomes.
  - **AC10.** A prepared page expires after 24 hours or at the window's end. Confirming after expiry is refused and asks the person to prepare again.
  - **AC11.** Preparing or confirming is refused after 30 days from commit (everyday) or from go-live (Switch run). A reversal confirmed before the deadline completes, and prior-value deletion waits for it. The deadline displays correctly across a daylight-saving change.
  - **AC12.** Under a legal hold, prior values remain, but reversal is still refused after the window. Erasing a person removes their prior values, and the reversal skips them.
  - **AC13.** Preparing and confirming need the reversal capability. The capability is re-proved at confirm and per batch. Asym operator identities are refused.
  - **AC14.** A reversal reads and writes only its own ministry's records. Tenant and actor never come from the request.
- **Running**
  - **AC15.** Retries, resumes and double-clicks never change an item twice and never create a second reversal.
  - **AC16.** A second People import or reversal for the same ministry waits, with a message, while one runs.
- **Scope and handoffs**
  - **AC17.** The missionary self-import, Practice copies and pre-go-live Switch runs show no "Prepare reversal". #2084's A9 static test stays green.
  - **AC18.** A Gift file's page lists every resulting Phase 15 batch, including follow-on batches, each with discard or batch reverse. Phase 30 writes no money.
  - **AC19.** A re-import after reversal shows the archived people it matches as one grouped decision, never silently unarchived or duplicated.
- **Page and results**
  - **AC20.** Progress and completion are announced as status messages. No action sits in an auto-dismissing toast. Tables are keyboard-operable, and focus moves to the result summary.
  - **AC21.** The results list renders under the viewer's permissions and is not stored as a file.
- **Correction paths**
  - **AC22.** No family can be enabled for import without its clause 3 row and a working link or command (static registry test).

## 4. Ruthless synthesis

### Before recording

- **Ratification amendments:**
  - Q12 clause 8: refined, with the re-import grouped decision.
  - Q15 clause 11 and the Retention class: renamed, with the Switch window from go-live and the hold and erasure rules.
  - Q1 clause 10: batch reversal after go-live is Q18.
- **Glossary:** redefine "Import reversal"; add "Prepare reversal", "Untouched" and "Entered in error".
- **Resolved items:** D3 is resolved, and D68 to D73 are recorded.

### Spec and design

- **The three-group page and its routing table** (clause 3) as a registry that every importable family must have a row in (AC22).
- **The People checks** (clause 4) as one Phase 9 command with one published "untouched since" check fed by the owners of each activity.
- **Reversal record states and transitions** (§1.13). Prior values: server-only, 30 days, erased with the person.
- **Page copy** (§1.9) and deadline formatting.

### Owner requirements, in order

1. **O87 (Phase 9 with 4 and 11):** the People reversal command.
2. **O88 (Phase 9):** what "archived" means.
3. **O89 (Phases 34, 11, 6 and 14):** reversal suppression.
4. **O92 (privacy owner with Phase 9):** erasure reaches prior values.
5. **O90 (Phase 15):** the Gift file handoff.
6. **O91 (Phase 23):** the group mapping.

O87 and O88 come first because nothing can be reversed without them. O89 must land before the first reversal runs anywhere.

### Implementation safeguards

- A conditional write per item, combining the owner check and the outcome in one statement.
- A unique reversal per import, and a per-ministry heavy-job lock.
- Server-derived tenant and actor, with the capability re-proved per batch.
- Prior-value capture ships with the People import.
- No client grants on prior values or outcomes.
- A kill switch for prepare and confirm.

### Monitors

| ID      | Signal                                                                                   | Threshold                   | Owner                                      | Response                                                               |
| ------- | ---------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| M-Q18-1 | Share of People imports reversed within the window, per quarter, across ministries       | > 10%                       | Phase 30 product owner                     | Review the import preview and mapping steps that let bad files through |
| M-Q18-2 | Share of a reversal's People items left "Stays as it is" because changed or active since | Median > 50% over a quarter | Phase 30 product owner with Phase 9        | Check whether reversals come too late or checks are too strict         |
| M-Q18-3 | Reversal jobs failed or not progressing for 1 hour                                       | > 0                         | Engineering on-call                        | Resume; open an incident if it repeats                                 |
| M-Q18-4 | Automations, sends or field-change triggers caused by reversal writes                    | > 0                         | Phase 34 owner                             | Incident; fix the suppression                                          |
| M-Q18-5 | Prior values past their deletion date without a legal hold                               | > 0                         | Phase 9 with the Q15 retention sweep owner | Incident; delete and fix the sweep                                     |
| M-Q18-6 | Wrong-file reversals followed by erasure                                                 | Any                         | Phase 30 product owner                     | Review the import's file checks and preview                            |
| M-Q18-7 | Reversal writes to a person who was erased, merged or touched                            | > 0                         | Phase 9                                    | Incident; fix the owner check                                          |

## 5. Owner requirements and discrepancies

**Owner requirements (proposed O87–O92):**

| #   | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Owner                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| O87 | A People reversal command implementing Q18 clause 4 (amends O51): <br>• a per-field "not written since the import" check at the moment of change (latest write, never value equality alone); putting a value back restores its prior write; <br>• tags as one field; <br>• "entered in error" removal for contact details, list memberships and household or relationship links, distinct from a real-world end; reopening an address the import ended; <br>• archive of untouched people through one published "untouched since" check covering clause 4's list, fed by the owners of each activity; <br>• attributed, effect-dark writes. | Phase 9 with Phases 4 and 11     |
| O88 | What "archived" means for a person: <br>• out of sends, lists, segments, default search and counts; <br>• visible as archived in history and reports; <br>• unarchived only by a person with the capability; <br>• never unarchived silently by a later import; <br>• an empty household created by a reversed import is archived with its last member.                                                                                                                                                                                                                                                                                     | Phase 9                          |
| O89 | Writes made by an import reversal are suppressed exactly like import writes: no automations, field-change triggers, sends, welcomes or goodbyes (extends O78 and `owner-constraints.md:386-388`).                                                                                                                                                                                                                                                                                                                                                                                                                                           | Phases 34, 11, 6 and 14          |
| O90 | From a Gift file, list every resulting batch, including escape-valve follow-ons, with its state and a link to discard (draft) or batch reverse (posted). Phase 15's page states donor-visible effects and any approval routing. Phase 30 never posts compensating entries. Also reconcile D71.                                                                                                                                                                                                                                                                                                                                              | Phase 15 (with Phase 13)         |
| O91 | Map Phase 23's seven reversal groups onto the three page groups as reasons. Keep ADR-0173 clause 29's plan, capability and actions. Phase 30 provides the shared page pattern (C5).                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Phase 23                         |
| O92 | Erasure reaches reversal prior values, and a person erased since is never written to by a reversal.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Privacy owner (O67) with Phase 9 |

**Discrepancies (proposed D68–D73):**

| #   | Discrepancy                                                                                                                                                                                                                                                                              | Resolution                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| D68 | "Everyday import undo" and "undo values" (DL:840; IMCTX:283; ADR-IM-015:9, :41, :58) versus "Import reversal" (IMCTX:228)                                                                                                                                                                | Q18 clause 11 renames them                                                                         |
| D69 | "Reversal" already means a payment reversal (DL:31, :45, :360-362, :638, :657-660; IMCTX:36, :239; root CONTEXT:2941, :4182; P13:368)                                                                                                                                                    | Always "import reversal" (clause 11)                                                               |
| D70 | `owner-constraints.md:378-385` says "batch undo" and lists fewer blockers than `roadmap.md:4371`, ADR-0173:285-287 and P28R:458 (later edits, merges, sharing, references, sent acknowledgments). "Provider operation" and "external transfer" are undefined. Phase 20 C-10 is narrower. | Q18 clauses 3–4 settle it for Phase 30. Owner text is aligned at Phase 30 publication (closes D3). |
| D71 | Phase 15 "mark the gift `reversed`" (P15:1098-1099) versus Phase 13 "derived, never stored" (P13:2028)                                                                                                                                                                                   | Owner reconciliation (Phases 13 and 15; O90)                                                       |
| D72 | ADR-0173's "receipts" are operation receipts, colliding with tax receipts in B's "receipt issued" reason                                                                                                                                                                                 | People reasons never mention receipts. Tax receipts are Phase 15's page.                           |
| D73 | **Current code.** No person archive state (`donors.status` free text, no check, `init_schema.sql:76`). The CRM bulk Archive is a stub (`crm/page-client.tsx:69`). Tags are a flat `TEXT[]` (`init_schema.sql:83`). There is no list-membership entity (P9:527-529).                      | O87, O88                                                                                           |

## 6. Rejected alternatives

| Alternative                                              | Why rejected                                                                                                                                                |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. "Undo import" label (also r2 and r4's suggestion)     | Contradicts ratified owner wording (ADR-0173; Phase 20 D16) and promises a full inverse. The result-naming final button carries the plain language instead. |
| C. No reversal page                                      | Drops Q12's ratified People reversal and leaves staff hunting across screens                                                                                |
| Restoring when the value still equals the imported value | Overwrites deliberate same-value edits (ABA). Use "not written since".                                                                                      |
| Per-tag provenance                                       | Needless. Tags as one field suffice.                                                                                                                        |
| Typed confirmation or a second approver                  | NN/g reserves typed confirmation for rare, dangerous actions. The reversal is recoverable. Q5 and ADR-0173 reject the ritual.                               |
| Forcing newest-first order (LGL, DonorSnap)              | Blocks fixing an older bad import. The per-field check makes order safe.                                                                                    |
| Whole-plan staleness (Terraform)                         | In a live CRM every plan would be stale. Use per-item checks and a 24-hour expiry.                                                                          |
| Whole-tenant snapshot restore (DonorPerfect)             | Wipes colleagues' work                                                                                                                                      |
| Hard-deleting created people                             | Loses opt-outs and history. Archive, and use erasure for wrong files.                                                                                       |
| Redo                                                     | Re-importing the held file does it                                                                                                                          |
| Reminder email before the window closes                  | Noise for the many good imports. The deadline is on the page.                                                                                               |
| A separate incident system for wrong files               | The erasure path plus the records cover it                                                                                                                  |
| Phase 30 posting compensating money entries              | Phase 15 owns them                                                                                                                                          |
| Extending the window during a legal hold                 | A hold preserves evidence. It doesn't keep an action open.                                                                                                  |
| A reversal action for every family in v1                 | Duplicates owner correction paths that six owners already define                                                                                            |
