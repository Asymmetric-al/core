# Phase 24 D21 Responsibility Routing Adversarial Primary Research

Research date: 2026-08-28

**Status:** Primary-source adversarial evidence for the selected Phase 24 D21
answer. This appendix is research, not a PRD, OpenSpec change, ADR, database
design, migration, runtime contract, ticket, or authorization grant. It does not
make the three D20 keys executable.

> **Final synthesis note:** The complete repository/UX/security synthesis in
> [phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
> is normative where this evidence appendix offers a provisional product
> judgment. The final D21 decision permits the visible Tenant fallback to be
> explicitly on or off for a Site override, keeps route settings prospective by
> default with a separate current-review handoff, and permits non-unread
> **Reassigned** Recent history after responsibility-only removal while current
> source authorization still holds. Underlying access loss still removes all
> private presentation. Route cardinality/completion remains the single D22
> founder decision.

## Decision examined

The founder selected:

> **Option 3 — explicit Site/Tenant Website reviewer responsibility routes with
> one visible fallback.** A Tenant configures Website reviewers once. Sites use
> that route unless an authorized manager deliberately configures Site
> reviewers; the Tenant route is the one disclosed fallback. Only people who
> are both on the winning responsibility route and currently authorized for the
> exact review action receive personal in-product items.

This research asks whether that choice is a modern, durable practice and closes
the dangerous ambiguities around inheritance, fallback, authorization,
absence, reassignment, open-review route changes, recipient churn, and staff UX.

## Evidence labels

- **Verified repository fact** means an accepted Core ADR, the completed
  D15–D20 chain, the Phase 12/17 governing direction, the repository glossary,
  or current source directly establishes the statement.
- **Verified external fact** means current first-party product or standards
  documentation directly establishes the statement.
- **Product judgment** is the recommended permanent Core interpretation after
  reconciling the evidence. It is not presented as a universal vendor rule.
- **Assumption** is plausible but not proved by representative Core ministry
  staff or production-shaped telemetry.
- **Unresolved founder decision** is product meaning that research cannot
  silently choose.

## Executive verdict

**Option 3 is the best available choice, but only with required amendments.**

The modern pattern supported by the evidence is not “notify everyone who has a
permission.” It is:

1. establish responsibility at a stable organizational scope;
2. intersect that responsibility with current action authorization;
3. make inheritance, override, and fallback visible;
4. route only to the currently responsible people who can act;
5. support explicit, auditable handoff without transferring permissions; and
6. keep the underlying review discoverable when notification routing is empty.

GitHub explicitly says selective review assignment reduces team noise and
clarifies individual responsibility. GitLab distinguishes ownership rules from
current eligibility. HubSpot and Blackbaud separately configure designated
approvers and permissions and expose reassignment or absence handling. Microsoft
supports the understandable “any one member of this group may respond” meaning.
Those products support the general shape, not Core's exact Tenant/Site hierarchy.

The unamended phrase “Site route with Tenant fallback” remains unsafe because it
does not answer:

- whether a route is a permission group, arbitrary queue, or named
  responsibility set;
- whether the fallback is hidden, chained, dynamic, or permitted to broadcast;
- what happens when one of several Site reviewers loses access;
- whether fallback recipients are withdrawn when a Site reviewer later regains
  access;
- whether unchanged reviewers get a fresh unread item after a route edit;
- whether current open reviews follow new settings;
- whether assignment grants access;
- how a zero-recipient result differs from an authorization outage; or
- whether route changes can complete or alter the source review.

The permanent answer is therefore **Accept with required amendments**, using the
closed contract below.

## Exact recommended contract

### 1. Responsibility and authorization remain different facts

**Product judgment:** a **Website review responsibility route** is a private,
versioned Site-coordination setting that names the Tenant staff expected to
receive D20 review attention. It is not a Phase 12 role, group, capability,
permission grant, source approval, task, mailbox, notification row, or public
Site fact.

The recipient predicate is an intersection, never a union:

```text
selected recipient
  = member of the winning explicit responsibility route
  AND active in the exact Tenant/environment
  AND currently allowed to see this private Site/Plan/source projection
  AND currently allowed to perform this exact D20 review action
  AND currently inside every Phase 3/10/12 privacy and purpose floor
```

`responsible` never implies `authorized`; `authorized` never implies
`responsible`. Saving a route adds no Site membership, capability, role, source
access, approval authority, publication authority, or D16 activation authority.

### 2. V1 uses explicit named responsibility members, not permission groups

**Product judgment:** each route contains exact current Tenant-assignment
references selected by an authorized route manager. It does not expand a Phase
12 permission group, job title, role label, email list, distribution list,
arbitrary queue, external address, dynamic query, organization chart, prior
reviewer list, or AI recommendation.

This is deliberately narrower than Contentful team assignment or Salesforce
queues. Reusing a permission group as a responsibility group would couple every
access-management change to notification fan-out and make it difficult for
staff to understand why they were notified. Phase 12 also defines groups as
additive authorization bundles, not work-ownership truth.

The durable member reference must be Tenant-bound and Party/assignment-aware,
not a mutable email address, display name, raw auth user ID, or browser-supplied
recipient identity. Current authorization is still re-resolved at use time.

### 3. The route hierarchy has exactly two levels and two Site modes

The Tenant owns at most one current **Website reviewers** route. It has no
fallback.

A Site has exactly one of two current modes:

1. `inherit_tenant_website_reviewers`; or
2. `site_reviewers_with_tenant_fallback`.

The second mode contains one explicit Site reviewer route and always displays
the Tenant Website reviewers route as its only fallback. There is no
“fallback to another Site,” chained route, role fallback, creator fallback,
admin fallback, support fallback, legacy queue, or platform fallback. The
closed two-level shape makes cycles unrepresentable.

An empty/missing Site override is never overloaded to mean both “inherit” and
“override nobody.” The mode is explicit. An empty or unusable Tenant route
means no notification route; it never activates a hidden third tier.

### 4. Selection is deterministic and fail-closed

For a new D20 review-required source episode, the server-owned resolver uses:

1. the current Site route when the Site is in override mode and that route
   yields at least one completely proved current recipient;
2. otherwise, the current Tenant Website reviewer route; or
3. otherwise, a proved zero-recipient result.

If the Site route has three members and one remains currently qualified, that
Site route wins; the Tenant fallback is not added. Fallback occurs only when the
entire Site route yields proved zero current recipients. This prevents broad
double notification and preserves clear responsibility.

Resolver outage, incomplete enumeration, stale authorization, a membership
race, ambiguous visibility, or limit overflow is **indeterminate**, not zero.
It releases no partial set and does not activate fallback. It records a
privacy-safe repair condition and retries/reconciles the same semantic routing
generation.

### 5. Fallback is monotonic within one open source episode

**Product judgment:** when a Site route initially wins, it remains the selected
tier while at least one of its members is currently qualified. If it later
yields proved zero, the explicit Tenant fallback may become the successor
winning tier. Once that fallback wins, a later permission recovery alone does
not silently bounce the same open review back to the Site route.

An authorized manager may explicitly change the route and accept the displayed
open-review impact. A new D20 source episode always resolves from the current
Site mode afresh.

This one-way rule avoids notification ping-pong during permission churn and
obeys ADR-0027's prohibition on reviving an old item merely because authority
later returned. It is Core product judgment; no external source proves this
exact reducer. HubSpot's explicit reassignment and GitLab's explicit policy for
whether rule changes affect existing reviews show why Core must choose and
explain one rule rather than leave it accidental.

### 6. One source episode may have immutable routing generations

The D20 review-required condition remains one source-owned semantic episode.
Routing changes do not end, reopen, approve, or mutate it.

Recipient routing has a separate immutable generation lineage under that source
episode. A generation pins:

- Tenant, environment, Site, Plan lineage, and D20 meaning;
- the current route-mode/version and winning tier;
- the complete bounded candidate/member proof;
- the current authorization/floor revisions used for selection;
- the predecessor generation, cause, actor branch, and correlation; and
- the complete `continued`, `removed`, and `newly selected` recipient outcome.

This separation resolves a real D19 tension: member-set changes must not mutate
an already released Phase 6 occurrence, but a still-open business condition may
need a new recipient handoff.

### 7. Route changes do not re-notify unchanged reviewers

For the same D20 source episode and exact review action:

- a recipient who remains on the winning route and remains qualified keeps the
  existing item and personal engagement; no new item, unread state, toast, or
  sound is created;
- a newly selected current recipient receives one new recipient-specific item
  through an admitted successor routing generation;
- a removed or no-longer-responsible recipient immediately loses active and
  recent presentation, without fabricated read or source completion; body-free
  audit remains;
- a person removed and later re-added never has the old item revived; if the
  review is still actionable, a new successor item is required; and
- overlap between Site and Tenant routes produces one recipient outcome, not
  duplicate items.

The implementation must compile the complete current route outcome atomically.
It may represent the successor occurrence as a bounded delta only if generated
proof establishes the full current set and stable continuation mapping. It must
not append ad hoc children to an immutable released occurrence.

### 8. Route edits affecting open reviews are explicit

Before saving a route change, an authorized manager sees an impact summary:

```text
This changes review notifications

2 open Site-language reviews are affected.
Ana will begin receiving review items.
Maria will stop receiving them.
Joel is unchanged and will not be notified again.

This does not give anyone Site access and does not change any website.

[Save review route]  [Cancel]
```

The summary must be server-derived from the current route and source versions.
Save uses compare-and-swap on the route head. If the source review completes
concurrently, the configuration still saves if its route fence is current, but
the receipt truthfully says no review item was created because the review had
already ended. Optimistic UI cannot claim recipient changes before the server
commits the route version and routing effect/outbox identity.

For a Tenant-route edit that may affect many inherited Sites, the impact
preview gives bounded counts first and names only within the manager's current
visibility. It does not synchronously scan or expose every Site or recipient in
the browser. Large effects use a durable, idempotent outbox and all-or-none
generation per affected source episode; partial fan-out is never called
success.

### 9. Zero recipients is a first-class calm state

A proved zero result creates no item, does not block Plan save, and never
completes the source review. The Plan remains discoverable in the permission-
filtered **Site → Languages** workspace.

Route managers see:

```text
Review notifications aren't assigned

No currently qualified Website reviewer will receive an item for this Site.
The Plan is still available in Site → Languages and the website will not change
automatically.

[Choose Website reviewers]
```

Staff who can see the Plan but cannot manage routing see the status and safe
navigation without recipient names or a control they cannot use. People who
cannot see the Plan or route see nothing. No public, donor, missionary, email,
support, or cross-Tenant surface exposes the missing route.

### 10. Absence is explicit, never guessed

Core has no accepted presence, vacation, shift, calendar, workload, or
availability model for Site review. A responsible reviewer who is away but
still authorized remains qualified; Core cannot silently infer absence from
inactivity, local time, unread age, browser status, or another vendor's
calendar.

An authorized route manager changes responsibility deliberately. A reviewer may
be offered a plain **Ask a route manager** explanation, but D21 does not create
self-delegation, dates, out-of-office schedules, escalation timers, or recurring
reminders. Blackbaud proves that explicit out-of-office forwarding can be useful
in a mature approval product; it does not justify importing time/delegation
machinery into this undated D18 Plan.

### 11. Route management authority is separate and narrower than review

The eventual Phase 12 registry must distinguish at least the meanings “manage
Tenant Website reviewer route” and “manage this Site's reviewer route” from
“perform this review.” Exact capability identifiers belong to the later
specification/code registry, not this evidence file.

The route manager command:

- derives Tenant/environment/Site and actor attribution from validated server
  context;
- may enumerate only candidate staff the actor is allowed to discover;
- treats submitted member IDs as requested configuration, never authorization
  truth;
- rechecks same-Tenant assignment identity and current candidate eligibility;
- cannot grant itself or anyone else permission;
- records immutable before/after route versions and reason-safe audit; and
- cannot change source review, D16 activation, public Site, Giving, or finance.

Candidate search must not reveal restricted staff, hidden memberships, another
Tenant, private role details, or whether a hidden person has a particular
capability. A manager without permission to inspect individual eligibility gets
only a safe aggregate/setup result.

### 12. Route data is private, versioned, and same-scope constrained

The later data design should use immutable route versions plus one current head,
not mutable recipient arrays on Site rows. Each Tenant member edge uses
same-Tenant composite references to the current/historical Tenant assignment
and Party identity. Site route heads are same-Tenant+environment+Site bound.

Required structural behavior includes:

- `tenant_id` and environment are non-null and derived;
- one current Tenant route head per Tenant/environment/responsibility kind;
- one current Site mode/head per Tenant/environment/Site;
- route member uniqueness at the exact responsibility identity;
- no cross-Tenant/site reassignment through an allowed `UPDATE`;
- restrictive deletion while referenced, with terminal/superseded versions
  preserving history;
- indexes on current Tenant head, current Site head, member reverse lookup,
  active open-source episode lookup, and recipient applicability; and
- RLS/grants/RPCs/views/workers/service paths preserving the same predicates.

If browser roles ever receive table access, `SELECT`/`DELETE` require correct
`USING`, `INSERT` requires `WITH CHECK`, and `UPDATE` requires both. Prefer one
narrow `packages/api` mutation boundary. Browser input never supplies trusted
Tenant, actor, route tier, winner, recipient set, reviewer role, source episode,
or audit attribution.

### 13. Personal notification semantics remain ADR-0027/D19

Each selected reviewer receives an independent exact Tenant+Party+role+surface
item. One person's open/read affects only that person. Reading removes only
unread treatment; the item remains in **Needs attention** until the source review
condition ends or route applicability ends.

Completion by one currently authorized reviewer changes the source only through
the D17/D20 review command. It may end sibling items because the source episode
ended; it never marks siblings read. Assignment, item possession, click,
preview, source-page load, route edit, or another person's engagement is not
review evidence.

### 14. Scope stays deliberately small

Option 3 creates no:

- per-Plan recipient picker;
- permission, group, or role editor inside Site settings;
- nested route, route DSL, arbitrary queue, or workflow builder;
- workload, round-robin, availability, claim, escalation, due-date, or SLA
  engine;
- collective group item or shared read state;
- email, SMS, push, digest, sound, reminder, or provider fallback;
- public Page/Giving/finance fact in route or item copy; or
- automatic D16 activation or source approval.

## Repository facts that constrain D21

### Phase 12: capabilities authorize; names do not

**Verified repository fact:** Phase 12 defines `EffectiveAccess` as a
server-owned result over active Tenant assignment, capabilities, scope, and the
strictest privacy floor. Role/group names never authorize. Groups are additive
permission bundles, and current access is epoch-revocable.

**D21 consequence:** the route is responsibility metadata outside the
authorization union. It is intersected with current `EffectiveAccess`; it can
never feed grants back into it. A route reference should bind the Tenant
assignment, not a person-global identity.

### D17: the Plan creator cannot guess an assignee

**Verified repository fact:** D17-R7 forbids the Plan initiator from choosing or
inventing an assignee, approver, prior editor, email, role, or queue. Assignment
grants no source access. When no qualified owner route exists, Core shows a
truthful no-route state and creates no guessed task.

**D21 consequence:** the stable Website reviewer route is managed separately
from one Plan. The Plan action never opens a recipient picker. Creator, last
editor, prior reviewer, all admins, and the current contribution-approval pool
are forbidden fallbacks.

### ADR-0027 and D19: source, presentation, and engagement are separate

**Verified repository fact:** one source occurrence produces personal items for
exact recipients. Access is re-proved on count/list/detail/click/action/realtime
and support paths. Access loss removes presentation. Later authority cannot
revive old engagement; a separately admitted recipient-routing occurrence is
required for a handoff.

**D21 consequence:** a route edit cannot mutate an old item's recipient or read
state. Source episode identity and routing generation identity must be distinct.
Unchanged recipient continuity needs explicit proof, not a fresh broadcast.

### D20: exactly three closed review meanings, one selected at a time

**Verified repository fact:** D20 admits exactly **Current default changed**,
**Changed since review**, and **Ready to review**, with one precedence selector.
No key can be minted until D21 closes recipient routing. All use the fixed
actionable presentation policy and no external channel/task/time/public/Giving/
finance effect.

**D21 consequence:** the same route contract can be a shared resolver profile
only if each key still has an exact action-capability conjunction and privacy
fact projection. Route membership alone cannot collapse the three meanings into
a generic `plan_review_required` notification.

### Phase 17: recipient compilation is finite and atomic

**Verified repository fact:** Phase 17 requires code-owned finite resolvers,
one released occurrence only after the complete member set exists, valid zero-
member results, and fail-closed bound overflow. Producers and browsers cannot
supply mutable recipient lists or arbitrary recipient queries. The inherited
staff execution ceiling is 50 and the global occurrence ceiling is 200.

**D21 consequence:** those bounds are safety ceilings, not UX targets. Route
resolution must be complete, deterministic, and all-before-any. A route with 50
reviewers is almost certainly a configuration-quality problem even if it fits
the compiler.

### Current runtime is not precedent

**Verified repository fact:** current contribution-specific code in
`packages/api/src/admin/contribution-operations/approval-notifications.ts`
queries same-Tenant `admin`/`super_admin` profiles and creates contribution
approval notifications. Current Mission Control also has a static notification
dropdown and other feature-specific notification/task concepts. D19/D20 report
that the canonical Phase 17 Site review notification runtime is not built.

**D21 consequence:** no current generic/admin/contribution queue is a safe
implementation shortcut or evidence for broad reviewer fan-out.

## Current primary-source external findings

### GitHub: selective team routing reduces noise and clarifies responsibility

**Verified external fact:** GitHub's team code-review settings say teams can
limit notifications “to reduce noise” and “clarify individual responsibility.”
Teams may auto-assign a subset using round-robin or load balancing, and users
marked Busy are skipped. If all are Busy, the team request remains. See
[GitHub: Managing code review settings for your team](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team).

**Supports:** broad permission-wide fan-out is not required for resilience;
explicit responsibility plus a bounded recipient set can improve signal.

**Do not import:** Busy status, workload telemetry, round robin, 30-day load
history, child-team expansion, or silent system selection. Core has accepted no
availability/capacity authority and D18 rejects Plan timing.

### GitLab: ownership and eligibility are separate, and policy changes need a rule

**Verified external fact:** GitLab approval rules can name users/groups, but
eligibility depends on project/group membership. A person overlapping group and
individual rules counts once. GitLab documents that changing default approval
rules may or may not affect existing merge requests depending on whether
overrides are allowed. It also documents a concrete failure where a listed group
approver receives a `404` until the group has project access. See
[GitLab: Merge request approval rules](https://docs.gitlab.com/user/project/merge_requests/approvals/rules/)
and [GitLab: CODEOWNERS reference](https://docs.gitlab.com/user/project/codeowners/reference/).

**Supports:** responsibility configuration must be intersected with current
authorization, overlap must deduplicate, and the effect of route edits on open
reviews must be explicit.

**Do not import:** GitLab's ability for broadly eligible unassigned users to
satisfy some rules, per-review overrides, path DSL, or role-label authority.

### HubSpot: designated approvers, one/all meaning, reassignment, and mobile clarity

**Verified external fact:** HubSpot content approvals require approval
permissions and designated approvers. A requester chooses whether all selected
approvers or just one must approve. Pending approvals display their state,
approvers can be reassigned, and approval actions are available on mobile. See
[HubSpot: Approve HubSpot content](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content).

**Supports:** responsibility and permission are distinct; “any one” versus “all”
must be explicit; reassignment is a first-class recovery action; the same
meaning should work on mobile.

**Do not import:** per-Plan approver picking, required due dates, request
messages, email, broad Super Admin bypass, or HubSpot's content-publishing lock.
D17 already rejected those semantics.

### Microsoft: one group responder is understandable, but channel behavior can diverge

**Verified external fact:** Microsoft Power Automate can assign approval to
individuals or Microsoft 365 groups. With “First to respond,” one group member's
response represents the group. Microsoft also documents that group approvals do
not support every Teams notification behavior available to individual
approvals. See
[Microsoft: Request approvals from Microsoft 365 groups](https://learn.microsoft.com/en-us/power-automate/group-approvals).

**Supports:** a small responsible set where any one person may perform one
source action is understandable.

**Do not import:** one shared group approval object, email-address routing,
Teams delivery, arbitrary flow construction, or channel-specific truth. Core
still creates personal items and source-owned completion.

### Contentful: team assignment demonstrates both coverage and failure modes

**Verified external fact:** Contentful tasks can be assigned to a user or team;
all team members receive email and any member can resolve. Its API explicitly
says it does not verify that the assignee can read the underlying entry, so an
assigned person may be unable to resolve the task. Reassignment notifies old
and new assignees. See
[Contentful: Tasks](https://www.contentful.com/help/content-and-entries/tasks/)
and [Contentful: Entry tasks API](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/).

**Supports:** team coverage and reassignment need clear recipient effects.

**Concrete anti-pattern:** assignment without source access is exactly what
D21 must structurally prevent. Team assignment also demonstrates how a
seemingly simple responsibility group becomes notification-wide fan-out.

**Do not import:** a task, comments, due dates, reminder email, team-wide email,
task completion as review truth, or re-openable task state.

### Sanity: contextual assignment is useful, but D21 is not a task product

**Verified external fact:** Sanity Tasks lets staff assign work to an appropriate
team member, gives that person an inbox/email notification, attaches tasks to
content, and supports comments, mentions, due dates, resolution, and a Done
history. See [Sanity: Tasks for Sanity Studio](https://www.sanity.io/docs/user-guides/tasks).

**Supports:** named responsibility and destination context are easier to
understand than notifying every editor.

**Do not import:** arbitrary task creation, self-assignment, mentions, comments,
dates, email, or “Done.” D20 is a source-driven attention projection.

### Blackbaud: nonprofit approvals combine designated responsibility and access

**Verified external fact:** Blackbaud Payment Assistant approval tiers permit
only solution administrators or users with the approval permission to be
selected. Rules can require all, one, or a defined number. Notifications follow
the current tier rather than notifying later tiers early. Blackbaud also shows
“Needs my approval” only to designated approvers and permits an explicit
out-of-office forwarding choice. See
[Blackbaud: Approval Tiers for Payment Assistant](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html),
[Blackbaud: Edit Settings](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-expense-edit-settings.html),
and [Blackbaud: Approvals Manager](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/csrconnect-prod/content/csrc-approvals-manager.html).

**Supports:** nonprofit staff benefit from designated routes, exact permission
intersection, current-stage notification, visible thresholds, and deliberate
absence coverage.

**Do not import:** money thresholds, multi-tier approval graphs, email frequency,
out-of-office dates, or Payment Assistant semantics. D21 has one Site/Tenant
fallback and one source review action.

### Salesforce: delegation that can act but cannot find work is a warning

**Verified external fact:** Salesforce Classic approval steps can assign users,
queues, related users, or delegates and choose first-response or unanimous
approval. Current Salesforce Help documents that delegated approvers may be able
to approve yet do not see pending records in the normal **Items to Approve**
list; suggested workarounds use email or a custom list view. See
[Salesforce: Identify Assigned Approvers](https://help.salesforce.com/s/articleView?id=platform.approvals_step_approver.htm&language=en_US&type=5)
and [Salesforce: Delegated approver Items to Approve behavior](https://help.salesforce.com/s/articleView?id=000385979&language=en_US&type=1).

**Supports:** ability, responsibility, and discoverability must agree at every
surface. A fallback that can act but cannot find the item is not safe UX.

**Do not import:** queues, dynamic hierarchy fields, mutable per-request
selection, delegate email workarounds, or a separate list-view shadow state.

### W3C: route-setting feedback must be perceivable without focus theft

**Verified external fact:** WCAG 2.2's Status Messages guidance requires status
changes to be programmatically determinable; using `role="alert"` or assertive
live regions for non-important/non-time-sensitive content is a documented
failure pattern. WAI-ARIA's combobox/listbox guidance requires accessible names,
keyboard semantics, and a distinction between focus and selection. See
[W3C: Understanding Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html),
[W3C APG: Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/),
and [W3C APG: Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/).

**D21 consequence:** route save/reconciliation uses a concise polite status;
focus remains on the invoked control or moves to a validation summary only when
needed. The candidate picker cannot be a visually custom, keyboard-inaccessible
tag field. Selected state, inherited state, fallback state, and qualification
must not rely on color.

## What the evidence proves—and does not prove

### Supported strongly

- Responsibility should be explicit and separately administered from
  permission.
- Recipient selection should be narrower than every technically eligible user.
- Current authorization must be verified in addition to assignment.
- “Any one” and “all” are different user-visible meanings.
- Reassignment/handoff needs explicit current-state and audit behavior.
- Team/group assignment can produce notification noise and access mismatch.
- Empty routing must remain discoverable outside a notification channel.
- Mobile and accessible current-state presentation are part of approval UX.

### Not externally proved

- No external source establishes Core's exact Tenant Website reviewer plus Site
  override/fallback hierarchy.
- No source proves a universal ideal reviewer-count cap for nonprofit Sites.
- No source proves that Core should auto-fallback on authorization loss or use
  the one-way “do not bounce back” reducer; those are reasoned Core judgments.
- No representative Core ministry staff have validated the exact labels,
  fallback explanation, impact preview, or no-route recovery.
- No current production data proves most Tenants can reuse one route across all
  Sites or that route changes are rare.

These limits require pre-registered usability and shadow/pilot gates. They do
not justify broad fallback or leaving routing semantics undefined.

## Strongest plausible alternative

The strongest alternative is **one explicitly named Site reviewer with manual
reassignment and no automatic fallback**.

Benefits:

- clearest personal accountability;
- one recipient per episode;
- smallest resolver and settings model;
- no fallback transition or overlap cases; and
- little risk of broad notification noise.

Why Option 3 remains better for Core:

- a one-person ministry can configure the Tenant route once instead of every
  Site;
- staff departure or access loss otherwise strands the notification;
- a multi-Site ministry needs deliberate Site-specific responsibility without
  repeating unrelated permission configuration;
- the two-level hierarchy is small enough to explain and make cycle-free; and
- fallback preserves coverage without granting access or broadcasting to all
  capable staff.

Option 3 narrows to the strongest alternative naturally: a Tenant may name one
Website reviewer, and ordinary Sites may inherit that single person. The extra
model is paid for only when a Site genuinely needs different reviewers or the
primary route becomes unusable.

## Complete staff UX recommendation

### Tenant setup: configure once

Use responsibility language and disclose the permission boundary before the
picker:

```text
Website review notifications

Choose the people responsible for reviewing Site-language plans. Core checks
their Site access separately whenever a review needs attention.

Website reviewers
Maria Santos
Joel Martin

Either reviewer can receive a personal review item. Adding someone here does
not give them Site access or permission to change the website.

[Change Website reviewers]
```

The summary shows route health without pretending that Tenant-level members can
review every Site:

```text
Used by 6 Sites
1 Site currently has no qualified inherited reviewer

[Review Site coverage]
```

Counts and names are permission-filtered. “No qualified” is not shown from a
stale/partial resolver; indeterminate has its own **Could not verify** state.

### Ordinary Site: inheritance is the quiet default

```text
Review notifications

Uses Tenant Website reviewers
Maria Santos and Joel Martin

They receive review items only when they can currently open and perform the
review for this Site.

[Use different reviewers for this Site]
```

No per-Plan setup or repeated confirmation is required.

### Site override: the fallback is impossible to miss

```text
Review notifications

Site reviewers
Ana López

Fallback
Tenant Website reviewers · Maria Santos and Joel Martin

If no Site reviewer can currently perform a review, the Tenant Website
reviewers become responsible. This does not give anyone new access.

[Change reviewers]  [Use Tenant default]
```

Do not hide fallback inside a tooltip, advanced drawer, or save receipt. The
route card states the current effective tier and why.

### Candidate picker: show responsibility and eligibility separately

Each visible candidate has one selection control and, only where the manager is
allowed to know, a current qualification explanation:

```text
[x] Ana López
    Responsible for Site reviews
    Can currently review this Site

[ ] Joel Martin
    Does not currently have access to this Site
    Adding Joel here will not grant access
```

For Tenant-level setup across several Sites, avoid a misleading global “Can
review” badge. Use **Selected as Website reviewer** and a separate coverage
summary. Do not combine **Grant access** with **Add reviewer** in one action.

### Open-review impact: before, not after, save

If an open review is affected, the confirmation names the impact and repeats
the zero-public-effect statement. Unchanged reviewers are explicitly called out
as not receiving another unread item. If exact names are not visible to the
manager, show safe counts instead.

### Recipient journey

A recipient item remains D20-focused:

```text
Changed since review
hope.org · French (Canada)

The reviewed Page or navigation changed. Compare the latest version before
continuing. This Plan does not change the website automatically.

[Review changes]
```

Do not expose fallback mechanics, another reviewer's unread state, permissions,
or staff availability in the item. The destination can show **Review request
sent to Website reviewers** only when the viewer is allowed to see that routing
fact.

### Mobile, keyboard, assistive technology, and weak network

- Use Core's existing Base Maia/Base UI/Zinc design language; do not introduce
  another component system or visual dialect.
- Use native radio/fieldset semantics for the two Site modes and an accessible,
  labeled search/list selection pattern for reviewers.
- Selection, qualification, inheritance, fallback, and error state have text
  labels and icons with names; color is secondary.
- Keyboard users can search, select, remove, cancel, review impact, and save
  without pointer-only drag/reorder behavior.
- Save results are polite status messages with stable focus; route changes are
  not urgent alerts, sounds, or toasts that vanish before reading.
- On mobile, put the current effective route and consequence before the picker;
  use a full-page/sheet flow with a sticky but non-obscuring save action.
- Server-render the current route and no-route explanation. Enhanced candidate
  search may load progressively, but a weak connection never fabricates a saved
  route or hides the last confirmed configuration.
- Retry reuses the same route-version/idempotency intent. Offline changes are
  not queued optimistically as if committed.

## Edge-case matrix

| Scenario                                                  | Required permanent behavior                                                                                                                        |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant route not configured; Site inherits                | Proved zero recipients; show no-route setup to route managers; Plan remains discoverable and private.                                              |
| Site override missing members                             | Explicit mode cannot masquerade as inheritance; validation explains that Tenant fallback will be effective or no route exists.                     |
| Site route has three members; one is qualified            | Site route wins with that one person; do not add Tenant fallback recipients.                                                                       |
| Site route has zero qualified; Tenant has two             | Tenant fallback wins once; both qualified responsibility members receive personal items under the later cardinality decision.                      |
| Primary reviewer later regains access                     | Same open episode does not bounce back automatically; no old item revives. New source episode evaluates primary afresh.                            |
| One of two winning-route members loses access             | Remove only that person's presentation; keep the other person's item; do not invoke fallback while one remains.                                    |
| Last winning primary member loses access                  | Atomically end old recipient applicability and admit the explicit Tenant fallback through a successor routing generation.                          |
| Fallback also has zero qualified recipients               | Create no item; show no-route truth; never broadcast to admins/capability holders.                                                                 |
| Authorization resolver is unavailable                     | Indeterminate; no partial item and no fallback; reconcile the same generation.                                                                     |
| Same person is on Site and Tenant routes                  | One recipient outcome under the winning tier; no duplicate item or badge.                                                                          |
| Same person obtains capability through several grants     | Grants deduplicate authorization; route responsibility is one exact member identity.                                                               |
| Same person acts in genuinely distinct role contexts      | Follow the final Phase 17 recipient-role contract; never silently merge cross-role engagement.                                                     |
| Route member's email/name changes                         | Stable assignment/Party reference remains; display updates safely; identity and audit do not fork by email.                                        |
| Party merge/relink or account claim                       | Fail closed, preserve immutable audit, and require the approved Phase 12/17 identity-reconciliation path; never transfer engagement by guess.      |
| Staff membership becomes inactive                         | Immediate removal from current qualification/presentation; route settings show unavailable member to authorized managers without deleting history. |
| Staff later returns                                       | Old item does not revive; a new routing generation/item is required if responsibility and source actionability still hold.                         |
| Manager removes one of three reviewers during open review | Removed item disappears; two unchanged items/engagement remain; no new unread for them.                                                            |
| Manager replaces Maria with Ana during open review        | Preview exact effect; Ana gets one new item, Maria loses presentation, overlaps remain unchanged.                                                  |
| Manager saves while source review completes               | Route setting may save; no new review item; receipt says the review ended before reassignment.                                                     |
| Two managers edit route concurrently                      | First current CAS wins; second gets current before/after conflict and must review again; no last-write-wins recipient churn.                       |
| Tenant route edit affects many Sites                      | Show bounded impact, use durable idempotent fan-out/reconciliation, and never call a partial release success.                                      |
| Route grows past compiler bound                           | Release none for affected generation; show configuration/repair state; never truncate silently.                                                    |
| Site is suspended, retired, transferred, or inaccessible  | D20 source/applicability rules win; no item. Transfer cannot carry route members across Tenants.                                                   |
| Site is cloned/imported                                   | Do not copy personal route membership or open items by default; require same-Tenant explicit setup/inheritance and future-only episodes.           |
| Plan creator is also a routed reviewer                    | Route membership may select them only if later self-review policy permits; creator status alone grants nothing.                                    |
| One recipient reads while another completes               | Read affects only the first item; source completion ends all active sibling presentation without fabricated reads.                                 |
| Notification worker retries or events arrive out of order | Idempotent generation and member identities produce no duplicate/new unread for unchanged people.                                                  |
| Local timezone, locale, or low bandwidth differs          | Routing has no time semantics; locale affects accessible display only; server truth and retry identity remain unchanged.                           |
| Giving or financial configuration changes                 | No route, episode, recipient, copy, or public/financial effect.                                                                                    |

## Data, RLS, authorization, and concurrency hazards

### Cross-Tenant and wrong-Site attachment

**What could go wrong:** a caller supplies a Party, assignment, Site, or route
head from another Tenant; a privileged worker or `SECURITY DEFINER` function
skips the browser's constraints.

**Why it matters:** recipient names and private launch intent can leak, and the
wrong organization may receive an actionable item.

**Permanent prevention:** scope-prefixed composite keys, current Tenant context,
same-scope constraints, RLS `USING`+`WITH CHECK`, operation-correct grants,
search-path-safe definer functions, explicit service allowlists, and hostile
tests through browser, RPC, worker, cache, realtime, import, export, and support
paths.

### Assignment-as-access

**What could go wrong:** route selection updates Phase 12 groups/capabilities or
an item possession is accepted as review authority.

**Why it matters:** it bypasses the safety floor and could expose restricted
ministry/site data.

**Permanent prevention:** one-way dependency—authorization resolver feeds D21
selection; D21 never writes authorization. Every destination/action re-proves
current access independently of item possession.

### Membership churn and duplicate unread

**What could go wrong:** every route-version or permission-epoch change emits a
new item for everyone, teaching staff to ignore the bell.

**Permanent prevention:** stable source episode plus immutable routing
generations; full-set comparison; `continued` recipients retain item/engagement;
only newly selected recipients receive new items; old items never revive.

### Partial fallback

**What could go wrong:** the resolver sees zero of three Site members due to a
timeout, activates Tenant fallback, then later also releases Site items.

**Permanent prevention:** complete bounded member/authorization proof before
classifying zero; `zero`, `nonzero`, `indeterminate`, and `overflow` are a closed
result union; all-before-any release.

### Route/source race

**What could go wrong:** route save commits after review completes, producing
stale unread work; or source review acts against a route item as if assignment
were authority.

**Permanent prevention:** route command and producer command remain separate,
each uses expected versions; recipient release rechecks current source
actionability; source completion wins presentation immediately at query time;
route receipt reports current truth.

### Route-change blast radius

**What could go wrong:** editing one Tenant route synchronously locks/scans all
Sites, times out, or partially reassigns open reviews.

**Permanent prevention:** indexed reverse lookup from route head to applicable
Sites/open source episodes, bounded batches with per-episode atomicity, durable
outbox/reconciliation, one-writer generation, idempotent retries, and explicit
partial-operation reporting without partial recipient release.

## Required proof gates

1. **Responsibility is not access:** adding a currently unauthorized person to
   either route grants zero view/action and creates no item.
2. **Access is not responsibility:** ten currently capable non-route members
   receive zero items.
3. **Exact Tenant inheritance:** an ordinary Site resolves only the current
   Tenant route and visibly identifies inheritance.
4. **Exact Site override:** a usable Site route selects only its qualified
   members and does not union the Tenant route.
5. **Fallback only on proved zero:** one remaining Site recipient prevents
   fallback; complete zero activates only the disclosed Tenant route.
6. **No hidden tier:** creator, author, prior reviewer, last editor, all staff,
   all admins, support, service, AI, contribution approvers, legacy queues, and
   external addresses receive zero fallback items.
7. **Zero versus indeterminate:** empty current route yields zero; resolver
   outage/partial/overflow releases none and does not activate fallback.
8. **No automatic bounce-back:** after fallback wins, primary permission
   recovery during the same source episode creates no primary item and revives
   nothing.
9. **New episode reset:** the next genuine D20 source episode evaluates current
   Site route first again.
10. **Overlap dedupe:** one person in both routes receives one current outcome.
11. **Grant-path dedupe:** several authorization grants do not create recipient
    peers.
12. **Unchanged-recipient continuity:** route edit preserving Joel produces no
    new Joel item/unread and retains his engagement.
13. **New recipient:** an admitted Ana successor produces exactly one item with
    independent unread state.
14. **Removed recipient:** Maria loses active/recent presentation immediately,
    with no fabricated read or source end.
15. **Remove/re-add:** Maria's old item never revives; a new successor identity
    is required if the source remains actionable.
16. **Access revocation at every seam:** compile/list/count/detail/click/action/
    realtime/cache/support races deny or remove immediately.
17. **Open-review route preview:** current versioned impact identifies new,
    removed, and unchanged recipients without leaking unauthorized names.
18. **Route CAS:** two concurrent saves produce one winner and one explicit
    conflict; no lost update or mixed member set.
19. **Route/source CAS:** every ordering of route change, source completion,
    source recurrence, and worker release produces no stale active item.
20. **Atomic member release:** fault after header, after any child, before
    release, or after commit/before response exposes all current children or
    none; retry returns the same result.
21. **Bound proof:** zero, one, several, exactly-at-limit, and limit-plus-one
    route members have explicit expected outcomes; no truncation.
22. **Tenant-route blast radius:** multi-Site changes are bounded, idempotent,
    observable, and cannot hold broad locks or mix Sites.
23. **Tenant isolation:** forged route/member/Site/Plan/cursor/cache/realtime/
    support/service/import/export paths cannot enumerate or attach cross-Tenant.
24. **RLS operation matrix:** positive/negative `SELECT`, `INSERT`, `UPDATE`,
    `DELETE`, view, RPC, worker, and owner/`BYPASSRLS` paths preserve scope and
    cannot transform a permitted row into forbidden scope.
25. **Candidate privacy:** route managers see only allowed candidates and safe
    eligibility facts; hidden/restricted staff remain non-enumerable.
26. **No-route discoverability:** authorized staff can find the Plan and exact
    setup/review path without a notification; unauthorized staff learn nothing.
27. **Copy comprehension:** representative staff can explain who receives an
    item, when fallback occurs, that responsibility grants no access, and that
    the website does not change automatically.
28. **Accessibility:** keyboard, screen reader, zoom/reflow, high contrast,
    reduced motion, non-color, focus, polite status, and error-summary tests pass
    the current Core/WCAG gate.
29. **Mobile/weak network:** current route and consequence render before the
    enhanced picker; offline/retry never claims an uncommitted save.
30. **Migration:** no existing admins, groups, tasks, contribution approvers,
    old notifications, creators, or prior reviewers are inferred into routes;
    rollout starts empty/inherited by explicit bootstrap decision and creates
    only future recipient items.
31. **Audit:** route create/change/remove, fallback transition, selection
    outcome, denied mutation, and support/repair action record content-free
    trusted attribution and immutable before/after hashes.
32. **Zero effects:** every route and notification path creates zero Page,
    Navigation, host, locale, root, redirect, generation, cache, search, Giving,
    Legal Entity, Stripe, settlement, bank, receipt, ledger, or accounting
    mutation.

## Named monitors and required responses

| Signal                                                 | Threshold                                                                                                  | Owner                                  | Required response                                                                                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `site_review_route_granted_access_total`               | Any value > 0                                                                                              | Phase 12 Security                      | P0 disable route mutations/resolver, revoke widened access, assess exposure, restore capability-only authorization, replay hostile tests. |
| `site_review_route_cross_tenant_total`                 | Any cross-Tenant candidate, route edge, item, read, cache, realtime, support, worker, or audit observation | Site IAM + Security                    | P0 contain, remove presentation, assess disclosure, preserve evidence, repair constraints/RLS, requalify all isolation proofs.            |
| `site_review_route_hidden_fallback_total`              | Any recipient selected outside Site/Tenant declared routes                                                 | Site Product + Security                | Fence D20 keys, remove guessed presentation, repair resolver generation, require explicit route before re-enable.                         |
| `site_review_route_capability_only_recipient_total`    | Any capable but non-responsible recipient                                                                  | Site IAM + Phase 17                    | Stop writer, preserve evidence, remove item, repair responsibility intersection and negative fixtures.                                    |
| `site_review_route_assignment_without_action_total`    | Any recipient released without current exact view+action proof                                             | Phase 12 + Site Security               | P0 hide item, inspect exposure, repair resolver/action conjunction, re-run every authorization race.                                      |
| `site_review_route_partial_release_total`              | Any visible member from incomplete/indeterminate/overflow generation                                       | Phase 6/17                             | Stop compiler, hide partial children, preserve rows, repair atomic release, replay same generation.                                       |
| `site_review_route_overlap_duplicate_total`            | Any peer for same source episode+Party+role+surface                                                        | Phase 6/17                             | Stop writer, hide duplicate, repair overlap/dedupe, reconcile without transferring engagement.                                            |
| `site_review_route_unchanged_renotify_total`           | Any new unread/item for a continued recipient caused only by route/auth revision                           | Site Producer + Phase 17               | Pause route-change fan-out, preserve both identities, suppress peer, repair continuation mapping, rerun churn fixtures.                   |
| `site_review_route_old_item_revived_total`             | Any old item restored by permission/responsibility return                                                  | Phase 17 Security                      | Fence affected generation, remove revived item, repair successor-only logic, audit all restored recipients.                               |
| `site_review_route_fallback_bounce_total`              | Any fallback→primary change in one source episode without explicit route-manager command                   | Site Producer                          | Pause D21 routing, restore last valid winning tier, repair monotonic reducer, reconcile current episodes.                                 |
| `site_review_route_removed_presentable_total`          | Any removed/no-longer-responsible recipient retaining active/recent presentation                           | Site IAM + Phase 17                    | Hide immediately, inspect route generation lag, repair query-time applicability and reconciliation.                                       |
| `site_review_route_no_route_false_zero_total`          | Any zero classification later proved partial/ambiguous/outage/overflow                                     | Site Platform                          | Fence fallback, reconcile original generation, repair complete-set proof; never widen audience.                                           |
| `site_review_route_reassignment_lag_seconds`           | Missing registered SLO or p95 above the pre-registered pilot SLO while source remains actionable           | Site Platform                          | Pause cohort expansion, inspect outbox/index/locks, improve without weakening current auth or atomicity.                                  |
| `site_review_route_recipients_per_episode`             | Missing pre-registered usability bound or pilot percentile above it                                        | Site Product + UX                      | Review route sizes/comprehension, improve setup and deliberate selection; do not silently truncate or raise compiler bounds.              |
| `site_review_route_no_route_rate`                      | Missing pre-registered pilot threshold or cohort rate above it                                             | Site Product                           | Inspect setup, churn, and permission mismatch; improve one-time setup/recovery without broad fallback.                                    |
| `site_review_route_tenant_edit_affected_episode_count` | Any edit exceeds its preflight bound without explicit impact acknowledgement                               | Site Product + Platform                | Block save, require reviewed bounded impact, batch safely; do not perform hidden mass reassignment.                                       |
| `site_review_route_candidate_privacy_violation_total`  | Any hidden candidate/name/capability fact exposed                                                          | Phase 12 Security                      | P0 contain, assess disclosure, repair enumeration/projection, re-run uniformity oracle.                                                   |
| `site_review_route_resolver_p95_ms`                    | Missing registered budget or p95 over budget in the registered window/sample                               | Site Platform                          | Keep keys Reserved/pause rollout, optimize indexes/batching without cached authority or partial fallback.                                 |
| `site_review_route_comprehension_gate`                 | Missing pre-registered study or result below its registered threshold                                      | Site UX Research                       | Keep keys Reserved, revise copy/IA, repeat the same protocol before rollout.                                                              |
| `site_review_route_public_financial_effect_total`      | Any public/content/Giving/financial effect                                                                 | Site Runtime + Giving/Finance Security | P0 contain, preserve receipts, restore owner truth, remove coupling, requalify zero-effect suite.                                         |

Numeric experience/SLO thresholds are not established facts. They must be
registered before pilot data is observed; “missing threshold” itself blocks
Reserved→Live so teams cannot choose a favorable number afterward.

## Rollout and upgrade guidance

1. Land the governing Site/Plan, Phase 12 authorization, Phase 6/17 occurrence,
   and ADR-0027 presentation foundations first.
2. Specify immutable route heads/versions, closed modes, member identity,
   reducer, routing generations, current-auth intersection, and exact D20
   action capability per key.
3. Add data constraints/RLS/grants/indexes and route-management commands with no
   item presentation.
4. Build route setup/read-only effective-route UX and no-route discovery in
   Base Maia, including accessibility and low-bandwidth proof.
5. Shadow current route resolution and routing-generation diffs. Release no
   items and infer no members from existing roles/admins.
6. Mint all three D20 keys as Reserved in one generated manifest only after the
   remaining D22 responsibility meaning and self-review policy close.
7. Prove all gates, then pilot a bounded cohort with registered comprehension,
   route-size, no-route, latency, and noise thresholds.
8. Enable one writer. Rollback stops new routing generations and hides unsafe
   presentation but preserves route/source/occurrence/audit history; repair
   rolls forward rather than destructively rewriting recipients or engagement.

Mixed-version deployments must fail closed. Old code may read existing route
heads only if it understands the exact generation; it cannot write a newer
mode. New code encountering an older/incomplete schema keeps D20 keys Reserved.
No rollback may re-enable a legacy queue or broadcast.

## Founder-ready next decision recommendation

The selected route still needs one genuine product meaning: **when a route
names several people, are they co-responsible, ordered backups, or all required?**

### Recommended D22 answer

**Option 2 — one or a deliberately small set of co-responsible reviewers; any
one may complete the source review.**

Why this is the best fit:

- one reviewer gives a small ministry unmistakable accountability;
- adding a second named co-reviewer provides absence resilience without a
  calendar, timer, presence model, or hidden escalation;
- all selected reviewers receive personal items, so nobody relies on a shared
  queue;
- the first valid source command ends the review for everyone, while personal
  read state remains independent;
- it does not invent ordered backup transitions or multiple-approval source
  state; and
- the UI can plainly say **Either reviewer can complete this review**.

The picker should default to one selected person and encourage a small,
deliberate set. The exact initial product cap is not proved by vendor precedent;
it must be code-owned, safely below Phase 17's 50-person execution ceiling, and
fixed before Live using the registered pilot evidence—not tenant-configurable.

### Options the founder should see

1. **Exactly one reviewer per route.** Clearest ownership and least noise, but a
   single departure or access loss immediately invokes fallback/no-route.
2. **One or a small co-responsible set; any one can review — recommended.** Best
   balance of clarity and resilience; every selected person receives an item.
3. **One primary plus ordered backups activated by explicit handoff.** Clear
   escalation order, but adds another routing state machine and does not solve
   unreported absence.
4. **Every named person must review.** Strongest consensus, but creates a new
   multi-approval source workflow, more delay, and brittle absence behavior.

Concrete staff example:

> Hope Ministries normally names Maria alone. For its multilingual Site, it
> names Maria and Ana because either understands the public-language impact.
> Both receive the same review-required episode as personal items. Maria opens
> hers; only Maria's unread state clears. Ana completes the current source
> review first; the source condition ends, so both items leave **Needs
> attention** without pretending Maria reviewed it.

The next Grill question should ask the founder to choose or amend one of those
four meanings and should recommend Option 2 explicitly. A later question must
also resolve whether the Plan creator may perform the review when they are a
stable route member and currently authorized; D21 must not infer a self-review
rule from route membership.

## Evidence limits and validation plan

- **Assumption:** most small ministries can reuse one Tenant Website reviewer
  route across most Sites. Verify with representative one-Site and multi-Site
  ministries before Live.
- **Assumption:** explicit route edits are rare enough that one impact preview
  and idempotent handoff are less burdensome than an availability engine.
- **Assumption:** “Website reviewers,” “Site reviewers,” “Fallback,” and “Review
  notifications aren't assigned” are understandable across ministry roles and
  languages. Test, do not assert.
- **Unknown:** final reviewer-count cap, open-review reassignment frequency, and
  acceptable no-route rate. Register pilot thresholds before observing data.
- **Unknown:** exact Site review/route-management capability identifiers and
  recipient role code. Mint them only in the Phase 12/17 registries with complete
  proof.
- **Unknown:** whether self-review is accepted for this nonfinancial but public-
  impacting operation. It requires a founder ruling reconciled with D16.

## Source index

### Repository sources

- [ADR-0027 — one notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [Phase 12 — role and permission configuration](./phase-12-full-role-permission-configuration.md)
- [Phase 17 — System Messages and Template Management](./phase-17-system-messages-template-management.md)
- [Phase 17 executable manifest](./phase-17-system-message-executable-manifest.md)
- [D17 — private Default Site Locale Plan](./phase-24-d17-private-default-site-locale-plan-adversarial-review.md)
- [D19 — state-driven Needs attention item](./phase-24-d19-state-driven-plan-attention-adversarial-review.md)
- [D20 — every review-required episode](./phase-24-d20-every-review-required-episode-adversarial-review.md)
- [Earlier D21 recipient-routing research](./phase-24-d21-review-recipient-routing-primary-research.md)
- `packages/api/src/admin/contribution-operations/approval-notifications.ts`

### Primary external sources

- [GitHub team code-review settings](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team)
- [GitLab merge-request approval rules](https://docs.gitlab.com/user/project/merge_requests/approvals/rules/)
- [GitLab CODEOWNERS reference](https://docs.gitlab.com/user/project/codeowners/reference/)
- [HubSpot content approvals](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
- [Microsoft group approvals](https://learn.microsoft.com/en-us/power-automate/group-approvals)
- [Contentful Tasks](https://www.contentful.com/help/content-and-entries/tasks/)
- [Contentful Entry Tasks API](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
- [Sanity Tasks](https://www.sanity.io/docs/user-guides/tasks)
- [Blackbaud Payment Assistant approval tiers](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html)
- [Blackbaud expense settings and out-of-office forwarding](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-expense-edit-settings.html)
- [Blackbaud Approvals Manager](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/csrconnect-prod/content/csrc-approvals-manager.html)
- [Salesforce assigned approvers](https://help.salesforce.com/s/articleView?id=platform.approvals_step_approver.htm&language=en_US&type=5)
- [Salesforce delegated-approver discoverability behavior](https://help.salesforce.com/s/articleView?id=000385979&language=en_US&type=1)
- [W3C WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [W3C APG combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [W3C APG listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)

## Final research judgment

The selected Option 3 is consistent with Core and modern practice when it is a
small, explicit responsibility layer over—not inside—the authorization system.
Its value is not that fallback guarantees a human will act. Its value is that
staff can see who is expected to act, receive one useful in-product item, change
that responsibility safely, and recover from an empty route without granting
access or broadcasting private work.

The decision must be rejected if implementation substitutes a permission group,
dynamic queue, all-admin fallback, shared item, timer, email, mutable recipient
array, or per-Plan assignee picker. With the amendments in this appendix, it is
the smallest durable model that serves both a one-person ministry and a
multi-Site organization without notification noise, hidden authority, or a
general workflow engine.
