# Phase 27 — Donor Development & Portfolio Management

**Specification version:** `phase27-ratified-spec-2026-10-11-v1`.
**Status:** Selected/accepted/ratified Phase 27 decisions formalized under the explicitly invoked `/to-spec`; testing seams confirmed by the founder. Specification publication does not establish implementation, qualification or activation. No feature implementation is included in this task.

## Problem Statement

Development officers, regional representatives and church-relations staff need to understand the relationships they are responsible for, prepare appropriate invitations, remember the actual response and follow through without spreadsheets, duplicate notes or misleading money totals. A church can pray, introduce someone, host a visit and provide funding; treating all of that as one sales stage obscures the work and devalues the relationship. Missionaries need useful shared context without compulsory staff reporting or access to private CRM information.

The current native CRM supplies adjacent lists, notes, relationship reads and task surfaces, but the inspected code and tests do not prove the Phase 27 source contracts. Placeholder scores, legacy assignment fields, demo-auth browser smoke and simulated database services are not a safe implementation baseline for these semantics. Staff need one coherent, source-backed product that remains usable when optional automation products are absent.

## Solution

Provide a calm Mission Control workspace centered on **partnership work**, **Requests**, **Appeals**, and the existing shared **Tasks**. A partnership records one continuing supporter–identified-ministry purpose; staff deliberately start it, choose a suitable approved stage list and record a stage only when ready. Stage guidance assists judgment. Staff may change stages directly, change a list deliberately, pause with a meaningful review, close completed work and return to the same context without erasing history.

A Request records what was proposed, to whom, by whom, the response, relevant financial terms and next work. Prayer partnership, introductions and visits use the same model with irrelevant financial fields absent. Review appears only when required. One appeal coordinates financial, nonfinancial or mixed invitations through a recorded working list; changing a filter never changes that plan. Actual Requests and verified outcomes remain distinct. Gifts awaiting finance use the existing finance owner's intake and preserve physical-handling responsibility separately from posting.

Staff can prepare through a deterministic brief and understand Last recorded exchange, Recent outreach and Next follow-up separately. New eligible shared partnership updates have a clearly disclosed current audience; they never republish private notes or create a missionary logging obligation. Optional financial giving-pattern bands are explained, separate and initially Off. They do not rank human worth. Assignments derive portfolios from existing role-qualified relationships, with reviewed changes by default and explicitly enabled bounded Auto that respects deliberate choices.

Ordinary screens emphasize current context, responsibility, what happened and what can be done next. Use the existing shared visual system, progressive disclosure and one purposeful save; reserve extra confirmations for actual consequences. All supported actions have accessible keyboard/list alternatives, clear mobile layouts and recoverable error states.

**Complete normative package.** The requirements and acceptance clauses in the following volumes are part of this specification, not optional background. Their stable identifiers are used by stories, the OpenSpec projection, tasks and future test/release evidence.

| Volume                                                                     | Scope                                                                                         |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [Partnerships](phase-27-donor-development/partnerships.md)                 | D1–D21, admission, lifecycle, stages/lists, source-backed follow-through                      |
| [Requests and appeals](phase-27-donor-development/requests.md)             | D22–D25/D29, terms, review, response, membership, finance intake and outcomes                 |
| [Context and giving patterns](phase-27-donor-development/context.md)       | D26–D28, voluntary shared history, recency, deterministic briefs and optional financial bands |
| [Assignments](phase-27-donor-development/assignments.md)                   | D30, reviewed/automatic existing-role changes, manual protection and work continuity          |
| [Common safeguards and proof](phase-27-donor-development/proof.md)         | Q01–Q16, authorization, durability, UI, migration, capacity and release                       |
| [Operating controls](phase-27-donor-development/operations.md)             | Every adopted signal, threshold, accountable role and response                                |
| [Owner reconciliation](phase-27-donor-development/owner-reconciliation.md) | Exact coordinated source amendments and bounded unresolved finance gates                      |

Later explicit scoped decisions supersede earlier reservations: D8 settles genuine return identity; D19 permits an unassessed destination; D20 permits deliberate same-list clearing; D21 permits paused edits and delegates routine judgment; D26 settles the narrow shared-history exception. D5/D8/D9/D20/D21 retain their logged selected/accepted status; publication does not invent separate ratification. No D31 or new founder policy is created.

## User Stories

Each story is independently verifiable against the named observable acceptance clauses. Shared acceptance can prove a common boundary for several stories; each story still needs its own permitted user journey. IDs are stable and do not imply implementation order. Acceptance includes negative, failure and boundary outcomes where relevant; requirements carry the complete invariant rather than reducing the work to the short story sentence.

<!-- BEGIN GENERATED STORIES -->

1. **US27-P01.** As an authorized development staff member, I want to continue partnership work across successive requests and years, so that I can keep relationship history without starting over.
   Requirements: REQ27-P01, REQ27-P02. Acceptance: AC27-P01-01, AC27-P01-02, AC27-P01-03, AC27-P01-04, AC27-P01-05, AC27-P02-01, AC27-P02-02, AC27-P02-03, AC27-P02-04, AC27-P02-05.

2. **US27-P02.** As an authorized development staff member, I want to identify the actual supporter and ministry, so that I can avoid confusing a church contact or current worker with the relationship subject.
   Requirements: REQ27-P01. Acceptance: AC27-P01-01, AC27-P01-02, AC27-P01-03, AC27-P01-04, AC27-P01-05.

3. **US27-P03.** As an authorized development staff member, I want to record useful early introductions before a ministry is known, so that I can work without invented source data or premature enrollment.
   Requirements: REQ27-P01, REQ27-P03. Acceptance: AC27-P01-01, AC27-P01-02, AC27-P01-03, AC27-P01-04, AC27-P01-05, AC27-P03-01, AC27-P03-02, AC27-P03-03, AC27-P03-04, AC27-P03-05.

4. **US27-P04.** As an authorized development staff member, I want to manage prayer and financial participation together, so that I can respect the complete relationship without treating prayer as a fundraising stage.
   Requirements: REQ27-P02, REQ27-P31. Acceptance: AC27-P02-01, AC27-P02-02, AC27-P02-03, AC27-P02-04, AC27-P02-05, AC27-P31-01, AC27-P31-02, AC27-P31-03, AC27-P31-04, AC27-P31-05, AC27-P31-06, AC27-P31-07.

5. **US27-P05.** As an authorized development staff member, I want to use a bounded separate-purpose exception when a distinct continuing outcome requires it, so that I can avoid both duplicate work and an inflexible single-process model.
   Requirements: REQ27-P02. Acceptance: AC27-P02-01, AC27-P02-02, AC27-P02-03, AC27-P02-04, AC27-P02-05.

6. **US27-P06.** As an authorized development staff member, I want to start or reuse work in its existing context, so that I can record deliberate intent once without entering known details again.
   Requirements: REQ27-P03. Acceptance: AC27-P03-01, AC27-P03-02, AC27-P03-03, AC27-P03-04, AC27-P03-05.

7. **US27-P07.** As an authorized development staff member, I want to reuse existing work within my actual permissions, so that I can avoid duplicate enrollments without receiving private history.
   Requirements: REQ27-P03, REQ27-P13. Acceptance: AC27-P03-01, AC27-P03-02, AC27-P03-03, AC27-P03-04, AC27-P03-05, AC27-P13-01, AC27-P13-02, AC27-P13-03, AC27-P13-04, AC27-P13-05, AC27-P13-06, AC27-P13-07, AC27-P13-08, AC27-P13-09.

8. **US27-P08.** As an authorized development staff member, I want to review a finite group and understand page versus all-results selection, so that I can know exactly which people or organizations the action covers.
   Requirements: REQ27-P04. Acceptance: AC27-P04-01, AC27-P04-02, AC27-P04-03, AC27-P04-04, AC27-P04-05, AC27-P04-06, AC27-P04-07.

9. **US27-P09.** As an authorized development staff member, I want to recover individual group results and stop remaining work, so that I can preserve completed work while correcting an interrupted operation.
   Requirements: REQ27-P04. Acceptance: AC27-P04-01, AC27-P04-02, AC27-P04-03, AC27-P04-04, AC27-P04-05, AC27-P04-06, AC27-P04-07.

10. **US27-P10.** As an authorized development staff member, I want to recover a lost save response, so that I can find the accepted outcome without creating duplicate tasks or asks.
    Requirements: REQ27-P04, REQ27-P13, REQ27-P30. Acceptance: AC27-P04-01, AC27-P04-02, AC27-P04-03, AC27-P04-04, AC27-P04-05, AC27-P04-06, AC27-P04-07, AC27-P13-01, AC27-P13-02, AC27-P13-03, AC27-P13-04, AC27-P13-05, AC27-P13-06, AC27-P13-07, AC27-P13-08, AC27-P13-09, AC27-P30-01, AC27-P30-02, AC27-P30-03, AC27-P30-04, AC27-P30-05, AC27-P30-06, AC27-P30-07.

11. **US27-P11.** As an authorized development staff member, I want to see the established eligible partnership lead as a changeable starting choice, so that I can avoid both extra entry and accidental assignment.
    Requirements: REQ27-P05. Acceptance: AC27-P05-01, AC27-P05-02, AC27-P05-03, AC27-P05-04, AC27-P05-05.

12. **US27-P12.** As an authorized responsibility manager, I want to repair responsibility after a departure, so that I can keep follow-through accountable while denying revoked access immediately.
    Requirements: REQ27-P05, REQ27-P07, REQ27-P10. Acceptance: AC27-P05-01, AC27-P05-02, AC27-P05-03, AC27-P05-04, AC27-P05-05, AC27-P07-01, AC27-P07-02, AC27-P07-03, AC27-P07-04, AC27-P07-05, AC27-P07-06, AC27-P10-01, AC27-P10-02, AC27-P10-03, AC27-P10-04, AC27-P10-05, AC27-P10-06, AC27-P10-07, AC27-P10-08.

13. **US27-P13.** As an authorized development staff member, I want to review only future work actually affected by ministry changes, so that I can preserve continuity without implying loyalty transfers to replacement people.
    Requirements: REQ27-P06. Acceptance: AC27-P06-01, AC27-P06-02, AC27-P06-03, AC27-P06-04, AC27-P06-05, AC27-P06-06.

14. **US27-P14.** As an authorized development staff member, I want to correct a mistaken relationship reference through its owner, so that I can repair honest errors while preserving accepted evidence.
    Requirements: REQ27-P06. Acceptance: AC27-P06-01, AC27-P06-02, AC27-P06-03, AC27-P06-04, AC27-P06-05, AC27-P06-06.

15. **US27-P15.** As an authorized development staff member, I want to reuse appropriate existing next work, so that I can avoid a duplicate task merely because cultivation is recorded.
    Requirements: REQ27-P07. Acceptance: AC27-P07-01, AC27-P07-02, AC27-P07-03, AC27-P07-04, AC27-P07-05, AC27-P07-06.

16. **US27-P16.** As an authorized development staff member, I want to see independent promises and requests alongside the next action, so that I can avoid losing follow-through when several matters are underway.
    Requirements: REQ27-P07. Acceptance: AC27-P07-01, AC27-P07-02, AC27-P07-03, AC27-P07-04, AC27-P07-05, AC27-P07-06.

17. **US27-P17.** As an authorized development staff member, I want to pause work until a deliberately chosen internal review, so that I can retain intention without implying the supporter owes a response.
    Requirements: REQ27-P08. Acceptance: AC27-P08-01, AC27-P08-02, AC27-P08-03, AC27-P08-04, AC27-P08-05, AC27-P08-06.

