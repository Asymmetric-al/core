# ADR-0027: One notification presentation and engagement model

**Status:** Accepted (founder ruling, Phase 17 grill session — D8)

> Full record: `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md`
> (ratified decision D8).

## Context

System events must sometimes attract attention inside the product even when
email is unavailable or unnecessary. Treating an in-product notification as a
copy of an email or as a new task/business record would create contradictory
truth, duplicate state, and role leaks across Mission Control, Donor Portal,
and Missionary Workspace.

## Decision

The platform owns one Asym/Postgres notification item, grouping, and engagement
model. A notification is a role-safe attention projection over a source-owned
event; it is never the source record, task, workflow, communication delivery
receipt, or business-completion truth.

Availability, presentation, engagement, and source state remain separate:

- the producer decides whether the event is currently relevant and supplies a
  typed, tenant-bound projection;
- Phase 17 resolves the immutable presentation contract and creates or groups
  the item for an exact tenant, Party, role, and surface;
- the viewer may mark an item seen, read or unread, and archived or restored
  under the canonical engagement vocabulary; and
- source resolution or reversal is represented from the producer and is never
  inferred from notification engagement.

Phase 17 launches the full staff bell/inbox and only contextual donor or
missionary notification views required by Live contracts. Broad donor and
missionary notification-center information architecture remains Phases 25 and 28. Email and in-product steps are independently authorized; one channel's
failure or engagement does not silently complete the other.

Every Live in-product step selects exactly one of two code-owned presentation
policies plus one exact source-applicability/end rule:

- `presentation.source_actionable_then_recent_90d@1` keeps current required work
  in **Needs attention** and **All** even after read, omits archive while the
  source remains actionable, then preserves authorized non-unread recent history
  for 90 days after the once-set source-owned presentation end; and
- `presentation.information_30d_then_recent_90d@1` is **All**-only, ends unread
  treatment by the earliest read/archive/correction or day 30, and leaves
  user-facing recent history at day 90.

Active attention, recent user-facing presentation, and durable body-free Phase 6
audit are distinct. Access loss removes active and recent presentation
immediately. Source resolution before first view creates no unread debt and no
fabricated read. Engagement, tenant configuration, worker delay, grouping, retry,
or a later authority assignment cannot extend or revive an old item. A new
meaningful source transition creates a new item and may reopen the group.

**Phase 24 D31 clarification (2026-08-28).** A registered actionable source
occurrence may also have a separately owned source-backed task projection under
ADR-0183. This does not turn the notification item into a task or make task
state part of notification engagement. The notification and task share only a
causal source-work identity and a coordinated user presentation: personal read
state remains here, task coordination remains in Tasks Hub, and source
actionability/completion remains with the producer. Materializing a task does
not create a second bell occurrence, and neither projection copies protected
source detail or grants access.

**Phase 24 D33 clarification (2026-08-28).** A source-owned named handoff or
return may append a successor task-assignment generation without transferring
personal engagement. Continuing recipients preserve existing engagement;
newly admitted recipients alone receive fresh unread; removed recipients end
active presentation with the source-derived Reassigned/Returned reason while
still-authorized body-free Recent history remains. Authorization loss still
removes protected presentation. Return enters source Needs assignment only when
no responsible recipient remains, and no notification/read state selects a
successor or certifies the transition.

**Phase 24 D35 clarification (2026-08-29).** The Website source-owned **Needs
assignment lane** has no notification item, shared unread, shared engagement,
archive, claim, or dismiss state. An optional one-to-three-person Website work-
recovery route may create recipient-specific Tasks Hub assignment and personal
engagement projections for **Assign returned Website work**, but materializing
those tasks creates no second bell occurrence or default email/SMS/push/digest/
reminder. Reading changes only the current recipient's engagement; the exact
source assignment/end receipt alone removes actionability. Route membership or
task possession grants no source visibility or action authority, and protected
D30/D34 context is never copied into a notification presentation.

**Phase 24 D36 clarification (2026-08-29).** A prospective D35 policy save
changes no current personal engagement. Current work changes only through a
separately authorized, reviewed current-work policy application. Its
differential successor preserves continuing assignment/engagement and read
state, gives newly admitted recipients alone fresh unread, and ends removed
recipients as **Coordinator responsibility changed** without fabricating read,
completion, dismissal, source resolution, access loss, or correction
reassignment. Applying lane-only ends personal coordinator presentation but not
the source Needs assignment lane. Policy/application work creates no second
bell item or default channel. A later policy or restored access never revives
ended engagement; any later admission uses a fresh current generation.

