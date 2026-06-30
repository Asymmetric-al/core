---
name: inngest-api
description: Use when inspecting or operating Inngest accounts, environments, keys, webhooks, app syncs, function invocations, runs, or traces through the Inngest CLI alpha REST API wrapper. Covers `npx inngest-cli@latest alpha api`, Cloud Production with `--prod`, local/custom API targets, authentication environment variables, safe secret handling, JSON body flags, and run/debug workflows.
---

# Inngest API CLI

Use the alpha API CLI when the user needs account/environment operations,
webhook management, app syncs, direct function invocation, or Cloud/local run
inspection from Codex.

Because this command is alpha, verify the current interface before relying on
memorized flags:

```bash
npx inngest-cli@latest alpha api --prod --help
npx inngest-cli@latest alpha api <command> --help
```

If the user asks about CLI agent experience, product friction, or why an agent
is stuck, also read [agent-friction.md](references/agent-friction.md).

## Secret Handling

- Prefer credentials from environment variables: `INNGEST_API_KEY`,
  `INNGEST_SIGNING_KEY`, and `INNGEST_ENV`.
- Do not write keys into source files, docs, committed `.env` files, or command
  examples.
- Avoid `--api-key <secret>` in shell commands because it exposes the key in the
  transcript and process list.
- If the user must provide a key interactively, ask them to set
  `INNGEST_API_KEY` in their shell/session and confirm when it is available.
- Never print API keys, event keys, or signing keys in the final answer. When
  listing key resources, redact sensitive token values.

## Targeting

By default, the command targets the local dev server.

```bash
# Local dev server
npx inngest-cli@latest alpha api health

# Inngest Cloud Production
npx inngest-cli@latest alpha api --prod get-account

# Branch/customer environment in Cloud
INNGEST_ENV=staging npx inngest-cli@latest alpha api --prod get-webhooks

# Custom API origin
npx inngest-cli@latest alpha api --api-host http://127.0.0.1 --api-port 8288 health
```

Common target/auth flags:

- `--prod`: target Inngest Cloud Production unless `--api-host` or `--api-port`
  is set.
- `--api-host`, `--api-port`: target a custom API server.
- `--config`: read target configuration from an Inngest config file.
- `--timeout`: adjust HTTP timeout.
- `--env`: send `X-Inngest-Env`, or use `INNGEST_ENV`.
- `--api-key`: Bearer token, or use `INNGEST_API_KEY`.
- `--signing-key`: Bearer token, or use `INNGEST_SIGNING_KEY`.
- `--raw`: print the response body without JSON formatting.

For env-scoped write operations, do not rely on implicit production targeting.
Set `INNGEST_ENV` or pass `--env` explicitly and confirm the target environment
before running `create-webhook`, `sync-app`, `invoke-function`, or `patch-env`.

## Command Map

Account and environment:

- `health`: `GET /health`
- `get-account`: `GET /account`
- `get-account-envs`: `GET /envs`, supports `--cursor` and `--limit`
- `create-env`: `POST /envs`, supports `--id`, `--name`, `--body`,
  `--body-file`
- `patch-env`: `PATCH /envs/{id}`, supports `--id`, `--is-archived`,
  `--body`, `--body-file`

Keys and webhooks:

- `get-account-event-keys`: `GET /keys/events`, supports `--cursor`,
  `--limit`
- `get-account-signing-keys`: `GET /keys/signing`, supports `--cursor`,
  `--limit`
- `get-webhooks`: `GET /env/webhooks`, supports `--cursor`, `--limit`
- `create-webhook`: `POST /env/webhooks`, supports `--name`,
  `--event-filter`, `--transform`, `--response`, `--body`, `--body-file`

Apps, functions, and runs:

- `sync-app`: `POST /apps/{app_id}/syncs`, supports `--app-id`, `--url`,
  `--body`, `--body-file`
- `invoke-function`: `POST /apps/{app_id}/functions/{function_id}/invoke`,
  supports `--app-id`, `--function-id`, `--data`, `--idempotency-key`,
  `--body`, `--body-file`
- `get-function-run`: `GET /runs/{run_id}`, supports `--run-id`,
  `--include-output`
- `get-function-trace`: `GET /runs/{run_id}/trace`, supports `--run-id`,
  `--include-output`

Current discovery limitation: the alpha CLI does not expose `list-apps`,
`list-functions`, or `list-runs`. If the user has not provided the required
`app_id`, `function_id`, or `run_id`, first explain that the CLI cannot
discover those IDs yet and ask for the ID or an alternate source such as the
dashboard.

## Workflows

### Authenticated Smoke Test

When validating a provided API key or a new CLI install, start with low-risk
read-only calls:

```bash
npx inngest-cli@latest alpha api --prod get-account
npx inngest-cli@latest alpha api --prod get-account-envs --limit 5
```

