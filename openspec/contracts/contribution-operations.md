# contribution-operations normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-dc69633a19a3874b09b1"></a>

## Contribution Detail Shows Operational And Donor-Visible Consequences

<!-- BEGIN CONTRACT {"id":"dc69633a19a3874b09b1","name":"Contribution Detail Shows Operational And Donor-Visible Consequences"} -->

Mission Control contribution detail MUST show staff the operational context of
a gift and the donor-visible consequence of meaningful corrections before the
user confirms a high-risk action.

The detail SHOULD include donor, gift, designation, payment, the independently
joined Phase 7 receipt-facts result, Phase 18 artifact, Phase 6 delivery
outcome, refund, recurring, CRM, audit, task, batch, provider, and donor-visible
state when available. It MUST NOT collapse those joins into one stored
contribution receipt status or revive a staged-gift runtime.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c4e118881be86ac51ec4"></a>

## Every Staff-Entered Offline Gift Uses The Phase 15 Gateway

<!-- BEGIN CONTRACT {"id":"c4e118881be86ac51ec4","name":"Every Staff-Entered Offline Gift Uses The Phase 15 Gateway"} -->

Every staff-entered offline gift MUST be staged, validated, reviewed as policy
requires, and committed through Phase 15 `gift_entry_batches`. This includes a
single gift entered from the Contribution Hub or a donor-first CRM surface.
Quick entry MUST create a one-row batch behind a simplified form; hiding batch
terminology from the common path MUST NOT bypass the batch's validation,
conservation, permission, audit, deposit-reference, or atomic commit rules.

The Phase 15 commit service MUST be the sole writer of staff-entered offline
money. It MUST write canonical Phase 13 contribution headers, allocation lines,
and postings and invoke the shared Contribution Operations Core for audit and
correction policy. A standalone route or feature-local service MUST NOT write
an offline contribution directly.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0aee09c987fe3a675774"></a>

## Contribution Corrections Preserve Money And Identity Truth

<!-- BEGIN CONTRACT {"id":"0aee09c987fe3a675774","name":"Contribution Corrections Preserve Money And Identity Truth"} -->

Contribution operations MUST distinguish harmless internal metadata edits from
corrections that affect money, donor identity, designation, provider state,
refunds, official donor records, or donor-visible history.

Harmless internal metadata MAY update directly only through its qualified
source-owned record when it does not change money, identity, designation,
official donor records, provider state, or donor-visible history. For a posted
contribution, the edit MUST target a separate owner-controlled operational
record with exact same-Tenant source identity and current authorization. It
MUST NOT UPDATE or DELETE the posted financial header, designation lines or
postings, including operational-looking or subsequently added columns.

In-place edits to draft or never-posted source records MAY occur only when the
owning source contract authorizes that exact edit. A mutable operational state
change MUST NOT turn previously posted financial facts back into an editable
draft. The durable posting/freeze fact and ADR-0206 remain binding.

Corrections MUST be recorded for donor relinking, amount correction,
fund/designation correction, missionary or project allocation correction,
refund correction, receipt or statement correction, payment state correction,
Stripe replay, and other provider-state corrections.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1fe25b586ff24315db30"></a>

## Phase 27 P15 reported gift intake and independent completion

<!-- BEGIN CONTRACT {"id":"1fe25b586ff24315db30","name":"Phase 27 P15 reported gift intake and independent completion"} -->

P15 SHALL own a bounded operational actual-receipt report with trusted Tenant/recorder/time, attributed handling assertion/time precision, reported holder or explicit unknown, current accountable next work/owned exception and exact lineage. Unknown donor, entity, amount or allocation can remain unknown in the restricted nonfinancial intake envelope. It is not money or a nullable financial-root escape hatch. Continue/reconcile the same occurrence through existing batch/commit; already valid entry needs no compulsory precursor. Reporting grants no posting/correction/receipt/commitment authority. Recording and physical handling complete independently through exact source evidence; partial coverage closes only covered work. Accepted obligations survive appeal closure, cleanup and departure.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-36bb4c1c2a05e22ce3a8"></a>

