# D23 evidence — activity targets, source meaning and authority

Research date: **2026-10-17**. Scope: documentary owner reconciliation for the
founder's selection of **A — separate optional outreach targets**, with substantial
customization and a simple, clear experience. This is an independently researched
input to the D23 review, not a formal specification or implementation.

**Status:** A is selected. The founder subsequently confirmed **supported activity
types with personal customization of names, amounts and schedules**, not arbitrary
custom activity types. The exact amendments below remain recommendations, not
ratified decisions. The proposed initial schedule profile is weekly by default,
monthly, or an explicit custom date range; monthly/custom periods are an explicit
review recommendation beyond the inherited weekly minimum, not a previously
accepted owner fact.
No application, schema, owner contract, ADR, OpenSpec, live setting, external
service or ticket was changed. No runtime, database, browser or usability proof
was performed for this note.

## Findings that change the synthesis

1. **There is an inherited target owner.** The retained P28 owner contract says
   the **Support-Raising Goal Version** owns weekly targets and their denominators,
   as well as fundraising/coaching goals and MPD dates. Do not invent a competing
   target authority. Its exact activity-target shape, command, participant scope,
   activity calendar and current-period editing contract are still unqualified.
   A bounded optional activity-target section/arm of that owner is the smallest
   proposed reconciliation; it does not require a new general goal engine.
2. **Organization configurability is inherited, compulsory participation is
   forbidden.** Useful organization presets and independently chosen personal
   plans can coexist. A preset is not an enrollment, permission grant or mandated
   quota. The specific inheritance/override model from D16 concerns fundraising
   goals; it does not automatically govern personal activity plans.
3. **The P9 CRM event taxonomy is not the activity-target catalog.** It includes
   record updates, note additions and relationship changes. Counting those rows,
   generic completed tasks or timeline entries would manufacture human activity.
   P9 qualified encounters and the communication owners supply actual facts;
   P27 owns the exchange/outreach distinction; P28 supplies target denominators
   and permitted comparisons.
4. **A logger is not necessarily a participant.** An assistant can record a
   missionary's meeting; several people can describe the same encounter. Target
   attribution must use qualified actual participation/purpose and immutable
   encounter identity, not note author, current task assignee, a role label,
   ministry membership or a selected participant alone.
5. **The activity calendar is not fully specified by prior owners.** The roadmap
   requires optional weekly targets but does not select week start or timezone.
   The proposed weekly/monthly/custom-date profile deliberately extends that
   minimum. Financial calendars and D16 financial-goal intervals cannot be borrowed
   silently. Source facts retain actual precision; source corrections can change
   an earlier period's progress. A newly chosen target compares the whole selected
   period's currently eligible recorded activity, including earlier-in-period facts.
6. **No coaching data right follows.** D8 is read-only and exact-module/history
   qualified. A target selection neither shares its value nor authorizes an
   activity count, source link, identity or history for a coach. D9/D10 support
   summaries do not supply activity-summary disclosure authority.

## Inspected evidence and authority classification

All references are repository paths, with line numbers from the inspected working
tree. Accepted owner intent and research ratification are not runtime evidence.

