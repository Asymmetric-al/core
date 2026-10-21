# Phase 28 D36 — one organization-set period for continued referrals

**Disposition: Accept with required amendments.**

**The corrected decision and required amendments were explicitly ratified on
October 18, 2026 Asia/Bangkok.** Reviewed on that date against repository
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and its current working tree. The founder
selected **A**, with no needless complexity, then explicitly ratified the
corrected decision and amendments. D35 remains ratified. This is the researched answer to Q36 under
the [founder boundary](phase28-founder-brief.md:21), not a formal specification,
implementation, live permission change or release qualification. The original
answer review posed no Q37; the next question is recorded separately after ratification.

## Exact corrected decision to record

> **D36 — Organization-set period for continued referrals.** Authorized staff
> configure one finite organization-wide period for ordinary **Continue referral**.
> Use a positive whole number of elapsed days; each day is exactly 24 hours.
> The same period applies to independently authorized staff and permitted
> missionary continuations. Maya sees the period and an explicitly estimated
> end date before continuing, and the actual accepted end date afterward. She
> does not choose a date. Show the time and timezone so the date does not imply
> access through midnight.
>
> The source starts the new period once, at authoritative acceptance after
> required checks and waits, and preserves that cycle's accepted start, end,
> duration and policy evidence. Later changes to the organization period apply
> to future accepted continuations only. Reads, edits, activities, travel,
> retries and delayed jobs do not restart the clock. At the exact end instant,
> this follow-up window is expired; current source and access restrictions may
> apply earlier.
>
> Keep the existing missionary-continuation On/Off control separate. Saving a
> period does not turn it On. Off stops new missionary continuations while
> preserving accepted work and independent staff authority. Authorized staff
> can still configure the shared period while self-service is Off. Missing or
> invalid required configuration blocks the affected Continue action with
> helpful guidance; it does not end existing work. Do not invent a universal
> duration, silently substitute a value, or treat blank or zero as Never.
>
> Use one field in the existing referral settings and one contextual Continue
> action. No individual override, extra calendar, recurring extension, new
> approval queue or generic scheduling engine is added. Changed material terms
> require refreshed review; an ordinary delay within the clearly estimated
> presentation does not require another confirmation. An uncertain response is
> recovered as the same original action, preserving its original end time.
>
> The initial-referral period remains outside this decision. A renewed work
> period is neither contact consent nor a grant or retention extension. Preserve
> D35's current authority, source history, privacy, single-cycle effect and
> correction rules. Nothing is sent, no interaction is credited, and no old
> task, private context or erased material is restored by choosing the period.

The whole-day unit, elapsed-time meaning, prospective edits and shared ordinary
staff terms were **explicit proposed amendments in the answer review** and are
now ratified with the corrected decision. They are not established by vendor practice. Supported numeric bounds are
an engineering qualification obligation below; no ministry-wide recommended
number is supported by the research. This decision does not give staff an
unbounded date override or make a settings manager a referral actor.

## What is established, and what is not

