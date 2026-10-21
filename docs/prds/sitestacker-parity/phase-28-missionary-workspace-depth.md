# Phase 28 — Missionary Workspace Depth & Support-Raising CRM

**Specification version:** `phase28-spec-2026-10-18-v1`.
**Status:** Formal synthesis authorized by the founder's `/to-spec` instruction on October 18, 2026. The founder confirmed the existing Playwright journey, canonical API, real PostgreSQL/RLS/concurrency and existing provider-contract testing seams. This specification establishes intended behavior and implementation acceptance; it does not establish implementation, source qualification or activation.

## Problem Statement

A missionary needs one practical place to build and care for a support team inside the sending organization: remember an introduction, prepare an invitation, arrange an appointment, record the actual response, understand promised and received support, follow through and keep supporters informed. The work becomes confusing when the same person is duplicated across personal spreadsheets, organizational CRM records, payment lists, newsletter lists and coaching tools. A task marked Done is not evidence that a donor was contacted; an unpaid scheduled gift is not debt; a donation is not newsletter consent.

Staff must be able to configure a useful workspace without inheriting a particular fundraising methodology or forcing missionaries to report private preparation. Coaches need deliberately shared, limited information rather than general CRM access. Supporters and public readers need clear signup and preference journeys that neither create unwanted accounts nor expose ministry records. These users need trustworthy results during ordinary mistakes, travel, interrupted connectivity, concurrent edits, staff changes and source/provider outages.

The inspected code provides a missionary shell, partner and task views, source API entry points and useful tests. It does not establish the complete Phase 28 contracts. Loaded-row aggregates, legacy missionary/donor ownership, separate task storage, demo-auth tests and unfinished communication/settings screens are implementation evidence to reconcile, not behavior to preserve by default. The permanent solution must reuse Asym's authoritative domains and shared interface, without another CRM, ledger, subscriber master or automation engine.

## Solution

Provide one coherent **Missionary Workspace** within the organization, centered on the current **Ministry Assignment** or other exactly authorized ministry/project context. The ordinary path is: enter the right context, see useful current work, understand its factual reason, perform an authorized action once and see a truthful result. Required source-backed work functions independently of optional AI, coaching, calendar/email connections, workflow products and starting guidance.

Allow restricted-start prospect preparation and deliberate contact-only sharing. Use the existing Party, referral, relationship, interaction, Task, partnership, Request and Appeal owners. Preserve private notes and planning, meaningful prayer/practical/church partnerships and the distinction between a person and work involving that person. Returning workers deliberately resume eligible retained preparation; departure does not grant successors access.

Present goals, commitments, received gifts, recognition, fulfillment and Field Account information as distinct source-backed measures with explicit currency, period, scope and currentness. Native follow-up uses qualified financial facts, exact purpose evidence and one durable effect identity. Compatible work can be handled together without merging gifts or purpose-specific completion. A confirmed missed installment with continued scheduled giving is informational; ordinary follow-up remains deliberate.

Provide complete native newsletter work through the existing authoring and communication owners: draft, approved media/layouts, permitted audience, test, review, authorize, schedule, send or print, understand outcomes and repair the exact failed work. Public readers deliberately join a named newsletter; eligible signed-in readers may reuse their current verified address. Other readers confirm by email within seven elapsed days. Optional connected-account individual email and deliberate managed calendar copies retain their own source and permission boundaries.

Offer voluntary read-only coaching, optional activity targets and check-ins, exact next-step sharing, an organization-curated resource library, an optional starting guide and approved broad-region discovery. Staff can offer, edit or disable these capabilities through the existing organization settings and permissions. Each switch has explicit effects on new work, accepted work, visibility and re-enablement. No general Off switch silently erases accepted duties, consent history or source records.

Use the existing Base UI/base-maia design system, semantic tokens, shared forms/lists/records and navigation. Keep the default daily experience calm and action-oriented. Reveal advanced scope and history when useful; preserve visible labels, mobile layouts, keyboard access, clear empty/error/disabled states and safe recovery. There is no new mandatory onboarding wizard, course, logging quota, donor-value ranking or parallel task list.

**The complete normative package is binding.** Short stories do not replace their full requirements and acceptance outcomes.

| Volume                                                                                     | Scope                                                                                                            |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| [Relationships and working context](phase-28-missionary-workspace-depth/relationships.md)  | Preparation, sharing, corrections, source-owned work, imports, referrals, departure and return                   |
| [Finance and stewardship](phase-28-missionary-workspace-depth/finance-stewardship.md)      | Goals, distinct financial measures, native follow-up, gift reporting, correction policy and campaign attribution |
| [Communications and connections](phase-28-missionary-workspace-depth/communications.md)    | Native signup/newsletters, personal email, appointments/calendar and author-controlled writing help              |
| [Coaching and useful resources](phase-28-missionary-workspace-depth/coaching-resources.md) | Exact voluntary shares, history/duration, targets/check-ins/next steps, library, guide and regional discovery    |
| [Common safeguards and proof](phase-28-missionary-workspace-depth/proof.md)                | Setup/daily journey, current authorization, durability, accessibility, migration, recovery and release proof     |
| [Owner reconciliation](phase-28-missionary-workspace-depth/owner-reconciliation.md)        | Exact domain extensions, superseded clauses and source qualification boundaries                                  |
| [Evidence and research](phase-28-missionary-workspace-depth/evidence.md)                   | Inspected current implementation, tests, official research, tracker state and limits                             |

## User Stories

Every numbered story has one stable requirement and independently observable acceptance outcomes. Shared safeguards apply to each reached command, reader and derivative. Story order groups user jobs; it does not imply a sequential implementation dependency or permission to ignore negative cases.

<!-- BEGIN GENERATED STORIES -->

1. **US28-Q01.** As a missionary, I want to reach useful native work after my organization admits me, so that I can begin without configuring optional features.
   Requirement: REQ28-Q01. Acceptance: AC28-Q01-01, AC28-Q01-02, AC28-Q01-03.

2. **US28-Q02.** As a missionary serving more than one ministry, I want to enter the right authorized context, so that I understand whose work I am viewing and changing.
   Requirement: REQ28-Q02. Acceptance: AC28-Q02-01, AC28-Q02-02, AC28-Q02-03.

3. **US28-Q03.** As a missionary switching contexts, I want my unfinished and accepted work to retain its original meaning, so that nothing is lost, exposed or applied to another ministry.
   Requirement: REQ28-Q03. Acceptance: AC28-Q03-01, AC28-Q03-02, AC28-Q03-03.

4. **US28-Q04.** As a missionary, I want to move from a useful next action to an accurately recorded outcome, so that I can finish everyday work without duplicate entry or invented facts.
   Requirement: REQ28-Q04. Acceptance: AC28-Q04-01, AC28-Q04-02, AC28-Q04-03.

5. **US28-Q05.** As a missionary handling follow-up, I want completion to mean exactly what the work requires, so that a checkbox cannot falsely resolve another source's obligation.
   Requirement: REQ28-Q05. Acceptance: AC28-Q05-01, AC28-Q05-02, AC28-Q05-03.

6. **US28-Q06.** As authorized tenant staff, I want each control to explain what it changes, so that I can configure the workspace without accidentally cancelling work or restoring access.
   Requirement: REQ28-Q06. Acceptance: AC28-Q06-01, AC28-Q06-02, AC28-Q06-03.

7. **US28-Q07.** As a person with several roles, I want each action to use only my current authorized role and subject, so that private work and privileges do not bleed across surfaces.
   Requirement: REQ28-Q07. Acceptance: AC28-Q07-01, AC28-Q07-02, AC28-Q07-03.

8. **US28-Q08.** As a person whose information is held by the organization, I want every view and derivative to preserve the same current audience, so that hiding a field does not merely move its disclosure elsewhere.
   Requirement: REQ28-Q08. Acceptance: AC28-Q08-01, AC28-Q08-02, AC28-Q08-03.

9. **US28-Q09.** As a missionary, I want support information to state what it covers, so that I can plan without mistaking a partial list, forecast or unknown value for confirmed money.
   Requirement: REQ28-Q09. Acceptance: AC28-Q09-01, AC28-Q09-02, AC28-Q09-03.

10. **US28-Q10.** As a missionary or staff member, I want the same action to have the same meaning on every surface, so that boards, lists and shortcuts cannot create contradictory records.
    Requirement: REQ28-Q10. Acceptance: AC28-Q10-01, AC28-Q10-02, AC28-Q10-03.

11. **US28-Q11.** As an organization administrator, I want persisted data and every access path to enforce the same boundaries, so that a valid edit cannot become a forbidden record.
    Requirement: REQ28-Q11. Acceptance: AC28-Q11-01, AC28-Q11-02, AC28-Q11-03.

12. **US28-Q12.** As a user retrying interrupted work, I want my accepted intent to happen once, so that a lost response cannot duplicate follow-up, enrollment or communication.
    Requirement: REQ28-Q12. Acceptance: AC28-Q12-01, AC28-Q12-02, AC28-Q12-03.

13. **US28-Q13.** As a user editing shared work, I want conflicts and corrections to be handled explicitly, so that an old form cannot overwrite newer facts or bypass a current restriction.
    Requirement: REQ28-Q13. Acceptance: AC28-Q13-01, AC28-Q13-02, AC28-Q13-03.

14. **US28-Q14.** As a user with an unreliable connection, I want to know what actually succeeded, so that I can recover only missing work without repeating an accepted action.
    Requirement: REQ28-Q14. Acceptance: AC28-Q14-01, AC28-Q14-02, AC28-Q14-03.

