# Phase 24 D13 — Authorized Giving Placement Convergence Adversarial UX Review

> **Status:** Completed `/grill-with-docs` decision evidence for D13. This is
> not a Phase 24 PRD, OpenSpec change, implementation plan, migration
> authorization, or ticket specification.
>
> **Founder choice:** Option 1. After one permission-filtered impact preview,
> Core prepares eligible Giving-address updates only through an accepted source
> contract the actor is authorized to use. Remaining places show the required
> source owner; Core routes a request only where a verified owner queue exists.
> It never bypasses source permissions or rewrites frozen, sent, downloaded,
> printed, external, or deliberately literal links.
>
> **Review date:** 2026-08-27
>
> **Later D14 clarification:** A managed placement may target only an
> Exact-locale Giving Address with the same stable Site Locale and Giving-entry
> meaning. Similar language, default locale, title, slug, or browser preference
> never makes a cross-locale target compatible.

## Final disposition

**Accept with required amendments.**

Option 1 is the strongest permanent staff experience. It turns a repetitive
cleanup chore into clear system behavior without giving the Giving domain a
content-editor, publisher, or sender superpower. Staff receive one calm review,
Core prepares only work that the current actor and source owner permit, and
every remaining visible item shows the exact source owner needed. Where that
source has an accepted collaboration contract and verified queue, Core routes
one grouped request; otherwise it says the source is unavailable or which
owner is needed without pretending to send work.

The unamended sentence is unsafe. “Prepare authorized updates and route the
rest” could be implemented as a global text replacement, a broad service-role
write, a generic task generator, an auto-publish shortcut, or a claim that
every link changed. It also fails to define active drafts, approved or
scheduled communications, permission loss, partial success, repeated events,
the A→B→C preference race, or a Stop that happens during publication.

The corrected decision therefore requires all of the following:

- only typed, structured Core-managed Giving placements qualify for automatic
  preparation;
- Giving publishes one immutable preference-change occurrence and never writes
  Page or Communications content;
- each activated source owner creates a private successor through its one
  accepted version, review, approval, publication, or send path; unsupported
  sources remain not changed by Core;
- current read, edit, submit, review, publish, and send authority are separate
  and re-proved at their own effects;
- a draft with active or conflicting work is not silently changed;
- approved, frozen, scheduled, prepared, sent, downloaded, printed, external,
  and deliberately literal artifacts are not mutated;
- every proposed change pins the exact source revision, placement, Giving
  address generation, and Preferred-head revision;
- cross-owner preparation reports honest itemized outcomes and never pretends
  to be one atomic publication;
- privacy-safe source routing never reveals hidden content or invents an
  approver; and
- a source-owned publication/send command rejects an unavailable or stopped
  target and refreshes stale editable work without altering frozen history.

In plain language: **Core does the safe preparation work; the people and
workflows that already own the website or message remain in control.**

## Evidence labels

- **Repository fact** — merged OpenSpec or an accepted ADR on `develop`.
- **Current behavior** — code or schema on `develop`; evidence of what ships,
  not permanent authority.
- **Proposed evidence** — founder-ratified material in open PR #1323 or #1340;
  informative but unmerged.
- **External fact** — current official standard, design-system, or vendor
  documentation.
- **Product judgment** — a deliberate Core choice synthesized from the above.
- **Assumption** — a claim still requiring representative-user or
  production-shaped proof.

## Staff jobs to be done

### Primary job

> When I make a clearer Giving address preferred, show me where Core can safely
> use it, do the preparation I am allowed to do, and get the rest to the right
> people without making me chase every page and message.

### Content-owner job

> When a Giving-link update reaches my Page—or a separately accepted and
> activated Communications source—show the exact old and proposed address in
> the source outcome I own, preserve other work and approvals, and let me use
> the same source-owned review or publish flow I know.

### Assurance job

> When Core finishes, tell me exactly what was prepared, what still needs an
> owner, what intentionally stayed unchanged, and what Core could not check—
> without claiming that sent emails, printed QR codes, or external sites were
> rewritten.

The product teaches one mental model: **Preferred guides new sharing; Core may
prepare new source-owned versions; only that source's normal authority can
publish or send them.**

## Corrected D13 decision — normative language

These clauses replace the provisional D13 wording and MUST flow into the Phase
24 PRD, reconciled ADRs, OpenSpec scenarios, design, implementation tickets,
tests, and release evidence only after the founder separately invokes the
repository's specification workflow.

### D13-R1 — Scope is narrow and effects remain separate

D13 applies only after a committed Preferred Giving Address change and only to
known Core-managed placements that currently present an earlier issued/current
address for the same exact Tenant, environment, Site, and Giving-entry meaning.
Each placement remains scoped to its exact source locale; the target address
must be an Exact-locale Giving Address with the same stable Site Locale. D14
resolved address identity as independently issued and exact-locale.

D13 MUST NOT issue, prefer, stop, redirect, revive, reinterpret, or reassign an
address; change a Page Giving Binding, Designation, gift, recurring commitment,
Source Code, Legal Entity, Stripe account, settlement, bank, currency, receipt,
or accounting identity; publish a Page; approve or send a communication; alter
external content; or block a later address Stop.

Replacement remains nonurgent while the older address is issued/current and
opens the same page. A later unavailable or terminal state creates one
source-owned repair path; it never causes fallback or automatic substitution
inside a frozen artifact.

### D13-R2 — Only structured managed placements are eligible

A **Core-managed Giving placement** is a source-owned structured placement in
governed Core presentation or communication that intentionally presents an
Issued Giving Address or stable Giving reference. It has one stable
source-owned placement identity and belongs to one exact Page, navigation,
communication, QR definition, or other registered source resource and version.

Every placement MUST structurally reference the exact Giving-entry identity,
directly or through one same-scope binding. The source command proves Tenant,
environment, Site, placement locale, Giving entry, D14 exact-locale target
equality, Page Giving Binding where applicable, and Designation
consistency. It never infers Giving entry from Designation, title, Page, URL
text, current Preferred address, or similarity.

Automatic preparation MUST use that typed identity and reference. Full-text,
HTML, Markdown, Lexical JSON, serialized email, rendered output, logs,
analytics, URL crawls, regular expressions, or provider search MUST NOT become
mutation authority. A deliberately pasted literal URL remains literal. It may
be shown to an authorized owner for optional manual review, but Core never
silently converts it into a managed reference or rewrites it.

Sent messages, downloaded or printed QR files, exports, screenshots,
bookmarks, forwarded copies, browser history, third-party pages, provider
dashboards, and content outside Core are evidence or independent copies—not
mutable Core-managed placements.

### D13-R3 — Giving emits an occurrence; source owners perform all writes

Giving owns the immutable occurrence that preference changed. The occurrence
contains only trusted opaque scope, old/new address generation, Preferred-head
revision, command identity, and server time needed by registered source
adapters. It carries no content body, recipient list, arbitrary source ID,
approver selection, or mutation payload.

Every Page, navigation, Communications, QR-definition, or future placement
owner independently decides whether one exact placement is visible,
reference-managed, editable, and eligible. Only that owner's typed server
command may create a private successor version or owner review. Giving code,
an outbox worker, an assistant, a global administrator, Payload
`overrideAccess: true`, a Supabase service key, raw SQL, or a generic job MUST
NOT write through or bypass the owning command.

The integration is reference-not-copy: source content stores the stable
operational reference plus presentation, while Giving retains address and
preference truth. No cross-schema foreign key, mirrored address truth, or
two-way synchronization engine is created.

A human-initiated **Prepare** action may call only the source's actor port under
that human's current capability and trusted exact scope. A service principal
may act only for a separately ratified noninteractive source occurrence through
a purpose-specific registered service-command port. That port is incapable of
serving a user-initiated request, accepts no requester-selected scope, and can
never launder missing human edit, review, publication, or send authority.

### D13-R4 — One capability-filtered impact preview sets expectations

The replacement receipt offers one secondary action, **Review places to
update**. It first reassures staff: **Your previous Core address still opens
the same Giving page. These updates are for clearer future sharing.** Staff may
leave safely and resume from the address detail later.

The preview is private, no-store, capability-filtered, non-enumerating, and
scoped to the exact Tenant, environment, Site, placement locale, and Giving
entry, with D14 exact-locale target equality. It groups only currently visible
evidence into:

1. **Ready to prepare** — a typed placement for which the actor and source
   owner currently permit creation of the exact private successor;
2. **Needs an authorized owner** — visible enough to name safely, but the
   current actor cannot create the required source version or approval;
3. **Not changed by Core** — approved/frozen, sent, downloaded, printed,
   external, deliberately literal, or otherwise immutable evidence; and
4. **Could not be checked** — an explicitly incomplete or stale source adapter,
   never silently counted as safe, complete, or unchanged.

The preview MUST NOT reveal an inaccessible object, hidden draft, recipient,
restricted missionary/person, owner identity, count, route, title, or workflow
state. If excluded work may exist, the UI says **You are seeing only places you
have permission to view**; it never presents a false global total.

### D13-R5 — “Prepare” creates private source work, never public effect

The primary action is **Prepare authorized updates**, with the visible eligible
count in its accessible name. **Not now** is always safe. The action creates or
resumes only source-owned private successor work using the old placement and
new preferred address shown in the preview. For a reference-backed Page or
Navigation placement this is a private publication candidate/dependency
successor, not an authored content rewrite. It does not publish, approve,
schedule, send, stop the old address, or mark another owner's work complete.

The review states every effect before confirmation, for example: **This will
prepare 3 private placement updates in 1 website update and request 1 owner
review.** If the ready count is zero but one or more accepted owner queues can
receive work, the primary action becomes **Request N owner reviews**. If neither
preparation nor routing is currently possible, Core shows no disabled or zero-
count Prepare button; the best available **Retry check**, **Copy preferred
address**, **Download update checklist**, **Done**, or **Back** action leads.
The command creates no hidden request that the consequence summary omitted.

The button MUST NOT be labelled **Update all links**, **Fix everything**,
**Publish**, or **Send**. Eligible reference-backed placements need no
per-item checkbox: their managed meaning is to follow the deliberately chosen
preferred address in the next source-owned outcome—one Page/Navigation
publication candidate or, where separately qualified, one Communications
version. Staff can defer the whole operation or open a source item;
deliberately fixed URLs stay literal by definition.

If the initiating actor also owns the source's normal submit/review/release
action, the later source-owned step may be presented immediately. D13 itself
never manufactures or collapses that authority. A tenant's existing
**Publish after checks** profile remains allowed; **Review before publishing**
remains required where selected.