18. **US27-P18.** As an authorized review assignee, I want to review paused work and choose keep on hold, resume or close, so that I can record the actual decision with a clear next step.
    Requirements: REQ27-P08, REQ27-P11. Acceptance: AC27-P08-01, AC27-P08-02, AC27-P08-03, AC27-P08-04, AC27-P08-05, AC27-P08-06, AC27-P11-01, AC27-P11-02, AC27-P11-03, AC27-P11-04, AC27-P11-05, AC27-P11-06, AC27-P11-07, AC27-P11-08.

19. **US27-P19.** As an authorized review assignee, I want to reschedule without claiming that a review happened, so that I can keep trustworthy working history.
    Requirements: REQ27-P08, REQ27-P09. Acceptance: AC27-P08-01, AC27-P08-02, AC27-P08-03, AC27-P08-04, AC27-P08-05, AC27-P08-06, AC27-P09-01, AC27-P09-02, AC27-P09-03, AC27-P09-04, AC27-P09-05, AC27-P09-06.

20. **US27-P20.** As an authorized review assignee, I want to see my review date retain its organization-calendar meaning during travel, so that I can avoid missed or unexpectedly shifted internal work.
    Requirements: REQ27-P09. Acceptance: AC27-P09-01, AC27-P09-02, AC27-P09-03, AC27-P09-04, AC27-P09-05, AC27-P09-06.

21. **US27-P21.** As an authorized staff member or missionary with a qualified review profile, I want to find the same assigned review in my permitted task context, so that I can act through a safe working link without copied tasks or excess disclosure.
    Requirements: REQ27-P10. Acceptance: AC27-P10-01, AC27-P10-02, AC27-P10-03, AC27-P10-04, AC27-P10-05, AC27-P10-06, AC27-P10-07, AC27-P10-08.

22. **US27-P22.** As an authorized review assignee, I want to read reminders without hiding unresolved work, so that I can retain an accurate actionable work list until the source is resolved.
    Requirements: REQ27-P10. Acceptance: AC27-P10-01, AC27-P10-02, AC27-P10-03, AC27-P10-04, AC27-P10-05, AC27-P10-06, AC27-P10-07, AC27-P10-08.

23. **US27-P23.** As an authorized development staff member, I want to close finished work after understanding relevant obligations, so that I can preserve promised follow-through and independent work.
    Requirements: REQ27-P11. Acceptance: AC27-P11-01, AC27-P11-02, AC27-P11-03, AC27-P11-04, AC27-P11-05, AC27-P11-06, AC27-P11-07, AC27-P11-08.

24. **US27-P24.** As an authorized development staff member, I want to find permitted closed-work history, so that I can understand what ended without confusing closure with a failed relationship.
    Requirements: REQ27-P11, REQ27-P31. Acceptance: AC27-P11-01, AC27-P11-02, AC27-P11-03, AC27-P11-04, AC27-P11-05, AC27-P11-06, AC27-P11-07, AC27-P11-08, AC27-P31-01, AC27-P31-02, AC27-P31-03, AC27-P31-04, AC27-P31-05, AC27-P31-06, AC27-P31-07.

25. **US27-P25.** As an authorized development staff member, I want to reopen the same relationship when genuine work returns, so that I can retain every prior cycle without reviving completed tasks or revoked access.
    Requirements: REQ27-P12. Acceptance: AC27-P12-01, AC27-P12-02, AC27-P12-03, AC27-P12-04, AC27-P12-05, AC27-P12-06, AC27-P12-07.

26. **US27-P26.** As an authorized development staff member, I want to keep the last recorded stage or absence when work reopens, so that I can avoid unnecessary reassessment and fabricated freshness.
    Requirements: REQ27-P12. Acceptance: AC27-P12-01, AC27-P12-02, AC27-P12-03, AC27-P12-04, AC27-P12-05, AC27-P12-06, AC27-P12-07.

27. **US27-P27.** As an authorized organization configurator, I want to adapt approved stage names, guidance and order, so that I can fit the organization process while preserving historical meaning.
    Requirements: REQ27-P14. Acceptance: AC27-P14-01, AC27-P14-02, AC27-P14-03.

28. **US27-P28.** As an authorized organization configurator, I want to retire and restore stages safely, so that I can stop new use without breaking current work or losing history.
    Requirements: REQ27-P15. Acceptance: AC27-P15-01, AC27-P15-02, AC27-P15-03, AC27-P15-04, AC27-P15-05.

29. **US27-P29.** As an authorized organization configurator, I want to create an additional usable approved list, so that I can support a genuinely different organization process without a workflow builder.
    Requirements: REQ27-P16. Acceptance: AC27-P16-01, AC27-P16-02, AC27-P16-03, AC27-P16-04.

30. **US27-P30.** As an authorized organization configurator, I want to withdraw a list from new use while retaining its existing work, so that I can change the organization process without forced migration.
    Requirements: REQ27-P17. Acceptance: AC27-P17-01, AC27-P17-02, AC27-P17-03, AC27-P17-04, AC27-P17-05, AC27-P17-06, AC27-P17-07, AC27-P17-08, AC27-P17-09.

31. **US27-P31.** As an authorized development staff member, I want to choose an eligible approved list from the shared catalog, so that I can use the appropriate process with clear options.
    Requirements: REQ27-P18. Acceptance: AC27-P18-01, AC27-P18-02, AC27-P18-03, AC27-P18-04, AC27-P18-05, AC27-P18-06, AC27-P18-07, AC27-P18-08, AC27-P18-09, AC27-P18-10, AC27-P18-11, AC27-P18-12, AC27-P18-13.

32. **US27-P32.** As an authorized development staff member, I want to begin with a visible appropriate starting list, so that I can save effort while retaining control over the choice.
    Requirements: REQ27-P19. Acceptance: AC27-P19-01, AC27-P19-02, AC27-P19-03, AC27-P19-04, AC27-P19-05, AC27-P19-06, AC27-P19-07, AC27-P19-08, AC27-P19-09.

33. **US27-P33.** As an authorized organization configurator, I want to set or clear the organization usual-list preference, so that I can guide new work without silently changing existing relationships.
    Requirements: REQ27-P19. Acceptance: AC27-P19-01, AC27-P19-02, AC27-P19-03, AC27-P19-04, AC27-P19-05, AC27-P19-06, AC27-P19-07, AC27-P19-08, AC27-P19-09.

34. **US27-P34.** As an authorized development staff member, I want to choose any appropriate eligible stage directly, so that I can use judgment without artificial sequential clicks.
    Requirements: REQ27-P20. Acceptance: AC27-P20-01, AC27-P20-02, AC27-P20-03, AC27-P20-04, AC27-P20-05, AC27-P20-06.

35. **US27-P35.** As an authorized development staff member, I want to read guidance without mandatory advancement gates, so that I can understand options without unnecessary approvals or regression warnings.
    Requirements: REQ27-P20. Acceptance: AC27-P20-01, AC27-P20-02, AC27-P20-03, AC27-P20-04, AC27-P20-05, AC27-P20-06.

36. **US27-P36.** As an authorized development staff member, I want to start valid work without a current assessment, so that I can avoid making up a stage when I am not ready to assess.
    Requirements: REQ27-P21. Acceptance: AC27-P21-01, AC27-P21-02, AC27-P21-03, AC27-P21-04, AC27-P21-05, AC27-P21-06, AC27-P21-07, AC27-P21-08.

37. **US27-P37.** As an authorized development staff member, I want to distinguish no assessment from unavailable or protected data, so that I can trust what the record currently means.
    Requirements: REQ27-P21, REQ27-P26. Acceptance: AC27-P21-01, AC27-P21-02, AC27-P21-03, AC27-P21-04, AC27-P21-05, AC27-P21-06, AC27-P21-07, AC27-P21-08, AC27-P26-01, AC27-P26-02, AC27-P26-03, AC27-P26-04, AC27-P26-05, AC27-P26-06, AC27-P26-07, AC27-P26-08, AC27-P26-09, AC27-P26-10, AC27-P26-11, AC27-P26-12, AC27-P26-13, AC27-P26-14, AC27-P26-15.

38. **US27-P38.** As an authorized development staff member, I want to deliberately change the list on the same work, so that I can correct a mistaken selection or adapt the process while preserving earlier assessments.
    Requirements: REQ27-P22. Acceptance: AC27-P22-01, AC27-P22-02, AC27-P22-03, AC27-P22-04, AC27-P22-05, AC27-P22-06, AC27-P22-07, AC27-P22-08, AC27-P22-09, AC27-P22-10, AC27-P22-11.

39. **US27-P39.** As an authorized development staff member, I want to leave the destination list without a current assessment, so that I can change process without inventing a mapping from the previous stage.
    Requirements: REQ27-P22. Acceptance: AC27-P22-01, AC27-P22-02, AC27-P22-03, AC27-P22-04, AC27-P22-05, AC27-P22-06, AC27-P22-07, AC27-P22-08, AC27-P22-09, AC27-P22-10, AC27-P22-11.

40. **US27-P40.** As an authorized tenant administrator, I want to have configuration and work changes obey exact current scope and permissions, so that I can protect records and histories across tenants, entities and roles.
    Requirements: REQ27-P13, REQ27-P23. Acceptance: AC27-P13-01, AC27-P13-02, AC27-P13-03, AC27-P13-04, AC27-P13-05, AC27-P13-06, AC27-P13-07, AC27-P13-08, AC27-P13-09, AC27-P23-01, AC27-P23-02, AC27-P23-03, AC27-P23-04, AC27-P23-05, AC27-P23-06, AC27-P23-07, AC27-P23-08, AC27-P23-09, AC27-P23-10, AC27-P23-11, AC27-P23-12, AC27-P23-13, AC27-P23-14, AC27-P23-15, AC27-P23-16, AC27-P23-17, AC27-P23-18, AC27-P23-19, AC27-P23-20, AC27-P23-21, AC27-P23-22, AC27-P23-23, AC27-P23-24, AC27-P23-25.

41. **US27-P41.** As an authorized development staff member, I want to resolve conflicting changes without overwriting newer work, so that I can retain one attributable current stage or list and trustworthy history.
    Requirements: REQ27-P24. Acceptance: AC27-P24-01, AC27-P24-02, AC27-P24-03, AC27-P24-04, AC27-P24-05, AC27-P24-06, AC27-P24-07, AC27-P24-08, AC27-P24-09, AC27-P24-10, AC27-P24-11, AC27-P24-12, AC27-P24-13, AC27-P24-14, AC27-P24-15, AC27-P24-16, AC27-P24-17, AC27-P24-18, AC27-P24-19, AC27-P24-20, AC27-P24-21, AC27-P24-22, AC27-P24-23, AC27-P24-24, AC27-P24-25, AC27-P24-26, AC27-P24-27, AC27-P24-28, AC27-P24-29, AC27-P24-30, AC27-P24-31, AC27-P24-32, AC27-P24-33, AC27-P24-34, AC27-P24-35, AC27-P24-36.

42. **US27-P42.** As a staff member using a keyboard, screen reader or touch, I want to operate stage and partnership controls with readable status and focus, so that I can complete ordinary work independently across devices and languages.
    Requirements: REQ27-P25, REQ27-P30. Acceptance: AC27-P25-01, AC27-P25-02, AC27-P25-03, AC27-P25-04, AC27-P25-05, AC27-P25-06, AC27-P25-07, AC27-P25-08, AC27-P25-09, AC27-P25-10, AC27-P25-11, AC27-P25-12, AC27-P25-13, AC27-P25-14, AC27-P25-15, AC27-P25-16, AC27-P25-17, AC27-P25-18, AC27-P25-19, AC27-P25-20, AC27-P25-21, AC27-P25-22, AC27-P25-23, AC27-P25-24, AC27-P25-25, AC27-P25-26, AC27-P25-27, AC27-P25-28, AC27-P25-29, AC27-P25-30, AC27-P25-31, AC27-P25-32, AC27-P30-01, AC27-P30-02, AC27-P30-03, AC27-P30-04, AC27-P30-05, AC27-P30-06, AC27-P30-07.

