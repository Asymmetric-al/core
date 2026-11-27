import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { STRIPE_API_VERSION } from "../../packages/api/src/stripe/api-version.ts";
import {
  StripeLiveModeRefusedError,
  assertStripeTestModeKey,
} from "../../packages/api/src/stripe/test-mode-key.ts";
import { requireDisposableDatabase } from "../lib/environment-marker.mjs";
import {
  GUEST_GIVING_PORTS,
  TURNSTILE_TEST_KEYS,
} from "./guest-giving-env.mjs";
import {
  REPO_ROOT,
  holdInterrupts,
  stackValuesFromStatus,
  waitForQuietMachine,
  type StackValues,
} from "./run-n2-on-proof.mts";

export { TURNSTILE_TEST_KEYS };

export const PROOF_FLAG = "GIVING_STRIPE_TEST_PROOF";
export const PROOF_CONFIG = "playwright.guest-giving.config.ts";

export const ACCOUNT_VARIABLES = {
  A1: "GIVING_PROOF_ACCOUNT_A1",
  A2: "GIVING_PROOF_ACCOUNT_A2",
  B1: "GIVING_PROOF_ACCOUNT_B1",
} as const;

type AccountName = keyof typeof ACCOUNT_VARIABLES;

export const UNFINISHED_CASES = [
  "C15: the claim of a guest's history waits on WP5's final claim",
  "C21: a payment whose event is dropped stays unrecorded until WP8c's scheduled payment check",
];

const PAYMENT_EVENTS = [
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
  "payment_intent.processing",
  "charge.refunded",
];

export type ProofSettings = {
  secretKey: string;
  publishableKey: string;
  accounts: Record<AccountName, string>;
};

export function readProofSettings(env: NodeJS.ProcessEnv): ProofSettings {
  if (env[PROOF_FLAG] !== "1") {
    throw new Error(
      `${PROOF_FLAG}=1 is required: this proof calls Stripe's TEST API and runs only when asked`,
    );
  }
  const secretKey = assertStripeTestModeKey(env.STRIPE_SECRET_KEY ?? "");
  const publishableKey = (env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "").trim();
  if (/^pk_live_/.test(publishableKey)) throw new StripeLiveModeRefusedError();
  if (!/^pk_test_/.test(publishableKey)) {
    throw new Error(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be a Stripe test publishable key (pk_test_)",
    );
  }
  const accounts = {} as Record<AccountName, string>;
  for (const [name, variable] of Object.entries(ACCOUNT_VARIABLES) as Array<
    [AccountName, string]
  >) {
    const value = (env[variable] ?? "").trim();
    if (!/^acct_[A-Za-z0-9]+$/.test(value)) {
      throw new Error(
        `${variable} must name the TEST connected account ${name} (acct_...)`,
      );
    }
    accounts[name] = value;
  }
  return { secretKey, publishableKey, accounts };
}

const SECRET_PATTERNS = [
  /\b(?:sk|rk)_(?:test|live)_[A-Za-z0-9]+/g,
  /\bwhsec_[A-Za-z0-9]+/g,
  /[A-Za-z0-9_]*_secret_[A-Za-z0-9]+/g,
];

export function redactor(secrets: readonly string[]): (text: string) => string {
  const values = [...secrets, TURNSTILE_TEST_KEYS.secret].filter(Boolean);
  return (text) => {
    let out = text;
    for (const value of values) out = out.split(value).join("[redacted]");
    for (const pattern of SECRET_PATTERNS)
      out = out.replace(pattern, "[redacted]");
    return out;
  };
}

export function evidencePath(root: string, at: Date): string {
  const stamp = at
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replaceAll("-", "")
    .replaceAll(":", "");
  return path.join(root, ".e2e-logs", "giving-stripe-test", stamp);
}

type Fetch = (url: string, init: RequestInit) => Promise<Response>;
export type StripeGet = (path: string, account?: string) => Promise<unknown>;

export function stripeGetter(fetchImpl: Fetch, secretKey: string): StripeGet {
  return async (pathname, account) => {
    const headers = new Headers({
      authorization: `Bearer ${secretKey}`,
      "stripe-version": STRIPE_API_VERSION,
    });
    if (account) headers.set("stripe-account", account);
    const response = await fetchImpl(`https://api.stripe.com${pathname}`, {
      method: "GET",
      headers,
    });
    if (!response.ok) {
      throw new Error(`Stripe answered ${response.status} for ${pathname}`);
    }
    return response.json();
  };
}

