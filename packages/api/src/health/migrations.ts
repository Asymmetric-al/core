import { createHash, timingSafeEqual } from "node:crypto";

import { resolveDeploymentEnvironment } from "@asym/env/target-env";
import { connection } from "next/server";

import {
  RELEASE_DATABASE_CONTRACT,
  compareMigrationHeads,
  parseBuildMigrationHeads,
  parseReleaseHealth,
  type MigrationHeadComparison,
} from "./release-contract.mjs";

/**
 * The migration-head health check (plan 7.4; WP1). It compares the heads this
 * build was made against with the heads the release job recorded in the
 * database, read through the one read-only health function with the service
 * key. The client comes from ./db.ts, whose single service-key site is the
 * named health-probe entry in docs/security/service-role-client-allowlist.json;
 * this module holds none.
 * The release job promotes a staged deployment only when this answers 200.
 * A database that is ahead passes, so a rolled-back application stays healthy.
 *
 * The route is public. Any caller gets the status and its 200 or 503; the
 * commit, the Supabase project, the environment marker and the heads go only
 * to a caller that sends the deployment-protection bypass header the release
 * job sends, matching the deployment's VERCEL_AUTOMATION_BYPASS_SECRET.
 */

type Surface = "admin" | "donor" | "missionary";

interface RpcClient {
  rpc(name: string): PromiseLike<{
    data: unknown;
    error: { code?: string; message: string } | null;
  }>;
}

export interface RpcClientResult {
  client: RpcClient | null;
  error: string | null;
}

export interface MigrationHealthDeps {
  connection: () => Promise<void>;
  getClient: () => RpcClientResult;
  readBuildHeads: () => string | undefined;
  readSupabaseUrl: () => string | undefined;
  readRelease: () => { commit: string; environment: string };
  /** The deployment's Protection Bypass for Automation secret, if any. */
  readBypassSecret: () => string | undefined;
}

const NO_STORE = { "Cache-Control": "no-store" } as const;
const ERROR_CODE = /^[A-Za-z0-9_]{1,40}$/;
/** The header the release job sends to reach a protected deployment. */
export const BYPASS_HEADER = "x-vercel-protection-bypass";

const digest = (value: string) => createHash("sha256").update(value).digest();

/** Whether the request carries the deployment's bypass secret; never without one configured. */
function mayReadDetail(
  request: Request | undefined,
  secret: string | undefined,
) {
  const offered = request?.headers.get(BYPASS_HEADER);
  if (!secret || !offered) return false;
  return timingSafeEqual(digest(offered), digest(secret));
}

export function supabaseProjectRefOf(value: string | undefined) {
  if (!value) return null;
  try {
    const host = new URL(value).hostname;
    if (["127.0.0.1", "localhost", "[::1]", "::1"].includes(host))
      return "local";
    return /^([a-z0-9]{20})\.supabase\.co$/.exec(host)?.[1] ?? null;
  } catch {
    return null;
  }
}

const defaultDeps: Omit<MigrationHealthDeps, "getClient"> = {
  connection,
  // Inlined at build time by next.config `env` (scripts/release/migration-heads.mjs).
  // Keep the literal member expression: Next.js replaces only this exact form.
  readBuildHeads: () => process.env.CORE_BUILD_MIGRATION_HEADS,
  readSupabaseUrl: () => process.env.NEXT_PUBLIC_SUPABASE_URL,
  readRelease: () => ({
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.trim() || "unknown",
    environment: resolveDeploymentEnvironment({
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_TARGET_ENV: process.env.VERCEL_TARGET_ENV,
    }),
  }),
  // A Vercel system variable, at build and at run time, once the project has
  // a Protection Bypass for Automation secret.
  readBypassSecret: () => process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
};

export function createMigrationHealthHandler(
  surface: Surface,
  overrides: Pick<MigrationHealthDeps, "getClient"> &
    Partial<MigrationHealthDeps>,
) {
  const deps: MigrationHealthDeps = { ...defaultDeps, ...overrides };
  return async function GET(request?: Request) {
    // Request time always: a response baked in at build would hide the database.
    await deps.connection();
    const detail = mayReadDetail(request, deps.readBypassSecret());
    const respond = (
      status: "ok" | "behind" | "unknown" | "error",
      extra: Record<string, unknown>,
    ) =>
      Response.json(
        detail
          ? {
              status,
              surface,
              checkedAt: new Date().toISOString(),
              release: deps.readRelease(),
              ...extra,
            }
          : { status },
        { status: status === "ok" ? 200 : 503, headers: NO_STORE },
      );

    const { client } = deps.getClient();
    if (!client) {
      return respond("error", { error: { code: "admin_client_unavailable" } });
    }
    const { data, error } = await client.rpc(
      RELEASE_DATABASE_CONTRACT.healthRpc,
    );
    if (error) {
      const code =
        error.code && ERROR_CODE.test(error.code) ? error.code : "rpc_failed";
      return respond("error", { error: { code } });
    }
    let health;
    try {
      health = parseReleaseHealth(data);
    } catch {
      return respond("error", { error: { code: "malformed_release_health" } });
    }
    const comparison: MigrationHeadComparison = compareMigrationHeads(
      parseBuildMigrationHeads(deps.readBuildHeads()),
      health.heads,
    );
    return respond(comparison.status, {
      database: {
        supabaseProjectRef: supabaseProjectRefOf(deps.readSupabaseUrl()),
        environment: health.environment,
      },
      migrations: comparison.ledgers,
    });
  };
}
