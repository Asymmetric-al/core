> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Phase 25 R05 — How donors browse Giving history

> **Historical question brief; answered 7 September2026.** Conrad chose to keep each gift together. The current [Question05 adversarial review](phase25-r05-adversarial-review.md) supersedes this pre-answer recommendation. Its corrected wording and C01–C20 were explicitly ratified on7September. Do not re-ask gift-centered versus event-centered history.

Research and founder question, 7 September 2026. **Recommendation only; awaiting the founder's answer.** This is a grooming record, not a PRD, formal specification, implementation plan or publication authorization.

> **Question framing corrected after founder feedback, 7 September:** The current decision has two alternatives: **A, keep each gift and its later changes together (recommended)**, or **B, list meaningful financial movements as separate dated activity linked to the gift**. An annual summary can accompany either; it is no longer a competing option. The three-approach comparison below is retained as research history. The question does not bundle default year, exact layout, pagination widgets or an extra activity tab into founder approval. Source-owned facts and required completeness/access remain constraints; detailed presentation choices remain proposals. No product answer has been received.

R01–R04 and their accepted safeguards remain settled. R04's latest acceptance covers personal-first neutral entry with a conditional switch to giving the person is separately authorized to manage. Targeted links and active journeys retain their intended context. No new access is implied.

## Adversarial check

### What could go wrong with this answer?

For accepted R04, a presentation switch could accidentally become an access grant, reset a targeted journey, or leave another person's data on screen. Keep source authorization, context-bound requests and stale-response rejection; navigation alone grants nothing.

### What hidden assumptions are we making?

Not everyone has personal giving. A representative-only user with one permitted context goes directly there; several represented contexts need a clear choice. Do not create an empty personal donor record to satisfy navigation.

### How does this affect the whole product?

Personal and represented giving remain separate across history, recurring arrangements and documents. Login identity remains the same human. The switch does not change Ministry Updates, consent, Site, legal donor or payment authorization.

### How does this affect the end-user experience?

Most donors avoid a chooser. People with additional responsibilities can see whose giving they are viewing and switch deliberately. A link to a particular permitted task returns them to that task after sign-in.

### Does this follow modern best practices?

It reduces unnecessary choices while keeping sensitive context visible. This is a product judgment supported by the established identity/access boundaries, not a claim of measured Asym usability or a universally optimal navigation pattern.

### Does this fit Asym’s existing repo and product direction?

Yes: Phases 4/9 govern identity and relationships, Phases 3/10/12 govern scope, Phase 16 separates representative and collection authority, Phase 19 governs document access, and Phase 24 supplies the unified brand/host. Existing runtime is not proof those contracts are fully implemented.

### Should we adjust the recommendation?

No further material amendment to R04 is needed from this check. Record its direction and reviewed safeguards as accepted. The next question concerns history presentation inside the already permitted context.

## The unresolved decision

**What should organize the default Giving history view?**

The open choice is the donor's starting point: recognizable gifts, dated financial movements, or an annual overview. It does not redefine what a contribution is, exclude inconvenient outcomes, create new access, or change official documents.

Illustrative situation, not observed donor research: a donor makes one **$100 USD gift**, allocated **$60 to one permitted ministry and $40 to another**. Later, the source records a **$20 partial refund**. The donor wants to recognize the gift, understand what changed and find its current authorized receipt. Another bank gift is still processing; a recorded payment failed. Those outcomes must remain findable without making them all look like received giving.

<!-- prettier-ignore -->
| Option | What the donor encounters | Strength | Cost and risk |
| --- | --- | --- | --- |
| **A. Gifts first — recommended** | A calm list of recognizable, source-linked gifts and recorded giving outcomes. Current status is visible; opening an entry explains its allocations, later changes and available documents. Small summaries and filters support the list. | Directly serves finding a gift, checking its outcome and retrieving its receipt. A split and its refund remain understandable together. | A new refund on an older gift needs a clear finding path; important changes cannot disappear inside an old detail view. |
| **B. Financial activity first** | A donor-readable dated list of gifts, refunds and reversals, with each movement linked to the original gift. | Strong for reconciling what appeared in a bank account and spotting recent changes to older gifts. | One gift can produce several entries. Donors must connect movements and distinguish activity count from gifts received. This remains a viable alternative, not a raw accounting ledger. |
| **C. Year and summary first** | An annual giving overview with direct routes into exact gifts and available statements. | Strong for annual review and year-end document tasks. | Adds a step to checking a recent gift; a year boundary can obscure December activity. The existing Documents surface already serves much of the annual retrieval need. |

