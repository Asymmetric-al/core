# `inngest api` Command Reference

Complete flag reference for every `inngest api` subcommand, captured from CLI v1.27.0. The CLI itself is authoritative: `npx inngest-cli@latest api <command> --help`.

```
inngest api [target/auth flags] <command> [endpoint flags]
```

## Shared flags (every command)

**Auth**

| Flag                   | Env var                | Purpose                                                     |
| ---------------------- | ---------------------- | ----------------------------------------------------------- |
| `--api-key string`     | `$INNGEST_API_KEY`     | API key sent as a Bearer token (`sk-inn-api-...`)           |
| `--signing-key string` | `$INNGEST_SIGNING_KEY` | Signing key sent as a Bearer token (alternative to API key) |
| `--env string`         | `$INNGEST_ENV`         | Environment name sent as `X-Inngest-Env`                    |

**Target**

| Flag                 | Purpose                                                         |
| -------------------- | --------------------------------------------------------------- |
| (default)            | Local dev server on the default port (8288)                     |
| `--prod`             | Inngest Cloud Production (unless `--api-host`/`--api-port` set) |
| `--api-host string`  | Custom API host/origin; may include `/api/v2` or `/v2`          |
| `--api-port int`     | Custom API port (e.g., dev server on a fallback port)           |
| `--config string`    | Path to an Inngest configuration file                           |
| `--timeout duration` | HTTP request timeout (default 30s)                              |

**Output**

| Flag    | Purpose                                     |
| ------- | ------------------------------------------- |
| `--raw` | Print response body without JSON formatting |

Commands that POST/PATCH also accept `--body string` (raw JSON body; field flags override matching keys) and `--body-file string` (path to JSON file, or `-` for stdin).

---

## Runs and debugging

### `get-function-run [<run-id>]` — `GET /runs/{run_id}`

Canonical run summary: status, timing, trigger, app/function IDs, optional output.

| Flag               | Type   | Notes                                    |
| ------------------ | ------ | ---------------------------------------- |
| `--run-id`         | string | Or pass as positional arg                |
| `--include-output` | bool   | Include the run's output (default false) |

### `get-function-trace [<run-id>]` — `GET /runs/{run_id}/trace`

Full trace tree: every step span with status, timing, step op, and (optionally) input/output.

| Flag               | Type   | Notes                                       |
| ------------------ | ------ | ------------------------------------------- |
| `--run-id`         | string | Or positional                               |
| `--include-output` | bool   | Include step inputs/outputs (default false) |

### `get-event-runs [<event-id>]` — `GET /events/{event_id}/runs`

All function runs triggered by an event. Paginated.

| Flag               | Type   | Notes                                    |
| ------------------ | ------ | ---------------------------------------- |
| `--event-id`       | string | Or positional                            |
| `--include-output` | bool   | Include run outputs                      |
| `--limit`          | int    | Per page, min 1, max 40                  |
| `--cursor`         | string | Pagination cursor from previous response |

## Invocation and syncs

### `invoke-function [<app-id>] [<function-id>]` — `POST /apps/{app_id}/functions/{function_id}/invoke`

| Flag                     | Type   | Notes                                                   |
| ------------------------ | ------ | ------------------------------------------------------- |
| `--app-id`               | string | The app containing the function (or positional)         |
| `--function-id`          | string | The function to invoke (or positional)                  |
| `--data`                 | string | JSON object: input data for the function                |
| `--idempotency-key`      | string | Dedupe duplicate requests within the idempotency period |
| `--body` / `--body-file` | string | Raw JSON body alternative                               |

Responses: `201` completed synchronously (`result` populated), `202` enqueued (`runId` to poll), `409` idempotency key already used, `422` rate limited/debounced/skipped.

### `sync-app [<app-id>]` — `POST /apps/{app_id}/syncs`

| Flag       | Type   | Notes                                   |
| ---------- | ------ | --------------------------------------- |
| `--app-id` | string | Or positional                           |
| `--url`    | string | URL of the app's Inngest serve endpoint |

`422` means the sync itself failed; the response body still contains the sync result with an `error.code`/`error.message`.

## Account, environments, keys

### `get-account` — `GET /account`

No flags. Returns the authenticated account (id, name, email, timestamps).

### `get-account-envs` — `GET /envs`

| Flag       | Type   | Notes             |
| ---------- | ------ | ----------------- |
| `--limit`  | int    | Min 1, max 250    |
| `--cursor` | string | Pagination cursor |

### `create-env` — `POST /envs`

| Flag     | Type   | Notes            |
| -------- | ------ | ---------------- |
| `--id`   | string | Environment ID   |
| `--name` | string | Environment name |

### `patch-env [<id>]` — `PATCH /envs/{id}`

| Flag            | Type   | Notes                                 |
| --------------- | ------ | ------------------------------------- |
| `--id`          | string | Environment to update (or positional) |
| `--is-archived` | bool   | true to archive, false to unarchive   |

### `get-account-event-keys` — `GET /keys/events`

### `get-account-signing-keys` — `GET /keys/signing`

| Flag       | Type   | Notes             |
| ---------- | ------ | ----------------- |
| `--limit`  | int    | Min 1, max 100    |
| `--cursor` | string | Pagination cursor |

Both filter by environment via `--env` / `X-Inngest-Env`; without it, the default production environment's keys are returned.

## Webhooks

### `get-webhooks` — `GET /env/webhooks`

| Flag       | Type   | Notes             |
| ---------- | ------ | ----------------- |
| `--limit`  | int    | Min 1, max 100    |
| `--cursor` | string | Pagination cursor |

Requires environment targeting (`--env` / `X-Inngest-Env`).

### `create-webhook` — `POST /env/webhooks`

| Flag             | Type   | Notes                                                                            |
| ---------------- | ------ | -------------------------------------------------------------------------------- |
| `--name`         | string | Descriptive name                                                                 |
| `--transform`    | string | Inline JS transform function for incoming events                                 |
| `--response`     | string | Optional inline JS function answering GET requests                               |
| `--event-filter` | string | Optional event filtering config (`{"events": [...], "filter": "ALLOW"\|"DENY"}`) |

## Insights (SQL over execution data)

### `get-insights-tables` — `GET /insights/tables`

No flags. Lists tables queryable via the Insights query endpoint.

### `get-insights-event-schemas` — `GET /insights/events/schemas`

| Flag       | Type   | Notes             |
| ---------- | ------ | ----------------- |
| `--limit`  | int    | Min 1, max 100    |
| `--cursor` | string | Pagination cursor |

Paginated list of event type schemas (shape of each event's data as nested JSON).

### `query-insights` — `POST /insights/query`

| Flag      | Type   | Notes                                 |
| --------- | ------ | ------------------------------------- |
| `--query` | string | The query, in modified ClickHouse SQL |

### `query-insights-prompt` — `POST /insights/query/prompt`

| Flag       | Type   | Notes                                                 |
| ---------- | ------ | ----------------------------------------------------- |
| `--prompt` | string | Natural-language description of the query to generate |

Returns SQL. Review before executing with `query-insights`.

> The Insights endpoints are newer than the published OpenAPI spec and may not appear at api-docs.inngest.com yet. The CLI help is the reference.

## Misc

### `health` — `GET /health`

No flags. Returns `{"data": {"status": "ok"}}`. Use it to probe whether your target (dev server or Cloud) is reachable before running other commands.
