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

   Without `INNGEST_DEV=1` the SDK defaults to Cloud mode and `/api/inngest`
   returns a 500 ("in cloud mode but no signing key").

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
   npx --ignore-scripts=false inngest-cli@latest dev -u http://localhost:3030/api/inngest
   ```

4. Open the dev server UI at `http://localhost:8288`. The
   `asym-core-workflows` app should appear under Apps with the
   `workflow-smoke` function discovered.

## Smoke check

- **Endpoint discovery:** `curl http://localhost:3030/api/inngest` returns
  function metadata (`function_count` ≥ 1) while `INNGEST_DEV=1` is set.
- **No-op run:** in the dev server UI, invoke `workflow-smoke` with a safe
  tenant-scoped envelope (no secrets, identifiers only):

  ```json
  {
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

- **Unit tests:** `bunx vitest run tests/unit/packages/api/workflows/` covers
  envelope validation, the no-op function, and the dispatch adapter without a
  running dev server.

## Production note

Production uses Inngest Cloud with `INNGEST_EVENT_KEY` and
`INNGEST_SIGNING_KEY` set through the deployment platform's secret store.
`INNGEST_DEV` must never be set in production.
