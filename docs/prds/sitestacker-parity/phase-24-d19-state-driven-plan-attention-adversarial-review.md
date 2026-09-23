# Phase 24 D19 — State-Driven Plan Attention Adversarial UX Review

> **Subsequent D29 reconciliation (2026-08-28):** D29 now accepts one distinct
> **Website review follow-up route** with one to three explicit Review
> coordinators, current authorization intersection, and no D21/inviter/admin/
> capability inference. Any statement below that calls D29 “next,” “pending,”
> or “unresolved” records the earlier dependency state and is superseded by the
> [D29 adversarial review](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md).

> **Status:** Completed `/grill-with-docs` decision evidence for D19. This is
> not a Phase 24 PRD, OpenSpec change, implementation plan, schema, migration,
> issue specification, or runtime authorization.
>
> **Founder choice:** Create one deduplicated, state-driven in-product **Needs
> attention** experience only for currently authorized people who can perform
> the next action. Reading clears unread; the item remains actionable until the
> source condition ends. No recurring reminder or email by default.
>
> **Review date:** 2026-08-27

## Final disposition

**Accept with required amendments.**

The product direction is right: a real state change should quietly bring
qualified staff back to work without inventing a deadline, sending nagging
mail, or making the website change. The informal phrase **one item**, however,
would violate Core's accepted notification model if implemented as one shared
Tenant row.

The permanent corrected decision is:

> One code-owned, producer-proved actionable episode creates one immutable,
> semantically idempotent Phase 6 occurrence. The canonical Phase 6/17 compiler
> resolves the complete bounded recipient set and creates one independently
> engaged in-product notification item for each exact Tenant+Party+role+surface
> recipient. Thus each qualified staff member experiences one item; Core never
> shares one row or read state among people.
>
> The Site locale-policy/readiness producer alone decides whether an Active
> Default Site Locale Plan entered a registered actionable episode. Refresh,
> retry, polling, cache recovery, elapsed time, Plan age, task state, and source
> revisions that do not change the registered action create no occurrence. A
> later genuine recurrence creates a new occurrence; it never revives the old
> one.
>
> Every recipient must currently be able both to see the exact private Plan
> context and to perform the displayed typed next action. Creator, editor,
> assignee, nominal staff/admin status, support access, prior authority, or an
> existing notification row never qualifies by itself. Resolution is all-or-
> none and bounded. A proved zero-recipient result creates no guessed item; an
> indeterminate, partial, or over-limit result fails closed and is reconciled.
>
> Each item uses
> `presentation.source_actionable_then_recent_90d@1`, code-owned **Attention**
> presentation, a key-specific source-applicability/end rule, a minimal
> privacy-safe preview, and a server-resolved typed destination. Deliberately
> opening the item or explicitly marking it read changes only that recipient's
> engagement. Merely listing, prefetching, rendering, receiving realtime
> invalidation, or another recipient reading does not.
>
> While the exact source predicate and recipient authority remain current, the
> read item stays in **Needs attention** and **All**; archive/dismiss is omitted
> and rejected. When the source condition ends, active presentation ends once,
> any unseen item creates no unread debt or fabricated read, and authorized
> non-unread history follows ADR-0027's fixed 90-day ceiling. Access loss removes
> active and recent presentation immediately. Later authority never transfers
> or revives old engagement and needs a new producer-authorized occurrence if a
> later decision admits that handoff behavior.
>
> D19 creates no task, due date, recurrence, email, digest, push, SMS, sound,
> provider work, age-based urgency, automatic activation, public invalidation,
> Page/Giving mutation, currency, Legal Entity, Stripe, settlement, bank,
> receipt, ledger, or accounting effect. **By default** is not a dormant switch:
> any added channel/reminder requires a separately accepted contract.
>
> D19 depends on the canonical Phase 17 item/group/engagement runtime and a
> separately admitted Site-specific Live contract. It does not reuse or dual-
> write the current `notification_queue`, `mission_control_attention_items`,
> contribution notification ledger, or static demo dropdown. Rollout is future-
> only and creates no historical unread backfill.

### Plain-language result

```text
Notifications · 1 unread

Needs attention · 1 active

Unread
hope.org · French (Canada)
Ready to review

French (Canada) became ready for final review.
This Plan does not change the website automatically.

[Review planned change]

Reading this does not complete the work.
It stays in Needs attention until this review is no longer required.
```

After Maria deliberately opens it, **Unread** and her bell count clear. The
row remains under **Needs attention · 1 active**. Opening the row only navigates
to the current review; it never makes French the default.

## Evidence labels

- **Verified repository fact** — observed in current source, an accepted ADR,
  the active OpenSpec contract, or the D6–D18 decision chain.
- **Proposed repository fact** — defined in forward Phase 17/24 material but not
  yet present in current runtime.
- **Verified external fact** — supported by current first-party product or
  standards documentation.
- **Product judgment** — Core's proportional choice after reconciling repository
  authority, external evidence, and staff experience.
- **Assumption** — plausible but not proved with representative Core staff.
- **Unresolved founder decision** — product meaning that evidence cannot choose
  and must remain closed until the next grill answer.

## The decisive architecture clarification

External products often call a shared condition “one notification.” Core's
governing vocabulary is more precise:

```text
one actionable source episode
          ↓
one Phase 6 producer occurrence
          ↓ complete bounded resolver
one recipient-specific item per exact Party + role
          ↓
one recipient-specific engagement record
```

This explicitly resolves the apparent conflict between external deduplication
patterns and [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md).
PagerDuty and Android support stable condition/notification identities; GitHub
supports separating read from work state. Those are useful analogies. They do
not override Core's requirement that an **In-product notification item** is
recipient- and role-specific. One shared item would let Maria's read affect
Joel, mix role histories, and make access revocation unsafe.

## Jobs to be done

### Qualified staff member

“Tell me once when this Plan genuinely needs an action I can perform, explain
what remains live, and take me directly to the safe review without nagging me.”

### Other staff member

“Do not reveal a Plan, Site, language, count, or timing clue when I cannot see
and perform the action.”

### Planner and source owner

“Keep the Plan and source-owned work discoverable without treating the
notification, read state, or task state as readiness or completion.”

### Visitor and donor

“A staff notification must never change my public website, explicit Page or
Giving URL, donor flow, currency, or financial identity.”

### Developer and operator

“Make retries, recipient fan-out, permission changes, source resolution,
outages, and recovery deterministic without a second inbox/task framework.”

## Corrected D19 decision — normative language

### D19-R1 — Source truth alone opens an actionable episode

The Site locale-policy/readiness producer owns whether one exact Active Default
Site Locale Plan entered a registered actionable episode. Phase 17 presents
that occurrence; it does not infer one.

Every admitted meaning MUST declare a closed source event, source fence,
actionable predicate, next-action code, recipient resolver, fact allowlist,
typed destination, source-end rule, and proof pack. Plan age, `created_at`,
`updated_at`, audit time, task state, Page visits, polling, cache refresh, or a
generic “something changed” event cannot open an episode.

The exact initial trigger registry is now closed by D20 to three separate
review-required meanings. No catch-all `plan_actionable` key or Live Site Plan
notification is authorized until D20's complete proof gates pass, D21 and
D22's closed responsibility-route contracts are carried forward, and D23's
self-review boundary closes.

### D19-R2 — One source episode has immutable routing occurrences and one active item per recipient

One meaningful source episode produces one initial Phase 6 routing occurrence
for its first complete recipient generation. D21 permits zero or more
producer-authorized successor routing occurrences inside that same source
episode when responsibility is explicitly handed off or every selected
recipient is proved lost. Each occurrence remains immutable and all-before-any;
no released header receives appended children.

The canonical compiler creates one item per exact recipient
Party+role+surface selected by each admitted generation, while the complete
routing lineage enforces at most one active item for the same source episode,
meaning, Party, role, and surface. Two selected people receive two sibling
items with independent engagement. One person qualifying through several
grants receives one item for that recipient role. An unchanged recipient keeps
the existing item and engagement across a route-version change and receives no
new unread pulse.

No shared Tenant-global item, recipient array on a Site row, copied inbox card,
or group-level read flag may stand in for recipient items. An attention group
is only one recipient's triage projection and cannot combine people, roles,
Tenants, privacy classes, incompatible actions, or source episodes.

### D19-R3 — The canonical Phase 6/17 path is the sole writer

D19 MUST use the Phase 17 executable contract registry, Phase 6 bounded plan-
occurrence compiler, recipient-specific communication intent/event, Phase 17
item/group/engagement projection, and body-free audit.

D19 creates no Site-specific notification table, generic task, workflow,
outcome ledger, email record, provider job, client-owned item, or second
communication history. `prepared.none@1` applies to in-product delivery; an
in-product child cannot reference provider preparation/submission state.

### D19-R4 — Recipient resolution is current, exact, bounded, and atomic

The generated resolver returns only exact active Tenant members whose current
environment/Site membership, Party binding, role/subrole, capability epoch,
Plan/source visibility, privacy scope, and complete action-capability
conjunction permit the displayed destination action.

The resolver never accepts caller recipient IDs and never defaults to Plan
creator, prior editor/reviewer, task assignee, all staff, all admins, a guessed
queue, support impersonation, service role, platform super-admin, AI identity,
or whoever last touched the Plan.

Resolution uses Phase 17's inherited `bounded_staff_role_fanout@1` ceiling of
50 staff recipients and the plan compiler's initial 200-member global ceiling.
These are execution-safety bounds pending M0 load proof, not product targets.
Exactly-at-limit may commit; limit-plus-one creates no partial children and
raises a repair-visible boundedness result. Raising a bound requires measured
proof and a manifest-generation change, not Tenant configuration.

### D19-R5 — Occurrence identity deduplicates meaning, not timestamps

The server derives one PII-free occurrence token from the stable producer
namespace, exact Tenant/environment, stable Plan lineage, registered actionable
meaning, and producer-owned monotonic episode identity. Current Plan/source/
authorization revisions are comparison fences and recipient-resolution proof;
they do not partition uniqueness merely because they changed.

An exact retry returns the original complete released occurrence. Reusing the
same routing slot with changed Plan, Site, meaning, source fence, action,
contract, facts, or recipient membership hard-conflicts. A D21-admitted
responsibility handoff derives a new monotonic successor-routing slot beneath
the same source episode, records the complete current resolution and
continued/removed/new mapping, and creates children only for the complete newly
admitted set. It never repurposes the occupied slot, appends children, or
re-notifies continued recipients.

Leaving an actionable condition and later genuinely re-entering it produces a
new source episode with a new initial routing occurrence and items; old items,
groups, and engagement are never reopened, extended, or mutated into the new
episode.

### D19-R6 — Availability and authorization are re-proved everywhere

Recipient selection at occurrence time is necessary but never sufficient for
continued presentation. Every badge count, list, search, detail, render,
pagination cursor, cache read, engagement mutation, realtime recovery, support
view, destination click, and destination action re-proves current validated
session, active Tenant, Party, exact role/relationship, capability and
authorization revisions, Site/target/source visibility, source applicability,
and privacy restrictions.

There is no global feed or cross-Tenant badge. UI hiding, item possession,
opaque IDs, prior delivery, cached recipients, task assignment, or service-role
access grants nothing.

### D19-R7 — Engagement is personal presentation state only

Only deliberate item opening or an explicit **Mark as read** command records
read for that exact item+viewer Party+role. Feed rendering, list fetch,
prefetch, viewport intersection, client hydration, background refresh, realtime
invalidation, source resolution, email activity, or another recipient's action
cannot fabricate seen/read.

Read clears that recipient's unread group/bell contribution only. Mark unread
changes only permitted personal engagement. Seen/read/unread/archive/restore
can never activate, approve, cancel, replace, resolve, reprioritize, or mutate
the Plan, source work, task, default head, public Site, or another recipient's
engagement.

### D19-R8 — Actionable presentation persists until the source ends

Every admitted D19 item uses
`presentation.source_actionable_then_recent_90d@1`. While the exact source rule
remains actionable and access holds, the item appears in **Needs attention**
and **All** regardless of read state. The archive/dismiss control is omitted,
not merely disabled, and the API rejects an attempted active archive with the
contract explanation.

The key-specific producer rule once-sets `presentation_ended_at` when the Plan
or action becomes terminal, superseded, stale, no longer applicable, or
otherwise exits the exact predicate. The item immediately leaves active
attention. If unseen, it creates no unread debt and no fabricated read. While
the same recipient remains authorized, non-unread recent presentation lasts
exactly 90 days from that end instant; query-time policy hides it at the ceiling
even if purge is late. Engagement, grouping, retry, settings, time-zone display,
or worker delay cannot extend it.

### D19-R9 — Access loss removes; later access never revives

Tenant switch, membership/role/capability revocation, restricted-person change,
Party merge/relink, account claim, anonymization, Site transfer, or source-
visibility loss removes active and recent presentation immediately without
rewriting source/audit history or transferring engagement.

Restoring or newly granting authority never makes an old item visible and never
inherits someone else's read state. A new recipient-routing occurrence is
required if a later founder decision and code-owned source contract admit a
handoff while the business condition is still actionable.

