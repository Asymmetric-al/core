> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 8 September 2026:** Conrad explicitly accepted Question 19’s A1–A4/J01–J14/V1–V10/C01–C22, including up to three Updates previews and product-owned future flexibility. T01–T14 remain required target proof. Earlier provisional wording below records history; ratification does not certify implementation or live behavior.

> **Current status, 8 September 2026:** Conrad selected A, welcome and ministry connection first. The [completed adversarial review](phase25-r19-adversarial-review.md) records corrected execution for ratification. The unanswered wording below is historical pre-answer research.

# Question 19 — Home when there is no giving to manage yet

Research date: 8 September 2026. Question 18's A1–A5/J01–J16/V1–V10/C01–C22 and three lifecycle clarifications are explicitly ratified. Question 19 is unanswered. This is a researched founder question, not a PRD, formal specification or implementation ticket.

## The decision and concrete situation

Jamie already has legitimate access to a personal portal context. Jamie chooses Home through ordinary navigation. Current authorized reads establish that there are no available gifts, recurring arrangements or documents to manage and no current required action. Released Ministry Updates may still be available through their independent audience and preference rules.

What should Home emphasize in this situation: a useful welcome and ministry connection, or an invitation to begin giving?

This is not a decision about account creation, claiming, content permission or whether general self-service should be first. It resolves the still-open emphasis when the normal financial management tasks are absent. No available records does not prove Jamie has never donated, and the example does not establish how often this situation occurs.

## Two credible options

<!-- prettier-ignore -->
| Option | Jamie's experience | Benefit and tradeoff |
| --- | --- | --- |
| **A — Welcome and ministry connection first. Recommended.** | A compact welcome explains the portal's purpose. Actual permitted Ministry Updates are the main content when available. A clear Make a gift action and the normal account navigation remain easy to reach. | Useful for someone here to read, manage preferences or prepare their account. It puts less emphasis on starting a donation than B. |
| **B — A quiet giving invitation first.** | The same welcome gives greatest prominence to Make a gift, opening the existing giving/ministry journey. Available Ministry Updates and account controls remain clear below or alongside that invitation. | Most direct for someone who opened Home intending to begin support. It assumes more about the purpose of a neutral Home visit. It is still an optional invitation, not a modal, checklist or fundraising wall. |

Neither option changes navigation, grants access, requires a donation, adds a payment method, follows a ministry, subscribes to a newsletter or changes email preferences. Neither intercepts a valid direct link to Updates, a receipt or another chosen task. A third option is unnecessary: tours, competing empty cards or forced setup would add a weak alternative rather than a meaningful decision.

## Recommendation

Choose **A**. Make Home worthwhile before there is money to manage, while keeping giving obvious. The founder has prioritized easy access to Ministry Updates, calm self-service and freedom from artificial chores. A neutral entry does not tell us that the person intends to make a gift. The portal can support that action without making it the central message of every financially empty visit.

An illustrative welcome is: **Welcome, Jamie. Manage your giving and stay connected with [organization].** Use only the current safe name/brand and actual available capabilities. Present real admitted Updates rather than a decorative story or generic impact assertion. A small clear giving action remains visible. No USD 0 scoreboard or incomplete-account checklist.

If no Updates are available, keep a short truthful welcome and ordinary permitted navigation. Do not fill the page with repeated empty widgets, reset hidden ministries, invent content or silently expand the audience. The selected emphasis does not require a new feed, onboarding database, recommendation engine or persisted new-donor flag.

## Current primary research and its limits

