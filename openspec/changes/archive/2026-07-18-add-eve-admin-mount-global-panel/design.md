# Design: Eve admin mount and global panel

## Status

Accepted for implementation by issue #428. Canonical decision: ADR-0029.

## Composition

`withEve` is the outermost Next.js configuration wrapper. Payload first extends
the application config, Sentry wraps that result, and Eve finally supplies the
same-origin development rewrites and Vercel Build Output routes. The runtime
root is the existing `packages/eve-runtime` workspace, and the admin app declares
that workspace dependency so the build graph preserves runtime isolation.

## Protected UI placement

The panel lives inside `MCProvider` in the protected root shell. Public and auth
routes never mount it. The full Mission Control application shell and Payload
Web Studio share that provider boundary, so authorized admins retain the global
panel on either path. The component returns nothing for non-admin Mission
Control roles before creating an Eve client.

## Page-context boundary

Context is constructed from an explicit value object, never from the DOM or
page component state. A pathname is reduced to a known top-level route category,
which prevents record identifiers in dynamic segments from crossing the
boundary. The selected organization is the server-bootstrapped Mission Control
tenant. Safe UI state contains only the surface name and panel open/closed state.

`prepareSend` attaches a newly rendered context to every outbound turn. Tests
seed sensitive extra properties and dynamic identifiers and prove they are not
present in the serialized context.

## Authentication

The Eve service receives the browser's same-origin Cookie header. When
`getAuthContext(request)` is called with that forwarded request, the exact
`@supabase/ssr` `getAll`/`setAll` adapter reads those cookies directly and never
uses ambient Next request globals. The request is immutable, so its adapter's
`setAll` is intentionally a no-op; session refresh remains the originating
application response's responsibility. #426 remains authoritative for identity
and session ownership.

## Compatibility proof

The production admin build is the compatibility test. It exercises the exact
Next.js 16.2.6 dependency with Cache Components, Turbopack configuration,
Payload, Sentry, and the installed Eve 0.25.1 integration. A passing build
proves the current version; a future version change must repeat the proof.

## Safety posture

The panel accepts text only, limits input length, renders text parts only, and
does not expose internal runtime errors. It adds no tool permission, provider,
schema, deployment, or release transition. Stopping the UI detaches the stream;
the label intentionally avoids implying that it cancels server work.
