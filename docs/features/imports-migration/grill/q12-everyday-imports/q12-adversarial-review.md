# Q12 — Everyday imports after go-live and write modes: adversarial check of Option B

Founder answer (2026-11-03): **"yes"** (Option B as recommended). Decision as asked: `q12-decision-as-asked.md`. Evidence: `research/q12-r1-repo-write-modes.md` and `research/q12-r2-external-update-imports.md`.

**Re-verified directly on 2026-11-03:**

- **Phase 15 is the only writer of offline money.** Its guard test requires that "no API path other than the batch commit service writes offline money" (`phase-15-offline-gift-batch-entry.md:836`). Import-origin acknowledgment purposes "remain held and never pass this batch gate" (`:1884`).
- **Phase 14 workplace giving.** The `workplace_giving_donor` row reads: "Benevity/YourCause-style workplace giving: the intermediary payer is hard-credit, the employee is recognized" (`phase-14:403`). Employer matches are "Two separate legal gifts" (`:55`), and matching-gift expectancies are "never gifts" (`:73`). The spawned contribution's legal donor is "the PAYER OF RECORD (defaulting to the employer)" (`:918`).
- **Phase 14 church remittances.** Phase 14 ships a remittance keying surface with "CSV paste with staged preview" (`:1882`).
- **DAF sponsor.** The sponsor is "the hard-credit legal donor of a grant"; the advisor is "recognition-only, thanked with a $0 non-receipt acknowledgment" (root `CONTEXT.md:4482-4487`).
- **Recorded outside Asym.** The Phase 30 glossary defines it over "every gift that reaches Asym through a Phase 30 import or a Legacy Tail Backfill" (`CONTEXT.md:185-187`).

**Disposition: accept with required amendments.** B matches the industry. Blank means "leave alone", updates default to filling empty fields, contact details are always added, and current gifts go through batches with control totals. It also matches the owner rules: "a changed target is a conflict", Phase 15 is the only offline-money writer, there is no automatic merge, and imports grant no consent.

Six gaps would have broken money truth, owner rules or the switch:

- Three affect money or receipts: thank-yous held forever, double receipts for tail gifts, and the wrong receipting party.
- One is a timing collision with the switch.
- Two are owner overlaps.

## 1. Adversarial check

### What could go wrong

1. **Gift-file thank-yous would be held forever.** Phase 15 holds import-origin acknowledgments permanently (`:1884`). If gift-file rows were labelled "import", every DAF, Benevity or check gift brought in by file would never be thanked.
   - **Fix:** gift-file rows enter Phase 15 as ordinary current gifts in a batch. They pass the batch's own human gate for receipts and thank-yous, which is distinct from historical Switch imports (O50).
2. **Tail gifts could be receipted twice.** During a Legacy Recurring Tail, a ministry might upload its PayPal report as a gift file. Those gifts were charged and receipted by the old system and must arrive only through Legacy Tail Backfills (Q7, O35). Imported as current gifts, Asym would receipt them again.
   - **Fix:** while a tail is open, rows whose processor transaction belongs to a declared legacy executor are refused.
3. **"Who issues the receipt" was the wrong frame.** Owner rules already decide the legal donor:
   - The DAF sponsor, workplace-giving platform or employer is the payer of record (`phase-14:403`, `:918`; `CONTEXT.md:4482`).
   - The individual is recognised.
   - A DAF advisor gets a "not a tax receipt" thank-you.
   - **Fix:** each row names the payer of record and the person recognised. Receipts follow the Phase 7/14 rules, and the file never chooses them.
4. **Church remittances would be duplicated.** Phase 14 already has a remittance screen that accepts pasted CSV with a staged preview (`:1882`).
   - **Fix:** remittance breakdowns stay there. The gift file does not duplicate it.
5. **Imports could collide with the switch.** An everyday import running between the Switch Boundary and go-live would race the final import and the editing pause.
   - **Fix:** everyday imports pause from the Switch Boundary to go-live.