<!-- prettier-ignore -->
| Source | Verified useful precedent | Limit for this question |
| --- | --- | --- |
| [Planning Center's introduction](https://help.planningcenter.com/en/179947-brand-new-to-planning-center-and-chms-guide.html) and [Church Center giving](https://help.planningcenter.com/en/140949-give-online.html), September 2026 | Participation/account utility is broader than giving; giving has an explicit named route. | Church Center is a broader congregation product. These pages do not prove its exact empty-Home design or justify importing groups/events into Asym. |
| [Church Center My Giving redesign](https://www.planningcenter.com/changelog/giving/improved-refreshed-my-giving-experience-in-church-center), November 2025 | At-a-glance financial management and consistent mobile/web task access. | Supports normal account usability, not a measured choice between these empty-Home priorities. |
| [Givebutter personal profile](https://help.givebutter.com/en/articles/3670204-how-to-manage-your-personal-user-profile), April 2026 | Accounts may originate from other participation, and its documented payment history has explicit limitations. | An empty account view cannot be treated as proof of never giving. Asym's complete available history and access owners remain authoritative; Givebutter's omissions are not copied. |
| [Fundraise Up portal experience](https://fundraiseup.com/docs/donor-portal-experience/) and [configuration](https://fundraiseup.com/docs/donor-portal-configuration/) | A visible new-donation route and useful financial self-service support B's clear invitation. | Its donation-first admission, profile prompts and campaign-choice behavior do not decide Asym's authorized no-giving Home or authorize automatic campaign selection. |
| [Shopify customer accounts](https://help.shopify.com/en/manual/customers/customer-accounts) | Account/profile utility can precede an order. | An account-before-transaction precedent, not an Asym identity policy or proof of an optimal empty-orders design. |
| [Atlassian Empty state](https://atlassian.design/components/empty-state) and [Carbon's current preview guidance](https://preview.carbondesignsystem.com/building-blocks/core/patterns/empty-states) | Explain what is available and offer a relevant next step; distinguish no data from filtering/error situations and keep copy concise. | Design principles, not donor conversion results. Carbon's stable page timed out; its official preview page was successfully read. No external visual system is adopted. |
| [shadcn Base UI Empty](https://ui.shadcn.com/docs/components/base/empty) | Existing composition supports a concise title, description and relevant action. Read-only repository CLI resolved this exact Base UI documentation. | Use the existing base-maia/shared components and tokens. A component example is not proof of the composed donor journey's accessibility. |

No source establishes that A produces a numerical retention, conversion or support-contact improvement. A is the recommended Asym product judgment, informed by these comparable patterns and the ratified product direction.

## Repository and prior-decision check

- Current develop remains `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. PRs 1323, 1340 and 1558 were refreshed on 8 September: OPEN at their previously recorded exact heads; Phase 24 remains draft. Founder-ratified active contracts are not automatically merged or live behavior.
- R01 requires useful Home when records/content are absent but expressly leaves exact composition open. R02 governs how the Updates destination opens. Q12 governs current needs. None fixes this neutral, known-empty Home emphasis.
- R04 preserves targeted entry and represented contexts. Someone with only representative access does not receive a fabricated empty personal donor context or an invitation to start personal giving in its place.
- The inspected legacy `resolveDonorPortalContext` requires an existing tenant/profile/donor context, while `getDonorPortalSnapshot` permits empty donation/pledge arrays (`packages/api/src/donor-portal/service.ts:166–240`). That makes the narrow situation structurally possible; it does not certify the target projection or hosted experience.
- The current Home component supplies fallback zero/General Fund values and an unconditional illustrated impact story (`apps/donor/features/donor/components/donor-dashboard-main-body.tsx`). Those are implementation accidents already incompatible with ratified source-truth requirements, not reasons to preserve an empty dashboard of invented meaning. No runtime incident is asserted and no source was changed.
- Missing-history basics are settled by Q05/Q08/Q10, including broaden filters, retry, safe sign-in and qualified help. Skip-next is already source-defined in P16/#813. Wallet replacement/related removal substantially repeats Q03. These were considered and rejected as repetitive next questions.
- Q14 G01 remains an unresolved supported native identity-linking contract, not merely an unrun test. Current research did not establish a supported alternative that calls for a new founder choice. It remains a blocking architecture dependency for the affected social-auth activation; this Home decision does not bypass it.

## Boundaries either option preserves

1. **Known absence is distinct from uncertainty.** Loading, failed owner reads, missing claims, incomplete coverage, pending payments/activation, denied access and existing records under a different represented context retain their own truthful states. No invitation that encourages a duplicate gift during processing.
2. **Use independent section states.** Useful permitted content need not wait for unrelated financial reads. Do not classify the whole account as new from a temporary empty slice or a total of zero.
3. **Keep familiar navigation.** History, Receipts & statements, recurring management, Wallet and Settings remain governed by current capability rules. No moving navigation or future My Campaigns placeholder to fill space.
4. **Respect content rights and Hide.** Source-authorized released Updates only. This choice does not add audience membership, follows, email consent, a new publishing capability or personalized impact claims.
5. **Preserve deliberate destinations.** Shared Updates links still open the reader's permitted Updates directly after required sign-in. This welcome never intercepts a donor's chosen task.
6. **Keep it small and maintainable.** One quiet composition using shared base-maia primitives; no forced walkthrough, welcome-completion storage, staff outreach, new notification or personalization engine.

If A or B is selected, the next adversarial review will map the complete selected journey and source-state boundaries. This pre-answer research does not silently ratify either option or certify implementation.
