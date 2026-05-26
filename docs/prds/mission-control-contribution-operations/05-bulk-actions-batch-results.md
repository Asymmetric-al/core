# PRD 5: Bulk Contribution Actions and Batch Results

## Suggested issue

- Title: Build bulk contribution actions and batch results
- Labels: `type:feature`, `status:ready`, `complexity:hard`,
  `ready-for-agent`

## Problem statement

Finance staff need to act on groups of contributions. One gift at a time is too
slow for receipt resends, statement generation, CRM repost retry, donor
notifications, task creation, refunds, designation corrections, review status
updates, and related operations.

Bulk actions must be powerful, but not reckless. Staff need preview,
confirmation, progress, per-record results, CSV export, audit links, and
follow-up tasks for important failures.

## Solution

Build bulk contribution actions and batch execution for the Contribution Hub.
Bulk actions use the same Contribution Operations Core action contract as
single actions.

## Core rules

- Confirmation is always required and cannot be skipped.
- Preview plus confirmation is the default flow.
- Preview may be skipped only for low-risk actions when settings allow it.
- Low-risk preview-skippable actions: receipt resend, statement generation,
  donor notification send, task creation, and CRM repost retry only when no
  contribution data changes.
- High-risk bulk actions always require preview plus confirmation.
- Small low-risk batches of 50 or fewer records may run immediately.
- More than 50 records run as a background batch.
- All high-risk batches run as background batches.

## Batch results

Batch statuses:

- running
- complete
- complete_with_issues
- failed
- cancelled

Summary counts:

- processed
- succeeded
- skipped
- failed
- follow-up tasks created

CSV export includes contribution ID, donor name, donor email where allowed,
amount, currency, action, status, skip reason, failure reason, audit event ID,
task ID, and timestamp.

## Important failures

Important failures create shared Mission Control tasks:

- money actions
- donor notifications
- receipt failures
- statement failures
- CRM posting failures
- Stripe/provider failures

Minor skips remain visible in the batch report without creating noisy tasks.

## Testing decisions

Test:

- each low-risk preview-skippable action;
- confirmation always required;
- preview cannot be skipped for high-risk actions;
- small low-risk immediate execution;
- large/high-risk background execution;
- preview affected/skipped/proposed-change content;
- progress and result states;
- per-record results;
- CSV fields;
- `complete_with_issues` for mixed results;
- important failure tasks;
- per-record audit links;
- shared contribution action contract usage.

## Definition of done

- Staff can run bulk contribution actions.
- Confirmation is always required.
- Preview can be skipped only for low-risk actions when allowed.
- Large and high-risk batches run in the background.
- Batch results include summary, per-record results, and CSV download.
- Important failures create linked tasks.
- Mixed results become complete with issues.
- Bulk actions use shared contribution action logic and audit events.
- Focused tests pass.