6. **Do-not-contact people were over-protected.** Sending every do-not-contact person to review adds noise. Imports cannot lift restrictions anyway (Q9), and staff only need to see them.
   - **Fix:** staff, deceased and restricted-tier people go to review. Do-not-contact people are updated and flagged in the report.
7. **Shared emails need handling.** A new email that another person already holds conflicts with Q10's one-holder rule and the database key.
   - **Fix:** the row goes to review, never to a uniqueness error mid-commit.
8. **Custom fields need a scope limit.** Creating new fields during import is still open (F10).
   - **Fix:** a People import maps only to existing custom fields.

### Hidden assumptions

- **"Blank = no change" needs every owner write command to support "unchanged".** Today the only donor-edit code treats a blank as a clear (`donor.ts:68-71`). Owner commands must accept per-field fill-empty, replace, ignore and clear modes (O51).
- **"Imports grant nothing" will disappoint.** Event lists cannot be emailed newsletters. This was stated openly, and the founder accepted it. A dated opt-in in the file stays as evidence for a later decision.
- **A gift file is not a feed.** Recurring bank or card feeds stay with their own owners (C18). A gift file is a one-off upload into a reviewed batch.

### Whole product

- **Q9:** restriction columns apply restrict-only.
- **Q10:** households come only from explicit columns. Matching follows Q10, and O47 must be live first.
- **Q11:** mapping is rule-based.
- **Q4:** "Recorded outside Asym" is narrowed to Switch imports and Legacy Tail Backfills, so current gifts from files get normal receipts.
- **Phase 15** owns money posting, receipts and corrections. **Phase 14** owns remittances, matching expectancies and recognition. **Phase 8/11** keep their data-health backfill tool.
- **Missionary self-import (D17)** is unchanged. Staff rules must not leak into D17 (`owner-reconciliation.md:47-48`; D12).

### End-user experience

- **Choose an import type:** "People" or "Gift file", each with its own template.
- **Map the columns** (Q11).
- **Set each column's mode:**
  - **Fill empty only** (the default).
  - **Replace**, which shows "N existing values will change".
  - **Ignore.**
- **Preview.** It shows counts of new, updated, unchanged, conflicts, review and errors, with current → new values and an error file.
- **Commit.** A report follows, with a **Reverse this import** action.
- **Gift files** open as a Phase 15 draft batch for the finance user. The expected count and total must tie out before posting.

### Modern best practice

| Practice                                                                                                               | Fit                                                      |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| A blank never changes data; clearing is a separate act (HubSpot, Salesforce, LGL, DonorPerfect)                        | **Matches**                                              |
| Fill-empty by default; per-column overwrite opt-in (Salesforce wizard; HubSpot "Don't overwrite")                      | **Matches**                                              |
| Contact details are added and primary is chosen; old addresses are end-dated; tags add only                            | **Matches**                                              |
| Change-of-address results are reviewed, never spread to a household (RE NXT spouse-copy failure; USPS family matching) | **Matches**; stricter                                    |
| Current gifts go through batches with expected count and total (NPSP, RE NXT, Virtuous)                                | **Matches**                                              |
| Each payout can be imported only once                                                                                  | **Matches** best practice; most vendors don't enforce it |
| Undo that never reverts later edits (unlike Planning Center)                                                           | **Better than** the industry                             |

### Repo fit

- **Supports:**
  - `roadmap.md:4349`: create, update, skip or queue in the plan; "changed target is a conflict".
  - `owner-constraints.md:356-365`.
  - P15 `:144`, which places spreadsheet import with column matching in Phase 30.
  - C15.
  - The P15 sole writer (`:836`).
  - The P14 payer-of-record rules.
  - Q1–Q11.
- **Needs:**
  - O50 (Phase 15 file-origin batch).
  - O51 (owner write modes).
  - O52 (capabilities).
- **Glossary correction:** "Recorded outside Asym".
- **Phase 30 term:** "Everyday import".

### Adjusted recommendation

Keep B, amended as in §2. ★ marks a change from the decision as asked.

## 2. Corrected decision text

