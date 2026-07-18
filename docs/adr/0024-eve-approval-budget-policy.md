# ADR-0024: Classify Eve actions by trust zone and reserve hard budgets atomically

**Status:** Accepted
**Date:** 2026-07-17
**Issue:** #423
**Builds on:** ADR-0018, ADR-0019, ADR-0020, ADR-0021, ADR-0022

## Context

“Operate under policy” is not a sufficient authorization boundary. Engineering,
product/admin, and memory actions have different risk, routine operational
records are not equivalent to donor or payment records, and a model cannot be
allowed to describe its own action as cheap or low risk. The governance kernel
therefore needs persisted policy content and an atomic spend decision before an
effect.

## Decision

Eve uses a persisted, app-owned action catalog. Each action ID fixes its trust
zone, write class, governance domain, budget scope, and cost. Callers submit
only a known action ID and a non-sensitive stable target key. They cannot select
or override classification or cost fields.

V1 has distinct policies for `engineering`, `product_admin`, and `memory`.
Engineering tracer writes are allowed under policy. Product/admin and memory
operational writes require target-bound zone approval. Customer, donor,
payment, identity, tenant-ownership, auth, secret, migration, and destructive
production writes are the `business_data` class and require a target-bound
strict approval. A zone approval cannot satisfy that class. Unknown actions
default to `business_data` and deny.

The tracer effect is intentionally a non-business artifact containing only the
fixed action ID and safe target key. It proves that one action can be allowed,
denied, or paused without granting a live business-data mutation surface.

Hard budgets use persisted definitions and deterministic time windows. The
consult function locks the current window, resolves active overrides, checks
all request, USD-micro, input-token, and output-token ceilings, and reserves
usage before inserting the tracer effect. Exhaustion pauses the action. This
single transaction also persists the policy decision and ADR-0020 audit row; an
audit failure rolls the decision, reservation, approval consumption, and
effect back together.

Emergency budget overrides require `budget.emergency_override` authority (a
super admin carries platform-owner authority; another admin needs an explicit
tenant-bound grant), a reason, automatic expiry within 24 hours, and enforced
increase ceilings. Approval decisions similarly require
`approval.policy.manage`. Overrides and approval changes are audited.

Every consult reads ADR-0019 release/emergency state and ADR-0021
`all_automation`, `production_writes`, and `force_approval` controls. The most
restrictive state wins. Approval and budget policy never overrides protected
areas, higher-authority product rules, or model-policy limits from ADR-0022.

## Failure behavior

Missing governance, missing policy, missing budget, unknown action, invalid
target key, exhausted budget, absent or stale approval, permission failure, or
audit failure fails closed. Approvals expire and are single-use. Browser roles
cannot read policy state or invoke mutation functions.

## Consequences

- Zone and cost claims are data controlled by the application, not prompts.
- Routine operational effects can be proven without opening a business-data
  write path.
- Spend reservation is race-safe and cannot pass on a stale read.
- Emergency relief exists but is bounded, expiring, attributable, and visible.
- Later runtimes can add catalog entries and budget definitions without
  weakening the consult contract.

## Verification

Unit tests cover cross-zone isolation, strict business-data approval, unknown
action denial, hard ceilings, persisted override additions, governance
precedence, request validation, and server identity binding. Migration tests
cover the catalog, separate policies, deterministic locked windows,
permissions, audit atomicity, and browser denial. An isolated full-chain
Postgres proof exercises allow, deny, pause, target-bound zone and strict
approvals, single use, budget exhaustion, permission denial, bounded override,
kill-switch precedence, unknown-action default, and audit-failure rollback.
