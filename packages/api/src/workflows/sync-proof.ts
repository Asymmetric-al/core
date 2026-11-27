import { createHash, timingSafeEqual } from "node:crypto";

import {
  APP_BASE_PATHS,
  isServeUnderPathsEnabled,
} from "@asym/database/app-base-path";

export const RELEASE_PROOF_HEADER = "x-vercel-protection-bypass";
export const PRODUCTION_ADMIN_ORIGIN = "https://admin.asymmetric.al";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

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

function canonicalOrigin(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.origin !== value) return null;
  if (url.protocol === "https:") return url.origin;
  if (url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname))
    return url.origin;
  return null;
}

export function jobSyncOrigin(
  env: Record<string, string | undefined>,
): string | null {
  const production = env.VERCEL_ENV === "production";
  const configured = env.INNGEST_SERVE_ORIGIN?.trim();
  const origin = configured
    ? canonicalOrigin(configured)
    : production
      ? PRODUCTION_ADMIN_ORIGIN
      : null;
  return origin === PRODUCTION_ADMIN_ORIGIN && !production ? null : origin;
}
