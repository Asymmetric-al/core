# D9 — optional, truthful support summaries for invited coaches

**Disposition: Accept with required amendments.** Offer the optional summaries.
Make them a small, useful part of the existing coaching view, with explicit
sharing and source-qualified financial meaning. A summary permission does not
require donor-record access, and removing names does not make money anonymous.

Reviewed October 16, 2026 UTC against repository baseline
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. The founder answered Q9:
“A — Allow optional support summaries.” On October 16, 2026 UTC, the founder
subsequently instructed: “Ratify this decision and amendment.” The corrected D9
decision and required amendments, including C01–C22 and P01–P30 acceptance
obligations, are explicitly ratified. D8 and other decisions retain their separate
recorded statuses. This is research and decision work, not a formal PRD/OpenSpec
amendment, implementation, financial grant or live change.

## Exact corrected decision to record

> **D9 — Optional support summaries in coaching.** A missionary may deliberately
> include organization-permitted summaries of expected support from commitments
> and support actually received in a particular authorized coaching share.
> The coach remains read-only. Eligibility, invitation acceptance, a shared goal
> or a Coach role does not itself include these summaries.
>
> Show expected/planned support and received support as distinct measures, using
> their authoritative source definitions, exact ministry/project and financial
> scope, currency, period, coverage and source currentness. Prefer a qualified
> dated expectation and received amount for the approved interval, with “so far”
> where the received period is incomplete. A monthly equivalent, if separately
> admitted, is a planning measure and must be named as such. Neither a promise,
> payment in progress nor recognition credit is received support. Do not add
> expected and received together, infer donor debt from their difference, or
> present either as spendable balance or take-home pay.
> The recommended received metric is effective designated monetary gifts recorded
> for the approved period by their authoritative gift date, before organization
> assessments, with corrections through the stated source evaluation. This exact
> coach-purpose metric needs P13/P7 qualification; a posting-date cash-flow total
> is not an interchangeable fallback.
>
> The source owners must qualify the summary purpose and its non-overlapping
> inputs before arithmetic. The coach receives only the permitted derived
> output, without raw donor, gift or commitment access. Apply existing tenant,
> entity, subject, field, classification, history and aggregate privacy rules,
> including the existing small-cell floor and checks for revealing combinations
> or repeated releases. Withhold an unsafe result and its revealing complements;
> do not substitute zero or claim anonymity.
>
> Give the missionary one understandable inclusion control within the existing
> coaching-sharing flow, an accurate review of the information and dates being
> shared, and one Save. Show only currently available actions. The coach sees
> clearly labeled amounts and honest availability states in the selected
> subject's view. Turning this sharing off removes this share's summary access
> while preserving other independently permitted coaching information.
>
> This decision selects optional summary eligibility. It does not select
> automatic/default inclusion, historical range, access duration, donor details,
> Field Account balances, exports, financial notifications, cross-subject totals,
> new coach writes or unrestricted report filters. Use the existing source owners,
> permission boundary and shared UI; create no parallel ledger, permission engine,
> analytics platform or provider dependency.

The recommended dated pair is a product/design judgment grounded in P16's
existing distinction between scheduled occurrences and monthly-equivalent
planning. An illustrative calendar month below is not a new history entitlement.
The unchosen history/duration policy does not invalidate module eligibility;
the actual sharing command must have an explicit qualified scope before it can
activate. It must never fill missing scope with “all time” or “forever.”

## Evidence and the strongest alternative

| Evidence                                                                                                        | What it establishes; limits                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Financial truth](d9-evidence/financial-truth.md)                                                               | Exact P13/P14/P16/P21/P28 ownership, dated expectation versus planning equivalence, receipt and fulfillment, allocation, currency and correction boundaries. Owner intent is not proof of implemented producers. |
| [Authorization and privacy](d9-evidence/owner-privacy.md)                                                       | P3/P10/P12, ADR0209/0211/0212 and active OpenSpec require source-purpose admission, derived-field classification, current authorization, existing aggregate floors and separate export authority.                |
| [Current runtime](d9-evidence/current-runtime.md)                                                               | Actual dashboard/model/query shortcomings, with exact files and reproducible math evidence. These are inspected-source findings, not claimed production incidents or a complete repository security audit.       |
| [Comparable products](d9-evidence/benchmarks.md)                                                                | Current primary MPDX, Bloomerang, Sola and privacy sources support separating measures and explain important differences; published features are not measured Asym demand or usability evidence.                 |
| [UX journeys](d9-evidence/ux-journeys.md)                                                                       | Source-aware sharing/read states, actual Core component constraints, primary accessibility guidance and twelve proposed journey proofs. No browser/assistive-technology or user session was run.                 |
| [Database/lifecycle](d9-evidence/database-lifecycle.md)                                                         | Current official PostgreSQL/Supabase guidance, exact isolated proof and limits. Hosted Supabase grants, JWT context, actual owner services and production load remain unqualified.                               |
| [Original Q9](phase28-q9-coaching-support-summary-research.md), [ratified D8](phase28-d8-adversarial-review.md) | The question selects optional modules; D8 already governs identity, exact subjects, voluntary read-only coaching and current sharing. Earlier decisions retain their separate statuses.                          |

**Problem validity:** coaches have a documented job of helping a missionary
understand fundraising progress and adjust a plan. MPDX documents an opted-in,
read-only coaching report containing committed and received giving. That supports
the usefulness of the distinction, not Core adopting its historical range,
manual flags, donor-adjacent detail or privacy claims.

The strongest alternative is to keep goals, check-ins and next steps native and
discuss support amounts outside the product. That avoids new summary exposure,
and remains a valid choice for a missionary who declines sharing. It also repeats
manual reconciliation and gives less dependable preparation for a coach working
with several subjects. Optional source-qualified summaries are the better fit
for the selected integrated product. Broad CRM/finance access is not a stronger
alternative: it grants unnecessary data and makes offboarding harder.

Comparable products do not agree on what “expected” means. MPDX's expected report
uses entered contact/giving information; Bloomerang distinguishes scheduled
projection from realized revenue; Blackbaud warns that including pledges and
their payments can double-count. These are reasons to retain Core's authoritative
definitions, not choose a fashionable vendor formula. No new integration with
those products is needed. The old dashboard document supplies direction only;
its former stack and proposed dependencies remain excluded.

Evidence labels used here: **repository intent**, **inspected current code**,
**executed bounded probe**, **published external practice**, **inference**, and
**product judgment**. Missing evidence includes actual missionary/coach feedback,
hosted RLS behavior, deployed feature operation and measured production workloads.
The release proofs below turn these into explicit qualification obligations,
not unsupported claims that the feature already works.

**Executed verification:** the [actual-source math probe](d9-evidence/math-probe/README.md)
passed **9/9 assertions against unchanged Core modules**, confirming observed
behavior including defects. The isolated [PostgreSQL probe](d9-evidence/postgres-probe/README.md)
produced **25/25 expected outcomes**, including **four observed two-session
transaction-lock waits** and **two intentionally unsafe comparison controls**.
Those controls show join fanout inflating totals, `SUM(DISTINCT amount)` losing
legitimate equal-valued facts, and a ratio reconstructing a withheld amount.
The bounded reader permits a useful summary without raw SELECT, preserves exact
large numbers and refuses incomplete or outdated results as current zero/totals.

These are not 34 passing feature-acceptance tests. The database facts stand in
for an already purpose-admitted source projection: the fixture does not implement
P3/P10/P12 classification, small-cell privacy, financial source folds or real
Supabase identity. The actual-source probe does not run the HTTP/browser pipeline.
The separately traced minor-unit-to-dollar display defect is static wiring
evidence, not a demonstrated production incident. Exact code, results, hashes,
role/privilege captures and disposable container/volume cleanup are retained.

## Financial meaning: keep two measures, not a new accounting system

