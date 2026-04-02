"use client";

import { createBrowserClient } from "@asym/database/supabase";

function readSupabaseSessionCookieValue() {
  if (typeof document === "undefined") {
    return null;
  }

  const sessionCookies = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const separatorIndex = cookie.indexOf("=");
      if (separatorIndex === -1) {
        return null;
      }

      return {
        name: cookie.slice(0, separatorIndex),
        value: cookie.slice(separatorIndex + 1),
      };
    })
    .filter(
      (
        cookie,
      ): cookie is {
        name: string;
        value: string;
      } => Boolean(cookie),
    )
    .filter((cookie) => /^sb-.*-auth-token(?:\.\d+)?$/.test(cookie.name));

  if (!sessionCookies.length) {
    return null;
  }

  const chunkedCookies = sessionCookies.filter((cookie) =>
    /\.\d+$/.test(cookie.name),
  );

  if (chunkedCookies.length) {
    return chunkedCookies
      .sort((leftCookie, rightCookie) => {
        const leftIndex = Number.parseInt(
          leftCookie.name.split(".").pop() ?? "0",
          10,
        );
        const rightIndex = Number.parseInt(
          rightCookie.name.split(".").pop() ?? "0",
          10,
        );

        return leftIndex - rightIndex;
      })
      .map((cookie) => cookie.value)
      .join("");
  }

  return sessionCookies[0]?.value ?? null;
}

function readAccessTokenFromSupabaseCookie() {
  const cookieValue = readSupabaseSessionCookieValue();
  if (!cookieValue) {
    return null;
  }

  try {
    const decodedCookieValue = cookieValue.startsWith("base64-")
      ? atob(cookieValue.slice("base64-".length))
      : decodeURIComponent(cookieValue);
    const parsedCookieValue = JSON.parse(decodedCookieValue) as {
      access_token?: string;
    };

    return parsedCookieValue.access_token ?? null;
  } catch {
    return null;
  }
}

export async function createSupabaseAuthHeaders(
  initialHeaders?: HeadersInit,
): Promise<Headers> {
  const headers = new Headers(initialHeaders);
  const cookieAccessToken = readAccessTokenFromSupabaseCookie();

  if (cookieAccessToken) {
    headers.set("Authorization", `Bearer ${cookieAccessToken}`);
    return headers;
  }

  const supabase = createBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

export async function fetchWithSupabaseAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const headers = await createSupabaseAuthHeaders(init?.headers);

  return fetch(input, {
    ...init,
    headers,
  });
}