## Recommended direction and execution

Recommend **A** because the primary self-service job is usually to recognize and explain a particular gift. This is an inference and product judgment, not a measured claim about the distribution of Asym donor visits. It remains reversible through presentation changes if task-based research contradicts it; the underlying source contracts need not change.

For the example, the list can show **$100 USD · Partially refunded · $20 USD refunded**, using only the source-confirmed state. Details retain the $60/$40 allocations, the refund's actual date/state and the existing authorized document. Do not infer which allocation was reduced, overwrite the original amount with $80, or present $80 as deductible giving. Those meanings come from the source, not subtraction in the browser.

Proposed execution qualifications accompany A:

1. **Recognizable entries, exact source relationships.** Group only from the owning contribution/payment/recurring relationships. A retry is not another gift; an unposted recurring occurrence is not a contribution. A checkout containing separate disclosed payment groups is not silently merged into one charge or legal gift. This is a read presentation over existing owners, not a new financial root or flat legacy donations compatibility view.
2. **Important status visible before opening.** Use plain text for processing, failure, partial/full refund or reversal according to source evidence. Details explain changes and uncertainty. Do not collapse refunded into failed, treat provider submission as settlement, or hide recorded failures to make the list cleaner. Future scheduled commitments remain in their owning recurring view rather than filling history with gifts not yet attempted or received.
3. **Quiet default, explicit scope.** Recommend a bounded first page of newest source-dated entries across available history, with clear period/ministry/status controls and explicit continuation. This is a proposed default, not an inherited contract or a universal vendor standard. Preserve a targeted link's valid filter. Avoid a hard-coded five-year window or a current-year-only list that appears empty in January. Label any current-year summary independently from an all-years list; do not present a partial page sum as the total for the period.
4. **Older changes remain discoverable.** At minimum, permit a source-backed refunds/reversals filter across available history and ordering by the relevant change date when that filter is selected. Preserve the original giving date in every entry. This uses existing change evidence; it does not introduce an unread ledger, personalized ranking, second event store or a notification product. A failed load must not imply that no changes exist.
5. **Honest allocations and visibility.** Under a ministry filter, distinguish the matched allocation from the whole gift: for example, $60 to this ministry, from a $100 gift, only if the viewer is authorized to see both amounts. Do not leak hidden sibling allocations, totals, names, filter options or result counts. Source-authorized redacted presentation takes precedence over a preferred layout.
6. **One history within the permitted organization/context.** Include online, offline and qualified imported records across its Sites from their owning sources, preserving provenance and known coverage limitations. Never merge by shared email or approximate amount/date. A missing-record help path must not imply no gift exists. Site filtering does not change the unified donor brand or grant access to another legal donor's history.
7. **Correct money and dates.** Keep original currencies and checked minor units. Display and total each currency separately without unexplained conversion. Received giving, commitment amounts, recognition and deductible amounts remain distinct. Use owner-defined effective/giving dates for official interpretation and explicitly identified timestamps for payment/refund events; changing browser time zone must not rewrite a gift's tax year.
8. **Documents come from their owners.** Show authorized current receipt/statement availability, corrections and truthful unavailable/help states. Success does not guarantee a receipt. A download does not generate, reissue, send or rewrite an artifact. Phase 19's existing help families and Phase 18's current-access rules remain authoritative.
9. **Exact Maia/Base UI, restrained interaction.** Reuse the established shared components and semantic tokens. On narrow screens keep amount, date, recipient-safe label and state readable without a wide table. Use a genuine accessible details control, keyboard/focus support and text status, not color alone. Restore filters and place after returning from details; independent loading/errors should not replace the whole page unnecessarily. Prefer explicit loading of more entries to endless automatic scrolling. Do not freeze a new component library, chart, drawer or route topology into this decision.
10. **Keep adjacent jobs reachable.** Recurring management and Documents retain their own direct access and source services. Ministry Updates remains prominent and directly linkable under R01/R02; history does not become a second updates feed or an impact-claims generator. CSV remains a governed source export with honest scope, not an export of the currently loaded browser slice.

