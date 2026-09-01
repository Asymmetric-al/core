# Phase 24 D29 — explicit Website review coordinators adversarial review

Date: 2026-08-28  
Founder answer: **Option 1 — one to three explicit Website review coordinators**  
Disposition: **Accept with required amendments**  
Scope: responsibility for D28 external-review follow-up; D19–D28 authority remains fixed

Companion evidence:

- [D29 primary research](./phase-24-d29-explicit-website-review-coordinators-primary-research.md)
- [D28 explicit next-lane choice adversarial review](./phase-24-d28-explicit-next-lane-choice-adversarial-review.md)
- [D28 primary research](./phase-24-d28-explicit-next-lane-choice-primary-research.md)
- [D21 explicit review-responsibility routing](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
- [D22 small co-responsible reviewers](./phase-24-d22-small-co-responsible-reviewers-adversarial-review.md)
- [ADR-0182 — one current candidate-review responsibility lane](../../adr/0182-one-current-candidate-review-responsibility-lane.md)

## Executive verdict

The founder's choice is the strongest permanent direction, but the bare phrase
“one to three Website review coordinators” is not safe or clear enough to
implement. It could accidentally make Website reviewers and follow-up
coordinators the same roster, turn responsibility into permission, block an
otherwise lawful external handoff when notification coverage is absent, or
hide current D28 work behind an ambiguous empty route.

The corrected decision creates one distinct, typed **Website review follow-up
route**. It reuses D21/D22's Tenant inheritance, rare Site override,
one-to-three exact-person editor, all-before-any resolver, personal Phase 17
items, prospective settings, and explicit current-work handoff. It never
copies, aliases, defaults from, or synchronizes the D21 Website-review roster.

The staff-facing information architecture keeps every Website-review setting
on **Settings → Websites → Reviews**, whose page title is **Website reviews**.
Its **Review responsibilities** section presents two unmistakable cards:

1. **Review notifications** — who receives D20 attention when a Website Plan is
   ready for review, changed since review, or affected by a current-default
   change; and
2. **External review follow-up** — who handles follow-up when an invited
   reviewer declines or their invitation expires.

The vague phrase **Who handles reviewer problems?** is rejected. It can imply
technical support, a content dispute, reviewer performance, or a people-care
issue. The exact editor question is **Who chooses the next step?** The
helper text names the two ordinary triggers and says that selection grants no
access or permission.

One configured route contains one, two, or three unique, unordered staff
Parties. A configured person receives a D28 personal item only when the server
can currently prove that the person may see the exact candidate and perform at
least one action offered by the current source. Permission without route
membership never creates responsibility; route membership without current
authorization never creates an item or action.

An unconfigured, deliberately no-item, proved-zero, or indeterminate D29
posture never blocks an independently authorized D25 handoff. That would make a
secondary notification projection
authoritative over source work and conflict with D19, D21, D25, D28, ADR-0027,
and ADR-0182. Core instead presents the exact coverage consequence, keeps the
source discoverable in Languages, guesses nobody, and offers route setup only
to a separately authorized manager.

The D29 founder blocker is closed by this report. The D28 notification key
nevertheless remains **Reserved** until OpenSpec, registry, source adapters,
schema, authorization, RLS, migration, accessibility, production-shaped tests,
and release evidence implement the accepted contract.

## Evidence labels and confidence

This report distinguishes evidence rather than treating plausible workflow as
fact:

- **Repository fact:** D19/D20 and ADR-0027 define producer-owned conditions,
  one semantic occurrence, separate personal items and engagement, source-
  driven end, no active archive or snooze, and no reminder or email by default.
- **Repository fact:** D21/D22 already accept Tenant inheritance, rare Site
  override, one explicit fallback, a one-to-three equal roster, prospective
  settings, and differential handoff for current episodes.
- **Repository fact:** D25–D28 make external review candidate-scoped, keep one
  current responsibility lane, and make decline or expiry open a source-owned
  reassignment episode requiring one deliberate next-lane choice.
- **Repository fact:** the current runtime has no D29 coordinator route,
  resolver, schema, or Live message key. Existing mutable Mission Control task,
  assignee, queue, reminder, or legacy attention rows are not D29 authority.
- **Verified external fact:** modern products distinguish named responsibility
  from broader team permission, provide explicit reassignment, and reduce
  notification noise by targeting a bounded subset.
- **Product judgment:** one to three exact coordinators, Tenant inheritance,
  rare Site overrides, and no default email are the best fit for Core. No
  external source proves that three is a universal ideal.
- **Assumption:** most ministries can identify one ordinary follow-up owner and
  need a Site override only when Website operations genuinely differ. This
  requires moderated pilot evidence.
- **Unknown:** actual coordinator counts, route-change frequency, decline and
  expiry frequency, no-route duration, label comprehension, and the number of
  Tenants that need more than three people.

Confidence is **high** for the trust boundary, route separation, no hidden
fallback, personal-item model, and accessibility requirements because they are
governed by repository contracts. Confidence is **medium** for final labels,
settings placement, and the three-person product bound until representative
nonprofit Website staff complete moderated testing.

## Current behavior, intended behavior, and best permanent path

### Current behavior

No merged runtime implementation currently provides a Website review follow-up
route. D29 therefore cannot preserve runtime behavior merely because a current
table or component happens to exist. The current mutable task/assignee/reminder
model and broad staff-role maps are explicitly weaker than D19–D28 and must not
be treated as precedent.

ADR-0027/D19 notification presentation is not the platform's shared task
model:

- the authoritative work condition lives in the D28 source episode;
- the item is a private, recoverable projection of that condition;
- it has no mutable assignee, task completion, priority, due date, comment
  thread, queue, recurrence, reminder, or user-authored body;
- reading changes only one person's engagement and never changes source truth;
- the item ends from the source transition, not a task checkbox; and
- deleting, dismissing, or completing a generic task cannot resolve D28.

Reusing a shared task table would create dual ownership between task status and
the candidate-review lane, revive the legacy footguns D19 rejected, and make a
read or assignee mutation capable of drifting from source truth.

The governing `platform-boundaries` requirement for shared Mission Control
tasks is phrased broadly enough to look contradictory, but its scenario is an
independently lifecycle-owned operational task and its **Needs Attention** view
is explicitly contribution-facing. D29 has no independent work object: it is a
recipient-specific projection of the already-authoritative D28 source episode.
The later OpenSpec reconciliation must therefore add this exact clarification
without changing either model:

> The shared Mission Control task requirement governs independently lifecycle-
> owned staff tasks and the contribution-facing Needs Attention view. It does
> not reclassify ADR-0027 recipient-specific, source-actionable notification
> items as tasks.

This Grill records the required amendment but does not mutate OpenSpec before
the dedicated specification pass.

### Intended behavior

When an exact current external review declines or expires without a review
decision, D28 opens one reassignment episode. D29 resolves one explicit,
bounded responsibility route and creates one personal item for each selected
coordinator who can currently see the candidate and perform at least one lawful
successor-lane action: a fresh external successor or return to internal review.
Each person owns only personal unread/read engagement. One source
transition ends every applicable sibling item.

### Best permanent path

Add one typed Website review follow-up route to the same Site-management
coordination owner and generated resolver framework that D21/D22 use. Keep a
different route-kind identity, registry entry, recipient role, message key,
route revisions, and audit meaning. Integrate it with D28 through one generated
resolver and the Phase 6/17 occurrence-item boundary. Do not create a D29 task
table, a generic workflow builder, a queue, a team-assignment system, or a CMS
collection.

## Exact corrected decision

### D29-R1 — exact purpose

The Website review follow-up route selects who is organizationally responsible
for choosing the next review lane after a D28 decline or expiry episode. It
does not select the external reviewer, Website reviewer, Plan editor, publisher,
or route manager and does not complete or cancel source work.

### D29-R2 — distinct route kind, shared engine

D29 SHALL use the D21/D22 route-revision, effective-route, authorization-
intersection, occurrence, personal-item, audit, handoff, and reconciliation
engine through a separately registered route kind. D29 SHALL NOT reference the
D21 member revision as its roster, copy it automatically, synchronize it,
derive it from it, or use it as an implicit fallback.

### D29-R3 — closed scope hierarchy

One Tenant has one current closed D29 policy state: **unconfigured**, **send no
follow-up item**, or a configured route of one to three people. A Site has one
current closed state: inherit the Tenant posture; use one to three Site people
then the Tenant posture after proved Site zero; use one to three Site people
then no item; or send no Site follow-up item. Member rows exist only for a
configured route. There is no creator, inviter, reviewer, admin, role, team,
support, AI, or legacy-queue fallback.

### D29-R4 — one-to-three equal people

A configured route contains one, two, or three unique stable staff Parties.
Members are unordered and equally responsible. There is no primary, backup,
priority, rank, promotion, claim, rotation, schedule, quorum, workload score,
or all-of completion. A fourth or duplicate request rejects atomically and the
prior head remains current.

### D29-R5 — three independent meanings

The system SHALL keep three facts separate:

1. route-management authorization — who may configure responsibility;
2. coordinator responsibility — who the Tenant deliberately selected; and
3. source authorization — who may see the exact candidate and perform each
   current D28 action.

None implies another. Actor, Tenant, environment, Site, route head, and audit
attribution come from trusted server context rather than caller input.

### D29-R6 — picker candidate set and qualification

The picker enumerates only same-Tenant Active staff assignments that the
current route manager may see. Current source qualification is displayed as a
separate factual status. A currently unqualified active person may remain
configured as responsibility intent after a clear warning, but receives no
item or action until independently authorized. Existing configured members who
lose qualification remain visible to an authorized manager with repair
guidance; Core never silently deletes history.

### D29-R7 — event-time and action-time authorization

At D28 occurrence compilation, the server intersects the winning explicit
route with current exact candidate visibility and permission to perform at
least one lawful successor-lane action: a fresh external successor or return to
internal review. **Cancel planned change** alone never qualifies a recipient;
it remains a separately authorized source-terminal action. At every list, open,
detail, and action request Core re-proves current access. Route membership
grants nothing. Current authorization without route membership creates no D29
item.

### D29-R8 — effective route precedence

An inherited Site evaluates only the current Tenant route. A Site override
first evaluates only its Site members. If at least one Site member is proved
qualified, only those qualified Site members receive items; the Tenant route
does not join. The Site fallback is considered only after complete proof that
zero Site members qualify.

### D29-R9 — explicit fallback and stable leg

Only the manager-visible, saved Tenant fallback may run. Unknown, partial,
stale, corrupt, contradictory, timed-out, or over-limit Site proof is not zero
and never invokes fallback. Once a routing leg releases for an open D28
episode, recovery of a higher-priority route does not bounce responsibility
back. A later genuine D28 episode evaluates current precedence anew.

### D29-R10 — closed resolver result

The generated resolver returns exactly one of: complete released set, complete
proved zero, or indeterminate with a safe reason code. It enumerates the whole
bounded winning set before releasing any item. It never partially releases,
truncates, samples, guesses, caches stale authority, or interprets an execution
ceiling as a product target.

### D29-R11 — D25 handoff remains source-authorized

Unconfigured, deliberate no-item, proved-zero, and indeterminate D29 coverage
never block an independently authorized D25 handoff. Before **Send invitation
and hand off**, Core presents the distinct truthful coverage consequence. It
offers **Set follow-up coordinators** or **Turn on follow-up**
only to a separately authorized route manager and preserves **Send invitation
and hand off**. Only a D25, D26, source-policy, identity, candidate, or current-
lane failure may block that source command.

### D29-R12 — first-use and unconfigured posture

The Tenant posture starts explicitly unconfigured. Enabling external review may
recommend coordinator setup but SHALL NOT create a blocking wizard, guessed
default, copied reviewer list, or recurring nag. An authorized settings surface
shows persistent setup status and the exact consequence. Site creation inherits
the destination Tenant posture by reference; an unconfigured Tenant remains
truthfully unconfigured and a deliberate no-item Tenant posture remains
truthfully off. Core never conflates those two facts.

### D29-R13 — zero and indeterminate UX

Unconfigured says **External review follow-up needs setup**. A deliberate
no-item posture says **External review follow-up is off**. A configured route
whose current qualification is completely proved zero says **No coordinator
can currently receive this item**. Every state explains that authorized staff
can still find the work in Languages and creates no guessed recipient.
Indeterminate instead says **We couldn't confirm follow-up coverage**, releases
nobody, and never claims that the route is absent or off. None creates a task,
email, reminder, fallback broadcast, source block, or public effect.

### D29-R14 — prospective ordinary save

An ordinary coordinator save affects future D28 episodes. It creates one
immutable route revision, advances one current head, records one command
receipt and audit event, and leaves current episodes and personal engagement
unchanged. The result explicitly says that current follow-ups kept their
existing recipients.

### D29-R15 — explicit current-episode handoff

If current D28 episodes exist and the actor may see them, Core separately
offers **Review current follow-up**. A fresh, privacy-filtered impact preview
shows newly notified, no-longer-responsible, unchanged/no-new-unread, hidden,
and unaffected counts. An explicit expected-fence command performs one
differential successor occurrence. Unchanged recipients keep engagement;
removed recipients leave Needs attention without fabricated read; newly
admitted recipients receive one new item.

### D29-R16 — last-coordinator removal

An empty configured route is impossible. Removing the last Tenant coordinator
requires the deliberate action **Stop follow-up notifications** with a
consequence preview and writes the distinct deliberate no-item Tenant posture,
not **unconfigured**. Removing the last Site coordinator requires choosing
**Use [Tenant name] coordinators** or the distinct **Send no follow-up item**
Site posture. Current D28 episodes change only through the separately confirmed
handoff.

### D29-R17 — recipient-specific item and end

One D28 reassignment episode produces one semantic Phase 6 occurrence and one
Phase 17 item per exact selected Tenant, Party, registered recipient role, and
surface. There is no shared item or read state. Reading clears only unread.
The item stays actionable until a successor lane commits or the source becomes
terminal. It cannot be dismissed, archived, snoozed, aged out, or completed as
a task.

### D29-R18 — recipient explanation and privacy

The compact item remains D28's privacy-safe preview. The destination may say
**You're an external-review follow-up coordinator for hope.org** and explain
that opening does not claim work. Names, route roster, external reviewer
identity, exact decline reason, sibling delivery/read state, presence,
availability, and access failures remain hidden unless an independent purpose-
specific authorization permits them.

### D29-R19 — UI location and exact labels

Mission Control presents the route on **Settings → Websites → Reviews**, on the
**Website reviews** page under **Review responsibilities**, beside but not
merged with D21 Website-review settings. The
cards are **Review notifications** and **External review follow-up**.
The editor action is **Change coordinators**. The question is **Who chooses the
next step?** Staff copy never uses resolver, route head,
occurrence, Party, recipient role, or reassignment generation.

### D29-R20 — Base Maia interaction contract

The summary uses a shared Base Maia Card. Editing uses a responsive shared
Sheet; a consequential last-person removal may use a shared Dialog. The picker
uses the shared Base UI searchable combobox and semantic selected-person rows.
Feature code uses semantic tokens and existing shared primitives, never a
second component library, app-local primitive, hard-coded parallel palette, or
decorative motion system.

### D29-R21 — accessibility, localization, and resilience

The flow supports keyboard and screen reader use, stable focus, visible labels,
persistent text errors, polite status announcements, 44-by-44 targets,
320-CSS-pixel/400-percent reflow, forced colors, reduced motion, text spacing,
long Unicode names, CJK, combining marks, RTL and bidi isolation, localized
pluralization, mobile safe areas, and weak-network recovery. Offline edits stay
local and are never presented as saved authorization truth.

### D29-R22 — no unrelated effects

D29 creates no final review, reviewer invitation, candidate change,
publication, public route, locale, Page, Navigation, Communications, Giving,
Legal Entity, Stripe, settlement, bank, currency, contribution, receipt,
ledger, accounting, email, push, SMS, reminder, due date, escalation, task,
comment, assignment queue, export, or AI authority.

### D29-R23 — rollout and reservation

The route and item key remain Reserved until the typed registry, OpenSpec,
source adapters, authorization capabilities, generated resolver, schema, RLS,
privileged-path parity, migration, rollback strategy, accessibility evidence,
production-shaped tests, and observability are complete. Routes backfill to
unconfigured; migration never guesses coordinators from existing permissions,
reviewers, creators, inviters, admins, or task assignees.

### D29-R24 — evidence-limited bound

The three-person maximum is a code-owned v1 product bound, not a Tenant setting
and not an external universal best practice. A later increase requires a
versioned route contract plus new comprehension, notification-noise, privacy,
load, isolation, migration, and rollout proof. Support pressure alone never
causes silent truncation or group fallback.

### D29-R25 — decision and artifact status

D29 closes the founder-level recipient-responsibility decision. It amends
ADR-0182 because it completes the recipient boundary already reserved there;
it does not justify a new ADR. The glossary adds **Website review follow-up
route**. D29 remains non-Live until implementation evidence closes the Reserved
gate.

## Current primary-source comparison and limits

- [GitHub team review settings](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team)
  explicitly say targeted review assignment can reduce noise and clarify
  individual responsibility. Core adopts explicit bounded responsibility but
  rejects GitHub's Busy status, workload algorithms, and automatic assignment.
- [Atlassian service configuration](https://support.atlassian.com/jira-service-management-cloud/docs/create-a-service/)
  separates owner teams, change approvers, responders, and stakeholders. That
  supports exact duty labels. It does not prove Core should adopt teams, email,
  service workflows, or optional fields without consequence copy.
- [Blackbaud Grantmaking Reviews](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reviews.html)
  separates permission to assign, internal/external reviewer access, multiple
  reviewers, and review outcome. Core rejects its per-record wizard, committee,
  dates, configured emails, and broad review product.
- [Salesforce Flow Approval Processes](https://help.salesforce.com/s/articleView?id=platform.automate_automated_approvals_build_create_step_to_interact_with_reviewers.htm&language=en_US&type=5)
  assigns explicit people, groups, or queues while warning implementers to
  verify access to the reviewed record. Core uses exact people and stronger
  event/action reproof, not orchestration, queues, delegates, or email actions.
- [Contentful Entry Tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
  are a negative control: Contentful can assign a task to someone who lacks
  entry access and then cannot resolve it. Core prevents that footgun through
  qualification display and server intersection and rejects task, due-date,
  email, reminder, delete, and reopen semantics.
- [W3C combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/),
  [listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/),
  [dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), and
  [WCAG 2.2](https://www.w3.org/TR/WCAG22/) guidance controls the accessible
  selection, focus, error-prevention, target, and reflow contract.

These sources support explicit responsibility, duty separation, noise control,
current access validation, and accessible selection. They do not override Core
ADRs, prove the exact three-person limit, justify email/reminders, or establish
Tenant/Site inheritance. Where external practice conflicts with a governing
repository decision, the repository decision controls.

## Complete staff experience and information architecture

### Role clarity before controls

The design must make four different roles understandable without teaching
staff architecture:

| Staff meaning                  | What the person does                                                                                  | What it never grants                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Website reviewer               | receives D20 attention when a Website Plan is ready or requires renewed review                        | follow-up responsibility or settings authority                        |
| Website review coordinator     | receives attention when an external review ends without a decision and chooses an available next path | Site access, review, invitation, cancellation, or settings permission |
| Review-settings manager        | chooses the Website-review and follow-up rosters                                                      | ability to review, invite, cancel, or publish                         |
| Independently authorized actor | may perform an exact source action from Languages even without an item                                | notification responsibility or roster visibility                      |

The settings page uses event-led descriptions, not a matrix of role jargon. A
short **How this works** disclosure may explain the distinction, but the
ordinary card must be understandable without opening it.

The final page hierarchy is:

    Website reviews

    Review responsibilities

    Review notifications
    Who normally receives private attention when a Website Plan is ready for
    review, changed since review, or affected by a current-default change.

    External review follow-up
    Who receives attention to choose the next path when an outside review ends
    without a decision.

    External review
    When authorized staff may invite one outside person.

**Review responsibilities** is a section heading, not the page title. That
keeps D21 and D29 visibly related without misclassifying D26's availability
policy as a responsibility roster.

### Tenant summary card

The **Website reviews** page contains this card under **Review
responsibilities**, followed separately by D26's **External review** policy
card:

    External review follow-up

    Who handles follow-up when an invited reviewer declines or their
    invitation expires?

    Website review coordinators
    Maria Santos
    Joel Martin

    Core sends each selected person a private Needs attention item only when
    they can open the exact Plan and take at least one available next step.

    Choosing coordinators does not give anyone access or permission.

    2 coordinators · Used by 18 Sites · 2 Sites use their own coordinators

    [Change coordinators]

The coverage line is factual and neutral, never a green promise. Names and
counts are privacy-filtered. Where the viewer may know only that coverage
exists, the card says **Tenant coordinators configured** without roster detail.

### One-to-three editor

**Change coordinators** opens a responsive Sheet titled **External review
follow-up**. It repeats the consequence before the first input. A searchable
combobox adds one exact person at a time. Selected people render outside the
listbox as semantic rows with name, permitted disambiguator, current coverage
status, and a separate **Remove [name]** button.

With one person:

    Maria Santos
    Coverage will be checked whenever external-review follow-up is needed.
    [Remove Maria Santos]

    One person is usually clearest.
    [Add coverage coordinator]

With two:

    2 people share external-review follow-up

    Maria Santos
    Joel Martin

    Both receive separate items when currently allowed. One authorized person
    chooses the next review path.

At three:

    3 people selected · maximum

    All three are equally responsible. Display order does not set priority.
    Remove someone before adding another.

The disabled add control retains its explanation. A forged fourth selection
produces a persistent text error and writes nothing. There is no drag handle,
star, primary badge, backup toggle, select-all, team, group, CSV, pasted list,
or hidden order.

At Site scope a result may say:

- **Can currently receive follow-up items for hope.org**; or
- **Cannot currently receive — choosing this person does not grant access**.

At Tenant scope one person may qualify for only some Sites. Where the manager
may see the aggregate, Core may say **Can currently receive follow-up for 12 of
18 Sites; 2 Sites use their own coordinators**. It never claims universal
qualification or enumerates restricted Sites. Coverage calculation may load
separately from directory search so weak networks do not block person
selection; an unresolved calculation is labelled unavailable, not zero.

The footer contains **Cancel** and **Save coordinators**. Save is disabled only
for an unchanged form, an invalid duplicate/fourth selection, a missing closed
mode, or a known authorization/fence error. A person who is currently
unqualified may be saved after the warning because responsibility intent and
current authorization are independent. The result never promises that every
configured person will receive every item.

### Ordinary Site inheritance

On **Settings → Websites → Reviews**, selecting **Site exceptions → hope.org**
opens:

    External review follow-up

    ● Use Hope Ministries coordinators (Tenant default)
      Maria Santos, Joel Martin

    ○ Choose coordinators for hope.org

    ○ Send no follow-up item for hope.org
      Authorized staff can still find the review in Languages.

    This changes private follow-up attention only. It does not change the
    website, Giving, or anyone's permissions.

Showing the Tenant's display name alongside **Tenant default** helps staff
understand whose default is inherited. If the viewer cannot enumerate the
Tenant roster, Core shows the mode and safe count or simply **Configured**.

### Site override and fallback

Choosing **Choose coordinators for hope.org** progressively reveals:

    hope.org coordinators
    Ana García

    If no hope.org coordinator can receive the item

    ● Use Hope Ministries coordinators (recommended)
    ○ Send no follow-up item

    Fallback is used only when Core can prove that none of the Site
    coordinators can act. A system error never widens the audience.
    Core cannot detect holidays or workload.

    [Save coordinators]

If even one selected Site coordinator is proved qualified, only qualified Site
coordinators receive the item. Tenant coordinators do not join. “Away,” “busy,”
“has not read,” time elapsed, delivery failure, and another person's intuition
about availability are never fallback evidence.

When the saved fallback points to an unconfigured Tenant posture, the summary
says **Tenant fallback needs setup**. A deliberate Tenant no-item posture says
**Tenant follow-up is off**. A configured route with completely proved-zero
qualification says **No Tenant coordinator can currently receive follow-up**.
When Tenant proof is indeterminate, it says **Tenant fallback could not be
confirmed**. None is silently rewritten to another state or an admin broadcast.

### First D25 handoff without an effective recipient

If the current D29 posture is unconfigured, the existing D25 handoff
confirmation adds a nonblocking consequence block:

    External review follow-up isn't assigned

    If this review ends without a decision, no one will receive a Needs
    attention item. Authorized staff can still find it in Languages.

    [Set follow-up coordinators]   [Send invitation and hand off]

Only a separately authorized route manager sees the setup action. The D25
actor retains **Send invitation and hand off**. No typed phrase or extra wizard
is required.

If follow-up was deliberately turned off, the title is **External review
follow-up is off** and the authorized settings action is **Turn on follow-up**.
If a configured route completely proves zero current recipients, the title is
**No coordinator can currently receive follow-up**. All three use the same
nonblocking consequence and remain distinct in audit and settings health.

If D29 coverage is indeterminate:

    We couldn't confirm follow-up coverage

    Core cannot currently verify who would receive a follow-up item. It will
    not guess or broaden the audience.

D29 indeterminacy does not block a D25 command whose own source, policy,
identity, candidate, and lane proofs succeed. Conversely, D29 coverage never
rescues a failed D25 proof.

### No-route and degraded source experience

At settings:

    External review follow-up needs setup

    No coordinator is assigned. If an external review ends without a decision,
    no one will receive a Needs attention item. Authorized staff can still find
    the review in Languages.

    [Choose coordinators]

A deliberate no-item posture instead says:

    External review follow-up is off

    This was turned off for Hope Ministries. No personal item will be sent;
    authorized staff can still find the review in Languages.

    [Turn on follow-up]

At a current source episode:

    Review needs a next step

    No follow-up coordinator can currently receive this item. Authorized staff
    can still choose a next step here.

The setup action appears only with route-management authority. Independently
authorized actors retain source actions even when they are not coordinators.
Staff who lack source access see neither the episode nor protected details.

Indeterminate uses different copy:

    We couldn't confirm follow-up coverage

    No item was sent because Core could not safely verify recipients. The
    review remains visible to authorized staff in Languages.

    [Try again]

**Try again** re-runs the same semantic reconciliation. It never creates a new
episode, duplicate unread item, or widened route.

### Last coordinator removal

The route editor may temporarily hold an empty local draft, but it cannot save
an ambiguous configured-empty head.

Removing the last Tenant coordinator offers:

    Stop external-review follow-up notifications?

    Future external reviews that end without a decision will create no Needs
    attention item. Authorized staff can still find them in Languages.

    18 Sites use this Tenant default. 2 Sites use their own coordinators.
    Current follow-ups will not change unless you update them separately.

    [Stop follow-up notifications]   [Keep Maria Santos]

After confirmation, the card says **External review follow-up is off** rather
than **needs setup**. The command records a distinct deliberate no-item posture
and immutable receipt; it does not erase the superseded coordinator revision.

Removing the last Site coordinator offers two explicit destinations:

- **Use Hope Ministries coordinators**; or
- **Send no follow-up item**.

No deletion action silently chooses inheritance, fallback, or no notification.
No route mutation changes public Site behavior, Giving, source state, or
permission.

### Prospective save and explicit current handoff

Ordinary save result:

    Follow-up coordinators saved

    Maria Santos and Ana García will receive future follow-up items when
    currently authorized. Current follow-ups keep their existing recipients.

    2 external reviews already need a next step.
    [Review current follow-up]

The separate impact preview says:

    Use these coordinators for 2 current follow-ups?

    Newly notified
    Ana García

    No longer receives these items
    Maria Santos

    Unchanged · no new unread item
    Joel Martin

    This changes private follow-up attention only. It does not change Website
    access, review permission, the live website, or Giving.

    [Update 2 current follow-ups]   [Keep current follow-up]

For a Tenant route change, the preview distinguishes inherited Sites, Site
overrides, fallback legs currently in use, hidden detail, and unaffected
episodes. A stale preview blocks only the current-episode handoff, not the
already completed prospective save. The UI preserves the draft, shows the
current diff, and asks for a fresh preview.

A contextual zero-route repair may combine the effects only with an exact
button such as **Save coordinators and notify 1 current follow-up** and a fresh
impact summary. It may not hide current reassignment behind a generic Save.

### Recipient item and why-me explanation

The compact D28 item remains minimal:

    External review needs a next step
    hope.org · French (Canada)

    An invited review ended without a decision.
    hope.org still opens English. Giving is unchanged.

    [Choose another external reviewer]

The destination adds:

    Why you received this

    You're an external-review follow-up coordinator for hope.org.
    You and 1 other coordinator received separate items. One authorized person
    chooses the next review path. Opening this item does not claim it.

Only currently lawful actions appear. A decline normally leads with **Choose
another external reviewer**; expiry normally leads with **Invite again**.
**Return to internal review** and **Cancel planned change** appear only under
their independent current source authorization.

If another coordinator wins while this person is viewing:

    Next review path chosen

    This review no longer needs your action.

Actor attribution appears only when independently authorized. Otherwise Core
says **The next review path was chosen**. Local unsaved safe input is preserved
for recovery where applicable, but no stale effect button remains.

### Experience by audience

| Audience                                 | Experience                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Tenant route manager                     | full private roster, coverage status, prospective save, explicit impact preview                 |
| Site-only route manager                  | Site editor and privacy-safe Tenant fallback status; Tenant names only if independently visible |
| selected authorized coordinator          | one personal Needs attention item and current lawful actions                                    |
| selected but unqualified coordinator     | no item or protected detail; route manager sees safe repair status                              |
| independently authorized non-coordinator | may discover and act from Languages; receives no D29 item                                       |
| final Website reviewer                   | no D29 item merely because of D21 membership                                                    |
| original inviter                         | no D29 item merely because they invited                                                         |
| external reviewer                        | no coordinator roster, staff item, or Mission Control navigation                                |
| unrelated staff or admin                 | no roster/detail unless separately authorized; no fallback item                                 |
| missionary, donor, public visitor        | no D29 surface or observable behavior change                                                    |
| support or service role                  | no ambient roster/action; purpose-limited audited repair only                                   |

### Mobile, accessibility, localization, and weak network

- The Card summary is fully usable before loading the directory search.
- Desktop uses a responsive side Sheet; narrow screens use a full-width,
  full-height Sheet with one-column content and a safe-area-aware sticky footer.
- The on-screen keyboard never hides the active search input, result, or Save
  action. There is no horizontal action rail.
- The combobox has a visible label, described purpose, expanded state,
  controlled listbox, standard arrow/Enter/Escape behavior, and cancelable
  server search.
- Selected people live outside listbox options. Options contain no nested
  remove buttons, links, toggles, or inaccessible semantic structures.
- Every remove action has an exact accessible name and 44-by-44 target. After
  removal, focus moves to the next row, previous row, or Add control.
- Inheritance and fallback choices use native radio semantics with a fieldset
  and legend. Selection never changes context before Save.
- Add, remove, current count, maximum, Save, conflict, and error use one concise
  polite status region. Focus is not stolen by a toast.
- Persistent inline errors identify the field and recovery. A toast may
  supplement but never carry the only result.
- Escape or backdrop close with a dirty form presents **Discard unsaved
  changes?**; clean close returns focus to **Change coordinators**.
- Semantic colors and text carry status together. Forced colors, visible
  focus, contrast, reduced motion, text spacing, and 400-percent zoom remain
  functional.
- Person names wrap and use bidi isolation or direction auto-detection. CJK,
  combining marks, long names, duplicate names, email disambiguators, and RTL
  do not reorder controls or truncate decisive status.
- Avatars are optional and decorative. Flags never represent identity,
  language, geography, or qualification.
- Plural copy is localized for one, two, three, and affected-episode counts.
  Domains and stable identifiers are not translated.
- Search is purpose-filtered, same-Tenant, keyset-paginated, cancelable, and
  never downloads the complete staff directory.
- Offline edits remain local with **You're offline. Changes haven't been
  saved.** No cached authorization or optimistic route claim is used.
- A lost response reconciles by client command ID. The UI distinguishes saved
  configuration from pending or failed downstream handoff effects.
- Loading, empty, no-result, route-zero, authorization-changed, conflict,
  indeterminate, and retry states all preserve the previous authoritative
  summary.

## Source of truth, ownership, and domain invariants

| Fact                                                         | Authoritative owner                                      | Derived projection            | Forbidden authority                              |
| ------------------------------------------------------------ | -------------------------------------------------------- | ----------------------------- | ------------------------------------------------ |
| D28 applicability, episode, and end                          | candidate-review source and lane owner                   | item applicability            | route, item, read state, task                    |
| current ability to see or act                                | Phase 12 EffectiveAccess plus source policy              | qualification status          | coordinator label, job title, item possession    |
| Tenant/Site coordinator intent or deliberate no-item posture | typed Site-management D29 policy/route revision and head | settings card                 | D21 reviewer route, creator, inviter, admin role |
| winning route and released set                               | generated D29 resolver over current facts                | occurrence evidence           | browser list, cache, legacy task                 |
| semantic occurrence                                          | Phase 6 registered D28 meaning                           | delivery/item fan-out         | provider event, timer, recipient edit            |
| personal item and engagement                                 | Phase 17 Tenant+Party+role+surface records               | bell, Needs attention, Recent | source completion, shared team row               |
| next-lane outcome                                            | D27/D28 source command and receipt                       | item end and history          | read, click, notification delivery               |
| external reviewer identity and reason                        | D25/source protected record                              | authorized detail projection  | compact item, public log, route roster           |
| public Site, locale root, and Giving                         | D16/public/Giving owners                                 | unchanged reassurance         | D29 route or item                                |
| coordinator configuration audit                              | append-only command receipt and route revision           | manager history               | mutable settings blob or logs only               |

Required invariants:

1. Coordinator responsibility never grants authorization.
2. Authorization never creates coordinator responsibility.
3. D21 Website-review responsibility never implies D29 follow-up responsibility.
4. D29 never copies, syncs, aliases, or falls back to the D21 roster.
5. Exactly one closed D29 policy mode applies for one Tenant/Site policy head;
   unconfigured, deliberate no-item, and configured-but-currently-zero are
   different facts.
6. A configured route has one to three unique stable staff Parties.
7. Members are unordered and equal; display order has no domain meaning.
8. An empty configured route is impossible.
9. A Site override has exactly one fallback value: Tenant route or none.
10. Only proved zero may invoke the explicit fallback.
11. Partial or indeterminate proof never releases a partial set or fallback.
12. Route selection is deterministic from server-owned current facts.
13. Callers cannot supply Tenant, actor, recipient role, resolved set, or
    qualification.
14. One D28 episode has at most one current routing leg and semantic occurrence.
15. One exact recipient has at most one active D29 item for that episode, role,
    and surface.
16. Personal read, unread, open, and engagement never transfer between people.
17. An unchanged recipient never receives a new unread item from a route edit.
18. Removed and new recipients never inherit one another's engagement.
19. Access loss removes protected presentation immediately.
20. Later access or route membership never revives an old item.
21. One source compare-and-swap decides the next review lane.
22. Notification absence, delivery, read, or failure never blocks or completes
    D25 or D28 source work.
23. Route settings are prospective unless a separate current-episode handoff
    commits.
24. Site clone, template, import, transfer, and environment copy never copy
    named coordinators into active responsibility.
25. Route and item state have zero public, donor, Giving, or financial effect.

## Conceptual data, RLS, and authorization contract

Exact table and command names remain design work, but the implementation must
preserve this relational shape rather than use mutable JSON, a generic task,
or a role-membership shortcut:

- one typed append-only D29 Tenant/Site policy/route-revision lineage;
- one current-policy-head pointer per exact Tenant, environment, route kind, and
  optional Site scope;
- immutable route-member rows keyed to stable Party identity;
- closed Tenant modes `unconfigured`, `configured_members`, and
  `no_personal_item`;
- closed Site modes `inherit_tenant`, `site_members_then_tenant`,
  `site_members_then_no_item`, and `site_no_personal_item`;
- append-only route-command receipts and actor attribution;
- generated resolver manifest and version;
- D28 occurrence evidence with route revision, winning leg, released-set
  digest, and authorization/source fences; and
- Phase 17 personal item and engagement records kept separate from route and
  source truth.

### Database constraints and indexes

1. UUID primary keys follow repository convention; mutable names and emails
   never key relationships.
2. Tenant and environment are present on every relation required to prove
   same-scope foreign relationships.
3. A Tenant route has no Site; a Site route references exactly one same-Tenant,
   same-environment Site.
4. One current head is unique for the exact Tenant/environment/route-kind/scope.
5. One Party occurs at most once in one route revision.
6. One to three membership is database-enforced through an admitted relational
   design, deferred constraint trigger, or the single protected mutation
   boundary plus hostile database proof. A browser convention is insufficient.
7. Closed checks make Tenant unconfigured, Tenant configured, Tenant no-item,
   Site inherited, Site members with Tenant fallback, Site members with no
   fallback, and Site no-item states unambiguous. A no-item policy has no member
   rows and is not an empty configured route.
8. Fallback is admitted only for a Site override; a Tenant route cannot point
   to another fallback.
9. Tenant/environment/Site/Party fields on immutable revisions cannot be
   changed after insert.
10. Delete behavior preserves business and security evidence. Deactivation or
    privacy erasure follows the repository's Party/tombstone contract rather
    than cascading active responsibility to someone else.
11. Indexes cover current-head lookup, revision members, reverse Party impact,
    inheriting Sites, fallback-in-use Sites, active D28 dependency lookup,
    keyset audit pagination, outbox/reconciliation, and idempotency receipt.
12. Equality scope columns precede stable order columns; sparse current/active
    indexes are partial only when production query proof supports them.
13. No cross-schema Payload foreign key or CMS-owned permission/status copy is
    introduced.

### RLS and grants

- Browser roles receive no direct insert, update, or delete grant on route
  revisions, heads, members, resolver evidence, occurrences, items, engagement,
  or audit.
- RLS is enabled and forced where the repository contract requires it.
- SELECT policies expose purpose-specific views: route managers see the roster;
  recipients see a safe why-me projection; other authorized staff see only
  privacy-safe coverage; unrelated staff and other Tenants see nothing.
- Mutation policies use operation-correct USING and WITH CHECK to preserve
  current Tenant, environment, Site visibility, route-management capability,
  same-Tenant active Party intent, admitted mode transition, and immutable
  scope.
- An allowed update cannot move a row, member, head, actor, or Site into another
  Tenant/environment or turn an inherited route into a forged override.
- Server commands derive actor Party and role, Tenant, environment, Site,
  capability, audit attribution, recipient role, and current heads from trusted
  authentication context.
- Requested Party IDs express intent only. The server re-proves same-Tenant
  active assignment, manager visibility, uniqueness, and cardinality.
- SECURITY DEFINER helpers use schema-qualified objects, a controlled empty
  search path, least privilege, revoked public execution, and explicit positive
  and negative database tests.
- Owner, worker, service role, support, impersonation, RPC, view, cache,
  realtime, export, repair, and migration paths preserve the same isolation
  and purpose boundaries.

### Commands, concurrency, and idempotency

- Prospective route save carries a client command ID and expected current route
  head. Same ID and same meaning returns one receipt; changed meaning rejects.
- The command validates the complete draft, writes one immutable revision,
  advances one head by compare-and-swap, writes audit and durable reconciliation
  intent, and commits in one short transaction.
- Slow directory search, EffectiveAccess enumeration, and impact preview occur
  outside locks and are re-fenced at commit.
- Current-episode handoff carries expected route, D28 episode, candidate,
  source, lane, policy, authorization, and resolver generations.
- Handoff computes the full old/new delta before releasing any successor item.
  It preserves unchanged engagement and releases all newly admitted items
  all-before-any.
- A source transition racing a route handoff has one truthful winner. Source-
  first creates no new active item; handoff-first may create a successor that
  immediately ends after source recheck without badge debt or fabricated read.
- Two managers saving concurrently produce one head winner. The loser sees a
  privacy-filtered current diff and may retry from the fresh head; Core never
  silently rebases a draft.
- Route updates use one documented lock order across Tenant route, Site route,
  source episode, occurrence, and item effects. The implementation proves the
  actual order and deadlock behavior.
- Tenant-wide impact reconciliation is durable, bounded, chunked, and
  idempotent after the authoritative prospective save. Partial projection
  failure does not roll back or misstate the saved route.

## Lifecycle, temporal correctness, and edge-case map

| Scenario                                                       | Required behavior                                                                                                       |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Tenant route unset                                             | inherited Sites release zero; D25 remains independently available; settings show setup path                             |
| Tenant follow-up deliberately off                              | inherited Sites release zero; settings say off rather than setup; D25 remains independently available                   |
| Tenant route configured with one                               | one current authorized person receives a personal item                                                                  |
| two or three configured                                        | all current authorized members receive separate items; one source choice suffices                                       |
| fourth or duplicate attempted                                  | whole save rejects; current head remains                                                                                |
| Site inherits                                                  | current Tenant D29 route only; no copied member list                                                                    |
| Site override partially qualified                              | qualified Site members only; Tenant fallback does not join                                                              |
| Site override proved zero, fallback on                         | evaluate current Tenant D29 route                                                                                       |
| Site override proved zero, fallback off                        | zero item; source remains discoverable                                                                                  |
| Site follow-up deliberately off                                | zero item without evaluating members or Tenant fallback; source remains discoverable                                    |
| Site or Tenant resolver unknown                                | indeterminate; no release or fallback                                                                                   |
| Tenant fallback absent                                         | truthful fallback-needs-setup status; no guessed audience                                                               |
| current coordinator loses one of several successor permissions | receives item only if a fresh external successor or internal return remains lawful; cancellation alone does not qualify |
| all selected recipients lose action authorization              | presentation ends; explicit fallback may reconcile only after complete proof                                            |
| coordinator remains authorized while on leave                  | no automatic change; manager deliberately edits or hands off                                                            |
| person deactivated or leaves Tenant                            | excluded from release; manager sees safe inactive status; history retained                                              |
| person later returns                                           | old item never revives; future episode or explicit current handoff required                                             |
| selected member reads then is removed                          | personal read retained in ended history; never transferred                                                              |
| same Party has several staff grants                            | one route member and one registered-role item                                                                           |
| Party identities merge                                         | route membership and occurrence are explicitly reconciled; no duplicate or engagement merge                             |
| two people share a display name                                | authorized disambiguator; stable Party identity controls                                                                |
| original inviter is not coordinator                            | no D29 item solely from authorship                                                                                      |
| Website reviewer is not coordinator                            | no D29 item solely from D21 membership                                                                                  |
| coordinator cannot see exact candidate                         | no item or protected detail; route remains responsibility intent                                                        |
| independently authorized non-coordinator                       | may act from Languages; no D29 item                                                                                     |
| two coordinators choose concurrently                           | one source CAS wins; loser sees current result                                                                          |
| route save while D28 open                                      | prospective only; current episode unchanged                                                                             |
| explicit handoff while source completes                        | one winner; no active orphan or badge debt                                                                              |
| first D25 handoff with released-zero D29                       | nonblocking warning; lawful D25 handoff remains available                                                               |
| first D25 handoff with D29 unknown                             | truthful cannot-confirm warning; D29 does not block D25                                                                 |
| removing last Tenant coordinator                               | explicit stop-notifications posture and impact preview                                                                  |
| removing last Site coordinator                                 | explicit inherit or no-item choice                                                                                      |
| D26 external review prohibited                                 | route may remain harmless/inactive; no new D28 item                                                                     |
| D26 later widens                                               | current route applies prospectively; no old episode or grant revival                                                    |
| Site cloned or templated                                       | named people not copied; destination inherits its Tenant route                                                          |
| Site transferred across Tenant                                 | route and private history do not cross; destination starts inherited/unconfigured                                       |
| environment copy                                               | no named active responsibility copied without destination authorization contract                                        |
| Site suspended                                                 | private routing follows source policy; public serving state is not inferred                                             |
| Site retired                                                   | no new D29 routing; source owner ends current work; permitted history remains                                           |
| locale/default/public root changes                             | stable candidate/Site/locale identity controls; no route mutation from labels                                           |
| external reviewer identity protected                           | compact item remains identity-free; authorized detail only                                                              |
| stale or bookmarked item link                                  | current authorization and source state re-proved; current truth or privacy-safe not found                               |
| browser goes offline during edit                               | local draft retained; no false saved state                                                                              |
| save response lost                                             | command receipt reconciles; no duplicate revision                                                                       |
| current head changes during edit                               | stale save rejected with current diff; no silent overwrite                                                              |
| directory search times out                                     | existing selected rows and authoritative summary remain; no zero inference                                              |
| message projection fails after source write                    | durable same-occurrence replay; no new episode or guessed recipient                                                     |
| notification key disabled                                      | source remains visible; no new items; history and route preserved                                                       |

## Ruthless adversarial review — all 22 categories

Severity and likelihood describe the unamended or incorrectly implemented
choice. “Effect on answer” states whether the founder's direction survives.

### 1. Problem validity, necessity, and alternatives

**Material concern exists: Yes.**

- **What could go wrong:** Core could add a second responsibility setting that
  staff cannot distinguish from Website reviewers, even though the simpler
  alternatives are to notify D21 reviewers, the original inviter, or every
  exact-capability holder.
- **Why it matters:** A redundant label adds setup without real clarity. The
  apparent no-build alternatives save one setting but make review ability,
  historical authorship, and follow-up accountability silently equivalent.
- **Severity:** High.
- **Likelihood:** High without event-led copy and a distinct route meaning.
- **Evidence or reasoning:** D21 explicitly separates permission from review
  responsibility; D28 explicitly reserves follow-up responsibility. GitHub
  identifies targeted assignment as a way to reduce noise and clarify
  responsibility. Atlassian separately labels owner, approver, responder, and
  stakeholder duties.
- **Effect on answer:** Narrows but does not invalidate Option 1. A distinct
  follow-up route is necessary; a generic role, task, or second workflow is not.
- **Best permanent fix:** Reuse the D21/D22 engine, create a separate typed
  route kind, use event-led labels, and keep the setting optional but visible.
- **Exact decision/spec language:** “D29 SHALL define one typed Website review
  follow-up route used only for D28 recipient selection. It SHALL NOT alias,
  copy, synchronize, or infer the D21 Website-review route and SHALL NOT create a
  generic task, assignment, or workflow product.”

### 2. Brittleness

**Material concern exists: Yes.**

- **What could go wrong:** An eligible-only picker could delete responsibility
  during transient access changes; a single coordinator could go on leave; an
  inherited roster could be copied and drift; fallback could flap as
  qualification changes.
- **Why it matters:** The feature is most important during reviewer failure and
  staff turnover. Brittle inference would strand precisely those episodes.
- **Severity:** High.
- **Likelihood:** Medium-High in multi-Site Tenants and normal staff turnover.
- **Evidence or reasoning:** D21 already distinguishes responsibility intent
  from current qualification, freezes a winning leg, and requires deliberate
  handoff. Core has no trusted leave, presence, or workload authority.
- **Effect on answer:** Requires stable route revisions, visible qualification,
  proved-zero-only fallback, no availability inference, and prospective edits.
- **Best permanent fix:** Keep active visible people configurable despite a
  current qualification warning; re-prove on every episode/action; provide
  explicit route edit and current handoff.
- **Exact decision/spec language:** “Temporary authorization loss, unread state,
  time elapsed, delivery state, workload, or inferred absence SHALL NOT mutate
  coordinator intent or invoke fallback. Only complete current proof and an
  accepted route transition may change the routing leg.”

### 3. Technical debt

**Material concern exists: Yes.**

- **What could go wrong:** Developers could duplicate D21 routing code, store
  member IDs in a settings JSON blob, reuse Mission Control tasks, or fork the
  person picker and authorization logic.
- **Why it matters:** Parallel routing and UI implementations would drift on
  fallback, access loss, RLS, handoff, accessibility, and recipient identity.
- **Severity:** High.
- **Likelihood:** High if “reuse” is not made a contract and route meaning is
  not typed.
- **Evidence or reasoning:** Platform boundaries require repeated behavior to
  converge; packages/ui forbids app-local primitive forks; D19 rejects generic
  task/assignee state as attention authority.
- **Effect on answer:** Requires one generated route engine with a distinct
  route kind, not a separate D29 engine or schema shortcut.
- **Best permanent fix:** Extend the typed registry, shared resolver,
  route-revision command boundary, Phase 17 projection, and shared Base Maia
  editor through composition.
- **Exact decision/spec language:** “D29 SHALL add one registered route kind to
  the shared D21/D22 coordination engine. No mutable JSON recipient array,
  legacy task row, app-local resolver, or app-local picker SHALL become an
  implementation shortcut.”

### 4. Edge cases

**Material concern exists: Yes.**

- **What could go wrong:** Duplicate names, multiple grants, fourth-person
  requests, last-person removal, inactive members, no Tenant fallback, Site
  transfer, identity merge, policy changes, or concurrent source completion
  could create duplicates, ambiguity, or stranded work.
- **Why it matters:** These are realistic operating events, not pathological
  inputs, and several occur during staff turnover—the core use case.
- **Severity:** High.
- **Likelihood:** Medium collectively.
- **Evidence or reasoning:** D21/D22 already require stable Party identity,
  closed modes, no copied Site rosters, differential handoff, and one source
  CAS. D25–D28 add candidate and external-lane races.
- **Effect on answer:** Requires the full lifecycle table, stable identities,
  atomic bounds, explicit last-member posture, and source/route fences.
- **Best permanent fix:** Make invalid combinations impossible in data and
  commands; test every lifecycle row as a user-visible outcome.
- **Exact decision/spec language:** “Duplicate, overflow, empty-configured,
  cross-Tenant, stale-head, source-ended, and ambiguous fallback inputs SHALL
  reject atomically with the prior authoritative state preserved and one clear
  recovery path.”

### 5. Footguns

**Material concern exists: Yes.**

- **What could go wrong:** Selecting a person could appear to grant access;
  deleting the final row could silently disable or inherit notifications;
  display order could imply backup priority; a manager could unknowingly
  reassign current work with an ordinary Save.
- **Why it matters:** Staff could expose sensitive candidates, believe coverage
  exists when it does not, or unintentionally interrupt current owners.
- **Severity:** High.
- **Likelihood:** High without explicit consequence copy and closed controls.
- **Evidence or reasoning:** Contentful documents the concrete failure of
  assigning a task to someone who lacks entry access. D21/D22 explicitly reject
  ordering, hidden fallback, current-work mutation, and assignment-as-access.
- **Effect on answer:** Requires repeated no-access-grant copy, explicit
  last-person options, unordered rows, and separate impact-previewed handoff.
- **Best permanent fix:** Design controls around consequences rather than raw
  CRUD; deny unsafe API shapes even if the UI hides them.
- **Exact decision/spec language:** “Coordinator add/remove SHALL never mutate
  access or current D28 recipients implicitly. Last-member removal and current-
  episode reassignment require separately labelled consequence actions.”

### 6. Tenant safety

**Material concern exists: Yes.**

- **What could go wrong:** Directory search, route members, Site fallback,
  cache, realtime, support repair, clone, or transfer could enumerate or attach
  a Party from another Tenant or environment.
- **Why it matters:** Roster membership and D28 candidates are private ministry
  operations; cross-Tenant disclosure is a critical incident.
- **Severity:** Critical.
- **Likelihood:** Low-Medium without composite scope enforcement and hostile
  tests.
- **Evidence or reasoning:** Platform principles place Tenant safety first;
  D19/D21/ADR-0027 require exact Tenant+Party+role+surface boundaries.
- **Effect on answer:** Requires Tenant/environment on every enforcing
  relation, purpose-filtered reads, same-scope relationships, and no copied
  named responsibility.
- **Best permanent fix:** Composite scope validation, forced RLS, trusted server
  context, cache/realtime topic scoping, and a cross-Tenant poison matrix across
  every privileged path.
- **Exact decision/spec language:** “No D29 search, read, write, resolver,
  occurrence, item, cache, realtime, support, migration, clone, or transfer path
  may enumerate, reference, or present a Party, Site, route, or episode outside
  its exact Tenant and environment.”

### 7. Database, RLS, and authorization safety

**Material concern exists: Yes.**

- **What could go wrong:** A caller could forge Tenant, Site, actor, member,
  route mode, recipient role, or qualification; an allowed update could move a
  route across scope; a service-role path could bypass RLS; a cross-row count
  could exceed three.
- **Why it matters:** UI checks cannot protect direct API, worker, RPC, repair,
  or compromised-client paths. A forged coordinator can expose a protected
  candidate.
- **Severity:** Critical.
- **Likelihood:** Medium if implemented as ordinary settings CRUD.
- **Evidence or reasoning:** ADR-0182 requires trusted context, expected-head
  CAS, RLS USING and WITH CHECK, privileged-path parity, and same-scope
  constraints. PostgreSQL cross-row cardinality needs more than a CHECK.
- **Effect on answer:** Requires protected server commands, immutable
  revisions, enforced one-to-three membership, forced RLS, and hostile database
  tests.
- **Best permanent fix:** Revoke browser writes; derive scope and actor;
  re-prove requested members; enforce closed modes and cardinality at the
  database/mutation boundary; secure every definer and service path.
- **Exact decision/spec language:** “Browser roles SHALL have no direct D29
  business-write grants. Every mutation SHALL derive trusted scope and actor,
  enforce same-scope one-to-three membership, use expected-head CAS, and pass
  operation-correct USING/WITH CHECK and privileged-path parity tests.”

### 8. Overengineering

**Material concern exists: Yes.**

- **What could go wrong:** The coordinator roster could grow into teams,
  queues, shifts, calendars, delegation, escalation, SLA, round robin,
  workload balancing, workflow rules, per-locale ownership, or generic tasks.
- **Why it matters:** These features introduce new authority, availability,
  fairness, temporal, privacy, and state-machine problems without verified
  ministry demand.
- **Severity:** Medium-High.
- **Likelihood:** Medium because comparable products advertise these features.
- **Evidence or reasoning:** GitHub, Salesforce, Contentful, Atlassian, and
  Blackbaud provide broader routing and workflow products. Core decisions
  deliberately reject their algorithms, tasks, email, reminders, and queues.
- **Effect on answer:** Confirms one typed 1–3 exact-person route and no generic
  abstraction beyond shared mechanical infrastructure.
- **Best permanent fix:** Freeze meaning and invariants, not speculative UI or
  extensibility. Add future behavior only through a new researched decision.
- **Exact decision/spec language:** “D29 SHALL NOT introduce a team/group route,
  delegation graph, primary/backup order, schedule, availability status,
  escalation, SLA, reminder, queue, workflow DSL, per-locale override, or task
  lifecycle.”

### 9. UX/UI and user friction

**Material concern exists: Yes.**

- **What could go wrong:** “Website reviewers,” “Website review coordinators,”
  and “reviewer problems” could blur together; small Tenants could face a
  setup wizard; large Tenants could see noisy cards; mobile or assistive users
  could be unable to manage the roster.
- **Why it matters:** Confusion defeats the reason for adding explicit
  responsibility and can lead to false confidence or unnecessary support.
- **Severity:** High.
- **Likelihood:** High without the corrected IA, exact copy, and shared
  interaction contract.
- **Evidence or reasoning:** D21/D22 already specify simple one-time setup,
  inheritance, accessible person rows, and transparent fallback. Modern sources
  separate duties and targeted notifications. WCAG/APG govern interaction.
- **Effect on answer:** Requires two event-led cards, a one-step ordinary save,
  skippable first-use setup, responsive Sheet, accessible combobox, and
  consequence-led exceptional paths.
- **Best permanent fix:** Implement the complete staff journey in this report,
  test comprehension with nonprofit Website staff, and treat no-route,
  indeterminate, mobile, RTL, and weak-network states as first-class.
- **Exact decision/spec language:** “Mission Control SHALL label D21 as Final
  review notifications and D29 as External review follow-up, ask Who handles
  **Who chooses the next step?**, and implement every ordinary and exceptional
  state with shared Base Maia/Base UI components and accessible consequence
  copy.”

### 10. Source of truth, ownership, and domain invariants

**Material concern exists: Yes.**

- **What could go wrong:** The route, item, task, read state, or CMS document
  could become a second authority for source actionability or next-lane state.
- **Why it matters:** Dual ownership produces impossible combinations such as a
  completed task with a still-open source episode or a dismissed item hiding
  required work.
- **Severity:** Critical.
- **Likelihood:** Medium if existing task/CMS infrastructure is reused.
- **Evidence or reasoning:** Platform boundaries keep operational workflow in
  CRM/server ownership and public content in CMS. D19/ADR-0027 make items
  source projections. ADR-0182 makes the candidate source own lane and episode.
- **Effect on answer:** Requires the source-of-truth table and invariants above;
  route owns only responsibility intent and Phase 17 owns only presentation.
- **Best permanent fix:** One authoritative source mutation boundary, immutable
  route revisions, generated projection, and no shared-task completion state.
- **Exact decision/spec language:** “The D28 source episode and lane SHALL own
  actionability and end; the D29 route SHALL own only coordinator intent; Phase
  6/17 SHALL own only occurrence, personal presentation, and engagement. No
  task, item, CMS record, or read state may become a write authority.”

### 11. Hidden coupling

**Material concern exists: Yes.**

- **What could go wrong:** D29 could silently depend on D21 membership, D25
  inviter identity, generic admin roles, CMS users, email delivery, or a shared
  task status. Changes elsewhere would unexpectedly reroute private work.
- **Why it matters:** Staff could not answer why they received an item, and
  future permission or CMS upgrades could alter responsibility.
- **Severity:** High.
- **Likelihood:** High if convenience defaults are introduced.
- **Evidence or reasoning:** D28 explicitly rejects permission, inviter, D21,
  admin, and legacy assignment as responsibility. ADR-0181 separates saved
  contact, invitation, grant, and Tenant membership.
- **Effect on answer:** Requires an independently versioned route kind and
  explicit adapters at every integration seam.
- **Best permanent fix:** Keep typed IDs, registry contracts, source/route
  fences, and forbidden-fallback tests; expose why-me evidence safely.
- **Exact decision/spec language:** “No change to D21 reviewers, D25 contacts or
  inviters, staff roles, CMS users, provider delivery, email state, or legacy
  task assignment SHALL mutate D29 coordinator membership or recipient
  selection except through a separately authorized D29 route command.”

### 12. Failure modes

**Material concern exists: Yes.**

- **What could go wrong:** Route save could succeed while item projection
  fails; source decline could commit before occurrence creation; lost responses
  could duplicate revisions; resolver outage could look like zero; repair could
  partially fan out.
- **Why it matters:** Staff could see stale coverage or miss required follow-up,
  while retries might create repeated unread items or privacy exposure.
- **Severity:** High.
- **Likelihood:** Medium in distributed projection and weak-network paths.
- **Evidence or reasoning:** D19/D28 require durable semantic replay and
  distinguish source truth from recoverable projections. D21 requires all-
  before-any route release and saved-vs-effect status.
- **Effect on answer:** Requires durable outbox/reconciliation, idempotent
  receipts, closed error states, source discoverability, and no partial release.
- **Best permanent fix:** Commit authoritative route/source facts first with
  durable effect intent; reconcile the same semantic identity; show truthful
  pending/failed projection separately; never invent a new episode.
- **Exact decision/spec language:** “Any failure after an authoritative route
  or source commit SHALL preserve that truth, expose a privacy-safe recoverable
  projection state, and replay the same semantic occurrence all-before-any.
  Failure SHALL NOT become proved zero, widen fallback, or create a new
  episode.”

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists: Yes.**

- **What could go wrong:** Route edits, qualification changes, D25 decline,
  expiry, D27 takeover, D28 next-lane choice, cancellation, or source completion
  could race and jointly create two current routes, revive old items, or commit
  conflicting lanes.
- **Why it matters:** A donor-facing public consequence may depend on the one
  reviewed candidate, and duplicated review-lane effects destroy auditability.
- **Severity:** Critical.
- **Likelihood:** Medium under ordinary multi-user activity and retries.
- **Evidence or reasoning:** ADR-0182 requires one source lane and current-fact
  CAS; D21/D22 require stable legs and differential handoff; D28 dedupes by
  semantic ended-lane episode rather than transport event.
- **Effect on answer:** Requires expected heads, semantic command IDs,
  immutable transitions, one source winner, prospective settings, and no item
  revival.
- **Best permanent fix:** Implement the closed lifecycle table, consistent lock
  order, complete delta, all-before-any release, and concurrency tests at the
  public command seam.
- **Exact decision/spec language:** “D29 route save and current handoff SHALL be
  semantically idempotent and expected-head fenced. Source completion,
  successor invitation, internal return, cancellation, route handoff, and
  reconciliation races SHALL converge on one current lane and no revived or
  duplicate item.”

### 14. Data integrity risks

**Material concern exists: Yes.**

- **What could go wrong:** Duplicate members, two current heads, stale cached
  rosters, orphan overrides, copied named people, missing reverse indexes,
  identity merges, or partial backfills could corrupt responsibility and audit.
- **Why it matters:** Incorrect recipients can expose private content, while
  missing recipients leave work hidden and reporting untrustworthy.
- **Severity:** High.
- **Likelihood:** Medium without relational constraints and reconciliation.
- **Evidence or reasoning:** D21/D22 define exact stable identities and route
  heads; D19/ADR-0027 define one occurrence/item identity; repository migration
  rules reject guessed ownership.
- **Effect on answer:** Requires normalized immutable membership, unique heads,
  stable digests, destination inheritance, reverse-impact indexes, and no
  guessed backfill.
- **Best permanent fix:** Constrain data shape, verify production queries,
  reconcile from source and route heads, and make import/clone/transfer start
  from explicit destination posture.
- **Exact decision/spec language:** “D29 SHALL preserve one current head per
  exact scope, one unique Party per revision, one routing occurrence per D28
  episode and leg, and one personal item per registered identity. Migration,
  clone, import, and transfer SHALL never infer or copy named coordinators.”

### 15. Security and privacy risks

**Material concern exists: Yes.**

- **What could go wrong:** Search results, roster names, decline reasons,
  external reviewer identity, candidate details, peer read state, support
  access, logs, exports, caches, or deep links could expose sensitive ministry
  information.
- **Why it matters:** Website candidates may contain protected location,
  missionary, member-care, or safety-sensitive facts even before public
  release. Roster and engagement surveillance can also harm staff privacy.
- **Severity:** Critical.
- **Likelihood:** Medium across the many read and diagnostic seams.
- **Evidence or reasoning:** D25 requires a minimized external projection; D28
  requires a privacy-safe compact item; platform boundaries require role-
  scoped surfaces; ADR-0027 forbids peer engagement exposure.
- **Effect on answer:** Requires purpose-specific projections, privacy-safe not
  found, data minimization, no sibling telemetry, controlled logs/exports, and
  retention/anonymization contracts.
- **Best permanent fix:** Minimize every surface, authorize roster and detail
  separately, scrub logs/traces, scope caches/realtime, preserve body-free audit,
  and test enumeration and deep-link attacks.
- **Exact decision/spec language:** “D29 compact presentation SHALL reveal no
  reviewer identity, exact terminal reason, candidate body, coordinator roster,
  peer engagement, protected location, donor, missionary, member-care, Giving,
  or financial data unless a separate purpose-specific authorization permits
  the exact field.”

### 16. Scalability and performance risks

**Material concern exists: Yes.**

- **What could go wrong:** Tenant directory search could download every staff
  member; Tenant route edits could synchronously scan all Sites and history;
  coverage summaries could run N+1 authorization checks; hot heads could lock
  too long.
- **Why it matters:** The flow must remain quick for many small Tenants and a
  large individual Tenant without weakening current authorization or blocking
  settings.
- **Severity:** Medium-High.
- **Likelihood:** Medium as Site and staff counts grow.
- **Evidence or reasoning:** D21/D22 require bounded server search, keyset
  pagination, asynchronous impact reconciliation, exact-at-limit semantics, and
  production query proof. D29's active roster is only three but candidate
  search and inherited impact are not.
- **Effect on answer:** Requires indexed scope-first queries, bounded search,
  asynchronous coverage/impact, short transactions, and explicit budgets.
- **Best permanent fix:** Load summary independently, debounce/cancel search,
  keyset paginate, compute privacy-safe aggregates in bounded batches, and
  verify p50/p95/p99 with production-shaped Tenant/Site sizes before Live.
- **Exact decision/spec language:** “D29 SHALL never download a full Tenant
  directory or synchronously rewrite inherited Sites/current episodes during
  ordinary save. Search, resolution, impact, and reconciliation SHALL be
  bounded, indexed, cancelable or chunked, and measured against registered
  release budgets.”

### 17. Operational burden

**Material concern exists: Yes.**

- **What could go wrong:** Every Site could require repeated setup; inactive
  people could need database cleanup; no-route episodes could demand developer
  repair; staff might maintain duplicate D21/D29 rosters manually.
- **Why it matters:** Small nonprofit teams cannot sustain tribal-knowledge
  administration or frequent support intervention.
- **Severity:** High.
- **Likelihood:** Medium-High without inheritance and self-service repair.
- **Evidence or reasoning:** D21 chose one Tenant default with rare Site
  override precisely to avoid per-Site work. D29 follows the same operating
  shape while deliberately keeping responsibility meanings separate.
- **Effect on answer:** Requires one-time setup, transparent inheritance,
  manager-visible health, guided last-member/no-route repair, durable replay,
  and no direct database procedure.
- **Best permanent fix:** Make ordinary setup one step, surface stale/inactive
  responsibility safely, automate idempotent projection repair, and retain
  explicit current-handoff tools.
- **Exact decision/spec language:** “A one-Site Tenant SHALL configure D29 once;
  ordinary Sites SHALL inherit by reference; authorized managers SHALL repair
  no-route, inactive-member, fallback, stale-save, and current-handoff states
  without direct database access or developer intervention.”

### 18. Observability and auditability gaps

**Material concern exists: Yes.**

- **What could go wrong:** Logs could show an item was sent without proving why;
  route changes could lack actor/fence evidence; technical traces could be
  mistaken for durable business history; privacy-safe staff history could be
  absent.
- **Why it matters:** Support cannot diagnose missing or improper attention,
  security cannot assess disclosure, and staff cannot understand a handoff.
- **Severity:** High.
- **Likelihood:** High if observability is added after implementation.
- **Evidence or reasoning:** ADR-0027 distinguishes technical telemetry,
  durable business history, security audit, and personal engagement. D21/D28
  require route/episode/resolver evidence and named monitors.
- **Effect on answer:** Requires append-only route and handoff receipts, body-
  free security evidence, correlation across source/route/occurrence/item, and
  privacy-filtered staff history.
- **Best permanent fix:** Define event schema, metrics, thresholds, owners,
  runbooks, trace correlation, audit retention, and repair evidence before Live.
- **Exact decision/spec language:** “Every D29 route revision, resolver result,
  fallback decision, occurrence release, item end, handoff, denied read/action,
  repair, and privileged-path use SHALL be attributable and correlatable without
  logging protected bodies, credentials, or unauthorized roster detail.”

### 19. Dependency and integration risks

**Material concern exists: Yes.**

- **What could go wrong:** Phase 12, Phase 6/17, Site management, D21/D22,
  D25–D28 sources, Payload, email/provider systems, or shared tasks could
  disagree on responsibility or lifecycle.
- **Why it matters:** Missing, duplicated, delayed, or contradictory external
  effects can produce wrong recipients or make secondary systems authoritative.
- **Severity:** High.
- **Likelihood:** Medium because D29 spans several accepted but not yet Live
  Phase 24 contracts.
- **Evidence or reasoning:** Repository ADRs assign separate owners and forbid
  CMS/provider state as operational authority. The D28 key is already Reserved
  pending this integration contract.
- **Effect on answer:** Requires versioned registries and adapters, explicit
  ownership, reconciliation, missing-event detection, and no provider/CMS/task
  dependency for source truth.
- **Best permanent fix:** Pin compatible route/resolver/message/source contract
  versions, add contract tests, use local durable outbox/evidence, and treat
  providers as delivery-only dependencies.
- **Exact decision/spec language:** “Core owns D29 route and occurrence truth;
  Phase 12 owns authorization; sources own D28; Phase 17 owns personal
  presentation. Payload, email, provider, plugin, CRM extension, and shared task
  state SHALL neither select recipients nor resolve the source episode.”

### 20. Migration, rollout, and upgrade risks

**Material concern exists: Yes.**

- **What could go wrong:** Backfill could guess coordinators, old code could
  misread new route modes, new code could require absent schema, a kill switch
  could orphan source work, or rollback could discard route/item history.
- **Why it matters:** Mixed versions can create a wider audience or duplicated
  items; guessed migration creates silent responsibility without Tenant intent.
- **Severity:** Critical.
- **Likelihood:** Medium during a cross-phase rollout.
- **Evidence or reasoning:** D19–D29 are docs-first and current runtime lacks
  their model. D21/D28 require Reserved keys, shadow/canary proof, and roll-
  forward repair rather than unsafe rollback after new data exists.
- **Effect on answer:** Keeps the decision accepted but key Reserved; requires
  additive schema, unconfigured backfill, compatibility matrix, shadow resolver,
  bounded cohort, kill switch, and durable history.
- **Best permanent fix:** Deploy read-compatible schema first, then registry and
  writers, shadow resolution without delivery, canary, opt-in cohort, and
  roll-forward repair. Feature-off stops new items but preserves source
  discoverability and data.
- **Exact decision/spec language:** “Migration SHALL initialize D29 as
  unconfigured and SHALL NOT infer members. No D29 key becomes Live until old-
  code/new-schema, new-code/old-schema, mixed-worker, feature-off, replay,
  canary, roll-forward, and post-write rollback constraints are proven.”

### 21. Testability, traceability, and proof

**Material concern exists: Yes.**

- **What could go wrong:** Tests could assert a button rendered while missing
  negative authorization, route-zero, fallback, concurrency, migration,
  accessibility, or user-comprehension outcomes. Artifacts could use conflicting
  terms or numbers.
- **Why it matters:** A plausible happy path cannot prove Tenant safety,
  durable invariants, or that staff understand responsibility versus access.
- **Severity:** High.
- **Likelihood:** High without a traceable acceptance matrix.
- **Evidence or reasoning:** The Grill standard requires falsifiable criteria
  from answer through glossary, ADR, OpenSpec, design, tasks, implementation,
  tests, tickets, and release evidence. D21/D22 already provide hostile and
  accessible proof patterns.
- **Effect on answer:** Requires the acceptance criteria below, exact glossary
  and ADR updates, registry manifests, negative tests, production-shaped load,
  and moderated comprehension evidence.
- **Best permanent fix:** Map every D29-R rule to OpenSpec scenarios, design
  invariants, implementation task, test ID, rollout evidence, and monitor. Gate
  contradictory labels, bounds, roles, states, and source meanings.
- **Exact decision/spec language:** “D29 SHALL remain Reserved until positive,
  negative, boundary, authorization, isolation, RLS, concurrency, idempotency,
  migration, accessibility, localization, weak-network, production-load, and
  comprehension proof traces to one consistent D29 contract.”

### 22. Other development hazards

**Material concern exists: Yes.**

- **What could go wrong:** Feature flags could stop presentation but leave an
  unsafe writer; support could bypass route controls; stale docs could imply
  Live behavior; the exact three-person cap could become dogma despite evidence;
  local styling could violate Base Maia.
- **Why it matters:** These hazards evade the main happy-path architecture and
  become long-lived maintenance or governance traps.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence or reasoning:** Current Phase 24 artifacts are docs-first and
  unmerged; packages/ui forbids visual forks; platform rules require role-
  scoped Mission Control behavior; the exact bound remains a product judgment.
- **Effect on answer:** Requires one complete feature fence, support-path parity,
  explicit Reserved/Live status, versioned bound, and design-system adherence.
- **Best permanent fix:** Fence producer, resolver, writer, and presentation
  together; audit support/repair; label docs accurately; monitor cap friction;
  build only with shared semantic Base Maia components.
- **Exact decision/spec language:** “D29 feature state SHALL fence every
  producer, resolver, write, read, repair, and presentation seam consistently.
  Reserved artifacts SHALL not claim runtime availability, support SHALL not
  bypass policy, and the v1 cardinality or UI system SHALL change only through
  an explicit versioned decision.”

## Acceptance criteria

### Decision, terminology, and ownership

1. **D29-AC001 — distinct meaning.** The D29 route selects external-review
   follow-up responsibility only and cannot select Website-review responsibility.
2. **D29-AC002 — distinct route kind.** D21 and D29 have different registered
   route-kind identities, revisions, recipient roles, and audit meanings.
3. **D29-AC003 — no roster alias.** Changing D21 members does not mutate D29
   members, and changing D29 members does not mutate D21 members.
4. **D29-AC004 — no initial copy.** Creating D29 from a Tenant with D21 members
   starts unconfigured and preselects nobody.
5. **D29-AC005 — no hidden inference.** Creator, inviter, Website reviewer,
   editor, prior actor, admin, manager, task assignee, support, AI, and service
   role receive no D29 responsibility solely from that fact.
6. **D29-AC006 — exact UI distinction.** The settings page visibly labels
   **Review notifications** and **External review follow-up** as separate
   cards.
7. **D29-AC007 — exact question.** The coordinator editor asks **Who chooses the
   next step?** and does not use **reviewer problems**.
8. **D29-AC008 — trigger explanation.** The helper names decline and invitation
   expiry as ordinary triggers and says selection grants no access or
   permission.
9. **D29-AC009 — source ownership.** D28 source state, not route or item state,
   controls actionability and end.
10. **D29-AC010 — not a task.** No D29 write creates or depends on a mutable
    task, assignee, queue, completion, due date, reminder, or comment thread.

### Route shape, bounds, and configuration

11. **D29-AC011 — Tenant head.** At most one current D29 Tenant policy head
    exists for one Tenant and environment and its mode is exactly unconfigured,
    configured members, or deliberate no item.
12. **D29-AC012 — Site head.** At most one current D29 Site policy head exists
    for one Tenant, environment, and Site.
13. **D29-AC013 — closed Site mode.** A Site is exactly inherited, Site members
    then Tenant fallback, Site members then no item, or deliberate Site no item;
    it cannot enter an ambiguous null/empty combination.
14. **D29-AC014 — closed fallback.** A Site member route saves exactly Tenant
    fallback or no follow-up item; a deliberate Site no-item mode has no member
    rows and is not an empty configured route.
15. **D29-AC015 — no chained fallback.** A Site override cannot point to another
    Site, group, role, task queue, or arbitrary rule.
16. **D29-AC016 — one person valid.** One unique active same-Tenant staff Party
    can form a configured route.
17. **D29-AC017 — two people valid.** Two unique active same-Tenant staff Parties
    can form a configured route and are equal.
18. **D29-AC018 — three people valid.** Three unique active same-Tenant staff
    Parties can form a configured route and the editor reports the maximum.
19. **D29-AC019 — fourth rejects.** A fourth Party causes atomic rejection and
    leaves the prior route head and members unchanged.
20. **D29-AC020 — duplicate rejects.** Adding the same stable Party twice says
    **Already selected** and creates no new revision or member.
21. **D29-AC021 — multiple grants dedupe.** Several assignments or grants for one
    Party still produce one route member.
22. **D29-AC022 — unordered membership.** Reordering rows creates no revision,
    audit event, handoff, or unread item.
23. **D29-AC023 — no priority controls.** No primary, backup, rank, star,
    rotation, quorum, or drag-order control exists.
24. **D29-AC024 — no bulk/group input.** No team, group, select-all, CSV, pasted
    list, role, or dynamic membership may be saved as a coordinator member.
25. **D29-AC025 — cap versioned.** A value above three requires a new route
    contract version and cannot be enabled by Tenant configuration.

### Picker, qualification, and settings UX

26. **D29-AC026 — purpose-scoped search.** Search returns only same-Tenant Active
    assignments the current route manager may enumerate.
27. **D29-AC027 — server pagination.** Search is server-filtered, cancelable,
    keyset-paginated, and does not download the full Tenant directory.
28. **D29-AC028 — safe disambiguation.** Duplicate names show only a separately
    authorized disambiguator; mutable display text never determines identity.
29. **D29-AC029 — qualification separate.** A result communicates responsibility
    selection separately from current ability to receive an item.
30. **D29-AC030 — unqualified warning.** Selecting a currently unqualified
    active person says that access is unchanged and does not promise delivery.
31. **D29-AC031 — responsibility may persist.** Temporary qualification loss
    does not delete the configured member or rewrite route history.
32. **D29-AC032 — inactive visible to manager.** A configured member who becomes
    inactive remains visible with safe repair guidance to an authorized manager.
33. **D29-AC033 — no inactive new selection.** An inactive, pending, deleted, or
    cross-Tenant person cannot be newly selected.
34. **D29-AC034 — Tenant coverage honest.** Tenant setup never claims a person
    can act for every Site; any aggregate is privacy-filtered and current.
35. **D29-AC035 — selected rows semantic.** Selected people render outside the
    listbox as semantic rows with separate exact-name remove buttons.
36. **D29-AC036 — maximum explained.** At three members, Add is unavailable and
    persistent copy explains how to add someone else.
37. **D29-AC037 — ordinary save one step.** A valid prospective edit saves with
    **Save coordinators** and no typed phrase or multi-step wizard.
38. **D29-AC038 — exact unsaved state.** Dirty close offers to discard; clean
    close returns focus to **Change coordinators**.
39. **D29-AC039 — no optimistic authority.** The card does not show Saved until
    the command receipt confirms the authoritative route head.
40. **D29-AC040 — unchanged no write.** Saving an identical member set and mode
    creates no new revision, handoff, or notification.

### Inheritance, fallback, first use, and removal

41. **D29-AC041 — inheritance by reference.** An inherited Site resolves the
    current Tenant D29 route and stores no copied member roster.
42. **D29-AC042 — effective source visible.** Authorized Site settings state
    whether follow-up uses the Tenant default or a Site override.
43. **D29-AC043 — privacy-safe inherited view.** A viewer without roster
    permission can distinguish configured, unconfigured, deliberate no-item,
    and indeterminate status without names.
44. **D29-AC044 — partial Site wins.** If one of several Site coordinators is
    currently qualified, only qualified Site members receive items and Tenant
    fallback does not join.
45. **D29-AC045 — proved zero fallback.** Tenant fallback is considered only
    after complete proof that zero Site members qualify.
46. **D29-AC046 — unknown no fallback.** Unknown, timeout, stale, partial,
    contradictory, corrupt, or over-limit Site proof releases nobody and does
    not invoke Tenant fallback.
47. **D29-AC047 — fallback posture honest.** An unconfigured Tenant fallback
    shows **Tenant fallback needs setup**; deliberate Tenant no-item says
    **Tenant follow-up is off**; configured-but-zero and indeterminate each use
    their own copy. Every case creates no guessed item.
48. **D29-AC048 — fallback copy exact.** Site UI says fallback runs only when no
    Site coordinator can act and cannot detect holidays or workload.
49. **D29-AC049 — route initially unset.** Migration and first use create no
    coordinator from existing roles, reviewers, inviters, or tasks.
50. **D29-AC050 — setup skippable.** External-review availability may recommend
    coordinator setup but cannot require a blocking setup wizard.
51. **D29-AC051 — D25 released-zero warning.** Before a D25 handoff with proved-
    zero D29 coverage, staff see that no follow-up item will be sent and source
    work remains discoverable.
52. **D29-AC052 — D25 remains available.** Unconfigured, deliberate no-item,
    released-zero, or absent D29 coverage never disables an otherwise
    authorized **Send invitation and hand off**.
53. **D29-AC053 — D29 unknown remains secondary.** D29 indeterminacy never
    blocks an independently successful D25/D26/source proof and never broadens
    recipients.
54. **D29-AC054 — setup action authorized.** **Set follow-up coordinators**
    appears only to an exact route manager and grants no D25 authority.
55. **D29-AC055 — no configured empty.** No command can persist a configured
    route with zero members.
56. **D29-AC056 — final Tenant removal explicit.** Removing the last Tenant
    member requires **Stop follow-up notifications** with Site/current-work
    impact and records deliberate no-item, not unconfigured or configured-empty.
57. **D29-AC057 — final Site removal explicit.** Removing the last Site member
    requires an explicit Tenant-inherit or no-item choice.
58. **D29-AC058 — no removal side effect.** Last-person removal does not change
    public Site, Giving, source state, permissions, or current items by itself.
59. **D29-AC059 — clone safe.** Site clone and template creation do not copy
    named D29 members; the destination inherits its Tenant route.
60. **D29-AC060 — transfer safe.** Cross-Tenant Site transfer carries no active
    D29 roster or private recipient state into the destination Tenant.

### Resolver, authorization, and personal items

61. **D29-AC061 — responsibility necessary.** Exact source authorization without
    D29 membership yields no D29 personal item.
62. **D29-AC062 — authorization necessary.** D29 membership without current
    candidate visibility and at least one lawful successor-lane action—a fresh
    external successor or internal return—yields no item.
63. **D29-AC063 — successor action sufficient; cancellation excluded.** A
    coordinator authorized for one lawful successor-lane action may receive the
    item even if another successor action remains hidden. A route member whose
    only current action is **Cancel planned change** receives no D29 item.
64. **D29-AC064 — action list current.** Every destination render and command
    re-proves and shows only currently lawful actions.
65. **D29-AC065 — all-before-any.** The resolver completes bounded route and
    authorization proof before releasing any personal item.

66. **D29-AC066 — closed resolver output.** Every resolution is released set,
    proved zero, or indeterminate; no fourth implied state exists.
67. **D29-AC067 — no partial proof release.** Any failing, stale, or over-limit
    proof prevents release of an incompletely evaluated set and never becomes
    fallback zero. A member completely proved unqualified is safely omitted;
    the remaining completely proved qualified members may release.
68. **D29-AC068 — fixed recipient role.** The registered D29 recipient role is
    server selected and cannot be supplied by the caller or inferred from a
    broad admin role.
69. **D29-AC069 — one semantic occurrence.** Duplicate decline, expiry, worker,
    refresh, or callback attempts for one D28 episode reuse one occurrence.
70. **D29-AC070 — one item identity.** One exact Tenant+Party+recipient-role+
    surface receives at most one active item for one D28 episode and leg.
71. **D29-AC071 — personal engagement.** One person's read/unread/open state
    changes no peer item or source fact.
72. **D29-AC072 — read not completion.** Opening or marking read leaves an
    actionable episode in Needs attention until source end or authority loss.
73. **D29-AC073 — no active archive.** Active D29 items cannot be dismissed,
    archived, snoozed, aged out, or task-completed through UI or API.
74. **D29-AC074 — access loss immediate.** Revocation between compile, list,
    open, detail, and action prevents protected presentation and effect.
75. **D29-AC075 — no old revival.** Later access or route membership never
    revives an old item or marks it unread again.

### Prospective changes and current differential handoff

76. **D29-AC076 — prospective default.** Ordinary route save changes only
    future D28 episodes.
77. **D29-AC077 — current work disclosed.** After save, authorized staff see the
    count of visible current follow-ups that retained their recipients.
78. **D29-AC078 — separate current action.** **Review current follow-up** is a
    separate action and is absent when no visible current episode exists.
79. **D29-AC079 — fresh impact preview.** Current handoff requires fresh server
    impact bound to route, source, episode, candidate, lane, and authorization
    fences.
80. **D29-AC080 — privacy-filtered impact.** Preview distinguishes newly
    notified, removed, unchanged, hidden, and unaffected without exposing
    unauthorized names.
81. **D29-AC081 — unchanged preserved.** An unchanged exact recipient keeps the
    same item and engagement and receives no new unread presentation.
82. **D29-AC082 — removed ends responsibility.** A responsibility-only removal
    leaves Needs attention without fabricated read or source completion and may
    retain authorized **Reassigned** history.
83. **D29-AC083 — access loss differs.** A removed person's independent access
    loss removes all protected presentation rather than showing Reassigned
    detail.
84. **D29-AC084 — newly admitted fresh.** Each newly selected and currently
    authorized recipient receives one successor item with fresh personal
    engagement.
85. **D29-AC085 — stale preview safe.** A stale handoff preview blocks only the
    handoff, preserves the completed prospective save, and offers a fresh
    privacy-filtered diff.
86. **D29-AC086 — contextual combined action.** A no-route repair may combine
    save and current notification only with exact effect copy and fresh fences.
87. **D29-AC087 — source-first race.** Source end before handoff creates no new
    active item and returns current truth.
88. **D29-AC088 — handoff-first race.** Handoff before source end may create a
    successor that immediately ends after source recheck without badge debt.
89. **D29-AC089 — concurrent managers.** Two route managers produce one CAS
    winner; the loser cannot overwrite or silently rebase.
90. **D29-AC090 — concurrent coordinators.** Two next-lane commands produce one
    source winner; the loser sees the chosen current path and no retry that
    would duplicate effect.

### Recipient and privacy experience

91. **D29-AC091 — compact item safe.** The item preview reveals only that an
    invited review ended, Site/locale safe identity, and unchanged public/Giving
    reassurance.
92. **D29-AC092 — why-me exact.** The destination can say the person is an
    external-review follow-up coordinator for the exact Site.
93. **D29-AC093 — no claim implication.** The destination says opening does not
    claim the work and one authorized person chooses the next path.
94. **D29-AC094 — peer count safe.** A recipient may see a privacy-safe sibling
    count only when the contract admits it; names require separate roster
    authorization.
95. **D29-AC095 — no peer engagement.** No recipient sees another person's
    delivery, unread, read, open, presence, availability, access failure, or
    interaction telemetry.
96. **D29-AC096 — protected detail separate.** External reviewer identity,
    contact, exact decline/expiry reason, feedback, and candidate body require
    independently authorized detail projection.
97. **D29-AC097 — current result.** When another actor chooses the next path,
    stale surfaces remove effect controls and show a privacy-safe completed
    result.
98. **D29-AC098 — privacy-safe deep link.** Known, unknown, ended, revoked,
    cross-Tenant, and unauthorized links resist enumeration and expose no body.
99. **D29-AC099 — unrelated surfaces absent.** Donor, public, missionary, and
    external-reviewer surfaces expose no coordinator setting, roster, item, or
    status.
100.  **D29-AC100 — zero unrelated effect.** Route, item, read, failure, or
      handoff changes no Page, Navigation, locale root, public Site, Giving,
      contribution, or financial truth.

### Database, RLS, privilege, and commands

101. **D29-AC101 — same-scope foreign relationships.** Every active head,
     revision, member, Site, Party, episode, and item relationship preserves
     exact Tenant and environment.
102. **D29-AC102 — immutable scope.** Tenant, environment, Site, route kind,
     member Party, actor, and revision identity cannot be updated across scope.
103. **D29-AC103 — unique heads.** Concurrent inserts cannot create two current
     heads for one exact route scope.
104. **D29-AC104 — unique members.** Database and command proof prevent duplicate
     Party membership in one revision.
105. **D29-AC105 — bound enforced below UI.** Direct API/RPC/database attempts
     cannot persist more than three members.
106. **D29-AC106 — browser writes revoked.** Authenticated and anonymous browser
     roles cannot directly mutate D29 base business tables.
107. **D29-AC107 — trusted actor and scope.** Caller-controlled Tenant, actor,
     role, capability, audit author, resolved recipient set, and qualification
     are ignored or rejected.
108. **D29-AC108 — USING and WITH CHECK.** Mutation tests prove both existing-row
     visibility and proposed-row admissibility for every operation.
109. **D29-AC109 — definer hardened.** Every security-definer helper has
     qualified objects, controlled search path, least privilege, revoked public
     execution, and positive/negative proof.
110. **D29-AC110 — privileged parity.** Owner, service role, worker, support,
     repair, migration, RPC, view, cache, realtime, and export paths pass the
     same cross-Tenant and purpose poison matrix.
111. **D29-AC111 — command idempotency.** Same command ID and same semantic
     meaning returns one receipt; changed meaning rejects.
112. **D29-AC112 — short transaction.** Route save writes revision, head, audit,
     receipt, and durable effect intent atomically without slow enumeration
     under locks.
113. **D29-AC113 — documented lock order.** Route/source/occurrence operations
     follow one proven lock order and pass deadlock/concurrency tests.
114. **D29-AC114 — production indexes.** Current route, members, reverse Party,
     inherited/fallback Sites, D28 dependency, receipt, reconciliation, and
     audit pagination use production-proved indexes.
115. **D29-AC115 — CMS boundary.** No Payload/CMS record, relationship, status,
     hook, role, or permission becomes D29 operational truth.

### Accessibility, localization, resilience, and performance

116. **D29-AC116 — shared design system.** All D29 UI uses shared @asym/ui Base
     Maia/Base UI primitives and semantic tokens with no app-local fork.
117. **D29-AC117 — combobox keyboard.** Search supports labelled focus,
     expansion, arrow navigation, Enter selection, Escape cancellation, and
     unchanged prior selection.
118. **D29-AC118 — listbox semantics.** Options contain no interactive child;
     selection and focus are programmatically distinct.
119. **D29-AC119 — remove focus.** Removing first, middle, or last selected
     person moves focus predictably and announces the new count once.
120. **D29-AC120 — radio semantics.** Inheritance and fallback choices have
     fieldset/legend and native or equivalent accessible radio behavior.
121. **D29-AC121 — focus and close.** Sheet/Dialog trap focus correctly, provide
     visible close/cancel, protect dirty work, and restore trigger focus.
122. **D29-AC122 — target/reflow.** Every decisive control meets the Core
     44-by-44 target and works at 320 CSS pixels and 400-percent zoom without
     two-dimensional scrolling.
123. **D29-AC123 — nonvisual status.** Qualification, configured, warning,
     maximum, zero, unknown, and error states never rely on color, avatar, icon,
     motion, or position alone.
124. **D29-AC124 — language robustness.** Long Unicode/CJK/combining/RTL names,
     bidi isolation, text spacing, and localized plurals preserve full names,
     status, and every decisive action.
125. **D29-AC125 — mobile keyboard.** Narrow-screen Sheet content and sticky
     actions remain reachable when the on-screen keyboard and safe-area inset
     are present.
126. **D29-AC126 — offline honest.** Offline edits remain local and explicitly
     unsaved; reconnect revalidates authorization and expected head before save.
127. **D29-AC127 — lost response reconciles.** A lost save/handoff response uses
     the command receipt and creates no duplicate revision or item.
128. **D29-AC128 — bounded search and impact.** Directory search, coverage,
     Tenant impact, and reconciliation are paginated or chunked and satisfy
     registered p50/p95/p99 and maximum-Tenant budgets before Live.
129. **D29-AC129 — comprehension proof.** Moderated representative staff can
     explain coordinator versus reviewer versus permission, inheritance,
     fallback, route zero, and prospective current-work behavior; no participant
     believes selection grants access or detects leave.
130. **D29-AC130 — release trace.** Every D29-R rule traces through glossary,
     ADR-0182, OpenSpec, registry, design, tasks, tickets, implementation, tests,
     migration, canary, monitors, and release evidence before the key becomes
     Live.

## Named monitors and mandatory response

These are explicit pilot/production guardrails, not evidence that the feature
is already Live. “Any” means one confirmed event.

| Signal                                                    |                                                                                                           Threshold | Owner                              | Required response                                                                                                                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------: | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| website_followup_route_granted_access_total               |                                                                                                                 any | Phase 12 Security                  | P0 fence D29 route mutation/use, revoke widened access, preserve evidence, assess disclosure, repair authorization boundary                                                                                  |
| website_followup_cross_tenant_visibility_total            |                                                                                                                 any | Security                           | incident response, fence reads/writes/resolver, assess affected Tenants, repair scope and hostile fixtures                                                                                                   |
| website_followup_noncoordinator_recipient_total           |                                                                                                                 any | Site IAM + Phase 17                | disable D29 resolver generation, end improper presentation without fabricated read, repair explicit-route intersection                                                                                       |
| website_followup_final_reviewer_alias_total               |                                                                       any D29 recipient selected solely through D21 | Site Product + Security            | fence key, remove aliased items, restore distinct route kind, audit disclosed candidates                                                                                                                     |
| website_followup_inviter_or_admin_fallback_total          |                                                                                                                 any | Site Product + Security            | disable faulty fallback, end improper items, restore explicit route proof, inspect stranded episodes                                                                                                         |
| website_followup_partial_release_total                    |                                                                                                                 any | Phase 17 + Site Platform           | stop generation, end partial presentation, fix all-before-any resolver, replay same occurrence after proof                                                                                                   |
| website_followup_hidden_fallback_total                    |                                                                                      any fallback not exactly saved | Site Product + Security            | fence fallback generation, remove guessed items, repair closed mode and audit                                                                                                                                |
| website_followup_unknown_as_zero_total                    |                                                                                                                 any | Site Platform                      | pause affected resolver generation, restore indeterminate state, fix timeout/error algebra, replay same identity                                                                                             |
| website_followup_ambiguous_empty_route_total              |                                                                                                                 any | Site API                           | block affected head, restore the prior head or one explicitly chosen admitted posture, repair constraints and UI without guessing unconfigured versus no item                                                |
| website_followup_duplicate_item_total                     |                                                                      any exact episode+Party+role+surface duplicate | Phase 17                           | fence key, dedupe without transferring engagement, repair semantic uniqueness and replay tests                                                                                                               |
| website_followup_unchanged_renotify_total                 |                                                                                                                 any | Site producer + Phase 17           | pause handoff, remove duplicate unread without fabricating read, repair delta computation                                                                                                                    |
| website_followup_handoff_missing_item_total               |                                                                any newly admitted recipient missing after 5 minutes | Site producer + Phase 17           | reconcile the same occurrence, inspect outbox/indexes, keep source discoverable, never create a new episode                                                                                                  |
| website_followup_source_projection_lag_seconds            |                                                           p99 above 300 seconds for 10 or more episodes in 24 hours | Site Platform                      | pause cohort growth, inspect outbox/workers/indexes, replay same semantic effects, publish staff-safe degraded status                                                                                        |
| website_followup_resolver_indeterminate_rate              |                                                               above 5 percent with at least 20 attempts in 24 hours | Site Platform + Phase 12           | inspect policy/authorization generation, timeouts, overflow, and indexes; pause cohort growth; never widen                                                                                                   |
| website_followup_active_without_recipient_age             |                                                                   any active D28 episode over 24 hours during pilot | Site Product                       | segment unconfigured, deliberate no-item, configured-zero, and indeterminate; inspect source discoverability and comprehension, improve guided repair without broadcast or overriding an explicit off choice |
| website_followup_fourth_person_attempt_rate               | above 2 percent of at least 100 coordinator edit sessions in 30 days, or 5 distinct Tenant support cases in 30 days | Site Product + UX Research         | interview affected staff; consider a versioned cap change only with new noise/privacy/load proof                                                                                                             |
| website_followup_setup_abandonment_rate                   |                                               above 20 percent of at least 50 first-time editor sessions in 30 days | Site Product + UX Research         | review recordings/feedback, test labels and editor friction, revise UX before expanding cohort                                                                                                               |
| website_followup_settings_save_error_rate                 |                                            above 1 percent of at least 100 non-validation save attempts in 24 hours | Site Platform                      | inspect CAS, permissions, latency, and lost responses; pause cohort growth and preserve drafts                                                                                                               |
| website_followup_settings_save_p95_ms                     |                                                                 above 2000 ms for at least 100 attempts in 24 hours | Site Platform                      | inspect query plan, lock time, and synchronous impact work; restore budget without caching authority                                                                                                         |
| website_followup_stale_overwrite_total                    |                                                                                                                 any | Site API                           | stop writes, restore current head/evidence, repair CAS and client conflict handling, assess lost route intent                                                                                                |
| website_followup_privacy_payload_violation_total          |        any reviewer identity, protected body, roster, peer engagement, or financial field outside authorized detail | Security + Privacy                 | incident response, fence template/projection, assess disclosure, remove cached/logged body where permitted                                                                                                   |
| website_followup_email_or_reminder_total                  |                                                 any D29-created email, push, SMS, due date, recurrence, or reminder | Site Product + Phase 17            | disable unintended channel/schedule, preserve in-product item, repair manifest and tests                                                                                                                     |
| website_followup_accessibility_serious_defect_total       |                                                    any serious or critical defect in supported setup/action journey | Accessibility owner + Site UX      | stop cohort expansion, repair shared component or composition, manually re-prove keyboard/screen-reader/mobile flow                                                                                          |
| website_followup_reserved_key_live_without_evidence_total |                                                                                                                 any | Release Engineering + Site Product | disable key immediately, preserve source discoverability/history, complete missing OpenSpec/test/migration/monitor evidence                                                                                  |

## Migration, rollout, upgrade, and rollback sequence

1. Reconcile D19–D29 terminology and route/item ownership in glossary,
   ADR-0182, OpenSpec requirements, design, and source contracts.
2. Register a distinct D29 route kind, recipient role, D28 source meaning,
   closed resolver result, and message-key manifest as Reserved.
3. Add compatible schema, constraints, indexes, RLS, grants, definer hardening,
   route commands, receipts, and body-free audit. Existing Tenants remain
   explicitly unconfigured.
4. Deploy readers that understand every closed route mode before enabling
   writers. Old readers must fail safely rather than interpret a new mode as
   inherited or empty.
5. Deploy protected prospective-save and impact-preview commands behind a
   feature fence. Prove old-code/new-schema, new-code/old-schema, and mixed-
   worker behavior.
6. Shadow-resolve production-shaped synthetic/internal episodes without
   creating personal items. Compare intended route, authorization
   intersection, zero/unknown, fallback, and recipient digest.
7. Enable route setup for synthetic/internal Tenants, then a bounded opt-in
   pilot. Keep D29 item generation separately fenced until source and Phase 17
   evidence passes.
8. Enable item generation for the pilot with all named monitors, purpose-
   limited support repair, and source discoverability already present.
9. Conduct moderated desktop/mobile/keyboard/screen-reader/low-bandwidth tests
   with actual nonprofit Website staff before broad rollout. The Hope example
   is not customer evidence.
10. Roll forward for data or projection repair. After route/occurrence/item
    records exist, code rollback is not assumed safe unless the compatibility
    matrix proves every new row remains correctly interpreted.
11. A kill switch stops new D29 item generation and current handoff while
    preserving route revisions, source episodes, personal history, and
    Languages discoverability. It never deletes evidence or restores old items.
12. A later cap, fallback, route-mode, or recipient-role change requires a
    versioned contract, explicit data transition, mixed-version proof, and new
    rollout evidence.

## Ruthless synthesis and ordered permanent path

### Must be resolved before recording D29

Resolved by the corrected decision in this report:

1. D29 is a distinct follow-up responsibility route, not D21 reviewer reuse.
2. **External review follow-up** replaces ambiguous **reviewer problems** copy.
3. The one-to-three roster is exact, unordered, equal, and independently
   authorization-filtered.
4. Tenant inheritance, Site override, explicit fallback, zero, and unknown use
   D21/D22's closed machinery.
5. D29 unconfigured, deliberate no-item, zero, or indeterminate posture never
   blocks D25 source authority.
6. Empty routes, last-person removal, prospective save, and current handoff
   have explicit, non-overloaded meanings.
7. The source owns work; notification items are not tasks or write authority.

### Requirements that must enter spec and design

1. D29-R1 through D29-R25 and D29-AC001 through D29-AC130.
2. Exact registry IDs and versions for route kind, recipient role, resolver,
   D28 occurrence, message key, end reasons, and audit events.
3. Closed Tenant/Site modes, fallback algebra, stable-leg rules, and one-to-
   three enforcement.
4. Purpose-specific route manager, roster read, source view, and D28 action
   capabilities.
5. Full Base Maia Card/Sheet/Dialog/combobox UX for every state in this report.
6. Conceptual relational shape, constraints, RLS, grants, service-path parity,
   commands, idempotency, lock order, outbox, and reconciliation.
7. Privacy, retention, anonymization, export, log, cache, realtime, support, and
   backup/restore behavior.
8. Additive migration, Reserved-to-Live gate, shadow/canary, kill switch,
   roll-forward strategy, and monitor runbooks.

### Implementation safeguards that are mandatory

1. No caller-selected recipients or browser business writes.
2. No shared-task, CMS, email, inviter, reviewer, or broad-role authority.
3. All-before-any resolution and proved-zero-only fallback.
4. Current authorization on list, open, detail, and action.
5. Expected-head CAS, semantic command receipts, and one source winner.
6. Differential current handoff with unchanged-engagement preservation.
7. Same-Tenant composite enforcement and privileged-path poison tests.
8. Shared Base Maia components, accessible semantics, privacy-filtered copy,
   and weak-network truth.
9. Unconfigured migration and no inferred roster.
10. Complete observability before pilot delivery.

### Risks eligible only for monitoring

- Whether some Tenants genuinely need more than three coordinators: use the
  fourth-person and support-case signal; never silently raise the cap.
- Whether first-time setup copy remains confusing: use abandonment plus
  moderated comprehension; never merge D21/D29 to make the page appear simpler.
- Whether an unconfigured or configured-zero episode remains unresolved too
  long: use the segmented 24-hour pilot signal; improve guided setup and source
  discovery, never override a deliberate no-item posture, and add neither broad
  fallback nor reminder email.
- Whether settings latency grows at large Tenant/Site scale: use the 2-second
  p95 and projection-lag signals; optimize queries and batching, never cache
  authority or weaken proof.

## Final disposition

**Accept with required amendments.**

The exact decision to record is:

> Core SHALL let a Tenant explicitly name one to three equal Website review
> coordinators for external-review follow-up, or deliberately choose no
> personal item in a posture distinct from never configured. Ordinary Sites
> inherit the Tenant posture; an authorized Site manager may save a distinct
> Site roster plus exactly one visible Tenant-fallback or no-item choice, or a
> deliberate Site no-item posture. D29 SHALL
> reuse D21/D22's versioned route, bounded resolver, personal-item, handoff, and
> audit engine through a distinct route kind and SHALL never copy, synchronize,
> infer, or fall back to Website reviewers, inviters, creators, admins, roles,
> groups, teams, tasks, support, or AI. Responsibility grants no access;
> event-time and action-time source authorization remains mandatory.
> Unconfigured, deliberate no-item, proved-zero, or indeterminate D29 coverage
> creates no guessed item and never
> blocks an independently authorized D25 handoff; source work remains
> discoverable in Languages. Ordinary saves are prospective; current D28
> episodes change only through an explicit, privacy-filtered, differential
> handoff. Reading never resolves work, and D29 creates no email, reminder,
> public, Giving, or financial effect.

## ADR and glossary disposition

### ADR-0182

Amend ADR-0182; do not create a new ADR. ADR-0182 already reserves the exact
D28 recovery-recipient boundary and owns the architectural tradeoff between one
current lane, deliberate recovery, personal attention, and source authority.
D29 completes that accepted decision rather than introducing a new
architectural alternative.

The amendment must replace the unresolved recipient paragraph with:

> D28 recovery recipients come only from the distinct D29 Website review
> follow-up route: one to three equal exact staff Parties at the Tenant default
> or an explicit Site override, resolved through D21/D22 machinery but never
> sharing or copying D21 membership. Current source authorization remains
> necessary. Unconfigured, deliberate no-item, proved-zero, partial, stale,
> over-limit, or indeterminate resolution releases no guessed person and never
> blocks source work. The D28
> item key remains Reserved until implementation evidence is complete.

### Glossary

Add this term:

> **Website review follow-up route** (Phase 24 D29): A private, versioned
> Tenant-default or explicit Site-override responsibility route naming one to
> three equal staff Parties who should receive personal attention when a
> candidate-scoped external Website review declines or expires without a
> decision. The route uses current authorization to select recipients, grants
> no access or action, never aliases the Website-review route, and never blocks
> source work when coverage is absent or indeterminate. Tenant/Site policy may
> be unconfigured, configured, or deliberately no-item; those postures are not
> interchangeable.
>
> _Avoid_: Website reviewer role; review coordinator permission; original-
> inviter owner; reviewer-problem team; admin fallback; shared task assignee;
> coordinator queue; notification group; Website-review roster alias.

## D30 — What feedback must accompany Request changes?

### Why this needs a founder decision

D25 already makes **Request changes** a source-owned terminal result for the
exact external review, and a changed successor candidate needs fresh review.
What remains unresolved is the minimum feedback required to make that result
useful. A bare result is fast but can return work with no clue what to fix. A
large structured form can burden a simple correction and accidentally create a
generic comments or quality-assurance product.

### Hope Ministries example

Eli reviews Hope Ministries' French (Canada) candidate and discovers that its
**Contact us** link still opens the English page. He selects **Request
changes**. Maria needs to know what to fix before creating the successor
candidate. What must Eli provide before the review ends?

### Option 1 — require one concise explanation; source anchor optional — recommended

The focused review surface asks **What needs to change?** and requires one
bounded private explanation tied to this exact candidate and result. Eli may
optionally anchor it to a source section visible in this review. It does not
require a category, checklist, assignee, due date, attachment, comment thread,
or suggested edit.

**Impact:** the smallest dependable amount of actionable context; low reviewer
friction; no generic comments product. The spec must still define safe length,
content classification, privacy, retention, display, translation, and what
staff receives next.

### Option 2 — allow Request changes with an optional note

Eli may submit the result with no explanation.

**Impact:** fastest possible reviewer path, but staff can receive a terminal
result with no actionable information, increasing rework and out-of-band
contact. Placeholder text cannot solve the missing invariant.

### Option 3 — require a source-specific structured checklist

Each source defines categories and required fields before Request changes can
submit.

**Impact:** potentially consistent reporting for mature repeatable programs,
but likely disproportionate for ordinary Website review. It freezes
speculative categories, increases translation and accessibility burden, and
risks a second workflow/form engine.

### Recommendation and exact question

**Recommend Option 1 — require one concise explanation, with an optional source
anchor.** It is the smallest permanent rule that makes **Request changes**
genuinely actionable without importing comments, tasks, checklists, or
assignments.

Do you choose **Option 1 — required concise explanation**, **Option 2 — optional
note**, or **Option 3 — structured checklist**? You may amend any option.

**Subsequent answer:** Option 1 was accepted with required amendments in D30:
one private 1–1,000-code-point plain-text explanation plus zero or one exact-
projection source anchor. Request changes remains terminal and creates no D28/
D29 follow-up episode; the next D31 question concerns correction attention.

## Primary evidence index

### Core repository

- [ADR-0027 — one notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0181 — source-authorized candidate-scoped external review](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [ADR-0182 — one current candidate-review responsibility lane](../../adr/0182-one-current-candidate-review-responsibility-lane.md)
- [D19 state-driven Plan attention](./phase-24-d19-state-driven-plan-attention-adversarial-review.md)
- [D21 explicit review-responsibility routing](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
- [D22 small co-responsible reviewers](./phase-24-d22-small-co-responsible-reviewers-adversarial-review.md)
- [D25 candidate-scoped external reviewer](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md)
- [D26 bounded Tenant external-review availability](./phase-24-d26-bounded-tenant-external-review-availability-adversarial-review.md)
- [D27 one visible review lane](./phase-24-d27-one-visible-review-lane-adversarial-review.md)
- [D28 explicit next-lane choice](./phase-24-d28-explicit-next-lane-choice-adversarial-review.md)
- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
- [Shared UI Base Maia contract](../../../packages/ui/AGENTS.md)

### Current official external sources

- [GitHub team review settings](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team)
- [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Atlassian service responsibilities](https://support.atlassian.com/jira-service-management-cloud/docs/create-a-service/)
- [Atlassian approval setup](https://support.atlassian.com/jira-service-management-cloud/docs/set-up-approvals/)
- [Blackbaud Grantmaking Reviews](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reviews.html)
- [Salesforce Flow Approval Processes](https://help.salesforce.com/s/articleView?id=platform.automate_automated_approvals_build_create_step_to_interact_with_reviewers.htm&language=en_US&type=5)
- [Contentful Entry Tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [W3C ARIA listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- [W3C ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## Subsequent D31 Tasks Hub reconciliation

D29 Review coordinators remain a bounded decline/expiry next-lane route. They
are not a default correction recipient, task triage queue, or permission group.
D31/ADR-0183 routes correction work only through the consequence-owning
source's typed responsibility and current authorization contract. A proved-zero
or indeterminate correction route guesses no coordinator, and the future Tasks
Hub does not broaden D29's purpose.
