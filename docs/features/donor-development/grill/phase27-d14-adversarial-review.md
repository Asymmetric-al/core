# Phase 27 D14 — additional approved stage lists with clear everyday use

2026-10-10. **Founder selected A; review disposition: Accept; reviewed D14 explicitly ratified.** The founder allows
additional organization-approved stage lists when needed, explicitly requiring
clear and carefully considered UX/UI. Research against Core HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`, current working D1–D13 decisions and
fresh primary documentation. This is a completed capability decision review within
the continuing interview, not a formal specification, implementation or declaration
that the whole Phase 27 is ready.

The founder subsequently confirmed, “Yes, ratify this amended D14.” The exact
decision and reviewed safeguards below are explicitly ratified on 2026-10-10.
This confirmation adds no list-lifecycle, applicability, default, switching,
copying or permission policy. [Q15](phase27-q15-retiring-stage-lists.md) continues
the interview with the next single unanswered product choice.

## Exact decision recorded

> **D14 — Allow additional organization-approved stage lists when needed.**
> Organizations may keep and customize Asym's supplied stage lists and create
> additional approved lists for meaningfully different development processes.
> Useful supplied lists remain the simple starting point; creating another is
> optional. “Approved” uses the existing organization-governed configuration
> authority, not a new committee, second approver or approval queue.
>
> Each partnership journey has one applicable list and one shared recorded stage,
> or the permitted “Not yet assessed” condition. Authorized staff and missionary
> views use that same source understanding. A different list, staff member, team,
> screen or display preference does not create another ordinary partnership journey
> or confer access.
>
> Give authorized configurators a clear way to see existing lists, understand
> their differences and create a complete usable list. Keep ordinary partnership
> work focused on its current stage, responsible person and next action. Show
> relevant list context without making staff repeatedly choose a list that the
> source already establishes. Creating a list does not assign, switch or reassess
> existing work, set a default, generate follow-up or contact anyone.
>
> Preserve stable tenant/list/stage identities, historical meaning, current
> permissions and truthful save/retry outcomes. Do not introduce personal pipelines,
> an arbitrary workflow builder, automatic cross-list stage mappings or another
> record of supporter truth.

**No material amendment to A is necessary.** D14 newly permits list creation;
D10 had only settled customization within applicable lists. The requirements below
make this new capability safe and understandable without silently selecting the
[Q14 reservations](phase27-q14-additional-stage-lists.md): applicability, initial
suggestions/defaults, whole-list lifecycle, copying and changing an existing
journey's list. These remain genuine dependent product decisions. In particular,
a practical lifecycle for accidental/obsolete lists is required **before releasing
additional-list creation**, not an optional cleanup enhancement after launch.
Their exact ownership and safe boundaries are recorded below. No repeat
ratification is needed merely to preserve those explicit reservations, and no
next founder answer is inferred.

## Evidence and established facts

| Evidence                                                       | Scope and limit                                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [Ownership](d14-evidence/ownership.md)                         | ADR/OpenSpec/P27/P28/P33, D3/D10–D13, source work, DON-14 and the expressly unselected whole-list lifecycle.                    |
| [Authorization](d14-evidence/authorization.md)                 | P12 current context, configuration versus journey access, scoped references, grants/RLS, durable creation and privacy.          |
| [Implementation and mechanics](d14-evidence/implementation.md) | Current source reuse limits and a new isolated PostgreSQL experiment with precise scope.                                        |
| [UX and comparisons](d14-evidence/ux.md)                       | Shared Core components, admin versus daily work, input/read/recovery states, primary CRM/CMS/WCAG examples and usability proof. |
| [Ministry practice](d14-evidence/ministry.md)                  | Missions/nonprofit fit, strongest smaller alternative, stage-list sprawl, participation, reporting and sensitive names.         |

**Repository facts and intended behavior.** ADR-0001 keeps CRM authority in Asym
Postgres behind Core's server boundary. P27 owns cultivation; P28 consumes the
same model. P9 owns identity, assignments and shared tasks; P12 owns authority.
P13/P14/P16 retain gifts, recognition and commitments; P6/P17 retain communication
eligibility and delivery; P33 governs reporting meaning. Organization stage
configuration does not acquire those facts. D10–D13 already settle flexible stage
membership/wording/order, advisory guidance, direct eligible movement and optional
initial assessment. Those are durable intent, not proof of shipped functionality.

**Current source.** Fresh bounded searches did not find an authoritative P27
list-creation/source model in the inspected API, database, app and migration paths.
Existing named CRM views are personal presentation snapshots; donor boards and
status controls describe different facts. Their creation, naming, label grouping,
counts or UI behavior cannot simply become organization stage-list authority.
There are reusable shared forms and controls, but an apparently successful UI
save does not prove atomic list/stage/history/result persistence or safe retries.
The source appendix supplies exact paths; no production absence or exploit is claimed.

**Fresh external evidence.** [HubSpot](https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines)
recommends extra pipelines for processes needing different stages and shared
pipelines where teams use the same stages. [Pipedrive](https://support.pipedrive.com/en/article/how-can-i-have-multiple-pipelines)
similarly separates processes from salesperson/location segmentation. These
support avoiding unnecessary list proliferation; their permissions, probabilities,
commercial limits, automations and copying behavior do not become Core policy.
[MPDX's flow view](https://help.mpdx.org/article/773-flow-view) can group existing
statuses into named columns, illustrating that a different display need not mean
a different underlying process. This does not select a new Core board-grouping feature.

Nonprofit NPSP opportunity examples show different stage sets on a shared object,
but are opportunity/training-package analogies, not proof of current integrated
Salesforce behavior or missions agencies' ongoing cultivation requirements.
Contentful's parallel/automatically started workflows concern a different domain;
importing them would conflict with one applicable list and deliberate source work.
The existing Core rules take precedence. No external practice justifies a second
journey per viewer, compulsory progression or stage-derived giving/consent.

**Product judgment and unknowns.** Different organizations can plausibly need
meaningfully different processes. No interviewed missions customer or measured
Asym workflow establishes demand for a particular number of lists or proves this
interaction excellent. The strongest B already offers substantial flexibility
through customized stages and guidance. A is justified as an optional capability,
not a claim that more configuration improves outcomes. Usability, actual P12/API
behavior, workloads and migration/restore remain explicit qualification gates.

## Strongest alternative and minimum sufficient solution

B—customize supplied lists only—is simpler to administer, teach and compare.
It should remain a fully usable way to operate under A. Names, guidance, saved
views and direct stage choice can handle many variations without another list.
A is valuable when a combined vocabulary would become confusing or meanings would
conflict. “When needed” is guidance toward good configuration, not a compulsory
justification essay, central approver or arbitrary list-count quota.

Use organization-owned list definitions and their stable stage definitions on the
existing shared cultivation model. Reuse the D10 configuration editor, current
source commands, protected configuration history and durable command results.
No per-list schema, custom-field substitute, per-user copy of a journey, live
inheritance tree, mapping service, workflow language or new permission hierarchy
is justified. A supplied list is a usable starting configuration, not an upstream
write authority allowed to replace tenant choices on upgrade.

A list's readable name must distinguish it in the actual governed catalog. Names
remain display text, never identity or business-intent keys. The narrow naming
validation in R04 serves that clarity; it does not authorize an organization-wide
renaming migration or invent a global cross-tenant namespace.

## Concrete user experience

Use shared **base-maia**, Base UI and Core semantic tokens. Clear hierarchy,
consistent spacing, readable stage meanings and accessible states are required;
another design system or a decorative workflow canvas is not. Final component
selection/layout needs browser and staff validation, not a prescribed widget count.

**For an authorized configurator:** an organization settings area titled **Stage
lists** shows the permitted lists by recognizable name, optional short explanation
and **View stages** or permitted edit action. Keep supplied lists useful without
requiring setup. Show **Create stage list** only where the current person can
perform that action; configuration rights do not imply access to the partnerships
that use a list. Do not load private journey rows merely to build this index.

The minimal creation editor has:

```text
Create stage list

