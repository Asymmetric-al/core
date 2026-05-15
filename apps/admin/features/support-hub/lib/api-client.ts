"use client";

interface ApiErrorBody {
  error?: string;
}

export const supportApiQueryDefaults = {
  staleTime: 15_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  retry: false,
} as const;

async function readApiError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error ?? `Support Hub request failed with ${response.status}.`;
}

export async function supportApiGet<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(await readApiError(response));
  }
  return (await response.json()) as T;
}

export async function supportApiJson<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await readApiError(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
