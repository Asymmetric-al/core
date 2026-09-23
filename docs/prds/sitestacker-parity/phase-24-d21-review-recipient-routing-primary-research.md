# Phase 24 D21 Review Recipient Routing Primary Research

Research date: 2026-08-28

**Status:** Primary-source option-comparison appendix. The founder subsequently
selected Option 3; the final adversarial disposition and corrected normative
decision are in
[phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md).
This file remains evidence, not a PRD, OpenSpec change, ADR, schema,
implementation plan, or runtime authorization contract.

## Research question

When several people are currently authorized to perform a D20 review action,
who should receive the recipient-specific in-product item?

The practical choice is between:

1. every currently action-capable person;
2. one explicitly accountable reviewer;
3. explicitly accountable reviewer(s), with a small and transparent fallback;
   or
4. a system-selected or shared-queue alternative.

The answer must preserve D19's one occurrence plus independently engaged
recipient-item model, D17's prohibition on guessed assignees, and Phase 12's
separation between current authorization and organizational labels.

## Evidence labels

- **Verified repository fact** means an accepted Core ADR, completed Phase 24
  decision, governing glossary term, or current source directly establishes the
  claim.
- **Verified external fact** means current first-party product or standards
  documentation directly establishes the claim.
- **Product judgment** is the recommended fit for Core after reconciling those
  facts. It is not presented as a universal vendor rule.
- **Assumption** is plausible but not yet proved with representative Core
  ministry staff.
- **Unresolved founder decision** is product meaning that research cannot choose
  on the founder's behalf.

## Executive conclusion

**Recommendation: Option 3 — an explicit review-responsibility route with one
bounded, explicit fallback route.**

The best permanent Core model is:

> D20 notifications go only to the currently authorized members of the first
> applicable, explicitly configured review-responsibility route that yields at
> least one currently qualified recipient: the Site's review route first, then
> the Tenant's website-review route only when it is the inherited default or a
> visibly declared fallback. Both routes are responsibility configuration, not
> permission. Every selected recipient is independently re-proved able to see
> the private Plan and perform the exact current review action.
>
> The Plan creator cannot choose recipients for an episode. Core never falls
> back to all staff, all admins, all capability holders, the prior reviewer, the
> last editor, support, or a hidden load-balancing algorithm. If no explicit
> route resolves to a current action-capable recipient, Core creates no item and
> shows a clear **No review notification route** state in the authorized Site
> management surface. Notification absence never blocks or completes the
> source-owned review.

This gives a small ministry a low-friction path: configure **Website reviewers**
once at the Tenant level and let every ordinary Site inherit it. A larger
ministry can override only the Sites that genuinely have different owners. It
avoids making staff pick an approver every time a Plan changes.

It also avoids two unsafe simplifications:

- **Permission is not responsibility.** The ability to review does not mean a
  person should receive every review notification.
- **Responsibility is not permission.** Putting a person on a review route must
  never grant Plan visibility or review authority.

The exact maximum number of named responsible reviewers is not evidence-settled.
The UI should encourage one clearly accountable reviewer or a deliberately
small team, but an exact product cap requires the later specification and
production-shaped usability evidence. Phase 17's 50-recipient staff bound is an
execution-safety ceiling, not a good UX target.

## Repository facts that constrain the answer

### Phase 12: authorization is capability-based, not label-based

**Verified repository fact:** `CONTEXT.md` defines a **Capability** as the only
thing checked for an access decision. Roles, groups, and named grants are
administrative bundles that resolve into capabilities; their names never
authorize. **EffectiveAccess** is current, purpose- and target-specific output,
not a persisted `can_access` flag.

Consequences for D21:

- a responsibility route cannot grant review access;
- a role name such as `website_manager` cannot be trusted as the authorization
  predicate;
- every routed recipient still needs current Tenant assignment, Site/Plan
  visibility, privacy floor, and exact action capability; and
- permission membership alone cannot prove that a person is the accountable
  recipient.

### D17: routing is typed and cannot guess an assignee

