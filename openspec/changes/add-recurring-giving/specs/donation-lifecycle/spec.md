# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Donors Can Start Recurring Giving

The platform MUST let a donor initiate recurring giving through checkout using one explicit recurring-giving group with one or more independently manageable destination lines.

Every clause in `openspec/contracts/donation-lifecycle.md#contract-e0cfb2b09c4242e7975e` MUST apply without exception.

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
