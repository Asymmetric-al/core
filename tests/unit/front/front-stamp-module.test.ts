import { randomBytes } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import * as front from "../../../packages/auth/front";

const network = vi.hoisted(() => {
  const reached: string[] = [];
  const fetchSpy = vi.fn(async (input: unknown) => {
    reached.push(String(input));
    throw new Error("a test reached the network");
  });
  vi.stubGlobal("fetch", fetchSpy);
  return { reached, fetchSpy };
});

beforeEach(() => {
  vi.stubGlobal("fetch", network.fetchSpy);
});

afterEach(() => {
  expect(network.reached).toEqual([]);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

type StampKeys = { key: string | undefined; previousKey?: string | undefined };

type FrontStampModule = {
  FRONT_STAMP_HEADER: string;
  FRONT_ORIGIN_HEADER: string;
  hasValidStampKey: (value: string | undefined) => boolean;
  signFrontStamp: (
    origin: string,
    prefix: string,
    key: string,
    now?: number,
  ) => Promise<string>;
  verifyFrontStamp: (
    origin: string | null,
    prefix: string,
    stamp: string | null,
    keys: StampKeys,
    now?: number,
  ) => Promise<boolean>;
  verifiedStampedOriginForRequest: (
    request: Request,
    prefix: string,
    keys: StampKeys,
    now?: number,
  ) => Promise<string | null>;
};

const FRONT_STAMP_MODULE = "../../../packages/auth/front-stamp";

async function loadFrontStamp(): Promise<FrontStampModule> {
  const loaded = (await import(/* @vite-ignore */ FRONT_STAMP_MODULE).catch(
    () => null,
  )) as FrontStampModule | null;
  expect(loaded, "packages/auth/front-stamp.ts loads").not.toBeNull();
  return loaded!;
}

const SPECIFIER =
  /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["']([^"']+)["']/g;

function readRepo(file: string): string {
  return readFileSync(path.join(process.cwd(), file), "utf8");
}

function readRepoIfPresent(file: string): string | null {
  try {
    return readRepo(file);
  } catch {
    return null;
  }
}

function specifiers(source: string): string[] {
  return [...source.matchAll(SPECIFIER)].map((match) => match[1]!);
}

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .filter(
      (entry) => entry.name !== "node_modules" && !entry.name.startsWith("."),
    )
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(entryPath) : [entryPath];
    });
}

function freshKey(bytes = 32): string {
  return randomBytes(bytes).toString("hex").slice(0, bytes);
}

const FRONT = "https://front.test";
const STAFF_URL = "https://staff.example.test/eve/v1/session";
const NOW = 1_800_000_000_000;

async function stampedRequest(
  stamp: FrontStampModule,
  options: {
    key: string;
    origin?: string;
    prefix?: string;
    url?: string;
    headers?: Record<string, string>;
  },
) {
  const origin = options.origin ?? FRONT;
  const value = await stamp.signFrontStamp(
    origin,
    options.prefix ?? "/admin",
    options.key,
    NOW,
  );
  return new Request(options.url ?? STAFF_URL, {
    method: "POST",
    headers: {
      host: "staff.example.test",
      "content-type": "application/json",
      [front.FRONT_ORIGIN_HEADER]: origin,
      [front.FRONT_STAMP_HEADER]: value,
      ...options.headers,
    },
    body: "{}",
  });
}

