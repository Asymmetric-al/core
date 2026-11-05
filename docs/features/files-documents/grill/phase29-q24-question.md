# Phase 29 Q24 — Responsibility for ordinary review

**Status:** Historical researched question prepared 2026-10-21, Asia/Bangkok.
Conrad selected A and fully ratified its complete amendments on 2026-10-22:
allow a qualified person or team to own review, with flexibility, excellent UX/UI
and no overengineering. Q01–Q24 are ratified grooming intent. No implementation
or activation follows.

## Historical question and alternatives

**May an eligible person or a qualified team own ordinary review responsibility,
or must that responsibility resolve to a named individual before staff review
actions can proceed?**

| Option                                                               | Practical behavior                                                                                                                                                                                                                                                                                                                                 | Benefit                                                                                                                     | Cost and consequence                                                                                                                                                                                                                             |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A — Allow a qualified person or team to own review (recommended)** | The source resolves an accountable review responsibility to an eligible individual or an explicitly qualified shared team route. For team-owned work, a currently authorized human may review without first changing responsibility to a named individual merely as an ordinary prerequisite. Every decision still records its actual human actor. | Fits both a small staff and shared coverage, without unnecessary individual-assignment changes or an additional claim step. | Team responsibility must be real and visible, with current source eligibility and an owned response when nobody can act. A team label or queue row alone is not permission or evidence of readiness.                                             |
| **B — Require a named individual before review**                     | The source must resolve review responsibility to one named eligible individual before ordinary review decisions are actionable. Teams may organize or route work, but cannot remain its sole responsible assignee at that point.                                                                                                                   | Makes the accountable person explicit and can simplify personal workload tracking and handoff expectations.                 | Adds an individual-assignment dependency and requires a usable handoff when that person is unavailable or ineligible. It does not automatically make that person the only authorized reviewer, require a Claim button, or add a second approval. |

**Recommend A.** Keep responsibility explicit while allowing the tenant's actual
staffing arrangement to fit. A valid source responsibility can be reused rather
than asking staff to pick a person repeatedly. Small organizations can use a
person; a qualified team route can support shared work. This selects the permitted
responsibility shape, not a new routing engine or a hard-coded creator default.

B is a reasonable product choice where individual accountability must be
established before review. It is meaningfully stronger than naming the person
who actually decides: Q21/Q23 already require the latter under **both** options.
Neither option permits an unaccountable “any admin” assignment or grants access
through team membership, task assignment, a queue, a watcher or a contact label.

## Practical example and clear UX

**Illustrative example, not observed ministry behavior:** a request is waiting
for document review. Ana and Ben work with the same qualified review team.

- With **A**, the request can show **Review responsibility: Document review team**.
  Ana can perform an allowed review under her current source authority; her
  acceptance or Request changes decision records Ana. Ben may handle later work
  only if his own current authority permits it. The team can remain responsible
  without a compulsory responsibility transfer for each decision.
- With **B**, the work must have a named eligible responsible person, such as
  Ana, before review is actionable. The source needs a real authorized handoff
  if that responsibility can no longer be fulfilled. Naming Ana does not, by
  itself, prohibit an otherwise-authorized colleague from helping or grant Ana
  access she lacks.

In either case, the staff view should clearly distinguish **who is responsible
for pending work** from **who actually made a recorded decision**. The participant
should continue to receive the source-approved contact/help route; internal team
rosters, routing changes and staff identity are not automatically public details.

Keep the existing request and My Work context. Do not add a separate queue
console, mandatory Claim step, review lock or per-team-member duplicate task.
The existing Q21/Q23 exact-state boundary handles competing review decisions;
this choice does not replace it with a viewing lock. Reassignment is not a new
acceptance, corrected submission, access grant or completed-read clock.

If no qualified destination or actor resolves, preserve an explicit assignment
or eligibility problem and an accountable source recovery route. Do not pick the
first database row, widen access to all administrators, fabricate a person or
present unauthorized work as ready. This question does not decide whether
collection may begin before review responsibility is resolved; it defines the
responsibility requirement for ordinary review actions. Existing source issuance
and eligibility rules remain authoritative.

## Current primary research

Official sources were read on 2026-10-21. The
[comparative research](phase29-q24-comparative-research.md) preserves details and
product-surface limits; these are documented capabilities, not observed Asym
staffing patterns or measured workload improvements.

