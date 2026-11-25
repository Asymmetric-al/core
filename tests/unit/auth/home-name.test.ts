import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

const { HOME_HOST_FIELDS, HOME_NAME_TIMEOUT_MS, lookUpHomeName } =
  await import("../../../packages/auth/home-name");

type Answer = { data: unknown; error: unknown };
type Call = { fn: string; args: unknown; signal?: AbortSignal };

function fakeClient(answer: Answer | (() => Promise<Answer>)) {
  const calls: Call[] = [];
  const client = {
    rpc(fn: "resolve_home_host", args: { p_host: string }) {
      const call: Call = { fn, args };
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

const HOST = "site-a.localhost:25200";

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

describe("lookUpHomeName: the one read", () => {
  it("makes exactly one resolve_home_host call with the host as given, port kept, under an abort signal", async () => {
    const { client, calls } = fakeClient({
      data: [{ primary_domain: "home-a.localhost" }],
      error: null,
    });
    await expect(lookUpHomeName(HOST, client)).resolves.toEqual({
      kind: "home",
      host: "home-a.localhost",
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.fn).toBe("resolve_home_host");
    expect(calls[0]!.args).toEqual({ p_host: HOST });
    expect(calls[0]!.signal).toBeInstanceOf(AbortSignal);
    expect(HOME_NAME_TIMEOUT_MS).toBe(3000);
    expect([...HOME_HOST_FIELDS]).toEqual(["primary_domain"]);
  });

  it("answers none for no row", async () => {
    await expect(lookUpHomeName(HOST, answering([]))).resolves.toEqual({
      kind: "none",
    });
  });

  it.each([
    "home.example.org",
    "xn--bcher-kva.example.org",
    `${"a".repeat(63)}.${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}`,
  ])("answers home for the stored name %s", async (stored) => {
    await expect(
      lookUpHomeName(HOST, answering([{ primary_domain: stored }])),
    ).resolves.toEqual({ kind: "home", host: stored });
  });

  it("asks again on every call: nothing is remembered", async () => {
    const first = fakeClient({
      data: [{ primary_domain: "home-a.localhost" }],
      error: null,
    });
    const second = fakeClient({
      data: [{ primary_domain: "home-c.localhost" }],
      error: null,
    });
    await expect(lookUpHomeName(HOST, first.client)).resolves.toEqual({
      kind: "home",
      host: "home-a.localhost",
    });
    await expect(lookUpHomeName(HOST, second.client)).resolves.toEqual({
      kind: "home",
      host: "home-c.localhost",
    });
    expect(first.calls).toHaveLength(1);
    expect(second.calls).toHaveLength(1);
  });
});

describe("lookUpHomeName: unavailable", () => {
  it.each([
    ["an error answer", { data: null, error: { message: "boom" } }],
    [
      "a non-array",
      { data: { primary_domain: "home-a.localhost" }, error: null },
    ],
    ["a null answer", { data: null, error: null }],
    [
      "two rows",
      {
        data: [
          { primary_domain: "home-a.localhost" },
          { primary_domain: "home-b.localhost" },
        ],
        error: null,
      },
    ],
    ["a row that is not an object", { data: [null], error: null }],
    ["a row with no primary_domain", { data: [{}], error: null }],
    [
      "a null primary_domain",
      { data: [{ primary_domain: null }], error: null },
    ],
    ["a number", { data: [{ primary_domain: 7 }], error: null }],
    ["an empty name", { data: [{ primary_domain: "" }], error: null }],
    ["a port", { data: [{ primary_domain: "evil.example:80" }], error: null }],
    [
      "upper case",
      { data: [{ primary_domain: "HOME-A.localhost" }], error: null },
    ],
    [
      "a path",
      { data: [{ primary_domain: "home-a.localhost/x" }], error: null },
    ],
    [
      "a trailing dot",
      { data: [{ primary_domain: "home-a.localhost." }], error: null },
    ],
    ["one label", { data: [{ primary_domain: "localhost" }], error: null }],
    [
      "userinfo",
      { data: [{ primary_domain: "a@home-a.localhost" }], error: null },
    ],
    [
      "a space",
      { data: [{ primary_domain: "home a.localhost" }], error: null },
    ],
    [
      "a newline at the end",
      { data: [{ primary_domain: "home-a.localhost\n" }], error: null },
    ],
    [
      "a Unicode label",
      { data: [{ primary_domain: "bücher.example.org" }], error: null },
    ],
    [
      "a label starting with a hyphen",
      { data: [{ primary_domain: "-a.example.org" }], error: null },
    ],
    [
      "a last label starting with a digit",
      { data: [{ primary_domain: "a.example.4g" }], error: null },
    ],
    [
      "a label of 64 bytes",
      {
        data: [{ primary_domain: `${"a".repeat(64)}.example.org` }],
        error: null,
      },
    ],
    [
      "a name of 254 bytes",
      {
        data: [
          {
            primary_domain: `${"a".repeat(63)}.${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(62)}`,
          },
        ],
        error: null,
      },
    ],
  ])("on %s", async (_label, answer) => {
    await expect(
      lookUpHomeName(HOST, fakeClient(answer).client),
    ).resolves.toEqual({ kind: "unavailable" });
  });

  it("on a thrown call and on a rejected call", async () => {
    const throwing = {
      rpc(): never {
        throw new Error("socket");
      },
    };
    await expect(lookUpHomeName(HOST, throwing)).resolves.toEqual({
      kind: "unavailable",
    });
    await expect(
      lookUpHomeName(
        HOST,
        fakeClient(() => Promise.reject(new Error("reset"))).client,
      ),
    ).resolves.toEqual({ kind: "unavailable" });
  });

  it("when no answer comes within three seconds, and aborts the call", async () => {
    vi.useFakeTimers();
    const { client, calls } = fakeClient(() => new Promise<Answer>(() => {}));
    const pending = lookUpHomeName(HOST, client);
    await vi.advanceTimersByTimeAsync(HOME_NAME_TIMEOUT_MS - 1);
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
    await expect(lookUpHomeName(HOST)).resolves.toEqual({
      kind: "unavailable",
    });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("when making the client throws", async () => {
    mocks.createClient.mockImplementation(() => {
      throw new Error("bad url");
    });
    await expect(lookUpHomeName(HOST)).resolves.toEqual({
      kind: "unavailable",
    });
  });
});

describe("the home-read client", () => {
  it("is made inside each call from the public configuration, with no session", async () => {
    const { client } = fakeClient({
      data: [{ primary_domain: "home-a.localhost" }],
      error: null,
    });
    mocks.createClient.mockReturnValue(client);
    expect(mocks.createClient).not.toHaveBeenCalled();
    await lookUpHomeName(HOST);
    await lookUpHomeName(HOST);
    expect(mocks.createClient).toHaveBeenCalledTimes(2);
    expect(mocks.createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "publishable-key",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  });
});
