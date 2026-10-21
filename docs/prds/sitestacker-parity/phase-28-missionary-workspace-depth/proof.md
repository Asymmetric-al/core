# Phase 28 — Complete journeys, common safeguards and proof

These requirements apply to every Phase 28 capability. More specific adopted
owner contracts retain their exact authority, defaults, finite periods,
retention and completion rules. This common floor does not create a generic
permission, configuration, workflow or retention engine. Requirements describe
intended behavior; publication does not establish implementation, qualification
or activation.

## REQ28-Q01 — Useful first work after authorized setup

**Story US28-Q01:** As a missionary, I want to reach useful native work after my organization admits me, so that I can begin without configuring optional features.

**Decision basis:** Ratified completeness C01/C06/C16/C17; D37 optional guide; platform surface and capability owners.

The workspace SHALL provide a coherent path from authorized tenant setup to
first useful native relationship, task and appointment work through the existing
settings and navigation. Configured, enabled, source-ready and actor-permitted
SHALL remain distinct. Qualified baseline work SHALL remain useful with optional
guide, goals, coaching, personal connections and assistance Off. No mandatory
onboarding course, master Phase 28 switch or invented access-request workflow
shall become a prerequisite. Blocked work SHALL offer only a real permitted
setup, repair, retry or staff-contact destination without revealing hidden
configuration.

- **AC28-Q01-01:** With all optional modules Off and baseline prerequisites qualified, a newly admitted missionary reaches a permitted relationship, creates ordinary work and can return to it without configuring any optional module.
- **AC28-Q01-02:** Not configured, intentionally Off, source unavailable and actor not permitted produce distinguishable truthful states; none is reported as a successful setup or an empty dataset.
- **AC28-Q01-03:** Each offered setup or repair action reaches its actual authorized owner; an unauthorized user cannot obtain setup details or change configuration through a direct request.

## REQ28-Q02 — Exact organization and ministry context

**Story US28-Q02:** As a missionary serving more than one ministry, I want to enter the right authorized context, so that I understand whose work I am viewing and changing.

**Decision basis:** Ratified completeness C02/C13/C14; P3/P12 authorization; P27 assignment ownership.

Entry SHALL resolve zero, one or multiple currently permitted ministry contexts.
One eligible context SHALL open without repeated selection; multiple contexts
SHALL provide a searchable permitted choice; zero contexts SHALL provide an
honest access/setup state. A failed context read SHALL not masquerade as zero.
The effective organization and subject SHALL be visible where an action's
consequence depends on them. Saved selection, financial recognition, an email
address, a guessed identifier or another acting role SHALL not grant access.
Deep links and back navigation SHALL resolve current authority before revealing
private titles, counts or details.

- **AC28-Q02-01:** Zero, one, multiple and failed-load fixtures produce the specified entry behavior without repeated selection for one context.
- **AC28-Q02-02:** An actor with two ministries in two organizations sees the correct subject on search, detail and consequential actions, and each accepted write belongs only to its chosen authorized context.
- **AC28-Q02-03:** A stale saved selection, forged deep link or now-revoked assignment reveals no forbidden record, title, count or action.

## REQ28-Q03 — Safe context changes with unfinished work

**Story US28-Q03:** As a missionary switching contexts, I want my unfinished and accepted work to retain its original meaning, so that nothing is lost, exposed or applied to another ministry.

**Decision basis:** Ratified completeness C02/C08/C12/C14; D27/D28 preparation ownership; current session and cache boundaries.

Switching SHALL isolate source requests, cache entries, cursors, draft state,
recipient selections and delayed responses by exact admitted context. Saved
preparation remains under its original owner and current permission. Unsaved
work SHALL use applicable save/discard/cancel navigation choices rather than
silently moving to a new context. An accepted in-flight command may finish only
under its original source contract; its response SHALL not populate the new
context. Returning SHALL recover the original accepted result under current
permission before offering a new submission. Signing out or losing the selected
authority SHALL clear unsafe displayed/private state and reject late responses,
including when cancellation cannot stop the network request.

- **AC28-Q03-01:** Switching ministry while a read is delayed never shows the old ministry's data in the new context, even when the old response arrives last.
- **AC28-Q03-02:** Switching with unsaved work preserves the chosen save/discard/cancel outcome; no draft or recipient is reassigned implicitly.
- **AC28-Q03-03:** A save accepted before switching is recovered once in its original context on a permitted return; it creates no second effect and reveals nothing after access is revoked.

## REQ28-Q04 — One coherent daily work journey

**Story US28-Q04:** As a missionary, I want to move from a useful next action to an accurately recorded outcome, so that I can finish everyday work without duplicate entry or invented facts.

**Decision basis:** Ratified completeness C03/C05/C08; P9 interaction/task ownership; P27 managed-work floor; D40 informational recurring miss.