These are proposed execution requirements for the answer, not claimed implemented features. The exact screen composition and information labels need accessible task-based validation; the founder is choosing the primary information hierarchy.

## Repository evidence and ownership

Current `develop` was checked on 7 September at **7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd**. Existing Phase 13/16/19 source excerpts were cross-checked against the grooming research; live owner issue bodies and native blockers were inspected. R05 does not depend on a new Stripe execution capability and no financial action or provider-contract test was run.

<!-- prettier-ignore -->
| Repository fact | Consequence | Classification |
| --- | --- | --- |
| Canonical donation-lifecycle requires processing and failed recorded payments to remain visible, while collection, contribution posting and receipts have separate evidence. | History includes truthful giving outcomes without counting an unposted attempt as received giving. | **Durable pattern:** explains uncertainty while preserving financial meaning. |
| A gift can have multiple stable allocation lines; separately disclosed payment groups remain distinct. Phase 13 owns the contribution header, lines and append-only postings. | Presentation cannot merge independent charge boundaries or treat allocations/retries as new gifts. | **Durable pattern:** identity follows the business fact. |
| Canonical history/refund requirements preserve original evidence and source-confirmed full/partial changes. Portal and Mission Control consume the same correction truth. | No portal-specific ledger or browser-computed financial status. | **Durable pattern:** one authority for amounts and history. |
| Phase 7 requires a clearly labeled running yearly total, separate from an official statement. Phase 19 governs yearly document grouping and current protected artifacts. | A yearly summary is compatible with A; it does not settle the history landing hierarchy. | **Durable pattern:** official evidence is distinguished from a helpful summary. |
| Current history uses a collection/hook fetching `/api/donor/portal`; the snapshot reads at most 250 legacy donations. | This is the actual history data path, not merely an unrelated overview endpoint. Loading some real data does not prove complete history or totals. | **Temporary bridge:** useful route-backed integration, insufficient permanent data contract. |
| The current mapping drops currency, assigns `Stripe` as last-four display, collapses refunded into Failed and constructs a receipt URL for each donation. | These cannot become the Phase 25 truth or availability model. | **Conflict with first principles:** misleading money, method and document meaning. |
| The screen filters/sums loaded rows, counts succeeded rows as receipts, defaults to the browser's current year and offers five years. Some details/recurring menu actions are inert. | Replace unsupported assumptions through the source-owned history adoption; do not preserve them for superficial consistency. | **Implementation accident** for arbitrary limits/inert actions; **Conflict with first principles** for complete-total/receipt claims from an incomplete slice. |
| Current client-only page loading documents a TanStack server-rendering constraint and includes a skeleton. | Do not remove it merely to pursue a theoretical rendering preference. Re-evaluate against the final data path and actual supported runtime. | **Temporary bridge:** defensive handling of a documented integration constraint. |

Exact source references:

- [Canonical processing/failure rules, lines 44–81](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/specs/donation-lifecycle/spec.md#L44-L81); [allocation/payment groups, lines 83–147](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/specs/donation-lifecycle/spec.md#L83-L147); [refund truth, lines 217–235](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/specs/donation-lifecycle/spec.md#L217-L235); [shared portal truth, lines 254–264](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/specs/donation-lifecycle/spec.md#L254-L264).
- [Actual history collection mapping, lines 126–175](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/collections/donor-history.ts#L126-L175); [hook](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/hooks/donor-history.ts); [snapshot cap, lines 194–215](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/donor-portal/service.ts#L194-L215); [snapshot model](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/donor-portal/model.ts).
- [Current history page](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/app/%28dashboard%29/donor-dashboard/history/page-content.tsx), particularly 83–93, 541–584 and 605–633; [current columns](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/app/%28dashboard%29/donor-dashboard/history/columns.tsx#L222-L227).
- Owner prose: Phase 13 PRD 72/781 and 1700–1706; Phase 16 PRD 2155–2169; Phase 7 PRD 176–180; Phase 19 PRD 258–264 and 881–885. These line references refer to the source snapshots indexed in [the research record](phase25-research.md), not a claim that all work is deployed.

No donor-wide owner rule was found fixing default period, newest-first ordering, gift-versus-event hierarchy or annual-overview precedence. Phase 16's calendar-month default belongs to missionary support projections; Phase 19's yearly grouping belongs to statements. Neither decides R05 by analogy.

## Existing dependency work

<!-- prettier-ignore -->
| Existing issue | Live observation on 7 September | R05 implication |
| --- | --- | --- |
| [#695 — Contribution ledger core + atomic donations cutover](https://github.com/Asymmetric-al/core/issues/695) | OPEN, `status:blocked`; body names #692 and several owner predecessors; native `blocked_by` contains #1511 only. | Contribution identity and cutover already have an owner. Do not create a competing Phase 25 ledger ticket. |
| [#697 — Five-axis contribution lifecycle + locked transition machine](https://github.com/Asymmetric-al/core/issues/697) | OPEN, `status:blocked`; body names #695/#694 and identity/receipt/permission predecessors; native blockers empty. | Status/correction truth is predecessor work, not portal-local labeling logic. |
| [#811 — Donor recurring detail and durable confirmation shell](https://github.com/Asymmetric-al/core/issues/811) | OPEN, `status:blocked`; body names #805–#810; native blockers empty. | Reuse source-owned recurring detail/history; do not duplicate its lifecycle journal. |
| [#1511 — Checked Money in unchanged USD checkout tracer](https://github.com/Asymmetric-al/core/issues/1511) | OPEN, `status:blocked`; body names #1510/#480 and checked amount/currency/exponent. | A formatted currency label alone does not prove correct money contracts. |
| [#1023 — Phase 19 portal statement adoption](https://github.com/Asymmetric-al/core/issues/1023) | Existing owner work and earlier evidence retained in this session. | Portal document retrieval and statements already have a predecessor; refresh exact state before future publication. |

An empty native blocker list is not readiness evidence when the body and status disagree. This research records that conflict; it did not edit labels, blockers, issues or pull requests. Older #709 concerns recurring-management presentation and contains superseded shortcuts; it does not settle global Giving history.

## Current primary product evidence

Official documentation was retrieved on 7 September 2026. These are documented vendor journeys, not hands-on runtime certification or comparative usability measurements.

<!-- prettier-ignore -->
| Evidence | What it supports | Limit and classification |
| --- | --- | --- |
| [Fundraise Up supporter experience](https://fundraiseup.com/docs/donor-portal-experience/) | Chronological donation history, details/receipts and grouped multiple-designation payments with expandable allocations. | **Useful precedent** for recognition before detail. Do not import its cancellation/reactivation, pause limits or automatic receipt behavior. |
| [Blackbaud portal FAQs](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-portal-faqs.html) | A split gift appears in one row with its funds together. Missing records can result from batch approval or duplicate records. | **Useful precedent** for grouping; **Durable pattern** for truthful missing-record help. No claim that all Blackbaud pledge/history pages agree. |
| [Church Center giving guide](https://help.planningcenter.com/en/140951-manage-your-giving-information.html), published 3 September 2026 | Separate history and statements, year/fund filters and history export; an organization help path when statements are unavailable. | **Useful precedent** for task-oriented navigation. It does not establish the default year, pagination or refund presentation. |
| [Church Center My Giving redesign](https://www.planningcenter.com/changelog/giving/improved-refreshed-my-giving-experience-in-church-center) | A quick summary supports the history list; broader current/prior-year and planned-giving context belongs in overview. | **Useful precedent** for a quiet supporting summary. Vendor claims of improved ease are not Asym outcomes. |
| [Givebutter personal profile](https://help.givebutter.com/en/articles/3670204-how-to-manage-your-personal-user-profile) | Its documented history omits some one-time/guest transactions and exposes previously emailed receipts. | **Durable lesson**: disclose coverage. Its exclusions are a vendor limitation, not acceptable inherited Asym scope. |
| [Fundraise Up external donations](https://fundraiseup.com/docs/offline-donations/) | Imported records join a date-sorted history; supplied historical receipt links may require a truthful unavailable/help state. | **Useful precedent** for one history across channels. Do not adopt its currency conversion, email-based matching or flattened imported recurring meaning. |
| [PayPal refund tracking](https://www.paypal.com/us/cshelp/article/where-is-my-refund-help130) | Refund filters and distinct progress states help explain money that has not yet arrived. | **Durable pattern** for honest outcome language; eligible tracker features/timing are provider-specific and not promised by Asym. |

The evidence favors A's recognition-and-detail pattern but cannot prove it optimal for Asym. No retention percentage, dated provider limit or claimed conversion uplift is used to justify the decision.

## What must be proved before release

This question does not declare Phase 25 specification-ready. Later authorized design/implementation must provide:

1. **Donor comprehension:** on mobile and desktop, find a recent and old gift; explain the $100/$60/$40/$20 example without double-counting; distinguish a processing/failed occurrence from received giving; find the current permitted document.
2. **Real PostgreSQL authorization:** different Tenant, donor/represented context, revoked grant and hidden allocation cases deny rows, totals, filters, exports and artifact access consistently. A permitted filter never expands scope; stale responses cannot cross a context switch.
3. **Canonical financial outcomes:** contribution/attempt/refund corrections agree with Mission Control; multi-currency/minor-unit and zero-decimal cases preserve exact source values. A ministry-filter result never counts the whole gift toward each ministry.
4. **History completeness and continuation:** more records than one page and the current 250-record cap, ties, corrections between pages, offline/imported records and January/year-boundary cases remain findable without false totals, silent omissions or duplicates.
5. **Document independence:** success without an issued artifact, qualified import without a receipt, superseded/unavailable bytes and revoked access produce truthful safe states. Download does not issue or mutate official truth.
6. **Accessible end-to-end behavior:** keyboard, screen reader, zoom/reflow, long translated labels/names, reduced motion and low-bandwidth recovery preserve context and task completion. Colors/icons are not the sole status explanation; there is no mandatory hover or inaccessible wide table.
7. **Safe adoption:** one owner-backed read path replaces the capped legacy mapping, with explicit activation dependencies and containment when required sources are unavailable. No silent fallback to fabricated methods, flattened refunds, browser totals or success-count receipts. Tests that return seed data in `NODE_ENV=test` do not prove production wiring.

These are prospective proof obligations, not tests run in this turn. No Core PostgreSQL/RLS, browser donor journey, hosted deployment, vendor runtime or provider financial operation was verified here. No new ADR, glossary authority, OpenSpec change, ticket or code was created. A separate source/ownership review found no material contradiction in the proposed all-years entry, older-change discovery, source-linked grouping or R04 context safeguards. Structural document checks passed; these do not replace runtime proof.

## Question to present

Decision card: **What should organize the default Giving history view?**

- **A — Gifts first (recommended):** recognize each gift, see its current status, and open its allocations, refunds and available receipt together; compact summaries and filters remain accessible.
- **B — Financial activity first:** start with dated gifts, refunds and reversals linked to their original gifts; strongest for bank reconciliation, with more entries to interpret.
- **C — Year and summary first:** start with an annual overview and statement access, then drill into gifts; strongest for year-end review, with an extra step for checking a recent gift.

Recommend A with the proposed execution qualifications above. Await one founder answer; do not infer approval from silence.
