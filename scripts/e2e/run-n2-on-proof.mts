import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createWriteStream, mkdirSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { requireDisposableDatabase } from "../lib/environment-marker.mjs";
import { isLoopbackDatabaseUrl, runPsqlQuery } from "../lib/psql.mjs";

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export const PROOF_CONFIG = "playwright.n2-on.config.ts";

export const ORGANIZATION_A_SLUG = "give-hope-demo";
export const ORGANIZATION_B_SLUG = "harbor-light-mission";
export const PERSON_P_EMAIL = "demo-owner@givehope.test";
export const PERSON_Q_EMAIL = "member-care@givehope.test";
export const NAME_A = "give-hope-demo.localhost";

export interface ProofPorts {
  front: number;
  admin: number;
  missionary: number;
}

export function proofPorts(env: NodeJS.ProcessEnv = process.env): ProofPorts {
  const front = Number(env.N2_ON_FRONT_PORT ?? 25410);
  return {
    front,
    admin: Number(env.N2_ON_ADMIN_PORT ?? front + 1),
    missionary: Number(env.N2_ON_MISSIONARY_PORT ?? front + 2),
  };
}

export interface StackValues {
  apiUrl: string;
  anonKey: string;
  serviceKey: string;
  dbUrl: string;
}

export function stackValuesFromStatus(output: string): StackValues {
  const reported: Record<string, string> = {};
  for (const line of output.split(/\r?\n/)) {
    const match = /^([A-Z_]+)="?(.*?)"?$/.exec(line.trim());
    if (match) reported[match[1]!] = match[2]!;
  }
  const missing = ["API_URL", "ANON_KEY", "SERVICE_ROLE_KEY", "DB_URL"].filter(
    (name) => !reported[name],
  );
  if (missing.length > 0) {
    throw new Error(
      `the local Supabase stack did not report ${missing.join(", ")}; start it with \`bun run supabase -- start --workdir <scratch copy>\` and set N2_ON_SUPABASE_WORKDIR`,
    );
  }
  const values = {
    apiUrl: reported.API_URL!,
    anonKey: reported.ANON_KEY!,
    serviceKey: reported.SERVICE_ROLE_KEY!,
    dbUrl: reported.DB_URL!,
  };
  if (!isLoopbackDatabaseUrl(values.dbUrl)) {
    throw new Error("the stack's database is not on this machine");
  }
  if (!["127.0.0.1", "localhost"].includes(new URL(values.apiUrl).hostname)) {
    throw new Error("the stack's API is not on this machine");
  }
  return values;
}

export interface RunSecrets {
  adminStampKey: string;
  missionaryStampKey: string;
  payloadSecret: string;
  password: string;
}

export function freshSecrets(): RunSecrets {
  return {
    adminStampKey: randomBytes(32).toString("hex"),
    missionaryStampKey: randomBytes(32).toString("hex"),
    payloadSecret: randomBytes(32).toString("hex"),
    password: `N2on-${randomBytes(18).toString("base64url")}`,
  };
}

export function appEnvironment(
  stack: StackValues,
  ports: ProofPorts,
  secrets: RunSecrets,
  base: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const front = `http://${NAME_A}:${ports.front}`;
  return {
    ...base,
    CORE_SERVE_UNDER_PATHS: "1",
    NEXT_TELEMETRY_DISABLED: "1",
    NEXT_PUBLIC_SUPABASE_URL: stack.apiUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: stack.anonKey,
    SUPABASE_SERVICE_ROLE_KEY: stack.serviceKey,
    SUPABASE_DB_URL: stack.dbUrl,
    PAYLOAD_DATABASE_URI: stack.dbUrl,
    PAYLOAD_DISABLE_SCHEMA_PUSH: "1",
    PAYLOAD_SECRET: secrets.payloadSecret,
    CMS_BASE_URL: `http://localhost:${ports.admin}/admin`,
    CMS_WEB_STUDIO_NATIVE_PAGES: "true",
    CMS_LOCAL_DEFAULT_TENANT_SLUG: "give-hope-demo",
    NEXT_PUBLIC_DONOR_URL: front,
    DONOR_APP_URL: front,
    ALLOW_DEMO_ACCOUNTS: "false",
    DEMO_ONLY_LOGIN: "false",
    E2E_AUTH_BYPASS: "false",
    FRONT_ADMIN_ORIGIN: `http://localhost:${ports.admin}`,
    FRONT_MISSIONARY_ORIGIN: `http://localhost:${ports.missionary}`,
  };
}

