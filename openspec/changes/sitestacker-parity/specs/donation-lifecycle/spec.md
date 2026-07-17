# Delta for Donation Lifecycle

## MODIFIED Requirements

### Requirement: Recurring Donation State Reflects The Subscription Lifecycle

The platform MUST reflect recurring donation execution from the explicit
recurring-giving group, destination lines, compatible billing cohorts,
effective-dated schedule epochs, named occurrences, and provider evidence.
Provider subscriptions are execution-leg bindings under one compatible cohort,
not the donor's commitment. Ordinary cadences use one leg; twice-monthly uses
two monthly legs for the 1st and 15th. Each line MUST bind to its exact provider
item in every applicable leg. Destination-line identity MUST remain stable
across changes; changed business terms append effective line-term versions,
while changed calendar intent appends separate schedule epochs. The schedule
epoch owns the calendar grid and the matching line-term version freezes the
donor-disclosed terms; disagreement MUST fail closed or split the cohort. A
group MUST never be inferred from donor, email, payment method, schedule, date,
or provider metadata.

Product-owned calendar intent and occurrences MUST remain authoritative for
what the donor scheduled. Provider-confirmed events MUST remain authoritative
for whether a payment is processing, succeeded, failed, returned, refunded, or
otherwise final. Occurrence execution, provider payment finality, canonical
contribution/ledger posting, and receipt eligibility MUST remain separate
folds: provider success MUST NOT itself claim ledger posting, and posting MUST
NOT move the scheduled date or future grid. Current binding, application-
ownership, capability, provider-
object, in-flight-work, and reconciliation evidence MUST govern whether Asym
can prove control of the executor. Invoice, subscription, and payment events
MUST update the named occurrence and separate donor-intent, schedule,
occurrence-execution, payment-finality, ledger-posting, collection-health, and
provider-control/reconciliation projections idempotently; they MUST NOT
increment mutable pledge counters, overwrite schedule history, or collapse
those axes into one status.

Donor cancellation MUST be terminal for donor intent at its effective boundary
even when provider stop confirmation is pending, while later provider events
MUST still preserve truthful in-flight and money outcomes without resurrecting
future collection intent. The platform MUST NOT rebuild normal recurring
billing as a manual loop of one-time donation attempts. Stripe or another
verified adapter MAY execute ordinary renewals; Asym owns the product schedule,
command and recovery policy, exact binding, reconciliation, and role-safe
meaning. Provider-native automatic retries MUST be disabled or proved unable to
overlap Asym-owned recovery commands. A provider subscription MAY own ordinary
renewal execution, but MUST NOT choose product recovery eligibility, candidate
dates, attempt budgets, or runway.

Each accepted checkout cohort MUST freeze exactly one owner for its immediate
initial attempt: either one charge-owning executor-invoice provisioning
operation or one product-triggered payment operation. Both owners and no owner
MUST fail closed. Every provider side effect MUST have one exact, scoped,
idempotent child operation; initial provisioning before a binding exists MUST
target the exact execution leg and frozen complete line/item plan.

The checked-in `donor_pledges` subscription reflection is migration evidence,
not the Phase 16 target. Donor-initiated creation and the replacement recurring
model remain forward work until their blocked implementation slices are
separately dispatched and verified.

#### Scenario: A recurring invoice is paid

- GIVEN a provider invoice maps through one exact tenant/account/mode binding to
  one billing-cohort occurrence and its line items
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

#### Scenario: A recurring executor is cancelled at the provider

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
  resolve to exactly one expected tenant and executor binding
- THEN the event is retained as quarantined evidence without a recurring-domain
  write
- AND metadata does not select a tenant or authorize a mutation