Home and work detail SHALL show currently actionable work with its permitted
factual reason, relevant date, responsible actor and clear next step. Task,
appointment, actual interaction, Request response, commitment and received gift
SHALL remain distinct source facts. Optional actual-interaction recording may
reuse currently permitted entered context; it SHALL not copy private material
into shared history or impose mandatory logging. Opening a dialer or mail app,
copying contact details or checking a task SHALL not manufacture an attempt,
conversation, sent message, response, consent or payment. Decline, defer,
cancellation, no answer, no authorized contact method and nonfinancial support
SHALL remain ordinary supported outcomes. Actively managed P27 work retains a
valid next task or an owned actionable exception; displaying restricted early
preparation SHALL not enroll it in managed work.

- **AC28-Q04-01:** A missionary can record an actual unsuccessful call once, or finish independent work without recording an interaction; neither path invents a conversation, Request response, commitment or gift.
- **AC28-Q04-02:** An actual meeting can lead through its supported outcome to an explicitly authorized Request response and next task or owned exception, reusing only currently permitted context.
- **AC28-Q04-03:** A confirmed missed gift remains informational until a deliberate ordinary follow-up is added; no generic urgency label or missing log creates a new missionary obligation.

## REQ28-Q05 — Completion follows the work's immutable contract

**Story US28-Q05:** As a missionary handling follow-up, I want completion to mean exactly what the work requires, so that a checkbox cannot falsely resolve another source's obligation.

**Decision basis:** Ratified completeness C03/C08; D19–D22/D29–D32 follow-up purposes; P27 source-owned work.

The server-resolved work contract SHALL distinguish independent human follow-up
from source-controlled work. Its authority classification SHALL not be editable
by changing a client field, task type, board column or linked source. Independent
follow-up may finish without closing its linked source or recording compulsory
interaction. Source-controlled work SHALL close only through its qualified
owner outcome and SHALL reject generic Complete, Reopen, Delete and drag-to-Done
through every reachable writer. A visual group SHALL preserve each purpose's
identity, evidence, authorization and completion record.

- **AC28-Q05-01:** The same source-controlled item rejects generic completion, reopening and deletion from list, detail, board, bulk action, direct command and privileged consumer paths.
- **AC28-Q05-02:** Finishing independent human follow-up does not mark a gift, commitment, intake, appeal response or source-controlled obligation complete.
- **AC28-Q05-03:** Completing one permitted purpose in a grouped follow-up leaves other unfinished purposes accurately visible and preserves all completed evidence after regrouping or a tenant setting change.

## REQ28-Q06 — Controls explain their exact consequences

**Story US28-Q06:** As authorized tenant staff, I want each control to explain what it changes, so that I can configure the workspace without accidentally cancelling work or restoring access.

**Decision basis:** Ratified completeness C06/C08/C12/C16; D24/D30/D32/D33/D37/D40 and D42–D45 source-specific controls.

Every exposed tenant or personal control SHALL retain its adopted default and
declare its owner, permission, scope and consequences for new work, accepted
work, current reads, pending outward effects and reenable. Off SHALL not mean
generic deletion, blanket revocation or replay. Readiness SHALL remain derived
from real owners. Saving, accepted, failed, uncertain and effective states SHALL
be presented accurately; a saved choice awaiting an applicable publication step
is not yet an effective public change. Routine reversible changes SHALL not gain
unnecessary confirmation dialogs. Material consequences SHALL be explained
locally before acceptance using existing configuration surfaces.

- **AC28-Q06-01:** Turning missionary gift reporting Off blocks new reports while Finance continues the same accepted intake and the reporter retains only currently permitted recovery.
- **AC28-Q06-02:** Turning a coaching module/share Off removes that exact access without deleting unrelated duties or reviving an ended share when reenabled; Page signup hide retains its separately adopted pending-request behavior.
- **AC28-Q06-03:** Reload and a second permitted session show the actual accepted configuration; permission loss, stale revision and an uncertain save cannot produce a false Saved or effective-On state.

## REQ28-Q07 — Current acting authority without role union

**Story US28-Q07:** As a person with several roles, I want each action to use only my current authorized role and subject, so that private work and privileges do not bleed across surfaces.

**Decision basis:** Ratified completeness C02/C13/C14; P3/P4/P10/P12; D42/D43 public-reader qualification.

Every read, mutation, export, job and result recovery SHALL prove the currently
admitted tenant, acting context, subject, source eligibility and applicable
permission at its owning boundary. Trusted authentication/source context SHALL
derive actor, author, approver, ownership and audit attribution. Caller IDs are
requests to resolve, not authority. Staff, missionary, coach, donor and public
reader paths SHALL retain their exact contracts rather than the union of a
person's roles. A public reader's qualified signup or confirmation SHALL not
require invented workforce membership, a CRM profile or a staff context.
Service identities SHALL prove their qualified capability and current source
ceiling rather than impersonating a human session or relying on credentials
alone. Current address possession proof and newsletter consent remain distinct.

- **AC28-Q07-01:** A mixed-role actor cannot use a staff permission while acting as missionary or coach unless the explicit current owner contract grants that operation.
- **AC28-Q07-02:** A caller's forged tenant, actor, owner, approval or audit fields are rejected or resolved to trusted permitted context; no accepted history attributes the effect to the forged actor.
- **AC28-Q07-03:** The qualified public-reader Join/confirmation path works without a staff profile, while revoked, stale or unqualified identity proof fails safely without granting other product access.