43. **US27-P43.** As an authorized development staff member, I want to understand current stage and duration measures, so that I can avoid treating gaps, returns or unknown history as linear progress.
    Requirements: REQ27-P25, REQ27-P31. Acceptance: AC27-P25-01, AC27-P25-02, AC27-P25-03, AC27-P25-04, AC27-P25-05, AC27-P25-06, AC27-P25-07, AC27-P25-08, AC27-P25-09, AC27-P25-10, AC27-P25-11, AC27-P25-12, AC27-P25-13, AC27-P25-14, AC27-P25-15, AC27-P25-16, AC27-P25-17, AC27-P25-18, AC27-P25-19, AC27-P25-20, AC27-P25-21, AC27-P25-22, AC27-P25-23, AC27-P25-24, AC27-P25-25, AC27-P25-26, AC27-P25-27, AC27-P25-28, AC27-P25-29, AC27-P25-30, AC27-P25-31, AC27-P25-32, AC27-P31-01, AC27-P31-02, AC27-P31-03, AC27-P31-04, AC27-P31-05, AC27-P31-06, AC27-P31-07.

44. **US27-P44.** As an authorized development staff member, I want to recover a failed or uncertain stage/list save, so that I can retain permitted intent without false success or duplicate changes.
    Requirements: REQ27-P26. Acceptance: AC27-P26-01, AC27-P26-02, AC27-P26-03, AC27-P26-04, AC27-P26-05, AC27-P26-06, AC27-P26-07, AC27-P26-08, AC27-P26-09, AC27-P26-10, AC27-P26-11, AC27-P26-12, AC27-P26-13, AC27-P26-14, AC27-P26-15.

45. **US27-P45.** As an authorized operations staff member, I want to activate and restore source-backed work safely, so that I can preserve history, restrictions and accepted effects through upgrades.
    Requirements: REQ27-P27, REQ27-P32. Acceptance: AC27-P27-01, AC27-P27-02, AC27-P27-03, AC27-P27-04, AC27-P27-05, AC27-P27-06, AC27-P27-07, AC27-P27-08, AC27-P27-09, AC27-P27-10, AC27-P27-11, AC27-P27-12, AC27-P27-13, AC27-P27-14, AC27-P27-15, AC27-P27-16, AC27-P27-17, AC27-P27-18, AC27-P27-19, AC27-P27-20, AC27-P27-21, AC27-P27-22, AC27-P27-23, AC27-P27-24, AC27-P27-25, AC27-P27-26, AC27-P27-27, AC27-P27-28, AC27-P32-01, AC27-P32-02, AC27-P32-03, AC27-P32-04, AC27-P32-05, AC27-P32-06, AC27-P32-07, AC27-P32-08, AC27-P32-09, AC27-P32-10.

46. **US27-P46.** As an authorized development staff member, I want to deliberately clear a current assessment on the same list, so that I can record that no stage currently fits without erasing earlier assessments.
    Requirements: REQ27-P28. Acceptance: AC27-P28-01, AC27-P28-02, AC27-P28-03, AC27-P28-04, AC27-P28-05, AC27-P28-06, AC27-P28-07, AC27-P28-08, AC27-P28-09, AC27-P28-10.

47. **US27-P47.** As an authorized development staff member, I want to update stage or list while work is paused, so that I can keep records accurate without resuming work or completing its review.
    Requirements: REQ27-P29. Acceptance: AC27-P29-01, AC27-P29-02, AC27-P29-03, AC27-P29-04, AC27-P29-05.

48. **US27-P48.** As an authorized development staff member, I want to see complete permitted counts and truthful unavailable states, so that I can avoid deciding from partial pages or fabricated financial totals.
    Requirements: REQ27-P31. Acceptance: AC27-P31-01, AC27-P31-02, AC27-P31-03, AC27-P31-04, AC27-P31-05, AC27-P31-06, AC27-P31-07.

49. **US27-P49.** As an authorized operations staff member, I want to detect and repair source-backed reminder and projection failures, so that I can restore the same work without guessed recipients or manual database edits.
    Requirements: REQ27-P10, REQ27-P32. Acceptance: AC27-P10-01, AC27-P10-02, AC27-P10-03, AC27-P10-04, AC27-P10-05, AC27-P10-06, AC27-P10-07, AC27-P10-08, AC27-P32-01, AC27-P32-02, AC27-P32-03, AC27-P32-04, AC27-P32-05, AC27-P32-06, AC27-P32-07, AC27-P32-08, AC27-P32-09, AC27-P32-10.

50. **US27-P50.** As an authorized staff member or missionary, I want to distinguish recorded exchange, outreach and agreed follow-up, so that I can understand real contact without treating messages or opens as conversations.
    Requirements: REQ27-P33. Acceptance: AC27-P33-01, AC27-P33-02, AC27-P33-03, AC27-P33-04, AC27-P33-05, AC27-P33-06, AC27-P33-07, AC27-P33-08, AC27-P33-09, AC27-P33-10, AC27-P33-11, AC27-P33-12, AC27-P33-13, AC27-P33-14.

51. **US27-P51.** As a missionary, I want to contribute a useful exchange voluntarily and correct its actual occurrence, so that I can share accurate working history without performance scoring or compulsory logging.
    Requirements: REQ27-P33. Acceptance: AC27-P33-01, AC27-P33-02, AC27-P33-03, AC27-P33-04, AC27-P33-05, AC27-P33-06, AC27-P33-07, AC27-P33-08, AC27-P33-09, AC27-P33-10, AC27-P33-11, AC27-P33-12, AC27-P33-13, AC27-P33-14.

52. **US27-F01.** As a development staff member, I want to record significant financial, nonfinancial and narrowly described noncash invitations in the same Requests experience, so that I can coordinate relevant ministry support without fake financial fields or another partnership journey.
    Requirements: REQ27-F01, REQ27-F04, REQ27-F13, REQ27-F07, REQ27-F15. Acceptance: AC27-F01-01, AC27-F04-02.

53. **US27-F02.** As a partnership lead, I want to keep independently answerable invitations distinct while retaining one coherent partnership, so that agreement to prayer or hosting cannot silently become agreement to funding.
    Requirements: REQ27-F02, REQ27-F15. Acceptance: AC27-F02-01.

54. **US27-F03.** As a responsible staff member, I want to see qualified next work or an owned exception for outstanding Requests and preserve genuinely completed work without perpetual tasks, so that responsibility remains clear when a task completes, an owner leaves or one Request closes.
    Requirements: REQ27-F03, REQ27-F17, REQ27-F08, REQ27-F10. Acceptance: AC27-F03-01, AC27-F03-02.

55. **US27-F04.** As a development staff member, I want to record exact qualified monetary terms and explicit unknowns while keeping nonfinancial records in ordinary counts, so that financial meaning and all Request totals remain truthful across currencies and source joins.
    Requirements: REQ27-F04, REQ27-F10, REQ27-F11, REQ27-F05, REQ27-F15. Acceptance: AC27-F04-01, AC27-F04-04.

56. **US27-F05.** As an authorized history recorder, I want to record an already-presented invitation and response together, including late responses to earlier presented terms, so that the history reflects actual events without fabricated dates, sends or stale overwrites.
    Requirements: REQ27-F05, REQ27-F06, REQ27-F13, REQ27-F09. Acceptance: AC27-F05-01, AC27-F05-03.

57. **US27-F06.** As a development manager, I want to retain original and revised proposals and forecast versions with explicit alternative and reporting scope, so that forecast comparison remains honest and overlapping funding views cannot inflate expectations.
    Requirements: REQ27-F05, REQ27-F06, REQ27-F15. Acceptance: AC27-F05-02, AC27-F05-04.

58. **US27-F07.** As a development staff member, I want to record no answer, partial or conditional response, deferral, decline and staff withdrawal distinctly, so that I can understand what the supporter actually said and choose appropriate follow-through.
    Requirements: REQ27-F06, REQ27-F12, REQ27-F14. Acceptance: AC27-F06-01.

59. **US27-F08.** As an authorized development staff member, I want to view qualified source outcomes and invoke a deliberate independently authorized handoff, so that recording a positive response does not create money, consent, subscriptions or bookings.
    Requirements: REQ27-F07, REQ27-F08, REQ27-F12, REQ27-F15. Acceptance: AC27-F07-01, AC27-F07-02, AC27-F07-03.

60. **US27-F09.** As a Request editor, I want to change relevant details and record permitted updates while work is paused or closed, so that corrections preserve entered data, earlier terms and lifecycle intent.
    Requirements: REQ27-F04, REQ27-F14, REQ27-F08. Acceptance: AC27-F04-03, AC27-F08-01.

61. **US27-F10.** As a tenant privacy administrator, I want to have Request commands, history and every derived projection preserve exact tenant, field, purpose and retention boundaries, so that links, role labels, imports and privileged paths cannot expose or rewrite forbidden facts.
    Requirements: REQ27-F10, REQ27-F11, REQ27-F12. Acceptance: AC27-F10-01, AC27-F10-02, AC27-F12-01, AC27-F10-03, AC27-F11-01.

62. **US27-F11.** As a development staff member on an unreliable connection, I want to save and safely check or retry one intended change despite conflict, interruption or downstream failure, so that accepted work is not lost, duplicated or reapplied over newer truth.
    Requirements: REQ27-F09, REQ27-F16, REQ27-F13, REQ27-F14. Acceptance: AC27-F09-01, AC27-F09-02, AC27-F09-03.

63. **US27-F12.** As a product and release owner, I want to qualify the complete accessible Request journey, data adoption, native independence and measured workload, so that the actual product is usable and recoverable within its evidenced supported envelope.
    Requirements: REQ27-F13, REQ27-F14, REQ27-F18, REQ27-F07, REQ27-F16, REQ27-F17. Acceptance: AC27-F13-01, AC27-F13-02, AC27-F18-01, AC27-F07-04, AC27-F17-01.

64. **US27-F13.** As an authorized organization policy owner, I want to choose a simple review default and explicit Request exceptions with their effective basis visible, so that routine work stays brief while required review cannot disappear through ordinary edits.
    Requirements: REQ27-F19, REQ27-F32, REQ27-F34, REQ27-F20, REQ27-F24. Acceptance: AC27-F19-01, AC27-F19-02, AC27-F19-03.

65. **US27-F14.** As a Request preparer, I want to submit to one currently eligible reviewer or see a safe actionable routing problem, so that my preparation is retained without false waiting, guessed recipients or access expansion.
    Requirements: REQ27-F19, REQ27-F21, REQ27-F32, REQ27-F20, REQ27-F28, REQ27-F29. Acceptance: AC27-F19-04, AC27-F20-02.

66. **US27-F15.** As an internal reviewer, I want to approve exact proposed terms without restarting review for unrelated metadata, so that the approval means what I reviewed and ordinary internal maintenance remains efficient.
    Requirements: REQ27-F22, REQ27-F23, REQ27-F24. Acceptance: AC27-F22-01, AC27-F22-02.

67. **US27-F16.** As a Request preparer or reviewer, I want to withdraw, revise, request changes, reconsider or prospectively revoke a review through explicit actions, so that each round and correction remains understandable without approving unseen terms.
    Requirements: REQ27-F22, REQ27-F23, REQ27-F30, REQ27-F33. Acceptance: AC27-F22-03, AC27-F23-01.

