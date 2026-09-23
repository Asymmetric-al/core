# D30 — The focused Support overview journey

**Fully founder-ratified, 13 September 2026. D30 and every adopted amendment are accepted; D1–D30 are fully ratified.** The appended ratification governs earlier answer-stage status. This remains feature grooming, not implementation or release proof.

**Historical opening (superseded status, preserved evidence):** **A selected, future full configuration intended; detailed amendments proposed, 13 September 2026.** The [R01–R32 decision](phase26-d30-adversarial-review.md) governs. This is a complete intended interaction blueprint, not a rendered prototype or tested claim of perfect usability. The product remains Support Hub within Asym.

## A useful starting place

A staff member reaches **Support → Reports → Overview**. Their ordinary work view remains directly accessible and their default landing is not changed. The page is available under actual current Support/report capabilities; no special “team lead” identity automatically grants data.

The fixed visual hierarchy is:

```text
Support / Reports
Overview                                             Refresh

WORK NOW                         Updated [time]
Currently handled in [All accessible inboxes v]

All unfinished       Unassigned          Replies needing attention
[N] conversations    [U] conversations    [R] conversations
Open / Waiting...    Part of unfinished  Overdue / Timing... / Untargeted...
View unfinished      View unassigned     View reply attention

Other work and review queues — all dates
Follow-ups · Delivery recovery · Intake review · Handoff review · Feedback review
[Only currently permitted owner destinations; independent of filters]

RESULTS FOR [Last 30 days v]   [actual dates]   Timezone [zone v]
Across the inboxes you can report on. Work now filters do not apply.

Reply targets                         Reply times
Targets due in [period]                Waits ended by staff reply in [period]
First / Next, assessed + uncertainty   First / Next, elapsed median/p90 + sample
View target report                    View reply-time report

Request labels                        Feedback
Current labels on conversations       Invitations issued in [period]
started in [period]                    Responses to that cohort as of [time]
Coverage + up to five labels           Rating counts + open-window context
View label report                     View feedback report
```

This is structural, not a frozen pixel grid. The bracketed permission explanation is a design annotation, not mandatory product copy. The actual review links are visually outside the Work now selector container and lead to independent owner queues. If a link is not authorized, omit it without hinting at hidden records. Do not add a union badge or make its data obey the nearby controls.

Desktop can use three restrained current summaries and two columns of historical panels. Mobile becomes one column in the same semantic order. The page uses existing Maia/Zinc tokens, spacing, typography and Base UI controls. Names and units carry meaning; colored tiles, decorative gauges, animated counters and a large “Support health” score do not.

## Morning work review

Illustrative scenario: Maya helps oversee donor care at a tenant supporting missionaries and projects. She is concerned that an older inquiry was missed. This tests the design; it is not an asserted universal ministry workflow.

1. **Open Overview.** Work now uses All accessible inboxes and the latest qualified result. It makes no claim about inboxes Maya cannot access. Loading values are placeholders with an accessible busy state, not zero.
2. **Narrow current work if useful.** Maya chooses Donor care under Currently handled in. Only Work now changes. The Results caption remains visible and unchanged. A missing, forbidden or no-longer-qualified selected inbox asks for a deliberate replacement rather than switching to All or returning an empty healthy count.
3. **Understand the summaries.** All unfinished includes Open and both Waiting states, including future-deferred Open. Its state breakdown explains that not every unfinished request needs immediate action. Unassigned is a subset, not additional volume. Reply attention deduplicates conversations with still-owed replies, with explicit overlapping source groups. An inbox marked Retired can still show owner-qualified retained work; retirement alone neither removes that work nor grants access.
4. **Open the concern.** View reply attention opens that exact current conversation-level predicate, not a “created recently” list. The older inquiry remains discoverable regardless of the Results period. Each conversation opens its actual permitted underlying periods and normal detail.
5. **Handle the real work.** Normal assignment, reply, assistance, reminder and ending actions remain in their owners. The overview does not claim a request, mark a review read, send a message or resolve a task by being opened.
6. **Return without reconstructing context.** Back restores safe controls, scroll and focus; a new evaluation is labelled if the data changed. A preserved report context never preserves revoked transcript/CRM authority.

Existing source-owned due follow-up and actionable delivery recovery remain directly discoverable through those named destinations; they are not new queues or a union badge. A fulfilled reply can leave reply attention while a later actionable delivery failure needs recovery. Zero current reply-attention never certifies that these other obligations are complete.

Feedback, intake and handoff review can be relevant even when a period preview has no data or feedback is Off. The separate all-date links preserve those existing journeys without introducing another queue or a new combined alert concept.

## Reviewing a period

Maya selects Last 30 days, sees the actual date range and timezone, and understands that today's interval is still in progress. Presets apply once. Custom allows 1–366 local calendar dates with a deliberate Apply and rejects future-ending/invalid ranges inline; the prior valid results keep their prior label until a valid request starts. For a longer analysis, the relevant full report supplies its own qualified range support.

