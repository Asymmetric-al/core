# D10 — deliberately shared earlier support-summary periods

**Disposition: Accept with required amendments.** Let missionaries include
eligible earlier support-summary periods. Keep the journey inside the existing
coaching-sharing screen, with explicit dates and one Save. Capture the chosen
historical scope; do not turn a date control into automatic widening or a second
financial-reporting system.

Reviewed October 16, 2026 UTC against baseline
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. The founder selected **A — Allow selected
earlier periods**, requiring excellent simple UX and secure Supabase behavior.
D8/D9 and their amendments are ratified. Following this completed review, the
founder explicitly ratified the corrected D10 decision and required amendments
on October 16, 2026 UTC, including C01–C20 and P01–P28. This is ratified product
and design direction, not implementation, source/runtime qualification, a formal
owner-spec edit, a historical grant, or a live-system operation.

## Exact corrected decision to record

> **D10 — Optional, explicitly bounded support-summary history.** A missionary
> may deliberately add eligible earlier financial reporting periods to a specific
> coaching share, within the organization's current permissions and the source's
> qualified disclosure limits. The sharing review SHALL show the exact dates,
> subject and summary information the coach will be permitted to see.
>
> Capture the selected earlier periods as a finite explicit historical scope.
> Those dates remain fixed until an authorized deliberate change. A new month,
> old record import, policy expansion, re-invitation or cache rebuild SHALL NOT
> automatically add periods. Any independently granted current-period behavior
> remains separate; a current period does not automatically become shared history
> when it ends. A rolling or accumulating history grant is not inferred.
>
> Fixed dates do not freeze financial values. Received history uses D9's current
> effective designated gifts in their authoritative source gift-date periods,
> including qualified corrections, with the source evaluation clearly identified.
> Historical planned support uses qualified historical expectation facts and their
> applicable versions, never today's commitments projected backward. This view
> does not claim to reproduce what was known or displayed at a past instant.
>
> Earlier data remains subject to current tenant, entity, subject, module, history,
> field and privacy restrictions. The coach receives only admitted summaries,
> without raw donor/gift/commitment access. Missing, incomplete or withheld periods
> SHALL NOT become zero, and charts or comparisons SHALL NOT reconstruct protected
> values. A source correction or import cannot bypass the captured dates by using
> its new creation, import or processing timestamp.
>
> Provide one understandable earlier-period selection, an inline review and one
> Save in the existing sharing flow. Show only currently permitted choices. Let
> missionaries clearly change or remove this historical sharing; preserve other
> independent coaching access. The coach receives a readable period-by-period
> presentation with clear currency, meaning, freshness and unavailable states.
>
> This grants no earlier private notes, former coaching conversations, activity
> history, donor detail, historical goal versions, balances, exports, notifications
> or financial writes. No universal lookback count, access duration, default
> inclusion, automated historical expansion or new dependency is selected.

**Selected:** optional deliberate earlier-period eligibility and exact-date
review, with a clean useful UI. **Ratified design direction:** fixed reviewed
historical scope, current corrected financial truth, and a bounded native journey.
The subsequent ratification accepts these amendments. It selects no rolling
window, particular month count or access expiry.
The source profile must supply explicit finite allowed periods before activation;
missing configuration cannot mean unrestricted history.

## Evidence and decision pressure test

| Evidence                                                                                                                                 | Finding and proof limit                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Financial history](d10-evidence/financial-history.md)                                                                                   | P7/P13 current effective gift-date history and P16 historical terms/occurrences differ from an as-known-then snapshot. Existing primitives do not prove a complete coach-history producer.                    |
| [Owner and privacy boundaries](d10-evidence/owner-privacy.md)                                                                            | Current P3/P10/P12 rules, explicit historical scope, summary-only purpose, finite outputs, non-revival and source-state versus grant-state distinctions.                                                      |
| [Current runtime](d10-evidence/current-runtime.md)                                                                                       | Current controls, endpoints, date math and retained state are inspected/exercised at named seams. Current missionary analytics is not a qualified coach-history projection.                                   |
| [UX journeys](d10-evidence/ux-journeys.md)                                                                                               | Concrete sharing, reading, extension, reduction and recovery design, existing Core components and primary accessibility evidence. No real-user or browser conformance test is claimed.                        |
| [Benchmarks](d10-evidence/benchmarks.md)                                                                                                 | Primary reporting, nonprofit/CRM, date-control and accessibility evidence; fixed versus rolling ranges and snapshot versus current reports are distinguished. Vendor settings are not Core permission policy. |
| [Database/lifecycle](d10-evidence/database-lifecycle.md)                                                                                 | Primary PostgreSQL/Supabase guidance and a focused disposable history-scope probe. Synthetic mechanics do not qualify financial source semantics, P12 floors or hosted behavior.                              |
| [Original Q10](phase28-q10-coaching-history-research.md), [D8](phase28-d8-adversarial-review.md), [D9](phase28-d9-adversarial-review.md) | D10 adds eligibility for selected earlier financial periods; inherited role, exact subjects, voluntary coaching and source/privacy boundaries remain intact.                                                  |

**Problem and strongest alternative.** Earlier summaries can help a coach
understand context and changes before financial sharing began. MPDX documents
historical giving in a deliberately shared coaching view. That establishes a
comparable job, not demand from interviewed Asym users or an optimal lookback.
Current-period-only summaries with ordinary discussion are the strongest simpler
alternative: less disclosure and less historical producer work, but weaker native
context. The selected optional history is justified if it provides useful positive
results without exposing raw records or forcing adoption.

**Fixed versus automatically changing dates.** A rolling last-N-periods window
adds and removes periods. A fixed start with an advancing end continually adds
history. Both are standing disclosure choices, not merely convenient controls.
A fixed reviewed interval preserves the founder's selected earlier periods and
has the clearest scope. Deliberate extension adds some friction; keep it a short
edit within the same screen. Do not hide an ongoing grant inside “through last
month.” Financial values may still change under the same fixed date permission.

**External practices and repository conflicts.** CRM reporting controls commonly
change a query, while reporting snapshots preserve a past capture. Neither is
automatically a sharing permission. GOV.UK's check-answers guidance supports
reviewing and correcting consequential choices; it does not require a new wizard
for this small edit. Date-input guidance concerns dates users enter; selecting
from already qualified reporting periods is a different task. Reuse Core's
`base-maia`/Base UI design system rather than importing vendor UI or libraries.
MPDX's thirteen-month report, P16's current-plus-thirteen-month cache and current
Core six/twelve-month selectors establish no coach history limit or entitlement.

Evidence classes remain explicit: repository intent, inspected current code,
bounded executed probes, published external practice, engineering inference and
product judgment. No live Supabase project, real financial dataset, coach account,
new provider, user interview, production load test or accessibility session was
used. The supplied old dashboard specification remains historical direction;
its former stack and dependencies are not adopted.