### D19-R10 — Zero recipients is valid; uncertainty is not zero

A complete proved zero-recipient resolution creates a released zero-member
occurrence and no visible item. It never broadens access or guesses an owner.
The Plan remains persistently discoverable in **Site → Languages** and the
later authorized Sites filter for actors who may see those surfaces.

Resolver outage, partial enumeration, authorization ambiguity, membership race,
or bound overflow is not zero. It creates no partially visible fan-out, keeps
source truth unchanged, records a privacy-safe repair condition, and retries or
reconciles the same semantic occurrence. It never falls back to email, all
staff, support, or a legacy queue.

### D19-R11 — “No recurring reminder or email” is structural

The D19 contract contains only the required `in_product` step. It declares no
email, SMS, push, digest, browser/OS notification, recurring reminder, task
reminder, due date, escalation, snooze, subscription, sound, vibration, provider
preparation, or age-derived severity.

The item uses code-owned **Attention** because a useful action exists. This is
presentation vocabulary, not Plan priority or urgency. **By default** does not
authorize a hidden toggle, optional sibling step, dormant provider path, or
Tenant preference. Any later channel/reminder requires a separately accepted
stable contract and proof.

### D19-R12 — The destination navigates; it never performs activation

Every item stores one code-owned destination code such as
`site_default_locale_plan.open_review@1`, never a caller-provided or persisted
arbitrary URL. The server resolves Site/Plan/locale context after current
authorization and source reproof.

Opening **Review planned change** navigates to the current private review with
preserved return context. It performs no GET/HEAD mutation and cannot make a
default change from the notification card. D16 activation remains a separate
explicit POST that freshly compiles the candidate and revalidates actor, Plan,
source, Site, safety, current default head, and dependency digest.

### D19-R13 — Preview facts are minimal, safe, and immutable

The closed fact adapter may provide only safe Site display context, stable
target/current locale labels, a closed actionable state/reason, a truthful
unchanged-public consequence, the permitted next-action label, validated Site/
locale identity, and the contract explanation.

It excludes draft/page body, hidden Page/Navigation/blocker titles, comments,
owner identities, private URLs/query/token values, raw IDs, sensitive ministry
or missionary location, member-care data, Giving state, amount, currency,
Legal Entity, Stripe, settlement, bank, donor, receipt, ledger, accounting, raw
provider errors, secrets, and arbitrary metadata. Logs/metrics/realtime contain
opaque identifiers and reason codes only, never preview content or recipient
PII.

### D19-R14 — The calm staff UI distinguishes unread from active

D19 uses the canonical active-Tenant staff bell and notification center with
**Needs attention** and **All**. It creates no Site-specific inbox, dashboard,
project board, task list, or notification settings page.

The bell's accessible badge counts unread attention groups. The page separately
labels the number of active groups so **0 unread** cannot be mistaken for **0
work remaining**. Each row names the Site, target locale, exact state, unchanged
current default/serving consequence, **Nothing changes automatically**, one
primary navigation action, and why the row remains. It does not expose IDs,
permission names, event keys, dates, countdowns, red urgency, dismiss `X`, or
technical subsystem language.

Unread uses semantic text accessible to assistive technology plus visual style;
it never relies on a colored dot alone. Cross-kind ordering remains the
canonical Phase 17 product policy. D19 does not turn available/read time into
Plan urgency or silently prioritize by age.

### D19-R15 — Accessibility, mobile, and weak-network behavior are complete

The row/page uses ordinary semantic headings, links, status text, and buttons;
it is not a custom listbox or infinite ARIA feed. It passes WCAG 2.2 AA and
Core's keyboard, screen-reader, visible/unobscured focus, forced-color, reduced-
motion, non-color state, long/CJK/RTL, 320 CSS-pixel reflow, 400% zoom, and 44px
important mobile-control requirements.

Background arrival or source end may use one complete polite status message
without moving focus; frequent/assertive announcements, toast-only state,
sound, and focus theft are forbidden. If an open item ends, focus remains
stable and the surface says what changed and offers a safe current destination.
Loading, empty, error, authorization-loss, offline, and missed-realtime states
are complete. Offline/cached UI never exposes stale protected preview or an
action that claims current authority.

### D19-R16 — Source writes and notification projection fail independently

Authoritative Plan and source facts commit under their respective owners. The
readiness producer derives/proves an actionable episode; its occurrence is
coordination evidence, never readiness authority. The notification occurrence
is a durable, replayable downstream effect. Projection failure never rolls
back, corrupts, advances, or changes the Plan/default/public Site and never
triggers a fallback channel.

The occurrence header, complete canonical recipient/member set, child intents,
ordered digest, and release marker commit in one PostgreSQL transaction.
Nothing is claimable before release. A crash before commit exposes nothing; a
lost response replays the same result. A committed unreleased header is an
invariant alert with no force-release shortcut. Reconciliation uses the same
source/identity/fences and cannot fabricate a new episode to hide a failure.

### D19-R17 — Database, RLS, grants, and privileged paths preserve the model

D19 adds no Site-specific storage and uses the eventual canonical Phase 6/17
tables. Every relationship carries exact Tenant/environment scope through
composite keys/FKs; UUID uniqueness alone is insufficient. Occurrence slot,
item Party/role/surface, source occurrence/fence, contract/policy/end rule,
destination, immutable preview, and group boundary are structurally bound.

Item scope/recipient/role/source/policy/preview fields are immutable.
`presentation_ended_at` is nullable then once-set with a closed end reason and
nonextendable recent-history ceiling. Engagement binds exact item+viewer
Party+role and changes by idempotent CAS. Staff/Party deletion cannot cascade
away Site/communication audit or transfer engagement.

At most one source-active item may exist for the exact Tenant+environment+Plan
lineage+registered actionable meaning+recipient Party+role+surface grain. A
partial unique rule or equivalent transaction-enforced structural constraint
must close that grain while `presentation_ended_at IS NULL`; a genuinely later
episode is admitted only after the prior presentation ended.

`anon` receives no privileges. Prefer server-owned `packages/api` list/count/
search/read/unread/destination boundaries and no direct authenticated mutation
of item/group/event tables. If any browser projection/write is admitted,
operation-specific policies must correctly apply `USING` to existing rows and
`WITH CHECK` to new/resulting rows, keep identity/scope immutable, reject active
archive and client delete, and prevent an allowed update from moving a row into
forbidden scope.

Views exposed to clients are `security_invoker = true` or remain unexposed.
Any `SECURITY DEFINER` helper uses schema-qualified objects, `search_path = ''`,
revoked `PUBLIC` execution, least-privilege grants, indexed predicates, and
positive/negative pgTAP proof. Service role, owner, `BYPASSRLS`, worker, RPC,
Payload Local API, import, migration, support, impersonation, break-glass, AI,
Data API, and repair paths call or repeat the same trusted source/authorization
boundary and never accept caller scope/recipient/actor.

### D19-R18 — Current generic notification/task seams are forbidden shortcuts

Current `develop` does not implement the accepted Phase 17 model. D19 MUST NOT
reuse or dual-write:

- `notification_queue`, which is transport-shaped and has broad legacy staff
  write policies rather than recipient-role engagement;
- `mission_control_attention_items`, which is Tenant-level, dismissible/
  suppressible, lacks Party/role/source presentation, and has an age-capable
  urgency helper;
- `contribution_approval_notifications`, which is a domain-specific parallel
  notification ledger; or
- the static notification dropdown, which uses fixed demo counts/content and
  dismiss controls.

They may be inventoried in the Phase 17 cutover, but none becomes D19 truth,
fallback, migration authority, or read model.

### D19-R19 — Migration and rollout are future-only and one-writer

The Site-specific contract remains Reserved until the Phase 17 runtime, D17
Plan/readiness producer, exact Site capability atoms, resolver, fact adapter,
source-end rule, retention/audit entry, operations proof, and D20 trigger
registry exist.

Migration creates no unread item from historical Plans, locales, defaults,
readiness snapshots, tasks, notifications, email opens, audits, Page changes,
or inferred recipient engagement. Rollout lands schema/constraints/negative
readers and recipient shadow comparison before writers; enables one producer/
writer fence and Site cohort; disables any legacy writer before visibility; and
then expands only with proof. Old code ignores inactive new records. New code
without compatible schema/key fails closed. Rollback disables new occurrences,
preserves source truth and body-free evidence, and rolls forward terminal
presentation repair without deleting history.

### D19-R20 — Observability distinguishes business, security, and presentation

Durable source history records why the Plan became/ceased actionable. Phase 6
body-free audit records occurrence/contract/source/recipient-resolution
identity. Phase 17 engagement records what the exact viewer did. Technical logs
and traces record delivery/reconciliation health. None substitutes for another
or contains private preview/PII.

Zero-recipient, indeterminate resolver, bound overflow, partial/unreleased
occurrence, unauthorized access, source-end lag, badge drift, legacy writer,
external-channel effect, and duplicate item conditions have named signals,
owners, thresholds, and required responses below. Monitoring supplements
constraints and request-time authorization; it never makes an unsafe path
acceptable.

### D19-R21 — Notification state has zero public, source, Giving, or finance effect

Occurrence creation, item availability, group count, read/unread, access loss,
source end, recent-history expiry, purge, reconciliation, or notification
failure cannot mutate or invalidate:

- the Default Site Locale Plan or current Default Site Locale Version/head;
- Page, Navigation, publication, Public Site Generation, Site Root Entry,
  routes, host, search, sitemap, cache, analytics, or public content;
- source tasks, approval/review state, or permissions;
- explicit Page/Giving addresses, donor flows, QR codes, documents, or messages;
  or
- Giving, Designation, currency, Legal Entity, Tenant Stripe account,
  settlement, bank, receipt, tax, ledger, or accounting identity.

Only the separately authorized source command changes source truth. Only the
fresh explicit D16 command can change the default/root.

### D19-R22 — Traceability and trigger closure are release gates

The founder answer, D19 report, existing glossary, ADR-0027, Phase 17 manifest,
eventual Phase 24 PRD/OpenSpec/design/tasks/tickets/schema/API/UI/tests/release
evidence/runbooks/monitors must use the same occurrence/item/group/engagement/
source-status terms and exact numbers. No artifact may call one shared
condition row an **In-product notification item**, treat read as resolution, or
claim current runtime already implements Phase 17.

Every Live trigger needs its own stable meaning. Semantically different actions
must use separate stable keys unless a closed union proves one identical action,
recipient contract, safe fact schema, destination, source-end rule, and privacy
meaning. D20 now chooses exactly three separate review-required meanings rather
than hiding them behind a generic event.

## Complete staff journey

### 1. A real source transition happens quietly

The homepage approval and all other current D17 facts become favorable. The
Site locale-policy/readiness producer proves that the active French (Canada)
Plan entered an admitted review-action episode. It submits one occurrence.

Nothing public changes. No email, reminder, task, toast, sound, or countdown is
created. Refreshing the Languages page or repeating the event does not create a
second occurrence.

### 2. Only exact action-capable recipients receive items

The generated resolver evaluates current active-Tenant membership, Site and
Plan visibility, target/source privacy, role/subrole, capability epoch, and the
complete next-action capability. Maria and Joel are both currently qualified,
so one occurrence produces two sibling recipient-specific items. A view-only
staff member receives no row, badge, timing difference, or count clue.

If nobody qualifies, the compiler records a released zero-member occurrence,
creates no guessed item, and emits an operator-only safe signal. Qualified
staff can still rediscover the Plan through its source surface.

### 3. The bell is calm and exact

Maria's active-Tenant bell has an accessible label such as **Notifications, 1
unread**. It counts unread attention groups, not raw events or every child row.
It does not pulse, play sound, send email, or steal focus.

Opening the notification center shows:

```text
Needs attention · 1 active

Unread
hope.org · French (Canada)
Ready to review

French (Canada) became ready for final review.
This Plan does not change the website automatically.

[Review planned change]

Reading this does not complete the work.
It stays in Needs attention until this review is no longer required.
```

Site, locale, current public consequence, next action, and persistence are
clear without a technical event name, permission code, URL, timestamp, or
deadline.

### 4. Reading is not doing

Maria deliberately opens the item. Her **Unread** label and bell contribution
clear. The page still says **Needs attention · 1 active**, and the row remains
in both **Needs attention** and **All**. No dismiss or archive control appears.

Joel's sibling item remains independently unread. A background list fetch,
prefetch, or viewport exposure never marks either item read.

### 5. The action navigates to current truth

Maria selects **Review planned change**. The server reauthorizes her and re-
proves the Plan/source predicate, then opens the existing current review with a
clear return path. The card itself performs no activation.

The review repeats the current/default/after/unchanged impact, offers the
authenticated Preview, and requires the separate explicit D16 action before
the default could change.

### 6. A race ends safely

Joel completes the authoritative action first. When Maria's open screen
refreshes or she attempts the stale destination/action, the server rechecks
current source state and returns a privacy-safe current outcome. Her item leaves
**Needs attention** without focus theft; it cannot cause a duplicate default
change.

If the item ended before Maria ever opened it, it contributes no unread badge
debt and Core does not pretend she read it.