15. **US28-Q15.** As a missionary working across currencies and timezones, I want amounts and deadlines to retain their source meaning, so that display choices cannot change financial facts or access windows.
    Requirement: REQ28-Q15. Acceptance: AC28-Q15-01, AC28-Q15-02, AC28-Q15-03.

16. **US28-Q16.** As a missionary leaving or returning, I want each kind of work to follow its own access and retention rule, so that private preparation stays private while lawful obligations are not lost.
    Requirement: REQ28-Q16. Acceptance: AC28-Q16-01, AC28-Q16-02, AC28-Q16-03.

17. **US28-Q17.** As a user on a phone or using assistive technology, I want the complete workflow to remain clear and operable, so that I can finish work without a desktop-only or pointer-only path.
    Requirement: REQ28-Q17. Acceptance: AC28-Q17-01, AC28-Q17-02, AC28-Q17-03.

18. **US28-Q18.** As a missionary or reader in varied field conditions, I want understandable localized information and honest interrupted-work recovery, so that connectivity or unfamiliar formatting does not cause mistakes.
    Requirement: REQ28-Q18. Acceptance: AC28-Q18-01, AC28-Q18-02, AC28-Q18-03.

19. **US28-Q19.** As a tenant administrator, I want unavailable capabilities to identify the actual repair path, so that a setting or roadmap label cannot promise work the system cannot perform.
    Requirement: REQ28-Q19. Acceptance: AC28-Q19-01, AC28-Q19-02, AC28-Q19-03.

20. **US28-Q20.** As staff responsible for existing records, I want migration to preserve lawful history and unfinished work, so that the new workspace does not fabricate facts or lose obligations.
    Requirement: REQ28-Q20. Acceptance: AC28-Q20-01, AC28-Q20-02, AC28-Q20-03.

21. **US28-Q21.** As an operations owner, I want to enable and contain affected capabilities safely, so that a release problem cannot corrupt accepted work or stop unrelated ministry work.
    Requirement: REQ28-Q21. Acceptance: AC28-Q21-01, AC28-Q21-02, AC28-Q21-03.

22. **US28-Q22.** As an organization administrator, I want backup recovery to respect later restrictions and completed effects, so that recovery cannot re-expose data or repeat work.
    Requirement: REQ28-Q22. Acceptance: AC28-Q22-01, AC28-Q22-02, AC28-Q22-03.

23. **US28-Q23.** As an operator resolving a user problem, I want trustworthy source history and useful diagnostics, so that I can recover the accepted outcome without private-data exposure or database repair.
    Requirement: REQ28-Q23. Acceptance: AC28-Q23-01, AC28-Q23-02, AC28-Q23-03.

24. **US28-Q24.** As a maintainer, I want tests at stable observable boundaries, so that they prove the user's whole job without freezing internal implementation details.
    Requirement: REQ28-Q24. Acceptance: AC28-Q24-01, AC28-Q24-02, AC28-Q24-03.

25. **US28-Q25.** As a security and source owner, I want proof against the actual authorization and durable-effect paths, so that realistic races and provider failures cannot hide behind mocks.
    Requirement: REQ28-Q25. Acceptance: AC28-Q25-01, AC28-Q25-02, AC28-Q25-03, AC28-Q25-04.

26. **US28-Q26.** As staff in a growing organization, I want the workspace to remain accurate and responsive as records and concurrency increase, so that a display limit cannot become silent data loss.
    Requirement: REQ28-Q26. Acceptance: AC28-Q26-01, AC28-Q26-02, AC28-Q26-03.

27. **US28-Q27.** As the product owner, I want complete journeys demonstrated with representative users and traced to their decisions, so that completion means usable, qualified behavior rather than a collection of screens.
    Requirement: REQ28-Q27. Acceptance: AC28-Q27-01, AC28-Q27-02, AC28-Q27-03.

28. **US28-R01.** As a missionary, I want to enter the correct organization and ministry context, so that my work affects the intended people and records.
    Requirement: REQ28-R01. Acceptance: AC28-R01-01, AC28-R01-02, AC28-R01-03, AC28-R01-04.

29. **US28-R02.** As a missionary, I want to save early prospect preparation with incomplete knowledge, so that I can prepare without prematurely sharing a person's details.
    Requirement: REQ28-R02. Acceptance: AC28-R02-01, AC28-R02-02, AC28-R02-03, AC28-R02-04.

30. **US28-R03.** As a missionary, I want safe identity matching and clear unresolved results, so that saving preparation neither duplicates a relationship nor exposes another person's protected record.
    Requirement: REQ28-R03. Acceptance: AC28-R03-01, AC28-R03-02, AC28-R03-03.

31. **US28-R04.** As a missionary, I want to understand who can see my preparation, so that an ordinary Save never surprises me with wider disclosure.
    Requirement: REQ28-R04. Acceptance: AC28-R04-01, AC28-R04-02, AC28-R04-03.

32. **US28-R05.** As a missionary, I want to make eligible contact facts available to staff deliberately, so that the organization can use its ordinary CRM without receiving my private preparation.
    Requirement: REQ28-R05. Acceptance: AC28-R05-01, AC28-R05-02, AC28-R05-03.

33. **US28-R06.** As a missionary, I want to optionally tell selected staff that a contact is available, so that attention is directed without changing access or assigning work.
    Requirement: REQ28-R06. Acceptance: AC28-R06-01, AC28-R06-02, AC28-R06-03, AC28-R06-04.

34. **US28-R07.** As a missionary, I want accepted sharing and later corrections to have clear history, so that recovery does not promise an impossible unshare or recall.
    Requirement: REQ28-R07. Acceptance: AC28-R07-01, AC28-R07-02, AC28-R07-03.

35. **US28-R08.** As an authorized tenant administrator, I want to control missionary contact correction through existing permissions, so that our organization can enable or withhold eligible edits without another permission system.
    Requirement: REQ28-R08. Acceptance: AC28-R08-01, AC28-R08-02, AC28-R08-03.

36. **US28-R09.** As a missionary, I want to correct only eligible shared contact fields, so that I can keep useful information accurate without overwriting other facts.
    Requirement: REQ28-R09. Acceptance: AC28-R09-01, AC28-R09-02, AC28-R09-03, AC28-R09-04.

37. **US28-R10.** As a missionary, I want contact changes and interrupted editing to respect each field's actual rules, so that an address correction does not become a consent or account change.
    Requirement: REQ28-R10. Acceptance: AC28-R10-01, AC28-R10-02, AC28-R10-03.

38. **US28-R11.** As a missionary, I want to archive unused still-unshared preparation, so that my active prospect list stays useful without deleting the person or independent work.
    Requirement: REQ28-R11. Acceptance: AC28-R11-01, AC28-R11-02, AC28-R11-03.

39. **US28-R12.** As a missionary, I want to return eligible archived preparation to active work, so that setting something aside is reversible while current rules permit.
    Requirement: REQ28-R12. Acceptance: AC28-R12-01, AC28-R12-02, AC28-R12-03.

40. **US28-R13.** As a missionary or responsible staff member, I want departure to end the right access without exposing private work, so that genuine organizational duties continue honestly.
    Requirement: REQ28-R13. Acceptance: AC28-R13-01, AC28-R13-02, AC28-R13-03.

41. **US28-R14.** As an authorized tenant administrator, I want one finite post-departure preparation period, so that return needs are balanced with the organization's qualified privacy rules.
    Requirement: REQ28-R14. Acceptance: AC28-R14-01, AC28-R14-02, AC28-R14-03, AC28-R14-04.

42. **US28-R15.** As a returning missionary, I want the original departure deadline applied accurately, so that delayed events and policy edits cannot arbitrarily preserve or erase my preparation.
    Requirement: REQ28-R15. Acceptance: AC28-R15-01, AC28-R15-02, AC28-R15-03, AC28-R15-04, AC28-R15-05.

43. **US28-R16.** As a returning missionary, I want to find my eligible earlier preparation when permitted, so that I can decide what is useful without automatically restoring all old work.
    Requirement: REQ28-R16. Acceptance: AC28-R16-01, AC28-R16-02, AC28-R16-03.

44. **US28-R17.** As a returning missionary, I want to resume selected preparation deliberately, so that only useful retained work becomes current work again.
    Requirement: REQ28-R17. Acceptance: AC28-R17-01, AC28-R17-02, AC28-R17-03, AC28-R17-04.

45. **US28-R18.** As a missionary and records operator, I want expiry, holds and disposal to be distinct, so that retained evidence does not become renewed ordinary access.
    Requirement: REQ28-R18. Acceptance: AC28-R18-01, AC28-R18-02, AC28-R18-03, AC28-R18-04.

46. **US28-R19.** As a permitted missionary, I want to import a supported contact file into restricted preparation, so that I can start work without manually recreating every eligible contact assertion.
    Requirement: REQ28-R19. Acceptance: AC28-R19-01, AC28-R19-02, AC28-R19-03.

47. **US28-R20.** As a missionary, I want a trustworthy mapping preview, so that only the displayed eligible data is accepted.
    Requirement: REQ28-R20. Acceptance: AC28-R20-01, AC28-R20-02, AC28-R20-03, AC28-R20-04.

48. **US28-R21.** As a missionary, I want repeated intake to recognize prior accepted work safely, so that recovery does not duplicate contacts or overwrite native corrections.
    Requirement: REQ28-R21. Acceptance: AC28-R21-01, AC28-R21-02, AC28-R21-03, AC28-R21-04.

49. **US28-R22.** As a missionary, I want imported contact restrictions handled accurately, so that a file cannot silently make a person contactable.
    Requirement: REQ28-R22. Acceptance: AC28-R22-01, AC28-R22-02, AC28-R22-03.

