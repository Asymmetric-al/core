# Implementation tasks

## 1. Durable capability and decision

- [x] 1.1 Promote the `eve-governance-kernel` capability on top of ADR-0018.
- [x] 1.2 Publish the accepted decision as
      `docs/adr/0019-eve-governance-kernel.md`.
- [x] 1.3 Cross-link ADR-0019 from the Eve PRD and implementation plan.
- [x] 1.4 Replace downstream provisional-label references with ADR-0019.

## 2. App-owned governance state

- [x] 2.1 Add a singleton `eve_governance_state` record that installs with the
      release gate disabled, emergency-off clear, and policy not configured.
- [x] 2.2 Persist kill-switch state, policy status, state version, and
      accountable update metadata.
- [x] 2.3 Add `eve_run_summaries` for allowed and blocked governance decisions.
- [x] 2.4 Enable RLS, deny browser roles, explicitly grant only required
      service-role operations, and index recent-run queries.

## 3. Enforceable consult path

- [x] 3.1 Add a reusable kernel evaluator with emergency precedence,
      disabled-by-default behavior, all-automation kill-switch support, and
      ready-policy enforcement.
- [x] 3.2 Fail closed when governance state is absent, malformed, or
      unavailable.
- [x] 3.3 Record the governance decision before invoking any allowed effect and
      block the effect if the required record cannot be written.
- [x] 3.4 Keep the kernel necessary but insufficient: stricter identity,
      permission, tenant, approval, budget, and protected-area policy still
      applies.

## 4. Admin observability

- [x] 4.1 Add an admin/super-admin authenticated read route through
      `packages/api` and a thin App Router re-export.
- [x] 4.2 Add a read-only Mission Control status page showing release,
      emergency, policy, and recent-run summaries.
- [x] 4.3 Do not expose an enable switch or granular kill-switch mutation in
      this slice.

## 5. Verification

- [x] 5.1 Prove disabled mode does not invoke an autonomous effect.
- [x] 5.2 Cover unavailable state, emergency precedence, kill-switch, policy,
      decision-record failure, route authorization, UI status, and migration
      security contracts.
- [x] 5.3 Validate the migration against local Postgres in a rollback-only
      transaction and confirm the installed singleton is disabled.
- [x] 5.4 Validate OpenSpec, formatting, lint, typecheck, data boundaries, and
      focused unit tests.