### 7. Permission changes never transfer engagement

Maria loses the exact Site-language capability. Her active and recent item
disappears immediately from list, count, cache, cursor, realtime recovery, and
destination access. Phase 6 audit remains minimized and body-free.

Granting that capability later does not revive Maria's old item. Giving Joel a
new capability also does not make Maria's or another role's item his. Whether
the producer should create a new handoff occurrence while the same source
episode remains actionable is a later founder decision.

### 8. Suspension and source regression stay truthful

A Site that becomes suspended cannot keep a **Ready to review** item active. The
source predicate ends it immediately and the destination offers no activation.
The Languages surface says the current default remains unchanged and the Site
is not currently public.

If D20 later admits a distinct zero-public-effect **Review changes** occurrence
while suspended, that key must prove its review action is permitted and its
copy must state the Site is suspended. It cannot reuse a Ready/activation
meaning.

### 9. Mobile, assistive technology, and weak networks retain the same meaning

At 320 CSS pixels, the content and one primary action stack in one reading
order. Important controls meet Core's 44px mobile target. Keyboard and screen-
reader users hear the same Site, state, consequence, active/unread distinction,
and stay-here explanation.

On a weak connection, the text-first list avoids loading rich Page content or
Preview assets. A failed detail/destination request preserves focus and says it
could not verify current access/state; it never exposes a cached private body
or invites activation against stale proof.

## Staff information architecture and copy contract

| Surface                     | Must show                                                                                                 | Must not imply                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| active-Tenant bell          | exact accessible unread-group count                                                                       | active-work count, global/cross-Tenant work, urgency                 |
| **Needs attention** heading | exact currently actionable group count for the current authorized viewer                                  | all Tenant work or every recipient's work                            |
| item row                    | Site, target locale, closed state, unchanged current serving/default consequence, one action, persistence | event ids, hidden blockers, dates, automatic activation              |
| read item                   | same active row without unread treatment                                                                  | completed, acknowledged, owned, approved, safe to archive            |
| stale/ended open item       | polite current-state explanation and safe return/current destination                                      | source mutation, fabricated read, retrying an obsolete action        |
| no-authority destination    | privacy-safe not-found/current-access result                                                              | whether a hidden Plan/item/Site exists                               |
| **All** recent history      | non-unread authorized item until the fixed policy ceiling                                                 | durable business/audit history or a user-controlled retention period |

Recommended ready-state copy:

```text
Ready to review
hope.org · French (Canada)

French (Canada) became ready for final review.
This Plan does not change the website automatically.

[Review planned change]

Reading this does not complete the work.
It stays in Needs attention until this review is no longer required.
```

The exact final stay-here sentence must match the D20 source-end predicate. It
cannot promise that merely opening review will remove the item if the source
still requires action.

## Source of truth and ownership map

| Fact                                 | Authoritative owner                                    | Derived consumer                             | Forbidden owner                                  |
| ------------------------------------ | ------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------ |
| Plan intent/lifecycle                | Site locale-policy planning owner                      | readiness, staff source surfaces             | notification, task, Page, public runtime         |
| Plan actionable predicate/episode    | Site locale-policy/readiness producer                  | Phase 6 occurrence adapter                   | bell, age, worker retry, engagement              |
| concrete recipient set at occurrence | generated code-owned recipient resolver                | Phase 6 complete member set                  | caller, item row, assignee, creator              |
| current permission to present/act    | current identity/access and source policy              | list/count/detail/click/action authorization | historical recipient set, cache, notification    |
| in-product availability              | Phase 6 local `available` communication event          | Phase 17 item projection                     | email/provider outcome, item read                |
| notification item                    | Phase 17 exact Tenant+Party+role+surface presentation  | recipient feed/group                         | shared Tenant condition, task, permission        |
| attention group                      | rebuildable recipient/source-episode triage projection | badge and **Needs attention**                | source truth, cross-recipient aggregate          |
| seen/read/unread/archive engagement  | exact recipient+role Phase 17 engagement               | that recipient's presentation                | Plan/readiness/source completion                 |
| source end                           | key-specific producer applicability/end rule           | once-set presentation end/recent history     | read/archive/time/cleanup worker                 |
| current default/root/public content  | D16 and source/public-generation owners                | visitor routing/public effects               | Plan notification or engagement                  |
| Giving and financial truth           | Giving/Designation/finance owners                      | donor/finance surfaces                       | Site/locale/notification                         |
| durable communication audit          | Phase 6 body-free append-only history                  | support/compliance under policy              | item preview, technical log, source business log |
| technical projection health          | Phase 6/17 operations telemetry                        | operators                                    | business truth or recipient-readable history     |

## Domain invariants and valid cardinality

1. One exact source actionable episode has exactly one permanent producer
   occurrence slot, including when its resolved member count is zero.
2. One occurrence has zero to the proved bounded number of canonical members;
   it is never silently truncated or chunked into peer occurrences.
3. One exact occurrence+recipient Party+role+surface produces at most one item.
4. One attention group belongs to one exact recipient role, privacy boundary,
   source episode, and compatible action meaning.
5. One recipient's engagement cannot read, archive, hide, transfer, or mutate
   another recipient's item/group.
6. Source actionability, communication availability, item presentation,
   engagement, and business completion are distinct facts.
7. Current authorization can only narrow presentation/action; item possession,
   recipient selection, preference, or Tenant configuration cannot grant it.
8. A complete zero-recipient result never broadens the audience. Resolver
   uncertainty never masquerades as zero.
9. Occurrence replay is permanent for one meaning; changed meaning under the
   same slot hard-conflicts.
10. A genuine later actionable episode uses a new occurrence; old presentation
    and engagement never revive.
11. `presentation_ended_at` is set at most once from trusted producer state and
    cannot move later or be cleared.
12. Source resolution before first view creates no unread debt and no fabricated
    read.
13. Access loss removes active and recent presentation immediately, regardless
    of the 90-day user-facing history policy.
14. Read clears unread only; active source work remains in **Needs attention**.
15. Active required work has no archive/dismiss path at UI, API, RLS, RPC,
    privileged, import, support, or repair boundaries.
16. No D19 state or event writes Plan, source, task, public, Giving, or finance
    truth.
17. The D19 contract is in-product-only and has no dormant external/reminder
    step.
18. Public readers and caches have no dependency on occurrence, item, group,
    engagement, or recipient-resolution state.
19. Every cross-record relationship proves exact Tenant/environment scope
    structurally; UUID coincidence is never enough.
20. The current generic notification/task stores are not canonical D19 readers,
    writers, fallbacks, or migration authorities.
21. Historical source data creates no unread item during migration.
22. Every Live trigger is an explicit stable semantic contract; an unregistered
    derived state produces no communication work.

## Lifecycle, temporal correctness, and race model

| Event/transition                         | Authoritative result                                                              | Notification result                                                                                                         |
| ---------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| registered predicate false → true        | producer records/proves new actionable episode                                    | one bounded initial routing occurrence; zero or one item per exact recipient role                                           |
| identical event/retry/rebuild            | no source change                                                                  | exact replay; no peer occurrence/item/unread pulse                                                                          |
| source revision, same actionable meaning | source owner commits a revision; readiness derives current meaning                | occupied occurrence retains original pins; append lineage observation/current reproof without recompiling or duplicating it |
| deliberate open or mark read             | no source change                                                                  | that recipient's unread clears; active item remains                                                                         |
| another recipient reads                  | no source change                                                                  | sibling engagement only                                                                                                     |
| source predicate true → false            | producer records current state/end                                                | once-set end; leave active; unseen creates no unread debt                                                                   |
| false → true later                       | new monotonic producer episode                                                    | new occurrence/items; old engagement stays old                                                                              |
| Plan Cancelled/Superseded/Activated      | D17/D16 terminal outcome                                                          | matching active presentation ends idempotently                                                                              |
| Satisfied elsewhere/No longer applicable | D17 source-proved terminal outcome                                                | matching active presentation ends idempotently                                                                              |
| Site serving/safety becomes unfavorable  | D17 readiness no longer favorable                                                 | Ready item ends immediately; no activation destination                                                                      |
| recipient access revoked                 | authorization revision changes                                                    | active+recent presentation disappears; audit remains                                                                        |
| recipient later regains/gains access     | authorization only                                                                | no old-item revival; new occurrence only if later contract admits handoff                                                   |
| route settings change, prospective only  | responsibility policy version changes; source episode unchanged                   | current recipient items unchanged; future source episodes use the new route                                                 |
| explicit current-review handoff          | responsibility resolution changes; source episode unchanged                       | continued recipients keep item/engagement; removed items end; new recipients use one immutable successor occurrence         |
| every selected recipient proved lost     | source remains actionable; declared fallback/current route resolves               | at most one successor routing occurrence; unknown never falls through or releases partial children                          |
| higher route recovers after fallback     | authorization only; current fallback leg remains healthy                          | no bounce-back, old-item revival, or new unread; next genuine source episode starts from current highest route              |
| complete resolver returns zero           | source remains actionable                                                         | released zero-member occurrence; no guessed item                                                                            |
| resolver partial/timeout/overflow        | source remains actionable                                                         | no partial release; repair/reconcile same occurrence                                                                        |
| source end races read                    | independent source and engagement facts serialize/CAS correctly                   | final active count/unread are zero; no fabricated engagement                                                                |
| two actors use destination/action        | source command expected heads/CAS choose one authoritative outcome                | stale actor receives current safe result; no duplicate business effect                                                      |
| 90 days after presentation end           | no source change                                                                  | query returns not presentable even if purge is late                                                                         |
| clocks/DST/time-zone/Plan age advance    | no lifecycle/readiness authority; D17 freshness may revoke cached favorable proof | no new occurrence, reminder, severity, expiry of active item, or source transition                                          |

## Current behavior, intended behavior, and permanent path

| Area                        | Current `develop` reality                                                                                                                                             | D19 intended behavior                       | Permanent path                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Phase 17 canonical runtime  | forward design/ADR/OpenSpec; canonical tables and staff feed are not implemented                                                                                      | one occurrence, recipient items, engagement | implement Phase 17 first or as an explicit dependency                              |
| legacy `notification_queue` | transport-shaped queue; checked-in schema/migration RLS posture conflicts (schema disables, later history enables broad staff CRUD), and deployed posture is unproved | never D19 truth                             | verify deployed state, inventory/cut over under Phase 17, and create no D19 writes |
| Mission Control attention   | Tenant-level mutable open/resolved/dismissed/suppressed rows; age-capable urgency helper                                                                              | not a notification item or engagement store | retain shared-task ownership only; do not adapt for D19                            |
| contribution notifications  | domain-specific approval notification seam                                                                                                                            | not D19 or general notification authority   | converge separately through Phase 17                                               |
| notification dropdown       | static demo content/count/avatar/dismiss UI                                                                                                                           | canonical authorized dynamic staff feed     | replace through Phase 17, not a Site-specific fork                                 |
| Plan/readiness runtime      | D17/D18 are decision evidence; no stable implemented Plan                                                                                                             | producer owns exact actionable episodes     | D15/D16 → D17/D18 → D19 dependency order                                           |
| recipient capability atoms  | future exact Site actions are not proved by broad `admin.dashboard.access`                                                                                            | generated exact resolver                    | define least-privilege Site/Plan action capabilities before Live                   |
| public/default behavior     | D16 remains the only intended explicit activation authority                                                                                                           | notification has zero public effect         | public dependency tests and separate fresh D16 POST                                |
| reminders/email             | unrelated task/message paths exist                                                                                                                                    | no D19 step or fallback                     | closed manifest rejects extra channels                                             |
| migration                   | no valid historical D19 occurrence or engagement history                                                                                                              | future-only                                 | one writer fence, shadow comparison, no unread replay                              |

## Full adversarial review by required category

Every category has a material concern if the founder answer remains informal.
None requires rejecting the direction. The amendments above convert a pleasant
idea into one exact, tenant-safe, role-safe, recoverable behavior.

### 1. Problem validity, necessity, and alternatives

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                   | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                                                                           | Effect on D19                                     | Permanent fix and exact language                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Core could build a notification because other tools have inboxes without proving the ministry job. The strongest no-build alternative is persistent **Site → Languages** plus the later Sites filter; it is simpler but can miss the moment another owner finishes work. |         Medium / High | **Repository fact:** D17 already requires persistent source discovery. **External fact:** Microsoft, Salesforce, Contentful, GitHub, and nonprofit CRMs centralize current action, but their task/reminder models differ. **Assumption:** no representative Core study measures missed handoffs. | Confirms state-driven attention, narrows its use. | **D19-R1, R14, R22:** admit only enumerated genuine review-action episodes; keep source discovery; no generic “all Plan changes” feed. |
| “One item” could freeze a storage detail instead of the user outcome. A shared row is simpler superficially but cannot support independent read/access.                                                                                                                  |       Critical / High | **Accepted ADR-0027:** an item is exact tenant+Party+role presentation. **Verified external fact:** Microsoft in-app notifications are recipient-specific; GitHub separates read from Done.                                                                                                      | Requires amendment, not rejection.                | **D19-R2:** one source occurrence, one recipient-role item per exact recipient; groups only reduce each recipient's noise.             |