## REQ28-Q08 — Authorization precedes every disclosure

**Story US28-Q08:** As a person whose information is held by the organization, I want every view and derivative to preserve the same current audience, so that hiding a field does not merely move its disclosure elsewhere.

**Decision basis:** Ratified completeness C09/C14; P3/P10/P12 projections; D24–D26 coaching/shared-context limits.

Authorization and field classification SHALL be applied before enumeration,
joins, sorting, ranking, search, counts, facets, paging, export and serialization.
Task titles, notifications, logs, files, generated documents, cached values and
invalidation payloads SHALL retain the same current source audience. Cache keys
and cursors SHALL bind exact admitted scope and relevant source/authorization
revision. Neither a complete count nor the existence of a hidden record may be
revealed by an otherwise forbidden projection. Source-approved anonymity SHALL
be established positively; absence from a separate capped roster SHALL not
permit identity disclosure. Private stale data SHALL not be a fallback during
an outage.

- **AC28-Q08-01:** Two differently authorized viewers using the same saved filter receive only their own permitted records, counts, facets and export fields, including after cache reuse.
- **AC28-Q08-02:** An anonymous gift whose donor is missing from the returned roster remains anonymous in UI, API, task title, coach view, export and ordinary diagnostics.
- **AC28-Q08-03:** Wrong-tenant identifiers, cursors and cache entries expose neither private values nor record existence, and a source failure produces an honest unavailable outcome rather than stale private content.

## REQ28-Q09 — Complete and intelligible support information

**Story US28-Q09:** As a missionary, I want support information to state what it covers, so that I can plan without mistaking a partial list, forecast or unknown value for confirmed money.

**Decision basis:** Ratified completeness C04/C09/C11; D16 goals; P13/P14/P16/P21 financial and recognition ownership.

Totals, comparisons, lists and trends SHALL use complete qualified source
projections with explicit tenant/subject, currency, period, coverage, correction
basis and freshness. Loaded pages and display caps SHALL not define totals,
firstness, absence or negative facts. Unknown, incomplete, stale, unavailable,
not applicable and known zero SHALL remain distinct. Received money, recognition,
commitment, forecast, Goal Version, Support Plan and spendable Field Account
information SHALL retain their named owners and meanings. Relationship
continuity SHALL not be inferred solely from a financial-recency band or changed
into a person-level lapsed status.

- **AC28-Q09-01:** Loading only part of a roster or gift history does not change a complete qualified total or cause an unsupported “none,” first gift or excess determination.
- **AC28-Q09-02:** A failed or incomplete source displays its true limitation instead of zero support, no partners or a fabricated financial conclusion.
- **AC28-Q09-03:** Corrections, refunds and delayed observations update authorized source-derived figures without duplicate recognition or received money, while independently authorized continuing relationships remain usable.

## REQ28-Q10 — One authoritative source for each fact and command

**Story US28-Q10:** As a missionary or staff member, I want the same action to have the same meaning on every surface, so that boards, lists and shortcuts cannot create contradictory records.

**Decision basis:** Ratified completeness C03/C08/C10/C13/C16; ADR0001; platform boundaries and data-access ownership.

Business mutations SHALL use the canonical shared API and authoritative source
commands; app routes remain adapters and browser collections expose only their
qualified operations. Public projections, search indexes, dashboards, task
groups and provider events SHALL not become write authorities. Each integration
SHALL identify its exact producer, consumer, fact and permitted effect. Existing
CRM, commitment, financial, content, communication, document and identity owners
remain authoritative. No parallel CRM, direct-provider shortcut, second outbox,
general inbox, external contact-update feed or new generic workflow engine is
introduced by composing Phase 28 journeys.

- **AC28-Q10-01:** Equivalent list, board, detail and shortcut submissions reach the same source validation and yield one consistent authoritative result/history.
- **AC28-Q10-02:** A consumer cannot write a source-owned financial, consent, publication or identity fact through a projection, raw table, provider event or direct adapter bypass.
- **AC28-Q10-03:** An unavailable dependency blocks only its affected effect and produces no substitute fact; unrelated qualified native work remains usable.

## REQ28-Q11 — Database constraints and effective privileges

**Story US28-Q11:** As an organization administrator, I want persisted data and every access path to enforce the same boundaries, so that a valid edit cannot become a forbidden record.

**Decision basis:** Ratified completeness C13/C14; P3/P12; source-owned Supabase/Postgres conventions.

New or changed source relations SHALL define stable keys, required scope,
tenant-aware relationships and uniqueness, intentional nullability, valid state
combinations, finite/positive bounds where applicable, delete/restrict behavior
and protected history. Immutable scope and attribution may change only through
a qualified source transfer or correction. Constraints or a single authoritative
mutation boundary SHALL enforce invariants for old and resulting states.
Qualification SHALL inspect actual table grants, effective RLS old-row and
new-row checks, policy composition, views, function/RPC execution, storage and
privileged service paths. Explicit intended grants and actual Data API exposure
SHALL be verified independently of RLS. Definer/bypass paths SHALL have a
qualified bounded authorization contract; broad authenticated access or service
credentials alone are insufficient.

