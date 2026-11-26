import {
  compile,
  pathToRegexp,
  regexpToFunction,
  type Key,
} from "next/dist/compiled/path-to-regexp";
import { describe, expect, it } from "vitest";

import { legacyRedirects as staffRedirects } from "../../../../apps/admin/lib/legacy-redirects";
import { matchConfigRedirect } from "../../../../packages/auth/legacy-redirects";

type Redirect = { source: string; destination: string; permanent: boolean };

function nextMatch(redirects: readonly Redirect[], pathname: string) {
  for (const redirect of redirects) {
    const keys: Key[] = [];
    const regexp = pathToRegexp(redirect.source, keys, {
      delimiter: "/",
      sensitive: false,
      strict: true,
    });
    const matched = regexpToFunction<Record<string, string | string[]>>(
      regexp,
      keys,
    )(pathname);
    if (matched) {
      const to = compile(redirect.destination, { validate: false })(
        matched.params,
      );
      return {
        destination: to === "" ? "/" : to,
        permanent: redirect.permanent,
      };
    }
  }
  return null;
}

function mine(redirects: readonly Redirect[], pathname: string) {
  const matched = matchConfigRedirect(redirects, pathname);
  return matched
    ? { destination: matched.destination, permanent: matched.permanent }
    : null;
}

const STAFF_PATHS = [
  "/mc",
  "/MC",
  "/mc/",
  "/mc/x",
  "/Mc/X",
  "/mc/x/y",
  "/mc/x/",
  "/mc/%2F%2Fevil.com",
  "/mcx",
  "/mc-old",
  "/x/mc",
  "/api/media/file",
  "/api/media/file/a.png",
  "/API/Media/File/a.png",
  "/api/media/file/a/b.png",
  "/api/media/file/a.png/",
  "/api/media/files/a.png",
  "/web-studio/api/media/file/a.png",
  "/",
  "/donors",
];

describe("the staff proxy's matcher agrees with Next.js's on the configuration table", () => {
  it.each(STAFF_PATHS)("%s", (pathname) => {
    expect(mine(staffRedirects, pathname)).toEqual(
      nextMatch(staffRedirects, pathname),
    );
  });

  it("keeps the staff table's four rules, all temporary", () => {
    expect(staffRedirects).toEqual([
      { source: "/mc", destination: "/", permanent: false },
      { source: "/mc/", destination: "/", permanent: false },
      { source: "/mc/:path*", destination: "/:path*", permanent: false },
      {
        source: "/api/media/file/:path*",
        destination: "/web-studio/api/media/file/:path*",
        permanent: false,
      },
    ]);
  });

  it("matches a remainder with an empty segment, so the proxy can refuse its destination", () => {
    expect(matchConfigRedirect(staffRedirects, "/mc//evil.com")).toEqual({
      destination: "//evil.com",
      permanent: false,
      params: { path: "/evil.com" },
    });
  });
});
