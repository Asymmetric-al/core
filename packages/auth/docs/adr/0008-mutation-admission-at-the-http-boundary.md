# 0008. Writes are admitted or refused the same way at the HTTP boundary

**Status:** Recorded on 2026-11-22 from code comments in `packages/auth`
([#2751](https://github.com/Asymmetric-al/core/issues/2751)). It describes the
code as it is and ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md).

## Context

`admitApiMutation` in `mutation-admission.ts` is the first step of the proxy
that `createAuthMiddleware` in `middleware.ts` builds. It runs before any route
handler, the shared JSON reader or Payload sees the request. It checks writes
(`POST`, `PUT`, `PATCH` and `DELETE`). It first percent-decodes the path and
answers 400 when that fails, whatever the path. For a path under `/api/` or
`/web-studio/api` it then checks where the request came from, then its media
type. It
decides from headers alone, because Next hands the proxy a body stream for every
write whether or not any bytes follow. Web Studio runs Payload, whose error
responses have the shape `{ errors: [{ message }] }`, while Core's own API
routes answer `{ error }`.

## Decisions

1. **A write with no media type is admitted only when its framing headers say it
   has no body.** `isEmptyWrite` in `mutation-admission.ts` calls a write empty
   when it has no `Transfer-Encoding` header and its `Content-Length` header is
   absent or `0`. Once its source is accepted, `admitApiMutation` lets such a
   write through without a `Content-Type`. The body stream cannot decide this,
   because Next gives the proxy a stream for every write. Next's Node server
   speaks HTTP/1.1, where a request with neither header has no body: any bytes
   after its headers are parsed as the next request, so no route on that server
   reads them as this request's body. Over HTTP/2 or HTTP/3 a body needs no
   length header, so the shared JSON reader checks the bytes itself (decision
   3). Cited: RFC 9112, section 6.3.

2. **Every refusal on a Web Studio API path uses Payload's error shape.**
   `admitApiMutation` in `mutation-admission.ts` answers a refused write under
   `/web-studio/api` with `{ errors: [{ message }] }` and one under `/api/` with
   `{ error }`. This holds for the 403 refusal of an untrusted origin, the 415
   refusal of an unsupported media type, and the 400 answer to a path that
   cannot be percent-decoded. That last check has no decoded path to test, so it
   tests the raw path for the `/web-studio/api` prefix. A Web Studio client
   therefore meets the same error shape on every refusal there. Cited: fix check
   M4.

3. **The proxy and the shared JSON reader refuse an unsupported body with the
   same message.** `UNSUPPORTED_MUTATION_TYPE` in `request-headers.ts` is the
   text of the proxy's 415. The shared JSON reader behind the proxy,
   `ensureJsonBody` in `packages/api/src/shared/http-errors.ts`, uses the same
   text for its own 415, which it raises when a body that is not declared as
   JSON turns out to contain bytes. The proxy judges by headers and the reader
   by the bytes it reads, so either one can be the layer that refuses a write,
   and the client gets the same status and message from both, though a route
   may add other fields to the body. Web Studio's GraphQL route was retired in
   WP6 part 2a (AL-2679).
