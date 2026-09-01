# Phase 24 D17 — Private Default Site Locale Plan Adversarial UX Review

> **Status:** Completed `/grill-with-docs` decision evidence for D17. This is
> not a Phase 24 PRD, OpenSpec change, implementation plan, schema, migration,
> issue specification, or runtime authorization.
>
> **Founder choice:** Save one private planned default when the chosen Site
> Locale is not public-ready; keep the current Site Root Entry unchanged until
> a later reviewed activation.
>
> **Review date:** 2026-08-27
>
> **Later D18 clarification:** A Default Site Locale Plan carries no target
> date, launch date, due date, deadline, Plan reminder, expiry time, or planned/
> scheduled activation time. Its target Site Locale and actual terminal-event
> timestamps remain required. Audit timestamps are evidence only.
> Source-workflow dates/schedules remain source-owned; Mission Control owns
> shared-task due dates/reminders. Neither propagates timing or changes Plan/
> default truth.

## Final disposition

**Accept with required amendments.**

The founder choice solves a real staff-coordination problem without weakening
public truth. Staff can record “we intend to make French the default,” preserve
that intent across sessions and staff changes, and route missing work to its
actual owners. Visitors continue receiving the current complete website until
an authorized human performs D16's fresh reviewed activation.

The informal phrase “save a planned default” is unsafe by itself. It can easily
become a second default column, a stale readiness snapshot, an automatic future
switch, a copied CMS checklist, or a generic task engine. The permanent
corrected decision is:

> A **Default Site Locale Plan** is one private, Site-owned workflow intent
> naming one existing stable Site Locale that authorized staff may later
> propose as the default. At most one active Plan exists per exact Tenant,
> environment, and Site. It is not the current Default Site Locale, a public
> release, a Page draft, a publication approval, a schedule, or public truth.
>
> Saving, reviewing, routing, cancelling, or replacing a Plan changes no public
> default, Site Root Entry, Page, route, generation, canonical, `hreflang`,
> sitemap, cache, Giving, currency, provider, settlement, bank, receipt,
> ledger, or accounting fact. The current root continues using the sole current
> Default Site Locale Version from D16.
>
> Readiness is a permission-filtered projection of current source-owned facts,
> never a copied Plan field. Clearing the last blocker changes only the private
> display to **Ready to review**. It never activates from time, a task
> completion, a provider result, or a readiness event. A currently authorized
> human must review a newly compiled immutable D16 activation candidate and run
> the expected-head command.
>
> Cancelling or replacing a Plan changes only private intent. It never deletes,
> rewrites, unpublishes, unschedules, rejects, or rolls back Page, Navigation,
> translation, review, or publication work owned elsewhere. Terminal Plan
> history is retained under the accepted records policy.

### Plain-language result

Maria selects French (Canada), but the French homepage still needs a Website
publisher:

```text
French (Canada) is planned

hope.org still opens English (United States).
This planned change is private and will not go live automatically.

Needs another owner
French homepage · Website publisher review requested
```

When the homepage is later approved, Mission Control says **Ready to review**.
It still does not change `hope.org/`. Maria or another currently authorized
publisher previews the current French website and uses **Make French (Canada)
default** through D16.

## Evidence labels

- **Verified repository fact** — observed in current `develop`-based source,
  accepted ADR/OpenSpec material, or the D6–D16 decision chain.
- **Proposed repository fact** — present only in open PR #1323 or #1340 and not
  merged; useful evidence, not current authority.
- **Verified external fact** — supported by a current primary standard or
  official product source linked below.
- **Product judgment** — Core's selected proportional trade-off.
- **Assumption** — plausible but not yet proved with representative Core staff
  or production-shaped traffic.
- **Unresolved empirical unknown** — requires usability or operational
  evidence; it does not authorize guessing.

## Jobs to be done

### Staff planner job

“Let me record the language we intend to make default, understand what is
missing, and continue later without accidentally changing the live website.”

### Source owner job

“Show me the exact Page, Navigation, or publication work I own, without making
me infer the Site plan or granting me authority I do not already have.”

### Publisher job

“When the plan is actually ready, show me the current website and exact
consequence again, then let one authorized action change the default.”

### Visitor and donor assurance job

“Keep the current complete website and every explicit Page and Giving address
unchanged while staff plan privately.”

### Developer and operator job

“Keep planned intent structurally outside public resolution, derive readiness
from current owners, deduplicate coordination work, and make every command,
race, and recovery explainable.”

## Corrected D17 decision — normative language

### D17-R1 — A Default Site Locale Plan is private Site-owned intent

The **Default Site Locale Plan** belongs to one exact Tenant, environment, and
Site. It names one existing stable same-Site Site Locale that differs from the
current default. It belongs to the Site—not to the staff member who created
it—so staff departure or permission loss does not erase the ministry's plan.

D17 applies only to a non-retired Site that already has a current Default Site
Locale Version. A private Site choosing its first public/default locale uses
D6 Site Setup and **Go live**, not D17. A suspended Site MAY retain or prepare
private work when current safety policy permits, but it cannot activate until
the owning serving/safety facts become favorable. A retired, transferred,
tombstoned, or privacy-ineligible Site cannot create or activate a Plan.

The target is never a raw BCP 47 string, array position, URL, Page, country,
currency, provider locale, browser preference, or caller-supplied object.

### D17-R2 — Exactly one active Plan may exist per Site

At most one active Default Site Locale Plan exists per exact Tenant,
environment, and Site. Two people may collaborate on that Plan; Core does not
create competing personal plans.

Selecting the already-current default returns an honest idempotent **Already
default** result and creates no Plan. Choosing another future locale while a
Plan is active requires an explicit **Change planned language** review. A
successful change creates an immutable successor and marks the prior Plan
**Superseded**; it never overwrites history or silently uses “last save wins.”

### D17-R3 — Plan commands have zero public and financial effect

Creating, viewing, routing, revising, cancelling, or superseding a Plan MUST
produce zero mutation or invalidation of:

- the current Default Site Locale Version/head or Site Root Entry;
- public Page, Navigation, locale, route, allocation, host, canonical,
  `hreflang`, `x-default`, sitemap, robots, search, cache, analytics, or Public
  Site Generation truth;
- explicit Page/Giving URLs, QR codes, messages, documents, shares, or frozen
  artifacts; or
- Giving, Designation, presentment currency, Legal Entity, Tenant Stripe
  account, settlement, bank, receipt, tax, ledger, or accounting identity.

Public readers, root resolvers, public-generation compilers, search builders,
and public caches MUST have no dependency on Plan existence, target, state,
projection, task, or history. No public invalidation event is emitted by a Plan
command. The Plan/readiness projection does not query or render Giving
enablement; staff receive only the invariant assurance that Giving links and
settings are separate and will not change.

### D17-R4 — A Plan is distinct from the D16 activation candidate

A long-lived Plan preserves stable target intent. It may retain exact
source-reference revisions and last-check evidence for explanation and audit,
but it cannot freeze or claim public readiness.

Only after current source facts are favorable does a separate server command
compile the complete immutable D16 activation candidate. That candidate pins
the then-current default head, exact target locale/homepage, verified base,
route allocation, locale-exact Public Site Generation, Navigation, shell,
safety, actor authority, compiler/profile versions, and dependency digest.
Plan creation is never incomplete public-generation creation.

### D17-R5 — Readiness is derived from current source owners

The current Default Site Locale owner owns the live default. Site/Domain owns
the verified public base. Site Locale owns locale lifecycle. Page,
Navigation, presentation, and publication owners own their exact content and
release facts. Public Site Generation owns locale-exact serving truth. Safety
owners own restrictions.

Mission Control composes a private, permission-filtered readiness projection
from those facts and displays `checked_at`. Stored booleans such as `ready`,
`approved`, `published`, `owner_notified`, or copied Page titles/URLs never
become Plan authority. A source change, policy change, permission change, or
projection failure may move the display from **Ready to review** back to
**Needs attention**, **Changed since review**, or **Could not be checked**.

### D17-R6 — Saving a Plan never fabricates source work

Saving or changing a Plan does not translate, clone, create, edit, publish,
unpublish, schedule, approve, reject, withdraw, or delete Page, Navigation,
Presentation, message, document, or Giving content.

Staff may separately invoke only the source-native commands they are currently
authorized to perform. Existing drafts, editor leases, reviews, approvals,
schedules, releases, and human work remain intact. A stable operational
reference may be stored through ADR-0029's application-validated soft-reference
boundary; D17 adds no cross-schema Payload foreign key, synchronization engine,
or copied content/status truth.

### D17-R7 — Owner routing is typed, deduplicated, and subordinate

Each visible blocker names:

- what is missing in staff language;
- the source domain that owns it;
- the action the current user may take now;
- the safely named owning role or queue when visible; and
- whether one qualifying request already exists.

The initiator cannot choose or invent an assignee, approver, prior editor,
email address, role, or queue. Assignment never grants access to the underlying
record.

Where an accepted typed source collaboration contract exists, Core MAY create
at most one active Plan-specific attention lineage for the stable Plan lineage
× source owner × semantic cause × stable source object/placement. Target
identity joins that key only when changing target changes the work's semantic
meaning. Plan revision and source version are expected fences and receipt
evidence—not uniqueness partitions. When either advances without changing the
meaning, Core appends a stale/superseded observation and advances the same
attention lineage; it never creates another active request or notification.
Completion, dismissal, assignment, comment, or notification is coordination
evidence only; it never grants Page/Site/publication authority and never proves
readiness. The authoritative source is re-read.

Where no qualified owner queue exists, Core shows **No owner route is
available** with a safe next step and creates no guessed task. D17 does not use
today's finance-only Mission Control task helper as Site authority.

### D17-R8 — Save and routing outcomes are itemized, not distributed fiction

The Plan save is one authoritative Site-locale-policy command. Source-native
actions and owner requests are separate, resumable effects executed through
their own commands or a durable outbox. D17 does not create a cross-schema or
cross-owner distributed transaction.

If Plan save succeeds but one owner request fails, the Plan remains saved. The
receipt says exactly what succeeded, what could not be routed, and the safe
retry action. Retrying reuses the same semantic identities and attempts only
unresolved effects.

