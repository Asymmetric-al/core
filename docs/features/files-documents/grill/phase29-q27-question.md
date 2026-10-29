# Phase 29 Q27 — Staff email for newly actionable document review

**Status:** Historical researched question prepared 2026-10-22, Asia/Bangkok.
Conrad selected Q27 A and fully ratified all required amendments: keep staff
email opt-in with the complete source/policy/cohort and recovery protections.
Q01–Q27 are ratified grooming intent; twenty definitions remain unchanged.
No implementation or activation follows.

## Historical question and alternatives

**When a new submission or correction creates actionable ordinary document-review
work, should optional email to the source-authorized reviewers start off or on
in the tenant's default notification plan?**

Both options retain current source/request and My Work presentation, qualified
person/team responsibility and the already-required inline correction warning.
Both let authorized tenants configure the supported staff-email step through
the existing bounded notification settings. This is not a choice between useful
work visibility and manually searching every request.

| Option                                                  | Practical behavior                                                                                                                                                                               | Benefits                                                                                                                                                    | Costs and boundaries                                                                                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Keep staff email opt-in (recommended)**           | The new actionable review work appears in the existing source/My Work experience. Its optional staff-email step starts Off; an authorized tenant can turn it On for future eligible occurrences. | Avoids default email for each meaningful incoming item/correction when staff already use the work surface; tenants can enable the extra cue where it helps. | Staff who seldom open Core may discover work later until the tenant enables email. The work surface is not proof that anybody noticed it; make the effective setting easy to find and understand. |
| **B — Email reviewers by default, with tenant control** | The same source/My Work experience remains, and a qualified default plan also enables the optional staff-email step. Tenants can turn it Off.                                                    | Provides an outward cue for staff who work across systems or review intermittently, reducing dependence on checking the work surface.                       | Several incoming items or repeated genuine corrections can produce noise. Enabled does not guarantee eligibility, delivery or reading; it cannot email every team member by assumption.           |

**Recommend A.** Current review work already has a durable place in Core under
Q24, and Q03 already protects a reviewer from unknowingly acting on superseded
evidence. Staff email is an additional awareness aid, not the source of work.
Keep it readily configurable for tenants whose reviewers need it, without
introducing default inbox traffic for every tenant.

B is a strong alternative for part-time, external-to-the-tool or cross-system
reviewers. No evidence establishes that all ministry staff monitor Core daily,
or that A produces faster review. This recommendation is a bounded product
judgment about the starting policy, not a measured Asym preference. It does not
reverse Q26's different recipient-facing Request changes notice.

## Practical example and simple journeys

Illustrative scenario, not observed ministry research: Nora submits corrected
evidence for one requested item. The native source admits it, preserves the
correction lineage and determines when current evidence can actually be reviewed.
Elena, or a qualified source-owned team route, is responsible for that work.

- With **A**, the existing work view reflects the current item and review need;
  Elena receives this extra email only if the tenant has enabled it and her
  exact recipient/contact/notification eligibility permits it.
- With **B**, the qualified default requests the extra email without tenant
  opt-in. The tenant can disable it when the work view is sufficient.
- In both, the reviewer sees the current exact evidence and correction warning
  without losing reading context. No new manual claim, duplicate task or
  permission grant is introduced. Reading an email cannot accept the item.

The tenant sees a clear setting for **New document review work**, with supported
Who/How, effective On/Off and inherited-policy explanation in the existing P17
surface. Review staff need no additional per-submission toggle. The participant
does not choose staff email recipients or staff notification policy.

Show only source-authorized recipient information. A named person can be the
eligible recipient; a team route needs its exact finite, independently qualified
concrete recipient resolution. Do not silently email all members, administrators,
the creator or an unproved shared mailbox. A reviewer without plan-management
authority can understand the permitted effective consequence and use an owned
help route without receiving administrative powers.

Email should lead to current authorized work through the existing staff doorway,
with minimal safe content. If someone else already reviewed the evidence, show
the truthful current outcome and other permitted work; no false outstanding
task or requirement to review again. If authority changed, deny private detail
and offer permitted recovery. No attachment or direct storage link is needed.

## Research and strongest counterevidence

Primary documentation was checked on 2026-10-22. These are documented product
patterns, not measured Asym user behavior or a universal notification default.

