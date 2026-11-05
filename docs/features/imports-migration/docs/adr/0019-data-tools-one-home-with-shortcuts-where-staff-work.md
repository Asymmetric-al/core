# ADR-IM-019: Data Tools is one home for imports, with shortcuts where staff work

**Status:** Accepted 2026-11-04. Ratified by the founder in the Phase 30 grill (Q19), after a full ruthless review. Amended by ADR-IM-020 (2026-11-04, default import name is kind plus date; Gift amounts gated; permissions defined).

- **Record:** `docs/features/imports-migration/grill/decision-log.md` §1 Q19.
- **Evidence:** `grill/q19-data-tools/` (research r1–r5 and `q19-adversarial-review.md`, which holds edge cases E1–E36, invariants I1–I7 and AC1–AC28).
- **Amends:**
  - ADR-IM-005: Switch-lead notices go through Phase 17.
  - ADR-IM-011: the Eve panel is off on Data Tools pages.
  - ADR-IM-015: import drafts gain a Retention class.
- **Preserves:**
  - Phase 23 D29: content imports stay in Web Studio.
  - Phase 28 D17: the missionary self-import stays in the missionary workspace.
  - Phase 21 D27: Field Account opening.
  - Phase 14: church remittances.
  - ADR-0183: one Tasks Hub.
  - ADR-0027: one notification model.
  - ADR-0212: one export policy.