export function serverEnvironment(
  app: "donor" | "admin" | "missionary",
  env: NodeJS.ProcessEnv,
  secrets: RunSecrets,
): NodeJS.ProcessEnv {
  if (app === "donor") {
    return {
      ...env,
      FRONT_STAMP_KEY_ADMIN: secrets.adminStampKey,
      FRONT_STAMP_KEY_MISSIONARY: secrets.missionaryStampKey,
    };
  }
  if (app === "admin") {
    return {
      ...env,
      FRONT_STAMP_KEY: secrets.adminStampKey,
      OPERATIONS_NAMES: new URL(env.FRONT_ADMIN_ORIGIN ?? "").host,
    };
  }
  return { ...env, FRONT_STAMP_KEY: secrets.missionaryStampKey };
}

export function proofEnvironment(
  stack: StackValues,
  ports: ProofPorts,
  secrets: RunSecrets,
  base: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  return {
    ...base,
    N2_ON_BASE_URL: `http://${NAME_A}:${ports.front}`,
    N2_ON_OPERATIONS_URL: `http://localhost:${ports.admin}`,
    N2_ON_DB_URL: stack.dbUrl,
    N2_ON_PASSWORD: secrets.password,
    N2_ON_REQUIRED: "1",
  };
}

function sql(dbUrl: string, statement: string): string {
  return runPsqlQuery({
    databaseUrl: dbUrl,
    sql: statement,
    cwd: REPO_ROOT,
  }).trim();
}

export interface ProofSeed {
  tenantA: string;
  tenantB: string;
  personP: string;
  personQ: string;
}

const SEED_LOOKUPS: ReadonlyArray<
  [key: keyof ProofSeed, what: string, sql: string]
> = [
  [
    "tenantA",
    ORGANIZATION_A_SLUG,
    `SELECT id FROM public.tenants WHERE slug = '${ORGANIZATION_A_SLUG}'`,
  ],
  [
    "tenantB",
    ORGANIZATION_B_SLUG,
    `SELECT id FROM public.tenants WHERE slug = '${ORGANIZATION_B_SLUG}'`,
  ],
  [
    "personP",
    PERSON_P_EMAIL,
    `SELECT id FROM auth.users WHERE email = '${PERSON_P_EMAIL}'`,
  ],
  [
    "personQ",
    PERSON_Q_EMAIL,
    `SELECT id FROM auth.users WHERE email = '${PERSON_Q_EMAIL}'`,
  ],
];

export function readProofSeed(query: (statement: string) => string): ProofSeed {
  const statement = `SELECT ${SEED_LOOKUPS.map(([, , lookup]) => `coalesce((${lookup})::text, '')`).join(" || '|' || ")}`;
  const values = query(statement).trim().split("|");
  const seed = {} as ProofSeed;
  SEED_LOOKUPS.forEach(([key, what], index) => {
    const value = values[index]?.trim();
    if (!value) {
      throw new Error(
        `the scratch database has no ${what}; reset the stack from the seed`,
      );
    }
    seed[key] = value;
  });
  return seed;
}

export function scratchRowsSql(seed: ProofSeed): string {
  const rows: ReadonlyArray<
    [tenant: string, role: string, staffRole: string | null]
  > = [
    [seed.tenantA, "staff", "finance"],
    [seed.tenantB, "staff", "development"],
    [seed.tenantB, "missionary", null],
  ];
  const values = rows
    .map(
      ([tenant, role, staffRole]) =>
        `('${seed.personP}', '${tenant}', '${role}', ${staffRole ? `'${staffRole}'` : "NULL"}, true, now(), now())`,
    )
    .join(", ");
  return `INSERT INTO authz.memberships (user_id, tenant_id, role, staff_role, is_active, created_at, updated_at) VALUES ${values} ON CONFLICT DO NOTHING RETURNING id`;
}

export interface ProofDatabase {
  query(statement: string): string;
  setPassword(userId: string, password: string): Promise<void>;
}

export interface Restore {
  scratchRowIds: string[];
  passwordHashes: Array<[id: string, hash: string]>;
}

export function emptyRestore(): Restore {
  return { scratchRowIds: [], passwordHashes: [] };
}

export async function prepareRows(
  database: ProofDatabase,
  seed: ProofSeed,
  password: string,
  restore: Restore,
): Promise<void> {
  restore.passwordHashes = database
    .query(
      `SELECT id || '|' || encrypted_password FROM auth.users WHERE id IN ('${seed.personP}', '${seed.personQ}') ORDER BY id`,
    )
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split("|") as [string, string]);
  for (const id of database.query(scratchRowsSql(seed)).split("\n")) {
    if (id) restore.scratchRowIds.push(id);
  }
  for (const userId of [seed.personP, seed.personQ]) {
    await database.setPassword(userId, password);
  }
}