**Q12 — Everyday imports after go-live and write modes.** Option B, amended.

1. **Two everyday import types.** Each is chosen up front and has its own template.
   - **People import:** adds new people and updates matched people. It can carry:
     - names and contact details;
     - tags and lists;
     - ★ existing custom fields only (creating new fields stays with F10);
     - household columns (Q10 rules);
     - restriction columns (restrict-only, Q9).
   - **Gift file:** becomes a draft Phase 15 gift batch.
   - ★ **Church remittances:** member breakdowns keep using Phase 14's remittance screen, which already accepts pasted CSV.
   - **Unchanged:** the Switch and the missionary self-import.
   - ★ **Switch pause:** everyday imports pause while a Switch is between its Switch Boundary and go-live.
2. **Updates fill empty fields only by default.**
   - **Per column:** "Fill empty only" (the default), "Replace" (opt-in, showing "N existing values will change"), or "Ignore".
   - **A blank cell never changes anything.** Clearing a value is a separate, confirmed action with a count.
3. **Contact details are added, never replaced.**
   - **New details:** a new email, phone or address is added. It becomes primary only if the import says so.
   - **Old addresses** are kept with an end date.
   - **Tags and lists** are only ever added.
   - **Households:** an address change never spreads to other household members.
   - **Change-of-address (NCOA) files:** addresses from them always go to review.
   - ★ **Shared emails:** a new email already held by another person goes to review (Q10).
4. **Newer work wins.**
   - **Conflicts:** a field changed in Asym after the plan was made is a conflict, never overwritten.
   - ★ **Review:** staff, deceased and restricted-tier people always go to review.
   - ★ **Do-not-contact people** are updated but flagged in the report; imports cannot lift restrictions.
   - **Preview:** it shows new, updated, unchanged, conflicts, review and errors, with current → new values.
5. **Matching follows Q10's rules.**
   - **Order:** the source ID (remembered per source), then email plus first name.
   - **Uncertainty:** anything uncertain goes to review, and nothing merges automatically.
   - **Prerequisite:** O47 must be live first.
6. **Imports grant nothing and send nothing.**
   - Imported people get receipts for their own new gifts, but no newsletters or appeals until they opt in themselves.
   - A dated opt-in in the file is kept as evidence only.
   - No welcome or automation fires because of an import.
7. **Gift files go to Phase 15.** Phase 30 reads and maps the file. Phase 15 owns the draft batch, review, posting, receipts and thank-yous, ★ treating the rows as ordinary current gifts, not the held import kind.
   - **Batch controls:** the batch needs an expected count and total.
   - **Repeat payouts:** each payout and row carries the platform's key, so the same payout cannot be imported twice.
   - ★ **Legal donor:** each row names the payer of record (the person, or the DAF sponsor, workplace-giving platform or employer) and the person recognised. Receipts and thank-yous follow Phase 7/14 rules; for example, a DAF advisor gets a "not a tax receipt" thank-you.
   - **Employer matches** stay separate gifts.
   - ★ **Legacy tail:** during a Legacy Recurring Tail, rows that belong to a legacy executor are refused. That covers, for example, the ministry's PayPal report of old subscriptions. Those gifts arrive only through Legacy Tail Backfills (Q7, O35).
   - ★ **Recorded outside Asym** is narrowed to Switch imports and Legacy Tail Backfills.
8. **Who can run imports, and undo.**
   - **Capabilities:** running a people import, choosing Replace, clearing values and reversing an import are capabilities the ministry grants (Q5). Gift files need Phase 15's batch permission.
   - **Reversal:** a people import is reversible one import at a time.
     - A field is restored only if it still holds the imported value.
     - Later edits are reported, not reverted.
     - People the import created are archived only if nothing has touched them since.
   - **Posted money** is never undone by reversing an import; it uses Phase 15's correction path.
9. **Not in v1:**
   - bulk deletes;
   - changing gifts by import;
   - pledge uploads;
   - merges;
   - consent from imports;
   - automatic change-of-address service connections.