- **Defers:** permissions to Q20 (who sees the entry, source values, downloads, others' drafts and restricted match candidates, and who may start a Switch).

## Context

Q12 created two everyday import kinds, Q18 put a 30-day reversal deadline on every import, and Q1–Q17 define a multi-week Switch. Nothing in Mission Control holds them.

**Owner text:** the roadmap names "Mission Control Data Tools" as Phase 30's surface (RM:4335), and Phase 40 claims the same area for data-quality queues (RM:5260).

**Current code:**

- **Navigation:**
  - four menu lists, two of them dead;
  - an ungated sidebar;
  - a Cmd-K list filtered by role names.
- **No supporting machinery:**
  - no import route or capability;
  - no in-app notification channel (the bell is a demo);
  - no Tasks Hub projection code.
- **Components:**
  - an image-only 5 MB upload path;
  - no XLSX reader or writer;
  - an editable grid whose validation is unimplemented.
- **Testing:** no signed-in accessibility checks for admin.
- **Dead buttons** on the People and Contributions screens.

**Practice:**

- **Placement:** products start imports from the record list and keep one central history (HubSpot, Intercom, Attio, Givebutter). Bloomerang's area is called "Data Tools".
- **Gift files:** Planning Center Giving maps funds as a required step and names the count on its confirm button.
- **Long jobs:** Attio tells people they can close the page.
- **The Switch:** GOV.UK's task-list pattern fits long, multi-session work.
- **Accessibility:** WCAG 2.2 governs upload, status messages and reflow.

## Decision

1. **One area, one entry.** "Data Tools" sits next to Admin.
   - **Inside:** tabs with their own addresses: Imports, Switch and Remembered mappings. There are no sidebar children.
   - **Later owners** add tabs without renaming.
   - **Owner-placed imports** stay on their owners' screens.
2. **Shortcuts open the same flow.** "Import people" on the People list and "Upload a Gift file" in Contributions open the import in Data Tools, with the kind already chosen and a link back.
   - **When done:** "View these people", or the created gift batches.
   - **No dead buttons:** a shortcut appears only where it works. Today's dead buttons on those screens are removed or wired first.
3. **The Imports list** is the guaranteed way back to any import.
   - **Columns:** name, kind, status, started by, when (ministry zone named), rows, outcome counts, reversal deadline.
   - **Filters:** "Needs attention" first.
   - **Behaviour:** paged on the server.
   - **Not record history.**
4. **One page per import, in three or four steps,** saved after every change.
   - **Steps:** File, Columns, Values (only when needed), and Review and import. For a Gift file, the first step is "File and totals", with expected count and total required.
   - **Review:** counts that add up to the file's rows. Write mode is chosen here, with the number of values that would change. Possible matches show both sides and the reason, and bulk choices apply only within one reason.
   - **Problem cells:**
     - Everyday imports can fix them in Asym, and each fix is recorded.
     - A Switch fixes at the source.
   - **Leaving rows out:**
     - Everyday imports may leave rows out deliberately.
     - A Switch signs off with zero Waiting rows.
   - **Confirm:** the button names the result. A plan older than 24 hours, or whose file changed, is rebuilt first.
5. **Importing.**
   - **Background:** it runs in the background, with real counts and no time estimates.
   - **One heavy job per ministry:** later imports show "Waiting to start".
   - **Stopping:** "Cancel import" before writes; "Stop after this batch" once writing starts.
   - **Signals:** milestones are announced, and a lasting banner appears, never only a toast.
6. **Results on the same page:**
   - outcomes;
   - on-demand downloads;
   - links to the people or batches;
   - possible duplicates sent to Phase 4;
   - the reversal deadline.
7. **One status vocabulary:** Draft, Checking file, Ready to review, Waiting to start, Importing, Stopping, Done, Needs attention, Stopped, Failed, Discarded.
   - **Done** is used only when nothing is left out, waiting or needing review.
   - **Reversal** shows as a second label.
8. **The Switch tab is a task list** derived from the Switch's recorded state.
   - **Groups:** Get ready, Prepare and practise, Decide, Switch day, After go-live, Close.
   - **Each task:** a status, a reason when it can't start yet, and who last updated it. There are no assignments.
   - **Landing:** it is the landing page until go-live, and a read-only record after closing.
   - **Everyday imports** say when they're paused for the Switch.
9. **Remembered mappings tab.**
10. **Getting back.**
    - **Guaranteed:** the Imports list.
    - **Tasks Hub items and Phase 17 notices** come only through their owners, never ad hoc.
    - **Before the first Switch:** Phase 17 notices are required.
11. **Words.**
    - Plain labels.
    - No bare "run" or "batch".
    - No "error", "map", "dedupe" or "upsert" in the interface.
    - "Gift batch" only for Phase 15's batches.
12. **Built to repo standards.**
    - **Shared components:** a stepper, a resumable file input, an announcer and a task-list layout, all in `packages/ui`.
    - **One editable grid,** shared with Phase 15.
    - **Pages:** an error boundary, and status streamed rather than cached.
    - **Accessibility:** WCAG 2.2 AA, with reflow to 320 CSS px.
    - **Logs:** IDs only.
    - **Eve:** not shown on Data Tools.
13. **Navigation fixed once.**
    - One visibility decision for the sidebar and Cmd-K, and the dead lists removed.
    - No entry until an import kind is live.
    - A kill switch per kind.
14. **Import drafts** unchanged for 14 days are discarded with their file, and the date is shown 7 days ahead.

## Considered options

| Option                                                     | Why rejected                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| A. Data Tools as the only way in                           | Makes staff leave the screen they're in.                                 |
| C. Owner screens only                                      | No single history; reversal deadlines scattered; no home for the Switch. |
| Sidebar children                                           | Inherit #1979; URL tabs suffice.                                         |
| Card hub home page                                         | Fewer than five destinations.                                            |
| Separate "Fix problems" step                               | An extra screen; problems belong on Review.                              |
| Global "Accept all matches"; confidence scores             | Merges the wrong people; false precision.                                |
| Fields created in everyday imports; cell edits in a Switch | Q16 clause 11; the source export is the reconciliation record.           |
| Time estimates; toast-only completion                      | Phase 23 D29; WCAG 2.2.1 and 4.1.3.                                      |
| Desktop-only screens                                       | WCAG reflow.                                                             |
| Per-task assignments; realtime presence                    | No owner; realtime is disabled pending RLS proof.                        |
| Ad hoc emails or task rows                                 | Phase 17 and ADR-0183 own them.                                          |
| Drafts kept indefinitely                                   | No Retention class.                                                      |
| Eve on Data Tools                                          | Q11's no-AI importer.                                                    |

## Consequences

**Owner requirements, in order of work.** O98, O99 and O101 gate any release; O93 gates People imports; O94 gates Gift files.

| Order | Requirement | Owner and scope                                        |
| ----- | ----------- | ------------------------------------------------------ |
| 1     | **O98**     | Phase 12 with the shell owner: one visibility decision |
| 2     | **O99**     | Phase 29: resumable upload                             |
| 3     | **O101**    | Signed-in accessibility checks                         |
| 4     | **O93**     | Phase 9: People list action and import filter          |
| 5     | **O94**     | Phase 15: Gift file entry and shared grid              |
| 6     | **O95**     | Phase 4: import-filed duplicates with origin           |
| 7     | **O97**     | Tasks Hub projection                                   |
| 8     | **O96**     | Phase 17 notices, before the first Switch              |
| 9     | **O100**    | Phase 40 tab                                           |

**Discrepancies:** D74–D82.

**Monitors** M-Q19-1 to M-Q19-7:

- drafts reaching Confirm below 60% a quarter;
- median upload-to-Confirm time above 15 minutes for small People imports;
- imports stalled for 15 minutes;
- error-boundary hits above 0.5% of views;
- automatic draft discards above 30%;
- import support contacts above 5 per 100 imports;
- median "Needs attention" share above 25%.
