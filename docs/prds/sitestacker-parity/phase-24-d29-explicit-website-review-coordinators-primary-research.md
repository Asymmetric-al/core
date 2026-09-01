# Phase 24 D29 — explicit Website review coordinators primary research

Date: 2026-08-28  
Status: research evidence for the Phase 24 Grill session  
Founder answer: **Option 1 — one to three explicit Website review coordinators**  
Scope: D28 reassignment-attention responsibility only; D19–D28 authority remains fixed

Companion decision evidence is recorded in the
[D29 adversarial review](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md).

## Research question

How should Core let a Tenant name one to three people who are deliberately
responsible for external-review recovery attention, while keeping the setup
plain, calm, flexible across Sites, resilient to turnover, and structurally
separate from Website permissions, D21 internal review responsibility, D25
invitation authority, and D28 source truth?

This document tests the founder's answer against current Core authority,
current repository behavior, current official primary sources, comparable
nonprofit/CMS/CRM/approval products, and accessible admin UX. It does not
implement the feature, amend OpenSpec, or treat the Hope Ministries example as
evidence of customer demand.

## Evidence labels

- **Repository fact** — directly supported by current Core source, accepted
  ADRs, governing OpenSpec, the glossary, or a completed Phase 24 decision.
- **Verified external fact** — directly supported by a current official product,
  security, database, or accessibility source.
- **Reasonable inference** — a bounded conclusion supported by multiple facts,
  with the inferential step stated.
- **Product judgment** — the recommended Core choice; not claimed as an
  industry or ministry fact.
- **Assumption** — plausible but unproved with representative nonprofit Website
  staff or production-shaped Core data.
- **Unresolved unknown** — a fact that current evidence cannot settle and that
  must remain visible before implementation details are frozen.

## Executive finding

**Disposition: Accept with required amendments.**

One to three explicit coordinators is the strongest permanent direction, but
the informal choice is not safe or clear enough by itself. It must become a
separate, versioned **Website review follow-up route** with these properties:

1. **One person is the ordinary UX.** The interface recommends one deliberately
   selected coordinator and exposes **Add coverage** only after that choice. Up
   to three supports real shared coverage without presenting three empty slots
   or making the maximum look like a target.
2. **Responsibility is not authority.** Selection changes only who Core tries
   to bring back to an active D28 reassignment episode. It grants no membership,
   Site visibility, invitation, review, publication, configuration, or public
   authority.
3. **D29 is not D21 with a new label.** D21 answers “who should receive an
   internal review request?” D29 answers “who should choose the next path after
   an external review ends?” Their route data, recipient role, qualification,
   occurrence history, and settings copy remain separate. Core may reuse one
   bounded route mechanism, not one semantic route or audience.
4. **The Tenant supplies the quiet default.** A Site explicitly either inherits
   that default or names its own coordinators. A Site override records one
   visible coverage choice: use the Tenant coordinators only after proved-zero
   Site qualification, or send no personal item. Partial or indeterminate Site
   proof never widens the audience.
5. **Only exact current next-lane-capable route members receive items.** Event-
   time resolution intersects the winning route with exact private context
   visibility and at least one lawful successor-lane action: fresh external
   continuation or return to internal review. A source-terminal **Cancel
   planned change** action alone does not qualify a D29 recipient. A configured
   name never substitutes for authorization.
6. **Every recipient receives a personal ADR-0027 item.** Reading is personal,
   never a claim, and never clears a sibling's item. One source-owned successor
   lane or terminal outcome ends all applicable active items.
7. **Configuration is prospective by default.** Saving new coordinators does
   not silently move current work. A separate fresh impact preview can hand
   currently open D28 episodes to the new route using differential successor
   occurrences. Unchanged people are not alerted again.
8. **Unconfigured, deliberately off, zero, and unknown are different.** An
   unconfigured posture, an explicit no-item posture, and a completely proved
   zero-qualified configured route each create no guessed item but remain
   distinct staff/audit facts; the source stays discoverable. Incomplete or
   corrupt proof releases nobody and retries the same semantic occurrence.
9. **The experience stays inside Core.** Mission Control uses shared Base Maia /
   Base UI patterns, semantic tokens, a searchable single-person combobox,
   selected-person rows, explicit radio choices, 44-pixel important targets,
   one-column mobile reflow, persistent help/errors, stable focus, and restrained
   status announcements.
10. **No generic work product is created.** D29 adds no team, queue, assignee,
    workflow, claim, due date, reminder, email, digest, escalation, out-of-office
    schedule, public change, Giving effect, or financial effect.

The strongest external evidence supports designated people, explicit
reassignment, current access checks, small targeted notification rather than
broad team noise, and clear separation between assignment and permission. No
primary source proves that **three**, the exact Tenant/Site hierarchy, or the
proposed labels are universally optimal for nonprofit ministries. Those are
Core product judgments that require moderated comprehension and task testing
before the notification key becomes Live.

## Current behavior, intended behavior, and best permanent path

### Current repository behavior

**Repository fact:** no runtime D29 Website review follow-up route, recipient
resolver, settings surface, manifest key, or relational model currently exists
under `apps`, `packages`, or `supabase`.

The current runtime is not a safe precedent:

- [`packages/auth/permissions.ts`](../../../packages/auth/permissions.ts) still
  maps every staff subrole to the same four broad MVP capabilities. It cannot
  express D29's exact view/action qualification or route-management boundary.
- [`20260526193000_mission_control_tasks.sql`](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)
  contains mutable assignees, queues, due dates, reminders, dismissed/suppressed
  task states, and one Tenant-level attention row. Those semantics conflict with
  ADR-0027 and D28 and must not be reused as D29 authority.
- Current support settings components demonstrate Core's compact Card, stacked
  mobile layout, and persistent save-state direction, but some local styling and
  32-pixel controls are weaker than the repository's current semantic-token and
  important-target requirements. Existing code is evidence of product shape,
  not permission to copy known weaknesses.

### Accepted intended behavior before D29

- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
  makes an in-product notification a Tenant+Party+role+surface attention
  projection, not source/task truth; read changes engagement only; access loss
  removes presentation; old items never revive.
- D19/D20 define one producer-proved actionable episode, semantic occurrence,
  personal items, source-driven end, and no reminder/email behavior.
- D21/D22 define a distinct one-to-three internal-review responsibility route,
  visible Tenant/Site precedence, explicit fallback, complete all-before-any
  resolution, stable routing legs, and prospective configuration with deliberate
  current-work handoff.
- D25/D26 define one candidate-scoped external reviewer and a bounded external-
  review availability posture; neither supplies D29 responsibility.
- [ADR-0182](../../adr/0182-one-current-candidate-review-responsibility-lane.md)
  and D27/D28 define one current Candidate review responsibility lane, one D28
  reassignment episode, explicit next-lane recovery, personal Needs attention
  items, current lawful actions, and the prohibition against inferring D29 from
  permission, inviter, D21 reviewers, every admin, or a legacy task.
- Active Sitestacker OpenSpec still governs one role-safe Phase 17 attention
  model and keeps producer truth, recipient resolution, presentation,
  engagement, and source end separate. The D28 key remains Reserved until this
  distinct recipient contract and the known D24/OpenSpec reconciliation close.

### Best permanent path

Add one typed D29 coordinator-route purpose to the same bounded route framework
used by D21/D22, while preserving separate semantic data and history. Register
one exact Phase 17 recipient role and resolver for
`candidate_review.choose_next_lane@1`. Keep the D28 source episode authoritative
and treat D29 as its recoverable private attention projection.

Do not create or infer:

- a generic “Website team” whose membership also grants access;
- a shared queue or claimable task;
- a role/capability-wide recipient scan;
- a dynamic link to D21 Website reviewers;
- the original inviter or most recent actor as fallback;
- an array of recipients with one shared read flag;
- a per-candidate coordinator assignment step;
- an email/digest/reminder path; or
- a hidden Site override/fallback encoded by null or an empty array.

## Exact corrected D29 contract

### D29-R1 — one distinct canonical responsibility

Core SHALL define **Website review follow-up route** as the private,
versioned Tenant- or Site-scoped coordination policy naming the bounded,
unordered people expected to receive D28 reassignment attention.

The route answers one question only:

> Who should choose what happens next when an external Website review ends
> without completion?

It is not the D21 internal review route, an external reviewer pool, a standing
role, a permission group, a source assignee, or a workflow queue.

### D29-R2 — exactly one to three explicit people when configured

A configured Tenant or Site route contains **one to three distinct explicit
same-Tenant stable Parties**. One is recommended; two or three are admitted only
for genuine shared coverage.

- A new or migrated Tenant begins **Not configured**; Core infers nobody.
- Removing the final Tenant member requires **Stop follow-up notifications**
  and records a deliberate no-item posture distinct from **Not configured**;
  neither posture is an empty configured route.
- Three is the hard v1 product/contract maximum, not a Tenant setting and not
  Phase 17's larger execution safety ceiling.
- A fourth person, duplicate stable Party, corrupt count, or count/digest
  mismatch rejects the whole save or resolution. Core never truncates or
  partially releases.
- Members are co-equal and unordered. Display, insertion, storage, or digest
  order conveys no primary, backup, rank, rotation, workload, quorum, or
  escalation meaning.
- Removing the final Site member requires an explicit choice to inherit the
  Tenant route or use no Site personal item; an empty override is never saved.

The limit of three is a Core v1 product judgment. Current sources prove that
one-of, all-of, sequential, team, and individual responsibility are different
meanings and that broad fan-out creates noise; they do not prove a universal
optimal count for nonprofit Website coordination.

### D29-R3 — responsibility never grants authority

Selecting a person SHALL NOT grant or imply:

- Tenant membership or Site visibility;
- Page, Navigation, Communications, Website, or locale access;
- authority to invite an external reviewer;
- eligibility or independence to perform review;
- authority to return the lane internally or cancel a Plan;
- publication, activation, public serving, or Giving control; or
- route-management authority.

Every list, item, detail, and command re-proves current EffectiveAccess, source
visibility, D28 applicability, and the exact action independently. Removing
someone from the route revokes no permission.

### D29-R4 — one visible Tenant default

At **Settings → Websites → Reviews**, an authorized route manager
configures the Tenant's ordinary Website review coordinators once. Every new and
ordinary Site begins in explicit `inherit_tenant` mode.

The Tenant summary shows:

- the one-to-three selected people;
- **Not configured** when there is no route;
- **Follow-up notifications are off** when staff deliberately chose no item;
- how many Sites inherit it and how many use a Site override, limited to Sites
  the current manager may enumerate; and
- a factual coverage/degradation summary, never a promise that every selected
  person can act on every Site.

The Tenant route has no hidden global administrator, D21, or inviter fallback.

### D29-R5 — optional Site override with explicit fallback

On **Settings → Websites → Reviews**, under **Site exceptions → [Site]**, an
authorized Site route manager chooses one visible mode:

1. **Use Hope's review coordinators** (`inherit_tenant`); or
2. **Choose different coordinators for this Site** (one-to-three explicit Site
   members); or
3. **Send no follow-up item for this Site** (deliberate Site no-item posture).

When the Site uses different coordinators, staff must also choose one visible
coverage behavior:

1. **Use Hope's review coordinators if no Site coordinator can act** —
   recommended; or
2. **Send no personal item**.

The Tenant route is considered only after the Site route completely proves
zero current qualified recipients. One qualified Site coordinator keeps the
Site route as the winner. Partial, stale, timed-out, truncated, over-limit, or
indeterminate Site proof never invokes fallback or unions audiences. A system
error never expands disclosure.

