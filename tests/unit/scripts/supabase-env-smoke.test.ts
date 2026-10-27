import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type QueryResult = {
  data?: { id: string }[] | null;
  error?: { message: string; code?: string } | null;
  count?: number | null;
};

const supabase = vi.hoisted(() => ({
  anonProbe: { data: [], error: null } as QueryResult,
  serviceHead: { error: null, count: 3 } as QueryResult,
  clients: [] as { key: string; selects: unknown[][] }[],
}));

vi.mock("dotenv", () => ({ config: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({
  createClient: (_url: string, key: string) => {
    const client = { key, selects: [] as unknown[][] };
    supabase.clients.push(client);
    return {
      from: (table: string) => ({
        select: (...args: unknown[]) => {
          client.selects.push([table, ...args]);
          return Object.assign(Promise.resolve(supabase.serviceHead), {
            limit: async () => supabase.anonProbe,
          });
        },
      }),
    };
  },
}));

class Exit extends Error {
  constructor(readonly code: number | undefined) {
    super(`process.exit(${code})`);
  }
}

const ANON_KEY = "anon-key-for-tests";
const SERVICE_KEY = "service-key-for-tests";

let logs: string[];
let errors: string[];

beforeEach(() => {
  supabase.clients.length = 0;
  logs = [];
  errors = [];
  vi.resetModules();
  for (const name of [
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "AUTH_SMOKE_EMAIL",
    "AUTH_SMOKE_PASSWORD",
    "DEMO_ADMIN_EMAIL",
    "DEMO_PASSWORD",
  ])
    vi.stubEnv(name, "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.example.com/");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", ANON_KEY);
  vi.spyOn(process, "exit").mockImplementation((code) => {
    throw new Exit(code as number | undefined);
  });
  vi.spyOn(console, "log").mockImplementation((m: string) => logs.push(m));
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation((m: string) => errors.push(m));
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({ name: "GoTrue", version: "v2" }, { status: 200 }),
    ),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

/** Runs the script once; resolves to the exit code it requested, if any. */
async function runSmoke(): Promise<number | undefined> {
  try {
    await import("../../../scripts/supabase-env-smoke.mjs");
    return undefined;
  } catch (e) {
    if (e instanceof Exit) return e.code;
    throw e;
  }
}

describe("supabase-env-smoke anon campaigns probe (#2312)", () => {
  it.each([
    [
      "code 42501",
      { message: "permission denied for table campaigns", code: "42501" },
    ],
    [
      "a permission denied message without the code",
      { message: "Permission denied for table campaigns" },
    ],
  ])("passes when anon is denied (%s)", async (_name, error) => {
    supabase.anonProbe = { data: null, error };

    expect(await runSmoke()).toBeUndefined();
    expect(errors).toEqual([]);
    expect(logs).toContain(
      "OK: database (PostgREST) — anon is denied campaigns (expected after #2312)",
    );
    expect(logs.at(-1)).toBe("Smoke test finished.");
    expect(supabase.clients.map((c) => c.key)).toEqual([ANON_KEY]);
    expect(supabase.clients[0]!.selects).toEqual([["campaigns", "id"]]);
  });

  it("fails with the exposure message when anon gets rows back", async () => {
    supabase.anonProbe = { data: [{ id: "c1" }], error: null };

    expect(await runSmoke()).toBe(1);
    expect(errors).toEqual([
      "FAIL: anon can read campaigns: public exposure (1 row(s))",
    ]);
    expect(logs.join("\n")).not.toMatch(/anon is denied/);
  });

  it("fails on any other error", async () => {
    supabase.anonProbe = {
      data: null,
      error: { message: "JWT expired", code: "PGRST301" },
    };

    expect(await runSmoke()).toBe(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(
      /^FAIL: PostgREST anon query failed: JWT expired/,
    );
  });

  it("fails when anon can still query campaigns and gets an empty set", async () => {
    supabase.anonProbe = { data: [], error: null };

    expect(await runSmoke()).toBe(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^FAIL: anon can query campaigns \(0 rows\)/);
  });

  it("keeps the service-role branch unchanged: head count, no anon probe", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);
    supabase.anonProbe = { data: [{ id: "c1" }], error: null };

    expect(await runSmoke()).toBeUndefined();
    expect(errors).toEqual([]);
    expect(logs).toContain("OK: database (PostgREST) — campaigns head count=3");
    const admin = supabase.clients.find((c) => c.key === SERVICE_KEY);
    expect(admin?.selects).toEqual([
      ["campaigns", "id", { count: "exact", head: true }],
    ]);
    const anon = supabase.clients.find((c) => c.key === ANON_KEY);
    expect(anon?.selects).toEqual([]);
  });
});