### 2. Brittleness

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                             | Effect on D19                        | Permanent fix and exact language                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Capturing a recipient array once and trusting it later works only until staff leave, roles change, Sites become restricted, or the action changes. It can leak private intent or strand work. |       Critical / High | **ADR/OpenSpec fact:** current access must be re-proved; access loss removes active/recent presentation and later access cannot revive it. **External fact:** Contentful documents assigning tasks to users who lack entry access. | Strongly narrows recipient handling. | **D19-R4, R6, R9:** bounded current resolution plus request-time reproof; no assignment-as-authority or old-item revival. |
| Dedupe by Plan revision, readiness timestamp, or `updated_at` would emit storms; dedupe forever by Plan id/action would suppress a legitimate later episode.                                  |           High / High | **Repository fact:** Phase 17 occurrence slots are semantic and permanent; D17 treats revisions as fences. **External fact:** PagerDuty/Android use stable condition/notification identities for updates.                          | Requires explicit episode identity.  | **D19-R5:** stable lineage+meaning+monotonic producer episode; revisions fence, exit/re-entry creates a new occurrence.   |

### 3. Technical debt

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                             | Severity / likelihood | Evidence and reasoning                                                                                                                                  | Effect on D19                          | Permanent fix and exact language                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Reusing `notification_queue`, Mission Control attention, contribution notifications, or the demo dropdown would create several meanings for notification, mismatched retention, dismiss behavior, and duplicate migration forever. |       Critical / High | **Current source:** those seams have transport-, Tenant-, contribution-, or static-demo shapes. **Accepted ADR:** Phase 17 owns one notification model. | Rejects shortcut, not chosen behavior. | **D19-R3, R18–R19:** one Phase 6/17 writer; no dual writes, adapters-as-truth, or Site-specific inbox.                        |
| A generic notification rules engine, workflow DSL, reminder framework, or custom recipient-policy editor would solve speculative cases and become a second Phase 34/17 product.                                                    |           High / High | **Repository fact:** Phase 17 uses finite manifests/two presentation policies; Phase 34 owns general workflows.                                         | Bounds the architecture.               | **D19-R1, R11, R22:** finite code-owned events/resolvers/end rules; no Tenant-authored rule, timer, graph, or channel matrix. |

### 4. Edge cases

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                 | Severity / likelihood | Evidence and reasoning                                                                                                                                                                   | Effect on D19                  | Permanent fix and exact language                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zero, one, 50, or over-50 qualified staff; duplicate grants; two roles for one person; revoked/restored access; Party merge; source resolves before view; Site suspension; source regression; and a later recurrence all need different safe outcomes. |       Critical / High | **Phase 17 manifest:** staff fan-out bound 50/global 200 and zero-member occurrence are explicit. **ADR-0027:** access loss/no revival/no unread debt/new transition rules are explicit. | Adds complete lifecycle cases. | **D19-R2, R4–R10 and lifecycle table:** all-or-none bounded compile, per-role identity, immediate removal, no revival, new occurrence on recurrence. |
| The item may be open when another person acts, the Plan is cancelled, or the current default changes. A stale button could produce duplicate or wrong effects.                                                                                         |       Critical / High | **D17 fact:** source commands use expected revisions/CAS; notification engagement grants no action.                                                                                      | Requires navigation-only CTA.  | **D19-R6, R12, R16:** click reauthorizes/rechecks; activation is separate; stale state returns a safe current result.                                |

### 5. Footguns

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                          | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                    | Effect on D19                        | Permanent fix and exact language                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Dismiss, archive, snooze, Done, unsubscribe, mark-complete, or an `X` could hide required work while the source remains open. A direct “Make default” card button could turn accidental inbox interaction into a public change. |       Critical / High | **ADR/OpenSpec fact:** active source-actionable items omit archive and engagement never completes source. **External fact:** Salesforce alerts and GitHub notifications offer dismiss/Done features Core must not import. | Requires explicit negative controls. | **D19-R7–R8, R12, R14:** omit/reject archive; no manual completion; one navigation action; separate explicit D16 POST. |
| A badge reading `0` after Maria reads the item can look like no work remains; a colored unread dot alone is inaccessible.                                                                                                       |           High / High | **Phase 17 fact:** badge is unread groups while Needs attention contains all actionable groups. **W3C fact:** meaning cannot rely on color alone.                                                                         | Adds distinct labelled counts.       | **D19-R14–R15:** accessible unread badge plus separate active count and semantic unread text.                          |

### 6. Tenant safety

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                            | Severity / likelihood | Evidence and reasoning                                                                                                                           | Effect on D19                     | Permanent fix and exact language                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A global badge, cache key missing Tenant/role/source epochs, reused cursor, cross-Tenant realtime channel, or group signature could reveal that another ministry has a Plan or mix read state across Sites/roles. |       Critical / High | **ADR/OpenSpec fact:** no global feed; exact tenant+Party+role predicates on count/list/realtime; groups cannot cross boundaries.                | Makes isolation release-blocking. | **D19-R2, R6, R17:** active-Tenant queries, complete authorization partition, scoped groups/FKs, identifier-only realtime, hostile cursor/cache tests. |
| Support/service/AI paths may bypass browser RLS and accidentally enumerate or mutate recipients.                                                                                                                  |     Critical / Medium | **Repository fact:** service-role tables and Payload Local API can bypass ordinary browser policy; governing rules require same server boundary. | Extends proof beyond RLS.         | **D19-R17:** privileged poison matrix and trusted server-derived scope/actor/recipient, with no caller-controlled override.                            |

### 7. Database, RLS, and authorization safety

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                          | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                       | Effect on D19                       | Permanent fix and exact language                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One global UUID FK, nullable scope fields, client-writable tenant/Party/role, a permissive update, or cascade deletion could create cross-scope attachment, move a row into a forbidden state, transfer engagement, or erase business evidence. |       Critical / High | **Supabase/Postgres guidance:** use operation-correct RLS, constraints, indexed predicates, least privilege. **Phase 17 model:** tenant-only composite arcs, immutable item identity, idempotent engagement. | Requires structural schema proof.   | **D19-R17:** exact composite Tenant/environment keys/FKs, immutable identities, once-set end, no client delete/transfer, server-derived actor/scope.     |
| `SELECT` policy alone cannot protect insert/update results; a `SECURITY DEFINER` function or exposed view can bypass intended RLS. Legacy queue authenticated CRUD is too broad.                                                                |       Critical / High | **PostgreSQL fact:** `USING` and `WITH CHECK` govern different operation sides. **Current source:** legacy queue grants authenticated CRUD based on broad staff membership.                                  | Forbids legacy reuse/direct writes. | **D19-R17–R18:** server API; if direct paths exist, operation-specific `USING`+`WITH CHECK`, security-invoker views, hardened/revoked definer functions. |

### 8. Overengineering

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                       | Severity / likelihood | Evidence and reasoning                                                                                                      | Effect on D19                   | Permanent fix and exact language                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| A new Site notification service, responsibility graph, priority matrix, schedule, inbox preferences, mobile push, or notification composer would multiply concepts before one actual D19 consumer is proved. |           High / High | **Repository fact:** Phase 17 already owns the projection and finite manifest; D17/D18 reject a bespoke workflow/scheduler. | Narrows to existing contracts.  | **D19-R3, R11, R14, R18:** one manifest entry/family, one canonical feed, no new dashboard/channel/task/rules infrastructure. |
| Conversely, “compute everything live with no durable occurrence” seems smaller but loses idempotency, all-before-any fan-out, audit, source-end races, and independent engagement.                           |         High / Medium | **Phase 6/17 fact:** plan occurrence headers and recipient child intents are deliberate durable identities.                 | Rejects an underbuilt shortcut. | **D19-R3, R5, R16:** durable bounded occurrence/item/engagement with rebuildable groups, not ephemeral cards.                 |

### 9. UX/UI and user friction

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                  | Effect on D19                 | Permanent fix and exact language                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| A vague “Plan updated” row makes staff hunt, while technical event names, hidden blocker counts, too many CTAs, or a direct activation button increase confusion/risk. No current/default consequence makes staff fear that the Site changed. |           High / High | **D17/D18 fact:** consequence-led copy and one next action are required. **External facts:** Android recommends direct value/obvious action; Microsoft/Salesforce central action cards provide context. | Adds a complete simple card.  | **D19-R12–R15:** Site+locale+state+unchanged-public sentence+one navigation CTA+stay-here explanation; no technical/financial facts. |
| Notification noise, red urgency, sounds, toast loops, dates, mobile overflow, poor focus, chatty live regions, or rich-content loads harm field staff and accessibility.                                                                      |           High / High | **W3C facts:** polite status, no focus theft, no color-only state, 320px reflow, target minimums. **D18:** no time-driven urgency/reminders.                                                            | Makes calm UX a release gate. | **D19-R11, R14–R15:** text-first semantic list, no default interruption, mobile/keyboard/AT/low-bandwidth/offline proof.             |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                | Severity / likelihood | Evidence and reasoning                                                                                                                                                | Effect on D19                    | Permanent fix and exact language                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan readiness, notification availability, item, group, engagement, task, and source completion could all claim “actionable/resolved,” causing circular updates and historical drift. |       Critical / High | **ADR-0027:** notification is a projection, never source/task/completion truth. **D17:** readiness is derived and task/notification evidence does not grant/prove it. | Requires explicit ownership map. | **D19-R1–R3, R7–R8, R20–R21 and invariants:** producer owns predicate/end; Phase 6 owns availability/audit; Phase 17 owns presentation/engagement only. |
| A group or read model could become writable authority or a recipient list could become permission.                                                                                    |     Critical / Medium | **Phase 17 fact:** groups are rebuildable; current authorization reproof controls display/action.                                                                     | Narrows storage/mutation.        | **D19-R2, R6, R17:** groups/counts derived; recipient selection is historical availability, not ongoing permission.                                     |

### 11. Hidden coupling

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                          | Severity / likelihood | Evidence and reasoning                                                                                                                 | Effect on D19                      | Permanent fix and exact language                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| If Phase 17 queries D17 internals or D17 writes notification tables directly, source schema/permission changes can silently break inbox behavior and notification outages can block Plan truth. |           High / High | **Repository boundary:** producers submit typed projections; Phase 17 does not own source internals. **ADR-0029:** reference-not-copy. | Requires a narrow one-way adapter. | **D19-R1, R3, R16:** source-owned typed event/fence/facts/end adapter; downstream durable effect; no reverse source mutation. |
| Coupling D19 to Mission Control urgency, task completion, Vercel/Payload/provider state, or client cache would import unrelated lifecycle and time semantics.                                   |           High / High | **Current source:** Mission Control helper can derive age urgency. **D17/D18:** tasks/providers/time never prove Plan readiness.       | Explicitly forbids reuse.          | **D19-R1, R11, R18, R21:** no task/provider/cache authority or Plan-age effect.                                               |

### 12. Failure modes

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                | Severity / likelihood | Evidence and reasoning                                                                                                                                        | Effect on D19                   | Permanent fix and exact language                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Plan/source transition commits but occurrence fails; recipient resolver times out; only some children commit; response is lost; source ends before release; realtime is missed; purge is late. A fallback send or second submit could duplicate/leak. |       Critical / High | **Phase 6/17 fact:** bounded all-before-any release, exact replay, query ceilings, realtime invalidation, current source checks.                              | Adds fail-safe recovery.        | **D19-R10, R16, R19:** independent outbox/reconciliation, atomic full set, no partial/fallback, same identity retry, authorized cursor recovery. |
| Silent zero-recipient treatment during resolver failure would look safe but leave work stranded and hide IAM defects.                                                                                                                                 |         High / Medium | **Product judgment:** proved absence differs from unknown enumeration. **Phase 17:** zero-member occurrence is valid only after complete resolver evaluation. | Requires explicit result union. | **D19-R4, R10, R20:** `resolved_zero` vs indeterminate/partial/over-limit, operator signal, no guessed audience.                                 |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                                      | Effect on D19                          | Permanent fix and exact language                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate/out-of-order source events can create storms or reopen old items; read/source-end races can leave unread debt; two reviewers can both act; authorization can change during compile. |       Critical / High | **Repository fact:** semantic occurrence slots, expected revisions, CAS, source fences, once-set end, and atomic recipient compiler are governing patterns. | Requires complete transition model.    | **D19-R4–R10, R12, R16 and lifecycle table:** one winner, exact replay, hard conflict, current reproof, independent CAS engagement/end. |
| Treating 90-day recent history as a Plan expiry/reminder date or using local time/DST to end active work would reintroduce D18's rejected temporal authority.                                 |           High / High | **ADR-0027:** fixed presentation ceiling after source end; UTC comparison. **D18:** no Plan target/due/reminder/expiry or age-driven behavior.              | Narrows time use to presentation only. | **D19-R8, R11:** active item never expires from age; fixed post-end policy cannot affect source, order, severity, or reminders.         |

