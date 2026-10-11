# D22 — funding and significant nonfinancial requests: financial/source review

2026-10-11 Asia/Bangkok; source/probe observations on 2026-10-10 UTC. Checkout
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`. Founder selected A: one request/response
capability covers funding and significant nonfinancial invitations, with owner and
follow-through; monetary fields appear only when relevant. Research only. No
formal PRD/OpenSpec, issue, product code, migration or live database was changed.

## Recommendation and meaning to preserve

Accept A with one modest first-class request record and source-owned references.
“Would your church host a visit?” can have a response and follow-through without
inventing a dollar amount. “Would you contribute USD 200 monthly for two years?”
can carry precise proposed financial terms without becoming a recurring agreement.
Both belong to the existing continuing partnership and can reuse appropriate
shared work. Neither requires a new item engine, general agreement subsystem or
new money writer.

| Fact                                             | Meaning and owner                                                                                                                              | Must not silently become                                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Original/presented requested terms               | What was actually proposed, including the relevant amount, currency, cadence/term and purpose; P27 captures its truthful version and evidence. | Today's revised proposal, a staff forecast, a promise, or received money.                                          |
| Revised requested terms                          | A later deliberate proposal/version, preserving the earlier presented meaning and whether the revision was actually presented.                 | A rewrite of the original ask or old response.                                                                     |
| Expected response/expected amount                | Staff's current planning expectation, with applicable basis, horizon and as-of/version. Unknown remains unknown.                               | A supporter statement, automatically probability-weighted amount, accepted commitment or collectible balance.      |
| Recorded response                                | What the supporter or qualified representative actually said/agreed to, including partial, conditional or counterproposal detail.              | Financial execution authority, consent to contact, proof of performance or automatic completion.                   |
| Accepted monetary commitment                     | P16's separately admitted recurring group/line or fixed-total pledge, with its Party, evidence, authority and current revision.                | A P27 status or copied “pledge” row inferred from a positive response.                                             |
| Received/attributed funding                      | Qualified current P13 effective line facts with explicit association/coverage meaning and source revision.                                     | A staff-entered funded amount, pending payment or duplicated total across requests.                                |
| Recognition                                      | P14's separately named permitted recognition lens.                                                                                             | Legal giving, received cash, request fulfillment or solicitation authority.                                        |
| Nonfinancial follow-through/actual participation | Request outcome and the appropriate execution/participation owner, when one exists.                                                            | A cash forecast, automatic event registration/volunteer assignment, prayer consent, or a new participation system. |

Preserve those distinctions even if the ordinary form is short. A staff member can
record a useful response without a complete source commitment or gift match. Show
the remaining uncertainty rather than blocking truthful notes or manufacturing
financial success.

## Governing evidence and current implementation

- The original request at `/workspace/attachments/9b86445f-5040-4a77-b0d1-d8508fc53404/Pasted text.txt`
  lines 113–137 expressly requires original/revised requested terms, recurring or
  multi-year cadence/term/horizon, deliberate P16 handoff, narrow noncash intentions,
  explicit gift association and exact currency/entity/period meaning. D22 broadens
  structured nonfinancial use without removing these monetary constraints.
- [Owner constraints](../../../../prds/program-roadmap/owner-constraints.md:22)
  require explicit currency and Legal Entity/campaign scope for monetary asks and
  same-currency/entity rollups unless Phase 33 provides an explicitly labelled
  conversion. [Roadmap](../../../../prds/sitestacker-parity/roadmap.md:4089)
  names requested, expected and source-confirmed funded amounts; lines 4101–4105
  preserve financial/communication owners and shared native/optional effect identity.
  Link campaign/designation context when appropriate and known under its owner;
  this review does not make both fields universally compulsory or invent defaults.
- [P16 recurring and fixed commitments](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:50)
  distinguishes per-occurrence recurring amount (54) from an explicit fixed promised
  total (66–68). Its one-entity/currency group at 408 and separate Commitment Party
  roles at 445–460 are governing intended contracts, not P27 record-edit powers.
  The PRD explicitly says groomed-not-built at line 14.
- [P16 fulfillment](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:964)
  separates expectations, money, fulfillment and recognition. Lines 983–995 require
  exact entity/currency/designation, current capacity/authority/revision and conserved
  signed applications under locks. Lines 999–1003 avoid consuming one recurring
  gift twice when it also covers a fixed pledge. Lines 1007–1017 reject heuristic
  matching authority; 1025–1031 preserve source corrections and freshness. An ask
  association cannot bypass or reproduce this fulfillment service.
- [P13 ledger contract](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:791)
  uses identified line corrections and monotonic fold ordering; lines 818–825
  require exact minor units, single currency and coherent postings. Its
  [noncash boundary](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1048)
  leaves actual tender, dating and receipt facts with P13/P7; `in_kind` at 1086
  allows an optional internal value and no dollar figure on its receipt. P27's
  noncash intention is neither the received asset nor a tax valuation.
- [P14](../../../../prds/sitestacker-parity/phase-14-donor-credit-operations.md:438)
  bans blended legal/recognition totals. `getPartyCreditActivity` at 447 is the
  party credit interface, `getMatchingActivity` at 458 excludes matching expectancy
  from both money lenses, and 466–468 avoids duplicate recognition across roles.
  Those required interfaces, P13 contribution headers/designation lines and P16
  fulfillment/fixed-pledge names were again absent from bounded current API/database/
  migration searches; this is not an assertion about unseen deployments.
- Current [money parser](../../../../../packages/api/src/money/index.ts:26)
  checks safe integer representation and parses plain decimal strings via BigInt
  using the currency exponent at 32–53, rejecting excess nonzero precision. Formatting
  at 56–82 requires explicit locale. `assertTransactable` at 85–96 is a payment
  settlement restriction, not general authority to reject an otherwise valid planning
  currency. Provider-unit conversion at 117–149 is also a separate seam. The
  [currency migration](../../../../../supabase/migrations/20261003051630_currency_foundation.sql:1)
  mirrors approved metadata with explicit exponent and currency FKs; metadata is
  expressly not payment launch. Reuse this owner, not a hardcoded divide-by-100.
- [Existing money tests](../../../../../packages/api/tests/unit/money-provider.test.ts:28)
  distinguish BHD canonical precision from provider restrictions and test safe-integer
  limits at 41–49. They were inspected, not rerun. Current
  [CRM reporting](../../../../../packages/api/src/admin/crm/reports/service.ts:79)
  still reads completed legacy donations with a 5000-row limit, and the
  [effective-values helper](../../../../../packages/api/src/admin/contribution-shared/effective-values.ts:84)
  folds current adjustment arrays. Neither is the complete forward P13 source for
  ask funding. [Recurring code](../../../../../packages/api/src/stripe/recurring.ts:148)
  protects cancelled legacy pledges but still patches `donor_pledges` at 182–185;
  that is not P16's accepted group/line/fulfillment model.

## Concerns, exact amendments and required proof

Ratings concern unqualified implementation; no P27 product defect is claimed.

**F1 — One “amount” overwrites asked, expected, response and received facts. High /
likely if the old opportunity pattern is copied literally.** **Exact amendment:**
“Retain the original and each materially revised presented request, with separately
named current requested terms, staff expectation and recorded response. Any accepted
commitment or received funding remains an independently authorized source fact.
Preserve whether a revision was presented; changing a forecast does not revise what
the supporter was asked or promised.” **Proof:** requested 10000, expected 6000,
response 8000 conditional, P16-admitted promise 8000 and P13 received 2000 remain
distinct. Partial response, counterproposal, deferral, cancellation, response
correction and late gift do not rewrite earlier terms. Unknown, explicit zero and
not-applicable have distinct meaning; no default zero for absent history.

**F2 — Broad request scope forces money into nonfinancial work. High / likely with
required amount fields.** **Exact amendment:** “A significant nonfinancial request
uses the same owner/response/follow-through capability without monetary inputs or
financial forecast contribution. Show money only for a supported monetary aspect.
Routine calls/to-dos stay shared tasks. Pure nonfinancial absence is not USD 0.”
**Proof:** prayer invitation, introduction and hosting each save/receive partial
or conditional response with no fake amount/currency. Currency/amount errors do not
appear on unrelated work, while required journey/authority remain. Do not infer
actual participation from a request response where another owner determines it.

**F3 — A mixed invitation creates an unnecessary line-item engine or loses partial
response. Medium / plausible.** **Exact amendment:** “Keep one coherent invitation
when it can be understood, owned and answered together, with relevant monetary
terms and descriptive nonfinancial context. Use separate requests within the same
partnership when components need genuinely independent response, owner or follow-up;
do not create a new journey or require generic child items for every mixed request.”
**Proof:** a hosting-and-support conversation can preserve ‘hosting yes, funding
undecided’ without counting the whole request as funded or making money mandatory
for hosting. Reuse an appropriate shared next task where it already covers the
work; no automatic one-task-per-component rule. This sets meaning, not a new
taxonomy, generic partial-fulfillment engine or mandatory split dialog.

**F4 — Recurring or multi-year amounts become misleading forecasts. High /
plausible.** **Exact amendment:** “Every monetary amount retains currency, Legal
Entity, amount basis and applicable cadence, term/period and reporting horizon.
Preserve per-occurrence requests separately from a fixed total and a computed
forecast. An open-ended monthly request has no invented lifetime total; a forecast
states its horizon and rule. Do not infer a P16 schedule or collection authority.”
**Proof:** USD 200/month differs from USD 200 total and USD 2400 over a stated year;
twice-monthly differs from every two weeks, and unknown start/end dates do not imply
zero or a full year. Any computed horizon uses qualified calendar assumptions,
version and rounding. A counterproposal in another currency/entity requires explicit
qualified revised terms; no silent relabelling of the old numeric value or FX.

**F5 — Noncash intentions become fabricated cash or a new accounting product.
High / plausible.** **Exact amendment:** “Support narrow noncash intention capture
as description, relevant quantity/conditions and response evidence, without forcing
a valuation. Any separately admitted planning estimate is clearly labelled with
currency, basis and provenance, excluded from received cash and tax value. Actual
noncash receipt, disposition and valuation/document rules remain with P13/P7/P18.”
**Proof:** a proposed vehicle or equipment donation can be tracked without $0 or an
invented fair-market value; a foundation proposal remains a request with permitted
references/deadlines, not grants administration, planned-giving instruments,
signatures or a revenue-recognition system. Noncash intention is not synonymous
with a prayer/hosting invitation and need not be flattened into a cash-only kind.

**F6 — Positive response triggers a charge or creates a shadow commitment. Critical /
plausible if request status drives automation.** **Exact amendment:** “Record the
actual response independently. Deliberate creation/linking of a resulting commitment
uses P16's exact Party, evidence, scope, terms and authorization contract. A yes,
note, upload, source code or staff-entered amount neither charges nor authorizes
future collection, pledge reminders or contact.” **Proof:** positive, tentative
and partial responses survive without a commitment; a failed/unknown P16 handoff
does not lose the response or show a created commitment. Retry the same source
intent; exact already accepted commitment is linked once. Recurring and fixed
pledge remain distinct; P16's reminder enrollment starts Off and is not inherited
from P27 follow-through. Recipient authority remains separate from Commitment Party.

**F7 — Linked gifts become duplicate funding or heuristic fulfillment. Critical /
plausible across several asks.** **Exact amendment:** “Source-confirmed funded
amounts identify the exact effective contribution lines, association basis,
currency/entity, coverage and source revision. An explanatory link is not itself
a conserved fulfillment allocation. Define reported union/allocation semantics so
one source amount is not counted repeatedly across requests, journeys, campaigns,
recognition or recurring/fixed coverage. No amount/date/name/source-code heuristic
alone establishes fulfillment.” **Proof:** split gifts, partials, installments,
one gift linked to several purposes, recurring-linked fixed coverage and P13
correction/return inverses preserve source amounts once. P16 alone consumes its
fulfillment capacity. P27 may own an explicit explainable association but cannot
rewrite source facts or create a second payment allocator by implication. If the
qualified reader or association policy is absent, show unavailable/needs review;
do not fall back to legacy raw donations or a manual received total.

**F8 — Type changes silently hide earlier financial terms or erase dependent work.
High / plausible with conditional UI.** **Exact amendment:** “Changing kind or
relevant monetary details is an explicit source revision with visible consequences.
Preserve earlier presented terms, responses and source references. Never discard
values merely because fields are hidden. A materially different invitation can be
a new request; a correction must not pretend the earlier proposal was never made.
Revalidate affected source links and work without editing gifts, commitments or
consumed effects.” **Proof:** monetary→nonfinancial and reverse, known→unknown,
currency changes, existing responses, linked commitment and stale edits preserve
old meaning. The new probe cases 4–6 demonstrate only conditional row/version/result
mechanics, not permission for any arbitrary real reclassification.

**F9 — Nullable conditional fields evade scope or precision checks. High / likely
with naïve CHECK/FK/number handling.** **Exact amendment:** “Enforce required scoped
request/journey identity independently of optional monetary references; validate
supplied campaign/designation/source links in their exact owner scope. Monetary
context and each amount use qualified currency metadata and lossless minor-unit
parsing/transport. Conditional CHECKs explicitly distinguish nonapplicable, unknown
and known; neither a nullable comparison nor BIGINT alone validates input.”
**Proof:** new probe cases 1–3 and 8 show CHECK unknown acceptance, exact scoped
parent validation, fake-zero rejection and decimal cast rounding. Real tests need
0/2/3/4 exponent currencies, localized display, overprecision, unsafe JS integers,
overflow and round trips. An amount field's display precision is not validation;
provider-unit constraints are not proposal-currency permission. No floating-point
money or unlabelled cross-currency/entity scalar.

**F10 — Atomicity/idempotency is reduced to transport UUID or UI state. High /
plausible.** **Exact amendment:** “Bind durable source intent to request, command
kind, normalized relevant terms/disposition and current expected revision. Commit
accepted current state, required history/result and required native effect intent
together. Exact replay returns the permitted original result; changed meaning
conflicts. Source commands own handoff and partial-failure reconciliation.”
**Proof:** probe cases 5–6 verify late local rollback and historical conditional
result recovery only. Real concurrent edits, response loss, financial-owner handoff,
task failures and P12 revocation remain release gates. Native and optional workflow
effects share actual source-purpose identity, not a generic request/journey UUID
that suppresses distinct communications or duplicates one intended follow-up.

**F11 — Reporting treats absent/unknown money as complete totals. High / likely.
Exact amendment:** “Keep nonfinancial request counts/outcomes outside monetary
forecasts. Label monetary amount meaning, currency/entity lane, horizon and source
coverage. Count unknowns/partial coverage truthfully where permitted; never expose
hidden rows through aggregate differences. Preserve legal versus recognition
lenses and historical forecast versions for accuracy comparison.” **Proof:** probe
case 7 shows known sum despite an unknown requested amount. The real report must
not use count(amount), a capped sample or sum-null-to-zero as completeness proof.
Conversion, when later provided by P33, is visibly labelled and cannot change any
source amount or turn a forecast into received money.

**F12 — A tidy database model is mistaken for authorization or delivery proof.
Critical / certain current gap.** **Exact amendment:** “Resolve trusted current
tenant/source scope, actor, purpose and capabilities for read/write/history/result
separately. Qualify real table/column/function grants, exposed schemas, RLS USING
and WITH CHECK, views and privileged RPC paths. Optional money does not remove
financial field floors; assignment, request type, owner or source links grant no
access or contact permission.” **Proof:** real nonowner tests, prohibited financial
columns on nonfinancial-facing surfaces, hidden target-safe errors, property
forgery, revocation races and authorized source-owner integration. Owner-executed
fixture SQL and server-role access prove none of these. Native request work can
remain useful while missing financial readers explicitly block only their affected
facts/features; never fabricate their readiness.

## Primary documentation and experiment

Freshly read on 2026-10-10 UTC:

- [PostgreSQL 17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html):
  CHECK succeeds on true or unknown; nullable composite FKs can skip checks; cross-row
  CHECK reads do not establish supported integrity. Use row constraints plus required
  parent FKs and actual owner commands for mutable authority/conservation.
- [PostgreSQL 17 numeric types](https://www.postgresql.org/docs/17/datatype-numeric.html):
  bigint range and exact numeric differ from inexact floating point, and constrained
  numeric scales may round. The probe separately observes decimal→bigint rounding;
  do not claim the storage declaration validates application input.
- [PostgreSQL 17 aggregates](https://www.postgresql.org/docs/17/functions-aggregate.html):
  SUM ignores null, `count(expression)` excludes null and `count(*)` counts rows.
- [Supabase functions](https://supabase.com/docs/guides/database/functions), read
  via documentation search: invoker/definer distinction, secure search path,
  explicit execution grants and exception rollback. This was not a project query.

The new [conditional-money probe](conditional-money-probe/README.md) passed **8/8
on its first runtime attempt**, PostgreSQL 17.11/read committed. Exact inputs,
image/server versions, timestamps, results and exact-ID container removal are
recorded. Network none, no ports/mounts, temporary data, no live credentials. No
previous probe was rerun. This is a sequential mechanics experiment, not concurrency,
authorization, real numeric UI/transport, production schema, source financial
fulfillment or product-release proof. The illustrative kinds, unknown/zero rules
and version layout do not freeze the eventual product taxonomy or schema.