**Executed verification.** The unchanged React history hook and real selector
helper ran against controlled fixtures in UTC and UTC+14: **6/6 observations**
reproduced existing behavior, including incorrect last-day/timezone grouping,
creation-time attribution, local-only range selection and retained stale state.
Passing these assertions confirms the defects and limits; it does not mean the
current feature meets D10. A separate PostgreSQL 17.11 synthetic probe passed
**23/23 outcomes**, with five observed two-session transaction-lock races and two
intentional unsafe controls. It exercised fixed ranges, source-date corrections,
coverage, stale edits and current-release checks using real nonowner roles.
The disposable container and volume were removed. Exact fixtures, commands,
outputs, role/grant evidence, source hashes and limits are retained in the
[hook probe](d10-evidence/history-probe/README.md) and
[database probe](d10-evidence/postgres-probe/README.md).

Neither probe qualifies the actual P7/P13 fold, P16 historical expectation
producer, P12 privacy/source admission, hosted Supabase, API or complete UI.
Database fixtures model received facts already admitted by a source; they do not
replace the financial or privacy owner. No earlier D8/D9 probe was rerun.

## Historical truth and ownership

| Question                                | Authoritative answer                                                                                                                                            | Consequence                                                                                                                                                                     |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which dates may Jordan see?             | The current D8/P28 sharing source and P12 authorization bind the exact historical scope for the tenant, entity, subject and module/profile.                     | A browser selector, invitation date or remembered permission cannot enlarge it.                                                                                                 |
| Which period owns a received gift?      | D9's P13 effective monetary designation line uses the current authoritative P7 gift-date fact, with its source precision and issuer dating basis.               | Creation/import/refund timestamps do not move an older gift into an allowed period. Source date correction may legitimately move its cohort.                                    |
| Which received amount is shown now?     | Current qualified effective P13 amount through the identified source evaluation, before organization assessments and excluding unrelated allocations/fee cover. | Refunds, returns or redesignations may restate an earlier total. This is not a bank balance, an original statement or proof of money physically arriving on the reporting date. |
| What was planned for an earlier period? | P16's qualified historical expectation/normal-occurrence facts, applicable term/schedule versions and authorized historical corrections.                        | Today's active commitments, current amount, next date or monthly equivalent cannot reconstruct the past. Canceling a commitment now does not erase prior planned occurrences.   |
| What did someone know or see then?      | A separately governed point-in-time record or artifact, if one exists.                                                                                          | D10 offers no audit-time selector, historical snapshot entitlement or new bitemporal storage engine.                                                                            |
| Is an empty period truly zero?          | Its source must establish complete admitted coverage for that metric/period/currency.                                                                           | No rows, a capped list, lost cache or suppressed inputs alone cannot establish zero.                                                                                            |
| How long does access last?              | The existing separately qualified coaching grant/lifecycle.                                                                                                     | Financial period end is not an access-expiry date; D10 selects no duration.                                                                                                     |

A gift newly imported in October with a source gift date in June contributes
only to a qualified June received metric. If June is outside the coach's selected
dates, the import does not make it visible in October. If a qualified correction
moves a gift from an included period to an excluded period, the included total
can change, but the coach gains no view of the new excluded period or correction
detail. Current privacy rules may require withholding the resulting comparison.

Historical planned support needs its own exact source-qualified series. P16
already preserves prospective term versions and schedule epochs and separates
historical evidence correction from live schedule changes. Those are useful
primitives, not permission to generate missing past occurrences during a read.
Canceled, skipped, released, corrected, linked and incompletely migrated plans
must retain the owner's meaning. If only received history is currently qualified,
show the permitted received result with an honest planned-history unavailable
state when its existence is disclosable; do not fabricate planning history or
block unrelated coaching.

## Concrete missionary and coach journeys

Use the existing **Coaching → [coach] → Sharing** surface. Keep current-summary
sharing and earlier-period inclusion visually related, while describing their
different scope. The following dates and monthly cadence are examples only.

```text
Sharing with Jordan Lee                   Community Ministry

Support summaries
[Existing summary-sharing choice and effective scope]

Earlier periods
[✓] Include earlier support summaries

From [July 2026 ▾]    Through September 2026
Jordan can view 1 July–30 September 2026.
These dates stay the same until you change them.
Figures may update when your organization corrects its records.

[Review coaching view]
                                  [Cancel] [Save sharing]
```

This illustrates a permitted range ending at the last completed period captured
for this edit. The upper bound is a literal reviewed date, not an expression
re-evaluated on Save or every page load. A small range-choice control can be used
instead if the source offers named profiles. Prefer a contiguous run of qualified
whole reporting periods; do not require per-day calendars, many checkboxes,
arbitrary query expressions or a custom permission matrix. Preserve previously
saved bounds when reopening the editor. An existing older end must not jump to
the latest month merely because the screen was opened.

If the qualified profile permits an earlier ending period, let Maya change that
bound in the same compact period control. Do not force her to include unwanted
newer periods merely to share an older one; two short period selectors are
preferable to hidden scope or a pair of day-by-day calendars.

The actual tenant/source profile decides which period options can be offered.
Do not expose private earliest-gift dates or hidden record existence to populate
the options. Unknown/unavailable historical eligibility must not appear as an
enabled Save that can never succeed. Show a safe explanation where authorized;
otherwise omit the unsupported option and preserve ordinary coaching.

**Review and Save:** show recipient, organization/subject, exact dates, admitted
measures/currencies, and the existing access terms without adding an expiry
choice. Preview is bounded by both the proposed share and the missionary's own
read authority. A normal edit needs one Save, not a second confirmation modal.
The server re-proves eligibility and the expected sharing/profile version. If
the scope changed, retain safe draft input and ask for a refreshed review;
do not silently trim or extend the selection and announce the original intent
as saved. Ordinary financial corrections do not require repeated consent to the
same still-valid profile; the values and currentness are re-evaluated on read.

**Coach reading:** show **Earlier support summaries — 1 July–30 September 2026**
and **Updated through [source time]**, followed by readable period rows/cards:

| Period         | Support planned                 | Gifts recorded                  |
| -------------- | ------------------------------- | ------------------------------- |
| July 2026      | [qualified amount and currency] | [qualified amount and currency] |
| August 2026    | Not available in this view      | [qualified amount and currency] |
| September 2026 | [qualified amount and currency] | [qualified amount and currency] |

Explain briefly: **Gifts recorded use corrected gift records, before organization
assessments. Planned support is a separate measure.** Source-specific safe
coverage/currentness belongs near the affected value. Use text-first rows/cards;
a chart is optional presentation of the same admitted series. It cannot add
unshared periods, totals, deltas, goal lines or donor detail. Do not join lines
across unknown gaps or use color as the only state explanation. Currency remains
explicit; there is no mixed-currency grand total.

**Changing or extending:** show the saved earlier dates and **Change periods**.
If a newer completed period is eligible, a concise **Include newer periods**
action may prepare the explicit changed range for review and Save. It must not
apply silently, reselect deselected periods or create a notification/reminder.
Narrowing or removing historical sharing is equally discoverable. Preserve
independent current summaries, goals and other valid coaching rights.

**Calendar rollover:** current-period data follows its own approved D9 contract.
The earlier-period selection stays fixed. A newly completed period is not silently
added to the historical table, and an old permitted historical period is not
silently dropped. A gap between shared history and the current period means a
gap in this sharing scope, not zero financial activity. Display the two date
scopes explicitly; use safe neutral copy when the viewer may know the gap.