### 14. Data integrity risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                          | Effect on D19                    | Permanent fix and exact language                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate recipient items, mismatched groups, mutable source fences, extended end times, orphan engagement, partial child sets, or recipient-set drift can corrupt counts/history and make repairs ambiguous. |       Critical / High | **Phase 17 model:** permanent occurrence/item identity, complete ordered member digest, once-set end, rebuildable groups, exact engagement key. | Adds constraints/reconciliation. | **D19-R2, R5, R16–R17:** permanent uniqueness/composite FKs/immutability/all-before-any/rebuildable group and poison tests.         |
| Deleting a profile/Party or relinking identity could cascade notification history to the wrong person or erase evidence.                                                                                      |         High / Medium | **ADR-0027:** merge/relink/anonymization revoke without transferring history; audit remains separately governed.                                | Requires non-transfer semantics. | **D19-R9, R17:** no engagement transfer/cascade-as-meaning; immediate presentation removal and separately governed minimized audit. |

### 15. Security and privacy risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                             | Severity / likelihood | Evidence and reasoning                                                                                                                                                                         | Effect on D19                                 | Permanent fix and exact language                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Preview text, badge counts, timing, cursor shape, cache, logs, realtime, exports, or stale deep links can expose a private planned language, hidden content/owner, missionary location, or cross-Tenant existence. |       Critical / High | **D17/Phase 17 fact:** hidden resources add no count/title/role/timing signal; previews/logs are minimized; every destination reauthorizes.                                                    | Makes minimization/non-enumeration mandatory. | **D19-R6, R12–R13, R17:** closed fact allowlist, opaque IDs, identifier-only realtime, safe errors, no private cached offline content.   |
| Arbitrary URLs/action codes, caller recipient/scope/actor fields, XSS/bidi/control text, or privileged bypass can create phishing, cross-scope action, or unauthorized mutation.                                   |     Critical / Medium | **ADR/OpenSpec fact:** typed destination server resolution; trusted context; no arbitrary payload. **Security practice:** validate untrusted display text and harden definer/privileged paths. | Requires poison/hostile-input proof.          | **D19-R12–R13, R17:** reject caller URL/scope/recipient/action, validate closed safe labels, reauthorize action, privileged-path matrix. |

### 16. Scalability and performance risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                            | Effect on D19                   | Permanent fix and exact language                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All-staff fan-out, per-item source/RLS queries, unindexed unread counts, offset pagination, all-Tenant scans, or rich Page previews can degrade noisy/large Tenants and cause authorization timeouts. |           High / High | **Phase 17 manifest:** 50 staff/200 members, keyset pagination, grouping. **D17:** provisional 500ms p95 for eligible reads. **External W3C/product evidence:** text-first finite lists avoid custom feed burden. | Adds bounded measurable design. | **D19-R4, R13–R17:** inherited bounds, indexed recipient/group/source queries, batched authorization, keyset pagination, small previews, p50/p95/p99 proof. |
| Caching a filtered feed without full authorization identity may improve speed while leaking after role/source changes.                                                                                |     Critical / Medium | **D17 fact:** complete authorization partition or authorization-neutral facts filtered after read; every render reauthorizes.                                                                                     | Prevents unsafe optimization.   | **D19-R6, R17:** complete cache partition/epochs or no private filtered cache; revocation bypass/invalidation tests.                                        |

### 17. Operational burden

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                          | Severity / likelihood | Evidence and reasoning                                                                                                                                                     | Effect on D19                    | Permanent fix and exact language                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Staff/support may need manual SQL cleanup when recipients are missing, duplicates appear, projections lag, or a legacy writer produces peers. Guessing assignees or sending email “just in case” creates recurring tribal work. |           High / High | **Repository principle:** durable repair and explicit owner routes beat manual glue. **D17:** no guessed owner; partial routing remains visible/retryable.                 | Requires self-diagnosing repair. | **D19-R10, R16, R18–R20:** safe operational states, same-identity reconciliation, named monitors/runbooks, no SQL/fallback audience. |
| Adding snooze/reminder/preferences creates policy/support matrices ministries must maintain without evidence.                                                                                                                   |         Medium / High | **External fact:** HubSpot, Contentful, Salesforce, Virtuous, and Neon expose configurable reminders/tasks; useful elsewhere, but D18/D19 explicitly reject the need here. | Confirms deliberate non-goal.    | **D19-R11:** structural absence; later change requires representative evidence and a new contract.                                   |

### 18. Observability and auditability gaps

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                    | Severity / likelihood | Evidence and reasoning                                                                                            | Effect on D19                | Permanent fix and exact language                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ----------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| A log may say “notification sent” without proving source episode, recipient resolution, availability, presentation, read, or current access. Conversely, storing full preview/PII for diagnosis creates a privacy ledger. |           High / High | **ADR-0027/Phase 17:** availability, engagement, source status, body-free audit, and technical logs are distinct. | Requires separate evidence.  | **D19-R13, R20:** opaque occurrence/contract/fence/resolver/item/engagement facts; content-free logs; durable source/audit separation. |
| Missing-item, unauthorized-item, duplicate, stale-end, badge drift, partial release, external-channel, or legacy-writer failures could remain invisible.                                                                  |         High / Medium | **Repository principle:** named signal, threshold, owner, response for monitored risks.                           | Adds complete monitor table. | **D19-R20 and monitors below:** zero tolerance for authority/integrity effects and measured lag/performance thresholds.                |

### 19. Dependency and integration risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                         | Severity / likelihood | Evidence and reasoning                                                                                                                                             | Effect on D19                     | Permanent fix and exact language                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| D19 could assume Phase 17 is shipped when it is forward-only, or silently fall back to current queues/tasks. Mixed semantics would ship a feature that cannot meet accepted authorization/engagement behavior. |       Critical / High | **Current repo:** no canonical `in_product_notification_*` runtime; current generic seams are incompatible. **ADR/OpenSpec:** accepted intended model is explicit. | Makes Phase 17 a hard dependency. | **D19-R3, R18–R19:** Reserved key, dependency gate, no fallback/dual writer, current-vs-intended language.                     |
| Importing vendor behavior—Contentful assignee without access, Salesforce dismiss/snooze, GitHub Done, PagerDuty urgency/escalation, OS push expiry—could conflict with Core's governing decisions.             |           High / High | **Verified external evidence:** these products expose those features. **Repository authority:** ADR-0027/D18 choose different source/action/time meanings.         | Explicitly resolves conflicts.    | **D19-R2, R4, R7–R11, R14:** borrow separation/dedupe/context only; reject task/incident/push/channel semantics that conflict. |

### 20. Migration, rollout, and upgrade risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                | Severity / likelihood | Evidence and reasoning                                                                                                                                      | Effect on D19                     | Permanent fix and exact language                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Replaying current active Plans, tasks, queue rows, or email opens could flood users with unread history and fabricate recipient/read truth. Dual writers or enabling producers before readers/RLS can duplicate/leak. |       Critical / High | **ADR/OpenSpec:** future-only migration and one writer fence; no inferred engagement. **Current repo:** legacy stores cannot map safely to canonical items. | Requires no-backfill rollout.     | **D19-R19:** shadow-only comparison, constraints/readers first, post-fence transitions only, legacy disabled before visibility. |
| New code/old schema, old code/new schema, key Reserved/Live mismatch, rollback after writes, or a changed resolver version can strand items or create peer episodes.                                                  |           High / High | **Phase 17:** manifest generation pins contract/resolver/facts/policies; source/event identities are immutable.                                             | Requires versioned compatibility. | **D19-R5, R19, R22:** exact pins, fail closed, preserve evidence, stop new occurrences on rollback, forward terminal repair.    |

### 21. Testability, traceability, and proof

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                             | Severity / likelihood | Evidence and reasoning                                                                                                                 | Effect on D19                  | Permanent fix and exact language                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| “One,” “authorized,” “reading,” “actionable,” “condition ends,” and “by default” are too vague to test. A UI snapshot could pass while shared engagement, broad recipients, legacy writes, or hidden email remain. |       Critical / High | **Repository fact:** glossary and ADR give exact item/group/engagement/source terms; OpenSpec scenarios cover read/source/access loss. | Requires falsifiable criteria. | **D19-R1–R22 and acceptance proof below:** positive/negative/boundary/auth/race/migration/accessibility/production-shaped tests at public seams. |
| D19 could contradict D17/D18/Phase17 across PRD, OpenSpec, tickets, schema, tests, and release evidence.                                                                                                           |           High / High | **Repository rule:** decision chains and governing documents must agree; external research is informative only.                        | Makes traceability a gate.     | **D19-R22:** exact matrix and contradiction check; no runtime/ticket dispatch from this grill evidence alone.                                    |

### 22. Other development hazards

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                   | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                 | Effect on D19                      | Permanent fix and exact language                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “No recurring reminder or email **by default**” could be interpreted as adding dormant toggles now. “One action” could be interpreted as one broad catch-all key for Ready, changed review, suspension, owner gaps, and source blockers. |           High / High | **Repository fact:** Phase 17 rejects generic keys/rule engines; unknown/Reserved keys create no work. **D18:** future timing/reminder needs a separately accepted decision.                                           | Requires semantic/channel closure. | **D19-R1, R11, R22:** no dormant channel/config; D20 enumerates initial triggers; materially different meanings use separate stable keys.                 |
| A polished design could be declared successful without representative multilingual/mobile/accessibility staff evidence, while rigid invented numeric UX thresholds could claim false certainty.                                          |       Medium / Medium | **Assumption:** no D19 Core staff usability study exists. **W3C facts:** objective accessibility requirements exist; comprehension thresholds must be pre-registered for the study rather than invented after results. | Adds evidence-honest validation.   | **D19-R14–R15 and ACs:** pre-register role/language/device/AT protocol and thresholds; accessibility failures and safety misunderstandings block release. |

## Final disposition after adversarial review

**Accept with required amendments.**

The selected behavior solves a real coordination gap with less friction and
noise than task/reminder/email alternatives. It remains accepted only with the
corrected one-occurrence/per-recipient-item model, closed source meanings,
current authorization everywhere, atomic bounded resolution, independent
engagement, source-owned end, canonical Phase 17 dependency, structural absence
of reminders/external channels, calm consequence-led UX, future-only rollout,
and zero public/Giving/finance effect.

No category invalidates that narrowed decision. Every material concern changes
or adds an enforceable requirement above.

## Required acceptance criteria and proof

### Trigger, occurrence, and semantic identity

1. **D19-AC1 — Registered transition only.** Each admitted source false→true
   transition creates one occurrence only when its exact Live contract,
   predicate, action, resolver, facts, destination, and end rule are current.
2. **D19-AC2 — Unregistered state is silent.** Unknown, Reserved, generic, or
   D20-unapproved Plan states create no occurrence, item, task, or fallback.
3. **D19-AC3 — Hundred-fold replay.** Submitting the same transition at least
   100 times returns one released occurrence and the same complete recipient
   set/items.
4. **D19-AC4 — No refresh/poll occurrence.** Browser refresh, list/detail read,
   readiness polling, cache rebuild, realtime recovery, and page revisit create
   no occurrence.
5. **D19-AC5 — No clock occurrence.** Advancing wall time, time zone, DST,
   Plan age, source/task age, or audit timestamps by years creates no D19
   occurrence, unread pulse, severity change, or source effect.
6. **D19-AC6 — Revision is a fence.** A Plan/source revision that preserves the
   same actionable meaning does not partition dedupe or create a peer item.
7. **D19-AC7 — Changed meaning conflicts.** Reusing an occupied occurrence slot
   with changed Tenant, environment, Site, Plan lineage, trigger meaning,
   source fence, action, contract, facts, or recipient membership hard-
   conflicts and creates no partial effect.
8. **D19-AC8 — Genuine recurrence is new.** Predicate true→false→true produces
   a new monotonic source episode, occurrence, and items; no old item/group/
   engagement is reopened or extended.

### Recipient resolution, authorization, and isolation

9. **D19-AC9 — Per-recipient items.** Two exact eligible Party+role recipients
   produce two sibling items under one occurrence, never one shared item.
10. **D19-AC10 — Independent engagement.** Reading/unreading one sibling cannot
    change another recipient's item, group, count, engagement, or source state.
11. **D19-AC11 — Duplicate grants collapse.** One Party+role qualifying through
    duplicate/overlapping grants receives one item for that episode.
12. **D19-AC12 — Roles remain separate.** One identity acting through two
    distinct authorized roles has role-scoped presentation/engagement and no
    cross-role badge/read sharing unless a later explicit contract proves an
    equivalent role boundary.
13. **D19-AC13 — Exact capability conjunction.** The resolver proves current
    membership, Site/Plan/source visibility, privacy, and the exact displayed
    action capability; broad `staff`, `admin.dashboard.access`, creator, prior
    editor, task assignee, support, or service status alone produces no item.
14. **D19-AC14 — Trusted resolver input.** Caller-supplied Tenant, recipient,
    Party, role, surface, action, capability, source state, or recipient list is
    ignored/rejected before occurrence persistence.
15. **D19-AC15 — Complete zero.** A fully evaluated zero-recipient set creates
    one released zero-member occurrence, no visible item, and no guessed
    recipient while source discovery remains available to authorized users.
