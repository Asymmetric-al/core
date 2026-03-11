import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    admin_client: {
      status: "ok" | "error";
      latency_ms?: number;
      error?: string;
    };
  };
}

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
} as const;

function sanitizeErrorMessage(
  message: string | null | undefined,
  fallback: string,
): string {
  if (!message) {
    return fallback;
  }

  return message
    .replace(/\b(?:postgres(?:ql)?|mysql):\/\/\S+/gi, "[redacted-connection]")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [redacted]")
    .replace(
      /\b(?:sk_live_|rk_live_|ghp_|github_pat_)[A-Za-z0-9_]+/gi,
      "[redacted-token]",
    );
}

function jsonNoStore(body: HealthStatus | null, status: number) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return jsonNoStore(null, 401);
    }
  }

  const { client, error } = getAdminClient();
  if (!client) {
    const payload: HealthStatus = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      checks: {
        admin_client: {
          status: "error",
          error: sanitizeErrorMessage(
            error,
            "Admin client is unavailable for health checks.",
          ),
        },
      },
    };

    return jsonNoStore(payload, 503);
  }

  const startedAtMs = Date.now();
  const { error: queryError } = await client
    .from("tenants")
    .select("id")
    .limit(1);
  const latencyMs = Date.now() - startedAtMs;

  if (queryError) {
    const payload: HealthStatus = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      checks: {
        admin_client: {
          status: "error",
          latency_ms: latencyMs,
          error: sanitizeErrorMessage(
            queryError.message,
            "Database health check query failed.",
          ),
        },
      },
    };

    return jsonNoStore(payload, 503);
  }

  const payload: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      admin_client: {
        status: "ok",
        latency_ms: latencyMs,
      },
    },
  };

  return jsonNoStore(payload, 200);
}
