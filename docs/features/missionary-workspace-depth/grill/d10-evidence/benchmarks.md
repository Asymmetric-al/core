# D10 — Earlier support-summary periods: reporting and UX evidence

**Subsequent status — October 16, 2026 UTC:** the founder explicitly ratified
the [D10 corrected decision and amendment](../phase28-d10-adversarial-review.md),
including C01–C20/P01–P28. The research below preserves its pre-ratification
reasoning and candidate language; only the reconciled main review defines the
ratified amendment. No runtime or source qualification is implied.

Research date: **October 16, 2026 UTC**. The founder selected **A: allow selected
earlier support-summary periods**. This evidence note does not ratify the review
amendments, select a lookback length or access duration, or qualify an
implementation. Only this research file is changed.

**Recommended direction:** extend the existing deliberate sharing review with
plainly stated earlier reporting periods. Keep the financial meaning established
by D9, make the exact represented dates visible before saving, and let the coach
browse only the currently admitted periods. Treat the question “what do current
corrected records say about that period?” separately from “what did we know at
that past time?” A calendar control cannot resolve that distinction.

A finite fixed range is the simplest candidate for earlier-period sharing. A
rolling range or a fixed start that keeps adding periods can be useful, but each
adds future disclosure behavior that must be explicitly defined and accepted.
These are recommendations for review, not already selected range policy.

## 1. Evidence register

All new sources below were inspected October 16, 2026. Public documentation is
evidence of the vendor's described behavior, not an authenticated test. Publisher
dates are distinguished from retrieval dates. No user interviews, usability
studies of Asym, production permission tests, financial mutations or live reports
were performed. Public pages that include login/loading notices were read only
where their article body was accessible; no authentication was attempted.