16. **D19-AC16 — Uncertainty is not zero.** Resolver timeout, partial result,
    policy ambiguity, membership race, and over-limit result create no partial
    fan-out and enter privacy-safe reconciliation.
17. **D19-AC17 — Exact fan-out bound.** Recipient count 50 succeeds under the
    inherited staff bound when total members remain at/below 200; 51 staff or
    201 total members creates no children and no silent truncation/chunking.
18. **D19-AC18 — Atomic membership race.** A membership/capability change
    before release makes the compiler retry/reject against the changed proof;
    no stale partial set becomes claimable.
19. **D19-AC19 — Active-Tenant isolation.** A principal with several Tenant,
    Site, or role memberships sees/counts only the exact active authorized
    partition; no global badge/feed exists.
20. **D19-AC20 — Reauthorize every seam.** List, count, search, detail, render,
    cursor, cache, read/unread, realtime recovery, support view, destination,
    and action tests all independently deny stale/revoked/cross-scope access.
21. **D19-AC21 — Immediate revocation.** Membership/role/capability/source
    revocation removes active and recent list/count/detail/search/cache/cursor/
    realtime/click visibility on the next authorized operation.
22. **D19-AC22 — No revival/transfer.** Permission restoration/new grant, Party
    merge/relink, account claim, role change, Tenant transfer, or anonymization
    neither revives an old item nor transfers another person's engagement.
23. **D19-AC23 — Hidden resource non-enumeration.** Forbidden Plan/Site/Page/
    owner/source facts add no row, count, label, cursor, cache key, relative
    time, latency distinction, error detail, or realtime clue.

### Read, active attention, source end, and races

24. **D19-AC24 — Intentional read only.** Deliberately opening full item detail
    or explicit **Mark as read** changes read; feed rendering, prefetch,
    viewport, hydration, background refresh, realtime, source end, or another
    recipient does not.
25. **D19-AC25 — Read clears unread only.** Read clears that recipient's
    accessible unread-group/bell contribution and no Plan/source/task/default/
    permission/public fact.
26. **D19-AC26 — Active after read.** A read source-actionable item remains in
    **Needs attention** and **All** with the same destination and stay-here
    explanation.
27. **D19-AC27 — Mark unread is personal.** A permitted mark-unread changes
    recipient engagement only; it cannot create/reopen an occurrence, extend
    policy, or change another count.
28. **D19-AC28 — No active archive.** Active archive/dismiss is absent in every
    UI and rejected by API/RLS/RPC/service/support/import/repair paths with the
    canonical explanation.
29. **D19-AC29 — Source end before view.** Ending before first view immediately
    removes unread/active contribution, preserves truthful unseen state, and
    fabricates no read.
30. **D19-AC30 — Source end after read.** Ending after read leaves authorized
    non-unread recent presentation only, with `presentation_ended_at` set once.
31. **D19-AC31 — Read/end race.** Every interleaving of mark-read/unread and
    producer end yields zero active/unread contribution after end, with source
    and engagement histories independently truthful.
32. **D19-AC32 — All Plan terminal outcomes.** Cancelled, Superseded, Activated,
    Satisfied elsewhere, and No longer applicable each end matching D19
    presentation idempotently without changing source-owned work.
33. **D19-AC33 — Readiness/safety regression.** A Ready item disappears when
    current readiness, target validity, serving/safety, Plan revision, or exact
    action applicability no longer supports it.
34. **D19-AC34 — Suspended Site.** A suspended Site never presents a Ready/
    activation action. Any later D20-admitted review-only item truthfully states
    the Site is suspended and has zero public effect.
35. **D19-AC35 — Exact post-end ceiling.** At the exact 90-day post-end ceiling,
    every user-facing query returns not presentable even when purge is late;
    engagement/grouping/retry/settings/time display cannot extend it.
36. **D19-AC36 — Access beats recent history.** Revocation hides recent history
    immediately and does not wait for the 90-day ceiling.

### Destination, privacy, and zero side effects

37. **D19-AC37 — Typed destination only.** Arbitrary URL/redirect, raw route,
    query/token, caller action code, or cross-Tenant target is rejected before
    persistence and click resolution.
38. **D19-AC38 — Navigation is harmless.** Opening the item performs zero GET/
    HEAD mutation and only navigates to the current authorized review.
39. **D19-AC39 — Fresh action boundary.** Any eventual activation remains a
    separate explicit POST with D16 current candidate/head/source/actor/safety
    proof and at-most-one authoritative effect under races.
40. **D19-AC40 — Closed preview facts.** The fact adapter accepts only the D19
    allowlist and rejects nested metadata smuggling, overlong/malformed labels,
    XSS, bidi/control characters, raw CMS content, arbitrary links, and unknown
    fields before any occurrence/effect.
41. **D19-AC41 — Sensitive-fact absence.** Preview, list/search index, logs,
    traces, metrics, realtime, exports, support evidence, and errors contain no
    private body/blocker/owner/location/member-care/Giving/financial/provider/
    secret facts or recipient PII.
42. **D19-AC42 — No external channel.** Every D19 path creates zero email, SMS,
    push, OS/browser notification, digest, sound, provider preparation/
    submission/outcome, or external delivery history.
43. **D19-AC43 — No reminder/task/urgency.** Every D19 path creates zero task,
    due date, task reminder, recurrence, snooze, subscription, escalation, or
    age-derived `high`/`critical` urgency.
44. **D19-AC44 — Zero source/public effect.** Occurrence/item/group/engagement/
    end/purge/reconcile changes no Plan, Page, Navigation, approval, Public Site
    Generation, Default Site Locale head, Site Root Entry, route, cache, search,
    sitemap, analytics, or public content.
45. **D19-AC45 — Zero Giving/finance effect.** The same paths change no Giving,
    Designation, explicit Giving URL, currency, Legal Entity, Stripe account,
    contribution, settlement, bank, receipt, tax, ledger, or accounting truth.

### Transaction, storage, RLS, recovery, and migration

46. **D19-AC46 — All-before-any release.** Occurrence header, exact ordered
    recipient/member set, every child identity, digest, and release marker
    commit in one transaction; no child is claimable before release.
47. **D19-AC47 — Failure injection.** Injected failure at each compiler boundary
    yields either no commit/visible child or the complete released occurrence,
    never a partial set.
48. **D19-AC48 — Lost-response replay.** Crash after commit/before response and
    client/worker retry return the original complete occurrence/items without a
    duplicate unread pulse.
49. **D19-AC49 — Unreleased invariant.** Any committed unreleased header is
    alerted/quarantined and cannot be force-released or replaced with a new
    occurrence to hide the defect.
50. **D19-AC50 — Composite scope integrity.** Poison tests cannot attach an
    occurrence/intent/event/item/group/engagement/source to another Tenant,
    environment, Site, Plan, Party, role, surface, or contract via UUID reuse.
51. **D19-AC51 — Immutable item/end rules.** Client/service mutations cannot
    change recipient/scope/source/policy/destination/preview, unset/move the
    end, extend history, or alter the closed end reason.
52. **D19-AC52 — Operation-correct policy matrix.** `SELECT` and `DELETE` test
    `USING`; `INSERT` tests `WITH CHECK`; `UPDATE` tests both `USING` and `WITH
CHECK`. Denial/grant cases run for every admitted operation, and an allowed
    update cannot move a row into unauthorized scope. `anon` and unauthorized
    authenticated clients have no base-table access.
53. **D19-AC53 — Engagement command integrity.** Exact item+viewer Party+role,
    expected revision/idempotency, current access, and legal transition are
    server-derived; no client delete/identity change/active archive succeeds.
54. **D19-AC54 — Definer/view hardening.** Exposed views are security-invoker;
    every definer helper has empty search path, qualified objects, revoked
    public execute, least privilege, indexed predicates, and pgTAP proof.
55. **D19-AC55 — Privileged poison matrix.** Service role, owner, `BYPASSRLS`,
    worker, RPC, Payload Local API, Data API, import, migration, support,
    impersonation, break-glass, AI, and repair cannot choose scope/recipient/
    actor or bypass current source/access proof.
56. **D19-AC56 — Realtime invalidation only.** Realtime carries identifiers,
    never preview/authority; missed/disconnected delivery recovers through an
    authorized keyset cursor read of committed database truth.
57. **D19-AC57 — No legacy write.** D19 creates zero rows/effects in
    `notification_queue`, `mission_control_attention_items`, contribution
    approval notification storage, or static demo state.
58. **D19-AC58 — No historical unread backfill.** Migration creates zero item
    from pre-fence Plans/locales/defaults/tasks/notifications/emails/opens/
    audits/readiness; it fabricates no engagement.
59. **D19-AC59 — Mixed-version safety.** Old code ignores inactive additive
    records; new code with old schema/Reserved key/missing dependency fails
    closed with no fallback or source/public effect.
60. **D19-AC60 — Rollback safety.** Kill/rollback stops new occurrences,
    preserves Plan/source and body-free audit, continues safe terminal hiding,
    and requires no public/Giving/finance rollback.

### UX, accessibility, performance, operations, and trace

61. **D19-AC61 — Active/unread comprehension.** A pre-registered representative
    study names sample size, role/language mix, device/bandwidth/AT mix, tasks,
    thresholds, and confidence rule before results. Every participant must
    understand that reading clears unread but not required work, and opening
    does not change the website; any safety misunderstanding blocks the tested
    copy/layout and is retested.
62. **D19-AC62 — One-action journey.** A qualified user moves from bell/list to
    the existing current review in one navigation action with Site+locale
    context and an obvious return path; activation remains separate.
63. **D19-AC63 — Labelled counts.** Bell unread-group count and page active-
    group count are independently correct and accessibly labelled; a read active
    item produces 0 unread and 1 active for that recipient.
64. **D19-AC64 — Calm UI negatives.** No active row has dismiss `X`, archive,
    Done, snooze, unsubscribe, due date, countdown, red urgency, toast loop,
    default sound, or direct activation.
65. **D19-AC65 — Complete accessibility matrix.** Keyboard, screen reader,
    semantic name/state, non-color unread, visible/unobscured focus, forced
    colors, reduced motion, long/CJK/RTL, 320px reflow, 400% zoom, and Core 44px
    important mobile controls pass WCAG 2.2 AA.
66. **D19-AC66 — Status/focus safety.** Arrival/end/access-loss async updates
    use at most one complete polite announcement, never steal focus, preserve a
    safe current focus target, and do not rely on toast/color/sound.
67. **D19-AC67 — State completeness.** Loading, empty, error, source-ended,
    authorization-lost, offline, low-bandwidth, missed-realtime, and retry
    states preserve meaning and expose no stale private content/action.
68. **D19-AC68 — Production-shaped performance.** At a declared fixture covering
    small/large/noisy Tenants, 0/1/50 recipients, many active/recent items,
    multiple roles, cold/warm cache, and revocation bursts, record p50/p95/p99,
    query counts/plans, bytes, and headroom. Eligible feed/count reads remain at
    or below D17's provisional 500ms p95 over 15 minutes with at least 100 reads,
    no N+1/all-Tenant scan, and no broadened cache scope.
69. **D19-AC69 — Reconciliation budget.** A current eligible source occurrence
    missing correct presentation reconciles within the provisional 300-second
    D17 private-projection ceiling; until then, readers fail closed and never
    manufacture a second occurrence.
70. **D19-AC70 — Traceability closure.** An automated matrix maps founder
    choice, D19 clauses/criteria, existing glossary, ADR-0027, Phase 17 manifest,
    eventual Phase 24 PRD/OpenSpec/design/tasks/tickets/schema/API/UI/tests/
    release/runbooks/monitors with no contradictory owner, term, state, number,
    trigger, recipient, retention, or channel.
71. **D19-AC71 — Initial plus successor routing.** One D20 source episode has
    one initial routing occurrence and only producer-authorized monotonic
    successors; every occurrence remains immutable and all-before-any.
72. **D19-AC72 — Continued-recipient continuity.** A D21 route revision or
    explicit handoff that keeps one exact Party+role+surface creates no peer
    item/unread and preserves that recipient's existing engagement.
73. **D19-AC73 — Differential handoff.** An explicit current-review handoff
    ends responsibility applicability for removed recipients, creates one
    complete successor occurrence for newly admitted recipients, and transfers
    no read/archive/actor history. Responsibility-only removal records
    `responsibility_reassigned` and retains non-unread **Reassigned** Recent
    presentation while authorization holds;
    authorization loss removes all presentation.
74. **D19-AC74 — Prospective route setting.** Saving a D21 route configuration
    alone changes future source episodes and creates/ends no current item; a
    separate admitted handoff command is required for current reviews.
75. **D19-AC75 — Sticky fallback.** Proved loss of every selected recipient may
    admit the declared fallback once. Primary recovery while the fallback leg
    remains qualified creates no reverse handoff, revival, or unread pulse;
    the next genuine source episode restarts current precedence.
76. **D19-AC76 — One active exact recipient.** Across the initial and every
    successor routing occurrence, at most one active item exists for the same
    source episode+meaning+Party+role+surface.

## Named monitors and required responses

