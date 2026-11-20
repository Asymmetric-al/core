import { getSupabasePublicConfig } from "./supabase/config";

/**
 * The configured project's session cookie, as supabase-js names it:
 * `sb-<first label of the project's host>-auth-token`. `null` when no project
 * is configured. Another project's cookie on the same host says nothing about
 * who is signed in here (last read of the first release, L2).
 */
export function browserSessionCookieName(): string | null {
  const { url } = getSupabasePublicConfig();
  if (!url) return null;
  try {
    return `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
  } catch {
    return null;
  }
}

/**
 * Who the browser is signed in as now, read synchronously from this
 * project's Supabase session cookie (`browserSessionCookieName`, possibly in
 * `.0`, `.1` … chunks, possibly `base64-` encoded), with no lock and no
 * network (AL-2675, JB1). Another tab's sign-in or sign-out rewrites that
 * cookie, so a document compares it with the person it was loaded for before
 * each scoped request and when the person returns to the tab.
 *
 * - a user id: a session for that person;
 * - `null`: no session cookie (signed out, or an identity the browser cannot
 *   see, such as the E2E bypass's httpOnly cookie);
 * - `undefined`: cannot tell: no document, no configured project, or a
 *   cookie this reader cannot parse.
 */
export function readBrowserSessionUserId(): string | null | undefined {
  if (typeof document === "undefined") return undefined;
  const base = browserSessionCookieName();
  if (!base) return undefined;
  try {
    const jar = new Map<string, string>();
    for (const part of document.cookie.split(";")) {
      const pair = part.trim();
      if (!pair) continue;
      const eq = pair.indexOf("=");
      if (eq <= 0) continue;
      jar.set(pair.slice(0, eq), decodeURIComponent(pair.slice(eq + 1)));
    }
    let raw = jar.get(base);
    if (raw === undefined) {
      const chunks: string[] = [];
      for (let i = 0; jar.has(`${base}.${i}`); i += 1) {
        chunks.push(jar.get(`${base}.${i}`)!);
      }
      raw = chunks.join("");
    }
    if (!raw) return null;
    const json = raw.startsWith("base64-")
      ? decodeBase64Url(raw.slice("base64-".length))
      : raw;
    const session = JSON.parse(json) as { user?: { id?: unknown } } | null;
    const id = session?.user?.id;
    return typeof id === "string" && id ? id : null;
  } catch {
    return undefined;
  }
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