| Fact                                     | Authority and required interpretation                                                                                                                                                                                                         | What the coaching projection must not do                                                                                                                          |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subject identity                         | P9 canonical Ministry Assignment/Ministry Project; P12 exact authorized scope. P21 Support Assignment is a separate finance-owned purpose.                                                                                                    | Treat a login, household, team membership or parent project as ownership of every associated gift.                                                                |
| Dated expected support                   | P16's registered, versioned commitment/occurrence metric for the approved interval. Exact normal occurrences and qualified fixed installments retain their source meaning.                                                                    | Sum all promises, add fixed-total pledge face value to recurring schedules, count retries as new expectation, or call a monthly equivalent cash due this month.   |
| Received support                         | P13's effective received contribution-line fold for the exact support/designation scope, per currency, with canonical corrections and current exposure rules. The proposed dated coach metric uses P7's current authoritative gift-date fact. | Sum gross payment charges, fee cover, soft credit, processing money or all gifts associated with a donor; choose import/posting time as a silent dating fallback. |
| Support credited and Field Account facts | P21 owns support-credited, assessment, net and account facts. These are not automatically money available to a missionary. If a qualified module uses one, its actual basis must be explicit.                                                 | Relabel a P13 contribution total as post-assessment support, available balance, compensation or net income. D9 selects none of those additional modules.          |
| Commitment fulfillment                   | P16 authoritative matching/application fold. Unmatched genuine receipts remain receipts.                                                                                                                                                      | Subtract all received gifts from all commitments and call the result unpaid debt or donor failure.                                                                |
| Goal                                     | Explicitly shared P28 GoalVersion; finance SupportPlan and public adopted goal remain separate.                                                                                                                                               | Apply today's goal retroactively, silently synchronize goals, or display a percentage with an incompatible/hidden denominator.                                    |
| Sharing and result                       | P28's D8 sharing source plus current P12 authority; source producers own money. A result is a derived read.                                                                                                                                   | Make a cached total, DTO, role flag or coach's settings a new financial/write authority.                                                                          |

**Concrete expected-support decision:** require P16 to certify the non-overlapping
population for any unified automatic-recurring/manual-recurring/fixed-installment
summary. This is a bounded owner extension, not an aggregate already proved by
the current PRD. P16 allows a recurring commitment linked to a fixed pledge;
adding both schedules can count one intended receipt twice. Do not invent a
dashboard precedence rule. An already qualified narrower metric may be offered
with an honest label such as **Online recurring support planned in [period]**;
it must not be presented as all expected support. The permanent target remains
the explicit source-qualified composition, not an indefinite raw-data workaround.

**Concrete received-support decision:** show **Gifts recorded for [period]** as
the received-support measure, with **Designated gifts, before organization
assessments · based on recorded gift date · updated [time]**. Count each eligible
P13 effective monetary designation line once; exclude unrelated allocations and
the separate fee-cover system-fund line. A payment of 103 containing 60 for this
subject, 40 for another and 3 fee cover contributes 60 before source corrections,
not 103 and not a locally calculated assessment-net value.

The proposed period cohort uses the current authoritative P7 gift-date fact
supplied by P13, with effective amounts through the stated source cursor. This is
an explicit bounded metric-registry amendment requiring P13/P7 qualification,
not an assertion that P16 H1 already settles every date field for coaches. Retain
the source date's precision, legal-issuer dating basis and resolved timezone;
do not re-date it in the viewer's or tenant's giving timezone. A later inverse
updates the source gift's effective amount; an authorized dating correction can
move its cohort. No `created_at`, import date, refund date or posting-date cash-flow
fallback is permitted. A provider charge and bank payout are different facts.

A period has explicit boundaries and the measure's owning date/time basis. A full
month's planned occurrences and receipts so far can be shown together with
clear coverage, but are not two completed-period actuals. Late posting, a refunded
gift or a backdated correction can legitimately reduce or restate a summary.
No automatic “behind,” “at risk,” performance grade or annualized prediction
follows. A complete, source-proved zero is useful; missing, restricted, partial
or stale data is not zero.

## Concrete UX direction

Keep the D8 Coaching portfolio and subject detail. Do not add financial totals
to every portfolio row. Open one permitted subject to read its summary. Maintain
visible organization, subject and **View only** context on phones as well as
desktop. Existing shared `base-maia`/Base UI components and semantic tokens are
the design foundation; no second component library is needed.

Missionary sharing, illustrative copy:

```text
Sharing with Jordan Lee                       Community Ministry

Support summaries
[ ] Include support summaries
Share the permitted expected and received amounts shown below.
Jordan can view them; they cannot change your records.

What Jordan will see
[Exact admitted measures, currencies, dates and existing access terms]
[Review coaching view]

[Cancel]                                      [Save sharing]
```

The checkbox is illustrative, not a newly selected default. Render the saved
state and deliberate draft choice accurately. Use one staged choice and Save;
do not require a second confirmation for ordinary qualified sharing. A tenant
setting changes eligibility, not inclusion for every coach. If a control is
unavailable, show a concise explanation only where the user is authorized to
know that option exists. Do not present an apparently working toggle that the
server will always reject.

The review is the exact proposed coaching projection, also bounded by the
missionary previewer's own read authority. It must not borrow the missionary's
broader financial dashboard or expose the coach's separate staff rights.
State plainly that the summary contains no donor identities, individual gift
detail, balances or export right. Avoid “anonymous” and “only you and Jordan.”

Illustrative coach view, assuming both the displayed interval and these source
metrics have already been qualified and shared:

```text
Hope Mission · Coaching                       View only
Maya Chen · Community Ministry

Support summaries

Expected support — 1–31 October 2026
USD 4,200
Planned commitments for this period; not guaranteed receipts.

Gifts recorded — October 2026, so far
USD 1,600
Designated gifts, before organization assessments.
Based on recorded gift date.
Records current through 16 October 2026, 13:00 UTC

[About these numbers]                         [Refresh]
```

Do not use this broad expected label if only automatic recurring occurrences
are admitted. Show the narrower label. If a monthly-equivalent planning measure
is used instead, title it **Monthly support committed — [currency]/month** with
**Monthly equivalent for planning; not scheduled receipts**. No extra chart,
stacked total, trend, ratio or donor drill-down is required for a complete useful
summary. Each additional derived output would need its own meaning and authority.

| Situation               | Required experience                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Known complete zero     | Show the actual currency zero and approved period/cutoff. Do not infer inactivity.                                                                                                                |
| Partial coverage        | Explain incomplete coverage if that fact is safe to disclose. Show a labeled partial amount only when the source specifically qualifies that result; otherwise use the neutral unavailable state. |
| Withheld or unqualified | “This summary isn't available in this coaching view,” or omission where even existence is not disclosable. Never reveal hidden contributor counts or the private reason.                          |
| Load failure            | Preserve useful navigation and other independently permitted modules; show retry. Do not convert an error to zero or to a claim that sharing ended.                                               |
| Stale source            | Show source-safe currentness. A prior value may remain only if current authority and the source's explicit stale-display contract permit it. Fetch time is not financial freshness.               |
| Saving / lost response  | Persistent Saving, confirmed saved, definite failure or “We couldn't confirm the change” with Check status. An optimistic checkbox is not evidence of a committed grant.                          |
| Sharing removed         | Remove this share's summaries, preserve unrelated valid coaching, and confirm the effective scope. Do not claim to recall values already seen or cancel another independent access basis.         |

Use explicit currency codes and correct minor units, localized unambiguous dates,
wrapping names, keyboard-operable controls and visible status announcements.
Stack cards at narrow widths; key labels cannot rely on hover, color or charts.
Test 320 CSS pixels, 400% zoom, long translated labels and constrained networks.
No donor address collection or new international-name model is needed for this
decision. The donor/public giving flow does not gain steps or automatic sharing.