**Phase 24 D37 clarification (2026-08-29).** A complete Tenant current-work
application does not create shared engagement or transfer one person's state.
Its separately authorized review exposes only exact complete aggregate
item/assignment consequences; no Site, member, source detail, visible/hidden
split, qualification reason, or sibling engagement is disclosed. Each sealed
member still applies D35/D36 independently: continuing recipients retain
engagement, newly admitted recipients alone receive unread, proved-zero creates
no personal item, and indeterminate or widened recipient impact releases
nobody. Cohort preparation, sealing, progress, and finish create no additional
notification occurrence, badge, reminder, or channel.

**Phase 24 D44 clarification (2026-08-29).** A pending holder direct-grant
review owns one source attention occurrence whose current personal recipients
are resolved from the Tenant's optional one-to-three-person **Access request
coordinator policy**. Tasks Hub is not the exclusive attention mechanism: the
same causal occurrence produces both recipient-specific source-backed task
attention and an independently engaged Notification Center/delivery
projection. Task state, notification delivery/read/archive state, and
coordinator designation grant no request visibility or decision authority and
cannot complete, keep, remove, or otherwise change access.

Each newly configured recipient must be an exact current Active Tenant
Assignment that independently passes the D43 kind's exact-scope
`permissions.manage_grants`, ceiling, floor, and source-visibility checks when
the policy head is saved. The requester is excluded from personal
responsibility for their own request. A configured recipient who later loses
eligibility remains auditable and visible to the policy administrator as **Not
currently eligible** but receives no protected attention. Indeterminate or
zero resolution creates no item, task, guessed recipient, or broadcast while
the authoritative Access requests lane remains available. Phase 12 maps an
admitted assignment through trusted current Tenant/Party/staff-role/surface
identity; Phase 17 never joins on stored profile, email, or display name and may
narrow but never widen or cross the active Tenant.

A confirmed coordinator-policy save first requires one fresh, complete,
permission-safe aggregate preview of all current pending D43 responsibility
generations. Stale or indeterminate preview writes nothing. The accepted policy
is then applied differentially to that complete current cohort. Continuing
recipients preserve their task and notification engagement. Each newly admitted
recipient receives one source-backed task projection for every exact current
request, but only one safe recipient-level in-product responsibility-update
occurrence for that route revision. Removed recipients receive no new item and
end active presentation as **Coordinator responsibility changed** without
fabricated read, completion, dismissal, request resolution, or access loss.
Terminal requests and history are never rerouted. Current assignment or
authorization loss also removes active protected presentation; restored
eligibility may create a fresh generation but never revives an ended one. A
global authorization-epoch change merely re-evaluates: an unchanged canonical
recipient set and responsibility meaning preserves the generation and emits no
task or notification.

D44 registers two required staff in-product keys under
`presentation.source_actionable_then_recent_90d@1`:

- `holder_access_review_requested_v1` is created for each newly opened request
  and each then-current recipient. Its title is **Access review needs
  attention**, category is **Access requests**, and action is **Review in People
  & access**. Safe supporting copy is **Review this request in People & access.
  It remains in Needs attention until it is resolved, withdrawn, or no longer
  applies.** Applicability is one current D43 `pending_review` head plus the
  viewer's current recipient generation.
- `access_request_responsibility_updated_v1` is created once per newly admitted
  recipient and source-owned responsibility-application generation when a
  policy or eligibility change assigns one
  or more already-pending requests. Its title is **Access review
  responsibilities updated** and safe copy is **You were assigned {count}
  existing access requests.** It contains only that immutable initial assigned count and a typed
  **Access requests** link. Its source-owned immutable
  child membership/source-end proof remains actionable until none of the exact
  requests admitted by that recipient/revision remains current for that
  recipient. It never produces one unread bell item per child request.

Product-database uniqueness, not event/provider deduplication, owns both
identities: the per-request item keys the exact Tenant, request occurrence,
recipient generation, and notification key; the aggregate item keys the exact
Tenant, admitted assignment recipient, responsibility-application generation,
and notification key. That application generation pins the route revision,
eligibility/authorization basis, admission cause, and sealed child request set,
so loss and later re-admission under the same route cannot collide.
Replay returns the same occurrence and can never substitute a task ID, profile,
email, display name, Inngest run, or delivery-provider identifier.

