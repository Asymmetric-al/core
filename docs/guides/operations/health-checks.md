# DB Health Checks

## Overview

The admin DB health endpoint verifies two things:

1. The admin Supabase client can be created (`getAdminClient()` is available).
2. The database is reachable by running a lightweight probe query against `tenants` (`select id limit 1`).

This endpoint is designed for operations monitoring and automation checks.

## Endpoint

- **Method**: `GET`
- **Path**: `/api/health/db`
- **App**: Admin app only (`apps/admin`)

## Authentication

Authentication is controlled by `CRON_SECRET`.

- **If `CRON_SECRET` is set**:
  - The request must include `Authorization: Bearer <CRON_SECRET>`.
  - Missing or invalid token returns `401`.
- **If `CRON_SECRET` is unset**:
  - No bearer token is required.

## Response Shape

`/api/health/db` returns the following `HealthStatus` shape for success/failure responses:

```json
{
  "status": "healthy | degraded | unhealthy",
  "timestamp": "ISO-8601 timestamp",
  "checks": {
    "admin_client": {
      "status": "ok | error",
      "latency_ms": 12,
      "error": "optional sanitized message"
    }
  }
}
```

Field notes:

- `status`: Overall endpoint result.
- `timestamp`: Server timestamp at response creation.
- `checks.admin_client.status`: Result of admin client + DB connectivity check.
- `checks.admin_client.latency_ms`: Probe duration in milliseconds (present when a probe runs).
- `checks.admin_client.error`: Sanitized failure detail (no token/connection-string leakage).

All responses include:

- `Cache-Control: no-store`

## Example Responses

### 200 Healthy

```json
{
  "status": "healthy",
  "timestamp": "2026-02-23T12:34:56.789Z",
  "checks": {
    "admin_client": {
      "status": "ok",
      "latency_ms": 9
    }
  }
}
```

### 503 Unhealthy (Admin Client Unavailable)

```json
{
  "status": "unhealthy",
  "timestamp": "2026-02-23T12:34:56.789Z",
  "checks": {
    "admin_client": {
      "status": "error",
      "error": "Admin endpoints are disabled because SUPABASE_SERVICE_ROLE_KEY is not configured."
    }
  }
}
```

### 503 Unhealthy (Query Failed)

```json
{
  "status": "unhealthy",
  "timestamp": "2026-02-23T12:34:56.789Z",
  "checks": {
    "admin_client": {
      "status": "error",
      "latency_ms": 18,
      "error": "Database health check query failed."
    }
  }
}
```

### 401 Unauthorized

`401` is returned when `CRON_SECRET` is configured and bearer auth is missing/invalid.

## Failure Scenarios

Common reasons for unhealthy/unauthorized results:

- `SUPABASE_SERVICE_ROLE_KEY` missing or invalid.
- `NEXT_PUBLIC_SUPABASE_URL` missing or invalid.
- Database unavailable (network/service outage).
- Invalid or missing `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is set.

## Usage

### Vercel Cron

Configure your cron job to call:

- `GET https://<admin-domain>/api/health/db`
- Add `Authorization: Bearer <CRON_SECRET>` if `CRON_SECRET` is configured.

### Uptime Monitors

Point your monitor to `/api/health/db` and alert on:

- Non-`200` status
- Increased `checks.admin_client.latency_ms` over baseline

### curl

Without auth (when `CRON_SECRET` is unset):

```bash
curl -i "https://<admin-domain>/api/health/db"
```

With auth:

```bash
curl -i "https://<admin-domain>/api/health/db" \
  -H "Authorization: Bearer $CRON_SECRET"
```