## Concern register

Severity describes the potential consequence if the safeguard is absent.
Likelihood is a conditional engineering estimate based on the evidence, not a
measured incident rate. Each concern includes its effect on the decision and
points to exact ratified clauses and independently testable proofs below.

### R01 — Optional eligibility could become automatic financial access

- **What/why:** Enabling a tenant option, accepting an invitation or sharing a goal could automatically expose money and old periods to every coach. That exceeds the selected choice and makes the missionary's control misleading.
- **Severity / likelihood:** High / medium; common default/migration shortcut, not an observed deployment.
- **Evidence:** Original Q9 excludes defaults/history/duration; ratified D8 separates role, invitation and exact grant. MPDX supports deliberate sharing but does not establish Core defaults.
- **Decision effect:** Narrows “allow” to eligible, deliberately included summaries. Keeps A.
- **Permanent fix:** Extend the existing D8 sharing purpose with a finite exact module/profile scope. No new broad financial role or automatic enrollment.
- **Exact amendment:** C01, C12, C14, C20; P01, P16, P17, P28.

### R02 — “Expected” could count the wrong thing twice

- **What/why:** Summing pledge face values, recurring schedules, linked fixed commitments or historical recurring receipts produces an inflated or temporally false expectation. Coaches would plan against money neither scheduled nor guaranteed.
- **Severity / likelihood:** High / high if current dashboard helpers or a generic pledge SUM are reused; the current-code counterexample is concrete.
- **Evidence:** P16 H1–H3 separates dated occurrences and monthly equivalence; F4 allows recurring/fixed links; runtime evidence shows recurring receipts summed without a monthly schedule. Vendors use incompatible meanings.
- **Decision effect:** Changes the definition and requires a bounded P16 composition amendment; does not reject expected summaries.
- **Permanent fix:** One registered, versioned, non-overlapping expected population, exact cadence/period/currentness and source-owned inclusion. Narrow qualified subsets must be labeled precisely.
- **Exact amendment:** C02, C03, C05; P06–P08, P21.

### R03 — A received total could be gross charges, recognition or duplicated allocation

- **What/why:** A charge including fee cover, sibling designation, pledge plus its payment, soft credit or many-to-many join can inflate received support. Omitting canonical refunds produces the opposite historical drift. Neither equals money available to spend.
- **Severity / likelihood:** High / high for direct-table aggregation; current code and canonical split-line contracts establish realistic failure paths.
- **Evidence:** P13 effective line fold, P14 recognition separation, P16 fulfillment and P21 credited/net distinctions. The inspected intake stores charged minor units; current dashboard aggregation does not establish the required basis.
- **Decision effect:** Changes the exact received measure and forbids dashboard-local reconstruction.
- **Permanent fix:** Qualified P13 effective designated receipts per currency/scope/period; preserve canonical line identity, correction/finality and independently owned P21 basis. Deduplicate source business facts, not arbitrary equal amounts.
- **Exact amendment:** C02, C04, C05, C22; P09–P11, P21.

### R04 — Plausible comparisons could be financially meaningless

- **What/why:** USD plus EUR, minor units shown as major units, full-month expectation compared as if received-to-date were complete, a zero goal, or today's goal applied to old dates can produce convincing false percentages or debt labels.
- **Severity / likelihood:** High / high without explicit measure metadata; current USD fallbacks, divisions and capped progress are evidence.
- **Evidence:** Financial owner ledger; actual-source math probe; current metrics writer-to-formatter inspection; existing progress primitive defaults missing values to zero.
- **Decision effect:** Narrows comparison/visualization rights, preserves useful side-by-side reading.
- **Permanent fix:** Exact money representation, currency minor-unit formatting and source time coverage. Only separately authorized compatible comparisons; no inferred remaining/overdue arithmetic.
- **Exact amendment:** C05, C11, C15, C16; P08, P11, P12, P23.

### R05 — Summary access could either over-grant raw finance or become unusable

- **What/why:** Requiring the coach to SELECT constituent gifts forces excessive rights; aggregating everything a service key can read leaks forbidden scope. Treating team/project membership as financial authority can mix other people or entities.
- **Severity / likelihood:** Critical / high for an ad hoc endpoint; existing broad staff/current-context limitations are verified D8 blockers.
- **Evidence:** P3/P10/P12 and active identity OpenSpec; P13 per-node restrictions; P16 privacy-before-aggregation; D8 scoped subjects. See owner-privacy OP01.
- **Decision effect:** Clarifies D8's “filter before aggregate”: source admission for the summary purpose is distinct from raw coach read permission.
- **Permanent fix:** Trusted source-purpose admission before arithmetic, followed by exact current coach output authorization. Separate typed tenant/entity/subject scope; useful summary-only positive path with raw endpoints denied.
- **Exact amendment:** C02, C06, C09, C10; P01–P05.

### R06 — A total without names could reveal a donor's gift

- **What/why:** Singleton/dominated groups, successive totals, refund deltas, overlapping subjects, goals/percentages or public complements can isolate protected money or identity. An informative suppression reason can disclose the same fact.
- **Severity / likelihood:** High, potentially critical for a protected ministry / medium–high in small or overlapping populations.
- **Evidence:** Founder brief explicitly rejects initials-plus-amounts as automatically safe; P12 already has a tenant-tunable small-cell floor; P13/P16 require suppression/coarsening; current ICO guidance treats identifiability contextually. No mathematical anonymity is proved here.
- **Decision effect:** Narrows admissible outputs and release profiles; does not require a new statistical system or prohibit all aggregate coaching.
- **Permanent fix:** Existing finite source disclosure profile, floor and combined-output/repeated-release qualification. Withhold unsafe values and reconstructing complements; neutral safe states, no universal invented N.
- **Exact amendment:** C07, C08, C11, C15; P13–P15, P19, P24.

### R07 — RLS on tenant ID alone could still permit a forbidden state or privileged bypass

- **What/why:** An update can change subject, profile, source epoch or attribution while retaining tenant ID. Views/RPCs/service paths can expose facts denied through ordinary tables. Caller-supplied actor/tenant fields corrupt authorization and audit.
- **Severity / likelihood:** Critical / medium; depends on actual grants/owner roles, which hosted inspection has not established.
- **Evidence:** Current PostgreSQL/Supabase behavior and isolated fixture; P12 source/field/current-context rules. RLS controls rows, not the entire multi-owner authorization contract.
- **Decision effect:** Changes implementation safeguards, not the product choice.
- **Permanent fix:** Trusted context, constrained source commands, composite scoped relations, exact grants and both old-row/new-row mutation checks. Inspect actual function/view ownership and service paths; no generic assertion that a security keyword alone makes them safe.
- **Exact amendment:** C09, C10, C12, C19; P02–P05, P17, P27.

### R08 — Missing, stale or truncated data could become a confident zero or total

- **What/why:** A capped gift list, failed source, privacy exclusion, missing currency or stale projection can display zero/full coverage. A browser refresh timestamp can hide that the underlying source is old.
- **Severity / likelihood:** High / high if current DTO defaults are reused; concrete current source caps/defaults exist.
- **Evidence:** Runtime note and math probe; P16 freshness/metric registry; P13 effective cursor/currentness; vendor update schedules are not Core SLAs.
- **Decision effect:** Changes availability semantics and prohibits incomplete totals masquerading as complete.
- **Permanent fix:** Explicit source coverage/currentness plus admitted financial value; complete zero only on affirmative source evidence. Rebuildable projection, not writable counter; useful independent modules survive an affected source failure.
- **Exact amendment:** C02, C11, C13, C15; P10, P12, P18, P20.

### R09 — Concurrent edits, revocation or retries could disclose after authority changes