| ID  | Inspected source and exact section                                                                                                                                                                                                        | Fact and limit                                                                                                                                                                                                                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O01 | `docs/prds/program-roadmap/owner-constraints.md:118–139`, P28 coaching and Goal setting                                                                                                                                                   | Organization-configurable targets; P28 Support-Raising Goal Version owns weekly target denominators. The old illustrative coaching metrics and “initials + amounts” language do not override D8/D9 privacy and exact-module qualification. No target command or week-calendar contract is specified here. |
| O02 | `docs/prds/sitestacker-parity/roadmap.md:4171–4199,4215–4219`, P28 goals, ownership, UX and open decisions                                                                                                                                | Optional weekly targets; P9 interaction/task owners, P27 meaning, exact activity metrics expressly open. Native usefulness does not wait for a workflow or analytics product.                                                                                                                             |
| O03 | `docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:121–125,145–153,225–233`                                                                                                                                         | Task/dialer/mail launch does not prove a call/message; targets/check-ins separately chosen; no compulsory reporting or missing-log penalty.                                                                                                                                                               |
| O04 | `docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:629–640,798–815`                                                                                                                                              | One composed timeline; seeded operational `crm_activity_events`; pointer-grade task links. None is an authoritative human-activity counter or actual-encounter foreign key merely by label.                                                                                                               |
| O05 | `docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:906–930`                                                                                                                                                      | Tenant isolation; private/general notes excluded from missionary projection; only qualified D26 newly authored interaction exception; no assignment/history inference.                                                                                                                                    |
| O06 | `docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:1272–1340`                                                                                                                                                    | Canonical Ministry Project and Ministry Assignment differ from login, Party, page and finance subjects. Assignment has zero-to-many participants; membership and project leadership grant no workspace authority.                                                                                         |
| O07 | `docs/prds/sitestacker-parity/phase-27-donor-development/context.md:5–25,29–76` — ownership, REQ27-C01–C05                                                                                                                                | P9 encounter source/identity; P27 meaning; voluntary participation; exact audience/history; immutable ordinary origin/author; current source commands and atomic accepted update/audit/outcome.                                                                                                           |
| O08 | `docs/prds/sitestacker-parity/phase-27-donor-development/context.md:93–121,132–166` — REQ27-C07–C12                                                                                                                                       | Actual occurrence precision, correction and source retention; qualified personal exchange distinct from outreach; one occurrence across narratives; source/body-free evidence distinct; exact scope for counts/links/caches.                                                                              |
| O09 | `docs/prds/sitestacker-parity/phase-27-donor-development/partnerships.md:2365–2431` — REQ27-P33 / AC01–AC14                                                                                                                               | Sent outreach alone is not exchange. Attempts, no-shows and task completion do not manufacture exchange. One record/source identity; truthful dates, voluntary logging and real independently owned obligations.                                                                                          |
| O10 | `docs/features/missionary-workspace-depth/grill/phase28-d8-adversarial-review.md:480–520` — D8-C08–C12, ratified research amendments                                                                                                      | Exact module/history scope; coaches cannot edit goals/check-ins/tasks; optional targets; missing is not zero/failure/effort score; derived data and inference require qualification.                                                                                                                      |
| O11 | `docs/features/missionary-workspace-depth/grill/phase28-d16-goal-management-adversarial-review.md:20–45,236–264`, ratified research amendments                                                                                            | Exact decision is fundraising-goal management. Tenant default/subject override governs that bounded goal scope; no forced activity/coaching and no automatic public/finance changes. Shared source ownership does not make every Goal Version field writable by the same capability.                      |
| O12 | `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1538–1556,1597–1619`                                                                                                                                         | One resolver; capabilities, not role names; active tenant/acting context; exact P9 create/read/correct/restrict/history; entity permission does not override fields. Routine eligible writes are not projection-policy approvals.                                                                         |
| O13 | `docs/adr/0209-static-field-policies-and-subtract-only-projection.md:16–36` and `docs/adr/0211-distinct-human-approval-for-projection-widening.md:16–37`                                                                                  | Classified field policy plus subtract-only source/row floors; no dynamic field-policy engine; distinct-human approval for actual policy widening, not each ordinary target edit. Accepted intent, not deployed qualification.                                                                             |
| O14 | `openspec/specs/identity-and-access/spec.md:14–95` and `openspec/specs/crm-core/spec.md:106–112,185–204`                                                                                                                                  | Validated server identity/tenant and layered enforcement; native Asym CRM authority; care excluded. Current fixed role vocabulary is not permission to infer coach or target rights.                                                                                                                      |
| O15 | `openspec/changes/add-donor-development/specs/crm-core/spec.md:21–35`, `openspec/changes/add-donor-development/specs/identity-and-access/spec.md:5–7`, `openspec/changes/add-donor-development/specs/donor-development/spec.md:7041–7111` | Active P27 owner amendments preserve one qualified interaction source, exact current permissions and exchange/outreach/correction semantics. Active change is intended work, not proof that the source is implemented.                                                                                    |
| O16 | `docs/adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622–643`                                                                                                                                                           | Independent follow-up Done records the human deliverable, not a source communication/encounter. Shared task/source identities remain owners; no target-originated task or automation engine is required.                                                                                                  |
| O17 | `docs/features/missionary-workspace-depth/grill/phase28-d15-connected-email-adversarial-review.md:259–267,280–289`, ratified research amendments                                                                                          | Provider acceptance is separate from delivery/read/reply; one qualified body-free outreach fact, with private content custody separate. A target cannot copy bodies or turn uncertain provider effects into a definite sent count.                                                                        |