Structural constraints and request-time authorization prevent invalid states;
the monitors below detect invariant breaks, asynchronous lag, capacity, and UX
failure. Zero-tolerance signals never replace prevention.

| Signal                                                          |                                                                                                                                                                             Threshold | Owner                                    | Required response                                                                                                                                                      |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site_default_plan_attention_cross_scope_total`                 |                                                                                                                                                                         Any value > 0 | Security + Site Locale                   | P0 disable affected presentation paths, contain exposure, preserve evidence, inspect every scope relation, and requalify isolation.                                    |
| `site_default_plan_attention_unauthorized_presentation_total`   |                                                                                                                                                                         Any value > 0 | Identity/Access + Phase 17 Security      | P0 evict cache/cursor/realtime state, revoke the path, assess disclosure, repair current reproof, and replay negative fixtures.                                        |
| `site_default_plan_attention_incapable_recipient_total`         | Any recipient admitted at compilation, or any presentation served, while exact current visibility/action capability is absent; ordinary post-revocation body-free history is excluded | Site IAM + Site Product                  | Disable the resolver generation, preserve evidence, remove presentation, correct capability conjunction, and reconcile the same occurrence.                            |
| `site_default_plan_attention_duplicate_active_item_total`       |                 Any second active item either for one occurrence+recipient Party+role+surface or across peer occurrences at the same Plan+actionable meaning+Party+role+surface grain | Phase 6/17 + Site producer               | Fence writer, keep both rows as evidence, hide duplicate, repair occurrence/active uniqueness, and prove legitimate later episodes only begin after prior end.         |
| `site_default_plan_attention_shared_engagement_total`           |                                                                                                                               Any engagement mutation affecting another Party or role | Phase 17 + Security                      | Disable engagement mutations, restore independent state only from trusted evidence, inspect affected counts, and add cross-recipient poison proof.                     |
| `site_default_plan_attention_recipient_fallback_total`          |                                                                                                                Any creator/admin/all-staff/assignee/support/legacy fallback recipient | Site IAM + Product                       | Stop the resolver/key, remove guessed presentation, assess disclosure, and require exact code-owned resolution before re-enable.                                       |
| `site_default_plan_attention_zero_misclassified_total`          |                                                                                                               Any partial/timeout/ambiguous/overflow result recorded as resolved zero | Site IAM + Phase 6                       | Halt claims/retries, re-run complete resolution under the same identity, create no guessed child, and repair the result union.                                         |
| `site_default_plan_attention_fanout_overflow_total`             |                                                                                                                                       Any Live staff result >50 or total members >200 | Phase 17 + Site IAM                      | Create no partial children, surface repair, measure resolver breadth/load, and raise a bound only through proved manifest generation.                                  |
| `site_default_plan_attention_unreleased_occurrence_total`       |                                                                                                                                                       Any committed unreleased header | Phase 6 on-call                          | Stop claims, quarantine occurrence, preserve evidence, repair atomic compiler invariant, and never force-release or issue a peer occurrence.                           |
| `site_default_plan_attention_partial_release_total`             |                                                            Any released occurrence whose child count, canonical order, digest, or gap-free ordinals differ from its frozen member set | Phase 6 on-call                          | Stop claims/presentation, preserve rows and source truth, repair the all-before-any invariant, and never truncate, force-release, or issue a peer occurrence.          |
| `site_default_plan_attention_projection_lag_seconds`            |                                                                                                                                   Above 300 seconds for a current eligible occurrence | Site readiness + Phase 6/17 Operations   | Fail closed, reconcile source outbox/compiler/end/cursor under the same identity, inspect queue health, and page owner without fallback delivery.                      |
| `site_default_plan_attention_source_end_projection_lag_seconds` |                                                                                                                                Above 300 seconds after the trusted source-end instant | Site producer + Phase 17 Operations      | Fail active reads closed, preserve/use the trusted producer end instant rather than worker time, reconcile end projection, and inspect affected unread/recent history. |
| `site_default_plan_attention_stale_source_served_total`         |                                                                                                                   Any active presentation whose current source/end predicate is false | Site readiness + Phase 17 Security       | Remove immediately, inspect end/invalidation/race, assess stale actions, and add the exact poison sequence.                                                            |
| `site_default_plan_attention_badge_drift_total`                 |                                                                                                     Any mismatch between currently authorized unread groups and accessible bell count | Phase 17 Experience                      | Recompute from authoritative items/engagement, repair group/cursor/cache logic, and preserve source truth.                                                             |
| `site_default_plan_attention_resolved_unread_debt_total`        |                                                                                                                     Any ended-before-view item contributing unread or fabricated read | Phase 17                                 | Remove badge debt without inventing engagement, repair reducer/race handling, and verify recent-history state.                                                         |
| `site_default_plan_attention_active_archive_total`              |                                                                                                                                   Any active archive/dismiss accepted by any boundary | Phase 17 API + Security                  | Reject/undo presentation mutation without touching source, remove UI affordance, repair policy/RLS/privileged path, and add regression.                                |
| `site_default_plan_attention_age_effect_total`                  |                                                                                                      Any occurrence/severity/order/transition/reminder caused solely by time/Plan age | Site Product + Phase 17                  | Disable rule/job/key, restore D18 semantics, reconcile duplicates, and pass clock-invariance proof.                                                                    |
| `site_default_plan_attention_external_effect_total`             |                                                                                                       Any email/SMS/push/provider/task/reminder/public/Giving/finance effect from D19 | Communications + Site + Finance Security | P0 fence contract/writer, contain and reconcile effects under each owner, remove unauthorized step/coupling, and requalify zero-side-effect tests.                     |
| `site_default_plan_attention_legacy_writer_total`               |                                                                                                                Any D19 write/read authority through a legacy queue/task/domain ledger | Phase 17 Migration + Data Architecture   | Stop the legacy writer/reader, preserve evidence, restore one canonical authority, and rerun one-writer/cutover proof.                                                 |
| `site_default_plan_attention_recent_ceiling_overrun_total`      |                                                                                                                    Any user-facing item at or after its exact 90-day post-end ceiling | Privacy + Phase 17                       | Deny query immediately, priority-purge preview/search, preserve permitted body-free audit, and repair ceiling enforcement.                                             |
| `site_default_plan_attention_read_p95_ms`                       |                                                                                                                           Above 500ms for 15 minutes with at least 100 eligible reads | Site Platform + Phase 17                 | Inspect plans/indexes/RLS/batching/cache/fan-out; reduce work without copying source truth or broadening cache/authorization.                                          |
| `site_default_plan_attention_comprehension_gate`                |                                                                                            Missing pre-registered representative study or failure against its predetermined threshold | Site Product Research + UX               | Block tested copy/layout/key launch, identify misunderstanding, revise consequence/active-vs-unread treatment, and repeat the registered study.                        |

## Ruthless synthesis — strongest path forward

### Must be resolved before D19 is recorded

Completed in this evidence package:

1. Resolve **one item** to one producer occurrence plus one recipient-specific
   item per exact Party+role, never one shared row.
2. Keep source actionability, recipient availability, current authorization,
   item presentation, engagement, and source completion separate.
3. Make current exact capability and source visibility mandatory at compiler,
   every read/count, destination click, and action.
4. Reuse only the canonical Phase 6/17 model; forbid current legacy/generic
   queues, Mission Control attention, domain ledgers, and demo UI.
5. Adopt the fixed source-actionable presentation policy, independent read,
   omitted active archive, source-owned end, access-loss removal, and 90-day
   post-end ceiling.
6. Make no-reminder/no-email/no-external-channel/no-time/no-public/no-Giving/
   no-finance behavior structural rather than configurable defaults.
7. Keep the exact initial trigger registry closed for D20 instead of authorizing
   a vague catch-all key.

### Requirements the later PRD/OpenSpec/design must capture

1. Exact Live trigger key(s), source events/fences/actionable/end predicates,
   next-action codes, recipient resolver(s), safe fact schemas, destination(s),
   and stay-here explanations selected after D20.
2. Phase 17 manifest pins, bounded plan occurrence/member identities, complete
   resolver result union, immutable recipient items, groups, engagement, source
   end, retention/audit class, and stable versions.
3. Exact least-privilege Site/Plan capability atoms and authorization epoch/
   privacy reproof for every server surface.
4. Composite Tenant/environment relationships, grants/RLS/definer/view rules,
   indexes for recipient feed/count/source reconciliation/keyset pagination,
   and poison matrices.
5. Source outbox/occurrence transaction/replay/reconciliation protocol and
   current-reader/source-end behavior under partial/late/out-of-order events.
6. Complete calm staff surface, active/unread distinction, mobile/AT/weak-
   network/error/offline behavior, comprehension research, and production-
   shaped performance evidence.
7. Future-only migration, shadow comparison, one-writer fence, cohort rollout,
   kill/roll-forward path, trace matrix, dashboards, alerts, runbooks, and owner
   roster.

### Implementation order and dependencies

1. Land and activate the accepted canonical Phase 17 occurrence/item/group/
   engagement model and one-writer cutover; do not build a D19 substitute.
2. Land D15/D16 public/default contracts, D17 private Plan/readiness, and D18
   time absence so the source predicate and zero-side-effect boundary exist.
3. Record D20's exact trigger set, then define closed manifest key(s), source
   adapter/end rule, destination, safe facts, recipient resolver, capability
   atoms, and retention/audit entries.
4. Add schema constraints/RLS/grants/server APIs/indexes/negative readers and
   complete unit/pgTAP/property/race/security/accessibility fixtures before the
   producer writer.
5. Shadow source episodes and recipient sets without exposing items; prove
   zero/1/50/overflow, source end, access churn, cache/realtime, and performance.
6. Enable one writer for one Site cohort, observe named signals and usability
   gates, then expand only with evidence. Keep the key Reserved on any failed
   authority, privacy, comprehension, or invariant gate.

### What may be monitored rather than precluded

Only inherently operational or empirical variation belongs here:

- projection lag uses `site_default_plan_attention_projection_lag_seconds`,
  threshold 300 seconds, Site readiness + Phase 6/17 Operations owner, and the
  fail-closed same-identity reconciliation response above;
- feed performance uses `site_default_plan_attention_read_p95_ms`, threshold
  500ms for 15 minutes/100 reads, Site Platform + Phase 17 owner, and indexed/
  batched optimization without scope broadening; and
- human comprehension uses `site_default_plan_attention_comprehension_gate`,
  the pre-registered threshold, Product Research + UX owner, and block/revise/
  retest response.

All authority, isolation, uniqueness, state-transition, channel, and zero-
effect rules remain structural/tested invariants even though zero-tolerance
monitors also detect regressions.

### Deliberate non-goals

- a general Site notification system, task manager, responsibility engine, or
  workflow builder;
- recurring reminders, due dates, age escalation, snooze, digest, email, SMS,
  push, browser/OS alerts, sounds, or notification marketing/preferences;
- arbitrary URL/action/payload/recipient configuration;
- a global/cross-Tenant inbox, shared read state, or group-level completion;
- direct activation/approval/source mutation from a notification;
- historical unread backfill, engagement inference, or dual legacy writers;
- content/Page/Giving/finance details in preview/history; and
- a generic `plan_actionable` contract hiding materially different actions.

## Research and evidence used

### Verified repository facts

- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
  requires one recipient/role-safe item/group/engagement projection, two closed
  policies, current authorization, access-loss removal, no revival, independent
  source truth, and release-blocking isolation/accessibility proof.
- [Phase 17 PRD](./phase-17-system-messages-template-management.md) defines the
  Phase 6 occurrence compiler, item/group/engagement model, source-actionable
  policy, full staff bell/center, current reproof, keyset pagination, and
  future-only migration.
- [Phase 17 executable manifest](./phase-17-system-message-executable-manifest.md)
  defines exact contract pins, typed destinations, end rules, zero-member
  occurrences, 50-staff/200-member initial bounds, and all-before-any release.
- [Active outbound-communications OpenSpec](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
  requires read to clear badge only, source end/no unread debt, immediate access
  removal, fixed ceilings, and no later revival.
- [D17](./phase-24-d17-private-default-site-locale-plan-adversarial-review.md)
  makes Plan readiness derived/current, capabilities independent, routing
  deduplicated, activation explicit, and notification/task engagement inert.
- [D18](./phase-24-d18-undated-default-site-locale-plan-adversarial-review.md)
  forbids Plan dates, age-driven urgency/reminders/automation, and generic task
  timing while reserving a later real state-driven D19 decision.
- Current `notification_queue`, Mission Control attention rows/helper,
  contribution notifications, and static dropdown do not implement the
  accepted Phase 17 model and are not safe D19 substitutes.

### Verified primary external evidence

- [GitHub notification documentation](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications)
  separates read/unread from **Done** and other inbox organization. Core borrows
  the separation, not user-controlled completion of required source work.
- [PagerDuty alerts](https://support.pagerduty.com/main/docs/alerts) document
  condition-key deduplication until resolution. Core borrows semantic episode
  identity, not incident severity/escalation/acknowledgement.
- [Android notification guidance](https://developer.android.com/develop/ui/compose/notifications/create-notification)
  documents stable notification updates and alert-once behavior; its design
  guidance favors direct value/obvious action and warns against false urgency.
  Core remains in-product-only and does not add OS push.
- [Microsoft model-driven in-app notifications](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/send-in-app-notifications)
  are recipient-specific and contextual. Core uses recipient-specific items but
  rejects arbitrary expiry/dismiss and ad hoc per-recipient writes.
- [Microsoft Lists approvals](https://support.microsoft.com/en-us/office/approvals-in-lists-document-libraries-2bd0954d-5797-4be3-b78a-846f26338e17)
  shows that approval does not grant underlying item access and that underlying
  changes affect approval validity, supporting current source/access reproof.
- [Contentful tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
  explicitly warns that assignees may lack entry access. Core rejects
  assignment-as-authority, dates, reminders, and default email.
- [Payload access control](https://payloadcms.com/docs/access-control/overview)
  documents operation/record-sensitive access; its Local API documentation
  warns access can be overridden, supporting privileged-path proof.
- [Salesforce approval requests](https://trailhead.salesforce.com/content/learn/modules/approval-process-for-public-sector-solutions/manage-approval-requests)
  supports a central pending-action surface. Core keeps the direct action but
  not a parallel approval/task owner.
- [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages),
  [alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/),
  [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), and
  [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  support programmatic polite status, no focus theft, persistence, non-chatty
  updates, 320px reflow, and accessible controls.

### Evidence limits and product judgment

- External products prove available patterns, not that their assignment,
  expiry, snooze, priority, email, or incident semantics fit Core.
- No representative Core ministry study yet quantifies the frequency of
  missed Plan handoffs or validates D19 wording. The pre-registered usability
  gate is therefore required; research cannot manufacture founder trigger
  meaning.
- The 50/200 fan-out, 300-second projection, and 500ms p95 values are inherited
  provisional repository budgets. M0/production-shaped proof may lower them;
  raising them requires the governing change named above.
- Current runtime does not implement Phase 17 or D17–D19. This document states
  intended permanent behavior and dependency gates, not shipped capability.

## Documentation status

- This D19 report and the dated [primary research appendix](./phase-24-d19-state-driven-attention-primary-research.md)
  record the founder answer, external research, conflict resolution, exact
  amendments, 22-category review, criteria, monitors, and synthesis.
- The Phase 24 decision log records D19–D25; D21 closes the responsibility-route
  hierarchy, D22 closes its bounded unordered co-responsible cardinality/
  completion meaning, D23 closes the proportional source-owned independence
  floor, and D24 closes the protected-participant boundary by excluding every
  source-defined substantive participant in the exact protected candidate.
  [D25](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md)
  closes recovery through source-authorized candidate-scoped external review;
  [ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
  records the authorization boundary. D26 now closes that option's three-state,
  narrow-only Tenant/Site availability posture. D27 now closes one source-owned
  internal/external responsibility lane with deliberate takeover. D28 now
  closes explicit decline/expiry next-lane recovery; D29 next decides its
  bounded recovery-responsibility route.
- D18 receives a later-D19 clarification only; its no-date/no-age-reminder
  decision remains unchanged.
- Existing root glossary terms **In-product communication availability**,
  **In-product notification item**, **Notification attention group**,
  **Notification engagement**, and **Notification source status** already cover
  D19. No new glossary term is required.
- No new ADR is required because D19 conforms to accepted ADR-0027. A future
  Phase 24 spec extends the Phase 17 manifest and cross-phase trace matrix.
- ADR/PRD/OpenSpec/design/schema/migration/runtime/tickets/commit/staging remain
  unchanged and require the separately invoked specification/implementation
  workflows.

## D20 — Which Plan changes should notify staff?

> **Question wording revised 2026-08-28:** Expanded with plain-language terms,
> impact, staff journeys, benefits, costs, and examples at the founder's
> request. No D19 decision changed.

### The decision in plain English

D19 decided **how** a Plan notification must behave: one quiet in-product item
for each exact authorized recipient, read state separate from unfinished work,
and no email, reminder, deadline, or automatic website change.

D20 decides **when** that item is valuable enough to create.

A notification deliberately asks a staff member to stop what they are doing and
look at something. If Core creates too few, important review work can sit
unnoticed. If Core creates too many, the bell becomes another crowded task list
and staff learn to ignore it. This decision therefore controls the signal-to-
noise ratio of the future staff experience.

### The terms mentioned below

- **Ready to review** means current checks show that the planned language can
  enter final review. It does **not** mean the language is live or that Core will
  change it automatically.
- **Changed since review** means source facts used in an earlier review changed,
  such as the reviewed Page, Navigation, generation, or safety evidence. Staff
  must review the changed facts before activation can be allowed.
- **Current default changed** means another locale—not the planned target—became
  the Site's current default while this Plan remained active. Staff must perform
  the separate zero-public-effect **Review changed default** action before the
  Plan can return to final review. If the planned target itself became current,
  the Plan becomes **Satisfied elsewhere** instead and needs no action item.
- A **registered direct staff action** means the product has one specifically
  defined action that this recipient is authorized and able to perform now,
  such as **Open navigation**. It is not a vague warning or a problem owned by
  someone else.

### What this decision does—and does not—change

Whichever option you choose:

- refreshes, retries, background checks, and elapsed time create no item;
- **Waiting for another owner**, ownerless work, and operator-only failures
  create no item for ordinary staff;
- a suspended Site creates no review/activation item unless a later contract
  proves a different safe direct action;
- the recipient must be currently authorized to see the Plan and perform the
  displayed action;
- opening or reading the item changes nothing public; and
- there is still no email, recurring reminder, task deadline, or automatic
  default-language change.

D20 does not yet decide which one of several qualified people should receive an
item. We will make that recipient-routing decision after deciding which moments
should create items.

### Option 1 — Notify for every review-required episode

**Recommended.** These are treated as three distinct, carefully defined review
moments:

1. The Plan newly becomes **Ready to review**, so a qualified staff member can
   begin final review.
2. An earlier review becomes unsafe to rely on and the Plan truthfully becomes
   **Changed since review**, so a qualified staff member can immediately
   perform **Review changes**.
3. Another locale becomes the current default and the Plan truthfully becomes
   **Current default changed**, so a qualified staff member can immediately
   perform the zero-public-effect **Review changed default** action.

**Staff experience:** Maria is notified when French (Canada) is finally ready
for her review. If she reviews it and a material review fact later changes, she
gets one new, clearly different item telling her that the review must be done
again. If another locale becomes the current default, she receives a different
item explaining that the current-versus-planned impact must be reviewed again.
She does not receive Plan notifications for every ordinary Page, Navigation, or
owner-work update along the way.

**Benefits:**

- catches both the moment staff can finish and the moment an earlier review is
  no longer trustworthy;
- keeps the bell focused on high-value decisions rather than setup progress;
- gives each item one obvious review action; and
- preserves Page, Navigation, and other source-owned work queues as the place
  for ordinary blocker work.

**Costs and consequences:**

- staff must still use **Site → Languages**, the Sites view, and source-owner
  queues for ordinary setup/blocker progress; and
- **Ready to review**, **Changed since review**, and **Current default changed**
  need separate stable message meanings, end rules, copy, tests, and audit
  evidence. That is small deliberate complexity that prevents one vague,
  brittle “Plan changed” notification.

**Tenant example:**

```text
Ready to review
hope.org · French (Canada)

