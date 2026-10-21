# D22 evidence — exact amounts and prospective policy

Research date: October 17, 2026 (Asia/Bangkok). Scope: the selected optional
organization-set amount rule and the instruction to make it customizable without
unnecessary complexity. The founder selected **one organization-wide policy**.
This note does not select particular amounts, create an FX service, define
another financial ledger or change any formal owner/app/schema.

**Disposition: accept with required amendments.** A positive, currency-specific
**At least [amount]** rule is simple and explainable. Correctness depends on the
amount's source scope, exact units and captured policy, not the number of controls
in the settings form. The task reason is **Meets the organization's amount rule**;
it does not claim extra support, unexpected generosity or a financial exception.

## Sources, facts and boundaries

- [Q22](../phase28-q22-amount-based-gift-follow-up-research.md) distinguishes a
  fixed amount from D21's declined history-comparison attention and keeps the
  source amount basis, prospective timing and exact policy scope explicit.
- [P2 currency foundation](../../../../prds/sitestacker-parity/phase-02-site-locale-currency-foundation.md:386)
  owns canonical integer minor units, explicit currency, metadata and qualified
  routes. Metadata support is not transaction/source-profile activation. Its
  earlier interface example lists exponents 0/2/3; the current
  [metadata source](../../../../../packages/api/src/money/metadata.ts:1)
  also represents ISO fund units CLF/UYW with exponent 4. D22 must consume the
  canonical metadata, not freeze an incomplete exponent list or activate those
  fund units through a settings dropdown.
- Current [money parser](../../../../../packages/api/src/money/index.ts:26)
  uses checked safe integer minor units, decimal-string parsing and a finite
  known-currency lookup; its formatter separates locale from currency. Its
  [provider conversion](../../../../../packages/api/src/money/index.ts:117)
  distinguishes canonical units from provider charge/payout representation.
  This is inspected source, not proof of every input path or D22 implementation.
  In particular, converting an unsafe JSON number before reaching the parser
  cannot recover the user's lost digits.
- [P13 effective ledger](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:780)
  distinguishes contribution header, relevant effective designation lines,
  append-only corrections, explicit currency and recognition. Effective amounts
  come from the source fold; base/original money is not the current amount.
- [P13 source finality](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:987)
  controls whether money is qualified for missionary support. Payment processing
  time, eventual source qualification and worker delivery are different facts.
- [P16 application authority](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1004)
  and [commitment reduction](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1393)
  preserve donor intent/application. A fixed amount may intentionally select an
  ordinary installment but cannot label it extra or infer catch-up/prepayment.
- Ratified [D20](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md)
  owns exact reviewed gift-purpose coverage, source changes and one current
  compatible task. Ratified [D21](../phase28-d21-explicit-gift-follow-up-adversarial-review.md)
  forbids unqualified/history-only inference and preserves required explicit
  source work. An amount rule does not become a minimum for other reasons.

Primary technical documentation opened October 17, 2026:

