# D9 financial truth: optional coach support summaries

Research date: October 16, 2026 UTC. Research only. D8 and its amendments are
ratified. This note records the research preceding the founder's explicit D9
ratification on October 16, 2026 UTC. The corrected decision and C01–C22/P01–P30
in [the D9 review](../phase28-d9-adversarial-review.md) govern the accepted
amendment; this source analysis does not independently approve every candidate
phrase or optional metric. It does not amend an owner PRD/OpenSpec, qualify an implementation,
grant access, or establish provider or production correctness.

## Recommendation

Offer two plainly separate, source-qualified summaries: **Gifts recorded for
[period]** and **Expected in [period] — planned commitments**. The first is the
received-support category, with the concise explanation **Designated gifts,
before organization assessments · based on recorded gift date · updated [time]**.
This label is a product recommendation, not quoted owner copy. It avoids
claiming that a source-dated gift physically arrived on its reporting date.
Both retain explicit ISO currency and subject scope. A tenant calendar month is
an illustrative window only when that interval has independently been qualified
and deliberately shared; D9 selects no period, history window or default.
P16's existing missionary dashboard uses the tenant calendar month, but that
default does not create a coach's history entitlement. For an admitted interval,
expected dates obey the governed giving timezone. Source gift dates retain
their own authoritative dating basis rather than being reinterpreted in the
viewer's timezone.

The recommended received measure counts each eligible monetary designation
line for this subject once, at its current effective amount through the stated
P13 cursor. **Exclude fee cover**, which P13 keeps as a separate line in a
reserved system fund; also exclude other subjects' allocations. “Before
assessments” means the designated gift amount before P21 assessment and cost
effects, not the whole payment header and not a deduction invented by P28.
For example, a 103-unit payment containing 60 for this subject, 40 for another
and 3 fee cover contributes 60 to this subject's received summary before any
qualified source correction. P21 support credited is a different metric.

For this proposed metric, period membership follows the **current effective
source gift-date fact**, owned by P7 and supplied by P13, not import time,
`created_at`, refund processing date or current campaign membership. Read that
date with its actual source precision/basis; never fabricate a timestamp.
Refund/return/redesignation facts update the effective scoped amount of the
source gift; a source dating correction can move its period. This is an explicit
D9 metric-registry amendment requiring the P13/P7 owner to qualify that
projection, not a claim P16 H1 already names every dating field. A posting-date
cash-flow view is a different meaning and is not a fallback when this producer
is unavailable. No local SQL or browser arithmetic may replace the producer.

Expected describes the named period's dated plan; received reflects the
qualified effective gifts through its as-of watermark. During the month these
are different temporal views, not a promise that their difference is a
shortfall, a receivable, or money still collectible.

The expected card is a bounded P16 projection extension for the coach audience.
Its source owner must certify a non-overlapping population of dated expectation
lines and its automatic/manual/fixed composition. Do not silently produce a new
all-commitments total in P28. P16 already defines the narrower **Online recurring
this month** aggregate precisely; that subset can remain useful under its exact
label when the broader combined population is not qualified. Do not disguise an
automatic-only number as all expected support. This is a qualification boundary,
not a proposal for a permanent empty product or blanket manual review queue.

**Monthly support committed toward goal** is a different, secondary planning
measure. If offered under D9, use P16's exact monthly-equivalent transform and
compatible P28 goal; label it monthly equivalent. It must never substitute for
Expected in October, October receipts, or a cash forecast. D9 does not select
trend history, arbitrary date filters, balances, net account funding, assessment
details, donor rows, or a coach export.

### Minimal metric contract

| Metric                                             | Exact meaning and source                                                                                                                                                                                                                                           | Required limits                                                                                                                                                                                                                                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gifts recorded for [period] — before assessments   | Proposed exact coach metric over P13's effective legal-money designation-line projection for the subject: current effective source gift-date cohort, effective amounts through the stated cursor, with owner-qualified tender/posting eligibility and corrections. | Exclude fee-cover and other subjects' lines; count each eligible allocation once. Do not repeat payment headers, add recognition/commitments/unposted intake/noncash valuation/payouts/balances, or deduct P21 assessments. Recorded gift activity is not irrevocable or spendable cash. |
| Expected in [period] — planned commitments         | P16's effective, named, dated expectation/normal occurrence lines within the exact half-open period, with owner-certified non-overlap and source composition.                                                                                                      | Not monthly-normalized face amounts, unscheduled fixed totals, retry attempts, hypothetical pledges, donor recognition or guaranteed income. Never move an occurrence into the month of its retry. Source-owned lifecycle changes and review certainty remain authoritative.             |
| Online recurring planned in [period]               | Existing P16 H1/H2 subset: normal automatic card/ACH occurrences, each once, with mutually exclusive Received, Processing, Upcoming, Recovery — needs attention and Not received outcomes.                                                                         | An honest fallback/subset, not the complete expected-support total. No rail, donor, retry-date or payment-method detail needs to be released to coaches. Outcome composition itself needs disclosure qualification.                                                                      |
| Monthly support committed toward goal, if included | P16 H3 recurring monthly-equivalent planning total, with D12 lifecycle composition; optional compatible P28 Goal Version comparison.                                                                                                                               | Exact rational sum before display rounding; no fixed-total pledge divided into monthly sustaining support; paused/future-start/unavailable collection shown separately, cancelled/ended excluded from future coverage. This is not expected cash in the displayed month.                 |

