# 0009. Log the cause of an access failure without logging the error

**Status:** Recorded on 2026-11-22 from code comments in `packages/auth`
([#2751](https://github.com/Asymmetric-al/core/issues/2751)). It describes the
code as it is and ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md).

## Context

When the proxy cannot read the memberships needed to admit a tenant page, Mission Control and the missionary workspace send the person to `/no-access`. The page does not say whether the database rejected the request or the connection failed. The server needs that distinction, but a raw error can include messages or data that do not belong in a log. Neither inspecting the error nor writing the log should affect who gets access.

## Decisions

1. **Report membership read failures in every environment; keep other diagnostics in preview.** In `packages/auth/access-diagnostics.ts`, `reportAccessDiagnostic` calls `reportMembershipReadFailure` for each `membership_query_failed` report before it checks the environment. That reporter writes an error event with a fixed reason, code and failure class. Only an unprotected preview also gets a warning with a predefined stage, outcome and safe code. Neither event includes an identity, a row or the error message. Cited: [council round 2, AR6](../../../../docs/audits/core-crm-cms-database-implementation-record.md#11-council-reviews).

2. **Classify errors without serializing them.** In `packages/auth/access-diagnostics.ts`, `READ_FAILURE_CLASSES` maps known database codes to fixed classes. Only listed codes appear verbatim; an unknown code becomes `other`. A missing, null or empty code is logged as `null`. Only then does `uncodedFailureClass` inspect the name and message. `AbortError` and `TimeoutError` count as timeouts, including when the client puts either name and a colon at the start of its message. A `TypeError` with the message `fetch failed`, or the exact message `TypeError: fetch failed`, counts as a connection failure. Everything else is `other`. This distinguishes a timeout from a lost connection without copying arbitrary text to the log.

3. **Let diagnostics fail without changing the authorization result.** In `packages/auth/access-diagnostics.ts`, `safeErrorCode` returns `other` if a preview error's code cannot be inspected. `reportMembershipReadFailure` likewise falls back to `other` for both code and class if a property read throws. It catches errors from `console.error`, and `reportAccessDiagnostic` catches errors from `console.warn`. A broken reporter cannot turn a refusal into a different outcome.