Both keys use a typed deep link to authenticated Phase 12 detail/lane and never
an inline Keep/Remove action. Safe presentation contains no request/decision
explanation, continuity history, capability, protected provenance, authority
evidence, or subject list; those remain in Phase 12 and load only after fresh
authorization. D43 terminal truth ends active/Needs-attention presentation and
then follows the registered Recent-history policy; it never gives a
notification the Tasks Hub's Completed/No longer required status. Coordinator
removal ends only that recipient's attention as **Coordinator responsibility
changed**.

**Phase 24 D45 clarification (2026-08-29).** Both D44 keys keep required
in-product attention and add only one contract-permitted optional immediate
email sibling. Tenant email enablement defaults Off, and the recipient's closed
`preference.access_request_responsibility_email@1` is only
`inherit | disabled`; absence means `inherit`, while
`disabled` is a self-owned narrowing an administrator cannot override. Email
exists only when the contract permits it, the published Tenant plan is On, the
recipient has not disabled it,
current D43 source, current D44 recipient generation and authorization, one
server-resolved current owned/contactable email revision, applicable
suppression floor, and Tenant-owned Resend/Sender/Reply readiness all pass. Each
layer narrows; none grants access, selects another recipient/address, or weakens
the required item.

One atomic `profile.access_governance_attention@1` family-plan choice governs
both exact email slots. Mixed per-key On/Off is invalid, while each key keeps
its own source occurrence, safe rendering, intent, and outcome.
The effective family-plan value is exactly
`email_disabled | email_enabled`; missing, legacy, unknown, or unproved state
resolves to `email_disabled`. Only a current same-Tenant actor with
`system_messages.plan.manage` may publish its successor; coordinator, D44 route,
request-decision, task, notification, or `permissions.manage_grants` authority
does not imply plan management.

Email uses the same minimized code-owned meaning as its local sibling but has a
separate Phase 6 intent, preparation, provider identity, delivery state, and
advisory engagement. The per-request subject is **Access review needs
attention**, its preheader is **Sign in to see current status and available
actions.**, its body is **An access review was assigned to you. Sign in to see
current status and available actions. This email does not grant permission and
does not mean access has changed.**, and its CTA is **Review access
request**. A
responsibility-application generation sends at most one grouped email per newly
admitted recipient with subject **Access review responsibilities updated**, its
immutable initial safe count in body **You were assigned {count} existing access
requests. Sign in to see current status and available actions. This email does
not grant permission or change anyone's access.**, the same preheader, and CTA
**View access requests**. Neither form
contains the holder/requester name, request or decision
explanation, capability, group, provenance, authority evidence, raw identifier,
inline Keep/Remove control, tracking pixel, or rewritten action URL.
Subjects/preheaders never interpolate a Tenant name or aggregate count. The
per-request render-fact set is empty; the aggregate count appears only in its
body. Tenant identity comes from the governed From/layout, not dynamic subject
copy.
The separately confirmed `staff_operations_help` Reply-To provides a humane
support path, but replies leave Core for the Tenant mailbox and can never add a
request comment, change responsibility, or keep/remove access.

Absent/disabled preference, unready tenant email, missing or stale destination,
suppression, source/recipient/auth loss, provider failure, timeout, bounce, or
complaint leaves the required in-product item, Tasks Hub projection, request,
and access untouched. Email delivery/open/click never marks the item read, the
task complete, the request decided, or the holder notified. Tenant On or
recipient `disabled`→`inherit` widening is future-only and never adds an omitted
member or replays current/historical backlog; contact/readiness repair is the
same future-only widening. Tenant Off, recipient `inherit`→`disabled`, or other
source/auth/contact/suppression/readiness narrowing suppresses any not-yet-
submitted optional email, including prepared work, on immediate pre-submission
reproof without mutating/rerendering it. Provider-accepted mail is non-
retractable. A later D44
responsibility-application generation over
existing work is itself a new source occurrence and receives only the one
grouped sibling described above.

The coordinator UI therefore avoids a channel matrix. The one canonical Tenant
editor is **System Messages → Messages → Access review requested → Delivery**;
People & access only exposes **Manage email delivery** as a deep-link. It exposes **Email access request
coordinators**, Off by default, with required in-product locked On, current
Resend readiness/repair, **Personal settings may narrow delivery**, and **0
existing requests will be emailed**. It shows no selected/eligible/preference-
disabled coordinator counts. Turning On requires Ready; later readiness loss
shows **On — email unavailable** without changing the required local item or
silently switching configuration/channel.