### D29-R6 — exact route-management authority

Only an actor with the future exact Phase 12 capability for managing the D29
route at the current Tenant or Site scope may view names, search candidates,
save a route, inspect impact, or initiate a current-episode handoff.

Route management is narrower and separate from:

- receiving a D28 item;
- performing a D28 next-lane action;
- D21 internal review-route management;
- Website administration as a broad label; and
- staff/super-admin compatibility roles in the current MVP map.

The server derives actor, Tenant, environment, Site, purpose, route scope,
expected head, and audit attribution. A browser, AI, support tool, import,
worker, or service-role caller may not nominate those trusted facts.

### D29-R7 — a purpose-filtered person picker

The person picker SHALL:

- search one exact active same-Tenant staff directory through an authorized,
  server-filtered, keyset-paginated query;
- show only identities the route manager may enumerate;
- add one stable Party at a time through the shared Base UI combobox;
- keep name/search relevance separate from current qualification and never hide
  a visible active same-Tenant person merely because current access is absent;
- at Site scope, label whether the person can currently receive follow-up for
  that Site, allow deliberate responsibility intent despite a warning, and
  state that selection grants no access;
- at Tenant scope, state that qualification varies by Site and provide only an
  authorized aggregate coverage summary;
- keep a previously configured person visible to route managers if later access
  loss makes them unqualified, labeled **Can't currently receive these items**;
- show Unicode name plus only an independently authorized disambiguator;
- render selected people as ordinary semantic rows outside the listbox, each
  with a separately named **Remove [Name]** button; and
- provide no select-all, team/group, CSV, paste-list, drag order, star, primary,
  backup, availability, presence, or ranking control.

The picker helps staff choose; it is never an authorization editor.

### D29-R8 — complete event-time qualification

When a D28 reassignment episode opens, the generated resolver intersects the
winning route with current proof that each member:

1. remains the same active Tenant Party;
2. may see the exact Tenant/environment/Site/candidate/review-epoch recovery
   context;
3. remains in the exact effective D29 route and fixed recipient role; and
4. can perform at least one currently lawful successor-lane action that the
   destination would show that person: fresh external continuation or return
   to internal review.

Editing or reviewing independence is irrelevant to coordination unless it
affects one successor-lane action. A substantive participant may coordinate a
next lane without being eligible to perform independent review. A person whose
only current source action is **Cancel planned change** does not qualify for a
D29 item; cancellation is a terminal source action, not next-lane
coordination. Conversely, a D21 reviewer receives no D29 item unless separately
selected and qualified here.

The resolver returns exactly:

1. `released` — one complete canonical set of one-to-three exact recipients;
2. `released_zero` — complete proof that the applicable hierarchy has no
   qualified member; or
3. `indeterminate` — any route, scope, membership, visibility, capability,
   action, bound, freshness, or authorization proof is incomplete.

Only a complete set releases children. Indeterminate, partial, limit-plus-one,
corrupt, or unavailable proof releases nobody and retries the same semantic
occurrence.

### D29-R9 — one stable routing leg, not continuous audience churn

The winning route revision and complete selected recipient set are frozen for
one D28 routing leg. It does not append people merely because qualification is
later gained and does not switch back to a higher-priority Site route merely
because it recovers while a fallback leg remains healthy.

Re-resolution is admitted only when:

- every currently selected recipient becomes proved unavailable;
- an authorized manager deliberately applies the saved route to current
  episodes; or
- a later, genuinely new D28 reassignment episode begins.

This prevents notification flapping. A successor routing occurrence preserves
source episode identity, uses current proof, and never revives or transfers an
old person's engagement.

### D29-R10 — personal items and shared responsibility remain separate

One D28 source episode compiles to one semantic Phase 6 occurrence and one
personal Phase 17 item per exact Tenant+Party+fixed D29 recipient role+Mission
Control surface recipient.

- Reading clears only that recipient's unread state.
- Opening, reading, rendering, prefetching, or background refresh never claims
  the episode.
- Sibling coordinators retain their own items and engagement.
- One successful source-owned next-lane or terminal command ends all applicable
  sibling active items; only the actual command actor is attributed.
- A nonrecipient with independent D28 action authority may still act from the
  source page; route membership is not an action allowlist.
- A selected recipient sees only their own lawful current actions. Coordinators
  may have complementary successor-lane capabilities without Core fabricating
  a common permission set. A separately authorized terminal action may appear
  after navigation, but it never supplies D29 recipient eligibility by itself.

### D29-R11 — prospective settings and deliberate current handoff

Ordinary route saves apply to future D28 routing legs. They do not silently
reassign active episodes.

After save, if the actor may see affected open episodes, Core shows a separate
result:

> **Review coordinators saved**  
> Two external reviews still use their current coordinators.  
> **[Review current assignments]**

The current-assignment action re-proves impact and previews:

- newly notified people;
- people who will no longer receive the item;
- unchanged people who will not be alerted again;
- inherited Sites, Site overrides, and fallback legs affected;
- privacy-filtered counts where names cannot be shown; and
- the fact that no permission, review, website, or public state changes.

One expected-head source/route command applies the differential handoff. A
stale impact preview blocks only the handoff and offers refresh; it does not
undo the already committed prospective route save.

### D29-R12 — turnover and access changes

- Losing route membership ends active responsibility presentation without
  revoking any separate permission.
- Losing all view/action authority removes active and recent presentation
  immediately under ADR-0027.
- Later re-addition or authority regain never revives an old item or unread
  state.
- If at least one selected qualified recipient remains, Core does not widen or
  re-alert.
- If every selected recipient is proved unavailable, Core may open one
  successor routing leg through the already saved Site/Tenant hierarchy.
- A Party merge or stable-human reconciliation deduplicates the effective set;
  it cannot create two items, cross Tenant scope, or rewrite past attribution.
- Tenant-member deactivation, Site transfer, Site retirement, candidate
  supersession, review completion, or source terminality follows current source
  truth and never leaves an item actionable without a lawful path.
- D29 adds no out-of-office dates, temporary delegation schedules, leave
  calendars, timers, or automatic manager escalation. Staff can add real
  coverage or deliberately hand off current episodes.

### D29-R13 — unconfigured, deliberate no-item, zero, and unknown stay truthful

**Unconfigured** means no responsibility choice has been recorded.
**Deliberate no item** means an authorized manager explicitly turned follow-up
off for the Tenant or Site. **Released zero** means Core completely evaluated
an applicable configured hierarchy and proved no qualified recipient.
**Indeterminate** means proof is incomplete. They are never interchangeable.

For unconfigured, deliberate no-item, or released-zero:

- create an immutable zero-member occurrence and no personal item;
- guess no admin, manager, inviter, D21 reviewer, creator, editor, support
  person, AI, service role, or capability holder;
- keep the D28 source recovery state discoverable in the authorized Site
  review surface; and
- show route managers the exact calm state—**needs setup**, **is off**, or **no
  coordinator can currently receive**—without creating another item about the
  missing item.

For indeterminate, release nobody, expose no partial names, record a privacy-
safe repair reason, and retry the same occurrence. Unknown is never treated as
zero to invoke a broader fallback.

D29 unconfigured, deliberate no-item, released-zero, or indeterminate
resolution never blocks a D25 external handoff independently authorized by
current source, D25, D26, and D27 proof. Coordinator attention is responsibility
presentation, not an authority prerequisite. The handoff states the distinct
truthful nonblocking coverage status but never fabricates a recipient, task, or
confirmation gate.

### D29-R14 — exact privacy boundary

The compact D28 item remains privacy-minimal. It contains the Site, locale,
generic external-review-end meaning, unchanged Live locale, unchanged Giving,
and one destination action. It does not contain coordinator roster, reviewer
contact, exact terminal reason, feedback, draft details, or sibling engagement.

The destination may state:

> You received this because you are one of Hope's review coordinators for
> hope.org. Other coordinators may also receive their own item. Reading does not
> claim the work.

Names and effective-route details appear only to an actor separately authorized
to enumerate them. If Tenant fallback won, an authorized manager may see that
reason; ordinary recipients receive only the truthful route label needed to
answer **Why am I seeing this?** No screen exposes who read, opened, ignored,
or lost access.

### D29-R15 — source, route, notification, and action remain separate owners

The source owns D28 applicability, the reassignment episode, the Candidate
review responsibility lane, source end, and next-lane command results. D29 owns
only coordinator route intent and routing evidence. Phase 6/17 owns occurrence,
personal item, presentation, and engagement. Phase 12 and source commands own
current authorization. CMS/Payload owns no coordinator or operational review
truth.

No derived settings summary, cache, search index, item, delivery event, UI
selection, or audit projection may become a write authority for another owner.

### D29-R16 — no hidden automation or external channel

D29 SHALL create no:

- email, SMS, push, digest, recurring reminder, or notification preference;
- due date, target date, expiry, countdown, age-derived urgency, SLA, or
  escalation;
- task, queue, claim, assignment, workload balance, round robin, or workflow;
- provider call or external webhook; or
- route-change notification unless a source-authorized current-episode handoff
  creates a genuine new personal item for a newly responsible recipient.

### D29-R17 — zero public, Giving, donor, missionary, or financial effect

Coordinator configuration, resolution, reading, handoff, failure, and repair
must have zero effect on the public Site, Site Root Entry, locale routes, public
generation, current Default Site Locale Version, Giving paths, donations,
designations, Legal Entity, Stripe, settlement, bank, currency, contributions,
receipts, statements, ledger, donors, or missionary surfaces.

The staff UI explicitly reassures only where consequence ambiguity exists; it
does not repeat financial copy on every ordinary settings row.

### D29-R18 — activation remains proof-gated

The D28/D29 notification key remains **Reserved** until all of the following
are true:

- D29 route, resolver, recipient role, item copy, source applicability/end, and
  action contracts are complete and versioned;
- D24's accepted every-substantive-participant contract is reconciled into
  active OpenSpec and related source contracts;
- Phase 12 exact capabilities and privacy-safe directory enumeration exist;
- D25–D28 source, lane, invitation, expiry, and recovery commands exist;
- all-before-any Phase 6/17 compilation and personal engagement are available;
- RLS/grant/service/support/cache/realtime/export/repair poison matrices pass;
- moderated ministry comprehension, accessibility, mobile, localization, and
  weak-network gates pass; and
- one future-only writer fence is ready with no historical unread replay.

## Recommended staff UX/UI

### Information architecture: one page, two visibly different jobs

Keep the Mission Control location **Settings → Websites → Reviews**. Do not
create a separate Teams product or bury D29 under
People/Permissions. The page title is **Website reviews**. Under its **Review
responsibilities** section, use two separate Base Maia Cards in this order:

1. **Review notifications** — D21's Website reviewers across the three D20
   review-required meanings; and
2. **External review follow-up** — D29's Review coordinators.

D26's **External review** availability remains a separate policy card after
that section. **Review responsibilities** is not the page title, because the
availability policy is not a roster.

The paired layout is deliberate. It lets staff compare the two responsibilities
without implying that one list dynamically feeds the other. Each Card repeats
the minimum distinction at the moment it matters:

```text
External review follow-up

Who chooses the next step?
Choose 1–3 people to receive Needs attention when an external review ends
without completion.

Review coordinators
Maria Santos

This sends private attention only. It does not give anyone Website access or
permission to invite, review, publish, or change a Site.

One person is usually clearest.
[Add coverage]                                      [Save coordinators]
```

