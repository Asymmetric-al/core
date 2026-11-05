# Phase 30 user stories, part 1: Switch foundations

Stories 1–112 of the Phase 30 specification's continuous numbered list.

These user stories are normative for Phase 30 — Imports & Migration and cover the Switch foundations ratified in discovery questions Q1 to Q10, read together with every later ratified amendment to those questions (including Q13, Q15, Q17, Q18, Q19 and Q20). Each story is independently verifiable through its own acceptance criteria, and terms follow the Phase 30 glossary exactly. Bracketed references cite the ratified decision clause (Qn clause x, with "(Qm amendment)" where a later decision amended it), the matching ADR-IM record and, where a story cannot be accepted until another owner delivers something, the owner requirement it depends on ("depends on O#"); owner requirements are identified but not yet agreed. The Common safeguards — tenant isolation, a server-derived actor on every action, Phase 12 permission checks, logs that carry identifiers only, and WCAG 2.2 AA — apply to every story here and are specified in part 4.

## Starting and scheduling a Switch (Q1)

1. As a ministry member with Run the Switch, I want the Start action to appear only once Asym's own preconditions for a Switch are met, so that no Switch begins before Asym can hold real donor data safely and reach the Switch lead. [Q20 clause 3; Q20 clause 14; Q19 clause 13; Q2 clause 5; Q2 clause 6; Q6 clause 9; Q5 clause 1 (Q19 amendment); ADR-IM-020; ADR-IM-002; ADR-IM-006; ADR-IM-019; depends on O19, O20, O29, O30, O31, O96, O102]
   - **Acceptance:**
     - Given the Practice environment has not been Approved, when any member opens the Switch tab, then no Start action is present and no other route creates a Switch.
     - Given the environment that holds the ministry's Tenant has not been Approved for real personal data by a live read-back, the staff-migration custody profile is not qualified there, the retained-state census is not complete, or any O31 pre-real-data fix is not live (the payment platform-key fallback and the any-tenant USD lane removed, the hard-coded tenant removed, and the CMS tenant resolver honouring whether a Tenant is active), when a member with Run the Switch opens the Switch tab, then no Start action is present.
     - Given the Switch kind is switched off for the ministry, or Phase 17 staff notifications cannot yet deliver Switch-lead notices, when a member with Run the Switch opens the Switch tab, then no Start action is present.
     - Given Phase 12 cannot yet grant Data Tools permissions, then no member of any ministry sees a Data Tools entry and no role name opens it.
     - Given every precondition is met, when a member without Run the Switch opens the Switch tab or calls the start action directly, then no Start action is shown and the call is refused.
     - Given every precondition is met, when a member with Run the Switch starts a Switch, then the Switch records that member as its starter and its Switch lead, with the time.

2. As a ministry member with Run the Switch, I want each Switch to declare exactly one source system and one source installation feeding our Tenant, so that another organization's supporters and gifts can never enter our account and every imported record traces to a known source. [Q1 clause 1; Q3 clause 4(c); Q3 clause 10; ADR-IM-001; ADR-IM-003; depends on O16]
   - **Acceptance:**
     - Given the readiness census records that the source installation or any legacy merchant account is shared with another organization, then the Switch cannot be scheduled and its task list shows "Cannot start yet" with that reason.
     - Given a Switch, then its Source profile, declared source system and source instance are shown on the Switch and carried by every Source Record Binding it writes.
     - Given the ministry also holds data in a second source system, when it brings that data across, then it does so through a separate Switch with its own source declaration, and a person found in both goes to match review and is never merged automatically.
     - Given a Switch on the template profile, then it follows the same Switch steps as a Switch on the SiteStacker profile, with the generic census and surface checklist in place of SiteStacker-specific items.

3. As a ministry member with Run the Switch, I want to sign a Source mapping statement naming the one Legal Entity and the one Site for every legacy merchant account and offline source, so that no gift is ever assigned to an entity or Site by inference. [Q1 clause 1; Q13 clause 7; ADR-IM-001; ADR-IM-013; depends on O59]
   - **Acceptance:**
     - Given a merchant account or offline source in the census with no signed Legal Entity and Site, then scheduling is refused and the Switch names that account or source.
     - Given a statement that maps one merchant account to two Legal Entities, then it is refused.
     - Given a merchant account used on a Site, then its Legal Entity is never pre-filled from that Site, from a default entity or from the Default Site.
     - Given a ministry with one Legal Entity and one Site, then one signature covers every merchant account and offline source.

4. As a Switch lead, I want scheduling refused until every Minimum Switch Kit family is committable through its owner's import command and every Asym-side safety prerequisite is live, so that no Switch is scheduled with a Minimum Switch Kit family or a safety control missing. [Q1 clause 1(a); Q9 clause 7; Q10 clause 10; Q8 clause 10; Q6; ADR-IM-001; ADR-IM-006; ADR-IM-008; ADR-IM-009; ADR-IM-010; depends on O12, O31, O36, O37, O38, O39, O40, O41, O47]
   - **Acceptance:**
     - Given any kit family — Parties and households; contact points with consent and suppression evidence, including the final export of every email-tool audience; one-time giving history including reversals; recurring evidence for the Phase 16 classifier — is not committable, then scheduling is refused and the task list names the missing family.
     - Given a request to accept a kit family as a Visible exclusion, then it is refused, and no exception path lets a Switch proceed with a kit family missing.
     - Given the scoped restriction import or Phase 4's email-plus-first-name matching is not live, then no Switch can be scheduled for any ministry.
     - Given any of the O31 pre-real-data fixes is not live (the payment platform-key fallback and the any-tenant USD lane removed, the hard-coded tenant removed, and the CMS tenant resolver honouring whether a Tenant is active), then no Switch is offered to any ministry, whether or not it has recurring giving.
     - Given a ministry with legacy recurring giving, when any of the card-copy and PayPal-stop owners, the move-start, the campaign messages and Continue link, the legal-notice ruling, the PAD decision or the missionary move list is not live, then no Switch is offered to that ministry, while a ministry with no recurring giving is not blocked by these.
     - Given any blocked scheduling task, then it shows "Cannot start yet" with a plain-language reason, and no control is disabled without a written reason.

5. As a ministry member with Run the Switch, I want every family outside the Minimum Switch Kit to be either committable or accepted by the ministry as a Visible exclusion, so that every gap in what the Switch carries is known and never silent. [Q1 clause 1(b); Q1 clause 1(b) (Q15 amendment); ADR-IM-001; ADR-IM-015]
   - **Acceptance:**
     - Given a non-kit family that is neither committable nor accepted as an exclusion, then scheduling is refused and the family is named.
     - Given an accepted exclusion, then it shows "history not yet covered" with its reason, who accepted it and when, and, for a history family, its Coverage start.
     - Given a later import of an excluded family, then it is accepted only under the same Switch Boundary, and only from the final manifest while Asym still holds it or, after its deletion date, from the ministry's own copy whose every file matches its recorded digest.
     - Given a ministry copy in which any file differs from its recorded digest, then the later import is refused and the differing file is named.

6. As a Switch lead, I want every legacy recurring cohort found in the census to have a Phase 16 external read-only target before scheduling, so that no recurring gift is moved, doubled or lost on switch day. [Q1 clause 1(c); Q1 clause 8; ADR-IM-001]
   - **Acceptance:**
     - Given a legacy recurring cohort in the census with no Phase 16 external read-only target, then scheduling is refused and the cohort is named.
     - Given go-live, then no legacy recurring gift has moved, and each legacy arrangement shows as external and read-only with no Asym action to charge, pause or edit it.
     - Given a ministry that already used Stripe, then its legacy arrangements follow the same rule, and moving any one of them happens only through a Phase 16 formal cutover with proof the old executor stopped, never with both executors active.
     - Given any Switch step, then no Phase 30 screen asks for or accepts a card number, bank number or processor credential, and no Phase 30 action contacts a processor, copies a payment vault, runs re-authorization or marks an executor stopped.

7. As a ministry member with Run the Switch, I want a source module that will keep writing to migrated people, such as child sponsorship, allowed only as a declared residual system, so that the ministry knowingly accepts a second live writer for those people. [Q1 clause 1(e); Q3 clause 9; ADR-IM-001; ADR-IM-003]
   - **Acceptance:**
     - Given the census reports such a module, then scheduling is refused until a declaration records the module, the stated count of overlapping people and the ministry's written acceptance.
     - Given a declared residual system, then Asym offers no sync with it in either direction.
     - Given child sponsorship records in the source, then they appear as a Visible exclusion with a reason and are never silently dropped.

## Readiness census (Q1, Q3, Q4)