| State                                               | Truthful experience                                                                                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Complete known zero                                 | Show the currency zero for that exact qualified period and metric.                                                                                      |
| Incomplete or unavailable history                   | Show a source-safe unavailable/partial state; never invent missing monthly values or claim the ministry had no support.                                 |
| Temporary load failure                              | Show retry and preserve navigation/independently permitted modules. Do not erase the saved selection or claim it was revoked.                           |
| Sharing saved                                       | Show the actual effective dates persistently and announce success accessibly.                                                                           |
| Save definitely failed                              | State no change only if the authoritative outcome proves that; keep safe editable intent.                                                               |
| Save response unknown                               | “We couldn't confirm the change” and Check status; no blind replay that restores an old range.                                                          |
| Current access reduced                              | Remove denied values and actions, including retained browser state. Show only safe scope/status explanation.                                            |
| History temporarily withheld, selection still valid | Current source/privacy requalification may restore values within the unchanged valid selection. This is distinct from reviving an ended/narrowed grant. |

On a phone, stack period cards or use a simple accessible table that retains
labels. Keep organization/subject and selected dates visible at 320 CSS pixels
and 400% zoom. Use unambiguous localized dates, long-name wrapping, keyboard
operation, focus recovery and programmatic save/error status. No essential
meaning depends on hover, a tiny calendar or animation. Slow connections must
not require downloading raw historical rows or every coached subject's series.
No donor-facing signup, checkout, address form or public-page step changes.

## Concern register

Likelihood is a conditional engineering judgment, not an observed incident rate.
Severity states potential impact without the safeguard. Each concern includes
what/why, evidence, effect on A, permanent prevention and exact clause/proof links.

### R01 — A display range could silently become a growing permission

- **What/why:** “Last N months,” “from July,” or “through last month” is re-evaluated after Save and exposes periods the missionary never reviewed; rolling windows can also unexpectedly remove history.
- **Severity / likelihood:** High / high if existing analytics filters are reused as grants.
- **Evidence:** Q10 reserves progression; D8/D9 require exact history; primary fixed-versus-rolling reporting distinctions and current local-only selectors.
- **Decision effect:** Narrows A to fixed reviewed earlier periods; no automatic historical progression is inferred.
- **Permanent fix:** Capture a finite canonical period scope; separate selection permission from viewing/filtering and current-period behavior. Deliberate extension uses the same simple editor.
- **Exact amendment:** C01–C03/C12; P01–P04/P20.

### R02 — New timestamps could expose old facts outside the selected dates

- **What/why:** Using created/imported/refunded-at or the viewer's timezone places an old gift inside a newly permitted period, or cuts off valid boundary facts. That defeats both financial meaning and historical access.
- **Severity / likelihood:** High / high; the current pipeline uses creation-time history and has calendar-boundary issues.
- **Evidence:** Ratified D9 gift-date basis; P7 immutable dating revisions; runtime evidence; source precision/timezone contract.
- **Decision effect:** Changes implementation and labeling, preserves earlier-summary eligibility.
- **Permanent fix:** Source-owned period membership, explicit half-open boundaries and calendar identity; apply the admitted period before aggregation. Never reinterpret source civil dates as browser timestamps.
- **Exact amendment:** C03/C04/C15; P05–P07/P22.

### R03 — Current commitments could rewrite the apparent past

- **What/why:** Multiplying today's amount backward or using only currently active commitments erases ended plans and creates expectations that never existed. Later fulfillment/release can also be mistaken for the original plan.
- **Severity / likelihood:** High / high for a reused current metric without a historical contract.
- **Evidence:** P16 B7/O3/O4 preserves source versions and occurrences; D9 distinguishes dated expectation, monthly equivalence and receipt. These primitives need explicit historical composition.
- **Decision effect:** Requires qualified P16 historical planned-series meaning; narrows any fallback.
- **Permanent fix:** Use appropriate historical source facts/versions and current authorized evidence corrections. If unavailable, show that state; do not generate retroactive occurrences or a new plan ledger.
- **Exact amendment:** C05/C06/C15/C16; P08/P09/P24.

### R04 — Fixed dates could be mistaken for frozen amounts or an official historical snapshot

- **What/why:** Saving a numerical snapshot for sharing makes later refunds/imports disagree with canonical truth, while recomputing without explanation can look like unexplained tampering or a past statement being rewritten.
- **Severity / likelihood:** High / medium–high; reporting and snapshot products are commonly conflated.
- **Evidence:** D9 current effective received fold; P7/P13 corrections; primary CRM distinction between current reports, snapshots and adjustment audit.
- **Decision effect:** Clarifies A as corrected historical-period summaries, not as-known-then evidence.
- **Permanent fix:** Freeze permission dates, retain live source-qualified financial truth and explicit source evaluation; keep official artifacts/audit history separately owned.
- **Exact amendment:** C04–C06/C19; P06/P07/P10/P25.

### R05 — History could broaden tenant, subject or raw financial access

- **What/why:** A coach's other role, project membership, former assignment, old URL or service credential could import another subject/entity's past; an invoker view workaround could grant raw financial SELECT.
- **Severity / likelihood:** Critical / medium–high on an unqualified reuse path.
- **Evidence:** P3/P12 active-context and source scope; D8/D9 summary-purpose admission; current broad missionary data path is not a coach producer.
- **Decision effect:** Narrows historical output to the same exact authorized context and summary purpose.
- **Permanent fix:** Current source admission and explicit typed history scope before enumeration/arithmetic; independent output authority without raw donor/gift/commitment rights.
- **Exact amendment:** C01/C03/C07/C09/C11; P02/P11/P12/P21.

### R06 — A series could disclose what each individual period hides

- **What/why:** Adjacent periods, changed ranges, corrections, annual totals, percentages and overlapping subjects can isolate protected gifts or identities. Safe-looking available-period choices can reveal the first or last hidden gift.
- **Severity / likelihood:** High, potentially critical for protected people / medium–high for small or overlapping groups.
- **Evidence:** Existing P12 small-cell floor; D9 combined-output qualification; primary privacy guidance and benchmark inference examples. No general anonymity proof exists here.
- **Decision effect:** Narrows offered series/complements, not the selected product goal.
- **Permanent fix:** Qualify the finite history output and repeated-release combinations using existing floors; suppress unsafe values and complements and use nonrevealing period-option/status metadata.
- **Exact amendment:** C03/C08/C13; P13–P15/P23.

### R07 — Retention or incomplete migration could become false zero history

- **What/why:** A missing month, expired cache, limited query or incomplete import is plotted as zero. Coaches may wrongly infer interrupted support or poor performance, while summed partial history looks complete.
- **Severity / likelihood:** High / high if generic chart zero-fill is reused.
- **Evidence:** P16 cache-retention/rebuild clause; D9 coverage contract; current capped fetch/zero-seeded series; source-history inspection.
- **Decision effect:** Changes coverage and rendering requirements, preserves useful independent periods/measures.
- **Permanent fix:** Per-period/per-metric coverage, source-owned reconstruction from retained authoritative facts where possible, honest unavailable states otherwise. Retention is not a grant or completeness proof.
- **Exact amendment:** C06/C13/C17; P10/P16/P22/P27.

### R08 — A stale edit or retry could restore a range after narrowing