### D17-R9 — Permissions are independent and current

Capabilities separately govern:

- viewing a Plan and its permission-filtered readiness;
- creating, changing, or cancelling Plan intent;
- editing each source-owned Page/Navigation/presentation record;
- requesting an accepted owner review;
- viewing the authenticated private Preview;
- changing Site locale policy; and
- activating the complete D16 successor.

Every read and effect reauthorizes the current validated session, Tenant,
environment, Site membership, role/subrole, capability, authorization epoch,
target visibility, and source access. UI hiding is not enforcement. Task
assignment is not permission. AI acts only within the initiating human's scope
and stops before any activation or tenant-required publication approval.

### D17-R10 — Readiness never activates automatically

Clearing the last blocker changes only the private projection to **Ready to
review**. Time, target dates, reminders, Page publication, task completion,
provider success, search/cache convergence, job execution, or an automation
event never advances the current Default Site Locale head.

D17 creates no scheduler, “activate when ready” flag, cron switch, hidden timer,
or automatic fallback. Later D18 forbids Plan-owned/derived timing while
preserving independent source-workflow schedules and Mission Control timing; it
does not change this no-auto-activation invariant.

### D17-R11 — Final activation always starts from fresh D16 proof

**Review and make default** compiles a fresh immutable D16 candidate. Staff see
the exact current/after/unchanged impact again and preview the current candidate
website. Activation rechecks the active Plan revision, expected current default
head, target identity, all readiness owners, actor authority, Site lifecycle,
and D16 dependency digest.

If facts differ, the action does not rebase silently. It returns the Plan to a
clear review state with the changed facts. Only the D16 activation receipt may
mark a Plan **Activated**. When activation originates from the Plan, advancing
the Default Site Locale head, recording the matching D16 receipt, and making
the Plan terminal **Activated** commit as one operational transaction or none
does. Search/cache/provider convergence remains downstream outbox work.

If another locale became the current default while the Plan remained active,
**Review changed default** appends an immutable review revision inside the same
active Plan lineage. It preserves the planned target, pins the new current
Default Site Locale Version and current/after/unchanged impact, and supersedes
the prior review basis with zero public or source effect. Only that explicitly
reviewed revision may compile the fresh D16 candidate. If the planned target
itself became current, Core uses **Satisfied elsewhere** instead of rebasing.

### D17-R12 — Cancellation and replacement are narrow and reversible

**Cancel planned change** terminates only the private Plan intent and qualifying
Plan-specific coordination projections. Every terminal Plan outcome—Cancelled,
Superseded, Activated, Satisfied elsewhere, or No longer applicable—
idempotently closes or supersedes only its Plan-specific active requests and
pending notifications. It never deletes, rewinds, rejects, unpublishes,
unschedules, or edits source-owned work. A source owner decides whether
independently useful work continues. The terminal command receipt itemizes
request cleanup and safely retries unresolved cleanup with the same identity.

Cancellation shows the exact current default and serving consequence before
confirmation.

For a serving Site:

> `hope.org/` will keep opening English (United States). French (Canada)
> content and existing review work will not be deleted.

For a suspended Site:

> English (United States) remains default. This Site remains suspended and is
> not currently public. French (Canada) content and existing review work will
> not be deleted.

No typed phrase or generic danger ceremony is required. An optional reason may
be retained for history; D17 does not invent a mandatory comment policy.

### D17-R13 — Lifecycle is small and terminal history stays terminal

Durable Plan states are:

- **Active** — one private target intent exists;
- **Cancelled** — authorized staff ended the intent;
- **Superseded** — an explicit successor Plan replaced it;
- **Activated** — the matching D16 receipt changed the default;
- **Satisfied elsewhere** — another authoritative receipt made the same target
  current; and
- **No longer applicable** — a source-owned terminal Site/target event made
  continuation impossible.

**Needs attention**, **Waiting for owner**, **Ready to review**, **Changed since
review**, **Current default changed**, **Target unavailable**, **Could not be
checked**, and **Confirming outcome** are derived presentation states, not
stored lifecycle authority.

Cancelled, Superseded, Activated, Satisfied elsewhere, and No longer applicable
Plans cannot reopen. Continuation creates a new Plan. Source terminality must be
proved by its owner; a transient outage cannot silently close intent.

### D17-R14 — Concurrency, idempotency, and unknown outcomes have one winner

Create, replace, cancel, and activate use semantic business idempotency,
expected revisions, a bounded lock order, and compare-and-swap. The same key
and meaning returns the original receipt. The same key with changed Tenant,
Site, target, expected head, or meaning is rejected.

Race outcomes:

- cancel first → activation rejects against terminal intent;
- activation first → cancel reports **Already activated** and never undoes it;
- replace first → the prior candidate rejects and the successor stays private;
- another default first → the Plan becomes **Current default changed** and
  requires the zero-effect **Review changed default** revision before another
  candidate;
- the planned target becomes current elsewhere → reconcile **Satisfied
  elsewhere** without claiming the Plan caused it; and
- a lost response → read command receipt/effect truth before another action.

An activation-from-Plan race cannot leave both a changed default and an active
Plan: the current-head advance, D16 receipt, and Plan terminal outcome are one
atomic business effect.

### D17-R15 — Database, grants, RLS, and privileged paths preserve the model

Any later operational schema MUST make one active Plan per exact Tenant,
environment, and Site structurally enforceable through a partial unique
constraint or equivalent. Same-scope relationships bind the Plan, stable Site,
target Site Locale, and expected current Default Site Locale Version. Scope,
target identity, provenance, and terminal outcomes are immutable; deletion is
restrictive; events/receipts/history are append-only; indexes cover active
Site lookup, target references, reconciliation, and source-routing dedupe.

The eventual design may choose a stable lineage plus immutable revisions or an
equivalent smaller form; D17 does not pre-name tables. It MUST NOT use a
nullable `planned_locale_id` beside `default_locale_id` as a second read path.

If browser roles receive direct table access, `SELECT`/`DELETE` use correct
`USING`, `INSERT` uses `WITH CHECK`, and `UPDATE` uses both. Prefer a narrow
server-owned command/projection boundary. `anon` has no Plan access. Actor,
Tenant, environment, Site, target, expected head, owner route, lifecycle,
authority, and audit attribution derive from trusted server/session context,
never caller fields.

Service role, table owner/`BYPASSRLS`, Payload Local API, RPC/
`SECURITY DEFINER`, worker, import, migration, support, impersonation,
break-glass, AI, direct Data API, and repair paths use the same command boundary
or repeat identical structural checks. A definer function uses schema-qualified
objects, a pinned empty `search_path`, revoked `PUBLIC` execute, and
least-privileged grantees.

### D17-R16 — Private projections are scoped, fresh, and non-enumerating

Every private cached function receives exact Tenant, environment, Site, Plan
lineage/revision, source scope/revisions, and projection version as key
arguments. Neither global-ID assumptions nor an epoch alone isolates Tenant or
environment. Private caching SHOULD store authorization-neutral source facts
and apply current permission filtering after the cache read. If an already
filtered projection is cached, its key additionally includes the complete
stable authorization partition: principal ID or a proved-equivalent audience,
membership/authorization epochs, role/subrole, capability and field-visibility
policy digests, and restricted-resource scope. Nominal role or “staff audience”
never isolates. Every render reauthorizes, and adverse permission changes
bypass freshness. Tags only invalidate. Plan details never enter a public cache,
generation, sitemap, search document, public analytics label, or unauthenticated
notification.

A **Ready to review** projection older than `300` seconds is not displayed as
current. A missed private invalidation self-heals within that provisional hard
ceiling. Adverse safety/permission changes bypass ordinary freshness.

Hidden or forbidden resources contribute no title, count, owner, locale,
record ID, timing distinction, deep link, or existence signal. The projection
uses bounded opaque causes and privacy-safe totals only when the actor may see
every represented item.

### D17-R17 — Failure stays private, truthful, and recoverable

Before any command commits, authorization, scope, collision, stale-revision, or
target failure changes nothing. After Plan save, routing/projection/provider
failures cannot unsave the Plan or change public truth.

Mission Control distinguishes:

- **Plan saved**;
- **Review requested**;
- **Could not request review**;
- **Could not check readiness**;
- **Your permissions changed**; and
- **Confirming whether your change was saved**.

It never claims **Ready**, **Review requested**, **Activated**, or **Owner
notified** without the matching source evidence. Diagnosis, retry,
reconciliation, and forward correction operate per source effect.

### D17-R18 — Staff UX is consequence-led and intentionally small

Mission Control places the Plan under **Site → Languages** in the existing
`base-maia`, Base UI, Zinc-token system. It is not a separate project manager,
calendar, workflow builder, CMS release center, or localization dashboard.

The primary review shows:

- exact Site and environment;
- **Current default** and exact unchanged serving state; a suspended Site says
  it is not currently public and never claims a live root;
- **Planned** locale;
- **You can do now** and **Needs another owner** groups;
- an **Unchanged** assurance that Giving links/settings and explicit URLs are
  separate from the Plan;
- the exact effects of saving, including owner-request count;
- optional authenticated Preview;
- one clear primary action; and
- permanent copy saying the Plan is private and never goes live automatically.

While incomplete, the Plan exposes **Continue setup**, **Change planned
language**, and **Cancel plan**. When ready, it exposes **Preview French
website** and **Review and make default**. Technical IDs, headers, generation
digests, task engines, cache tags, and provider jargon stay out of the ordinary
journey.

### D17-R19 — Accessibility, mobile, and weak-network behavior are release gates

The complete journey MUST meet WCAG 2.2 AA and Core's frontend/accessibility
contract. Use native semantics and existing Base UI primitives. Labels, help,
and errors are programmatically associated; status uses text plus icon, never
color alone. The DOM, visual, and keyboard order match. Visible focus is never
obscured by sticky/floating UI. Async updates such as **Plan saved**, **Review
requested**, and **Readiness changed** are announced without stealing focus or
becoming chatty.

