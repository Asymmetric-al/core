# Phase 30 user stories, part 4: Data Tools, access and operations

Stories 363–461 of the Phase 30 specification's continuous numbered list.

This part specifies the Data Tools area of Mission Control (Q19 clauses 1–3 and 8–13), Data Tools permissions (all fourteen clauses of Q20), and the governance rules and operating signals that keep Phase 30 safe in production (Q21 and the ratified monitors of Q3 to Q21). The import page journey, everyday import rules, Switch steps and import reversal are specified in the other parts; this part covers them only where Data Tools surfaces or guards them. Every Phase 30 story, in this part and in every other part, also inherits the Common safeguards below, so acceptance criteria state only what a story adds. Owner requirements (O#) are identified but not yet agreed; a story that depends on one cannot be accepted until its owner delivers it.

## Common safeguards (apply to every Phase 30 story)

- **CS1.** For a Data Tools holder, an import, draft, held row, download or remembered mapping whose ID is unknown or belongs to another ministry returns not found, identical to one that never existed. A person without Data Tools access sees the no-access page at every Data Tools address, identical whether or not the import exists. Nothing about another ministry's imports is ever named or counted. [Q19 clause 12, AC25; Q20 clause 10]
- **CS2.** Tenant, actor, confirmer, reviewer and every timestamp come from server context and are never accepted from the browser. [Q19 clause 12; Q20 clause 6, clause 11, P4]
- **CS3.** Every page, action, projection, download and batch of rows checks authority through Phase 12's single decision point at that moment, and holding a Data Tools permission never widens what a target owner allows. [Q20 clause 11, P1; C16]
- **CS4.** When the permission service is unavailable, Data Tools fails closed: pages show the no-access page, no action runs and running imports pause until authority can be re-checked. [Q20 clause 14, E28]
- **CS5.** No browser-side grant exists on import, staging, plan, held-row or mapping records, and pages read them only through server projections that apply the visibility rules. [Q19 clause 12; Q20 clause 5]
- **CS6.** Import status changes only through server commands and moves only forward, with one exception: an import that stopped after a batch as Needs attention with unprocessed rows remaining can be resumed back to Importing by a person holding every permission it needs, on the same import record, plan revision and idempotency records, and never as a competing import. Done and Discarded never change. An import reversal is a separate record and never rewrites the import's status, and the import record's history of who did what is append-only. How held-row review interacts with the end states is fixed during implementation against Phase 23 D29's terminal model, without weakening these rules. [Q19 clause 7, I2; Q20 clause 11, P4; ADR-IM-020]
- **CS7.** Confirm is idempotent per plan revision, every row write and held-row review is idempotent per row and plan revision (Gift rows also per payout key), and a save against a stale plan revision is refused without losing either person's work. [Q19 clause 4, clause 5, I5; Q20 clause 6]
- **CS8.** Logs, traces, error reports, job payloads, signals and audit entries carry identifiers, counts, stages and safe codes only, never file names, import names, headers or cell values. [Q19 clause 12, AC28; Q5 clause 8; Q15 clause 12; O71]
- **CS9.** No import content (file, header, sample value, problem output or screenshot) reaches any AI, any hosted or embedded importer service or any host outside Asym, and the Eve panel is absent on Data Tools. [Q11 clause 5; Q19 clause 12]
- **CS10.** No import, held-row review, resume or import reversal triggers an automation, field-change trigger, message, welcome, goodbye or receipt, and none of them lifts or loosens a restriction, opt-out or block. An Everyday import, including the review of its held rows, records no consent and grants no email permission: a dated opt-in in the file is kept as evidence only, a restriction column only ever adds a restriction, and a Gift file only ever creates draft gift batches. A Gift file's rows are ordinary current gifts, never import-origin and never Recorded outside Asym: the Gift file's Confirm posts and receipts nothing, and once a person posts its draft gift batches in Contributions, Phase 15 issues their receipts and thank-yous under Phase 7/14 rules and their gift-triggered effects follow as for any gift first recorded in Asym. A Switch run changes consent only as Q9 ratifies: every Imported restriction commits restrict-only and before any Adopted email permission, and an Adopted email permission is created only for a qualifying member of a moved list, through that list's published Consent adoption disposition, and starts on Adoption hold. A Legacy Tail Backfill applies its contact facts only to restrict. An import reversal never removes a restriction or opt-out, and removing a list membership is never an unsubscribe and never records or lifts a block. Of everything an import reversal sets in motion, only Phase 15's own reversal of a posted gift batch has donor-visible effects, under Phase 15's rules. [Q1 clause 6; Q4 clause 1 (Q12 amendment); Q7 clause 1; Q9 clauses 1, 3, 5; Q12 clauses 1, 6, 7; Q18 clauses 3, 4, 8; Q19 I7; C5; C10; C23; ADR-IM-012]
- **CS11.** Every time is stored in UTC and shown as an absolute date and time in the ministry's named time zone, with any relative wording as visible text beside it. [Q19 clause 3, AC23]
- **CS12.** Interface copy is plain, uses the ratified glossary terms and none of their _Avoid_ alternatives, never uses a bare "run" or "batch", "error" as a status, "map", "dedupe" or "upsert", and every problem says what happened and one next step. [Q19 clause 11]
- **CS13.** Every surface meets WCAG 2.2 AA, including full keyboard operation with visible focus, polite announcement of status changes, reflow to 320 CSS px, 24 CSS px targets, status shown by colour plus icon plus words, and no time limit that loses work. [Q19 clause 7, clause 12]
- **CS14.** Every UI addition uses the exact base-maia style, Base UI primitives, semantic tokens and shared components owned by the shared UI package, with no app-local fork, second grid or other component system. [Q19 clause 12]
- **CS15.** Every list, review group, filter and search pages, filters and sorts on the server across the whole set, never only on the loaded page. [Q19 clause 3, clause 12]
- **CS16.** Twenty CRM is never read, written, synced, used as a fallback or treated as migration authority by any Phase 30 path. [C12]
- **CS17.** No Asym identity can make or hold a Switch decision or any Data Tools permission, with one exception: Asym's named legal role may place a Legal hold, and release it with a reason, through its own Phase 12 legal-hold capability rather than any Data Tools permission, without reading any content. Asym help access acts only through its own allow-list with every action attributed "{name} · Asym". [Q5 clause 1, clause 5; Q15 clause 9; Q20 clause 12, P6; ADR-IM-015; O74]
- **CS18.** Every surface, download, Tasks Hub item and notice follows the restricted-data floor and Phase 10 aliases: restricted people appear only by alias, and un-narrowed Switch export content is hidden from anyone not cleared. [Q5 clause 4; Q20 clause 5; C17]
- **CS19.** No Asym-side fact about a record is shown, downloaded or counted differently for someone who cannot see that record, and counts are whole-file and identical for every viewer. [Q20 clause 5, P2, P3]
- **CS20.** Rows are written only under the authority of the person who confirmed, reviewed or resumed them, and every step, decision, sensitive-permission use, download and resume is attributed in the import record and Phase 12's audit. [Q20 clause 6, clause 11, P4]
- **CS21.** Every stored Phase 30 artifact has a Retention class, and nothing without one is stored. [Q15; Q19 clause 14]
- **CS22.** Every imported file passes the File safety check, including a malware scan Asym runs itself, before it is stored or read, with no structural-only exception. [Q21 part 3; Q14 clause 6]

## Data Tools area and navigation (Q19)

363. As a ministry staff member with Data Tools access, I want one "Data Tools" entry in the sidebar's System group next to Admin, with no sidebar children, so that the Switch and every import I can work on have one findable home. [Q19 clause 1; ADR-IM-019; O98]
     - **Acceptance:**
       - The sidebar shows exactly one entry labelled "Data Tools", in the System group immediately beside Admin.
       - The entry never expands into child entries, so collapsing the System group or closing the mobile sidebar never hides a Data Tools tab.
       - The entry is reachable by keyboard, shows visible focus and has the accessible name "Data Tools".
       - Neither "Data tools" in lower case nor "import center", "data management" or "migration hub" appears anywhere in the interface.
364. As a ministry staff member with Data Tools access, I want Imports, Switch and Remembered mappings as tabs that each have their own address, and later tabs added without renaming anything, so that I can bookmark, share and return to exactly the tab I was using. [Q19 clause 1, clause 11; ADR-IM-019; O100]
     - **Acceptance:**
       - The tabs read exactly "Imports", "Switch" and "Remembered mappings", each opens from its own address, and the browser's back and forward buttons move between visited tabs.
       - Reloading keeps the selected tab and any list state held in its address.
       - The tabs are keyboard operable, expose the selected tab to assistive technology and stay reachable without clipping at 320 CSS px.
       - When a later owner adds a tab, such as Phase 40's data quality, the area name, the existing tab labels and their addresses are unchanged, and every existing link opens the same tab.
       - An added tab takes its visibility from the same server-side decision as the Data Tools entry and creates no sidebar child.
365. As a Switch lead, I want Data Tools to open on the Switch tab until go-live and on Imports afterwards, with a Switch banner while Switch tasks need attention, so that I land where the most important work is. [Q19 clause 8; Q1 clause 12 (Q4 amendment); Q4 clause 4; Q15 clauses 3 and 9; ADR-IM-004; ADR-IM-015; ADR-IM-019]
     - **Acceptance:**
       - While the ministry has a Switch that has not gone live, opening the Data Tools entry lands on the Switch tab.
       - When the ministry has no Switch, or its Switch has gone live, opening the entry lands on the Imports tab.
       - After go-live, the Imports tab shows a banner in text linking to the Switch tab while at least one Switch task is Needs attention, and shows no banner when none is.
       - After Switch closed, the entry still lands on Imports, the Switch banner follows the same rule as before (shown while at least one Switch task is Needs attention, and absent when none is), and the Switch tab is a read-only record. Steps that remain possible after Switch closed stay available to people allowed to take them, including the decommission checklist and its sign-off, Verify your copy before the final export's deletion, and placing or releasing a Legal hold.
       - A direct address to either tab always opens that tab for a person allowed to see it, whatever the landing rule would choose.
366. As a ministry staff member on the People list, I want an "Import people" action that opens a new People import in Data Tools, so that I can start an import from where I already work. [Q19 clause 2; ADR-IM-019; O93]
     - **Acceptance:**
       - "Import people" opens a new People import on its Data Tools import page with People import already chosen, Data Tools breadcrumbs and a link back to the People list.
       - The link back restores the People list as it was, including its filters, sort and page.
       - The action appears only to a person who may prepare an import while the People import kind is switched on for the ministry, and is absent for everyone else.
       - Between the Switch Boundary and go-live the action reads "Paused during the Switch, from {Boundary} until go-live." in visible text and starts nothing.
367. As a finance staff member in Contributions, I want "Upload a Gift file" beside New batch that opens a new Gift file in Data Tools, so that payout and deposit reports start where gift batches live. [Q19 clause 2; ADR-IM-019; O94]
     - **Acceptance:**
       - "Upload a Gift file" sits beside New batch and opens a new Gift file on its Data Tools import page with Gift file already chosen, Data Tools breadcrumbs and a link back to Contributions.
       - The link back restores Contributions as it was.
       - The action appears only to a person who may prepare an import while the Gift file kind is switched on for the ministry, and is absent for everyone else.
       - Between the Switch Boundary and go-live the action reads "Paused during the Switch, from {Boundary} until go-live." in visible text and starts nothing.
368. As a ministry staff member whose import has finished, I want the import page to link to what it created, so that I can check the results where I normally work. [Q19 clause 2; ADR-IM-019; O93; O94]
     - **Acceptance:**
       - A finished People import offers "View these people", which opens the People list filtered to people added or changed by that import, with a link back to the import page.
       - A finished Gift file lists every draft gift batch it created, each linking to the batch in Contributions, and each batch links back to the Gift file.
       - A Gift file that created several gift batches lists all of them, with none omitted.
       - The filtered People list shows only people the viewer may see, with Phase 10 aliases applied.
369. As a ministry staff member, I want the screens that carry import shortcuts to have no dead or unexplained disabled buttons, so that every control I see either works or tells me why it can't. [Q19 clause 2; ADR-IM-019]
     - **Acceptance:**
       - Before either shortcut ships, the CRM "New Record" button and the Contributions "Add Contribution" button are removed or perform a working action.
       - Every button on the People list and Contributions screens either performs its action or states in visible text, never only in a tooltip, why it cannot.
       - A person whose Data Tools access does not let them use the flow, or whose ministry has that import kind switched off, sees no shortcut at all.
       - A shortcut that is shown is never a dead button and is never disabled without a written reason in visible text; between the Switch Boundary and go-live it reads "Paused during the Switch, from {Boundary} until go-live." and starts nothing.
       - An automated check that activates each visible button on both screens finds none that does nothing without stating in visible text why it cannot act.
370. As the Asym operations owner, I want each import kind to have its own kill switch, with the Data Tools entry appearing only once a kind is on, so that no one meets an empty area and a fault in one kind stops without affecting the others or losing any import record. [Q19 clause 13; ADR-IM-019]
     - **Acceptance:**
       - With every import kind switched off for the ministry, no sidebar entry, Cmd-K result, tile or shortcut for Data Tools appears, and switching the first kind on makes the entry appear at the next page load for people the visibility decision includes.
       - Shortcuts and start actions appear only for kinds that are on, so with People import on and Gift file off, "Import people" shows and "Upload a Gift file" does not.
       - Switching a kind off removes its start actions and shortcuts at the next page load, while other kinds keep working.
       - An import of that kind that is Importing stops after its current batch of rows as Needs attention with the reason in plain words, and one that is Waiting to start does not start while the kind is off and says why.
       - After the kind is switched back on, an eligible person can resume an import that stopped this way, and Prepare reversal stays available within its window throughout.
       - Every import record of that kind stays readable at its address to permitted people while the kind is off.
371. As a ministry staff member, I want the sidebar, Cmd-K, tiles and every other menu to show Data Tools from one server-side decision based on my permissions, never my role's name, so that exactly the right people see it and no stale menu offers another way in. [Q19 clause 13; Q20 clause 14; ADR-IM-019; ADR-IM-020; O98]
     - **Acceptance:**
       - A person the decision includes sees both the sidebar entry and the Cmd-K result, and a person it excludes sees neither.
       - A staff member whose role is named "admin" but who holds no Data Tools permission sees neither.
       - Granting or removing a Data Tools permission changes the sidebar and Cmd-K together at the next page load, and the browser never receives an entry the decision hides.
       - The two dead menu lists are removed, and no Mission Control menu, tile or command offers a route the decision would hide.
       - The tile catalog and Eve's page list name Data Tools with the same label and gating, and the Eve panel still does not appear on Data Tools pages.

## Imports list and Remembered mappings (Q19)

372. As a ministry staff member with Data Tools View access, I want the Imports list to show every People import, Gift file and Switch run, newest first, so that all import work is in one place. [Q19 clause 1, clause 3; Q20 clause 9; ADR-IM-019; ADR-IM-020]
     - **Acceptance:**
       - The list includes every People import, Gift file and Switch run of the ministry, including other people's drafts, newest first.
       - Practice runs never appear in the Imports list and are listed on the Switch tab instead.
       - Web Studio content imports, the missionary self-import, Field Account opening and church remittances never appear in the list, its counts or its filters, and Data Tools offers no start action for them.
       - Imports of other ministries are never listed or counted.
373. As a ministry staff member, I want each Imports list row to show name, kind, status, started by, when, rows, outcome counts and reversal deadline, so that I can judge any import at a glance. [Q19 clause 3, clause 7; Q20 clause 4, clause 9; ADR-IM-019; ADR-IM-020]
     - **Acceptance:**
       - Each row shows all eight columns, and a new import's name is the kind plus date and time, for example "People import, 4 Nov 2026, 10:42", never the file name.
       - Status shows colour, an icon and words from the one status vocabulary, with any import reversal state as a second label.
       - "When" and the reversal deadline show an absolute date and time with the ministry's named time zone.
       - Gift file amounts appear only to people who can see contributions, and everyone else sees the same rows with counts only.
       - At 320 CSS px every column stays reachable through the responsive layout without sideways scrolling, with no clipped control.
374. As a ministry staff member with Data Tools Manage access, I want to rename an import, so that my team recognises it without file names appearing in a shared list. [Q19 clause 3; Q20 clause 9; ADR-IM-019; ADR-IM-020]
     - **Acceptance:**
       - A Manage holder can rename an import, and the new name shows in the list and on the import page, with the change attributed to them and timed.
       - View holders see no rename action.
       - An empty name is refused with a message saying a name is needed, and the previous name stays.
       - No import name, before or after renaming, appears in logs, traces or error reports.
375. As a ministry staff member, I want to filter the Imports list by Needs attention, kind, status, person and date, with Needs attention first, so that I find what needs me quickly. [Q19 clause 3; ADR-IM-019]
     - **Acceptance:**
       - "Needs attention" is the first filter offered, and choosing it returns every import in that status across all pages.
       - Kind, status, person and date filters combine and apply on the server to the whole list.
       - Filter choices are held in the address, so a reloaded or shared link shows the same filtered list.
       - When no import matches, the list says so and offers to clear the filters, distinct from the state with no imports at all.
       - Every filter has a visible label and is keyboard operable, and the number of results is announced politely.
376. As a ministry staff member who left an import, I want the Imports list to be the guaranteed way back to it, and nothing more, so that I can always find an import even if no notice reached me. [Q19 clause 3, clause 10; ADR-IM-019]
     - **Acceptance:**
       - The list is paged on the server with a correct total, and every import of the ministry is reachable by paging or filtering.
       - An import whose notice or Tasks Hub item failed or was never created is still reachable from the list.
       - The list and its filters never show or search a supporter's name, a gift or any cell value.
       - The list is never labelled as record history, and what happened to a record is shown on that record.
377. As a ministry staff member opening Data Tools before any import exists, I want an empty Imports list that explains what imports do and offers only the start actions I may take, so that I know how to begin. [Q19 clause 3; ADR-IM-019]
     - **Acceptance:**
       - With no imports, the Imports tab explains in plain words what a People import and a Gift file do.
       - It offers a start action for each kind that is switched on and that the person may prepare, and no other.
       - A View holder sees the explanation with no start action.
       - The empty state, the no-match state, the loading state and the no-access page are visibly different.
378. As a ministry staff member with Data Tools Manage access, I want the Remembered mappings tab to list each source's remembered mappings with when and by whom each was last used, and to let me rename or delete them, so that stale or confusing mappings stop being offered. [Q19 clause 9; Q11 clause 2; ADR-IM-011; ADR-IM-019]
     - **Acceptance:**
       - The tab groups remembered mappings by source and shows, for each, the last-used date and time in the ministry's named time zone and the name of the person who last used it.
       - Only the ministry's own remembered mappings appear, never another ministry's and never an entry from Asym's Common-header list.
       - A Manage holder can rename a remembered mapping, and the change is attributed.
       - Deleting asks for confirmation naming the mapping, and afterwards a file with exactly matching headers is no longer offered a "Remembered" match from it.
       - Renaming or deleting never changes the mapping version recorded on any existing draft or finished import.
       - View holders see no rename or delete action.

## Getting back to imports (Q19)

379. As a ministry staff member, I want imports that need a person to appear in the Tasks Hub through its registered projection, so that waiting work reaches my normal work queue. [Q19 clause 10; ADR-IM-019; O97]
     - **Acceptance:**
       - An import with decisions waiting, or in Needs attention, appears as one Tasks Hub item that links to its import page.
       - The item disappears once the import no longer needs a person, because it is derived from the import's state and never stored separately.
       - No import row is ever written to the legacy Mission Control task table.
       - The item's text names the import and its state and contains no file name or cell value.
       - Until O97 is delivered, no Tasks Hub item appears and the Imports list remains the way back.
380. As a Switch lead, I want import and Switch notices delivered only through Phase 17's staff notifications, and no Switch started before those notices exist, so that I am told once about anything waiting on me. [Q19 clause 10; Q5 clause 1; ADR-IM-005; ADR-IM-019; O96]
     - **Acceptance:**
       - A Finished or Needs attention notice is delivered in-app, and by email only if it stays unread, through Phase 17, with a link to the import page.
       - Each event produces one actionable notice, never duplicating a Tasks Hub item for the same import.
       - Data Tools has no email sender of its own, and no notice or reminder reaches anyone by another path or as a task row.
       - While Phase 17 staff notices for Data Tools are not live, no ministry can start a Switch.
       - Switch-lead notices and reminders go to the current Switch lead, and after reassignment only to the new lead.
       - Every item a notice refers to is also visible on the Switch task list or the Imports list.

## Words and build standards (Q19)

381. As a ministry staff member, I want Data Tools to use one plain vocabulary and every problem message to say what happened and one next step, so that I understand every label and can act without asking for help. [Q19 clause 11; ADR-IM-019]
     - **Acceptance:**
       - The area and tabs read Data Tools, Imports, Switch and Remembered mappings, import terms read People import, Gift file, Practice run, Waiting row and Prepare reversal, and "Gift batch" appears only for Phase 15's batches.
       - An automated copy check across every Data Tools string finds no bare "run" or "batch", no "error" used as a status, and no "map", "dedupe" or "upsert".
       - No avoided glossary alternative appears, for example "Undo import", "import wizard", "completed with errors" or "dry run".
       - Every problem message states what happened and exactly one next step, never relying on an internal code, stack trace or raw identifier as its only explanation.
       - A problem tied to a field, row or file is shown beside it and programmatically associated with it.
382. As a ministry staff member, I want Data Tools built from the shared design-system components, so that it looks and behaves like the rest of Mission Control. [Q19 clause 12; ADR-IM-019; O94; O99]
     - **Acceptance:**
       - The stepper, the file input with drop zone and resumable transfer, the live-region announcer and the task-list composition are shared components in the shared UI package, with no app-local copy.
       - Cell fixing uses Phase 15's shared accessible editable grid, every list uses the shared responsive data table (DataTableResponsive), and no other grid exists in Data Tools.
       - Every Data Tools page uses the shared page shell (PageShell).
       - Resumable transfer depends on O99, and the shared editable grid depends on O94.
383. As a ministry staff member, I want a section that fails to load to keep the import's identity and tell me the import is safe, so that a display fault never looks like a lost import. [Q19 clause 12; ADR-IM-019]
     - **Acceptance:**
       - A failing read on an import page shows "This page couldn't load. Your import is safe." with the import's name and a link back to the Imports list.
       - The failure is contained to that page section by a segment error boundary, and the sidebar, tabs and other Data Tools pages keep working.
       - The import keeps running in the background unaffected.
       - The error report carries the import ID and a safe code only.
384. As a ministry staff member watching an import, I want its status current for my ministry and refreshed only while it is active, so that I always see the truth without needless load. [Q19 clause 12; ADR-IM-019]
     - **Acceptance:**
       - Status is read per request for the signed-in person's ministry and streamed into the page, never served from a cache shared between ministries or people.
       - The page refreshes status only while the import is Checking file, Waiting to start, Importing or Stopping, and stops refreshing once it reaches any other state.
       - Refreshing pauses while the browser tab is hidden and resumes with a fresh read when it becomes visible.
       - No live push channel or presence indicator is used.
385. As a keyboard-only or screen-magnifier user, I want every Data Tools page to work by keyboard alone and at 320 CSS px, so that I can do the whole job without a mouse or a wide screen. [Q19 clause 12; ADR-IM-019; O101]
     - **Acceptance:**
       - A complete People import, from the People list shortcut to its results, finishes keyboard-only in an end-to-end test.
       - Every Data Tools route passes signed-in automated accessibility checks at 1280, 768 and 320 CSS px with no serious or critical violation.
       - At 320 CSS px every step and list works without scrolling in two directions, except review tables, which may scroll sideways.
       - Every interactive target is at least 24 by 24 CSS px or meets WCAG 2.2's spacing exception.
       - Signed-in accessibility checks depend on O101.
386. As a screen-reader user, I want status changes announced politely and no time limit that loses my work, so that I never miss what happened or lose what I did. [Q19 clause 7, clause 12; ADR-IM-019]
     - **Acceptance:**
       - Each status change is announced once through the shared polite announcer, without moving focus.
       - Status is always conveyed by colour, an icon and words together.
       - Work saved before a session expires is all there after signing in again, at the same step.
       - No Data Tools page discards input because of time spent on it.
387. As a ministry staff member, I want the Eve assistant panel absent on Data Tools pages, so that no source value can be pasted into an AI from the import journey. [Q19 clause 12; Q11 clause 5; ADR-IM-011; ADR-IM-019]
     - **Acceptance:**
       - The Eve panel and its opener are absent on every Data Tools address, including every tab and import page.
       - Leaving Data Tools restores the Eve panel where it normally appears.
       - No request made from a Data Tools page reaches any AI service.

## Data Tools access levels (Q20)

388. As an Owner, I want Data Tools access shown as one row with View, Manage and Admin levels, so that I can give each person the right access without studying a long permission list. [Q20 clause 1; ADR-IM-020; O102]
     - **Acceptance:**
       - Phase 12's access settings show one Data Tools row with View, Manage and Admin, each described in plain words.
       - View lets a person open the menu and the Imports list and see statuses, counts and who, with no values and no actions.
       - Manage adds preparing (upload, columns, values, decisions, fixing cells, downloading the file's rows) and confirming.
       - Admin adds Replace and Clear, Reverse imports and Run the Switch, and a Manage holder sees none of those actions.
       - Depends on O102.
389. As an Owner, I want Replace and Clear, Reverse imports and Run the Switch to be Phase 12 sensitive permissions on the Admin level only, so that bulk overwrites, import reversals and Switch decisions get Phase 12's added care. [Q20 clause 1; ADR-IM-020; O102]
     - **Acceptance:**
       - A check that runs before release refuses any configuration that places one of these permissions on the View or Manage level.
       - These permissions are granted only through Phase 12's sensitive-grant flow, and each grant and each use is recorded in Phase 12's audit.
       - Using one needs no second person and no typed phrase.
       - Every Data Tools permission has a dotted key minted under Phase 12's rules.
390. As an Owner, I want to grant a single Data Tools permission on its own, such as Prepare without confirming, so that a helper can prepare an import without being able to confirm it. [Q20 clause 1; ADR-IM-020]
     - **Acceptance:**
       - A person granted only Prepare can upload, choose columns and values, make decisions, fix cells and download their file's rows.
       - That person sees no Confirm, and the page says in plain words that confirming needs a permission they do not hold.
       - A confirm request sent to the server by that person is refused.
391. As an Owner, I want only the Owner group to start with Data Tools, View or Manage added to any group or person in one step, and clearance kept outside every level, so that no one gains import power or sight of protected people by default. [Q20 clause 2; ADR-IM-020; O102]
     - **Acceptance:**
       - At launch the Owner group holds Data Tools Admin, no other seeded group holds any Data Tools permission, and existing users outside the Owner group hold none until someone grants one.
       - Adding View or Manage to a group or a person is one action, recorded in Phase 12's audit.
       - Members of a large group given Manage can prepare and confirm but still cannot use any Admin-level permission.
       - Removing a grant takes effect at once and leaves every import record intact.
       - Granting any Data Tools level, including Admin, grants no clearance, so an Owner without clearance sees restricted people only by alias, cannot narrow a Switch file and cannot review held rows for people they can't see.
       - A cleared person without Data Tools Manage cannot review held rows.
392. As an Owner, I want Run the Switch to be the one permission for every Switch decision, so that it is always clear who may decide each step. [Q20 clause 3; Q5 clause 1; Q15 clause 9; ADR-IM-005; ADR-IM-015; ADR-IM-020; O74]
     - **Acceptance:**
       - Starting a Switch, census answers, dispositions, attestations, plan and match decisions, reconciliation controls and sign-off, commit, tail closure, decommission, reassigning the lead, Practice copies and Legal holds each require Run the Switch; Asym's named legal role may also place a Legal hold, and release it with a reason, through its own Phase 12 legal-hold capability rather than any Data Tools permission, without reading any content.
       - Apart from a Legal hold placed or released by Asym's named legal role, a person without Run the Switch sees none of those actions on the Switch tab, only each task's status, line and last update, and each is refused if requested directly.
       - One person may hold Run the Switch with every other permission, and no step demands a second person.
       - Being named Switch lead grants no permission.
393. As a Switch lead, I want Switch steps that touch money, history corrections or new fields to also need their owners' permissions, so that Data Tools never widens what another owner allows. [Q20 clause 3; C16; ADR-IM-020]
     - **Acceptance:**
       - A money commit needs Run the Switch and the money owner's permission, and is absent for a person holding only one of them.
       - A history correction is gated by its own Phase 13 correction permission, which Run the Switch does not replace.
       - Creating real fields from Field drafts needs Phase 11's field permission in addition to Run the Switch.
       - Each owner permission is re-checked at the moment of writing, not only when the page loaded.
394. As a Switch lead, I want the Start action for a Switch to appear only once Asym's preconditions are met, so that no Switch starts before it can be done safely. [Q20 clause 3; Q19 clause 10; Q19 clause 13; Q2; Q6 clause 9; Q8 clause 10; Q5 clause 1 as amended by Q19; ADR-IM-002; ADR-IM-006; ADR-IM-008; ADR-IM-020; O12; O19; O20; O29; O30; O31; O36; O37; O38; O39; O40; O96]
     - **Acceptance:**
       - The Start action appears only to holders of Run the Switch, and only when the Switch kind is switched on for the ministry, Phase 17 staff notices for Data Tools are live, and Asym's own Start preconditions are recorded as met: an Approved Practice environment; the O31 pre-real-data fixes, whether or not the ministry has recurring giving; an Approved environment for real personal data, confirmed by its live read-back, with the staff-migration custody profile qualified there; a complete retained-state census; and, for a ministry with recurring giving, O12 and O36 to O40 live. The rest of Q2's later gates, including the signed agreement and a fresh readiness census answered on the started Switch, come before any real export enters any environment, not before Start.
       - While a precondition is unmet, the Switch tab shows the task as "Cannot start yet" with its reason in text, never a disabled button.
       - A start request is refused on the server if a precondition stopped holding after the page loaded.
395. As a cleared ministry member holding Run the Switch, I want narrowing a Switch file to be possible only for people like me, so that restricted content is released only by someone entitled to see it. [Q20 clause 3; Q5 clause 4; ADR-IM-005; ADR-IM-020]
     - **Acceptance:**
       - Narrowing, column by column or by declaring that the file names no restricted person, is offered only to a person holding both Run the Switch and clearance.
       - A person holding only one of the two sees no narrowing action, and the server refuses a narrowing request from them.
       - Each narrowing decision is recorded with who, when and which columns or declaration.
       - Narrowing is offered only on Switch real exports, never on everyday imports.

## Money in Data Tools (Q20)

396. As a finance staff member with Data Tools Manage access, I want to prepare a Gift file freely but confirm it only if I may record contributions, so that draft gift batches are created only by someone allowed to record gifts. [Q20 clause 4; Q12 clause 7; ADR-IM-012; ADR-IM-020]
     - **Acceptance:**
       - A Manage holder without the contribution-recording permission can complete every Gift file step up to Review.
       - For that person Confirm is absent, and the page says in plain words that confirming needs permission to record contributions, so a colleague who holds it can confirm.
       - A person holding Manage and the contribution-recording permission can confirm, and Confirm creates draft gift batches only.
       - The server refuses a Gift file Confirm from anyone lacking either permission.
397. As a ministry staff member without access to contributions, I want Gift file amounts hidden from me while counts stay visible, so that I can follow the work without seeing money I may not see. [Q20 clause 4; Q19 clause 3; ADR-IM-019; ADR-IM-020]
     - **Acceptance:**
       - In the Imports list and on Gift file pages, people who cannot see contributions see counts and no amounts or totals.
       - People who can see contributions see amounts and totals in the same places.
       - Row and outcome counts are identical for both.
398. As an uncleared finance staff member, I want the Funds and values step to show my file's own fund labels and the designations I can see, while fund names in a Switch real export stay with cleared members, so that I can finish a Gift file without exposing a protected worker's fund. [Q20 clause 4; Q11 clause 4; ADR-IM-011; ADR-IM-020]
     - **Acceptance:**
       - A Gift file's Funds and values step lists each fund label from the file and offers only the designations the person may see, with Phase 10 aliases applied.
       - An uncleared finance member can complete that step.
       - A designation the person cannot see is never offered, named or counted differently.
       - In a Switch real export, source fund names appear only to cleared members, before and after narrowing, and others see each fund's counts without its name.

## What people see of records (Q20)

399. As a ministry staff member preparing an import, I want a row's Asym-side facts shown only to people who can see that record, my file's own cells shown to Manage holders and counts identical for everyone, so that an import never reveals people or anyone's access. [Q20 clause 5; Q11 clause 4; ADR-IM-011; ADR-IM-020]
     - **Acceptance:**
       - A match, the matched record, its current values and a row's outcome detail appear only to a person who can see that record, on screen and in any download.
       - A viewer who can see the record sees the full match for the same row, and people who are not cleared see restricted people only by their Phase 10 alias.
       - Manage holders see the file's own cells in an everyday import, and View holders see no cell values.
       - Whole-file counts on the list and the import page are the same for every viewer.
       - With one row matching a restricted person, a cleared viewer and an uncleared viewer see identical counts.
400. As a cleared ministry member, I want the restricted-file floor kept for Switch real exports and not applied to everyday imports, so that Switch files stay protected while ordinary imports stay usable. [Q20 clause 5; Q5 clause 4; ADR-IM-005; ADR-IM-020]
     - **Acceptance:**
       - A Switch real export stays restricted until narrowed: uncleared members, helpers and Asym help see headers, counts and validation summaries only.
       - Where values are hidden, the page explains why in text, for example "Values are hidden until a cleared member narrows this file", rather than looking broken.
       - Everyday imports show the file's own cells to Manage holders with no narrowing step.

## Held for review (Q20)

401. As a ministry staff member preparing an import, I want rows matching a staff member, someone marked deceased or anyone I can't see held with one wording, so that no protected person is revealed. [Q20 clause 6; Q12 clause 4; ADR-IM-012; ADR-IM-020]
     - **Acceptance:**
       - Each such row has the outcome Held for review, worded "Held for review: someone who can see the matching records will review these rows. Nothing has changed for them."
       - The wording is identical whatever the reason, and no reason is shown.
       - For a preparer limited to a region, rows matching people outside that region are held the same way.
       - Held rows are never labelled blocked, failed, quarantined or a restricted match.
402. As a ministry staff member, I want held rows never created as new people, never showing the match and never changing the counts, so that a protected worker's legal name never lands on an unprotected record. [Q20 clause 6; ADR-IM-020]
     - **Acceptance:**
       - A held row creates no person and writes nothing when the import is confirmed.
       - A held row shows no matched record, name, alias or link.
       - Outcome counts with held rows equal those shown to a viewer who can see every matched record.
       - The rest of the import goes ahead and can finish while rows stay held.
       - An uncleared confirmer's Confirm never writes held rows.
403. As a Data Tools Manage holder who can see the matched records, I want to review held rows after commit and commit them under my own permissions on the same import, so that held work finishes under the right authority. [Q20 clause 6; ADR-IM-020; O97]
     - **Acceptance:**
       - After commit, any Manage holder who can see a held row's matched record, including the preparer, can review that row on the import page.
       - The reviewer's choices are committed under the reviewer's own permissions and recorded on the same import with their name and time.
       - Rows the reviewer cannot see remain held for someone who can.
       - A Tasks Hub item reaches only people eligible to review and names no person or record.
       - A held row moves only forward, from held to reviewed or to expired, and two reviewers can never both commit the same row.
404. As a ministry staff member, I want held rows not reviewed by the file's deletion date to become "Left out: not reviewed in time", with that date shown, so that held rows never wait forever. [Q20 clause 6; Q15; ADR-IM-015; ADR-IM-020]
     - **Acceptance:**
       - The import page shows the review deadline, 30 days after commit, as an absolute date and time with the ministry's named time zone.
       - At the deadline every row still held becomes "Left out: not reviewed in time", and its count moves from held to left out.
       - A row reviewed before the deadline keeps its reviewed outcome, and a review submitted after it is refused with the reason.
       - Rows left out this way appear in the own-file download with that reason.
405. As a Data Tools Admin, I want a setup notice whenever nobody with Data Tools Manage has clearance, so that held rows for protected people can always be reviewed. [Q20 clause 6; ADR-IM-020]
     - **Acceptance:**
       - Data Tools Admins see one setup notice while no Data Tools Manage holder has clearance.
       - The notice explains what to grant so held rows can be reviewed.
       - The notice disappears once at least one Manage holder has clearance.
       - People without Data Tools Admin never see it.
406. As a Phase 12 security holder, I want held matches to protected people counted in the restricted-access audit and budget without plaintext, so that probing names through imports is noticed. [Q20 clause 6; ADR-IM-020; O104]
     - **Acceptance:**
       - Each held match to a protected person creates one restricted-access audit entry carrying identifiers only.
       - Those entries count against the uploader's restricted-read budget.
       - No such audit entry contains a name, file name or cell value.
       - The accepted residual, that an uploader who knows a held person is neither staff nor deceased can infer the record is protected or outside their access, is recorded in the spec and not treated as a defect.
       - Depends on O104.

## Fields and downloads (Q20)

407. As a ministry staff member, I want to be offered only fields I may edit, and to see which columns won't be written when someone else confirms, so that no column is written without authority or dropped silently. [Q20 clause 7; ADR-IM-020]
     - **Acceptance:**
       - The Columns step offers only fields the preparing person may edit.
       - When a different person confirms, Review lists "Won't be written: you can't edit {field}" for each chosen field that person can't edit, and those columns are left out on Confirm.
       - The list appears on Review before Confirm is pressed.
       - The write path re-checks edit rights and never writes a field the writer can't edit.
408. As a Data Tools Manage holder, I want to download my file's problem, left-out and held rows with their reasons, so that I can fix them outside Asym and upload again. [Q20 clause 8; ADR-IM-020]
     - **Acceptance:**
       - Manage holders can download the import's problem, left-out and held rows, and View holders see no download.
       - The download contains only the file's own cells and a plain reason per row, never an Asym-side value.
       - Held rows are included with the Held for review reason, and the row count equals the count on screen.
409. As a ministry staff member with the ministry's export permission, I want downloads that contain Asym data to follow the existing export rules, so that import results never become a back door for exporting. [Q20 clause 8; ADR-IM-015; ADR-IM-020]
     - **Acceptance:**
       - Results lists and Switch Waiting-row downloads appear only to holders of the ministry's existing export permission and contain only exportable fields of records they can see.
       - Protected people are never included.
       - A person without export permission sees no Asym-data download but, holding Manage, can still download their file's own rows.
       - Downloads beyond Phase 12's export budget meet Phase 12's existing step-up or denial.
410. As a ministry staff member, I want every Data Tools download streamed, text-typed, formula-safe and capped at 1,000,000 rows, so that downloads open safely and are never kept. [Q20 clause 8; Q15 clause 4; ADR-IM-015; ADR-IM-020]
     - **Acceptance:**
       - Every download is generated on request and streamed, and no copy remains stored after it completes.
       - Every cell is written as text through the one shared encoder, so a value beginning with "=", "+", "-" or "@" opens as text and leading zeros, long numbers and dates are unchanged.
       - Each download writes one audit entry with identifiers and counts only.
       - A download of exactly 1,000,000 rows succeeds, and a request for more is refused with a prompt to filter first.

## Shared work and people without access (Q20)

411. As a Data Tools Manage holder, I want to continue any colleague's draft with every change attributed, so that work doesn't stall when someone is away or leaves. [Q20 clause 9; ADR-IM-020]
     - **Acceptance:**
       - Any Manage holder can open and continue any import draft of the ministry.
       - Every change records who made it and when, visible on the import page.
       - A save against an older plan revision is refused with the other editor's name and time, for example "Maria changed this at 10:42. Reload to see her changes.", and no change is lost.
       - A draft whose preparer has left the ministry stays available to other Manage holders until it is discarded.
412. As a ministry staff member, I want new imports named by kind plus date and time, with the file name shown only to Manage holders on the import page, so that personal data in file names never reaches a shared list. [Q20 clause 9; Q19 clause 3; ADR-IM-019; ADR-IM-020]
     - **Acceptance:**
       - A new import is named like "People import, 4 Nov 2026, 10:42", in the ministry's time zone.
       - The file name appears only on the import page, and only to Manage holders.
       - The Imports list, Tasks Hub items and notices show the import name, never the file name.
       - A long or non-Latin file name is shortened on screen with the full name available to Manage holders.
       - A file name containing a person's name never appears in logs, traces or error reports.
413. As a ministry member without full Data Tools access, I want a clear page or line telling me what I can do and how to ask for more, so that I never hit a dead end and nothing is revealed. [Q20 clause 10; ADR-IM-020; O103]
     - **Acceptance:**
       - A person with no Data Tools permission sees no menu entry, Cmd-K result or shortcut.
       - Every Data Tools address, whether for an import that exists, one that does not or one from another ministry, shows that person the identical page "You don't have access to Data Tools." with Request access, naming no one.
       - Request access creates a "Request access to Data Tools" request in Phase 12's Access requests, which depends on O103.
       - A Data Tools holder who opens another ministry's import gets not found, identical to an import that never existed.
       - A View holder sees "You can follow this import. Preparing and confirming need Data Tools Manage access." with Request access on every import page, and Manage and Admin holders do not see that line.
       - Actions a View holder can't take are absent, not disabled.

## Authority, helpers and Asym help (Q20)

414. As a ministry staff member who confirmed an import, I want each batch of rows to re-check my authority, Confirm to show when any time-limited access ends, and anyone eligible to resume if I lose it, so that an import never continues under authority nobody holds. [Q20 clause 11; C16; ADR-IM-020]
     - **Acceptance:**
       - Before each batch of rows is written, the confirmer's permissions and clearance are re-checked, and an import Waiting to start re-checks them when it starts and, if they are lost, does not start and states why.
       - When either is lost, including when time-limited access ends, the import stops after the current batch as Needs attention with "Stopped: {name} no longer has permission".
       - Rows already written stay, and Prepare reversal remains available within its window.
       - Any person holding the needed permissions can resume, which writes only the remaining rows, under their own name.
       - When any permission or clearance the confirmer relies on is time-limited, Confirm shows the date, time and named time zone at which it ends, and shows no end time otherwise.
       - No estimate of how long the import will take is shown beside that end time.
415. As an Owner, I want helper grants to be ordinary Data Tools grants with an end date, by default the day the Switch closes, so that a helper's access never outlives the work. [Q20 clause 12; Q5 clause 3; ADR-IM-005; ADR-IM-020; O27; O105]
     - **Acceptance:**
       - Granting a helper Data Tools Manage, or Prepare only, takes an end date that defaults to the day the Switch closes.
       - On its end date the grant ends, and the helper can take no further Data Tools action.
       - When the Switch closes, every helper grant set to end with it is ended.
       - The grant screen states that the grant covers all of Data Tools, not only the Switch.
       - Depends on O105 and O27.
416. As a specialist with Asym help access, I want to see only the Switch tab and its preparation actions, so that my help never reaches the ministry's everyday imports or its values. [Q20 clause 12; Q5 clause 5; ADR-IM-005; ADR-IM-020; O26]
     - **Acceptance:**
       - The specialist sees only the Switch tab, with only mapping, practice runs, issue triage and preparing plan and match proposals available.
       - The everyday Imports list, import names, values before narrowing and every download are unavailable, and their addresses show the specialist nothing about those imports.
       - No commit, decision, attestation, census answer, reconciliation control, upload, consent change, export or grant action is offered.
       - Every specialist action and proposal appears as "{name} · Asym" in the Switch history.
       - Any attempt to grant an Asym identity a Data Tools permission is refused.
       - When the access ends or is revoked, the specialist's running jobs pause at their next batch of rows.
417. As a ministry staff member sharing my screen during coaching, I want a Hide values switch on Data Tools pages, so that no value shows while someone else watches. [Q20 clause 13; Q5 clause 2; ADR-IM-005; ADR-IM-020]
     - **Acceptance:**
       - With Hide values on, every Data Tools page shows headers, counts and validation summaries and no value.
       - It stays on across Data Tools pages and reloads until the person turns it off or the session ends.
       - Turning it on or off never shows more than the person may already see.
       - It affects only the person who turned it on.
       - The switch is keyboard operable, and its state is shown in words and exposed to assistive technology.
418. As an Owner, I want Data Tools to stay switched off until Phase 12 can grant its permissions, so that no stopgap gate admits every staff member. [Q20 clause 14; ADR-IM-020; O102]
     - **Acceptance:**
       - While Phase 12's Data Tools module is absent, no Data Tools entry, shortcut or address responds for any role.
       - No path grants Data Tools access by role name, and today's all-staff admin role confers none.
       - The platform approval drafted in #2281 is never used to grant Data Tools access.
       - Depends on O102.

## Governance and operations (Q21)

419. As the Phase 30 spec owner, I want the missionary self-import's engineering defaults kept as that profile's own configuration, never engine-wide constants, so that staff imports keep their own much larger limits. [Q21 part 2; ADR-IM-021]
     - **Acceptance:**
       - The self-import profile holds, as its own configuration, 50 rows per step, a 60-second run lease, one self-import per ministry, a 90-day hold review, an hourly clean-up cadence, the production backup window and a configurable limit-operator role.
       - Changing any self-import value leaves every staff import profile unchanged, and changing a staff profile leaves the self-import unchanged.
       - File readers take their limits from the qualified profile through one shared reader seam, with no limit fixed inside a reader.
       - The limit operator is configured as a role, and no configuration names a person's handle.
420. As a ministry staff member, I want a second staff import to wait its turn while a missionary's second self-import is refused, so that each profile follows its own ratified rule. [Q21 part 2; Q19 clause 5; Q15 clause 13; ADR-IM-015; ADR-IM-021]
     - **Acceptance:**
       - With one heavy staff job running for the ministry, confirming another staff import shows "Waiting to start, after {name}'s {import} (started {time})", and it starts on its own afterwards with its checks repeated at start.
       - With one self-import running for a ministry, a second self-import is refused, not queued, with a plain reason.
       - Two heavy staff jobs never run at once for one ministry, and another ministry's job is never named or counted.
421. As the Phase 30 spec owner, I want the self-import defaults qualified against measured load before the self-import is activated, so that its starting figures are proven rather than assumed. [Q21 part 2; ADR-IM-021; O70]
     - **Acceptance:**
       - The self-import is not activated until its performance envelope has been measured and recorded.
       - Each default is confirmed or changed against that measurement before activation, and any change is a recorded profile change.
       - The backup window used is read from production retention at activation.
       - The hourly clean-up runs as a self-import cadence on the single Retention sweep mechanism, with no second deletion job.
422. As a ministry staff member, I want every imported file to pass the File safety check with a malware scan Asym runs itself, so that no file enters Asym unscanned. [Q21 part 3; Q14 clause 6; ADR-IM-014; ADR-IM-021; O64; O99]
     - **Acceptance:**
       - Every staff import file and every self-import file, including text, CSV, TSV, XLSX and ZIP, is scanned by Asym's own scanner before it is stored for use or read.
       - No size or type exception skips the scan, including self-import text files up to 10 MiB.
       - A file with an infected verdict stays in quarantine, is never read and is listed with a reason.
       - While the scanner is unavailable, files wait and are not read.
       - The missionary self-import is not activated until Phase 29's scanner is live.
423. As the founder, I want to be the only person who can relax a founder-ratified rule, by re-ratifying it, so that delegated authority can tighten ratified safety rules but never loosen them. [Q21 part 3; ADR-IM-021]
     - **Acceptance:**
       - Any spec, ticket or acceptance text that loosens a ratified clause cites the founder's re-ratification of that clause, or it is rejected in review.
       - A rule added under delegated authority may be stricter than the ratified clause, and any loosening recorded under delegated authority has no effect.
       - The structural-only scanning departure accepted on #2083 is recorded as withdrawn when the tickets are amended.
       - Owner text changes only through that ratification, under the repository's document-authority rules.
424. As the Phase 30 spec owner, I want the missionary self-import to use Phase 29 custody and Phase 30 plans and runs, so that no second import engine is built and later unwound. [Q21 part 1 clause 4; ADR-IM-021]
     - **Acceptance:**
       - Self-import files are held in Phase 29 custody and its plans and runs are Phase 30 plans and runs, with no separate self-import custody, plan, run or source store.
       - The rule that refuses a second import applies only to the self-import, and staff imports queue.
       - The test that forbids "batch undo" is limited to the self-import's own routes, so import reversal stays available to staff imports.
       - The XLSX reader's parser runs inside Asym and is chosen and qualified under Q11 and Phase 29.
425. As the Asym operations owner, I want each import kind switched on for a ministry only after the owner work it depends on is live, so that no kind ships ahead of its foundations. [Q19 clause 13; Q20 clause 14; Q12 clauses 5, 6, 7; Q15; Q18 clauses 8, 12; Q20 clauses 6, 10, 11; C16; C23; ADR-IM-012; ADR-IM-015; ADR-IM-018; ADR-IM-019; ADR-IM-020; O47; O50; O51; O70; O71; O78; O87; O88; O89; O90; O93; O94; O96; O98; O99; O101; O102; O103; O104]
     - **Acceptance:**
       - No import kind can be switched on for any ministry until Phase 12's Data Tools permissions (O102) and then the Data Tools access request (O103) and the counting of held protected matches in the restricted-access audit (O104), the shared visibility decision (O98), resumable upload through the File safety check (O99), the Retention classes and sweep (O70, O71), signed-in accessibility checks (O101) and the means for background jobs to act with the current authority of the person who confirmed, reviewed or resumed them are live.
       - The People import kind also waits for the ratified matching rules (O47), the owner write commands for write modes (O51), the People reversal command and the meaning of archived, with prior-value capture in the same release (O87, O88), effects suppression for import and import reversal writes (O78, O89), and the People list shortcut and import filter (O93).
       - The Gift file kind also waits for Phase 15's file-origin draft batches (O50), the Contributions entry point, the batch links and the shared editable grid (O94), and the Gift file's handoff to Phase 15 for import reversal (O90).
       - The Switch's Start action also waits for Phase 17 staff notices (O96), as one of Asym's Start preconditions, and People imports and Gift files never wait for them.
426. As the Asym operations owner, I want every Phase 30 signal to be content-free and routed to its named owner, so that Asym watches imports without seeing ministry data. [Q5 clause 8; Q19 clause 12; ADR-IM-005; ADR-IM-019]
     - **Acceptance:**
       - Every signal carries only identifiers, stages, dates, counts, shares and safe codes, never a name, file name, header or value.
       - Each raised signal reaches the owner named for it and states the threshold it crossed.
       - A measure at or within its threshold raises nothing.
       - Asym's help log is a content-free tracker of hours and help reasons.

## Operating signals for import reversal (Q18)

427. As the Phase 30 product owner, I want a signal when more than 10% of People imports in a quarter are reversed within their window, across ministries, so that I can review the preview and mapping steps that let bad files through. [Q18; ADR-IM-018; M-Q18-1]
     - **Acceptance:**
       - Each quarter, the signal computes People imports reversed within their window as a share of committed People imports across ministries, from counts only.
       - A quarter at 10.1% raises the signal to the Phase 30 product owner, and a quarter at 10.0% does not.
       - The raised signal lists the reversed imports by ID so their preview and mapping steps can be reviewed.
428. As the Phase 30 product owner, I want a signal when the median share of an import reversal's People items left "Stays as it is", because they changed or became active since, exceeds 50% over a quarter, so that I can tell whether import reversals come too late or the checks are too strict. [Q18; ADR-IM-018; M-Q18-2]
     - **Acceptance:**
       - Each quarter, the signal computes the median, across import reversals, of the share of People items left "Stays as it is" for being changed or active since the import.
       - A median above 50% raises the signal to the Phase 30 product owner and the Phase 9 owner, and a median of 50% or less raises nothing.
       - The raised signal reports, by ID, how long after commit each contributing import reversal was confirmed.
429. As the on-call engineer, I want a signal for any import reversal job that has failed or made no progress for 1 hour, so that I can resume it and open an incident if it repeats. [Q18; ADR-IM-018; M-Q18-3]
     - **Acceptance:**
       - An import reversal job in a failed state, or with no progress for 60 minutes, raises the signal, and one that progressed within the hour does not.
       - The signal carries the import and job IDs and a safe code only.
       - Resuming continues the import reversal without repeating any change already made.
       - A second occurrence on the same import reversal opens an incident.
430. As the Phase 34 owner, I want a signal for any automation, send or field-change trigger caused by an import reversal's writes, so that a suppression failure becomes an incident at once. [Q18; ADR-IM-018; M-Q18-4]
     - **Acceptance:**
       - Any automation, message send or field-change trigger caused by an import reversal's write raises the signal, and zero is the only acceptable count.
       - The signal names the producer and the import reversal by ID.
       - Each occurrence opens an incident to fix the suppression.
431. As the Phase 9 owner, I want a signal for any reversal prior values or plan-edit cell values past their deletion date without a legal hold, so that kept values never outlive the import reversal window. [Q18; Q15; ADR-IM-015; ADR-IM-018; M-Q18-5]
     - **Acceptance:**
       - The Retention sweep reports reversal prior values and plan-edit cell values past their deletion date and not under a legal hold, and any count above zero raises the signal to the Phase 9 owner and the sweep owner.
       - Values under a legal hold never raise it.
       - Each occurrence opens an incident to delete the values and fix the sweep.
432. As the Phase 30 product owner, I want a signal for any wrong-file import reversal followed by erasure, so that I can review that import's file checks and preview. [Q18; ADR-IM-018; M-Q18-6]
     - **Acceptance:**
       - Any import reversal followed by erasure of the people that import affected, through the wrong-file privacy path, raises the signal.
       - The signal identifies the import and its import reversal by ID only.
       - An import reversal not followed by erasure never raises it.
433. As the Phase 9 owner, I want a signal for any import reversal write to a person who was erased, merged or touched, so that a failed owner check becomes an incident. [Q18; ADR-IM-018; M-Q18-7]
     - **Acceptance:**
       - Any write by an import reversal to a person erased, merged or not untouched since the import raises the signal, and zero is the only acceptable count.
       - The signal carries the person and import IDs only.
       - Each occurrence opens an incident to fix the owner check.

## Operating signals for Data Tools (Q19)

434. As the Phase 30 product owner, I want a signal when fewer than 60% of started import drafts reach Confirm, per kind, in a quarter, so that I can find the step with the most drop-off and test it with users. [Q19; ADR-IM-019; M-Q19-1]
     - **Acceptance:**
       - Each quarter, the signal computes, per kind, the share of started drafts that reached Confirm, from IDs-only step events.
       - A kind at 59.9% raises the signal to the Phase 30 product owner, and a kind at 60% does not.
       - The raised signal shows, per step, how many unconfirmed drafts last changed there.
435. As the Phase 30 product owner, I want a signal when the median time from upload to Confirm for People imports under 5,000 rows exceeds 15 minutes, so that I can review the Columns and Review steps. [Q19; ADR-IM-019; M-Q19-2]
     - **Acceptance:**
       - The signal measures the median time from upload completing to Confirm for People imports with fewer than 5,000 rows.
       - A median of 15 minutes 1 second raises the signal, and 15 minutes does not.
       - The signal reports time spent per step so the Columns and Review steps can be compared.
436. As the on-call engineer, I want a signal for any import in Importing with no progress for 15 minutes, so that I can resume it and open an incident if it repeats. [Q19; ADR-IM-019; M-Q19-3; O11]
     - **Acceptance:**
       - An import in Importing whose processed count has not changed for 15 minutes raises the signal, with zero as the only acceptable count.
       - The signal carries the import ID, phase and a safe code, and the import page keeps showing Importing truthfully meanwhile.
       - A worker crash resumes automatically, and repeated failure moves the import to Needs attention when rows were written, or to Failed when nothing was written, with a safe code and a catalog signal to Asym.
       - A second stall on the same import opens an incident.
437. As an engineering owner, I want a signal when Data Tools error-boundary hits exceed 0.5% of Data Tools page views in a week, so that I can fix the failing read. [Q19; ADR-IM-019; M-Q19-4]
     - **Acceptance:**
       - The signal computes, weekly, error-boundary hits as a share of Data Tools page views, by route.
       - A week at 0.51% raises the signal to engineering, and 0.5% does not.
       - Each hit is recorded with the route and a safe code only.
438. As the Phase 30 product owner, I want a signal when more than 30% of drafts in a quarter are discarded automatically, so that I can see where people abandon imports and whether the 14-day window fits. [Q19; Q19 clause 14; ADR-IM-019; M-Q19-5]
     - **Acceptance:**
       - Each quarter, the signal computes drafts discarded at 14 days unchanged as a share of all drafts.
       - A quarter above 30% raises the signal to the Phase 30 product owner, and 30% or less does not.
       - The raised signal shows the last step reached by each discarded draft, by count.
439. As the Phase 30 product owner, I want a signal when support contacts about imports exceed 5 per 100 imports in a quarter, so that I can fix the copy or step named most often. [Q19; ADR-IM-019; M-Q19-6]
     - **Acceptance:**
       - Each quarter, support contacts tagged as being about imports are counted per 100 imports, with no content copied from the contact.
       - A rate above 5 raises the signal to the Phase 30 product owner and support, and 5 or less does not.
       - The raised signal ranks the steps or messages contacts named.
440. As the Phase 30 product owner, I want a signal when the median share of imports that finish Needs attention exceeds 25%, so that I can improve templates, matching or file checks. [Q19; ADR-IM-019; M-Q19-7]
     - **Acceptance:**
       - The signal computes, across ministries, the median share of finished imports whose status is Needs attention.
       - A median above 25% raises the signal, and 25% or less does not.
       - The raised signal breaks the share down by outcome reason, by count.

## Operating signals for permissions (Q20)

441. As the Phase 30 product owner, I want a signal when a ministry has held rows still unreviewed 7 days after commit for 2 consecutive weeks, so that I can check reviewer coverage and point Admins to the setup notice. [Q20; ADR-IM-020; M-Q20-1]
     - **Acceptance:**
       - The signal counts, per ministry and week, held rows still unreviewed 7 days after commit.
       - A ministry with such rows in 2 consecutive weekly checks raises the signal, and one week alone does not.
       - The signal identifies the ministry and imports by ID and shows whether a cleared Manage holder exists.
442. As the Phase 30 product owner, I want a signal for any ministry using Data Tools with no cleared Manage holder, so that support can contact the ministry's access manager. [Q20; ADR-IM-020; M-Q20-2]
     - **Acceptance:**
       - Any ministry with at least one import kind switched on and no Data Tools Manage holder with clearance raises the signal to the Phase 30 product owner and the Phase 10 owner.
       - The signal clears once a Manage holder has clearance.
       - The signal names no person.
443. As a Phase 12 security holder, I want a signal when one uncleared uploader has more than 3 held protected matches in 30 days, so that possible probing is reviewed. [Q20; ADR-IM-020; M-Q20-3; O104]
     - **Acceptance:**
       - The signal counts, per uncleared uploader over a rolling 30 days, held matches to protected people from the restricted-access audit.
       - A fourth match within 30 days raises the signal and Phase 12's alert, and a third does not.
       - The signal carries identifiers only, with no name or file content.
444. As the Phase 30 product owner, I want a signal when more than 5% of imports in a quarter stop for lost permission, so that I can review time-limited access lengths and grant practice. [Q20; ADR-IM-020; M-Q20-4]
     - **Acceptance:**
       - Each quarter, the signal computes imports stopped with "Stopped: {name} no longer has permission" as a share of confirmed imports, counting each import once.
       - A share above 5% raises the signal, and 5% or less does not.
       - The raised signal shows how many of those stops followed the end of time-limited access.
445. As the Phase 12 owner, I want a signal for any Data Tools access request unanswered after 7 days, so that I can check routing and coordinators. [Q20; ADR-IM-020; M-Q20-5; O103]
     - **Acceptance:**
       - A "Request access to Data Tools" request unanswered 7 days after it was made raises the signal to the Phase 12 owner.
       - An answered request, whether granted or declined, never raises it.
       - The signal names neither the requester nor the possible approvers.
446. As the Phase 12 owner, I want Asym-data downloads above a person's Phase 12 export budget to meet the existing step-up or denial, so that import results follow the same export limits as everything else. [Q20; ADR-IM-020; M-Q20-6]
     - **Acceptance:**
       - Asym-data downloads from Data Tools count against the person's Phase 12 export budget.
       - A download that would exceed the budget meets Phase 12's existing step-up or denial, and nothing below the budget does.
       - Own-file downloads do not count against the export budget.

## Operating signals for governance (Q21)

447. As the founder, I want a signal whenever #2347 or #2087 is assigned, given a pull request or given an in-flight label while still Ready, so that neither merges before its amendments. [Q21 part 1 clause 3; ADR-IM-021; M-Q21-1]
     - **Acceptance:**
       - A read-only check runs at each discovery session and at `/to-spec` and records both issues' state.
       - Any assignment, pull request or in-flight label on either issue while it is still Ready raises the signal to the founder.
       - On the signal, the affected work is stopped before merge and amended as Q21 sets out.
       - The hold never lapses by itself: both issues regain Ready only after this spec is approved and their amendments are made at `/to-ticket`, and only by the founder or on the founder's explicit instruction naming both.

## Operating signals from earlier decisions (Q3–Q17)

448. As the Phase 30 product owner, I want the template-path and mapping signals, so that I learn whether the template path and rule-based mapping work and can stop any import data leaving Asym. [Q3; Q11 clause 6; ADR-IM-003; ADR-IM-011; Q3 template monitor; M-Q11-1 to M-Q11-4]
     - **Acceptance:**
       - Each practice run records the share of rows blocked at validation and any unexplained level-2 variance, and any template-path Switch that needs developer help to finish raises a signal to the Phase 30 spec owner with Asym's relationship owner and the Switch lead.
       - Each Switch records its match-method mix (key or preset, remembered mapping, Common-header list, accepted suggestion, by hand, left out) and its mapping time as learning signals.
       - When most of the first three template-path Switches need Asym help or a developer to map, the founder is signalled to revisit optional headers-only AI.
       - Any outbound request from import processing to a host outside Asym, or any raw import content found in logs or support tools, opens an incident for the Phase 30 owner with Phase 10 and blocks the release.
449. As the Phase 30 product owner, I want the switch-year tax-document signals routed to their owners, so that donor confusion, unissued documents and any receipt on a gift recorded outside Asym are caught. [Q4; ADR-IM-004; Q4 monitors M1 to M3]
     - **Acceptance:**
       - Donor contacts about switch-year statements or "missing" gifts above 2% of donors with gifts recorded outside Asym that year, or any reported lost deduction or duplicate Canadian receipt, raise a signal to the Phase 30 spec owner with the Phase 19 owner.
       - Decommission item (i) still unattested after 31 January (US) or 28 February (Canada) following a year with gifts recorded outside Asym raises a signal to Asym's relationship owner with the Switch lead.
       - Any receipt plan, issuance, official-document line or Late Fact Obligation that references a gift carrying Recorded outside Asym raises a signal to the Phase 7 owner (the Phase 19 owner for Late Fact Obligations) and stops issuance for that issuer.
450. As the Phase 30 product owner, I want the Switch help signals, so that assisted Switches stay affordable, Asym help access is never misused and coaching-only Switches don't stall. [Q5 clause 8; ADR-IM-005; M-Q5-1 to M-Q5-3]
     - **Acceptance:**
       - Specialist hours over 40 on any Switch, or a median over 20 across Switches, taken from Asym's content-free help tracker, raise a signal to the Phase 30 spec owner.
       - Any operator action without an active Asym help access grant, or any approval by an ineligible or Asym-created approver, raises a signal to the Phase 12 security owner, who disables grant requests.
       - Any design-partner Switch stuck for more than 14 days on one step without a grant raises a signal to Asym's relationship owner.
451. As the Phase 30 product owner, I want the practice signals, so that practice checks stay faithful to commit rules and the Practice environment never leaks. [Q6; ADR-IM-006; M-Q6-1 to M-Q6-5]
     - **Acceptance:**
       - Any plan-accepted row rejected at commit into a go/no-go candidate Practice copy raises a signal to the Phase 30 spec owner with the area owner, and that area's check is fixed before go/no-go.
       - Any live credential, live domain or outbound attempt detected in the Practice environment raises a signal to the platform and operations owner, who freezes builds and destroys every copy.
       - Any Practice copy alive more than 24 hours after its destruction trigger opens an incident for the platform and operations owner.
       - An actual Switch pause longer than the measured pause × 1.5 raises a signal to the Phase 30 spec owner.
       - If, across the first three Switches, fewer than half of Practice copies are opened or no copy finds an issue that previews missed, the founder is signalled to decide whether the dress rehearsal stays required.
452. As the Phase 30 product owner, I want the Legacy Recurring Tail signals, so that backfilled gifts never trigger donor messages, tail data stays fresh and double charges are caught. [Q7; ADR-IM-007; M-Q7-1 to M-Q7-3]
     - **Acceptance:**
       - Any donor-facing message triggered by a Recorded outside Asym or backfill fact raises a signal to the Phase 34/35 owner, who disables that producer.
       - Days since a Switch's covered-through date beyond the backfill cadence plus 7 days raise a signal to the Switch lead with Asym's relationship owner.
       - Any post-move charge, or possible double giving above 2% of tail arrangements in one Legacy Tail Backfill, raises a signal to the Switch lead with the Phase 16 owner.
453. As the Phase 30 product owner, I want the tail-move signals, so that moves progress and no donor is charged twice. [Q8; ADR-IM-008; M-Q8-1 to M-Q8-5]
     - **Acceptance:**
       - A share moved, by donors or by amount, below 50% by campaign week 5 raises a signal to the Switch lead with Asym's relationship owner.
       - Any donor charged by both systems for the same period raises a signal to the Phase 16 owner.
       - A send reaching 3% bounces or any complaint pauses automatically and signals the Switch lead.
       - First Asym charge failures above 5% of moved gifts raise a signal to the Phase 16 owner.
       - Any confirmed gift more than 3 days past its next old charge without stop evidence raises a signal to the Switch lead.
454. As the Phase 30 product owner, I want the consent and suppression signals, so that no blocked person is contacted and adopted lists are watched. [Q9; ADR-IM-009; M-Q9-1 to M-Q9-7]
     - **Acceptance:**
       - Any source block missing in Asym, by type, blocks reconciliation sign-off and signals the Phase 30 owner, with the Switch lead signing once it is zero.
       - Any message sent to a blocked person or address halts that sender and signals the Phase 6 owner for incident review.
       - A pending-in-legacy item triggers a reminder to the Switch lead at 24 hours and a Switch page alert at 2 days.
       - On sends to adopted people, a complaint rate of 0.1% or more (or any complaint in the first 50) or a bounce rate of 3% or more pauses sending automatically and signals the Phase 17 owner.
       - Any Adopted email permission missing a required evidence field reverts to evidence only and signals the Phase 12 owner.
       - The share of each moved list still subscribed 90 days after go-live is recorded as a learning signal.
455. As the Phase 30 product owner, I want the household and matching signals, so that no gift attaches to the wrong person and households reconcile. [Q10; ADR-IM-010; M-Q10-1 to M-Q10-5]
     - **Acceptance:**
       - Any commit failing on the email index blocks that Switch run and signals the Phase 30 owner.
       - Any gift attached by email where the first name disagrees, or attached to a marked shared mailbox, halts attachment and signals the Phase 4 owner.
       - Source households with two or more members and Asym households created must be equal, and any difference is a reconciliation item before sign-off.
       - Flagged combined-name records at the final export are a learning signal for the Switch lead, expected to fall between practice runs.
       - Duplicate candidates per 1,000 people after the Switch are a learning signal for the Phase 4 owner, expected between 100 and 180.
456. As the Phase 30 product owner, I want the everyday import signals, so that imports never send or grant anything and payouts are never taken twice. [Q12; ADR-IM-012; M-Q12-1 to M-Q12-5]
     - **Acceptance:**
       - Any message or permission caused by an everyday import halts imports and opens an incident for the Phase 30 owner with Phase 6; receipts and thank-yous that Phase 15 issues once a person posts a Gift file's draft gift batches are not caused by the import and do not count.
       - Any payout accepted twice halts that gift batch and signals the Phase 15 owner.
       - Any accepted Gift file row that belongs to a legacy executor signals the Phase 15 owner with Phase 30 and is reversed through Phase 15.
       - The share of People imports later reversed, and the size of Replace operations, are learning signals, the latter deciding whether large Replaces need a second-person check.
457. As the Phase 30 product owner, I want the giving-history signals, so that history never causes effects and every Switch ties out cent for cent. [Q13; ADR-IM-013; M-Q13-1 to M-Q13-7]
     - **Acceptance:**
       - Any outward effect referencing history (message, task, receipt plan, statement line, Field Account occurrence, posting intent or settlement link) halts that consumer and opens an incident for the Phase 30 owner with that consumer's owner.
       - Any unexplained variance at sign-off, cent-exact per Legal Entity × currency × year, or any History spot check mismatch blocks sign-off and signals the Switch lead.
       - Waiting rows above 2% of gift rows at the final practice run trigger a go/no-go review of their causes before the real Switch run.
       - History commit plus reconciliation time in the last practice run longer than the declared editing pause blocks go/no-go. The declared pause stays capped at the measured pause × 1.5 (story 12). The next step is another dress rehearsal; lengthening the pause past that cap is refused.
       - Gifts corrected in the first 90 days after go-live above 0.5% of imported gifts signal the Phase 30 owner to review mapping defaults and waiting reasons.
       - Missionary requests to see history older than the roster window are a learning signal for the Phase 28 owner.
458. As the Phase 30 product owner, I want the notes, files and care signals, so that protected entries stay in their tiers and no unscanned file is used. [Q14; ADR-IM-014; M-Q14-1 to M-Q14-8]
     - **Acceptance:**
       - Any imported Restricted or Sealed entry read by a role outside its tier, or any task, reminder, notification or automation produced by an imported entry, halts that family and opens an incident.
       - Any file with an infected verdict stays in quarantine, is never promoted and is reported to the Switch lead.
       - Scanner signatures older than 24 hours, or an unavailable scanner, make files wait and signal Asym operations.
       - More than 30% of notes landing Restricted for an unknown category at the final practice run triggers a category-mapping review with the ministry before the real Switch run.
       - Entries moved to a stricter tier above 1% in the first 90 days, and File safety check time above 50% of the declared editing pause, each signal the Phase 30 owner.
       - Families waiting for a home at each Switch's go-live are a learning signal for the roadmap owner.
459. As the Phase 30 product owner, I want the retention and size signals, so that nothing outlives its deletion date and the Size profile keeps headroom. [Q15; ADR-IM-015; M-Q15-1 to M-Q15-7]
     - **Acceptance:**
       - Any artifact past its deletion date and not held, checked daily, opens an incident for the Phase 29 owner with Asym operations.
       - Any storage deletion still failing after 72 hours opens an incident for Asym operations.
       - Any erasure rewrite older than 14 days opens an incident for the Phase 30 owner with Phase 3.
       - Final exports deleted with no successful Verify your copy in more than 20% of Switches signal the Phase 30 owner.
       - Any Switch above 80% of a Size profile limit signals the Phase 30 owner, and a p95 heavy-job wait above 1 hour for a ministry signals Asym operations.
       - Any legal hold past its review date escalates to its holder and is never released automatically.
460. As the Phase 30 product owner, I want the custom-field signals, so that Switches don't sprawl fields and imports never invent defaults or options. [Q16; ADR-IM-016; M-Q16-1 to M-Q16-5]
     - **Acceptance:**
       - More than 50 fields created by one Switch signals the Phase 30 owner to review sprawl with the ministry.
       - More than 25% of Switch-created fields with a fill rate below 5% at sign-off signals the Phase 30 owner.
       - Any identifier-pattern override signals the Phase 30 owner with security for review within 7 days.
       - Any default value found on an import-origin record, or any option created automatically by an import, opens an incident for the Phase 11 owner.
461. As the Phase 30 product owner, I want the old-link and domain signals, so that old addresses keep working and domain moves never break giving. [Q17; ADR-IM-017; M-Q17-1 to M-Q17-6]
     - **Acceptance:**
       - An unmatched old path with 10 or more hits a week in the 90 days after a domain stage appears on the Switch lead's weekly list.
       - Query-driven giving links above 20% of listed giving links at the readiness census signal the founder to revisit whether Phase 24 should admit a single exact query key.
       - Any Domain readiness check item failing at the planned move blocks the move and signals the Phase 24 owner.
       - Any leftover DNS record pointing at a retired service 30 days after a move alerts the ministry through the Phase 24 owner.
       - Fewer than 50% of listed giving links kept at go-live signals the Phase 30 owner.
       - Any 5xx response or loop on a continuity path opens an incident for the route owners.

## Dependencies referenced

- **O11** (Phase 30 spec): run-level terminal states and visibility for import failures.
- **O12** (Phases 13 and 16): owners for card-copy requests, PayPal cancellation proof and the processor half of the migration workstream; no Switch with recurring giving until O12, O31 and O36–O40 are live.
- **O19** (Phase 29 with the Phase 30 spec): custody profile for staff-migration source files.
- **O20** (Security and database owner): authorized read-only check of hosted read policies and real-data status; close any anonymous public read.
- **O26** (Phase 12): Operator Tenant Grant for `switch_preparation`, which is Asym help access.
- **O27** (Phase 12): ministry-administered membership with scoped, expiring capability grants for helpers.
- **O29** (Platform and operations): the Practice environment.
- **O30** (Phase 30 with Phases 12 and 29): Practice copy job and lifecycle (allowlist, mirrored access, status channel, purge and receipt).
- **O31** (Phase 13 and admin owners): before real data in any environment, the payment platform-key fallback and the any-tenant USD lane removed, the hard-coded tenant removed and the CMS tenant resolver honouring whether a Tenant is active.
- **O36** (Phase 16 with Phase 25): move-start variant with no charge until stop evidence and no catch-up.
- **O37** (Phases 16 and 17 with Phase 4): campaign messages as service messages; the Continue link; email-code verification for Change and Stop.
- **O38** (Phase 3 with counsel): ruling on legally required notices versus the do-not-contact floor.
- **O39** (Phases 13 and 16): a Canadian pre-authorized debit rail, or confirmation that card-only is acceptable.
- **O40** (Phase 28 with Phase 25): missionary read-only move-status list; donor-portal move status and continue action.
- **O47** (Phase 4): import and guest-gift matching on email only when the first name agrees and no shared-mailbox marker exists.
- **O50** (Phase 15): a file-origin draft batch of ordinary current gifts accepted under the batch's own human gate, with expected count and total, repeat-refusing payout keys, payer of record and recognised person per row, and the legacy-tail refusal.
- **O51** (Phase 9 with Phases 4 and 11): owner write commands with per-field fill empty, replace, ignore and a separately confirmed clear; contact details added, never replaced; tags and lists add only.
- **O64** (Phase 29): CRM-attachment lane with quarantine and a self-hosted malware scan.
- **O70** (Phase 29): Retention classes, monotonic holds, the single Retention sweep and the staff-migration Size profile.
- **O71** (Platform and operations): hosting region, backup windows, IDs-only job payloads and the published retention schedule.
- **O74** (Phase 12): legal-hold place and release capabilities for the Switch decision holder and Asym's named legal role, with no content access; no capability returns a raw Switch export.
- **O78** (Phase 34 with Phase 11): field-value-change triggers never fire on import-origin writes.
- **O87** (Phase 9 with Phases 4 and 11): the People reversal command, with "not written since" checks at the moment of change, tags as one field, entered-in-error removal, the Untouched check and attributed, effect-dark writes.
- **O88** (Phase 9): what "archived" means for a person, including archiving an emptied household.
- **O89** (Phases 34, 11, 6 and 14): import reversal writes suppressed exactly like import writes.
- **O90** (Phase 15 with Phase 13): a Gift file lists every resulting gift batch with its state and a link to discard a draft batch or reverse a posted one in Phase 15.
- **O93** (Phase 9): "Import people" on the People list, shown only where it works, and the "added or changed by import" filter.
- **O94** (Phase 15): "Upload a Gift file" beside New batch, batches linking back to their Gift file, and the shared accessible editable grid.
- **O96** (Phase 17): staff notices for Data Tools, needed before the first Switch.
- **O97** (Tasks Hub owner, ADR-0183): registered Source work projection for imports that need a person, with held-row items routed only to eligible reviewers.
- **O98** (Phase 12 with the Mission Control shell owner, to be named): one server-side visibility decision for the sidebar and Cmd-K, dead menu lists removed, tile catalog and Eve page list updated.
- **O99** (Phase 29): resumable upload to the Size profile through the File safety check.
- **O100** (Phase 40): data quality joins Data Tools as a tab without renaming.
- **O101** (Test infrastructure owner): signed-in accessibility checks at 1280, 768 and 320 CSS px and keyboard-only end-to-end tests.
- **O102** (Phase 12): Data Tools permission module with View, Manage and Admin levels, sensitive Admin permissions and the Owner-only seed; gates release.
- **O103** (Phase 12): typed access-request kind "Request access to Data Tools", never naming holders.
- **O104** (Phases 10 and 12): held matches to protected people counted in the restricted-access audit and budget without plaintext.
- **O105** (Phase 12): grant end dates for helpers, defaulting to the day the Switch closes.
