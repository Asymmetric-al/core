# Archived SDK qualification before current develop integration

Historical evidence only. The [active SDK guide](../observability-content-sdks.md)
and its current qualification supersede the intended-stack status below.

Captured from commit `7a5fbc17cb42d0531541ba702df99bb8759160f6`,
`docs/maintenance/modernization/observability-content-sdks.md`; original SHA256
`0bda6d3c3f01118f3d444ceb9ee2c5260789cb150f5ab82a05b444f04b222bbf`. The original bytes remain available at that Git identity.
No old result below establishes qualification for a later release.

---

# Observability and content SDK checkpoint

The [current qualification of the local stack](../observability-content-sdks-integration-qualification.json)
records the intended Dnd/Skill50/SDK candidate at
`5fd05c10b7b255e76d2a419449637068a21a2ba4`. Fresh focused checks pass
259 tests across 27 files, all 15 consumer typechecks without cache reads, the
six-file fixture typecheck, lint, Sentry wiring and lock/workspace/toolchain guards.
Strict Doctor accepts 293 exact exceptions with zero actionable findings;
Shadscan passes at 43/61/47 against unchanged 43/59/47 floors. Source and quality
review accepted the bounded implementation and its 35 approved hash updates.

These results bind the local intended stack. Actual develop integration,
subsequent qualification, full preflight, exact-head CI, hosted previews and
publication remain open. The earlier three controlled app builds and graph/audit
analysis remain dated a45 evidence; they were not rerun for this checkpoint.
The [original qualification](../observability-content-sdks-qualification.json) and
[release freeze](../observability-content-sdks-releases.json) retain their original bytes.

## Dated a45 implementation evidence

The text below retains the original a45 checkpoint. Its references to current
versions, independent review, builds and pending integration describe that dated
record; the successor above owns the checks rerun on the local stack.

This AL-1965 task 7.2 checkpoint updates nine declarations in five manifests.
It is a local implementation awaiting independent review, CI, deployed previews,
and merge. The remaining telemetry/AI work and payment API cutover stay open.

| Package                 | Baseline | Exact candidate           |
| ----------------------- | -------- | ------------------------- |
| @sentry/nextjs          | 11.5.0   | 11.8.0                    |
| html-react-parser       | 6.1.8    | 6.1.9                     |
| isomorphic-dompurify    | 4.5.0    | 4.6.0                     |
| resend                  | 6.32.1   | 6.34.1                    |
| @stripe/stripe-js       | 10.0.0   | 10.1.0                    |
| @stripe/react-stripe-js | 7.0.0    | 7.0.0, maintained current |

[Release metadata](../observability-content-sdks-releases.json) records current
official registry responses and SHA512 tarball integrity. [Qualification](../observability-content-sdks-qualification.json)
binds the lock, checks, source review boundary, and remaining work. The baseline
is develop `a45f56701378726bfc531e56ab6f5be64ff59e53`; the earlier researched
consumer map was compared against this checkout before implementation.
Remote develop advanced to `cc568c92c1cd283d82a4ef9c6d4be7dabe4efee4`
during qualification. Integrating and requalifying on that base remains open;
the local checks bind the recorded a45f5670 checkout and candidate file hashes.

## Monitoring policy and supported build options

Sentry was already on v11. All ten existing initialization paths continue to
use the shared explicit collection policy: no automatic user identity, cookies,
HTTP bodies, GenAI input/output, database query data, or GraphQL document/variable
collection. Static trace lifecycle, profiling disabled, replay integration,
sampling, manual tenant/user tags, and the existing capture hooks are preserved.
The v11 richer defaults are not adopted.