## Smallest coherent customization proposal

This is a proposed product profile for the root review, **not a claim that the
founder has selected every setting**. The founder has confirmed supported activity
types with personal names, quantities and schedules; arbitrary custom activity
types are excluded. The finite period choices below are the root's proposed review
amendment. Neither customization nor period selection alters source truth or
disclosure floors.

- **Organization:** authorized target-configuration managers can offer reviewed
  target presets over supported source meanings, with useful names/descriptions
  and suggested quantities. Presets cannot enroll people, require logging, set
  performance rankings or add recipient/history rights. Do not import D16's
  tenant-default/subject-override hierarchy merely because it exists elsewhere.
- **Missionary:** deliberately choose whether to use a target, which supported
  measures to include, personal target names, quantities, and a clearly shown
  supported schedule; change or stop the personal plan. No chosen target is the default
  participation state. Organization suggestions remain editable personal choices
  within the qualified supported feature; an organization setting cannot make
  the history lane compulsory.
- **Meaning:** personal target names, ordering and presentation are customizable
  without redefining supported source predicates. Keep the canonical measure and
  unit visible beside a personal name. An arbitrary name cannot certify a
  conversation, financial fact, consent or source occurrence. No custom activity
  type or formula/score builder is selected.
- **Calendar:** propose a bounded choice of weekly (default), calendar monthly,
  or explicit custom dates. This extends the inherited weekly minimum as a review
  amendment. Show exact period dates and timezone, plus week start where relevant;
  a convenient initial suggestion requires a visible accepted value, not hidden
  financial-calendar inheritance. Travel changes presentation, not an established
  period's geometry. Custom dates do not imply an arbitrary recurrence language.
  The whole selected current period is compared, including eligible recordings
  before target creation; selecting the target is not an activity admission clock.
  Current source/history authority still applies, and no retroactive task follows.
- **Current editing:** permit an authorized current-period quantity edit with clear
  effective-period wording and retained target revision. Preserve prior-period
  target denominators. Calendar/measure-meaning changes apply prospectively once
  a period is established, except an explicitly qualified correction. Corrected
  source facts can still revise historical recorded progress; history is not a
  frozen achievement ledger. Exact future-repeat/start/stop behavior must be
  part of the bounded target-owner contract, not hidden reminder automation.
- **Scope:** personal target owner, exact tenant, actual participants and source
  ministry-purpose scope are distinct. A personal plan is not a ministry/team
  quota. A display filter cannot silently change a target's denominator, and
  membership changes cannot transfer a departed person's target or credit.

The strongest simpler alternative is supported weekly measures with editable
names/quantities and a fixed calendar. It requires less configuration but does not
fully satisfy the founder's now-confirmed schedule customization. Organization
presets should remain a small configuration capability rather than a second
administration product. A full arbitrary activity/formula designer adds materially
different taxonomy, migration, classification and support work; the founder has
selected the supported-types path instead.

## Concern register — eight dimensions each

Likelihoods are qualitative engineering judgments, not observed ministry rates.
Each exact clause below is a proposed required amendment; `P#` references the
future proof obligations after the register.

### R01 — Optional planning becomes enforced missionary reporting

1. **What:** Organization presets or missing records become required quotas,
   rankings, warnings, task creation or loss of ordinary use.
2. **Why it matters:** This defeats the explicit voluntary source boundary and
   judges people from incomplete records, even if the UI calls the result progress.
3. **Severity:** High.
4. **Likelihood:** Plausible when importing common coaching dashboard patterns.
5. **Evidence:** O01–O03; O07 REQ27-C01; O09:2377; O10 D8-C11.
6. **Answer impact:** A remains valid; customization must not configure coercion.
7. **Permanent fix:** Optional deliberate target participation independent of
   logging, coach sharing and source-owned obligations. Proof P01/P12.
