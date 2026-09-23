# Phase 24 D21 Explicit Review Responsibility Routing — Adversarial Review

> **Subsequent D29 reconciliation (2026-08-28):** D29 now accepts one distinct
> **Website review follow-up route** with one to three explicit Review
> coordinators, current authorization intersection, and no D21/inviter/admin/
> capability inference. Any statement below that calls D29 “next,” “pending,”
> or “unresolved” records the earlier dependency state and is superseded by the
> [D29 adversarial review](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md).

> **Subsequent IA reconciliation:** D26/D29 place this D21 card under
> **Settings → Websites → Reviews** with the card label **Review
> notifications**. It still covers all three D20 meanings: Ready to review,
> Changed since review, and Current default changed. The narrower path/title
> examples below are historical UI evidence, not the final page hierarchy.

Decision date: 2026-08-28  
Research date: 2026-08-28  
Decision status: **Accepted with required amendments**  
Founder choice: **Option 3 — explicit Site/Tenant reviewer routes with one
visible fallback**

## Purpose and scope

This document finishes the D21 `/grill-with-docs` decision. It determines how
Core routes the three D20 private review-attention meanings when several people
could perform the action. It pressure-tests the founder's Option 3 against the
current Core repository, accepted Phase 24 decisions, ADR-0027, Phase 12 and
Phase 17 contracts, current implementation seams, current primary sources, and
the requested 22 adversarial categories.

This is decision evidence and a normative product contract for the later
PRD/OpenSpec/design/manifest workflow. It is **not** a schema migration,
runtime implementation, capability-manifest edit, OpenSpec change, ticket,
commit, or authorization to stage files. It does not mint or activate a Phase
17 key. D22 now closes route cardinality/completion, D23 closes the proportional
source-owned independence floor, and D24 closes the protected-participant
predicate by excluding every source-defined substantive participant in the
complete exact protected-candidate lineage. D25 now closes recovery through
[source-authorized candidate-scoped external review](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md),
governed by
[ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md).
D26 now closes that external option's three-state, narrow-only Tenant/Site
availability posture. D27 now closes one source-owned internal/external
responsibility lane with deliberate takeover. D28 now closes explicit decline/
expiry next-lane recovery; D29 next decides its bounded recovery-responsibility
route. Affected keys still require synchronized
implementation proof before minting or activation.

## Executive result

### Final disposition

**Accept with required amendments.**

Option 3 is the strongest permanent direction because it separates two facts
that must not be confused:

- **responsible** — the ministry deliberately chose this person to receive
  Website review attention; and
- **authorized** — Core currently proves this person may see the private Plan
  and perform the exact review action.

The unamended phrase “reviewer routes with fallback” is too loose to implement
safely. It could become a hidden broadcast, grant access accidentally, flap
between routes, re-notify unchanged people, strand an open review, or expose
staff names across a restricted Site. The amendments below close those risks
without creating a general assignment, workflow, scheduling, or escalation
engine.

### Exact corrected decision to record

> **D21 — Explicit Default Site Locale Plan review responsibility routing.**
> Core SHALL route each D20 review-required episode through one closed,
> code-owned Plan review responsibility hierarchy. An ordinary Site inherits
> the current Tenant **Website reviewers** route. An authorized route manager MAY replace
> that inheritance with a Site **Site reviewers** route and SHALL see and save
> one explicit coverage choice: **Use Tenant Website reviewers if no Site
> reviewer can currently act** (the recommended default) or **Send no review
> notification**. No other fallback exists.
>
> A route records responsibility only. It grants no Tenant membership, Site or
> Plan visibility, role, capability, source access, approval power, or public
> authority. At routing time, the server derives Tenant, environment, Site,
> actor, source episode, route revision, and fixed recipient-role contract from
> trusted context; it intersects the first applicable explicit route with
> current exact Plan-view and review-action authorization. The browser may
> request a governed route configuration using same-Tenant Active Tenant
> Assignment identities, which the server binds to stable Party identity, but
> no Plan creator, caller, item, cache, worker, or legacy table may supply the
> episode's resolved recipients.
>
> A Site route wins when at least one member is proved currently qualified. The
> Tenant fallback is considered only when the Site route is proved to have zero
> qualified members and fallback was explicitly saved. A partially qualified
> Site route remains the winner; indeterminate, timed-out, truncated, stale, or
> limit-exceeded resolution is never treated as zero and never widens the
> audience. An inherited Site uses only the Tenant route. If the applicable
> hierarchy proves zero qualified recipients, Core creates no item, guesses no
> person, and leaves the source-owned review fully discoverable and performable
> in **Site → Languages** by currently authorized staff.
>
> The winning route and its complete selected recipient set are frozen for the
> current routing leg. It does not switch back merely because a higher-priority
> route later regains qualification. It re-resolves only when the selected set
> becomes proved empty, an authorized manager invokes an explicit current-
> review handoff against the saved route, or a later D20 episode begins. This prevents route flapping while
> preserving explicit handoff and fresh next-episode ownership.
>
> Route configuration is prospective by default. Saving new reviewers does not
> silently reassign an already open review. When an authorized manager can see
> affected open reviews, Core separately offers an explicit, impact-previewed
> **Use these reviewers for current reviews too** command. Automatic proved
> loss of every current recipient may also invoke the already declared
> fallback. Those admitted current-review changes use differential handoff:
> unchanged exact Party+recipient-role recipients retain their existing item
> and engagement and are not notified again; removed but still source-
> authorized recipients receive the once-set presentation-end reason
> `responsibility_reassigned`, leave **Needs attention**, and retain authorized
> non-unread **Reassigned** Recent history under ADR-0027's 90-day policy;
> access loss removes presentation entirely; and newly selected recipients receive one unread item through a
> successor, producer-authorized routing occurrence. No engagement, actor
> attribution, or responsibility history transfers. Source completion ends
> every applicable sibling item; notification engagement never completes the
> review.
>
> Core SHALL NOT fall back to every authorized person, every admin, every
> capability holder, the Plan creator, prior reviewer, last editor, Page or
> Communications owner, support, service role, platform operator, AI, provider,
> contribution approver, generic task queue, or legacy notification table. It
> SHALL NOT infer absence, schedule a fallback, send recurring reminders or
> email by default, or block review because no notification route exists.
>
> This route applies only to D20 private Website review attention. It has no
> public Site, locale route, Page, Navigation, Communications, Giving, Legal
> Entity, Stripe, settlement, bank, currency, or accounting effect.

### Plain-language meaning

Core lets a ministry say “these are the people who normally handle Website
reviews,” once for the Tenant and only differently for Sites that need it.
Core still checks permission every time. If nobody on the deliberate route can
act, Core either uses the one fallback the manager saw and chose or sends no
notification. It never guesses or tells everyone.

## Evidence classification and confidence

- **Verified repository fact** — directly established by an accepted Core ADR,
  governing OpenSpec requirement, completed Phase 24 decision, root glossary,
  or current source.
- **Verified external fact** — directly established by current first-party
  standards or product documentation.
- **Product judgment** — the permanent Core choice after reconciling those
  facts; it is not claimed as a universal industry rule.
- **Assumption** — plausible but not yet proved with representative ministry
  staff or production-shaped Core data.
- **Resolved subsequent decisions** — route cardinality/completion was
  intentionally isolated for D22, and D23 now owns the proportional review-
  independence floor. D24 now owns the closed every-substantive-participant
  predicate; D25 now closes the remaining no-internal-reviewer recovery. D26
  closes the bounded three-state availability posture, and D27 closes one
  source-owned responsibility lane with deliberate takeover. D28 now closes
  explicit decline/expiry next-lane recovery; D29 next decides its bounded
  recovery-responsibility route.

Confidence is **high** for the safety boundaries, closed hierarchy, current-
authorization intersection, personal item identity, zero-recipient behavior,
and no hidden fallback because the repository already governs them. Confidence
is **medium** for labels, settings placement, and the assumption that a Tenant
default serves most small ministries; those require representative usability
proof. D22 now fixes one deliberately chosen person by default and at most three
unordered co-responsible people; D23 selects the source-owned proportional
independence floor; and
[D24](./phase-24-d24-every-substantive-participant-adversarial-review.md)
excludes every source-defined substantive participant in the complete exact
protected-candidate lineage. D25–D28 are closed; D29 is the next founder
decision.

## What was verified

### Governing repository facts

1. Root `CONTEXT.md` defines a Site as public presentation and attribution
   only; D21 cannot choose or own Giving or financial identity.
2. D17-R7 forbids the initiator from inventing an assignee, approver, prior
   editor, address, role, or queue; assignment grants no source access, and an
   absent route must be stated honestly.
3. D18 stores no Plan target date and introduces no Plan reminder, expiry,
   schedule, or escalation clock.
4. D19 and ADR-0027 require personal Tenant+Party+role+surface items and
   engagement, current authorization on every presentation/action seam, no
   shared read state, no revival after access loss, and a producer-authorized
   successor occurrence for a meaningful handoff.
5. D20 permits exactly three review-required episode meanings and makes source
   actionability—not notification state—the authority.
6. Phase 12 makes capabilities and EffectiveAccess authoritative; labels,
   responsibility, item possession, and cached booleans do not authorize.
7. Phase 17 requires one finite, versioned, server-owned resolver, atomic
   all-before-any bounded fan-out, provable zero, immutable recipient intents,
   and no caller-supplied recipient query. Its 50-staff bound is an execution
   ceiling, not a desirable route size.
8. Platform principles put tenant safety and permission correctness ahead of
   convenience, favor one shared behavior over duplicate business logic, and
   require clarity, accessibility, and fast normal journeys.
9. Current contribution approval notification fan-out to Tenant admins and
   super-admins is a contribution-specific legacy/current seam, not an accepted
   Website routing model. Current Mission Control assignments and notification
   tables likewise are not substitutes for the future Phase 17 contract.

### Current external primary-source findings

- GitHub documents team review controls designed to reduce notification noise
  and clarify individual responsibility; it also exposes explicit reviewer
  assignment and a Busy status rather than treating permission as perpetual
  responsibility.
- GitLab documents that being named through an approver group still does not
  guarantee access to the underlying merge request; direct membership and
  underlying access remain separate, and duplicate individual/group
  qualification counts once.
- HubSpot documents designated content approvers, **Just one approver** versus
  **All approvers**, mobile approval, and explicit reassignment. This proves
  that responsibility, completion threshold, and handoff are separate choices.
- Microsoft Power Automate likewise exposes **First to respond** versus
  **Everyone must approve** and explicit delegation policies. Core imports the
  need to state completion semantics, not its timers or workflow engine.
- Contentful permits tasks for a person or team and documents a dangerous seam:
  its task API does not itself prove that an assignee can read the entry. Core
  uses that as negative evidence for mandatory authorization intersection.
- W3C WCAG 2.2 requires keyboard operation, visible/unobscured focus, reflow,
  text-identified errors, programmatic status messages, and at least AA target-
  size behavior; Core's frontend rules intentionally use 44×44 CSS-pixel
  controls.

These sources demonstrate available patterns, not one universal nonprofit
answer. They do **not** prove an exact route size, that automatic fallback is
always desirable, that unchanged recipients should be notified again, that
Core can infer leave/availability, or that Core should import due dates,
reminders, email, sequential approvals, load balancing, or a generic task
product.

