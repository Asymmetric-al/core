# ADR-0027: Bind Eve sessions to verified admin or service identity

**Status:** Accepted (amended 2026-11-25 for AL-2796)

**Date:** 2026-07-17

**Issue:** #426

**Builds on:** ADR-0018, ADR-0019, ADR-0020, ADR-0023, ADR-0024, [ADR-0025 — eve retention replay lifecycle](./0025-eve-retention-replay-lifecycle.md), ADR-0062

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

The channel claims ownership in the request that creates the session (and on
the follow-up route for a session it returns under another id), before the
session id is returned; `turn.started` repeats the claim idempotently. Repeated
claims are idempotent only for the exact same identity. Route auth checks the
binding before every continuation, cancel, or stream attachment. A different
user, profile, tenant, identity mode, service actor, or service initiator is
denied.

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
session content. Storage unavailability fails closed. A failed claim at
creation fails that HTTP request (500) and never returns the session id or
continuation token. Because eve starts the workflow before `send` returns, and
swallows exceptions thrown by channel event handlers
(`eve/dist/src/channel/adapter.js`, `callAdapterEventHandler`,
`"adapter event handler threw — event swallowed"`), the background turn may
still run with no HTTP consumer. Every session route and every
ownership-checked governance RPC refuses it while it has no row. A failed
repeat claim at `turn.started` fails that event handler. Eve logs and swallows
it. It cannot break a session already claimed at creation, and it does not stop
an unowned run.

## Boundary with adjacent slices

- ADR-0018 owns protected areas and autonomy limits.
- ADR-0019 owns release and emergency precedence.
- ADR-0020 owns audit content and redaction.
- ADR-0023 owns private admin memory.
- ADR-0024 owns approval and budget policy.
- [ADR-0025 — eve retention replay lifecycle](./0025-eve-retention-replay-lifecycle.md) owns retention and replay lifecycle.
- ADR-0062 owns Eve session durability and the disabled runtime foundation.
- #428 owns the Next.js admin mount and transport compatibility.
- [ADR-0027 — eve admin auth session ownership](./0027-eve-admin-auth-session-ownership.md) owns verified route identity and authorization bindings only.

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

## Amendments

### 2026-11-25: ownership is claimed at creation (AL-2796)

- **Authority.** The program ruling under D-16 (25 November 2026,
  `ruling-eve-first-message.md` in the implementation scratchpad, reconciled
  with installed Eve 0.25.1 `eve/dist/src/channel/adapter.js`
  `callAdapterEventHandler`).
- **Kept.** Route authentication, the `eve_session_ownership` schema,
  insert-only `23505` same-identity claiming (never an upsert), fail-closed
  denial for missing or mismatched ownership on every session route and
  ownership-checked governance RPC, distinct service identity rules, and the
  loopback-only deterministic eval path. The OpenSpec specification and its
  normative contract are unchanged because they require user and tenant
  ownership enforced on session create and are neutral on mechanism
  (`openspec/specs/eve-admin-auth-session-ownership/spec.md:72`;
  `openspec/contracts/eve-admin-auth-session-ownership.md:92-95`).
- **Changed.** The channel wraps `POST /eve/v1/session`'s `send` so ownership
  is claimed in the creating HTTP request before the 202 returns the session
  id, and wraps `POST /eve/v1/session/:sessionId`'s `send` to claim whenever it
  returns a session under a different id than the path parameter.
  `turn.started` keeps its claim as an idempotent repeat. Failure behavior is
  updated for both creation-time HTTP 500 rejection and installed Eve 0.25.1's
  swallowing of channel event handler exceptions.
- **Dated history (2026-07-17, issue #426).** The original Decision (`:38`)
  stated: "The channel claims ownership on the first `turn.started` event."
  The original Failure behavior (`:56-58`) stated: "A first-turn ownership
  write failure fails the channel event path rather than leaving an unowned
  production session."
