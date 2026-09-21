> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 08 — Finding receipts and statements

> **Explicitly founder-ratified, 7 September 2026.** Conrad accepted Question08's corrected execution, including the calm overview and C01–C22. Historical proposal/ratification wording below is answered; do not re-ask it. Implementation and release proof remain separate.

> **A selected, 7 September 2026.** The original question below is answered. See the Q08 adversarial review for proposed execution requirements awaiting ratification; do not re-ask navigation A/B.

7 September 2026. **Recommendation only; awaiting founder answer.** Question 07's corrected decision and C01–C22 are explicitly ratified. This is a researched grooming question, not a formal specification, ticket or implementation authorization.

## The one decision

Should **Receipts & statements** have its own clearly named donor navigation destination, or be a clearly named tab/section inside Giving history?

This chooses the permanent navigation parent for an existing required document experience. Both options preserve direct document links, receipt access from each gift and the same current authorized document services. A does not create a second document store; B does not require scrolling transactions to reach documents.

## Why this question now

The session has settled self-service priority, Ministry Updates reading and preferences, personal/represented giving entry, gift-centered history and payment-maintenance behavior. Document retrieval is another routine reason someone returns to the portal. Phase 19 already specifies much of the document experience, so the useful open decision is how easily a donor recognizes its entrance.

This is not an invitation to choose new document-generation, correction, copy, legal-donor or tax rules. Yearly grouping is already settled and must not be re-asked. The earlier global preference-page layout, external newsletter intake and remaining receipt-delivery policy are separate matters; this question does not silently answer them.

## Concrete example

Illustrative donor: Alex returns to download an already available statement for last year. Alex does not remember the date or amount of each gift and is not trying to inspect transaction history. On another visit, Alex opens a particular gift and wants its available receipt.

Both options must handle both tasks. The difference is whether the first task has a named entrance of its own or begins inside Giving history. The example establishes a clear task, not a measured frequency or a claim that every donor has a document for every year.

## Fair alternatives

<!-- prettier-ignore -->
| | A — A dedicated Receipts & statements destination | B — Receipts & statements inside Giving history |
| --- | --- | --- |
| Neutral entry | Choose Receipts & statements from donor navigation | Choose Giving history, then its clearly labeled Receipts & statements tab/section |
| Alex's statement task | The menu names the exact thing Alex came to find | All past-giving resources are collected in one area |
| Individual-gift task | Open the gift and use its authorized receipt link, as Q05 requires | The same gift-level receipt link remains available |
| Strongest benefit | Easy recognition for document-focused return visits and clear help instructions from staff | A shorter main menu and one familiar home for past giving |
| Main cost | One additional navigation destination; the overall menu must remain calm and readable | More navigation from an ordinary portal entry; some donors may not initially think of History when seeking a statement |
| Mobile | A readable menu destination using existing Maia navigation; no requirement for another cramped bottom-bar icon | A visible, accessible document tab/section near the top of History; no hidden overflow download action or forced transaction scrolling |
| Direct link | Opens the exact permitted document view through safe authentication/return | Also opens that exact document view directly; it does not require a detour through the History tab |

**A is recommended.** The specific label communicates the task more clearly than a generic Documents label and helps occasional visitors and staff describe one dependable destination. It can coexist with gift-level receipt links without duplicating records, logic or actions. A direct shortcut can serve either option, so shortcuts are not a third alternative or evidence that one option always takes fewer clicks.

B is credible, especially if keeping the main menu very small is the overriding concern. Its strongest version has a conspicuous, directly addressable document view. It should not be presented as a deliberately buried menu merely to make A win.

This recommendation is a product judgment based on the founder's ease/clarity priority and current documented patterns. No comparative Asym donor usability study or support-volume reduction is claimed. The choice does not fix URL names, every breakpoint, initial year selection or a new global navigation redesign.

## Current product evidence

