# D29 financial, counting and lifecycle evidence

2026-10-11 UTC. Research-only review of the selected mixed-purpose coordinated
appeal. Only this appendix is edited. **Recommend A with explicit measurement and
source boundaries:** reuse D22 Requests and D24 membership; show separate outcomes
and qualified financial facts without a second financial ledger, allocation engine
or universal progress score. Requirements and examples below are recommendations
for reconciliation, not implemented or tested behavior.

## Governing evidence and current implementation

[D22 R02–08](../phase27-d22-adversarial-review.md:295) preserves independently
answerable decisions, applicable monetary terms, historical proposals, honest
responses and qualified owner handoffs. [R15](../phase27-d22-adversarial-review.md:404)
already prohibits adding alternative proposals, repeated financial coverage,
recognition and gifts into one total. [D24](../phase27-d24-adversarial-review.md:22)
separates recorded planning, current eligibility and actual participation;
removal/exclusion preserves Requests and financial history. [D25](../phase27-d25-adversarial-review.md:24)
keeps reported offline receipt, financial posting and remaining handling distinct.
[D28](../phase27-d28-adversarial-review.md:25) makes ratings optional and preserves
entity, currency, lens, purpose and coverage. D29 is not a reason to enable them.

[P13 §E](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:780)
defines contribution headers, designation lines, immutable postings and the
canonical effective fold. [P14 §A/C](../../../../prds/sitestacker-parity/phase-14-donor-credit-operations.md:316)
provides recognition derivation, separate legal/recognition vocabularies and
source-qualified identity/deduplication. [P16 F.3–F.7](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:983)
conserves contribution-line fulfillment, preserves exact application history and
handles reversals without inventing new authority. [P25 financial D12](../../../../prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/financial.md:125)
defines current monetary giving and gift-date/coverage rules; its Home-specific
calendar-year UI is not the appeal's reporting period. [P33](../../../../prds/sitestacker-parity/roadmap.md:4603)
requires consistent metrics and qualified current projections across consumers.
These are accepted contracts, not evidence that their target readers are deployed.

**Static code checked this turn:**

- [CRM report types](../../../../../packages/database/types/crm-reports.ts:1)
  provide funds/missionaries/donors/sync-failures, with one `amountCents` scalar;
  they do not encode D29's entity/currency/lens or response dimensions.
- [Report service:53–59](../../../../../packages/api/src/admin/crm/reports/service.ts:53)
  maps missing/nonfinite amounts to zero. [79–102](../../../../../packages/api/src/admin/crm/reports/service.ts:79)
  reads at most 5,000 completed `donations`, filtering by `created_at`;
  [155–192](../../../../../packages/api/src/admin/crm/reports/service.ts:155)
  adds raw amounts, increments gift counts and uses that timestamp for recency.
  A capped client-style census cannot become an authoritative appeal total.
- [Existing effective-value helper:85–116](../../../../../packages/api/src/admin/contribution-shared/effective-values.ts:85)
  orders applied legacy adjustments by time and replaces values. This is not proof
  of P13's accepted per-header-sequence, signed-posting fold or D29 attribution.
- A bounded search of `apps/admin`, `packages/api`, `packages/database` and
  `supabase/migrations` for appeal/solicitation/asks found an Appeal task tag, but
  no qualified mixed-appeal model or reader. This is a search limit, not a claim
  about every possible repository spelling or production deployment.

No runtime, migration, monetary calculation or performance test was executed.
These findings identify reuse gaps, not newly verified production vulnerabilities.

## Primary comparison, freshly read

Both official pages were retrieved **2026-10-11 UTC**.