- **What/why:** Preview/apply races, two editors, grant revocation or a lost response can let an older widening overwrite a newer reduction, create duplicate history or falsely report success.
- **Severity / likelihood:** High / medium; ordinary multi-tab/network conditions suffice.
- **Evidence:** D8/D9 CAS/idempotency/current-authority obligations; PostgreSQL transaction mechanics and D10 history-specific race probe.
- **Decision effect:** Adds exact mutation semantics; no additional routine approval step.
- **Permanent fix:** Trusted source command, expected-version/current-policy check, atomic required audit and durable business-effect identity. Recover authoritative outcome before retrying stale intent.
- **Exact amendment:** C09–C12/C19; P17–P20/P25.

### R09 — Stale or secondary representations could outlive the allowed history

- **What/why:** Browser data, previous-series tooltips, caches, exports or delayed responses expose removed periods. Confusing temporary withholding with grant removal either revives revoked rights or permanently loses a valid choice.
- **Severity / likelihood:** High / high without current release checks; retained-state issues are exercised at the current hook seam.
- **Evidence:** D9 shared projection/caching boundaries, ADR0212, runtime probe and current source/grant-revision mechanics.
- **Decision effect:** Changes release/recovery behavior, not the authority to select earlier periods.
- **Permanent fix:** Recheck exact current scope/source/profile before release, discard context-stale data and partition cache identity. Model saved choice, active grant and temporary source availability distinctly.
- **Exact amendment:** C08/C11/C13/C19; P15/P19/P21/P23.

### R10 — A complicated or misleading sharing UI could defeat missionary control

- **What/why:** Dual calendars, excessive dialogs, hidden fixed-versus-rolling behavior, inert controls or optimistic success make it hard to know what is shared. A beautiful chart with unlabeled gaps compounds misunderstanding.
- **Severity / likelihood:** Medium–high / high if generic reporting controls are adopted unchanged.
- **Evidence:** Current Core selectors versus server behavior; primary review/date/accessibility guidance; no measured user-test success claimed.
- **Decision effect:** Requires a concrete small journey and comprehension proof.
- **Permanent fix:** One bounded period choice, explicit dates/consequences inline, one Save, safe preview and persistent outcomes; readable historical rows with optional equivalent chart.
- **Exact amendment:** C12–C14; P04/P20/P22/P26/P28.

### R11 — More history could introduce an unnecessary analytics or temporal platform

- **What/why:** Arbitrary date/cohort builders, a new snapshot ledger, global historical permission engine or provider sync duplicates owners and increases disclosure/repair complexity.
- **Severity / likelihood:** Medium / medium; architectural risk rather than a measured operating failure.
- **Evidence:** Existing P7/P13/P16 temporal facts, P12 grants and ADR0209 single projection boundary; historical reports and snapshots are distinct jobs.
- **Decision effect:** Narrows implementation to qualified source series and one sharing scope extension.
- **Permanent fix:** Reuse existing source versions/registry and native UI. No new bitemporal engine, financial table authority, third-party integration, chart library or notification workflow.
- **Exact amendment:** C05/C07/C16–C18; P09/P24/P27.

### R12 — Historical aggregation could become slow or unbounded

- **What/why:** Whole-ledger scans, all-subject prefetch, per-period N+1 calls or repeatedly rebuilding every past version harms mobile use and makes revocation checks expensive.
- **Severity / likelihood:** Medium / medium; workload and production latency are not yet measured.
- **Evidence:** Current limited fetch/client aggregation is unsuitable as correctness/performance strategy; PostgreSQL scoped range/index mechanisms; source metric registry.
- **Decision effect:** Requires finite supported profiles and workload proof, not arbitrary fixed business limits.
- **Permanent fix:** Bound period cardinality, query by exact source scope, batch series and index according to real plans. Derived caches remain re-authorized/rebuildable.
- **Exact amendment:** C03/C11/C18; P16/P21/P27.

### R13 — Audit, rollout or repair could preserve the wrong meaning

- **What/why:** Backfills infer grants from viewed charts, old clients drop range constraints, repairs edit source money, or logs become an unrestricted archive. Rollback can restore a broad endpoint after new sharing history exists.
- **Severity / likelihood:** High / medium–high in a mixed old/new deployment.
- **Evidence:** Current analytics/source gap; P12 grant history and P7/P13/P16 append-only/correction requirements; D9 migration boundaries.
- **Decision effect:** Requires denied-first activation, source-preserving repair and durable attribution.
- **Permanent fix:** Explicit compatible range contract, no inferred enrollment, atomic minimal audit, governed retention, safe disable/roll-forward and owner-command reconstruction.
- **Exact amendment:** C09/C17/C19/C20; P17/P24/P25/P27.

### R14 — The review could mistake evidence for complete historical-product proof

- **What/why:** Passing synthetic SQL, a vendor feature or a chart screenshot is represented as hosted authorization, correct historical plan reconstruction or excellent UX. Unselected lookback/expiry or a whole-phase dependency slips into implementation.
- **Severity / likelihood:** High / medium; current-versus-target gaps are concrete.
- **Evidence:** Q10 reservations, source owner gaps and probe limits; no production or actual-user evidence gathered.
- **Decision effect:** Keeps A with specific proof and honest status; rejects implied additional choices.
- **Permanent fix:** Trace selected answer and exact amendments to owners, OpenSpec, design and outcome tests at the authorized transitions. Qualify useful positives as well as denials; block only affected unqualified metrics.
- **Exact amendment:** C01/C05/C20; P08/P11/P26–P28.

## Individual category review

Every Yes points to the concern register's full severity, likelihood, evidence,
decision effect, fix and exact amendment. Shared causes are consolidated without
omitting any category.

