> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 9 September 2026:** Conrad accepted Q26 A1–A5/J01–J18/V01–V14/C01–C22, including zero ordinary artifacts for none, historical access, text-only progress, twenty-record continuation, bounded request/dispute safeguards and ninety-day encrypted text custody. Earlier proposed/unanswered wording below is historical. T01–T20 remain required target proof; ratification does not certify implementation or measured UX.

> **Current status, 9 September 2026:** Conrad selected A, a separate quiet Pledges entry, and requires no UI artifacts for donors without these uncommon campaign commitments. The [completed adversarial review](phase25-r26-adversarial-review.md) proposes corrected execution for ratification. The unanswered wording below is historical pre-answer research.

# Question 26 — Where donors find fixed-total pledges

8 September 2026. Q25 is fully ratified: B, A1–A5/J01–J18/V01–V14/C01–C22, Email Studio/P6/Resend, seven-day first-handoff utility and thirty-day Core detail with earlier owner stops. **Q26 is unanswered.** This is one new presentation decision for an inherited Phase16 capability, not a new pledge product or permission to implement.

## The one decision

**When a donor has an authorized fixed-total campaign commitment, should its primary navigation be a separate, relevant-only entry, or a broader area shared with recurring giving?** Existing conditional Other commitments access is preserved under either choice; the question refines primary placement, not whether that inherited capability should exist.

The proposed short label **Pledges** means the existing fixed-total campaign commitment. P16 already requires donor-facing **Campaign commitment**, progress and Request change. The eventual heading/explanation must reconcile that vocabulary; this question does not silently rename the domain or present a pledge as an automatic payment plan.

<!-- prettier-ignore -->
| Option | Experience | Benefit | Cost / important qualification |
| --- | --- | --- | --- |
| **A — Separate Pledges entry, when relevant. Recommended.** | Keep Recurring giving directly accessible. Add a quiet Pledges destination for the selected authorized giving context when it has accessible fixed-total pledge records, including history. Each opens its focused owner view. | Familiar direct destinations; recurring donors need not learn an umbrella label. Fixed commitments remain discoverable without dominating everyone's navigation. | Adds an entry for people with pledges. Conditional availability must be authoritative and stable; a failed/incomplete read is not proof of absence. Mobile navigation must remain readable. |
| **B — One shared giving-commitments area.** | A broader parent contains clearly separate Recurring giving and Pledges views, with exact child links still opening directly. | Fewer top-level destinations; related future-support arrangements are grouped. Useful when many donors use both. | Requires a broader label and grouping explanation. It must preserve the distinction between automatic recurring giving and a fixed promise, and retain Q22 Current/Past inside recurring giving. It need not force a chooser before a direct task. |

These options decide discoverability and grouping. Both include the same qualified pledge read/change-request capability, same authorization and same exact direct links. Neither option creates a universal commitment status, combined total, new pledge editor or provider billing portal.

## Concrete donor example

Illustrative scenario, not an observed ministry workflow: Maria gives **$50 each month** to one ministry. Separately, she made a **$1,200 campaign commitment** to a project and wants to check its progress. Suppose its authoritative fulfillment record shows **$300 received and applied**.

Those are two different questions:

- To change her monthly giving, she opens **Recurring giving** and the exact arrangement.
- To understand the campaign promise or request a change, she opens its **Campaign commitment** detail.

Under A, these are separate named destinations; Pledges appears only where relevant. Under B, both are grouped within a common area, while each retains an independent focused view and direct link.

Her $1,200 promise is not a received gift or a debt invoice. The pledge itself does not authorize automatic charges, and ending or changing it does not silently stop a separately authorized recurring arrangement. Any displayed progress must come from the pledge owner's fulfillment applications; it cannot be inferred from every donation to the same campaign or fund. No combined monthly-plus-pledged figure is proposed.

## Best recommendation

