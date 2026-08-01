# ADR-0037: Scanner-resistant exact-artifact access

**Status:** Accepted (founder ruling, Phase 18 grill session — D13)

> Full record:
> `docs/prds/sitestacker-parity/phase-18-receipt-pdf-template-system.md`
> (ratified decision D13). This record amends the shared protected-action
> transport described by ADR-0025 for **every** protected action. It is not a
> document-only exception. Producer ownership and deliberate server-side action
> remain unchanged; the document-specific checks below extend the shared
> primitive only after a valid exchange.

## Context

Donors need durable access to an exact official document without forcing every
guest to create an account. Direct object URLs, attachment-only delivery, and
bearer links that return bytes on `GET` are unsafe: email scanners follow links,
signed storage URLs remain usable until expiry, forwarded messages expose the
document, and link expiry can be confused with receipt expiry.

The protected-action design previously placed the complete opaque secret in the
request URL and exchanged it during the first browser `GET`. That prevents the
secret from remaining in the clean product URL, but it still sends the secret
through HTTP paths and infrastructure logs and lets scanner traffic create
preflight state. D13 corrects that shared transport once for every protected
action; Phase 18 then adds document-purpose authorization and exact-artifact
retrieval.

## Decision

Keep artifact, recipient authority, access grant/session, Phase 17 communication
evidence, jurisdictional delivery determination, and records evidence as
separate authorities. An expired grant never expires the document, and issuing a
new grant never rerenders, renumbers, replaces, or redelivers it by itself.

For every protected action, the fixed trusted Asym URL carries a non-secret
selector in the HTTP URL and an independent 256-bit verifier in the URL
fragment. The server stores only a versioned HMAC/digest of the verifier. The
fragment is never sent in an HTTP request, stored in communication history, or
exposed to platform logs, analytics, referrers, provider URLs, or support tools.

A minimal, first-party, third-party-free landing page reads the fragment,
immediately removes it from browser-visible history, and submits it only through
a deliberate same-origin, CSRF-protected `POST`. `GET`, `HEAD`, previews,
crawlers, scanners, tracking systems, the selector alone, and any failed
verifier disclose no protected facts, touch no protected resource, consume no
grant, create no authorized session, and prove no human intent.

This is scanner-resistant, not scanner-proof: an advanced scanner may execute
JavaScript or submit a form. Product copy, evidence, dashboards, and tests must
never treat a successful exchange as proof of a human or the named donor.

The shared exchange re-proves the producer-owned purpose contract, tenant,
Party or other purpose-owned subject, exact protected resource, current
authorization, expiry, revocation, and replay state. Each producer adds only its
own typed checks after this common boundary. The document producer additionally
re-proves environment, exact issuer, logical document and current head,
recipient Party or evidenced representative, contact-authority epoch, artifact
health, and records/access state. Success creates one short, secure, host-only,
HttpOnly, purpose-scoped session or capability.

Routine link replacement permits only a bounded incumbent/newest overlap and
uses first-successful-redemption retirement. Authority loss, cancellation,
compromise, or security revocation invalidates affected grants and sessions
immediately.

Every portal, guest, staff, print, full-file, and range request reauthorizes the
object and streams the same digest/length/read-back-proven immutable PDF through
an Asym-owned boundary. Every protected landing, redirect, error, session,
full-file, and range response sets exactly:

- `Cache-Control: private, no-store, no-transform, max-age=0`
- `CDN-Cache-Control: no-store`
- `Vercel-CDN-Cache-Control: no-store`

No response may add `s-maxage`, stale fallback, optimizer, or service-worker
handling. No browser receives a public or raw signed storage URL. A missing or
corrupt object fails closed and never triggers a plausible rerender.

The code-owned defaults are a disclosed fourteen-day guest grant and a
thirty-minute document-only session, subject to production usability and
security evidence. Tenants do not receive a TTL, password, fingerprinting, OTP,
or file-sharing policy builder. Phase 17 messages remain fact-minimized and
carry only the protected action; Phase 17 owns provider submission and delivery
evidence, while Phase 18 owns exact artifact authorization and retrieval.

Canadian notice-plus-access stays dark until qualified current legal, privacy,
records, signer, accessibility, security, and production review approves that
exact route. Direct Canadian attachment delivery is a separate dark capability.

## Consequences

- The protected-action primitive must support selector-plus-fragment-verifier
  transport for every protected action; the former full-secret first-GET
  clean-URL exchange is not valid.
- The landing page needs a deliberately tiny script and therefore a narrowly
  reviewed nonce- or hash-pinned same-origin CSP exception rather than an
  impossible `script-src 'none'` claim. It still allows no third-party script,
  analytics, service worker, or remote resource and sets
  `Referrer-Policy: no-referrer`.
- Staff receive one masked fixed-destination panel with **Send new secure link**,
  permissioned exact download/print, and separate security revoke. They never
  see a bearer secret or arbitrary-address control.
- Generated, issued, available, prepared, provider accepted, mail-server
  accepted, grant redeemed, bytes served, downloaded, paper fulfilled, and
  legally delivered remain distinct evidence. None claims a person read or
  retained the PDF.
- Scanner, fragment leakage, XSS/CSRF, host injection, enumeration, replay,
  grant-rotation races, cross-tenant/Party IDOR, range/cache, integrity,
  recovery, accessibility, Resend tracking drift, and seasonal-load tests are
  release blockers.
- A production deployment probe through the actual Vercel/CDN and supported
  mail-client/scanner matrix must prove that the three cache headers survive,
  responses are neither cached nor transformed, full and range requests resolve
  the exact generation, fragments never enter server/edge/provider logs, and
  repeated `GET`/`HEAD` remain inert. There is no query-string or raw-path-secret
  fallback if fragment preservation fails.
