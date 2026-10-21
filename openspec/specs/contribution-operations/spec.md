# Contribution Operations

## Purpose

Define the durable contract for staff contribution operations in Mission
Control: one shared Contribution Operations Core owns staff gift actions,
corrections, audit, high-risk permission and reason policy, provider
outcomes, and donor-visible truth across the Contribution Hub and donor CRM
entry points.

## Requirements

### Requirement: Contribution Operations Core Owns Staff Gift Actions

Mission Control contribution actions MUST pass through a shared Contribution Operations Core whenever staff read or mutate contribution operations state from the Contribution Hub, donor CRM record, automation, or future batch flows.

Every clause in `openspec/contracts/contribution-operations.md#contract-72571c0077f0d8d5eb90` MUST apply without exception.

#### Scenario: Staff acts on a gift from the Contribution Hub

- GIVEN a staff user opens a gift from the Contribution Hub
- WHEN the user performs a contribution operation
- THEN the operation goes through the shared Contribution Operations Core
- AND the result returns canonical contribution truth
- AND the same operation would produce the same durable outcome from the donor
  CRM record

#### Scenario: Staff acts on a gift from a donor CRM record

- GIVEN a staff user opens gift history from a donor CRM record
- WHEN the user performs a contribution operation from that donor-first context
- THEN the operation goes through the same Contribution Operations Core used by
  the Contribution Hub
- AND the source surface is recorded as donor CRM context in the audit trail

### Requirement: Contribution Corrections Preserve Money And Identity Truth

Contribution operations MUST distinguish harmless internal metadata edits from corrections that affect money, donor identity, designation, provider state, refunds, official donor records, or donor-visible history.

Every clause in `openspec/contracts/contribution-operations.md#contract-22ea8499f3fb56816014` MUST apply without exception.

#### Scenario: Staff changes harmless metadata

- GIVEN a staff user edits safe internal notes or tags for a contribution
- WHEN the edit does not affect money, identity, designation, official donor
  records, provider state, or donor-visible history
- THEN the platform may update the contribution metadata directly
- AND the change is still auditable as a meaningful staff action when required

#### Scenario: Staff changes donor identity on a gift

- GIVEN a staff user relinks a gift to a different donor
- WHEN the operation is confirmed
- THEN the platform records a correction
- AND the original gift remains explainable through before/after summary
- AND donor-visible history updates from the same corrected truth

#### Scenario: Staff changes a gift amount or designation

- GIVEN a staff user corrects amount, fund, designation, missionary, or project
  allocation
- WHEN the correction is confirmed
- THEN the platform records a correction rather than silently overwriting money
  or allocation truth
- AND related donor-visible and staff-visible read models derive from the same
  corrected contribution truth

### Requirement: High-Risk Contribution Actions Require A Granular Capability And Reason

High-risk contribution actions MUST resolve the granular server-side capability for the action, a reason, and a clear confirmation prompt enforced server-side.

Every clause in `openspec/contracts/contribution-operations.md#contract-1fc0537639c6eb62a033` MUST apply without exception.

#### Scenario: Staff without the refund capability attempts a refund

- GIVEN a staff user whose resolved capabilities do not include
  `contributions.run_refunds`
- WHEN the user attempts to refund a contribution
- THEN the server rejects the action
- AND UI hiding is not treated as sufficient protection

#### Scenario: Staff attempts a high-risk action without reason

- GIVEN a staff user who holds the required capability for the action
- WHEN the user attempts a high-risk contribution action without a reason and
  confirmation
- THEN the server rejects the action
- AND no money, identity, designation, provider, or donor-visible state changes
  are applied

### Requirement: Contribution Operation Audit Is Canonical And Cross-Surface

Every meaningful contribution action MUST write an operation audit event that records actor, tenant, contribution, source surface, action type, timestamp, reason when required, safe before/after summary, related provider identifiers, related tasks, related batches, and downstream effects.

Every clause in `openspec/contracts/contribution-operations.md#contract-dfc1259c58538c205338` MUST apply without exception.

#### Scenario: Staff resends a receipt from CRM

- GIVEN staff resends a receipt from donor CRM gift history
- WHEN the receipt action completes or fails
- THEN the operation audit trail records the source as donor CRM context
- AND the audit event links to the contribution and staged gift where available

#### Scenario: Native source recovery runs from Contribution Hub