## Best staff journey and interface contract

### 1. Small ministry: set it once

Tenant settings contain one compact card at **Settings → Websites → Review
notifications**:

```text
Website review notifications

Choose who normally handles final Website reviews.

Website reviewers
Maria Santos, Joel Martin

This setting sends review attention. It does not give anyone access or
permission. Core checks access again for every review.

[Change reviewers]
```

Below the field, Core shows a factual coverage summary, never a green promise:

```text
Used by 18 Sites · 2 Sites use their own reviewers
```

The normal prospective save is always one step: **Save reviewers**. When open
reviews exist, the result separately offers **Review current assignments**; it
does not turn the settings form into a wizard. No due date, priority, email
setting, typed phrase, or per-Site repetition appears.

### 2. Ordinary Site: inheritance is obvious

At **Websites → hope.org → Languages → Review notifications**:

```text
Review notifications

● Use Tenant Website reviewers (recommended)
  Maria Santos, Joel Martin

○ Choose reviewers for this Site

This changes who receives private review attention. It does not change the
website, publish a language, enable Giving, or change anyone's permissions.
```

The inherited names are visible only to a viewer authorized to enumerate that
route. Everyone else receives a privacy-safe status, not names.

### 3. Site with different ownership: override plus explicit coverage

Choosing **Choose reviewers for this Site** progressively reveals the picker
and one closed fallback choice:

```text
Site reviewers
Ana García

Coverage if no Site reviewer can currently review
● Use Tenant Website reviewers (recommended)
○ Send no review notification

Core uses fallback only when it can prove that no Site reviewer can open and
complete the review. A system error never widens the audience.

[Save Site reviewers]
```

People results use the repository's accessible combobox/listbox primitives.
They show Unicode names and unambiguous text status such as **Can receive Site
reviews** or **Cannot currently receive—access unchanged**. Color, avatar,
flag, job title, or route membership alone is never the status. The picker
enumerates only same-Tenant active assignments the current route manager may
see. A currently unqualified person may still be named as responsibility
intent after a clear warning, but receives nothing until independently
authorized. Existing members who lose eligibility remain visible to authorized
managers with repair guidance, never silently removed from history. Tenant-
level setup does not pretend one person is qualified for every Site.

### 4. Prospective save plus explicit current-review handoff

The ordinary route save affects future D20 episodes and says so plainly. When
open reviews exist and the manager may see them, the same page offers a
separate current-review action rather than silently changing current work:

```text
New reviewers saved

2 reviews are already waiting. They still use their current reviewers.

[Review current assignments]
```

Choosing that action opens the fresh, privacy-filtered impact preview:

```text
Use the new reviewers for 2 current reviews?

Newly notified: Ana García
No longer responsible: Maria Santos
Unchanged: Joel Martin — will not be notified again

This changes private review notifications only. It does not change a website
or anyone's permissions.

[Update 2 current reviews]  [Keep current assignments]
```

For a Tenant route change, the summary distinguishes inherited Sites, Site
overrides, fallback routes currently in use, hidden/unauthorized detail, and
unaffected Sites. Counts come from a fresh server impact preview bound to
expected route/source fences. Stale previews block only the handoff with a
concise refresh path; the already saved prospective route remains truthful.
Core does not ask for a typed confirmation phrase or make staff edit each Site.
The contextual no-route repair journey may combine **Save reviewers and notify
this current review** only when that immediate effect is explicitly labeled.

### 5. Recipient journey

Maria receives the D20 item already specified by D20:

```text
Ready to review
hope.org · French (Canada)

French (Canada) became ready for final review.
This Plan does not change the website automatically.

[Review planned change]
```

The card does not expose route logic. The destination may show a quiet line
for authorized recipients who ask “why me?”:

```text
Sent to you through: Tenant Website reviewers
```

Opening clears Maria's unread state only. It does not claim the review, hide
Joel's card, or complete work. D22 permits several unordered co-responsible
people, so the destination states in plain language that any one may complete
the source review.

### 6. No-route and degraded states

If no applicable member is currently qualified, authorized route managers see:

```text
Review notifications need setup

No selected reviewer can currently receive this Site's review notifications.
Authorized staff can still review the Plan in Languages.

[Set up reviewers]
```

A current reviewer without route-management authority sees the truthful first
two sentences and **Review planned change**, but not the people picker or names
they may not enumerate. A user who cannot see the Plan sees no Plan or routing
state. An indeterminate resolver says **Review notification status is
temporarily unavailable** and never pretends the route is empty or invokes
fallback.

No separate bell item, recurring reminder, email, support ticket, or developer
repair is created merely to report an empty route; that would reopen the same
recipient problem one level higher.

### 7. Accessibility, mobile, and low-bandwidth requirements

- Use Base Maia, shared `@asym/ui`, Zinc tokens, native form semantics, and
  approved Base UI primitives; no parallel design system or decorative motion.
- Every control and picker target is at least 44×44 CSS pixels, keyboard
  operable, screen-reader named, and visibly focused without being obscured.
- Selection, inherited/override state, current qualification, warning, save
  result, and changed impact count are conveyed in text and programmatic state,
  never color alone.
- The form reflows at 320 CSS pixels and 400% zoom without horizontal task
  scrolling; long names, CJK, combining marks, RTL layout, and 200% text spacing
  do not truncate the decisive status or action.
- Errors are attached to the affected field and summarized at the form start;
  focus moves predictably only after submit, and live status uses restrained
  programmatic announcements.
- The settings summary loads before avatars and nonessential metadata. A weak
  connection can save through an idempotent command receipt; retry never makes
  duplicate route revisions or duplicate recipient items.
- Staff can configure and repair on mobile, but no swipe, drag, hover, or
  desktop-only interaction is required.

## Closed route-resolution contract

### Inputs and result union

The resolver's trusted inputs are the current Tenant/environment/Site, D20
source episode and exact next action, applicable route-head revisions, current
Party bindings, fixed contract recipient role, EffectiveAccess/access epoch,
and registered execution bounds. The caller never supplies the source episode,
winning route, action capability, recipient role, or resolved member set.

The result is a closed union:

1. **released** — one complete, bounded, canonical selected set and its proof;
2. **released-zero** — every applicable route was completely evaluated and no
   qualified member exists; or
3. **indeterminate** — any dependency, bound, freshness, or authorization proof
   is incomplete.

Only **released-zero** may consider the explicitly configured Tenant fallback.
**Indeterminate** is not zero. Limit-plus-one is not a smaller valid set.

### Precedence and stability

| Site mode                   | First candidate                  | Second candidate                                     | Final outcome               |
| --------------------------- | -------------------------------- | ---------------------------------------------------- | --------------------------- |
| inherits                    | current Tenant Website reviewers | none                                                 | released set or proved zero |
| Site override + fallback    | current Site reviewers           | Tenant Website reviewers only after proved Site zero | released set or proved zero |
| Site override + no fallback | current Site reviewers           | none                                                 | released set or proved zero |

A candidate with at least one qualified member wins even if other configured
members are currently unqualified. That prevents broad fallback from joining a
partially healthy primary route. The selected set is frozen for the routing
leg. Qualification gains do not append members; losing some selected members
does not re-resolve while at least one remains. A proved empty selected set
opens a successor leg from the same hierarchy. Once fallback wins a leg,
primary recovery waits for the next D20 episode unless a route manager
explicitly revises the route. This is the smallest deterministic anti-flapping
rule.

### Differential handoff table

| Event while source episode remains open                                    | Unchanged selected recipient            | Removed recipient                                                     | Newly selected recipient                                        |
| -------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| prospective route configuration save                                       | keep item and engagement; no new unread | unchanged for the current review                                      | none; saved route applies to future episodes                    |
| explicit current-review handoff against saved route                        | keep item and engagement; no new unread | end active responsibility; Recent says Reassigned if still authorized | successor routing occurrence; one new unread item               |
| selected member loses exact access, another remains                        | keep                                    | presentation removed for access loss                                  | none                                                            |
| selected set becomes proved empty and fallback/same route finds new member | none unless overlapping exact identity  | old items end or disappear by access                                  | successor routing occurrence; one new unread item               |
| higher-priority route later regains access while current leg is healthy    | keep current leg                        | none                                                                  | none until next episode or explicit revision                    |
| source review completes concurrently                                       | end from source truth                   | end/disappear                                                         | no badge debt; any losing write immediately observes source end |

The successor occurrence contains the complete newly admitted delta for that
handoff meaning and releases all-before-any. The full current route resolution
and previous/new set digests remain durable routing evidence. Existing items
are never mutated to a new Party, role, route, source, or engagement state.

## Source of truth, ownership, and invariants

| Fact                                   | Authoritative owner                               | Derived/useful projection     | Forbidden authority                    |
| -------------------------------------- | ------------------------------------------------- | ----------------------------- | -------------------------------------- |
| D20 episode, actionability, source end | Site locale-plan/readiness producer               | notification applicability    | item, read state, route                |
| current ability to view/act            | Phase 12 PDP + source policy                      | qualified-route proof         | responsibility, label, item possession |
| Tenant/Site responsibility choice      | typed Site-management route owner                 | settings summary              | capability or source review            |
| winning routing leg and selected set   | generated Phase 17 resolver + producer occurrence | personal items                | browser, creator, cache, legacy task   |
| personal presentation/engagement       | Phase 17 Tenant+Party+role+surface model          | bell, Needs attention, Recent | shared team row, review completion     |
| review outcome                         | D17 source command at current expected fence      | notification end              | read, click, route save                |
| public/default/giving/finance truth    | existing Site/Giving/finance owners               | static Unchanged copy         | D21 route or notification              |
| route-change audit                     | append-only route revision/command receipt        | staff history                 | mutable settings row or logs only      |

Required invariants:

1. Responsible never implies authorized; authorized never implies responsible.
2. Exactly one closed route mode applies to one Site at one route head.
3. A Site override has exactly one closed fallback value: Tenant route or none.
4. Route members, Site, Tenant, environment, route revision, and current head
   cannot cross scope; foreign relationships preserve Tenant/environment.
5. The route-management command derives actor and scope from trusted server
   context, validates every requested same-Tenant active assignment, and cannot
   grant access.
6. The notification resolver—not the route editor—derives the complete current
   recipient set and fixed recipient role for an episode.
7. Proved zero, partial qualification, and indeterminate resolution are three
   different states; only proved zero advances to explicit fallback.
8. One routing leg is stable until source end, explicit applicable route
   revision, or proved loss of every selected recipient.
9. One exact recipient retains at most one active item for the same D20 source
   episode and action meaning, even across route overlap and handoff.
10. Unchanged recipients never receive a new unread item solely because route
    configuration changed around them.
11. Removed/new recipients never inherit or transfer engagement, actor history,
    or another Party's item.
12. Notification absence, presence, read, reassignment, fallback, or failure
    neither blocks nor completes source review.
13. Site clone, import, template, transfer, and environment copy never copy
    named Site reviewers implicitly; a new Site inherits its destination
    Tenant route unless an authorized manager explicitly chooses otherwise.