Every released metric needs one versioned source registry definition: owner,
source fold and grain, exact Tenant/Legal Entity/subject/designation/purpose,
currency, giving timezone, half-open window, source dating basis, inclusions and
exclusions, evaluator/formula version, as-of time, source cursor, freshness and
coverage state, disclosure floor and rounding. P28 stores qualified references
and presentation choices, not a second financial ledger or formula editor.

## Source map and authority status

These are targeted primary clauses, not a claim to have reread every large PRD.
Owner text establishes accepted intended behavior; it is not implementation
evidence. Active OpenSpec is intended change, not a deployed qualification.

- **P16:**
  `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md`
  **964–1031** (D11 money/expectation/fulfillment separation, typed targets,
  conservation, recurring/fixed linkage, correction), **1033–1080** (D12 pure
  lifecycle/health, unknown and review), **1084–1158** (D13 exact missionary
  metric hierarchy, dates, monthly equivalents, privacy and freshness).
- **P13:**
  `docs/prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md`
  **199–220** (complete allocation basis, noncash vs realized support), **222**
  (projection boundary), **923–935** (payment/posting/review/finality),
  **1604–1609** (frozen attribution and unresolved E7), **1728–1743** (immutable
  ledger, C-01, header vs designation-line grain), **1763**, **1803** (P7 source
  dating and date-correction ownership), **238**, **403**, **1858** (fee cover
  separate from ministry designations), **2025** (minor units and currency-aware
  formatting).
- **P14:**
  `docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`
  **1923–1929** (expectancy excluded from money, recognition MAX-per-Party/header),
  **2145–2159** (exact current Support Assignment/principal/purpose/source scope
  before roster amounts, no authority by membership or relationship).
- **P21:**
  `docs/prds/sitestacker-parity/phase-21-field-accounts-decision-log.md`
  **236–245** (money-designation vs noncash realized basis; provisional activity
  not available money), **627–642** (support credited and separate assessment
  period/timezone), **794–823** (gross gift truth and source-owned assessment
  presentation), **2823–2863** (five independent authorities), **3039–3058**
  (P28 Goal Version bridge, no synchronization or downstream authority).
- **P27:**
  `docs/prds/sitestacker-parity/phase-27-donor-development/context.md`
  **12**, **17–25**, **446–455** (owner gates, voluntary assistance,
  source-qualified native financial comparison, overlapping attribution not
  additive money). P27's ratings-specific cohort rules are not imported as a
  universal D9 financial-dating rule.
- **P22:** `docs/prds/sitestacker-parity/phase-22-public-ministry-pages.md`
  **420–431** (public support metric has its own exact source, currency,
  formula/coverage, immutable publication profile). This is evidence of a
  separate owner, not authority to reuse a public denominator privately.
- **Durable OpenSpec:** `openspec/specs/contribution-operations/spec.md`
  **13–28**, **47–86** preserves one contribution action/read model and correction
  truth; **88–119** retains granular source mutation capability and reason.
  These existing staff operations grant no coach mutation.
- **Active OpenSpec:**
  `openspec/changes/add-field-account-operations/specs/field-account-operations/spec.md`
  **623–642**, **662–677** separates source authorities, absent/hidden/zero,
  finite publication, independent currencies and hidden-balance derivatives.
  `openspec/changes/add-donor-development/specs/contribution-operations/spec.md`
  **5–13** keeps actual-receipt intake a restricted nonfinancial envelope, not
  posting or money authority.
- **D8 ratified:** `phase28-d8-adversarial-review.md` **C10–C12**, including
  **491–518**, limits optional financial semantics and inference; it did not
  itself select financial sharing. **D9 question:**
  `phase28-q9-coaching-support-summary-research.md` selects whether optional
  expected/received modules may be offered, not defaults/history/term/exports.