[CiviCRM, What is CiviCampaign?](https://docs.civicrm.org/user/en/latest/campaign/what-is-civicampaign/)
(`latest` user guide, no page revision date) groups activities, communications and
contributions within a coordinated programmatic effort. It supports the coherence
of mixed coordination; it does not establish Core's financial allocation, counts,
permissions or lifecycle semantics. Its broader survey/event/petition facilities
are not part of this recommendation.

[MPDX, Setup an Appeal](https://help.mpdx.org/article/190-set-up-appeal)
(page updated **2022-10-13**, currently available) defines financially focused
appeals and shows different counts for contacts, gifts and commitments. This is a
credible narrower alternative and a reminder that even monetary appeals have
different counting grains. Core should not copy its Given/Received meanings,
automatic Asked interpretation, export or deletion behavior. No practitioner
study or measured superiority of mixed appeals is claimed.

## Permanent minimum invariants

**F01 — One coordination context; distinct source facts.** An appeal can relate
financial, nonfinancial or mixed Requests around a common purpose, without a
mandatory monetary goal. One coherent invitation remains one Request; independent
decisions retain their own responses. One church's yes to hosting and no to
funding are both visible. Agreement, actual participation, financial commitment,
reported gift handoff and received money are separate facts. Nonfinancial terms
have no invented zero-value gift, exchange rate, monetary equivalent or donation
status. A summary is not an authority to create an event booking, pledge or receipt.

**F02 — State the counting grain.** Provide named measures rather than one
exclusive supporter bucket or overall success percentage:

- **Working-list Parties:** distinct qualified canonical Parties currently
  included under D24. This is planning, not people contacted or requests answered.
- **Requests and responses:** distinct Request identities related under the
  selected current/historical association basis. Count a Request once, not each
  revision, response event, owner or descriptive purpose tag. Current response
  means the source-qualified applicable response to identified terms, not the
  latest database timestamp. Historical presentation and earlier responses remain
  separately inspectable.
- **Purpose-specific outcomes:** label whether the count is Requests, distinct
  Parties agreeing, or separately recorded actual participation. One Party can
  appear in several purpose views; those counts are not additive. A combined
  invitation does not create separate fictional decisions for its descriptions.

Counts must not depend on an inner join to optional financial fields. A removed
member's historical request/outcome remains available under its qualified history
basis; it does not disappear because the current planning count changed. Likewise,
an independently permitted historical response must not require re-adding someone
to today's working list merely to count the fact.

**F03 — Goals and denominators explain themselves.** No numerical goal is a valid
appeal. A financial target declares entity, currency, amount meaning and period;
other summaries use their own stated unit. For example, **3 churches have agreed
to host** is not **3 visits completed**. An optional percentage requires a complete,
compatible denominator: named invitation/request population or stated goal,
current/as-of basis and exact time window. Do not divide known yes responses by
today's smaller working list and call it response rate. Zero target, no goal,
unknown coverage and denied denominator are distinct; omit an unsupported ratio.
Changing a goal preserves its earlier versions rather than rewriting prior
reported performance. No new custom-measure builder is necessary.

**F04 — Associations do not allocate funds.** Request/appeal references are
context, not proof of source attribution, restricted purpose or fulfillment. A
gift belongs in **Received toward this appeal** only through a qualified financial
owner definition covering exact source occurrence, line/scope, authority, revision
and amount. Similar donor/date/amount, matching campaign text or membership cannot
substitute. A $100 gift with $60 admitted to this purpose contributes $60, not the
whole header; repeated references contribute that same coverage once. Do not divide
money among appeals or Requests by an invented equal/proportional rule.

The same source may be contextually related to more than one appeal without
duplicating it. Such contextual views must be labelled non-additive. A cross-appeal
financial total deduplicates exact admitted source coverage before summing; it
cannot SUM displayed appeal totals. Allocation/fulfillment claims remain conserved
under their owners. When the attribution adapter is unavailable, show qualified
related facts and an honest unavailable progress measure; ordinary mixed
coordination need not wait for an unsupported financial association feature.

**F05 — Preserve monetary meanings and partitions.** Requested amounts, staff
forecast, supporter response, P16 commitment and P13 current received amounts stay
separate. Do not add a fulfilled commitment's face value to its gift, mutually
exclusive proposals to one expected total, recognition to legal money, or
currencies/entities to one scalar. Monetary measures retain exact minor units,
original currency, issuer, period, lens and source/coverage revision. Recognition
uses P14's qualified fold and deduplication; it remains non-money and is not
additive across people. Whole-gift frequency counts roots, not designation lines,
postings, recognition roles or installments expected.

Current received monetary amount follows qualified effective source values,
including admitted charitable fee cover and finalized inverses, before processor
costs/tax deductions; it excludes future promises, D25 handoff reports, expected
matches, asset valuations and sale proceeds. Apply only fee-cover/designation
amounts within the admitted scope. Noncash intentions remain described without
valuation. P16 monthly equivalents remain planning comparisons, not appeal cash.

**F06 — Read coherent complete facts.** Compute complete permitted source sets
before paging/presentation, preserving unknown, unavailable, private, inapplicable
and known-zero states. Bind the result to consistent financial, response,
association and coverage revisions; a global maximum of unrelated per-gift
sequences is not a coherent revision. Current access governs every aggregate,
filter, export and drill-through; hidden amounts cannot be recovered from totals
or sibling subtraction. Loaded UI rows, writable progress counters and provider
totals are not authoritative. Financial failure leaves independently valid
nonfinancial facts useful, and vice versa.

**F07 — Correct links and outcomes without erasing source history.** Correcting or
ending an appeal association can change current appeal projections, with history
of what changed; it cannot void a gift, reassign a designation, erase earlier
presentation or silently cancel a pledge/application. Source corrections and
re-designations recalculate every affected qualified view once, without replaying
original effects. Partial and full refunds affect current financial progress;
they do not undo a completed visit or turn earlier agreement into a decline.
An uncertain P16 application is not definite fulfilled coverage merely because
the gift remains received.

**F08 — Closure is not a financial cutoff.** Closing/retiring an appeal or removing
a member preserves independent P15 handling, P16 obligations, receipts and lawful
history. A source-authorized late gift, response or correction can update its
proper current projection without reopening the appeal, reviving solicitation or
inventing new tasks. Separate gift occurrence/effective date, received response
date and recording time. A closed-date snapshot, if presented, names its cutoff;
it must not masquerade as today's adjusted total. Qualified historical correction
does not require resurrecting retired labels or restoring old access.

## Graded risks and falsifiable acceptance

Severity/likelihood are qualitative judgments. These examples are **future
acceptance requirements, not passed tests**.

| Risk                                           | Severity / likelihood                 | Clauses and acceptance proof                                                                                                                                                                               |
| ---------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mixed responses collapsed to one stage         | High / likely with old appeal buckets | F01–02: one church declines funding, agrees hosting and has a prayer request unanswered; all remain distinct without three church records or forced completion.                                            |
| Nonfinancial records vanish or fake progress   | High / likely with financial joins    | F02–03: prayer-only appeal with no amount/goal remains usable and counted; agreeing to host does not count an actual visit or money.                                                                       |
| Repeated links inflate funding or participants | High / plausible                      | F02/F04–05: one gift, two Requests and two appeals retain one source gift; same person in multiple purpose views is explicitly non-additive; union reporting deduplicates source coverage.                 |
| Wrong currency/entity/recognition total        | High / plausible                      | F05: separate USD/JPY and issuer totals; DAF advisor recognition does not become legal giving; a recurring gift fulfilling a fixed pledge remains one received amount.                                     |
| Mutable denominator rewrites apparent success  | Medium / likely over an appeal        | F02–03/F07: removal/exclusion reduces current planning count but preserves historical asked/responded facts; changing a goal produces distinguishable versions, not a retrospectively improved old report. |
| Correction or unlink changes unrelated truth   | High / plausible                      | F04/F07: refund, reassignment of attribution and association correction affect only their qualified facts; response, original gift and completed hosting history survive.                                  |
| Closing loses duties or ignores late truth     | High / plausible                      | F08: close with a separately owned handling/commitment duty keeps it actionable; a later refund updates current qualified money without restarting solicitation or declaring old possession.               |
| Incomplete/private totals look definitive      | High / plausible                      | F06: >5,000 roots reconcile without truncation; unknown coverage is not zero; forbidden source fields remain undiscoverable through counts, export or subtraction.                                         |

The useful amendment is narrow: qualify the roadmap's goal and
Committed/Received/Given language as applicable financial views alongside
purpose-appropriate Request outcomes. Do not replace them with a universal
participation score, duplicate task engine, new financial writer or mandatory
missionary reporting regime. Source-attribution gaps block only the financial
claim they cannot support, not the entire coordinated appeal.