68. **US27-F17.** As a permission administrator, I want to separate preparation, policy, review and presentation powers and apply real identity-based independence floors, so that assignment or a second profile cannot manufacture decision authority.
    Requirements: REQ27-F20, REQ27-F21, REQ27-F29, REQ27-F31. Acceptance: AC27-F20-01, AC27-F21-01.

69. **US27-F18.** As an authorized presenter, I want to have current review, terms, authority and communication rules checked at actual action start, so that a valid historical approval neither sends automatically nor bypasses a later governing restriction.
    Requirements: REQ27-F24, REQ27-F25, REQ27-F26, REQ27-F30, REQ27-F21. Acceptance: AC27-F24-01, AC27-F24-02, AC27-F21-02.

70. **US27-F19.** As a review coordinator, I want to reassign exact review work safely within the shared Tasks Hub, so that the current eligible reviewer acts while stale tasks or generic completion cannot decide.
    Requirements: REQ27-F21, REQ27-F23, REQ27-F27, REQ27-F30, REQ27-F28, REQ27-F34. Acceptance: AC27-F21-03, AC27-F27-02.

71. **US27-F20.** As a reviewer using an intermittent connection, I want to receive one durable source decision and a currently permitted replay result, so that concurrent retries and projection failures cannot create contradictory approvals or misleading success.
    Requirements: REQ27-F29, REQ27-F30, REQ27-F31, REQ27-F27, REQ27-F28, REQ27-F33, REQ27-F32. Acceptance: AC27-F29-01, AC27-F27-01, AC27-F28-01, AC27-F30-01.

72. **US27-F21.** As a review participant, I want to use clear accessible review controls and safe in-context recovery on mobile or assistive technology, so that I can identify the requirement, actual scope, next actor and correction path without confusion.
    Requirements: REQ27-F32, REQ27-F28, REQ27-F37. Acceptance: AC27-F32-01, AC27-F28-02, AC27-F32-02.

73. **US27-F22.** As an authorized source operator, I want to record truthful past facts and reconcile review effects under the same real authorization rules, so that historical recording, jobs and provider uncertainty do not fabricate approval or revive ended work.
    Requirements: REQ27-F20, REQ27-F28, REQ27-F29, REQ27-F25, REQ27-F26, REQ27-F33, REQ27-F27, REQ27-F30, REQ27-F31, REQ27-F34, REQ27-F35. Acceptance: AC27-F20-03, AC27-F25-01, AC27-F27-03.

74. **US27-F23.** As a release owner, I want to qualify review with mixed versions, restored data, unavailable optional products and measured concurrency, so that activation preserves enforced review and truthful history rather than depending on an unproved badge.
    Requirements: REQ27-F29, REQ27-F36, REQ27-F28, REQ27-F33, REQ27-F25, REQ27-F27, REQ27-F34, REQ27-F30, REQ27-F35, REQ27-F37. Acceptance: AC27-F29-02, AC27-F28-03, AC27-F25-02, AC27-F29-03.

75. **US27-F24.** As an appeal organizer, I want to add eligible people or organizations to a recorded working list and use filters only for discovery, so that the plan stays deliberate when a query changes.
    Requirements: REQ27-F38, REQ27-F39, REQ27-F40, REQ27-F48, REQ27-F51, REQ27-F52, REQ27-F41. Acceptance: AC27-F38-01, AC27-F38-03.

76. **US27-F25.** As an appeal organizer, I want to review and capture a bounded finite group with explicit page versus all-results scope, so that large selections remain predictable and later matches cannot silently join the operation.
    Requirements: REQ27-F38, REQ27-F44, REQ27-F51, REQ27-F53, REQ27-F45, REQ27-F46, REQ27-F55. Acceptance: AC27-F38-02, AC27-F44-03.

77. **US27-F26.** As an appeal organizer, I want to receive durable per-member outcomes and safely retry or cancel the same operation, so that duplicate additions and lost replies cannot restore a later removal or exclusion.
    Requirements: REQ27-F40, REQ27-F42, REQ27-F44, REQ27-F45, REQ27-F46, REQ27-F41, REQ27-F51. Acceptance: AC27-F40-01, AC27-F41-02, AC27-F44-02.

78. **US27-F27.** As an appeal organizer, I want to see current eligibility, restricted or unavailable coverage and genuine empty states distinctly, so that I do not mistake a failed load or protected list for no planned supporters.
    Requirements: REQ27-F42, REQ27-F43, REQ27-F50, REQ27-F51, REQ27-F53. Acceptance: AC27-F42-01, AC27-F42-02.

79. **US27-F28.** As an authorized appeal staff member, I want to deliberately remove, exclude or return a supporter with clear consequences, so that planning can change without erasing history or silently restarting completed outreach.
    Requirements: REQ27-F39, REQ27-F41, REQ27-F43, REQ27-F48, REQ27-F42, REQ27-F46, REQ27-F47. Acceptance: AC27-F39-01, AC27-F41-01.

80. **US27-F29.** As a development staff member, I want to retain and record real Requests, responses and independent obligations after list changes, so that a changed plan does not delete actual history or cancel unrelated required work.
    Requirements: REQ27-F39, REQ27-F48, REQ27-F47, REQ27-F52. Acceptance: AC27-F39-02, AC27-F39-03.

81. **US27-F30.** As a communication operations owner, I want to enforce current membership-dependent solicitation restrictions at dispatch admission, so that removal stops unreleased affected work while in-flight and uncertain provider outcomes stay truthful.
    Requirements: REQ27-F43, REQ27-F45, REQ27-F46, REQ27-F47, REQ27-F52, REQ27-F53. Acceptance: AC27-F43-01, AC27-F45-01.

82. **US27-F31.** As a qualified identity steward, I want to retain distinct organization and human identities and resolve only affected current membership collisions, so that contact changes or merges cannot bypass exclusions, double-count or freeze unrelated appeal work.
    Requirements: REQ27-F39, REQ27-F40, REQ27-F42, REQ27-F43, REQ27-F46, REQ27-F49, REQ27-F41, REQ27-F50, REQ27-F54. Acceptance: AC27-F39-04, AC27-F40-03, AC27-F41-03.

83. **US27-F32.** As a tenant privacy administrator, I want to enforce current scope through discovery, capture, mutation, results and exports, so that foreign references, revoked access and hidden uniqueness conflicts cannot reveal protected membership.
    Requirements: REQ27-F40, REQ27-F41, REQ27-F42, REQ27-F43, REQ27-F45, REQ27-F50, REQ27-F44, REQ27-F46, REQ27-F51. Acceptance: AC27-F40-02, AC27-F42-03, AC27-F42-04.

84. **US27-F33.** As an appeal organizer using keyboard, mobile or assistive technology, I want to understand selection, restrictions, disposition and recovery in the actual shared interface, so that I can change the plan accurately without hidden off-page actions or misleading recall language.
    Requirements: REQ27-F51, REQ27-F50, REQ27-F55. Acceptance: AC27-F51-01, AC27-F50-01, AC27-F51-02.

85. **US27-F34.** As a release and source operations owner, I want to adopt and operate recorded membership with atomic protection, native independence and safe upgrade/restore, so that accepted plans and restrictions survive failures without fabricated outreach or incompatible legacy writers.
    Requirements: REQ27-F44, REQ27-F45, REQ27-F46, REQ27-F47, REQ27-F38, REQ27-F39, REQ27-F40, REQ27-F41, REQ27-F42, REQ27-F43, REQ27-F48, REQ27-F49, REQ27-F50, REQ27-F54, REQ27-F52. Acceptance: AC27-F44-01, AC27-F38-04, AC27-F40-04, AC27-F47-01, AC27-F38-05.

86. **US27-F35.** As an authorized gift reporter, I want to record an attributed actual offline receipt separately from promises, dates and assigned responsibility, so that finance can act on truthful reported evidence without claiming verified continuous custody.
    Requirements: REQ27-F56, REQ27-F57, REQ27-F58, REQ27-F59, REQ27-F65, REQ27-F71, REQ27-F60, REQ27-F63. Acceptance: AC27-F56-01, AC27-F57-01.

87. **US27-F36.** As an authorized gift reporter, I want to retain incomplete or wrong-payee intake with an owned exception, so that missing donor, entity or amount does not force a guessed identity or invalid financial row.
    Requirements: REQ27-F58, REQ27-F59, REQ27-F60, REQ27-F68. Acceptance: AC27-F58-01.

88. **US27-F37.** As a finance staff member, I want to continue the same reported intake using the existing finance entry and validation flow, so that staff do not enter a second gift or lose the known source context.
    Requirements: REQ27-F56, REQ27-F59, REQ27-F61, REQ27-F70, REQ27-F57, REQ27-F58, REQ27-F63. Acceptance: AC27-F56-02, AC27-F57-04.

89. **US27-F38.** As an intake steward, I want to preserve one canonical actual intake across appeal references and qualified duplicate-report resolution, so that the same check is not multiplied while truly separate checks remain distinguishable.
    Requirements: REQ27-F61, REQ27-F62, REQ27-F63, REQ27-F68, REQ27-F60, REQ27-F64, REQ27-F67. Acceptance: AC27-F61-01, AC27-F60-01.

90. **US27-F39.** As an authorized finance reconciler, I want to resolve recording only from exact covered source lineage, including an already-recorded gift, so that similar amounts or a missing projection cannot trigger a second posting, receipt or fulfillment application.
    Requirements: REQ27-F59, REQ27-F60, REQ27-F61, REQ27-F62, REQ27-F68, REQ27-F63, REQ27-F64, REQ27-F67. Acceptance: AC27-F59-01, AC27-F59-02.

91. **US27-F40.** As a responsible intake handler, I want to see recording, physical handling and partial item completion as separate facts, so that posting-first, transfer-first and several gifts from one supporter remain actionable without a misleading exclusive status.
    Requirements: REQ27-F57, REQ27-F62, REQ27-F63, REQ27-F64, REQ27-F65, REQ27-F70, REQ27-F61, REQ27-F68. Acceptance: AC27-F57-02, AC27-F61-02.

92. **US27-F41.** As an intake steward, I want to record truthful exceptions and preserve outstanding responsibility through financial correction, archive and appeal closure, so that real property handling cannot silently disappear or reopen from an unrelated reversal.
    Requirements: REQ27-F57, REQ27-F62, REQ27-F63, REQ27-F64, REQ27-F65, REQ27-F66, REQ27-F68, REQ27-F61, REQ27-F69, REQ27-F72. Acceptance: AC27-F57-03, AC27-F62-01, AC27-F61-06.

93. **US27-F42.** As a tenant privacy administrator, I want to separate report, source routing, financial and export powers on every admitted path, so that reporters, assignees and historical authors gain no extra financial or protected missionary access.
    Requirements: REQ27-F58, REQ27-F59, REQ27-F60, REQ27-F67, REQ27-F68, REQ27-F69, REQ27-F65, REQ27-F66, REQ27-F70. Acceptance: AC27-F58-02, AC27-F59-03, AC27-F59-04, AC27-F59-05.

94. **US27-F43.** As a finance integration operator, I want to retain atomic local results and exact lineage across source races, duplicate callbacks and lost responses, so that accepted money remains intact and reconciliation never reposts to repair a consumer.
    Requirements: REQ27-F61, REQ27-F62, REQ27-F66, REQ27-F67, REQ27-F63, REQ27-F64, REQ27-F72. Acceptance: AC27-F61-03, AC27-F61-04, AC27-F61-05, AC27-F61-07.

95. **US27-F44.** As a gift reporter using a phone or assistive technology, I want to complete the short report and recovery flow with clear next actor and status, so that I understand the difference between receipt, handling, assignment, recording and clearance without using the full entry grid.
    Requirements: REQ27-F70, REQ27-F67, REQ27-F69, REQ27-F57, REQ27-F58, REQ27-F63, REQ27-F74. Acceptance: AC27-F70-01, AC27-F67-01, AC27-F57-06.