## Material concerns, exact clauses and proof obligations

Severity is the potential harm if the specified failure occurs. Likelihood is
conditional design risk, not observed frequency or a production finding.

### FT01 — “Expected” can silently mean two incompatible things

**High / likely if one generic expected field is reused.** A weekly commitment
has four or five actual occurrences in a calendar month; its monthly equivalent
is always amount × 52/12. Annual support can normalize into every month while
having no dated occurrence in most of them. P16 **1091–1105**, **1107–1126**
explicitly distinguishes these meanings and forbids dividing fixed pledges.

**Clause:** “Expected in a named period SHALL derive from qualified effective
dated expectation lines in that period. Monthly-equivalent recurring support
SHALL be a separately labeled planning measure using the P16 factors. An
unscheduled fixed pledge SHALL remain unscheduled; P28 SHALL NOT fabricate a
date or divide its total into recurring support.”

**Proof:** four/five-week months; quarterly/annual occurrence inside/outside
window; twice-monthly vs every-two-weeks; fixed pledge with named installments
vs no plan; pause, skip, future start, cancellation and later amendment. P16
**979**, **1103**, **1124–1126** fixes these semantics without a new founder vote.

### FT02 — A combined commitment total can count the same plan twice

**High / plausible when joining typed commitment sources.** P16 **997–1003**
allows recurring gifts to fulfill a linked fixed pledge through one money
application and derived linked coverage. Adding both expectation schedules can
portray the same intended receipt twice. That clause fixes fulfillment
conservation; it does not by itself define every cross-product expectation
aggregate or its deduplication precedence.

**Clause:** “A combined expected-support metric SHALL consume a P16-qualified,
non-overlapping population with defined recurring/fixed link treatment and
automatic/manual/fixed composition. P28 SHALL NOT invent precedence or sum
independent totals. An independently qualified narrower population MAY remain
available under an accurate subset label.”

**Proof:** linked recurring/fixed plan, partial link, amended plan, excess beyond
fixed capacity, one gift applied to several compatible targets, duplicate join
rows and ambiguous linkage. **Owner extension needed:** exact combined
expectation projection and coach disclosure, not another commitment aggregate.

### FT03 — Received, fulfilled, planned and shortfall are different populations

**High / likely with a two-card subtraction.** P16 **968**, **983–993**,
**1013–1023** distinguishes money, schedule and fulfillment. A received gift can
remain unmatched; a late payment can fulfill a prior occurrence. A full-month
plan and month-to-date receipts also have different horizons.

**Clause:** “The two summaries SHALL state their period and as-of meaning and
SHALL NOT automatically produce expected-minus-received, fulfilled percentage,
overdue balance or debt. Any fulfillment comparison SHALL use exact P16 D11
applications to the same named expectation population. Any goal comparison
SHALL independently qualify its denominator and meaning.”

**Proof:** unsolicited gift, unmatched gift, one gift split across targets,
late receipt for prior month, received gift during paused collection, and
midmonth view against a full-month plan. Correct receipts remain visible when
commitment matching is Needs review.

### FT04 — “Received” can be overstated as final, net or available money

**High / plausible if a ledger-posted flag is treated as final cash.** P13
**925–927** explicitly allows provisional posted ACH/check facts; processing is
not received under P16 **1105**. P21 **238–245**, **629–642**, **811–816** separates
gross gift activity, support credited, assessment, close and available funds.

**Clause:** “Gifts recorded for a period SHALL mean the exact P13/P7-qualified
effective monetary designation-line activity for that subject, excluding fee
cover, grouped by current effective source gift date and evaluated through the
stated source cursor, before P21 assessments or cost effects. It
SHALL NOT claim irrevocable settlement, net credited support, a balance, or
spendable money. P28 SHALL NOT calculate support credited by subtracting an
assessment or cost from its received card.”

**Proof:** ACH processing vs qualified posting vs later return; provisional
check and NSF; gross gift with fee cover; nonzero assessment; mismatched giving
and finance timezones. If a future net-credited module is wanted, use P21's
exact result and current permission, including its honest assessment treatment;
D9's simple pair does not need that additional module.

### FT05 — Splits, recognition, noncash and portfolio joins can duplicate money

**High / likely under naive header/roster sums.** P13 **1734–1743** makes
designation lines money grain. P14 **1929** is a recognition-specific
MAX-per-Party/header, not a cash total or a rule permitting sums across people.
P13 **211–220** keeps original noncash fundraising truth distinct from later
realized support; P27 **446–451** forbids overlapping attribution as conserved
money. D8 did not authorize cross-subject financial totals.