## Posted Financial Facts Have Separate Owner Operational State

<!-- BEGIN CONTRACT {"id":"36bb4c1c2a05e22ce3a8","name":"Posted Financial Facts Have Separate Owner Operational State"} -->

The system MUST keep the complete posted contribution header, designation lines
and postings immutable, including subsequently added columns. Following the
accepted founder ruling in ADR-0206, mutable payment/review and acknowledgment
operational state MUST use separate domain-owned records with exact same-Tenant
source references, exposed through coherent authorized joined projections.
No operational-field allowlist or privileged path MAY update a posted financial
row. The durable posting/freeze fact MUST govern this protection; changing an
operational status MUST NOT reopen the row for editing.

Phase 13 MUST retain payment source evidence, finance review and operational
reconciliation ownership. Posting/reversal and effective money MUST remain
append-only-derived. Phase 14 MUST retain separate acknowledgment purpose/request
state and exact admitted contribution/settlement relations, including existing
consolidated-request cardinality. Phase 7 facts, Phase 18 artifacts, Phase 19
statement operations and Phase 6 communication outcomes MUST retain their
independent owners rather than becoming mutable header/request copies.
Phase 14 current attribution repair MUST preserve frozen initial header capture.
Phase 15 deposit membership and operational return state MUST use separate
gift-grain owner records with at most one current deposit per gift and append-only
assignment history. Same-Tenant, settlement-rail, currency/account and exact
consumed-revision constraints MUST remain binding; deposit reassignment MUST NOT
rewrite posted headers or create money. Financial return corrections MUST retain
the existing append-only source contract.

Local accepted state, source result, required audit and outbox facts MUST commit
atomically under the qualified owner command, with expected revisions and
permanent semantic identity. Provider I/O and uncertainty MUST use the existing
source recovery contract. Locking the immutable header for sequence allocation
MAY serialize append-only postings; it MUST NOT update a header counter.
Joined readers MUST preserve exact current authority and coherent source
versions/cursors and MUST NOT substitute stale legacy state for unavailable facts.
A source-qualified known absence MUST remain a valid result where the owner
contract admits it, with exact scope/version and completeness proof. A failed
lookup, unavailable evidence or missing required record MUST NOT default to
that known absence or success. This sets no mandatory row-per-source cardinality.
This architecture ruling does not settle C-01's staff-correction approval policy
or prove that the schema and runtime have been implemented.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-72571c0077f0d8d5eb90"></a>

## Contribution Operations Core Owns Staff Gift Actions

<!-- BEGIN CONTRACT {"id":"72571c0077f0d8d5eb90","name":"Contribution Operations Core Owns Staff Gift Actions"} -->

Mission Control contribution actions MUST pass through a shared
Contribution Operations Core whenever staff read or mutate contribution
operations state from the Contribution Hub, donor CRM record, automation, or
future batch flows.

The Contribution Operations Core MUST be the server-side action and read-model
boundary for staff contribution operations. It MUST own contribution detail,
correction records, operation audit events, reason and confirmation policy,
high-risk permission checks, provider outcome capture, donor-visible state
updates, and action execution.

The Contribution Hub and donor CRM record MAY present different layouts, but
they MUST call the same backend contribution action layer and return the same
canonical contribution truth after mutation.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0522e0b7a8df62b436a0"></a>

## Tribute Coverage Uses Canonical Recipient Identity

<!-- BEGIN CONTRACT {"id":"0522e0b7a8df62b436a0","name":"Tribute Coverage Uses Canonical Recipient Identity"} -->

