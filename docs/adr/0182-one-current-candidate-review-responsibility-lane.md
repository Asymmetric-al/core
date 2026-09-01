# ADR-0182: One current candidate-review responsibility lane

**Status:** Accepted (founder rulings, Phase 24 Grill session — D27–D29,
D33–D37, 2026-08-29)

## Context

D21/D22 select internal review attention without granting or restricting source
permission. D25/D26 may instead let authorized staff invite one external human
for the exact candidate. Leaving internal actions active during that external
review creates duplicate work, unclear responsibility, and accidental first-
finish races; making the external person an inflexible lock strands staff when
the invitation or reviewer fails.

The non-obvious boundary is that an internally authorized reviewer keeps their
underlying capability while the candidate can still require an explicit
coordination transition before accepting an internal final action.

## Decision

Each exact Tenant-, environment-, Site-, source-candidate-, and review-epoch-
scoped review has one source-owned **Candidate review responsibility lane**:

- `internal` references the current D21 routing occurrence;
- `external` references the one current D25 invitation or grant path;
- `reassignment_needed` records that an external path ended without satisfying
  the review and no successor lane has yet been chosen; or
- `terminal` references the source-owned end or completed review.

The lane coordinates one visible responsibility and action path. It never
grants or revokes capability, membership, qualification, independence,
invitation authority, projection access, review result, or public effect.
Within an internal lane, D22 remains controlling: any currently source-
authorized, D23/D24-independent internal person may act even when they are not
an attention recipient.

An external handoff occurs only when the authoritative local command commits
the authority-free D25 invitation and the successor external lane. Opening the
picker, selecting a contact, provider dispatch, inbox delivery, email open,
link access, and invitation acceptance do not select the lane. The same local
commit ends the internal routing occurrence as reassigned and records a
recoverable delivery outbox obligation. Internal personal items leave active
attention through D21/ADR-0027 reconciliation without fabricated read,
completion, or transferred engagement.

Pending invitation responsibility is not external authority. Before verified
acceptance, staff see **Waiting for Eli to accept** and the external human has
no candidate access. Delivery failure leaves the one selected external lane and
offers resend, replacement, or return; it never silently creates a parallel
internal lane.

While an external lane is current, an otherwise eligible internal person sees
the external status and a deliberate **Return to internal review** or source-
appropriate takeover action instead of a competing final action. A stale or
direct internal completion returns the typed current-lane result and changes
nothing. This candidate-state fence is not derived from D21 route membership
and therefore does not turn notification routing into an allowlist.

Returning internally is one current-fact compare-and-swap transition. It makes
the D25 invitation, grant, authorization context, and current session inert
before or atomically with advancing the lane internally, then resolves the
current D21 route and records one successor routing occurrence. Old items never
revive. A completely proved zero-recipient route still permits an internal lane
with no personal items; the source remains discoverable to independently
authorized internal reviewers. An indeterminate route does not end an
otherwise-valid external path merely to attempt reassignment, although a
separate current policy or security revocation can end access and leave
`reassignment_needed`.

A currently eligible internal reviewer may initiate takeover without being in
the notification route. A separately authorized manager may return the review
to the internal route without gaining authority to perform the review. Neither
action assigns the command actor personally. Source authorization,
independence, candidate state, lane head, D25 context, D26 posture, policy and
identity epochs, and expected heads are re-proved at commit.

One final source command wins. External completion first makes takeover stale;
takeover first makes the external context inert; internal completion first
prevents external handoff; and external handoff first requires a deliberate
return before internal completion. Same-key/same-meaning retries return one
receipt; changed meaning rejects. Provider work never occurs under source or
lane locks.

Decline, expiry, cancellation, policy loss, identity failure, and comparable
external ends are not review completion. Until the separately ratified recovery
posture selects a successor, they enter `reassignment_needed`, preserve the
candidate and current public Site where still valid, deny external projection
access, and revive no prior internal item or external credential.

By contrast, D30 `changes_requested` is a source-owned terminal result for the
exact external review. Its required Request-changes explanation and optional
Review source anchor are governed by ADR-0181 and the consequence-owning
source. It never enters `reassignment_needed`, never creates a D28 episode, and
never routes through the D29 Website review follow-up route. Any later
correction-attention decision must preserve that separation.

