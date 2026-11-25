import { safeNextParam } from "@asym/auth/demo-login";
import { frontNotFound } from "@asym/auth/front";
import { NextResponse } from "next/server";

import { isHomeRedirectPath } from "./route-policy";

export const HOME_REDIRECT_FALLBACK_PATH = "/donor-dashboard";

const REDIRECT_PATH = /^\/[A-Za-z0-9._~!$&'()*+,;=:@/-]*$/;

const NEXT_VALUE = /^\/[A-Za-z0-9._~!$&()*+,;=:@/?-]*$/;

const LOOPBACK_SUFFIX = ".localhost";

const LISTENER_PORT = /^[1-9][0-9]{0,4}$/;

const MAX_PORT = 65535;

type Origin = { readonly scheme: "http:" | "https:"; readonly port: string };

export interface HomeRedirectRequestUrl {
  readonly port: string;
  readonly searchParams: URLSearchParams;
}

export function homeRedirectPath(pathname: string): string {
  return REDIRECT_PATH.test(pathname) && isHomeRedirectPath(pathname)
    ? pathname
    : HOME_REDIRECT_FALLBACK_PATH;
}

export function keptNextParam(searchParams: URLSearchParams): string | null {
  const values = searchParams.getAll("next");
  if (values.length !== 1) return null;
  const value = values[0]!;
  if (!NEXT_VALUE.test(value) || value.includes("//")) return null;
  const pathPortion = value.split("?", 1)[0]!;
  if (
    pathPortion
      .split("/")
      .some((segment) => segment === "." || segment === "..")
  ) {
    return null;
  }
  return safeNextParam(value) === value ? value : null;
}

function homeOrigin(home: string, listenerPort: string): Origin | null {
  if (!home.endsWith(LOOPBACK_SUFFIX)) return { scheme: "https:", port: "" };
  if (listenerPort === "" || listenerPort === "80") {
    return { scheme: "http:", port: "" };
  }
  if (!LISTENER_PORT.test(listenerPort) || Number(listenerPort) > MAX_PORT) {
    return null;
  }
  return { scheme: "http:", port: listenerPort };
}

function locationHolds(
  location: string,
  origin: Origin,
  home: string,
  path: string,
  next: string | null,
): boolean {
  try {
    const url = new URL(location);
    if (
      url.href !== location ||
      url.protocol !== origin.scheme ||
      url.username !== "" ||
      url.password !== "" ||
      url.hostname !== home ||
      url.port !== origin.port ||
      url.pathname !== path ||
      url.hash !== ""
    ) {
      return false;
    }
    if (next === null) return url.search === "";
    const keys = [...url.searchParams.keys()];
    return (
      keys.length === 1 &&
      keys[0] === "next" &&
      url.searchParams.get("next") === next
    );
  } catch {
    return false;
  }
}

export function homeRedirect(
  home: string,
  requestUrl: HomeRedirectRequestUrl,
  pathname: string,
): NextResponse {
  const origin = homeOrigin(home, requestUrl.port);
  if (!origin) return frontNotFound();
  const path = homeRedirectPath(pathname);
  const next = keptNextParam(requestUrl.searchParams);
  const port = origin.port === "" ? "" : `:${origin.port}`;
  const query = next === null ? "" : `?next=${encodeURIComponent(next)}`;
  const location = `${origin.scheme}//${home}${port}${path}${query}`;
  if (!locationHolds(location, origin, home, path, next)) {
    return frontNotFound();
  }
  return new NextResponse(null, {
    status: 307,
    headers: {
      location,
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
    },
  });
}
