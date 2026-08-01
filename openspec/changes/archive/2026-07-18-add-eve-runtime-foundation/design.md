# Design / ADR — Eve standalone runtime foundation

> Implemented by [ADR-0062](../../../../docs/adr/0062-eve-standalone-runtime-foundation.md).

## Context

The runtime must prove installed Eve framework compatibility before it is
mounted into a Next.js app or given a live model/provider. Eve 0.25.1 requires
Node.js 24+, owns durable sessions through the Workflow SDK, and exposes a
default harness whose shell, filesystem, network, question, todo, and
delegation capabilities are inappropriate for an unactivated foundation.

## Decision

- Host Eve in a dedicated workspace package isolated from all three apps.
- Treat installed Eve docs as the framework API authority and commit a review
  summary before framework-authored source.
- Use a deterministic Eve eval fixture only for local `info`, `build`, and
  strict smoke-eval proof. It is not a production model or fallback.
- Disable every authority-bearing default tool. Add no custom tool, channel,
  connection, schedule, subagent, or sandbox.
- Keep live activation outside the authored agent. A narrow boundary may
  convert persisted app-owned governance decisions into a Gateway-primary
  runtime plan only when release, #421 model policy, and #423 approval/budget
  all allow it.
- Keep direct-provider fallback actuation out of this slice.
- Let Eve/Workflow own session durability while Supabase remains authoritative
  for governance persistence.

## Failure behavior

Missing persisted state, disabled release, emergency-off, active-run/global
kill switches, blocked/invalid model policy, or a non-allow approval/budget
decision refuses activation. Local verification cannot enable release or
perform external effects.

## Boundaries

- ADR-0018: autonomy/protected areas
- ADR-0019: release and emergency precedence
- ADR-0022: model-policy lifecycle and resolution
- ADR-0024: approvals and budgets
- #426: admin auth/session ownership
- #428: Next.js admin mount
- #429: engineering sandbox worker
- ADR-0062: isolated, off-by-default runtime foundation only

## Verification

Eve CLI proof, strict deterministic eval, package typecheck/lint, app-isolation
unit coverage, strict OpenSpec validation, and repository CI gates.