8. **Exact clause C01:** “Organization target configuration SHALL offer optional
   planning choices, not enroll a missionary, compel reporting, create quotas or
   rankings, infer effort or add source work. Declining, stopping or not recording
   activity SHALL preserve ordinary authorized use and independently owned work.
   Counts describe qualified recorded evidence, not all actual effort or activity.”

### R02 — A second target owner or unsafe reuse of financial-goal rights

1. **What:** A new activity-goal service competes with the inherited P28 Goal
   Version, or D16 financial editing grants silently permit personal target edits.
2. **Why it matters:** Denominators drift across surfaces, public/finance adoption
   can gain unrelated fields, and subject-wide staff rights become personal-plan rights.
3. **Severity:** High.
4. **Likelihood:** Plausible because the shared owner names several goal families.
5. **Evidence:** O01:128–139; O11:22–45,236–264; O12 exact capabilities/fields.
6. **Answer impact:** Requires explicit bounded owner reconciliation; no new founder
   decision is needed to invent another source of truth.
7. **Permanent fix:** Reuse the existing P28 Goal Version owner with a qualified
   activity-target profile and separate exact writable fields/actions. Proof P02/P03.
8. **Exact clause C02:** “P28's Support-Raising Goal Version owner SHALL own the
   optional activity-target denominator and attributed revisions through a bounded
   target profile. Financial-goal delegation, approved finance plans and public-page
   adoption SHALL neither create nor modify a person's activity plan by implication.
   Source, field and action authority SHALL distinguish these purposes without a
   duplicate goal or activity authority.”

### R03 — Custom labels or generic activity rows manufacture source meaning

1. **What:** `note_added`, task Done, a custom “meeting” type or a pasted label
   increases a conversation count without the underlying source-qualified event.
2. **Why it matters:** A configurable taxonomy becomes a hidden fact/permission
   engine; source semantics differ between people and dashboards.
3. **Severity:** High.
4. **Likelihood:** Likely if the broad CRM timeline is used as the measure source.
5. **Evidence:** O04 operational taxonomy; O08 C10; O09 P33; O16 task Done.
6. **Answer impact:** Does not reject A. Supported types are explicitly chosen;
   personal names cannot redefine canonical evidence or hide the measure's meaning.
7. **Permanent fix:** Explicit code-owned measure/source contracts with honest
   unit, method, eligible outcome, occurrence and identity; configuration only
   exercises admitted semantics. Proof P04/P05.
8. **Exact clause C03:** “Each offered measure SHALL identify its source-owned
   unit and exact eligible outcomes. Labels, preset selection, generic activity
   rows, task completion, dialer/mail launch and calendar status SHALL NOT establish
   an outreach or exchange fact. Personal target names SHALL retain a visible
   canonical measure/unit; no arbitrary expression or custom activity type SHALL
   become an authoritative count.”

### R04 — Logger, participant, subject and occurrence are confused

1. **What:** Staff who entered a meeting receive the count, a selected missionary
   receives unproved credit, or narratives/recipients/links multiply one encounter.
2. **Why it matters:** False attribution and duplicate counts persist even with
   accurate totals at the timeline-row level; project/household totals can overcount.
3. **Severity:** High.
4. **Likelihood:** Likely if `actor_profile_id`, current assignee or link count is used.
5. **Evidence:** O06 canonical multi-participant subjects; O07:56; O08:160; O09:2371.
6. **Answer impact:** Changes source qualification and display, not the A choice.
7. **Permanent fix:** Keep target owner, actual actor/participant, recorder and
   source subject distinct; count canonical occurrences per measure. Proof P05/P06.
8. **Exact clause C04:** “A personal target SHALL identify its human owner and
   validated Tenant separately from record author, task assignee and ministry
   subject. Qualified actual participation and purpose SHALL determine attributable
   activity; selection, affiliation or current membership alone SHALL not. One
   encounter SHALL remain one occurrence despite narratives, links, recipients,
   retries, imports or corrections. An answered call may contribute to both a call
   measure and an exchange measure, but overlapping measures SHALL not be added
   into a fabricated total activity or effort score.”

### R05 — Aggregates disclose protected source facts

