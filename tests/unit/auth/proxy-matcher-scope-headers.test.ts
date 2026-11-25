import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ADDRESS_PREFIX_HEADER,
  ASSIGNMENT_HEADER,
  ROLE_CLASS_HEADER,
  TENANT_HEADER,
} from "../../../packages/auth/request-headers";

/**
 * Council round 1, A3 (AL-2675, WP2b slice A): every path an app can answer
 * runs its proxy, so no scope header a client sends survives.
 *
 * The proxies' matcher skipped every path ending in `.json`, `.txt`, `.xml`
 * or an image extension. A dynamic page route still answers such a path
 * (`/care/directory/x.json`, `/contributions/x.json`,
 * `/support/tickets/x.json`), so there the page rendered with no proxy and
 * read the tenant, assignment, address prefix, role class and pathname
 * headers the client sent. Only Next.js assets and real static files are
 * skipped now. Each app's real proxy and `config`; only Supabase is doubled.
 */

const USER = "00000000-0000-4000-8000-0000000000f1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const FORGED_ROW = "00000000-0000-4000-8000-0000000000ff";
const PATHNAME_HEADER = "x-asym-pathname";

const network = vi.hoisted(() => {
  const reached: string[] = [];
  const fetchSpy = vi.fn(async (input: unknown) => {
    reached.push(String(input));
    throw new Error("a test reached the network");
  });
  vi.stubGlobal("fetch", fetchSpy);
  return { reached, fetchSpy };
});

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
}));

beforeEach(() => {
  vi.stubGlobal("fetch", network.fetchSpy);
});

afterEach(() => {
  expect(network.reached).toEqual([]);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: state.userId ? { id: state.userId } : null },
      }),
    },
    rpc: async () => ({ data: state.rows, error: null }),
  }),
}));

const PROXIES = {
  admin: () => import("../../../apps/admin/proxy"),
  missionary: () => import("../../../apps/missionary/proxy"),
  donor: () => import("../../../apps/donor/proxy"),
} as const;

/** Page paths a dynamic route of each app answers, ending in a static-file extension. */
const ROUTE_PATHS_WITH_EXTENSIONS: Record<keyof typeof PROXIES, string[]> = {
  admin: [
    "/care/directory/x.json",
    "/contributions/x.json",
    "/support/tickets/x.json",
    "/support/tickets/x.txt",
    "/crm/x.xml",
    `/${TA}/support/tickets/x.json`,
    `/${TA}~finance/contributions/x.png`,
    // Web Studio's API: the proxy refreshes the session there too, whatever
    // the path ends in (slice C's review; WP2a's "/api/:path*" entry did not
    // cover these paths).
    "/web-studio/api/collections/pages",
    "/web-studio/api/media/file/x.png",
    "/web-studio/api/globals/site.json",
  ],
  missionary: [
    "/donors/x.json",
    "/tasks/x.txt",
    "/feed/x.xml",
    `/${TA}/donors/x.json`,
  ],
  donor: ["/donor-dashboard/history/x.json", "/donor-dashboard/x.xml"],
};

/** Next.js assets and one file name at the root with a static extension. */
const NEXT_AND_ROOT_FILES = [
  "/_next/static/chunks/main.js",
  "/_next/image",
  "/_next/data/build/page.json",
  "/favicon.ico",
  "/icon.svg",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
];

/** The files of `public/maplibre`, the one public folder (Mission Control and the donor portal). */
const MAPLIBRE_FILES = [
  "/maplibre/maplibre-gl-worker.mjs",
  "/maplibre/maplibre-gl-shared.mjs",
  "/maplibre/style.json",
  "/maplibre/sprites/sprite.png",
];

/** What each app's matcher skips. */
const STATIC_PATHS: Record<keyof typeof PROXIES, string[]> = {
  admin: [...NEXT_AND_ROOT_FILES, ...MAPLIBRE_FILES],
  donor: [...NEXT_AND_ROOT_FILES, ...MAPLIBRE_FILES],
  missionary: NEXT_AND_ROOT_FILES,
};

/**
 * Council round 2, AR7: paths under a public folder the app does not have.
 * Nothing static is there, so a route answers them (in the donor portal,
 * the public CMS pages' catch-all); they run the proxy.
 */
const NO_SUCH_FOLDER: Record<keyof typeof PROXIES, string[]> = {
  admin: ["/images/hero.webp", "/images/x"],
  donor: ["/images/hero.webp", "/images/x"],
  missionary: [
    "/images/hero.webp",
    "/maplibre/maplibre-gl-worker.mjs",
    "/maplibre/x",
  ],
};

/**
 * The public folders an app declares: the folders git tracks under its
 * `public`, and the one its own `next.config.ts` creates when it loads
 * (`copyMaplibreWorkerAssetsForApp`, which writes the folder the copy
 * script names). Read from git and the sources, never from the disk: the
 * created folder is gitignored and exists only once a config has loaded,
 * which CI's unit job never does (council round 3, AR13).
 */
