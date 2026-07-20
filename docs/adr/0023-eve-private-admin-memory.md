# ADR-0023: Bound Eve memory to private, excluded, human-controlled context

**Status:** Accepted
**Date:** 2026-07-17
**Issue:** #422
**Builds on:** ADR-0018, ADR-0019, ADR-0020, ADR-0021

## Context

Eve needs durable preferences, project context, and decisions, but memory is a
high-risk persistence boundary. A useful note cannot justify storing secrets,
credentials, payment data, donor or customer PII, private keys, one-time codes,
or sensitive tenant facts. Memory must also remain subordinate to product
intent and verified governance rather than becoming hidden authority.

## Decision

V1 memory is private to one verified admin profile inside one verified tenant.
It has three categories: `preference`, `project_context`, and `decision`.
Memory is advisory only and is not yet injected into any runtime or model
context.

Every application write path runs one deterministic exclusion classifier before
persistence. A rejected write records only exclusion categories and the fact
that nothing was stored; the rejected value is never copied into the audit
record. Database-side checks provide defense in depth. Allowed manual and
automatic writes use service-role-only security-definer functions that append
the immutable history row and ADR-0020 audit event in the same transaction.

Admins can create, view, search, edit, delete, disable automatic saving by
category, and inspect immutable versions. Updates use optimistic versions.
Delete is a retention-aware soft delete: the current row is immediately absent
from active memory while immutable history remains inspectable. Memory-history
and deleted-memory retention controls are separate from run-log retention.

The storage schema can represent `tenant_operational` scope, but V1 application
validation and all live mutation functions reject it. Tenant-wide categories,
export, deletion, retention, and authorization must receive an explicit later
decision before that scope can become live.

Automatic saves additionally require the ADR-0019 release gate, no emergency
state, no `all_automation` stop, and an enabled category setting. Manual admin
curation remains available while release is disabled because it is an explicit
human action and grants no runtime autonomy.

## Failure behavior

Unverified ownership, stale versions, deleted entries, excluded content,
disabled category auto-save, unavailable governance, or tenant-operational
scope fails closed. Browser roles cannot read the tables or execute mutation
functions. An audit failure rolls back an allowed mutation.

## Consequences

- Private context is useful and fully controllable without becoming authority.
- Sensitive values are stopped before storage rather than redacted afterward.
- Automatic collection remains disabled with the wider Eve release gate.
- The future tenant scope is visible in the data model without being available
  through a live API.
- Retention enforcement jobs remain a later lifecycle concern, but their
  independent policy values and deletion semantics are explicit now.

## Verification

Unit tests cover each exclusion class, value-free rejected-write audits,
application scope validation, allowed mutation routing, optimistic conflicts,
schema ownership, immutable history, search, governance gates, category disable,
atomic auditing, and browser denial. An isolated full-chain database proof
exercises the same behavior against Postgres.
