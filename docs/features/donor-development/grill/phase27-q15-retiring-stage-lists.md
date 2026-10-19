# Phase 27 Q15 — ongoing work when a stage list is retired

2026-10-10. **D14 explicitly ratified; Q15 A selected; amended D15 explicitly ratified.** Research and interview
only. No formal PRD/OpenSpec, ticket, product implementation or activation.

## Ratification and decision frontier

The founder instructed, “Yes, ratify this amended D14,” and asked to continue.
The exact [D14 decision and reviewed safeguards](phase27-d14-adversarial-review.md)
are explicitly ratified. Organizations may create additional approved stage lists
on the shared model, with clear configuration and daily-work UX. This confirmation
does not answer any of D14's reserved dependent product choices.

D14 R14 requires practical accidental/obsolete-list treatment before list creation
ships. D10's retirement rules concern individual stages; they do not establish
the lifecycle of an entire list. The next choice is the effect on ongoing work
when an organization withdraws a whole list from new use. It precedes choosing
physical state names, controls or database design.

## Founder question — A selected

**When an organization retires a stage list—stops offering it for new partnership
work—what should happen to partnerships already underway using it?**

A stage list is the menu of stages staff can choose for a partnership. For example,
an organization might introduce a revised process while some partnerships still
use the earlier list. This is an illustrative scenario, not a claim that all
missions organizations change processes this way.

**A — Let existing work continue using that list (recommended).** Staff can still
choose its available stages as those partnerships develop. New partnership work
uses a current approved list. This avoids forcing staff to move existing work just
because the organization changes its options for new work.

**B — Require a replacement list before further stage changes.** Staff must
deliberately move existing work to an approved current list before changing its
stage again. This helps standardize the organization's process, with additional
transition work for staff.

Both choices preserve recorded stages and history. Retirement does not close a
partnership, cancel its follow-up or automatically move it to another list.

**Recommendation:** A. It gives the organization a simple way to stop future use
without disrupting relationships already being managed. An independently retired
stage still cannot be freshly selected. This recommendation is product judgment,
not measured evidence that retaining old lists improves ministry outcomes.

## Evidence and alternative checked

- [D14 R14](phase27-d14-adversarial-review.md) explicitly reserves whole-list
  lifecycle and requires its qualification before additional-list creation is
  released. R09 separates configuration from stage, work, giving and consent.
- [D10 R03/R04/R10](phase27-d10-adversarial-review.md) preserves individually
  retired stage references, requires usable lists available for new work and
  prohibits implicit record migration. These protect integrity without deciding
  whether ongoing work can keep choosing stages after whole-list withdrawal.
- [D12](phase27-d12-adversarial-review.md) allows direct eligible stage choice;
  [D13](phase27-d13-adversarial-review.md) permits no initial recorded stage.
  Q15 must work for already assessed and still-unassessed ongoing partnerships.
- [P27 ownership and next-action discipline](../../../prds/sitestacker-parity/roadmap.md:4087)
  and [retained owner constraints](../../../prds/program-roadmap/owner-constraints.md:17)
  preserve one cultivation model, source-owned responsibility and normal follow-up.
  [Platform boundaries](../../../../openspec/specs/platform-boundaries/spec.md:13)
  require coherent shared behavior across authorized surfaces.
- Independent source-contract review recommended comparing continuing stage use
  with a deliberate replacement requirement before future stage changes. Requiring
  every existing record to move **before stopping new use** is a weaker alternative:
  it could prolong obsolete choices while migration remains unfinished. B instead
  supports consistent current practice without that dependency.

These are repository intent and interview evidence. They do not prove implemented
retirement behavior, staff usability or database/API correctness. Existing D14
mechanics evidence does not cover whole-list retirement; no such test is claimed
or repeated for this documentation-only continuation.

## Boundaries and consequences to review after the answer

- Both offered options propose stopping new partnership admissions to the old
  list. Neither this common proposal nor A's ongoing stage use is adopted until
  the founder answers. This is not a tenant-toggle or dual-policy commitment.
- A would expressly permit continued normal stage choice for ongoing work on the
  withdrawn list, subject to existing stage eligibility and current permissions.
  That permission is the new product choice, not an inherited D10 fact.
- B would require a qualified, deliberate existing-work list-change path before
  activation. It does not authorize automatic mapping by stage name/order, a
  duplicate journey, a new assessment, or broad bulk-migration tooling.
- Neither option grants a catalog configurator access to journeys, history or
  usage counts. Withdrawal and resulting reads/mutations remain source-governed
  under P12. Normal obligations, privacy restrictions and source ownership remain.
- No closure, task cancellation, notification, outreach, consent, giving or owner
  change follows from withdrawal. Existing recorded history remains truthful;
  governed retention/redaction is separate from ordinary configuration.
- Paused and closed return cases, configured defaults if any, restoration,
  switching details, retention of unused lists and failure/concurrency behavior
  must be resolved explicitly in the selected answer's review or later dependent
  questions. D8/D9 preserve returning journey identity and recorded stage; that
  alone does not decide future stage choice on a withdrawn whole list.
- UI wording must distinguish a list unavailable for **new work** from an
  individually unavailable stage, a closed partnership and missing permissions.
  No “Archived,” “Published,” “Restore” or persistent-draft feature is selected by
  this question. Exact controls and edge-state UX follow the reviewed policy.

## Answer and completed review

The founder selected **A — Let existing work continue using that list**, emphasizing
tenant flexibility, excellent UX/UI and careful edge-case handling.

The [full D15 review](phase27-d15-adversarial-review.md) records all 22 categories,
16 exact requirements, 20 acceptance criteria, concrete user states, five evidence
appendices and nine new isolated PostgreSQL checks. **Disposition: Accept with
required amendments.** The selected ongoing-work capability is recorded. Four
material additions were proposed for explicit ratification: retained-list use on
qualified same-journey return, same-identity reversal with saved-list retention, a selectable-stage minimum
for every retained usable list, and deliberate zero-new-list configuration with
valid dependency treatment. The founder subsequently instructed, “Yes, ratify
this amended D15.” The exact amended decision and all reviewed safeguards are
explicitly ratified on 2026-10-10.

The sections above retain the pre-answer question and its reservations as dated
provenance. The completed review supplies the exact amended decision and permanent
safeguards. No next founder answer, formal spec, implementation or phase-readiness
claim is inferred. The session now continues from the ratified D15 boundary.

The subsequent [Q16 — list applicability](phase27-q16-list-applicability.md) received
A: shared approved choices within source/permission boundaries, without additional
process-specific restrictions. The [D16 review](phase27-d16-adversarial-review.md)
accepts that choice without a material amendment, subsequently explicitly ratified
by the founder. Initial defaults and saved-choice
correction/switching remain dependent decisions.
