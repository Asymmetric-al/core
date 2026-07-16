# Twenty CRM Non-Production Twenty Proof

> **Note (2026-07-06):** Twenty CRM has since been retired (ADR-0001); this
> file records the state as of its date.

Date: 2026-05-09

Environment: isolated local Docker Compose stack, project `asymtwentyproof`, scratch path `/tmp/asym-twenty-proof`.

## Scope

This proof used the official Twenty Docker Compose topology from `twentyhq/twenty` with the server exposed locally on `http://127.0.0.1:55440`.

The initial webhook receiver attempt used Twenty's default `OUTBOUND_HTTP_SAFE_MODE_ENABLED=true`, which blocks private/internal IP webhook targets. The final webhook signing pass used the same isolated local stack with `OUTBOUND_HTTP_SAFE_MODE_ENABLED=false` for the server and worker so a local receiver at `http://host.docker.internal:55445/twenty-webhook` could capture the request. Production and shared development should keep outbound safe mode enabled and use a routable HTTPS receiver.

Services proven:

- Twenty server: `twentycrm/twenty:latest`
- Twenty worker: `twentycrm/twenty:latest`
- Postgres: `postgres:16`
- Redis: `redis:latest`
- Local storage volume: `asymtwentyproof_server-local-data`
- Database volume: `asymtwentyproof_db-data`

Image digests captured during the run:

- `twentycrm/twenty@sha256:06dfce40f62d1f5b1aebe2d5a05cad0c629177ab456b70c8bf7bdf2f48f52ad`
- `postgres@sha256:972eeb4e0a5fee4c3046cf868896719227e845aa9e38ff79a353efb3b2b2c10a`
- `redis@sha256:9ec28b9626938ae5dd565f3371fafd78d432cc049da5865726cd411dfb196c8d`

No production domains, production credentials, or production data were used.

## Commands And Results

| Check                   | Evidence                                                                                                                                                 | Result                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Compose startup         | `docker compose -p asymtwentyproof -f /tmp/asym-twenty-proof/docker-compose.yml up -d`                                                                   | PASS                                                                        |
| Service status          | `docker compose -p asymtwentyproof -f /tmp/asym-twenty-proof/docker-compose.yml ps`                                                                      | server/db/redis healthy; worker running                                     |
| HTTP health             | `curl -i http://127.0.0.1:55440/healthz`                                                                                                                 | `200`, `{"status":"ok"}`                                                    |
| Redis health            | `docker exec asymtwentyproof-redis-1 redis-cli ping`                                                                                                     | `PONG`                                                                      |
| Server logs             | `docker logs --tail 80 asymtwentyproof-server-1`                                                                                                         | Nest app started; REST, metadata, OAuth, webhook, and GraphQL routes mapped |
| Worker logs             | `docker logs --tail 80 asymtwentyproof-worker-1`                                                                                                         | Worker started and processed BullMQ jobs                                    |
| Browser smoke           | Playwright opened `http://127.0.0.1:55440` and saved `/tmp/asym-twenty-proof/twenty-home.png`                                                            | PASS                                                                        |
| Workspace activation    | Playwright signed up `twenty-proof@example.com`, activated workspace `Asym CRM Proof`, and saved `/tmp/asym-twenty-proof/twenty-workspace-created.png`   | PASS                                                                        |
| API auth required       | Unauthenticated `/rest/metadata/objects` and `/rest/open-api/metadata` returned `403 Missing authentication token`                                       | PASS                                                                        |
| Authenticated API read  | Browser login token used only in-process; `GET /rest/companies?limit=1` returned `200` with company data                                                 | PASS                                                                        |
| API key creation        | Authenticated `POST /rest/metadata/apiKeys` with Admin `roleId` returned `201` for proof API key rows                                                    | PASS                                                                        |
| Outbound write          | Authenticated `POST /rest/companies` returned `201`; DB confirmed `Asym CRM Proof Company` in the workspace schema                                       | PASS                                                                        |
| Webhook route and queue | Authenticated `POST /rest/metadata/webhooks` returned `201`; worker logged `CallWebhookJob`, receiver captured the request, and HMAC verification passed | PASS                                                                        |
| Local storage           | `docker volume inspect asymtwentyproof_server-local-data`; server storage path contained workspace/application directories                               | PASS                                                                        |
| Backup                  | `docker exec asymtwentyproof-db-1 pg_dump -U postgres -d default --format=custom --file=/tmp/twenty-proof-after-runtime.dump`                            | PASS                                                                        |
| Restore                 | Restored `/tmp/asym-twenty-proof/twenty-proof-after-runtime.dump` into `asym_twenty_restore_pg` with `pg_restore`                                        | PASS                                                                        |
| Restore validation      | Restored DB had 62 core tables, 28 workspace tables, 1 workspace row, 2 API-key rows, and 9 company rows                                                 | PASS                                                                        |
| Failure recovery        | `docker restart asymtwentyproof-server-1 asymtwentyproof-worker-1`; server health recovered and worker resumed jobs                                      | PASS                                                                        |

## Database Evidence

After workspace activation and REST writes, the live Twenty database reported:

```text
core_tables      62
workspace_tables 28
workspace_rows    1
api_key_rows      2
company_rows      9
```

The restored database reported:

```text
core_tables           62
workspace_tables      28
workspace_rows         1
api_key_rows           2
restored_company_rows  9
```

The active workspace row was:

```text
displayName      Asym CRM Proof
activationStatus ACTIVE
```

## Webhook Signature Evidence

The first webhook receiver attempt proved queue selection but did not capture a payload because Twenty's default outbound safe mode blocks internal/private destinations. The final pass disabled safe mode only in the isolated local proof stack and captured the webhook request at `/tmp/asym-twenty-proof/webhook-receiver.ndjson`.

```text
POST /rest/metadata/webhooks -> 201
POST /rest/companies -> 201
Captured method       POST
Captured URL          /twenty-webhook
Timestamp header      present
Signature header      present
Nonce header          present
Payload eventName     company.created
Payload record name   Asym Webhook Proof 1778314165710
Signature valid       true
```

The signature check recomputed Twenty's HMAC contract from the image source:

```text
sha256(secret, `${timestamp}:${JSON.stringify(payload)}`)
```

The recomputed value matched `X-Twenty-Webhook-Signature`.

## Conclusion

Phase 00 non-production infrastructure is proven for startup, health, authenticated API reads, API-key creation, outbound REST writes, signed webhook delivery, worker processing, local storage, backup/restore, and restart recovery.