### D13-R6 — Existing drafts and active work are preserved

When preparation must change an editable authored source version, the source
adapter may act automatically only when its exact semantic placement command
can append from and compare-and-swap the current coherent source head without
overwriting unrelated work, changing authorship, or bypassing an active editor
lease, candidate, review, schedule, or approval.

Reference-backed Page/Navigation convergence does not modify the authored
Working Revision. It prepares from the exact current public generation and
reuses unchanged reviewed content/dependencies. A newer private Working
Revision remains private and excluded; the Page card says **Later draft not
included** and links to it where permitted. Its active editor lease neither
authorizes nor blocks the separate dependency-only publication candidate. Only
a deliberate authored presentation change creates a new Page/Navigation
Working Revision.

When current unpublished work, an active editor, a submitted candidate, a
pending approval, a schedule, an incompatible locale version, or a changed
source head makes that proof unavailable, D13 creates no hidden branch and no
last-write-wins patch. The item becomes **Content changed · Review latest** or
**Already in review · Unchanged**, and opens the exact source-owned version and
placement. Existing Page attribution, contributor authorship, message author,
diff, comments, decisions, and working content remain intact.

There is no parallel D13 draft table, per-placement branch, automatic merge,
CRDT, universal source chooser, or destructive restore.

### D13-R7 — Page and Communications workflows remain singular

For a reference-backed Page or Navigation placement, authored content remains
unchanged. Preparation creates an attributed private publication candidate
that reuses the stable Giving reference, pins the exact target address
generation, exact reviewed source revision, and complete dependency closure,
and excludes later private drafts. Every Page/Navigation placement admitted to
one exact actor/source-authorized work package closes into one complete
successor Public Site Generation for its Tenant × environment × Site × locale
and one compare-and-swap serving-head transition. Placements outside that
actor/source scope remain structurally unchanged and may receive a separate
non-enumerating source-owned attention path; they are never smuggled into the
actor's command. Unchanged Pages are structurally reused and need no fabricated
content review. The current generation remains live if preparation, review, or
activation fails.

When authored presentation itself changes, the ordinary Page/Navigation
Working Revision and candidate/release contract applies. D13 never creates that
revision merely because preference changed.

For a communication placement, preparation creates a new editable message or
publication version only before the source's freeze boundary. An approved,
scheduled, prepared-delivery, provider-submitted, sent, or historical message
never changes in place. Changing one requires the Communications owner to make
a deliberate successor, repeat any required review, and reschedule or send it
under the ordinary communication contract.

A scheduled Page or communication publication pins its exact reviewed revision
and dependency closure. D13 never rebases or mutates that appointment.
Replacement creates an unscheduled successor unless an authorized source owner
explicitly replaces or cancels the appointment and repeats required review. A
stopped target blocks release/send rather than falling back.

No Communications/newsletter adapter exists by implication. A source family
activates only after an accepted typed authoring, version, freeze, approval,
publication/send, idempotency, and recovery contract exists for that exact
family. Current System Message authority MUST NOT be stretched into newsletter
authority. Until qualified, such items are **Source not available · Not changed
by Core**.

A generated QR definition may prepare a future Core-managed QR version only
under its source owner. A previously downloaded or printed QR file never
changes. No Page task can approve Communications work and no Communications
task can publish a Page.

### D13-R8 — Routing goes to source authority, not an invented approver

When the initiator lacks the exact source action, the source adapter first
creates a source-owned attention state and exact deep link. It MAY create one
privacy-minimized, deduplicated owner work package only when an accepted typed
collaboration/queue contract already exists for that source. The package groups
the same source owner × Tenant/environment/Site/locale × cause × target/
Preferred revision where that owner's ordinary workflow permits; each item
keeps its exact resource/version/placement identity, and the source splits work
only at a real review/release boundary. It derives the eligible owner team or
queue from current source policy; the initiator cannot choose an arbitrary
person, role name, prior author, last editor, relationship, email address, or
approver. Current generic Mission Control task infrastructure MUST NOT be reused
for D13.

The request contains an opaque source link, safe object label where permitted,
old/new address references or display values only where the recipient has
separate display authority, expected source and Preferred revisions, reason,
and source-owned next action. It copies no draft body, recipients, private
notes, raw URL, or hidden metadata into a generic Giving task.

Possessing, receiving, assigning, acknowledging, commenting on, dismissing, or
completing a request grants no read, edit, review, publish, send, Giving, or
financial authority. If no currently eligible owner or queue exists, the UI
says **A Website publisher is needed** or **A Communications reviewer is
needed** and records an operator-visible routing exception; it does not guess.

At most one active owner work package/item exists per logical placement
lineage, cause, target address generation, and Preferred revision. A source-
version advance appends a stale/superseded outcome and moves the existing
attention to the current exact version; it does not create another active
notification. Each action receipt still pins the exact source version it
observed. Repeated events or clicks return the same package/item/receipt; they
never create one task or notification per retry.

### D13-R9 — Immutable and external artifacts are described honestly

Core MUST label frozen, sent, downloaded, printed, external, and literal
evidence **Not changed by Core**. Staff may receive **Copy preferred address**,
**Download update checklist**, or an exact owner link; Core never claims the
artifact was found everywhere, repaired, revoked, recalled, delivered,
reprinted, or read.

The checklist is generated from the actor's current visible evidence, carries
a clear generated-at time and coverage statement, contains only fields the
actor may display/export, and is not mutation or completion authority. An
empty list means only **No additional Core-managed places are visible to you**,
not that no external, printed, sent, or hidden copy exists.

### D13-R10 — Every proposal and frozen artifact pins exact meaning

Every prepared source successor binds:

- exact Tenant, environment, Site, placement locale, Giving entry, D14
  exact-locale target equality, source kind, source object, and stable
  placement identity;
- expected source working-head/version and relevant authorization epoch;
- old address identity/generation and exact target address
  identity/generation;
- expected Preferred-head revision;
- exact source-owned content/dependency source and digest plus semantic
  dependency-delta or content-patch digest, as applicable;
- actual actor or governed source-service principal and authority path;
- semantic idempotency identity; and
- created, stale, superseded, reviewed, approved, published/sent, rejected, or
  failed outcome evidence as owned by the source.

Editable/unapproved work must still match the current Preferred head at each
prepare, submit, approval, and publish/send boundary. Approved/frozen work keeps
the exact owner-approved address snapshot; a later preference change does not
silently rewrite it. The source still rechecks that frozen address is
issued/current and presentation-eligible before new public release or external
send.

### D13-R11 — Authorization is current, independent, and server-derived

Preview read, address display/export, source read, Page publication-candidate
preparation, qualified-source editable-version creation, submission, review,
approval, publication, scheduling, send, task routing, and audit access are
separate current decisions. Every boundary re-proves actual
principal, active Tenant assignment, Tenant, environment, Site, locale, source
object/version, placement, purpose, capability, authorization epoch, safety
ceiling, and lifecycle from trusted server context.

Caller-supplied tenant, actor, owner, author, approver, recipient, capability,
scope, old/new URL, source ID, or service-role claim is untrusted. An allowed
update cannot move a source object, proposal, request, receipt, or placement to
another Tenant/Site/locale/source scope.

An Assistant may explain, discover within the user's read scope, and prepare
only the private work that the initiating human may prepare. Publication and
donor-facing send retain the same explicit human/source gate and attribution
as direct use. Super-admin or provider status never substitutes for the exact
source capability.

### D13-R12 — Database, RLS, and views make cross-scope state impossible

D13 SHOULD add no universal mutable placement/proposal authority. Source-owned
versions and requests remain canonical. If an operational occurrence, receipt,
dedupe record, or rebuildable convergence projection is required, every row
MUST carry a closed exact-scope tuple and typed registered source kind. Parent
and child relations use same-scope composite keys; polymorphic free-text IDs
without registry validation are forbidden.

Tenant/API-visible tables require explicit least-privilege grants, enabled RLS,
`SELECT`/`DELETE` policies using `USING`, `INSERT` policies using `WITH CHECK`,
and `UPDATE` policies using both, plus immutable scope columns, security-invoker
views, and direct-route tests. `FORCE ROW LEVEL SECURITY` is required anywhere
a table-owner execution path could otherwise bypass the user-context policy;
any justified service-only bypass stays inside the registered source-command
port and is tested separately. Append-only occurrence, receipt, and audit rows
expose no direct `UPDATE`/`DELETE` grant or policy and cannot move scope.
Service-only rows deny `anon` and `authenticated`; service commands still
require exact trusted scope predicates and never treat service role as business
authority.

Any `SECURITY DEFINER` function uses schema-qualified objects, an empty pinned
`search_path`, revoked default/`PUBLIC` execute, explicit least-privilege
grantees, trusted server-derived actor/scope, and no caller-selected dynamic
relation or scope. Table-owner, `BYPASSRLS`, service-role, support, worker,
import, forged JWT/metadata, definer-function/RPC, view, direct Data API, and
direct-SQL poison tests MUST prove that no privileged mechanism becomes source
business authority or crosses scope.

Unique constraints enforce semantic idempotency for each exact source outcome
and at most one active owner item for the logical placement lineage/cause/
target/preference grain across source-version advances. Foreign-key delete
behavior preserves required history or deliberately removes a
rebuildable projection; it cannot cascade-delete source releases, sent
communications, Giving allocations, or financial history.

### D13-R13 — Preference, Stop, publication, and retry races are explicit

For A→B→C, any editable/unapproved A→B proposal becomes stale or is
idempotently superseded when C becomes preferred before its next source effect.
The owner sees **Preferred address changed · Review latest** and the exact C
proposal; Core never publishes B merely because B still opens.

An already approved/frozen B artifact stays byte/content-identical after C and
may proceed only if the owner-approved snapshot remains issued/current and all
source send/release checks pass. It is labelled **Approved with previous
preferred address**; a new C version is a deliberate successor.

If a new source publication/send wins before B is stopped, it may lawfully
emit B while B is current. A later Stop leaves the immutable source/version
history intact and immediately creates a source-owned broken-placement repair
condition; Stop never waits for cleanup. If Stop wins first, every not-yet-
public/not-yet-submitted source command rejects or refreshes and MUST NOT emit
the stopped address. An in-flight ambiguous send remains governed by the
Communications prepared-message/provider reconciliation contract, never by a
blind D13 retry.

Duplicate clicks, events, jobs, webhooks, timeouts, lost responses, and
complete-transaction retries return the same durable business outcome. A new
semantic target requires a new idempotency identity; a reused key with changed
meaning rejects.

### D13-R14 — Partial success and projection failure remain truthful

