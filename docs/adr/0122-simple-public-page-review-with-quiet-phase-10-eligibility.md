# ADR-0122: Simple public-page review with quiet Phase 10 eligibility

**Status:** Accepted (founder ruling, Phase 22 grill session - D5)

## Context

Phase 22 D4 already lets each tenant choose staff review or publication after
checks. A proposed second represented-person and asset authorization workflow
would have duplicated D4 and Phase 10, added a permissions matrix and evidence
ceremony to ordinary page editing, and made the automatic lane functionally
manual. A blanket public/person toggle would instead be too coarse for the
existing strictest-wins safety boundary.

## Decision

D4 remains the sole Review & Release workflow. Tenants configure one plain
organization default and may progressively customize only Missionary Ministry
Page revisions, Project/Campaign Page revisions, and Ministry Updates. In
review mode, authorized staff judge one exact immutable rendered candidate and
normally choose **Approve & publish** or **Request changes**; a secondary
terminal rejection exists only when a submission must stop. In automatic mode,
healthy candidates publish after all checks without entering the staff queue.

Approval is append-only evidence bound to the exact candidate and never floats
to a changed draft. D2's sole compare-and-swap release command independently
re-proves current authority, candidate head, policy, safety, reach, renderer,
and dependencies and reports release truth separately from approval.

Phase 10 remains the quiet, non-overridable public-eligibility ceiling. D1
Display Participant membership identifies who may be represented but does not
imply permission. The D2 Page Release Manifest pins the current Phase 10
verdict/version; Phase 22 does not create a parallel per-person, per-field, or
per-asset permission system, evidence-upload requirement, approval queue, or
authorization manifest. Hard safety exceptions show their cause and permitted
remedy and never offer **Approve anyway**.

## Consequences

- Missionaries learn four ordinary states: Draft, Waiting for review, Changes
  requested, and Published; transient and exceptional truths appear only when
  relevant.
- Staff receive exact previews, concise semantic diffs, actionable feedback,
  and no FYI noise from healthy automatic releases.
- Tenant flexibility is preserved without arbitrary workflow configuration,
  while Phase 10 safety and D2 concurrency guarantees remain unchanged.
- A profile change is prospective and never surprise-publishes an existing
  review backlog.

## Later Phase 22 D26 qualification

D26's one action-bound candidate attestation is the ordinary Phase 22
permission input, not the prohibited second consent workflow. Missing granular
affirmative Phase 10 records alone create no Page checklist, while known direct
objections and stricter current safety still win. Approval of an unchanged
candidate neither repeats the attestation nor becomes rights verification.

## Related decisions

- [ADR-0118 - Typed Public Ministry Pages with explicit contributor assignments](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0119 - Tenant-defaulted, Phase-10-ceiling-resolved Publication Reach](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
- [ADR-0120 - Family-certified Public Page Presentation Profile Versions](./0120-family-certified-public-page-presentation-profiles.md)
- [ADR-0121 - Tenant-chosen Public Content Review & Release Profile Versions](./0121-tenant-chosen-public-content-review-and-release-profiles.md)
- [Phase 10 sensitive-data safety](../prds/sitestacker-parity/phase-10-sensitive-data-safety.md)