<!-- prettier-ignore -->
| Primary source | Documented journey | Classification and limits |
| --- | --- | --- |
| [Fundraise Up donor-portal experience](https://fundraiseup.com/docs/donor-portal-experience/) | Receipts is a desktop sidebar/mobile-menu destination with individual and annual receipts; history can also link to receipts | **Useful precedent for A.** Do not import its automatic receipt updates, bulk ZIP feature, issuance settings, timing or identity policies as Asym contracts. |
| [Church Center giving information](https://help.planningcenter.com/en/140951-manage-your-giving-information.html), current September 3 guide | My giving has Statements separately from Donation history; donors choose a year and view/download available statements | **Useful precedent for document discoverability.** This is a tab inside My giving, not proof of a top-level app Statements menu. Its receipt-email and payment policies are not adopted. |
| [Blackbaud giving statements](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/rcptmgr-giving-statements.html) | Donors use Giving history, then Email statement | **Useful precedent for B's grouping.** Blackbaud calls these informational rather than official tax documents. Its email-generation flow is not Asym's exact-current artifact/download authority. |
| [Givebutter end-of-year summaries](https://help.givebutter.com/en/articles/5860605-how-to-send-end-of-year-giving-summaries), June 11 guide | Staff distribute a summary link/PDF; donor links support viewing, printing and saving | **Useful precedent for direct entry independent of the menu.** It does not establish a donor navigation hierarchy. Manual tagging for repeat-send avoidance and arbitrary live-data tests are not Asym patterns to copy. |

The researched sources demonstrate that both entry arrangements are real, workable patterns. They do not prove one universal winner or justify new document behavior. Unverified provider retention statistics and dated processing limits are omitted.

## Inherited requirements common to A and B

1. **Use the same official document owners.** Phase 7 owns official receipt facts; Phase 18 owns generated artifacts/currentness/access; Phase 19 owns statement operations. Portal reads/downloads do not generate, reissue or reconstruct documents from current gift/profile fields.
2. **Keep Phase 19's yearly organization for annual documents.** One calm yearly group; official documents first; optional **Support overview — Not a tax document** second when qualified. This does not prescribe the entire per-gift receipt layout. Do not change the official/informational distinction in this navigation decision.
3. **Keep exact-current access and help.** Repeated authorized view/download/local print is quiet and unmetered. List, metadata, byte/range and current head/access checks still apply. Send another copy is a separate deliberate outbound operation; browsing/download creates no issuance, delivery or read claim. Contextual help routes through a permitted owning action or safe help path rather than asking the donor to pick a technical repair operation. Phase 19's detailed staff help panel is not automatically a donor capability.
4. **Keep receipt links with gifts.** Q05's gift-centered detail retains available current receipts and truthful unavailable/help behavior. The dedicated view and a gift link resolve the same logical artifact. One document resource can have several entry links without two sources of truth.
5. **Do not widen or obstruct authority through navigation.** Personal/represented context follows R04 and exact document grants. A document-authorized representative must not need broader transaction-history permission merely because B is nested under History. A must not reveal unauthorized names, years or document counts to make the menu look populated.
6. **Preserve source facts across Sites and currencies.** Use the organization's unified portal context and document-owned subject/year/coverage. History's ministry, status, amount or date filters must not silently determine document eligibility or hide otherwise authorized documents; its loaded rows are not the document inventory. A document year choice uses document-owner semantics. A browser filter or current profile edit does not rewrite issued facts. Household/shared email, soft credit and imported rows do not automatically produce documents or access.
7. **Make unavailable states truthful.** No documents, not yet available, unavailable/currently blocked and a failed load are different. Show only safe owner-approved explanations and help. Do not imply every year must have a statement, display a fake Download button or claim a missing record has zero giving. No superseded-version picker is added.
8. **Keep the donor surface quiet.** No staff run controls, copy inventory, access counter, provider errors, retention settings, document repair console or custom PDF viewer. No unchosen bulk ZIP download, annual reminder, badge or receipt-email preference is created by adding a navigation entry.
9. **Preserve Maia and mobile accessibility.** Exact base-maia/Base UI and shared semantic tokens; readable labels, current location, keyboard/focus, long translations and usable touch targets. A dedicated destination can live in the normal mobile menu; the choice does not force every destination into a bottom bar. B's tab remains visible and keyboard/direct-link accessible.
10. **Use one implementation path.** Both consume the same source projections/actions and shared document presentation. Keep business access in packages/api and proper role-safe data boundaries. Route placement must not force unrelated finance data to load or create a second receipt renderer.

These are **Durable patterns** because they preserve ratified ownership, integrity and authorization. Current navigation is a **Useful precedent** for shell integration, not authority to retain a weak hierarchy. Current dynamic text receipt/statement handlers are **Implementation accidents or temporary bridges** requiring owner adoption, not acceptable final document semantics.

## Repository and dependency evidence

Current remote develop/research worktree is unchanged at `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`.

- [Phase 19](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md):258–264 fixes donor yearly grouping and exact-current actions, not navigation parent. :866–909 fixes shared help, repeated current access and separate copy fulfillment.
- [Phase 18](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-18-receipt-pdf-template-system.md):234–258 includes staff Documents operations. Its technical/repair workspace is not a donor feature merely because the donor uses a similar label.
- [Ratified Q05](phase25-r05-adversarial-review.md) preserves current receipt access from a recognizable gift and no generation or financial effect from a read.
- [#1023](https://github.com/Asymmetric-al/core/issues/1023) is open and explicitly owns getDonorYearDocuments, repeated exact-current access, per-request authorization/current-head races and real source/PostgreSQL/browser proof. Its body lists #997/#950; neither a menu item nor the old route satisfies it.
- [#1017](https://github.com/Asymmetric-al/core/issues/1017) retains official legal-donor/subject separation; [#1024](https://github.com/Asymmetric-al/core/issues/1024) owns bounded outbound-copy fulfillment and [#1025](https://github.com/Asymmetric-al/core/issues/1025) owns contextual Help with separate capabilities. This question does not duplicate or change those authorities.
- [PR872](https://github.com/Asymmetric-al/core/pull/872) is already merged, July 27, source head `b886c2eb2fe4c98cc8723a232d860138c86b10c2`. Old ticket wording referring to its unresolved acceptance gate must be reconciled; merge does not prove the dependent implementation is complete.
- Current [DonorSubNav](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/features/donor/components/DonorSubNav.tsx) and [History content](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/app/%28dashboard%29/donor-dashboard/history/page-content.tsx) expose history and receipt/statement links. They do not prove a complete protected PDF/document center. Current handlers still construct text from mutable data; prior Q05 evidence documents the limits.

This question was checked against governing source, existing decisions and current official product journeys. No new database/provider/browser test was necessary to decide its navigation tradeoff, and none was run. Existing five setup-change files were preserved. The implementation still needs its owning authorization/currentness/concurrency and accessible end-to-end proof; no prior mock, migration or receipt route observation is presented as new complete evidence.

## Founder decision

**Recommend A — A dedicated Receipts & statements destination.** B remains a fair alternative: a clearly labeled, directly addressable document tab inside Giving history. Both preserve yearly organization, exact current authorized documents, gift-level receipt links, direct entry and the same services.

**Where should donors find Receipts & statements in the portal navigation?**
