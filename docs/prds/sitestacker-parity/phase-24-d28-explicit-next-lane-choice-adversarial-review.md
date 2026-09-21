# Phase 24 D28 — explicit next-lane choice after external decline or expiry adversarial review

> **Artifact type:** Grill decision evidence; not a PRD, implementation
> authorization, migration, ticket set, or claim of shipped behavior.  
> **Founder answer:** **One state-driven explicit next-lane choice.**  
> **Review disposition:** **Accept with required amendments.**  
> **Session date:** 2026-08-28.

## Subsequent D29 reconciliation — 2026-08-28

D29 is now accepted with required amendments. D28 recovery attention uses the
distinct **Website review follow-up route**: one to three unordered, co-equal
same-Tenant Review coordinators at the Tenant default or an explicit Site
override, intersected with exact current source authorization. It never copies
or infers D21 reviewers, inviters, admins, capability holders, teams, or tasks.
Unconfigured, deliberately no-item, configured-but-proved-zero, or indeterminate
coverage never blocks independently authorized D25/source work. The key remains
Reserved pending implementation proof.
Statements below that describe D29 as “unresolved,” “next,” or “pending” record
the dependency state at the time of the D28 audit and are superseded by the
[D29 adversarial review](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md),
[D29 primary research](./phase-24-d29-explicit-website-review-coordinators-primary-research.md),
and amended [ADR-0182](../../adr/0182-one-current-candidate-review-responsibility-lane.md).

## Executive disposition

The founder's choice is the strongest permanent recovery model, but **create
one item and let staff choose** is too vague to implement safely. The corrected
decision is one source-owned `reassignment_needed` episode for a still-current
candidate after an external reviewer declines or the exact invitation/grant
expires without a review. It produces recipient-specific D19/ADR-0027
presentation only for the people who are currently authorized to perform at
least one next-lane action.

The item is not shared. Each exact Party+role recipient has independent unread
engagement. Reading clears unread for that recipient and nothing else. The item
remains in **Needs attention** until a fresh external handoff, a deliberate
return to the current internal route, or a source-owned terminal outcome
actually ends the condition. There is no dismiss, archive, snooze, due date,
age severity, recurring reminder, email, SMS, push, digest, or automatic lane
choice.

Decline and expiry have distinct recovery hierarchy:

- after **decline**, lead with **Choose another external reviewer** and offer
  **Return to internal review** when current internal eligibility and route
  proof permit it;
- after **expiry**, lead with **Invite Eli again**, then **Choose another
  external reviewer**, and offer **Return to internal review** when permitted;
  every invitation is fresh and the expired grant never revives.

The action list is derived from current D26 Tenant/Site posture, current source
admission, D23/D24 independence, exact internal eligibility, and D21/D22 route
resolution. External actions disappear when external review is prohibited or
indeterminate. Internal return distinguishes an eligible internal population
with a released-zero notification route from a true zero-eligible-human result
and from an indeterminate result. Unknown is never zero and never widens a
path.

The phrase **Keep current version** is rejected as an action. The current Live
version already remains unchanged by invariant. If the intended meaning is
wait, the D28 item must stay active; if it is abandon the Plan, the accepted
D17 command is **Cancel planned change**; if it is restore a reviewed baseline,
the source must name the exact compatible target. A vague button must never
hide unresolved review work.

D28 adds no new task system or recovery aggregate. It specializes ADR-0182's
source-owned `reassignment_needed` lane, uses D19/Phase 17 for presentation,
and returns through D25 or D21 source commands. The public Site, Giving, Legal
Entity, Stripe, settlement, bank, currency, contribution, receipt, ledger, and
accounting identity remain unchanged.

## Plain-language outcome

Hope Ministries asked Eli to review the private French-default candidate. Eli
declines before completing it. His access ends immediately. Ana and Joel do not
silently receive new review notifications merely because they were Hope's
prior internal reviewers.

The exact currently authorized next-lane managers see one item:

> **External review needs a next step**  
> hope.org · French (Canada)  
> The external review ended before completion. English (United States) remains
> live. Nothing changes automatically.  
> **Choose next review path**

Opening the item marks it read for that person but does not resolve it. On the
source page, an authorized viewer who may see Eli's identity sees:

> **Choose how review should continue**  
> Eli Ramos declined this review. Eli no longer has access.  
> hope.org still opens English (United States). The planned change is private.
> Giving is unchanged.  
> **Choose another external reviewer**  
> **Return to internal review**

If the invitation expires instead, **Invite Eli again** becomes the primary
action. If policy now prohibits external review, only lawful internal recovery
appears. If no eligible internal human exists, Core explains why internal
return is unavailable instead of offering a button that leads nowhere.

The source remains the permanent recovery location if no personal recipient
can be released. No message, task, engagement event, provider callback, cache,
or timer chooses the next lane.

## Evidence classification

- **Repository fact:** D19 defines source-driven, recipient-specific,
  in-product-only attention whose read state is separate from work state and
  whose active item has no dismiss/archive path.
- **Repository fact:** D20 owns exact review-required source episodes and ends;
  notification state cannot infer review completion or public effect.
- **Repository fact:** D21/D22 own current internal responsibility routing,
  released-zero versus indeterminate behavior, successor occurrences,
  differential handoff, and no old-item revival.
- **Repository fact:** D23/D24 own source-proportional independence and the
  complete substantive-participant proof; unknown or changed facts block.
- **Repository fact:** D25 makes decline and expiry terminal for the exact
  external invitation/grant, requires fresh post-expiry invitation, and keeps
  **Request changes** separate from decline.
- **Repository fact:** D26 is a current strictest-wins availability ceiling;
  narrowing denies incompatible external paths immediately and widening never
  resurrects or auto-invites.
- **Repository fact:** D27/ADR-0182 define one current source-owned lane and
  place decline/expiry without review into `reassignment_needed`; they
  explicitly reject automatic internal fallback before D28.
- **Repository fact:** the current runtime contains no D19 canonical item,
  D25 Candidate Review Authorization Context, D26 posture, D27 lane, or D28
  recovery command. Current generic Mission Control task and queue tables are
  not valid substitutes.
- **Verified external fact:** Blackbaud Grantmaking supports external reviewer
  assignment, acceptance/decline, reassignment, and visible review states.
  Its standing Reviewer Portal, stages, dates, and multiple reviewers are much
  broader than Core's candidate-scoped model.
- **Verified external fact:** HubSpot content approvals expose a pending state
  in the content editor and support explicit cancel/reassign. Its reviewers are
  existing account users and its flow may include due dates.
- **Verified external fact:** Microsoft Power Automate puts pending approvals
  in an Action items center and supports cancel/reassign. Its generic workflow,
  email, licensing, and guest-role model are not Core authority.
- **Verified external fact:** Contentful keeps assigned work discoverable and
  pending until completion. Its optional Tasks app, due dates, reminders, and
  marketplace dependency are deliberately rejected here.
- **Verified external fact:** GitHub supports explicit removal and re-request
  of reviewers. Its parallel-review behavior is negative evidence for an
  automatic or competing Core lane.
- **Verified external fact:** W3C WCAG 2.2 requires programmatically exposed
  status, labelled controls, predictable changes, keyboard operation, focus,
  and reflow. It does not determine Core's business transition.
- **Product judgment:** one explicit next-lane choice is less surprising than
  auto-returning to people Maria intentionally bypassed and more reliable than
  leaving recovery discoverable only by chance.
- **Assumption:** representative nonprofit Website staff understand **Choose
  next review path**, **Choose another external reviewer**, **Invite again**,
  and **Return to internal review**. Comparable products do not prove Core's
  exact wording; moderated research must verify it before Live.
- **Subsequently resolved product decision:** D29 now selects one to three
  explicit Review coordinators through the distinct Website review follow-up
  route; permission alone cannot select the audience. The minimum actionable
  feedback required for **Request changes** remains D30.

## Current behavior, intended behavior, and best permanent path

### Current repository behavior

No shipped Core surface implements this behavior. The current app has broad
role maps, generic mutable tasks, static Teams UI, provider-shaped notification
queues, and CMS state, but none can safely express D28:

- current task rows contain assignee, due-date, reminder, urgency, mutable JSON,
  and broad service-role patterns that contradict D19 and D28;
- a role such as `admin` or `staff` is not the exact Phase 12 capability and
  source eligibility proof required to choose a lane;
- an invitation/provider row owns neither source responsibility nor the current
  internal route;
- a shared notification row would let one person's read affect another and
  would leak identity across role/privacy boundaries; and
- Payload/CMS state cannot own Asym operational authorization, lane, or
  attention truth.

### Intended behavior before this review

The founder chose one deduplicated, state-driven in-product recovery item after
decline/expiry. It should reach only the currently authorized people who can
choose a lawful next lane. Reading clears unread, but the item stays actionable
until the underlying condition ends. There is no recurring reminder or email.

### Best permanent path

Specialize ADR-0182's existing `reassignment_needed` lane:

1. the source commits one immutable decline/expiry transition for the current
   exact external path;
2. the source exposes one closed D28 actionable meaning with a fixed resolver,
   fact allowlist, destination, and end rule;
3. Phase 6/17 creates one item per exact currently authorized Party+role;
4. the source page derives current lawful actions from D21–D26 and source
   proof; and
5. a fresh D25 handoff, D21 return, or D17/source terminal command ends D28.

Do not add another mutable recovery row, assignee, queue, workflow engine, or
notification preference.

## Exact corrected D28 decision

### D28-R1 — exact triggering scope

D28 applies only when the current D27 external lane ends through a proved
**decline** or **expiry** without a source review result, the exact candidate and
review episode remain current, and review is still required. Delivery failure
is nonterminal and remains D27/D25 resend/replace/return. Candidate
supersession, Plan/source terminality, policy/security revocation, cancellation,
and **Request changes** follow their separately owned transitions.

### D28-R2 — one source-owned reassignment-needed episode

The source transition advances the D27 lane to `reassignment_needed` and opens
one stable D28 semantic episode for the exact Tenant, environment, Site,
candidate, review epoch, prior external path, and terminal reason. Duplicate
callbacks, expiry sweeps, retries, cache refreshes, or provider observations
replay that episode and cannot create peers.

### D28-R3 — recipient-specific state-driven attention, pending D29

The D28 episode uses D19/ADR-0027 presentation. D29 must select one explicit,
bounded responsibility route/recipient role. One complete current resolver
will intersect that responsibility with exact Party+role recipients who are
currently authorized to perform at least one lawful next-lane action. Phase 17
creates separate items and engagement for each selected recipient. There is no
shared Tenant item, recipient array, group read flag, capability broadcast, or
inviter-owned task. The D28 key remains Reserved until D29 closes this resolver.

### D28-R4 — permission is necessary but never responsibility

The original inviter, prior internal reviewer, Plan creator, latest editor,
every admin, every capability holder, support, or prior item recipient is not a
fallback. Current exact lane-management capability and source visibility only
subtract from the explicit D29 responsibility route; they do not create it. A
person who can only view receives no actionable item. A complete zero-member
resolution releases zero items and preserves source discoverability; partial,
timed-out, stale, contradictory, or overflow resolution releases nothing and
reconciles the same occurrence.

### D28-R5 — read and work state remain separate

Opening the item or deliberately marking it read clears unread only for that
exact Party+role engagement. The item remains under **Needs attention** while
the source episode is actionable. Read, click, preview, browser navigation,
provider event, age, route view, or contact selection cannot choose a lane,
end the item, create review evidence, or affect another recipient.

### D28-R6 — no dismiss, archive, snooze, reminder, or email

An active D28 item has no dismiss, archive, hide, resolve, snooze, due date,
priority, escalation, recurring reminder, digest, email, SMS, push, browser/OS
notification, sound, or age-derived severity path. D28 registers only one
in-product step. Any later channel or cadence requires a separate founder,
Phase 17, consent, privacy, and source contract.

### D28-R7 — privacy-safe list preview

The bell/list preview may show only safe Site display context, locale/candidate
purpose, closed reason **External review ended**, exact unchanged Live
consequence, and **Choose next review path**. It does not show external reviewer
name/email, draft content, feedback, internal recipient names, participant
identity, restricted ministry facts, private URLs, raw IDs, tokens, expiry
details, Giving state, donor/missionary data, or finance.

### D28-R8 — role-safe source detail

On the source page, only a viewer independently authorized to see the saved
reviewer/contact projection may see Eli's safe display identity and whether he
declined or expired. Everyone else sees **The external review ended before
completion**. External email, identity proof, assurance detail, delivery
metadata, internal route members, and security/policy reasons remain hidden.

### D28-R9 — decline action hierarchy

For a still-current declined path, the detail page leads with **Choose another
external reviewer** when current D26/source/D23/D24 proof permits external
review. It offers **Return to internal review** only when current internal
eligibility can be proved and the user may invoke the return. It does not offer
**Invite Eli again** as the recommended action after an explicit decline; the
same person may be selected later only through a fresh deliberate picker and
current proof.

### D28-R10 — expiry action hierarchy

For a still-current expired path, the detail page leads with **Invite Eli
again** when Eli remains an admissible stable human and current D26/source/
D23/D24 proof permits external review. The action always creates a fresh D25
invitation with current scope, assurance, projection, and expiry. Secondary
actions are **Choose another external reviewer** and, when lawfully available,
**Return to internal review**. The expired path never extends, reopens, or
supplies authority to the successor.

### D28-R11 — every external successor is fresh

Selecting a saved contact only prefills D25. The final command re-proves exact
candidate, source admission, Tenant/Site posture, stable human, participant
independence, assurance, current projection, policy epochs, and one-active
invariant. A successful command creates a fresh external lane under D27 and
ends the D28 episode. No terminal invitation, grant, context, session, item, or
engagement revives.

### D28-R12 — internal return uses the current D21/D22 route

**Return to internal review** resolves the current explicit Site/Tenant route
at command time. It never assigns the person pressing the button, prior
reviewers, old route snapshot, original internal items, inviter, every eligible
actor, or every admin. Successful return creates one new internal lane and one
D21 successor routing occurrence; old personal items never revive and new
recipients receive new engagement.

### D28-R13 — route zero, eligibility zero, and unknown are distinct

Before offering/committing internal return, Core distinguishes:

- **eligible internal humans + released recipient set:** preview the lawful
  current recipients and create their successor items;
- **eligible internal humans + released-zero route:** permit an internal lane
  with no personal items, state that nobody will be notified, and preserve
  source-page review for independently authorized people;
- **zero eligible internal humans:** do not offer a misleading internal return;
  explain that another eligible human is required;
- **indeterminate eligibility or route:** choose nothing, keep
  `reassignment_needed`, and show retry/repair guidance.

Unknown is never zero. Route responsibility grants no eligibility, and
eligibility creates no route responsibility.

### D28-R14 — current D26/source policy controls every action

Every read and command re-resolves the current strictest platform, source,
Tenant, and Site posture. External actions disappear or reject when posture is
`external_review_prohibited`, when recovery-only has a proved eligible internal human, when
any source prohibits external review, or when proof is indeterminate. Under
recovery-only, external action is available only after complete current
zero-internal proof. Widening never resurrects or auto-selects a successor.

### D28-R15 — policy and source change update the lawful hierarchy, not history

If policy/source facts change while D28 is open, the same D28 source episode
remains until a lawful next lane or source end commits, but the currently
available actions may narrow. Existing terminal reason and immutable history do
not change. No cached UI may submit an action that the current server proof no
longer admits.

### D28-R16 — **Keep current version** is prohibited as a D28 action

Current Live behavior is consequence copy, not an actionable resolution. D28
SHALL NOT use **Keep current version**, **Done**, **Dismiss**, **Resolve**, or
**Ignore** to end or hide the item. Waiting leaves D28 active. Abandoning the
private Plan uses D17 **Cancel planned change** with its own capability,
confirmation, and source effects. Restoring a baseline names the exact
source-proved reviewed version and uses that source command.

### D28-R17 — Plan cancellation remains separately owned

Where the current viewer may cancel the Plan, D28 may expose **Cancel planned
change** as a visually tertiary action after the exact D17 consequence preview.
It is not preselected, not renamed **Keep current**, and not part of lane
selection. Successful Plan cancellation ends D28 from source truth and never
deletes independent Page, Navigation, Communications, or review history.

### D28-R18 — source transitions alone end attention

The D28 episode ends only when a fresh external handoff commits, an internal
return commits, the Plan/candidate/source becomes terminal, or another
registered source transition makes reassignment inapplicable. Phase 17
projection, item read, item cleanup, support action, provider callback, or
worker completion cannot set source end.

### D28-R19 — repeated decline/expiry creates episodes, not reminders

One exact terminal external path creates at most one D28 episode. If staff
deliberately choose a new external reviewer and that new exact path later
declines/expires, a genuinely new source episode may create one new unread item.
Repeated failure never auto-returns internal, changes posture, scores or
penalizes a reviewer, raises urgency, or emits a reminder. Authorized history
may show a neutral count of prior ended attempts.

### D28-R20 — offline and stale clients are read-safe and write-inert

Offline/cached UI may render only a privacy-safe terminal summary. It cannot
queue or claim success for invite, return, cancel, mark-read, or next-lane
commands. Controls state **Reconnect to choose how review continues**. Every
server command requires current heads and returns typed current truth to stale
losers. Locally entered unsaved picker text may remain on the device but cannot
become an authoritative contact or invitation.

### D28-R21 — one CAS decides competing recovery choices

Fresh external handoff, internal return, Plan cancellation, candidate change,
source completion, policy transition, and another manager's choice compare the
same current lane/candidate/source/policy heads. Exactly one authoritative
transition wins. A loser creates no invitation, item, review, public effect, or
fake read and receives the current outcome. Provider/network calls occur only
through durable outbox after local commit.

### D28-R22 — bounded scope and next decision

D28 creates no comment system, issue tracker, source editor, feedback schema,
assignee, generic task, workflow, backup reviewer, automatic fallback,
deadline, reminder, external dashboard, or standing guest. **Request changes**
is a distinct D25/source outcome; a later Grill decision will decide its
minimum actionable feedback. D29 first closes D28 recovery responsibility.

## Complete staff and external-reviewer UX/UI contract

### Information architecture and Core/Base Maia fit

D28 reuses the canonical staff bell/notification center and the existing Site
review context. It creates no Site-specific inbox or task board.

- Bell/list: one compact recipient-specific D19 row with **Needs attention**,
  safe Site/locale context, unchanged Live consequence, and one
  **Choose next review path** navigation action.
- Source page: one Base Maia status `Card` using semantic tokens, a clear
  heading, factual terminal reason, unchanged-public explanation, and
  consequence-led actions.
- Pickers/confirmation: reuse D25's Base Maia searchable selector and D27's
  handoff/return confirmation. No app-local primitive, second visual system, or
  workflow builder.
- Motion: static by default. Route transition tokens may apply, but status does
  not pulse, shake, count down, or animate urgency.
- Density: calm compact PageShell/card rhythm. No red danger styling for an
  ordinary decline or expiry; reserve destructive presentation for genuine
  security/error meaning.

### Privacy-safe notification preview

```text
External review needs a next step

hope.org · French (Canada)
The external review ended before completion.
English (United States) remains live. Nothing changes automatically.

[Choose next review path]
```

The row does not expose whether the cause was decline or expiry unless the
recipient is authorized for that detail. It never exposes Eli's name/email,
private candidate content, internal route members, or restricted source facts.

### First authorized detail view after decline

```text
Choose how review should continue

Eli Ramos declined this review.
Eli no longer has access.

hope.org still opens English (United States).
The planned change is private. Giving is unchanged.

[Choose another external reviewer]
[Return to internal review]
```

**Choose another external reviewer** is the primary filled button when current
policy/source proof permits it. **Return to internal review** is secondary. A
tertiary **Cancel planned change** appears only to an authorized viewer and only
with the D17 consequence flow.

### First authorized detail view after expiry

```text
Choose how review should continue

Eli Ramos's review access expired on 4 September at 17:00 ICT.
Eli no longer has access.

hope.org still opens English (United States).
The planned change is private. Giving is unchanged.

[Invite Eli again]
[Choose another external reviewer]
[Return to internal review]
```

**Invite Eli again** is primary only if Eli remains admissible under fresh
proof. The confirmation repeats exact Site, candidate, new expiry, safe
projection, and unchanged Live behavior. It never says **Extend** or reuses the
old link.

### Recipient with action capability but no contact-detail visibility

```text
Choose how review should continue

The external review ended before completion.
The external reviewer no longer has access.

[Choose another external reviewer]
[Return to internal review]
```

The selector may reveal only contacts the actor is independently permitted to
discover. Item possession never expands contact search.

### View-only staff member

```text
External review needs a next step

No reviewer currently owns this version.
An authorized Website review manager must choose how review continues.

hope.org still opens English (United States).
```

No disabled fake action or manager/reviewer identity is exposed. If a safe
navigation to the Site context is permitted, it remains read-only.

### External review no longer permitted

```text
External review is no longer available for this version

Your organization's current review setting or a required source no longer
permits another external invitation.
Nothing has been shared and your website remains unchanged.

[Return to internal review]
```

Do not reveal which hidden source or policy caused the restriction unless the
viewer has separate configuration authority. If internal return is unavailable,
replace the action with exact safe setup/blocked guidance.

### Eligible internal humans and released route

```text
Return this review to Hope Ministries?

Maria Santos and Ana García will receive new review items.
The ended external invitation will remain closed.
Old internal items and read state will not return.

[Back] [Return to internal review]
```

Names appear only when the actor may enumerate the route. Otherwise show the
authorized count and safe route label.

### Eligible internal humans and released-zero route

```text
No internal review notification route is available

Returning to internal review will not notify anyone.
Authorized staff can still review from Site → Languages.

[Set up review notifications]
[Return without notification]
```

Returning without notification is permitted only when current independent
internal eligibility is proved. It creates a released-zero successor, not a
guessed item.

### Zero eligible internal humans

```text
Another external reviewer is required

Core cannot currently prove an eligible internal reviewer for this version.
Choose another external reviewer, or add an eligible internal reviewer through
the organization's normal access and responsibility settings.

[Choose another external reviewer]
```

If external review is prohibited too, the card explains that the current Site
remains unchanged and points to the lawful internal setup or D17 cancel/safe
baseline path. It never proposes same-human/admin bypass.

### Internal eligibility or route is indeterminate

```text
Core couldn't verify internal review

Nothing has been reassigned. Try again when Core can verify the current review
route and eligibility.

[Try again]
```

The prior external access remains terminal; `reassignment_needed` stays active.
Core does not restore the prior external grant merely because internal proof is
unavailable.

### D26 posture changes while the page is open

On fresh render and on every action, the server derives the effective posture:

- `source_permitted_choice`: show fresh external options plus lawful internal
  return;
- `recovery_only` with complete zero-internal proof: show fresh external
  options;
- `recovery_only` with an eligible internal human: hide/reject external options
  and lead with internal return;
- `external_review_prohibited`: hide/reject external options; or
- unknown/conflict: show no favorable external action.

A stale picker submission receives:

```text
Review options changed

External review is no longer available for this version.
Nothing was sent. Review the current choices below.
```

### Repeated decline or expiry

After staff deliberately resolve one D28 episode with a fresh invitation, a
later decline/expiry may open a new episode:

```text
External review needs a next step

This is the second external invitation that ended before review.
No reviewer currently has access.

[Choose another external reviewer]
[Return to internal review]
```

The count is neutral history for authorized viewers. Core does not label the
reviewer unreliable, infer staff error, recommend a policy change, increase
urgency, send a reminder, or automatically route internal.

### External reviewer's terminal experience

After decline:

```text
You declined this review

You no longer have access to this version.
Hope Ministries will choose how the review continues.
```

After expiry:

```text
This review invitation expired

You no longer have access to this version.
Contact Hope Ministries through the support information in your invitation if
you believe this is a mistake.
```

The page does not show internal reviewers, next-lane choice, policy, staff
identity, private history, or whether another invitation exists. Uniform
missing/revoked/expired responses prevent enumeration where detail is unsafe.

### Offline and weak-network experience

```text
You're offline

Reconnect to choose how this review continues.
No invitation or reassignment has been made.

[Try again]
```

No lane mutation or read receipt is queued. If contact search text was entered,
the local field may remain, but no contact is saved and no invitation is
claimed. After reconnect, Core reloads current candidate/lane/policy and asks
the user to review any changed impact.

### Stale and concurrent outcome experience

If another manager already chose a lane:

```text
Review responsibility already changed

Ana García returned this version to internal review.
The current review status is shown below.

[View current review]
```

Actor name appears only with audit visibility; otherwise say **Another
authorized person**. No generic error toast is the only explanation.

### Mobile, keyboard, screen-reader, RTL, and long-text behavior

- The card and action stack reflow to one column at 320 CSS pixels and 400%
  zoom; primary action is first in DOM and visual order.
- Important controls meet Core's 44px target policy. There is no hover-only
  action, drag, swipe-only behavior, or horizontally scrolling button row.
- Long Unicode names, organizations, locales, and translated action labels
  wrap without truncating the distinguishing identity or hiding consequences.
- RTL uses logical flow; icons are decorative and `aria-hidden`, and no meaning
  depends on left/right position or arrow direction alone.
- Status headings, reason, current Live consequence, and action descriptions
  are programmatic text. Color/badge/icon never carries status alone.
- Background source change is announced once through a polite live region
  without moving focus. A blocking current-state conflict uses a concise alert
  and moves focus only according to the shared dialog/error contract.
- Opening marks read only after the authenticated current item command
  succeeds. A failed read operation is not visually claimed as saved.
- Dialog close returns focus to the invoking control when it still exists; if
  the source item ended, focus moves to the current status heading without
  stealing focus repeatedly.
- Reduced motion uses the repository baseline. No countdown, pulse, confetti,
  urgency animation, or automatic carousel is introduced.

## Source of truth and ownership

| Fact                                                                               | Authoritative owner                                                                                     | D28 use/projection                                                      | Forbidden owner                                                  |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| exact candidate, review obligation, episode, current heads, outcome, public effect | consequence-owning Page/Navigation/Site/default/publication source                                      | proves D28 applicability and source end                                 | item, read state, provider, invitation, task                     |
| current Candidate review responsibility lane                                       | source under ADR-0182                                                                                   | `reassignment_needed` and next-lane CAS                                 | D19 item, D21 route, D25 invitation, browser                     |
| external invitation/grant terminal reason and access denial                        | Phase 4 + D25 source/context owner                                                                      | proved decline/expiry reference and role-safe detail                    | email provider, saved contact, staff label                       |
| external-review availability                                                       | D26 platform/source/Tenant/Site policy heads                                                            | derives currently lawful external actions                               | caller toggle, cached UI, Site display label                     |
| independent internal eligibility                                                   | Phase 12 + D23/D24 + source                                                                             | determines whether internal review is actually possible                 | D21 responsibility, role name, item possession                   |
| internal attention route and successor resolution                                  | D21/D22 source route owner                                                                              | current released members, released-zero, or indeterminate return result | prior items, inviter, command actor                              |
| D28 recovery responsibility                                                        | **Unresolved D29**; must be explicit responsibility intersected with current exact action authorization | future recipient resolver for the D28 item                              | every capability holder, original inviter, broad admin inference |
| D28 source occurrence and end                                                      | consequence-owning source producer                                                                      | stable semantic episode, reason, destination, end                       | Phase 17, cleanup worker, read/archive                           |
| recipient item and engagement                                                      | Phase 17/ADR-0027                                                                                       | personal presentation and unread/read                                   | source review, lane choice, sibling engagement                   |
| delivery and external communication evidence                                       | Phase 6/17                                                                                              | only D25 invitation history; D28 adds no message                        | lane, acceptance, review, source result                          |
| saved reviewer contact                                                             | CRM/Party reference owner                                                                               | prefill for a fresh D25 invitation                                      | access, qualification, responsibility, authority                 |
| Plan cancellation                                                                  | D17                                                                                                     | optional separately authorized terminal action                          | D28 item, Keep-current label, external reviewer                  |
| durable business/security audit                                                    | owning source/Phase 4/Phase 12/Phase 6 append-only histories                                            | causal references and role-safe support evidence                        | technical logs, analytics, mutable UI history                    |
| technical health                                                                   | source/Phase 17/Platform telemetry                                                                      | opaque lag/error/race signals                                           | business truth, staff task, policy automation                    |
| public website and Giving/finance                                                  | D16/public generation and Giving/finance owners                                                         | unchanged-consequence copy only                                         | D28 lane, item, contact, reviewer action                         |