**Clause:** “Received SHALL count each eligible effective source allocation
once at its owner-defined grain. Recognition, household/member/DAF credit,
recurring fulfillment and linked pledge coverage SHALL NOT add money. Original
noncash valuation and later realized support SHALL NOT be combined as cash or
counted twice. Distinct subject cards SHALL NOT create a portfolio total.”

**Proof:** one header split between two missionaries and a project; fee-cover
line; several recognition roles; common supporter; linked recurring/fixed
fulfillment; noncash donation then liquidation; same allocation reachable via
multiple assignments. A source-specific noncash fundraising metric would need
its own clear meaning and is not silently part of this cash-received label.

### FT06 — Corrections, refunds and disputes require the owner's effective fold

**High / plausible if UI counters or payment flags drive summaries.** P16
**1027–1031**, **1101** requires signed source corrections and exact inverses;
ambiguous partial reversals retract the uncertain fulfillment vector and enter
review, not a proportional guess. P13 **925–927** separates dispute/payment
state from posting; **1731–1732** keeps C-01 unresolved.

**Clause:** “P28 SHALL consume the effective owner fold and its dating policy,
including refunds, returns, chargebacks, voids and redesignations. A refund
request, disputed state or unknown provider outcome SHALL NOT independently
subtract or restore money. Source corrections SHALL invalidate affected
summaries; P28 SHALL NOT invent allocation, date attribution or approval rules.”

**Proof:** full return once under replay; partial finalized return; ambiguous
partial allocation; pending refund; dispute won/lost with exact owner effects;
redesignation moving eligible scope; source dating correction moving the gift
cohort. In this proposed gift-date metric, later effective inverses affect the
source gift's cohort, rather than becoming newly received negative gifts in the
refund processing month. This does not prescribe the dating of separate P21
account activity, accounting journals or a future posting-date cash-flow view.

### FT07 — Exact money arithmetic is not an implementation convenience

**High / plausible with floats, per-row rounding or mixed currency.** P13
**2025**, P16 **1111–1122**, **1152** requires currency-aware minor units and exact
rational monthly totals. P21 separately supports exact currency lanes; a shared
screen or denomination label does not authorize conversion.

**Clause:** “Keep ISO currencies separate. Use exact source minor units for
money, exact rationals for P16 monthly planning, and the source-owned rounding
policy at presentation. Do not sum currencies, assume two decimal places,
round each recurring line before summing, or introduce an FX total through D9.”

**Proof:** JPY; three-decimal currency if owner-supported; weekly amounts whose
rationals do not divide evenly; negative correction; large safe integer values;
two currencies with identical symbols. Display must preserve exact meaning
across locale and narrow/mobile layouts.

### FT08 — A goal ratio can be mathematically correct and semantically false

**High / likely if a generic funding_goal field is reused.** P21 **2852–2863**,
**3042–3055** keeps the P28 Goal Version independent of approved needs,
commitments, balances and public progress. P16 **1122–1126** permits the distinct
monthly planning comparison, not arbitrary received/expected division. P22
**420–431** owns its own public metric definition.

**Clause:** “Show a goal comparison only for the exact shared P28 Goal Version
and a qualified numerator with compatible subject, purpose, currency,
period/cadence, gross-versus-net basis, coverage and formula. A goal change
creates a new version; it SHALL NOT silently rewrite earlier comparisons or
change the source Plan, public page, commitment or money.”

**Proof:** monthly recurring goal vs dated one-time goal; gross receipts vs net
need; goal revised midperiod; source Plan changed without goal adoption; absent
goal; source-valid zero goal; amount above goal. Zero/missing denominators yield
no percentage, not infinity or an invented goal. Above-goal activity remains
truthful; do not cap the numeric amount at 100% or turn excess into debt,
withdrawable funds or automatic redesignation. Exact visual treatment is
ordinary design; changing the financial goal basis is an owner choice.

### FT09 — Hidden or incomplete source data cannot become zero or a complete total

**High / likely with client-side totals or pagination.** P16 **1152–1158**
requires privacy before arithmetic, source coverage, cursor-backed aggregates
and independent degradation. P14 **2147–2158** requires exact Support Assignment
and purpose before amounts. Active OpenSpec **623–628** retains distinct absent,
hidden, unauthorized, stale, missing and zero states.

**Clause:** “A summary SHALL disclose only its currently qualified population
and coverage. A complete-total label requires complete source coverage for that
definition. Unknown, denied, unqualified, suppressed and stale SHALL NOT render
as zero. Server-owned source aggregates SHALL NOT derive from paginated rows,
hidden row caps or client filters. One unavailable metric SHALL NOT erase an
independently qualified sibling metric.”