List name
[Recognizable name]

When to use this list (optional)
[Short guidance for staff]

Stages
[Stage name]  [Optional guidance]  [Move up / Move down]
Add stage

This creates a stage list. Existing partnership work stays unchanged.

Create stage list    Cancel
```

This is an illustrative composition, not a new persistence lifecycle or final
pixel layout. Stage ordering remains presentation only. The author can preview
what staff will see without a mandatory separate preview/approval step. At least
one selectable stage is required for a list made available for new work. An empty
unsaved form is legitimate; a half-saved usable catalog is not. No default stage,
permissions matrix, workflow rule or compulsory rationale is hidden in the editor.

Require a nonblank readable name. Optional **When to use this list** is help for
future users, not a justification for an approver. An exact conflicting display
name should receive a field-linked **Use a name that distinguishes this list**;
show an existing matching list only when permitted. Similar names can be clarified
through guidance/preview without fuzzy rejection or another acknowledgment.
R04 requires one authoritative comparison/disclosure contract before implementation.

There is one deliberate create action, truthful saving status and an accepted
result identifying the saved list with **View stages**. Do not announce “Assigned,”
“Default” or “Ready for every ministry” unless a separately qualified source action
actually established that fact. Do not require an assignment wizard to finish
creation. After a lost response, reconcile the same intent before creating again;
a matching name alone cannot prove success.

**For everyday staff or an authorized missionary:** keep the partnership context,
recorded stage, responsible person and actual next work prominent. Display the
applicable list's recognizable name where needed to explain the choices. A
source-established list can be readable context; no repeated chooser is necessary.
If the later applicability decision requires a choice, its permitted choices must
be understandable. Neither always asking nor automatically choosing the first list
is selected here. Viewing another list in settings or filtering a board never
switches a journey's list.

| Situation                                                 | Required clear behavior                                                                                                                                                                              |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing lists could already serve the process            | Let the configurator inspect their stages/guidance. No forced new list or required justification.                                                                                                    |
| No lists visible                                          | Distinguish a true authorized empty result from loading, failure, filtered results or restricted visibility. Do not invent a default list.                                                           |
| Empty unsaved editor or invalid stage                     | Keep the draft, explain the specific input error, and accept no partial usable configuration.                                                                                                        |
| Same/similar names                                        | Exact naming conflicts use permitted field-linked feedback; similar names use readable context. Never merge identities, silently overwrite or make staff choose by UUID.                             |
| Long names, translated collision or RTL                   | Preserve a distinguishable selected summary and accessible name, logical reading order and full text where needed. Do not rely on truncation, color or hover alone.                                  |
| New list uses familiar stage labels                       | Show list context where labels from several lists appear. Same text is not equivalent meaning or a shared stage ID.                                                                                  |
| Person can configure lists but cannot view their journeys | Show permitted configuration only. Usage counts, history or links require their own authority and known coverage.                                                                                    |
| Current permission changes while the editor is open       | Save rechecks current authority; retain only safe recoverable draft/context and give permitted recovery. Do not borrow another actor's authority.                                                    |
| Required definition cannot be saved                       | The create operation fails atomically; no empty shell or selectable partial list is exposed.                                                                                                         |
| List saved, then response lost or index refresh fails     | Distinguish accepted configuration from an unconfirmed outcome or stale projection. Reconcile receipt/current state; do not submit a fresh create blindly.                                           |
| Concurrent edit after successful creation                 | Reuse D10's expected list revision. A replayed creation receipt is historical evidence, not permission to reset later edits.                                                                         |
| Existing journey has no recorded stage                    | D13 still applies within its valid source list; creating another list cannot reclassify it or weaken responsibility.                                                                                 |
| Existing recorded stage is retired                        | D10's stage-retirement behavior remains; new-list creation neither replaces it nor changes earlier meaning.                                                                                          |
| Accidental or obsolete whole list                         | A practical source-owned lifecycle must be resolved before releasing creation. Do not substitute destructive deletion, silent migration or permanent clutter. The reserved choice is detailed below. |

Essential actions and meaning must work by keyboard, screen reader and touch.
Provide a non-drag single-pointer way to reorder independently of keyboard support.
Use Core's 44 CSS-pixel touch convention, visible focus, meaningful labels/error
associations and programmatic save/result announcements. Test 200% text resize
separately from 320 CSS-pixel effective reflow, mobile soft keyboards, long translated
text, RTL and reduced motion. Preserve international names without ASCII/slug-only
requirements. Show audit times through existing locale/time-zone conventions;
list creation adds no due date or timezone-dependent business schedule. Low bandwidth
requires honest pending/retry and draft preservation, not a new offline-write queue.
Nothing adds a step to donor/public giving or changes missionary access.

## Exact requirements to carry forward

**R01 — Bounded organizational capability.** Authorized organization configuration
SHALL support additional stage lists on the shared cultivation model. Supplied
lists SHALL remain usable without customization. No new list SHALL be required
merely for a staff member, team, location, screen, prayer/financial participation
or display preference; those facts alone SHALL NOT automatically create one.
An additional list SHALL NOT constitute a second ordinary journey under D3.
This does not impose a compulsory rationale, quota or second approver.

**R02 — Stable identity and shared meaning.** P27 SHALL own stable tenant-scoped
list identity and tenant/list-qualified stage identities and definitions. Each
journey has one applicable source list and a valid recorded stage from it or
D13's permitted absence. Authorized surfaces SHALL consume the same source
understanding. Labels, translations, order and list length SHALL NOT identify,
merge or establish equivalence between lists/stages. Same-meaning rename and
stage edits inherit D10; no ordinary operation may rewrite earlier accepted meaning.

**R03 — Configuration authority is not record authority.** Resolve the actor,
active context and tenant server-side using current P12 rules. Re-prove capability,
actual catalog scope, processing purpose, entity/source floors where applicable,
field/history/result visibility, residency and current epoch. Proposed reference,
owner or target IDs are inputs to validate, never trusted authority or attribution.
Being a lead, missionary, list creator or configurator SHALL NOT grant admission,
assessment, switching, journey history or usage-count access. Organization-owned
configuration SHALL NOT disappear or transfer authority when its creator leaves.
D14 adds no per-list ACL system, personal ownership model or new broad role grant.

**R04 — Distinguishable and modest configuration.** An ordinary new list SHALL
have a nonblank readable name distinguishable within its actual governed catalog;
optional short guidance MAY explain when to use it. Reject an exact canonical
display-name conflict through one server-authoritative validation/constraint
contract with permitted field-linked feedback; do not apply global/other-tenant
uniqueness or infer identity from the name. Qualify the existing input/language
policy's trimming/comparison and concurrent collision behavior before coding;
if no such policy exists, record an explicit consistent design rather than relying
on a database/browser collation accident. Similar names SHALL NOT trigger fuzzy
blocking. Unicode/localized collisions and disclosure of name availability require
proof. Before attempting creation, independently establish current authority for
the minimal name-availability/conflict outcome over the declared naming scope,
in both existing and absent cases. Create permission alone is insufficient.
Without that authority, do not attempt a creation whose result would reveal hidden
existence; use the same permitted unavailable outcome in both cases. This neither
expands grants nor requires access to full list details. Qualify the naming scope
and safe disclosure together. No automatic rename of retained lists,
mandatory description, new translation system or journey-admission field follows.

**R05 — Complete atomic creation.** Create SHALL accept a finite validated list
configuration, required stage definitions, configuration evidence and durable
result atomically under the source command. A list available for new work SHALL
have at least one selectable stage. No accepted empty shell/partial catalog may
appear after a failed child write. An unsaved draft may be incomplete; persisted
drafts, publication states and a separate approval step are not selected. New
creation has no prior list revision to match; validate current context/references
and intent instead. Fence current authorization/epoch and referenced-definition
eligibility with the accepted write; a detached preflight followed by an
unconditional privileged write is insufficient. Revocation effective before
acceptance prevents the effect; revocation afterward restricts current reads/replay
without undoing accepted history. Later edits use D10 expected-revision checks. Do not serialize
all tenants' catalog creation behind an unnecessary global lock.

**R06 — Durable intent, truthful retry and failure.** Scope creation intent by
actual tenant/operation and normalized business payload with a durable identity.
The same accepted intent returns the same created list/result without duplicate
stages or events; changed payload under that identity conflicts. A genuinely new
intent has its own identity and still satisfies naming/input rules. Do not use a
transport request ID, readable name or selected count as the sole effect identity.
Replay checks current disclosure and separates the historical creation result
from current configuration; it SHALL NOT overwrite later edits. Precommit failure
rolls back required facts; lost response after commit reconciles them. Secondary
projection failures do not undo accepted creation. Any required secondary intent
uses the existing durable-dispatch pattern; network requests do not extend the
source transaction. Late callbacks cannot replace newer authoritative UI state.

**R07 — Structural integrity and permitted mutation paths.** Enforce required
Tenant and applicable source/catalog references independently of D13's optional
stage. A present journey stage SHALL belong to its exact tenant and list: separately
valid same-tenant list and stage FKs are insufficient without their relationship.
List identity SHALL NOT enter the ordinary journey's dedupe boundary as a way to
permit duplicate same-purpose work. Do not allow mutable scope, direct reassignment,
FK cascade/SET NULL or an ordinary create/update to orphan/remap existing references.
Use appropriate keys, nullability, checks, FK delete behavior and scoped indexes;
physical column names/DDL are design choices that must prove these invariants.
No currency/money representation changes follow from catalog creation.

**R08 — Defense in depth across every writer and reader.** Keep internal source,
configuration history and receipts behind qualified API boundaries. Verify effective
table/column/function grants, nonowner RLS USING and resulting-state WITH CHECK,
views, RPC owner/search path and privileged service/operator paths. An omitted
WITH CHECK may inherit USING; it is not automatically a bypass. Null, create,
configuration-only or service-role paths SHALL NOT bypass current authority.
Client caches/search indexes, subscriptions, exports and receipts SHALL retain
scope and policy context. Configuration read does not imply journey/usage history
read. Extra permissive policies, caller-forged attribution and allowed-old/forbidden-new
updates require negative proof; UI hiding is insufficient.

**R09 — Configuration creates no partnership effects.** List creation SHALL NOT
admit/switch journeys, select/reset their stage, change an initial default, reset
assessment/contact times, change assignments, create source work/reminders, send
messages or activate automation. It SHALL preserve active, paused, closed, reopened
and unassessed work and all independent financial/participation/consent facts.
DON-14's source enrollment/transition is not a configuration-created event. Optional
Studio/provider availability SHALL NOT gate qualified native configuration. A newly
created list does not bind a recipe or introduce stage-specific obligations.

**R10 — Shared clear UX and truthful state.** Implement the contextual organization
editor and ordinary-work distinction above using shared Core UI. The source's
applicable list SHALL be understandable where needed; no repeated chooser when
it is already established, and no first-option fallback where it is not. Browsing
configuration, a saved view or another board filter SHALL NOT change a journey.
Distinguish loading, true empty, filtered empty, denied, invalid, pending, accepted,
stale/conflict and unconfirmed outcome. Show actual allowed next actions without
new permission-request machinery or fake success. Preserve D11–D13 stage selection,
optional assessment and accountable next work. Essential explanation and actions
SHALL be available without hover, color, drag or a specific viewport alone.

**R11 — Truthful reads, reporting and data minimization.** Retain list/stage scope
and relevant historical definitions in reads and offered reports. Ordinary work
views SHALL not lose eligible records because a new list is unsupported; explicit
filters must describe their narrower scope. Apply authorization before counts/
grouping; distinguish partial/stale/unavailable coverage from measured zero.
Comparable counts of journeys may be combined under one declared population, but
labels/ranks SHALL NOT silently imply equivalent progress, probability, donor worth
or financial totals. P33 owns qualified cross-list metric meaning; no mandatory
mapping engine is introduced. Names/guidance can reveal sensitive ministry context:
restrict their projection, logs, exports and retention, and collect no unnecessary
supporter narrative. Render names/guidance as escaped text through shared controls,
not executable HTML, code or templates; offered exports SHALL apply their qualified
encoding/spreadsheet-formula safeguards. Do not add a bespoke sanitizer or assume
admin-authored text is safe for every later consumer. Durable configuration history, security audit and diagnostic
logs remain distinct. Existing qualified redaction/erasure also applies to backups.

**R12 — No implicit copy or external ownership.** Creation SHALL NOT require clone,
live inheritance, imported rules, public template sharing or an external CRM.
If separately offered, copying SHALL create independent identities from permitted
configuration only and shall not copy journeys, stage visits, grants, defaults,
applicability or consumed effects by implication. Supplied template updates retain
D10 deliberate adoption; they cannot overwrite tenant meaning/history. Qualified
imports use explicit stable scoped mappings, not nearest-name matching, auto-created
lists or source-authoritative provider labels. Core remains authoritative when
an adapter/provider disagrees; preserve exception evidence and reconcile at the
owning source rather than trusting a delayed external event.

**R13 — Compatibility, migration, restore and performance.** Before activation,
qualify all reached readers/writers, rules and projections for dynamic multiple
lists; identify single-list assumptions, fixed enums and label-only groupings.
Census retained configuration/records and map only proved identity/meaning. Do not
merge same-named stages, silently split old work, fabricate lists/assessments, run
retrospective outreach or overwrite customized starters. Gate incompatible old
writers and readers; disable/roll forward with accepted records/history preserved.
Restore reconciles current definitions, revisions, authority/redaction and consumed
create/effect receipts before paths reactivate. Missing source is not empty config.
Define payload/query budgets with actual list/stage counts, histories, tenant skew,
concurrency and byte/character semantics; test boundary and one-over cases. Use
bounded scoped queries/pagination and justified FK/search indexes; avoid per-list
journey scans, N+1 options loads and global invalidation. Record plans and p50/p95
milliseconds before choosing capacity/SLOs; no vendor quota or toy-test timing is a
Core performance claim.

**R14 — Required product qualification before release.** Before additional-list
creation is released as an operable tenant feature, P27 with P12/P9/P28 SHALL resolve
and qualify (a) applicability and how a journey receives its applicable list; (b) practical treatment
of accidental/obsolete lists, including retained use/history and permitted recovery;
and (c) any actual initial-default or switching behavior offered. Until qualified,
those dependent operations SHALL remain unavailable rather than using a guessed
fallback. Stage retirement under D10 does not define whole-list retirement.
Creation SHALL NOT destroy, withdraw, remap or supersede existing lists implicitly.
No persisted draft/publish/archive state, hard delete, Restore, forced migration
or permission change is selected by this gate. This is a prerequisite, not a
monitor-only risk or a reason to ship permanent clutter. Optional copy and advanced
reporting can remain absent; exact native core behavior cannot depend on them.

**R15 — Proof and traceability.** Carry D14's decision and R01–R15/AC01–AC18 into
the glossary/log now, then the formal OpenSpec/design/tasks and issues only under
the requested `/to-prd` and `/to-issues` workflows. Trace each safeguard to actual
source, real-role database/API tests, accessible browser outcomes, migration/restore
and release evidence. A fixture or mockup SHALL NOT qualify the product. The
existing architecture covers the capability; a new ADR is unnecessary unless
later choices introduce a genuinely new cross-domain tradeoff.

## Full category review

All 22 categories were evaluated independently. Severity is prospective consequence;
likelihood is conditional engineering judgment before safeguards, not a measured
incident rate. **Critical** indicates isolation/disclosure failure; **High** false,
lost or inaccessible authoritative work/configuration; **Medium** material friction,
maintenance or performance cost. Evidence abbreviations refer to the appendices:
**O** ownership, **A** authorization, **I** implementation/mechanics, **U** UX,
**M** ministry. Every row specifies effect on the answer and exact prevention/proof
references; the R clauses are the precise developing-spec language.

| Category                                                         | Material concern, what fails and why it matters                                                                                                                                                                                | Severity / likelihood; evidence                                      | Effect on A and permanent fix                                                                                                                                                    |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity, necessity and alternatives                  | **Yes.** New lists may solve presentation/team preferences that existing guidance/views already handle, leaving unnecessary choices. B is a credible simpler path; no measured agency demand proves list proliferation useful. | Medium / plausible; O/U/M and primary CRM guidance.                  | Retain A as optional; supplied lists remain useful, with no quota/justification workflow. R01/R04/R10, AC01/02/17.                                                               |
| 2. Brittleness                                                   | **Yes.** Fixed enums, first-list fallbacks, viewer-specific defaults and same-label matching break when a second list arrives.                                                                                                 | High / likely if current presentation code is reused unchanged; I/U. | Narrow reuse; dynamic scoped identities/current source context, no implicit list choice. R02/R07/R10/R13, AC05/11/14.                                                            |
| 3. Technical debt                                                | **Yes.** Personal saved views, JSON field tricks, per-list models and copied workflow rules create competing authorities or synchronization.                                                                                   | Medium / plausible; O/A/I.                                           | One source list/stage model and shared commands/editor. R01/R02/R05/R12, AC01/04/18.                                                                                             |
| 4. Edge cases                                                    | **Yes.** Similar names, no eligible/visible choices, creator departure, unassessed work, retired stages and accidental lists can confuse or strand users.                                                                      | High / plausible; O/A/U.                                             | Explicit state table and source-owned eligibility; lifecycle is a prerequisite, not guessed behavior. R03/R04/R10/R14, AC02/03/11/16.                                            |
| 5. Footguns                                                      | **Yes.** Double-click creation, clone-everything, name-key upsert, first-option assignment or destructive list deletion can corrupt work/history.                                                                              | High / plausible; A/I/U and vendor clone/delete comparisons.         | Durable create intent, explicit names versus identity, no implicit effects/copy/deletion. R05–R09/R12/R14, AC04/06–AC10/16.                                                      |
| 6. Tenant safety                                                 | **Yes.** Shared catalog caches, same-tenant wrong-list stages, foreign scope or permissive configuration reads can mix tenants/contexts.                                                                                       | Critical / plausible; A/I.                                           | Exact tenant/list/stage references plus current scoped reads and current replay disclosure. R02/R03/R07/R08, AC05/09/12.                                                         |
| 7. Database, RLS and authorization                               | **Yes.** Independently valid FKs can allow a stage from another list; raw/API grants or resulting-state changes may bypass source contracts. Partial child persistence leaves unusable accepted configuration.                 | Critical / plausible; A/I and fresh PG/Supabase evidence.            | Composite relationship integrity, atomic acceptance, trusted attribution, real nonowner USING/WITH CHECK and privileged-path proof. R03/R05–R08, AC04–AC09. Money is unaffected. |
| 8. Overengineering                                               | **Yes.** Approval committees, per-list ACLs, inheritance, quotas and workflow builders solve unproven needs and burden small teams.                                                                                            | Medium / plausible; O/U/M.                                           | Bounded creation with existing authority; no extra required machinery. R01/R03/R04/R12, AC01/03/13.                                                                              |
| 9. UX/UI and friction                                            | **Yes.** Setup in daily work, repeated list choices, indistinguishable labels, inaccessible reorder or unclear save results cause wrong choices and loss of confidence.                                                        | High / likely without deliberate composition; U/I.                   | Separate configuration from contextual daily action; one clear commit, truthful states and accessible distinctions. R04/R10, AC02/03/10/11/17.                                   |
| 10. Source of truth, ownership and invariants                    | **Yes.** Another list can become another journey, assessment, access group or donor/giving authority, violating D3 and source ownership.                                                                                       | High / plausible; O/A/M.                                             | One applicable source list/current assessment, stable identities, unchanged ordinary-journey boundary and independent financial/consent facts. R01–R03/R07/R09, AC01/05/08/13.   |
| 11. Hidden coupling                                              | **Yes.** Staff/missionary surfaces, DON-14 bindings, copied template rules or a default catalog order can silently select different meanings.                                                                                  | High / plausible; O/U/I.                                             | Shared source context, configuration not enrollment/transition, qualified adapters and no first-list fallback. R02/R09/R12–R14, AC11/13/14.                                      |
| 12. Failure modes                                                | **Yes.** Header succeeds but stages/history/receipt fail; response loss causes duplicate lists; projection failure looks like rejected creation.                                                                               | High / likely with independent writes; I/A.                          | Atomic source write, stable receipt, independent current read and reconciliation; visible qualified repair. R05/R06/R10/R13, AC04/06/07/10.                                      |
| 13. Lifecycle, temporal correctness, concurrency and idempotency | **Yes.** Concurrent creates can duplicate effects; old receipts can reset newer edits; stage retirement may be mistaken for whole-list lifecycle.                                                                              | High / plausible; O/A/I.                                             | Durable scoped intent, new-create versus edit semantics, no history reset; whole-list policy required before release. R05/R06/R14, AC06/07/10/16.                                |
| 14. Data integrity                                               | **Yes.** Name dedupe merges different lists; list identity in journey uniqueness duplicates the partnership; label-based import/grouping loses meaning.                                                                        | High / plausible; O/A/I/M.                                           | Stable scoped identities, documented naming validation, preserved business identity and explicit mapping/coverage. R02/R04/R07/R11–R13, AC02/05/08/12/14.                        |
| 15. Security and privacy                                         | **Yes.** List names/guidance can disclose sensitive work or be mishandled as executable text; name conflicts, usage counts and old receipts can enumerate protected information.                                               | Critical / plausible; A/U/M.                                         | Current configuration/result/record permissions, safe collision feedback, minimized metadata/logs and qualified retention. R03/R04/R08/R11/R13, AC03/09/12/15.                   |
| 16. Scalability and performance                                  | **Yes.** Unbounded catalog loads, per-list journey counts, N+1 pickers and global invalidation degrade with tenant skew/stage history.                                                                                         | Medium / plausible as data grows; I/U; no measured Core capacity.    | Scoped bounded reads/indexes; representative plans and explicit budgets/units, not borrowed vendor caps. R13, AC17/18.                                                           |
| 17. Operational burden                                           | **Yes.** List sprawl and create-only administration produce clutter; uncertain results can force direct database repair.                                                                                                       | High / plausible; O/U/M.                                             | Useful shared starters, source-linked reconciliation, and an explicit lifecycle decision before creation ships. R01/R06/R10/R14, AC01/10/16.                                     |
| 18. Observability and auditability                               | **Yes.** Staff cannot tell who created a list, which definition was accepted, or whether retry is safe; raw logs may expose private text.                                                                                      | High / plausible; A/I/O.                                             | Durable configuration history/result with trusted actor and accepted revision; separate minimal technical/security evidence. R03/R05/R06/R11, AC04/07/10/15/18.                  |
| 19. Dependency and integration                                   | **Yes.** Vendor clone/deletion behavior, imports and optional recipes can bypass Core meaning or introduce inconsistent versions. No new provider is necessary.                                                                | High / plausible; O/A/U and primary versioned API evidence.          | Core owns configuration; independent qualified adapter mappings and all-path constraints, no copied grants/effects. R08/R09/R12/R13, AC09/13/14.                                 |
| 20. Migration, rollout and upgrades                              | **Yes.** Old one-list readers/writers, template overwrites, guessed mappings and destructive rollback can lose accepted configuration/history.                                                                                 | High / plausible; O/A/I/U.                                           | Census, compatible versions, gated activation, safe roll-forward/disable and restore reconciliation. R12/R13, AC14/15.                                                           |
| 21. Testability, traceability and proof                          | **Yes.** A passing create fixture can be mistaken for source permissions, correct naming, complete lifecycle or beautiful usable UI.                                                                                           | High / likely without bounded claims; all evidence.                  | Explicit AC/source-to-release chain, real actor/browser/workload/pilot gates and visible remaining product prerequisites. R14/R15, AC01–AC18.                                    |
| 22. Other development hazards                                    | **No additional material concern identified.** Checked new financial precision, provider spending, public giving steps, AI decisions, offline queue and independent infrastructure; D14 requires none.                         | No separate new risk; checked scope and owner boundaries.            | R01/R09/R12/R15 keep those capabilities out. No speculative subsystem or extra approval process added.                                                                           |

## Acceptance criteria and release proof

These are future product proof obligations. Only the explicitly bounded experiment
below has run; no wording here implies P27 passes these criteria today.

- **AC01 — Useful optional capability.** A tenant can continue with supplied lists,
  customize one, or deliberately create an additional usable list under current
  authority. No individual/team/location/view requires another list automatically;
  same ordinary work is not duplicated. Existing configuration remains intact.
- **AC02 — Clear names and stage identity.** Test blank/whitespace names, exact
  canonical conflicts, simultaneous name collision, similar names, Unicode and
  translated display collisions under the documented policy. For an actor lacking
  minimal availability/conflict disclosure, hidden-present and absent names yield
  the same permitted unavailable outcome without attempting an existence-revealing
  create. Feedback is permitted
  and field-linked; no identity/intent merge by name, arbitrary ASCII restriction
  or forced legacy renaming. Same stage label in two lists retains different scoped
  identities and understandable context in offered combined views.
- **AC03 — Authority and appropriate friction.** Configuration-only, journey-only,
  lead-only, read-only, missionary and revoked actors receive precisely their
  permissions. Configuration grants no usage counts/private journey history;
  ordinary staff do not enter settings or justify a new process to change a stage.
  Optional list guidance is not mandatory approval text or a journey field.
- **AC04 — Complete atomic configuration.** Fail before each required stage,
  configuration-history and receipt write and before commit. No partially accepted
  list is selectable or visible as success. A concurrent ordinary observer sees
  no uncommitted shell. A successful new list records actual definitions, trusted
  actor/time and durable result once; all existing configuration/work stays intact.
- **AC05 — Real relationship constraints.** Actual migrations/commands reject
  cross-tenant and same-tenant wrong-list stages, missing required scope, mutable
  scope, inappropriate FK cascade/SET NULL and raw list reassignment. D13 absence
  still requires a valid list/source. No list identity in a dedupe key permits a
  second ordinary journey for the same business scope.
- **AC06 — Concurrent create and response loss.** Two submissions of the same
  business intent, including simultaneous execution and lost response, create one
  list and one required result/history. Different normalized payload under the
  same key conflicts. A fresh intent does not reuse a prior list merely because
  names match; it obeys current name validation. Test no bypass through import/RPC.
- **AC07 — Historical result versus current configuration.** After creation, accept
  a later authorized edit, then replay the old create. Recover the original
  permitted receipt separately from current revision; never reset the edit,
  recreate deleted/redacted text or repeat side effects. If disclosure was revoked,
  the replay response reveals no forbidden configuration or journey information.
- **AC08 — No partnership side effects.** Compare accepted source identities,
  list references, stages, history, responsibilities, asks, work, consent and financial
  facts before/after creating another list. Active, paused, closed/reopened and
  unassessed examples remain unchanged. Creation is not a stage transition,
  acquisition, admission, donor response or instruction to send a message.
- **AC09 — Actual database/API authorization.** Test real nonowner and relevant
  service contexts across SELECT/INSERT/UPDATE/UPSERT/DELETE/RETURNING, views/RPCs,
  grants, extra policies, tenant rebinding, config-to-journey escalation, forged
  attribution and revocation. Force both orders: revocation effective before
  acceptance prevents the effect; after acceptance it governs current disclosure
  without rewriting history. Prove both old-row access and allowed resulting state; a successful privileged fixture is not sufficient.
- **AC10 — Failure and recovery UI.** Exercise slow save, duplicate click, offline
  failure, timeout before commit, lost response after commit, stale index/cache,
  delayed callback and permission loss. Pending/accepted/unconfirmed/conflict are
  distinguishable; draft and next action remain usable where permitted. Operators
  can reconcile through the qualified source rather than routine direct SQL edits.
- **AC11 — Context without accidental selection.** All offered staff/missionary
  views of one journey show its source list/stage consistently under permission.
  Viewing settings or changing a view filter changes no source list. An established
  list does not cause a repeated chooser; unresolved applicability never uses first
  list/order as authority. Loading/filtered empty/true empty/denied/failure are distinct.
- **AC12 — Honest counts and reports.** Test pagination, list/stage filters, combined
  views and offered exports with multiple lists, equal labels, retired stages,
  unassessed records and denied/partial coverage. Authorized population totals
  reconcile; equal names/ranks never manufacture progress/forecast equivalence or
  leak hidden usage. Configuration history is not counted as stage movement.
- **AC13 — Native operation and adapters.** Create/configure using real native
  sources with optional Studio/external providers unavailable. No new DON-14 binding
  or effect is inferred. Duplicate/out-of-order adapter events preserve source
  ownership, scoped intent and meaningful reconciliation; incompatible imports
  neither auto-create catalogs nor adopt another provider's labels as identity.
- **AC14 — Mixed versions and migration.** Census retained data and qualify supported
  old/new code/schema combinations. Preserve proven source identities and uncertainty;
  no silent same-name merging, per-surface splits, customized starter overwrite or
  automatic assessment/outreach. Gate incompatible paths; disable/roll forward
  without dropping accepted additional lists or rewriting history.
- **AC15 — Restore, privacy and creator departure.** Restore before later config
  edits, revocation, redaction or completed effects; reconcile those fences before
  serving writes/reads/workers. No stale configuration, erased narrative or consumed
  effect is revived. Creator departure does not delete organization-owned lists,
  orphan stages or grant the replacement actor automatic authority. Script-like
  names/guidance and spreadsheet formula prefixes remain inert text through every
  offered display/export; no sensitive content appears in diagnostic logs.
- **AC16 — Whole-list lifecycle release gate.** Before releasing creation, the founder
  and P27/P12/P9/P28 owner contracts settle and prove practical accidental/obsolete
  list treatment, applicability and any offered switching/defaults. Real scenarios
  cover existing/unassessed/paused/closed journeys, historical references, concurrent
  admission/edit, last usable choice, applicable defaults and recovery. Stage-level
  retirement or a hard-delete button does not satisfy this gate by analogy.
- **AC17 — Accessible, understandable staff use.** In actual browsers, exercise
  create/cancel/edit, daily Set/Change stage and recovery with keyboard, screen reader,
  touch and non-drag controls; test 200% text resize, 320 CSS px effective reflow,
  RTL, long translations, reduced motion and soft keyboards. Representative tenant
  configurators/staff and appropriately authorized missionaries identify a list's
  purpose, configuration versus partnership changes, saved outcome and next action
  without moderator rescue for a critical task. Record observed failures and device/
  assistive-tech versions; any reproducible critical confusion blocks expansion.
- **AC18 — Measured operation and traceability.** Declare representative list/stage/
  history counts, tenant skew, payload bytes/characters, concurrent users and approved
  budgets before workload tests. Retain plans, p50/p95 milliseconds and boundary/
  one-over results; no silent truncation or incomplete totals. Trace each D14 R/AC
  through later authorized spec/design/tasks/issues, real source tests, audit and
  release evidence. Avoid private names/guidance in routine telemetry.

## Evidence actually executed and limits

Five focused research appendices inspect current source/owners and current primary
documentation. The new disposable [list-creation probe](d14-evidence/list-creation-probe/README.md)
ran **14 checks on PostgreSQL 17.11; 14/14 passed**. “Passed” includes reproducing
explicitly broken-design counterexamples and verifying the positive fixture's
assertions, not certification of the future product.

The novel evidence covers: independently valid references accepting a wrong-list
stage versus a compound relationship rejecting it; atomic new list/stage/history/
receipt persistence; rollback during child creation and after the command; absence
of partial uncommitted visibility; an exact-blocker concurrent duplicate-create
schedule producing one result; name-based dedupe and label-based grouping traps;
separate configuration and journey grants; and unchanged existing journey facts.
The fixture intentionally permits repeated display labels to demonstrate why
names cannot be identity; it does **not** implement or validate R04's proposed
production naming policy. No actual list lifecycle or switching behavior is tested.

The probe does not contain Core P12, Supabase Auth/PostgREST, actual application
commands/tasks, UI, production naming/collation, migration/restore or a workload.
Synthetic grants and owner calls are explicitly bounded. Sources, results, hashes,
execution/isolation metadata and verified cleanup are retained; earlier D10–D13
checks were not rerun or relabeled. No live tenant data, configuration or provider
was accessed or changed. No actual staff feedback is claimed.

Independent consolidated ownership, authorization and UX reviews found no product
amendment needed. Their precision corrections are incorporated: applicability does
not preselect a manual-choice policy; name-availability disclosure is separately
authorized before an existence-revealing create; and current authorization/epoch
is fenced with acceptance rather than checked only in detached preflight. These
are existing owner safeguards, not additional role grants or approval steps.
Final artifact verification passed: Prettier on all touched Markdown,
`git diff --check`, 138 local links across 11 Markdown files, exactly 22 category
rows, 15 requirements, 18 acceptance criteria and all seven required adversarial
headings. The three probe input hashes and Python syntax match; container absence
was independently rechecked and decision/glossary/question status is consistent.
These checks cannot establish product behavior or excellent UX.

## Synthesis, ownership and order

1. **Before recording D14:** settle the bounded additional-list capability,
   organization ownership, one shared journey/list understanding, safe new creation,
   no automatic effects and clear admin/daily UX. R01–R12 make A precise. No inspected
   governing contract invalidates it; current presentation code and external products
   are precedents with explicit limits, not substitutes for Core source contracts.
2. **Next necessary product qualification before implementation/release:** P27 owns
   list applicability and whole-list lifecycle with P12/P9/P28. The strongest minimal
   lifecycle recommendation is to stop offering an obsolete list for new admissions
   while existing work retains its source-governed operation and history. It avoids
   forced migration/deletion, but it is **not adopted by D14**: handling ongoing stage
   choice, reopening, restoration and defaults is a real product tradeoff reserved
   by Q14. Bring that decision through the interview; do not manufacture a Retire
   state in code. Applicability/defaults/switching also need their exact choices
   before those paths ship. This is a named release prerequisite under R14/AC16,
   not a vague future enhancement or monitor-only risk.
3. **Capture in the later formal artifacts:** P27 carries R01–R15/AC01–AC18, naming
   comparison/disclosure, exact current P12 capabilities, lifecycle/applicability
   decisions and integration/report ownership into OpenSpec/design/tasks after
   `/to-prd`. Publish granular evidence-linked issues only after `/to-issues`.
   Optional clone/template marketplace or cross-list analytical equivalence need
   not be built; absence of those extras must not block native ordinary work.
4. **Implement and prove the minimum source seam first:** stable scoped definitions,
   current authorization, complete atomic creation/history/result and durable replay;
   then compose the D10/shared UI editor and qualify all readers/consumers. Require
   real nonowner/source/API concurrency proof, compatible migrations, restore,
   accessible browser tasks, measured workload and representative staff pilot before
   activation. Gate incompatible paths; keep accepted data/history under disable or
   roll-forward. No new source implementation is authorized by this review.
5. **Monitor residual behavior after those gates:** use the proposed explicit signals
   below. These are design thresholds, not measured rates or existing operational
   SLAs. Unknown permission/lifecycle/capacity contracts are prerequisites, never
   risks to wave through and monitor later.

| Signal                                                                                   | Threshold                                                                            | Accountable owner                                  | Response                                                                                                                                               |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| One create intent yields multiple lists/history effects or visible partial configuration | Any confirmed occurrence                                                             | P27 source engineering                             | Stop the affected create/replay path; reconcile from durable evidence with qualified repair; require regression proof before reactivation.             |
| Creation changes any existing journey/list assignment/stage or triggers outreach         | Any confirmed occurrence                                                             | P27 source owner; communication owner for dispatch | Contain the affected command/consumer, preserve minimal incident evidence, reconcile independent source facts; do not erase history to hide the event. |
| Cross-scope metadata, private usage count or journey detail disclosure                   | Any confirmed disclosure                                                             | P12/security with P27                              | Restrict the exposure immediately, investigate scope and require actual negative authorization proof.                                                  |
| Outcome stays unconfirmed after a completed reconciliation attempt                       | One completed attempt cannot establish the authoritative result                      | P27 operations/source owner                        | Keep the outcome explicit, inspect scoped intent/result/current revision, avoid a fresh effect and recover through the source.                         |
| Offered view/report drops eligible work or merges distinct stage meanings                | Any confirmed mismatch for equal authorized scope/coverage                           | P27 read-model owner; P33 for metrics              | Repair/rebuild the source-derived projection; expose coverage honestly and retain original meaning.                                                    |
| Critical confusion about list choice, create effects or saved outcome                    | Any reproducible critical failure in pilot/support                                   | P27 product/design and accessibility owners        | Fix and retest the affected interaction before expansion; no compulsory extra steps without evidence.                                                  |
| Query/payload exceeds its approved measured release budget                               | Three consecutive measurements within 15 minutes in the same declared workload slice | P27 engineering/operations                         | Inspect plan/load/limits and restrict affected rollout or repair query/index; do not discard records or permissions for speed.                         |

No arbitrary maximum list count, periodic cleanup campaign, mandatory justification,
assessment clock or automatic retirement is introduced. A measured capacity limit
and an organizational lifecycle policy solve different problems and require their
own explicit evidence/decision.

## Adversarial check

### What could go wrong with this answer?

Lists can proliferate, become indistinguishable, leak private usage, duplicate
journeys or corrupt history through partial creation and name-based identity.
The exact requirements keep configuration bounded, atomic, scoped and separate
from partnership effects; lifecycle is a required pre-release decision.

### What hidden assumptions are we making?

We infer that some organizations may need different stage meanings. No primary
source proves demand for a specific missions customer or a universal number of
lists. A remains optional; a staff pilot must validate the actual need and clarity.
No automatic applicability, lifecycle or copying behavior is assumed.

### How does this affect the whole product?

P27 gains organizational configuration on one shared model. P28 uses the same
source understanding; P9/P12 and financial/communication owners retain authority.
P33 must preserve list/stage meaning. Optional workflows consume qualified source
facts and do not gain a configuration-created cultivation trigger.

### How does this affect the end-user experience?

Configurators can see what exists and create a clearly named usable list with one
explicit save. Staff see relevant list context alongside current stage and next
work, without an unnecessary settings detour or repeated choice. Read-only and
failure states remain understandable without disclosing private information.

### Does this follow modern best practices?

Yes within the stated limits: primary CRM guidance supports distinct process
lists, shared usage when meanings match, current configuration authority and
clear scope. CMS workflow engines, sales probabilities and vendor cloning/deletion
bypasses are not imported. The experiment proves narrow PostgreSQL mechanics;
actual accessible user outcomes still need qualification.

### Does this fit Asym’s existing repo and product direction?

Yes. It preserves Postgres/source authority, tenant isolation, shared Core UI,
organization configuration, one ordinary partnership and distinct source facts.
Personal saved views and existing label/status shortcuts are not promoted into
cultivation authority. D10–D13 continue to govern stage use and history.

### Should we adjust the recommendation?

**Accept.** Record the bounded A decision and safeguards. No material amendment
or repeated ratification is required. Whole-list lifecycle/applicability remain
explicit prerequisite decisions; accepting D14 does not authorize engineers to
choose them or imply the entire feature or phase is ready.