50. **US28-R23.** As a missionary, I want truthful per-row results and resumable progress, so that weak connections and partial failures do not force me to repeat accepted work.
    Requirement: REQ28-R23. Acceptance: AC28-R23-01, AC28-R23-02, AC28-R23-03, AC28-R23-04.

51. **US28-R24.** As a missionary, I want to cancel or discard an import with clear consequences, so that stopping it does not erase already accepted contacts.
    Requirement: REQ28-R24. Acceptance: AC28-R24-01, AC28-R24-02, AC28-R24-03, AC28-R24-04.

52. **US28-R25.** As a missionary, I want supported file limits and format problems explained before acceptance, so that the importer is predictable and does not execute spreadsheet content.
    Requirement: REQ28-R25. Acceptance: AC28-R25-01, AC28-R25-02, AC28-R25-03, AC28-R25-04, AC28-R25-05.

53. **US28-R26.** As a missionary and records operator, I want private import custody with a clear working deadline, so that files and errors do not become an indefinite second contact database.
    Requirement: REQ28-R26. Acceptance: AC28-R26-01, AC28-R26-02, AC28-R26-03, AC28-R26-04.

54. **US28-R27.** As a missionary, I want to record when a referral was actually given to me, so that late entry does not pretend I received a fresh introduction today.
    Requirement: REQ28-R27. Acceptance: AC28-R27-01, AC28-R27-02, AC28-R27-03, AC28-R27-04.

55. **US28-R28.** As a missionary, I want the new referral's last follow-up day shown clearly, so that I know the real window without selecting another date.
    Requirement: REQ28-R28. Acceptance: AC28-R28-01, AC28-R28-02, AC28-R28-03, AC28-R28-04.

56. **US28-R29.** As a missionary, I want a late or incomplete referral recorded honestly, so that useful history is not rejected or silently renewed.
    Requirement: REQ28-R29. Acceptance: AC28-R29-01, AC28-R29-02, AC28-R29-03, AC28-R29-04.

57. **US28-R30.** As authorized tenant staff, I want independent New and Continued referral periods in one place, so that our organization can configure its work without asking missionaries to administer dates.
    Requirement: REQ28-R30. Acceptance: AC28-R30-01, AC28-R30-02, AC28-R30-03, AC28-R30-04.

58. **US28-R31.** As a missionary, I want limited expired-referral history in my ordinary referral view, so that I recognize earlier work without assuming I may still access its private details.
    Requirement: REQ28-R31. Acceptance: AC28-R31-01, AC28-R31-02, AC28-R31-03, AC28-R31-04.

59. **US28-R32.** As a missionary, I want expired history to remain read-only and purpose-limited, so that opening an old referral does not renew it or erase independent access.
    Requirement: REQ28-R32. Acceptance: AC28-R32-01, AC28-R32-02, AC28-R32-03, AC28-R32-04.

60. **US28-R33.** As authorized tenant staff, I want one control for missionary continuation, so that self-service is optional without interrupting authorized staff work.
    Requirement: REQ28-R33. Acceptance: AC28-R33-01, AC28-R33-02, AC28-R33-03, AC28-R33-04.

61. **US28-R34.** As an authorized missionary or staff member, I want to continue one eligible expired referral in one action, so that current work resumes on the same truthful lineage.
    Requirement: REQ28-R34. Acceptance: AC28-R34-01, AC28-R34-02, AC28-R34-03, AC28-R34-04.

62. **US28-R35.** As a missionary, I want safe recovery of a continuation outcome, so that retrying cannot open a second window or conceal a later expiry.
    Requirement: REQ28-R35. Acceptance: AC28-R35-01, AC28-R35-02, AC28-R35-03, AC28-R35-04.

63. **US28-R36.** As an independently authorized source corrector, I want to repair a mistaken referral date or expiry with evidence, so that correction restores truth without counterfeit renewal.
    Requirement: REQ28-R36. Acceptance: AC28-R36-01, AC28-R36-02, AC28-R36-03, AC28-R36-04.

64. **US28-R37.** As a missionary, I want referrals to remain distinct from contact permission and other work, so that expiry or continuation never creates an unintended ministry action.
    Requirement: REQ28-R37. Acceptance: AC28-R37-01, AC28-R37-02, AC28-R37-03, AC28-R37-04.

65. **US28-R38.** As authorized tenant staff, I want to author one optional starting guide, so that our organization can offer useful suggestions without maintaining a course platform.
    Requirement: REQ28-R38. Acceptance: AC28-R38-01, AC28-R38-02, AC28-R38-03, AC28-R38-04.

66. **US28-R39.** As a missionary, I want to use, skip and revisit the guide freely, so that suggestions help my work without measuring or controlling it.
    Requirement: REQ28-R39. Acceptance: AC28-R39-01, AC28-R39-02, AC28-R39-03, AC28-R39-04.

67. **US28-R40.** As authorized tenant staff, I want to disable and later re-offer the guide deliberately, so that changes do not affect independent resources or secretly undo my choice.
    Requirement: REQ28-R40. Acceptance: AC28-R40-01, AC28-R40-02, AC28-R40-03, AC28-R40-04.

68. **US28-R41.** As a missionary and tenant administrator, I want contact work to remain native in this release, so that useful ordinary work does not depend on another fundraising product.
    Requirement: REQ28-R41. Acceptance: AC28-R41-01, AC28-R41-02, AC28-R41-03, AC28-R41-04.

69. **US28-R42.** As a missionary, I want a connected but truthful daily journey, so that I can progress from preparation or referral to ordinary work without entering the same fact twice.
    Requirement: REQ28-R42. Acceptance: AC28-R42-01, AC28-R42-02, AC28-R42-03, AC28-R42-04.

70. **US28-R43.** As an accountable source operator, I want bounded diagnostics and explicit containment triggers, so that privacy, integrity and usability failures are repaired without duplicate work or direct data alteration.
    Requirement: REQ28-R43. Acceptance: AC28-R43-01, AC28-R43-02, AC28-R43-03, AC28-R43-04.

71. **US28-F01.** As a missionary, I want to understand my permitted support information without confusing money, commitments or relationships, so that I can decide what to do confidently.
    Requirement: REQ28-F01. Acceptance: AC28-F01-01, AC28-F01-02, AC28-F01-03.

72. **US28-F02.** As a missionary, I want continuing financial and nonfinancial relationships to stay available while independently authorized, so that an older gift does not make a person disappear from my work.
    Requirement: REQ28-F02. Acceptance: AC28-F02-01, AC28-F02-02, AC28-F02-03.

73. **US28-F03.** As a missionary, I want financial information to reflect my actual authorized scope, so that a shared donor or designation never exposes another ministry's information.
    Requirement: REQ28-F03. Acceptance: AC28-F03-01, AC28-F03-02, AC28-F03-03.

74. **US28-F04.** As a missionary, I want unavailable financial conclusions to be explained without blocking unrelated work, so that I can continue safely.
    Requirement: REQ28-F04. Acceptance: AC28-F04-01, AC28-F04-02, AC28-F04-03.

75. **US28-F05.** As authorized staff, I want to choose who manages a support goal, so that the organization can delegate editing without changing finance or publication permissions.
    Requirement: REQ28-F05. Acceptance: AC28-F05-01, AC28-F05-02, AC28-F05-03.

76. **US28-F06.** As an authorized goal editor, I want a clear goal and its history, so that changes are meaningful and do not create competing targets.
    Requirement: REQ28-F06. Acceptance: AC28-F06-01, AC28-F06-02, AC28-F06-03.

77. **US28-F07.** As an authorized goal editor, I want a single reliable Save and understandable recovery, so that a slow connection cannot overwrite someone else's change or create duplicate history.
    Requirement: REQ28-F07. Acceptance: AC28-F07-01, AC28-F07-02, AC28-F07-03.

78. **US28-F08.** As a missionary, I want support progress with clear meaning, so that I can distinguish what is planned, committed and received.
    Requirement: REQ28-F08. Acceptance: AC28-F08-01, AC28-F08-02, AC28-F08-03.

79. **US28-F09.** As an authorized goal editor, I want to copy a compatible approved Support Plan amount when helpful, so that I do not retype it or create a second planning process.
    Requirement: REQ28-F09. Acceptance: AC28-F09-01, AC28-F09-02.

80. **US28-F10.** As a missionary, I want to know where my goal appears, so that an internal edit does not unexpectedly publish private planning information.
    Requirement: REQ28-F10. Acceptance: AC28-F10-01, AC28-F10-02, AC28-F10-03.

81. **US28-F11.** As a missionary, I want a first-support follow-up when someone first gives qualifying recorded support to my ministry, so that I can respond without treating their support elsewhere as disqualifying.
    Requirement: REQ28-F11. Acceptance: AC28-F11-01, AC28-F11-02, AC28-F11-03.

82. **US28-F12.** As a missionary, I want first-support work to survive retries and truthful corrections without repeating completed work, so that my queue is reliable.
    Requirement: REQ28-F12. Acceptance: AC28-F12-01, AC28-F12-02, AC28-F12-03.

83. **US28-F13.** As a missionary, I want to finish or decline personal follow-up without filing a report, so that simple stewardship remains simple.
    Requirement: REQ28-F13. Acceptance: AC28-F13-01, AC28-F13-02, AC28-F13-03.

84. **US28-F14.** As a missionary, I want each special-gift follow-up to explain why it exists, so that I can act without guessing what an algorithm inferred.
    Requirement: REQ28-F14. Acceptance: AC28-F14-01, AC28-F14-02.

85. **US28-F15.** As a missionary, I want compatible special gifts from one supporter together, so that I can handle them once without losing their evidence.
    Requirement: REQ28-F15. Acceptance: AC28-F15-01, AC28-F15-02, AC28-F15-03.

