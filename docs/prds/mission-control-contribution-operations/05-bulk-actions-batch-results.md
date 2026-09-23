# PRD 5: Bulk Contribution Actions and Batch Results

**Current requirements amended 2026-09-16 (AL-1861).** These bodies use the
ratified [owner contracts](../../features/mission-control/contribution-detail/README.md).
The [original PRD](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/mission-control-contribution-operations/05-bulk-actions-batch-results.md)
records the earlier requirements and delivery history (split PR #398). Those
original delivery claims do not establish implementation of the amended target.

## Problem statement

Finance staff need to act on groups of contributions. One gift at a time is too
slow for permitted receipt-copy delivery, statement-run requests, donor
notifications, task creation, refunds, designation corrections, review status
updates, and related operations.

Bulk actions must be powerful, but not reckless. Staff need preview,
confirmation, progress, per-record results, CSV export, audit links, and
follow-up tasks for important failures.

## Solution

Build bulk contribution actions and batch execution for the Contribution Hub.
Bulk actions use the same source commands as single actions. Phase 13 owns
ledger effects, Phase 7/18 document admission and artifacts, Phase 19 statement
runs and Phase 17/6 messaging. The batch wrapper grants no additional permission
or combined success state; no Twenty post/repost action is available.

## Core rules

- Confirmation is always required and cannot be skipped.
- Preview plus confirmation is the default flow.
- Wrapper preview may be skipped only for an exact source-qualified low-risk
  action when owner policy allows it. This never skips the source action review,
  current authorization, recipient/artifact proof, Phase 19 preflight/release,
  protected message preparation or required money approval.
- Receipt/document generation and donor sends are not a blanket low-risk
  whitelist. Their exact source contract determines whether they are admitted.
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

CSV export uses the current purpose-qualified Phase 3/12 projection for the
exact selected source records. Include permitted contribution id, donor display,
source-owned amount/currency, action/outcome, safe skip/failure reason and audit/
task/time references. Donor email requires its actual field/purpose/export
authority; receipt-send permission alone is insufficient. Hidden fields remain
absent/redacted and unlike currencies are never summed by the batch wrapper.

## Important failures

Important failures create shared Mission Control tasks:

- money actions
- donor notifications
- receipt failures
- statement failures
- Stripe/provider failures

Minor skips remain visible in the batch report without creating noisy tasks.

## Testing decisions

Test:

- each exact source-qualified preview-skippable action and non-skippable owner gate;
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
- shared contribution/source command use, optional/off-by-default second approval
  with requester exclusion when enabled, exact artifact access, source message
  preparation and no retired CRM commands.

## Definition of done

- Staff can run bulk contribution actions.
- Confirmation is always required.
- Any wrapper-preview omission preserves every mandatory source gate.
- Large and high-risk batches run in the background.
- Batch results include summary, per-record results, and CSV download.
- Important failures create linked tasks.
- Mixed results become complete with issues.
- Bulk actions use shared contribution action logic and audit events.
- Focused tests pass.