**A — Separate Pledges entry, when relevant.** It best fits Core's accepted direction: recurring giving stays the primary everyday experience, and fixed-total pledges remain a quiet but complete secondary workflow. It gives Maria the name of the job she came to do, without changing the settled Recurring giving experience.

The conditional rule should consider **accessible records, including permitted completed/ended history**, not only an open amount or active pledge. Otherwise a donor could lose ordinary discovery immediately after finishing a commitment. Exact links and the active journey remain valid subject to current authorization, even when the neutral navigation entry is not shown. A different person's pledge, shared email, household relationship or staff-only pledge cannot make an entry or count appear.

This recommendation is a product judgment. We do not have Asym evidence about the percentage of donors who use pledges, nor comparative usability data establishing an objectively optimal label or grouping. B is a credible modern alternative, especially for a population that regularly manages both types. A's rationale is Core's existing priorities and clearer separation, not a fabricated industry consensus.

## Current primary evidence

<!-- prettier-ignore -->
| Source checked on 8 September 2026 | Evidence | What transfers / what does not |
| --- | --- | --- |
| [Fundraise Up — Supporter experience, Pledge management](https://fundraiseup.com/docs/donor-portal-experience/#pledge-management) | Pledges have their own main-page section, hidden when the supporter has none. | Supports distinct, relevant-only discovery, not proof of a separate sidebar destination. Its pledge payment-method, skip/pause/cancel semantics differ from Core's non-executing fixed-total pledge and must not be imported. |
| [Planning Center — Manage your giving information](https://help.planningcenter.com/en/140951-manage-your-giving-information.html) | Current guidance places recurring donations and pledge progress in Planned giving. | Strong support for B's grouping. The shared heading does not justify merging source data, financial meaning or command authority. |
| [Planning Center — November 2025 My Giving redesign](https://www.planningcenter.com/changelog/giving/improved-refreshed-my-giving-experience-in-church-center) | Explicitly describes combining previously separate recurring and pledge navigation into Planned Giving while improving overview visibility. | Shows both patterns have been used; older Zendesk articles showing separate tabs must not be presented as current Planning Center behavior. No quantified Asym benefit follows from vendor outcome claims. |
| [GOV.UK — Solve a whole problem for users](https://www.gov.uk/service-manual/service-standard/point-2-solve-a-whole-problem) | Design around recognizable user tasks, connect related services and avoid excessive scope. | Supports tracing Maria's complete task and distinguishing source ownership from presentation. Does not prescribe either menu structure. |

The Planning Center help footer showed a publication date that differed between retrievals; the dated November2025 changelog establishes the navigation change. The decision relies on the current documented behavior, not a claim that it was newly released this week. Fundraise Up's exact separate-sidebar placement is not established by its section documentation, so it is an inspiration for A rather than a literal implementation template.

## Why this is genuinely open in Core

Current source checkpoint: develop/research HEAD `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Active P22/P23/P24 refs remain separately recorded and will be rechecked with the question record.

<!-- prettier-ignore -->
| Governing or inspected evidence | Established fact | Remaining presentation choice |
| --- | --- | --- |
| [ADR0012](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0012-separate-recurring-commitments-from-fixed-total-pledges.md#L10-L58) | Separate recurring and fixed-total aggregates; pledge owns no payment instrument/mandate/executor; recurring may remain flagship while pledge is quiet and complete. | Quiet separate destination versus clearly separated views within a shared parent is not specified. |
| [P16 Q.4, lines2044–2055](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md#L2044-L2055) | Authorized donor commitment/fixed-pledge reads and fixed-pledge change requests already belong to the inherited capability. Change requests record service intent/evidence; they do not mutate terms before the authorized staff command. | Where donors discover those reads and requests remains a Phase25 presentation question. |
| [P16 R.5, lines2202–2216](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md#L2202-L2216) | Donor Campaign commitment/progress/request-change copy; no debt/invoice/internal-release wording. This table uses Other commitments for the missionary surface. | Pledges is a proposed short donor navigation label to reconcile with Campaign commitment, not an already mandated label. The separate donor Other projection below also remains governing evidence. |
| [Current #811](https://github.com/Asymmetric-al/core/issues/811) and ratified Q22 evidence/C04/C11 | The donor projection already includes conditional Other commitments for qualified manual recurring or later fixed-pledge facts. Q22 requires it to remain independently available and type-aware. | This question refines primary navigation placement; it does not discover an entirely absent donor capability. Reconcile the selected placement with the same projection, preserve manual/external Other behavior and avoid duplicate independent pledge lists. |
| Ratified Q09/Q22 | Q09 explicitly excludes a fixed-pledge editor; Q22 Current/Past is the recurring owner's view. | Neither chooses fixed-pledge discovery. Q22 remains intact under both choices. |
| [Current donor navigation](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/features/donor/components/DonorSubNav.tsx#L19-L33) | Recurring Giving currently routes to a legacy path named `/donor-dashboard/pledges`. | A pathname is not evidence that real fixed-total pledge discovery exists or that the products should be merged. No route rename is required by this question alone. |
| [Current portal read](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/donor-portal/service.ts#L216-L241) | Capped legacy donor_pledges data is normalized as recurring gifts; target fixed-pledge command/projection implementation is not established. | Source-qualified capability and availability need implementation proof. Legacy cadence/provider linkage cannot classify a fixed promise. |

An initial broad frontier scan suggested convergence because many unchecked notebook items are already-decided implementation/proof work. The fixed-pledge counterexample changed that conclusion: it is an inherited real donor task whose primary navigation placement was not selected. Its conditional Other projection already exists in the target contract; this is not a claim that no donor discovery requirement existed. This specific question supersedes the interim convergence-only notes. Wallet removal, preference cleanup, direct cancellation and optional post-cancel feedback are already governed; they are not being re-asked.

## Common boundaries and the next review

Whichever option is selected, the adversarial review must map one complete pledge journey: direct/neutral entry, source-qualified personal or represented context, current and historical availability, progress and plan meaning, exact detail, authorized change request, truthful result, pending/denied/unknown/source-error states, existing reminder controls and safe return to related giving/history/documents. This is one coherent execution review rather than more small menu-label questions.

Required shared boundaries:

- Preserve ADR0012/P16's two products. No automatic payment, recurring conversion, direct donor amendment/end authority, universal balance/status or new accounting/receipt fact arises from discovery.
- Preserve #811/Q22's independently available typed Other commitments projection and manual/external records. The chosen primary entry and contextual links must resolve the same fixed-pledge owner/view, not create duplicate independent lists or silently remove Other access.
- P12 and the source projection authorize every entry, label, field, count, link and action. Context changes and permission contraction invalidate protected data; no email/household/recognition inference or raw-source browser grant.
- History and documents remain their own source-owned destinations. A pledge promise is not included in Q23's received-giving measure. A source-qualified applied gift is still one received gift, not a second donation.
- Show Request change only under its actual owner capability; no in-place recurring editor or shared Manage-all command. Existing authorized reminder preferences remain distinct from ending/changing a pledge.
- Keep private account layout/navigation Core-owned and compose through shared shadcn/Base UI base-maia. No tenant CMS menu builder, unrelated Home redesign or forced extra phone bottom-bar icon. ReUI remains inspiration for genuine grids, not a reason to render a small pledge summary as an administrative grid.
- Handle zero/none/history-only/incomplete/unavailable distinctly. Selecting a type is read-only. Both options preserve direct links and require useful mobile, keyboard/AT and Back behavior without choosing a new auth, data or notification architecture.

No donor study, rendered target UI, database/provider test, real payment or live account inspection was performed for this next-question research. No implementation/readiness claim, source mutation, GitHub publication, /to-prd or /to-issues is implied. Q14 G01 and other explicit owner/activation gates remain unresolved.

**Question26 remains unanswered: A separate relevant-only Pledges entry is recommended; B groups the two clearly separate views under one giving-commitments parent.**