| Category                                                      | Material concern?                             | Independent assessment                                                                                                                                                                          |
| ------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, and alternatives                 | **Yes — R01/R10/R14**                         | Useful earlier context is supported by comparable coaching; current-period-only is the simpler alternative. The selected optional scope needs explicit date semantics.                          |
| Brittleness                                                   | **Yes — R01–R04/R07**                         | Calendar rollover, late imports, corrected dates, ended commitments and incomplete retention break a naive historical chart.                                                                    |
| Technical debt                                                | **Yes — R03/R04/R11/R13**                     | Backward reconstruction from current state, duplicate snapshot ledgers and role-specific totals create lasting drift.                                                                           |
| Edge cases                                                    | **Yes — R02–R04/R07–R09**                     | Mid-period sharing, DST/year boundaries, late facts, cohort moves, source gaps, concurrent range edits and temporary withholding all need defined outcomes.                                     |
| Footguns                                                      | **Yes — R01/R02/R08/R10**                     | Re-evaluated relative dates, local-only selectors, wrong timestamps and optimistic Save can widen access or misstate results accidentally.                                                      |
| Tenant safety                                                 | **Yes — R05/R09**                             | Exact tenant/hat/entity/typed subject/module/history remains necessary across multiple coached subjects, caches and worker paths.                                                               |
| Database, RLS, and authorization safety                       | **Yes — R05/R08/R13**                         | Range validity, composite references, trusted actor/context, old/new mutation checks and privileged producer admission must all be proved.                                                      |
| Overengineering                                               | **Yes — R10/R11**                             | A report builder, day-level calendar workflow or new temporal platform is unnecessary for selected earlier periods.                                                                             |
| UX/UI and user friction                                       | **Yes — R01/R07/R10**                         | Fixed dates, live corrected values, scope gaps and save/retry outcomes must be clear on phone, keyboard and assistive technology.                                                               |
| Source of truth, ownership, and domain invariants             | **Yes — R02–R05**                             | Sharing dates, current corrected received amounts, historical expectation facts and past snapshots have different owners and meanings.                                                          |
| Hidden coupling                                               | **Yes — R01/R03/R11/R13**                     | Cache retention, a chart selector, invitation date or current schedule must not implicitly define historical authorization or financial meaning.                                                |
| Failure modes                                                 | **Yes — R07–R09/R13**                         | Missing coverage, failed regeneration, lost responses and late results must fail safely without claiming zero, success or revoked access incorrectly.                                           |
| Lifecycle, temporal correctness, concurrency, and idempotency | **Yes — R01–R04/R08/R09**                     | Fixed scope, source-date correction, CAS edits, retries and revoke/read ordering are central to this decision.                                                                                  |
| Data integrity risks                                          | **Yes — R02–R04/R07**                         | Wrong cohorts, current-state backcasting, partial sums and duplicate joins can corrupt reported history even with an unchanged ledger.                                                          |
| Security and privacy risks                                    | **Yes — R05/R06/R09**                         | Longer series, changing ranges and correction differences create inference/retained-data risks beyond simply hiding names.                                                                      |
| Scalability and performance risks                             | **Yes — R12**                                 | Finite periods and scoped batched reads need actual workload/query evidence; no performance claim is inferred from small fixtures.                                                              |
| Operational burden                                            | **Yes — R07/R11/R13**                         | Manual history reconstruction, hidden data gaps and direct SQL repair are avoidable with source-owned coverage and rebuild paths.                                                               |
| Observability and auditability gaps                           | **Yes — R08/R13**                             | Need durable scope-change history and current source provenance, separately from private financial audit and minimized technical logs.                                                          |
| Dependency and integration risks                              | **Yes — R02/R07/R11**                         | Late imported/provider facts must retain their source dates/currentness; no new connector or sync is necessary for native history.                                                              |
| Migration, rollout, and upgrade risks                         | **Yes — R13**                                 | Old clients and retained data cannot silently create history grants; mixed versions and disable/roll-forward must preserve source/audit truth.                                                  |
| Testability, traceability, and proof                          | **Yes — R14**                                 | Require exact earlier-period positives, denials, correction/race/UX/migration cases; document which were actually executed.                                                                     |
| Other development hazards                                     | **No additional material concern identified** | Checked new money writes, historical outreach, public giving changes, precise location disclosure and compulsory coaching. None is needed or selected; accidental expansions are covered above. |

## Ratified requirements and acceptance amendments

These are the complete ratified D10 amendment. Existing D8/D9 requirements
continue to apply. Formal owner/OpenSpec/design/task/ticket changes await their
explicit session transitions; the research does not declare them implemented.

**C01 — Exact optional historical authority.** Earlier support-summary periods
SHALL require deliberate qualified inclusion in one existing coaching share.
Bind exact tenant, active authorization context, legal entity, typed subject,
module/profile and historical scope. Role, invitation, prior participation,
retention or financial-summary eligibility SHALL NOT supply historical rights.
D10 adds no other historical content, export, notification, write or duration
entitlement. Existing independently valid rights remain independent.

**C02 — Fixed periods.** The source SHALL capture finite explicit earlier periods
from the reviewed selection, including calendar/boundary meaning. A relative UI
convenience SHALL resolve to literal reviewed dates before apply; Save/reload/
calendar rollover SHALL NOT re-evaluate it into wider scope. Reopening the editor
preserves the actual saved dates. Fixed-start accumulation, rolling lookbacks and
automatic transfer from Current to History require separate explicit authority.
Changing the selected dates requires the current authorized sharing command.

**C03 — Qualified period catalog and request bounds.** Offered historical choices
SHALL come from current tenant/source/profile eligibility, with safe metadata and
explicit finite cardinality/bounds. Do not derive visible earliest/latest choices
from hidden gift existence. Unknown qualification fails closed without implying
all-time access. Server reads and mutations SHALL enforce canonical bounds and
reject unsupported profile/range changes; browser clipping, query arguments and
caller-supplied tenant/calendar/actor fields SHALL NOT widen authorization.
Invalid, empty, reversed, future-as-history or unsupported period sets must not
become open-ended ranges.

**C04 — Corrected received history.** Historical received values SHALL retain
D9's qualified P13 effective designation-line fold, before assessments, grouped
by the current authoritative P7 gift-date fact with its source precision and
issuer dating basis. Creation/import/refund-processing time is not membership.
Late admitted facts and authorized monetary/date corrections may change a source
fact's period membership and values within the captured periods under current
source/privacy checks; they SHALL NOT change the captured sharing scope. No fact
outside the captured dates is admitted by its newer timestamp. Preserve exact source grain, currency and
canonical correction/conservation rules; history reads create no money effect.

**C05 — Qualified historical planned support.** The P16 owner SHALL qualify the
historical dated expectation population and its applicable immutable terms,
epochs, occurrence snapshots, links and authorized historical corrections.
Define cancellation/skip/release/fulfillment and incomplete-migration treatment
without relabeling current outstanding balance as past planned support. Current
amounts, active-state lists, next dates or monthly equivalents SHALL NOT be
backcast. Ordinary later fulfillment or a later prospective cancellation/amendment
SHALL NOT erase or recompute the amount planned for an earlier occurrence.
Suppression effective for that occurrence and authorized historical correction
follow the qualified P16 historical rule. Reading history SHALL NOT materialize past occurrences, change live
schedules or attempt money. A missing historical producer makes that metric
unavailable; it does not license guessed values or block independent valid results.

**C06 — Meaning, coverage and freshness.** The historical view SHALL identify
the represented periods, financial basis and current source evaluation. It is
not an as-known-then snapshot or official period-close artifact. Complete zero
requires affirmative source coverage for the exact period/metric/currency.
Missing, withheld, partially imported, truncated or stale history SHALL NOT
become zero. Source-qualified partial results require explicit truthful coverage;
otherwise return a safe unavailable state. Each valid measure may have its own
source cursor/currentness; no new global cross-owner transaction is required.

**C07 — Source-purpose admission.** A trusted producer SHALL admit inputs for
the exact historical coaching-summary purpose under current scope/field/privacy
floors before enumeration and arithmetic, then separately authorize the derived
output. Coaches SHALL NOT require or gain raw donor/gift/commitment SELECT.
Service roles, invoker/definer views or cached authorization cannot substitute
for source admission. Reuse the P3/P10/P12 resolver and owner metric registry,
not a separate history permission engine or surface allowlist.

**C08 — Combined-series disclosure.** Qualify each finite offered history profile
under existing P12 small-cell and P3/P10 disclosure rules, including repeated
range selections, adjacent/overlapping periods, correction deltas, current/history
combinations, public complements and overlapping subjects. Withhold unsafe values
and offered reconstructing totals/ratios/deltas/goal lines. Do not reveal hidden
counts, private source-gap causes or protected existence through period options,
errors or accessible alternatives. No universal new N, random noise or guarantee
against arbitrary external knowledge is implied; reachable unsafe disclosure
blocks the affected profile rather than being left for monitoring.