Cross-owner preparation is not one database transaction. The coordinator
records one durable resumable command receipt with itemized source outcomes:
**Prepared**, **Owner review requested**, **Not changed by Core**, **Stale —
review latest**, **Could not be checked**, or **Failed safely**. It never says
**All links updated** unless every item in a separately defined, fully visible
closed set has source-owned public/send proof—which ordinary D13 does not
attempt.

Retry targets only failed or unresolved items with the same semantic identity.
A lost response first inspects the source receipt; it does not create another
version or request. One source adapter outage does not roll back successful
source versions or block Giving preference/Stop. The last known-good public
Page/message remains unchanged.

The convergence view is a rebuildable, permission-filtered read model over
Giving occurrences and source-owned facts/receipts. Missing, stale,
contradictory, rebuilding, or unavailable evidence shows **Could not be
checked** with a verification time; it never becomes zero, green, complete, or
authorization.

### D13-R15 — Privacy, logs, notifications, and retention are minimized

Impact preview, task routing, exports, caches, audit, logs, traces, metrics, and
error handling MUST exclude content bodies, recipient identities, private
drafts, restricted person identity/location, full URLs when display authority
is absent, query strings/fragments, protected tokens, provider payloads,
secrets, raw errors, IP addresses, and user agents unless another owner has a
documented exact need and retention basis.

Safe labels, opaque references, typed outcome, actor/authority reference,
source/preference generations, timestamps, and digests are retained only for
their owner-defined integrity, audit, routing, or recovery purpose. Technical
logs are not durable business history. Every read of a receipt or task
reauthorizes current membership and field capability; revoked access does not
rewrite historical attribution but reveals no further content.

Notifications follow material responsibility transitions, not every retry or
placement. The quiet in-product source queue is default. At most one
deduplicated notice occurs when an eligible owner's action first becomes
necessary, materially changes, or becomes urgent because a target stopped.

### D13-R16 — Discovery and preparation are bounded and operable

Source owners maintain indexed typed placement references or bounded adapters;
D13 MUST NOT perform request-time full-content scans, provider calls, N+1
cross-store reads, or an unbounded all-Tenant sweep. The preview uses bounded
cursor pagination and set-based/source-batched reads. Work beyond the
interactive budget continues as one tracked resumable operation while staff
may leave safely.

Before launch, a real data census MUST publish the supported placements per
source item, items per operation, concurrency, source rate, payload, and
retention limits plus p50/p95/p99 preview and preparation results on a
production-shaped multi-Tenant fixture. No speculative product limit is frozen
in this grooming decision. The interactive summary target is p95 at most two
seconds and p99 at most four seconds under the repository's qualified mobile/
weak-network profile; longer discovery becomes asynchronous and reports
progress without losing the receipt.

Queues are partitioned by Tenant and source with bounded concurrency, jittered
backoff, dead-letter recovery, and fairness so one large Tenant or source
outage cannot starve others. Reconciliation is checkpointed and source-owned;
manual SQL/provider repair is not an ordinary workflow.

### D13-R17 — The interface is calm, accessible, and consistent with Core

The experience uses Core's shared PageShell, Base UI `base-maia` primitives,
Maia/Zinc semantic tokens, typography, spacing, status icons plus text, and
responsive summary cards. It has one obvious primary action, no dense provider
table, no modal tour, no novelty animation, no color-only meaning, no
auto-dismissed outcome, and no confetti.

At 320 CSS pixels and 400% zoom, the same route reflows without horizontal
dependency; touch targets are at least 24×24 CSS pixels and important actions
target the stronger shared control size. Keyboard order follows visual and
semantic order. Progress and outcomes use polite programmatic status; errors
have a focused summary plus linked inline explanations; focus changes only for
navigation or a user-opened dialog. The experience remains usable with no
JavaScript where the source command permits, weak/interrupted networks, RTL,
native-script labels, long international names, bidirectionally isolated URLs,
forced colors, and reduced motion.

Time is shown as local absolute date/time plus zone, with relative time only as
support. Copy says what happened and what happens next: **3 updates prepared**,
not **Migration job succeeded**.

### D13-R18 — Rollout is additive, source-by-source, and reversible

D13 cannot activate against current broad Payload staff access or the current
generic Mission Control task tables as if they proved Page/Communications
authority. Activation waits for the applicable source's version, capability,
review/release, trusted service-command, and exact-scope proof.

Newsletter/marketing Communications remain unavailable until their separately
owned authoring/version/freeze/send contract ships; Phase 17 System Messages do
not fill that gap.

Initial rollout order is: typed inventory in read-only shadow; capability-
filtered preview; Page private publication-candidate preparation; Page review/
release proof; Page source-attention routing; reconciliation and monitors; then
broader Page cohorts. Every additional source family—including
Communications—qualifies independently through its own accepted contract before
its adapter activates; Page rollout never waits for an unsupported source.
Each source adapter has an independent kill switch that stops new preparation/
routing while leaving Giving addresses and prior source truth untouched.

Migration may recognize only structurally proved typed references. Literal or
ambiguous legacy links remain manual evidence with **Unknown origin** where
needed; migrations never fabricate author, owner, approval, preferred
revision, placement identity, or completion. Old code may ignore additive
occurrences/receipts; new code must tolerate absent adapters and mixed-version
deployments. Rollback disables preparation and rolls forward any already-
created private source work; it never deletes history or reverts public/sent
truth.

D13 explicitly does not build a general workflow engine, universal task
product, content search-and-replace service, cross-source transaction, new CMS
branch model, AI publisher, provider crawler, link shortener, redirect service,
external-site editor, QR recall mechanism, or second Page/Communications audit,
approval, publication, or send authority.

## Complete staff journey

### 1. Start from the completed address change

The success page keeps the primary success message and reassurance from D12:

> **New preferred address published**  
> Your previous Core address still opens the same Giving page.

The primary next action is **Copy preferred address**. A visually quieter section
below it says:

> **Use this address in Core-managed pages and messages**  
> We can prepare updates where you have permission and show which remaining
> places need a website or communications owner. Where an approved owner queue
> exists, Core can send one review request. Sent emails, downloaded QR codes,
> and external sites will not change.

Actions: **Review places to update** and **Not now**. This avoids hijacking the
successful replacement journey or implying urgency.

### 2. Review one honest impact summary

The review page is titled **Prepare Giving-link updates**. Its
scope line shows Site, locale, and Giving purpose, not Legal Entity or Stripe.
When permitted, a compact before/after card shows the old and preferred full
addresses; otherwise it uses safe labels and opaque references.

The summary reads, for example:

```text
Ready to prepare                         3
Needs an authorized owner               1
Not changed by Core                     4
Could not be checked                    0

[ Prepare 3 authorized updates ]  [ Not now ]

This will prepare 3 private placement updates in 1 website update and request
1 website-owner review.
```

With no ready placements, a verified routable owner need changes the action to
**Request N owner reviews**. With neither preparable nor routable work, the page
omits the disabled/zero action and leads with the useful available action—retry
an incomplete check, copy the preferred address, download the checklist, or
finish.

Each group expands into responsive cards, not a spreadsheet. A card answers:

- what content is affected;
- which owning surface controls it;
- what visitors/recipients currently receive;
- what Core proposes;
- why it is in this group;
- who acts next; and
- the exact next action.

Hidden work is absent, including its count. A persistent note says **You are
seeing only places you have permission to view**.

### 3. Let the system do only the safe preparation

The primary action has no item checkboxes because reference-backed placements
already mean “use the deliberate preferred address in the next source
outcome.” Selecting it creates private source work only. It does not publish or
send.

Example cards:

```text
Home Page · Donate button
Website · Ready to prepare
/give/water-project → /give/clean-water
What happens: this button is included with 2 other placements in one private
website update for review. The published website and Page copy stay unchanged
until a website publisher approves it.

Stories Page · Donate button
Website · Needs an authorized owner
What happens: one review request goes to the verified Website owner queue

Summer 2025 appeal
Sent message · Not changed by Core
What this means: recipients keep the link that was actually sent

Church conference flyer
Downloaded QR · Not changed by Core
Next step: copy the preferred address for the next print run

August supporter update
Communications · Source not available · Not changed by Core
What this means: Core has no accepted newsletter adapter and makes no change

Partner church website
External site · Not changed by Core
What this means: copy the preferred address for that site's authorized owner
```

There is no warning-colored confirmation modal for ordinary preparation. The
review page itself is the deliberate confirmation. Consequential publish/send
steps remain in their source-owned journey.

### 4. Return a durable, resumable receipt

After preparation, a persistent receipt—not a toast—says:

> **Giving-link updates prepared**  
> 1 website update covering 3 placements prepared · 1 owner review requested ·
> 4 not changed by Core

It lists each item and receipt state. Actions are contextual:

- **Review website updates**;
- **Open website owner review** when authorized;
- **Copy preferred address**;
- **Download update checklist**; and
- **Retry 1 unchecked item** only when a safe residual retry exists.

Staff can leave and return using the stable private receipt. A lost network
response shows **Checking what happened** and inspects source receipts before
offering retry.

### 5. Keep each owner in their familiar workflow

After the exact Page publication contract is accepted and activated, Website
owners land on the publication candidate and affected button with an accessible
old/new dependency diff. The stable Giving reference and Page copy are
unchanged; the candidate pins the newly preferred address in the complete Site-
locale generation. They use the accepted source-owned action their Tenant has
selected, such as **Submit for review**, **Approve & publish**, **Request
changes**, or **Publish changes**. These are target-state actions, not current
`develop` behavior.

After an exact Communications family has an accepted and activated adapter,
its owners land on the exact editable message version and affected link. They
see whether it is draft, awaiting review, approved/frozen, scheduled, or sent.
Only an editable version can accept the proposal. An approved/scheduled version
requires a deliberate successor and reapproval; sent history remains
unchanged. Until then, the item remains **Source not available · Not changed by
Core**.

The Giving manager never learns provider vocabulary and never selects an
approver. Each source screen states **Prepared from the preferred Giving
address change by [permitted actor/role label]** without implying approval.

### 6. Make concurrent changes understandable

If an editable message or other authored source changed first, the card says
**Content changed · Review latest** and opens the new version. A reference-
backed Page with later private work instead says **Later draft not included**;
the dependency-only candidate uses the current public generation and never
publishes that draft. If another Giving address C became preferred, the card
says **Preferred address changed · Review latest** and shows C. If the target
is unavailable, it says **Address unavailable · Choose a current address**. If
it stopped, publish/send is blocked and the source owner receives the single
repair path.

