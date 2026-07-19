# ADR-0022: Producer-owned protected actions

**Status:** Accepted (founder ruling, Phase 17 grill session — D6)

> Full record: `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md`
> (ratified decision D6).

## Context

System messages often present links that can change security, identity, payment,
or workflow state. A template system that generates or redeems those actions
would become a second authority for invitation, account recovery, payment
method, recurring-support, and other business operations. Ordinary email-link
scanners also issue `GET` and `HEAD` requests, so a link whose first request
consumes authority can expire before the person acts.

## Decision

Protected actions are tenant-scope-only in this Phase 17 generation and require
one exact Party/contact authority. Every platform-scoped contract must declare
`action: none`, and the compiler rejects a platform protected-action descriptor.
A future platform protected action requires a separate ratified authority model
and ADR; it may not borrow tenant Party, site, session, or Supabase-invitation
semantics.

The producing domain owns the protected action's purpose, tenant, Party,
resource, issuance, credential, expiry, revocation, redemption, completion
postcondition, and audit evidence. Phase 17 receives only a typed presentation
descriptor from the producer and renders it through the contract-approved
protected-action node. A template cannot create, inspect, rewrite, duplicate,
relabel, track, or widen an action.

Protected actions use one of two contract-declared handoffs:

1. a producer-owned capability that reaches an inert Asym explanation page and
   requires a deliberate action before a single-use server-side exchange; or
2. an authenticated Asym service doorway that re-proves current tenant, Party,
   role, resource, expiry, revocation, and authorization before the producer
   performs the operation.

`GET`, `HEAD`, previews, link expansion, and scanner traffic MUST have no
business effect. Sensitive credentials and destinations MUST NOT enter template
source, browser editor state, logs, analytics, durable communication history,
or the recent sent-copy projection. A newly issued credential creates a new
communication/prepared-message identity; an old prepared message is never
mutated to carry it.

The protected handoff is a no-store, no-referrer, third-party-free Asym flow.
Only a deliberate POST to the exact trusted origin may act, and it re-proves the
descriptor's tenant, recipient, source/resource, issuance, expected state,
current authorization, CSRF/origin, and required reauthentication or step-up.
Host headers, forwarded hosts, query strings, fragments, tenant content, and
return URLs never select authority. Before any content renders, the first
browser GET performs the mandatory server-side clean-URL exchange: validate the
short-lived revocable opaque handle, create a non-authorizing landing session,
and return `303 See Other` to the exact code-owned token-free path. The cookie
contains only a cryptographically random server-side session id, is `Secure`,
`HttpOnly`, `SameSite=Lax`, host-only because `Domain` is omitted, and bound
to the exact path. Its absolute expiry and `Max-Age` cannot outlive the handle
or action authority. Server state binds environment, scope, handle digest,
action and purpose; every render rechecks expiry/revocation, and terminal or
expired state clears it. `HEAD` creates no session. The exchange is repeat-safe,
is not redemption, grants no mutation authority, and cannot be replaced by
JavaScript or `history.replaceState`. `Lax` is required for the external-email
top-level redirect chain; mutation authority still comes only from the later
CSRF/origin/auth/source-reproved POST. A bounded set of simultaneous short-lived
landing sessions prevents scanner follows from invalidating a human session;
rate limits never consume the action, mark it used, or block later recovery, and
terminal/expiry/replacement/revocation clears the entire set. Terminal results are privacy-safe and
non-enumerating. Asym guarantees token-free product-controlled addresses,
forms, referrers, logs and telemetry after the redirect; it does not claim to
erase browser- or mail-client-managed history outside its control.

Every adopted Supabase Send Email Hook action has a checked-in exact field-level
recipient/token/hash mapping and hashing rules, including both Secure Email
Change recipients and the Secure Email Change-disabled form, with synthetic
fixtures only. Raw token values, credentials, and production webhook secrets are
never committed or retained in fixtures. Raw Standard Webhooks bytes are
verified before parse, one endpoint binds one project/environment, and the
bounded hook deadline uses only already-published artifacts plus one low-latency
individual send. A possible provider acceptance is indeterminate and reuses the
frozen semantic identity; it never creates a second email. The authoritative
Asym invitation is consumed only by one idempotent producer command that
re-proves the exact tenant, invitee, origin, expiry, revision, and fresh Supabase
proof.

## Consequences

- Producer APIs need typed action-descriptor and deliberate-acceptance seams.
- Rendering, testing, import, and portability preserve purpose and protected
  placement, never raw credentials.
- Scanner, replay, cross-tenant, stale-session, expiry, revocation, and
  double-redemption tests are release blockers.
- CSP, no-store/referrer, CSRF/origin, log-redaction, open-redirect, exact auth
  mapping, signed-hook replay, and five-second deadline fixtures are release
  blockers.
- Phase 17 remains a presentation authority, not an authorization service.
