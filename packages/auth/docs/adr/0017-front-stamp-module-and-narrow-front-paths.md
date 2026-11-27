# 0017. One Next-free front stamp, and narrow front paths for the assistant and the dashboards' assets

**Status:** Recorded on 2026-11-26 with N3 part 3c of the Core CRM, CMS and
database foundation program (AL-2671): rulings 1 (A) and 2 (a) on part 3c, and
ruling (c) on its merge gate. It describes the code as it is and ratifies no
product intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md) and in the OpenSpec change
`adopt-tenant-owned-domains`.

## Context

With `CORE_SERVE_UNDER_PATHS=1`, the donor app is the front for every name and
forwards `/admin/*` and `/missionary/*` to the dashboards with a signed stamp
([0015](0015-organization-from-the-verified-name.md)). Two kinds of request do
not fit that path. The assistant's service (`packages/eve-runtime`) is mounted
by `withEve` at the root of the staff deployment, ahead of the staff app and its
proxy, so it never sees the dashboards' admission. The dashboards' static files
(`/<prefix>/_next/*`) are served by each dashboard without its proxy and
carry nothing the stamp protects. Before this record the stamp code lived in
`front.ts`, which imports `next/server`, and the front forwarded every path
under `/admin/` alike.

## Decisions

### The stamp

1. **One stamp implementation, free of Next.js.** `front-stamp.ts`
   (`@asym/auth/front-stamp`) holds `FRONT_STAMP_HEADER`, `FRONT_ORIGIN_HEADER`,
   `VerifyStampKeys`, `hasValidStampKey`, `signFrontStamp`, `verifyFrontStamp`
   and `verifiedStampedOriginForRequest`. It imports only `canonicalOrigin` from
   `@asym/env/front-origin`, which imports nothing. `front.ts` re-exports its
   six existing stamp symbols. The assistant's service imports
   `verifiedStampedOriginForRequest` directly from `@asym/auth/front-stamp`.
   The front, the dashboards and the assistant's service share the same
   signing and verification functions.
   `tests/unit/front/front-stamp-module.test.ts` pins the identity of the
   re-exports, the one import and the absence of `next` and `@asym/auth/front`
   from every file of `packages/eve-runtime`.

2. **`hmacKey` leaves its return type to inference.** `packages/eve-runtime`'s
   `tsconfig.json` has no DOM library; there `CryptoKey` names a value but not a
   type (TS2749). The inferred type is the same promise of a key in both
   programs. Restoring the annotation breaks the service's typecheck.

3. **What a stamp binds.** A stamp signs the version, the canonical origin the
   visitor used, the dashboard prefix and the issue time in seconds. It is
   valid for 60 seconds and 5 seconds ahead. Nothing verifies unless the
   primary key is at least 32 UTF-8 bytes; the previous key only verifies,
   beside a valid primary, and never rescues an absent or short one. A stamp
   is not bound to the method, path, body or session.