14. Site retirement prevents future routing while preserving body-free route
    and item history under governing retention.
15. D21 has zero public, Giving, Legal Entity, Stripe, settlement, bank,
    currency, accounting, Page, Navigation, or Communications authority.

## Database, RLS, and mutation requirements

The later design may choose exact names, but it must preserve this conceptual
shape rather than a mutable JSON settings blob or generic assignment engine:

- one typed, append-only Tenant/Site Website-review route revision lineage;
- one current-head pointer per exact Tenant+environment+scope;
- immutable Party membership rows for each route revision;
- one closed inheritance/override/fallback value rather than arbitrary rules;
- immutable route-change command receipt and body-free audit attribution; and
- Phase 17 occurrence/item/engagement records remain separate owners.

Required relational safeguards:

1. UUID primary keys follow repository convention; human slugs/names never key
   relationships.
2. Tenant/environment are present on every route/head/member relation needed to
   enforce scope. Composite or application-validated same-scope relationships
   prevent a Site or Party from another Tenant/environment.
3. Check constraints make scope combinations impossible: Tenant route has no
   Site; Site mode references exactly its own Site; fallback is admitted only
   for a Site override; inherited mode has no Site-member revision.
4. Unique constraints/partial indexes admit only one current head for each
   exact route scope and no duplicate Party in one revision.
5. Foreign-key/restrictive delete behavior preserves historical route,
   occurrence, item, and actor evidence. Party deactivation or privacy-erasure
   posture uses the repository's identity/tombstone contract; cascade never
   transfers or erases business evidence accidentally.
6. Indexes cover current route lookup, revision members, reverse Party impact,
   inheriting Sites, fallback-in-use Sites, active D20 dependency lookup, audit
   pagination, and outbox/receipt reconciliation. Composite order follows
   equality filters before stable keyset order; partial indexes target truly
   sparse current/active subsets.
7. No cross-schema Payload foreign key or copied CMS permission/status is
   introduced. Application validation and expected fences preserve ADR-0029
   boundaries where required.

RLS and privilege requirements:

- Browser roles receive no direct write grant on route revisions, heads,
  memberships, routing occurrences, items, or audit. All business writes cross
  a `packages/api` command boundary.
- `USING` and `WITH CHECK` enforce current Tenant/environment, Site visibility,
  exact route-management capability, admitted scope transition, and same-
  Tenant Party membership. An allowed update cannot change Tenant, Site, route
  kind, actor, or current-head ownership into a forbidden state.
- Server commands derive Tenant, environment, actor Party/role, and audit
  attribution from authenticated context. Caller-supplied `tenant_id`, actor,
  capability, route revision, qualified status, recipient role, or resolved
  recipient set is rejected/ignored. Requested member Party IDs are intent
  only and are re-proved same-Tenant, active, visible-to-manager, and unique.
  Current Site/action qualification is shown separately and re-proved at use;
  it is not a hidden prerequisite for recording responsibility intent.
- Any `SECURITY DEFINER` helper has schema-qualified objects, empty controlled
  `search_path`, least privilege, revoked public execution, and explicit
  positive/negative pgTAP proof. Owner, service role, worker, support,
  impersonation, RPC, view, cache, realtime, and export paths pass the same
  authorization poison matrix.
- Route reads are purpose-specific: route managers can manage; a selected
  recipient may see only the safe “why me” projection; ordinary reviewers see
  only privacy-safe coverage status; unrelated staff and other Tenants see
  nothing.

Mutation and concurrency requirements:

- Route save uses a client command id plus expected current-route revision.
  Retry after a lost response returns the same receipt and creates no duplicate
  revision or handoff.
- The command validates and writes one immutable revision, current-head CAS,
  audit, and durable handoff/outbox intent in one short transaction with a
  documented lock order. Slow EffectiveAccess enumeration and impact preview
  happen outside locks and are re-fenced inside.
- Route updates lock/order Tenant route before Site route, route before active
  occurrence, and source episode before item effect consistently to prevent
  deadlocks. The design must prove its actual order rather than copy these
  labels blindly.
- Source completion racing route handoff is resolved by expected source and
  route fences. Source-first creates no new active item; route-first may create
  a successor that immediately ends after source recheck, with no unread badge
  debt or fabricated read.
- Bulk Tenant impact is chunked through durable, idempotent reconciliation
  after the authoritative route revision. Partial projection failure does not
  roll back or misstate the saved route; the UI shows saved configuration and
  pending/failed effect receipts separately.

## Lifecycle and edge-case map

| Scenario                                  | Required behavior                                                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant has no route                       | inherited Sites prove zero; no item; authorized settings show setup path                                                                    |
| Site inherits and Tenant route is healthy | qualified Tenant members selected; no Site copy of membership                                                                               |
| Site override partially qualified         | qualified Site members only; no fallback fan-out                                                                                            |
| Site override proved zero, fallback on    | qualified Tenant members selected and fallback reason auditable                                                                             |
| Site override proved zero, fallback off   | no item; persistent review remains discoverable                                                                                             |
| resolver/PDP unavailable                  | indeterminate; no fallback, partial release, or false “unassigned” claim                                                                    |
| route exactly at execution bound          | release only if later manifest admits exact bound and complete proof                                                                        |
| route limit-plus-one                      | no release and no fallback; manager sees bounded repair state                                                                               |
| same Party in Site and Tenant routes      | only winning leg; no duplicate exact Party+recipient-role item                                                                              |
| same Party has several grants             | one fixed notification recipient role; grants do not duplicate item                                                                         |
| selected reviewer reads then is removed   | engagement preserved in ended history; never transferred                                                                                    |
| selected reviewer loses access            | active/recent private presentation removed; audit retained                                                                                  |
| selected reviewer later regains access    | current healthy fallback leg remains; no old item revival                                                                                   |
| explicit route re-adds a prior person     | successor item only if newly admitted and source still open; old engagement remains old                                                     |
| two managers save concurrently            | one expected-head CAS wins; loser receives current diff and safe retry                                                                      |
| two reviewers act concurrently            | one source CAS wins; other sees current result; sibling items end from source                                                               |
| Tenant route changes across many Sites    | one prospective save; current reviews stay assigned unless a separate impact-previewed handoff is invoked; healthy overrides are unaffected |
| Site is cloned/from template              | named Site reviewers not copied by default; destination inherits Tenant route                                                               |
| Site transfer across Tenant               | route members/history do not cross; destination starts inherited/unset under transfer contract                                              |
| Party is deactivated                      | current qualification removed; affected selected sets reconcile without broad fallback on unknown                                           |
| Party identities merge                    | route membership is explicitly reconciled/audited; engagement never merges or duplicates                                                    |
| Site is suspended                         | private review routing remains source-policy dependent; no inference from public serving state                                              |
| Site is retired                           | no new D20 routing; active source work ends under Site lifecycle owner; history retained                                                    |
| locale/route label changes                | stable Site/locale/Party identity governs; mutable names do not create a new item                                                           |
| item link is stale/bookmarked             | current authorization and source state re-proved; truthful current destination or privacy-safe not found                                    |
| low bandwidth/lost response               | idempotent receipt; saved-vs-effect status distinct; no double handoff                                                                      |
| default language/public root changes      | only source D20 meaning may change; route itself has no public effect                                                                       |
| Giving-enabled locale                     | identical routing behavior; no Giving URL, donor intent, finance, or Stripe coupling                                                        |

## Ruthless adversarial review — all 22 categories

The severity and likelihood below describe the unamended or incorrectly
implemented Option 3. “Changes the answer” means whether the founder's direction
survives and which amendment is mandatory.

### 1. Problem validity, necessity, and alternatives

**Material concern exists: Yes.**

- **What could go wrong:** Core could solve “who receives a notification” at
  the wrong level by building an assignment product, or decide that everyone
  with permission is implicitly responsible. The strongest simpler
  alternative is Option 1: notify every currently authorized reviewer and
  configure nothing.
- **Why it matters:** Option 1 is attractive for a one-person ministry, but it
  creates noisy, ambiguous ownership as Sites and staff grow. A per-episode
  picker adds repeated work and lets the Plan creator influence a protected
  recipient decision. A generic queue/workflow is much larger than three D20
  meanings.
- **Severity / likelihood:** High / High if route meaning is not bounded.
- **Evidence:** D17 already requires typed source routing and forbids guessed
  assignees. GitHub explicitly offers review controls to reduce team noise and
  clarify individual responsibility. HubSpot and Microsoft separate named
  approvers from the one/all completion threshold. No source proves a need for
  a general workflow engine.
- **Effect on answer:** Narrows but does not invalidate Option 3. The route is a
  single behavior-neutral Website-review responsibility setting, not a task,
  permission group, approval policy, or staff-work platform.
- **Permanent fix:** Reuse Tenant inheritance for the simple case, allow rare
  Site override, and keep review discoverable without a route. Do not freeze
  schema/table names, exact cardinality, or a future general responsibility
  abstraction in D21.
- **Exact language:** “D21 introduces one typed Default Site Locale Plan review
  responsibility route used only to select D20 notification recipients. It does not introduce
  generic assignment, queue, workflow, scheduling, or approval-policy
  configuration.”

### 2. Brittleness

**Material concern exists: Yes.**

- **What could go wrong:** A single Site reviewer becomes unavailable; a
  fallback fires on a timeout; primary access returns and routing oscillates;
  mutable names or copied Site settings become identity; an open episode is
  stranded after a route change.
- **Why it matters:** These failures produce missed reviews or repeated unread
  items precisely when staff coverage changes.
- **Severity / likelihood:** High / Medium-High.
- **Evidence:** Repository contracts distinguish proved zero from indeterminate
  and forbid notification revival; comparable systems expose explicit
  reassignment or Busy/delegation instead of assuming permanent availability.
- **Effect on answer:** Requires the closed result union, proved-zero-only
  fallback, stable routing leg, explicit differential handoff, and inheritance by
  reference rather than copied member lists.
- **Permanent fix:** Freeze the winning leg, re-resolve only on source recurrence,
  explicit applicable route change, or proved selected-set empty, and never
  treat timeout/overflow as zero.
- **Exact language:** “An indeterminate resolution SHALL NOT invoke fallback.
  A healthy current routing leg SHALL NOT switch merely because a higher-
  priority route later regains qualification.”

### 3. Technical debt

**Material concern exists: Yes.**

- **What could go wrong:** D21 could reuse contribution admin fan-out,
  `mission_control_tasks.assignee_profile_id`, an arbitrary JSON rule, a copied
  CMS team, or three separate resolver implementations.
- **Why it matters:** Each shortcut creates dual ownership, bypasses future
  Phase 12/17 behavior, and makes every later Site review meaning diverge.
- **Severity / likelihood:** High / High because tempting current tables exist.
- **Evidence:** Current source contains contribution-specific approval
  notifications and task/notification ledgers; D19 explicitly says the
  canonical Phase 17 runtime is not implemented and forbids those substitutes.
- **Effect on answer:** Requires one generated, versioned resolver and one
  typed append-only route lineage through the shared platform seams.
- **Permanent fix:** Implement only after Phase 12 capabilities and Phase 17
  notification contracts exist; use adapters and one-writer cutover, not dual
  writes or a legacy compatibility path that becomes permanent.