The personal route **Settings → Notifications → Access request responsibility**
shows read-only **Effective email**
status and a stable radio choice: **Follow my organization's setting**
(`inherit`, default) or **Off for me** (`disabled`). The effective status is not
bound to the form control and reads **Off by organization**, **On**, **Off for
me**, or **Email unavailable**. A local draft changes only through **Save
changes**, with **Cancel** and durable inline result; Tenant administrators cannot override
**Off for me**. Both surfaces explain the other gate without implying that
enablement guarantees delivery.
**Manage notification preferences** is reserved for the recipient/email-footer
link to that authenticated personal route and is never the Tenant-plan action.
The per-request footer says **This email was prepared because your organization
enabled access request email, you were assigned as an Access request
coordinator, and your personal setting followed the organization's choice.
Manage notification preferences.** The aggregate substitutes **updated its
Access request coordinators** for the assignment clause; only the final label is
linked.

D46 creates no automatic access-request reminder while D43 has no source-owned
temporal requirement. D47 permits a later bounded timing-pair candidate to
become an evidence-qualified Phase 12 proposal, but activates no reminder or UI in
this generation. The complete Access requests source read model remains
available; for each current D44 personal recipient, that recipient's source-
backed task and required in-product item remain durable, while optional D45
initial email stays independent. The UI shows no reminder switch, disabled placeholder,
countdown, due/overdue treatment, or invented urgency. Record age may not be
presented as a deadline or become notification truth. A later reminder requires
one separately ratified source occurrence with exact temporal, cancellation,
recipient-generation, durable-idempotency, fire-time authorization, and
late-usefulness semantics. It is not a resend and may create a new attention
child only while that new source occurrence remains current. Digest and
escalation require later separate decisions. SMS, push, Slack, Microsoft Teams,
Google Chat, and any later channel require their own registered
contract/profile/adapter, current destination/install authority, preferences or
consent, suppression, evidence, and proof-gated plan/compiler schema; none is
implicitly enabled by D45, a generic notification setting, or a Tenant-authored
workflow. When only the transport changes, the reviewed generation adds a
named channel step to the same stable D44 message meaning/source occurrence;
it does not create a channel-specific stable key or another source event. Only
changed business meaning warrants a successor key. Inngest may execute
post-commit materialization or reconciliation,
but neither its run nor one projection's failure/engagement changes the source
occurrence or another projection. If a later reminder uses an Inngest sleep or
scheduled wake-up, the product database still owns the temporal fact, permanent
semantic uniqueness, and cancellation/supersession truth; the resumed worker
must re-read all of them before presenting or dispatching anything.

If the separately proved future feature is activated, one current D43 request
generation may yield at most one reminder source occurrence. A later decision
must define recipient-generation timing, widening/narrowing, zero-member and
routing-change/backfill behavior, and whether/when a distinct reminder item is
required; D47 does not. Any reminder presentation never clones/reopens the
initial item or creates, completes, reprioritizes, or dates the existing source-
backed task. Copy and accessible semantics must say only that review is still
waiting and must not claim Due, Overdue, escalation, guaranteed delivery, or
awareness. D45 initial email permission authorizes no reminder channel, and D47
registers no stable message key or channel step now.

D48 fixes only the first-activation source cohort: a future reminder
presentation may descend only from a D43 request creation that Phase 12 orders
after the first successful non-Off cadence-policy boundary and records as
admitted. A pre-boundary request receives no reminder presentation, legacy or
missed-reminder badge, unread reset, replay, or catch-up item; its existing D44
task and required in-product attention remain unchanged where personally
routed. Read, archive, notification retention, task engagement, route delivery,
Realtime, provider, and worker state can never admit or reclassify a request.
D48 adds no notification key, renderer, item, preference, or UI. D49 recipient
binding, D50 request-anchored elapsed eligibility, and D51 source-fenced Off/
prospective re-enable are now defined; useful-lateness and every presentation/
channel contract remain required before activation.

D49 now requires one source-sealed recipient cohort from the exact then-current
D44 responsibility generation at the reminder occurrence. A presentation
adapter may show an item only to a still-current member of that sealed cohort
after fresh same-Tenant source, assignment, purpose, authorization, and privacy
proof, including a gap-free D44 continuation from the exact sealed recipient-
generation identity and assignment. It may suppress an ended, recreated,
remove-then-readded, unauthorized, requester, or
otherwise ineligible member, but it cannot add the configured route's later
members, query task assignees, reuse another channel's audience, or create a
replacement. Proved zero creates no personal item; indeterminate proof releases
nothing and retries only the same occurrence without fallback.