4. **`verifiedStampedOriginForRequest(request, prefix, keys, now?)`** takes a
   Web `Request` and returns the stamped origin only when the stamp verifies
   for `prefix`, the stamped origin's scheme equals that of `request.url`, and
   `x-forwarded-host` is absent or, after ECMAScript `trim()` and
   `toLowerCase()`, equal to the stamped host or to the request's own `host`
   (treated the same way, and only when not empty). A blank value, a list or
   any third host returns `null`. The scheme check keeps a front on one scheme
   from vouching for a service on another; the forwarded-host rule admits what
   the front's external rewrite forwards (the front's name) and what a direct
   call carries (the service's own host). `admitFromFront` keeps its own,
   older check, which has no scheme comparison, because changing the
   dashboards' admission was outside part 3c.

5. **The assistant's service judges the front's writes by the stamp.** Behind
   the front the service sees the staff address as `host` and the front's name
   as `Origin`, so the same-origin rule refused every write.
   `adminEveRouteAuth` (`packages/eve-runtime/src/admin-session-auth.ts`), for a
   cookie-carrying `POST`, `PUT`, `PATCH` or `DELETE` only, calls the helper
   with `"/admin"` and the staff project's `FRONT_STAMP_KEY` and
   `FRONT_STAMP_KEY_PREVIOUS`. With an origin it judges `trustedMutationSource`
   on a header-only copy whose `host` is the stamped host, never reading the
   body; otherwise it applies the rule as before. The JSON rule and the
   session, administrator and ownership checks run on the original request.
   The key, a run-time variable of the staff project, is the gate, not the
   build switch, which the service cannot see at run time: with the key unset,
   as everywhere today, no stamp verifies and nothing changes.

### The assistant's five routes

6. **The front forwards five routes and refuses the rest.** In
   `routeToDashboard` (`front.ts`), after the configuration and name checks, a
   raw `request.nextUrl.pathname` beginning `/admin/eve/v1/` gets the front's
   `404` (`no-store`, no rewrite) if it holds `%` (so the remainder is plain
   text: no `%67ithub`, encoded slash or dot, double or malformed encoding),
   `\`, `//`, or a `.` or `..` segment. Then only `GET health`, `POST session`,
   `POST session/<id>`, `GET session/<id>/stream` and
   `POST session/<id>/cancel` pass, case-sensitive, `<id>` one non-empty
   segment, no trailing slash. Everything else under the prefix is the front's
   `404`: the `github` channel (the provider calls the staff address), the
   callback and connection routes (unauthenticated by design, a token as the
   capability), `info` and other methods. An allowed request goes to
   `<FRONT_ADMIN_ORIGIN>/eve/v1/<rest>` with its query, the usual header
   stripping and the `/admin` stamp.

7. **The mapping follows Vercel, not a local server (ruling 2 (a)).** On Vercel
   `withEve` mounts the service at `^/eve/v1/(.*)$` of the staff deployment.
   A local `next dev` or `next start` of the staff app under its base path
   mounts it at `/admin/eve/v1/*`, behind the staff proxy, so the front's rule
   does not reach a local server under the base path. There is no toggle.

### The dashboards' static files (ruling (c) on the gate)

8. **One segment rule for the skip and the rewrite.**
   `DASHBOARD_ASSET_SEGMENT` in `scripts/release/serve-under-paths.mjs`: a
   segment is not empty and is not `.` or `..`. The donor proxy's matcher
   (`apps/donor/proxy.ts`, a literal Next.js analyses at build, so it spells
   the rule out for each prefix) skips `/admin/_next/…` and
   `/missionary/_next/…` only when everything after `_next/` is such segments.
   With the switch on, `serveUnderPathsDonorRewrites` sends
   `/<prefix>/_next/:path(<rule>)+` to the dashboard's origin, same path.
   Vercel's router tests the matcher and the rewrites on the raw path before it
   resolves dots, and an external rewrite's destination collapses `..`: a skip
   or rewrite of `/admin/_next/../../…` would pass a donor page without the
   donor proxy with the switch off and, with it on, reach
   `<staff origin>/eve/v1/*` ahead of the staff proxy, outside decision 6.
   `tests/unit/front/front-static-matcher.test.ts` runs both through Next.js's
   own compilers on raw paths and pins that they agree. The matcher is
   case-sensitive and a rewrite's source is not, so `/Admin/_next/…` runs the
   donor proxy and is then rewritten; the dashboards serve `_next/*` without
   their proxy and read nothing the donor proxy would have set.

## Owned elsewhere

- **N6:** a caller already holding an administrator's session calling
  `<staff origin>/eve/v1/*` directly with a forged `Origin`; one person's rows
  in several organizations sending another organization's scope headers
  through one name (the service ignores the name, see
  [0015](0015-organization-from-the-verified-name.md) decision 9); the public
  `/eve/v1/health`; the unchanged `/_next/` and `/maplibre/` skips.
  The front consults the verified-name lookup once before stamping a dashboard request (ADR 0015). Production builds accept the path switch. Operations owns activation and requires convergence across the three builds (environment runbook section 5.8).
