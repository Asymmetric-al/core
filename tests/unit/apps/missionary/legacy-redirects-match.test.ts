import {
  compile,
  pathToRegexp,
  regexpToFunction,
  type Key,
} from "next/dist/compiled/path-to-regexp";
import { describe, expect, it } from "vitest";

import { legacyRedirects as missionaryRedirects } from "../../../../apps/missionary/lib/legacy-redirects";
import { matchConfigRedirect } from "../../../../packages/auth/legacy-redirects";

type Redirect = { source: string; destination: string; permanent: boolean };

const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";

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

const MISSIONARY_PATHS = [
  "/ministry-updates",
  "/Ministry-Updates",
  "/email-studio",
  "/ministry-updates/",
  `/${TA}/ministry-updates`,
  `/${TB}/email-studio`,
  `/${TA.toUpperCase()}/email-studio`,
  `/${TA}~finance/ministry-updates`,
  `/${TA}~FINANCE/ministry-updates`,
  "/feed",
  `/${TA}/feed`,
  `/${TA}/ministry-updates/x`,
  "/not-a-tenant/ministry-updates",
  `/${TA}0/email-studio`,
  "/ministry-updates-old",
];

describe("the missionary proxy's matcher agrees with Next.js's on the configuration table", () => {
  it.each(MISSIONARY_PATHS)("%s", (pathname) => {
    expect(mine(missionaryRedirects, pathname)).toEqual(
      nextMatch(missionaryRedirects, pathname),
    );
  });

  it("names the segmented form's prefix, for the proxy's name filter", () => {
    expect(
      matchConfigRedirect(missionaryRedirects, `/${TA}/ministry-updates`)
        ?.params,
    ).toEqual({ prefix: TA });
    expect(
      matchConfigRedirect(missionaryRedirects, "/ministry-updates")?.params,
    ).toEqual({});
  });
});