## Domain invariants

1. One exact current external path can create at most one current D28
   reassignment episode.
2. D28 opens only from proved decline or expiry without review for a still-
   current candidate that still requires review.
3. Delivery failure, request changes, cancellation, policy/security loss,
   candidate supersession, and review completion are not silently relabelled
   decline/expiry.
4. One D28 episode occupies one permanent semantic occurrence slot; duplicate
   events replay it.
5. Recipient resolution is all-before-any and may release zero current
   recipients. It is never truncated or partially released.
6. D29 responsibility selection will be necessary but never sufficient;
   current exact view/next-lane authorization subtracts from it.
7. Capability alone never creates D28 responsibility. Original invitation
   authorship alone never creates D28 responsibility.
8. One exact occurrence+Party+role+surface has at most one active personal
   item.
9. One recipient's engagement cannot read, hide, end, transfer, or mutate a
   sibling item.
10. Read and unread are personal presentation facts; actionable source state
    is independent.
11. Active D28 work has no dismiss/archive/snooze path anywhere.
12. A released-zero recipient result creates no guessed item and does not end
    source discoverability.
13. Resolver unknown is not zero and releases no partial audience.
14. Decline and expiry are terminal for the old external invitation, grant,
    context, and session.
15. Every later external path is a fresh D25 invitation and lane revision.
16. Every internal return uses the current D21/D22 hierarchy and one successor
    occurrence; old items never revive.
17. Internal route zero, internal eligibility zero, and unknown are different
    states with different lawful actions.
18. D26/source posture can only narrow actions; a favorable stale UI cannot
    widen current authority.
19. Widening policy cannot resurrect an old path or select a next lane.
20. One source CAS chooses among fresh external handoff, internal return, Plan
    terminality, candidate/source change, and competing manager actions.
21. A losing command has zero business, notification, public, or engagement
    side effects.
22. D28 presentation failure cannot roll back or alter source/lane truth.
23. Phase 17 cleanup cannot end D28 source actionability.
24. **Keep current version** never ends or hides D28.
25. Waiting is represented by leaving D28 active; it is not a command.
26. Plan cancellation remains the D17 command and does not delete independent
    source work.
27. Repeated ended external attempts never become urgency, reputation,
    automatic policy, or automatic fallback.
28. Public Site and Giving/finance truth never depend on D28 state.
29. Every cross-record relationship proves Tenant, environment, Site,
    candidate, review epoch, and relevant Party/source scope.
30. Direct browser, CMS, provider, support, import, and generic task writes
    cannot choose a lane or recipient.
31. The D28 message key remains Reserved until D29 establishes the explicit
    responsibility route, recipient role, cardinality, fallback, resolver, and
    proof pack.
32. D28 creates no new generic task, workflow, comment, assignment, reminder,
    or external portal subsystem.

## Conceptual database, RLS, and authorization contract

This is a normative design boundary, not an instruction to implement a literal
table layout before OpenSpec/design review.

### Required logical records

1. **Candidate review lane revision/head** — D27/ADR-0182 current source lane,
   expected predecessor, exact candidate/review epoch, transition kind, and
   causal source/external references.
2. **External terminal transition** — immutable D25/Phase 4 decline or expiry
   fact, old invitation/grant/context references, source/candidate heads, and
   server time.
3. **Candidate review reassignment episode** — stable source semantic identity,
   exact applicability/end revision, closed terminal reason, safe fact adapter,
   destination code, and future D29 resolver contract/version.
4. **Routing occurrence/member set** — Phase 6/17 immutable header, complete
   D29-resolved canonical Party+role set, ordered digest, release marker, and
   source fences.
5. **Personal notification item/engagement** — exact Party+role+surface item,
   unread/read engagement, and source-controlled presentation end.
6. **Next-lane command receipt** — semantic idempotency key, actor/context,
   before/after heads, exact result, and no body/credential.
7. **D21 internal successor occurrence** or **D25 fresh invitation/handoff** —
   created only by its existing owner, referenced by the D28 end transition.
8. **Durable audit/outbox evidence** — body-free causal references for
   presentation reconciliation; no email/provider obligation for D28 itself.

### Required relational constraints

- composite same-scope primary/foreign keys include Tenant and environment;
  Site, candidate, review epoch, Party, and source scope are repeated where
  required to make cross-scope attachment impossible;
- at most one current lane head per exact source scope;
- at most one current D28 episode per exact lane/candidate/review epoch;
- decline/expiry reason checks admit only the compatible old external terminal
  state and reject a favorable review/result reference;
- one permanent source occurrence slot per semantic D28 episode;
- one active item per occurrence+Party+role+surface;
- released membership requires a complete ordered digest and release marker;
  unreleased/partial rows are never claimable;
- item scope, Party, role, source, preview contract, destination, and occurrence
  are immutable;
- engagement updates cannot alter item/source fields;
- source end is monotonic and cannot be cleared or moved later;
- old invitation/grant/context terminality is monotonic; fresh successor uses a
  new identity;
- next-lane receipts have unique semantic command identity and exactly one
  compatible result;
- restrictive deletes preserve lane, decision, routing, and audit history;
- foreign-key columns and current/reverse/reconciliation paths have supporting
  indexes; and
- no JSON recipient array, mutable assignee, role-name authorization, or
  copied source status stands in for normalized relationships.

### RLS, grants, and privileged paths

- Enable and **FORCE RLS** on every D28-bearing row, including owner access.
- Browser/authenticated roles receive no direct insert/update/delete on source
  lane, episode, occurrence, membership, item-source fields, end, command
  receipt, or audit.
- Read policies derive the current validated Tenant Authorization Context and
  exact target/purpose projection. A client-supplied Tenant/Site/Party/role is
  never trusted.
- Recipient item reads require exact current Party+role presentation and
  current source/access proof. Item possession is insufficient.
- Engagement mutation **USING** and **WITH CHECK** bind the same immutable item,
  Party, role, and only permitted read/unread fields.
- Source/lane commands live behind server-owned `packages/api` boundaries or
  narrowly governed security-definer functions with fixed `search_path`,
  qualified objects, least privilege, and explicit grants.
- Service-role, support, import, export, reconciliation, realtime, cache, and
  background-worker paths enforce the same Tenant/environment/Site/candidate/
  Party/source fences and cannot invent recipients or source end.
- Actor, stable Party, capability, D29 responsibility, candidate, source,
  expected heads, route result, terminal reason, and audit attribution are
  derived from trusted server/context/source facts, not request fields.
- An allowed update cannot transform an item/episode/receipt into another
  scope, recipient, reason, or lifecycle state.
- Policy checks are operation-specific: a person may view the safe D28 status
  without being allowed to invite, return, cancel, enumerate contacts, or view
  history.

### Authoritative command boundaries

**RecordExternalTerminalWithoutReview**:

- validates current exact external lane, decline/expiry fact, server time,
  candidate/source continued applicability, and expected heads;
- makes old external access terminal through the D25/Phase 4 owner;
- advances D27 to `reassignment_needed` and records the D28 source episode;
- creates the Phase 6/17 occurrence obligation only after D29 supplies the
  accepted resolver contract; and
- performs no provider call or automatic next-lane choice.

**InviteFreshExternalReviewer** delegates to D25/D27:

- re-proves D26/source posture, D23/D24, stable human, assurance, projection,
  candidate, one-active invariant, and current D28 head;
- creates a fresh invitation/external lane/receipt/outbox atomically;
- ends D28 from source truth; and
- cannot reuse terminal credential, expiry, context, item, or engagement.

**ReturnToInternalReview** delegates to D21/D22/D27:

- re-proves internal eligibility independently from responsibility;
- resolves the current route completely as released members,
  released-zero, or indeterminate;
- creates one new internal lane and successor occurrence only for a released
  result;
- ends D28 atomically with that successor; and
- cannot self-assign the command actor or revive old items.

**CancelPlannedChange** remains D17-owned:

- uses its own capability, expected Plan/source heads, consequence preview,
  idempotency, and terminal receipt;
- ends D28 only because the source Plan/episode ends; and
- does not delete or rewrite independent source work/review history.

**MarkRead** remains Phase 17-owned and changes only the current recipient's
engagement. **Dismiss**, **Archive**, **Snooze**, **Resolve item**, **Keep
current**, and direct lane selection through item mutation do not exist.

## Lifecycle, temporal correctness, concurrency, and idempotency

| Event                                                            | Authoritative source/lane result                                                                           | D28 presentation/result                                                                           |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| external reviewer proves decline while candidate remains current | old external path terminal; lane becomes reassignment-needed; one D28 episode                              | future D29 resolver releases one personal item per selected current Party+role                    |
| server time reaches exact expiry before review commits           | old external path terminal; reassignment-needed                                                            | same D28 meaning with expiry detail and fresh-invite option if lawful                             |
| duplicate decline/expiry event or sweep retry                    | exact replay; no new lane/episode                                                                          | no peer item or unread pulse                                                                      |
| decline then late expiry callback                                | decline remains first compatible terminal reason                                                           | same D28 item; reason does not flap                                                               |
| expiry races favorable review                                    | one expected-head/server-time CAS winner                                                                   | review winner ends episode; expiry winner rejects stale review and opens D28                      |
| item opens/marks read                                            | no source/lane change                                                                                      | that recipient unread clears; active work remains                                                 |
| sibling recipient reads                                          | no source/lane change                                                                                      | only sibling engagement changes                                                                   |
| route/responsibility membership changes while D28 open           | D28 source remains; D29 resolver generation may require successor presentation according to accepted rules | never append recipients to released occurrence or infer capability as responsibility              |
| external policy narrows                                          | currently lawful external actions may disappear; incompatible live access already terminal under D26       | D28 persists with current lawful choices; old invitation never revives                            |
| external policy widens                                           | no lane/invitation change                                                                                  | fresh external action may appear only after current reproof; no auto-send                         |
| source external admission becomes unknown/prohibited             | no favorable external transition                                                                           | external action omitted; D28 persists or source ends under its owner                              |
| eligible internal people + released current route                | return command may create internal lane/successor                                                          | D28 ends; new recipients get new items                                                            |
| eligible internal people + released-zero route                   | return command may create zero-member internal lane                                                        | D28 ends; no personal item; source discoverable                                                   |
| zero eligible internal people                                    | internal return inadmissible                                                                               | external/setup guidance; D28 remains                                                              |
| internal eligibility/route indeterminate                         | no return transition                                                                                       | retry/repair; D28 remains; nobody guessed                                                         |
| fresh external handoff succeeds                                  | new D25 invitation/external lane                                                                           | D28 ends; delivery tracked separately                                                             |
| fresh external handoff local commit fails                        | no authoritative change                                                                                    | D28 remains; safe retry                                                                           |
| provider dispatch fails after fresh handoff                      | new external lane remains                                                                                  | D28 stays ended; D27 delivery-failure recovery applies                                            |
| two managers choose different paths                              | one current-head CAS winner                                                                                | loser sees current lane; creates nothing                                                          |
| stale tab submits after candidate change                         | source/candidate fence rejects                                                                             | current candidate/state explanation; no invitation/return                                         |
| Plan cancelled                                                   | D17 terminal source outcome                                                                                | D28 ends; no fabricated read                                                                      |
| candidate becomes satisfied/terminal elsewhere                   | source end                                                                                                 | D28 ends; unseen item creates no unread debt                                                      |
| recipient loses access                                           | authorization revision                                                                                     | active/recent item disappears immediately; source D28 may remain for other recipients/source page |
| recipient later regains access                                   | authorization only                                                                                         | old item never revives; later accepted D29 successor rules control any new presentation           |
| no recipient resolver result                                     | source D28 remains                                                                                         | released-zero if complete; no guessed item                                                        |
| resolver timeout/partial/overflow                                | source D28 remains                                                                                         | no partial release; reconcile same occurrence                                                     |
| database response lost after command commit                      | receipt/head are authoritative                                                                             | same semantic key returns same result; no duplicate successor                                     |
| rollback/replay restores old rows                                | current heads/terminal constraints/policy epochs prevail                                                   | no old context/item/engagement revival                                                            |

Time does not make D28 more urgent or choose a lane. Expiry is the source event
that opens D28; after that, Plan age and D28 age have no lifecycle authority.
Absolute timestamps are stored as instants and displayed with localized date,
time, and zone. Clocks, DST, locale, unread age, browser inactivity, or support
age never infer staff/reviewer availability.

## Strongest alternatives

### Alternative A — automatically return to the current internal route

This minimizes staff effort and may progress ordinary work quickly. It is
rejected because Maria deliberately selected external expertise, D21 has no
declared external-to-internal fallback, internal route resolution may be zero
or indeterminate, and old responsibility must not be silently recreated.

### Alternative B — show source recovery with no personal item

This avoids notification noise and storage. It is rejected because required
work may be forgotten indefinitely and D19 already provides a bounded,
recipient-specific, source-driven presentation model. Zero-resolver remains a
valid edge state, not the desired default.

### Alternative C — ask for a decline/expiry fallback during every invitation

This makes future behavior explicit per candidate. It is rejected because it
adds a decision to every normal invitation for a rare failure, stores another
candidate policy, becomes stale as routes/policy change, and complicates D25's
otherwise small sheet.

### Alternative D — original inviter owns recovery

This is easy to explain when the inviter is still active. It remains unresolved
as D29 Option 3 and is not accepted here because inviter absence, conflict,
role loss, participation, or limited visibility can strand or misroute the
item. Invitation authorship is provenance, not responsibility.

### Alternative E — every current exact-capability holder receives recovery

This appears safe because every recipient can act. It remains D29 Option 2 and
is not accepted here because capability is not responsibility, it creates
notification fan-out/privacy noise, and permission changes would silently
change ownership.

### Alternative F — mutable shared task or queue

This could expose one work card and let staff claim it. It is rejected because
it creates another inbox/task authority, shared read semantics, mutable
assignee/urgency/due-date concepts, and a temptation to make task completion
choose the source lane.

