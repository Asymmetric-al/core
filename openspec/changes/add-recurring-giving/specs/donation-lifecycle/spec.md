# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Donors Can Start Recurring Giving

The platform MUST let a donor initiate recurring giving through checkout using
one explicit recurring-giving group with one or more independently manageable
destination lines. Each destination-line identity MUST remain stable across
provider replacement, cohort split, term change, and schedule change. Exact
amount, designation, cadence, and other disclosed business terms MUST be frozen
in append-only effective line-term versions; donor-controlled calendar intent
MUST be frozen separately in append-only schedule epochs. Calendar-bearing
terms—including cadence, anchor, giving timezone, preferred calendar day, and
final boundary—MUST appear in the authoritative schedule epoch and its matching
line-term disclosure snapshot. A calendar-bearing change therefore appends both
a term version and a schedule epoch; a non-calendar term change appends no
schedule epoch. Disagreement at an effective boundary MUST fail closed or split
the cohort. The server MUST form only the compatible billing cohorts
the current line terms, schedule epochs, and authorization require. Under the current Stripe adapter, a
cohort MUST bind through explicit execution legs: an ordinary cadence has one
leg/subscription and twice-monthly has two monthly legs/subscriptions, one for
the 1st and one for the 15th. Each line MUST bind to its exact subscription item
in every applicable leg. The client MUST NOT choose group, line, cohort, leg,
occurrence, provider-subscription, or provider-item identifiers.

The supported recurring cadence vocabulary MUST be weekly, every two weeks,
twice monthly on the 1st and 15th, every four weeks, monthly, quarterly,
semiannual, and annual. Every active cadence policy MUST feature exactly one
enabled cadence: monthly whenever it is enabled, otherwise one other enabled
cadence selected atomically by the tenant. Tenant configuration MAY narrow
prospective availability but MUST NOT mutate a grandfathered schedule. Daily
recurrence is excluded and one-time giving is a separate gift mode. Checkout
MUST create no end date by default and MUST ask no extra ongoing-versus-ended
question; an optional secondary control MAY set an inclusive final eligible
date after clear, non-guilt-based explanation.

The continuing anchor MUST default to the current civil date in the
arrangement's frozen tenant giving timezone and MUST accept only that date or a
future date. For twice-monthly giving, an off-slot default MUST advance to the
next 1st or 15th and a donor-selected continuing date MUST be a 1st or 15th.
Any selected final eligible date MUST be on or after the first continuing
occurrence under the accepted terms. The server-owned preview and the locked
apply command MUST both enforce these rules; equality permits that one
continuing occurrence, and the immediate initial contribution MUST NOT make an
otherwise invalid continuing range valid.

The server MUST attempt one actual initial contribution immediately for each
disclosed compatible billing cohort—never one per line or per twice-monthly
execution leg. If a cohort's continuing schedule begins today, that contribution
is its first occurrence and MUST NOT be duplicated. If the donor selects a
future continuing date, checkout MUST disclose every initial contribution and
the future first continuing occurrences separately. For each cohort, the
accepted command MUST freeze exactly one initial-attempt owner: either one
charge-owning executor-invoice provisioning operation or one product-triggered
payment operation. The other branch MUST be forbidden, and executor provisioning
in the product-triggered branch MUST be proven non-charging. Every request and provider effect MUST use durable local
semantic idempotency plus adapter idempotency so replay cannot duplicate any
group, line, cohort, schedule epoch, initial contribution, provider executor,
occurrence, attempt, or communication candidate. Every provider effect MUST
have one exact scoped child operation; pre-binding executor provisioning MUST
target its pre-existing execution leg and complete frozen line/item plan rather
than a fabricated future binding.

Every recurring group MUST freeze one exact Legal Entity, and every accepted
billing cohort MUST freeze one exact effective Settlement Account Binding
before provider creation. Legal Entity, settlement binding, currency, payer,
authorization, and provider capability are compatibility inputs, not mutable
defaults. The client MUST NOT choose either identifier. A later default,
connection, or account change applies prospectively and MUST NOT reroute an
accepted group, occurrence, event, refund, or recovery command.

A newly created recurring arrangement MUST enter the signed provider-event and
reconciliation path so normal renewal evidence updates occurrence execution,
provider payment finality, canonical contribution/ledger posting, and executor
control as separate folds for the exact cohort occurrence and its line
allocations. Provider success MUST NOT itself claim ledger posting or receipt
eligibility, and a posting MUST NOT move the scheduled grid. The product
schedule MUST remain provider-neutral, versioned business truth; a provider
object MUST NOT become the commitment or move its calendar grid. Normal
renewals MUST NOT be rebuilt as manual one-time-payment loops. A configured
provider subscription MAY execute ordinary renewals only; provider-native
automatic retries MUST be disabled or proved unable to overlap the product-
owned Phase 16 recovery candidates and commands.

