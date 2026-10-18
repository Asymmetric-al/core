# D9 — current support-summary data, arithmetic and disclosure evidence

Research only, 2026-10-16 UTC. Scope: optional organization-permitted coach summaries of expected support and support received, alongside deliberately shared goals. This note does not select additional financial fields, history windows, filters, notifications or default inclusion, and does not ratify the aggregate decision. No application, database, account, message or dependency was changed.

## Conclusion

The current missionary dashboard is not a qualified D9 summary producer. It combines two different paths: a broad portal snapshot with cached funding fields and capped receipt lists, and a separate metrics endpoint that returns individual donation rows for browser aggregation. There are concrete unit, currency, period, coverage and privacy gaps. The existing commitment detail is not an expected-support aggregate and cannot fill the gap by summing a donor's records.

The [actual-source probe](math-probe/README.md) ran nine checks against unchanged repository model/redaction/presenter modules. **9/9 assertions passed**, confirming current behaviors, including defects. This is not a passing D9 acceptance suite. The API-to-JSX amount-unit defect and date/coverage findings below are separately traced static source evidence; no hosted data, HTTP pipeline or browser execution is claimed. The [D8 auth evidence](../d8-evidence/current-runtime.md) remains applicable and was not re-executed.

## Exact source map and owner limits

| Source                                                                                                               | Inspected relevant sections                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/missionary/app/page.tsx`                                                                                       | `1–14`: actual dashboard mounts `DashboardHome`.                                                                                                                                                                                                                        |
| `packages/missionary/components/dashboard-home.tsx`                                                                  | `41–46` support dollar formatting; `65–119` portal loading/error; `130–153` separate metric tiles/chart; `187–224` profile/demo subject resolution; `244–281` Monthly Support Goal display; `391–468` local Tasks & Alerts.                                             |
| `packages/api/src/missionary-portal/index.ts` and `service.ts`                                                       | Route `7–18`: own authenticated profile/Tenant, missionary role. Service `27–95` selected fields; `159–184` exact own missionary lookup; `194–232` capped gift/donor/task/post queries; `234–249` snapshot materialization.                                             |
| `packages/api/src/missionary-portal/model.ts`                                                                        | `9–13` settled status aliases; `26–53,129–137` source and output types; `227–250` amount/currency/date/type mapping; `298–420` actual summary and detail builder.                                                                                                       |
| `packages/api/src/missionary-portal/redaction.ts`                                                                    | `38–46` default anonymity; `72–98` retained financial detail and gift donor-ID redaction.                                                                                                                                                                               |
| `packages/missionary/components/dashboard-view.ts`                                                                   | `46–63` goal/remaining presenter; `73–104` local task/donor-count alerts, no delivery command.                                                                                                                                                                          |
| `packages/api/src/missionaries/metrics.ts`                                                                           | `172–244` auth and subject checks; `197` service client preference; `246–279` raw-row query/response and permission-limited result. Thin app route is `apps/missionary/app/api/missionaries/[id]/metrics/route.ts:1`.                                                   |
| `packages/lib/hooks/use-donation-metrics.ts`                                                                         | `40–46` raw shape; `51–127` day/month math; `144–158` zero-baseline change; `167–228` fetch/limited/error/cancellation; `230–290` period bounds, totals and comparisons.                                                                                                |
| `packages/missionary/components/metric-tiles.tsx` and `giving-breakdown-chart.tsx`                                   | Tiles `100–104,116–155` dollar formatting and displayed totals; chart `39–77` claimed 13-month trend and actual hook.                                                                                                                                                   |
| `packages/api/src/missionary-portal/donors.ts`                                                                       | `308–322` pledge mapping; `346–354` donor-only pledge grouping; `436–452,490–549` paginated donor details and related-row cap/query; `566–594` response and auth.                                                                                                       |
| `apps/missionary/app/donors/donors-page-detail-recurring.tsx` and `donors-model.tsx`                                 | Recurring `78–82,185–192` expected/paid display; formatter `23–27,114–117` treats raw numeric value as USD major units.                                                                                                                                                 |
| `packages/api/src/reads/missionary-metrics.ts` and `dashboard-stats.ts`                                              | Metrics `85–153,192–220`: cached server alternative, raw totals/series; dashboard stats `75–84,127–137`: tenant raw monthly sum. Search found the former called by its tests only, not by the dashboard chart; do not confuse it with the live metrics route.           |
| `packages/api/src/donate/index.ts`, `begin-gift-intake.ts`, `payment-intent.ts`                                      | Intake `98–119`: charged minor units; RPC adapter `65–76`: unchanged `p_amount`; provider request `77–80,129–132`: explicitly minor units. These were read, not executed.                                                                                               |
| `supabase/migrations/20260214090000_foundation_1_schema.sql` and `20260820001000_begin_donation_saga_fee_extras.sql` | Foundation `460–470,511–524`: stored monetary integers; current saga `14–25,112–131`: BIGINT argument stored unchanged.                                                                                                                                                 |
| `packages/api/src/stripe/refunds.ts`                                                                                 | `120–125,162–176`: absolute refund amount, original amount preserved; only a full refund changes status to `refunded`.                                                                                                                                                  |
| `supabase/config.toml` and canonical RLS migration                                                                   | Config `16–18`: checked-in Data API `max_rows=1000`; `20260625002117_canonical_tanstack_db_realtime_rls.sql:184–209`: donation own/staff reads, no bounded coach-summary rule. This is migration/config source, not deployed proof.                                     |
| `supabase/migrations/20261005050728_field_policy_foundation.sql`                                                     | `760–769`: funding/current-funding fields classified financial with surface defaults; no coach context is present in these rows. No field-policy enforcement call was found in the inspected portal/metrics read paths. Registry existence is not enforcement evidence. |

Relevant owner contracts, inspected directly: P16 `phase-16-pledges-recurring-commitments.md:1097–1126` fixes tenant giving-timezone periods, Received from P13's effective ledger fold, dated occurrences versus exact-rational monthly equivalents, and exclusion of fixed-total pledges from sustaining coverage. P13 `phase-13-campaign-designation-contribution-ledger-giving-cart.md:2022–2029` requires effective correction facts and currency-branded integer minor units, explicitly rejecting hardcoded `/100`. P14 `phase-14-donor-credit-operations.md:2147–2159` scopes identity, counts and amounts before enumeration/arithmetic. P21 `phase-21-field-accounts.md:3008–3014` requires authorization before arithmetic/cache/alert eligibility and disallows personal presentation changing financial meaning. These targets are not claims of current runtime completion.

## Findings, amendment candidates and proof

### MR01 — The live chart's USD path has a 100× unit mismatch

**High impact; deterministic for a normal USD minor-unit row through the inspected path. Static wiring proof, not a deployed incident.** The stored/write convention is explicit: foundation SQL changes `donations.amount` to BIGINT by multiplying legacy dollars by 100 (`460–462`); current intake uses `feeQuote.chargedAmountCents` and passes it unchanged into `begin_donation_saga`; the latest inspected saga inserts `p_amount` unchanged (`20260820001000…sql:112–131`). The metrics endpoint selects `amount` and returns `data` without transformation (`metrics.ts:249–275`). The hook sums `Number(d.amount)` unchanged (`use-donation-metrics.ts:254–260`), then `MetricTiles` formats the resulting number as dollars (`metric-tiles.tsx:100–104,130–153`). No intermediate converter exists along this inspected wiring.

Thus a completed USD row with `amount=10000` is summed as `10000` and formatted `$10k`, although its minor-unit value is USD 100. This numeric example is deduced from the exact code, not from executing the endpoint/hook/JSX or observing production data. The separate portal card divides its cents by 100, so two visible dashboard sections can disagree by 100× even before their period/source differences.

**Clause:** “Every D9 amount preserves source integer minor units and explicit ISO currency through the complete projection contract. The shared currency-aware formatter is the only display converter. No amount is relabeled as dollars, divided by 100 without the currency exponent, or fed to a second unit convention.”

**Proof:** Run source write → qualified read → returned DTO → actual rendered accessible text for USD, JPY and an allowed three-decimal currency. Compare exactly to canonical source facts, not fixtures already expressed as UI dollars. Include both overview and detailed/print/preview representations if independently selected. The existing hook tests pass synthetic amounts directly and do not establish this end-to-end units seam.

### MR02 — Portal totals merge currencies, and detail defaults unknown currency to USD

**High impact; observed helper behavior, occurrence depends on admitted data.** The portal has `currency` on each gift, but none on its support aggregate (`model.ts:129–137,317–332,357–397`). It sums mixed minor units directly. `normalizeCurrency` defaults missing data to USD and `centsToDollars` divides all currencies by 100 (`227–232`). The live metrics endpoint does not select currency at all. The actual-source probe confirms USD 10000 + EUR 20000 becomes one `raisedCents=30000`, missing currency becomes USD, and JPY 10000 becomes `amount=100` while retaining JPY.

**Clause:** “Preserve separate currency lanes for every expected, received and goal measure. Unknown currency is unavailable or needs source repair, never assumed USD. A ratio or comparison requires compatible source currency, basis and period. D9 creates no FX conversion authority.”

**Proof:** Mixed currency, absent/invalid currency and different exponent fixtures must remain separate or unavailable. Verify labels and exports cannot silently drop currency. This review does not claim a live non-USD row was observed or that every current intake supports it.

### MR03 — ‘Recurring monthly’ is historical receipts, not expected recurring support

**High impact; observed helper behavior.** `recurringMonthlyCents` adds every settled recurring gift returned by the capped query, without a month filter, recurrence cadence, current commitment status, version or occurrence (`model.ts:357–359`). Two receipts from January and September each for 10000 produce 20000. The current dashboard presenter does not display this field; its misleading semantics remain in the API DTO and make it unsafe to reuse for D9 expected support.

The portal does not query commitments or P16 occurrences. Source P16 distinguishes actual Received, dated online recurring occurrences, exact-rational planning equivalents and fixed-total expectations. Receipt history proves none of the latter by itself.

**Clause:** “Expected support is a qualified P16 projection of the chosen expectation/planning meaning; received support is a separate P13 effective-fact projection. A recurring payment flag, historical receipts, provider subscription status or total promised amount cannot substitute for a current dated expectation or sustaining planning amount.”

**Proof:** Weekly/twice-monthly/four-weekly/monthly/annual cadence; paused, skipped, ended and future-start plans; failed and processing occurrences; late retry for a prior month; fixed-total pledge; amendment and partial fulfillment. Preserve dated period versus monthly-equivalent semantics. There is no new P28 commitment engine.

### MR04 — Stored funding defaults and capped receipt lists do not establish a monthly goal numerator

**High impact; observed fallback behavior plus static source gap.** `current_funding` wins whenever non-null, including zero; only null uses receipt sums. The actual-source probe returns raised zero alongside one settled 10000 receipt. The checked-in schema defaults current funding to zero (`20260214090000…sql:523–524`). The dashboard labels the result “Monthly Support Goal” (`dashboard-home.tsx:247–255`), but the goal/current-funding shape has no currency, period, source cutoff or governed meaning. The fallback receipt query has no period filter and caps at 250.

Searches for `current_funding` in `supabase/migrations` and `packages/api/src` found schema/defaults, policy declarations and reads but no qualified receipt-driven updater. This is a bounded negative source search, not a claim that no external/manual updater exists anywhere. The missing reconciliation/meaning remains unproved. Missing funding/goal values become numeric zeros with no coverage/as-of state in the pure model.

**Clause:** “A goal and each numerator retain their independently owned meaning, scope, currency, period and source version. Goal presence does not make a receipt total monthly or an expectation received. Use unavailable/not managed/partial/stale states where source qualification or completeness is absent; only a known complete zero is zero.”

**Proof:** Stored zero/nonzero/null versus new/corrected receipts; no configured goal; no source coverage; different goal periods; concurrently changed goal/source; independently withheld numerator or denominator. No default field value may masquerade as current ledger truth.

### MR05 — Refunds, fee cover and corrections cannot be reduced to row status

**High impact; static writer/read mismatch and observed helper behavior.** Portal and metrics select gross `amount`, not refund facts or canonical effective allocations. The actual refund writer records a partial `refund_amount` but retains completed status (`refunds.ts:162–169`); only full refund changes status. The portal probe counts the full original 10000 for a row carrying a 4000 refund, while excluding a fully refunded row. This demonstrates ignored input; no webhook/database execution was performed.

Current intake also stores `feeQuote.chargedAmountCents` (`donate/index.ts:98–119`), so a raw payment amount may include optional fee cover. Neither a gross charge nor the legacy mutable status fold establishes support designated to the exact coaching subject. Returns, disputes, corrections, reallocations and recognition are not modeled by the summary builder.

**Clause:** “Received uses the qualified P13 effective support facts for the exact designation, period and currency, including the source's inverse/correction consequences. It does not equate gross charged amount, payment status, fee cover, recognition or a legacy balance counter with received support. D9 never creates a parallel refund or ledger fold.”

**Proof:** Partial/full refund, chargeback/return/NSF, fee-cover charge, split designation, correction and re-designation; reconcile the displayed result to one exact source cutoff. Explain processing or unsettled facts without counting them as Received. The current app's gross/net business policy is not silently selected by this review.

### MR06 — Counts and totals have incomplete, inconsistent coverage

**High impact; explicit source caps, hosted incidence unverified.** The portal retrieves at most 250 donation rows before in-memory settled filtering and at most 250 donors (`service.ts:194–212`). Therefore failed/pending rows can consume the slice, and `giftCount`, active donor count and fallback sums are slice results without a completeness marker. They are not full subject totals. The live metric query returns ascending raw rows without pagination or exact aggregate (`metrics.ts:249–254`); checked-in `max_rows=1000` may truncate a sufficiently large result. Hosted configuration was not inspected, so actual truncation there is unverified.

The alternate cached server reader likewise sums fetched rows, omits currency and lacks a coverage contract (`reads/missionary-metrics.ts:139–152,192–220`). It is not a safe shortcut; inspected call-site search found only its tests. Tenant `dashboard-stats.ts` is a broader administrative aggregate, not a coach-subject summary.

**Clause:** “D9 numbers come from source-qualified complete aggregation for the exact authorized scope and cutoff. A page, default row cap, filtered subset or partial projection cannot be presented as a full total. Coverage and freshness remain explicit through cache and UI.”

**Proof:** 249/250/251 and 999/1000/1001 rows; many pending rows before settled rows; partial source availability; paging failures; late postings and concurrent correction; field-floor exclusion. Verify full aggregation before only the permitted result is released. Do not solve completeness by sending raw rows to the coach browser.

### MR07 — Chart date boundaries and comparisons are not governed support periods

**High impact; concrete static arithmetic risks, no timezone/browser run.** Hook period construction uses the browser's local `getFullYear()/getMonth()` and local-midnight `new Date(year, month, day)` (`use-donation-metrics.ts:231–251`). Its month-end is the last day at 00:00, while the filter uses `<= end` (`254–258`): a gift at noon on the final local day is omitted from the total. Daily keys and monthly keys then use UTC ISO strings (`60,68,93–101`), mixing local boundaries with UTC grouping; in positive offsets, a locally constructed month's first midnight can map to the preceding UTC month. These statements follow from the code; no executed timezone matrix is claimed.

The API returns only a rolling 13-month interval (`metrics.ts:246–254`), but the hook computes prior-year YTD from January 1 of the previous year (`246–270`). In October that source interval cannot contain the previous January–August needed for the comparator. The hook also compares partial current month to all of last month and fabricates 100% change from a zero baseline (`144–158,268–270`). Those may be deliberate UI conventions elsewhere, but they are not a qualified D9 comparison contract. The current hook reads `created_at`, while portal gift display prefers `gift_date`; neither proves the source's financial effective date.

**Clause:** “Each D9 period and comparison uses the source-governed giving timezone, effective-date meaning and explicit compatible bounds. Use half-open complete period boundaries and qualified comparison coverage. No percent change is fabricated from an unavailable/zero denominator, partial prior data or incompatible period.”

**Proof:** Last-day noon and last-millisecond, first-day boundary, DST and UTC±offsets, leap day, late/backdated receipt, incomplete current period, early/late-year YTD and zero baseline. Verify actual hook/API/summary output and accessible labels with a controlled clock, not only a copied date expression.

### MR08 — Goal percentages and receipt status semantics disagree between paths

**Medium–high impact; observed model behavior and static client contrast.** Portal numeric percentage is capped at 100 (`model.ts:364–366`), so 15000 against a 10000 goal becomes 100%, not merely a visually bounded bar. The actual presenter repeats that value and sets remaining to zero. Current component tests allow 150% inputs, but that does not prove the real model sends 150%.

Portal recognizes completed/succeeded/success (`model.ts:9–13`), while the hook counts only exact completed (`use-donation-metrics.ts:67,99,258`). The probe verifies the former aliases. This is another reason the two dashboard sections need not agree, not permission to pick a new financial status rule in P28.

**Clause:** “The source supplies qualified effective inclusion and numeric meaning consistently. A bounded progress-bar width does not cap, normalize or rewrite a truthful number; under/over-goal explanation remains accurate. UI adapters cannot invent settled states.”

**Proof:** Overfunded and zero-goal values, any source-permitted negative correction presentation, all admitted payment/effective states and consistent drilldown-free summaries. Source owners decide whether the chosen measure is gross, net, dated or planning; the coach UI explains it.

### MR09 — Existing commitment detail is not a subject-safe expected-support source

**High privacy/accuracy impact; plausible under reuse.** Donor-detail reads fetch same-Tenant pledges for the current donor page with a 2000 related-row cap but no `missionary_id`/designation restriction and no currency (`donors.ts:543–549`). The builder groups every returned pledge only by donor (`346–354`), and maps frequency/status/paid/expected totals directly (`308–322`). Source rows carry a missionary ID but this grouping does not use it. This is concrete missing scope in the inspected query/builder; whether a donor has pledges for several subjects in deployed data was not inspected.

The recurring detail UI labels those raw values expected/paid and formats them as USD major units (`donors-page-detail-recurring.tsx:185–192`; `donors-model.tsx:23–27,114–117`), despite the foundation migration storing integer monetary units. These are donor-level pages, not D9's anonymous aggregate or P16 occurrence/planning projection.

**Clause:** “Expected-support aggregation resolves exact source subject/designation and authorized currency/period before enumeration and arithmetic. Donor identity, CRM primary assignment, a donor's entire pledge list and total-expected counters cannot infer the coach's scope or future expectation.”

**Proof:** One donor supports two missionaries and a fund, a split/re-designated commitment, anonymous donor, ended/paused/future plan, mixed currency, fixed-total pledge, more than one source page. No cross-subject pledge or individual commitment appears in the coach response. This does not authorize exposing donor details to solve summary reconciliation.

### MR10 — The raw metrics and portal routes are not summary-only authorization seams

**Critical disclosure impact if reused for coaches; no existing coach leak claimed.** Current metrics auth checks staff/admin/missionary/superadmin, resolves missionary metadata, then allows any same-Tenant subject to staff and only own subject to missionary-only callers (`metrics.ts:172–244`). It prefers a service client (`197`). It returns individual donation IDs, exact amounts, timestamps, types and statuses (`249–275`), not just summary values. The donation query has no explicit Tenant predicate and relies on the prior subject lookup/data integrity; this is a future exact-scope proof obligation, not a demonstrated cross-Tenant exploit.

The broad portal response also contains donor relationships, recent gifts and tasks. Its anonymous-donor set is built only from loaded donor rows; the actual probe confirms a gift whose donor was not loaded retains donorId (`model.ts:306–331`). The comment states per-gift anonymity is not yet selected. A server redaction helper exists, but this incomplete input cannot establish a coach-safe summary, particularly with independent query caps. D8's current role/context/cache gaps remain open for implementation; no auth probe was repeated.

**Clause:** “D9 releases only the independently authorized summary projection after current P12/source/privacy/inference checks, including history floor and source scope. Granting the summary does not grant its input rows or other missionary/staff surfaces. No donor/gift/commitment IDs, amounts, timestamps, contact details or private source payloads are sent as hidden chart data.”

**Proof:** Inspect network JSON, caches, realtime, errors, logs, clipboard and any separately chosen export—not only rendered cards. Check omitted donor rows and per-gift restrictions, small groups/differencing, revoked grants, internal coach with broader staff powers and another Tenant/subject. The P10 field-policy registry alone is not proof of this enforcement.

### MR11 — Successful empty and denied/unavailable states already have one useful distinction

**High consequence if lost during reuse; positive source evidence with remaining gaps.** The live metrics route returns `{donations:[], limited:true}` for a detected permission error (`metrics.ts:256–263`), and the hook converts that to unavailable (`use-donation-metrics.ts:205–207`). Existing tests cover permission-limited versus successful empty data (`tests/unit/packages/lib/use-donation-metrics.test.tsx:54–97`). The hook also aborts obsolete requests (`224–227`), and later tests exercise stale responses. Preserve these protections; do not claim all existing errors silently become zero.

However successful empty results, partial caps, missing currency, stale cached counter and unknown financial coverage lack a complete source-state contract. Dashboard auth subject resolution uses a demo ID while auth is loading or missing (`dashboard-home.tsx:187–201`); current server checks still apply. A future coach module must wait for an exact current subject rather than treating that fallback as an authorized context.

**Clause:** “Keep denied, unavailable, not managed, partial, stale and complete-empty source states distinct wherever they affect financial meaning. Never infer a subject or display sample financial data during context resolution. Existing cancel/error behavior is retained and extended through the exact authorization/source version.”

**Proof:** Error, withheld module, successful empty, known complete zero, capped/incomplete data, refreshed policy, auth loading, subject switch and delayed response. A current empty display is not proof of future grant revocation.

### MR12 — Viewing a support summary does not create a support alert or communication

**High privacy risk if broadened; no current send producer found in this read path.** `dashboard-view.ts:87–101` makes local presentation alerts from pending tasks and donor count; `dashboard-home.tsx:391–468` displays them. Searching the inspected portal/metrics/hook/dashboard paths for notification/send/outbox/dispatch calls found none. These display objects are not P6 intents or proof of a notification subscription.

**Clause:** “D9 sharing makes only the selected, currently authorized summary available in the coach view. A changed amount, missed target, first view or refreshed summary neither sends a notice nor creates a task or performance inference. Any later message needs a separately selected source meaning, recipient preference/authority, minimum eligible content and P6/P17 delivery contract.”

P17 `phase-17-system-messages-template-management.md:3894–3908` keeps source meaning/preference, recipient projection and delivery separate; coach status is not notification authority. P6 retains complete bounded occurrence compilation, source fences, final disclosure safety and honest outcomes. No broad coach email, automatic fundraising warning, digest, balance alert or raw-number delivery copy is introduced by optional summary eligibility.

**Proof:** Enable/disable summary, change/correct a source amount, refresh or revoke access, replay a read and cross a goal threshold: no unselected intent, provider call, task or notification is created. If another independently qualified source already sends notices, D9 does not alter its permissions, consent, history or subscription.

## Verification and unresolved proof

The actual-source probe is saved with exact code, stdout, UTC timestamp and SHA-256 provenance in [math-probe](math-probe/README.md). It imported the real model, real redaction module and real dashboard presenter. Its sole Node resolver adjustment adds `.ts` for the model's extensionless sibling import. No business code or export was copied or mocked. It asserts nine observed cases: mixed currencies; recurring receipts from separate months; stored-zero precedence; capped percentage; missing-to-zero; ignored partial refund/full-refund exclusion; unloaded donor ID; default USD/JPY conversion; and settled status aliases.

Read existing model/redaction, dashboard presentation and metrics-hook tests; they establish useful prior test intentions, not D9 readiness. No Vitest suite, browser, database/SQL, hosted RLS, HTTP/auth, React-hook calculation, provider or communication pipeline was executed in this D9 pass. The raw-amount 100× display path, date/timezone boundaries and query caps are static source findings with explicit acceptance tests above. No production loss, privacy incident, data volume, deployed configuration or measured financial dataset is asserted.

All remediation clauses are review candidates for the existing P13/P16/P12/P10/P21/P28 owners. They do not add another ledger, forecast engine, private data store, identity system or message sender. The qualified received and expected producer seams, exact bounded history/filters, coherent source cutoff and inference-safe disclosure must be proved before offering the selected optional module; this note does not turn every entire upstream phase into a blanket prerequisite.