describe("one stamp implementation that imports nothing from Next.js", () => {
  it("re-exports the very same stamp functions and header names from front.ts", async () => {
    const stamp = await loadFrontStamp();
    expect(front.signFrontStamp).toBe(stamp.signFrontStamp);
    expect(front.verifyFrontStamp).toBe(stamp.verifyFrontStamp);
    expect(front.hasValidStampKey).toBe(stamp.hasValidStampKey);
    expect(front.FRONT_STAMP_HEADER).toBe(stamp.FRONT_STAMP_HEADER);
    expect(front.FRONT_ORIGIN_HEADER).toBe(stamp.FRONT_ORIGIN_HEADER);
    expect(stamp.FRONT_STAMP_HEADER).toBe("x-asym-front-stamp");
    expect(stamp.FRONT_ORIGIN_HEADER).toBe("x-asym-front-origin");
  });

  it("imports only @asym/env/front-origin, which imports nothing", () => {
    const source = readRepoIfPresent("packages/auth/front-stamp.ts");
    expect(source, "packages/auth/front-stamp.ts").not.toBeNull();
    expect(specifiers(source ?? "")).toEqual(["@asym/env/front-origin"]);
    expect(specifiers(readRepo("packages/env/src/front-origin.ts"))).toEqual(
      [],
    );
  });

  it("is exported as @asym/auth/front-stamp", () => {
    const manifest = JSON.parse(readRepo("packages/auth/package.json")) as {
      exports: Record<string, string>;
    };
    expect(manifest.exports["./front-stamp"]).toBe("./front-stamp.ts");
    expect(manifest.exports["./front"]).toBe("./front.ts");
  });

  it("keeps every file of packages/eve-runtime away from next and @asym/auth/front", () => {
    const files = filesUnder(
      path.join(process.cwd(), "packages/eve-runtime"),
    ).filter((file) => /\.(?:ts|tsx|js|jsx|mjs|cjs)$/u.test(file));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/\bfrom\s*["']next(?:\/[^"']*)?["']/);
      expect(source, file).not.toMatch(/\bimport\s+["']next(?:\/[^"']*)?["']/);
      expect(source, file).not.toMatch(/\bimport\s*\(\s*["']next(?:\/|["'])/);
      expect(source, file).not.toMatch(/\brequire\s*\(\s*["']next(?:\/|["'])/);
      expect(source, file).not.toMatch(/["']@asym\/auth\/front["']/);
    }
  });

  it("has the assistant's service import the stamp from @asym/auth/front-stamp", () => {
    const imported = specifiers(
      readRepo("packages/eve-runtime/src/admin-session-auth.ts"),
    );
    expect(imported).toContain("@asym/auth/front-stamp");
    expect(imported).not.toContain("@asym/auth/front");
  });
});

describe("verifiedStampedOriginForRequest", () => {
  it.each([
    ["no x-forwarded-host", {}],
    ["x-forwarded-host the stamped host", { "x-forwarded-host": "front.test" }],
    [
      "x-forwarded-host the stamped host, padded and upper case",
      { "x-forwarded-host": "  FRONT.Test " },
    ],
    [
      "x-forwarded-host the request's own host",
      { "x-forwarded-host": "staff.example.test" },
    ],
  ])("returns the stamped origin with %s", async (_label, headers) => {
    const stamp = await loadFrontStamp();
    const key = freshKey();
    const request = await stampedRequest(stamp, { key, headers });
    await expect(
      stamp.verifiedStampedOriginForRequest(request, "/admin", { key }, NOW),
    ).resolves.toBe(FRONT);
    expect(request.bodyUsed).toBe(false);
  });

  it("accepts a stamp of the previous key beside a valid primary", async () => {
    const stamp = await loadFrontStamp();
    const key = freshKey();
    const previousKey = freshKey();
    const request = await stampedRequest(stamp, { key: previousKey });
    await expect(
      stamp.verifiedStampedOriginForRequest(
        request,
        "/admin",
        { key, previousKey },
        NOW,
      ),
    ).resolves.toBe(FRONT);
  });

  it.each([
    ["a third host", { "x-forwarded-host": "evil.test" }],
    ["a blank value", { "x-forwarded-host": "" }],
    ["a list", { "x-forwarded-host": "front.test, evil.test" }],
  ])("refuses an x-forwarded-host of %s", async (_label, headers) => {
    const stamp = await loadFrontStamp();
    const key = freshKey();
    const request = await stampedRequest(stamp, { key, headers });
    await expect(
      stamp.verifiedStampedOriginForRequest(request, "/admin", { key }, NOW),
    ).resolves.toBeNull();
  });

  it("refuses a blank x-forwarded-host when the request has no host either", async () => {
    const stamp = await loadFrontStamp();
    const key = freshKey();
    const request = await stampedRequest(stamp, {
      key,
      headers: { "x-forwarded-host": "" },
    });
    const headers = new Headers(request.headers);
    headers.delete("host");
    const hostless = new Request(request.url, {
      method: "POST",
      headers,
    });
    expect(hostless.headers.get("host")).toBeNull();
    await expect(
      stamp.verifiedStampedOriginForRequest(hostless, "/admin", { key }, NOW),
    ).resolves.toBeNull();
  });

  it("refuses a stamp whose scheme is not the request's", async () => {
    const stamp = await loadFrontStamp();
    const key = freshKey();
    const httpStamp = await stampedRequest(stamp, {
      key,
      origin: "http://front.test",
    });
    await expect(
      stamp.verifiedStampedOriginForRequest(httpStamp, "/admin", { key }, NOW),
    ).resolves.toBeNull();
    const httpRequest = await stampedRequest(stamp, {
      key,
      url: "http://staff.example.test/eve/v1/session",
    });
    await expect(
      stamp.verifiedStampedOriginForRequest(
        httpRequest,
        "/admin",
        { key },
        NOW,
      ),
    ).resolves.toBeNull();
  });

  it("refuses another prefix, an unset or short key, a missing or stale stamp", async () => {
    const stamp = await loadFrontStamp();
    const key = freshKey();
    const missionary = await stampedRequest(stamp, {
      key,
      prefix: "/missionary",
    });
    await expect(
      stamp.verifiedStampedOriginForRequest(missionary, "/admin", { key }, NOW),
    ).resolves.toBeNull();

    const valid = await stampedRequest(stamp, { key });
    await expect(
      stamp.verifiedStampedOriginForRequest(
        valid,
        "/admin",
        { key: undefined, previousKey: key },
        NOW,
      ),
    ).resolves.toBeNull();
    await expect(
      stamp.verifiedStampedOriginForRequest(
        valid,
        "/admin",
        { key: "a".repeat(31), previousKey: key },
        NOW,
      ),
    ).resolves.toBeNull();
    await expect(
      stamp.verifiedStampedOriginForRequest(
        valid,
        "/admin",
        { key: freshKey() },
        NOW,
      ),
    ).resolves.toBeNull();
    await expect(
      stamp.verifiedStampedOriginForRequest(
        valid,
        "/admin",
        { key },
        NOW + 61_000,
      ),
    ).resolves.toBeNull();

    const headers = new Headers(valid.headers);
    headers.delete(front.FRONT_STAMP_HEADER);
    await expect(
      stamp.verifiedStampedOriginForRequest(
        new Request(valid.url, { method: "POST", headers }),
        "/admin",
        { key },
        NOW,
      ),
    ).resolves.toBeNull();
  });
});