| Source                                                                                                                                                                        | What is established                                                                                                                                                                                     | Boundary for Core                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [FileInvite — Notification preferences](https://help.fileinvite.com/articles/managing-notification-preferences), current undated guide                                        | Request submission email starts disabled; its Ready for review email starts enabled and means all documents were submitted. It treats granular submission notices differently from aggregate readiness. | Supports a deliberate noise/awareness distinction, not a universal default-off rule. Core's ordinary item review must not wait for all request documents merely to copy this aggregate trigger. No two-hour batching, master mute or automatic-save behavior is imported. |
| [Submittable Next — Complete a review](https://next.support.submittable.com/hc/en-us/articles/42009269512343-How-to-Complete-a-Review), updated October 15, 2026              | Documents email for new review assignments alongside a Review Assignments work list.                                                                                                                    | Strong evidence for B: durable work visibility and email can complement each other. Assignment is not the same occurrence as new evidence becoming actionable, and Core does not import scoring rounds, mandatory confirmation or that product's controls.                |
| [Submittable Next — Email communications overview](https://next.support.submittable.com/hc/en-us/articles/41676497661335-Email-Communications-Overview), updated July 6, 2026 | Intake Revision Submitted mail goes automatically to Program Admins outside configurable Setup. Templates and active trigger setup are otherwise distinct.                                              | Supports notifying staff about revisions, but its administrator audience and non-configurable system mail conflict with Core's source-specific recipients and the desired tenant flexibility. Neither is copied.                                                          |
| [HubSpot — User notifications](https://knowledge.hubspot.com/user-management/how-to-set-up-user-notifications-in-hubspot?isVariant=b), current guide                          | Distinguishes organization defaults, user choices and channel/topic settings; personal settings may narrow configured defaults.                                                                         | Supports visible effective configuration, not a new Core personal preference center, arbitrary channel list or general mandatory-notice rule. Actual meaning-specific Core policies still govern.                                                                         |

The evidence is mixed in a useful way: coarse review-ready/assignment alerts
are often enabled, while more granular submission notices can be optional.
Core's exact source grain and real repeated-review journey matter more than
copying a competitor's label. Neither A nor B requires a digest, delay, cooldown,
reminder schedule, notification quota or a whole-request readiness gate.

## Why this is genuinely unresolved

The [owner research](phase29-q27-owner-research.md),
[runtime research](phase29-q27-runtime-research.md) and
[comparative research](phase29-q27-comparative-research.md) retain exact evidence.
Repository locators below are relative to `/home/conrad/code/core`.

- Feature ADR-0024 `0024-person-or-team-review-responsibility.md:63–76,91–104`
  already preserves one coherent logical review-work identity and the existing
  request/My Work experience. Its notification-default exclusion is explicit.
  Q27 must not re-ask whether staff can see their current work.
- Q03-C11/C17 already require inline correction awareness and coherent durable
  source/task projections, without unconditional mail on every file event.
  Durably received correction can remain checking; receipt is not reviewability.
- Q21 makes the meaningful requested item/evidence set the review unit. A file
  transfer, scanner result, preview-ready flag, row mutation or task materializer
  is not independently the new staff-email source occurrence.
- Platform ADR-0183 requires source-owned actionable work and current authorized
  projections. Platform ADR-0027 keeps bell engagement separate: a source task
  does not automatically create a P6 in-product notification or bell event.
- Q25 first-issuance readiness does not create a later intake/email dependency.
  Q26 is a recipient-facing review-result notice, not this staff incoming-work
  notice. Its default-on rule and special Off narrowing do not silently apply
  to a different source purpose.
- P17/P6 provide finite role/resolver/step contracts, complete plan compilation,
  current eligibility, truthful independent delivery and bounded tenant control.
  Their access-request staff-email default-off is a different exact purpose;
  it is a precedent, not an answer to Q27.

The relevant source event is **newly actionable ordinary item review work caused
by first submission or current correction**, not every incoming file and not
the whole request being complete. This is a source predicate/occurrence to
qualify, not a new Review-ready aggregate, a universal all-scans-ready rule or
a human-review SLA. The source owns the exact current work, causal evidence
and applicability. A supported qualified inspection path remains source-owned.

## Boundaries shared by both options

1. **Keep existing work and recipient experience intact.** Required source/My
   Work updates and Q03 inline warnings occur under their existing contracts
   regardless of staff email. No new task, in-product attention step or bell
   event is selected. Q26 recipient feedback email remains independently governed.
2. **Configure through the existing owner.** Both alternatives require a real
   bounded tenant setting and honest effective state, with permitted audience,
   content, locale, sender/reply and applicable personal narrowing only. No
   arbitrary contact picker, participant-controlled staff recipients or new
   global preference center. Missing/legacy/unknown configuration is not On.
3. **Use exact source recipients.** Consume the source's currently admitted
   review-work recipient set with independently qualified notice/contactability
   authority. Responsibility, task row, team membership and source access are
   distinct; no all-member/creator/admin fallback. A task projection need not
   already have materialized for a source-authorized notice to qualify.
4. **Preserve one coherent occurrence.** Repeated processing/retry of the same
   source occurrence is not new mail. A genuine later actionable correction
   remains distinct. Prove complete finite recipient resolution and whole-plan
   release, including valid zero; partial/unknown is not zero or a subset.
   Enabling later cannot append members to historical off/zero results.
5. **Keep currentness and outcomes honest.** Resolve source/recipient/suppression/
   connection/plan/action rules at their required boundaries. Newer correction,
   review, closure or authorization changes must not send stale work promises.
   Email failure cannot hide or erase work, and delivery/opening cannot accept,
   complete or grant it. The selected answer's full review must explicitly
   reconcile any required pending-work Off behavior with general plan pinning;
   Q26's meaning-specific exception is not inherited by analogy.
6. **Qualify the actual native profile.** A qualified staff-email source needs
   exact meaning/binding/recipient/action/material/recovery proof. The existing
   optional-staff material class is for a sibling of required in-product
   attention; do not accidentally inherit it while this question adds no such
   sibling. No fake bell requirement or unrelated financial key may fill a gap.
7. **Keep this decision small.** No assignment/handoff email, completion email,
   source-technical-failure alert, reminder, digest, batch-review mode, new
   transport, staff cohort cap, recipient clock or permission change is chosen.
   Do not create a new notification service or wait for whole future studios.

## Implementation and evidence limits

Current finance initial-review/outcome helpers and generic task projections are
adjacent evidence only. Their administrator/profile recipients, preference
defaults, direct sending and dedupe behavior do not qualify this native source
purpose. No new runtime, provider, deployed role/RLS, browser/AT or intended-user
test was performed; no mail was sent. Current UI or old tests are not proof of
native review-work email correctness.

Local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; fresh live develop
remains `7df55820eee8a1e0076dea489f3836e8d15d7c69`. There is no new drift from
the Q26 reviewed snapshot and no pull. Earlier targeted live comparisons remain
dated evidence, not a claim of local/live equivalence or native qualification.

## Historical preparation scope and snapshot

Q01–Q26 are fully ratified, with all twenty definitions unchanged. Q27 asks
one default decision, recommends A and has no selected answer. No feature
ADR-0027 or new glossary term is created. The selected answer receives the full
adversarial review before amendment ratification. Broad File Manager, library,
custody, format and disposition decisions are not declared complete.

Formal owner/OpenSpec publication remains `/to-prd`; tickets remain `/to-issues`.
This question changes no implementation, schema, permissions or provider state.

## Historical founder answer and review — before ratification, 2026-10-22

Conrad selected **A — Keep staff email opt-in**, requesting deep research and
the full adversarial review against governing docs, excellent UX/UI, all user
journeys and exact amendments, with flexibility and no overengineering.
The [full review](phase29-q27-adversarial-review.md) and
[ADR-0027](../docs/adr/0027-opt-in-staff-email-for-source-actionable-review.md)
record the corrected decision and complete required package awaiting ratification.

Keep native staff email Off by default and expose useful bounded tenant opt-in,
while preserving source/My Work/Q03 correction awareness. Bind original policy
and required enabled cohort at the authoritative first actionability boundary,
not worker/upload time; old Off work cannot acquire mail after On. Known Off
can prove zero without unused roster/contact lookup; unknown required proof
stays unresolved with source work intact and original-boundary recovery. Same-
basis readiness oscillation is not new mail; genuine correction can be distinct.

Adopt an explicit Q27-only Off-before-submission narrowing with immutable pins,
in-flight truth and no intervening-Off revival after On. Qualify actual finite
staff recipients and email-only material, not Q01's participant branch or a fake
bell sibling. No per-upload choice, new preference center, task duplication,
assignment mail, digest/reminder or notification engine follows.

The package has ten clauses, 26 proof groups, seventeen journeys, sixteen
lifecycle distinctions, six controls and all 22 category outcomes. Independent
owner/runtime/UX checks found no material issue. No new term, native release
qualification, formal publication or Q28 answer is inferred.

## Full ratification — 2026-10-22

Conrad fully ratified Q27 A and all required amendments: the corrected decision,
Q27-C01–C10, Q27-P01–P26, seventeen journeys, sixteen lifecycle distinctions
and six controls. Original-boundary admission, independent work, exact staff
audience/material and the explicit Q27 Off rule are adopted. Earlier pending
question/review text is dated provenance; ADR-0027 and the full review record
current adoption. Q01–Q27 are ratified; twenty definitions remain unchanged.
Q28's answer, native qualification, implementation and publication are not inferred.