No modal asks staff to choose among technical versions, force an overwrite, or
retry a provider job.

### 7. Treat immutable and external copies as a checklist, not failure

The **Not changed by Core** group explains that Core cannot recall a sent
email, rewrite a PDF/QR already downloaded, edit another provider/site, or
change a literal URL that staff deliberately fixed. It offers the preferred
link and a generated-at checklist. These items do not make the operation red or
failed while the old address remains current.

If an address later stops, a currently published Core placement becomes a
source-owned broken-placement repair condition with urgency based on visitor
impact. A later accepted Content Health projection may display that source
fact, but it does not own or resolve it. The link to fix it returns to the exact
qualified Page or Communications source, never to an address Stop screen or
generic retry console.

### 8. Preserve joy through clarity, not decoration

The page feels like the rest of Mission Control: generous whitespace, a clear
heading, restrained Zinc surfaces, one Maia primary action, small textual
status chips, strong focus rings, plain sentences, and immediate orientation.
Preparation progress may use a quiet determinate/indeterminate status; no row
flies around, no completion confetti appears, and reduced-motion users lose no
information.

On mobile, group summaries stack above cards and the primary action stays in
normal document order. Staff in low-bandwidth field conditions can read the
server-rendered summary, submit once, leave, and resume from the receipt.

## Source of truth and ownership map

| Fact or effect                                                                      | Authoritative owner                                     | D13 relationship                                                                        |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Issued address, address generation, lifecycle, Preferred head                       | Giving                                                  | Emits exact preference occurrence; never owns content                                   |
| Site, locale, public presentation/attribution context                               | Site/locale owners                                      | Scope input and eligibility; never financial identity                                   |
| Page placement content and current working head                                     | Page/CMS owner                                          | Preference-only convergence reuses the stable reference and never rewrites it           |
| Page candidate, review, release, public serving head                                | Page publication owner                                  | Prepares/reviews the complete generation; D13 cannot activate it                        |
| Communication source, publication, approval/freeze, prepared send, provider outcome | Communications owners                                   | After source qualification, creates a successor only before freeze; never edits history |
| QR definition/version                                                               | Its registered content/asset owner                      | May create a future version; downloaded bytes never mutate                              |
| Literal URL                                                                         | Owning content version                                  | Remains literal until owner deliberately edits it                                       |
| Owner queue/request                                                                 | Accepted source collaboration workflow, when present    | Routes action; grants no authority and owns no content                                  |
| D13 receipt/convergence status                                                      | Rebuildable coordinator read model over source receipts | Explains progress only; cannot approve, publish, send, or resolve source truth          |
| External, printed, forwarded, bookmarked copies                                     | External custodian/user                                 | Advisory evidence only; Core does not claim control                                     |
| Designation, Legal Entity, Stripe, settlement, bank, accounting                     | Their operational/financial owners                      | Independently revalidated at their own boundary; never selected by placement            |

## Current behavior, proposed intent, and permanent path

| Layer                       | Current `develop` behavior                                                                                                                                                                                                                                                                                                                                         | Proposed Phase 22/23 evidence                                                                                                                                                                        | Permanent D13 path                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CMS authorization           | Payload collection create/update/delete broadly reuse tenant-staff access; non-super-admin create may omit tenant and rely on a hook; current controls do not prove granular Page edit/review/release authority (`apps/admin/src/cms/access/tenant-access.ts:7-69`).                                                                                               | PR #1323 proposes exact Page capabilities, one candidate/release lane, attributed staff revisions, and current proof.                                                                                | Activation waits for exact source commands and capabilities; no broad staff/service-role shortcut.                                                                                        |
| Page publication            | Current collections use Payload drafts/native publish; `pages` autosaves every 300 ms and current audit is technical logging (`apps/admin/src/cms/collections/pages.ts:42-108`, `apps/admin/src/cms/hooks/audit.ts:8-42`).                                                                                                                                         | PR #1323 proposes immutable Page Giving Binding, candidates, review, CAS release; PR #1340 proposes bounded Working Revisions and one complete Site-locale Public Site Generation. Both remain open. | D13 prepares a reference-preserving publication candidate and complete Site-locale generation without rewriting authored content; one source CAS remains public authority.                |
| Public/operational boundary | Current public request context still reserves `siteId` as `null`; CTA resolution synthesizes legacy `/checkout?...` links, and Navigation stores raw text hrefs (`packages/api/src/cms/public/context.ts:21-29`, `packages/lib/cms/public-page.ts:175-239`, `apps/admin/src/cms/collections/navigation.ts:69-82`). ADR-0029 separately governs reference-not-copy. | Phase 22 extends the Page-specific binding/reference model; Phase 23 proposes stable references resolved into complete generations.                                                                  | Typed exact-Giving-entry placement references; no address copy authority, cross-schema FK, global text replacement, legacy URL synthesis, or live preferred lookup that bypasses release. |
| Task/routing                | Current generic Mission Control tasks are service-only, use non-composite child tenant links, have no task dedupe key, and the current helper hardcodes the Finance Operations queue (`supabase/migrations/20260526193000_mission_control_tasks.sql:14-97`, `packages/api/src/admin/mission-control-tasks/store.ts:47-73`).                                        | PR #1323 proposes one Page review queue; PR #1340 Content Health explicitly avoids a second assignment/approval system and routes to source actions.                                                 | Reuse source queue/review; add only a deduplicated, privacy-minimized owner request if its source contract proves it. Do not treat current generic tasks as authorization.                |
| Communications              | Current provider/send seams exist, but Phase 17's immutable System Message publication/prepared-message model is not a newsletter D13 content-edit API; the current email UI labels Version History and Schedule Send **Coming soon** (`apps/admin/app/(app)/email/page-client.tsx:455-473`).                                                                      | Phase 17/6 separates governed System Message authoring/publication, prepared identity, dispatch, and immutable history; later newsletter ownership remains separate.                                 | Each exact Communications family stays unavailable until its own accepted typed source contract exists; then it may create a new editable version only before freeze.                     |
| D13 behavior                | No current typed convergence workflow exists.                                                                                                                                                                                                                                                                                                                      | No open PR proves D13 itself.                                                                                                                                                                        | Build source-by-source after governing contracts merge; read-only inventory first, then private preparation and proof.                                                                    |

Current code is migration evidence. It is not proof that broad tenant staff,
Payload-native publish, technical logs, or service-role task writes satisfy
D13.

## Adversarial category review

Every requested category has a material concern if Option 1 is implemented as
an informal “update links” feature. The amendments control those concerns; none
requires replacing the founder's chosen direction.

### 1. Problem validity, necessity, and alternatives

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                    | Why it matters                                                                                                                                                          | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                                                       | Effect on answer                                                                        | Permanent fix                                                                                                          | Exact language                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Core could build a complex migration system for a nonurgent cleanup: D12 already keeps the old address working. The strongest alternative—future links only—would be simpler and safe. | Staff effort is real, but no current evidence quantifies how many placements or changes a typical ministry has. Unnecessary machinery would cost more than the problem. | Medium   | High       | **Founder-ratified Phase 24 decision evidence:** D12 makes preference nonrouting and old current addresses continue. **External fact:** common CMSs provide bulk/version workflows, but no vendor proves Core's exact need. | Narrows Option 1 to an optional convenience that never blocks or rolls back preference. | Implement only typed Core placements through existing source version paths; measure usage before adding more adapters. | **D13-R1, R2, R16, R18:** preference completes independently; no crawler/general workflow; source-by-source rollout. |

### 2. Brittleness

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                             | Why it matters                                                                                                                                   | Severity | Likelihood | Evidence or reasoning                                                                                                                      | Effect on answer                                                                  | Permanent fix                                                                                                               | Exact language                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Matching old URL text inside current `primaryCtaHref`, `buttonHref`, rich content, or `donate_link` could rewrite intentional links, malformed content, another locale, or an unrelated target. | A regex or destination-equality rule works only while content shapes are simple and undocumented. It can corrupt public content or donor intent. | Critical | High       | **Current behavior:** Page CTA hrefs and donate merge tags are raw URL text (`page-builders.ts:240-246,295-319`; `merge-tags.ts:197-223`). | Blocks inference-based implementation; confirms typed-placement preparation only. | Introduce source-proved stable placement occurrence/reference identity prospectively. Legacy raw text stays literal/manual. | **D13-R2:** URL equality, text/JSON/HTML search, analytics, and rendered output never authorize a change. |

### 3. Technical debt

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                  | Why it matters                                                                                                                   | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                                                    | Effect on answer                                                            | Permanent fix                                                                                                                       | Exact language                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| A universal placement table, generic task workflow, cross-domain approval engine, or coordinator-owned proposal state could duplicate Page and Communications truth. | Dual ownership creates drift, conflicting statuses, repair scripts, and brittle source-specific branches in a “generic” service. | High     | High       | **Repository fact:** platform boundaries assign public presentation/publication to CMS and operational workflow to CRM owners; proposed Phase 23 Content Health explicitly rejects a second workflow/approval authority. | Requires a thin coordinator and finite source adapters, not a new platform. | Keep source outcomes/receipts canonical; make convergence status rebuildable; reuse only accepted source-owned queues and commands. | **D13-R3, R7, R8, R12, R14, R18:** no universal mutable authority or general workflow/task product. |

### 4. Edge cases

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                                                                                 | Why it matters                                                                                                           | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                                                   | Effect on answer                                                                     | Permanent fix                                                                                                                                             | Exact language                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Active editor leases, unpublished changes, several placements in one resource, reusable sections, locale variants, no current preferred address, approved/scheduled messages, a cleared/unavailable/stopped target, or materialized QR files could each produce the wrong behavior. | Treating them uniformly loses work, creates mixed versions, sends a dead link, or claims bytes changed when they cannot. | High     | High       | **Proposed evidence:** Phase 22/23 separates exact locale lineages, coherent working heads, candidates, releases, and source-owned recovery. **Distributed-systems reasoning:** lifecycle and freeze boundaries differ. | Adds explicit classification and source-specific outcomes; does not reject Option 1. | Preserve active work; update every eligible occurrence in one coherent source version or none; keep immutable artifacts unchanged; fail without fallback. | **D13-R4, R6–R10, R13:** explicit statuses, source versioning, snapshot/freeze rules, and lifecycle races. |

### 5. Footguns

**Material concern exists: yes.**