For a still-current candidate that still requires review, an authoritative
decline or expiry opens one immutable **Candidate review reassignment episode**.
The episode is nested in the existing candidate and review epoch; it is not a
new Plan review-required episode. Duplicate terminal delivery, refresh, worker,
or callback attempts resolve to the same semantic occurrence. A later fresh
external lane that separately declines or expires may open a new episode only
after the prior episode ended.

The recovery experience requires one deliberate next-lane choice and never
falls back internally by itself. An exact currently authorized actor may:

- issue a fresh D25 invitation, with **Invite again** available after expiry
  only when current policy, source, identity, and authorization proof admit it;
- choose another external reviewer through a fresh D25 invitation;
- return to internal review through the current D21/D27 route and atomic lane
  transition; or
- invoke a separately defined, source-owned terminal action such as D17's
  **Cancel planned change** when independently authorized.

The available actions and their order derive from current source truth. A
decline normally makes **Choose another external reviewer** primary; an expiry
normally makes **Invite again** primary. **Return to internal review** remains
available only when current internal eligibility and route proof make the
result truthful. A proved zero notification route is different from proved
zero eligible internal reviewers, and both are different from indeterminate
proof. The generic **Keep current version** action is rejected: the current Live
version already remains unchanged, doing nothing cannot resolve active work,
and cancelling intent requires the explicit source-owned action and consequence
preview.

One reassignment episode compiles to one semantically idempotent Phase 6
occurrence and then one independently engaged Phase 17 item per exact Tenant,
Party, role, and surface recipient. There is no shared Tenant item or shared
read state. Opening or marking an item read clears only that recipient's unread
engagement; the item remains in **Needs attention** while the source episode is
actionable and cannot be dismissed, archived, snoozed, or aged out. Access loss
removes presentation immediately, later authority never revives an old item,
and a proved-zero recipient set creates no guessed recipient. Partial, stale,
over-limit, or indeterminate resolution releases nobody.

Recovery attention uses one distinct **Website review follow-up route**. It may
reuse D21/D22's typed, bounded route infrastructure, but it is a different
responsibility purpose and never copies, aliases, or synchronizes the D21
Website-reviewer member set. A configured route names one to three distinct,
unordered, co-equal same-Tenant people; one is recommended and order grants no
primary, backup, claim, quorum, or escalation meaning. The user-facing members
are **Review coordinators**, not a permission or employment role.

A new Tenant begins unconfigured; nobody is inferred from the current user,
original inviter, creator/editor, prior reviewer, every admin, capability
holder, group, team, task, or legacy row. A Tenant may later be configured with
one to three members or deliberately set to no personal item; deliberate no-item
and never configured are distinct policy states, neither encoded as an empty
route. Ordinary Sites inherit the current Tenant posture by reference. A Site
may deliberately send no Site item or use one to three different coordinators
and explicitly choose either the Tenant posture on proved-zero Site
qualification or no follow-up item. A partially qualified Site route remains
the sole winner. Indeterminate, partial, stale, timed-out, contradictory,
corrupt, or over-limit proof releases nobody and never invokes fallback.

Route selection records responsibility intent only. The picker is limited to
visible active same-Tenant people, shows scope-appropriate current qualification
separately, and may preserve intent through later access loss; selecting a
person grants nothing. At episode time, the canonical resolver intersects the
winning route with exact current candidate visibility and authority to issue a
fresh external successor or return to internal review. Plan cancellation alone
does not qualify a recipient because it is a separate source-terminal action.
Different qualified coordinators may see different lawful actions, and item
possession never unions their capabilities. Independently authorized non-
coordinators may still recover from the source page.

D33 does not generalize this Review-coordinator route into correction-work
assignment. A D31 source-backed correction return uses only its exact registered
source-recovery contract; it never copies, aliases, or falls back to D29 Review
coordinators by convention. The domains may reuse immutable differential-
handoff mechanics while retaining separate route purposes, members, action
authorization, history, privacy, and recovery meaning.

D34 Return recovery context also cannot invoke, rank, or recommend this route.
D35 now admits optional personal attention for ownerless correction recovery
under the distinct **Assign returned Website work** purpose. Its Tenant-only
policy, head, immutable members, recipient role, source occurrence, task,
engagement, action, audit, settings section, and retention are separate from
this D29 route. Core never copies, aliases, synchronizes, defaults, suggests,
unions, or falls back between them. Selecting the same human for both is a
deliberate separate save, and membership in either grants no permission.

