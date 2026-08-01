# ADR-0025: Producer-owned protected actions

**Status:** Accepted (founder ruling, Phase 17 grill session — D6; shared
transport amended by ratified Phase 18 D13 on 2026-07-20)

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

Every protected action uses the same fixed scanner-resistant Asym doorway. The
producer contract may require an authenticated portal session, reauthentication,
step-up, producer OTP, or explicit confirmation after the verifier POST, but
those are assurance requirements behind one transport—not alternate link or
token systems. The producer still owns the resulting operation and every
business precondition/postcondition.

`GET`, `HEAD`, previews, link expansion, and scanner traffic MUST have no
business effect. Sensitive credentials and destinations MUST NOT enter template
source, browser editor state, logs, analytics, durable communication history,
or the recent sent-copy projection. A newly issued credential creates a new
communication/prepared-message identity; an old prepared message is never
mutated to carry it.

The protected handoff is a no-store, no-referrer, third-party-free Asym flow.
The fixed code-owned Asym URL carries only a random **non-secret selector** in
the HTTP URL and an independent 256-bit verifier in the URL fragment. The server
stores only a versioned HMAC/digest of that verifier. The fragment is not sent
in an HTTP request and MUST NOT enter a path, query, redirect, provider tracking
URL, communication history, log, trace, analytics event, support tool, recent
sent copy, or storage URL. The selector alone is inert and non-enumerating: a
`GET` or `HEAD` reveals no protected facts, touches no protected resource,
consumes no grant, creates no authorized session, and proves neither identity
nor human intent.

A minimal first-party landing page may use only one nonce- or hash-pinned inline
script to read the fragment, validate its closed envelope, immediately remove it
from browser-visible history, and place it only in the same-origin protected
form submission. The script performs no automatic submission, fetch, beacon,
storage, telemetry, or third-party work. A recipient must deliberately submit
the form. There is no path, query-string, cookie, or raw-selector fallback when
the fragment is missing or stripped; the page offers the one code-owned safe
recovery route instead. Supported mail-client, webview, and scanner fragment
preservation is a production release gate.

Every protected action's deliberate same-origin POST must validate the
selector/verifier pair before it may establish a short-lived non-authorizing
landing session or continue to the producer-owned assurance/action step. The
POST re-proves the descriptor's tenant, recipient, source/resource, issuance,
expected state, current authorization, expiry, revocation, CSRF/origin/Fetch
Metadata, and replay state. The producer then separately proves any required
current session, reauthentication, step-up, OTP, or explicit confirmation behind
that same doorway. Raw request bodies and verifiers are redacted before every
product-controlled observability seam. Host headers,
forwarded hosts, tenant content, and return URLs never select the origin, route,
authority, or redirect. The session cookie contains only a cryptographically
random server-side id, is `Secure`, `HttpOnly`, `SameSite=Lax`, host-only because
`Domain` is omitted, and bound to the exact path. Its absolute expiry and
`Max-Age` cannot outlive the action authority. Server state binds environment,
scope, selector and verifier-digest versions, action, purpose, recipient epoch,
expiry, and revocation; every request rechecks them, and terminal, expired,
replaced, or revoked state clears every affected session. Repeated GET/HEAD
traffic remains inert. Repeated verified POSTs are idempotent and never redeem
or execute the producer action twice.

Every protected landing, redirect, error, session, and terminal response sets
all three cache headers exactly:

- `Cache-Control: private, no-store, no-transform, max-age=0`
- `CDN-Cache-Control: no-store`
- `Vercel-CDN-Cache-Control: no-store`

No protected route permits `s-maxage`, stale fallback, an optimizer, or service
worker handling. Every response also sets `Referrer-Policy: no-referrer` and a
strict first-party CSP. The landing page's narrow pinned script exception is the
only script allowance; it does not weaken the producer-owned authorization or
deliberate-action boundary. Terminal results are privacy-safe and
non-enumerating. Asym guarantees that the verifier leaves browser-visible
history after the minimal script runs and never enters product-controlled URLs,
forms after submission, referrers, logs, or telemetry; it does not claim to
erase mail-client, extension, screenshot, clipboard, or other records outside
its control.

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
- Selector/verifier separation, fragment removal, deliberate same-origin POST,
  the exact three cache headers, pinned-script CSP, no-referrer,
  CSRF/origin/Fetch Metadata, log redaction, open-redirect, exact auth mapping,
  signed-hook replay, and five-second deadline fixtures are release blockers.
- Phase 17 remains a presentation authority, not an authorization service.
