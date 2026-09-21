# PRD 3: Shared Mission Control Tasks and Needs Attention

**Current requirements amended 2026-09-16 (AL-1861).** These bodies use the
ratified [owner contracts](../../features/mission-control/contribution-detail/README.md).
The [original PRD](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/mission-control-contribution-operations/03-shared-tasks-needs-attention.md)
records the earlier requirements and delivery history (split PR #394). Those
original delivery claims do not establish implementation of the amended target.

## Problem statement

Contribution operations create follow-up work: failed donor notifications,
failed receipt sends, failed provider actions, correction
reviews, pending refunds, missing donor/designation, and batch runs with
issues. If each feature creates its own task model or queue, Mission Control
will become fragmented.

## Solution

Use the shared Mission Control task owner and a Contribution Hub Needs
Attention projection. The source correction, document, message or provider case
retains business state and resolution; task completion/dismissal cannot approve
a correction, prove a payment, erase a failure or complete another owner action.

Contribution, Support, CRM, Email Studio, CMS and automation adapters use the
same shared task contract with exact source references and current Phase 12
access. There is no retired Twenty task source and no internal CRM-copy queue.

## Goals

- Add one shared task model for Mission Control work.
- Add queue, assignee, status, urgency, due date, linked records, comments,
  reminders, dismissal/suppression, and audit events.
- Add Needs Attention as a contribution-facing view over shared tasks/issues,
  not a separate task model.
- Add system-suggested urgency with audited staff overrides.
- Create tasks from contribution failure/follow-up cases.
- Keep the model reusable for PRD 2 notification failures, PRD 4 automations,
  and PRD 5 batches.

## V1 task fields

- title
- description
- status
- urgency or priority
- queue
- assignee
- due date
- related donor
- related contribution
- related audit event
- related notification
- related batch
- related provider action
- notes/comments
- reminders
- created by
- created by system or human
- dismissed/suppressed state with reason where relevant

## Needs Attention issue types

- receipt issues
- statement issues
- donor notification issues
- Stripe/provider issues
- pending refunds
- correction reviews
- batch issues
- missing donor or designation
- staged gift review issues

## Urgency rules

Critical urgency includes:

- failed refund
- payment correction failure
- Stripe/provider failure
- donor-visible money state mismatch
- failed receipt or statement delivery
- failed donor correction notification
- donor-facing history that may be wrong

High urgency includes:

- batch completed with issues
- correction review waiting
- recurring gift issue
- missing designation
- an unresolved contribution-source item aging past its configured threshold

Contribution-source defaults (not a global timer for other domains):

- Normal to High after 24 hours
- High to Critical after 48 hours when donor trust or money state is involved

## Assignment rules

Contribution follow-up tasks default to actor plus Finance Operations queue.
Tenant settings may choose actor-only, queue-only, or both for notification
failure tasks.

## Testing decisions

Test behavior and queue visibility:

- task creation from donor notification, receipt, statement,
  provider, pending refund, correction review, batch, missing donor/designation,
  and staged gift issues;
- assignment policy for actor-only, queue-only, and both;
- completion, permitted dismissal/suppression with reason, comments and reminders;
- source-state truth unchanged by task/notification engagement;
- denial of retired CRM post/repost sources and same-database copy jobs;
- Needs Attention grouping by issue type and urgency;
- Critical/High urgency and aging thresholds;
- tenant-configurable thresholds;
- urgency override audit;
- linked records for donor, contribution, audit, notification, batch, and
  provider action.

## Acceptance criteria

- Reached contribution work uses the shared Mission Control task owner.
- Contribution failure/follow-up cases can create linked tasks.
- Needs Attention exists in Contribution Hub.
- Needs Attention supports issue type and urgency.
- Staff can act on tasks under current capability/source policy; source business
  outcomes and required attention cannot be dismissed away by a task preference.
- Task and urgency behavior is audited.
- Focused tests pass.
