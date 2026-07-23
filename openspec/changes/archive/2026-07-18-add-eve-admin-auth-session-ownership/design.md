# Design / ADR — Eve current-admin auth and session ownership

> Implemented by [ADR-0027](../../../../docs/adr/0027-eve-admin-auth-session-ownership.md).

## Context

The current admin identity is already verified through Supabase `getUser()` and
app-owned profile/membership data. Eve route auth can project that caller into
`ctx.session.auth`, but installed Eve 0.25.1 documentation states route auth is
not a session ownership ACL.

## Decision

- Author an Eve HTTP channel whose first production authenticator resolves the
  current verified Supabase admin. It returns a stable user principal carrying
  only server-derived tenant, profile, and role attributes.
- Preserve `localDev()` last for the loopback-only deterministic #425 eval. It
  never creates an app-owned ownership row.
- Store only `session_id` plus tenant, owner, identity mode, role, and initiator
  metadata in Supabase. Store no continuation token, message, or durable Eve
  session content.
- On `turn.started`, atomically claim an unowned session for the authenticated
  caller. An existing claim is idempotent only for the exact same identity.
- Before continuation, cancel, or stream routes, require an exact match on
  tenant, actor, profile (for admin), identity mode, and initiator.
- Service sessions require a distinct service actor and non-empty accountable
  initiator (`admin`, `schedule`, or `system`).
- Continue enforcing existing governance-artifact ownership close to the data
  source: private memory and replay remain tenant/profile scoped; audit reads
  become tenant/profile scoped; approval responses require the request's
  tenant/requester ownership before the permissioned decision RPC.

## Failure behavior

Missing auth returns 401. Non-admin identity or mismatched/missing ownership
returns 403 without session content. Missing app-owned storage fails closed.
The first-turn ownership write is part of the channel event path, so a failed
claim fails the run rather than creating an unowned production session.

## Boundaries

- Eve owns session content, turns, continuations, streams, and workflow
  durability.
- Supabase owns the minimal authorization binding and existing governance data.
- #428 owns the admin Next.js mount and transport compatibility.
- ADR-0027 grants no operational authority and does not enable release.

## Verification

Unit coverage proves verified-context-only derivation, exact admin/service
ownership, session route coverage, cross-user/cross-tenant denial, artifact
filters, and browser-role revocation. Real Eve discovery, build, and eval prove
the authored channel compiles and preserves the offline verification path.
