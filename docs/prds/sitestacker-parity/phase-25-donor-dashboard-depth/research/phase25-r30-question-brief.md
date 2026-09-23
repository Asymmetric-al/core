> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Scope accepted, 9 September 2026:** Conrad accepted Q30A, the assembled Phase25 donor scope, and requested a final implementation-congruence audit. Earlier unanswered wording is historical. Source, runtime and release qualification remain separate.

# Question 30 — Is the essential Phase 25 donor scope complete?

9 September 2026. **Q29 is fully ratified**, including all corrected DAF/IRA/QCD requirements, Maia defaults, source safeguards and monitoring/proof obligations. **Q30 is researched and unanswered.** This is a concrete scope-completeness decision. It does not certify implementation, close unresolved source contracts or authorize formal specification/ticket publication.

## The one decision

**Does the assembled scope cover the essential donor self-service jobs for Phase 25, or is one specific essential donor job still missing?**

<!-- prettier-ignore -->
| Option | Meaning | Benefit and tradeoff |
| --- | --- | --- |
| **A — Confirm this donor scope. Recommended.** | Keep the ratified journeys and their required safeguards as the Phase 25 scope. Complete their cross-journey design, source-contract reconciliation and proof requirements together. | Focuses effort on making the whole experience coherent. Does not add another feature family merely because a later-phase socket or old prototype exists. It still requires resolving the named gaps below. |
| **B — Add one essential missing donor journey first.** | Identify a concrete donor situation and the outcome the current map cannot support. Research and review that one scope addition before closing this checkpoint. | Preserves room for a real ministry need not captured in the sources. It expands scope only after the task, owner and strongest simpler alternative are established; it does not automatically adopt a new module. |

Both choices preserve Q01–Q29. Neither waives source, privacy, financial or accessibility obligations. A does not make the next step `/to-prd`, `/to-issues`, runtime implementation or GitHub publication; those transitions retain their explicit session boundaries. B is not a request for invented ministry workflows: one actual missing task is enough.

## The donor journey assembled so far

This map describes **ratified intent**, not shipped features. Question references point to the full reviews in the [grooming notebook](../decision-log.md).

<!-- prettier-ignore -->
| Donor job | Settled experience | Decision coverage |
| --- | --- | --- |
| Arrive, sign in and return to the intended task | One organization portal; personal giving on neutral entry; separately authorized represented giving; email link plus code and the reviewed social direction. | Q01/Q04/Q11/Q14, inherited P4/P24. Native Auth G01 remains open. |
| Know what matters now | Calm Home, small current-action section, truthful annual monetary summary, warm empty-history experience and ministry connection. | Q12/Q19/Q23/Q24. |
| Read ministry updates | One authorized reading list, optional ministry filter, direct links, independent hide-in-portal and email controls. | Q01/Q02/Q07/Q24. |
| Request a missionary newsletter | One bounded request reaches the missionary. It does not enroll the donor in an external list or let this portal manage that newsletter subscription. | Q25 and its Email Studio/P6/Resend handoff safeguards. |
| Find a past gift or understand a change | One recognizable gift with its permitted allocations/corrections; all available qualified history, source filtering and governed CSV. | Q05/Q10/Q20. |
| Manage recurring giving | Current arrangements first; focused compatible edits; clear skip/pause/resume/cancel; fresh authorization for restart. | Q09/Q15/Q18/Q22 and P16 core commands. |
| Keep payment methods working | Guided replacement for exact uses; optional preference during Add; deliberate eligible recovery after the original repair completes. | Q03/Q06/Q16 and inherited Wallet Remove constraints. |
| Get the right document | Exact current receipts/statements and independent copy/help paths; document availability and financial history stay distinct. | Q05/Q08/Q13/Q20/Q29. |
| Choose communications | One calm preference overview, source-scoped changes and eligible routine recurring-receipt quieting; bounded notification center. | Q07/Q13/Q17/Q21. |
| Keep contact information current | Guided email change and one current personal mailing address, with explicit future-use effects and historical document preservation. Ordinary name/phone ownership needs the execution audit below. | Q11/Q27, P4/P9/P19 source owners. |
| See an uncommon commitment or match | Pledges appear only when relevant, with non-executing request/dispute safeguards; employer matches show only admitted recorded progress and received/corrected facts. | Q26/Q28. |
| Understand DAF and IRA gifts | Quiet received-DAF awareness, no new personal deduction/receipt expectation; IRA/QCD intent, personal gift and separate acknowledgment remain distinct. | Fully ratified Q29. |
| Recover or ask for help | Existing permitted source details and organization channels explain missing/incorrect records, unavailable documents or failed actions; no invented financial success or support state. | Q05/Q06/Q08/Q12/Q17/Q26/Q29, inherited P19/P26 boundaries. |

Illustrative Maria journey: she follows a recurring-gift link, signs in, returns to the correct arrangement, replaces a payment method, sees the actual result, then finds her current acknowledgment and changes receipt-email preferences. Daniel can instead arrive for his IRA acknowledgment without seeing DAF or pledge modules. These are synthetic examples of already-selected tasks. The work now is to ensure context, wording, rights, dates, failures and navigation remain consistent across every handoff.

## Why A is the best recommendation

