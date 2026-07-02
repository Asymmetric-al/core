# Delta for Contribution Operations

## ADDED Requirements

### Requirement: Contribution Operations Core Owns Staff Gift Actions

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

### Requirement: High-Risk Contribution Actions Require Finance Permission And Reason

High-risk contribution actions MUST require `finance:manage_contributions`,
a reason, and a clear confirmation prompt enforced server-side.

The non-suppressible high-risk actions include refunds, donor relinking,
designation or fund correction, payment state correction, and Stripe replay.

Organization or user prompt settings MUST NOT suppress the reason prompt for
these actions.

#### Scenario: Staff without finance permission attempts a refund

- GIVEN a staff user does not have `finance:manage_contributions`
- WHEN the user attempts to refund a contribution
- THEN the server rejects the action
- AND UI hiding is not treated as sufficient protection

#### Scenario: Staff attempts a high-risk action without reason

- GIVEN a staff user has finance permission
- WHEN the user attempts a high-risk contribution action without a reason and
  confirmation
- THEN the server rejects the action
- AND no money, identity, designation, provider, or donor-visible state changes
  are applied

### Requirement: Contribution Operation Audit Is Canonical And Cross-Surface

Every meaningful contribution action MUST write an operation audit event that
records actor, tenant, contribution, source surface, action type, timestamp,
reason when required, safe before/after summary, related provider identifiers,
related tasks, related batches, and downstream effects.

Provider identifiers MAY be persisted in server-side audit metadata, but
staff-facing audit reads, action results, exports, and summaries MUST omit or
redact them unless the viewer has `contributions.use_provider_actions`.

The audit trail MUST make clear whether an action came from the Contribution
Hub, donor CRM record, automation, or future batch execution.

#### Scenario: Staff resends a receipt from CRM

- GIVEN staff resends a receipt from donor CRM gift history
- WHEN the receipt action completes or fails
- THEN the operation audit trail records the source as donor CRM context
- AND the audit event links to the contribution and staged gift where available

#### Scenario: CRM repost retry runs from Contribution Hub

- GIVEN staff retries CRM posting from the Contribution Hub
- WHEN the retry is queued or fails
- THEN the operation audit trail records the source as Contribution Hub
- AND the contribution detail reflects the resulting CRM post state

### Requirement: Stripe Remains Payment Authority For Refund And Provider State

Stripe MUST remain the payment execution and payment-method authority for
Stripe-backed contributions. The platform MAY request refunds and replay
provider events server-side, but it MUST record Stripe outcomes honestly and
MUST NOT imply final refund or payment-state completion before provider
outcomes or webhook-confirmed operational truth supports it.

Trust-sensitive Stripe identifiers and credentials MUST remain behind
server-side boundaries.

#### Scenario: Staff requests a partial refund

- GIVEN a finance staff user requests a partial refund
- WHEN Stripe accepts the request
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

### Requirement: Donor Correction Emails Use Email Studio

Donor-facing emails for contribution corrections MUST use Email Studio
templates, the provider-neutral template/version model, required merge-tag
validation, tenant notification settings, and the approved Resend delivery
path.

Contribution operations, automations, and future bulk actions MUST NOT send
donor-facing contribution correction emails directly through Resend or a
feature-local email builder.

If a required correction template is missing, inactive, or invalid at send
time, the contribution action MUST remain complete, the donor email MUST be
blocked, the notification decision MUST be audited, and follow-up task intent
MUST be created through the shared task contract.

#### Scenario: A refund notification is sent

- GIVEN a contribution refund action has a donor-facing notification outcome
- WHEN the notification is sent
- THEN the email is rendered from the active Email Studio refund template
  family and variant
- AND the send records the template version, recipient, provider outcome, and
  contribution operation audit link

#### Scenario: A correction template is invalid at send time

- GIVEN a contribution action succeeds but its required donor correction
  template is missing, inactive, or missing required merge tags
- WHEN notification dispatch runs
- THEN no fallback donor email is sent
- AND the contribution action remains successful
- AND the blocked notification decision is audited
- AND a follow-up task is requested for the configured actor or queue

### Requirement: Bulk Contribution Actions Use The Single-Action Contract

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

#### Scenario: Staff runs bulk receipt resend

- GIVEN staff selects multiple contribution records
- WHEN they run a bulk receipt resend
- THEN each record is planned through the bulk preview model
- AND each executed item calls the shared Contribution Operations Core action
  contract
- AND the batch result records success, skipped, failed, audit, and task
  outcomes

#### Scenario: Staff runs a high-risk bulk refund

- GIVEN staff selects multiple contribution records for refund
- WHEN they confirm the bulk refund
- THEN preview and confirmation are both required
- AND the batch runs as a background batch
- AND every per-record refund still enforces the high-risk contribution action
  policy

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
  payment method, receipt state, refund state, fund, missionary, or related
  contribution field
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

Mission Control contribution detail MUST show staff the operational context of
a gift and the donor-visible consequence of meaningful corrections before the
user confirms a high-risk action.

The detail SHOULD include donor, gift, designation, payment, receipt, refund,
recurring, staged gift, CRM, audit, task, batch, provider, and donor-visible
state when available.

#### Scenario: Staff confirms a donor-visible correction

- GIVEN a staff user is about to confirm a correction that affects donor-facing
  history or official records
- WHEN the confirmation prompt is shown
- THEN the prompt summarizes the exact consequence in donor-visible terms
- AND the user can see which entry point initiated the action

### Requirement: Staff Contribution Search Supports Gift Operations

The Contribution Hub MUST support gift-first contribution search and filtering
for operational investigation. Search and filters SHOULD include donor name,
donor address/location, phone, gift date range, payment method, payment type,
safe last-four, status, receipt state, refund state, designation, fund,
missionary, project, batch, and other contribution fields when available.

Provider identifier search and filtering, including Stripe PaymentIntent,
charge, refund, webhook, and replay identifiers, MUST require
`contributions.use_provider_actions`. Staff without that permission MUST stay on
safe payment summaries, including safe last-four, brand, bank, status, and
contact-based search inputs.

#### Scenario: Staff has incomplete donor information

- GIVEN a donor contacts support with only phone, address, last four, or a
  Stripe identifier
- WHEN staff searches in the Contribution Hub
- THEN the product gives staff a gift-first path using safe contact and payment
  summary inputs without needing to leave Mission Control
- AND Stripe identifier lookup is available only when the staff user has
  `contributions.use_provider_actions`