- GIVEN authorized staff invokes the owning domain's native recovery action from the Contribution Hub
- WHEN the action completes or fails
- THEN the operation audit trail records the source as Contribution Hub
- AND the contribution detail reflects the source-owned result without inventing a separate CRM post state
- AND no retired Twenty posting, repost or synchronization action is queued

### Requirement: Stripe Remains Payment Authority For Refund And Provider State

Stripe MUST remain the payment execution and payment-method authority for Stripe-backed contributions.

Every clause in `openspec/contracts/contribution-operations.md#contract-8e1c185df0fbdfc400b4` MUST apply without exception.

#### Scenario: A provider-confirmed refund is recorded

- GIVEN Stripe confirms a partial refund for a contribution
- WHEN the refund outcome reaches the platform
- THEN the platform records the provider outcome and pending/final state
  truthfully
- AND donor-visible history does not overstate finality before the operational
  record supports it

#### Scenario: Stripe returns an error

- GIVEN Stripe rejects a refund or provider action
- WHEN the staff action returns
- THEN the platform records the failed provider outcome
- AND the staff-facing response includes clear next steps without exposing
  secrets

### Requirement: Donor-Visible Contribution State Uses The Same Truth

Donor-visible contribution state MUST derive from the same persisted
contribution and correction truth used by Mission Control, including donor
portal giving history, receipts, statements, and related donor-visible states.

The platform MUST NOT maintain hidden internal corrections that require manual
later sync to donor-facing money history.

#### Scenario: A donor-visible contribution correction is applied

- GIVEN staff applies a correction that changes donor-visible contribution
  history
- WHEN the action succeeds
- THEN donor-facing history reflects the corrected truth promptly
- AND the donor portal does not depend on a delayed side-sync model

### Requirement: Donor Correction Communications Use Governed Content and Shared Dispatch

The contribution operation MUST own the correction-notification purpose and source facts.

Every clause in `openspec/contracts/contribution-operations.md#contract-1b202627a552c9d7996d` MUST apply without exception.

#### Scenario: A refund notification is sent

- GIVEN a contribution refund action has a donor-facing notification outcome
- WHEN the notification is sent
- THEN Phase 17 prepares the email from the resolved Email Studio refund
  template family and immutable version
- AND Phase 6 dispatches it through the shared send seam
- AND the communication event records the exact template version, recipient,
  provider outcome, and contribution-operation audit link

#### Scenario: A correction template is invalid before preparation

- GIVEN a contribution action succeeds but its required donor correction
  template is missing, inactive, or missing required merge tags when Phase 17
  resolves or prepares the notification
- WHEN preparation fails closed
- THEN no fallback donor email is sent
- AND the contribution action remains successful
- AND the blocked notification decision is audited
- AND a follow-up task is requested for the configured actor or queue

#### Scenario: A prepared correction notification survives later deactivation

- GIVEN a donor correction notification has already crossed the durable
  prepared-message boundary under an active publication
- AND that publication is later deactivated
- WHEN Phase 6 dispatch runs for the frozen prepared payload
- THEN dispatch does not re-check template activity
- AND it re-proves only the current safety fences that apply to the frozen
  payload
- AND byte-identical recovery remains available while those fences pass

### Requirement: Bulk Contribution Actions Use The Single-Action Contract

Bulk contribution actions MUST execute per-record work through the same Contribution Operations Core action contract used by single contribution actions.

Every clause in `openspec/contracts/contribution-operations.md#contract-6b0d436abf3672a99ee5` MUST apply without exception.

#### Scenario: Staff runs bulk receipt resend

- GIVEN staff selects multiple contribution records
- WHEN they run a bulk receipt resend
- THEN each record is planned through the bulk preview model
- AND each executed item calls the shared Contribution Operations Core action
  contract
- AND the batch result records success, skipped, failed, audit, and task
  outcomes

#### Scenario: A high-risk bulk action runs

- GIVEN staff selects multiple contribution records for a high-risk action
- WHEN they confirm the bulk action
- THEN preview and confirmation are both required
- AND the batch runs as a background batch
- AND every per-record action still enforces the single-action high-risk policy,
  including its granular capability gate

### Requirement: Contribution Operations Protect Donor Trust Through Corrections

Contribution operations MUST prioritize donor trust, operational truth, and
money integrity over staff convenience. When staff corrections alter money,
identity, designation, provider state, refunds, receipts, statements, or
donor-visible contribution history, the platform MUST preserve an explainable
correction trail rather than silently overwriting truth.

