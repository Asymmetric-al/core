# Phase 27 D28 — clear partnership facts with optional giving-pattern ratings

2026-10-11, Asia/Bangkok. Fresh research retrieved 2026-10-11 UTC against Core
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`.

**Amended D28 explicitly ratified.** Review disposition: **Accept with required
amendments.** The founder subsequently instructed, “Yes, ratify this amended D28.”
The exact reviewed decision and its safeguards are ratified without substantive
change. The selected A+B direction includes tenant disablement, flexibility and
explicit donor dignity. The original A-only recommendation is not adopted.

This is the completed research/interview decision review. Formal PRD/OpenSpec
and tickets remain reserved for /to-prd and /to-issues. No product implementation,
permission activation, migration, live data change or runtime qualification is
claimed. Existing decisions and dated evidence remain preserved.

## Exact corrected decision

> **D28 — Provide clear partnership facts for every tenant and optional,
> explainable giving-pattern ratings for tenants that choose them.** Conversations,
> outreach, agreed follow-up and appropriate financial facts remain distinct and
> usable with ratings off. Financial ratings describe observed giving in a named
> scope and period. They never measure a person's worth, generosity, faithfulness,
> relationship quality, missionary diligence or likelihood of giving.
>
> New tenants start with ratings **Off**. An authorized tenant administrator can
> enable or disable them through the existing governed settings. Enabling them
> initially provides analysis only. An additional, clearly disclosed opt-in can
> enable source-owned internal review tasks for qualified changes; enabling
> analysis does not silently generate chores. Native operation needs no optional
> workflow product. A review task does not instruct staff to solicit or contact
> anyone, and it does not replace existing obligations.
>
> Show three separately explained financial dimensions—giving recency, gift
> frequency and amount in the selected period—with raw facts and quantitative
> band definitions. Use tenant-approved absolute ranges, not a weighted overall
> relationship score, opaque donor tier or comparison against other donors.
> Configuration is bounded to supported financial scope, observation period,
> ranges and optional internal-review rules. No arbitrary formula builder, wealth
> enrichment, email-open scoring or missionary activity scoring is introduced.
>
> Each result uses a qualified financial owner, identified subject and attribution
> lens, purpose scope, Legal Entity, currency, observation period, source cutoff
> and policy revision. Received giving, recognition, commitments and gifts awaiting
> finance remain different facts. Incomplete, unavailable, nonapplicable or private
> information is not zero or a low rating. Broader organization giving must be
> labeled as broader; it must not pretend to describe this particular partnership.
>
> Turning ratings off stops new computation/publication, current rating use and
> automatic rating-review effects across native views, APIs, filters, sorts,
> reports, exports and optional workflows. Withdraw all unresolved work whose sole
> requirement came from that automatic review policy, including claimed work,
> as **No longer required**, preserving its history. Independently created follow-up
> and source-required financial work remain. Previously lawful historical records
> retain their source retention/access rules; they are not current ratings.
>
> Re-enabling or changing the policy establishes a fresh qualified baseline.
> Never manufacture a decline, backfill a review-task backlog, revive ended work
> or restore old unread notifications because settings or data changed. Current
> tenant/source/field authority governs results and every derivative. Ratings stay
> within qualified staff financial projections; no donor, public or missionary
> rating exposure is added. D26 voluntary participation and D27 exchange meaning
> remain intact.

## Evidence, alternatives and confidence

**Verified repository facts.** P27 currently mandates transparent RFM bands and
score-drop tasks in its retained requirements. P9 reserves a placeholder score
socket. P3 excludes scores from missionary/donor projections. ADR0183 requires a
concrete source-owned human obligation before task projection. Therefore optional
ratings and separately enabled automatic review require an explicit owner
amendment; hiding a score card cannot satisfy the user's answer. Exact anchors
and reconciliation appear in [ownership evidence](d28-evidence/ownership.md).

Current API and client code still turn absent `donor.score` into zero. The
missionary roster uses a privileged source path, while a narrower tested
projection excludes score. These are real inconsistencies to resolve in the
reached release path, not proof that D28 exists or that RLS protects every egress.
See [authorization evidence](d28-evidence/authorization.md).

**Fresh primary comparisons.** The [practice appendix](d28-evidence/practice.md)
identifies product editions, dates, retrieved pages and limits:

| Evidence                                                                                                 | What is transferable; what is not established                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blackbaud RFM help                                                                                       | Financial recency/frequency/amount can support segmentation. Its giving-likelihood guidance is not validation of predictions for Asym or of ministry relationship quality.                                                            |
| Salesforce Nonprofit Cloud RFM configuration                                                             | Supports explicit input fields, compatible units and configurable ranges. Core can use clear financial definitions without importing an object/formula-processing platform. This is not NPSP behavior.                                |
| DonorPerfect donor-score explanation, 2025-12-11                                                         | Its relative score can change because other donors' giving changed. A lower score alone does not prove this donor changed. Core's fixed ranges avoid that dependency.                                                                 |
| Bloomerang engagement description, 2026-01-28                                                            | Composite engagement includes financial and nonfinancial behavior. Its treatment of email tracking/preferences is a counterexample to copying a vendor formula into D26/D27. Permission-based hiding is not verified tenant-wide Off. |
| [HubSpot score management](https://knowledge.hubspot.com/scoring/manage-lead-scores), updated 2026-08-25 | Turning scoring off retains last property values. That is a documented product choice; Asym's requested Off semantics instead end current operational rating use. Historical preservation and live consumption are distinct.          |
| [AFP Donor Bill of Rights](https://afpglobal.org/donor-bill-rights), undated                             | Supports voluntary philanthropy, professional conduct, respectful confidentiality and honest explanations. It is an ethical reference, not a scoring formula, legal opinion or a measured UX result.                                  |
| W3C and current shared UI sources                                                                        | Clear labels, non-color-only meaning, keyboard access, reflow and perceivable status are required. Component reuse alone does not prove a composed flow accessible. See [UX evidence](d28-evidence/ux.md).                            |

**Strongest alternative:** foundational facts and financial filters alone avoid
rating interpretation, configuration and maintenance. The user chose to retain
optional ratings; A+B preserves that simpler experience for tenants choosing Off.
The benefit of enabled bands is convenient, explainable financial grouping. No
conversion lift, forecast accuracy or superiority over another CRM is claimed.
An unrestricted composite would increase interpretive and privacy costs without
a demonstrated need. The chosen three dimensions satisfy the request more simply.

**Product judgments:** default Off, ratings-only initial activation, fixed absolute
bands, a secondary placement and separate review opt-in. These follow the user's
flexibility/dignity direction and the source evidence; they are not measured tenant
preferences. **Unverified:** actual agency volumes, preferred thresholds, deployed
RLS/grants, complete input services, composed UX and production performance. Each
has a release proof below. No invented ministry interview or donor feedback is
presented as fact.

## A restrained, understandable experience

Keep the existing partnership record and list. The person's/church's name,
partnership purpose, actual exchanges, outreach and agreed next action lead.
Financial analysis is secondary and only appears when enabled, applicable and
permitted. It is never a dominant health meter, star/flame badge, dollar-sign icon
or default ranking of who deserves staff care. Use exact base-maia/Base UI and
shared semantic tokens; no new design system or ratings dashboard.

Illustrative expanded financial detail, not a universal tenant policy:

```text
Giving pattern · Direct giving to [Legal Entity] · USD
Period: [explicit dates]                 As of [source cutoff]