Avoid a generic card title such as **Approvers**, **Owners**, **Admins**, or
**Website team**. Avoid **Use Website reviewers**, copy, sync, or linked-roster
controls. Any coupling would make a D21 edit silently or suggestively change
D29 responsibility. Staff deliberately select the distinct D29 route.

### Tenant setup journey

#### 1. New or migrated Tenant

```text
External review follow-up

Not configured
No one will receive a personal Needs attention item if an external review ends.
The review will still be visible from its Site.

[Set review coordinators]
```

Do not show an error, red destructive state, or fake default. **Not
configured** is truthful setup state, not system failure, and it never blocks an
independently authorized external handoff.

#### 2. Add the first coordinator

Selecting **Set review coordinators** keeps staff in context and reveals one
labelled combobox:

```text
Who chooses the next step?
[Search people…]

Choose who should be responsible. Core sends an item only when that person can
see the private Website review and choose at least one available next step.
Selecting them here does not grant access.
```

The search returns visible active same-Tenant staff and presents qualification
as separate concise text rather than an admission rule:

```text
Maria Santos
Can currently receive follow-up for 12 of 18 Sites you can manage
```

or, at exact Site scope:

```text
Maria Santos
Cannot currently receive follow-up for hope.org
Selecting Maria does not grant access.
```

If the actor may not see a Site or staff disambiguator, Core omits it rather
than leaking hidden scope. If the search finds no matching active staff:

```text
No matching active staff

Try another name. A selected person receives an item only when they are
independently allowed to see this review and choose an available next step.

[Review Website access]
```

The access link appears only when the actor may manage those permissions;
otherwise the final sentence is **Ask someone who manages Website access.** No
task or email is created. A current qualification warning does not prevent an
active same-Tenant person from being selected: responsibility intent and
authorization remain separate, and only event-time-qualified people receive an
item.

#### 3. Add genuine coverage

After one person is selected, reveal **Add coverage** instead of two more empty
slots:

```text
Maria Santos
Currently receives coordinator items when allowed
[Remove Maria Santos]

One person is usually clearest.
[Add coverage]
```

At two:

```text
2 people share external-review follow-up

Maria Santos
Joel Martin

Each receives a separate item when currently allowed. Reading does not claim
the work; one lawful next-lane choice ends the episode.
[Add one more]                                      [Save coordinators]
```

At three:

```text
3 people selected · maximum

Keeping this group small makes responsibility clear and limits unnecessary
notifications. Remove someone before adding another.
```

The disabled add control retains its explanation. A forged fourth member
returns a persistent inline error and writes nothing.

#### 4. Save without surprise

Ordinary prospective save needs no confirmation dialog. The form uses the
existing persistent save-state pattern, adapted to semantic tokens, responsive
stacking, and Core's important-target size. On success, one polite status says:

> Review coordinators saved. Future external-review follow-up will use this
> route when each person is currently allowed.

If current episodes exist, a separate inline result offers **Review current
follow-up**. A transient toast alone is insufficient evidence of success or
impact.

### Site journey: inheritance that can be understood at a glance

On **Settings → Websites → Reviews**, open **Site exceptions → hope.org**:

```text
External review follow-up

Who chooses the next step for hope.org?

● Use Hope's review coordinators (recommended)
  Maria Santos, Joel Martin

○ Choose different coordinators for this Site

This changes private follow-up attention only. It does not change Website
access, review permission, the public Site, or Giving.
```

Use a native fieldset/legend or shared Base UI radio group, not a switch. The
two choices are mutually exclusive modes, not on/off. If names are private for
the viewer, show **Uses Hope's review coordinators** without roster disclosure.

Selecting the Site option conditionally reveals only the related picker and
coverage question:

```text
Site review coordinators
Ana García

If none of these people can choose a next step
● Use Hope's review coordinators (recommended)
○ Send no personal item

Core uses Hope's coordinators only when it can fully verify that no Site
coordinator can act. A system error never expands the audience.

[Save Site coordinators]
```

The wording intentionally avoids the unexplained noun **fallback** in the main
control. Technical docs may use that canonical resolver term.

### Current-work handoff journey

After prospective save:

```text
Review coordinators saved

2 external reviews are already waiting. They still use their current
coordinators.

[Review current assignments]
```

The impact Sheet on compact screens and Dialog on wider screens says:

```text
Use the new coordinators for 2 current reviews?

Newly notified
Ana García

No longer receives the item
Maria Santos

Unchanged · no new notification
Joel Martin

This changes private Needs attention items only. It does not change who can
review, invite, publish, or change the Website.

[Update 2 current reviews]  [Keep current assignments]
```

Names appear only where the actor can enumerate them. Otherwise show scoped
counts and **Some details are hidden by your access**. The primary button names
the actual effect. **Keep current assignments** closes the impact surface and
does not undo the prospective route save.

### Recipient journey

The compact D28 item stays simple:

```text
External review needs a next step

hope.org · French (Canada)
The external review ended before completion.
English (United States) remains live. Giving is unchanged.

[Choose what happens next]
```

On the authenticated destination, below the current source status:

```text
Why you're seeing this

You are one of Hope's review coordinators for hope.org. Other coordinators may
also receive their own item. Reading does not claim the work.
```

Do not place route explanation, sibling names, or multiple effect buttons in
the compact bell row. The destination shows only the current viewer's lawful
D28 actions and explains when a coordinator cannot personally review.

If Joel acts while Maria is viewing:

```text
The review path was updated

This item no longer needs action. Refreshing shows the current review path.
```

Name Joel only if current source audit attribution is independently visible.
Preserve safe unsaved local text where applicable and offer no stale retry that
could duplicate an invitation or lane transition.

### Empty, degraded, and repair journeys

#### Effective zero

Authorized route manager:

```text
Review coordinator attention needs setup

No selected person can currently receive follow-up for this Site. The review
is still waiting and remains available from Site → Languages.

[Review coordinators]
```

A person who may act on the source but not manage routes sees the source state
and lawful action, not coordinator names or the picker.

#### Resolver unknown

```text
Review notification status is temporarily unavailable

The review is still waiting. Core has not sent a partial set of items.
[Try again]
```

Retry reconciles the same occurrence. It does not create a new source episode,
new unread debt, or broader fallback.

#### Saved member loses access

```text
Maria Santos
Can't currently receive these items

Maria remains listed so responsibility intent and history stay clear. Restore
the required access or choose someone else. This setting cannot grant access.
```

No automatic deletion hides the problem. No red avatar, tooltip-only reason,
or email is used.

#### Offline or lost response

```text
You're offline
Changes haven't been saved. Reconnect to verify current access and save.
```

Core never uses cached authorization to save or hand off. If the response is
lost after commit, the idempotent command reconciles to **Saved** without a
second route revision or item.

### Accessibility, mobile, localization, and low-bandwidth contract

- Mission Control only; shared `@asym/ui`; exact Base Maia/Base UI primitives;
  Zinc-derived semantic tokens; no app-local fork or second visual system.
- Native form semantics first. Radio modes use a labelled fieldset/legend;
  helper text and errors use stable descriptions; selected-person rows remain
  outside listbox options because listbox options cannot safely contain
  interactive remove buttons.
- The searchable combobox supports its standard keyboard interaction, visible
  label, expanded/selected state, Escape without destructive selection, and
  predictable focus after add/remove.
- Every important target is at least 44 by 44 CSS pixels under Core's stronger
  product rule. Focus remains visible and unobscured by sticky save controls.
- 320-CSS-pixel and 400% zoom reflow uses one column without horizontal task
  scrolling. Long names, CJK, combining marks, right-to-left layout, bidirectional
  isolation, localized plural forms, and 200% text spacing do not truncate a
  decisive state or action.
- Qualification, inheritance, fallback, error, saved, maximum, and changed
  states use text and programmatic state, never color, avatar, icon, flag,
  hover, sound, or motion alone.
- Field errors remain adjacent and an error summary links to each invalid
  control. Async search/save/result counts use one restrained status
  announcement without stealing focus.
- Dialog/Sheet initial focus, containment, Escape/cancel, destructive
  consequence copy, and return focus follow the shared primitive contract.
- No drag-only ordering, swipe-only removal, hover-only explanation, or
  desktop-only impact preview exists.
- Search is debounced/cancelable, paginated, and textual before optional
  decorative avatars. Cached directory results never authorize selection or
  save.
- Reduced motion follows the global baseline. D29 needs no decorative entrance,
  confetti, sound, or attention-grabbing animation.

## Hope Ministries end-to-end example

Hope chooses Maria as its ordinary review coordinator. It adds Joel only
because he truly shares external-review recovery coverage. The French-Canada
Site has a different regional owner, Ana, and explicitly uses Hope's Tenant
coordinators only if Core can prove Ana cannot currently act.

Maria invited Eli to review the private French candidate. Eli later declines.
The Site route still proves Ana can see the exact candidate and choose a lawful
next path, so Ana alone receives a personal **Needs attention** item. Maria and
Joel do not join merely because they are the Tenant default. Ana reads the item;
only Ana's unread badge clears. She does not claim the work.

Ana then loses Site access before acting. Her item disappears immediately. Core
proves the selected Site set empty, opens one successor routing leg, and uses
the explicitly saved Tenant coverage choice. Maria and Joel each receive a
fresh personal item if they can currently see the recovery and perform at least
one shown successor-lane action. Ana's old item and engagement never revive.

Joel chooses **Return to internal review** first. One source compare-and-swap
commits the internal successor lane and ends the D28 episode. Maria's item ends
from source truth; Core does not pretend Maria read, claimed, or completed it.
The current English Site and Giving remained unchanged throughout.

If no qualified Site or Tenant coordinator existed, nobody would be guessed.
The D28 recovery would remain visible from Hope's authorized Site surface, and
the missing attention route would not block an independently authorized D25
external handoff.

## Source of truth and domain invariants

| Fact                                                               | Authoritative owner                                                 | Derived projection             | Never authority                       |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------ | ------------------------------------- |
| D28 episode, reason, actionability, source end                     | source candidate/review domain                                      | item copy, Site status         | coordinator route, item, email        |
| current Candidate review responsibility lane                       | source lane head/receipt                                            | status display                 | coordinator, reviewer, provider       |
| configured D29 responsibility intent or deliberate no-item posture | immutable Tenant/Site policy/route lineage and current head         | settings summary               | role, capability, browser form        |
| effective D29 route and qualified recipient set                    | generated server resolver with current EffectiveAccess/source proof | occurrence routing evidence    | caller, cache, legacy task, D21 route |
| current action authorization                                       | Phase 12 + source/D25–D28 command policy                            | enabled destination controls   | route membership, prior item          |
| Phase 6 occurrence                                                 | canonical communication compiler                                    | child intent/item release      | source end, route setting             |
| item and engagement                                                | Phase 17 exact Tenant+Party+role+surface model                      | badge, Needs attention, Recent | source action, sibling read           |
| actor attribution and next-lane result                             | source command receipt                                              | authorized audit/history       | item click, route membership          |
| public Site/default/Giving/finance                                 | their existing owners                                               | privacy-safe reassurance       | D29 route or engagement               |

Required invariants:

1. D29 responsibility is semantically distinct from D21 review responsibility.
2. A configured route has one-to-three unique same-Tenant stable Parties;
   unconfigured and deliberate no-item are separate policy states with no
   member rows and neither is an empty configured route.
3. Member order has no product meaning.
4. Responsibility grants no permission, and permission creates no D29
   responsibility or item.