| What could go wrong                                                                                                                                    | Why it matters                                                                            | Severity | Likelihood | Evidence or reasoning                                                                                                               | Effect on answer                           | Permanent fix                                                                                                      | Exact language                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| A button named **Update links** or status **Ready** could conceal whether Core will save a draft, publish, send, notify, or alter someone else's work. | Staff cannot give meaningful confirmation and may cause donor-facing change accidentally. | High     | High       | **External fact:** GOV.UK patterns favor explicit task/status/action language; W3C requires understandable consequences and errors. | Changes the entire interaction vocabulary. | Make D13's action private preparation only, show counts, separate later source actions, and keep **Not now** safe. | **D13-R4, R5, R17:** **Prepare authorized updates** creates no public/send effect; item status says what happens next. |

### 6. Tenant safety

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                     | Why it matters                                                                                                            | Severity | Likelihood | Evidence or reasoning                                                                                                                  | Effect on answer                                               | Permanent fix                                                                                                    | Exact language                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Preview counts, titles, URLs, owner names, cursors, caches, receipts, or timing could reveal a restricted placement or sibling Tenant—even if the row itself is hidden. | Non-enumeration is part of Core's product/security boundary, particularly for restricted missionaries and private drafts. | Critical | Medium     | **Repository fact:** platform principles put tenant and permission correctness first; accepted public-isolation decisions fail closed. | Requires structural filtering at every surface, not UI hiding. | Derive scope server-side; make hidden resources contribute no count/label/timing signal; reauthorize every read. | **D13-R4, R11, R12, R15:** exact-scope tuples, non-enumerating preview, field capabilities, direct-route/cache tests. |

### 7. Database, RLS, and authorization safety

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                                                          | Why it matters                                                                                                                                                    | Severity | Likelihood  | Evidence or reasoning                                                                                                                                                                                                         | Effect on answer                                              | Permanent fix                                                                                                                                                                                                  | Exact language                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| “Governed service authority” could become a confused deputy; caller-supplied source/tenant/actor fields or a service key could write another scope. Current generic task children also lack tenant-composite FKs and the helper has no semantic task dedupe. | A technically privileged worker is not authorized to edit, approve, publish, or send business content. One bad relation or mutable scope field can cross tenants. | Critical | Medium-High | **Current behavior:** task tables are service-only but use separate `tenant_id` plus task FK and no task dedupe; CMS access is broad staff scope. **Repository fact:** service role never substitutes for business authority. | Blocks reuse of current tables/roles as sufficient D13 proof. | Use actual actor or separately ratified source principal; same-scope composite integrity; immutable scope; operation-correct `USING`/`WITH CHECK`; explicit grants; typed source registry; no cross-schema FK. | **D13-R3, R8, R11, R12:** source commands alone write; every row/action is exact-scope and server-derived. |

### 8. Overengineering

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                    | Why it matters                                                                                                      | Severity | Likelihood | Evidence or reasoning                                                                                                                                                       | Effect on answer                             | Permanent fix                                                                                                       | Exact language                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Crawling all pages, emails, external sites, providers, PDFs, and QR files or supporting arbitrary plugins would turn D13 into a content graph and automation platform. | It would be slow, privacy-heavy, unreliable, expensive to operate, and still unable to prove external completeness. | High     | High       | **Product judgment:** typed Core references solve the known job; external copies are unknowable. **External fact:** CMS bulk systems operate on owned structured resources. | Keeps the solution small and source-bounded. | Finite code-owned adapter registry; unsupported or literal placements are advisory only; no generic plugin/crawler. | **D13-R2, R9, R16, R18:** exact typed scope and explicit non-goals. |

### 9. UX/UI and user friction

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                           | Why it matters                                                                                                                      | Severity | Likelihood | Evidence or reasoning                                                                                                                                                    | Effect on answer                                                                         | Permanent fix                                                                                                                                               | Exact language                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| A mixed-permission desktop table, per-item confirmation, technical status, or single vague success state could overwhelm occasional nonprofit staff and hide partial results. | Staff need confidence, not a migration console. Ambiguity increases errors and training burden, especially on mobile/weak networks. | High     | High       | **Repository fact:** clarity/accessibility/perceived speed outrank decorative richness. **External facts:** GOV.UK task/summary patterns and W3C reflow/status guidance. | Establishes a one-review, one-primary-action, grouped-card journey with durable receipt. | Explain old link still works; group by next action; progressively disclose; preserve source context; itemize outcomes; support 320px/400%/RTL/weak network. | **D13-R4, R5, R14, R17** and the complete staff journey. |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                     | Why it matters                                                                                           | Severity | Likelihood | Evidence or reasoning                                                                                                                                              | Effect on answer                                                                                     | Permanent fix                                                                                                                                    | Exact language                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| A Page/message could resolve “current preferred” live at render/send, allowing Giving to mutate published presentation without a source release. A D13 projection or task could become write authority. | It bypasses accepted CMS publication ownership and destroys historical reproducibility/approval meaning. | Critical | High       | **Repository fact:** ADR-0029 says CMS owns presentation and operational truth wins only for its owned facts; Page/Communications own versions and release/freeze. | Requires immutable placement snapshots in owner versions and makes preference a proposal input only. | Source owner pins exact address generation and Preferred revision at its sealing boundary; no mutable live lookup under published/frozen output. | **D13-R3, R7, R10, R14:** singular owners, frozen snapshots, derived projection only. |

Always-true invariants are:

1. one placement version belongs to exactly one Tenant/environment/Site/locale/
   source object and stable placement identity;
2. a source release candidate/version pins one exact issued address generation,
   never a mutable preferred pointer;
3. preference can propose but cannot edit, approve, release, or send;
4. source publication/send can advance only through its sole owner command;
5. historical/frozen output never mutates;
6. a stopped address is never newly emitted after the terminal commit;
7. all hidden/inaccessible work is non-enumerating; and
8. no placement or task selects financial identity.

### 11. Hidden coupling

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                  | Why it matters                                                                                                                                  | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                          | Effect on answer                                      | Permanent fix                                                                                                   | Exact language                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| D13 could implicitly advance Page working heads, reusable-section fan-out, Public Site Generations, locale releases, navigation, message publications, prepared delivery, QR bytes, and notification state together. | These owners have different transactions, review policies, freeze points, recovery, and authorization; one coordinator cannot make them atomic. | High     | High       | **Proposed evidence:** Phase 22/23 deliberately separates revision axes and public generations. **Accepted ADR-0032:** prepared message identity cannot rerender/change after possible submit. | Demands finite source adapters and itemized outcomes. | Invoke only each owner's ordinary successor command; no cross-owner transaction or implicit dependency advance. | **D13-R3, R6–R8, R13–R14:** source-specific commands, immutable history, per-owner receipts. |

### 12. Failure modes

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                | Why it matters                                                                                                               | Severity | Likelihood  | Evidence or reasoning                                                                                                                          | Effect on answer                                                           | Permanent fix                                                                                                                                                | Exact language                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Some Page drafts may commit while Communications is down; Payload preparation may succeed before a receipt; response loss may prompt duplicate versions; the convergence projection may disappear. | Cross-store/source work cannot be atomic. Rollback or blind retry could destroy valid work or duplicate public/send effects. | High     | Medium-High | **Distributed-systems reasoning** and repository patterns require prepare/readback, semantic idempotency, last-known-good, and honest unknown. | Changes “success” into durable per-item results and roll-forward recovery. | Source receipts authoritative; inspect before retry; successful items remain; failed residuals retry; projection outage cannot affect sources or preference. | **D13-R12–R14, R18:** itemized receipt, exact retry, source readback, adapter kill switches. |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                             | Why it matters                                                                                           | Severity | Likelihood  | Evidence or reasoning                                                                                                                                 | Effect on answer                                               | Permanent fix                                                                                                                                                                                                | Exact language                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| A→B proposal could publish after C becomes preferred; an auto-supersede could erase human edits; Stop/retirement/revocation could race prepare/approval/publish/send; duplicate events could create repeated tasks or versions. | Individually valid operations could jointly publish stale/dead links, lose work, or violate terminality. | Critical | Medium-High | **Repository/proposed evidence:** source heads use CAS and terminal lifecycle wins; **accepted ADR-0032:** uncertain sends reconcile frozen identity. | Adds exact states, transitions, fences, and idempotency grain. | Only untouched machine proposal may be superseded; otherwise preserve and show review state. Recheck source, preferred snapshot, address lifecycle, Site/locale, capability, and auth epoch at every effect. | **D13-R6, R8, R10, R13:** A→B→C, Stop-first/publish-first, semantic retry, frozen-approved snapshot. |

Meaningful D13 states are **discovered**, **ready to prepare**, **preparing**,
**prepared private source work**, **owner review requested**, **content/preference
changed—review latest**, **not changed by Core**, **could not be checked**,
**failed safely**, and source-owned reviewed/approved/released/sent outcomes.
There is no global **completed** state that replaces those facts. Rejection,
withdrawal, successor, retry, and correction stay with the source owner.

### 14. Data integrity risks

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                        | Why it matters                                                                                                                    | Severity | Likelihood | Evidence or reasoning                                                                                                                         | Effect on answer                                                                                                                  | Permanent fix                                                                                                                                                                 | Exact language                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Replacing a whole href might drop/change Source Code, amount, cadence, currency suggestion, locale, Page attribution, Designation, query/fragment semantics, or only one of several placements in the same source outcome. | Donor intent and reporting can change even though the visible base URL looks similar. Mixed versions create inconsistent content. | Critical | Medium     | **Repository fact:** these are independent attribution/Giving axes. **Current behavior:** raw href fields do not enforce semantic separation. | Narrows the Page path to a reference-preserving dependency pin and the Communications path to one exact address-reference change. | Page generation reuses the stable reference and every non-address fact; Communications changes only the exact address reference; all eligible occurrences advance coherently. | **D13-R1, R2, R7, R10:** stable reference, exact generation pin, placement identity, and source digest. |

### 15. Security and privacy risks

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                                     | Why it matters                                                                                                                      | Severity | Likelihood | Evidence or reasoning                                                                                                             | Effect on answer                                                           | Permanent fix                                                                                                                                                               | Exact language                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Caller-supplied target URLs could create phishing/open redirects; tasks, exports, logs, and notifications could retain sensitive missionary identity, private draft text, recipient data, full URL/query/token, or raw provider errors. | D13 crosses public, content, communications, and restricted-person contexts. A “helpful” preview could become a disclosure channel. | Critical | Medium     | **Repository fact:** destination and scope must be trusted-source derived; Phase 10/17 minimize publication and message evidence. | Requires opaque authoritative targets and field-level redaction/retention. | Resolve target only from Issued Giving Address ID/generation; reject caller URLs; use safe labels/opaque refs; reauthorize every read; minimize logs/notifications/exports. | **D13-R4, R8, R11, R12, R15:** no caller destination, non-enumeration, privacy-minimized evidence. |