1. **What:** A target count, difference, trend, filter result or drill-down reveals
   private prospect history, sensitive care or a hidden earlier relationship.
2. **Why it matters:** A body-free count is still data; target ownership and raw
   body readability are neither sufficient nor necessary for a separately qualified
   summary purpose. A generic privileged aggregate can bypass the actual source floor.
3. **Severity:** Critical.
4. **Likelihood:** Plausible with service-role aggregation or cached progress.
5. **Evidence:** O05; O07:43; O08:108,160; O10 C12; O12; O13 ADR0209.
6. **Answer impact:** Requires exact source/summary admission; no automatic coach or
   organization disclosure can be included as a convenience.
7. **Permanent fix:** Source-qualified fact admission before the defined aggregation,
   current result authority, classified derived fields and safe completeness states.
   A separate approved body-free projection can operate without message bodies;
   it cannot be invented from the target itself. Proof P07/P08.
8. **Exact clause C05:** “Target progress SHALL derive only from facts admitted for
   its exact Tenant, human/subject, purpose, measure and period, and SHALL recheck
   current release authority. Target values, totals, dates, trends, comparisons,
   filters, source links, caches and recovered results retain the applicable source
   and field floors. A separately qualified body-free fact may be consumed without
   its body; choosing a target creates no such projection or historical right.
   Hidden or unavailable evidence SHALL not be exposed through explanations or
   recast as zero activity.”

### R06 — Configuration, coaching or membership grants unselected write rights

1. **What:** A coach edits targets, an organization preset manager edits personal
   plans, or a membership/role label grants read/write authority across contexts.
2. **Why it matters:** A complete-looking dashboard quietly exceeds D8 read-only
   scope and P12 capabilities; separate hats or tenants can bleed into one another.
3. **Severity:** Critical.
4. **Likelihood:** Plausible if authorization is implemented from page visibility.
5. **Evidence:** O06:1290–1315; O10 C08/C09; O12; O13; O14/O15.
6. **Answer impact:** A confers neither target delegation nor a coaching module.
7. **Permanent fix:** Existing P12 resolver with separately qualified organization
   preset management, own-plan mutation and source/derived reading. No new ACL engine
   or routine second approver. Proof P03/P07/P09.
8. **Exact clause C06:** “Current source-qualified capabilities SHALL separately
   govern organization target configuration, personal target mutation and reads.
   An organization preset, staff title, coach role, participant membership or D16
   fundraising-goal permission SHALL grant none of the others by implication.
   Coaching remains read-only; target adoption selects no new coaching module or
   history. Routine permitted edits require no new approval; actual projection-policy
   widening retains ADR0211's distinct-human approval.”

### R07 — Period progress depends on entry time or the current device timezone

1. **What:** Backdated activity appears this week, travel changes completed periods,
   or unknown/date-only facts are assigned invented instants.
2. **Why it matters:** Counts and comparisons change without actual activity and
   misleading low/zero states can be presented as poor follow-through.
3. **Severity:** High.
4. **Likelihood:** Likely without an explicit activity-calendar contract.
5. **Evidence:** O02 weekly scope; O08 C07/C11; O09:2373. No inspected source chooses
   activity week start/timezone or the proposed monthly/custom-date profile;
   financial calendars are different purposes.
6. **Answer impact:** Requires an explicit review amendment for the proposed finite
   schedule choices, not a claim that monthly/custom periods were already governed.
7. **Permanent fix:** Stable, visible period geometry and source occurrence precision,
   with honest exclusion/uncertainty for unplaceable facts. Proof P10/P11.
8. **Exact clause C07:** “The bounded target schedule SHALL offer weekly by default,
   calendar monthly and an explicit custom date range. Each established period
   SHALL retain its explicit timezone, week start where applicable and exact
   boundaries independently of viewer travel or later preference changes. Compare
   the whole selected period's currently qualified recorded activity, including
   earlier-in-period facts; target creation SHALL not fabricate a narrower activity
   clock or retroactive task. Bucket facts by actual occurrence precision, never
   created-at, save time, epoch or calendar booking. Preserve date-only and undated
   evidence honestly. Unknown evidence cannot certify zero or complete activity.
   Calendar changes SHALL not silently rebucket established periods.”