86. **US28-F16.** As a missionary, I want Done to cover exactly the gifts I reviewed, so that a new arrival or hidden item is never silently handled.
    Requirement: REQ28-F16. Acceptance: AC28-F16-01, AC28-F16-02, AC28-F16-03.

87. **US28-F17.** As a missionary, I want corrected financial reasons and mistaken task dispositions handled clearly, so that valid remaining work is not lost or duplicated.
    Requirement: REQ28-F17. Acceptance: AC28-F17-01, AC28-F17-02, AC28-F17-03.

88. **US28-F18.** As an authorized missionary or staff member, I want to record an explicit additional-support instruction in one action, so that an eligible received gift produces understandable follow-up.
    Requirement: REQ28-F18. Acceptance: AC28-F18-01, AC28-F18-02, AC28-F18-03.

89. **US28-F19.** As an authorized purpose recorder, I want partial-gift instructions represented honestly, so that a purpose does not accidentally apply to the whole gift.
    Requirement: REQ28-F19. Acceptance: AC28-F19-01, AC28-F19-02.

90. **US28-F20.** As authorized staff, I want to offer follow-up for gifts to a specific one-time need, so that the organization can support that workflow only when useful.
    Requirement: REQ28-F20. Acceptance: AC28-F20-01, AC28-F20-02, AC28-F20-03.

91. **US28-F21.** As authorized staff, I want turning one-time-need follow-up Off to have a predictable effect, so that settings do not erase accepted work or replay old gifts.
    Requirement: REQ28-F21. Acceptance: AC28-F21-01, AC28-F21-02, AC28-F21-03.

92. **US28-F22.** As authorized staff, I want a simple optional amount rule, so that gifts meeting the organization's threshold can receive follow-up without guessing from previous giving.
    Requirement: REQ28-F22. Acceptance: AC28-F22-01, AC28-F22-02, AC28-F22-03.

93. **US28-F23.** As a missionary, I want amount-based work to retain the rule that actually admitted it, so that later settings changes do not rewrite my queue or create historical work.
    Requirement: REQ28-F23. Acceptance: AC28-F23-01, AC28-F23-02, AC28-F23-03.

94. **US28-F24.** As a missionary, I want confirmed support above a commitment to have a factual reason, so that even a small real excess is handled consistently.
    Requirement: REQ28-F24. Acceptance: AC28-F24-01, AC28-F24-02, AC28-F24-03.

95. **US28-F25.** As a finance source owner, I want excess certificates to conserve real support across ordered gifts and corrections, so that personal follow-up never rests on a duplicated or retroactively invented amount.
    Requirement: REQ28-F25. Acceptance: AC28-F25-01, AC28-F25-02, AC28-F25-03.

96. **US28-F26.** As a missionary, I want a fulfilled-commitment purpose to represent the actual completion of the promise, so that I do not congratulate a supporter for a partial installment or administrative release.
    Requirement: REQ28-F26. Acceptance: AC28-F26-01, AC28-F26-02, AC28-F26-03.

97. **US28-F27.** As authorized staff, I want one organization setting for combining compatible follow-ups, so that missionaries can handle related purposes together without losing either obligation.
    Requirement: REQ28-F27. Acceptance: AC28-F27-01, AC28-F27-02, AC28-F27-03.

98. **US28-F28.** As a missionary, I want one combined action to have precise results even when policies or gifts change, so that I can trust what remains.
    Requirement: REQ28-F28. Acceptance: AC28-F28-01, AC28-F28-02, AC28-F28-03.

99. **US28-F29.** As authorized staff, I want to enable missionary reports of actual offline gifts only when appropriate, so that ordinary finance intake stays simple for organizations that do not need this doorway.
    Requirement: REQ28-F29. Acceptance: AC28-F29-01, AC28-F29-02, AC28-F29-03.

100. **US28-F30.** As an authorized missionary, I want a short form for a gift I actually received, so that I can hand known facts to finance without guessing.
     Requirement: REQ28-F30. Acceptance: AC28-F30-01, AC28-F30-02, AC28-F30-03.

101. **US28-F31.** As finance staff, I want to continue the same reported item, so that Maya does not re-enter it and recording money does not hide unfinished physical handling.
     Requirement: REQ28-F31. Acceptance: AC28-F31-01, AC28-F31-02, AC28-F31-03.

102. **US28-F32.** As a missionary, I want clear report status and safe recovery, so that a disabled setting or interrupted connection does not lose an accepted handoff or create it twice.
     Requirement: REQ28-F32. Acceptance: AC28-F32-01, AC28-F32-02, AC28-F32-03.

103. **US28-F33.** As a missionary, I want to see a confirmed missed gift and the next scheduled gift, so that I can understand the situation and choose whether personal follow-up would help.
     Requirement: REQ28-F33. Acceptance: AC28-F33-01, AC28-F33-02, AC28-F33-03.

104. **US28-F34.** As authorized staff, I want to control new informational missed-gift notices, so that attention fits the organization without suppressing financial facts.
     Requirement: REQ28-F34. Acceptance: AC28-F34-01, AC28-F34-02, AC28-F34-03.

105. **US28-F35.** As authorized finance staff, I want posted-gift corrections to use the organization's approval policy, so that a small team can work simply while stronger required controls remain intact.
     Requirement: REQ28-F35. Acceptance: AC28-F35-01, AC28-F35-02, AC28-F35-03.

106. **US28-F36.** As finance staff, I want a reviewed correction to respect current policy and exact source facts when applied, so that waiting or retrying cannot bypass a changed rule or alter the wrong gift.
     Requirement: REQ28-F36. Acceptance: AC28-F36-01, AC28-F36-02, AC28-F36-03.

107. **US28-F37.** As finance staff, I want source-code campaign changes to affect future attribution without rewriting earlier gifts, so that campaign reporting remains explainable.
     Requirement: REQ28-F37. Acceptance: AC28-F37-01, AC28-F37-02, AC28-F37-03.

108. **US28-F38.** As authorized finance staff, I want to correct a gift's campaign without falsifying its source code, so that a real attribution mistake can be repaired permanently.
     Requirement: REQ28-F38. Acceptance: AC28-F38-01, AC28-F38-02, AC28-F38-03.

109. **US28-F39.** As finance staff, I want recurring installments to retain their accepted origin and independently recorded gifts to retain theirs, so that matching fulfillment never rewrites why a gift was given.
     Requirement: REQ28-F39. Acceptance: AC28-F39-01, AC28-F39-02, AC28-F39-03.

110. **US28-F40.** As finance staff, I want campaign and subtree totals with a clear time basis, so that structural changes are useful without rewriting closed history or double-counting gifts.
     Requirement: REQ28-F40. Acceptance: AC28-F40-01, AC28-F40-02, AC28-F40-03.

111. **US28-F41.** As a tenant administrator, I want every source and alternate entry path to enforce the same scope and authority, so that a permitted update cannot turn a safe record into an unauthorized one.
     Requirement: REQ28-F41. Acceptance: AC28-F41-01, AC28-F41-02, AC28-F41-03.

112. **US28-F42.** As a missionary or staff operator, I want accepted actions to remain recoverable after a failure, so that fixing the display never repeats money or personal work.
     Requirement: REQ28-F42. Acceptance: AC28-F42-01, AC28-F42-02, AC28-F42-03.

113. **US28-F43.** As a missionary using a phone or assistive technology, I want compact understandable support actions and statuses, so that I can work reliably with limited attention or connectivity.
     Requirement: REQ28-F43. Acceptance: AC28-F43-01, AC28-F43-02, AC28-F43-03.

114. **US28-F44.** As an operations owner, I want explicit activation evidence and bounded recovery, so that incomplete legacy behavior cannot masquerade as a reliable financial workspace.
     Requirement: REQ28-F44. Acceptance: AC28-F44-01, AC28-F44-02, AC28-F44-03.

115. **US28-M01.** As an authorized missionary, I want to show or hide native newsletter signup on my permitted Page, so that I control its public invitation without changing existing subscribers.
     Requirement: REQ28-M01. Acceptance: AC28-M01-01, AC28-M01-02, AC28-M01-03.

116. **US28-M02.** As an authorized organization administrator, I want simple independent signup controls, so that hiding a Page and disabling admissions have predictable effects.
     Requirement: REQ28-M02. Acceptance: AC28-M02-01, AC28-M02-02, AC28-M02-03.

117. **US28-M03.** As a public reader, I want a short newsletter signup without donating or creating an account, so that I can request that newsletter directly.
     Requirement: REQ28-M03. Acceptance: AC28-M03-01, AC28-M03-02, AC28-M03-03.

118. **US28-M04.** As a signed-in reader, I want one deliberate Join using my displayed verified account email, so that I need not repeat an already qualified mailbox proof.
     Requirement: REQ28-M04. Acceptance: AC28-M04-01, AC28-M04-02, AC28-M04-03.

119. **US28-M05.** As a reader, I want an honest fallback when my account proof is unsuitable, so that I can still join without accidentally changing my account.
     Requirement: REQ28-M05. Acceptance: AC28-M05-01, AC28-M05-02, AC28-M05-03.

120. **US28-M06.** As a reader, I want an identical active signup to stay unchanged and a deliberate rejoin to be simple, so that repeated actions do not duplicate or revive consent.
     Requirement: REQ28-M06. Acceptance: AC28-M06-01, AC28-M06-02, AC28-M06-03.

121. **US28-M07.** As a reader needing confirmation, I want to confirm the exact newsletter/address without signing in, so that a forwarded/scanned email cannot silently enroll me.
     Requirement: REQ28-M07. Acceptance: AC28-M07-01, AC28-M07-02, AC28-M07-03.

