# Phase 29 Q21 — what satisfies an ordinary requested item?

**Status:** Historical researched question prepared 2026-10-21, Asia/Bangkok.
Conrad selected A and ratified its complete required amendments on 2026-10-21:
require staff acceptance for ordinary requested items, preserving excellent
UX/UI and no overengineering. Q01–Q21 are ratified grooming intent. No
implementation or activation follows.

## Historical question and alternatives

**For ordinary native document requests, should submitted items require staff
acceptance, or should we also offer an explicit collection-only mode?**

The established distinction stays intact in both choices: receiving a file,
checking that it is safe to inspect, accepting it for the requested purpose and
fulfilling the request are different facts. A clean upload cannot manufacture
business acceptance. The remaining decision is the ordinary native source's
review policy and whether collection-only is part of that product's scope.

| Option                                                                      | Practical behavior                                                                                                                                                                                                                                                               | Benefit                                                                                                                                                             | Cost and downstream effect                                                                                                                                                                                                                |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Require staff acceptance for ordinary requested items (recommended)** | An authorized staff member deliberately accepts the exact current evidence for a submitted requested item before that evidence satisfies the item. One item may include several supporting files. Existing source-authorized non-file or waived outcomes keep their own rules.   | Clear meaning of accepted, preserves meaningful review and the pending correction opportunity, and fits the established native review journey without another mode. | Staff must review/check off the requested evidence; unattended work can remain awaiting review. The UI must make staff-pending work distinct from missing recipient work.                                                                 |
| **B — Also allow explicit collection-only requests**                        | Before issuance, the source declares that a qualified receipt is sufficient for this collection purpose. Its own bounded satisfaction command records that result; there is no claim that staff reviewed or accepted the contents. Review-required requests retain A's behavior. | Avoids unnecessary staff checkoff when collecting the material is the entire purpose. It is a genuine flexibility option, not inherently poor UX.                   | Adds a distinct policy/mode and a narrow owner amendment. Qualification, labels, correction eligibility and fulfillment must consistently honor it; automatic satisfaction can end the normal pending correction opportunity much sooner. |

**Recommend A.** It gives the ordinary native product one understandable
review meaning and avoids adding a collection-only mode without established
Asym demand. This is a product judgment, not evidence that every ministry needs
human review for every upload. Existing specialist source policies, attachments,
imports and public-media processes are not converted into this request model.

B remains viable if collection without content review is a real desired native
workflow. It cannot be implemented as a generic “scan clean → accepted” hook,
a caller-controlled bypass, or a rule in Workflow Studio that invents source
acceptance. It needs an explicit qualified source profile and honest collected,
not-reviewed meaning. Staff must not be able to retroactively reinterpret
already-submitted requirements merely by flipping a display setting.

## Practical example and user experience

**Illustrative scenario, not an observed ministry workflow:** a coordinator
requests an item supported by two files. Both arrive safely, but one is the
wrong document. With A, the participant has successfully submitted their work;
the item remains awaiting staff review rather than falsely appearing accepted.
With B, a genuinely collection-only requirement may be satisfied by qualified
receipt even though nobody has assessed whether the contents are useful. The
user-visible distinction must match the declared purpose.

For A, keep the review in the existing request context: requested item and
instructions, exact current submitted evidence, and a clear acceptance action.
Do not require a second approver, mandatory essay, preview-click ceremony or
one acceptance click per supporting file. Viewing a file is not proof of
review, and staff acceptance here is not legal authenticity, financial approval
or acceptance of the person's wider application. An existing exact source-authorized
acceptance for the same evidence and purpose need not be performed twice;
acceptance of different bytes or another use cannot be inherited.

Participant copy should make the next actor clear, such as **Submitted — waiting
for review**. “Missing” must not describe a received item merely because staff
has not acted. Technical processing/unavailability remains distinct. Accepted
and collected-without-review cannot share a misleading approval label. Exact
wording, negative outcomes and whole-request completion interactions remain
subject to the selected-answer review and their later bounded decisions.

The ordinary Q03 correction path remains while the source permits the item to
be corrected. A newly admitted correction fences the predecessor from current
acceptance, including while the correction is still being checked. Staff must
not silently accept a newer version they did not review. A failed correction
does not silently restore the old candidate. Either policy must preserve this
lineage; B needs explicit reconciliation of its earlier satisfaction boundary.

