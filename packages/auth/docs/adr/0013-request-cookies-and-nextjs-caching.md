# 0013. Prefer the Next.js cookie store and preserve its rendering control flow

**Status:** Recorded on 2026-11-22 from code comments in `packages/auth`
([#2751](https://github.com/Asymmetric-al/core/issues/2751)). It describes the
code as it is and ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md).

## Context

A route handler can give `getAuthContext` a `Request` even when Next.js also provides its cookie store. Both can supply a session cookie, but only the store can write refreshed cookies to the outgoing response. Some forwarded requests have no Next.js store. Next.js also throws internal signals to stop prerendering or to redirect; these signals do not mean the visitor is signed out.

## Decisions

1. **Use the writable cookie store before the request header.** For cookie authentication, `createAuthContextClient` in `packages/auth/context.ts` tries `cookies()` even with an explicit `Request`. This lets a route handler persist a Supabase refresh where writes are permitted. If this setup fails with an ordinary error, the helper can still authenticate from the supplied `Cookie` header, but that fallback cannot save a refresh. Without a request there is no fallback client. An explicit bearer token takes a separate path before cookie handling.
2. **Let Next.js decide when to stop rendering.** `createAuthContextClient` in `packages/auth/context.ts` calls `unstable_rethrow(error)` first in the outer cookie-setup catch. Prerender interrupts, redirects and not-found signals therefore propagate instead of taking the read-only or signed-out fallback. Otherwise Next.js could cache an unauthenticated render when it should have waited for the request.