### 16. Scalability and performance risks

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                | Why it matters                                                                                | Severity | Likelihood  | Evidence or reasoning                                                                                                                                          | Effect on answer                                             | Permanent fix                                                                                                                                                          | Exact language                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Preference commit could synchronously fan out across Payload/messages, scan every document, call providers, or hold source/preference locks; one large Tenant could starve others. | Latency and provider/store failure would couple a simple preference change to unbounded work. | High     | Medium-High | **External fact:** Contentful bulk work is asynchronous/versioned and rate-limited. **Repository principle:** bounded queues and fair multi-Tenant operations. | Makes preference commit local and convergence async/bounded. | Indexed typed references, cursor pagination, batched reads, no provider calls/scan under lock, fair source queues, published certified capacity/latency before launch. | **D13-R16:** exact p95/p99 interactive target; longer work tracked asynchronously; no vague “large/fast” claim. |

### 17. Operational burden

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                      | Why it matters                                                                                                                  | Severity    | Likelihood | Evidence or reasoning                                                                                                                                                                                   | Effect on answer                                                  | Permanent fix                                                                                                                                        | Exact language                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| One task/notification per placement/change, guessed assignees, spreadsheets, direct SQL, or provider-console repair could overwhelm ministries and support. Some Tenants may have no eligible Page/Communications owner. | The selected option is supposed to reduce staff effort; noisy glue work would reverse that benefit and create tribal knowledge. | Medium-High | High       | **Current behavior:** generic task helper is finance-specific and lacks suitable D13 semantics. **External fact:** tasks require access/ownership alignment; Contentful notes assignee-access footguns. | Requires grouped source-native routing and honest no-owner state. | At most one deduplicated source work package per coherent scope/cause; no fabricated owner; operator routing exception; typed self-service recovery. | **D13-R8, R15, R18:** reuse source queues, dedupe, quiet notification, no generic workflow or SQL repair. |

### 18. Observability and auditability gaps

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                         | Why it matters                                                                                     | Severity | Likelihood | Evidence or reasoning                                                                                                                                  | Effect on answer                                           | Permanent fix                                                                                                                                                | Exact language                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| A dashboard could report **updated** when only a draft/task exists; technical logs could lose actor, source receipt, or unknown provider outcome; stale projections could show false green. | Staff cannot understand or correct what happened, and operators cannot prove tenant/public safety. | High     | High       | **Current behavior:** CMS change audit is logger output, not durable business history. **Repository fact:** saved/reviewed/released/sent are distinct. | Adds durable business receipts and precise staff language. | Record exact actor/authority, source/target/version/preference, semantic command and source result; low-cardinality metrics; incomplete/stale state visible. | **D13-R10, R14–R16:** distinct outcomes, source receipts, freshness, privacy-safe monitors. |

### 19. Dependency and integration risks

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                               | Why it matters                                                                                                               | Severity | Likelihood | Evidence or reasoning                                                                                                                                                   | Effect on answer                                                             | Permanent fix                                                                                                                                              | Exact language                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Implementation could assume open PR #1323/#1340 is merged, Payload native roles/versions are product authority, Phase 17 covers every newsletter, or provider APIs can mutate historical content. | The required owner contracts do not all ship today, and vendor primitives do not establish Core authorization or invariants. | High     | High       | **Live repository fact:** both PRs are open, mergeable, blocked, and review-required. **External fact:** CMS capabilities differ and carry plan/permission limitations. | Blocks each adapter until its exact owner contract is reconciled and proved. | Finite registry; merge/reconcile owner specs first; unsupported source families remain unchanged; pin provider/API behavior only at adapter qualification. | **D13-R7, R18:** no adapter activation without version/auth/freeze/failure/rollback proof. |

### 20. Migration, rollout, and upgrade risks

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                     | Why it matters                                                                                                                            | Severity | Likelihood | Evidence or reasoning                                                                                                                             | Effect on answer                                                                 | Permanent fix                                                                                                                                     | Exact language                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Backfilling typed placements from raw URL equality could fabricate provenance/ownership. New writers might run before old readers understand receipts, or rollback could delete valid private versions. | A migration intended to help could silently convert deliberate literal content or cross-scope data and make rollback unsafe after writes. | Critical | High       | **Current behavior:** raw CTA/merge-tag links lack typed provenance. **Repository rule:** proposed Phase 22/23 material is not shipped authority. | Requires additive typed readers, shadow inventory, and source-by-source writers. | Backfill only proved references; leave ambiguity literal; mixed-version tolerance; independent kill switches; roll forward committed source work. | **D13-R18:** explicit rollout order, no fabricated fields, safe rollback and adapter isolation. |

### 21. Testability, traceability, and proof

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                             | Why it matters                                                                                                     | Severity | Likelihood | Evidence or reasoning                                                                                                    | Effect on answer                                                       | Permanent fix                                                                                                                                                                      | Exact language                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Terms such as “editable,” “authorized,” “routed,” and “updated” could pass unit tests while user-visible/public outcomes are wrong. D13 could diverge across glossary, ADR, PRD, OpenSpec, tickets, code, and release evidence. | Ambiguous requirements invite engineers to invent permissions, states, and failure behavior during implementation. | High     | High       | **Repository fact:** OpenSpec requires falsifiable scenarios; product done includes clarity and cross-surface coherence. | Requires exact acceptance/proof and trace chain before implementation. | Trace founder answer → glossary → D13 evidence → reconciled ADR/PRD/OpenSpec → design/tasks → source-owner/public tests → release evidence. Test outcomes and negative/race paths. | **D13-R1–R18** plus the 44 acceptance criteria below. |

### 22. Other development hazards

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                                     | Why it matters                                                                                | Severity | Likelihood | Evidence or reasoning                                                                                                                                                          | Effect on answer                                       | Permanent fix                                                                                                                                                              | Exact language                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| “Undo” could roll back preference or mutate history; a QR/file identity could change destination under existing bytes; external hosting could be falsely reported updated; one adapter could become a template for unqualified sources. | These shortcuts break D9–D12's immutable/no-redirect model and create irreparable trust gaps. | High     | Medium     | **Founder-ratified Phase 24 decision evidence:** issued addresses and frozen artifacts are historical identities. **Repository fact:** providers do not define Core authority. | Adds explicit non-goals and successor-only correction. | Undo is a new owner-authorized successor; immutable artifact IDs/bytes/destinations stay fixed; external copies remain outside claims; qualify each adapter independently. | **D13-R7, R9, R13, R18:** no mutation, redirect, recall, generic plugin, or inferred completion. |

## Required acceptance criteria and proof

The later PRD/OpenSpec and implementation MUST make every criterion below
independently falsifiable. Passing a worker/job test without the source-owned
user-visible outcome does not satisfy it.

### Scope, ownership, and ordinary journey

1. A committed preference change completes successfully when D13 is disabled,
   unavailable, skipped, or later fails.
2. The receipt offers **Review places to update** as secondary to **Copy
   preferred address** and plainly says the earlier address still opens.
3. Preview scope is exact Tenant, environment, Site, placement locale, and
   Giving entry with D14 exact-locale target equality; changing any one
   produces a different closed set.
4. A typed reference-backed Page placement appears **Ready to prepare** only
   when current read plus publication-candidate preparation authority both
   pass; a separately qualified Communications placement requires its exact
   editable-version-create authority.
5. A visible placement whose actor lacks the applicable source preparation
   authority appears **Needs an authorized owner** without a doomed action.
6. Sent, downloaded, printed, external, and literal evidence appears **Not
   changed by Core** only where the actor may see it.
7. Adapter outage/stale evidence appears **Could not be checked** with a time;
   it does not reduce counts or claim completion.
8. Hidden resources contribute no row, count, owner, URL, timing distinction,
   cache entry, cursor behavior, export field, or task signal.
9. **Prepare authorized updates** creates private source work only; adjacent
   consequence text names any owner reviews the same command will request. It
   never publishes, approves, schedules, sends, stops, or changes financial
   truth.
10. With zero ready items and routable owner work, the primary action becomes
    **Request N owner reviews**; with neither effect, no disabled/zero prepare
    button appears and the best available retry/checklist/copy/Done action is
    primary. **Not now** creates no source version/request and remains
    resumable.
11. Reference-backed Page preparation leaves authored Working Revisions
    untouched and uses the one ordinary publication-candidate/Public Site
    Generation/release lane; the current public generation stays live until CAS
    succeeds.
12. After an exact Communications source family has an accepted and activated
    adapter, its preparation uses the one ordinary editable-version lane and
    leaves approved/frozen/scheduled/prepared/sent history untouched; until
    then it remains **Source not available · Not changed by Core**.

### Version, lifecycle, and data-integrity proof

13. Preference-only Page preparation changes only the exact address-generation
    dependency pinned by the publication candidate; the stable Giving-entry
    reference, authored content, Working Revision, Site, placement locale,
    Designation, Source Code, amount, cadence, currency suggestion,
    attribution, copy, and unrelated facts remain unchanged.
14. Every admitted Page/Navigation placement in one exact Site-locale Public
    Site Generation closes coherently or none does; each separately qualified
    Communications source version is atomic only within itself.
15. A deliberate literal URL with the same bytes as the old address is never
    mutated or converted to a managed reference.
16. Raw HTML/JSON/Lexical/Markdown/log/analytics/provider matches cannot invoke
    a write command.
17. A reference-backed Page active editor/private draft remains untouched and
    is visibly excluded from the dependency-only candidate; an authored source
    that would require a patch instead produces **Content changed · Review
    latest** and preserves every byte/author/revision.
18. A submitted candidate, pending approval, schedule, or frozen publication is
    not patched; the owner sees its exact state and successor path.
19. A→B editable/unapproved work stales or is superseded idempotently when C
    becomes preferred; C is proposed without destroying human work.
20. An approved/frozen B artifact stays immutable after C, is labelled as the
    prior preferred snapshot, and can proceed only while B remains
    issued/current and source checks pass.
21. Stop-first prevents any not-yet-public/not-yet-submitted source command from
    emitting the stopped address and creates no fallback.
22. Publish/send-first preserves the actual immutable outcome; later Stop
    creates one source-owned repair condition and never waits on cleanup.
23. An issued/unavailable target blocks new release/send with a source-owned
    explanation; it does not silently choose an older/current address.
24. No preferred address produces a repair state and no inferred replacement.

### Authorization, database, privacy, and concurrency proof

25. Read, full-address display/export, version create, submit, review, approve,
    publish, schedule, send, route, task read, receipt read, and audit detail
    are independently denied/allowed under exact capabilities.