- **Exact language:** “No contribution, Mission Control, CMS assignment,
  notification-queue, or legacy approver table is authoritative for D21; all
  D20 meanings use one versioned Website-review route resolver.”

### 4. Edge cases

**Material concern exists: Yes.**

- **What could go wrong:** Partial qualification, route overlap, role overlap,
  route edits during review, primary recovery after fallback, Party merge,
  Tenant bulk change, Site clone/transfer/retirement, limit-plus-one, suspended
  serving, stale item links, or a lost response could yield duplicates,
  exposure, or no action path.
- **Why it matters:** These are ordinary lifecycle events for multi-Site
  ministries, not theoretical adversarial inputs.
- **Severity / likelihood:** High / Medium.
- **Evidence:** D19 requires exact Party+role identity and no revival; GitLab
  documents overlap and underlying-access failures; the repo has explicit
  Tenant, environment, Site, Party, lifecycle, and bounded-fanout contracts.
- **Effect on answer:** Requires the lifecycle table above and positive,
  negative, boundary, and race tests for each state.
- **Permanent fix:** Model stable IDs, exact route heads, selected-set digests,
  closed result types, idempotent receipts, and explicit clone/transfer rules.
- **Exact language:** “Site clone, template, import, transfer, and environment
  copy SHALL NOT copy named Site reviewers implicitly; the destination begins
  with its own Tenant inheritance unless an authorized destination manager
  explicitly configures otherwise.”

### 5. Footguns

**Material concern exists: Yes.**

- **What could go wrong:** Staff may think adding Maria gives her access,
  choose an enormous team, turn off fallback unknowingly, believe no-route
  blocks review, or change a Tenant route without realizing it affects active
  reviews. Developers may interpret 50 as a recommended team size or let the
  browser submit recipients.
- **Why it matters:** The system would look successful while attention is
  misrouted or permissions remain wrong.
- **Severity / likelihood:** High / High without consequence-led copy.
- **Evidence:** Contentful explicitly documents that task assignment does not
  prove entry read access. Repository UX rules require consequence clarity and
  current server truth.
- **Effect on answer:** Adds explicit “does not grant access” copy, visible
  fallback, current qualification status, impact preview, and server
  revalidation.
- **Permanent fix:** Default to inheritance, progressively disclose override,
  show affected counts before consequential saves, and keep route size as a
  separately closed D22 product decision rather than silently allowing the
  execution ceiling.
- **Exact language:** “Every route editor SHALL state that assignment changes
  notification responsibility only; it SHALL show current qualification and
  the exact fallback/no-fallback consequence before save.”

### 6. Tenant safety

**Material concern exists: Yes.**

- **What could go wrong:** A forged Site or Party ID, cached recipient set,
  cross-environment clone, support query, realtime topic, or bulk Tenant edit
  could attach or reveal another Tenant's staff or private Plan.
- **Why it matters:** Route membership and notification copy reveal people and
  private ministry work; cross-Tenant mixing is a critical privacy failure.
- **Severity / likelihood:** Critical / Medium if scope is convention-only.
- **Evidence:** Core platform boundaries require Tenant isolation across every
  read/write/worker/cache seam; ADR-0027 requires exact Tenant recipient
  identity.
- **Effect on answer:** Requires Tenant/environment columns and same-scope
  relationships, route-read projections, cache/topic keys, and a complete
  poison matrix.
- **Permanent fix:** Derive current scope server-side, enforce it in constraints
  and RLS, include scope in unique/cache/realtime keys, and fail closed on any
  mismatch.
- **Exact language:** “No route, revision, member, occurrence, item, cache,
  cursor, realtime subscription, support path, export, or repair command may
  read or bind a Party or Site outside its exact Tenant and environment.”

### 7. Database, RLS, and authorization safety

**Material concern exists: Yes.**

- **What could go wrong:** Nullable scope combinations admit malformed routes;
  a mutable row rewrites history; `USING` permits a row while missing `WITH
CHECK` lets an update move it; service-role/RPC paths bypass policy; actor or
  qualified status comes from the caller; cascade deletes erase evidence.
- **Why it matters:** Application-only checks cannot protect alternate clients,
  concurrency, privileged workers, or later maintenance code.
- **Severity / likelihood:** Critical / Medium-High.
- **Evidence:** Repository backend/OpenSpec rules and Supabase guidance require
  server-owned sensitive mutations, RLS, least privilege, constraints,
  indexed FKs, and both policy halves. D19 already defines the privileged-path
  poison matrix.
- **Effect on answer:** Strongly narrows the later data model and mutation
  boundary but does not select physical names.
- **Permanent fix:** Append-only revisions, immutable members, current-head CAS,
  check/unique/FK constraints, restrictive deletes, RLS `USING`+`WITH CHECK`,
  no browser writes, hardened definers, and pgTAP hostile tests.
- **Exact language:** “Tenant, environment, Site, actor, recipient role,
  qualification, and resolved episode recipients are derived from trusted
  server context; browser inputs cannot mutate scope or transform an allowed
  route row into a forbidden state.”

### 8. Overengineering

**Material concern exists: Yes.**

- **What could go wrong:** A simple route becomes a generic workflow builder
  with queues, priorities, due dates, schedules, out-of-office calendars,
  round-robin, workload telemetry, escalation, claim locks, SLAs, or custom
  rules.
- **Why it matters:** It would duplicate Mission Control/Phase 34 direction,
  increase configuration burden, and make the review journey harder to explain.
- **Severity / likelihood:** High / High because external tools demonstrate
  seductive features.
- **Evidence:** D17 rejects a project-management product; D18 rejects Plan
  timing; D19 rejects recurring reminders/email; external systems show these
  features are independent choices, not prerequisites.
- **Effect on answer:** Confirms the smallest closed hierarchy and forbids
  speculative availability automation.
- **Permanent fix:** One Tenant default, optional Site override, one explicit
  fallback enum, current authorization intersection, prospective-by-default
  settings, and explicit differential handoff.
- **Exact language:** “D21 SHALL NOT introduce priority, due date, reminder,
  email default, schedule, presence, workload, round-robin, claim, escalation,
  sequential approval, or arbitrary routing-rule configuration.”

### 9. UX/UI and user friction

**Material concern exists: Yes.**

- **What could go wrong:** “Route,” “resolver,” “qualified,” or “fallback”
  jargon confuses staff; repeated Site setup punishes small ministries;
  override inheritance is hidden; a picker exposes ineligible/private names;
  save lacks impact; mobile/keyboard/zoom flows break; a bell card exposes
  configuration instead of the work.
- **Why it matters:** Staff must confidently answer who receives reviews, why,
  what happens during absence, and whether anything public changed.
- **Severity / likelihood:** High / High without the required journey.
- **Evidence:** Core frontend rules require Base Maia/shared UI, 44px targets,
  native semantics, mobile/reflow/accessibility, and consequence clarity. W3C
  requires operable, understandable, programmatically exposed states. HubSpot
  shows review and reassignment in the content context; GitHub explicitly
  frames noise and responsibility.
- **Effect on answer:** Adds the exact settings IA, progressive disclosure,
  plain-language copy, impact-aware save, no-route recovery, “why me” detail,
  and accessibility/low-bandwidth gates above.
- **Permanent fix:** Test the end-to-end journey with representative one-Site,
  multi-Site, restricted-Site, mobile, keyboard, screen-reader, low-vision,
  long-name, RTL, and weak-network participants before broad activation.
- **Exact language:** “The normal inherited journey requires no per-Site
  configuration; a Site override exposes only the people picker and one
  explicit coverage choice, and every consequential state is understandable
  without permission or routing jargon.”

### 10. Source of truth, ownership, and domain invariants

**Material concern exists: Yes.**

- **What could go wrong:** The route becomes permission, the item becomes review
  truth, a read becomes completion, a CMS team becomes the route authority, or
  a copied recipient list becomes writable source state.
- **Why it matters:** Dual ownership causes historical drift and allows a
  presentation system to mutate protected domain behavior.
- **Severity / likelihood:** Critical / High if ownership is not explicit.
- **Evidence:** ADR-0027, ADR-0029, Phase 12, D17, D19, and D20 each assign these
  facts to different owners.
- **Effect on answer:** Requires the ownership table and invariants 1–15 above.
- **Permanent fix:** One authoritative owner per fact, immutable occurrence and
  route evidence, source re-read, and no circular sync.
- **Exact language:** “Route membership owns responsibility configuration only;
  EffectiveAccess owns authorization; the D20 producer owns actionability and
  completion; Phase 17 owns presentation and engagement.”

### 11. Hidden coupling

**Material concern exists: Yes.**

- **What could go wrong:** Site routes couple to Page/Communications teams,
  finance approvers, public locale publication, Giving enablement, current role
  labels, CMS collections, or Mission Control tasks. A Tenant route change may
  unexpectedly rewrite healthy Site overrides.
- **Why it matters:** Future permission, CMS, giving, or task changes would
  silently alter review recipients or financial behavior.
- **Severity / likelihood:** High / Medium-High.
- **Evidence:** The root glossary explicitly separates Site, locale, Giving,
  Legal Entity, settlement, and accounting. D17 keeps source owner actions and
  tasks subordinate. Current code contains tempting but domain-specific
  approval seams.
- **Effect on answer:** Requires a typed Website-only route and precise impact
  dependency: inherited Sites and active fallback legs change; healthy Site
  overrides do not.
- **Permanent fix:** Reference stable Party/Site identities and Phase 12
  capability results through explicit adapters; do not synchronize other
  teams/groups into D21.
- **Exact language:** “Page, Navigation, Communications, Giving, finance,
  contribution, CMS, and Mission Control ownership SHALL NOT select or mutate
  D21 responsibility; a Tenant route edit changes future policy only for
  inheriting Sites and declared fallback, while a separate authorized handoff
  is required to change current review assignments.”

### 12. Failure modes

**Material concern exists: Yes.**

- **What could go wrong:** Route save succeeds but handoff projection fails;
  impact preview is stale; access proof times out; response is lost; only some
  recipients release; source completes between route write and item creation;
  a cache continues serving removed responsibility.
- **Why it matters:** Staff could retry into duplicates, see false success, or
  miss review while operators lack a repair path.
- **Severity / likelihood:** High / Medium.
- **Evidence:** Phase 17 requires atomic all-before-any member release and
  durable recovery; D17 requires itemized effect receipts; PostgreSQL/Supabase
  practices favor short transactions and durable idempotency.
- **Effect on answer:** Requires authoritative save receipt separate from
  resumable handoff effects, closed indeterminate state, no partial release,
  current query-time authorization, and same-effect replay.
- **Permanent fix:** Durable outbox/reconciler, command receipts, expected
  fences, projection health state, kill switch per resolver generation, and
  runbooks that replay the same semantic effect rather than issuing peers.
- **Exact language:** “Route configuration success and recipient-handoff
  projection outcomes SHALL be itemized; failure after the authoritative route
  write is reconciled idempotently and never triggers a second route revision,
  partial audience, or broader fallback.”

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists: Yes.**

- **What could go wrong:** Route revisions, access changes, source review, and
  retries interleave; primary/fallback flaps; a later access grant revives an
  old item; two managers overwrite each other; two reviewers both think they
  completed the action.
