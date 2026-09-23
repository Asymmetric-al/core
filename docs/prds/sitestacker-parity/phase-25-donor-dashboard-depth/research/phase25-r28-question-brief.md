> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 9 September 2026:** Conrad accepted Q28 A1–A5/J01–J18/V01–V14/C01–C22, reviewed Maia defaults and all source safeguards. Earlier proposed/unanswered wording below is historical. T01–T20 and source activation remain required proof; this ratification does not certify implementation or a live employer integration.

> **Current status, 9 September 2026:** Conrad selected A, show known progress and received matches. The [completed Q28 review](phase25-r28-adversarial-review.md) proposes corrected execution for ratification. Earlier unanswered/recommendation wording below is historical research.

# Question 28 — How much employer-match progress donors should see

9 September 2026. **Q27 is fully ratified**, including A1–A5/J01–J18/V01–V14/C01–C22, Maia defaults,24-hour retired live raw/365-day minimized evidence limits, mailing-use generation and the reviewed owner safeguards. Q28 is researched and unanswered. This question concerns donor-visible information, not new employer-match processing or financial authority.

## The one decision

**When the organization has an employer-match record that the donor is permitted to see, should the portal show its recorded progress before money arrives, or wait until a match payment has been received?**

<!-- prettier-ignore -->
| Option | Donor experience | Benefit | Cost / boundary |
| --- | --- | --- | --- |
| **A — Show known progress and received matches. Recommended.** | A small read-only summary explains what the organization currently knows: a possible match recorded, a request recorded as submitted, a received match payment, or a later closed/corrected outcome. Only meaningful, authorized source facts appear. | Answers the donor's question during the waiting period; gives continuity from recorded request through money received without forcing a support inquiry merely to see an existing fact. | Requires careful labels, provenance/currentness and closed/reversed handling. A stale staff record must not look like live employer tracking. No money is claimed before receipt. |
| **B — Show received matches and later corrections only.** | Nothing appears in this match view until the source records an actual received match. Its admitted received outcome and later material adjustments remain visible. | The simplest presentation and fewer interim states to explain; avoids presenting a long-standing possible request as progress. | A donor with a recorded request still cannot see that information in the portal before money arrives. They may rely on existing correspondence or contact the organization. This is a deliberate information limit, not a claim that no request exists. |
| **C — Keep match tracking outside the portal.** | No dedicated portal match view. Existing source-governed correspondence and organization assistance remain the ways a donor learns about matching. | Smallest portal scope and no additional matching interface to maintain. | Even a received match has no dedicated self-service view here; donors depend on correspondence or staff for this information. The organization still needs its existing matching operations and truthful records. |

These are three exposure levels on one axis: known progress, received outcomes only, or no dedicated portal match view. B is the strongest alternative to A; C is a legitimate minimum-scope choice. None implies a match dashboard for everyone, a status-edit form, an employer database, automatic application submission, new email streams or a new sidebar entry. Exact placement and presentation will be mapped together in the selected-answer review; do not combine that separate layout detail with this scope choice.

## Concrete donor example

Illustrative scenario, not observed Asym research: Maria gives $100. She submits a matching-gift request through her employer's process, and the organization records that submission. No matching payment has yet been recorded.

With A, she can see a concise **Match request submitted** summary, qualified as the organization's recorded information. Where the current source supports it, supporting text can say that no match payment has been recorded yet. It does not say Employer approved, Payment scheduled, Complete or You need to pay. When an actual $100 match is recorded, the summary can show **Match payment received — $100**. Her own $100 gift and its receipt remain separate.

With B, the same $100 received match appears only after money is recorded. Before then, the portal shows no match-progress summary; the organization still retains and manages its own request record.

With C, Maria uses any existing match correspondence or contacts the organization; the portal adds no match-specific view before or after receipt.

A may also have a recorded possible match that has not been submitted. That cannot use the submitted label. A received payment can be only one installment, so neither option may call an arrangement complete solely because its state is received. A later refund/reversal or corrected linkage must not leave a stale celebration or silently erase meaningful history.