8. As a ministry member with Run the Switch, I want to complete a readiness census before the first practice run and again at the final export, so that the plan rests on the ministry's actual processors, executors and outward surfaces. [Q1 clause 1(d); Q1 clause 3; Q2 clause 5(g); ADR-IM-001; ADR-IM-002]
   - **Acceptance:**
     - Given the census is incomplete, then no practice run can start and the task shows "Cannot start yet" with that reason.
     - Given a SiteStacker-profile Switch, then the census asks for merchant accounts per Site, currency and payment method; recurring executors (SiteStacker's scheduler, PayPal subscriptions, gateway-native schedules) with their counts; gateway-sent donor emails; every outward surface that needs a Legacy Surface Disposition; modules that will keep writing to people; and sources for the Old link list.
     - Given the final export, then the census is retaken before any family of the final Source Snapshot Manifest commits, and until it is retaken the commit task shows "Cannot start yet" with that reason; every answer that changed is shown beside its earlier value, and a merchant account or surface first found then must receive its Legal Entity assignment or disposition before go-live.
     - Given any census answer, then it shows who gave it and when, and it is taken fresh rather than copied from the Discovery declaration.
     - Given an Asym specialist under Asym help access, when they try to enter or change a census answer, then it is refused.

9. As a ministry member with Run the Switch on the template profile, I want a generic census and surface checklist that I complete myself, so that a Switch from a system Asym knows nothing about still covers every outward duty. [Q3 clause 4(e); Q3 clause 4(e) (Q4 amendment); ADR-IM-003]
   - **Acceptance:**
     - Given a template-profile Switch, then the checklist includes at least giving forms, automations, email-platform sync, the recurring engine, receipts, the donor cancel path, staff gift entry in the old system and the tax-document duty for gifts recorded outside Asym.
     - Given the template-profile checklist, then it names no vendor and offers no vendor preset.
     - Given any checklist item without a recorded state, then scheduling is refused and the item is named.

10. As finance staff, I want the census to name who documents each population of switch-year gifts, and Asym's tax-document setup to be active before Asym records an entity's first gift, so that every gift has exactly one tax-document issuer. [Q4 clause 3(a); Q4 clause 3(b); ADR-IM-004; depends on O25]
    - **Acceptance:**
      - Given each issuing Legal Entity, then the census records who documents its pre-Boundary switch-year gifts and each Legacy Tail cohort, and how: old-system documents, another receipting tool, or the ministry manually.
      - Given any population, including a processor-only tail cohort, without a named issuer, or any issuing Legal Entity whose Asym tax-document setup is inactive, then Go is refused and the population or entity is named.
      - Given a SiteStacker-profile Switch, then the census records confirmation that the Statements report is available.
      - Given a Canadian issuing Legal Entity, then the census records its current receipting tool and last serial number, and these reach Phase 18 as serial continuity evidence.
      - Given the census is complete, then "tax documents for gifts recorded outside Asym" appears as a Kept on through tail surface with an owner and an end condition.

## Go/no-go, Switch Boundary and editing pause (Q1, Q4, Q6, Q19)

11. As a ministry member with Run the Switch, I want one go/no-go decision that shows every gate with its status, so that the ministry commits to switch day knowing nothing required is missing. [Q1 clause 3; Q5 clause 1; Q6 clause 2; Q6 clause 6; Q8 clause 1; Q9 clause 2; ADR-IM-001; ADR-IM-005; ADR-IM-006]
    - **Acceptance:**
      - Given any of these is missing — a Switch lead; a Practice copy built on the current mapping version and production release with zero unresolved mismatches; a named tax-document issuer for every population; an active Asym tax-document setup for every issuing Legal Entity; an Email list disposition for every list; a Legacy Surface Disposition for every surface; an End date, a tail closure date and a maximum editing pause — when Go is pressed, then it is refused and each missing item is named with one next step.
      - Given every gate passes, when a member with Run the Switch records Go, then the Switch records who decided, when, and the mapping version, release and Practice copy the decision relied on.
      - Given Go is recorded, then the live Practice copy is destroyed.
      - Given an Asym specialist under Asym help access, when they try to record Go or No-go, then it is refused.

12. As a Switch lead, I want go/no-go to show the online-giving and editing pauses measured in the dress rehearsal, cap each at measured × 1.5, and fix in advance what happens if the editing pause overruns, so that nobody has to decide under pressure on switch day. [Q1 clause 3; Q1 clause 4; Q6 clause 2; ADR-IM-001; ADR-IM-006]
    - **Acceptance:**
      - Given a Practice copy with recorded timings, then go/no-go shows the measured online-giving pause and editing pause and a limit of measured × 1.5 for each.
      - Given a declared maximum editing pause longer than its limit, then it is refused.
      - Given no other choice is recorded, then the deadline action recorded at go/no-go is "abort before commit and resume the previous system".
      - Given the deadline action recorded at go/no-go is "abort before commit and resume the previous system", when the declared maximum editing pause is reached before the final import has begun committing, then no commit starts, the Switch is aborted with the time recorded, and the Switch lead is told to resume the previous system.

13. As a ministry member with Run the Switch, I want to record the Switch Boundary as one exact instant shown in our giving time zone, so that every source fact is classified as history or as a post-switch legacy fact without ambiguity. [Q1 clause 3; Q1 clause 11; ADR-IM-001]
    - **Acceptance:**
      - Given a recorded Boundary, then it is held as one exact UTC instant and displayed with date, time and the named giving time zone, never as a date alone or as "midnight".
      - Given a new Switch, then the proposed Boundary is the first moment of a civil date in the giving time zone.
      - Given a source fact stamped exactly at the Boundary, then it is classified as a post-switch legacy fact, and a fact stamped 1 millisecond earlier is classified as history.
      - Given the Boundary is recorded or changed, then no Phase 16, Phase 20 or Phase 21 boundary or setting changes.
      - Given any record the Switch writes, then it carries one boundary per source family, each equal to the Switch Boundary in the first release.

14. As a ministry admin, I want scheduling to tell me which tax years will have documents from two systems and to warn me about a late-year Boundary, so that we can choose a date that keeps donors' year-end documents simple. [Q4 clause 6; ADR-IM-004]
    - **Acceptance:**
      - Given a proposed Boundary and tail closure date, then the scheduling step names every tax year that will have documents from both systems, including the following year when the tail closure date falls after 31 December.
      - Given a Boundary dated 20 November or 31 December, then a warning is shown, and given a Boundary dated 15 January, then none is shown.
      - Given the warning, then it never blocks scheduling, and the guidance beside it recommends an early-year Boundary and closing the tail by 31 December.

15. As a ministry member with Run the Switch, I want to attest that staff editing stopped in the old system and that each surface is in its recorded state around the Boundary, so that the record shows what the ministry did, which Asym cannot enforce. [Q1 clause 3; Q4 clause 3(c); Q19 clause 8; ADR-IM-001; ADR-IM-004; ADR-IM-019]
    - **Acceptance:**
      - Given the editing pause is attested, then it shows as "ministry attested" with who and when, and no screen states that Asym froze, locked or switched off the old system.
      - Given any Source profile, then staff gift entry in the old system can only be recorded as Off at boundary, and any other state is refused.
      - Given a Switch between its Boundary and go-live, then every everyday import start action reads "Paused during the Switch, from {Boundary} until go-live." and no everyday import commits.

16. As a ministry member with Run the Switch, I want to upload the final Source Snapshot Manifest as one or more files exported after the Boundary, so that the import binds to exactly the exports the ministry made. [Q1 clause 3; Q5 clause 4; ADR-IM-001; ADR-IM-005]
    - **Acceptance:**
      - Given a final manifest, then it accepts several files, and each records its byte identity, filter or partition, exporter role, source version, export times and on-screen control counts.
      - Given a file whose export time is before the Boundary, then it is refused as part of the final manifest.
      - Given a sealed manifest, then no file can be added, removed or replaced, and a different set of files is a new manifest.
      - Given an Asym specialist or any non-member, when they attempt to upload a source file, then it is refused, because files enter only through a ministry member's upload.

## Giving continuity and old addresses (Q1, Q17)

17. As a ministry admin, I want people, contact points and imported restrictions to commit and reconcile before Asym giving opens, and every other family to commit with no outward effect before the Switch is declared live, so that online giving resumes quickly and safely. [Q1 clause 4; Q1 clause 4 (Q17 amendment); ADR-IM-001; ADR-IM-017]
    - **Acceptance:**
      - Given the Parties, contact-point or restriction commit has not reconciled, then Asym giving and exact continuity cannot be opened.
      - Given any family's commit is unfinished, then Switch live cannot be recorded.
      - Given every commit in a Switch, with every automation and recipe enabled, then the Switch produces zero sends, enrollments, payments and public effects.
      - Given a donor who gives in Asym after giving opens and before the final import completes and who resembles an imported person, then they appear in match review and are never merged automatically.

18. As finance staff, I want Asym checkout to open only after a verified Phase 13 Settlement Account Binding exists, so that no gift taken after the switch can settle anywhere but the ministry's own account. [Q1 clause 4; ADR-IM-001; depends on O31]
    - **Acceptance:**
      - Given a Legal Entity with no verified Settlement Account Binding, then Asym checkout for that entity stays closed and the Switch task list shows giving as "Cannot start yet" with that reason.
      - Given checkout is open, then no gift settles through any platform fallback account.
      - Given checkout opens, then the opening time and the binding it relied on are recorded on the Switch.

19. As a donor, I want an old page or giving link I saved to keep working after the switch, so that my gift reaches the same fund without me hunting for a new address. [Q1 clause 4 (Q17 amendment); Q17 clause 3; Q17 clause 4; ADR-IM-017; depends on O80, O82]
    - **Acceptance:**
      - Given an old ordinary page with an exact old-address mapping, when it is requested, then its Asym page is served.
      - Given an old giving link a person kept, when it is requested, then the same designation's Asym giving page is served at that address, never redirected, and a gift through it can reach only that designation.
      - Given an unmapped old link — a retired or restricted missionary, an unmatched or query-driven giving link, or one never mapped — then the Site's single not-found page is returned with an identical response for every case.
      - Given any kept giving link or page continuity, then it does not expire.

20. As a ministry admin, I want to move our hostnames to Asym one at a time and have each move recorded among our Legacy Surface Dispositions, so that the Continue link, giving and our main website change over without breaking the old system's running donor pages. [Q1 clause 7 (Q17 amendment); Q17 clause 5; ADR-IM-017; depends on O84]
    - **Acceptance:**
      - Given a Switch, then the staged domain move is presented in the order account hostname, then giving hostname, then main website, and the ministry keeps ownership of its domain throughout.
      - Given the Domain readiness check has not passed within the previous 24 hours, then the main website hostname cannot be recorded as moved and the failing item is named.
      - Given a hostname is moved, then it is recorded as "Pointed to Asym" among the Legacy Surface Dispositions, with who and when.
      - Given the main website was moved, then leftover records are re-checked 30 days later and any finding is shown to the Switch lead.

## Authority and Switch states (Q1, Q8)

21. As a staff member, I want Asym to be the only place supporter records and staff work change from the Switch Boundary, so that we never maintain two copies of the truth. [Q1 clause 2; Q1 clause 2 (Q9 amendment); Q1 clause 10; ADR-IM-001; ADR-IM-009]
    - **Acceptance:**
      - Given the Boundary has passed, then supporter identity, contact data, consent and restrictions, relationships, custom data, imported giving history and staff work change only in Asym, and no Phase 30 path writes them to the old system.
      - Given a list kept in the ministry's email tool, then its own unsubscribes, cleaned addresses and complaints return to Asym restrict-only, and this is the only inbound exception.
      - Given a charge the original processor executed, then Asym offers no refund, dispute or return action for it, because that processor stays authoritative.
      - Given go-live has happened, then no action exists that returns system-of-record authority to the old system.

22. As a Switch lead, I want Switch live and Switch closed shown as separate states and to be told how long to keep SiteStacker licensed, so that we never end the old system while it still owes donors charges, records or documents. [Q1 clause 2 (Q8 amendment); Q8 clause 6; ADR-IM-001; ADR-IM-008]
    - **Acceptance:**
      - Given go-live, then the Switch shows "Switch live" and never "migration complete" or "done".
      - Given any legacy executor not yet proved stopped, formally cut over or ended, or a tail not yet closed, then Switch closed is refused and the open items are listed.
      - Given SiteStacker's last charge has not run, the switch-off export taken after that charge is not in custody, or its tax documents for gifts recorded outside Asym are not issued, then recording the end of the SiteStacker licence is refused and each outstanding item is named. The Source Snapshot Manifest sealed at the Switch Boundary does not meet this gate. Once the last charge has run, that switch-off export is in custody and those tax documents are issued, the licence end can be recorded without waiting for tail closure.
      - Given Switch closed, then decommission sign-off remains a separate, later step.

23. As a staff member, I want every record a Switch wrote to show where it came from, so that any question about an imported fact can be traced to its source row. [Q1 clause 6; Q1 clause 8; Q1 clause 11; ADR-IM-001]
    - **Acceptance:**
      - Given a record the Switch wrote, then a staff member allowed to see that record can see its Switch, manifest, run and Source Record Binding.
      - Given a fact a Legacy Tail Backfill wrote, then it shows its import origin, naming the backfill and its source.
      - Given a legacy provider identifier, then it is shown only as inert source evidence and no Asym action uses it to charge, refund, update or contact anyone.

## Exact repeat import and convergence (Q1)

24. As a ministry member with Run the Switch, I want replaying the same manifest to change nothing and any other snapshot to converge on existing records, so that a re-import never creates a second identity or silently overwrites our work. [Q1 clause 5; ADR-IM-001]
    - **Acceptance:**
      - Given the same sealed manifest under the same mapping version, when it is imported again, then nothing is written and the run is shown as recognizing the earlier run.
      - Given a different snapshot, when its rows carry source IDs already bound, then they converge on the same Asym records and no second person, household or gift is created.
      - Given a field whose source value differs from the Asym value, then the difference appears as a source-changed conflict for reviewed correction, and the source value is never applied automatically.
      - Given a row present in an earlier snapshot and missing from a later one, then it is reported as missing and the Asym record is not deleted or changed.
      - Given the same rows saved into a file with different bytes, then they converge on the same records, because identity never rests on a file digest or manifest.

## Reconciliation (Q1, Q3, Q9, Q10, Q13)

25. As finance staff, I want every final-manifest row to have exactly one disposition and the accepted totals to tie to the export's own totals, so that Asym proves it committed exactly the reviewed plan. [Q1 clause 9; Q5 clause 7; Q13 clause 11; ADR-IM-001; ADR-IM-005; ADR-IM-013]
    - **Acceptance:**
      - Given a final manifest, then the number of dispositions equals the number of rows in each file, and a row with no disposition or with two blocks sign-off.
      - Given money families, then counts and native-currency totals are shown per Legal Entity × original currency × source basis, and no amount is converted or summed across currencies.
      - Given accepted and excluded totals, when they differ from the export's totals, then the difference is shown as a variance.
      - Given giving history, then a per-year breakdown shows count, total and distinct donors per Legal Entity × currency × year, plus totals per designation.

26. As finance staff, I want export totals tied to controls captured independently of the export, so that a truncated or filtered export cannot pass reconciliation by agreeing with itself. [Q1 clause 9; Q3 clause 4(d); Q3 clause 6; ADR-IM-001; ADR-IM-003]
    - **Acceptance:**
      - Given a control period, then export totals are compared with on-screen counts captured at export, the Statements report and processor reports for periods the ministry supplies.
      - Given a period with no available control, then it is declared "unavailable" with a reason and never shown as tied.
      - Given a template-profile Switch, then each control records its source as the old system's own report, its on-screen totals or a processor report, and no control can be derived from the template files.
      - Given two source bases for the same gift population and period without an overlap proof, then sign-off is refused.
      - Given Historic Giving ledger lines, then none is counted as a gift.

27. As a ministry member with Run the Switch, I want record counts for people, households, organizations and restrictions reconciled alongside money, so that no supporter, grouping or block is lost unnoticed. [Q1 clause 9; Q9 clause 1; Q10 clause 1; Q10 clause 6; ADR-IM-001; ADR-IM-009; ADR-IM-010]
    - **Acceptance:**
      - Given source person rows, then they equal Asym people created plus people matched plus rows excluded, and any difference is shown before sign-off.
      - Given source households with two or more members, then they equal the Asym households created, and any difference is shown before sign-off.
      - Given restrictions by type and source system, when the source count minus the Asym count is not zero, then sign-off is blocked.
      - Given source groups, then organizations created plus groups awaiting or given another classification equal the source total.

28. As a ministry member with Run the Switch, I want reconciliation sign-off allowed only when nothing is unexplained, so that a wrong total cannot be rubber-stamped. [Q1 clause 9; Q13 clause 11; Q20 clause 3; ADR-IM-001; ADR-IM-013; ADR-IM-020]
    - **Acceptance:**
      - Given any unexplained variance at either level, then sign-off is refused and the variance is named.
      - Given any Waiting row, then sign-off is refused.
      - Given the History spot check of 20 randomly chosen gifts and the 5 largest, when any shows a mismatch against the old system's own screens, then sign-off stops.
      - Given a sign-off, then it is bound to one report version, and a later change to that report shows the sign-off as no longer valid and the Switch as Needs attention.
      - Given a member without Run the Switch or an Asym specialist, when they attempt sign-off, then it is refused.

## Halting, aborting and reversing a Switch (Q1, Q6, Q15, Q18)

29. As a ministry member with Run the Switch, I want to halt any Switch or run at any time and to abort the Switch before go-live, so that a problem found late never forces us to go live. [Q1 clause 10; Q1 clause 10 (Q6 amendment); Q1 clause 10 (Q15 amendment); Q15 clause 5; ADR-IM-001; ADR-IM-006; ADR-IM-015]
    - **Acceptance:**
      - Given a running Switch run, when it is halted, then it stops after the current batch and records who halted it and when.
      - Given a Switch before go-live, when it is aborted, then its plans are discarded and the abort is recorded with who and when.
      - Given rows committed before an abort, then they stay invisible on every staff, donor and missionary surface, report and match, and none is deleted, unless the aborted Switch is later purged as abandoned, in which case their owners dispose of those never-visible rows.
      - Given a later Switch for the same ministry, then it converges on the same Source Record Bindings and creates no second identity.
      - Given an abort, then any Practice copy is destroyed within 24 hours.

30. As a ministry member with Run the Switch, I want a Switch run's results reversible only through Prepare reversal during the 30 days after go-live, so that mistakes can be corrected without ever handing authority back to the old system. [Q1 clause 10 (Q18 amendment); Q18 clause 3; Q18 clause 4; ADR-IM-001; ADR-IM-018]
    - **Acceptance:**
      - Given a Switch before go-live, then Prepare reversal is not offered on any Switch run.
      - Given go-live, then each Switch run offers Prepare reversal until 30 days after go-live, shown as an absolute date, time and named time zone.
      - Given a prepared import reversal on a Switch run, then People results are listed under Can be reversed now, through Phase 9, when they pass the People checks and under Stays as it is otherwise; Retired designations created from mapping, and restrictions, opt-outs and suppression evidence, are listed under Stays as it is with a plain reason; and every other family is listed under Needs its owner's correction, with a link to the owner's tool.
      - Given go-live, then no abort action is offered.

31. As a ministry admin, I want a Switch abandoned before go-live to be purged on a stated schedule, so that a ministry's files are never kept indefinitely. [Q1 clause 10 (Q15 amendment); Q15 clause 5; ADR-IM-015]
    - **Acceptance:**
      - Given 180 days without owner activity on a Switch aborted before go-live, then its files and staging are purged, with warnings at 150 and 173 days.
      - Given uploading, mapping, planning, committing or signing off, then the activity clock restarts, and viewing never restarts it.
      - Given a purged abandoned Switch, then its never-visible committed rows are disposed of by their owners.
      - Given a legal hold on the Switch, then no purge runs.

## Legacy Recurring Tail and Legacy Tail Backfills (Q1, Q7, Q8)

32. As finance staff, I want each Legacy Tail Backfill to bring in only append-only money facts, schedule and stop evidence, and restrict-only contact facts, so that the tail keeps money complete without overwriting what staff maintain in Asym. [Q1 clause 6; Q7 clause 7; Q9 clause 1; ADR-IM-001; ADR-IM-007; ADR-IM-009]
    - **Acceptance:**
      - Given a backfill, then it commits only settled charges, refunds, returns, chargebacks and dispute outcomes, schedule-state and stop evidence, and adverse contact facts (unsubscribe, do-not-contact, deceased, erasure).
      - Given a refund, return, chargeback or dispute outcome, then it links to its imported original by an exact scoped reference, and a fact with no exact Source Record Binding match waits in match review.
      - Given a backfill row whose name, address or email differs from Asym, then no supporter detail is created or changed and no Asym edit is overridden.
      - Given adverse contact facts, then they apply only to restrict and before every other fact in the same commit.
      - Given any backfilled gift, then the old system's receipt is kept as staff-only evidence.

33. As finance staff, I want exactly one authoritative gift source per executor and period, and replays that change nothing, so that no legacy charge is counted twice. [Q1 clause 6; Q7 clause 4; ADR-IM-001; ADR-IM-007]
    - **Acceptance:**
      - Given an executor and period, then exactly one source is accepted — the old system's exports for gifts it runs, or the ministry's own PayPal or processor reports for executors it does not record — and a second source for that executor and period is refused.
      - Given a processor-report row that cannot be attributed to a merchant account in the census, then it is not staged and only its count is shown.
      - Given a committed backfill is replayed, then nothing changes and each arrangement end is recorded once.
      - Given an older export applied after a newer one, then no covered-through date moves backwards and the staler state is refused in review.

34. As a Switch lead, I want backfills to follow a fixed cadence and to be reminded once when one is overdue, so that the tail stays current without a flood of alerts. [Q7 clause 4 (Q8 amendment); Q8 clause 6; Q8 clause 7; ADR-IM-007; ADR-IM-008]
    - **Acceptance:**
      - Given a tail, then backfills are planned weekly until the last old charge and every four weeks after it until the reversal window closes.
      - Given a backfill overdue by its cadence plus 7 days (14 days for a weekly cadence, 21 for a fortnightly one), then the Switch lead receives exactly one reminder and no per-arrangement incident is raised.
      - Given a legacy arrangement, then its Phase 16 manual review interval is shown as the cadence plus 7 days.

35. As finance staff, I want every backfill reviewed with its stops, continuations, leaks and possible double giving before commit, so that approving a backfill is a deliberate check of data and nothing else. [Q1 clause 6; Q1 clause 7; Q7 clause 1; Q7 clause 5; Q7 clause 8; ADR-IM-001; ADR-IM-007; depends on O33, O34]
    - **Acceptance:**
      - Given a planned backfill, then before commit its review lists stops, continuations, leaks (one-off or new gifts through the old system) and possible double giving, each with counts.
      - Given a leak from a surface attested Off at boundary, then it is shown as contradicting that disposition.
      - Given a backfill, then commit is refused until a member with Run the Switch re-confirms every Legacy Surface Disposition and the cycle's overlap-and-gap check has run.
      - Given an approved backfill, then approval commits data only: no Workflow Studio backfill request is created and no automation activates.
      - Given the owner gates for Recorded outside Asym and the zero-donor-messages test have not passed, then no backfill commits for any ministry.

36. As a ministry member with Run the Switch, I want a tail closure date recorded at go/no-go and every legacy arrangement resolved at closure, so that the Legacy Recurring Tail has a definite end. [Q1 clause 6; Q4 clause 1; ADR-IM-001; ADR-IM-004]
    - **Acceptance:**
      - Given go/no-go, then the proposed tail closure date is no later than 12 months after go-live, and any later date is accepted only as a recorded ministry extension with a reason.
      - Given tail closure, when any legacy arrangement is not handed over through Phase 16, ended with donor notice and a restart invitation, or reclassified by Phase 16 as an ongoing external arrangement, then closure is refused and the arrangement is named.
      - Given an arrangement reclassified as ongoing external, then its later facts enter only through a Phase 13 or Phase 15 owner intake and are documented by Asym as first recorded in Asym.
      - Given a closed tail, then no backfill can be planned or committed for that Switch.

## Legacy Surface Dispositions (Q1, Q4, Q7, Q17)

37. As a ministry member with Run the Switch, I want to record one state for every outward surface per Site, Site Channel or list before Asym sends or automates anything, so that every donor-facing duty has a known owner. [Q1 clause 7; Q1 clause 7 (Q17 amendment); ADR-IM-001; ADR-IM-017]
    - **Acceptance:**
      - Given a surface, then its state is exactly one of Off at boundary; Kept on through tail; Not used; Outside the ministry's control; or, for a moved hostname, Pointed to Asym.
      - Given Kept on through tail without a named owner and end condition, then it is refused.
      - Given any surface without a state, then no Asym sending or automation activates for the Tenant.
      - Given a recorded state, then it shows as "ministry attested" with who and when.

38. As a ministry member with Run the Switch, I want each known surface proposed in the right state, so that the old system keeps the duties its remaining donors still need and stops everything else. [Q1 clause 7; Q1 clause 7 (Q4 and Q7 amendments); Q4 clause 3(c); Q7 clause 2; ADR-IM-001; ADR-IM-004; ADR-IM-007]
    - **Acceptance:**
      - Given giving forms and checkout; giving links, QR codes and text-to-give targets; appeal and record-changing automations; organization Mailchimp sync; old-system imports and rollbacks; and staff CRM editing, then each can be recorded only as Off at boundary or Not used; staff gift entry in the old system can be recorded only as Off at boundary.
      - Given the recurring engine; tax documents for gifts recorded outside Asym; recurring confirmation and reminder messages; the declined-payment message and update link; and the donor cancel and update path, then each is proposed as Kept on through tail until each cohort is handed over or ended.
      - Given the old system's thank-you messages and its gift notices to staff and missionaries for gifts it charges, then they are one surface setting proposed as Kept on through tail, and the record-changing steps of any bundled automation are Off.
      - Given the old system's cancellation messages when it ends a schedule at a move, then their on or off state is a recorded ministry setting.
      - Given missionary-owned Mailchimp lists, gateway-sent emails and PayPal notices, then they are proposed as Outside the ministry's control.

39. As a Switch lead, I want each donor-facing duty owned by exactly one system per cohort and checked every cycle, so that donors are never thanked, receipted or reminded twice or not at all. [Q1 clause 7; Q1 clause 7 (Q4 amendment); Q4 clause 1; Q4 clause 3(a); ADR-IM-001; ADR-IM-004]
    - **Acceptance:**
      - Given a donor-facing duty and cohort with two responsible systems or none, then the overlap-and-gap check shows it and the Switch shows Needs attention.
      - Given gifts the old system charges, then Asym is never recorded as issuing their tax documents, and only the issuer the census names for that cohort (old-system documents, another receipting tool or the ministry manually) is recorded as documenting them.
      - Given a clean check, then it reads "No known overlap in the inspected scope" with the inspected scope recorded, and no screen claims the old system was frozen or switched off.
      - Given every backfill, then the dispositions are re-confirmed and the check runs again.

## Switch-year tax documents (Q4)

40. As finance staff, I want every gift that reaches Asym through a Switch history import or a Legacy Tail Backfill to carry Recorded outside Asym from the moment it is written, so that Asym can never issue a second tax document for a gift another system recorded first. [Q4 clause 1; Q4 clause 2; Q4 clause 7; Q4 clause 1 (Q12 amendment); ADR-IM-004; depends on O13, O22, O24]
    - **Acceptance:**
      - Given a money fact committed by a Switch history import or a backfill, then exactly one Recorded outside Asym fact is written with it, and a commit that cannot write it fails and writes nothing.
      - Given a correction, re-dating, donor merge, refund or reversal, then the fact remains, and linked reversals and corrections inherit it.
      - Given the fact, then it carries the source system and, where the export has them, the previous receipt number and date as staff-only evidence.
      - Given the owner commands that write the fact do not yet exist, or the prototype portal receipt link and text statement are not yet retired, then no Switch giving history and no Legacy Tail Backfill money can commit.
      - Given a Gift file in an everyday import, then none of its rows carries Recorded outside Asym.

41. As finance staff, I want Asym to issue no tax document for a gift recorded outside Asym and to decide every gift's issuer by where it was first recorded, never by its date, so that each gift has exactly one issuer. [Q4 clause 1; Q4 clause 2; ADR-IM-004; depends on O22, O23]
    - **Acceptance:**
      - Given a gift carrying Recorded outside Asym, then it has no receipt plan, acknowledgment, Canadian plan fact, official-document line or Late Fact Obligation, including after Canadian receipting activates, a correction, a merge or a refund.
      - Given Canadian receipting active from time T, then a gift imported at T plus 1 millisecond has no plan fact, while a gift first recorded in Asym at T plus 1 millisecond has exactly one.
      - Given a check postmarked before the Boundary but first recorded in Asym, then Asym documents it under Phase 7 rules.
      - Given a tail arrangement reclassified as ongoing external, then its later gifts, entered through an owner intake, are documented by Asym.

42. As finance staff, I want gift detail and year totals to show plainly which gifts were recorded outside Asym, so that I can answer donor questions without guessing which system documented a gift. [Q4 clause 2; Q4 clause 5; ADR-IM-004]
    - **Acceptance:**
      - Given such a gift, then staff gift detail shows "Recorded outside Asym — {source system}, {Switch or backfill reference}".
      - Given the previous receipt number and date, then only authorized staff of that Tenant can see them, and donors and missionaries never can.
      - Given a year, then its previous-system and Asym-recorded totals add up to the year total.
      - Given a refund or correction of such a gift, then staff see that receipt corrections for it belong to the previous system.

43. As a donor, I want my giving history to include gifts from the previous system with plain notes about their tax documents, so that my totals are complete and I know where each receipt comes from. [Q4 clause 5; ADR-IM-004; depends on O24]
    - **Acceptance:**
      - Given gifts recorded outside Asym, then they appear in giving history and "This year so far" by their imported gift date.
      - Given such a gift, then its detail says the ministry sends its tax receipt separately and that it is not in statements here; Receipts & statements carries one note for the affected year; and the year total carries one line stating the previous-system portion.
      - Given such a gift, then no receipt action is offered, and no donor-facing text says "not a tax receipt", "not a tax document" or "not deductible".
      - Given a donor with no such gifts, then none of these sentences appears, and the Support overview is unchanged for every donor.

44. As a ministry admin, I want a donor notice worded by system, with a Canadian variant, that we send ourselves, so that donors understand why some documents come from the previous system. [Q4 clause 6; ADR-IM-004]
    - **Acceptance:**
      - Given the notice template, then it renders the ministry name and the previous system's name, and adds the tail sentence when a tail cohort exists.
      - Given a Canadian issuing Legal Entity, then the Canadian variant is offered.
      - Given the notice, then it is worded by system and never by date.
      - Given the notice is produced or previewed, or any import runs, then nothing is sent to any donor.

45. As finance staff, I want an imported or backfilled gift that may duplicate an Asym-recorded gift to wait for my decision, so that a check keyed into both systems is never counted or receipted twice. [Q4 clause 3(d); Q4 clause 3(d) (Q7 amendment); ADR-IM-004; ADR-IM-007]
    - **Acceptance:**
      - Given an imported or backfilled gift with the same matched Party and amount as an Asym-recorded gift, dates within 7 days and the same check number where present, then it waits for a staff decision.
      - Given the same gift dated 8 days apart, then it is not flagged.
      - Given a confirmed duplicate, then it is excluded with a reason and staff are prompted to check whether both systems issued a receipt.
      - Given a legacy charge after a move, then it is never excluded as a duplicate.

## Deciding and leading a Switch (Q5, Q19, Q20)

46. As a ministry admin, I want every Switch decision to require the Run the Switch permission, so that only people the ministry chose can commit it to anything. [Q5 clause 1 (Q20 amendment); Q20 clause 1; Q20 clause 2; Q20 clause 3; Q15 clause 9; ADR-IM-005; ADR-IM-015; ADR-IM-020; depends on O102, O74]
    - **Acceptance:**
      - Given a member without Run the Switch, when they attempt to start a Switch, answer the census, record a disposition or attestation, make a plan or match decision, enter reconciliation controls, sign off, commit, close the tail, decommission, reassign the lead, manage Practice copies, or place or release a Legal hold, then the action is refused and nothing changes.
      - Given any Asym identity, then every Switch decision is refused and it holds no Data Tools permission; the one exception is a Legal hold, which Asym's named legal role may place, and release with a reason, through its own Phase 12 legal-hold capability rather than any Data Tools permission, without reading any content.
      - Given a money commit, then it also requires the money owner's permission; creating a field also requires Phase 11's; and a history correction requires its own.
      - Given one member who holds every needed permission, then they can complete every decision alone, with no forced second person.
      - Given Data Tools launches, then only the Owner group holds Data Tools Admin, which includes Run the Switch as a sensitive permission, and no existing user gains anything new.

47. As a ministry member with Run the Switch, I want each Switch to name a Switch lead who receives its notices, so that someone is always accountable without that designation granting any power. [Q5 clause 1; Q20 clause 3; ADR-IM-005; ADR-IM-020]
    - **Acceptance:**
      - Given a new Switch, then its Switch lead defaults to the member who created it.
      - Given a member with Run the Switch, when they reassign the lead, then the change is recorded with who, when and the previous lead.
      - Given a Switch lead without Run the Switch, when they attempt any decision, then it is refused.
      - Given a Switch with no lead, including after the lead's membership ends, then go/no-go and every sign-off are refused until a lead is assigned, and the Switch shows Needs attention.

48. As a Switch lead, I want the Switch's notices, reminders and remaining tasks brought to me, so that nothing waiting on the ministry is missed. [Q5 clause 1 (Q19 amendment); Q5 clause 8; Q19 clause 8; Q19 clause 10; ADR-IM-005; ADR-IM-019; depends on O96, O97]
    - **Acceptance:**
      - Given an open item or a deadline, then the Switch lead is reminded through Phase 17 staff notifications, in-app first and by email only if unread, never duplicating a Tasks Hub item.
      - Given the Switch tab, then it lists tasks under Get ready · Prepare and practise · Decide · Switch day · After go-live · Close, each with a status (Not started, In progress, Needs attention, Done, or Cannot start yet with its reason), one line saying what it is, its link and "Last updated by {name}, {date}", and no assignments.
      - Given a recorded decision, then the matching task's status changes without anyone editing the task list.
      - Given Data Tools before go-live, then it opens on the Switch tab; after go-live it opens on Imports with a Switch banner while Switch tasks need attention; after Switch closed the Switch tab is a read-only record.

49. As a ministry admin, I want to complete our whole Switch without granting Asym any access, with coaching on our own screen if we want it, so that our data stays under our control. [Q5 clause 2; Q5 clause 2 (Q20 amendment); Q20 clause 13; ADR-IM-005; ADR-IM-020]
    - **Acceptance:**
      - Given a Switch with zero Asym help access grants, then every step from census to decommission can be completed by ministry members alone.
      - Given the Hide values switch is turned on, then every value on Data Tools pages is hidden for the current session, and turning it off never reveals more than the person may already see.
      - Given Asym coaching, then it happens on the ministry's own screen, which the ministry drives, with no recording, transcription, AI notetaker or remote control and no file exchanged outside the product, and the ministry member sharing their screen has Hide values turned on.

50. As a ministry admin, I want to give a helper only the Data Tools access the Switch needs, ending by default on the day the Switch closes, so that outside help never outlasts the work. [Q5 clause 3 (Q20 amendment); Q20 clause 12; ADR-IM-005; ADR-IM-020; depends on O27, O105]
    - **Acceptance:**
      - Given a helper, then they receive an ordinary Data Tools grant (usually Manage, or Prepare only) with an end date that defaults to the day the Switch closes and is shown wherever the grant is listed.
      - Given the grant's end date has arrived, including a grant left on its default end date, which ends when Switch closed is recorded, then the helper's next Data Tools action is refused, while Switch closed does not end a grant the ministry gave a different end date.
      - Given the ministry cannot yet grant scoped, expiring access itself, then no outside helper can be added.
      - Given any screen, then Asym endorses no helper and offers no partner programme.
      - Given an uncleared helper, then the restricted-data floor applies to them exactly as to any uncleared member.

## Restricted-data floor and narrowing (Q2, Q5, Q11, Q20)

51. As a cleared ministry member, I want a real Switch export to stay restricted until a cleared member narrows it, so that restricted workers are never exposed to helpers, uncleared staff or Asym. [Q2 clause 5(e); Q5 clause 4; Q11 clause 4 (Q20 amendment); Q20 clause 4; Q20 clause 5; ADR-IM-002; ADR-IM-005; ADR-IM-020]
    - **Acceptance:**
      - Given a real Switch export is uploaded, then the whole file is classified restricted by default.
      - Given an un-narrowed file, then uncleared members, helpers and Asym help access see only headers, counts and validation summaries, and see restricted people only by alias.
      - Given a Switch real export, then the source fund names in it are shown only to cleared members, before and after narrowing, and others see each fund's counts without its name.
      - Given an everyday import, then it is not restricted by this floor, because it is the ministry's own file.

52. As a cleared ministry member with Run the Switch, I want to narrow a Switch export column by column or declare that the file names no restricted person, so that helpers and uncleared staff can prepare the rest. [Q5 clause 4 (Q20 amendment); Q11 clause 4 (Q20 amendment); Q20 clause 3; Q20 clause 4; ADR-IM-005; ADR-IM-020]
    - **Acceptance:**
      - Given a member without clearance or without Run the Switch, when they attempt to narrow, then it is refused.
      - Given narrowing, then it is recorded column by column or as a whole-file declaration, with who, when and its scope.
      - Given a free-text column such as names, memos, notes or fund names, then it is narrowed only after an explicit confirmation that it names no restricted person.
      - Given a narrowed column, then Manage holders see its values, except source fund names, which stay visible only to cleared members; until a column is narrowed, its values stay hidden from uncleared members, helpers and Asym help access, who see only headers, counts and validation summaries, while cleared Manage holders and the cleared member with Run the Switch who narrows it can see them.

## Asym help access (Q5, Q6, Q20)

53. As a ministry member who may manage access, I want to approve or decline an Asym specialist's request for help on one Switch, for a fixed period I choose, so that hands-on help happens only when and for as long as we allow. [Q5 clause 5; ADR-IM-005; depends on O26]
    - **Acceptance:**
      - Given a request, then it names one MFA-protected Asym specialist, one Switch and a reason, and an unanswered request expires after 7 days.
      - Given approval by one member who may manage access, then the access lasts 7, 14 or 30 days, ending at 11:59 pm in the ministry's giving time zone, at Switch closed or on revocation, whichever comes first, and the end is shown.
      - Given access has ended, when more help is needed, including for tail backfills, then a new request and approval are required, and no grant reopens or extends in place.
      - Given any Asym path, when it attempts to approve a request or to create, elevate or replace the approving member, then it is refused and logged.
      - Given a request, an approval or an expiry, then the ministry is emailed.

54. As an Asym specialist under Asym help access, I want to map, run practice runs, triage issues and prepare plan and match proposals on the Switch I was granted, so that I can do preparation work without deciding anything for the ministry. [Q5 clause 5 (Q6 and Q20 amendments); Q20 clause 12; ADR-IM-005; ADR-IM-006; ADR-IM-020; depends on O26]
    - **Acceptance:**
      - Given an active grant, then mapping, practice runs, issue triage and plan and match proposals succeed.
      - Given an active grant, when the specialist attempts to commit, decide, attest, answer the census, enter reconciliation controls, send, change consent, upload, preview or download a file, export, or grant clearance or permissions, then it is refused.
      - Given an active grant, then the specialist sees only the Switch tab and its preparation actions, and never the everyday Imports list, import names, values before narrowing or downloads.
      - Given a Practice copy, then the specialist cannot sign in to it.
      - Given grants on two Tenants, then each request acts in one Tenant only and each job carries exactly one Tenant and one grant.

55. As a ministry member who may manage access, I want to revoke Asym help access at any time, with the specialist's running work pausing safely, so that ending access never damages our data. [Q5 clause 5; Q20 clause 11; ADR-IM-005; ADR-IM-020; depends on O26]
    - **Acceptance:**
      - Given revocation, then the specialist's next action is refused.
      - Given a practice run the specialist started, when access is revoked or expires, then the run pauses at its next chunk, the pause is recorded, and target data is unchanged.
      - Given a paused run, then a ministry member holding the needed permissions can resume it under their own name.

56. As a ministry member with Run the Switch, I want every action and proposal made under Asym help access shown as Asym's in the Switch history, so that we never mistake prepared work for our own decision. [Q5 clause 5; ADR-IM-005; depends on O26]
    - **Acceptance:**
      - Given a specialist action or proposal, then the ministry-visible Switch history shows it as "{name} · Asym".
      - Given a decision that relies on prepared work, then the decider sees which parts were prepared under Asym help access before deciding.
      - Given an audit record, then it carries the server-derived principal type and grant, and an attempt to record an action under an arbitrary actor is refused.

## Honest boundary and Asym's conduct (Q2, Q5, Q11)

57. As a ministry admin, I want Asym's hands-on access to our data to happen only through the access we approve, with any incident or legal access shown to us afterwards, so that we can trust what Asym says about access. [Q5 clause 6; ADR-IM-005; depends on O26]
    - **Acceptance:**
      - Given an Asym specialist, when they attempt to act in the Tenant through super-admin power, a shared or borrowed login, impersonation or a ministry membership, then it is refused.
      - Given Switch help, then no Asym specialist reads or changes Tenant data outside the product's own screens.
      - Given incident or legal access, then it is a separate, logged path and is shown to the ministry afterwards unless the law forbids it.
      - Given any product copy, then none claims Asym can never access ministry data.

58. As a ministry admin, I want Asym to follow our Switch only through content-free status and to make no promises it has not proven, so that monitoring never becomes access and claims never outrun evidence. [Q5 clause 8; Q5 clause 9; ADR-IM-005]
    - **Acceptance:**
      - Given Asym's monitoring, then it shows only stage, dates, counts and job health, with no row content.
      - Given Asym's help log, then it holds no ministry content.
      - Given no Switch has yet gone live with coaching only, then no Source profile is described as "self-serve" or "no help needed".
      - Given the design partner's Switch, then it is planned on coaching alone, and Asym help access is used only after its prerequisites are verified.

## Evidence classes and Source profile status (Q2, Q3, Q6, Q11)

59. As a ministry admin evaluating a Switch, I want each Source profile to show an honest status, so that I know what Asym has proven for my kind of source. [Q2 clause 2; Q3 clause 5; ADR-IM-002; ADR-IM-003]
    - **Acceptance:**
      - Given any Source profile, then its status is exactly one of Unavailable, Pilot-qualified or Supported, and never "beta", "certified" or "compatible".
      - Given a profile is Unavailable, then no Switch can be scheduled on it; given it becomes Pilot-qualified, then only the design partner's Switch can be scheduled on it until it is Supported.
      - Given a Supported profile, then its status names the export surfaces, source version range and exporter permission level actually exercised.
      - Given any later installation on a Supported profile, then header pre-flight and its own practice runs are still required.
      - Given the template profile, then it follows the same ladder, and its status describes the template format, never a vendor.

60. As an Asym relationship owner, I want a profile's status to move only on representative real evidence from production, so that a source is never called supported on the strength of test material. [Q2 clause 1; Q2 clause 2 (Q6 amendment); Q2 clause 8; Q6 clause 8; ADR-IM-002; ADR-IM-006]
    - **Acceptance:**
      - Given only synthetic evidence or vendor-format samples, then no profile can move above Unavailable.
      - Given Practice copy results, then they cannot qualify a profile, replace reconciliation sign-off, satisfy "recovery exercised" or meet the zero-effect acceptance gate.
      - Given the pilot Switch, then "recovery exercised" is met only by production evidence: a planned interruption and resume of one commit stage, or a real recovery.
      - Given no willing ministry by the founder's checkpoint, then the profile stays Unavailable and is never shown as "beta".

61. As a prospective ministry admin, I want to describe our current system in a short guided session and an optional detailed worksheet without sharing any donor data, so that Asym can plan for our source before any agreement exists. [Q2 clause 3; Q2 clause 3(i); Q2 clause 9; ADR-IM-002]
    - **Acceptance:**
      - Given a willing ministry, then no discovery work (the Discovery declaration, fake-record exports or header captures) starts until Asym names a relationship owner and an evidence custodian, the ministry names its admin, and the ministry consents in writing having been told the effort and risks.
      - Given the declaration, then its short tier fits one guided 60–90 minute session and every detailed-worksheet question accepts "I don't know".
      - Given the declaration, then it covers version and hosting, Sites and channels, modules, processors per Site and currency, recurring executors and PayPal, Historic Giving use, statement production, record types and custom fields, visibility restrictions, automations and integrations, and local volume figures the admin measures on their own machine.
      - Given any question or upload, then it never asks for or accepts credentials, card, bank or account numbers, or donor data.

62. As an Asym evidence custodian, I want fake-record exports and header captures made only after the ministry confirms nothing will fire, so that discovery never triggers the ministry's live automations or exposes a real person. [Q2 clause 3; Q2 clause 3(ii); Q2 clause 3(iii); ADR-IM-002]
    - **Acceptance:**
      - Given the ministry admin has not reviewed the installation's automation configuration, including its person update, CRM entity create and update, person type assignment, person relation assignment and report export events, and confirmed in writing that creating and exporting the test records fires nothing, then no fake-record export is requested.
      - Given fake records, then they are CRM records only: about six marked fake people and one organization that together cover a household, several emails and addresses, a non-Latin script, a 4-byte character, embedded quotes and line breaks, long values and every custom-field type; every email is an undeliverable example.org address; no real worker name, location or photo is used; there are no gifts or transactions, no logins, no newsletter lists or Mailchimp, and no record type or workflow used by automations; each export is filtered to the marked records with a row count equal to the planted count and is exported twice, each record's creation time is noted for time-zone evidence, and the records are deleted by a recorded date.
      - Given a marked fake record later found in a real export, then it is a Visible exclusion.
      - Given header captures, then one is made for every kit export surface (CRM; Contributions transaction, designation, recurring and batch; newsletter; Statements and reports; entity definitions; the Mailchimp export), preferably as a zero-row or marked-row export file and otherwise as the header line copied from a text editor; each records the source version, filter, exporter permission group, on-screen count and encoding and line-ending readout, and is treated as confidential because its labels can name workers, places or programmes.
      - Given the ministry's existing SiteStacker "Is Testing" transactions, then they are treated as real records: they are never requested or accepted as discovery material, in a fake-record export or a header capture, and they wait for the real-export gates in story 64.

63. As an Asym evidence custodian, I want all discovery material held privately, screened before anyone else sees it and tracked in an evidence register, so that ministry material never leaks into public places or tools. [Q2 clause 4; Q2 clause 4 (Q11 amendment); Q2 clause 7; ADR-IM-002; ADR-IM-011]
    - **Acceptance:**
      - Given any discovery material, then it lives only in a private, access-controlled store, and anything committed refers to the ministry by a pseudonym.
      - Given a received file, then the evidence custodian screens it before any other person or tool sees it, and no AI tool processes any discovery material until screening shows it holds no personal data; when screening finds an unmarked real row, the file is quarantined, every copy is deleted, the ministry is notified and an incident is recorded.
      - Given each artifact, then the register records its class, installation pseudonym, version, surface, filter, exporter group, on-screen count, encoding readout, collector, date, screening result, state (received, screened, accepted or quarantined, superseded, disposed) and disposal date, and the material is disposed once real-run evidence supersedes it or the engagement ends.
      - Given committed test fixtures, then each is Asym-authored synthetic material citing a register id, and no received file is ever committed.
      - Given WMTEK, then it is asked only generic questions unless the ministry consents to being named.
      - Given a discovery screen-share session, then it shows no person data and is neither recorded nor transcribed.

64. As a ministry admin, I want our real donor exports to enter Asym only after every protective gate is in place, so that real supporters are never exposed before an agreement and qualified custody exist. [Q2 clause 5; Q2 clause 9; Q2 clause 4 (Q11 amendment); Q6; ADR-IM-002; ADR-IM-006; ADR-IM-011; depends on O19, O31]
    - **Acceptance:**
      - Given any of a signed agreement with data-processing terms, the ministry onboarded as its own Tenant with single-installation checks, an Approved environment, a qualified staff-migration custody profile, a complete retained-state census, or a fresh readiness census is missing, or the O31 pre-real-data fixes are not live, then upload of a real export is refused.
      - Given the first real export, then it is accepted only as a practice-run input.
      - Given a real export at intake, when its headers, encoding or version differ from the evidence register, then the difference is shown and the related findings are reopened.
      - Given the export set, then it follows the kit's export checklist, and families the kit does not need are recorded as exclusions.
      - Given any real export, header, sample value, error output or screenshot, then no AI tool processes it, and mapping uses no AI and no hosted or embedded importer service.
      - Given the signed agreement, then it counts only when counsel has reviewed it, named people have signed it, it covers at least roles, purpose, export scope, subprocessors (including any AI tool), hosting region, access, retention including backups, deletion and breach notice, and counsel has decided the special-category basis; and no real export is accepted until an environment approver who did not build the environment, a legal owner and the signatories are named.

65. As an Asym environment approver, I want an environment approved for real personal data only by my live read-back of an environment I did not build, so that no real export lands where it could be read by the wrong people. [Q2 clause 6; Q2 clause 6 (Q5 and Q6 amendments); Q5 clause 6; ADR-IM-002; ADR-IM-005; ADR-IM-006; depends on O20]
    - **Acceptance:**
      - Given an approver who built the environment, then approval is refused.
      - Given a read-back, then it confirms applied migrations match the release under test, no read rule on person or money data admits anonymous users or every row, the staff-migration custody profile is qualified, no destructive script defaults to the environment, and its real-data status and hosting region are recorded.
      - Given the read-back before the first real export, then it also confirms no super-admin or role-string escape on person, money, Phase 29 or Phase 30 data, or that nobody holds super-admin there, and any failure refuses approval.
      - Given a non-production environment, then a real export upload is refused. The Approved Practice environment receives the staged plan through a Practice copy build, never raw source files, and only once the gates for a real export hold.
      - Given the Practice environment, then approval also requires no live credentials, no public routes and email captured in the Practice outbox.

## Source tiers and Import templates (Q3, Q11)

66. As a ministry admin, I want Data Tools to show two plain starting points and each Switch's tier, so that I know whether Asym directly supports my source or I am bringing it through templates. [Q3 clause 1; Q3 clause 2; Q3 clause 3; Q3 clause 7; ADR-IM-003]
    - **Acceptance:**
      - Given the Switch tab, then it offers a SiteStacker migration (Direct support) and bringing data from another system (Reviewed transformation).
      - Given any Switch screen, then it shows the Switch's tier.
      - Given any screen, then no vendor other than SiteStacker is named as supported and no vendor preset is offered, and template guidance mentions vendor exports only as research input.
      - Given source data in neither tier, then it is shown as Unsupported, a Visible exclusion with a reason.
      - Given the first release, then no named vendor profile, API pull, or TntConnect or MPDX staff import is offered.

67. As a ministry member preparing a template-path Switch, I want per-Tenant Import templates and validation that catches spreadsheet damage, so that a re-import never duplicates people or misreads dates. [Q3 clause 3; Q3 clause 3 (Q9 and Q16 amendments); Q3 clause 4(a); Q3 clause 4(b); ADR-IM-003; ADR-IM-009; ADR-IM-016; depends on O21]
    - **Acceptance:**
      - Given a template-profile Switch, then its template families are Parties and households; contact points with explicit consent and adverse-evidence columns, both carried as evidence (story 68); relationships; custom fields and collections, with collections only into those the ministry created first (story 194); one-time giving history with reversals, and soft credits and tributes where their owners allow; and recurring evidence for the Phase 16 classifier; and each family's template is generated for this Tenant from its field catalog and the owner's template descriptor, offered first as XLSX with text-typed ID, date, postal-code and phone columns, with CSV accepted.
      - Given an ID in scientific notation, such as "1.23457E+11", then the row is refused with a message naming its row and column.
      - Given an ID that has detectably lost leading zeros, then the row is refused.
      - Given an ambiguous date, such as "03/04/2025" with no declared format, then it is refused and never guessed.
      - Given a row without a source ID, then it is blocked because it cannot converge on re-import, and the ministry may assign IDs before the first practice run.
      - Given a money family whose owner has not published a template descriptor, then no template is offered for it.

68. As a ministry member preparing a template-path Switch, I want to map my own export's columns to template fields at upload, so that I reshape data only where its structure truly differs. [Q3 clause 3 (Q9 and Q11 amendments); ADR-IM-003; ADR-IM-009; ADR-IM-011]
    - **Acceptance:**
      - Given a file whose headers exactly match a remembered mapping for this Tenant and source, then that mapping is offered for one-click confirmation, and a file with any header difference is not matched to it.
      - Given no remembered mapping, then suggestions come from the Common-header list and then from labelled fuzzy matches, and no match is applied until a person confirms it.
      - Given template rows, then they link to each other by the old system's IDs.
      - Given consent columns, then they are stored as evidence and never become an email permission except through the adoption rules, and restriction columns commit first.

69. As a ministry admin, I want data Asym cannot take shown as Visible exclusions with reasons and, for history, a Coverage start, so that nobody draws conclusions from history that is missing. [Q3 clause 6; Q3 clause 9; ADR-IM-003]
    - **Acceptance:**
      - Given SiteStacker data with no self-serve export that the ministry cannot export under the same gates, then it is a Visible exclusion reading "history before {date} not covered".
      - Given a declared Coverage start, then first-gift, lapsed and first-support conclusions that need earlier history are blocked and shown as such, never guessed.
      - Given Historic Giving ledger lines, then they are never imported as gifts and are offered to Phase 21 as opening evidence only.
      - Given card and bank numbers, credentials, logins and password hashes, automations and workflow definitions as live behaviour, or child sponsorship, then none is imported and each appears as a Visible exclusion with a reason.

## Practice runs (Q6, Q10)

70. As a ministry member with Run the Switch, I want each practice run to stage the whole Switch from one set of exports and show what would happen, so that problems are fixed at the source before the final export. [Q6 clause 1; Q1 clause 3; ADR-IM-006]
    - **Acceptance:**
      - Given a practice run, then every family is staged together and gifts, relationships and custom data point to practice donors by old-system ID.
      - Given a practice run, then it shows per-family create, update, skip and review counts, both reconciliation levels, the issue list, and a staged-record view with each record's source file, row and ID.
      - Given a practice run, then live record counts are unchanged afterwards and no outward effect occurs.
      - Given a new practice run, then it replaces the previous one, and practice runs are listed on the Switch tab, never on the Imports list.

71. As a Switch lead, I want every Minimum Switch Kit area to check every row under its own commit rules without saving, so that the practice run predicts the real commit. [Q6 clause 1; ADR-IM-006; depends on O28]
    - **Acceptance:**
      - Given a practice run, then each kit area returns a per-row verdict without writing to its records.
      - Given an area whose check works by writing and rolling back, then it does not count as a no-write check and the area is shown as not yet checkable.
      - Given the real commit, then it re-checks every row, and a row the commit refuses becomes a Waiting row with its reason.

## Practice copies and the Practice environment (Q6)

72. As a ministry member with Run the Switch, I want to build a Practice copy from a practice run and commit it through the real import commands, so that we can time every family and see any row the plan accepted but the commit rejected. [Q6 clause 2; ADR-IM-006; depends on O30]
    - **Acceptance:**
      - Given a build, then the plan is committed through the same owner import commands, omitting only the Boundary and go-live steps, into a Practice copy in the Practice environment and never into the live Tenant.
      - Given a dress rehearsal, then it records per-family durations and one forced interruption and resume.
      - Given a row the plan accepted but the commit rejected, then it is listed as a mismatch and go/no-go is refused while it is unresolved.
      - Given a copy, then it records its mapping version and release, and go/no-go accepts only the latest copy built on the current ones.
      - Given a build that fails partway, then the copy is destroyed and the Switch shows the failure and the family where it stopped, with progress shown as per-family counts and no promised finish time.

73. As an Asym operator, I want the Practice environment to be a separate Approved environment with every outward door closed, so that nothing done in a Practice copy can reach a donor, a processor or the public. [Q6 clause 3; ADR-IM-006; depends on O29, O31]
    - **Acceptance:**
      - Given the Practice environment, then it has its own database and deployment in production's region at production's compute size, is deployed and migrated with every production release, and refuses a copy build when its release or migration state differs from production's.
      - Given the Practice environment, then it has no live or production credentials, public routes, donor or missionary apps, or sign-up.
      - Given an attempt to add provider keys, domains, webhooks, settlement bindings, integrations, AI or a tax-document issuer, then it is refused.
      - Given mail to anyone outside a copy's access list, from any send path including sign-in and content emails, then it lands in the Practice outbox and is never sent externally.
      - Given the daily settings check, when any forbidden item is present, then the check fails and alerts.

74. As a privacy officer, I want a Practice copy to hold only what the rehearsal needs and to send nothing back, so that a copy can never become a second live account. [Q6 clause 4; ADR-IM-006; depends on O30]
    - **Acceptance:**
      - Given a copy, then it holds the Tenant's allowlisted configuration, the existing records the plan references (keeping production IDs) and the practice run's rows.
      - Given a copy, then it never holds credentials, settlement bindings, hosts, giving addresses, issuer or serial state, integrations, grants, logins or source files.
      - Given any table, then it is classified as copied, matched-only or never copied, and a release that adds an unclassified table fails its release check.
      - Given a copy, then it can never be promoted, and nothing returns from it to production except content-free status.

75. As a staff member invited to a Practice copy, I want to click through our rehearsed data with my real role and clear labelling, so that I learn the new system without risking live records. [Q6 clause 5; ADR-IM-006; depends on O30]
    - **Acceptance:**
      - Given a member with Run the Switch, then they choose which current members may enter, and each gets their real role and clearance, with production removals and reductions applied within 15 minutes.
      - Given a donor, missionary or any Asym staff member, including one under Asym help access, then sign-in to the copy is refused.
      - Given a staff member in the copy, then they can view, edit, try workflows and run on-screen reports, and every change is deleted with the copy.
      - Given an action that is unavailable, then it says "Not available in a practice copy".
      - Given any page, then it shows a persistent text banner and a "Practice copy ·" page-title prefix on a separate host, never colour alone, and the banner is announced to screen readers.

76. As a ministry member with Run the Switch, I want a Practice copy to live for a short, fixed time with warnings, so that real data in a copy never lingers. [Q6 clause 6; ADR-IM-006; depends on O30]
    - **Acceptance:**
      - Given a Tenant, then at most one live copy exists, and a new build destroys the old copy first.
      - Given a ready copy, then it lasts 14 days, ending at 11:59 pm in the giving time zone, with warnings 3 days and 1 day before, and one 14-day extension with a reason; a second extension is refused.
      - Given Go, a Switch abort or abandonment, the end of the agreement, a ministry request, or a release change before the build finishes, then the copy is destroyed.
      - Given any erasure, new restriction or source-file disposal affecting the Tenant, then the copy is destroyed within 24 hours.

77. As a privacy officer, I want Practice copy destruction to revoke access first and leave a receipt, so that we can prove a copy is gone. [Q6 clause 7; ADR-IM-006; depends on O30]
    - **Acceptance:**
      - Given destruction, then access is revoked before the purge starts.
      - Given a purge, then it is resumable and refuses to run anywhere but the Practice environment.
      - Given a finished purge, then the Switch history records rows purged per table, the completion time and the backup expiry.
      - Given a restore of the Practice environment, then every destroyed copy is purged again before access reopens.
      - Given a purge unfinished after 24 hours, then an incident is raised.

## Tail gifts: silent to donors, honest to staff (Q7)

78. As a donor on the Legacy Recurring Tail, I want Asym to send me nothing when my old-system gifts are brought in, so that I am not thanked twice or treated as a new supporter. [Q7 clause 1; Q7 clause 8; ADR-IM-007; depends on O1, O33, O34]
    - **Acceptance:**
      - Given every automation, recipe and task enabled, when a backfill of gifts, reversals, schedule changes and stops commits, then zero donor-facing messages and zero gift-triggered tasks or notices result.
      - Given a gift recorded outside Asym, or its refund, chargeback or correction, then no welcome, tribute letter, milestone, or first-gift, new-supporter, started, recontinued or special-gift result is produced.
      - Given such gifts, then they still count in every total and as earlier giving.
      - Given a migrated donor's first gift in Asym, then no first-gift, new-supporter or welcome result is produced, while a truly new donor's first gift produces them.

79. As a missionary, I want legacy arrangements and the previous-system share of totals labelled honestly with how far they are reported, so that I do not mistake late reporting for a lost supporter. [Q7 clause 3; ADR-IM-007; depends on O17, O32, O40]
    - **Acceptance:**
      - Given a legacy arrangement or previous-system total in a staff or missionary view, then it shows "{previous system} · gifts shown up to {Month D, YYYY}" with the date spelled out.
      - Given no display name set by the ministry, then the previous system is called "our previous giving system".
      - Given any such label, then it never says "legacy gift" or "updated", never relies on colour alone, and is announced to screen readers.
      - Given a donor with a legacy arrangement, then they see the plain tax-document sentences, how to change or cancel the arrangement, and an offer to move it.

80. As a staff member, I want each legacy arrangement judged only up to its latest covered-through date, so that a late backfill never raises false missed-gift alarms. [Q7 clause 4; ADR-IM-007; depends on O17]
    - **Acceptance:**
      - Given an expected gift after the covered-through date, then it shows "not yet reported" and raises no missed-gift signal.
      - Given an expected gift on or before the covered-through date with no charge, then it is judged like any outside arrangement.
      - Given a newer backfill, then the covered-through date moves only forward.
      - Given gifts waiting in match review, then they count as present.

81. As a missionary, I want a legacy arrangement's real end to reach me exactly as an Asym arrangement's end would, and a move to reach me as no end at all, so that I respond only to real stops. [Q7 clause 5; ADR-IM-007; depends on O32, O33]
    - **Acceptance:**
      - Given source stop evidence or a stop staff confirm in the backfill review, then the arrangement ends, and a decline is never a stop, whether or not a rerun follows.
      - Given a replacement schedule for the same supporter and designation, then the review defaults it to a continuation unless staff mark it a stop.
      - Given an end, then it produces exactly the signals an Asym recurring arrangement's end produces, while a move or a planned end at tail closure produces none.
      - Given a donor who moves, then they receive no welcome, orientation or first-gift message.
      - Given a legacy charge after a move, then it is recorded as a real second charge, flagged for refund through the original processor, and never excluded as a duplicate.

82. As finance staff, I want any charge on a connected payment account that Asym did not create to wait for a backfill or an external-intake match, so that a legacy charge never becomes an Asym-recorded gift. [Q7 clause 6; ADR-IM-007; depends on O35]
    - **Acceptance:**
      - Given a processor event for a charge Asym did not create, then no Asym-recorded gift, receipt or workflow results.
      - Given such a charge, then it waits for the Legacy Tail Backfill or an external-intake match.
      - Given it arrives through a backfill, then it carries Recorded outside Asym.

## Moves, Continue link and ending the tail (Q8)

83. As a ministry member with Run the Switch, I want one End date recorded at go/no-go that can end a gift only after its donor had a real offer, so that no donor's gift ends without fair notice. [Q8 clause 1; ADR-IM-008; depends on O13]
    - **Acceptance:**
      - Given go/no-go, then the End date defaults to 10 weeks after campaign launch and a date after the 12-month cap is refused.
      - Given a gift whose donor was not invited at least 9 weeks before, or not sent a written end notice at least 30 calendar days before, the End date, then ending it is refused and its End date moves automatically as a recorded extension.
      - Given the campaign is paused part-way, then the End dates of affected gifts move as recorded extensions.
      - Given a request to keep a gift running outside Asym, then it is accepted only as a recorded exception for a PayPal- or gateway-run gift once an owner intake for external money facts exists, and never for a gift SiteStacker runs.

84. As a Switch lead, I want the move campaign prepared at scheduling and launched soon after go-live, so that donors are invited while copied cards are ready. [Q8 clause 2; Q5 clause 5; ADR-IM-008; ADR-IM-005; depends on O12]
    - **Acceptance:**
      - Given a Switch is scheduled, then the card-copy request to the old processor is recorded with its date.
      - Given go-live, then the campaign can launch only after the copies land, and the task shows a launch-by date 14 days after go-live.
      - Given readiness, then sending capacity, each donor group's payment method and language in Asym, and coordination with any processor import notices are confirmed, and a group that fails launches only as a recorded extension within the cap.
      - Given any campaign message or cancellation, then the ministry sends or performs it, and Asym help access can do neither.

85. As a donor with legacy recurring gifts, I want one clear message at a time covering all my gifts, so that I am not flooded or confused while my giving moves. [Q8 clause 2; ADR-IM-008; depends on O37]
    - **Acceptance:**
      - Given a donor with several legacy gifts, then each campaign message is one email covering all of them.
      - Given a donor who does not respond, then they receive an invitation, reminders at +7 and +21 days, the end notice, a final reminder 7 days before the End date and an "ended" note.
      - Given a donor who unsubscribed from marketing, then campaign messages still reach them as service messages, carrying no appeal.
      - Given sending, then it is staged with a first wave of 50 and pauses automatically at 3% bounces or any complaint.
      - Given the first release, then no campaign message is sent by SMS.

86. As a donor, I want one secure Continue link that shows exactly what will happen to each gift and lets me keep it with one tap, so that continuing my support takes seconds and nothing changes by accident. [Q8 clause 3; ADR-IM-008; depends on O37]
    - **Acceptance:**
      - Given the link is opened, including by an email scanner, then nothing changes; Keep is a deliberate tap, plus a card check if the bank requires one, and a double tap produces one confirmation.
      - Given the page, then for each gift it shows amount, frequency, designation, card brand and last four digits, the last old charge date, the first new charge date and the new bank-statement name.
      - Given Change or Stop, then a valid code emailed to the donor's address is required and its absence is refused, and a fund change follows Phase 16's normal change rules.
      - Given "Not my card" or a card that was not copied or has expired, then the donor is led to card entry with no account required.
      - Given the End date has passed, then the same link starts a new gift; a resent link revokes the old one; and the link expires 30 days after the End date.
      - Given any page or message text, then it never says "Asym" or "legacy gift", and every target is at least 44 px.

87. As finance staff, I want a moved gift to charge in Asym only after the old gift is proven stopped, so that no donor is charged twice or asked to catch up. [Q8 clause 4; Q1 clause 8 (Q8 amendment); ADR-IM-008; depends on O36]
    - **Acceptance:**
      - Given a confirmation, then both dates are fixed (the next old charge is the last) and the gift joins the staff To-cancel list, ordered by next old charge date.
      - Given a confirmed gift, then no Asym charge occurs before stop evidence is recorded, and the first Asym charge is the first original due date strictly after that evidence, with no catch-up amount.
      - Given a move, then Legal Entity, currency and, unless the donor changed it, designation stay unchanged.
      - Given a PayPal donor, then they confirm with card entry, the ministry cancels the PayPal subscription and records its stop, and only then does Asym charge.
      - Given a fund change at confirmation, then the old designation's missionary receives an end signal and the new one a new support, while a plain Keep produces no end signal.

88. As a Switch lead, I want donors Asym must not or cannot email handled outside the campaign, so that no forbidden message is sent and no donor falls through the gap. [Q8 clause 5 (Q9 amendment); ADR-IM-008; ADR-IM-009; depends on O38, O39, O44]
    - **Acceptance:**
      - Given a do-not-contact or deceased donor, then no campaign message reaches them, and for each such gift the ministry records how any legal notice duty is met.
      - Given a deceased donor's legacy recurring gift, then it goes on the To-cancel list, not the campaign, and documents due to them are held with a staff task for the estate or representative.
      - Given a bounced address or no email, then the donor appears on the mail-or-call list, and a do-not-mail or do-not-call donor is left off that channel's list.
      - Given a Canadian pre-authorized debit donor, then they are offered a card, or their group is extended within the cap until a debit rail exists.

89. As a Switch lead, I want the Switch page to show move progress in donors and amounts with the staff lists I work from, so that I can steer the campaign and learn from it. [Q8 clause 8; Q8 clause 9; ADR-IM-008]
    - **Acceptance:**
      - Given the Switch page, then its counts of donors and amounts by status equal the sum of the per-donor states.
      - Given a donor, then a per-donor timeline shows each message, confirmation, stop and charge.
      - Given the Switch page, then it shows the To-cancel list and the mail-or-call list.
      - Given the first Switch, then the share moved is recorded by donors and by amount, per currency, payment path and week.

90. As a missionary, I want a read-only list of my own contactable supporters' move status, so that I can encourage them personally where the ministry allows. [Q8 clause 8; ADR-IM-008; depends on O40]
    - **Acceptance:**
      - Given a missionary, then the list shows only their own contactable, non-anonymous supporters.
      - Given the list, then it is read-only, creates no tasks and never uses the word "lapsed".
      - Given another missionary's supporters, then they never appear.

91. As finance staff, I want the tail to close only after the last old charge plus each payment type's reversal window, so that late refunds and disputes still arrive through the tail. [Q8 clause 6; Q1 clause 6 (Q8 amendment); ADR-IM-008]
    - **Acceptance:**
      - Given tail closure, then it is refused until the last old charge plus its window has passed — card 120 days, PayPal 180, US bank debit 60, Canadian pre-authorized debit 90 — and while any dispute is open.
      - Given a dispute 110 days after the last card charge, then it is recorded through the tail as Recorded outside Asym.
      - Given the SiteStacker licence has ended, then processor reports are the only source for reversals of its old charges.
      - Given the window, then the old merchant, gateway and PayPal accounts are listed as to be kept open until it closes.
      - Given the closure review, then it lists every ended gift.

## Email lists, consent evidence and restrictions (Q9)

92. As a Switch lead, I want every restriction from the old system and our email tool committed before any Adopted email permission, with the meaning of each source field confirmed, so that nobody who said no is contacted after the switch. [Q9 clause 1; ADR-IM-009; depends on O41]
    - **Acceptance:**
      - Given a Switch, then no Adopted email permission commits until every restriction has committed.
      - Given each restriction, then it keeps its source field, original value, original date and source record.
      - Given a source field's meaning, then it is pre-filled for SiteStacker or mapped at upload for templates, and its confirmation is recorded with the confirming person, who must hold Run the Switch.
      - Given restrictions by type and source system, when any source restriction has no Asym counterpart, then sign-off is blocked.

93. As a staff member, I want each imported restriction to block exactly what its signal meant, so that receipts keep flowing while every real "no" is honored. [Q9 clause 1; ADR-IM-009; depends on O41, O44]
    - **Acceptance:**
      - Given do not contact or erasure, then the person is blocked on every channel including required messages, and their receipts are held for staff.
      - Given do not solicit, then appeals and fundraising are blocked on every channel while receipts and service messages still go.
      - Given an email opt-out with no list named, do not email, or a spam complaint, then all optional email to that person is blocked while required email still goes.
      - Given an unsubscribe from a named list, then that list and its Asym target are blocked.
      - Given a hard bounce or "cleaned" status, then that address is undeliverable; and given do not mail or do not call, then post or phone is blocked, shown to staff and honored by staff lists.

94. As a staff member, I want unclear restriction values held, blanks treated as unknown and the stricter value always kept, so that no import ever turns uncertainty into an email permission. [Q9 clause 1; ADR-IM-009; depends on O41]
    - **Acceptance:**
      - Given an unrecognized restriction value, then the row is held for review.
      - Given a blank, then it creates neither an email permission nor a block.
      - Given conflicting values across duplicates, a merge, or the old system versus the email tool, then the stricter value wins.
      - Given a later snapshot, backfill or tool value of "subscribed" for a blocked address, then the block stays, and only the person's own later action, or a staff correction of a wrong deceased mark with evidence, lifts a block.
      - Given any change, then restriction history is append-only.

95. As a ministry member with Run the Switch, I want the final export of every audience in our email tool included in the Switch, so that every block held there comes across. [Q9 clause 2; Q1 clause 1(a) (Q9 amendment); ADR-IM-009]
    - **Acceptance:**
      - Given each audience, then the final export includes subscribed, unsubscribed, cleaned and archived contacts, plus spam complaints from the tool's complaint report.
      - Given an audience or complaint report missing from the final export, then the contact-points family is not committable and the gap is named.
      - Given the final email-tool export, then it is taken after old sending stops and within the tool's 30-day export window.
      - Given permanently deleted contacts, then they are recorded as a Visible exclusion.

96. As a ministry member with Run the Switch, I want each email list given one disposition at go/no-go, so that no list is ever sent from two systems. [Q9 clause 2; ADR-IM-009; depends on O42, O43, O46]
    - **Acceptance:**
      - Given each list in the old system or email tool, then it receives exactly one of Move to Asym, Keep in {email tool} or Retire, and Go is refused while any list has none.
      - Given Move to Asym, then it is offered only where Asym has a home for the list (a named missionary's newsletter or missionary update emails) and only once adoption is live, and the old list stops sending at the Boundary.
      - Given an organization-wide list, then only Keep or Retire is offered in the first release.
      - Given Retire, then nobody is sent the list again, and its blocks still import.

97. As a Switch lead, I want a list we keep in our email tool to exchange opt-outs with Asym in both directions, restrict-only, so that a person who opts out anywhere is honored everywhere. [Q9 clause 2; Q1 clause 12 (Q9 amendment); ADR-IM-009]
    - **Acceptance:**
      - Given a kept list, then it is recorded as a Kept on through tail surface with a named owner.
      - Given an opt-out recorded in Asym for a person on a kept list, then it appears on the "pending in legacy systems" list with a 2-day target and is flagged overdue after 2 days.
      - Given the tool's own unsubscribes, cleaned addresses and complaints, then they return to Asym restrict-only at least every 4 weeks and when the list closes.
      - Given a kept list later moves to Asym, then it does so only under the same rules with a fresh export.

98. As a ministry member with Run the Switch, I want a person on a moved list to receive an Adopted email permission only when their evidence meets the rule for where they live, so that every carried email permission is one we can prove. [Q9 clause 1; Q9 clause 3; Q3 clause 3 (Q9 amendment); ADR-IM-009; depends on O42]
    - **Acceptance:**
      - Given a person on a moved list who had not withdrawn, when the list was sent to within the 12 months before the Boundary, the list's Consent adoption disposition has been published and their evidence meets their rule, then they receive an Adopted email permission on Adoption hold; when their evidence does not meet their rule, they are evidence only; and until the disposition is published, nobody on the list receives an Adopted email permission.
      - Given a moved list not sent to within the 12 months before the Boundary, then the whole list is held as a Stale list and nobody on it is adopted.
      - Given a person who withdrew from a moved list, then they receive no Adopted email permission, and their withdrawal imports as a block on that list and its Asym target.
      - Given a US recipient, or a Canadian recipient of a registered charity, then list membership with its source is sufficient evidence; given a UK or EU recipient, or a Canadian recipient of a ministry that is not a registered charity, then a dated opt-in record is required, and without it the person is evidence only.
      - Given where a person lives, then it comes from their imported postal country, or from the ministry's country when that is unknown.
      - Given a practice run, then it shows per-list counts of people who will keep receiving, are blocked, are evidence only, or are held as stale.

99. As a privacy officer, I want every Adopted email permission to keep its evidence and never to be extended by asking, so that no email permission is manufactured during a Switch. [Q9 clause 3; ADR-IM-009; depends on O42]
    - **Acceptance:**
      - Given an Adopted email permission, then it keeps the source system, list, original dates, IP address and wording where present, the list mapping and the Switch lead's attestation, and the attestation never replaces the evidence.
      - Given each moved list, then a Consent adoption disposition records its mapping, meaning, last-sent date, evidence rule, attestation and each person's outcome.
      - Given any person, then they are never added to a list they were not on and never emailed to ask for permission; people without enough evidence are asked only when they next give, sign in or reply.
      - Given the first release, then no SMS permission carries over, and exact-number evidence is kept for the SMS owner.

100.  As a missionary, I want my newsletter list that ran through the ministry's old system carried over to my Asym newsletter, so that my supporters keep hearing from me without signing up again. [Q9 clause 4; ADR-IM-009; depends on O43]
      - **Acceptance:**
        - Given a list a named missionary ran through the ministry's old system, then it qualifies, while lists missionaries keep outside it stay theirs and are not imported.
        - Given an adopted membership, then it shows "Joined in {previous system} on {date}", or "before {boundary date}" when no date exists.
        - Given an adopted membership, then no confirmation is sent, it belongs to that missionary's newsletter and it never authorizes ministry appeals.
        - Given a message to that list, then it names "{missionary} on behalf of {ministry}".

101.  As a donor whose list was moved, I want no optional email from Asym until every sender honors the Adoption hold on my Adopted email permission, and gentle first sends after that, so that the switch never turns into a burst of unwanted mail. [Q9 clause 5; ADR-IM-009; depends on O42, O43, O45]
      - **Acceptance:**
        - Given an Adopted email permission on Adoption hold, then no optional sender, including the missionary newsletter sender, admits the person, and creating the membership sends nothing.
        - Given an optional message after the hold lifts, then it names its sender and carries a one-click unsubscribe honored within 2 days.
        - Given the first send to an adopted list, then it carries "You're getting this because you subscribed to {list} in {previous system}."
        - Given optional mail, then it goes from its own sending subdomain, separate from receipts, with SPF, DKIM and DMARC aligned.
        - Given sending, then waves follow the provider's warm-up schedule with the most recent givers and highest-rated readers first, never ordered by opens, and pause at 3% bounces, 0.1% complaints or any complaint in the first wave of 50.

102.  As a staff member, I want a deceased status to stop every message to that person while leaving their records and household intact, so that families are spared distress and history stays true. [Q9 clause 6; ADR-IM-009; depends on O44]
      - **Acceptance:**
        - Given a person marked deceased, then they are ineligible as a recipient of every message on every channel.
        - Given documents due to them, then they are held with a staff task for the estate or representative and never sent automatically.
        - Given their legacy recurring gift, then it goes on the To-cancel list.
        - Given the record, then it is never deleted or merged into a relative's, and a surviving spouse or shared address is not blocked.
        - Given a wrong deceased mark, then staff correct it with evidence and the correction is recorded.

## People, households and organizations (Q10)

103. As a staff member, I want every source person to become one Asym person and households built only from explicit source evidence, so that roommates, relatives and strangers are never grouped by guesswork. [Q10 clause 1; Q10 clause 2; ADR-IM-010; depends on O49]
     - **Acceptance:**
       - Given source people, then each becomes exactly one Asym person, and none is split, merged or grouped by inference.
       - Given two or more people sharing a source household ID, a source spouse relationship, or template Person 2 or Household ID columns, then a household or spouse link is created, and a shared address, email or surname produces only a suggestion.
       - Given a source household of one, then no household is created.
       - Given an imported household, then it takes the source household name, and the source head is its primary for mail and display only, never the legal donor; a household with no head or two heads is created without a primary and listed for staff.
       - Given imported membership, then it starts "before {Switch Boundary}, date unknown", and household recognition includes the couple's historic gifts.

104. As a Switch lead, I want combined-name records flagged but never split by Asym, so that no surname or gift is lost to name parsing. [Q10 clause 3; ADR-IM-010]
     - **Acceptance:**
       - Given "John & Mary Smith" in one name field, then it imports as one person flagged "may be two people", and the flag never blocks the Switch.
       - Given a practice run, then it lists flagged records so the ministry can fix them in the old system before the final export.
       - Given a flagged record after the switch, then staff fix it by renaming the person and adding the spouse, and the gifts stay with the original record.
       - Given the template, then it offers Person 1 and Person 2 columns and a relationship column (spouse, partner or other), and a spouse link is created only when the row says spouse.

105. As a staff member, I want an email shared by two source people held by exactly one of them, chosen by a fixed order, so that the person who pays can still be reached and no import fails on a shared address. [Q10 clause 4; ADR-IM-010; depends on O48]
     - **Acceptance:**
       - Given two source people sharing an address, then it goes to the first that applies: the person the source recorded it on; the payer of an active legacy recurring gift; the source's primary person; the reviewer's pick.
       - Given the other person, then they import without that email, show "shares a mailbox with {name}", keep the address as evidence, to be added as their contact email once Phase 4/9 allow two people to share one (O48), and are asked for their own address when they next give or sign in.
       - Given a Switch commit, then no row fails because two people share an email.
       - Given a recognized placeholder address, then it becomes blank and is listed, while plus-tag aliases are kept as distinct addresses.
       - Given a block on a shared mailbox, then it applies to whoever holds it, and the non-holder's own person-level restrictions stay on the non-holder.

106. As finance staff, I want every imported gift to keep the source's gift owner as its one legal donor, so that no gift is ever re-attributed by the import. [Q10 clause 5; ADR-IM-010]
     - **Acceptance:**
       - Given an imported gift, then its legal donor is the source's gift owner, and Asym never re-attributes it.
       - Given a template source that records gifts per household, then those rows wait until the ministry chooses, at mapping, either the household's primary person (the default) or "review each".
       - Given any imported gift, then no joint donor is created, and the spouse is recognized through the household.

107. As a Switch lead, I want only real giving organizations created as organizations, so that committees and teams never become fake donors. [Q10 clause 6; ADR-IM-010]
     - **Acceptance:**
       - Given a source group with gifts, or one the ministry marks as an organization, then it becomes an organization, and every other group is listed for the ministry to classify.
       - Given an organization with a contact person, then they import as an organization record, a person record and a contact link, and the organization holds its gifts.
       - Given an organization, then it never joins a household.
       - Given an organization and a person sharing an email, then the person holds it unless the source recorded it only on the organization.

108. As a staff member, I want imported people matched by source ID first and by email only when the first name agrees, so that a spouse's gift is never recorded against the other spouse. [Q10 clause 7; Q10 clause 10; ADR-IM-010; depends on O47, O95]
     - **Acceptance:**
       - Given an incoming row with a bound source ID, then it matches on that ID before anything else.
       - Given an email match, then it also requires the first name to agree, and a shared-mailbox marker always sends the match to review.
       - Given a gift in Asym from a shared address under the non-holder's first name, then it goes to review and is never attached automatically.
       - Given two people in the same household, then they are shown as "likely spouses" and never as duplicates.
       - Given duplicates within a file, then they are listed before commit, and real duplicates import as separate people and go to Phase 4's duplicate queue with no automatic merge.

109. As a staff member, I want one source row bound to every Asym record it produced, by role, with extra contact details kept as evidence, so that re-runs land on the same records and nothing from the source is lost. [Q10 clause 8; ADR-IM-010; depends on O48]
     - **Acceptance:**
       - Given a source row, then it binds by role to person 1, person 2, household, organization or contact, and a source household binds as its own record family.
       - Given a practice run re-run on the same exports, then every role on every row binds to the same targets.
       - Given additional emails and phones, then they are kept as source evidence on the person.
       - Given household members recorded as children, then they import as people like anyone else, with no added age rule.
       - Given family links of restricted-tier workers, then they follow Phase 10 aliasing.

110. As a Switch lead, I want each practice run to show how people, households and organizations will come across, so that we fix data at the source before the final export. [Q10 clause 9; ADR-IM-010]
     - **Acceptance:**
       - Given a practice run, then it shows counts of people, households, spouse links, organizations and contact links.
       - Given shared mailboxes, then each pair is listed with its holder.
       - Given data needing attention, then flagged combined names, blanked placeholders, odd households (no head or two heads) and groups awaiting classification are listed with examples.

## Privacy during the tail and decommission (Q1, Q4, Q6, Q9)

111. As a privacy officer, I want every opt-out, do-not-contact and erasure recorded in Asym after the Boundary listed until it is carried out in each legacy system, so that no system still running for the tail keeps contacting or holding that person. [Q1 clause 12; Q1 clause 12 (Q9 amendment); ADR-IM-001; ADR-IM-009]
     - **Acceptance:**
       - Given such a request recorded in Asym after the Boundary, then it is listed "pending in legacy systems" for SiteStacker, each legacy processor, each connected missionary mailing account and each kept email-tool list.
       - Given an item, then it clears only when a named ministry user marks it executed in that system, with the time.
       - Given an item for a kept email-tool list, then its target is 2 days and it is flagged overdue after that.
       - Given a backfill, then it never restores contact, consent or identity data for an erased or suppressed person.
       - Given any open item, then tail closure and decommission sign-off are refused.

112. As a ministry member with Run the Switch, I want a decommission checklist after Switch closed that covers access, credentials, data and tax records, so that the old system is retired deliberately and the ministry's obligations are met. [Q1 clause 12; Q1 clause 12 (Q4 and Q6 amendments); Q4 clause 4; ADR-IM-001; ADR-IM-004; ADR-IM-006]
     - **Acceptance:**
       - Given the checklist, then it requires attestations of SiteStacker access reduction, credential rotation, and the decision to delete or retain SiteStacker data.
       - Given the checklist, then it also requires attestation that tax documents owed for gifts recorded outside Asym are issued, or generated and ready by the jurisdiction's deadline, and of where the previous system's receipt copies and gift records are kept and for how long (Canada: receipt copies 2 years after the gift's year; books and source records 6 years).
       - Given either tax attestation is open, then decommission sign-off is refused, while tail closure and Switch closed still succeed.
       - Given a live Practice copy, then decommission sign-off is refused until its destruction is confirmed.
       - Given decommission, then Asym takes no custody of the previous system's tax documents.

## Dependencies referenced

- O1 — Carry the historical disposition into ledger events as the explicit historical flag the workflow runtime requires. Owner: Phase 13 (with Phase 34).
- O12 — Owners for card-copy requests, PayPal cancellation proof and the processor half of the migration workstream; no Switch with recurring giving until O12, O31 and O36–O40 are live. Owner: Phase 13 / 16.
- O13 — Owner command for externally collected money facts after a Switch Boundary, also writing Recorded outside Asym. Owner: Phase 13 / 16.
- O16 — Source-qualified import identity for money references. Owner: Phase 13 / 14.
- O17 — As-of label "{previous system} · gifts shown up to {Month D, YYYY}" and judgement only up to the covered-through date; Phase 16's manual review interval for these arrangements is the backfill cadence plus 7 days (14 days weekly, 21 fortnightly), as the Q8 amendment set. Owner: Phase 16 / 28.
- O19 — Phase 29 custody profile for staff-migration source files. Owner: Phase 29 with the Phase 30 spec.
- O20 — Authorized read-only check of hosted read policies and real-data status; close any anonymous public read. Owner: Security / database owner.
- O21 — Import template descriptors for money families. Owner: Phase 13 / 14 / 16.
- O22 — Recorded outside Asym as a Phase 7 receipt-boundary fact written atomically and append-only. Owner: Phase 7 with Phase 13.
- O23 — Recorded outside Asym facts outside every official purpose's scope; no Late Fact Obligation. Owner: Phase 19.
- O24 — Donor portal history, sentences and no receipt action; prototype receipt link and text statement retired. Owner: Phase 25 with Phase 19.
- O25 — Each issuing Legal Entity's tax-document activation state for go/no-go; census receipting tool and last serial as continuity evidence. Owner: Phase 18.
- O26 — Operator Tenant Grant for the Switch-preparation purpose, carrying the Asym help access terms. Owner: Phase 12.
- O27 — Ministry-administered membership with scoped, expiring capability grants for helpers. Owner: Phase 12.
- O28 — No-write per-row check of each Minimum Switch Kit import command. Owner: Phases 4, 9, 11, 13, 14, 16.
- O29 — The Practice environment. Owner: Platform / ops.
- O30 — Practice copy job and lifecycle (allowlist, mirrored access, status channel, purge and receipt). Owner: Phase 30 with Phase 12 and Phase 29.
- O31 — Before real data in any environment: remove the payment platform-key fallback and the any-tenant USD lane, remove the hard-coded tenant, and make the CMS tenant resolver honour whether a Tenant is active. Owner: Phase 13 and admin owners.
- O32 — Missionary views label legacy arrangements; end signals at parity; moves and planned ends produce none. Owner: Phase 28.
- O33 — Workflow, recipe and task producers gate on Recorded outside Asym; a Legacy Tail Backfill is never a Studio backfill request. Owner: Phase 34/35 with Phase 13.
- O34 — Tribute letters gate on Recorded outside Asym. Owner: Phase 14.
- O35 — A charge on a connected account that Asym did not create is never an Asym-recorded gift. Owner: Phase 13.
- O36 — Move-start variant with no charge until stop evidence and no catch-up. Owner: Phase 16 with Phase 25.
- O37 — Campaign messages as service messages; the Continue link; email-code verification for Change and Stop. Owner: Phases 16/17 with Phase 4.
- O38 — Ruling on legally required notices versus the do-not-contact floor. Owner: Phase 3 with counsel.
- O39 — A Canadian pre-authorized debit rail, or confirmation that card-only is acceptable. Owner: Phase 13/16.
- O40 — Missionary read-only move-status list; donor-portal move status and continue action. Owner: Phase 28 with Phase 25.
- O41 — One atomic, scoped restriction-import command. Owner: Phase 3/6 with Phase 12.
- O42 — Adopted permissions with basis, evidence, original dates and hold state, honored by every optional sender. Owner: Phase 12 (#680) with Phase 3.
- O43 — Newsletter adoption exception; adopted memberships start held and the newsletter sender honors the hold. Owner: Phase 28 (founder).
- O44 — Deceased lifecycle status as a fail-closed recipient reason, with documents held and legacy gifts routed to the To-cancel list. Owner: Phase 9 with Phases 3, 14, 16, 19.
- O45 — Separate optional-mail subdomain, warm-up, staged waves, automatic pause, sender naming and 2-day unsubscribe. Owner: Phase 17.
- O46 — A home for organization-wide lists. Owner: Phase 32 with Phase 25.
- O47 — Email matching only with first-name agreement and no shared-mailbox marker; same-household pairs shown as likely spouses. Owner: Phase 4.
- O48 — Shared contact emails and a home for additional emails and phones. Owner: Phase 4/9.
- O49 — Imported household Parties and memberships starting before the Switch Boundary, date unknown. Owner: Phase 9 with Phase 14.
- O59 — Site and Legal Entity of a history gift resolved from the signed Source mapping statement. Owner: Phases 2/24 with 7/13.
- O74 — Legal-hold place and release capabilities for the tenant's Switch decision holder and Asym's named legal role, with no content access; no capability returns a raw Switch export. Owner: Phase 12.
- O80 — Legacy giving links admitted as equivalent addresses, served in place. Owner: Phase 24.
- O82 — One tenant-branded Site not-found page for every unmapped path. Owner: Phases 23 and 24.
- O84 — Domain readiness check and staged move from an outside host. Owner: Phase 24.
- O95 — Phase 4 command for import-filed duplicate candidates. Owner: Phase 4.
- O96 — Data Tools staff notices, including Switch-lead notices, as Phase 17 producer bindings. Owner: Phase 17.
- O97 — Registered Source work projection for imports that need a person. Owner: Tasks Hub owner.
- O102 — Data Tools permission module with View, Manage and Admin levels, Run the Switch flagged sensitive. Owner: Phase 12.
- O105 — Grant end dates usable for helpers, defaulting to the day the Switch closes; when the Switch closes, Phase 30 ends each helper grant still on that default end date. Owner: Phase 12.