### Alternative G — **Keep current version** resolves the item

This sounds reassuring but is semantically empty or dangerous. Waiting already
keeps Live unchanged; canceling has a D17 command; restoring has a source-owned
exact target. It is rejected in favor of consequence copy and explicit lawful
actions.

## External modern-practice evidence and limits

### Blackbaud Grantmaking — nonprofit external-review demand

[Blackbaud Reviews](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reviews.html)
documents internal/external reviewers, invitation acceptance/decline,
reassignment, feedback, and visible review states. This supports a real
nonprofit need for explicit recovery. Core does not import Blackbaud's standing
Reviewer Portal access, committees, several reviewers, stages, due/acceptance
dates, visibility windows, notification preferences, or final grant-decision
workflow.

### HubSpot — pending status and deliberate reassignment

[HubSpot content approvals](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
keeps approval visible in content context and offers cancel/reassign. This
supports source-context recovery rather than a hidden queue. HubSpot reviewers
are account users and the product supports richer approval settings; it does
not prove Core recipient routing, external identity, privacy, or D19 semantics.

### Microsoft Power Automate — action center and explicit lifecycle

[Power Automate approval management](https://learn.microsoft.com/en-us/power-automate/approve-reject-requests)
shows pending approvals in an Action items surface and records approve/reject.
[Approval scenarios](https://learn.microsoft.com/en-us/power-automate/approvals-howto)
include cancel/reassign. Core imports only the value of discoverable pending
work and explicit recovery; it rejects generic flows, email actions, timers,
Dataverse guest roles, licensing, and custom response workflow.

### Contentful — persistent assigned work with separate permission

[Contentful Tasks](https://www.contentful.com/help/content-and-entries/tasks/)
keeps assigned work visible and can block publication until complete. It also
uses due dates, reminders, teams, a marketplace app, and generic tasks. Those
features are not evidence for Core; D28 remains a source episode projected
through Phase 17, not a task.

### GitHub — re-request/removal and parallel-review warning

[GitHub review requests](https://docs.github.com/en/rest/pulls/review-requests)
can be explicitly requested and removed, and GitHub supports re-request after
changes. This supports fresh successor identity. GitHub allows several
reviewers and broad repository readers to review, so it is negative evidence
for inferred exclusive responsibility or Core's external privacy model.

### W3C — interaction and status, not business policy

[WCAG 2.2](https://www.w3.org/TR/WCAG22/) requires name/role/value,
programmatically available status messages, labels/instructions, keyboard
access, focus, reflow, target size, and predictable changes. The
[radio-group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) informs
any mutually exclusive next-lane selector. These sources do not determine who
is responsible, whether a lane should auto-fallback, or how source authority
works.

The external products demonstrate useful interaction patterns, not a universal
nonprofit answer. Core repository decisions remain authoritative.

## Full adversarial category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

- **What could go wrong:** Core could treat decline/expiry as a notification
  problem, automatically send the work somewhere, or add a generic task when
  the root problem is an unresolved source-owned choice of the next review
  lane.
- **Why it matters:** The wrong abstraction either surprises staff with a new
  reviewer, hides stranded work, or creates a second work-management product.
- **Severity:** High.
- **Likelihood:** High without D28 because D27 intentionally stops at
  `reassignment_needed`.
- **Evidence or reasoning:** D19 already solves persistent personal attention;
  D21/D22 solve internal routing; D25 solves fresh external invitation. The
  missing job is a deliberate choice among those existing commands.
- **Decision effect:** Accepts explicit state-driven choice and rejects
  automatic fallback, no-item recovery, and generic task creation.
- **Best permanent fix:** Keep one source episode whose only effect is to lead
  authorized responsible people to current lawful lane commands.
- **Exact decision/spec language:** “A proved external decline or expiry for a
  still-current review-required candidate SHALL enter one source-owned
  `reassignment_needed` episode and SHALL NOT itself select an internal or
  external successor lane.”

### 2. Brittleness

**Material concern: Yes.**

- **What could go wrong:** Recovery could work only when the inviter remains
  employed, the route is nonempty, policy is unchanged, provider events arrive
  once, the candidate stays current, and one browser acts at a time.
- **Why it matters:** Decline/expiry is already an exception path; relying on
  ideal ordering makes it fail precisely when staff need it.
- **Severity:** Critical.
- **Likelihood:** High over system lifetime.
- **Evidence or reasoning:** D21 distinguishes zero from unknown; D25 events are
  asynchronous and duplicate; D26 policy is current; D27 requires expected-head
  CAS. Inviter-as-owner and provider-driven recovery are therefore fragile.
- **Decision effect:** Requires current responsibility/authorization,
  idempotent source episode, typed zero/unknown states, and one CAS winner.
- **Best permanent fix:** Resolve every view/action from current authoritative
  heads and make presentation lag independent from source safety.
- **Exact decision/spec language:** “Inviter status, provider order, item
  projection, route cache, and worker completion SHALL NOT be preconditions for
  source truth, current access denial, or deterministic D28 recovery.”

### 3. Technical debt

**Material concern: Yes.**

- **What could go wrong:** Teams could add a `needs_next_reviewer` boolean,
  mutable assignee, JSON recipient list, CMS field, generic task, or separate
  recovery queue for each source.
- **Why it matters:** Copied state and dual writers drift across sources,
  permissions, migrations, and notification behavior.
- **Severity:** High.
- **Likelihood:** High because current runtime lacks the accepted D19/D27
  primitives and contains tempting generic task structures.
- **Evidence or reasoning:** ADR-0027 says items are projections; ADR-0182
  already owns the lane; D17 rejects generic Mission Control task authority.
- **Decision effect:** D28 specializes existing lane/source/Phase 17 contracts
  and adds no new general aggregate.
- **Best permanent fix:** Use immutable source revisions/heads/receipts and one
  registered Phase 17 key after D29 closes its resolver.
- **Exact decision/spec language:** “D28 SHALL NOT persist authoritative state
  in Payload, provider metadata, generic tasks, notification items, saved
  contacts, mutable tenant rows, or free-form workflow JSON.”

### 4. Edge cases

**Material concern: Yes.**

- **What could go wrong:** Decline may race expiry, review completion, policy
  change, candidate supersession, Site retirement, another manager, read state,
  recipient access loss, or provider retry; repeated invitations may create
  duplicate items or old-link resurrection.
- **Why it matters:** These are realistic events that can expose stale content,
  notify the wrong people, or create contradictory review lanes.
- **Severity:** Critical.
- **Likelihood:** High.
- **Evidence or reasoning:** D25/D27 list these independently delivered events;
  distributed callbacks and browser retries are duplicated/out of order by
  design.
- **Decision effect:** Adds an explicit lifecycle/race table, immutable terminal
  reasons, same-episode replay, fresh successors, and typed loser results.
- **Best permanent fix:** Exercise every pairwise race at public command seams,
  with expected heads and server time selecting one result.
- **Exact decision/spec language:** “Every D28 event and command SHALL compare
  current candidate, review epoch, lane, external path, policy, source, route,
  and authorization generations; stale losers SHALL create no side effect.”

### 5. Footguns

**Material concern: Yes.**

- **What could go wrong:** **Keep current version**, **Done**, **Resolve**,
  auto-save radio choices, or a generic **Assign** button could silently hide
  work, cancel a Plan, revive access, or make staff think public content changed.
- **Why it matters:** Staff should not need domain knowledge to distinguish
  waiting, cancellation, baseline restoration, and lane choice.
- **Severity:** High.
- **Likelihood:** High if generic task/settings language is reused.
- **Evidence or reasoning:** D17 has exact Cancel semantics; D19 prohibits
  dismiss/archive; W3C requires predictable input behavior; current Live is
  already preserved without a command.
- **Decision effect:** Rejects ambiguous controls and requires consequence-led
  actions with explicit final confirmation.
- **Best permanent fix:** Use **Choose another external reviewer**, **Invite
  Eli again**, **Return to internal review**, and separately **Cancel planned
  change**.
- **Exact decision/spec language:** “No D28 control named **Keep current**,
  **Done**, **Dismiss**, **Resolve**, **Ignore**, or **Assign to me** may end the
  episode or choose a lane.”

### 6. Tenant safety

**Material concern: Yes.**

- **What could go wrong:** A forged item, cache key, saved contact, route,
  worker, service role, or reassignment command could attach another Tenant's
  Party, Site, candidate, route, or terminal event.
- **Why it matters:** D28 handles unpublished protected content and reviewer
  identity; cross-scope leakage is a tenant incident.
- **Severity:** Critical.
- **Likelihood:** Medium without structural scoping and privileged-path parity.
- **Evidence or reasoning:** Platform rules require tenant enforcement below
  UI; current generic task/service paths are not proof of exact Party/source
  scope.
- **Decision effect:** Makes composite same-scope constraints, trusted context,
  cache partitioning, and poison tests mandatory.
- **Best permanent fix:** Repeat Tenant/environment/Site/candidate/episode scope
  in keys/FKs and derive every actor/recipient/reference server-side.
- **Exact decision/spec language:** “Every D28 record, reference, query, cache,
  realtime event, export, repair, and command SHALL prove identical Tenant,
  environment, Site, candidate, review epoch, and relevant Party scope.”

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

- **What could go wrong:** Direct CRUD, caller-supplied actor/recipient/reason,
  mutable scope, weak foreign keys, missing **WITH CHECK**, permissive
  security-definer functions, or service-role bypass could choose a lane or
  expose detail without proof.
- **Why it matters:** UI hiding and item possession cannot protect source
  authority or private candidate/reviewer facts.
- **Severity:** Critical.
- **Likelihood:** High if built as ordinary table forms.
- **Evidence or reasoning:** Phase 12 requires a sole PDP and capability checks;
  Supabase/Postgres security depends on grants, RLS `USING` and `WITH CHECK`,
  same-scope constraints, and privileged-path discipline.
- **Decision effect:** Prohibits browser writes and requires server commands,
  immutable revisions, force RLS, least grants, and operation-specific reads.
- **Best permanent fix:** Derive scope/actor/responsibility/authorization from
  trusted context, use head CAS and semantic idempotency, and test every
  privileged path against RLS-equivalent invariants.
- **Exact decision/spec language:** “D28 source/lane/recipient/end writes SHALL
  be unavailable to browser roles; server commands SHALL derive trusted scope,
  actor, D29 responsibility, authorization, heads, and audit, while `USING` and
  `WITH CHECK` reject every scope or lifecycle mutation.”

### 8. Overengineering

**Material concern: Yes.**

- **What could go wrong:** Core could import fallback builders, backup
  reviewers, escalation timers, schedules, SLAs, reminders, claims, reviewer
  scores, workflow stages, custom responses, or a task marketplace.
- **Why it matters:** Small ministries receive a harder product and Core gains
  duplicate policy/notification ownership for a narrow exception.
- **Severity:** High.
- **Likelihood:** Medium because comparable products expose these features.
- **Evidence or reasoning:** Blackbaud, Contentful, HubSpot, and Power Automate
  demonstrate those broader products; D18/D19/D25 explicitly reject dates,
  reminders, standing portals, and generic workflows.
- **Decision effect:** Limits D28 to one episode, current lawful actions, and
  existing D19/D21/D25/D27 primitives.
- **Best permanent fix:** Require a separate founder/domain decision before any
  new lane, recipient meaning, channel, or automation.
- **Exact decision/spec language:** “D28 SHALL NOT create a generic task,
  workflow, fallback policy, backup list, queue, timer, reminder, escalation,
  SLA, score, presence, or external portal.”

### 9. UX/UI and user friction

**Material concern: Yes.**

- **What could go wrong:** Staff may see too many actions, an unexplained
  disabled return, unclear current Live behavior, technical status, wrong
  action emphasis after decline versus expiry, or an item that vanishes when
  read.
- **Why it matters:** Confusion can strand protected work, trigger unintended
  disclosure, or make staff distrust the review model.
- **Severity:** High.
- **Likelihood:** High without event-specific hierarchy and user testing.
- **Evidence or reasoning:** D25 already distinguishes decline from expiry;
  D19 requires unread/active separation; Base Maia rules require complete
  responsive/error/accessibility states; external products show context-first
  status but not Core wording.
- **Decision effect:** Requires one privacy-safe preview, exact unchanged-public
  copy, event-specific primary action, progressive disclosure, and persistent
  actionability.
- **Best permanent fix:** Use the complete staff journey in this report and
  validate comprehension/task success with small and multi-Site ministries.
- **Exact decision/spec language:** “The D28 UI SHALL show one current state,
  the unchanged Live consequence, one event-appropriate primary action, current
  lawful alternatives, and why the item remains after read; unavailable paths
  SHALL have text recovery rather than unexplained disabled controls.”

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

- **What could go wrong:** Invitation state, provider status, notification
  state, route membership, saved contact, or task completion could become a
  second authority for lane, applicability, recipient, or source result.
- **Why it matters:** Circular ownership makes failures impossible to repair
  and can infer review/public effect from presentation.
- **Severity:** Critical.
- **Likelihood:** High without an explicit ownership matrix.
- **Evidence or reasoning:** ADR-0027, ADR-0181, ADR-0182, and D17–D27 each
  separate source, lane, invitation, route, item, engagement, and public effect.
- **Decision effect:** Keeps source/lane facts authoritative and makes all
  presentation/reference data derived.
- **Best permanent fix:** Enforce one-way references and command boundaries;
  never let a read model write back business truth.
- **Exact decision/spec language:** “The consequence-owning source SHALL own
  D28 applicability/end and the D27 lane; D29 SHALL own explicit recovery
  responsibility; Phase 17 SHALL own only recipient presentation/engagement;
  none may infer or mutate another owner's truth.”

### 11. Hidden coupling

**Material concern: Yes.**

- **What could go wrong:** D28 could depend on email provider uptime, original
  inviter employment, D21 reviewer membership, CMS schemas, generic task
  tables, contact email, or one source's internal model.
- **Why it matters:** Changing a provider, source adapter, staff route, or CMS
  could silently break recovery or authorization.
- **Severity:** High.
- **Likelihood:** Medium to high.
- **Evidence or reasoning:** D25 provider and invitation facts are distinct;
  D21 route is attention-only; D17 requires typed source adapters;
  ADR-0029 requires references rather than copies.
- **Decision effect:** Requires stable source contracts and identifiers while
  rejecting provider/task/CMS/inviter dependencies.
- **Best permanent fix:** Define a closed source adapter with reason,
  applicability, safe facts, action codes, D29 resolver, and end; integrate by
  opaque stable references.
- **Exact decision/spec language:** “D28 SHALL remain functional and safe when
  provider delivery, original inviter, CMS internals, task services, and prior
  route members change; adapters SHALL expose only the registered stable
  contract.”

### 12. Failure modes

**Material concern: Yes.**

- **What could go wrong:** Source terminal commit may succeed while item
  projection fails; a new invitation may commit while provider send fails;
  internal return may commit while successor item fan-out lags; a response may
  be lost; or impact/read queries may fail.
- **Why it matters:** Staff can see stale or ambiguous status and operators may
  be tempted to roll back safe authority or create duplicate work.
- **Severity:** Critical for authority; High for presentation.
- **Likelihood:** High in any distributed deployment.
- **Evidence or reasoning:** D19/D20 require source/projection independence;
  D25/D27 use outbox/reconciliation and prohibit provider calls under locks.
- **Decision effect:** Separates authoritative commit from replayable
  presentation/delivery and defines truthful partial-success copy.
- **Best permanent fix:** Durable receipts/outboxes, same-identity replay,
  request-time current checks, source discoverability, and no force-release or
  rollback-to-old-authority shortcut.
- **Exact decision/spec language:** “Authoritative D28 and successor commands
  SHALL commit independently from provider and presentation effects; failures
  SHALL preserve the safe current lane, expose truthful status, and reconcile
  with the same semantic identity.”

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

- **What could go wrong:** Duplicate/late events, server/client clock
  disagreement, simultaneous managers, expiry/completion at the boundary,
  policy/candidate changes, or same-key changed meaning could create two lanes
  or accept a stale review.
- **Why it matters:** One duplicate favorable or stale transition can expose
  data or change public behavior without valid review.
- **Severity:** Critical.
- **Likelihood:** High without formal transitions.
- **Evidence or reasoning:** D25 uses exact expiry and current-context checks;
  D27 uses one lane CAS; PostgreSQL transaction semantics and durable
  idempotency are required for a single business effect.
- **Decision effect:** Freezes the lifecycle table, server-time boundary,
  expected heads, semantic idempotency, and loser behavior.
- **Best permanent fix:** One documented lock order and transaction per
  authoritative transition; external work after commit; pairwise concurrency
  tests.
- **Exact decision/spec language:** “Decline, expiry, fresh handoff, internal
  return, review completion, candidate/source change, and Plan terminality
  SHALL serialize through current heads and semantic idempotency; exactly one
  effect wins and clocks/age never choose a lane.”

### 14. Data integrity risks

**Material concern: Yes.**

- **What could go wrong:** Duplicate episodes/items, orphaned terminal
  invitations, mismatched route snapshots, broken predecessor/successor links,
  mutable reasons, restored authority, or deleted history can corrupt current
  responsibility and audit.
- **Why it matters:** Staff cannot tell who owns review or recover safely, and
  historical approvals become untrustworthy.
- **Severity:** Critical.
- **Likelihood:** Medium to high without constraints/reconciliation.
- **Evidence or reasoning:** D19/D21 require permanent occurrence and successor
  identities; D25/D27 require terminal monotonicity and no revival.
- **Decision effect:** Requires normalized immutable records, unique current
  heads/slots/items, restrictive deletes, same-scope FKs, and reconciliation.
- **Best permanent fix:** Enforce invariants structurally, monitor zero-tolerance
  violations, and repair from authoritative receipts rather than mutable rows.
- **Exact decision/spec language:** “D28 episodes, lane revisions, terminal
  external paths, routing occurrences, items, engagements, and command receipts
  SHALL be immutable/normalized with unique current identities, causal links,
  and restrictive deletion; old authority and engagement SHALL never revive.”

### 15. Security and privacy risks

**Material concern: Yes.**

- **What could go wrong:** Notification previews, logs, analytics, realtime,
  contact search, exports, support, or terminal pages could expose reviewer
  identity, private candidate facts, internal route members, security reasons,
  or cross-Tenant existence.
- **Why it matters:** External reviewer identity and protected unpublished
  content are private; even existence/timing may harm sensitive ministry work.
- **Severity:** Critical.
- **Likelihood:** Medium without explicit allowlists and negative tests.
- **Evidence or reasoning:** D19 has a narrow fact adapter; D25 prohibits
  secrets/PII in URLs/logs/previews and requires uniform terminal responses;
  platform privacy is fail-closed.
- **Decision effect:** Adds role-safe preview/detail, data minimization,
  retention separation, no third-party telemetry, and external terminal
  non-enumeration.
- **Best permanent fix:** Closed projection DTOs, purpose-specific reads,
  body-free telemetry/audit, no-store protected responses, and privacy poison
  tests across every egress.
- **Exact decision/spec language:** “D28 list/detail/external projections SHALL
  be purpose- and role-specific; reviewer identity, contact data, candidate
  body, participant/route facts, credentials, and protected source data SHALL
  be absent from unauthorized views, logs, metrics, caches, exports, and public
  surfaces.”

### 16. Scalability and performance risks

**Material concern: Yes.**

- **What could go wrong:** Recipient resolution could scan every capability
  holder, route, Site, candidate, or old invitation; per-row authorization
  could cause N+1 queries; expiry/reconciliation could produce storms; large
  tenants could receive noisy fan-out.
- **Why it matters:** Slow recovery and feeds cause retries, stale UI, database
  load, and operational temptation to weaken proof or truncate audiences.
- **Severity:** High.
- **Likelihood:** Medium at scale.
- **Evidence or reasoning:** D19 requires bounded complete resolution and
  keyset feeds; D22 caps internal co-responsibility at three; database rules
  require supporting indexes and bounded transactions. D29 has not yet chosen
  D28 cardinality.
- **Decision effect:** Blocks Live until D29 sets a bounded route and production
  tests establish budgets; prohibits global scans and partial fan-out.
- **Best permanent fix:** Indexed reverse lookups, batched authorization,
  bounded complete resolver, keyset pagination, partitioned cache/realtime,
  idempotent batched reconciliation, and production-shaped load proof.
- **Exact decision/spec language:** “D28 resolution SHALL use one bounded D29
  responsibility route, indexed current/reverse lookups, batched authorization,
  complete all-before-any release, and keyset presentation; no global
  capability/Site/candidate scan or silent truncation is permitted.”

### 17. Operational burden

**Material concern: Yes.**

- **What could go wrong:** Missing recipients, stuck occurrences, provider
  contradictions, stale items, route unknowns, or repeated expiry could require
  direct SQL, manual emails, support impersonation, or tribal cleanup.
- **Why it matters:** Operational bypass undermines privacy/authority and makes
  the feature expensive to sustain.
- **Severity:** High.
- **Likelihood:** Medium without self-diagnosing state and runbooks.
- **Evidence or reasoning:** D19/D21 require safe zero/unknown/reconciliation;
  D25 makes provider state non-authoritative; current generic task cleanup is
  not valid D28 repair.
- **Decision effect:** Requires safe in-product recovery, durable replay,
  monitors/runbooks, and explicit no-bypass support posture.
- **Best permanent fix:** Provide source status, retry/reconcile same identity,
  route setup links, fresh invitation/return actions, and receipt-based repair.
- **Exact decision/spec language:** “D28 SHALL be diagnosable and recoverable
  without direct database mutation, manual external messaging, recipient
  guessing, support impersonation, credential revival, or force-completion.”

### 18. Observability and auditability gaps

**Material concern: Yes.**

- **What could go wrong:** Logs may conflate decline, expiry, read, recipient
  resolution, lane choice, invitation creation, delivery, review, and public
  outcome; staff/support may not know why an item appeared/disappeared.
- **Why it matters:** Diagnosis, incident response, history, and user trust fail
  without distinct evidence, while over-logging can leak protected content.
- **Severity:** High.
- **Likelihood:** High without a designed evidence model.
- **Evidence or reasoning:** ADR-0027 separates business history, security
  audit, technical telemetry, and personal engagement; D25/D27 separate each
  lifecycle fact.
- **Decision effect:** Requires linked but independent body-free evidence and
  named signals, not one mutable activity log.
- **Best permanent fix:** Record opaque correlation IDs, source/transition/
  resolver/policy versions, actor/Party references, heads, outcomes, and
  reconciliation status under each owner; minimize user-facing history.
- **Exact decision/spec language:** “D28 source history, lane history,
  invitation/access history, personal engagement, security audit, and technical
  telemetry SHALL remain distinct and causally linked; no log or item SHALL
  substitute for durable business evidence.”

### 19. Dependency and integration risks

**Material concern: Yes.**

- **What could go wrong:** Email API changes, provider outages/rate limits,
  Phase 17 not being Live, source adapter drift, CMS schema changes, or identity
  provider changes could alter recovery meaning or strand work.
- **Why it matters:** D28 must remain safe across third-party and internal
  upgrades and cannot depend on an unimplemented platform as if shipped.
- **Severity:** High.
- **Likelihood:** Medium to high.
- **Evidence or reasoning:** Current runtime lacks D19/D25–D28; external
  providers own only delivery/identity observations; sources own their
  candidate/effect contracts.
- **Decision effect:** Makes D19/D21–D27/D29 and source adapters blocking
  dependencies; providers remain replaceable effects.
- **Best permanent fix:** Version every adapter/manifest/DTO, fail unknown
  compatibility closed, use durable outbox, and keep source recovery visible
  during provider outage.
- **Exact decision/spec language:** “D28 SHALL remain Reserved until its source,
  D19/Phase 17, D21–D27, and D29 contracts are Live-compatible; provider or CMS
  changes SHALL NOT select recipients, choose a lane, revive access, or change
  source end.”

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

- **What could go wrong:** Backfilling old expired invitations could flood
  unread items; mixed versions could create D28 without a resolver/end, old
  code could ignore the lane, rollback could revive grants, or partial source
  rollout could behave inconsistently.
- **Why it matters:** Migration can expose stale private work and violate the
  one-lane/no-revival invariant across tenants.
- **Severity:** Critical.
- **Likelihood:** Medium without staged compatibility.
- **Evidence or reasoning:** D19 prohibits historical unread backfill;
  ADR-0182 requires lane fences; D25/D26 require current terminal/policy checks;
  D29 is unresolved.
- **Decision effect:** Requires future-only activation, capability/key
  compatibility gates, source-by-source deny-by-default rollout, kill switches,
  and roll-forward repair.
- **Best permanent fix:** Deploy readers/denials/constraints first, then source
  producers/resolver/presentation, activate only complete adapters, and retain
  denial readers through rollback.
- **Exact decision/spec language:** “Migration SHALL infer no D28 episode or
  unread engagement from historical invitations/tasks; mixed-version or
  unsupported sources SHALL fail closed, and rollback SHALL preserve current
  lane/policy/terminal denial with no resurrection.”

### 21. Testability, traceability, and proof

**Material concern: Yes.**

- **What could go wrong:** Tests may cover only component rendering or happy
  paths, terminology may diverge across Grill/ADR/glossary/OpenSpec/design,
  and authorization/race/accessibility failures may remain unproved.
- **Why it matters:** A plausible UI is not evidence that source, Tenant,
  lifecycle, and privacy invariants hold in production.
- **Severity:** Critical.
- **Likelihood:** High without explicit acceptance and trace matrices.
- **Evidence or reasoning:** Repository rules require OpenSpec and public-seam
  proof; current runtime is absent; user required positive, negative, boundary,
  authorization, concurrency, migration, accessibility, and production-shaped
  tests.
- **Decision effect:** Adds 120 falsifiable acceptance criteria and blocks the
  key until D29, source contracts, tests, and release evidence agree.
- **Best permanent fix:** Trace D28-R/AC IDs through glossary, ADR-0182,
  OpenSpec, design, tasks, tests, monitors, rollout, and release proof; test
  user-visible/domain outcomes rather than internals alone.
- **Exact decision/spec language:** “D28 SHALL NOT activate until every
  requirement is traceable and independent release evidence proves positive,
  negative, boundary, Tenant, authorization, race, migration, accessibility,
  weak-network, rollback, and production-shaped outcomes.”

### 22. Other development hazards

**Material concern: Yes.**

- **What could go wrong:** Staff may confuse the D28 recovery item with the
  D21 reviewer route, D25 external contact, D17 source-owner work, or D20 review
  reason; D29 could silently choose every capable person; **Request changes**
  could be forced into the wrong recovery path; documentation/gates could be
  run piecemeal during the Grill and obscure unresolved decisions.
- **Why it matters:** Terminology and dependency mistakes create hidden
  authority, notification noise, and premature implementation debt.
- **Severity:** High.
- **Likelihood:** High while D29 and later feedback semantics remain open.
- **Evidence or reasoning:** Permission is not responsibility throughout
  D21/D27; D25 makes request-changes a distinct outcome; the user directed
  broad verification to the end of the Grill session.
- **Decision effect:** Keeps the D28 key Reserved, names a glossary concept,
  routes D29 next, and preserves Request-changes feedback for a later question.
- **Best permanent fix:** Record dependency order, terminology, non-goals, and
  unresolved questions explicitly; do not implement or activate partial
  semantics.
- **Exact decision/spec language:** “The **Candidate review reassignment
  episode** SHALL remain a distinct source condition; the D28 key SHALL remain
  Reserved until D29 fixes responsibility/resolver/cardinality, and
  **Request changes** SHALL remain a separately specified source outcome.”

## Acceptance criteria

These criteria are falsifiable outcomes for later OpenSpec, design,
implementation, tests, and release evidence. They do not claim current runtime
support.

### Applicability, episode identity, and source ownership

1. **D28-AC001 — Decline applicability.** A proved decline without review for
   the current exact external path opens D28 only while the exact candidate and
   review obligation remain current.
2. **D28-AC002 — Expiry applicability.** Authoritative server-time expiry
   without review opens D28 only while the candidate still requires review.
3. **D28-AC003 — Delivery failure excluded.** A delivery failure retains the
   D27 external lane and never opens D28.
4. **D28-AC004 — Request changes excluded.** A valid **Request changes** result
   follows its source outcome and never masquerades as decline/expiry.
5. **D28-AC005 — Policy/security loss excluded.** Policy/security revocation
   follows D26/D27 even when D28 presentation later helps recovery; it is not
   relabelled decline/expiry.
6. **D28-AC006 — Candidate terminal excluded.** Completed, superseded,
   cancelled, satisfied-elsewhere, or no-longer-applicable candidates create no
   D28 episode.
7. **D28-AC007 — One episode slot.** One exact terminal external path occupies
   at most one permanent D28 semantic occurrence slot.
8. **D28-AC008 — Duplicate replay.** Duplicate decline/expiry callbacks,
   sweeps, rebuilds, and retries return the same episode identity and create no
   peer.
9. **D28-AC009 — Terminal reason stable.** Decline followed by late expiry does
   not rewrite the first compatible terminal reason or create another item.
10. **D28-AC010 — Source owner only.** Provider, invitation UI, item, read
    state, route, task, cache, and worker cannot open/end D28 source truth.
11. **D28-AC011 — Exact scope.** Episode identity binds Tenant, environment,
    Site, source, candidate, review epoch, prior external path, and closed
    reason.
12. **D28-AC012 — Live consequence.** Opening D28 changes no public Site,
    locale, Page, Navigation, Giving, finance, or accounting fact.

### Responsibility, recipient resolution, and personal attention

13. **D28-AC013 — D29 dependency.** No D28 Phase 17 key activates before D29
    defines an explicit responsibility route, recipient role, cardinality,
    inheritance/fallback, resolver, and proof pack.
14. **D28-AC014 — Responsibility necessary.** Current next-lane capability
    without D29 responsibility yields no D28 personal item.
15. **D28-AC015 — Authorization necessary.** D29 responsibility without
    current exact view/next-lane authorization yields no actionable item.
16. **D28-AC016 — Inviter insufficient.** Original invitation authorship alone
    never selects a D28 recipient.
17. **D28-AC017 — Prior reviewer insufficient.** Prior internal/external review
    identity alone never selects a D28 recipient.
18. **D28-AC018 — Admin insufficient.** Broad admin/super-admin label alone
    never selects or authorizes a D28 recipient/action.
19. **D28-AC019 — Complete resolver.** Recipient resolution releases all
    proved current canonical members or none; it never truncates or partially
    releases.
20. **D28-AC020 — Released zero.** Complete zero-member resolution releases a
    zero-member occurrence and no guessed item while the source page remains
    discoverable.
21. **D28-AC021 — Unknown not zero.** Timeout, partial, stale, contradictory,
    overflow, or incompatible resolver output releases no partial members and
    is never treated as zero.
22. **D28-AC022 — One personal item.** One occurrence+Party+role+surface creates
    at most one active D28 item.
23. **D28-AC023 — Independent engagement.** Two recipients receive distinct
    item/engagement records; one read never affects the other.
24. **D28-AC024 — Recipient access loss.** Access loss removes current/recent
    private presentation immediately without ending the source episode or
    reviving it on later access gain.

### Read, unread, persistence, and source end

25. **D28-AC025 — Open marks only read.** Deliberate open/mark-read changes
    only that recipient's unread engagement after server confirmation.
26. **D28-AC026 — Read remains active.** A read D28 item remains in **Needs
    attention** while the source episode is actionable.
27. **D28-AC027 — No fabricated read.** Source end before first view creates no
    unread debt and no fabricated read timestamp.
28. **D28-AC028 — No dismiss.** UI/API/RLS/RPC/support/import/worker paths expose
    no active dismiss/archive/hide/resolve/snooze operation.
29. **D28-AC029 — No age authority.** Item/source age changes no status,
    urgency, recipient, lane, or source end.
30. **D28-AC030 — Fresh external ends.** A successful fresh D25/D27 handoff
    ends D28 once and creates no fabricated engagement.
31. **D28-AC031 — Internal return ends.** A successful D21/D27 internal return
    ends D28 once and creates one permitted successor occurrence.
32. **D28-AC032 — Plan terminal ends.** D17/source terminality ends D28
    idempotently and does not delete independent source history.
33. **D28-AC033 — Item projection cannot end.** Item cleanup/purge/reconcile
    never sets the source-end fact.
34. **D28-AC034 — End monotonic.** Presentation end is once-set from trusted
    source truth and cannot move later or clear.
35. **D28-AC035 — No old revival.** Later responsibility/access/policy gain
    never revives an ended D28 item or old engagement.
36. **D28-AC036 — Later genuine episode.** A newly chosen external path that
    later declines/expires creates a fresh source episode/item only after the
    prior D28 episode ended.

### Decline-specific UX and action hierarchy

37. **D28-AC037 — Safe list label.** Decline list preview uses **External review
    needs a next step** and does not expose the reviewer identity.
38. **D28-AC038 — Authorized decline detail.** Only an authorized detail viewer
    may see the safe reviewer identity and **declined** reason.
39. **D28-AC039 — Decline primary action.** When current external proof permits,
    **Choose another external reviewer** is the primary decline action.
40. **D28-AC040 — No recommended reinvite after decline.** **Invite Eli again**
    is not the default/primary decline action.
41. **D28-AC041 — Same person still deliberate.** Selecting the declined person
    later requires the ordinary fresh picker, preview, and confirmation.
42. **D28-AC042 — Internal alternative current.** **Return to internal review**
    appears only after current eligibility/route/action authorization proof.
43. **D28-AC043 — Decline unchanged copy.** The detail names exact current Live
    locale/serving consequence and says the Plan is private and Giving
    unchanged.
44. **D28-AC044 — Decline no reason.** D28 does not fabricate or require a
    decline reason; it records only the source-owned closed outcome.
45. **D28-AC045 — Decline terminal access.** Every protected read/action using
    the declined path fails immediately and cannot be restored by D28.
46. **D28-AC046 — External decline terminal page.** The external reviewer sees
    a uniform safe terminal page with no internal recipient/next-lane detail.
47. **D28-AC047 — Current policy narrows actions.** If external review becomes
    unavailable after decline, external successor actions disappear/reject and
    internal/setup guidance remains truthful.
48. **D28-AC048 — Decline source change.** Candidate/source changes while the
    decline card is open make every stale action fail to current truth.

### Expiry, fresh reinvite, and saved contacts

49. **D28-AC049 — Absolute expiry display.** Authorized detail shows an
    absolute localized date, time, and zone, not relative-only age.
50. **D28-AC050 — Expiry primary action.** **Invite Eli again** is primary only
    when Eli remains admissible under complete current proof.
51. **D28-AC051 — Fresh identity.** Reinvite creates a new invitation/grant/
    context/lane identity and never extends or reopens the expired one.
52. **D28-AC052 — Fresh expiry.** Reinvite derives a new source-permitted expiry
    under current policy; viewing/resend/history cannot copy old authority.
53. **D28-AC053 — Fresh candidate proof.** Reinvite re-proves candidate,
    dependencies, source admission, participant set, stable human, assurance,
    projection, and current heads.
54. **D28-AC054 — Saved contact non-authority.** Selecting Eli from saved
    contacts only prefills the fresh invitation and grants no access or
    eligibility.
55. **D28-AC055 — Eli now inadmissible.** If identity, policy, participation,
    qualification, or source proof disqualifies Eli, **Invite Eli again** is
    absent/rejected with safe recovery.
56. **D28-AC056 — Choose another available.** When current external proof
    permits, **Choose another external reviewer** remains available after
    expiry.
57. **D28-AC057 — Old link inert.** Old email/link/session remains unusable
    after fresh invitation and reveals no successor existence.
58. **D28-AC058 — Fresh handoff atomic.** Fresh invite commit atomically creates
    D25 invitation/external lane/receipt/outbox and ends D28, or changes
    nothing.
59. **D28-AC059 — Dispatch failure separate.** Provider failure after fresh
    local commit follows D27 delivery recovery and does not reopen D28.
60. **D28-AC060 — Expiry terminal page.** External expiry page exposes no
    internal reviewer, next choice, policy, staff identity, or private history.

### Internal return, route states, and eligibility

61. **D28-AC061 — Current route only.** Internal return resolves current
    D21/D22 route truth, never the pre-handoff snapshot.
62. **D28-AC062 — No self-assignment.** The return command does not assign the
    pressing actor merely because they invoked it.
63. **D28-AC063 — Current released recipients.** A complete current route with
    qualified recipients creates one successor occurrence and fresh personal
    items for exactly that released set.
64. **D28-AC064 — Role-safe route preview.** Authorized viewers see permitted
    names; other authorized actors see only safe route label/count.
65. **D28-AC065 — Released-zero return.** Proved eligible internal humans plus
    a released-zero route may return internally with explicit **no one will be
    notified** copy.
66. **D28-AC066 — Released-zero discoverability.** Zero-member internal return
    leaves source review discoverable to independently authorized internal
    people and guesses no item.
67. **D28-AC067 — Eligibility zero.** Complete zero eligible internal humans
    removes/rejects internal return and explains that another eligible human is
    required.
68. **D28-AC068 — Route membership not eligibility.** A configured responsible
    person who is not independently eligible receives no review authority/item.
69. **D28-AC069 — Eligibility not responsibility.** An eligible internal human
    outside the current route is not silently notified by return.
70. **D28-AC070 — Unknown blocks return.** Indeterminate eligibility or route
    creates no internal lane/successor and leaves D28 actionable.
71. **D28-AC071 — Stale route preview.** Route/capability change after preview
    makes the return command re-resolve or reject; stale names are never used.
72. **D28-AC072 — Return transaction.** Internal return and D28 source end are
    one authoritative transition with a durable successor obligation and no
    provider network call.

### D26/source posture and lawful action derivation

73. **D28-AC073 — Prohibited posture.** Effective
    `external_review_prohibited` exposes no
    external successor action.
74. **D28-AC074 — Recovery-only eligible internal.** Recovery-only with one
    proved eligible internal human exposes no external successor action.
75. **D28-AC075 — Recovery-only zero internal.** Recovery-only permits a fresh
    external action only after complete current zero-eligible-internal proof.
76. **D28-AC076 — Optional posture.** `source_permitted_choice` still requires
    every source/D23/D24/D25 proof and never preselects a person.
77. **D28-AC077 — Source denial wins.** One applicable source prohibition or
    incomplete safe projection removes/rejects the external action.
78. **D28-AC078 — Unknown posture.** Unknown, stale, contradictory, or
    incompatible effective posture yields no favorable external action.
79. **D28-AC079 — Widening no resurrection.** Later policy widening never
    restores an old invitation/grant/context/session/item.
80. **D28-AC080 — Widening no automatic choice.** Widening sends no invitation,
    selects no person, and changes no current D28 lane without a deliberate
    command.
81. **D28-AC081 — Narrowing current ceiling.** Every fresh action rechecks the
    current policy/source heads even if the UI previously rendered it.
82. **D28-AC082 — Safe policy explanation.** Viewers without configuration
    visibility receive a general lawful explanation and no hidden policy/source
    identity.
83. **D28-AC083 — Site strictness.** A Site posture can narrow but never widen
    the Tenant/platform/source ceiling through UI, API, RLS, service role, or
    import.
84. **D28-AC084 — No policy side effect.** Changing policy never marks D28 read,
    resolved, reviewed, or public; only current lawful actions change.

### Keep-current rejection and separate source actions

85. **D28-AC085 — No Keep-current resolution.** **Keep current version** cannot
    end, hide, read, snooze, or archive D28.
86. **D28-AC086 — Waiting is no action.** Doing nothing leaves current Live
    unchanged and D28 active with no due date/reminder.
87. **D28-AC087 — Cancel exact label.** Abandoning the Plan uses **Cancel
    planned change**, never **Keep current**.
88. **D28-AC088 — Cancel authorization.** Cancel appears/commits only with the
    exact current D17 capability and source/Plan heads.
89. **D28-AC089 — Cancel consequence preview.** Confirmation names current
    default/serving state, Plan termination, D28 end, and independent source
    work/history preservation.
90. **D28-AC090 — Baseline exact label.** Any compatible baseline restoration
    names the exact source-proved target and uses its source-owned command.
91. **D28-AC091 — Request changes distinct.** External **Request changes** never
    creates D28 and remains a source outcome pending later feedback semantics.
92. **D28-AC092 — Review completion distinct.** Favorable external review ends
    the source episode/old path and never opens D28.
93. **D28-AC093 — Decline not cancellation.** External decline does not cancel
    the private Plan or independent source work.
94. **D28-AC094 — Expiry not cancellation.** Expiry does not cancel the Plan,
    mutate candidate content, or restore a baseline.
95. **D28-AC095 — No generic completion.** Item completion/task status cannot
    invoke D17 cancel, D21 return, D25 invite, review, or public effect.
96. **D28-AC096 — Public/Giving invariance.** Every D28 action and failure
    matrix proves no Giving, Legal Entity, Stripe, bank, settlement, currency,
    contribution, receipt, ledger, accounting, or public effect by itself.

### Concurrency, idempotency, failure, and repair

97. **D28-AC097 — Decline/expiry race.** Exactly one compatible source terminal
    transition wins; the loser replays current truth.
98. **D28-AC098 — Expiry/review race.** Server time and current heads choose one
    result; no stale favorable review is accepted after expiry wins.
99. **D28-AC099 — Two-manager race.** Competing external/internal/cancel
    commands have one current-head winner; loser creates no side effect.
100.  **D28-AC100 — Candidate-change race.** Candidate/source change makes stale
      D28 actions reject with current safe outcome.
101.  **D28-AC101 — Policy-change race.** Policy transition and next-lane command
      serialize/recheck so no action exceeds the winning current ceiling.
102.  **D28-AC102 — Same-key replay.** Same semantic command/key/meaning returns
      one receipt/result after response loss.
103.  **D28-AC103 — Changed-meaning conflict.** Reusing a semantic key for a
      different reviewer/lane/candidate/result hard-conflicts and writes nothing.
104.  **D28-AC104 — Projection failure safety.** Source D28 remains discoverable
      and authoritative if occurrence/item projection fails.
105.  **D28-AC105 — Successor projection lag.** Successful lane choice is not
      rolled back if successor item/provider projection lags; request-time heads
      enforce current safety.
106.  **D28-AC106 — Unreleased occurrence.** Partial/unreleased occurrence rows
      are not claimable and reconcile under the same occurrence identity.
107.  **D28-AC107 — No force release.** Operators cannot force-release a partial
      member set or guess recipients to clear lag.
108.  **D28-AC108 — Restore/replay denial.** Backup restore, rollback, import,
      replay, or old worker cannot revive terminal paths/items/engagement or
      create historical unread work.

### Tenant isolation, privacy, accessibility, and resilience

109. **D28-AC109 — Cross-Tenant poison.** Forged Tenant/environment/Site/
     candidate/Party/route/contact/item/cache references are denied across
     browser, RPC, service-role, worker, realtime, export, and support paths.
110. **D28-AC110 — Preview minimization.** List preview contains no external
     reviewer identity/email, candidate body, internal route names, hidden
     source detail, token, or protected operational/financial fact.
111. **D28-AC111 — Role-safe detail.** Detail identity/reason/contact/history
     fields appear only under independent purpose-specific authorization.
112. **D28-AC112 — External terminal minimization.** External terminal page
     reveals no internal reviewer, next choice, staff identity, policy, or
     successor existence and is no-store/no-tracker.
113. **D28-AC113 — Offline inertness.** Offline/cached clients queue no
     read/invite/return/cancel command and claim no success.
114. **D28-AC114 — Mobile/reflow.** Complete list/detail/picker/confirmation/
     error states work at 320 CSS pixels, 400% zoom, and without horizontal
     action overflow.
115. **D28-AC115 — Keyboard/focus.** Every action is keyboard operable; focus is
     visible/unobscured, dialog return is predictable, and source changes do
     not steal focus.
116. **D28-AC116 — Screen-reader status.** Headings, reason, unchanged Live
     consequence, action descriptions, unread/active state, errors, and updates
     are programmatic; status never relies on color/icon.
117. **D28-AC117 — RTL/long text.** RTL, CJK, Unicode names, long organization/
     locale labels, translated actions, and narrow screens wrap without losing
     distinguishing identity or consequence.
118. **D28-AC118 — Touch/reduced motion.** Important controls meet 44px policy;
     no hover-only/swipe-only action, countdown, pulse, or non-reduced motion
     communicates urgency.
119. **D28-AC119 — No channel/reminder.** D28 creates zero email, SMS, push,
     digest, browser/OS notification, sound, recurring reminder, due date,
     escalation, or hidden preference.
120. **D28-AC120 — Release and trace gate.** D28 remains Reserved until D29 and
     every source/ADR/glossary/OpenSpec/design/task/test/monitor/release artifact
     agree and production-shaped positive, negative, boundary, authorization,
     race, migration, rollback, accessibility, privacy, and weak-network proof
     passes.

## Named monitoring plan

Thresholds below are release hypotheses. Product, Security, Platform, Phase 17,
and source owners must ratify them against production-shaped tests and pilot
baselines. A monitor may alert, contain, or trigger a runbook; it may never
select a lane/recipient, send an invitation/reminder, grant/revive access,
mark an item read/resolved, publish content, or change Giving/finance.

| Signal                                                             | Threshold                                                                 | Owner                               | Required response                                                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `candidate_review_reassignment_multiple_current_episode_total`     | any                                                                       | Source owner + Security             | P0 fence D28 producers/commands; preserve current Live; repair unique heads/slots from receipts; inspect every affected scope |
| `candidate_review_reassignment_cross_scope_link_total`             | any                                                                       | Security + Data Platform            | incident; deny affected projections/actions, preserve evidence, inspect composite FKs/RLS/cache/export/repair paths           |
| `candidate_review_reassignment_capability_broadcast_total`         | any item sent solely because capability exists                            | D29 owner + Security                | disable D28 key/resolver, end improper items without fabricated read, repair responsibility intersection, inspect disclosures |
| `candidate_review_reassignment_inviter_fallback_total`             | any item sent solely because actor invited                                | D29 owner + Site Product            | disable faulty resolver, remove improper presentation, restore explicit route proof, inspect stranded episodes                |
| `candidate_review_reassignment_unauthorized_item_total`            | any                                                                       | Phase 17 + Phase 12 Security        | suppress item/feed/cache immediately, inspect recipient resolution and privileged paths, follow privacy incident policy       |
| `candidate_review_reassignment_partial_release_total`              | any                                                                       | Phase 17 Operations                 | quarantine unreleased occurrence, show source-page recovery only, repair all-before-any compiler; never force-release         |
| `candidate_review_reassignment_old_item_revival_total`             | any                                                                       | Phase 17 + Source owner             | end revived item, fence replay/migration, repair successor identity, inspect unread/privacy effects                           |
| `candidate_review_reassignment_old_external_context_revival_total` | any protected read/action                                                 | Phase 4/12 Security                 | P0 revoke context/session, stop D25/D28 affected paths, inspect restore/widen/reinvite, follow incident policy                |
| `candidate_review_reassignment_stale_command_success_total`        | any                                                                       | Source owner + Security             | P0 fence commands/public effect, inspect CAS/expected heads/policy reproof, repair affected candidate history                 |
| `candidate_review_reassignment_keep_current_resolution_total`      | any                                                                       | Site Product + Source owner         | restore actionable source state where possible, remove ambiguous control/API, inspect hidden work and Plan outcomes           |
| `candidate_review_reassignment_item_ended_without_source_total`    | any                                                                       | Phase 17 + Source owner             | restore source-derived active presentation with successor-safe semantics, repair end reducer, inspect badge debt              |
| `candidate_review_reassignment_provider_selected_lane_total`       | any                                                                       | Communications + Security           | stop integration writer, restore source head from receipt, inspect access/disclosure, enforce outbox-only provider boundary   |
| `candidate_review_reassignment_external_channel_total`             | any D28 email/SMS/push/digest/reminder                                    | Phase 17 Governance + Privacy       | disable channel/key, inspect recipients/content/consent, remove dormant path, follow incident policy where needed             |
| `candidate_review_reassignment_public_or_giving_effect_total`      | any                                                                       | Site/Giving/Finance Security        | P0 freeze affected effect path, preserve Live/financial truth, trace confused-deputy transition, repair ownership boundary    |
| `candidate_review_reassignment_source_to_occurrence_lag_seconds`   | p95 above ratified pilot SLO or any above 300 seconds                     | Phase 17 Operations                 | reconcile same source episode; retain source-page recovery; do not send fallback channel or guess recipients                  |
| `candidate_review_reassignment_occurrence_to_item_lag_seconds`     | p95 above ratified pilot SLO or any above 300 seconds                     | Phase 17 Operations                 | replay same released occurrence, inspect indexes/fan-out; source remains authoritative                                        |
| `candidate_review_reassignment_resolver_indeterminate_rate`        | above 5% in 24 hours with at least 20 attempts                            | D29 owner + Platform                | inspect route/authorization generation, timeout/overflow/indexes; release no partial audience; pause cohort growth            |
| `candidate_review_reassignment_open_age_hours`                     | p95 above pilot baseline by 2x or any above 168 hours                     | Site Product + Tenant Website owner | study discoverability/responsibility coverage; improve setup/copy; no age escalation or automatic lane choice                 |
| `candidate_review_reassignment_choice_conflict_rate`               | above 5% of next-lane attempts over 7 days, minimum 20                    | Site Product + Source owner         | inspect stale-state UX/concurrency; preserve CAS; improve refresh/impact copy without weakening authority                     |
| `candidate_review_reassignment_command_error_rate`                 | above 1% of eligible attempts for 15 minutes, minimum 20                  | Platform Operations                 | inspect source/database/authorization health; preserve D28/current Live; provide safe same-command retry                      |
| `candidate_review_reassignment_repeat_external_end_rate`           | baseline first cohort; alert at 3x trailing 28-day rate, minimum 30 paths | Site Product + UX Research          | study selection/expiry/comprehension; improve flow; never score reviewers, auto-return, or change Tenant posture              |
| `candidate_review_reassignment_support_assisted_rate`              | above 2% over 30 days with at least 50 episodes                           | Support Operations + Site Product   | code reason categories, improve self-service/route setup, repair tooling; never use impersonation/manual invite               |
| `candidate_review_reassignment_privacy_projection_violation_total` | any                                                                       | Privacy + Security                  | suppress projection/cache/export, preserve evidence, identify viewers/egress, follow incident and retention policy            |
| `candidate_review_reassignment_audit_gap_total`                    | any committed source/lane head without exact receipt/causal reference     | Source owner + Platform             | fence further writes in scope, reconstruct only from transaction evidence, repair invariant and audit parity                  |
| `candidate_review_reassignment_p99_read_ms`                        | above ratified budget for 3 consecutive 5-minute windows                  | Platform                            | inspect current/reverse indexes, batched authorization, cache partitioning; never cache favorable authority past heads        |
| `candidate_review_reassignment_p99_choice_ms`                      | above ratified budget for 3 consecutive 5-minute windows                  | Platform + Source owner             | inspect lock order/query plan/contention; retain atomicity and fail-safe status; no split transaction                         |
| `candidate_review_reassignment_staff_comprehension_rate`           | below 90% correct on owner/read/Live/action questions in moderated pilot  | Product Research + Design           | revise terminology/hierarchy and repeat protocol before cohort expansion                                                      |
| `candidate_review_reassignment_task_success_rate`                  | below 90% for decline/expiry recovery in moderated pilot                  | Product Research + Design           | identify route/action confusion, revise and retest; do not add reminders by default                                           |
| `candidate_review_reassignment_critical_a11y_defect_total`         | any                                                                       | Accessibility + Site Product        | block affected rollout, repair shared primitive/composition, rerun keyboard/screen-reader/zoom/RTL evidence                   |
| `candidate_review_reassignment_no_route_support_case_rate`         | above 5 cases per 100 active D28 episodes over 30 days                    | D29 owner + Support                 | examine responsibility setup/zero/unknown copy, improve safe setup and coordinator coverage; never broadcast by capability    |

## Migration, rollout, upgrade, and rollback

1. Keep D28 and its Phase 17 key **Reserved**. This Grill record does not
   authorize implementation.
2. Correct the active OpenSpec's D24 latest-editor contradiction before any
   protected review implementation relies on participant independence.
3. Land/verify Phase 12 context, D19/Phase 17 recipient-item/engagement/source-
   end semantics, including released-zero, partial-release denial, no archive,
   no historical unread backfill, and privileged-path parity.
4. Land/verify D21/D22 current internal route resolution, one-to-three
   co-responsibility, inheritance/fallback, differential successor handoff,
   zero versus unknown, and no old-item revival.
5. Land/verify D25 external invitation/context, exact candidate/projection,
   decline/expiry/fresh invite, one active person, request-time denial, and
   provider separation.
6. Land/verify D26 current strictest-wins posture and D27/ADR-0182 one source-
   owned lane, reassignment-needed state, and deliberate handoff/return.
7. Carry forward the accepted D29 Website review follow-up route, one-to-three
   cardinality, Tenant/Site postures, current authorization intersection,
   proved-zero-only fallback, personal-item semantics, and proof pack.
   Capability remains insufficient as the responsibility rule.
8. Preserve the completed ADR-0182 and glossary amendments while keeping the
   key Reserved. The dedicated specification pass must now update active
   OpenSpec/design, register the compatible key, and trace every D28/D29 rule
   and acceptance criterion to implementation evidence.
9. Deploy schemas/constraints/indexes/RLS/grants/current-head readers and
   request-time denial before any producer or UI can create D28 state.
10. Deploy source producers/receipts/outbox and recipient resolver in dark mode.
    Compare complete results to expected fixtures; release no items.
11. Activate source-by-source behind server kill switches only when every
    adapter can prove exact applicability, safe facts, current actions, end,
    route, and compatibility. Unknown sources stay unavailable.
12. Use future-only production activation. Do not infer D28 episodes, recipients,
    or unread state from historical invites, tasks, notifications, audit logs,
    or expired grants.
13. Pilot with representative small, multi-Site, multilingual, restricted,
    mobile/low-bandwidth, and distributed-team ministries. Complete moderated
    comprehension/task tests and production-shaped authorization/race/load/
    accessibility proof before expansion.
14. Scale by measured cohorts. Any zero-tolerance signal stops the affected
    source/cohort; operational signals pause growth and invoke their runbook.
15. Rollback first disables new D28 production/action surfaces while retaining
    current lane/terminal/policy readers, source-page discoverability, and
    request-time denial. Existing authoritative state remains readable and
    recoverable.
16. Never roll back by deleting rows, reviving prior external contexts/items,
    auto-returning internal, or fabricating read/end. Repair/roll forward from
    immutable receipts and current heads.
17. Retain old-code/new-schema and new-code/old-schema compatibility fences
    until all producers/readers/workers understand D28/D29 generation. Mixed or
    unknown generation fails closed.
18. Run the deferred broad formatting, links, skill parity, OpenSpec, lint,
    typecheck, tests, builds, and diff verification once the Grill session's
    documentation set is complete, per founder direction.

## ADR, glossary, OpenSpec, and trace requirements

### ADR disposition

D28 does not need a second lane ADR. ADR-0182 already records the non-obvious,
hard-to-reverse source-owned single-lane/reassignment boundary and the main
Grill reconciliation now amends it with D28's source/UX boundary and D29's
accepted Website review follow-up route. ADR-0182 has been amended through D29
and the key remains Reserved for implementation proof. The combined amendment
states:

- decline/expiry without review creates one `reassignment_needed` source
  episode;
- recovery never automatically selects internal/external;
- personal attention uses an explicit D29 responsibility route intersected
  with current authorization;
- read never ends work and no reminder/email/archive exists;
- fresh external/internal successor semantics and route zero/eligibility zero/
  unknown remain distinct; and
- **Keep current version** is not a resolution.

### Glossary addition

> **Candidate review reassignment episode** (Phase 24 D28): A source-owned,
> exact Tenant/environment/Site/candidate/review-epoch condition opened only
> when the current candidate still requires review and its selected external
> path ends by decline or expiry without a review. It says a responsible,
> currently authorized human must deliberately choose a fresh external or
> internal lane. It is not a task, assignee, permission, invitation, reminder,
> review result, cancellation, public effect, or automatic fallback. Personal
> D19/Phase 17 items are role-safe projections over the episode; reading them
> does not end it.  
> _Avoid:_ decline emails all admins, expiry returns old reviewers, item read
> resolves reassignment, Keep current dismisses work.

The authorized main Grill reconciliation has added this term to `CONTEXT.md`;
this isolated report-writing task did not edit the glossary.

### OpenSpec and implementation trace

The active Site/communications change must eventually name:

- exact decline/expiry applicability and source end;
- `reassignment_needed` lane transition and semantic episode identity;
- D29 responsibility route/role/cardinality/resolver and authorization
  intersection;
- fixed preview fact allowlist, destination, action registry, and end rule;
- read/active/no-archive/no-channel semantics;
- decline versus expiry action hierarchy;
- fresh D25 handoff and current D21 successor behavior;
- route zero, eligibility zero, indeterminate, policy/source change, and
  offline/stale/race outcomes;
- relational/RLS/grant/privileged-path constraints;
- no Keep-current resolution, no public/Giving/finance effect; and
- migration, monitors, rollback, and release proof.

| Decision                | Required D28 dependency/use                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| D17                     | persistent source discoverability, typed owner routing, exact Cancel planned change, unchanged Live consequence |
| D19                     | recipient-specific item/engagement, read versus active, no archive/channel, source end                          |
| D20                     | exact review-required source episode and source-owned end                                                       |
| D21/D22                 | internal route, one-to-three semantics, successor occurrence, zero/unknown, no revival                          |
| D23/D24                 | current source independence, participant proof, stale candidate/policy behavior                                 |
| D25                     | external terminal/fresh invitation/context/projection/one-active lifecycle                                      |
| D26                     | current platform/source/Tenant/Site availability ceiling                                                        |
| D27/ADR-0182            | one lane, reassignment-needed, CAS, fresh return/handoff                                                        |
| D28                     | explicit decline/expiry next-lane choice and recovery presentation                                              |
| D29                     | accepted Website review follow-up responsibility route; implementation IDs and proof remain Reserved            |
| Later feedback decision | minimum concise Request-changes explanation with optional source anchor                                         |

## Unresolved unknowns

- D29 now fixes who is explicitly responsible for D28 recovery; capability
  alone remains insufficient. Exact recipient-role/key identifiers and the
  Tenant/Site route manifest remain Phase 17/design implementation work.
- Representative nonprofit staff have not yet validated the words **Choose
  next review path**, **Invite again**, **Choose another external reviewer**,
  **Return to internal review**, **Return without notification**, or
  **reassignment**.
- Production data does not establish decline/expiry/reinvite frequencies,
  typical number of affected managers, or safe latency/load budgets. Pilot and
  preregistered evidence must set them; no vague “scalable/fast” claim is made.
- Each consequence-owning source still needs an exact safe external projection,
  decline/expiry result, internal-return/fresh-handoff adapter, and D28 end.
- D25 exact assurance/expiry profiles remain source/Phase 4 manifest work; D28
  does not invent a universal duration.
- Phase 17 retention and role-safe Recent-history presentation must cover D28
  without keeping reviewer PII or preview bodies longer than purpose permits.
- The later Request-changes decision must determine minimum actionable
  feedback without giving external reviewers editing/assignment authority or
  creating a generic issue tracker.
- Exact support history detail and optional neutral prior-attempt count require
  privacy/usability evidence; they cannot become reputation scoring.
- Current runtime/deployed RLS may differ from checked-in migrations; deployment
  proof is mandatory before claiming parity.

## Ruthless synthesis

### Must be resolved before recording D28

Resolved in this corrected decision:

1. applicability is decline/expiry only for a still-current review-required
   candidate;
2. one source episode enters `reassignment_needed` and chooses no lane;
3. attention is recipient-specific, read remains separate, and active work has
   no dismiss/reminder/email;
4. decline and expiry have different primary actions;
5. every successor is fresh/current-proofed;
6. internal route zero, internal eligibility zero, and unknown are distinct;
7. D26/source posture governs every current action;
8. offline/stale/races are inert/one-winner;
9. current Live/Giving remains unchanged; and
10. **Keep current version** is rejected as a D28 resolution.

D29 responsibility is now resolved at the product-contract level. The key
still cannot activate until the accepted D28/D29 contract has complete
OpenSpec, registry, source, authorization, data, test, migration, and release
evidence.

### Must be captured before implementation

1. the accepted D29 route/cardinality/postures/resolver semantics plus exact
   implementation role and registry identifiers;
2. the completed ADR-0182 D28/D29 amendment and glossary terms;
3. active OpenSpec source/recipient/fact/destination/end contracts;
4. source adapter manifests for every admitted candidate type;
5. immutable heads/revisions/receipts/occurrence/item schema and indexes;
6. Phase 12 capabilities, RLS/grants/security-definer/privileged-path parity;
7. Base Maia list/detail/picker/confirmation/terminal/error states;
8. 120 acceptance tests plus production-shaped race/load/privacy/accessibility
   proof;
9. named monitors/runbooks/kill switches; and
10. future-only staged rollout/rollback evidence.

### Implementation safeguards

- one source writer and one expected-head CAS;
- no provider/network call inside authoritative locks;
- current request-time external denial independent of reconciliation lag;
- complete all-before-any responsibility resolution;
- responsibility intersected with current authorization, never inferred from
  it;
- source discoverability when zero/indeterminate/projection failure;
- fresh invitation/successor identities and no old-item/context revival;
- closed role-safe preview DTOs and body-free telemetry;
- no historical unread backfill; and
- no generic task, workflow, reminder, email, fallback, or Keep-current path.

### Monitor only with named controls

Only usability wording, observed decline/expiry/repeat/support rates,
production latency/load budgets, and safe operational lag may be monitored.
Tenant isolation, authorization, one current episode/lane, complete release,
current policy, no revival, no unauthorized egress, and no public/Giving/
finance effect are hard invariants. They are never monitor-only controls.

### Strongest path forward, in order

1. Record D28 with the corrected rules above.
2. Carry the completed D29 responsibility decision into the recipient
   resolver/key design without changing its responsibility/authority boundary.
3. Preserve the amended ADR-0182 and glossary, then reconcile active OpenSpec
   with the completed D28/D29 contract.
4. Complete D19/Phase 17 and D21–D27 prerequisites.
5. Implement future-only source/authorization/data foundations behind kill
   switches.
6. Build the Base Maia journey from shared primitives with no parallel inbox.
7. Prove every AC/race/privacy/accessibility/rollback boundary in production-
   shaped tests.
8. Pilot with ministries, ratify monitor thresholds/budgets, then expand by
   source/cohort.
9. Keep the Request-changes feedback model for the later explicit Grill
   decision rather than smuggling it into D28.

## Final disposition

**Accept with required amendments.**

The exact corrected decision to record is:

> When one current external reviewer declines or their exact invitation/grant
> expires without a review while the exact candidate remains current and still
> requires review, the consequence-owning source SHALL advance the one
> Candidate review responsibility lane to `reassignment_needed` and open one
> immutable **Candidate review reassignment episode**. It SHALL choose no
> successor lane automatically.
>
> The episode SHALL use D19/ADR-0027 recipient-specific in-product attention
> only after D29 defines one explicit bounded recovery-responsibility route and
> recipient role. Current exact authorization SHALL subtract from that
> responsibility but SHALL NOT create it. Reading SHALL clear only personal
> unread engagement; active work SHALL remain until a fresh D25/D27 external
> handoff, a current D21/D22 internal return, or source terminality actually
> ends it. There SHALL be no dismiss, archive, snooze, reminder, email, timer,
> urgency, guessed recipient, or capability broadcast.
>
> Decline SHALL lead with **Choose another external reviewer**. Expiry SHALL
> lead with **Invite the same reviewer again** only after complete current
> admissibility proof, then **Choose another external reviewer**. **Return to
> internal review** SHALL use the current D21/D22 route and distinguish
> released recipients, released-zero notification responsibility, zero
> eligible internal humans, and indeterminate proof. Every external successor
> is a fresh D25 invitation; old grants, links, contexts, items, and engagement
> never revive. Current D26/source posture and every source/authorization/
> participant/candidate head are re-proved on each view and command.
>
> **Keep current version** SHALL NOT be a D28 resolution: current Live behavior
> already remains unchanged. Waiting leaves the episode active; abandoning the
> Plan uses D17 **Cancel planned change**; restoring a baseline names an exact
> source-proved target. One source CAS chooses every competing transition.
> D28 has no public, Giving, Legal Entity, Stripe, settlement, bank, currency,
> contribution, receipt, ledger, or accounting effect.

## Recommended next one-at-a-time Grill question

### D29 — Who should receive the D28 recovery item?

#### Context and impact

D28 now defines the exact source condition and staff recovery actions, but it
cannot infer responsibility from permission. A person may be allowed to invite
or return a reviewer without being the person Hope expects to watch every
external-review failure. Conversely, a named coordinator must still pass
current capability, source visibility, and conflict checks before receiving an
actionable item.

This choice determines notification volume, accountability, absence recovery,
Tenant/Site inheritance, and the Phase 17 recipient resolver. It does not grant
any review, invitation, editing, publication, or public authority.

#### Hope Ministries example

Hope names Maria and Joel as **Website review coordinators**. Ana can review
Website candidates internally but does not manage external-review recovery.
Maria invites Eli; Eli later declines while Maria is travelling.

Who should receive **External review needs a next step**?

#### Option 1 — explicit one-to-three Website review coordinators — recommended

Reuse the accepted D21/D22 route machinery with a distinct responsibility
meaning and recipient role: a Tenant names one to three Website review
coordinators, ordinary Sites inherit, and a Site may use its explicitly governed
Site route/fallback where accepted. Each named Party receives their own D19
item only when currently authorized for at least one next-lane action. Any one
may resolve the D28 episode; one person's read does not affect another.

**Hope experience:** Maria and Joel receive separate items. Maria being away
does not strand the review; Joel can invite another external reviewer or return
the candidate internally. Ana receives no recovery item merely because she can
review. Naming Maria/Joel grants them nothing.

**Impact:** clearest accountable ownership, bounded fan-out, safe small-team
coverage, and reuse of tested inheritance/zero/unknown/successor machinery.
It adds one explicit responsibility setting/meaning, not a workflow engine.

#### Option 2 — every exact-capability holder

Send the item to everyone who can currently perform at least one D28 next-lane
action.

**Hope experience:** Ana and every qualified Website administrator may receive
the item even when Hope expected only Maria/Joel to coordinate. Permission
changes silently change responsibility.

**Impact:** no setup and broad recovery coverage, but high notification/privacy
noise, unclear accountability, and a direct violation of D21's
permission-is-not-responsibility principle.

#### Option 3 — original inviter first, then managers

Send the item to Maria because she invited Eli. If Maria is unavailable or
unauthorized, fall back to eligible managers.

**Hope experience:** intuitive when Maria remains active, but travel,
offboarding, conflict, role loss, or limited source visibility can strand the
item. The fallback still needs a separate responsibility definition and may
devolve into Option 2.

**Impact:** less initial setup but brittle, hidden precedence and handoff, and
provenance becomes mistaken for ongoing responsibility.

#### Recommendation

**Recommend Option 1 — explicit one-to-three Website review coordinators using
D21/D22 route machinery with a distinct D28 meaning.** It is the only option
that keeps responsibility explicit, authorization current, fan-out bounded,
and absence recovery understandable without making the inviter or every
capability holder the default owner.

Do you choose **Option 1**, **Option 2 — every exact-capability holder**, or
**Option 3 — original inviter then managers**? You may amend any option.

**Subsequent answer:** Option 1 was accepted with required amendments in D29;
this question is retained only as historical decision evidence.

### Later identified Grill question — Request changes feedback

**Resolved by D30:** **Request changes** requires one private 1–1,000-code-point
plain-text explanation and permits zero or one exact-projection source anchor.
It remains separate because request-changes is a terminal source outcome, not
D28 decline/expiry recovery, and therefore creates no D28/D29 episode or item.

## Primary evidence index

### Core repository

- [D28 primary research](./phase-24-d28-explicit-next-lane-choice-primary-research.md)
- [D27 adversarial review](./phase-24-d27-one-visible-review-lane-adversarial-review.md)
- [D27 primary research](./phase-24-d27-one-visible-review-lane-primary-research.md)
- [D26 bounded Tenant availability](./phase-24-d26-bounded-tenant-external-review-availability-adversarial-review.md)
- [D25 candidate-scoped external reviewer](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md)
- [D24 substantive participants](./phase-24-d24-every-substantive-participant-adversarial-review.md)
- [D23 source-owned independence](./phase-24-d23-source-owned-proportional-independence-adversarial-review.md)
- [D22 co-responsible reviewers](./phase-24-d22-small-co-responsible-reviewers-adversarial-review.md)
- [D21 responsibility routing](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
- [D20 review-required episodes](./phase-24-d20-every-review-required-episode-adversarial-review.md)
- [D19 state-driven attention](./phase-24-d19-state-driven-plan-attention-adversarial-review.md)
- [D17 private Plan](./phase-24-d17-private-default-site-locale-plan-adversarial-review.md)
- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [ADR-0182](../../adr/0182-one-current-candidate-review-responsibility-lane.md)
- [Phase 12 role and permission configuration](./phase-12-full-role-permission-configuration.md)
- [Phase 17 System Messages](./phase-17-system-messages-template-management.md)
- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)

### Current official external sources

- [Blackbaud Grantmaking Reviews](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reviews.html)
- [HubSpot content approvals](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
- [Microsoft Power Automate approval management](https://learn.microsoft.com/en-us/power-automate/approve-reject-requests)
- [Microsoft Power Automate approval scenarios](https://learn.microsoft.com/en-us/power-automate/approvals-howto)
- [Contentful Tasks](https://www.contentful.com/help/content-and-entries/tasks/)
- [GitHub review-request API](https://docs.github.com/en/rest/pulls/review-requests)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C ARIA radio-group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