export async function verifyTestAccounts(
  get: StripeGet,
  accounts: Record<AccountName, string>,
): Promise<void> {
  for (const [name, id] of Object.entries(accounts)) {
    const account = (await get(`/v2/core/accounts/${id}`)) as {
      livemode?: unknown;
    };
    if (account.livemode !== false) {
      throw new Error(
        `${name} (${id}) is not a TEST account: livemode is ${String(account.livemode)}`,
      );
    }
  }
}

export type IntentReadback = {
  id: string;
  livemode: boolean;
  payment_method_types: string[];
  amount?: number;
  currency?: string;
  status?: string;
  customer?: string | null;
  metadata?: Record<string, string>;
};

export async function paymentIntentsSince(
  get: StripeGet,
  account: string,
  since: number,
): Promise<IntentReadback[]> {
  const query = new URLSearchParams({
    "created[gte]": String(since),
    limit: "100",
  });
  const page = (await get(`/v1/payment_intents?${query}`, account)) as {
    data?: Array<Record<string, unknown>>;
  };
  return (page.data ?? []).map((intent) => {
    if (intent.livemode !== false) {
      throw new Error(
        `${String(intent.id)} on ${account}: livemode is not false`,
      );
    }
    return {
      id: String(intent.id),
      livemode: false,
      payment_method_types: intent.payment_method_types as string[],
      amount: intent.amount as number | undefined,
      currency: intent.currency as string | undefined,
      status: intent.status as string | undefined,
      customer: intent.customer as string | null | undefined,
      metadata: intent.metadata as Record<string, string> | undefined,
    };
  });
}

export function serverEnvironment(
  settings: ProofSettings,
  webhookSecret: string,
  base: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...base,
    [PROOF_FLAG]: "1",
    GUEST_GIVING_ENABLED: "true",
    TURNSTILE_SECRET_KEY: TURNSTILE_TEST_KEYS.secret,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: TURNSTILE_TEST_KEYS.site,
    STRIPE_SECRET_KEY: settings.secretKey,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: settings.publishableKey,
    STRIPE_PAYMENT_EVENTS_WEBHOOK_SECRET: webhookSecret,
    GIVING_PROOF_ACCOUNT_A1: settings.accounts.A1,
    GIVING_PROOF_ACCOUNT_A2: settings.accounts.A2,
    GIVING_PROOF_ACCOUNT_B1: settings.accounts.B1,
  };
  delete env.CORE_SERVE_UNDER_PATHS;
  return env;
}

function stackEnvironment(stack: StackValues): NodeJS.ProcessEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: stack.apiUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: stack.anonKey,
    SUPABASE_SERVICE_ROLE_KEY: stack.serviceKey,
    GUEST_GIVING_E2E_DB_URL: stack.dbUrl,
  };
}

function readStack(env: NodeJS.ProcessEnv): StackValues {
  const workdir = env.GIVING_PROOF_SUPABASE_WORKDIR?.trim();
  const status = spawnSync(
    process.execPath,
    [
      "scripts/supabase-cli.mjs",
      "status",
      "-o",
      "env",
      ...(workdir ? ["--workdir", workdir] : []),
    ],
    { cwd: REPO_ROOT, encoding: "utf8", shell: false },
  );
  return stackValuesFromStatus(status.stdout ?? "");
}

function signingSecret(secretKey: string): string {
  const printed = spawnSync("stripe", ["listen", "--print-secret"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    env: { ...process.env, STRIPE_API_KEY: secretKey },
    shell: false,
  });
  const secret = (printed.stdout ?? "").trim();
  if (printed.status !== 0 || !/^whsec_[A-Za-z0-9]+$/.test(secret)) {
    throw new Error(
      "the Stripe CLI did not print a signing secret; run `stripe login` in test mode first",
    );
  }
  return secret;
}

function piped(
  child: ChildProcess,
  redact: (text: string) => string,
  sink: string[],
  echo: boolean,
) {
  for (const stream of [child.stdout, child.stderr]) {
    stream?.setEncoding("utf8");
    stream?.on("data", (chunk: string) => {
      const clean = redact(chunk);
      sink.push(clean);
      if (echo) process.stdout.write(clean);
    });
  }
}