**C09 — Database and mutation safety.** Persist only the existing sharing/grant
extension and necessary derived provenance, not a new ledger. Use canonical typed
subjects, non-null scoped references, tenant/entity-aware keys/FKs, constrained
range/calendar/version state and unique business-effect identity as applicable.
Derive tenant, principal, actor, owner, approval and audit attribution from trusted
context. Both eligible old rows and permitted new states must be enforced; direct
UPDATE cannot change dates/profile/subject/actor beyond source authority. Verify
actual grants, USING/WITH CHECK semantics, function/view owners, search paths,
default execute rights, forced/coarse RLS and service paths. Preserve source
append-only and retention requirements; deletion/cascade cannot erase source
money or security history. No SQL type or security keyword alone proves safety.

**C10 — Atomic changes and retries.** History edits SHALL use the existing source
command with current authority, expected scope/profile version, canonical reviewed
dates and required audit in the same authoritative transaction. Validate policy
changes and concurrent edits at apply. A durable business-effect identity binds
the intended change; retries cannot duplicate history, overwrite newer narrowing
or widen a different scope. Definite failure, confirmed outcome and unknown
response remain distinct. Recover current source status before reapplying intent;
no new routine maker-checker queue is added to ordinary qualified sharing.

**C11 — Current release and lifecycle.** Every result, deferred read and cached
response SHALL satisfy current exact history/source/profile/grant admission at
release. Partition and validate cached state by full context and versions; discard
late results on context/scope change. Revoked/ended grants and removed periods
cannot revive through policy re-enable, old links, refresh or stale Save. Distinguish
that terminal/narrowed authority from temporary source/coverage/privacy withholding:
an unchanged valid selection may resume only after current requalification.
Do not erase legitimate saved intent on a transport failure or globally cancel
independent rights. Previously observed information cannot be recalled.

**C12 — Simple sharing control.** Use one clear earlier-period inclusion/range
choice within the existing coach-sharing flow, with exact saved versus draft
dates, concise fixed-scope/corrected-value explanation, inline review and one
Save. Show current permitted actions and safe reasons for unavailability. Preview
is bounded by both proposed sharing and the requester's own read authority.
Ordinary source-value updates do not require a new scope confirmation. If the
effective scope or profile requested by an in-progress sharing edit changes,
require refreshed review before saving. Current restrictions take effect
immediately; unchanged valid scope may resume only through C11 requalification.
Do not silently clamp a requested widening and
claim the original range was saved. Extension/removal must be discoverable,
deliberate and use the same short flow; no automatic alert or reminder is created.

**C13 — Truthful historical reading.** Show permitted period rows/cards with
measure, currency, basis, coverage and safe source currentness. Missing periods
remain explicit gaps/unavailable where disclosable; no zero-fill, line bridging,
unqualified average, range total, delta, goal ratio or donor drill-down. Any chart
and accessible text use the same admitted values/scope. Current period and fixed
earlier dates are clearly distinguished. Preserve independently permitted material
when one source fails. Save/retry status is persistent and outcome-accurate, not
only a transient toast or an optimistic local toggle.

**C14 — Accessible, localized, low-bandwidth use.** Reuse Core shared components
and semantic tokens. Keep names, organization/subject, dates and actions legible
at 320 CSS pixels and 400% zoom, with keyboard navigation, clear focus, associated
errors and announced status. Use unambiguous localized date labels and explicit
currency; never rely solely on color, hover or two calendar widgets. Test long
names/translations and relevant display timezones. Fetch only the bounded admitted
series for the active subject; offline cached data does not supply permission.

**C15 — Temporal and numeric precision.** Source period IDs/bounds/calendar and
date precision govern inclusion, with canonical half-open comparisons where
appropriate; do not use end-of-month midnight or synthetic last-millisecond
boundaries. Expected schedule timezone and P7 gift-date basis retain their
different authoritative meaning. Viewer timezone cannot re-date facts. Preserve
exact minor units/currency and any separately admitted P16 rational planning
transform until defined rounding. Historical goal or percent comparisons require
their own authorized compatible source version; D10 grants none by implication.

**C16 — No secondary historical effects or new platform.** Selection, reading,
rebuilding and correction visibility SHALL NOT trigger outreach, reminders,
tasks, consent, collections, enrollment or notifications. Provider/import
reconciliation remains with existing source owners; historical ingestion cannot
re-date facts or imply completeness. Reuse native source history and existing
projections; no new CRM, general bitemporal engine, warehouse, sender, third-party
sync, AI, chart dependency or duplicate snapshot financial authority is required.

**C17 — Migration and retention.** Activate only qualified history profiles with
explicit denied-first compatible contracts. Existing chart ranges, caches,
retained rows, prior views and coaching invitations SHALL NOT backfill grants.
Qualify each source's historical completeness and lineage; never invent past plans
or zeros to populate a graph. Retention does not grant access and sharing does not
extend retention. Source rebuilds preserve exact scope; an unavailable source
remains unavailable. Old/new client/schema combinations must fail safely. Disable
or roll forward without deleting financial/grant history or restoring a broad
legacy endpoint; backup restoration cannot resurrect superseded authority.

**C18 — Measured bounded performance.** Specify admitted period count, subject,
currency/source cardinalities and concurrency in each qualified release workload,
then measure query count/plans, p95 latency, memory and source freshness against
declared budgets. Use exact-scope indexed/batched source reads, avoiding whole-tenant
scans, per-period N+1 calls and all-subject prefetch. A cache is rebuildable and
re-authorized, never permission or money authority. No universal month limit or
numeric SLA is inferred from vendor defaults or the small synthetic probe.

**C19 — Audit and safe repair.** Keep durable source-owned before/after historical
scope/profile, actor/context, command identity, timestamp and outcome, under
existing restricted audit/retention rules. Preserve source metric/calendar/cursor
provenance needed to diagnose a result without logging financial payloads, donor
details, hidden counts, tokens or unrestricted snapshots. Separate financial
correction history, sharing audit and technical telemetry. Repair through source
correction/rebuild commands; the coach cannot edit the total and operators need
no ad hoc direct database patch. A faulty projection must not mutate source truth.

**C20 — Traceability and qualification.** Carry D10/C01–C20/P01–P28 into the
later authorized owner, glossary, OpenSpec, design, tasks/tickets, implementation
and release evidence, preserving selected/reviewed/ratified/implemented status.
Prove useful permitted history and negative scope/privacy cases at actual Core
services/Supabase paths, plus concurrency, calendar/source corrections, compatible
migration, accessibility and representative missionary/coach comprehension.
Bounded probes, document checks and published vendor features do not establish
production safety or UX success. An unresolved exact source metric blocks that
metric, not every earlier-period module or the whole coaching product.

## State, schema and source synthesis

