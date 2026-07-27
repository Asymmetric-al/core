# Proposal: Implement the Eve admin workspace operations shell

## Status

Implemented for GitHub issue #427. This change promotes the earlier partner
draft into the real Mission Control shell and is ready to archive into the
canonical `eve-admin-workspace-shell` capability.

## Why

The governance slices from #418 through #424 are now implemented, but an
operator needs one operations-first surface that makes their state legible
before chat is mounted. A shell that omits failures and readiness, or fills
future integrations with mock data, would make Eve look healthier and more
capable than the app-owned control plane proves.

## What changes

- Gate `/admin/eve` on the server with the repository's authorized admin role
  policy and keep mutation authorization in the existing API boundaries.
- Put a complete operations panel index first: runs, approvals, recent actions,
  budgets, failures, GitHub activity, eval health, memory, model policy,
  subagents, notifications, audit, retention, and emergency controls.
- Derive failure summaries from persisted governance runs and audit events.
- Derive eval health and subagent policy from the real versioned model-policy
  view.
- Mark GitHub, notification, and chat connections explicitly unavailable until
  #430, #432, and #428 land. Never fabricate activity or health.
- Continue rendering redacted decision summaries rather than raw prompts,
  hidden reasoning, secrets, donor/payment data, or raw records.
- Record ADR-0028 and link the implementation plan.

## Boundaries

This change does not redefine governance, audit, kill-switch, model-policy,
memory, approval/budget, or retention semantics. It adds no live model,
provider, operational tool, Eve HTTP mount, deployment, or release transition.
The master release switch remains off.

## Verification

- Admin lint and typecheck.
- Focused Vitest component coverage for role access, the complete panel index,
  unavailable connection states, failures, eval health, and subagent policy.
- Strict OpenSpec validation.
- Full repository CI preflight before the PR is opened.