- **Why it matters:** Independently valid actions can jointly violate one-item,
  ownership, and historical-integrity invariants.
- **Severity / likelihood:** Critical / Medium.
- **Evidence:** D17 uses current expected-head CAS; D19 forbids revival and
  defines source/recipient races; Phase 17 makes durable business identity—not
  transport request—the idempotency grain.
- **Effect on answer:** Adds stable routing legs, explicit successor handoff,
  expected route/source fences, differential recipient sets, command receipts,
  and first-valid-source-CAS behavior.
- **Permanent fix:** Enumerate all transitions, use semantic IDs/digests, short
  ordered transactions, and test every pairwise race plus retry after ambiguous
  response.
- **Exact language:** “A route or authorization change never mutates an existing
  item to a different recipient and never revives old engagement; every newly
  admitted recipient requires one producer-authorized successor occurrence
  keyed to the durable handoff effect.”

### 14. Data integrity risks

**Material concern exists: Yes.**

- **What could go wrong:** Duplicate route members, two current heads, stale
  inherited copies, duplicate items across overlapping routes, orphaned routes,
  erased actors, inconsistent route/item history, or partial bulk reconciliation
  corrupt reporting and staff trust.
- **Why it matters:** Notification history must explain who was responsible at
  the time without becoming another mutable authority.
- **Severity / likelihood:** High / Medium.
- **Evidence:** The repository already requires immutable history, stable IDs,
  exact recipient identity, complete sets, and query-time current authority.
- **Effect on answer:** Requires constraints, immutable snapshots, set digests,
  unique active grains, restrictive deletes, and repairable projections.
- **Permanent fix:** Make invalid combinations impossible in the database,
  compare shadow resolver sets before release, and preserve evidence during
  repair rather than deleting conflicting rows.
- **Exact language:** “At most one current route head exists per exact scope;
  one revision contains each Party at most once; one D20 source episode and
  exact Party+recipient-role has at most one active item across route overlap
  and handoff.”

### 15. Security and privacy risks

**Material concern exists: Yes.**

- **What could go wrong:** A route picker or “why me” view leaks restricted
  staff, Site ownership, missionary location, Plan existence, locale rollout,
  or private content; logs/audits/export include names or Plan body; assignment
  widens access; stale notifications remain after revocation.
- **Why it matters:** Missionary and ministry operational information can be
  sensitive even without donor/payment data.
- **Severity / likelihood:** Critical / Medium.
- **Evidence:** Core's privacy boundaries and D19 require current authorization
  at count/list/detail/click/action/realtime/support paths and body-free audit;
  Contentful supplies negative evidence that assignment alone can outpace
  access.
- **Effect on answer:** Requires purpose-filtered projections, no access grant,
  immediate presentation removal on access loss, minimal item copy, body-free
  audit, and retention/export/delete posture.
- **Permanent fix:** Data minimization, safe stable IDs/reason codes in telemetry,
  no names/content in ordinary logs, same authorization on backups/exports/
  support, and documented incident response for misrouting.
- **Exact language:** “Route and item surfaces SHALL reveal only the minimum
  people and Plan facts the current viewer may see for that purpose; access loss
  removes active and Recent private presentation immediately while body-free
  audit remains under retention.”

### 16. Scalability and performance risks

**Material concern exists: Yes.**

- **What could go wrong:** A Tenant route edit fans out synchronously across
  thousands of Sites/open reviews; route/PDP checks become N+1; feed queries
  scan history; candidate pickers enumerate an entire Tenant; limit-plus-one is
  silently truncated; cache invalidation storms.
- **Why it matters:** The design must work for a large individual Tenant and
  many small Tenants without turning a settings save into a long lock or
  partial result.
- **Severity / likelihood:** High / Medium.
- **Evidence:** Phase 17 has explicit 50 staff/200 member initial safety bounds,
  all-before-any release, and bounded plans. PostgreSQL guidance requires
  indexes, keyset pagination, and short transactions. No evidence supplies a
  good UX route cap.
- **Effect on answer:** Requires impact counts/pagination, bounded atomic route
  resolution, asynchronous idempotent affected-episode reconciliation, and
  production-shaped measurements; D22 now supplies the three-person product
  bound.
- **Permanent fix:** Pre-register dataset sizes and latency/error SLOs, batch
  authorization reads, index equality/order paths, paginate candidate/audit
  lists, and fail limit-plus-one closed.
- **Exact language:** “Route enumeration and handoff release are bounded and
  complete; no execution path truncates recipients. Tenant route save is a
  short authoritative transaction; only a separately admitted current-review
  handoff reconciles affected open episodes in bounded idempotent batches.”

### 17. Operational burden

**Material concern exists: Yes.**

- **What could go wrong:** Every Site needs manual setup; departed staff require
  SQL repair; empty routes are invisible; operators manually replay items;
  route behavior depends on tribal knowledge; automatic reminders are added to
  compensate for unclear ownership.
- **Why it matters:** Small ministries have limited administrative capacity;
  operational friction defeats the value of explicit responsibility.
- **Severity / likelihood:** High / High without inheritance and repair UX.
- **Evidence:** The platform favors durable behavior over manual glue. The
  Tenant default is a product judgment supported by comparable organization/
  project inheritance patterns but still needs representative validation.
- **Effect on answer:** Confirms one-time Tenant setup, rare override, persistent
  coverage health, impact-aware bulk save, safe no-route state, and automated
  idempotent reconciliation—without reminders.
- **Permanent fix:** Provide staff-owned repair paths, operator runbooks and
  health signals, never require direct database edits, and test a one-person
  ministry journey.
- **Exact language:** “Ordinary Sites inherit one Tenant Website-review route;
  no routine episode requires recipient selection, and every empty/degraded
  route has an authorized in-product repair path that never requires SQL or
  developer intervention.”

### 18. Observability and auditability gaps

**Material concern exists: Yes.**

- **What could go wrong:** Logs show delivery but not why a route won; staff
  cannot explain reassignment; operators cannot distinguish proved zero from
  outage; mutable settings erase who changed coverage; engagement is mistaken
  for business history.
- **Why it matters:** Misrouting, missing attention, and privacy incidents become
  undiagnosable and unsafe to repair.
- **Severity / likelihood:** High / High without durable evidence.
- **Evidence:** ADR-0027 distinguishes presentation/engagement from source and
  audit; Phase 17 requires exact occurrence and recipient evidence; technical
  logs are not business history.
- **Effect on answer:** Requires append-only route revision/audit, route/selected
  set digests, proof result/reason, handoff lineage, actor attribution, and
  separate technical telemetry.
- **Permanent fix:** Staff-visible safe history plus body-free security audit and
  named monitors/runbooks; correlate by opaque IDs, never log private body or
  recipient names in metrics.
- **Exact language:** “Durable history SHALL answer which route revision was
  considered, which route won, whether fallback was used, the complete selected
  set digest, why a handoff occurred, who changed configuration, and which
  source transition ended the item—without making audit a write authority.”

### 19. Dependency and integration risks

**Material concern exists: Yes, internally; no new third-party runtime
dependency is justified.**

- **What could go wrong:** D21 ships before exact Phase 12 capabilities, Phase
  17 item contracts, D20 source adapters/end rules, or Site lifecycle hooks;
  route code then guesses roles or dual-writes current tables. Provider/CMS
  groups could be imported as responsibility authority and drift.
- **Why it matters:** Internal contract order, not vendor uptime, is the main
  dependency risk. Importing external identity creates contradictory owners.
- **Severity / likelihood:** Critical / High if implemented out of sequence.
- **Evidence:** D19/D20 keep keys Reserved until exact source, recipient,
  capability, RLS, and proof bindings exist. Current runtime lacks the canonical
  seam. External sources are examples only.
- **Effect on answer:** Requires implementation sequencing and explicitly adds
  no GitHub, HubSpot, Microsoft, Contentful, Blackbaud, Stripe, Vercel,
  Supabase-external, or CMS runtime integration.
- **Permanent fix:** Bind generated code-owned adapters only after governing
  manifests; reject external team synchronization and shadow-compare old/new
  internal behavior before one-writer cutover.
- **Exact language:** “D21 adds no external provider dependency and SHALL remain
  Reserved until exact Phase 12 capability, D20 source/end, Phase 17 resolver/
  item, Site lifecycle, and privileged-path proof contracts are minted
  together.”

### 20. Migration, rollout, and upgrade risks

**Material concern exists: Yes.**

- **What could go wrong:** Migration infers reviewers from admins, current
  contribution approvers, prior reviewers, creators, CMS teams, or every
  capable person; old and new writers both notify; historical Plans gain unread
  items; mixed-version code cannot understand fallback; rollback after new
  route data loses history.
- **Why it matters:** A “helpful” backfill would silently assign private work and
  create the broad fan-out Option 3 was chosen to avoid.
- **Severity / likelihood:** Critical / Medium-High.
- **Evidence:** D19 forbids inferred historical engagement and dual writers;
  D17 forbids guessed assignees; current admin fan-out is non-authoritative.
- **Effect on answer:** Requires no inferred membership, additive/read-compatible
  schema, shadow resolution, one-writer activation, kill switch, forward repair,
  and no historical unread backfill.
- **Permanent fix:** Start Tenant routes unset, offer an authorized guided setup,
  shadow compare without presentation, canary by resolver generation/Tenant,
  and retain new evidence during rollback while disabling writers/readers
  safely.
- **Exact language:** “Migration SHALL NOT infer responsibility from role,
  capability, prior action, creator, admin, CMS group, contribution approver,
  task, or legacy notification data; it creates no historical item or
  engagement. New routes begin unset until explicitly configured.”

### 21. Testability, traceability, and proof

**Material concern exists: Yes.**

- **What could go wrong:** Tests assert a table insert rather than staff/domain
  outcomes; positive cases pass while cross-Tenant, zero/unknown, limit, race,
  accessibility, migration, privileged, and production-shape failures remain;
  terminology drifts across D17–D22, glossary, ADR, OpenSpec, code, tickets, and
  release evidence.
- **Why it matters:** Option 3 sounds intuitive but is not falsifiable until
  hierarchy, qualification, fallback, handoff, and no-route behavior are exact.
- **Severity / likelihood:** High / High without the acceptance/proof pack.
- **Evidence:** Repo OpenSpec rules require scenario-level requirements and
  traceability; Phase 17 requires executable Live-key proof packs; D19/D20 keep
  contracts Reserved pending proof.
- **Effect on answer:** Requires the acceptance criteria and traceability map
  below, including user-visible, domain, RLS, concurrency, migration,
  accessibility, and production-shaped outcomes.
- **Permanent fix:** One vocabulary and decision IDs from Grill answer through
  glossary, PRD, ADR conformance, OpenSpec, design, tasks, tickets, code,
  tests, canary evidence, and release manifest; block minting on any
  contradiction.
- **Exact language:** “No D21 contract key becomes Live until every acceptance
  criterion has linked positive, negative, boundary, authorization,
  concurrency, migration, accessibility, and production-shaped evidence and
  traceability from D21/D22 to the generated manifest.”

### 22. Other development hazards