### R08 — Edits rewrite denominators or stale commands undo newer choices

1. **What:** Updating a preset silently rewrites everyone's past targets, a current
   target edit is invisible, or a lost-response retry replaces a newer plan.
2. **Why it matters:** Progress becomes irreproducible and users cannot understand
   whether the activity or target changed; mutable meanings corrupt history.
3. **Severity:** High.
4. **Likelihood:** Plausible under ordinary editing and mobile network failures.
5. **Evidence:** O01 Goal Version; O07 C04/C05; O11 exact version/authority precedent.
6. **Answer impact:** Requires bounded temporal semantics, not a new target engine.
7. **Permanent fix:** Versioned owner edits and exact expected-revision acceptance;
   deliberate preset adoption; clearly scoped current-period change; correction
   remains possible under source authority. Proof P09/P11.
8. **Exact clause C08:** “The P28 owner SHALL retain attributable target revisions
   and exact effective periods. A permitted current-period quantity edit SHALL show
   its effect on that period's comparison without rewriting earlier denominators.
   Organization preset edits SHALL not silently change already adopted plans.
   Accepted source corrections may revise earlier actual progress. Commands SHALL
   reprove current authority and expected revision, recover an accepted retry once,
   and reject changed or stale intent without retargeting another person or period.”

### R09 — Stopping a target destroys facts or cancels independently accepted work

1. **What:** Disabling a measure hides existing tasks, removes logs, clears source
   obligations, or re-enabling restarts work and historical achievements.
2. **Why it matters:** Optional planning becomes control over unrelated source truth
   and real follow-through; retained history is confused with active participation.
3. **Severity:** High.
4. **Likelihood:** Plausible if targets and task status share one shortcut flag.
5. **Evidence:** O07 C01/C07; O09:2377; O16; D19/D20 retain independent task meaning.
6. **Answer impact:** Changes lifecycle requirements, not the selected targets.
7. **Permanent fix:** Stop target participation/comparison through its owner while
   preserving independently lawful source history and obligations. Proof P12.
8. **Exact clause C09:** “Stopping or replacing an optional target SHALL change
   only its own planning lifecycle. It SHALL not delete, redate, duplicate or revoke
   source activity, cancel accepted follow-up, change consent or reopen ended work.
   Re-enabling a plan creates no invented historical participation or activity.
   Retained history remains subject to current source, privacy and retention rules;
   it is neither indefinite public history nor a new source of access.”

### R10 — A message attempt or delivery event becomes an asserted human exchange

1. **What:** Queued/unknown sending counts as definite sent outreach, provider
   retries create multiple messages, or a read/open signal counts as conversation.
2. **Why it matters:** Target pressure can encourage unsafe retries and false
   contact claims; D15's no-replay uncertainty and P27 exchange semantics are lost.
3. **Severity:** High.
4. **Likelihood:** Plausible if transport statuses are mapped by broad success flags.
5. **Evidence:** O03:125; O08 C10; O09 AC01/02/03; O17 D15 C11/C13.
6. **Answer impact:** Measures need exact source outcomes; it does not require
   connected email, mailbox ingestion or transcripts to make manual logging useful.
7. **Permanent fix:** Source-owned manual evidence or qualified communication
   outcomes; one outreach fact; separate delivery/read/reply and unknown states.
   Proof P04/P05/P13.
8. **Exact clause C10:** “Each outreach measure SHALL state which source outcome
   proves its unit. A qualified manual record remains valid without provider or
   transcript proof. Local queue acceptance or uncertain provider outcome SHALL
   not be presented as definitely sent; provider acceptance SHALL not mean delivery,
   reading or reply. A relevant source-qualified human response may qualify as an
   exchange without a prior outbound, positive sentiment or minimum text length.
   Measure computation SHALL never retry or send communication to repair a count.”

### R11 — Customization becomes a second policy, analytics or workflow product

1. **What:** Target settings introduce nested inheritance, arbitrary formulas,
   custom authorization, generic event types, reminders or team scorecards.
2. **Why it matters:** Complexity and support burden grow without satisfying a
   proven personal-planning need, while source semantics become harder to explain.