A coordinator newly responsible before the reminder occurrence may already
have D44's source-backed task and responsibility-update attention and may also
enter the D49 cohort. Those are distinct source meanings; D49 neither merges
their engagement nor invents a second task, urgency state, blame signal, read
transfer, or hidden deduplication rule. Any eventual recipient-facing copy must
remain neutral—review is still waiting and the viewer is currently responsible—
and must not claim the person was previously told, ignored work, is late, or
caused delay. No notification key, item, renderer, preference, telemetry, or UI
is added until the remaining usefulness, presentation, and channel gates are
ratified.

D50 supplies presentation with one product-owned finite UTC not-before instant,
not a display schedule or delivery promise. Phase 12 captures its source-created
instant exactly once after D48's serialized policy winner is proved, derives the
instant from exact code-owned elapsed seconds, and makes those facts
authoritative only with the successful D43 transaction. If a later choice uses
the word “day,” it means exactly 86,400 seconds; calendar or working days,
Tenant/session zones, DST, weekends, holidays, task/notification age, and
executor/provider time cannot reinterpret it. D49 still seals recipients at
the actual successful occurrence commit, which may be later.

Ordinary recipient presentation must say only that a review is still waiting.
It must not show a countdown, Due/Overdue badge, promised delivery timestamp,
business-day claim, delay/fault inference, or internal worker/clock state. The
future source-policy editor may summarize **After the request has been waiting
for [selected interval]**, persist **This does not set a due date or change
access**, and place exact continuous-time/weekend/time-zone/reassignment detail
behind one available, collapsed-by-default **How timing works** disclosure. It
also renders the selected complete pair in plain language, for example:
**Eligible after 7 elapsed days; if it cannot be created within the next 7
days, it is skipped.** It never exposes internal field names. Authorized D42 provenance/audit
views may separately label localized source-created, eligible, sealed, and
provider-submitted instants; those displays never become source inputs.

Phase 17 cannot calculate, reset, schedule, or repair D50 eligibility. Inngest
may wake against the stored product instant, but late/early execution does not
change notification meaning and every presentation remains subject to current
source, recipient, authorization, cancellation, usefulness, and channel proof.
D50 adds no stable key, item, renderer, preference, Delivery Plan step, event,
worker, schema, OpenSpec requirement, migration, UI, or telemetry artifact.

D51 adds a source-owned cancellation ceiling without turning notification state
into cancellation truth. Every later reminder item release must compare the
D48-pinned cancellation epoch with the current Phase 12 epoch before one atomic
role-safe release makes the item queryable. Off-first releases no item. Release-
first means a person may already have seen it; immutable occurrence/history
evidence remains, while the reminder-occurrence applicability end produced by
the Off fence may remove Needs attention and unread contribution and move the
item through its registered Recent-history policy. The unchanged D43 request is
not source-ended, and the adapter never fabricates read, dismissal, deletion,
or a recipient cancellation event.

Cadence Off creates no bell item, toast, email, task, cancellation notification,
unread reset, engagement transfer, or current-work fanout. Non-Off edits and
re-enable apply only to later genuine D43 source creations and never reopen,
clone, re-age, or catch up an old item. Projection cleanup may be asynchronous,
but every query/release path remains bounded by the current source ceiling and
cannot display a stale item as active merely because a worker has not rewritten
a row. D51 adds no message key, item, renderer, preference, publication,
history class, channel, job, schema, OpenSpec, UI, or telemetry artifact now.

D52 adds the independent late-usefulness ceiling. Each admitted D43 request
pins one immutable half-open source interval `[not_before, useful_until)` from
its complete code-owned timing profile. A reminder item can become queryable
only when its fresh trusted primary-database release claim is inside that
interval and every D43/D48/D49/D51/current-recipient/authorization/privacy gate
passes. At the exclusive upper boundary, an unreleased item terminally skips;
no later worker, replay, route repair, restore, or re-enable can create it.