5. Tenant configured/unconfigured/no-item and Site inherit/member/no-item modes
   are explicit, never inferred from null or an empty member list.
6. A Site member route has one explicit Tenant-coverage choice; a deliberate
   Site no-item posture has no member route or fallback.
7. Only complete proved-zero Site qualification may consider Tenant fallback.
8. A partially qualified Site route wins without Tenant union.
9. Indeterminate, stale, over-limit, corrupt, or partial proof releases nobody.
10. One routing leg freezes one complete selected set; qualification gain does
    not append recipients while the leg remains healthy.
11. Every qualified selected Party receives at most one item for one D28
    episode/routing leg/fixed D29 recipient role.
12. Every item has personal engagement; no shared read, claim, or assignment
    state exists.
13. One source-owned successor lane or terminal result ends applicable siblings
    without fabricating engagement or attribution.
14. A separately authorized nonrecipient may act; an unauthorized route member
    may not.
15. Route edits are prospective unless a fresh explicit current-episode handoff
    wins.
16. Unchanged recipients retain engagement and receive no new unread item from
    route revision alone.
17. Removed responsibility never revokes authority; access loss removes
    presentation immediately.
18. Re-add, authority regain, identity relink, cache replay, or worker retry
    never revives an old item.
19. A later genuine D28 episode may create a new occurrence; elapsed time or
    route engagement may not.
20. Clone/import/template/transfer never copies named people or engagement
    implicitly; a destination Site starts from destination Tenant inheritance.
21. No D29 state changes public, Giving, donor, missionary, or financial truth.

## Conceptual database, RLS, and authorization contract

Exact physical names remain design work. The permanent model should contain:

1. an append-only **policy/route revision header** for the fixed
   `website_review_next_lane_coordination@1` purpose;
2. normalized immutable **route member** rows bound to stable same-Tenant Party
   identity;
3. closed Tenant configured/unconfigured/no-item and Site inherit/member/
   fallback/no-item policy revisions;
4. one current-head pointer or constrained current-version relation per exact
   Tenant/environment/purpose/scope;
5. immutable command receipts and body-free audit attribution;
6. immutable D28 routing occurrence/generation evidence with winning route,
   route/head versions, qualification/access epochs, result kind, selected set
   digest, and zero/indeterminate reason; and
7. existing Phase 6 occurrence and Phase 17 personal item/engagement ownership,
   not D29-specific duplicates.

### Required relational safeguards

- Every route and child relationship carries composite Tenant+environment+
  purpose+scope identity. Site rows carry the exact same-Tenant Site key; Tenant
  rows cannot carry a Site.
- The fixed purpose/recipient-role code is closed and versioned. D21 and D29
  cannot cross-attach even if the same Party appears in both.
- Route members use stable Party identity, `NOT NULL` where applicable, and a
  unique same-route Party constraint.
- A released configured revision declares expected member count `1..3` plus a
  canonical unordered-set digest. A fourth member, duplicate, missing member,
  or digest mismatch cannot become current.
- Because an ordinary PostgreSQL row `CHECK` cannot count sibling rows safely,
  one server command locks the expected route head, writes the complete
  normalized candidate set, verifies count/digest/scope, marks the immutable
  revision released last, and advances one head atomically. Do not rely on
  client count, JSON array length, or a racy pre-query.
- Tenant configured/unconfigured/no-item and Site inherit/member/fallback/no-
  item modes use a closed enum or equally constrained union. A no-item posture
  has no member rows and is not an empty configured route; impossible null/
  member/fallback combinations are rejected structurally.
- One semantic routing leg and one exact recipient slot are unique. Repeated
  worker, realtime, refresh, and lost-response attempts return the same receipt
  or reconcile the same occurrence.
- Delete behavior is restrictive for route lineage, occurrence, receipt, and
  audit. Staff deactivation, Site retirement, or Tenant lifecycle never cascades
  away evidence needed to explain what happened.
- Current-head, effective-route, Site inheritance, reverse-impact, recipient,
  source-applicability, and active-item predicates are indexed. Index order
  starts with Tenant/environment/scope to preserve isolation and bounded reads.
- Free-form JSON may hold diagnostic metadata only after a typed authority row
  exists; it never owns scope, members, fallback, capability, actor, action, or
  item identity.

### RLS, grants, views, functions, and privileged paths

- Enable and force RLS on every exposed D29 relation. Revoke direct browser
  insert/update/delete. Configure grants as well as policies; a policy does not
  revoke an existing table privilege.
- `SELECT` policies require active Tenant equality plus the exact route-
  management, recipient, source, Site, role, and privacy predicates appropriate
  to that projection. Route roster visibility is narrower than knowing that a
  route exists.
- Mutation policy halves are operation-correct: `USING` validates the existing
  row/head the actor may act on; `WITH CHECK` validates the resulting same-scope
  revision/head. An allowed update may not move a row to another Tenant, Site,
  purpose, Party, role, or current head.
- Browser-visible views use security-invoker posture or an equivalently proved
  safe server read model. Security-definer views/functions, RPCs, triggers,
  workers, service/secret roles, support tools, imports, exports, cache fills,
  realtime topics, and repair scripts pass the same scope/action resolver and
  poison tests.
- Table owners and service/secret roles bypass ordinary RLS unless constrained
  by path discipline. Their commands therefore derive scope and actor from
  trusted server/session context, call the same authorization service, write
  equivalent audit evidence, and cannot accept caller-supplied recipients.
- The item recipient set is compiler output. No UI, job payload, provider event,
  imported email, task assignee, cached route summary, or caller-supplied Party
  list may create Phase 17 recipient rows.
- Actor/author/manager/audit identity is server-derived. AI acts only within the
  initiating human's exact authority and is never a route member or actor branch
  by itself.

### Command boundaries and lock order

All route configuration and current-episode handoff commands live behind the
canonical `packages/api` business boundary. A later design must document one
lock order, for example:

1. trusted Tenant/environment/Site and actor context;
2. source candidate/review epoch and D28 episode head when current work is in
   scope;
3. D29 route head(s), Site mode, and expected route revision;
4. current Party/EffectiveAccess/authorization epochs;
5. immutable candidate revision/members/receipt;
6. source-authorized routing successor/outbox obligation; then
7. commit before Phase 6/17 asynchronous projection.

No provider, email, broad directory scan, or notification materialization runs
while source/route locks are held.

## Lifecycle, temporal correctness, concurrency, and idempotency

### Route configuration states

| State                            | Meaning                                                   | Valid next states                                        |
| -------------------------------- | --------------------------------------------------------- | -------------------------------------------------------- |
| `unconfigured`                   | no Tenant choice recorded; nobody inferred                | configured 1–3, Tenant no item                           |
| `tenant_no_personal_item`        | Tenant deliberately sends no personal item                | configured 1–3                                           |
| `inherit_tenant`                 | Site uses current Tenant posture                          | Site members, Site no item                               |
| `site_override_tenant_coverage`  | Site members first; Tenant posture only after proved zero | inherit, other Site mode, new member revision            |
| `site_override_no_personal_item` | Site members first; no broader fallback                   | inherit, other Site mode, new member revision            |
| `site_no_personal_item`          | Site deliberately sends no personal item                  | inherit, Site members                                    |
| `configured_current`             | one immutable 1–3 revision is current for its scope       | successor revision, retire with explicit mode transition |
| `retired_history`                | superseded immutable route evidence                       | never current again                                      |

There is no mutable empty override, paused route, archived route, scheduled
route, temporary delegate, or implicit last-known-good fallback.

### Routing-leg lifecycle

| Event                                                                       | Required outcome                                                 |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| D28 episode opens                                                           | resolve one current explicit hierarchy all-before-any            |
| duplicate trigger/retry                                                     | same semantic occurrence and routing leg                         |
| one selected person reads                                                   | only that person's unread clears                                 |
| one selected person loses access; another remains                           | remove lost presentation; keep healthy leg; no append/fallback   |
| all selected people prove unavailable                                       | one successor leg may resolve current saved hierarchy            |
| Site route later regains qualification while Tenant fallback leg is healthy | no flap; wait for explicit handoff or new D28 episode            |
| prospective route save                                                      | no current item change                                           |
| explicit current-episode handoff                                            | differential successor occurrence; unchanged engagement retained |
| D28 successor lane commits                                                  | all applicable active items end once                             |
| source/candidate/review becomes terminal or superseded                      | episode/items end; no successor routing                          |
| later fresh external lane ends without review                               | new D28 episode and new semantic occurrence                      |

### Concurrency outcomes

- Two route managers saving against one expected head: one successor wins; the
  loser sees **Review coordinator settings changed** plus current truth and
  must deliberately reapply. There is no last-write-wins overwrite.
- Route save races with current-episode handoff: the handoff binds one exact
  saved route head and source head; stale impact changes nothing.
- Route handoff races with next-lane action: source outcome wins if committed
  first; the stale handoff creates no new unread debt. Handoff first changes
  only personal attention; any later action still re-proves current source.
- Qualification changes during compilation: all-before-any release either
  proves one complete set against exact epochs or releases none. It never emits
  the first recipients and then discovers that fallback or scope changed.
- Site override save races with Tenant route change: the explicit Site mode and
  expected Tenant/fallback head determine one result; a stale impact preview
  cannot silently combine generations.
- Party merge/deactivation races with release: stable identity and current
  access fences prevent duplicate/wrong-person items; reconcile the same
  occurrence after the authoritative identity outcome.
- A lost HTTP response after commit returns the same semantic command receipt
  for the same key/meaning. Reusing a key with changed members, scope, fallback,
  or action rejects.

## Adversarial edge-case matrix

| Case                                                      | Permanent behavior                                                                      |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| no Tenant route; Site inherits                            | unconfigured; no guessed item; source remains discoverable                              |
| Tenant follow-up deliberately off; Site inherits          | deliberate zero item; settings say off, not setup; source remains discoverable          |
| Tenant has 1; Site inherits                               | use that member only if currently qualified                                             |
| Tenant has 3; two unqualified                             | one qualified member is the complete winning set; do not treat as zero                  |
| Site override has one qualified member; Tenant has three  | Site wins; no union                                                                     |
| Site override completely proves zero + Tenant coverage on | resolve only current Tenant route                                                       |
| Site override proof times out + Tenant coverage on        | indeterminate; no Tenant widening                                                       |
| Site override has no-item coverage                        | no fallback after proved zero                                                           |
| Site follow-up deliberately off                           | no member evaluation or fallback; zero item; source remains discoverable                |
| fourth member submitted                                   | reject whole save; no truncation/current-head change                                    |
| same Party submitted twice through two memberships        | reject/dedupe before release; at most one membership/item                               |
| same stable human has unresolved duplicate Parties        | indeterminate; no partial release until identity policy resolves                        |
| coordinator is also D21 reviewer                          | separate memberships/roles/items; no semantic coupling                                  |
| coordinator authored candidate                            | may coordinate if a lawful D28 action exists; cannot bypass D23/D24 review independence |
| coordinator can invite but not return internally          | receives item if invitation action is currently lawful; sees only that action           |
| coordinator can see source but no D28 action              | no item; source may remain visible without action controls                              |
| original inviter is not selected                          | receives no D29 item solely for historical involvement                                  |
| selected coordinator goes on leave                        | no inferred absence; staff deliberately add/handoff coverage                            |
| selected coordinator deactivated                          | presentation removed; successor leg only after proved selected-set empty                |
| removed then re-added                                     | new future/successor item only; old engagement never revives                            |
| route manager lacks roster enumeration                    | privacy-safe status/count only; no names or picker                                      |
| route manager selects self                                | allowed only if same rules qualify; never auto-selected or privileged                   |
| two coordinators act concurrently                         | one source CAS winner; sibling items end; loser gets current truth                      |
| D28 ends before projection                                | no unread debt; no fabricated read; body-free audit only                                |
| worker repeats after source end                           | no item revival or new occurrence                                                       |
| item rendered/prefetched                                  | no read, claim, action, or sibling effect                                               |
| offline settings edit                                     | local draft only; no cached authorization or optimistic authority                       |
| response lost after save                                  | idempotent receipt reconciles; no duplicate revision                                    |
| Tenant suspended                                          | no active presentation/action; preserve governed audit                                  |
| Site retired                                              | source end wins; no route or item migration                                             |
| Site cloned in same Tenant                                | new Site explicitly inherits; no copied override people/items                           |
| Site transferred across Tenants                           | destination Tenant inheritance; never copy source people, route, or engagement          |
| route import/template                                     | named people omitted; setup required at destination                                     |
| long/CJK/RTL names collide visually                       | stable identity + authorized disambiguator; no truncation-as-identity                   |
| Site count is large                                       | bounded indexed resolver; paginated impact; no per-Site N+1 directory download          |
| D28 source detail becomes privacy-restricted              | item/detail removed immediately; route roster cannot preserve access                    |
| current Live locale or Giving changes independently       | D29 remains private and does not cache or own that truth                                |