- **AC28-Q11-01:** Using actual database roles, an otherwise permitted edit cannot change tenant, owner, author, scope, source reference or authority state outside its contract, including via upsert, RPC, view or privileged path.
- **AC28-Q11-02:** Missing/forbidden references, duplicate source effects and invalid state combinations fail atomically; deletion cannot silently cascade away protected evidence or valid dependent work.
- **AC28-Q11-03:** The deployed grant/policy matrix demonstrates both intended successful access and denied cross-context access; SQL text assertions and default exposure assumptions are not accepted as this proof.

## REQ28-Q12 — Durable effects and atomic required handoff

**Story US28-Q12:** As a user retrying interrupted work, I want my accepted intent to happen once, so that a lost response cannot duplicate follow-up, enrollment or communication.

**Decision basis:** Ratified completeness C08/C13; source-purpose follow-up decisions; D42/D43; P6 durable delivery ownership.

Every mutating intent SHALL have a source-owned durable effect identity scoped
to its exact tenant, purpose and business occurrence. Retrying the same intent
SHALL recover its permitted result without applying it again or overwriting a
newer correction; a different normalized intent reusing that identity SHALL
conflict. A fresh HTTP key alone SHALL not establish a new human instruction.
The source transition, required acceptance/history and required downstream
intent SHALL commit atomically or through the owning source's already qualified
durable recoverable mechanism. Best-effort callbacks SHALL not be the only
record of required work. Independent source actions composed in one screen
SHALL not be presented as a distributed transaction.

- **AC28-Q12-01:** A committed command with a lost response is retried through different transport attempts and results in one source effect, one required history acceptance and one intended downstream effect.
- **AC28-Q12-02:** Fault injection between proposed writes leaves either no accepted source work or durable recoverable required handoff; repeated recovery cannot duplicate the effect.
- **AC28-Q12-03:** Reusing an effect identity with changed purpose, recipient or payload conflicts without changing the earlier accepted result; genuinely distinct admitted occurrences remain possible.

## REQ28-Q13 — Concurrency and correction preserve intent

**Story US28-Q13:** As a user editing shared work, I want conflicts and corrections to be handled explicitly, so that an old form cannot overwrite newer facts or bypass a current restriction.

**Decision basis:** Ratified completeness C02/C08/C13/C14; D5 contact correction; source-owned revision and revocation contracts.

Consequential commands SHALL bind the expected source state/revision or an
equivalent qualified conflict mechanism and serialize the relevant invariant
at authoritative acceptance. A prior UI permission check is not sufficient.
Contact edits SHALL apply only deliberately changed permitted fields, keeping
absent and deliberately cleared values distinct. A stale full-form save SHALL
not overwrite unrelated newer changes or invent a country or identity value.
Withdrawal, revocation, permission loss, source correction and configuration
changes SHALL be checked at the applicable owning boundary; later changes do
not erase previously lawful history or authorize a replay.

- **AC28-Q13-01:** Two real database sessions editing the same protected revision produce the permitted serialized outcome and a recoverable conflict, rather than a silent lost update.
- **AC28-Q13-02:** A stale contact form can update its still-permitted deliberate changes only under the qualified conflict rule; it cannot restore removed access, overwrite newer unrelated fields or default a foreign address to another country.
- **AC28-Q13-03:** Races between action and controlling withdrawal, expiry, disable or permission loss preserve the source's documented order and leave no forbidden later effect.

## REQ28-Q14 — Truthful outcomes and recoverable partial success

**Story US28-Q14:** As a user with an unreliable connection, I want to know what actually succeeded, so that I can recover only missing work without repeating an accepted action.

**Decision basis:** Ratified completeness C08/C16/C19; D42/D43 recovery; P6 external-outcome semantics.

Requested, pending, accepted, unavailable, failed and unknown outcomes SHALL be
distinguished according to the source contract. A failed readback SHALL not
turn an accepted write into failure. A composite action may promise a single
success only when the source guarantees that result; otherwise it SHALL expose
partial outcomes and retry only missing effects. Recovery SHALL recheck current
disclosure rights and resolve the original effect. Historic success SHALL not
assert a now-withdrawn membership or ended permission. Provider acceptance,
delivery, print/export and actual human response retain distinct meanings;
ambiguous irreversible effects require reconciliation before retry.

- **AC28-Q14-01:** When an interaction is saved but the next task is not, the UI preserves that exact result and recovery creates only the missing task.
- **AC28-Q14-02:** A timeout after source commit presents uncertainty with same-operation recovery, never optimistic completion or a blind fresh submission.
- **AC28-Q14-03:** A later revoked viewer cannot retrieve private result details, and an earlier successful subscription receipt does not claim current subscription after withdrawal.

## REQ28-Q15 — Exact money, dates and deadlines

**Story US28-Q15:** As a missionary working across currencies and timezones, I want amounts and deadlines to retain their source meaning, so that display choices cannot change financial facts or access windows.

**Decision basis:** Ratified completeness C11/C17; D28/D38/D39 and adopted newsletter timing; canonical money and source-period owners.