| ID  | Primary source; publisher date                                                                                                                                                                                              | Documented behavior relevant to D10                                                                                                                                                                             | Evidence class and limit                                                                                                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | [Salesforce: Reporting snapshots](https://help.salesforce.com/s/articleView?id=analytics.data_about_analytic_snap.htm&language=en_US&type=5); **no exact update date observed**                                             | Authorized users can schedule report results into a target object for point-in-time and trend reporting. A run history records success/failure.                                                                 | Official current help body. Shows that a preserved snapshot is a distinct reporting capability. Does not establish Core should copy financial data into a new snapshot store. The initial URL without `type=5` returned a loading shell; the cited form exposed the body. |
| S2  | [Salesforce: Historical trend reporting](https://help.salesforce.com/s/articleView?id=sf.reports_historical_concepts.htm&language=en_US&type=5); **no exact update date observed**                                          | Historical reports compare selected snapshot dates and historical field conditions. Tracked objects, fields, periods and data volume have limitations.                                                          | Official help. Its date-count/retention constraints are vendor-specific and are not a Core history entitlement, useful minimum or performance target.                                                                                                                     |
| H1  | [HubSpot: Edit report filters](https://knowledge.hubspot.com/reports/edit-report-filters); updated **2026-07-29**                                                                                                           | Date property and date range are separate controls. Troubleshooting explicitly distinguishes Create date from Close date and checks source records, filters and permissions.                                    | Current official help. Strong evidence that choosing the wrong date field changes the population even when the date range looks correct. Core should fix the source date meaning rather than offer an unrestricted date-field menu.                                       |
| H2  | [HubSpot: Manage reports](https://knowledge.hubspot.com/reports/manage-reports-in-your-reports-list); updated **2026-08-18**                                                                                                | Report/dashboard access does not override CRM record, source or field permissions; restricted access can yield partial, blank or error results.                                                                 | Current official help. Useful separation of report and source authority. Core's D9 summary-only authorization does not require giving coaches raw-record rights; HubSpot's exact permission model is not imported.                                                        |
| B1  | [Bloomerang Fundraising: Reporting introduction](https://help.bloomerang.com/en/articles/13382623-reporting-introduction-and-navigation); dated **2026-03-17**                                                              | A Range control offers preset periods or custom dates; filters can be reset or saved for reuse.                                                                                                                 | Current official help. Supports discoverable period controls, not arbitrary filters or automatic sharing. A saved query is not evidence of a frozen historical value.                                                                                                     |
| B2  | [Bloomerang Fundraising: Transactions Report](https://help.bloomerang.com/en/articles/13382625-transactions-report); dated **2026-06-11**                                                                                   | Reports separate transaction status, time range and row detail. Its transaction summary's net amount subtracts refunds and fees; the page describes an accounting/reconciliation use.                           | Current official help. Important contrast: a vendor “Summary” is not necessarily an aggregate and its net figure is not D9's before-assessment designated-gift metric. No real-time claim is adopted.                                                                     |
| V1  | [Virtuous: Gifts by Project Report](https://support.virtuous.org/hc/en-us/articles/360051241892-What-is-the-Gifts-by-Project-Report); updated **2025-05-07**                                                                | Project plus start/end date defines reporting scope; results use project split amounts rather than repeating whole gifts.                                                                                       | Official help. Supports exact subject/allocation and interval selection. Its all-project default, groupings and suggested staff-effectiveness interpretation are not Core policy.                                                                                         |
| K1  | [Blackbaud: Edit or Adjust a Gift](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-gift-edit.html); **no exact update date observed**                                                             | Gift date, post date and adjustment behavior are distinct. Posted adjustments preserve an audit trail; pledge schedules and applications can be adjusted.                                                       | Current official help. Supports treating source correction history separately from a current report. Core retains P7/P13/P16 correction ownership; Blackbaud's edit/refund restrictions are not imported.                                                                 |
| K2  | [Blackbaud: Adjusted Gift Report](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-adjusted-gift-report.html); **no exact update date observed**                                                   | A separate report lists gifts changed through the adjustment process, with adjustment reasons and possible ledger information.                                                                                  | Official help. Evidence that explaining change and displaying period totals are separate jobs. Does not grant coaches correction reasons, gift rows or ledger access.                                                                                                     |
| G1  | [Google Data Studio: Set a date range](https://docs.cloud.google.com/data-studio/set-report-date-ranges); updated **2026-10-13 UTC**                                                                                        | Fixed dates stay fixed; rolling start/end dates move relative to today. Date-range dimension determines record membership. Comparison periods and week conventions are separately configured.                   | Current official reporting documentation. Provides precise terminology, not Core authorization or a reason to add an analytics dependency.                                                                                                                                |
| M1  | [Microsoft Power BI: Relative date slicer](https://learn.microsoft.com/en-us/power-bi/visuals/desktop-slicer-filter-date-range); updated **2026-07-23**                                                                     | Rolling months differ from complete calendar months. Relative selection can use a current/first/last-date anchor; the page documents UTC and week-start conventions.                                            | Current official documentation. Illustrates why relative labels and anchors matter. Core must use its own source-owned calendar/date semantics, not inherit Power BI's UTC or Sunday convention.                                                                          |
| U1  | [USWDS: Date range picker](https://designsystem.digital.gov/components/date-range-picker/); **no single current update date observed**                                                                                      | Calendar context is useful for some tasks; when weekday context is irrelevant, another date-input pattern may be simpler. Manual entry, format guidance and explanations for unavailable dates are recommended. | Official design guidance, not a dependency proposal. Do not impose the US example date format on international users or assume a calendar is necessary for whole reporting periods.                                                                                       |
| U2  | [USWDS: Date-range accessibility tests](https://designsystem.digital.gov/components/date-range-picker/accessibility-tests/); **versioned component test checklist**, no single publication date used                        | Provides keyboard, focus, zoom, screen-reader and touch checks; explicitly requires testing within the actual product, not just relying on isolated component tests.                                            | Primary accessibility practice. The vendor component's results do not prove Base UI or Core implementation compliance.                                                                                                                                                    |
| W1  | [W3C: Understanding WCAG 2.2 SC 3.2.2, On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html); **living explanatory guidance**, no exact update date used                                                     | Changing an input must not unexpectedly change context without advance advice. A content update is not automatically a context change.                                                                          | Primary standards explanation. It does not require an Apply button for every safe period filter or forbid all automatic report refreshes.                                                                                                                                 |
| C1  | [MPDX: Reports quick reference](https://help.mpdx.org/article/1253-mpdx-quick-reference-guide-reports), updated **2024-07-08**; [coach guidance](https://help.mpdx.org/article/510-for-mpd-coaches), updated **2020-10-28** | Documents temporal committed/received context in coaching, including a 13-month report.                                                                                                                         | Official help, inspected earlier today and reused. Evidence of a coaching job, not proof that thirteen months is optimal, universally permissible or a Core limit.                                                                                                        |

The [D9 benchmark ledger](../d9-evidence/benchmarks.md) retains current primary
evidence for promises versus receipts, refunds, multi-currency distinctions,
PostgreSQL aggregate semantics and ICO's contextual identification/data
minimization principles. Those findings apply to earlier periods too. More
history adds observations and combinations; it does not make a summary anonymous.
No universal statistics threshold is derived here.

## 2. Four different meanings of time

| Time concept                      | What it answers                                                            | D10 implication                                                                                                                                                                        |
| --------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Represented reporting period      | Which source-dated expectations or gifts belong in the displayed interval? | Authorize the exact period and use the D9 source basis. Import time, grant time and page-open time cannot replace it.                                                                  |
| Source evaluation/currentness     | Through which qualified source revision and coverage is this amount known? | Earlier-period totals can be recalculated from current effective facts and change after corrections. Show honest currentness; do not call them immutable snapshots.                    |
| Historical state or snapshot time | What was planned/known/displayed as of a particular earlier instant?       | Requires a separately qualified temporal source meaning. Today's commitments or current amount cannot reconstruct this by assumption. A report containing old dates is not sufficient. |
| Access lifetime                   | For how long may this coach read the defined scope?                        | Independent of reporting period. Selecting old dates does not create perpetual access; limiting a report to September does not mean access expires in September.                       |

The [Q10 frontier](../phase28-q10-coaching-history-research.md) makes this a choice
about earlier financial reporting periods only. It does not add old check-ins,
private notes, interactions, former coaching discussions, donor records or old
goal versions. A grant is not backdated just because its currently authorized
output represents earlier data.

The [ratified D9 review](../phase28-d9-adversarial-review.md) and
[financial-source analysis](../d9-evidence/financial-truth.md) govern the exact
meaning. **Gifts recorded for [period]** uses current authoritative P7 gift-date
cohorts and P13 effective designated amounts before organization assessments.
Expected support uses a qualified, non-overlapping P16 dated population; a
narrower qualified subset needs its accurate label. Earlier-period viewing does
not turn either into net account funding, a cash forecast or monthly equivalence.

For example, an October import of a September-dated gift remains in September's
qualified cohort. A later source correction moving that gift into August changes
the relevant effective totals; it is not an October gift merely because the
correction happened in October. This is an illustrative consequence of D9's
chosen date basis, not a new correction policy. Current campaign membership,
current goal versions or a viewer's timezone must not silently rewrite historical
scope. P13's unresolved attribution gates remain local to dependent metrics.

For expected support, qualify which past plan the value represents before
offering it. “Planned for September, using the qualified effective schedule” and
“What was planned on September 1” are different questions. This note does not
choose a snapshot time or promise that an adequate historical schedule source
already exists. Use a source-owned temporal projection or keep that measure
unavailable; do not copy today's active commitment amount backward across a chart.

## 3. Range alternatives and the strongest simpler option

| Model                             | Practical benefit                                                                                                                                     | Disclosure/interpretation cost                                                                                                                                                                                        | Recommendation status                                                                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Current reporting period only     | Smallest financial history surface; useful for present planning; no earlier-period navigation.                                                        | Less context for seasonal/irregular support. “Current” still needs an exact calendar and legitimate source cohort; it is not a partial period beginning at invitation.                                                | Strongest simpler alternative, not the selected A scope. Preserve useful current views when an earlier-period projection cannot be qualified. |
| Fixed earlier range               | Exact start/end periods are easy to review, revisit and test. It can give context from before the share began without admitting all retained history. | Newly elapsed periods do not automatically join that earlier range. Values within fixed dates can still change through source corrections.                                                                            | **Simplest recommended starting candidate**, with finite source-qualified choices; no number of periods selected here.                        |
| Rolling lookback                  | Keeps a recent horizon available with fewer repeated sharing edits.                                                                                   | It admits new periods and drops old ones as its anchor moves. “Last N months” may include partial periods or differ from “last N completed months.” Clock/calendar and rollover behavior become permission semantics. | Useful alternative only with an explicitly reviewed, source-qualified ongoing rule; not inferred from A or from a report preset.              |
| Fixed start, ongoing end          | Preserves the story from an agreed starting point as new periods accumulate.                                                                          | The amount of history expands, including future periods. It needs clear ongoing consent, bounded reads and disclosure checks; otherwise it becomes an unnoticed all-future grant.                                     | Potentially useful for a continuing coaching relationship; not selected by eligibility alone. No indefinite access follows.                   |
| Preserved point-in-time snapshots | Can explain exactly what a prior report knew or showed if that is a real authorized job.                                                              | Different source/retention/access requirements; corrections no longer simply replace the old reported value. A copied snapshot archive can retain revoked or protected facts.                                         | Not required by D10 A; do not add a parallel historical warehouse to satisfy ordinary earlier-period browsing.                                |

Do not make the missionary choose among all five models in the initial form.
The product should qualify a small, understandable offered profile, then expose
only its meaningful choice. Reporting tools demonstrate how many choices are
possible; that is not evidence that every choice is necessary for coaching.

Fixed historical dates and ongoing current-period access are also distinct. An
existing current period must not silently become an authorized earlier period
when the calendar advances unless the chosen grant rule actually admits that
transition. Conversely, do not require re-sharing every new period if the founder
later explicitly chooses an ongoing qualified rule. The actual progression must
be settled before activation and tested at its boundary.

## 4. Minimal practical journey and candidate copy

These are examples for design review within the existing shared design system,
not prescribed new screens or final wording. Month-based examples assume a
separately qualified monthly reporting unit. D10 does not select that unit.

### Missionary: include earlier periods in the existing share

1. Open the existing coach sharing review for the exact subject and organization.
   Show the actual currently shared summary modules; do not imply that choosing
   history also adds an unshared financial module or changes its basis.
2. Offer **Earlier support periods** only when applicable. Use a small set of
   qualified period choices, with exact date expansion visible. A whole-period
   selection often needs less work than two arbitrary day calendars. If custom
   dates are genuinely required by the selected source profile, provide typed
   entry, format guidance and an optional calendar without drag-only interaction.
3. Show the selected historical range and any ongoing behavior in the same review,
   alongside the actual effective coach preview. For a fixed candidate: **Adds
   these earlier periods only: 1 January–30 September 2026.** This is an
   illustration, not a default or a nine-month entitlement. If the product offers
   rolling or ongoing behavior, say which new periods will become available;
   showing today's resolved dates alone is insufficient.
4. Use the existing explicit **Save** action for the sharing change. Selecting a
   date, opening a calendar or previewing a period does not itself disclose it to
   the coach. Preserve still-authorized choices on validation errors. If authority
   changed, explain the safe current result without implying a denied widening
   succeeded.
5. After a known successful outcome, show the saved scope persistently where the
   missionary manages this coach. If the response is uncertain, reconcile the
   existing operation rather than claim either success or failure or create a
   duplicate share. D9's idempotency/current-authority rules remain in force.

Do not add a second confirmation wizard or per-period approval queue. A short
review can contain the important consequence without turning routine history
selection into a compliance exercise. Access expiry, broader financial rights
and private-history sharing remain separate.

### Coach: read context without an unrestricted report builder

Use one clear **Period** control within the admitted range and the existing
support-progress area. Show both boundaries in the readable period label; show
the source-qualified calendar/timezone context where needed to interpret them.
Use currency and metric labels already required by D9. Browsing a currently
admitted period is a read, not a new sharing mutation or a reason for routine
approval.

If several periods are admitted, a concise table or small trend can help, but a
chart is not required for usefulness. Its text/table alternative must use the
same admitted data and retain gaps. A line must not connect a hidden or unknown
point as if continuity were observed, and no zero should fill missing coverage.
Do not label a partial current period as comparable to a completed prior period
without qualification; avoid an automatic improvement/decline verdict.

Candidate state copy, contingent on what the recipient may know:

| Actual state                                      | Useful wording direction                                                                                 | Avoid                                                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Qualified current-source total for a prior period | **Gifts recorded for September 2026**; **Based on current records · updated [qualified time]**.          | “As it was on September 30” when no historical snapshot is qualified.                                      |
| Qualified dated expectation                       | **Expected in September 2026 — planned commitments**, with the source's exact temporal explanation.      | Treating current recurring amounts or monthly equivalents as the old plan.                                 |
| Qualified zero                                    | The actual zero, currency, period and basis.                                                             | “No effort,” “no supporters,” or “nothing happened.”                                                       |
| The admitted measure cannot be established        | **This summary is unavailable for the selected period.** Add only a safe, useful recovery explanation.   | A zero, a fabricated estimate, hidden donor counts or a claim that records do not exist.                   |
| Loading/retry                                     | A stable period heading and truthful loading/error state; retry the same authorized read.                | Showing the previous period's figure under the new period's heading.                                       |
| Current authority has narrowed                    | A safe unavailable state or removal of the no-longer-admitted view, consistent with the source boundary. | Restoring a cached value, requesting broad donor access, or revealing which private fact caused exclusion. |

### Accessibility and phone behavior

Reuse the installed shared components; no USWDS, Power BI or Google dependency
is proposed. Use visible labels and concise date guidance, logical keyboard
order, persistent errors associated with their controls and a clear focus return
from any date dialog. Test zoom, touch, keyboard and screen-reader behavior in
Core; no vendor checklist or isolated component pass establishes that result.

U1's caution about automatic submission applies particularly well to changes of
sharing scope. W1 also makes an important distinction: safely updating report
content in place does not necessarily change context. A coach period selector
may refresh its admitted result without an unnecessary second Apply click when
focus stays predictable, loading/result changes are conveyed appropriately and
the result is correctly bound to the selection. A sharing grant still requires
its explicit reviewed Save. This preserves clarity without inventing friction
as an accessibility requirement.

## 5. Material concerns in eight dimensions

Each concern records: **what/why; severity; likelihood; evidence; decision
impact; permanent fix; exact proposed clause; proof**. Likelihood is a qualitative
design judgment, not telemetry. Clauses are proposed review language, not an
independent owner amendment.

### R01 — Earlier-period eligibility becomes all-history access

- **What/why:** An enabled option, accepted invite or retained data could disclose
  every old period, unrelated old notes or newly elapsed periods.
- **Severity:** High.
- **Likelihood:** Plausible if a generic date filter is treated as authorization.
- **Evidence:** Q10/D8/D9 separate eligibility, exact grants and historical scope;
  H2 distinguishes asset access from source permissions.
- **Decision impact:** A needs deliberate bounded scope, not an automatic history
  migration. Coach raw-source rights remain unnecessary.
- **Permanent fix:** Resolve exact subject/module/period projection under current
  authority for reads and derivatives; keep reporting dates distinct from grant time.
- **Clause:** **Earlier-period eligibility SHALL add no historical access until
  the exact offered scope is deliberately saved within current source and tenant
  authority; it SHALL NOT disclose unrelated history or backdate a grant.**
- **Proof:** Invite/enable alone reveals nothing extra; previous coaching and
  revoked grants confer no history; a crafted outside-range request is denied.

### R02 — Old-period totals are mistaken for old knowledge

- **What/why:** A corrected September total can differ from what was displayed in
  September, while a graph labeled “historical” hides that distinction.
- **Severity:** High.
- **Likelihood:** Likely unless explicitly named in the source contract.
- **Evidence:** S1/S2 distinguish snapshot/trend capabilities; K1/K2 retain correction
  history independently; D9 fixes current effective received facts.
- **Decision impact:** Do not add a snapshot archive or claim one exists merely
  to offer prior periods.
- **Permanent fix:** Register the exact temporal meaning and currentness, separately
  from the represented interval; qualify any true past-state view independently.
- **Clause:** **A prior-period view SHALL state whether it uses current effective
  source facts or an independently qualified historical state; it SHALL NOT claim
  to reproduce a past display from current facts alone.**
- **Proof:** A later authorized correction changes the restated result and its
  provenance without being mislabeled as the value known at the earlier date.

### R03 — Today's commitments or goals rewrite the past

- **What/why:** Multiplying current recurring amounts backward fabricates earlier
  plans, especially after schedule edits, pause, cancellation or goal replacement.
- **Severity:** High.
- **Likelihood:** Plausible in a reused current-dashboard calculation.
- **Evidence:** D9/P16 source separation; K1 demonstrates adjustable schedules;
  S1 shows past-state reporting is a distinct capability.
- **Decision impact:** Historical expected support must be qualified per source,
  not enabled simply because received history is available.
- **Permanent fix:** Use the applicable source-owned temporal population and version;
  preserve unavailable states when it cannot be established.
- **Clause:** **Earlier expected-support values SHALL derive from the qualified
  P16 temporal meaning, not today's active commitments or an inferred old goal;
  each measure SHALL remain independently admissible and truthful.**
- **Proof:** Backdated edits, a new amount, ended/pending schedules and a replaced
  goal cannot fabricate past expectations or silently change comparison basis.

### R04 — Date labels select the wrong cohort

- **What/why:** Import/creation/refund date, a viewer timezone or a retry date can
  move facts into a more permissive interval and distort totals.
- **Severity:** High.
- **Likelihood:** Plausible with a generic reporting layer.
- **Evidence:** H1 separates date property/range; G1 date dimension determines
  membership; M1 documents explicit calendar conventions; D9 owns Core's basis.
- **Decision impact:** No arbitrary date-field selector or synthetic since-invite
  financial period.
- **Permanent fix:** Source-owned period boundaries and date precision; keep monetary
  attribution and effective corrections intact.
- **Clause:** **Period membership SHALL use the registered source date/calendar
  basis; importing, correcting or sharing an older fact SHALL NOT reclassify it
  into current scope merely by operation time.**
- **Proof:** Late imports, boundary dates, leap day, timezone/DST edges and a
  source-date correction match the qualified cohort without off-by-one leakage.

### R05 — A moving range silently changes the grant

- **What/why:** A relative label can add a new period, remove an old one or change
  at a different timezone boundary without the missionary understanding it.
- **Severity:** High.
- **Likelihood:** Likely if presets are stored without progression semantics.
- **Evidence:** G1/M1 explicitly distinguish fixed, rolling and calendar periods.
- **Decision impact:** Select and qualify the offered range behavior before
  activation; neither A nor a vendor default chooses it.
- **Permanent fix:** Bind the grant to a versioned range rule with reviewed resolved
  dates and any ongoing behavior; evaluate current permission at each rollover.
- **Clause:** **A fixed range SHALL remain fixed; any rolling or ongoing inclusion
  SHALL be explicitly described and authorized, including its anchor and rollover
  behavior. Data range SHALL NOT imply access lifetime.**
- **Proof:** Cross the next period boundary and change timezones without silent
  widening; fixed dates remain fixed while current-source corrections still apply.

### R06 — More observations reconstruct a protected gift

- **What/why:** Adjacent/overlapping ranges, corrections and prior releases can
  reveal a single contribution even when every individual screen is aggregate-only.
- **Severity:** High.
- **Likelihood:** Context dependent and plausible for small support populations.
- **Evidence:** D9's ICO-backed inference analysis and ratified combined-output
  floors; temporal arithmetic supplies synthetic counterexamples, not incidents.
- **Decision impact:** No arbitrary date-query builder or universal safe-count claim.
- **Permanent fix:** Qualify finite permitted outputs and combinations, including
  time changes, currencies, ratios, chart gaps and recipient knowledge.
- **Clause:** **Earlier-period release SHALL satisfy the existing combined-output
  disclosure contract across permitted periods, prior observations and corrections;
  suppressing names or meeting one cell-size threshold SHALL NOT be sufficient.**
- **Proof:** Attempt singleton, interval subtraction, rolling-delta, percentage
  and overlapping-subject reconstruction through UI and other reached outputs.

### R07 — Missing history becomes a zero or performance judgment

- **What/why:** Gaps caused by unavailable source history, limited coverage or
  permission can look like no giving or poor missionary effort.
- **Severity:** High.
- **Likelihood:** Likely with generic chart defaults.
- **Evidence:** D9 coverage/zero contracts; H2 documents partial/blank outcomes;
  C1 supports context but supplies no causal performance measure.
- **Decision impact:** History must improve understanding rather than add a misleading
  comparison or ranking.
- **Permanent fix:** Preserve qualified zero, unknown, partial and withheld states
  without leaking the reason for protected omissions; compare compatible coverage.
- **Clause:** **Missing, incomplete or withheld periods SHALL NOT become zero,
  connected chart continuity or an effort judgment; comparisons SHALL retain
  compatible source meaning, period coverage and currency.**
- **Proof:** Missing middle period, partial current period, known zero and private
  omission remain distinguishable only to the extent the recipient may know.

### R08 — The UI changes rights or context unexpectedly

- **What/why:** A calendar click could save disclosure, moving focus or trapping
  phone/keyboard users before they can understand the selected range.
- **Severity:** High for accidental disclosure; medium for navigation friction.
- **Likelihood:** Plausible with a reused automatically submitting filter.
- **Evidence:** U1/U2/W1; D9 already requires one deliberate sharing Save.
- **Decision impact:** Preserve simple browsing without conflating it with changing
  a grant or adding unnecessary confirmation steps.
- **Permanent fix:** Separate read controls from sharing mutation, expose exact dates,
  use predictable focus and test the real composed flow.
- **Clause:** **Changing a draft range SHALL NOT share it before reviewed Save;
  admitted-period browsing MAY update content predictably without a separate Apply
  step, but SHALL NOT move context unexpectedly or mislabel stale results.**
- **Proof:** Keyboard/mobile/screen-reader users can select, review, correct and
  cancel; an old response cannot appear under a newly selected period heading.

### R09 — Stored history outlives current authority through derivatives

- **What/why:** Browser caches, historical URLs, prepared chart data or later recovery
  could restore a removed scope or expose data after source restrictions change.
- **Severity:** High.
- **Likelihood:** Plausible across async loading and return visits.
- **Evidence:** D8/D9 current authority and release rules; H2 is supporting market
  evidence, not the implementation contract.
- **Decision impact:** A historical feature cannot imply grandfathered permission.
- **Permanent fix:** Fence release, invalidate/reconcile derivatives and preserve the
  canonical sharing operation's outcome under existing owners.
- **Clause:** **Each historical read or derivative release SHALL satisfy current
  effective authority; prior successful access, a saved URL or cached value SHALL
  NOT restore revoked history or broaden a changed grant.**
- **Proof:** Revocation during load, stale Save, lost response, rejoin and cache
  recovery do not leak or resurrect the previous range.

### R10 — Useful history becomes a second analytics system

- **What/why:** Arbitrary filters, exported snapshots and whole-history portfolio
  scans add cost, new privacy surfaces and divergent financial truth.
- **Severity:** Medium to high.
- **Likelihood:** Plausible if generic CRM reports are copied wholesale.
- **Evidence:** S1/S2 demonstrate separate snapshot costs/limits; B1/B2/V1 show broad
  reporting features beyond D10's narrow coach job.
- **Decision impact:** Full usefulness does not require every vendor report option.
- **Permanent fix:** Reuse exact source producers and existing coaching surfaces;
  qualify bounded reads and only the periods actually requested/admitted.
- **Clause:** **D10 SHALL reuse qualified source projections and bounded period
  reads; it SHALL NOT create a second ledger, unrestricted query builder, snapshot
  archive, export or cross-subject total by implication.**
- **Proof:** Supported range/portfolio workload meets measured product needs without
  fetching every subject's history; failures preserve source records and safe scope.

## 6. Evidence limits and review handoff

The strongest supported product finding is that temporal context is useful only
when the represented period, source meaning and access scope remain intelligible.
The cited vendors document several different history mechanisms; none proves
that a particular range model or length is optimal for Asym. Current public help
does not establish actual accessibility, deployed permissions, historical source
completeness or financial correctness in either Core or the vendors.

The concrete implementation proof remains unperformed: historical P16 source
reconstruction/meaning, effective P7/P13 dating corrections, current disclosure
under overlapping releases, range rollover, async revocation and the composed
phone/keyboard/screen-reader journey. Prior D9 SQL/math observations do not prove
these new history cases. The proposed proofs above are acceptance questions,
not reported passes.

A may proceed with a small qualified historical profile without introducing
extra dependencies, a routine approval queue, mandatory reporting, arbitrary
retention or a universal privacy threshold. The founder's selected eligibility
does not itself decide the exact range, ongoing behavior, historical state
semantics or access duration. Those remaining distinctions must be settled in
the parent review or their exact existing source owner before activation.