26. Authority revocation between preview, confirm, create, submit, approval, and
    publish/send blocks only the later unauthorized effect and preserves prior
    attribution.
27. An Assistant can prepare only within the initiating user's current scope
    and cannot publish/send or borrow a source service principal.
28. Caller-controlled tenant, actor, owner, approver, recipient, source,
    placement, URL, capability, or service-role claims are rejected/ignored.
29. Poisoned sibling-Tenant/Site/locale/source/placement IDs fail closed at API,
    command, RLS, FK, view, cache, cursor, task, receipt, export, and direct URL
    seams, including table-owner, `BYPASSRLS`, service-role, support, worker,
    import, forged JWT/metadata, and direct Data API/SQL paths.
30. Every `INSERT`/`UPDATE` policy proves both visibility and resulting-row
    scope; applicable relations enable and force RLS; an allowed update cannot
    move an object into forbidden state; and every `SECURITY DEFINER`/RPC uses
    schema-qualified objects, empty pinned `search_path`, restricted execute,
    least privilege, and exact-scope poison tests.
31. Repeated event, click, job, webhook, timeout, or lost response returns one
    source outcome/work package/receipt at the exact semantic grain; a source-
    version advance moves the one logical-lineage attention item and appends a
    stale/superseded outcome without another active notification.
32. Reusing an idempotency key with changed target/source/preference meaning
    rejects rather than returning unrelated work.
33. Partial Page/Communications success reports each result, retries only safe
    residuals, and never compensates by changing preference or source history.
34. Preview/task/receipt/export/log/trace/metric snapshots prove forbidden
    content, recipient data, restricted identities, full unauthorized URLs,
    query/fragment/token, secrets, raw provider data/errors, IPs, and user
    agents are absent.
35. No-owner routing creates one safe routing exception and no fabricated
    assignee, email, permission, or hidden-resource disclosure.

### UX, operations, migration, and production proof

36. Representative nonprofit website staff, communications staff, occasional
    editors, ministry leaders, and small-team administrators can predict what
    **Prepare** will and will not do, identify the next owner/action, and
    interpret partial results without provider/version jargon.
37. Keyboard, focus, screen reader, status/error announcement, forced color,
    contrast, 320-pixel reflow, 400% zoom, touch, RTL/native-script, long labels,
    bidirectional URL isolation, reduced motion, no-JavaScript, weak network,
    offline interruption, and resume behavior pass production-equivalent tests.
38. The initial qualified preview meets p95 ≤2 seconds and p99 ≤4 seconds;
    longer work becomes tracked asynchronous discovery without losing scope or
    receipt.
39. Production-shaped load publishes exact placement/item/operation limits and
    p50/p95/p99 for discovery/preparation, with bounded memory, query plans,
    fair Tenant/source throughput, backpressure, rate limits, and dead-letter
    recovery.
40. Typed read-only shadow inventory is compared with source truth before any
    write adapter activates; false positive/negative and incomplete evidence
    are measured.
41. Legacy raw/ambiguous URLs remain literal/manual; migration fabricates no
    placement, author, owner, approval, preference revision, or outcome.
42. Mixed old/new deployments ignore/tolerate additive occurrence/receipt
    records and never dual-author source or convergence truth.
43. Disabling one source adapter stops new preparation/routing without
    affecting addresses, preference, Stop, other adapters, prior private
    versions, public releases, sent messages, or audit history.
44. Founder answer, glossary, D13 evidence, accepted ADR/PRD, OpenSpec scenarios,
    design, tickets, implementation, tests, and release evidence agree on
    names, scope, states, owners, counts, freeze points, and non-effects.

## Named production monitors

Anything monitored here has an explicit signal, threshold, owner, and
response. A launch team may refine thresholds only with production evidence
and a recorded owner decision; it may not remove the fail-safe meaning.

| Signal                                                    | Threshold                                                                                                     | Owner                                      | Required response                                                                                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `giving_placement_cross_scope_effect_total`               | Any value >0                                                                                                  | Security + affected source owner           | P0: disable affected adapter, contain public/send effects, preserve evidence, enumerate exact scope, repair forward, and requalify isolation. |
| `giving_placement_frozen_artifact_mutation_total`         | Any value >0                                                                                                  | Communications/CMS Security                | P0 data-integrity incident: disable adapter, preserve bytes/versions, notify owner, correct only through successor.                           |
| `giving_placement_literal_autorewrite_total`              | Any value >0                                                                                                  | D13 Product + source owner                 | Disable writer, revert only by source-authorized successor, audit migrated classifications, and fix typed eligibility.                        |
| `giving_placement_stopped_target_release_total`           | Any value >0                                                                                                  | Public Runtime + Giving + source owner     | P0: contain affected positive release/send where possible, preserve terminal fact/history, create source successor, prove no fallback.        |
| `giving_placement_preview_effect_mismatch_total`          | Any item publishes/sends or notifies contrary to its confirmed classification                                 | D13 Product + affected source              | Disable adapter, reconcile receipts, correct preview/command contract, rerun usability and authorization proof.                               |
| `giving_placement_duplicate_source_work_total`            | Any second active item/notification for one logical lineage, cause, target generation, and Preferred revision | Source adapter owner                       | Preserve one authoritative lineage, close/mark duplicate safely, repair uniqueness/idempotency before expansion.                              |
| `giving_placement_human_draft_overwrite_total`            | Any value >0                                                                                                  | CMS/Communications Security                | P0: stop adapter, preserve all versions, restore only by owner successor, investigate CAS/lease/patch proof.                                  |
| `giving_placement_unknown_outcome_age_seconds`            | >5 minutes for unavailable/terminal target; >15 minutes otherwise                                             | D13 coordinator + source owner             | Inspect source receipt/readback, show truthful attention state, page only public/safety cases, never blind retry.                             |
| `giving_placement_projection_freshness_seconds`           | p99 >5 minutes for 15 minutes                                                                                 | D13 projection owner                       | Hide favorable/complete counts, show **Could not be checked**, run bounded reconciliation, inspect adapter/backlog fairness.                  |
| `giving_placement_preview_latency_seconds`                | p95 >2s or p99 >4s for 15 minutes on qualified profile                                                        | Mission Control Performance                | Switch excess discovery to tracked async path, inspect queries/cardinality, protect per-Tenant fairness.                                      |
| `giving_placement_owner_routing_dead_letter_age_seconds`  | Oldest actionable item >15 minutes                                                                            | Source workflow owner                      | Re-resolve current queue/authority, expose routing exception without hidden data, fix adapter; do not guess assignee.                         |
| `giving_placement_privacy_redaction_failure_total`        | Any value >0                                                                                                  | Privacy + Security                         | P0: disable affected preview/export/notification, contain caches/copies, assess exposure, fix field policy and snapshots.                     |
| `giving_placement_terminal_reference_cleanup_age_seconds` | Known current Core public placement still targets terminal address >30 minutes                                | Page/Communications owner + Public Runtime | Escalate the existing source-owned repair, preserve Stop, prioritize public impact, never redirect or reactivate.                             |
| `giving_placement_task_notification_duplicate_total`      | Any duplicate for same owner/logical lineage/cause/target/Preferred revision                                  | Source workflow + Communications           | Suppress duplicate delivery, preserve one request/history, repair dedupe before enabling more scopes.                                         |

## Ruthless synthesis — strongest path forward

### Required before D13 is recorded

Completed in this review:

1. Narrow automatic preparation to typed Core-managed placements.
2. Make D13 private preparation only, with no hidden publish/send effect.
3. Preserve source ownership, active human work, immutable artifacts, and
   non-enumerating permissions.
4. Define A→B→C, Stop/publication, partial-success, unknown-outcome, retry, and
   no-owner behavior.
5. Replace vague **Update links** language with exact grouped states, one
   consequence-labelled action, and durable itemized receipt.

### Required in the later PRD/design

1. Reconcile D13 with accepted ADR-0029/ADR-0032, founder-ratified D9–D12
   planning evidence, and the final merged form of Phase 22/23; do not silently
   treat planning or open PR prose as shipped.
2. Define the finite typed source-adapter registry and exact placement reference
   schema without creating cross-schema FKs or shadow content truth.
3. Define source-owned service-principal admission where genuinely needed;
   “service role” alone is forbidden.
4. Specify the Page generation/idempotency receipt and exact owner-routing
   seam; specify each other source's version/freeze/idempotency contract only
   before activating that source adapter.
5. Define retention/redaction/capability policy for preview, full URL,
   checklist, request, receipt, audit, and support detail.
6. Publish the production data census, certified quantitative limits, query/
   queue budgets, and rollout/kill-switch plan.

### Required implementation order

1. Prove each source contract before activating that source's adapter. Start
   with Page; Page rollout does not wait for unsupported Communications, which
   remains not changed until independently qualified.
2. Add prospective typed placement identities/references; classify legacy raw
   links as literal unless source-proved.
3. Build a read-only, non-enumerating, capability-filtered impact inventory and
   compare it with source truth.
4. Add Page private publication-candidate preparation through the one D1/Page
   generation command and source receipt; never rewrite authored content for a
   preference-only change.
5. Add Page review/release routing and public-outcome reconciliation.
6. Qualify Communications private preparation/freeze/send behavior separately.
7. Add only other proven source adapters; keep unsupported artifacts advisory.
8. Enable bounded cohorts behind per-source kill switches and the named
   monitors after authorization, concurrency, accessibility, usability, and
   load proof.

### Monitor, do not prebuild

- Do not build a crawler/external-site editor. Monitor visible **Not changed by
  Core** checklist use; Product owns any later evidence-backed adapter.
- Do not build a universal task/workflow platform. Monitor no-owner/routing
  exceptions; Page or Communications owns the response.
- Do not build cross-source atomic releases. Monitor partial/unknown outcome
  rates; source adapters and the coordinator improve bounded recovery.
- Do not invent high cardinality limits. Measure real source census and load,
  publish exact certified limits, then expand only with evidence.

## Repository and external research synthesis

### Repository facts verified on 2026-08-27

- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
  make tenant/permission correctness the first priority, prefer safe system
  behavior over repeated manual glue, and define clarity/accessibility/
  perceived speed as product completion criteria.
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
  assign operational Giving/workflow truth to CRM owners and public
  presentation/publishing state to CMS. They require server-side sensitive
  commands, role-scoped surfaces, tenant isolation, tenant-controlled
  publication, and Assistant authority no broader than the initiating human.