**Verified repository fact:** D17-R7 says the Plan initiator cannot choose or
invent an assignee, approver, prior editor, email address, role, or queue.
Assignment grants no source access. Where no qualified owner queue exists, Core
must show **No owner route is available** and create no guessed task.

Consequences for D21:

- no per-Plan recipient picker belongs beside **Review planned change**;
- no creator, last editor, prior reviewer, or broad administrator fallback is
  allowed;
- a durable responsibility route must be governed separately from one episode;
  and
- an empty route is a truthful product state, not an error to conceal with broad
  fan-out.

### D19 and ADR-0027: one source occurrence still produces personal items

**Verified repository fact:** ADR-0027 and D19 require one producer occurrence
with one independently engaged item per exact Tenant+Party+role+surface
recipient. One recipient's read state cannot affect another recipient. Current
authorization is re-proved on count, list, detail, click, action, realtime, and
support paths. Access loss removes presentation, and later authority does not
revive an old item.

Consequences for D21:

- a responsibility team cannot be represented by one shared notification row;
- if two explicitly responsible people are selected, each receives a sibling
  item with personal engagement;
- completion by either person ends all sibling active presentation only because
  the source-owned review condition ended, never because one item was read; and
- responsibility or access handoff while the review remains open needs a new
  producer-authorized recipient-routing occurrence. Old recipient engagement is
  neither transferred nor revived.

D19's provisional resolver language says each “qualified” staff member gets an
item, while its D20 question explicitly defers the choice among several
qualified people. If Option 3 is later selected, the traced correction is:
**qualified recipient = member of the winning explicit responsibility route AND
currently authorized for the exact view/action**. This narrows the resolver; it
does not change D19's per-recipient identity, engagement, bounds, or current-
authorization requirements.

### Phase 17: recipient resolution is finite and code-owned

**Verified repository fact:** the Phase 17 contract requires finite recipient
roles and one server-owned resolver per role. Producers cannot supply recipient
queries, addresses, mutable recipient lists, contract keys, or arbitrary
destinations. The complete bounded member set is compiled atomically, including
a provable zero-member result. The inherited staff fan-out ceiling is 50 and the
global occurrence ceiling is 200.

Consequences for D21:

- responsibility routing must compile through a named, versioned resolver;
- the browser cannot submit final recipient IDs as authority;
- limit-plus-one, partial enumeration, or ambiguous access cannot send a partial
  set; and
- the existing Phase 17 bounds protect execution but do not justify notifying
  50 people about one review.

### Current runtime is not the permanent model

**Verified repository fact:** current
`packages/api/src/admin/contribution-operations/approval-notifications.ts`
selects every same-Tenant `admin` or `super_admin` profile as an eligible
contribution approver, subject to a separation-of-duties filter. It then creates
one recipient notification per profile. This is current contribution-specific
behavior, not the accepted Phase 12/17 model and not evidence that all capable
Site staff should be notified.

**Verified repository fact:** D19 reports that the canonical Phase 17 staff
notification runtime and exact Site action capabilities are not implemented.
Current notification queues, static demo UI, and contribution task/notification
ledgers are forbidden D20 shortcuts.

## Primary-source external findings

### GitHub explicitly trades broad team fan-out for personal accountability

**Verified external fact:** GitHub says its team code-review settings can reduce
noise and clarify individual responsibility. A team can notify only specifically
requested members. Automatic assignment replaces a team request with a selected
subset, using round-robin or recent-load balancing; members marked Busy are
skipped, and the request remains with the team if everyone is Busy. See
[GitHub: Managing code review settings for your team](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team).

**What this supports:** notifying every technically eligible person is not the
only resilient modern pattern. A bounded responsible subset can improve signal
and make responsibility clearer.

**What Core should not import:** GitHub's workload history, Busy status,
round-robin assignment, or silent automatic choice. Core has no accepted staff
presence/capacity model, and D18 rejects time/reminder machinery for this Plan.
Adding a reviewer scheduler merely to avoid one routing decision would be a new
workflow product.

### GitLab separates responsibility rules from reviewer eligibility

