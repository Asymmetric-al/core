import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TA = "00000000-0000-0000-0000-000000000001";

const mocks = vi.hoisted(() => ({
  config: { url: "https://example.supabase.co", key: "publishable-key" } as {
    url: string | undefined;
    key: string | undefined;
  },
  createClient: vi.fn(),
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({ ...mocks.config, keyType: "publishable" }),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: mocks.createClient,
}));

const {
  lookUpVerifiedName,
  lookUpVerifiedNameSurfaces,
  SURFACE_ADMISSION,
  VERIFIED_NAME_TIMEOUT_MS,
} = await import("../../../packages/auth/verified-name");

type Answer = { data: unknown; error: unknown };

function row(overrides: Record<string, unknown> = {}) {
  return {
    tenant_id: TA,
    site_id: null,
    generation: 7,
    surfaces: ["website", "donor_account", "staff", "missionary"],
    state: "active",
    is_home: true,
    ...overrides,
  };
}

function fakeClient(answer: Answer | (() => Promise<Answer>)) {
  const calls: Array<{ fn: string; args: unknown; signal?: AbortSignal }> = [];
  const client = {
    rpc(fn: string, args: unknown) {
      const call: { fn: string; args: unknown; signal?: AbortSignal } = {
        fn,
        args,
      };
      calls.push(call);
      return {
        abortSignal(signal: AbortSignal) {
          call.signal = signal;
          return typeof answer === "function"
            ? answer()
            : Promise.resolve(answer);
        },
      };
    },
  };
  return { client, calls };
}

function answering(data: unknown) {
  return fakeClient({ data, error: null }).client;
}