| Source                                                                                                           | Verified fact                                                                                                                 | Limit and consequence                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ECMAScript safe integers](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-number.max_safe_integer) | `Number.MAX_SAFE_INTEGER` is 2^53−1; larger distinct integers can share one Number representation.                            | Use exact input and the canonical money-domain bounds. A database bigint does not make a JavaScript/JSON path lossless. The current spec page is labelled ECMAScript 2027; this established safe-integer rule is not a claim about a new deployed runtime.  |
| [PostgreSQL numeric types](https://www.postgresql.org/docs/current/datatype-numeric.html)                        | Declared numeric scale coerces excess fractional precision by rounding; numeric may also represent special non-finite values. | Reject invalid precision/non-finite input before a lossy cast and enforce exact finite integer bounds. A post-coercion integer check cannot recover the original fraction. Documentation resolved to PostgreSQL 18; this note ran no PostgreSQL experiment. |
| [Stripe currency representation](https://docs.stripe.com/currencies)                                             | Minor-unit representation and currency-specific charge/payout exceptions differ; provider payment limits depend on the route. | D22 compares source money, not raw provider amounts. A follow-up policy is not a payment request: do not borrow Stripe minimum/maximum charge limits as universal policy bounds or implicitly enable provider-supported currencies.                         |

The financial workstream aligned this proposed comparison basis: **one exact
contribution, qualified follow-up Party and typed ministry subject, using the
source-certified current effective non-fee-cover monetary allocation/attribution
amount, before processor fees and P21 assessments**. The direct-money profile
combines distinct relevant lines of that same contribution once. An indirect
supporter profile requires P14's exact supporter/subject attribution; P28 cannot
invent proportional recognition, copy a sponsor/batch total or add legal money
to recognition of the same support. These are required owner-profile bindings,
not financial calculations independently implemented by this note.

## Minimal exact clauses

**AMT-01 — Simple explicit rule.** The optional rule SHALL use a positive exact
amount and explicit currency with a fixed inclusive **At least** comparison.
The organization may choose valid amounts within the canonical money domain;
zero, negative, non-finite, excess-precision, ambiguous and overflowing input
SHALL be rejected without silent rounding, clamping or fallback. Off SHALL be a
separate state, not a zero threshold. No threshold is preselected, inferred from
donor history, copied from finance risk review or converted from another currency.
There SHALL be one organization-wide policy with explicit currency-specific
amounts; no per-missionary/project policy, inclusion hierarchy or override is
introduced. Source qualification and current access remain independently scoped.

**AMT-02 — Exact units and parsing.** All comparisons SHALL use canonical integer
minor units plus ISO currency and the canonical metadata exponent, through the
shared money boundary. Carry authoring input losslessly as text until it has
been parsed under the declared staff input locale/grammar. Unknown currency,
unsupported source profile and missing currency-specific rule SHALL not fall
back to USD or another currency. Reject fractional minor-unit and non-finite
values before a storage/parameter cast can round them; check transport and domain
bounds as well as database range. Locale formats the value and never chooses its
currency. Provider charge/payout representation is not the comparison basis.

**AMT-03 — One source-scoped gift amount.** Qualification SHALL use the exact
source-certified effective amount for one contribution, qualified follow-up Party,
typed ministry subject and currency. The approved profile SHALL exclude fee-cover
lines, other subjects and duplicated recognition while preserving its defined
pre-assessment/pre-processor-fee basis. Same-gift relevant lines may contribute
once through the owning profile; separate gifts SHALL NOT be summed to meet the
threshold merely because D20 groups their follow-up. No P28 header shortcut,
raw credit sum, pro rata allocation or cross-currency scalar is permitted.

**AMT-04 — Qualification before task presentation.** The amount rule supplies an
honest reason for an already source-qualified received-support occurrence. It
does not change posting, settlement, financial review, donor intent, commitment
application, recipient eligibility or visibility. The rule SHALL not block or
raise the minimum for independently qualified first/special/fulfillment/recurring
work. A missing threshold or disabled rule means this reason is absent, not that
the gift or supporter is invalid.

**AMT-05 — Capture policy at the authoritative live boundary.** The source SHALL
bind the applicable policy version and original live provenance at its qualified
source-live occurrence boundary, independently of worker arrival, import time or
a backdated gift date. Numeric edits apply prospectively; already captured live
work retains its original amount rule for evaluation, retries and source repair
within the applicable activation generation. Policy version is evidence, not a
new gift-purpose identity. Historical imports, report recomputation, lowered
thresholds or enabling a rule SHALL NOT generate historical catch-up.

**AMT-06 — Off distinguishes admitted work from candidates.** Off SHALL stop new
admission and end the activation generation for never-admitted/held candidates.
An already committed exact reason and durable task intent remains accepted work,
even if its task has not yet materialized; it SHALL reconcile once under current
source and access rules. Off SHALL not bulk-withdraw that accepted work, other
reasons or human undertakings. Re-enable starts prospective eligibility without
reviving never-admitted candidates from an ended generation. The same rule applies
to removing an affected currency rule under its owner contract.

**AMT-07 — Source correction still matters.** Refund, return, reallocation and
attribution correction SHALL re-prove the current effective amount against the
captured rule and update only its affected reason under D20. A still-valid other
reason or independent promise SHALL remain. Preserve performed task/interaction
history. If an already admitted originally live, unconsumed reason was withdrawn
by actual source invalidation and that source genuinely restores it, its same
original purpose may use D20's qualified repair even while the rule is Off;
this is repair of admitted work, not new admission or resurrection of a never-
admitted held candidate. Current source/recipient/authority proof remains required.

**AMT-08 — Reasons compose; coverage does not multiply.** Multiple valid reasons
for the same intended gift-purpose obligation SHALL be retained as explanatory
evidence and converge on one member/coverage effect. A policy revision, retry,
alternate workflow or second reason SHALL not create another intended task or
repeat handled work. D19's distinct first-support purpose and any other genuinely
distinct authorized purposes retain their separate meaning; amounts do not
collapse all stewardship into one generic obligation.

**AMT-09 — Reviewed coverage and truthful explanation.** The task SHALL explain
the applied amount rule, relevant source amount/currency and permitted scope
without calling the donor generous, unusual or extra. Show the captured rule
when explaining accepted work; do not substitute today's edited value. Relevant
source/eligibility/reason changes follow D20's material-review checks, while
unrelated later gifts remain outside the reviewed set. Recover a lost response
through the original receipt, never against a recomputed current group. Turning
the rule Off does not by itself falsify already accepted reason evidence.

**AMT-10 — Current settings authority and atomic outcome.** The authorized setting
command SHALL derive tenant/actor/scope from trusted context, validate complete
currency rows and expected configuration revision, and save all or none. Runtime
admission, Off and policy capture SHALL have a qualified serialized outcome so
work is unambiguously either admitted under an accepted rule or not admitted.
Configuration editability does not grant missionary finance/contact rights.
Partial response, stale settings and repeat commands SHALL reconcile exact saved
results rather than duplicate policies or reinterpret accepted occurrences.

## Eight material concerns and precise remedies

Severity/likelihood describe reasoned pre-safeguard risk, not observed incident
rates. Each concern records failure, impact, severity, likelihood, supporting
evidence, effect on A, permanent prevention and exact requirement text; the final
column states falsifiable release evidence.

| Concern                                                        | Failure and why it matters                                                                                                                                                                                             | Severity / likelihood                                                | Evidence                                                                     | Effect on A                                               | Permanent fix / exact clause                                                                               | Required proof                                                                                                                                                                                                                                       |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AF1: Units and precision drift                                 | Floats, blind ×100, two-decimal UI or unsafe JSON numbers move a threshold; storage silently rounds rejected precision. Equality can then admit or omit the wrong gift.                                                | High / likely if a generic numeric field bypasses the money boundary | P2/current helper; ECMA/PG docs; A01–A07                                     | Narrows implementation; retains customization.            | Exact positive canonical money, fixed inclusive boundary and pre-coercion validation, **AMT-01/02**.       | Test one minor unit below/equal/above; zero-, two-, three- and every actually admitted metadata exponent; excess precision, ambiguous locale, 2^53 boundaries, non-finite and storage overflow through actual entry/API/DB paths.                    |
| AF2: Wrong source amount                                       | Header, all grouped gifts, fees, after-assessment balance or sponsor recognition gives a different amount from the intended supporter/ministry's single gift. The task becomes wrong and may reveal unrelated support. | High / plausible with reused aggregate widgets                       | P13 owner fold; financial workstream; A10–A15                                | Defines the basis; no new ledger or FX.                   | Exact owner profile at one contribution/Party/subject/currency, **AMT-03/04**.                             | Same-gift multiple relevant lines, cross-subject split, distinct gifts, fees, assessments, DAF/remittance attribution and ambiguous profile. Compare source-certified result, never copy test arithmetic into P28 authority.                         |
| AF3: Policy edit rewrites history                              | A delayed worker uses a new threshold, or lowering/enabling scans old gifts. Identical source occurrences behave differently by delivery time and produce catch-up floods.                                             | High / likely with mutable-current-config lookup                     | D19–D21 temporal rules; A18/A19                                              | Requires captured prospective policy; preserves A.        | Capture at qualified live boundary, immutable applied rule and no historical replay, **AMT-05**.           | Race policy edit with authoritative qualification; delay/retry after edit; backdate/import; lower rule. Original accepted meaning survives and old unadmitted evidence never becomes a new live gift.                                                |
| AF4: Off loses accepted work or revives old candidates         | Code checks task-row existence and drops committed intents, or a later On flag revives old holds. Conversely, blanket Off blocks legitimate correction of already admitted work.                                       | High / plausible in normal asynchronous materialization              | ADR/shared task intent inherited by D20; root temporal decision; A20/A21/A25 | Clarifies Off without mass task cleanup.                  | Distinguish accepted reason+intent from candidates; qualified admitted-work repair, **AMT-06/07**.         | Off before admission, after intent commit/before task, after source withdrawal, before genuine restoration; re-enable with old holds. Accepted work reconciles once, never-admitted old generation stays blocked, completed history stays completed. |
| AF5: Corrections leave a false reason or cancel unrelated work | Refund/reallocation drops relevant amount below the threshold but stale gross evidence remains; or removing one reason removes a still-valid special reason/promise.                                                   | High / plausible with source corrections                             | P13 effective fold; D20 reason/coverage semantics; A16/A17/A22               | Requires reason-specific repair; retains A.               | Re-evaluate current effective source against captured rule and preserve other reasons/work, **AMT-07/08**. | Refund, partial return, subject reallocation, corrected recognition and source restore before/after review or human outcome. No stale amount reason, lost independent reason, erased interaction or duplicate replacement member.                    |
| AF6: Multiple reasons and retries multiply coverage            | Amount and another criterion create two tasks; policy version is included in effect identity; old retry finishes a newly expanded group.                                                                               | High / likely with one producer per criterion                        | D20 exact coverage; A23/A24                                                  | Requires shared intended effect, not another engine.      | Reasons as evidence on one gift-purpose member, exact reviewed outcome, **AMT-08/09**.                     | Concurrent criteria/native/workflow and replay after rule edit yield one member; handled work is not repeated; correction stales affected review; new gifts remain unreviewed. Distinct D19 purpose stays distinct.                                  |
| AF7: Configuration implies unsupported rights or capabilities  | Comprehensive metadata enables an unavailable currency, stale settings overwrite another staff edit, or “fully customizable” becomes caller-defined scope/formula/financial authority.                                 | High, critical for unauthorized scope / plausible                    | P2 metadata versus qualification; A09; trusted-command boundary              | Narrows customization to valid owner-controlled settings. | Qualified source profiles, atomic settings and current permission, **AMT-01/02/10**.                       | Unsupported metadata-only currency, wrong tenant/scope, duplicate currency row, malformed one row among valid rows, stale revision and role revocation. No partial save, fallback currency or new access.                                            |
| AF8: Clear-looking UI conveys a false promise                  | “Above” excludes equality, zero means Off, the task shows today's rule, or an ordinary large installment is called extra generosity. Users cannot predict effects.                                                     | Medium–high / likely without exact copy and boundary proof           | Q22 distinction; P16 no intent inference; A07/A08/A18                        | Fixes UX semantics while keeping one simple rule.         | At least, explicit currency, captured-rule explanation, existing-work meaning of Off, **AMT-01/04/06/09**. | Users correctly predict below/equal/above, threshold edit and Off with queued intent; entered locale amount round-trips; existing unrelated native reasons continue. No performance/benefit claims without measured evidence.                        |

## Temporal meanings to keep simple and distinct

| Situation                                                                              | Outcome                                                                                                                                  |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Live occurrence qualifies under active version V1                                      | Bind V1 at the authoritative source boundary; source-safe admission uses that meaning.                                                   |
| Staff edits threshold to V2                                                            | Future live qualification uses V2; accepted/captured existing work retains its original rule under its activation-generation conditions. |
| Worker runs after edit                                                                 | Recover the original occurrence/policy; worker time does not select V2.                                                                  |
| Off wins before admission                                                              | No new amount admission; end the old generation for unadmitted held candidates.                                                          |
| Admission commits before Off                                                           | Exact reason/intent is existing work, even with no task row yet; materialize/reconcile once.                                             |
| Previously admitted unconsumed source is invalidated then genuinely restored while Off | Use qualified same-purpose D20 repair; do not confuse it with a never-admitted candidate.                                                |
| Re-enable                                                                              | New prospective eligibility; no old never-admitted hold or historical catch-up.                                                          |
| Refund or reallocation changes source                                                  | Re-evaluate affected amount reason against its captured rule; preserve other valid reasons, promises and performed work.                 |
| Another criterion qualifies the same gift-purpose                                      | Add justified explanation under the same intended coverage, not another chore.                                                           |

The founder selected one organization-wide policy. Currency-specific amounts
belong to that policy; these temporal and numeric invariants require no workspace
inclusion hierarchy, override mechanism, generic rule builder or calendar window.

## Executed counterexamples and limits

Ran [counterexample-probe/probe.py](counterexample-probe/probe.py) on Python
3.12.14: **25/25 semantic counterexamples reproduced**. Exact observations are in
[results.json](counterexample-probe/results.json).

These examples disprove unsafe shortcuts; they do not implement the chosen
amount policy. Python binary64 demonstrates representational loss in A01/A05;
the independently read ECMAScript specification establishes the JavaScript
safe-integer boundary. A04 is an explicit Decimal rounding example, not a
PostgreSQL experiment. The integer allocation examples are synthetic quantities,
not certification of P13/P14 attribution. A20/A25 demonstrate why absent/current
state alone cannot distinguish accepted-work lineage; they do not execute the
task command or prove transaction isolation.

No Core money-parser test, database race, hosted Supabase check, actual provider
route, user journey or performance benchmark was run by this workstream. The
database and financial workstreams own their independent proofs and limitations.
All example thresholds are demonstration values, not recommended organization
defaults, validated fundraising policies or donor-value judgments.