122. **US28-M08.** As a reader whose signup was durably accepted, I want to finish even after the Page invitation is hidden, so that normal Page maintenance does not cancel my request.
     Requirement: REQ28-M08. Acceptance: AC28-M08-01, AC28-M08-02, AC28-M08-03.

123. **US28-M09.** As a reader needing confirmation, I want one unambiguous deadline, so that I know when I must finish and how to start again if it expires.
     Requirement: REQ28-M09. Acceptance: AC28-M09-01, AC28-M09-02, AC28-M09-03.

124. **US28-M10.** As a reader, I want interrupted confirmation and permitted resends to recover my accepted request, so that poor connectivity does not create duplicate effects.
     Requirement: REQ28-M10. Acceptance: AC28-M10-01, AC28-M10-02, AC28-M10-03.

125. **US28-M11.** As a subscriber, I want an accessible exact-newsletter unsubscribe path, so that withdrawal is effective without navigating account or staff workflows.
     Requirement: REQ28-M11. Acceptance: AC28-M11-01, AC28-M11-02, AC28-M11-03.

126. **US28-M12.** As a reader, I want signup to reveal no unrelated identity or membership, so that my interest does not become staff prospect data or access to other records.
     Requirement: REQ28-M12. Acceptance: AC28-M12-01, AC28-M12-02, AC28-M12-03, AC28-M12-04.

127. **US28-M13.** As a missionary, I want one integrated Draft → Review → Send/Schedule journey, so that native newsletters work without another app or a staff admin role.
     Requirement: REQ28-M13. Acceptance: AC28-M13-01, AC28-M13-02, AC28-M13-03.

128. **US28-M14.** As an author, I want to reuse approved stories, images and video appropriately, so that newsletters require less duplicate work without widening disclosure.
     Requirement: REQ28-M14. Acceptance: AC28-M14-01, AC28-M14-02, AC28-M14-03.

129. **US28-M15.** As a missionary, I want understandable recipients and exclusions, so that I know who this issue may reach without seeing forbidden identities.
     Requirement: REQ28-M15. Acceptance: AC28-M15-01, AC28-M15-02, AC28-M15-03.

130. **US28-M16.** As an author, I want accurate desktop/mobile preview and optional real tests, so that I can assess presentation without sending the issue accidentally.
     Requirement: REQ28-M16. Acceptance: AC28-M16-01, AC28-M16-02, AC28-M16-03.

131. **US28-M17.** As an authorized missionary, I want deliberate control over each issue's send, so that saving, publishing, signup or assistance never sends on my behalf.
     Requirement: REQ28-M17. Acceptance: AC28-M17-01, AC28-M17-02, AC28-M17-03.

132. **US28-M18.** As an author, I want precise send/stop/recovery results, so that I do not repeat mail because a provider response was late or incomplete.
     Requirement: REQ28-M18. Acceptance: AC28-M18-01, AC28-M18-02, AC28-M18-03.

133. **US28-M19.** As a recipient, I want each communication preference to mean what it says, so that joining or leaving a newsletter does not change unrelated reading/mail.
     Requirement: REQ28-M19. Acceptance: AC28-M19-01, AC28-M19-02, AC28-M19-03.

134. **US28-M20.** As a newsletter reader, I want a clear, working reply path, so that I can respond without being granted unrelated access or exposing a private worker address.
     Requirement: REQ28-M20. Acceptance: AC28-M20-01, AC28-M20-02, AC28-M20-03.

135. **US28-M21.** As a missionary, I want accurate print renditions, recipient lists and labels, so that supporters choosing physical mail can receive the same authored issue.
     Requirement: REQ28-M21. Acceptance: AC28-M21-01, AC28-M21-02, AC28-M21-03.

136. **US28-M22.** As a missionary, I want to schedule/reschedule/cancel an eligible appointment in Asym, so that daily work remains usable without a connected calendar.
     Requirement: REQ28-M22. Acceptance: AC28-M22-01, AC28-M22-02, AC28-M22-03.

137. **US28-M23.** As a missionary, I want to add one chosen appointment to my exact connected calendar, so that it appears where I plan without exporting my supporter data.
     Requirement: REQ28-M23. Acceptance: AC28-M23-01, AC28-M23-02, AC28-M23-03.

138. **US28-M24.** As a missionary, I want reschedules and cancellations to update my selected calendar copy, so that Asym remains the appointment authority.
     Requirement: REQ28-M24. Acceptance: AC28-M24-01, AC28-M24-02, AC28-M24-03.

139. **US28-M25.** As a missionary, I want recovery to find my existing copy, so that reconnecting or retrying does not create a duplicate appointment.
     Requirement: REQ28-M25. Acceptance: AC28-M25-01, AC28-M25-02, AC28-M25-03.

140. **US28-M26.** As a missionary, I want predictable exit choices, so that stopping updates does not accidentally cancel an appointment or claim remote deletion.
     Requirement: REQ28-M26. Acceptance: AC28-M26-01, AC28-M26-02, AC28-M26-03.

141. **US28-M27.** As a missionary, I want to connect my own supported sender when permitted, so that I can send an individual follow-up without leaving Asym.
     Requirement: REQ28-M27. Acceptance: AC28-M27-01, AC28-M27-02, AC28-M27-03.

142. **US28-M28.** As a missionary, I want a private useful draft for one eligible contact, so that I can send a follow-up without publishing private correspondence to staff.
     Requirement: REQ28-M28. Acceptance: AC28-M28-01, AC28-M28-02, AC28-M28-03, AC28-M28-04.

143. **US28-M29.** As a missionary, I want one Send to authorize exactly my reviewed message, so that double clicks or stale tabs cannot send different or duplicate content.
     Requirement: REQ28-M29. Acceptance: AC28-M29-01, AC28-M29-02, AC28-M29-03.

144. **US28-M30.** As a sender, I want honest outcomes and useful next actions, so that I do not send twice because Asym lost a provider response.
     Requirement: REQ28-M30. Acceptance: AC28-M30-01, AC28-M30-02, AC28-M30-03.

145. **US28-M31.** As a missionary, I want my sending fact recorded without a second manual entry, so that private message content does not become CRM or coach material.
     Requirement: REQ28-M31. Acceptance: AC28-M31-01, AC28-M31-02, AC28-M31-03.

146. **US28-M32.** As a connected user, I want to distinguish stopping Asym mail from removing provider permissions, so that I understand effects on my calendar connection.
     Requirement: REQ28-M32. Acceptance: AC28-M32-01, AC28-M32-02, AC28-M32-03.

147. **US28-M33.** As an authorized organization administrator, I want optional newsletter writing help with my provider and finite allowance, so that its data and cost are controlled.
     Requirement: REQ28-M33. Acceptance: AC28-M33-01, AC28-M33-02, AC28-M33-03.

148. **US28-M34.** As a missionary, I want manual newsletter work complete and a personal Off choice, so that AI is useful without being mandatory or monitoring my writing.
     Requirement: REQ28-M34. Acceptance: AC28-M34-01, AC28-M34-02, AC28-M34-03.

149. **US28-M35.** As an author, I want spelling/grammar, rephrase, simplify, shorten, lengthen or make-more-compelling help on my selected prose, so that the result remains mine.
     Requirement: REQ28-M35. Acceptance: AC28-M35-01, AC28-M35-02, AC28-M35-03, AC28-M35-04.

150. **US28-M36.** As an author, I want the helper to leave links, personalization and required newsletter structure intact, so that rewriting cannot alter destinations or consent.
     Requirement: REQ28-M36. Acceptance: AC28-M36-01, AC28-M36-02, AC28-M36-03.

151. **US28-M37.** As an author, I want original and complete proposed wording side by side, so that I decide whether the change preserves my facts, voice and meaning.
     Requirement: REQ28-M37. Acceptance: AC28-M37-01, AC28-M37-02, AC28-M37-03.

152. **US28-M38.** As an administrator, I want conservative atomic usage admission, so that concurrent requests cannot exceed the finite certified allowance unnoticed.
     Requirement: REQ28-M38. Acceptance: AC28-M38-01, AC28-M38-02, AC28-M38-03.

153. **US28-M39.** As an author, I want truthful failure/cancel/retry states, so that an uncertain model response neither charges twice silently nor replaces newer work.
     Requirement: REQ28-M39. Acceptance: AC28-M39-01, AC28-M39-02, AC28-M39-03.

154. **US28-M40.** As an author, I want generated suggestions accessible only for their editing purpose, so that discarded drafts do not become an AI archive.
     Requirement: REQ28-M40. Acceptance: AC28-M40-01, AC28-M40-02, AC28-M40-03.

155. **US28-M41.** As a missionary or reader using a phone, keyboard or assistive technology, I want one clear current state and next action, so that network or permission problems do not cause accidental disclosure or repeated effects.
     Requirement: REQ28-M41. Acceptance: AC28-M41-01, AC28-M41-02, AC28-M41-03.

156. **US28-M42.** As an operator, I want source-owned safe diagnosis and migration, so that repairing connections or restoring a database cannot send old work or expose private bodies.
     Requirement: REQ28-M42. Acceptance: AC28-M42-01, AC28-M42-02, AC28-M42-03, AC28-M42-04.

157. **US28-C01.** As an invited coach, I want to use my own account in the correct organization, so that I can prepare without sharing a missionary's credentials or receiving unrelated privileges.
     Requirement: REQ28-C01. Acceptance: AC28-C01-01, AC28-C01-02, AC28-C01-03, AC28-C01-04, AC28-C01-05.