The smallest durable addition is explicit historical scope in the existing
source-owned sharing model. Bind the registered financial profile and canonical
period identifiers/bounds. The final schema may use existing scoped child rows
or validated interval representation; this decision does not mandate a new table,
PostgreSQL range type, generalized permission DSL or copied financial snapshots.
Unbounded/null dates are not “all time” defaults. Multiple intervals, if ever
offered, need unambiguous non-overlapping normalization and exactly equivalent
scope checks; the recommended initial UI is one contiguous qualified interval.

PostgreSQL range checks can enforce valid boundaries, while scoped FKs prevent
cross-tenant references. Neither establishes disclosure authority or historical
financial truth. RLS, grants and a privileged summary producer must preserve the
same exact source-purpose boundary. Applicable omitted WITH CHECK can inherit
USING; inspect the actual semantics instead of assuming omission always permits
reassignment. A definer function's behavior depends on its owner privileges/RLS;
an invoker view does not manufacture summary-only authority without base access.

| Event                                            | Required result                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Select/review an earlier interval                | No grant yet; exact literal dates and permitted profile are visible.                             |
| Save valid current selection                     | Authoritative scope and required audit commit once; UI shows effective dates.                    |
| Calendar advances                                | Captured historical dates unchanged; current-period behavior stays separately governed.          |
| Extend/narrow/remove                             | Current authorized command changes only reviewed scope; stale competing edits fail safely.       |
| Late import or correction inside allowed periods | Current qualified value may change, with appropriate coverage/currentness and disclosure checks. |
| Gift date changes across boundary                | Each source-period result is re-evaluated; the new excluded period is not exposed.               |
| Temporary source/privacy withholding             | Output is withheld; no fabricated zero or automatic destruction of still-valid saved choice.     |
| Revocation, tenant disable or episode end        | Dependent historical output stops; old scope/result cannot revive it.                            |
| Response lost after commit                       | Check authoritative outcome; do not repeat an old widening over a newer restriction.             |
| Backup/cache/source rebuild                      | Reconstructed output requires current authority; stored history grants no new access.            |

Invariants: each released period is inside the captured current scope; each
source fact contributes under its authoritative date/grain once per metric;
currencies remain separate; current corrections preserve canonical conservation;
the historical permission interval and access duration are distinct; audit/source
history survives permitted lifecycle changes; read models never mutate money or
authorize access. Policy widening follows ADR0211 at its policy layer, while an
ordinary already-qualified share change retains its source command semantics.

## Falsifiable acceptance and proof scenarios

These are required product outcomes. The evidence package separately identifies
executed probes and their limits; this table is not a claimed passing feature suite.

| Proof                                     | Required observable result                                                                                                                                                                                                                                                                    |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 — Useful positive history             | Exact authorized earlier expected/received summaries are readable for one share without raw financial access; unrelated valid current coaching remains useful.                                                                                                                                |
| P02 — Scope poison                        | Other tenant, entity, subject, module, role/hat and unshared period cannot contribute a value, count, existence clue or cache result.                                                                                                                                                         |
| P03 — Fixed boundary                      | Month/year rollover and repeated reload leave literal earlier dates unchanged; no rolling addition/removal or Current-to-History grant.                                                                                                                                                       |
| P04 — Review/apply fidelity               | Crossing a period boundary while the editor is open does not recalculate its end; the saved scope equals the reviewed canonical dates or a clear conflict requires review.                                                                                                                    |
| P05 — Calendar edges                      | Exact lower bound included, exclusive upper bound excluded; month end, leap day, relevant DST/timezones and source civil-date precision match the owning period definition.                                                                                                                   |
| P06 — Late import                         | Old gift newly imported remains in its gift-date cohort; import time cannot make an unshared earlier fact visible in a permitted current period.                                                                                                                                              |
| P07 — Dating/money correction             | Moves into/out of included periods, refund/reversal/redesignation and concurrent source revisions update only admitted current results without exposing excluded destinations/details.                                                                                                        |
| P08 — Historical plan                     | Prospective amount/cadence changes, pause/skip/end, fixed/recurring links, historical corrections and source migration gaps match P16's qualified historical reference; no backcasting. August's planned amount survives ordinary September fulfillment and October prospective cancellation. |
| P09 — Read-only history                   | View/refresh/rebuild creates no occurrences, money attempts, source changes, tasks or communications; planned-history absence does not invent values.                                                                                                                                         |
| P10 — Corrected versus snapshot           | Users can identify the represented period and source update time; corrected values are not labeled as what was shown then or a closed official statement.                                                                                                                                     |
| P11 — Summary-only access                 | Coach receives exact admitted aggregate while raw tables, donor/gift/commitment endpoints, unclassified fields and unrelated source history remain denied.                                                                                                                                    |
| P12 — Mutation constraints                | Tenant/subject/profile/actor/calendar/version rebinding and invalid/open-ended/reversed ranges fail at the authorized source/database boundary; valid old row cannot become forbidden new state.                                                                                              |
| P13 — Series privacy                      | Existing small-cell floor plus adjacent/overlapping/changed-range, dominant/coincident groups and current/history combinations prevent prohibited disclosures through the offered outputs.                                                                                                    |
| P14 — Correction and complement inference | Late/corrected totals, goal/ratio/annual complements and overlapping subjects cannot reconstruct an output the source forbids; unsafe profile is withheld.                                                                                                                                    |
| P15 — Safe metadata/representations       | Period availability, explanations, tooltips, accessible text, JSON, logs, preview and errors reveal no wider dates/precision, private causes or hidden existence.                                                                                                                             |
| P16 — Empty versus incomplete             | Complete true zero differs from missing coverage, capped source, expired cache and incomplete import; no artificial zeros, continuous gap lines or misleading range totals.                                                                                                                   |
| P17 — Concurrent edits                    | Extend versus narrow/revoke/tenant-policy change exercises both real transaction orders; stale preview/version never resurrects removed dates.                                                                                                                                                |
| P18 — Durable retry                       | Duplicate apply, lost response and later narrowing preserve one business effect/history; Check status does not reapply old widening.                                                                                                                                                          |
| P19 — Current release                     | Read/generation versus source change or grant reduction cannot release stale-authority history; exact current source evaluation is retained.                                                                                                                                                  |
| P20 — Easy deliberate lifecycle           | Missionary adds, reviews, saves, extends, narrows and removes earlier dates in one coherent flow; ordinary operation needs no repeated confirmation modal.                                                                                                                                    |
| P21 — Context and cached state            | Switching subject/tenant, empty/invalid context, late response, Back and another tab cannot retain protected previous history under new labels or authority.                                                                                                                                  |
| P22 — Financial comprehension             | Coach distinguishes planned from received, correction time from reporting dates, unavailable from zero, separate currencies and gaps in sharing from inactivity.                                                                                                                              |
| P23 — Withholding versus revoked grant    | Still-valid selection can resume only after current source/privacy qualification; ended/narrowed grants never revive through refresh or policy re-enable.                                                                                                                                     |
| P24 — Source-owned recovery               | Historical producer failure/rebuild and source correction preserve financial truth and independent valid modules; no manual database patch or new financial ledger.                                                                                                                           |
| P25 — Audit and minimization              | Required scope audit is atomic, attributed and usable; restricted diagnostic evidence explains source/profile versions without leaking financial payloads or private counts.                                                                                                                  |
| P26 — Practical accessibility             | Missionary/coach phone, 320 CSS pixels, 400% zoom, keyboard/screen reader, long translations and constrained-network tasks preserve labels, focus, status and recoverability.                                                                                                                 |
| P27 — Rollout and load                    | Mixed versions/backfill/kill switch/restore never infer grants or zeros; measured supported period/source/subject/concurrency workloads meet explicit query/latency/memory/freshness budgets.                                                                                                 |
| P28 — Traceable complete job              | D10 through glossary/owners/OpenSpec/design/tickets/tests/release uses identical terms/dates/rights, demonstrates a useful positive profile and records actual user feedback and proof limits.                                                                                                |