A real SDK regression found that the existing Node RequestData collector
retained credentials inside a Referer query. Each app exports
`captureRequestError`; that SDK hook places incoming headers on
`normalizedRequest`, so this was reachable when server monitoring was enabled.
The supported request-header deny list now filters both `referer` and
`referrer` values in every runtime. It preserves the other header/query rules
and capture hooks. Real Node hook and browser HTTP-context envelopes are
captured with local transports; no Sentry account receives fixture events.
Sentry's browser URL-query improvements are qualified separately from the
repository's whole-header deny. See the official
[data collection controls](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/)
and [11.8 release](https://github.com/getsentry/sentry-javascript/releases/tag/11.8.0).

The shared build options use
`bundleSizeOptimizations.excludeDebugStatements`, supported by webpack and
Turbopack. The unsupported `release.inject` override is removed: the SDK
injects `release.name`. Release-name precedence and auth-token-gated map upload,
release creation/finalization and deploy metadata are preserved. Build
diagnostics telemetry is explicitly disabled. The verifier checks the supported
contract, including the absence of the obsolete flags, without using a token.

## Content, email, and browser payment behavior

The actual sanitizer and parser run together in server rendering and a client
DOM. Hostile scripts, encoded executable URLs, event handlers, iframe/SVG/MathML
payloads and replacement content are removed; ordinary text, HTTPS links,
formatting and styles survive. The production boundary still accepts strings
and uses only `USE_PROFILES: { html: true }`. The
[parser patch](https://github.com/remarkablemark/html-react-parser/releases/tag/v6.1.9)
and [wrapper release](https://github.com/kkomelin/isomorphic-dompurify/releases/tag/4.6.0)
introduce no new HTML product feature or sanitizer mode.

The real Resend SDK verifies locally signed webhooks and rejects tampered or
stale signatures. Dot-segment receiving/attachment IDs fail before the denied
fetch boundary. Existing retry, timeout, idempotency, envelope and downstream
email/workflow tests pass. No email is sent. The
[6.34.1 release](https://github.com/resend/resend-node/releases/tag/v6.34.1)
keeps the existing send and receiving contracts.

The actual Stripe.js loader is exercised with concurrent callers and one
intercepted script in JSDOM. Both public loader exports settle with each caller's
own key. Existing Elements/key rotation, attempt identity, duplicate confirmation
and succeeded-only checkout tests remain binding. React Stripe 7.0.0 is still
the current supported release and accepts Stripe.js 10.x/React 19; it requires
no manufactured version change. The
[10.1 release](https://github.com/stripe/stripe-js/releases/tag/v10.1.0)
fixes shared in-flight loading. This checkpoint does not change the backend
Stripe API, request serialization, payment methods, or admit a payment.

## Graph and security evidence

The refreshed lock changes 22 package rows within this cohort, including the
supported Sentry Cloudflare dependency and DOMPurify 3.4.17. Required/optional
closures have 96 Sentry, 12 parser, 39 sanitizer, 5 Resend, 6 React Stripe and
1 Stripe.js entries; no affected version remains in those closures. Active
workspace links share one Sentry SDK across all four owners and one Stripe.js
module across its two owners. Resolved peers remain compatible.

Using the union of both captured audit feeds, the exact locked graph moves from
58 affected entries / 114 advisory pairs to 57 entries / 111 pairs, with three
DOMPurify 3.4.16 pairs removed and none introduced. This is version/range
evidence, not a claim of previously reachable critical XSS. The audit feed
labels the three removed IDs critical/high/low; the primary DOMPurify owner
labels all three Low and describes non-default mode prerequisites:

- [GHSA-cg2g-xh64-v4q7](https://github.com/cure53/DOMPurify/security/advisories/GHSA-cg2g-xh64-v4q7):
  SAFE_FOR_TEMPLATES plus shadow-root/DOM output modes.
- [GHSA-mrv2-3pqr-j5jr](https://github.com/cure53/DOMPurify/security/advisories/GHSA-mrv2-3pqr-j5jr):
  IN_PLACE plus hooks which detach another subtree.
- [GHSA-c6gr-qvv4-5v3f](https://github.com/cure53/DOMPurify/security/advisories/GHSA-c6gr-qvv4-5v3f):
  XHTML plus explicitly allowed SVG SMIL attributes.

Core's string/html-profile boundary does not enable those modes or hooks.
The entire graph still contains affected inherited dependencies. Peer expansion
also reaches existing Babel, Browserslist and braces findings outside the SDK's
own dependency closure. Payload/Monaco's separate DOMPurify 3.2.7 and the
Inngest/OpenTelemetry owners remain unchanged. No override, vulnerability waiver
or upstream compatibility force is added.

## Qualification boundary

The 130-test baseline passed. Focused candidate checks pass 259 tests across
27 files, including real SDK transports and the public application seams.
All 15 scoped consumer typechecks ran without cache substitution; the six
new/changed SDK fixture files also pass the product TypeScript compiler.
The preexisting server test's untyped jsdom import is outside that supplementary
fixture typecheck; it runs in the focused Vitest checks.

A separate clean baseline install reproduces the browser URL privacy failure.
The new Node header rule, supported builder configuration, Resend dot-segment
validation and Stripe concurrent loader have failing-before/passing-after
evidence. The pure HTML patch retains its passing behavior baseline.

All three real Next production builds pass serially without remote cache
substitution. Each emits a BUILD_ID and leaves the lock unchanged.

Local builds use detached credential inputs and a minimal placeholder child
environment. Source-map upload and application DSNs are absent; Next/build
diagnostics telemetry is disabled. Node fetch/HTTP/HTTPS/net/TLS transports are
denied except the compiler worker's exact argv port on 127.0.0.1; CORE_EVE_BUILD_MODE is set to
artifacts; no full Eve build or runtime/sandbox qualification is claimed. The 64 permitted IPC events and one denied local data-URL fetch
include no external transport attempt. A bounded missionary diagnostic confirms
that the data URL passes through Next's compiled fetch cache. This proves compilation under that
explicit boundary; runtime provider behavior, sandbox qualification, remote
source-map upload, browser qualification, full preflight and exact-head hosted
previews remain separate checks.

Bun 1.4.3's install command ignored `--no-env-file` in a fake-value argument
fixture. Initial install diagnostics showed an env-file load without printing
values or making provider calls. Subsequent Bun commands temporarily move only
this checkout's ignored symlink and restore its identical inode/target metadata
in `finally`. The final cold candidate installation contains no credential
link. The primary credential file and other checkouts remain untouched.
