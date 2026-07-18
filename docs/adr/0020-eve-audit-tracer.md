# ADR-0020: Persist redacted, accountable Eve action records

**Status:** Accepted
**Date:** 2026-07-17
**Issue:** #419
**Builds on:** ADR-0018, ADR-0019

## Context

Every later Eve capability needs one durable way to explain who initiated an
action, which identity and policy applied, what evidence informed it, and what
changed. Without a shared record shape, runtime, GitHub, product, and subagent
features would each invent incompatible logs and could accidentally persist
secrets, tenant PII, payment data, one-time codes, or raw model reasoning.

The first tracer must prove accountability without adding live autonomy. It
also needs to support three verified identity modes:

- an admin action attributed to the authenticated admin and tenant;
- a background action attributed to a configured service plus its trigger;
- a GitHub action attributed to the bot plus its accountable sender or trigger.

Identity asserted by a prompt, model output, tool response, or remote payload
is not authority.

## Decision

Eve action auditing uses one app-owned, service-role-only record shape with:

- actor, initiator, tenant, role, and identity mode;
- policy identity, status, and governance-state version;
- action, target, result, tool, subagent, and model role;
- redacted evidence and change summaries;
- a structured, high-quality decision summary; and
- bounded, redacted replay/debug metadata with an explicit redaction version.

The server constructs accountable identity from verified route, service, or
GitHub event context. Callers cannot supply identity through action content.

Redaction occurs before persistence. Sensitive keys and recognizable secret,
credential, payment-number, email, one-time-code, and raw-reasoning values are
replaced, while object depth, key count, array size, and string length are
bounded. The schema deliberately has no raw prompt, transcript, payload,
payment, or model-reasoning columns.

Audit rows are append-only at the database permission boundary: `service_role`
may select and insert, while browser roles receive no table privileges and no
role receives update or delete through this contract.

Admins inspect only the redacted record, decision summary, and metadata through
an authenticated server route. The first end-to-end action is a read-only
governance-status inspection. It writes a record but changes no operational
state and grants no authority.

## Failure behavior

For a meaningful action whose contract requires an audit record, failure to
persist the record is an operation failure. The safe tracer path does not
silently continue without accountability.

The audit system does not authorize an effect. ADR-0019 remains the only
governance gate, and the release switch remains disabled by default.

## Boundary with adjacent slices

- ADR-0018 owns tenant, identity, protected-area, and source-of-truth rules.
- ADR-0019 owns release, emergency, policy, and consult-before-effect gates.
- ADR-0020 owns the audit record, redaction, identity attribution, and admin
  inspection contract.
- #424 owns retention, expiry, holds, and large replay artifact storage.

## Consequences

- Every later Eve action can share a stable, inspectable accountability shape.
- Unsafe raw context is excluded before it can reach durable storage.
- Decision summaries explain the action without exposing hidden reasoning.
- Audit writes add latency and can fail an operation that cannot be safely
  performed without a record.
- This slice stores bounded metadata only; richer artifact lifecycle remains a
  separately governed capability.

## Verification

- Migration tests assert the required fields, RLS, service-role-only grants,
  append-only permissions, and absence of raw-data columns.
- Unit tests prove verified admin, service, and GitHub identity construction.
- Redaction tests inject secrets, payment data, PII, one-time codes, forged
  identity, and raw reasoning and prove none reaches the stored record.
- Route and UI tests prove authorized admins can inspect audit history and
  decision summaries while the release gate remains disabled.