- **What/why:** A stale Save can restore a removed share; a result computed under old source/grant state can be released after restriction; retry after a lost response can duplicate history or reverse a newer choice.
- **Severity / likelihood:** High / medium; normal multi-tab, retry and background timing makes these realistic.
- **Evidence:** D8 accepted source-episode fencing/current authority; PostgreSQL concurrency mechanics and D9 probe. A successful local calculation is not current disclosure authorization.
- **Decision effect:** Requires precise mutation and release linearization, without a user-facing workflow engine.
- **Permanent fix:** Existing authoritative command/version check, atomic mutation plus required audit, durable business-effect identity, current source/grant recheck at release. Define both valid race orders; no retroactive recall promise.
- **Exact amendment:** C12, C13, C19; P16–P20, P27.

### R10 — Secondary surfaces could leak a previously permitted value

- **What/why:** Static cache keys, late responses after switching subjects, tooltips, print/export, a preview, logs or an automatic notice can expose more scope than the current screen grant.
- **Severity / likelihood:** High / high without a shared projection; D8 found static portal cache and raw detail fields unsuitable for reuse.
- **Evidence:** ADR0209/0212, P3/P12 reached-surface rules; actual shared tooltip hardcodes currency; UX evidence and D8 current-runtime findings.
- **Decision effect:** Narrows egress to the selected screen summary and explicitly registered representations.
- **Permanent fix:** Same bounded projection throughout; full-context cache partition/release validation, neutral diagnostics, no automatic notification/export rights. Preview respects both sharing and previewer scope.
- **Exact amendment:** C08, C13–C16, C19; P05, P15, P19, P24.

### R11 — The interface could hide the consequences of sharing or the meaning of money

- **What/why:** An inert toggle, unlabeled dash, optimistic success, inaccessible chart or ambiguous dollar figure creates false confidence and avoidable staff handoffs. A financial leaderboard changes voluntary coaching into surveillance.
- **Severity / likelihood:** Medium–high / high if generic KPI components are reused without source-aware states.
- **Evidence:** Core component inspection, MPDX/Blackbaud semantics and W3C guidance; no user testing is claimed.
- **Decision effect:** Changes the UX acceptance contract, not eligibility.
- **Permanent fix:** One clear inclusion/review/Save flow; two text-first measures with truthful states, readable scope and practical recovery. No ranking, goal enforcement or mandatory reporting.
- **Exact amendment:** C14–C16; P22–P26, P30.

### R12 — A small summary could become a slow, coupled analytics project

- **What/why:** Per-row portfolio queries, arbitrary filters, browser aggregation, mandatory third-party sync or a new warehouse increases latency, cost and disclosure complexity. Unverified “real time” promises create operating obligations nobody owns.
- **Severity / likelihood:** Medium / medium; architectural risk, no measured D9 scale failure.
- **Evidence:** P16 existing finite metric registry and P21 composition, founder optional-platform boundaries, current capped queries, benchmark freshness limits.
- **Decision effect:** Narrows implementation shape to existing owners and bounded selected-subject reads.
- **Permanent fix:** Batched permission-filtered navigation, source-scoped indexed queries, explicit source update expectations and measured release workloads. No new financial formulas, configurable query language or dependency.
- **Exact amendment:** C02, C17, C18; P20, P29.

### R13 — Weak audit or repair could force direct database fixes

- **What/why:** Staff cannot explain which scope was shared or which source version produced a number; full financial payloads in logs leak data; rebuilding a cache changes history or money.
- **Severity / likelihood:** High / medium; particularly likely if generic logs substitute for business history.
- **Evidence:** P12 durable grant/history and minimization; P13/P16 canonical correction/append-only semantics; D8 separation of technical and business evidence.
- **Decision effect:** Adds durable attribution and recovery obligations; no coach audit privilege.
- **Permanent fix:** Source-owned correction and rebuild, minimal correlated diagnostic evidence, governed retention and immutable financial/audit history. A projection failure never edits the ledger.
- **Exact amendment:** C19, C22; P20, P21, P27, P28.

### R14 — Existing dashboard code or a mixed-version rollout could silently redefine the feature

- **What/why:** Reusing misleading current funding/recurring helpers, old broad endpoints or an old client that assumes missing data is zero can expose wrong numbers even after adding correct new fields. Rollback can re-open a permissive path.
- **Severity / likelihood:** High / high if compatibility is ignored; inspected current behavior and executed math counterexamples establish the risk.
- **Evidence:** D9 current-runtime note/probe; D8 fixed-role/source-context blockers; current owner/source contracts are not implemented merely because the PRDs exist.
- **Decision effect:** Requires qualification before activation, not preservation of existing weak formulas for consistency.
- **Permanent fix:** Additive versioned contract, default-denied capability activation, no automatic grant/data backfill, deny old unsupported paths, compare canonical reference totals before exposure, roll forward or disable safely.
- **Exact amendment:** C20, C21; P21, P28, P29.

### R15 — “Useful, secure summaries” could remain untestable or be overclaimed

- **What/why:** Documentation, synthetic SQL or marketing examples get cited as production privacy/UX proof. Unchosen history/duration silently enters a graph; a broad Phase dependency blocks unrelated useful coaching indefinitely.
- **Severity / likelihood:** High / medium; documentary drift is visible where target and current code differ.
- **Evidence:** Q9 exact scope; owner evidence, probe limits and unmet actual-user/runtime qualification.
- **Decision effect:** Keeps A with falsifiable owner-specific proof; no new inferred product choice.
- **Permanent fix:** Trace this answer to exact owner changes, metric profiles and positive/negative tests; only affected unresolved seams block their module. Record current versus intended behavior and unresolved evidence honestly.
- **Exact amendment:** C01, C02, C21; P01, P22–P30.

## Individual category review

Every Yes refers to the full concern record above, including severity,
likelihood, evidence, decision effect, permanent fix and exact amendments.