**Proof:** partial import, delayed feed, hidden allocation, source permissions
changed, missing manual source, pagination limit, one stale P16 projection with
current P13 projection, true qualified zero. Do not reveal a protected exclusion
count or hidden record's existence in the explanation.

### FT10 — An aggregate or comparison can disclose a donor or hidden financial value

**High / plausible for small cohorts or overlapping modules.** P16 **1154**,
P14 **2155–2158**, D8 **C12**, and active P21 OpenSpec **662–669** apply to
derivatives. A known goal plus a percentage reconstructs a hidden numerator;
two overlapping subjects or before/after snapshots can isolate one gift.

**Clause:** “Qualify the released summary together with other allowed values,
ratios, categories, periods and subject views before calculation and release.
Suppress or coarsen unsafe results through the source-owned policy, never
fabricate zero. No donor identity, gift row, payment detail, hidden balance,
reserve, compensation or statement follows from D9 eligibility.”

**Proof:** one-donor cohort; known goal plus percentage; amounts with one hidden
line; neighboring windows; one-project vs member totals; multiple coached
subjects sharing an allocation; old cached result after scope change. No
universal numeric small-cell threshold or new date-filter right is invented.

### FT11 — Appeal attribution remains an exact owner gate, not a dashboard choice

**High / plausible if live campaign links are chosen for convenience.** P13
**1608** explicitly retains conflicting live-vs-frozen campaign semantics as E7;
P27 **12**, **446–455** requires that consumer to remain unqualified. C-01 at P13
**1731–1732** concerns correction approval, not every ordinary financial read.

**Clause:** “Do not offer received-toward-appeal or another dependent campaign
metric until its exact attribution owner contract is reconciled and qualified.
Do not infer campaign membership from current links, frozen labels, gifts or
coaching membership. Keep independently qualified designation receipts,
commitments and goals usable.”

**Proof:** source-code remapping, campaign hierarchy change, recurring origin,
prior unmapped gift and corrected refund. Reject both guessed live and guessed
frozen semantics for the blocked consumer; no global Phase28 finance shutdown.

### FT12 — Reporting assistance must not become a financial write or evaluation system

**High / plausible if progress UI adds pressure or action buttons.** P16
**1156**, P27 **17–25**, durable Contribution Operations OpenSpec **13–28**,
**88–119**, and D8 read-only authority preserve source ownership and voluntary
assistance.

**Clause:** “Viewing or sharing a summary SHALL NOT create, change, fulfill,
resume, forgive, refund, collect or allocate money or commitments; authorize a
coach mutation; create a donor follow-up; score missionary diligence; or require
logging. Goal/summary absence and missing installments SHALL NOT imply failure,
donor debt or negligence. Source obligations remain independently enforceable.”

**Proof:** read/retry/cache refresh has no side effect; no inferred lapsed donor
or missing-log score; forged coach mutation fails; no automatic contact task or
communication from changed expected/received amounts.

## What can be inherited, what must be qualified

**Inherited now:** money and commitment source owners; exact dates/currency;
monthly-equivalent formula; immutable source correction; no receipt from
processing; no recognition-as-cash; source privacy and current access; separate
P28 goals; optional/read-only coaching; no balance, donor detail or financial
write right.

**D9 review amendments recommended:** the exact labeled minimal pair; no
unexplained subtraction or completion ratio; coach-specific source-qualified
aggregation; non-overlapping all-commitments population; independent degraded
states; explicit compatible goal calculation; joint inference assessment and
honest gross received semantics. These implement the selected option and
existing boundaries and are accepted to the extent incorporated into the ratified D9 amendment; source/runtime qualification remains required.

**Not silently selected:** net support credited, a balance/coverage/reserve
module, new FX totals, history/trend duration, arbitrary dates, cross-subject
money totals, new sharing defaults, automatic goal synchronization or a custom
metric builder. If any of these become necessary, name the concrete additional
product/owner decision rather than smuggling it into “summary.”

**Qualification still required:** P13/P7's exact proposed gift-date-cohort
received projection and finality definition for this audience; P16's broad
expected population and recurring/fixed
overlap treatment; source disclosure/coverage/freshness and source-cursor
coherence; P28 Goal Version semantics. These are scoped owner deliverables, not
proof that the current repository implements the product. E7 and C-01 remain
only their actual dependent owner gates.

No database, provider, representative-user or runtime test was performed for
this note. The proof cases above are review/implementation obligations. A
separate synthetic arithmetic or RLS probe can test mechanics but cannot
certify these financial populations, disclosure policy or production behavior.