French (Canada) became ready for final review.
This Plan does not change the website automatically.

[Review planned change]
```

Later, only if the earlier review becomes outdated:

```text
Changed since review
hope.org · French (Canada)

Information used by a previous review changed.
Review the current version before continuing.
This Plan does not change the website automatically.

[Review changes]
```

If a different locale becomes the current default while the Plan remains
active:

```text
Current default changed
hope.org · French (Canada)

The website's default changed while this Plan was active.
Compare the current website with this planned change.
This Plan does not change the website automatically.

[Review changed default]
```

### Option 2 — Notify for Ready-to-review episodes only

Core creates a Plan item whenever the Plan genuinely enters **Ready to review**.
That includes a later real Ready → not ready → Ready recurrence, which creates a
fresh episode and item. This option does not create the separate **Changed since
review** or **Current default changed** items.

**Staff experience:** Maria receives one clear “ready” item. She reads it and
reviews the Plan. If that review later becomes outdated, she discovers that
only when she returns to Languages or another authorized Site-management view.
If staff resolve that state and the Plan later genuinely becomes Ready again,
Maria receives a new Ready item.

**Benefits:**

- quietest notification experience;
- only one message meaning, action, and end rule to implement; and
- lowest chance of notification fatigue.

**Costs and risks:**

- an earlier review can become outdated without bringing the responsible staff
  member back;
- staff may reasonably assume their prior review is still current; and
- long-lived or multi-Site Plans depend more heavily on people routinely
  revisiting the source surfaces.

**Tenant example:**

```text
Ready to review
hope.org · French (Canada)
[Review planned change]
```

If the review later becomes outdated:

```text
Site → Languages
French (Canada) · Changed since review
[Review changes]

No new bell item is created.
```

If staff later review/repair the changed facts and the Plan genuinely re-enters
Ready:

```text
Ready to review
hope.org · French (Canada)
[Review planned change]

A fresh Ready episode creates a fresh item.
```

### Option 3 — Notify for every registered state with a direct staff action

Core can create a distinct item for **Ready to review**, **Changed since
review**, and any other Plan state where the current recipient can immediately
perform one registered action. Every added state needs its own exact meaning,
recipient rule, action, end rule, privacy-safe copy, and tests.

This option still excludes ownerless work, waiting for someone else, vague
warnings, ordinary progress, suspension without an admitted safe action, and
operator-only failures.

**Staff experience:** Maria may see Plan items not only for final review, but
also for work she can do immediately—for example, **Navigation needs your
update** with an **Open navigation** action.

**Benefits:**

- gives staff one broader place to find actionable Plan work across several
  Sites;
- can reduce the need to revisit each Languages page; and
- makes more cross-team handoffs discoverable when the action genuinely belongs
  to the recipient.

**Costs and risks:**

- the same Page or Navigation work may appear in both its source-owned queue and
  the Plan notification center;
- more item types, recipient resolvers, end rules, and permission combinations
  increase implementation and testing cost;
- staff may struggle to understand which surface owns completion; and
- higher volume makes the two most important review items easier to overlook.

**Tenant example:**

```text
Navigation needs your update
hope.org · French (Canada)

French navigation is incomplete, and you can update it now.

[Open navigation]
```

Reading the item never completes the Navigation work. It stays in **Needs
attention** until Navigation-owned truth says the action is complete.

### Comparison

| Option                                       | What reaches the bell                                    | Main staff benefit                 | Main tradeoff                                    |
| -------------------------------------------- | -------------------------------------------------------- | ---------------------------------- | ------------------------------------------------ |
| 1. Every review-required episode             | Ready, Changed since review, and Current default changed | important reviews are hard to miss | three precise message contracts                  |
| 2. Ready episodes only                       | every genuine entry or re-entry into Ready to review     | quietest and simplest              | review-invalidating states may go unnoticed      |
| 3. Every registered state with direct action | review plus other immediately actionable Plan work       | broader cross-Site work discovery  | more noise, duplication, permissions, and upkeep |

### Recommendation

Choose **Option 1 — every review-required episode**.

It gives staff the best balance: Core brings Maria back when she can finish the
change, when source facts invalidate her earlier review, and when a different
current default changes the impact she must review. Ordinary Page, Navigation,
and owner work stays in the surfaces that actually own it. This is the clearest
UX, keeps notification volume low, and avoids turning the bell into a second
task system.

### Exact question

Which option should Core use for the first Plan notifications: **Option 1 —
every review-required episode**, **Option 2 — Ready-to-review episodes only**,
or **Option 3 — every registered state with a direct staff action**? You may
also amend an option.

### D20 resolution

The founder chose **Option 1 — every review-required episode**. The completed
[D20 adversarial review](./phase-24-d20-every-review-required-episode-adversarial-review.md)
defines exactly three mutually exclusive meanings, one source selector,
same-action episode deduplication, current review evidence, end/unknown/race
behavior, staff UX, 80 acceptance criteria, and named monitors. D20 is closed.
D21 now selects only currently authorized members of the winning explicit
responsibility route; D22 fixes one-to-three unordered co-responsible people
where any one may act. D23 now selects the source-owned proportional
independence floor. D24 now excludes every source-defined substantive
participant in the exact protected candidate from its independent review. D25
now closes lawful recovery through source-authorized candidate-scoped external
review. D26 now closes its bounded three-state availability posture, and D27
closes one source-owned responsibility lane with deliberate takeover. D28 now
closes explicit decline/expiry next-lane recovery; D29 next decides its bounded
recovery-responsibility route.

## Subsequent D31 Tasks Hub reconciliation

D19's notification contract still creates no task and never uses generic task
storage as notification authority. D31/ADR-0183 adds a separate, later-activated
source-backed task projection for registered actionable source work. The two
projections may share a causal source-work identity and coordinated UI, but
notification engagement, task coordination, and source truth remain separate;
task materialization creates no second bell event and no task state clears the
source condition.