These confirm that authentication, Cloud targeting, and account/environment
access work before making changes such as app syncs, webhooks, or invocations.

### Inspect a Failed Production Run

1. Confirm the user has provided `INNGEST_API_KEY` through the environment, not
   in source files or visible command text.
2. If using a branch environment, set or pass `INNGEST_ENV`.
3. Fetch run metadata first:

   ```bash
   npx inngest-cli@latest alpha api --prod get-function-run --run-id <run_id>
   ```

4. Fetch the trace when step-level detail is needed:

   ```bash
   npx inngest-cli@latest alpha api --prod get-function-trace --run-id <run_id> --include-output
   ```

5. Summarize failed steps, retry state, error messages, and likely code changes.
   Do not paste large raw traces unless the user asks.

### Sync an App

Use `sync-app` when validating Cloud registration for an app URL and you already
know the app ID. The current command shape is a re-sync for an existing app, not
a first-time "register this serve URL" workflow.

```bash
npx inngest-cli@latest alpha api --prod sync-app --app-id <app_id> --url https://example.com/api/inngest
```

After sync, inspect the response for registration errors and compare them to the
project's `serve()` endpoint, `INNGEST_SIGNING_KEY`, and deployed URL.

### Invoke a Function

Use direct invocation for manual smoke tests or operational one-offs.

```bash
npx inngest-cli@latest alpha api --prod invoke-function \
  --app-id <app_id> \
  --function-id <function_id> \
  --idempotency-key <stable_test_key> \
  --data '{"example":true}'
```

Prefer stable idempotency keys for repeatable tests. For complex payloads, use
`--body-file` to avoid escaping mistakes.

### Manage Webhooks

Before creating a webhook, list existing webhooks to avoid duplicates:

```bash
npx inngest-cli@latest alpha api --prod get-webhooks
```

For `create-webhook`, prefer a body file when transforms, filters, or response
templates contain quotes or multiline strings.

## Output Handling

- Default output is formatted JSON. Use `--raw` only when a downstream tool
  needs the exact response body.
- Parse JSON with a structured tool when making decisions from CLI output.
- Keep terminal summaries concise: account/env names, IDs, statuses, and
  actionable errors are usually enough.
- Paginated list responses include a `page` object. If `page.hasMore` is true,
  continue with `--cursor <cursor>` when the user needs complete results.
- Empty list responses may omit `data`; treat a missing `data` field as an empty
  list unless an error is present.
- Webhook URLs and decrypted signing keys are secrets. Redact them in summaries
  and never write them to docs, source files, or committed fixtures.

## Agent Experience Notes

The CLI is suitable for Codex usage because common failure modes are concise and
actionable:

- Missing or invalid Cloud auth returns `401 Unauthorized` with `access_denied`;
  first verify a key was actually provided, then ask the user to provide or
  rotate `INNGEST_API_KEY` through the environment.
- Missing required path flags fail before a network request, for example
  `missing required --run-id`.
- A missing local dev server explains that `inngest dev` should be started or
  `--prod` should be used for Cloud.
- Unknown environments return `404 Not Found` with `env_not_found`; list
  environments with `get-account-envs` before retrying.
- `--raw` returns compact JSON and is still parseable; prefer default formatted
  JSON for human summaries.
- Subcommand `--help` may hide inherited target/auth flags; check the top-level
  `alpha api --help` when target or auth behavior is unclear.

Treat `create-env`, `patch-env`, `create-webhook`, `sync-app`, and
`invoke-function` as mutating or side-effecting operations. Use read-only checks
first, then confirm intent and target environment before running them.

## This Repository

These upstream Inngest instructions are vendored for agent tooling and
integration work in this monorepo.

## Repository Triggers

Use this skill when `inngest-api` matches the current Inngest task. If the
right skill is unclear, start with `docs/ai/skills/inngest/SKILL.md`.

## Repository Workflow

1. Confirm whether the request is agent-tooling guidance or product runtime
   integration.
2. Use `inngest-brownfield-audit` before changing existing app workflows or
   fragile background work.
3. Follow this upstream guidance under OpenSpec, root `AGENTS.md`, repo
   rulebooks, framework docs, and runtime evidence.
4. Keep runtime packages, app code, migrations, and `INNGEST_*` env
   requirements out of agent-tooling-only changes.

## Repository Checklist

- [ ] The task has explicit product-runtime scope before adding Inngest app code
      or dependencies.
- [ ] Existing workflows were audited before introducing or changing durable
      workflow behavior.
- [ ] Any MCP usage is backed by a running Inngest dev server on the configured
      port.
- [ ] Upstream source and license attribution remain documented in
      `docs/ai/skills/inngest/references/upstream.md`.
