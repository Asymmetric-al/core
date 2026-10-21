# donation-lifecycle normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-66a763e96ce20c130643"></a>

## Receipts Follow The Governed Facts-To-Artifact-To-Delivery Pipeline

<!-- BEGIN CONTRACT {"id":"66a763e96ce20c130643","name":"Receipts Follow The Governed Facts-To-Artifact-To-Delivery Pipeline"} -->

The receipt/statement source domain MUST derive one immutable, versioned facts
record from canonical posted gift truth and its frozen legal-donor, Legal
Entity, allocation, currency, correction, and eligibility evidence. Payment
success alone MUST NOT make a receipt eligible or issued.

The document-production subsystem MUST render an official receipt only from
that approved facts version through an immutable published template version
and MUST preserve the resulting canonical artifact and correction lineage.
Outbound delivery MUST then use the platform communication spine and governed
send seam, pinning the exact artifact, template, and facts versions and
recording a communication event. Rendering MUST NOT send, and delivery MUST
NOT recompute gift or receipt truth.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-83309d47007d0aba6d98"></a>

## Gift Anonymity Is A Per-Gift Visibility Preference

<!-- BEGIN CONTRACT {"id":"83309d47007d0aba6d98","name":"Gift Anonymity Is A Per-Gift Visibility Preference"} -->

A donor or authorized staff member MUST be able to mark an accepted
contribution anonymous to missionary and public audiences. The accepted Phase
13 contribution header MUST freeze the per-gift choice. A current Party-level
preference MAY seed the initial choice but MUST NOT replace the accepted
per-gift fact or rewrite prior gifts.

Anonymity MUST NOT conceal the legal donor from authorized finance and
administrative roles, the donor viewing their own gift, official receipt facts,
reconciliation, or audit. Missionary/public projections, notifications,
exports, search indexes, analytics payloads, caches, logs, and hydration data
MUST enforce redaction server-side and MUST NOT emit a stable hidden Party or
contact identifier.

Changing the choice after acceptance MUST use the shared contribution
correction boundary, require the applicable capability and reason, and append
an audit event with actor, before/after value, source surface, reason, and
timestamp.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-97ac5470f9e97dd1fe3d"></a>

## Payment And Gift Lifecycle Folds Stay Separate And Honest

<!-- BEGIN CONTRACT {"id":"97ac5470f9e97dd1fe3d","name":"Payment And Gift Lifecycle Folds Stay Separate And Honest"} -->

The platform MUST preserve payment authorization and finality, canonical
contribution/ledger posting, refund or adjustment state, receipt eligibility
and issuance, and communication delivery as separately authoritative lifecycle
folds. A role-appropriate summary MAY derive a simple display state, but no
single mutable status MAY overwrite or imply the other folds.

For delayed rails such as ACH Direct Debit, the payment-finality fold MUST
distinguish a started bank transfer from collected funds. Donor-facing copy
MUST NOT present authorization as settlement, provider success as canonical
posting, receipt eligibility as receipt issuance, or message acceptance as
delivery.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-fe173a148458d248a737"></a>

## Donors Manage Payment Methods Through Stripe

<!-- BEGIN CONTRACT {"id":"fe173a148458d248a737","name":"Donors Manage Payment Methods Through Stripe"} -->

The donor portal MUST support independent Add, selected-use Replace, explicit
Remove and optional new-gift payment-preference commands through their current
Phase 13/16 owner boundaries. Stripe-managed credential capture/setup remains
the payment-provider boundary; raw card or bank credentials MUST never reach
Asym servers. A donor's new-gift payment preference MUST be an actor-scoped
checkout suggestion, not a Stripe Customer billing default, recurring-method
change, collection mandate or automatic charge.