158. **US28-C02.** As a missionary authorized to share, I want to invite a specific eligible coach, so that coaching starts with a clear recipient and scope.
     Requirement: REQ28-C02. Acceptance: AC28-C02-01, AC28-C02-02, AC28-C02-03, AC28-C02-04, AC28-C02-05, AC28-C02-06.

159. **US28-C03.** As an intended coach, I want a clear acceptance and recovery journey, so that I can tell whether my invitation and access are actually ready.
     Requirement: REQ28-C03. Acceptance: AC28-C03-01, AC28-C03-02, AC28-C03-03, AC28-C03-04, AC28-C03-05.

160. **US28-C04.** As authorized organization staff, I want coaching controls to state their exact effect, so that I can permit or stop a capability without accidentally changing unrelated access.
     Requirement: REQ28-C04. Acceptance: AC28-C04-01, AC28-C04-02, AC28-C04-03, AC28-C04-04, AC28-C04-05.

161. **US28-C05.** As a coach, I want a useful portfolio of the people and Ministry Projects shared with me, so that I can prepare for each conversation without searching unrelated records.
     Requirement: REQ28-C05. Acceptance: AC28-C05-01, AC28-C05-02, AC28-C05-03, AC28-C05-04, AC28-C05-05, AC28-C05-06.

162. **US28-C06.** As a missionary, I want an accurate sharing preview, so that I understand what the named coach will receive before saving.
     Requirement: REQ28-C06. Acceptance: AC28-C06-01, AC28-C06-02, AC28-C06-03, AC28-C06-04, AC28-C06-05.

163. **US28-C07.** As a missionary receiving coaching, I want my coach to see the agreed information without controlling my records, so that accountability does not become unintended delegation.
     Requirement: REQ28-C07. Acceptance: AC28-C07-01, AC28-C07-02, AC28-C07-03, AC28-C07-04, AC28-C07-05.

164. **US28-C08.** As a missionary or coach ending a sharing relationship, I want a clear scoped Stop or Leave action, so that access ends without damaging source records or unrelated work.
     Requirement: REQ28-C08. Acceptance: AC28-C08-01, AC28-C08-02, AC28-C08-03, AC28-C08-04, AC28-C08-05, AC28-C08-06.

165. **US28-C09.** As a missionary, I want to choose whether my coach sees support summaries, so that sharing a goal or inviting a coach does not automatically disclose financial information.
     Requirement: REQ28-C09. Acceptance: AC28-C09-01, AC28-C09-02, AC28-C09-03, AC28-C09-04, AC28-C09-05.

166. **US28-C10.** As a coach reading shared support progress, I want expected support to have a clear dated basis, so that I do not mistake a promise or planning estimate for received money.
     Requirement: REQ28-C10. Acceptance: AC28-C10-01, AC28-C10-02, AC28-C10-03, AC28-C10-04, AC28-C10-05.

167. **US28-C11.** As a missionary sharing received support, I want the figure to reflect actual authoritative contributions, so that the coach sees accurate progress without donor-level access.
     Requirement: REQ28-C11. Acceptance: AC28-C11-01, AC28-C11-02, AC28-C11-03, AC28-C11-04, AC28-C11-05.

168. **US28-C12.** As a coach, I want financial figures and comparisons to retain their units and meaning, so that a polished chart cannot mislead me about support progress.
     Requirement: REQ28-C12. Acceptance: AC28-C12-01, AC28-C12-02, AC28-C12-03, AC28-C12-04, AC28-C12-05.

169. **US28-C13.** As a missionary, I want a support summary to protect the people behind it, so that summary-only coaching does not expose donor details through arithmetic or missing-data shortcuts.
     Requirement: REQ28-C13. Acceptance: AC28-C13-01, AC28-C13-02, AC28-C13-03, AC28-C13-04, AC28-C13-05.

170. **US28-C14.** As a missionary, I want to add specific earlier financial periods, so that my coach receives exactly the history I reviewed.
     Requirement: REQ28-C14. Acceptance: AC28-C14-01, AC28-C14-02, AC28-C14-03, AC28-C14-04, AC28-C14-05, AC28-C14-06.

171. **US28-C15.** As a coach reviewing earlier support, I want corrections and unavailable periods to remain clear, so that a fixed date range is not mistaken for a frozen official statement.
     Requirement: REQ28-C15. Acceptance: AC28-C15-01, AC28-C15-02, AC28-C15-03, AC28-C15-04, AC28-C15-05.

172. **US28-C16.** As a missionary, I want ongoing sharing where permitted or a simple optional end date, so that I can control access without managing needless timers.
     Requirement: REQ28-C16. Acceptance: AC28-C16-01, AC28-C16-02, AC28-C16-03, AC28-C16-04, AC28-C16-05.

173. **US28-C17.** As a missionary selecting a sharing end date, I want Share through to include that whole day, so that the deadline matches the language I see.
     Requirement: REQ28-C17. Acceptance: AC28-C17-01, AC28-C17-02, AC28-C17-03, AC28-C17-04, AC28-C17-05.

174. **US28-C18.** As a missionary, I want to change a valid share's end deliberately, so that the saved access window stays predictable through retries and concurrent changes.
     Requirement: REQ28-C18. Acceptance: AC28-C18-01, AC28-C18-02, AC28-C18-03, AC28-C18-04, AC28-C18-05.

175. **US28-C19.** As a missionary, I want to set my own useful activity targets, so that I can plan without compulsory reporting or a financial plan.
     Requirement: REQ28-C19. Acceptance: AC28-C19-01, AC28-C19-02, AC28-C19-03, AC28-C19-04, AC28-C19-05.

176. **US28-C20.** As a missionary, I want each activity measure to explain what counts, so that the displayed progress matches work I actually did.
     Requirement: REQ28-C20. Acceptance: AC28-C20-01, AC28-C20-02, AC28-C20-03, AC28-C20-04, AC28-C20-05, AC28-C20-06.

177. **US28-C21.** As a missionary, I want progress attributed to the actual participant once, so that shared work and duplicate records do not distort my targets.
     Requirement: REQ28-C21. Acceptance: AC28-C21-01, AC28-C21-02, AC28-C21-03, AC28-C21-04, AC28-C21-05.

178. **US28-C22.** As a missionary, I want clear target dates and calendar rules, so that travel, late entry and partial periods do not change what my progress means.
     Requirement: REQ28-C22. Acceptance: AC28-C22-01, AC28-C22-02, AC28-C22-03, AC28-C22-04, AC28-C22-05.

179. **US28-C23.** As a missionary, I want to change a target with a clear effective period, so that earlier comparisons remain understandable.
     Requirement: REQ28-C23. Acceptance: AC28-C23-01, AC28-C23-02, AC28-C23-03, AC28-C23-04, AC28-C23-05.

180. **US28-C24.** As a missionary, I want to pause a target without losing my work, so that planning can adapt to my circumstances.
     Requirement: REQ28-C24. Acceptance: AC28-C24-01, AC28-C24-02, AC28-C24-03, AC28-C24-04, AC28-C24-05.

181. **US28-C25.** As a missionary, I want to choose which numeric target summaries a coach can see, so that creating a personal target never shares it automatically.
     Requirement: REQ28-C25. Acceptance: AC28-C25-01, AC28-C25-02, AC28-C25-03, AC28-C25-04, AC28-C25-05.

182. **US28-C26.** As a missionary sharing a recurring target, I want later periods to continue predictably, so that I do not repeatedly share the same target or accidentally expose earlier and different work.
     Requirement: REQ28-C26. Acceptance: AC28-C26-01, AC28-C26-02, AC28-C26-03, AC28-C26-04, AC28-C26-05.

183. **US28-C27.** As a coach, I want a truthful numeric comparison, so that I can discuss progress without interpreting incomplete records as effort or gaining private activity details.
     Requirement: REQ28-C27. Acceptance: AC28-C27-01, AC28-C27-02, AC28-C27-03, AC28-C27-04, AC28-C27-05, AC28-C27-06.

184. **US28-C28.** As authorized staff, I want to offer a few optional questions, so that missionaries have useful prompts without a compulsory reporting form.
     Requirement: REQ28-C28. Acceptance: AC28-C28-01, AC28-C28-02, AC28-C28-03, AC28-C28-04, AC28-C28-05.

185. **US28-C29.** As a missionary, I want my answers to retain their original questions, so that staff edits cannot later change what my words appear to answer.
     Requirement: REQ28-C29. Acceptance: AC28-C29-01, AC28-C29-02, AC28-C29-03, AC28-C29-04, AC28-C29-05.

186. **US28-C30.** As a missionary, I want to prepare a check-in privately, so that I can think before deciding whether to share it.
     Requirement: REQ28-C30. Acceptance: AC28-C30-01, AC28-C30-02, AC28-C30-03, AC28-C30-04, AC28-C30-05.

187. **US28-C31.** As a missionary, I want to review the exact writing and audience before sharing, so that autosave and Share cannot be confused.
     Requirement: REQ28-C31. Acceptance: AC28-C31-01, AC28-C31-02, AC28-C31-03, AC28-C31-04, AC28-C31-05.

188. **US28-C32.** As a missionary, I want edits to remain private until I update the shared version, so that a working revision cannot surprise my coach.
     Requirement: REQ28-C32. Acceptance: AC28-C32-01, AC28-C32-02, AC28-C32-03, AC28-C32-04, AC28-C32-05, AC28-C32-06.

189. **US28-C33.** As a coach, I want readable shared check-ins with clear limits and states, so that I can prepare without seeing private writing or struggling on a weak connection.
     Requirement: REQ28-C33. Acceptance: AC28-C33-01, AC28-C33-02, AC28-C33-03, AC28-C33-04, AC28-C33-05, AC28-C33-06.