96. **US27-F45.** As an appeal organizer, I want to see handoff only for applicable qualified intake and continue ordinary work without unrelated optional products, so that online gifts, prayer requests and ordinary members acquire no invented manual finance stage.
    Requirements: REQ27-F57, REQ27-F63, REQ27-F68, REQ27-F71, REQ27-F56, REQ27-F65, REQ27-F69, REQ27-F72. Acceptance: AC27-F57-05, AC27-F56-03.

97. **US27-F46.** As a P15 release and operations owner, I want to qualify the narrow intake extension, safe data adoption, measured recovery and restore before activation, so that accepted reports remain recoverable with named owners and no false production proof.
    Requirements: REQ27-F64, REQ27-F67, REQ27-F69, REQ27-F72, REQ27-F60, REQ27-F61, REQ27-F62, REQ27-F66, REQ27-F73, REQ27-F65, REQ27-F70, REQ27-F57, REQ27-F63, REQ27-F56, REQ27-F74. Acceptance: AC27-F64-01, AC27-F60-02, AC27-F64-02, AC27-F57-07, AC27-F56-04.

98. **US27-F47.** As an appeal organizer, I want to coordinate financial, significant nonfinancial or mixed support around one purpose with optional goals, so that the product supports meaningful ministry work without a monetary target or unrelated setup.
    Requirements: REQ27-F75, REQ27-F87, REQ27-F88. Acceptance: AC27-F75-01, AC27-F75-02.

99. **US27-F48.** As a development staff member, I want to see and correct each specific Request and response within a mixed appeal, so that conditional interest, contradictory contact replies and different invitations cannot collapse into one church-wide outcome.
    Requirements: REQ27-F76, REQ27-F87, REQ27-F86. Acceptance: AC27-F76-01, AC27-F76-02, AC27-F76-03, AC27-F76-04.

100. **US27-F49.** As an appeal organizer, I want to deliberately reference the same relevant Request from multiple appeals, so that coordination preserves one source history and work occurrence without copying records or backdating attribution.
     Requirements: REQ27-F77, REQ27-F83, REQ27-F85, REQ27-F86. Acceptance: AC27-F77-01, AC27-F77-02.

101. **US27-F50.** As a development analyst, I want to read explicit-grain current and historical measures with exact source money and denominator coverage, so that overlapping appeals, goal edits, member removal, source correction or paginated data cannot inflate or rewrite results.
     Requirements: REQ27-F78, REQ27-F79, REQ27-F88, REQ27-F86. Acceptance: AC27-F78-01, AC27-F78-03.

102. **US27-F51.** As an appeal organizer, I want to close or reopen coordination deliberately while preserving independent work and late facts, so that finishing an effort cannot erase genuine obligations or restart ended outreach.
     Requirements: REQ27-F84, REQ27-F85, REQ27-F86, REQ27-F83. Acceptance: AC27-F84-01, AC27-F83-01, AC27-F84-02.

103. **US27-F52.** As an appeal user, I want to use clear list and Request-level board controls with lossless relevant fields, so that selection and display changes cannot fabricate responses, financial facts or silent hidden-value submission.
     Requirements: REQ27-F85, REQ27-F87, REQ27-F79, REQ27-F86, REQ27-F76. Acceptance: AC27-F85-01, AC27-F79-01, AC27-F76-05.

104. **US27-F53.** As a tenant privacy administrator, I want to keep appeal, child Request, shared-update and optional-rating access independent, so that coordination grants no financial, missionary, private nonfinancial or public disclosure rights.
     Requirements: REQ27-F80, REQ27-F81, REQ27-F78, REQ27-F82, REQ27-F85. Acceptance: AC27-F80-01, AC27-F78-02, AC27-F80-02, AC27-F80-03.

105. **US27-F54.** As a source operations owner, I want to apply source mutations, closure and dispatch fences in a defined idempotent order, so that concurrent edits, uncertain responses and alternate appeal references cannot bypass restrictions or lose facts.
     Requirements: REQ27-F85, REQ27-F90, REQ27-F80, REQ27-F84, REQ27-F86. Acceptance: AC27-F85-02, AC27-F80-04, AC27-F85-03, AC27-F85-05.

106. **US27-F55.** As a partnership staff member, I want to see only genuine source work once across coordination views, so that links, list inclusion or ongoing prayer agreement do not create duplicate or perpetual obligations.
     Requirements: REQ27-F83, REQ27-F85, REQ27-F75. Acceptance: AC27-F83-02, AC27-F75-03.

107. **US27-F56.** As an appeal user on mobile or assistive technology, I want to complete the actual create, link, respond, close and recover journey with understandable states, so that I can act confidently on long translated content or slow connections without hidden outcomes.
     Requirements: REQ27-F87, REQ27-F90, REQ27-F85, REQ27-F88. Acceptance: AC27-F87-01, AC27-F87-02, AC27-F87-03, AC27-F85-04.

108. **US27-F57.** As a product and operations owner, I want to keep ordinary nonfinancial work usable while qualifying source-dependent financial views against measured bounds, so that optional outages and unknown financial coverage do not become false zero or stop unrelated safe work.
     Requirements: REQ27-F79, REQ27-F88, REQ27-F90. Acceptance: AC27-F79-02, AC27-F88-01.

109. **US27-F58.** As a release and privacy owner, I want to trace and safely deploy the complete mixed-purpose contract with lawful retention and compatible restore, so that new accepted evidence survives upgrades and documentation is never mistaken for runtime qualification.
     Requirements: REQ27-F82, REQ27-F90, REQ27-F89. Acceptance: AC27-F82-01, AC27-F89-01, AC27-F89-02, AC27-F89-03.

110. **US27-C01.** As a missionary, I want to choose whether to contribute shared context without reporting quotas, so that I can coordinate voluntarily while honoring real source obligations.
     Requirements: REQ27-C01. Acceptance: AC27-C01-01, AC27-C01-02, AC27-C01-03.

111. **US27-C02.** As a missionary or staff collaborator, I want to use a clearly shared composer and a genuinely separate qualified private destination, so that I do not accidentally publish protected or imported context.
     Requirements: REQ27-C02. Acceptance: AC27-C02-01, AC27-C02-02, AC27-C02-03.

112. **US27-C03.** As a partnership collaborator, I want to understand current and possible future authorized readers before saving, so that I can share appropriate context with confidence and retain privacy after role changes.
     Requirements: REQ27-C03. Acceptance: AC27-C03-01, AC27-C03-02, AC27-C03-03, AC27-C03-04.

113. **US27-C04.** As a staff or missionary contributor, I want to record my attributed account once against its actual source and partnership, so that the same encounter remains consistent across permitted surfaces without lost authorship.
     Requirements: REQ27-C04. Acceptance: AC27-C04-01, AC27-C04-02, AC27-C04-03, AC27-C04-04.

114. **US27-C05.** As a contributor on an unreliable connection, I want to recover the same accepted update after a lost response, so that I do not create duplicates or retrieve information after access ends.
     Requirements: REQ27-C05. Acceptance: AC27-C05-01, AC27-C05-02, AC27-C05-03, AC27-C05-04.

115. **US27-C06.** As a collaborator moving between records, I want to retain the correct draft and clear save status for each partnership, so that a late response or changed record cannot publish or erase the wrong text.
     Requirements: REQ27-C06. Acceptance: AC27-C06-01, AC27-C06-02, AC27-C06-03, AC27-C06-04.

116. **US27-C07.** As a staff or missionary contributor, I want to record and correct when an interaction actually occurred, so that history remains truthful without reopening work or rewriting someone else’s contribution.
     Requirements: REQ27-C07. Acceptance: AC27-C07-01, AC27-C07-02, AC27-C07-03, AC27-C07-04.

117. **US27-C08.** As an authorized privacy operator, I want to restrict and correct an accidental disclosure through its source, so that future access and restored copies honor privacy while lawful evidence remains.
     Requirements: REQ27-C08. Acceptance: AC27-C08-01, AC27-C08-02, AC27-C08-03, AC27-C08-04.

118. **US27-C09.** As a tenant development administrator, I want to use dependable bounded shared history independently of optional products, so that staff and missionaries can coordinate without a second diary or unqualified legacy exposure.
     Requirements: REQ27-C09. Acceptance: AC27-C09-01, AC27-C09-02, AC27-C09-03, AC27-C09-04.

119. **US27-C10.** As a staff or missionary collaborator, I want to see actual personal exchanges separately from sent outreach, so that I can understand contact history without treating every message or short reply incorrectly.
     Requirements: REQ27-C10. Acceptance: AC27-C10-01, AC27-C10-02, AC27-C10-03, AC27-C10-04.

120. **US27-C11.** As a staff member preparing follow-up, I want to see a complete, correctable and honestly dated exchange summary, so that old, undated or hidden history does not become false neglect or a fabricated recent conversation.
     Requirements: REQ27-C11. Acceptance: AC27-C11-01, AC27-C11-02, AC27-C11-03, AC27-C11-04.

121. **US27-C12.** As a missionary or staff reader, I want to see the same qualified exchange meaning within my permitted partnership scope, so that sharing, affiliation and old messages cannot expand access or create pressure to contact.
     Requirements: REQ27-C12. Acceptance: AC27-C12-01, AC27-C12-02, AC27-C12-03, AC27-C12-04.

122. **US27-C13.** As a tenant administrator, I want to choose optional financial ratings separately from automatic internal reviews, so that the product remains useful without scores or unexpected review chores.
     Requirements: REQ27-C13. Acceptance: AC27-C13-01, AC27-C13-02, AC27-C13-03, AC27-C13-04.

123. **US27-C14.** As an authorized financial staff member, I want to understand separate financial dimensions and approved ranges, so that I can inspect observed giving without a misleading relationship-value or peer-ranking score.
     Requirements: REQ27-C14. Acceptance: AC27-C14-01, AC27-C14-02, AC27-C14-03, AC27-C14-04.

124. **US27-C15.** As an authorized financial reader, I want to inspect the subject, lens and scope behind each giving pattern, so that split gifts and recognition cannot double count or imply support for the wrong ministry.
     Requirements: REQ27-C15. Acceptance: AC27-C15-01, AC27-C15-02, AC27-C15-03, AC27-C15-04.

125. **US27-C16.** As a finance staff member, I want to have ratings use only qualified received monetary facts, so that pending gifts, promises, noncash values and fees do not distort financial truth.
     Requirements: REQ27-C16. Acceptance: AC27-C16-01, AC27-C16-02, AC27-C16-03, AC27-C16-04.

126. **US27-C17.** As an authorized financial reader, I want to see exact count, amount and period-specific recency with honest empty states, so that unknown history cannot be mistaken for zero or a low-value relationship.
     Requirements: REQ27-C17. Acceptance: AC27-C17-01, AC27-C17-02, AC27-C17-03, AC27-C17-04.

127. **US27-C18.** As a tenant administrator, I want to choose a clearly dated supported observation period, so that calendar boundaries, timezones and partial periods do not manufacture changes.
     Requirements: REQ27-C18. Acceptance: AC27-C18-01, AC27-C18-02, AC27-C18-03, AC27-C18-04.

128. **US27-C19.** As a tenant administrator, I want to edit complete numeric bands with precise validation, so that every qualified value has one understandable financial classification.
     Requirements: REQ27-C19. Acceptance: AC27-C19-01, AC27-C19-02, AC27-C19-03, AC27-C19-04.

129. **US27-C20.** As an authorized financial reader, I want to see corrections and coverage changes explained as their actual causes, so that returns, imports or missing evidence do not become a false relational decline.
     Requirements: REQ27-C20. Acceptance: AC27-C20-01, AC27-C20-02, AC27-C20-03, AC27-C20-04.