3. **Severity:** Medium for unnecessary scope; High where it obscures truth/access.
4. **Likelihood:** Plausible given the broad customization language.
5. **Evidence:** O01 organization configurability; O02 weekly/native scope; O03
   adaptable methods; O13 no field-policy rule engine; founder's supported-types
   clarification.
6. **Answer impact:** Substantive names/amounts/schedule flexibility must be delivered;
   arbitrary types and formula/workflow builders are not selected.
7. **Permanent fix:** A small target owner profile with presets, explicit personal
   choices and fixed source semantics. Validate actual user comprehension rather
   than adding abstract configuration layers. Proof P01/P14.
8. **Exact clause C11:** “D23 SHALL implement the selected customization scope
   through the existing target owner with clear choices of supported measure,
   personal target name, quantity and qualified finite schedule, plus organization
   presets where admitted. A preset is a suggestion, not live compulsory
   inheritance. No arbitrary custom activity type, formula, workflow, access-control,
   team-performance or automatic coaching system follows from target customization.”

### R12 — Intended ownership or a synthetic check is called a functioning feature

1. **What:** An active OpenSpec source contract, static mapper or finite model is
   treated as proof of correct target counts, permissions and usable customization.
2. **Why it matters:** The currently unspecified target command and event mappings
   can remain missing while a dashboard displays convincing but unsupported numbers.
3. **Severity:** High.
4. **Likelihood:** Plausible without explicit evidence classification.
5. **Evidence:** O01/O02 conceptual target scope; P9 header:3–6 says qualification
   remains unproved; P27 context:3; O15 active change status.
6. **Answer impact:** A is direction; release requires exact owner and actual-path proof.
7. **Permanent fix:** Trace clauses through owner formalization to actual source,
   authorization, correction, temporal and UI evidence. No new probe merely to add
   a passing number; existing finite probes prove only their admitted mechanisms.
   Proof P02–P15.
8. **Exact clause C12:** “Before activation, every offered measure and target
   control SHALL map to its qualified owner command/source, current projection,
   period and correction behavior, with positive and negative proof through actual
   supported paths. Missing source or participant evidence SHALL leave that measure
   unavailable without substituting a timeline count. Research, active contracts,
   unit models and runtime qualification SHALL remain explicitly distinct.”

## Required proof, not claimed completed tests

| ID  | Falsifiable future proof                                                                                                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P01 | Missionary declines every target and still logs/views permitted history and uses ordinary work; an organization preset cannot impose logging or enroll coaching. Independently choosing only conversations, only outreach or both works without unused mandatory fields.                                                                                                                         |
| P02 | One P28 target-owner revision supplies the same denominator wherever legitimately shown; no copied target source, automatic finance-plan synchronization or public-page update. Formal owner trace preserves O01.                                                                                                                                                                                |
| P03 | Organization-preset manager, personal target owner, coach hat, fundraising-goal editor and project participant exercise only their exact admitted powers. Test a multi-hat human and second tenant; no role-name fallback.                                                                                                                                                                       |
| P04 | Five actual qualified calls, two answered: call measure five, conversation measure two, no combined seven-activity score. No-shows, voicemail, task Done, notes, dialer launch, generic CRM edits, newsletter delivery/open and automatic receipts do not become actual exchange.                                                                                                                |
| P05 | Duplicate narratives, repeated import/save, provider retry, source merge and an authorized correction preserve canonical occurrence counting. A manual/provider reference to the same known source occurrence does not create a second fact. Unknown identity is not title/time fuzzy matching.                                                                                                  |
| P06 | Assistant records missionary meeting; logger gets no invented personal participation. Two actual participants retain source-qualified attribution; team/portfolio totals are not sums of overlapping personal counts. Selected participant alone is insufficient.                                                                                                                                |
| P07 | Source-private, restricted-prospect, care and other-ministry facts fail disclosure through counts, labels, links, date filters, differences, cached progress and recovered results. Qualified body-free fact works without copying its protected body.                                                                                                                                           |
| P08 | Revoke/narrow before result release, history permission change and restore cannot serve stale protected aggregates. No misleading empty/zero state or hidden-record existence explanation. Newly added access does not imply ungranted history or coaching disclosure.                                                                                                                           |
| P09 | Current target edit versus permission loss, concurrent editor, preset update and lost response accepts only the qualified revision once; no stale override, wrong-person save, changed-payload retry or duplicate plan.                                                                                                                                                                          |
| P10 | Weekly/monthly/custom boundaries, month ends, leap days, DST, travel, date-only occurrence, unknown occurrence and backdated entry retain truthful placement; no created-at fallback or inferred midnight. Established period geometry remains stable when viewer settings change. Choosing a target mid-period includes otherwise qualified earlier-in-period facts without a retroactive task. |
| P11 | Current-period quantity edit visibly changes the current denominator; earlier denominators remain interpretable. Later source correction can legitimately raise/lower earlier recorded progress; preset/calendar changes do not silently rewrite old periods.                                                                                                                                    |
| P12 | Stop/restart/retire target leaves actual history, D19/D20 task coverage, accepted calls/promises, P27 next-action obligations, consent and source pause/closure unchanged. No automatic catch-up task, fake completion or reopened work.                                                                                                                                                         |
| P13 | Definitive manual/source outreach, provider acceptance, unknown send, actual reply and duplicate provider evidence each produce the exact admitted measure outcome without body retention, unsafe retry or invented exchange.                                                                                                                                                                    |
| P14 | Representative missionaries and authorized organization managers can explain target meaning, overlap, chosen week, setting changes and missing records on mobile/keyboard/screen reader. They recognize that counts are recorded evidence and are not compelled or shared automatically. Unsafe misunderstanding blocks expansion.                                                               |
| P15 | Measure complete qualified source records beyond the first display page using current-authority indexed reads; establish actual workload/payload/concurrency/latency/recovery budgets before activation. Rebuild/correction and source outage give truthful pending/unavailable states, not stale success or a new writable counter authority.                                                   |