190. **US28-C34.** As a missionary, I want to share a selected next step from my existing tasks, so that my coach sees what I intend to do without creating a duplicate task.
     Requirement: REQ28-C34. Acceptance: AC28-C34-01, AC28-C34-02, AC28-C34-03, AC28-C34-04, AC28-C34-05.

191. **US28-C35.** As a missionary, I want to approve a short safe description while the real due date and status stay current, so that the coach receives useful context without private task details.
     Requirement: REQ28-C35. Acceptance: AC28-C35-01, AC28-C35-02, AC28-C35-03, AC28-C35-04, AC28-C35-05, AC28-C35-06.

192. **US28-C36.** As a missionary, I want changed task meaning to require a new safe description, so that an earlier review cannot expose newly sensitive work.
     Requirement: REQ28-C36. Acceptance: AC28-C36-01, AC28-C36-02, AC28-C36-03, AC28-C36-04, AC28-C36-05.

193. **US28-C37.** As a coach, I want next-step status to retain its real meaning, so that I do not mistake task completion for an interaction, payment or message being completed.
     Requirement: REQ28-C37. Acceptance: AC28-C37-01, AC28-C37-02, AC28-C37-03, AC28-C37-04, AC28-C37-05.

194. **US28-C38.** As a missionary, I want a simple resource library, so that I can quickly find material my organization has approved for me.
     Requirement: REQ28-C38. Acceptance: AC28-C38-01, AC28-C38-02, AC28-C38-03, AC28-C38-04, AC28-C38-05, AC28-C38-06.

195. **US28-C39.** As an authorized resource curator, I want to prepare, review and publish material, so that the library contains intentional and current guidance.
     Requirement: REQ28-C39. Acceptance: AC28-C39-01, AC28-C39-02, AC28-C39-03, AC28-C39-04, AC28-C39-05, AC28-C39-06.

196. **US28-C40.** As a curator, I want withdrawal to stop new library access reliably, so that outdated or unsafe material cannot remain available through stale navigation or download paths.
     Requirement: REQ28-C40. Acceptance: AC28-C40-01, AC28-C40-02, AC28-C40-03, AC28-C40-04, AC28-C40-05, AC28-C40-06.

197. **US28-C41.** As a missionary, I want an optional starting guide I can use in any order, skip and revisit, so that guidance supports my work without becoming a gate.
     Requirement: REQ28-C41. Acceptance: AC28-C41-01, AC28-C41-02, AC28-C41-03, AC28-C41-04, AC28-C41-05.

198. **US28-C42.** As authorized staff, I want to edit the organization's suggestions easily, so that guidance stays relevant without maintaining a course platform.
     Requirement: REQ28-C42. Acceptance: AC28-C42-01, AC28-C42-02, AC28-C42-03, AC28-C42-04, AC28-C42-05.

199. **US28-C43.** As a guide curator, I want Publish to offer exactly the version I reviewed, so that missionaries never receive mixed or accidental draft content.
     Requirement: REQ28-C43. Acceptance: AC28-C43-01, AC28-C43-02, AC28-C43-03, AC28-C43-04, AC28-C43-05.

200. **US28-C44.** As a missionary, I want each guide suggestion to lead to a real permitted resource or workspace action, so that guidance stays useful and never exposes hidden material.
     Requirement: REQ28-C44. Acceptance: AC28-C44-01, AC28-C44-02, AC28-C44-03, AC28-C44-04, AC28-C44-05.

201. **US28-C45.** As a guide curator, I want to stop offering guidance and later re-offer a reviewed version, so that I can maintain it safely without disrupting missionary work.
     Requirement: REQ28-C45. Acceptance: AC28-C45-01, AC28-C45-02, AC28-C45-03, AC28-C45-04, AC28-C45-05.

202. **US28-C46.** As authorized organization staff, I want one clear regional-discovery control, so that we can offer the list and map deliberately without changing public publication.
     Requirement: REQ28-C46. Acceptance: AC28-C46-01, AC28-C46-02, AC28-C46-03, AC28-C46-04, AC28-C46-05.

203. **US28-C47.** As a missionary, I want regional browsing to contain only approved public ministry information, so that exploration cannot reveal private people or locations.
     Requirement: REQ28-C47. Acceptance: AC28-C47-01, AC28-C47-02, AC28-C47-03, AC28-C47-04, AC28-C47-05.

204. **US28-C48.** As a missionary, I want to explore approved ministries using a list or a world map, so that I can use the view that works for my device and accessibility needs.
     Requirement: REQ28-C48. Acceptance: AC28-C48-01, AC28-C48-02, AC28-C48-03, AC28-C48-04, AC28-C48-05, AC28-C48-06.

205. **US28-C49.** As the accountable product and service owners, we want explicit proof and operating signals, so that optional coaching and resources stay truthful, private and usable after launch.
     Requirement: REQ28-C49. Acceptance: AC28-C49-01, AC28-C49-02, AC28-C49-03, AC28-C49-04, AC28-C49-05, AC28-C49-06, AC28-C49-07, AC28-C49-08, AC28-C49-09, AC28-C49-10, AC28-C49-11, AC28-C49-12.

<!-- END GENERATED STORIES -->

## Implementation Decisions

1. **Reuse the existing domain owners.** The missionary app owns this experience, Mission Control owns staff administration, and the public/donor surfaces retain their existing responsibilities. The canonical API package owns business database logic and consequential commands. Shared database collections/hooks remain the approved browser data boundary. Asym Postgres owns CRM truth. No Twenty integration or private alternative CRM is introduced.

2. **Separate working identity from permission.** Tenant, authenticated principal, current workforce membership, Ministry Assignment participation and Support Assignment are distinct. A coach uses the explicitly admitted tenant-scoped coach role and gains no staff or unrelated access. A signed-in newsletter reader does not become staff, a tenant member or a CRM Party through Join. A relationship, matching email, shared household, payment or former assignment does not grant access. Each command and query resolves its exact current scope from trusted server context and the source owner.

3. **Compose source-owned commands behind one user action.** Preparation admission, contact sharing, allowed correction, referral continuation, Task completion, actual interaction, Request response, gift reporting and newsletter authorization retain distinct authoritative effects. Where one deliberate action records several locally owned effects, accept required source state, permanent operation receipt, audit and effect intent atomically. Cross-owner/provider work uses the existing qualified handoff and recovery contracts; there is no distributed transaction promise or browser-orchestrated partial write.

4. **Use one durable business-effect identity.** A retry replays the originally accepted effect or returns a semantic conflict; it does not obtain a new deadline, task, gift classification, subscription, email or calendar copy. New user intent is distinguishable from replay. Changes are accepted against the expected source/policy revision. Generic Task actions cannot bypass a source-owned obligation or complete purposes the user did not see.

5. **Keep field audience and record authority separate.** Restricted preparation is a bounded P9-owned source purpose, not a fake Party or new restricted-tier classification. Sharing eligible contact facts does not share prior private notes, email content, drafts or coaching responses. All reached lists, counts, searches, files, exports, notifications, logs and caches apply current disclosure before serialization or aggregation. Existence-sensitive records are absent rather than visibly redacted where required.

6. **Maintain logical constraints at the durable boundary.** Tenant-aware relationships, required source identities, immutable actor/author attribution, legal state combinations, unique semantic effects and same-scope ownership must be enforced by qualified constraints and the single owner command, not caller convention. Mutations check both existing and resulting state. Grants, RLS, views, functions, storage policies and service-role paths must preserve the same boundary. New exposed tables require explicit intended grants and RLS; neither implies the other.

7. **Preserve one financial truth.** Contribution, credit, commitment, fulfillment, goal and account balances remain separate. Use the source currency precision, Legal Entity, period and completeness contract. Missing, partial, stale and withheld data never become zero. Do not aggregate loaded pages as complete totals, infer first support from visible history, invent excess from unmatched money or convert received gifts into spendable balances.

8. **Make native follow-up explicit and idempotent.** Qualified first support, selected amount policy, confirmed additional-support purpose, one-time need, exact positive excess and fixed-commitment fulfillment each retain their source identity, eligibility and completion. Grouping is presentation and handling scope, not financial consolidation. Later optional workflows consume the same effect identities. Native duties do not require installation of an optional workflow product.

9. **Formalize correction and attribution policy without changing money ownership.** Organizations choose when posted-gift corrections need a separate authorized approver, within independent mandatory controls. Posted rows remain immutable. Source-code reassignment leaves earlier accepted gifts and continuing recurring lines under their accepted campaign. Truthful append-only gift corrections and deliberate prospective recurring attribution amendments remain distinct. Matching an independent gift changes fulfillment, not its attribution. Current hierarchy reports and preserved historical artifacts state their different bases.

10. **Use owner-defined time semantics.** New referrals count calendar days including the original referral date; continued referrals use elapsed days from accepted continuation. Coaching Share through includes the whole selected day in its disclosed approved zone. Newsletter confirmation lasts exactly 168 elapsed hours from durable acceptance, with equality expired. Display the resulting dates and relevant zone; client clocks, travel, retry, import and background job delays cannot extend authority. Expiry is enforced at access/action time even if cleanup is delayed.

11. **Implement specific controls, not a universal policy builder.** Use the exact settings/defaults in the normative volumes. Unsupported or missing authorization never silently becomes On. Preserve explicit existing settings during migration. A setting that prevents new admissions is distinct from withdrawing accepted consent, revoking access, stopping pending outward effects or deleting source material. Re-enabling never replays terminal actions or restores old permissions by implication.