130. **US27-C21.** As a privacy administrator, I want to enforce staff financial permissions on every rating derivative, so that tenant enablement or shared history cannot disclose ratings to the wrong person or surface.
     Requirements: REQ27-C21. Acceptance: AC27-C21-01, AC27-C21-02, AC27-C21-03, AC27-C21-04.

131. **US27-C22.** As a tenant administrator, I want to change rating policy once with a clear authoritative outcome, so that concurrent saves and stale workers cannot restore disabled behavior.
     Requirements: REQ27-C22. Acceptance: AC27-C22-01, AC27-C22-02, AC27-C22-03, AC27-C22-04.

132. **US27-C23.** As a staff member using saved views or exports, I want to receive an explicit repair choice when ratings are off or inaccessible, so that my filter is not silently removed and my results are not broadened.
     Requirements: REQ27-C23. Acceptance: AC27-C23-01, AC27-C23-02, AC27-C23-03, AC27-C23-04.

133. **US27-C24.** As a tenant administrator, I want to establish a fresh baseline when enabling or changing analysis, so that configuration and historical data changes do not create a backlog of invented declines.
     Requirements: REQ27-C24. Acceptance: AC27-C24-01, AC27-C24-02, AC27-C24-03, AC27-C24-04.

134. **US27-C25.** As a tenant administrator, I want to opt into a finite explained internal-review condition only when useful, so that analysis can support staff judgment without automatically demanding solicitation.
     Requirements: REQ27-C25. Acceptance: AC27-C25-01, AC27-C25-02, AC27-C25-03, AC27-C25-04.

135. **US27-C26.** As a development reviewer, I want to receive one review for one genuine qualified entry into the selected conditions, so that retries, multiple axes and repeated calculations do not produce duplicate work.
     Requirements: REQ27-C26. Acceptance: AC27-C26-01, AC27-C26-02, AC27-C26-03, AC27-C26-04.

136. **US27-C27.** As a development reviewer, I want to receive a source-owned internal action with correct responsibility and a No change needed outcome, so that I can resolve a review without pretending to contact someone or relying on a guessed assignee.
     Requirements: REQ27-C27. Acceptance: AC27-C27-01, AC27-C27-02, AC27-C27-03, AC27-C27-04.

137. **US27-C28.** As a tenant administrator, I want to stop solely automatic unresolved reviews when turning their feature off, so that unnecessary work ends without losing independently planned follow-up or financial obligations.
     Requirements: REQ27-C28. Acceptance: AC27-C28-01, AC27-C28-02, AC27-C28-03, AC27-C28-04.

138. **US27-C29.** As a staff member using financial context during an outage, I want to distinguish unavailable evidence from resolved work and recover accepted changes, so that service failures cannot invent zero values, completion or duplicate effects.
     Requirements: REQ27-C29. Acceptance: AC27-C29-01, AC27-C29-02, AC27-C29-03, AC27-C29-04.

139. **US27-C30.** As a security and financial operations owner, I want to verify database boundaries and attributable policy history, so that scope changes, privileged paths and retirement cannot corrupt or expose financial analysis.
     Requirements: REQ27-C30. Acceptance: AC27-C30-01, AC27-C30-02, AC27-C30-03, AC27-C30-04.

140. **US27-C31.** As a tenant operations administrator, I want to roll out and stop ratings safely at measured workloads, so that large tenants and legacy consumers cannot break ordinary work or ignore tenant choice.
     Requirements: REQ27-C31. Acceptance: AC27-C31-01, AC27-C31-02, AC27-C31-03, AC27-C31-04.

141. **US27-C32.** As a staff member preparing a meeting, I want to use a deterministic source-linked brief with qualified documents and exports, so that I can prepare accurately without AI, copied transcripts or a new document product.
     Requirements: REQ27-C32. Acceptance: AC27-C32-01, AC27-C32-02, AC27-C32-03, AC27-C32-04.

142. **US27-C33.** As a church relations staff member, I want to track a church and its contacts, giving and ministry relationships distinctly, so that leadership changes and shared mailboxes do not rewrite history or grant member access.
     Requirements: REQ27-C33. Acceptance: AC27-C33-01, AC27-C33-02, AC27-C33-03, AC27-C33-04.

143. **US27-C34.** As a development manager, I want to use clear native owner, stage, Request and forecast/outcome views, so that I can understand current work without a misleading combined total or dependence on broader analytics.
     Requirements: REQ27-C34. Acceptance: AC27-C34-01, AC27-C34-02, AC27-C34-03, AC27-C34-04.

144. **US27-C35.** As a staff member or missionary using mobile or assistive technology, I want to understand and operate shared context and financial details in the familiar interface, so that I can complete work clearly on different devices, languages and connection qualities.
     Requirements: REQ27-C35. Acceptance: AC27-C35-01, AC27-C35-02, AC27-C35-03, AC27-C35-04.

145. **US27-C36.** As a release owner, I want to require traceable source, privacy, accessibility, workload and user-comprehension evidence, so that we activate qualified behavior and respond through accountable operators rather than claiming untested readiness.
     Requirements: REQ27-C36. Acceptance: AC27-C36-01, AC27-C36-02, AC27-C36-03, AC27-C36-04.

146. **US27-A01.** As a Tenant administrator, I want to start with reviewed changes and opt into automatic changes for a bounded scope, so that I can choose the amount of automation without changing other responsibilities.
     Requirements: REQ27-A01. Acceptance: AC27-A01-01.

147. **US27-A02.** As a development staff member, I want to route a genuinely eligible new responsibility without enabling automatic replacement, so that I can start work without an unnecessary automation setup.
     Requirements: REQ27-A01, REQ27-A02, REQ27-A04. Acceptance: AC27-A01-02, AC27-A04-01.

148. **US27-A03.** As a development staff member, I want to keep native assignment usable when optional products are unavailable, so that I can continue ordinary ministry work without a workflow or directory dependency.
     Requirements: REQ27-A01, REQ27-A02, REQ27-A09. Acceptance: AC27-A01-03.

149. **US27-A04.** As a Tenant administrator, I want to configure understandable supported criteria, eligible targets and deterministic priority, so that I can know which rule governs an assignment and avoid arbitrary replacements.
     Requirements: REQ27-A02, REQ27-A09. Acceptance: AC27-A02-01, AC27-A02-02.

150. **US27-A05.** As a development staff member, I want to see no-match, unknown-input and ineligible-target outcomes separately, so that I can retain valid accountability while resolving the actual problem.
     Requirements: REQ27-A02, REQ27-A07. Acceptance: AC27-A02-01, AC27-A07-01, AC27-A02-02.

151. **US27-A06.** As an assignment-policy maintainer, I want to prevent cyclic or irrelevant rule evaluations, so that I can avoid repeated transfers and unnecessary work.
     Requirements: REQ27-A02, REQ27-A15. Acceptance: AC27-A02-03.

152. **US27-A07.** As a development staff member, I want to transfer only one named role-qualified responsibility, so that I can preserve colleagues, other roles and the authoritative primary.
     Requirements: REQ27-A03, REQ27-A10. Acceptance: AC27-A03-01, AC27-A03-02, AC27-A03-03.

153. **US27-A08.** As an assignment manager, I want to change or remove primary responsibility through the exact source operation, so that I can avoid contradictory primaries or a fabricated successor.
     Requirements: REQ27-A03, REQ27-A07, REQ27-A10, REQ27-A11. Acceptance: AC27-A03-02, AC27-A07-03.

154. **US27-A09.** As a development staff member, I want to protect a chosen person or an intentional vacancy from rules, so that I can retain deliberate relationship responsibility until I explicitly change control.
     Requirements: REQ27-A04. Acceptance: AC27-A04-01, AC27-A04-02.

155. **US27-A10.** As a development staff member, I want to keep the current person as a protected manual choice, so that I can stop automatic replacement even when the assignee name stays unchanged.
     Requirements: REQ27-A04, REQ27-A11. Acceptance: AC27-A04-02, AC27-A04-04.

156. **US27-A11.** As a development staff member, I want to return a protected responsibility to rules with its current effect explained, so that I can deliberately resume the chosen policy without guessing what will change.
     Requirements: REQ27-A04, REQ27-A07. Acceptance: AC27-A04-03, AC27-A07-01.

157. **US27-A12.** As a Tenant administrator, I want to save inert drafts and activate policy prospectively, so that I can avoid unexpectedly moving current assignments while maintaining the rules.
     Requirements: REQ27-A01, REQ27-A05, REQ27-A14. Acceptance: AC27-A05-01, AC27-A01-04, AC27-A05-03.

158. **US27-A13.** As an assignment manager, I want to review current matches and apply one finite selected set, so that I can update existing responsibilities without an unseen population sweep.
     Requirements: REQ27-A05, REQ27-A06. Acceptance: AC27-A05-01, AC27-A05-02, AC27-A06-01.

159. **US27-A14.** As a development staff member, I want to compare actual and proposed responsibility and supersede stale proposals, so that I can make a current deliberate transfer rather than apply an outdated suggestion.
     Requirements: REQ27-A05, REQ27-A06, REQ27-A14. Acceptance: AC27-A05-02, AC27-A01-04, AC27-A14-01.

160. **US27-A15.** As a development staff member, I want to recover partial group results and cancel only unaccepted members, so that I can finish authorized changes without repeating successful transfers.
     Requirements: REQ27-A06, REQ27-A11, REQ27-A15, REQ27-A16. Acceptance: AC27-A05-02, AC27-A06-01.

161. **US27-A16.** As a Tenant administrator, I want to disable and later re-enable automatic replacement prospectively, so that I can stop pending automatic changes without reversing completed work or replaying a backlog.
     Requirements: REQ27-A05, REQ27-A11, REQ27-A12. Acceptance: AC27-A01-01, AC27-A11-02, AC27-A05-03, AC27-A12-01.

162. **US27-A17.** As an assignment source owner, I want to order source events and policy changes by authoritative admission, so that I can prevent worker timing or backdated business dates from changing policy meaning.
     Requirements: REQ27-A05, REQ27-A11, REQ27-A12. Acceptance: AC27-A04-04, AC27-A11-02, AC27-A05-03.

163. **US27-A18.** As a development operations lead, I want to retain independent partnership, Request and task responsibility during a representative transfer, so that I can keep genuine obligations with their actual lawful owners.
     Requirements: REQ27-A07, REQ27-A08, REQ27-A09. Acceptance: AC27-A08-01, AC27-A07-02, AC27-A07-03.

164. **US27-A19.** As a receiving staff member, I want to see whether required handoff acceptance precedes transfer or acknowledgment remains outstanding, so that I can accept actual source work without a false completion claim or universal ceremony.
     Requirements: REQ27-A07, REQ27-A08. Acceptance: AC27-A07-02.

165. **US27-A20.** As a security administrator, I want to revoke departed staff access immediately while responsibility repair continues, so that I can stop unauthorized access without abandoning source obligations.
     Requirements: REQ27-A07, REQ27-A08, REQ27-A09. Acceptance: AC27-A09-01, AC27-A07-02, AC27-A07-03.

166. **US27-A21.** As a Tenant security owner, I want to enforce separate current policy, transfer and recipient powers through every entry point, so that I can prevent forged or privileged requests from bypassing exact scope.
     Requirements: REQ27-A09, REQ27-A10, REQ27-A11. Acceptance: AC27-A09-01, AC27-A09-02, AC27-A09-04.

167. **US27-A22.** As an automation operator, I want to run assignment changes only under current bounded execution authority, so that I can preserve human approval lineage without impersonation or stale grants.
     Requirements: REQ27-A09, REQ27-A11. Acceptance: AC27-A09-01, AC27-A04-04, AC27-A11-02.