The interval ends admission, not truthful presentation history. An item
released inside the interval remains current only while its registered D43
source-applicability rule says so and then follows the ordinary Recent/history
policy. D52 never fabricates read, dismissal, archive, deletion, or failure,
never resets unread state, and never creates a task, cancellation item, missed-
reminder badge, catch-up action, successor occurrence, or recipient-facing
expiry notice. Ordinary UX shows no countdown, `useful_until`, Due/Overdue,
provider/worker state, or terminal-state jargon; the future policy helper says
**If Asym cannot create the reminder soon enough, it skips it instead of sending
it late.** D42-authorized audit may show the exact localized eligibility,
usefulness, release, and terminal-skip evidence. D52 creates no notification
key, item, renderer, preference, publication, history class, schema, OpenSpec,
job, UI, or telemetry artifact now.

D53 keeps the reminder entirely outside presentation truth until an exact
complete pair has passed D47 and then a separate full activation generation.
Before that boundary there is no notification key, publication, item, renderer,
preference, history class, setting card, disabled option, empty state, help
link, beta badge, or “coming soon” affordance. Research evidence is not a
notification source and runtime never reads it. No initial-item engagement,
unread state, grouping, task, or recipient behavior changes merely because a
pair is proposed or evidence-qualified.

After a later activation, the source-policy editor may show only the Tenant's
current effective Off choice—whether represented by absence or an explicit
later policy revision—and fully activated timing profiles; unqualified/unsupported/experimental
values are absent. A retired profile is absent from new choices and new
selection APIs but remains truthfully visible in a separate read-only **Current
setting** summary outside the selectable radio choices wherever a Tenant's
policy head still references it. The editor remains one Base
Maia radio fieldset with concise source meaning, D52 skip-instead-of-late help,
and the required available exact-pair disclosure above. D53 does not decide the later
reminder item's stable key, grouping, content, or channels; D54 settles local
presentation. D53 adds no notification or UI artifact now.

**Phase 24 D54 clarification (2026-08-29).** A future fully activated courtesy
occurrence uses one new recipient-specific in-product item; it never resends,
retimestamps, reopens, or changes engagement on the initial D44 item and never
creates or mutates the ADR-0183 task. The item has the neutral protected meaning
**this exact access review is still waiting at the admitted courtesy point**, uses
ordinary **Attention** rather than Urgent, and follows
`presentation.source_actionable_then_recent_90d@1`. Safe presentation is
**Access review is still waiting** / **Review this request in People & access.**
The typed action reauthorizes and opens the exact request; list, group, realtime,
and action surfaces expose no holder/requester identity, reason, capability,
group, grant provenance, authority evidence, decision, or sensitive ministry
context.

The item belongs to one deterministic, rebuildable **Access-review attention
group** derived by trusted server code from the exact Tenant, D43 request episode,
recipient Party and Active Tenant Assignment, role/surface, privacy class,
uninterrupted D44 responsibility lineage, and grouping-contract revision. An
eligible matching `holder_access_review_requested_v1` item may be its other child.
The multi-request `access_request_responsibility_updated_v1` aggregate, another
request, another responsibility lineage, another recipient/role/surface/privacy
boundary, or another Tenant can never join. If no eligible initial child exists,
Core shows a complete one-child group and never invents or backfills one.

Children retain independent immutable occurrence, availability, engagement,
applicability, and history. Only the new reminder child may begin unread. The
group stores no independent engagement or source truth: its badge contribution
is the Boolean OR of its currently presentable unread children and therefore at
most one; Needs-attention membership is derived from current actionable children.
Expand/collapse, viewport exposure, sorting, and realtime invalidation do not mark
anything read. Any explicit group read operation must resolve to idempotent item-
level writes against an expected visible-child set, so a concurrently arriving
child remains unread or produces a truthful stale result. Selecting the
reminder's exact authenticated Review action may idempotently mark only that
reminder child read; lost-response recovery reconciles the same engagement write
and never clears a sibling, group, task, source, peer, or external channel.

First release is one atomic, fail-closed boundary that re-proves the D43 current
head, D48 admission, exact D49 sealed member and uninterrupted D44 continuation,
D51 cancellation epoch, D52 half-open usefulness interval, current same-Tenant
authorization/privacy/source visibility, stable semantic identity, uniqueness,
and valid group attachment. A failed attachment cannot publish an orphan item;
replay uses the same durable business identity and may retry only while still
useful. D43 resolution ends applicable initial and reminder attention under each
child's own lifecycle. D51 Off after release ends only the reminder child's active
and unread contribution; it does not end or rewrite the still-source-actionable
initial child. Assignment/authorization loss removes all active/recent reads
immediately and later restoration never revives the old projection.