Interactive targets meet WCAG 2.2's `24 × 24` CSS-pixel minimum or its defined
spacing exception; Core's `44 × 44` convention applies to primary, destructive,
and adjacent mobile controls. The journey supports keyboard, screen reader,
forced colors, reduced motion, 320-CSS-pixel reflow, 400% zoom, long/CJK/RTL
text, bidirectional URL isolation, and preserved input/focus after failure.

Core Plan read/create/replace/cancel remains available through server-rendered
HTML and server-backed forms when client JavaScript fails after page delivery;
JavaScript may enhance but never own the durable action. Preview may remain an
enhancement. Actions are server-authoritative and idempotent; optimistic UI
never claims a durable effect first.

### D17-R20 — Migration, traceability, and proportional scope are mandatory

Migration starts with no Plans. Locale existence, current defaults, drafts,
tasks, Page translations, traffic, or documentation never fabricate staff
intent through backfill.

The later specification flow lands additive private readers/constraints/RLS
before writers, proves no public dependency, shadows readiness, enables one
Site cohort, adds source-routing adapters individually, and only then allows
D16 activation from a Plan. Old code ignores private Plan data. New code
without compatible schema hides Plan controls and changes nothing public.
After Plan writes, UI rollback may hide the feature but data/history remains;
recovery rolls forward.

D17 does not ship arbitrary stages, Plan-owned or Plan-derived priorities,
comments, dates, personal
assignee selection, recurrence, schedules, conditional rules, workflow
builders, translation automation, a second approval system, or a second public
activation path.

The exact terms **Default Site Locale Plan**, **Default Site Locale Version**,
**Site Root Entry**, **Site Locale**, **Public Site Generation**, and **Mission
Control Task** must remain coherent through glossary, ADR amendments, PRD,
OpenSpec, design, tasks, tickets, schema, tests, release evidence, and runbooks.

## Complete staff journey

The ordinary examples below show a serving Site. When the Site is suspended,
every consequence area instead says **English (United States) remains default ·
This Site is suspended and is not currently public · Nothing changes
automatically**. Suspension remains a readiness blocker, so the Plan cannot show
**Ready to review** or expose activation until a fresh favorable serving/safety
check succeeds.

### 1. Choose an existing Site Locale

**Site → Languages** keeps the ordinary list compact:

```text
Website default language

English (United States)                         Default
French (Canada)                                Not ready · 2 items
French (France)                                Live
```

Selecting French opens one focused review. Core does not create a locale,
translation, or Page merely because staff select it.

### 2. Explain the consequence before asking for commitment

```text
Plan French (Canada) as the website default?

Current website
hope.org still opens English (United States)

Planned
French (Canada)

Nothing public changes when you save this plan.
It will not go live automatically.
```

The copy avoids **Draft default**, **Submit**, **Pending**, and **Save
settings** because those labels do not say whether the live website changed.

### 3. Group work by action, not by subsystem

```text
You can do now
✓ Finish French navigation                         [Open navigation]

Needs another owner
○ French homepage needs Website publisher approval
  Review requested · 27 Aug                        [Open homepage]

Unchanged
Giving links and settings are separate and will not change.
```

Rows say what is missing, who owns it, what the current user may do, and what
happens next. They do not expose hidden records or make status pills clickable.

### 4. Make the primary action disclose its effects

If saving will also create one qualified owner request, the primary action is
**Plan French (Canada) and request 1 review**. If no qualified route exists, it
is **Plan French (Canada)** and the row explains the safe manual next step.
**Not now** is always safe.

There are no per-item checkboxes, arbitrary assignee picker, typed confirmation,
or dense readiness matrix.

### 5. Confirm private success plainly

```text
French (Canada) is planned

hope.org still opens English (United States).
The planned change is private and will not go live automatically.

1 owner review requested

[View planned change]  [Continue setup]
```

If routing partly failed, the receipt keeps **Plan saved** separate from
**1 review could not be requested** and offers a scoped retry.

### 6. Keep the Plan visible where staff expect it

The Languages row becomes:

```text
French (Canada)
Planned · 2 items remaining
hope.org still opens English (United States)
[Continue setup]
```

Authorized source owners may also see their exact work in the existing shared
Mission Control work view. The Site Plan remains the coordination context; a
task never becomes default or publication truth.

### 7. Becoming ready still changes nothing public

```text
French (Canada) is ready to review

hope.org still opens English (United States).
Review the final website before making French the default.

[Preview French website]  [Review and make default]
```

If the homepage changes after review, the display becomes **Changed since
review** and routes staff to the latest source. No stale approval badge survives.

### 8. Replace intent explicitly

```text
Change the planned language to French (France)?

The French Plan and its Plan-specific follow-ups will close and move to history.
French content and source-owned review/approval records stay unchanged.
hope.org stays English (United States).

[Keep French (Canada) plan]  [Plan French (France) instead]
```

Concurrent changes produce one winner and a clear refresh, never silent last
write wins.

### 9. Cancel without threatening source work

```text
Cancel the planned default?

This Plan and its Plan-specific follow-ups will close and move to history.
French content and source-owned review/approval records stay unchanged.
hope.org stays English (United States).

[Keep plan]  [Cancel planned change]
```

Focus returns to the French row after closing or completion. Success itemizes
closed follow-ups, is announced, and leaves history available to authorized
staff.

### 10. Work well in the field

On a phone, Current, Planned, and the three action groups stack in one reading
order. The primary action is reachable without a sticky footer covering focus.
On a weak connection, save/retry preserves work and reconciles the original
command. Staff can understand blockers and continue without loading Preview.

## Source of truth and ownership map

| Fact                                     | Authoritative owner                                  | Derived consumers                         | Forbidden ownership               |
| ---------------------------------------- | ---------------------------------------------------- | ----------------------------------------- | --------------------------------- |
| Current Default Site Locale Version/head | Site locale-policy owner under D16                   | root resolver, staff, effect compiler     | Plan, task, CMS, provider         |
| Default Site Locale Plan intent          | Site locale-policy planning owner in Asym Postgres   | staff readiness, audit, owner routing     | public runtime, Payload, task row |
| Target Site Locale lifecycle             | Site Locale owner                                    | Plan/readiness/activation                 | raw tag, Plan copy                |
| Homepage/Navigation/content/review       | Page/Navigation/publication owners                   | readiness and D16 candidate               | Plan or task                      |
| Locale-exact serving generation          | Public Site Generation owner                         | readiness, Preview, root after activation | Plan                              |
| Private readiness display                | rebuildable permission-filtered projection           | Mission Control UI                        | stored `ready` flag               |
| Owner work/request                       | registered source command and shared task projection | assignee work views, Plan receipt         | task completion as readiness      |
| Authenticated Preview                    | CMS/public-preview boundary                          | authorized staff                          | public cache/search/share         |
| D16 activation candidate/receipt         | Site/default activation command                      | current head, history, support            | Plan readiness or provider event  |
| Public root/search/cache                 | D16 source composition                               | visitors and external observations        | any D17 command                   |
| Giving and financial identity            | Giving/finance source owners                         | exact donor/finance flows                 | Plan, locale, task                |

## Domain invariants and valid cardinality

1. One exact Site has at most one active Default Site Locale Plan.
2. Exactly one current Default Site Locale Version remains the only public
   locale-selection head.
3. Plan scope, target Site Locale, and expected current default share Tenant,
   environment, and Site through structural proof.
4. A Plan target is one stable Site Locale and cannot equal the current default
   at creation.
5. Plan commands create zero public, Giving, provider, or financial effect.
6. Public readers and caches cannot read Plan state.
7. Readiness is derived and timestamped; it cannot be caller-edited or treated
   as activation proof.
8. A Plan never activates from readiness, time, task, publication, provider,
   cache, or job state.
9. Final activation compiles one fresh D16 candidate and rechecks current
   authority.
10. Cancel, replace, and activate are mutually fenced terminal effects for one
    active Plan revision.
11. Terminal Plans never reopen or reuse identity.
12. Plan cancellation never destroys or rewrites source-owned work.
13. One active owner attention lineage exists at most once at the stable Plan
    lineage/source-owner/semantic-cause/stable-object-or-placement grain, plus
    target only when semantic meaning changes. Plan/source revisions fence and
    update that lineage; they never partition uniqueness or duplicate notice.
14. Task state never grants permission or proves source readiness.
15. Hidden resources contribute no existence signal.
16. Historical actor attribution remains exact even if current staff continue
    the Site-owned Plan.
17. No Plan carries Giving, currency, Legal Entity, Stripe, settlement, bank,
    receipt, tax, ledger, or accounting identity.
18. No existing locale, content, task, or default is inferred into a Plan.

## Lifecycle and transition model

| Durable state        | Meaning                                   |                      Public effect | Valid next movement                              |
| -------------------- | ----------------------------------------- | ---------------------------------: | ------------------------------------------------ |
| Absent               | no private intent                         |                               none | create                                           |
| Active               | one private target intent                 |                               none | continue, cancel, replace, prepare D16 review    |
| Cancelled            | staff ended private intent                |                               none | new Plan only                                    |
| Superseded           | explicit successor replaced intent        |                               none | read history                                     |
| Activated            | matching D16 receipt changed default      |                    D16 effect only | read history, later new Plan                     |
| Satisfied elsewhere  | another receipt made target current       | external authoritative effect only | read history                                     |
| No longer applicable | source owner proved terminal scope/target |                               none | read history, source-owned successor if eligible |

Forbidden transitions include Active → current through a readiness event,
timer, task completion, source publication, provider event, cache refresh,
worker, import, or direct row update; terminal → Active by mutation; and any
state → another locale, Site, Page, Giving, or finance fallback.

## Current behavior, intended behavior, and permanent path