Most recent qualifying gift    [date]       Band: [exact elapsed-day range]
Qualifying gifts in period     [count]      Band: [exact count range]
Effective amount in period     [amount]     Band: [exact currency range]

How this is calculated       View permitted giving history
```

A collapsed secondary line can show the period and a neutral summary with
**View giving pattern**. Standard lists keep existing work-based order; permitted
staff may deliberately add financial columns or sort/filter within one compatible
scope. Do not default to highest amount first. No numeric score is needed next to
a name. Nonfinancial partnerships retain the same useful record and next actions.

Use two understandable settings: **Giving-pattern ratings** and, only when
relevant, **Create internal review tasks for qualifying changes**. Both start off.
Saved settings are authoritative only after the server accepts them. Show a small
impact summary before activation or a consequential policy change: financial
scope, period/ranges, eligible/insufficient-data coverage and review behavior,
without exposing unauthorized rows. Do not ask for a second approval for an
ordinary permitted setting; P12/ADR0211 policy-widening approval remains separate.

Offer a visible, editable trailing-12-calendar-month period as a starting draft,
not an industry rule or a claim that annual giving should be monthly. A tenant can
select a supported different period, including its qualified fiscal period.
Exact dates and coverage are always visible. Tenant-approved numeric boundaries
must be reviewed before bands activate; raw facts are already useful while setup
is incomplete. Do not invent universal currency tiers, silently use zero values,
fit thresholds from hidden peers, or require staff to configure them per donor.
Use a small range editor with exact units and validation, not arbitrary weights,
free code, custom SQL, a cohort builder or semantic AI rules. A qualified preset may
prefill a draft, but no undocumented preset becomes accepted policy automatically.

**Disable:** explain that current ratings and their automatic reviews will stop,
while ordinary facts, deliberately created follow-up and finance obligations stay.
Keep the action available even if computation is failing or no preview count can
be loaded; do not trap the tenant behind an unavailable dependency. A stale saved
view using ratings shows **This view uses giving-pattern ratings, which are off**,
with repair/use-standard-view actions. Do not silently remove its filter and
broaden an audience or export. Off is not Delete and does not zero old values.

**Re-enable:** show **Preparing current giving patterns** until a qualified
baseline is available. Review automation remains off unless deliberately selected
again. Failed or ambiguous saves retain the draft where still permitted and recover
the same accepted intent. Never report Saved while the current server state is
unknown. Unavailable, insufficient coverage and inapplicable are different states.

On mobile, progressively disclose explanations, preserve focus/scroll on return,
and avoid a large horizontally scrolling score grid. Use persistent labels,
keyboard/screen-reader status, visible unobscured focus, shared touch targets,
320 CSS-pixel reflow/equivalent zoom, light/dark contrast and reduced motion. Keep
amount/currency and dates readable in the user's locale, RTL and long/multiscript
names. On low-bandwidth or interrupted connections, load ordinary record facts
independently of rating details, fetch explanations/history on demand and retain
only still-permitted unsaved edits for safe retry. A slow or failed rating service
must not block ordinary relationship work. Reuse existing names and addresses.
No new donor input, checkout step,
public badge, missionary log, duplicate entry or default sensitive offline cache.

## Exact developing requirements

These R01–R18 clauses are the permanent prevention strategy referenced by the
category review. They are interview requirements for the later formal package.

1. **R01 — Optional financial analysis:** always preserve foundational facts.
   New-tenant defaults are Off; existing placeholder values are not opt-in evidence.
   Keep analysis and automatic review as separately deliberate settings, with review
   operational only while ratings are enabled. Preserve tenant choice across upgrades.
2. **R02 — Bounded meaning and configuration:** use separate R/F/M financial bands
   with raw values, exact quantitative ranges and an explanation. No composite
   person/relationship score, cross-donor percentiles, external wealth, inferred
   generosity, probability, open/click or missionary logging inputs. Permit only
   supported scope/period/ranges and finite source review policies. Validate ordered,
   nonoverlapping complete ranges, explicit boundary inclusivity and units; reject
   invalid configuration atomically rather than saving a partial policy.
3. **R03 — Financial ownership and grain:** every calculation binds tenant, subject,
   financial lens, optional qualified purpose/designation scope, Legal Entity,
   currency, observation interval, source cutoff/coverage and immutable policy
   version. Default draft lens is the Party's direct received giving in a selected
   entity/currency, labeled accordingly. A recognition lens uses qualified P14 facts
   separately, never sums with legal giving. Scope is never inferred from church
   membership, household, assigned staff or the currently open partnership screen.
4. **R04 — Exact financial arithmetic:** use the owners' current effective amounts
   and gift dates, with integer minor units/exact decimals and currency precision.
   Count distinct qualified financial gift occurrences, not lines, postings, credit
   roles or provider deliveries. Preserve source-qualified cash/noncash and return
   treatment; do not add pledged, requested, awaiting-finance or processor-pending
   amounts as received money. No FX, unlike-currency or unlike-entity scalar. Each
   recognized-money lane remains recognition, not legal received giving. The
   financial appendix fixes occurrence eligibility and correction treatment.
5. **R05 — Time and coverage:** interpret explicit interval boundaries using the
   qualified financial calendar/date meaning, not record-save time or implicit
   browser timezone. Preserve date-only precision, leap dates and fiscal/calendar
   edges. Giving recency is distinct from D27 exchange recency. Known zero, no
   qualifying gift, not applicable, insufficient/partial, stale, denied and unavailable
   remain distinct. Never extrapolate completeness from a display page or capped
   query. A meaningful last-gift claim needs appropriate historical coverage.
6. **R06 — Authority and safe egress:** derive tenant/actor/capability from trusted
   current server context. Check exact staff financial projection rights separately
   from permission to manage settings. All dates, values, bands, explanations,
   rank/sort/filter/count, task previews, caches, exports and AI/report consumers
   preserve current subject/source/field/purpose authority. No new missionary,
   donor or public score projection is authorized. P12/ADR0211 rules govern any
   proposed projection widening; sharing a partnership is not a grant.
7. **R07 — One authoritative policy boundary:** mutate settings through a qualified
   P27 server command with atomic policy revision, history and current activation
   generation. No parallel user-controlled enabled booleans in app preferences or
   a generic tenant JSON field that bypasses the command. Source facts remain with
   their owners; derived results are replaceable projections, not another ledger.
   A replay returns the accepted operation subject to current result authority.
8. **R08 — Genuine Off and generation fencing:** current policy gates calculation
   admission/publication, current reads, queries, exports/delivery and every task
   producer, including optional workflows. Serialize conflicting mode/policy changes
   and reject stale generations at effect acceptance and result release. Off ends
   eligibility immediately at its authoritative boundary even if asynchronous
   cleanup is delayed. Invalid disabled-rating predicates fail explicitly; never
   ignore them. Earlier delivered data cannot be recalled; clear current UI state
   on invalidation/context change and keep retained artifacts explicitly historical.
9. **R09 — Comparable refresh:** initial activation, review opt-in, re-enable,
   source-lens change, threshold/window changes and material coverage repair establish
   a qualified baseline. Do not compare incompatible policies/subjects/currencies
   or treat changed data measurement as fresh donor behavior. Classify causes such
   as source giving, elapsed time, return/correction, historical import and policy.
   Fixed-calendar rollover needs a new comparable interval, not an automatic drop
   against the previous full year. A supported rolling-window age transition can
   be evidence only under the explicit review policy, never a missed promise.
10. **R10 — Qualified internal review:** a finite P27 source predicate may create
    one concrete internal review for a qualifying comparable change only when the
    tenant separately enables that policy and an authorized responsible person can
    be resolved. Use the finite band-entry/episode policy defined below. No task from
    unknown/stale data, hidden facts, baseline creation,
    cohort change, retrospective import or a formula change. Respect applicable
    source-work lifecycle, existing plans and scoped routing; paused/closed work
    is not implicitly reopened. Do not generate an unowned reminder or leak detail
    to a fallback recipient. Actual missing-owner exceptions remain source-owned.
11. **R11 — Work lifecycle and idempotency:** one durable source review episode
    projects to ADR0183 shared work, regardless of native/workflow caller, retry,
    worker or policy publication. Combine reasons within that same subject/scope
    occurrence instead of one task per axis or poll. Completing an internal review
    can record **No change needed**; it is not a contact or financial outcome.
    Claiming/opening/commenting does not transform it into independent follow-up.
    Disabling ratings or automatic review withdraws all unresolved solely automatic
    occurrences as No longer required. Preserve completed evidence and deliberately
    created independent work. Re-enable never resurrects old task/unread identity.
12. **R12 — Failure and correction:** if evidence becomes unavailable, block new
    inference and distinguish transient inability from a disproved condition.
    Existing review is not automatically completed or declared resolved. Current
    source applicability decides actionable/temporarily blocked/withdrawn outcomes.
    Corrections and deduplication can move a date/count/amount/band either direction;
    record the cause, invalidate projections and amend/withdraw unsupported review
    reasons. Lost responses recover the same business effect; bounded resumable
    reconciliation covers authoritative write followed by failed task/cache effects.
13. **R13 — Database invariants:** tenant-aware keys/FKs bind policy, scope, result
    and review to the same authorized tenant and source identities. Policy revisions
    and accepted history are append-only under their lawful retention/correction
    rules; current activation has a single authoritative revision. Unique accepted
    effect/episode identity prevents duplicate publication/work. Check amounts,
    currency units, interval ordering, range coverage and valid result states;
    a missing fact has no zero default. Do not cascade-delete financial, policy or
    work history because a Party, user or policy is retired. Trusted server commands
    supply actor/tenant/approval attribution and prevent scope-changing row updates.
14. **R14 — Actual RLS and privileged paths:** qualify grants, effective SELECT,
    INSERT/UPDATE USING/WITH CHECK, DELETE, views, functions/RPCs and service-role
    paths together. Explicitly protect immutable scope and append-only history;
    a tenant-row predicate alone is not field/action permission. PostgreSQL may
    reuse USING when WITH CHECK is omitted: inspect effective behavior, do not
    diagnose bypass merely from omission. Derived stores are non-public by default;
    ordinary clients cannot forge bands or disable-generation state. Privileged
    workers still carry a finite tenant/source purpose and current authorization.
15. **R15 — Privacy and audit:** minimize retained rating payloads and source
    references; no private note bodies or enrichment. Keep technical traces distinct
    from durable policy/review history and security audit. Record who changed what,
    when, accepted policy/source revisions, calculation cutoff, reason and effect
    result without copying full donor records into logs. Retention, erasure, export
    and backups follow governing owners; append-only does not mean forever.
16. **R16 — Efficient native operation:** project qualified source aggregates with
    bounded, resumable tenant work, compatible tenant/scope indexes and set-based
    reads. Do not recalculate raw full histories per list row or page load. Rating queries/jobs cannot block ordinary record facts. Only
    enabled scopes schedule calculation. Persist expected refresh/deadline and
    source cutoff, visibly mark stale output, and isolate a large tenant's backlog.
    Materialization requires measured query/job evidence; no new warehouse, broker,
    vendor, cache authority or workflow dependency is introduced speculatively.
17. **R17 — Migration and rollout:** census every legacy score reader/writer,
    report/export and retained value; never convert placeholder zero to a real band
    or treat existing rows as enablement. Introduce qualified readers/commands before
    activation and require old writers/consumers to reject unsupported generations.
    Use tenant-scoped rollout, review off initially and an operational stop control
    that preserves tenant intent. Rollback means disable new effects and retain new
    data/history; schema downgrade cannot erase accepted revisions or financial truth.
18. **R18 — UX and proof:** use the compact facts-first flow, exact shared controls,
    accessible localized presentation and honest setup/loading/current/error states.
    Off must leave the ordinary product useful. Every amendment maps to sources,
    formal requirements, implementation tasks and outcome tests at the authorized
    later steps. No default donor ordering, contact permission or dignity inference
    comes from a financial band. No activation until financial, authorization,
    concurrency, migration and actual composed-user-flow proof passes.

## Financial calculation and review episodes made precise

For the native starting profile, use one canonical Party's **direct legal monetary
giving to the named receiving Legal Entity in one original currency**. Obtain
current effective money and gift dates from the qualified financial owner. The
reusable P25 D12 basis includes actual charitable fee cover where admitted, applies
finalized returns/corrections and does not deduct processor fees or tax benefits.
It does not import P25 Home's presentation rules. Noncash valuation, liquidation,
pledges and expectations cannot be substituted into this monetary profile.
Qualified recognition and narrower purpose profiles remain separate supported
lenses; unresolved campaign-attribution semantics block only that profile, not
independently qualified direct giving.

Let `G` be distinct eligible source gift roots whose qualified gift dates are in
the declared interval and whose current scoped eligible amount `q(h)` is positive. No source gift dated
after the qualified evaluation as-of date D participates, including in a configured
period whose end is later; unsupported future-date evidence cannot create negative
recency or be silently treated as a completed gift.
A period extending beyond D is visibly observed only through D and labeled
to-date; it is not represented as a completed full period.
Frequency is `count(G)`. Amount is `sum(q(h))` in exact currency units. Recency is
calendar days from the financial owner's as-of date `D` to the most recent gift
date **within G**. Complete empty G gives known count/amount zero and **No qualifying
gift in this period**, not numeric recency zero or infinity. A verified older gift
can be shown separately as outside the period. Unresolved facts that could alter
an axis leave that axis unqualified; other independently complete facts remain
usable with their own explanations. A full return removes its gift from G, while
a partial return leaving a positive amount retains one occurrence. Both retain
source history and correction cause. An unresolved refund is not a finalized
financial reversal. Duplicate equal real gifts remain distinct; duplicate delivery
of the same source gift does not.

For the editable trailing-N-calendar-month starting draft, use source gift dates
in `(shift_months(D, -N), D]`: shift in the issuer's qualified calendar, clamp an
invalid month-end to that month's last valid day, exclude the lower date and
include D. Show the actual resulting inclusive start/end dates to the user. This
is not N×30 days or N/12×365 days. The starting draft N=12 is product judgment,
not an accepted tenant policy or a claim about correct solicitation frequency.
A supported fiscal or closed-period profile uses that source's explicit endpoints
and never silently compares partial-period values to a complete prior period.
Every numeric band has explicit inclusive/exclusive bounds and units; no bound
is inferred from peers, another currency or a display page.

Optional internal review uses a **finite band-entry policy**, not arbitrary rules:
for one exact financial basis, the administrator selects which defined financial
bands warrant an internal review. The explicit known-empty-period condition may
also be selected. Only qualified applicable financial participation is eligible;
zero direct gifts do not silently create adverse review for a recognition-only or
nonfinancial partnership. The review predicate is true when any selected condition
is met; unknown/unavailable/inapplicable is neither true nor proved false.

After a fresh qualified baseline, a compatible observed transition from outside
to inside that selected set starts **one source review episode**. Combine current
reasons in that episode; three changed axes or repeated calculations do not create
three reviews. Completing a review while the condition remains true does not
re-arm it. Qualified evidence that all selected conditions no longer apply ends
any unresolved episode as No longer required. Only a subsequently observed new
entry can start another episode. Source identities/ordering establish the episode;
a day, polling job, transport attempt, policy version or workflow run is not its
business identity. Missing evidence does not count as leaving and re-entering.

Mode/policy/scope changes, retrospective imports, identity/attribution changes and
coverage repair establish baselines rather than entries. Financial corrections
reconcile or invalidate existing reasons without manufacturing a fresh adverse
entry; their independently required financial work remains. Clock aging or a gift
leaving a rolling interval can enter a selected condition only under that exact
approved temporal policy, with the cause stated as time/window movement, not a
broken commitment. Paused/closed-work rules, prior deliberate review outcomes,
current responsibility and source applicability still govern admission. Turning
reviews off withdraws its unresolved episodes and prevents any re-arm until a
new explicit review activation and baseline.

## Category-by-category adversarial review

Severity is consequence if implemented incorrectly; likelihood is qualitative
exposure, not a measured incident rate. **High** includes privacy/financial truth
or major workflow harm; **Moderate** means substantial confusion, maintenance or
avoidable workload. Each row identifies the failure, why it matters, evidence,
effect on the selected answer and exact required R-clause prevention. Shared
concerns recur only where the category asks a distinct question.

| Category                                            | Material concern, consequence and evidence                                                                                                                                                                                                                                                             | Severity / likelihood                                      | Effect and permanent required change                                                                                                                                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1 Problem validity, necessity and alternatives**  | **Yes.** A universal score adds configuration and can be mistaken for relationship value; facts/filters solve much of the everyday need. Vendor financial segmentation is real, but no missions outcome benefit is measured. User explicitly wants optional B.                                         | Moderate / plausible                                       | **Narrow, do not reject A+B.** Facts remain primary; Off is a complete experience, enabled B adds defined financial grouping only. R01–R03/R18; practice evidence and exact decision.                                          |
| **2 Brittleness**                                   | **Yes.** A result without fixed scope, units, dates or coverage changes meaning after imports, calendar changes or permission changes. Relative DonorPerfect scores demonstrate unrelated-donor movement.                                                                                              | High / likely without explicit definitions                 | **Amend.** Absolute ranges, exact input tuple, cause-aware baselines, honest missingness. R02–R05/R09/R12.                                                                                                                     |
| **3 Technical debt**                                | **Yes.** Reusing `donors.score`, client zero fallback or per-surface flags creates dual truth and makes Off unenforceable. Current API/client evidence demonstrates the tempting shortcut.                                                                                                             | High / likely if reused                                    | **Amend.** One policy command and derived projection; census/retire reached placeholder consumers; no shadow ledger. R07/R13/R17.                                                                                              |
| **4 Edge cases**                                    | **Yes.** Annual/nonfinancial support, DAF/recognition, split gifts, full/partial returns, leap/fiscal dates and unknown imports can falsely downgrade support or double-count it. Financial owner semantics require separate lenses.                                                                   | High / plausible                                           | **Narrow financial claims.** R03–R05/R09/R12; apply the financial appendix and edge cases below, not a generic amount/count formula.                                                                                           |
| **5 Footguns**                                      | **Yes.** Turning on a helpful view could create chores; turning it off could silently broaden a saved audience or complete real work. Q28 B and HubSpot's retained-value behavior expose both assumptions.                                                                                             | High / plausible                                           | **Amend.** Separate review opt-in, impact explanation, fail explicit disabled predicates, truthful withdrawal not completion. R01/R08/R11/R18.                                                                                 |
| **6 Tenant safety**                                 | **Yes.** Cached results/settings/workers keyed only by donor ID or shared template can apply another tenant's ranges or expose giving. A globally unique ID alone is not authorization.                                                                                                                | High / plausible                                           | **Amend.** Tenant-bound identities, policy versions and current consumer/worker checks; no cross-tenant cohorts or global toggles. R03/R06–R08/R13–R14.                                                                        |
| **7 Database, RLS and authorization**               | **Yes.** Tenant-row RLS does not enforce financial fields or mode; service-role paths can bypass it. Legacy roster projection and narrower safe snapshot differ. A permitted update could change tenant/lens/history.                                                                                  | High / plausible; concrete adjacent unsafe seam            | **Release blocker, not proof of delivered D28 flaw.** R06/R07/R13/R14; verify grants, both effective mutation predicates, immutable relationships, invoker/definer/RPC paths and actual negative tests.                        |
| **8 Overengineering**                               | **Yes if unrestricted customization is copied.** Arbitrary formulas, weighted composites, cohorts, external enrichment and a new analytics/workflow engine solve unproved needs and expand privacy/operations. Salesforce configurability is a comparator, not an architecture mandate.                | Moderate / likely with an unbounded “flexible” requirement | **Narrow.** Three explained bands and finite policies using existing owners; no generic builder or speculative infrastructure. R02/R07/R16.                                                                                    |
| **9 UX/UI and user friction**                       | **Yes.** Primary red/green scores, unexplained ranks, automatic review noise, inaccessible range editors or monetary labels beside names can confuse staff and undermine donor dignity. Shared components alone do not prove UX.                                                                       | High / plausible                                           | **Amend.** Facts first, secondary neutral financial details, two clear opt-ins, usable Off, accessible mobile/localized states and observed comprehension. R01/R02/R18; UX appendix. No donor checkout changes.                |
| **10 Source of truth, ownership and invariants**    | **Yes.** Summing legal money with recognition/commitments or letting a cached score own source work creates false money and authority. P13/P14/P16/ADR0183 govern distinct facts.                                                                                                                      | High / likely with generic donor totals                    | **Amend.** Exact financial tuple, one policy/effect owner, conserved distinct gift identity and replaceable read models. R03/R04/R07/R11/R13.                                                                                  |
| **11 Hidden coupling**                              | **Yes.** Ratings could depend on optional Workflow Studio or enable missionary disclosure; disabling them could break ordinary financial reports or tasks. P3/P33/P34 and D26 prohibit those shortcuts.                                                                                                | High / plausible                                           | **Amend.** Native independence; current-mode enforcement across consumers; preserve independent obligations and existing surface exclusions. R01/R06/R08/R11/R16.                                                              |
| **12 Failure modes**                                | **Yes.** Config save can succeed before cache/task cleanup; a timeout invites duplicate changes; unavailable evidence can become zero or task resolution. Supabase/RPC and asynchronous source boundaries do not make this atomic automatically.                                                       | High / likely under retries/outages                        | **Amend.** Atomic authoritative revision and recoverable receipts; immediate eligibility fence with bounded reconciliation; truthful unavailable state. R07/R08/R12.                                                           |
| **13 Lifecycle, time, concurrency and idempotency** | **Yes.** Off racing calculation, stale settings saves, re-enable or policy edits can publish disabled values, revive tasks or create duplicate decline episodes. A clock/window transition is not necessarily new donor behavior.                                                                      | High / likely without explicit ordering                    | **Amend.** Versioned command, serialized activation fence, comparable baseline, stable business episode and distinct event causes. R05/R07–R12; schedule cases below.                                                          |
| **14 Data integrity**                               | **Yes.** Line counts inflate frequency; retries duplicate gifts; return corrections and merge aliases drift results; unknown-to-zero is already a legacy shortcut.                                                                                                                                     | High / likely with raw row aggregation                     | **Amend.** Source-normalized distinct identities/effective values, coverage states, reconciliation and correction invalidation. R03–R05/R12/R13.                                                                               |
| **15 Security and privacy**                         | **Yes.** A band or ranking can disclose protected giving even when amounts are hidden. Role names, shared history or tenant enablement do not grant it; logs/exports can retain unnecessary profiles.                                                                                                  | High / plausible                                           | **Amend.** Exact staff egress, derivative access checks, no cohort leak, data minimization and lawful retention. R06/R14/R15. Retain current missionary/donor/public exclusions.                                               |
| **16 Scalability and performance**                  | **Yes.** Recomputing every tenant/record on page load, history joins per row, unbounded scans and competing large tenants can make rating freshness and ordinary work unreliable. No production-shaped benchmark is available.                                                                         | Moderate–High / likely at growth if naive                  | **Amend, do not invent capacity claims.** Bounded enabled-scope jobs, indexed source projections, measured materialization and declared freshness budget. R16/R18. Quantified release evidence is mandatory before activation. |
| **17 Operational burden**                           | **Yes.** Excessive ranges/policies or unowned review floods need manual cleanup and tribal knowledge. Hidden Off, task conversion and imports make repair unsafe.                                                                                                                                      | Moderate / plausible                                       | **Narrow and amend.** Small tenant setup, exact source routing, one review episode, safe source repair and explicit runbooks. R02/R10–R12/R16–R17.                                                                             |
| **18 Observability and auditability**               | **Yes.** A bare score gives no reason for change; technical logs cannot explain accepted policy, source cutoff, withdrawal or actor to staff.                                                                                                                                                          | High / likely if only current scalar retained              | **Amend.** Durable minimal policy/review evidence plus separate technical/security telemetry and actionable indicators. R09/R12/R15; monitor table below.                                                                      |
| **19 Dependency and integration**                   | **Yes.** Provider/CRM callbacks, copied vendor formulas or optional workflows could become financial or rating authority; replay can duplicate source effects. Published vendor functions do not qualify Core's exact adapter.                                                                         | High / plausible                                           | **Narrow.** No new external scoring dependency; consume P13/P14/P16-owned facts, not webhooks/raw vendors; every caller honors native mode and effect identity. R03/R04/R08/R11/R16.                                           |
| **20 Migration, rollout and upgrade**               | **Yes.** Old code may expose newly meaningful score data or ignore Off; a backfill may create scores/tasks for every tenant. Rolling back schema may destroy accepted history.                                                                                                                         | High / plausible                                           | **Release blocker.** Never backfill real bands into the old scalar; qualify every reader/writer, explicit opt-in, fresh baseline, tenant rollout, stop control and forward-safe rollback. R17.                                 |
| **21 Testability, traceability and proof**          | **Yes.** “Flexible ratings” cannot be tested; current placeholder/tests and vendor descriptions cannot certify actual authorization, math or UX. Current owner text mandates behavior now made optional.                                                                                               | High / certain if left vague                               | **Amend.** Exact requirements, source amendments and AC01–AC36 below, linked into formal source/projections at /to-prd and tickets at /to-issues. No implementation evidence invented. R18.                                    |
| **22 Other development hazards**                    | **No additional material hazard found outside the categories above.** Reviewed scope creep into wealth screening, probability claims, default highest-giver prioritization, public badges, new checkout fields and missionary evaluation. These are expressly excluded, not unresolved future options. | Covered by the identified high/moderate concerns           | R01/R02/R06/R18 preserve the boundary; any later proposal for those capabilities requires its own explicit owner decision. No generic “monitor later” exception is used.                                                       |

## Resolved financial and lifecycle edge cases

| Scenario                                                      | Required outcome                                                                                                                                                               |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prayer/hosting/introductions partnership                      | Foundational facts and follow-up work normally; financial analysis is inapplicable where no relevant financial scope is selected, not low engagement.                          |
| Annual supporter; follow-up already agreed                    | Explain the period and actual pattern. Frequency alone is not a missed payment or need to solicit sooner. P16 owns a real commitment exception.                                |
| One gift split across designations                            | Count one eligible gift occurrence within the selected financial scope; use only its eligible scoped amount. Do not count lines or sum its header and lines.                   |
| Donor-advised fund, employer match or recognition             | Legal giving and qualified recognition remain separate labeled lenses. Never credit the same money twice in a combined rating or infer attribution from names.                 |
| Same church, different ministries/entities/currencies         | Only exact scope feeds the band. Wider agency giving is explicitly labeled; no cross-currency conversion or implicit partnership attribution.                                  |
| Full/partial return, void, merge or correction                | Recompute from effective source facts. A return is not new negative donor generosity; trace the correction and amend affected reasons. Preserve source history.                |
| Unknown history versus known no gifts                         | Display coverage and an honest no-gift/zero fact only when proved. No-data never becomes a low score; unknown last gift is not a fabricated distant date.                      |
| Peer gives a larger gift or staff changes list filter         | No change to this subject's fixed-band result. No dependency on hidden peers or visible table rows.                                                                            |
| Settings Off while worker computes                            | Current generation check rejects stale publication and task effects; current results/exports cannot bypass Off. Cleanup delay does not restore eligibility.                    |
| Source write succeeds but task projection fails               | One durable source occurrence awaits bounded reconciliation; retry does not create a second requirement. UI acknowledges accepted policy separately from cleanup state.        |
| Review was claimed/commented before Off                       | Withdraw if its only obligation is automatic rating review. Claim/comment is not deliberate creation of independent follow-up. Keep lawful discussion/history.                 |
| Staff separately planned a call after a review                | The deliberately created source follow-up survives Off; the view explains that it is independent. Consent and quiet plans still govern actual contact.                         |
| Calculation unavailable or finance coverage lost              | No new downgrade/upgrade. Mark evidence unavailable/stale; existing source review is not silently completed, and access revocation immediately protects its details.           |
| Re-enable, new ranges, imported past gifts or fiscal rollover | Fresh comparable baseline where needed; no historical-drop flood, duplicate task or restored unread. Display source/policy change as its actual cause.                         |
| Old export/report or saved filter exists                      | Preserve historical artifacts through their owner rules; block new live disabled-rating use/distribution. Explicitly repair a disabled predicate instead of broadening output. |

## Source amendments and traceability

The user selected A+B. The following exact amendments are required for the formal
/to-prd reconciliation, not applied to existing formal owner documents this turn:

1. **P27 roadmap and retained owner scoring clause:** replace mandatory universal
   RFM/score-drop-task language with the corrected D28 decision and R01–R18. Facts
   are always available; ratings and automatic internal reviews require the separate
   tenant choices above. Preserve existing actual next-action/exception obligations.
2. **P9 score socket and CRM source:** replace the promise of a universally active
   scalar with optional qualified financial analysis. Legacy `donors.score` is
   placeholder history, never input, opt-in proof or a compatibility transport for
   D28. Preserve shared identity/record/task ownership and qualified current fields.
3. **P3/P12/P28:** retain the current score exclusion for missionary, donor and
   public projections. D26's shared-interaction exception does not widen it.
   Tenant enablement grants no capability. Register/qualify exact staff settings,
   financial aggregate/result and review projections with P12 before activation;
   follow ADR0211 where a projection policy actually widens.
4. **P13/P14/P15/P16/P24:** retain received-money, legal/recognition, intake,
   commitment, currency and entity authority. P27 consumes qualified facts in the
   exact financial tuple; unsupported data lenses are unavailable, not substituted.
   No change to donation checkout, receipts, promises or financial execution.
5. **ADR0183/ADR0027:** P27 owns optional rating-review applicability, finite typed
   actions, episode identity and source closure. Shared tasks/notifications project
   that truth; read, claim, completion, withdrawal and access loss stay distinct.
   Off ends solely automatic unresolved work, not independent source obligations.
6. **P33/P34 and consumers:** reuse P27's semantics and current enablement for
   rating-derived analysis/work, never shadow-recompute disabled ratings. Preserve
   independent financial reporting, ordinary filters and native functionality when
   optional products are absent. Migrate each affected source and generated view
   together, not by an additive contradictory banner.

Term resolved for CONTEXT.md: **Giving-pattern rating** means a tenant-optional
financial band for an identified subject and scope, based on qualified observed
giving and an explained period/rule. It is not a relationship-value or missionary
performance judgment. **Giving-pattern review** is separately enabled, source-owned
internal work to examine a qualified change; it is not a solicitation instruction.

## Falsifiable acceptance criteria

| ID   | User-visible or domain proof required                                                                                                                                                                                                                                       |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 | A new tenant has usable facts/ordinary work and ratings/review Off; legacy zeros never opt it in.                                                                                                                                                                           |
| AC02 | An authorized tenant administrator enables ratings only; another tenant and ordinary unauthorized caller cannot read/change that policy.                                                                                                                                    |
| AC03 | Turning review on requires a separate disclosed intent and a qualified source/routing policy; analysis alone creates zero review tasks.                                                                                                                                     |
| AC04 | Off leaves exchanges, outreach, next actions, appropriate giving facts and independent obligations usable without Workflow Studio.                                                                                                                                          |
| AC05 | Bands expose exact subject/lens/purpose/entity/currency/window/definitions/cutoff; context cannot silently become partnership attribution.                                                                                                                                  |
| AC06 | Given one split gift, multiple postings/credit roles and repeated delivery, frequency counts the same qualifying gift once and amount is not duplicated.                                                                                                                    |
| AC07 | Legal giving, recognition, DAF/match, commitments and awaiting-finance examples retain separate financial meanings and no double-credit scalar.                                                                                                                             |
| AC08 | Full/partial return, void and correction rederive exact amounts/counts/dates with a correction cause, not an alleged new decline in relationship quality.                                                                                                                   |
| AC09 | Mixed currencies/entities reject combined rating; exact decimal/minor-unit boundary values remain correct for each supported currency precision.                                                                                                                            |
| AC10 | Exact lower/upper band boundaries, known-empty G, zero where meaningful, top open range, gaps, overlap, reversed bounds and incompatible units produce defined valid results or atomic validation errors.                                                                   |
| AC11 | Known no gifts, no applicable lens, incomplete imports, denied/hidden, stale and unavailable evidence never collapse to the same zero/low score.                                                                                                                            |
| AC12 | Date-only gifts, timezone travel, leap day, fiscal boundary, start/end inclusivity and clock advancement use the defined source interval, independent of save time.                                                                                                         |
| AC13 | Changing another donor, viewer filter or portfolio does not change this subject's fixed-range band or disclose hidden population data.                                                                                                                                      |
| AC14 | Cross-tenant/other-purpose/other-lens references and caller-forged actor/owner/approval fields fail without writes or protected diagnostic leakage.                                                                                                                         |
| AC15 | Direct Data API/RPC/view/table and privileged worker probes enforce actual grants, effective old/new-row policies, immutable scope and field/action limits.                                                                                                                 |
| AC16 | Missionary, donor and public APIs/export/brief/cache paths cannot expose real D28 ratings; all reached legacy score egress is removed or explicitly qualified before activation.                                                                                            |
| AC17 | An Off command racing calculation wins according to the authoritative order; no old-generation publication/current read/export/task effect is accepted after the fence.                                                                                                     |
| AC18 | Concurrent policy editors receive an explicit conflict instead of silently combining settings; a lost response retrieves the same accepted intent.                                                                                                                          |
| AC19 | Off→On and review-Off→On create fresh comparable baselines, no past-drop backlog, old task resurrection or restored unread.                                                                                                                                                 |
| AC20 | Policy/range/scope/currency/window changes, imports and coverage repair are identified as measurement changes; no comparison of incompatible snapshots generates work.                                                                                                      |
| AC21 | A real qualifying comparable change under an enabled review policy creates one source episode with a correctly authorized responsible recipient and concrete internal-review action.                                                                                        |
| AC22 | Native/workflow/retry/replay triggers for the same source episode converge; three changed dimensions or repeated polls do not create three independent reviews. Completion while still in-range does not re-arm; qualified exit and later re-entry may start a new episode. |
| AC23 | Missing/revoked reviewer/assignment produces a source-safe repair state; it sends no details to an arbitrary tenant fallback and never contacts the donor.                                                                                                                  |
| AC24 | Every unresolved solely automatic review, including claimed/commented work, becomes No longer required when its feature is turned off; it is not marked Completed.                                                                                                          |
| AC25 | Completed review evidence, deliberate independent follow-up and D6/P15/P16/P28 source obligations survive the appropriate mode change.                                                                                                                                      |
| AC26 | A reviewer can record No change needed without pretending to make contact; a separately created follow-up obeys its own work/consent lifecycle.                                                                                                                             |
| AC27 | Source write followed by lost task/cache effect is visible and reconciles once; retry, crash and partial cleanup never reinstate a disabled generation.                                                                                                                     |
| AC28 | Missing source service or lost coverage yields unavailable/stale, blocks new inference and does not fabricate improvement, completed review or financial default; ordinary independently qualified record facts still load.                                                 |
| AC29 | Saved views/filters/exports using disabled or unauthorized bands fail explicitly with repair actions, never silently broaden a segment or result.                                                                                                                           |
| AC30 | Historical exports remain governed and clearly historical; scheduled/new rating distribution stops while Off and ordinary financial reporting remains available.                                                                                                            |
| AC31 | Staff can explain bands as financial observations, find the source, distinguish actual-exchange recency and recognize unknown/nonfinancial cases without coaching. Any unsafe interpretation blocks rollout expansion.                                                      |
| AC32 | Keyboard/screen-reader, mobile keyboard/touch, 320 CSS-pixel reflow/zoom, light/dark contrast, RTL, long names and localized currencies/dates preserve meaning, focus and feedback.                                                                                         |
| AC33 | Slow/lost saves and navigation/context changes preserve only still-permitted drafts, avoid duplicate effects and never falsely report a saved mode.                                                                                                                         |
| AC34 | Production-shaped small/large/skewed tenants and enabled/disabled mix meet the declared freshness/query/job budget with measured plans, memory, retries and fair progress; evidence states exact volumes and units.                                                         |
| AC35 | Mixed old/new deployments, restored data, tenant migration and roll-forward/stop scenarios preserve Off, policy/history and financial truth; no old writer/reader can bypass the new gate.                                                                                  |
| AC36 | No donor checkout field, public rating, money-worth label, missionary quota, default highest-giver ranking or automatic solicitation is introduced; requirement/source/test/release traceability is complete.                                                               |

## Synthesis, ordering and monitored residual risks

**Resolved before recording this review:** combined A+B scope; facts-first meaning;
neutral financial bands; Off default; separate review opt-in; exact source/lens
separation; all Off/re-enable/history semantics; retained missionary/donor/public
exclusion; the mandatory-scoring owner conflict. No micro-question remains about
these ordinary safeguards. The exact corrected decision above records the required
amendment, without claiming later founder ratification.

**Carry into the spec/design first:** reconcile all six source amendments and the
glossary; map financial tuple and qualified source projections; define bounded
policy validation, dates/ranges and source-work episodes. Then map R01–R18 and
AC01–AC36 into tasks at /to-issues. Configuration defaults do not substitute for
missing source authority.

**Implementation safeguards, in dependency order:** qualify financial facts and
coverage; qualify staff settings/read/egress permissions; implement atomic policy,
generation and durable effect identity; implement complete source projection and
correction; wire the native source review and its shared-task reconciliation;
compose the small UI; prove migration/old-client fences and end-to-end cases.
Pilot facts and optional ratings first. Automatic review requires its own qualified
acceptance and deliberate tenant activation. No review task writes directly to a
shadow task table or bypasses a missing source contract.

**Release gate:** obtain production-shaped source volumes and numeric refresh/
latency/job budgets from the actual deployment, measure them and record exact
units; conduct intended-user and assistive-technology tests. This review provides
no unverified throughput/latency guarantee or claim that the proposed UI is already
beautiful/usability-proven. Missing source/permission proof blocks activation of
that capability, not the facts-only product. Safe rollback disables new effects
and rolls forward corrections while preserving accepted history.

Only residual operational behavior belongs in monitoring after those gates pass:

| Signal                                                                                           | Threshold                                                       | Accountable owner                                                                          | Response                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current rating publication or new rating effect accepted after Off/current-generation mismatch   | Any accepted occurrence; target 0                               | P27 feature owner and platform on-call                                                     | Stop rating effects for affected tenant, revoke stale projection eligibility, investigate/reconcile from source history and prove fence before re-enable. |
| Unauthorized/cross-tenant rating disclosure or forged scope accepted                             | Any confirmed occurrence; target 0                              | Security on-call with P12 owner                                                            | Contain affected egress, follow incident handling, repair exact boundary and repeat negative qualification. Monitoring never replaces authorization.      |
| Duplicate accepted internal-review episode                                                       | More than 1 active source effect for the same durable episode   | P27/ADR0183 work owner                                                                     | Stop affected producer, reconcile through source commands and repair the uniqueness/idempotency boundary.                                                 |
| Rating source cutoff or job progress exceeds persisted next-refresh deadline                     | Any enabled scope past its declared deadline                    | P27 operations owner                                                                       | Mark stale/block new rating inference, inspect source/backlog, resume bounded work or disable affected analysis; do not display false current values.     |
| Automatic-review source withdrawal accepted but shared task still actionable                     | Any mismatch on reconciliation                                  | P27 source-work owner                                                                      | Source eligibility already blocks action; repair projection and audit the lag/error without marking Completed.                                            |
| Missing eligible review recipient                                                                | Any otherwise-admissible new episode without authorized routing | Tenant development administrator through qualified source exception, assisted by P27 owner | Repair or withdraw the source requirement; no broad fallback delivery or duplicate work.                                                                  |
| Wrong financial total/count/coverage against the same authoritative tuple                        | Any unexplained discrepancy                                     | P13/P14 source owner with P27 feature owner                                                | Suspend affected band/review generation, correct source or projection and recompute with cause; preserve money/history.                                   |
| Usability report that a band means donor worth, missionary performance, or obligation to contact | Any credible observed unsafe interpretation                     | Product/UX owner with tenant development lead                                              | Pause expansion of affected presentation/review mode, revise language/flow and repeat observed comprehension checks.                                      |

## Proof completed and limits

The [practice](d28-evidence/practice.md), [financial](d28-evidence/financial.md),
[ownership](d28-evidence/ownership.md), [authorization](d28-evidence/authorization.md)
and [UX](d28-evidence/ux.md) appendices supply independent source inspection and
fresh primary research. The [independent review](d28-evidence/independent-review.md)
challenges the consolidated result. [Document checks](d28-evidence/review-checks.json)
verify source preservation, coverage, links and consistent decision status.

Worked financial/counterexample reasoning and source inspection challenge the
assumptions; they do not establish a deployed D28 feature. No prior runtime probe
was rerun, no new product tests are fabricated for a documentation-only change,
and no live RLS, user pilot or end-to-end implementation qualification is claimed.
The acceptance criteria specify that missing proof precisely.

## Final disposition

**Accept with required amendments**, using the exact corrected decision above.
Preserve A's useful facts and staff judgment, add B's bounded financial analysis
by explicit tenant choice, and make its optionality real at every source and
consumer boundary. Do not trade donor dignity for a cleaner-looking opaque score.

## Explicit ratification

On 2026-10-11, Asia/Bangkok, the founder instructed: **“Yes, ratify this amended
D28. Then continue with this phase 27 this grill-with-docs session.”** The exact
corrected decision, R01–R18, AC01–AC36 and all reviewed safeguards above are now
explicitly ratified without substantive change. The original review disposition
and dated research remain preserved. There is no pending D28 ratification gate.

This records accepted product direction, including the explicit owner amendments;
it does not claim formal source reconciliation, implementation, activation, a live
authorization test or a completed user pilot. Formal PRD/OpenSpec and tickets remain
reserved for /to-prd and /to-issues. The
[ratification and continuation checks](d28-ratification-q29-validation.json)
verify preservation separately from the earlier dated review checks.