**Material concern exists: Yes.**

- **What could go wrong:** Route cardinality is accidentally frozen outside the
  D22 decision;
  “reviewer” is confused with a legal/financial approver; Page or
  Communications owner routing is bypassed; a generalized `responsibilities`
  package leaks into unrelated domains; clone/demo/seed data ships real names;
  documentation changes are mistaken for implementation authorization.
- **Why it matters:** These hazards create semantic drift, privacy problems,
  brittle abstractions, and an unsafe rollout despite individually sound code.
- **Severity / likelihood:** High / Medium.
- **Evidence:** The repository uses bounded ubiquitous language and phase-owned
  decisions; prior Phase 24 choices explicitly separate public Site, source
  work, Giving, and finance. D21 research deferred cardinality to D22, which now
  closes it.
- **Effect on answer:** Keeps D21 behavior-neutral and narrow, defers to D22's
  closed meaning, requires synthetic fixtures, and states documentation/
  implementation scope.
- **Permanent fix:** Add one glossary term, no new ADR unless later design
  introduces a surprising hard-to-reverse cross-domain tradeoff, and require a
  separate implementation authorization after PRD/OpenSpec/design closure.
- **Exact language:** “D21 does not decide how many co-responsible people a
  route may contain or whether coverage is primary-plus-backup; D22 supplies
  that completion/cardinality contract before schema or key minting.”

## Falsifiable acceptance criteria

### Route meaning and normal staff journey

1. **D21-AC01 — Responsibility is not access.** Adding a Party to either route
   creates no membership, role, capability, Site/Plan/source visibility, review
   power, public authority, or financial authority.
2. **D21-AC02 — Access is not responsibility.** Ten same-Tenant people who can
   perform the exact review but are outside the winning route receive zero
   items.
3. **D21-AC03 — Fixed scope.** The route selects only D20 Website review items;
   it cannot select Page, Navigation, Communications, task, Giving, finance, or
   another notification meaning.
4. **D21-AC04 — Tenant setup once.** A one-Site ministry can configure its
   Tenant Website reviewers once and complete later D20 episodes without a
   per-Plan recipient step.
5. **D21-AC05 — Inheritance is visible.** An ordinary Site displays **Use
   Tenant Website reviewers**, the permitted safe summary, and no copied Site
   member list.
6. **D21-AC06 — Override is deliberate.** A Site override shows Site reviewers
   and the fallback/no-fallback choice before save and on every later read.
7. **D21-AC07 — Consequence copy.** Every editor says assignment grants no
   access and changes no website; representative staff can accurately restate
   both facts without moderator help.
8. **D21-AC08 — No per-episode picker.** Plan create, review, renewal, and
   current-default-changed flows accept no assignee/recipient input.
9. **D21-AC09 — Candidate privacy.** Search returns only same-Tenant people the
   current route manager may enumerate and reveals only permitted eligibility
   information; timing and result shape do not enumerate hidden matches.
10. **D21-AC10 — Separate qualification.** Only a same-Tenant active assignment
    visible to the route manager may be named. A currently unqualified person
    is clearly labeled, gains no access, and produces no item; responsibility
    intent and qualification remain separate rather than silently rejecting or
    granting permission.
11. **D21-AC11 — No combined grant.** No **Add reviewer** interaction also
    grants Site access; permission repair is a separate authorized journey.
12. **D21-AC12 — Why-me projection.** A selected recipient may see the safe
    current route label explaining receipt, but no sibling engagement,
    unavailable person, or permission detail outside their purpose.

### Resolver, precedence, and bounds

13. **D21-AC13 — Inherited resolution.** An inherited Site evaluates only the
    current Tenant Website-review route and returns released, released-zero, or
    indeterminate.
14. **D21-AC14 — Site-first resolution.** An override with at least one proved
    qualified Site member selects only the qualified Site members and never
    unions Tenant recipients.
15. **D21-AC15 — Partial qualification.** A Site route with one qualified and
    one unqualified member still wins with exactly one recipient; fallback
    receives zero.
16. **D21-AC16 — Explicit fallback.** A proved-zero Site route evaluates the
    Tenant route only when the saved Site mode explicitly enables it.
17. **D21-AC17 — Explicit no fallback.** A proved-zero Site route with **Send no
    review notification** produces released-zero even when Tenant reviewers
    could act.
18. **D21-AC18 — No hidden tier.** Creator, prior reviewer, last editor, every
    staff/admin/capability holder, support, service role, platform operator, AI,
    contribution approver, task/CMS group, external address, and legacy queue
    each receive zero fallback items.
19. **D21-AC19 — Zero versus unknown.** Empty complete membership/current access
    yields released-zero; timeout, stale epoch, partial read, contradictory
    proof, dependency failure, or unknown yields indeterminate.
20. **D21-AC20 — Unknown never widens.** Indeterminate creates no partial child,
    no fallback selection, no false-zero UI, and no retry with a peer identity.
21. **D21-AC21 — Bound behavior.** Zero, one, several, exactly at D22's
    three-person product bound/Phase 17 execution bound, and limit-plus-one produce their exact
    generated outcomes; limit-plus-one releases none and never truncates.
22. **D21-AC22 — Overlap dedupe.** The same exact Party in Site and Tenant
    routes receives one outcome from the winning leg, never two.
23. **D21-AC23 — Grant dedupe.** Several authorization grants for one person do
    not create multiple route members/items; genuinely distinct recipient-role
    identities follow the later fixed manifest and never merge engagement.
24. **D21-AC24 — Determinism.** Canonically equivalent membership order and
    retry inputs resolve the same selected-set digest and occurrence identity.
25. **D21-AC25 — No caller authority.** Forged Tenant, environment, Site,
    source episode, action, route head, winner, qualification, recipient role,
    selected set, or audit actor cannot influence resolver truth.

### Stable legs, route changes, and review races

26. **D21-AC26 — Leg latch.** A winning Site leg remains current while at least
    one selected recipient remains qualified; another configured member's loss
    does not invoke fallback.
27. **D21-AC27 — Monotonic fallback.** After fallback wins, primary
    qualification recovery alone creates no primary item, ends no fallback
    item, and revives nothing in the same source episode.
28. **D21-AC28 — Next episode resets.** A later genuine D20 episode begins from
    current Site-first precedence rather than the prior episode's fallback leg.
29. **D21-AC29 — Qualification gain is not append.** A route member who gains
    access after a leg released receives no late item while the selected set
    remains healthy; a later admitted handoff or source episode is required.
30. **D21-AC30 — Total selected loss.** Proved loss of every selected recipient
    creates at most one successor leg from current explicit route truth; unknown
    suppresses and retries without rerouting.
31. **D21-AC31 — Prospective default.** An ordinary route save changes future
    routing only, states how many permitted current reviews remain on their
    current assignments, and does not create/end a current item.
32. **D21-AC32 — Explicit current handoff.** A separate authorized command
    shows current new, removed, and unchanged outcomes using privacy-filtered
    names/counts and expected route/source fences before applying the saved
    route to current reviews.
33. **D21-AC33 — Unchanged continuity.** A continued exact recipient keeps the
    same item and engagement; no new item, unread, toast, sound, or email is
    created solely by route/auth revision.
34. **D21-AC34 — New recipient.** Each newly selected exact recipient receives
    one successor item with independent unread engagement only while source and
    current authorization still hold.
35. **D21-AC35 — Removed responsibility.** After an admitted current-review
    handoff, a still-authorized removed recipient receives once-set
    `responsibility_reassigned`, leaves **Needs attention**, and retains
    non-unread **Reassigned** Recent history under ADR-0027's 90-day policy. It
    never stays actionable/unread or fabricates read.
36. **D21-AC36 — Access loss.** Revocation/Party merge/assignment deactivation
    between compile, release, count, list, detail, click, action, realtime,
    cache, support, or Recent removes private presentation immediately and
    never transfers engagement.
37. **D21-AC37 — Remove/re-add.** Re-adding a prior person never revives the old
    item; if admitted while source remains actionable, one new successor item
    has new engagement.
38. **D21-AC38 — Route CAS.** Two managers saving from the same expected head
    yield one winner and one current-diff conflict; no last-write-wins mixed
    member set.
39. **D21-AC39 — Route receipt idempotency.** Repeating the same command identity
    and payload returns one revision/receipt; changing payload under that
    identity conflicts.
40. **D21-AC40 — Source-first race.** When review completes before handoff
    admission, the route may save but no new active item appears; the receipt
    states the review already ended.
41. **D21-AC41 — Route-first race.** When handoff admits first and source then
    ends, successor items immediately become non-actionable with zero unread
    badge debt and no fabricated engagement.
42. **D21-AC42 — Concurrent reviewers.** One current source CAS wins; the loser
    sees **Review already completed**, source truth, and no retry prompt; sibling
    items end only from the source transition.
43. **D21-AC43 — Partial effect failure.** A saved route plus failed/pending
    reconciliation displays both facts and retries the same durable handoff;
    it never creates another route revision or calls partial fan-out success.

### Tenant, database, RLS, and privacy proof

44. **D21-AC44 — Structural same scope.** Constraints reject every cross-Tenant,
    cross-environment, wrong-Site, wrong-route-kind, or invalid nullability
    combination before application convention can admit it.
45. **D21-AC45 — Unique current truth.** At most one current head exists per
    exact route scope and one Party appears at most once in a revision.
46. **D21-AC46 — Historical integrity.** Supersede, deactivate, merge, erase,
    retire, and repair preserve immutable body-free route/actor/occurrence
    evidence under the governing retention policy; cascades cannot erase or
    retarget it.
47. **D21-AC47 — Browser write denial.** Authenticated browser roles cannot
    directly insert/update/delete route heads, revisions, members,
    occurrences, items, or audit; only the narrow server command can.
48. **D21-AC48 — RLS operation matrix.** Positive and negative SELECT, INSERT,
    UPDATE, DELETE, view, RPC, definer, owner, service role, worker, support,
    cache, realtime, import, export, and repair tests preserve identical scope
    and purpose boundaries, including both `USING` and `WITH CHECK`.
49. **D21-AC49 — Forbidden transformation.** A permitted update cannot move a
    row to another Tenant/environment/Site, change actor, route kind, current
    owner, or member identity outside the command's admitted transition.
50. **D21-AC50 — Hardened functions.** Every definer path has explicit
    operation grants, qualified objects, controlled empty search path, no
    public execution, and hostile pgTAP proof.
51. **D21-AC51 — Candidate uniformity.** Search terms, empty results, errors,
    pagination, timing, and counts do not disclose hidden/restricted people or
    another Tenant.
52. **D21-AC52 — Minimal telemetry.** Metrics/logs contain opaque IDs, reason
    codes, counts, revisions, and timings only—no Plan body, recipient name,
    address, locale-sensitive ministry detail, or sibling engagement.
53. **D21-AC53 — Public/finance zero.** Route create/edit/remove/fallback,
    release/read/reassign/end, failure/retry, clone/retire, and rollback produce
    zero Page, Navigation, public route, root, generation, cache/search, Giving,
    Legal Entity, Stripe, settlement, bank, receipt, currency, ledger, or
    accounting mutation.

### Scale, migration, accessibility, and traceability proof

