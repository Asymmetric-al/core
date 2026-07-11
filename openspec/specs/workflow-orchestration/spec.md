# Workflow Orchestration

## Purpose

Define the durable contract for background work: workflow orchestration
(currently Inngest) executes durable work without ever becoming the source
of truth. Product records, provider records, tenant authorization, and the
product-owned dispatch ledger stay authoritative, and tenants remain product
boundaries inside shared workflow infrastructure.

## Requirements

### Requirement: Workflow Orchestration Is Not The Source Of Truth

Inngest MUST act only as the durable workflow executor. Product records,
provider records (Stripe events, Resend events), audit logs, and tenant
authorization MUST remain authoritative for donations, email, CRM state,
documents, payment status, permissions, tenant data, and audit history.

Stripe MUST remain the payment authority: workflow functions MUST NOT invent
payment success and MUST NOT become the recurring billing engine. Provider
webhook boundaries (signature verification, raw request handling, tenant
resolution, durable event storage) MUST stay in the product webhook routes.

#### Scenario: A workflow retry disagrees with product state

- GIVEN a workflow function retries after a partial failure
- WHEN it loads the current product record inside a durable step
- THEN the product record and its idempotency keys decide whether the business
  effect may run
- AND the workflow result is recorded back into product-owned records rather
  than becoming a separate source of truth

#### Scenario: Provider webhook arrives while workflow dispatch is down

- GIVEN a verified Stripe or Resend webhook event is stored durably by the
  product webhook boundary
- WHEN immediate workflow dispatch fails
- THEN the provider still receives acceptance for the stored event
- AND the product dispatch ledger recovers the handoff internally without
  forcing provider replay

### Requirement: Tenants Are Product Boundaries In Shared Workflow Infrastructure

Tenants MUST be represented by tenant identifiers and product authorization
inside workflow event envelopes, concurrency keys, work claims, audit entries,
and Mission Control summaries. The platform MUST operate shared Inngest
infrastructure: tenants MUST NOT become separate Inngest apps, environments,
or billing accounts.

#### Scenario: Two tenants dispatch the same workflow kind

- GIVEN two tenants have due workflow work of the same kind
- WHEN the workflows execute on shared infrastructure
- THEN per-tenant flow-control keys and tenant-scoped queries keep each run
  inside its own tenant boundary
- AND no run can read or affect another tenant's records

### Requirement: Workflow Events Are Identifier-Only Envelopes

Workflow events MUST use a standard schema-versioned envelope carrying tenant
ID, workflow name, durable product record reference, dispatch request ID, and
safe routing/audit context only. The envelope builder/validator MUST reject
secrets, full records, payment internals, Stripe client secrets, bank details,
email bodies, rendered HTML, attachment bytes, signed URLs, rendered
documents, and broad CRM payloads.

#### Scenario: A caller tries to enqueue a sensitive payload

- GIVEN a product flow builds a workflow event
- WHEN the event data includes a prohibited field class such as an email body
  or a Stripe client secret
- THEN the envelope validator rejects the event before dispatch
- AND the rejection is observable in tests and error reporting

### Requirement: Durable Work Uses Product Claims And A Shared Dispatch Ledger

Every request to hand work to workflow orchestration MUST be recorded in the
shared product-owned workflow dispatch ledger. Each retryable business effect
MUST be guarded by a product work claim so manual replay, recovery scans, and
workflow retries cannot run the same effect concurrently. A dispatch recovery
scan MUST find stored-but-unhandled dispatch requests; it repairs handoffs and
MUST NOT define business outcomes.

#### Scenario: Immediate handoff fails after the ledger records intent

- GIVEN a dispatch request is stored in the workflow dispatch ledger
- WHEN the immediate Inngest send fails
- THEN the dispatch recovery scan later finds the request and completes the
  handoff
- AND duplicate handoffs are prevented by the ledger status and event
  deduplication, while the business effect stays guarded by the product work
  claim

### Requirement: Workflow Runtime Stays Rollback-Safe

Workflow runtime configuration MUST use named environment variables only
(`INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `INNGEST_SIGNING_KEY_FALLBACK`,
`INNGEST_DEV`, `INNGEST_BASE_URL`) with no secret values committed. Schema
changes MUST be additive so disabling workflow dispatch leaves all product
records valid and existing manual recovery paths working.

#### Scenario: Workflow dispatch is disabled after adoption

- GIVEN workflows have been processing dispatch requests
- WHEN the serve endpoint is removed or dispatch keys are unset
- THEN product tables, dispatch ledger records, and manual recovery routes
  remain valid and usable
- AND re-enabling dispatch resumes recovery from the ledger without data loss

### Requirement: Workflow Problems Escalate By Tenant Notification Policy

The platform MUST decide workflow-problem urgency through a tenant-adjustable
notification policy rather than alerting on everything or failing silently.
Defaults MUST escalate money-area failures and dead-lettered work to urgent
staff notification while keeping routine retryable failures visible as
operational status. Tenants MUST be able to adjust the policy within safe
bounds (for example, escalating on retry or muting specific non-critical
failures), and the effective policy MUST be tenant-scoped.

#### Scenario: A money-path workflow dead-letters

- WHEN a donation or other money-area workflow item exhausts retries and
  dead-letters
- THEN the notification policy escalates it to urgent staff notification
- AND a routine retryable failure elsewhere stays visible as operational status
  without paging

#### Scenario: A tenant adjusts notification urgency

- GIVEN a tenant configures its workflow notification policy
- WHEN a workflow problem matches an adjusted rule
- THEN the platform applies the tenant's setting within safe bounds
- AND the policy remains scoped to that tenant