| Category                                                      | Material concern?                             | Independent assessment                                                                                                                                                                                                           |
| ------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, and alternatives                 | **Yes — R01/R02/R15**                         | Useful documented coaching job; optional native projection is preferable to repeated manual reconciliation, while declining sharing remains valid. “Support” needs exact scope and meaning.                                      |
| Brittleness                                                   | **Yes — R02/R04/R08/R09**                     | Cadence, currency, dates, partial sources and concurrent changes invalidate a happy-path total. Require explicit source contracts and safe states.                                                                               |
| Technical debt                                                | **Yes — R02/R03/R12/R14**                     | A second formula, writable rollup or inherited dashboard shortcut creates permanent drift. Reuse and qualify existing source metric ownership.                                                                                   |
| Edge cases                                                    | **Yes — R02–R06/R08/R09**                     | Linked commitments, split gifts, zero/negative corrections, leap/calendar boundaries, partial months, shared projects, missing goals and source restrictions are real boundary cases.                                            |
| Footguns                                                      | **Yes — R01/R04/R07/R11/R14**                 | Default sharing, broad service aggregation, unit errors, fake progress and old-client fallback can cause harm without malicious action.                                                                                          |
| Tenant safety                                                 | **Yes — R05/R07/R10**                         | Tenant, active hat, legal entity, typed subject, cache and independent grants must all remain exact; a coach's multiple subjects/organizations are not a union permission.                                                       |
| Database, RLS, and authorization safety                       | **Yes — R05/R07/R09**                         | Constraints, grants, old/new mutation states, function ownership and privileged paths need proof; summary-only authorization must not require raw SELECT.                                                                        |
| Overengineering                                               | **Yes — R12/R15**                             | A report builder, new ledger/privacy engine, arbitrary cohorts or mandatory external sync would exceed the need. Finite existing-owner summaries suffice.                                                                        |
| UX/UI and user friction                                       | **Yes — R04/R08/R11**                         | Sharing consequences, true measure labels and zero/unavailable/retry states must be understandable on mobile and assistive technology; no new public giving steps.                                                               |
| Source of truth, ownership, and domain invariants             | **Yes — R02/R03/R05/R08**                     | P13 receipts, P16 expectations/fulfillment, P21 credited/account facts and P28 goals remain distinct authorities; projections are read-only.                                                                                     |
| Hidden coupling                                               | **Yes — R02/R05/R12/R15**                     | Recipient/gift joins, recurring-to-fixed links, broad financial workspace reuse or phase-wide gating can change meaning or access implicitly. Qualify exact seams.                                                               |
| Failure modes                                                 | **Yes — R08–R10/R13**                         | Lost Save responses, stale computed results and partial source failure need definite/unconfirmed outcomes, source-status recovery and current release checks.                                                                    |
| Lifecycle, temporal correctness, concurrency, and idempotency | **Yes — R02/R04/R09**                         | Scope change, source correction, retries, revoke/read races and calendar interpretation require explicit source versions and valid transaction orders.                                                                           |
| Data integrity risks                                          | **Yes — R02–R04/R08/R13**                     | Duplicate joins, fee cover, wrong currency, capped queries, stale counters and ad hoc corrections can corrupt displayed truth without changing the ledger.                                                                       |
| Security and privacy risks                                    | **Yes — R05–R07/R10**                         | Summary inference, raw grants, private scope metadata and secondary representations require existing floors and combined-output qualification.                                                                                   |
| Scalability and performance risks                             | **Yes — R12**                                 | N+1 portfolios, unrestricted history and synchronous whole-ledger scans lack workload evidence. Bound queries and measure supported loads; no invented SLA.                                                                      |
| Operational burden                                            | **Yes — R08/R12/R13**                         | Manual reconciliation, invisible stale sources and direct SQL repair are avoidable through owner-qualified diagnostics and replay/rebuild.                                                                                       |
| Observability and auditability gaps                           | **Yes — R09/R13**                             | Distinguish source financial history, grant audit, projection provenance and technical telemetry; log neither donor rows nor unrestricted amounts.                                                                               |
| Dependency and integration risks                              | **Yes — R08/R12**                             | Provider events and update lag cannot define Core receipt truth; missing/out-of-order events stay with their source owners. No new vendor integration is needed.                                                                 |
| Migration, rollout, and upgrade risks                         | **Yes — R01/R14**                             | Default grants, incompatible old clients and rollback to broad endpoints are unsafe. Additive denied-first activation and source-preserving roll-forward are required.                                                           |
| Testability, traceability, and proof                          | **Yes — R15**                                 | Meaningful positives and denial/race/inference/UX tests are necessary. Bounded probes are evidence, not full product qualification.                                                                                              |
| Other development hazards                                     | **No additional material concern identified** | Checked new money-write authority, destructive cleanup, public signup/giving changes, arbitrary dependencies and mandatory reporting. None is required or selected; hazards from accidental expansion are already covered above. |

## Ratified requirements and acceptance amendments

These clauses are the review's complete ratified amendment. Carry them and their
acceptance obligations into the later authorized specification transition.
Ratification does not edit governing owner documents, qualify runtime behavior
or activate the feature in this research session.

**C01 — Deliberate scope.** The system SHALL offer optional support-summary
inclusion only within a current D8 coaching share and tenant ceiling. The source
grant SHALL identify the admitted summary profile and exact subject/history
scope. Eligibility, role, invitation, goal or policy re-enable SHALL NOT create
inclusion, historical reach, longer access or restored expired/revoked grants.

**C02 — One qualified meaning.** Each offered measure SHALL use the existing
source metric registry and owning projection contract, specifying metric/version,
tenant, legal entity, typed subject/designation scope, currency, source grain,
period/calendar, inclusion/exclusion, effective basis, currentness and coverage.
P28 SHALL NOT create a parallel monetary interpretation. An unqualified metric
is unavailable; an unresolved owner seam blocks only the affected metric. P13's
unresolved appeal-attribution E7 SHALL NOT become a blanket block on unrelated
qualified support summaries or nonfinancial coaching.

**C03 — Expected support.** Dated expected support SHALL use P16-qualified
occurrences/installments in the authorized period, preserving schedule/lifecycle
and correction semantics. A unified multi-kind metric requires a certified
non-overlapping population, including recurring/fixed links. Until that
composition is qualified, only independently qualified narrower metrics may be
offered with accurate labels. Retry attempts, undated face-value pledges and
historical recurring receipts SHALL NOT create dated expectation. Monthly
equivalence SHALL remain a separately labeled planning metric; no fixed-total
pledge division or guaranteed-income claim is permitted.

**C04 — Received support.** Received support SHALL derive from the P13 canonical
effective received contribution-line fold in the exact admitted scope, with
canonical source corrections, allocation, finality and exposure rules. Each
effective line contributes once to that metric. Processing, promises, recognition,
noncash valuation, payouts, unrelated/sibling allocations and out-of-scope fee
cover SHALL NOT contribute.
Commitment matching uncertainty SHALL NOT erase an otherwise valid receipt.
The proposed coach metric SHALL use P7's current authoritative gift-date cohort,
effective amounts through the source cursor, and the visible basis “designated
gifts, before organization assessments.” Preserve source date precision and
resolved issuer dating rules; do not recast that date in another timezone or
substitute import/posting/refund time. Dating corrections and money inverses
remain separately source-owned. P13/P7 SHALL qualify this exact registered
metric before it is offered. P21 credited/net/balance facts SHALL NOT be relabeled
as the same measure; no alternative cash-flow metric is a silent fallback.

**C05 — Money and comparisons.** Actual amounts SHALL retain exact source minor
units and currency through aggregate and transport, without floating-point money
or unsafe JavaScript integer coercion. A separately admitted monthly-equivalent
planning transform SHALL preserve P16's exact minor-unit rational sum until its
defined display rounding. Format according to currency exponent and
locale; never assume USD or two decimal places. Do not combine currencies or
invent FX. Expected and received SHALL NOT be added or subtracted into debt.
Any separately admitted goal/variance comparison requires compatible subject,
currency, basis, period, coverage, goal version and disclosure scope. Unknown,
zero or incompatible denominators SHALL NOT create a percentage; over-goal
truth SHALL NOT be silently capped away.

**C06 — Summary-only authorization.** The trusted source producer SHALL admit
inputs for the exact coaching-summary purpose before arithmetic, applying current
scope/classification/history/privacy floors. This SHALL NOT require or create
coach access to constituent donor, gift or commitment rows. Privileged credentials
SHALL NOT substitute for source admission. Independently authorize the current
coach for the resulting exact output profile; no parent/project/team/role union
or cross-organization aggregation is implied.

**C07 — Inference-safe offered profile.** Qualify the finite offered profile
under the existing P3/P10/P12 boundary, including P12's applicable tenant-tunable
small-cell floor. Evaluate dominant/singleton groups, repeated source releases,
late/refund/correction deltas, permitted period overlap, shared subjects and
offered goals/percentages/public complements. Withhold unsafe values and offered
reconstructing complements, or use source-qualified honestly labeled coarsening.
No universal new N, fabricated money, arbitrary noise or guarantee against all
external background knowledge is implied. Unsafe reachable disclosure is a
release blocker, not a monitoring-only risk.

**C08 — One output boundary.** Register every summary field, derived value,
predicate and reached serialization under ADR0209, with inherited sensitivity.
Unknown purpose/profile/field fails closed. Policy widening follows ADR0211;
ordinary qualified sharing/reads do not gain a routine approval queue. Previews,
tooltips, accessible text, JSON, caches and error paths SHALL reveal no wider
projection. Screen visibility SHALL NOT grant print/export, notification amounts,
attachments, donor drill-down or private-history copying.

