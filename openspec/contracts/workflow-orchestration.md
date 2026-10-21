# workflow-orchestration normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-48b6728da00e40f1b03a"></a>

## Workflow Problems Escalate By Tenant Notification Policy

<!-- BEGIN CONTRACT {"id":"48b6728da00e40f1b03a","name":"Workflow Problems Escalate By Tenant Notification Policy"} -->

The platform MUST decide workflow-problem urgency through a tenant-adjustable
notification policy rather than alerting on everything or failing silently.
Defaults MUST escalate money-area failures and dead-lettered work to urgent
staff notification while keeping routine retryable failures visible as
operational status. Tenants MUST be able to adjust the policy within safe
bounds (for example, escalating on retry or muting specific non-critical
failures), and the effective policy MUST be tenant-scoped.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-738fca90e53867532089"></a>

## Workflow Orchestration Is Not The Source Of Truth

<!-- BEGIN CONTRACT {"id":"738fca90e53867532089","name":"Workflow Orchestration Is Not The Source Of Truth"} -->

Inngest MUST act only as the durable workflow executor. Product records,
provider records (Stripe events, Resend events), audit logs, and tenant
authorization MUST remain authoritative for donations, email, CRM state,
documents, payment status, permissions, tenant data, and audit history.

Stripe MUST remain the payment authority: workflow functions MUST NOT invent
payment success and MUST NOT become the recurring billing engine. Provider
webhook boundaries (signature verification, raw request handling, tenant
resolution, durable event storage) MUST stay in the product webhook routes.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
