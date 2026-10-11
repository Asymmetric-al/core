# Phase 27 Q30 — assignment rules and existing staff responsibility

2026-10-11, Asia/Bangkok. **Amended D29 and amended D30 explicitly ratified;
Q30 A with optional B selected. Review disposition: Accept with required amendments.** Research/interview only.
Formal PRD/OpenSpec remains for /to-prd and tickets for /to-issues. Original question
framing below is preserved as history; the selected answer and completed review
are recorded at the end. No source assignment or live policy is changed.

## Why this is the next substantive question

The [P27 roadmap](../../../prds/sitestacker-parity/roadmap.md:4085) and
[retained owner requirements](../../../prds/program-roadmap/owner-constraints.md:13)
already require rule-based assignment, manual override, transfer and assignment
history. Whether to support automatic initial assignment is not being reopened.
They do not settle whether a later rule or relevant record change can replace an
existing staff assignment without a person reviewing that transfer.

[P9 A12](../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:485)
owns staff-assignment relationships, multiple role-qualified assignees and one
primary; portfolios are derived views, not separately writable lists.
[D5's boundaries](phase27-q5-accountability-default.md:182) explicitly distinguish
an initial partnership-lead default from standing reassignment. A supporter's
overall representative, a particular partnership lead and individual Request/task
owners remain different responsibilities.

This fork determines how an organization manages established relationships and
staff workload. It is a material operating-policy choice, not another field,
confirmation-dialog or stage-management question. D21 delegates the routine UI,
collision and recovery details once this direction is chosen.

## Original founder question — A with optional B selected

**Q30 — When assignment rules change, may Core automatically move an existing
relationship to another staff representative?**

For example, a missions organization changes its regional boundaries while a
church already has a church-relations representative. This is an illustrative
scenario, not a claim about an observed tenant's process.

**A — Review transfers of existing relationships (recommended).** Rules can
automatically assign new or unassigned relationships. Existing assignments change
through a deliberate staff action, individually or as a reviewed group. Show the
current representative, proposed representative, reason and affected work together.

**B — Let each organization enable automatic transfers.** Keep reviewed transfers
as the default, but let a tenant explicitly enable approved rules to update
existing rule-managed assignments. Preserve deliberate exceptions, history and
accountable handoffs. This reduces review work for organizations that want
territory or routing rules to keep existing assignments aligned continuously.

**Recommendation: A.** It keeps useful initial routing while avoiding unexpected
changes to established responsibility. B is a credible flexibility option with a
larger automatic-change surface and more policy/recovery obligations. No evidence
establishes a universal ministry preference. A permits deliberate bulk transfers;
it does not require a separate approval workflow or one dialog per relationship.

Both choices address the particular staff-assignment role, not every person who
works with the supporter. Neither automatically transfers partnership leads,
Requests or tasks, grants access, starts cultivation or sends a message.

## Original boundaries and consequential design — preserved history

- Use current same-tenant source assignment authority and eligible staff. A new
  or unassigned role slot is not a blank check to add every available staff role,
  infer a primary representative or choose arbitrarily among conflicting rules.
- Preserve deliberate overrides and explain why the current assignment exists.
  Show actual current responsibility, a proposed change and any unresolved
  handoff distinctly. Record source history, not a second portfolio membership.
- Account for affected open work through each owning domain. A changed Party
  representative alone does not transfer a partnership lead, Request, task,
  permission, financial obligation or protected information. Do not falsely mark
  a handoff complete. Missing eligibility produces an owned repair path, not a
  silently ownerless obligation or restored access for departed staff.
- The optional [Studio staff-transition pattern](../../../prds/workflow-studio/07-core-workflow-catalog.md:47)
  includes receiving-owner acknowledgment. Preserve that requirement for work
  using that qualified pattern; it does not establish a global acknowledgment
  ceremony for every Party edge edit. Neither answer bypasses an applicable
  source-owned acceptance requirement. Native operation remains independent of
  Studio.
- Under B, an automatic transfer must be within an explicitly enabled policy's
  exact role/scope and existing rule-managed assignment. Current revisions,
  eligibility, protected exceptions and required handoff conditions still gate
  it; an unmet condition leaves a visible source-owned exception. Enabling or
  changing that policy needs understandable impact and prospective semantics,
  not an uncontrolled rewrite of all history. This is a consequence to review if
  B is selected, not permission to implement it now.
- Either choice needs concurrency-safe, repeatable source commands, finite bulk
  outcomes, truthful failure recovery, revocation safety and clear correction.
  No global replacement enum, territory engine, shadow queue, schema or arbitrary
  numeric limits are selected by this question.

## Current primary comparisons and limits

Retrieved 2026-10-11 UTC:

| Source                                                                                                                                                                                                                       | Verified comparison                                                                                                          | Boundary                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Salesforce nonprofit portfolio guidance](https://trailhead.salesforce.com/content/learn/modules/nonprofit-cloud-philanthropy-and-partnerships/manage-portfolios-and-view-donor-profiles), undated current official training | Describes organization-defined automatic assignment and manual assignment/reassignment within fundraising portfolios.        | Supports both routing and staff control. Does not prove automatic transfer of established ministry relationships is preferable. Do not import automatic cultivation admission, wealth criteria or vendor access semantics.                 |
| [HubSpot assignment/rotation guidance](https://knowledge.hubspot.com/workflows/assign-and-rotate-record-owners-using-workflows), updated September 1, 2026                                                                   | Makes overwriting an existing owner an explicit configuration choice, distinct from choosing eligible assignment recipients. | General CRM precedent for separating initial routing from replacement. Core retains native source commands, its own eligibility rules and D21 restraint; no new workflow dependency, vendor sync or routing-algorithm requirement follows. |

The older HubSpot URL did not resolve through the research tool; the current
official page above was found and read. These comparisons support a genuine
tradeoff, not a consensus or measured missions outcome. No practitioner interview,
product experiment, live assignment proof or usability qualification is claimed.
Two independent repository reviews identified this as an unsettled product branch.

## Recorded answer and completed review

The founder selected **A with the option of B, controlled by each tenant**, and
requested deep current-practice research, excellent clear UX and the complete
adversarial review. The [D30 review](phase27-d30-adversarial-review.md) records
**Accept with required amendments**, the exact corrected decision, all 22
categories, five research appendices, independent challenge, R01–R18 and AC01–AC40.
The earlier A-only recommendation is not the selected product scope. The founder
subsequently instructed, “Yes, ratify this amended D30.” The exact reviewed decision
and safeguards are explicitly ratified on 2026-10-11, Asia/Bangkok, without
substantive change or another ratification gate.

Reviewed existing-responsibility transfers are the default; tenants can explicitly
enable bounded automatic changes to qualified rule-managed responsibilities.
Preserve manual choices, intentional unassignment and unknown provenance. Saving
drafts is inert; activating policy is prospective, with separate finite reviewed
application to current matches. Current source authority, role-aware identity,
primary handling, exact work continuity and safe disable/re-enable govern all
paths. The review resolves the P9 A4/A12 role-identity conflict and specifies a
clear current/proposed/protected assignment experience with honest recovery.

D29 and every prior decision/evidence artifact remain preserved. The glossary
captures the reviewed policy and manual-exception meanings, without schema.
[Document verification](d30-evidence/review-checks.json) checks structure, links and
preservation; actual source/RLS/concurrency/migration/performance/usability proof
remains required before activation. Formal PRD/OpenSpec and tickets still require
/to-prd and /to-issues. No extra routine micro-question is queued.

## Continuation after D30 ratification

The [post-D30 coverage synthesis](phase27-post-d30-coverage-synthesis.md) compares
the original brief, governing scope and D1–D30. No further Phase 27 founder question
is presently identified. D21-delegated design and exact owner/proof obligations are
recorded separately, including unresolved upstream E7 and C-01 finance conflicts.
No Q31 answer, whole-phase readiness or formal specification is inferred. Formal
consolidation remains the separately invoked /to-prd step.
[New ratification checks](d30-ratification-coverage-validation.json) preserve the
original Q30 framing, exact D30 body and all dated review evidence.