export function restoreRows(database: ProofDatabase, restore: Restore): void {
  if (restore.scratchRowIds.length > 0) {
    database.query(
      `DELETE FROM authz.memberships WHERE id IN (${restore.scratchRowIds.map((id) => `'${id}'`).join(", ")})`,
    );
  }
  for (const [id, hash] of restore.passwordHashes) {
    database.query(
      `UPDATE auth.users SET encrypted_password = '${hash.replace(/'/g, "''")}' WHERE id = '${id}'`,
    );
  }
}

export function finish(restore: () => void, stop: () => void): void {
  try {
    restore();
  } finally {
    stop();
  }
}

async function setPassword(
  stack: StackValues,
  userId: string,
  password: string,
): Promise<void> {
  const response = await fetch(
    `${stack.apiUrl}/auth/v1/admin/users/${userId}`,
    {
      method: "PUT",
      headers: {
        apikey: stack.serviceKey,
        authorization: `Bearer ${stack.serviceKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ password }),
    },
  );
  if (!response.ok) {
    throw new Error(`could not set the proof's password (${response.status})`);
  }
}

function stackDatabase(stack: StackValues): ProofDatabase {
  return {
    query: (statement) => sql(stack.dbUrl, statement),
    setPassword: (userId, password) => setPassword(stack, userId, password),
  };
}

function loadAverage(): number {
  return Number(readFileSync("/proc/loadavg", "utf8").split(" ")[0]);
}

export async function waitForQuietMachine(
  limit: number,
  stopped: Promise<unknown> = new Promise(() => {}),
  load: () => number = loadAverage,
  loadReadable: () => boolean = () => os.platform() === "linux",
): Promise<void> {
  const ended = stopped.then(() => true);
  while (loadReadable() && load() >= limit) {
    process.stdout.write(
      `[n2-on] one-minute load is at or above ${limit}; waiting\n`,
    );
    let timer: NodeJS.Timeout | undefined;
    const paused = new Promise<boolean>((resolve) => {
      timer = setTimeout(resolve, 20_000, false);
    });
    const stop = await Promise.race([paused, ended]);
    clearTimeout(timer);
    if (stop) return;
  }
}

function run(
  command: string,
  args: string[],
  options: { cwd: string; env: NodeJS.ProcessEnv; log: string },
) {
  const log = createWriteStream(options.log, { flags: "a" });
  return new Promise<number>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.pipe(log, { end: false });
    child.stderr.pipe(log, { end: false });
    child.on("error", reject);
    child.on("close", (code) => {
      log.end();
      resolve(code ?? 1);
    });
  });
}

async function build(env: NodeJS.ProcessEnv, logDir: string): Promise<void> {
  for (const app of ["donor", "missionary", "admin"] as const) {
    await waitForQuietMachine(10);
    process.stdout.write(`[n2-on] building ${app} with the switch on\n`);
    const code = await run("bun", ["run", "build"], {
      cwd: path.join(REPO_ROOT, "apps", app),
      env,
      log: path.join(logDir, `build-${app}.log`),
    });
    if (code !== 0) throw new Error(`the ${app} build failed; see ${logDir}`);
  }
}