Money SHALL preserve the authoritative integer-minor-unit or exact fixed-scale
decimal representation, currency and supported precision. Floating-point
comparison or a universal two-decimal assumption SHALL not determine business
facts. Source-owned financial periods and half-open instant bounds SHALL remain
exact. Date-only values, actual occurrence time, recorded time and authorization
instants SHALL remain distinct. New-referral calendar rules, continued-referral
instant rules and confirmation deadlines retain their exact adopted contracts.
Device clocks, localization, retry, resend, delayed entry or a later policy
change SHALL not implicitly renew existing authority. Expiry SHALL be enforced
at the source decision after lock waits, not by a cleanup scheduler or stale
transaction-start timestamp.

- **AC28-Q15-01:** Literal worked examples for supported zero-, two- and three-decimal currencies render and aggregate exactly; compatible scope/period is proved before comparison.
- **AC28-Q15-02:** Last-day nonmidnight gifts, leap days, DST and timezone changes retain the owning financial/referral/confirmation boundary without omission or extra validity.
- **AC28-Q15-03:** An action waiting across its deadline is denied at the authoritative transition; a later display timezone, resend or retry cannot extend the original period.

## REQ28-Q16 — Participation, retention and privacy across return

**Story US28-Q16:** As a missionary leaving or returning, I want each kind of work to follow its own access and retention rule, so that private preparation stays private while lawful obligations are not lost.

**Decision basis:** Ratified completeness C06/C12/C14/C15; D27/D28; exact coaching, newsletter and duty owners.

Ending or suspending exact participation SHALL apply the source's current-read,
retained-duty, pending-effect and retention rules without a generic transfer or
delete operation. Staff or a successor SHALL not acquire private preparation
through reassignment, previews, exports or support tools. No eligible assignee
SHALL produce the source-owned owned exception instead of a guessed broad
fallback. Deliberate eligible resumption SHALL affect only selected preparation
and its adopted current-work/departure rule; it SHALL not restore old coaching
shares, subscriptions, sends or unrelated deadlines. Retention/disposition
SHALL cover actual controlled derivatives and restore handling under their
owners without treating access expiry as automatic destruction of lawful history.

- **AC28-Q16-01:** Departure with private preparation, shared duty, coaching access and pending newsletter work produces each owner's documented result without exposing private preparation to staff.
- **AC28-Q16-02:** Return before or after the applicable deadline, temporary suspension and a same-email replacement are distinguished; only the intended eligible actor can resume selected preparation.
- **AC28-Q16-03:** Cleanup, export and restore cannot revive expired private access or delete still-required lawful duty/completion evidence as an unintended cascade.

## REQ28-Q17 — Accessible, coherent Core interaction

**Story US28-Q17:** As a user on a phone or using assistive technology, I want the complete workflow to remain clear and operable, so that I can finish work without a desktop-only or pointer-only path.

**Decision basis:** Ratified completeness C01–C03/C17/C18; existing Core Base UI/base-maia design and accessibility contracts.

The composed experience SHALL use existing shared Base UI/base-maia primitives,
semantic tokens, typography and spacing. Each local job SHALL have an
understandable primary action, clear source/context and persistent material
outcome. Keyboard, screen-reader, touch, zoom and narrow-viewport use SHALL cover
the entire journey, including dialogs and errors. Boards and maps SHALL have
equivalent accessible list/menu operations; dragging, hover or color SHALL not
be the only affordance. Focus SHALL be preserved/restored appropriately and
material asynchronous results announced without stealing focus. A disappearing
toast alone SHALL not communicate success, failure, permission or expiry.

- **AC28-Q17-01:** A representative complete job can be completed by keyboard and on a narrow touch viewport with no inaccessible drag-only, map-only or hover-only step.
- **AC28-Q17-02:** Validation exposes labeled field errors; dialogs restore focus; asynchronous failure and recovery are perceivable with a screen reader and do not erase authorized input or list position.
- **AC28-Q17-03:** Composed screens pass the applicable automated accessibility checks and manual keyboard, reading-order, zoom, contrast and touch-target review; a component or screenshot pass alone is insufficient.

## REQ28-Q18 — Localized and low-bandwidth work

**Story US28-Q18:** As a missionary or reader in varied field conditions, I want understandable localized information and honest interrupted-work recovery, so that connectivity or unfamiliar formatting does not cause mistakes.

**Decision basis:** Ratified completeness C17/C18; D39 date-only referral semantics; D42–D45 reader journey; international identity/address owners.

The UI SHALL preserve supported Unicode names, real country/address formats,
international email values and exact currency identity without invented required
name parts or domestic defaults. Consequential dates SHALL show an unambiguous
localized value and relevant timezone; relative-only copy or ambiguous midnight
SHALL not substitute for the deadline. Loading and retry SHALL work without
false empty, zero or saved states under latency and interruption. This release
SHALL not imply unsupported full offline sync, persistent restricted-device
caching or automatic replay of unapproved consequential work. Public intake
and the protected confirmation doorway retain their distinct script contracts.

- **AC28-Q18-01:** Long translated text, international names/addresses and supported currencies remain readable and editable without clipping, forced domestic values or loss of meaning.
- **AC28-Q18-02:** Offline or delayed submission never shows false completion; reconnect offers the permitted original-effect recovery instead of silently replaying consent, sends, publication or money actions.
- **AC28-Q18-03:** Public intake works under its no-JavaScript contract; missing protected-confirmation script support produces safe useful explanation without consuming proof or inventing an alternate token protocol.