54. **D21-AC54 — Indexed plans.** Explain/production-shaped tests prove indexed
    current-route, reverse-member, inheriting-Site, active-source, feed/count,
    audit, and reconciliation queries without N+1 or unbounded scans.
55. **D21-AC55 — Short locks.** Slow candidate/access/impact reads occur outside
    write locks and re-fence before commit; load tests show no broad Tenant/Site
    lock or deadlock under concurrent save/review/revocation.
56. **D21-AC56 — Bounded Tenant edit.** A large Tenant route change gives a
    privacy-safe prospective/current impact count and writes one authoritative
    revision without reassigning current reviews. Any separately authorized
    current-review handoff reconciles admitted episodes in bounded, idempotent
    batches; healthy Site overrides remain untouched.
57. **D21-AC57 — Keyset UX.** Candidate and audit lists use stable keyset
    pagination and remain usable with long names, duplicates, churn, and large
    Tenants; no offset drift changes selected identity.
58. **D21-AC58 — No inferred migration.** Existing admins, roles, groups,
    creators, prior reviewers/editors, contribution approvers, tasks, CMS
    teams, notification history, and capabilities produce zero route members,
    items, or engagement.
59. **D21-AC59 — Clone/import/transfer.** New or transferred Sites copy no named
    reviewer, route history, item, or engagement by default and begin with
    destination Tenant inheritance/unset truth.
60. **D21-AC60 — One writer.** Shadow comparison performs no presentation or
    external I/O; canary activation has exactly one writer; rollback disables
    new generation/presentation without re-enabling legacy broadcast or
    deleting evidence.
61. **D21-AC61 — Mixed version.** Old code cannot write an unknown route mode;
    new code on incomplete schema fails closed and keeps all D20 keys Reserved.
62. **D21-AC62 — No-route journey.** Route manager, current reviewer without
    management, Plan-invisible staff, and another Tenant each see exactly the
    permitted no-route/setup/review/nothing outcome.
63. **D21-AC63 — Unknown journey.** An authorization/resolver outage says
    verification is unavailable, sends no partial item, preserves the current
    review path, and does not ask staff to broaden recipients or resubmit.
64. **D21-AC64 — Accessibility.** Keyboard, screen reader, focus order/visibility,
    non-color, status/error announcement, forced colors, reduced motion,
    320-pixel reflow, 200% text, 400% zoom, RTL, CJK/combining/long names, and
    44×44 targets pass current Core/WCAG gates.
65. **D21-AC65 — Mobile/weak network.** Current route and consequence render
    before enhanced search; offline is read-only; save retains an in-memory
    draft only, retries one receipt, and never stores staff identity locally or
    claims an uncommitted save.
66. **D21-AC66 — Comprehension proof.** Pre-registered representative one-Site,
    multi-Site, restricted-Site, mobile, and multilingual studies test who is
    responsible, who is authorized, when fallback happens, no-route recovery,
    and zero public effect; missing/failing gate blocks Live.
67. **D21-AC67 — Production shape.** Pre-registered cohorts cover 0/1/several/
    bound+1 members, high Site counts, many open episodes, authorization churn,
    cold/warm cache, retries, failures, and p50/p95/p99 latency/error/lock data.
68. **D21-AC68 — Traceability.** D21 answer, glossary, ADR-0027 conformance,
    D17–D22, Phase 12/17, PRD, OpenSpec, design, tasks, tickets, generated
    manifest, implementation, tests, canary evidence, and release record use
    one terminology and link every requirement/proof.
69. **D21-AC69 — Reserved gate.** No D20 key is minted/Live until D22's closed
    route cardinality/completion, D23's proportional independence floor, D24's
    protected participant predicate, exact recipient role and
    capabilities, source/end, data/RLS/retention, accessibility, operations,
    migration, and all criteria above close in one generated contract generation.

## Named monitoring and response contract

Zero-tolerance invariants use an exact threshold of any observation. Experience
and latency numbers are not currently verified repository or industry facts;
their threshold is **missing pre-registration or exceeding the value registered
before pilot data is observed**. That explicit meta-gate prevents teams from
choosing favorable numbers afterward while avoiding fabricated precision.

| Signal                                                 | Threshold                                                                                                        | Owner                                  | Required response                                                                                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `site_review_route_granted_access_total`               | any value > 0                                                                                                    | Phase 12 Security                      | P0 disable route mutation/resolution, revoke widened access, assess exposure, restore capability-only authorization, replay hostile tests |
| `site_review_route_cross_tenant_total`                 | any cross-Tenant/environment route, person, item, cache, realtime, support, worker, export, or audit observation | Site IAM + Security                    | P0 contain, remove presentation, preserve evidence, assess disclosure, repair constraints/RLS, requalify isolation suite                  |
| `site_review_route_hidden_fallback_total`              | any recipient outside the saved Site/Tenant hierarchy                                                            | Site Product + Security                | fence D20 keys, remove guessed presentation, repair resolver generation, require explicit route before re-enable                          |
| `site_review_route_capability_only_recipient_total`    | any capable but non-responsible recipient                                                                        | Site IAM + Phase 17                    | stop writer, hide item, preserve evidence, repair intersection and negative fixtures                                                      |
| `site_review_route_assignment_without_action_total`    | any released recipient without current exact view+action proof                                                   | Phase 12 + Site Security               | P0 hide item, inspect exposure, repair conjunction, rerun every authorization race                                                        |
| `site_review_route_unknown_as_zero_total`              | any partial/stale/timeout/overflow/contradictory result classified zero or invoking fallback                     | Site IAM                               | stop release/fallback, repair closed union, reconcile same generation                                                                     |
| `site_review_route_partial_release_total`              | any visible child from incomplete generation                                                                     | Phase 6/17                             | P0 stop compiler, hide unreleased children, preserve rows, repair all-before-any, replay same effect                                      |
| `site_review_route_overlap_duplicate_total`            | any peer item for same source episode+Party+role+surface                                                         | Phase 6/17                             | stop writer, hide duplicate, preserve both rows, repair precedence/uniqueness, reconcile without engagement transfer                      |
| `site_review_route_unchanged_renotify_total`           | any new item/unread caused only by route/auth revision for a continued recipient                                 | Site Producer + Phase 17               | pause route handoff, suppress peer, preserve evidence, repair continuation mapping, replay churn tests                                    |
| `site_review_route_old_item_revived_total`             | any old item restored by access/responsibility return                                                            | Phase 17 Security                      | remove revived presentation, fence generation, require successor-only logic, audit affected recipients                                    |
| `site_review_route_fallback_bounce_total`              | any fallback→primary switch in one open source episode without explicit current-review handoff                   | Site Producer                          | pause routing, restore last valid leg, repair monotonic reducer, reconcile current episodes                                               |
| `site_review_route_removed_actionable_total`           | any removed recipient retaining active/unread actionable presentation                                            | Site IAM + Phase 17                    | hide immediately, inspect route-generation lag, repair query-time applicability and reconciliation                                        |
| `site_review_route_resolved_unread_debt_total`         | any ended-before-view item contributing unread or fabricated read                                                | Phase 17                               | remove badge debt without inventing engagement, repair end reducer, prove Recent behavior                                                 |
| `site_review_route_handoff_failure_total`              | any admitted new recipient missing its successor item while source remains actionable                            | Site Producer + Phase 17               | reconcile same handoff identity, expose safe status, never revive/transfer engagement                                                     |
| `site_review_route_clone_import_copy_total`            | any copied named override/member/history across clone/import/transfer/environment                                | Site Data + Security                   | quarantine/reset destination to its Tenant inheritance, assess exposure, repair copy contract                                             |
| `site_review_route_bound_overflow_total`               | any overflow or truncation                                                                                       | Site Product + Phase 17                | release none, require smaller deliberate route or a separately proved manifest-bound change                                               |
| `site_review_route_public_financial_effect_total`      | any public/content/Giving/financial mutation attributable to D21                                                 | Site Runtime + Giving/Finance Security | P0 contain, preserve receipts, restore source-owner truth, remove coupling, requalify zero-effect suite                                   |
| `site_review_route_reconciliation_age_seconds`         | missing registered SLO or p95 above its pre-registered pilot value while source remains actionable               | Site Operations                        | pause cohort growth, show private pending/problem state, replay same effect, repair outbox/index/locks without broadening                 |
| `site_review_route_resolver_p95_ms`                    | missing registered budget or p95 above its pre-registered window/sample value                                    | Site Platform                          | keep keys Reserved/pause rollout, optimize batching/indexes without cached authority or partial fallback                                  |
| `site_review_route_no_route_rate`                      | missing registered pilot threshold or cohort rate above it                                                       | Site Product                           | study setup/permission mismatch, improve guided setup/recovery, never add broad fallback                                                  |
| `site_review_route_recipients_per_episode`             | missing registered usability bound or pilot percentile above it                                                  | Site Product + UX                      | review cardinality/noise/comprehension, do not truncate or treat 50 as target                                                             |
| `site_review_route_tenant_edit_affected_episode_count` | any edit above its preflight bound without current impact acknowledgement                                        | Site Product + Platform                | block save, refresh bounded impact, batch safely, never perform hidden mass handoff                                                       |
| `site_review_route_candidate_privacy_violation_total`  | any hidden person/name/capability fact exposed                                                                   | Phase 12 Security                      | P0 contain, assess disclosure, repair enumeration/projection uniformity, rerun hostile tests                                              |
| `site_review_route_comprehension_gate`                 | missing pre-registration or any registered safety/comprehension threshold missed                                 | Site UX Research                       | keep keys Reserved, revise copy/IA, repeat same protocol before rollout                                                                   |
| `site_review_route_a11y_release_gate`                  | any Core/WCAG blocker                                                                                            | Site UX + Accessibility                | block release, repair with shared primitives, repeat keyboard/AT/mobile/zoom proof                                                        |

## Current behavior, intended behavior, and permanent path

### Current repository behavior

- Core does not yet have the stable operational Site, Default Site Locale Plan,
  exact D20 review source adapters, Phase 12 capability atoms, or canonical
  Phase 17 Site notification writer required for D21.
- The current CMS public resolver still has a `siteId: null` seam, and current
  staff authorization remains broader/coarser than the accepted future Phase
  12 model.
- Contribution operations currently select same-Tenant `admin` and
  `super_admin` profiles for contribution-specific approval notification and
  write contribution-specific task/notification records. That is current
  behavior for another domain, not an accepted D21 precedent.
- Current demo/queue/task/CMS concepts cannot truthfully provide D21 routing,
  authorization, engagement, or migration behavior.

### Intended D21 behavior

Option 3 as corrected in this document: one private D20-specific responsibility
route hierarchy; Tenant inheritance by default; rare Site override; one visible
Tenant fallback that can be explicitly on or off; current authorization
intersection; stable routing legs; prospective settings; explicit differential
handoff for current reviews; personal Phase 17 items; and honest zero/unknown
states.

### Best permanent path

Carry the closed D15–D27 product/source contract forward, resolve D28's
decline/expiry recovery posture, mint exact Phase 12
capability and Phase 17 recipient-
role/key contracts together, implement one
typed route owner and one canonical writer, shadow its complete sets, then
activate future-only through bounded canaries. Do not preserve current broad
role-string behavior for local consistency and do not create an adapter that
lets it remain a second authority.