function declaredPublicFolders(app: keyof typeof PROXIES): Set<string> {
  const publicDir = `apps/${app}/public/`;
  const tracked = execFileSync("git", ["ls-files", "--", publicDir], {
    encoding: "utf8",
  })
    .split("\n")
    .filter((file) => file.startsWith(publicDir))
    .map((file) => file.slice(publicDir.length))
    .filter((rest) => rest.includes("/"))
    .map((rest) => rest.split("/")[0]!);
  const config = readFileSync(`apps/${app}/next.config.ts`, "utf8");
  const copied = readFileSync(
    "scripts/copy-maplibre-worker-assets.mjs",
    "utf8",
  ).match(/path\.join\(publicDir, "([\w-]+)"\)/)?.[1];
  expect(copied, "the folder the copy script writes").toBeDefined();
  const created = /\bcopyMaplibreWorkerAssetsForApp\s*\(/.test(config)
    ? [copied!]
    : [];
  return new Set([...tracked, ...created]);
}

it("reads each app's declared public folders from git and its own config", () => {
  expect(declaredPublicFolders("admin")).toEqual(new Set(["maplibre"]));
  expect(declaredPublicFolders("donor")).toEqual(new Set(["maplibre"]));
  expect(declaredPublicFolders("missionary")).toEqual(new Set());
});

describe.each(Object.keys(PROXIES) as Array<keyof typeof PROXIES>)(
  "the %s proxy's matcher",
  (app) => {
    it.each(ROUTE_PATHS_WITH_EXTENSIONS[app])(
      "runs on %s, which a dynamic route answers",
      async (url) => {
        const { config } = await PROXIES[app]();
        expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
      },
    );

    it.each(STATIC_PATHS[app])("skips the static path %s", async (url) => {
      const { config } = await PROXIES[app]();
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
    });

    it.each(NO_SUCH_FOLDER[app])(
      "runs on %s, under a public folder the app does not have",
      async (url) => {
        const { config } = await PROXIES[app]();
        expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
      },
    );

    it("skips no folder the app does not declare in its public directory", async () => {
      const { config } = await PROXIES[app]();
      const folders = [
        ...config.matcher
          .join("\n")
          .matchAll(/(?:\(\?!|\|)([\w-]+(?:\/[\w-]+)*)\//g),
      ]
        .map((match) => match[1]!)
        .filter(
          (folder) =>
            folder !== "_next" &&
            !(
              app === "donor" &&
              (folder === "admin/_next" || folder === "missionary/_next")
            ),
        );
      const declared = declaredPublicFolders(app);
      for (const folder of folders) {
        expect(declared.has(folder), folder).toBe(true);
      }
    });
  },
);

/** Every scope header, as a client might forge it. */
const FORGED: Record<string, string> = {
  [TENANT_HEADER]: TB,
  [ASSIGNMENT_HEADER]: FORGED_ROW,
  [ADDRESS_PREFIX_HEADER]: `/${TB}~finance`,
  [ROLE_CLASS_HEADER]: "donor",
  [PATHNAME_HEADER]: "/forged",
};

describe.each([
  [
    "Mission Control",
    "admin" as const,
    "staff",
    "development",
    "/support/tickets/x.json",
  ],
  [
    "the missionary workspace",
    "missionary" as const,
    "missionary",
    null,
    "/donors/x.json",
  ],
])(
  "%s: a client-sent scope header on a page path that ends in an extension",
  (_label, app, role, staffRole, page) => {
    const row = {
      id: "00000000-0000-4000-8000-0000000000f2",
      user_id: USER,
      tenant_id: TA,
      role,
      staff_role: staffRole,
      is_tenant_admin: false,
      updated_at: "2026-11-18T00:00:00.000000+00:00",
    };

    beforeEach(() => {
      state.userId = USER;
      state.rows = [row];
    });

    it.each(Object.keys(FORGED))(
      "is ignored for %s under the tenant address",
      async (header) => {
        const { proxy, config } = await PROXIES[app]();
        const address = `/${TA}${page}`;
        expect(unstable_doesMiddlewareMatch({ config, url: address })).toBe(
          true,
        );
        const response = await proxy(
          new NextRequest(new URL(address, "http://localhost:3330"), {
            headers: { [header]: FORGED[header]! },
          }),
        );
        const forwarded = response.headers.get(
          `x-middleware-request-${header}`,
        );
        expect(forwarded).not.toBe(FORGED[header]);
        const decided: Record<string, string> = {
          [TENANT_HEADER]: TA,
          [ASSIGNMENT_HEADER]: row.id,
          [ADDRESS_PREFIX_HEADER]: `/${TA}`,
          [ROLE_CLASS_HEADER]: role,
          [PATHNAME_HEADER]: address,
        };
        expect(forwarded).toBe(decided[header]);
      },
    );

    it.each(Object.keys(FORGED))(
      "never reaches the page for %s without the tenant address",
      async (header) => {
        const { proxy, config } = await PROXIES[app]();
        expect(unstable_doesMiddlewareMatch({ config, url: page })).toBe(true);
        const response = await proxy(
          new NextRequest(new URL(page, "http://localhost:3330"), {
            headers: { [header]: FORGED[header]! },
          }),
        );
        // The person is sent to their tenant address; the page is not served
        // with the client's header.
        expect(response.status).toBe(307);
        expect(response.headers.get("x-middleware-rewrite")).toBeNull();
        expect(response.headers.get(`x-middleware-request-${header}`)).not.toBe(
          FORGED[header],
        );
      },
    );
  },
);
