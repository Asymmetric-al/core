> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 9 September 2026:** Conrad accepted Q29 A1–A5/J01–J18/V01–V14/C01–C22 and all reviewed Maia/source defaults, including separate DAF awareness and IRA/QCD acknowledgment journeys, zero unrelated UI,20-root gift-date continuation and24-hour elapsed preparation monitoring. Earlier proposed/unanswered wording is historical. T01–T22 remain required release proof; this ratification does not certify implementation or personal tax eligibility.

> **Current status, 9 September 2026:** Conrad selected A, a quiet received-grants view, and added DAF tax-document clarity and QCD handling. The [completed corrected review](phase25-r29-adversarial-review.md) preserves distinct DAF awareness and IRA/QCD gift/acknowledgment paths and awaits ratification. Earlier unanswered text below is historical research.

# Question 29 — Seeing received grants recommended through a donor-advised fund

9 September 2026. **Q28 is fully ratified**, including A1–A5/J01–J18/V01–V14/C01–C22, reviewed Maia defaults and source safeguards. **Q29 is researched and unanswered.** This is one proposed addition to donor-visible scope, not an implementation approval or an assertion that the capability already exists.

## The one decision

**Should Phase 25 add a private, read-only view of received DAF grants attributed to the donor, or keep that information in existing acknowledgments and optional Support overviews?**

<!-- prettier-ignore -->
| Option | What the donor gets | Benefit | Tradeoff |
| --- | --- | --- | --- |
| **A — Add a quiet received-grants view. Recommended.** | Where current source attribution and the person's permission qualify, show the organization's recorded received grant and permitted later corrections. No relevant admitted records means no ordinary DAF-specific UI. | The donor can find what the receiving organization recorded between annual documents, including when they have no personal direct gifts. | Adds a narrowly qualified donor read, its privacy boundary and correction handling. It requires an explicit expansion beyond the current document/correspondence path. |
| **B — Keep the existing acknowledgment and Support overview path.** | Preserve governed acknowledgments/correspondence, any enabled and available non-tax Support overview, and ordinary organization help. Add no per-grant portal view. | Smallest scope; the existing information and document path remains useful and coherent. | The donor cannot inspect an individual received grant directly in this portal; they use correspondence, the optional document or organization help. |

These are two substantive choices on one axis. A sponsor-processing tracker is not a third comparable option: Core has no adopted source for that information. Putting sponsor grants into personal giving would reopen already-settled legal/recognition boundaries. Neither belongs in this decision.

## Concrete donor journey

Illustrative scenario, not an observed Asym donor interview: Maria recommended a grant through Fidelity Charitable. The receiving organization has actually recorded the grant, has sufficiently disclosed and unambiguous attribution to her, and has qualified her current right to see the relevant facts. She visits its donor portal to check what it recorded.

With A, she can reach one small received-grant record from the giving area. It identifies the grant as recommended through the sponsor, shows only permitted recorded facts, and lets her return to her giving overview. A material correction remains understandable where continuing access permits. She does not connect her DAF account, maintain a status tracker or create a new personal gift.

With B, she uses the existing acknowledgment or correspondence; an optional Support overview may provide annual recognition when the organization has enabled and produced one. The sponsor's own account remains a useful place to check sponsor grant history under either choice.

If Maria only submitted a recommendation to her sponsor, this scenario has not yet occurred. Core cannot infer receipt, approval or even a pending grant from that act. If attribution is to a household, that fact alone does not let every household member inspect it or justify the words “you recommended.” If a record is anonymous, ambiguous or not currently permitted, this view cannot expose it through a name, count, preview or guessed match.

## Best recommendation

**Choose A, limited to currently authorized received-grant records.** It answers a distinct question: what has this organization recorded about the grant? Sponsor history and recipient records overlap, but they are not the same system's evidence. A small source-owned read can provide useful continuity without importing a DAF account-management product.