No specific numerical workload, latency, retention duration or target quantity is
inherited from these sources. Existing financial privacy thresholds, calendar
source limits and unrelated probe counts are not activity-target qualification.

## Minimal formal amendment destinations and release order

These are future destinations for `/to-prd`, not edits made by this note.

1. **P28 target owner:** carry the selected measure/customization scope, C01–C12,
   target profile, actor/subject distinction and exact period/version semantics
   into the P28 package. Reconcile the retained **Goal Version / weekly targets**
   wording in `docs/prds/program-roadmap/owner-constraints.md:128–139`, rather than
   discarding it. Preserve roadmap optionality and organization configurability.
2. **P9/P27 source:** qualify the actual encounter/outreach contracts, typed source
   identity, real participant attribution and corrections under
   `docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md` and
   P27 `context.md` / `partnerships.md` REQ27-P33. A source adapter does not make
   operational `crm_activity_events` into the encounter table by name.
3. **P6/P17/D15:** map only qualified communication outcomes into their existing
   one-outreach-fact source; retain uncertainty/no-replay and body-free custody.
   There is no new provider, mailbox ingestion or transport dependency for targets.
4. **P3/P10/P12:** classify target and aggregate fields, qualify exact personal
   target/preset actions and current source/summary projections. Do not weaken
   D8 read-only grants, D16 fundraising boundaries or ADR0209/0211. Any future
   coaching activity module needs its own selected/qualified scope; D23 adds none.
5. **OpenSpec:** reconcile through the actual owning sources under the document
   authority rules, including the P27 active `crm-core`, `identity-and-access`
   and `donor-development` deltas and an authorized P28 change when created.
   Do not edit generated views as a competing decision or call active intent shipped.
6. **Activation:** formalize the confirmed supported-types scope and the reviewed
   bounded target profile/mappings, exercise actual source/permission/time/
   correction paths and representative UX, and admit only measured supported
   workload. A dependent unsupported measure remains unavailable; it need not
   block independent useful manual source recording or other qualified measures.

**Synthesis:** Accept A with the necessary owner, meaning, authority and temporal
amendments. Substantial customization is compatible with a small product when
people choose their planning values and the source owns what the activity means.
The supported-types clarification is confirmed, while the precise finite schedule,
preset, authority and lifecycle mechanics remain review recommendations requiring
explicit ratification and later proof. None is claimed to be implemented.