D36 reuses only this ADR’s prospective-save and explicit differential-current-
handoff mechanics for the separate D35 Tenant recovery policy. It does not
reuse D29’s route rows, Site inheritance/override/fallback, D28 cohort, item,
recipient role, source action, reason, visibility, end, audit, or notification
meaning. A D36 current-work application targets D35 Needs-assignment recovery
occurrences under its own authorization and per-occurrence routing generation;
continuing engagement is preserved, new recipients alone receive unread, and
removed recipients end under the D36 coordinator-policy result. D37 defines
that application as one complete compatible pre-cutover Tenant cohort under a
distinct Tenant-wide current-work application capability. Authoritative source
heads and a closed producer/version catalog—not visible rows, Site access,
filters, tasks, recipient qualification, or client selection—own membership.
The capability includes only the exact complete aggregate consequences needed
for consent and grants no source detail or recipient authority. A prepared
no-effect cohort must seal atomically before D36's per-occurrence execution;
unknown completeness, unreviewed widening, and visible-subset fallback write
nothing.

The selected set is stable for one routing leg. Route saves are prospective by
default. Existing D28 episodes change recipients only through an explicit,
fresh, impact-previewed differential handoff: unchanged people keep engagement,
removed responsibility ends truthfully, and newly admitted people receive one
successor occurrence and personal unread item. Proved loss of every current
recipient may use only the declared route/fallback; later authorization never
revives old engagement.

Unconfigured, deliberately no-item, configured-but-proved-zero, or indeterminate
follow-up coverage never blocks an independently authorized D25 external
handoff. The confirmation truthfully distinguishes setup, off, current zero, and
unverified coverage, offers the appropriate settings action only to an
authorized route manager, and preserves source-page discoverability.
Uncertainty never broadens the audience. Removing the last
Tenant coordinator or the last Site override member requires an explicit
consequence choice; an empty member array never silently means inherit, stop,
or fallback.

The staff information architecture remains **Settings → Websites → Reviews**.
Its **Review responsibilities** section shows separate **Review notifications**
and **External review follow-up** cards. D21's card covers all three D20
review-required meanings; D26 external-review availability remains a separate
policy card. The coordinator editor asks
**Who chooses the next step?**, explains the exact decline/expiry event, and
states that selection grants no permission. The D28 key remains Reserved until
the accepted route, Phase 12 action capabilities, D19/Phase 6/17 runtime,
source adapters, OpenSpec, tests, and release evidence are implemented and
proved; D29 closes the product-decision blocker, not the implementation gate.

The privacy-safe item preview says only that external review ended and that the
current Live Site and Giving are unchanged. Reviewer identity, contact, and
exact terminal reason appear only in an independently authorized detail
projection. The item ends exactly once when a successor lane commits or the
source becomes terminal. It creates no email, digest, push, recurring reminder,
due date, escalation, countdown, provider work, public effect, Giving effect,
or financial effect.

## Consequences

- The consequence-owning source owns immutable lane revisions, one current
  head, transition receipts, and lane fences. Phase 4, Phase 12, D21/Phase 17,
  Phase 6, and source review/public effects retain their existing distinct
  ownership.
- Handoff, delivery, acceptance, access, takeover, review, and public effect are
  separately visible and auditable facts.
- The external confirmation uses **Send invitation and hand off** when an
  internal lane is current. Returning explains that external access ends and
  current internal reviewers receive fresh—not revived—attention.
- Browser writes are revoked. Lane commands live in `packages/api`, use trusted
  server scope/actor, immutable versions, expected-head CAS, semantic
  idempotency, same-scope constraints, `ENABLE` plus `FORCE RLS`, operation-
  correct `USING` and `WITH CHECK`, privileged-path parity, and a documented
  lock order.
- Current broad staff-role maps, mutable Mission Control tasks/assignees, task
  reminders, legacy attention rows, CMS/Payload state, email/provider state,
  and UI hiding are not valid lane authorities.
- The source owns the reassignment episode and lane head; Phase 6/17 owns only
  recipient-specific occurrence, item, and engagement projections. Recovery
  commands use the same expected-head CAS and semantic receipts as other lane
  transitions, so concurrent internal return, fresh invitation, cancellation,
  candidate change, and external terminal events produce one truthful winner.