B is a strong alternative. Acknowledgments already confirm information, and the optional Support overview already supplies a separate non-tax document. A is not required for tax compliance, and B is not outdated. The added value is direct, current, per-grant self-service. No Asym frequency study, donor usability study or measured support reduction was found; recommending that value is a product judgment.

Three independent reviews tested whether this was a real open decision. The owner lane initially favored convergence because the document path was already settled. It supported presenting this choice only after distinguishing an explicit new private-read purpose from silently expanding the existing Support overview. The reviews rejected another profile-layout vote, a generic tribute wall and a technical workaround vote for Q14 G01 as weaker next questions.

## Repository authority and the required reconciliation

The checked source is Core at `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`, with the current Phase 22–24 branch authorities also rechecked. These are intended contracts; the named credit read is not an implemented donor feature in the scoped source search.

<!-- prettier-ignore -->
| Authority | Verified fact | Effect on Q29 |
| --- | --- | --- |
| [P14 donor story 111](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md#L271) and [J.3–J.4](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md#L1179-L1181) | Current donor recognition documents are limited to the qualified optional Support overview. Additional portal recognition is reserved for Phase 25. | The reservation allows considering A; it does not make a new grant list mandatory or already authorized. |
| [P19 optional Support overview](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md#L914-L925) and [cross-PRD amendment](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md#L1763) | Default Off means no Support-overview work or ordinary UI. Its document purpose stays separate, labeled non-tax and source-qualified. The amendment says household/DAF recognition appears only in the separate optional overview. | A requires an explicit narrow P14/P25 portal-read amendment and reconciliation of that “only” wording. Do not reinterpret the document setting as general read permission or evade Off by relabeling the same document feature. |
| [Q08 ratified document journey](phase25-r08-adversarial-review.md) | Official documents come first under Receipts & statements; an optional qualified Support overview is separate. | Preserve its location, purpose and activation. A adds a different current read; B preserves the existing scope. |
| [P14 C.2](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md#L447-L456) | `getPartyCreditActivity` owns the derived credit read with separate Legal and Recognition lenses and current source basis. | A must consume a narrow donor-safe source projection. It cannot introduce a second grant ledger, client totals or raw sponsor-gift access. |
| [P14 D.1–D.3](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md#L495-L534) | Sponsor is legal donor; qualified advisor attribution is posted with the source. Disclosure can be full, fund-name-only or anonymous. | Received-source facts and safe attribution are feasible inputs; sponsor request progress is not. Attribution, correspondence and portal access remain different facts. |
| [P14 D.11–D.12](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md#L580-L590) | A future DAFpay/Chariot rail is reserved; household and co-advisor attribution have defined source rules. | No new connector or automatic household access. One grant can recognize several parties without becoming several legal gifts. |
| [P14 J.2](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md#L1177), Q05, Q23 and Q28 | Church-member recognition is excluded from that member's portal; personal giving excludes another legal donor's gift; Q28 covers own-employee matching only. | A is a DAF-specific proposal, not general household, tribute, church, payroll or employer recognition browsing. Personal totals, legal History/CSV and receipts keep their existing meaning. |

The permanent path, if A is selected, is to record that specific exposure amendment in this grooming session and carry it into the later authorized canonical source/spec work. It must independently qualify exact viewer, recognition subject, field and purpose access, while leaving Support-overview Off and official documents intact. This is a prerequisite to activation, not a permission granted by the presence of a credit row.

Fresh read-only issue checks found [#726](https://github.com/Asymmetric-al/core/issues/726) (the staff credit read) and [#1018](https://github.com/Asymmetric-al/core/issues/1018) (optional Support overview) OPEN. Neither issue grants this donor view. Current owner amendments take precedence over stale wording in an older ticket. A source contract and an open ticket are not runtime proof.

## Current primary-source research

Retrieved 9 September 2026. These sources establish specific facts and useful boundaries, not comparative usability results for Asym.

<!-- prettier-ignore -->
| Source | What was verified | What to use |
| --- | --- | --- |
| [Fidelity Charitable — Working with us guide, page 10](https://www.fidelitycharitable.org/content/dam/fc-public/docs/resources/working-with-us-guide.pdf) | The guide points clients to donor-portal grant history and individual grant details. It separately describes contribution tax receipts and grant confirmations. | The sponsor-history alternative is real. Keep contribution and grant meanings distinct; do not copy advisor permissions or sponsor processing intervals. |
| [Fidelity Charitable — Recommending a grant](https://www.fidelitycharitable.org/giving-account-guide/recommending-a-grant.html) | Recommendations undergo sponsor review. Donors may disclose identity, share only the account name or stay anonymous. Sponsor confirmation and recipient acknowledgment are distinct. | Preserve disclosure provenance and acknowledge B's existing correspondence path. Do not infer recipient-record completeness from sponsor status. |
| [National Christian Foundation — Guide to giving](https://www.ncfgiving.com/guide-to-giving-at-ncf) | Its account provides fund activity and grant management. Anonymous grants withhold name and fund information from the charity. Roles and access levels are distinct. | A relevant ministry-facing example supports private disclosure and explicit access. Its policies, timing, investment features and grant rules do not become Core requirements. |
| [IRS — Donor-advised funds](https://www.irs.gov/charities-non-profits/charitable-organizations/donor-advised-funds) | The sponsoring organization has legal control of contributed assets; the donor retains advisory privileges. | Preserve the sponsor/advisor distinction. This research adds no donor tax-advice flow or new acknowledgment requirement. |

The DAFgiving360 recordkeeping transcript was independently read by the UX lane, but a root refresh returned an error. It is not needed to establish the recommendation and is not used as controlling evidence here. No authenticated sponsor UI, Asym donor data or new integration was accessed. No claim that an identical grantee-side view is an industry standard was established.

## What the selected-answer review must settle together

A needs a whole small journey, not another sequence of cosmetic votes. Its review must define a calm entry within the already-mapped giving area; exact source-safe row/detail fields; words for received, corrected, restricted and unavailable facts; and recovery when data or permissions change. Use the ratified shadcn Maia system. If a grid is warranted, ReUI remains design inspiration; a small read does not by itself require a grid or more dependencies.

For ordinary surfaces, no relevant admitted DAF record should mean no DAF card, badge, prompt, empty module or reserved space. An explicitly requested route still needs truthful authorized loading, empty, denied and error handling. A failed query is not proof of no records. Existing personal giving and documents remain independently usable.

The review must test household attribution versus per-person rights, multiple co-advisors, fund-name-only disclosure, mistaken and late attribution, merged parties, source corrections, revoked access, sensitive ministry labels and historical records. A received grant must not disappear merely because its effective money is later reversed; history remains subject to current access. Raw sponsor letters, account/fund identifiers, free-text purpose and other advisors' identities are not automatically donor-safe fields.

The source read must maintain current Tenant/Person/subject/field/purpose scope, coherent financial and recognition basis, bounded queries, correct cache separation and reauthorization. Reading creates no source mutation, correspondence, receipt or notification. A introduces no sponsor balance, recommendation submission, pending stages, schedule control, grant-claiming search, aggregate recognition total or employer-match expansion.

B requires no new DAF projection, entry or activation work. It retains the source's existing acknowledgment and optional document obligations. Neither option resolves Q14 G01: **Q14 G01 remains unresolved** as a native Auth contract, independently of this scope choice.

## Completion and next step

Q28 ratification is recorded in the notebook, glossary and review status notices; its historical bundle is preserved. Q29 remains unanswered. Current source references, the five existing setup paths, reverse-patch preservation, sixteen historical bundle hashes and citation targets are checked in the accompanying local validation record. No runtime/SQL/browser/provider test or donor usability study is claimed for this question. No canonical ADR/OpenSpec edit, implementation, package change, message send, PRD/ticket transition or GitHub publication occurred.

After this decision and its selected-answer review, perform whole-journey convergence rather than automatically asking a new question for every reserved recognition feature. Additional scope should require a concrete donor job that the existing paths do not adequately serve.