**Acceptance criteria**

- AC1. A blank cell never changes a stored value. A clear needs the separate confirmed action and shows its count.
- AC2. "Fill empty only" leaves populated fields unchanged. "Replace" shows and applies exactly N changes.
- AC3. A new address is added, the old one gets an end date, and no other household member's address changes.
- AC4. A field edited in Asym after the plan was made is reported as a conflict and left unchanged.
- AC5. Staff, deceased and restricted-tier matches go to review. Do-not-contact matches are flagged, and their restriction is unchanged.
- AC6. A new email already held by another person goes to review, never to a commit-time error.
- AC7. An import sends nothing and grants no permission.
- AC8. A gift file opens a Phase 15 draft batch with an expected count and total. Its gifts receive normal batch-gated receipts and thank-yous.
- AC9. The same payout imported a second time is refused.
- AC10. A DAF or workplace-giving row records the payer of record as the legal donor and the person as recognised. No tax receipt goes to the advisor.
- AC11. During a tail, a row matching a legacy executor's charge is refused, and the file is pointed to the Legacy Tail Backfill.
- AC12. Reversal restores only fields still holding the imported value, reports later edits, archives only untouched created people, and leaves posted money alone.
- AC13. Everyday imports are refused while a Switch is between its boundary and go-live.

## 3. Monitors

| ID      | Signal                                                   | Threshold       | Owner                  | Response                                                    |
| ------- | -------------------------------------------------------- | --------------- | ---------------------- | ----------------------------------------------------------- |
| M-Q12-1 | Messages or permissions caused by an everyday import     | 0               | Phase 30 with Phase 6  | Halt; incident                                              |
| M-Q12-2 | A payout accepted twice                                  | 0               | Phase 15               | Halt the batch; correct                                     |
| M-Q12-3 | Gift-file rows accepted that belong to a legacy executor | 0               | Phase 15 with Phase 30 | Reverse through Phase 15; fix detection                     |
| M-Q12-4 | Share of people imports later reversed                   | Learning signal | Phase 30               | Review defaults and matching                                |
| M-Q12-5 | Size of Replace operations                               | Learning signal | Phase 30               | Consider a second-person check if large Replaces are common |

## 4. Owner requirements (proposed O50–O52)

- **O50** (Phase 15):
  - **What it accepts:** a Phase 30 file-origin draft batch whose rows are ordinary current gifts under the batch's own human gate, not held import-origin purposes.
  - **Required controls:**
    - an expected count and total;
    - payout and transaction keys that refuse a repeat;
    - a payer of record and a recognised person on each row, under Phase 7/14 rules;
    - refusal of rows that belong to a legacy executor during a Legacy Recurring Tail.
- **O51** (Phase 9 with Phase 4 and Phase 11):
  - **Field writes:** owner write commands that accept per-field "fill empty", "replace", "ignore" and a separately confirmed "clear".
  - **Contact points:** added, never replaced. Primary changes only on instruction, and old addresses get an end date.
  - **Tags and lists:** add only.
  - **Reversal:** restores a field only if it still holds the imported value. Untouched people the import created are archived.
- **O52** (Phase 12 with O27): capabilities for running people imports, choosing Replace, clearing values and reversing imports. Gift files use Phase 15's batch capability.

## 5. Rejected alternatives

| Alternative                                                        | Why rejected                                                                                |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| A. Switch only                                                     | Leaves routine needs (event lists, payouts) unserved                                        |
| C. Full bulk update with blank = clear                             | The classic way imports destroy good data or update the wrong person                        |
| Gift files committing money directly from Phase 30                 | Breaks Phase 15's sole-writer guard (`:836`)                                                |
| Gift-file rows as import-origin                                    | Their thank-yous would be held forever (`:1884`)                                            |
| A whole-import "empty fields delete data" switch (Planning Center) | Too blunt; clearing must be per column and counted                                          |
| Automatic change-of-address updates                                | Phase 19 forbids provider address overwrites (`:640`); family matches move the wrong people |