Phase 14 tribute notification coverage MUST use the canonical actual recipient
Party and contribution header within one Tenant as its identity. The target
coverage key is `(tenant_id, recipient_party_id, header_id)`. The separate
`notify_party_id` MUST retain the exact tribute stream-preference provenance;
it MUST NOT substitute for recipient identity. The letter's independent
`(tenant_id, tribute_id, notify_party_id, period_key)` anchor MUST remain intact.

The source MUST atomically claim coverage with its purpose letter and durable
outbox request. Matching same-Tenant composite relationships MUST bind the
actual recipient, authorized preference row, letter and contribution header,
even for privileged writes. An authorized per-gift recipient override MUST
resolve the actual recipient and coherent authorized stream/letter provenance
before the coverage claim; neither a mismatched identity nor the override
itself grants authority. Tombstone/re-add, Party/tribute merge and an
honor-to-memorial successor MUST preserve earlier recipient/header claims,
original presentation history and applicable strictest suppression. A new
stream MUST NOT silently reset coverage or inherit gift links automatically.

Only an authorized prepared/held purpose proved not released MAY cancel and
reopen coverage in one expected-state/revision transaction that races source
release. Released, submitted or uncertain work MUST follow exact source and
Phase 6 receipt-backed recovery; cancel UI, timeout or retry MUST NOT reset
already-released coverage or fabricate recall/retraction. Source purpose,
Phase 6 communication outcomes and Phase 18 artifact authority remain separate.

This planned contract projects the accepted Phase 14 D3.1/D3.11, F.1/F.6/F.12,
data-model and ownership-matrix outcomes in
`docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`. It does not
claim that the target runtime has shipped. The separate accepted C-02
requirement below and ADR-0206 govern physical operational-state placement;
this tribute contract retains its source, coverage and cancellation semantics.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-8e1c185df0fbdfc400b4"></a>

## Stripe Remains Payment Authority For Refund And Provider State

<!-- BEGIN CONTRACT {"id":"8e1c185df0fbdfc400b4","name":"Stripe Remains Payment Authority For Refund And Provider State"} -->

Stripe MUST remain the payment execution and payment-method authority for
Stripe-backed contributions. When refund or provider-replay outcomes are
recorded, the platform MUST record Stripe outcomes honestly and MUST NOT imply
final refund or payment-state completion before provider outcomes or
webhook-confirmed operational truth supports it.

Staff-initiated refund and provider-replay execution is not yet part of the
shipped path; the platform today records provider-confirmed refund outcomes.
The staff-initiated execution path is proposed as forward work.

Trust-sensitive Stripe identifiers and credentials MUST remain behind
server-side boundaries.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1ece7948235e5a82faf6"></a>

## Receipt Evaluation Remains Source-Owned

<!-- BEGIN CONTRACT {"id":"1ece7948235e5a82faf6","name":"Receipt Evaluation Remains Source-Owned"} -->

After a successful Phase 15 commit, the platform MUST emit the source occurrence
needed for Phase 7 to evaluate official receipt eligibility and facts. Phase 15
and the contribution header MUST NOT persist a mutable receipt outcome or infer
issuance from the presence of a donor email.

An `unknown_offline` contribution MUST receive an explicit Phase 7
not-receiptable reason while required legal-donor evidence is absent. If
authorized staff later obtains sufficient evidence, the change MUST use a
governed Phase 13 source correction. Phase 7 MAY then append a successor facts
version; the original contribution and correction evidence remain immutable
and explainable.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-dfc1259c58538c205338"></a>

## Contribution Operation Audit Is Canonical And Cross-Surface

<!-- BEGIN CONTRACT {"id":"dfc1259c58538c205338","name":"Contribution Operation Audit Is Canonical And Cross-Surface"} -->

Every meaningful contribution action MUST write an operation audit event that
records actor, tenant, contribution, source surface, action type, timestamp,
reason when required, safe before/after summary, related provider identifiers,
related tasks, related batches, and downstream effects.

Provider identifiers MAY be persisted in server-side audit metadata, but
staff-facing audit reads, action results, exports, and summaries MUST omit or
redact them unless the viewer has `contributions.use_provider_actions`.