## REQ28-Q19 — Real capability readiness and bounded dependencies

**Story US28-Q19:** As a tenant administrator, I want unavailable capabilities to identify the actual repair path, so that a setting or roadmap label cannot promise work the system cannot perform.

**Decision basis:** Ratified completeness C01/C07/C16/C20; P6/P17 producers; D48–D50 settled correction/attribution policy and remaining owner implementation/adapter qualification.

Every required journey SHALL name its real producer, command/projection,
compatible version, owner and readiness evidence. A configured setting, issue
title, generic sender or roadmap phase SHALL not qualify a producer. Missing
source readiness SHALL block only the affected effect with honest permitted
feedback; the required outcome remains in scope. D48–D50 settle C-01/E7 policy;
their publication SHALL not qualify the actual correction command, attribution
producer or coherent coverage adapter. Technical qualification SHALL implement
that settled meaning rather than invent another policy. Optional future products SHALL not become blanket prerequisites for
already qualified native work. A direct provider/table bypass or parallel source
SHALL not be used to hide missing readiness.

- **AC28-Q19-01:** Disabling or withholding one exact unqualified source effect leaves independently qualified relationship/task work usable and presents a real permitted repair route.
- **AC28-Q19-02:** An enabled setting with an unqualified producer cannot accept the affected consequential action or display it as ready.
- **AC28-Q19-03:** Under the settled D48–D50 policy, an unqualified correction command or attribution/coverage adapter leaves its affected effect or measure unavailable without inferred attribution, posted correction or substitute authority, and its remaining implementation/qualification dependency is explicitly traceable.

## REQ28-Q20 — Retained-data census and safe migration

**Story US28-Q20:** As staff responsible for existing records, I want migration to preserve lawful history and unfinished work, so that the new workspace does not fabricate facts or lose obligations.

**Decision basis:** Ratified completeness C07/C12/C15/C20; exact source-owner migration and privacy contracts.

Before affected activation, the implementation SHALL inventory reached legacy
records, readers, writers, grants and downstream consumers. Migration SHALL map
them to intended source owners while preserving required identity, provenance,
restrictions, completed evidence and unresolved work. Ambiguous records SHALL
follow an authorized exception/correction path; backfills SHALL not infer
identity matches, consent, mailbox proof, financial facts, completion or role
rights. Validation SHALL include mixed-version reads/writes and explicit
reconciliation of counts and domain invariants, rather than accepting a
successful migration command as sufficient evidence.

- **AC28-Q20-01:** A production-shaped retained-data fixture preserves lawful IDs, restrictions, completed effects and unfinished obligations with an explainable disposition for every reached record class.
- **AC28-Q20-02:** Ambiguous legacy emails, imported contacts and old pending requests do not become verified identities, subscriptions or freshly valid authority through backfill.
- **AC28-Q20-03:** Old/new schema and reader/writer combinations are tested; incompatible old writes are fenced before the new capability is exposed.

## REQ28-Q21 — Qualified rollout and safe containment

**Story US28-Q21:** As an operations owner, I want to enable and contain affected capabilities safely, so that a release problem cannot corrupt accepted work or stop unrelated ministry work.

**Decision basis:** Ratified completeness C06/C08/C15/C16/C19/C20; existing activation and deployment owners.

Activation SHALL identify the exact release, environment, cohort, owner,
configuration and passed evidence. Readers, commands, source fences and required
recovery SHALL be compatible before exposure. Containment and rollback SHALL
stop affected unsafe admission/execution without erasing lawful accepted work,
restoring retired unsafe writers or replaying historical outward effects.
Rollback after new writes SHALL preserve newer authority and completion fences;
when that cannot be guaranteed, retain safe containment and use a qualified
forward repair. Staff/readers SHALL receive the truthful permitted outcome.

- **AC28-Q21-01:** A controlled cohort activation reaches the intended configuration only after its required proof passes, while unqualified cohorts remain unavailable without false readiness.
- **AC28-Q21-02:** Containment after accepted work prevents further unsafe effects, preserves original recovery identities and leaves unrelated qualified capabilities usable.
- **AC28-Q21-03:** A rollback/forward-repair exercise with newly written data cannot resurrect revoked rights, duplicate sends or restore an incompatible writer.

## REQ28-Q22 — Restore does not restore forbidden authority

**Story US28-Q22:** As an organization administrator, I want backup recovery to respect later restrictions and completed effects, so that recovery cannot re-expose data or repeat work.

**Decision basis:** Ratified completeness C12/C14/C15; source retention, suppression, revocation and consumed-effect contracts.

Before restored reads and jobs reopen, recovery SHALL reconcile subsequent
revocations, consent withdrawals, suppression, disposition, replaced/expired
proof and consumed business effects against the recovered state. Source owners
SHALL define their authoritative reconciliation evidence and safe unavailable
result when it cannot be established. Restore SHALL not infer renewed rights
from a recovered active flag, email address, old session or pending queue item.
The process SHALL preserve lawful durable evidence while maintaining disposition
of controlled private copies under the owning retention policy.