## Best recommendation

**A — Show known progress and received matches**, with a deliberately small, informational presentation.

This adds useful continuity to a task the existing source already tracks. The UI should answer “What has this organization recorded about my match?” It should not pretend to know everything happening inside an employer's approval or payment system. Displaying source-qualified interim facts is a product judgment about usefulness; it is not a measured promise that this will reduce support volume or improve donor retention.

B remains credible if the product deliberately prioritizes a smaller information surface. It is not inherently unsafe or outdated. A is preferable because it can reduce uncertainty without asking donors to maintain a tracker or adding processing machinery. Missing, stale, withheld or ambiguous source data must receive truthful treatment in any new portal view, rather than being upgraded into a reassuring status.

Independent review challenged A with B's lower freshness/support burden. The data lane initially favored received-only, then supported recorded progress after separating the existing staff-owned facts from a new tracking integration. The final recommendation weighs useful waiting-period information more heavily, provided it is clearly the organization's record rather than live employer processing. C would deliberately retain the current no-match-view posture; it does not remove the underlying source's operational obligations.

No eligible match record means no match-specific card, promotional empty state, task or reserved space in ordinary donor surfaces. This is relevance-based composition, not a hidden boolean that grants access. Donors should not have to understand matching-gift terminology to use the rest of their portal.

## Why this question is still open

The current roadmap's main Phase25 self-service tasks have substantial coverage in Q01–Q27. Several unchecked notebook items are implementation/proof obligations, not reasons to invent another founder vote. Ordinary name/phone layout, wallet removal, cancel/restart, help placement and notification density were not selected because earlier decisions/source rules already constrain them or they expand other phases.

There is, however, an explicit inherited donor-facing seam in Phase14:

<!-- prettier-ignore -->
| Pinned Core evidence | Verified fact and consequence |
| --- | --- |
| [P14 J.4, lines1177–1181](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md#L1177-L1181) | Matched-gift progress and other future donor recognition displays are assigned to Phase25. This establishes a genuine open donor-facing subject. It does not require a broad recognition timeline or tribute wall in this answer. J.2's church_member donor exclusion remains binding. |
| [P14 C.3, lines458–460](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md#L458-L460), [G.12, lines974–979](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md#L974-L979) | getMatchingActivity is the named pipeline-fact source, separate from Legal/Recognition money vocabularies. P25 must consume a qualified donor projection, not raw matching tables or unrestricted staff funnels. |
| [P14 G.1–G.3, lines852–910](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md#L852-L910) | Expectancy is not money; identified/submitted/received/reversed/closed/superseded have distinct meanings. Received requires real settlement-linked ledger money, and an origin gift link can be absent. No assumption that every match can be nested under a visible original gift. |
| [P14 G.8–G.10, lines945–970](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md#L945-L970) | Staff own follow-up; employment linkage is sensitive; below-clearance restricted people are invisible. The P14 v1 portal exclusion explicitly reserves later P25 review, not permission for raw donor access. Corrections come from P13 domain truth, not browser/provider guesses. |
| [ADR0003](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0003-payer-of-record-is-the-legal-donor.md) | Match money is a separate legal gift from the actual payer, which can be an intermediary. Employer-program attribution is not necessarily payer identity. The employee's own receipts and giving totals do not absorb it. |
| Q05 review C05 and Q23 ratification | Gift-centered personal history did not approve new recognition browsing. Q23 excludes recognition/expected matches from the personal monetary Home measure. Neither decided interim employer-match visibility. |
| [#734](https://github.com/Asymmetric-al/core/issues/734), [#735](https://github.com/Asymmetric-al/core/issues/735) | Current OPEN owner work names pipeline reads, settlements and Phase25 seams. Intended contracts and open tickets do not prove those services have shipped. |

Source checkpoint remains `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. The scoped search of packages/apps/migrations/tests found no target getMatchingActivity/matching_gift_expectancies/matching_gift_settlements/matched_employee implementation. That is defined source absence, not a claim about a hosted environment or every branch. A and B require qualified P14/P13/P12 source and donor projections before portal activation. C adds no donor match projection; existing matching operations and correspondence retain their independent prerequisites.

## Current primary research and selective lessons

Retrieved9September2026. Vendor documentation is useful evidence of product semantics, not proof of Asym demand or a mandate to acquire a service.

<!-- prettier-ignore -->
| Source | Useful lesson | What not to import |
| --- | --- | --- |
| [Double the Donation — Detailed status definitions](https://support.doublethedonation.com/knowledge/what-do-donor-the-different-donor-statuses-mean) | Separates opening a form, donor-confirmed submission and manually recorded funds. It explicitly says employer processing/disbursement is not automatically known. | Do not translate Match initiated into employer approval. Do not copy its pending-payment/complete states into Core or imply its automated vendor connection exists. |
| [Double the Donation — Tracking funds](https://support.doublethedonation.com/knowledge/how-to-track-your-matching-gift-funds-using-double-the-donation) | Funds travel from employers/CSR platforms to the organization; tracking software is not the money owner. | Its overview simplifies Match initiated more than its detailed status guide. Use the more precise distinction, not the optimistic summary. No vendor uplift statistics, estimated revenue or90-day donor reminder is imported. |
| [Fundraise Up — Employer matching](https://fundraiseup.com/docs/company-matching/) | Collecting employer information is distinct from matching automation; the feature is off by default. | Employer-name capture does not prove submission, eligibility or receipt. Do not add a checkout employer question, lookup vendor or auto-submission scope in Q28. |

These sources support careful stages and transparent provenance. They do not establish a universal donor-dashboard layout, a guaranteed payment time or the frequency of employer matches in missions ministries. We do not assume an employer program covers a particular donor, gift or ministry.

## Common boundaries and selected-review work

- **Only the exact donor-admitted record.** Employee affiliation is sensitive. An org-contact role, shared email, employer relationship or recognized credit does not grant access to an employer's whole payment, coworkers, staff notes or origin gift. P12/P3/P10 govern the new donor read projection.
- **No phantom money.** Expected/advisory amounts never enter giving, recognition, receipts, statements or Home totals. A qualified received amount derives from effective settlement lines under its source; the match is not the donor's own legal gift. No promise of a double match, completion percentage or guaranteed balance.
- **Status is not employer telemetry.** Identified is not submitted; submitted is not approved. Source received may be partial. Closed is not necessarily employer denial; its safe explanation must reflect the actual source reason. An elapsed date cannot automatically change state.
- **No new work for donors.** This choice is read-only visibility, not request creation, marking a request submitted, employer-account connection, automated reminders or a donor task stream. Existing P14 staff follow-up and governed thank-you retain their owners. No new bell/email is implied.
- **Small and conditional.** Use shared shadcn/Base UI Maia. A relevant detail/summary is the likely presentation direction; do not settle a new top-level Matches destination, countdown, chart, global total or staff pipeline grid before evaluating the selected journey. ReUI remains the reference for actual grids, not a reason to add one here.
- **No origin-link fiction.** Null, hidden or pre-platform origin is valid; do not manufacture a personal history row, unsafe link or request for duplicate donor data merely to fit a card.
- **Complete lifecycle before activating a new donor view.** The selected review must cover partial/multiple settlements, corrections/reversals, reopened late payments, closed/superseded records, sensitive/no-source/error states, currency/currentness, donor-safe labels and exact source grants. Raw staff record existence is not donor publishing authority.

The answer review will map these interactions and evaluate all22 categories before corrected execution is ratified. No new runtime test is warranted for presenting this scope question; target proof cannot be fabricated from a paper design. Q27's historical bundle and all previous bundles remain preserved. Q14 G01 remains unresolved. No canonical edit, PRD/ticket transition, implementation, provider action, message, payment or GitHub publication occurred.

**Q28 remains unanswered. Recommendation: A, show known progress and received matches, with clear source-qualified meaning and no new donor chores.**