- The staff UI uses the existing Base Maia Card plus responsive Sheet/Dialog
  vocabulary, consequence-led buttons, a privacy-safe compact preview,
  explicit localized absolute expiry time, stable focus, polite status
  announcements, and a close-without-mutation path. Closing the surface does
  not clear Needs attention.
- The bounded-route kernel is shared infrastructure, not shared route truth.
  D21 Website-review responsibility and D29 external-review follow-up have
  separate route purposes, heads, member revisions, recipient roles, safe
  projections, and audit histories.
- D27 creates no claim, lease, task, queue, timer, due date, reminder,
  escalation, generic workflow, Page/Navigation edit, publication, Giving,
  Legal Entity, Stripe, settlement, bank, currency, contribution, receipt,
  ledger, or accounting effect.

## Rejected alternatives

- **Parallel internal and external first-wins:** rejected because it makes the
  external choice ambiguous, duplicates work and disclosure, and increases
  races. D22 first-wins remains valid inside the internal co-responsible lane.
- **External exclusive without takeover:** rejected because a pending invite,
  failed delivery, or unavailable reviewer can unnecessarily strand staff.
- **Hide internal controls but preserve an actionable backend path:** rejected
  because UI hiding is not a business invariant and stale/deep-link commands
  would bypass the intended lane.
- **Use D21 route membership or a mutable assignee as authority:** rejected
  because responsibility and notification engagement never grant or remove
  permission.
- **Copy or synchronize Website reviewers into follow-up coordinators:**
  rejected because reviewing and choosing a recovery lane are different jobs;
  copying would create dual ownership and misleading setup.
- **Capability broadcast or inviter fallback:** rejected because permission and
  provenance do not establish continuing responsibility and would create noisy,
  unstable, privacy-widening recipients.
- **Automatically restore old items:** rejected because it fabricates current
  responsibility and revives personal engagement. Every admitted return uses a
  new successor occurrence.

## Related decisions

- [ADR-0025 — Producer-owned protected actions](./0025-producer-owned-protected-actions.md)
- [ADR-0027 — One notification presentation and engagement model](./0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0181 — Source-authorized candidate-scoped external review](./0181-source-authorized-candidate-scoped-external-review.md)
- [Phase 24 D27 adversarial review](../prds/sitestacker-parity/phase-24-d27-one-visible-review-lane-adversarial-review.md)
- [Phase 24 D27 primary research](../prds/sitestacker-parity/phase-24-d27-one-visible-review-lane-primary-research.md)
- [Phase 24 D28 adversarial review](../prds/sitestacker-parity/phase-24-d28-explicit-next-lane-choice-adversarial-review.md)
- [Phase 24 D28 primary research](../prds/sitestacker-parity/phase-24-d28-explicit-next-lane-choice-primary-research.md)
- [Phase 24 D29 adversarial review](../prds/sitestacker-parity/phase-24-d29-explicit-website-review-coordinators-adversarial-review.md)
- [Phase 24 D29 primary research](../prds/sitestacker-parity/phase-24-d29-explicit-website-review-coordinators-primary-research.md)
- [Phase 24 D30 adversarial review](../prds/sitestacker-parity/phase-24-d30-required-request-changes-explanation-adversarial-review.md)
- [Phase 24 D33 adversarial review](../prds/sitestacker-parity/phase-24-d33-source-validated-return-handoff-adversarial-review.md)
- [Phase 24 D33 primary research](../prds/sitestacker-parity/phase-24-d33-source-validated-return-handoff-primary-research.md)
- [Phase 24 D35 adversarial review](../prds/sitestacker-parity/phase-24-d35-shared-lane-optional-recovery-coordinators-adversarial-review.md)
- [Phase 24 D35 primary research](../prds/sitestacker-parity/phase-24-d35-shared-lane-optional-recovery-coordinators-primary-research.md)
- [Phase 24 D36 adversarial review](../prds/sitestacker-parity/phase-24-d36-prospective-save-explicit-current-work-application-adversarial-review.md)
- [Phase 24 D36 primary research](../prds/sitestacker-parity/phase-24-d36-prospective-current-work-application-primary-research.md)
- [Phase 24 D37 adversarial review](../prds/sitestacker-parity/phase-24-d37-complete-tenant-current-work-cohort-adversarial-review.md)
- [Phase 24 D37 primary research](../prds/sitestacker-parity/phase-24-d37-complete-tenant-current-work-cohort-primary-research.md)