## External primary-source findings

### Blackbaud Grantmaking: explicit reviewers and permissions are separate, but its workflow is broader

[Blackbaud's current Reviews documentation](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reviews.html)
lets an administrator search for named reviewers or committees, review the
selection before creation, and separately configures stages, dates,
visibility, and notifications. It says Client Administrator permission is
required to assign a staff member and that external reviewers cannot approve or
decline the Request merely because they provide feedback.

The official [Blackbaud Grantmaking permissions guide](https://webfiles-sc1.blackbaud.com/files/support/guides/blackbaudgrantmaking/blackbaudgrantmakingpermissions.pdf)
separately enumerates portal login, create/assign review, update/delete review,
approve/decline reviewed request, forward/bypass/resubmit review, reminders, and
review administration permissions.

**Supported inference:** mature nonprofit grant-review software distinguishes
named review responsibility, assignment administration, reviewer access, and
final decision authority. **Limit:** Blackbaud's stages, committees, due dates,
global notifications, standing portal access, and broad roles do not prove
Core's D29 model and are intentionally not imported.

### HubSpot: designated approvers still need distinct permissions

[HubSpot's current content-approval documentation](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
requires designated users before publication, separately requires approval
permissions, supports one or all selected approvers, and exposes explicit
cancel/reassign actions with a review step.

**Supported inference:** user selection and action permission are different
facts, one-of versus all-of must be explicit, and reassignment should be a
deliberate visible action. **Limit:** HubSpot's approval request, due date,
mobile/email notification, super-admin bypass, and publishing lock are not D29
recovery policy.

### GitHub: narrow notification clarifies individual responsibility

[GitHub's team code-review settings](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team)
say limiting team-wide review notifications reduces noise and clarifies
individual responsibility. GitHub can replace a team request with selected
individuals and exposes round-robin/load-balance algorithms.

**Supported inference:** a small, explicit audience is more legible than
broadcasting to every capable group member. **Limit:** GitHub's teams,
automatic assignment algorithms, 30-day workload balancing, repository owners,
and pull-request semantics are negative evidence for Core's deliberate,
unordered 1–3 route.

### Contentful: team assignment exposes the access and notification footguns

[Contentful's official Entry Tasks API documentation](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
defines individual/team assignees and explicitly warns that assigning a task
does not prove the assignee can read the entry. Team assignment emails every
member; due dates trigger reminder email. It also separates who may reassign,
resolve, and administer a task.

**Supported inference:** Core must check exact target access at selection and
release, and broad team fan-out plus automatic email/reminders creates avoidable
noise and unusable work. **Limit:** Contentful tasks block publication and own
mutable task state; D29 must not become that task system.

### Microsoft and Salesforce: response cardinality and reassignment are explicit

[Microsoft Power Automate group approvals](https://learn.microsoft.com/en-us/power-automate/group-approvals)
and [everyone-must-approve guidance](https://learn.microsoft.com/en-us/power-automate/all-assigned-must-approve)
distinguish first-response, everyone-response, user, and group meanings; group
notifications also have channel limitations.

[Salesforce's current reassignment documentation](https://help.salesforce.com/s/articleView?id=platform.automate_automated_approvals_manage_reassign_work_item.htm&language=en_US&type=5)
allows a specifically authorized Approval Admin to reassign an in-progress
assigned work item and says visible items depend on access. Salesforce's
Public Sector guidance separately warns that a transfer target must be able to
edit the associated records.

**Supported inference:** responsibility cardinality, action authority, current
work state, and reassignment authority must be explicit. **Limit:** generic
flows, queues, group ownership, mass transfer, email response, and approval
admin bypass are not Core's source-owned D28/D29 model.

### Sanity and Contentful roles: scope and assignment cannot be inferred from an organization label

[Sanity's current platform terminology](https://www.sanity.io/docs/platform-management/platform-terminology)
distinguishes organization and project roles, notes that organization admins do
not automatically have project access, and warns that organization membership
can reveal users across projects. Its [roles guide](https://www.sanity.io/docs/user-guides/roles)
uses restrictive defaults and resource-specific permissions. Contentful's
[domain model](https://www.contentful.com/developers/docs/concepts/domain-model/)
separates organization users, space membership, teams, and roles.

**Supported inference:** Tenant membership, Site scope, roster enumeration,
responsibility, and action permission cannot be collapsed into “admin” or
“team.” **Limit:** neither product proves Core's Tenant-default/Site-override
fallback or one-to-three bound.

### W3C and GOV.UK: interaction evidence, not business-policy evidence

- [WAI combobox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
  supports searchable single-value selection from an allowed set and Escape
  without committing a choice.
- [WAI listbox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
  warns that listbox options do not provide an accessible interaction model for
  nested links/buttons; selected rows and their remove buttons must sit outside.
- [WAI radio-group guidance](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
  supports one explicit choice from mutually exclusive modes.
- [WCAG status-message](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html),
  [error-identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html),
  and [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
  guidance requires programmatically perceivable non-focus-stealing status,
  persistent textual errors, and 320-CSS-pixel reflow.
- The [GOV.UK radios guidance](https://design-system.service.gov.uk/components/radios/)
  supports conditionally revealing only the related follow-up question and
  keeping complex branches on a later page; its
  [error-summary guidance](https://design-system.service.gov.uk/components/error-summary/)
  supports a focused summary linked to matching field errors.

**Limit:** these sources govern accessible interaction and error presentation,
not coordinator cardinality, Tenant/Site ownership, or ministry workflow.

### OWASP, PostgreSQL, and Supabase: permission proof must survive every path

- [OWASP's Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
  recommends deny-by-default and permission validation on every request.
- [PostgreSQL row-security documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  distinguishes row visibility/selection from allowed resulting rows through
  `USING` and `WITH CHECK`, documents default deny, and notes that owners and
  `BYPASSRLS` roles can bypass policies unless deliberately constrained.
- [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
  requires grants and policies together and warns that service roles bypass
  RLS. Its [API security documentation](https://supabase.com/docs/guides/api/securing-your-api)
  extends the same scrutiny to functions and exposed objects.

**Supported inference:** UI filtering cannot protect D29. Database relations,
commands, views, functions, service/support paths, and every read/action need
the same trusted scope and current authorization proof. **Limit:** security and
database sources do not prescribe product copy or route hierarchy.

## What the evidence proves—and does not prove

### Strongly supported

- Explicit named responsibility is clearer and quieter than broad capability or
  team fan-out.
- Selection/assignment, target visibility, action permission, and final
  authority are distinct facts.
- One-of, all-of, sequential, and queue/claim behavior cannot be left implicit.
- Reassignment of current work should be deliberate, state-aware, permission-
  checked, and auditable.
- Person selection needs purpose filtering, precise scope, accessible search,
  clear errors, and current authorization reproof.
- A listbox should not contain interactive removal controls, and radio choices
  should expose inheritance/override modes explicitly.
- RLS alone is insufficient without grants and privileged-path parity.

### Not externally proved

- That nonprofit missions ministries broadly need D29.
- That three is the optimal maximum rather than two or another bound.
- That **Review coordinator**, **Who chooses the next step?**, or the exact
  settings location is best understood by representative staff.
- That Tenant default plus optional Site override matches real ministry
  organizational structure.
- That Tenant fallback after proved-zero Site qualification is preferable to no
  personal item for most Tenants.
- That a coordinator route is needed as an authority prerequisite. Core's
  accepted responsibility/authorization boundary instead says absent, zero, or
  unknown attention proof must not block an independently authorized external
  handoff.
- Real Site counts, route-change frequency, recipient counts, directory sizes,
  latency baselines, or support burden.

## Strongest alternatives and why they lose

### Every exact-capability holder

No setup and high nominal coverage, but permission changes silently change
responsibility, larger Tenants get noisy fan-out, recipient privacy expands,
and staff cannot answer “why me?” from an intentional policy. This conflicts
with D21/D28 and GitHub's explicit noise/responsibility lesson.

### Original inviter with manager fallback

Feels intuitive in the simplest case, but couples current responsibility to a
historical actor, strands work during departure/leave, creates a hidden
fallback hierarchy, and could reveal candidate context to a person no longer
responsible. It also makes provider/invitation history a recipient authority.

### Dynamically use D21 Website reviewers

Reduces setup but collapses “perform internal review” and “coordinate external
recovery,” silently changes D29 when D21 changes, and can exclude people who may
coordinate without being independent reviewers. It directly contradicts
ADR-0182's ratification boundary.

### Generic team or shared queue

Offers flexible membership and claiming, but creates standing broad fan-out,
shared state, workload/availability semantics, and a second task/workflow
system. It imports the exact Contentful/Salesforce footguns D19/D28 rejected.

### Per-candidate coordinator selection

Maximally precise but adds repeated setup at every external handoff, encourages
staff to pick the current inviter reflexively, and creates a new assignment
step where a Tenant default plus rare Site override solves the ordinary need.

## Research acceptance outcomes

The following `D29-RA*` statements are research outcomes retained as evidence;
they are not the canonical implementation acceptance-criterion namespace. The
[D29 adversarial review](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md)
owns canonical `D29-AC001` through `D29-AC130`. Physical table and API names
remain design work.

### Meaning and boundaries

1. **D29-RA001 — Canonical term.** The glossary/spec defines one Website review
   follow-up route for D28 next-lane attention.
2. **D29-RA002 — Distinct from D21.** D21 internal-review and D29 recovery-
   coordination routes have different fixed purpose/recipient-role codes,
   versions, rows, resolvers, and occurrence histories.
3. **D29-RA003 — One question.** Staff copy asks **Who chooses the next step?**
   and explains external-review decline/expiry; it does not imply reviewer
   performance, technical support, or Website approval.
4. **D29-RA004 — Responsibility only.** Adding a member changes no membership,
   role, capability, visibility, source qualification, review, invitation,
   publication, or public state.
5. **D29-RA005 — Removal only.** Removing a member revokes no independent
   permission or source action.
6. **D29-RA006 — No implicit sources.** No admin, capability holder, inviter,
   creator, editor, D21 reviewer, support user, AI, service role, or task
   assignee becomes a recipient without explicit D29 membership.
7. **D29-RA007 — No action allowlist.** An independently authorized D28 actor
   outside the route can act from the source surface.
8. **D29-RA008 — No authority from item.** Item creation, view, read, unread,
   or route membership never authorizes a D28 command.
9. **D29-RA009 — Mission Control only.** D29 settings/items do not appear on
   public, donor, or missionary surfaces.
10. **D29-RA010 — Zero external effects.** D29 produces no public, Giving,
    finance, provider, email, SMS, push, or webhook effect.

### Cardinality and configuration

11. **D29-RA011 — Unconfigured state.** A new/migrated Tenant has an explicit
    unconfigured state and no inferred member; deliberate no-item is a separate
    explicit policy state.
12. **D29-RA012 — Minimum one.** A configured route cannot release/current with
    zero members; a no-item posture has no route-member revision and is not
    encoded as configured-empty.
13. **D29-RA013 — Maximum three.** A configured route cannot release/current
    with more than three members.
14. **D29-RA014 — Fourth rejected.** A forged fourth-member save writes no
    revision, head, receipt, occurrence, or item.
15. **D29-RA015 — Unique Party.** One stable Party appears at most once per
    route revision despite multiple memberships/accounts.
16. **D29-RA016 — Duplicate rejected.** Duplicate/corrupt Party submission
    writes nothing and exposes no cross-scope existence.
17. **D29-RA017 — Unordered.** Reordering the same set has no semantic effect
    and does not create new responsibility/item work.
18. **D29-RA018 — No rank.** UI/API/schema expose no primary, backup, rank,
    rotation, workload, quorum, or escalation behavior.
19. **D29-RA019 — One-person default.** Setup recommends one person and hides
    extra empty slots until **Add coverage**.
20. **D29-RA020 — Three not a target.** At three, UI says maximum/keep small and
    never renders `3 of 3 required` or progress.
21. **D29-RA021 — Complete set release.** Count, normalized members, and
    canonical digest are verified before a revision becomes current.
22. **D29-RA022 — No truncation.** Overflow, count mismatch, or partial member
    writes never become a smaller valid route or proved zero.
23. **D29-RA023 — Expected head.** Every save uses an expected current route
    head and one semantic command key.
24. **D29-RA024 — Save race.** Two different saves against one head produce one
    winner; loser sees current truth without overwrite.
25. **D29-RA025 — Lost response.** Same-key/same-meaning retry returns one saved
    receipt and creates no duplicate revision.

### Tenant/Site inheritance and fallback

26. **D29-RA026 — Tenant default.** Tenant configuration supplies the ordinary
    default route once or records a deliberate no-item posture distinct from
    first-use unconfigured.
27. **D29-RA027 — New Site.** A new Site explicitly inherits its destination
    Tenant route without copying member rows.
28. **D29-RA028 — Visible Site mode.** Site UI shows exactly inherit, choose
    different coordinators, or send no Site follow-up item; null/empty never
    chooses a mode.
29. **D29-RA029 — Site members.** A Site member route has one-to-three explicit
    same-Tenant members; deliberate Site no-item has no members.
30. **D29-RA030 — Explicit coverage.** Every Site member route stores exactly
    one visible Tenant-coverage or no-personal-item fallback choice.
31. **D29-RA031 — Site partial wins.** One qualified Site member prevents Tenant
    union/fallback for that routing leg.
32. **D29-RA032 — Site zero fallback.** Tenant fallback is evaluated only after
    complete proved-zero Site qualification and only when saved.
33. **D29-RA033 — Unknown no fallback.** Partial/stale/timeout/over-limit/corrupt
    Site proof never invokes Tenant fallback.
34. **D29-RA034 — No audience union.** No routing leg combines Site and Tenant
    recipients.
35. **D29-RA035 — Fallback stability.** A healthy Tenant fallback leg does not
    flap back when Site qualification later recovers.
36. **D29-RA036 — Last Site removal.** Removing a final Site member requires
    explicit inherit or no-personal-item mode; empty override cannot save.
37. **D29-RA037 — Tenant change.** Tenant route edits do not mutate Site override
    members and affect inheriting/fallback Sites only under their explicit mode.
38. **D29-RA038 — Clone.** Site clone/template/import copies no named people,
    route head, item, engagement, or audit authority.
39. **D29-RA039 — Transfer.** Cross-Tenant Site transfer uses destination
    Tenant inheritance and rejects every source-Tenant coordinator link.
40. **D29-RA040 — Privacy-filtered counts.** Tenant/Site coverage summaries
    include only scopes the current manager may enumerate.

### Person picker and settings UX

41. **D29-RA041 — Purpose-filtered search.** Search is same-Tenant, active,
    server-filtered, permission-aware, paginated, and cancelable.
42. **D29-RA042 — No full directory.** The browser never downloads an entire
    Tenant directory to filter locally.
43. **D29-RA043 — Stable identity.** Selection binds stable Party identity, not
    display name, email text, list index, or browser object.
44. **D29-RA044 — Authorized disambiguation.** Results show Unicode name and
    only disambiguators the manager may independently see.
45. **D29-RA045 — Site qualification honesty.** Site picker may preserve
    deliberate responsibility intent for a visible active same-Tenant person
    who is currently unable to perform a D28 successor-lane action, but labels
    that fact and states that selection grants no access; the person receives
    no item until independently qualified.
46. **D29-RA046 — Tenant honesty.** Tenant picker/summary never claims a selected
    person is eligible for every Site; it shows authorized aggregate coverage.
47. **D29-RA047 — Later degradation.** A saved member who loses access stays
    visible to managers with **Can't currently receive these items** and gets
    no item.
48. **D29-RA048 — Selection outside listbox.** Selected people render as
    semantic rows outside combobox/listbox options.
49. **D29-RA049 — Named removal.** Every remove control has a visible or
    accessible **Remove [Name]** name and important target size.
50. **D29-RA050 — No bulk controls.** No select-all, role/team/group, CSV,
    paste-list, drag-order, or auto-assign control exists.
51. **D29-RA051 — Clear field copy.** Setup states 1–3, one usually clearest,
    the trigger, and that selection grants no permission.
52. **D29-RA052 — Co-located distinction.** D21 and D29 appear as separate
    Cards with different plain-language jobs; editing one never changes the
    other.
53. **D29-RA053 — One-step prospective save.** Ordinary save needs no modal and
    presents persistent success, not toast-only confirmation.
54. **D29-RA054 — Dirty state.** Unsaved edits are visible in text; Discard and
    Save remain distinct, labelled, and responsive.
55. **D29-RA055 — No permission dead end.** When no matching active staff are
    available or all visible candidates show qualification warnings, the UI
    links to permissions only for an authorized actor and otherwise gives a
    truthful human handoff without creating work or blocking a prospective
    responsibility choice.

### Event-time resolution and recipient safety

56. **D29-RA056 — Trusted inputs.** Resolver derives Tenant, environment, Site,
    D28 episode, route purpose/head, role, and action context server-side.
57. **D29-RA057 — Exact qualification.** Every recipient currently sees the
    exact private context and can perform at least one displayed D28 successor-
    lane action.
58. **D29-RA058 — Coordination not independence.** Substantive-participant
    review ineligibility does not itself disqualify a lawful coordinator, while
    cancellation-only authority does not qualify one.
59. **D29-RA059 — D21 not implicit.** D21 membership alone creates no D29
    recipient candidate or item.
60. **D29-RA060 — Released result.** `released` contains one complete canonical
    qualified set within one-to-three.
61. **D29-RA061 — Released-zero result.** `released_zero` requires complete
    evaluation and creates zero child items.
62. **D29-RA062 — Indeterminate result.** Any incomplete dependency returns
    indeterminate and releases zero children.
63. **D29-RA063 — Limit plus one.** A limit-plus-one/corrupt resolver result is
    invalid/indeterminate, not three, zero, or fallback proof.
64. **D29-RA064 — All-before-any.** No recipient item releases before the
    complete result and proof bundle commit.
65. **D29-RA065 — Fixed selected set.** Qualification gain does not append a
    new recipient while the current routing leg has one valid recipient.
66. **D29-RA066 — Partial loss.** Losing one of multiple selected recipients
    removes that person's presentation but does not widen or re-alert.
67. **D29-RA067 — Complete loss.** Proved loss of every selected recipient may
    create at most one successor routing leg from current saved hierarchy.
68. **D29-RA068 — No access regain revival.** Later access or route regain never
    revives an old item/engagement.
69. **D29-RA069 — Identity dedupe.** Party merge/stable-human reconciliation
    cannot create duplicate recipient slots or rewrite old attribution.
70. **D29-RA070 — No guessed zero recipient.** Unconfigured/zero creates no
    fallback to inviter/admin/capability/task/support/service.
71. **D29-RA071 — Unknown privacy.** Indeterminate resolution exposes no
    partial recipient names or audience.
72. **D29-RA072 — Same occurrence retry.** Resolver/worker retry uses the same
    D28 semantic occurrence and cannot create a reminder episode.

### Personal item and source lifecycle

73. **D29-RA073 — Personal slot.** One exact Party+fixed D29 role+surface has at
    most one item per D28 routing leg.
74. **D29-RA074 — No shared item.** No Tenant/team item or shared recipient-array
    read flag exists.
75. **D29-RA075 — Deliberate read.** Only deliberate open/mark-read changes that
    recipient's engagement.
76. **D29-RA076 — No incidental read.** Render, list, prefetch, hydration,
    realtime, refresh, another person's action, and worker activity do not read.
77. **D29-RA077 — Read not claim.** Read never claims, reserves, assigns,
    approves, chooses a lane, or affects siblings.
78. **D29-RA078 — Needs attention persists.** Read item remains actionable
    while D28 source and recipient authority hold.
79. **D29-RA079 — No active archive.** Active item cannot be archived,
    dismissed, snoozed, suppressed, or aged out.
80. **D29-RA080 — Source end.** A successor lane or source-terminal outcome
    ends every applicable sibling item exactly once.
81. **D29-RA081 — Unseen end.** Episode ending before view creates no unread debt
    or fabricated read.
82. **D29-RA082 — Actual actor only.** Only the successful source command actor
    receives action attribution; route members are not recorded as having acted.
83. **D29-RA083 — Concurrent action.** Two lawful next-lane commands produce one
    source CAS winner and no duplicate lane/invitation/item effect.
84. **D29-RA084 — Stale destination.** A stale viewer sees current safe outcome,
    no effectful retry, and recoverable local input where applicable.
85. **D29-RA085 — New episode.** Only a fresh external lane later ending without
    review creates a new D28/D29 occurrence.
86. **D29-RA086 — No time recurrence.** Elapsed time, read/unread, route save,
    job run, or reminder preference creates no new occurrence.
87. **D29-RA087 — Access loss.** Count/list/detail/cache/cursor/realtime removes
    active/recent item immediately on authority loss.
88. **D29-RA088 — Recent history.** Source-ended presentation follows the one
    accepted ADR-0027 policy and never extends because of route changes.

### Current-route handoff and turnover

89. **D29-RA089 — Prospective default.** Route save alone changes no current
    D28 recipient set.
90. **D29-RA090 — Separate affordance.** Open episodes produce a separate
    **Review current assignments** affordance only for authorized managers.
91. **D29-RA091 — Fresh impact.** Handoff preview re-proves current route,
    source, recipient, privacy, and authorization heads.
92. **D29-RA092 — Differential preview.** Preview separates new, removed,
    unchanged, inherited, override, fallback, and hidden details.
93. **D29-RA093 — Unchanged no re-alert.** Exact unchanged recipients preserve
    item/engagement and receive no new unread.
94. **D29-RA094 — Removed end.** Removed responsibility ends active attention
    without revoking permission or fabricating read/action.
95. **D29-RA095 — New successor item.** Newly selected qualified recipients get
    one successor occurrence/item only after handoff commit.
96. **D29-RA096 — Stale impact.** Stale preview commits no handoff and leaves
    the already saved prospective route intact.
97. **D29-RA097 — Current source wins.** Review completion/source end racing
    handoff creates no new unread debt.
98. **D29-RA098 — Deactivation.** Deactivated person receives no item; evidence
    remains without live identity leakage.
99. **D29-RA099 — No absence engine.** D29 models no leave dates, presence,
    temporary delegation, calendar, timer, or escalation.
100.  **D29-RA100 — Manual coverage is explicit.** Staff add/remove coverage and
      deliberately hand off current episodes; no hidden automatic manager chain.

### Database, RLS, security, and privacy

101. **D29-RA101 — Composite scope.** Every relation/FK/unique key carries exact
     Tenant/environment/purpose and Site where applicable.
102. **D29-RA102 — Cross-purpose protection.** D21 members/heads cannot attach to
     D29 occurrence/items through type confusion or shared UUID alone.
103. **D29-RA103 — Immutable lineage.** Released route revisions/members,
     routing evidence, receipts, and audit are append-only/restrict-delete.
104. **D29-RA104 — One current head.** At most one current route head exists per
     exact purpose/scope and concurrent saves cannot produce two.
105. **D29-RA105 — Browser writes revoked.** Browser roles have no direct
     route/head/member/occurrence/item mutation path.
106. **D29-RA106 — Enable and force RLS.** Every exposed D29 table enables and
     forces RLS with least grants.
107. **D29-RA107 — USING.** Existing-row mutation visibility uses old-row exact
     scope/actor/authority predicates.
108. **D29-RA108 — WITH CHECK.** Resulting rows cannot move Tenant, environment,
     Site, purpose, Party, recipient role, or current head.
109. **D29-RA109 — Server-derived actor.** Tenant, actor, author, manager,
     recipient, scope, role, action, and audit attribution are trusted-server
     facts, never caller fields.
110. **D29-RA110 — Privileged parity.** RPC/view/function/worker/service/support/
     repair/import/export/cache/realtime paths pass equivalent authorization and
     poison tests.
111. **D29-RA111 — Security-invoker reads.** Browser-facing views preserve
     underlying RLS or use an equivalently proved server read boundary.
112. **D29-RA112 — Roster privacy.** Names are visible only to authorized route
     managers/roster viewers; ordinary recipients see the minimum why-me label.
113. **D29-RA113 — No peer engagement leak.** No recipient sees sibling read,
     open, presence, delivery, access-loss, or inactivity state.
114. **D29-RA114 — Restricted source.** Source privacy loss removes item/detail
     even if route membership remains.
115. **D29-RA115 — No sensitive logs.** Logs/metrics omit names, emails,
     candidate content, reviewer feedback, tokens, and raw route rosters.

### Accessibility, resilience, performance, and rollout

116. **D29-RA116 — Base Maia.** UI uses shared `@asym/ui`, Base UI primitives,
     semantic tokens, and no app-local/alternate design system.
117. **D29-RA117 — Radio semantics.** Inherit/override and coverage choices are
     labelled mutually exclusive radio groups, not switches.
118. **D29-RA118 — Combobox semantics.** Search exposes name, expanded,
     selected, loading, empty, and error state with standard keyboard behavior.
119. **D29-RA119 — Focus.** Add/remove/save/error/Dialog/Sheet flows preserve
     visible unobscured focus, predictable initial/return focus, and Escape.
120. **D29-RA120 — Important targets.** Important controls meet Core's 44-by-44
     CSS-pixel target requirement without shrinking to current legacy examples.
121. **D29-RA121 — Reflow.** Every decisive setting/action works at 320 CSS
     pixels and 400% zoom without horizontal task scrolling.
122. **D29-RA122 — International text.** Long Unicode/CJK/combining/RTL names,
     bidi isolation, pluralization, and 200% text spacing preserve identity and
     decisive copy.
123. **D29-RA123 — Text not color.** Qualification/inheritance/fallback/error/
     saved/max/current states never rely only on color/icon/avatar/flag/motion.
124. **D29-RA124 — Persistent errors.** Field errors and summary are textual,
     linked, programmatically associated, and remain until repaired.
125. **D29-RA125 — Restrained status.** Search/save/result changes announce once
     without focus theft or repeated live-region chatter.
126. **D29-RA126 — Offline safe.** Offline edits never commit or use cached
     authority and clearly remain unsaved.
127. **D29-RA127 — Bounded search.** Person search is paginated/cancelable and
     cannot cause an unbounded Tenant-directory read.
128. **D29-RA128 — Bounded resolver.** Runtime route resolution examines at most
     one Site set and one explicit Tenant set, each maximum three, with indexed
     scope predicates and no N+1 Site scan.
129. **D29-RA129 — Future-only migration.** Rollout infers no people, replays no
     historical decline/expiry as unread, and uses one writer fence.
130. **D29-RA130 — Kill switch.** Projection activation can stop new D29 items
     without deleting route/source/item/audit truth or permitting a second
     writer.
131. **D29-RA131 — Mixed version.** Old-code/new-schema and new-code/old-schema
     combinations fail closed and create no partial route or item release.
132. **D29-RA132 — Roll-forward repair.** Corrupt/overflow/cross-scope data is
     quarantined and repaired by a new audited revision; history is never
     truncated or rewritten.
133. **D29-RA133 — Comprehension gate.** At least 90% of representative
     participants correctly distinguish reviewer, coordinator, permission,
     inheritance, fallback, read, and source completion before Live.
134. **D29-RA134 — Task-success gate.** At least 90% of representative
     participants can configure Tenant default, Site override, and current
     handoff without assistance or a permission misconception.
135. **D29-RA135 — Accessibility gate.** Automated and manual keyboard, screen-
     reader, zoom, forced-color, touch, RTL, and low-bandwidth evidence has no
     critical/serious unresolved defect before Live.
136. **D29-RA136 — No D21 copy or sync.** UI/API/schema provide no copy, sync,
     dynamic “use Website reviewers,” or linked-roster behavior between D21 and
     D29; the same Party may be deliberately selected in both independently.
137. **D29-RA137 — Cancellation-only excluded.** A route member whose only
     current lawful source action is **Cancel planned change** receives no D29
     item; cancellation remains available only from an independently authorized
     source surface.
138. **D29-RA138 — No handoff block.** Unconfigured, deliberately no-item,
     configured-but-proved-zero, or indeterminate D29 attention resolution
     never blocks a D25 external handoff that otherwise passes every current
     source/D25/D26/D27 authorization fence.

## Named monitoring and response contract

Quantitative experience thresholds below are proposed launch SLOs/product
guards, not measured current baselines. They must be confirmed or tightened
with shadow/canary data; safety thresholds remain zero-tolerance.

| Signal                                          | Threshold                                                          | Owner                                    | Required response                                                                                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `d29_cross_tenant_or_site_exposure_total`       | any value                                                          | Security + Data Platform                 | P0 stop affected reads/writes, preserve evidence, disable D29 projection, inspect every scope/FK/RLS/cache/export path                                                |
| `d29_route_as_permission_effect_total`          | any value                                                          | Identity & Access + Website Platform     | stop route commands/key; prove how selection changed authority; repair via source/permission owner                                                                    |
| `d29_dual_current_head_total`                   | any value                                                          | Data Platform                            | disable saves for scope, quarantine conflicting heads, roll forward one audited winner                                                                                |
| `d29_member_overflow_or_truncation_total`       | any value                                                          | Website Platform                         | stop route writer/resolver; reject/quarantine revision; requalify count/digest proof                                                                                  |
| `d29_cross_purpose_attachment_total`            | any D21↔D29 link                                                   | Security + Communications                | incident; stop key, preserve evidence, prove typed composite relationships                                                                                            |
| `d29_partial_or_indeterminate_release_total`    | any child item from non-released proof                             | Communications + Security                | stop compiler key, retract unsafe presentation, repair same occurrence, requalify all-before-any                                                                      |
| `d29_duplicate_active_recipient_slot_total`     | any duplicate                                                      | Communications                           | stop writer for key, reconcile one canonical item, preserve engagement/audit, fix idempotency                                                                         |
| `d29_stale_item_or_engagement_revival_total`    | any value                                                          | Communications + Security                | remove presentation, preserve evidence, stop key if systemic, fix access/source/revival fence                                                                         |
| `d29_unauthorized_roster_name_disclosure_total` | any value                                                          | Security + Website UX                    | incident; remove/correct surface and caches, inspect directory/impact/why-me projections                                                                              |
| `d29_resolver_indeterminate_rate`               | >1% for 60 minutes with ≥20 episodes                               | Website Platform                         | keep all-before-any suppression, inspect dependency/freshness/limit failures, communicate source discoverability                                                      |
| `d29_released_zero_rate`                        | >10% of D28 episodes over rolling 30 days after first 30 Live days | Website Product + Tenant Success         | segment unconfigured, deliberate no-item, and configured qualification loss; research setup/coverage without guessing recipients or overriding an explicit off choice |
| `d29_route_save_failure_rate`                   | >2% over 15 minutes with ≥20 attempts                              | Website Platform                         | inspect CAS/validation/directory failures, preserve drafts, show truthful incident state, rollback writer if systemic                                                 |
| `d29_person_search_p95_ms`                      | >750 ms for 60 minutes with ≥100 searches                          | Website Platform + Data Platform         | inspect indexes/pagination/query scope, degrade avatars/nonessential metadata before semantics                                                                        |
| `d29_route_resolution_p95_ms`                   | >500 ms for 60 minutes with ≥100 resolutions                       | Website Platform + Data Platform         | inspect scope indexes/N+1/freshness calls; keep bounded fail-closed result; optimize before raising bound                                                             |
| `d29_current_handoff_conflict_rate`             | >5% over rolling 7 days with ≥20 handoffs                          | Website Product + Platform               | inspect stale-preview window/copy, shorten preview validity or improve refresh; never add last-write-wins                                                             |
| `d29_why_notified_support_rate`                 | >2% of recipients or ≥5 substantiated cases in 30 days             | Website UX Research + Tenant Success     | code cases, test why-me copy/IA, revise without exposing roster/permission detail                                                                                     |
| `d29_comprehension_success`                     | <90% for any critical distinction                                  | Website UX Research                      | keep key Reserved, revise terminology/IA/copy, repeat moderated protocol                                                                                              |
| `d29_setup_task_success`                        | <90% or >10% permission-misconception rate                         | Website UX Research + Product            | keep key Reserved, simplify setup/inheritance/fallback journey, retest                                                                                                |
| `d29_critical_or_serious_a11y_defects`          | any unresolved before Live; any critical in production             | Accessibility + Website Platform         | block/disable affected surface, remediate shared pattern, rerun manual and automated evidence                                                                         |
| `d29_public_giving_or_financial_effect_total`   | any value                                                          | Website Platform + Giving/Finance owners | P0 stop D29 effects, preserve evidence, repair ownership boundary, requalify zero-effect tests                                                                        |

## Migration, rollout, upgrade, and rollback

1. Reconcile D24 and D19–D29 requirements into the active Sitestacker OpenSpec,
   ADR links, glossary, source contracts, and trace matrix before schema/runtime
   work.
2. Define exact Phase 12 capabilities for Tenant/Site route management, roster
   enumeration, source visibility, and each D28 action.
3. Add dormant append-only schema with composite constraints, grants, force RLS,
   generated types, negative readers, and no browser writes.
4. Start every existing/new Tenant unconfigured and every new Site inheriting;
   infer no member from admins, current user, D21, inviter history, tasks, or
   permissions.
5. Build one server command and one typed resolver; shadow effective routes and
   result kinds without producing Phase 6/17 work.
6. Prove 0/1/2/3/4, duplicates, Site/Tenant precedence, partial/zero/unknown,
   turnover, identity merge, concurrency, service/support/view/RPC/cache/
   realtime/export poison, and production-shaped scale.
7. Ship Tenant setup first, then Site override and explicit fallback, behind a
   read/write feature gate. Route management remains useful before item
   activation.
8. Pass representative nonprofit comprehension/task tests, accessibility,
   localization, mobile, weak-network, privacy, and performance gates.
9. Register the D28/D29 key only in a compatible manifest generation and keep
   it Reserved during shadow/canary.
10. Canary one future-only writer for bounded Tenants; create no historical
    unread items and no dual write to legacy task/attention tables.
11. Activate only after named zero-tolerance signals and launch SLOs remain
    healthy through the agreed canary window.

Rollback disables new D29 projection/route writes through the one writer fence
while preserving immutable routes, D28 source episodes, existing personal
items/engagement, receipts, and audit. Source recovery remains discoverable.
Rollback never deletes or rewrites history, revives old items, or enables a
legacy fallback. Repair and future cap changes roll forward through a new
versioned contract/revision.

## Assumptions and unresolved unknowns

### Assumptions requiring evidence

1. Most ministry Tenants can deliberately name one ordinary coordinator.
2. Two or three people cover genuine shared responsibility without diffusion.
3. The words **Review coordinator** and **Who chooses the next step?**
   distinguish D29 from D21 for real staff.
4. A Tenant default plus rare Site override matches common multi-Site ministry
   structure.
5. Staff understand that selection does not grant permission when the
   explanation appears at setup, save, and why-me points.
6. The no-email/no-reminder posture still leaves active recovery sufficiently
   discoverable through Needs attention and Site review views.
7. Authorized aggregate coverage counts help rather than create false safety.
8. One-to-three supports international and regional teams without a generic
   group product.

### Unresolved unknowns

1. Exact Phase 12 capability identifiers for Tenant route management, Site
   override, roster enumeration, current handoff, and D28 actions.
2. Whether representative staff prefer **Review coordinators**, **External
   review coordinators**, or another localized term.
3. Real distributions of Tenant/Site counts, staff directory size, route size,
   coordinator turnover, D28 episodes, zero/unknown resolution, and handoffs.
4. The exact minimum actionable feedback and source targeting required when an
   external reviewer selects **Request changes**; this is D30.
5. Whether Tenant-level qualification summaries can be computed without
   revealing restricted Sites for every supported role.
6. Retention, anonymization, and lawful export policy for superseded coordinator
   identity and route audit.
7. Whether future compliance tiers require a coordinator before some external
   review classes even if ordinary source discoverability remains sufficient.
8. Whether support needs a separately governed, audited repair command beyond
   ordinary route management.
9. The final Phase 24 environment model and whether environment appears only at
   consequential previews or ordinary settings.
10. Representative ministry evidence for the exact 90% comprehension/task
    gates and proposed monitoring baselines.

These remain explicit unknowns. Product examples from commercial CMS/CRM tools
do not establish nonprofit ministry demand or exact workflow fit.

## Ruthless synthesis

### Must be fixed before D29 is recorded

- Replace “one-to-three coordinators” with D29-R1–R18.
- Name a distinct Website review follow-up route; do not alias D21.
- Record one configured 1–3 bound, unconfigured state, unordered equality, and
  no inference.
- Record explicit Tenant inheritance, Site override, and Site fallback/no-item
  choice.
- Require complete event-time view plus at-least-one-successor-lane-action
  qualification; cancellation-only authority does not qualify.
- Preserve personal items, read-not-claim, source-owned end, and no revival.
- Make route saves prospective with deliberate current-work handoff.
- State zero/unknown behavior and that it never blocks independently authorized
  D25 handoff.
- State no permission, task, email/reminder, public, Giving, or financial effect.

### Must be captured in PRD/OpenSpec/design before implementation

- the exact route-purpose/recipient-role codes and glossary language;
- Tenant/Site modes, route revisions, normalized members, current heads,
  fallback, semantic receipts, and resolver result union;
- Phase 12 capabilities and purpose-filtered directory contract;
- complete UX copy/journeys, Base Maia information architecture, all
  loading/empty/error/offline/concurrent states;
- source/route/Phase 6/17 ownership and item/source-end mapping;
- all 138 research outcomes plus the final report's 130 canonical acceptance
  criteria and named monitor ownership;
- migration/mixed-version/canary/kill-switch/rollback/repair sequence; and
  traceability from D29 through ADR/glossary/OpenSpec/design/tickets/tests/release.

### Implementation safeguards

- one `packages/api` mutation boundary and trusted server context;
- immutable versioned normalized sets, expected-head CAS, release-last digest,
  and semantic idempotency;
- same-scope composite keys/FKs and restrict deletion;
- revoke browser writes; enable+force RLS; operation-correct `USING` and `WITH
CHECK`; privileged-path parity;
- one bounded all-before-any resolver with explicit zero/indeterminate results;
- one Phase 6/17 writer and no legacy task/attention dual write;
- differential successor occurrences without engagement transfer/revival;
- accessible shared primitives and manual interaction proof;
- no provider work under source/route locks.

### Monitor rather than pre-build

- route adoption, unconfigured/zero rate, unknown rate, latency, save conflicts,
  staff comprehension, setup success, why-notified support, and accessibility
  drift may be monitored under the named thresholds above.
- Cross-scope exposure, route-as-permission, dual heads, overflow/truncation,
  partial release, duplicate item, stale revival, unauthorized roster exposure,
  or public/financial effect are stop conditions—not monitor-and-wait risks.

### Permanent path in order

1. Record D29's corrected route and terminology.
2. Decide D30's minimum actionable **Request changes** feedback.
3. Reconcile active OpenSpec and source contracts.
4. Define exact capabilities and conceptual data model.
5. Implement dormant one-writer structures and resolver under TDD.
6. Build the Tenant setup, Site inheritance/override, current-handoff, and
   recipient why-me UX with shared Base Maia primitives.
7. Prove all authorization, isolation, lifecycle, concurrency, accessibility,
   migration, and production-shaped outcomes.
8. Shadow, usability-test, canary, then activate the compatible key.

## Recommended next one-at-a-time Grill question

### D30 — What feedback must accompany Request changes?

#### Why this needs a founder decision

D25 makes **Request changes** a terminal result for the exact external review,
but the successor candidate still needs fresh review. The remaining question is
the minimum feedback needed to make the result actionable without building a
comments, task, checklist, or quality-assurance product.

#### Hope Ministries example

Eli reviews Hope Ministries' French (Canada) candidate and sees that its
**Contact us** link still opens the English page. He selects **Request
changes**. Maria must know what to fix before creating the successor candidate.
What must Eli provide?

#### Option 1 — one required concise explanation — recommended

Core asks **What needs to change?** and requires one bounded private explanation
for this exact candidate/result. Eli may optionally anchor it to a visible
source section. Core adds no category, checklist, assignee, due date,
attachment, thread, mention, or suggested-edit system.

**Impact:** the smallest dependable amount of actionable context with low
reviewer friction. The spec must define safe length, privacy, retention,
display, localization, and the successor-candidate relationship.

#### Option 2 — optional note

Eli may submit **Request changes** without explaining why.

**Impact:** fastest submit path, but staff may receive a terminal result with no
actionable information and must reconstruct the issue out of band.

#### Option 3 — required structured checklist

Every affected source requires categories or fields before Eli can submit.

**Impact:** potentially useful for mature repeated programs, but disproportionate
for ordinary Website review. It freezes unproved categories and adds substantial
translation, accessibility, configuration, and maintenance burden.

#### Recommendation

**Recommend Option 1 — one required concise explanation, with optional source
anchors.** It makes Request changes meaningfully actionable with the smallest
permanent rule and avoids a second collaboration/workflow system.

## Primary evidence index

### Core repository

- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
- [Sitestacker outbound-communications delta](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
- [ADR-0027 — one notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0182 — one current candidate-review responsibility lane](../../adr/0182-one-current-candidate-review-responsibility-lane.md)
- [D21 responsibility routing adversarial review](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
- [D22 small co-responsible reviewers adversarial review](./phase-24-d22-small-co-responsible-reviewers-adversarial-review.md)
- [D28 explicit next-lane choice primary research](./phase-24-d28-explicit-next-lane-choice-primary-research.md)
- [D28 adversarial review](./phase-24-d28-explicit-next-lane-choice-adversarial-review.md)
- [Core frontend rules](../../ai/rules/frontend.md)
- [Shared UI contract](../../../packages/ui/AGENTS.md)
- [Current shared UI configuration](../../../packages/ui/components.json)
- [Core data-access boundary](../../guides/architecture/data-access-boundary.md)

### Current official external sources

- [Blackbaud Grantmaking Reviews](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reviews.html)
- [Blackbaud Grantmaking permissions](https://webfiles-sc1.blackbaud.com/files/support/guides/blackbaudgrantmaking/blackbaudgrantmakingpermissions.pdf)
- [HubSpot content approvals](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
- [GitHub team review settings](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team)
- [Contentful Entry Tasks API](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
- [Microsoft group approvals](https://learn.microsoft.com/en-us/power-automate/group-approvals)
- [Microsoft everyone-must-approve](https://learn.microsoft.com/en-us/power-automate/all-assigned-must-approve)
- [Salesforce reassign approval work item](https://help.salesforce.com/s/articleView?id=platform.automate_automated_approvals_manage_reassign_work_item.htm&language=en_US&type=5)
- [Sanity platform terminology](https://www.sanity.io/docs/platform-management/platform-terminology)
- [Sanity roles](https://www.sanity.io/docs/user-guides/roles)
- [Contentful domain model](https://www.contentful.com/developers/docs/concepts/domain-model/)
- [WAI combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [WAI listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- [WAI radio-group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG 2.2 error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [WCAG 2.2 reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [GOV.UK radios](https://design-system.service.gov.uk/components/radios/)
- [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)

## Final research judgment

One-to-three explicit Website review coordinators can create materially more
clarity than confusion only if Core makes the _job_, _scope_, _inheritance_,
_fallback_, _current qualification_, and _non-authority_ visible at the exact
decision points. The safest permanent implementation is one deliberate person
by default, optional coverage up to three, one Tenant default, rare explicit
Site override, current-action intersection, personal items, source-driven end,
and no guessed or external channel.

The answer is not “create a coordinator team.” It is “record one small,
purpose-specific responsibility route and prove every actual recipient against
current source authority.” That preserves nonprofit staff flexibility without
turning flexibility into hidden broadcast, brittle historical ownership, or a
second permissions/workflow system.