12. **Complete communication through the existing spine.** P17 supplies governed authoring, content/media, source compilation and release contracts; P6 owns prepared artifacts, sealed submission, current recipient eligibility, intent, dispatch, provider observations and recovery. P28 adds exact native issue/signup purposes rather than a second sender queue. Require positive newsletter participation as well as negative suppression checks. No raw provider call, authenticated profile shortcut, Page setting or imported flag manufactures consent.

13. **Verify the current address, then accept new intent.** The signed-in Join path uses authentic current Supabase identity and qualified same-address proof, and still requires a deliberate newsletter-specific action. Anonymous Auth, stale claims, pending email changes, user-editable metadata and an unrelated workforce profile cannot establish this proof. Guests and other addresses use the existing protected confirmation action. A confirmation link GET is inert; the deliberate confirmation command enforces its original deadline and current rules.

14. **Keep integrations narrow and recoverable.** Native appointments remain authoritative when a user deliberately creates a managed calendar copy. Personal email records actual submission/outcome through a qualified connected account without claiming delivery or a reply. Credential revocation, ambiguous external success and delayed callbacks have source-backed recovery. There is no broad inbox import, external contact-update feed or new giving-feed scope.

15. **Keep coaching voluntary and read-only.** Own-principal invitations, exact subjects/modules/history, current organization limits, expiration and revocation govern every view. Summary access does not grant donor, gift, contact or raw activity access. Numeric targets, qualitative narrative and selected task summaries are separate sharing decisions. Template ownership grants no right to responses. Ending sharing does not end the source task or goal.

16. **Reuse existing publishing and custody.** Authorized curators publish resources through governed internal access; scanning a file is not publication. Regional discovery uses only approved public-safe broad regions, with list/map parity and no precise missionary locations. The optional guide links approved resources and existing actions; it never creates completion records, new task duties or an access gate.

17. **Keep AI assistance optional and bounded.** Reuse the existing AI/provider governance and the ratified writing-help actions, data minimization, request/resource limits and tenant controls. The author deliberately requests, reviews and applies suggestions. Generated text is neither verified fact nor a saved/sent issue. Ordinary editing and sending remain useful without AI, including when a request is unavailable or rejected.

18. **Adopt retained data safely.** Inventory actual reached legacy data, rights and writers before cutover. Resolve each source identity and retain accepted evidence; never fabricate private preparation authorship, consent, financial origin, completed interaction or coach grant. Introduce compatible source contracts/readers, backfill only justified meaning, qualify reconciliation and disable competing writers before activation. Rollback may stop a capability but must not erase accepted new source effects or revive retired unsafe writers.

19. **Use the existing visual and interaction language.** Compose shared Base UI/base-maia components with semantic tokens and approved compact variants. Preserve readable information hierarchy, purposeful action labels, accessible focus/status feedback and phone usability. Show Saved, Updating, Awaiting approval, Not sent or Unavailable only when the source establishes that state. Preserve safe input and make recovery specific; do not show generic success before required effects are accepted.

20. **Qualify each capability independently.** Missing source producers, identity assurance or complete financial evidence block the exact dependent action or measure. They do not justify a local substitute or disabling unrelated work. Formal specification and the `ready-for-agent` label do not waive source/provider/migration/user proof. The Phase 6 sealed provider-submission producer remains an explicit dependency until its actual component and qualification are established.

## Testing Decisions

1. **Confirmed primary seam:** existing Playwright whole-user journeys across missionary, authorized staff, own-principal coach and public reader. Test the observable permitted state before and after real actions. Reuse existing surface runners and fixtures; add no parallel framework or synthetic model as the acceptance authority.
2. **Focused tests:** reuse Vitest at exported canonical command/query and shared component boundaries for fast error/state coverage. Assert user-visible and durable domain outcomes, not helper call order, private structures or mock query strings as the sole oracle.
3. **Indispensable database proof:** execute actual grants/RLS/storage/function paths with different tenant/principal roles, both mutation states, revoked authority and forged context. Use multiple database sessions for races; rollback fixtures alone do not prove concurrency. Exercise privileged workers and imports as well as ordinary clients.
4. **Indispensable Auth proof:** establish actual qualified current email/session evidence; prove guest, anonymous Auth, no-workforce-profile reader, changed address, revoked session and cross-tenant target behavior. Disable demo bypass for these cases. A missing mandatory fixture is incomplete qualification, never skipped-green success.
5. **Indispensable provider proof:** reuse shared Auth, calendar, personal-email and P6/P17 contracts against supported provider fixtures/sandboxes. Challenge duplicate/out-of-order callbacks, unknown external success, timeout after acceptance, suppression/revocation races and same-operation recovery. No real supporter communication is used as a test.
6. **Prior art:** missionary account-frame/navigation and partner safety tests provide shared shell, redaction, draft preservation and mobile interaction patterns; task-delete recovery proves truthful UI recovery. Auth session-guard and callback tests provide existing browser/HTTP boundaries. Support Hub proves related multi-surface behavior. Their mock/demo limits are explicit in the evidence volume.
7. **Prior art for durable proof:** existing field-policy SQL role-switch tests and contribution fee-replay integration tests establish reusable real database fixture patterns. Existing operation-wrapper, workflow ledger, intake-command and email webhook tests establish exported command/response interfaces. Extend those seams; do not claim their current coverage proves new Phase 28 behavior.
8. **Required complete journeys:** first useful work with optional modules Off; context switching; private preparation/share/archive/departure/return; late/expired referral continuation; real interaction plus task outcome; complete/partial financial scope; purpose-specific follow-up; intake continuation; guest/verified signup/rejoin/Off/expiry; newsletter author-to-outcome; calendar/email ambiguity; coach invite/share/revoke; library/guide/map use; interrupted save/reload/retry; migration/restore.
9. **Boundary data:** include shared households/churches, multiple ministries/commitments/currencies, zero-decimal and other supported precision, anonymous/restricted donors, multiple purposes/portions, partial corrections/refunds, unknown historical origin, DST/date boundaries, leap dates, long localized names, non-Latin addresses/text and low-bandwidth conditions.
10. **Accessible outcomes:** combine automated Axe checks with actual keyboard/focus, screen-reader/status, zoom/reflow, reduced-motion and mobile tests. A passing scan alone is not accessibility conformance. Map, reorder and visual charts retain usable text/list alternatives.
11. **Performance and completeness:** prove pagination, source-complete aggregation, query plans and bounded data transfer against a documented representative workload. Use existing instant-navigation and production-build Web Vitals patterns. Record workload, units, budgets and observed percentiles; no unmeasured claim that the feature is fast or scalable is accepted.
12. **Migration/release proof:** test old/new reader-writer compatibility, retained-data classification, replay, interruption and restored backups. Reconcile actual source facts and permanently accepted effects after recovery. Kill switches stop affected new work without destroying history or cancelling independently authorized payments.
13. **Traceability:** every US/REQ/AC identifier maps to the selected decision/completeness clause, owner contract and a future test/release artifact. No spec acceptance case is considered passed by documentation generation, a research probe or an unrelated earlier suite. Document-only verification checks source/derived consistency, IDs, links, coverage, exact publication and preserved evidence.

## Out of Scope

- Feature implementation, production activation, live-data migration, live configuration changes, real supporter messages and a decomposition into implementation tickets in this publication task.
- A standalone missionary tenant, shadow CRM/ledger, Twenty CRM, separate personal task truth or a new general policy/workflow engine.
- Automatic external contact updates, broad inbox/reply import, calendar authority over Asym appointments, a new giving-feed field family or external newsletter synchronization owned by a later phase.
- Mandatory coaching, targets, check-ins, guide completion, courses/LMS, performance scores, donor-worth ranking, missing-log penalties or private-work disclosure through departure.
- Automatic special-gift inference from giving history, automatic newsletter enrollment from gifts/imports/login, unattended AI writing/sending, automatic future digest parity, and an additional automatic missionary task for recurring misses/attention this release.
- Changing payment authorization, designation, legal donor/credit, receipts or immutable posted money through a goal, campaign label, follow-up completion, gift-purpose confirmation or fulfillment match.
- Precise worker location publication, a new arbitrary map-pin system, ordinary missionary resource submission/moderation, and bypass of current privacy/source restrictions for convenience.

Existing source duties and separately qualified capabilities retain their scope. An exclusion here does not silently retire a required P6/P9/P13/P14/P16/P17/P21/P27 obligation.

## Further Notes

The founder's current `/to-spec` instruction authorizes formal synthesis and publication, superseding the earlier grill-only transition boundary. It does not rewrite the historical approval status of individual research packets. D1–D50 and ratified completeness C01–C20 are reconciled through their final selected meaning and later scoped amendments. Unselected options, abandoned timing defaults and speculative physical designs are not adopted merely because they occur in a review.

The canonical sources for stories, requirement prose and acceptance are the five normative domain/proof volumes. The numbered story section above, traceability and active OpenSpec behavior projection are derived views. Owner reconciliation and evidence are hand-maintained. Modify a canonical source and regenerate its declared views together; do not independently edit a projection. The main problem, solution, implementation/testing decisions and exclusions remain hand-authored.

The [decision coverage and supersession map](phase-28-missionary-workspace-depth/traceability.json) and [owner reconciliation](phase-28-missionary-workspace-depth/owner-reconciliation.md) connect the full interview to exact formal scope. The [publication record](phase-28-missionary-workspace-depth/publication.md) identifies the tracker issue, ordered normative parts and readback evidence. Source evidence and historical grill artifacts retain their original meaning and hashes.

Current research corroborates deliberate intent, clear consequences, source-preserving amendments, accessible feedback and proportionate controls. Competitors are examples, not authorities over Asym's adopted domain contracts. Qualified implementation still requires representative user journeys and actual source/provider/auth/migration evidence. No publication statement may turn a selected policy or a passing document check into a claim of deployed correctness.