**C09 — Scoped persistence and attribution.** Use canonical typed source IDs,
non-null tenant/scope references and tenant-aware unique/foreign-key constraints
for any new sharing/profile/projection relation. Enforce valid lifecycle/version
combinations and durable business identity; do not use ambiguous polymorphic IDs
without integrity enforcement. Derive actor, tenant, hat, source authority and
audit attribution from trusted context. Arbitrary client payloads SHALL NOT
rebind owner/subject/tenant/profile/approval or forge source currency/amount.
Delete/cascade behavior SHALL preserve financial and security history; no money
table rewrite or duplicate ledger is needed for this read feature.

**C10 — Database boundary.** Verify actual grants, RLS, views, RPCs/functions,
storage/derived artifacts and service-role paths reached by the feature. For
updates, prove both eligible old row and permitted new state; broad row UPDATE
SHALL NOT confer field/authority changes. Restrict executable entry points and
raw tables, fix search paths/qualified references for privileged functions, and
inspect actual owner/BYPASSRLS/FORCE RLS/security-invoker behavior. No client or
service path may bypass C06. Omitted WITH CHECK can inherit USING under PostgreSQL
rules; the requirement is proven safe semantics, not a false assertion that every
omission permits all updates.

**C11 — Coverage and zero.** Every displayed value SHALL have source-proved
coverage and currentness. Complete zero requires affirmative complete admitted
coverage and a zero result. Missing, withheld, partial, contradictory or stale
inputs SHALL NOT become zero or complete support. Partial values require an
explicitly qualified truthful partial-coverage contract; otherwise return a safe
unavailable result. Unavailable states SHALL NOT reveal hidden counts, identities,
existence or private denial reasons. Browser fetch time SHALL NOT replace source
freshness.

**C12 — Sharing mutation.** Apply sharing changes through the existing source
command with current authority and expected scope/version checks, atomic required
history, and durable idempotent effect identity. Repeated delivery SHALL neither
duplicate grants/history nor restore superseded sharing. Scope reductions fence
dependent summaries; independent valid rights remain independent. Definite failure
and unconfirmed response SHALL be distinct. Recovery checks current source status
without reapplying stale intent. Policy re-enable cannot clear prior fences.

**C13 — Projection and release.** Produce values from an identified consistent
source evaluation; never mix source revisions while claiming one cutoff. A result,
job or cached response SHALL pass current exact source/profile/grant release
checks. Use existing owner serialization/fences, not a new global locking system.
Each independently valid measure may have its own clearly stated source cursor
and as-of time; a new cross-owner P13/P16 transaction is not required merely to
display two cards. Their comparison, if offered, needs its own coherent basis.
Partition caches by exact context and profile/version; reject late responses after
context or scope changes. Define the valid before/after orders of source correction
and revocation. Already observed information cannot be recalled; subsequent
disclosure must obey the current boundary.

**C14 — Missionary sharing UX.** Provide a clear labeled inclusion choice within
the existing coach-sharing flow, accurate effective versus unsaved state, a review
of permitted measures/currencies/dates/access terms and one ordinary Save. Preview
SHALL be bounded by both proposed sharing and previewer's own authority. Explain
view-only consequences and relevant exclusions without promising anonymity or
exclusive visibility. Current capabilities govern controls and safe explanations.

**C15 — Coach reading and recovery.** Present each measure's exact name,
currency, period/basis and safe currentness prominently; explain source inclusion
in compact ordinary language. Keep zeros, incomplete/unavailable/stale states and
transport failures truthful. Preserve independently permitted coaching on partial
failure. Use persistent saving/saved/failed/unconfirmed status and recoverable
actions. Offer no unsupported drill-down, date range, goal score, leaderboard or
financial action. Do not treat missing voluntary records or lower totals as poor
effort.

**C16 — Accessible, international, practical.** Reuse the shared design system
and money/date formatters with correct source units. Keep organization/subject,
labels and actions visible with long names/translations at 320 CSS pixels and
400% zoom; provide keyboard/focus/status-message behavior and non-color meaning.
No essential meaning may require hover or a chart. Avoid downloading raw rows or
all subjects' histories; constrained connections must support read, retry and
sharing status recovery without an offline authorization shortcut.

**C17 — Existing dependency ownership.** Reuse native P13/P16/P21 sources and
P3/P10/P12 admission. Provider delivery, reconciliation, duplicates and correction
belong to their existing source owners; a webhook alone is not receipt truth.
Do not introduce a financial provider, CRM sync, AI, workflow engine, warehouse,
sender or mandatory notification for this feature. P6/P17 apply if a separately
authorized communication is later selected; D9 creates none.

**C18 — Bounded performance.** Use finite registered profiles and indexed exact
scope queries; avoid N+1 financial loads on the portfolio and arbitrary report
filters. State supported subject/line/currency cardinalities, concurrency,
latency, freshness and query/memory budgets in release evidence, then measure
production-shaped workloads and query plans. No numeric throughput/latency promise
is accepted without measurements. Optimization SHALL retain current authorization
and exact money semantics; precomputation is never write authority.

**C19 — Audit, diagnostics and retention.** Preserve durable source-owned sharing
history with actor, context, scope/profile version, time and outcome. Retain
authorized projection provenance/correlation and source versions needed to explain
a result, distinct from ledger history and technical traces. Apply existing
retention and access policies to caches, audit, backups and exports; no indefinite
snapshot archive follows. Ordinary logs/telemetry SHALL NOT contain raw financial
payloads, donor records, hidden counts or tokens. Repair SHALL use authoritative
correction/rebuild commands, not direct database edits by operators.

**C20 — Compatible rollout.** Activate only qualified summary profiles behind
the existing capability/deployment mechanism. Use additive, denied-first contracts
and explicit mixed-version behavior. Backfills SHALL NOT create sharing grants,
historical access, copied ledger facts or default-zero totals. Old clients/endpoints
that cannot preserve scope/meaning must be denied or isolated from this path.
Disabling the module preserves canonical source data and audit; rollback SHALL
NOT restore a broader endpoint or erase new durable history. Prefer safe
roll-forward after writes have occurred.

**C21 — Traceability and proof.** Carry D9 and C01–C22/P01–P30 into the later
authorized glossary/owner/OpenSpec/design/tasks/tickets/test/release artifacts,
with exact current-versus-target status. Qualify actual Core source services,
hosted Supabase roles/API paths, concurrency, mixed versions, accessibility and
representative missionary/coach comprehension. Record fixtures, expected results,
workload and limits. Synthetic proof, documentation and vendor claims SHALL NOT
be represented as production safety, user demand or measured usability.

**C22 — Read-only financial lifecycle.** Reading, refreshing, sharing, withholding
or rebuilding a summary SHALL NOT mutate money, commitment lifecycle, donor
status, goal, consent or source relationships. Corrections remain source-owned
append-only adjustments where required, then produce a fresh qualified result.
No cascade deletion, manually edited cached balance or copied financial snapshot
may become the correction path. A mismatch disables the affected projection while
authorized source investigation/rebuild proceeds.

## Supabase, lifecycle and source synthesis

The smallest sound implementation is a source-qualified bounded read through
existing owners, plus the existing D8 sharing command. It need not persist new
financial totals. If a projection/cache is needed, it records derived result
identity, exact scope, source/profile versions and coverage; it is rebuildable
and grants no authority. Concrete table/index names are design choices, not
requirements to create a new schema family.

Database enforcement must make wrong-tenant relations, duplicate effect identity,
forged attribution, invalid source versions and unauthorized state transitions
impossible at the reached mutation boundary. Index leading scope/context columns
and bounded lookup keys based on real plans. Check aggregate return types as well
as source columns: PostgreSQL SUM(bigint) returns numeric, and JavaScript Number
cannot exactly represent every 64-bit integer. The transport must preserve the
source's exact range and use qualified decimal formatting.