168. **US27-A23.** As an authorized assignment reader, I want to receive permission-safe candidates, reasons, totals and history, so that I can understand work without exposing private people, source facts or restricted duties.
     Requirements: REQ27-A09, REQ27-A13. Acceptance: AC27-A09-03, AC27-A09-04, AC27-A10-02.

169. **US27-A24.** As a development staff member, I want to retain safe context and drafts across changes in access or Tenant, so that I can recover appropriately without leaking or replaying stale information.
     Requirements: REQ27-A11, REQ27-A13, REQ27-A14. Acceptance: AC27-A01-04, AC27-A09-04, AC27-A11-03.

170. **US27-A25.** As an assignment source owner, I want to commit the assignment, control, primary, history and required intent coherently, so that I can avoid partial responsibility changes when a save fails.
     Requirements: REQ27-A10, REQ27-A11, REQ27-A16. Acceptance: AC27-A09-02, AC27-A10-01.

171. **US27-A26.** As a development staff member, I want to recover a lost response using the same operation and inspect historical results honestly, so that I can avoid duplicate transfers or overwriting later choices.
     Requirements: REQ27-A11, REQ27-A12, REQ27-A16. Acceptance: AC27-A10-01, AC27-A11-01, AC27-A06-01.

172. **US27-A27.** As an assignment manager, I want to correct responsibility or return to a previous staff member as a new authorized transition, so that I can preserve history and later restrictions instead of blindly undoing them.
     Requirements: REQ27-A03, REQ27-A04, REQ27-A12. Acceptance: AC27-A03-04, AC27-A11-01, AC27-A03-05.

173. **US27-A28.** As a data steward, I want to repair merged or imported assignment references without guessing provenance, so that I can preserve protected choices, roles, financial history and actual remaining work.
     Requirements: REQ27-A03, REQ27-A04, REQ27-A12, REQ27-A17. Acceptance: AC27-A03-01, AC27-A03-04, AC27-A03-05, AC27-A17-01.

174. **US27-A29.** As a development staff member, I want to use clear accessible settings, review, transfer and recovery flows on mobile or slow connections, so that I can understand current responsibility and complete the intended action without workarounds.
     Requirements: REQ27-A14, REQ27-A18. Acceptance: AC27-A14-01, AC27-A14-02, AC27-A14-03, AC27-A11-03.

175. **US27-A30.** As an operations lead, I want to inspect safe diagnostics, measure capacity and recover source failures, so that I can operate a bounded reliable service without database edits or noisy duplicate tasks.
     Requirements: REQ27-A13, REQ27-A15, REQ27-A16, REQ27-A18. Acceptance: AC27-A10-01, AC27-A06-01, AC27-A10-02, AC27-A15-01, AC27-A18-01.

176. **US27-A31.** As a release operator, I want to migrate, pilot, disable and restore assignment features without side effects, so that I can preserve accepted history and protections across old and new components.
     Requirements: REQ27-A12, REQ27-A17. Acceptance: AC27-A11-02, AC27-A03-05, AC27-A17-01, AC27-A12-01.

177. **US27-A32.** As an implementation reviewer, I want to trace every accepted assignment rule and proof outcome to the formal owners and release evidence, so that I can verify complete scope without confusing specification publication with a working feature.
     Requirements: REQ27-A18. Acceptance: AC27-A18-01.

178. **US27-Q01.** As an authorized operator, I want one authoritative command boundary, so that each fact has one accountable source.
     Requirements: REQ27-Q01. Acceptance: AC27-Q01-01, AC27-Q01-02.

179. **US27-Q02.** As an authorized operator, I want current authority across all paths, so that my work never exposes or changes another scope.
     Requirements: REQ27-Q02. Acceptance: AC27-Q02-01, AC27-Q02-02.

180. **US27-Q03.** As a delivery owner, I want database constraints and effective RLS, so that invalid and unauthorized data cannot bypass the interface.
     Requirements: REQ27-Q03. Acceptance: AC27-Q03-01, AC27-Q03-02.

181. **US27-Q04.** As an authorized operator, I want durable effects and truthful retries, so that recovery preserves one truthful business effect.
     Requirements: REQ27-Q04. Acceptance: AC27-Q04-01, AC27-Q04-02.

182. **US27-Q05.** As an authorized operator, I want concurrent intent and temporal correctness, so that another edit cannot silently erase my intended change.
     Requirements: REQ27-Q05. Acceptance: AC27-Q05-01, AC27-Q05-02.

183. **US27-Q06.** As an authorized operator, I want complete permission-safe projections, so that the same privacy and coverage apply everywhere.
     Requirements: REQ27-Q06. Acceptance: AC27-Q06-01, AC27-Q06-02.

184. **US27-Q07.** As an authorized operator, I want operational follow-through without coercion, so that necessary work remains visible without coercive reporting.
     Requirements: REQ27-Q07. Acceptance: AC27-Q07-01, AC27-Q07-02.

185. **US27-Q08.** As an authorized operator, I want native integration independence, so that ordinary development works without optional products.
     Requirements: REQ27-Q08. Acceptance: AC27-Q08-01, AC27-Q08-02.

186. **US27-Q09.** As an authorized operator, I want a clear composed interface and accessible alternatives, so that I can understand and complete every supported flow.
     Requirements: REQ27-Q09. Acceptance: AC27-Q09-01, AC27-Q09-02.

187. **US27-Q10.** As an authorized operator, I want international and sensitive context, so that international and sensitive context stays accurate and private.
     Requirements: REQ27-Q10. Acceptance: AC27-Q10-01, AC27-Q10-02.

188. **US27-Q11.** As a delivery owner, I want migration and safe activation, so that retained work survives upgrades and failures.
     Requirements: REQ27-Q11. Acceptance: AC27-Q11-01, AC27-Q11-02.

189. **US27-Q12.** As a delivery owner, I want measured capacity and bounded work, so that admitted workloads have proved operational limits.
     Requirements: REQ27-Q12. Acceptance: AC27-Q12-01, AC27-Q12-02.

190. **US27-Q13.** As an authorized operator, I want separate business evidence and operational signals, so that I can explain and safely recover what happened.
     Requirements: REQ27-Q13. Acceptance: AC27-Q13-01, AC27-Q13-02.

191. **US27-Q14.** As a delivery owner, I want a confirmed test seam and independently verifiable stories, so that each delivered outcome has meaningful proof.
     Requirements: REQ27-Q14. Acceptance: AC27-Q14-01, AC27-Q14-02.

192. **US27-Q15.** As an authorized operator, I want financial owner gates E7 and C-01, so that unqualified source implementations cannot turn settled policy into invented financial truth.
     Requirements: REQ27-Q15. Acceptance: AC27-Q15-01, AC27-Q15-02.

193. **US27-Q16.** As a delivery owner, I want truthful release evidence and a staff pilot, so that release readiness is supported by actual user and runtime evidence.
     Requirements: REQ27-Q16. Acceptance: AC27-Q16-01, AC27-Q16-02.

<!-- END GENERATED STORIES -->

## Implementation Decisions

1. **Ownership and modules.** Extend the native CRM/domain boundary with partnership lifecycle and stage catalogs, Request terms/response/review, recorded appeal membership, scoped brief/health views, optional giving-pattern calculations and bounded staff-assignment policy. Reuse P9 Party, relationship, encounter, assignment and task ownership. Reuse P12 permission resolution, P15 operational intake, P13 contribution facts, P14 recognition, P16 commitments, P17 content and P6 communication. Surface modules compose those contracts; no competing CRM, portfolio, task, finance or private-file store is introduced.

2. **Server and browser boundary.** Authenticate and authorize inside every command/read/job/result-recovery boundary. The canonical shared API package owns database business logic; application routes remain thin. Approved database collections/hooks expose browser table data; server read models serve protected joins and aggregates. Complex forms use the established TanStack Form/Zod pattern; use native forms for simple actions. Keep shared components in the shared UI package, exact Base UI/base-maia with Zinc semantic tokens, existing table/virtualization and navigation conventions. No new framework or product dependency is needed.

3. **Command contract.** A mutation identifies an exact source subject, explicit intended action/values, expected source/catalog/policy revision where relevant, and durable operation identity. Trusted context supplies tenant, actor and current authorization; requested responsibility/target is validated, never accepted as an authority assertion. Return the persisted authorized outcome and revision, a recoverable receipt, and distinct secondary-work status. The result space distinguishes applied, unchanged, known existing, conflict, invalid/ineligible, denied/not available, pending reconciliation and member-level partial completion. Public errors must not reveal hidden source existence. A timeout after commit first recovers the same operation. Bulk input is a finite reviewed selection with per-member results, not a later reevaluated filter.

4. **Exact native interfaces.** The interfaces below are semantic contracts using the existing source-command transport pattern; the implementation must expose these outcomes without inventing a second production testing API or unnecessary generic command bus.

| Module/interface                             | Accepted intent                                                                                                                               | Authoritative outcome and important boundary                                                                                                       |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Partnership admission                        | Exact permitted supporter, identified MinistryAssignment/purpose, approved list, optional stage, qualified lead and next task/owned exception | One continuing context, same-intent reuse only when permitted, durable receipt; no automatic enrollment from record arrival                        |
| Partnership lifecycle                        | Pause with review, close with obligation disposition, genuine same-context return, qualified correction                                       | Current lifecycle/history and exact source work; ended child work is not restarted and real obligations are not hidden                             |
| Stage/list catalog and assessment            | Manage approved catalogs; set/clear assessment; deliberate list change with selected stage or intentional absence                             | Atomic exact list/stage/revision outcome, stable meanings and history; no automatic stage or consent effects                                       |
| Request terms and presentation               | Financial/nonfinancial purpose, exact versioned terms, responsible person, expected response/forecast, actual presentation evidence           | Distinct terms, forecast and occurrence history; a draft/review decision is not a presented Request                                                |
| Request review/response                      | Exact submitted revision, eligible reviewer, decision; actual response/deferral/correction                                                    | Bounded native review and independent response; no charge, commitment, financial posting or message is inferred                                    |
| Appeal plan                                  | Purpose, optional scoped goals, deliberate finite Add/Remove/Exclude/Return, canonical source references                                      | Recorded plan/history, current eligible action choices and independent Request outcomes; filtering does not rewrite membership                     |
| Awaiting-finance report                      | P15-qualified actual receipt assertion, known facts, holder/recording actor, accountable work                                                 | Same operational intake with exact lineage; financial entry/recording and physical handling remain independently owned                             |
| Shared history and recency                   | New eligible attributed update/encounter/reference with actual date precision, exact qualified context                                        | One P9 source, current/history-permitted projection, actual exchange and separate outreach; no private-note republication                          |
| Giving-pattern configuration/read            | Tenant opt-in, separate review opt-in, bounded ranges and qualified financial scope/generation                                                | Explained R/F/M values/coverage; Off withdraws current dependent views/work and stale generations cannot republish                                 |
| Assignment policy/transfer                   | Exact role/rule scope, draft/activate, finite current-match review, Keep/manual choice/Use rules again                                        | P9-authoritative role-specific assignment/history and preserved work; current policy/revocation/protection fences govern Auto                      |
| Native work/attention and optional consumers | Qualified actionable source occurrence and permanent purpose/effect identity                                                                  | Existing shared task and notification projections under current audience; source retains completion and optional adoption cannot duplicate effects |
| Brief/report/export                          | Exact admitted subject/filter, source lens, entity/currency/period and coverage                                                               | Authorized source-linked composition or explicit partial/unavailable state; exported membership is not permission to contact                       |