Replacement MUST identify the exact selected, currently permitted recurring
groups/lines and obtain each required authorization through the existing
revision-fenced owner commands. It MUST NOT mutate unselected siblings or
automatically detach the old method. Remove MUST be separately requested and
MUST remain blocked while any owner-certified live dependency, in-flight use,
competing accepted use or indeterminate provider effect prevents removal. A
historical reference or preference pointer alone MUST NOT become a permanent
removal blocker. Successful replacement is one way to resolve a live
dependency; it is not a blanket prerequisite when no such dependency exists.
The shared method-use/removal fence MUST prevent a new use from racing a
permitted removal. Removal outcomes MUST distinguish accepted/applying,
provider-confirmed success, known no-effect failure and indeterminate effect;
same-operation reconciliation MUST NOT issue another detach.

**Supersession (2026-09-09, Phase 25 / AL-1563):** the former provider-default
and combined replacement/removal wording is replaced here, in this active
normative requirement, by the ratified Phase 25 Wallet contract. The requirement
name remains stable for existing references. The provider credential boundary
and recurring authorization, history, idempotency and sibling-safety rules
remain in force.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9df606f6d099db7fa0c2"></a>

## Gift Begin Goes Through The Gift Intake Begin Command

<!-- BEGIN CONTRACT {"id":"9df606f6d099db7fa0c2","name":"Gift Begin Goes Through The Gift Intake Begin Command"} -->

Every Gift begin MUST go through the Gift Intake Begin Command in `@asym/api`.
HTTP donate, HTTP donations, and GraphQL `createDonation` MUST call that
command. They MUST NOT call `begin_donation_saga` directly.

The command MUST start the Donation Saga transaction and return donation id,
outbox id, and whether the begin was replayed. It MUST NOT process the outbox
and MUST NOT create a Stripe PaymentIntent.

Amount units MUST stay adapter-owned. HTTP donate MAY convert dollars to cents
before the command. GraphQL and HTTP donations MUST pass the stored integer
amount as cents without a second conversion.

GraphQL `createDonation` MUST remain enqueue-only. HTTP donate and HTTP
donations MUST still attempt immediate outbox processing after a successful
begin. Guest Giving fee policy and cover-fees MUST NOT apply to GraphQL
`createDonation` unless a later accepted change says otherwise.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0d63d3c5244bf083d750"></a>

## Legacy Recurring Reflection Does Not Define The Target Topology

<!-- BEGIN CONTRACT {"id":"0d63d3c5244bf083d750","name":"Legacy Recurring Reflection Does Not Define The Target Topology"} -->

The currently shipped compatibility projection MAY reflect existing
Stripe-subscription events into legacy `donor_pledges` state, including
monotonic cancellation protection against out-of-order updates. That
one-subscription-to-one-pledge shape is implementation evidence only: the
platform MUST NOT extend it as the target recurring creation, occurrence,
agreement, or fulfillment model, and MUST NOT rebuild recurring billing as
manual loops of one-time donation attempts.

The active `add-recurring-giving` change supersedes this legacy topology for
forward implementation. Donor-initiated recurring creation is not yet part of
the shipped donor money path.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-73f178ad4e2d8cd3c1c9"></a>

## Guest Checkout Does Not Require An Account

<!-- BEGIN CONTRACT {"id":"73f178ad4e2d8cd3c1c9","name":"Guest Checkout Does Not Require An Account"} -->

A donor MUST be able to complete an online gift without first creating or
signing into an account. The public client MUST collect only the identity,
contact, allocation, and payment inputs required for the gift and MUST NOT
accept or select a canonical Party identifier.

At the accepted-contribution boundary, the server MUST use the tenant-scoped
Phase 4 identity resolution service to find or create the canonical Party. It
MUST then use the Phase 13 acceptance service to persist the contribution
header, exact allocation lines and postings, `legal_donor_party_id`, and frozen
source identity/contact evidence. Rejected or abandoned checkout attempts MUST
NOT create a Party, claim, membership, contribution, or official-document fact.