The original [Phase 25 roadmap](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md#L2833-L2891) calls for recurring control, wallet completion, canonical documents, giving history/impact/export, preferences and account access. Its initially open household, imported-history and restricted-name questions now have ratified source-qualified directions. All three independent frontier reviews found no stronger unmade product choice than this scope checkpoint.

Current [Fundraise Up supporter guidance](https://fundraiseup.com/docs/donor-portal-guide/) groups recurring management, payment methods, receipts, contact details and help into the same common donor tasks. That is useful comparative coverage evidence. Its cancellation restrictions, authentication lifetime, default profile propagation and account model are not imported into Core. A vendor's longer feature list does not establish an Asym requirement.

[GOV.UK's service-design guidance](https://www.gov.uk/service-manual/service-standard/point-2-solve-a-whole-problem), updated January 2026, favors coherent whole-user journeys, reuse and an appropriately bounded service. [W3C's complete-process conformance guidance](https://www.w3.org/WAI/WCAG22/Understanding/conformance.html#complete-processes) supports testing the full path, including human evaluation. These support integration of the selected journeys, not a claim that the design already passed or that public-sector guidance binds Core.

The recommendation is a product/engineering judgment from the roadmap, ratified record and primary comparisons. No Asym donor interview, conversion study or retention effect was measured. Older roadmap percentages and vendor marketing statistics are not evidence that this scope is successful. Actual user testing remains required.

## Remaining work that A does not erase

<!-- prettier-ignore -->
| Required closure | Exact owner and next evidence |
| --- | --- |
| Auth and safe returns | Q14 G01 remains an unresolved native Auth contract. P4/Auth owners must establish supported identity/linking/session/return behavior and qualify the selected provider flows. A scope answer is not proof of technical feasibility. |
| Personal name and phone | P9 owns plain contact/subtype writes and atomic audit/activity; P19 distinguishes display/contact changes from document addressee changes. Audit preferred/display/legal/receipt/billing meanings, international names/mononyms, phone representation, clear/read-only states and exact side effects. The current first-token/rest name splitter and generic settings PATCH do not establish the permanent model. No new SMS verification, contact book or tax-name shortcut follows. |
| Wallet Remove and recovery | Complete exact-use inventory, provider detach/reconciliation, stop/retry boundaries and unknown-result handling under P16 and Q03/Q06/Q16. A hidden button or optimistic toast cannot substitute for actual safe outcomes. |
| Money, source reads and document adoption | Carry all reached P7/P13/P14/P18/P19 amendments, including Q29 source-case/DAF exposure and generic receipt-route convergence. Distinguish specified read contracts, existing catalog code, active qualification and proven donor behavior. |
| Context and navigation | One coherent route/subject map must preserve personal versus represented giving, issuer, task return, period, filter, scroll/focus, unavailable data and zero-artifact composition across all selected journeys. |
| Preferences, notifications and finite requests | Reconcile the selected independent topic/contact/receipt scopes and source dispatch fences. Keep newsletter requests, pledge disputes and document-copy requests in their exact owners; do not silently generalize them into a new inbox or request engine. |
| Complete proof and traceability | Reconcile terms, statuses, amounts, periods and defaults across the notebook/glossary and reached owner amendments. At later authorized canonical work, trace them into OpenSpec/design/tasks/issues and the already required SQL/API/provider/renderer/browser/accessibility/comprehension evidence. |

Supporting source details: [P9 contact write and subtype ownership](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md#L555-L583), [P19 recipient/destination effects](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md#L625-L640), and [current settings predecessor](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/donor-portal/settings-patch.ts#L3-L55).

The remaining source/field audit can expose a real policy conflict. If it does, bring that precise conflict back with evidence; do not use “scope complete” to silently invent authority. No new material policy fork was established by this bounded review. Several old unchecked notebook rows combine settled choices with outstanding proof; they are an execution inventory, not an instruction to keep asking cosmetic questions.

## Adjacent features deliberately not assumed

- **Portal conversations:** [Phase 26](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md#L2895-L2969) explicitly owns inbound Support Hub work and asks whether a My messages portal view should exist. Existing contextual help does not add that inbox. The current [public FAQ messaging promise](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/app/%28public%29/%28hero%29/faq/faq-client.tsx#L93-L98) needs copy/capability reconciliation; it is not authority to build messaging in Phase 25.
- **Tribute walls or broad household recognition:** [P14 J.3–J.4](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md#L1177-L1181) reserves possible later portal expansion, not mandatory modules. Q28/Q29 intentionally admit only their own special views. A concrete new audience/task would need explicit research; church-member own-portal exposure remains prohibited.
- **Campaign management and currency conversion:** My Campaigns remains a Phase 36 socket; converted comparisons remain Phase 33 reporting. Existing ministry connection and real giving do not require those products. No placeholder UI.
- **General privacy-request case management:** [Phase 38 privacy-request authority](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md#L3955-L3959) remains distinct from an ordinary donor download or contact edit. That boundary does not waive privacy duties or remove appropriate existing help.

The strongest argument for B is a specific donor task these paths cannot satisfy, not a desire to copy a competitor or exhaust every reserved noun. Selecting B should identify the donor, trigger and desired outcome; the next review can then test necessity and ownership without reopening unrelated ratifications.

## Record and verification status

Q29 ratification is recorded in its review/evidence/question status notices, notebook and glossary, with the historical ZIP preserved. Seventeen prior bundles, the current source HEAD/four references and the five existing setup paths/reverse-patch check are verified in the local Q30 validation record. No new runtime test, donor study, source/ADR/OpenSpec edit, package/provider/database action or GitHub publication was performed for this scope question.

Q30 remains unanswered. Recommendation A confirms the assembled donor scope while retaining the concrete source, execution and proof work above. No Q31 feature is invented in advance.
