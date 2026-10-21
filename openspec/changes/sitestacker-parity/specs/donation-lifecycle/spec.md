# Delta for Donation Lifecycle

## MODIFIED Requirements

### Requirement: Legacy Recurring Reflection Does Not Define The Target Topology

The platform MUST reflect recurring donation execution from the explicit recurring-giving group, destination lines, compatible billing cohorts, effective-dated schedule epochs, named occurrences, and provider evidence.

Every clause in `openspec/contracts/donation-lifecycle.md#contract-1f7ed6c340ec7e0c8ef5` MUST apply without exception.

#### Scenario: A recurring invoice is paid

- GIVEN a provider invoice maps through one exact tenant, Legal Entity,
  Settlement Account Binding, provider account, and mode tuple to one
  billing-cohort occurrence and its line items
- WHEN the provider confirms the invoice payment succeeded
- THEN the payment-finality fold linked to the named occurrence records success
  and the canonical contribution path posts each effective designation
  allocation exactly once
- AND successful payment, contribution/ledger posting, and receipt eligibility
  remain separately evidenced rather than one collapsed state
- AND duplicate or out-of-order deliveries do not increment counters,
  duplicate money, move the schedule, or mutate a sibling line

#### Scenario: Provider retry settings cannot become product policy

- GIVEN an ordinary renewal payment fails with retry-permitted evidence
- WHEN the Phase 16 recovery evaluator decides whether another attempt is
  eligible
- THEN only the product-owned occurrence policy may create the bounded recovery
  candidates and commands
- AND provider-native retries are disabled or proved unable to overlap those
  commands; a subscription or dashboard setting cannot select retry timing or
  budget

#### Scenario: A subscription is cancelled at the provider

- WHEN current provider evidence confirms a recurring cohort executor is
  cancelled
- THEN provider-control state records the confirmed stop and the affected
  projection derives its truthful consequence
- AND later out-of-order provider updates do not resurrect canceled or ended
  donor intent
- AND any already submitted payment remains a separate truthful in-flight or
  final occurrence

#### Scenario: A donor cancels while provider control is unknown

- GIVEN the donor submits a valid cancellation instruction
- WHEN Asym cannot yet prove that the provider executor stopped
- THEN future Asym commands are suppressed and donor intent shows cancellation
  recorded with provider confirmation pending
- AND the platform does not claim the external executor stopped
- AND no replacement executor is created until control, old-stop, in-flight,
  tenant, account, mode, and current-authorization proof succeeds

#### Scenario: An event cannot be routed to one exact tenant binding

- WHEN a signed provider event's top-level account or live/test mode does not
  resolve to exactly one expected tenant, Legal Entity, Settlement Account
  Binding, and executor binding
- THEN the event is retained as quarantined evidence without a recurring-domain
  write
- AND metadata does not select a tenant or authorize a mutation
