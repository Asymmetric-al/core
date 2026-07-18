# Proposal: Establish the Eve governance kernel and release switch

## Why

ADR-0018 requires Eve to remain behind one disabled-by-default release gate,
but later implementation slices need a durable definition of that gate before
they can safely add audit, policy, runtime, admin, or GitHub behavior.

Issue #418 establishes the governance kernel: the app-owned state and mandatory
consult contract that let Eve exist while disabled and controlled. It resolves
the system-wide release and emergency precedence rules without granting any
autonomous authority.

## What Changes

- Add the `eve-governance-kernel` capability contract.
- Publish the accepted governance-kernel decision as
  `docs/adr/0019-eve-governance-kernel.md`.
- Define one release gate that defaults to disabled and one emergency-off state
  that always takes precedence.
- Require every autonomous action to consult app-owned state immediately before
  acting and to fail closed when the state does not allow autonomy.
- Require authorized operators to see release, emergency, and policy status.
- Add service-role-only Supabase tables for the singleton governance state and
  decision/run summaries, with RLS enabled and no browser-role access.
- Add a reusable fail-closed governance runner that records its decision before
  any allowed effect and never invokes the effect while disabled.
- Add an authenticated admin read route and read-only Eve governance status
  page.
- Prove disabled, unavailable, emergency, kill-switch, and policy-blocking
  behavior with focused tests.
- Preserve the boundary between #418 state, #420 granular controls, and #437
  final launch verification.

## What Does Not Change

- No live autonomous action, release-gate mutation control, granular
  kill-switch control path, or production activation is added.
- This change does not activate Eve and cannot enable it as a side effect.
- An enabled release gate does not bypass identity, tenant, permission,
  protected-area, approval, budget, or production-write restrictions.
- Granular kill-switch controls remain owned by #420, and the final authorized
  release-gate flip remains owned by #437.

## Expected Outcome

The repository has a validated governance-kernel capability, canonical ADR,
persisted disabled state, enforceable consult boundary, and operator-visible
status that every later Eve slice can build on. The system remains disabled,
and the difference between system readiness and per-action authorization is
explicit and tested.
