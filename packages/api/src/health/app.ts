import { createClient } from "@asym/database/supabase/server";

type HealthSurface = "admin" | "donor" | "missionary";
type SupabaseCheck = "ok" | `error: ${string}`;

interface ReleaseMetadata {
  commit: string;
  ref: string;
  environment: string;
  runtime: string;
}

interface AppHealthBody {
  status: "ok" | "degraded";
  checks: {
    supabase: SupabaseCheck;
  };
  observability: {
    surface: HealthSurface;
    checkedAt: string;
    release: ReleaseMetadata;
    supabaseLatencyMs: number | null;
  };
}

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
} as const;

function firstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "unknown";
}

function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/\b(?:postgres(?:ql)?|mysql):\/\/\S+/gi, "[redacted-connection]")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [redacted]")
    .replace(
      /\b(?:sk_live_|sk_test_|rk_live_|ghp_|github_pat_|re_)[A-Za-z0-9_]+/gi,
      "[redacted-token]",
    );
}

function resolveReleaseMetadata(env = process.env): ReleaseMetadata {
  return {
    commit: firstNonEmpty(
      env.VERCEL_GIT_COMMIT_SHA,
      env.SENTRY_RELEASE,
      env.GIT_SHA,
      env.GITHUB_SHA,
      env.NEXT_PUBLIC_GIT_SHA,
    ),
    ref: firstNonEmpty(
      env.VERCEL_GIT_COMMIT_REF,
      env.GIT_REF,
      env.NEXT_PUBLIC_GIT_REF,
    ),
    environment: firstNonEmpty(env.VERCEL_TARGET_ENV, env.VERCEL_ENV),
    runtime: firstNonEmpty(env.NEXT_RUNTIME, env.NODE_ENV),
  };
}

function jsonNoStore(body: AppHealthBody, status = 200) {
  return Response.json(body, { status, headers: NO_STORE_HEADERS });
}

function healthBody(input: {
  surface: HealthSurface;
  status: AppHealthBody["status"];
  supabase: SupabaseCheck;
  supabaseLatencyMs: number | null;
}) {
  return {
    status: input.status,
    checks: {
      supabase: input.supabase,
    },
    observability: {
      surface: input.surface,
      checkedAt: new Date().toISOString(),
      release: resolveReleaseMetadata(),
      supabaseLatencyMs: input.supabaseLatencyMs,
    },
  } satisfies AppHealthBody;
}

function healthyResponse(
  surface: HealthSurface,
  supabaseLatencyMs: number | null,
) {
  return jsonNoStore(
    healthBody({
      surface,
      status: "ok",
      supabase: "ok",
      supabaseLatencyMs,
    }),
  );
}

function degradedResponse(
  surface: HealthSurface,
  message: string,
  supabaseLatencyMs: number | null,
) {
  return jsonNoStore(
    healthBody({
      surface,
      status: "degraded",
      supabase: `error: ${sanitizeErrorMessage(message)}`,
      supabaseLatencyMs,
    }),
    503,
  );
}

export function createAppHealthHandler(surface: HealthSurface) {
  return async function GET() {
    if (process.env.SKIP_ENV_VALIDATION === "1") {
      return healthyResponse(surface, null);
    }

    const startedAt = Date.now();

    try {
      const supabase = await createClient();
      const { error } = await supabase.from("profiles").select("id").limit(1);
      const latencyMs = Date.now() - startedAt;

      if (error) {
        return degradedResponse(surface, error.message, latencyMs);
      }

      return healthyResponse(surface, latencyMs);
    } catch (error) {
      return degradedResponse(
        surface,
        error instanceof Error ? error.message : "unknown supabase error",
        Date.now() - startedAt,
      );
    }
  };
}