| Source                                                                                                                                              | Verified behavior                                                                                                                                                                                             | Useful lesson and limit                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [FileInvite roles](https://help.fileinvite.com/articles/invite-roles-point-of-contact-watchers), current undated guide                              | Distinguishes Assigned Team organizational ownership, an internal Assignee, a participant-facing Point of Contact and Watchers. Assigning a Team is explicitly different from adding its members as Watchers. | Strong close-product evidence for separating responsibility, actual work, contact and notifications. The guide has a login-edition routing notice. It does not prove exclusive team review authority, Core's source permissions or a required four-field UI. |
| [Content Snare request essentials](https://contentsnare.com/help/knowledge-base/step-2-essentials/), updated 2024-09-23                             | Uses a named request owner, defaults it to the creating user and permits another team member to be selected.                                                                                                  | A credible named-owner model supporting B's accountability case. Core does not inherit the creator default, email sender, reminders or unrestricted reassignment from that product.                                                                          |
| [Content Snare team permissions](https://contentsnare.com/help/knowledge-base/team-permissions/), updated 2026-02-09                                | Describes Reviewer permission to approve/reject separately from request ownership.                                                                                                                            | Supports distinguishing ownership from allowed review. It does not establish all Core team members' permissions or justify copying its role defaults, user limits or identity workarounds.                                                                   |
| [Blackbaud Grantmaking reviews](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reviews.html), current undated guide | Its optional grant-evaluation feature allows named reviewers or committee selection and keeps decision permissions distinct.                                                                                  | Relevant nonprofit evidence that different review arrangements exist. Committee selection is not proof of shared unclaimed file-review responsibility; its stages, invited reviewers, notifications and final funding decisions are not imported.            |

The products support more than one legitimate model. A is the flexible ordinary
recommendation because it permits source-qualified individual and shared work
without a universal additional individual-assignment prerequisite. B is not
dismissed as outdated. No claim is made that a team queue improves review speed,
that named ownership prevents all stalled work, or that ministries universally
prefer one arrangement.

## Governing repository intent

The [owner research](phase29-q24-owner-research.md) and
[runtime research](phase29-q24-runtime-research.md) preserve exact citations and
the boundary between permitted intent, current adjacent code and native proof.

- The founder brief `Pasted text.txt:219–231` calls for a responsible reviewer,
  source-owned outcomes and native operation through shared tasks. It does not
  require every responsibility to be one fixed human or introduce a new queue.
- `docs/prds/workflow-studio/01-product-and-experience.md:33–39` binds named
  responsibilities rather than hard-coded people by default. Resolution may
  yield an eligible principal, a permitted team queue or Needs assignment.
  Ambiguity does not pick the first row; assignment never grants access.
- That is **not** universal adoption of every team-routing behavior by every
  source. `12-owner-bindings-and-decisions.md:24–28` requires exact source
  vocabulary, eligibility, consequence and recovery for queue/delegation/return/
  reassignment. Q24 chooses the ordinary-native profile within those boundaries.
- The fresh live Workflow OpenSpec **Role Bound Shared Tasks** requirement is
  full inline at `specs/workflow-studio/spec.md:129–137` within
  `openspec/changes/add-workflow-studio-program-contracts/`. It requires shared
  source-owned tasks and eligible owner resolution/fallback without widening
  access. Source Authority `:19–27` and Participant Journeys `:159–167` preserve
  source truth and safe participant disclosure.
- P9's one-primary rules for CRM relationship/portfolio roles do not establish
  a named-only document-review policy. Shared tasks are projections, not the
  authority to accept evidence or return it for changes.
- Q21/Q23 already require a current authorized human actor and exact evidence
  attribution. A team can carry responsibility under A; it cannot be recorded
  as if it were the human who reviewed. Q22 fulfillment still requires the
  complete source rule; assignment is not fulfillment or acceptance.
- Existing specialist individual-review, purpose, confidentiality and
  separation-of-duties rules remain. Neither choice weakens a source that
  requires a particular qualified individual or protected review arrangement.

Source-derived default resolution should remain explicit and qualified. This
question does not pick creator-always, all-admins, round-robin, availability
calendars, workload scoring, per-item routing overrides or a general policy editor.
Where the source cannot qualify a shared route, an eligible individual or the
source's explicit assignment-needed recovery remains necessary; A is not a
fallback permission for any organizational Team.

## Current behavior and limits

The inspected `packages/api/src/admin/mission-control-tasks/assignment-policy.ts`
supports actor_only, queue_only and actor_and_queue, defaulting to the last.
Those are assignment shapes, not a native eligibility check. The service/store
is contribution-oriented; its default is not the ordinary document-review decision.

`packages/api/src/admin/contribution-operations/approval-notifications.ts:475–487`
actually creates queue-only financial approval work with no named assignee.
Its separate approver lookup at `:213–227` uses tenant admin/super_admin profiles.
This proves a nearby queue-only precedent, not a qualified native team model,
source-purpose permission or a safe “all admins” default. Finance decision
capability and separation of duties remain separately enforced.

Current generic task views, queue storage and adjacent unit tests do not prove
native membership changes, backup, handoff, blocked-assignment recovery or real
tenant/RLS/source eligibility. No new runtime tests were run. The selected answer
will receive its full adversarial review, including those exact boundaries and
the complete staff/participant journey, before ratification.

## Scope and recording boundaries

This is one choice about ordinary review responsibility. It does not add a
mandatory Claim control, exclusive lease/lock, second reviewer, new queue engine,
watchers, notification policy, roster disclosure, team-wide file sharing or
source capability. Default inheritance and any later reassignment must consume
the existing qualified source/P12/P9 rules rather than duplicate them. No new
request-issuance or access-clock policy is selected.

Q01–Q23 are ratified with all required amendments. Further source responsibility
details, feedback delivery and broader File Manager/library/format/custody/
disposition work remain grooming scope; this question does not claim Phase29
readiness. At preparation no Q24 answer, ADR-0024 or glossary term was
recorded. The later selection/review below adds one term while preserving all
nineteen earlier definitions and pre-existing product edits.

### Preparation snapshot — 2026-10-21

Local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; fresh live develop
remains `dfaa201242c6ad468bf2d343aa18e8f223f67c5c`, without new relevant drift or
pull. The full-contract-reference authority convention still applies; read full
incorporated sections with their source/status. Local code and newer live
dependency snapshots remain distinct. No private-data/provider action,
implementation or formal publication occurred. Owner/OpenSpec publication remains
`/to-prd`; tickets remain `/to-issues`.

## Historical founder answer and review — before ratification, 2026-10-22

Conrad selected **A — Allow a qualified person or team to own review**. The
[full adversarial review](phase29-q24-adversarial-review.md) recommends **Accept
with required amendments**. Its exact corrected decision, Q24-C01–C08,
Q24-P01–P20, ten journeys, eleven lifecycle distinctions and six operational
controls await ratification. The
[feature ADR](../docs/adr/0024-person-or-team-review-responsibility.md) records
selected/reviewed status. One new term, Document Review Responsibility, is part
of this package; the nineteen prior definitions and decisions are preserved.
Q25 has not been asked.

A qualified source team may remain responsible during actual human review with
no mandatory Claim or nominal personal transfer. Separate responsibility
administration, destination qualification, actual source/P12 review authority,
historical reviewer and participant contact. Responsibility grants no access
and a handoff does not universally revoke independently valid access. Real
permission/source changes still govern subsequent actions.

Reuse valid source responsibility/defaults and preserve deliberate handoffs
against stale projection. Apply actual source-defined dynamic changes through
qualified transitions without inventing universal snapshotting or inheritance.
Distinguish known unassigned/invalid/no eligible actor from unknown lookup and
temporary absence. Retain known work and require a capable source recovery route,
not a team label, all-admin fallback, nominal assignee or calendar system.

Source-owned handoff preserves one logical work identity, old/new/actor history,
durable effects, earlier human reviews, correction lineage and fulfillment.
Fence material races; do not force reinspection for unrelated coordination.
Known success and independent work survive ancillary failure; old retries cannot
restore obsolete responsibility. No new intake/completion gate, recipient-clock
reset, access grant, automatic rereview or assignment-notification policy.

Use existing request/My Work, clear person/team labels, truthful source status,
accessible predictable changes and participant-safe help. Qualify effective
database/grants/RLS/privileged paths, real recovery/races/restore/mixed versions,
bounded workload and composed browser/AT/user journeys before activation.
No new Team/Queue/Claim engine, extra reviewer or whole-Studio prerequisite.

Local HEAD remains 3d85897; live develop advanced to
`8906631256bc1dd95d4d7ba8c11a7409d3763161` through PR2176. Complete 280-path
inventories match; relevant owner contracts are unchanged in that delta, while
actual UI/runtime changes exist and were inspected selectively. No pull, new
runtime tests or native qualification. Formal owner/OpenSpec publication remains
`/to-prd`; tickets remain `/to-issues`. No implementation/provider action.

## Full ratification — 2026-10-22

Conrad explicitly ratified Q24 A and every required amendment: the corrected
decision, Q24-C01–C08, Q24-P01–P20, ten journeys, eleven lifecycle distinctions,
six operational controls and Document Review Responsibility. Earlier pending
selection/review text is dated provenance; ADR-0024 and the full review record
adoption. All twenty definitions and Q01–Q24 are ratified. No Q25 answer,
implementation, native qualification or formal publication is inferred.