- [ADR-0029 — Reference-not-copy CMS↔operational](../../adr/0029-reference-not-copy-cms-operational.md)
  requires CMS to store stable operational references plus presentation while
  operational truth remains live and independently validated. Cross-schema
  links are soft and same-Tenant validated; there is no sync engine or hard FK.
- [ADR-0032 — Immutable prepared message and whole-message recovery](../../adr/0032-immutable-prepared-message-and-whole-message-recovery.md)
  freezes exact prepared content/identity before provider I/O and forbids
  rerendering, changed-content replay, or treating unknown submission as
  failure.
- Founder-ratified Phase 24 D9–D12 planning evidence requires privacy-safe
  absence, no Giving redirect/fallback, permanent address allocation,
  immutable human-readable slugs, direct same-meaning continuity, one
  nonrouting Preferred head, and irreversible source-owned Stop. It is not
  merged runtime authority.
- Current Page CTA fields `primaryCtaHref` and `buttonHref` are ordinary text,
  and the current email `donate_link` merge tag is an ordinary URL. They cannot
  prove a typed managed placement or safe backfill.
- Current Payload tenant access grants broad staff-level collection mutation,
  Pages use native drafts/publish and 300-ms autosave, and current CMS audit is
  logger output. These are implementation/migration facts, not D13-grade Page
  authority or durable business history.
- Current generic Mission Control tasks are service-only, but their child
  relations are not same-Tenant composite FKs, tasks have no semantic dedupe
  key, and the current creation helper targets the Finance Operations queue.
  Reusing this path without a source-owned contract would create debt and a
  confused-deputy risk.
- Open PR [#1323](https://github.com/Asymmetric-al/core/pull/1323) proposes one
  immutable Page Giving Binding, exact Page candidate/review/release, attributed
  staff revisions, and source-owned CAS. Open PR
  [#1340](https://github.com/Asymmetric-al/core/pull/1340) proposes coherent
  Working Revisions and source-derived Content Health. Both are open,
  mergeable, blocked, and review-required; they are proposed evidence, not
  current runtime authority.

### Current external/comparable evidence

- [Contentful version locking](https://www.contentful.com/developers/docs/references/content-management-api/overview/)
  requires the current resource version for updates and rejects a stale write.
  Its [bulk operations](https://www.contentful.com/developers/docs/references/content-management-api/bulk-entry-content-operations/)
  are asynchronous, bounded jobs with item/status evidence. Core should copy
  version fencing and honest partial outcomes, not Contentful's product model.
- [Contentful workflow permissions](https://www.contentful.com/help/ai-automations/workflows/workflows-roles-and-permissions/)
  separate edit/publish permissions and preserve explicit deny over a workflow
  allow. [Entry tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
  show the value and risk of content-attached work: unresolved tasks can block
  publication, but the API does not itself prove an assignee can read the
  entry. D13 therefore reauthorizes the owner and blocks only its successor,
  never Giving preference or Stop.
- [Sanity Content Releases](https://www.sanity.io/docs/user-guides/content-releases)
  group document versions for preview, validation, and deliberate publication;
  [Sanity roles](https://www.sanity.io/docs/user-guides/roles) separate content
  resources and actions. These support source-owned versions, not a global D13
  publisher.
- [WordPress roles/capabilities](https://wordpress.org/documentation/article/roles-and-capabilities/)
  distinguish editing from publishing, and
  [WordPress revisions](https://wordpress.org/documentation/article/revisions/)
  preserve saved/published history. Core keeps its finer exact-scope
  capabilities and immutable source evidence.
- [Mailchimp sent-campaign guidance](https://mailchimp.com/help/why-we-cant-stop-or-edit-sent-campaigns/)
  documents that sent content cannot be edited. Salesforce's official
  [CMS approval workflow](https://help.salesforce.com/s/articleView?id=xcloud.cms_workflows_basic_approval.htm&language=en_US&type=5)
  likewise supports a review/freeze lane. These reinforce successor-only
  correction after approval/send.
- [Givebutter URL guidance](https://help.givebutter.com/en/articles/2267413-how-to-customize-a-campaign-url)
  documents that changing distributed campaign URLs breaks earlier links; its
  [account roles](https://help.givebutter.com/en/articles/2118934-how-to-manage-account-users)
  show nonprofit staff commonly have scoped responsibilities. Blackbaud's
  [Donation Forms Security](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-ca/content/donfm-security-renxt.html)
  likewise separates view/add-edit/delete tasks. None defines Core's exact
  Page/Communications ownership.
- The [GOV.UK task-list pattern](https://design-system.service.gov.uk/components/task-list/)
  supports short, action-oriented tasks with visible text status; its
  [summary-list pattern](https://design-system.service.gov.uk/components/summary-list/)
  supports concise case-working facts and contextual actions. D13 uses those
  principles inside Core's Maia/Zinc design language, not their visual skin.
- WCAG 2.2 guidance for
  [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html),
  [focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html),
  [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html),
  and [minimum target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  supports 320-pixel reflow, logical navigation, noninterruptive programmatic
  status, and sufficiently large/separated controls.

### Evidence limits and unresolved unknowns

- No reviewed product implements Core's exact combination of immutable direct
  Giving addresses, nonrouting preference, no Giving redirect, multi-owner
  Page/Communications convergence, and terminal non-reuse. The final design is
  a Core product judgment constrained by its governing decisions.
- Actual preference-change frequency, placement count, source distribution,
  no-owner rate, and checklist use are unknown. The read-only census and named
  monitors make those assumptions falsifiable before more adapters are built.
- Open PR #1323/#1340 may change before merge. The later specification must
  reconcile their accepted final form, not copy the current open branch text.
- Phase 17 governs system-message publication and prepared delivery. It does
  not prove that every possible newsletter/campaign editor already has the
  required version/freeze adapter. Unsupported communication families remain
  **Source not available · Not changed by Core** until separately qualified.
- Current source cannot safely infer typed placements from raw href or merge-
  tag values. A prospective typed model is required; ambiguous legacy content
  remains literal.
- Representative nonprofit staff research has not yet proved the exact group
  labels, information density, or source-work-package grouping. Those may be
  refined through task-based testing, but testing cannot weaken source
  ownership, non-enumeration, immutable history, or no-public-effect
  **Prepare** semantics.

## Documentation and ADR status

`Core-managed Giving placement` is defined in root `CONTEXT.md`. The Phase 24
decision log records the founder choice, amended disposition, complete staff
journey, source boundaries, proof obligations, and next dependency. This report
is the durable D13 adversarial evidence appendix.

D13 is an ADR candidate: the no-global-writer/source-owner coordination model
is hard to reverse after source adapters exist, is surprising without context,
and resolves a real tradeoff between low staff effort and publication/
communications authority. An accepted ADR, OpenSpec delta, PRD, implementation
plan, ticket graph, migration, or runtime change is intentionally deferred
until the founder separately invokes the repository specification workflow and
the open Phase 22/23 authority is reconciled.

## Next dependent decision — D14

> **Resolved 2026-08-27:** D14 selected independently issued exact-locale
> Giving addresses. The question below is retained as the historical handoff;
> the controlling result is
> [`phase-24-d14-independent-locale-giving-address-adversarial-review.md`](./phase-24-d14-independent-locale-giving-address-adversarial-review.md).

### Plain-language context and impact

D13 now proves that every placement and prepared update belongs to one exact
source locale, but deliberately leaves target-address compatibility to D14.
The next decision is what a Giving address means when a Site is multilingual.

A **locale** is an exact language-and-formatting context such as English
(`en-US`) or French Canadian (`fr-CA`). It is not a currency, country, Site,
Legal Entity, Stripe account, or financial owner.

Example: Hope Missions publishes the Clean Water Giving page in English and
French. Should English and French have two stable addresses—such as
`hope.org/lang/en-us/give/clean-water` and
`hope.org/lang/fr-ca/give/eau-potable`—or should one
address silently change language based on the donor's browser?

This choice affects donor confidence, bookmarks, staff sharing, Page placement
scope, search, caching, analytics, translation readiness, language switching,
and what happens when one translation is not yet published. It does not select
currency or financial identity.

Current official evidence favors explicit identities.
[Google](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
recommends a different URL for each language version and says not to
automatically redirect users based on assumed language; it also recommends
visible language links. [W3C](https://www.w3.org/International/questions/qa-when-lang-neg)
says language negotiation is imperfect and users need a clear way to override
it. [Next.js](https://nextjs.org/docs/app/guides/internationalization) can
implement either subpath/domain routing or language negotiation, so the
framework does not make the product decision.

### Options

1. **When Site-level Giving is enabled and an exact locale presentation is
   ready, let authorized staff deliberately issue one independent address for
   it — recommended.** Each
   issued address has immutable exact-locale meaning and its own staff-approved
   readable slug. Publishing/enabling a Site locale never issues an address or
   enables Giving. A visible language switch appears only when both locale
   presentations and addresses are independently published/issued, current,
   compatible, and eligible. Browser language may suggest a choice, but never
   silently redirects. Missing French remains honestly unavailable rather than
   showing English at a French URL. This is clearest for donors, staff, search,
   caching, history, and D13 placement ownership; staff deliberately manage an
   additional address only where that exact presentation is ready.
2. **Use one locale-neutral address and negotiate language.** The URL is short,
   but identical links can show different content depending on browser/cookie,
   weakening reproducibility, cache/search behavior, staff preview, printed
   material, and exact-locale attribution. A wrong browser setting can surprise
   the donor.
3. **Give only the Site's default locale a Giving address.** Additional-locale
   Pages explicitly hand donors to the default-language Giving page. This is
   simplest operationally, but creates a mixed-language donor journey and
   makes real multilingual Giving incomplete.

### Recommendation

Choose Option 1. Where Site-level Giving is enabled and an exact locale
presentation is ready, it gives each language a stable, honest public identity
while keeping a visible user-controlled language switch. It never auto-enables
Giving or issues an address merely because a Site locale publishes. It also
makes D13 simple: an English placement can update only to an independently
issued address with the same exact stable Site Locale and Giving-entry meaning;
it can never drift to French or infer a language from the donor's browser.

### Exact question

When Site-level Giving is enabled and one published Site-locale presentation is
ready, should authorized staff deliberately issue that locale its own stable
Giving address, with a language switch only to another independently current
locale address and no automatic language redirect?

## D76 reconciliation (2026-08-30)

A Site Domain cutover does not rewrite Page, Navigation, message, QR, document
or other managed placements. Current source-owned placements are advisory D76
evidence unless their owner declares a hard dependency. Any successor is
prepared/published by that source under its existing capability and immutable
reference rules; D76 itself creates no placement task, edit or automatic URL
replacement.
