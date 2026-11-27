import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import { StripeLiveModeRefusedError } from "../../../packages/api/src/stripe/test-mode-key";
import {
  ACCOUNT_VARIABLES,
  PROOF_FLAG,
  TURNSTILE_TEST_KEYS,
  evidencePath,
  main,
  paymentIntentsSince,
  readProofSettings,
  redactor,
  serverEnvironment,
  stripeGetter,
  verifyTestAccounts,
} from "../../../scripts/e2e/run-giving-stripe-test-proof.mts";

const TEST_SECRET = ["sk", "test", "proofkey0000000000000000"].join("_");
const LIVE_SECRET = ["sk", "live", "proofkey0000000000000000"].join("_");
const TEST_PUBLISHABLE = ["pk", "test", "proofkey00000000000000"].join("_");
const LIVE_PUBLISHABLE = ["pk", "live", "proofkey00000000000000"].join("_");
const RUN_SIGNING = ["whsec", "runsecret123"].join("_");
const OTHER_SIGNING = ["whsec", "another456"].join("_");
const CLIENT_SECRET = ["pi_3Abc", "secret", "Def456"].join("_");

const opted = (overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv => ({
  [PROOF_FLAG]: "1",
  STRIPE_SECRET_KEY: TEST_SECRET,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: TEST_PUBLISHABLE,
  [ACCOUNT_VARIABLES.A1]: "acct_1ProofA1",
  [ACCOUNT_VARIABLES.A2]: "acct_1ProofA2",
  [ACCOUNT_VARIABLES.B1]: "acct_1ProofB1",
  ...overrides,
});

const answer = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

describe("the Level 2 runner runs only when asked, and only in test mode", () => {
  it("refuses to start without its opt-in flag, before any call", async () => {
    const fetch = vi.fn();
    await expect(
      main([], opted({ [PROOF_FLAG]: undefined }), { fetch }),
    ).rejects.toThrow(new RegExp(PROOF_FLAG));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refuses a live secret key before any HTTP call", async () => {
    const fetch = vi.fn();
    await expect(
      main([], opted({ STRIPE_SECRET_KEY: LIVE_SECRET }), { fetch }),
    ).rejects.toBeInstanceOf(StripeLiveModeRefusedError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refuses a live publishable key before any HTTP call", async () => {
    const fetch = vi.fn();
    await expect(
      main(
        [],
        opted({ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: LIVE_PUBLISHABLE }),
        { fetch },
      ),
    ).rejects.toBeInstanceOf(StripeLiveModeRefusedError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("names each of the three TEST accounts it needs, and refuses one that is not an account ID", () => {
    expect(ACCOUNT_VARIABLES).toEqual({
      A1: "GIVING_PROOF_ACCOUNT_A1",
      A2: "GIVING_PROOF_ACCOUNT_A2",
      B1: "GIVING_PROOF_ACCOUNT_B1",
    });
    expect(readProofSettings(opted()).accounts).toEqual({
      A1: "acct_1ProofA1",
      A2: "acct_1ProofA2",
      B1: "acct_1ProofB1",
    });
    expect(() =>
      readProofSettings(opted({ [ACCOUNT_VARIABLES.A2]: undefined })),
    ).toThrow(/GIVING_PROOF_ACCOUNT_A2/);
    expect(() =>
      readProofSettings(opted({ [ACCOUNT_VARIABLES.B1]: "cus_123" })),
    ).toThrow(/GIVING_PROOF_ACCOUNT_B1/);
  });

  it("checks livemode is false on every account and refuses a live one", async () => {
    const fetch = vi.fn(async (url: string | URL) =>
      answer({
        id: String(url).split("/").pop(),
        livemode: String(url).endsWith("acct_1ProofB1"),
      }),
    );
    const get = stripeGetter(fetch, TEST_SECRET);
    await expect(
      verifyTestAccounts(get, readProofSettings(opted()).accounts),
    ).rejects.toThrow(/B1 .*livemode/);
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.stripe.com/v2/core/accounts/acct_1ProofA1");
    expect(new Headers(init.headers).get("authorization")).toBe(
      `Bearer ${TEST_SECRET}`,
    );
  });

  it("reads back the payment intents of an account since the run began, on that account, and refuses a live one", async () => {
    const fetch = vi.fn(async () =>
      answer({
        data: [
          {
            id: "pi_1",
            livemode: false,
            payment_method_types: ["card"],
            client_secret: ["pi_1", "secret", "abc"].join("_"),
          },
        ],
      }),
    );
    const read = await paymentIntentsSince(
      stripeGetter(fetch, TEST_SECRET),
      "acct_1ProofA1",
      1_800_000_000,
    );
    expect(read).toEqual([
      { id: "pi_1", livemode: false, payment_method_types: ["card"] },
    ]);
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(
      "https://api.stripe.com/v1/payment_intents?created%5Bgte%5D=1800000000&limit=100",
    );
    expect(new Headers(init.headers).get("stripe-account")).toBe(
      "acct_1ProofA1",
    );
    fetch.mockImplementationOnce(async () =>
      answer({ data: [{ id: "pi_2", livemode: true }] }),
    );
    await expect(
      paymentIntentsSince(stripeGetter(fetch, TEST_SECRET), "acct_1ProofA1", 0),
    ).rejects.toThrow(/livemode/);
  });
});

describe("the runner keeps every secret out of what it writes", () => {
  it("redacts the run's keys, any Stripe key, signing secret or client secret, and the Turnstile secret", () => {
    const redact = redactor([TEST_SECRET, RUN_SIGNING]);
    const line = [
      TEST_SECRET,
      ["rk", "test", "other0000"].join("_"),
      RUN_SIGNING,
      OTHER_SIGNING,
      CLIENT_SECRET,
      TURNSTILE_TEST_KEYS.secret,
      "acct_1ProofA1",
    ].join(" ");
    const out = redact(line);
    expect(out).not.toContain(TEST_SECRET);
    expect(out).not.toMatch(/(?:sk|rk)_test_[A-Za-z0-9]/);
    expect(out).not.toMatch(/whsec_[A-Za-z0-9]/);
    expect(out).not.toMatch(/_secret_[A-Za-z0-9]/);
    expect(out).not.toContain(TURNSTILE_TEST_KEYS.secret);
    expect(out).toContain("acct_1ProofA1");
  });

  it("writes its evidence under .e2e-logs/giving-stripe-test/<time>/", () => {
    expect(evidencePath("/repo", new Date("2026-11-28T05:06:07.890Z"))).toBe(
      path.join("/repo", ".e2e-logs", "giving-stripe-test", "20261128T050607Z"),
    );
  });

  it("opens giving on its servers with Turnstile's always-pass test keys and the run's test keys", () => {
    const settings = readProofSettings(opted());
    const env = serverEnvironment(settings, RUN_SIGNING, {});
    expect(env).toMatchObject({
      GUEST_GIVING_ENABLED: "true",
      TURNSTILE_SECRET_KEY: TURNSTILE_TEST_KEYS.secret,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: TURNSTILE_TEST_KEYS.site,
      STRIPE_SECRET_KEY: TEST_SECRET,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: TEST_PUBLISHABLE,
      STRIPE_PAYMENT_EVENTS_WEBHOOK_SECRET: RUN_SIGNING,
    });
    expect(env.CORE_SERVE_UNDER_PATHS).toBeUndefined();
    expect(TURNSTILE_TEST_KEYS).toEqual({
      site: "1x00000000000000000000AA",
      secret: "1x0000000000000000000000000000000AA",
    });
  });
});

describe("the Level 2 proof is excluded from CI and from every suite", () => {
  it("is started only by its package script", () => {
    const scripts = (
      JSON.parse(readFileSync("package.json", "utf8")) as {
        scripts: Record<string, string>;
      }
    ).scripts;
    expect(
      Object.entries(scripts).filter(([, command]) =>
        command.includes("giving-stripe-test"),
      ),
    ).toEqual([
      [
        "proof:giving:stripe-test",
        "node scripts/e2e/run-giving-stripe-test-proof.mts",
      ],
    ]);
  });

  it("is named by no workflow", () => {
    for (const file of readdirSync(".github/workflows")) {
      const text = readFileSync(path.join(".github/workflows", file), "utf8");
      expect(text, file).not.toMatch(
        /proof:giving:stripe-test|run-giving-stripe-test-proof|GIVING_STRIPE_TEST_PROOF/,
      );
    }
  });

  it("runs its browser cases only when the opt-in flag is set", () => {
    const spec = readFileSync("tests/e2e/guest-giving.spec.ts", "utf8");
    const level2 = spec.slice(spec.indexOf('test.describe("Level 2'));
    expect(level2).toContain(
      'test.skip(process.env.GIVING_STRIPE_TEST_PROOF !== "1"',
    );
    expect(level2).toContain("@level2");
  });
});