function forwardEvents(
  secretKey: string,
  redact: (text: string) => string,
  sink: string[],
): ChildProcess {
  const child = spawn(
    "stripe",
    [
      "listen",
      "--forward-connect-to",
      `http://localhost:${GUEST_GIVING_PORTS.admin}/api/webhooks/stripe-payment-events`,
      "--events",
      PAYMENT_EVENTS.join(","),
    ],
    {
      cwd: REPO_ROOT,
      env: { ...process.env, STRIPE_API_KEY: secretKey },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  piped(child, redact, sink, false);
  return child;
}

function runProof(
  argv: readonly string[],
  env: NodeJS.ProcessEnv,
  redact: (text: string) => string,
  sink: string[],
  evidence: string,
): Promise<number> {
  const child = spawn(
    process.execPath,
    [
      path.join(REPO_ROOT, "node_modules", "@playwright", "test", "cli.js"),
      "test",
      "-c",
      PROOF_CONFIG,
      "--grep",
      "@level2",
      "--reporter=list,json",
      ...argv,
    ],
    {
      cwd: REPO_ROOT,
      env: {
        ...env,
        GIVING_PROOF_EVIDENCE_DIR: evidence,
        PLAYWRIGHT_JSON_OUTPUT_NAME: path.join(evidence, "playwright.json"),
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  piped(child, redact, sink, true);
  return new Promise((resolve) => {
    child.on("close", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
}

export type ProofDeps = { fetch: Fetch };

export async function main(
  argv: readonly string[] = process.argv.slice(2),
  env: NodeJS.ProcessEnv = process.env,
  deps: Partial<ProofDeps> = {},
): Promise<number> {
  const settings = readProofSettings(env);
  const get = stripeGetter(deps.fetch ?? fetch, settings.secretKey);
  const startedAt = new Date();
  const since = Math.floor(startedAt.getTime() / 1000) - 60;
  const evidence = evidencePath(REPO_ROOT, startedAt);
  mkdirSync(path.join(evidence, "screenshots"), { recursive: true });

  await verifyTestAccounts(get, settings.accounts);
  const stack = readStack(env);
  requireDisposableDatabase({
    databaseUrl: stack.dbUrl,
    action: "write the giving proof's fixture",
    psqlBin: "psql",
  });

  const webhookSecret = signingSecret(settings.secretKey);
  const redact = redactor([settings.secretKey, webhookSecret]);
  const listenerLog: string[] = [];
  const proofLog: string[] = [];
  const interrupts = holdInterrupts();
  const listener = forwardEvents(settings.secretKey, redact, listenerLog);
  let code = 1;
  try {
    await waitForQuietMachine(10, interrupts.wait());
    if (interrupts.signal()) return 130;
    code = await runProof(
      argv,
      {
        ...serverEnvironment(settings, webhookSecret, env),
        ...stackEnvironment(stack),
      },
      redact,
      proofLog,
      evidence,
    );
    const readback: Record<string, IntentReadback[]> = {};
    for (const [name, account] of Object.entries(settings.accounts))
      readback[name] = await paymentIntentsSince(get, account, since);
    writeFileSync(
      path.join(evidence, "stripe-readback.json"),
      redact(JSON.stringify(readback, null, 2)),
    );
    return interrupts.signal() ? 130 : code;
  } finally {
    listener.kill("SIGTERM");
    interrupts.release();
    writeFileSync(
      path.join(evidence, "stripe-listen.log"),
      listenerLog.join(""),
    );
    writeFileSync(path.join(evidence, "playwright.log"), proofLog.join(""));
    writeFileSync(
      path.join(evidence, "manifest.json"),
      redact(
        JSON.stringify(
          {
            startedAt: startedAt.toISOString(),
            finishedAt: new Date().toISOString(),
            playwrightExit: code,
            accounts: settings.accounts,
            donorPort: GUEST_GIVING_PORTS.donor,
            adminPort: GUEST_GIVING_PORTS.admin,
            unfinished: UNFINISHED_CASES,
          },
          null,
          2,
        ),
      ),
    );
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  main().then(
    (code) => process.exit(code),
    (error: unknown) => {
      process.stderr.write(
        `[giving-proof] ${redactor([process.env.STRIPE_SECRET_KEY ?? ""])(
          error instanceof Error ? error.message : String(error),
        )}\n`,
      );
      process.exit(1);
    },
  );
}
