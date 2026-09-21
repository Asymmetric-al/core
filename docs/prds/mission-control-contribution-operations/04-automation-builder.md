# PRD 4: Mission Control Automation Builder

**Current requirements amended 2026-09-16 (AL-1861).** These bodies use the
ratified [owner contracts](../../features/mission-control/contribution-detail/README.md).
The [original PRD](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/mission-control-contribution-operations/04-automation-builder.md)
records the earlier requirements and delivery history (split PRs #401 and #404). Those
original delivery claims do not establish implementation of the amended target.

## Problem statement

The platform needs to reduce repeated manual work across Mission Control.
Contribution operations, CRM, Support Hub, Email Studio, CMS, missionary
workflows, tasks, notifications, and approvals will all create repeatable
operational patterns.

The product should let authorized admins create automations without turning the
platform into an unsafe scripting tool or a complicated workflow product.

## Solution

Use the shared Mission Control automation boundary with two presentation modes:

- **Simple mode** for plain-language, staff-friendly rules.
- **Advanced mode** for deeper conditions, branching, delays, retries,
  approvals, and review-first workflows.

The current Phase 12 automation capability gates authoring and activation;
`automation:manage` is the predecessor name, not a bypass of current access.
Activation requires exact preview/test evidence, supported actions and owner
qualification. Definitions never acquire data, recipient or money authority.

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
- Route exact source message requests through Phase 17 preparation and Phase 6
  dispatch; no direct provider send or mutable-template execution.
- Route contribution actions through Contribution Operations Core.
- Route review/failure work through shared Mission Control tasks.
- Use the established durable-execution/outbox contract. Workflow engines carry
  execution, while source owners retain business truth; add no duplicate engine.

## Out of scope

- External integration marketplace.
- Arbitrary user code.
- Replacing the repository durable-execution provider or bypassing its contract.
- Building every possible automation at once.
- Replacing shared task, notification, or contribution operation systems.

## Testing decisions

Test:

- current Phase 12 capability and source-scope checks for all definition actions;
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
- messages use Phase 17/6 exact protected contracts, including source-required
  notices, immutable preparation and recovery;
- contribution automations call contribution services.

## Definition of done

- Currently authorized administrators can create bounded supported definitions;
  no role label or definition grants source command authority.
- Activation requires preview and test run.
- Activity logs capture every run.
- Automations support auto-run and review-first.
- Review-first workflows show exact proposed changes and re-check latest data.
- Donor messages use Phase 17 preparation and Phase 6 delivery; unsupported
  meanings, retired CRM commands and cross-owner mutations are rejected.
- Contribution-related automations use contribution services and audit events.
- Focused tests pass.