**Verified external fact:** GitLab Code Owners define who is responsible for
specific paths. Eligibility is separately checked against current project/group
membership and role. Approval rules can identify categories of reviewers, and
GitLab can automatically assign matching Code Owners as reviewers. See
[GitLab: Code Owners](https://docs.gitlab.com/user/project/codeowners/),
[GitLab: CODEOWNERS reference](https://docs.gitlab.com/user/project/codeowners/reference/),
and [GitLab: Automatic reviewer assignment](https://docs.gitlab.com/user/project/merge_requests/reviews/automatic_reviewer_assignment/).

**What this supports:** responsibility may be configured for a stable scope and
then intersected with current eligibility. It does not need to be selected from
scratch for each review episode.

**Limit:** GitLab can assign every matching Code Owner. That is useful coverage,
but it does not prove broad fan-out is good UX for a multi-Site nonprofit. GitHub
explicitly offers subset assignment to reduce that noise.

### HubSpot uses designated approvers and supports deliberate reassignment

**Verified external fact:** HubSpot content approvals require designated users
with the relevant approval permission. The requester chooses approvers and
whether all or just one must approve; approvers can later be reassigned. HubSpot
also exposes the approval state on desktop and mobile. See
[HubSpot: Approve content](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content).

**What this supports:** the product should make who is expected to review and
whether one or all reviewers are required unambiguous. Reassignment is a normal
recovery path.

**What Core should not import:** D17 already rejects an arbitrary per-Plan
approver picker. HubSpot's due date, free-form request message, per-request
selection, and configurable approval threshold would add workflow state D20
does not need.

### Microsoft distinguishes individual, group, one-of, and all-of approval

**Verified external fact:** Power Automate supports **Everyone must approve**,
**First to respond**, and sequential approval. A Microsoft 365 group can be an
approval recipient where one member's response represents the group. See
[Microsoft: Get started with approvals](https://learn.microsoft.com/en-us/power-automate/get-started-approvals)
and [Microsoft: Request approvals from Microsoft 365 groups](https://learn.microsoft.com/en-us/power-automate/group-approvals).

**Verified external fact:** modern Microsoft Lists approvals warn that assigning
an approver does not grant access to the underlying list item. A request can be
reassigned, but the underlying permission must be managed separately. See
[Microsoft: Approvals in Lists and Document Libraries](https://support.microsoft.com/en-us/office/approvals-in-lists-document-libraries-2bd0954d-5797-4be3-b78a-846f26338e17).

**What this supports:** “any one responsible reviewer may complete” is a
recognized workflow meaning, and assignment must remain separate from access.

**What Core should not import:** one mutable group approval, Teams/email
delivery, arbitrary flow authorship, or a tenant-built approval graph. ADR-0027
still requires personal Core items and source-owned completion.

### Contentful demonstrates both team coverage and its footguns

**Verified external fact:** Contentful Tasks can be assigned to one user or a
team. Every member of an assigned team receives email, and any team member can
resolve the task. Contentful describes tasks as distributing work with clear
accountability. Its API documentation also says task creation does not verify
that the assignee can read the underlying entry; an assignee without access
cannot resolve the task. See [Contentful: Tasks](https://www.contentful.com/help/content-and-entries/tasks/)
and [Contentful: Entry tasks API](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/).

**What this supports:** individual and responsible-team routing are both
understandable models.

**What Core must improve:** assignment-without-access and notify-the-whole-team
are concrete failure modes. Current action capability must be part of the
resolver, and team fan-out must be deliberate rather than an accidental side
effect of broad permissions.

### Sanity favors an appropriate named collaborator

**Verified external fact:** Sanity Tasks lets staff assign work to the
appropriate team member, who receives an inbox and email notification. Tasks
remain attached to the relevant document for context. See
[Sanity: Tasks for Sanity Studio](https://www.sanity.io/docs/user-guides/tasks).

**What this supports:** contextual, named responsibility is easier to
understand than alerting every editor.

**What Core should not import:** a general task, due date, comment thread,
email, or arbitrary mention. D20 is a narrow state-driven attention contract,
not a Site task product.

### Blackbaud provides nonprofit-specific evidence for designated routes and absence coverage

**Verified external fact:** Blackbaud Financial Edge NXT approval tiers select
only solution administrators or users who already have approval permission.
Rules can require all, one, or a defined number of selected approvers.
Notifications follow the current tier rather than notifying future tiers early.
See [Blackbaud: Approval Tiers for Payment Assistant](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html).

**Verified external fact:** Blackbaud expense approval notifications marked
**Needs my approval** appear only for a designated approver. A designated
approver can explicitly turn on out-of-office forwarding and choose another
person. See [Blackbaud: Edit Settings](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-expense-edit-settings.html).

**Verified external fact:** Blackbaud's Approvals Manager shows each approval
type only to administrators with that exact approval permission. See
[Blackbaud: Approvals Manager](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/csrconnect-prod/content/csrc-approvals-manager.html).

**What this supports:** nonprofit products commonly combine a designated
responsibility route, exact permission, current-step notification, and explicit
absence handoff. Capability alone is not the whole routing policy.

**What Core should not import:** financial tiers, amount rules, email cadence,
out-of-office timers, or payment approval semantics. The reusable lesson is
explicit responsibility plus current qualification, not the finance workflow.

## What the evidence proves—and what it does not

| Evidence-supported conclusion                                                         | Evidence limit                                                                                              |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Broad team notification creates recognized noise and weakens personal accountability. | No source establishes one universal recipient count for every organization.                                 |
| Mature systems distinguish designated responsibility from raw permission eligibility. | Vendors model responsibility through different primitives: users, teams, code ownership, rules, or queues.  |
| A small responsible group can provide coverage when any one member may act.           | Group routing can still create diffuse ownership and duplicate attention if membership is broad.            |
| Assignment must not silently grant access.                                            | Some products fail to enforce this at assignment time; Core must do better.                                 |
| Reassignment or explicit absence forwarding is a normal recovery path.                | No primary source proves Core needs presence detection, automatic escalation, or a due date.                |
| A tenant-level default can reduce repeated setup in comparable rule-based systems.    | No representative Core study proves the preferred wording or whether ministries expect a per-Site override. |

No external source proves one universal answer for Core. The recommendation is
a **product judgment**: explicit responsibility routes give better signal than
capability-wide fan-out, while a visible Tenant default avoids making small
ministries configure every Site separately.

## Option comparison

### Option 1 — every currently action-capable person

The resolver sends a sibling item to everyone who can currently view the Plan
and perform the selected D20 action.

**Benefits**

- no responsibility setup;
- strong coverage when one person is away; and
- simple resolver semantics, already close to D19's provisional wording.

**Material problems**

- permission is mistaken for responsibility;
- a large or broadly administered Tenant can create many unread items for one
  review that only one person needs to perform;
- every recipient must process an attention item even if everyone assumes
  someone else owns it;
- multi-Site staff receive noise from Sites they can help with but do not manage;
  and
- broad fan-out consumes Phase 17's safety bound as if it were a UX target.

**Example:** twelve website-capable staff receive **French (Canada) — Ready to
review**. Maria completes the review, and eleven sibling items end. Nothing
leaked, but eleven people were interrupted for work none of them owned.

**Research disposition:** credible zero-setup fallback, but not the strongest
permanent UX. GitHub's explicit noise-reduction feature exists because this
pattern becomes costly as teams grow.

### Option 2 — exactly one explicitly accountable reviewer

One durable Site responsibility assignment identifies the intended reviewer.
The recipient still must pass current authorization before an item is created.

**Benefits**

- clearest personal accountability;
- exactly one unread item for one review; and
- easy staff explanation: **Maria is responsible for Site-language reviews**.

**Material problems**

- a single departure, leave, deactivation, or capability change can remove the
  only notification path;
- every Site needs a safe setup or inheritance rule;
- a route manager must deliberately reassign responsibility; and
- assignment cannot solve a one-person tenant's independent-review requirements
  where a different human is required by another governing decision.

**Example:** Maria is the sole reviewer and remains authorized while on leave.
Core cannot truthfully infer that she is unavailable. The item waits for Maria
until an authorized route manager changes responsibility.

**Research disposition:** excellent accountability, brittle coverage without a
separately visible handoff path.

### Option 3 — explicit responsible reviewer(s) with one transparent fallback

A durable Site route identifies one reviewer or a deliberately small set for
whom any one may complete the review. Ordinary Sites inherit the Tenant's
website-review route. A Site override is used only when ownership is genuinely
different and visibly declares whether the Tenant route is its fallback.

At occurrence time, the server intersects the winning explicit route with
current exact action authorization. It sends one sibling item to each selected
responsible Party+role. It never widens to every capability holder.

**Benefits**

- explicit responsibility and low notification volume;
- one Tenant-level setup serves small ministries and ordinary multi-Site use;
- Site override supports regional/language ownership without a new Site model;
- an explicit fallback or deliberate route change handles departure and access
  loss without guessing; and
- settings can explain the result before any Plan becomes actionable.

**Costs and safeguards**

- Core needs a small responsibility-route concept distinct from Phase 12
  permission;
- route precedence, membership, current qualification, handoff, and no-route
  states must be exact and auditable;
- a broad “responsible team” recreates Option 1, so the UI needs a deliberate
  small-team posture and a later evidence-based bound; and
- automatic fallback must occur only to a route explicitly shown in settings,
  never to all admins/capability holders.

**Example:** Hope Ministries sets Maria and Joel as Tenant website reviewers.
All ordinary Sites inherit that route. Its restricted Spanish-language Site
has Ana as a Site-specific reviewer and visibly shows **Fallback: Tenant website
reviewers if no Site reviewer is currently qualified**. A French review on an
ordinary Site goes to Maria and Joel; a Spanish Site review goes to Ana. No Plan
creator chooses recipients.

**Research disposition:** recommended. It balances small-ministry setup,
multi-Site ownership, absence safety, user clarity, and notification noise
without adding a workflow engine.

### Strongest alternative — system-select one eligible reviewer

Core could choose one person using round-robin, recent load, availability, or a
claimable shared queue. GitHub demonstrates that this can reduce notifications
while spreading review work.

**Why it is not recommended for D21 v1**

- Core has no accepted availability, workload, review-capacity, or queue-claim
  authority for Site work;
- staff may not understand why a particular person was chosen;
- a load algorithm can route sensitive ministry work based on telemetry that
  was never designed as responsibility evidence;
- retries, membership changes, ties, fairness windows, reassignment, and
  rollback create a new state machine; and
- a shared queue cannot replace ADR-0027's recipient-specific item and
  engagement model.

This option becomes credible only if a future, separately researched staff-work
routing product establishes capacity, responsibility, delegation, audit, and
clear user control. It is disproportionate for three D20 review meanings.

## Recommended staff UX

### One-time Tenant setup

Use plain responsibility language, not permission jargon:

```text
Website review notifications

Who should be notified when a Site-language plan needs review?

Website reviewers
Maria Santos, Joel Martin

Either reviewer can complete the review. This setting does not give anyone
access to a Site or permission to approve changes.

[Change reviewers]
```

The candidate control shows only people the route manager is permitted to see.
It explains current qualification separately. Saving a route never adds a role,
capability, Site membership, or source permission.

### Ordinary Site experience

```text
Review notifications
Uses Tenant website reviewers · 2 people

Maria Santos and Joel Martin will receive review items when this Site's
language plan needs review.

[Use different reviewers for this Site]
```

No setup is repeated for Sites that use the Tenant route.

### Site-specific responsibility

```text
Review notifications
Site reviewers · Ana López

Fallback
Tenant website reviewers

If Ana can no longer open the review, the currently qualified Tenant website
reviewers will be notified. This never gives them new Site access.

[Change]  [Use Tenant default]
```

The fallback is visible before save. It is not a hidden emergency broadcast.

### No-route experience

```text
Review notifications aren't assigned

No one will receive a notification when this Plan needs review. Authorized
staff can still find and complete the review in Site → Languages.

[Choose website reviewers]
```

Only a person with route-management authority sees the setup action. Other
authorized staff see a truthful status without names or controls they cannot
use. The Plan can still be saved and reviewed; notification state is never
review or activation authority.

### Actionable episode experience

The Plan notification itself stays D20-focused:

```text
Ready to review
hope.org · French (Canada)

French (Canada) became ready for final review.
This Plan does not change the website automatically.

[Review planned change]
```

The review destination may show a privacy-safe line such as **Review request
sent to Website reviewers** when the viewer is permitted to see that routing
fact. It should not expose another staff member's unread state or imply that the
first person to open the item owns the review exclusively.

## Lifecycle and edge-case implications

### Route precedence

The routing hierarchy must be closed and visible:

1. current explicit Site review route;
2. current explicit Tenant website-review route only when configured as the
   Site's fallback or inherited default; then
3. no notification recipient.

There is no fourth step to creator, prior reviewer, all admins, all capable
staff, support, AI, or legacy queues.

### Route membership and current access

- Responsibility membership grants nothing.
- Current action authorization without responsibility membership produces no
  item under the recommended option.
- A person present in both Site and Tenant routes gets only the winning-route
  occurrence permitted by the exact recipient-role contract; overlapping route
  membership cannot create peers.
- A Party acting through distinct valid staff roles remains governed by Phase
  17's exact Party+role identity. D21 must not silently merge role histories.
- A route selected with zero currently qualified members is not “delivered.”
  The UI shows the fallback actually used or the no-route outcome.

### Departure, revocation, and handoff

- When underlying access ends, active and Recent private presentation is
  removed immediately and body-free audit remains. When responsibility alone
  ends but source authorization remains, the item leaves **Needs attention**
  with `responsibility_reassigned` and remains as non-unread **Reassigned**
  Recent history under ADR-0027; it never stays actionable or fabricates read.
- If the explicit fallback now wins while the review remains actionable, the
  producer creates a new, immutable routing occurrence for the new current
  recipients. It does not append children to the old occurrence, transfer read
  state, or mark an old item unread again.
- If a primary reviewer is merely away but remains authorized, Core cannot infer
  absence. An authorized manager must change the route or apply an explicitly
  modeled handoff. No timer or silent escalation is introduced.
- Returning responsibility never revives an old item. A new current routing
  occurrence is required if the source condition is still actionable and the
  contract admits the handoff.

### Several responsible reviewers

- Every selected responsible reviewer receives an independent item.
- The settings and review surface say **Either reviewer can complete this
  review** when one source review is sufficient.
- One person's read affects only that person.
- The first valid source review action uses D17's current expected-fence/CAS
  rules. On success the source condition ends, and sibling items leave **Needs
  attention** without fabricated reads.
- A losing concurrent reviewer sees the truthful current result, not an error
  encouraging a second action.

### Bounds and partial failure

- Route enumeration and authorization filtering are bounded, deterministic,
  and atomic.
- Exactly-at-limit may compile only when the later manifest permits it.
- Limit-plus-one, partial membership, stale authorization, or resolver outage
  creates no partial recipient fan-out and never widens to another audience.
- The persistent Site surface reports a privacy-safe routing problem to people
  already authorized to see it; operations reconcile the same semantic effect.

## Domain ownership and invariants

| Fact                                    | Authoritative owner                                                | Must never become authority                     |
| --------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| D20 review-required state and end       | Site locale-plan/readiness producer                                | notification row, route assignment, read state  |
| current ability to view/act             | Phase 12 PDP and source policy                                     | route name, job title, item possession          |
| Site/Tenant review responsibility route | Site-management coordination owner                                 | capability grant, Plan creator input            |
| recipient set for one occurrence        | code-owned Phase 17 resolver over route plus current authorization | browser recipient list, cached prior membership |
| personal item and engagement            | Phase 17 exact Tenant+Party+role+surface projection                | shared team row, source completion              |
| review completion                       | D17 source-owned review command and current fence                  | read, click, assignment, notification delivery  |

Required invariants:

1. `responsible` never implies `authorized`.
2. `authorized` never implies `responsible`.
3. Only an explicitly governed route can select a recipient under Option 3.
4. The route selected for one Site and Tenant cannot select another Tenant's
   Party, role, Site, or notification surface.
5. Route resolution is deterministic from server-owned context and current
   versions; callers cannot choose recipients.
6. At most one active D20 item exists for one review meaning, exact routed
   Party+role+surface, and current producer episode.
7. Route changes and handoffs preserve old evidence and create successor
   occurrences; they never mutate immutable recipient identity or engagement.
8. Notification absence, presence, read, or source-end presentation has zero
   public, Giving, Legal Entity, Stripe, settlement, bank, or accounting effect.

## Proof requirements suggested by the research

1. **Every-qualified negative:** ten capable but non-responsible users receive
   zero items; exact responsible+authorized users receive one each.
2. **Assignment-is-not-access:** adding a person to the route without Plan view
   or action capability grants nothing and creates no item.
3. **Capability-is-not-assignment:** granting review capability alone creates no
   D21 item under Option 3.
4. **Tenant inheritance:** a Site with no override resolves the exact current
   Tenant website-review route and displays that inheritance clearly.
5. **Site override:** an override selects only its qualified responsible members
   and does not also notify the Tenant route.
6. **Explicit fallback:** an unusable Site route selects the Tenant route only
   when that fallback was explicitly configured and disclosed; otherwise it
   yields zero recipients.
7. **No hidden fallback:** creator, prior reviewer, last editor, all staff, all
   admins, support, service role, AI, and current contribution approvers receive
   zero fallback items.
8. **No-route UX:** zero current routed recipients produces no item and a clear,
   permission-filtered Site-management explanation without blocking source
   review.
9. **Overlap:** a person in both routes receives no duplicate; cross-role
   behavior follows the exact registered Phase 17 role contract.
10. **Atomic bound:** zero, one, several, exactly-at-limit, and limit-plus-one
    route resolutions prove all-or-none member compilation.
11. **Concurrent action:** two responsible reviewers act concurrently; one
    source CAS wins, the other sees current truth, and all sibling items end
    from the source transition only.
12. **Responsibility handoff:** changing the route while review remains open
    removes old presentation, creates new recipient items through a successor
    occurrence, and transfers no engagement.
13. **Access revocation:** revocation between compile, list, click, and action
    removes or denies presentation immediately and never activates fallback by
    guessing.
14. **Tenant isolation:** forged route, Party, Site, cursor, cache, realtime,
    support, service-role, and definer paths cannot enumerate or attach across
    Tenant/environment boundaries.
15. **Copy comprehension:** representative staff can explain who is responsible,
    that assignment grants no access, what fallback will occur, and that no
    public change happens automatically.
16. **Small-ministry journey:** a one-Site/one-reviewer Tenant configures the
    route once without repeating selection per Plan and can find the no-route
    recovery on desktop, mobile, keyboard, screen reader, and weak network.
17. **Large/noisy Tenant:** measure per-episode recipient count, duplicate/overlap
    rate, no-route rate, handoff frequency, item open-to-review completion, and
    capability-wide fan-out avoided. Set product bounds only from pre-registered
    evidence, not the Phase 17 execution ceiling.

## Risks to monitor if Option 3 is later specified

| Signal                                            | Threshold                                                                                        | Owner                        | Required response                                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `site_plan_review_nonresponsible_recipient_total` | Any value greater than 0                                                                         | Site IAM + Phase 17 Security | Disable the resolver generation, remove unauthorized presentation, assess disclosure, repair route intersection, and replay hostile fixtures. |
| `site_plan_review_route_granted_access_total`     | Any value greater than 0                                                                         | Phase 12 Security            | P0 disable route mutation/use, revoke widened access, assess exposure, and restore capability-only authorization.                             |
| `site_plan_review_capability_fallback_total`      | Any creator/admin/all-capable/prior-reviewer/legacy fallback                                     | Site Product + Security      | Fence the key, preserve evidence, remove guessed items, and require an explicit route before re-enable.                                       |
| `site_plan_review_route_overlap_duplicate_total`  | Any peer item for the same current episode+Party+role+surface                                    | Phase 6/17                   | Stop the writer, preserve both rows, hide the peer, repair precedence/dedupe, and reconcile the occurrence.                                   |
| `site_plan_review_route_partial_release_total`    | Any visible child from an incomplete route set                                                   | Phase 6/17                   | P0 stop compilation, hide unreleased children, repair transaction/release proof, and replay the same occurrence.                              |
| `site_plan_review_no_route_rate`                  | Product threshold set before pilot and exceeded by the pilot cohort                              | Site Product                 | Inspect setup comprehension and route loss; improve one-time setup or recovery without adding a broad fallback.                               |
| `site_plan_review_recipients_per_episode`         | Pilot percentile exceeds the pre-registered usability bound                                      | Site Product + UX            | Review route sizes and staff comprehension; do not silently lower execution safety or delete history.                                         |
| `site_plan_review_handoff_failure_total`          | Any new responsible recipient missing an admitted successor item while source remains actionable | Site producer + Phase 17     | Reconcile the same handoff identity, expose no-route truth, and repair occurrence generation without reviving old engagement.                 |

The numeric product thresholds for route size, no-route rate, and completion are
not known facts. They must be declared before a representative pilot rather
than selected after seeing favorable results.

## Exact recommendation for the next Grill question

The next founder question should not ask only “who gets notified?” It should
explain that **authorization** and **responsibility** are separate and show the
staff consequence of each option.

Recommended choice wording:

> **Option 3 — explicit responsible reviewer(s), with one visible fallback.**
> A Tenant sets its Website reviewers once. Sites inherit that route unless an
> authorized manager deliberately sets a Site-specific route and visibly names
> the Tenant route as fallback. Only current route members who can actually open
> and perform the exact review receive personal items. No Plan creator chooses
> recipients, and Core never broadcasts to all capable staff. If neither route
> has a current qualified member, no item is created and Site → Languages shows
> **No review notification route** with the safe setup path.

The founder should be shown these concrete alternatives:

- **Option 1 — every currently qualified person:** least setup and strongest
  coverage, but broad notifications and unclear responsibility.
- **Option 2 — one named Site reviewer only:** clearest ownership and lowest
  noise, but a single absence or access change can strand the notification.
- **Option 3 — explicit Site/Tenant responsibility routes with a visible
  fallback (recommended):** low repeated setup, clear ownership, deliberate
  coverage, and no capability-wide broadcast; adds a small audited routing
  contract.
- **Option 4 — Core auto-selects by workload/round robin:** low fan-out with no
  manual assignment, but requires an unapproved workload/availability engine
  and makes ownership harder to explain.

## Remaining unknowns

- **Resolved founder decision:** Option 3 is selected and accepted with the
  amendments in the final D21 adversarial report.
- **Unresolved D22 founder decision:** whether a Site route may
  name several co-responsible reviewers or must name one primary plus an
  explicitly activated backup. Evidence supports both; the UI must state
  whether any one or every named person is required.
- **Validation need:** representative small and multi-Site ministry staff have
  not tested **Website reviewers**, **Site reviewers**, **fallback**, and **No
  review notification route** wording.
- **Validation need:** no production evidence establishes a safe UX cap for
  responsible reviewers per Site.
- **Assumption:** most small ministries can reuse one Tenant website-review
  route across their Sites. A read-only current-data census and staff interviews
  should verify this before fixing a default.
- **Assumption:** absence handoff is infrequent enough to remain an explicit
  route change rather than justify presence, schedule, or escalation machinery.
- **Repository dependency:** the exact Site review capability, responsibility
  owner, Phase 12 projection, Phase 17 resolver, and one-writer runtime remain
  future specification/implementation work.

## Final research judgment

The modern pattern is not “notify everyone who could possibly help.” It is:

1. identify responsibility at a stable scope;
2. intersect it with current authorization;
3. notify only the people who are both responsible and able to act;
4. make delegation/fallback explicit; and
5. keep the underlying source state discoverable when routing is empty.

For Core, a visible Tenant website-review route plus optional Site override is
the smallest model that satisfies those lessons. It gives one-person ministries
a one-time setup, gives multi-Site ministries accurate ownership, avoids broad
bell noise, and stays compatible with ADR-0027, Phase 12, D17, D19, and D20.
The founder selected that direction. The final D21 report narrows fallback,
unknown, stable-leg, prospective-setting, explicit-handoff, privacy, data, RLS,
and proof semantics; this research appendix does not supersede that synthesis.