The four sections cover each report's authorized population, including retired-source references where the owner preserves meaningful current report access. Today's active-inbox catalog must not erase historical populations. They intentionally do not pretend the Now inbox is an equivalent historical dimension. This costs one extra step when Maya needs a specialized inbox-specific historical review: **View full report**, then use its source-appropriate filter. It avoids multiple competing selectors and misleading numbers on the common starting page.

**Reply targets** separates First and Next and shows the accepted due cohort, assessed ratio, finalized coverage, unknown/potential cases and exclusions. A small summary cannot hide those facts behind a tooltip. If there are no due targets, say so; a policy currently Off does not erase old results.

**Reply times** labels elapsed time and completed waiting periods. For each First/Next sample, show median, p90 and measured count, with the existing timing/cohort exclusion summary. One reply can end several waits. Service-hours detail remains available in the full report. Do not call the number effort, resolution speed or recipient satisfaction.

**Request labels** explicitly reports current labels on the component-first conversation-start cohort. Show total/labelled/unlabelled coverage and up to five leading labels with counts and N-based percentages. A small horizontal table/bar comparison is suitable; a pie is not, because memberships overlap. Archived applied terms remain labelled where permitted. Show Start date unconfirmed and unavailable metadata according to the existing owner instead of quietly dropping them into complete totals.

**Feedback** shows invitations issued in the period and responses to those same invitations as of evaluation. A reply arriving this week to an older invitation does not enter this week's issued-cohort numerator. Include current open response-window context and rating sample/coverage. Comments, personal names and case details stay in the authorized full report/detail. Feedback Off leaves historical data visible; it simply stops new policy work under D28.

Clicking a number opens its exact native-grain detail. Clicking **View full report** navigates more generally with period/zone only. This distinction prevents a target count from pretending to be a conversation count or silently applying the current-work inbox.

## CRM continuity

From a result, the staff member opens the same canonical Support conversation available from CRM Communications → Support. Current Support/source and relevant CRM/field permissions govern context in both directions. No duplicated contact/customer record, raw email-to-Party identity claim, copied activity or new last-contact timestamp is created.

If the staff member cannot view the linked giving/care record, the report does not reveal it through a count, subject, hidden-row badge or preview. A refund, receipt, recurring-gift or contact change remains the owning domain's actual command, with its validation, approvals and audit. Returning preserves safe navigation, not an authorization grant.

## States and recovery

| State                           | What the person sees and can do                                                                                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading                         | Stable section structure and named busy state; no fabricated zero/100% or focus movement.                                                                                     |
| Complete zero/no sample         | Accurate empty wording with the selected dates/scope; no percentage where the denominator is zero.                                                                            |
| Current policy Off with history | Retained qualified historical numbers plus a quiet current-setting indicator; normal report/review access remains.                                                            |
| Off with no history             | Explain that there are no measured records for the cohort and the relevant policy is Off; Manage appears only when authorized.                                                |
| Unknown/incomplete evidence     | Show the qualified unknown/coverage meaning, or block an exact total when its owner cannot supply one. Do not score unknowns or call partial data complete.                   |
| One source failed               | That section offers Retry and an honest unavailable state; other sections and ordinary work remain usable.                                                                    |
| Now refresh delayed             | Updated time remains visible; after 120 seconds without a current qualified read, show Out of date. Cached values require continuing authority; otherwise clear them.         |
| Offline/hidden tab              | Automatic refresh pauses. Retain only qualified local information under existing policy; do not issue offline actions or catch-up polling storms.                             |
| Context changed/revoked         | Discard late old results; clear forbidden data; keep only safe controls/return paths. A removed selected inbox is not silently All.                                           |
| Detail differs after click      | Show the exact original safe evaluation if supported, or explicitly Updated since overview after current reevaluation. Do not use an old timestamp as fake historical replay. |

Refresh re-reads the current contexts. Now may update once per minute while visible/online; historical results are not recalculated on every Now poll. Updates do not steal focus, animate through values or announce every number. Meaningful user-triggered completion/error announcements remain available.

## Maintenance and future configurability

There is no Create dashboard, compulsory setup wizard, layout save or inactive Configure button. Authorized Manage links go to the actual inbox/target/label/feedback owner. They do not create another editor or settings copy. Product maintainers own the fixed composition's reviewed release and keep old deep links either qualified or clearly unavailable rather than exposing a second version of the truth.

The future direction is fully configurable composition through shared reporting. Prepare by keeping stable owner-qualified block/read/detail contracts, metric definitions and presentation separate. Do not create layout tables, a registry UI, widget scripting, custom formulas or a general builder now. Later configuration must have a complete ownership/save/share/reset/migration/permission journey and may bind only compatible source scopes. This avoids repainting the current UI around an unnecessary unfinished platform.

## Accessibility and proof

