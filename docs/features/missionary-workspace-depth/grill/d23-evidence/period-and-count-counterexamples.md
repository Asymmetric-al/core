# D23 — Activity periods and counting counterexamples

Research date: **October 17, 2026 UTC / Asia/Bangkok**. The founder selected
separate optional outreach-attempt targets and subsequently confirmed supported
activity types with personal names, amounts and schedules. This note recommends
period, counting and correction semantics; it does not create
an activity store, schema, implementation, mandatory reporting or coaching access.

**Accept with required amendments.** Recorded activity is useful when the
measure and period are understandable. Five calls, including two that reached a
person, remain five underlying calls. The two qualified exchanges may also appear
in their own measure; adding those measures to produce seven activities is wrong.
Counts describe qualified records, not effort, all real activity or fundraising
success. A target is a voluntary planning denominator, not evidence of an encounter.

## Source authority and actual evidence

| Source freshly inspected                                                                                                                                                                                         | Fact or boundary                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Q23 frontier](../phase28-q23-activity-target-measures-research.md)                                                                                                                                              | The selected A distinguishes outreach attempts from actual exchange. Its five/two example is invented for the choice, not a workload recommendation or interview. Exact metrics and period handling require qualification.                                                          |
| [P28 roadmap](../../../../prds/sitestacker-parity/roadmap.md:4171)                                                                                                                                               | Explicitly optional **weekly** activity targets; coaching and logging remain separately deliberate. Monthly/custom dates below explicitly amend this inherited weekly contract after the founder confirmed personal schedules; they are not an existing owner choice.               |
| [Program owner constraints](../../../../prds/program-roadmap/owner-constraints.md:128)                                                                                                                           | The P28 Support-Raising Goal Version owns weekly target denominators. Preserve that conceptual owner through an activity arm; do not invent another target authority or inherit financial-plan synchronization.                                                                     |
| [P27 REQ27-P33](../../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:2365)                                                                                                             | Exchange, outreach and follow-up differ. Attempts, voicemail, no-shows, opens, generic notes and task completion do not establish exchange. One encounter can have several contributions without becoming several encounters.                                                       |
| [P27 context C07](../../../../prds/sitestacker-parity/phase-27-donor-development/context.md:95), [C11](../../../../prds/sitestacker-parity/phase-27-donor-development/context.md:147)                            | Keep actual precision, date-only and unknown distinct from recorded time; travel cannot redate date-only facts. Correction/deduplication/restriction rederive the current truth. History can change without creating a new encounter.                                               |
| [P27 work-date contract](../../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:261)                                                                                                     | Existing review dates use a validated authoritative Tenant IANA work timezone, frozen meaning and controlled rule reconciliation. This is a relevant owner seam, **not an already-selected activity-week calendar**. Giving/tax timezone is not an activity default by implication. |
| [D8 voluntary targets](../phase28-d8-adversarial-review.md:506), [D19](../phase28-d19-first-support-follow-up-adversarial-review.md), [D20](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md) | Choosing a target does not share it. Task handling is not a call/message/meeting or proof of interaction. Current source and exact audience remain mandatory.                                                                                                                       |
| [Current `mapActivity`](../../../../../packages/api/src/missionary-portal/donors.ts:292)                                                                                                                         | The mapper returns `activity.date ?? activity.created_at`. That static display fallback cannot qualify an unknown occurrence into this week's activity. No runtime or deployed metric defect is established here.                                                                   |

Primary technical pages were opened October 17, 2026:

| Primary source                                                                           | Verified fact                                                                                                                                        | Limit on adoption                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [W3C Working with Time and Timezones](https://www.w3.org/TR/timezone/)                   | Floating dates differ from instants; timezones have changing regional rules; converting date-only values through UTC can change their intended date. | Technical guidance supports preserving source precision. It does not choose Core's activity timezone, week start or donor-work rules. No historical country/zone inventory from the page is adopted.     |
| [Unicode LDML week data](https://www.unicode.org/reports/tr35/tr35-dates.html#Week_Data) | Calendar first day varies by region and may have explicit locale overrides; it is not necessarily the first working day.                             | Locale is suitable for presentation or a visible setup suggestion. A viewer's locale must not silently redefine an accepted target week. No CLDR library or custom calendar framework is added.          |
| [Python 3.12 `zoneinfo`](https://docs.python.org/3.12/library/zoneinfo.html)             | Uses IANA timezone data; repeated local times have different offsets selectable by `fold`.                                                           | Explains the local probe mechanism. Attaching a zone alone does not prove an entered wall time existed. Python/system-data outcomes do not qualify the JavaScript, database or production calendar path. |

No external source or fixture establishes optimum targets, a universal week start,
missionary effort, logging completeness, organizational timezone preference,
coaching effectiveness or a measured usability improvement.

## Smallest proposed period and revision contract

The parent synthesis proposes **Weekly** as the familiar starting schedule,
alongside **Monthly** and **Custom dates** after the founder confirmed personal
schedules. Monthly/custom dates amend the inherited weekly contract explicitly.
Use calendar months and an explicit finite custom date range, not rolling windows
or a recurrence builder. Do not add automatic proration, carry-forward deficits or
streaks. The supported measure owns counting semantics; a personal name cannot
change a call into a meeting or define an arbitrary predicate.

Each accepted target period needs one stable calendar meaning: exact local start
date, exclusive next start, named timezone for instant-based attribution and a
stable first weekday for weekly periods. Display the actual date range rather
than relying on “Week 42.” The proposed personal calendar is seeded visibly from
the validated tenant work timezone, with explicit personal zone/week-start setup.
Its activity binding must be qualified before activation. A visible locale-derived
first-day suggestion may assist setup; the saved calendar must not track browser
travel or changed display locale. Custom dates show an inclusive last calendar
date to the user and resolve the next local date as the exclusive storage boundary.

**Parent's proposed edit meaning:** a missionary may deliberately adjust quantity
for **this period only**, **this period and future periods**, or **next period
onward**, with dates stated before Save and prior values retained by the Goal
Version owner. This is ordinary capacity planning, not cheating. Closed periods
must not inherit today's scalar. Measure/scope and calendar-geometry changes
create a prospective version for the explicitly shown next period rather than
silently rebucketing existing periods. For a calendar transition, choose the next
complete period in the new calendar whose start is no earlier than the old
current period's end. Show its dates and any untargeted gap before Save. Periods
do not overlap; no partial transition target, proration or backlog is invented.
Source activity remains available independently through the gap.
Personal-name/display edits need no timing
chooser. These precise effects are review recommendations, not individually
selected by Q23 or proof of current implementation.

Creation during a period compares the **whole selected period**, including
qualified activity earlier than target creation. Pause marks the current period
paused immediately and suppresses future periods without a failure, invented
proration or missed-period backlog. Resume explicitly chooses the current period
with a deliberate quantity or next period and shows the dates. Current-period
resume still uses that whole period's qualifying recorded facts; target pause
does not erase actual activity. No earlier task/native-work admission rule should
be copied into these descriptive actuals: a target is a denominator, not permission
to begin having countable facts.

Source history is different from target history. Authorized late entry, backdating,
correction, deduplication and restriction recompute the relevant recorded-activity
facts for their true occurrence periods. They do not become new work this week,
erase lawful previous provenance or rewrite the chosen target. Do not lock honest
source correction to keep a chart stable, invent a backdating deadline or impose
an anti-gaming approval.

## Exact proposed clauses

**PC01 — Stable period denominator.** Activity targets SHALL use the existing P28
Goal Version owner, with Weekly, Monthly or finite Custom dates as the explicitly
amended schedule choices. Each period SHALL have explicit local date bounds,
week start when relevant and an authoritative named timezone where instants
require one. The personal calendar SHALL be visibly seeded from the validated
tenant work zone and allow explicit personal setup. Those
values SHALL be stable for each accepted period. Browser/server timezone, travel,
locale changes, giving/tax timezone and current mutable settings SHALL NOT silently
redefine prior or active periods. Show exact dates and relevant zone plainly.

**PC02 — Calendar boundaries.** Period membership SHALL use complete half-open
calendar boundaries, not a fixed 168-hour duration, rolling-seven-day window or
inclusive shared endpoints. Calendar conversion SHALL use qualified IANA rules;
ambiguous/nonexistent wall times require the source's qualified resolution, never
silent normalization. A timezone-data correction SHALL follow one controlled owner
reconciliation; independent clients SHALL not disagree about the same period.

**PC03 — Occurrence precision.** Use actual qualified occurrence, not creation,
update, import, task completion or provider-delivery time. Source-qualified
date-only facts SHALL retain the asserted date. Same-calendar membership uses
that logical date without invented midnight instants; cross-calendar facts whose
boundary membership is ambiguous remain unplaced until qualified by the source
owner. Unknown occurrence stays recorded but does not acquire a period. If available date/calendar evidence cannot
establish membership, expose the permitted limitation instead of guessing. Future
plans and invalid future-completed values SHALL not count as completed activity.

**PC04 — Explicit editable target meaning.** A repeating quantity change SHALL
explicitly choose this period only, this period and future periods, or next
period onward; retain accepted target version/history and show dates. Closed-
period denominators and actual activity SHALL not change merely because a
quantity changes. Calendar, measure and scope changes SHALL create a prospective
next-period version, not reclassify old periods. A calendar transition SHALL start
at the next full new-calendar period whose start is at or after the old current
period's end; show exact dates and any untargeted gap. No overlap, transition
proration or backlog SHALL be introduced, and source facts remain unaffected.
Personal-name/display edits
need no timing chooser. Creation and current-period resume SHALL compare the
whole selected period, including earlier qualifying facts. Pause SHALL mark
the current period paused immediately and suppress future periods without
failure, proration or missed-period backlog; resume SHALL explicitly select
the current period with a deliberate quantity, or next period. Zero, an absent
target and no recorded activity SHALL remain distinct. Removing or pausing a
target SHALL not delete history or present an undefined ratio as success.

**PC05 — One action, distinct measures.** Each admitted measure SHALL define its
unit and qualifying source outcomes. Calls placed include qualifying calls that
became exchanges; exchange is an additional property, not another call. Measures
that overlap SHALL not be added into an unlabeled activity total or productivity
score. One call involving several people is not several calls. A brief qualified
decline may be an exchange; no fundraising outcome or sentiment test is required.
The Personal messages measure SHALL explain qualified manually sent/provider-
accepted action and show recorded count, without claiming delivery or reply.

**PC06 — Source identity and attribution.** Count distinct qualified underlying
actions/encounters at the declared actor and subject scope, not narratives,
participants, relationship joins, transport requests or provider-event rows.
Author, actor and participant are different facts: recording a colleague's call
does not make it the author's activity. Distinct genuine attempts remain distinct;
an arbitrary same-contact/time cap SHALL not erase them. Multi-actor/subject views
require exact attributed membership and shall disclose whether they count unique
encounters or participations. Do not sum per-person/project counts as unique team
activity or infer authority from participation.

**PC07 — Reconciliation without invented duplicates.** Source-qualified identity
links SHALL reconcile manual/provider/import representations and correction under
the existing interaction/communication owner. Repeated saves, alternative request
IDs, received webhooks, delivery/read events and narratives SHALL not multiply the
same underlying action. Do not infer equivalence solely from name, subject, body,
nearby timestamp or provider thread. If identity is unresolved, retain the source
uncertainty and prevent an unqualified double contribution to a claimed exact
measure; do not silently delete an independently valid encounter.

**PC08 — Actuals remain correctable.** Authorized source correction SHALL rederive
all affected permitted period counts, including removing the old period's
contribution before attributing the corrected one. Preserve lawful correction
history and prior target versions. Source edits do not create new encounters or
mandatory tasks. Source invalidation, outage and missing/unknown evidence SHALL
remain distinct. Do not freeze false numbers merely because a period ended or
auto-declare a missionary's target failed because records are incomplete.

**PC09 — Honest optional progress.** Display recorded counts with their measure,
period and coverage. A complete query over eligible records is not complete
knowledge of the missionary's real work. Incomplete, filtered, unavailable,
unshared and undated data SHALL not become “zero activity,” a performance rating
or a private-existence hint. A decorative progress bar may visually fill at its
end, but actual values remain truthful above the target. No target has no target
ratio; choosing/adjusting one does not enroll the user in coaching or reporting.

**PC10 — Current authority and atomic records.** The target/source owner SHALL
derive tenant, actor, subject and attribution from trusted current context;
enforce expected revisions, exact accepted-command recovery and allowed field
changes for settings and source correction. Existing identity and source
permissions apply to counts, dates, summaries, cache entries and recovered results
before aggregation. No raw task flag, caller-supplied increment or settings grant
may create an encounter, impersonate an actor or share a metric. Read models and
caches are derived and rebuildable, never another activity write authority.

## Eight material concerns, remedies and required evidence

Likelihood is a qualitative engineering assessment before safeguards, not an
observed incident rate. Each row states what can fail, why it matters, severity,
likelihood, evidence, effect on A, permanent prevention/exact clauses and proof.

| Concern                                                | Failure and impact                                                                                                                                                                   | Severity / likelihood                                       | Evidence                                                    | Effect on A                                                      | Permanent fix / exact language                                                                               | Required proof                                                                                                                                                                                                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F1 — Calendar drift                                    | Travel, locale or fixed-duration arithmetic moves an encounter to another week or counts a boundary twice; saved target progress becomes inconsistent.                               | High / likely with browser-derived periods                  | P27 calendar precision; W3C/Unicode; T01–T06/T09–T12/T15    | Requires explicit calendar semantics for each selected schedule. | Stable owner calendar, exact dates and half-open bounds, **PC01–03**.                                        | Actual read/write paths across DST gap/fold, zones with fractional offsets, week/year/month/leap boundaries, custom inclusive end, date-only facts, travel and changed timezone rules; identical accepted period meaning on staff/missionary surfaces. |
| F2 — Target revisions rewrite the past                 | Today's smaller target changes last week's attainment, or changing the week start moves existing work; genuine capacity adjustment looks dishonest or arbitrary.                     | Medium–high / likely with one mutable scalar                | Existing Goal Version owner; C07/T14                        | Preserves direct ordinary editing with explicit effect.          | Versioned denominator; current/future effect visible; geometry prospective, **PC01/04**.                     | Current-period, temporary-only and future quantity edits; simultaneous edits; midperiod creation; pause/resume and prior-period display. Whole-period actuals persist without invented proration/debt/backlog.                                         |
| F3 — Entry time masquerades as activity time           | Unknown, late-entered or corrected history counts this week; planned/no-show work counts as completed.                                                                               | High / likely with inspected fallback or generic Done       | Current mapper; P27 C07/C11/P33; T07/T08/T13                | Narrows eligible evidence, retains voluntary manual logging.     | Preserve occurrence precision and correctable period membership, **PC03/08**.                                | Unknown vs date-only vs instant, backdated entry, future plan, source correction crossing a week, permissible history on paused work; no created-at fallback or duplicate movement.                                                                    |
| F4 — Overlapping measures become inflated productivity | Five calls plus two answered calls become seven activities, or useful one-way care is mislabeled failure.                                                                            | High / likely without exact labels                          | Q23/P33; C01/C12                                            | Supports A only with distinct meaning.                           | Stable units/outcomes, nonadditive measures, no score, **PC05/09**.                                          | Five-call/two-exchange scenario; brief decline; one call to several participants; outbound versus reply, voicemail and no-show; users explain the distinction without coaching.                                                                        |
| F5 — Joins and attribution multiply credit             | Two narratives, two actors or two projects become duplicate calls, or author receives credit for someone else's work; cross-scope counts can leak.                                   | High; critical if disclosure / plausible with generic joins | P33 one encounter; C02–C04                                  | Requires existing source identity and attribution.               | Distinct underlying action within exact actor/subject unit and current permission, **PC06/10**.              | Joint meeting, on-behalf logging, multiple ministry links, actor departure, duplicate narratives and hidden participant/subject; unique encounter versus participation results remain distinct and authorized.                                         |
| F6 — Retry and source shadows manufacture activity     | Provider outcome plus a manual record or repeated command counts twice; time-based dedupe instead erases two real calls.                                                             | High / plausible with alternate capture paths               | P27 same source command; C05/C06                            | Requires qualified reconciliation, not new integrations.         | Existing source identity and command recovery; no guessed collapse, **PC06–08/10**.                          | Lost response, replay with different transport ID, manual/provider exact link, unlinked ambiguous histories, two genuine close-together attempts and later source merge/correction. Verify final source outcomes, not only a cache increment.          |
| F7 — Empty/partial data claims zero effort             | Page caps, hidden history, failed query or absence of voluntary logs becomes zero, a missed target or a ranking; a filled bar hides seven actual activities behind a target of five. | High / likely with count/default shortcuts                  | P27 C11/D8; C08–C11                                         | Requires honest partial-progress presentation.                   | Qualified aggregate with coverage, preserved numerator, optional ratio and no effort inference, **PC09/10**. | Beyond one page; unavailable source; filtered/undated/permitted-empty states; actual exceeds target; no target; restricted coach; no hidden-event count, punitive state or compulsory log.                                                             |
| F8 — Current settings/source updates race or split     | Two edits overwrite, stale source correction leaves both periods counted, a worker restores restricted cached totals, or a late response clears newer drafts.                        | High; critical for wrong tenant/actor / plausible           | P27 context command/correction rules; source-derived counts | Requires existing owner command and derived read model.          | Current trusted scope, expected revision, atomic accepted result and qualified rederivation, **PC08/10**.    | Two editors; correction/read race; access revoke; tenant/actor switch; accepted command response loss; rebuild current totals from source and preserve exact prior target versions. Synthetic arithmetic does not prove these races.                   |

## Executed finite counterexamples and limits

Ran [counterexample-probe/probe.py](counterexample-probe/probe.py): **27/27
counterexamples reproduced** using Python **3.12.14**, system IANA **2026b**.
[results.json](counterexample-probe/results.json) retains every observation,
runtime and timezone-data path/hash. Examples deliberately use Monday and named
zones to expose alternatives; they do not select the product's week start.

T01–T15 cover real local calendar/UTC conversions plus synthetic evidence states.
C01–C12 cover finite cardinalities, information lost by a shortcut and plain
arithmetic. The two DST examples are 167 and 169 elapsed hours; half-open bounds
count the shared endpoint once. The five-call/two-exchange sets contain five
distinct calls, not seven. Different narrative/participant/project row counts
are not automatically unique action counts.

The fixture is not a proposed counting implementation. It shows why specific
shortcuts cannot preserve these distinguishable cases. It does not prove that a
real manual/provider pair refers to one encounter, that source qualification or
actor attribution is correct, or that the product should support a team measure.
Python's ambiguous-time handling and installed tzdata are not the Core date API.
No P9/P27/P28 runtime, actual source parser, PostgreSQL/RLS transaction, hosted
Supabase, provider, browser, accessibility, user study or performance test ran.
No previous probe was rerun, no dependency was added and no live data changed.

Before activation, prove actual source-to-period/measure identity and current
authorization, then exact target versioning, correction/rebuild/retry outcomes,
and finally user comprehension/mobile/accessibility. Do not substitute these
counterexamples for the real owner integration or introduce a generic metrics,
calendar, rules or anti-fraud engine to avoid specifying ten bounded clauses.