RLS is necessary but not sufficient. A security-invoker view cannot manufacture
legitimate summary-only rights when underlying raw SELECT is intentionally absent.
A bounded privileged producer can be appropriate only with exact source-purpose
admission and restricted executable scope. Conversely, a service role or definer
function does not become safe merely because it groups rows. Inspect actual roles,
ownership and privileges; hosted defaults and synthetic fixture grants are not
interchangeable. No additional storage bucket/export surface is required here.

| State or event                                | Valid effect                                                                          | Forbidden effect                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Summary eligible, not shared                  | Missionary may review a currently permitted exact profile.                            | Coach reads money because tenant option or role is enabled.             |
| Save inclusion                                | Current qualified source command records exact scope and required history atomically. | Client directly inserts grants or supplies trusted actor/source fields. |
| Active share, usable source                   | Current permitted result at its identified source evaluation.                         | Raw donor enumeration or scope-expanded joins.                          |
| Active share, incomplete/unavailable source   | Safe honest availability; other independent modules continue.                         | Zero, invented total or source repair by the coach.                     |
| Source correction/profile restriction         | Re-evaluate current admitted result and source meaning.                               | Keep an old number as current or expose an unsafe new delta.            |
| Remove summary / end episode / tenant disable | Fence dependent reads/results; keep independent rights and financial truth.           | Delete ledger facts or silently restore upon re-enable.                 |
| Lost response / retry                         | Resolve durable outcome under current authority; no duplicate effect.                 | Replay stale widening after a newer reduction.                          |
| New currency or broader profile version       | Offer only after correct profile/grant qualification.                                 | Silently add new information to an old sharing agreement.               |

Expected/received are not a pair of equal quantities conserved by the UI. The
invariants are instead: canonical money is unchanged; each admitted source fact
contributes once per defined metric; allocations conserve source amounts under
their owner rules; currencies remain separate; fulfillment and receipt remain
distinct; outputs never exceed current sharing/profile authority. Comparisons
require compatible definitions, not merely two numbers on the same screen.

## Falsifiable acceptance and proof scenarios

These are required product proofs, not claims that all have run in this session.
The separate evidence files identify executed bounded tests precisely.

| Proof                                    | Required observable result                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 — Useful summary-only access         | An explicitly authorized coach sees the correct permitted expected/received result with no raw donor/gift/commitment read, staff alias or new financial-write grant.                                                                                                                                                       |
| P02 — Tenant isolation                   | Poison another tenant's same-looking identifiers/amounts, forged context and cache; no row, amount, count, presence or error distinction leaks.                                                                                                                                                                            |
| P03 — Entity and typed subject           | Same-tenant wrong entity/designation, sibling project, team membership and overlapping assignment fixtures cannot widen arithmetic or access.                                                                                                                                                                              |
| P04 — Mutation boundary                  | Direct updates of tenant, subject, owner, profile, actor, source epoch and grant scope are denied; allowed old rows cannot become forbidden new states.                                                                                                                                                                    |
| P05 — All database/API paths             | Anonymous, coach, missionary, admin, RPC, view and privileged-worker paths preserve their exact boundary; raw tables and exports remain denied for summary-only authority.                                                                                                                                                 |
| P06 — Dated expectations                 | Scheduled ordinary occurrences, retries, pause/skip, cancellation, future-effective changes and month-end/leap/time-zone cases match the P16 reference result.                                                                                                                                                             |
| P07 — Linked commitments                 | Recurring/manual/fixed populations and recurring-to-fixed links count each admitted planned business occurrence once; no face-value or retry double count. Narrow subset is labeled accurately.                                                                                                                            |
| P08 — Planning equivalence               | Annual/quarterly/weekly/irregular/fixed-total cases preserve source planning versus dated meaning; UI does not call an equivalent cash due or guaranteed income.                                                                                                                                                           |
| P09 — Effective received truth           | Split allocations, processing, fee cover, soft credit, refund/reversal and P7 gift-date corrections match the qualified P13 reference result; unmatched real receipt remains received. Gift-date cohort, source precision and issuer basis survive viewer/tenant timezone changes; no import/refund/posting-date fallback. |
| P10 — Partial and withheld input         | Capped/missing source, excluded line, incomplete import and privacy withholding cannot produce a complete total or false zero; independently valid modules remain usable.                                                                                                                                                  |
| P11 — Exact money                        | Mixed currencies, zero/two/three-decimal exponents, large safe source amounts, aggregate overflow boundaries and JSON transport preserve exact value and correct formatting.                                                                                                                                               |
| P12 — Coverage and goals                 | Complete zero differs from missing; missing/zero/private/incompatible goal creates no invalid percentage; full expectation versus received-so-far coverage is explicit.                                                                                                                                                    |
| P13 — Small-cell and dominance           | Existing qualified N applies; singleton/dominated/coincident populations and restricted siblings cannot expose protected facts through admitted outputs or reasons.                                                                                                                                                        |
| P14 — Repeated/overlapping release       | Refund, late posting, changed commitment, adjacent/overlapping periods and cross-subject overlaps cannot reconstruct a prohibited fact through offered combinations.                                                                                                                                                       |
| P15 — Complements and alternate surfaces | Hidden amount is not recovered from goal/percent/delta/public complement, preview, tooltip, accessible table, JSON, export, logs or notice.                                                                                                                                                                                |
| P16 — Deliberate lifecycle               | Eligibility, invite acceptance and policy enable do not share automatically; explicit sharing works; remove/end/disable fence dependent scope; re-enable does not revive it.                                                                                                                                               |
| P17 — Mutation races                     | Two editors, stale versions, share-versus-revoke and tenant-policy changes serialize safely; no stale widening, duplicate grant/history or caller-derived attribution.                                                                                                                                                     |
| P18 — Source/grant release races         | Both valid orders of generation versus source correction/revocation are exercised; results have coherent source evaluation and current release authority.                                                                                                                                                                  |
| P19 — Browser context isolation          | Subject/tenant switch, late response, Back, second tab and stale cache cannot show prior protected values under new authority/context.                                                                                                                                                                                     |
| P20 — Recovery/rebuild                   | Lost response, projection outage and retry resolve durable outcome; rebuild from authoritative inputs changes no financial facts, and valid unrelated coaching continues.                                                                                                                                                  |
| P21 — Current-code regression            | Admitted implementation rejects the inspected recurring-receipt/monthly, currency collapse, zero fallback, amount-unit, capped-source and join-duplication counterexamples.                                                                                                                                                |
| P22 — Sharing comprehension              | Representative missionary identifies recipient, subject, measures, dates, effect and how to stop summary sharing without believing it deletes money or globally removes other rights.                                                                                                                                      |
| P23 — Financial comprehension            | Representative coach correctly distinguishes expected/planned from received, period coverage, currency, freshness, balance and goal; no adding promises to receipts or inferring donor debt.                                                                                                                               |
| P24 — Honest states                      | Safe zero/partial/stale/unavailable/error/unconfirmed states are understandable and do not reveal a hidden donor/count/reason; save status is not toast-only.                                                                                                                                                              |
| P25 — Mobile/accessibility               | Phone, 320 CSS pixels, 400% zoom, keyboard, screen reader, focus/status messages and long localized text preserve the whole read/share/retry task.                                                                                                                                                                         |
| P26 — Weak connection                    | Slow/reordered/failed requests allow safe recovery without raw browser aggregation, offline authorization or duplicate sharing effects.                                                                                                                                                                                    |
| P27 — Audit and repair                   | Durable actor/scope/version/outcome matches authoritative command; mandatory audit failure cannot leave unaudited sharing; diagnostics expose no forbidden money/PII; correction is owner-command based.                                                                                                                   |
| P28 — Migration/rollback                 | Old/new code/schema combinations, activation, backfill, kill switch and roll-forward preserve grants/history and source data; no implicit historical enrollment or permissive fallback.                                                                                                                                    |
| P29 — Measured workload                  | State and test actual supported subject/line/currency/concurrency cases, query counts/plans, p95 latency/memory and source freshness; no N+1 portfolio finance or unbounded ledger scan.                                                                                                                                   |
| P30 — Traceable release                  | D9 → glossary/owner/OpenSpec/design/tasks/tickets → actual tests/release evidence uses consistent meanings/rights and documented exclusions; each accepted profile has useful positive proof.                                                                                                                              |

