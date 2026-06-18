# @asym/docraptor-client

Phase 36 server-only DocRaptor REST client, async execution helpers, PDF
metadata/profile request mapping, and Phase 43 secret-redaction hardening for
the Asym PDF Document Builder.

## Purpose

This package owns DocRaptor API calls for the PDF builder package set:

- synchronous PDF rendering
- asynchronous render job creation
- status polling
- test and production mode selection
- request timeouts and caller abort signals
- normalized DocRaptor and network errors
- app-layer idempotency metadata
- async render retry/backoff orchestration
- async callback payload normalization
- partial async result summaries
- redacted structured logs
- PDF metadata and PDF/A or PDF/UA profile request mapping

It is the only package in this repo that should talk directly to DocRaptor.
It remains private while the package APIs mature.

## Public API Promise

Current root exports:

- `createDocRaptorClient`
- `DocRaptorClient`
- `DocRaptorClientConfig`
- `DocRaptorRenderRequest`
- `DocRaptorSyncRenderResult`
- `DocRaptorAsyncRenderJob`
- `DocRaptorAsyncRenderStatus`
- `DocRaptorClientError`
- `DocRaptorClientErrorCode`
- `DocRaptorIdempotencyMetadata`
- `executeDocRaptorAsyncRender`
- `classifyDocRaptorRenderError`
- `calculateDocRaptorRetryDelay`
- `normalizeDocRaptorAsyncCallbackPayload`
- `summarizeDocRaptorAsyncRenderExecutions`
- `DocRaptorAsyncRenderExecutionResult`
- `DocRaptorAsyncRetryPolicy`
- `DocRaptorStructuredLogEntry`
- `docraptorClientBoundary`
- `DocRaptorClientBoundary`

The client uses DocRaptor's REST API directly. It posts JSON to `/docs`,
authenticates with HTTP Basic auth using the API key as the username and a
blank password, and polls async jobs through `/status/{status_id}`.
Phase 36 maps schema-owned `pdfMetadata.title` to DocRaptor
`prince_options.pdf_title` and supported `pdfProfile.profile` values to
`prince_options.profile`. Other metadata should be present in the print HTML
metadata tags produced by `@asym/pdf-renderer`.

DocRaptor references:

- https://docraptor.com/documentation/api/making_documents
- https://docraptor.com/documentation/api
- https://docraptor.com/documentation/api/status_codes

## Usage

```ts
import { createDocRaptorClient } from '@asym/docraptor-client';

const docraptor = createDocRaptorClient({
  apiKey: process.env.DOCRAPTOR_API_KEY ?? '',
  mode: 'test',
});

const result = await docraptor.renderSync({
  html: '<!doctype html><html><body>Preview</body></html>',
  name: 'Donation receipt preview',
  baseUrl: 'https://assets.example.test/receipts/',
  pdfMetadata: {
    title: 'Donation Receipt',
    subject: 'Gift receipt',
    author: 'Finance Team',
    organization: 'Asymmetric Giving',
    language: 'en-US',
    keywords: ['donation', 'receipt'],
  },
  pdfProfile: {
    profile: 'PDF/A-3a',
  },
  idempotency: {
    key: 'tenant/template-version/data-hash/preview',
    scope: 'preview',
  },
});

await savePdf(result.pdf);
```

## Modes

`mode` defaults to `test` so local and preview usage does not accidentally
create billable production renders. Production render callers must explicitly
create a client with `mode: 'production'`.

## Timeouts And Abort

`defaultTimeoutMs` defaults to `60_000`. Individual requests can pass
`timeoutMs` and `signal`. Timeout errors use code `timeout` and are retryable.
Caller aborts use code `aborted` and are not retryable.

## Idempotency Metadata

DocRaptor does not expose a first-class idempotency key in the REST API. This
package keeps idempotency metadata in result objects for app-layer render job
tracking. When a request does not provide an explicit DocRaptor `tag`, the
idempotency key is sent as the DocRaptor `tag` for log correlation only.

## Async Execution And Retry

`executeDocRaptorAsyncRender` is a server-only orchestration helper around the
low-level async client methods. It creates an async DocRaptor job, stores the
status ID in the returned result, polls until completion, classifies transient
and permanent failures, retries transient failures with deterministic backoff,
normalizes caller cancellation, preserves idempotency metadata, and emits
redacted structured logs.

The helper does not create queue jobs, store render records, download PDFs, or
persist artifacts. Platform adapters decide how to map the returned execution
result to batch jobs, render metadata, audit events, and storage.

`normalizeDocRaptorAsyncCallbackPayload` defines the package callback payload
contract for future callback-based integrations without requiring a queue or
network dependency inside tests.

Phase 43 hardens structured log redaction. Async execution logs redact
configured secret values, Bearer tokens, Stripe-style key shapes, AWS key
shapes, secret-like key/value pairs, and signed URL query parameters before
they are returned or emitted to an injected logger.

## Server-Only Contract

This package has no browser export path and includes a runtime guard that
throws in browser-like environments. It does not read environment variables,
store credentials, or expose API keys in normalized errors. Applications should
provide the API key from server-side configuration.

## Non-goals

- No React editor UI.
- No full template preflight.
- No renderer or print-shell coupling.
- No claim that requested PDF/A or PDF/UA profiles prove accessibility
  compliance.
- No browser preview implementation.
- No database persistence, queue implementation, PDF artifact storage, or PDF
  download handling.
- No tenant storage, auth, queue, or core app imports.

## Maturity

`phase-36-accessibility-metadata` plus Phase 43 security audit hardening. The
package is private to prevent accidental publication before the separate core
integration and release decision process.

## Development

```sh
pnpm --filter @asym/docraptor-client build
pnpm --filter @asym/docraptor-client typecheck
pnpm --filter @asym/docraptor-client test
```

Later `Asymmetric-al/core` support may add Bun or different task runners, but
this fork follows the current pnpm, Turbo, TypeScript, Vitest, and tsdown
toolchain first.
