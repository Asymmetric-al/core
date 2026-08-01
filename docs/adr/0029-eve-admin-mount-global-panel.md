# ADR-0029: Mount Eve as a data-minimizing global admin panel

**Status:** Accepted

**Date:** 2026-07-17

**Issue:** #428

**Builds on:** ADR-0026, ADR-0027, and ADR-0028

## Context

The isolated Eve runtime, verified admin identity/session ownership, and
operations-first workspace now exist. Mission Control needs a same-origin client
mount, but the first admin-visible runtime integration cannot destabilize the
installed Next.js stack or silently ingest the sensitive records visible on an
operator's page.

## Decision

Before `withEve` starts the local sidecar, the admin Next.js config removes an
empty `VERCEL_URL` placeholder. Eve 0.25.1 interprets any defined value as a
hosted deployment and otherwise attempts to construct the invalid URL
`https://`. Non-empty Vercel-provided values are preserved.

The admin app mounts the existing `packages/eve-runtime` workspace through Eve
0.25.1's official `withEve` integration. The wrapper is composed outside the
existing Payload and Sentry wrappers. Compatibility is proven against the repo's
exact Next.js 16.2.6 stack by the real production admin build, including Cache
Components and the existing Turbopack configuration.

An admin-only global sheet is mounted inside the protected Mission Control
provider and remains available on ordinary admin pages and Payload Web Studio.
It is secondary to the operations workspace. Public routes and non-admin roles
do not create the Eve client.

Every turn receives an explicit context allowlist: a known top-level route
category, derived page identity, the server-bootstrapped selected organization,
and panel open/closed state. Dynamic URL segments are discarded. The panel does
not inspect the DOM or serialize page, table, record, donor, payment, or form
state. It renders user and assistant text only.

The standalone runtime authenticates forwarded cookies through the explicit
Request supplied to `getAuthContext`. It does not depend on ambient Next.js
headers, and #426 continues to own verified identity and session ownership.

## Consequences

- Eve is reachable throughout protected Mission Control without a CORS or
  runtime-host configuration seam.
- Page context remains useful but deliberately lossy; record-level help must be
  introduced later through an explicit, permissioned boundary.
- The mount grants no tools, provider access, deployment, or release authority.
  The deterministic fixture policy and disabled release switch remain in force.
- Future Next.js or Eve upgrades must re-run the production compatibility proof.

## Verification

- Unit tests prove approved context inclusion and sensitive/dynamic-field
  exclusion.
- Auth tests prove forwarded requests do not read ambient Next.js request state.
- Admin/auth typecheck and lint, the production admin build, OpenSpec strict
  validation, and the repository CI preflight are required.
