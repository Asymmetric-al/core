import { createSign } from "node:crypto";

import { connectGitHubCredentials } from "@vercel/connect/eve";

import type { GitHubChannelCredentials } from "eve/channels/github";

function encodeJwtPart(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function createAppJwt(appId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeJwtPart({ alg: "RS256", typ: "JWT" });
  const payload = encodeJwtPart({ exp: now + 540, iat: now - 60, iss: appId });
  const unsigned = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256")
    .update(unsigned)
    .end()
    .sign(privateKey.replaceAll("\\n", "\n"), "base64url");
  return `${unsigned}.${signature}`;
}

const connectUid = process.env.EVE_GITHUB_CONNECT_UID?.trim();

export const eveGithubCredentials: GitHubChannelCredentials | undefined =
  connectUid ? connectGitHubCredentials(connectUid) : undefined;

interface CachedToken {
  expiresAt: number;
  token: string;
}

const tokenCache = new Map<number, CachedToken>();

export async function resolveEveGithubInstallationToken(
  installationId: number,
): Promise<string> {
  const cached = tokenCache.get(installationId);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const supplied = eveGithubCredentials?.installationToken;
  if (supplied) {
    return typeof supplied === "function" ? supplied() : supplied;
  }

  const appId = process.env.GITHUB_APP_ID?.trim();
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.trim();
  if (!appId || !privateKey) {
    throw new Error("Eve GitHub App credentials are unavailable.");
  }
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${createAppJwt(appId, privateKey)}`,
        "User-Agent": "eve-asymmetric",
        "X-GitHub-Api-Version": "2026-03-10",
      },
    },
  );
  if (!response.ok) {
    throw new Error(
      `GitHub installation authentication failed (${response.status}).`,
    );
  }
  const body = (await response.json()) as {
    expires_at?: unknown;
    token?: unknown;
  };
  if (typeof body.token !== "string") {
    throw new Error("GitHub installation authentication returned no token.");
  }
  const expiresAt =
    typeof body.expires_at === "string"
      ? Date.parse(body.expires_at)
      : Date.now() + 5 * 60_000;
  tokenCache.set(installationId, { expiresAt, token: body.token });
  return body.token;
}
