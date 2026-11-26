import { NextResponse, type NextRequest } from "next/server";

import { frontNotFound } from "./front";
import { ownOriginUrl } from "./middleware";

export interface ConfigRedirect {
  readonly source: string;
  readonly destination: string;
  readonly permanent: boolean;
}

export interface ConfigRedirectMatch {
  readonly destination: string;
  readonly permanent: boolean;
  readonly params: Readonly<Record<string, string>>;
}

const REST_PARAM = /^:([A-Za-z_][A-Za-z0-9_]*)\*$/;
const PATTERN_PARAM = /^:([A-Za-z_][A-Za-z0-9_]*)\((.+)\)$/;
const NAMED_PARAM = /^:([A-Za-z_][A-Za-z0-9_]*)$/;

function asciiLower(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
}

function matchSource(
  source: string,
  pathname: string,
): Record<string, string> | null {
  const pattern = source.split("/");
  const path = pathname.split("/");
  const params: Record<string, string> = {};
  for (const [index, part] of pattern.entries()) {
    const rest = REST_PARAM.exec(part);
    if (rest) {
      if (index !== pattern.length - 1) return null;
      const remainder = path.slice(index);
      if (remainder.at(-1) === "") return null;
      params[rest[1]!] = remainder.join("/");
      return params;
    }
    const segment = path[index];
    if (segment === undefined) return null;
    const patterned = PATTERN_PARAM.exec(part);
    if (patterned) {
      if (!new RegExp(`^(?:${patterned[2]})$`, "i").test(segment)) return null;
      params[patterned[1]!] = segment;
      continue;
    }
    const named = NAMED_PARAM.exec(part);
    if (named) {
      if (segment === "") return null;
      params[named[1]!] = segment;
      continue;
    }
    if (asciiLower(segment) !== asciiLower(part)) return null;
  }
  return path.length === pattern.length ? params : null;
}

function compileDestination(
  destination: string,
  params: Readonly<Record<string, string>>,
): string {
  const parts: string[] = [];
  for (const part of destination.split("/")) {
    const rest = REST_PARAM.exec(part);
    if (rest) {
      const value = params[rest[1]!] ?? "";
      if (value !== "") parts.push(value);
      continue;
    }
    const named = NAMED_PARAM.exec(part);
    parts.push(named ? (params[named[1]!] ?? "") : part);
  }
  const compiled = parts.join("/");
  return compiled === "" ? "/" : compiled;
}

export function matchConfigRedirect(
  redirects: readonly ConfigRedirect[],
  pathname: string,
): ConfigRedirectMatch | null {
  for (const redirect of redirects) {
    const params = matchSource(redirect.source, pathname);
    if (params) {
      return {
        destination: compileDestination(redirect.destination, params),
        permanent: redirect.permanent,
        params,
      };
    }
  }
  return null;
}

function redirectWithin(
  request: NextRequest,
  destination: string,
  status: 307 | 308,
): NextResponse {
  if (destination.includes("\\") || destination.startsWith("//")) {
    return frontNotFound();
  }
  const target = ownOriginUrl(
    request,
    `${destination}${request.nextUrl.search}`,
  );
  return target ? NextResponse.redirect(target, status) : frontNotFound();
}

export function answerAdmittedRedirect(
  request: NextRequest,
  redirects: readonly ConfigRedirect[],
  accepts: (match: ConfigRedirectMatch) => boolean = () => true,
): NextResponse | null {
  const { pathname } = request.nextUrl;
  const matched = matchConfigRedirect(redirects, pathname);
  if (matched && accepts(matched)) {
    return redirectWithin(
      request,
      matched.destination,
      matched.permanent ? 308 : 307,
    );
  }
  if (pathname !== "/" && pathname.endsWith("/")) {
    return redirectWithin(request, pathname.slice(0, -1), 308);
  }
  return null;
}