| Concern            | Current `develop` behavior                                                                                                        | D17 intended behavior                                     | Permanent path                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| Site/default model | no implemented stable Site/default-locale authority; public context has `siteId: null`                                            | one private Plan subordinate to D16 current head          | land reconciled D15/D16 model before D17                     |
| CMS drafts         | Payload Pages support versions/drafts/autosave and private Preview; current model is Tenant-scoped, not final Site/locale lineage | source work stays private and source-owned                | consume accepted exact-locale Page/Navigation contracts      |
| Readiness          | no Phase 24 readiness compiler                                                                                                    | derived, permission-filtered, timestamped                 | compose bounded current owner facts; never copy              |
| Tasks              | shared tables exist, but writer/types are finance/contribution-shaped and lack task semantic dedupe                               | subordinate typed Site-owner coordination                 | harden shared task service and add a registered Site adapter |
| Permissions        | current Mission Control staff depth is broader than final per-capability posture                                                  | independent view/plan/source/review/activate capabilities | server-side capability commands plus RLS defense             |
| Public root        | current English-oriented `/` and `siteId: null`; D16 remains planning evidence                                                    | Plan has no public dependency                             | D15/D16 reader/writer and cohort migration first             |
| Workflow           | no Default Site Locale Plan runtime                                                                                               | one small Site-owned intent                               | no generic workflow/scheduler/task engine                    |
| Migration          | no eligible Plan history                                                                                                          | start empty                                               | additive private rollout with no inferred backfill           |

## Adversarial category review

Every requested category has a material concern if “save one private planned
default” remains informal. The selected direction is sound; the risk comes
from leaving authority, lifecycle, UX, and failure behavior undefined.

### 1. Problem validity, necessity, and alternatives

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                               | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                                                                                                                                  | Effect on D17                                                  | Permanent fix and exact language                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff may lose an unfinished default-language intention across sessions, staff changes, and source-owner handoffs. The strongest alternative—show blockers but save nothing—has less state but recreates memory, repeated navigation, and side-channel coordination. |           High / High | **Repository fact:** platform principles prefer durable system behavior over repeated manual glue. **External fact:** Payload, Sanity, Contentful, HubSpot, and WordPress all separate private work/review from published truth. **Assumption:** representative Core ministries have not yet quantified how often language launches span roles or days. | Confirms Option 1 but narrows it to one small Site-owned Plan. | **D17-R1–R2 and R18:** persist one private intent, current consequence, readiness, and owner routes; do not build a generic project/workflow product. |
| Saving a Plan for a target that is already ready can add a needless step.                                                                                                                                                                                            |       Medium / Medium | **Product judgment:** the Plan is justified by unfinished coordination, not as ceremony for every change.                                                                                                                                                                                                                                               | Narrows when D17 applies.                                      | **D17-R1 and R11:** ready changes may proceed directly to D16 review; choosing the current default is a no-op.                                        |

### 2. Brittleness

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                      | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                                  | Effect on D17                    | Permanent fix and exact language                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| A long-lived Plan that copies Page approval, Navigation completeness, host readiness, assignee, or generation state works only until any owner changes. It could later activate stale or withdrawn content. |       Critical / High | **Repository fact:** D6/D16 use fresh expected-head proof; ADR-0029 rejects copied operational authority. **External fact:** Microsoft cancels in-flight approval when the reviewed item changes; Sanity release versions become independent snapshots. | Strongly narrows the data model. | **D17-R4–R5, R11, R16:** preserve stable intent and evidence history, derive readiness, display `checked_at`, and compile a fresh D16 candidate. |

### 3. Technical debt

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                       | Severity / likelihood | Evidence and reasoning                                                                                                                                                                          | Effect on D17                                   | Permanent fix and exact language                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| A `planned_locale_id` column next to `default_locale_id`, copied blocker checklist, custom approval states, scheduler, and task list would create several mutable authorities and a bespoke workflow engine. |       Critical / High | **Current source:** no Site plan exists; current task helper is finance-only. **Repository fact:** Phase 34 owns arbitrary workflow behavior and D13 rejects generic tasks as source authority. | Rejects the naive implementation, not Option 1. | **D17-R2, R5, R7, R10, R15, R20:** one Plan, derived readiness, registered source/task adapters, no second default or workflow DSL. |

### 4. Edge cases

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                                            | Severity / likelihood | Evidence and reasoning                                                                                                            | Effect on D17                                               | Permanent fix and exact language                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The Site may be private, suspended, retired, or concurrently changing default; the target may already be current, become unavailable, be withdrawn, become current elsewhere, lose its owner, or have zero/one/many visible blockers. Undefined outcomes confuse staff or create invalid history. |           High / High | **Repository fact:** D6–D8 and D15–D16 distinguish setup, suspension, retirement, stable locale identity, and current-head truth. | Adds explicit scope, terminal outcomes, and derived states. | **D17-R1–R2, R13–R14:** D6 handles first launch; suspension blocks activation; terminal scope cannot plan; no-op/current, stale, satisfied-elsewhere, and unavailable outcomes are explicit. |

### 5. Footguns

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                       | Severity / likelihood | Evidence and reasoning                                                                                                                                                                  | Effect on D17                                       | Permanent fix and exact language                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Make default when ready” could auto-switch visitors; cancelling could delete French drafts; changing target could silently overwrite Maria's plan; an assignee picker could imply permission; optimistic UI could claim a save that failed. |       Critical / High | **External fact:** mature tools distinguish Draft/Pending/Scheduled/Published and expose cancel/reassign separately. **Repository principle:** public optimism cannot outrun authority. | Requires consequence-led controls and server truth. | **D17-R3, R7, R10, R12, R14, R17–R19:** no auto activation, narrow cancellation, explicit replacement, owner-derived routing, idempotent server receipts. |

### 6. Tenant safety

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                           | Severity / likelihood | Evidence and reasoning                                                                                                                                                     | Effect on D17                                        | Permanent fix and exact language                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cross-Tenant target IDs, blocker counts, Page titles, Preview URLs, owner identities, task links, cache entries, or timing could reveal another ministry or restricted location. |     Critical / Medium | **Accepted OpenSpec:** tenant isolation is structural and hidden records must not leak. **Current source:** final Site scope is not implemented and `siteId` remains null. | Blocks D17 before D15/D16 trusted Site scope exists. | **D17-R1, R5, R7, R9, R15–R16:** composite scope, current authorization, audience-complete cache keys, non-enumerating projection, poison tests. |

### 7. Database, RLS, and authorization safety

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                           | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                   | Effect on D17                                          | Permanent fix and exact language                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application-only uniqueness can admit two active Plans; caller-set scope/status/owner can move a permitted row into forbidden state; permissive service/Payload/RPC paths can bypass Page or Site authority; cascade deletion can erase history. |     Critical / Medium | **Accepted OpenSpec:** application checks plus RLS defense in depth. **Current source:** Mission Control task tables are service-role-only and links do not encode a same-Tenant composite relationship. | Requires a narrow command boundary and database proof. | **D17-R9 and R15:** one-active constraint, same-scope relationships, immutable provenance, restrictive deletion, operation-correct `USING`/`WITH CHECK`, trusted server attribution, privileged-path poison matrix. |

### 8. Overengineering

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                 | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                | Effect on D17                          | Permanent fix and exact language                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Configurable stages, Plan-owned priorities/dependencies/comments/dates/reminders, arbitrary assignees, recurrence, calendars, rules, and scheduling would turn one locale intention into a project-management product. |           High / High | **External evidence:** Sanity/Contentful/Blackbaud provide powerful release/workflow products, but Core already has source review and a shared task direction. **Repository fact:** Phase 34 owns arbitrary workflow. | Keeps the solution deliberately small. | **D17-R18 and R20:** one Plan, derived action groups, source-owned actions, subordinate task projections; later D18 rejects Plan-owned timing while preserving independent source-workflow schedules and Mission Control task timing. |

### 9. UX/UI and user friction

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                 | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                                                                                       | Effect on D17                                        | Permanent fix and exact language                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Planned default,” “Pending,” or “Save settings” can make staff believe the website switched, will switch automatically, or owns content publication. A dense matrix and disabled controls would hide the next action. |           High / High | **Assumption:** Core has not yet usability-tested these labels. **External evidence:** HubSpot shows Pending/Approved/Canceled; Sanity uses explicit Run release; Payload separates Draft/Published/Changed. Product judgment requires even clearer consequence copy because D17 is not content publication. | Adds a complete consequence-led journey and testing. | **D17-R18–R19:** Current/Planned/live consequence, three action groups, effect-labelled primary action, private success receipt, Ready still private, accessible cancel/replace. |
| Automatic notification to every possible editor would create noise and distrust.                                                                                                                                       |         Medium / High | **External fact:** Contentful team assignment can notify every team member. **Repository direction:** coordination must be tenant/role safe and deduplicated.                                                                                                                                                | Narrows routing UX.                                  | **D17-R7–R8:** at most one source-qualified request per exact grain; show existing request; never guess recipients.                                                              |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                  | Severity / likelihood | Evidence and reasoning                                                                                                                      | Effect on D17                     | Permanent fix and exact language                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Plan, task, CMS draft, readiness projection, Public Site Generation, and current default could each claim the future/live state. Circular synchronization would make activation and cancellation impossible to explain. |       Critical / High | **Accepted ADR/OpenSpec:** CRM/operational and CMS/public truths remain distinct; ADR-0029 is reference-not-copy; D16 has one current head. | Requires a one-way authority map. | **D17-R1, R3–R7, R11 and invariants 1–18:** Plan owns intent only; sources own work/readiness; task coordinates; D16 alone activates; public readers never consume Plan. |

### 11. Hidden coupling

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                    | Severity / likelihood | Evidence and reasoning                                                                                                                               | Effect on D17                                        | Permanent fix and exact language                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Plan cancellation could implicitly cancel Page review; task completion could mark content ready; creator departure could orphan intent; task helper's finance queue could receive Website work; a CMS draft could be treated as the Plan. |           High / High | **Current source:** task writer hard-codes `finance_operations`/`contribution_operations`; Payload drafts and public reads have their own lifecycle. | Requires explicit seams and migration prerequisites. | **D17-R1, R5–R9, R12 and R20:** Site-owned Plan survives creator, source work stays independent, task adapter is qualified before use, no hard CMS coupling. |