- **AC28-Q22-01:** Restoring a backup predating withdrawal or access revocation does not allow that old subscription, share or protected proof to act or disclose before reconciliation.
- **AC28-Q22-02:** A restored pending job whose durable business effect already happened cannot create a second task, enrollment, intake or outward send.
- **AC28-Q22-03:** Missing reconciliation evidence keeps only the affected restored path safely unavailable with an actionable owner diagnosis; it never defaults to the recovered permissive state.

## REQ28-Q23 — Durable history and actionable operations

**Story US28-Q23:** As an operator resolving a user problem, I want trustworthy source history and useful diagnostics, so that I can recover the accepted outcome without private-data exposure or database repair.

**Decision basis:** Ratified completeness C08/C19 and its adopted monitoring table; P6 delivery history; security/privacy owners.

Business history SHALL identify the durable source effect, exact context,
responsible actor and relevant policy/version without unnecessary private body
content. It SHALL remain distinct from security audit, technical traces and
provider outcomes. Operators SHALL locate an accepted-but-unpresented effect
and recover through its qualified owner command instead of direct database
repair, deleting evidence to deduplicate, or blind resend. Required monitoring
SHALL retain the signal, threshold, accountable role and response below; release
ownership SHALL bind those roles to an actual operating roster. Known policy,
privacy and correctness failures are launch blockers rather than monitor-only
risks.

These shared signals SHALL supplement, not replace or relax, adopted
source-specific monitors; the stricter applicable trigger SHALL govern.

| Signal                                                                     | Threshold                                             | Accountable owner                                       | Required response                                                                                                   |
| -------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Cross-context disclosure or effect after required denial                   | One confirmed occurrence                              | P12 security operator and affected source owner         | Contain the path, preserve minimal evidence, correct and requalify before reopening.                                |
| Duplicate accepted intent or falsely reported saved/delivered result       | One confirmed occurrence                              | Owning command/dispatch operator                        | Stop the affected mutation/retry path, reconcile original effects and repair presentation without erasing evidence. |
| Money/unit/period/coverage mismatch or anonymous identity exposure         | One confirmed occurrence                              | Financial projection owner; P12 for identity            | Withhold the affected projection, correct source/consumer and qualify boundary cases before return.                 |
| Accepted operation exceeds its declared completion/recovery bound          | One operation beyond that qualified bound             | Exact source operations owner                           | Investigate and reconcile by original identity; an unset bound blocks activation.                                   |
| Critical journey confusion, accessibility blocker or repeated-entry defect | One reproducible blocking case in a supported journey | P28 product/design owner and implementing surface owner | Correct and retest the whole job; halt affected rollout if safe completion is blocked.                              |

- **AC28-Q23-01:** A lost-response incident can be traced from user-visible recovery to the original accepted source effect and required downstream work without exposing raw tokens or private narrative in ordinary logs.
- **AC28-Q23-02:** Fault injection triggers each applicable adopted signal, routes to its bound owner and demonstrates the specified response through existing operational tooling.
- **AC28-Q23-03:** Recovery resolves the original work through a qualified command and preserves separate business, security and delivery evidence; no direct row edit or duplicate effect is required.

## REQ28-Q24 — Confirmed testing boundary and useful prior art

**Story US28-Q24:** As a maintainer, I want tests at stable observable boundaries, so that they prove the user's whole job without freezing internal implementation details.

**Decision basis:** User-confirmed /to-spec testing seams; ratified completeness C18/C20; Core testing/TDD contracts.

The primary acceptance seam SHALL be the existing Playwright user journey
boundary across the missionary workspace, authorized staff controls and public
reader surfaces. Existing runners and shared UI SHALL be reused. Supporting
proof SHALL use actual database privilege/concurrency boundaries and the
qualified Auth/shared-delivery contracts where a browser cannot establish the
invariant. Focused Vitest tests may exercise exported canonical commands,
queries and component interfaces with controlled boundary fakes for fast
feedback; they SHALL not become a shadow product model or replace required real
proof. Tests SHALL assert independently specified user/domain outcomes rather
than reproduce the implementation, private helper calls or CSS details. No new
test framework is introduced.

Existing prior art includes the Missionary Account Frame browser journey,
session-guard flow, Tasks Page deletion recovery, Partners roster safety and
server redaction, client-session stale-response protection, shared operation
handler, workflow dispatch ledger, email recipient restriction/webhook contracts,
field-policy real-role SQL proof and donation replay transaction proof. Reuse
their appropriate public seams while retaining their limits: demo, mocked,
in-memory and SQL-text checks are not production authorization or concurrency
qualification.

- **AC28-Q24-01:** Each implemented journey maps to a real user-level acceptance case plus only the necessary supporting source/DB/provider proof, with named observable success and failure outcomes.
- **AC28-Q24-02:** A refactor preserving public behavior does not require rewriting tests merely because private helpers, query ordering or component structure changed.
- **AC28-Q24-03:** Required suite manifests distinguish executed, failed, skipped and blocked cases; absent mandatory fixtures cannot produce a qualified release or a skipped-green claim.