| Evidence class                  | Verified finding and consequence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Founder selection               | Q36 A selects an organization-configured finite renewed period without Maya choosing another date. Simplicity is explicit. It does not select a number, initial-referral policy or a particular database representation.                                                                                                                                                                                                                                                                                                                                                                   |
| Ratified predecessor            | [D35 decision and C05](phase28-d35-referral-continuation-adversarial-review.md#exact-required-amendments) require qualified visible new-window terms, deliberate source acceptance, independent staff authority, one consumed expired cycle and safe outcome recovery. D36 fills that period-policy frontier.                                                                                                                                                                                                                                                                              |
| Native owner facts              | [P9 A4](../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353), [A17](../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:581), [owner constraints](../../../prds/program-roadmap/owner-constraints.md:81) and [durable CRM](../../../../openspec/specs/crm-core/spec.md:14) place identity, history and lifecycle in native CRM. They do not themselves qualify a complete referral-period producer. Source write, audit and required activity share the native transaction; a generic CRM command journal is expressly excluded. |
| Authorization facts             | [P12](../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552) requires trusted tenant/actor and current scoped action authority. [ADR-0209](../../../adr/0209-static-field-policies-and-subtract-only-projection.md:16) requires classified fields and the shared subtract-only resolver. [ADR-0211](../../../adr/0211-distinct-human-approval-for-projection-widening.md:16) governs actual projection-policy widening, not approval of each Continue or ordinary duration edit.                                                                            |
| Scoped clock precedent          | [ADR-0183](../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:469) and [P12's P24 clock contract](../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:965) establish an existing pattern for fresh database time after serialization and explicit elapsed units. They govern another source. D36 deliberately adopts the relevant engineering semantics; it does not import P24's reminder product, values or workflow.                                                                                                                 |
| Different clock already present | [D11 coaching duration](phase28-d11-coaching-duration-decision.md:133) uses its own calendar convention. [D28 preparation retention](phase28-d28-preparation-retention-adversarial-review.md) governs another purpose. Neither supplies referral expiry, access or retention policy. Explicit distinctions prevent accidental inconsistency; not every timer should share one meaning.                                                                                                                                                                                                     |
| Current implementation          | Fresh bounded inspection finds a fixed-tenant organization-settings route, broad donor-status editing and caller-supplied task dates, not a qualified D36 command. [Database evidence](d36-evidence/database-policy-safety.md#fresh-current-code-inspection) gives exact code citations. Positive role/tenant/anonymity checks are acknowledged; they do not prove this new boundary. This is a static reuse hazard, not a demonstrated production exploit.                                                                                                                                |
| Fresh external facts            | Official TntConnect and MPDX documentation distinguish expired/recent referral work; Pipedrive documents edit-reset inactivity and deleted-lead recovery; Dynamics documents time-limited assignment; CoachAccountable documents explicit timer/zone semantics. None establishes a universal renewed-referral period. See [comparisons](d36-evidence/comparable-periods.md) and [UX research](d36-evidence/ux-and-primary-research.md).                                                                                                                                                    |
| Technical facts                 | Fresh [PostgreSQL date/time documentation](https://www.postgresql.org/docs/current/functions-datetime.html) distinguishes calendar-day intervals from 24 elapsed hours and transaction-start time from the actual clock. Its current page resolved to PostgreSQL 18; the independent database note also checks explicit PostgreSQL 17 docs. Neither proves Core's deployed version.                                                                                                                                                                                                        |
| Product judgments               | One unit, no individual date adjustment, prospective changes, a visible estimate and an unset rather than invented default minimize choices while making accepted outcomes explainable. These are reasoned judgments, not measured user preference.                                                                                                                                                                                                                                                                                                                                        |
| Unresolved qualification        | Exact native producer/schema, deployment version/precision, supported numeric range, actual authority ordering, effective live grants, production-shaped budgets and user comprehension remain unverified. They are explicit activation gates with owners and required outputs below; this review claims no runtime readiness.                                                                                                                                                                                                                                                             |

The [governance note](d36-evidence/governance-temporal.md) records 15 scoped
repository sources and exact owner amendments. The [database note](d36-evidence/database-policy-safety.md)
records actual code, primary database evidence, constraints and privileged-path
proof. The [UX note](d36-evidence/ux-and-primary-research.md) and
[comparison note](d36-evidence/comparable-periods.md) distinguish documentation
from product tests. No customer interviews, authenticated vendor walkthroughs or
Core usability study were performed. Maya's scenario is illustrative, not an
invented observed ministry incident.

## Necessity and strongest alternatives

The root problem is narrow: after a permitted deliberate continuation, everyone
needs to know when its renewed active window ends. Asking Maya to invent a date
each time is unnecessary under the selected organization policy. A known single
period answers this without creating a new task, reminder, contact record or
approval process.

The strongest alternative is **an optional bounded date adjustment with the
organization's proposed date prefilled**. It need not force extra input, and
would serve genuinely different case lengths if that need were demonstrated.
It nevertheless introduces date-setting power and more boundary explanations.
The founder selected A; neither research nor observed ministry evidence justifies
quietly reinstating B through an Advanced control or an ordinary staff override.
The tradeoff is explicit: ordinary continuation cannot customize one referral's
window. Separately authorized factual source correction is not a workaround for
personal scheduling preference.

A single Asym-fixed number would remove a setting but contradict tenant control
and lack evidence for the number. No-build/manual staff work can contain an
unqualified source path, but does not fulfill this selected product journey.
Activity-based expiry, automatic renewal and copying MPDX's two-week Recent
filter solve different problems. Pipedrive's 30-day deleted-lead recovery is
also not a follow-up duration. These are specifically rejected transfers of
external behavior, not reasons to add extra clocks or controls.

## Complete minimal journey

### Organization setup and edits

Use existing organization referral settings, shared [Base UI/base-maia controls](../../../../packages/ui/AGENTS.md:19)
and semantic design tokens. Keep the existing D35 missionary-control section
and one clearly related field:

- **Continued referral period (days)** — the saved positive whole number.
- Helper: **“Used when an eligible expired referral is continued.”**
- Nearby explanation: **“Each day is 24 hours. Changes apply to future continuations. Existing end dates stay the same.”**
- Existing Save/Cancel conventions; show the actual supported range once qualified.

There is no unit dropdown, slider, per-project matrix, expiry countdown or
mandatory description. If a qualified value already exists, display it. Otherwise
show **Not configured** without a plausible-looking prefill. Explain to authorized
staff that continuation needs a period. Do not tell Maya to administer settings
she cannot access. Do not hide the period field merely because missionary
self-service is Off: staff may still use ordinary Continue.

Saving a period never enables self-service. Off remains available to authorized
staff even with an invalid unsaved numeric draft; do not make a privacy/action
restriction depend on first correcting an unrelated form field. An empty draft
produces validation, not deletion of the saved policy. No normal Clear period
action is introduced. A source data repair can address corruption through its
qualified owner path.

Save reports success only on accepted persistence. A stale settings form explains
that the saved period changed and reloads the current value without overwriting
it. An ambiguous response checks the same save's outcome; it cannot quietly
create another revision under a different base. User-facing errors name the
actual problem, e.g. **“Enter a whole number of days from [minimum] to [maximum].”**
The bracketed range is an implementation qualification output, not literal UI.

### Maya and staff using Continue

Keep D35's existing eligible Expired entry and contextual **Continue referral**.
Within its existing action context, show:

> **New period: N days**  
> **Estimated end: [localized date, time and timezone]**  
> The period starts when continuation is accepted. Contact rules still apply.  
> **Continue referral**

This is one action with readable terms, not a new mandatory confirmation dialog.
The estimate is intentionally honest: acceptance happens after review and possible
network/source waits. Do not freeze page-load time merely to make the preview
exact, which would consume part of the promised period before acceptance. Do not
promise “through [date]” when the source ends at an exact instant earlier that day.

On acceptance: **“Referral continued.”** Show the actual accepted end, when
currently permitted. Keep filter context and move focus predictably if the entry
leaves Expired. If only the current-state fetch fails, say **“Referral continued.
Current status is unavailable. Refresh.”** Do not turn a known accepted write
into a failed action. If the outcome itself is unknown, say **“We couldn't
confirm the result. Check status.”** Recover the original intent; never issue
another continuation automatically.

Relevant policy or materially changed displayed date terms require refresh and
a fresh deliberate intent before any effect. Ordinary seconds passing within
an explicitly estimated presentation do not add a modal or reauthorization loop.
The action remains usable on a weak connection. No background offline queue
replays privileged actions after access, policy or expiry changes.

### Everyday and exceptional states

| State                                              | Expected behavior                                                                                                                                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Valid period, missionary self-service Off          | No new missionary acceptance; staff keep independent action rights. Settings remain available to qualified administrators. Existing accepted windows continue under current source/access rules. |
| Missing, invalid or unsupported period             | No affected new Continue acceptance for either actor type. Safe explanation and authorized staff setup/repair path; no invented fallback and no effect on existing work.                         |
| Period cannot be fetched                           | A retryable loading failure, not “Not configured,” zero or a remembered value from another tenant.                                                                                               |
| Policy changes while Maya reviews                  | Definitive no effect under the stale terms; refresh the small terms block and offer the normal action again. Re-enabling or another settings edit never replays that rejected intent.            |
| Another actor already continued                    | Show currently permitted source outcome and actual end. Do not credit Maya or attach her preview to someone else's accepted cycle.                                                               |
| Response recovered after Off or another expiry     | Recover the original accepted outcome/end only. Historical acceptance does not mean currently Active or currently readable.                                                                      |
| Source withdrawn, private, erased or cannot-pursue | Apply the source restriction. A longer period cannot override it; unavailable details stay unavailable.                                                                                          |
| Period shortened or lengthened later               | New accepted continuations use the new qualified revision. Existing endpoints remain fixed.                                                                                                      |
| Expiry job delayed or duplicated                   | Current eligibility still ends at E. Any job acts only on its exact cycle and cannot end a newer cycle.                                                                                          |
| Missionary travels or changes display timezone     | Reformat the same accepted instant using existing preferences; do not move the source deadline or infer a zone from protected location.                                                          |

A phone layout needs one readable terms block, wrapping names/dates/zones and a
clear action. Keyboard, focus, status announcements, zoom and 320 CSS-pixel reflow
must be tested in the actual shared components. A numeric keyboard helps staff
enter days; avoid accidental scroll/spinner changes and placeholder-only units.
Use accessible associated labels/errors, distinguish loading/unknown/unset states,
and announce meaningful changes once rather than ticking a countdown. There is
no new donor, public, checkout, coaching or address-entry surface in D36.

## Source model and invariants

These are required outcomes, not a frozen table design or a second clock service.
Reuse the source owner's qualified representation where it proves them.

Let `N` be the accepted positive whole-day policy value; `A` the fresh trusted
source acceptance instant captured **after required waits and serialization**;
and `E = A + N × 86,400 seconds`, using checked exact arithmetic. The interval is
`[A,E)`: immediately before E this time condition may be satisfied; **at E it is
not**. Eligibility also depends on other current source and access rules.

| Fact                       | Authority and invariant                                                                                                                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization period        | One qualified organization policy, with current manage capability, explicit revision and finite supported integer range. A caller's role label, browser setting or arbitrary JSON is not authority.                                       |
| Referral lineage and cycle | Native P9 source. One expired cycle is consumed at most once through D35; original introduction and previous cycles remain attributable. A new cycle is not a new person or introduction.                                                 |
| Accepted timing            | Source transaction retains A, E, N and exact relevant policy evidence. All required write/audit/activity and minimal outcome correlation are atomic. Accepted values do not dynamically join today's policy.                              |
| Current state              | Current source facts/time plus qualified authority. A display projection, cached Active flag, worker schedule or historical success cannot create current eligibility.                                                                    |
| Actor and tenant           | Trusted current server context, with tenant-aware structural relationships and command admission. Client input identifies intent/resource and expected revision, not trusted ownership or timestamps.                                     |
| Presentation               | A currently authorized projection of source timing using existing explicit locale/zone conventions. Preview is estimated; accepted source instants are absolute. Formatting has no write authority.                                       |
| Audit and retention        | Required business history records the accepted event/actor/terms; technical traces explain attempts and faults. Each follows its own qualified retention. Neither requires copying private bodies or keeping every denied attack forever. |

No money value changes. This decision adds no gift/application/allocation record,
financial precision rule, conservation change, message delivery, target count or
coach-sharing authority. Existing financial and communication boundaries stay
independent; the period cannot become a shared generic financial timer.

## Exact required amendments

These clauses are the exact ratified decision requirements. They add no new
implementation authorization. References to qualified contracts are release
conditions with named outputs, not permission to ship guessed behavior.

**C01 — One policy and one unit.** Ordinary Continue referral SHALL use one
organization-wide positive whole-number period in elapsed days. One day SHALL
mean exactly 86,400 seconds. The ordinary staff and missionary action SHALL use
the same period under their independent authority. No per-person/project/cycle
override, date picker, unit selector, indefinite value, business calendar or
automatic extension SHALL be introduced. This SHALL govern renewed cycles only;
reuse an existing policy only after its exact semantics and migration meaning
are qualified, without silently changing initial-referral behavior.

**C02 — Separate administration and Off.** Current qualified policy-management
capability SHALL govern configuration; Continue capability SHALL not imply it.
The saved period SHALL remain configurable by authorized staff while missionary
self-service is Off. Saving the period SHALL NOT enable self-service. Off SHALL
retain D35's meaning and SHALL remain operable despite an invalid unsaved numeric
draft. No ordinary Clear period operation SHALL be added. Empty input SHALL be
validation failure, not policy deletion or an indefinite sentinel.

**C03 — Supported finite input.** Before activation the P9/API owner SHALL publish
one explicit supported integer range, accepted timestamp/driver precision and
checked arithmetic/serialization limits in the source contract and release
proof. The same range SHALL be enforced by the form, API and database. N SHALL
be positive, finite, integral and representable; null, empty, zero, negative,
fractional, nonnumeric, unsafe, over-range and overflow inputs SHALL fail without
rounding, clamping, fallback or coercion to Never. A new/unconfigured tenant SHALL
have no implied number; preserve a qualified explicit existing value. Missing
or unqualified terms SHALL gate only dependent commands, including ordinary
staff Continue, without ending accepted work or revoking unrelated rights.

**C04 — One authoritative acceptance clock.** After the required source/policy/
authority ordering and waits, the native source SHALL capture one fresh trusted
database instant A. Compute finite E = A + N × 86,400 seconds using checked exact
arithmetic, require E > A and commit A/E/N/policy evidence with the accepted cycle.
A becomes authoritative only if that transaction commits. Browser, page-load,
request-start, transaction-start-before-wait, worker and response times SHALL
NOT substitute for A. No physical commit timestamp or separate clock service is
required. Display precision SHALL NOT decide expiry.

**C05 — Accepted terms and history.** The accepted A/E/N and exact relevant policy
identity/revision SHALL be retained as attributable source facts. Ordinary
configuration, read, activity, timezone, deployment, task, assignment or import
changes SHALL NOT recalculate them, rewrite original introduction/prior cycles,
or move the accepted expiry. An authorized factual source correction SHALL use
its separate history-preserving contract, not a general status/date PATCH.

**C06 — Prospective, concurrency-safe settings.** A period edit SHALL affect only
later accepted continuations. Save SHALL use the expected authoritative base
revision, atomically persist the value/revision/required audit and minimal
semantic recovery evidence, and reject silent lost updates or same-correlation/
different-input reuse. The unconfigured policy namespace SHALL have stable
ordering; initialization and value A→B→A SHALL not revive stale review authority.
A lost save response SHALL recover that save rather than overwrite intervening
settings. No full-history recalculation or generic command journal is required.

**C07 — Honest preview and changed terms.** Before action, show N and an explicitly
estimated end with date/time and visible zone or unambiguous offset. The final
endpoint SHALL be computed from acceptance. A relevant policy/material source
change, changed displayed end calendar date or changed display-zone context
SHALL require refreshed terms and a new deliberate intent before effect. The
qualified reviewed display basis SHALL support that comparison without becoming
clock or authorization authority. Ordinary within-date estimate drift, including
a normal DST offset transition in the same zone, SHALL NOT alone require another
confirmation. Format the actual accepted time and offset together from E; never
reuse a stale preview offset. No second-by-second equality loop or countdown.

**C08 — Current ordered authority.** Native admission SHALL derive tenant, actor,
active assignment, scope, capability and attribution from trusted current context.
Caller fields may identify the intended source and expected revision but SHALL
NOT author ownership, accepted policy facts, A or E. Source-cycle acceptance,
relevant settings and authority changes SHALL have a qualified common ordering
boundary with current checks after waits. Prior committed restriction/change
SHALL prevent stale acceptance; later changes SHALL not rewrite a completed
source outcome. Unknown/custom deadline fields SHALL be rejected by the command.

**C09 — Exact-cycle effect and recovery.** Preserve D35's single consumption of
an expired source cycle across actors/transport keys, terminal no-effect intent
safety and one native transaction for cycle/terms/audit/required activity/minimal
outcome correlation. Recovery SHALL return the original currently permitted
outcome and endpoint, even after Off, policy edits or another expiry. It SHALL
not compute a new E, open the next cycle, credit another actor or revive side
effects. Acceptance and later disclosure failure SHALL remain distinguishable.
Use native source change evidence, not a new provider gate or generic CRM ledger.

**C10 — Exact expiry and delayed work.** This window SHALL be active only for
A ≤ current trusted time < E, subject to all other current conditions. At E it
SHALL be expired even when a worker, cached Active flag or browser is late. A
worker, if needed by the existing source, SHALL target the exact cycle, expected
E and relevant source revision and be idempotent; stale work SHALL not terminate
a newer cycle. No new cron is necessary merely to know the current deadline.

**C11 — Independent clocks and source caps.** Referral work expiry SHALL NOT
extend a grant, supply contact consent, reset retention, restore erased content,
reopen cultivation/tasks, send anything or count an interaction. A grant or
privacy/source restriction can remove a permission path before E without
rewriting E; other independently valid paths remain separately evaluated. A hard
source-lifecycle cap conflicting with proposed terms SHALL be resolved through
its qualified source contract before acceptance, never by hidden clamping or
an unselected override. No new cap-setting hierarchy is introduced.

**C12 — Structural integrity.** The owner representation SHALL enforce required
non-null tenant/source/cycle/accepted-policy identity, tenant-aware foreign
relationships, one-consumption/active-source invariants and valid finite accepted
timing combinations. Required fields need null protection as well as CHECKs.
Ordinary updates SHALL not change trusted tenant, actor, lineage, cycle, accepted
terms or policy provenance. Policy replacement/deletion SHALL not cascade-delete
accepted history. Retention/disposition remains qualified; append-only required
business history does not imply retaining private bodies forever. Mutable
current-time/policy/permission lookups SHALL not be hidden in immutable row CHECKs.

**C13 — Database and privileged-path parity.** Qualify actual grants, RLS USING
and WITH CHECK behavior, permissive-policy composition, column mutation rights,
views, RPC EXECUTE/search paths/owners, storage if reached, and service-role or
operator paths. An allowed update SHALL not transform a permitted row into a
forbidden tenant/owner/cycle/state even if both rows independently pass visibility.
PostgreSQL's documented omitted-WITH-CHECK inheritance SHALL be acknowledged;
it is not a substitute for immutability. Browser raw writes and generic donor/
task-date mutations SHALL not bypass the source command. Do not assume service
roles, owner-executed functions or one migration prove safe live RLS.

**C14 — Current disclosure everywhere.** Classify actual timing/policy fields
under ADR-0209 and use P12's shared resolver for settings, preview, action result,
recovery, list/detail, errors, caches, search, exports and diagnostics. Tenant
and purpose scope SHALL remain in all keys and release paths. Recheck authority
at final disclosure release; discard known-stale controlled-client responses.
Historical acceptance SHALL not imply Active now or current read permission.
This does not promise recall of bytes already lawfully released. Apply ADR-0211
only to actual projection-policy widening, not routine per-item actions.

**C15 — Simple useful feedback.** Use the existing referral settings and D35
contextual action with shared Base UI/base-maia components and semantic tokens.
Show saved versus draft settings, no invented default, clear scope/prospective
impact and truthful loading/unset/rejected/unknown/accepted states. Maya SHALL
not administer unavailable settings, choose a date or complete a redundant
routine modal. The accepted endpoint SHALL be presented as an exact boundary,
not an unselected through-day guarantee. Keep logical focus/filter context.

**C16 — Accessible international and weak-network use.** Existing locale and
zone preferences SHALL render the same accepted instant without a new timezone
setting or protected-location inference. Actual time/zone shall stay consistent
across locales, DST and date-line differences. Test keyboard/touch, accessible
label/unit/error associations, focus, status announcements, 320 CSS-pixel reflow,
zoom and long names/dates/zones. No meaning by color alone, accidental numeric
wheel change or continuously announced timer. A disconnected client SHALL not
queue privileged continuation for silent replay; safe recovery uses original
intent and current disclosure.

**C17 — Source ownership and correction.** Native P9 owns referral lifecycle and
ordinary continuation; P12 owns current action/read/contactability rules; the
qualified policy owner owns period settings; P28 presents permitted results.
No CMS, external CRM, coaching summary, task due date or client cache SHALL become
a competing write authority. Corrections preserve history and current access.
Do not introduce a vendor dependency, generalized renewal engine, per-user
configuration hierarchy or automatic notification to deliver this decision.

**C18 — Business evidence and minimization.** Required durable history SHALL
identify the tenant/source/cycle, actor/action, accepted A/E/N/revision and accepted
or corrective outcome sufficiently to explain it. Technical traces SHALL record
minimal correlation, failure stage and safe reason codes separately. Do not log
private context, contact bodies, protected location or unneeded identifying
labels. Denied attempts follow security logging rules, not one durable business
row per attack. Retention, erasure, backups and restore SHALL honor their own
qualified owners without erasing required accepted-outcome evidence prematurely
or retaining everything indefinitely.

**C19 — Bounded work and measured capacity.** Ordinary continuation SHALL use
one exact source/cycle with required policy/authority checks; normal policy save
SHALL not scan/rewrite historical referrals. Index actual tenant/source/cycle
and due-expiry query shapes; bound list pagination, any reconciliation batch,
lock waits and retry work. Before activation publish measured production-shaped
latency, contention, recovery and capacity budgets with workloads/units. No
unmeasured “fast/scalable” claim, tenant-global serialization by default, per-row
network authorization or unbounded history load qualifies this requirement.

**C20 — Migration, compatibility and restoration.** Before activation inventory
retained source/configuration facts and all writer versions. Do not backfill a
guessed N, reinterpret old null as Never, rederive old E from today's policy or
replay historical expired cycles. Qualify old/new writer compatibility and gate
unqualified mutations. Restore current privacy/erasure, accepted timing and
consumed-cycle evidence before governed release/acceptance. Containment stops
new affected acceptance without deleting accepted history or restoring an
unsafe generic status/date path. Roll forward where old code cannot safely
understand accepted data. Existing qualified choices survive upgrades.

**C21 — Qualification evidence, not a guessed producer.** P9/API and database
owners SHALL supply the concrete period/source mutation contract, supported
integer/timestamp range, source-cap compatibility, actual clock/precision proof,
constraint/authorization matrix, recovery and migration evidence. P12 SHALL
qualify actual grants/projections/privileged paths. UI owners SHALL provide
accessible whole-journey evidence. All P01–P40 below SHALL trace to observable
domain/user outcomes before activation. A finite Python model or document check
SHALL not be substituted for runtime, real SQL/RLS or end-user evidence.

**C22 — Test comprehension before release.** Validate with representative tenant
settings administrators, independently authorized staff and missionaries, including
phone and weak-network use. They must be able to explain saved period versus
self-service Off, estimated versus accepted end, no individual date choice and
unchanged prior cycles, and complete/recover the action without coaching. Any
observed wrong-authority, wrong-date or duplicate-action interpretation SHALL be
resolved and rechecked before release. This is a required study; no completed
interview or measured success rate is claimed here.

**C23 — Traceability and scope.** Keep Q36's answer, D36 decision/C01–C24/P01–P40,
conceptual glossary and session status consistent. After explicit formalization
authorization, map requirements to P9/P12/CRM owner extensions, OpenSpec scenarios,
design, tasks, implementation tests and release evidence. Create a new ADR only
for an actual governing decision/conflict; do not edit governing artifacts or
invent GitHub tickets during this grill review. D35 and earlier evidence remain
preserved; D36 amendments are not ratified by merely selecting A.

**C24 — Owned operations.** Before activation assign the owner roles and implement
the signals, thresholds and responses in the monitoring register below. Broken
authority, arithmetic, history or duplicate-effect invariants SHALL block release
or trigger containment, not be accepted as a monitor-only risk. Operators SHALL
recover through source evidence and qualified commands, never direct database
repair or another Continue. Missing named ownership or an unmeasured required
budget SHALL fail the activation gate rather than become a silent TODO.

## Material findings and permanent resolution

Severity reflects impact; likelihood is a qualitative judgment **without the
safeguard**, not an incident frequency or claim about current production.
Each row states the consequence, reason/evidence, decision impact and exact
permanent requirement. Shared findings are referenced by multiple categories
rather than counted as different risks.

| Finding                                     | What can go wrong and why it matters                                                                                                                                | Severity / likelihood                                          | Evidence and decision impact                                                                                                                                    | Permanent fix and exact language                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| F01 — Undefined day and anchor              | Calendar-day/DST arithmetic or transaction-start time produces the wrong interval after waits. A finite number alone cannot tell Maya when work expires.            | High / likely in a naive date implementation                   | PostgreSQL clock/interval semantics; scoped P12 precedent, actual unrelated timezone fields. **Narrows A** with an explicit elapsed unit and acceptance anchor. | C01, C04, C10, C16; P01–P07. Compute fixed elapsed E from fresh A after waits; exact E is expired.                                |
| F02 — Unsupported or fabricated settings    | Blank/zero becomes unlimited, examples become defaults, or huge/fractional input overflows/rounds. “Finite” is not sufficient machine or source validity.           | High / plausible; guessed default likely if prefilled casually | Broad current org_settings shape; no researched numerical norm; PostgreSQL null/infinity semantics. **Changes implementation scope**, retains A.                | C02–C03, C12, C21; P08–P11. Publish/prove supported bounds before activation; unset honestly and fail dependent commands safely.  |
| F03 — Retrospective drift                   | Joining current N to old A rewrites past or active E after settings changes, travel or ordinary edits. Prior promises/history become unreliable.                    | High / plausible                                               | P9 retained history; proposed prospective policy; inactivity products demonstrate tempting reset patterns. **Narrows A**.                                       | C05–C06, C17; P12–P14. Preserve accepted terms, future-only edits and distinct factual correction.                                |
| F04 — Wrong tenant or privilege             | Reusing fixed-tenant org settings or trusting role/caller fields changes another policy or lets an actor administer what they may only use.                         | High / plausible on unchanged reuse                            | Current org-settings constant/admin gate, service-role helpers and P12. **Requires qualified boundary**, not proof of an existing exploit.                      | C02, C08, C12–C14; P15–P20. Trusted scope, tenant-aware relationships, actual manage/act separation and privileged-path parity.   |
| F05 — Policy/authority race                 | Precheck passes, then settings/permission changes while the command waits; two admins overwrite each other; A→B→A revives stale terms.                              | High / plausible with concurrent users                         | PostgreSQL Read Committed/locking facts; D35 current acceptance; stable absent-policy need. **Narrows A**.                                                      | C06, C08; P21–P23. Qualified common ordering, expected revision, fresh after-wait checks and conflict recovery.                   |
| F06 — Misleading preview                    | UI promises exact pre-click E or through-day access, freezes page-load A, or silently substitutes a different reviewed date/policy. Users plan against false terms. | Medium–high / plausible                                        | Acceptance occurs later; current task write/read pattern; official date guidance. **Changes UX wording**, retains one action.                                   | C07, C15–C16; P24–P26. Honest estimate, actual accepted endpoint, material refresh only; no offset-only confirmation.             |
| F07 — Off/configuration coupling            | Off clears the period, hides staff configuration or ends accepted work; Save enables missionaries; invalid form blocks Off.                                         | High / plausible                                               | D35 separate authority; shared ordinary period amendment. **Narrows A** and makes staff impact explicit.                                                        | C02–C03, C11, C15; P27–P28. Preserve settings/accepted work; separate self-service; no Clear or hidden staff fallback.            |
| F08 — Retry creates a new deadline          | Lost response, another policy or later expiry causes another cycle, another A or false failure. Duplicate business effects and wrong history follow.                | High / plausible on generic retry reuse                        | D35 exact-cycle/terminal intent; current separate write/read patterns. **Retains A with required durable recovery**.                                            | C06, C09, C18; P29–P31. Original native outcome correlation and atomic effect; never recompute on recovery.                       |
| F09 — Job becomes clock authority           | A late worker leaves expiry active, or old-cycle work expires a newer continued cycle.                                                                              | High / plausible                                               | Source versus projection distinction; delayed/out-of-order jobs are ordinary failure cases. **Narrows implementation**, no new scheduler mandated.              | C10, C19; P06–P07, P32. Current exact E governs; worker targets exact cycle/end/revision and is idempotent.                       |
| F10 — Valid row becomes forbidden state     | Weak FK/null/delete/update rules cross tenants, erase historical policy or transform actor/cycle/accepted terms while row visibility still passes.                  | High / plausible without constraints                           | P9 same-tenant graph; PostgreSQL CHECK-null, RLS old/new row and privilege semantics. **Requires database/command proof**, retains A.                           | C12–C13; P16–P20. Structural constraints, immutable trusted facts, actual grants/views/functions/service tests.                   |
| F11 — Work window becomes permission        | Future E revives hidden context, extends grant/retention/contact rights, or exposes a date after revocation through recovery/cache/export.                          | High / plausible with generic DTO reuse                        | P12/ADR0209, D34/D35 minimization, actual broad donor paths. **Narrows A**; stronger source restrictions remain.                                                | C11, C14, C18; P19–P20, P33–P34. Independent clocks/current projection, source-cap qualification and minimized logs/restore.      |
| F12 — Small feature becomes a policy engine | Per-person overrides, unit calendars, hidden staff date powers, new journal/scheduler or modals add choices/debt without evidence.                                  | Medium / plausible under “customizable” expansion              | Selected A, P9 no generic journal, comparative source limits and UX critique. **Rejects unnecessary implementation proposals**, not A.                          | C01, C09, C15, C17; P35. One setting/action; use native history, existing design system and independent correction.               |
| F13 — Inaccessible or fragile journey       | Names/dates overflow phones; no unit/zone is announced; unknown results look failed; timezone inference exposes location; weak network repeats work.                | Medium–high / plausible                                        | Official form/WCAG/timezone guidance; no actual UI test yet. **Requires whole-journey design and evidence**.                                                    | C15–C16, C22; P24–P26, P36. Readable wrapping, labels, focus/status, current safe recovery and actual device/assistive tests.     |
| F14 — History scans and global contention   | Every policy edit rewrites all referrals, list loads all history or one tenant lock serializes unrelated work. Larger tenants become slow and hard to operate.      | Medium / plausible if implemented naively                      | Constant exact-source action needs versus historical projection; no measured capacity exists. **Narrows implementation**.                                       | C06, C19, C24; P37. Exact indexed access, bounded work and measured budgets before activation.                                    |
| F15 — Unexplained changes and repair debt   | Operators cannot distinguish original policy, accepted end, current expiry and failed response; manual repair or another Continue corrupts history.                 | High / plausible without source evidence                       | P9 atomic audit/activity; D35 minimal outcome; missing producer. **Requires operational evidence**, retains A.                                                  | C09, C18, C24; P30–P31, P38. Separate business audit/security logs/technical traces, source recovery and owned signals.           |
| F16 — Unsafe rollout or restoration         | Old code accepts custom/null dates, a backfill guesses policy, rollback loses accepted evidence or backup restore revives consumed cycles/erased context.           | High / plausible in mixed versions                             | Existing generic routes are unqualified; accepted history and privacy must survive. **Blocks activation until compatibility proof**, not product selection.     | C20–C21; P39. Retained-data/writer census, explicit compatibility, no guessed conversion, safe containment/roll-forward.          |
| F17 — Unsupported authority transfer        | A CRM/coaching example or current code is treated as the owner contract; operational period edits are confused with projection-policy widening.                     | High / plausible without source distinctions                   | P9/P12/ADR0209/0211; scoped P24 precedent; vendor clocks have different purposes. **Clarifies amendment authority**, retains A.                                 | C11, C17, C21, C23; P35, P40. Explicit owners, exact scope and qualified contract; actual widening only under its governing rule. |
| F18 — Paper proof mistaken for readiness    | Attractive spec or Python model is called production-safe; no limits, SQL roles, usability or runtime capacity has actually been qualified.                         | High / plausible if evidence labels are dropped                | Bounded searches/model only; no live SQL, application, user study or load test. **Limits claims and activation**, not selected product direction.               | C03, C21–C24; P36–P40. Named evidence gates and traceability; resolve all invariant failures before rollout.                      |

## Independent review of every requested category

“Material concern” below means a real omission or plausible implementation hazard
in the unamended answer, not evidence that a production incident occurred. The
findings above provide all required consequence/severity/likelihood/evidence/
impact/fix dimensions. No category is silently treated as covered by another.

| #   | Category                                                      | Material concern? Individual conclusion and check                                                                                                                                                                                                                                                                                                               | Required resolution                                                          |
| --- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | Problem validity, necessity, and alternatives                 | **Yes — F02, F12, F17.** The renewed work needs an end; no evidence supports a universal number or individual exception engine. Compared optional prefilled date adjustment, fixed Asym value, existing qualified policy reuse and no-build containment. A is the strongest selected simple path, with explicit bounds/unit and source ownership.               | C01–C03, C17, C21; retain A.                                                 |
| 2   | Brittleness                                                   | **Yes — F01, F02, F05, F06.** Timezone/DST, settings initialization, concurrent change and stale previews defeat ideal-condition assumptions.                                                                                                                                                                                                                   | C03–C08; test real clock, inputs and race orderings.                         |
| 3   | Technical debt                                                | **Yes — F03, F10, F12, F17.** Broad settings JSON, task-date reuse, copied generic status handlers and a new timer journal would duplicate weak abstractions.                                                                                                                                                                                                   | C05–C06, C09, C12–C13, C17; strengthen one native source boundary.           |
| 4   | Edge cases                                                    | **Yes — F01–F03, F05–F09.** Checked exact E, leap/year/DST, missing/corrupt input, UTC-offset changes, travel, policy ABA, lost result after a second expiry and old jobs.                                                                                                                                                                                      | C03–C11, C16; P01–P14, P21–P32.                                              |
| 5   | Footguns                                                      | **Yes — F02, F04, F06–F08.** Blank-as-Never, Clear, Save-enables, Off-blocked-by-invalid-draft, date-only copy and retry-as-new are avoidable mistakes.                                                                                                                                                                                                         | C02–C03, C07–C09, C15–C16; explicit defaults/feedback and source safeguards. |
| 6   | Tenant safety                                                 | **Yes — F04, F10, F11.** The inspected fixed-tenant settings route and generic privileged paths are unsafe reuse foundations. Tenant keys/FKs, policy identity, cache/search/export and actor scope were checked conceptually/static only.                                                                                                                      | C08, C12–C14; real multi-tenant proof required, no exploit claimed.          |
| 7   | Database, RLS, and authorization safety                       | **Yes — F04, F05, F10, F11.** Examined null/default/finite types, tenant-aware relations, uniqueness/deletion, trusted mutable fields, indexes, grants/RLS old/new rows, views/RPCs/service roles, migrations and attribution. No money fields are introduced. Live effective policies remain unverified.                                                       | C03–C04, C08, C12–C14, C19–C21; P08–P23.                                     |
| 8   | Overengineering                                               | **Yes — F12.** Calendar builders, per-item overrides, generic journals, exact-second preview fencing and offset-only rejection add friction without changing selected terms.                                                                                                                                                                                    | C01, C07, C09, C15, C17; eliminate them.                                     |
| 9   | UX/UI and user friction                                       | **Yes — F06, F07, F13.** Complete administrator/Maya/staff, phone/localization/accessibility/weak-network and failure journeys need exact copy and understandable scope. No donor checkout/address or coach UI is changed; adding those would be unrelated scope.                                                                                               | C02, C07, C15–C16, C22; actual user/device proof before release.             |
| 10  | Source of truth, ownership, and domain invariants             | **Yes — F03, F09–F11, F17.** Policy, accepted cycle, current state and display must have separate authority; historical terms cannot be a current-policy formula. Cardinality and non-money invariants are explicit above.                                                                                                                                      | C04–C05, C09–C14, C17–C18.                                                   |
| 11  | Hidden coupling                                               | **Yes — F07, F11, F12, F17.** Self-service Off, staff action, initial referrals, retention, grants, contactability, tasks and vendor clocks could be accidentally tied together.                                                                                                                                                                                | C01–C03, C11, C17; one shared ordinary period, independent authorities.      |
| 12  | Failure modes                                                 | **Yes — F05, F08, F09, F15.** Partial persistence, lost settings/Continue response, failed post-write projection and delayed work must fail visibly and recover without duplicate effect.                                                                                                                                                                       | C06, C08–C10, C14, C18, C24.                                                 |
| 13  | Lifecycle, temporal correctness, concurrency, and idempotency | **Yes — F01, F03, F05, F08, F09.** Defined unconfigured/configured, current expired/new accepted cycle, exact expiry, terminal rejected intent, current restrictions, correction and replay. Same old intent cannot consume a later cycle.                                                                                                                      | C03–C11; P01–P14, P21–P32.                                                   |
| 14  | Data integrity risks                                          | **Yes — F03, F05, F08–F10, F16.** Duplicated cycles, stale deadlines, mixed policy fields, cross-tenant relationships, history deletion and restore drift remain material without constraints/atomicity.                                                                                                                                                        | C05–C06, C08–C10, C12–C13, C20.                                              |
| 15  | Security and privacy risks                                    | **Yes — F04, F10, F11, F15, F16.** Even dates/status/recovery metadata can disclose restricted referral existence. Checked logs, audit, exports, backups, derived caches and protected location; no new attachment/document provider is needed.                                                                                                                 | C08, C11–C14, C18, C20.                                                      |
| 16  | Scalability and performance risks                             | **Yes — F14, F18.** No capacity or latency has been demonstrated. Avoid history scans/global locks; quantify workload/batch/query/recovery budgets at source qualification. Unit claims here are mathematical, not performance estimates.                                                                                                                       | C19, C21, C24; P37.                                                          |
| 17  | Operational burden                                            | **Yes — F07, F09, F15.** Missing setup, ambiguous outcomes and stale jobs could demand developer repair. Supported configuration/source recovery and clear ownership are necessary; no new cleanup workflow for users.                                                                                                                                          | C02–C03, C09–C10, C18, C24; P27–P32, P38.                                    |
| 18  | Observability and auditability gaps                           | **Yes — F15, F18.** Accepted terms/actor and current state must be distinguishable from technical attempt logs; no private-body copying. Monitoring without owner/threshold is insufficient.                                                                                                                                                                    | C18, C21, C24 and named monitor register.                                    |
| 19  | Dependency and integration risks                              | **No new material external-runtime dependency is required.** Inspected vendor analogies are research only; no email/calendar/provider call belongs in Continue. **Material existing dependency concern — F01, F17, F18:** database/driver precision, timezone rendering and source/permission owners need qualification. Imports/events must not reset periods. | C04, C05, C17, C21; no vendor sync/lock-in added.                            |
| 20  | Migration, rollout, and upgrade risks                         | **Yes — F16.** Null/legacy periods, old date writers, backup restoration and rollback can violate newly accepted facts. Need explicit activation sequencing and safe containment preserving data.                                                                                                                                                               | C20–C21; P39.                                                                |
| 21  | Testability, traceability, and proof                          | **Yes — F18.** “Finite” alone was not falsifiable across deployed paths. Clauses, boundary/negative/race/projection/migration/accessibility cases and authority statuses are now explicit. No runtime proof inferred from planning.                                                                                                                             | C21–C23; P01–P40 and verification evidence.                                  |
| 22  | Other development hazards                                     | **Yes — F02, F16–F18.** Unsupported defaults, unresolved producer/bounds, ownership gaps and broad future formalization could turn a narrow answer into unsafe rollout. No additional independent monetary, CMS publishing or coach-access hazard was found after checking reach.                                                                               | C03, C17, C20–C24; named gating outputs and no unauthorized formal edits.    |

## Required acceptance proof

These are falsifiable implementation/release requirements, **not tests claimed
as executed here**. Each must prove the observable outcome through the real
source/API/database/UI path as applicable, including negative paths rather than
merely checking that implementation functions call one another.

| ID  | Scenario and required observable result                                                                                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P01 | For every supported boundary N and qualified precision, E−A equals exactly N×86,400 seconds. Compare stored source instants, not rendered dates.                                                                                                 |
| P02 | Spring-forward and fall-back transitions preserve elapsed duration despite different local clock hours. Calendar-day arithmetic fails the negative case.                                                                                         |
| P03 | Leap day, month/year boundary, positive/negative/date-line zones and display-zone changes preserve the same accepted absolute E.                                                                                                                 |
| P04 | Real database wait crossing a relevant grant/source boundary uses fresh after-wait time/authority. A transaction-start timestamp or client-supplied time cannot accept stale eligibility.                                                        |
| P05 | Rollback after capturing A leaves no accepted cycle/terms. Physical commit-timestamp availability is not required; successfully committed A is the defined anchor.                                                                               |
| P06 | Immediately before E, exactly E and immediately after E produce the proper current time condition at supported precision. A rounded date/time cannot authorize.                                                                                  |
| P07 | Stop the expiry worker and suspend/reconnect a client across E: current source actions/reads cannot rely on a stale Active label. No worker timing extends the window.                                                                           |
| P08 | Published minimum/maximum N and adjacent invalid values agree across UI/API/database; reject null, empty, zero, negative, fraction, nonnumeric/unsafe and over-range values without coercion.                                                    |
| P09 | Finite timestamp range, multiplication/addition overflow, infinity and unsupported driver/JSON precision fail safely; no clipping or infinite window.                                                                                            |
| P10 | Missing configuration, first configuration and corrupt/unqualified configuration distinguish unset/error/unsupported states; no fallback duration or new Active cycle. Existing accepted work remains intact.                                    |
| P11 | Existing qualified organization values survive upgrade; no example/default number is silently saved for new or previously unconfigured tenants.                                                                                                  |
| P12 | Shorten and lengthen N after acceptance: old A/E/N/policy identity/revision and original introduction/history stay unchanged; next accepted cycle uses the new reviewed revision.                                                                |
| P13 | Reads, login, notes, calls, gifts, task dates/completions, imports, timezone changes and deployment do not extend E or continue an expired cycle.                                                                                                |
| P14 | Qualified factual correction retains attribution/history and obeys its own authority; ordinary policy/status/date mutation cannot masquerade as correction.                                                                                      |
| P15 | A source actor without manage capability cannot set N; a manager without Continue rights cannot continue. Staff and missionaries use the same period under distinct rights.                                                                      |
| P16 | Cross-tenant policy/source/cycle FK attempts, caller tenant/actor/start/end injection and custom-date/unknown fields are denied through all exposed write paths.                                                                                 |
| P17 | Actual USING/WITH CHECK, column rights and command restrictions prevent allowed-row transformation of tenant/owner/actor/cycle/accepted terms. Test combined permissive policies, not one predicate in isolation.                                |
| P18 | Anonymous, authenticated, service-role, operator, view and RPC paths meet the same product boundary; prove actual EXECUTE/search paths/owners and browser raw-table denial.                                                                      |
| P19 | Withdrawal, cannot-pursue, anonymity/privacy, assignment/grant expiry and revocation cannot be bypassed by a future E. Independently valid permissions remain separately evaluated.                                                              |
| P20 | Preview/list/detail/recovery/error/cache/search/export/audit access never leaks another tenant's or newly restricted referral timing/context. Post-acceptance revocation changes disclosure without erasing the accepted effect.                 |
| P21 | Two concurrent settings saves from the same base produce one ordered update and one conflict/review; lost response recovery never overwrites an intervening setting.                                                                             |
| P22 | Absent→configured and value A→B→A preserve stable, non-reused policy revisions. A stale action cannot regain authority from an equal numeric value.                                                                                              |
| P23 | Exercise both orderings of Continue against policy edit, Off, assignment/grant removal and source change after a lock wait. Outcome is fully accepted under valid reviewed terms or definitively no effect.                                      |
| P24 | Ordinary within-date preview delay accepts once with A at actual acceptance, full duration and actual returned E. UI explains the estimate and adds no needless modal.                                                                           |
| P25 | Policy change, displayed end-date crossing or changed display-zone context refreshes terms before effect; a rejected old intent cannot become accepted on later replay.                                                                          |
| P26 | An offset-only DST transition within the same zone/date accepts normally. Format actual time/offset together; pairing actual wall time with the preview offset fails the negative case.                                                          |
| P27 | Valid period plus missionary Off permits independently authorized staff Continue; Save does not enable missionaries and Off does not delete period or accepted cycles.                                                                           |
| P28 | An invalid unsaved period draft cannot block authorized Off. No Clear/blank-as-Never action; missing shared configuration blocks only dependent new staff/missionary commands.                                                                   |
| P29 | Concurrent staff/missionaries and distinct request keys consume one expired cycle once. No duplicate new cycle, required activity or attributed completion.                                                                                      |
| P30 | Inject failure after source write/before required audit/activity/outcome persistence, and after commit/before response: complete rollback or one recoverable native effect.                                                                      |
| P31 | Recovery after period change, Off, later expiry or another actor's newer cycle returns only the original permitted result/end. A terminal rejected intent never revives; same correlation/different input conflicts.                             |
| P32 | Delayed/duplicate old-cycle expiry work cannot end a newer cycle, rewrite accepted terms or duplicate durable history; exact current-cycle reconciliation converges.                                                                             |
| P33 | Referral E does not change grant or retention deadlines, send/contact consent, gift accounting, cultivation/task state or target counts. Source-cap conflict cannot produce hidden clamp or arbitrary override.                                  |
| P34 | Logging/exports/backups/disposition retain only qualified evidence; restore reapplies current restrictions/erasure before release and does not restore protected bodies.                                                                         |
| P35 | Shared source/permission/UI ownership remains singular. No per-item date power, new generic journal, scheduler, approval queue or third-party dependency is required; initial-referral semantics remain unchanged.                               |
| P36 | Actual phone/touch, keyboard/screen-reader, focus after row movement, zoom/reflow, long international names/dates/zones and weak-network journeys pass; representative users explain period/Off/estimate/history correctly.                      |
| P37 | Measured production-shaped single/large/multi-tenant workloads, worst qualified history, batch sizes and policy contention meet published latency/lock/recovery/capacity budgets without full-history rewrite or global serialization.           |
| P38 | A qualified operator traces exact policy/actor/A/E and distinguishes accepted outcome, current status and technical failure; source recovery works without direct DB repair or duplicate Continue. Monitor signals have tested owners/responses. |
| P39 | Retained-data and mixed-version deployment/rollback/restore rehearsals preserve accepted A/E/N/history and consumed-cycle identity. Old generic writers cannot bypass the new boundary; no guessed backfill.                                     |
| P40 | Every requirement traces from selected Q36 and ratified D36 amendments through later explicitly authorized owner/OpenSpec/design/tasks/tests/release evidence. No unselected numeric default, initial-period policy or ratification is asserted. |

## Synthesis and delivery order

**Before recording this answer as the reviewed decision:** resolve the unit,
anchor, policy edit effect, staff consistency, preview honesty and exact current
expiry semantics. The answer review supplied explicit proposed answers in
C01–C11; no unanswered founder preference was disguised as a prerequisite. The
founder has now explicitly ratified the corrected decision and amendments. D35
and the original unanswered Q36 remain preserved. This ratification changes
decision status, not implementation or activation evidence.

**Capture in the developing specification/design after the authorized transition:**
first map the renewed-period policy and exact source cycle to P9 and current
authority to P12; then specify the one-field/admin and one-action/Maya journeys.
Keep initial-referral policy, grant/contactability and retention distinct. Carry
the acceptance clauses and evidence labels together. No new ADR is automatically
necessary; an actual governing conflict needs an explicit scoped resolution.

**Qualify before implementation activation, in dependency order:**

1. **P9/API source owner and database owner:** identify the concrete native
   period/source representation, source caps, retained data and all writers.
   Publish the supported integer/timestamp range and precision, not a guessed
   30/90/365-day norm. A supported maximum must follow source safety, data types,
   driver/display range and deliberate product support; storage capacity alone
   does not establish appropriate supported behavior. Record the exact bound
   and adjacent-boundary proof before accepting any cycle. A range is not a
   tenant default; each tenant still chooses N.
2. **P12/security owner:** qualify current manage/act/read/contactability paths,
   real database roles/grants/RLS/views/RPC/service bypass controls, exact policy
   ordering and all reached projections. Do this before exposing the setting or
   accepting continuations. Fix unsafe reused handlers within that authorized
   implementation work; a fixed-tenant route is not acceptable infrastructure.
3. **P9/API plus database owner:** prove atomic A/E/N/revision capture, finite
   arithmetic, terminal intent/one-cycle semantics, outcome recovery and delayed
   exact-cycle reconciliation. Implement no secondary engine to compensate for
   missing source authority. Restrict or retire old bypass writers.
4. **Workspace/design owner:** implement the minimal shared-control journey and
   current permitted feedback, then perform C22's representative-user and
   accessibility work. Correct misunderstandings and re-test affected journeys.
   Documentation research alone cannot establish desirability/comprehension.
5. **Release/SRE owner with P9/P12:** run P01–P40 through actual paths, record
   production-shaped budgets, rehearse retained-data/mixed-version/restore and
   safe containment, assign named operator ownership and enable only qualified
   deployments. Existing explicit tenant choices are preserved; unconfigured
   tenants get no automatic period or missionary enablement.

These are finite qualification outputs owned by specific domains, not deferred
workarounds or permission to leave product behavior vague. This grill task is
not authorized to implement them, migrate live state or edit formal owner specs.
The proper permanent path is one qualified native boundary; activation stays
closed where its evidence is absent.

## Monitoring register

The following are ratified operational thresholds, not measured current incident
rates or commitments about current capacity. The named **owner roles must be
assigned to actual accountable people/on-call teams before activation**. Any
pre-release invariant failure is a release blocker. Monitoring never replaces
preventive constraints or required proof.

| Signal                                                                                                            | Threshold                                                                               | Accountable owner                         | Response                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized/cross-tenant period or timing disclosure/write                                                       | One confirmed instance                                                                  | P12 security owner                        | Contain the affected writer/egress, preserve minimal evidence, investigate scope, repair through qualified source/security procedures and requalify before reopening. Do not merely toggle missionary Off if staff/other paths are affected. |
| Wrong elapsed endpoint, ordinary rewrite of accepted A/E/N or duplicate consumed cycle                            | One confirmed invariant violation                                                       | P9 CRM source owner                       | Stop new affected acceptance, recover source truth, correct with attributable owner action, preserve original evidence and prove regression cases before resumption.                                                                         |
| Post-E admission based on stale Active or an old job changing a newer cycle                                       | One confirmed occurrence                                                                | P9 CRM source owner                       | Contain affected admission/reconciliation, validate exact-cycle fencing and current-time checks, replay only safe source reconciliation; never create another continuation to repair it.                                                     |
| Unknown source/settings outcome remains unresolved                                                                | One outcome exceeding the published qualified recovery budget                           | API on-call owner                         | Trace native outcome correlation, recover safely or provide a definitive currently permitted status; notify the owning operator through existing incident procedures, not automated supporter outreach.                                      |
| Latency/lock/batch/recovery budget regression                                                                     | Published budget exceeded in three consecutive 5-minute measurement windows             | SRE with P9 API owner                     | Diagnose actual query/lock/workload shape; reduce affected bounded batch/concurrency or contain new affected work while preserving accepted cycles; remeasure. Budgets/workloads must be numeric and qualified before rollout.               |
| Source-policy configuration errors for a previously configured tenant                                             | One confirmed unexpected invalid/missing saved policy                                   | Tenant administration owner with P9 owner | Keep dependent acceptance gated, preserve existing cycles, diagnose saved revision and repair through the qualified settings/source path; do not substitute a default.                                                                       |
| User thinks Save enabled self-service, Off ended accepted work, estimate is fixed, or retry starts another action | One reproducible critical misunderstanding in pre-release study or post-release support | Workspace product/design owner            | Correct terms/interaction, re-test the affected journey; hold release for pre-release failures and contain misleading entry points where needed. No evidence-free numeric “usability success rate.”                                          |

A changing numeric tenant preference, ordinary within-date estimate drift or a
normal DST offset change is not an incident. Do not add warning banners, routine
confirmation dialogs or notification noise to monitor benign expected behavior.

## Research reconciliation and conflicts resolved

The fresh primary sources are evidence for specific facts, not a vote count:

- [TntConnect](https://www.tntware.com/tntconnect/help/en/pages/contacts_mpdphase.aspx)
  recognizes expired referral work but supplies no universal period. Its
  referrer-check suggestion does not authorize a new mandatory reconfirmation
  form under D35.
- [MPDX](https://help.mpdx.org/article/194-add-referrals-to-contacts) documents
  a two-week Recent filter. Preserving original referral provenance prevents
  treating continuation as a new introduction merely to appear Recent.
- [Pipedrive inactivity](https://support.pipedrive.com/en/article/the-rotting-feature)
  resets on ordinary activity/edits. That conflicts with fixed accepted D36
  windows and is explicitly rejected. Its [deleted-lead recovery](https://support.pipedrive.com/en/article/leads-inbox)
  period is also not borrowed.
- [GOV.UK text input](https://design-system.service.gov.uk/components/text-input/)
  supports visible units, short hints and whole-number keypad entry. Adopt the
  interaction guidance through Core's existing controls; do not import its
  component library or treat a numeric input as proof of accessibility.
- [PostgreSQL date/time](https://www.postgresql.org/docs/current/functions-datetime.html)
  demonstrates the calendar/elapsed and clock distinctions. [Row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)
  and [policy semantics](https://www.postgresql.org/docs/17/sql-createpolicy.html)
  require actual role/old-new-state proof. The generic claim that missing
  WITH CHECK always allows reassignment is inaccurate: inheritance occurs in
  documented cases. SECURITY DEFINER likewise means owner privileges, not
  unconditional RLS bypass. The database note explicitly corrects both.
- Existing P24 and preparation-retention elapsed clocks are scoped precedents;
  coaching calendar conventions remain valid for their own purpose. Adopting
  elapsed days here is explicit ratified D36 language, not an invented global
  clock standard.
- ADR-0211 applies when actual projection policy widens. A longer ordinary
  work period under an unchanged qualified policy is not automatically that
  change, and no per-Continue two-person approval is added.

An independent UX challenge rejected root's tentative **UTC-offset-only preview
rejection**. Two seconds across spring-forward can render a different offset
without changing the disclosed elapsed duration or calendar date. The permanent
fix is coherent actual-end formatting, not another confirmation. Policy,
calendar-date and display-zone-context changes still refresh reviewed terms.
This removes needless complexity while preserving an honest result.

## Proof performed and its limits

The new D36 evidence uses a finite temporal/counterexample model, independent
static reviews and documentation checks. It does not execute a database,
application, live role, authenticated vendor UI or real end-user study. Fixture
numeric bounds inside the model are expressly not product values. Previous
phase models/probes/verifiers are preserved and were not executed.

The [model readme](d36-evidence/model-readme.md),
[counterexample review](d36-evidence/counterexample-review.md),
[model source](d36-evidence/temporal-counterexamples.py) and
[author result](d36-evidence/temporal-counterexamples.json) provide the exact
finite claims. Root read its entire source, checked the four frozen author hashes and ran
only that new D36 model once: **15 counterexample families, six positive controls
and 85 assertions passed**, with byte-identical author output. The
[root reproduction](d36-evidence/root-reproduction.json),
[cross-review resolution](d36-evidence/cross-review-resolution.md) and
[structural verification](d36-evidence/review-verification.json) record the
independent result and documentation checks. No claim of completed SQL/RLS, migration, load or accessibility
qualification follows from a passing finite model.

The [original Q36](d36-evidence/q36-before-answer.txt) is preserved before its
answer status changes. The [prior-evidence manifest](d36-evidence/prior-evidence-sha256.json)
pins all 25 D35 evidence files, including its original review and ratification
proof. Existing governing documents and application/schema remain unchanged.
D36's exact clauses are now ratified. The original answer review introduced no
new product question or formal specification transition.

## Explicit ratification

On **October 18, 2026 Asia/Bangkok**, the founder instructed: **“Ratify this
decision and amendment. Then continue with this phase 28 grill-with-docs session.”**
The complete corrected D36 decision, C01–C24 and P01–P40 are ratified, including
one organization-set positive whole elapsed-day period, exact native acceptance
and expiry, fixed accepted terms, prospective changes, shared ordinary staff
terms, independent missionary Off, honest estimates and current safe recovery.
The reviewed source, privacy, database, UX, migration, qualification and monitoring
requirements remain intact. No numerical duration/default, initial-referral
period, per-referral date override or runtime readiness is inferred.

The exact decision and C01–C24 are unchanged. P01–P40 are unchanged except P40's
status label from “pending D36 amendments” to “ratified D36 amendments”; this
records the founder's ratification without changing its acceptance outcome.
The [original review](d36-evidence/d36-before-ratification.txt) and
[original answered Q36](d36-evidence/q36-before-ratification.txt) are preserved.
The [ratification preservation manifest](d36-evidence/ratification-evidence-sha256.json)
pins all 15 original D36 evidence files and both snapshots. Original research
notes and review verification describe their evidence-time status and remain
unchanged; this section owns the later ratification status.

The [new ratification verification](d36-evidence/ratification-verification.json)
checks decision/amendment preservation, current traceability, local references
and hashes. No prior model, probe or verifier is executed. No formal owner
contract, PRD/ADR/OpenSpec, issue, application/schema, live permission, external
communication or GitHub state changes. The next researched question is separate.