beforeEach(() => {
  mocks.config = {
    url: "https://example.supabase.co",
    key: "publishable-key",
  };
  mocks.createClient.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("the per-surface admission constant", () => {
  it("admits staff on a ready or active home, missionary and donor_account on an active home, and website on any active name", () => {
    expect(SURFACE_ADMISSION).toEqual({
      staff: { states: ["ready", "active"], home: true },
      missionary: { states: ["active"], home: true },
      donor_account: { states: ["active"], home: true },
      website: { states: ["active"], home: false },
    });
    expect(VERIFIED_NAME_TIMEOUT_MS).toBe(3000);
  });
});

describe("lookUpVerifiedName: admitted", () => {
  it.each([
    ["staff", "active"],
    ["missionary", "active"],
    ["staff", "ready"],
  ] as const)(
    "admits %s on a %s home with the organization and generation",
    async (surface, state) => {
      await expect(
        lookUpVerifiedName(
          "give-hope-demo.localhost:25060",
          surface,
          answering([row({ state })]),
        ),
      ).resolves.toEqual({ kind: "admitted", tenantId: TA, generation: 7 });
    },
  );

  it("asks for exactly the stamped host, port kept, through the one function", async () => {
    const { client, calls } = fakeClient({ data: [row()], error: null });
    await lookUpVerifiedName("give-hope-demo.localhost:25060", "staff", client);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.fn).toBe("resolve_verified_host");
    expect(calls[0]!.args).toEqual({
      p_host: "give-hope-demo.localhost:25060",
    });
    expect(calls[0]!.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("lookUpVerifiedName: refused, with the first reason that applies", () => {
  it.each([
    ["no row", "staff", [], "unknown"],
    [
      "a ready home, missionary",
      "missionary",
      [row({ state: "ready" })],
      "not_ready",
    ],
    [
      "an active name that is not home",
      "staff",
      [row({ is_home: false })],
      "not_home",
    ],
    [
      "a home without the surface",
      "missionary",
      [row({ surfaces: ["website", "donor_account", "staff"] })],
      "not_for_surface",
    ],
    [
      "ready, not home and without the surface: not_ready first",
      "missionary",
      [row({ state: "ready", is_home: false, surfaces: ["website"] })],
      "not_ready",
    ],
    [
      "active, not home and without the surface: not_home before not_for_surface",
      "staff",
      [row({ is_home: false, surfaces: ["website"] })],
      "not_home",
    ],
  ] as const)("%s", async (_label, surface, data, reason) => {
    await expect(
      lookUpVerifiedName("n2-second.localhost:25060", surface, answering(data)),
    ).resolves.toEqual({ kind: "refused", reason });
  });
});

describe("lookUpVerifiedName: unavailable", () => {
  it.each([
    ["an error answer", { data: null, error: { message: "boom" } }],
    ["a non-array", { data: row(), error: null }],
    ["two rows", { data: [row(), row()], error: null }],
    [
      "an upper-case tenant id",
      {
        data: [row({ tenant_id: "00000000-0000-0000-0000-00000000000A" })],
        error: null,
      },
    ],
    [
      "a tenant id that is not a UUID",
      { data: [row({ tenant_id: "tenant-a" })], error: null },
    ],
    ["a zero generation", { data: [row({ generation: 0 })], error: null }],
    ["a negative generation", { data: [row({ generation: -1 })], error: null }],
    [
      "a fractional generation",
      { data: [row({ generation: 1.5 })], error: null },
    ],
    ["a string generation", { data: [row({ generation: "7" })], error: null }],
    [
      "an unsafe generation",
      { data: [row({ generation: 2 ** 53 })], error: null },
    ],
    ["a string is_home", { data: [row({ is_home: "true" })], error: null }],
    [
      "surfaces not an array",
      { data: [row({ surfaces: "staff" })], error: null },
    ],
    [
      "surfaces not strings",
      { data: [row({ surfaces: ["staff", 1] })], error: null },
    ],
    [
      "a state that is not a string",
      { data: [row({ state: 1 })], error: null },
    ],
    ["a row that is not an object", { data: [null], error: null }],
  ])("on %s", async (_label, answer) => {
    await expect(
      lookUpVerifiedName("x.localhost", "staff", fakeClient(answer).client),
    ).resolves.toEqual({ kind: "unavailable" });
  });

  it("on a thrown call and on a rejected call", async () => {
    const throwing = {
      rpc() {
        throw new Error("socket");
      },
    };
    await expect(
      lookUpVerifiedName("x.localhost", "staff", throwing as never),
    ).resolves.toEqual({ kind: "unavailable" });
    await expect(
      lookUpVerifiedName(
        "x.localhost",
        "staff",
        fakeClient(() => Promise.reject(new Error("reset"))).client,
      ),
    ).resolves.toEqual({ kind: "unavailable" });
  });

  it("when no answer comes within three seconds, and aborts the call", async () => {
    vi.useFakeTimers();
    const { client, calls } = fakeClient(() => new Promise<Answer>(() => {}));
    const pending = lookUpVerifiedName("x.localhost", "staff", client);
    await vi.advanceTimersByTimeAsync(VERIFIED_NAME_TIMEOUT_MS - 1);
    let settled = false;
    void pending.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toEqual({ kind: "unavailable" });
    expect(calls[0]!.signal!.aborted).toBe(true);
  });

  it.each([
    ["the URL", { url: undefined, key: "publishable-key" }],
    ["the key", { url: "https://example.supabase.co", key: undefined }],
  ])("when %s is missing, without making a client", async (_label, config) => {
    mocks.config = config;
    await expect(lookUpVerifiedName("x.localhost", "staff")).resolves.toEqual({
      kind: "unavailable",
    });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("when making the client throws", async () => {
    mocks.createClient.mockImplementation(() => {
      throw new Error("bad url");
    });
    await expect(lookUpVerifiedName("x.localhost", "staff")).resolves.toEqual({
      kind: "unavailable",
    });
  });
});

describe("the lookup client", () => {
  it("is made only when a lookup runs, from the public configuration, with no session and no person's token", async () => {
    expect(mocks.createClient).not.toHaveBeenCalled();
    mocks.createClient.mockReturnValue(answering([row()]));
    await expect(
      lookUpVerifiedName("give-hope-demo.localhost:25060", "missionary"),
    ).resolves.toEqual({ kind: "admitted", tenantId: TA, generation: 7 });
    expect(mocks.createClient).toHaveBeenCalledTimes(1);
    expect(mocks.createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "publishable-key",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  });

  it("is made again for every lookup: nothing is cached across requests", async () => {
    mocks.createClient
      .mockReturnValueOnce(answering([row()]))
      .mockReturnValueOnce(
        answering([row({ tenant_id: "00000000-0000-0000-0000-000000000002" })]),
      );
    await expect(
      lookUpVerifiedName("n.localhost", "staff"),
    ).resolves.toMatchObject({ tenantId: TA });
    await expect(
      lookUpVerifiedName("n.localhost", "staff"),
    ).resolves.toMatchObject({
      tenantId: "00000000-0000-0000-0000-000000000002",
    });
    expect(mocks.createClient).toHaveBeenCalledTimes(2);
  });
});

const TB = "00000000-0000-0000-0000-000000000002";

describe("lookUpVerifiedNameSurfaces: donor_account and website in one lookup", () => {
  it.each([
    [
      "home-a (active home, all four surfaces)",
      [row({ tenant_id: TA })],
      {
        donor_account: { kind: "admitted", tenantId: TA, generation: 7 },
        website: { kind: "admitted", tenantId: TA, generation: 7 },
      },
    ],
    [
      "home-b (active home, all four surfaces)",
      [row({ tenant_id: TB })],
      {
        donor_account: { kind: "admitted", tenantId: TB, generation: 7 },
        website: { kind: "admitted", tenantId: TB, generation: 7 },
      },
    ],
    [
      "site-a (active, website only, not home: not_home precedes not_for_surface)",
      [row({ tenant_id: TA, is_home: false, surfaces: ["website"] })],
      {
        donor_account: { kind: "refused", reason: "not_home" },
        website: { kind: "admitted", tenantId: TA, generation: 7 },
      },
    ],
    [
      "second-a (active, website and donor_account, not home)",
      [
        row({
          tenant_id: TA,
          is_home: false,
          surfaces: ["website", "donor_account"],
        }),
      ],
      {
        donor_account: { kind: "refused", reason: "not_home" },
        website: { kind: "admitted", tenantId: TA, generation: 7 },
      },
    ],
    [
      "active home without donor_account (website only): not_for_surface",
      [row({ tenant_id: TA, is_home: true, surfaces: ["website"] })],
      {
        donor_account: { kind: "refused", reason: "not_for_surface" },
        website: { kind: "admitted", tenantId: TA, generation: 7 },
      },
    ],
    [
      "bare-b (active home, donor_account only)",
      [row({ tenant_id: TB, is_home: true, surfaces: ["donor_account"] })],
      {
        donor_account: { kind: "admitted", tenantId: TB, generation: 7 },
        website: { kind: "refused", reason: "not_for_surface" },
      },
    ],
    [
      "ready-b (ready home, all four surfaces)",
      [row({ tenant_id: TB, state: "ready" })],
      {
        donor_account: { kind: "refused", reason: "not_ready" },
        website: { kind: "refused", reason: "not_ready" },
      },
    ],
    [
      "no row: unknown for both",
      [],
      {
        donor_account: { kind: "refused", reason: "unknown" },
        website: { kind: "refused", reason: "unknown" },
      },
    ],
  ])(
    "answers both donor surfaces from one rpc call on %s",
    async (_label, data, expectedDecisions) => {
      const { client, calls } = fakeClient({ data, error: null });
      await expect(
        lookUpVerifiedNameSurfaces(
          "give-hope-demo.localhost:25160",
          ["donor_account", "website"],
          client,
        ),
      ).resolves.toEqual({ kind: "resolved", decisions: expectedDecisions });
      expect(calls).toHaveLength(1);
      expect(calls[0]!.fn).toBe("resolve_verified_host");
      expect(calls[0]!.args).toEqual({
        p_host: "give-hope-demo.localhost:25160",
      });
      expect(calls[0]!.signal).toBeInstanceOf(AbortSignal);
    },
  );

  it.each([
    ["an error answer", { data: null, error: { message: "boom" } }],
    ["a non-array", { data: row(), error: null }],
    ["two rows", { data: [row(), row()], error: null }],
    [
      "an upper-case tenant id",
      {
        data: [row({ tenant_id: "00000000-0000-0000-0000-00000000000A" })],
        error: null,
      },
    ],
    ["a zero generation", { data: [row({ generation: 0 })], error: null }],
    ["a string is_home", { data: [row({ is_home: "true" })], error: null }],
    [
      "surfaces not strings",
      { data: [row({ surfaces: ["website", 1] })], error: null },
    ],
    [
      "a state that is not a string",
      { data: [row({ state: 1 })], error: null },
    ],
    ["a null row", { data: [null], error: null }],
  ])("returns unavailable for both surfaces on %s", async (_label, answer) => {
    const { client, calls } = fakeClient(answer);
    await expect(
      lookUpVerifiedNameSurfaces(
        "x.localhost",
        ["donor_account", "website"],
        client,
      ),
    ).resolves.toEqual({ kind: "unavailable" });
    expect(calls).toHaveLength(1);
  });

  it("returns unavailable on thrown, rejected, missing-config, client-throw and timed-out calls", async () => {
    const throwing = {
      rpc() {
        throw new Error("socket");
      },
    };
    await expect(
      lookUpVerifiedNameSurfaces(
        "x.localhost",
        ["donor_account", "website"],
        throwing as never,
      ),
    ).resolves.toEqual({ kind: "unavailable" });

    await expect(
      lookUpVerifiedNameSurfaces(
        "x.localhost",
        ["donor_account", "website"],
        fakeClient(() => Promise.reject(new Error("reset"))).client,
      ),
    ).resolves.toEqual({ kind: "unavailable" });

    mocks.config = { url: undefined, key: "publishable-key" };
    await expect(
      lookUpVerifiedNameSurfaces("x.localhost", ["donor_account", "website"]),
    ).resolves.toEqual({ kind: "unavailable" });
    expect(mocks.createClient).not.toHaveBeenCalled();

    mocks.config = {
      url: "https://example.supabase.co",
      key: "publishable-key",
    };
    mocks.createClient.mockImplementation(() => {
      throw new Error("bad url");
    });
    await expect(
      lookUpVerifiedNameSurfaces("x.localhost", ["donor_account", "website"]),
    ).resolves.toEqual({ kind: "unavailable" });

    vi.useFakeTimers();
    const { client, calls } = fakeClient(() => new Promise<Answer>(() => {}));
    const pending = lookUpVerifiedNameSurfaces(
      "x.localhost",
      ["donor_account", "website"],
      client,
    );
    await vi.advanceTimersByTimeAsync(VERIFIED_NAME_TIMEOUT_MS);
    await expect(pending).resolves.toEqual({ kind: "unavailable" });
    expect(calls[0]!.signal!.aborted).toBe(true);
  });
});