## REQ28-Q25 — Real-source security and failure qualification

**Story US28-Q25:** As a security and source owner, I want proof against the actual authorization and durable-effect paths, so that realistic races and provider failures cannot hide behind mocks.

**Decision basis:** Confirmed supporting test seams; ratified completeness C08/C13–C16/C18/C20; D42/D43 and P17 protected actions.

Qualification SHALL exercise actual role/grant/RLS/function/storage boundaries
and privileged source paths in an isolated disposable environment, with both
allowed and denied actors. At least two real concurrent database sessions SHALL
challenge source races; serialized synthetic histories alone are insufficient.
Real qualified Auth proof SHALL be distinguished from demo bypass, locally
auto-confirmed signup, administrative confirmation and user-editable metadata.
Public confirmation SHALL exercise the existing P17 generic inert doorway,
fragment handoff, deliberate same-origin proof submission and qualified review,
including current authority and original deadline. Provider-contract tests
SHALL challenge ambiguity, duplicate/out-of-order events, delayed dispatch,
current suppression and terminal effects without sending real user messages
from unit tests. Research scripts or documentation validation SHALL not be
represented as application qualification.

- **AC28-Q25-01:** Real allowed/denied roles, current permission changes and attempted permitted-row-to-forbidden-state mutations produce the correct outcome through every reached table, RPC, view, storage and privileged path.
- **AC28-Q25-02:** Concurrent acceptance/disable, completion/revocation, expiry/resume and confirm/withdraw tests prove one valid serialized business outcome, including a lock wait crossing expiry and response loss after commit.
- **AC28-Q25-03:** The genuine qualified verified-address path succeeds while demo/admin/autoconfirm/unknown evidence cannot masquerade as mailbox proof; guest confirmation grants no Auth or workforce privilege.
- **AC28-Q25-04:** Scanner/GET/HEAD and abandoned protected landings create no subscription; delayed or repeated provider outcomes cannot create consent, renew proof or replay a terminal effect.

## REQ28-Q26 — Measured capacity and complete bounded reads

**Story US28-Q26:** As staff in a growing organization, I want the workspace to remain accurate and responsive as records and concurrency increase, so that a display limit cannot become silent data loss.

**Decision basis:** Ratified completeness C09/C14/C18; existing source budgets and measured-performance owners.

Before activation, source owners SHALL declare and meet production-shaped
volume, concurrency, completion/recovery and latency budgets for the intended
cohort. Evidence SHALL name dataset shape, tenant distribution, actual query
plans, pagination, error/latency distributions and limiting conditions.
Authorization predicates and source-appropriate compound indexes SHALL support
bounded reads and cleanup without global tenant contention. Each actual cap,
page size and supported bound SHALL be tested below, at and above the boundary;
truncation SHALL not change authoritative totals or completeness claims.
No unmeasured throughput claim, new generic performance platform or invented
numeric SLO is adopted here.

- **AC28-Q26-01:** Workloads representing the intended cohort and a larger individual tenant meet the declared owner budgets, with reproducible data, concurrency and plan evidence.
- **AC28-Q26-02:** Boundary fixtures around actual gift/donor/task and API page limits preserve complete totals, correct coverage and authorized traversal without missing or duplicated records.
- **AC28-Q26-03:** Background expiry/disposition and ordinary recovery remain bounded and do not require scanning unrelated tenant histories or serializing unrelated tenants behind a global lock.

## REQ28-Q27 — Representative whole-journey and traceable release proof

**Story US28-Q27:** As the product owner, I want complete journeys demonstrated with representative users and traced to their decisions, so that completion means usable, qualified behavior rather than a collection of screens.

**Decision basis:** Ratified completeness C01–C03/C07/C18/C20; confirmed test seams; document-authority status vocabulary.

Before release, the product/design owner SHALL recruit representative missionary,
tenant-staff, donor/reader and coach participants for the applicable complete
jobs, including new/experienced, mobile/assistive and restricted-access cases.
Evidence SHALL record environment, configuration, attempts, outcomes, errors,
comprehension and repair steps. Any critical wrong-recipient, false-success,
privacy or money misunderstanding SHALL block the affected release. Vendor
research, synthetic models and automated accessibility checks alone SHALL not
be called a successful pilot. Every required journey SHALL trace decision and
glossary through owner ADR/OpenSpec, design, tasks, authorized issue, implementation
and executed release evidence. Selected, adopted, formally reconciled,
implemented, qualified and activated states SHALL remain distinct. Unperformed
steps and unresolved exact owner gates remain explicit without adding unrelated
features to claim completeness.

- **AC28-Q27-01:** Representative users complete setup/context selection, ordinary work and applicable communication/coaching/recovery jobs; observed confusion and blocking failures are recorded and resolved before affected activation.
- **AC28-Q27-02:** Every requirement and acceptance criterion resolves to its current decision/owner and executed proof or explicit incomplete gate, with no historical research result relabeled as new runtime evidence.
- **AC28-Q27-03:** Release completion is withheld until the affected source, migration, security, accessibility, capacity and representative-user obligations pass; documentation publication alone cannot satisfy that claim.
