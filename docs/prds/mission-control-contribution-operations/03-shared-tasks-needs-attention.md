# PRD 3: Shared Mission Control Tasks and Needs Attention

## Delivered split status

Delivered through split PR #394. Do not create a new `status:ready`
implementation issue from this historical PRD unless a follow-up gap is
identified against the shipped code.

## Problem statement

Contribution operations create follow-up work: failed donor notifications,
failed receipt sends, failed CRM posting, failed provider actions, correction
reviews, pending refunds, missing donor/designation, and batch runs with
issues. If each feature creates its own task model or queue, Mission Control
will become fragmented.

## Solution

Build one shared Mission Control task system and a Contribution Hub Needs
Attention view. The task system is a lightweight workflow foundation, not a
heavy enterprise workflow engine.

Contribution operations use it first. Later Support Hub, CRM, Email Studio,
CMS, missionary workflows, automations, and batch processing should reuse it.

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
- CRM post issues
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

- CRM post failure
- batch completed with issues
- correction review waiting
- recurring gift issue
- missing designation
- any Normal item aging past the tenant threshold

Recommended defaults:

- Normal to High after 24 hours
- High to Critical after 48 hours when donor trust or money state is involved

## Assignment rules

Contribution follow-up tasks default to actor plus Finance Operations queue.
Tenant settings may choose actor-only, queue-only, or both for notification
failure tasks.

## Testing decisions

Test behavior and queue visibility:

- task creation from donor notification, receipt, statement, CRM post,
  provider, pending refund, correction review, batch, missing donor/designation,
  and staged gift issues;
- assignment policy for actor-only, queue-only, and both;
- completion, dismissal, suppression with reason, comments, and reminders;
- Needs Attention grouping by issue type and urgency;
- Critical/High urgency and aging thresholds;
- tenant-configurable thresholds;
- urgency override audit;
- linked records for donor, contribution, audit, notification, batch, and
  provider action.

## Delivered acceptance criteria

- A shared Mission Control task model exists.
- Contribution failure/follow-up cases can create linked tasks.
- Needs Attention exists in Contribution Hub.
- Needs Attention supports issue type and urgency.
- Staff can complete, dismiss, and suppress tasks where appropriate.
- Task and urgency behavior is audited.
- Focused tests pass.