## Adversarial check

### What could go wrong with this answer?

A fixed range can become inconvenient when a coach wants every newly completed
period, or a defensive implementation can hide all history. Keep deliberate
extension easy and show a useful qualified positive case. Do not silently solve
that inconvenience with an accumulating grant the founder did not select. Do not
declare a feature complete when only its denial states work.

### What hidden assumptions are we making?

We infer that bounded past financial context helps coaching from published
practice and the founder's choice. We have not measured the preferred lookback,
minimum useful precision or extension frequency with actual missionaries/coaches.
The proposed fixed-range design is a conservative product recommendation, not
universal empirical truth. Source qualification must establish historical
completeness and exact expected-series meaning; current schedules cannot fill
that evidence gap.

### How does this affect the whole product?

It adds a bounded historical consumer to existing sources and sharing, not new
financial facts. P7/P13 correct received history; P16 qualifies historical plans;
P12/P3/P10 control disclosure; P28 supplies the deliberate journey. P21 participates
only where its admitted composition is used. Contact, newsletter, donor checkout,
public pages, care records and operational duties acquire no new effect.

### How does this affect the end-user experience?

The missionary sees one understandable choice and exact saved dates. The coach
sees readable prior periods and honest explanations, with current summaries
separate. Source complexity stays behind the screen. Labels must explain why a
figure can change without implying a changed sharing agreement. Period extension
is a short deliberate edit, not an administrator handoff or report-builder task.

### Does this follow modern best practices?

It separates report filters from access grants, current corrected reports from
snapshots, and source evidence from visualization. It uses clear review, native
accessible controls and current authorization on every release. External guidance
is evidence for these patterns; vendor ranges, currencies, balance rights,
date bases and privacy claims are not imported as Core policy.

### Does this fit Asym's existing repo and product direction?

Yes, with explicit historical producer and projection amendments. It preserves
Asym/Postgres ownership, ADR0209/0211/0212, P12 exact contexts and the shared UI.
Current client-only date filters and source math are implementation evidence to
correct on this path, not governing behavior. No new ADR or independent history
platform is justified.

### Should we adjust the recommendation?

Keep A with the exact fixed-scope, source-truth, UX and proof amendments above.
Reject automatic rolling history and current-state reconstruction as implied
implementation shortcuts. Preserve a useful narrower qualified metric rather
than fabricate missing history or block the whole coaching product.

## Ordered synthesis, owner changes and monitoring

| Owner/artifact                                    | Exact bounded change to carry forward                                                                                                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P28 / glossary / design                           | Optional earlier support-summary scope; fixed reviewed periods, clear relation to Current, simple review/save/change/remove and state semantics. C01–C03/C10–C14.                 |
| P7/P13                                            | Extend the ratified D9 received producer to qualified earlier source-date cohorts with current corrections and period coverage; no competing dates or copied totals. C04/C06/C15. |
| P16                                               | Qualify historical dated expectation facts/composition and corrections, independent of today's active view; preserve source immutability and read-only behavior. C05/C06/C15/C16. |
| P3/P10/P12 and existing ADRs                      | Exact historical profile and typed grants, safe period-option metadata, combined-series privacy, current release and attributable changes. C07–C11/C19.                           |
| Applicable P21 source composition                 | Consume qualified history only where authorized; retain separate Support Assignment/current context, currency and account rights. No whole-finance prerequisite. C01/C07.         |
| OpenSpec → tasks/tickets → implementation/release | At the authorized transitions, reconcile the exact owner additions and map C01–C20/P01–P28 to observable outcomes. No tracker/spec mutation occurs here. C17–C20.                 |

1. **Resolve before recording the reviewed answer:** explicit finite dates,
   no automatic range progression, corrected historical values versus snapshots,
   source dates versus import timestamps, and a small truthful journey. This
   review resolved those recommendations. The founder subsequently explicitly
   ratified the corrected decision and detailed amendment.
2. **Capture in spec/design:** registered source/history profiles, bounded tenant
   eligibility and period semantics, historical planned/received definitions,
   combined-output privacy, schema/lifecycle and user-facing copy/states. Do not
   invent a universal lookback or access duration; exact allowed profiles must
   be explicitly configured and qualified before activation.
3. **Require before implementation activation:** actual D8/D9 context foundation,
   server-enforced range command/read, source-complete historical producer,
   current release fences, audit/idempotency and safe compatible clients. Block
   affected unqualified metrics without waiting for unrelated whole phases.
4. **Prove the complete job:** positive useful history, calendar/correction and
   negative authorization/privacy tests, real concurrency, migrations, actual
   Supabase paths and browser/accessibility/representative-user tasks, followed
   by measured supported workloads. Documentation and small fixtures are not
   deployment qualification.
5. **Monitor residual operation only:** named signals below have explicit owners
   and responses. Unauthorized history, false money and misleading zero are
   prevention/activation failures, not acceptable risks to discover casually.

| Signal                                                                       | Threshold                                                                        | Accountable owner role             | Response                                                                                                                                                 |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Out-of-scope or revoked-period release                                       | One confirmed occurrence                                                         | P12 security owner + P28 owner     | Disable affected history path/profile, investigate source/caches and requalify before reactivation.                                                      |
| Historical amount/cohort mismatch against canonical reference                | One reproducible nonzero discrepancy or wrong-period inclusion                   | P13/P7 or P16 metric owner         | Withhold affected measure, correct source/projection through owner commands, rebuild and add regression proof.                                           |
| Unproved period presented as complete/zero                                   | One confirmed case                                                               | Historical source projection owner | Remove the incorrect claim, restore safe availability and diagnose coverage/retention lineage before requalification.                                    |
| Scope mutation missing/contradictory audit or replay outcome                 | One authoritative effect without required matching history                       | P28 sharing-command owner          | Block affected mutation, reconcile from durable source evidence, fix atomicity/idempotency and test both race orders.                                    |
| Query/latency/memory/freshness budget breach                                 | Breach of the explicit measured release-profile budget at its supported workload | P28/API operator + source owner    | Inspect scoped plans/load, repair batching/indexing or constrain admitted workload while retaining access checks. No unmeasured numeric SLA is asserted. |
| Material misunderstanding of fixed dates, corrected values or access removal | One reproducible task failure in release/pilot review                            | P28 product/design owner           | Correct interaction/copy and rerun that task before broader rollout; do not shift preventable confusion into training.                                   |

**Final disposition: Accept with required amendments.** The selected earlier-period
capability has concrete corrected wording, source ownership, simple UX, lifecycle,
database/privacy safeguards and falsifiable proof. The corrected decision and
required amendments are explicitly ratified. No further history progression,
access duration or production qualification is inferred.