## Ruthless synthesis: what should actually happen

### Required before D21 is recorded

Completed by this document and its synchronized glossary/log amendments:

1. replace informal “reviewer route” with a D20-specific responsibility
   contract;
2. separate responsibility, current authorization, source review, notification
   presentation, and personal engagement;
3. close Site/Tenant precedence, explicit fallback on/off, proved-zero versus
   indeterminate, partial qualification, and no hidden tier;
4. choose stable routing legs and monotonic fallback;
5. make route settings prospective by default and current-review reassignment
   explicit and differential;
6. state no-route, privacy, clone/import/transfer/retirement, public/Giving/
   finance zero effects, and current-versus-permanent behavior; and
7. isolate route cardinality/completion for the now-closed D22 founder decision.

### Required in PRD/OpenSpec/design before implementation

1. Register exact Site/Tenant route-management and D20 view/action capability
   meanings in Phase 12. Do not infer identifiers from current roles.
2. Register the fixed D21 recipient role, the initial/successor routing
   occurrence relationship, route applicability/end reasons including
   responsibility reassignment, personal presentation, and all three D20 keys
   in one Phase 17 generation.
3. Amend D19/D20 “one occurrence” language to mean one source episode with one
   initial routing occurrence plus zero or more producer-authorized successor
   routing occurrences; preserve at most one active item per exact recipient.
4. Specify immutable route/policy/resolution records, current heads, same-scope
   relationships, constraints, RLS/grants, privilege poison matrix, indexes,
   retention/erasure, command receipts, outbox/reconciliation, and lock/CAS
   order.
5. Specify Base Maia screens and copy for Tenant setup, Site inheritance,
   override/fallback, candidate status, prospective save, explicit current
   handoff, no-route, indeterminate, concurrent completion, mobile, and weak
   network.
6. Link all 69 acceptance criteria and monitor/runbook owners. A new ADR is not
   currently required: D21 conforms to ADR-0027 and existing platform
   boundaries. Create one only if later design introduces a surprising,
   hard-to-reverse cross-domain tradeoff not already governed.

### Required implementation order

1. Land exact source/authorization/identity prerequisites; keep D20 keys
   unminted or Reserved.
2. Add route/resolution schema, constraints, indexes, RLS/grants, negative
   readers, and body-free audit with no notification writer.
3. Add narrow `packages/api` route-management, impact-preview, current-handoff,
   and receipt commands; direct browser writes remain revoked.
4. Build read-only effective coverage and no-route/unknown states, then route
   setup and explicit handoff using shared Base Maia components.
5. Shadow the generated resolver and route diffs against production-shaped
   fixtures; infer no members and present no item.
6. Carry D22's closed contract forward; complete D23, capabilities, recipient
   role, source/end, RLS, retention, accessibility, migration, operations, and
   proof pack; mint all three D20 contracts in one generation.
7. Canary one writer in a bounded cohort with pre-registered comprehension,
   route-size/no-route, latency, reconciliation, and error gates.
8. Roll forward to repair. Rollback stops new routing generations and hides
   unsafe presentation but preserves route, resolution, occurrence, source,
   actor, and engagement evidence; it never re-enables broad legacy fan-out.

### Monitor rather than pre-build

Only the named signals in the monitoring table qualify for monitoring. Route
size/no-route/comprehension/latency thresholds must be registered before pilot;
their absence blocks Live. Any access grant, cross-scope selection, hidden
fallback, incapable recipient, unknown-as-zero, partial release, duplicate,
revival, fallback bounce, removed actionable item, cloned identity, or public/
financial effect is a zero-tolerance stop condition—not acceptable drift.

### Strongest alternative and why it loses

The strongest alternative is **one explicitly named Site reviewer with manual
reassignment and no fallback**. It offers the clearest accountability and the
smallest resolver. It loses because every Site requires setup, one departure or
access loss strands notification, and it gives a small ministry no reusable
Tenant default. Corrected Option 3 naturally collapses to that simple behavior
when a Tenant chooses one reviewer, but safely supports explicit multi-Site
ownership and absence coverage without an availability engine.

## Traceability and documentation disposition

- Root `CONTEXT.md` defines the D20-specific **Default Site Locale Plan review
  responsibility route**.
- The Phase 24 decision log records the founder's Option 3 answer, this **Accept
  with required amendments** disposition, D22's closed answer, and the D23
  question.
- D19/D20 terminology is amended so immutable routing successors do not
  contradict one source episode or Phase 17 all-before-any release.
- The earlier D21 research appendices remain evidence and explicitly defer to
  this final synthesis where their provisional recommendations differ.
- ADR-0027 remains governing; no ADR, OpenSpec, schema, migration, runtime,
  ticket, commit, or staging action is produced by this Grill decision.

## Next Grill decision — D22 route shape and completion meaning

### Why this needs your decision

D21 now says **where responsibility comes from**. D22 must say what it means
when a route contains more than one person. This is visible product behavior,
not an implementation detail: it controls notification volume, accountability,
absence coverage, whether one review is enough, and whether Core would need a
new multi-approval state machine.

No current repository contract or vendor proves one universal team size. The
later product maximum must be a small code-owned bound, safely below Phase 17's
50-person execution ceiling, and validated before Live. D22 should choose the
meaning now without inventing an unsupported number.

### Option 1 — exactly one reviewer per route

**Staff experience:** Maria alone receives hope.org review items. If she loses
access, the explicit Tenant fallback/no-route behavior applies.

**Benefits:** clearest ownership, least noise, simplest UI and resolver.

**Costs/risks:** one departure, leave, or access change removes primary
coverage; Core still cannot infer that Maria is away while authorized.

### Option 2 — one or a deliberately small co-responsible set; any one may act

**Recommended.** The picker starts with one person and permits a small,
deliberate set. Every selected, currently authorized person receives a personal
item. One valid source review ends the review for everyone; read state remains
personal.

**Staff experience:** Hope Ministries normally chooses Maria. For a Site where
French and English staff share responsibility, it chooses Maria and Ana. Both
receive the review item. Maria opens hers, which clears only Maria's unread.
Ana completes the review first; source truth ends both actionable items without
pretending Maria reviewed it.

**Benefits:** keeps one-person accountability as the default, adds human
coverage without calendars/timers, and uses the existing one-review source
meaning.

**Costs/risks:** several people receive attention and may assume someone else
will act. UI must say **Either reviewer can complete this review**, encourage a
small intentional set, show current coverage, and prevent the later execution
ceiling from becoming a UX target.

### Option 3 — one primary plus ordered backups

**Staff experience:** Maria receives the item first. Ana receives it only after
an explicit handoff or backup transition.

**Benefits:** one clear owner at a time and low notification volume.

**Costs/risks:** “backup” does nothing for unreported absence unless Core adds
manual promotion or an availability/timer model; it creates another routing
state machine on top of the Tenant fallback.

### Option 4 — every named person must review

**Staff experience:** Maria and Ana must both approve before review completes.

**Benefits:** strongest consensus for unusually sensitive changes.

**Costs/risks:** this is not D20's current one-review meaning. It creates a new
quorum/multi-approval source workflow, increases delay, and becomes brittle
when anyone is unavailable.

### My recommendation and exact question

**My recommendation is Option 2 — one or a deliberately small co-responsible
set where any one authorized reviewer may complete the source review.** It gives
small ministries a clean one-person default, lets ministries add real human
coverage when needed, and avoids both a hidden escalation engine and a new
all-of approval workflow. The UI can explain it in one sentence: **Either
reviewer can complete this review.**

When a Tenant or Site review route names more than one person, do you choose my
recommended **Option 2**, or do you prefer **Option 1 — exactly one reviewer**,
**Option 3 — one primary plus ordered backups**, or **Option 4 — every named
person must review**? You may amend any option.

## Source index

### Governing repository evidence

- [ADR-0027 — One notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [Phase 12 — Full role and permission configuration](./phase-12-full-role-permission-configuration.md)
- [Phase 17 — System Messages and Template Management](./phase-17-system-messages-template-management.md)
- [Phase 17 executable manifest](./phase-17-system-message-executable-manifest.md)
- [D17 — Private Default Site Locale Plan](./phase-24-d17-private-default-site-locale-plan-adversarial-review.md)
- [D18 — Undated Default Site Locale Plan](./phase-24-d18-undated-default-site-locale-plan-adversarial-review.md)
- [D19 — State-driven Plan attention](./phase-24-d19-state-driven-plan-attention-adversarial-review.md)
- [D20 — Every review-required episode](./phase-24-d20-every-review-required-episode-adversarial-review.md)
- [Earlier D21 routing research](./phase-24-d21-review-recipient-routing-primary-research.md)
- [D21 adversarial primary research](./phase-24-d21-responsibility-routing-adversarial-primary-research.md)
- `packages/api/src/admin/contribution-operations/approval-notifications.ts`
- `packages/auth/permissions.ts`
- `apps/admin/src/cms/public/resolve-tenant.ts`

### Current primary external evidence

- [GitHub team code-review settings](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team)
- [GitLab merge-request approval rules](https://docs.gitlab.com/user/project/merge_requests/approvals/rules/)
- [GitLab CODEOWNERS reference](https://docs.gitlab.com/user/project/codeowners/reference/)
- [HubSpot content approvals](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
- [Microsoft group approvals](https://learn.microsoft.com/en-us/power-automate/group-approvals)
- [Contentful Tasks](https://www.contentful.com/help/content-and-entries/tasks/)
- [Contentful Entry Tasks API](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
- [Sanity Tasks](https://www.sanity.io/docs/user-guides/tasks)
- [Blackbaud Payment Assistant approval tiers](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html)
- [Blackbaud out-of-office approval settings](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-expense-edit-settings.html)
- [Blackbaud Approvals Manager](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/csrconnect-prod/content/csrc-approvals-manager.html)
- [Salesforce assigned approvers](https://help.salesforce.com/s/articleView?id=platform.approvals_step_approver.htm&language=en_US&type=5)
- [Salesforce delegated-approver discoverability](https://help.salesforce.com/s/articleView?id=000385979&language=en_US&type=1)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [W3C APG combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [W3C APG listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)

## Final judgment

Option 3 survives the adversarial review and is the best permanent direction
**only with the amendments in the exact corrected decision**. It gives a small
ministry one calm setup, a multi-Site ministry deliberate local ownership, and
staff a truthful handoff/no-route experience without permission grants, hidden
broadcasts, routing flaps, generic workflow machinery, or public/Giving/
financial coupling. Anything materially weaker—permission groups, all-admin
fallback, mutable recipient arrays, current-review mass reassignment, partial
release, timers, email, shared items, or copied Site reviewer identity—must be
rejected rather than treated as an implementation shortcut.

## Subsequent D31 Tasks Hub reconciliation

D21 route membership remains responsibility intent for review attention and
grants no permission or generic task ownership. D31/ADR-0183 may project a
source-backed task only from a separately registered current source action,
after intersecting exact responsibility with current action and visibility
authorization. It never falls back to D21 members, capability holders, all
admins, or a queue, and task assignment cannot become a review allowlist.
