# Inngest workflows: local development

How to run the Inngest dev server against this repo without exposing secrets.
See `openspec/changes/add-inngest-durable-workflow-executor/` for the runtime
scope and `docs/guides/features/inngest-workflows/*.md` for workflow designs.

## Prerequisites

- The Mission Control app (`apps/admin`) serves workflow functions at
  `/api/inngest` (thin re-export of `@asym/api/workflows/serve`).
- No Inngest keys are required in local development. Never commit values for
  `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, or `INNGEST_SIGNING_KEY_FALLBACK`.

## Run the app and dev server

1. Add dev mode to the repo-root `.env.local` (gitignored):

   ```env
   INNGEST_DEV=1
   ```

   Without `INNGEST_DEV=1` the SDK defaults to Cloud mode. Dev mode lets the
   local server sync and execute workflows without a signing key.

   > **Troubleshooting:** if `/api/inngest` still reports cloud mode after
   > adding the variable to `.env.local`, set it on the dev process directly:
   > `INNGEST_DEV=1 bun run dev:admin`. The SDK reads the variable at route
   > handler runtime, which can miss root dotenv loading in some sandboxes.

2. Start the Mission Control app:

   ```bash
   bun run dev:admin
   ```

3. Start the Inngest dev server, pointing it at the admin app:

   ```bash
   bun run dev:workflows
   ```

   This uses the exact CLI release owned by the root script, binds to loopback
   and discovers only the explicit Mission Control endpoint. The first run
   downloads the versioned upstream binary. Requalify this launcher and the
   local MCP endpoint together when changing the workflow cohort.
   This launcher is qualified on Linux amd64 in approved WSL. Windows and
   macOS require separate platform qualification; Windows ZIP extraction
   remains under advisory review.

   The script uses `npm exec` because Bun rewrites `npx` inside package scripts
   to `bunx`, which skips the CLI's required native-binary install script.
   `npm exec` resolves transitive dependencies outside `bun.lock` and enables
   that installer explicitly. The captured installer graph and open Windows
   advisory in the [qualification record](../../../maintenance/modernization/workflows.md)
   require rechecking before a release; this checkpoint does not accept that
   remaining risk.

4. Open the dev server UI at `http://127.0.0.1:8288`. The
   `asym-core-workflows` app should appear under Apps with the
   `workflow-smoke` function discovered.

## Smoke check

- **Endpoint discovery:** `curl http://localhost:3030/api/inngest` returns
  function metadata (`function_count` ≥ 1) while `INNGEST_DEV=1` is set.
- **No-op run:** in the dev server UI, send this event with a safe tenant-scoped
  envelope (no secrets, identifiers only):

  ```json
  {
    "name": "workflows/smoke.requested",
    "data": {
      "tenantId": "11111111-1111-4111-8111-111111111111",
      "workflowName": "workflows/smoke.requested",
      "schemaVersion": 1,
      "subject": { "type": "workflow_smoke", "id": "smoke-1" }
    }
  }
  ```

  The run completes with `acknowledged: true` and produces no business side
  effects.

- **Unit tests:** `bun run test:unit -- tests/unit/packages/api/workflows/` covers
  envelope validation, the no-op function, and the dispatch adapter without a
  running dev server.

## Local process restarts

Restart the app while keeping the dev server running when testing SDK deployment
recovery. Completed step results and pending waits live in the orchestrator,
outside the app process.

Stopping the dev server discards its in-memory execution state. The optional
`--persist` flag retains SQL history; it does not make local in-flight workflows
survive a dev-server restart. Core production uses Inngest Cloud. Recheck this
local limitation against the selected CLI release before relying on different
restart behavior.

## Production note

Production uses Inngest Cloud with `INNGEST_EVENT_KEY` and
`INNGEST_SIGNING_KEY` set through the deployment platform's secret store.
`INNGEST_DEV` must never be set in production.