### 12. Failure modes

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                             | Severity / likelihood | Evidence and reasoning                                                               | Effect on D17                                          | Permanent fix and exact language                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ------------------------------------------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan save may succeed while routing fails; readiness may be unavailable; an activation response may be lost; a task notification may be delayed; a provider or source read may be ambiguous. A single “Something went wrong” invites duplicate Plans and requests. |           High / High | **Repository fact:** D13/D16 itemize source outcomes and reconcile unknown commands. | Adds independent effect receipts and forward recovery. | **D17-R8, R14, R17:** Plan persists independently, itemized partial results, same-identity retry, authoritative receipt lookup, no public fallback or second submit. |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                          | Severity / likelihood | Evidence and reasoning                                                                               | Effect on D17                         | Permanent fix and exact language                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ---------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cancel/replace/activate races or a different default activation can jointly violate one-plan/one-default meaning. Backdated timestamps, readiness events, or retries could make obsolete intent appear current. |       Critical / High | **Repository fact:** D6/D15/D16 use expected heads, immutable receipts, CAS, and forward correction. | Requires a complete state/race model. | **D17-R2, R10–R14:** one active Plan, terminal outcomes, current-head proof, semantic idempotency, one race winner, timestamps are evidence only. |

### 14. Data integrity risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                           | Severity / likelihood | Evidence and reasoning                                                                                                    | Effect on D17                                                | Permanent fix and exact language                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Duplicate Plans/tasks, dangling target references, stale approvals, orphaned creator ownership, copied URLs, destructive cancellation, or inferred backfill can produce false intent and irreconcilable history. |     Critical / Medium | **Current source:** no Plan exists; task rows lack semantic dedupe. **ADR-0029:** stable references and operational-wins. | Requires structural relationships and start-empty migration. | **D17-R1–R8, R12, R15, R20:** Site-owned intent, stable same-scope references, dedupe, restrictive deletion, source preservation, no inferred Plan backfill. |

### 15. Security and privacy risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                                                                  | Effect on D17                            | Permanent fix and exact language                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Private launch intent, restricted ministry language/location, draft titles, owner identities, Preview, comments, raw URLs, or cross-Tenant IDs can leak through public APIs, caches, logs, notifications, exports, backups, or support tools. |     Critical / Medium | **Accepted platform boundaries:** role scope, public/auth separation, secrets and sensitive actions server-side. **External fact:** Payload draft visibility depends on access control. | Makes privacy a structural release gate. | **D17-R3, R7, R9, R15–R17, R19:** no public dependency, current read authorization, redacted telemetry, private Preview, minimal notifications, retention schedule, poison tests. |

### 16. Scalability and performance risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                        | Effect on D17                                                            | Permanent fix and exact language                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every Plan view could scan all Pages/locales/tasks, call Payload/providers serially, or enumerate all Tenants. A readiness fan-out or notification burst would degrade large Sites and noisy tenants. |         High / Medium | **Repository fact:** ADR-0030 requires complete function arguments and bounded caching; proposed Phase 23 uses generation manifests. **External fact:** Sanity documents release-size and concurrency limits. | Requires bounded, indexed, batched composition—not speculative sharding. | **D17-R5, R7–R8, R16, R20:** indexed one-Site lookup, source-batched manifests, bounded projection, exact dedupe, no public hot path, production-shaped p50/p95/p99 proof. |

### 17. Operational burden

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                                                | Effect on D17                                                                     | Permanent fix and exact language                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff could need spreadsheets, repeated Page searches, copied links, manual reminders, SQL fixes, or developer-created tasks to keep a Plan moving. Conversely, automatic nagging could annoy owners during legitimate long translation work. |         High / Medium | **Platform principle:** reduce manual glue without weakening boundaries. **Unknown:** representative ministry launch duration and reminder preference are unmeasured. | Supports Plan visibility and routing but rejects automatic expiry/nagging in D17. | **D17-R7–R8, R18, R20:** one persistent Site view and qualified shared-work projection; no Plan-owned expiry/reminder/schedule. Later D18 records no Plan-owned/derived timing while preserving independent source-workflow and Mission Control timing. |

### 18. Observability and auditability gaps

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                         | Severity / likelihood | Evidence and reasoning                                                                                           | Effect on D17                                       | Permanent fix and exact language                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logs cannot prove who planned what, whether public state changed, which routing effects succeeded, why readiness changed, whether another command satisfied the Plan, or which activation receipt consumed it. |           High / High | **Repository principle:** durable business history, technical telemetry, and external observations are distinct. | Adds immutable receipts/history and named monitors. | **D17-R4–R5, R8, R11–R17:** actor/authority, Plan revisions, expected heads, source evidence, itemized effects, terminal cause, activation receipt, and redacted monitors. |

### 19. Dependency and integration risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                | Severity / likelihood | Evidence and reasoning                                                                                                                  | Effect on D17                                         | Permanent fix and exact language                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payload status, a CMS plugin, Mission Control task, Inngest job, notification provider, Vercel state, or external workflow may be mistaken for readiness/activation authority; provider delay or schema change could strand the Plan. |         High / Medium | **Repository fact:** adapters/providers execute or project but do not own product truth. Current task/CMS seams are incomplete for D17. | Requires provider-neutral intent and source adapters. | **D17-R4–R8, R10–R11, R17, R20:** Asym Plan truth, fresh source checks, durable outbox, provider observations labelled separately, unsupported adapter stays honest. |

### 20. Migration, rollout, and upgrade risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                      | Severity / likelihood | Evidence and reasoning                                                                                                       | Effect on D17                                             | Permanent fix and exact language                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backfilling every unfinished locale/draft/task fabricates intent; deploying writers before D15/D16 scope allows shadow defaults; old/new code may disagree; rollback might delete Plans; turning on all owner adapters widens blast radius. |       Critical / High | **Current source:** no stable Site/default model or Plan runtime. **Repository rule:** active PRs are proposed, not shipped. | Makes D15/D16 and reader-first rollout hard dependencies. | **D17-R20:** no backfill, additive private schema, negative reader/constraints first, shadow readiness, per-Site cohort, adapter-by-adapter rollout, retained data and forward recovery. |

### 21. Testability, traceability, and proof

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                       | Severity / likelihood | Evidence and reasoning                                                                                         | Effect on D17                                  | Permanent fix and exact language                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A test that merely finds “French planned” can pass while the root changed, tasks duplicated, hidden records leaked, stale approval activated, cancellation deleted drafts, service role bypassed RLS, or mobile focus broke. |           High / High | **OpenSpec rule:** observable positive, negative, authorization, recovery, and failure scenarios are required. | Requires falsifiable domain and user outcomes. | **D17-R20 and D17-AC1–AC72:** trace glossary → ADR/PRD/OpenSpec/design/tasks/tickets/schema/tests/release/runbooks and prove public non-effects, races, privacy, accessibility, migration, and load. |

### 22. Other development hazards

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                       | Severity / likelihood | Evidence and reasoning                                                                           | Effect on D17                                 | Permanent fix and exact language                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ------------------------------------------------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A Plan may be confused with D6 first Go Live, locale creation, a content release, a Site-wide generation, automatic translation, a personal preference, or a scheduled activation. Feature flags could also hide Plans while background workers keep acting. |         High / Medium | **Repository fact:** each named domain has separate authority; current runtime has no D17 model. | Clarifies non-goals and kill-switch behavior. | **D17-R1, R3–R6, R10, R20:** distinct terms, no public/background effect, feature disable stops new commands/routing while preserving inert private history. |

## Required acceptance criteria and proof

### Scope, identity, and cardinality

1. **D17-AC1 — Existing Site scope.** A Plan can be created only for one exact
   non-retired Tenant/environment/Site with a current Default Site Locale
   Version.
