# Inngest v2 REST API Reference

Condensed from the official OpenAPI spec (v2.0.0). The live spec is always authoritative and machine-readable: **https://api-docs.inngest.com/api-specs/v2.json**. Human docs: https://api-docs.inngest.com/ (append `.md` to any page URL for markdown; index at `/llms.txt`).

## Base URLs

| Environment      | URL                            |
| ---------------- | ------------------------------ |
| Inngest Cloud    | `https://api.inngest.com/v2`   |
| Local dev server | `http://localhost:8288/api/v2` |

## Authentication

`Authorization: Bearer <key>` on every request (the local dev server requires no key).

| Key type    | Format             | Works on                                                                                                                                                       |
| ----------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API key     | `sk-inn-api-...`   | v2 only. For everything outside your app: CI/CD, scripts, AI tools. Created at app.inngest.com/settings/api-keys (org admins only). Can be environment-scoped. |
| Signing key | `signkey-prod-...` | v1 and v2. Per-environment, found in environment settings.                                                                                                     |

Environment targeting for non-production Cloud environments: `X-Inngest-Env: <env-name>` header. Required for the webhook endpoints; optional filter for key listings.

## Conventions

- **Success envelope:** `{"data": <payload>, "metadata": {"fetchedAt": <ts>, "cachedUntil": <ts|null>}}`
- **List envelope:** adds `"page": {"cursor": <string>, "hasMore": <bool>, "limit": <int>}` — pass `cursor` as a query param to fetch the next page until `hasMore` is false.
- **Error envelope:** `{"errors": [{"code": <string>, "message": <string>}]}`
- **Common statuses:** 401 unauthorized, 403 insufficient permissions, 404 not found, 409 conflict/idempotency, 422 business-logic rejection (rate limited, debounced, skipped, sync failed), 429 API rate limit exceeded, 500 server error.
- IDs for runs and events are ULIDs (e.g., `01KTCTWT8XDEGWDMVX3Q9M69ND`).

## Enums

