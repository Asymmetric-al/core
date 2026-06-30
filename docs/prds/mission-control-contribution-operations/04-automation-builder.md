# PRD 4: Mission Control Automation Builder

## Delivered split status

Delivered through split PRs #401 and #404. Do not create a new `status:ready`
implementation issue from this historical PRD unless a follow-up gap is
identified against the shipped code.

## Problem statement

The platform needs to reduce repeated manual work across Mission Control.
Contribution operations, CRM, Support Hub, Email Studio, CMS, missionary
workflows, tasks, notifications, and approvals will all create repeatable
operational patterns.

The product should let authorized admins create automations without turning the
platform into an unsafe scripting tool or a complicated workflow product.

## Solution

Build a Mission Control-wide automation builder with two modes:

- **Simple mode** for plain-language, staff-friendly rules.
- **Advanced mode** for deeper conditions, branching, delays, retries,
  approvals, and review-first workflows.

Only users with `automation:manage` can create or edit automations. Activation
requires preview, test run, and activity log setup.

Each automation chooses its run mode:

- run automatically;
- create a review task first.

Review-first automations choose reviewers by queue, specific admin, or both.
Before approved execution, the system re-checks latest data. If data changed,
reviewers can run unchanged records only, regenerate the review, or cancel the
run.

## Goals

- Define a declarative automation model.
- Reject arbitrary code execution.
- Add simple and advanced builder modes.
- Add preview and test-run requirements before activation.
- Add automatic and review-first run modes.
- Add activity logs for every run.
- Route donor emails through Email Studio notification policy.
- Route contribution actions through Contribution Operations Core.
- Route review/failure work through shared Mission Control tasks.
- Keep execution provider-agnostic; do not assume Inngest exists.

## Out of scope

- External integration marketplace.
- Arbitrary user code.
- Adding Inngest or a durable workflow provider.
- Building every possible automation at once.
- Replacing shared task, notification, or contribution operation systems.

## Testing decisions

Test:

- `automation:manage` permission for create/edit/activate/deactivate/delete;
- simple and advanced definition validation;
- arbitrary code/unsupported action rejection;
- preview generation;
- dry run with no mutations;
- activation blocked without preview/test run;
- automatic and review-first modes;
- review assignment to queue/person/both;
- exact proposed change payloads;
- stale approval re-check;
- run unchanged/regenerate/cancel options;
- activity logs for success/skip/failure/partial completion;
- donor emails go through Email Studio only;
- contribution automations call contribution services.

## Definition of done

- Admins with `automation:manage` can create simple and advanced automation
  definitions.
- Activation requires preview and test run.
- Activity logs capture every run.
- Automations support auto-run and review-first.
- Review-first workflows show exact proposed changes and re-check latest data.
- Donor emails use Email Studio only.
- Contribution-related automations use contribution services and audit events.
- Focused tests pass.
