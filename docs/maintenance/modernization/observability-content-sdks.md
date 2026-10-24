# Observability and content SDK checkpoint

Core pins Sentry 11.9.0, html-react-parser 6.1.9, isomorphic-dompurify 4.6.0,
Resend 6.34.1 and Stripe.js 10.1.0. React Stripe 7.0.0 remains current and
compatible. The [release freeze](observability-content-sdks-current-releases.json)
records the refreshed official metadata and exact tarball integrity.

The [current local qualification](observability-content-sdks-current-qualification.json)
binds runtime commit `ec1b281aec7b2dd9f2e57ec9e69a4c3e0a8b9582`, after integrating
develop `0026bcbe8b601586c29bba422675ce5889edd7b1`. Its 274 focused behavior
tests, all 15 uncached workspace typechecks and six SDK fixture typechecks pass.
The earlier full preflight passed all three production builds and 9,067 tests
across 967 files; the existing 53 tests in six files remained skipped. Its clean
checkout installed 1,942 packages with frozen resolution, a fresh private cache,
normal hooks and no source or lock drift. These installation and full-preflight
receipts bind the earlier runtime commit below; the dependency graph is unchanged.
Doctor still accepts the same 293 exact exceptions with zero actionable findings;
Shadscan remains 48/100 with unchanged application floors.

The full preflight ran on integrated execution HEAD
`abf71411ceda1066d212ec77a52d7ae893b5320f` with the qualified source changes.
The normal commit preserved all 25 reviewed inputs as runtime commit
`7a5fbc17cb42d0531541ba702df99bb8759160f6`; build Git/release metadata identifies
that earlier execution HEAD. The later review corrections add release-placeholder
fallback and receiving-ID validation, and retain default Sentry integrations in
the privacy fixtures. Their separate RED/GREEN and independent-review receipts
are recorded in the current qualification.

CI, deployed previews and final review readbacks must bind the release commit.
PR #2214 remains open for manual merge under the owner's delivery instruction. Local
builds use synthetic configuration and Eve artifacts; they do not establish live
provider delivery, authentication flows or production activation. The wider
AI, payment, legal, editor and security modernization remains separately scoped.

## Monitoring behavior

All ten initializers share an explicit collection policy. Automatic identity,
cookies, HTTP bodies, GenAI input/output, MCP input/output, queue arguments,
database query data and GraphQL document/variable collection are disabled.
Both Referer spellings are denied in every runtime, alongside existing header
and query rules. Existing manual tenant/user tags, capture hooks, replay
sampling, static trace lifecycle and disabled profiling remain unchanged.

Real Node and browser SDK envelopes, with default integrations retained, preserve
useful context without the fixture's runtime secret values. A real-client
regression also checks resolved MCP and queue collection options. This is a
configuration proof; the fixture does not dispatch MCP or queue operations.
Production tracing can register those integrations when matching modules load,
so adding such a path requires emitted-payload privacy qualification.
Sentry 11.9 preserves Cache Components
tracing by keeping request trace metadata out of prerendered shells; see its
[official release](https://github.com/getsentry/sentry-javascript/releases/tag/11.9.0).

The shared builder uses the supported debug-statement exclusion API and SDK
release-name injection. Self-named environment placeholders fall through to the
next valid release source or Git SHA; valid explicit names keep their precedence.
Source-map upload and release creation/finalization
require the existing build-only token. Diagnostics telemetry is disabled.
The wiring verifier exercises absent-token and synthetic-token configuration;
no maps or fixture telemetry are sent during local qualification.

## Content, email and browser payments

The actual parser and sanitizer run in server and client tests. The existing
string input and HTML-only profile remove scripts, executable URLs and hostile
markup while preserving ordinary content and formatting. The sanitizer resolves
to DOMPurify 3.4.17. Its mode and public rendering contract stay unchanged.

The real Resend SDK rejects tampered or stale webhook signatures. Core validates
receiving and attachment IDs before constructing the SDK client: only nonempty
ASCII alphanumeric, underscore and hyphen path segments are accepted. Encoded
separators, backslashes and whitespace are rejected; valid UUID and opaque IDs
retain their exact request URLs and response mapping. Existing request,
idempotency, timeout and retry contracts pass; local tests send no email.

Concurrent callers exercise both public Stripe.js loader exports against one
intercepted script. Each caller retains its own key. Existing Elements/key
rotation, attempt ownership and succeeded-only confirmation checks pass. Backend
Stripe API versions, payment-method restrictions and request serialization belong
to the separate payment cutover.

## Dependency graph and historical evidence

Fresh baseline and candidate audit feeds cover the complete locked graph. This
cohort changes 22 package records across five workspace records and introduces
no advisory pair. Three DOMPurify advisory pairs disappear: the graph moves from
57 affected entries / 113 pairs to 56 entries / 110 pairs. The cohort's required
and optional closures contain no affected version. Four owners share one
Sentry 11.9 module; both Stripe.js owners share one module.

These are range and dependency-ownership results. The peer-expanded Sentry graph
still reaches the separately tracked Braces tooling finding, and other owning
families remain open. This checkpoint grants no unreachability exception,
override or claim that the entire repository is vulnerability-free.

The [archived earlier guide](archive/observability-content-sdks-before-current-develop.md)
and three original qualification/release JSON records retain dated baseline,
RED/GREEN and intended-stack evidence. They no longer own active version or
integration guidance. The current qualification records exactly which checks
were rerun, including one blocked local `data:` fetch and permitted compiler IPC;
no external wire event was observed, and the Node guard is not an OS firewall.