**Supersession (2026-07-13):** the original one-subscription-to-one-
`donor_pledges` requirement is replaced by this Phase 16 group/line/cohort
contract. The legacy row is migration evidence and MUST NOT be extended as the
target write model.

#### Scenario: A donor starts compatible support for two destinations

- WHEN a donor completes checkout with two monthly destination lines that share
  one payer, currency, authorization, anchor, collection behavior, tenant,
  Legal Entity, Settlement Account Binding, and provider item capacity
- THEN the server creates one explicit group, two stable lines, and one
  compatible billing cohort
- AND because this scenario uses an ordinary monthly cadence, the Stripe adapter
  creates one execution leg/subscription with one exact item binding per line
- AND retrying the same request creates no duplicate group, line, cohort,
  contribution, subscription, or item

#### Scenario: A future continuing start is disclosed separately

- GIVEN a donor submits on May 10 and chooses June 1 as the monthly continuing
  anchor
- WHEN the recurring arrangement is authorized
- THEN one initial contribution for the one disclosed cohort is attempted on
  May 10
- AND the first continuing occurrence is June 1 with later occurrences anchored
  to that grid
- AND the donor sees both effects before submitting

#### Scenario: An invalid continuing range is rejected

- GIVEN a donor submits on May 10, chooses June 1 as the first continuing
  monthly occurrence, and selects May 20 as the final eligible date
- WHEN the server previews or applies the recurring arrangement
- THEN the request is rejected because the final eligible date precedes the
  first continuing occurrence
- AND choosing June 1 as the final eligible date permits exactly that one
  continuing occurrence

#### Scenario: Stable line identity separates terms from calendar history

- GIVEN an accepted line later changes amount and then changes its next
  recurring date
- WHEN the changes apply
- THEN the destination-line identifier remains stable, the amount change
  appends only a line-term version, and the calendar change appends a matching
  line-term version and schedule epoch
- AND historical term versions and schedule epochs remain immutable and the
  current pair must agree at its effective boundary

#### Scenario: A multi-cohort group discloses each initial charge

- GIVEN one explicit recurring group requires two incompatible billing cohorts
- WHEN the donor reviews and submits the arrangement
- THEN checkout shows two initial charge amounts and their affected lines before
  authorization
- AND the server attempts exactly one initial contribution per cohort
- AND each cohort freezes exactly one executor-invoice or product-triggered
  initial-attempt owner, never both or neither
- AND neither cohort creates an additional initial charge per destination line
  or per twice-monthly execution leg

#### Scenario: Group-level incompatibility creates separate groups

- WHEN proposed lines differ in Commitment Party, legal payer/collection-
  authorizer context, tenant, Legal Entity, or currency
- THEN the server creates separate explicit recurring groups rather than
  merging incompatible donor agreements
- AND checkout discloses the resulting group and charge effects before
  authorization

#### Scenario: Executor incompatibility forms honest separate cohorts

- GIVEN proposed lines belong to the same explicit recurring group
- WHEN they differ in cadence, anchor, payment authorization lineage, exact
  Settlement Account Binding, collection behavior, provider capability, or
  another executor requirement
- THEN the server forms separate compatible cohorts rather than normalizing the
  lines into one misleading charge
- AND checkout discloses the exact charge count, amounts, and dates before
  authorization

#### Scenario: Twice-monthly remains one business cadence with two execution legs

- GIVEN a recurring line uses the twice-monthly cadence on the 1st and 15th
- WHEN the Stripe adapter provisions continuing collection
- THEN the line remains in one business cohort and schedule intent
- AND the adapter binds two explicit monthly execution legs/subscriptions
- AND the line has one exact item binding in each leg
- AND donor, staff, and missionary surfaces present one twice-monthly cadence,
  not two recurring commitments

#### Scenario: A created recurring gift bills over time

- GIVEN a donor-created recurring group has a bound provider executor
- WHEN signed provider events report ordinary renewals and payment outcomes
- THEN the exact cohort occurrence and line allocation facts update idempotently
- AND occurrence execution, payment finality, canonical ledger posting, donor
  intent, collection health, and provider control remain separate
- AND no mutable legacy pledge counter or manual one-time-donation loop is used
  to bill it

#### Scenario: Provider retry configuration cannot overlap product recovery

- GIVEN an ordinary provider-generated renewal fails with retry-permitted
  evidence
- WHEN the Phase 16 recovery evaluator creates any bounded retry candidates
- THEN provider-native automatic retries are disabled or proved unable to
  overlap those product-owned commands
- AND the provider never chooses recovery eligibility, candidate dates, attempt
  budget, or runway

#### Scenario: A settlement default changes after acceptance

- GIVEN an accepted recurring cohort is pinned to one Legal Entity and
  Settlement Account Binding
- WHEN the tenant changes its current default processor connection
- THEN existing occurrences, signed events, refunds, and recovery continue to
  resolve through the frozen binding
- AND only a separately authorized prospective replacement may bind later work