Use native semantics and existing Base UI controls, visible focus, labelled dates/timezone/scope, predictable heading and keyboard order, tables with correct headers and text alternatives for every plotted value. Preserve full meaningful long names via accessible wrapping/details, not hover-only truncation. Test named screen readers, keyboard, 200% zoom, 320-CSS-pixel reflow, touch, long translations, RTL/bidi, locale formatting, reduced motion and low bandwidth. Preserve the established shared motion/touch tokens rather than adding another design system.

The main [P01–P48](phase26-d30-adversarial-review.md) defines the release outcomes. Moderated tests must establish that staff understand the two independent scopes, find an older owed request, interpret samples/Off correctly and return from detail/CRM without repeated entry. No rendered prototype, automated accessibility result or actual Asym usability study has been performed in this grooming stage.

## Full founder ratification — 13 September 2026

The founder explicitly ratifies **D30 A — A focused Support overview**, including every amendment, addition, adjustment, change and update in **D30-R01–R32**; all **23 individual adversarial categories**, findings, consequences, severity/likelihood assessments and permanent fixes; the complete staff/lead/maintainer/CRM and accessible mobile UX; all metric, source, Supabase/RLS, authorization, privacy, evaluation, failure, lifecycle, concurrency, performance and migration contracts; all independent final corrections; **four glossary terms**; **P01–P48** required release proof groups; and **O01–O06** operating controls with named signals, thresholds, owners and responses. **D1–D30 and every adopted amendment are fully ratified.** Earlier proposed/pending/no-next-question wording, including D30-R32's answer-stage status, is historical and creates no remaining ratification gate.

The accepted fixed composition is three Work now summaries in distinct current conversations—All unfinished, Unassigned and Replies needing attention—and four period sections—Reply targets, Reply times, Request labels and Feedback. Work now alone uses Currently handled in; Results retains period/timezone and each report's authorized population without a misleading global Inbox predicate. Exact D14 target/wait/coverage/time, D21 component-first current-label and D28 issued-cohort/response meanings remain mandatory. Off cannot erase history; retirement alone cannot hide still-owner-qualified work/history or grant new access. Existing D3 follow-up/actionable delivery recovery and independent intake/handoff/feedback review remain directly discoverable even after a reply is fulfilled or an old timer field is cleared.

Five leading labels, four period presets, 1–366 inclusive local calendar dates, Last 30 days including today as the initial period, explicit reporting zone and current partial interval, a 60-second foreground Now refresh and 120-second stale indication are fully accepted as documented product/interaction bounds. Their exact source/authorization/evaluation conditions remain mandatory; they are not retention or security leases. The explicit 100,000-conversation / 1,000,000-source-event / 100,000-feedback-opportunity / 100-viewer fixture and p95 two-second Now / four-second Results targets remain prospective release proof under recorded conditions, not measured capacity claims.

**Future full configurability is fully ratified as product direction; the current fixed release and its boundary are also fully ratified.** Stable code-owned block/definition/read/detail contracts preserve a future path through qualified Phase 33 shared reporting. No layout database, drag editor, semantic DSL, arbitrary formula engine, hidden Configure control or competing Support reporting platform is part of this release. Future composition must complete its own ownership/save/share/reset/compatibility/privacy/accessibility contract and cannot change metric authority or grant underlying data. Phase 33 is intended shared ownership, not claimed shipped, and the focused overview does not wait for the entire future reporting product.

**Email Studio's seam and role are fully ratified.** Viewing, filtering, refreshing and navigating Overview send or prepare no email, start no schedule, mark no review complete and mutate no Support, CRM, target, label or feedback fact. D13/D28/D29 message families, ordinary human replies, signatures and governed Tiptap authoring remain unchanged. Any later separately authorized scheduled report belongs to Phase 33 for schedule/run/snapshot and per-recipient source eligibility; Email Studio/P17 owns governed wording, preparation and immutable material; P6 owns dispatch, outcome, reconciliation and history. Viewing or exporting a permitted report is not authority to email another person. No management digest or new message profile is added by D30.

Source-qualified server projections, current authorization before counts/cache/detail, coherent per-block evaluation, exact native-grain drilldown, honest current re-evaluation, finite source-derived custody and the same canonical Support detail through CRM are all accepted. Current report scaffolding and raw client aggregation do not become correct merely through ratification. No duplicated Party, Activity, last-contact update, financial outcome or care permission is inferred from a metric.

Ratification accepts the complete documented contract and proof obligations. Five actual pinned pure-source observations with synthetic inputs reproduce legacy helper behavior; they do not prove the new runtime, database/RLS, concurrency, provider, browser, accessibility, usability or performance. All 48 actual release groups remain required and unexecuted. Original source/experiment/validation evidence is preserved. Continue the grill with one researched unresolved question; no formal specification, implementation, tickets, GitHub/provider/DNS/inbox/database mutation or real messages are authorized by this recording.