The audit trail MUST make clear whether an action came from the Contribution
Hub, donor CRM record, automation, or future batch execution.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a16d4d9d34b27cb9040e"></a>

## Offline Entry Gives Clear And Recoverable Feedback

<!-- BEGIN CONTRACT {"id":"a16d4d9d34b27cb9040e","name":"Offline Entry Gives Clear And Recoverable Feedback"} -->

The known/unknown choice MUST be plain-language, accessible, and reversible
while the row is still a draft. Quick entry MUST default to the known-donor
search without forcing staff through batch concepts, with an adjacent
"Donor is unknown" choice that explains the receipt consequence before commit.
No hidden default MAY create a synthetic identity.

Validation MUST identify the exact row and field, preserve valid draft work, and
provide the next corrective action. Commit feedback MUST distinguish draft,
needs review, posted, partly blocked, and failed outcomes truthfully. A retry
with the same batch and row idempotency identities MUST NOT duplicate the
contribution.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-6b0d436abf3672a99ee5"></a>

## Bulk Contribution Actions Use The Single-Action Contract

<!-- BEGIN CONTRACT {"id":"6b0d436abf3672a99ee5","name":"Bulk Contribution Actions Use The Single-Action Contract"} -->

Bulk contribution actions MUST execute per-record work through the same
Contribution Operations Core action contract used by single contribution
actions. Bulk execution MUST NOT bypass permission, reason, confirmation,
correction, notification, task, or audit rules.

Every bulk contribution action MUST require confirmation. High-risk bulk
actions MUST require preview plus confirmation and MUST run as background
batches. Small low-risk batches MAY run immediately when tenant settings allow
preview skipping.

Batch results MUST record summary counts, per-record status and reason, audit
links, task links, and CSV export data.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e61bb6f0324d18799730"></a>

## Staff Can Initiate Contribution Refunds

<!-- BEGIN CONTRACT {"id":"e61bb6f0324d18799730","name":"Staff Can Initiate Contribution Refunds"} -->

Staff who hold the `contributions.run_refunds` capability MUST be able to
initiate a full or partial refund of a Stripe-backed contribution from Mission
Control, executed server-side through Stripe. That capability is held by finance
approver, admin, and super_admin. The action MUST require
`contributions.run_refunds`, a reason, and server-side confirmation, and MUST
record the provider outcome truthfully without implying final refund completion
before provider or webhook-confirmed truth supports it. Capability resolution
follows `identity-and-access`.

Bulk refunds MUST run per-record through the single-action contribution action
contract with preview and confirmation, as a background batch, and each
per-record refund MUST enforce the same high-risk policy and capability gate as
a single refund. Trust-sensitive Stripe identifiers and credentials MUST stay
behind server-side boundaries.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1fc0537639c6eb62a033"></a>

## High-Risk Contribution Actions Require A Granular Capability And Reason

<!-- BEGIN CONTRACT {"id":"1fc0537639c6eb62a033","name":"High-Risk Contribution Actions Require A Granular Capability And Reason"} -->

High-risk contribution actions MUST resolve the granular server-side capability
for the action, a reason, and a clear confirmation prompt enforced server-side.
For example, refunds require `contributions.run_refunds`, while Stripe replay
requires `contributions.use_provider_actions`. Those capabilities are held by
finance approver, admin, and super_admin, not baseline finance staff.
Capability resolution follows `identity-and-access`; the legacy coarse
`finance:manage_contributions` permission does not authorize refunds or Stripe
replay.

The non-suppressible high-risk actions include refunds, donor relinking,
designation or fund correction, payment state correction, and Stripe replay.

Organization or user prompt settings MUST NOT suppress the reason prompt for
these actions.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-63aeaec7af83662208d1"></a>

## Staff Contribution Search Supports Gift Operations

<!-- BEGIN CONTRACT {"id":"63aeaec7af83662208d1","name":"Staff Contribution Search Supports Gift Operations"} -->