2. **D17-AC2 — First launch stays D6-owned.** A Site with no current default is
   routed to Site Setup/**Go live** and cannot create a D17 Plan.
3. **D17-AC3 — Suspended Site behavior.** A suspended Site may retain
   authorized private intent but cannot activate while serving/safety remains
   adverse.
4. **D17-AC4 — Terminal Site behavior.** Retired, transferred, tombstoned, or
   privacy-ineligible Sites cannot create, replace, or activate a Plan.
5. **D17-AC5 — Stable target identity.** The target is an existing stable,
   same-Site Site Locale—not a raw tag, URL, Page, country, currency, provider
   locale, or caller object.
6. **D17-AC6 — Already current is a no-op.** Selecting the current default
   returns **Already default** and creates no Plan, task, event, or public
   effect.
7. **D17-AC7 — One active Plan.** A database constraint and concurrent-command
   test make two active Plans impossible for one exact Site.
8. **D17-AC8 — Same locale across Sites is safe.** Two Sites or Tenants may
   independently plan `fr-CA` without collision, shared cache state, or
   disclosure.
9. **D17-AC9 — Site-owned continuity.** Creator departure, deactivation, or
   permission loss preserves Plan intent and historical attribution; current
   authorized staff may continue without impersonation.
10. **D17-AC10 — Explicit replacement.** Replacing French (Canada) with French
    (France) creates one active French (France) successor, marks French (Canada)
    Superseded, preserves both histories under concurrent CAS, and leaves zero
    active French (Canada)-Plan requests or pending notifications after bounded
    idempotent cleanup.
11. **D17-AC11 — Terminal history.** Cancelled, Superseded, Activated,
    Satisfied elsewhere, and No longer applicable Plans cannot reopen or reuse
    identity.
12. **D17-AC12 — Plan/candidate separation.** A Plan exists without a Public
    Site Generation or D16 activation candidate and never claims to be either.

### Zero public, source, Giving, and financial effects

13. **D17-AC13 — Save is publicly inert.** Saving a French Plan leaves the
    current Default Site Locale Version and root response byte-for-byte
    unchanged.
14. **D17-AC14 — Cancel/replace are publicly inert.** Cancel and replace emit
    no public route/search/sitemap/content/cache invalidation or generation.
15. **D17-AC15 — Public readers cannot depend on Plan.** Static dependency and
    runtime poison tests prove public root, route, search, sitemap, renderer,
    and cache code cannot query Plan state.
16. **D17-AC16 — Explicit URLs remain exact.** Page, Giving, QR, message,
    document, share, and historical artifact URLs do not change or re-resolve
    through the Plan.
17. **D17-AC17 — Finance neutrality.** Plan commands create zero Giving,
    Designation, currency, contribution, commitment, Legal Entity, Stripe,
    settlement, bank, receipt, tax, ledger, or accounting effect.
18. **D17-AC18 — No automatic content.** Selecting or saving a target creates
    zero translation, Page, Navigation, presentation, message, or Giving
    content.
19. **D17-AC19 — Source work survives.** Cancel/replace preserve all source
    drafts, versions, leases, reviews, approvals, schedules, releases, and
    human-authored work.
20. **D17-AC20 — Reference-not-copy.** Plan evidence stores stable references
    and revisions only; copied Page content, URL, title, status, assignee, or
    readiness is not authority.
21. **D17-AC21 — No cross-schema FK.** Payload/CMS references remain typed
    application-validated soft references and migration tooling stays
    independent.
22. **D17-AC22 — No auto activation.** Readiness, time, due date, task
    completion, publication, provider success, job, cache, and notification
    events cannot advance the default head.
23. **D17-AC23 — Fresh, atomic D16 activation.** Final review always compiles
    a new immutable D16 candidate from current source heads and actor
    authority. A successful activation atomically advances the default head,
    records the matching D16 receipt, and terminalizes the Plan as Activated;
    no partial combination can commit.
24. **D17-AC24 — Current default changed and re-reviewed.** Any authoritative
    default-head change after Plan review visibly stales the Plan and blocks
    activation. **Review changed default** appends a zero-effect immutable
    review revision in the same Plan lineage, preserves the target, pins the
    new current head/impact, supersedes the prior basis, and alone permits a
    new D16 candidate. A target already current uses Satisfied elsewhere.
25. **D17-AC25 — Target current elsewhere.** If another command makes the
    target current, the Plan becomes **Satisfied elsewhere** and cannot claim it
    activated without its exact receipt.
26. **D17-AC26 — Target adverse.** Withdrawal, suspension, retirement,
    missing generation, or safety restriction never activates, redirects,
    chooses fallback, or destroys private intent without source-owned terminal
    proof.

### Readiness, routing, UX, authorization, and accessibility

27. **D17-AC27 — Current readiness.** Every Plan view derives source state
    from exact current revisions and exposes a trustworthy `checked_at`.
28. **D17-AC28 — Projection failure is honest.** Source timeout/corruption
    displays **Could not be checked**, suppresses **Ready to review**, and
    blocks activation.
29. **D17-AC29 — Changed source invalidates review.** Page, Navigation,
    generation, safety, policy, or permission changes after review produce
    **Changed since review** or **Needs attention**, never a stale green state.
30. **D17-AC30 — Action groups without Giving coupling.** Staff see **You can
    do now** and **Needs another owner** with semantically correct permitted
    counts plus static **Unchanged** consequence copy. The Plan projection does
    not query or reveal Giving enablement.
31. **D17-AC31 — Consequence copy.** The review and persistent row state the
    exact current default and serving state, that the Plan is private, and that
    it never goes live automatically. A suspended Site says its current default
    remains unchanged and the Site is not currently public; it never claims a
    language is live.
32. **D17-AC32 — Effect-labelled action.** The primary action names the target
    and any owner-request count, such as **Plan French (Canada) and request 1
    review**.
33. **D17-AC33 — Honest no-route action.** When no registered owner route
    exists, the action saves only the Plan, shows a safe next step, and does not
    imply notification.
34. **D17-AC34 — Plan receipt.** Success distinguishes Plan saved, requests
    created, requests already present, and requests that failed.
35. **D17-AC35 — Persistent discoverability.** The target locale row shows
    **Planned**, remaining visible work, exact unchanged current-default/
    serving outcome, and **Continue setup**.
36. **D17-AC36 — Ready remains private and serving-gated.** On a serving Site,
    **Ready to review** explicitly says the exact current default remains live
    and exposes Preview plus **Review and make default**. Suspension instead
    produces **Needs attention · Site suspended** and no ready/activation
    action.
37. **D17-AC37 — Private optional Preview.** Preview requires current
    authorization, is non-indexed/non-cached/non-share-authoritative, and is
    never required to understand or progress the Plan.
38. **D17-AC38 — Replace comprehension and cleanup receipt.** Replace says the
    prior Plan and its Plan-specific follow-ups close/move to history, shows the
    new target, states that source content/review records remain unchanged, and
    itemizes cleanup without claiming source work was cancelled.
39. **D17-AC39 — Cancel comprehension and cleanup receipt.** Cancel says the
    Plan and its Plan-specific follow-ups close/move to history, the current
    default/serving state stays unchanged, and source content/review records
    remain. The receipt itemizes closed follow-ups; no typed phrase is required.
40. **D17-AC40 — Owner route provenance.** Every request derives the current
    source owner/role/queue; the caller cannot choose an arbitrary person,
    email, approver, prior editor, or queue.
41. **D17-AC41 — Assignment grants nothing.** Assigning, receiving,
    completing, dismissing, or commenting on a task does not grant source read,
    edit, approval, publication, Site-policy, or activation capability.
42. **D17-AC42 — Stable semantic request dedupe.** Repeated Plan/source events
    yield at most one active attention lineage for stable Plan lineage × owner
    × semantic cause × stable object/placement, plus target only when the work
    meaning changes. Plan/source revision changes append evidence and advance
    the same lineage; they never create a peer request or duplicate notice.
43. **D17-AC43 — Completion authority rechecks truth.** Completing an
    independently lifecycle-owned follow-up task triggers or invites a current
    source recheck and cannot set readiness. A source-backed Plan-action task
    has no generic completion transition; only the authoritative source-action
    receipt ends its applicable projection.
44. **D17-AC44 — Capability matrix.** View-only, planner, Page editor,
    Navigation editor, reviewer, publisher, locale manager, revoked,
    cross-Tenant, impersonated, service, and AI cases receive only exact
    permitted data/actions.
45. **D17-AC45 — Read reauthorization.** Plan, history, blocker, owner, task,
    and Preview reads reauthorize current Tenant membership and capability
    every time.
46. **D17-AC46 — Hidden resource non-enumeration.** Forbidden records add no
    title, count, label, role, deep link, timing distinction, or existence
    signal.
47. **D17-AC47 — WCAG/Core accessibility matrix.** The journey passes WCAG 2.2
    AA and Core's accessibility contract: keyboard/screen reader, associated
    labels/help/errors, visible and unobscured focus, text-plus-icon state,
    `24 × 24` CSS-pixel targets or the defined spacing exception, Core `44 ×
44` important mobile controls, forced colors, reduced motion, 320px reflow,
    400% zoom, and long/CJK/RTL proof. Core Plan read/create/replace/cancel also
    pass a client-JavaScript-failure test through server-rendered HTML/forms;
    Preview may remain enhanced.
48. **D17-AC48 — Status announcements and focus.** Async save/request/readiness
    messages are announced without focus theft; dialogs restore focus to the
    invoking row and do not rely on toast/color alone.
49. **D17-AC49 — Weak-network recovery.** Input and focus survive failure;
    duplicate submission is disabled while outcome is unknown; retry
    reconciles the original command.
50. **D17-AC50 — Mobile completeness.** A one-column phone journey exposes
    consequence, all permitted blockers, safe actions, and cancellation without
    horizontal scroll, hidden hover behavior, or mandatory Preview.

### Database, concurrency, failure, operations, and privacy proof

51. **D17-AC51 — Composite integrity.** Migration tests prove Tenant,
    environment, Site, target Site Locale, expected default version, Plan
    revision, and owner-route scope agree structurally.
52. **D17-AC52 — Operation-correct RLS.** `SELECT`/`INSERT`/`UPDATE`/
    `DELETE` tests exercise `USING` and `WITH CHECK` where applicable; an
    allowed operation cannot move scope, target, owner, status, or authority.
53. **D17-AC53 — Trusted attribution.** Tenant, Site, target, actor, author,
    owner, reviewer, approver, expected head, status, receipt, and audit fields
    ignore conflicting caller values.
54. **D17-AC54 — Privileged poison matrix.** Service role, table owner,
    `BYPASSRLS`, Payload Local API, RPC/`SECURITY DEFINER`, worker, import,
    migration, support, impersonation, break-glass, AI, Data API, and repair
    paths reject cross-scope/stale/caller-selected input.
55. **D17-AC55 — Immutable retained history.** Plan revisions, terminal
    outcomes, receipts, and audit have no ordinary update/delete, reopen, reuse,
    or cascade-delete path.
56. **D17-AC56 — Same-key retry.** Same business key and meaning return the
    original save/replace/cancel/activate receipt with no duplicate Plan, event,
    request, notification, or audit effect.
57. **D17-AC57 — Changed-meaning key.** Reusing a key with different Tenant,
    Site, target, expected head, revision, or command is rejected and cannot
    expose another receipt.
58. **D17-AC58 — Concurrent creation.** Two different targets racing from
    absent state produce one active winner and one explicit conflict—never
    silent replacement.
59. **D17-AC59 — Cancel/activate race.** Exactly one terminal outcome wins;
    cancel-first blocks activation and activation-first cannot be undone.
60. **D17-AC60 — Replace/activate race.** Replace-first fences the old
    candidate; activation-first produces Activated and prevents a false
    replacement receipt.
61. **D17-AC61 — Partial routing.** Plan save survives routing failure;
    successful requests remain exact; retry touches only unresolved effects.
62. **D17-AC62 — Unknown command outcome.** Lost responses read
    authoritative receipt/effect before enabling another command and resolve
    within the launch budget or page the command owner.
63. **D17-AC63 — Private cache scope and authorization identity.** Omitting
    exact Tenant, environment, Site, Plan lineage/revision, source scope/
    revisions, or projection version from any private cached function fails a
    structural test. Authorization-neutral facts may then be filtered after
    read. A cached filtered projection additionally fails when it omits the
    principal/proved-equivalent audience, membership/authorization epochs,
    role/subrole, capability/field-visibility digests, or restricted-resource
    scope. Every render reauthorizes.
64. **D17-AC64 — Private freshness ceiling.** A **Ready to review** projection
    older than `300` seconds is not served as current; missed invalidation
    self-heals within that provisional hard maximum.
65. **D17-AC65 — Privacy-safe observability.** Logs, traces, metrics,
    notifications, exports, support evidence, and errors omit private content,
    hidden owner identity, raw URL/query, sensitive location, and cross-Tenant
    labels while retaining bounded opaque cause/revision evidence.

### Migration, scalability, rollout, and traceability

66. **D17-AC66 — No fabricated backfill.** Existing locales, defaults, drafts,
    tasks, translations, traffic, or documentation create zero Plans during
    migration.
67. **D17-AC67 — Mixed-version safety.** Old-code/new-schema,
    new-code/old-schema, partial deployment, and disabled-feature tests change
    no public behavior and never execute hidden routing.
68. **D17-AC68 — Reader-before-writer rollout.** Constraints, negative
    readers, RLS/privileged denials, public-dependency checks, and shadow
    readiness pass before Plan writers.
69. **D17-AC69 — Cohort and adapter isolation.** One exact Site cohort and one
    source adapter enable independently; unsupported owners remain honest and
    other Sites are unaffected.
70. **D17-AC70 — Rollback and kill switch.** UI/reader rollback or feature
    disable stops new commands/routing, preserves inert private Plans/history,
    and starts no background/public effect.
71. **D17-AC71 — Production-shaped performance.** Small/large Sites,
    one/many locales, many Pages, cold/warm cache, concurrent planners,
    source outage, task burst, and tenant burst record p50/p95/p99 and prove
    indexed one-Site lookup, bounded batching, no all-Tenant/Page scan, and no
    public hot-path cost.
72. **D17-AC72 — Full traceability.** An automated matrix maps D17 terms,
    requirements, and criteria through glossary, D6/D13/D15/D16, eventual ADR/
    PRD/OpenSpec/design/tasks/tickets/schema/migration/tests/release/runbooks/
    monitors with no contradictory state, owner, number, or authority.

## Named production monitors

Anything left to monitoring has a named signal, threshold, owner, and response.
Zero-tolerance authority/privacy signals supplement structural constraints and
authorization; they never replace them. Nonzero latency/UX values below are
provisional launch budgets to validate or tighten with production-shaped data.

| Signal                                                 |                                                                                                                                                             Threshold | Owner                                | Required response                                                                                                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------: | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site_default_plan_cross_scope_total`                  |                                                                                                                                                   Any value above `0` | Security + Site Locale               | P0 disable Plan commands/views, contain exposure, preserve evidence, and requalify isolation.                                                                          |
| `site_default_plan_duplicate_active_total`             |                                                                                                                              Any second active Plan in one exact Site | Site locale-policy command owner     | Disable writers, preserve both histories, select authority only through proved repair, and fix constraint/idempotency.                                                 |
| `site_default_plan_public_effect_total`                |                                                                                       Any public default/root/route/generation/cache/search effect from a D17 command | Site Product + Public Runtime        | P0 fence D17, restore sole D16 behavior, inspect affected Sites, and repair forward.                                                                                   |
| `site_default_plan_financial_effect_total`             |                                                                                                             Any Giving/currency/provider/settlement/accounting effect | Giving/Finance Security              | P0 contain the effect, preserve evidence, reconcile financial truth, and remove the coupling.                                                                          |
| `site_default_plan_auto_activation_total`              |                                                                                          Any default activation without an exact current D16 human-authorized receipt | Security + Site Publication          | P0 contain public effect, repair forward, disable trigger/worker, and re-prove activation authority.                                                                   |
| `site_default_plan_stale_activation_total`             |                                                                                                    Any activation using stale Plan/default/source/permission evidence | Site Locale + Public Generation      | Suppress unsafe derived response, retain authoritative heads, repair fencing, and re-prove the successor.                                                              |
| `site_default_plan_source_mutation_total`              |                                                                                                  Any Plan save/cancel/replace that edits or deletes source-owned work | Page/Navigation Security             | Halt the adapter, preserve versions, restore only through source-authorized successor, and add the poison fixture.                                                     |
| `site_default_plan_duplicate_request_total`            |                                                                    Any second active request at the stable Plan/owner/semantic-cause/stable-object-or-placement grain | Shared Task + source workflow owner  | Suppress the duplicate, advance one attention lineage with revision evidence, repair identity, and pause expansion.                                                    |
| `site_default_plan_cache_authorization_mismatch_total` | Any cached result whose Tenant, environment, Site, Plan, source, principal, membership, field/resource visibility, or policy partition differs from current authority | Security + Site readiness projection | P0 disable affected caching, purge the exact cohort, assess disclosure, repair explicit scope plus filter-after-read or the complete authorization key, and requalify. |
| `site_default_plan_projection_freshness_seconds`       |                                                                                                                  Any **Ready to review** response above `300` seconds | Site readiness projection owner      | Hide Ready, show **Could not be checked**, reconcile outbox/cache, and inspect source/queue health.                                                                    |
| `site_default_plan_unknown_command_age_seconds`        |                                                                                                                                                   Above `300` seconds | Site locale-policy command owner     | Read authoritative receipt/effect, keep submit disabled, page owner if unresolved, and never create another Plan.                                                      |
| `site_default_plan_routing_dead_letter_age_seconds`    |                                                                                                                          Oldest actionable effect above `900` seconds | Shared Task/source adapter owner     | Re-resolve current registered queue, show private routing exception, and never guess an assignee.                                                                      |
| `site_default_plan_terminal_request_residue_total`     |                                                                                       Any qualifying Plan request active over `300` seconds after terminal Plan state | Plan + source workflow owners        | Close/supersede only the Plan-specific request, preserve source work/history, and repair terminal event handling.                                                      |
| `site_default_plan_read_p95_ms`                        |                                                                                                        Above `500 ms` for 15 minutes with at least 100 eligible reads | Site Platform + Mission Control      | Inspect indexes/batching/cache/source fan-out; optimize without copied readiness or broader scope.                                                                     |
| `site_default_plan_creation_abandonment_rate`          |                                                                                                          Above `20%` within 24 hours, at least 25 starts over 30 days | Site Product/UX                      | Review comprehension/session evidence, simplify copy/actions, and preserve safety/authority.                                                                           |
| `site_default_plan_stale_review_rate`                  |                                                                                                 Above `10%` of activation attempts, at least 20 attempts over 30 days | Site Product + Publication           | Inspect false staleness, long reviews, and projection lag; improve freshness without auto-rebase.                                                                      |
| `site_default_plan_support_cases`                      |                                                                                             More than `5` Plan/default-language confusion or routing cases in 30 days | Site Product + Tenant Support        | Review exact confusion, improve in-product explanation/runbook, and provide no SQL/task override.                                                                      |

## Ruthless synthesis — strongest path forward

### Required before D17 is recorded

Completed by this evidence package:

1. define **Default Site Locale Plan** as Site-owned private intent;
2. enforce one active Plan and preserve explicit terminal history;
3. make every D17 command publicly and financially inert;
4. separate long-lived intent from the fresh D16 activation candidate;
5. derive readiness from current source owners;
6. prohibit automatic content creation, publication, and activation;
7. route owner work only through registered subordinate contracts;
8. define current capabilities, non-enumeration, cancellation, replacement,
   races, idempotency, and unknown outcomes;
9. define consequence-led Maia UX and accessibility/weak-network behavior; and
10. reject inferred backfill, generic workflow/scheduler scope, and current
    finance-only task-helper reuse.

### Required in the later PRD/design

1. define Plan scope, stable identity, immutable revisions/successors, terminal
   events, receipts, and records-schedule binding without freezing table names;
2. reconcile Plan creation with D6 Site Setup, D7/D8 lifecycle, D15 stable Site
   Locale, and D16 current-head/activation commands;
3. define the bounded readiness manifest, source adapters, `checked_at`,
   permission-filtering, cache identity, invalidation, and adverse bypass;
4. define independent capabilities and one server mutation boundary with
   composite integrity, grants/RLS, privileged-path hardening, idempotency, CAS,
   retention, and poison tests;
5. define shared Mission Control task/attention integration only after its Site
   issue types, record types, queues, semantic dedupe, same-Tenant links,
   lifecycle, permissions, and source adapters are qualified;
6. define itemized Plan/routing receipts, durable outbox, dead-letter repair,
   notification policy, and no-owner result;
7. specify the full desktop/mobile Maia journey, exact copy, source deep links,
   optional Preview, replace/cancel dialogs, focus/status behavior, and
   accessibility fixtures;
8. define the fresh D16 review handoff and every create/replace/cancel/activate/
   elsewhere/adverse/unknown race;
9. define start-empty migration, mixed versions, feature disable, per-Site
   cohort, adapter sequencing, rollback/roll-forward, support, and monitoring;
   and
10. trace all 72 criteria and 17 monitors through release evidence.

### Required implementation order

1. reconcile and land the accepted D15/D16 Site/default/locale/generation
   source model before D17;
2. inventory current Web Studio drafts/Preview, task tables/helpers, capability
   seams, public dependencies, and source-owner queues;
3. land additive private Plan records/readers, one-active constraint,
   same-scope relationships, audit/receipt, grants/RLS, and privileged denials;
4. prove public runtime/search/cache/generation code has no Plan dependency;
5. land the permission-filtered readiness reader with source batching,
   `checked_at`, 300-second ceiling, and **Could not be checked** behavior;
6. shadow readiness for production-shaped Sites without writing Plans;
7. land idempotent create/replace/cancel commands and the accessible
   Site → Languages UI for one cohort, with no routing adapter;
8. qualify shared task semantics and add one source-native owner adapter at a
   time, with dedupe and itemized receipts;
9. land fresh D16 candidate compilation from a Plan and prove every race;
10. run positive/negative/RLS/privileged/privacy/concurrency/failure/a11y/
    mobile/weak-network/load/mixed-version matrices;
11. expand only while zero-tolerance signals remain zero and provisional
    latency/UX budgets hold; and
12. recover forward, retaining Plan/source/public history and never repairing
    through direct SQL, generic task completion, or hidden public changes.

### Explicit non-goals — reopen only with evidence

- a second current/default/root head;
- Plan-created or copied Page/Navigation/translation content;
- automatic translation, approval, publication, activation, fallback, or
  expiry;
- a Site-global Public Site Generation;
- arbitrary Plan-owned assignees, approvers, comments, priorities,
  dependencies, stages, dates, recurrence, rules, calendars, or workflow
  builder;
- a new task engine, CMS release engine, or scheduler;
- current finance-only task helper reuse without qualification;
- browser/profile/country/currency/provider-selected target;
- public Plan/Preview/search/cache/analytics authority;
- Giving, Stripe, Legal Entity, settlement, bank, receipt, ledger, or
  accounting behavior; and
- speculative distributed orchestration or sharding.

## Repository and external research synthesis

### Repository facts verified on 2026-08-27

- At evidence capture, PRs #1323 and #1340 remained open; their Phase 22/23
  planning material was treated as proposed evidence, not merged authority.
  Existing Phase 24 evidence remained preserved.
- D6 requires complete private Preview, all-or-none activation, current proof,
  and preservation of private work. D13 routes authorized source work without
  granting source authority. D15 gives every locale stable explicit identity.
  D16 keeps one current Default Site Locale Version/head and blocks an unready
  target.
- [ADR-0029](../../adr/0029-reference-not-copy-cms-operational.md) keeps
  operational and CMS truth distinct through application-validated stable soft
  references. [ADR-0030](../../adr/0030-function-level-tagged-caching-publish-signal.md)
  makes function arguments isolation and tags invalidation only.
- Accepted `platform-boundaries` requires one shared Mission Control staff task
  model but makes role, publication, and source authority structural.
- Current `apps/admin/src/cms/public/resolve-tenant.ts` returns `siteId: null`;
  no stable Site/default-locale/Plan runtime exists.
- Current Payload Pages use versions/drafts/autosave and authenticated Web
  Studio Preview, but are Tenant-scoped rather than the final accepted
  Site/locale lineage.
- Current Mission Control task tables are server/service-role controlled, but
  `packages/api/src/admin/mission-control-tasks/store.ts` hard-codes
  `finance_operations`/`contribution_operations`; current task issue and record
  types are contribution-only and task rows lack a semantic dedupe key.
- Current generic task completion is therefore useful infrastructure evidence
  only for manual or independently lifecycle-owned follow-up tasks, not D17
  readiness, source-action completion, Page, publication, or Site-policy
  authority.

### Current primary and comparable evidence

- [Payload Versions](https://payloadcms.com/docs/versions/overview),
  [Drafts](https://payloadcms.com/docs/versions/drafts), and
  [Preview](https://payloadcms.com/docs/admin/preview) separate newer private
  work from published content, retain history, support private Preview, and
  make access control decisive. Core reuses that separation but keeps Plan
  intent in the operational Site domain.
- [Sanity Content Releases](https://www.sanity.io/docs/user-guides/content-releases)
  let staff plan, preview, validate, and later run a release; `ASAP`, `At
time`, and `Undecided` distinguish intent. Their document snapshots,
  scheduling, release layering, quotas, and calendar are evidence that the
  problem exists—not justification for a D17 release engine.
- [Contentful locale-based publishing](https://www.contentful.com/help/localization/locale-based-publishing/)
  exposes Draft/Published/Changed per locale and independent locale
  publication. [Contentful Tasks](https://www.contentful.com/help/content-and-entries/tasks/)
  shows clear assignee/team/due/pending work, but also shows how team
  notification and task-blocked publication can become a second authority.
  D17 uses deduplicated source coordination and rechecks the source.
- [HubSpot content approvals](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
  exposes one in-flight approval, Pending/Approved/Canceled, cancel/reassign/
  request-changes, and mobile actions. Core adopts clear status/cancellation,
  not configurable thresholds, arbitrary approver choice, or due-date machinery.
- [Microsoft modern approvals](https://support.microsoft.com/en-US/SharePoint/data-and-lists/approvals-in-lists-document-libraries)
  cancels in-flight approval when reviewed content changes and explicitly says
  assignment does not grant access to the underlying item. D17 applies both
  lessons structurally.
- [Webflow locale management](https://help.webflow.com/hc/en-us/articles/53682971927571-Manage-your-site-s-locales)
  separates locale identity, subdirectory, publishing status, and editor
  restriction. Core keeps D15 immutable explicit identity and does not import
  provider route mutability.
- [Shopify localization](https://help.shopify.com/en/manual/international/localization-and-translation)
  warns that changing default language can delete translations and couples
  language to commerce/checkout behavior. That is evidence for strong impact
  copy—not authority to import destructive or financial coupling into Core.
- [WordPress status guidance](https://wordpress.org/documentation/article/page-post-settings-sidebar/)
  distinguishes Draft, Pending, Private, Scheduled, and Published. D17 uses
  the mental separation but avoids ambiguous `Pending` and does not schedule.
- [Blackbaud Raiser's Edge NXT workflows](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/wd-workflows.html)
  can save drafts, assign actions, and activate workflows, while also showing
  brittleness when activator permissions or source lists change. Core
  reauthorizes current source truth instead of binding execution to the creator.
- [GOV.UK progressive enhancement](https://www.gov.uk/service-manual/technology/using-progressive-enhancement)
  supports server-authoritative resilient actions. Its
  [task-list guidance](https://design-system.service.gov.uk/components/task-list/)
  reinforces that task lists belong to genuinely long, complex services, not
  every multi-step setting.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
  [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), and
  [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  support programmatic async feedback, a complete narrow-screen/zoom journey,
  and measurable interaction targets.

### Evidence limits and unresolved empirical unknowns

- No representative Core staff study proves how often default-language launches
  span several owners/days, whether **Plan French (Canada)** is immediately
  understood, or whether owner routing reduces completion time. Moderated tests
  are required before broad rollout.
- No evidence proves Core ministries need a Plan target date, reminders, or
  scheduled activation. Later D18 therefore records no Plan-owned timing while
  preserving independent source-workflow schedules and Mission Control task
  timing.
- Current production Sites, locale plans, and Plan traffic do not exist.
  Performance and UX thresholds are provisional launch budgets.
- The `300`-second private readiness, `900`-second routing dead-letter,
  `500 ms` read p95, and UX-rate thresholds are reasoned launch guardrails, not
  measured current facts.
- Current shared task tables are real, but their Site-generalized security,
  dedupe, queues, links, lifecycle, and UX remain unproved. D17 must not call
  the finance helper as a shortcut.

## Documentation and ADR status

- Root `CONTEXT.md` now defines **Default Site Locale Plan** without schema or
  HTTP detail.
- This D17 evidence records the corrected decision, complete staff journey, all
  22 adversarial categories, 72 acceptance criteria, 17 monitors, research,
  migration, and synthesis.
- The Phase 24 decision log records the founder answer and points here.
- D16's previously open persistence choice is resolved: one private Plan may
  remain while the current default/root stays unchanged.
- D17 does not independently require a standalone ADR. Private planning is
  reversible; the later specification flow should incorporate it into the
  eventual Site/default-locale workflow ADR and amend OpenSpec/PRD together.
- No ADR, PRD, OpenSpec change, design, ticket, schema, migration, runtime code,
  commit, stage, or PR is authorized by this Grill-with-Docs answer.

## Next dependent decision — D18

> **Later outcome:** Option 1 was accepted with required amendments. The Plan
> owns no target-date/launch-date/due-date/Plan-reminder/expiry-time/scheduled-
> activation semantics; its target Site Locale and actual event timestamps
> remain required. See
> [phase-24-d18-undated-default-site-locale-plan-adversarial-review.md](./phase-24-d18-undated-default-site-locale-plan-adversarial-review.md).

### Plain-language context and impact

D17 now gives staff one durable private Plan. The next question is whether the
Plan should also carry a date such as “aim to launch French by 15 October.”

A date can make owner coordination clearer and help prevent forgotten work,
but it can also look like a promise or scheduled website switch. D17 forbids
automatic activation. No representative Core staff evidence currently proves
that Phase 24 needs date metadata, so the burden is on adding it—not omitting it.

### Options

1. **Do not store a target date in Phase 24 — recommended.** The Plan remains
   visible until activated, replaced, cancelled, or no longer applicable. This
   is the smallest honest model and avoids false promises, reminder behavior,
   time-zone policy, and metadata that no known Core user has requested.
2. **Allow one optional Plan-only coordination date.** If evidence proves the
   need, store one editable/clearable ISO civil date labelled **Target date—not
   scheduled**. It never copies into source/task due dates, appears publicly,
   becomes a relative deadline, or triggers reminders, escalation, expiry,
   automation, or activation.
3. **Schedule automatic activation for a precise date/time.** Core would
   recheck readiness at the scheduled instant and switch if eligible. This
   reduces a final click but reintroduces deferred authority, time zones,
   permission changes, missed schedules, and outcome recovery; it conflicts
   with D17's reviewed human activation and is not recommended.

### Recommendation

Choose Option 1. Comparable release products prove that dates are possible, not
that Core ministries need them. D17 already keeps the Plan visible and routes
current owner work. Adding date semantics without representative evidence would
freeze speculative state and invite scheduling expectations. If later research
proves the job, Option 2 is the bounded amendment.

### Concrete staff and visitor example

Maria saves the Plan without inventing a launch promise:

```text
French (Canada) is planned

hope.org still opens English (United States).
French will not become default automatically.
```

The Plan remains visible until staff finish or cancel it. Visitors keep
receiving English (United States) unless an authorized staff member completes
the current D16 review and explicitly makes French (Canada) default.

### Exact question

Should a Default Site Locale Plan store no target date, allow one optional
Plan-only civil date that never schedules activation, or schedule an automatic
default change?

## Subsequent D31 Tasks Hub reconciliation

D31–D32 and ADR-0183 preserve D17's source-owned Plan and registered-adapter
boundary while naming the shared future: only a proved current human-action
occurrence may project a source-backed task into one Tasks Hub. A Plan, route,
role, capability, membership, owner, or saved configuration does not create a
task merely by existing. The source retains readiness, actionability, end, and
completion truth; assignment grants no permission, task state cannot clear the
Plan, and protected source detail remains referenced rather than copied. Each
source-backed recipient projection closes from its exact source-action scope;
a separately defined Independent follow-up task may own only its human
follow-up completion.
