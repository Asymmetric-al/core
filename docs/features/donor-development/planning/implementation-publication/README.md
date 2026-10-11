# Phase 27 implementation publication

Published from the approved [68-ticket proposal](https://github.com/Asymmetric-al/core/tree/057a1dc43832eeeca2a8856716d6be1d5422e96f/docs/features/donor-development/planning/implementation-proposal) and [specification](https://github.com/Asymmetric-al/core/tree/b5a65b3f2da880fcbfa4b3cae189d216d06542be/docs/prds/sitestacker-parity/phase-27-donor-development). [Documentation PR #1993](https://github.com/Asymmetric-al/core/pull/1993) remains unmerged.

**68 implementation issues are published:** 67 native children of [#1992](https://github.com/Asymmetric-al/core/issues/1992), with the Ministry Assignment source enabler under Phase 9 [#604](https://github.com/Asymmetric-al/core/issues/604). The exact approved graph has **139 native blocking edges** (123 between new issues and 16 from existing issues). All 68 are open, `status:blocked` and unassigned.

Coverage remains **193 requirements, 193 stories, 711 primary acceptance cases, 141 monitor definitions and 204 OpenSpec tasks**. [Coverage](coverage.json) translates the approved ticket mappings to real issue URLs without changing requirements, ownership, monitor signals, thresholds or responses. [Issue index](issues.json), [dependencies](dependencies.json) and the [complete graph](graph.md) provide the durable handoff.

## Implementation frontier and gates

The first sources with no new-ticket blockers are [P27-A01 / AL-1994](https://github.com/Asymmetric-al/core/issues/1994), [P27-C04 / AL-1995](https://github.com/Asymmetric-al/core/issues/1995), [P27-F12 / AL-1996](https://github.com/Asymmetric-al/core/issues/1996), [P27-P14 / AL-1997](https://github.com/Asymmetric-al/core/issues/1997), [P27-S01 / AL-1998](https://github.com/Asymmetric-al/core/issues/1998). This is a dependency frontier, not dispatch approval. Each remains blocked by specification integration and its exact consumed owner-component qualification. Existing native blockers are listed below.

- Integrate the approved specification through PR #1993 or the explicitly integrated exact revision before implementation dispatch. This task does not authorize merging the PR.
- E7 remains unresolved for affected received-toward-appeal financial attribution; keep its specified unavailable state until the owner ruling and proof exist.
- C-01 remains unresolved for affected posted-gift correction independence; intake and Request review cannot confer correction authority.
- Phase 6 owns outbound preparation and sealed provider submission. Its exact implementation allocation and proof remain absent; affected F11/F16 provider delivery remains gated. The #888 occurrence compiler does not become that producer.
- Exact current authorization, RLS/concurrency, source, adapter and provider components must be qualified. A closed producer issue, a pure fixture or an entire future phase is not a substitute for the required evidence.

## Published issue index

`A -> B` means B is blocked by A. This is one valid dependency order; independent slices may progress in parallel after their own gates clear. Each linked GitHub issue contains its full approved implementation and testing contract. The stable P27 keys retain proposal traceability; AL numbers are the live issue keys.

1. **[AL-1994: Transfer one named staff responsibility with protected intent and truthful history (P27-A01)](https://github.com/Asymmetric-al/core/issues/1994)**

   **Delivers:** Staff can replace, end or deliberately keep an exact role-qualified assignment, including explicit primary handling, without changing other roles, work or access.

   **Direct blockers:** [AL-607](https://github.com/Asymmetric-al/core/issues/607), [AL-620](https://github.com/Asymmetric-al/core/issues/620), [AL-613](https://github.com/Asymmetric-al/core/issues/613)

2. **[AL-1995: Inspect exact scoped giving facts without ratings (P27-C04)](https://github.com/Asymmetric-al/core/issues/1995)**

   **Delivers:** An authorized staff reader sees accurate separate legal-giving/recognition facts for one subject, entity, currency and period, with understandable coverage and correction effects.

   **Direct blockers:** [AL-723](https://github.com/Asymmetric-al/core/issues/723)

3. **[AL-1996: Create a clear financial, nonfinancial or mixed appeal (P27-F12)](https://github.com/Asymmetric-al/core/issues/1996)**

   **Delivers:** Staff create a named coordinated appeal with optional goals and a readable Working list, Requests and History shell.

   **Direct blockers:** No native issue blocker; specification integration and qualified-component gates still apply.

4. **[AL-1997: Create an organization-owned usable stage list (P27-P14)](https://github.com/Asymmetric-al/core/issues/1997)**

   **Delivers:** An authorized configurator can use supplied starting definitions or deliberately create a complete additional list, cancel safely and recover the accepted list after a lost response.

   **Direct blockers:** No native issue blocker; specification integration and qualified-component gates still apply.

5. **[AL-1998: [Phase 9] Manage one stable Ministry Assignment and its separate participant memberships (P27-S01)](https://github.com/Asymmetric-al/core/issues/1998)**

   **Delivers:** Authorized staff create a real organization-owned ministry, see its current participants, and prospectively add/end/correct participant association while identity/history and access boundaries remain stable; P27 can reference current eligible ministry without a Page or support account.

   **Direct blockers:** [AL-606](https://github.com/Asymmetric-al/core/issues/606)

6. **[AL-1999: Draft and preview bounded ordered assignment rules (P27-A02)](https://github.com/Asymmetric-al/core/issues/1999)**

   **Delivers:** Administrators can save inert rules and understand the first proved match, protected choices and uncertainty before any activation.

   **Direct blockers:** [AL-1994](https://github.com/Asymmetric-al/core/issues/1994)

7. **[AL-2000: Reconcile imported and merged assignment provenance without losing control (P27-A09)](https://github.com/Asymmetric-al/core/issues/2000)**

   **Delivers:** Data stewards can migrate or repair staff assignment references while preserving role history, deliberate choices and actual source obligations.

   **Direct blockers:** [AL-1994](https://github.com/Asymmetric-al/core/issues/1994), [AL-610](https://github.com/Asymmetric-al/core/issues/610)

8. **[AL-2001: Share a new eligible partnership update with its exact audience (P27-C01)](https://github.com/Asymmetric-al/core/issues/2001)**

   **Delivers:** A staff member or missionary deliberately writes one eligible update from the existing partnership context, sees who may read it, and recovers the same accepted save across both permitted surfaces.

   **Direct blockers:** [AL-1998](https://github.com/Asymmetric-al/core/issues/1998)

9. **[AL-2002: Configure optional giving bands and make Off authoritative (P27-C05)](https://github.com/Asymmetric-al/core/issues/2002)**

   **Delivers:** Authorized tenants opt into explained separate financial bands, edit bounded ranges safely, and turn ratings Off everywhere without damaging ordinary work or silently broadening saved views.

   **Direct blockers:** [AL-1995](https://github.com/Asymmetric-al/core/issues/1995)

10. **[AL-2003: Add people and churches to a recorded appeal working list (P27-F13)](https://github.com/Asymmetric-al/core/issues/2003)**

    **Delivers:** Staff deliberately plan outreach from permitted discovery results; later filter changes never alter the saved plan.

    **Direct blockers:** [AL-1996](https://github.com/Asymmetric-al/core/issues/1996)

11. **[AL-2004: Start or reuse one continuing partnership in context (P27-P01)](https://github.com/Asymmetric-al/core/issues/2004)**

    **Delivers:** A staff member deliberately starts ordinary identified-ministry work once, with a visible eligible owner, approved list and truthful next action, or safely reuses existing work.

    **Direct blockers:** [AL-1998](https://github.com/Asymmetric-al/core/issues/1998), [AL-1997](https://github.com/Asymmetric-al/core/issues/1997)

12. **[AL-2005: Activate prospective reviewed routing and apply one current proposal (P27-A03)](https://github.com/Asymmetric-al/core/issues/2005)**

    **Delivers:** Future qualified source changes can create an initial eligible assignment or one reviewable transfer proposal; nothing silently sweeps existing work.

    **Direct blockers:** [AL-1999](https://github.com/Asymmetric-al/core/issues/1999), [AL-669](https://github.com/Asymmetric-al/core/issues/669)

13. **[AL-2006: Correct and restrict shared history without losing truthful context (P27-C02)](https://github.com/Asymmetric-al/core/issues/2006)**

    **Delivers:** Authorized collaborators correct the actual occurrence and operators restrict accidental disclosure; history, lawful recovery and permitted read access survive closure, retention and safe stop/restore.

    **Direct blockers:** [AL-2001](https://github.com/Asymmetric-al/core/issues/2001)

14. **[AL-2007: Review one qualified giving-pattern change through shared Tasks (P27-C06)](https://github.com/Asymmetric-al/core/issues/2007)**

    **Delivers:** A separately opted-in qualified pattern entry produces one internal review with a current owner and real source action; completion, exit, correction and Off end or preserve the right work.

    **Direct blockers:** [AL-2002](https://github.com/Asymmetric-al/core/issues/2002), [AL-2004](https://github.com/Asymmetric-al/core/issues/2004)

15. **[AL-2008: Prepare one significant nonfinancial Request in its real partnership context (P27-F01)](https://github.com/Asymmetric-al/core/issues/2008)**

    **Delivers:** Staff can save and reopen a prayer, introduction, hosting or other significant invitation without enrolling a cultivation journey or inventing a financial amount.

    **Direct blockers:** [AL-2004](https://github.com/Asymmetric-al/core/issues/2004)

16. **[AL-2009: Report an actual gift receipt with honest missing details (P27-F21)](https://github.com/Asymmetric-al/core/issues/2009)**

    **Delivers:** An authorized report-only staff member records real offline receipt and its next responsibility in a small clear flow without posting money.

    **Direct blockers:** [AL-2004](https://github.com/Asymmetric-al/core/issues/2004)

17. **[AL-2010: Admit a genuinely distinct continuing purpose without duplicating ordinary work (P27-P02)](https://github.com/Asymmetric-al/core/issues/2010)**

    **Delivers:** Staff can explicitly record a separate continuing outcome only when requests/tasks/ownership cannot represent it.

    **Direct blockers:** [AL-2004](https://github.com/Asymmetric-al/core/issues/2004)

18. **[AL-2011: Review and start a finite group with recoverable per-member outcomes (P27-P03)](https://github.com/Asymmetric-al/core/issues/2011)**

    **Delivers:** Staff know exactly which selected relationships will start or reuse work and can recover partial progress without replaying accepted effects.

    **Direct blockers:** [AL-2004](https://github.com/Asymmetric-al/core/issues/2004)

19. **[AL-2012: Change partnership responsibility without transferring unrelated work or access (P27-P04)](https://github.com/Asymmetric-al/core/issues/2012)**

    **Delivers:** Authorized staff can hand off an exact partnership responsibility and find a truthful repair path when no eligible recipient remains.

    **Direct blockers:** [AL-2004](https://github.com/Asymmetric-al/core/issues/2004)

20. **[AL-2013: Correct a mistaken partnership reference without rewriting accepted facts (P27-P05)](https://github.com/Asymmetric-al/core/issues/2013)**

    **Delivers:** Staff can repair an honest incorrect source link while retaining original meaning and independently owned history.

    **Direct blockers:** [AL-2004](https://github.com/Asymmetric-al/core/issues/2004)

21. **[AL-2014: Pause until a deliberate organization-calendar review date (P27-P08)](https://github.com/Asymmetric-al/core/issues/2014)**

    **Delivers:** Staff can pause and reschedule work without losing obligations or inventing review completion or donor duties.

    **Direct blockers:** [AL-2004](https://github.com/Asymmetric-al/core/issues/2004)

22. **[AL-2015: Start work with an eligible list and an optional assessment (P27-P15)](https://github.com/Asymmetric-al/core/issues/2015)**

    **Delivers:** Staff select the appropriate eligible list and optionally a current stage in one deliberate Start, while unassessed work remains visible and existing ordinary work is reused unchanged.

    **Direct blockers:** [AL-2004](https://github.com/Asymmetric-al/core/issues/2004)

23. **[AL-2016: Apply one finite reviewed group with recoverable member results (P27-A04)](https://github.com/Asymmetric-al/core/issues/2016)**

    **Delivers:** Staff can review selected current matches or manual transfers together, apply exactly that set, and recover partial results without duplicate changes.

    **Direct blockers:** [AL-2005](https://github.com/Asymmetric-al/core/issues/2005)

24. **[AL-2017: Show actual exchanges separately from outreach and follow-up (P27-C03)](https://github.com/Asymmetric-al/core/issues/2017)**

    **Delivers:** Staff and permitted missionaries see honest Last recorded exchange, Recent outreach and Next follow-up, with complete source recency and explicit uncertainty.

    **Direct blockers:** [AL-2006](https://github.com/Asymmetric-al/core/issues/2006)

25. **[AL-2018: Refresh enabled giving analysis within a bounded recoverable profile (P27-C07)](https://github.com/Asymmetric-al/core/issues/2018)**

    **Delivers:** Enabled scopes refresh fairly with visible cutoffs/deadlines; operators can stop, resume and roll forward analysis without recalculating disabled tenants or reviving old effects.

    **Direct blockers:** [AL-2007](https://github.com/Asymmetric-al/core/issues/2007)

26. **[AL-2019: Enter relevant monetary or noncash Request terms without losing data (P27-F02)](https://github.com/Asymmetric-al/core/issues/2019)**

    **Delivers:** Staff enter exact currency-aware terms or honest unknown amounts, and switch applicability without hidden financial submission or silent loss.

    **Direct blockers:** [AL-2008](https://github.com/Asymmetric-al/core/issues/2008)

27. **[AL-2020: Configure whether a Request needs internal review (P27-F08)](https://github.com/Asymmetric-al/core/issues/2020)**

    **Delivers:** Tenant staff with the right powers can use a clear default and deliberate per-Request exception, while ordinary review-free work remains quick.

    **Direct blockers:** [AL-2008](https://github.com/Asymmetric-al/core/issues/2008)

28. **[AL-2021: Continue the same reported gift through finance recording (P27-F22)](https://github.com/Asymmetric-al/core/issues/2021)**

    **Delivers:** Finance opens the exact reported item in its existing source workflow and the reporter sees qualified recorded/partial status without entering a second gift.

    **Direct blockers:** [AL-2009](https://github.com/Asymmetric-al/core/issues/2009), [AL-773](https://github.com/Asymmetric-al/core/issues/773)

29. **[AL-2022: Receive one minimal in-product review reminder at the right source occurrence (P27-P10)](https://github.com/Asymmetric-al/core/issues/2022)**

    **Delivers:** A currently eligible assignee finds the same due review through shared tasks and role-safe attention, with reliable source-ended history.

    **Direct blockers:** [AL-2014](https://github.com/Asymmetric-al/core/issues/2014), [AL-2012](https://github.com/Asymmetric-al/core/issues/2012), [AL-891](https://github.com/Asymmetric-al/core/issues/891)

30. **[AL-2023: Choose any appropriate stage directly and retain each real assessment (P27-P16)](https://github.com/Asymmetric-al/core/issues/2023)**

    **Delivers:** Staff can set a first stage, skip or return directly using advisory guidance, with one deliberate save and history of actual accepted changes only.

    **Direct blockers:** [AL-2015](https://github.com/Asymmetric-al/core/issues/2015), [AL-2014](https://github.com/Asymmetric-al/core/issues/2014)

31. **[AL-2024: Prefill a clear starting list without taking away staff choice (P27-P18)](https://github.com/Asymmetric-al/core/issues/2024)**

    **Delivers:** Configurators may set or clear one optional usual list; new work visibly starts from established valid intent, a proved sole eligible list or a permitted usable usual list, and otherwise asks.

    **Direct blockers:** [AL-2015](https://github.com/Asymmetric-al/core/issues/2015)

32. **[AL-2025: Record the actual invitation and its independent supporter response (P27-F03)](https://github.com/Asymmetric-al/core/issues/2025)**

    **Delivers:** Staff record what was asked and the actual answer in one clear save, including mixed financial and nonfinancial requests.

    **Direct blockers:** [AL-2019](https://github.com/Asymmetric-al/core/issues/2019)

33. **[AL-2026: Resolve duplicate reports and existing recorded gifts by exact lineage (P27-F23)](https://github.com/Asymmetric-al/core/issues/2026)**

    **Delivers:** Staff can reconcile two reports of one actual item or link its existing authoritative posting without duplicate money or destroyed provenance.

    **Direct blockers:** [AL-2021](https://github.com/Asymmetric-al/core/issues/2021)

34. **[AL-2027: Track physical handling and truthful exceptions independently of posting (P27-F24)](https://github.com/Asymmetric-al/core/issues/2027)**

    **Delivers:** Staff can transfer or resolve actual handling while finance status stays authoritative and unfinished property work never disappears.

    **Direct blockers:** [AL-2021](https://github.com/Asymmetric-al/core/issues/2021), [AL-780](https://github.com/Asymmetric-al/core/issues/780)

35. **[AL-2028: Customize stage meaning and order without breaking retained work (P27-P17)](https://github.com/Asymmetric-al/core/issues/2028)**

    **Delivers:** An authorized organization configurator can add stages, change same-meaning wording/guidance, reorder, retire or restore them while retaining stable references and explainable history.

    **Direct blockers:** [AL-2023](https://github.com/Asymmetric-al/core/issues/2023)

36. **[AL-2029: Revise proposals and preserve late answers to earlier presented terms (P27-F04)](https://github.com/Asymmetric-al/core/issues/2029)**

    **Delivers:** Staff revise preparation or forecasts and record a late answer without rewriting what the supporter actually saw.

    **Direct blockers:** [AL-2025](https://github.com/Asymmetric-al/core/issues/2025)

37. **[AL-2030: Keep Request responsibility and follow-up truthful through pause and closure (P27-F05)](https://github.com/Asymmetric-al/core/issues/2030)**

    **Delivers:** Staff can update paused/closed work, reassign responsibility or end one Request while remaining independent obligations stay visible.

    **Direct blockers:** [AL-2025](https://github.com/Asymmetric-al/core/issues/2025)

38. **[AL-2031: Remove, exclude or deliberately return an appeal member (P27-F14)](https://github.com/Asymmetric-al/core/issues/2031)**

    **Delivers:** Staff can change the plan with clear consequences while actual Requests and independent obligations remain intact.

    **Direct blockers:** [AL-2003](https://github.com/Asymmetric-al/core/issues/2003), [AL-2025](https://github.com/Asymmetric-al/core/issues/2025)

39. **[AL-2032: Withdraw a list from new use while existing work continues (P27-P19)](https://github.com/Asymmetric-al/core/issues/2032)**

    **Delivers:** Configurators can stop and restore new use of a list while existing assessed, unassessed and returning partnership work continues on its retained binding.

    **Direct blockers:** [AL-2028](https://github.com/Asymmetric-al/core/issues/2028), [AL-2024](https://github.com/Asymmetric-al/core/issues/2024)

40. **[AL-2033: Preserve source work through representative handoff and departure (P27-A05)](https://github.com/Asymmetric-al/core/issues/2033)**

    **Delivers:** A representative change either preserves lawful independent responsibility or observes the exact source-owned handoff condition; departure never waits to revoke access.

    **Direct blockers:** [AL-1994](https://github.com/Asymmetric-al/core/issues/1994), [AL-2012](https://github.com/Asymmetric-al/core/issues/2012), [AL-2030](https://github.com/Asymmetric-al/core/issues/2030)

41. **[AL-2034: Prepare a meeting from a deterministic source-linked brief (P27-C08)](https://github.com/Asymmetric-al/core/issues/2034)**

    **Delivers:** Staff can prepare for a meeting from one useful permission-safe on-screen summary of current partnership facts, actual exchange, financial lenses, Requests and next work without AI.

    **Direct blockers:** [AL-2017](https://github.com/Asymmetric-al/core/issues/2017), [AL-1995](https://github.com/Asymmetric-al/core/issues/1995), [AL-2029](https://github.com/Asymmetric-al/core/issues/2029), [AL-2030](https://github.com/Asymmetric-al/core/issues/2030)

42. **[AL-2035: Work with churches while preserving people and financial identities (P27-C09)](https://github.com/Asymmetric-al/core/issues/2035)**

    **Delivers:** Church-relations staff distinguish the church, its actual contacts and ministry relationships and can adapt present work without rewriting earlier participants or personal donor facts.

    **Direct blockers:** [AL-625](https://github.com/Asymmetric-al/core/issues/625), [AL-2030](https://github.com/Asymmetric-al/core/issues/2030), [AL-1995](https://github.com/Asymmetric-al/core/issues/1995)

43. **[AL-2036: Show qualified source outcomes and hand a funding response to its owner deliberately (P27-F06)](https://github.com/Asymmetric-al/core/issues/2036)**

    **Delivers:** Staff can see authoritative received/applied outcomes and start an independently authorized fixed-commitment handoff without a response becoming money.

    **Direct blockers:** [AL-2029](https://github.com/Asymmetric-al/core/issues/2029), [AL-697](https://github.com/Asymmetric-al/core/issues/697), [AL-823](https://github.com/Asymmetric-al/core/issues/823)

44. **[AL-2037: Submit and decide one review of exact Request terms (P27-F09)](https://github.com/Asymmetric-al/core/issues/2037)**

    **Delivers:** A qualified reviewer can inspect authorized terms and approve to present, request changes or refuse, with one durable source decision.

    **Direct blockers:** [AL-2029](https://github.com/Asymmetric-al/core/issues/2029), [AL-2020](https://github.com/Asymmetric-al/core/issues/2020)

45. **[AL-2038: Apply one finite reviewed selection with truthful per-person results (P27-F15)](https://github.com/Asymmetric-al/core/issues/2038)**

    **Delivers:** Staff can distinguish page from all-matching selection and safely finish or cancel a bounded bulk plan change.

    **Direct blockers:** [AL-2031](https://github.com/Asymmetric-al/core/issues/2031)

46. **[AL-2039: Coordinate actual mixed-purpose Requests across appeals without copying their work (P27-F18)](https://github.com/Asymmetric-al/core/issues/2039)**

    **Delivers:** Staff can deliberately link, unlink and relink a compatible Request while its terms, history and responsibility remain canonical.

    **Direct blockers:** [AL-2029](https://github.com/Asymmetric-al/core/issues/2029), [AL-1996](https://github.com/Asymmetric-al/core/issues/1996)

47. **[AL-2040: Review only future work affected by a ministry source change (P27-P06)](https://github.com/Asymmetric-al/core/issues/2040)**

    **Delivers:** Staff see a scoped review of genuinely affected future obligations, while routine name or participant changes preserve continuity.

    **Direct blockers:** [AL-2030](https://github.com/Asymmetric-al/core/issues/2030)

48. **[AL-2041: Work from a complete next-action view without losing independent promises (P27-P07)](https://github.com/Asymmetric-al/core/issues/2041)**

    **Delivers:** Staff can reuse appropriate existing work, inspect independently due matters and take each source-owned action from one shared context.

    **Direct blockers:** [AL-2030](https://github.com/Asymmetric-al/core/issues/2030)

49. **[AL-2042: Opt into bounded automatic transfers and stop stale work immediately (P27-A06)](https://github.com/Asymmetric-al/core/issues/2042)**

    **Delivers:** A tenant can enable Auto only for a declared rule-managed scope and turn it off with commit-time protection against old queued decisions.

    **Direct blockers:** [AL-2005](https://github.com/Asymmetric-al/core/issues/2005), [AL-2033](https://github.com/Asymmetric-al/core/issues/2033)

50. **[AL-2043: Read Request and nonfinancial appeal measures with explicit meaning (P27-F07)](https://github.com/Asymmetric-al/core/issues/2043)**

    **Delivers:** Staff distinguish requested, forecast, replied and nonfinancial progress without treating unknowns or overlapping supporter sets as disjoint money.

    **Direct blockers:** [AL-2039](https://github.com/Asymmetric-al/core/issues/2039)

51. **[AL-2044: Reassign, withdraw and correct review without rewriting decisions (P27-F10)](https://github.com/Asymmetric-al/core/issues/2044)**

    **Delivers:** Authorized staff can recover stalled routing or reconsider/revoke a decision while old reviewers and replayed work cannot act.

    **Direct blockers:** [AL-2037](https://github.com/Asymmetric-al/core/issues/2037)

52. **[AL-2045: Record a real review and keep on hold or resume (P27-P09)](https://github.com/Asymmetric-al/core/issues/2045)**

    **Delivers:** Staff complete the actual internal review and deliberately establish the next source state without reviving old effects.

    **Direct blockers:** [AL-2014](https://github.com/Asymmetric-al/core/issues/2014), [AL-2041](https://github.com/Asymmetric-al/core/issues/2041)

53. **[AL-2046: Return protected responsibility to rules with its exact effect shown (P27-A07)](https://github.com/Asymmetric-al/core/issues/2046)**

    **Delivers:** Staff can deliberately choose Use rules again without guessing whether it creates a proposal or immediately applies an eligible displayed result.

    **Direct blockers:** [AL-2042](https://github.com/Asymmetric-al/core/issues/2042)

54. **[AL-2047: Enforce current Request review at the actual outward-action boundary (P27-F11)](https://github.com/Asymmetric-al/core/issues/2047)**

    **Delivers:** Approved terms remain history, while a prospective action starts only under current matching clearance and owner authority.

    **Direct blockers:** [AL-2044](https://github.com/Asymmetric-al/core/issues/2044), [AL-897](https://github.com/Asymmetric-al/core/issues/897)

55. **[AL-2048: Show exact source-backed financial appeal progress with honest coverage (P27-F20)](https://github.com/Asymmetric-al/core/issues/2048)**

    **Delivers:** Staff see received-toward-appeal and other explicitly named measures without double counting, hidden caps or invented campaign mapping.

    **Direct blockers:** [AL-2043](https://github.com/Asymmetric-al/core/issues/2043), [AL-697](https://github.com/Asymmetric-al/core/issues/697), [AL-2021](https://github.com/Asymmetric-al/core/issues/2021)

56. **[AL-2049: Close finished partnership work after complete owner readiness (P27-P11)](https://github.com/Asymmetric-al/core/issues/2049)**

    **Delivers:** Staff deliberately close the exact work while independently valid commitments and obligations remain accountable and history remains truthful.

    **Direct blockers:** [AL-2045](https://github.com/Asymmetric-al/core/issues/2045)

57. **[AL-2050: Inspect and recover assignment history without widening current access (P27-A08)](https://github.com/Asymmetric-al/core/issues/2050)**

    **Delivers:** Staff can understand actual/proposed/protected responsibility and recover results across devices, conflicts or access changes using only currently permitted facts.

    **Direct blockers:** [AL-2016](https://github.com/Asymmetric-al/core/issues/2016), [AL-2046](https://github.com/Asymmetric-al/core/issues/2046)

58. **[AL-2051: Stop membership-dependent solicitation before its transport admission (P27-F16)](https://github.com/Asymmetric-al/core/issues/2051)**

    **Delivers:** Removing or excluding a member fences only the applicable unstarted appeal solicitation, even if projection workers are down.

    **Direct blockers:** [AL-2031](https://github.com/Asymmetric-al/core/issues/2031), [AL-2047](https://github.com/Asymmetric-al/core/issues/2047)

59. **[AL-2052: Reopen the same partnership without resurrecting old tasks or grants (P27-P12)](https://github.com/Asymmetric-al/core/issues/2052)**

    **Delivers:** Staff return to the same continuing work and retained stage or absence with clear historical provenance and fresh eligibility.

    **Direct blockers:** [AL-2049](https://github.com/Asymmetric-al/core/issues/2049)

60. **[AL-2053: Read a complete permitted partnership portfolio and history (P27-P13)](https://github.com/Asymmetric-al/core/issues/2053)**

    **Delivers:** Staff trust current-work totals, closed history and source links without collapsing stages, responses, giving and recorded contact into one status.

    **Direct blockers:** [AL-2049](https://github.com/Asymmetric-al/core/issues/2049), [AL-2017](https://github.com/Asymmetric-al/core/issues/2017)

61. **[AL-2054: Compare native development work and qualified outcomes honestly (P27-C10)](https://github.com/Asymmetric-al/core/issues/2054)**

    **Delivers:** Development staff see complete permitted owner/stage/Request and forecast-versus-qualified-outcome views without mandatory ratings or a reporting platform.

    **Direct blockers:** [AL-2048](https://github.com/Asymmetric-al/core/issues/2048), [AL-2053](https://github.com/Asymmetric-al/core/issues/2053), [AL-1995](https://github.com/Asymmetric-al/core/issues/1995)

62. **[AL-2055: Resolve appeal membership safely after Party merge or unmerge (P27-F17)](https://github.com/Asymmetric-al/core/issues/2055)**

    **Delivers:** Identity repair preserves origins and restricts only the conflicting member without silently choosing a new outreach intention.

    **Direct blockers:** [AL-2051](https://github.com/Asymmetric-al/core/issues/2051), [AL-610](https://github.com/Asymmetric-al/core/issues/610)

63. **[AL-2056: Close or reopen an appeal while preserving real independent work (P27-F19)](https://github.com/Asymmetric-al/core/issues/2056)**

    **Delivers:** Staff deliberately end coordination with truthful work disposition, then may record late facts or reopen without reviving ended work.

    **Direct blockers:** [AL-2030](https://github.com/Asymmetric-al/core/issues/2030), [AL-2051](https://github.com/Asymmetric-al/core/issues/2051), [AL-2039](https://github.com/Asymmetric-al/core/issues/2039), [AL-2009](https://github.com/Asymmetric-al/core/issues/2009)

64. **[AL-2057: Clear a current assessment deliberately without losing history (P27-P20)](https://github.com/Asymmetric-al/core/issues/2057)**

    **Delivers:** Staff may explicitly save no current stage on the same list, including while paused, with prior assessments retained and a clear Set stage next action.

    **Direct blockers:** [AL-2032](https://github.com/Asymmetric-al/core/issues/2032), [AL-2052](https://github.com/Asymmetric-al/core/issues/2052)

65. **[AL-2058: Change the stage list on the same partnership with an honest destination assessment (P27-P21)](https://github.com/Asymmetric-al/core/issues/2058)**

    **Delivers:** Staff deliberately switch a partnership to another currently eligible approved list, choose a valid target stage or explicit absence, and preserve identity, history and paused context through reliable recovery.

    **Direct blockers:** [AL-2057](https://github.com/Asymmetric-al/core/issues/2057), [AL-2011](https://github.com/Asymmetric-al/core/issues/2011)

66. **[AL-2059: Rehearse Phase 27 migration, disable and restore after real writes (P27-Q01)](https://github.com/Asymmetric-al/core/issues/2059)**

    **Delivers:** Operators can move an admitted P27 deployment forward, interrupt/resume migration, disable new admission and restore compatible state without erasing history, exposing private context or replaying accepted work.

    **Direct blockers:** [AL-2050](https://github.com/Asymmetric-al/core/issues/2050), [AL-2000](https://github.com/Asymmetric-al/core/issues/2000), [AL-2018](https://github.com/Asymmetric-al/core/issues/2018), [AL-2034](https://github.com/Asymmetric-al/core/issues/2034), [AL-2035](https://github.com/Asymmetric-al/core/issues/2035), [AL-2054](https://github.com/Asymmetric-al/core/issues/2054), [AL-2036](https://github.com/Asymmetric-al/core/issues/2036), [AL-2038](https://github.com/Asymmetric-al/core/issues/2038), [AL-2055](https://github.com/Asymmetric-al/core/issues/2055), [AL-2056](https://github.com/Asymmetric-al/core/issues/2056), [AL-2026](https://github.com/Asymmetric-al/core/issues/2026), [AL-2027](https://github.com/Asymmetric-al/core/issues/2027), [AL-2010](https://github.com/Asymmetric-al/core/issues/2010), [AL-2013](https://github.com/Asymmetric-al/core/issues/2013), [AL-2040](https://github.com/Asymmetric-al/core/issues/2040), [AL-2022](https://github.com/Asymmetric-al/core/issues/2022), [AL-2058](https://github.com/Asymmetric-al/core/issues/2058)

67. **[AL-2060: Qualify the admitted workload and exercise Phase 27 operating controls (P27-Q02)](https://github.com/Asymmetric-al/core/issues/2060)**

    **Delivers:** An operator can identify the supported workload and freshness limits, see a real breached source signal, contain only the affected capability and safely reconcile accepted work.

    **Direct blockers:** [AL-2050](https://github.com/Asymmetric-al/core/issues/2050), [AL-2000](https://github.com/Asymmetric-al/core/issues/2000), [AL-2018](https://github.com/Asymmetric-al/core/issues/2018), [AL-2034](https://github.com/Asymmetric-al/core/issues/2034), [AL-2035](https://github.com/Asymmetric-al/core/issues/2035), [AL-2054](https://github.com/Asymmetric-al/core/issues/2054), [AL-2036](https://github.com/Asymmetric-al/core/issues/2036), [AL-2038](https://github.com/Asymmetric-al/core/issues/2038), [AL-2055](https://github.com/Asymmetric-al/core/issues/2055), [AL-2056](https://github.com/Asymmetric-al/core/issues/2056), [AL-2026](https://github.com/Asymmetric-al/core/issues/2026), [AL-2027](https://github.com/Asymmetric-al/core/issues/2027), [AL-2010](https://github.com/Asymmetric-al/core/issues/2010), [AL-2013](https://github.com/Asymmetric-al/core/issues/2013), [AL-2040](https://github.com/Asymmetric-al/core/issues/2040), [AL-2022](https://github.com/Asymmetric-al/core/issues/2022), [AL-2058](https://github.com/Asymmetric-al/core/issues/2058)

68. **[AL-2061: Prove composed user journeys and publish bounded release qualification (P27-Q03)](https://github.com/Asymmetric-al/core/issues/2061)**

    **Delivers:** Representative staff, finance handlers and voluntary missionary contributors can understand and complete the admitted workflow without harmful interpretation; release evidence shows exactly what is specified, implemented, qualified, gated and activated.

    **Direct blockers:** [AL-2059](https://github.com/Asymmetric-al/core/issues/2059), [AL-2060](https://github.com/Asymmetric-al/core/issues/2060)

## Existing-issue reconciliations

The 15 approved scoped predecessor amendments were read back after publication. Known pre-write titles, states, label names and comments were checked. Fourteen have retained pre-write REST metadata and native dependency comparisons; #702 has the bounded recovery evidence described below. This reconciles contracts; it does not complete those issues or settle E7, C-01 or the missing Phase 6 allocation. Exact before/after body SHA-256 receipts and verification times are in [ledger.json](ledger.json). The approved replacement [packet](https://github.com/Asymmetric-al/core/blob/057a1dc43832eeeca2a8856716d6be1d5422e96f/docs/features/donor-development/planning/implementation-proposal/existing-issue-amendments.md) remains the scope authority.

**AL-702 recovery evidence:** The body-only PATCH was accepted before authentication failed on the follow-up read. Fresh readback recovered the accepted result without repeating the write. Its pre-write title, state, label names and comments were retained. Assignees, milestone and locked were compared only from the accepted PATCH response to final readback. No pre-write native dependency snapshot was retained; the body-only request and operation inventory show no dependency mutation targeting #702, and its current blockers were read back. The receipt preserves this limitation rather than claiming a complete pre-write comparison.

| Existing issue                                             | Applied scope                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [AL-492](https://github.com/Asymmetric-al/core/issues/492) | Use one validated acting context; preserve separation and dormant overrides.          |
| [AL-607](https://github.com/Asymmetric-al/core/issues/607) | Make staff-family identity role-aware; preserve nonstaff graph rules.                 |
| [AL-610](https://github.com/Asymmetric-al/core/issues/610) | Preserve staff assignment collisions, provenance, primary and safe unmerge.           |
| [AL-617](https://github.com/Asymmetric-al/core/issues/617) | Require retained-data census and eligible new interaction qualification.              |
| [AL-618](https://github.com/Asymmetric-al/core/issues/618) | Keep generic lastTouchAt separate from Last recorded exchange.                        |
| [AL-620](https://github.com/Asymmetric-al/core/issues/620) | Require atomic local assignment receipts and current-authorized replay.               |
| [AL-622](https://github.com/Asymmetric-al/core/issues/622) | Add the bounded eligible shared-context exception; retain private history protection. |
| [AL-625](https://github.com/Asymmetric-al/core/issues/625) | Consume reconciled staff source commands without changing nonstaff re-role.           |
| [AL-702](https://github.com/Asymmetric-al/core/issues/702) | Keep E7 unresolved and preserve the exact owner-policy qualification gate.            |
| [AL-703](https://github.com/Asymmetric-al/core/issues/703) | Keep E7 unresolved and preserve the exact owner-policy qualification gate.            |
| [AL-763](https://github.com/Asymmetric-al/core/issues/763) | Qualify additive operational intake without treating staging as existing intake.      |
| [AL-764](https://github.com/Asymmetric-al/core/issues/764) | Preserve intake-to-row-to-contribution lineage through one financial commit.          |
| [AL-773](https://github.com/Asymmetric-al/core/issues/773) | Carry forward the same intake/item identity and physical handling.                    |
| [AL-780](https://github.com/Asymmetric-al/core/issues/780) | Qualify authorized independent deposit evidence without new financial policy.         |
| [AL-897](https://github.com/Asymmetric-al/core/issues/897) | Correct preparation ownership to Phase 6; preserve its allocation/proof gap.          |

## Verification and operation receipt

Independent read-only GitHub audit: **PASS**, `2026-10-11T13:02:48.089620+00:00`. It checked the complete native hierarchy and dependency graph, body hashes and limits, actual issue labels/states/assignees, required acceptance references, and the protected #1992 baseline. #1992 title, body, state, labels and all original comments were preserved; only the authorized native child relationships were added.

[audit.json](audit.json) retains compact checks, counts and hashes; [ledger.json](ledger.json) retains confirmed outcomes (including verified no-effect retries) and mutation receipts without duplicating issue bodies or parent comments. These are dated publication observations. They do not prove feature implementation, runtime security, RLS, usability, provider qualification or production readiness.

Run the deterministic local reconstruction check:

```sh
python3 docs/features/donor-development/planning/implementation-publication/verify.py
```

It verifies exact approved-source transformations, coverage counts, issue identity/parents/labels, body-hash formats, receipts, dependency order and graph acyclicity. It performs no network calls and does not assert that GitHub has remained unchanged since the independent audit.
