// @vitest-environment node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as Navigation from "next/navigation";

const state = vi.hoisted(() => ({
  headers: new Headers(),
  user: null as { id: string } | null,
  list: {
    data: true as unknown,
    error: null as null | { code: string; message: string },
  },
  clientError: null as unknown,
  clients: 0,
  scopes: [] as unknown[],
  rpcCalls: [] as string[],
  notFound: 0,
}));

vi.mock("next/headers", () => ({
  headers: async () => state.headers,
}));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: async (scope: unknown) => {
    state.scopes.push(scope);
    if (state.clientError) throw state.clientError;
    state.clients += 1;
    return {
      auth: {
        getUser: async () => ({ data: { user: state.user }, error: null }),
      },
      rpc: async (fn: string) => {
        state.rpcCalls.push(fn);
        return state.list;
      },
    };
  },
}));

vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof Navigation>()),
  notFound: () => {
    state.notFound += 1;
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock(
  "../../../../apps/admin/app/(operator)/operator/operator-area-client",
  () => ({
    OperatorAreaClient: () => <p data-testid="operator-area-client">client</p>,
  }),
);

const page =
  await import("../../../../apps/admin/app/(operator)/operator/page");
const { readOperatorAdmission } =
  await import("../../../../packages/auth/operator-area-server");
const { redirect } =
  await vi.importActual<typeof Navigation>("next/navigation");

const OPS = "ops.example:3130";
const TENANT = "00000000-0000-0000-0000-000000000001";
const ROUTE_DIR = "apps/admin/app/(operator)";
const read = (file: string) =>
  readFileSync(path.join(process.cwd(), file), "utf8");

function filesUnder(dir: string): string[] {
  const absolute = path.join(process.cwd(), dir);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.relative(process.cwd(), path.join(entry.parentPath, entry.name)),
    );
}

function admittedHeaders(extra: Record<string, string> = {}) {
  return new Headers({ host: OPS, ...extra });
}

async function expectRefused() {
  state.notFound = 0;
  await expect(page.default()).rejects.toThrow("NEXT_NOT_FOUND");
  expect(state.notFound).toBe(1);
  expect(await page.generateMetadata()).toEqual({});
}

beforeEach(() => {
  state.headers = admittedHeaders();
  state.user = { id: "00000000-0000-4000-8000-0000000000a1" };
  state.list = { data: true, error: null };
  state.clientError = null;
  state.clients = 0;
  state.scopes = [];
  state.rpcCalls = [];
  state.notFound = 0;
  vi.stubEnv("OPERATIONS_NAMES", OPS);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("AL-2675 WP2c part 2a, T3: the operator page's own check", () => {
  it("blocks (instant = false), caches nothing and has no loading boundary or Mission Control shell", () => {
    expect(page.instant).toBe(false);
    const source = read(`${ROUTE_DIR}/operator/page.tsx`);
    expect(source).toMatch(/^export const instant = false;$/m);
    const files = filesUnder(ROUTE_DIR);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const text = read(file);
      expect(text, file).not.toMatch(/["']use cache/);
      expect(text, file).not.toMatch(
        /mc-shell|MCProvider|DocumentScopeProvider|TenantLink/,
      );
      expect(path.basename(file), file).not.toMatch(/^loading\./);
    }
    expect(filesUnder("apps/admin/app/(app)/operator")).toEqual([]);
  });

  it("reads the request once per render through React cache() and rethrows Next.js control flow first", () => {
    const source = read("packages/auth/operator-area-server.ts");
    expect(source).toMatch(/= cache\(/);
    expect(source).toMatch(/catch \((\w+)\) \{\s*unstable_rethrow\(\1\);/);
  });

  it("admits a listed operator: the title, the heading and the client, and asks for no tenant", async () => {
    expect(await page.generateMetadata()).toEqual({ title: "Operator area" });
    const html = renderToStaticMarkup(await page.default());
    expect(html).toMatch(/<h1[^>]*>Operator area<\/h1>/);
    expect(html).toContain('data-testid="operator-area-client"');
    expect(state.scopes.every((scope) => scope === null)).toBe(true);
    expect(state.rpcCalls).toContain("caller_is_platform_operator");
  });

  it.each([
    "x-asym-tenant",
    "x-asym-assignment",
    "x-asym-address-prefix",
    "x-asym-tenant-rewrite",
    "x-asym-name-tenant",
  ])(
    "refuses with notFound() when the request carries the page scope header %s, before any session read",
    async (header) => {
      state.headers = admittedHeaders({ [header]: TENANT });
      await expectRefused();
      expect(state.clients).toBe(0);
    },
  );

  it.each([
    "x-asym-front-stamp",
    "x-asym-front-origin",
    "x-asym-front-anything",
  ])(
    "refuses with notFound() when the request carries %s, before any session read",
    async (header) => {
      state.headers = admittedHeaders({ [header]: "x" });
      await expectRefused();
      expect(state.clients).toBe(0);
    },
  );

  it.each([
    ["an unlisted host", { host: "unlisted.example" }],
    ["a forwarded host that differs", { host: OPS, "x-forwarded-host": "x" }],
    ["no host", {}],
  ])(
    "refuses with notFound() for %s, before any session read",
    async (_label, entries) => {
      state.headers = new Headers(entries as Record<string, string>);
      await expectRefused();
      expect(state.clients).toBe(0);
    },
  );

  it("refuses with notFound() while OPERATIONS_NAMES is unset", async () => {
    vi.stubEnv("OPERATIONS_NAMES", "");
    await expectRefused();
    expect(state.clients).toBe(0);
  });

  it("refuses with notFound() when there is no signed-in person", async () => {
    state.user = null;
    await expectRefused();
    expect(state.rpcCalls).not.toContain("caller_is_platform_operator");
  });

  it.each([
    ["false", { data: false, error: null }],
    ["null", { data: null, error: null }],
    ["a string", { data: "true", error: null }],
    ["a number", { data: 1, error: null }],
    ["an error", { data: null, error: { code: "42501", message: "x" } }],
  ])(
    "refuses with notFound() when the list answers %s",
    async (_label, answer) => {
      state.list = answer as typeof state.list;
      await expectRefused();
    },
  );

  it("refuses with notFound() when the session client cannot be made", async () => {
    state.clientError = new Error("Supabase client misconfigured");
    await expectRefused();
  });

  it("lets Next.js control flow thrown by a request read pass through", async () => {
    let signal: unknown;
    try {
      redirect("/login");
    } catch (error) {
      signal = error;
    }
    state.clientError = signal;
    await expect(readOperatorAdmission()).rejects.toBe(signal);
  });
});