5. **Logical storage and invariant enforcement.** Physical SQL names follow existing conventions; these logical facts and constraints are mandatory. Stable IDs are never editable labels. Tenant-aware references, bounded state combinations and source version checks prevent invalid combinations at the owner boundary. Scalar money uses exact currency-aware minor units, not floating point; multi-period/recurring quantities retain cadence, term and horizon. No mandatory-stage default or zero-for-unknown backfill is permitted.

| Logical source fact                      | Required integrity                                                                                                                                                                                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Continuing partnership                   | Tenant, supporter, identified ministry/purpose and stable lineage; one ordinary continuing context across pause/close/return, with qualified independent-purpose exception and merge/correction handling                                       |
| Approved list and stable stages          | Tenant/source eligibility, current catalog revision, separate availability for new use versus retained use; historical meanings cannot be deleted/reused; current stage nullable by deliberate semantics and must belong to current saved list |
| Assessment/lifecycle history             | Attributable old/new fact, actual occurrence/effective versus recorded time, revision and correction linkage; no append for unchanged retries and no deletion of earlier valid assessments                                                     |
| Request and terms/forecast/response      | Stable Request identity, kind and qualified scope; immutable prior presented/reviewed terms and historical forecasts, exact revision-bound decisions and separately attributable responses                                                     |
| Appeal membership and source association | Stable subject identity and explicit current disposition/history, scoped uniqueness; exact references and conserved financial coverage without duplicate contribution authority                                                                |
| P15 intake                               | Operational report may have unknown future finance facts; tenant/accountability required; every actual financial root retains complete mandatory scope; canonical lineage and independent work completion                                      |
| P9 interaction                           | One qualified encounter/update source with current audience/history and correction/retention; private notes remain separate and cannot be migrated into this exception                                                                         |
| P9 assignment                            | Exact role-qualified edge lineage, legitimate multiple roles and assignees, no duplicate active edge and one shared primary; immutable history plus explicit manual/managed provenance                                                         |
| Policy/calculation generations           | Immutable published basis, current enabled state, bounded criteria/ranges and derived output generation; current authority fences delayed work and incompatible generations                                                                    |
| Source work and operation evidence       | One durable semantic effect identity, source applicability, current recipient ceiling and authorized receipt; task/read-state cannot close source business work                                                                                |

6. **Transitions and cross-domain consistency.** Use the exact lifecycle and GWT matrices in the volumes. Advisory stages are not a state machine controlling Request, finance, consent or workflow status. Multi-row local acceptance, audit/history and required downstream intent commit atomically; external I/O remains outside the database transaction under existing durable replay/reconciliation. Independent successful source work is not rolled back because a projection failed. Expected revisions and real serialization protect concurrent changes; latest request arrival alone does not authorize overwriting.

7. **UI composition.** The partnership header presents subject/ministry, current lifecycle, stage/list, responsible lead and next work. Requests show relevant terms, current review/response and next action. Appeals separate the recorded plan from Request-level board/outcomes and qualified finance. Briefs prioritize useful current source context; giving patterns stay secondary and absent when Off. Configuration lives with authorized tenant settings, not ordinary workflow clutter. A clean status line distinguishes saved source truth from pending synchronization. Loading/empty/denied/currently unavailable are different states. All consequential choices describe what changes and what stays independent before Save.

8. **Integrations and security.** Required P9/P12/P13/P14/P15/P16/P6/P17 contracts are qualified before their dependent lanes activate; do not pull entire future phases into the dependency graph. Bind document/export and public projections only when admitted by their owners. Phase 28 D48–D50 settles E7/C-01 policy; Q15 retains exact producer/adapter qualification with no guessed financial fallback. P28 reuses the same source with its permitted slice and voluntary interaction behavior. Native functionality is independent of P34/P42; optional DON-14–DON-16 and WS-18-CORE consume the same permanent source-purpose effects. SMS, directory, gift automation, applications, care and analytics remain with their owners.

9. **Migration, rollout and operation.** Census existing data/provenance and reached placeholders before changing them. Deploy compatible readers/constraints before writers, use resumable effect-free backfills, fence incompatible old clients/jobs, and preserve accepted history/recovery when disabling. Unknown assignment provenance remains protected; old private notes remain private. Qualification records numeric operational envelopes and actual measured budgets, current provider/version, restore/replay evidence and named operating owners. No automatic stage migration, retroactive campaign policy, silent opt-in or destructive rollback is authorized.

10. **Delivery order and completion.** First reconcile/qualify source interfaces and constraints, then prove a complete ordinary staff journey, then extend the same model with all settled catalog/lifecycle, Request/review/appeal/intake/context and optional policy features. Complete source role/RLS and concurrency proof alongside each command, composed accessibility/usability alongside each journey, then retained-data and admitted-workload qualification. All mapped stories remain required; an unchecked dependent gate is visible and cannot be represented as completed scope. The active OpenSpec tasks are a local implementation/proof plan, not a newly published implementation-ticket graph.

## Testing Decisions

The founder confirmed the proposed approach before drafting: **real authenticated Mission Control journeys on disposable Supabase, supported by focused real-command/job and database authorization, concurrency and migration tests over the same backend**. This is the primary acceptance setup, not a second production API or another testing framework. Each story maps to precise requirement and AC IDs in [traceability](phase-27-donor-development/traceability.json).

- **Test external behavior and domain outcomes.** Start at actual source commands, authorized projections and job entry points; verify persistent results through fresh reads/reload and a second permitted session. Exercise the qualified missionary-workspace sharing projection as its actual actor, not only as staff. Assertions cover what the user can do, what exists durably and what must never happen. Do not reward tests that mirror internal calls or merely exercise a copied toy model.
- **Use existing seams.** Playwright admin create/list/detail and Base UI behavior tests are UI prior art. CRM-note, contribution-command and workflow-recovery Vitest tests demonstrate boundary isolation. Actual field-policy RLS and donation replay SQL illustrate disposable role/grant and durable-effect checks. Extend these patterns; their current mocked/demo coverage is not Phase 27 proof.
- **Require real auth and storage.** Seed separate synthetic tenants and real staff, missionary and finance identities. Disable demo bypass and placeholder fallback. Missing setup or consumed owner qualification fails the required suite instead of silently skipping. Internal source storage and authorization stay real; substitute only external transport/provider I/O when exercising controlled failure and event order.
- **Prove bypass and races.** Test actual direct role/table/RPC/view paths, effective USING/WITH CHECK and function grants, tenant-aware references, privileged paths and field/egress restrictions. Use separate actual database sessions with deterministic barriers for duplicate admission; list retirement versus use; terms revision versus review; exclusion versus dispatch admission; Keep/manual choice or Auto disable versus transfer; and revocation versus command/result recovery.
- **Prove recovery and time.** Lose responses after commit, repeat semantic jobs, deliver late/out-of-order facts, change policy while work is queued and interrupt partial bulk execution. Verify one effect, exact per-member outcomes, preserved later decisions, source-owned repair and time-zone/date precision including daylight-saving boundaries.
- **Prove composed UX.** Automated axe/keyboard/focus tests supplement manual assistive-technology and intended-user evaluation. Cover mobile/320 CSS-pixel reflow, light/dark contrast, zoom, touch/non-drag alternatives, reduced motion, long Unicode/RTL content, slow network, failures and navigation context. An axe or component-only pass is not a WCAG conformance claim.
- **Prove deployment-shaped operation.** Validate forward/backfill/restore and mixed-version cases on the actually supported Postgres/Supabase release. The inspected CI uses Postgres 15 while local Supabase declares 17; neither is transferable evidence for a different release profile. Measure all Q12 envelope/budget fields under representative skew/concurrency and separately qualify any actual external provider consumed.
- **Keep proof levels honest.** Pure calculation/calendar/validation unit tests remain offline and secret-free. Prototype and dated synthetic evidence stay useful but cannot satisfy runtime, provider, capacity or user-pilot acceptance. Implementation tasks remain unchecked until the mapped evidence exists. This publication runs only documentary validation.

**Existing testing prior art:** [admin workflow smoke](../../../tests/e2e/admin-table-pages-smoke.spec.ts), [Base UI behavior](../../../tests/e2e/base-ui-behavior-qa.spec.ts), [table accessibility](../../../tests/e2e/data-table-accessibility.spec.ts), [CRM notes](../../../tests/unit/packages/api/crm-notes.test.ts), [contribution command helpers](../../../tests/unit/packages/api/admin/contribution-operations-test-helpers.ts), [workflow recovery](../../../tests/unit/packages/api/workflows/donation-saga-recovery.test.ts), [field-policy RLS](../../../supabase/tests/field_policies_rls.sql), [donation replay SQL](../../../tests/integration/supabase/donation-fee-replay-verification.sql), [migration verifier](../../../scripts/verify/supabase-migrations.mjs). The RLS SQL is a useful pattern but its invocation was not found in the inspected CI; wiring it into a required acceptance lane is part of implementation qualification.

## Out of Scope

Feature implementation, production data/provider changes, donor contact, automation activation and the implementation-ticket graph are outside this specification-publication task. The following product additions are also excluded:

- A second donor CRM, writable portfolio store, task engine, financial ledger, file store or general workflow/rules language.
- Mandatory missionary logs, staff-style supervision, quotas, performance ranking or coaching enrollment through shared history.
- Composite donor-worth scores, wealth screening, inferred capacity, AI-generated required briefs or autonomous next-best-action.
- Automatic enrollment from record arrival, automatic stage progression, forced sequential stages or blocking stage guidance.
- Financial posting/charging/commitment creation, receipt issuance, message dispatch or consent inferred from a Request, response, stage, appeal membership or drag.
- General grant management, planned giving, document signing, visit booking, care/application decisions, or a new public/missionary product surface beyond the narrow qualified shared projection.
- Independent finance policy invented by P27. Phase 28 D48–D50 reconciles E7/C-01 through P13/P15/P16; P27 consumes only their qualified adapters and current controls.

## Further Notes

The formal source package is this document plus the seven linked volumes, traceability and exact source manifest. User stories and requirement/acceptance definitions are hand-maintained canonical intent; the OpenSpec behavioral projection and trace index are generated from those sources. Preserve stable IDs when amending. An accepted scoped amendment requires coordinated source and projection updates. Do not edit the generated projection independently.

The existing [glossary](../../../CONTEXT.md), [decision log](../../features/donor-development/grill/phase27-grill-log.md) and [post-D30 synthesis](../../features/donor-development/grill/phase27-post-d30-coverage-synthesis.md) retain the original distinctions and dated evidence. The source manifest records the exact pre-publication artifacts and repository head. The current explicit `/to-spec` invocation supersedes earlier grooming-only reservations for this specification and its publication, not for implementation or release.

Governing architecture includes ADR0001 (Asym CRM ownership), ADR0183 (source-owned work), the specifically named ADR0026 delivery/ADR0027 notification contracts, ADR0206 (immutable posted financial facts), ADR0211 (projection-widening approval), ADR0216 (source-governed donor merge), platform boundaries and existing producer requirements. Numeric ADR collisions are resolved by full title/path in the evidence manifest.

Repository source, selected product judgment, dated third-party research and runtime proof remain distinct. The session's comparative nonprofit/CRM/giving research informed the settled decisions; it does not override governing ownership or prove Core usability. Fresh Supabase changelog/RLS checks during formalization confirm the need to qualify effective grants, invoker views and actual database versions; no new Supabase feature or dependency was adopted. No new donor/staff feedback is claimed.

The [active OpenSpec change](../../../openspec/changes/add-donor-development/proposal.md) records the delivery plan and stays active until implementation is actually accepted. Publication verification records exact issue/part hashes, labels and full readback. Only the publication record may claim the issue was created after that verification succeeds.
