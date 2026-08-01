# ADR-0028: Make the Eve admin workspace operations-first

**Status:** Accepted

**Date:** 2026-07-17

**Issue:** #427

**Builds on:** ADR-0019 through ADR-0025, and ADR-0027

## Context

Mission Control already exposes app-owned governance, audit, kill-switch,
model-policy, private-memory, approval/budget, and retention/replay APIs. The
existing `/admin/eve` page renders those controls, but it does not yet present
the complete operations workspace required by the Eve platform plan: failures,
GitHub connection state, notification connection state, eval health, and
subagent policy are not first-class, and the route itself relies on API errors
rather than an explicit workspace access gate.

The workspace must help an operator understand what Eve is doing before chat is
available. It must never fill an unfinished integration with plausible-looking
mock activity, and it must not expose hidden model reasoning or sensitive
operational records in the name of observability.

## Decision

The Eve page is an operations-first workspace. A compact panel index comes
first and links to active and recent runs, approvals, recent policy decisions,
budgets, failures, GitHub connection state, eval health, private memory, model
policy, subagent policy, notification connection state, audit, retention, and
emergency controls. The authenticated chat runtime remains a secondary,
explicitly unavailable connection until #428 mounts it.

Live panels continue to read the existing app-owned APIs from #418 through
#424. Failure summaries are derived only from persisted run and audit results.
Eval health and subagent status are derived only from the versioned model-policy
view. GitHub, notifications, and chat show an explicit unavailable state until
their owning slices land; they never display invented events, delivery health,
or runtime state.

The route is server-gated to the repository's authorized admin role policy
before its Client Component is rendered. Mutations remain gated again in the
API boundary. Model-policy changes keep the separate `ai.settings.manage`
permission. The UI renders redacted decision summaries and bounded governance
metadata only.

## Data-source ownership

- Governance state, recent runs, failures, emergency controls: #418/#420.
- Audit summaries: #419.
- Model policy, eval health, and subagent overrides: #421.
- Private memory controls and history: #422.
- Approvals, budgets, and recent policy decisions: #423.
- Replay retention and holds: #424.
- Verified current-admin identity and ownership: #426 / ADR-0027.
- Runtime mount and secondary chat surface: #428.
- GitHub activity: #430.
- Notification delivery: #436.

## Consequences

- Operators can enumerate every governance surface before interacting with
  Eve, without mock data masking unfinished capabilities.
- Role and permission checks exist at server route and mutation boundaries;
  client visibility is never the authority check.
- The workspace adds no provider, tool, runtime mount, deployment, or release
  transition. The master release switch remains disabled.

## Verification

- Component tests cover the complete operations index, role gate, explicit
  unavailable connection states, real failure summaries, eval health, and
  active subagent policy.
- Existing governance-page tests continue to cover fail-closed state,
  redacted audit summaries, and confirmed kill-switch mutations.
- Admin lint/typecheck, production build, full unit suite, and repository CI
  preflight remain required.