The response MUST have the same shape whether Phase 4 found or created the
Party. It MUST NOT expose a Party identifier, match result, account existence,
or any other signal that reveals whether the email was already known.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e0cfb2b09c4242e7975e"></a>

## Donors Can Start Recurring Giving

<!-- BEGIN CONTRACT {"id":"e0cfb2b09c4242e7975e","name":"Donors Can Start Recurring Giving"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-4040d2093a4baae62e2b"></a>

## Donors Self-Manage Recurring Gifts

<!-- BEGIN CONTRACT {"id":"4040d2093a4baae62e2b","name":"Donors Self-Manage Recurring Gifts"} -->

The donor portal MUST let a donor manage their own recurring-giving groups and
independently manageable destination lines. Supported commands MUST include
changing amount, cadence, next recurring date, optional end boundary, eligible
future designation, and payment method; skipping one named occurrence; pausing
until a date or indefinitely; resuming; stopping recovery for one missed
occurrence; canceling; and restarting as a linked successor through fresh
authorization. The portal MUST preview the exact affected lines/cohorts,
Today/Next/Then effects, charge count, amount, cadence, next projected dates,
and whether a payment is already in flight before a financial or destructive
command is confirmed.

Each action MUST execute through one tenant-scoped, donor-owned, append-only,
idempotent, revision-fenced server command. Line-specific changes MUST split a
line prospectively from a shared billing cohort when required rather than
silently mutate sibling lines. Historical schedule epochs and already submitted
payments MUST remain immutable. The destination-line identity MUST remain
stable: changed amount, designation, cadence, or other business terms append a
line-term version; a calendar-bearing change such as cadence, anchor, giving
timezone, preferred calendar day, or final boundary also appends its matching
separate schedule epoch, while a non-calendar term change does not;
skip, pause, resume, and cancellation append their own lifecycle facts. Restart
MUST NOT reopen the canceled line; it MUST create a linked successor with fresh
authorization, terms, schedule epoch, and any required executor binding. A term
change MUST NOT manufacture a schedule epoch, and the current term version and
schedule epoch MUST agree at their effective boundary. Saving a schedule or
payment method MUST NOT silently charge, prorate, catch up, back-charge, or move
the original calendar grid. If a donor intentionally changes
the next recurring date to today and that creates an immediately eligible
occurrence, the portal MUST show the exact amount/date and require a separate
explicit charge confirmation before any attempt. A past next date MUST be
rejected. An inclusive final eligible date MUST be on or after the first
continuing occurrence under the proposed terms, validated in preview and again
under the apply lock.

The portal MUST keep donor intent, schedule, occurrence execution, provider
payment finality, canonical ledger posting/receipt eligibility, provider command
progress, provider control, and collection health separate. It MUST show an
honest in-flight or reconciliation state until required evidence arrives. When
provider control is unknown, it MUST record and apply the safe donor instruction
locally, suppress unsafe Asym work, and quarantine provider mutation or
replacement until proof succeeds; it MUST NOT claim that an external executor
stopped. Self-service MUST NOT bypass ordinary provider renewal through manual
charge loops or expose provider retry controls. A provider subscription MAY own
ordinary renewal execution only; provider-native automatic retries MUST be
disabled or proved unable to overlap product-owned recovery commands.

A bounded pause MUST store a resume boundary, while an indefinite pause MUST
have none. Due occurrences inside either pause MUST remain as suppressed,
explainable facts. The resume boundary is the first date collection may become
eligible, not necessarily a charge date; resume MUST preserve the unchanged
calendar grid and MUST NOT charge immediately without a separately named and
confirmed gift. A bounded pause MAY resume automatically only after current
provider-control, authorization, payment-method, and occurrence proof succeeds;
an indefinite pause requires an authorized resume command. Stopping recovery
MUST affect only the named missed occurrence and MUST NOT pause or cancel future
scheduled support.

**Supersession (2026-07-13):** the original one-subscription/one-mutable-pledge
self-service topology is replaced by this Phase 16 line/cohort command contract.
`donor_pledges` is migration evidence only.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9c61193885cf993da87a"></a>

## Donation Creation Is Server-Authoritative And Idempotent

<!-- BEGIN CONTRACT {"id":"9c61193885cf993da87a","name":"Donation Creation Is Server-Authoritative And Idempotent"} -->

Every donation MUST be created through the server-side donation path, which
validates the gross amount, currency, tenant, Legal Entity, Settlement Account
Binding, and complete allocation-line set before any payment intent exists.
Every allocation line MUST name one valid designation, use a positive amount,
and the lines for a payment group MUST sum exactly to that group's gross amount
in one currency. Donation creation MUST require an idempotency key, and
retrying with the same key MUST NOT create a second donation, allocation,
payment group, or Stripe payment intent.

The client MUST NOT decide payment success. Donation state transitions MUST be
driven by server-confirmed Stripe outcomes, and Stripe remains the payment
authority as defined in `workflow-orchestration`.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-bfda0ee0804cf82a8cc4"></a>

## Donors Receive Annual Giving Statements

<!-- BEGIN CONTRACT {"id":"bfda0ee0804cf82a8cc4","name":"Donors Receive Annual Giving Statements"} -->

The platform MUST expose annual documents only through the canonical Phase 19
Statement Run and Phase 18 Generated Document authorities. Phase 7 MUST own the
exact legal-donor Statement Subject, eligibility, official facts and lines,
coverage, exclusions, corrections, and frozen display truth. Phase 19 MUST own
the reviewed frozen run population, source cutoff, participation, recipient
operation, and release. Household relationship, soft credit, DAF advisory
status, shared destination, or staff preference MUST NOT create or merge a
Statement Subject.

An official annual document MUST contain only the purpose- and
jurisdiction-authorized facts for its exact Statement Subject. Recognition-only
facts MUST NOT appear in an official artifact or official/deductible total. When
the tenant enables Phase 19's optional purpose-separated support overview, only
the closed Phase 14 household-support and disclosed-DAF projection MAY appear
in a separate `giving.summary.informational@1` artifact persistently labeled
**Support overview — Not a tax document**.

Phase 18 MUST resolve the immutable publication, admit the Generation Request,
produce the private canonical PDF, and preserve one current logical-document
head plus restricted immutable predecessors. The donor BFF MUST reauthorize the
exact Statement Subject, Delivery Recipient or representative, purpose, current
head, artifact, and records state for every list, view, range, and download
request. Repeated authorized view, download, and local print MUST return the
same exact current bytes without creating a document, delivery, or receipt
claim. Phase 17/6 alone owns outbound communication and delivery evidence.
Phase 19 MAY admit a deliberate bounded **Send another copy** occurrence but
MUST prevent equivalent unresolved duplicates and MUST reconcile indeterminate
provider handoff before another release.

A later correction, refund, donor relink, or newly eligible source fact MUST
first create source-owned correction or supplemental authority. Phase 19 and
Phase 18 MUST then create the linked supplemental or successor operation while
preserving the frozen primary run and predecessor evidence.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-39e51637fba607199fb9"></a>

## Receipts Follow The Governed Facts-To-Artifact-To-Delivery Pipeline

<!-- BEGIN CONTRACT {"id":"39e51637fba607199fb9","name":"Receipts Follow The Governed Facts-To-Artifact-To-Delivery Pipeline"} -->

Phase 7 MUST derive one immutable, versioned official-facts record from
canonical posted Phase 13 gift truth and its frozen legal-donor, Legal Entity,
allocation, currency, correction, eligibility, and source identity evidence.
Phase 7 owns the Statement Subject, official receipt identity, eligibility,
numbering, correction semantics, and facts version. Payment success, checkout,
the Party profile, and the contribution header MUST NOT independently claim
that a receipt is eligible, issued, rendered, or delivered.

Phase 18 MUST create or reuse the canonical artifact from the exact approved
facts version and immutable published document-template version. Phase 17 MUST
prepare governed message content from its typed contract without recomputing
official facts. Phase 6 MUST resolve the current purpose-eligible recipient and
contact point, re-prove consent and suppression, dispatch the pinned content
and artifact, and record the communication and delivery outcome.

Portal access and delivery MUST use the stored exact Phase 18 artifact bytes.
They MUST NOT rerender a live contribution, Party profile, or receipt snapshot.

Each handoff MUST be idempotent, version-pinned, and independently recoverable.
A failure downstream MUST NOT mutate accepted money, legal-donor source
evidence, official facts, or an existing artifact.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1f7ed6c340ec7e0c8ef5"></a>

## Legacy Recurring Reflection Does Not Define The Target Topology

<!-- BEGIN CONTRACT {"id":"1f7ed6c340ec7e0c8ef5","name":"Legacy Recurring Reflection Does Not Define The Target Topology"} -->

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

Every recurring group MUST freeze one exact Legal Entity, and every accepted
billing cohort MUST freeze one exact effective Settlement Account Binding
before provider creation. Those identifiers, currency, payer, authorization,
and provider capability are compatibility inputs rather than mutable defaults.
Signed events, refunds, recovery, and reconciliation MUST resolve through the
frozen tenant, Legal Entity, binding, provider account, and mode tuple.

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-dc94c04915c4c62ff355"></a>

## Financial Execution Is Pinned To One Exact Legal Entity

<!-- BEGIN CONTRACT {"id":"dc94c04915c4c62ff355","name":"Financial Execution Is Pinned To One Exact Legal Entity"} -->

A Legal Entity is the organization-owned legal issuer and financial reporting
boundary for a gift. A Settlement Account Binding is the effective-dated,
capability-qualified link from one Legal Entity to one exact processor account,
mode, currency, and collection context.

Every accepted payment group and independently authoritative financial root
MUST store its exact `legal_entity_id`. Each processor-bound payment group MUST
also store the exact Settlement Account Binding selected before provider
creation. Processing, webhook routing, reconciliation, refunds, documents, and
accounting handoffs MUST use those frozen identifiers rather than a mutable
tenant, site, or current-default lookup. The Legal Entity boundary MAY only
narrow the containing tenant's scope; it MUST NOT widen access across tenants.

A one-entity tenant MAY receive a quiet preselected default in the UI, but the
stored financial records MUST remain explicit. A checkout containing work for
different Legal Entities, currencies, or incompatible Settlement Account
Bindings MUST form separate, fully disclosed payment groups rather than one
ambiguous charge.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-662821c993c7fa6bbb07"></a>

## Presentment Currency Is Qualified Before Donor Choice And Payment

<!-- BEGIN CONTRACT {"id":"662821c993c7fa6bbb07","name":"Presentment Currency Is Qualified Before Donor Choice And Payment"} -->

An editable gift intent MUST contain one explicit presentment currency before
amount entry. Before amount entry, donor-visible currencies MUST equal Site
policy intersected with current Payments offering-envelope qualification for the
exact Tenant, environment, Site financial route, Legal Entity, Settlement
Account Binding, connected account, currency, gift mode, and any already-
selected cadence or rail. Amount- and payment-method-specific eligibility MUST
be re-evaluated as those facts become known. Setup qualification MUST be read-
only and MUST NOT create a Stripe customer, intent, setup intent, subscription,
charge, mandate, or setting. Checkout MUST re-prove the exact cart, amount,
cadence, method, limits, binding/account, provider contract/config generation,
and currency immediately before its first provider effect.

For an empty intent, a qualified country-level suggestion MAY be used, but an
explicit donor choice MUST win. Locale, browser language, URL, profile, cookie,
provider global support, or location MUST NOT authorize currency. One cart MUST
use one currency, and accepted contribution/recurring truth MUST freeze it.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ca38ddec28defdac778c"></a>

## Pre-Acceptance Currency And Schedule Transitions Preserve Purpose And Clear Dependencies

<!-- BEGIN CONTRACT {"id":"ca38ddec28defdac778c","name":"Pre-Acceptance Currency And Schedule Transitions Preserve Purpose And Clear Dependencies"} -->

A donor MAY change currency or exact enabled schedule only while the affected
gift intent remains editable and external outcome is known. A pristine
unanswered change MAY be immediate. Material input MUST require an accessible
consequence-specific confirmation and a server-revalidated, idempotent compare-
and-set successor.

A currency successor MUST preserve the exact target-valid schedule identity and
revalidated currency-independent purpose/unaffected intent while clearing all
money, fee, payment, authorization, and provider meaning. A schedule successor
MUST preserve the exact cart currency and revalidated schedule-independent
purpose/unaffected intent while clearing the source schedule and smallest
complete affected money/payment dependency closure. If the preserved axis is
incompatible, the command MUST write nothing and explain the conflict; it MUST
NOT silently clear or substitute that axis. Target amount MUST be unanswered
and target suggestions MUST remain unselected. Neither operation may perform
FX, rounding/digit carry, preset-position mapping, destination substitution,
proration, or accepted gift/recurring mutation.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-2c2cc9104e63081050db"></a>

## Payment Collection Uses Stripe-Hosted UI

<!-- BEGIN CONTRACT {"id":"2c2cc9104e63081050db","name":"Payment Collection Uses Stripe-Hosted UI"} -->

Checkout MUST collect card and bank credentials exclusively through a
supported Stripe-hosted surface so that PAN, CVC, and bank credentials never
reach Asym servers, logs, databases, analytics, or application state.

The client MUST NOT decide payment or contribution success. Donor-facing state
MUST derive from server-confirmed provider finality and the independently
authoritative Phase 13 contribution lifecycle. A delayed rail MUST be described
as processing until provider evidence proves the applicable finality.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-5170e83fc2e201e1c064"></a>

## Guest Giving Cover-Fees Use Gift Processing-Fee Policy

<!-- BEGIN CONTRACT {"id":"5170e83fc2e201e1c064","name":"Guest Giving Cover-Fees Use Gift Processing-Fee Policy"} -->

Guest Giving `POST /api/donate` MUST treat `amount` as the donor-entered gift in
dollars, not a client-grossed charge. Gift intake MUST recompute charged cents
through the Core Gift processing-fee policy from `cover_fees` and
`payment_method`, and MUST NEVER trust a client total. Checkout MUST remain a
thin adapter over that policy and MUST NOT own Stripe rates or rounding.

`cover_fees` MUST default to false and `payment_method` MUST default to `card`
when omitted so older clients keep charging the posted amount as the gift.
Copy MUST describe estimated processing costs and MUST NOT claim that 100% of
the gift reaches the field. Live ACH and wallet confirmation MAY be quoted in
the adapter and MUST remain blocked until those payment methods are enabled.

This requirement does not change allocation-line conservation of a payment
group's gross amount, does not apply cover-fees on the staff donations path,
and does not reopen tenant processor-cost attribution.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-74b193ea80aa042133d7"></a>

## Account Claiming Is Optional And Possession-Gated

<!-- BEGIN CONTRACT {"id":"74b193ea80aa042133d7","name":"Account Claiming Is Optional And Possession-Gated"} -->

After an accepted guest gift, the platform MAY offer a quiet, tenant-branded
invitation to claim portal access. Claiming MUST use the Phase 4
verified-possession boundary. Supplying an email during checkout MUST NOT bind
a login, reveal giving history, or authorize access.

Claim initiation and completion MUST be enumeration-safe, expiring,
single-use, rate-limited, audited, and independently retryable from gift
acceptance. Failure to prepare or deliver a claim invitation MUST NOT change
the accepted contribution.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