D54 reuses the existing Phase 17 group/item model and Base Maia/Base UI
primitives; it creates no generic thread/conversation model, group-engagement
table, app-local grouping heuristic, custom keyboard widget, second notification
system, or task feature. Visual grouping and DOM/accessible structure must convey
the same relationship and order; native list/section/heading/disclosure semantics,
visible labels, non-color unread treatment, keyboard/focus behavior, reflow,
forced colors, localization/RTL/CJK, mobile touch, reduced motion, and low-
bandwidth completeness are release gates. Arrival is quiet: no focus theft,
auto-open, modal, toast-only history, sound, vibration, or assertive announcement.

D54 is documentation only. Under D53 there is still no reminder key, manifest or
census row, profile, item, group, preference, renderer, schema/RLS migration,
OpenSpec requirement, route, worker, telemetry, or UI. The later complete
activation package must register the key and exact source/end/grouping contracts
together; D54 neither names nor reserves it now.

**Phase 24 D55 clarification (2026-08-29).** The future reminder's exact source-
end rule must include the irreversible safety withdrawal of its pinned timing-
profile revision. Fence-first releases no item. If local release committed
first, withdrawal immediately removes that reminder child's active and unread
contribution without fabricating read, archive, dismissal, deletion, request
resolution, task completion, recipient awareness, or access change. The still-
pending D43 request and its initial D44 child remain governed by their own
source rules; the Access-review attention group simply derives its remaining
authorized children and one-count badge.

A lawfully released reminder may remain only as authorized, non-unread Recent
history under its registered ceiling, still-safe decoder/renderer/privacy
contract, and a generic **No longer active** presentation. If the incident also
implicates a shared renderer, content, or privacy boundary, that owning Phase 17
safety control may suppress presentation separately; a timing-profile fence
does not pretend to contain another defect class. Exact safety cause, evidence,
actor, and incident detail do not enter recipient list/search/realtime/cache/
accessibility text; they remain in the separately authorized platform decision/
audit and the Tenant settings' minimal safe status. A reminder resolved before
first view creates no unread debt or fake engagement. Purge, group rebuild,
retry, restoration, a successor profile, or later Tenant selection can never
revive the old item.

D55 creates no withdrawal notification, task, banner, toast, email, or per-
Tenant fanout. The settings surface—not Notification Center engagement—owns the
safe selected-versus-effective explanation for authorized policy managers.
D55 is documentation only and adds no item key, source-end registration,
presentation state, group behavior, renderer, schema, OpenSpec requirement,
worker, telemetry, or UI now.

The current staff bell component at
`packages/ui/components/shadcn-studio/blocks/dropdown-notification.tsx` is
hardcoded demo presentation (`8 New`, fake avatars, and fake actions) wired into
`apps/admin/app/mc-shell.tsx`; it is not the Phase 17 notification authority or
a D44 implementation precedent. Current contribution-approval notifications,
which rely on contribution-domain tables/preferences and profile/role checks,
copy domain payloads and synchronously attempt email from `profiles.email`, are
also migration inputs rather than D44/D45 schema, authorization, recipient,
destination, or delivery truth. Support Hub's separate agent preference row
likewise remains Support-owned; its default-on assignment email and daily-
digest fields cannot become global System Messages settings.

## Consequences

- Notification rows and APIs require exact tenant/Party/role predicates and
  server-side source-visibility reproof.
- Grouping reduces noise but preserves item-level provenance and actionable
  state transitions.
- Permission loss, source restriction, Party merge, role change, and tenant
  transfer revoke visibility without rewriting audit evidence.
- The seven initial Live in-product keys declare their exact policy and source-
  end rule in the executable manifest; any future key must do the same. This is
  two policies and key-specific predicates, not a generic retention/rules engine.
- D44 cannot activate until `holder_access_review_requested_v1` and
  `access_request_responsibility_updated_v1` are added to that executable
  manifest with the exact recipient, applicability/end, safe-field, deep-link,
  coalescing, and authorization contracts above.
- D45 leaves both in-product items required and enables email only through the
  separately compiled, Tenant-default-Off optional step plus recipient
  `inherit | disabled` narrowing. Local and
  external availability, engagement, delivery, and failure remain independent.
- Future channels extend the closed Delivery Plan compiler through reviewed
  registered contracts; they never appear automatically as generic preference
  columns, webhook destinations, or a rules DSL.