Staff review can outlast participant access. That does not mean the participant
failed, nor does it automatically extend access. Existing Q06–Q19 fulfillment,
expiry and fresh-access rules still apply. Q20 only governs fresh-access email;
this question selects no review-result email, reminder or new communication.

## Research and practical limits

Primary product documentation was checked on 2026-10-21. It demonstrates
patterns, not Asym workload, staff preferences or completed native qualification.

| Source                                                                                                                                           | Verified fact                                                                                                                              | How it informs this decision                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Content Snare: approve, reject and comment](https://contentsnare.com/help/knowledge-base/approve-reject-and-comment/), updated 2025-10-29       | Submitted answers can be reviewed as they arrive; approval is an explicit action and prevents client changes to that answer.               | Supports the per-item review and correction boundary. Its reversal, notification and bulk controls are not automatically adopted.                                         |
| [Content Snare request overview](https://contentsnare.com/help/knowledge-base/requests-overview/), updated 2025-10-06                            | Waiting-for-review and marked-complete request states are distinct.                                                                        | Separates submission from review and whole-request completion. It does not require Core to add a final Complete button in this question.                                  |
| [Submittable: Manage My Submissions](https://submittable.help/en/articles/8048419-manage-my-submissions), dated 2023-12-07, current page checked | Received, in-progress review and accepted statuses have different meanings for applicants.                                                 | Supports clear next-actor/status language. Core need not copy its account model or entire state list.                                                                     |
| [Microsoft file requests](https://support.microsoft.com/en-us/onedrive/create-a-file-request), current undated page                              | A collection workflow can acknowledge uploaded files without claiming content approval. Its documented stop-collecting action is separate. | Supports B's underlying collection use case, not scan-driven acceptance or Core identity/authorization. Link-based intake and unverified supplied names are not imported. |

The [comparative research](phase29-q21-comparative-research.md) adds current
approval-optional and nonprofit follow-up evidence, including the limits of
those analogies. Optional use of approval in another product is real
counterevidence to a universal human-review rule. It does not establish that
Core should add collection-only to this native source, or that any storage
event may mark evidence accepted.

No primary evidence establishes that A or B is fastest or most satisfactory for
Asym's intended users. Confirm actual intended collection/review purposes and
test whether participants and staff understand received, awaiting review,
accepted and any explicitly selected collection-only result. No conversion,
support reduction or staff-time number is invented.

## Governing contracts and current reality

The [owner research](phase29-q21-owner-research.md) and
[runtime research](phase29-q21-runtime-research.md) identify the exact boundaries.

- The founder brief, section 10, requires a practical bounded request with a
  responsible reviewer, exact request revision and source-owned satisfaction.
  It explicitly separates upload, safety, review and fulfillment.
- The glossary's Private Document Request, Submission Confirmation and Document
  Request Item definitions preserve these distinct meanings. Q03-C11 and the
  ratified Q03 admission-time correction fence protect exact reviewed evidence.
  Q06/Q10 preserve genuine source fulfillment; Q10-P03 expressly retains
  existing authorized non-file/manual/waived predicates without a file-count rule.
- Workflow Studio `GEN-06` in
  `docs/prds/workflow-studio/07-core-workflow-catalog.md:577–595` routes a reviewer
  and records exact acceptance. Its
  `05-security-and-domain-boundaries.md:44` prohibits the coordinator from
  automatically marking an upload accepted. Its
  `01-product-and-experience.md:77` says quarantined files cannot satisfy evidence.
  These are strong owner precedents, not proof that every newly scoped ordinary
  native request has already selected a universal human-only completion rule.
- P29 custody does not own specialist business acceptance. A request's source
  owns the satisfaction command; Phase9 represents assigned work; P6/P17 handle
  separately authorized communications. The native request must work without
  completion of all configurable Workflow Studio capabilities.
- Existing generic task-status code and specialist approval functions are
  not a qualified ordinary native item-acceptance service. Code search and
  migration inspection establish only the bounded current-source evidence
  documented in the runtime note, not a deployed schema/RLS audit.

A specializes the native cohort's required review without changing existing
specialist policies or granting File Manager acceptance authority. B is an
explicit new native collection-only scope and would require a narrow owner
amendment; it is not represented as existing-compatible automatic acceptance.
The selected answer will receive the complete adversarial review, including
current authorization, exact evidence-set concurrency, source fulfillment and
participant-state consequences, before ratification.

## Coverage checkpoint and boundaries

| Branch after Q20                                                                                                      | Current status                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Native recipient identity, submission readback/correction/history                                                     | Q01–Q05 ratified, exact owner integration and runtime proof remain                                                         |
| Finite unfinished/completed access and subsequent approvals                                                           | Q06–Q19 ratified; not reopened by this question                                                                            |
| Optional fresh-access notice                                                                                          | Q20 and complete amendments ratified; native communication qualification remains                                           |
| Ordinary item review/satisfaction policy                                                                              | **Q21 is this open question**                                                                                              |
| Reviewer responsibility, actionable review outcomes and whole-request completion UX                                   | Still to resolve where not source-owned; not bundled into Q21                                                              |
| Broader file organization, libraries, qualified formats/processing, public journey, custody migration and disposition | Still require source-grounded grooming and qualification; the initial coverage table is historical, not a completion claim |

No review configuration builder, automatic content judgment, mandatory second
reviewer, bulk approval, final Complete request control, waiver editor,
rejection taxonomy, reminder or additional notification is selected here.
At preparation no Q21 answer, ADR-0021 or new glossary term was recorded.
The subsequent selection/review and one new definition are recorded below;
the previous seventeen definitions, Q01–Q20 and product edits are preserved.

Local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; freshly checked
live develop remains `800213405e2c51e07180e86ee8322355e0fdb4eb`. No pull,
private-data read, provider action or new runtime test occurred. Formal
owner/OpenSpec publication remains `/to-prd`; tickets remain `/to-issues`;
no implementation follows from this researched question.

## Historical founder answer and review — before ratification, 2026-10-21

Conrad selected **A — Require staff acceptance for ordinary requested items**,
requesting the full adversarial review, excellent UX/UI and no overengineering.
The [completed review](phase29-q21-adversarial-review.md) recommends
**Accept with required amendments**: corrected decision, Q21-C01–C08,
Q21-P01–P18, eight journeys, nine lifecycle distinctions, six operational
controls and one glossary definition. The
[feature ADR](../docs/adr/0021-staff-acceptance-of-ordinary-requested-items.md)
records selected/reviewed status; the full package awaits ratification.

Require deliberate authorized staff acceptance of the exact current ordinary
native file-evidence item before that evidence can satisfy it. This is necessary,
not sufficient to bypass other source/safety criteria. Preserve multi-file
sets, source-authorized alternative outcomes and specialist policy. Recognize
valid existing exact acceptance without duplicate review/effects, never from
byte equality or another use. One contextual action; no extra approval engine,
mandatory per-file clicks, essay, second reviewer or routine confirmation.

Acceptance shares Q03's current evidence/authority/correction fence. Preserve
the original actor/time and durable required history/follow-up; recover the
original committed effect rather than rebasing, reaccepting or reporting known
success as failed. Historical acceptance, current applicability/serving and
whole-request fulfillment stay distinct. Staff work after participant expiry
does not extend access or backdate fulfillment. Missing preview can use only
a qualified sufficient inspection alternative; partial or inaccessible content
cannot be treated as reviewed just because viewer controls work.

Document Request Item Acceptance is the one added business term; the prior
seventeen definitions remain unchanged. The independent final UX pass added
explicit document-content accessibility to C06/P14 without promising OCR,
translation or format expansion. Owner/runtime reviews found no material issue;
the full package contains no remaining material contract finding, while native
implementation/role/RLS/race/inspection/restore/browser/AT/user proof remains.

Q21 selects no collection-only mode, whole-request Complete control, reviewer
assignment/pool, bulk, new waiver/rejection taxonomy or review-message policy.
No new runtime tests, product/provider/private-data action or formal publication
occurred. Q01–Q20 remain ratified; Q22 has not been asked.

## Ratification — 2026-10-21

Conrad subsequently ratified Q21 A and its complete required amendments:
corrected decision, Q21-C01–C08, Q21-P01–P18, eight journeys, nine lifecycle
distinctions, six operational controls and the one added business definition.
The preceding selection/review is dated provenance; ADR and full review record
adoption. Q22's answer, native qualification/implementation and formal
publication are not inferred.