The Contribution Hub MUST support gift-first contribution search and filtering
for operational investigation. Search and filters SHOULD include donor name,
donor address/location, phone, gift date range, payment method, payment type,
safe last-four, status, derived receipt/document/delivery outcome, refund
state, designation, fund, missionary, project, batch, and other contribution
fields when available. Receipt filters MUST compile against the Phase 7 facts,
Phase 18 artifact, and Phase 6 delivery projections and MUST NOT read a mutable
receipt-status column on the contribution.

Provider identifier search and filtering, including Stripe PaymentIntent,
charge, refund, webhook, and replay identifiers, MUST require
`contributions.use_provider_actions`. Staff without that permission MUST stay on
safe payment summaries, including safe last-four, brand, bank, status, and
contact-based search inputs.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1b202627a552c9d7996d"></a>

## Donor Correction Communications Use Governed Content and Shared Dispatch

<!-- BEGIN CONTRACT {"id":"1b202627a552c9d7996d","name":"Donor Correction Communications Use Governed Content and Shared Dispatch"} -->

The contribution operation MUST own the correction-notification purpose and
source facts. Phase 17 Email Studio MUST own the provider-neutral
template/version contract, required merge-tag validation, governed content, and
sender/reply resolution. Phase 6 MUST own consent evaluation, durable
communication intent, dispatch through the approved Resend transport,
communication-event history, and provider outcome.

Contribution operations, automations, and future bulk actions MUST NOT send
donor-facing contribution correction emails directly through Resend or a
feature-local email builder.

If a required correction template is missing, inactive, or invalid during
Phase 17 resolution or preparation, the contribution action MUST remain
complete, Phase 6 MUST NOT dispatch a fallback donor email, the notification
decision MUST be audited, and follow-up task intent MUST be created through the
shared task contract. Once a correction notification has crossed the durable
prepared-message boundary, dispatch MUST NOT re-check template activity; it
re-proves only the current safety fences that apply to the frozen payload.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9f7cc8619f882c96bfa4"></a>

## Offline Rows Support Known And Intentionally Unknown Donors

<!-- BEGIN CONTRACT {"id":"9f7cc8619f882c96bfa4","name":"Offline Rows Support Known And Intentionally Unknown Donors"} -->

Phase 15 MUST offer two explicit payer-identity modes for an offline row:
`known` and `unknown_offline`.

For `known`, the staff Party picker/create flow MUST use the tenant-scoped Phase
4 boundary. The accepted Phase 13 header MUST carry
`donor_identity_status = known`, the exact same-tenant
`legal_donor_party_id`, and frozen source identity/contact evidence. Staff MAY
set the per-gift missionary/public visibility preference subject to the same
projection and audit rules as online gifts.

For `unknown_offline`, the accepted Phase 13 header MUST carry
`donor_identity_status = unknown_offline` and
`legal_donor_party_id = null`. The system MUST NOT require or fabricate a
placeholder Party, name, email, postal address, or contact point. The row MUST
still require the applicable amount, civil date, method, currency, Legal
Entity, designation/allocation, and batch/deposit evidence.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-22ea8499f3fb56816014"></a>

## Contribution Corrections Preserve Money And Identity Truth

<!-- BEGIN CONTRACT {"id":"22ea8499f3fb56816014","name":"Contribution Corrections Preserve Money And Identity Truth"} -->

Contribution operations MUST distinguish harmless internal metadata edits from
corrections that affect money, donor identity, designation, provider state,
refunds, official donor records, or donor-visible history.

Harmless internal metadata MAY update directly when it does not change money,
identity, designation, official donor records, provider state, or donor-visible
history.

Corrections MUST be recorded for donor relinking, amount correction,
fund/designation correction, missionary or project allocation correction,
refund correction, receipt or statement correction, payment state correction,
Stripe replay, and other provider-state corrections.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