- D52 prevents any post-expiry first release while preserving a release that
  won inside the source interval under the item's existing D43 applicability
  and Recent/history rules; source usefulness never fabricates engagement.
- D53 keeps research candidates and unavailable timing profiles wholly absent
  from Notification Center and settings, preventing placeholder noise and
  accidental presentation contracts.
- D54 permits honest new local attention without duplicate work: one distinct
  child may reopen the narrow request group, while initial-item engagement and
  the one source-backed task remain unchanged. The D44 responsibility-update
  aggregate never becomes a per-request thread.
- D55 ends only an already released reminder child's active/unread contribution
  when its exact profile revision is safety-withdrawn; it preserves the initial
  child, item-level history, and every source/task/access boundary.
- Query paths enforce presentation ceilings before purge completion; purge
  removes preview/search material while independently governed body-free audit
  remains.
- Accessibility, keyboard, screen-reader, non-color state, mobile, pagination,
  grouping, race, and isolation tests are release blockers.

## Related decisions

- [ADR-0054 — Cause-owned accounting exceptions with shared follow-up](./0054-cause-owned-accounting-exceptions-with-shared-follow-up.md)
- [ADR-0183 — Source-owned work projects into one shared Tasks Hub](./0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
- [Phase 24 D45 adversarial review](../prds/sitestacker-parity/phase-24-d45-optional-initial-email-adversarial-review.md)
- [Phase 24 D45 primary research](../prds/sitestacker-parity/phase-24-d45-optional-initial-email-primary-research.md)
- [Phase 24 D46 adversarial review](../prds/sitestacker-parity/phase-24-d46-no-automatic-reminder-adversarial-review.md)
- [Phase 24 D46 primary research](../prds/sitestacker-parity/phase-24-d46-no-automatic-reminder-primary-research.md)
- [Phase 24 D47 adversarial review](../prds/sitestacker-parity/phase-24-d47-bounded-tenant-reminder-cadence-adversarial-review.md)
- [Phase 24 D47 primary research](../prds/sitestacker-parity/phase-24-d47-bounded-tenant-reminder-cadence-primary-research.md)
- [Phase 24 D48 adversarial review](../prds/sitestacker-parity/phase-24-d48-new-request-only-cadence-application-adversarial-review.md)
- [Phase 24 D48 primary research](../prds/sitestacker-parity/phase-24-d48-new-request-only-cadence-application-primary-research.md)
- [Phase 24 D49 adversarial review](../prds/sitestacker-parity/phase-24-d49-current-recipient-cohort-adversarial-review.md)
- [Phase 24 D49 primary research](../prds/sitestacker-parity/phase-24-d49-current-recipient-cohort-primary-research.md)
- [Phase 24 D50 adversarial review](../prds/sitestacker-parity/phase-24-d50-request-anchored-elapsed-clock-adversarial-review.md)
- [Phase 24 D50 primary research](../prds/sitestacker-parity/phase-24-d50-request-anchored-elapsed-clock-primary-research.md)
- [Phase 24 D51 adversarial review](../prds/sitestacker-parity/phase-24-d51-immediate-irreversible-narrowing-adversarial-review.md)
- [Phase 24 D51 primary research](../prds/sitestacker-parity/phase-24-d51-immediate-irreversible-narrowing-primary-research.md)
- [Phase 24 D52 adversarial review](../prds/sitestacker-parity/phase-24-d52-bounded-usefulness-window-adversarial-review.md)
- [Phase 24 D52 primary research](../prds/sitestacker-parity/phase-24-d52-bounded-usefulness-window-primary-research.md)
- [Phase 24 D53 adversarial review](../prds/sitestacker-parity/phase-24-d53-evidence-admitted-complete-timing-profile-adversarial-review.md)
- [Phase 24 D53 primary research](../prds/sitestacker-parity/phase-24-d53-evidence-admitted-complete-timing-profile-primary-research.md)
- [Phase 24 D54 adversarial review](../prds/sitestacker-parity/phase-24-d54-distinct-grouped-reminder-presentation-adversarial-review.md)
- [Phase 24 D54 primary research](../prds/sitestacker-parity/phase-24-d54-distinct-grouped-reminder-presentation-primary-research.md)
- [Phase 24 D55 adversarial review](../prds/sitestacker-parity/phase-24-d55-monotonic-profile-safety-fence-adversarial-review.md)
- [Phase 24 D55 primary research](../prds/sitestacker-parity/phase-24-d55-monotonic-profile-safety-fence-primary-research.md)