| Enum                 | Values                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------- |
| Run status           | `QUEUED`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED` (`UNSPECIFIED` reserved)          |
| Span status          | `RUNNING`, `COMPLETED`, `FAILED`, `WAITING`, `CANCELLED`, `SKIPPED` (`UNKNOWN` reserved)  |
| Step op              | `RUN`, `SLEEP`, `WAIT_FOR_EVENT`, `INVOKE`, `SEND_EVENT`, `AI_GATEWAY`, `WAIT_FOR_SIGNAL` |
| Environment type     | `PRODUCTION`, `TEST`, `BRANCH`                                                            |
| Webhook event filter | `ALLOW`, `DENY`                                                                           |

---

## Runs

### `GET /runs/{runId}` — Get function run

Canonical run summary.

- Path: `runId` (required)
- Query: `includeOutput` (bool)

Response `data`:

```
id, status, queuedAt, startedAt, endedAt, durationMs,
app: { id },
function: { id, name },
trigger: { eventName, eventIds[], isBatch, batchId, cronSchedule },
output (when includeOutput=true)
```

### `GET /runs/{runId}/trace` — Get function trace

Trace tree for a run. The root span represents the function; `children` are the steps.

- Path: `runId` (required)
- Query: `includeOutput` (bool — include step inputs/outputs)

Response `data`:

```
runId,
rootSpan: {
  id, name, status, stepId, stepOp,
  queuedAt, startedAt, endedAt, durationMs,
  input, output,
  metadata: [{ kind, scope, updatedAt, values }],
  children: [ <same span shape, recursive> ]
}
```

Find the failure: filter `rootSpan.children[]` (and nested `children`) for `status == "FAILED"` and read `output`.

### `GET /events/{eventId}/runs` — Get event runs

Runs triggered by an event. Paginated.

- Path: `eventId` (required)
- Query: `includeOutput` (bool), `limit` (1–40), `cursor`

Response `data`: array of run summaries (same shape as `GET /runs/{runId}`).

## Functions

### `POST /apps/{appId}/functions/{functionId}/invoke` — Invoke function

- Path: `appId`, `functionId` (required) — these are the IDs from your code (client `id`, `createFunction` `id`)
- Body:

```json
{ "data": { ... }, "idempotencyKey": "optional-string" }
```

Responses:

- `201` — completed synchronously. `data`: `runId`, `queuedAt`, `startedAt`, `completedAt`, `result` (JSON string), `error`.
- `202` — enqueued asynchronously. Same shape; poll `GET /runs/{runId}`.
- `409` — idempotency key already used. `422` — rejected by flow control (rate limit, debounce, skip). `429` — API rate limit, request not executed.

## Apps

### `POST /apps/{appId}/syncs` — Sync app

Sync an app at the provided serve URL (e.g., after a deploy).

- Path: `appId` (required)
- Body: `{ "url": "https://myapp.com/api/inngest" }`

Response `data`: `id`, `appId`, `status`, `error: { code, message }`. A `422` still returns this shape with `error` populated — the sync was attempted and failed.

## Environments

### `GET /envs` — List environments

- Query: `limit` (1–250), `cursor`
- Response `data`: array of `{ id, name, type (PRODUCTION|TEST|BRANCH), isArchived, createdAt }`

### `POST /envs` — Create environment

- Body: `{ "id": "...", "name": "..." }`
- Response `201` with the created environment.

### `PATCH /envs/{id}` — Update environment

- Path: `id` (required)
- Body: `{ "isArchived": true|false }` (only provided fields are modified)

## Webhooks

Both require the `X-Inngest-Env` header.

### `GET /env/webhooks` — List webhooks

- Query: `limit` (1–100), `cursor`
- Response `data`: array of `{ id, name, url, environment, transform, response, eventFilter: { events[], filter (ALLOW|DENY) }, createdAt, updatedAt }`

### `POST /env/webhooks` — Create webhook

- Body:

```json
{
  "name": "descriptive name",
  "transform": "inline JS transform for incoming events",
  "response": "optional inline JS answering GET requests",
  "eventFilter": { "events": ["..."], "filter": "ALLOW" }
}
```

- `201` with the created webhook (including its `url`). `409` if a webhook with the same URL exists.

## Keys

### `GET /keys/events` — List account event keys

### `GET /keys/signing` — List account signing keys

- Query: `limit` (1–100), `cursor`
- Header: `X-Inngest-Env` (optional — defaults to production keys)
- Response `data`: array of `{ id, name, key, environment, createdAt }`

These return key material. Treat output as secret; don't echo into logs.

## Account

### `GET /account` — Get account

Response `data`: `{ id, name, email, createdAt, updatedAt }`. Useful as an auth smoke test for Cloud keys.

## Partner API

For partners managing sub-accounts only.

### `GET /partner/accounts` — List partner accounts

- Query: `limit` (1–1000), `cursor`

### `POST /partner/accounts` — Create partner account

- Body: `{ "name": "...", "email": "..." }`
- Response `201` includes the new sub-account's `apiKey`.

## Insights

> Newer than the published OpenAPI spec; documented from the CLI. See [cli-commands.md](cli-commands.md#insights-sql-over-execution-data).

| Endpoint                       | Purpose                                                   |
| ------------------------------ | --------------------------------------------------------- |
| `GET /insights/tables`         | Tables available to query                                 |
| `GET /insights/events/schemas` | Paginated event payload schemas (`limit` 1–100, `cursor`) |
| `POST /insights/query`         | `{ "query": "<modified ClickHouse SQL>" }`                |
| `POST /insights/query/prompt`  | `{ "prompt": "<natural language>" }` → returns SQL        |

## Health

### `GET /health`

`{"data": {"status": "ok"}}` — reachability probe, no auth required on the dev server.

---

## v1 API (still available)

v1 lives at `https://api.inngest.com/v1` (signing-key auth) and covers surfaces v2 doesn't yet: listing events, fetching a single event, cancelling a run, bulk cancellations (create/list/delete), run jobs, resuming signals, and webhook get/update/delete. When v2 lacks an operation, check the v1 docs at https://api-docs.inngest.com/v1 before declaring it impossible.
