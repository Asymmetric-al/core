import { createHash, timingSafeEqual } from "node:crypto";

import {
  APP_BASE_PATHS,
  isServeUnderPathsEnabled,
} from "@asym/database/app-base-path";
import { isProductionDeployment } from "@asym/env/target-env";

export const RELEASE_PROOF_HEADER = "x-vercel-protection-bypass";
export const PRODUCTION_ADMIN_ORIGIN = "https://admin.asymmetric.al";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

type SyncEnv = Record<string, string | undefined>;

const digest = (value: string) => createHash("sha256").update(value).digest();

export function carriesReleaseProof(
  request: Request,
  secret: string | undefined,
): boolean {
  const offered = request.headers.get(RELEASE_PROOF_HEADER);
  if (!secret || !offered) return false;
  return timingSafeEqual(digest(offered), digest(secret));
}

export function jobServePath(): string {
  return `${isServeUnderPathsEnabled() ? APP_BASE_PATHS.admin : ""}/api/inngest`;
}

function admittedOrigin(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/" ||
    url.hostname.endsWith(".")
  )
    return null;
  if (url.protocol === "https:") return url.origin;
  if (url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname))
    return url.origin;
  return null;
}

export function jobSyncConfigured(env: SyncEnv): boolean {
  return Boolean(
    env.INNGEST_SERVE_ORIGIN?.trim() || env.INNGEST_SERVE_HOST?.trim(),
  );
}

export function jobSyncOrigin(env: SyncEnv): string | null {
  const production = isProductionDeployment(env);
  const configured = env.INNGEST_SERVE_ORIGIN?.trim();
  const origin = configured
    ? admittedOrigin(configured)
    : production
      ? PRODUCTION_ADMIN_ORIGIN
      : null;
  if (!origin) return null;
  const productionHost = new URL(PRODUCTION_ADMIN_ORIGIN).hostname;
  return !production && new URL(origin).hostname === productionHost
    ? null
    : origin;
}