## Adversarial check

### What could go wrong with this answer?

The defensive requirements could make every summary unavailable, leaving a
checkbox with no useful outcome. That is not successful implementation. Require
a representative source-qualified positive case alongside denials. A narrower
honestly named metric is preferable to a misleading universal total; an unsafe
profile remains unavailable, while other coaching stays useful.

### What hidden assumptions are we making?

We infer that source-qualified financial context helps coaches prepare from
published practice and the selected direction. We have not measured Asym demand,
minimum useful precision, acceptable freshness or comprehension. Those need actual
coach/missionary task evidence. The proposed profile is finite; it does not promise
protection against unlimited external knowledge. Exact history/default/duration
remain distinct product choices rather than silently chosen implementation defaults.

### How does this affect the whole product?

It creates a new admitted consumer of existing financial facts, not new facts or
money movement. P13/P16 qualify their summary producers; P12/P3/P10 qualify the
purpose/output; P28 shares and displays. P21 participates only at its applicable
composition seam. Donor/public giving, newsletter authorization, contact sharing
and voluntary relationship history gain no new effects. A production defect found
in an existing dashboard remains a real separate implementation issue, not evidence
that the new feature may use its flawed math.

### How does this affect the end-user experience?

The missionary gets one deliberate control with an accurate review. The coach
gets a few readable figures whose meaning is explicit. Source complexity stays
behind that interface. Clear unknown/partial states are more useful than fake
precision, but errors must include a safe next action and preserve unrelated work.
No obligatory chart, custom date builder, donor investigation or policy vocabulary
is exposed to ordinary users.

### Does this follow modern best practices?

It uses proven distinctions between commitments and realized support, least
privilege, exact-money source ownership and accessible text-first interaction.
Vendor reports provide workflow precedent, not governing definitions or permission
policy. Supabase/PostgreSQL mechanics require inspecting the actual grants and
execution context. Existing repository constraints take precedence where product
examples differ; the source-qualified composition extension is explicitly named.

### Does this fit Asym's existing repo and product direction?

Yes, with explicit bounded owner amendments. It retains Asym/Postgres ownership,
the established communication and projection boundaries, canonical subjects,
read-only coaching and optional platform dependencies. Reusing current dashboard
arithmetic would conflict with that direction. A new role-wide finance flag,
separate spreadsheet ledger or generic statistical engine would also conflict.

### Should we adjust the recommendation?

Keep A. Amend its meaning, sharing, projection and proof contracts as specified.
Do not replace it with broad finance access or postpone the whole coaching feature.
Do not call it qualified for production merely because the design is coherent.

## Ordered synthesis and release discipline

The later authorized specification should make these bounded owner changes,
not duplicate their facts or treat this research as an already changed contract:

| Owner/artifact                                               | Required amendment and trace                                                                                                                                                                                                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P28 coaching, glossary and design                            | D9 optional summary meaning, D8 sharing/profile inclusion and clear read/share states; C01/C12–C16, P16–P26. Distinguish the coaching overview from P16's individual-commitment Current support summary.                                                 |
| P16 commitments                                              | Coach-purpose dated expected metric with certified non-overlap; separately named rational monthly equivalence if admitted; C02/C03/C05, P06–P08.                                                                                                         |
| P13 contributions and P7 dating                              | Exact effective designated-money received profile using current authoritative gift-date cohort, eligibility/corrections, before-assessment basis and source cursor; C02/C04/C05/C11, P09–P12/P21.                                                        |
| P21, only where used                                         | Qualified source composition/publication posture without a new expectation interpretation or balance entitlement; C02/C04/C06, P01/P03/P09. No blanket Field Account participation requirement.                                                          |
| P3/P10/P12 and existing ADR0209/0211/0212                    | Register summary-only purpose/output, inherited fields/privacy, exact grants/history and all reached representations; apply existing policy-widening and egress rules; C06–C10/C12/C13, P01–P05/P13–P19. No new ADR or approval queue for routine reads. |
| OpenSpec, tasks/tickets, implementation and release evidence | At the explicit authorized transitions, reconcile the active identity/contribution contracts and map every C/P ID to concrete owner scenarios and outcome tests. No ticket or implementation is created by this research; C17–C22, P20–P30.              |

1. **Resolved before recording this reviewed answer:** preserve optional deliberate
   sharing; distinguish dated expected, monthly planning and effective received;
   define summary-only admission without raw rights; retain existing privacy floors;
   choose the simple two-measure UX. This review records those exact amendments
   and their evidence; the founder subsequently ratified the complete amendment.
2. **Capture in the authorized spec/design:** P28 scope and UX; P16 non-overlapping
   expected metric; P13/P7 received/date metric; applicable P21 composition; P3/P10/P12
   exact purpose/profile/field/privacy qualification. Bind explicit approved time
   scope when its product decision is made. Reconcile active OpenSpec and glossary;
   do not create a new ADR for a decision already governed by existing ADRs.
3. **Require implementation safeguards before activation:** D8 actual identity and
   scope foundation at reached seams; C01–C22 source/database/release behavior;
   replace current unqualified math on this path; qualify the useful summary-only
   positive and privacy/tenant/concurrency denials. Do not depend on unrelated
   phase completion, optional integrations or a broad finance rollout.
4. **Qualify the complete journey:** actual Supabase/service paths, owner reference
   calculations, browser/context safety, migrations, phone/accessibility and
   representative missionary/coach understanding, then measured workload budgets.
   Exercise failure/recovery and disable the affected module safely.
5. **Monitor only residual operating conditions after proof:** use the named
   signals/thresholds/owners/responses below. Security disclosure or incorrect
   financial meaning is not an acceptable monitored substitute for prevention.

| Signal                                                                   | Threshold                                                                               | Accountable owner role                      | Required response                                                                                                                                        |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized/old-scope summary release                                   | One confirmed event                                                                     | P12 security owner + P28 owner              | Disable affected profile/path, investigate scope and retained evidence, correct/requalify before reactivation.                                           |
| Canonical reference mismatch, duplicate fact or currency/unit mismatch   | One reproducible nonzero discrepancy                                                    | P13 or P16 metric owner, coordinated by P28 | Withhold affected measure, diagnose source versus projection, correct/rebuild through owner commands, replay regression proof.                           |
| Source freshness/coverage violation                                      | Any result presented as current/complete beyond its qualified source contract           | Owning source projection/operator           | Stop the incorrect claim, show safe state, restore source/rebuild; retain unaffected modules.                                                            |
| Summary latency/query/memory/freshness budget                            | Breach of the explicit measured release-profile budget at its supported workload        | P28/API operator with source owner          | Inspect bounded query plans and load, repair indexing/batching or constrain admitted workload without weakening access. No numeric SLA is invented here. |
| Sharing audit/outcome inconsistency                                      | One authoritative change missing required history, or one contradictory durable outcome | P28 sharing-command owner                   | Block affected mutation path, reconcile from authoritative evidence, fix atomicity/idempotency and requalify.                                            |
| Material misunderstanding of sharing or received-versus-expected meaning | One reproducible task failure in release/pilot review                                   | P28 product/design owner                    | Correct copy/interaction and repeat the affected task before expanding rollout; do not treat user confusion as training debt.                            |

**Final disposition: Accept with required amendments.** D9 is a complete reviewed
module-eligibility decision with concrete corrected wording, owner amendments,
UX, safeguards and proof obligations. It is not a claim that the current code or
hosted database already satisfies them. No further product answer, permission,
history range or runtime success is inferred.
