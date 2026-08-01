import { resolveEveGithubInstallationToken } from "./credentials";

export interface EveGithubResponse<T> {
  body: T;
  status: number;
}

export class EveGithubRequestError extends Error {
  constructor(
    readonly status: number,
    method: string,
    path: string,
  ) {
    super(`GitHub ${method} ${path} failed (${status}).`);
  }
}

export function githubPathPart(value: string): string {
  return encodeURIComponent(value);
}

export async function eveGithubRequest<T>(input: {
  body?: Record<string, unknown>;
  installationId: number;
  method: "GET" | "PATCH" | "POST" | "PUT";
  path: string;
}): Promise<EveGithubResponse<T>> {
  const token = await resolveEveGithubInstallationToken(input.installationId);
  const response = await fetch(`https://api.github.com${input.path}`, {
    method: input.method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "eve-asymmetric",
      "X-GitHub-Api-Version": "2026-03-10",
    },
    body: input.body ? JSON.stringify(input.body) : undefined,
  });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    throw new EveGithubRequestError(response.status, input.method, input.path);
  }
  return { body: body as T, status: response.status };
}
