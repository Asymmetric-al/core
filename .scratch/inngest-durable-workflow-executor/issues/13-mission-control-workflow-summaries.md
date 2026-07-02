# 13: Mission Control workflow summaries and notification policy

Status: ready-for-agent
Type: AFK

## Parent

.scratch/inngest-durable-workflow-executor/PRD.md

## GitHub issue

#298

## What to build

Add Mission Control workflow run summaries and notification policy so staff can
see useful workflow status and retry outcomes without exposing raw Inngest step
logs or provider internals.

## Acceptance criteria

- [ ] Mission Control shows product-owned workflow run summaries for dispatch,
      processing, retrying, completed, failed, and dead-letter states.
- [ ] Run summaries exclude secrets, raw workflow step logs, provider internals,
      signed URLs, stack traces, and cross-tenant details.
- [ ] Summary records link back to the product-owned record and dispatch
      request.
- [ ] Notification policy distinguishes urgent failures from routine retryable
      failures.
- [ ] Default notification policy prioritizes donor trust, money integrity,
      tenant-wide sync health, and stuck infrastructure.
- [ ] Tenant/admin settings can adjust notification behavior without making the
      default noisy.
- [ ] UI uses existing Mission Control patterns, shared UI primitives, and
      design tokens.
- [ ] Tests cover summary projection, sensitive data exclusion, notification
      policy defaults, tenant scoping, and UI accessibility basics.

## Blocked by

- .scratch/inngest-durable-workflow-executor/issues/04-work-claims-and-recovery-scan.md
- .scratch/inngest-durable-workflow-executor/issues/05-one-time-donation-saga-recovery.md
- .scratch/inngest-durable-workflow-executor/issues/08-resend-inbound-handoff-and-placeholder.md