#### Scenario: A fast edit would hide money-state history

- GIVEN a direct database update would quickly change a contribution amount,
  refund state, payment state, or designation
- WHEN the change would affect money truth or donor-visible history
- THEN the platform records a contribution correction and audit event
- AND it does not silently overwrite the original operational explanation

### Requirement: Contribution Operations Prefer Shared System Behavior

Repeated contribution operations MUST be implemented as shared system behavior
inside the Contribution Operations Core rather than as disconnected UI or
route-specific workflows.

#### Scenario: Two surfaces need the same contribution action

- GIVEN both the Contribution Hub and donor CRM record need to perform the same
  contribution action
- WHEN the action is implemented
- THEN the action is implemented once behind a shared server-side interface
- AND each surface calls that interface rather than re-implementing local
  business rules

### Requirement: Contribution Operation Completion Requires Trustworthy Feedback

A contribution operation MUST NOT be treated as product-complete if staff
cannot tell what happened, whether a provider action succeeded, whether a donor
visible state changed, or where to find the audit trail.

#### Scenario: Provider outcome is uncertain

- GIVEN Stripe or another provider returns a pending, failed, partial, or
  ambiguous outcome
- WHEN staff reviews the operation result
- THEN the platform shows an honest state and next action
- AND it does not hide uncertainty behind reassuring language

### Requirement: Donor Correction Notifications Are Clear And Accountable

Donor-facing contribution correction notifications MUST be factual, templated,
merge-tag validated, and auditable. Staff MAY add a bounded personal note, but
the note MUST NOT replace the official template explanation or required facts.

Notification suppression for money or official document changes MUST require a
reason and MUST be recorded as an audit decision.

#### Scenario: Staff suppresses an official-document correction email

- GIVEN a receipt or statement correction normally notifies a donor
- WHEN staff suppresses the donor email
- THEN the suppression requires a reason
- AND the audit trail records the policy, suppression reason, actor, template
  family, and source contribution operation

### Requirement: Mission Control Contribution Operations Has Gift-First And Donor-First Entry Points

Mission Control MUST support contribution operations from both a gift-first
Contribution Hub entry point and a donor-first CRM record entry point.

The Contribution Hub is the primary gift-first search and operations surface.
The donor CRM record is the primary donor-first contribution context. The two
surfaces MAY use different layouts, but they MUST show the same canonical gift
truth and use the same server-side contribution action layer.

#### Scenario: Staff investigates by gift context

- GIVEN a finance staff user searches by gift date, donor, provider id,
  payment method, derived receipt/document/delivery outcome, refund state,
  fund, missionary, or related contribution field
- WHEN the user opens a contribution from the Contribution Hub
- THEN Mission Control shows a complete contribution detail
- AND actions from that detail use the shared Contribution Operations Core

#### Scenario: Staff investigates by donor context

- GIVEN a staff user is already viewing a donor CRM record
- WHEN the user opens that donor's gift history
- THEN staff can perform contribution operations without leaving the donor
  context
- AND those actions use the same Contribution Operations Core as the
  Contribution Hub

### Requirement: Contribution Detail Shows Operational And Donor-Visible Consequences

Mission Control contribution detail MUST show staff the operational context of a gift and the donor-visible consequence of meaningful corrections before the user confirms a high-risk action.

Every clause in `openspec/contracts/contribution-operations.md#contract-dc69633a19a3874b09b1` MUST apply without exception.

#### Scenario: Staff confirms a donor-visible correction

- GIVEN a staff user is about to confirm a correction that affects donor-facing
  history or official records
- WHEN the confirmation prompt is shown
- THEN the prompt summarizes the exact consequence in donor-visible terms
- AND the user can see which entry point initiated the action

### Requirement: Staff Contribution Search Supports Gift Operations

The Contribution Hub MUST support gift-first contribution search and filtering for operational investigation.

Every clause in `openspec/contracts/contribution-operations.md#contract-63aeaec7af83662208d1` MUST apply without exception.

#### Scenario: Staff has incomplete donor information

- GIVEN a donor contacts support with only phone, address, last four, or a
  Stripe identifier
- WHEN staff searches in the Contribution Hub
- THEN the product gives staff a gift-first path using safe contact and payment
  summary inputs without needing to leave Mission Control
- AND Stripe identifier lookup is available only when the staff user has
  `contributions.use_provider_actions`
