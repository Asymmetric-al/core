# ADR-0027: Bind Eve sessions to verified admin or service identity

**Status:** Accepted

**Date:** 2026-07-17

**Issue:** #426

**Builds on:** ADR-0018, ADR-0019, ADR-0020, ADR-0023, ADR-0024, ADR-0025, ADR-0026

## Context

Eve 0.25.1 protects its HTTP session routes with an ordered authentication
walk and carries the accepted caller into durable session context. Its
installed documentation is explicit that route authentication does not enforce
per-user, per-tenant, or per-session ownership. The application must supply
that ACL before an admin mount can safely expose durable sessions.

The repository already verifies users through Supabase Auth `getUser()` and
loads tenant/profile/membership authority from app-owned data. Private memory
and replay artifacts already use tenant/profile filters. Those verified facts,
not prompts or tool input, are the identity source for Eve.

## Decision

The Eve HTTP channel authenticates production requests as the current verified
Supabase admin and projects a stable user principal containing server-derived
tenant, profile, and role attributes. Non-admin and incomplete identities fail
closed. The loopback-only deterministic eval remains a separate final auth
entry and does not create production ownership metadata.

Supabase stores a minimal `eve_session_ownership` authorization binding:
session id, tenant, owner actor/profile, identity mode, role, and accountable
initiator. Eve/Workflow continues to own the continuation token, messages,
turns, stream, and workflow durability; none of that content is copied into the
ACL table.

The channel claims ownership on the first `turn.started` event. Repeated claims
are idempotent only for the exact same identity. Route auth checks the binding
before every continuation, cancel, or stream attachment. A different user,
profile, tenant, identity mode, service actor, or service initiator is denied.

Background work uses a distinct service identity and must name a non-empty
accountable admin, schedule, or system trigger. It cannot silently impersonate
a real admin.

Governance-artifact enforcement remains close to its data source. Private
memory and replay/debug records retain exact tenant/profile filters; audit
reads are tenant/profile scoped; approval responses verify tenant and requester
ownership before the permissioned decision RPC.

## Failure behavior

Missing verification returns unauthenticated. Insufficient admin authority,
missing ownership, and any ownership mismatch are denied without disclosing
session content. Storage unavailability fails closed. A first-turn ownership
write failure fails the channel event path rather than leaving an unowned
production session.

## Boundary with adjacent slices

- ADR-0018 owns protected areas and autonomy limits.
- ADR-0019 owns release and emergency precedence.
- ADR-0020 owns audit content and redaction.
- ADR-0023 owns private admin memory.
- ADR-0024 owns approval and budget policy.
- ADR-0025 owns retention and replay lifecycle.
- ADR-0026 owns Eve session durability and the disabled runtime foundation.
- #428 owns the Next.js admin mount and transport compatibility.
- ADR-0027 owns verified route identity and authorization bindings only.

## Consequences

- Session creation starts only for a verified admin (or the isolated local
  fixture), and durable handles are unusable across tenant/user boundaries.
- Prompt, model, tool, or remote-provided IDs cannot select application
  identity.
- Service work stays attributable without impersonating a human.
- The release switch remains off; auth readiness grants no operational
  capability by itself.

## Verification

- Unit tests for current-admin derivation, prompt-ID rejection, service
  initiators, session create/continue/stream/cancel ownership, and cross-boundary denial.
- Data-access tests for approval, memory, audit, and replay ownership.
- Migration tests for RLS, browser-role revocation, and minimal metadata.
- Real `eve info`, `eve build`, and strict offline eval.
- Strict OpenSpec validation and repository CI gates.