function startServer(
  app: "donor" | "admin" | "missionary",
  port: number,
  env: NodeJS.ProcessEnv,
  logDir: string,
): ChildProcess {
  const log = createWriteStream(path.join(logDir, `server-${app}.log`), {
    flags: "a",
  });
  const child = spawn(
    path.join(REPO_ROOT, "apps", app, "node_modules", ".bin", "next"),
    ["start", "-p", String(port), "-H", "localhost"],
    {
      cwd: path.join(REPO_ROOT, "apps", app),
      env: { ...env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout?.pipe(log);
  child.stderr?.pipe(log);
  return child;
}

export async function assertPortsFree(
  ports: readonly number[],
  host = "localhost",
): Promise<void> {
  for (const port of ports) {
    await new Promise<void>((resolve, reject) => {
      const probe = createServer();
      probe.once("error", (error: NodeJS.ErrnoException) => {
        reject(
          error.code === "EADDRINUSE"
            ? new Error(
                `port ${port} is in use; stop the server there before the proof starts its own`,
              )
            : error,
        );
      });
      probe.listen(port, host, () => probe.close(() => resolve()));
    });
  }
}

interface WatchedProcess {
  once(
    event: "exit",
    listener: (code: number | null, signal: string | null) => void,
  ): unknown;
  once(event: "error", listener: (error: Error) => void): unknown;
}

export function watchServers(
  servers: ReadonlyArray<{ name: string; process: WatchedProcess }>,
): { failure(): string | null; failed(): Promise<string> } {
  let failure: string | null = null;
  let announce: (message: string) => void = () => {};
  const failed = new Promise<string>((resolve) => {
    announce = resolve;
  });
  const fail = (message: string) => {
    if (failure !== null) return;
    failure = message;
    announce(message);
  };
  for (const { name, process: child } of servers) {
    child.once("exit", (code, signal) => {
      fail(`${name} exited (code ${code ?? signal ?? "unknown"})`);
    });
    child.once("error", (error) => {
      fail(`${name} could not start: ${error.message}`);
    });
  }
  return { failure: () => failure, failed: () => failed };
}

export async function serveUntilStopped(
  interrupts: { wait(): Promise<NodeJS.Signals> },
  watch: { failed(): Promise<string> },
): Promise<number> {
  const failure = await Promise.race([
    interrupts.wait().then(() => null),
    watch.failed(),
  ]);
  if (failure !== null) throw new Error(failure);
  return 0;
}

const HELD_SIGNALS = ["SIGINT", "SIGTERM"] as const;

export function holdInterrupts(): {
  signal(): NodeJS.Signals | null;
  wait(): Promise<NodeJS.Signals>;
  release(): void;
} {
  let received: NodeJS.Signals | null = null;
  const waiting: Array<(signal: NodeJS.Signals) => void> = [];
  const handlers = HELD_SIGNALS.map((name) => {
    const handler = () => {
      received ??= name;
      for (const resolve of waiting.splice(0)) resolve(name);
    };
    process.on(name, handler);
    return [name, handler] as const;
  });
  return {
    signal: () => received,
    wait: () =>
      received
        ? Promise.resolve(received)
        : new Promise((resolve) => waiting.push(resolve)),
    release: () => {
      for (const [name, handler] of handlers) process.off(name, handler);
    },
  };
}

export async function waitForServers(
  ports: readonly number[],
  watch: { failure(): string | null },
  interrupts: { signal(): NodeJS.Signals | null },
): Promise<number | null> {
  const stopped = () =>
    watch.failure() ?? (interrupts.signal() ? "interrupted" : null);
  for (const port of ports) {
    if (interrupts.signal()) return 130;
    try {
      await waitForServer(port, stopped);
    } catch (error) {
      if (interrupts.signal()) return 130;
      throw error;
    }
  }
  return interrupts.signal() ? 130 : null;
}

type SpecProcess = {
  once(event: "exit", listener: (code: number | null) => void): unknown;
  once(event: "error", listener: (error: Error) => void): unknown;
  kill(signal: NodeJS.Signals): boolean;
};

export async function runProofSpecs(
  args: readonly string[],
  env: NodeJS.ProcessEnv,
  interrupts: {
    wait(): Promise<NodeJS.Signals>;
    signal(): NodeJS.Signals | null;
  },
  watch: { failed(): Promise<string> },
  start: (
    command: string,
    args: readonly string[],
    options: { cwd: string; env: NodeJS.ProcessEnv; stdio: "inherit" },
  ) => SpecProcess = (command, args, options) =>
    spawn(command, [...args], { ...options, shell: false }),
): Promise<number> {
  const child = start(
    process.execPath,
    [
      path.join(REPO_ROOT, "node_modules", "@playwright", "test", "cli.js"),
      ...args,
    ],
    { cwd: REPO_ROOT, env, stdio: "inherit" },
  );
  const exited = new Promise<number>((resolve) => {
    child.once("exit", (code) => resolve(code ?? 1));
    child.once("error", () => resolve(1));
  });
  const outcome = await Promise.race([
    exited.then((code) => ({ kind: "exited" as const, code })),
    interrupts.wait().then(() => ({ kind: "interrupted" as const })),
    watch.failed().then((failure) => ({ kind: "failed" as const, failure })),
  ]);
  if (outcome.kind === "exited") {
    return interrupts.signal() ? 130 : outcome.code;
  }
  child.kill("SIGTERM");
  await exited;
  if (outcome.kind === "interrupted") return 130;
  throw new Error(outcome.failure);
}

export async function waitForServer(
  port: number,
  failure: () => string | null,
  timeoutMs = 180_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const failed = failure();
    if (failed) throw new Error(failed);
    try {
      await fetch(`http://localhost:${port}/`, { redirect: "manual" });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
  throw new Error(`no server answered on localhost:${port}`);
}

export interface Options {
  build: boolean;
  serveOnly: boolean;
  playwrightArgs: string[];
}

export function parseOptions(argv: readonly string[]): Options {
  const separator = argv.indexOf("--");
  const own = separator === -1 ? argv : argv.slice(0, separator);
  const unknown = own.filter(
    (arg) => !["--skip-build", "--serve-only"].includes(arg),
  );
  if (unknown.length > 0) throw new Error(`unknown option ${unknown[0]}`);
  return {
    build: !own.includes("--skip-build"),
    serveOnly: own.includes("--serve-only"),
    playwrightArgs: separator === -1 ? [] : argv.slice(separator + 1),
  };
}

export async function main(
  argv: readonly string[] = process.argv.slice(2),
): Promise<number> {
  const options = parseOptions(argv);
  const workdir = process.env.N2_ON_SUPABASE_WORKDIR?.trim();
  if (!workdir) {
    throw new Error(
      "set N2_ON_SUPABASE_WORKDIR to the scratch copy of supabase/ the local stack runs from",
    );
  }
  const status = spawnSync(
    "bun",
    ["run", "supabase", "--", "status", "-o", "env", "--workdir", workdir],
    {
      cwd: REPO_ROOT,
      encoding: "utf8",
      shell: false,
    },
  );
  const stack = stackValuesFromStatus(status.stdout ?? "");
  requireDisposableDatabase({
    databaseUrl: stack.dbUrl,
    action: "write the proof's scratch rows",
    psqlBin: "psql",
  });
  const database = stackDatabase(stack);
  const seed = readProofSeed(database.query);
  const ports = proofPorts();
  const secrets = freshSecrets();
  const env = appEnvironment(stack, ports, secrets);
  const logDir = path.join(REPO_ROOT, ".e2e-logs", "n2-on");
  mkdirSync(logDir, { recursive: true });

  if (options.build) await build(env, logDir);
  const migrated = await run("bun", ["run", "cms:migrate"], {
    cwd: REPO_ROOT,
    env,
    log: path.join(logDir, "cms-migrate.log"),
  });
  if (migrated !== 0)
    throw new Error(`the CMS migration failed; see ${logDir}`);
  const seeded = await run("bun", ["run", "cms:local:seed"], {
    cwd: REPO_ROOT,
    env,
    log: path.join(logDir, "cms-seed.log"),
  });
  if (seeded !== 0) throw new Error(`the CMS seed failed; see ${logDir}`);

  const servers: ChildProcess[] = [];
  const restore = emptyRestore();
  await assertPortsFree([ports.front, ports.admin, ports.missionary]);
  const interrupts = holdInterrupts();
  try {
    const started: Array<{ name: string; process: ChildProcess }> = [];
    for (const [app, port] of [
      ["donor", ports.front],
      ["admin", ports.admin],
      ["missionary", ports.missionary],
    ] as const) {
      const server = startServer(
        app,
        port,
        serverEnvironment(app, env, secrets),
        logDir,
      );
      servers.push(server);
      started.push({ name: app, process: server });
    }
    const watch = watchServers(started);
    const interrupted = await waitForServers(
      [ports.front, ports.admin, ports.missionary],
      watch,
      interrupts,
    );
    if (interrupted !== null) return interrupted;
    await prepareRows(database, seed, secrets.password, restore);
    if (options.serveOnly) {
      process.stdout.write(
        `[n2-on] serving at http://${NAME_A}:${ports.front}; stop with Ctrl-C\n`,
      );
      return await serveUntilStopped(interrupts, watch);
    }
    await waitForQuietMachine(
      10,
      Promise.race([interrupts.wait(), watch.failed()]),
    );
    const failed = watch.failure();
    if (failed) throw new Error(failed);
    if (interrupts.signal()) return 130;
    return await runProofSpecs(
      ["test", "-c", PROOF_CONFIG, ...options.playwrightArgs],
      proofEnvironment(stack, ports, secrets),
      interrupts,
      watch,
    );
  } finally {
    try {
      finish(
        () => restoreRows(database, restore),
        () => {
          for (const server of servers) server.kill("SIGTERM");
        },
      );
    } finally {
      interrupts.release();
    }
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
        `[n2-on] ${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exit(1);
    },
  );
}
